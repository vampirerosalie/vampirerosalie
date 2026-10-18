const app = document.getElementById('app');
const apiBase = '/api/lantern/rooms';
const storage = {
  get(key) { try { return localStorage.getItem(key); } catch { return null; } },
  set(key, value) { try { localStorage.setItem(key, value); } catch {} },
  remove(key) { try { localStorage.removeItem(key); } catch {} },
};
const session = {
  get(key) { try { return sessionStorage.getItem(key); } catch { return null; } },
  set(key, value) { try { sessionStorage.setItem(key, value); } catch {} },
};
const esc = value => String(value ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);
const uid = () => crypto.randomUUID();
const btn = (label, action, cls = 'button', attrs = '') => `<button type="button" class="${cls}" data-action="${action}" ${attrs}>${label}</button>`;
const hostKey = room => `lantern-keeper:host:${room}`;
const playerKey = room => `lantern-keeper:player:${room}`;
const pendingKey = room => `lantern-keeper:pending:${room}`;
const joinKey = room => `lantern-keeper:pending-join:${room}`;
const studentMarker = 'lantern-keeper:student-route';
const scene = (number, cls = '') => `<div class="scene scene-${Math.max(0, Math.min(4, number))} ${cls}"></div>`;
const evidence = number => `<span class="evidence" style="--object-x:${((number - 1) % 3) * 50}%;--object-y:${Math.floor((number - 1) / 3) * 50}%" aria-hidden="true"></span>`;
const saved = key => { try { return JSON.parse(storage.get(key) || 'null'); } catch { return null; } };

let mode = 'home', pin = '', token = '', state = null, pending = null, pendingJoin = null;
let generation = 0, pollInFlight = false, actionInFlight = false, joinInFlight = false, lastPoll = 0, lastAction = 0, lastJoin = 0;
let media = null, scanFrame = 0, lastDecode = 0;
const ui = { online: navigator.onLine, busy: false, error: '', notice: '', modal: '', seals: null, name: '', entryPin: '', answer: '',
  feedback: '', cameraError: '', decoy: false, lastScan: '', sealAbsentSince: 0, readerPage: 1, signature: '', replay: 0 };

async function api(path, body, auth = token) {
  const controller = new AbortController(), timeout = setTimeout(() => controller.abort(), 12000);
  try {
    const response = await fetch(path, { method: body ? 'POST' : 'GET', cache: 'no-store', signal: controller.signal,
      headers: { ...(body ? { 'Content-Type': 'application/json' } : {}), ...(auth ? { Authorization: `Bearer ${auth}` } : {}) },
      body: body ? JSON.stringify(body) : undefined });
    let data; try { data = await response.json(); } catch { throw new Error('The room server returned an unexpected response.'); }
    if (!response.ok) { const error = new Error(data.error || 'That action could not be completed.'); error.status = response.status; error.code = data.code; throw error; }
    return data;
  } finally { clearTimeout(timeout); }
}
function announce(message) { document.getElementById('announcer').textContent = message; }
function notice(message) { ui.notice = message; announce(message); render(); setTimeout(() => { if (ui.notice === message) { ui.notice = ''; render(); } }, 4000); }
function changeUrl(search) { history.replaceState({}, '', `./index.html${search}`); }
function rememberStudent(room) { session.set(studentMarker, JSON.stringify({ room })); }
function rememberedStudent() { try { const x = JSON.parse(session.get(studentMarker) || 'null'); return /^\d{5}$/.test(x?.room) ? x.room : ''; } catch { return ''; } }
function stopCamera() { cancelAnimationFrame(scanFrame); scanFrame = 0; if (media) { for (const track of media.getTracks()) track.stop(); media = null; } }
function attachVideo() { const video = document.getElementById('camera-video'); if (video && media) { video.srcObject = media; void video.play().catch(() => {}); } }

