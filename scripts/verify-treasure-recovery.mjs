// Browser regression: the unavailable room is mocked; only a fresh TEST room is mutated.
import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
import {readFile,mkdir,writeFile} from 'node:fs/promises';
import {randomUUID} from 'node:crypto';
import {fileURLToPath} from 'node:url';
import jsQR from 'jsqr';
const require=createRequire(import.meta.url),{chromium}=require('playwright'),sharp=require('sharp');
const base=process.argv[2]||'https://grammartest.grammarclassroom.workers.dev';
const override=process.argv.includes('--local-app');
const source=await readFile(new URL('../public/battle12/app.js',import.meta.url),'utf8');
const out=new URL('../outputs/battle12-recovery/',import.meta.url);await mkdir(out,{recursive:true});
const browser=await chromium.launch({channel:'chrome',headless:true});
const checks=[],errors=[];let pin,key;
const note=s=>{checks.push(s);console.log('PASS '+s);};
async function prepare(context){
  if(override)await context.route('**/battle12/app.js*',r=>r.fulfill({contentType:'text/javascript',body:source}));
  await context.route('**/api/treasure/rooms/00000/state',r=>r.fulfill({status:404,contentType:'application/json',body:JSON.stringify({error:'This room is unavailable.',code:'ROOM_NOT_FOUND'})}));
}
try{
  const tc=await browser.newContext({viewport:{width:1440,height:1000}});await prepare(tc);
  await tc.addInitScript(()=>{if(!sessionStorage.getItem('recovery-test-seeded')){localStorage.setItem('treasure-raid:host-room','00000');localStorage.setItem('treasure-raid:host:00000','a'.repeat(64));sessionStorage.setItem('recovery-test-seeded','1');}});
  const teacher=await tc.newPage();teacher.on('pageerror',e=>errors.push(e.message));
  await teacher.goto(base+'/?battle=12&teacher=1');
  const desk=teacher.frameLocator('iframe[title="Battle Twelve: Treasure Raid teacher game"]');
  await desk.getByRole('button',{name:'Create a new room',exact:true}).waitFor();
  await teacher.reload();await desk.getByRole('button',{name:'Create a new room',exact:true}).waitFor();
  note('Missing saved teacher room has a persistent recovery button inside the existing game selector');
  await desk.getByRole('button',{name:'Create a new room',exact:true}).click();
  await desk.locator('.lobby-join .pin').waitFor();pin=(await desk.locator('.lobby-join .pin').innerText()).trim();
  key=await teacher.evaluate(p=>localStorage.getItem('treasure-raid:host:'+p),pin);assert.ok(key);assert.notEqual(pin,'00000');
  const svg=await(await fetch(base+`/api/treasure/rooms/${pin}/qr.svg`)).text();
  const pixels=await sharp(Buffer.from(svg)).resize(680,680).ensureAlpha().raw().toBuffer({resolveWithObject:true});
  const qr=jsQR(new Uint8ClampedArray(pixels.data),pixels.info.width,pixels.info.height);
  assert.equal(qr.data,base+`/battle12/index.html?join=${pin}`);
  await teacher.reload();await desk.locator('.lobby-join .pin').waitFor();assert.equal((await desk.locator('.lobby-join .pin').innerText()).trim(),pin);
  note('Recovery creates a real fresh room, decodable student joining QR, and survives teacher refresh');
  const sc=await browser.newContext({viewport:{width:390,height:844},isMobile:true,hasTouch:true});await prepare(sc);
  const phone=await sc.newPage();phone.on('pageerror',e=>errors.push(e.message));
  await phone.goto(base+'/battle12/?join=00000');
  await phone.getByRole('button',{name:'Enter a different room PIN'}).click();
  assert.equal(await phone.locator('[data-action="create"]').count(),0);
  await phone.locator('#pin').fill(pin);await phone.locator('#name').fill('TEST Entry Recovery');
  await phone.getByRole('button',{name:'Join Treasure Raid →'}).click();
  await phone.getByRole('heading',{name:'Your voyage awaits'}).waitFor();
  note('Student unavailable-room recovery accepts the current PIN with name-only joining and no teacher controls');
  await desk.getByRole('button',{name:'Start question 1 →'}).click();await phone.locator('#answer').waitFor();
  assert.ok(await phone.locator('link[href*="pirate-theme.css"]').count());
  await phone.locator('#answer').fill('Silver Gull');await phone.getByRole('button',{name:'Submit answer',exact:true}).click();
  await desk.getByText('TEST Entry Recovery',{exact:true}).first().waitFor();
  await phone.screenshot({path:fileURLToPath(new URL('student.png',out)),fullPage:true});
  note('Recovered room starts question 1, accepts a phone submission, and retains the pirate theme');
  await desk.getByRole('button',{name:'End Game',exact:true}).click();await desk.getByRole('button',{name:'End Game now',exact:true}).click();
  await phone.getByRole('heading',{name:'Treasure safely home'}).waitFor();await phone.reload();await phone.getByRole('heading',{name:'Treasure safely home'}).waitFor();
  assert.ok(phone.url().includes('join='+pin));assert.equal(await phone.locator('[data-action="create"]').count(),0);
  note('End Game and refresh keep the phone on student results');assert.deepEqual(errors,[]);
}finally{
  if(pin&&key)await fetch(base+`/api/treasure/rooms/${pin}/action`,{method:'POST',headers:{Authorization:'Bearer '+key,'Content-Type':'application/json'},body:JSON.stringify({type:'host:end',confirm:true,requestId:randomUUID()})});
  await writeFile(new URL(override?'local-app-report.json':'deployed-report.json',out),JSON.stringify({base,override,pin,checks,errors},null,2));await browser.close();
}
