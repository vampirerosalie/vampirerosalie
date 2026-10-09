import { GameError, GameStore } from './core/game.js';

// These tables are deliberately separate from Battles 1–6. Keep the matching
// migration in drizzle/0004_crazy_kitchen.sql in sync with these definitions.
export const KITCHEN_SCHEMA = [
  `CREATE TABLE IF NOT EXISTS kitchen_rooms (
    pin TEXT PRIMARY KEY NOT NULL,
    state_json TEXT NOT NULL,
    room_secret TEXT NOT NULL,
    version INTEGER NOT NULL,
    expires_at INTEGER NOT NULL,
    updated_at INTEGER NOT NULL
  )`,
  'CREATE INDEX IF NOT EXISTS idx_kitchen_rooms_expiry ON kitchen_rooms(expires_at)',
  `CREATE TABLE IF NOT EXISTS kitchen_presence (
    pin TEXT NOT NULL REFERENCES kitchen_rooms(pin) ON DELETE CASCADE,
    team_id TEXT NOT NULL,
    last_seen INTEGER NOT NULL,
    PRIMARY KEY (pin, team_id)
  )`,
];

const schemaReady = new WeakMap();
const pause = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
const unavailable = () => new GameError(
  'This kitchen is unavailable or has expired. Ask your teacher for the new PIN.',
  'ROOM_NOT_FOUND', 404,
);

/** Ensure first-run/local databases work, without issuing DDL on every poll. */
export async function ensureKitchenSchema(db) {
  let ready = schemaReady.get(db);
  if (!ready) {
    ready = db.batch(KITCHEN_SCHEMA.map((sql) => db.prepare(sql)));
    schemaReady.set(db, ready);
  }
  try {
    await ready;
  } catch (error) {
    schemaReady.delete(db);
    throw error;
  }
}

/**
 * One instance per request. Room state is never cached across requests or
 * isolates. All reads use the primary D1 binding (no unconstrained replicas).
 * The only write of gameplay state is an atomic version-checked UPDATE.
 */
export class KitchenD1Store {
  constructor(db, { questions, now = Date.now, random, sleep = pause, maxAttempts = 20 } = {}) {
    this.db = db;
    this.questions = questions;
    this.now = now;
    this.random = random;
    this.sleep = sleep;
    this.maxAttempts = maxAttempts;
  }

  game(secret) {
    return new GameStore({ questions: this.questions, now: this.now, random: this.random, secret });
  }

  async create(options = {}) {
    await ensureKitchenSchema(this.db);
    // Expired rooms cannot be read, even before this opportunistic cleanup.
    // Presence is removed by the foreign-key cascade when a room is removed.
    await this.db.prepare('DELETE FROM kitchen_rooms WHERE expires_at <= ?').bind(this.now()).run();
    for (let attempt = 0; attempt < 8; attempt++) {
      const game = this.game();
      const result = game.create(options);
      const room = game.room(result.pin);
      const inserted = await this.db.prepare(`
        INSERT INTO kitchen_rooms (pin, state_json, room_secret, version, expires_at, updated_at)
        SELECT ?, ?, ?, ?, ?, ?
        WHERE (SELECT COUNT(*) FROM kitchen_rooms WHERE expires_at > ?) < 100
        ON CONFLICT(pin) DO NOTHING
      `).bind(room.pin, JSON.stringify(room), game.secret, room.version, room.expiresAt, this.now(), this.now()).run();
      if (inserted.meta.changes === 1) return result;
      const active = await this.db.prepare('SELECT COUNT(*) AS count FROM kitchen_rooms WHERE expires_at > ?').bind(this.now()).first();
      if (active.count >= 100) throw new GameError('This server has reached its room limit.', 'CAPACITY', 503);
    }
    throw new GameError('Could not reserve a kitchen PIN. Please try again.', 'PIN_BUSY', 503);
  }

  async load(pin) {
    if (!/^\d{5}$/.test(String(pin))) throw new GameError('Enter the five-digit kitchen PIN.', 'INVALID_PIN');
    await ensureKitchenSchema(this.db);
    const row = await this.db.prepare(
      'SELECT state_json, room_secret, version, expires_at FROM kitchen_rooms WHERE pin = ?',
    ).bind(String(pin)).first();
    if (!row || row.expires_at <= this.now()) throw unavailable();
    const room = JSON.parse(row.state_json);
    if (room.pin !== String(pin) || room.version !== row.version) throw new Error('Invalid saved kitchen state.');
    const game = this.game(row.room_secret);
    game.rooms.set(room.pin, room);
    return { game, room, version: row.version };
  }

  async presence(game, room) {
    const online = await this.db.prepare(
      'SELECT team_id, last_seen FROM kitchen_presence WHERE pin = ?',
    ).bind(room.pin).all();
    for (const entry of online.results) {
      const key = `${room.pin}:${entry.team_id}`;
      game.lastSeen.set(key, Math.max(game.lastSeen.get(key) ?? 0, entry.last_seen));
    }
  }

  async touch(room, teamId) {
    if (!teamId) return;
    // Presence has its own rows and never increments the game version or
    // competes with a cook/review. Repeated polls write at most once per 5s.
    await this.db.prepare(`
      INSERT INTO kitchen_presence (pin, team_id, last_seen)
      SELECT ?, ?, ? WHERE EXISTS (SELECT 1 FROM kitchen_rooms WHERE pin = ? AND expires_at > ?)
      ON CONFLICT(pin, team_id) DO UPDATE SET last_seen = excluded.last_seen
      WHERE kitchen_presence.last_seen <= excluded.last_seen - 5000
    `).bind(room.pin, teamId, this.now(), room.pin, this.now()).run();
  }

  async state(pin, token) {
    const { game, room } = await this.load(pin);
    const actor = game.auth(room, token);
    await this.touch(room, actor.team?.id);
    await this.presence(game, room);
    return game.view(room, actor);
  }

  async join(pin, body) {
    return this.mutate(pin, (game) => game.join(pin, body), undefined, true);
  }

  async action(pin, token, body) {
    return this.mutate(pin, (game) => game.action(pin, token, body), token, false);
  }

  async mutate(pin, apply, token, joining) {
    for (let attempt = 0; attempt < this.maxAttempts; attempt++) {
      const { game, room, version } = await this.load(pin);
      // Validation, random rewards, inventory debit, discovery bonus, and the
      // receipt are computed together from the freshly loaded version. A CAS
      // loser is thrown away and re-evaluated against the winner's new stock.
      const result = apply(game);
      if (room.version !== version) {
        const updated = await this.db.prepare(`
          UPDATE kitchen_rooms SET state_json = ?, version = ?, updated_at = ?
          WHERE pin = ? AND version = ? AND expires_at > ?
        `).bind(JSON.stringify(room), room.version, this.now(), room.pin, version, this.now()).run();
        if (updated.meta.changes !== 1) {
          await this.sleep(4 + Math.floor(Math.random() * Math.min(80, (attempt + 1) * 8)));
          continue;
        }
      }
      // A duplicate join/action makes no gameplay write. Its deterministic
      // token/persisted receipt still returns the original successful result.
      const actor = joining ? { team: { id: result.teamId } } : game.auth(room, token);
      await this.touch(room, actor.team?.id);
      if (!joining) {
        await this.presence(game, room);
        result.state = game.view(room, actor);
      }
      return result;
    }
    throw new GameError('The kitchen is busy. Please retry your action.', 'CONCURRENT_UPDATE', 503);
  }
}
