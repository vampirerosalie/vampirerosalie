import test from 'node:test';
import assert from 'node:assert/strict';
import {randomUUID} from 'node:crypto';
import {DatabaseSync} from 'node:sqlite';
import {setImmediate} from 'node:timers/promises';
import {TerritoryD1Store} from '../../app/battle13/d1-store.js';
import {handleTerritoryRequest} from '../../app/battle13/http.js';
import {SETS,mark,normalize} from '../../app/battle13/sets.js';
import {MAP} from '../../public/battle13/map-data.js';
const BANK=SETS['science-f1-ch6'];
const MYSTERIES=MAP.filter(t=>t.kind==='mystery'),LANDS=MAP.filter(t=>t.kind==='regular');
class D1{
  constructor(){this.sql=new DatabaseSync(':memory:');this.conflicts=0;this.loseResponse=false;}
  prepare(sql){let args=[];const s={bind:(...a)=>{args=a;return s;},first:async()=>{await setImmediate();return this.sql.prepare(sql).get(...args)??null;},all:async()=>{await setImmediate();return {results:this.sql.prepare(sql).all(...args)};},run:async()=>{await setImmediate();const r=this.sql.prepare(sql).run(...args);if(sql.includes('UPDATE territory_rooms')){if(!r.changes)this.conflicts++;else if(this.loseResponse){this.loseResponse=false;throw Error('Response lost after commit');}}return {meta:{changes:Number(r.changes)}};}};return s;}
  async batch(statements){this.sql.exec('BEGIN');try{const out=[];for(const s of statements)out.push(await s.run());this.sql.exec('COMMIT');return out;}catch(e){this.sql.exec('ROLLBACK');throw e;}}
  room(pin){return JSON.parse(this.sql.prepare('SELECT state_json FROM territory_rooms WHERE pin=?').get(pin).state_json);}
  fixture(pin,fn){const r=this.room(pin);fn(r);this.sql.prepare('UPDATE territory_rooms SET state_json=? WHERE pin=?').run(JSON.stringify(r),pin);}
}
// Existing mechanics regression cases also cover rooms created before adaptive boards.
// Adaptive-board cases below opt in explicitly and exercise the new create/start path.
async function setup(n=2,random,adaptive=false){const db=new D1();let now=100000;const options={now:()=>now,sleep:async()=>{},...(random?{random}:{})},store=()=>new TerritoryD1Store(db,options),host=await store().create();if(!adaptive)db.fixture(host.pin,r=>delete r.boardRules);const clients=Array.from({length:n},(_,i)=>({clientId:randomUUID(),name:'TEST '+(i+1)}));const players=await Promise.all(clients.map(c=>store().join(host.pin,c)));const act=(token,type,extra={},requestId=randomUUID())=>store().action(host.pin,token,{type,requestId,...extra});const view=t=>store().state(host.pin,t);return {db,options,store,host,clients,players,act,view,tick:ms=>now+=ms,fixture:fn=>db.fixture(host.pin,fn)};}
async function start(s){await s.act(s.host.hostToken,'host:start');}
test('adaptive boards: exact counts for 2–12 teams, stable IDs, Crown/mysteries never blocked',async()=>{
  for(let n=2;n<=12;n++){
    const s=await setup(n,undefined,true);let v=await s.view(s.host.hostToken);
    assert.equal(v.boardRules,1);assert.equal(v.board,null);assert.ok(v.tiles.every(t=>!t.blocked));
    await start(s);v=await s.view(s.host.hostToken);const claimable=Math.min(112,n*10);
    assert.deepEqual(v.board,{teamsAtStart:n,claimable,mysteries:8,blocked:112-claimable});
    assert.deepEqual(v.tiles.map(t=>[t.id,t.kind,t.q,t.r]),MAP.map(t=>[t.id,t.kind,t.q,t.r]));
    assert.equal(v.tiles.filter(t=>!t.blocked&&t.kind!=='mystery').length,claimable);
    assert.equal(v.tiles.filter(t=>t.blocked).length,112-claimable);
    assert.ok(v.tiles.filter(t=>t.kind!=='regular').every(t=>!t.blocked));
    const distance=t=>t.q*t.q+t.q*t.r+t.r*t.r;
    const blocked=v.tiles.filter(t=>t.blocked),active=v.tiles.filter(t=>!t.blocked&&t.kind==='regular');
    if(blocked.length)assert.ok(Math.min(...blocked.map(distance))>=Math.max(...active.map(distance)),'only outer ordinary spaces blocked');
  }
});
test('adaptive mask persists across duplicate/concurrent start, late joins, disconnected teams, refresh and end',async()=>{
  const s=await setup(7,undefined,true),id=randomUUID();
  const results=await Promise.all([s.act(s.host.hostToken,'host:start',{},id),s.act(s.host.hostToken,'host:start',{},id)]);
  assert.equal(results.filter(r=>r.replayed).length,1);
  const initial=await s.view(s.host.hostToken),mask=initial.tiles.map(t=>[t.id,t.blocked]);
  s.tick(30000);assert.equal((await s.view(s.host.hostToken)).onlineCount,0);
  const late=await s.store().join(s.host.pin,{clientId:randomUUID(),name:'Late team'});
  assert.deepEqual(await s.store().join(s.host.pin,s.clients[0]),s.players[0]);
  for(const token of [late.playerToken,s.players[0].playerToken,s.host.hostToken]){
    const v=await s.store().state(s.host.pin,token);assert.deepEqual(v.board,initial.board);assert.deepEqual(v.tiles.map(t=>[t.id,t.blocked]),mask);
  }
  await assert.rejects(start(s),/already started/);
  await s.act(s.host.hostToken,'host:end',{confirm:true});assert.deepEqual((await s.view(s.host.hostToken)).tiles.map(t=>[t.id,t.blocked]),mask);
});
test('all blocked-space actions reject atomically without spending Actions/cards or making receipts',async()=>{
  const s=await setup(7,undefined,true);await start(s);s.fixture(r=>{r.players[0].balance=25;r.players[0].cards=['shield','rebellion'];});
  const before=s.db.room(s.host.pin),tile=before.tiles.find(t=>t.blocked);
  const attempts=await Promise.allSettled(['claim','explore','fortify','shield','rebellion'].map(type=>action(s,0,'student:'+type,tile.id)));
  assert.ok(attempts.every(a=>a.status==='rejected'&&a.reason.code==='BLOCKED_TERRITORY'));
  assert.deepEqual(s.db.room(s.host.pin),before);
});
test('adaptive board supports normal claim/capture, Crown bonus, private Shield and all eight mysteries',async()=>{
  const s=await setup(7,max=>0,true);await start(s);s.fixture(r=>r.players.forEach(p=>p.balance=25));
  const v=await s.view(s.players[0].playerToken),land=v.tiles.find(t=>!t.blocked&&t.kind==='regular'),crown=v.tiles.find(t=>t.kind==='crown');
  await action(s,0,'student:claim',land.id);await action(s,1,'student:claim',land.id);
  assert.equal((await s.view(s.players[1].playerToken)).me.actions,23);
  for(const tile of v.tiles.filter(t=>t.kind==='mystery'))await action(s,0,'student:explore',tile.id);
  await action(s,0,'student:claim',crown.id);await action(s,0,'student:shield',crown.id);
  assert.equal((await s.view(s.players[0].playerToken)).tiles.find(t=>t.id===crown.id).shield,true);
  assert.equal((await s.view(s.players[1].playerToken)).tiles.find(t=>t.id===crown.id).shield,false);
  assert.equal((await s.view(s.players[0].playerToken)).me.explored.length,8);
  await s.act(s.host.hostToken,'host:end',{confirm:true});
  const result=(await s.view(s.host.hostToken)).results.find(p=>p.id===s.players[0].playerId);
  assert.equal(result.territories,1);assert.equal(result.score,4);
});
test('existing rooms without boardRules keep all 120 positions open and independent rooms have independent masks',async()=>{
  const legacy=await setup(7);await start(legacy);assert.equal((await legacy.view(legacy.host.hostToken)).board,null);assert.ok((await legacy.view(legacy.host.hostToken)).tiles.every(t=>!t.blocked));
  const a=await setup(7,undefined,true),b=await setup(11,undefined,true);await start(a);await start(b);
  assert.equal((await a.view(a.host.hostToken)).board.blocked,42);assert.equal((await b.view(b.host.hostToken)).board.blocked,2);
  await a.act(a.host.hostToken,'host:end',{confirm:true});assert.equal((await b.view(b.host.hostToken)).phase,'active');
});
async function submit(s,i=0,answer='C'){const q=(await s.view(s.players[i].playerToken)).question;return s.act(s.players[i].playerToken,'student:submit',{questionId:q.id,answer});}
async function finalize(s){const v=await s.view(s.host.hostToken);return s.act(s.host.hostToken,'host:finalize-all',{questionId:v.question.id,reviewVersion:v.reviewVersion});}
async function action(s,i,type,tileId,extra={},id){const v=await s.view(s.players[i].playerToken),t=v.tiles.find(t=>t.id===tileId);return s.act(s.players[i].playerToken,type,{tileId,tileVersion:t.version,expectedVersion:v.me.actionVersion,...extra},id);}
async function http(s,path,token,body){return handleTerritoryRequest(new Request('https://example.test/api/territory/'+path,{method:body?'POST':'GET',headers:{...(token?{authorization:'Bearer '+token}:{}),...(body?{'content-type':'application/json'}:{})},...(body?{body:JSON.stringify(body)}:{})}),s.db,s.options);}

