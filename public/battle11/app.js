const app = document.getElementById('app');
const apiBase = '/api/museum/rooms';
const storage = { get(key) { try { return localStorage.getItem(key); } catch { return null; } },
  set(key, value) { try { localStorage.setItem(key, value); } catch {} }, remove(key) { try { localStorage.removeItem(key); } catch {} } };
const session = { get(key) { try { return sessionStorage.getItem(key); } catch { return null; } },
  set(key, value) { try { sessionStorage.setItem(key, value); } catch {} } };
const esc = value => String(value ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);
const uid = () => crypto.randomUUID();
const btn = (label, action, cls = 'button', attrs = '') => `<button type="button" class="${cls}" data-action="${action}" ${attrs}>${label}</button>`;
const hostKey = room => `museum-jewel:host:${room}`;
const playerKey = room => `museum-jewel:player:${room}`;
const pendingKey = room => `museum-jewel:pending:${room}`;
const joinKey = room => `museum-jewel:pending-join:${room}`;
const studentMarker = 'museum-jewel:student-route';
const saved = key => { try { return JSON.parse(storage.get(key) || 'null'); } catch { return null; } };
const formatTime = ms => { const seconds = Math.max(0, Math.ceil(ms / 1000)); return `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, '0')}`; };
const elapsedText = ms => ms === null || ms === undefined ? '—' : formatTime(ms);

let mode = 'home', pin = '', token = '', state = null, pending = null, pendingJoin = null;
let generation = 0, pollInFlight = false, actionInFlight = false, joinInFlight = false, lastPoll = 0, lastAction = 0, lastJoin = 0;
let media = null, scanFrame = 0, lastDecode = 0, scanSeen = '', clockSkew = 0;
const ui = { online: navigator.onLine, busy: false, error: '', notice: '', modal: '', name: '', entryPin: '',
  screen: 'map', draft: null, draftVisitId: null, scanError: '', cameraError: '', move: null, signature: '' };