function signature(next) {
  if (mode === 'host') return JSON.stringify({ phase: next.phase, students: next.students, onlineCount: next.onlineCount, joinedCount: next.joinedCount });
  if (mode === 'join') return JSON.stringify({ phase: next.phase, me: next.me, question: next.question, dialogue: next.dialogue,
    discovery: next.discovery, journal: next.journal });
  return JSON.stringify({ phase: next.phase, joinedCount: next.joinedCount });
}
function applyState(next, force = false) {
  if (!next || String(next.pin) !== pin) return;
  if (mode === 'host' && next.role !== 'host') { state = null; ui.error = 'This is a private teacher room. Open it on the device that created it.'; render(); return; }
  if (mode === 'join' && next.role !== 'student' && token) { state = null; ui.error = 'This student key could not be verified.'; render(); return; }
  if (state && next.version < state.version) return;
  const wasStage = state?.me?.stage;
  state = next;
  if (next.me?.stage === 'reading' && wasStage !== 'reading') { ui.readerPage = 1; requestAnimationFrame(() => window.scrollTo(0, 0)); }
  if (mode === 'host' && next.role === 'host') {
    storage.set('lantern-keeper:last-host', pin);
    if (window.parent !== window) window.parent.postMessage({ type: 'lantern-keeper:status', pin, phase: next.phase, onlineCount: next.onlineCount }, location.origin);
  }
  if (next.phase === 'ended' || (wasStage !== next.me?.stage && !['camera', 'hunt', 'star'].includes(next.me?.stage))) stopCamera();
  const nextSignature = signature(next);
  if (force || nextSignature !== ui.signature) { ui.signature = nextSignature; render(); }
  if (next.me?.stage === 'hunt' && media && !scanFrame) scanLoop();
}
async function loadState() {
  if (!/^\d{5}$/.test(pin) || pollInFlight || mode === 'home' || mode === 'student') return;
  pollInFlight = true; lastPoll = Date.now(); const stamp = generation;
  try {
    const data = await api(`${apiBase}/${pin}/state`, undefined, token);
    if (stamp !== generation) return;
    const reconnected = !ui.online; ui.online = true; ui.error = ''; applyState(data.state || data, reconnected);
    if (reconnected) announce('Reconnected to your adventure.');
  } catch (error) {
    if (stamp !== generation) return;
    if (error.status === 404 && mode === 'host') { storage.remove('lantern-keeper:last-host'); storage.remove(hostKey(pin)); navigate('home'); createRoom(true); return; }
    if (error.status === 404) { state = null; ui.online = false; ui.error = 'This room PIN is no longer active. Ask your teacher for the current QR code.'; render(); }
    else if (error.status === 401) { state = null; ui.error = 'Your saved student place could not be verified. Ask your teacher for help.'; render(); }
    else if (!error.status) { if (ui.online) { ui.online = false; render(); } if (!state) { ui.error = 'Connection interrupted. Your progress is saved; retrying automatically.'; render(); } }
    else if (!state) { ui.error = error.message; render(); }
  } finally { pollInFlight = false; }
}
async function createRoom(fresh = false) {
  if (mode !== 'home' || ui.busy || session.get(studentMarker) !== null) return;
  const last = storage.get('lantern-keeper:last-host');
  if (!fresh && /^\d{5}$/.test(last || '') && storage.get(hostKey(last))) { navigate('host', last); return; }
  ui.busy = true; ui.error = ''; render();
  try {
    const data = await api(apiBase, {}, '');
    if (!/^\d{5}$/.test(data.pin) || !/^[a-f0-9]{64}$/.test(data.hostToken || '')) throw new Error('The teacher room was not confirmed.');
    storage.set(hostKey(data.pin), data.hostToken); storage.set('lantern-keeper:last-host', data.pin); ui.busy = false; navigate('host', data.pin);
  } catch (error) { ui.busy = false; ui.error = error.message; render(); }
}
function navigate(nextMode, nextPin = '') {
  if (nextMode === 'join' && /^\d{5}$/.test(nextPin)) rememberStudent(nextPin);
  if ((nextMode === 'host' || nextMode === 'home') && session.get(studentMarker) !== null) { nextMode = rememberedStudent() ? 'join' : 'student'; nextPin = rememberedStudent(); }
  stopCamera(); generation++; mode = nextMode; pin = nextPin;
  token = nextMode === 'host' ? storage.get(hostKey(pin)) || '' : nextMode === 'join' ? storage.get(playerKey(pin)) || '' : '';
  state = null; ui.signature = ''; ui.error = ''; ui.feedback = ''; ui.answer = ''; ui.decoy = false; ui.lastScan = ''; ui.readerPage = 1; ui.modal = ''; ui.busy = false;
  pending = pin ? saved(pendingKey(pin)) : null; pendingJoin = nextMode === 'join' && !token ? saved(joinKey(pin)) : null;
  if (nextMode === 'host') changeUrl(`?host=${pin}`);
  else if (nextMode === 'join') changeUrl(`?join=${pin}`);
  else if (nextMode === 'student') changeUrl('?student=1');
  render(); if (pendingJoin) void deliverJoin(); if (pending && token) void deliverAction(); void loadState();
}
function initialRoute() {
  const params = new URLSearchParams(location.search), sticky = rememberedStudent();
  if (params.has('join') && /^\d{5}$/.test(params.get('join') || '')) { navigate('join', params.get('join')); return; }
  if (params.has('join')) { rememberStudent(''); navigate('student'); return; }
  if (session.get(studentMarker) !== null) { navigate(sticky ? 'join' : 'student', sticky); return; }
  if (params.has('student')) { rememberStudent(''); navigate('student'); return; }
  if (params.has('host') && /^\d{5}$/.test(params.get('host') || '') && storage.get(hostKey(params.get('host')))) { navigate('host', params.get('host')); return; }
  mode = 'home'; render(); void createRoom();
}
async function joinStudent() {
  if (mode !== 'join' || token || pendingJoin || !ui.name.trim()) return;
  let clientId = storage.get('lantern-keeper:client-id'); if (!clientId) { clientId = uid(); storage.set('lantern-keeper:client-id', clientId); }
  pendingJoin = { clientId, name: ui.name.trim() }; storage.set(joinKey(pin), JSON.stringify(pendingJoin)); ui.busy = true; render(); await deliverJoin();
}
async function deliverJoin() {
  if (!pendingJoin || joinInFlight || mode !== 'join') return;
  joinInFlight = true; lastJoin = Date.now(); const stamp = generation, attempt = pendingJoin;
  try {
    const data = await api(`${apiBase}/${pin}/join`, attempt, '');
    if (stamp !== generation || pendingJoin !== attempt) return;
    storage.set(playerKey(pin), data.playerToken); storage.remove(joinKey(pin)); token = data.playerToken; pendingJoin = null; ui.busy = false; ui.error = '';
    render(); await loadState();
  } catch (error) {
    if (stamp !== generation || pendingJoin !== attempt) return;
    if (error.status >= 400 && error.status < 500 && error.status !== 429) { storage.remove(joinKey(pin)); pendingJoin = null; ui.busy = false; ui.error = error.message; render(); await loadState(); }
    else { ui.online = false; ui.error = 'Confirming your saved place. Reconnecting safely…'; render(); }
  } finally { joinInFlight = false; }
}
async function sendAction(type, extra = {}) {
  if (pending || ui.busy || !token || !state || (type.startsWith('host:') && mode !== 'host') || (type.startsWith('student:') && mode !== 'join')) return;
  pending = { type, requestId: uid(), ...extra }; storage.set(pendingKey(pin), JSON.stringify(pending)); ui.busy = true; ui.error = ''; render(); await deliverAction();
}
async function deliverAction() {
  if (!pending || actionInFlight || !token) return;
  actionInFlight = true; lastAction = Date.now(); const stamp = generation, action = pending;
  try {
    const data = await api(`${apiBase}/${pin}/action`, action);
    if (stamp !== generation || pending !== action) return;
    pending = null; storage.remove(pendingKey(pin)); ui.busy = false; ui.online = true; ui.error = '';
    if (action.type === 'student:submit') {
      ui.feedback = data.result.correct ? 'Correct! A discovery is ready.' : 'Not quite. Check the passage and try again.';
      if (data.result.correct) ui.answer = '';
    }
    if (action.type === 'student:scan') {
      if (data.result.decoy) ui.decoy = true;
      if (data.result.genuine) { ui.decoy = false; ui.lastScan = ''; notice('You found the genuine keeper’s seal! Tap the glass star.'); }
    }
    if (action.type === 'student:collect') { ui.feedback = ''; ui.cameraError = ''; }
    applyState(data.state, true);
  } catch (error) {
    if (stamp !== generation || pending !== action) return;
    if (error.status >= 400 && error.status < 500 && error.status !== 429) {
      pending = null; storage.remove(pendingKey(pin)); ui.busy = false; ui.error = error.message; render(); await loadState();
    } else { ui.online = false; ui.error = 'Action not confirmed. Retrying safely with the same receipt…'; render(); }
  } finally { actionInFlight = false; }
}

