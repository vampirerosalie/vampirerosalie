import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { randomUUID } from 'node:crypto';
import vm from 'node:vm';
import QRCode from 'qrcode';
import jsQR from 'jsqr';
import { LanternGame, sealPayload } from '../../app/battle10/core/game.js';
import { QUESTIONS } from '../../app/battle10/data.js';

const source = readFileSync(new URL('../../public/battle10/app.js', import.meta.url), 'utf8');
const scanSource = source.slice(source.indexOf('function scanLoop()'), source.indexOf('async function showSeals()'));

// Run the production scanner with QR pixels and the real decoder; only video
// capture and animation scheduling are simulated (not a physical-phone test).
function scanner(pin, onScan = () => {}) {
  let now = 1000, pixels, width = 1;
  const sent = [];
  const video = { readyState: 2, videoWidth: 1, videoHeight: 1 };
  const context = vm.createContext({
    pin, media: {}, state: { me: { stage: 'hunt' } }, pending: null,
    ui: { decoy: false, lastScan: '', sealAbsentSince: 0 }, lastDecode: 0, scanFrame: 0,
    Date: { now: () => now }, window: { jsQR }, requestAnimationFrame: () => 1,
    document: { getElementById: () => video, createElement: () => ({
      getContext: () => ({ drawImage() {}, getImageData: () => ({ data: pixels }) }),
    }) },
    sendAction(type, body) { sent.push(body.code); onScan(type, body); },
  });
  vm.runInContext(scanSource, context);
  return { sent, context, frame(payload) {
    now += 300;
    const qr = payload ? QRCode.create(payload, { errorCorrectionLevel: 'M' }) : null;
    const scale = 5, margin = 4;
    width = ((qr?.modules.size || 21) + margin * 2) * scale;
    pixels = new Uint8ClampedArray(width * width * 4);
    for (let y = 0; y < width; y++) for (let x = 0; x < width; x++) {
      const mx = Math.floor(x / scale) - margin, my = Math.floor(y / scale) - margin;
      const dark = qr && mx >= 0 && my >= 0 && mx < qr.modules.size && my < qr.modules.size && qr.modules.get(mx, my);
      const i = (y * width + x) * 4;
      pixels[i] = pixels[i + 1] = pixels[i + 2] = dark ? 0 : 255; pixels[i + 3] = 255;
    }
    video.videoWidth = video.videoHeight = width;
    vm.runInContext('scanLoop()', context);
  } };
}

test('actual scanner decodes the same permanent cards in two new rooms and server applies the correct role', () => {
  const game = new LanternGame();
  let printed;
  for (let run = 0; run < 2; run++) {
    const host = game.create();
    const student = game.join(host.pin, { clientId: randomUUID(), name: `Scanner QA ${run}` });
    const act = (token, type, extra = {}) => game.action(host.pin, token, { type, requestId: randomUUID(), ...extra });
    const view = () => game.state(host.pin, student.playerToken);
    const cards = game.sealCards(host.pin, host.hostToken);
    const payloads = [sealPayload(cards.decoy), sealPayload(cards.genuine)];
    if (printed) assert.deepEqual(payloads, printed); else printed = payloads;
    act(host.hostToken, 'host:start');
    const dialogue = () => {
      while (['dialogue', 'hunt-dialogue'].includes(view().me.stage)) act(student.playerToken, 'student:dialogue-next');
      if (view().me.stage === 'reading') act(student.playerToken, 'student:begin-questions');
    };
    for (let q = 1; q <= 10; q++) {
      dialogue();
      act(student.playerToken, 'student:submit', { questionNumber: q, answer: QUESTIONS[q - 1].answers[0] });
      act(student.playerToken, 'student:discover');
      if (q < 10) act(student.playerToken, 'student:collect'); else dialogue();
    }
    const results = [];
    const scan = scanner(host.pin, (type, body) => results.push(act(student.playerToken, type, body).result));
    scan.frame(printed[0]); assert.equal(results[0].decoy, true);
    assert.equal(view().me.stage, 'hunt');
    scan.frame(printed[0]); assert.equal(results.length, 1, 'held QR does not send duplicate actions');
    scan.frame(null); scan.frame(null); scan.frame(null);
    scan.frame(printed[0]); assert.equal(results[1].decoy, true, 'same decoy can be scanned again');
    assert.equal(results[1].first, false);
    scan.frame(printed[1]); assert.equal(results[2].genuine, true);
    assert.equal(view().me.stage, 'star');
    act(student.playerToken, 'student:star');
    assert.equal(view().me.discoveries.length, 10);
    act(host.hostToken, 'host:end');
  }
});

test('scanner retains own-room legacy cards and ignores other-room, unrelated and malformed codes', () => {
  const scan = scanner('12345');
  for (const payload of ['LK1|99999|OLDGENUINE12', 'https://example.test/', 'LK2|S|SHORT', 'LK2|S|N7QK2M8R4V6H|extra']) scan.frame(payload);
  assert.equal(scan.sent.length, 0);
  scan.frame('LK1|12345|OLDGENUINE12');
  assert.deepEqual(scan.sent, ['LK1|12345|OLDGENUINE12']);
});

test('scanner does not submit while outside the hunt, awaiting a response or showing the decoy', () => {
  for (const blocked of ['stage', 'pending', 'decoy']) {
    const scan = scanner('12345');
    if (blocked === 'stage') scan.context.state.me.stage = 'question';
    if (blocked === 'pending') scan.context.pending = {};
    if (blocked === 'decoy') scan.context.ui.decoy = true;
    scan.frame('LK2|S|N7QK2M8R4V6H');
    assert.equal(scan.sent.length, 0);
  }
});
