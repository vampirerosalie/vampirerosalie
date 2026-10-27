import {MAP} from '../../../public/battle13/map-data.js';

// Rendering coordinates only: authoritative IDs, kinds and rules stay unchanged.
// Every polygon is one full regular pointy hex viewed in isometric projection.
export const ART_SIZE={width:1536,height:1024};
export const HEX_SIZE={halfWidth:52.8,halfHeight:41.8};
export const BOARD_CENTRE={x:768,y:472};
export function hexagon(cx,cy){const {halfWidth:w,halfHeight:h}=HEX_SIZE;return [[cx,cy-h],[cx+w,cy-h/2],[cx+w,cy+h/2],[cx,cy+h],[cx-w,cy+h/2],[cx-w,cy-h/2]];}
export function area(p){return Math.abs(p.reduce((s,a,i)=>{const b=p[(i+1)%p.length];return s+a[0]*b[1]-a[1]*b[0];},0))/2;}
export function centroid(p){let a=0,x=0,y=0;for(let i=0;i<p.length;i++){const u=p[i],v=p[(i+1)%p.length],d=u[0]*v[1]-v[0]*u[1];a+=d;x+=(u[0]+v[0])*d;y+=(u[1]+v[1])*d;}return [x/(3*a),y/(3*a)];}
export function contains(p,x,y){let inside=false;for(let i=0,j=p.length-1;i<p.length;j=i++){const a=p[i],b=p[j];if((a[1]>y)!==(b[1]>y)&&x<(b[0]-a[0])*(y-a[1])/(b[1]-a[1])+a[0])inside=!inside;}return inside;}
// A shared vertex transform enlarges the Crown by 28%. Its six neighbours
// share the transformed edges, so there are no overlaps, gaps or extra lands.
function expandCentre([x,y]){const dx=x-BOARD_CENTRE.x,dy=y-BOARD_CENTRE.y;
 const radius=Math.hypot(dx/(HEX_SIZE.halfWidth*2/Math.sqrt(3)),dy/HEX_SIZE.halfHeight);
 const scale=1+.28*Math.max(0,2-radius);
 return [BOARD_CENTRE.x+dx*scale,BOARD_CENTRE.y+dy*scale];}
export const ILLUSTRATED_LAYOUT=MAP.map((tile,index)=>{
 const x=BOARD_CENTRE.x+HEX_SIZE.halfWidth*(2*tile.q+tile.r),y=BOARD_CENTRE.y+HEX_SIZE.halfHeight*1.5*tile.r;
 const polygon=hexagon(x,y).map(expandCentre),[cx,cy]=centroid(polygon);
 return {...tile,number:index+1,polygon,cx,cy};
});
export const LAND_LAYOUT=ILLUSTRATED_LAYOUT.filter(t=>t.kind!=='crown');
export const CROWN_LAYOUT=ILLUSTRATED_LAYOUT.find(t=>t.kind==='crown');

// Derive the decorative shoreline from the same shared vertices as the hit areas.
// Only exterior edges survive; the resulting single loop cannot add territories.
const vertexKey=p=>p.map(n=>n.toFixed(5)).join(',');
const boundaryEdges=new Map();
for(const tile of ILLUSTRATED_LAYOUT)for(let i=0;i<6;i++){
 const a=tile.polygon[i],b=tile.polygon[(i+1)%6],key=[vertexKey(a),vertexKey(b)].sort().join('|');
 if(boundaryEdges.has(key))boundaryEdges.delete(key);else boundaryEdges.set(key,[a,b]);
}
const nextEdge=new Map([...boundaryEdges.values()].map(([a,b])=>[vertexKey(a),b]));
export const BOARD_BOUNDARY=[];
let current=boundaryEdges.values().next().value[0];
for(let i=0;i<boundaryEdges.size;i++){BOARD_BOUNDARY.push(current);current=nextEdge.get(vertexKey(current));}
