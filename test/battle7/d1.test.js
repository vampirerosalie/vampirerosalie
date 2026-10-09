import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { randomUUID } from 'node:crypto';
import { KitchenD1Store } from '../../app/battle7/d1-store.js';
import { TestD1 } from './d1-helper.js';
const questions = JSON.parse(readFileSync(new URL('../../app/battle7/data/question-bank.json', import.meta.url))).questions;

async function setup(count = 3) {
  const db = new TestD1();
  let time = Date.now();
  const options = { questions, now: () => time, random: () => 0, sleep: async () => {} };
  const store = () => new KitchenD1Store(db, options);
  const host = await store().create({ teamCount: count });
  const identities = Array.from({ length: count }, (_, i) => ({ clientId: randomUUID(), teamSlot: i + 1, name: `Team ${i + 1}` }));
  const teams = await Promise.all(identities.map((body) => store().join(host.pin, body)));
  const action = (token, type, extra = {}) => { const room=db.room(host.pin); return store().action(host.pin, token, { type, requestId: randomUUID(), questionId:room.questions[room.questionIndex]?.id, expectedPhase:room.phase, ...extra }); };
  const start = () => action(host.hostToken, 'host:start');
  const rush = async () => { await start(); await action(host.hostToken, 'host:reveal'); await action(host.hostToken, 'host:advance'); };
  return { db, store, host, teams, identities, action, start, rush, tick: (ms) => time += ms, options };
}

test('ten genuinely overlapping D1 joins preserve every team and reconnect token across requests', async () => {
  const s = await setup(10);
  assert.ok(s.db.conflicts > 0, 'test must exercise CAS failures, not just serial execution');
  assert.equal(s.db.room(s.host.pin).teams.length, 10);
  assert.equal(s.db.room(s.host.pin).version, 11);
  const again = await Promise.all(s.identities.map((body) => s.store().join(s.host.pin, { ...body, teamSlot: 1 })));
  assert.deepEqual(again, s.teams);
  assert.equal(s.db.room(s.host.pin).version, 11);
  for (const team of s.teams) assert.equal((await s.store().state(s.host.pin, team.teamToken)).me.id, team.teamId);
});

test('concurrent claims for one station have only one winner; same device retry has one identity', async () => {
  const db = new TestD1();
  const store = () => new KitchenD1Store(db, { questions, sleep: async () => {} });
  const host = await store().create({ teamCount: 3 });
  const attempts = await Promise.allSettled([1, 2].map((i) => store().join(host.pin, { clientId: randomUUID(), teamSlot: 1, name: `T${i}` })));
  assert.equal(attempts.filter((r) => r.status === 'fulfilled').length, 1);
  assert.equal(attempts.find((r) => r.status === 'rejected').reason.code, 'SLOT_TAKEN');
  const clientId = randomUUID();
  const same = await Promise.all([2, 3].map((teamSlot) => store().join(host.pin, { clientId, teamSlot, name: 'One device' })));
  assert.deepEqual(same[0], same[1]);
  assert.equal(db.room(host.pin).teams.length, 2);
});

test('simultaneous 10-team submit and teacher review never drop rewards or expose answers', async () => {
  const s = await setup(10);
  await s.start();
  const q = s.db.room(s.host.pin).questions[0];
  await Promise.all(s.teams.map((team) => s.action(team.teamToken, 'pupil:submit', { questionId: q.id, answer: 'Our answer' })));
  const review = (team) => ({ type: 'host:review', requestId: randomUUID(), questionId: q.id, teamId: team.teamId, decision: 'accepted' });
  const bodies = s.teams.map(review);
  await Promise.all(bodies.map((body) => s.store().action(s.host.pin, s.host.hostToken, body)));
  await Promise.all(bodies.map((body) => s.store().action(s.host.pin, s.host.hostToken, body)));
  const room = s.db.room(s.host.pin);
  assert.equal(room.version, 32);
  assert.ok(room.teams.every((team) => team.inventory.Bread === 1));
  for (const token of [undefined, s.teams[0].teamToken]) {
    const state = await s.store().state(s.host.pin, token);
    assert.equal(state.answerKey, undefined);
    assert.equal(state.answerReveal, null);
    assert.equal(state.question.canonicalAnswer, undefined);
    assert.equal(state.question.targetTense, undefined);
    assert.equal(state.questions, undefined);
    assert.equal(state.room_secret, undefined);
    assert.equal(state.hostHash, undefined);
    assert.equal(state.recipes, undefined);
    assert.ok(state.teams.every((team) => team.clientId === undefined && team.tokenHash === undefined));
  }
  assert.equal((await s.store().state(s.host.pin, s.host.hostToken)).answerKey.canonicalAnswer, q.canonicalAnswer);
});

