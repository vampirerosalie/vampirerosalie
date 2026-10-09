import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {randomUUID} from 'node:crypto';
import vm from 'node:vm';
import {GameStore} from '../../app/battle7/core/game.js';

// This is an isolated DOM-contract harness, not a visual/browser test.
const source=readFileSync(new URL('../../public/battle7/app.js',import.meta.url),'utf8');
const questions=JSON.parse(readFileSync(new URL('../../app/battle7/data/question-bank.json',import.meta.url),'utf8')).questions;
const copy=value=>JSON.parse(JSON.stringify(value));
const response=(data,status=200)=>({ok:status<400,status,json:async()=>data});
const deferred=()=>{let resolve,reject;const promise=new Promise((yes,no)=>{resolve=yes;reject=no;});return {promise,resolve,reject};};
async function until(check){for(let i=0;i<100;i++){if(check())return;await new Promise(resolve=>setImmediate(resolve));}assert.fail('Frontend condition did not settle');}
function harness({saved=new Map(),fetcher=async()=>response({})}={}){
 const app={innerHTML:'',addEventListener(){}},announcer={textContent:''},windowEvents=new Map();
 const document={body:{dataset:{}},activeElement:null,querySelector:s=>s==='#app'?app:s==='#announcer'?announcer:null,querySelectorAll:()=>[],addEventListener(){}};
 const window={addEventListener:(name,fn)=>windowEvents.set(name,fn),scrollTo(){},postMessage(){}};window.parent=window;
 const calls=[];let network=fetcher;
 const context=vm.createContext({document,window,navigator:{onLine:true},location:{origin:'https://school.test',search:''},history:{},URLSearchParams,Map,Set,Date,Math,JSON,String,Number,Object,Array,Promise,Error,AbortController,crypto:{randomUUID},setInterval(){},setTimeout(){return 1;},clearTimeout(){},localStorage:{getItem:key=>saved.get(key)??null,setItem:(key,value)=>saved.set(key,value),removeItem:key=>saved.delete(key)},fetch:async(path,options)=>{calls.push({path,options,body:options.body?JSON.parse(options.body):null});return network(path,options);}});
 vm.runInContext(source+`;globalThis.frontend={ui,render,loadState,beginJoin,deliverPendingJoin,sendAction,deliverPending,navigate,applyState,hostControl,answerValue,shareUrl,queuePublicCooks,configure(nextMode,nextState,credential='test-token'){routeGeneration++;mode=nextMode;pin=String(nextState.pin);token=credential;state=null;applyState(nextState,true);},get(){return{mode,pin,token,state,pending,pendingJoin,routeGeneration,joinRetryDelay,retryDelay,joinInFlight:!!joinInFlight,actionInFlight:!!actionInFlight,html:app.innerHTML,cookQueueLength:cookQueue.length};}};`,context);
 return {frontend:context.frontend,saved,calls,network:fn=>network=fn,online:()=>windowEvents.get('online')?.()};
}
function fixture(teamCount=2){const store=new GameStore({questions});const host=store.create({teamCount});return {store,host};}
function adapter(store){return async(path,options)=>{const m=path.match(/\/rooms\/(\d{5})\/(join|state|action)$/);assert.ok(m,`Unexpected API path: ${path}`);const[,pin,op]=m,body=options.body?JSON.parse(options.body):null,token=options.headers.Authorization?.slice(7);try{if(op==='join')return response(store.join(pin,body));if(op==='action')return response(store.action(pin,token,body));return response(store.state(pin,token));}catch(error){return response({error:error.message,code:error.code},error.status||500);}};}
const action=(store,host,type,extra={})=>store.action(host.pin,host.hostToken,{type,requestId:randomUUID(),questionId:store.currentQuestion(store.room(host.pin))?.id,expectedPhase:store.room(host.pin).phase,...extra});
function snapshot(pin='12345',version=1){return {pin,version,roomName:'Test Kitchen',phase:'question',teamCount:2,teams:[],submissions:[],takenSlots:[],questionNumber:1,totalQuestions:20,question:questions[0],answerKey:questions[0],latestCooks:[],events:[],rushNumber:1,rushEndsAt:Date.now()+30000,rushEnded:false};}

