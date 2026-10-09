import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { randomUUID } from 'node:crypto';
import { handleKitchenRequest } from '../../app/battle7/http.js';
import { TestD1 } from './d1-helper.js';
const questions = JSON.parse(readFileSync(new URL('../../app/battle7/data/question-bank.json', import.meta.url))).questions;
const origin = 'https://grammartest.grammarclassroom.workers.dev';
let sequence = 1;

function setup() {
  const db = new TestD1();
  const ip = `test-${sequence++}`;
  const send = (path, body, token, headers = {}, method = body === undefined ? 'GET' : 'POST') => {
    const request = new Request(`${origin}/api/kitchen/${path}`, {
      method,
      headers: { 'cf-connecting-ip': ip, ...(body === undefined ? {} : { 'content-type': 'application/json', origin }), ...(token ? { authorization: `Bearer ${token}` } : {}), ...headers },
      ...(body === undefined ? {} : { body: JSON.stringify(body) }),
    });
    return handleKitchenRequest(request, db, { questions, sleep: async () => {} });
  };
  return { db, send };
}

test('same-origin create/join/state/QR/action contract and security headers work end-to-end', async () => {
  const { send } = setup();
  const created = await send('rooms', { teamCount: 2 });
  assert.equal(created.status, 201);
  assert.equal(created.headers.get('cache-control'), 'no-store');
  const host = await created.json();
  assert.match(host.pin, /^\d{5}$/);
  assert.match(host.hostToken, /^[a-f0-9]{64}$/);
  const teams = [];
  for (let i = 1; i <= 2; i++) teams.push(await (await send(`rooms/${host.pin}/join`, { clientId: randomUUID(), teamSlot: i, name: `T${i}` })).json());
  const hostState = await (await send(`rooms/${host.pin}/state`, undefined, host.hostToken)).json();
  assert.equal(hostState.joinUrl, `${origin}/?battle=7&join=${host.pin}`);
  assert.equal(hostState.projectorUrl, `${origin}/?battle=7&screen=${host.pin}`);
  assert.equal(hostState.joinPath, `/?battle=7&join=${host.pin}`);
  const svg = await send(`rooms/${host.pin}/qr.svg`);
  assert.equal(svg.status, 200);
  assert.match(svg.headers.get('content-type'), /^image\/svg\+xml/);
  assert.match(await svg.text(), /^<svg/);
  const start = await send(`rooms/${host.pin}/action`, { type: 'host:start', requestId: randomUUID() }, host.hostToken);
  assert.equal(start.status, 200);
  const state = await (await send(`rooms/${host.pin}/state`, undefined, teams[0].teamToken)).json();
  assert.equal(state.phase, 'question');
  assert.equal(state.answerKey, undefined);
  assert.equal(state.answerReveal, null);
  assert.equal(state.question.canonicalAnswer, undefined);
  assert.equal(state.question.canonicalTokenOrder, undefined);
  assert.equal(state.hostToken, undefined);
  const publicState = await (await send(`rooms/${host.pin}/state`)).json();
  assert.equal(publicState.role, 'public');
  assert.equal(publicState.me, undefined);
  assert.equal(publicState.settings, undefined);
});

test('API rejects cross-origin writes, malformed JSON objects, wrong content type, and byte-oversized bodies', async () => {
  const { send, db } = setup();
  const cross = await send('rooms', {}, undefined, { origin: 'https://evil.example' });
  assert.equal(cross.status, 403);
  assert.equal((await cross.json()).code, 'CROSS_ORIGIN');
  assert.equal((await send('rooms', {}, undefined, { 'sec-fetch-site': 'cross-site' })).status, 403);
  assert.equal((await send('rooms', {}, undefined, { 'content-type': 'text/plain' })).status, 415);
  assert.equal((await send('rooms', [], undefined)).status, 400);
  assert.equal((await send('rooms', null, undefined)).status, 400);
  assert.equal((await send('rooms', { roomName: '界'.repeat(3000) })).status, 413);
  const malformed = new Request(`${origin}/api/kitchen/rooms`, { method: 'POST', body: '{bad}', headers: { 'content-type': 'application/json', origin, 'cf-connecting-ip': 'bad-json-test' } });
  assert.equal((await handleKitchenRequest(malformed, db, { questions })).status, 400);
  const falseLength = new Request(`${origin}/api/kitchen/rooms`, { method: 'POST', body: '{}', headers: { 'content-type': 'application/json', 'content-length': '9000', 'cf-connecting-ip': 'bad-length-test' } });
  assert.equal((await handleKitchenRequest(falseLength, db, { questions })).status, 413);
});

test('authorization is bearer-only and roles cannot be escalated', async () => {
  const { send } = setup();
  const host = await (await send('rooms', { teamCount: 2 })).json();
  const team = await (await send(`rooms/${host.pin}/join`, { clientId: randomUUID(), name: 'Team', teamSlot: 1 })).json();
  const wrong = await send(`rooms/${host.pin}/state`, undefined, 'f'.repeat(64));
  assert.equal(wrong.status, 401);
  assert.equal((await send(`rooms/${host.pin}/state`, undefined, undefined, { authorization: 'Basic xxx' })).status, 401);
  const action = { type: 'host:close', requestId: randomUUID() };
  assert.equal((await send(`rooms/${host.pin}/action`, action)).status, 401);
  assert.equal((await send(`rooms/${host.pin}/action`, action, team.teamToken)).status, 403);
  const queryToken = await (await send(`rooms/${host.pin}/state?token=${host.hostToken}`)).json();
  assert.equal(queryToken.role, 'public');
  assert.equal((await send(`rooms/${host.pin}/state`, {})).status, 405);
  assert.equal((await send('rooms')).status, 405);
  assert.equal((await send('missing')).status, 404);
});

