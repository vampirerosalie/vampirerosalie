import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {randomUUID} from 'node:crypto';
import {GameStore,INGREDIENTS,RECIPES,recipeKey,normalizeAnswer} from '../../app/battle7/core/game.js';
const questions=JSON.parse(readFileSync(new URL('../../app/battle7/data/question-bank.json',import.meta.url),'utf8')).questions;
const set2=JSON.parse(readFileSync(new URL('../../app/battle7/data/question-bank-set2.json',import.meta.url),'utf8')).questions;
const disasters=[['Mushroom','Chocolate','Tomato'],['Bread','Egg','Mushroom'],['Rice','Fruit','Cheese'],['Chicken','Chocolate','Milk'],['Egg','Tomato','Fruit']];
function setup(extra={}){let time=1770000000000;const store=new GameStore({questions,now:()=>time,random:()=>0,...extra});const host=store.create({teamCount:extra.roomTeamCount??3});const teams=[1,2,3].map(i=>store.join(host.pin,{teamSlot:i,name:`Team ${i}`,clientId:randomUUID()}));const act=(token,type,values={})=>store.action(host.pin,token,{type,requestId:randomUUID(),questionId:store.currentQuestion(store.room(host.pin))?.id,expectedPhase:store.room(host.pin).phase,...values});return{store,host,teams,act,room:()=>store.room(host.pin),tick:n=>time+=n};}
function start(s){s.act(s.host.hostToken,'host:start');return s.room().questions[s.room().questionIndex];}
function cookPhase(s){if(s.room().phase==='lobby')start(s);s.act(s.host.hostToken,'host:reveal');}
const count=t=>Object.values(t.inventory).reduce((a,b)=>a+b,0);