test('exactly 25 questions, A–D key and every approved short-answer variant',()=>{assert.equal(BANK.questions.length,25);assert.equal(BANK.questions.slice(0,12).map(q=>q.answer).join(''),'CABDACDACBDB');for(const q of BANK.questions){assert.equal(q.id,`q${String(q.number).padStart(2,'0')}`);for(const answer of q.variants){assert.equal(mark(q,answer),true);if(q.type==='short'){assert.equal(mark(q,'  '+answer.toUpperCase()+'!  '),true);assert.equal(mark(q,answer.replaceAll(' ','   ')),true);assert.equal(mark(q,answer+' or anything'),false);}}}assert.equal(mark(BANK.questions[12],'+'),true);assert.equal(mark(BANK.questions[12],'+1'),true);assert.equal(mark(BANK.questions[12],'1'),false);assert.equal(mark(BANK.questions[13],'-'),false);assert.equal(mark(BANK.questions[17],'iron rod'),false);assert.equal(normalize(' Carbon,  hydrogen. '),'carbon,hydrogen');});
test('fixed map: 120 stable IDs, 111 regular, eight mysteries, one central Crown',()=>{assert.equal(MAP.length,120);assert.equal(new Set(MAP.map(t=>t.id)).size,120);assert.equal(MAP.filter(t=>t.kind==='regular').length,111);assert.equal(MAP.filter(t=>t.kind==='mystery').length,8);assert.deepEqual(MAP.filter(t=>t.kind==='crown').map(t=>[t.q,t.r]),[[0,0]]);});
test('12 concurrent teams, distinct colours, reconnection identity and isolated rooms',async()=>{const s=await setup(12);assert.equal(s.db.room(s.host.pin).players.length,12);assert.equal(new Set(s.db.room(s.host.pin).players.map(p=>p.color)).size,12);assert.ok(s.db.conflicts>0);assert.deepEqual(await Promise.all(s.clients.map(c=>s.store().join(s.host.pin,c))),s.players);await assert.rejects(s.store().join(s.host.pin,{clientId:randomUUID(),name:'thirteen'}),/12/);const other=await s.store().create();assert.equal((await s.store().state(other.pin,other.hostToken)).joinedCount,0);await assert.rejects(s.store().state(other.pin,s.players[0].playerToken),/not valid/);});
test('12 simultaneous answers, mixed automatic marking and finalise-once rewards',async()=>{const s=await setup(12);await start(s);await Promise.all(s.players.map((_,i)=>submit(s,i,i%2?'A':'C')));assert.equal((await s.view(s.players[0].playerToken)).me.actions,0);const loaded=await s.store().load(s.host.pin),review=loaded.game.review(s.host.pin,s.host.hostToken);assert.equal(review.entries.filter(e=>e.response.auto).length,6);await finalize(s);await finalize(s);const room=s.db.room(s.host.pin);assert.equal(room.players.reduce((n,p)=>n+p.balance,0),6);assert.equal(room.players.reduce((n,p)=>n+p.science,0),6);});
test('automatic rejection can be accepted; automatic acceptance can be marked wrong',async()=>{const s=await setup();await start(s);await submit(s,0,'A');await submit(s,1,'C');for(const [i,decision]of [[0,'accept'],[1,'reject']]){const v=await s.view(s.host.hostToken);await s.act(s.host.hostToken,'host:decision',{questionId:'q01',playerId:s.players[i].playerId,decision,reviewVersion:v.reviewVersion});}await finalize(s);assert.equal((await s.view(s.players[0].playerToken)).me.science,1);assert.equal((await s.view(s.players[1].playerToken)).me.science,0);});
test('individual finalise, stale review protection, unanswered distinct and explicit reveal',async()=>{const s=await setup();await start(s);await submit(s);const v=await s.view(s.host.hostToken);await s.act(s.host.hostToken,'host:finalize-one',{questionId:'q01',playerId:s.players[0].playerId,reviewVersion:v.reviewVersion});assert.equal((await s.view(s.players[0].playerToken)).me.actions,1);await assert.rejects(s.act(s.host.hostToken,'host:finalize-all',{questionId:'q01',reviewVersion:v.reviewVersion}),/changed/);await finalize(s);let student=await s.view(s.players[1].playerToken);assert.ok(student.me.response.unanswered);assert.equal(student.revealed,undefined);await s.act(s.host.hostToken,'host:reveal',{questionId:'q01'});student=await s.view(s.players[1].playerToken);assert.equal(student.revealed.answer,'C');await s.act(s.host.hostToken,'host:next',{questionId:'q01'});assert.equal((await s.view(s.players[0].playerToken)).question.id,'q02');});
test('mark amendment creates repayable action debt without reversing land; no duplicate award',async()=>{const s=await setup();await start(s);await submit(s);await finalize(s);const tile=MAP.find(t=>t.kind==='regular').id;await action(s,0,'student:claim',tile);const v=await s.view(s.host.hostToken);await assert.rejects(s.act(s.host.hostToken,'host:decision',{questionId:'q01',playerId:s.players[0].playerId,decision:'reject',reviewVersion:v.reviewVersion}),/Confirm/);await s.act(s.host.hostToken,'host:decision',{questionId:'q01',playerId:s.players[0].playerId,decision:'reject',amend:true,reviewVersion:v.reviewVersion});let m=(await s.view(s.players[0].playerToken)).me;assert.equal(m.actions,0);assert.equal(m.debt,1);assert.equal(m.territories,1);assert.equal(m.science,0);await s.act(s.host.hostToken,'host:next',{questionId:'q01'});await submit(s,0,'A');await finalize(s);m=(await s.view(s.players[0].playerToken)).me;assert.equal(m.actions,0);assert.equal(m.debt,0);assert.equal(m.science,1);});
test('server countdown closes after exactly 10 seconds; writing expires and refresh cannot reset',async()=>{const s=await setup();await start(s);await s.act(s.players[0].playerToken,'student:writing',{questionId:'q01'});assert.equal((await s.view(s.host.hostToken)).players.find(p=>p.id===s.players[0].playerId).answerStatus,'Writing');await s.act(s.host.hostToken,'host:countdown',{questionId:'q01'});const deadline=(await s.view(s.host.hostToken)).deadline;s.tick(9000);await s.act(s.host.hostToken,'host:countdown',{questionId:'q01'});assert.equal((await s.view(s.players[0].playerToken)).deadline,deadline);assert.equal((await s.view(s.host.hostToken)).players.find(p=>p.id===s.players[0].playerId).answerStatus,'Waiting');s.tick(1000);await assert.rejects(submit(s),/closed/);});
test('claim 1, capture anywhere 2, fortify 2, atomic fortified capture 3',async()=>{const s=await setup(3);await start(s);s.fixture(r=>r.players.forEach(p=>p.balance=20));const tile=MAP.find(t=>t.kind==='regular').id;await action(s,0,'student:claim',tile);await action(s,1,'student:claim',tile);assert.equal((await s.view(s.players[1].playerToken)).me.actions,18);await action(s,1,'student:fortify',tile);assert.equal((await s.view(s.players[1].playerToken)).me.actions,16);const a=await s.view(s.players[0].playerToken),b=await s.view(s.players[2].playerToken),version=a.tiles.find(t=>t.id===tile).version;const outcomes=await Promise.allSettled([s.act(s.players[0].playerToken,'student:claim',{tileId:tile,tileVersion:version,expectedVersion:a.me.actionVersion}),s.act(s.players[2].playerToken,'student:claim',{tileId:tile,tileVersion:version,expectedVersion:b.me.actionVersion})]);assert.equal(outcomes.filter(r=>r.status==='fulfilled').length,1);const room=s.db.room(s.host.pin),t=room.tiles.find(t=>t.id===tile);assert.equal(t.fortress,false);assert.equal(room.players.reduce((n,p)=>n+p.balance,0),52);assert.equal(room.tiles.filter(t=>t.fortress).length,0);});
test('three concurrent neutral claims: one owner and only one debit',async()=>{const s=await setup(3);await start(s);s.fixture(r=>r.players.forEach(p=>p.balance=5));const tile=MAP.find(t=>t.kind==='regular').id;const outcomes=await Promise.allSettled(s.players.map(p=>s.act(p.playerToken,'student:claim',{tileId:tile,tileVersion:0,expectedVersion:0})));assert.equal(outcomes.filter(r=>r.status==='fulfilled').length,1);assert.equal(s.db.room(s.host.pin).players.reduce((n,p)=>n+p.balance,0),14);});
test('maximum three Fortresses, lost Fortress frees count and Crown may be fortified',async()=>{const s=await setup();await start(s);s.fixture(r=>r.players.forEach(p=>p.balance=20));const ids=['hex:0:0',...MAP.filter(t=>t.kind==='regular').slice(0,3).map(t=>t.id)];for(const id of ids)await action(s,0,'student:claim',id);for(const id of ids.slice(0,3))await action(s,0,'student:fortify',id);await assert.rejects(action(s,0,'student:fortify',ids[3]),/three/);await action(s,1,'student:claim',ids[0]);await action(s,0,'student:fortify',ids[3]);assert.equal((await s.view(s.players[0].playerToken)).me.fortresses,3);});
test('legacy rooms retain original mystery probabilities and once-per-room resolution',async()=>{for(const roll of [0,39,40,74,75,99]){const s=await setup(2,max=>max===100?roll:0);s.fixture(r=>delete r.mysteryRules);await start(s);s.fixture(r=>r.players.forEach(p=>p.balance=5));const tile=MAP.find(t=>t.kind==='mystery').id;await action(s,0,'student:claim',tile);const r=s.db.room(s.host.pin);assert.equal(r.tiles.find(t=>t.id===tile).resolved,true);assert.equal(r.players[0].balance,roll<40?5:4);assert.equal(r.players[0].cards.length,roll>=40&&roll<75?1:0);assert.equal(r.tiles.find(t=>t.id===tile).owner,roll>=75?null:s.players[0].playerId);await action(s,1,'student:claim',tile);assert.equal(s.db.room(s.host.pin).players[1].cards.length,0);assert.equal(s.db.room(s.host.pin).tiles.find(t=>t.id===tile).owner,s.players[1].playerId);}});
test('Shield blocks capture without spending AP; Rebellion neutralises only eligible land',async()=>{const s=await setup();await start(s);s.fixture(r=>{r.players.forEach(p=>p.balance=12);r.players[0].cards=['shield','shield'];r.players[1].cards=['rebellion','rebellion'];});const tile=MAP.find(t=>t.kind==='regular').id;await action(s,0,'student:claim',tile);await action(s,0,'student:shield',tile);await action(s,1,'student:claim',tile);assert.equal((await s.view(s.players[1].playerToken)).me.actions,12);await action(s,0,'student:shield',tile);await action(s,1,'student:rebellion',tile);assert.equal(s.db.room(s.host.pin).tiles.find(t=>t.id===tile).owner,s.players[0].playerId);assert.equal((await s.view(s.players[1].playerToken)).me.cards.length,1);await action(s,0,'student:fortify',tile);await assert.rejects(action(s,1,'student:rebellion',tile),/without a Fortress/);assert.equal((await s.view(s.players[1].playerToken)).me.cards.length,1);const tile2=MAP.filter(t=>t.kind==='regular')[1].id;await action(s,0,'student:claim',tile2);await action(s,1,'student:rebellion',tile2);assert.equal(s.db.room(s.host.pin).tiles.find(t=>t.id===tile2).owner,null);});
test('Crown only gets +3 at End Game; Science breaks ties, equal results share rank',async()=>{const s=await setup(3);await start(s);s.fixture(r=>{r.players[0].science=10;r.players[1].science=8;r.players[2].science=8;const reg=r.tiles.filter(t=>t.kind==='regular');reg.slice(0,4).forEach(t=>t.owner=r.players[0].id);reg.slice(4,8).forEach(t=>t.owner=r.players[1].id);r.tiles.find(t=>t.kind==='crown').owner=r.players[2].id;});const live=await s.view(s.host.hostToken);assert.equal(live.players.find(p=>p.crown).score,1);await s.act(s.host.hostToken,'host:end',{confirm:true});const end=await s.view(s.host.hostToken);assert.deepEqual(end.results.map(p=>p.score),[4,4,4]);assert.deepEqual(end.results.map(p=>p.rank),[1,2,2]);assert.equal(end.results[0].science,10);});
test('idempotency survives lost response, stale resources and repeated ending',async()=>{const s=await setup();await start(s);s.fixture(r=>r.players[0].balance=5);const tile=MAP.find(t=>t.kind==='regular').id,body={tileId:tile,tileVersion:0,expectedVersion:0},id=randomUUID();s.db.loseResponse=true;await assert.rejects(s.act(s.players[0].playerToken,'student:claim',body,id),/Response lost/);const replay=await s.act(s.players[0].playerToken,'student:claim',body,id);assert.equal(replay.replayed,true);assert.equal(replay.state.me.actions,4);await assert.rejects(s.act(s.players[0].playerToken,'student:claim',body),/changed/);await assert.rejects(s.act(s.players[0].playerToken,'student:fortify',body,id),/reused/);await s.act(s.host.hostToken,'host:end',{confirm:true});const r=await s.view(s.host.hostToken);s.tick(1000);await s.act(s.host.hostToken,'host:end',{confirm:true});assert.deepEqual((await s.view(s.host.hostToken)).results,r.results);assert.equal((await s.view(s.host.hostToken)).endedAt,r.endedAt);assert.deepEqual(await s.store().join(s.host.pin,s.clients[0]),s.players[0]);for(const type of ['student:claim','student:submit','student:shield'])await assert.rejects(s.act(s.players[0].playerToken,type),/ended/);});
test('pause only blocks map actions; answer submissions/marking still work',async()=>{const s=await setup();await start(s);await s.act(s.host.hostToken,'host:pause',{paused:true});await submit(s);await finalize(s);await assert.rejects(action(s,0,'student:claim',MAP[0].id),/paused/);await s.act(s.host.hostToken,'host:pause',{paused:false});await action(s,0,'student:claim',MAP[0].id);});
test('HTTP role gates, safe joining QR, hidden keys, public state and default teacher privacy',async()=>{const s=await setup();await start(s);await submit(s,0,'C');const p='rooms/'+s.host.pin;for(const token of ['',s.players[0].playerToken]){assert.equal((await http(s,p+'/review',token)).status,403);for(const type of ['host:start','host:decision','host:finalize-all','host:next','host:end','host:set','host:team'])assert.ok([401,403].includes((await http(s,p+'/action',token,{type,requestId:randomUUID()})).status));}for(const token of ['',s.players[0].playerToken,s.host.hostToken]){const state=await(await http(s,p+'/state',token)).json();const raw=JSON.stringify(state);assert.ok(!raw.includes('variants'));assert.ok(!raw.includes('explanation'));assert.ok(!raw.includes('tokenHash'));if(token===s.host.hostToken)assert.ok(!raw.includes('"answer":"C"'));}const qr=await http(s,p+'/qr.svg');assert.equal(qr.status,200);assert.match(await qr.text(),/<svg/);const student=await(await http(s,p+'/state',s.players[0].playerToken)).json();assert.match(student.joinUrl,new RegExp('/battle13/index.html\\?join='+s.host.pin));assert.ok(!student.joinUrl.includes('host'));const catalogs=await(await http(s,'sets')).json();assert.equal(catalogs.sets.length,1);assert.ok(!JSON.stringify(catalogs).includes('answer'));});
test('team name/colour management, set validation, no game reset through student requests',async()=>{const s=await setup();const v=await s.view(s.host.hostToken),[a,b]=v.players;await s.act(s.host.hostToken,'host:team',{playerId:a.id,name:'Blue whales',color:b.color});const after=await s.view(s.host.hostToken);assert.equal(after.players.find(p=>p.id===a.id).color,b.color);assert.equal(after.players.find(p=>p.id===b.id).color,a.color);await assert.rejects(s.act(s.host.hostToken,'host:set',{setId:'unknown'}),/Unknown/);await start(s);await assert.rejects(s.act(s.host.hostToken,'host:set',{setId:BANK.id}),/before/);});
test('all 25 questions complete with exactly 25 rewards; fresh room retains fixed map and clears progress',async()=>{const s=await setup();await start(s);for(const q of BANK.questions){assert.equal((await s.view(s.players[0].playerToken)).question.id,q.id);await submit(s,0,q.answer);await finalize(s);if(q.number<BANK.questions.length)await s.act(s.host.hostToken,'host:next',{questionId:q.id});}const final=await s.view(s.players[0].playerToken);assert.equal(final.me.actions,25);assert.equal(final.me.science,25);await assert.rejects(s.act(s.host.hostToken,'host:next',{questionId:'q25'}),/complete/);await s.act(s.host.hostToken,'host:end',{confirm:true});const fresh=await s.store().create();const next=await s.store().state(fresh.pin,fresh.hostToken);assert.equal(next.phase,'lobby');assert.equal(next.joinedCount,0);assert.ok(next.tiles.every(t=>!t.owner&&!t.fortress&&!t.resolved&&!t.shield));assert.deepEqual(next.tiles.map(t=>t.id),final.tiles.map(t=>t.id));});
test('question-set registry rejects inherited object properties and never creates invalid rooms',async()=>{const s=await setup();for(const setId of ['__proto__','constructor','toString']){await assert.rejects(s.store().create(setId),/available question set/);await assert.rejects(s.act(s.host.hostToken,'host:set',{setId}),/Unknown/);}assert.equal(s.db.sql.prepare('SELECT COUNT(*) AS n FROM territory_rooms').get().n,1);});

