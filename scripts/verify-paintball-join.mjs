import assert from 'node:assert/strict';
import {randomUUID} from 'node:crypto';
import {createRequire} from 'node:module';

const {chromium}=createRequire(import.meta.url)('playwright');
const base=new URL(process.argv[2] || 'http://127.0.0.1:3435');
assert.ok(['127.0.0.1','localhost','[::1]'].includes(base.hostname), 'Use a local Worker.');
async function post(path,body) {
  const response=await fetch(new URL(path,base),{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(body)});
  assert.ok(response.ok, 'Room setup HTTP '+response.status);
  return response.json();
}
const room=await post('/api/paintball/rooms',{});
const roomPath='/api/paintball/rooms/'+room.pin;
const joinUrl=new URL('/battle14/index.html?join='+room.pin,base).href;
const browser=await chromium.launch({channel:process.env.PAINTBALL_BROWSER || 'chrome',args:['--disable-webgl']});
const host=new WebSocket(new URL(roomPath+'/socket',base.href.replace('http:','ws:')));
const waitFor=(predicate)=>new Promise((resolve,reject)=>{
  const timeout=setTimeout(()=>{host.removeEventListener('message',listen);reject(Error('Timed out waiting for the teacher’s room'));},9000);
  function listen({data}) {
    const m=JSON.parse(data);
    if (!predicate(m)) return;
    clearTimeout(timeout);host.removeEventListener('message',listen);resolve(m);
  }
  host.addEventListener('message',listen);
});
host.addEventListener('open',()=>host.send(JSON.stringify({type:'auth',token:room.hostToken})));
host.addEventListener('message',({data})=>{const m=JSON.parse(data);if(m.type==='probe')host.send(JSON.stringify({type:'probeAck',nonce:m.nonce}));});
async function command(type,fields={}) {
  const id=randomUUID(),response=waitFor(m=>m.id===id);
  host.send(JSON.stringify({type:'action',id,action:{type,...fields}}));
  assert.equal((await response).type,'ack');
}
try {
  await waitFor(m=>m.type==='state'&&m.state.role==='host');
  const phone=await browser.newPage({viewport:{width:390,height:760}});
  const observer=await browser.newPage({viewport:{width:390,height:760}});
  const recovered=await browser.newPage({viewport:{width:390,height:760}});
  await phone.goto(joinUrl);
  await phone.getByRole('textbox',{name:'Team name',exact:true}).fill('Comets');
  assert.equal(await phone.getByLabel(/device name/i).count(),0);
  const firstJoin=phone.waitForRequest(r=>r.method()==='POST'&&r.url().endsWith('/join'));
  await phone.getByRole('button',{name:'Join room',exact:true}).click();
  assert.deepEqual(Object.keys((await firstJoin).postDataJSON()).sort(),['joinKey','name']);
  await phone.getByText('Battle 14 · Phone 1',{exact:true}).waitFor();

  await observer.goto(joinUrl);
  await observer.getByLabel('Team name',{exact:true}).fill('Discarded draft');
  await observer.locator('#join-team').selectOption({label:'Comets'});
  assert.equal(await observer.locator('input:visible').count(),0);
  const nextJoin=observer.waitForRequest(r=>r.method()==='POST'&&r.url().endsWith('/join'));
  const twoPhones=waitFor(m=>m.type==='state'&&m.state.teams[0]?.devices?.length===2);
  await observer.getByRole('button',{name:'Join room',exact:true}).click();
  const body=(await nextJoin).postDataJSON();
  assert.deepEqual(Object.keys(body).sort(),['joinKey','teamId']);
  const devices=(await twoPhones).state.teams[0].devices;
  assert.deepEqual(devices.map(d=>d.name),['Phone 1','Phone 2']);
  await command('host:controller',{teamId:body.teamId,deviceId:devices[1].id});
  await observer.getByText('You control this team’s robot.',{exact:true}).waitFor();
  let rejoined=0;
  observer.on('request',r=>{if(r.method()==='POST'&&r.url().endsWith('/join'))rejoined++;});
  await observer.reload();
  await observer.getByText('Battle 14 · Phone 2',{exact:true}).waitFor();
  await observer.getByText('You control this team’s robot.',{exact:true}).waitFor();
  assert.equal(rejoined,0,'A returning phone reconnects using its room credential.');

  const joinKey=randomUUID();
  const original=await post(roomPath+'/join',{teamId:body.teamId,deviceName:'Older app entry',joinKey});
  await command('host:start');
  // Recreate the exact tab state after the server accepted an old join, but the
  // phone refreshed before receiving its credential.
  await recovered.addInitScript(saved=>sessionStorage.setItem('paintball:joining',JSON.stringify(saved)),{
    identity:JSON.stringify([room.pin,body.teamId,'','Older app entry']),joinKey,
  });
  const retry=recovered.waitForResponse(r=>r.request().method()==='POST'&&r.url().endsWith('/join'));
  await recovered.goto(joinUrl);
  const replay=await retry;
  assert.equal(replay.status(),200);
  assert.deepEqual(await replay.json(),original);
  assert.deepEqual(replay.request().postDataJSON(),{teamId:body.teamId,joinKey});
  await recovered.getByText('Battle 14 · Phone 3',{exact:true}).waitFor();
  await recovered.getByText(/The principal insisted/).waitFor();
  console.log('New-team and teammate joins, automatic phone labels, teacher handoff, refresh and upgrade recovery passed.');
} finally {
  if (host.readyState===WebSocket.OPEN) {try {await command('host:finish');} finally {host.close();}}
  await browser.close();
}