test('competing cook requests cannot overspend; same-receipt retries keep the original cook', async () => {
  const s = await setup();
  await s.rush();
  s.db.seed(s.host.pin, (room) => Object.assign(room.teams[0].inventory, { Bread: 1, Cheese: 1, Tomato: 1 }));
  const results = await Promise.allSettled([1, 2].map(() => s.action(s.teams[0].teamToken, 'pupil:cook', { ingredients: ['Bread', 'Cheese', 'Tomato'] })));
  assert.equal(results.filter((r) => r.status === 'fulfilled').length, 1);
  assert.equal(results.find((r) => r.status === 'rejected').reason.code, 'NOT_ENOUGH_INGREDIENTS');
  assert.equal(s.db.room(s.host.pin).teams[0].stars, 3);
  assert.equal(s.db.room(s.host.pin).teams[0].inventory.Bread, 0);
  s.db.seed(s.host.pin, (room) => Object.assign(room.teams[0].inventory, { Bread: 1, Cheese: 1, Tomato: 1 }));
  const body = { type: 'pupil:cook', requestId: randomUUID(), questionId:s.db.room(s.host.pin).questions[s.db.room(s.host.pin).questionIndex].id, expectedPhase:'rush', ingredients: ['Bread', 'Cheese', 'Tomato'] };
  const same = await Promise.all(Array.from({ length: 10 }, () => s.store().action(s.host.pin, s.teams[0].teamToken, body)));
  assert.equal(new Set(same.map((r) => r.result.cook.id)).size, 1);
  assert.equal(same.filter((r) => r.replayed).length, 9);
  assert.equal(s.db.room(s.host.pin).teams[0].stars, 5);
  assert.equal(s.db.room(s.host.pin).latestCooks.length, 2);
});

test('simultaneous recipe discovery awards exactly one global bonus', async () => {
  const s = await setup();
  await s.rush();
  s.db.seed(s.host.pin, (room) => room.teams.slice(0, 2).forEach((team) => Object.assign(team.inventory, { Bread: 1, Cheese: 1, Tomato: 1 })));
  const results = await Promise.all(s.teams.slice(0, 2).map((team) => s.action(team.teamToken, 'pupil:cook', { ingredients: ['Bread', 'Cheese', 'Tomato'] })));
  assert.equal(results.reduce((n, result) => n + result.result.cook.discoveryBonus, 0), 1);
  assert.equal(s.db.room(s.host.pin).teams.reduce((n, team) => n + team.stars, 0), 5);
});

test('concurrent thieves cannot bypass protection or steal unavailable inventory', async () => {
  const s = await setup();
  await s.rush();
  s.db.seed(s.host.pin, (room) => {
    room.teams[0].powers.push({ id: 'power-a', type: 'steal' });
    room.teams[1].powers.push({ id: 'power-b', type: 'steal' });
    room.teams[2].inventory.Egg = 1;
  });
  const results = await Promise.allSettled([0, 1].map((i) => s.action(s.teams[i].teamToken, 'pupil:steal', { powerId: `power-${i ? 'b' : 'a'}`, targetTeamId: s.teams[2].teamId })));
  assert.equal(results.filter((r) => r.status === 'fulfilled').length, 1);
  assert.equal(results.find((r) => r.status === 'rejected').reason.code, 'TARGET_PROTECTED');
  const room = s.db.room(s.host.pin);
  assert.equal(room.teams[2].inventory.Egg, 0);
  assert.equal(room.teams.reduce((n, team) => n + team.powers.length, 0), 1);
  assert.equal(room.teams.reduce((n, team) => n + team.inventory.Egg, 0), 1);
});

test('ambiguous connection drop after D1 commit recovers safely from persisted receipt', async () => {
  const s = await setup();
  const body = { type: 'host:start', requestId: randomUUID() };
  s.db.failAfterCommit = true;
  await assert.rejects(s.store().action(s.host.pin, s.host.hostToken, body), /drop after commit/);
  assert.equal(s.db.room(s.host.pin).phase, 'question');
  const result = await s.store().action(s.host.pin, s.host.hostToken, body);
  assert.equal(result.replayed, true);
  assert.equal(result.state.version, 5);
  await assert.rejects(s.store().action(s.host.pin, s.host.hostToken, { ...body, type: 'host:close' }), { code: 'RECEIPT_CONFLICT' });
});

