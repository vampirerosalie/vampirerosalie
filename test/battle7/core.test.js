import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {randomUUID} from 'node:crypto';
import {GameStore,INGREDIENTS,RECIPES,recipeKey,normalizeAnswer} from '../../app/battle7/core/game.js';
const questions=JSON.parse(readFileSync(new URL('../../app/battle7/data/question-bank.json',import.meta.url),'utf8')).questions;
function setup(extra={}){let time=1770000000000;const store=new GameStore({questions,now:()=>time,random:()=>0,...extra});const host=store.create({teamCount:extra.roomTeamCount??3});const teams=[1,2,3].map(i=>store.join(host.pin,{teamSlot:i,name:`Team ${i}`,clientId:randomUUID()}));const act=(token,type,values={})=>store.action(host.pin,token,{type,requestId:randomUUID(),questionId:store.currentQuestion(store.room(host.pin))?.id,expectedPhase:store.room(host.pin).phase,...values});return{store,host,teams,act,room:()=>store.room(host.pin),tick:n=>time+=n};}
function start(s){s.act(s.host.hostToken,'host:start');return s.room().questions[s.room().questionIndex];}
function cookPhase(s){if(s.room().phase==='lobby')start(s);s.act(s.host.hostToken,'host:reveal');s.act(s.host.hostToken,'host:advance');}
const count=t=>Object.values(t.inventory).reduce((a,b)=>a+b,0);