test('permanent mystery exact 30/30/20/20 boundaries, land counts and no ownership of mystery',async()=>{
 for(const roll of [0,29,30,59,60,79,80,99]){
  const s=await setup(2,max=>max===100?roll:0);await start(s);
  s.fixture(r=>{r.players.forEach(p=>p.balance=3);r.tiles.find(t=>t.id===LANDS[0].id).owner=r.players[0].id;r.tiles.find(t=>t.id===LANDS[1].id).owner=r.players[1].id;});
  await action(s,0,'student:explore',MYSTERIES[0].id);
  const r=s.db.room(s.host.pin),p=r.players[0],v=await s.view(s.players[0].playerToken);
  assert.equal(p.balance,2);assert.deepEqual(p.explored,[MYSTERIES[0].id]);assert.equal(v.me.territories,roll<60?1:roll<80?2:0);
  assert.deepEqual(p.cards,roll<30?['shield']:roll<60?['rebellion']:[]);
  assert.ok(r.tiles.filter(t=>t.kind==='mystery').every(t=>!t.owner&&!t.resolved&&!t.fortress&&!t.shield));
  assert.equal(v.tiles.filter(t=>t.kind!=='mystery').length,112);
 }
});

test('all 12 teams can explore the same eight mysteries once each; reconnect, duplicates and concurrency cannot farm',async()=>{
 const s=await setup(12,()=>0);await start(s);s.fixture(r=>r.players.forEach(p=>p.balance=10));
 await Promise.all(s.players.map((_,i)=>action(s,i,'student:explore',MYSTERIES[0].id)));
 assert.ok(s.db.room(s.host.pin).players.every(p=>p.explored.length===1&&p.cards.length===1&&p.balance===9));
 for(const t of MYSTERIES.slice(1))await action(s,0,'student:explore',t.id);
 await assert.rejects(action(s,0,'student:explore',MYSTERIES[0].id),/already explored/);
 await s.store().join(s.host.pin,s.clients[0]);assert.equal((await s.view(s.players[0].playerToken)).me.explored.length,8);
 const view=await s.view(s.players[1].playerToken),body={tileId:MYSTERIES[1].id,tileVersion:0,expectedVersion:view.me.actionVersion},rid=randomUUID();
 const requests=await Promise.allSettled([s.act(s.players[1].playerToken,'student:explore',body,rid),s.act(s.players[1].playerToken,'student:explore',body,rid),s.act(s.players[1].playerToken,'student:explore',body)]);
 assert.ok(requests.filter(x=>x.status==='fulfilled').length>=2);
 const p=s.db.room(s.host.pin).players[1];assert.equal(p.balance,8);assert.equal(p.cards.length,2);assert.equal(p.explored.length,2);
 const newRoom=await new TerritoryD1Store(s.db,{now:s.options.now,sleep:async()=>{}}).create();const fresh=await s.store().join(newRoom.pin,s.clients[0]);assert.deepEqual((await s.store().state(newRoom.pin,fresh.playerToken)).me.explored,[]);
});

