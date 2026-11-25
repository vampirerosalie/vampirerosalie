import { SIZE, PLAYER_RADIUS, DRONE_RADIUS, PICKUP_RADIUS, MOVE_SPEED, OBSTACLES, SPAWNS, DRONE_SPOTS, PICKUP_SPOTS } from '../../public/battle14/layout.js';

export const ROUND_MS = 60_000;
const MOVEMENT_LEASE = 360;
const SHOT_COOLDOWN = 220;
const POWER_MS = 10_000;
const RESPAWN_MS = 5_000;
const AIM_ASSIST = 2.5 * Math.PI / 180;
const EDGE = SIZE / 2;
const clamp = (n, min, max) => Math.max(min, Math.min(max, n));
const distance = (a, b) => Math.hypot(a.x - b.x, a.z - b.z);
const rounded = n => (Math.round(n * 1000) / 1000) || 0;
const nonnegative = n => Number.isSafeInteger(n) && n >= 0 ? n : 0;

// The seed is part of each checkpoint, so recovery retains the pickup sequence.
function random(a) {
  a.seed = (Math.imul(a.seed, 1664525) + 1013904223) >>> 0;
  return a.seed / 4294967296;
}

export function walkable(x, z, radius = PLAYER_RADIUS) {
  if (Math.abs(x) + radius > EDGE || Math.abs(z) + radius > EDGE) return false;
  return OBSTACLES.every(o => {
    if (o.kind === 'barrel') return Math.hypot(o.x - x, o.z - z) >= o.w / 2 + radius;
    const nearestX = clamp(x, o.x - o.w / 2, o.x + o.w / 2);
    const nearestZ = clamp(z, o.z - o.d / 2, o.z + o.d / 2);
    return Math.hypot(x - nearestX, z - nearestZ) >= radius;
  });
}

function spawnPickup(a) {
  const free = PICKUP_SPOTS.filter(s => !a.pickups.some(p => distance(p, s) < 1)
    && a.players.every(p => distance(s, p) > PLAYER_RADIUS + PICKUP_RADIUS));
  if (!free.length) return false;
  const spot = free[Math.floor(random(a) * free.length)];
  const roll = random(a);
  const kind = roll < 0.46 ? 'ammo' : roll < 0.64 ? 'steal' : roll < 0.82 ? 'freeze' : 'shield';
  a.pickups.push({ id: 'p' + a.nextPickup++, kind, ...spot });
  return true;
}

export function createArena({ round, teams, now = Date.now(), seed = Math.floor(Math.random() * 4294967296) }) {
  if (!Array.isArray(teams) || teams.length < 1 || teams.length > SPAWNS.length) throw Error('Choose 1 to 12 teams.');
  const a = {
    round, lastWall: now, elapsed: 0, paused: false, finished: false, seed, nextPickup: 1,
    nextEvent: 1, events: [], pickups: [], respawns: [],
    drones: DRONE_SPOTS.map((spot, i) => ({ id: 'd' + (i + 1), ...spot })),
    players: teams.map((team, i) => {
      const { x, z } = SPAWNS[Math.floor(i * SPAWNS.length / teams.length)];
      return {
        id: team.id, x, z, yaw: Math.atan2(-x, z), score: nonnegative(team.score),
        ammo: clamp(nonnegative(team.ammo), 5, 15), hitIds: [],
        stats: Object.fromEntries(['firstHits', 'drones', 'stolen', 'lost'].map(k => [k, nonnegative(team.stats?.[k])])),
        ability: null, abilityUntil: 0, frozenUntil: 0, dx: 0, dz: 0,
        moveUntil: 0, seq: -1, nextShot: 0,
      };
    }),
  };
  for (let i = 0; i < 3; i++) spawnPickup(a);
  return a;
}

function event(a, kind, details) {
  a.events.push({ id: a.nextEvent++, kind, at: Math.round(a.elapsed), ...details });
  if (a.events.length > 80) a.events.shift();
}

function collect(a, p) {
  const at = a.pickups.findIndex(item => (!p.ability || item.kind === 'ammo')
    && distance(p, item) <= PLAYER_RADIUS + PICKUP_RADIUS);
  if (at < 0) return;
  const [item] = a.pickups.splice(at, 1);
  if (item.kind === 'ammo') p.ammo += 2;
  else {
    p.ability = item.kind;
    p.abilityUntil = item.kind === 'shield' ? 0 : a.elapsed + POWER_MS;
  }
  a.respawns.push(a.elapsed + RESPAWN_MS);
  event(a, 'pickup', { playerId: p.id, pickupId: item.id, power: item.kind, x: item.x, z: item.z });
}

