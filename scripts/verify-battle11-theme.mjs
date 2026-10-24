// Creates a separate labelled test room; never operates on an existing classroom room.
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {randomUUID,createHash} from 'node:crypto';
import QRCode from 'qrcode';
import {STATION_PAYLOADS} from '../app/battle11/core/game.js';
const base=process.argv[2];
if(!/^https?:\/\//.test(base||''))throw Error('Provide the existing site origin.');
const hash=b=>createHash('sha256').update(b).digest('hex');
for(const path of ['index.html','app.js','styles.css','museum-theme.css','assets/ui/museum.webp','assets/ui/parchment.webp','assets/ui/phone-surround.webp','assets/ui/teacher-surround.webp','assets/ui/station-emblems.webp']){
  const response=await fetch(base+'/battle11/'+path);assert.equal(response.status,200);
  const local=await readFile(new URL('../public/battle11/'+path,import.meta.url));
  if(path.endsWith('.webp'))assert.equal(hash(Buffer.from(await response.arrayBuffer())),hash(local));
  else assert.equal((await response.text()).replace(/\r\n/g,'\n'),local.toString().replace(/\r\n/g,'\n'));
}
console.log('PASS: published Battle 11 interface and artwork exactly match source');
async function api(path,token,body,status=200){
  const response=await fetch(base+'/api/museum/'+path,{method:body?'POST':'GET',headers:{...(token?{Authorization:'Bearer '+token}:{}),...(body?{'Content-Type':'application/json'}:{})},...(body?{body:JSON.stringify(body)}:{})});
  const data=await response.json();assert.equal(response.status,status,JSON.stringify(data));return data;
}
const host=await api('rooms','',{},201),root='rooms/'+host.pin;
const act=(token,type,extra={})=>api(root+'/action',token,{type,requestId:randomUUID(),...extra});
console.log('Disposable museum test room: '+host.pin);
try{
  const client={clientId:randomUUID(),name:'TEST Museum Theme'},player=await api(root+'/join','',client);
  assert.deepEqual(await api(root+'/join','',client),player);
  const qr=await (await fetch(base+'/api/museum/'+root+'/qr.svg')).text();
  assert.equal(qr,await QRCode.toString(base+'/battle11/index.html?join='+host.pin,{type:'svg',errorCorrectionLevel:'M',margin:4,width:340,color:{dark:'#2b1519',light:'#ffffff'}}));
  for(let n=1;n<=6;n++){
    const actual=await(await fetch(base+'/api/museum/stations/'+n+'/qr.svg')).text();
    assert.equal(actual,await QRCode.toString(STATION_PAYLOADS[n-1],{type:'svg',errorCorrectionLevel:'M',margin:4,width:440,color:{dark:'#2b1519',light:'#ffffff'}}));
  }
  console.log('PASS: joining QR, reconnect and six permanent station payloads unchanged');
  await act(host.hostToken,'host:start');
  const visit=await act(player.playerToken,'student:scan',{code:STATION_PAYLOADS[2]});
  const me=visit.state.me;
  assert.equal(visit.state.paragraph.number,3);
  assert.equal(me.activeVisit.expiresAt-me.activeVisit.startedAt,300000);
  const view=await api(root+'/state',host.hostToken);
  assert.equal(view.stations[2].count,1);assert.equal(view.groups[0].currentStation,3);
  assert.equal(view.options,undefined);assert.equal(view.solutions,undefined);assert.equal(view.paragraph,undefined);
  await act(player.playerToken,'student:save-leave',{station:3,letter:'A',visitId:me.activeVisit.id,expectedVersion:me.answerVersion});
  const after=await api(root+'/state',host.hostToken);
  assert.equal(after.groups[0].answeredCount,1);assert.equal(after.groups[0].savedStations[2],true);assert.equal(after.stations[2].count,0);
  assert.equal(after.groups[0].choices,undefined);
  await api(root+'/action',player.playerToken,{type:'host:end',requestId:randomUUID()},403);
  console.log('PASS: timed admission, teacher occupancy, ungraded saving and answer privacy');
}finally{
  await act(host.hostToken,'host:end');
  console.log('Test room closed.');
}