test('permanent mysteries reject claiming, fortifying, shielding, rebellion and invalid exploration without spending',async()=>{
 const s=await setup(2,()=>0);await start(s);s.fixture(r=>r.players[0].balance=4);
 for(const type of ['student:claim','student:fortify','student:shield','student:rebellion'])await assert.rejects(action(s,0,type,MYSTERIES[0].id),/stay unclaimed/);
 await assert.rejects(action(s,0,'student:explore',LANDS[0].id),/permanent Mystery/);
 await s.act(s.host.hostToken,'host:pause',{paused:true});await assert.rejects(action(s,0,'student:explore',MYSTERIES[0].id),/paused/);
 await s.act(s.host.hostToken,'host:pause',{paused:false});await assert.rejects(action(s,1,'student:explore',MYSTERIES[0].id),/Not enough/);
 assert.equal((await s.view(s.players[0].playerToken)).me.actions,4);
 await s.act(s.host.hostToken,'host:end',{confirm:true});await assert.rejects(action(s,0,'student:explore',MYSTERIES[0].id),/ended/);
});

test('empty random outcomes consume visit/action without reroll; random steal skips Fortresses',async()=>{
 for(const roll of [60,80]){
  let draws=0;const s=await setup(2,max=>{if(max===100){draws++;return roll;}return 0;});await start(s);
  s.fixture(r=>{r.players[0].balance=2;const t=r.tiles.find(t=>t.id===LANDS[0].id);t.owner=r.players[1].id;t.fortress=true;});
  const result=await action(s,0,'student:explore',MYSTERIES[0].id);
  assert.match(result.result.message,/No land was affected/);assert.equal(draws,1);assert.equal(result.state.me.actions,1);assert.equal(result.state.me.explored.length,1);
  assert.equal(result.state.tiles.find(t=>t.id===LANDS[0].id).owner,s.players[1].playerId);
 }
});

