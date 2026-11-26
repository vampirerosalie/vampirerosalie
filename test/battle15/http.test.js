import test from 'node:test';
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import { randomUUID } from 'node:crypto';
import decodeQR from 'jsqr';
import { handleMenitiRequest } from '../../app/battle15/http.js';
import { QUESTIONS } from '../../app/battle15/questions.js';
import { TestD1 } from '../battle7/d1-helper.js';

const require = createRequire(import.meta.url);
const sharp = createRequire(require.resolve('next/package.json'))('sharp');
const origin = 'https://classroom.example';
async function setup(size = 3) {
  const db = new TestD1();
  const ip = randomUUID();
  let now = 1_000_000;
  const send = (path, body, token) => handleMenitiRequest(new Request(origin + '/api/meniti/' + path, {
    method: body === undefined ? 'GET' : 'POST',
    headers: { origin, 'content-type': 'application/json', 'cf-connecting-ip': ip,
      ...(token ? { authorization: 'Bearer ' + token } : {}) },
    ...(body === undefined ? {} : { body: JSON.stringify(body) }),
  }), db, { now: () => now, sleep: async () => {} });
  const created = await send('rooms', {});
  assert.equal(created.status,201);
  const { pin, hostToken } = await created.json();
  const request = (path, body, token) => send('rooms/' + pin + '/' + path, body, token);
  const data = async (path, body, token) => {
    const response = await request(path,body,token);
    const result = await response.json();
    assert.equal(response.status,200,JSON.stringify(result));
    return result;
  };
  const clients = Array.from({length:size}, (_,i) => ({ clientId:randomUUID(), name:'Pasukan ' + i }));
  const teams = await Promise.all(clients.map(client => data('join',client)));
  const state = key => data('state',undefined,key);
  const saved = () => JSON.parse(db.sqlite.prepare('SELECT state_json FROM meniti_rooms WHERE pin = ?').get(pin).state_json);
  const command = (type, extra={}) => {
    const {questionId,gameId}=saved();
    return {type,requestId:randomUUID(),questionId,gameId,...extra};
  };
  const host = (type,extra) => data('action',command('host:'+type,extra),hostToken);
  const toShop = async () => {
    await host('start');
    for(let i=1;i<=5;i++) {
      await host('close'); await host('reveal');
      if(i<5) await host('next');
    }
    await host('openShop');
  };
  return {db,pin,hostToken,clients,teams,request,data,state,command,host,saved,toShop,tick:ms=>{now+=ms;}};
}

test('QR image decodes to the room join link; twelve simultaneous joins survive new handler instances', async () => {
  const s = await setup(12);
  const expected=origin+'/battle15/index.html?join='+s.pin;
  const qr=await s.request('qr.svg');
  assert.equal(qr.status,200);
  const { data,info }=await sharp(Buffer.from(await qr.text())).resize(450,450).ensureAlpha().raw().toBuffer({resolveWithObject:true});
  assert.equal(decodeQR(new Uint8ClampedArray(data),info.width,info.height)?.data,expected);
  assert.equal((await s.state()).joinUrl,expected);
  assert.equal(new Set(s.teams.map(t=>t.playerId)).size,12);
  assert.equal((await s.state(s.hostToken)).onlineCount,12);
  const overflow=await s.request('join',{clientId:randomUUID(),name:'Tambahan'});
  assert.equal((await overflow.json()).code,'ROOM_FULL');
  await s.host('start');
  for(const [i,client] of s.clients.entries()) {
    const before=await s.state(s.teams[i].playerToken);
    assert.equal(before.me.hand.length,4);
    assert.equal(before.me.name,client.name);
    assert.deepEqual(await s.data('join',client),s.teams[i]);
    const after=await s.state(s.teams[i].playerToken);
    assert.deepEqual(after.me.hand,before.me.hand);
  }
});

test('start and next atomically deal once, including retries through separate Worker instances', async () => {
  const s = await setup(3);
  for (const [index, type] of ['host:start', 'host:next'].entries()) {
    const action = s.command(type);
    const results = await Promise.all([1, 2].map(() => s.data('action', action, s.hostToken)));
    assert.equal(results.filter(r => r.replayed).length, 1);
    assert.ok(results.every(r => r.state.phase === 'answering' && r.state.questionId === index + 1 && r.state.deadline === null));
    const saved = s.saved();
    const hands = await Promise.all(s.teams.map(async player => (await s.state(player.playerToken)).me.hand));
    for (const [i, team] of s.teams.entries()) {
      assert.equal(hands[i].length, 4);
      assert.deepEqual(hands[i].map(card => card.id), saved.rounds[index + 1].seats[team.playerId].hand.map(card => card.id));
    }
    // A cached teacher tab can still send the old command after receiving this question.
    await s.host('deal');
    assert.deepEqual(s.saved(), saved);
    await s.host('reveal');
  }
});

