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
  const cooking = async () => { await start(); await action(host.hostToken, 'host:reveal'); };
  return { db, store, host, teams, identities, action, start, cooking, tick: (ms) => time += ms, options };
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
  assert.ok(room.teams.every((team) => team.inventory.Bread === 2));
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
  await s.cooking();
  s.db.seed(s.host.pin, (room) => Object.assign(room.teams[0].inventory, { Bread: 1, Cheese: 1, Tomato: 1 }));
  const results = await Promise.allSettled([1, 2].map(() => s.action(s.teams[0].teamToken, 'pupil:cook', { ingredients: ['Bread', 'Cheese', 'Tomato'] })));
  assert.equal(results.filter((r) => r.status === 'fulfilled').length, 1);
  assert.equal(results.find((r) => r.status === 'rejected').reason.code, 'NOT_ENOUGH_INGREDIENTS');
  assert.equal(s.db.room(s.host.pin).teams[0].stars, 3);
  assert.equal(s.db.room(s.host.pin).teams[0].inventory.Bread, 0);
  s.db.seed(s.host.pin, (room) => Object.assign(room.teams[0].inventory, { Bread: 1, Cheese: 1, Tomato: 1 }));
  const body = { type: 'pupil:cook', requestId: randomUUID(), questionId:s.db.room(s.host.pin).questions[s.db.room(s.host.pin).questionIndex].id, expectedPhase:'reveal', ingredients: ['Bread', 'Cheese', 'Tomato'] };
  const same = await Promise.all(Array.from({ length: 10 }, () => s.store().action(s.host.pin, s.teams[0].teamToken, body)));
  assert.equal(new Set(same.map((r) => r.result.cook.id)).size, 1);
  assert.equal(same.filter((r) => r.replayed).length, 9);
  assert.equal(s.db.room(s.host.pin).teams[0].stars, 5);
  assert.equal(s.db.room(s.host.pin).latestCooks.length, 2);
});

test('simultaneous recipe discovery awards exactly one global bonus', async () => {
  const s = await setup();
  await s.cooking();
  s.db.seed(s.host.pin, (room) => room.teams.slice(0, 2).forEach((team) => Object.assign(team.inventory, { Bread: 1, Cheese: 1, Tomato: 1 })));
  const results = await Promise.all(s.teams.slice(0, 2).map((team) => s.action(team.teamToken, 'pupil:cook', { ingredients: ['Bread', 'Cheese', 'Tomato'] })));
  assert.equal(results.reduce((n, result) => n + result.result.cook.discoveryBonus, 0), 1);
  assert.equal(s.db.room(s.host.pin).teams.reduce((n, team) => n + team.stars, 0), 5);
});

