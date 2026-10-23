import test from 'node:test';
import assert from 'node:assert/strict';
import { retireReviewSession } from '../../public/battle12/retire-review-session.js';
import { resolveTreasureRoute } from '../../public/battle12/route.js';
const P='treasure-raid:';
function store(data){const m=new Map(Object.entries(data));return {getItem:k=>m.get(k)??null,removeItem:k=>m.delete(k),snapshot:()=>Object.fromEntries(m)};}
function setup(){return {local:store({[P+'student-room']:'55982',[P+'student:55982']:'test-token',[P+'name']:'TEST Live Phone Review',[P+'client-id']:'same-device',[P+'host:12345']:'keep',[P+'student:22222']:'keep','other-battle:state':'keep'}),session:store({[P+'student-route']:JSON.stringify({room:'55982'}),'other-battle:route':'keep'})};}
const state={pin:'55982',role:'student',phase:'ended',me:{name:'TEST Live Phone Review'}};
test('retire only verified completed agent test on explicit teacher entry, then show teacher creation',async()=>{
  const {local,session}=setup();
  assert.equal(await retireReviewSession('?teacher=1',local,session,async(room,key)=>{assert.equal(room,'55982');assert.equal(key,'test-token');return state;}),true);
  assert.equal(local.getItem(P+'student-room'),null);assert.equal(session.getItem(P+'student-route'),null);
  assert.equal(local.getItem(P+'client-id'),'same-device');assert.equal(local.getItem(P+'host:12345'),'keep');assert.equal(local.getItem(P+'student:22222'),'keep');assert.equal(local.getItem('other-battle:state'),'keep');assert.equal(session.getItem('other-battle:route'),'keep');
  assert.equal(resolveTreasureRoute('?teacher=1',k=>local.getItem(P+k)||'').hostIntent,true);
  assert.equal(await retireReviewSession('?teacher=1',local,session,async()=>{throw Error('must not fetch twice');}),false);
});
test('normal students, active rooms, wrong identity and server failures never get a teacher escape',async()=>{
  for(const variant of [{...state,phase:'questions'},{...state,pin:'22222'},{...state,role:'public'},{...state,me:{name:'Actual pupil'}},null]){
    const {local,session}=setup(),before=local.snapshot();
    assert.equal(await retireReviewSession('?teacher=1',local,session,async()=>variant),false);
    assert.deepEqual(local.snapshot(),before);assert.equal(resolveTreasureRoute('?teacher=1',k=>local.getItem(P+k)||'',session.getItem(P+'student-route')).hostIntent,false);
  }
  const {local,session}=setup(),before=local.snapshot();
  assert.equal(await retireReviewSession('?teacher=1',local,session,async()=>{throw Error('offline');}),false);assert.deepEqual(local.snapshot(),before);
});
test('student links, teacher room URLs and other rooms are untouched',async()=>{
  for(const query of ['?join=55982','?join=55982&teacher=1','?student=1&teacher=1','?host=12345&teacher=1','']){
    const {local,session}=setup(),before=local.snapshot();
    assert.equal(await retireReviewSession(query,local,session,async()=>{throw Error('must not fetch');}),false);assert.deepEqual(local.snapshot(),before);
  }
  const local=store({[P+'student-room']:'22222',[P+'student:22222']:'real'}),session=store({});
  assert.equal(await retireReviewSession('?teacher=1',local,session,async()=>{throw Error('must not fetch');}),false);
});
