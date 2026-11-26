import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {createRequire} from 'node:module';
import {QUESTIONS} from '../app/battle14/questions.js';

// Exercise the production browser files with a deterministic room clock. The
// classroom and load scripts separately verify the actual Worker connection.
const {chromium} = createRequire(import.meta.url)('playwright');
const origin = 'http://paintball.test';
const pin = '14321';
const recent = [];
const errors = [];
let socket, connections = 0;
const team = {id:'team-1',name:'Blue',color:'#236fca',online:true,controllerOnline:true};
const rival = {id:'team-2',name:'Red',color:'#d64545',online:true,controllerOnline:true};
const {id,number,type,prompt,options} = QUESTIONS[19];
const state = {pin,role:'team',teamId:team.id,canControl:true,phase:'quiz',round:4,serverTime:Date.now(),
  teams:[team,rival],onlineCount:2,completedRounds:3,questionCount:20,question:{id,number,type,prompt,options}};
const frame = {round:4,remainingMs:44000,paused:false,finished:false,
  players:[{id:team.id,x:0,z:2,yaw:0,ammo:12,score:8,hitIds:[]},
    {id:rival.id,x:2,z:-3,yaw:1,ammo:9,score:7,hitIds:[]}],drones:[],pickups:[],events:[]};
const send = message => socket.send(JSON.stringify(message));
function sendState() {send({type:'state',serverTime:Date.now(),state});}
function sendFrame() {send({type:'arena',serverTime:Date.now(),frame});}

const browser = await chromium.launch({channel:process.env.PAINTBALL_BROWSER||'chrome',
  args:['--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader']});