test('frontend persists join identity before posting and recovers last-slot committed join after lost response, host start and reload',async()=>{
 const {store,host}=fixture();store.join(host.pin,{teamSlot:1,name:'First',clientId:randomUUID()});const saved=new Map(),normal=adapter(store);let posted;
 const first=harness({saved,fetcher:async(path,options)=>{if(path.endsWith('/join')){posted=JSON.parse(options.body);const persisted=JSON.parse(saved.get(`crazy-kitchen:pending-join:${host.pin}`));assert.equal(persisted.clientId,posted.clientId);assert.equal(persisted.teamSlot,2);store.join(host.pin,posted);throw new TypeError('Response lost after commit');}return normal(path,options);}});
 first.frontend.configure('join',store.state(host.pin),'');first.frontend.ui.slot=2;first.frontend.ui.teamName='Last Team';await first.frontend.beginJoin();
 assert.equal(store.room(host.pin).teams.length,2);assert.ok(saved.has(`crazy-kitchen:pending-join:${host.pin}`));assert.equal(first.frontend.get().token,'');
 action(store,host,'host:start');assert.equal(store.room(host.pin).phase,'question');
 const reloaded=harness({saved,fetcher:normal});reloaded.frontend.navigate('join',host.pin);
 assert.match(reloaded.frontend.get().html,/Saving your team/);assert.doesNotMatch(reloaded.frontend.get().html,/<h1>This kitchen has already started\./);
 await until(()=>!!reloaded.frontend.get().state?.me);const restored=reloaded.frontend.get();
 assert.equal(restored.state.me.slot,2);assert.equal(restored.state.me.name,'Last Team');assert.equal(restored.state.phase,'question');assert.equal(store.room(host.pin).teams.length,2);assert.ok(restored.token);assert.equal(saved.has(`crazy-kitchen:pending-join:${host.pin}`),false);assert.deepEqual(reloaded.calls.find(c=>c.path.endsWith('/join')).body,posted);
});

test('frontend reload recovers a committed join when every lobby slot is already taken',async()=>{
 const {store,host}=fixture(),clientId=randomUUID(),saved=new Map();store.join(host.pin,{teamSlot:1,name:'Other',clientId:randomUUID()});const joined=store.join(host.pin,{teamSlot:2,name:'Saved crew',clientId});saved.set(`crazy-kitchen:pending-join:${host.pin}`,JSON.stringify({pin:host.pin,clientId,teamSlot:2,name:'Saved crew'}));
 const h=harness({saved,fetcher:adapter(store)});h.frontend.navigate('join',host.pin);await until(()=>!!h.frontend.get().state?.me);assert.equal(h.frontend.get().token,joined.teamToken);assert.equal(store.room(host.pin).teams.length,2);
});

test('frontend does not speculate a join from a global client ID without a pending slot and name',async()=>{
 const {store,host}=fixture(),saved=new Map([['crazy-kitchen:clientId',randomUUID()]]);const h=harness({saved,fetcher:adapter(store)});h.frontend.navigate('join',host.pin);await until(()=>!!h.frontend.get().state);h.online();await until(()=>!!h.frontend.get().state);assert.equal(h.calls.filter(c=>c.path.endsWith('/join')).length,0);assert.equal(store.room(host.pin).teams.length,0);
});