test('bank has 20 unique mixed questions, four per tense, rebuild tokens conserve words',()=>{assert.equal(questions.length,20);assert.equal(new Set(questions.map(q=>q.id)).size,20);const tenses={};const formats={};for(const q of questions){tenses[q.targetTense]=(tenses[q.targetTense]??0)+1;formats[q.format]=(formats[q.format]??0)+1;if(q.tokens){assert.deepEqual([...q.canonicalTokenOrder].sort(),q.tokens.map(t=>t.id).sort());}}assert.deepEqual(Object.values(tenses),[4,4,4,4,4]);assert.equal(formats.typed_correction,10);assert.equal(formats.multiple_choice,5);assert.equal(formats.sentence_rebuild,5);});
test('Set 2 has the exact format and tense balance, answer-letter balance and complete rebuilds',()=>{
 assert.equal(set2.length,20);assert.equal(new Set(set2.map(q=>q.id)).size,20);
 const count=field=>Object.fromEntries([...new Set(set2.map(q=>q[field]))].map(value=>[value,set2.filter(q=>q[field]===value).length]));
 assert.deepEqual(count('format'),{multiple_choice:8,typed_correction:8,sentence_rebuild:4});
 assert.deepEqual(count('targetTense'),{present_perfect:8,past_simple:6,past_perfect:6});
 assert.deepEqual(Object.fromEntries('ABCD'.split('').map(letter=>[letter,set2.filter(q=>q.correctOptionId===letter).length])),{A:2,B:2,C:2,D:2});
 for(const q of set2){assert.ok(q.canonicalAnswer&&q.feedback?.explanation&&q.acceptedVariants?.length);if(q.format==='typed_correction'){assert.equal(q.promptSegments.filter(s=>s.bold).length,1);assert.match(q.instruction,/Replace only/);}if(q.format==='multiple_choice'){assert.equal(q.options.length,4);assert.equal(q.options.find(o=>o.id===q.correctOptionId).text,q.canonicalAnswer);}if(q.format==='sentence_rebuild'){assert.deepEqual([...q.canonicalTokenOrder].sort(),q.tokens.map(t=>t.id).sort());assert.equal(q.acceptedTokenOrders.length,q.acceptedVariants.length);for(const order of q.acceptedTokenOrders)assert.deepEqual([...order].sort(),q.tokens.map(t=>t.id).sort());}}
 assert.deepEqual(set2[3].acceptedVariants,['I have not finished yet.','I have not yet finished.']);
});
test('teacher can choose Set 2 in lobby, persistence and reconnect keep it, active rooms cannot switch, legacy rooms default to Set 1',()=>{
 const s=setup({questionSets:{set2}});assert.equal(s.store.state(s.host.pin,s.host.hostToken).questionSetId,'set1');
 assert.throws(()=>s.act(s.teams[0].teamToken,'host:select-set',{questionSetId:'set2'}),/another role/);
 assert.throws(()=>s.act(s.host.hostToken,'host:select-set',{questionSetId:'set3'}),e=>e.code==='INVALID_QUESTION_SET');
 s.act(s.host.hostToken,'host:select-set',{questionSetId:'set2'});assert.equal(s.room().questionSetId,'set2');assert.deepEqual(new Set(s.room().questions.map(q=>q.id)),new Set(set2.map(q=>q.id)));
 const restored=new GameStore({questions,questionSets:{set2},secret:s.store.secret,now:()=>1770000001000});restored.rooms.set(s.host.pin,JSON.parse(JSON.stringify(s.room())));
 assert.equal(restored.state(s.host.pin,s.host.hostToken).questionSetId,'set2');assert.equal(restored.state(s.host.pin,s.teams[0].teamToken).questionSetId,'set2');
 start(s);assert.throws(()=>s.act(s.host.hostToken,'host:select-set',{questionSetId:'set1'}),e=>e.code==='WRONG_PHASE');
 const seen=[];for(let i=0;i<20;i++){seen.push(s.store.currentQuestion(s.room()).id);s.act(s.host.hostToken,'host:reveal');s.act(s.host.hostToken,'host:advance');}
 assert.deepEqual(new Set(seen),new Set(set2.map(q=>q.id)));assert.equal(s.room().phase,'finished');
 const old=setup({questionSets:{set2}});delete old.room().questionSetId;assert.equal(old.store.state(old.host.pin,old.host.hostToken).questionSetId,'set1');assert.deepEqual(new Set(old.room().questions.map(q=>q.id)),new Set(questions.map(q=>q.id)));
});
test('ten distinct stations; retry join restores identity and cannot occupy a second slot',()=>{const s=setup({roomTeamCount:10});const id=randomUUID();const t=s.store.join(s.host.pin,{teamSlot:4,name:'Owls',clientId:id});assert.deepEqual(s.store.join(s.host.pin,{teamSlot:7,name:'ignored',clientId:id}),t);assert.throws(()=>s.store.join(s.host.pin,{teamSlot:4,name:'Other',clientId:randomUUID()}),/taken/);for(let i=5;i<=10;i++)s.store.join(s.host.pin,{teamSlot:i,name:`Team${i}`,clientId:randomUUID()});assert.equal(s.room().teams.length,10);assert.throws(()=>s.store.join(s.host.pin,{teamSlot:11,name:'Extra',clientId:randomUUID()}),/available/);});
test('public and pupil snapshots hide teacher answer key and entire hidden catalogue',()=>{const s=setup();const q=start(s);for(const token of [undefined,s.teams[0].teamToken]){const state=s.store.state(s.host.pin,token);assert.equal(state.answerKey,undefined);assert.equal(state.answerReveal,null);assert.equal(state.question.canonicalAnswer,undefined);assert.equal(state.question.targetTense,undefined);assert.equal(state.question.canonicalTokenOrder,undefined);assert.equal(state.recipes,undefined);}assert.equal(s.store.state(s.host.pin,s.host.hostToken).answerKey.canonicalAnswer,q.canonicalAnswer);});
test('manual accept rewards a pair once; retries and repeated decisions do not duplicate; reversal reuses the pair',()=>{const s=setup();const q=start(s);const t=s.teams[0];s.act(t.teamToken,'pupil:submit',{questionId:q.id,answer:'Teacher decides this'});assert.equal(count(s.room().teams[0]),0);const action={type:'host:review',requestId:randomUUID(),teamId:t.teamId,questionId:q.id,decision:'accepted'};const first=s.store.action(s.host.pin,s.host.hostToken,action);assert.equal(count(s.room().teams[0]),2);assert.deepEqual(first.result.rewards,['Bread','Bread']);assert.equal(s.store.action(s.host.pin,s.host.hostToken,action).replayed,true);s.act(s.host.hostToken,'host:review',{...action,requestId:randomUUID()});assert.equal(count(s.room().teams[0]),2);s.act(s.host.hostToken,'host:review',{teamId:t.teamId,questionId:q.id,decision:'rejected'});assert.equal(count(s.room().teams[0]),0);s.act(s.host.hostToken,'host:review',{teamId:t.teamId,questionId:q.id,decision:'accepted'});assert.equal(count(s.room().teams[0]),2);assert.equal(s.room().teams[0].inventory.Bread,2);});
test('the two reward units are independent weighted draws and may differ',()=>{const rolls=[0,9],s=setup({random:max=>{const roll=rolls.shift();assert.ok(roll<max);return roll;}}),q=start(s),t=s.teams[0];s.act(t.teamToken,'pupil:submit',{questionId:q.id,answer:'Two draws'});const result=s.act(s.host.hostToken,'host:review',{teamId:t.teamId,questionId:q.id,decision:'accepted'});assert.deepEqual(result.result.rewards,['Bread','Rice']);assert.equal(s.room().teams[0].inventory.Bread,1);assert.equal(s.room().teams[0].inventory.Rice,1);assert.equal(count(s.room().teams[0]),2);});
test('reject grants nothing; submitted answers lock and teacher must review before reveal',()=>{const s=setup();const q=start(s);const t=s.teams[0];s.act(t.teamToken,'pupil:submit',{questionId:q.id,answer:'no'});assert.throws(()=>s.act(s.host.hostToken,'host:reveal'),/Review every/);assert.throws(()=>s.act(t.teamToken,'pupil:submit',{questionId:q.id,answer:'again'}),/already submitted/);s.act(s.host.hostToken,'host:review',{teamId:t.teamId,questionId:q.id,decision:'rejected'});assert.equal(count(s.room().teams[0]),0);s.act(s.host.hostToken,'host:reveal');assert.equal(s.store.state(s.host.pin).answerReveal.canonicalAnswer,q.canonicalAnswer);assert.throws(()=>s.act(s.host.hostToken,'host:review',{teamId:t.teamId,questionId:q.id,decision:'accepted'}),/only available/);});
test('teacher countdown is shared, accepts answers until zero, then locks submissions and permits missing answers to be marked wrong',()=>{const s=setup(),q=start(s),ends=s.act(s.host.hostToken,'host:start-countdown').result.answerCountdownEndsAt;assert.equal(ends,1770000010000);assert.equal(s.store.state(s.host.pin,s.teams[0].teamToken).answerCountdownEndsAt,ends);s.tick(9999);s.act(s.teams[0].teamToken,'pupil:submit',{questionId:q.id,answer:'Just in time'});s.tick(1);assert.throws(()=>s.act(s.teams[1].teamToken,'pupil:submit',{questionId:q.id,answer:'Too late'}),error=>error.code==='ANSWER_TIME_UP');const rejected=s.act(s.host.hostToken,'host:review',{teamId:s.teams[1].teamId,questionId:q.id,decision:'rejected'});assert.equal(rejected.result.unanswered,true);assert.equal(count(s.room().teams[1]),0);assert.throws(()=>s.act(s.host.hostToken,'host:review',{teamId:s.teams[2].teamId,questionId:q.id,decision:'accepted'}),error=>error.code==='NO_SUBMISSION');const hostState=s.store.state(s.host.pin,s.host.hostToken),teamState=s.store.state(s.host.pin,s.teams[1].teamToken);assert.equal(hostState.submissions.find(x=>x.teamId===s.teams[1].teamId).unanswered,true);assert.equal(teamState.me.submission.unanswered,true);s.act(s.host.hostToken,'host:review',{teamId:s.teams[0].teamId,questionId:q.id,decision:'accepted'});s.act(s.host.hostToken,'host:reveal');assert.equal(s.room().answerCountdownEndsAt,null);});
test('normalization handles curly apostrophes and spacing without dropping negation',()=>{assert.equal(normalizeAnswer('  AREN ’T   COOKING!  '),"aren't cooking");assert.notEqual(normalizeAnswer("aren't cooking"),normalizeAnswer('are cooking'));});
test('20 shuffled unique questions advance directly with no timer and finish with tied winners',()=>{
 const s=setup();start(s);const seen=[];
 for(let i=0;i<20;i++){
  seen.push(s.room().questions[s.room().questionIndex].id);assert.equal(s.room().questionIndex,i);
  assert.equal(s.room().phase,'question');assert.equal(s.store.state(s.host.pin).cookingAvailable,true);
  s.act(s.host.hostToken,'host:reveal');assert.equal(s.room().phase,'reveal');
  s.act(s.host.hostToken,'host:advance');
  assert.equal(s.room().phase,i===19?'finished':'question');assert.equal(s.room().rushEndsAt,null);
 }
 assert.equal(new Set(seen).size,20);const state=s.store.state(s.host.pin);
 assert.equal(state.phase,'finished');assert.equal(state.winners.length,3);assert.equal(state.cookingAvailable,false);
});
test('cooks work during questions and reveals with exact-three stock, deterministic recipes and one discovery bonus',()=>{
 const s=setup();const t=s.room().teams[0];Object.assign(t.inventory,{Bread:2,Cheese:2,Tomato:2});
 assert.throws(()=>s.act(s.teams[0].teamToken,'pupil:cook',{ingredients:['Bread','Cheese','Tomato']}),/only available/);
 start(s);
 const request={type:'pupil:cook',requestId:randomUUID(),questionId:s.store.currentQuestion(s.room()).id,expectedPhase:s.room().phase,ingredients:['Tomato','Bread','Cheese']};
 const a=s.store.action(s.host.pin,s.teams[0].teamToken,request);
 assert.equal(a.result.cook.dish.name,'Mini Pizza');assert.equal(a.result.cook.starsEarned,3);assert.equal(s.room().teams[0].stars,3);assert.equal(count(s.room().teams[0]),3);
 s.store.action(s.host.pin,s.teams[0].teamToken,request);assert.equal(count(s.room().teams[0]),3);
 s.act(s.host.hostToken,'host:reveal');s.tick(120000);
 const b=s.act(s.teams[0].teamToken,'pupil:cook',{ingredients:['Cheese','Tomato','Bread']});
 assert.equal(b.result.cook.starsEarned,2);assert.equal(count(s.room().teams[0]),0);
 assert.throws(()=>s.act(s.teams[0].teamToken,'pupil:cook',{ingredients:['Cheese','Tomato','Bread']}),/bag changed/);
 const other=s.room().teams[1];Object.assign(other.inventory,{Bread:1,Cheese:1,Tomato:1});
 assert.equal(s.act(s.teams[1].teamToken,'pupil:cook',{ingredients:['Bread','Cheese','Tomato']}).result.cook.starsEarned,2);
});
test('basic cooking consumes three and earns one star; duplicates still require enough quantity',()=>{const s=setup();cookPhase(s);const t=s.room().teams[0];Object.assign(t.inventory,{Chocolate:1,Chicken:1,Mushroom:1,Bread:1,Cheese:1});t.stars=5;assert.throws(()=>s.act(s.teams[0].teamToken,'pupil:cook',{ingredients:['Bread','Bread','Cheese']}),/bag changed/);assert.throws(()=>s.act(s.teams[0].teamToken,'pupil:cook',{ingredients:['Bread','Cheese']}),/exactly three/);const r=s.act(s.teams[0].teamToken,'pupil:cook',{ingredients:['Mushroom','Chocolate','Chicken']});assert.equal(r.result.cook.dish.success,true);assert.equal(r.result.cook.dish.type,'basic');assert.equal(r.result.cook.starsEarned,1);assert.equal(s.room().teams[0].stars,6);assert.equal(count(s.room().teams[0]),2);});
test('five hidden disasters work in any order, consume three, go negative, never discover and replay once',()=>{
 const s=setup();start(s);const team=s.room().teams[0],token=s.teams[0].teamToken;
 for(const items of disasters){
  assert.equal(RECIPES[recipeKey(items)],undefined);
  for(const item of items)team.inventory[item]=(team.inventory[item]||0)+2;
  const reversed=[...items].reverse(),body={type:'pupil:cook',requestId:randomUUID(),questionId:s.store.currentQuestion(s.room()).id,expectedPhase:s.room().phase,ingredients:reversed};
  const before=team.stars,first=s.store.action(s.host.pin,token,body),replayed=s.store.action(s.host.pin,token,body);
  assert.equal(first.result.cook.dish.name,'Kitchen Disaster!');assert.equal(first.result.cook.starsEarned,-1);assert.equal(first.result.cook.discoveryBonus,0);assert.equal(first.result.power,null);assert.equal(team.stars,before-1);assert.equal(replayed.replayed,true);assert.equal(team.stars,before-1);
  const second=s.act(token,'pupil:cook',{ingredients:items});assert.equal(second.result.cook.starsEarned,-1);assert.equal(team.stars,before-2);assert.equal(count(team),0);
  assert.equal(team.recipes[recipeKey(items)],undefined);assert.equal(s.room().discoveries[recipeKey(items)],undefined);
 }
 assert.equal(team.stars,-10);assert.deepEqual(team.recipes,{});assert.deepEqual(s.room().discoveries,{});
 const reconnected=new GameStore({questions,secret:s.store.secret,now:()=>1770000001000});reconnected.rooms.set(s.host.pin,JSON.parse(JSON.stringify(s.room())));
 const state=reconnected.state(s.host.pin,token);assert.equal(state.me.stars,-10);assert.equal(state.me.recipes.length,0);assert.equal(state.teams[0].recipesCount,0);assert.equal(state.latestCooks.length,10);
 Object.assign(team.inventory,{Bread:1,Cheese:1,Tomato:1});const good=s.act(token,'pupil:cook',{ingredients:['Tomato','Bread','Cheese']});assert.equal(good.result.cook.starsEarned,3);assert.equal(team.stars,-7);
});
test('two simultaneous cook attempts cannot overspend the same inventory',async()=>{const s=setup();cookPhase(s);Object.assign(s.room().teams[0].inventory,{Bread:1,Cheese:1,Tomato:1});const outcomes=await Promise.allSettled([1,2].map(()=>Promise.resolve().then(()=>s.act(s.teams[0].teamToken,'pupil:cook',{ingredients:['Bread','Cheese','Tomato']}))));assert.equal(outcomes.filter(r=>r.status==='fulfilled').length,1);assert.equal(count(s.room().teams[0]),0);});
test('Sneaky Snack has no stars/bonus, stores power on invalid target, steals one once and protects rival for round',()=>{const s=setup();cookPhase(s);const a=s.room().teams[0];Object.assign(a.inventory,{Bread:2,Mushroom:2,Fruit:2});for(let i=0;i<2;i++)s.act(s.teams[0].teamToken,'pupil:cook',{ingredients:['Bread','Mushroom','Fruit']});assert.equal(a.stars,0);assert.equal(a.powers.length,2);const power=a.powers[0].id;assert.throws(()=>s.act(s.teams[0].teamToken,'pupil:steal',{powerId:power,targetTeamId:s.teams[1].teamId}),/no ingredients/);assert.equal(s.room().teams[0].powers.length,2);s.room().teams[1].inventory.Egg=2;const request={type:'pupil:steal',requestId:randomUUID(),questionId:s.store.currentQuestion(s.room()).id,expectedPhase:s.room().phase,powerId:power,targetTeamId:s.teams[1].teamId};s.store.action(s.host.pin,s.teams[0].teamToken,request);s.store.action(s.host.pin,s.teams[0].teamToken,request);assert.equal(s.room().teams[1].inventory.Egg,1);assert.equal(s.room().teams[0].inventory.Egg,1);assert.throws(()=>s.act(s.teams[0].teamToken,'pupil:steal',{powerId:s.room().teams[0].powers[0].id,targetTeamId:s.teams[1].teamId}),/already lost/);assert.equal(s.room().teams[0].powers.length,1);});
test('Star Snatcher Tart stores a zero-star power, transfers one star once, and resets separate target protection only on the next question',()=>{
 const waiting=setup();waiting.room().teams[0].powers.push({id:'waiting-star-power',type:'steal-star'});waiting.room().teams[1].stars=1;
 assert.throws(()=>waiting.act(waiting.teams[0].teamToken,'pupil:steal-star',{powerId:'waiting-star-power',targetTeamId:waiting.teams[1].teamId}),e=>e.code==='WRONG_PHASE');
 const s=setup();start(s);const [attackerId,rivalId,otherId]=s.room().teams.map(team=>team.id);Object.assign(s.room().teams[0].inventory,{Bread:1,Cheese:1,Chocolate:1});const before=s.room().teams[0].stars;
 const cooked=s.act(s.teams[0].teamToken,'pupil:cook',{ingredients:['Chocolate','Bread','Cheese']}).result;
 assert.equal(cooked.cook.dish.name,'Star Snatcher Tart');assert.equal(cooked.cook.starsEarned,0);assert.equal(cooked.cook.discoveryBonus,0);assert.equal(s.room().teams[0].stars,before);assert.equal(cooked.power.type,'steal-star');assert.equal(s.room().discoveries[recipeKey(['Bread','Cheese','Chocolate'])],undefined);
 assert.equal(s.room().teams[0].recipes[recipeKey(['Bread','Cheese','Chocolate'])].name,'Star Snatcher Tart');assert.equal(s.store.state(s.host.pin,s.teams[0].teamToken).me.recipes.filter(r=>r.name==='Star Snatcher Tart').length,1);
 const power=cooked.power.id;assert.throws(()=>s.act(s.teams[0].teamToken,'pupil:steal-star',{powerId:power,targetTeamId:attackerId}),e=>e.code==='INVALID_STAR_TARGET');assert.equal(s.room().teams[0].powers.length,1);
 assert.throws(()=>s.act(s.teams[0].teamToken,'pupil:steal-star',{powerId:power,targetTeamId:rivalId}),e=>e.code==='NO_STARS');assert.equal(s.room().teams[0].powers.length,1);
 s.room().teams[1].stars=2;const request={type:'pupil:steal-star',requestId:randomUUID(),questionId:s.store.currentQuestion(s.room()).id,expectedPhase:s.room().phase,powerId:power,targetTeamId:rivalId};
 const first=s.store.action(s.host.pin,s.teams[0].teamToken,request);const replay=s.store.action(s.host.pin,s.teams[0].teamToken,request);assert.equal(replay.replayed,true);assert.equal(first.result.stars,1);assert.equal(s.room().teams[0].stars,before+1);assert.equal(s.room().teams[1].stars,1);assert.equal(s.room().teams[0].powers.length,0);assert.equal(s.room().events.at(-1).type,'star-theft');
 s.room().teams[0].powers.push({id:'separate-protection',type:'steal-star'});s.room().teams[2].stars=2;s.room().incomingThefts[otherId]=true;s.act(s.teams[0].teamToken,'pupil:steal-star',{powerId:'separate-protection',targetTeamId:otherId});assert.equal(s.room().teams[2].stars,1);
 s.room().teams[1].powers.push({id:'blocked-power',type:'steal-star'});assert.throws(()=>s.act(s.teams[1].teamToken,'pupil:steal-star',{powerId:'blocked-power',targetTeamId:otherId}),e=>e.code==='STAR_TARGET_PROTECTED');assert.ok(s.room().teams[1].powers.some(p=>p.id==='blocked-power'));
 s.act(s.host.hostToken,'host:reveal');assert.throws(()=>s.act(s.teams[1].teamToken,'pupil:steal-star',{powerId:'blocked-power',targetTeamId:otherId}),e=>e.code==='STAR_TARGET_PROTECTED');s.act(s.host.hostToken,'host:advance');
 s.act(s.teams[1].teamToken,'pupil:steal-star',{powerId:'blocked-power',targetTeamId:otherId});assert.equal(s.room().teams[2].stars,0);assert.equal(s.room().teams[1].stars,2);assert.equal(s.room().teams[1].powers.length,0);
 s.act(s.host.hostToken,'host:close');s.room().teams[1].powers.push({id:'ended-power',type:'steal-star'});assert.throws(()=>s.act(s.teams[1].teamToken,'pupil:steal-star',{powerId:'ended-power',targetTeamId:attackerId}),e=>e.code==='ROOM_CLOSED');
});
test('finished cooking, stale question, role escalation and reused receipt payload are rejected',()=>{
 const s=setup();const q=start(s);
 assert.throws(()=>s.act(s.teams[0].teamToken,'host:close'),/another role/);
 assert.throws(()=>s.act(undefined,'host:close'),/key is required/);
 assert.throws(()=>s.act(s.teams[0].teamToken,'pupil:submit',{questionId:'old',answer:'x'}),/ended/);
 const b={type:'pupil:submit',requestId:randomUUID(),questionId:q.id,answer:'x'};
 s.store.action(s.host.pin,s.teams[0].teamToken,b);
 assert.throws(()=>s.store.action(s.host.pin,s.teams[0].teamToken,{...b,answer:'y'}),/different action/);
 s.act(s.host.hostToken,'host:review',{teamId:s.teams[0].teamId,questionId:q.id,decision:'rejected'});
 s.room().questionIndex=19;cookPhase(s);s.act(s.host.hostToken,'host:advance');
 assert.throws(()=>s.act(s.teams[0].teamToken,'pupil:cook',{ingredients:['Bread','Cheese','Tomato']}),/only available/);
});
test('serialized restore keeps host/team identities and pair-reward action receipts with the room secret',()=>{const s=setup();const q=start(s);s.act(s.teams[0].teamToken,'pupil:submit',{questionId:q.id,answer:q.canonicalAnswer});const b={type:'host:review',requestId:randomUUID(),teamId:s.teams[0].teamId,questionId:q.id,decision:'accepted'};s.store.action(s.host.pin,s.host.hostToken,b);const restored=new GameStore({questions,secret:s.store.secret,now:()=>1770000001000});restored.rooms.set(s.host.pin,JSON.parse(JSON.stringify(s.room())));assert.equal(restored.state(s.host.pin,s.teams[0].teamToken).me.inventory.Bread,2);assert.equal(restored.action(s.host.pin,s.host.hostToken,b).replayed,true);assert.equal(restored.state(s.host.pin,s.teams[0].teamToken).me.inventory.Bread,2);});
test('fixed catalogue has 40 dishes and both sabotage recipes without collisions; original recipe values remain intact',()=>{assert.equal(Object.values(RECIPES).filter(x=>x.type==='dish').length,40);assert.equal(Object.values(RECIPES).filter(x=>x.type==='steal').length,1);assert.equal(Object.values(RECIPES).filter(x=>x.type==='steal-star').length,1);assert.equal(RECIPES[recipeKey(['Bread','Cheese','Chocolate'])].name,'Star Snatcher Tart');assert.equal(RECIPES[recipeKey(['Chicken','Tomato','Cheese'])].stars,3);assert.equal(RECIPES[recipeKey(['Chocolate','Chicken','Mushroom'])],undefined);for(const r of Object.values(RECIPES)){assert.equal(r.ingredients.length,3);assert.ok(r.ingredients.every(x=>INGREDIENTS.includes(x)));}});

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
 const team=s.room().teams[0];const rival=s.room().teams[1];
 Object.assign(team.inventory,{Bread:2,Cheese:2,Tomato:2});
 team.powers.push({id:'saved-power-1',type:'steal'},{id:'saved-power-2',type:'steal'});rival.inventory.Egg=2;
 const committedCook=make('pupil:cook','question',{ingredients:['Bread','Cheese','Tomato']});
 const oldCook=make('pupil:cook','question',{ingredients:['Bread','Cheese','Tomato']});
 s.store.action(s.host.pin,s.teams[0].teamToken,committedCook);
 const committedSteal=make('pupil:steal','question',{powerId:'saved-power-1',targetTeamId:rival.id});
 const oldSteal=make('pupil:steal','question',{powerId:'saved-power-2',targetTeamId:rival.id});
 s.store.action(s.host.pin,s.teams[0].teamToken,committedSteal);
 s.store.action(s.host.pin,s.host.hostToken,committedReveal);
 const staleAdvance=make('host:advance','reveal');
 const committedAdvance=make('host:advance','reveal');
 s.store.action(s.host.pin,s.host.hostToken,committedAdvance);
 assert.notEqual(s.store.currentQuestion(s.room()).id,q1.id);assert.equal(s.room().phase,'question');
 for(const action of [staleReveal,staleAdvance,make('host:end-rush','rush')]){
  const before=JSON.stringify(s.room());
  assert.throws(()=>s.store.action(s.host.pin,s.host.hostToken,action),e=>e.code==='STALE_CONTEXT');
  assert.equal(JSON.stringify(s.room()),before);
 }
 for(const action of [committedReveal,committedAdvance]){
  const before=JSON.stringify(s.room());
  assert.equal(s.store.action(s.host.pin,s.host.hostToken,action).replayed,true);
  assert.equal(JSON.stringify(s.room()),before);
 }
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

