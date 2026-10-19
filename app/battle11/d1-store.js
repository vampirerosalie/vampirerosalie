import { MuseumGame, GameError } from './core/game.js';

export const MUSEUM_SCHEMA = [
  `CREATE TABLE IF NOT EXISTS museum_rooms (
    pin TEXT PRIMARY KEY NOT NULL, state_json TEXT NOT NULL, room_secret TEXT NOT NULL,
    version INTEGER NOT NULL, expires_at INTEGER NOT NULL, updated_at INTEGER NOT NULL
  )`,
  'CREATE INDEX IF NOT EXISTS idx_museum_rooms_expiry ON museum_rooms(expires_at)',
  `CREATE TABLE IF NOT EXISTS museum_presence (
    pin TEXT NOT NULL REFERENCES museum_rooms(pin) ON DELETE CASCADE,
    player_id TEXT NOT NULL, last_seen INTEGER NOT NULL, PRIMARY KEY (pin, player_id)
  )`,
];
const ready = new WeakMap();
const pause = ms => new Promise(resolve => setTimeout(resolve, ms));
export async function ensureMuseumSchema(db) {
  let task = ready.get(db);
  if (!task) { task = db.batch(MUSEUM_SCHEMA.map(sql => db.prepare(sql))); ready.set(db, task); }
  try { await task; } catch (error) { ready.delete(db); throw error; }
}

// D1 compare-and-swap is the authority for admission, answer moves and final locks.
// Separate Worker instances retry a losing update against the latest room version.
export class MuseumD1Store {
  constructor(db, { now = Date.now, random, sleep = pause, maxAttempts = 100 } = {}) {
    this.db = db; this.now = now; this.random = random; this.sleep = sleep; this.maxAttempts = maxAttempts;
  }
  game(secret) { return new MuseumGame({ now: this.now, random: this.random, secret }); }
  async create() {
    await ensureMuseumSchema(this.db);
    await this.db.prepare('DELETE FROM museum_rooms WHERE expires_at <= ?').bind(this.now()).run();
    for (let attempt = 0; attempt < 8; attempt++) {
      const game = this.game(), result = game.create(), room = game.room(result.pin);
      const inserted = await this.db.prepare(`
        INSERT INTO museum_rooms (pin, state_json, room_secret, version, expires_at, updated_at)
        SELECT ?, ?, ?, ?, ?, ? WHERE (SELECT COUNT(*) FROM museum_rooms WHERE expires_at > ?) < 100
        ON CONFLICT(pin) DO NOTHING
      `).bind(room.pin, JSON.stringify(room), game.secret, room.version, room.expiresAt, this.now(), this.now()).run();
      if (inserted.meta.changes === 1) return result;
      const count = await this.db.prepare('SELECT COUNT(*) AS count FROM museum_rooms WHERE expires_at > ?').bind(this.now()).first();
      if (count.count >= 100) throw new GameError('This server has reached its active-room limit.', 'CAPACITY', 503);
    }
    throw new GameError('Could not reserve a room PIN. Retry safely.', 'PIN_BUSY', 503);
  }
  async load(pin) {
    if (!/^\d{5}$/.test(String(pin))) throw new GameError('Enter the five-digit room PIN.', 'INVALID_PIN', 400);
    await ensureMuseumSchema(this.db);
    const row = await this.db.prepare('SELECT state_json, room_secret, version, expires_at FROM museum_rooms WHERE pin = ?').bind(String(pin)).first();
    if (!row || row.expires_at <= this.now()) throw new GameError('This room is unavailable. Ask your teacher for the current PIN.', 'ROOM_NOT_FOUND', 404);
    const room = JSON.parse(row.state_json);
    if (room.pin !== String(pin) || room.version !== row.version) throw new Error('Invalid saved museum room.');
    const game = this.game(row.room_secret); game.rooms.set(room.pin, room);
    return { game, room, version: row.version };
  }
  async presence(game, room) {
    const present = await this.db.prepare('SELECT player_id, last_seen FROM museum_presence WHERE pin = ?').bind(room.pin).all();
    for (const entry of present.results) game.lastSeen.set(`${room.pin}:${entry.player_id}`, entry.last_seen);
  }
  async touch(room, playerId) {
    if (!playerId) return;
    await this.db.prepare(`
      INSERT INTO museum_presence (pin, player_id, last_seen)
      SELECT ?, ?, ? WHERE EXISTS (SELECT 1 FROM museum_rooms WHERE pin = ? AND expires_at > ?)
      ON CONFLICT(pin, player_id) DO UPDATE SET last_seen = excluded.last_seen
      WHERE museum_presence.last_seen <= excluded.last_seen - 10000
    `).bind(room.pin, playerId, this.now(), room.pin, this.now()).run();
  }
  async state(pin, token) { return (await this.mutate(pin, game => ({ state: game.state(pin, token) }), token, false)).state; }
  async join(pin, body) { return this.mutate(pin, game => game.join(pin, body), undefined, true); }
  async action(pin, token, body) { return this.mutate(pin, game => game.action(pin, token, body), token, false); }
  async mutate(pin, apply, token, joining) {
    for (let attempt = 0; attempt < this.maxAttempts; attempt++) {
      const { game, room, version } = await this.load(pin);
      const result = apply(game);
      if (room.version !== version) {
        const written = await this.db.prepare(`
          UPDATE museum_rooms SET state_json = ?, version = ?, updated_at = ?
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
