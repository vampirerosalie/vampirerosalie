import test from 'node:test';
import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import { DatabaseSync } from 'node:sqlite';
import { setImmediate } from 'node:timers/promises';
import QRCode from 'qrcode';
import jsQR from 'jsqr';
import { MuseumD1Store } from '../../app/battle11/d1-store.js';
import { handleMuseumRequest } from '../../app/battle11/http.js';
import { STATION_PAYLOADS, VISIT_MS } from '../../app/battle11/core/game.js';

class TestD1 {
  constructor() { this.sqlite = new DatabaseSync(':memory:'); this.sqlite.exec('PRAGMA foreign_keys=ON'); this.conflicts = 0; this.failAfterCommit = false; }
  prepare(sql) { let args = []; const statement = {
    bind: (...values) => { args = values; return statement; },
    first: async () => { await setImmediate(); return this.sqlite.prepare(sql).get(...args) ?? null; },
    all: async () => { await setImmediate(); return { results: this.sqlite.prepare(sql).all(...args) }; },
    run: async () => { await setImmediate(); const result = this.sqlite.prepare(sql).run(...args);
      if (sql.includes('UPDATE museum_rooms')) { if (!result.changes) this.conflicts++; else if (this.failAfterCommit) { this.failAfterCommit = false; throw new Error('Lost response after commit'); } }
      return { meta: { changes: Number(result.changes) } }; },
  }; return statement; }
  async batch(statements) { this.sqlite.exec('BEGIN'); try { const rows = []; for (const statement of statements) rows.push(await statement.run()); this.sqlite.exec('COMMIT'); return rows; } catch (error) { this.sqlite.exec('ROLLBACK'); throw error; } }
  room(pin) { return JSON.parse(this.sqlite.prepare('SELECT state_json FROM museum_rooms WHERE pin=?').get(pin).state_json); }
}
async function setup(n = 3) {
  const db = new TestD1(); let now = 1_000_000;
  const options = { now: () => now, sleep: async () => {} }, store = () => new MuseumD1Store(db, options);
  const host = await store().create(), clients = Array.from({ length: n }, (_, i) => ({ clientId: randomUUID(), name: `Group ${i + 1}` }));
  const groups = await Promise.all(clients.map(c => store().join(host.pin, c)));
  const act = (token, type, extra = {}, requestId = randomUUID()) => store().action(host.pin, token, { type, requestId, ...extra });
  const view = token => store().state(host.pin, token);
  return { db, store, host, clients, groups, act, view, options, tick: ms => { now += ms; } };
}

test('40 concurrent joins reconnect once, and only twelve groups can occupy six two-slot stations', async () => {
  const s = await setup(40); assert.equal(s.db.room(s.host.pin).players.length, 40);
  assert.deepEqual(await Promise.all(s.clients.map(c => s.store().join(s.host.pin, c))), s.groups);
  await s.act(s.host.hostToken, 'host:start');
  const attempts = await Promise.allSettled(s.groups.slice(0, 18).map((g, i) => s.act(g.playerToken, 'student:scan', { code: STATION_PAYLOADS[Math.floor(i / 3)] })));
  assert.equal(attempts.filter(a => a.status === 'fulfilled').length, 12);
  assert.equal(attempts.filter(a => a.status === 'rejected' && a.reason.code === 'STATION_FULL').length, 6);
  const state = await s.view(s.host.hostToken);
  assert.equal(state.stations.reduce((count, station) => count + station.count, 0), 12);
  assert.ok(state.stations.every(station => station.count === 2));
  assert.ok(s.db.conflicts > 0);
});

test('three simultaneous scans of an empty station admit exactly two across Worker instances', async () => {
  const s = await setup(); await s.act(s.host.hostToken, 'host:start');
  const scans = await Promise.allSettled(s.groups.map(g => s.act(g.playerToken, 'student:scan', { code: STATION_PAYLOADS[3] })));
  assert.equal(scans.filter(x => x.status === 'fulfilled').length, 2);
  assert.equal(scans.filter(x => x.status === 'rejected').length, 1);
  assert.equal((await s.view(s.host.hostToken)).stations[3].count, 2);
});

