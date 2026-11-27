import { createRequire } from 'node:module';
import { mkdir } from 'node:fs/promises';
import { randomUUID } from 'node:crypto';
import { fileURLToPath } from 'node:url';
import assert from 'node:assert/strict';

const require=createRequire(import.meta.url);
const {chromium}=require('playwright');
const decodeQR=require('jsqr');
const base=new URL(process.argv[2]||'http://127.0.0.1:3418');
if(!['localhost','127.0.0.1','[::1]'].includes(base.hostname))throw Error('Run this classroom test against a local Worker.');
const out=fileURLToPath(new URL('../outputs/battle14/',import.meta.url));
await mkdir(out,{recursive:true});
const browser=await chromium.launch({channel:process.env.PAINTBALL_BROWSER||'chrome',args:['--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader']});
const host=await browser.newPage({viewport:{width:1366,height:850}});
const portrait={width:393,height:852},landscape={width:852,height:393};
const phone=await browser.newPage({viewport:portrait,deviceScaleFactor:1.5,isMobile:true,hasTouch:true});
const projector=await browser.newPage({viewport:{width:1366,height:850}});
const classmates=[];
const errors=[];
for(const p of [host,phone,projector]){
  p.setDefaultTimeout(90000);
  p.on('pageerror',e=>errors.push(e.message));
}

// Additional controllers join and play through the same public room protocol.
// They keep the spectator screenshots representative without rendering six extra browsers.
async function joinClassmate(pin,name,index) {
  const path='/api/paintball/rooms/'+pin;
  const response=await fetch(new URL(path+'/join',base),{method:'POST',headers:{'Content-Type':'application/json'},
    body:JSON.stringify({name,deviceName:name+' phone',joinKey:randomUUID()})});
  assert.ok(response.ok,'Join '+name);
  const {token,teamId}=await response.json();
  const endpoint=new URL(path+'/socket',base);
  endpoint.protocol='ws:';
  const ws=new WebSocket(endpoint);
  const send=message=>ws.send(JSON.stringify(message));
  let seq=0,startedAt,heading,phase,round,answerFor,interval;
  const ready=new Promise((resolve,reject)=>{
    const timeout=setTimeout(()=>reject(new Error(name+' did not enter the room')),10000);
    ws.addEventListener('error',()=>{clearTimeout(timeout);reject(new Error(name+' connection failed'));});
    ws.addEventListener('open',()=>send({type:'auth',token}));
    ws.addEventListener('message',({data})=>{
      const msg=JSON.parse(data);
      if(msg.type==='probe')send({type:'probeAck',nonce:msg.nonce});
      if(msg.type==='state'){
        const s=msg.state;
        clearTimeout(timeout);resolve();
        phase=s.paused?'paused':s.phase;round=s.round;
        if(phase==='quiz'&&answerFor!==s.question.id&&!s.closed){
          answerFor=s.question.id;
          send({type:'action',id:randomUUID(),action:{type:'student:submit',questionId:answerFor,answer:'ABCD'[(s.question.number+index)%4]}});
        }
      }
      if(msg.type==='arena'&&msg.frame&&heading===undefined){
        const me=msg.frame.players.find(p=>p.id===teamId);
        if(!me)return;
        heading=me.yaw;startedAt=Date.now();
        interval=setInterval(()=>{
          if(phase!=='shootout'||ws.readyState!==WebSocket.OPEN||Date.now()-startedAt>2500)return;
          const fire=++seq===18;
          send({type:'input',seq,round,dx:Math.sin(heading),dz:-Math.cos(heading),yaw:heading,fire,...(fire?{fireId:randomUUID()}:{})});
        },100);
      }
    });
  });
  await ready;
  return ()=>{clearInterval(interval);ws.close();};
}

async function quizFits(page) {
  const options=page.locator('[data-choice]');
  assert.equal(await options.count(),4);
  const seen=await options.evaluateAll(items=>items.map(el=>{
    const box=el.getBoundingClientRect();
    return {label:el.textContent.trim(),inside:box.width>0&&box.height>0&&box.x>=-1&&box.right<=innerWidth+1&&box.y>=-1&&box.bottom<=innerHeight+1};
  }));
  assert.ok(seen.every(item=>item.inside),'All four quiz options in the visible phone viewport: '+JSON.stringify(seen));
}