test('secret Shields and inventories stay private in state, HTTP, logs, tile versions and projected host view',async()=>{
 const s=await setup(2,()=>0);await start(s);s.fixture(r=>r.players.forEach(p=>p.balance=5));
 await action(s,0,'student:claim',LANDS[0].id);
 const before=await s.view(s.players[1].playerToken);
 await action(s,0,'student:explore',MYSTERIES[0].id);
 const collected=await s.view(s.players[1].playerToken);assert.deepEqual(collected.log,before.log);assert.deepEqual(collected.me.cards,[]);
 assert.ok(collected.players.every(p=>!Object.hasOwn(p,'cards')&&!Object.hasOwn(p,'explored')));
 assert.equal(collected.tiles.find(t=>t.id===MYSTERIES[0].id).explored,false);
 await action(s,0,'student:shield',LANDS[0].id);
 const own=await s.view(s.players[0].playerToken);assert.equal(own.tiles.find(t=>t.id===LANDS[0].id).shield,true);
 for(const token of [s.players[1].playerToken,s.host.hostToken]){
  const v=await(await http(s,`rooms/${s.host.pin}/state`,token)).json();assert.equal(v.tiles.find(t=>t.id===LANDS[0].id).shield,false);
  assert.equal(v.tiles.find(t=>t.id===LANDS[0].id).version,before.tiles.find(t=>t.id===LANDS[0].id).version);
  assert.ok(!v.log.some(e=>e.type==='student:shield'||e.type==='student:explore'));
 }
 await action(s,1,'student:claim',LANDS[0].id);assert.equal((await s.view(s.players[0].playerToken)).tiles.find(t=>t.id===LANDS[0].id).shield,false);
 assert.equal((await s.view(s.players[1].playerToken)).me.actions,5);
});

