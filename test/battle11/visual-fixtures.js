// Test-only render fixtures. Never imported by public code or backend routes.
import {readFileSync} from 'node:fs';
import vm from 'node:vm';
import {randomUUID} from 'node:crypto';
import {MuseumGame,STATION_PAYLOADS} from '../../app/battle11/core/game.js';
const source=readFileSync(new URL('../../public/battle11/app.js',import.meta.url),'utf8');
const names=['stationEmblem','caseVignette','header','hostLobby','stationTiles','groupTable','hostDashboard','studentEntry','studentWaiting','mapScreen','visitEndedScreen','scannerScreen','optionsList','activeStation','overviewScreen','submittedScreen','resultsContent','studentContent','modal'];
const functions=names.map(name=>{const start=source.indexOf('function '+name+'(');return source.slice(start,source.indexOf('\nfunction ',start+1));}).join('\n');
export function renderFixture(fixture) {
  const {state,mode='join',screen='map',draft=null,modal='',move=null,cameraError='',scanError=''}=fixture;
  const ctx={state,mode,pin:state.pin,token:'TEST-ONLY',apiBase:'/api/museum/rooms',pendingJoin:null,media:null,clockSkew:0,
    ui:{online:true,busy:false,name:'TEST Inspectors',screen,draft,modal,move,cameraError,scanError},
    esc:value=>String(value??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c])),
    btn:(label,action,cls,attrs='')=>`<button type="button" class="${cls}" data-action="${action}" ${attrs}>${label}</button>`,
    clockMarkup:()=>'<time class="countdown">4:32</time>',formatTime:()=> '12:40',elapsedText:()=> '24:10'};
  const call=fixture.render || (mode==='host'?(state.phase==='lobby'?'hostLobby':'hostDashboard'):'studentContent');
  return vm.runInNewContext(functions+`;${call}()+modal()`,ctx);
}
export function makeFixtures() {
  let now=1_000_000;
  const game=new MuseumGame({now:()=>now}),host=game.create(),player=game.join(host.pin,{clientId:randomUUID(),name:'TEST Inspectors'});
  const st=()=>structuredClone(game.state(host.pin,player.playerToken)),ht=()=>structuredClone(game.state(host.pin,host.hostToken));
  const act=(token,type,extra={})=>game.action(host.pin,token,{type,requestId:randomUUID(),...extra});
  const scan=n=>act(player.playerToken,'student:scan',{code:STATION_PAYLOADS[n-1]});
  const save=(n,letter,leave=true)=>{const me=st().me;return act(player.playerToken,leave?'student:save-leave':'student:save',{station:n,letter,visitId:me.activeVisit.id,expectedVersion:me.answerVersion});};
  const f={join:{state:st(),render:'studentEntry'},waiting:{state:st()},'teacher-lobby':{state:ht(),mode:'host'}};
  act(host.hostToken,'host:start');
  f.map={state:st()}; f.scanner={state:st(),screen:'scanner'};
  f['camera-denied']={state:st(),screen:'scanner',cameraError:'Camera unavailable or permission denied. Allow access and retry, or enter the backup code printed on this station card. Your answers are safe.'};
  f['station-full']={state:st(),screen:'scanner',scanError:'This station is full. Two groups are working here. Please choose another station.'};
  scan(2); f.reading={state:st()}; f.options={state:st(),draft:'A'};
  f['teacher-active']={state:ht(),mode:'host'};save(2,'A',false);
  f.saved={state:st(),draft:'A'}; now+=300001; f['expired-saved']={state:st(),screen:'visit-ended'};
  scan(3);now+=300001;f['expired-unsaved']={state:st(),screen:'visit-ended'};
  scan(1);f['move-confirmation']={state:st(),draft:'A',modal:'move',move:{from:2,letter:'A'}};
  save(1,'B');f['left-station']={state:st(),screen:'visit-ended'};
  scan(3);save(3,'C');scan(4);save(4,'D');scan(5);save(5,'E');scan(6);save(6,'F');
  f.review={state:st()};f.overview={state:st(),screen:'overview'};
  f['submit-confirmation']={state:st(),screen:'overview',modal:'submit'};
  act(player.playerToken,'student:submit',{expectedVersion:st().me.answerVersion});
  f.receipt={state:st()};
  act(host.hostToken,'host:end');f.closed={state:st()};
  act(host.hostToken,'host:reveal');f.results={state:st()};f['teacher-results']={state:ht(),mode:'host'};
  return f;
}