test('CAS overload and post-commit uncertainty are retriable without inventing a new receipt', async () => {
  const { send, db } = setup();
  const host = await (await send('rooms', { teamCount: 2 })).json();
  for (let i = 1; i <= 2; i++) await send(`rooms/${host.pin}/join`, { clientId: randomUUID(), teamSlot: i, name: `T${i}` });
  const body = { type: 'host:start', requestId: randomUUID() };
  db.forceConflict = true;
  const busy = await send(`rooms/${host.pin}/action`, body, host.hostToken);
  assert.equal(busy.status, 503);
  assert.equal(busy.headers.get('retry-after'), '1');
  assert.equal((await busy.json()).code, 'CONCURRENT_UPDATE');
  db.forceConflict = false;
  db.failAfterCommit = true;
  const uncertain = await send(`rooms/${host.pin}/action`, body, host.hostToken);
  assert.equal(uncertain.status, 500);
  const recovered = await send(`rooms/${host.pin}/action`, body, host.hostToken);
  assert.equal(recovered.status, 200);
  assert.equal((await recovered.json()).replayed, true);
});

test('public and rival cook reveals hide successful and failed ingredient combinations',async()=>{
 const {send,db}=setup();
 const host=await (await send('rooms',{teamCount:2})).json();
 const teams=[];
 for(let i=1;i<=2;i++)teams.push(await(await send(`rooms/${host.pin}/join`,{clientId:randomUUID(),teamSlot:i,name:`Team ${i}`})).json());
 const act=(token,type,extra={})=>{const room=db.room(host.pin);return send(`rooms/${host.pin}/action`,{type,requestId:randomUUID(),questionId:room.questions[room.questionIndex]?.id,expectedPhase:room.phase,...extra},token);};
 await act(host.hostToken,'host:start');await act(host.hostToken,'host:reveal');await act(host.hostToken,'host:advance');
 db.seed(host.pin,r=>Object.assign(r.teams[0].inventory,{Bread:1,Cheese:1,Tomato:1,Chocolate:1,Chicken:1,Mushroom:1}));
 const ingredients=[['Bread','Cheese','Tomato'],['Chocolate','Chicken','Mushroom']];
 for(const items of ingredients){
  const response=await act(teams[0].teamToken,'pupil:cook',{ingredients:items});
  assert.equal(response.status,200);
  assert.deepEqual((await response.json()).result.cook.ingredients,items);
 }
 function assertNoRecipeFields(value){
  if(!value||typeof value!=='object')return;
  for(const [key,child] of Object.entries(value)){
   assert.ok(!['ingredients','recipeKey','key'].includes(key),`unexpected private field ${key}`);
   assertNoRecipeFields(child);
  }
 }
 for(const token of [undefined,teams[1].teamToken]){
  const state=await(await send(`rooms/${host.pin}/state`,undefined,token)).json();
  assert.equal(state.latestCooks.length,2);
  assertNoRecipeFields(state.latestCooks);
  assert.deepEqual(state.latestCooks.map(c=>c.dish.name),['Mini Pizza','Burnt Disaster']);
  assert.deepEqual(state.latestCooks.map(c=>c.dish.success),[true,false]);
  assert.deepEqual(state.latestCooks.map(c=>c.starsEarned),[3,0]);
 }
 for(const token of [host.hostToken,teams[0].teamToken]){
  const state=await(await send(`rooms/${host.pin}/state`,undefined,token)).json();
  assert.deepEqual(state.latestCooks.map(c=>c.ingredients),ingredients);
  assert.deepEqual(state.latestCooks[0].dish.ingredients,['Bread','Cheese','Tomato']);
 }
});

test('all five rebuild HTTP snapshots use opaque presentation IDs and preserve hidden teacher orders',async()=>{
 const {send,db}=setup();
 const host=await(await send('rooms',{teamCount:2})).json();
 const teams=[];
 for(let i=1;i<=2;i++)teams.push(await(await send(`rooms/${host.pin}/join`,{clientId:randomUUID(),teamSlot:i,name:`Team ${i}`})).json());
 await send(`rooms/${host.pin}/action`,{type:'host:start',requestId:randomUUID()},host.hostToken);
 const original=db.room(host.pin).questions;
 const indexes=original.map((q,i)=>q.format==='sentence_rebuild'?i:-1).filter(i=>i>=0);
 assert.equal(indexes.length,5);
 for(const index of indexes){
  db.seed(host.pin,r=>{r.phase='question';r.questionIndex=index;});
  const teacher=await(await send(`rooms/${host.pin}/state`,undefined,host.hostToken)).json();
  for(const token of [undefined,teams[0].teamToken]){
   const state=await(await send(`rooms/${host.pin}/state`,undefined,token)).json();
   assert.equal(state.answerKey,undefined);assert.equal(state.answerReveal,null);
   assert.equal(state.question.canonicalTokenOrder,undefined);assert.equal(state.question.acceptedTokenOrders,undefined);
   assert.ok(state.question.tokens.every(t=>/^[a-f0-9]{24}$/.test(t.id)));
   assert.ok(state.question.tokens.every(t=>!original[index].tokens.some(source=>source.id===t.id)));
   assert.deepEqual(state.question.tokens,teacher.question.tokens);
  }
 }
});