test('Shield blocks exactly one random steal or trap, including Crown; no redraw; final scoring uses actual ownership',async()=>{
 for(const roll of [60,80]){
  const s=await setup(2,max=>max===100?roll:0);await start(s);const victim=roll===60?1:0;
  s.fixture(r=>{r.players.forEach(p=>p.balance=5);const crown=r.tiles.find(t=>t.kind==='crown');crown.owner=r.players[victim].id;crown.shield=true;});
  let result=await action(s,0,'student:explore',MYSTERIES[0].id);assert.match(result.result.title,/Shield blocked/);
  const blocked=s.db.room(s.host.pin).tiles.find(t=>t.kind==='crown');assert.equal(blocked.owner,s.players[victim].playerId);assert.equal(blocked.shield,false);
  result=await action(s,0,'student:explore',MYSTERIES[1].id);
  const crown=s.db.room(s.host.pin).tiles.find(t=>t.kind==='crown');assert.equal(crown.owner,roll===60?s.players[0].playerId:null);
  await s.act(s.host.hostToken,'host:end',{confirm:true});const results=(await s.view(s.host.hostToken)).results;
  assert.equal(results.find(p=>p.id===s.players[0].playerId).score,roll===60?4:0);
 }
});

test('simultaneous random steals and normal capture serialize ownership without duplicate debit; stale confirmation rejected',async()=>{
 const s=await setup(3,max=>max===100?60:0);await start(s);
 s.fixture(r=>{r.players.forEach(p=>p.balance=5);r.tiles.find(t=>t.id===LANDS[0].id).owner=r.players[2].id;});
 const stale=await s.view(s.players[2].playerToken);
 await Promise.all([action(s,0,'student:explore',MYSTERIES[0].id),action(s,1,'student:explore',MYSTERIES[0].id)]);
 const r=s.db.room(s.host.pin);assert.equal(r.players[0].balance,4);assert.equal(r.players[1].balance,4);assert.equal(r.tiles.filter(t=>t.owner).length,1);
 await assert.rejects(s.act(s.players[2].playerToken,'student:fortify',{tileId:LANDS[0].id,tileVersion:stale.tiles.find(t=>t.id===LANDS[0].id).version,expectedVersion:stale.me.actionVersion}),/changed/);
});

test('lost exploration response retries the stored outcome without a second roll or debit',async()=>{
 let draws=0;const s=await setup(2,max=>{if(max===100)draws++;return 0;});await start(s);s.fixture(r=>r.players[0].balance=2);
 const rid=randomUUID(),body={tileId:MYSTERIES[0].id,tileVersion:0,expectedVersion:0};s.db.loseResponse=true;
 await assert.rejects(s.act(s.players[0].playerToken,'student:explore',body,rid),/Response lost/);
 const retry=await s.act(s.players[0].playerToken,'student:explore',body,rid);assert.equal(retry.replayed,true);assert.equal(draws,1);
 assert.equal(retry.state.me.actions,1);assert.deepEqual(retry.state.me.cards,['shield']);assert.deepEqual(retry.state.me.explored,[MYSTERIES[0].id]);
});
