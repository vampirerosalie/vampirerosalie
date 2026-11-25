import test from 'node:test';
import assert from 'node:assert/strict';
import { createArena, inputArena, clearArenaInput, stepArena, pauseArena, resumeArena, endArena, frameArena, walkable } from '../../app/battle14/arena.js';
import { SIZE, SPAWNS, OBSTACLES, DRONE_SPOTS, PICKUP_SPOTS, MOVE_SPEED } from '../../public/battle14/layout.js';

const teamList = count => Array.from({ length: count }, (_, i) => ({ id: 't' + i, ammo: 15 }));
function arena(n = 2) {
  return createArena({ round: 1, teams: teamList(n), now: 0, seed: 32 });
}
function clearLane(n = 2) {
  const a = arena(n);
  a.players.forEach((p, i) => Object.assign(p, { x: i * 2 - 2, z: 0 }));
  a.drones = []; a.pickups = [];
  return a;
}
const fire = (a, p, now, yaw = Math.PI / 2) =>
  inputArena(a, p.id, { seq: p.seq + 1, dx: 0, dz: 0, yaw, fire: true }, now);
const move = (a, p, now, dx, dz) =>
  inputArena(a, p.id, { seq: p.seq + 1, dx, dz, yaw: 0, fire: false }, now);

test('all 12 spawns, drones and refill spots share one navigable arena with player-width clearance', () => {
  const step = 0.25, cells = Math.round(SIZE / step);
  const key = (x, z) => x + cells * z;
  const toCell = n => Math.round((n + SIZE / 2) / step);
  const toWorld = i => i * step - SIZE / 2;
  const queue = [[toCell(0), toCell(0)]], seen = new Set([key(...queue[0])]);
  for (let i = 0; i < queue.length; i++) {
    const [x, z] = queue[i];
    for (const [dx, dz] of [[1,0], [-1,0], [0,1], [0,-1]]) {
      const nx = x + dx, nz = z + dz, k = key(nx, nz);
      if (seen.has(k) || !walkable(toWorld(nx), toWorld(nz))) continue;
      seen.add(k); queue.push([nx, nz]);
    }
  }
  for (const spot of [...SPAWNS, ...DRONE_SPOTS, ...PICKUP_SPOTS]) {
    assert.ok(walkable(spot.x, spot.z), JSON.stringify(spot));
    assert.ok(seen.has(key(toCell(spot.x), toCell(spot.z))), JSON.stringify(spot));
  }
  for (const o of OBSTACLES) assert.equal(walkable(o.x, o.z), false);
  assert.ok(SIZE / MOVE_SPEED >= 10 && SIZE / MOVE_SPEED <= 12);
  for (const count of [7, 10, 12]) {
    const a = arena(count);
    assert.equal(new Set(a.players.map(p => [p.x, p.z].join())).size, count);
    assert.equal(a.drones.length, 14); assert.equal(a.pickups.length, 3);
    assert.ok(a.players.every(p => Math.hypot(p.x, p.z) >= 9));
  }
});

test('7, 10 and 12 teams move and shoot over an entire 60-second server round', () => {
  for (const count of [7, 10, 12]) {
    const a = arena(count), start = a.players.map(p => [p.x, p.z]);
    for (let i = 0; i < 600; i++) {
      for (const [idx, p] of a.players.entries()) {
        const yaw = Math.sin(i / 45 + idx) + idx;
        inputArena(a, p.id, { seq: i, dx: Math.sin(yaw), dz: -Math.cos(yaw), yaw, fire: i % 90 === 0 }, i * 100);
      }
    }
    stepArena(a, 60000);
    assert.ok(a.finished);
    for (const [idx,p] of a.players.entries()) {
      assert.ok(walkable(p.x, p.z)); assert.notDeepEqual([p.x, p.z], start[idx]);
      assert.ok(p.ammo >= 0); assert.ok(p.score >= 0);
    }
    assert.ok(a.pickups.length <= 3);
    assert.equal(frameArena(a).remainingMs, 0);
  }
});

test('one ordinary award per directed pair, independent opponents and round reset', () => {
  const a = clearLane(3), [blue, red, yellow] = a.players;
  fire(a, blue, 0); fire(a, blue, 250); fire(a, yellow, 500, -Math.PI/2);
  fire(a, red, 750, -Math.PI/2);
  assert.deepEqual(a.players.map(p => p.score), [3, 3, 3]);
  assert.deepEqual(blue.hitIds, [red.id]);
  assert.equal(blue.stats.firstHits, 1); assert.equal(blue.ammo, 13);
  const next = createArena({ round: 2, teams: frameArena(a).players.map(p => ({ ...p, ammo: 5 })), now: 1000 });
  assert.ok(next.players.every(p => p.score === 3 && p.ammo === 5 && !p.hitIds.length));
  assert.equal(next.drones.length, 14);
});

test('the first hit destroys a drone globally; a miss spends ammo; replaying an input spends nothing', () => {
  const a = clearLane(), [l, r] = a.players;
  a.drones = [{ id: 'target', x: -1, z: 0 }];
  fire(a, l, 0);
  const duplicate = { seq: l.seq, dx: 0, dz: 0, yaw: Math.PI/2, fire: true };
  assert.equal(inputArena(a, l.id, duplicate, 500), false);
  fire(a, r, 500, -Math.PI/2);
  fire(a, l, 750, 0);
  assert.equal(a.drones.length, 0); assert.equal(l.stats.drones, 1); assert.equal(r.stats.drones, 0);
  assert.equal(l.ammo, 13); assert.equal(r.score, 3);
});

