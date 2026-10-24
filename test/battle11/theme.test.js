import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import vm from 'node:vm';
import {randomUUID} from 'node:crypto';
import {MuseumGame,STATION_PAYLOADS} from '../../app/battle11/core/game.js';

const root=new URL('../../public/battle11/',import.meta.url);
const source=readFileSync(new URL('app.js',root),'utf8');
function fn(name){const start=source.indexOf('function '+name+'('),end=source.indexOf('\nfunction ',start+1);assert.ok(start>=0);return source.slice(start,end);}
function render(name,state){
  const ctx={state,pin:state.pin,mode:'host',apiBase:'/api/museum/rooms',ui:{online:true,busy:false},
    esc:v=>String(v??'').replaceAll('<','&lt;'),btn:(text,action)=>`<button data-action="${action}">${text}</button>`,
    clockMarkup:end=>`<time data-ends-at="${end}">5:00</time>`,elapsedText:ms=>String(ms),resultsContent:()=>'<section>RELEASED_RESULTS</section>'};
  return vm.runInNewContext(['header','stationTiles','groupTable',name].map(fn).join('\n')+`;${name}()`,ctx);
}
function fixture(){const game=new MuseumGame(),host=game.create();const player=game.join(host.pin,{clientId:randomUUID(),name:'TEST Detectives'});const act=(token,type,extra={})=>game.action(host.pin,token,{type,requestId:randomUUID(),...extra});return{game,host,player,act};}
test('case desk keeps all six station identities, clocks, occupancy and progress without exposing answers',()=>{
  const {game,host,player,act}=fixture();act(host.hostToken,'host:start');act(player.playerToken,'student:scan',{code:STATION_PAYLOADS[2]});
  const st=game.state(host.pin,host.hostToken),html=render('hostDashboard',{...st,solutions:[{answer:'PRIVATE_TEST_KEY'}]});
  assert.match(html,/case-layout/);assert.match(html,/case-desk/);assert.match(html,/station-board/);assert.match(html,/progress-board/);
  assert.equal((html.match(/class="station-tile /g)||[]).length,6);
  for(let n=1;n<=6;n++)assert.ok(html.includes(`STATION ${n} · PARAGRAPH ${n}`));
  assert.match(html,/TEST Detectives/);assert.match(html,/data-ends-at=/);assert.match(html,/1\/12/);
  assert.match(html,/data-action="join-qr"/);assert.match(html,/data-action="end"/);assert.match(html,/data-action="reveal"/);
  assert.doesNotMatch(html,/PRIVATE_TEST_KEY|RELEASED_RESULTS|Who is the thief/);
  assert.match(html,/Saved does not mean correct/);
  assert.match(render('hostDashboard',{...st,resultsReleased:true}),/RELEASED_RESULTS/);
});
test('lobby still has a large real joining QR and separate permanent station-card control',()=>{
  const {game,host}=fixture(),html=render('hostLobby',game.state(host.pin,host.hostToken));
  assert.ok(html.includes(`/api/museum/rooms/${host.pin}/qr.svg`));
  assert.match(html,/join-panel/);assert.match(html,/data-action="cards"/);assert.match(html,/data-action="start"/);
});
test('museum theme uses existing art and local typography without changing printable cards or student admission',()=>{
  const html=readFileSync(new URL('index.html',root),'utf8'),css=readFileSync(new URL('museum-theme.css',root),'utf8');
  assert.match(html,/museum-theme\.css\?v=1/);assert.match(css,/Georgia/);assert.match(css,/prefers-reduced-motion/);
  assert.doesNotMatch(readFileSync(new URL('styles.css',root),'utf8'),/fonts.googleapis/);
  for(const file of ['museum','parchment'])assert.equal(readFileSync(new URL(`assets/ui/${file}.webp`,root)).toString('ascii',8,12),'WEBP');
  assert.doesNotMatch(fn('mapScreen'),/data-action="(?:open|visit|enter)-station"/);
  assert.doesNotMatch(readFileSync(new URL('cards.html',root),'utf8'),/museum-theme/);
});