function stop(p) { p.dx = 0; p.dz = 0; p.moveUntil = 0; }

function finish(a) {
  a.finished = true;
  a.paused = false;
  for (const p of a.players) {
    stop(p);
    p.ability = null; p.abilityUntil = 0; p.frozenUntil = 0;
  }
}

function advance(a, to) {
  const previous = a.elapsed;
  a.elapsed = to;
  for (const p of a.players) {
    if (p.abilityUntil && p.abilityUntil <= to) { p.ability = null; p.abilityUntil = 0; }
    if (p.frozenUntil > to) continue;
    const moveMs = Math.min(to, p.moveUntil) - Math.max(previous, p.frozenUntil);
    if (moveMs > 0 && (p.dx || p.dz)) {
      const step = moveMs * MOVE_SPEED / 1000;
      const x = p.x + p.dx * step, z = p.z + p.dz * step;
      if (walkable(x, p.z)) p.x = x;
      if (walkable(p.x, z)) p.z = z;
    }
    collect(a, p);
  }
  // These deadlines are measured in playing time and stay fixed across pauses.
  while (a.respawns.length && a.respawns[0] <= to) {
    if (!spawnPickup(a)) break;
    a.respawns.shift();
  }
}

export function stepArena(a, now = Date.now()) {
  if (a.finished || a.paused || now <= a.lastWall) return a.finished;
  const until = Math.min(ROUND_MS, a.elapsed + now - a.lastWall);
  a.lastWall = now;
  // At most 0.11 tiles per movement step. Fast-forward idle room time in one step.
  const movingUntil = Math.max(a.elapsed, ...a.players.map(p => p.moveUntil));
  while (a.elapsed < until) {
    const next = a.elapsed < movingUntil ? Math.min(a.elapsed + 50, movingUntil) : until;
    advance(a, Math.min(next, until));
  }
  if (a.elapsed >= ROUND_MS) finish(a);
  return a.finished;
}

export function pauseArena(a, now = Date.now()) {
  stepArena(a, now);
  if (!a.finished) { a.paused = true; a.players.forEach(stop); }
}

export function resumeArena(a, now = Date.now()) {
  if (a.paused && !a.finished) { a.paused = false; a.lastWall = now; }
}

export function endArena(a, now = Date.now()) {
  stepArena(a, now);
  finish(a);
}

export function clearArenaInput(a, teamId) {
  const p = a?.players.find(player => player.id === teamId);
  if (p) { stop(p); p.seq = -1; }
}

function rayCircle(p, dx, dz, target, radius) {
  const x = target.x - p.x, z = target.z - p.z;
  const forward = x * dx + z * dz;
  const side = x * dz - z * dx;
  if (Math.abs(side) > radius) return Infinity;
  const half = Math.sqrt(Math.max(0, radius * radius - side * side));
  return forward + half < 0 ? Infinity : Math.max(0, forward - half);
}

function rayBox(p, dx, dz, o) {
  let near = -Infinity, far = Infinity;
  for (const [origin, velocity, center, half] of [[p.x, dx, o.x, o.w / 2], [p.z, dz, o.z, o.d / 2]]) {
    if (Math.abs(velocity) < 1e-9) {
      if (Math.abs(origin - center) > half) return Infinity;
    } else {
      const a = (center - half - origin) / velocity, b = (center + half - origin) / velocity;
      near = Math.max(near, Math.min(a, b)); far = Math.min(far, Math.max(a, b));
      if (far < near) return Infinity;
    }
  }
  return far < 0 ? Infinity : Math.max(near, 0);
}

function trace(a, p, dx, dz) {
  const exitX = dx === 0 ? Infinity : (Math.sign(dx) * EDGE - p.x) / dx;
  const exitZ = dz === 0 ? Infinity : (Math.sign(dz) * EDGE - p.z) / dz;
  let distance = Math.min(exitX, exitZ), type = 'miss', target = null;
  for (const o of OBSTACLES) {
    const d = o.kind === 'barrel' ? rayCircle(p, dx, dz, o, o.w / 2) : rayBox(p, dx, dz, o);
    if (d < distance) { distance = d; type = 'wall'; }
  }
  for (const candidate of a.players) {
    if (candidate === p) continue;
    const d = rayCircle(p, dx, dz, candidate, PLAYER_RADIUS);
    if (d < distance) { distance = d; type = 'player'; target = candidate; }
  }
  for (const drone of a.drones) {
    const d = rayCircle(p, dx, dz, drone, DRONE_RADIUS);
    if (d < distance) { distance = d; type = 'drone'; target = drone; }
  }
  return { distance, dx, dz, type, target };
}

