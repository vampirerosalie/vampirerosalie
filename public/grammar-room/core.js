export const normalize = value => String(value).toLowerCase().trim().replace(/\s+/g,' ').replace(/[.。]+$/,'').trim();
export const accepts = (question,value) => question.answers.some(answer=>normalize(answer)===normalize(value));
export const objectIds=['bookshelf','clock','table','lockbox','mirror','window'];
export const stageCounts={bookshelf:2,clock:4,table:4,lockbox:5,mirror:4,window:4};
export function objectSolved(progress,id){return progress[id]===stageCounts[id];}
export function allSolved(progress){return objectIds.every(id=>objectSolved(progress,id));}
export function doorResult(progress,password){return !allSolved(progress)?'missing':normalize(password)==='secret'?'seal':'wrong';}
export const spots=[
 {id:'bookshelf',x:380,y:560,label:'Bookshelf'}, {id:'clock',x:550,y:520,label:'Old clock'},
 {id:'window',x:800,y:510,label:'Moonlit window'}, {id:'mirror',x:1100,y:540,label:'Mirror'},
 {id:'door',x:1290,y:615,label:'Final door'}, {id:'table',x:480,y:740,label:'Study diary'},
 {id:'lockbox',x:1135,y:780,label:'Lockbox'}
];
export const obstacles=[{x:0,y:0,w:1536,h:475},{x:0,y:0,w:345,h:575},{x:0,y:0,w:120,h:1024},{x:1390,y:0,w:146,h:1024},{x:1310,y:0,w:226,h:590},{x:0,y:925,w:1536,h:99},{x:0,y:710,w:430,h:314},{x:1180,y:750,w:356,h:274},{x:1010,y:0,w:205,h:495}];
export function canStand(x,y){return !obstacles.some(r=>x+16>r.x&&x-16<r.x+r.w&&y+10>r.y&&y-10<r.y+r.h);}
export function stepPlayer(p,dx,dy){const next={...p}; if(canStand(next.x+dx,next.y))next.x+=dx; if(canStand(next.x,next.y+dy))next.y+=dy; return next;}
export function nearestSpot(player){return spots.filter(s=>Math.hypot(s.x-player.x,s.y-player.y)<105).sort((a,b)=>Math.hypot(a.x-player.x,a.y-player.y)-Math.hypot(b.x-player.x,b.y-player.y))[0]??null;}