async function liveRobot(pageOrFrame,name) {
  await pageOrFrame.locator('.pb-world canvas').scrollIntoViewIfNeeded();
  const scene=pageOrFrame.locator('.pb-world[data-ready="true"][data-players="7"]');
  await scene.waitFor();
  assert.notEqual(await scene.getAttribute('data-renderer'),'overhead','Real WebGL arena');
  const own=scene.locator('.pb-label').filter({hasText:name}).first();
  await own.waitFor({state:'visible'});
  const canvas=await scene.locator('canvas').boundingBox(),label=await own.boundingBox();
  assert.ok(canvas&&label&&label.x+label.width/2>=canvas.x&&label.x+label.width/2<=canvas.x+canvas.width
    &&label.y+label.height/2>=canvas.y&&label.y+label.height/2<=canvas.y+canvas.height,'Player rendered within the live arena');
}
try {
  for(const [game,battle] of [['kitchen',7],['market',9],['territory',13],['paintball',14]]){
    const health=await host.request.get(new URL('/api/'+game+'/health',base).href);
    assert.ok(health.ok(),game+' Worker health');
    const data=await health.json();
    assert.equal(data.ok,true);
    if(data.battle!==undefined)assert.equal(data.battle,battle);
  }
  await host.goto(new URL('/?battle=14&teacher=1',base).href);
  const menu=host.getByRole('tab',{name:/Paintball Showdown/i});
  await menu.waitFor();
  assert.equal(await menu.getAttribute('aria-selected'),'true');
  const teacher=host.frameLocator('iframe[title*="Paintball"]');
  const teacherButtons=()=>teacher.getByRole('button').allTextContents();
  await teacher.locator('button').first().waitFor();
  await teacher.locator('.pb-world canvas').waitFor();
  await host.waitForTimeout(600);
  await host.screenshot({path:out+'/teacher-entry.png'});
  console.log('Teacher menu',await teacherButtons());
  const creation=host.waitForResponse(r=>r.request().method()==='POST'&&new URL(r.url()).pathname==='/api/paintball/rooms');
  await teacher.getByRole('button',{name:/create.*room|new game/i}).first().click();
  const created=await (await creation).json();
  await teacher.getByRole('heading',{name:'Ready room'}).waitFor();
  const qr=teacher.locator('#room-entrance .scan-code img');
  await qr.waitFor();
  assert.ok((await qr.boundingBox()).width>=270,'Joining QR is large on the teacher screen');
  const encoded=new URL(await qr.getAttribute('src'),base);
  const joinLink=encoded.searchParams.get('text');
  assert.ok(joinLink&&new URL(joinLink).searchParams.get('join'));
  const qrResponse=await host.request.get(encoded.href);
  assert.ok(qrResponse.ok());assert.match(await qrResponse.text(),/<svg/);
  const qrPixels=await qr.evaluate(async img=>{
    await img.decode();
    const canvas=document.createElement('canvas');
    canvas.width=canvas.height=260;
    const ctx=canvas.getContext('2d');
    ctx.fillStyle='white';ctx.fillRect(0,0,260,260);ctx.drawImage(img,0,0,260,260);
    const pixels=ctx.getImageData(0,0,260,260).data;
    return Array.from(pixels);
  });
  const scanned=decodeQR(Uint8ClampedArray.from(qrPixels),260,260);
  assert.equal(scanned?.data,joinLink);
  if(await teacher.locator('dialog[open]').count())await teacher.locator('[data-act="dismiss"]').click();
  await phone.goto(scanned.data);
  await phone.getByRole('textbox',{name:'Team name',exact:true}).fill('Lime Rockets');
  await phone.getByRole('button',{name:/join|register/i}).last().click();
  await teacher.getByText('Lime Rockets',{exact:true}).first().waitFor();
  const pin=new URL(joinLink).searchParams.get('join');
  for(const [i,name] of ['Blue Comets','Amber Sparks','Violet Brigade','Teal Tigers','Rose Runners','Orange Orbit'].entries()){
    classmates.push(await joinClassmate(pin,name,i));
  }
  await teacher.getByText('Orange Orbit',{exact:true}).first().waitFor();
  await projector.goto(await teacher.getByRole('link',{name:'Projector view'}).getAttribute('href'));
  await host.bringToFront();
  await host.screenshot({path:out+'/teacher-lobby.png'});
  console.log('Teacher lobby',await teacherButtons());
  await teacher.getByRole('button',{name:/start game|start quiz|start questions/i}).first().click();
  await projector.getByText(/The principal insisted/).first().waitFor();
  await projector.bringToFront();
  await quizFits(projector);
  await projector.screenshot({path:out+'/projector-question.png'});
  await phone.getByText(/The principal insisted/).first().waitFor();
  assert.equal(await phone.locator('.team-points strong').textContent(),'0');
  assert.equal(await phone.locator('.team-ammo strong').textContent(),'5');
  assert.deepEqual(await teacher.locator('.roster .score').allTextContents(),Array(7).fill('0 pts'));
  assert.deepEqual(await teacher.locator('.roster .ammo').allTextContents(),Array(7).fill('5'));
  await phone.bringToFront();
  await quizFits(phone);
  await phone.screenshot({path:out+'/student-question-portrait.png'});
  await phone.locator('[data-choice="A"]').click();
  const originalURL=phone.url();
  const timeOrigin=await phone.evaluate(()=>performance.timeOrigin);
  async function checkSamePhone(){
    assert.equal(phone.url(),originalURL);
    assert.equal(await phone.evaluate(()=>performance.timeOrigin),timeOrigin,'Rotation must keep the same document');
  }
  await phone.setViewportSize(landscape);
  await phone.locator('[data-choice="A"][aria-pressed="true"]').waitFor();
  await quizFits(phone);await checkSamePhone();
  await phone.screenshot({path:out+'/student-question-landscape.png'});
  await phone.setViewportSize(portrait);
  await phone.locator('[data-choice="A"][aria-pressed="true"]').waitFor();
  await checkSamePhone();
  const choices=['A','B','D','A','C'];
  for(let i=0;i<choices.length;i++){
    await phone.getByText('Question '+(i+1)+' / 20',{exact:true}).waitFor();
    await phone.locator('[data-choice="'+choices[i]+'"]').click();
    await phone.getByRole('button',{name:'Submit answer'}).click();
    await phone.getByText('Submitted · '+choices[i],{exact:true}).waitFor();
    if(i===0){
      await projector.getByText(/The principal insisted/).first().waitFor();
      await teacher.locator('[data-act="countdown"]').click();
      await teacher.getByText('Submissions closed',{exact:true}).waitFor({timeout:16000});
      await teacher.locator('[data-act="review"]').click();
      const review=teacher.locator('dialog[open]');
      await review.locator('[data-decision="reject"]').first().click();
      await review.locator('[data-decision="reject"].current').first().waitFor();
      await review.locator('[data-decision="accept"]').first().click();
      await review.locator('[data-decision="accept"].current').first().waitFor();
      assert.equal(await phone.locator('.revealed').count(),0);
      assert.equal(await projector.locator('[data-act="review"],.revealed').count(),0);
      await review.locator('[data-act="finalize"]').click();
      await teacher.locator('[data-act="reveal"]').click();
      await phone.getByText('Correct answer · A · on',{exact:true}).waitFor();
      assert.equal(await phone.locator('.team-ammo strong').textContent(),'7');
      await projector.getByText('Correct answer · A · on',{exact:true}).waitFor();
    }else await teacher.locator('#content [data-act="finalize"]').click();
    await teacher.locator('[data-act="next"]').click();
  }
  await phone.getByText('Starting paintballs',{exact:true}).waitFor();
  assert.equal(await phone.locator('.team-ammo strong').textContent(),'15');
  await host.bringToFront();
  await teacher.locator('[data-act="fullscreen"]').click();
  // Pause the authoritative round as soon as it starts so software-WebGL
  // initialization on three simultaneous browsers doesn't consume playing time.
  const control=new WebSocket(String(base).replace(/^http/,'ws').replace(/\/$/,'')+'/api/paintball/rooms/'+pin+'/socket');
  const requests=new Map();
  function timing(type){
    return new Promise((resolve,reject)=>{
      if(control.readyState!==WebSocket.OPEN)return reject(new Error('Local capture clock connection closed.'));
      const id=randomUUID();
      const timeout=setTimeout(()=>{requests.delete(id);reject(new Error('Local capture clock timed out on '+type));},10000);
      requests.set(id,{resolve(){clearTimeout(timeout);resolve();},reject(err){clearTimeout(timeout);reject(err);}});
      control.send(JSON.stringify({type:'action',id,action:{type:'host:'+type,round:1}}));
    });
  }
  let stopForSetup=true;
  const signedIn=new Promise(resolve=>{
    control.onopen=()=>control.send(JSON.stringify({type:'auth',token:created.hostToken}));
    control.onmessage=({data})=>{
      const m=JSON.parse(data);
      if(m.type==='state'){
        resolve();
        if(stopForSetup&&m.state.phase==='shootout'){stopForSetup=false;timing('pause').catch(e=>errors.push(e.message));}
      }
      if(m.type==='probe')control.send(JSON.stringify({type:'probeAck',nonce:m.nonce}));
      const request=requests.get(m.id);
      if(request){requests.delete(m.id);if(m.type==='error')request.reject(new Error(m.message));else request.resolve();}
    };
  });
  classmates.push(()=>control.close());
  await signedIn;
  await teacher.locator('[data-act="start-round"]').click();
  for(const [tab,scope] of [[host,teacher],[projector,projector],[phone,phone]]){
    await tab.bringToFront();
    await liveRobot(scope,'Lime Rockets');
  }
  await phone.locator('.pb-fire:disabled').waitFor();
  await timing('resume');
  await teacher.locator('[data-act="pause"]').waitFor();
  await Promise.all([host.screenshot({path:out+'/teacher-live.png'}),projector.screenshot({path:out+'/projector-live.png'})]);
  console.log('Captured live teacher and public projector with seven teams.');
  await projector.close();
  await phone.bringToFront();
  await phone.locator('.pb-fire:enabled').waitFor();
  await phone.locator('.pb-fire').tap();
  await phone.getByText('14 paintballs',{exact:true}).waitFor();
  await timing('pause');
  await phone.setViewportSize(landscape);
  await liveRobot(phone,'Lime Rockets');
  await checkSamePhone();
  await phone.getByText('14 paintballs',{exact:true}).waitFor();
  await timing('resume');
  await phone.locator('.pb-fire:enabled').waitFor();
  await phone.screenshot({path:out+'/student-live-landscape.png'});
  await timing('pause');
  await phone.setViewportSize(portrait);
  await liveRobot(phone,'Lime Rockets');
  await checkSamePhone();
  await phone.getByText('14 paintballs',{exact:true}).waitFor();
  await timing('resume');
  await phone.locator('.pb-fire:enabled').waitFor();
  await phone.screenshot({path:out+'/student-live-portrait.png'});
  await teacher.locator('[data-act="pause"]').click();
  await phone.locator('.pb-fire:disabled').waitFor();
  await phone.reload({waitUntil:'domcontentloaded'});await phone.getByText('14 paintballs',{exact:true}).waitFor();
  await phone.locator('.pb-fire:disabled').waitFor();
  console.log('Phone returned to its paused round with 14 paintballs');
  await teacher.locator('[data-act="resume"]').click();
  await phone.locator('.pb-fire:enabled').waitFor();
  await host.bringToFront();
  await teacher.locator('[data-act="end-round"]').click();
  await teacher.locator('[data-act="end-round-confirm"]').click();
  await phone.getByRole('heading',{name:'Shootout 1 complete'}).waitFor();
  const totals=await phone.locator('.leader-table tbody tr').evaluateAll(rows=>
    Object.fromEntries(rows.map(row=>[row.cells[0].textContent.trim(),row.cells[2].textContent.trim()])));
  await teacher.locator('[data-act="continue"]').click();
  await phone.getByText('Question 6 / 20',{exact:true}).waitFor();
  assert.equal(await phone.locator('.team-points strong').textContent(),totals['Lime Rockets']);
  assert.equal(await phone.locator('.team-ammo strong').textContent(),'5');
  for(const [name,total] of Object.entries(totals)){
    const team=teacher.locator('.roster .team-row').filter({hasText:name});
    assert.equal(await team.locator('.score').textContent(),total+' pts');
  }
  await teacher.locator('[data-act="end-game"]').click();
  await teacher.locator('dialog [data-act="finish"]').click();
  await phone.getByText('Final standings',{exact:true}).waitFor();
  assert.equal(await phone.locator('tbody tr').filter({hasText:'Lime Rockets'}).locator('td').nth(2).textContent(),'5/20');
  assert.equal(await phone.locator('[data-act="new-game"]').count(),0);
  console.log('Seven real teams, QR join, private marking, preserved answers and ammo across phone rotations, live WebGL players, projector, reload, and leaderboard passed.');
  assert.deepEqual(errors,[]);
} catch(error) {
  console.error('Phone screen at failure:',(await phone.locator('body').innerText().catch(()=>'' )).slice(0,950));
  console.error('Browser errors:',errors);
  throw error;
} finally {for(const close of classmates)close();await browser.close();}

