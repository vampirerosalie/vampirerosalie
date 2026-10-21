import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { randomUUID } from 'node:crypto';
import vm from 'node:vm';

const source = readFileSync(new URL('../../public/battle10/app.js', import.meta.url), 'utf8');

function frontend() {
  const app = { innerHTML: '', addEventListener() {} };
  const announcer = { textContent: '' };
  let cameraRequests = 0;
  const document = { getElementById(id) { return id === 'app' ? app : id === 'announcer' ? announcer : null; }, addEventListener() {} };
  const window = { addEventListener() {}, scrollTo() {} };
  window.parent = window;
  const context = vm.createContext({
    document, window, navigator: { onLine: true, mediaDevices: { async getUserMedia() { cameraRequests++; return { getTracks: () => [] }; } } },
    location: { origin: 'https://example.test', search: '' }, history: { replaceState() {} }, URLSearchParams,
    localStorage: { getItem() { return null; }, setItem() {}, removeItem() {} },
    sessionStorage: { getItem() { return null; }, setItem() {} },
    crypto: { randomUUID }, setInterval() {}, setTimeout() {}, clearTimeout() {},
    requestAnimationFrame() { return 0; }, cancelAnimationFrame() {}, AbortController,
  });
  vm.runInContext(source.slice(0, source.lastIndexOf('initialRoute();')) + `
    globalThis.frontend = {
      ui, render, openCamera, signature,
      setStage(stage, dialogue) {
        mode = 'join'; pin = '12345'; token = 'student-token';
        state = { pin, role: 'student', phase: 'active', scene: 2,
          me: { name: 'Reader', q: stage === 'hunt' || stage === 'star' ? 10 : 2, stage, completed: 2, discoveries: [] },
          discovery: { name: 'Damp cloth', action: 'Inspect the damp surface' },
          journal: [], dialogueHistory: [], dialogue };
        render();
      },
      setHost(phase = 'active', extra = {}) {
        mode = 'host'; pin = '12345'; token = 'host-token';
        state = { pin, role: 'host', phase, joinedCount: 2, onlineCount: 2, students: [
          { id: 'a', name: 'First', q: 3, completed: 2, discoveries: 2, status: 'Answering', online: true },
          { id: 'b', name: 'Second', q: 1, completed: 0, discoveries: 0, status: 'Story dialogue', online: true },
        ], ...extra };
        render();
      }
    };
  `, context);
  return { app, control: context.frontend, cameraRequests: () => cameraRequests };
}

test('questions 1–9 show a collectible illustrated clue without requesting a camera', async () => {
  const h = frontend();
  h.control.setStage('camera');
  assert.match(h.app.innerHTML, /Damp cloth/);
  assert.match(h.app.innerHTML, /data-action="collect"/);
  assert.match(h.app.innerHTML, /class="discovery-art"/);
  assert.match(h.app.innerHTML, /assets\/evidence-2\.png/);
  assert.doesNotMatch(h.app.innerHTML, /evidence\.webp/);
  assert.doesNotMatch(h.app.innerHTML, /<video|Open rear camera|Point your camera/);
  await h.control.openCamera();
  assert.equal(h.cameraRequests(), 0);
});
test('teacher can show the same join QR during play, but not after ending', () => {
  const h = frontend(); h.control.setHost();
  assert.match(h.app.innerHTML, /Show join QR.*⛶ Full screen/s);
  h.control.ui.modal = 'join-qr'; h.control.render();
  assert.match(h.app.innerHTML, /\/api\/lantern\/rooms\/12345\/qr\.svg/);
  assert.match(h.app.innerHTML, /Copy student link/);
  assert.match(h.app.innerHTML, /2 \/ 40 investigators joined/);
  h.control.setHost('ended');
  assert.doesNotMatch(h.app.innerHTML, /Show join QR|join-qr-image/);
});

