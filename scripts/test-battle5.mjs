import assert from 'node:assert/strict';
import {objects,finalQuestion,reading} from '../public/grammar-room/questions.js';
import {accepts,allSolved,doorResult,normalize,canStand,nearestSpot,stepPlayer,spots,objectIds,stageCounts} from '../public/grammar-room/core.js';
assert.equal(objects.length,6);assert.equal(objects.reduce((n,o)=>n+o.questions.length,0),23);
assert.equal(objects.map(o=>o.letter).join(''),'SECRET');
assert.ok(reading.includes('Whoever finds it must not open the door until every clue has been earned.'));
for(const o of objects){assert.equal(o.questions.length,stageCounts[o.id]);assert.ok(!o.intro.includes('Question'));assert.ok(o.intro.length>40);for(const q of o.questions){assert.ok(q.hint&&q.feedback&&q.prompt);assert.ok(!accepts(q,'wrong answer'));for(const a of q.answers){assert.ok(accepts(q,`  ${a.toUpperCase().replaceAll(' ','  ')}.  `));}if(q.type==='mcq'){assert.equal(q.choices.length,4);assert.ok(+q.answers[0]>=0&&+q.answers[0]<4);}if(['tiles','books'].includes(q.type)){assert.deepEqual(q.tiles.map(normalize).sort(),normalize(q.answers[0]).split(' ').sort());}}}
assert.equal(normalize('  The  WORD.   '),'the word');
assert.ok(!accepts(objects[0].questions[1],'The silver bookmark hidden behind the atlas'));
for(let bits=0;bits<64;bits++){const progress=Object.fromEntries(objectIds.map((id,i)=>[id,(bits>>i)&1?stageCounts[id]:0]));assert.equal(allSolved(progress),bits===63);assert.equal(doorResult(progress,'SECRET'),bits===63?'seal':'missing');assert.equal(doorResult(progress,'wrong'),bits===63?'wrong':'missing');}
assert.ok(accepts(finalQuestion,'1'));assert.ok(!accepts(finalQuestion,'0'));
assert.equal(nearestSpot({x:765,y:680}),null);assert.ok(!canStand(100,100));assert.ok(!canStand(200,800));assert.ok(!canStand(1300,850));
assert.deepEqual(stepPlayer({x:800,y:490},0,-10),{x:800,y:490});
// Walk the same collision grid used by gameplay; every puzzle and the door must be reachable.
const queue=[{x:765,y:680}],seen=new Set(['765,680']),found=new Set();
for(let i=0;i<queue.length;i++){const p=queue[i],s=nearestSpot(p);if(s)found.add(s.id);for(const [dx,dy] of [[10,0],[-10,0],[0,10],[0,-10]]){const next=stepPlayer(p,dx,dy),key=`${next.x},${next.y}`;if(!seen.has(key)){seen.add(key);queue.push(next);}}}
assert.deepEqual([...found].sort(),spots.map(s=>s.id).sort());
console.log('PASS: 16 unchanged questions + seven physical stages, accepted variants, grammar seal, all 64 clue combinations, furniture collisions, and all seven reachable interactions.');
