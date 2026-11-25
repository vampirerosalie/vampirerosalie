import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';
import { OBSTACLES, SIZE, SPAWNS } from '../../../public/battle14/layout.js';
import { paintCourt } from './court.js';

const navy = '#10274e', cream = '#fff8df', blue = '#1355e4', red = '#ff384e', yellow = '#ffc52c';
const palette = [blue, red, yellow, '#00ba9d', '#9144e9', '#ff7530'];
const pose = new THREE.Object3D();
const robotAnchor = new THREE.Matrix4();

// One instanced draw call per shape. Robots, stadium seating and toy parts share geometry.
export class ToyParts {
  constructor(scene) {
    this.scene = scene;
    this.shapes = {
      block: new RoundedBoxGeometry(1, 1, 1, 2, 0.065),
      cube: new THREE.BoxGeometry(1, 1, 1),
      ball: new THREE.SphereGeometry(0.5, 14, 9),
      drum: new THREE.CylinderGeometry(0.5, 0.5, 1, 18),
      ring: new THREE.TorusGeometry(0.48, 0.022, 6, 48),
      bubble: new THREE.SphereGeometry(.5,16,10),
    };
    this.material = new THREE.MeshStandardMaterial({roughness: 0.54, metalness: 0.065});
    this.instances = {};
    this.parts = {};
    this.counts = {};
    this.colors = new Map();
    this.bubbleMaterial = new THREE.MeshPhysicalMaterial({color:'#9bdfff',transparent:true,opacity:.20,depthWrite:false,roughness:.16,metalness:.16});
    this.anchor = null;
  }
  part(shape, color, x, y, z, w, h, d, rx=0, ry=0, rz=0) {
    pose.position.set(x,y,z);
    pose.rotation.set(rx,ry,rz);
    pose.scale.set(w,h,d);
    pose.updateMatrix();
    const i=this.counts[shape]||0, list=(this.parts[shape]??=[]);
    const item=list[i]??=( {matrix:new THREE.Matrix4(),color:null} );
    item.matrix.copy(pose.matrix);
    if (this.anchor) item.matrix.premultiply(this.anchor);
    if(!this.colors.has(color))this.colors.set(color,new THREE.Color(color));
    item.color=this.colors.get(color);
    this.counts[shape]=i+1;
  }
  commit(dynamic=false) {
    for (const shape of Object.keys(this.shapes)) {
      const list = this.parts[shape] || [];
      const count=this.counts[shape]||0;
      let mesh = this.instances[shape];
      if (!count && !mesh) continue;
      if (!mesh || count > mesh.instanceMatrix.count) {
        if (mesh) { this.scene.remove(mesh); mesh.dispose(); }
        const material=shape==='bubble'?this.bubbleMaterial:this.material;
        mesh = new THREE.InstancedMesh(this.shapes[shape],material,dynamic ? Math.max(128,count * 2) : count);
        if (dynamic) mesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
        mesh.castShadow = !dynamic;
        mesh.receiveShadow = true;
        mesh.frustumCulled = false;
        this.instances[shape] = mesh;
        this.scene.add(mesh);
      }
      for(let i=0;i<count;i++) {
        const {matrix,color}=list[i];
        mesh.setMatrixAt(i,matrix);
        mesh.setColorAt(i,color);
      }
      mesh.count = count;
      mesh.instanceMatrix.needsUpdate = true;
      if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true;
    }
    this.counts={};
    if(!dynamic)this.parts={};
  }
  dispose() {
    Object.values(this.instances).forEach(mesh => { this.scene.remove(mesh); mesh.dispose(); });
    Object.values(this.shapes).forEach(geometry => geometry.dispose());
    this.material.dispose();
    this.bubbleMaterial.dispose();
  }
}

