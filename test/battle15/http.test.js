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
      await host('deal'); await host('close'); await host('reveal');
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
  await s.host('start'); await s.host('deal');
  for(const [i,client] of s.clients.entries()) {
    const before=await s.state(s.teams[i].playerToken);
    assert.equal(before.me.name,client.name);
    assert.deepEqual(await s.data('join',client),s.teams[i]);
    const after=await s.state(s.teams[i].playerToken);
    assert.deepEqual(after.me.hand,before.me.hand);
  }
});

test('simultaneous submissions, lost acknowledgements, concurrent timeout checks and phase/reset guards', async () => {
  const s=await setup();
  const [a,b]=s.teams.map(t=>t.playerToken);
  await s.host('start'); await s.host('deal');
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
  await s.host('countdown',{seconds:10});
  s.tick(10000);
  const closing=await Promise.all([s.state(),s.state(a),s.state(b),s.state(s.hostToken),s.data('review?questionId=1',undefined,s.hostToken)]);
  assert.ok(closing.slice(0,4).every(v=>v.phase==='closed'&&v.reveal===null));
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
  await s.host('closeShop'); await s.host('next'); await s.host('deal');
  assert.equal((await (await s.request('action',late,s.teams[2].playerToken)).json()).code,'STALE_ROUND');
  const four=s.teams[loser].playerToken, five=s.teams[3].playerToken;
  const hand=(await s.state(five)).me.hand;
  assert.equal(hand.length,5);
  assert.equal((await s.state(four)).me.hand.length,4);
  assert.deepEqual((await s.state(five)).me.hand,hand);
  assert.ok(hand.every(c=>Object.keys(c).sort().join(',')==='art,caption,id'));
});