async function api(path, body, auth = token) {
  const controller = new AbortController(), timeout = setTimeout(() => controller.abort(), 12000);
  try {
    const response = await fetch(path, { method: body ? 'POST' : 'GET', cache: 'no-store', signal: controller.signal,
      headers: { ...(body ? { 'Content-Type': 'application/json' } : {}), ...(auth ? { Authorization: `Bearer ${auth}` } : {}) },
      body: body ? JSON.stringify(body) : undefined });
    let data; try { data = await response.json(); } catch { throw new Error('The museum server returned an unexpected response.'); }
    if (!response.ok) { const error = new Error(data.error || 'That action could not be completed.'); error.status = response.status; error.code = data.code; throw error; }
    return data;
  } finally { clearTimeout(timeout); }
}
function announce(message) { const element = document.getElementById('announcer'); if (element) element.textContent = message; }
function notice(message) { ui.notice = message; announce(message); render(); setTimeout(() => { if (ui.notice === message) { ui.notice = ''; render(); } }, 4200); }
function changeUrl(search) { history.replaceState({}, '', `./index.html${search}`); }
function rememberStudent(room) { session.set(studentMarker, JSON.stringify({ room })); }
function rememberedStudent() { try { const x = JSON.parse(session.get(studentMarker) || 'null'); return /^\d{5}$/.test(x?.room) ? x.room : ''; } catch { return ''; } }
function stopCamera() { cancelAnimationFrame(scanFrame); scanFrame = 0; if (media) { for (const track of media.getTracks()) track.stop(); media = null; } }
function attachVideo() { const video = document.getElementById('camera-video'); if (video && media) { video.srcObject = media; void video.play().catch(() => {}); } }
function clockMarkup(endsAt) { return `<time class="countdown" data-ends-at="${Number(endsAt)}">${formatTime(Number(endsAt) - Date.now() - clockSkew)}</time>`; }
function updateClocks() {
  for (const element of document.querySelectorAll('[data-ends-at]')) element.textContent = formatTime(Number(element.dataset.endsAt) - Date.now() - clockSkew);
  for (const element of document.querySelectorAll('[data-start-at]')) element.textContent = formatTime(Date.now() + clockSkew - Number(element.dataset.startAt));
}
function signature(next) {
  if (mode === 'host') return JSON.stringify({ phase: next.phase, groups: next.groups, stations: next.stations, resultsReleased: next.resultsReleased });
  if (mode === 'join') return JSON.stringify({ phase: next.phase, me: next.me, paragraph: next.paragraph, stations: next.stations, resultsReleased: next.resultsReleased });
  return JSON.stringify({ phase: next.phase, joinedCount: next.joinedCount });
}
function applyState(next, force = false) {
  if (!next || String(next.pin) !== pin) return;
  if (mode === 'host' && next.role !== 'host') { state = null; ui.error = 'This private teacher room must be opened on the device that created it.'; render(); return; }
  if (mode === 'join' && next.role !== 'student' && token) { state = null; ui.error = 'Your saved group place could not be verified.'; render(); return; }
  if (state && next.version < state.version) return;
  const oldVisitId = state?.me?.activeVisit?.id;
  state = next;
  clockSkew = Number(next.serverTime || Date.now()) - Date.now();
  const visit = next.me?.activeVisit;
  if (visit?.id !== oldVisitId) { ui.draftVisitId = visit?.id ?? null; ui.draft = visit ? next.me.choices[visit.station - 1] : null; }
  if (oldVisitId && !visit && next.phase === 'active' && !next.me?.submitted) ui.screen = 'visit-ended';
  if ((oldVisitId && !visit) || next.me?.submitted || next.phase === 'ended') stopCamera();
  if (mode === 'host' && next.role === 'host') {
    storage.set('museum-jewel:last-host', pin);
    if (window.parent !== window) window.parent.postMessage({ type: 'museum-jewel:status', pin, phase: next.phase,
      onlineCount: next.onlineCount }, location.origin);
  }
  const nextSignature = signature(next);
  if (force || nextSignature !== ui.signature) { ui.signature = nextSignature; render(); }
}
async function loadState() {
  if (!/^\d{5}$/.test(pin) || pollInFlight || mode === 'home' || mode === 'student') return;
  pollInFlight = true; lastPoll = Date.now(); const stamp = generation;
  try {
    const data = await api(`${apiBase}/${pin}/state`, undefined, token);
    if (stamp !== generation) return;
    const reconnected = !ui.online; ui.online = true; ui.error = ''; applyState(data.state || data, reconnected);
    if (reconnected) announce('Reconnected to your museum room.');
  } catch (error) {
    if (stamp !== generation) return;
    if (error.status === 404 && mode === 'host') { storage.remove('museum-jewel:last-host'); storage.remove(hostKey(pin)); navigate('home'); void createRoom(true); return; }
    if (error.status === 404) { state = null; ui.online = false; ui.error = 'This room PIN is no longer active. Ask your teacher for the current joining QR code.'; render(); }
    else if (error.status === 401) { state = null; ui.error = 'Your saved group place could not be verified. Ask your teacher for help.'; render(); }
    else if (!error.status) { if (ui.online) { ui.online = false; render(); } if (!state) { ui.error = 'Connection interrupted. Your saved answers are safe; retrying automatically.'; render(); } }
    else if (!state) { ui.error = error.message; render(); }
  } finally { pollInFlight = false; }
}
async function createRoom(fresh = false) {
  if (mode !== 'home' || ui.busy || session.get(studentMarker) !== null) return;
  const last = storage.get('museum-jewel:last-host');
  if (!fresh && /^\d{5}$/.test(last || '') && storage.get(hostKey(last))) { navigate('host', last); return; }
  ui.busy = true; ui.error = ''; render();
  try {
    const data = await api(apiBase, {}, '');
    if (!/^\d{5}$/.test(data.pin) || !/^[a-f0-9]{64}$/.test(data.hostToken || '')) throw new Error('The teacher room was not confirmed.');
    storage.set(hostKey(data.pin), data.hostToken); storage.set('museum-jewel:last-host', data.pin); ui.busy = false; navigate('host', data.pin);
  } catch (error) { ui.busy = false; ui.error = error.message; render(); }
}
function navigate(nextMode, nextPin = '') {
  if (nextMode === 'join' && /^\d{5}$/.test(nextPin)) rememberStudent(nextPin);
  if ((nextMode === 'host' || nextMode === 'home') && session.get(studentMarker) !== null) { nextMode = rememberedStudent() ? 'join' : 'student'; nextPin = rememberedStudent(); }
  stopCamera(); generation++; mode = nextMode; pin = nextPin;
  token = nextMode === 'host' ? storage.get(hostKey(pin)) || '' : nextMode === 'join' ? storage.get(playerKey(pin)) || '' : '';
  state = null; ui.signature = ''; ui.error = ''; ui.notice = ''; ui.modal = ''; ui.busy = false; ui.screen = 'map';
  ui.draft = null; ui.draftVisitId = null; ui.scanError = ''; ui.cameraError = ''; ui.move = null;
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
async function joinGroup() {
  if (mode !== 'join' || token || pendingJoin || !ui.name.trim()) return;
  let clientId = storage.get('museum-jewel:client-id'); if (!clientId) { clientId = uid(); storage.set('museum-jewel:client-id', clientId); }
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
    else { ui.online = false; ui.error = 'Confirming your saved group place. Reconnecting safely…'; render(); }
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
    if (action.type === 'student:scan' && (data.result.admitted || data.result.restored)) {
      stopCamera(); ui.screen = 'map'; ui.scanError = ''; ui.cameraError = '';
    }
    if (action.type === 'student:save' || action.type === 'student:save-leave') { ui.notice = 'Answer saved on the server.'; if (data.result.left) ui.screen = 'map'; }
    if (action.type === 'student:submit') { ui.modal = ''; ui.screen = 'overview'; }
    if (action.type === 'host:end' || action.type === 'host:reveal') ui.modal = '';
    applyState(data.state, true);
  } catch (error) {
    if (stamp !== generation || pending !== action) return;
    if (error.status >= 400 && error.status < 500 && error.status !== 429) {
      pending = null; storage.remove(pendingKey(pin)); ui.busy = false;
      if (action.type === 'student:scan') ui.scanError = error.message;
      else ui.error = error.message;
      render(); void loadState();
    } else { ui.online = false; ui.error = 'Action not confirmed. Retrying safely with the same receipt…'; render(); }
  } finally { actionInFlight = false; }
}

