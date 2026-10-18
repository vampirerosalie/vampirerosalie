import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import { readFileSync } from 'node:fs';

const source = readFileSync(new URL('../../public/battle10/music.js', import.meta.url), 'utf8');
const appSource = readFileSync(new URL('../../public/battle10/app.js', import.meta.url), 'utf8');

function setup() {
  const sounds = [], saved = new Map(), listeners = {};
  const element = () => ({
    events: {}, attributes: {}, textContent: '', value: '', parentNode: null, parts: {},
    addEventListener(name, handler) { this.events[name] = handler; },
    setAttribute(name, value) { this.attributes[name] = value; },
    appendChild(child) { child.parentNode = this; this.child = child; },
    remove() { this.parentNode = null; },
    querySelector(selector) { return this.parts[selector] ??= element(); },
  });
  const panel = element(), slot = element();
  class Audio {
    constructor() { this.paused = true; this.currentTime = 0; this.events = {}; this.plays = 0; sounds.push(this); }
    addEventListener(name, handler) { this.events[name] = handler; }
    play() { this.plays++; if (this.reject) return Promise.reject(Error('Blocked')); this.paused = false; return this.defer || Promise.resolve(); }
    pause() { this.paused = true; }
    load() { this.loads = (this.loads || 0) + 1; }
  }
  const context = vm.createContext({
    Audio, document: { createElement: () => panel },
    localStorage: { getItem: key => saved.get(key) ?? null, setItem: (key, value) => saved.set(key, value) },
    window: { addEventListener: (name, handler) => { listeners[name] = handler; } },
  });
  vm.runInContext(source, context);
  const update = (extra = {}) => context.window.LanternMusic.update({ teacher: true, phase: 'lobby', pin: '12345', slot, ...extra });
  const press = async () => { panel.parts.button.events.click(); await new Promise(resolve => setImmediate(resolve)); };
  return { sounds, saved, panel, slot, listeners, update, press };
}

test('teacher-only music starts off and downloads audio only after Play', async () => {
  const s = setup();
  s.update({ teacher: false });
  assert.equal(s.sounds.length, 0); assert.equal(s.slot.child, undefined);
  s.update();
  assert.equal(s.panel.parts.button.textContent, 'Play music'); assert.equal(s.sounds.length, 0);
  await s.press();
  assert.equal(s.sounds.length, 1);
  assert.equal(s.sounds[0].src, '/battle10/assets/lantern-house-theme.wav');
  assert.equal(s.sounds[0].preload, 'none'); assert.equal(s.sounds[0].loop, true);
  assert.equal(s.sounds[0].volume, 0.18);
  assert.match(appSource, /mode === 'host' && state\?\.role === 'host' && state\.phase !== 'ended' \? '<div id="teacher-music-slot/);
});

test('music survives teacher screen redraws; volume and pause are local', async () => {
  const s = setup(); s.update(); await s.press();
  const audio = s.sounds[0]; audio.currentTime = 8;
  s.update(); s.update({ phase: 'active' });
  assert.equal(audio.plays, 1); assert.equal(audio.currentTime, 8);
  s.panel.parts.input.value = '40'; s.panel.parts.input.events.input();
  assert.equal(audio.volume, 0.4); assert.equal(s.saved.get('lantern-keeper:music-volume'), '0.4');
  await s.press(); assert.equal(audio.paused, true); assert.equal(audio.currentTime, 8);
  await s.press(); assert.equal(audio.paused, false); assert.equal(audio.currentTime, 8);
});

test('ending, changing rooms, and leaving stop teacher music', async () => {
  const s = setup(); s.update(); await s.press();
  const audio = s.sounds[0];
  s.update({ phase: 'ended' });
  assert.equal(audio.paused, true); assert.equal(audio.currentTime, 0); assert.equal(s.panel.parentNode, null);
  s.update({ pin: '54321' }); assert.equal(audio.paused, true);
  await s.press(); s.update({ teacher: false }); assert.equal(audio.paused, true);
  s.update(); await s.press(); s.listeners.pagehide(); assert.equal(audio.paused, true);
});

test('music errors never call the game API and remain retryable', async () => {
  const s = setup(); s.update(); await s.press();
  const audio = s.sounds[0]; audio.events.error();
  assert.equal(audio.paused, true);
  assert.match(s.panel.parts['.lantern-music-status'].textContent, /game continues/);
  await s.press(); assert.equal(audio.loads, 1);
  await s.press(); audio.reject = true; await s.press();
  assert.match(s.panel.parts['.lantern-music-status'].textContent, /game is unaffected/);
  assert.doesNotMatch(source, /fetch\(|WebSocket|api\/|sendAction|setInterval|setTimeout/);
});

test('Battle 10 has its own playable instrumental file, separate from Battle 9', () => {
  const lantern = readFileSync(new URL('../../public/battle10/assets/lantern-house-theme.wav', import.meta.url));
  const market = readFileSync(new URL('../../public/battle9/assets/violet-market.wav', import.meta.url));
  assert.equal(lantern.toString('ascii', 0, 4), 'RIFF');
  assert.equal(lantern.toString('ascii', 8, 12), 'WAVE');
  assert.equal(lantern.readUInt16LE(20), 1); // PCM
  assert.equal(lantern.readUInt16LE(22), 1); // mono
  assert.equal(lantern.readUInt16LE(34), 16);
  assert.ok(lantern.length > 100000);
  assert.equal(lantern.equals(market), false);
  let peak = 0, energy = 0;
  for (let i = 44; i < lantern.length; i += 2) {
    const sample = lantern.readInt16LE(i) / 32768;
    peak = Math.max(peak, Math.abs(sample));
    energy += sample * sample;
  }
  assert.ok(peak < 0.9 && Math.sqrt(energy / ((lantern.length - 44) / 2)) > 0.02);
  assert.ok(Math.abs(lantern.readInt16LE(44) - lantern.readInt16LE(lantern.length - 2)) < 150);
});