test('walls block shots, including assisted shots, and block movement with normalized speed', () => {
  const a = clearLane(), [l, r] = a.players;
  Object.assign(l, { x: -0.85, z: 2.48 });
  Object.assign(r, { x: -0.83, z: 4.65 });
  fire(a, l, 0, Math.PI); assert.equal(a.events.at(-1).outcome, 'wall'); assert.equal(l.score, 0);
  for (let i = 1; i <= 40; i++) move(a, l, i * 100, 0, 1);
  assert.ok(l.z < 3); assert.ok(walkable(l.x, l.z));
  Object.assign(l, { x: 0, z: 0 });
  move(a, l, 4000, 9999, 9999); stepArena(a, 4200);
  assert.ok(Math.abs(Math.hypot(l.x,l.z) - 0.2 * MOVE_SPEED) < 1e-8);
  clearArenaInput(a, l.id); const stopped = [l.x, l.z];
  stepArena(a, 6000); assert.deepEqual([l.x, l.z], stopped);
  assert.equal(inputArena(a, l.id, { seq: 0, dx: 0, dz: 0, yaw: NaN, fire: true }, 6000), false);
});

test('Steal Shot transfers at most two, never spends the first ordinary hit, and persists on a miss', () => {
  for (const points of [0, 1, 2, 9]) {
    const a = clearLane(), [l, r] = a.players;
    l.ability = 'steal'; l.abilityUntil = 10000; r.score = points;
    fire(a, l, 0, 0); assert.equal(l.ability, 'steal');
    fire(a, l, 250); const amount = Math.min(2, points);
    assert.equal(l.score, amount); assert.equal(r.score, points - amount); assert.equal(l.stats.stolen, amount);
    assert.equal(r.stats.lost, amount); assert.deepEqual(l.hitIds, []);
    fire(a, l, 500);
    assert.equal(l.score, amount + 3); assert.equal(l.stats.firstHits, 1);
  }
});

test('Shield blocks one valid incoming hit and its effect; Freeze lasts two playing seconds with immediate refreeze', () => {
  const a = clearLane(), [l, r] = a.players;
  l.ability = 'freeze'; l.abilityUntil = 10000; r.ability = 'shield';
  fire(a, l, 0); assert.equal(r.ability, null); assert.equal(l.score, 0);
  assert.equal(r.frozenUntil, 0); assert.equal(l.ability, 'freeze');
  fire(a, l, 250);
  assert.equal(l.score, 3); assert.equal(r.frozenUntil, 2250); assert.equal(l.ability, null);
  fire(a, r, 1000, -Math.PI/2); assert.equal(r.ammo, 15);
  move(a, r, 1200, 0, 1); stepArena(a, 2249); assert.equal(r.z, 0);
  fire(a, r, 2250, -Math.PI/2); assert.equal(r.ammo, 14);
  l.ability = 'freeze'; l.abilityUntil = 12250; fire(a, l, 2250);
  assert.equal(r.frozenUntil, 4250); assert.equal(l.score, 3);
});

test('the +2 physical pickup works from zero while a special is held; only one team can collect it', () => {
  for (const initial of [0,3,10]) {
    const a = clearLane(), [l,r] = a.players;
    l.ammo = initial; l.ability = 'steal'; l.abilityUntil = 10000;
    Object.assign(r, { x: l.x, z: l.z }); a.pickups = [{ id:'single', kind:'ammo', x:l.x, z:l.z }];
    stepArena(a, 1);
    assert.equal(l.ammo, initial+2); assert.equal(r.ammo,15); assert.equal(l.ability, 'steal');
    assert.equal(a.pickups.length,0); stepArena(a, 5000); assert.equal(a.pickups.length,0);
    stepArena(a,5001); assert.equal(a.pickups.length,1);
  }
  const a = clearLane(), [l] = a.players;
  l.ammo=0; a.pickups=[{ id:'walk-to',kind:'ammo',x:l.x+1.1,z:l.z }];
  move(a,l,0,1,0); stepArena(a,300);
  assert.equal(l.ammo,2); assert.ok(l.x > -2);
});

test('pause freezes the round, pickup deadlines and special effects and blocks replayed activity after finish', () => {
  const a = clearLane(), [l,r] = a.players;
  l.ability='steal'; l.abilityUntil=10000; r.frozenUntil=2400;
  pauseArena(a,1400); const before=frameArena(a);
  assert.equal(before.remainingMs,58600); assert.equal(before.players[1].frozenMs,1000);
  fire(a,l,4900); stepArena(a,10300); assert.deepEqual(frameArena(a),before);
  resumeArena(a,10400); stepArena(a,11400);
  assert.equal(frameArena(a).players[1].frozenMs,0); assert.equal(l.ability,'steal');
  stepArena(a,19000); assert.equal(l.ability,null);
  assert.equal(stepArena(a,68999),false); assert.equal(stepArena(a,69000),true);
  assert.equal(fire(a,l,70000),false);
});

test('checkpoints restore the same round state and short offensive abilities clear on early end', () => {
  const a=arena(7);
  inputArena(a,'t0',{seq:2,dx:0.6,dz:0.2,yaw:0.2,fire:true},1000);
  const restored=JSON.parse(JSON.stringify(a));
  assert.deepEqual(frameArena(restored),frameArena(a));
  stepArena(a,1250); stepArena(restored,1250);
  assert.deepEqual(frameArena(restored),frameArena(a));
  restored.players[0].ability='shield'; endArena(restored,1260);
  assert.equal(restored.players[0].ability,null); assert.ok(restored.finished);
});
