import { LanternGame, GameError } from './core/game.js';

export const LANTERN_SCHEMA = [
  `CREATE TABLE IF NOT EXISTS lantern_rooms (
    pin TEXT PRIMARY KEY NOT NULL, state_json TEXT NOT NULL, room_secret TEXT NOT NULL,
    version INTEGER NOT NULL, expires_at INTEGER NOT NULL, updated_at INTEGER NOT NULL
  )`,
  'CREATE INDEX IF NOT EXISTS idx_lantern_rooms_expiry ON lantern_rooms(expires_at)',
  `CREATE TABLE IF NOT EXISTS lantern_presence (
    pin TEXT NOT NULL REFERENCES lantern_rooms(pin) ON DELETE CASCADE,
    player_id TEXT NOT NULL, last_seen INTEGER NOT NULL, PRIMARY KEY (pin, player_id)
  )`,
];
const ready = new WeakMap();
const pause = ms => new Promise(resolve => setTimeout(resolve, ms));

export async function ensureLanternSchema(db) {
  let task = ready.get(db);
  if (!task) { task = db.batch(LANTERN_SCHEMA.map(sql => db.prepare(sql))); ready.set(db, task); }
  try { await task; } catch (error) { ready.delete(db); throw error; }
}

// A room mutation is written with a version compare-and-swap. Separate Workers
// cannot overwrite each other's students, answers, discoveries or seal claims.
export class LanternD1Store {
  constructor(db, { now = Date.now, random, sleep = pause, maxAttempts = 90 } = {}) {
    this.db = db; this.now = now; this.random = random; this.sleep = sleep; this.maxAttempts = maxAttempts;
  }
  game(secret) { return new LanternGame({ now: this.now, random: this.random, secret }); }
  async create() {
    await ensureLanternSchema(this.db);
    await this.db.prepare('DELETE FROM lantern_rooms WHERE expires_at <= ?').bind(this.now()).run();
    for (let attempt = 0; attempt < 8; attempt++) {
      const game = this.game(), result = game.create(), room = game.room(result.pin);
      const inserted = await this.db.prepare(`
        INSERT INTO lantern_rooms (pin, state_json, room_secret, version, expires_at, updated_at)
        SELECT ?, ?, ?, ?, ?, ? WHERE (SELECT COUNT(*) FROM lantern_rooms WHERE expires_at > ?) < 100
        ON CONFLICT(pin) DO NOTHING
      `).bind(room.pin, JSON.stringify(room), game.secret, room.version, room.expiresAt, this.now(), this.now()).run();
      if (inserted.meta.changes === 1) return result;
      const count = await this.db.prepare('SELECT COUNT(*) AS count FROM lantern_rooms WHERE expires_at > ?').bind(this.now()).first();
      if (count.count >= 100) throw new GameError('This server has reached its active-room limit.', 'CAPACITY', 503);
    }
    throw new GameError('Could not reserve a room PIN. Retry safely.', 'PIN_BUSY', 503);
  }
  async load(pin) {
    if (!/^\d{5}$/.test(String(pin))) throw new GameError('Enter the five-digit room PIN.', 'INVALID_PIN');
    await ensureLanternSchema(this.db);
    const row = await this.db.prepare('SELECT state_json, room_secret, version, expires_at FROM lantern_rooms WHERE pin = ?').bind(String(pin)).first();
    if (!row || row.expires_at <= this.now()) throw new GameError('This room is unavailable. Ask your teacher for the current PIN.', 'ROOM_NOT_FOUND', 404);
    const room = JSON.parse(row.state_json);
    if (room.pin !== String(pin) || room.version !== row.version) throw new Error('Invalid saved lantern room.');
    const game = this.game(row.room_secret); game.rooms.set(room.pin, room);
    return { game, room, version: row.version };
  }
  async presence(game, room) {
    const present = await this.db.prepare('SELECT player_id, last_seen FROM lantern_presence WHERE pin = ?').bind(room.pin).all();
    for (const entry of present.results) game.lastSeen.set(`${room.pin}:${entry.player_id}`, entry.last_seen);
  }
  async touch(room, playerId) {
    if (!playerId) return;
    await this.db.prepare(`
      INSERT INTO lantern_presence (pin, player_id, last_seen)
      SELECT ?, ?, ? WHERE EXISTS (SELECT 1 FROM lantern_rooms WHERE pin = ? AND expires_at > ?)
      ON CONFLICT(pin, player_id) DO UPDATE SET last_seen = excluded.last_seen
      WHERE lantern_presence.last_seen <= excluded.last_seen - 10000
    `).bind(room.pin, playerId, this.now(), room.pin, this.now()).run();
  }
  async state(pin, token) { return (await this.mutate(pin, game => ({ state: game.state(pin, token) }), token, false)).state; }
  async join(pin, body) { return this.mutate(pin, game => game.join(pin, body), undefined, true); }
  async action(pin, token, body) { return this.mutate(pin, game => game.action(pin, token, body), token, false); }
  async seals(pin, token) { const { game, room } = await this.load(pin); return game.sealCards(room.pin, token); }
  async mutate(pin, apply, token, joining) {
    for (let attempt = 0; attempt < this.maxAttempts; attempt++) {
      const { game, room, version } = await this.load(pin);
      const result = apply(game);
      if (room.version !== version) {
        const written = await this.db.prepare(`
          UPDATE lantern_rooms SET state_json = ?, version = ?, updated_at = ?
          WHERE pin = ? AND version = ? AND expires_at > ?
        `).bind(JSON.stringify(room), room.version, this.now(), room.pin, version, this.now()).run();
        if (written.meta.changes !== 1) { await this.sleep(4 + Math.floor(Math.random() * Math.min(140, (attempt + 1) * 8))); continue; }
      }
      const actor = joining ? { player: { id: result.playerId } } : game.auth(room, token);
      await this.touch(room, actor.player?.id);
      if (!joining) { await this.presence(game, room); result.state = game.view(room, actor); }
      return result;
    }
    throw new GameError('The room is busy. Your progress is safe; retry this action.', 'CONCURRENT_UPDATE', 503);
  }
}