function header() {
  return `<header class="topbar"><div class="brand"><span class="brand-mark">◆</span><span>The Missing Museum Jewel<small>BATTLE 11 · DETECTIVE STATIONS</small></span></div><div class="top-actions"><span class="chip ${ui.online ? 'good' : 'bad'}">${ui.online ? 'Connected' : 'Reconnecting…'}</span>${pin ? `<span class="chip">PIN <b>${pin}</b></span>` : ''}${mode === 'host' && state?.role === 'host' ? `${btn('Print Station Cards', 'cards', 'button ghost tiny')}${state.phase === 'active' ? btn('Show join QR', 'join-qr', 'button ghost tiny') : ''}${btn('⛶ Full screen', 'fullscreen', 'button ghost tiny')}` : ''}</div></header>`;
}
function hostLobby() {
  const groups = state.groups || [];
  return `${header()}<div class="lobby-grid"><section class="panel join-panel"><span class="eyebrow">ROOM ENTRANCE</span><h2>Scan to join</h2><img class="join-qr" src="${apiBase}/${pin}/qr.svg" alt="QR code for groups to join Battle 11"><p>Or enter the room PIN</p><div class="pin">${pin}</div>${btn('Copy group link', 'copy-link', 'button ghost wide')}</section><section class="panel lobby-main"><div class="hero"><div class="hero-title"><span class="eyebrow">A MUSEUM CASE AWAITS</span><h1>The Missing Museum Jewel</h1></div></div><h2>${groups.length} / 40 groups joined</h2><p>Six permanent station cards. Put them anywhere in the classroom: Station 1 always has Paragraph 1. Up to two groups can read at each station at a time.</p><div class="roster">${groups.length ? groups.map(g => `<div class="roster-row"><b>${esc(g.name)}</b><span>${g.online ? '● Online' : '○ Place saved'}</span></div>`).join('') : '<p>Waiting for groups to scan your joining QR code…</p>'}</div><div class="lobby-actions">${btn('Print the six reusable station cards', 'cards', 'button ghost wide')}${btn('Start Game →', 'start', 'button gold wide', ui.busy || !groups.length ? 'disabled' : '')}</div></section></div>`;
}
function stationTiles() {
  return `<div class="station-grid">${state.stations.map(station => `<article class="station-tile ${station.count === 2 ? 'station-full' : ''}"><div class="station-file"><span class="file-number" aria-hidden="true">${String(station.number).padStart(2,'0')}</span><span class="eyebrow">STATION ${station.number} · PARAGRAPH ${station.number}</span><h3>${esc(station.title)}</h3></div><strong class="capacity ${station.count === 2 ? 'full' : ''}">${station.count === 2 ? 'FULL 2/2' : `${station.count}/2`}</strong><div class="occupants">${station.occupying.length ? station.occupying.map(g => `<div><b>${esc(g.name)}</b>${clockMarkup(g.visitEndsAt)}</div>`).join('') : '<span>Two places available</span>'}</div></article>`).join('')}</div>`;
}
function groupTable() {
  return `<div class="group-table-wrap"><table class="group-table"><thead><tr><th>Group</th><th>Where now</th><th>Answers</th><th>Saved stations</th><th>Visit left</th><th>Status</th><th>Time</th></tr></thead><tbody>${state.groups.map(g => `<tr><td><b>${esc(g.name)}</b><small>${g.online ? 'Online' : 'Disconnected'}</small></td><td>${g.currentStation ? `Station ${g.currentStation}` : 'Looking for a station'}</td><td>${g.answeredCount}/6</td><td><span class="saved-indicators">${g.savedStations.map((saved, index) => `<span class="${saved ? 'saved' : ''}" title="Station ${index + 1}: ${saved ? 'answer saved' : 'not saved'}">${index + 1}</span>`).join('')}</span></td><td>${g.visitEndsAt ? clockMarkup(g.visitEndsAt) : '—'}</td><td>${g.submitted ? 'Final submitted' : g.reviewUnlocked ? 'Review' : esc(g.status)}${!g.online ? ' · Disconnected' : ''}</td><td>${g.submitted ? elapsedText(g.elapsedMs) : 'Not submitted'}</td></tr>`).join('')}</tbody></table></div>`;
}
function hostDashboard() {
  const submitted = state.groups.filter(g => g.submitted).length;
  const occupied = state.stations.reduce((total,station)=>total+station.count,0);
  return `${header()}<main class="dashboard"><div class="case-layout"><aside class="case-desk paper"><span class="eyebrow">TEACHER’S CASE DESK</span><h1>${state.phase === 'ended' ? 'Museum closed' : 'The investigation is underway'}</h1><img class="case-scene" src="./assets/ui/museum.webp" alt="Aina investigating the missing jewel in the red-and-gold museum"><div class="case-metrics"><div><strong>${state.groups.length}</strong><span>Groups joined</span></div><div><strong>${state.onlineCount}</strong><span>Online now</span></div><div><strong>${occupied}/12</strong><span>At stations</span></div><div><strong>${submitted}</strong><span>Final submitted</span></div></div><p class="desk-note">Groups choose their own route. Saved answers are not marked until Final Submission.</p><div class="dashboard-actions">${!state.resultsReleased ? btn('Reveal Results', 'reveal', 'button ghost wide') : ''}${state.phase === 'active' ? btn('End / Close Room', 'end', 'button danger wide') : btn('Start a new room', 'new-room', 'button gold wide')}</div></aside><section class="station-board"><div class="section-head"><div><span class="eyebrow">LIVE MUSEUM FLOOR</span><h2>Six stations. One mystery.</h2></div><span class="board-status">${state.phase === 'ended' ? 'Room closed' : 'Investigation in progress'}</span></div><p class="board-caption">Two places per station · each group has its own five-minute clock</p>${stationTiles()}</section></div><section class="progress-board"><div class="section-head"><div><span class="eyebrow">THE INVESTIGATORS</span><h2>Group progress</h2></div><span>Saved does not mean correct · answers remain private</span></div>${groupTable()}</section>${state.resultsReleased ? resultsContent(true) : ''}</main>`;
}
function studentEntry() {
  return `${header()}<main class="entry"><div class="entry-art"></div><section class="paper"><span class="eyebrow">YOUR CASE STARTS HERE</span><h1>Join the investigation</h1><p>Look at your teacher’s screen, then scan the six printed station cards around the classroom.</p><label for="group-name">Group name</label><input id="group-name" maxlength="28" autocomplete="off" placeholder="Enter your group name" value="${esc(ui.name)}">${btn(pendingJoin ? 'Confirming your place…' : 'Enter Museum →', 'join', 'button gold wide', ui.busy || pendingJoin ? 'disabled' : '')}</section></main>`;
}
function studentWaiting() {
  return `${header()}<main class="phone-content"><div class="phone-hero"><div><span class="eyebrow">ROOM ${pin}</span><h1>Welcome, ${esc(state.me.name)}</h1></div></div><section class="paper"><h2>Waiting for your teacher</h2><p>${esc(state.instructions)}</p><p>When the game starts, scan any station card. You do not have to start at Station 1.</p><p class="safe-note">Two groups can work at each station. Your answers stay private until you submit all six.</p></section></main>`;
}
function mapScreen() {
  const me = state.me;
  return `<main class="phone-content"><div class="phone-page-head"><span class="eyebrow">ROOM ${pin} · ${esc(me.name)}</span><h1>${me.reviewUnlocked ? 'Review your route' : 'Choose your next station'}</h1><p>${me.reviewUnlocked ? 'All six stations answered! You may now revisit any station to check your choices. Submit your final answers when your group is ready.' : 'Find a printed station card and scan its QR code. The map shows space, but does not open a paragraph.'}</p></div><div class="progress-line"><strong>${me.answeredCount}/6 saved</strong><span>${me.reviewUnlocked ? 'Review Mode unlocked' : 'Exploration Mode'}</span><span>Overall time <time data-start-at="${state.startAt}">${formatTime(Date.now() + clockSkew - state.startAt)}</time></span></div><div class="map-grid">${state.stations.map(station => `<article class="map-card"><div class="map-card-top"><span class="station-stamp">${station.number}</span><div><span class="eyebrow">CASE FILE ${station.number}</span><h2>${esc(station.title)}</h2></div></div><div class="map-card-foot"><span>${station.count === 2 ? 'FULL 2/2' : `${station.count}/2 places used`}</span><span>${me.choices[station.number - 1] ? 'Answer saved' : 'Not answered'}</span></div></article>`).join('')}</div><div class="sticky-actions">${btn('Scan Station QR', 'scan', 'button gold wide')}${btn('My six answers', 'overview', 'button ghost wide')}</div></main>`;
}
function visitEndedScreen() {
  const last = state.me.lastVisitEnd;
  const text = last?.reason === 'expired' ? `Time’s up! ${last.hadSavedAnswer ? 'Your saved answer has been kept.' : 'No answer was saved.'} Choose another station.` :
    last?.reason === 'left' ? `Your answer for Station ${last.station} was saved. Choose another station.` : 'Your visit has ended. Choose another station.';
  return `<main class="phone-content visit-end"><div class="case-stamp">${last?.station || '◆'}</div><section class="paper"><span class="eyebrow">STATION VISIT ENDED</span><h1>${last?.reason === 'expired' ? 'Time’s up!' : 'Case note saved'}</h1><p>${esc(text)}</p>${btn('Choose another station →', 'map', 'button gold wide')}${btn('My six answers', 'overview', 'button ghost wide')}</section></main>`;
}
function scannerScreen() {
  return `<main class="phone-content"><div class="phone-page-head"><span class="eyebrow">STATION SCANNER</span><h1>Scan a printed station QR</h1><p>Point your camera at one of the six museum station cards. The station opens here, inside the game, if a place is free.</p></div><div class="scanner"><video id="camera-video" autoplay playsinline muted aria-label="Rear camera for station QR scanning"></video><div class="scan-frame" aria-hidden="true"></div></div>${ui.scanError ? `<div class="alert" role="status">${esc(ui.scanError)}</div>` : ''}${ui.cameraError ? `<div class="alert" role="status">${esc(ui.cameraError)}</div>` : ''}<div class="scanner-actions">${!media ? btn('Retry camera', 'retry-camera', 'button gold') : btn('Close camera', 'close-camera', 'button ghost')}${btn('Back to map', 'map', 'button ghost')}</div><details class="backup"><summary>Camera not working? Use the code printed on the station card</summary><p>Type the eight-character backup code shown beside that station’s QR. You must be at the printed card.</p><label for="station-code">Station card code</label><input id="station-code" maxlength="12" autocapitalize="characters" autocomplete="off" placeholder="Eight-character code">${btn('Enter printed code', 'manual-scan', 'button ghost wide')}</details></main>`;
}
function optionsList() {
  return `<div class="option-bank">${Object.entries(state.options).map(([letter, text]) => {
    const assigned = state.me.choices.findIndex((choice, index) => index !== state.me.activeVisit.station - 1 && choice === letter);
    return `<button type="button" class="option ${ui.draft === letter ? 'selected' : ''}" data-action="choose" data-letter="${letter}" aria-pressed="${ui.draft === letter}"><b>${letter}</b><span>${esc(text)}</span>${assigned >= 0 ? `<small>Saved at Station ${assigned + 1}</small>` : ''}</button>`;
  }).join('')}</div>`;
}
function activeStation() {
  const me = state.me, visit = me.activeVisit, paragraph = state.paragraph, savedLetter = me.choices[visit.station - 1];
  const draftSaved = ui.draft && ui.draft === savedLetter;
  return `<main class="phone-content active-station"><div class="station-heading"><div><span class="eyebrow">STATION ${visit.station} · PARAGRAPH ${visit.station}</span><h1>${esc(paragraph.title)}</h1></div><div class="visit-clock"><small>TIME LEFT</small>${clockMarkup(visit.expiresAt)}</div></div><img class="station-art" src="./assets/${esc(paragraph.image)}" alt="Museum scene for Station ${visit.station}"><section class="paper reading-panel"><span class="eyebrow">CASE FILE ${visit.station}</span><p>${esc(paragraph.before)} <span class="gap">[${visit.station}] ${ui.draft ? esc(state.options[ui.draft]) : '__________'}</span> ${esc(paragraph.after)}</p></section><details class="choices" open><summary>Choose one sentence A–H</summary>${optionsList()}</details><div class="answer-status ${draftSaved ? 'saved' : 'draft'}" role="status">${draftSaved ? `Sentence ${esc(ui.draft)} saved on the server.` : ui.draft ? `Sentence ${esc(ui.draft)} selected on this phone — not saved yet.` : savedLetter ? `Sentence ${esc(savedLetter)} saved. Choose another to revise.` : 'No answer saved yet.'}</div><div class="sticky-actions">${btn(ui.busy ? 'Saving…' : 'Save Answer', 'save', 'button gold wide', !ui.draft || ui.busy ? 'disabled' : '')}${btn(ui.busy ? 'Saving…' : 'Save & Leave Station', 'save-leave', 'button ghost wide', !ui.draft || ui.busy ? 'disabled' : '')}${btn('My six answers', 'overview', 'button subtle wide')}</div></main>`;
}
function overviewScreen() {
  const me = state.me;
  return `<main class="phone-content"><div class="phone-page-head"><span class="eyebrow">YOUR GROUP’S CASE NOTES</span><h1>Six answer slots</h1><p>Your saved choices are provisional. They are not marked yet. You can revise them at a station before final submission.</p></div><div class="overview-list">${me.choices.map((letter, i) => `<article><div><b>Station ${i + 1}</b><small>${esc(state.stations[i].title)}</small></div><div>${letter ? `<span class="choice-letter">${esc(letter)}</span><p>${esc(state.options[letter])}</p>` : '<span class="empty-choice">No answer saved</span>'}</div></article>`).join('')}</div><div class="sticky-actions">${me.activeVisit ? btn('Back to station', 'map', 'button ghost wide') : btn('Back to station map', 'map', 'button ghost wide')}${btn('Final Submission', 'submit', 'button gold wide', me.answeredCount !== 6 || ui.busy ? 'disabled' : '')}</div></main>`;
}
function submittedScreen() {
  const me = state.me;
  return `<main class="phone-content"><div class="phone-hero"><div><span class="eyebrow">CASE FILE LOCKED</span><h1>Final answers submitted</h1></div></div><section class="paper"><p>Your six saved choices are locked. Your completion time: <b>${elapsedText(me.elapsedMs)}</b>.</p><p>Wait for your teacher to release the results. Other groups can keep investigating.</p></section><div class="overview-list">${me.choices.map((letter, i) => `<article><div><b>Station ${i + 1}</b><small>${esc(state.stations[i].title)}</small></div><div><span class="choice-letter">${esc(letter)}</span><p>${esc(state.options[letter])}</p></div></article>`).join('')}</div></main>`;
}
function resultsContent(teacher = false) {
  const ranking = state.ranking || [];
  return `<section class="results"><div class="section-head"><h2>Final results</h2><span>Accuracy first · time breaks score ties</span></div><div class="rank-list">${ranking.length ? ranking.map(row => `<div><strong>#${row.rank} ${esc(row.name)}</strong><span>${row.score}/6 · ${elapsedText(row.elapsedMs)}</span></div>`).join('') : '<p>No groups submitted final answers.</p>'}</div>${!teacher && state.me?.submitted ? `<p class="my-result">Your score: <b>${state.myScore}/6</b></p>` : ''}<details class="solutions"><summary>Review the six paragraphs and answers</summary>${(state.solutions || []).map(s => `<article><h3>Station ${s.number}: ${esc(s.title)}</h3><p>${esc(s.before)} <b>[${s.number}] ${esc(s.sentence)}</b> ${esc(s.after)}</p><p><strong>Answer ${s.answer}:</strong> ${esc(s.explanation)}</p></article>`).join('')}<p>${Object.values(state.distractors || {}).map(esc).join(' ')}</p></details></section>`;
}
function studentContent() {
  if (!token) return studentEntry();
  if (!state || state.role !== 'student') return `${header()}<main class="phone-content"><section class="paper"><h1>Opening your saved group place…</h1></section></main>`;
  if (state.resultsReleased) return `${header()}<main class="phone-content">${state.me.submitted ? '<div class="phone-page-head"><h1>Your investigation is complete</h1></div>' : '<div class="phone-page-head"><h1>Results released</h1><p>Your group did not submit final answers.</p></div>'}${resultsContent()}</main>`;
  if (state.phase === 'lobby') return studentWaiting();
  if (state.phase === 'ended') return `${header()}<main class="phone-content"><section class="paper"><h1>The museum room has closed</h1><p>Your saved answers remain recorded. ${state.me.submitted ? 'Your final choices are locked.' : 'Your group did not submit final answers.'}</p><p>Wait for your teacher to release the results.</p></section></main>`;
  if (state.me.submitted) return `${header()}${submittedScreen()}`;
  return `${header()}${state.me.activeVisit && ui.screen !== 'overview' ? activeStation() : ui.screen === 'scanner' ? scannerScreen() : ui.screen === 'overview' ? overviewScreen() : ui.screen === 'visit-ended' ? visitEndedScreen() : mapScreen()}`;
}
function modal() {
  if (ui.modal === 'move' && ui.move) return `<div class="modal-backdrop"><section class="modal"><h2>Move sentence ${esc(ui.move.letter)}?</h2><p>It is already saved at Station ${ui.move.from}. Moving it here will leave Station ${ui.move.from} unanswered. You must revisit that station to fill its gap.</p><div class="modal-actions">${btn('Cancel', 'close-modal', 'button ghost')}${btn('Yes, move and save', 'confirm-move', 'button gold')}</div></section></div>`;
  if (ui.modal === 'submit') return `<div class="modal-backdrop"><section class="modal"><h2>Final Submission</h2><p>Submit these six answers? This will lock your choices and stop your completion timer. You cannot edit them afterwards.</p><div class="submission-letters">${state.me.choices.map((letter, i) => `<span>${i + 1}: <b>${esc(letter)}</b></span>`).join('')}</div><div class="modal-actions">${btn('Keep reviewing', 'close-modal', 'button ghost')}${btn('Confirm final submission', 'confirm-submit', 'button gold')}</div></section></div>`;
  if (ui.modal === 'end') return `<div class="modal-backdrop"><section class="modal"><h2>Close this room?</h2><p>Students will no longer be able to visit stations or submit. This is separate from revealing results.</p><div class="modal-actions">${btn('Cancel', 'close-modal', 'button ghost')}${btn('End / Close Room', 'confirm-end', 'button danger')}</div></section></div>`;
  if (ui.modal === 'reveal') return `<div class="modal-backdrop"><section class="modal"><h2>Release the answers to everyone?</h2><p>This deliberately reveals scores, all six completed paragraphs and the answer key to every joined group. ${state.phase === 'active' ? 'Some groups are still playing.' : ''}</p><div class="modal-actions">${btn('Cancel', 'close-modal', 'button ghost')}${btn('Reveal Results', 'confirm-reveal', 'button gold')}</div></section></div>`;
  if (ui.modal === 'join-qr' && mode === 'host' && state?.role === 'host' && state.phase === 'active') return `<div class="modal-backdrop"><section class="modal join-modal"><div class="modal-head"><h2>Join this museum room</h2>${btn('Close', 'close-modal', 'button ghost tiny')}</div><p>Late groups can join the same room. Their competitive time still begins at the original Start Game time.</p><img class="join-qr" src="${apiBase}/${pin}/qr.svg" alt="QR code to join room ${pin}"><div class="pin">${pin}</div>${btn('Copy group link', 'copy-link', 'button ghost wide')}</section></div>`;
  return '';
}
function render() {
  app.className = mode === 'host' ? 'shell teacher' : 'shell phone';
  const content = mode === 'host' ? state?.role === 'host' ? state.phase === 'lobby' ? hostLobby() : hostDashboard() : `${header()}<div class="panel"><h1>Opening teacher room…</h1></div>` :
    mode === 'join' ? studentContent() : mode === 'student' ? `${header()}<main class="phone-content"><section class="paper"><h1>Join a museum room</h1><p>Scan your teacher’s joining QR or enter the five-digit PIN.</p><label for="entry-pin">Room PIN</label><input id="entry-pin" inputmode="numeric" pattern="[0-9]*" maxlength="5" placeholder="12345" value="${esc(ui.entryPin)}">${btn('Continue →', 'enter-pin', 'button gold wide')}</section></main>` : `${header()}<div class="panel"><h1>Opening your museum room…</h1>${btn('Retry', 'retry-create', 'button ghost')}</div>`;
  app.innerHTML = content + (ui.error ? `<div class="toast error" role="alert">${esc(ui.error)} ${btn('Retry', 'retry', 'button ghost tiny')}</div>` : '') +
    (ui.notice ? `<div class="toast" role="status">${esc(ui.notice)}</div>` : '') + modal();
  attachVideo(); updateClocks();
}