test('teacher print panel explains one-time printing and fixed roles without exposing the key on the cards', () => {
  const h = frontend(); h.control.setHost();
  h.control.ui.seals = { genuineCard: 'A', genuine: { code: 'GENUINE', svg: '<svg></svg>' }, decoy: { code: 'DECOY', svg: '<svg></svg>' } };
  h.control.ui.modal = 'seals'; h.control.render();
  assert.match(h.app.innerHTML, /reuse them for every new Battle 10 game/);
  assert.match(h.app.innerHTML, /Only the joining QR changes/);
  assert.match(h.app.innerHTML, /Their roles stay the same in every game/);
  const cards = h.app.innerHTML.match(/<article class="seal-card">.*?<\/article>/g);
  assert.equal(cards.length, 2);
  for (const card of cards) assert.doesNotMatch(card, /Private key|is genuine|is the decoy/);
});
test('finished student scene shows Lina and Rafi without Mara', () => {
  const h = frontend(); h.control.setStage('complete');
  assert.match(h.app.innerHTML, /character lina/);
  assert.match(h.app.innerHTML, /character rafi/);
  assert.doesNotMatch(h.app.innerHTML, /character mara/);
});
test('both ending dialogue lines show Lina and Rafi without Mara', () => {
  const h = frontend();
  for (const dialogue of [['Lina', 'We found it!'], ['Rafi', 'Let’s bring the light back!']]) {
    h.control.setStage('ending', dialogue);
    assert.match(h.app.innerHTML, /character lina/);
    assert.match(h.app.innerHTML, /character rafi/);
    assert.doesNotMatch(h.app.innerHTML, /character mara/);
  }
});
test('all nine clean clue images and the wide teacher finale image are included', () => {
  for (let number = 1; number <= 9; number++) {
    const image = readFileSync(new URL(`../../public/battle10/assets/evidence-${number}.png`, import.meta.url));
    assert.equal(image.subarray(0, 8).toString('hex'), '89504e470d0a1a0a');
  }
  const wide = readFileSync(new URL('../../public/battle10/assets/dashboard-finale-wide.png', import.meta.url));
  assert.equal(wide.subarray(0, 8).toString('hex'), '89504e470d0a1a0a');
  const css = readFileSync(new URL('../../public/battle10/scene-fix.css', import.meta.url), 'utf8');
  assert.match(css, /\.dashboard-hero\.scene-4\{background-image:url\('\.\/assets\/dashboard-finale-wide\.png'\)/);
});

test('the final hunt retains camera scanning and shows the decoy as an in-camera object', async () => {
  const h = frontend();
  h.control.setStage('hunt');
  assert.match(h.app.innerHTML, /<video id="camera-video"/);
  assert.match(h.app.innerHTML, /scan-frame/);
  await h.control.openCamera();
  assert.equal(h.cameraRequests(), 1);
  h.control.ui.decoy = true;
  h.control.render();
  assert.match(h.app.innerHTML, /decoy-card/);
  assert.match(h.app.innerHTML, /decoy-object/);
  assert.match(h.app.innerHTML, /Ha ha, this is not the real one\. Go find again\./);
  assert.doesNotMatch(h.app.innerHTML, /You found the decoy|A decoy is harmless/);
  assert.doesNotMatch(h.app.innerHTML, /scan-frame|decoy-modal|modal-backdrop/);
  h.control.ui.decoy = false;
  h.control.setStage('star');
  assert.match(h.app.innerHTML, /glass-star/);
});

test('teacher winner panel shows safe name and elapsed time in active and ended games', () => {
  const h = frontend();
  h.control.setHost();
  assert.match(h.app.innerHTML, /Who will find it first/);
  const winner = { name: '<Reader & One>', playerId: 'a', elapsedMs: 125999 };
  const before = h.control.signature({ phase: 'active', students: [] });
  const after = h.control.signature({ phase: 'active', students: [], winner });
  assert.notEqual(before, after, 'winner-only changes trigger dashboard redraw');
  for (const phase of ['active', 'ended']) {
    h.control.setHost(phase, { winner });
    assert.match(h.app.innerHTML, /WINNER · FIRST TO FIND THE REAL SEAL/);
    assert.match(h.app.innerHTML, /&lt;Reader &amp; One&gt;/);
    assert.match(h.app.innerHTML, /2 min 05 sec/);
    assert.match(h.app.innerHTML, /Everyone else can keep playing/);
  }
  h.control.setHost('ended');
  assert.match(h.app.innerHTML, /No winner this time/);
  h.control.setHost('active', { winnerUnavailable: true });
  assert.match(h.app.innerHTML, /Winner not recorded for this older game/);
  h.control.setHost('active', { winner: { ...winner, elapsedMs: null } });
  assert.doesNotMatch(h.app.innerHTML, /winner-time|NaN/);
});