function header() {
  return `<header class="topbar"><div class="brand"><span class="brand-mark">✧</span><span>The Lantern Keeper’s Secret<small>BATTLE 10 · READING ADVENTURE</small></span></div><div class="top-actions"><span class="chip ${ui.online ? 'good' : 'bad'}">${ui.online ? 'Connected' : 'Reconnecting…'}</span>${pin ? `<span class="chip">PIN <b>${pin}</b></span>` : ''}${mode === 'host' && state?.role === 'host' ? `${btn('Show Passage', 'show-passage', 'button ghost tiny')}${btn('Final QR cards', 'seals', 'button ghost tiny')}${btn('⛶ Full screen', 'fullscreen', 'button ghost tiny')}` : ''}</div></header>`;
}
function hostLobby() {
  const students = state.students || [];
  return `${header()}<div class="lobby-grid"><section class="panel scan"><span class="eyebrow">STUDENT ENTRANCE</span><h2>Scan to join</h2><img src="${apiBase}/${pin}/qr.svg" alt="QR code for students to join Battle 10"><p class="muted">Or enter the room PIN</p><div class="pin">${pin}</div>${btn('Copy student link', 'copy-link', 'button ghost wide')}</section><section class="panel"><div class="scene scene-0 lobby-art" role="img" aria-label="Lantern House overlooking the harbour"></div><div class="lobby-title"><span class="eyebrow">A COASTAL MYSTERY AWAITS</span><h1>The Lantern Keeper’s Secret</h1><p>When the beacon goes dark, every reader begins their own investigation.</p></div><span class="eyebrow">LANTERN HOUSE · LIVE LOBBY</span><h2>${students.length} / 40 investigators joined</h2><p class="muted">Each student plays at their own pace. A sleeping phone can reconnect to its saved place.</p><div class="roster">${students.length ? students.map(s => `<div class="roster-row"><span><i class="dot ${s.online ? '' : 'off'}"></i>${esc(s.name)}</span><small>${s.online ? 'online' : 'place saved'}</small></div>`).join('') : '<p>Waiting for students to scan the QR code…</p>'}</div>${btn('Begin the adventure →', 'start', 'button gold wide', ui.busy || !students.length ? 'disabled' : '')}</section></div>`;
}
function hostDashboard() {
  const students = state.students || [], finished = students.filter(s => s.finished).length;
  return `${header()}<div class="dashboard-head"><div><span class="eyebrow">TEACHER’S DESK · ROOM ${pin}</span><h1>${state.phase === 'ended' ? 'Adventure ended' : 'The investigation is underway'}</h1><p class="muted">Everyone moves independently. Answers and future clues stay off this screen.</p></div><div class="host-tools">${state.phase !== 'ended' ? btn('End adventure', 'end', 'button red tiny') : btn('Start a new adventure', 'new-room', 'button gold tiny')}</div></div><div class="scene scene-${state.phase === 'ended' ? '4' : '0'} dashboard-hero"><div class="scene-content"><h2>Keep the light alive</h2><p>Check each investigator’s progress while the class follows the story. One finished student never ends the game for the others.</p></div></div><div class="stats"><div class="stat"><b>${students.length}</b><span>joined students</span></div><div class="stat"><b>${state.onlineCount}</b><span>online now</span></div><div class="stat"><b>${finished}</b><span>adventures complete</span></div></div><div class="student-grid">${students.map(s => `<article class="student-row ${s.finished ? 'finished' : ''}"><strong>${esc(s.name)}</strong><small>Q${Math.min(10, s.q)} · ${esc(s.status)} · ${s.online ? 'online' : '<span class="offline">reconnecting</span>'}</small><div class="meter"><i style="width:${Math.min(100, s.completed * 10)}%"></i></div><small>${s.completed}/10 answers · ${s.discoveries}/10 discoveries${s.finalSearch ? ' · final search unlocked' : ''}</small></article>`).join('') || '<p>Waiting for students…</p>'}</div>`;
}
function joinView() {
  if (!token) return `${header()}<div class="entry"><div class="scene scene-0"></div><section class="parchment"><span class="eyebrow">YOUR STORY BEGINS HERE</span><h1>Join the adventure</h1><p>Look at your teacher’s screen, then follow the clues on your own phone.</p><label for="student-name">Your name</label><input id="student-name" maxlength="28" autocomplete="name" placeholder="Type your name" value="${esc(ui.name)}">${btn(pendingJoin ? 'Confirming your place…' : 'Enter Lantern House →', 'join', 'button gold wide', ui.busy || pendingJoin ? 'disabled' : '')}</section></div>`;
  if (!state || state.role !== 'student') return `${header()}<div class="entry"><div class="scene scene-0"></div><section class="parchment"><h2>Finding your adventure…</h2><p>Your place is saved on this device. We’re reconnecting it now.</p>${btn('Retry now', 'retry', 'button wide')}</section></div>`;
  if (state.phase === 'lobby') return `${header()}<div class="entry"><div class="scene scene-0"></div><section class="parchment"><span class="eyebrow">INVESTIGATOR READY</span><h1>Welcome, ${esc(state.me.name)}!</h1><p>The teacher will start the adventure. Keep this tab open; your place is saved if your screen sleeps.</p></section></div>`;
  if (state.phase === 'ended') return `${header()}<div class="entry"><div class="scene scene-${state.me.stage === 'complete' ? 4 : state.scene}"></div><section class="parchment"><span class="eyebrow">TEACHER ENDED THIS ROOM</span><h1>${state.me.stage === 'complete' ? 'Adventure complete' : 'Your progress is saved'}</h1><p>You completed ${state.me.completed} of 10 reading questions and collected ${state.me.discoveries.length} discoveries.</p>${btn('Read Passage', 'story', 'button ghost')}${btn('Journal', 'journal', 'button ghost')}</section></div>`;
  return `${header()}<div class="progress-strip">${esc(state.me.name)} · Question ${Math.min(10, state.me.q)} of 10 · ${state.me.completed} answers · ${state.me.discoveries.length} discoveries</div>${studentStage()}${state.me.stage !== 'reading' ? `<div class="phone-tools">${btn('▣ Read Passage', 'story', 'button ghost')}${btn('▤ Journal', 'journal', 'button ghost')}</div>` : ''}`;
}
function studentStage() {
  const me = state.me, stage = me.stage;
  if (stage === 'reading') return `<div class="initial-reader"><div class="reader-intro"><span class="eyebrow">OPENING STORYBOOK</span><h2>Read the passage before Question 1</h2><p>Turn each page at your own pace. The questions begin after paragraph 6.</p></div>${readerPage(false, true)}</div>`;
  if (stage === 'dialogue' || stage === 'hunt-dialogue' || stage === 'ending') {
    const line = state.dialogue || ['Lina', 'The adventure continues.'], speaker = line[0].toLowerCase();
    const pictureScene = stage === 'ending' ? 4 : stage === 'hunt-dialogue' ? 3 : state.scene;
    return `<div class="story-stage"><div class="scene scene-${pictureScene}"><span class="scene-caption">${stage === 'ending' ? 'THE BEACON RETURNS' : stage === 'hunt-dialogue' ? 'THE FINAL SEARCH' : `CHAPTER ${me.q} · STORY SCENE`}</span>${stage === 'ending' ? '<div class="character mara support"></div>' : ''}<div class="character ${speaker === 'lina' ? 'lina' : speaker === 'mara' ? 'mara' : 'rafi'}"></div><div class="character ${speaker === 'lina' ? 'rafi' : 'lina'} dim"></div></div><div class="parchment story-card"><span class="speaker">${esc(line[0])}</span><div class="dialogue-text">${esc(line[1])}</div>${btn(ui.busy ? 'Continuing…' : 'Continue →', 'dialogue-next', 'button gold wide', ui.busy ? 'disabled' : '')}</div></div>`;
  }
  if (stage === 'question') return `<div class="story-stage"><div class="scene scene-${state.scene}"><span class="scene-caption">READING QUESTION ${me.q} / 10</span></div><form id="answer-form" class="parchment question-card"><span class="eyebrow">${state.question.vocabulary ? 'THE NOTEBOOK · VOCABULARY' : 'INVESTIGATE THE PASSAGE'}</span><h2>${esc(state.question.text)}</h2><p class="help">${state.question.vocabulary ? 'Find the exact one word from the passage.' : 'Answer with no more than five words from the passage.'}</p><label for="answer-input" class="sr-only">Your reading answer</label><input id="answer-input" class="answer-input" maxlength="120" autocomplete="off" placeholder="Type your answer here…" value="${esc(ui.answer)}">${btn(ui.busy ? 'Checking…' : 'Submit Answer →', 'submit', 'button gold wide', ui.busy ? 'disabled' : '')}${ui.feedback ? `<div class="feedback ${ui.feedback.startsWith('Correct') ? 'good' : ''}" role="status">${esc(ui.feedback)}</div>` : ''}${me.hint ? `<p class="help"><b>Hint:</b> ${esc(me.hint)}</p>` : ''}</form></div>`;
  if (stage === 'success') return `<div class="story-stage"><div class="scene scene-${state.scene}"><span class="scene-caption">A NEW CLUE</span><div class="character lina"></div></div><div class="parchment success-card"><span class="eyebrow">WELL DONE, INVESTIGATOR</span><h2>Correct!</h2><p>${me.q === 10 ? 'The final classroom search is ready. Find the two hidden keeper’s seals.' : `You can now discover ${esc(state.discovery.name)}.`}</p>${btn(me.q === 10 ? 'Begin final search →' : 'Discover →', 'discover', 'button gold wide', ui.busy ? 'disabled' : '')}</div></div>`;
  if (stage === 'camera') return discoveryStage();
  if (stage === 'hunt' || stage === 'star') return cameraStage();
  if (stage === 'complete') return `<div class="story-stage"><div class="scene scene-4"><span class="scene-caption">THE HARBOUR SHINES AGAIN</span><div class="character mara support"></div><div class="character lina"></div><div class="character rafi"></div></div><div class="parchment ending-card"><span class="eyebrow">ADVENTURE COMPLETE</span><h1>The Lantern Keeper’s Secret</h1><p>With Mara's repairs complete, Lina and Rafi returned the glass star to the beacon. Blue light swept across the harbour. One by one, the waiting boats began to move.</p><p><b>THE LANTERN KEEPER’S SECRET — ADVENTURE COMPLETE</b></p>${btn('Review your journal', 'journal', 'button gold wide')}</div></div>`;
  return `<div class="parchment"><h2>Your adventure is loading…</h2></div>`;
}
function discoveryStage() {
  return `<div class="story-stage discovery-stage"><div class="scene scene-${state.scene}"><span class="scene-caption">DISCOVERY ${state.me.q} / 9</span></div><div class="parchment discovery-card"><span class="eyebrow">A NEW CLUE APPEARS</span><h2>${esc(state.discovery.name)}</h2><div class="discovery-art" role="img" aria-label="Illustrated clue: ${esc(state.discovery.name)}">${evidence(state.me.q)}</div><p>${esc(state.discovery.action)}</p>${btn(ui.busy ? 'Collecting…' : 'Collect clue →', 'collect', 'button gold wide', ui.busy ? 'disabled' : '')}</div></div>`;
}
function cameraStage() {
  const stage = state.me.stage, isHunt = stage === 'hunt';
  return `<div class="camera-view"><video id="camera-video" autoplay playsinline muted aria-label="Live camera view"></video>${isHunt && !ui.decoy ? '<div class="scan-frame"></div>' : ''}<div class="camera-head"><span class="eyebrow">${stage === 'star' ? 'THE GENUINE SEAL' : ui.decoy ? 'A FALSE LEAD' : 'FINAL CLASSROOM HUNT'}</span><h2>${stage === 'star' ? 'The moon cupboard opens!' : ui.decoy ? 'The star cupboard opens!' : 'Find the keeper’s hidden seal'}</h2></div>${stage === 'star' ? `<button type="button" class="star-card" data-action="star" aria-label="Tap to collect the glass star"><span class="glass-star"></span><b>Tap to collect the glass star</b></button>` : ui.decoy ? `<button type="button" class="star-card decoy-card" data-action="close-decoy" aria-label="Ha ha! You found the decoy. Tap the star cupboard to keep searching"><span class="decoy-object" aria-hidden="true"></span><b>Ha ha! You found the decoy! Tap to keep searching.</b></button>` : ''}<div class="camera-foot"><div class="camera-hint">${stage === 'star' ? 'Tap the glowing star to restore the beacon.' : ui.decoy ? 'The real seal is still hidden. You can scan this decoy again, but keep searching for the genuine seal.' : 'Scan either printed keeper seal here. A decoy is harmless; keep searching until you find the real one.'}</div>${ui.cameraError ? `<div class="feedback">${esc(ui.cameraError)}</div>` : ''}<div class="camera-controls">${!media ? btn('Open rear camera', 'open-camera', 'button gold tiny') : btn('Close camera', 'close-camera', 'button ghost tiny')}${isHunt ? btn('Enter seal code instead', 'manual-seal', 'button ghost tiny') : ''}</div></div></div>`;
}
function readerPage(projector = false, initial = false) {
  const page = Math.max(1, Math.min(6, ui.readerPage)), paragraph = state.passage?.[page - 1] || '';
  const numbers = !initial ? `<nav class="reader-jumps" aria-label="Jump to paragraph">${Array.from({ length: 6 }, (_, index) => btn(`${index + 1}`, `reader-${index + 1}`, `reader-jump ${page === index + 1 ? 'selected' : ''}`, `aria-label="Paragraph ${index + 1}" ${page === index + 1 ? 'aria-current="page"' : ''}`)).join('')}</nav>` : '';
  const end = initial ? btn(ui.busy ? 'Opening question…' : 'Begin Questions →', 'begin-questions', 'button gold wide', ui.busy ? 'disabled' : '') : projector ? btn('Close Passage', 'close-modal', 'button gold wide') : btn(`Back to Question ${Math.min(10, state.me?.q || 1)}`, 'close-modal', 'button gold wide');
  return `<article class="reader-page ${projector ? 'projector-reader' : ''}"><div class="reader-heading"><span class="eyebrow">THE LANTERN KEEPER’S SECRET</span><h2>Paragraph ${page} of 6</h2><div class="reader-progress" aria-label="Paragraph ${page} of 6"><span style="width:${page * 100 / 6}%"></span></div></div><img class="reader-illustration" src="./assets/reader-${page}.webp" alt="Illustration for paragraph ${page} of the Lantern House story"><div class="reader-text parchment"><p><b>[${page}]</b> ${esc(paragraph)}</p></div>${numbers}<div class="reader-controls">${btn('← Previous Paragraph', 'reader-prev', 'button ghost', page === 1 ? 'disabled' : '')}${page < 6 ? btn('Next Paragraph →', 'reader-next', 'button gold') : end}</div>${!initial && page < 6 ? `<div class="reader-return">${end}</div>` : ''}</article>`;
}
function modal() {
  if (ui.modal === 'story' || ui.modal === 'teacher-passage') return `<div class="modal-backdrop"><section class="modal reader-modal ${ui.modal === 'teacher-passage' ? 'teacher-reader-modal' : ''}"><div class="modal-head"><h2>Read Passage</h2>${btn('Close', 'close-modal', 'button ghost tiny')}</div>${readerPage(ui.modal === 'teacher-passage')}</section></div>`;
  if (ui.modal === 'journal') return `<div class="modal-backdrop"><section class="modal"><div class="modal-head"><h2>Investigation Journal</h2>${btn('Close', 'close-modal', 'button ghost tiny')}</div><p class="muted">Only clues you have actually collected appear here. Replaying a scene never grants another discovery.</p><div class="journal-list">${state.journal.map(item => `<article class="journal-item">${item.number === 10 ? '<span class="glass-star"></span>' : evidence(item.number)}<b>${esc(item.name)}</b><small>${esc(item.evidence)}</small></article>`).join('') || '<p>No discoveries yet. Follow the story to begin.</p>'}</div><hr>${state.dialogueHistory?.length ? `<h3>Replay story scenes</h3><div class="camera-controls">${state.dialogueHistory.map(row => btn(`Scene ${row.question}`, `replay-${row.question}`, 'button ghost tiny')).join('')}</div>` : ''}</section></div>`;
  if (ui.modal === 'replay') { const row = state.dialogueHistory?.find(item => item.question === ui.replay); return `<div class="modal-backdrop"><section class="modal"><div class="modal-head"><h2>Scene ${ui.replay} · Replay</h2>${btn('Close', 'close-modal', 'button ghost tiny')}</div><div class="parchment">${row ? row.lines.map(([speaker, text]) => `<p><b>${esc(speaker)}:</b> ${esc(text)}</p>`).join('') : '<p>This scene is not unlocked yet.</p>'}</div></section></div>`; }
  if (ui.modal === 'manual-seal') return `<div class="modal-backdrop"><section class="modal"><div class="modal-head"><h2>Enter a keeper seal</h2>${btn('Close', 'close-modal', 'button ghost tiny')}</div><p class="muted">If your camera cannot scan, type the short code printed beneath a classroom seal.</p><label for="seal-code">Seal code</label><input id="seal-code" class="manual-input" autocomplete="off" autocapitalize="characters" maxlength="20" placeholder="12-character code">${btn('Check this seal', 'check-seal', 'button gold wide')}</section></div>`;
  if (ui.modal === 'end-confirm') return `<div class="modal-backdrop"><section class="modal"><div class="modal-head"><h2>End this adventure?</h2>${btn('Keep playing', 'close-modal', 'button ghost tiny')}</div><p>This will stop play for everyone in this room. Their answers and discoveries remain saved for review. You can start a fresh room afterward.</p><div class="camera-controls">${btn('Keep playing', 'close-modal', 'button ghost')}${btn('End adventure for all', 'confirm-end', 'button red')}</div></section></div>`;
  if (ui.modal === 'seals') { const a = ui.seals.genuineCard === 'A' ? ui.seals.genuine : ui.seals.decoy, b = ui.seals.genuineCard === 'B' ? ui.seals.genuine : ui.seals.decoy; return `<div class="modal-backdrop"><section class="modal"><div class="modal-head"><h2>Two keeper seals · teacher only</h2>${btn('Close', 'close-modal', 'button ghost tiny')}</div><p class="print-warning">Private teacher material. Print and hide the two cards in safe, reachable classroom places. Do not show this reference on the projector while students watch.</p><div class="seal-grid"><article class="seal-card"><h3>Keeper Seal A</h3>${a.svg}<small>${esc(a.code)}</small><p>Scan in the game’s camera.</p></article><article class="seal-card"><h3>Keeper Seal B</h3>${b.svg}<small>${esc(b.code)}</small><p>Scan in the game’s camera.</p></article></div><div class="teacher-key"><b>Private key:</b> Seal ${ui.seals.genuineCard} is genuine. Seal ${ui.seals.genuineCard === 'A' ? 'B' : 'A'} is the decoy. This reference is not printed on the cards.</div>${btn('Print the two cards', 'print-seals', 'button gold wide no-print')}</section></div>`; }
  return '';
}
function render() {
  let content;
  if (mode === 'home') content = `${header()}<div class="entry">${scene(0)}<section class="parchment"><h1>Preparing Lantern House…</h1>${ui.error ? `<p>${esc(ui.error)}</p>${btn('Try again', 'retry-create', 'button gold wide')}` : '<p>Creating a safe classroom room.</p>'}</section></div>`;
  else if (mode === 'student') content = `${header()}<div class="entry">${scene(0)}<section class="parchment"><h1>Join the adventure</h1><p>Scan your teacher’s QR code or enter the five-digit PIN.</p><label for="entry-pin">Room PIN</label><input id="entry-pin" inputmode="numeric" pattern="[0-9]*" maxlength="5" placeholder="12345" value="${esc(ui.entryPin)}">${btn('Continue →', 'enter-pin', 'button gold wide')}</section></div>`;
  else if (mode === 'host') content = state?.role === 'host' ? state.phase === 'lobby' ? hostLobby() : hostDashboard() : `${header()}<div class="entry">${scene(0)}<section class="parchment"><h2>Reconnecting the teacher room…</h2>${btn('Retry now', 'retry', 'button gold wide')}</section></div>`;
  else content = joinView();
  app.innerHTML = `<main class="shell ${mode === 'join' || mode === 'student' ? 'phone' : ''}">${content}${ui.error ? `<div class="toast error" role="alert">${esc(ui.error)}</div>` : ''}${ui.notice ? `<div class="toast" role="status">${esc(ui.notice)}</div>` : ''}${state?.role === 'student' || state?.role === 'host' ? modal() : ''}</main>`;
  attachVideo();
}

