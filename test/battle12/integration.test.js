import test from 'node:test';
import assert from 'node:assert/strict';
import { randomUUID, createHash } from 'node:crypto';
import { DatabaseSync } from 'node:sqlite';
import { setImmediate } from 'node:timers/promises';
import { readFileSync, readdirSync } from 'node:fs';
import { TreasureD1Store } from '../../app/battle12/d1-store.js';
import { handleTreasureRequest } from '../../app/battle12/http.js';
import { CONTENT, E } from '../../app/battle12/core/game.js';

class TestD1 {
  constructor(){this.sqlite=new DatabaseSync(':memory:');this.conflicts=0;this.failAfterCommit=false;}
  prepare(sql){let args=[];const stmt={bind:(...a)=>{args=a;return stmt;},first:async()=>{await setImmediate();return this.sqlite.prepare(sql).get(...args)??null;},all:async()=>{await setImmediate();return {results:this.sqlite.prepare(sql).all(...args)};},run:async()=>{await setImmediate();const r=this.sqlite.prepare(sql).run(...args);if(sql.includes('UPDATE treasure_rooms')){if(!r.changes)this.conflicts++;else if(this.failAfterCommit){this.failAfterCommit=false;throw Error('Lost response after commit');}}return {meta:{changes:Number(r.changes)}};}};return stmt;}
  async batch(stmts){this.sqlite.exec('BEGIN');try{const out=[];for(const s of stmts)out.push(await s.run());this.sqlite.exec('COMMIT');return out;}catch(e){this.sqlite.exec('ROLLBACK');throw e;}}
  room(pin){return JSON.parse(this.sqlite.prepare('SELECT state_json FROM treasure_rooms WHERE pin=?').get(pin).state_json);}
  fixture(pin,fn){const r=this.room(pin);fn(r);this.sqlite.prepare('UPDATE treasure_rooms SET state_json=? WHERE pin=?').run(JSON.stringify(r),pin);}
}
async function setup(n=3,autoMark=false){const db=new TestD1();let now=1_000_000;const options={now:()=>now,sleep:async()=>{}};const store=()=>new TreasureD1Store(db,options),host=await store().create();const clients=Array.from({length:n},(_,i)=>({clientId:randomUUID(),name:`TEST player ${i+1}`}));const players=await Promise.all(clients.map(c=>store().join(host.pin,c)));const act=(token,type,extra={},requestId=randomUUID())=>store().action(host.pin,token,{type,requestId,...extra});const view=t=>store().state(host.pin,t);if(!autoMark)await act(host.hostToken,'host:auto-mark',{enabled:false});return {db,options,store,host,clients,players,act,view,tick:ms=>now+=ms};}
async function accept(s,index=0,raw='Silver Gull'){const t=s.players[index].playerToken,q=(await s.view(t)).question;await s.act(t,'student:submit',{questionId:q.id,answer:raw,attempt:0});await s.act(s.host.hostToken,'host:review',{questionId:q.id,playerId:s.players[index].playerId,attempt:1,decision:'accept'});}
async function playerAction(s,i,type,extra={},requestId){const t=s.players[i].playerToken,m=(await s.view(t)).me;return s.act(t,type,{expectedVersion:m.actionVersion,...extra},requestId);}
function request(s,path,token,body,method=body?'POST':'GET'){return handleTreasureRequest(new Request('https://example.test/api/treasure/'+path,{method,headers:{...(token?{authorization:'Bearer '+token}:{}),...(body?{'content-type':'application/json'}:{})},...(body?{body:JSON.stringify(body)}:{})}),s.db,s.options);}

