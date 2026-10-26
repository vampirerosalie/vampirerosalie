import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import vm from 'node:vm';
import { resolveTreasureRoute, treasureTeacherShellUrl } from '../../public/battle12/route.js';
import { questionDesk, responseStatuses, reviewDialog } from '../../public/battle12/teacher-desk.js';

const storage = {'host-room':'12345','host:12345':'HOST','student-room':'67890','student:67890':'STUDENT'};
const get = data => key => data[key] || '';
const marker = JSON.stringify({room:'67890'});
test('owned teacher entry wins over an earlier student preview in the same tab',()=>{
  for(const search of ['?teacher=1','?host=12345','?host=12345&review=1']) {
    const route=resolveTreasureRoute(search,get(storage),marker);
    assert.equal(route.pin,'12345');assert.equal(route.token,'HOST');assert.equal(route.hostIntent,true);assert.equal(route.student,false);
  }
});
test('explicit joining remains student-only even on the teacher browser',()=>{
  for(const search of ['?join=67890','?join=67890&teacher=1','?student=1&host=12345']) {
    const route=resolveTreasureRoute(search,get(storage),marker);
    assert.equal(route.hostIntent,false);assert.equal(route.token,'STUDENT');assert.equal(route.student,true);
  }
});
test('student cannot acquire teacher credentials by editing URL or reopening it',()=>{
  const data={'student-room':'67890','student:67890':'STUDENT'};
  for(const saved of ['',marker])for(const search of ['?teacher=1','?host=12345&review=1','']) {
    const route=resolveTreasureRoute(search,get(data),saved);
    assert.equal(route.hostIntent,false);assert.equal(route.token,'STUDENT');assert.equal(route.pin,'67890');
  }
});
test('new teacher entry has create-room intent, not a student name form',()=>{
  assert.deepEqual(resolveTreasureRoute('?teacher=1',get({})),{pin:'',hostIntent:true,student:false,token:''});
});

test('direct teacher bookmarks return to the shared shell, embedded panels and student links do not',()=>{
  const teacher=resolveTreasureRoute('?host=12345',get(storage),marker);
  assert.equal(treasureTeacherShellUrl(teacher,false),'/?battle=12&teacher=1&host=12345');
  assert.equal(treasureTeacherShellUrl(teacher,true),null);
  assert.equal(treasureTeacherShellUrl(resolveTreasureRoute('?teacher=1',get({})),false),'/?battle=12&teacher=1');
  for(const search of ['?join=67890','?join=67890&teacher=1','?teacher=1','?host=12345']) {
    const student=resolveTreasureRoute(search,get({'student-room':'67890','student:67890':'STUDENT'}),marker);
    assert.equal(treasureTeacherShellUrl(student,false),null);
  }
});

const source=readFileSync(new URL('../../public/battle12/app.js',import.meta.url),'utf8');

