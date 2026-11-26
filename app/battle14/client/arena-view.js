import * as THREE from 'three';
import { ToyParts, buildStadium, robot, toys, pickupBadge } from './toybox.js';
import { mountControls } from './controls.js';
import { paintCourt } from './court.js';
import { OBSTACLES, DRONE_SPOTS, PICKUP_SPOTS } from '../../../public/battle14/layout.js';

const colors=['#2477f3','#f54755','#ffbb24','#21b98d','#9b55dc','#ff8443','#e95baf','#21b9de','#718bea','#8aa626','#b16a43','#618098'];
const empty={round:0,paused:false,finished:false,remainingMs:60000,players:[],drones:[],pickups:[],events:[]};
const preview={...empty,players:[
  [-5,1.2,.82],[1,1.6,-.8],[3.15,-3.3,-2.1],[-2.4,-4.2,2.5],[-2,5.8,.4],[7.3,4.1,-.8]
].map(([x,z,yaw],i)=>({id:'demo'+i,x,z,yaw,ammo:5,score:0,hitIds:[]})),
drones:DRONE_SPOTS.filter((_,i)=>i%2===0).map((p,i)=>({...p,id:'d'+i})),
pickups:['ammo','freeze','steal'].map((kind,i)=>({...PICKUP_SPOTS[i],kind,id:kind}))};
const powerText={steal:'Steal Shot',freeze:'Freeze Shot',shield:'Shield',ammo:'+2 paintballs'};
const reduced=()=>window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const viewedYaw=(current,target,alpha)=>current+Math.atan2(Math.sin(target-current),Math.cos(target-current))*alpha;
const colorFor=(t,i)=>typeof t?.color==='string' && /^#[0-9a-f]{3,8}$/i.test(t.color)?t.color:colors[i%colors.length];
function element(parent,tag,cls,text) {
  const result=document.createElement(tag);result.className=cls;
  if(text!==undefined) result.textContent=text;
  parent.append(result);return result;
}
function renderer3D(host) {
  const renderer=new THREE.WebGLRenderer({antialias:true,alpha:false,powerPreference:'low-power'});
  renderer.setPixelRatio(Math.min(devicePixelRatio||1,1.6));
  renderer.shadowMap.enabled=true;renderer.shadowMap.type=THREE.PCFShadowMap;
  renderer.shadowMap.autoUpdate=false;renderer.shadowMap.needsUpdate=true;
  renderer.outputColorSpace=THREE.SRGBColorSpace;
  renderer.setClearColor('#79d7ff');
  const scene=new THREE.Scene();
  scene.fog=new THREE.Fog('#8bd8ef',40,92);
  scene.add(new THREE.HemisphereLight('#e7f5ff','#929fcc',1.48));
  const sun=new THREE.DirectionalLight('#fff3dc',2.35);
  sun.position.set(-9,19,9);sun.castShadow=true;
  Object.assign(sun.shadow.camera,{left:-19,right:19,top:19,bottom:-19,near:.5,far:58});
  sun.shadow.mapSize.set(1024,1024);sun.shadow.bias=-.0009;sun.shadow.normalBias=.035;
  scene.add(sun);
  const scenery=new ToyParts(scene),actors=new ToyParts(scene);
  const decals=buildStadium(scene,scenery);
  const camera=new THREE.PerspectiveCamera(43,1,.08,125);
  const position=new THREE.Vector3(),target=new THREE.Vector3();
  const destination=new THREE.Vector3(),look=new THREE.Vector3();
  const projected=new THREE.Vector3(),raycaster=new THREE.Raycaster();
  const floor=new THREE.Plane(new THREE.Vector3(0,1,0),0);
  const markers=new Map();
  const badges=new Map(), badgeMaterials=new Map();
  let width=0,height=0,first=true,aspect=1;
  host.prepend(renderer.domElement);
  function resize(w,h) {
    if(w===width&&h===height)return;
    width=w;height=h;aspect=w/Math.max(1,h);
    renderer.setSize(w,h,false);camera.aspect=aspect;camera.updateProjectionMatrix();first=true;
  }
  function label(key,text,x,y,z,color,cls='') {
    let el=markers.get(key);
    if(!el) {el=element(host,'span','pb-label '+cls);markers.set(key,el);}
    projected.set(x,y,z).project(camera);
    el.hidden=projected.z<0||projected.z>=1||Math.abs(projected.x)>.97||Math.abs(projected.y)>.91;
    if(el.hidden)return;
    if(el.textContent!==text)el.textContent=text;
    el.style.setProperty('--team',color);
    el.style.left=(projected.x*.5+.5)*100+'%';el.style.top=(-projected.y*.5+.5)*100+'%';
  }
  function draw(s) {
    const {frame,players,me,dt,t,demo,focus,info,getColor,fx,controls}=s;
    if(me && focus){
      const portrait=aspect<.85;
      const x=THREE.MathUtils.clamp(me.x,-8.25,8.25);
      const z=THREE.MathUtils.clamp(me.z-.45,-6.65,8.45);
      // At an edge, frame the playable lanes ahead while keeping the robot visible.
      destination.set(x,portrait?12.7:8.9,z+(portrait?8.7:6.9));
      look.set(x,0,z);
    }else{
      const scale=demo?Math.max(1,1.2/aspect):Math.max(1,1.29/aspect);
      if(demo){destination.set(11.1*scale,16.1*scale,18.4*scale);look.set(0,.45,-.8);}
      else {destination.set(0,28.1*scale,16.5*scale);look.set(0,.05,.2);}
    }
    if(first){position.copy(destination);target.copy(look);first=false;}
    const ease=1-Math.exp(-7*dt);
    position.lerp(destination,ease);target.lerp(look,ease);camera.position.copy(position);camera.lookAt(target);camera.updateMatrixWorld();
    players.forEach((p,i)=>robot(actors,p,getColor(p.id,i),p.motion||0,t,p.id===me?.id&&focus));
    toys(actors,frame,t);
    for(const item of frame.pickups){
      let sprite=badges.get(item.id);
      if(!badgeMaterials.has(item.kind))badgeMaterials.set(item.kind,pickupBadge(item.kind));
      if(!sprite){
        sprite=new THREE.Sprite(badgeMaterials.get(item.kind));
        sprite.scale.set(.62,.62,1);scene.add(sprite);badges.set(item.id,sprite);
      }
      sprite.material=badgeMaterials.get(item.kind);
      sprite.position.set(item.x,1.12+.09*Math.sin(t*2.6+item.x),item.z);
    }
    for(const [id,sprite] of badges)if(!frame.pickups.some(item=>item.id===id)){scene.remove(sprite);badges.delete(id);}
    const part=actors.part.bind(actors);
    if(me&&focus&&controls){
      const a=me.yaw,sx=Math.sin(a),sz=-Math.cos(a);
      for(let i=0;i<5;i++){const d=1+i*.47;part('drum',i===4?'#ffab19':'#264a54',me.x+sx*d,.05,me.z+sz*d,.075,.04,.075);}
      part('ring','#ff9715',me.x+sx*3.2,.055,me.z+sz*3.2,.42,.42,.2,-Math.PI/2);
    }
    for(const effect of fx){
      const {x,z,endX,endZ,color,age}=effect;
      if(age<.19){
        const f=Math.min(1,age/.15);
        part('ball',color,x+(endX-x)*f,.67,z+(endZ-z)*f,.20,.17,.20);
        part('ball',creamFlash,x+(endX-x)*Math.max(0,f-.08),.67,z+(endZ-z)*Math.max(0,f-.08),.15,.09,.15);
      }else{
        for(let i=0;i<5;i++){
          const a=i*2.39,r=(age-.19)*1.95;
          part('ball',color,endX+Math.sin(a)*r,.5+r*.5,endZ+Math.cos(a)*r,.16,.13,.16);
        }
      }
    }
    actors.commit(true);renderer.render(scene,camera);
    const seen=new Set();
    if(!demo){
      players.forEach((p,i)=>{
        const own=p.id===me?.id;
        const team=info(p.id),name=team?.name||('Team '+(i+1));
        const scored=me?.hitIds?.includes(p.id);
        const caption=(scored?'✓ ':'')+name+(p.frozenMs>0?' ❄':'');
        label(p.id,caption,p.x,1.54,p.z,getColor(p.id,i));seen.add(p.id);
      });
      frame.pickups.forEach(item=>{
        if(focus&&me&&Math.hypot(me.x-item.x,me.z-item.z)>6)return;
        const k='pick-'+item.id;
        label(k,item.kind==='ammo'?'+2':powerText[item.kind],item.x,1.55,item.z,'#ffc840','pb-pick-label');seen.add(k);
      });
    }
    for(const [id,el] of markers)if(!seen.has(id)){el.remove();markers.delete(id);}
  }
  return {resize,draw,canvas:renderer.domElement,point(e){
    const r=host.getBoundingClientRect();
    raycaster.setFromCamera({x:(e.clientX-r.left)/width*2-1,y:1-(e.clientY-r.top)/height*2},camera);
    const point=raycaster.ray.intersectPlane(floor,projected);return point?{x:point.x,z:point.z}:null;
  },destroy(){
    scenery.dispose();actors.dispose();
    decals.forEach(m=>{m.material.map.dispose();m.material.dispose();m.geometry.dispose();});
    for(const material of badgeMaterials.values()){material.map.dispose();material.dispose();}
    for(const el of markers.values())el.remove();
    sun.shadow.map?.dispose();renderer.dispose();renderer.forceContextLoss();
  }};
}
const creamFlash='#fff5b2';