test('round-sensitive commands require context even when the current phase permits them',()=>{
 const s=setup();start(s);
 assert.throws(()=>s.store.action(s.host.pin,s.host.hostToken,{type:'host:reveal',requestId:randomUUID()}),e=>e.code==='STALE_CONTEXT');
 s.act(s.host.hostToken,'host:reveal');
 assert.throws(()=>s.store.action(s.host.pin,s.host.hostToken,{type:'host:advance',requestId:randomUUID()}),e=>e.code==='STALE_CONTEXT');
 for(const type of ['host:end-rush','pupil:cook','pupil:steal','pupil:steal-star']){
  assert.throws(()=>s.store.action(s.host.pin,type.startsWith('host:')?s.host.hostToken:s.teams[0].teamToken,{type,requestId:randomUUID()}),e=>e.code==='STALE_CONTEXT');
 }
});

test('teacher can configure lobby team count without discarding occupied stations or allowing pupil control',()=>{
 const s=setup({roomTeamCount:10});
 const originalTeams=structuredClone(s.room().teams);
 for(const teamCount of [1,11,2.5,'3'])assert.throws(()=>s.act(s.host.hostToken,'host:configure',{teamCount}),/2–10/);
 assert.throws(()=>s.act(s.host.hostToken,'host:configure',{teamCount:2}),e=>e.code==='STATION_OCCUPIED');
 assert.equal(s.act(s.host.hostToken,'host:configure',{teamCount:3}).result.teamCount,3);
 assert.deepEqual(s.room().teams,originalTeams);
 assert.equal(s.store.state(s.host.pin,s.host.hostToken).teamCount,3);
 s.act(s.host.hostToken,'host:configure',{teamCount:4});
 assert.throws(()=>start(s),e=>e.code==='NEED_TEAMS');
 s.act(s.host.hostToken,'host:configure',{teamCount:3});start(s);
 assert.throws(()=>s.act(s.host.hostToken,'host:configure',{teamCount:4}),e=>e.code==='WRONG_PHASE');
});

