import { createRequire } from 'node:module';
import { readFile, mkdir } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { strict as assert } from 'node:assert';
import { createArena, inputArena, frameArena } from '../app/battle14/arena.js';

const require=createRequire(import.meta.url);
const { chromium }=require('playwright');
const out=fileURLToPath(new URL('../outputs/battle14/',import.meta.url));
await mkdir(out,{recursive:true});
const browser=await chromium.launch({channel:process.env.PAINTBALL_BROWSER||'chrome',args:['--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader']});
try {
  const page=await browser.newPage({viewport:{width:1140,height:720},hasTouch:true});
  const errors=[];
  page.on('pageerror',e=>errors.push(e.message));
  // Three's inspector reports the actual scene. Read the transforms committed
  // to its instanced meshes instead of assuming a sent yaw turned the avatar.
  await page.addInitScript(()=>{
    window.__THREE_DEVTOOLS__=new EventTarget();
    window.__THREE_DEVTOOLS__.addEventListener('observe',({detail})=>{
      if(detail.isScene)window.arenaScene=detail;
    });
    window.renderedHeading=()=>{
      const player=window.testFrame.players[0];
      const result={};
      for(const mesh of window.arenaScene.children){
        if(!mesh.isInstancedMesh||mesh.castShadow||!mesh.instanceColor)continue;
        const color=mesh.material.color.clone();
        const body=color.clone().set('#f74b50'),reticle=color.clone().set('#ff9715');
        const same=target=>Math.abs(color.r-target.r)+Math.abs(color.g-target.g)+Math.abs(color.b-target.b)<.0001;
        for(let i=0;i<mesh.count;i++){
          const offset=16*i, values=mesh.instanceMatrix.array;
          const x=values[offset+12]-player.x, y=values[offset+13], z=values[offset+14]-player.z;
          mesh.getColorAt(i,color);
          if(same(body)&&y>.5&&y<1.2&&Math.hypot(x,z)<.015){
            // The robot's face points along the model's local negative-Z axis.
            result.robot=Math.atan2(-values[offset+8],values[offset+10]);
          }
          if(same(reticle)&&mesh.geometry.type==='TorusGeometry'&&Math.hypot(x,z)>1){
            result.reticle=Math.atan2(x,-z);
          }
        }
      }
      return result;
    };
  });
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
    const teams=window.testTeams=[{id:'red',name:'Red Rockets',color:'#f74b50'},{id:'blue',name:'Blue Comets',color:'#167add'}];
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
  async function center(selector,id){
    const b=await page.locator(selector).boundingBox();
    assert.ok(b,selector+' is available');
    return {x:b.x+b.width/2,y:b.y+b.height/2,id};
  }
  const left=await center('.pb-move',1),right=await center('.pb-fire',2);
  const touch=(type,touchPoints)=>session.send('Input.dispatchTouchEvent',{type,touchPoints});
  const sampled=()=>page.evaluate(()=>window.controlInputs.length);
  const east=Math.PI/2,west=-Math.PI/2,south=Math.PI;
  async function expectInput(since,x,z,yaw,fire){
    const handle=await page.waitForFunction(({since,x,z,yaw,fire})=>{
      return window.controlInputs.slice(since).find(input=>{
        const speed=Math.hypot(input.dx,input.dz);
        const movement=x===0&&z===0?speed<.02:speed>.3&&(input.dx*x+input.dz*z)/(speed*Math.hypot(x,z))>.97;
        return movement&&Math.cos(input.yaw-yaw)>.99&&(fire===undefined||input.fire===fire);
      });
    },{since,x,z,yaw,fire},{polling:40,timeout:6500}).catch(async error=>{
      const recent=await page.evaluate(index=>window.controlInputs.slice(index).slice(-8),since);
      throw new Error('Expected input '+JSON.stringify({x,z,yaw,fire})+'; recent samples '+JSON.stringify(recent),{cause:error});
    });
    return handle.jsonValue();
  }
  async function expectRendered(yaw,withReticle=true){
    try{
      await page.waitForFunction(({yaw,withReticle})=>{
        const angles=window.renderedHeading();
        return Math.cos(angles.robot-yaw)>.985&&(!withReticle||Math.cos(angles.reticle-yaw)>.985);
      },{yaw,withReticle},{polling:40,timeout:6500});
    }catch(error){
      throw new Error('Expected rendered yaw '+yaw+'; observed '+JSON.stringify(await page.evaluate(()=>window.renderedHeading())),{cause:error});
    }
  }
  // Keep the server fixture facing north throughout: these turn checks must
  // respond locally before any authoritative movement echo arrives.
  let since=await sampled();
  const walkEast={...left,x:left.x+23},walkSouth={...left,y:left.y+23};
  await touch('touchStart',[left]);await touch('touchMove',[walkEast]);
  await expectInput(since,1,0,east,false);await expectRendered(east);

  // Hold FIRE without aiming: changing the stick should also change shot direction.
  await touch('touchStart',[walkEast,right]);
  since=await sampled();
  await touch('touchMove',[walkSouth,right]);
  await expectInput(since,0,1,south,true);await expectRendered(south);
  // Deliberately aim west while continuing to walk south.
  since=await sampled();
  const aimWest={...right,x:right.x-24};
  await touch('touchMove',[walkSouth,aimWest]);
  await expectInput(since,0,1,west,true);await expectRendered(west);
  await touch('touchEnd',[]);
  await expectInput(since,0,0,west);await expectRendered(west);

  await page.setViewportSize({width:690,height:393});
  await page.waitForFunction(()=>matchMedia('(orientation: landscape)').matches);
  const horizontalLeft=await center('.pb-move',1),horizontalRight=await center('.pb-fire',2);
  const walkRight={...horizontalLeft,x:horizontalLeft.x+24};
  since=await sampled();
  await touch('touchStart',[horizontalLeft]);await touch('touchMove',[walkRight]);
  await expectInput(since,1,0,east,false);
  // A quick aimed release fires west; the still-held movement stick subsequently
  // resumes facing east. Release only the right-thumb contact.
  since=await sampled();
  await touch('touchStart',[walkRight,horizontalRight]);
  await touch('touchMove',[walkRight,{...horizontalRight,x:horizontalRight.x-24}]);
  await touch('touchEnd',[{...horizontalRight,x:horizontalRight.x-24}]);
  await expectInput(since,1,0,west,true);
  await expectInput(since,1,0,east,false);await expectRendered(east);
  await touch('touchEnd',[]);

  for(const [key,x,z,yaw] of [['a',-1,0,west],['w',0,-1,0],['s',0,1,south],['d',1,0,east]]){
    since=await sampled();
    await page.keyboard.down(key);
    await expectInput(since,x,z,yaw,false);await expectRendered(yaw);
    await page.keyboard.up(key);
    await expectInput(since,0,0,yaw);
  }
  // Aim once, stop, then tap to fire again. Both the avatar and shot retain
  // the selected heading while the robot is stationary.
  const northwest=-Math.PI/4;
  since=await sampled();
  await touch('touchStart',[horizontalRight]);
  await touch('touchMove',[{...horizontalRight,x:horizontalRight.x-22,y:horizontalRight.y-22}]);
  await touch('touchEnd',[]);
  await expectInput(since,0,0,northwest,true);await expectRendered(northwest);
  since=await sampled();
  await touch('touchStart',[horizontalRight]);await touch('touchEnd',[]);
  const stationaryShot=await expectInput(since,0,0,northwest,true);
  await page.evaluate(()=>window.testArena.update({...window.testFrame,paused:true}));
  assert.equal(await page.getByRole('button',{name:/Fire paintball/}).isDisabled(),true);
  assert.match(await page.locator('.pb-arena-status').textContent(),/paused/);
  await page.evaluate(()=>{
    window.testFrame.players[0].ammo=0;
    window.testArena.update(window.testFrame);
    window.controlInputs.length=0;
  });
  await touch('touchStart',[horizontalLeft]);await touch('touchMove',[{...horizontalLeft,y:horizontalLeft.y-20}]);
  await page.waitForFunction(()=>window.controlInputs.some(i=>Math.hypot(i.dx,i.dz)>.2));
  await touch('touchEnd',[]);
  assert.match(await page.locator('.pb-ammo').textContent(),/0 paintballs/);
  // Use the real authoritative engine for the outgoing packet, then display
  // that frame from a teammate's read-only viewpoint.
  const arena=createArena({round:1,teams:[{id:'red',ammo:5},{id:'blue',ammo:5}],now:1000,seed:42});
  assert.equal(inputArena(arena,'red',{...stationaryShot,seq:1},1100),true);
  const snapshot=frameArena(arena);
  assert.equal(snapshot.players[0].ammo,4);
  const shot=snapshot.events.find(e=>e.kind==='shot');
  assert.ok(shot,'The authoritative simulation fired the paintball');
  assert.ok(Math.cos(Math.atan2(shot.endX-shot.x,shot.z-shot.endZ)-northwest)>.98,'Authoritative projectile follows the aimed direction');
  await page.evaluate(frame=>{
    window.testArena.destroy();
    window.testFrame=frame;
    window.testArena=window.mount(document.querySelector('#arena'),{teamId:'red',teams:window.testTeams,canControl:false});
    window.testArena.update(frame);
  },snapshot);
  assert.equal(await page.locator('.pb-move').count(),0);
  await expectRendered(northwest,false);
  assert.deepEqual(errors,[]);
  console.log('Passed: portrait and landscape touch, WASD, independent aiming, release shots, stationary heading, actual WebGL robot and reticle, authoritative projectile and teammate view.');
} finally {await browser.close();}

