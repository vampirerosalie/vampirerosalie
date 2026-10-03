import assert from 'node:assert/strict';
import sharp from 'sharp';
import {bookshelfStages,lockboxStages,initialBookOrder,swapBooks,initialDialWord,turnLetter} from '../public/grammar-room/physical-puzzle-data.js';
import {accepts,stageCounts,allSolved,objectSolved,doorResult} from '../public/grammar-room/core.js';
import {spriteFrames,CHARACTER_HEIGHT,createMotion,drawCharacter} from '../public/grammar-room/animation.js';
for(const stage of bookshelfStages){let order=initialBookOrder(stage.tiles);assert.ok(!accepts(stage,order.map(i=>stage.tiles[i]).join(' ')));for(let i=0;i<order.length;i++)order=swapBooks(order,i,order.indexOf(i));assert.ok(accepts(stage,order.map(i=>stage.tiles[i]).join(' ')));assert.equal(new Set(order).size,stage.tiles.length);}
assert.throws(()=>swapBooks([0,1],-1,1));assert.equal(lockboxStages[0].choices.length,3);assert.ok(accepts(lockboxStages[0],'0'));assert.ok(!accepts(lockboxStages[0],'2'));
assert.equal(initialDialWord(10),'AAAAAAAAAA');assert.equal(turnLetter('Z',1),'A');assert.equal(turnLetter('A',-1),'Z');assert.equal(turnLetter('A',52),'A');assert.throws(()=>turnLetter('?',1));assert.ok(!accepts(lockboxStages[1],initialDialWord(10)));assert.ok(accepts(lockboxStages[1],'MYSTERIOUS'));assert.ok(!accepts(lockboxStages[1],'MISTERIOUS'));
const progress={...stageCounts};for(const id of ['bookshelf','lockbox']){progress[id]=1;assert.ok(!objectSolved(progress,id));assert.ok(!allSolved(progress));assert.equal(doorResult(progress,'secret'),'missing');progress[id]=stageCounts[id];}assert.equal(doorResult(progress,'secret'),'seal');
const {data,info}=await sharp('public/grammar-room/walking-sheet.png').raw().toBuffer({resolveWithObject:true});const frames=spriteFrames(data,info.width,info.height);assert.equal(frames.length,32);assert.equal(CHARACTER_HEIGHT,216);
for(const f of frames.slice(16,24)){assert.ok(f.y+f.h<805,'Left-facing crop must exclude the following row');assert.ok(f.h>230);}
const atlas={image:{},frames,scale:216/Math.max(...frames.map(f=>f.h))};const motion=createMotion();motion.direction='left';motion.moving=true;for(let d=0;d<164;d+=5){motion.distance=d;let args;drawCharacter({drawImage:(...v)=>args=v},atlas,motion,{x:400,y:600});assert.ok(Math.abs(args[6]+args[8]-600)<.001,'Left feet must remain on the floor plane');}
assert.equal(lockboxStages.length,5);
for(const stage of lockboxStages.slice(1)){
 const target=stage.answers[0].toUpperCase(),start=initialDialWord(target.length);
 assert.match(start,/^A+$/);assert.equal(start.length,target.length);
 assert.ok(!stage.prompt.toLowerCase().includes(target.toLowerCase()),'Definition must not reveal the answer');
 const letters=[...start];
 for(let i=0;i<target.length;i++)for(let turn=0;turn<target.charCodeAt(i)-65;turn++)letters[i]=turnLetter(letters[i],1);
 assert.ok(accepts(stage,letters.join('')));
}
for(let completed=0;completed<5;completed++)assert.equal(doorResult({...stageCounts,lockbox:completed},'secret'),'missing');
console.log('PASS: book swaps, four definition-based all-A word locks, seal tense, every unfinished lockbox stage blocks the door, and left-foot floor alignment.');