test('every teacher mutation requires the host capability and cannot alter state through a pupil or public token',()=>{
 const s=setup();
 for(const type of ['host:configure','host:start','host:review','host:reveal','host:advance','host:end-rush','host:close']){
  const before=JSON.stringify(s.room());
  for(const token of [undefined,s.teams[0].teamToken,'invalid-capability']){
   assert.throws(()=>s.act(token,type,{teamCount:3,teamId:s.teams[0].teamId,decision:'accepted'}),e=>e.code===(token===s.teams[0].teamToken?'FORBIDDEN':'UNAUTHORIZED'));
   assert.equal(JSON.stringify(s.room()),before);
  }
 }
});

test('same-question cooking and theft survive a raced reveal while later-question first deliveries stay stale',()=>{
 const s=setup();const q=start(s);
 Object.assign(s.room().teams[0].inventory,{Bread:1,Cheese:1,Tomato:1});
 s.room().teams[0].powers.push({id:'reveal-race-power',type:'steal'});s.room().teams[1].inventory.Egg=1;
 const cook={type:'pupil:cook',requestId:randomUUID(),questionId:q.id,expectedPhase:'question',ingredients:['Bread','Cheese','Tomato']};
 const steal={type:'pupil:steal',requestId:randomUUID(),questionId:q.id,expectedPhase:'question',powerId:'reveal-race-power',targetTeamId:s.teams[1].teamId};
 s.act(s.host.hostToken,'host:reveal');
 assert.equal(s.store.action(s.host.pin,s.teams[0].teamToken,cook).result.cook.starsEarned,3);
 assert.equal(s.store.action(s.host.pin,s.teams[0].teamToken,steal).result.ingredient,'Egg');
 s.act(s.host.hostToken,'host:advance');
 for(const action of [cook,steal]){
  assert.equal(s.store.action(s.host.pin,s.teams[0].teamToken,action).replayed,true);
  assert.throws(()=>s.store.action(s.host.pin,s.teams[0].teamToken,{...action,requestId:randomUUID()}),e=>e.code==='STALE_CONTEXT');
 }
});

