// Floor coordinates shared by the renderer and the room's simulation.
// A positive x goes right; a negative z goes towards the far end of the arena.
export const SIZE = 22;
export const PLAYER_RADIUS = 0.34;
export const DRONE_RADIUS = 0.38;
export const PICKUP_RADIUS = 0.46;
export const MOVE_SPEED = 2.08;

const prop = (id, kind, x, z, w, d, h, color) => ({ id, kind, x, z, w, d, h, color });
const blue = '#2879ec', red = '#ee4b48', yellow = '#ffc52e', wood = '#dc9957';

export const OBSTACLES = [
  prop('north-west-crate', 'crate', -6.7, -6.7, 1.42, 1.42, 1.25, wood),
  prop('north-bunker', 'wall', -2.25, -7.55, 3.1, 0.85, 1.05, blue),
  prop('north-drum', 'barrel', 3.65, -7.55, 0.96, 0.96, 1.2, yellow),
  prop('north-east-crate', 'crate', 7.05, -6.05, 1.55, 1.55, 1.45, red),
  prop('west-rail', 'wall', -8.15, -1.9, 0.75, 3.2, 1.05, red),
  prop('west-bumper', 'inflatable', -4.65, -3.45, 2.15, 1.15, 1.14, yellow),
  prop('north-block', 'wall', 0.9, -3.45, 2.45, 0.88, 1.15, blue),
  prop('east-pillow', 'inflatable', 6.25, -1.8, 1.35, 2.28, 1.2, blue),
  prop('west-pillow', 'inflatable', -5.85, 2.6, 1.25, 2.1, 1.2, blue),
  prop('south-block', 'wall', -0.85, 3.55, 2.5, 0.85, 1.05, red),
  prop('east-bumper', 'inflatable', 4.25, 3.65, 2.15, 1.15, 1.14, yellow),
  prop('east-rail', 'wall', 8.5, 2.6, 0.75, 2.85, 1.05, red),
  prop('south-west-crate', 'crate', -7.45, 6.65, 1.4, 1.4, 1.55, blue),
  prop('south-drum', 'barrel', -3.6, 7.3, 0.98, 0.98, 1.2, yellow),
  prop('south-bunker', 'wall', 2.05, 7.45, 3.05, 0.85, 1.05, blue),
  prop('south-east-crate', 'crate', 6.85, 6.5, 1.55, 1.55, 1.35, wood),
];

const points = (pairs) => pairs.map(([x, z]) => ({ x, z }));

// Circular order lets any class size use the entire arena.
export const SPAWNS = points([
  [0,-9.65], [5.4,-9.4], [9.4,-5.4], [9.65,0],
  [9.4,5.4], [5.4,9.4], [0,9.65], [-5.4,9.4],
  [-9.4,5.4], [-9.65,0], [-9.4,-5.4], [-5.4,-9.4],
]);

export const DRONE_SPOTS = points([
  [-8.8,-8.2], [-4.25,-6.5], [0.45,-6.9], [6.4,-8.35],
  [8.4,-3.35], [3.6,-4.5], [-3.15,-0.9], [3.05,1.05],
  [-8.55,3.8], [-4.15,5.0], [-6.0,8.55], [0.1,6.15],
  [5.2,5.85], [8.75,8.45],
]);

export const PICKUP_SPOTS = points([
  [0,0], [-2.9,-3.0], [3.1,-2.1], [-2.9,2.2], [2.1,4.75],
  [-7.05,-4.75], [6.1,-4.25], [-7.6,4.7], [7.3,4.9],
  [-1.1,-5.65], [-1.55,8.25], [7.7,0.15], [-7.6,0.5],
  [4.95,-6.2], [-5.25,7.1], [2.8,0.0],
]);
