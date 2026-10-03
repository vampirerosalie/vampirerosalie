import assert from 'node:assert/strict';
import fs from 'node:fs';
import sharp from 'sharp';
import {createMotion,advanceMotion,animationFrame,STRIDE_DISTANCE,CHARACTER_HEIGHT,WALK_FRAMES} from '../public/grammar-room/animation.js';
import {stepPlayer} from '../public/grammar-room/core.js';
import {objects} from '../public/grammar-room/questions.js';
for(const [dx,dy,row] of [[0,10,0],[0,-10,1],[-10,0,2],[10,0,3]]){const state=createMotion();advanceMotion(state,dx,dy,.04);assert.equal(animationFrame(state).row,row);assert.ok(state.moving);const seen=new Set();for(let i=0;i<80;i++){advanceMotion(state,dx/2,dy/2,.02);seen.add(animationFrame(state).column);}assert.ok(seen.size>=6);advanceMotion(state,0,0,.1);assert.equal(state.moving,false);assert.equal(animationFrame(state).row,row);assert.equal(animationFrame(state).column,6);advanceMotion(state,0,0,1.1);assert.equal(animationFrame(state).column,7);}
const a=createMotion(),b=createMotion();for(let i=0;i<20;i++)advanceMotion(a,5,0,.016);for(let i=0;i<10;i++)advanceMotion(b,10,0,.032);assert.equal(a.distance,b.distance);assert.deepEqual(animationFrame(a),animationFrame(b));
const stopped=createMotion(),p={x:800,y:490},next=stepPlayer(p,0,-10);advanceMotion(stopped,next.x-p.x,next.y-p.y,.04);assert.equal(stopped.moving,false);assert.equal(stopped.distance,0);assert.ok(CHARACTER_HEIGHT>133);assert.equal(new Set(WALK_FRAMES).size,8);assert.ok(STRIDE_DISTANCE>0);
assert.ok(objects.find(o=>o.id==='clock').questions[1].prompt.includes('___ (play)'));
assert.ok(objects.find(o=>o.id==='window').questions[1].prompt.includes('___ (blow)'));
const {data,info}=await sharp('public/grammar-room/walking-sheet.png').raw().toBuffer({resolveWithObject:true});assert.equal(info.channels,4);
for(let row=0;row<4;row++){let fingerprints=[];for(let col=0;col<8;col++){let visible=0,transparent=0,sum=0;for(let y=Math.round(row*info.height/4);y<Math.round((row+1)*info.height/4);y++)for(let x=Math.round(col*info.width/8);x<Math.round((col+1)*info.width/8);x++){const i=(y*info.width+x)*4;visible+=data[i+3]>110;transparent+=data[i+3]===0;sum+=data[i]*data[i+3];}assert.ok(visible>1000&&transparent>1000);fingerprints.push(sum);}assert.equal(new Set(fingerprints).size,8);}
const html=fs.readFileSync('public/grammar-room/index.html','utf8'),game=fs.readFileSync('public/grammar-room/game.js','utf8');assert.equal((html.match(/aria-label="Move [^"]+"><svg/g)||[]).length,4);assert.ok(!game.includes('for(const spot of spots)'));assert.ok(!game.includes('Follow a sparkle'));assert.ok(!game.includes('spriteBounds'));assert.ok(!game.includes("$('#controls').addEventListener('touchstart'"));
console.log('PASS: 32 transparent distinct frames, four directions, distance-synced cycle, collision-to-idle, both idle frames, larger character, verb cues, SVG arrows, and removed object markers.');