test('spent answer rewards cannot be reversed, even after replacement ingredients or a saved-room restore',()=>{
 const s=setup();const q=start(s);const team=s.teams[0];
 Object.assign(s.room().teams[0].inventory,{Cheese:1,Tomato:1});
 s.act(team.teamToken,'pupil:submit',{answer:'Accepted answer'});
 s.act(s.host.hostToken,'host:review',{teamId:team.teamId,decision:'accepted'});
 s.act(team.teamToken,'pupil:cook',{ingredients:['Bread','Cheese','Tomato']});
 assert.equal(s.room().submissions[q.id][team.teamId].rewardSpent,true);
 const reject={type:'host:review',requestId:randomUUID(),questionId:q.id,teamId:team.teamId,decision:'rejected'};
 const before=JSON.stringify(s.room());
 assert.throws(()=>s.store.action(s.host.pin,s.host.hostToken,reject),e=>e.code==='REWARD_ALREADY_USED');
 assert.equal(JSON.stringify(s.room()),before);assert.equal(s.room().teams[0].inventory.Bread,1);
 // A genuinely new ingredient does not restore the already-spent reward.
 s.room().teams[0].powers.push({id:'replacement-power',type:'steal'});s.room().teams[1].inventory.Bread=1;
 s.act(team.teamToken,'pupil:steal',{powerId:'replacement-power',targetTeamId:s.teams[1].teamId});
 const restored=new GameStore({questions,secret:s.store.secret,now:()=>1770000001000});
 restored.rooms.set(s.host.pin,JSON.parse(JSON.stringify(s.room())));
 assert.throws(()=>restored.action(s.host.pin,s.host.hostToken,reject),e=>e.code==='REWARD_ALREADY_USED');
 assert.equal(restored.state(s.host.pin,s.host.hostToken).submissions[0].rewardLocked,true);
 assert.equal(restored.state(s.host.pin,team.teamToken).me.inventory.Bread,2);
 assert.equal(restored.state(s.host.pin,team.teamToken).me.submission.status,'accepted');
 restored.action(s.host.pin,s.host.hostToken,{...reject,requestId:randomUUID(),decision:'accepted'});
 assert.equal(restored.state(s.host.pin,team.teamToken).me.inventory.Bread,2);
});