export function decal(scene,text,options={}) {
  const {w=3,h=0.65,bg=navy,fg=cream,x=0,y=1,z=0,rx=0,ry=0,rz=0} = options;
  const canvas = document.createElement('canvas');
  canvas.width=768; canvas.height=Math.max(90,Math.round(768*h/w));
  const ctx=canvas.getContext('2d');
  if (bg) {ctx.fillStyle=bg;ctx.fillRect(0,0,canvas.width,canvas.height);}
  ctx.fillStyle=fg;ctx.textAlign='center';ctx.textBaseline='middle';
  ctx.font='italic 900 '+Math.round(canvas.height*0.71)+'px Arial, sans-serif';
  ctx.fillText(text,canvas.width/2,canvas.height*0.54,canvas.width*0.95);
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace=THREE.SRGBColorSpace;
  const material=new THREE.MeshBasicMaterial({map:texture,transparent:true,depthWrite:false,side:THREE.DoubleSide,toneMapped:false});
  const mesh=new THREE.Mesh(new THREE.PlaneGeometry(w,h),material);
  mesh.position.set(x,y,z);mesh.rotation.set(rx,ry,rz);
  scene.add(mesh);
  return mesh;
}

export function buildStadium(scene,parts) {
  const p=parts.part.bind(parts);
  // The printed top, raised rim and recessed paint stripe form one molded playset.
  p('block',navy,0,-0.44,0,23.3,0.82,23.3);
  p('block',yellow,0,-0.18,0,23.2,0.2,23.2);
  const map=new THREE.CanvasTexture(paintCourt());
  map.colorSpace=THREE.SRGBColorSpace;
  const court=new THREE.Mesh(new THREE.PlaneGeometry(SIZE,SIZE),new THREE.MeshStandardMaterial({map,roughness:.84}));
  court.rotation.x=-Math.PI/2;
  court.receiveShadow=true;
  scene.add(court);
  for(const [x,z,c] of [[-6.45,4.6,'#00a4b9'],[7,-4.2,'#ff8b23'],[2.8,6,'#fb4480'],[-4,-6,'#f5ad10']]) {
    p('drum',c,x,0.012,z,1.25,0.014,0.82);
    for(let i=0;i<7;i++) {const a=i*2.4;p('drum',c,x+Math.sin(a)*0.74,0.014,z+Math.cos(a)*0.52,.10+(i%3)*.1,.012,.15+(i%2)*.17);}
  }
  SPAWNS.forEach(({x,z},i) => {
    p('ring','#7396b1',x,0.018,z,1.58,1.58,.14,-Math.PI/2);
    p('cube',palette[i%6],x,0.019,z,.42,.018,.09);
  });
  for(const o of OBSTACLES) {
    const {x,z,w,d,h,color}=o;
    if(o.kind==='barrel') {
      p('drum',color,x,h/2,z,w,h,d);
      for(const y of [.08,h*.26,h*.76,h-.04]) p('drum',y>.1&&y<h-.08?'#e99b1a':navy,x,y,z,w*1.035,.05,d*1.035);
      p('drum','#ffe196',x,h+.005,z,w*.79,.025,d*.79);
      p('drum',navy,x+w*.19,h+.025,z+.09,.1,.03,.1);
    } else if(o.kind==='crate') {
      p('block',color,x,h/2,z,w,h,d);
      for(const sign of [-1,1]){
        const side=z+sign*d*.502;
        for(const xx of [-.43,.43]) p('block','#ad673b',x+xx*w,h/2,side,.11,h,.06);
        for(const yy of [.1,h-.1]) p('block','#f6ba75',x,yy,side,w-.12,.13,.075);
        p('block','#f3ab65',x,h/2,side,w*.99,.115,.095,0,0,.60);
        p('block','#bd7848',x,h/2,side,w*.99,.09,.09,0,0,-.60);
        p('block','#b87950',x+sign*.502*w,h*.51,z,.07,h*.80,d*.78);
      }
      p('block','#f4bd79',x,h+.025,z,w*.86,.06,d*.70);
    } else if(o.kind==='inflatable') {
      p('block',navy,x,.1,z,w*.93,.2,d*.93);
      p('ball',color,x,h*.48,z,w,h,d);
      p('ball',cream,x,h*.55,z,w*.25,h*.89,d*1.006);
      p('ball',color,x,h*.51,z,w*.19,h*.93,d*1.015);
    } else {
      const longX=w>d;
      p('block',navy,x,.12,z,w,.24,d);
      p('block',color,x,h*.55,z,w,h*.8,d);
      p('block',cream,x,h*.93,z,w*.99,.12,d*.99);
      for(const a of [-.34,0,.34]){
        const xx=x+(longX?w*a:0),zz=z+(longX?0:d*a);
        p('block',color,xx,h+.028,zz,longX?.26:w*.66,.07,longX?d*.66:.26);
        for(const s of [-1,1])p('ball','#b9cddd',longX?xx:x+s*w*.505,h*.31,longX?z+s*d*.505:zz,.075,.075,.075);
      }
    }
  }
  // Short rubber curbs keep the side-on phone camera clear.
  for(const s of [-1,1]) for(let i=-10;i<=10;i+=2) {
    const c=((i+10)/2)%2?cream:blue;
    p('block',c,i,.16,s*11.25,1.98,.32,.45);
    p('block',c,s*11.25,.16,i,.45,.32,1.98);
  }
  // Side grandstands, two red-roofed marshalling towers and corner floodlights.
  for(const side of [-1,1]) {
    for(let tier=0;tier<3;tier++) {
      p('block',(side<0?['#1844bb','#176fe0','#08aac7']:['#9d235a','#e83e64','#ff7649'])[tier],side*(12.2+tier*.64),.28+tier*.38,0,.75,.55,17);
      for(let i=0;i<20;i++) {
        const z=-8+i*.83;
        if((i+tier)%7===0) continue;
        const x=side*(12.2+tier*.64);
        p('block',palette[(i+tier*3)%6],x,.71+tier*.38,z,.34,.4,.38);
        p('ball',i%4?'#ffd3a0':'#b97959',x,.99+tier*.38,z,.29,.29,.29);
      }
    }
    const x=side*9.4, z=-12.6;
    p('block',cream,x,1.4,z,2.1,2.8,1.7);
    p('block',blue,x,.58,z,2.18,.29,1.79);
    p('block','#17527b',x,2.31,z+.85,1.67,.58,.07);
    for(const offset of [-.54,.54])p('block',cream,x+offset,2.34,z+.90,.075,.64,.06);
    p('block','#2e8dac',x,.95,z+.855,1.43,.59,.05);
    p('block',navy,x,1.83,z+1.03,2.45,.14,1);
    for(const offset of [-1.08,0,1.08])p('drum',yellow,x+offset,2.01,z+1.48,.055,.49,.055);
    p('block',yellow,x,2.23,z+1.48,2.3,.06,.06);
    for(let stair=0;stair<5;stair++)p('block','#bdd5da',x+side*(1.2+stair*.20),.09*(5-stair),z+.42,.23,.18*(5-stair),.84);
    p('block',side<0?blue:red,x,2.98,z,2.5,.29,2.03);
    p('drum',cream,x,3.56,z,.08,1.1,.08);
    p('block',side<0?blue:red,x+.29,3.94,z,.65,.32,.045);
    for(const end of [-1,1]) {
      const tx=side*11.7,tz=end*10.8;
      p('drum','#7898b2',tx,2.75,tz,.15,5.5,.15);
      p('block',navy,tx,5.38,tz,1.42,.5,.35);
      for(let j=-1;j<=1;j++) p('ball','#fff4ae',tx+j*.42,5.38,tz+.13,.34,.32,.19);
    }
  }
  p('block',navy,0,1.0,-12.8,11.3,2.0,.65);
  p('block',yellow,0,2.06,-12.8,11.45,.15,.75);
  for(let i=-4;i<=4;i++) for(let j=0;j<2;j++) if((i+j+4)%2===0) p('cube',cream,i*.45,1.8+j*.20,-12.44,.44,.19,.03);
  const labels=[
    decal(scene,'TOYBOX ARENA',{x:0,y:1,z:-12.44,w:7.8,h:1.2,bg:navy}),
    court,
  ];
  for(const side of [-1,1]) {
    for(let i=0;i<3;i++)p('block',i===2?yellow:side<0?'#08c9c3':red,side*(4.23+i*.41),1.00,-12.43,.22,.8,.04,0,0,-.38);
  }
  // A curved pennant line and advertising fascia frame the referee side.
  for(let i=-8;i<=8;i++){
    const x=i*1.1,y=3.45+.45*(x/9)**2;
    p('block',navy,x,y,-12.55,1.12,.032,.032,0,0,.011*i);
    if(i%2===0)p('block',palette[(i+8)%6],x,y-.17,-12.55,.26,.26,.045,0,0,Math.PI/4);
  }
  for(const side of [-1,1]){
    for(let i=0;i<7;i++){
      const z=-7.4+i*2.45;
      p('block',navy,side*11.84,.61,z,.16,.84,2.42);
      for(let j=0;j<4;j++)p('block',i%2?cream:yellow,side*11.74,.60,z-.72+j*.45,.04,.34,.145,.56,0,0);
    }
    for(let i=0;i<9;i++) {
      const x=side*(5.5+i*.35);
      p('cube',i%2?blue:cream,x,.15,-11.74,.34,.3,.58);
    }
  }
  for(const [x,z,c] of [[-8,-5,blue],[8,7,red]]) {
    for(let i=0;i<4;i++)p('cube',c,x+i*.25,.018,z,.09,.008,.35,0,-.55);
  }
  // Distant park scenery gives lower phone angles a horizon.
  p('cube','#49c59b',0,-1.2,0,142,.8,130);
  // The running track and its lane stripes frame the seating outside the play area.
  for(const side of [-1,1]) {
    p('cube','#238db9',0,-.785,side*15.6,35,.045,2.6);
    p('cube','#238db9',side*16.2,-.785,0,2.6,.045,29);
    for(const lane of [-.65,.65]) {
      p('cube','#8ae1dc',0,-.755,side*15.6+lane,35,.014,.05);
      p('cube','#8ae1dc',side*16.2+lane,-.755,0,.05,.014,29);
    }
  }
  for(let i=0;i<32;i++) {
    const a=i*2.399, dist=21+(i%5)*2.7,x=Math.sin(a)*dist,z=Math.cos(a)*dist;
    p('drum','#aa7b5f',x,.35,z,.36,2.4,.36);
    p('ball',i%3===0?'#64bd52':'#178e77',x,1.8,z,2.1,2.8,2.2);
    p('ball',i%3===0?'#b1d94c':'#4bc48b',x+.52,1.78,z+.19,1.15,1.60,1.12);
  }
  parts.commit();
  return labels;
}

