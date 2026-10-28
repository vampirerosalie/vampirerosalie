// Isolated TEST room; real API + separate teacher/student browsers, no reward shortcuts.
import {createRequire} from 'node:module';
import {randomUUID} from 'node:crypto';
import {mkdir} from 'node:fs/promises';
import assert from 'node:assert/strict';
const {chromium}=createRequire(import.meta.url)('playwright');
const base=process.argv[2]||'http://localhost:3013',browser=await chromium.launch({channel:'chrome',headless:true});
let pin,hostToken;const errors=[];
async function api(path,token,body,status=200){const r=await fetch(base+'/api/territory/'+path,{method:body?'POST':'GET',headers:{...(token?{Authorization:'Bearer '+token}:{}),...(body?{'Content-Type':'application/json'}:{})},...(body?{body:JSON.stringify(body)}:{})});const j=await r.json();assert.equal(r.status,status,JSON.stringify(j));return j;}
const state=t=>api(`rooms/${pin}/state`,t),action=(t,type,extra={})=>api(`rooms/${pin}/action`,t,{type,requestId:randomUUID(),...extra});
async function pick(page,id){const el=page.locator(`[data-land="${id}"]`);await el.focus();await el.press('Enter');await page.locator('dialog[open]').waitFor();}
try{
 const teacher=await browser.newPage({viewport:{width:1440,height:1000}});teacher.on('pageerror',e=>errors.push(e.message));await teacher.goto(base+'/?battle=13&teacher=1');
 const f=teacher.frameLocator('iframe[title="Battle Thirteen: Territory Wars teacher game"]');await f.getByRole('button',{name:'Create a new room',exact:true}).click();await f.locator('.pin-large').waitFor();pin=(await f.locator('.pin-large').innerText()).trim();hostToken=await teacher.evaluate(p=>localStorage.getItem('territory-wars:host:'+p),pin);
 const phones=[];
 for(const width of [360,390]){
  const ctx=await browser.newContext({viewport:{width,height:844},isMobile:true,hasTouch:true}),page=await ctx.newPage();page.on('pageerror',e=>errors.push(e.message));
  await page.goto(base+`/battle13/index.html?join=${pin}`);await page.locator('#name').fill('TEST Grass '+width);await page.getByRole('button',{name:'Enter the kingdom',exact:true}).click();await page.getByText('Waiting for your teacher to start.').waitFor();phones.push({page,token:await page.evaluate(p=>localStorage.getItem('territory-wars:student:'+p),pin)});
 }
 for(let i=3;i<=7;i++)await api(`rooms/${pin}/join`,null,{clientId:randomUUID(),name:'TEST Grass '+i});
 await f.getByText('Starting now opens 70 claimable territories + 8 mysteries.',{exact:false}).waitFor();assert.equal(await f.locator('.qr').isVisible(),true);
 await f.getByRole('button',{name:'Start Game',exact:true}).click();await f.getByRole('heading',{name:'70 lands. 8 mysteries. One Crown.',exact:true}).waitFor();
 const v=await state(hostToken),mask=v.tiles.map(t=>[t.id,t.blocked]),blocked=v.tiles.find(t=>t.blocked),active=v.tiles.find(t=>!t.blocked&&t.kind==='regular');
 assert.deepEqual(v.board,{teamsAtStart:7,claimable:70,mysteries:8,blocked:42});
 for(const p of phones){
  await p.page.locator('.question .eyebrow').filter({hasText:'QUESTION 1 / 25'}).waitFor();await p.page.getByRole('button',{name:'Kingdom',exact:true}).click();
  await p.page.waitForFunction(()=>document.querySelectorAll('.is-blocked').length===42);
  assert.equal(await p.page.locator('[data-land]').count(),120);assert.equal(await p.page.locator('.land-mist').count(),8);
  assert.equal(await p.page.locator('.crown-land').getAttribute('data-blocked'),'false');
  assert.ok(await p.page.locator('.is-blocked .land-number').evaluateAll(es=>es.every(e=>getComputedStyle(e).display==='none')));
  assert.ok(await p.page.locator('.is-blocked .land-stone').evaluateAll(es=>es.every(e=>getComputedStyle(e).fill.includes('kingdom-grass'))));
  await pick(p.page,blocked.id);await p.page.getByRole('heading',{name:'Grassy reserve',exact:true}).waitFor();assert.equal(await p.page.locator('dialog [data-action="tile-action"]').count(),0);await p.page.locator('dialog .close').click();
  await p.page.getByRole('button',{name:'Choose territory',exact:true}).click();assert.ok(await p.page.locator(`dialog [data-tile="${blocked.id}"]`).isDisabled());await p.page.locator('dialog .close').click();
  await p.page.reload();await p.page.getByRole('button',{name:'Kingdom',exact:true}).click();await p.page.waitForFunction(()=>document.querySelectorAll('.is-blocked').length===42);
  assert.equal(await p.page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),true);
 }
 const a=phones[0];await action(a.token,'student:submit',{questionId:'q01',answer:'C'});await action(hostToken,'host:finalize-all',{questionId:'q01',reviewVersion:(await state(hostToken)).reviewVersion});
 let student=await state(a.token);assert.equal(student.me.actions,1);
 for(const type of ['claim','explore','fortify','shield','rebellion']){const rejection=await api(`rooms/${pin}/action`,a.token,{type:'student:'+type,requestId:randomUUID(),tileId:blocked.id,tileVersion:blocked.version,expectedVersion:student.me.actionVersion},409);assert.equal(rejection.code,'BLOCKED_TERRITORY');}
 assert.equal((await state(a.token)).me.actions,1);
 await a.page.reload();await a.page.getByRole('button',{name:'Kingdom',exact:true}).click();await pick(a.page,active.id);await a.page.getByRole('button',{name:'Claim · 1 Action',exact:true}).click();await a.page.getByRole('button',{name:'Continue',exact:true}).click();assert.equal((await state(a.token)).me.territories,1);
 await api(`rooms/${pin}/join`,null,{clientId:randomUUID(),name:'TEST Late Grass'});assert.deepEqual((await state(hostToken)).tiles.map(t=>[t.id,t.blocked]),mask);
 await mkdir('outputs/battle13/adaptive-board',{recursive:true});
 await teacher.screenshot({path:'outputs/battle13/adaptive-board/teacher.png',fullPage:true});
 for(const p of phones){await p.page.locator('#map').screenshot({path:`outputs/battle13/adaptive-board/map-${p.page.viewportSize().width}.png`});await p.page.screenshot({path:`outputs/battle13/adaptive-board/phone-${p.page.viewportSize().width}.png`,fullPage:true});}
 const grass=await fetch(base+'/battle13/assets/map/grass-reserve-v1.webp');assert.equal(grass.status,200);assert.ok((await grass.arrayBuffer()).byteLength>1000);
 await action(hostToken,'host:end',{confirm:true});await a.page.getByRole('heading',{name:/Your team wins|The kingdom is settled/}).waitFor();assert.ok(a.page.url().includes('join='+pin));assert.deepEqual(errors,[]);
 console.log('PASS real API + teacher + 360/390px students: 7-team Start locks 70 claimable + 8 mysteries + 42 grass; exact 120 hit areas, hidden grass numbers, Crown/mist preserved; blocked click/list/server actions safe; valid claim spends 1; refresh/late join preserve mask; End stays on student page; grass asset loads; no overflow/browser errors.');
}finally{if(pin&&hostToken)await action(hostToken,'host:end',{confirm:true}).catch(()=>{});await browser.close();}