// Small, fully playable overview for browsers where a WebGL context is unavailable.
function overhead(host){
  const canvas=document.createElement('canvas');host.prepend(canvas);
  const ctx=canvas.getContext('2d');
  const court=paintCourt();
  let w=0,h=0,k=1,cx=0,cz=0;
  const project=(x,z)=>[(x-cx)*k+w/2,(z-cz)*k+h/2];
  function box(x,z,dx,dz,color){
    const [px,py]=project(x,z);ctx.fillStyle=color;ctx.fillRect(px-dx*k/2,py-dz*k/2,dx*k,dz*k);
  }
  function dot(x,z,r,fill){
    const [px,py]=project(x,z);ctx.beginPath();ctx.arc(px,py,r*k,0,Math.PI*2);ctx.fillStyle=fill;ctx.fill();
  }
  return{canvas,resize(width,height){w=canvas.width=width;h=canvas.height=height;},draw({frame,players,me,focus,getColor,controls,info,demo}){
    k=me&&focus?Math.min(w/10,h/10):Math.min(w/24,h/24);
    cx=me&&focus?THREE.MathUtils.clamp(me.x,-7.9,7.9):0;cz=me&&focus?THREE.MathUtils.clamp(me.z,-6.7,7.9):0;
    ctx.fillStyle='#239985';ctx.fillRect(0,0,w,h);box(0,0,22.6,22.6,'#13375e');
    const [left,top]=project(-11,-11);
    ctx.drawImage(court,left,top,22*k,22*k);
    for(const o of OBSTACLES){box(o.x,o.z+.11,o.w,o.d,'#586f79');box(o.x,o.z,o.w,o.d,o.color);}
    frame.drones.forEach(d=>{dot(d.x,d.z,.38,'#fbf4df');box(d.x,d.z,.44,.12,'#152d51');});
    frame.pickups.forEach(p=>{dot(p.x,p.z,.46,{ammo:'#ffb422',shield:'#3595fa',freeze:'#5cddeb',steal:'#fc517b'}[p.kind]);const [x,y]=project(p.x,p.z);ctx.fillStyle='#172e4b';ctx.textAlign='center';ctx.font='bold 11px sans-serif';ctx.fillText(p.kind==='ammo'?'+2':p.kind[0].toUpperCase(),x,y+3);});
    players.forEach((p,i)=>{const c=getColor(p.id,i);dot(p.x,p.z,.44,'#183151');dot(p.x,p.z,.34,c);const a=p.yaw;
      const [x,y]=project(p.x,p.z);ctx.strokeStyle='#203042';ctx.lineWidth=3;ctx.beginPath();ctx.moveTo(x,y);ctx.lineTo(x+Math.sin(a)*k*.7,y-Math.cos(a)*k*.7);ctx.stroke();
      if(!demo){ctx.fillStyle='#132943';ctx.textAlign='center';ctx.font='bold 11px sans-serif';ctx.fillText((me?.hitIds?.includes(p.id)?'✓ ':'')+(info(p.id)?.name||''),x,y-k*.62);}
    });
  },point(e){const b=canvas.getBoundingClientRect();return{x:(e.clientX-b.left-w/2)/k+cx,z:(e.clientY-b.top-h/2)/k+cz};},destroy(){}};
}