test('concurrent phone refreshes open an older saved question and receive the same persisted deal', async () => {
  const s = await setup(2);
  await s.host('start');
  const previous = s.saved();
  previous.phase = 'question';
  for (const seat of Object.values(previous.rounds[1].seats)) seat.hand = [];
  s.db.sqlite.prepare('UPDATE meniti_rooms SET state_json = ? WHERE pin = ?').run(JSON.stringify(previous), s.pin);
  const a = s.teams[0].playerToken, b = s.teams[1].playerToken;
  const [first, other, reconnect] = await Promise.all([s.state(a), s.state(b), s.state(a)]);
  assert.deepEqual(first.me.hand, reconnect.me.hand);
  for (const state of [first, other, reconnect]) {
    assert.equal(state.phase, 'answering');
    assert.equal(state.me.hand.length, 4);
    assert.equal(state.me.balance, 10);
  }
  assert.equal(s.saved().version, previous.version + 1);
});

test('simultaneous submissions, lost acknowledgements, concurrent timeout checks and phase/reset guards', async () => {
  const s=await setup();
  const [a,b]=s.teams.map(t=>t.playerToken);
  await s.host('start');
  const q=QUESTIONS[0];
  const caption=q.options.find(o=>o.id===q.correctId).caption;
  const hand=(await s.state(a)).me.hand;
  const cardId=hand.find(c=>c.caption===caption).id;
  const play=s.command('student:submit',{cardId,wager:3});
  const retries=await Promise.all([s.data('action',play,a),s.data('action',play,a)]);
  assert.equal(retries.filter(r=>r.replayed).length,1);
  const alternate=await s.request('action',{...play,requestId:randomUUID(),wager:1},a);
  assert.equal((await alternate.json()).code,'ALREADY_SUBMITTED');
  const changed=await s.request('action',{...play,wager:2},a);
  assert.equal((await changed.json()).code,'RECEIPT_CONFLICT');
  const foreignCard=await s.request('action',{...play,requestId:randomUUID()},b);
  assert.equal((await foreignCard.json()).code,'INVALID_PLAY');
  assert.equal((await s.request('action',s.command('host:reset',{confirm:true}),a)).status,403);
  assert.equal((await s.request('review?questionId=1',undefined,a)).status,403);
  assert.equal((await s.state()).me,undefined);
  await s.host('countdown');
  s.tick(9999);
  assert.equal((await s.data('review?questionId=1',undefined,s.hostToken)).live,true);
  assert.equal(s.saved().rounds[1].settled,false);
  s.tick(1);
  const closing=await Promise.all([s.state(),s.state(a),s.state(b),s.state(s.hostToken),s.data('review?questionId=1',undefined,s.hostToken)]);
  assert.ok(closing.slice(0,4).every(v=>v.phase==='closed'&&v.reveal===null));
  assert.equal(closing[4].settled,true);
  assert.equal(closing[4].live,false);
  assert.deepEqual(closing[4].entries.map(e=>e.delta).sort((x,y)=>y-x),[3,-1,-1]);
  assert.equal(s.saved().players.find(p=>p.id===s.teams[0].playerId).balance,13);
  await s.host('reveal');
  const oldGame=s.saved().gameId;
  const oldPlay={...play,requestId:randomUUID()};
  await s.host('next');
  assert.equal((await (await s.request('action',oldPlay,a)).json()).code,'STALE_ROUND');
  const reset=s.command('host:reset',{confirm:true});
  await s.data('action',reset,s.hostToken);
  assert.equal((await s.data('action',reset,s.hostToken)).replayed,true);
  assert.notEqual(s.saved().gameId,oldGame);
  assert.equal((await s.state(a)).me.balance,10);
  assert.equal((await (await s.request('action',oldPlay,a)).json()).code,'STALE_ROUND');
  assert.deepEqual(s.saved().rounds,{});
});

test('only the host sees choosing or submitted status; duplicate and racing requests converge after reconnect', async () => {
  const s = await setup(3);
  const [a,b,c] = s.teams;
  await s.host('start');
  const choosing = s.command('student:choosing');
  const roster = async () => (await s.state(s.hostToken)).players;
  const status = (rows, team) => rows.find(row => row.id === team.playerId).answerStatus;
  assert.equal((await s.request('action', choosing)).status, 401);
  assert.equal((await s.request('action', choosing, s.hostToken)).status, 403);
  await Promise.all([s.data('action', choosing, a.playerToken), s.data('action', choosing, a.playerToken)]);
  await s.data('join', s.clients[0]);
  assert.equal(status(await roster(), a), 'choosing');
  const version = s.saved().version;
  await s.data('action', s.command('student:choosing'), a.playerToken);
  assert.equal(s.saved().version, version);

  const hand = (await s.state(b.playerToken)).me.hand;
  const play = s.command('student:submit', { cardId: hand[0].id, wager: 2 });
  await Promise.all([s.data('action', play, b.playerToken),
    s.data('action', s.command('student:choosing'), b.playerToken)]);
  const rows = await roster();
  assert.deepEqual(s.teams.map(team => status(rows, team)), ['choosing', 'submitted', 'waiting']);
  assert.ok(rows.every(row => row.balance === 10));
  for (const state of [await s.state(), await s.state(c.playerToken)]) {
    assert.equal(state.submittedCount, 1);
    assert.ok(state.players.every(row => !Object.hasOwn(row, 'answerStatus')));
    assert.ok(!JSON.stringify(state).includes('choosing'));
  }
  await s.host('countdown');
  s.tick(10000);
  await s.data('action', s.command('student:choosing'), c.playerToken);
  assert.equal(s.saved().phase, 'closed');
  const closed = await roster();
  assert.deepEqual(s.teams.map(team => status(closed, team)), ['unanswered','submitted','unanswered']);
  await s.host('reveal');
  await s.host('next');
  const stale = { ...choosing, requestId: randomUUID() };
  assert.equal((await (await s.request('action', stale, a.playerToken)).json()).code, 'STALE_ROUND');
  assert.ok((await roster()).every(row => row.answerStatus === 'waiting'));
});

