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
      ui, render, openCamera,
      setStage(stage) {
        mode = 'join'; pin = '12345'; token = 'student-token';
        state = { pin, role: 'student', phase: 'active', scene: 2,
          me: { name: 'Reader', q: stage === 'hunt' || stage === 'star' ? 10 : 2, stage, completed: 2, discoveries: [] },
          discovery: { name: 'Damp cloth', action: 'Inspect the damp surface' },
          journal: [], dialogueHistory: [] };
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
  assert.doesNotMatch(h.app.innerHTML, /<video|Open rear camera|Point your camera/);
  await h.control.openCamera();
  assert.equal(h.cameraRequests(), 0);
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
  assert.match(h.app.innerHTML, /Ha ha! You found the decoy!/);
  assert.doesNotMatch(h.app.innerHTML, /scan-frame|decoy-modal|modal-backdrop/);
  h.control.ui.decoy = false;
  h.control.setStage('star');
  assert.match(h.app.innerHTML, /glass-star/);
});