test('bank has 20 unique mixed questions, four per tense, rebuild tokens conserve words',()=>{assert.equal(questions.length,20);assert.equal(new Set(questions.map(q=>q.id)).size,20);const tenses={};const formats={};for(const q of questions){tenses[q.targetTense]=(tenses[q.targetTense]??0)+1;formats[q.format]=(formats[q.format]??0)+1;if(q.tokens){assert.deepEqual([...q.canonicalTokenOrder].sort(),q.tokens.map(t=>t.id).sort());}}assert.deepEqual(Object.values(tenses),[4,4,4,4,4]);assert.equal(formats.typed_correction,10);assert.equal(formats.multiple_choice,5);assert.equal(formats.sentence_rebuild,5);});
test('ten distinct stations; retry join restores identity and cannot occupy a second slot',()=>{const s=setup({roomTeamCount:10});const id=randomUUID();const t=s.store.join(s.host.pin,{teamSlot:4,name:'Owls',clientId:id});assert.deepEqual(s.store.join(s.host.pin,{teamSlot:7,name:'ignored',clientId:id}),t);assert.throws(()=>s.store.join(s.host.pin,{teamSlot:4,name:'Other',clientId:randomUUID()}),/taken/);for(let i=5;i<=10;i++)s.store.join(s.host.pin,{teamSlot:i,name:`Team${i}`,clientId:randomUUID()});assert.equal(s.room().teams.length,10);assert.throws(()=>s.store.join(s.host.pin,{teamSlot:11,name:'Extra',clientId:randomUUID()}),/available/);});
test('public and pupil snapshots hide teacher answer key and entire hidden catalogue',()=>{const s=setup();const q=start(s);for(const token of [undefined,s.teams[0].teamToken]){const state=s.store.state(s.host.pin,token);assert.equal(state.answerKey,undefined);assert.equal(state.answerReveal,null);assert.equal(state.question.canonicalAnswer,undefined);assert.equal(state.question.targetTense,undefined);assert.equal(state.question.canonicalTokenOrder,undefined);assert.equal(state.recipes,undefined);}assert.equal(s.store.state(s.host.pin,s.host.hostToken).answerKey.canonicalAnswer,q.canonicalAnswer);});
test('manual accept rewards once; retries and repeated decisions do not duplicate; reversal reuses reward',()=>{const s=setup();const q=start(s);const t=s.teams[0];s.act(t.teamToken,'pupil:submit',{questionId:q.id,answer:'Teacher decides this'});assert.equal(count(s.room().teams[0]),0);const action={type:'host:review',requestId:randomUUID(),teamId:t.teamId,questionId:q.id,decision:'accepted'};const first=s.store.action(s.host.pin,s.host.hostToken,action);assert.equal(count(s.room().teams[0]),1);assert.equal(first.result.reward,'Bread');assert.equal(s.store.action(s.host.pin,s.host.hostToken,action).replayed,true);s.act(s.host.hostToken,'host:review',{...action,requestId:randomUUID()});assert.equal(count(s.room().teams[0]),1);s.act(s.host.hostToken,'host:review',{teamId:t.teamId,questionId:q.id,decision:'rejected'});assert.equal(count(s.room().teams[0]),0);s.act(s.host.hostToken,'host:review',{teamId:t.teamId,questionId:q.id,decision:'accepted'});assert.equal(count(s.room().teams[0]),1);assert.equal(s.room().teams[0].inventory.Bread,1);});
test('reject grants nothing; submitted answers lock and teacher must review before reveal',()=>{const s=setup();const q=start(s);const t=s.teams[0];s.act(t.teamToken,'pupil:submit',{questionId:q.id,answer:'no'});assert.throws(()=>s.act(s.host.hostToken,'host:reveal'),/Review every/);assert.throws(()=>s.act(t.teamToken,'pupil:submit',{questionId:q.id,answer:'again'}),/already submitted/);s.act(s.host.hostToken,'host:review',{teamId:t.teamId,questionId:q.id,decision:'rejected'});assert.equal(count(s.room().teams[0]),0);s.act(s.host.hostToken,'host:reveal');assert.equal(s.store.state(s.host.pin).answerReveal.canonicalAnswer,q.canonicalAnswer);assert.throws(()=>s.act(s.host.hostToken,'host:review',{teamId:t.teamId,questionId:q.id,decision:'accepted'}),/only available/);});
test('normalization handles curly apostrophes and spacing without dropping negation',()=>{assert.equal(normalizeAnswer('  AREN ’T   COOKING!  '),"aren't cooking");assert.notEqual(normalizeAnswer("aren't cooking"),normalizeAnswer('are cooking'));});
test('20 shuffled unique questions, optional cooking after every question, teacher-paced end and tied winners',()=>{const s=setup();start(s);const seen=[];for(let i=0;i<20;i++){seen.push(s.room().questions[s.room().questionIndex].id);assert.equal(s.room().questionIndex,i);s.act(s.host.hostToken,'host:reveal');s.act(s.host.hostToken,'host:advance');assert.equal(s.room().phase,'rush');assert.equal(s.room().rushNumber,i+1);s.tick(31000);assert.equal(s.store.state(s.host.pin).rushEnded,true);assert.equal(s.room().phase,'rush');s.act(s.host.hostToken,'host:advance');}assert.equal(new Set(seen).size,20);const state=s.store.state(s.host.pin);assert.equal(state.phase,'finished');assert.equal(state.winners.length,3);});
test('cooks validate phase, exact-three stock, unordered recipe, one global discovery bonus and receipts',()=>{const s=setup();const t=s.room().teams[0];Object.assign(t.inventory,{Bread:2,Cheese:2,Tomato:2});start(s);assert.throws(()=>s.act(s.teams[0].teamToken,'pupil:cook',{ingredients:['Bread','Cheese','Tomato']}),/only available/);cookPhase(s);const request={type:'pupil:cook',requestId:randomUUID(),questionId:s.store.currentQuestion(s.room()).id,expectedPhase:s.room().phase,ingredients:['Tomato','Bread','Cheese']};const a=s.store.action(s.host.pin,s.teams[0].teamToken,request);assert.equal(a.result.cook.dish.name,'Mini Pizza');assert.equal(a.result.cook.starsEarned,3);assert.equal(s.room().teams[0].stars,3);assert.equal(count(s.room().teams[0]),3);s.store.action(s.host.pin,s.teams[0].teamToken,request);assert.equal(count(s.room().teams[0]),3);const b=s.act(s.teams[0].teamToken,'pupil:cook',{ingredients:['Cheese','Tomato','Bread']});assert.equal(b.result.cook.starsEarned,2);assert.equal(count(s.room().teams[0]),0);assert.throws(()=>s.act(s.teams[0].teamToken,'pupil:cook',{ingredients:['Cheese','Tomato','Bread']}),/bag changed/);const other=s.room().teams[1];Object.assign(other.inventory,{Bread:1,Cheese:1,Tomato:1});assert.equal(s.act(s.teams[1].teamToken,'pupil:cook',{ingredients:['Bread','Cheese','Tomato']}).result.cook.starsEarned,2);});
test('failed cooking consumes three, never subtracts stars; duplicates require enough quantity',()=>{const s=setup();cookPhase(s);const t=s.room().teams[0];Object.assign(t.inventory,{Chocolate:1,Chicken:1,Mushroom:1,Bread:1,Cheese:1});t.stars=5;assert.throws(()=>s.act(s.teams[0].teamToken,'pupil:cook',{ingredients:['Bread','Bread','Cheese']}),/bag changed/);assert.throws(()=>s.act(s.teams[0].teamToken,'pupil:cook',{ingredients:['Bread','Cheese']}),/exactly three/);const r=s.act(s.teams[0].teamToken,'pupil:cook',{ingredients:['Mushroom','Chocolate','Chicken']});assert.equal(r.result.cook.dish.success,false);assert.equal(r.result.cook.starsEarned,0);assert.equal(s.room().teams[0].stars,5);assert.equal(count(s.room().teams[0]),2);});
test('two simultaneous cook attempts cannot overspend the same inventory',async()=>{const s=setup();cookPhase(s);Object.assign(s.room().teams[0].inventory,{Bread:1,Cheese:1,Tomato:1});const outcomes=await Promise.allSettled([1,2].map(()=>Promise.resolve().then(()=>s.act(s.teams[0].teamToken,'pupil:cook',{ingredients:['Bread','Cheese','Tomato']}))));assert.equal(outcomes.filter(r=>r.status==='fulfilled').length,1);assert.equal(count(s.room().teams[0]),0);});
test('Sneaky Snack has no stars/bonus, stores power on invalid target, steals one once and protects rival for round',()=>{const s=setup();cookPhase(s);const a=s.room().teams[0];Object.assign(a.inventory,{Bread:2,Mushroom:2,Fruit:2});for(let i=0;i<2;i++)s.act(s.teams[0].teamToken,'pupil:cook',{ingredients:['Bread','Mushroom','Fruit']});assert.equal(a.stars,0);assert.equal(a.powers.length,2);const power=a.powers[0].id;assert.throws(()=>s.act(s.teams[0].teamToken,'pupil:steal',{powerId:power,targetTeamId:s.teams[1].teamId}),/no ingredients/);assert.equal(s.room().teams[0].powers.length,2);s.room().teams[1].inventory.Egg=2;const request={type:'pupil:steal',requestId:randomUUID(),questionId:s.store.currentQuestion(s.room()).id,expectedPhase:s.room().phase,powerId:power,targetTeamId:s.teams[1].teamId};s.store.action(s.host.pin,s.teams[0].teamToken,request);s.store.action(s.host.pin,s.teams[0].teamToken,request);assert.equal(s.room().teams[1].inventory.Egg,1);assert.equal(s.room().teams[0].inventory.Egg,1);assert.throws(()=>s.act(s.teams[0].teamToken,'pupil:steal',{powerId:s.room().teams[0].powers[0].id,targetTeamId:s.teams[1].teamId}),/already lost/);assert.equal(s.room().teams[0].powers.length,1);});
test('expired cooking, stale question, role escalation and reused receipt payload are rejected',()=>{const s=setup();const q=start(s);assert.throws(()=>s.act(s.teams[0].teamToken,'host:close'),/another role/);assert.throws(()=>s.act(undefined,'host:close'),/key is required/);assert.throws(()=>s.act(s.teams[0].teamToken,'pupil:submit',{questionId:'old',answer:'x'}),/ended/);const b={type:'pupil:submit',requestId:randomUUID(),questionId:q.id,answer:'x'};s.store.action(s.host.pin,s.teams[0].teamToken,b);assert.throws(()=>s.store.action(s.host.pin,s.teams[0].teamToken,{...b,answer:'y'}),/different action/);s.act(s.host.hostToken,'host:review',{teamId:s.teams[0].teamId,questionId:q.id,decision:'rejected'});cookPhase(s);s.tick(31000);assert.throws(()=>s.act(s.teams[0].teamToken,'pupil:cook',{ingredients:['Bread','Cheese','Tomato']}),/bell has rung/);});
test('serialized restore keeps host/team identities and action receipts with the room secret',()=>{const s=setup();const q=start(s);s.act(s.teams[0].teamToken,'pupil:submit',{questionId:q.id,answer:q.canonicalAnswer});const b={type:'host:review',requestId:randomUUID(),teamId:s.teams[0].teamId,questionId:q.id,decision:'accepted'};s.store.action(s.host.pin,s.host.hostToken,b);const restored=new GameStore({questions,secret:s.store.secret,now:()=>1770000001000});restored.rooms.set(s.host.pin,JSON.parse(JSON.stringify(s.room())));assert.equal(restored.state(s.host.pin,s.teams[0].teamToken).me.inventory.Bread,1);assert.equal(restored.action(s.host.pin,s.host.hostToken,b).replayed,true);assert.equal(restored.state(s.host.pin,s.teams[0].teamToken).me.inventory.Bread,1);});
test('fixed catalogue has40 dishes and one special; original examples and zero disaster remain intact',()=>{assert.equal(Object.values(RECIPES).filter(x=>x.type==='dish').length,40);assert.equal(Object.values(RECIPES).filter(x=>x.type==='steal').length,1);assert.equal(RECIPES[recipeKey(['Chicken','Tomato','Cheese'])].stars,3);assert.equal(RECIPES[recipeKey(['Chocolate','Chicken','Mushroom'])],undefined);for(const r of Object.values(RECIPES)){assert.equal(r.ingredients.length,3);assert.ok(r.ingredients.every(x=>INGREDIENTS.includes(x)));}});