async function openCamera() {
  if (!['hunt', 'star', 'hunt-dialogue'].includes(state?.me?.stage) || media) return;
  if (!navigator.mediaDevices?.getUserMedia) { ui.cameraError = 'This browser has no camera access. Your reading progress is safe.'; render(); return; }
  try {
    media = await navigator.mediaDevices.getUserMedia({ audio: false, video: { facingMode: { ideal: 'environment' }, width: { ideal: 640 }, height: { ideal: 480 } } });
    if (!['hunt', 'star'].includes(state?.me?.stage) && !(state?.me?.stage === 'hunt-dialogue' && state.me.dialogueIndex === 1)) { stopCamera(); return; }
    ui.cameraError = ''; render();
    if (state?.me?.stage === 'hunt' && !scanFrame) scanLoop();
  } catch { ui.cameraError = 'Camera unavailable or permission denied. Your completed answers are saved. For the final hunt, use a printed seal code or another camera-enabled phone.'; render(); }
}
function scanLoop() {
  if (!media || state?.me?.stage !== 'hunt') return;
  const video = document.getElementById('camera-video');
  if (video?.readyState >= 2 && video.videoWidth > 0 && video.videoHeight > 0 && !pending && !ui.decoy && Date.now() - lastDecode > 270 && typeof window.jsQR === 'function') {
    lastDecode = Date.now(); const canvas = document.createElement('canvas');
    canvas.width = Math.min(560, video.videoWidth); canvas.height = Math.round(canvas.width * video.videoHeight / video.videoWidth);
    const ctx = canvas.getContext('2d', { willReadFrequently: true }); ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    const pixels = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const found = window.jsQR(pixels.data, canvas.width, canvas.height, { inversionAttempts: 'dontInvert' });
    if (!found?.data) {
      if (!ui.sealAbsentSince) ui.sealAbsentSince = Date.now();
      if (Date.now() - ui.sealAbsentSince > 500) ui.lastScan = '';
    } else {
      ui.sealAbsentSince = 0;
      if (found.data.startsWith(`LK1|${pin}|`) && found.data !== ui.lastScan) { ui.lastScan = found.data; void sendAction('student:scan', { code: found.data }); }
    }
  }
  scanFrame = requestAnimationFrame(scanLoop);
}
async function showSeals() {
  if (mode !== 'host' || !token) return;
  try { ui.seals = await api(`${apiBase}/${pin}/seals`); ui.modal = 'seals'; render(); }
  catch (error) { ui.error = error.message; render(); }
}