test('older stock is spent before the current reward, so an unspent reward can still be reversed',()=>{
 const s=setup();start(s);const team=s.teams[0];
 Object.assign(s.room().teams[0].inventory,{Bread:1,Cheese:1,Tomato:1});
 s.act(team.teamToken,'pupil:submit',{answer:'An answer'});
 s.act(s.host.hostToken,'host:review',{teamId:team.teamId,decision:'accepted'});
 s.act(team.teamToken,'pupil:cook',{ingredients:['Bread','Cheese','Tomato']});
 assert.equal(s.store.state(s.host.pin,s.host.hostToken).submissions[0].rewardLocked,false);
 s.act(s.host.hostToken,'host:review',{teamId:team.teamId,decision:'rejected'});
 assert.equal(count(s.room().teams[0]),0);assert.equal(s.room().teams[0].stars,3);
 s.act(s.host.hostToken,'host:review',{teamId:team.teamId,decision:'accepted'});
 assert.equal(count(s.room().teams[0]),2);
});

test('stolen rewards lock review reversal and theft protection lasts through reveal, resetting on the next question',()=>{
 const s=setup();start(s);const victim=s.teams[1];
 s.act(victim.teamToken,'pupil:submit',{answer:'Accepted answer'});
 s.act(s.host.hostToken,'host:review',{teamId:victim.teamId,decision:'accepted'});
 s.room().teams[0].powers.push({id:'power-first',type:'steal'},{id:'power-next',type:'steal'});
 s.act(s.teams[0].teamToken,'pupil:steal',{powerId:'power-first',targetTeamId:victim.teamId});
 assert.throws(()=>s.act(s.host.hostToken,'host:review',{teamId:victim.teamId,decision:'rejected'}),e=>e.code==='REWARD_ALREADY_USED');
 s.room().teams[1].inventory.Egg=1;s.act(s.host.hostToken,'host:reveal');
 assert.throws(()=>s.act(s.teams[0].teamToken,'pupil:steal',{powerId:'power-next',targetTeamId:victim.teamId}),e=>e.code==='TARGET_PROTECTED');
 s.act(s.host.hostToken,'host:advance');
 assert.equal(s.act(s.teams[0].teamToken,'pupil:steal',{powerId:'power-next',targetTeamId:victim.teamId}).result.ingredient,'Bread');
});