export function robot(parts,player,color,motion,t,highlight=false) {
  const yaw=player.yaw || 0;
  const anchor=robotAnchor.makeRotationY(-yaw);
  anchor.setPosition(player.x,player.hitPulse?Math.sin(Math.PI*player.hitPulse)*.13:0,player.z);
  parts.anchor=anchor;
  const p=parts.part.bind(parts), frozen=player.frozenMs>0;
  const body=frozen?'#95e6ff':player.hitPulse>.60?'#fff2b5':color;
  const stride=motion*Math.sin(t*10.5+player.x);
  p('drum','#8fa4aa',0,.022,0,.86,.026,.63);
  if(highlight) p('ring',yellow,0,.038,0,1.05,1.05,.2,-Math.PI/2);
  for(const s of [-1,1]) {
    p('block',navy,s*.17,.145,s*stride*.14,.26,.25,.38);
    p('block',body,s*.17,.285,s*stride*.09,.205,.21,.24);
  }
  p('block',body,0,.55,0,.61,.55,.40);
  p('block',cream,0,.58,-.207,.25,.15,.04);
  p('block',navy,0,.56,.21,.41,.31,.14);
  p('block',body,0,.58,.281,.31,.18,.04);
  for(const y of [.53,.59])p('block',cream,0,y,.313,.22,.024,.022);
  p('block',navy,0,.83,0,.28,.12,.26);
  p('block',body,0,1.055,0,.75,.52,.52);
  p('block',navy,0,1.06,-.247,.63,.25,.095);
  for(const s of [-1,1]){
    p('block','#b3ffed',s*.145,1.072,-.30,.116,.065,.035);
    p('ball',body,s*.32,.63,-.13,.23,.29,.30);
  }
  p('block',navy,.31,.58,-.37,.19,.18,.53);
  p('drum',yellow,.31,.59,-.62,.16,.18,.16,Math.PI/2);
  p('ball',color,.31,.73,-.33,.19,.16,.24);
  p('block',cream,0,1.329,0,.31,.045,.21);
  p('block',body,0,1.328,.005,.13,.048,.33);
  p('block',navy,0,1.035,.26,.38,.095,.025);
  for(const s of [-1,1])p('drum',navy,s*.368,1.047,0,.18,.055,.18,0,0,Math.PI/2);
  if(frozen) p('ring','#3caee3',0,.53,0,1.13,1.13,.6,-Math.PI/2);
  if(player.ability==='shield'){
    p('bubble','#72caff',0,.78,0,1.63,1.82,1.63);
    p('ring','#19c8ff',0,.72,0,1.55,1.55,.8,-Math.PI/2);
    p('ring','#b3f5ff',0,.76,0,1.5,1.5,.7,Math.PI/5,0,t*.5);
  }
  parts.anchor=null;
}

