// Radius-six hexagon has 127 cells. Seven edge cells are scenery, leaving 120.
const omitted=new Set(['6,0','0,6','-6,6','-6,0','0,-6','6,-6','5,1']);
const mysteries=new Set(['-4,0','-3,4','0,4','4,0','3,-4','0,-4','-4,3','4,-3']);
export const MAP=Object.freeze(Array.from({length:13},(_,i)=>i-6).flatMap(q=>Array.from({length:13},(_,i)=>i-6).filter(r=>Math.abs(q+r)<=6&&!omitted.has(`${q},${r}`)).map(r=>{const x=Math.sqrt(3)*(q+r/2);return {id:`hex:${q}:${r}`,q,r,x:q===0&&r===0?0:x+(x<Math.sin(r*.65)*1.5?-.65:.65),z:1.8*r,kind:q===0&&r===0?'crown':mysteries.has(`${q},${r}`)?'mystery':'regular'};})));
export const COLORS=['#236fca','#d64545','#318745','#d7a725','#8b55cb','#e57929','#c84091','#219caa','#72513b','#8a9b2f','#df8094','#5c7187'];
export const COLOR_NAMES=['Blue','Red','Green','Gold','Purple','Orange','Magenta','Teal','Brown','Olive','Rose','Slate'];
export const RULES={claim:1,capture:2,fortify:2,fortressCapture:3,maxFortresses:3,crownBonus:3,mystery:[40,35,25],cards:['rebellion','shield']};