test('all five rebuilds expose opaque stable room-specific IDs, never source answer-order IDs',()=>{
 const s=setup();start(s);
 const second=setup();start(second);
 let checked=0;
 for(let index=0;index<s.room().questions.length;index++){
  const source=s.room().questions[index];
  if(source.format!=='sentence_rebuild')continue;
  checked++;s.room().questionIndex=index;
  const originalIds=source.tokens.map(t=>t.id);
  const publicState=s.store.state(s.host.pin);
  const pupil=s.store.state(s.host.pin,s.teams[0].teamToken);
  const teacher=s.store.state(s.host.pin,s.host.hostToken);
  const tokens=publicState.question.tokens;
  assert.deepEqual(tokens,pupil.question.tokens);
  assert.deepEqual(tokens,teacher.question.tokens);
  assert.equal(new Set(tokens.map(t=>t.id)).size,tokens.length);
  for(const token of tokens){assert.match(token.id,/^[a-f0-9]{24}$/);assert.ok(!originalIds.includes(token.id));assert.deepEqual(Object.keys(token).sort(),['id','text']);}
  for(const snapshot of [publicState,pupil]){
   assert.equal(snapshot.question.canonicalTokenOrder,undefined);
   assert.equal(snapshot.question.acceptedTokenOrders,undefined);
   assert.equal(snapshot.question.canonicalAnswer,undefined);
   assert.equal(snapshot.answerKey,undefined);
   assert.equal(snapshot.answerReveal,null);
  }
  // All canonical and alternative teacher orders still resolve to precisely
  // their original word sequence using the displayed opaque IDs.
  const byId=new Map(tokens.map(t=>[t.id,t.text]));
  const originalById=new Map(source.tokens.map(t=>[t.id,t.text]));
  assert.deepEqual(teacher.answerKey.canonicalTokenOrder.map(id=>byId.get(id)),source.canonicalTokenOrder.map(id=>originalById.get(id)));
  assert.deepEqual(teacher.answerKey.acceptedTokenOrders.map(order=>order.map(id=>byId.get(id))),source.acceptedTokenOrders.map(order=>order.map(id=>originalById.get(id))));
  const restore=new GameStore({questions,secret:s.store.secret,now:()=>1770000001000});
  restore.rooms.set(s.host.pin,JSON.parse(JSON.stringify(s.room())));
  assert.deepEqual(restore.state(s.host.pin).question.tokens,tokens);
  second.room().questionIndex=second.room().questions.findIndex(q=>q.id===source.id);
  assert.notDeepEqual(second.store.state(second.host.pin).question.tokens.map(t=>t.id),tokens.map(t=>t.id));
 }
 assert.equal(checked,5);
});

