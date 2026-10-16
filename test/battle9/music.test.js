import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import {readFileSync} from 'node:fs';
const source=readFileSync(new URL('../../public/battle9/music.js',import.meta.url),'utf8');
function setup(){
 const sounds=[],saved=new Map(),listeners={};
 const element=()=>({events:{},attributes:{},textContent:'',value:'',parentNode:null,addEventListener(k,f){this.events[k]=f;},setAttribute(k,v){this.attributes[k]=v;},appendChild(c){c.parentNode=this;this.child=c;},remove(){this.parentNode=null;},querySelector(k){return this.parts[k]??=element();},parts:{}});
 const panel=element(),slot=element();
 class Audio{constructor(){this.paused=true;this.currentTime=0;this.events={};this.plays=0;sounds.push(this);}addEventListener(k,f){this.events[k]=f;}play(){this.plays++;if(this.reject)return Promise.reject(Error('Blocked'));this.paused=false;return this.defer||Promise.resolve();}pause(){this.paused=true;}load(){this.loads=(this.loads||0)+1;}}
 const context=vm.createContext({Audio,document:{createElement:()=>panel},localStorage:{getItem:k=>saved.get(k)??null,setItem:(k,v)=>saved.set(k,v)},window:{addEventListener:(k,f)=>listeners[k]=f}});
 vm.runInContext(source,context);
 const update=(extra={})=>context.window.MarketMusic.update({teacher:true,phase:'question',pin:'12345',slot,...extra});
 const press=async()=>{panel.parts.button.events.click();await new Promise(r=>setImmediate(r));};
 return{sounds,saved,panel,slot,listeners,update,press};
}
test('music defaults off, students and projector never create or fetch audio',async()=>{
 const s=setup();s.update({teacher:false});assert.equal(s.sounds.length,0);assert.equal(s.slot.child,undefined);
 s.update();assert.equal(s.panel.parts.button.textContent,'Play music');assert.equal(s.sounds.length,0);assert.equal(s.panel.parts.input.value,'18');
 await s.press();assert.equal(s.sounds.length,1);assert.equal(s.sounds[0].preload,'none');assert.equal(s.sounds[0].loop,true);assert.equal(s.sounds[0].volume,.18);assert.equal(s.sounds[0].paused,false);
});
test('playback survives game rerenders and volume stays local; pause resumes without restarting',async()=>{
 const s=setup();s.update();await s.press();const a=s.sounds[0];a.currentTime=8;s.update();s.update({phase:'auction'});assert.equal(a.plays,1);assert.equal(a.currentTime,8);
 s.panel.parts.input.value='42';s.panel.parts.input.events.input();assert.equal(a.volume,.42);assert.equal(s.saved.get('black-market:music-volume'),'.42'.replace(/^\./,'0.'));
 await s.press();assert.equal(a.paused,true);assert.equal(a.currentTime,8);await s.press();assert.equal(a.paused,false);assert.equal(a.currentTime,8);
});
test('end game, route changes and leaving stop music; new game stays off',async()=>{
 const s=setup();s.update();await s.press();const a=s.sounds[0];s.update({phase:'finished'});assert.equal(a.paused,true);assert.equal(a.currentTime,0);assert.equal(s.panel.parentNode,null);
 s.update({pin:'54321',phase:'lobby'});assert.equal(a.paused,true);await s.press();s.update({teacher:false});assert.equal(a.paused,true);s.update();await s.press();s.listeners.pagehide();assert.equal(a.paused,true);
});
test('failed audio affects only music; retry reloads audio and never touches game networking',async()=>{
 const s=setup();s.update();await s.press();const a=s.sounds[0];a.events.error();assert.equal(a.paused,true);assert.match(s.panel.parts['.music-status'].textContent,/game continues/);await s.press();assert.equal(a.loads,1);
 await s.press();a.reject=true;await s.press();assert.match(s.panel.parts['.music-status'].textContent,/game is unaffected/);
 assert.doesNotMatch(source,/fetch\(|WebSocket|api\/|sendAction|setInterval|setTimeout/);
});
test('rapid pause or ending during initial play cannot restart sound',async()=>{
 const s=setup();s.update();await s.press();await s.press();const a=s.sounds[0];let resolve;a.defer=new Promise(r=>resolve=r);await s.press();s.update({phase:'finished'});resolve();await new Promise(r=>setImmediate(r));assert.equal(a.paused,true);
});
test('original audio is bounded, non-silent, unclipped and loops without a boundary jump',()=>{
 const wav=readFileSync(new URL('../../public/battle9/assets/violet-market.wav',import.meta.url));assert.equal(wav.toString('ascii',0,4),'RIFF');assert.equal(wav.readUInt32LE(24),22050);assert.equal(wav.length,1411244);
 let square=0,peak=0;for(let i=44;i<wav.length;i+=2){const v=wav.readInt16LE(i)/32768;square+=v*v;peak=Math.max(peak,Math.abs(v));}
 assert.ok(peak<.7&&peak>.5);assert.ok(Math.sqrt(square/((wav.length-44)/2))>.05);assert.ok(Math.abs(wav.readInt16LE(44)-wav.readInt16LE(wav.length-2))<1000);
});
