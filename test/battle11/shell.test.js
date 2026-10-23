import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import vm from 'node:vm';
import ts from 'typescript';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';

const require = createRequire(import.meta.url);
function component(file, overrides = {}) {
  const source = readFileSync(new URL(`../../app/${file}`, import.meta.url), 'utf8');
  const code = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS, jsx: ts.JsxEmit.ReactJSX, target: ts.ScriptTarget.ES2022 } }).outputText;
  const exports = {};
  vm.runInNewContext(code, { exports, require: name => name === 'react' && overrides.react ? overrides.react : require(name), window: overrides.window });
  return exports;
}

test('one shared menu renders all twelve battles including the default teacher menu', () => {
  const { BattleTabs, BATTLE_CHOICES } = component('battle-tabs.tsx');
  assert.deepEqual(Array.from(BATTLE_CHOICES, row => row[0]), [1,2,3,4,5,6,7,8,9,10,11,12]);
  for (const selected of [1, 7, 11, 12]) {
    let clicked;
    const element = BattleTabs({ selected, onSelect: battle => { clicked = battle; } });
    const html = renderToStaticMarkup(element);
    assert.equal((html.match(/role="tab"/g) || []).length, 12);
    assert.match(html, /BATTLE 12/); assert.match(html, /Treasure Raid/);
    assert.match(html, /BATTLE 11/); assert.match(html, /The Missing Museum Jewel/);
    element.props.children[10].props.onClick(); assert.equal(clicked, 11);
  }
  const page = readFileSync(new URL('../../app/page.tsx', import.meta.url), 'utf8');
  assert.equal((page.match(/<BattleTabs /g) || []).length, 3);
  assert.doesNotMatch(page, /BATTLE_CHOICES|className="battle-tabs"/);
  assert.match(page, /isMuseum \? <MuseumFrame frameRef=\{frameRef\}/);
  assert.match(page, /isMuseum \|\| \['lobby', 'finished', 'ended'\]\.includes\(standaloneStatus\.phase\)/);
});

function frameHarness() {
  const states = [], effects = [], timers = new Map(), listeners = new Set();
  let cursor = 0, effectCursor = 0, timerId = 0;
  const fakeWindow = { location: { origin: 'https://example.test' },
    addEventListener(type, listener) { if (type === 'message') listeners.add(listener); },
    removeEventListener(type, listener) { listeners.delete(listener); },
    setTimeout(callback, ms) { assert.equal(ms, 12000); timers.set(++timerId, callback); return timerId; },
    clearTimeout(id) { timers.delete(id); } };
  const hooks = {
    useState(initial) { const index = cursor++; if (!(index in states)) states[index] = initial;
      return [states[index], value => { states[index] = typeof value === 'function' ? value(states[index]) : value; }]; },
    useEffect(callback, deps) { const index = effectCursor++, previous = effects[index];
      if (!previous || deps.some((dep, i) => dep !== previous.deps[i])) {
        previous?.cleanup?.(); effects[index] = { deps, cleanup: callback() };
      }
    },
  };
  const { MuseumFrame } = component('museum-frame.tsx', { react: hooks, window: fakeWindow });
  const frameRef = { current: { contentWindow: {}, contentDocument: { getElementById: () => null } } };
  return { frameRef,
    render() { cursor = 0; effectCursor = 0; return MuseumFrame({ frameRef }); },
    expire() { for (const callback of [...timers.values()]) callback(); timers.clear(); },
    message(data, origin = fakeWindow.location.origin, source = frameRef.current.contentWindow) { for (const listener of listeners) listener({ data, origin, source }); },
    cleanup() { for (const effect of effects) effect.cleanup?.(); }, timers, listeners,
  };
}
const html = element => renderToStaticMarkup(element);

test('blank iframe retains loading status, offers retry after timeout, and retries without making a new room', () => {
  const h = frameHarness(); let view = h.render();
  assert.match(html(view), /Opening Battle 11/);
  const firstFrame = view.props.children[1]; assert.equal(firstFrame.props.src, '/battle11/?teacher=1');
  firstFrame.props.onLoad(); assert.match(html(h.render()), /Opening Battle 11/);
  h.expire(); view = h.render(); assert.match(html(view), /taking longer/);
  assert.match(html(view), /Retry Battle 11/); assert.match(html(view), /Open Battle 11 directly/);
  view.props.children[0].props.children[2].props.children[0].props.onClick();
  view = h.render(); assert.match(html(view), /Opening Battle 11/);
  assert.notEqual(view.props.children[1].key, firstFrame.key);
  assert.equal(view.props.children[1].props.src, firstFrame.props.src);
  assert.equal(h.timers.size, 1); h.cleanup(); assert.equal(h.listeners.size, 0); assert.equal(h.timers.size, 0);
});

test('only this game frame or an actually rendered app clears loading; a ready frame stays ready', () => {
  const h = frameHarness(); h.render();
  h.message({ type: 'museum-jewel:status' }, 'https://wrong.test');
  h.message({ type: 'museum-jewel:status' }, undefined, {});
  h.message({ type: 'black-market:status' });
  assert.match(html(h.render()), /Opening Battle 11/);
  h.message({ type: 'museum-jewel:status' }); h.expire();
  assert.doesNotMatch(html(h.render()), /Opening Battle 11|Retry Battle 11/); h.cleanup();
  const second = frameHarness(); const view = second.render();
  second.frameRef.current.contentDocument.getElementById = id => id === 'app' ? { childElementCount: 1 } : null;
  view.props.children[1].props.onLoad(); assert.doesNotMatch(html(second.render()), /Opening Battle 11/); second.cleanup();
});

test('load errors expose recovery instead of a blank panel', () => {
  const h = frameHarness(); h.render().props.children[1].props.onError();
  assert.match(html(h.render()), /Retry Battle 11/); h.cleanup();
});
