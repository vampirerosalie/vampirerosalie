import { createRequire } from 'node:module';
import { readFile, mkdir } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { strict as assert } from 'node:assert';

const require=createRequire(import.meta.url);
const { chromium }=require('playwright');
const out=fileURLToPath(new URL('../outputs/battle14/',import.meta.url));
await mkdir(out,{recursive:true});
const browser=await chromium.launch({channel:process.env.PAINTBALL_BROWSER||'chrome',args:['--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader']});
try {
  const page=await browser.newPage({viewport:{width:1140,height:720},hasTouch:true});
  const errors=[];
  page.on('pageerror',e=>errors.push(e.message));
  await page.route('http://paintball.local/**',async route=>{
    const path=new URL(route.request().url()).pathname.slice(1);
    if(!['arena.css','arena-view.js'].includes(path)){
      await route.fulfill({contentType:'text/html',body:'<meta name="viewport" content="width=device-width, initial-scale=1"><link rel="stylesheet" href="/arena.css"><style>*{box-sizing:border-box}body{margin:0}#arena{width:100vw;height:100dvh}</style><main id="arena"></main>'});
      return;
    }
    const body=await readFile(new URL('../public/battle14/'+path,import.meta.url));
    await route.fulfill({body,contentType:path.endsWith('css')?'text/css':'text/javascript'});
  });
  await page.goto('http://paintball.local/');
  await page.evaluate(async()=>{
    const { mountArena }=await import('/arena-view.js');
    window.testArena=mountArena(document.querySelector('#arena'),{});
    window.mount=mountArena;
  });
  await page.waitForTimeout(650);
  const mode=await page.locator('.pb-world').getAttribute('data-renderer');
  assert.notEqual(mode,'overhead','WebGL did not initialize');
  await page.screenshot({path:out+'/toybox-arena.png'});
  await page.setViewportSize({width:393,height:690});
  await page.evaluate(()=>{
    window.testArena.destroy();
    const teams=[{id:'red',name:'Red Rockets',color:'#f74b50'},{id:'blue',name:'Blue Comets',color:'#167add'}];
    window.controlInputs=[];
    window.testArena=window.mount(document.querySelector('#arena'),{teamId:'red',teams,canControl:true,onInput:input=>window.controlInputs.push(input)});
    window.testFrame={round:1,remainingMs:54000,players:[
      {id:'red',x:0,z:2,yaw:0,ammo:9,score:3,hitIds:['blue']},
      {id:'blue',x:1.2,z:-.9,yaw:1.32,ammo:8,score:0,hitIds:[]}
    ],drones:[{id:'drone',x:-2,z:-.5}],pickups:[{id:'ammo',kind:'ammo',x:2,z:2}],events:[]};
    window.testArena.update(window.testFrame);
  });
  await page.waitForSelector('.pb-world[data-players="2"]');
  await page.screenshot({path:out+'/toybox-phone.png'});
  assert.match(await page.locator('.pb-label').allTextContents().then(v=>v.join(' ')),/✓ Blue Comets/);
  assert.match(await page.locator('.pb-ammo').textContent(),/9 paintballs/);
  const session=await page.context().newCDPSession(page);
  const move=await page.locator('.pb-move').boundingBox(), fire=await page.locator('.pb-fire').boundingBox();
  const left={x:move.x+move.width*.5,y:move.y+move.height*.5,id:1};
  const right={x:fire.x+fire.width*.5,y:fire.y+fire.height*.5,id:2};
  const touch=(type,touchPoints)=>session.send('Input.dispatchTouchEvent',{type,touchPoints});
  await touch('touchStart',[left]);await touch('touchStart',[left,right]);
  left.x+=22;right.x+=25;right.y-=12;
  await touch('touchMove',[left,right]);await page.waitForFunction(()=>window.controlInputs.some(i=>i.dx>.2 && i.fire && i.yaw>.2));
  await touch('touchEnd',[left]);await page.waitForTimeout(180);await touch('touchEnd',[]);
  const inputs=await page.evaluate(()=>window.controlInputs);
  assert.ok(inputs.some(i=>i.dx>.2 && i.fire && i.yaw>.2),'Two-finger aiming, movement and firing: '+JSON.stringify(inputs));
  await page.evaluate(()=>window.testArena.update({...window.testFrame,paused:true}));
  assert.equal(await page.getByRole('button',{name:/Fire paintball/}).isDisabled(),true);
  assert.match(await page.locator('.pb-arena-status').textContent(),/paused/);
  await page.evaluate(()=>{
    window.testFrame.players[0].ammo=0;
    window.testArena.update(window.testFrame);
    window.controlInputs.length=0;
  });
  await touch('touchStart',[left]);await touch('touchMove',[{...left,y:left.y-20}]);
  await page.waitForFunction(()=>window.controlInputs.some(i=>Math.hypot(i.dx,i.dz)>.2));
  await touch('touchEnd',[]);
  assert.match(await page.locator('.pb-ammo').textContent(),/0 paintballs/);
  assert.deepEqual(errors,[]);
  console.log('WebGL arena, phone HUD, target checkmarks and simultaneous two-thumb input passed (393 × 690).');
} finally {await browser.close();}

