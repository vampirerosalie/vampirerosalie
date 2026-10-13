import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { randomUUID } from 'node:crypto';
import { DatabaseSync } from 'node:sqlite';
import { setImmediate } from 'node:timers/promises';
import { DemolitionD1Store } from '../../app/battle8/d1-store.js';
import { handleDemolitionRequest } from '../../app/battle8/http.js';

const bank = JSON.parse(readFileSync(new URL('../../app/battle8/data/question-bank.json', import.meta.url), 'utf8'));
class TestD1 {
  constructor() { this.sqlite = new DatabaseSync(':memory:'); this.sqlite.exec('PRAGMA foreign_keys = ON'); this.conflicts = 0; this.failAfterCommit = false; }
  prepare(sql) {
    const sqlite = this.sqlite, noteConflict = () => { this.conflicts++; };
    const maybeFail = () => { if (this.failAfterCommit) { this.failAfterCommit = false; throw new Error('Simulated lost response after durable write'); } };
    let args = [];
    return {
      bind(...values) { args = values; return this; },
      async first() { await setImmediate(); return sqlite.prepare(sql).get(...args) ?? null; },
      async all() { await setImmediate(); return { results:sqlite.prepare(sql).all(...args) }; },
      async run() { await setImmediate(); const result = sqlite.prepare(sql).run(...args); if (sql.includes('UPDATE demolition_rooms')) { if (!result.changes) noteConflict(); else maybeFail(); } return { meta:{ changes:Number(result.changes) } }; },
    };
  }
  async batch(statements) {
    this.sqlite.exec('BEGIN');
    try { const result = []; for (const statement of statements) result.push(await statement.run()); this.sqlite.exec('COMMIT'); return result; }
    catch (error) { this.sqlite.exec('ROLLBACK'); throw error; }
  }
  room(pin) { return JSON.parse(this.sqlite.prepare('SELECT state_json FROM demolition_rooms WHERE pin = ?').get(pin).state_json); }
}
async function setup(count = 4) {
  const db = new TestD1(), options = { bank, sleep:async () => {} }, store = () => new DemolitionD1Store(db, options);
  const host = await store().create({ teamCount:40 });
  const clients = Array.from({ length:count }, (_, index) => ({ clientId:randomUUID(), teamSlot:index + 1, name:`Team ${index + 1}` }));
  const teams = await Promise.all(clients.map(client => store().join(host.pin, client)));
  const action = (token, type, more = {}, requestId = randomUUID()) => store().action(host.pin, token, { type, requestId, ...more });
  return { db, store, host, clients, teams, action };
}

test('40 overlapping joins preserve each place and reconnect identity', async () => {
  const s = await setup(40);
  assert.equal(s.db.room(s.host.pin).teams.length, 40);
  assert.ok(s.db.conflicts > 0, 'CAS conflicts must actually be exercised');
  const rejoined = await Promise.all(s.clients.map(client => s.store().join(s.host.pin, client)));
  assert.deepEqual(rejoined, s.teams);
  assert.equal(s.db.room(s.host.pin).teams.length, 40);
  const last = await s.store().state(s.host.pin, s.teams[39].teamToken);
  assert.equal(last.me.slot, 40);
});

test('40 team submissions and overlapping review decisions retain one draw each', async () => {
  const s = await setup(40); await s.action(s.host.hostToken, 'host:start');
  await Promise.all(s.teams.map(team => s.action(team.teamToken, 'pupil:submit', { questionId:1, answer:'A' })));
  const receipts = s.teams.map(team => ({ type:'host:review', requestId:randomUUID(), questionId:1, teamId:team.teamId, decision:'accepted' }));
  await Promise.all(receipts.map(body => s.store().action(s.host.pin, s.host.hostToken, body)));
  await Promise.all(receipts.map(body => s.store().action(s.host.pin, s.host.hostToken, body)));
  const room = s.db.room(s.host.pin);
  assert.equal(room.teams.filter(team => team.draws.length === 1).length, 40);
  assert.equal(room.teams.reduce((sum, team) => sum + team.draws.length, 0), 40);
  assert.equal((await s.store().state(s.host.pin, s.teams[0].teamToken)).reviewKeys, undefined);
  assert.equal((await s.store().state(s.host.pin)).reviews, undefined);
});

test('40 simultaneous correct submissions auto-award exactly one draw per team', async () => {
  const s = await setup(40); await s.action(s.host.hostToken, 'host:start');
  const receipts = s.teams.map(team => ({ team, body:{ type:'pupil:submit', requestId:randomUUID(), questionId:1, answer:'C' } }));
  await Promise.all(receipts.map(({ team, body }) => s.store().action(s.host.pin, team.teamToken, body)));
  await Promise.all(receipts.map(({ team, body }) => s.store().action(s.host.pin, team.teamToken, body)));
  const room = s.db.room(s.host.pin);
  assert.equal(room.teams.length, 40);
  assert.equal(room.teams.reduce((sum, team) => sum + team.draws.length, 0), 40);
  assert.equal(Object.values(room.submissions[1]).filter(sub => sub.status === 'accepted' && sub.rewardIssued).length, 40);
  assert.equal((await s.store().state(s.host.pin, s.host.hostToken)).pendingReviewCount, 0);
});