test('saved rush rooms ignore both expired and future timers and advance without waiting',()=>{
 for(const remaining of [-60000,120000]){
  const s=setup();start(s);Object.assign(s.room(),{phase:'rush',rushSeconds:30,rushEndsAt:1770000000000+remaining,rushNumber:1});
  Object.assign(s.room().teams[0].inventory,{Bread:1,Cheese:1,Tomato:1});
  const state=s.store.state(s.host.pin,s.teams[0].teamToken);
  assert.equal(state.cookingAvailable,true);assert.equal(state.rushEndsAt,null);assert.equal(state.rushEnded,false);
  s.act(s.teams[0].teamToken,'pupil:cook',{ingredients:['Bread','Cheese','Tomato']});
  s.act(s.host.hostToken,'host:advance');assert.equal(s.room().phase,'question');assert.equal(s.room().questionIndex,1);
 }
 const s=setup();start(s);Object.assign(s.room(),{phase:'rush',questionIndex:19,rushEndsAt:1770000100000});
 s.act(s.host.hostToken,'host:end-rush');s.act(s.host.hostToken,'host:advance');
 assert.equal(s.room().phase,'finished');
});

test('final reveal accepts last dishes; finish and early close retain results and allow only committed retries',()=>{
 for(const end of ['finished','closed']){
  const s=setup();start(s);s.room().questionIndex=19;
  Object.assign(s.room().teams[0].inventory,{Bread:2,Cheese:2,Tomato:2});
  s.act(s.host.hostToken,'host:reveal');
  const cook={type:'pupil:cook',requestId:randomUUID(),questionId:s.store.currentQuestion(s.room()).id,expectedPhase:'reveal',ingredients:['Bread','Cheese','Tomato']};
  const first=s.store.action(s.host.pin,s.teams[0].teamToken,cook);
  s.act(s.host.hostToken,end==='finished'?'host:advance':'host:close');
  const state=s.store.state(s.host.pin,s.teams[0].teamToken);
  assert.equal(state.phase,end);assert.deepEqual(state.winners,[s.teams[0].teamId]);assert.equal(state.cookingAvailable,false);
  assert.equal(state.me.stars,3);assert.equal(count(s.room().teams[0]),3);
  const replay=s.store.action(s.host.pin,s.teams[0].teamToken,cook);
  assert.equal(replay.replayed,true);assert.deepEqual(replay.result,first.result);
  assert.throws(()=>s.act(s.teams[0].teamToken,'pupil:cook',{ingredients: cook.ingredients}),e=>['WRONG_PHASE','ROOM_CLOSED'].includes(e.code));
  assert.throws(()=>s.act(s.teams[0].teamToken,'pupil:steal',{powerId:'unused',targetTeamId:s.teams[1].teamId}),e=>['WRONG_PHASE','ROOM_CLOSED'].includes(e.code));
  assert.deepEqual(s.store.join(s.host.pin,{clientId:s.room().teams[0].clientId}),s.teams[0]);
  assert.equal(s.store.state(s.host.pin,s.teams[0].teamToken).me.id,s.teams[0].teamId);
 }
});

