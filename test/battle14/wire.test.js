import test from 'node:test';
import assert from 'node:assert/strict';
import {createArena,frameArena,inputArena,stepArena} from '../../app/battle14/arena.js';
import {applyDelta,diffFrame} from '../../public/battle14/arena-wire.js';

test('a joining player receives a full frame; other players reconstruct precise deltas',()=>{
  const arena=createArena({teams:Array.from({length:12},(_,i)=>({id:String(i),ammo:15})),round:1,now:0,seed:42});
  let previous=frameArena(arena),rendered=applyDelta(null,diffFrame(null,previous));
  assert.equal(rendered.players.length,12);
  for(let tick=1;tick<=35;tick++){
    inputArena(arena,'5',{seq:tick,dx:.6,dz:.6,yaw:.8,fire:tick%8===0},tick*100);
    stepArena(arena,tick*100+80);
    const next=frameArena(arena),delta=diffFrame(previous,next);
    rendered=applyDelta(rendered,JSON.parse(JSON.stringify(delta)));
    assert.deepEqual({...rendered,events:[]},{...next,events:[]});
    const last=previous.events.at(-1)?.id||0;
    assert.deepEqual(rendered.events,next.events.filter(e=>e.id>last));
    assert.ok(JSON.stringify(delta).length < JSON.stringify(next).length/2);
    previous=next;
  }
});

test('deltas propagate pickups, globally removed drones, scored opponents and pause',()=>{
  const arena=createArena({teams:[{id:'red',ammo:5},{id:'blue',ammo:5}],round:2,now:0,seed:10});
  const before=frameArena(arena),after=structuredClone(before);
  after.players[0].hitIds.push('blue');after.players[0].score=3;after.players[0].stats.firstHits=1;
  after.drones.pop();after.pickups.pop();after.paused=true;
  assert.deepEqual(applyDelta(before,diffFrame(before,after)),after);
  assert.deepEqual(applyDelta(null,diffFrame(after,{...after,round:3})),{...after,round:3});
});