try {
  const portrait = {width:375,height:667};
  const landscape = {width:667,height:375};
  const page = await browser.newPage({viewport:portrait,hasTouch:true,isMobile:true});
  page.on('pageerror',error => errors.push(error.message));
  await page.route(origin+'/**',async route => {
    const filename = new URL(route.request().url()).pathname.split('/').pop();
    const allowed = {
      'index.html':'text/html','app.js':'text/javascript','connection.js':'text/javascript','music.js':'text/javascript','arena-wire.js':'text/javascript',
      'arena-view.js':'text/javascript','style.css':'text/css','arena.css':'text/css','orientation.css':'text/css',
      'arena-poster.webp':'image/webp',
    };
    if (!Object.hasOwn(allowed,filename)) return route.fulfill({status:404});
    return route.fulfill({contentType:allowed[filename],body:await readFile(new URL('../public/battle14/'+filename,import.meta.url))});
  });
  await page.routeWebSocket('**/socket',ws => {
    socket=ws;
    ws.onMessage(raw => {
      const m=JSON.parse(raw);
      if (m.type==='auth') {connections++;sendState();}
      else if (m.type==='action') {
        if (m.action.type==='student:submit') {
          state.ownAnswer=m.action.answer;
          sendState();
        }
        send({type:'ack',id:m.id});
      } else if (m.type==='input') {
        recent.push(m);
        if (m.fire) {frame.players[0].ammo--;sendFrame();}
      }
    });
  });
  await page.addInitScript(pin => localStorage.setItem('paintball:team:'+pin,'orientation-fixture'),pin);
  await page.goto(origin+'/battle14/index.html?join='+pin);
  await page.locator('[data-choice="A"]').click();
  const cdp=await page.context().newCDPSession(page);
  async function orient(size,notched=false) {
    await cdp.send('Emulation.setSafeAreaInsetsOverride',{insets:notched?{top:0,left:44,right:28,bottom:16}:{top:0,left:0,right:0,bottom:0}});
    await page.setViewportSize(size);
    await page.waitForFunction(expected => matchMedia('(orientation: landscape)').matches===expected,size.width>size.height);
  }
  const rect = async selector => {
    const box=await page.locator(selector).boundingBox();
    assert.ok(box,selector+' must be visible');
    return box;
  };
  await orient(landscape,true);
  const title=await rect('.question-sheet h1'), choices=await rect('.question-sheet .options');
  assert.ok(title.x+title.width<=choices.x,'Landscape question and answers must have distinct columns');
  for (const selector of ['.question-sheet h1','[data-choice="A"]','[data-choice="B"]','[data-choice="C"]','[data-choice="D"]','[data-act="submit"]']) {
    const b=await rect(selector);
    assert.ok(b.x>=43&&b.x+b.width<=landscape.width-27,selector+' clears landscape display cutouts');
    assert.ok(b.y>=0&&b.y+b.height<=landscape.height-15,selector+' is visible without scrolling');
  }
  assert.equal(await page.locator('[data-choice="A"]').getAttribute('aria-pressed'),'true');
  await page.getByRole('button',{name:'Submit answer'}).click();
  await page.getByText('Submitted · A',{exact:true}).waitFor();
  await orient(portrait);
  assert.equal(await page.locator('[data-choice="A"]').getAttribute('aria-pressed'),'true');
  state.phase='shootout';delete state.question;
  sendState();sendFrame();
  await page.waitForSelector('.pb-world[data-players="2"]');
  await page.evaluate(()=>{window.orientationWorld=document.querySelector('.pb-world');});
  const touch=(type,touchPoints)=>cdp.send('Input.dispatchTouchEvent',{type,touchPoints});
  async function pressBoth() {
    const move=await rect('.pb-move'), fire=await rect('.pb-fire');
    const left={id:1,x:move.x+move.width/2,y:move.y+move.height/2};
    const right={id:2,x:fire.x+fire.width/2,y:fire.y+fire.height/2};
    await touch('touchStart',[left]);
    await touch('touchStart',[left,right]);
    left.x+=20;right.x+=18;right.y-=10;
    await touch('touchMove',[left,right]);
    return {left,right};
  }
  await pressBoth();
  await page.waitForTimeout(140);
  await orient(landscape,true);
  await page.waitForFunction(()=>!document.querySelector('.pb-fire').classList.contains('pressed'));
  await touch('touchEnd',[]);
  const shotsAfterTurn=recent.filter(m=>m.fire).length;
  await page.waitForTimeout(580);
  assert.equal(recent.filter(m=>m.fire).length,shotsAfterTurn,'Rotating must release held fire');
  assert.ok(!recent.length||!recent.at(-1).dx&&!recent.at(-1).dz,'Rotating must release held movement');
  const move=await rect('.pb-move'), fire=await rect('.pb-fire'), hud=await rect('.pb-ammo'), clock=await rect('.pb-clock');
  assert.ok(move.x>=44 && hud.x>=44 && fire.x+fire.width<=landscape.width-28 && clock.x+clock.width<=landscape.width-28);
  assert.ok(move.y+move.height<=landscape.height-16 && fire.y+fire.height<=landscape.height-16);
  assert.ok(move.width>=60&&fire.width>=60&&move.x+move.width<fire.x);
  const geometry=await page.evaluate(()=>{
    window.scrollTo(0,80);
    const r=document.querySelector('.pb-world').getBoundingClientRect();
    return {scroll:scrollY,scrollHeight:document.documentElement.scrollHeight,height:innerHeight,
      arenaHeight:Math.round(r.height),width:innerWidth,arenaWidth:Math.round(r.width),same:document.querySelector('.pb-world')===window.orientationWorld};
  });
  assert.equal(geometry.scroll,0);assert.equal(geometry.scrollHeight,geometry.height);assert.equal(geometry.arenaHeight,geometry.height);assert.equal(geometry.arenaWidth,geometry.width);assert.ok(geometry.same);
  recent.length=0;
  const {left}=await pressBoth();
  await page.waitForTimeout(190);
  await touch('touchEnd',[left]);
  await page.waitForTimeout(150);
  await touch('touchEnd',[]);
  assert.ok(recent.some(m=>m.dx>.2&&m.yaw>.2&&m.fire),'Landscape two-thumb movement, aiming and firing');
  const expected=frame.players[0].ammo+' paintballs';
  await page.getByText(expected,{exact:true}).waitFor();
  await orient(portrait);
  await page.getByText(expected,{exact:true}).waitFor();
  assert.ok(await page.evaluate(()=>document.querySelector('.pb-world')===window.orientationWorld));
  assert.equal(connections,1,'Rotating keeps the same room connection');
  assert.deepEqual(errors,[]);
  console.log('Phone rotation verified: quiz selection and submission, safe areas, full-height arena, two-thumb control, released held input, retained ammo and room.');
} finally {
  await browser.close();
}
