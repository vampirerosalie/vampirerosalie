import test from 'node:test';
import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import { DatabaseSync } from 'node:sqlite';
import { setImmediate } from 'node:timers/promises';
import QRCode from 'qrcode';
import jsQR from 'jsqr';
import { LanternD1Store } from '../../app/battle10/d1-store.js';
import { handleLanternRequest } from '../../app/battle10/http.js';

class TestD1 {
  constructor() { this.sqlite = new DatabaseSync(':memory:'); this.sqlite.exec('PRAGMA foreign_keys=ON'); this.conflicts = 0; this.failAfterCommit = false; }
  prepare(sql) { const owner = this; let args = []; return {
    bind(...values) { args = values; return this; },
    async first() { await setImmediate(); return owner.sqlite.prepare(sql).get(...args) ?? null; },
    async all() { await setImmediate(); return { results: owner.sqlite.prepare(sql).all(...args) }; },
    async run() { await setImmediate(); const result = owner.sqlite.prepare(sql).run(...args);
      if (sql.includes('UPDATE lantern_rooms')) { if (!result.changes) owner.conflicts++; else if (owner.failAfterCommit) { owner.failAfterCommit = false; throw new Error('Lost response after commit'); } }
      return { meta: { changes: Number(result.changes) } }; },
  }; }
  async batch(statements) { this.sqlite.exec('BEGIN'); try { const rows = []; for (const statement of statements) rows.push(await statement.run()); this.sqlite.exec('COMMIT'); return rows; } catch (error) { this.sqlite.exec('ROLLBACK'); throw error; } }
  room(pin) { return JSON.parse(this.sqlite.prepare('SELECT state_json FROM lantern_rooms WHERE pin=?').get(pin).state_json); }
}
async function setup(n = 2) {
  const db = new TestD1(); let now = 1_000_000; const options = { now: () => now, sleep: async () => {} }, store = () => new LanternD1Store(db, options);
  const host = await store().create(), clients = Array.from({ length: n }, (_, i) => ({ clientId: randomUUID(), name: `Student ${i + 1}` }));
  const students = await Promise.all(clients.map(c => store().join(host.pin, c)));
  const act = (token, type, extra = {}, requestId = randomUUID()) => store().action(host.pin, token, { type, requestId, ...extra });
  return { db, store, host, clients, students, act, options, tick: ms => { now += ms; } };
}
test('40 simultaneous joins and independent answer actions survive separate Worker instances', async () => {
  const s = await setup(40); assert.equal(s.db.room(s.host.pin).players.length, 40); assert.ok(s.db.conflicts > 0);
  assert.deepEqual(await Promise.all(s.clients.map(c => s.store().join(s.host.pin, c))), s.students);
  await s.act(s.host.hostToken, 'host:start');
  await Promise.all(s.students.map(t => s.act(t.playerToken, 'student:dialogue-next')));
  const state = await s.store().state(s.host.pin, s.host.hostToken);
  assert.equal(state.students.length, 40); assert.equal(state.phase, 'active');
  assert.ok(state.students.every(p => p.status === 'Story dialogue'));
});
test('lost response retry uses the durable receipt without incrementing attempts twice', async () => {
  const s = await setup(1), t = s.students[0].playerToken;
  await s.act(s.host.hostToken, 'host:start');
  for (let i = 0; i < 3; i++) await s.act(t, 'student:dialogue-next');
  await s.act(t, 'student:begin-questions');
  const receipt = randomUUID(); s.db.failAfterCommit = true;
  await assert.rejects(s.act(t, 'student:submit', { questionNumber: 1, answer: 'fishing boats' }, receipt), /Lost response/);
  const retry = await s.act(t, 'student:submit', { questionNumber: 1, answer: 'fishing boats' }, receipt);
  assert.equal(retry.replayed, true); assert.equal(s.db.room(s.host.pin).players[0].attempts[0], 1);
  assert.equal((await s.store().state(s.host.pin, t)).me.stage, 'success');
});
test('parallel late joins share the active room and do not reset students already playing', async () => {
  const s = await setup(2), first = s.students[0].playerToken;
  await s.act(s.host.hostToken, 'host:start');
  for (let i = 0; i < 3; i++) await s.act(first, 'student:dialogue-next');
  await s.act(first, 'student:begin-questions');
  const lateClients = Array.from({ length: 12 }, (_, i) => ({ clientId: randomUUID(), name: `Late ${i + 1}` }));
  const late = await Promise.all(lateClients.map(client => s.store().join(s.host.pin, client)));
  const hostView = await s.store().state(s.host.pin, s.host.hostToken);
  assert.equal(hostView.students.length, 14);
  assert.equal((await s.store().state(s.host.pin, first)).me.stage, 'question');
  for (const student of late) {
    const view = await s.store().state(s.host.pin, student.playerToken);
    assert.equal(view.me.q, 1); assert.equal(view.me.stage, 'dialogue');
  }
  const again = await s.store().join(s.host.pin, lateClients[0]);
  assert.equal(again.playerId, late[0].playerId);
  assert.equal((await s.store().state(s.host.pin, s.host.hostToken)).students.length, 14);
  await s.act(s.host.hostToken, 'host:end');
  await assert.rejects(s.store().join(s.host.pin, { clientId: randomUUID(), name: 'Too late' }), /ended/);
});
test('opening passage stage and completed reading survive a fresh Worker instance', async () => {
  const s = await setup(1), t = s.students[0].playerToken;
  await s.act(s.host.hostToken, 'host:start');
  for (let i = 0; i < 3; i++) await s.act(t, 'student:dialogue-next');
  assert.equal((await s.store().state(s.host.pin, t)).me.stage, 'reading');
  assert.equal((await s.store().state(s.host.pin, s.host.hostToken)).students[0].status, 'Reading passage');
  await s.act(t, 'student:begin-questions');
  assert.equal((await s.store().state(s.host.pin, t)).me.stage, 'question');
  assert.equal(s.db.room(s.host.pin).players[0].readingComplete, true);
});
test('HTTP keeps hunt seals and answers private, rejects cross-origin actions and renders join QR', async () => {
  const s = await setup(1), base = `https://example.test/api/lantern/rooms/${s.host.pin}`;
  const req = (suffix, body, token, extra = {}) => new Request(base + suffix, { method: body ? 'POST' : 'GET',
    headers: { ...(body ? { 'content-type': 'application/json' } : {}), ...(token ? { authorization: 'Bearer ' + token } : {}), ...extra },
    body: body ? JSON.stringify(body) : undefined });
  const handle = request => handleLanternRequest(request, s.db, s.options);
  assert.equal((await handle(req('/seals', undefined, s.students[0].playerToken))).status, 403);
  const seals = await (await handle(req('/seals', undefined, s.host.hostToken))).json();
  assert.match(seals.genuine.svg, /<svg/); assert.notEqual(seals.genuine.code, seals.decoy.code);
  const joinQr = await handle(req('/qr.svg')); assert.equal(joinQr.status, 200); assert.match(await joinQr.text(), /<svg/);
  const state = await (await handle(req('/state'))).json();
  assert.equal(state.joinUrl, `https://example.test/battle10/index.html?join=${s.host.pin}`);
  assert.equal(state.seals, undefined); assert.equal(state.answerKey, undefined);
  const cross = await handle(req('/action', { type: 'host:start', requestId: randomUUID() }, s.host.hostToken, { origin: 'https://evil.test' }));
  assert.equal(cross.status, 403);
});
test('printed seal payloads decode to the exact in-game room token format', async () => {
  const s = await setup(1), seals = await s.store().seals(s.host.pin, s.host.hostToken);
  for (const code of [seals.genuine, seals.decoy]) {
    const payload = `LK1|${s.host.pin}|${code}`, qr = QRCode.create(payload, { errorCorrectionLevel: 'M' });
    const scale = 7, margin = 4, width = (qr.modules.size + margin * 2) * scale, pixels = new Uint8ClampedArray(width * width * 4);
    for (let y = 0; y < width; y++) for (let x = 0; x < width; x++) {
      const moduleX = Math.floor(x / scale) - margin, moduleY = Math.floor(y / scale) - margin;
      const dark = moduleX >= 0 && moduleY >= 0 && moduleX < qr.modules.size && moduleY < qr.modules.size && qr.modules.get(moduleX, moduleY);
      const i = (y * width + x) * 4; pixels[i] = pixels[i + 1] = pixels[i + 2] = dark ? 0 : 255; pixels[i + 3] = 255;
    }
    assert.equal(jsQR(pixels, width, width)?.data, payload);
  }
});
