import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import vm from 'node:vm';

const source = readFileSync(new URL('../../public/battle8/app.js', import.meta.url), 'utf8');
function view() {
  const context = vm.createContext({
    document:{ getElementById:() => ({ addEventListener() {} }), addEventListener() {} },
    navigator:{ onLine:true }, crypto:{ randomUUID:() => 'test' },
    window:{ addEventListener() {} }, setInterval() {},
  });
  vm.runInContext(source.replace(/initialRoute\(\);\s*$/, ''), context);
  vm.runInContext(`state = { phase:'question', questionOpen:true, questionNumber:1, deadlineAt:null, answerReveal:null,
    question:{ id:1, type:'reading', text:'Read this passage.', question:'Choose an answer.', options:{A:'One',B:'Two',C:'Three',D:'Four'} },
    me:{ id:'one', slot:1, name:'Test team', remaining:10, walls:3, shields:2, draws:0, hand:[], submission:{status:'submitted',answer:'A'} },
    teams:[], ranking:[], events:[] };`, context);
  return expression => vm.runInContext(expression, context);
}
test('phone, teacher house, team tiles and targets omit Walls counters but preserve Shields and totals', () => {
  const run = view();
  for (const expression of ['studentView()', 'house(state.me)', '(state.teams = [state.me], teamList())']) {
    const html = run(expression);
    assert.doesNotMatch(html, /WALLS|3 walls|3 added walls/);
    assert.match(html, /SHIELDS|shields/);
    assert.match(html, /10/);
  }
  assert.match(run('house({...state.me,remaining:15})'), /🧱 \+3/);
  assert.match(run('house({...state.me,remaining:12})'), /--removed:0.00%/);
  assert.doesNotMatch(run('house({...state.me,remaining:10})'), /wall-visual/);
});
test('unconfirmed answer and Tool Yard show no verdict or new reward; confirmed result is visible', () => {
  const run = view();
  assert.match(run('questionCard(true)'), /Submitted—waiting for teacher/);
  assert.doesNotMatch(run('questionCard(true)'), /Correct!|Not correct|Answer A<\/b>/);
  assert.doesNotMatch(run('studentTools()'), /Open one mystery draw/);
  assert.match(run("state.me.submission.status = 'accepted'; questionCard(true)"), /Correct!/);
  assert.match(run("state.me.submission.status = 'rejected'; questionCard(true)"), /Not correct/);
});

test('expired teacher room opens a fresh QR room while expired student room stays student-only', async () => {
  const saved = new Map([['demolition-dash:host:73638','teacher-key'],['demolition-dash:last-host','73638']]);
  const context = vm.createContext({
    document:{getElementById:()=>({addEventListener(){}}),addEventListener(){}},
    navigator:{onLine:true},crypto:{randomUUID:()=> 'test'},window:{addEventListener(){}},setInterval(){},
    localStorage:{getItem:key=>saved.get(key)??null,setItem:(key,value)=>saved.set(key,value),removeItem:key=>saved.delete(key)},
  });
  vm.runInContext(source.replace(/initialRoute\(\);\s*$/,''),context);
  vm.runInContext(`render=()=>{};api=async()=>{throw Object.assign(new Error('Expired'),{status:404,code:'ROOM_NOT_FOUND'})};
    mode='host';pin='73638';token='teacher-key';createRoom=async fresh=>{globalThis.created=fresh};`,context);
  await vm.runInContext('loadState()',context);
  assert.equal(vm.runInContext('mode',context),'home');
  assert.equal(vm.runInContext('pin',context),'');
  assert.equal(vm.runInContext('globalThis.created',context),true);
  assert.equal(saved.has('demolition-dash:last-host'),false);
  assert.equal(saved.has('demolition-dash:host:73638'),false);
  vm.runInContext(`globalThis.created=false;mode='join';pin='73638';token='student-key';`,context);
  await vm.runInContext('loadState()',context);
  assert.equal(vm.runInContext('mode',context),'join');
  assert.equal(vm.runInContext('globalThis.created',context),false);
});