export function mountArena(container,{teamId=null,onInput=()=>{},canControl=false,teams=[]}={}) {
  const host=element(container,'div','pb-world');
  const focus=Boolean(teamId);
  host.classList.toggle('pb-phone-world',focus);
  let view;
  try {view=renderer3D(host);} catch {view=overhead(host);host.dataset.renderer='overhead';}
  view.canvas.setAttribute('aria-label','Toybox Battle Arena');view.canvas.setAttribute('role','img');
  let teamList=Array.isArray(teams)?teams:Object.values(teams||{});
  const info=id=>teamList.find(t=>t.id===id);
  const getColor=(id,i)=>colorFor(info(id),i);
  let frame=preview,live=false,me=null,raf=0,last=0,disposed=false,oldRound=-1,latestEvent=0,fx=[],controls=null;
  const reactions=new Map();
  const poses=new Map();
  const hud=element(host,'div','pb-arena-hud');hud.hidden=true;
  const ammo=element(hud,'span','pb-ammo'),points=element(hud,'span','pb-points'),power=element(hud,'span','pb-power');
  const targets=element(host,'details','pb-targets');
  const summary=element(targets,'summary','');
  const list=element(targets,'ul','');
  targets.hidden=true;
  let targetKey='';
  const clock=element(host,'span','pb-clock');clock.hidden=true;
  const status=element(host,'strong','pb-arena-status');
  status.hidden=true;
  const feedback=element(host,'span','pb-hit-feedback');
  feedback.hidden=true;
  let feedbackUntil=0;
  const overlay=element(host,'div','pb-controls');
  function setupControls(p){
    if(!canControl||!focus||controls||!p)return;
    controls=mountControls(overlay,onInput,p.yaw||0);
  }
  function mouseAim(e){
    if(e.pointerType!=='mouse'||!controls||!me||frame.paused)return;
    const pt=view.point(e);if(pt)controls.aimAt(Math.atan2(pt.x-me.x,me.z-pt.z),Boolean(e.buttons&1));
  }
  let aimTouch=null;
  const aimPointer=e=>{
    if(e.pointerType==='mouse'){mouseAim(e);return;}
    if(!controls||aimTouch?.id!==e.pointerId)return;
    const dx=e.clientX-aimTouch.x,dz=e.clientY-aimTouch.y;
    if(Math.hypot(dx,dz)>6)controls.aimAt(Math.atan2(dx,-dz),true);
  };
  const startPointer=e=>{
    if(controls?.getYaw()==null||aimTouch!==null)return;
    if(e.pointerType==='mouse'&&e.button!==0)return;
    aimTouch={id:e.pointerId,x:e.clientX,y:e.clientY};
    view.canvas.setPointerCapture(e.pointerId);
    if(e.pointerType==='mouse'){mouseAim(e);controls.shoot();}
  };
  view.canvas.addEventListener('pointermove',aimPointer);
  view.canvas.addEventListener('pointerdown',startPointer);
  view.canvas.addEventListener('lostpointercapture',e=>{
    if(e.pointerId===aimTouch?.id){aimTouch=null;controls?.releaseCanvasAim();}
  });
  function update(next){
    if(!next || !Array.isArray(next.players))return;
    if(oldRound!==next.round){poses.clear();reactions.clear();latestEvent=0;fx=[];feedbackUntil=0;oldRound=next.round;}
    frame={...empty,...next};live=true;
    if(Array.isArray(next.teams))teamList=next.teams;
    me=frame.players.find(p=>p.id===teamId);
    setupControls(me);
    const canPlay=Boolean(me)&&!frame.paused&&!frame.finished&&!(me.frozenMs>0);
    if(!canPlay)aimTouch=null;
    controls?.setActive(canPlay,me?.yaw);
    if(me){
      hud.hidden=false;ammo.textContent=me.ammo+' paintballs';points.textContent=me.score+' pts';
      power.hidden=!me.ability;power.textContent=(powerText[me.ability]||'')+(me.abilityMs>0?' · '+Math.ceil(me.abilityMs/1000)+'s':'');
      const rivals=frame.players.filter(p=>p.id!==me.id), scored=new Set(me.hitIds);
      const key=rivals.map(p=>p.id+'/'+(info(p.id)?.name||'')+'/'+scored.has(p.id)).join('|');
      targets.hidden=!rivals.length;
      if(key!==targetKey){
        targetKey=key;summary.textContent='Targets · '+scored.size+'/'+rivals.length+' scored';
        list.replaceChildren();
        rivals.forEach((p,i)=>{
          const row=element(list,'li','');
          element(row,'span','',info(p.id)?.name||('Team '+(i+1)));
          element(row,'b','',scored.has(p.id)?'✓ Scored':'+3 available');
        });
      }
    }
    clock.hidden=false;clock.textContent=Math.ceil(frame.remainingMs/1000)+'s';
    clock.classList.toggle('pb-clock-low',frame.remainingMs<=10000);
    const msg=frame.paused?'Round paused':frame.finished?'Round complete':me?.frozenMs>0?'Frozen · '+(me.frozenMs/1000).toFixed(1)+'s':'';
    status.textContent=msg;status.hidden=!msg;
    for(const e of frame.events||[]){
      if(e.id<=latestEvent)continue;
      latestEvent=e.id;
      if(e.kind==='shot'&&Number.isFinite(e.x)&&Number.isFinite(e.endX)){
        fx.push({...e,color:getColor(e.shooterId,Math.max(0,frame.players.findIndex(p=>p.id===e.shooterId))),age:0});
        if(e.targetId && ['hit','freeze','steal','blocked'].includes(e.outcome)){
          reactions.set(e.targetId,performance.now()+220);
        }
        if(teamId===e.shooterId){
          const note={hit:'Paint hit!',drone:'Drone +1',blocked:'Shield blocked',freeze:'Freeze hit!',steal:'Steal hit!'}[e.outcome];
          if(note){feedback.textContent=note;feedback.hidden=false;feedbackUntil=performance.now()+950;}
        }
      }
    }
  }
  const observer=new ResizeObserver(entries=>{
    const bounds=entries[0].contentRect;
    if(bounds.width&&bounds.height)view.resize(Math.round(bounds.width),Math.round(bounds.height));
  });
  observer.observe(host);
  let visible=true;
  const visibility=new IntersectionObserver(entries=>{visible=entries[0].isIntersecting;});
  visibility.observe(host);
  let simTime=0;
  function loop(now) {
    if(disposed)return;
    raf=requestAnimationFrame(loop);
    if(!visible||document.hidden)return;
    const cap=!live?(reduced()?8:24):40;
    if(now-last<1000/cap)return;
    const dt=Math.min(.15,(now-last)/1000);last=now;
    if(!frame.paused)simTime+=dt;
    if(!feedback.hidden&&now>=feedbackUntil)feedback.hidden=true;
    const players=frame.players.map(p=>{
      const previous=poses.get(p.id);
      const alpha=previous?1-Math.exp(-15*dt):1;
      const dx=p.x-(previous?.x??p.x),dz=p.z-(previous?.z??p.z);
      const localYaw=p.id===teamId?controls?.getYaw():null;
      const yaw=localYaw??viewedYaw(previous?.yaw??p.yaw,p.yaw,alpha);
      const pose={...p,x:p.x-dx*(1-alpha),z:p.z-dz*(1-alpha),yaw,motion:Math.min(1,Math.hypot(dx,dz)*6),hitPulse:Math.max(0,((reactions.get(p.id)||0)-now)/220)};
      poses.set(p.id,pose);return pose;
    });
    if(!frame.paused)fx=fx.filter(e=>(e.age+=dt)<.48).slice(-60);
    view.draw({frame,players,me:poses.get(teamId),focus,dt,t:reduced()&&!live?0:simTime,demo:!live,info,getColor,fx,controls});
    if(!host.dataset.ready)host.dataset.ready='true';
    if(live)host.dataset.players=String(players.length);
  }
  raf=requestAnimationFrame(loop);
  return {update,suspendInput(){aimTouch=null;controls?.setActive(false,me?.yaw);},destroy(){
    disposed=true;cancelAnimationFrame(raf);observer.disconnect();visibility.disconnect();controls?.destroy();view.destroy();host.remove();
  }};
}

