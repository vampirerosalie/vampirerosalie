import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import vm from 'node:vm';
import { resolveTreasureRoute } from '../../public/battle12/route.js';

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

const source=readFileSync(new URL('../../public/battle12/app.js',import.meta.url),'utf8');
function render(name,overrides={}) {
  const start=source.indexOf('function '+name+'('), end=source.indexOf('\nfunction ',start+1);
  let code=source.slice(start,end<0?undefined:end);
  if(name==='reviewView')code=code.slice(0,code.indexOf('\nlet music='));
  const ctx={host:true,pin:'12345',privateMode:false,screen:'answer',esc:String,btn:(label,action)=>`<button data-action="${action}">${label}</button>`,ended:()=>false,qrContent:()=>'<img alt="Joining QR">',teacherControls:()=>'',musicControls:()=>'',reader:()=>'',readerControls:()=>'',results:()=>'',state:{phase:'lobby',players:[],log:[],question:{number:1,group:'Expedition',prompt:'Name of ship'},results:[]},review:null,...overrides};
  return vm.runInNewContext(code+';'+name+'()',ctx);
}
test('teacher dashboard contains QR in lobby AND while questions are running',()=>{
  assert.match(render('teacherView'),/Teacher lobby/);
  for(const phase of ['lobby','questions']) {
    const html=render('teacherView',{state:{phase,players:[],log:[],question:{number:1,group:'Expedition',prompt:'Name of ship'}}});
    assert.match(html,/TEACHER MODE/);assert.match(html,/Student joining QR/);assert.match(html,/alt="Joining QR"/);assert.doesNotMatch(html,/answer-form|join-form/);
  }
});
test('private review and teacher reader both provide QR and return controls',()=>{
  for(const html of [render('reviewView'),render('teacherView',{screen:'read'})]) {
    assert.match(html,/data-action="dashboard"/);assert.match(html,/data-action="qr"/);assert.match(html,/teacher/i);
  }
});
test('teacher results are worded as teacher results, not student instructions',()=>{
  const state={phase:'ended',results:[]};
  assert.match(render('results',{state}),/You ended this game/);
  assert.match(render('results',{state}),/Final class results/);
  assert.match(render('results',{state,host:false}),/Your teacher ended the voyage/);
});