test('supplied exact content, allowlists, punctuation and all embedded content checks preserved',()=>{
  const bytes=readFileSync(new URL('../../app/battle12/content.json',import.meta.url));
  assert.equal(createHash('sha256').update(bytes).digest('hex'),'3b5a0deda3144fd817b72d6d00a2f3a0ae76f8a99cac08418cd45e1d98bbe542');
  assert.equal(CONTENT.passageParagraphs.length,9);assert.equal(CONTENT.items.length,18);
  for(const q of CONTENT.items){assert.ok(CONTENT.passageParagraphs[q.evidenceParagraph-1].includes(q.evidenceQuote));for(const t of q.tests)assert.equal(E.suggestAnswer(t.input,q).status,t.expected,q.id+' '+t.input);for(const a of q.acceptedAnswers)assert.equal(E.suggestAnswer(a,q).status,'suggest_accept');}
});
test('40 concurrent name-only joins, cross-Worker reconnection and isolation',async()=>{
  const s=await setup(40);assert.equal(s.db.room(s.host.pin).players.length,40);assert.ok(s.db.conflicts>0);
  assert.deepEqual(await Promise.all(s.clients.map(c=>s.store().join(s.host.pin,c))),s.players);
  await assert.rejects(s.store().join(s.host.pin,{clientId:randomUUID(),name:'extra'}),/40/);
  const other=await s.store().create();assert.equal((await s.store().state(other.pin,other.hostToken)).joinedCount,0);
  await assert.rejects(s.store().state(other.pin,s.players[0].playerToken),/not valid/);
});
test('real HTTP role gates, private review and redacted public/teacher/student state',async()=>{
  const s=await setup(),t=s.players[0].playerToken,p=`rooms/${s.host.pin}`;
  await s.act(s.host.hostToken,'host:start');await s.act(t,'student:submit',{questionId:'q01',answer:'SECRET original answer',attempt:0});
  for(const key of ['',t,s.players[1].playerToken]){
    const view=await (await request(s,p+'/state',key)).json();assert.ok(!JSON.stringify(view).includes('acceptedAnswers'));
    if(key!==t)assert.ok(!JSON.stringify(view).includes('SECRET original answer'));
    assert.equal((await request(s,p+'/review',key)).status,403);
  }
  assert.ok(!JSON.stringify(await s.view(s.host.hostToken)).includes('SECRET original answer'));
  const review=await (await request(s,p+'/review',s.host.hostToken)).json();assert.equal(review.entries[0].response.value,'SECRET original answer');assert.equal(review.entries[0].suggestion.status,'teacher_review');
  for(const type of ['host:start','host:pause','host:review','host:auto-mark','host:end','host:finish','host:advance','host:reveal','host:final-banking'])assert.equal((await request(s,p+'/action',t,{type,requestId:randomUUID(),confirm:true})).status,403);
  assert.equal((await request(s,p+'/content')).status,401);
  const c=await (await request(s,p+'/content',t)).json();assert.equal(c.paragraphs.length,9);assert.equal(c.items.length,18);assert.ok(!JSON.stringify(c).includes('modelAnswer'));
});
test('unmatched answer is reviewed, original raw text retained; acceptance once only',async()=>{
  const s=await setup(1),t=s.players[0].playerToken;await s.act(s.host.hostToken,'host:start');
  await s.act(t,'student:submit',{questionId:'q01',answer:'  teacher decides this variant!  ',attempt:0});
  assert.equal((await s.view(t)).me.actions,0);
  const b={questionId:'q01',playerId:s.players[0].playerId,attempt:1,decision:'accept'},id=randomUUID();
  const results=await Promise.all(Array.from({length:8},()=>s.act(s.host.hostToken,'host:review',b,id)));
  assert.equal(results.filter(r=>r.replayed).length,7);assert.equal((await s.view(t)).me.actions,1);
  await assert.rejects(s.act(s.host.hostToken,'host:review',b),/no new answer/);
  assert.equal((await s.view(t)).me.response.value,'  teacher decides this variant!  ');
});
test('reject/revise history and stale review, stale question and delayed submission safety',async()=>{
  const s=await setup(1),t=s.players[0].playerToken;await s.act(s.host.hostToken,'host:start');
  await s.act(t,'student:submit',{questionId:'q01',answer:'wrong',attempt:0});
  await s.act(s.host.hostToken,'host:review',{questionId:'q01',playerId:s.players[0].playerId,attempt:1,decision:'revise'});
  await s.act(t,'student:submit',{questionId:'q01',answer:'Silver Gull',attempt:1});
  await assert.rejects(s.act(s.host.hostToken,'host:review',{questionId:'q01',playerId:s.players[0].playerId,attempt:1,decision:'accept'}),/changed/);
  await s.act(s.host.hostToken,'host:review',{questionId:'q01',playerId:s.players[0].playerId,attempt:2,decision:'accept'});
  assert.equal((await s.view(t)).me.response.history[0].value,'wrong');
  await s.act(s.host.hostToken,'host:advance',{questionId:'q01',skip:true});
  await assert.rejects(s.act(t,'student:submit',{questionId:'q01',answer:'six',attempt:0}),/question has changed/);
});
test('lost response retry and rapid double exploration cannot spend or reward twice',async()=>{
  const s=await setup(1),t=s.players[0].playerToken;await s.act(s.host.hostToken,'host:start');await accept(s);
  const v=(await s.view(t)).me.actionVersion,id=randomUUID(),body={expectedVersion:v,location:'cave'};
  s.db.failAfterCommit=true;await assert.rejects(s.act(t,'student:explore',body,id),/Lost response/);
  const repeat=await s.act(t,'student:explore',body,id);assert.equal(repeat.replayed,true);assert.ok(!('weight' in repeat.result));assert.equal(repeat.result.visual,'gems');
  const m=(await s.view(t)).me;assert.equal(m.actions,0);assert.ok([2,3].includes(m.bag));
  await assert.rejects(s.act(t,'student:explore',body),/resources changed/);
  assert.equal((await s.view(t)).me.bag,m.bag);
});
test('pause blocks resources but allows submit/mark; reconnect preserves resources',async()=>{
  const s=await setup(2),t=s.players[0].playerToken;await s.act(s.host.hostToken,'host:start');await s.act(s.host.hostToken,'host:pause',{paused:true});await accept(s);
  await assert.rejects(playerAction(s,0,'student:explore',{location:'cave'}),/paused/);
  const before=(await s.view(t)).me;await s.store().join(s.host.pin,s.clients[0]);assert.deepEqual((await s.view(t)).me,before);
  await s.act(s.host.hostToken,'host:pause',{paused:false});await playerAction(s,0,'student:explore',{location:'cave'});
  await s.act(s.host.hostToken,'host:advance',{questionId:'q01',skip:true});await accept(s,0,'six');await playerAction(s,0,'student:bank');assert.ok((await s.view(t)).me.vault>=2);
});
test('concurrent bank and attacks serialize; vault protection, shields, limits and duplicates',async()=>{
  const s=await setup(3);await s.act(s.host.hostToken,'host:start');
  s.db.fixture(s.host.pin,r=>{const [a,b,c]=r.game.crews;a.cards=['raid','sabotage'];b.bag=5;b.actions=1;b.vault=9;c.cards=['raid'];});
  const target=s.players[1].playerId;
  await Promise.allSettled([playerAction(s,0,'student:attack',{targetId:target,card:'raid'}),playerAction(s,1,'student:bank'),playerAction(s,2,'student:attack',{targetId:target,card:'raid'})]);
  const r=s.db.room(s.host.pin);assert.equal(r.game.crews.reduce((n,c)=>n+c.bag+c.vault,0),14);assert.ok(r.game.crews.every(c=>c.bag>=0));assert.ok(r.game.crews[1].vault>=9);
  s.db.fixture(s.host.pin,r=>{const [a,b]=r.game.crews;a.cards=['raid','sabotage'];a.attacks={};b.bag=4;b.shields=1;});
  const blocked=await playerAction(s,0,'student:attack',{targetId:target,card:'raid'});assert.equal(blocked.result.visual,'blocked');const view=await s.view(s.players[1].playerToken);assert.equal(view.me.bag,4);assert.equal(view.me.shields,0);
  await assert.rejects(playerAction(s,0,'student:attack',{targetId:target,card:'sabotage'}),/already used/);
  for(let seed=0;seed<300;seed++){const x=E.createState('fixture');E.start(x);const c=x.crews[0];c.actions=1;c.cards=['raid','sabotage'];c.shields=1;x.seed=seed*2347;const event=E.explore(x,c.id,'ruins');assert.equal(c.cards.length,2);assert.equal(c.shields,1);assert.equal(c.bag,1);assert.ok(event.title);}
});
test('explicit end is confirmed, atomic, repeatable without changes, no autobank and student-safe restore',async()=>{
  const s=await setup(2),t=s.players[0].playerToken;await s.act(s.host.hostToken,'host:start');await accept(s);
  s.db.fixture(s.host.pin,r=>{r.game.crews[0].bag=12;r.game.crews[0].vault=4;r.game.crews[1].vault=4;});
  await assert.rejects(s.act(s.host.hostToken,'host:end'),/Confirm/);
  assert.equal((await s.view(t)).phase,'questions');
  const id=randomUUID();await Promise.all(Array.from({length:6},()=>s.act(s.host.hostToken,'host:end',{confirm:true},id)));
  const ended=await s.view(t);assert.equal(ended.phase,'ended');assert.equal(ended.role,'student');assert.equal(ended.me.bag,12);assert.equal(ended.me.vault,4);assert.ok(ended.results.every(r=>r.rank===1));
  s.tick(10000);await s.act(s.host.hostToken,'host:end',{confirm:true});const later=await s.view(t);assert.equal(later.endedAt,ended.endedAt);assert.deepEqual(later.results,ended.results);
  assert.deepEqual(await s.store().join(s.host.pin,s.clients[0]),s.players[0]);
  for(const [token,type] of [[t,'student:submit'],[t,'student:explore'],[t,'student:bank'],[t,'student:attack'],[t,'student:pass'],[s.host.hostToken,'host:review'],[s.host.hostToken,'host:advance'],[s.host.hostToken,'host:start'],[s.host.hostToken,'host:final-banking']])await assert.rejects(s.act(token,type),/ended/);
  const http=await request(s,`rooms/${s.host.pin}/state`,t);assert.equal(http.status,200);assert.equal(http.headers.get('location'),null);assert.equal((await http.json()).role,'student');
});
test('complete 18 shared questions, normal final play and paid banking distinct from termination',async()=>{
  const s=await setup(2);await s.act(s.host.hostToken,'host:start');
  for(const q of CONTENT.items){for(let i=0;i<2;i++)await accept(s,i,q.modelAnswer.toUpperCase());await s.act(s.host.hostToken,'host:advance',{questionId:q.id});}
  assert.equal((await s.view(s.players[0].playerToken)).me.actions,18);assert.equal((await s.view(s.host.hostToken)).phase,'finalPlay');
  await playerAction(s,0,'student:explore',{location:'cave'});await playerAction(s,1,'student:explore',{location:'cave'});
  await s.act(s.host.hostToken,'host:final-banking');await assert.rejects(s.act(s.host.hostToken,'host:finish'),/bank or explicitly pass/);
  await assert.rejects(playerAction(s,0,'student:explore',{location:'cave'}),/closed/);
  await playerAction(s,0,'student:bank');await playerAction(s,1,'student:pass');await s.act(s.host.hostToken,'host:finish');
  const result=await s.view(s.players[0].playerToken);assert.equal(result.phase,'finished');assert.equal(result.results[0].id,s.players[0].playerId);assert.equal(result.results[1].vault,0);
});
test('QR is student-only, HTTP errors safe, unrelated rooms and expired state do not redirect',async()=>{
  const s=await setup(1),p=`rooms/${s.host.pin}`;
  assert.match(await (await request(s,p+'/qr.svg')).text(),/<svg/);
  const publicState=await (await request(s,p+'/state')).json();assert.equal(publicState.joinUrl,`https://example.test/battle12/index.html?join=${s.host.pin}`);assert.ok(!JSON.stringify(publicState).includes(s.host.hostToken));
  const cross=await handleTreasureRequest(new Request(`https://example.test/api/treasure/${p}/action`,{method:'POST',headers:{origin:'https://evil.test','content-type':'application/json'},body:'{}'}),s.db,s.options);assert.equal(cross.status,403);
  s.tick(49*3600000);const gone=await request(s,p+'/state',s.players[0].playerToken);assert.equal(gone.status,404);assert.equal(gone.headers.get('location'),null);
});
test('all original illustrations present; production bundle has no engine, test answers, reward preview or role switcher',()=>{
  for(let i=1;i<=9;i++){const bytes=readFileSync(new URL(`../../public/battle12/assets/paragraph_${String(i).padStart(2,'0')}.png`,import.meta.url));assert.equal(bytes.subarray(1,4).toString(),'PNG');}
  const app=readFileSync(new URL('../../public/battle12/app.js',import.meta.url),'utf8');
  assert.ok(!/TreasureEngine|Simulate teacher|DECKS|Reliable small finds|Bigger finds|role switcher|modelAnswer\s*:/.test(app));
  assert.ok(app.includes('1 Action'));assert.ok(app.includes('saveDraft'));assert.ok(app.includes('readScroll'));
  assert.ok(!readdirSync(new URL('../../public/battle12/',import.meta.url)).includes('engine.js'));
  assert.ok(app.includes("new Audio('/battle12/assets/master-of-the-feast.mp3')"));
  assert.ok(app.includes('if(!host)return;'));
});