const pickupColors={ammo:yellow,freeze:'#51ceff',steal:'#ff5182',shield:'#368fff'};
export function pickupBadge(kind) {
  const canvas=document.createElement('canvas');canvas.width=canvas.height=96;
  const g=canvas.getContext('2d');
  g.lineCap='round';g.lineJoin='round';
  g.fillStyle=navy;g.beginPath();g.arc(48,48,43,0,Math.PI*2);g.fill();
  g.strokeStyle=pickupColors[kind];g.lineWidth=6;g.stroke();
  g.fillStyle=cream;g.strokeStyle=cream;g.lineWidth=5;
  if(kind==='ammo'){
    g.font='bold 40px Arial';g.textAlign='center';g.textBaseline='middle';g.fillText('+2',48,50);
  }else if(kind==='shield'){
    g.beginPath();g.moveTo(48,20);g.lineTo(69,29);g.lineTo(67,49);
    g.quadraticCurveTo(65,63,48,74);g.quadraticCurveTo(31,63,29,49);
    g.lineTo(27,29);g.closePath();g.stroke();
  }else if(kind==='freeze'){
    g.translate(48,48);
    for(let i=0;i<6;i++){
      g.beginPath();g.moveTo(0,0);g.lineTo(0,-25);g.moveTo(-7,-16);
      g.lineTo(0,-9);g.lineTo(7,-16);g.stroke();g.rotate(Math.PI/3);
    }
  }else{
    for(const [x,y] of [[39,40],[54,56]]){
      g.beginPath();g.arc(x,y,15,0,2*Math.PI);g.fillStyle=navy;g.fill();g.stroke();
      g.beginPath();g.moveTo(x,y-5);g.lineTo(x,y+5);g.stroke();
    }
  }
  const map=new THREE.CanvasTexture(canvas);map.colorSpace=THREE.SRGBColorSpace;
  return new THREE.SpriteMaterial({map,transparent:true,depthWrite:false,toneMapped:false});
}