app.addEventListener('input', event => {
  if (event.target.id === 'student-name') ui.name = event.target.value;
  if (event.target.id === 'entry-pin') ui.entryPin = event.target.value.replace(/\D/g, '').slice(0, 5);
  if (event.target.id === 'answer-input') ui.answer = event.target.value;
});
app.addEventListener('submit', event => { if (event.target.id === 'answer-form') { event.preventDefault(); void sendAction('student:submit', { questionNumber: state.me.q, answer: ui.answer }); } });
app.addEventListener('click', event => {
  const control = event.target.closest('[data-action]'); if (!control) return;
  const action = control.dataset.action;
  if (action === 'retry') { void loadState(); return; }
  if (action === 'retry-create') { void createRoom(true); return; }
  if (action === 'enter-pin') { if (/^\d{5}$/.test(ui.entryPin)) navigate('join', ui.entryPin); else notice('Enter the five-digit room PIN.'); return; }
  if (action === 'join') { void joinStudent(); return; }
  if (action === 'fullscreen') { if (document.fullscreenElement) void document.exitFullscreen(); else void document.documentElement.requestFullscreen().catch(() => notice('Full screen was blocked by this browser.')); return; }
  if (action === 'copy-link') { void navigator.clipboard.writeText(`${location.origin}/battle10/index.html?join=${pin}`).then(() => notice('Student link copied.')).catch(() => notice('Use the QR code or room PIN to join.')); return; }
  if (action === 'start') { void sendAction('host:start'); return; }
  if (action === 'end') { ui.modal = 'end-confirm'; render(); return; }
  if (action === 'confirm-end') { ui.modal = ''; void sendAction('host:end'); return; }
  if (action === 'new-room') { storage.remove('lantern-keeper:last-host'); navigate('home'); void createRoom(true); return; }
  if (action === 'seals') { void showSeals(); return; }
  if (action === 'print-seals') { window.print(); return; }
  if (action === 'show-passage') { ui.readerPage = 1; ui.modal = 'teacher-passage'; render(); return; }
  if (action === 'reader-prev' || action === 'reader-next' || /^reader-[1-6]$/.test(action)) {
    ui.readerPage = action === 'reader-prev' ? Math.max(1, ui.readerPage - 1) : action === 'reader-next' ? Math.min(6, ui.readerPage + 1) : Number(action.slice(7));
    render(); const scrollBox = document.querySelector('.reader-modal'); if (scrollBox) scrollBox.scrollTo(0, 0); else window.scrollTo(0, 0); return;
  }
  if (action === 'begin-questions') { if (state?.me?.stage === 'reading' && ui.readerPage === 6) void sendAction('student:begin-questions'); return; }
  if (action === 'dialogue-next') {
    if (state?.me?.stage === 'hunt-dialogue' && state.me.dialogueIndex === 1) void openCamera();
    void sendAction('student:dialogue-next'); return;
  }
  if (action === 'submit') { void sendAction('student:submit', { questionNumber: state.me.q, answer: ui.answer }); return; }
  if (action === 'discover') { void sendAction('student:discover'); return; }
  if (action === 'collect') { void sendAction('student:collect'); return; }
  if (action === 'star') { void sendAction('student:star'); return; }
  if (action === 'story' || action === 'journal' || action === 'manual-seal') { if (action === 'story') ui.readerPage = 1; ui.modal = action; render(); return; }
  if (action.startsWith('replay-')) { ui.replay = Number(action.slice(7)); ui.modal = 'replay'; render(); return; }
  if (action === 'close-modal') { ui.modal = ''; render(); return; }
  if (action === 'close-decoy') { ui.decoy = false; render(); return; }
  if (action === 'check-seal') { const code = document.getElementById('seal-code')?.value?.trim(); ui.modal = ''; if (code) void sendAction('student:scan', { code }); else notice('Enter the code printed beneath a seal.'); return; }
  if (action === 'open-camera') { void openCamera(); return; }
  if (action === 'close-camera') { stopCamera(); render(); return; }
});

setInterval(() => {
  if (pending && token && !actionInFlight && Date.now() - lastAction > 900) void deliverAction();
  if (pendingJoin && !joinInFlight && Date.now() - lastJoin > 900) void deliverJoin();
  const interval = document.hidden ? 9000 : mode === 'host' ? 3200 : 4200;
  if (Date.now() - lastPoll > interval) void loadState();
}, 900);
document.addEventListener('visibilitychange', () => { if (!document.hidden) { void loadState(); if (state?.me?.stage === 'hunt' && media && !scanFrame) scanLoop(); } });
window.addEventListener('online', () => { ui.online = true; if (pending) void deliverAction(); if (pendingJoin) void deliverJoin(); void loadState(); });
window.addEventListener('pagehide', stopCamera);
initialRoute();