test('automatic approved match uses original normalization and awards exactly once under retries',async()=>{
  const s=await setup(2,true),t=s.players[0].playerToken;
  assert.equal((await s.view(s.host.hostToken)).autoMark,true);
  await s.act(s.host.hostToken,'host:start');
  const body={questionId:'q01',answer:'  SILVER   GULL.  ',attempt:0},receipt=randomUUID();
  await Promise.all(Array.from({length:8},()=>s.act(t,'student:submit',body,receipt)));
  const me=(await s.view(t)).me;
  assert.equal(me.actions,1);assert.equal(me.response.status,'accepted');assert.equal(me.response.markedBy,'automatic');assert.equal(me.response.value,body.answer);
  assert.equal(me.actionVersion,1);
  await assert.rejects(s.act(s.host.hostToken,'host:review',{questionId:'q01',playerId:s.players[0].playerId,attempt:1,decision:'accept'}),/no new answer/);
  await assert.rejects(s.act(t,'student:submit',body),/changed/);
  assert.equal((await s.view(t)).me.actions,1);
});

test('unmatched answers remain pending and block Next until teacher accepts or rejects inline',async()=>{
  const s=await setup(1,true),t=s.players[0].playerToken;await s.act(s.host.hostToken,'host:start');
  await s.act(t,'student:submit',{questionId:'q01',answer:'a questionable longer answer',attempt:0});
  assert.equal((await s.view(t)).me.actions,0);assert.equal((await s.view(t)).me.response.status,'submitted');
  await assert.rejects(s.act(s.host.hostToken,'host:advance',{questionId:'q01',skip:true}),/Mark every/);
  await s.act(s.host.hostToken,'host:review',{questionId:'q01',playerId:s.players[0].playerId,attempt:1,decision:'revise'});
  await s.act(t,'student:submit',{questionId:'q01',answer:'Silver Gull',attempt:1});
  assert.equal((await s.view(t)).me.actions,1);
  await s.act(s.host.hostToken,'host:advance',{questionId:'q01'});
  assert.equal((await s.view(t)).question.number,2);
});