test('late first-delivery round commands are rejected while committed old receipts still replay',()=>{
 const s=setup();const q1=start(s);
 const make=(type,phase,extra={})=>({type,requestId:randomUUID(),questionId:q1.id,expectedPhase:phase,...extra});
 const staleReveal=make('host:reveal','question');
 const committedReveal=make('host:reveal','question');
 s.store.action(s.host.pin,s.host.hostToken,committedReveal);
 const staleAdvance=make('host:advance','reveal');
 const committedAdvance=make('host:advance','reveal');
 s.store.action(s.host.pin,s.host.hostToken,committedAdvance);
 assert.throws(()=>s.store.action(s.host.pin,s.host.hostToken,staleAdvance),e=>e.code==='STALE_CONTEXT');
 const staleEnd=make('host:end-rush','rush');
 const team=s.room().teams[0];const rival=s.room().teams[1];
 Object.assign(team.inventory,{Bread:2,Cheese:2,Tomato:2});team.powers.push({id:'saved-power-1',type:'steal'},{id:'saved-power-2',type:'steal'});rival.inventory.Egg=2;
 const committedCook=make('pupil:cook','rush',{ingredients:['Bread','Cheese','Tomato']});
 const oldCook=make('pupil:cook','rush',{ingredients:['Bread','Cheese','Tomato']});
 s.store.action(s.host.pin,s.teams[0].teamToken,committedCook);
 const committedSteal=make('pupil:steal','rush',{powerId:'saved-power-1',targetTeamId:rival.id});
 const oldSteal=make('pupil:steal','rush',{powerId:'saved-power-2',targetTeamId:rival.id});
 s.store.action(s.host.pin,s.teams[0].teamToken,committedSteal);
 const committedEnd=make('host:end-rush','rush');s.store.action(s.host.pin,s.host.hostToken,committedEnd);
 const lateRushAdvance=make('host:advance','rush');
 s.act(s.host.hostToken,'host:advance');
 assert.notEqual(s.store.currentQuestion(s.room()).id,q1.id);assert.equal(s.room().phase,'question');
 for(const action of [staleReveal,staleAdvance,staleEnd,lateRushAdvance]){
  const before=JSON.stringify(s.room());
  assert.throws(()=>s.store.action(s.host.pin,s.host.hostToken,action),e=>e.code==='STALE_CONTEXT');
  assert.equal(JSON.stringify(s.room()),before);
 }
 for(const action of [committedReveal,committedAdvance,committedEnd]){
  const before=JSON.stringify(s.room());
  assert.equal(s.store.action(s.host.pin,s.host.hostToken,action).replayed,true);
  assert.equal(JSON.stringify(s.room()),before);
 }
 s.act(s.host.hostToken,'host:reveal');s.act(s.host.hostToken,'host:advance');
 assert.equal(s.room().phase,'rush');
 for(const action of [oldCook,oldSteal]){
  const before=JSON.stringify(s.room());
  assert.throws(()=>s.store.action(s.host.pin,s.teams[0].teamToken,action),e=>e.code==='STALE_CONTEXT');
  assert.equal(JSON.stringify(s.room()),before);
 }
 for(const action of [committedCook,committedSteal]){
  const before=JSON.stringify(s.room());
  assert.equal(s.store.action(s.host.pin,s.teams[0].teamToken,action).replayed,true);
  assert.equal(JSON.stringify(s.room()),before);
 }
});

test('round-sensitive commands require context even when current phase otherwise permits them',()=>{
 const s=setup();start(s);
 assert.throws(()=>s.store.action(s.host.pin,s.host.hostToken,{type:'host:reveal',requestId:randomUUID()}),e=>e.code==='STALE_CONTEXT');
 s.act(s.host.hostToken,'host:reveal');
 assert.throws(()=>s.store.action(s.host.pin,s.host.hostToken,{type:'host:advance',requestId:randomUUID()}),e=>e.code==='STALE_CONTEXT');
 s.act(s.host.hostToken,'host:advance');
 for(const type of ['host:end-rush','pupil:cook','pupil:steal']){
  assert.throws(()=>s.store.action(s.host.pin,type.startsWith('host:')?s.host.hostToken:s.teams[0].teamToken,{type,requestId:randomUUID()}),e=>e.code==='STALE_CONTEXT');
 }
});
