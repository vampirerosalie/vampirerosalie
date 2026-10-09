import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import vm from 'node:vm';
import ts from 'typescript';
import * as routing from '../../app/battle7-route.js';

// Deterministic hook/event harness. This verifies shell wiring, not browser layout.
const source = readFileSync(new URL('../../app/page.tsx', import.meta.url), 'utf8');
const shell = source.slice(source.indexOf('const BATTLE_CHOICES'));
const compiled = ts.transpileModule(shell, { compilerOptions: { jsx: ts.JsxEmit.ReactJSX, module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 } }).outputText;
function harness({ search = '', session = new Map(), local = new Map() } = {}) {
  const events = new Map(), hooks = [], pending = [], redirects = [];
  let index = 0, dirty = true, tree;
  const iframe = { contentWindow: { location: { replace: path => redirects.push(path) } } };
  const location = { origin: 'https://school.test', search };
  const history = { state: {}, replaceState(state, _title, path) { this.state = state; location.search = path.slice(path.indexOf('?')); } };
  const storage = map => ({ getItem: key => map.get(key) ?? null, setItem: (key, value) => map.set(key, value) });
  const window = { location, history, sessionStorage: storage(session), localStorage: storage(local), QRCode() {}, addEventListener: (event, fn) => events.set(event, fn), removeEventListener: event => events.delete(event) };
  const document = { addEventListener() {}, removeEventListener() {}, fullscreenElement: null, documentElement: {} };
  const jsx = (type, props) => ({ type, props });
  function useState(initial) { const key = index++; if (!(key in hooks)) hooks[key] = typeof initial === 'function' ? initial() : initial; return [hooks[key], value => { const next = typeof value === 'function' ? value(hooks[key]) : value; if (next !== hooks[key]) { hooks[key] = next; dirty = true; } }]; }
  function useRef(initial) { const key = index++; return hooks[key] ??= { current: initial }; }
  function useEffect(fn, deps) { const key = index++; if (!hooks[key] || deps.some((value, i) => value !== hooks[key][i])) { hooks[key] = deps; pending.push(fn); } }
  const context = vm.createContext({ ...routing, window, document, useState, useRef, useEffect, URLSearchParams, exports: {}, require: () => ({ jsx, jsxs: jsx }), TeacherGame() {}, StudentGame() {} });
  vm.runInContext(compiled, context);
  function visit(node, callback) { if (!node || typeof node !== 'object') return; if (Array.isArray(node)) { node.forEach(child => visit(child, callback)); return; } callback(node); visit(node.props?.children, callback); }
  function render() { for (let cycles = 0; dirty && cycles < 20; cycles++) { dirty = false; index = 0; tree = context.exports.default(); visit(tree, node => { if (node.type === 'iframe' && node.props.ref) node.props.ref.current = iframe; }); while (pending.length) pending.shift()(); } assert.equal(dirty, false, 'Shell should settle without a render loop'); return tree; }
  function message(data, { origin = location.origin, source = iframe.contentWindow } = {}) { events.get('message')?.({ origin, source, data }); return render(); }
  function go(search, event = 'popstate') { location.search = search; events.get(event)?.({ persisted: true }); return render(); }
  function frame() { let result; visit(tree, node => { if (node.type === 'iframe') result = node; }); return result; }
  render();
  return { render, message, go, frame, session, location, history, redirects, get tree() { return tree; } };
}

test('shell mounts only the student iframe on join, root/back/pageshow and a fresh reload', () => {
  const session = new Map(), h = harness({ search: '?battle=7&join=12345', session });
  assert.equal(h.tree.type, 'iframe');
  assert.equal(h.frame().props.src, '/battle7/index.html?battle=7&join=12345');
  assert.deepEqual(JSON.parse(session.get(routing.STUDENT_ROUTE_KEY)), { battle: 7, room: '12345' });
  for (const search of ['', '?battle=7&host=54321', '?battle=3&teacher=1']) {
    h.go(search);
    assert.equal(h.tree.type, 'iframe');
    assert.equal(h.location.search, '?battle=7&join=12345');
  }
  h.go('', 'pageshow');
  assert.equal(h.tree.type, 'iframe');
  const reloaded = harness({ session });
  assert.equal(reloaded.tree.type, 'iframe');
  assert.equal(reloaded.location.search, '?battle=7&join=12345');
});

test('a teacher in an independent tab is unaffected by the student session marker', () => {
  const pupil = harness({ search: '?battle=7&join=12345' });
  const teacher = harness({ search: '?battle=7&teacher=1' });
  assert.equal(pupil.tree.type, 'iframe');
  assert.equal(teacher.tree.type, 'main');
  assert.equal(teacher.session.has(routing.STUDENT_ROUTE_KEY), false);
});

test('shell navigation messages verify exact iframe source and origin', () => {
  const h = harness({ search: '?battle=7&join=12345' });
  const navigation = { type: 'crazy-kitchen:navigate', search: '?join=54321' };
  h.message(navigation, { origin: 'https://attacker.test' });
  h.message(navigation, { source: {} });
  assert.equal(h.location.search, '?battle=7&join=12345');
  h.message(navigation);
  assert.equal(h.location.search, '?battle=7&join=54321');
  assert.equal(h.frame().props.src, '/battle7/index.html?battle=7&join=12345', 'Mirroring the child URL must not reload the child');
  assert.equal(JSON.parse(h.session.get(routing.STUDENT_ROUTE_KEY)).room, '54321');
});

test('cross-role and malformed iframe navigation restore the student frame', () => {
  const local = new Map([['crazy-kitchen:host:54321', 'a'.repeat(64)]]);
  const h = harness({ search: '?battle=7&join=12345', local });
  for (const search of ['?host=54321', '?screen=54321', '?teacher=1', '?join=12x345', '?join=12345&host=54321']) {
    h.message({ type: 'crazy-kitchen:navigate', search });
    assert.equal(h.location.search, '?battle=7&join=12345');
    assert.equal(h.tree.type, 'iframe');
  }
  assert.equal(h.redirects.length, 5);
  assert.ok(h.redirects.every(path => path === '/battle7/index.html?battle=7&join=12345'));
});

test('student PIN entry remains student-only across root and future joins', () => {
  const h = harness({ search: '?battle=7&join=12345' });
  h.message({ type: 'crazy-kitchen:navigate', search: '?student=1' });
  assert.equal(JSON.parse(h.session.get(routing.STUDENT_ROUTE_KEY)).room, '');
  h.go('');
  assert.equal(h.location.search, '?battle=7&student=1');
  assert.equal(h.tree.type, 'iframe');
  h.message({ type: 'crazy-kitchen:navigate', search: '?join=54321' });
  h.go('');
  assert.equal(h.location.search, '?battle=7&join=54321');
});

test('teacher status and history updates do not reset the iframe source', () => {
  const local = new Map([['crazy-kitchen:host:54321', 'a'.repeat(64)]]);
  const h = harness({ search: '?battle=7&teacher=1', local });
  const initialSrc = h.frame().props.src;
  h.message({ type: 'crazy-kitchen:navigate', search: '?host=54321' });
  assert.equal(h.location.search, '?battle=7&host=54321');
  for (const phase of ['lobby', 'question', 'reveal', 'finished', 'closed']) {
    h.message({ type: 'crazy-kitchen:status', pin: '54321', phase, onlineCount: 2 });
    assert.equal(h.frame().props.src, initialSrc);
    assert.equal(h.tree.type, 'main');
  }
  assert.equal(h.redirects.length, 0);
});