test('basic dishes are deterministic, reward every try once, and never discover or reveal hidden recipes',()=>{
 const s=setup();start(s);
 const firstIngredients=['Chocolate','Chicken','Mushroom'];
 Object.assign(s.room().teams[0].inventory,{Chocolate:2,Chicken:2,Mushroom:2,Rice:1,Tomato:1});
 const request={type:'pupil:cook',requestId:randomUUID(),questionId:s.store.currentQuestion(s.room()).id,expectedPhase:'question',ingredients:firstIngredients};
 const first=s.store.action(s.host.pin,s.teams[0].teamToken,request);
 assert.deepEqual(first.result.cook.dish,{name:'Creative Kitchen Dish',emoji:'🍽️',stars:1,success:true,type:'basic'});
 assert.equal(first.result.cook.discoveryBonus,0);assert.equal(first.result.cook.isNewForTeam,false);assert.equal(first.result.power,null);
 assert.equal(s.store.action(s.host.pin,s.teams[0].teamToken,request).replayed,true);
 assert.equal(s.room().teams[0].stars,1);assert.equal(count(s.room().teams[0]),5);
 const again=s.act(s.teams[0].teamToken,'pupil:cook',{ingredients:[...firstIngredients].reverse()});
 assert.deepEqual(again.result.cook.dish,first.result.cook.dish);assert.equal(again.result.cook.starsEarned,1);assert.equal(again.result.cook.discoveryBonus,0);
 assert.equal(s.room().teams[0].stars,2);assert.equal(count(s.room().teams[0]),2);
 Object.assign(s.room().teams[1].inventory,{Rice:1,Chocolate:1,Tomato:1});
 const different=s.act(s.teams[1].teamToken,'pupil:cook',{ingredients:['Rice','Chocolate','Tomato']});
 assert.deepEqual(different.result.cook.dish,first.result.cook.dish);assert.equal(different.result.cook.starsEarned,1);assert.equal(different.result.cook.discoveryBonus,0);
 assert.deepEqual(s.room().discoveries,{});
 for(const team of s.room().teams){assert.deepEqual(team.recipes,{});assert.equal(team.powers.length,0);}
 for(const token of [undefined,s.teams[2].teamToken]){
  const cooks=s.store.state(s.host.pin,token).latestCooks;
  assert.ok(cooks.every(cook=>cook.ingredients===undefined&&cook.dish.ingredients===undefined));
  assert.ok(cooks.every(cook=>cook.dish.type==='basic'&&cook.starsEarned===1));
 }
});

test('every unordered valid three-ingredient combination has its intended recipe, power, disaster or basic result',()=>{
 const s=setup();start(s);let expectedStars=0,ordinary=0,specials=0,disasterCount=0;
 for(let a=0;a<INGREDIENTS.length;a++)for(let b=a;b<INGREDIENTS.length;b++)for(let c=b;c<INGREDIENTS.length;c++){
  const ingredients=[INGREDIENTS[a],INGREDIENTS[b],INGREDIENTS[c]],team=s.room().teams[0];
  for(const item of INGREDIENTS)team.inventory[item]=0;
  for(const item of ingredients)team.inventory[item]++;
  const {cook,power}=s.act(s.teams[0].teamToken,'pupil:cook',{ingredients}).result;
  const recipe=RECIPES[recipeKey(ingredients)];
  assert.equal(count(s.room().teams[0]),0);
  if(disasters.some(items=>recipeKey(items)===recipeKey(ingredients))){
   disasterCount++;assert.equal(recipe,undefined);assert.equal(cook.dish.type,'disaster');assert.equal(cook.dish.success,false);assert.equal(cook.starsEarned,-1);assert.equal(cook.discoveryBonus,0);assert.equal(power,null);
  }else if(['steal','steal-star'].includes(recipe?.type)){
   assert.equal(cook.dish.success,true);
   specials++;assert.equal(cook.starsEarned,0);assert.equal(cook.discoveryBonus,0);assert.equal(power.type,recipe.type);
  }else{
   assert.equal(cook.dish.success,true);
   ordinary++;assert.ok(cook.starsEarned>=1);assert.equal(power,null);
   assert.equal(cook.starsEarned,recipe?recipe.stars+1:1);assert.equal(cook.discoveryBonus,recipe?1:0);
  }
  expectedStars+=cook.starsEarned;
 }
 assert.equal(ordinary,213);assert.equal(specials,2);assert.equal(disasterCount,5);assert.equal(s.room().teams[0].stars,expectedStars);
 assert.equal(Object.keys(s.room().discoveries).length,40);assert.equal(Object.keys(s.room().teams[0].recipes).length,42);
});
