import {MAP} from '../../../public/battle13/map-data.js';

// Rendering geometry only. Backend territory identity, kinds and rules never change.
export const ART_SIZE={width:1536,height:1024};
export const TERRACES=[
 ['Highland',[[375,88],[441,66],[510,89],[510,125],[439,149],[373,126]]],
 ['Windmill',[[1007,110],[1076,85],[1145,112],[1153,149],[1085,173],[1009,148]]],
 ['Crystal',[[156,305],[234,280],[305,303],[305,340],[230,366],[158,342]]],
 ['Orchard',[[950,221],[1024,198],[1095,218],[1101,262],[1026,287],[953,263]]],
 ['Village',[[217,497],[298,469],[376,495],[373,541],[295,571],[214,545]]],
 ['Gardens',[[947,473],[1019,448],[1092,473],[1097,520],[1024,546],[948,517]]],
 ['Harbour',[[1268,537],[1343,506],[1430,538],[1442,585],[1364,617],[1272,586]]],
 ['Waterfall',[[752,657],[835,628],[914,656],[920,712],[837,745],[750,713]]],
 ['Meadow',[[397,706],[480,672],[562,707],[561,767],[480,800],[394,765]]],
 ['Approach',[[638,782],[723,746],[811,779],[814,837],[727,875],[638,840]]]
].map(([name,polygon],index)=>{const xs=polygon.map(p=>p[0]),ys=polygon.map(p=>p[1]),left=Math.min(...xs),top=Math.min(...ys),width=Math.max(...xs)-left,height=Math.max(...ys)-top;return {name,index,polygon,left,top,width,height,cx:left+width/2,cy:top+height/2};});

export function area(p){return Math.abs(p.reduce((s,a,i)=>{const b=p[(i+1)%p.length];return s+a[0]*b[1]-a[1]*b[0];},0))/2;}
export function centroid(p){let a=0,x=0,y=0;for(let i=0;i<p.length;i++){const u=p[i],v=p[(i+1)%p.length],d=u[0]*v[1]-v[0]*u[1];a+=d;x+=(u[0]+v[0])*d;y+=(u[1]+v[1])*d;}return [x/(3*a),y/(3*a)];}
export function contains(p,x,y){let inside=false;for(let i=0,j=p.length-1;i<p.length;j=i++){const a=p[i],b=p[j];if((a[1]>y)!==(b[1]>y)&&x<(b[0]-a[0])*(y-a[1])/(b[1]-a[1])+a[0])inside=!inside;}return inside;}
function halfPlane(p,nx,ny,c){const out=[];for(let i=0;i<p.length;i++){const a=p[i],b=p[(i+1)%p.length],da=a[0]*nx+a[1]*ny-c,db=b[0]*nx+b[1]*ny-c;if(da<=1e-9)out.push(a);if((da<0&&db>0)||(da>0&&db<0)){const f=da/(da-db);out.push([a[0]+(b[0]-a[0])*f,a[1]+(b[1]-a[1])*f]);}}return out;}

// A clipped, staggered stone mosaic fills each existing illustrated terrace.
// The clipping gives complete coverage without invisible or overlapping tap targets.
export function terraceCells(terrace,count){const sites=[];for(let row=0;row<3;row++)for(let col=0;col<4;col++)sites.push([-.66+col*.43+(row===1?.12:0),-.49+row*.49]);if(count===11)sites.splice(3,1);
 const border=terrace.polygon.map(([x,y])=>[(x-terrace.cx)/(terrace.width/2),(y-terrace.cy)/(terrace.height/2)]);
 return sites.map((s,i)=>{let p=border;for(let j=0;j<sites.length;j++){if(i===j)continue;const q=sites[j];p=halfPlane(p,q[0]-s[0],q[1]-s[1],(q[0]*q[0]+q[1]*q[1]-s[0]*s[0]-s[1]*s[1])/2);}return p.map(([x,y])=>[terrace.cx+x*terrace.width/2,terrace.cy+y*terrace.height/2]);});
}
const ordinary=MAP.filter(t=>t.kind==='regular'),mysteries=MAP.filter(t=>t.kind==='mystery');let cursor=0;
export const LAND_LAYOUT=TERRACES.flatMap((terrace,index)=>terraceCells(terrace,index===9?11:12).map((polygon,cell)=>{const tile=index<8&&cell===5?mysteries[index]:ordinary[cursor++];const [cx,cy]=centroid(polygon);return {...tile,number:MAP.findIndex(t=>t.id===tile.id)+1,terrace:index,polygon,cx,cy};}));
const crown=MAP.find(t=>t.kind==='crown');
export const CROWN_LAYOUT={...crown,number:MAP.findIndex(t=>t.id===crown.id)+1,terrace:null,cx:799,cy:342,polygon:[[612,235],[676,172],[700,115],[738,113],[759,20],[805,67],[833,151],[853,188],[903,226],[931,334],[925,390],[875,432],[834,480],[754,463],[704,421],[631,382],[590,310]]};
export const ILLUSTRATED_LAYOUT=[...LAND_LAYOUT,CROWN_LAYOUT];
