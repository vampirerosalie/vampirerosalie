import test from 'node:test';
import assert from 'node:assert/strict';
import { QUESTIONS } from '../../app/battle14/questions.js';
import { createSession, joinSession, isController, sessionView, quizCommand, finishRound, closeExpiredQuiz } from '../../app/battle14/session.js';

const host = {role:'host'}, projector = {role:'projector'};
function fixture(count = 2) {
  const session = createSession({pin:'12345',hostTokenHash:'private',now:0});
  const teams=Array.from({length:count},(_,i)=>{
    const deviceId='dev-'+i, {teamId}=joinSession(session,{deviceId,name:'Team '+i});
    return {role:'team',deviceId,teamId};
  });
  let id=0;
  function act(actor,type,extras={},now=1000) {
    return quizCommand(session,actor,{type,requestId:'act-'+ ++id,questionId:QUESTIONS[session.questionIndex].id,round:session.round,...extras},now);
  }
  return {session,teams,act,admin:(type,fields,now)=>act(host,'host:'+type,fields,now),view:actor=>sessionView(session,actor)};
}

test('the fixed English bank retains all 20 questions and the supplied answer sequence',()=>{
  assert.equal(QUESTIONS.length,20);
  assert.equal(QUESTIONS.map(q=>q.answer).join(''),'ABDACCB DADCB DABCCCAA'.replaceAll(' ',''));
  assert(QUESTIONS.every((q,i)=>q.number===i+1&&Object.keys(q.options).join('')==='ABCD'&&q.prompt.includes('______')));
  assert.equal(new Set(QUESTIONS.map(q=>q.id)).size,20);
});

test('12 team colours, same-device reconnection, watchers and explicit controller handoff',()=>{
  const {session,teams,admin,act}=fixture(12);
  assert.equal(new Set(session.teams.map(t=>t.color)).size,12);
  assert.throws(()=>joinSession(session,{name:'More',deviceId:'extra'}));
  const first=teams[0], second=teams[1], firstColor=session.teams[0].color,secondColor=session.teams[1].color;
  admin('edit-team',{teamId:first.teamId,name:'Robins',color:secondColor});
  assert.equal(session.teams[0].name,'Robins');
  assert.equal(session.teams[0].color,secondColor);
  assert.equal(session.teams[1].color,firstColor);
  assert.equal(joinSession(session,{deviceId:first.deviceId,name:'Duplicate'}).teamId,first.teamId);
  const watcher={role:'team',...joinSession(session,{deviceId:'teammate',teamId:first.teamId})};
  assert(!isController(session,watcher));
  admin('start');
  assert.throws(()=>act(watcher,'student:submit',{answer:'A'}));
  assert.throws(()=>admin('controller',{teamId:first.teamId,deviceId:second.deviceId}));
  admin('controller',{teamId:first.teamId,deviceId:watcher.deviceId});
  assert(isController(session,watcher));
  assert(!isController(session,first));
  act(watcher,'student:submit',{answer:'A'});
  assert.equal(sessionView(session,first).ownAnswer,'A');
  const display=sessionView(session,projector,{onlineDeviceIds:[watcher.deviceId]});
  assert.equal(display.onlineCount,1);
  assert(!('devices' in display.teams[0]));
});

test('moderation stays private until explicit reveal; countdown uses server time',()=>{
  const {session,teams,admin,act,view}=fixture();
  admin('start');act(teams[0],'student:submit',{answer:'B'});
  assert.equal(view(host).review.entries[0].suggestion,'reject');
  admin('decision',{teamId:teams[0].teamId,decision:'accept'});
  assert.equal(view(host).review.entries[0].decision,'accept');
  assert.throws(()=>admin('decision',{teamId:teams[1].teamId,decision:'accept'}));
  admin('countdown',{},2000);admin('countdown',{},8000);
  assert.equal(session.quizDeadline,12000);
  assert.equal(closeExpiredQuiz(session,11999),false);
  assert.throws(()=>act(teams[1],'student:submit',{answer:'A'},12000));
  assert.equal(session.quizzes.q01.closed,true);
  admin('finalize');
  for(const viewer of [teams[0],projector]){
    const v=view(viewer);
    assert(!v.revealed && !v.review && !('answer' in v.question));
    assert(!('englishCorrect' in v.teams[0]) && !('decision' in v));
    assert(!JSON.stringify(v).includes('hostTokenHash'));
  }
  assert.throws(()=>act(teams[0],'host:reveal'));
  admin('reveal');
  assert.equal(view(teams[0]).revealed,'A');
});

test('all four teacher-started rounds derive fresh ammo from their own five questions and display cumulative shooting winners',()=>{
  const {session,teams,admin,act,view}=fixture();
  admin('start');
  const accuracy=[5,0,4,2], stats={firstHits:0,drones:0,stolen:0,lost:0};
  for(let round=1;round<=4;round++){
    for(let i=0;i<5;i++){
      const q=QUESTIONS[5*(round-1)+i];
      assert.equal(view(teams[0]).question.id,q.id);
      assert.throws(()=>admin('next'));
      if(i<accuracy[round-1])act(teams[0],'student:submit',{answer:q.answer});
      admin('finalize'); admin('next');
    }
    assert.equal(session.phase,'roundReady');
    const start={type:'host:start-round',round,requestId:'start-round-'+round};
    const {startRound}=quizCommand(session,host,start,10000);
    assert.deepEqual(startRound.teams.map(t=>t.ammo),[5+2*accuracy[round-1],5]);
    assert.deepEqual(startRound.teams.map(t=>t.score),[round-1,3*(round-1)]);
    assert.deepEqual(quizCommand(session,host,start,10001),{replayed:true});
    assert.throws(()=>quizCommand(session,host,{...start,type:'host:resume'},10001));
    const players=[{id:teams[0].teamId,ammo:85,score:round,stats:{...stats,drones:round}},
      {id:teams[1].teamId,score:3*round,ammo:38,stats:{...stats,firstHits:round}}];
    admin('pause');admin('resume');
    assert(finishRound(session,{round,players},30000));
    assert.equal(finishRound(session,{round,players},30001),false);
    assert.equal(session.phase,'roundResults');
    if(round!==4)admin('continue');
  }
  admin('finish');
  for(const actor of [teams[0],teams[1],projector,host]){
    const state=view(actor);
    assert.equal(state.phase,'finished');
    assert.equal(state.completedRounds,4);
    assert.deepEqual(state.teams.map(t=>[t.score,t.englishCorrect]),[[4,11],[12,0]]);
  }
});

test('manual ending keeps each team on its results view and preserves a partial shootout',()=>{
  const {session,teams,admin,view}=fixture();
  admin('start');
  for(let i=0;i<5;i++){admin('finalize');admin('next');}
  admin('start-round');
  assert.deepEqual(admin('finish'),{endRound:true,finishGame:true});
  const stats={firstHits:1,drones:3,stolen:1,lost:0};
  finishRound(session,{round:1,players:[{id:teams[0].teamId,score:7,stats}]},1000,true);
  const saved=JSON.parse(JSON.stringify(session));
  assert.equal(saved.phase,'finished');assert.equal(view(teams[0]).teams[0].score,7);
  assert.equal(joinSession(saved,{deviceId:teams[0].deviceId}).teamId,teams[0].teamId);
  assert.throws(()=>joinSession(saved,{deviceId:'new',teamId:teams[0].teamId}));
});
