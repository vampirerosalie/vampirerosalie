const arrows = {KeyW:[0,-1],ArrowUp:[0,-1],KeyA:[-1,0],ArrowLeft:[-1,0],KeyS:[0,1],ArrowDown:[0,1],KeyD:[1,0],ArrowRight:[1,0]};

// Input sampling and render rate are independent. A shot is a one-tick edge.
export function mountControls(root,onInput,initialYaw) {
  const movement=document.createElement('div');
  movement.className='pb-stick pb-move';
  movement.innerHTML='<span class="pb-nub"></span><span class="pb-pad-label">MOVE</span>';
  movement.setAttribute('aria-label','Movement joystick');
  const fire=document.createElement('button');
  fire.type='button';fire.className='pb-stick pb-fire';
  fire.innerHTML='<b>FIRE</b><span class="pb-pad-label">AIM</span>';
  fire.setAttribute('aria-label','Fire paintball. Drag to aim, release to fire.');
  root.append(movement,fire);
  const keys=new Set(), cleanups=[];
  let dx=0,dz=0,yaw=initialYaw||0,moveId=null,aimId=null,origin=null;
  let pending=false,active=true,dirty=false,lastShot=0,heldSince=0,heldFired=false;
  const listen=(node,event,fn,opt)=>{node.addEventListener(event,fn,opt);cleanups.push(()=>node.removeEventListener(event,fn,opt));};
  function send(fireShot=false) {
    if(!active) return;
    const kx=[...keys].reduce((sum,k)=>sum+(arrows[k]?.[0]||0),0);
    const kz=[...keys].reduce((sum,k)=>sum+(arrows[k]?.[1]||0),0);
    const x=dx+kx,z=dz+kz,m=Math.max(1,Math.hypot(x,z));
    onInput({dx:x/m,dz:z/m,yaw,fire:fireShot});
    dirty=false;
  }
  function queueShot() {if(active) pending=true;}
  function readStick(event) {
    const rect=movement.getBoundingClientRect();
    const x=event.clientX-rect.left-rect.width/2, z=event.clientY-rect.top-rect.height/2;
    const r=Math.max(rect.width*.34,Math.hypot(x,z));
    dx=x/r;dz=z/r;
    movement.firstChild.style.transform='translate('+dx*rect.width*.20+'px,'+dz*rect.width*.20+'px)';
    dirty=true;
  }
  function releaseMove(e) {
    if(e.pointerId!==moveId)return;
    dx=dz=0;moveId=null;movement.firstChild.style.transform='';
    dirty=true;
  }
  listen(movement,'pointerdown',e=>{
    if(!active||moveId!==null)return;
    e.preventDefault();movement.setPointerCapture(e.pointerId);moveId=e.pointerId;readStick(e);
  });
  listen(movement,'pointermove',e=>{if(e.pointerId===moveId)readStick(e);});
  for(const ev of ['pointerup','pointercancel','lostpointercapture'])listen(movement,ev,releaseMove);
  function releaseAim(e) {
    if(e.pointerId!==aimId)return;
    if(e.type==='pointerup'&&!heldFired)queueShot();
    aimId=null;origin=null;fire.classList.remove('pressed');
  }
  listen(fire,'pointerdown',e=>{
    if(!active||aimId!==null)return;
    e.preventDefault();fire.setPointerCapture(e.pointerId);aimId=e.pointerId;
    origin={x:e.clientX,y:e.clientY};heldSince=performance.now();heldFired=false;fire.classList.add('pressed');
  });
  listen(fire,'pointermove',e=>{
    if(e.pointerId!==aimId||!origin)return;
    const x=e.clientX-origin.x,z=e.clientY-origin.y;
    if(Math.hypot(x,z)>6){yaw=Math.atan2(x,-z);dirty=true;}
  });
  for(const ev of ['pointerup','pointercancel','lostpointercapture'])listen(fire,ev,releaseAim);
  listen(fire,'click',e=>{if(e.detail===0)queueShot();});
  function key(e,down) {
    if(!active||e.target?.closest?.('input,textarea,select,dialog,[contenteditable="true"]'))return;
    if(arrows[e.code]){
      e.preventDefault();if(down)keys.add(e.code);else keys.delete(e.code);dirty=true;
    }else if(e.code==='Space'&&e.target?.tagName!=='BUTTON'){
      e.preventDefault();if(down&&!e.repeat)queueShot();
    }
  }
  listen(window,'keydown',e=>key(e,true));listen(window,'keyup',e=>key(e,false));
  function reset() {
    const moving=dx||dz||keys.size;
    keys.clear();dx=dz=0;aimId=moveId=null;pending=false;origin=null;
    movement.firstChild.style.transform='';fire.classList.remove('pressed');
    if(moving&&active)send(false);
  }
  listen(window,'blur',reset);
  listen(matchMedia('(orientation: landscape)'), 'change', reset);
  listen(document,'visibilitychange',()=>{if(document.hidden)reset();});
  const interval=setInterval(()=>{
    if(!active || document.hidden)return;
    const now=performance.now();
    if(aimId!==null && now-heldSince>440 && now-lastShot>440){pending=true;heldFired=true;}
    if(pending||dirty||dx||dz||keys.size){
      if(pending)lastShot=now;
      send(pending);pending=false;
    }
  },100);
  return {
    getYaw:()=>yaw,
    aimAt(angle){yaw=angle;dirty=true;},
    shoot:queueShot,
    setActive(v) {if(active!==v){reset();active=v;root.classList.toggle('pb-inactive',!active);fire.disabled=!active;}},
    destroy(){reset();clearInterval(interval);cleanups.forEach(f=>f());movement.remove();fire.remove();}
  };
}

