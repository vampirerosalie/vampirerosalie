import test from 'node:test';
import assert from 'node:assert/strict';
import {randomUUID} from 'node:crypto';
import {readFileSync} from 'node:fs';
import {setup,bank,lots,TestD1} from './helpers.js';
import {MarketD1Store} from '../../app/battle9/d1-store.js';

test('40 places always available; three joined teams can start and slot 40 can join',()=>{
  const s=setup(3); s.room().teamCount=2; assert.equal(s.view().teamCount,40);
  s.act(s.host.hostToken,'host:settings',{teamCount:2}); assert.equal(s.view().teamCount,40);
  s.act(s.host.hostToken,'host:start'); assert.equal(s.room().teams.length,3);
  const other=setup(1);other.game.join(other.host.pin,{clientId:randomUUID(),teamSlot:40,name:'Last place'});
  assert.equal(other.room().teams.length,2);
  other.game.random=max=>max-1;
  const fresh=other.game.create({teamCount:3}); assert.equal(other.game.room(fresh.pin).teamCount,40);
});
test('automatic MCQ, spelling and order marking remain private and teacher overrides survive refresh',()=>{
  const s=setup(2);s.act(s.host.hostToken,'host:start');
  for(const [index,correct,wrong] of [[0,{answer:'B'},{answer:'A'}],[7,{answer:' RESTAURANT '},{answer:'restaurent'}],[6,{order:[4,0,2,3,1]},{order:[0,1,2,3,4]}]]){
    s.room().questionIndex=index;
    s.act(s.teams[0].teamToken,'pupil:submit',{questionId:index+1,...correct});
    s.act(s.teams[1].teamToken,'pupil:submit',{questionId:index+1,...wrong});
    assert.deepEqual(s.view(s.host.hostToken).reviews.map(r=>[r.decision,r.markedBy]),[['accepted','auto'],['rejected','auto']]);
    for(const t of s.teams){const v=s.view(t.teamToken);assert.equal(v.me.submission.status,'submitted');assert.equal(v.reviews,undefined);assert.equal(v.me.money,100);}
    s.act(s.host.hostToken,'host:review',{questionId:index+1,teamId:s.teams[0].teamId,decision:'rejected'});
    s.act(s.host.hostToken,'host:review',{questionId:index+1,teamId:s.teams[1].teamId,decision:'accepted'});
    assert.deepEqual(s.view(s.host.hostToken).reviews.map(r=>r.decision),['rejected','accepted']);
    assert.ok(s.view(s.host.hostToken).reviews.every(r=>r.markedBy==='teacher'));
  }
});
test('existing undecided submissions migrate durably but manual marks and confirmed rewards do not change',async()=>{
  const db=new TestD1(), store=()=>new MarketD1Store(db,{bank,lots,sleep:async()=>{}}),host=await store().create();
  const a=await store().join(host.pin,{clientId:randomUUID(),teamSlot:1,name:'A'}),b=await store().join(host.pin,{clientId:randomUUID(),teamSlot:2,name:'B'});
  let room=db.room(host.pin);room.teamCount=2;db.setRoom(room);assert.equal((await store().state(host.pin,host.hostToken)).teamCount,40);assert.equal(db.room(host.pin).teamCount,40);
  room=db.room(host.pin);room.phase='question';room.questionIndex=0;room.questionOpen=true;
  room.submissions[1]={[a.teamId]:{answer:'B',decision:null,suggestion:'accepted'},[b.teamId]:{answer:'B',decision:'rejected',suggestion:'accepted'}};db.setRoom(room);
  const v=await store().state(host.pin,host.hostToken);assert.deepEqual(v.reviews.map(r=>r.decision),['accepted','rejected']);assert.equal(db.room(host.pin).submissions[1][a.teamId].decision,'accepted');
  const body={type:'host:confirm',questionId:1,requestId:randomUUID()};await store().action(host.pin,host.hostToken,body);await store().action(host.pin,host.hostToken,body);
  assert.deepEqual(db.room(host.pin).teams.map(t=>t.money),[125,100]);await store().state(host.pin,a.teamToken);assert.deepEqual(db.room(host.pin).teams.map(t=>t.money),[125,100]);
});
test('lobby has no team-count selector and review distinguishes automatic marks',()=>{
  const source=readFileSync(new URL('../../public/battle9/app.js',import.meta.url),'utf8');
  assert.doesNotMatch(source,/id="team-count"|Available team places <select/);
  assert.match(source,/40 team places open/);assert.match(source,/from 1 to 40/);
  assert.match(source,/Automatic mark/);assert.match(source,/Answers are marked automatically/);
});
