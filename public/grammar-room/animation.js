// A stride is measured in room pixels, not elapsed time: blocked movement must not walk.
export const STRIDE_DISTANCE=164;
export const CHARACTER_HEIGHT=216;
export const DIRECTION_ROWS={down:0,up:1,left:2,right:3};
// Neutral-foot poses bridge the two opposite contact poses for a readable passing phase.
export const WALK_FRAMES=[0,1,6,2,3,4,7,5];
export function createMotion(){return {direction:'down',distance:0,idleTime:0,moving:false};}
export function advanceMotion(state,dx,dy,dt){
 const distance=Math.hypot(dx,dy);
 if(distance>.001){
  state.direction=Math.abs(dx)>Math.abs(dy)?(dx>0?'right':'left'):(dy>0?'down':'up');
  state.distance=(state.distance+distance)%STRIDE_DISTANCE;
  state.moving=true;state.idleTime=0;
 }else{state.moving=false;state.idleTime+=dt;}
 return state;
}
export function animationFrame(state){return {row:DIRECTION_ROWS[state.direction],column:state.moving?WALK_FRAMES[Math.floor(state.distance/STRIDE_DISTANCE*WALK_FRAMES.length)%WALK_FRAMES.length]:6+Math.floor(state.idleTime/1.1)%2};}

// Read each sprite's alpha bounds once. Keep one scale for all frames, with a common foot anchor.
export function spriteFrames(data,width,height){
 const frames=[],cw=width/8,ch=height/4;
 for(let row=0;row<4;row++)for(let column=0;column<8;column++){
  const x0=Math.round(column*cw),x1=Math.round((column+1)*cw),y0=Math.round(row*ch),y1=Math.round((row+1)*ch);
  // Generated rows are not perfectly aligned to the grid. Keep the main connected
  // silhouette, excluding the next row's hair that previously inflated left-frame bounds.
  const cellWidth=x1-x0,cellHeight=y1-y0,visited=new Uint8Array(cellWidth*cellHeight),queue=new Uint32Array(visited.length);
  let main=null;
  for(let sy=0;sy<cellHeight;sy++)for(let sx=0;sx<cellWidth;sx++){
   const seed=sy*cellWidth+sx;if(visited[seed]||data[((sy+y0)*width+sx+x0)*4+3]<=110)continue;
   let count=1,head=0,left=sx,right=sx,top=sy,bottom=sy;queue[0]=seed;visited[seed]=1;
   while(head<count){const pixel=queue[head++],x=pixel%cellWidth,y=Math.floor(pixel/cellWidth);left=Math.min(left,x);right=Math.max(right,x);top=Math.min(top,y);bottom=Math.max(bottom,y);
    for(let dy=-1;dy<=1;dy++)for(let dx=-1;dx<=1;dx++){const nx=x+dx,ny=y+dy;if(nx<0||nx>=cellWidth||ny<0||ny>=cellHeight)continue;const index=ny*cellWidth+nx;if(!visited[index]&&data[((ny+y0)*width+nx+x0)*4+3]>110){visited[index]=1;queue[count++]=index;}}
   }
   if(!main||count>main.count)main={count,left:left+x0,right:right+x0,top:top+y0,bottom:bottom+y0};
  }
  if(!main)throw Error(`Missing character frame ${row},${column}`);
  const {left,right,top,bottom}=main;
  if(right<=left||bottom<=top)throw Error(`Missing character frame ${row},${column}`);
  // Anchor to the head/torso axis rather than the bounding-box centre: scarf and arm swing
  // must not shift the whole character sideways from one frame to the next.
  let headLeft=x1,headRight=x0;const headY=Math.round(top+(bottom-top)*.16);
  for(let x=left;x<=right;x++)if(data[(headY*width+x)*4+3]>110){headLeft=Math.min(headLeft,x);headRight=Math.max(headRight,x);}
  frames.push({x:left,y:top,w:right-left+1,h:bottom-top+1,anchorX:(headLeft+headRight)/2-left});
 }
 return frames;
}
export function makeSpriteAtlas(image){
 const surface=document.createElement('canvas');surface.width=image.width;surface.height=image.height;
 const context=surface.getContext('2d',{willReadFrequently:true});context.drawImage(image,0,0);
 const {data}=context.getImageData(0,0,image.width,image.height),frames=spriteFrames(data,image.width,image.height);
 return {image,frames,scale:CHARACTER_HEIGHT/Math.max(...frames.map(f=>f.h))};
}
export function drawCharacter(context,atlas,motion,player){
 const {row,column}=animationFrame(motion),frame=atlas.frames[row*8+column];
 const width=frame.w*atlas.scale,height=frame.h*atlas.scale;
 const phase=motion.distance/STRIDE_DISTANCE*Math.PI*2;
 const lift=motion.direction==='left'?0:motion.moving?Math.abs(Math.sin(phase))*3:Math.sin(motion.idleTime*2)*.6;
 context.drawImage(atlas.image,frame.x,frame.y,frame.w,frame.h,player.x-frame.anchorX*atlas.scale,player.y-height-lift,width,height);
}