test('concurrent thieves cannot bypass protection or steal unavailable inventory', async () => {
  const s = await setup();
  await s.cooking();
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

test('concurrent cook and teacher rejection serialize without negative inventory or reversing spent rewards',async()=>{
 for(const cookFirst of [true,false]){
  const s=await setup();await s.start();
  s.db.seed(s.host.pin,r=>Object.assign(r.teams[0].inventory,{Cheese:1,Tomato:1}));
  await s.action(s.teams[0].teamToken,'pupil:submit',{answer:'Review this answer'});
  await s.action(s.host.hostToken,'host:review',{teamId:s.teams[0].teamId,decision:'accepted'});
  const cook=()=>s.action(s.teams[0].teamToken,'pupil:cook',{ingredients:['Bread','Cheese','Tomato']});
  const reject=()=>s.action(s.host.hostToken,'host:review',{teamId:s.teams[0].teamId,decision:'rejected'});
  const results=await Promise.allSettled((cookFirst?[cook,reject]:[reject,cook]).map(run=>run()));
  assert.equal(results.filter(r=>r.status==='fulfilled').length,1);
  assert.ok(['REWARD_ALREADY_USED','NOT_ENOUGH_INGREDIENTS'].includes(results.find(r=>r.status==='rejected').reason.code));
  const room=s.db.room(s.host.pin),team=room.teams[0],submission=room.submissions[room.questions[0].id][team.id];
  assert.ok(Object.values(team.inventory).every(n=>n>=0));assert.equal(team.inventory.Bread,submission.status==='accepted'?1:0);
  assert.equal(team.stars,submission.status==='accepted'?3:0);
  if(team.stars)assert.equal(submission.rewardSpent,true);
 }
});

test('concurrent reveal and cooking both succeed for the same question without losing either update',async()=>{
 const s=await setup();await s.start();
 s.db.seed(s.host.pin,r=>Object.assign(r.teams[0].inventory,{Bread:1,Cheese:1,Tomato:1}));
 const q=s.db.room(s.host.pin).questions[0];
 const cook={type:'pupil:cook',requestId:randomUUID(),questionId:q.id,expectedPhase:'question',ingredients:['Bread','Cheese','Tomato']};
 await Promise.all([
  s.action(s.host.hostToken,'host:reveal'),
  s.store().action(s.host.pin,s.teams[0].teamToken,cook),
 ]);
 const room=s.db.room(s.host.pin);assert.equal(room.phase,'reveal');assert.equal(room.teams[0].stars,3);
 assert.equal(room.teams[0].inventory.Bread,0);assert.equal(room.latestCooks.length,1);
});

test('concurrent final advance and last cook never modify scores after the game is finished',async()=>{
 for(const cookFirst of [true,false]){
  const s=await setup();await s.cooking();
  s.db.seed(s.host.pin,r=>{r.questionIndex=19;Object.assign(r.teams[0].inventory,{Bread:1,Cheese:1,Tomato:1});});
  const cook=()=>s.action(s.teams[0].teamToken,'pupil:cook',{ingredients:['Bread','Cheese','Tomato']});
  const finish=()=>s.action(s.host.hostToken,'host:advance');
  const results=await Promise.allSettled((cookFirst?[cook,finish]:[finish,cook]).map(run=>run()));
  const room=s.db.room(s.host.pin);assert.equal(room.phase,'finished');
  assert.equal(results.filter(r=>r.status==='rejected').length,room.teams[0].stars?0:1);
  if(!room.teams[0].stars)assert.equal(results.find(r=>r.status==='rejected').reason.code,'STALE_CONTEXT');
  const before=JSON.stringify(room);
  await assert.rejects(s.action(s.teams[0].teamToken,'pupil:cook',{ingredients:['Bread','Cheese','Tomato']}),{code:'WRONG_PHASE'});
  assert.equal(JSON.stringify(s.db.room(s.host.pin)),before);
 }
});

test('concurrent lobby configuration and new station joins cannot orphan a joined team',async()=>{
 const s=await setup(2);await s.action(s.host.hostToken,'host:configure',{teamCount:3});
 const results=await Promise.allSettled([
  s.store().join(s.host.pin,{clientId:randomUUID(),teamSlot:3,name:'Third team'}),
  s.action(s.host.hostToken,'host:configure',{teamCount:2}),
 ]);
 assert.equal(results.filter(r=>r.status==='fulfilled').length,1);
 const room=s.db.room(s.host.pin);assert.ok(room.teams.every(t=>t.slot<=room.teamCount));
 assert.equal(room.teams.length,room.teamCount);
 assert.ok(['STATION_OCCUPIED','INVALID_ACTION'].includes(results.find(r=>r.status==='rejected').reason.code));
});

test('all twenty rounds finish through D1 without rush phases and reconnect retains the final team result',async()=>{
 const s=await setup(2);await s.start();
 for(let i=0;i<20;i++){
  const room=s.db.room(s.host.pin);assert.equal(room.phase,'question');assert.equal(room.questionIndex,i);
  await s.action(s.teams[0].teamToken,'pupil:submit',{answer:'Team answer'});
  await s.action(s.host.hostToken,'host:review',{teamId:s.teams[0].teamId,decision:'accepted'});
  await s.action(s.host.hostToken,'host:reveal');
  await s.action(s.host.hostToken,'host:advance');
 }
 const state=await s.store().state(s.host.pin,s.teams[0].teamToken);
 assert.equal(state.phase,'finished');assert.equal(state.questionNumber,20);assert.deepEqual(state.winners,[s.teams[0].teamId]);
 assert.equal(state.me.inventory.Bread,40);assert.equal(state.cookingAvailable,false);
 assert.deepEqual(await s.store().join(s.host.pin,s.identities[0]),s.teams[0]);
 assert.equal((await s.store().state(s.host.pin,s.teams[0].teamToken)).me.id,s.teams[0].teamId);
});

test('concurrent basic cooks spend stock once and replay the same one-star receipt without discovery bonuses',async()=>{
 const s=await setup();await s.start();
 s.db.seed(s.host.pin,r=>r.teams.slice(0,2).forEach(team=>Object.assign(team.inventory,{Chocolate:1,Chicken:1,Mushroom:1})));
 const room=s.db.room(s.host.pin);
 const body={type:'pupil:cook',requestId:randomUUID(),questionId:room.questions[0].id,expectedPhase:'question',ingredients:['Chocolate','Chicken','Mushroom']};
 const results=await Promise.all([
  ...Array.from({length:8},()=>s.store().action(s.host.pin,s.teams[0].teamToken,body)),
  s.store().action(s.host.pin,s.teams[1].teamToken,{...body,requestId:randomUUID()}),
 ]);
 assert.equal(results.filter(r=>r.replayed).length,7);
 assert.equal(new Set(results.slice(0,8).map(r=>r.result.cook.id)).size,1);
 assert.ok(results.every(r=>r.result.cook.starsEarned===1&&r.result.cook.discoveryBonus===0&&r.result.cook.dish.type==='basic'));
 const saved=s.db.room(s.host.pin);assert.equal(saved.latestCooks.length,2);assert.deepEqual(saved.discoveries,{});
 for(const team of saved.teams.slice(0,2)){
  assert.equal(team.stars,1);assert.equal(Object.values(team.inventory).reduce((a,b)=>a+b,0),0);assert.deepEqual(team.recipes,{});
 }
 await assert.rejects(s.action(s.teams[0].teamToken,'pupil:cook',{ingredients:body.ingredients}),{code:'NOT_ENOUGH_INGREDIENTS'});
 assert.equal(s.db.room(s.host.pin).teams[0].stars,1);
});
