const app = document.getElementById('app');
const apiBase = '/api/demolition/rooms';
const palette = ['#b75548','#4e88a7','#8f67b3','#d69a40','#4d9576','#d07390','#6379b2','#a37a48','#689f42','#bb704b'];
const icons = ['🔨','🪚','🧱','⚙️','💥','🏗️','🪜','🛠️','🚧','✨'];
const storage = {
  get(key) { try { return localStorage.getItem(key); } catch { return null; } },
  set(key, value) { try { localStorage.setItem(key, value); } catch {} },
  remove(key) { try { localStorage.removeItem(key); } catch {} },
};
const session = {
  get(key) { try { return sessionStorage.getItem(key); } catch { return null; } },
  set(key, value) { try { sessionStorage.setItem(key, value); } catch {} },
};
const esc = value => String(value ?? '').replace(/[&<>"']/g, character => ({ '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#39;' })[character]);
const uid = () => crypto.randomUUID();
const btn = (label, action, cls = 'button green', attrs = '') => `<button type="button" class="${cls}" data-action="${action}" ${attrs}>${label}</button>`;
const disabled = value => value ? 'disabled' : '';
let mode = 'home', pin = '', token = '', state = null, pending = null, pendingJoin = null;
let routeGeneration = 0, pollInFlight = false, actionInFlight = false, joinInFlight = false, lastPoll = 0, lastAction = 0, lastJoin = 0, clockOffset = 0;
const ui = { error:'', notice:'', online:navigator.onLine, selectedAnswer:'', questionId:null, selectedHouse:null, reviewOpen:false,
  reviewQuestionId:null, modal:null, selectedSlot:0, teamName:'', visibleSlots:10, studentTab:'question', busy:false, signature:'' };
const studentKey = 'demolition-dash:student-route';
const hostKey = room => `demolition-dash:host:${room}`;
const teamKey = room => `demolition-dash:team:${room}`;
const pendingKey = room => `demolition-dash:pending:${room}`;
const joinKey = room => `demolition-dash:pending-join:${room}`;
const active = () => state && ['question','wrap'].includes(state.phase);
const countdown = () => state?.deadlineAt ? Math.max(0, Math.ceil((state.deadlineAt - Date.now() - clockOffset) / 1000)) : null;
const currentQuestion = () => state?.question || null;
const isStudentTab = () => session.get(studentKey) !== null;
const rememberedStudent = () => { try { const value = JSON.parse(session.get(studentKey) || 'null'); return value?.room && /^\d{5}$/.test(value.room) ? value.room : null; } catch { return null; } };
const rememberStudent = room => session.set(studentKey, JSON.stringify({ room }));
const changeUrl = search => history.replaceState({}, '', `./index.html${search}`);
const teamColor = slot => palette[((slot || 1) - 1) % palette.length];
const teamIcon = slot => icons[((slot || 1) - 1) % icons.length];

async function api(path, body, auth = token) {
  const controller = new AbortController(), timeout = setTimeout(() => controller.abort(), 12000);
  try {
    const response = await fetch(path, { method: body ? 'POST' : 'GET', cache:'no-store', signal: controller.signal,
      headers: { ...(body ? { 'Content-Type':'application/json' } : {}), ...(auth ? { Authorization:`Bearer ${auth}` } : {}) },
      body: body ? JSON.stringify(body) : undefined });
    let data; try { data = await response.json(); } catch { throw new Error('The room server returned an unexpected response.'); }
    if (!response.ok) { const error = new Error(data.error || 'That action could not be completed.'); error.status = response.status; error.code = data.code; throw error; }
    return data;
  } finally { clearTimeout(timeout); }
}
function notice(text) { ui.notice = text; document.getElementById('announcer').textContent = text; render(); setTimeout(() => { if (ui.notice === text) { ui.notice = ''; render(); } }, 4500); }
function applyState(next, force = false) {
  if (!next || String(next.pin) !== pin) return;
  if (mode === 'host' && next.role !== 'host') { ui.error = 'This is a private teacher room. Open it on the device where it was created.'; state = null; render(); return; }
  if (mode === 'join' && next.role === 'host') { ui.error = 'A student tab cannot become the teacher screen.'; state = null; render(); return; }
  if (state && next.version < state.version) return;
  const previousQuestion = state?.question?.id;
  state = next; if (next.serverTime) clockOffset = next.serverTime - Date.now();
  if (mode === 'host' && next.role === 'host' && window.parent !== window) {
    window.parent.postMessage({ type:'demolition-dash:status', pin, phase:next.phase,
      onlineCount:next.teams.filter(team => team.online).length }, location.origin);
  }
  if (mode === 'host' && next.role === 'host') storage.set('demolition-dash:last-host', pin);
  if (previousQuestion !== next.question?.id) { ui.selectedAnswer = ''; ui.questionId = next.question?.id ?? null; ui.reviewOpen = false; ui.reviewQuestionId = next.question?.id ?? null; if (previousQuestion && mode === 'join') ui.studentTab = 'question'; }
  const signature = JSON.stringify({ ...next, serverTime:0 });
  if (force || signature !== ui.signature) { ui.signature = signature; render(); }
}
async function loadState() {
  if (!/^\d{5}$/.test(pin) || pollInFlight || mode === 'student' || mode === 'home') return;
  pollInFlight = true; lastPoll = Date.now(); const generation = routeGeneration;
  try { const data = await api(`${apiBase}/${pin}/state`, undefined, mode === 'screen' ? '' : token); if (generation !== routeGeneration) return;
    const reconnected = !ui.online; ui.online = true; ui.error = ''; applyState(data.state || data, reconnected); if (reconnected) notice('Reconnected to your room.'); }
  catch (error) { if (generation !== routeGeneration) return;
    if (error.status === 404) { state = null; ui.online = false; ui.error = 'This room PIN is not active. Ask your teacher for the current QR code.'; render(); }
    else if (error.status === 401) { state = null; ui.error = 'Your saved device key could not be verified. Ask your teacher for help.'; render(); }
    else if (!error.status) { if (ui.online) { ui.online = false; render(); } if (!state) { ui.error = 'Connection interrupted. Your team place is saved; retrying automatically.'; render(); } }
    else if (!state) { ui.error = error.message; render(); }
  } finally { pollInFlight = false; }
}
async function createRoom(fresh = false) {
  if (mode !== 'home' || isStudentTab() || ui.busy) return;
  const saved = storage.get('demolition-dash:last-host');
  if (!fresh && /^\d{5}$/.test(saved || '') && storage.get(hostKey(saved))) { navigate('host', saved); return; }
  ui.busy = true; ui.error = ''; render();
  try { const data = await api(apiBase, { teamCount:40, roomName:'Demolition Dash' }, '');
    if (!/^\d{5}$/.test(data.pin) || !/^[a-f0-9]{64}$/.test(data.hostToken || '')) throw new Error('The teacher room was not confirmed.');
    storage.set(hostKey(data.pin), data.hostToken); storage.set('demolition-dash:last-host', data.pin); ui.busy = false; navigate('host', data.pin); }
  catch (error) { ui.busy = false; ui.error = error.message; render(); }
}
function navigate(nextMode, nextPin = '') {
  const sticky = rememberedStudent();
  if (nextMode === 'join' && /^\d{5}$/.test(nextPin)) rememberStudent(nextPin);
  if ((nextMode === 'host' || nextMode === 'screen') && isStudentTab()) { nextMode = sticky ? 'join' : 'student'; nextPin = sticky || ''; }
  routeGeneration++; mode = nextMode; pin = nextPin; token = nextMode === 'host' ? storage.get(hostKey(pin)) || '' : nextMode === 'join' ? storage.get(teamKey(pin)) || '' : '';
  state = null; ui.signature = ''; ui.error = ''; ui.selectedAnswer = ''; ui.selectedSlot = 0; ui.reviewOpen = false; ui.modal = null; ui.busy = false;
  pending = pin ? readSaved(pendingKey(pin)) : null; pendingJoin = nextMode === 'join' && !token ? readSaved(joinKey(pin)) : null;
  if (['host','join','screen'].includes(mode)) changeUrl(`?${mode === 'host' ? 'host' : mode === 'join' ? 'join' : 'screen'}=${pin}`);
  else if (mode === 'student') changeUrl('?student=1');
  render(); if (pendingJoin) deliverJoin(); if (pending && token) deliverAction(); loadState();
}
function readSaved(key) { try { return JSON.parse(storage.get(key) || 'null'); } catch { return null; } }
function initialRoute() {
  const params = new URLSearchParams(location.search), sticky = rememberedStudent();
  if (params.has('join') && /^\d{5}$/.test(params.get('join') || '')) return navigate('join', params.get('join'));
  if (sticky) return navigate('join', sticky);
  if (params.has('student') || isStudentTab()) return navigate('student');
  if (params.has('screen') && /^\d{5}$/.test(params.get('screen') || '')) return navigate('screen', params.get('screen'));
  if (params.has('host') && /^\d{5}$/.test(params.get('host') || '')) return navigate('host', params.get('host'));
  mode = 'home'; render(); createRoom();
}
async function joinTeam() {
  if (mode !== 'join' || token || pendingJoin || !ui.selectedSlot || !ui.teamName.trim()) return;
  let clientId = storage.get('demolition-dash:client-id'); if (!clientId) { clientId = uid(); storage.set('demolition-dash:client-id', clientId); }
  pendingJoin = { clientId, teamSlot:ui.selectedSlot, name:ui.teamName.trim() };
  storage.set(joinKey(pin), JSON.stringify(pendingJoin)); ui.busy = true; render(); await deliverJoin();
}
async function deliverJoin() {
  if (!pendingJoin || joinInFlight || mode !== 'join') return;
  joinInFlight = true; lastJoin = Date.now(); const generation = routeGeneration, attempt = pendingJoin;
  try { const data = await api(`${apiBase}/${pin}/join`, attempt, ''); if (generation !== routeGeneration || pendingJoin !== attempt) return;
    storage.set(teamKey(pin), data.teamToken); storage.remove(joinKey(pin)); token = data.teamToken; pendingJoin = null; ui.busy = false; ui.error = ''; state = null; render(); await loadState(); }
  catch (error) { if (generation !== routeGeneration || pendingJoin !== attempt) return;
    if (error.status >= 400 && error.status < 500 && error.status !== 429) { storage.remove(joinKey(pin)); pendingJoin = null; ui.busy = false; ui.selectedSlot = 0; ui.error = error.message; render(); await loadState(); }
    else { ui.online = false; ui.error = 'Confirming your team place. Reconnecting safely…'; render(); }
  } finally { joinInFlight = false; }
}
async function sendAction(type, extra = {}) {
  if (pending || ui.busy || !token || !state || ((type.startsWith('host:') && mode !== 'host') || (type.startsWith('pupil:') && mode !== 'join'))) return;
  pending = { type, requestId:uid(), ...extra };
  storage.set(pendingKey(pin), JSON.stringify(pending)); ui.busy = true; ui.error = ''; render(); await deliverAction();
}
async function deliverAction() {
  if (!pending || actionInFlight || !token) return;
  actionInFlight = true; lastAction = Date.now(); const generation = routeGeneration, action = pending;
  try { const data = await api(`${apiBase}/${pin}/action`, action); if (generation !== routeGeneration || pending !== action) return;
    pending = null; storage.remove(pendingKey(pin)); ui.busy = false; ui.online = true; ui.error = '';
    if (action.type === 'host:advance') ui.reviewOpen = false;
    if (action.type === 'pupil:play' && ui.modal?.type === 'target') ui.modal = null;
    if (action.type === 'host:finish' || action.type === 'host:end-early') ui.modal = null;
    applyState(data.state, true);
    if (data.result?.message) notice(data.result.message);
    if (action.type === 'pupil:choose' && data.result?.card) notice(`${data.result.card.icon} ${data.result.card.name}${data.result.card.immediate ? ' — +1 wall immediately!' : ' saved to your hand.'}`);
  } catch (error) { if (generation !== routeGeneration || pending !== action) return;
    if (error.status >= 400 && error.status < 500 && error.status !== 429) { pending = null; storage.remove(pendingKey(pin)); ui.busy = false; ui.error = error.message; render(); await loadState(); }
    else { ui.online = false; ui.error = 'Action not confirmed. Retrying with the same receipt…'; render(); }
  } finally { actionInFlight = false; }
}

function header(role) {
  const label = role === 'host' ? 'TEACHER DESK' : role === 'screen' ? 'CLASSROOM SCREEN' : role === 'join' ? 'YOUR TEAM' : 'BATTLE 8';
  return `<header class="topbar"><a class="brand" href="${role === 'join' ? './index.html?student=1' : '/'}" ${role === 'host' || role === 'screen' ? 'target="_top"' : ''}><span class="brand-mark">🏚️</span><span><strong>Demolition Dash</strong><small>OLD HOUSE · ${label}</small></span></a><div class="top-meta"><span class="chip ${ui.online ? 'live' : 'offline'}">${ui.online ? 'Connected' : 'Reconnecting…'}</span>${pin ? `<span class="chip">PIN ${esc(pin)}</span>` : ''}${role === 'host' ? btn('⛶ Full screen','fullscreen','button ghost small') : ''}</div></header>`;
}
function house(team, small = false) {
  const remaining = Math.max(0, Number(team?.remaining ?? (Number(team?.original ?? 12) + Number(team?.walls ?? 0))));
  const shields = Math.max(0, Number(team?.shields ?? 0));
  // Display follows the total: added walls restore the house up to 12; only surplus pieces appear as extra blocks.
  const removed = ((12 - Math.min(12, remaining)) / 12 * 100).toFixed(2);
  const extra = Math.max(0, remaining - 12);
  if (small) return `<span class="mini-house" style="--removed:${removed}%"><img src="./assets/cleared_site.webp" alt=""><img class="house" src="./assets/house_illustration.webp" alt="">${extra ? `<em>🧱 +${extra}</em>` : ''}</span>`;
  const stones = Array.from({ length:Math.min(extra, 6) }, () => '<span class="wall-stone"></span>').join('');
  return `<section class="panel house-panel"><div class="panel-head"><h2>${esc(team?.name || 'Old house')}</h2><span>FEWEST PIECES WINS</span></div><div class="panel-body"><div class="house-scene" style="--removed:${removed}%"><img class="lot" src="./assets/cleared_site.webp" alt="Illustrated cleared house site"><img class="house" src="./assets/house_illustration.webp" alt="Illustrated old house changing with the total pieces left"><span class="house-name">${esc(team?.name || 'Team house')}</span>${extra ? `<div class="wall-visual" aria-label="${extra} extra blocks above the full house">${stones}<span class="wall-count">🧱 +${extra}</span></div>` : ''}</div><div class="house-stats"><span>TOTAL LEFT <strong>${remaining}</strong></span><span>SHIELDS <strong>${shields}</strong></span></div></div></section>`;
}
function passage(question) {
  let text = esc(question.text);
  if (question.target_word) {
    const target = esc(question.target_word).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    try { text = text.replace(new RegExp(`\\b(${target})\\b`, 'i'), '<strong>$1</strong>'); } catch {}
  }
  return text;
}
function questionCard(interactive = false) {
  const q = currentQuestion();
  if (!q) return `<section class="panel"><div class="panel-body"><h2>Waiting for the first challenge.</h2><p>Every team begins with 12 pieces. One correct answer earns one blind mystery pick.</p></div></section>`;
  const submitted = interactive && state.me?.submission;
  const expired = countdown() === 0 || !state.questionOpen || state.phase !== 'question';
  const options = ['A','B','C','D'].map(letter => `<button type="button" class="option ${ui.selectedAnswer === letter ? 'selected' : ''}" data-action="choose-answer" data-letter="${letter}" ${disabled(!interactive || submitted || expired || ui.busy)}><b>${letter}</b>${esc(q.options[letter])}</button>`).join('');
  const feedback = submitted?.status === 'accepted' ? '✓ Correct! One mystery draw earned.' : submitted?.status === 'rejected' || (submitted?.status === 'missing' && state.answerReveal?.questionId === q.id) ? '✕ Not correct this time. No mystery draw.' : 'Submitted—waiting for teacher.';
  return `<section class="panel ${interactive ? 'phone-panel phone-question' : ''}"><div class="panel-head"><h2>Question ${state.questionNumber} of 25</h2><span>${esc(q.type === 'reading' ? 'SHORT READING' : 'VOCABULARY')}</span></div><div class="question-card"><span class="eyebrow">${esc(q.genre || 'FORM 3 ENGLISH')} · ID ${q.id}</span><div class="reading">${passage(q)}</div><h2>${esc(q.question)}</h2><div class="options">${options}</div>${interactive ? submitted ? `<p class="finished-banner ${submitted.status === 'rejected' ? 'incorrect' : ''}">Answer ${esc(submitted.answer)} · ${feedback}</p>` : `<button type="button" class="button green wide" data-action="submit-answer" ${disabled(!ui.selectedAnswer || expired || ui.busy)}>${expired ? 'ANSWERS CLOSED' : `SUBMIT ${esc(ui.selectedAnswer || 'ANSWER')}`}</button>` : ''}${state.answerReveal?.questionId === q.id ? `<div class="reveal-key"><b>Answer ${esc(state.answerReveal.letter)}</b><p>${esc(state.answerReveal.explanation)}</p></div>` : ''}</div></section>`;
}
function teamList(selectable = false) {
  if (!state.teams.length) return '<p class="note">Teams will appear here as they join.</p>';
  return `<div class="team-list">${state.teams.map(team => `<button type="button" class="team-tile ${ui.selectedHouse === team.id ? 'picked' : ''}" style="--team:${teamColor(team.slot)}" data-action="select-house" data-team="${esc(team.id)}" ${disabled(!selectable)}>${house(team, true)}<span><b>${teamIcon(team.slot)} ${esc(team.name)}</b><small>🛡️ ${team.shields ?? 0} shields${team.online ? ' · online' : ''}</small></span><span class="piece-total">${team.remaining}</span></button>`).join('')}</div>`;
}
function ranking() {
  return `<div class="leaderboard">${state.ranking.map(team => `<div class="rank"><b>#${team.rank}</b><span>${teamIcon(team.slot)} ${esc(team.name)}</span><strong>${team.remaining} left</strong></div>`).join('') || '<p class="note">No teams yet.</p>'}</div>`;
}
function events() { return `<div class="event-list">${[...(state.events || [])].reverse().slice(0,8).map(item => `<p>✦ ${esc(item.text)}</p>`).join('') || '<p>No moves yet. Let the demolition begin!</p>'}</div>`; }
function teacherControls() {
  const q = currentQuestion(), submitted = state.teams.filter(team => team.submitted).length, pendingCount = state.pendingReviewCount || 0;
  let controls = '';
  if (state.phase === 'lobby') controls = `<p><b>${state.teams.length}/${state.teamCount}</b> teams have joined. Students may join until you start.</p><div class="control-buttons">${btn('START BATTLE 8 →','start','button green wide',disabled(ui.busy || !state.teams.length))}${btn('End this room','end-early-confirm','button red wide',disabled(ui.busy))}</div>`;
  else if (state.phase === 'question') controls = `<p><b>${submitted}/${state.teams.length}</b> submitted this question · automatic marking stays private${pendingCount ? ` · <b>${pendingCount}</b> awaiting confirmation` : ''}.</p><div class="control-buttons">${state.questionOpen ? `${btn(countdown() === null ? '⏱ Start 10-second countdown' : `⏱ ${countdown()} seconds`, 'countdown','button gold wide',disabled(ui.busy || countdown() !== null))}${btn('Close answers / mark missing','close-answer','button secondary wide',disabled(ui.busy))}` : ''}${btn(`Review / change answers${pendingCount ? ` (${pendingCount} pending)` : ''}`,'review','button secondary wide',disabled(ui.busy))}${btn(state.answerReveal?.questionId === q.id ? 'Results confirmed' : 'Confirm results + reveal answer','reveal','button gold wide',disabled(ui.busy || state.answerReveal?.questionId === q.id))}${!state.questionOpen ? btn(state.questionNumber === 25 ? 'Open final Tool Yard →' : 'Next question →','advance','button green wide',disabled(ui.busy || state.teams.some(team => team.verdict === 'submitted'))) : ''}${btn('End game now','end-early-confirm','button red wide',disabled(ui.busy))}</div><p>Review or change the private suggestions, then confirm to close answers and release results and new rewards. Earlier saved cards and draws still work while students wait.</p>`;
  else if (state.phase === 'wrap') controls = `<p>All 25 questions are complete. Teams can still use saved draws and cards.${pendingCount ? ` <b>${pendingCount}</b> older answers await review.` : ''}</p><div class="control-buttons">${btn(`Review / change answers${pendingCount ? ` (${pendingCount} pending)` : ''}`,'review','button secondary wide',disabled(ui.busy))}${btn('Finish and lock results','finish-confirm','button red wide',disabled(ui.busy || pendingCount > 0))}${btn('End game now','end-early-confirm','button red wide',disabled(ui.busy))}</div><p>Locking ends all card actions. Ties share the win.</p>`;
  else controls = `<p>Final results are locked. No card can change them now.</p>${btn('Open a new game','new-room','button green wide')}`;
  return `<section class="panel"><div class="panel-head"><h2>Teacher control</h2><span>${state.phase.toUpperCase()}</span></div><div class="teacher-controls"><h2>${state.phase === 'lobby' ? 'Ready to begin?' : state.phase === 'wrap' ? 'Final Tool Yard' : state.phase === 'finished' ? 'Game complete' : 'You set the pace.'}</h2>${controls}</div></section>`;
}
function statuses() {
  return `<section class="panel"><div class="panel-head"><h2>Team status</h2><span>NO ANSWERS SHOWN</span></div><div class="panel-body status-rows">${state.teams.map(team => `<div class="status-row"><b>${teamIcon(team.slot)} ${esc(team.name)}</b><small>${esc(team.verdict || 'waiting')}${team.online ? ' · online' : ' · saved'}</small></div>`).join('') || '<p>Waiting for teams.</p>'}</div></section>`;
}
function lobby() {
  const qr = `${apiBase}/${esc(pin)}/qr.svg`;
  return `<div class="lobby-layout"><section class="panel join-panel"><span class="eyebrow">SCAN TO JOIN</span><h2>Bring down the house!</h2><p>One phone per team. Scan, choose an available team place, and stay on your phone screen.</p><img class="qr" src="${qr}" alt="QR code to join room ${esc(pin)}"><p>OR ENTER THIS PIN</p><div class="pin">${esc(pin)}</div>${mode === 'host' ? btn('Copy student link','copy-link','button secondary small') : ''}</section><div class="right-stack"><section class="panel"><div class="panel-head"><h2>Teams arriving</h2><span>${state.teams.length}/${state.teamCount}</span></div><div class="panel-body">${teamList(false)}</div></section>${mode === 'host' ? teacherControls() : ''}</div></div>`;
}
function board() {
  const shown = state.teams.find(team => team.id === ui.selectedHouse) || state.ranking[0] || state.teams[0];
  const center = shown ? house(shown) : `<section class="panel"><div class="panel-body">Waiting for the first team.</div></section>`;
  return `<div class="board-grid"><div class="left-stack">${questionCard(false)}${center}<section class="panel"><div class="panel-head"><h2>All teams’ houses</h2><span>LIVE REMAINING PIECES</span></div><div class="panel-body">${teamList(true)}</div></section></div><aside class="right-stack">${mode === 'host' ? teacherControls() : ''}${statuses()}<section class="panel"><div class="panel-head"><h2>${state.phase === 'finished' ? 'Final winners' : 'Fewest left so far'}</h2></div><div class="panel-body">${ranking()}</div></section><section class="panel"><div class="panel-head"><h2>Demolition news</h2></div><div class="panel-body">${events()}</div></section></aside></div>`;
}
function hostOrScreen() {
  return `<main class="shell">${header(mode)}<div class="board-title"><div><h1>Old House Demolition</h1><p>12 starting pieces · 25 Form 3 questions · one blind pick per accepted answer</p></div><strong>${state.phase === 'lobby' ? 'SCAN TO JOIN' : state.phase === 'wrap' ? 'FINAL TOOL YARD' : state.phase === 'finished' ? 'RESULTS LOCKED' : `QUESTION ${state.questionNumber}/25`}</strong></div>${mode === 'host' ? `<p class="privacy-hint">🔒 Review contains private responses and answer keys. If this same screen is mirrored to the class, pause projection before opening Review. A separate public projector link is available below.</p><p>${btn('Open public display ↗','open-projector','button ghost small')} ${state.phase === 'lobby' || state.phase === 'finished' ? btn('Choose another battle','all-battles','button ghost small') : ''}</p>` : ''}${state.phase === 'lobby' ? lobby() : board()}</main>`;
}

function studentEntry() {
  return `<main class="shell phone-shell">${header('join')}<section class="panel center-state"><span class="eyebrow">STUDENT JOIN</span><h1>Find your team’s old house.</h1><p>Scan the QR code on your teacher’s board, or type its five-digit PIN.</p><form id="pin-form"><div class="field"><label for="pin-input">Room PIN</label><input id="pin-input" name="pin" inputmode="numeric" pattern="[0-9]{5}" maxlength="5" autocomplete="off" required></div><button class="button green wide" type="submit">JOIN ROOM →</button></form></section></main>`;
}
function joinView() {
  if (state.phase !== 'lobby') return `<main class="shell phone-shell">${header('join')}<section class="panel center-state"><h1>This game has already started.</h1><p>Reopen the phone that joined your team earlier, or ask your teacher for the next room PIN.</p>${btn('Enter a different PIN','student-entry','button green')}</section></main>`;
  const visible = Math.min(state.teamCount, Math.max(ui.visibleSlots, state.teams.length + 5));
  return `<main class="shell phone-shell">${header('join')}<section class="panel phone-panel"><div class="panel-head"><h2>Choose your team place</h2><span>ROOM ${esc(pin)}</span></div><div class="panel-body"><p>One phone per team. Taken places cannot be picked again. Your team stays saved on this phone.</p><div class="join-grid">${Array.from({ length:visible }, (_, index) => index + 1).map(slot => { const taken = state.takenSlots.includes(slot), member = state.teams.find(team => team.slot === slot); return `<button type="button" class="join-slot ${taken ? 'taken' : ''} ${ui.selectedSlot === slot ? 'picked' : ''}" style="--team:${teamColor(slot)}" data-action="choose-slot" data-slot="${slot}" ${disabled(taken || ui.busy)}><b>${teamIcon(slot)} Team ${slot}</b><small>${taken ? `TAKEN · ${esc(member?.name || 'Team')}` : ui.selectedSlot === slot ? 'YOUR CHOICE ✓' : 'AVAILABLE'}</small></button>`; }).join('')}</div>${visible < state.teamCount ? btn('Show more team places ↓','more-slots','button secondary wide') : ''}<form id="join-form"><div class="field"><label for="team-name">Team name</label><input id="team-name" maxlength="28" value="${esc(ui.teamName)}" placeholder="The Housebreakers" required autocomplete="off"></div><button class="button green wide" type="submit" ${disabled(!ui.selectedSlot || ui.busy)}>JOIN AS THIS TEAM →</button></form>${btn('Use a different PIN','student-entry','link-button')}</div></section></main>`;
}
function studentTools() {
  const me = state.me, usable = active();
  const offer = me.offer ? `<div class="draw-area"><strong>Choose ONE of three mystery cards</strong><p class="note">All backs are identical. The two unpicked cards disappear without being revealed.</p><div class="mystery-cards">${me.offer.slots.map((slot, index) => `<button type="button" class="mystery-card" aria-label="Choose mystery card ${index + 1}" data-action="choose-card" data-slot="${esc(slot.id)}" ${disabled(ui.busy || !usable)}>✦<small>MYSTERY</small></button>`).join('')}</div></div>` : '';
  const drawButton = me.draws ? btn(`🎴 Open one mystery draw (${me.draws} saved)`,'draw','button gold wide',disabled(ui.busy || !usable || Boolean(me.offer))) : '';
  const hand = me.hand.length ? `<div class="hand">${me.hand.map(card => `<button type="button" class="hand-card" data-action="play-card" data-card="${esc(card.id)}" data-key="${esc(card.key)}" ${disabled(ui.busy || !usable)}><span class="icon">${esc(card.icon)}</span><strong>${esc(card.name)}</strong><small>${esc(card.description)}</small></button>`).join('')}</div>` : '<p class="note">Your saved tool cards will appear here. They remain available across questions.</p>';
  return `<section class="panel phone-panel phone-tools" id="tool-yard"><div class="panel-head"><h2>Your Tool Yard</h2><span>${me.draws} DRAW${me.draws === 1 ? '' : 'S'} · ${me.hand.length} CARD${me.hand.length === 1 ? '' : 'S'}</span></div><div class="panel-body"><p class="note">One accepted answer earns one mystery draw. Choose one of three face-down cards. Cards work anytime until the teacher locks final results.</p>${offer}${drawButton}<h3>Saved tools</h3>${hand}${me.lastReveal ? `<p class="reveal-key">Last mystery pick: ${esc(me.lastReveal.icon)} <b>${esc(me.lastReveal.name)}</b>${me.lastReveal.immediate ? ' · effect applied immediately' : ''}</p>` : ''}${!usable ? '<p class="note">Tool Yard actions are locked before start and after final results.</p>' : ''}</div></section>`;
}
function studentView() {
  const me = state.me, myRank = state.ranking.find(row => row.id === me.id);
  const mini = house(me, true);
  const status = state.phase === 'lobby' ? 'Waiting for your teacher to start' : state.phase === 'wrap' ? 'Final Tool Yard: cards still work' : state.phase === 'finished' ? 'Final results locked' : `Question ${state.questionNumber}/25`;
  const questionView = `${state.phase === 'lobby' ? `<section class="panel phone-panel"><div class="panel-body"><h2>You’re in!</h2><p>Keep this tab open. Your team place is saved even if your screen goes dark.</p></div></section>` : state.phase === 'finished' ? `<section class="panel phone-panel"><div class="panel-body finished-banner">🏆 Final: ${me.remaining} piece${me.remaining === 1 ? '' : 's'} left · Rank #${myRank?.rank ?? '?'}. Tied totals share the same place.</div></section>` : state.phase === 'wrap' ? `<section class="panel phone-panel"><div class="panel-body"><h2>All questions complete!</h2><p>Use your final saved draws and tools. Zero is not safe until the teacher locks results.</p></div></section>` : questionCard(true)}${state.phase === 'question' && state.deadlineAt ? `<p class="countdown" id="phone-timer">⏱ ${countdown() || '0'} seconds left to answer · cards still work</p>` : ''}`;
  const toolView = `${studentTools()}<section class="panel phone-panel"><div class="panel-head"><h2>Class demolition</h2></div><div class="panel-body">${ranking()}<h3>Recent moves</h3>${events()}</div></section>`;
  return `<main class="shell phone-shell">${header('join')}<section class="panel phone-panel student-status"><div class="panel-head"><h2>${teamIcon(me.slot)} ${esc(me.name)}</h2><span>${esc(status)}</span></div><div class="panel-body phone-hero">${mini}<div class="stats"><div class="total-left">TOTAL LEFT <b>${me.remaining}</b></div><div>SHIELDS <b>${me.shields}</b></div></div></div></section><nav class="phone-tabs" aria-label="Student game views"><button type="button" data-action="show-question" class="${ui.studentTab === 'question' ? 'active' : ''}" aria-pressed="${ui.studentTab === 'question'}">📖 QUESTION</button><button type="button" data-action="show-tools" class="${ui.studentTab === 'tools' ? 'active' : ''}" aria-pressed="${ui.studentTab === 'tools'}">🛠️ TOOL YARD</button></nav>${ui.studentTab === 'tools' ? toolView : questionView}</main>`;
}
function reviewModal() {
  if (!ui.reviewOpen || mode !== 'host' || !state) return '';
  const qid = ui.reviewQuestionId || state.question?.id || 1;
  const rows = state.reviews.filter(row => row.questionId === qid), key = state.reviewKeys.find(item => item.questionId === qid);
  const currentTeams = state.teams.filter(team => !rows.some(row => row.teamId === team.id));
  return `<div class="modal-backdrop"><section class="modal" role="dialog" aria-modal="true" aria-labelledby="review-title"><header><div><span class="eyebrow">TEACHER ONLY · PRIVATE ANSWERS</span><h2 id="review-title">Review Answers</h2><p class="note">Automatic suggestions and your changes stay private until you confirm results. Students receive no new reward before confirmation. After confirmation, you can still change a decision until its reward is opened. If your laptop is mirrored, pause projection before opening this panel.</p></div>${btn('✕','close-modal','button secondary small','aria-label="Close answer review"')}</header><div class="field"><label for="review-question">Question to review</label><select id="review-question">${state.reviewKeys.map(item => `<option value="${item.questionId}" ${item.questionId === qid ? 'selected' : ''}>Question ${item.questionId}</option>`).join('')}</select></div><div class="reveal-key"><b>Answer ${esc(key?.answerKey || '—')}</b><p>${esc(key?.explanation || '')}</p></div><div class="review-list">${rows.map(row => `<article class="review-row"><div class="review-meta"><b>${esc(row.teamName)} · Q${row.questionId}</b><span>${row.status === 'submitted' ? `${esc(row.proposedDecision || 'Needs review')} · PRIVATE` : esc(row.status)}${row.decisionSource === 'auto' ? ' · Automatic suggestion' : row.decisionSource === 'teacher' ? ' · Teacher reviewed' : ''}</span></div><p class="answer">Student answer: <strong>${esc(row.answer || 'No answer')}</strong></p><div class="review-actions">${btn('✓ Accept','accept','button green small',`data-team="${esc(row.teamId)}" data-question="${qid}" ${disabled(ui.busy || !row.answer)}`)}${btn('✕ Reject','reject','button red small',`data-team="${esc(row.teamId)}" data-question="${qid}" ${disabled(ui.busy || (row.status === 'accepted' && row.rewardLocked))}`)}</div>${row.rewardLocked ? '<small>This reward has been opened, so its accepted decision cannot be reversed.</small>' : row.rewardIssued ? '<small>One mystery draw issued for this accepted answer.</small>' : row.status === 'submitted' ? '<small>Waiting for your confirmation. Nothing revealed to students.</small>' : ''}</article>`).join('')}${currentTeams.map(team => `<article class="review-row"><div class="review-meta"><b>${esc(team.name)} · Q${qid}</b><span>Waiting</span></div><p class="answer">No submission yet. Confirmation will mark unanswered teams as missing.</p></article>`).join('')}</div>${qid === state.question?.id && state.phase === 'question' && state.answerReveal?.questionId !== qid ? `<p>${btn('Confirm results + reveal answer','reveal','button gold wide',disabled(ui.busy))}</p>` : ''}</section></div>`;
}
function targetModal() {
  if (ui.modal?.type !== 'target' || !state?.me) return '';
  const card = state.me.hand.find(item => item.id === ui.modal.cardId);
  if (!card) return '';
  return `<div class="modal-backdrop"><section class="modal" role="dialog" aria-modal="true" aria-labelledby="target-title"><header><div><span class="eyebrow">SABOTAGE · ${esc(card.name)}</span><h2 id="target-title">Choose a rival</h2><p>Cancel without spending this card. A rival with zero pieces can still receive walls.</p></div>${btn('✕','close-modal','button secondary small','aria-label="Cancel target selection"')}</header><div class="target-list">${state.teams.filter(team => team.id !== state.me.id).map(team => { const unavailable = card.key === 'snatcher' && !team.handCount; return `<button type="button" class="target" data-action="target-team" data-team="${esc(team.id)}" ${disabled(ui.busy || unavailable)}>${teamIcon(team.slot)} ${esc(team.name)}<small>${unavailable ? 'No saved card to take — card stays yours' : `${team.remaining} total left`}</small></button>`; }).join('') || '<p>No rival has joined yet. Your card is saved.</p>'}</div><p>${btn('Cancel — keep card','close-modal','button secondary')}</p></section></div>`;
}
function finishModal() {
  if (mode !== 'host') return '';
  if (ui.modal?.type === 'end-early') return `<div class="modal-backdrop"><section class="modal" role="dialog" aria-modal="true" aria-labelledby="finish-title"><h2 id="finish-title">End this game now?</h2><p>All phones will show the final results. Unreviewed answers will stay unjudged, and saved cards will stop working. You cannot resume this room, but you can open a fresh game with a new QR code.</p><p>${btn('Keep playing','close-modal','button secondary')} ${btn('Yes, end game','end-early','button red',disabled(ui.busy))}</p></section></div>`;
  if (ui.modal?.type !== 'finish') return '';
  return `<div class="modal-backdrop"><section class="modal" role="dialog" aria-modal="true" aria-labelledby="finish-title"><h2 id="finish-title">Lock the final results?</h2><p>Unused mystery draws and saved cards will stop working. The team with the fewest pieces remaining wins; equal totals share the same place.</p><p>${btn('Keep Tool Yard open','close-modal','button secondary')} ${btn('Finish and lock results','finish','button red',disabled(ui.busy))}</p></section></div>`;
}
function render() {
  const scroll = window.scrollY, activeElement = document.activeElement, focusId = activeElement?.id, focusAction = activeElement?.dataset?.action;
  const focusLetter = activeElement?.dataset?.letter, focusCard = activeElement?.dataset?.card, focusSlot = activeElement?.dataset?.slot;
  const reviewScroll = app.querySelector('.review-list')?.scrollTop || 0;
  let main;
  if (mode === 'home') main = `<main class="shell">${header('home')}<section class="panel center-state"><h1>${ui.error ? 'Could not open the room' : 'Opening Battle 8…'}</h1><p>${ui.error ? esc(ui.error) : 'Preparing the illustrated houses, question bank and team QR code.'}</p>${ui.error ? btn('Try again','create-room','button green') : ''}</section></main>`;
  else if (mode === 'student') main = studentEntry();
  else if (!state) main = `<main class="shell ${mode === 'join' ? 'phone-shell' : ''}">${header(mode)}<section class="panel center-state"><h1>${ui.error ? 'Let’s get you connected.' : mode === 'join' && pendingJoin ? 'Saving your team place…' : 'Finding your room…'}</h1><p>${ui.error ? esc(ui.error) : 'Your place and actions are saved while we reconnect.'}</p>${ui.error ? `${btn('Retry connection','reload','button green')} ${mode === 'join' ? btn('Enter another PIN','student-entry','button secondary') : ''}` : ''}</section></main>`;
  else if (mode === 'host' || mode === 'screen') main = hostOrScreen();
  else if (state.me) main = studentView();
  else main = joinView();
  app.innerHTML = main + (ui.error && state ? `<div class="toast error" role="alert">${esc(ui.error)} ${btn('✕','clear-error','link-button')}</div>` : '') + (ui.notice ? `<div class="toast" role="status">${esc(ui.notice)}</div>` : '') + (pending ? '<div class="pending">Confirming your action safely…</div>' : '') + reviewModal() + targetModal() + finishModal();
  if (focusId) document.getElementById(focusId)?.focus({ preventScroll:true });
  else if (focusAction) {
    const selector = `[data-action="${focusAction}"]${focusLetter ? `[data-letter="${focusLetter}"]` : ''}${focusCard ? `[data-card="${focusCard}"]` : ''}${focusSlot ? `[data-slot="${focusSlot}"]` : ''}`;
    app.querySelector(selector)?.focus({ preventScroll:true });
  }
  if (reviewScroll) { const list = app.querySelector('.review-list'); if (list) list.scrollTop = reviewScroll; }
  window.scrollTo(0, scroll); updateTimers();
}
function updateTimers() {
  if (!state) return;
  const timer = document.getElementById('phone-timer'); if (timer) timer.textContent = `⏱ ${countdown() || '0'} seconds left to answer · cards still work`;
  const host = app.querySelector('[data-action="countdown"]'); if (host && state.deadlineAt) { host.textContent = `⏱ ${countdown()} seconds`; host.disabled = true; }
  if (state.phase === 'question' && state.deadlineAt && countdown() === 0) {
    app.querySelectorAll('[data-action="choose-answer"],[data-action="submit-answer"]').forEach(button => button.disabled = true);
  }
}

app.addEventListener('input', event => {
  if (event.target.id === 'team-name') ui.teamName = event.target.value;
});
app.addEventListener('change', event => {
  if (event.target.id === 'review-question') {
    ui.reviewQuestionId = Number(event.target.value);
    render();
  }
});
app.addEventListener('submit', event => {
  event.preventDefault();
  if (event.target.id === 'pin-form') {
    const value = String(new FormData(event.target).get('pin') || '').trim();
    if (/^\d{5}$/.test(value)) navigate('join', value);
    else { ui.error = 'Enter the five-digit PIN from your teacher’s board.'; render(); }
  } else if (event.target.id === 'join-form') {
    void joinTeam();
  }
});
app.addEventListener('click', event => {
  const button = event.target.closest('[data-action]');
  if (!button || button.disabled) return;
  const action = button.dataset.action;
  if (action === 'fullscreen') { const root = document.documentElement; if (document.fullscreenElement) void document.exitFullscreen(); else void root.requestFullscreen?.(); }
  else if (action === 'create-room') { mode = 'home'; void createRoom(true); }
  else if (action === 'new-room') { mode = 'home'; state = null; pin = ''; token = ''; pending = null; routeGeneration++; void createRoom(true); }
  else if (action === 'student-entry') { session.set(studentKey, JSON.stringify({ room:'' })); navigate('student'); }
  else if (action === 'reload') { ui.error = ''; void loadState(); if (pendingJoin) void deliverJoin(); if (pending) void deliverAction(); render(); }
  else if (action === 'choose-slot') { ui.selectedSlot = Number(button.dataset.slot); render(); }
  else if (action === 'more-slots') { ui.visibleSlots = Math.min(state.teamCount, ui.visibleSlots + 10); render(); }
  else if (action === 'choose-answer') { ui.selectedAnswer = button.dataset.letter; render(); }
  else if (action === 'submit-answer') void sendAction('pupil:submit', { questionId:state.question.id, answer:ui.selectedAnswer });
  else if (action === 'draw') void sendAction('pupil:draw', { drawId:state.me.nextDrawId });
  else if (action === 'choose-card') void sendAction('pupil:choose', { offerId:state.me.offer.id, slotId:button.dataset.slot });
  else if (action === 'play-card') {
    const key = button.dataset.key;
    if (['brick','renovation','snatcher'].includes(key)) { ui.modal = { type:'target', cardId:button.dataset.card }; render(); }
    else void sendAction('pupil:play', { cardId:button.dataset.card });
  }
  else if (action === 'target-team') void sendAction('pupil:play', { cardId:ui.modal?.cardId, targetTeamId:button.dataset.team });
  else if (action === 'select-house') { ui.selectedHouse = button.dataset.team; render(); }
  else if (action === 'start') void sendAction('host:start');
  else if (action === 'countdown') void sendAction('host:start-countdown', { questionId:state.question.id });
  else if (action === 'close-answer') void sendAction('host:close-answer', { questionId:state.question.id });
  else if (action === 'reveal') void sendAction('host:reveal', { questionId:state.question.id });
  else if (action === 'advance') void sendAction('host:advance', { questionId:state.question.id });
  else if (action === 'review') { ui.reviewOpen = true; ui.reviewQuestionId = state.question?.id || 1; render(); }
  else if (action === 'accept' || action === 'reject') void sendAction('host:review', { questionId:Number(button.dataset.question), teamId:button.dataset.team, decision:action === 'accept' ? 'accepted' : 'rejected' });
  else if (action === 'finish-confirm') { ui.modal = { type:'finish' }; render(); }
  else if (action === 'finish') void sendAction('host:finish');
  else if (action === 'end-early-confirm') { ui.modal = { type:'end-early' }; render(); }
  else if (action === 'end-early') void sendAction('host:end-early');
  else if (action === 'close-modal') { ui.modal = null; ui.reviewOpen = false; render(); }
  else if (action === 'clear-error') { ui.error = ''; render(); }
  else if (action === 'copy-link') {
    void navigator.clipboard.writeText(`${location.origin}/battle8/index.html?join=${pin}`).then(() => notice('Student join link copied.')).catch(() => { ui.error = 'Could not copy automatically; use the QR code or PIN.'; render(); });
  }
  else if (action === 'open-projector') window.open(`${location.origin}/battle8/index.html?screen=${pin}`, '_blank', 'noopener');
  else if (action === 'all-battles') window.top.location.href = '/?teacher=1';
  else if (action === 'show-question' || action === 'show-tools') { ui.studentTab = action === 'show-tools' ? 'tools' : 'question'; render(); window.scrollTo({ top:0, behavior:'instant' }); }
});
setInterval(() => {
  if (mode === 'home' || mode === 'student') return;
  if (pendingJoin && !joinInFlight && Date.now() - lastJoin > 2200) void deliverJoin();
  if (pending && !actionInFlight && Date.now() - lastAction > 2200) void deliverAction();
  if (!pollInFlight && Date.now() - lastPoll > 1200) void loadState();
}, 400);
setInterval(updateTimers, 150);
window.addEventListener('online', () => { ui.online = true; void loadState(); if (pendingJoin) void deliverJoin(); if (pending) void deliverAction(); });
window.addEventListener('offline', () => { ui.online = false; render(); });
window.addEventListener('pageshow', () => { if (mode !== 'home' && mode !== 'student') void loadState(); });
document.addEventListener('visibilitychange', () => { if (!document.hidden && mode !== 'home' && mode !== 'student') void loadState(); });
initialRoute();