test('only Battle 12 hides battle selection in fullscreen and restores it on exit',()=>{
  const shell=readFileSync(new URL('../../app/page.tsx',import.meta.url),'utf8');
  const expression=shell.match(/\{([^\n]+) && <section className="battle-selector" aria-label="Choose grammar battle" style=\{\{ flexShrink: 0 \}\}>/g)
    .find(line=>line.includes('isTreasure'))
    .replace(/^\{/, '').split(' && <section')[0];
  const visible=(isTreasure,isMuseum,phase,isFullscreen)=>vm.runInNewContext(expression,{isTerritory:false,isTreasure,isMuseum,standaloneStatus:{phase},isFullscreen});
  for(const phase of ['lobby','questions','finalPlay','finalBank','finished','ended']) {
    assert.equal(visible(true,false,phase,false),true);
    assert.equal(visible(true,false,phase,true),false);
    assert.equal(visible(true,false,phase,false),true);
    assert.equal(visible(false,true,phase,true),visible(false,true,phase,false));
    assert.equal(visible(false,false,phase,true),visible(false,false,phase,false));
  }
  assert.match(shell,/document\.addEventListener\('fullscreenchange', changed\)/);
  assert.match(shell,/isFullscreen \? 'EXIT FULL SCREEN' : 'FULL SCREEN'/);
  assert.match(shell,/key=\{standaloneBattle\}/); // Fullscreen must not change the iframe identity or room.
});

function render(name,overrides={}) {
  const start=source.indexOf('function '+name+'('), end=source.indexOf('\nfunction ',start+1);
  let code=source.slice(start,end<0?undefined:end);
  if(['teacherView','teacherQuestion','answerPanel','teacherMap'].includes(name))code=source.slice(source.indexOf('function teacherControls()'),source.indexOf('let music=null'));
  const ctx={host:true,pin:'12345',hideAnswers:false,screen:'answer',esc:String,locations:[['camp','Camp'],['cave','Crystal Cave']],btn:(label,action,cls,disabled)=>`<button data-action="${action}" ${disabled?'disabled':''}>${label}</button>`,ended:()=>false,qrContent:()=>'<img alt="Joining QR">',musicControls:()=>'',reader:()=>'',readerControls:()=>'',results:()=>'',state:{phase:'lobby',players:[],log:[],question:{id:'q01',number:1,group:'Expedition',prompt:'Name of ship'},results:[]},review:null,...overrides};
  ctx.embedded=true;
  Object.assign(ctx,{questionDesk,responseStatuses,dialog:{addEventListener(){}}});
  return vm.runInNewContext(code+';'+name+'()',ctx);
}
test('large joining QR is in left lobby; gameplay uses QR button without duplicate QR',()=>{
  const lobby=render('teacherView');
  assert.match(lobby,/Scan to join Treasure Raid/);
  assert.ok(lobby.indexOf('alt="Joining QR"')<lobby.indexOf('island-desk'));
  for(const phase of ['lobby','questions']) {
    const html=render('teacherView',{state:{phase,players:[],log:[],question:{number:1,group:'Expedition',prompt:'Name of ship'}}});
    assert.match(html,/TEACHER MODE/);assert.match(html,/Show joining QR/);assert.doesNotMatch(html,/answer-form|join-form/);
    assert.equal((html.match(/alt="Joining QR"/g)||[]).length,phase==='lobby'?1:0);
  }
});
test('teacher reader provides QR and return controls',()=>{
  for(const html of [render('teacherView',{screen:'read'})]) {
    assert.match(html,/data-action="dashboard"/);assert.match(html,/data-action="qr"/);assert.match(html,/teacher/i);
  }
});

test('embedded teacher view has its own game-only fullscreen button',()=>{
  assert.match(render('teacherView'),/data-action="fullscreen"[^>]*>Game full screen/);
  assert.match(source,/document\.documentElement\.requestFullscreen\(\)/);
  assert.match(source,/document\.addEventListener\('fullscreenchange',syncGameFullscreen\)/);
  const control={textContent:'',setAttribute(name,value){this[name]=value;}};
  const start=source.indexOf('function syncGameFullscreen()'),end=source.indexOf('\nfunction ',start+1);
  for(const fullscreen of [null,{},null]){
    vm.runInNewContext(source.slice(start,end)+';syncGameFullscreen()',{app:{querySelector:()=>control},document:{fullscreenElement:fullscreen}});
    assert.equal(control.textContent,fullscreen?'Exit game full screen':'Game full screen');
    assert.equal(control['aria-pressed'],String(Boolean(fullscreen)));
  }
});

test('kitchen-style desk hides answers until review, then Next appears only after finalize',()=>{
  const state={phase:'questions',pendingReviewCount:1,question:{id:'q01',number:1,prompt:'Ship name'},players:[{id:'p1',name:'TEST pupil',location:'cave',answerStatus:'submitted',online:true}],log:[]};
  const review={question:{id:'q01',acceptedAnswers:['Silver Gull']},entries:[{id:'p1',name:'TEST pupil',response:{value:'My answer',status:'submitted',attempts:1},suggestion:{status:'teacher_review'}}]};
  const html=render('teacherView',{state,review});
  assert.ok(html.indexOf('marking-desk')<html.indexOf('island-desk'));
  assert.doesNotMatch(html,/My answer|Silver Gull|data-action="advance"|data-action="accept"/);
  assert.match(html,/Start 10-second countdown/);assert.match(html,/Finalize &amp;|Finalize & reveal/);
  assert.match(html,/data-action="review-open"/);assert.match(html,/Answered/);
  assert.match(html,/Crystal Cave: 1 players/);assert.match(html,/Camp: 0 players/);
  assert.doesNotMatch(html,/Teacher review ↗|Open teacher review/);
  const opened=reviewDialog(state,review);
  assert.match(opened,/My answer|Silver Gull/);assert.match(opened,/data-action="accept"/);assert.match(opened,/data-action="reject"/);assert.match(opened,/Accept all submitted answers/);
  state.finalized=true;
  assert.match(questionDesk(state),/Next question/);assert.doesNotMatch(questionDesk(state),/data-action="finalize"/);
});
test('teacher results are worded as teacher results, not student instructions',()=>{
  const state={phase:'ended',results:[]};
  assert.match(render('results',{state}),/You ended this game/);
  assert.match(render('results',{state}),/Final class results/);
  assert.match(render('results',{state,host:false}),/Your teacher ended the voyage/);
});