test('frontend transient join 503 and 429 keep the exact identity, apply bounded backoff, and recover online',async()=>{
 const {store,host}=fixture(),saved=new Map();let status=503;const normal=adapter(store),h=harness({saved,fetcher:(path,options)=>path.endsWith('/join')&&status?response({error:'Retry later'},status):normal(path,options)});h.frontend.configure('join',store.state(host.pin),'');h.frontend.ui.slot=1;h.frontend.ui.teamName='Persistent';await h.frontend.beginJoin();const original=copy(h.frontend.get().pendingJoin);assert.ok(h.frontend.get().joinRetryDelay>3000);status=429;await h.frontend.deliverPendingJoin();assert.deepEqual(copy(h.frontend.get().pendingJoin),original);for(let i=0;i<15;i++)await h.frontend.deliverPendingJoin();assert.equal(h.frontend.get().joinRetryDelay,30000);status=0;h.online();await until(()=>!!h.frontend.get().state?.me);assert.equal(h.frontend.get().state.me.name,'Persistent');assert.equal(store.room(host.pin).teams.length,1);for(const call of h.calls.filter(c=>c.path.endsWith('/join'))){assert.equal(call.body.clientId,original.clientId);assert.equal(call.body.teamSlot,1);}
});

test('frontend definitive taken-slot failure clears only pending join and never swaps stations',async()=>{
 const {store,host}=fixture();store.join(host.pin,{teamSlot:1,name:'Occupied',clientId:randomUUID()});const h=harness({fetcher:adapter(store)});h.frontend.configure('join',store.state(host.pin),'');h.frontend.ui.slot=1;h.frontend.ui.teamName='Late';await h.frontend.beginJoin();assert.equal(h.frontend.get().pendingJoin,null);assert.equal(h.frontend.ui.slot,0);assert.match(h.frontend.ui.error,/taken/);assert.equal(h.saved.has(`crazy-kitchen:pending-join:${host.pin}`),false);assert.equal(h.calls.filter(c=>c.path.endsWith('/join')).length,1);assert.equal(store.room(host.pin).teams.length,1);
});

test('frontend ignores a late join response after navigation and restores it only on the original route',async()=>{
 const {store,host}=fixture(),gate=deferred(),normal=adapter(store);const h=harness({fetcher:async(path,options)=>{if(path.endsWith('/join')){const result=await normal(path,options);await gate.promise;return result;}return normal(path,options);}});h.frontend.configure('join',store.state(host.pin),'');h.frontend.ui.slot=1;h.frontend.ui.teamName='Delayed';const joining=h.frontend.beginJoin();await until(()=>store.room(host.pin).teams.length===1);h.frontend.navigate('home','');gate.resolve();await joining;assert.equal(h.frontend.get().mode,'home');assert.equal(h.frontend.get().token,'');assert.ok(h.saved.has(`crazy-kitchen:pending-join:${host.pin}`));h.network(normal);h.frontend.navigate('join',host.pin);await until(()=>!!h.frontend.get().state?.me);assert.equal(h.frontend.get().state.me.name,'Delayed');assert.equal(store.room(host.pin).teams.length,1);
});

test('frontend rejects delayed older-version polls without clearing new typed or rebuilt drafts',async()=>{
 const old=snapshot('12345',10),fresh={...snapshot('12345',11),question:questions[2],questionNumber:2},gate=deferred();const h=harness({fetcher:()=>gate.promise});h.frontend.configure('join',old);const polling=h.frontend.loadState();h.frontend.applyState(fresh);h.frontend.ui.answer='A draft being typed';h.frontend.ui.wordOrder=['t1','t2'];gate.resolve(response(old));await polling;assert.equal(h.frontend.get().state.version,11);assert.equal(h.frontend.get().state.question.id,fresh.question.id);assert.equal(h.frontend.ui.answer,'A draft being typed');assert.deepEqual(copy(h.frontend.ui.wordOrder),['t1','t2']);
});

test('frontend scopes delayed poll responses to their original room generation',async()=>{
 const old=snapshot('12345',99),fresh=snapshot('67890',1),gate=deferred();const h=harness({fetcher:path=>path.includes('12345')?gate.promise:response(fresh)});h.frontend.configure('screen',old,'');const polling=h.frontend.loadState();h.frontend.navigate('screen','67890');await until(()=>h.frontend.get().state?.pin==='67890');gate.resolve(response(old));await polling;assert.equal(h.frontend.get().pin,'67890');assert.equal(h.frontend.get().state.pin,'67890');assert.equal(h.frontend.get().state.version,1);
});

