import { SIZE } from '../../../public/battle14/layout.js';

// All the paint is printed on one surface, like the graphics on a toy playset.
// Both the 3D arena and its lightweight overhead view use the same artwork.
export function paintCourt() {
  const surface = document.createElement('canvas');
  surface.width = surface.height = 1536;
  const g = surface.getContext('2d');
  g.scale(surface.width / SIZE, surface.height / SIZE);
  g.translate(SIZE / 2, SIZE / 2);

  function polygon(ink, points) {
    g.fillStyle = ink;
    g.beginPath();
    points.forEach(([x, y], i) => i ? g.lineTo(x, y) : g.moveTo(x, y));
    g.closePath();
    g.fill();
  }

  const field = g.createLinearGradient(-10, -11, 10, 11);
  field.addColorStop(0, '#b4f1f6');
  field.addColorStop(0.48, '#ebfaf3');
  field.addColorStop(1, '#ffe2c7');
  g.fillStyle = field;
  g.fillRect(-11, -11, 22, 22);

  // Mirrored screen-printed banks wrap the wide, light central sightline.
  for (const [turn, dark, bright, highlight] of [
    [0, '#1546b7', '#008be5', '#14e2cf'],
    [Math.PI, '#ad2058', '#ff4b50', '#ffa924'],
  ]) {
    g.save();
    g.rotate(turn);
    polygon(bright, [[-11,-11],[11,-11],[11,-8.7],[7.8,-8.7],[6.3,-9.65],[-1.9,-9.65],[-4.4,-8],[-8.4,-8],[-8.4,-5.4],[-10,-3.6],[-10,3],[-11,4.2]]);
    polygon(dark, [[-11,-11],[11,-11],[11,-10.55],[-2,-10.55],[-4.9,-8.82],[-9.1,-8.82],[-9.1,-5.7],[-10.65,-3.85],[-10.65,3.5],[-11,4]]);
    polygon(highlight, [[-8.52,-7.78],[-4.45,-7.78],[-1.8,-9.44],[3.1,-9.44],[2.64,-9.08],[-1.7,-9.08],[-4.31,-7.42],[-8.52,-7.42]]);
    for (let i = 0; i < 5; i++) {
      const x = 6.1 + i * 0.58;
      polygon('#fff2c9', [[x,-10.4],[x+.34,-10.4],[x-.06,-9.89],[x-.4,-9.89]]);
    }
    g.restore();
  }

  g.lineWidth = .018;
  g.strokeStyle = 'rgba(28,70,104,.24)';
  g.beginPath();
  for (let line = -10; line <= 10; line++) {
    g.moveTo(line,-11); g.lineTo(line,11);
    g.moveTo(-11,line); g.lineTo(11,line);
  }
  g.stroke();
  g.strokeStyle = 'rgba(255,255,255,.72)';
  g.lineWidth = .046;
  g.strokeRect(-10.63,-10.63,21.26,21.26);

  g.strokeStyle = '#67a5b9';
  g.setLineDash([.35,.28]);
  g.beginPath();
  g.moveTo(-9.65,0); g.lineTo(-2.52,0);
  g.moveTo(2.52,0); g.lineTo(9.65,0);
  g.stroke();
  g.setLineDash([]);
  for (const [start, ink] of [[0,'#e64766'],[Math.PI,'#087dc8']]) {
    g.lineWidth = .13;
    g.strokeStyle = ink;
    g.beginPath(); g.arc(0, 0, 2.45, start + .045, start + Math.PI - .045); g.stroke();
    g.lineWidth = .045;
    g.beginPath(); g.arc(0, 0, 2.26, start + .1, start + Math.PI - .1); g.stroke();
  }
  g.save();
  g.rotate(-.15);
  g.textAlign = 'center';
  g.textBaseline = 'middle';
  g.font = 'italic 900 .76px Arial, sans-serif';
  g.strokeStyle = '#fffbea';
  g.lineWidth = .13;
  g.strokeText('TOYBOX', 0, .04);
  g.fillStyle = '#174a83';
  g.fillText('TOYBOX', 0, .04);
  polygon('#ffc026', [[-.99,.48],[.91,.48],[.59,.62],[-1.13,.62]]);
  g.restore();
  return surface;
}
