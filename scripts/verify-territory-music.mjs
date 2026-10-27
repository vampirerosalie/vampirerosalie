// Uses an isolated test room and actual Chromium audio decoding, not classroom rooms.
import {createRequire} from 'node:module';
import assert from 'node:assert/strict';
import {randomUUID} from 'node:crypto';
const require=createRequire(import.meta.url),{chromium}=require('playwright');
const base=process.argv[2]||'http://localhost:3013';
const browser=await chromium.launch({channel:'chrome',headless:true});
let pin,token;
async function action(type,extra={}){const r=await fetch(`${base}/api/territory/rooms/${pin}/action`,{method:'POST',headers:{Authorization:'Bearer '+token,'Content-Type':'application/json'},body:JSON.stringify({type,requestId:randomUUID(),...extra})});assert.equal(r.status,200);return r.json();}
try{
 const context=await browser.newContext({viewport:{width:1280,height:800}}),page=await context.newPage();
 let audioRequests=0;page.on('request',r=>{if(r.url().includes('legends.mp3'))audioRequests++;});
 await page.goto(base+'/?battle=13&teacher=1');
 const f=page.frameLocator('iframe[title="Battle Thirteen: Territory Wars teacher game"]');
 await f.getByRole('button',{name:'Create a new room',exact:true}).click();await f.locator('.pin-large').waitFor();
 pin=(await f.locator('.pin-large').innerText()).trim();token=await page.evaluate(pin=>localStorage.getItem('territory-wars:host:'+pin),pin);
 await f.locator('.kingdom-music').waitFor();assert.equal(audioRequests,0);assert.equal(await f.locator('audio').count(),0);
 assert.equal(await f.locator('.kingdom-music-credit a').first().getAttribute('href'),'https://creatorchords.com/music/legends/');
 console.log('PASS Teacher music controls and attribution visible; no automatic audio download/play');
 await f.getByRole('button',{name:'Play music',exact:true}).click();
 const inner=page.frames().find(x=>x.url().includes('/battle13/'));
 await inner.waitForFunction(()=>{const a=document.querySelector('audio');return a&&!a.paused&&a.currentTime>0.2&&a.duration>160&&a.duration<190;});
 const before=await f.locator('audio').evaluate(a=>a.currentTime);await page.waitForTimeout(2200);
 assert.ok(await f.locator('audio').evaluate(a=>a.currentTime)>before+1);assert.equal(await f.locator('audio').count(),1);assert.equal(await f.locator('audio').evaluate(a=>a.loop),true);
 await f.getByLabel('Music volume').fill('37');assert.equal(await f.locator('audio').evaluate(a=>a.volume),.37);
 await f.getByRole('button',{name:'Pause music',exact:true}).click();assert.equal(await f.locator('audio').evaluate(a=>a.paused),true);
 console.log('PASS Actual MP3 decodes and plays; loop, volume, pause and polling continuity work');
 await page.reload();await f.getByRole('button',{name:'Play music',exact:true}).waitFor();assert.equal(await f.getByLabel('Music volume').inputValue(),'37');assert.equal(await f.locator('audio').count(),0);
 console.log('PASS Refresh remembers volume without restarting music');
 const sc=await browser.newContext(),student=await sc.newPage();let studentAudio=0;student.on('request',r=>{if(r.url().includes('legends.mp3'))studentAudio++;});
 await student.goto(`${base}/battle13/?join=${pin}`);await student.locator('#name').fill('TEST Music student');await student.getByRole('button',{name:'Enter the kingdom'}).click();await student.getByText('Waiting for your teacher to start.').waitFor();
 assert.equal(await student.locator('.kingdom-music').count(),0);assert.equal(studentAudio,0);
 const joined=await fetch(`${base}/api/territory/rooms/${pin}/join`,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({name:'TEST Music second',clientId:randomUUID()})});assert.ok(joined.ok);
 await f.getByRole('button',{name:'Play music',exact:true}).click();await f.getByRole('button',{name:'Pause music',exact:true}).waitFor();
 await action('host:start');await f.locator('.question').waitFor();assert.equal(await f.locator('audio').evaluate(a=>a.paused),false);
 await action('host:pause',{paused:true});await f.getByRole('button',{name:'Resume actions',exact:true}).waitFor();assert.equal(await f.locator('audio').evaluate(a=>a.paused),false);
 const activeFrame=page.frames().find(x=>x.url().includes('/battle13/'));await activeFrame.evaluate(()=>window.testAudio=document.querySelector('audio'));
 await action('host:end',{confirm:true});await f.getByRole('heading',{name:'Final standings',exact:true}).waitFor();assert.equal(await activeFrame.evaluate(()=>window.testAudio.paused),true);assert.equal(await f.locator('.kingdom-music').count(),0);
 assert.equal(studentAudio,0);console.log('PASS Student stays silent; starting/pause-actions preserve music; End Game stops it');
 await f.locator('#header').getByRole('button',{name:'New Game',exact:true}).click();assert.equal(await f.locator('.kingdom-music').count(),0);
 console.log('PASS New Game returns to a silent setup screen');
}finally{
 if(pin&&token)await action('host:end',{confirm:true}).catch(()=>{});
 await browser.close();
}