async function openCamera() {
  if (mode !== 'join' || !state || state.phase !== 'active' || state.me.activeVisit || state.me.submitted || media) return;
  if (!navigator.mediaDevices?.getUserMedia) { ui.cameraError = 'This browser has no camera access. Try the printed backup code on the station card.'; render(); return; }
  try {
    media = await navigator.mediaDevices.getUserMedia({ audio: false, video: { facingMode: { ideal: 'environment' }, width: { ideal: 640 }, height: { ideal: 480 } } });
    if (ui.screen !== 'scanner' || state.me.activeVisit) { stopCamera(); return; }
    ui.cameraError = ''; render(); scanLoop();
  } catch { ui.cameraError = 'Camera unavailable or permission denied. Allow access and retry, or enter the backup code printed on this station card. Your answers are safe.'; render(); }
}
function scanLoop() {
  if (!media || ui.screen !== 'scanner' || !state || state.me.activeVisit) return;
  const video = document.getElementById('camera-video');
  if (video?.readyState >= 2 && video.videoWidth > 0 && video.videoHeight > 0 && !pending && Date.now() - lastDecode > 270 && typeof window.jsQR === 'function') {
    lastDecode = Date.now(); const canvas = document.createElement('canvas');
    canvas.width = Math.min(560, video.videoWidth); canvas.height = Math.round(canvas.width * video.videoHeight / video.videoWidth);
    const ctx = canvas.getContext('2d', { willReadFrequently: true }); ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    const found = window.jsQR(ctx.getImageData(0, 0, canvas.width, canvas.height).data, canvas.width, canvas.height, { inversionAttempts: 'dontInvert' });
    if (!found?.data) scanSeen = '';
    else if (found.data !== scanSeen) {
      scanSeen = found.data;
      if (/^MMJ1\|S\|[1-6]\|[A-Z0-9]{8}$/.test(found.data)) { ui.scanError = ''; void sendAction('student:scan', { code: found.data }); }
      else { ui.scanError = 'That is not a Museum Jewel station QR code. Please scan one of the six printed station cards.'; render(); }
    }
  }
  scanFrame = requestAnimationFrame(scanLoop);
}
function saveAnswer(leave = false, confirmMove = false) {
  const visit = state?.me?.activeVisit, letter = ui.draft;
  if (!visit || !letter) return;
  const from = state.me.choices.findIndex((choice, index) => index !== visit.station - 1 && choice === letter);
  if (from >= 0 && !confirmMove) { ui.move = { from: from + 1, letter, leave }; ui.modal = 'move'; render(); return; }
  ui.modal = ''; ui.move = null;
  void sendAction(leave ? 'student:save-leave' : 'student:save', { visitId: visit.id, station: visit.station, letter,
    expectedVersion: state.me.answerVersion, confirmMove });
}
app.addEventListener('input', event => {
  if (event.target.id === 'group-name') ui.name = event.target.value;
  if (event.target.id === 'entry-pin') ui.entryPin = event.target.value.replace(/\D/g, '').slice(0, 5);
});
app.addEventListener('click', event => {
  const control = event.target.closest('[data-action]'); if (!control) return;
  const action = control.dataset.action;
  if (action === 'retry') { void loadState(); return; }
  if (action === 'retry-create') { void createRoom(true); return; }
  if (action === 'enter-pin') { if (/^\d{5}$/.test(ui.entryPin)) navigate('join', ui.entryPin); else notice('Enter the five-digit room PIN.'); return; }
  if (action === 'join') { void joinGroup(); return; }
  if (action === 'fullscreen') { if (document.fullscreenElement) void document.exitFullscreen(); else void document.documentElement.requestFullscreen().catch(() => notice('Full screen was blocked by this browser.')); return; }
  if (action === 'cards') { window.open('./cards.html', '_blank', 'noopener'); return; }
  if (action === 'copy-link') { void navigator.clipboard.writeText(`${location.origin}/battle11/index.html?join=${pin}`).then(() => notice('Group link copied.')).catch(() => notice('Use the QR code or room PIN to join.')); return; }
  if (action === 'start') { void sendAction('host:start'); return; }
  if (action === 'end') { ui.modal = 'end'; render(); return; }
  if (action === 'confirm-end') { ui.modal = ''; void sendAction('host:end'); return; }
  if (action === 'reveal') { ui.modal = 'reveal'; render(); return; }
  if (action === 'confirm-reveal') { ui.modal = ''; void sendAction('host:reveal'); return; }
  if (action === 'new-room') { storage.remove('museum-jewel:last-host'); navigate('home'); void createRoom(true); return; }
  if (action === 'join-qr') { ui.modal = 'join-qr'; render(); return; }
  if (action === 'close-modal') { ui.modal = ''; ui.move = null; render(); return; }
  if (action === 'scan') { ui.screen = 'scanner'; ui.scanError = ''; render(); void openCamera(); return; }
  if (action === 'retry-camera') { void openCamera(); return; }
  if (action === 'close-camera') { stopCamera(); render(); return; }
  if (action === 'map') { stopCamera(); ui.screen = 'map'; render(); return; }
  if (action === 'overview') { stopCamera(); ui.screen = 'overview'; render(); return; }
  if (action === 'manual-scan') { const code = document.getElementById('station-code')?.value?.trim().toUpperCase(); if (code) void sendAction('student:scan', { code }); else notice('Enter the backup code printed on a station card.'); return; }
  if (action === 'choose') { ui.draft = control.dataset.letter; render(); return; }
  if (action === 'save') { saveAnswer(); return; }
  if (action === 'save-leave') { saveAnswer(true); return; }
  if (action === 'confirm-move') { const move = ui.move; if (move) saveAnswer(move.leave, true); return; }
  if (action === 'submit') { if (state.me.answeredCount === 6) { ui.modal = 'submit'; render(); } return; }
  if (action === 'confirm-submit') { ui.modal = ''; void sendAction('student:submit', { expectedVersion: state.me.answerVersion }); return; }
});
setInterval(() => {
  updateClocks();
  if (pending && token && !actionInFlight && Date.now() - lastAction > 900) void deliverAction();
  if (pendingJoin && !joinInFlight && Date.now() - lastJoin > 900) void deliverJoin();
  const interval = document.hidden ? 9000 : mode === 'host' ? 3000 : 4000;
  if (Date.now() - lastPoll > interval) void loadState();
}, 800);
document.addEventListener('visibilitychange', () => { if (!document.hidden) { void loadState(); if (ui.screen === 'scanner' && media && !scanFrame) scanLoop(); } });
window.addEventListener('online', () => { ui.online = true; if (pending) void deliverAction(); if (pendingJoin) void deliverJoin(); void loadState(); });
window.addEventListener('pagehide', stopCamera);
initialRoute();