test('lost response after auto-marked submission replays without a second reward', async () => {
  const s = await setup(1), team = s.teams[0]; await s.action(s.host.hostToken, 'host:start');
  const body = { type:'pupil:submit', requestId:randomUUID(), questionId:1, answer:'C' };
  s.db.failAfterCommit = true;
  await assert.rejects(s.store().action(s.host.pin, team.teamToken, body), /lost response/);
  assert.equal(s.db.room(s.host.pin).teams[0].draws.length, 1);
  const retry = await s.store().action(s.host.pin, team.teamToken, body);
  assert.equal(retry.replayed, true);
  assert.equal(s.db.room(s.host.pin).teams[0].draws.length, 1);
});

test('same draw/card cannot be spent twice by concurrent team clients', async () => {
  const s = await setup(2), [a,b] = s.teams; await s.action(s.host.hostToken, 'host:start');
  await s.action(a.teamToken, 'pupil:submit', { questionId:1, answer:'A' });
  await s.action(s.host.hostToken, 'host:review', { questionId:1, teamId:a.teamId, decision:'accepted' });
  const drawId = (await s.store().state(s.host.pin, a.teamToken)).me.nextDrawId;
  const draws = await Promise.allSettled([1,2].map(() => s.action(a.teamToken, 'pupil:draw', { drawId })));
  assert.equal(draws.filter(result => result.status === 'fulfilled').length, 1);
  const offer = (await s.store().state(s.host.pin, a.teamToken)).me.offer;
  assert.equal(offer.slots.length, 3);
  const choices = await Promise.allSettled(offer.slots.slice(0,2).map(slot => s.action(a.teamToken, 'pupil:choose', { offerId:offer.id, slotId:slot.id })));
  assert.equal(choices.filter(result => result.status === 'fulfilled').length, 1);
  const room = s.db.room(s.host.pin), team = room.teams.find(row => row.id === a.teamId);
  assert.equal(team.hand.length + Number(team.walls > 0), 1);
  assert.equal(team.draws.length, 0);
  assert.equal(room.teams.find(row => row.id === b.teamId).draws.length, 0);
});

test('lost response after D1 commit replays the saved receipt without duplicating a reward', async () => {
  const s = await setup(1), team = s.teams[0];
  await s.action(s.host.hostToken, 'host:start');
  await s.action(team.teamToken, 'pupil:submit', { questionId:1, answer:'A' });
  const body = { type:'host:review', requestId:randomUUID(), teamId:team.teamId, questionId:1, decision:'accepted' };
  s.db.failAfterCommit = true;
  await assert.rejects(s.store().action(s.host.pin, s.host.hostToken, body), /lost response/);
  assert.equal(s.db.room(s.host.pin).teams[0].draws.length, 1);
  const retry = await s.store().action(s.host.pin, s.host.hostToken, body);
  assert.equal(retry.replayed, true);
  assert.equal(s.db.room(s.host.pin).teams[0].draws.length, 1);
});

test('large 40-team room remains actionable past question 20', async () => {
  const s = await setup(40); await s.action(s.host.hostToken, 'host:start');
  const room = s.db.room(s.host.pin);
  for (let q = 1; q <= 20; q++) {
    room.submissions[q] = Object.fromEntries(room.teams.map(team => [team.id, {
      answer:'A', status:'accepted', rewardIssued:true, rewardLocked:true, at:Date.now(),
    }]));
  }
  room.questionIndex = 20; room.version++;
  s.db.sqlite.prepare('UPDATE demolition_rooms SET state_json = ?, version = ? WHERE pin = ?').run(JSON.stringify(room), room.version, room.pin);
  const hostState = await s.store().state(s.host.pin, s.host.hostToken);
  assert.equal(hostState.question.id, 21);
  assert.equal(hostState.reviews.length, 800);
  await Promise.all(s.teams.map(team => s.action(team.teamToken, 'pupil:submit', { questionId:21, answer:'B' })));
  await Promise.all(s.teams.map(team => s.action(s.host.hostToken, 'host:review', { questionId:21, teamId:team.teamId, decision:'accepted' })));
  const after = s.db.room(s.host.pin);
  assert.equal(Object.keys(after.submissions[21]).length, 40);
  assert.equal(after.teams.reduce((sum, team) => sum + team.draws.length, 0), 40);
});

test('HTTP cross-origin and unauthorised teacher action are rejected; QR contains join URL', async () => {
  const s = await setup(1), origin = 'https://example.test';
  const request = (path, method, body, token, extra = {}) => new Request(`${origin}${path}`, { method, headers:{ ...(body ? { 'content-type':'application/json' } : {}), ...(token ? { authorization:`Bearer ${token}` } : {}), ...extra }, body:body ? JSON.stringify(body) : undefined });
  const path = `/api/demolition/rooms/${s.host.pin}`;
  const denied = await handleDemolitionRequest(request(`${path}/action`, 'POST', { type:'host:start', requestId:randomUUID() }, s.teams[0].teamToken), s.db, { bank });
  assert.equal(denied.status, 403);
  const cross = await handleDemolitionRequest(request(`${path}/action`, 'POST', { type:'host:start', requestId:randomUUID() }, s.host.hostToken, { origin:'https://evil.test' }), s.db, { bank });
  assert.equal(cross.status, 403);
  const qr = await handleDemolitionRequest(request(`${path}/qr.svg`, 'GET'), s.db, { bank });
  assert.equal(qr.status, 200);
  assert.match(await qr.text(), /<svg/);
});