test('original visit expiry and saved answer survive fresh Workers; stale slots release on read', async () => {
  const s = await setup(2), [a, b] = s.groups.map(g => g.playerToken); await s.act(s.host.hostToken, 'host:start');
  await s.act(a, 'student:scan', { code: STATION_PAYLOADS[0] });
  const first = await s.view(a);
  await s.act(a, 'student:save', { station: 1, letter: 'E', visitId: first.me.activeVisit.id, expectedVersion: 0 });
  s.tick(1000); await s.act(b, 'student:scan', { code: STATION_PAYLOADS[0] });
  assert.equal((await s.view(a)).me.activeVisit.expiresAt, first.me.activeVisit.expiresAt);
  s.tick(VISIT_MS - 1000); const after = await s.view(a);
  assert.equal(after.me.activeVisit, null); assert.equal(after.paragraph, undefined); assert.equal(after.me.choices[0], 'E');
  assert.equal((await s.view(b)).me.activeVisit.station, 1);
  assert.equal((await s.view(s.host.hostToken)).stations[0].count, 1);
});

test('lost save response replays receipt without a second revision or answer move', async () => {
  const s = await setup(1), t = s.groups[0].playerToken; await s.act(s.host.hostToken, 'host:start');
  await s.act(t, 'student:scan', { code: STATION_PAYLOADS[1] });
  const v = await s.view(t), receipt = randomUUID(), body = { station: 2, letter: 'B', visitId: v.me.activeVisit.id, expectedVersion: 0 };
  s.db.failAfterCommit = true;
  await assert.rejects(s.act(t, 'student:save', body, receipt), /Lost response/);
  assert.equal((await s.act(t, 'student:save', body, receipt)).replayed, true);
  assert.equal((await s.view(t)).me.answerVersion, 1);
});

test('permanent station SVGs decode, remain room-independent and join QR is separate', async () => {
  const s = await setup(1);
  for (let n = 1; n <= 6; n++) {
    const request = new Request(`https://example.test/api/museum/stations/${n}/qr.svg`);
    const response = await handleMuseumRequest(request, null, s.options);
    assert.equal(response.status, 200); assert.match(await response.text(), /<svg/);
    const qr = QRCode.create(STATION_PAYLOADS[n - 1], { errorCorrectionLevel: 'M' });
    const scale = 7, margin = 4, width = (qr.modules.size + margin * 2) * scale, pixels = new Uint8ClampedArray(width * width * 4);
    for (let y = 0; y < width; y++) for (let x = 0; x < width; x++) {
      const moduleX = Math.floor(x / scale) - margin, moduleY = Math.floor(y / scale) - margin;
      const dark = moduleX >= 0 && moduleY >= 0 && moduleX < qr.modules.size && moduleY < qr.modules.size && qr.modules.get(moduleX, moduleY);
      const i = (y * width + x) * 4; pixels[i] = pixels[i + 1] = pixels[i + 2] = dark ? 0 : 255; pixels[i + 3] = 255;
    }
    assert.equal(jsQR(pixels, width, width)?.data, STATION_PAYLOADS[n - 1]);
  }
  const join = await handleMuseumRequest(new Request(`https://example.test/api/museum/rooms/${s.host.pin}/qr.svg`), s.db, s.options);
  assert.equal(join.status, 200); assert.match(await join.text(), /<svg/);
  const publicState = await handleMuseumRequest(new Request(`https://example.test/api/museum/rooms/${s.host.pin}/state`), s.db, s.options);
  const data = await publicState.json(); assert.equal(data.joinUrl, `https://example.test/battle11/index.html?join=${s.host.pin}`);
  assert.equal(data.options, undefined); assert.equal(data.paragraph, undefined); assert.equal(data.solutions, undefined);
});