function aim(a, p) {
  const dx = Math.sin(p.yaw), dz = -Math.cos(p.yaw);
  const direct = trace(a, p, dx, dz);
  if (direct.target) return direct;
  let best = direct, smallest = AIM_ASSIST;
  for (const t of [...a.players, ...a.drones]) {
    if (t === p) continue;
    const x = t.x - p.x, z = t.z - p.z, length = Math.hypot(x, z);
    if (length === 0 || length > direct.distance) continue;
    const angle = Math.atan2(Math.abs(x * dz - z * dx), x * dx + z * dz);
    if (angle >= smallest) continue;
    const assisted = trace(a, p, x / length, z / length);
    if (assisted.target === t) { smallest = angle; best = assisted; }
  }
  return best;
}

function hitPlayer(a, shooter, target) {
  if (target.ability === 'shield') {
    target.ability = null;
    return 'blocked';
  }
  if (shooter.ability === 'steal') {
    const gain = Math.min(2, target.score);
    target.score -= gain; target.stats.lost += gain;
    shooter.score += gain; shooter.stats.stolen += gain;
    shooter.ability = null; shooter.abilityUntil = 0;
    return 'steal';
  }
  if (!shooter.hitIds.includes(target.id)) {
    shooter.hitIds.push(target.id); shooter.score += 3; shooter.stats.firstHits++;
  }
  if (shooter.ability === 'freeze') {
    target.frozenUntil = a.elapsed + 2000;
    stop(target); shooter.ability = null; shooter.abilityUntil = 0;
    return 'freeze';
  }
  return 'hit';
}

function fire(a, p) {
  if (p.ammo === 0 || a.elapsed < p.nextShot) return;
  p.ammo--; p.nextShot = a.elapsed + SHOT_COOLDOWN;
  const shot = aim(a, p);
  let outcome = shot.type;
  if (outcome === 'player') outcome = hitPlayer(a, p, shot.target);
  if (outcome === 'drone') {
    a.drones.splice(a.drones.indexOf(shot.target), 1);
    p.score++; p.stats.drones++;
  }
  event(a, 'shot', { shooterId: p.id, x: rounded(p.x), z: rounded(p.z),
    endX: rounded(p.x + shot.dx * shot.distance), endZ: rounded(p.z + shot.dz * shot.distance),
    targetId: shot.target?.id ?? null, outcome });
}

export function inputArena(a, teamId, input, now = Date.now()) {
  stepArena(a, now);
  if (a.finished || a.paused || !input || !Number.isSafeInteger(input.seq) || input.seq < 0
    || ![input.dx, input.dz, input.yaw].every(Number.isFinite)) return false;
  const p = a.players.find(player => player.id === teamId);
  if (!p || input.seq <= p.seq) return false;
  p.seq = input.seq;
  if (p.frozenUntil > a.elapsed) return false;
  const dx = clamp(input.dx, -1, 1), dz = clamp(input.dz, -1, 1);
  const scale = Math.max(1, Math.hypot(dx, dz));
  p.dx = dx / scale; p.dz = dz / scale;
  p.yaw = input.yaw % (2 * Math.PI);
  p.moveUntil = a.elapsed + MOVEMENT_LEASE;
  if (input.fire === true) fire(a, p);
  return true;
}

export function frameArena(a) {
  return {
    round: a.round, remainingMs: Math.max(0, Math.ceil(ROUND_MS - a.elapsed)),
    paused: a.paused, finished: a.finished,
    players: a.players.map(p => ({
      id: p.id, x: rounded(p.x), z: rounded(p.z), yaw: rounded(p.yaw), ammo: p.ammo, score: p.score,
      ability: p.ability, abilityMs: Math.max(0, Math.ceil(p.abilityUntil - a.elapsed)),
      frozenMs: Math.max(0, Math.ceil(p.frozenUntil - a.elapsed)), hitIds: [...p.hitIds], stats: { ...p.stats },
    })),
    drones: a.drones.map(d => ({ ...d })), pickups: a.pickups.map(p => ({ ...p })),
    events: a.events.filter(e => e.at >= a.elapsed - 1100).map(e => ({ ...e })),
  };
}
