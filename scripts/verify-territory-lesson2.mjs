// Exercise the appended questions in isolated teacher and phone sessions.
import {createRequire} from 'node:module';
import {mkdir} from 'node:fs/promises';
import assert from 'node:assert/strict';
import {randomUUID} from 'node:crypto';
import bank from '../app/battle13/sets/science-f1-ch6.json' with {type:'json'};
const require=createRequire(import.meta.url),{chromium}=require('playwright');
const base=process.argv[2]||'http://localhost:3013';
const browser=await chromium.launch({channel:'chrome',headless:true});
let pin,hostToken;
async function api(path,token,body){const r=await fetch(base+'/api/territory/'+path,{method:body?'POST':'GET',headers:{...(token?{Authorization:'Bearer '+token}:{}),...(body?{'Content-Type':'application/json'}:{})},...(body?{body:JSON.stringify(body)}:{})});const j=await r.json();assert.equal(r.status,body&&path==='rooms'?201:200,JSON.stringify(j));return j;}
const state=()=>api(`rooms/${pin}/state`,hostToken);
const action=(token,type,extra={})=>api(`rooms/${pin}/action`,token,{type,requestId:randomUUID(),...extra});
const finalize=async()=>{const v=await state();return action(hostToken,'host:finalize-all',{questionId:v.question.id,reviewVersion:v.reviewVersion});};
try{
 const teacher=await browser.newPage({viewport:{width:1400,height:1000}});
 await teacher.goto(base+'/?battle=13&teacher=1');
 const f=teacher.frameLocator('iframe[title="Battle Thirteen: Territory Wars teacher game"]');
 await f.getByRole('button',{name:'Create a new room',exact:true}).click();await f.locator('.pin-large').waitFor();
 pin=(await f.locator('.pin-large').innerText()).trim();hostToken=await teacher.evaluate(p=>localStorage.getItem('territory-wars:host:'+p),pin);
 assert.equal((await state()).questionCount,25);
 const phones=[];
 for(const width of [360,390]){
  const ctx=await browser.newContext({viewport:{width,height:844},isMobile:true,hasTouch:true});const page=await ctx.newPage();
  await page.goto(base+`/battle13/index.html?join=${pin}`);await page.locator('#name').fill('TEST Lesson 2 '+width);await page.getByRole('button',{name:'Enter the kingdom'}).click();await page.getByText('Waiting for your teacher to start.').waitFor();
  phones.push(page);
 }
 await f.getByRole('button',{name:'Start Game',exact:true}).click();
 for(let i=1;i<=20;i++){await finalize();await action(hostToken,'host:next',{questionId:'q'+String(i).padStart(2,'0')});}
 for(const q of bank.questions.slice(20)){
  for(const page of phones){
   const heading=page.locator('.question h2');await heading.filter({hasText:q.prompt.slice(0,45)}).waitFor();assert.equal(await heading.textContent(),q.prompt);
   assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),true);
   if(q.number===23){assert.equal(await heading.evaluate(e=>getComputedStyle(e).whiteSpace),'pre-line');assert.equal(await heading.evaluate(e=>getComputedStyle(e).fontSize),'20px');await mkdir('outputs/battle13',{recursive:true});await page.screenshot({path:`outputs/battle13/lesson2-q23-${page.viewportSize().width}.png`,fullPage:true});}
   if(q.type==='mcq')await page.getByRole('button',{name:q.answer+' '+q.options[q.answer],exact:true}).click();else await page.locator('#answer').fill(q.answer);
   await page.getByRole('button',{name:'Submit answer',exact:true}).click();await page.getByText('Submitted · automatic ACCEPT suggestion').waitFor();
  }
  await f.locator('.question h2').filter({hasText:q.prompt.slice(0,45)}).waitFor();assert.equal(await f.locator('.question h2').textContent(),q.prompt);
  const review=await api(`rooms/${pin}/review`,hostToken);assert.ok(JSON.stringify(review).includes(q.answer));
  await finalize();
  console.log('PASS Q'+q.number+' exact prompt, correct answer accepted on 360px/390px phones and finalized');
  if(q.number<25)await action(hostToken,'host:next',{questionId:q.id});
 }
 await f.getByText('All 25 questions complete.',{exact:false}).waitFor();assert.equal(await f.getByRole('button',{name:'Next Question →',exact:true}).count(),0);
 const v=await state();for(const p of v.players)assert.equal(p.science,5);
 await action(hostToken,'host:end',{confirm:true});await phones[0].getByRole('heading',{name:/Your team wins|The kingdom is settled/}).waitFor();assert.ok(phones[0].url().includes('join='+pin));
 console.log('PASS Final round ends at Q25, each student earned exactly 5 points, End Game keeps student results');
}finally{if(pin&&hostToken)await action(hostToken,'host:end',{confirm:true}).catch(()=>{});await browser.close();}