export function toys(parts,frame,t) {
  const p=parts.part.bind(parts);
  for(const drone of frame.drones) {
    const {x,z}=drone, y=.78+.075*Math.sin(t*2+x);
    p('drum','#9baaaf',x,.02,z,.58,.02,.44);
    p('ball',cream,x,y,z,.7,.46,.52);
    p('block',navy,x,y,z-.23,.40,.16,.09);
    p('block','#ff9552',x,y,z-.285,.19,.06,.04);
    for(const s of [-1,1]) {
      p('block',red,x+s*.34,y+.02,z,.23,.115,.22);
      p('drum',navy,x+s*.38,y+.13,z,.29,.045,.29);
    }
  }
  for(const item of frame.pickups) {
    const {x,z,kind}=item, c=pickupColors[kind]||yellow, y=.62+.12*Math.sin(t*2.6+x);
    p('ring',c,x,.04,z,1.0,1.0,.20,-Math.PI/2);
    p('drum',navy,x,.11,z,.67,.18,.67);
    p('drum',c,x,y,z,.49,.50,.49);
    p('ball',c,x,y+.24,z,.49,.35,.49);
    p('ball',c,x,y-.24,z,.49,.35,.49);
    p('drum',cream,x,y,z,.503,.085,.503);
  }
}