test('bounded contention returns retriable 503 with no partial state write', async () => {
  const s = await setup();
  const version = s.db.room(s.host.pin).version;
  s.db.forceConflict = true;
  await assert.rejects(new KitchenD1Store(s.db, { ...s.options, maxAttempts: 2 }).action(s.host.pin, s.host.hostToken, { type: 'host:start', requestId: randomUUID() }), { code: 'CONCURRENT_UPDATE', status: 503 });
  assert.equal(s.db.room(s.host.pin).version, version);
  assert.equal(s.db.room(s.host.pin).phase, 'lobby');
});

test('polling presence is shared, throttled, expires, and never changes gameplay version', async () => {
  const s = await setup();
  const writes = s.db.presenceWrites;
  const version = s.db.room(s.host.pin).version;
  await Promise.all(Array.from({ length: 15 }, () => s.store().state(s.host.pin, s.teams[0].teamToken)));
  assert.equal(s.db.presenceWrites, writes);
  assert.ok((await s.store().state(s.host.pin, s.host.hostToken)).teams.every((team) => team.online));
  s.tick(6000);
  await s.store().state(s.host.pin, s.teams[0].teamToken);
  assert.equal(s.db.presenceWrites, writes + 1);
  s.tick(21000);
  assert.ok((await s.store().state(s.host.pin)).teams.every((team) => !team.online));
  assert.equal(s.db.room(s.host.pin).version, version);
});

test('room TTL prevents access and new-room cleanup cascades presence without touching legacy tables', async () => {
  const s = await setup();
  s.db.sqlite.exec('CREATE TABLE rooms (room_id TEXT PRIMARY KEY, marker TEXT); INSERT INTO rooms VALUES (\'12345\', \'keep\')');
  s.tick(48 * 3600000 + 1);
  await assert.rejects(s.store().state(s.host.pin), { code: 'ROOM_NOT_FOUND' });
  await s.store().create({ teamCount: 2 });
  assert.equal(s.db.sqlite.prepare('SELECT COUNT(*) AS count FROM kitchen_presence').get().count, 0);
  assert.equal(s.db.sqlite.prepare('SELECT marker FROM rooms').get().marker, 'keep');
});

test('atomic active-room capacity survives concurrent room creation', async () => {
  const s = await setup(2);
  const saved = s.db.sqlite.prepare('SELECT * FROM kitchen_rooms').get();
  const insert = s.db.sqlite.prepare('INSERT INTO kitchen_rooms (pin, state_json, room_secret, version, expires_at, updated_at) VALUES (?, ?, ?, ?, ?, ?)');
  for (let i = 0; i < 98; i++) {
    let pin = String(10000 + i);
    if (pin === s.host.pin) pin = '99999';
    insert.run(pin, saved.state_json, saved.room_secret, saved.version, saved.expires_at, saved.updated_at);
  }
  const results = await Promise.allSettled(Array.from({ length: 8 }, () => s.store().create({ teamCount: 2 })));
  assert.equal(results.filter((result) => result.status === 'fulfilled').length, 1);
  assert.ok(results.filter((result) => result.status === 'rejected').every((result) => result.reason.code === 'CAPACITY'));
  assert.equal(s.db.sqlite.prepare('SELECT COUNT(*) AS count FROM kitchen_rooms').get().count, 100);
});

test('migration and first-request bootstrap are idempotent in either order', async () => {
  const migration = readFileSync(new URL('../../drizzle/0004_crazy_kitchen.sql', import.meta.url), 'utf8');
  const s = await setup(2);
  s.db.sqlite.exec(migration);
  assert.equal(s.db.sqlite.prepare('PRAGMA foreign_key_list(kitchen_presence)').get().on_delete, 'CASCADE');
  const db = new TestD1();
  db.sqlite.exec(migration);
  const host = await new KitchenD1Store(db, { questions }).create({ teamCount: 2 });
  assert.equal(db.room(host.pin).teamCount, 2);
  assert.equal(db.sqlite.prepare('PRAGMA foreign_key_list(kitchen_presence)').get().on_delete, 'CASCADE');
});