test('frontend scopes delayed action success and failure to their original room generation',async()=>{
 for(const status of [200,409]){const old=snapshot('12345',10),fresh=snapshot('67890',1),gate=deferred();const saved=new Map([['crazy-kitchen:host:67890','new-host-token']]);const h=harness({saved,fetcher:path=>path.endsWith('/action')?gate.promise:response(fresh)});h.frontend.configure('host',old,'old-host-token');const mutation=h.frontend.sendAction('host:reveal');h.frontend.navigate('host','67890');await until(()=>h.frontend.get().state?.pin==='67890');gate.resolve(response(status===200?{ok:true,state:{...old,version:11,phase:'reveal'}}:{error:'Old room failure'},status));await mutation;assert.equal(h.frontend.get().state.pin,'67890');assert.equal(h.frontend.get().token,'new-host-token');assert.equal(h.frontend.ui.error,'');assert.equal(h.frontend.get().pending,null);}
});

test('frontend captures round-sensitive question and phase once and preserves them unchanged on retry',async()=>{
 for(const type of ['host:reveal','host:advance','host:end-rush','pupil:cook','pupil:steal']){const first=snapshot('12345',10),h=harness({fetcher:()=>response({error:'Retry later'},503)});h.frontend.configure(type.startsWith('host:')?'host':'join',first);await h.frontend.sendAction(type,{ingredients:['Bread','Egg','Cheese'],powerId:'power',targetTeamId:'rival'});const original=copy(h.frontend.get().pending);assert.equal(original.questionId,first.question.id);assert.equal(original.expectedPhase,'question');h.frontend.applyState({...first,version:11,question:questions[2],phase:'rush',questionNumber:2});await h.frontend.deliverPending();assert.deepEqual(copy(h.frontend.get().pending),original);assert.deepEqual(h.calls.filter(c=>c.path.endsWith('/action')).map(c=>c.body),[original,original]);}
});

test('frontend renders every role/phase and question format, escapes text, guards review, and queues cook results exactly once',()=>{
 const h=harness(),base=snapshot();base.roomName='<script>unsafe</script>';for(const phase of ['lobby','question','reveal','rush','finished','closed'])for(const role of ['host','screen','join']){const s={...base,phase,me:role==='join'?{id:'a',slot:1,name:'Team',stars:0,inventory:{},recipes:[],powers:[],submission:null}:undefined};h.frontend.configure(role,s);assert.ok(h.frontend.get().html.length>100);assert.doesNotMatch(h.frontend.get().html,/<script>unsafe/);}
 for(const question of questions){h.frontend.configure('join',{...base,question,me:{id:'a',slot:1,name:'Team',stars:0,inventory:{},recipes:[],powers:[],submission:null}});assert.match(h.frontend.get().html,/Submit team answer/);if(question.format==='typed_correction')assert.match(h.frontend.get().html,/replacement only/);}
 h.frontend.configure('host',{...base,phase:'lobby'});assert.match(h.frontend.hostControl(0,1),/disabled/);assert.doesNotMatch(h.frontend.hostControl(0,2),/disabled/);
 h.frontend.configure('screen',base);h.frontend.queuePublicCooks(base);const cooks=Array.from({length:20},(_,i)=>({id:`cook-${i}`,teamName:'Team',dish:{name:'Toast',emoji:'🍞',success:true},at:i}));h.frontend.queuePublicCooks({...base,latestCooks:cooks});assert.equal(h.frontend.get().cookQueueLength,19);h.frontend.queuePublicCooks({...base,latestCooks:cooks});assert.equal(h.frontend.get().cookQueueLength,19);assert.match(h.frontend.shareUrl('join'),/\?battle=7&join=12345/);
});
