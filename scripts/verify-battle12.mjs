// Real HTTP smoke test. Creates only labelled disposable test participants in a NEW room.
// Host/student credentials stay in process memory. The room is closed even on failure.
import assert from 'node:assert/strict';
import { randomUUID, createHash } from 'node:crypto';
import { readFile } from 'node:fs/promises';
import QRCode from 'qrcode';
import jsQR from 'jsqr';
const base=process.argv[2];
if(!base||!/^https?:\/\//.test(base))throw Error('Usage: node scripts/verify-battle12.mjs https://your-existing-site');
const log=message=>console.log('PASS: '+message);
async function api(path,token,body,expected=200){const response=await fetch(base+'/api/treasure/'+path,{method:body?'POST':'GET',headers:{...(token?{Authorization:'Bearer '+token}:{}),...(body?{'Content-Type':'application/json'}:{})},...(body?{body:JSON.stringify(body)}:{}),signal:AbortSignal.timeout(30000)});const data=await response.json();assert.equal(response.status,expected,JSON.stringify(data));return data;}
const hash=b=>createHash('sha256').update(b).digest('hex');
assert.equal(hash(Buffer.from(await (await fetch(base+'/battle12/app.js')).arrayBuffer())),hash(await readFile(new URL('../public/battle12/app.js',import.meta.url))));log('deployed frontend exactly matches the checked source');
const h=await api('rooms','',{},201),root=`rooms/${h.pin}`;
const act=(token,type,body={},requestId=randomUUID(),expected=200)=>api(root+'/action',token,{type,requestId,...body},expected);
console.log('Isolated review test room: '+h.pin);
try{
  const clients=Array.from({length:3},(_,i)=>({clientId:randomUUID(),name:`TEST B12 Review ${i+1}`}));
  const players=await Promise.all(clients.map(c=>api(root+'/join','',c)));
  assert.deepEqual(await api(root+'/join','',clients[0]),players[0]);log('three name-only joins and reconnect preserve identity');
  const publicState=await api(root+'/state');assert.equal(publicState.joinUrl,`${base}/battle12/index.html?join=${h.pin}`);
  const qrText=await (await fetch(base+'/api/treasure/'+root+'/qr.svg')).text();
  assert.equal(qrText,await QRCode.toString(publicState.joinUrl,{type:'svg',errorCorrectionLevel:'M',margin:4,width:340,color:{dark:'#2b1519',light:'#ffffff'}}));
  const qr=QRCode.create(publicState.joinUrl,{errorCorrectionLevel:'M'}),scale=7,width=(qr.modules.size+8)*scale,pixels=new Uint8ClampedArray(width*width*4);
  for(let y=0;y<width;y++)for(let x=0;x<width;x++){const a=Math.floor(x/scale)-4,b=Math.floor(y/scale)-4,d=a>=0&&b>=0&&a<qr.modules.size&&b<qr.modules.size&&qr.modules.get(a,b),i=(y*width+x)*4;pixels[i]=pixels[i+1]=pixels[i+2]=d?0:255;pixels[i+3]=255;}
  assert.equal(jsQR(pixels,width,width).data,publicState.joinUrl);log('served QR matches and decodes to the student-only room link');
  const t=players[0].playerToken;
  await api(root+'/review',t,undefined,403);
  await act(t,'host:end',{confirm:true},randomUUID(),403);
  assert.equal((await api(root+'/state',h.hostToken)).autoMark,true);
  await act(h.hostToken,'host:auto-mark',{enabled:false});
  await act(h.hostToken,'host:start');
  const c=await api(root+'/content',t);assert.equal(c.paragraphs.length,9);assert.equal(c.items.length,18);assert.ok(!JSON.stringify(c).includes('acceptedAnswers'));
  for(let n=1;n<=9;n++){const res=await fetch(`${base}/battle12/assets/paragraph_${String(n).padStart(2,'0')}.png`,{method:'HEAD'});assert.equal(res.status,200);assert.match(res.headers.get('content-type'),/image\/png/);}
  log('all nine images served; full passage available without private key');
  await act(t,'student:submit',{questionId:'q01',answer:'  SILVER GULL.  ',attempt:0});
  assert.equal((await api(root+'/state',t)).me.actions,0);
  assert.ok(!JSON.stringify(await api(root+'/state',h.hostToken)).includes('SILVER GULL.'));
  const review=await api(root+'/review',h.hostToken),entry=review.entries.find(e=>e.id===players[0].playerId);assert.equal(entry.response.value,'  SILVER GULL.  ');assert.equal(entry.suggestion.status,'suggest_accept');
  const receipt=randomUUID(),mark={questionId:'q01',playerId:players[0].playerId,attempt:1,decision:'accept'};
  await act(h.hostToken,'host:review',mark,receipt);await act(h.hostToken,'host:review',mark,receipt);
  let me=(await api(root+'/state',t)).me;assert.equal(me.actions,1);
  const explore=randomUUID(),exploreBody={location:'cave',expectedVersion:me.actionVersion};
  const reward=await act(t,'student:explore',exploreBody,explore);await act(t,'student:explore',exploreBody,explore);assert.ok(!('weight' in reward.result));
  assert.equal((await api(root+'/state',h.hostToken)).players.find(p=>p.id===players[0].playerId).location,'cave');
  me=(await api(root+'/state',t)).me;assert.equal(me.actions,0);assert.ok([2,3].includes(me.bag));log('teacher acceptance and exploration retry each change resources once');
  await act(h.hostToken,'host:advance',{questionId:'q01',skip:true});
  await act(h.hostToken,'host:pause',{paused:true});
  await act(h.hostToken,'host:auto-mark',{enabled:true});
  const autoReceipt=randomUUID(),autoAnswer={questionId:'q02',answer:'6',attempt:0};
  await act(t,'student:submit',autoAnswer,autoReceipt);await act(t,'student:submit',autoAnswer,autoReceipt);
  assert.equal((await api(root+'/state',t)).me.actions,1);
  log('automatic approved match awards exactly once while Question 2 is open');
  me=(await api(root+'/state',t)).me;
  await act(t,'student:bank',{expectedVersion:me.actionVersion},randomUUID(),409);
  await act(h.hostToken,'host:pause',{paused:false});await act(t,'student:bank',{expectedVersion:me.actionVersion});
  me=(await api(root+'/state',t)).me;assert.ok(me.vault>=2);assert.equal(me.bag,0);
  assert.equal((await api(root+'/state',h.hostToken)).players.find(p=>p.id===players[0].playerId).location,'camp');
  log('pause preserves marking; paid banking succeeds and teacher marker returns to Camp');
  await act(h.hostToken,'host:end',{},randomUUID(),409);
  await act(h.hostToken,'host:end',{confirm:true});
  const ended=await api(root+'/state',t);assert.equal(ended.role,'student');assert.equal(ended.phase,'ended');assert.equal(ended.me.vault,me.vault);
  await act(h.hostToken,'host:end',{confirm:true});assert.deepEqual((await api(root+'/state',t)).results,ended.results);
  for(const type of ['student:submit','student:bank','student:explore','student:attack'])await act(t,type,{},randomUUID(),409);
  await act(h.hostToken,'host:review',mark,randomUUID(),409);
  assert.deepEqual(await api(root+'/join','',clients[0]),players[0]);log('End Game locks actions/results; rejoining restores a student, never teacher');
  console.log('Battle 12 real-server review smoke test complete.');
}finally{await act(h.hostToken,'host:end',{confirm:true});console.log('Test room closed.');}