test('live review stays private and read-only; concurrent reveal confirmations settle the active round once', async () => {
  const s = await setup(3);
  const [first, second] = s.teams.map(team => team.playerToken);
  const q = QUESTIONS[0];
  const answer = q.options.find(option => option.id === q.correctId);
  await s.host('start');
  const team = await s.state(first);
  const cardId = team.me.hand.find(card => card.caption === answer.caption).id;
  await s.data('action', s.command('student:submit', { cardId, wager: 3 }), first);

  const saved = s.saved();
  const reviewPath = 'review?questionId=1';
  const [response, publicReview, studentReview, secondView] = await Promise.all([
    s.request(reviewPath, undefined, s.hostToken),
    s.request(reviewPath), s.request(reviewPath, undefined, second), s.state(second),
  ]);
  assert.equal(response.status, 200);
  assert.match(response.headers.get('cache-control'), /no-store/);
  const live = await response.json();
  assert.equal(live.live, true);
  assert.equal(live.pending, 2);
  assert.ok(live.entries.every(entry => entry.delta === null));
  for (const forbidden of [publicReview, studentReview]) {
    assert.equal(forbidden.status, 403);
    assert.equal((await forbidden.json()).entries, undefined);
  }
  assert.equal(secondView.reveal, null);
  assert.equal(secondView.me.result, null);
  assert.deepEqual(s.saved(), saved);

  const confirm = s.command('host:reveal');
  const otherConfirmation = s.command('host:reveal');
  const results = await Promise.all([
    s.data('action', confirm, s.hostToken), s.data('action', confirm, s.hostToken),
    s.data('action', otherConfirmation, s.hostToken),
  ]);
  assert.equal(results.filter(result => result.replayed).length, 1);
  assert.ok(results.every(result => result.state.phase === 'reveal' && result.state.reveal.caption === answer.caption));
  const report = await s.data(reviewPath, undefined, s.hostToken);
  assert.equal(report.settled, true);
  assert.equal(report.pending, 0);
  assert.deepEqual(report.entries.map(entry => entry.delta).sort((a,b) => b-a), [3, -1, -1]);
  for (const p of s.saved().players) {
    assert.equal(p.correct + p.incorrect + p.unanswered, 1);
    assert.equal(p.balance, p.id === team.me.id ? 13 : 9);
  }
  const latePlay = s.command('student:submit', { cardId: secondView.me.hand[0].id, wager: 1 });
  assert.equal((await (await s.request('action', latePlay, second)).json()).code, 'WRONG_PHASE');
  await s.host('next');
  assert.deepEqual(await s.data(reviewPath, undefined, s.hostToken), report);
});

test('competing attacks atomically reserve a target; loser can buy elsewhere, duplicate purchases cannot spend twice', async () => {
  const s=await setup(4);
  await s.toShop();
  const target=s.teams[2].playerId;
  const buy=i=>s.command('student:buy',{card:i===0?'extra':'flash',targetId:target});
  const orders=[buy(0),buy(1)];
  const competing=await Promise.all(orders.map((body,i)=>s.request('action',body,s.teams[i].playerToken)));
  const winner=competing.findIndex(r=>r.status===200), loser=1-winner;
  assert.ok(winner===0||winner===1);
  assert.equal((await competing[loser].json()).code,'TARGET_TAKEN');
  const before=(await s.state(s.teams[winner].playerToken)).me.balance;
  assert.equal((await s.data('action',orders[winner],s.teams[winner].playerToken)).replayed,true);
  assert.equal((await s.state(s.teams[winner].playerToken)).me.balance,before);
  assert.equal((await s.state(s.teams[loser].playerToken)).me.balance,5);
  const retry=s.command('student:buy',{card:'extra',targetId:s.teams[3].playerId});
  await s.data('action',retry,s.teams[loser].playerToken);
  const late=s.command('student:buy',{card:'shield'});
  await s.host('closeShop'); await s.host('next');
  assert.equal((await (await s.request('action',late,s.teams[2].playerToken)).json()).code,'STALE_ROUND');
  const four=s.teams[loser].playerToken, five=s.teams[3].playerToken;
  const hand=(await s.state(five)).me.hand;
  assert.equal(hand.length,5);
  assert.equal((await s.state(four)).me.hand.length,4);
  assert.deepEqual((await s.state(five)).me.hand,hand);
  assert.ok(hand.every(c=>Object.keys(c).sort().join(',')==='art,caption,id'));
});
