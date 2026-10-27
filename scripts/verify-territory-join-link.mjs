// Isolated test rooms only; never reuse a classroom room.
import {createRequire} from 'node:module';
import assert from 'node:assert/strict';
import {randomUUID} from 'node:crypto';
const require=createRequire(import.meta.url),{chromium}=require('playwright');
const base=process.argv[2]||'http://localhost:3013';
const browser=await chromium.launch({channel:'chrome',headless:true});
const rooms=[];
try{
 const context=await browser.newContext({viewport:{width:1280,height:720},permissions:['clipboard-read','clipboard-write']});
 const page=await context.newPage();await page.goto(base+'/?battle=13&teacher=1');
 const frame=page.frameLocator('iframe[title="Battle Thirteen: Territory Wars teacher game"]');
 async function create(){await frame.getByRole('button',{name:'Create a new room',exact:true}).click();await frame.locator('.pin-large').waitFor();const pin=(await frame.locator('.pin-large').innerText()).trim();const token=await page.evaluate(pin=>localStorage.getItem('territory-wars:host:'+pin),pin);rooms.push({pin,token});return pin;}
 async function copyAndCheck(scope,pin){await scope.getByRole('button',{name:'Copy group link',exact:true}).click();await page.waitForFunction(async expected=>(await navigator.clipboard.readText())===expected,base+'/battle13/index.html?join='+pin);const link=await page.evaluate(()=>navigator.clipboard.readText());const url=new URL(link);assert.equal(url.search,'?join='+pin);return link;}
 const first=await create();const link=await copyAndCheck(frame.locator('.lobby'),first);console.log('PASS Lobby copies only the current student join URL');
 await frame.getByRole('button',{name:'Show joining QR',exact:true}).click();await copyAndCheck(frame.locator('dialog'),first);console.log('PASS Joining QR dialog also copies the same link');
 const studentContext=await browser.newContext();const student=await studentContext.newPage();await student.goto(link);await student.locator('#name').waitFor();assert.equal(await student.locator('#pin').inputValue(),first);assert.equal(await student.getByRole('button',{name:'Copy group link',exact:true}).count(),0);assert.equal(await student.getByRole('button',{name:'End Game',exact:true}).count(),0);console.log('PASS Copied link opens student joining form, without teacher controls');
 await frame.locator('dialog [data-action="close"]').click();await frame.getByRole('button',{name:'End Game',exact:true}).click();await frame.locator('dialog').getByRole('button',{name:'End Game',exact:true}).click();await frame.locator('#header').getByRole('button',{name:'New Game',exact:true}).click();const second=await create();assert.notEqual(first,second);await copyAndCheck(frame.locator('.lobby'),second);console.log('PASS New room copies its own new link');
 const child=page.frames().find(f=>f.url().includes('/battle13/'));await child.evaluate(()=>Object.defineProperty(navigator,'clipboard',{configurable:true,value:{writeText:async()=>{throw new Error('Clipboard denied for test');}}}));
 await frame.getByRole('button',{name:'Show joining QR',exact:true}).click();await frame.locator('dialog').getByRole('button',{name:'Copy group link',exact:true}).click();const input=frame.locator('#group-join-link');await input.waitFor();assert.equal(await input.inputValue(),base+'/battle13/index.html?join='+second);assert.equal(await input.evaluate(e=>e.selectionEnd-e.selectionStart), (await input.inputValue()).length);console.log('PASS Clipboard denial presents a selected read-only student link');
}finally{
 for(const {pin,token}of rooms)await fetch(base+`/api/territory/rooms/${pin}/action`,{method:'POST',headers:{'Content-Type':'application/json',Authorization:'Bearer '+token},body:JSON.stringify({type:'host:end',confirm:true,requestId:randomUUID()})}).catch(()=>{});
 await browser.close();
}
