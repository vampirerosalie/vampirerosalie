import { DatabaseSync } from 'node:sqlite';
import { setImmediate } from 'node:timers/promises';

/** Real SQLite SQL semantics with async boundaries to force request races. */
export class TestD1 {
  constructor() {
    this.sqlite = new DatabaseSync(':memory:');
    this.sqlite.exec('PRAGMA foreign_keys = ON');
    this.conflicts = 0;
    this.presenceWrites = 0;
    this.failAfterCommit = false;
    this.forceConflict = false;
  }
  prepare(sql) { return prepareStatement(this, sql); }
  async batch(statements) {
    this.sqlite.exec('BEGIN');
    try {
      const results = [];
      for (const statement of statements) results.push(await statement.run());
      this.sqlite.exec('COMMIT');
      return results;
    } catch (error) { this.sqlite.exec('ROLLBACK'); throw error; }
  }
  room(pin) { return JSON.parse(this.sqlite.prepare('SELECT state_json FROM kitchen_rooms WHERE pin = ?').get(pin).state_json); }
  seed(pin, mutate) {
    const room = this.room(pin);
    mutate(room);
    room.version++;
    this.sqlite.prepare('UPDATE kitchen_rooms SET state_json = ?, version = ? WHERE pin = ?').run(JSON.stringify(room), room.version, pin);
  }
}

function prepareStatement(db, sql) {
    let values = [];
    return {
      bind(...args) { values = args; return this; },
      async first() { await setImmediate(); return db.sqlite.prepare(sql).get(...values) ?? null; },
      async all() { await setImmediate(); return { results: db.sqlite.prepare(sql).all(...values) }; },
      async run() {
        await setImmediate();
        if (db.forceConflict && sql.includes('UPDATE kitchen_rooms SET')) return { meta: { changes: 0 } };
        const result = db.sqlite.prepare(sql).run(...values);
        if (sql.includes('UPDATE kitchen_rooms SET')) {
          if (result.changes === 0) db.conflicts++;
          else if (db.failAfterCommit) { db.failAfterCommit = false; throw new Error('Injected connection drop after commit'); }
        }
        if (sql.includes('INSERT INTO kitchen_presence')) db.presenceWrites += Number(result.changes);
        return { success: true, meta: { changes: Number(result.changes) } };
      },
    };
  }
