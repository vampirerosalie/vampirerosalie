// Local visual/interaction simulation. Uses the real game engine, never a classroom room.
import {createServer} from 'node:http';
import {createRequire} from 'node:module';
import {readFile,mkdir,writeFile} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
import {resolve,extname,sep} from 'node:path';
import {randomUUID} from 'node:crypto';
import assert from 'node:assert/strict';
import {TerritoryGame} from '../app/battle13/game.js';
import {setList} from '../app/battle13/sets.js';
const require=createRequire(import.meta.url),{chromium}=require('playwright');
const root=resolve(fileURLToPath(new URL('../public/',import.meta.url))),out=new URL('../outputs/battle13/royal-phone/',import.meta.url);
await mkdir(out,{recursive:true});
const game=new TerritoryGame(),room=game.create(),pin=room.pin;
game.join(pin,{clientId:randomUUID(),name:'TEST Crimson Owls'});
const mime={'.html':'text/html','.js':'text/javascript','.css':'text/css','.png':'image/png','.webp':'image/webp'};
const server=createServer(async(req,res)=>{
  try{
    const url=new URL(req.url,'http://localhost');let body='';for await(const chunk of req)body+=chunk;
    if(url.pathname.startsWith('/api/territory/')){
      const path=url.pathname.slice('/api/territory/'.length),token=req.headers.authorization?.slice(7);let data;
      if(path==='sets')data={sets:setList()};
      else{const m=path.match(/^rooms\/(\d{5})\/(state|join|action)$/);if(!m)throw Error('Unexpected test route '+path);
        if(m[2]==='state')data=game.state(m[1],token);
        if(m[2]==='join')data=game.join(m[1],JSON.parse(body));
        if(m[2]==='action')data=game.action(m[1],token,JSON.parse(body));}
      res.setHeader('Content-Type','application/json');res.end(JSON.stringify(data));return;
    }
    const path=resolve(root,'.'+decodeURIComponent(url.pathname)+(url.pathname.endsWith('/')?'index.html':''));
    if(!path.startsWith(root+sep))throw Error('Invalid asset path');
    res.setHeader('Content-Type',mime[extname(path)]||'application/octet-stream');res.end(await readFile(path));
  }catch(e){res.statusCode=e.status||404;res.setHeader('Content-Type','application/json');res.end(JSON.stringify({error:e.message}));}
});
await new Promise(r=>server.listen(0,'127.0.0.1',r));const base='http://127.0.0.1:'+server.address().port;
const browser=await chromium.launch({channel:'chrome',headless:true,args:['--enable-unsafe-swiftshader']});
const checks=[],errors=[];
const act=(type,extra={})=>game.action(pin,room.hostToken,{type,requestId:randomUUID(),...extra});
let page;
async function shot(name){
  await page.evaluate(async()=>{await document.fonts.ready;await Promise.all([...document.images].map(i=>i.decode()));});
  assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false,name+' horizontal overflow');
  await page.screenshot({path:fileURLToPath(new URL(name+'.png',out)),fullPage:true});
  checks.push(name);console.log('PASS '+name);
}
try{
  const context=await browser.newContext({viewport:{width:390,height:844},isMobile:true,hasTouch:true,deviceScaleFactor:1});
  page=await context.newPage();page.on('pageerror',e=>errors.push(e.message));
  await page.goto(base+'/battle13/?join='+pin);await page.locator('#name').waitFor();await shot('01-join-390');
  await page.locator('#name').fill('TEST Azure Falcons');await page.getByRole('button',{name:'Enter the kingdom',exact:true}).click();
  await page.getByText('Waiting for your teacher to start.',{exact:true}).waitFor();await shot('02-waiting-390');
  act('host:start');await page.locator('.option').first().waitFor();await shot('03-question-390');
  await page.setViewportSize({width:360,height:800});await shot('04-question-360');
  await page.locator('[data-letter="C"]').click();assert.equal(await page.locator('[data-letter="C"]').getAttribute('aria-pressed'),'true');
  await page.getByRole('button',{name:'Cards',exact:true}).click();await shot('05-cards-empty-360');
  await page.getByRole('button',{name:'Question',exact:true}).click();assert.equal(await page.locator('[data-letter="C"]').getAttribute('aria-pressed'),'true');
  await page.getByRole('button',{name:'Submit answer',exact:true}).click();await page.locator('.answer-status').waitFor();await shot('06-submitted-360');
  const v=game.state(pin,room.hostToken);act('host:finalize-all',{questionId:'q01',reviewVersion:v.reviewVersion});
  await page.getByText('Accepted · 1 Science point and 1 Action earned',{exact:true}).waitFor();
  // Visual fixtures for owned cards and later typed questions exist only in this test process.
  const r=game.room(pin),player=r.players.find(p=>p.name==='TEST Azure Falcons');player.cards=['shield','rebellion'];r.version++;
  await page.reload();await page.locator('.answer-status').waitFor();await page.getByRole('button',{name:'Cards',exact:true}).click();await shot('07-cards-held-360');
  await page.locator('[data-card="shield"][data-action="card-target"]').click();await page.locator('dialog[open] .territory-list').waitFor();await shot('08-card-targets-360');
  await page.locator('dialog [data-action="close"]').first().click();
  await page.getByRole('button',{name:'Kingdom',exact:true}).click();await page.getByRole('button',{name:'Choose territory',exact:true}).click();
  await page.locator('dialog [data-action="pick-tile"]').filter({hasText:'Unclaimed'}).first().click();await shot('09-territory-popup-360');
  await page.locator('dialog [data-action="tile-action"]').filter({hasText:/^Claim/}).click();await page.getByRole('button',{name:'Continue',exact:true}).waitFor();await shot('10-outcome-360');
  await page.getByRole('button',{name:'Continue',exact:true}).click();
  r.questionIndex=12;r.version++;await page.reload();await page.locator('#answer').waitFor();
  await page.setViewportSize({width:390,height:844});await page.locator('#answer').fill('Positive charge');await shot('11-short-answer-390');
  await page.getByRole('button',{name:'Cards',exact:true}).click();await page.getByRole('button',{name:'Question',exact:true}).click();assert.equal(await page.locator('#answer').inputValue(),'Positive charge');
  await page.reload();await page.locator('#answer').waitFor();assert.equal(await page.locator('#answer').inputValue(),'Positive charge');
  await page.setViewportSize({width:390,height:500});await page.locator('#answer').focus();await page.getByRole('button',{name:'Submit answer',exact:true}).scrollIntoViewIfNeeded();await shot('12-short-viewport');
  const box=await page.getByRole('button',{name:'Submit answer',exact:true}).boundingBox(),nav=await page.locator('#nav').boundingBox();assert.ok(box.y+box.height<=nav.y,'Submit remains reachable above fixed navigation');
  await page.setViewportSize({width:390,height:844});await page.getByRole('button',{name:'Standings',exact:true}).click();await shot('13-standings-390');
  act('host:end',{confirm:true});await page.getByRole('heading',{name:/Your team wins|The kingdom is settled/}).waitFor();await page.evaluate(()=>scrollTo(0,0));await shot('14-results-390');
  const illustration=await page.locator('.victory-panel .small-art').boundingBox(),title=await page.locator('.victory-panel h2').boundingBox();assert.ok(illustration.y+illustration.height<=title.y,'Result illustration must not overlap the title');
  assert.equal(await page.locator('[data-action="end"],[data-action="create"]').count(),0);
  assert.deepEqual(errors,[]);checks.push('Drafts, selection, submit, targeting, rewards and student-only results remain functional');
}finally{await writeFile(new URL('report.json',out),JSON.stringify({simulation:true,checks,errors},null,2));await browser.close();server.close();}
