import test from 'node:test';import assert from 'node:assert/strict';
import {MAP} from '../../public/battle13/map-data.js';
import {ILLUSTRATED_LAYOUT,LAND_LAYOUT,CROWN_LAYOUT,HEX_SIZE,area,contains} from '../../app/battle13/client/illustrated-layout.js';
test('exactly 119 lands and one Crown preserve all authoritative IDs, numbers and kinds',()=>{
 assert.equal(ILLUSTRATED_LAYOUT.length,120);assert.equal(LAND_LAYOUT.length,119);
 assert.equal(new Set(ILLUSTRATED_LAYOUT.map(t=>t.id)).size,120);
 for(const [index,t]of MAP.entries()){const visual=ILLUSTRATED_LAYOUT.find(x=>x.id===t.id);assert.equal(visual.kind,t.kind);assert.equal(visual.number,index+1);}
 assert.equal(CROWN_LAYOUT.id,'hex:0:0');
});
test('every tile is a convex complete hexagon; Crown is larger with matching neighbour edges',()=>{
 const normalArea=3*HEX_SIZE.halfWidth*HEX_SIZE.halfHeight;
 assert.ok(area(CROWN_LAYOUT.polygon)>normalArea*1.6);
 for(const t of ILLUSTRATED_LAYOUT){assert.equal(t.polygon.length,6);assert.ok(contains(t.polygon,t.cx,t.cy));
  const signs=t.polygon.map((a,i)=>{const b=t.polygon[(i+1)%6],c=t.polygon[(i+2)%6];return Math.sign((b[0]-a[0])*(c[1]-b[1])-(b[1]-a[1])*(c[0]-b[0]));});assert.equal(new Set(signs).size,1,t.id);
  if(Math.max(Math.abs(t.q),Math.abs(t.r),Math.abs(t.q+t.r))>2)assert.ok(Math.abs(area(t.polygon)-normalArea)<1e-6);
 }
 const close=(a,b)=>Math.hypot(a[0]-b[0],a[1]-b[1])<1e-6;
 for(let i=0;i<6;i++){const a=CROWN_LAYOUT.polygon[i],b=CROWN_LAYOUT.polygon[(i+1)%6];assert.ok(LAND_LAYOUT.some(t=>t.polygon.some((p,j)=>close(p,b)&&close(t.polygon[(j+1)%6],a))));}
});
test('120 selectable interiors never overlap and each centre selects only its own land',()=>{
 for(const a of ILLUSTRATED_LAYOUT){assert.equal(ILLUSTRATED_LAYOUT.filter(b=>contains(b.polygon,a.cx,a.cy)).length,1);
  for(const b of ILLUSTRATED_LAYOUT){if(a===b)continue;for(const [x,y]of a.polygon)assert.equal(contains(b.polygon,x*.999+a.cx*.001,y*.999+a.cy*.001),false,`${a.id} overlaps ${b.id}`);}
 }
});
test('shared edges form one connected board; eight mystery IDs stay unchanged',()=>{
 const key=p=>p.map(n=>n.toFixed(5)).join(',');const edges=new Map();
 for(const t of ILLUSTRATED_LAYOUT)for(let i=0;i<6;i++){const k=[key(t.polygon[i]),key(t.polygon[(i+1)%6])].sort().join('|');edges.set(k,[...(edges.get(k)||[]),t.id]);}
 for(const ids of edges.values())assert.ok(ids.length<=2);
 const seen=new Set([CROWN_LAYOUT.id]);let previous=0;
 while(seen.size!==previous){previous=seen.size;for(const ids of edges.values())if(ids.some(id=>seen.has(id)))ids.forEach(id=>seen.add(id));}assert.equal(seen.size,120);
 assert.deepEqual(LAND_LAYOUT.filter(t=>t.kind==='mystery').map(t=>t.id),MAP.filter(t=>t.kind==='mystery').map(t=>t.id));assert.equal(LAND_LAYOUT.filter(t=>t.kind==='mystery').length,8);
});

test('decorative verge follows the exact union of all 120 territories',async()=>{
 const {BOARD_BOUNDARY}=await import('../../app/battle13/client/illustrated-layout.js');
 assert.ok(BOARD_BOUNDARY.length>6);
 assert.ok(Math.abs(area(BOARD_BOUNDARY)-ILLUSTRATED_LAYOUT.reduce((sum,t)=>sum+area(t.polygon),0))<1e-5);
 for(const t of ILLUSTRATED_LAYOUT)assert.ok(contains(BOARD_BOUNDARY,t.cx,t.cy));
});
