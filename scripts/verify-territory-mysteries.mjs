// Real room API and isolated phone browsers. No classroom room or forced outcomes.
import {createRequire} from 'node:module';
import {randomUUID} from 'node:crypto';
import {mkdir} from 'node:fs/promises';
import assert from 'node:assert/strict';
import bank from '../app/battle13/sets/science-f1-ch6.json' with {type:'json'};
import {MAP} from '../public/battle13/map-data.js';
const {chromium}=createRequire(import.meta.url)('playwright');
const base=process.argv[2]||'http://localhost:3013';
const browser=await chromium.launch({channel:'chrome',headless:true}),errors=[];
let pin,hostToken;
async function api(path,token,body){const r=await fetch(base+'/api/territory/'+path,{method:body?'POST':'GET',headers:{...(token?{Authorization:'Bearer '+token}:{}),...(body?{'Content-Type':'application/json'}:{})},...(body?{body:JSON.stringify(body)}:{})});const j=await r.json();assert.equal(r.status,path==='rooms'?201:200,JSON.stringify(j));return j;}
const state=token=>api(`rooms/${pin}/state`,token);
const action=(token,type,extra={})=>api(`rooms/${pin}/action`,token,{type,requestId:randomUUID(),...extra});
const mysteries=MAP.filter(t=>t.kind==='mystery');
async function openLand(page,id){const tile=page.locator(`[data-land="${id}"]`);await tile.focus();await tile.press('Enter');await page.locator('dialog[open] .tile-art').waitFor();}
try{
 const teacher=await browser.newPage({viewport:{width:1440,height:950}});await teacher.goto(base+'/?battle=13&teacher=1');
 const f=teacher.frameLocator('iframe[title="Battle Thirteen: Territory Wars teacher game"]');await f.getByRole('button',{name:'Create a new room',exact:true}).click();await f.locator('.pin-large').waitFor();pin=(await f.locator('.pin-large').innerText()).trim();hostToken=await teacher.evaluate(p=>localStorage.getItem('territory-wars:host:'+p),pin);assert.equal((await state(hostToken)).mysteryRules,2);
 const phones=[];
 for(const width of [360,390]){const ctx=await browser.newContext({viewport:{width,height:844},isMobile:true,hasTouch:true});const page=await ctx.newPage();page.on('pageerror',e=>errors.push(e.message));await page.goto(base+`/battle13/index.html?join=${pin}`);await page.locator('#name').fill('TEST Mystery '+width);await page.getByRole('button',{name:'Enter the kingdom',exact:true}).click();await page.getByText('Waiting for your teacher to start.').waitFor();phones.push({page,token:await page.evaluate(p=>localStorage.getItem('territory-wars:student:'+p),pin)});}
 await f.getByRole('button',{name:'Start Game',exact:true}).click();
 // Earn Actions through normal answers/finalisation, without resource shortcuts.
 for(const q of bank.questions.slice(0,12)){for(const p of phones)await action(p.token,'student:submit',{questionId:q.id,answer:q.answer});const v=await state(hostToken);await action(hostToken,'host:finalize-all',{questionId:q.id,reviewVersion:v.reviewVersion});await action(hostToken,'host:next',{questionId:q.id});}
 const a=phones[0],b=phones[1];
 for(const p of phones){await p.page.locator('.question .eyebrow').filter({hasText:'QUESTION 13 / 25'}).waitFor();await p.page.getByRole('button',{name:'Kingdom',exact:true}).click();await p.page.locator('#map[data-ready="true"]').waitFor();}
 await openLand(a.page,mysteries[0].id);assert.equal(await a.page.getByRole('button',{name:'Claim · 1 Action',exact:true}).count(),0);await a.page.getByRole('button',{name:'Cancel',exact:true}).click();assert.equal((await state(a.token)).me.actions,12);
 await openLand(a.page,mysteries[0].id);await a.page.getByRole('button',{name:'Explore · 1 Action',exact:true}).click();await a.page.getByRole('button',{name:'Continue',exact:true}).click();
 await a.page.locator(`[data-land="${mysteries[0].id}"] .mystery-symbol`).filter({hasText:'✓'}).waitFor();assert.equal(await b.page.locator(`[data-land="${mysteries[0].id}"] .mystery-symbol`).textContent(),'?');
 await openLand(a.page,mysteries[0].id);assert.equal(await a.page.getByRole('button',{name:'Already explored by your team',exact:true}).isDisabled(),true);await a.page.getByRole('button',{name:'Cancel',exact:true}).click();
 await a.page.reload();await a.page.getByRole('button',{name:'Kingdom',exact:true}).click();await a.page.locator(`[data-land="${mysteries[0].id}"] .mystery-symbol`).filter({hasText:'✓'}).waitFor();
 console.log('PASS Explore confirmation/cancel, private explored indicator, disabled repeat and refresh persistence');
 for(const p of phones){for(const t of mysteries){const v=await state(p.token);if(v.me.explored.includes(t.id))continue;await action(p.token,'student:explore',{tileId:t.id,tileVersion:v.tiles.find(x=>x.id===t.id).version,expectedVersion:v.me.actionVersion});}const v=await state(p.token);assert.equal(v.me.explored.length,8);assert.equal(v.me.actions,4);assert.equal(v.me.territories,0);assert.ok(v.tiles.filter(t=>t.kind==='mystery').every(t=>!t.owner));}
 console.log('PASS Both teams explore all eight independently: cost 8 Actions, zero mystery land ownership');
 const owner=await (async()=>{for(const p of phones)if((await state(p.token)).me.cards.includes('shield'))return p;})();
 if(owner){
  const attacker=phones.find(p=>p!==owner),land=MAP.find(t=>t.kind==='regular');let v=await state(owner.token);await action(owner.token,'student:claim',{tileId:land.id,tileVersion:v.tiles.find(t=>t.id===land.id).version,expectedVersion:v.me.actionVersion});
  await owner.page.reload();await owner.page.getByRole('button',{name:'Cards',exact:true}).click();await owner.page.locator('.shield-card').getByRole('button',{name:'Choose a territory',exact:true}).click();await owner.page.locator(`dialog [data-tile="${land.id}"]`).click();await owner.page.getByRole('button',{name:'Place Shield · 0 Actions',exact:true}).click();await owner.page.getByRole('button',{name:'Continue',exact:true}).click();
  await owner.page.getByRole('button',{name:'Kingdom',exact:true}).click();await owner.page.locator(`[data-land="${land.id}"][data-shield="true"]`).waitFor();await attacker.page.reload();await attacker.page.getByRole('button',{name:'Kingdom',exact:true}).click();await attacker.page.locator(`[data-land="${land.id}"][data-shield="false"]`).waitFor();
  assert.equal((await state(attacker.token)).tiles.find(t=>t.id===land.id).shield,false);assert.equal((await state(hostToken)).tiles.find(t=>t.id===land.id).shield,false);
  await mkdir('outputs/battle13',{recursive:true});await owner.page.screenshot({path:'outputs/battle13/mystery-owner.png',fullPage:true});await attacker.page.screenshot({path:'outputs/battle13/mystery-opponent.png',fullPage:true});
  await openLand(attacker.page,land.id);assert.ok(!(await attacker.page.locator('dialog').innerText()).includes('Shield'));await attacker.page.getByRole('button',{name:'Capture · 2 Actions',exact:true}).click();await attacker.page.getByRole('heading',{name:'Shield blocked the capture',exact:true}).waitFor();await attacker.page.getByRole('button',{name:'Continue',exact:true}).click();
  assert.equal((await state(attacker.token)).me.actions,4);assert.equal((await state(owner.token)).tiles.find(t=>t.id===land.id).shield,false);
  console.log('PASS Cards UI places secret Shield; opponent and teacher cannot see it; attack blocked once without spending Actions');
 }else console.log('NOT EXERCISED in this random room: Shield draw (deterministic server tests cover all outcomes)');
 for(const p of phones)assert.equal(await p.page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),true);
 await action(hostToken,'host:end',{confirm:true});await a.page.getByRole('heading',{name:/Your team wins|The kingdom is settled/}).waitFor();assert.ok(a.page.url().includes('join='+pin));assert.deepEqual(errors,[]);
 console.log('PASS 360px/390px phone layouts, no browser errors, End Game preserves student page');
}finally{if(pin&&hostToken)await action(hostToken,'host:end',{confirm:true}).catch(()=>{});await browser.close();}
