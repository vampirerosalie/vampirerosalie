import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import vm from 'node:vm';
import {resolveShellRoute} from '../../app/battle7-route.js';
const source=readFileSync(new URL('../../public/battle9/app.js',import.meta.url),'utf8');
function view(){const context=vm.createContext({document:{getElementById:()=>({addEventListener(){}}),addEventListener(){}},navigator:{onLine:true},crypto:{randomUUID:()=> 'test'},window:{addEventListener(){}},setInterval(){}});vm.runInContext(source.replace(/initialRoute\(\);\s*$/,''),context);vm.runInContext(`state={phase:'question',questionOpen:true,questionNumber:1,deadlineAt:null,answerReveal:null,question:{id:1,type:'mcq',cat:'Grammar',text:'Choose.',choices:['one','two','three','four']},me:{id:'one',slot:1,name:'Student',money:100,tp:0,shields:0,reserved:0,cards:[],submission:{answer:'B',status:'submitted'}},teams:[],ranking:[],events:[]};`,context);return code=>vm.runInContext(code,context);}

test('auction artwork follows lot identity while heading follows auction position, including legacy fallback',()=>{
  const run=view();
  const html=run("state.phase='auction';state.auction={index:0,lotIndex:3,number:1,name:'Sapphire Chest',start:45,kind:'visible',status:'open',bid:0,bids:[]};auctionCard(true)");
  assert.match(html,/AUCTION 1 \/ 13/);assert.match(html,/Sapphire Chest/);assert.match(html,/\$45/);
  assert.ok(html.includes(run("art(3,'lot-art')")));
  assert.ok(run("delete state.auction.lotIndex;auctionCard(true)").includes(run("art(0,'lot-art')")));
});
test('phone pending answer reveals no verdict, instructions or teacher controls',()=>{const run=view(),html=run('studentView()');assert.match(html,/Submitted—waiting for teacher/);assert.doesNotMatch(html,/Correct!|Review answers|Confirm results|teacher=1/);assert.match(run("state.me.submission.status='accepted';studentView()"),/\+\$25 and \+1 TP/);});
test('inventory is separate tab and teacher review works before everyone submits',()=>{const run=view();assert.match(run('studentView()'),/tab-inventory/);assert.match(run("ui.studentTab='inventory';studentView()"),/Your collection starts here/);assert.doesNotMatch(run('studentView()'),/Choose\.<\/h2>/);assert.match(run("state.pendingReviewCount=3;teacherControls()"),/data-action="review"/);assert.doesNotMatch(run('teacherControls()'),/data-action="review"[^>]*disabled/);});
test('end screen has no teacher/new-game route; root remembers Battle 9 student intent',()=>{const run=view();assert.doesNotMatch(run("state.phase='finished';studentView()"),/teacher=1|new-room|all-battles/);assert.match(source,/rememberStudent\(nextPin\)/);assert.match(source,/nextMode === 'host' \|\| nextMode === 'screen'\) && isStudentTab/);const shell=readFileSync(new URL('../../app/page.tsx',import.meta.url),'utf8');assert.match(shell,/black-market:student-route/);assert.match(shell,/\/battle9\/index.html\?/);assert.equal(resolveShellRoute('?battle=9&teacher=1').mode,'market');assert.equal(resolveShellRoute('?battle=9&teacher=1',{battle:7,room:'12345'}).role,'student');});
test('auction phone keeps bids active during countdown and stores each action receipt before sending',()=>{assert.match(source,/storage.set\(pendingKey\(pin\), JSON.stringify\(pending\)\)/);assert.match(source,/countdown\(\)===0/);assert.doesNotMatch(source,/disabled\(ui.busy\|\|Boolean\(state.auction.deadlineAt\)\).*data-action="bid"/);assert.match(source,/visibilitychange/);assert.match(source,/pageshow/);});

test('expired teacher room recovers a new QR room, but students and transient failures do not create rooms', async () => {
  const saved = new Map([['black-market:host:40753','teacher-key'],['black-market:last-host','40753'],['black-market:pending:host:40753','{}']]);
  const context = vm.createContext({
    document:{getElementById:()=>({addEventListener(){}}),addEventListener(){}},
    navigator:{onLine:true},crypto:{randomUUID:()=> 'test'},window:{addEventListener(){}},setInterval(){},
    localStorage:{getItem:key=>saved.get(key)??null,setItem:(key,value)=>saved.set(key,value),removeItem:key=>saved.delete(key)},
    sessionStorage:{getItem:()=>null},
  });
  vm.runInContext(source.replace(/initialRoute\(\);\s*$/,''),context);
  vm.runInContext(`render=()=>{};api=async()=>{throw Object.assign(new Error('Expired'),{status:404,code:'ROOM_NOT_FOUND'})};
    mode='host';pin='40753';token='teacher-key';ui.busy=true;createRoom=async fresh=>{globalThis.created=fresh};`,context);
  await vm.runInContext('loadState()',context);
  assert.equal(vm.runInContext('mode',context),'home');
  assert.equal(vm.runInContext('pin',context),'');
  assert.equal(vm.runInContext('ui.busy',context),false);
  assert.equal(vm.runInContext('globalThis.created',context),true);
  assert.equal(saved.has('black-market:last-host'),false);
  assert.equal(saved.has('black-market:host:40753'),false);
  assert.equal(saved.has('black-market:pending:host:40753'),false);
  for (const role of ['join','screen']) {
    vm.runInContext(`globalThis.created=false;mode='${role}';pin='40753';token='student-key';`,context);
    await vm.runInContext('loadState()',context);
    assert.equal(vm.runInContext('mode',context),role);
    assert.equal(vm.runInContext('globalThis.created',context),false);
  }
  vm.runInContext(`globalThis.created=false;mode='host';pin='40753';token='teacher-key';api=async()=>{throw Object.assign(new Error('Temporary problem'),{status:503})};`,context);
  await vm.runInContext('loadState()',context);
  assert.equal(vm.runInContext('pin',context),'40753');
  assert.equal(vm.runInContext('globalThis.created',context),false);
});