test('auto-mark toggle persists, accepts existing matches once, and leaves unmatched answers alone',async()=>{
  const s=await setup(2),t=s.players[0].playerToken;await s.act(s.host.hostToken,'host:start');
  await s.act(t,'student:submit',{questionId:'q01',answer:'Silver Gull',attempt:0});
  await s.act(s.players[1].playerToken,'student:submit',{questionId:'q01',answer:'the Silver Gull ship',attempt:0});
  assert.equal((await s.view(t)).me.actions,0);
  await Promise.all([s.act(s.host.hostToken,'host:auto-mark',{enabled:true}),s.act(s.host.hostToken,'host:auto-mark',{enabled:true})]);
  assert.equal((await s.view(t)).me.actions,1);assert.equal((await s.view(s.players[1].playerToken)).me.actions,0);
  assert.equal((await s.store().state(s.host.pin,s.host.hostToken)).autoMark,true);
  await s.act(s.host.hostToken,'host:end',{confirm:true});
  await assert.rejects(s.act(s.host.hostToken,'host:auto-mark',{enabled:false}),/ended/);
});

test('teacher map exposes actual committed destinations; blocked moves never move a marker',async()=>{
  const s=await setup(1,true),t=s.players[0].playerToken;
  assert.equal((await s.view(s.host.hostToken)).players[0].location,'camp');
  await s.act(s.host.hostToken,'host:start');
  await assert.rejects(playerAction(s,0,'student:explore',{location:'cave'}));
  assert.equal((await s.view(s.host.hostToken)).players[0].location,'camp');
  await s.act(t,'student:submit',{questionId:'q01',answer:'Silver Gull',attempt:0});
  await playerAction(s,0,'student:explore',{location:'cave'});
  assert.equal((await s.view(s.host.hostToken)).players[0].location,'cave');
  await s.act(s.host.hostToken,'host:advance',{questionId:'q01'});
  await s.act(t,'student:submit',{questionId:'q02',answer:'six',attempt:0});
  const banked=await playerAction(s,0,'student:bank');assert.equal(banked.result.visual,'bank');
  assert.equal((await s.view(s.host.hostToken)).players[0].location,'camp');
  assert.equal('location' in (await s.view(t)).players[0],false);
});

test('reward illustration metadata follows committed outcome without altering duplicate rewards',async()=>{
  const s=await setup(1,true);await s.act(s.host.hostToken,'host:start');
  for(let i=0;i<12;i++){
    s.db.fixture(s.host.pin,r=>{const c=r.game.crews[0];c.actions=1;c.cards=['raid','sabotage'];c.shields=1;c.bag=0;});
    const {result}=await playerAction(s,0,'student:explore',{location:'ruins'});
    assert.equal(result.visual,result.kind==='gems'?'gems':'duplicate');
    const me=(await s.view(s.players[0].playerToken)).me;
    assert.equal(me.bag,1);assert.equal(me.cards.length,2);assert.equal(me.shields,1);assert.equal(me.actions,0);
  }
});
