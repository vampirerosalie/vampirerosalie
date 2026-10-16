const app = document.getElementById('app');
const apiBase = '/api/market/rooms';
const palette = ['#b75548','#4e88a7','#8f67b3','#d69a40','#4d9576','#d07390','#6379b2','#a37a48','#689f42','#bb704b'];
const icons = ['🦊','🦉','🐉','🦋','🐈','🦁','🐺','🦚','🐸','✨'];
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
const ui = { error:'', notice:'', online:navigator.onLine, selectedAnswer:'', order:[], bid:'', questionId:null, selectedHouse:null, reviewOpen:false,
  reviewQuestionId:null, modal:null, selectedSlot:0, teamName:'', visibleSlots:10, studentTab:'question', busy:false, signature:'' };
const studentKey = 'black-market:student-route';
const hostKey = room => `black-market:host:${room}`;
const teamKey = room => `black-market:team:${room}`;
const pendingKey = room => `black-market:pending:${mode}:${room}`;
const joinKey = room => `black-market:pending-join:${room}`;
const active = () => state && ['question','auction','auction-result','settlement'].includes(state.phase);
const countdown = () => (state?.phase === 'auction' ? state.auction?.deadlineAt : state?.deadlineAt) ? Math.max(0, Math.ceil(((state.phase === 'auction' ? state.auction.deadlineAt : state.deadlineAt) - Date.now() - clockOffset) / 1000)) : null;
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
    window.parent.postMessage({ type:'black-market:status', pin, phase:next.phase,
      onlineCount:next.teams.filter(team => team.online).length }, location.origin);
  }
  if (mode === 'host' && next.role === 'host') storage.set('black-market:last-host', pin);
  if (previousQuestion !== next.question?.id) { ui.selectedAnswer = ''; ui.order = []; ui.bid = ''; ui.questionId = next.question?.id ?? null; ui.reviewOpen = false; ui.reviewQuestionId = next.question?.id ?? null; if (previousQuestion && mode === 'join') ui.studentTab = 'question'; }
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
  const saved = storage.get('black-market:last-host');
  if (!fresh && /^\d{5}$/.test(saved || '') && storage.get(hostKey(saved))) { navigate('host', saved); return; }
  ui.busy = true; ui.error = ''; render();
  try { const data = await api(apiBase, { teamCount:40, roomName:'English Black Market' }, '');
    if (!/^\d{5}$/.test(data.pin) || !/^[a-f0-9]{64}$/.test(data.hostToken || '')) throw new Error('The teacher room was not confirmed.');
    storage.set(hostKey(data.pin), data.hostToken); storage.set('black-market:last-host', data.pin); ui.busy = false; navigate('host', data.pin); }
  catch (error) { ui.busy = false; ui.error = error.message; render(); }
}
function navigate(nextMode, nextPin = '') {
  const sticky = rememberedStudent();
  if (nextMode === 'join' && /^\d{5}$/.test(nextPin)) rememberStudent(nextPin);
  if ((nextMode === 'host' || nextMode === 'screen') && isStudentTab()) { nextMode = sticky ? 'join' : 'student'; nextPin = sticky || ''; }
  routeGeneration++; mode = nextMode; pin = nextPin; token = nextMode === 'host' ? storage.get(hostKey(pin)) || '' : nextMode === 'join' ? storage.get(teamKey(pin)) || '' : '';
  state = null; ui.signature = ''; ui.error = ''; ui.selectedAnswer = ''; ui.order = []; ui.bid = ''; ui.selectedSlot = 0; ui.reviewOpen = false; ui.modal = null; ui.busy = false;
  pending = pin ? readSaved(pendingKey(pin)) : null; pendingJoin = nextMode === 'join' && !token ? readSaved(joinKey(pin)) : null;
  if (['host','join','screen'].includes(mode)) changeUrl(`?${mode === 'host' ? 'host' : mode === 'join' ? 'join' : 'screen'}=${pin}`);
  else if (mode === 'student') changeUrl('?student=1');
  render(); if (pendingJoin) deliverJoin(); if (pending && token) deliverAction(); loadState();
}
function readSaved(key) { try { return JSON.parse(storage.get(key) || 'null'); } catch { return null; } }
function initialRoute() {
  const params = new URLSearchParams(location.search), sticky = rememberedStudent();
  if (params.has('join') && /^\d{5}$/.test(params.get('join') || '')) return navigate('join', params.get('join'));
  if (params.has('join')) { rememberStudent(''); return navigate('student'); }
  if (sticky) return navigate('join', sticky);
  if (params.has('student') || isStudentTab()) return navigate('student');
  if (params.has('screen') && /^\d{5}$/.test(params.get('screen') || '')) return navigate('screen', params.get('screen'));
  if (params.has('host') && /^\d{5}$/.test(params.get('host') || '')) return navigate('host', params.get('host'));
  mode = 'home'; render(); createRoom();
}
async function joinTeam() {
  if (mode !== 'join' || token || pendingJoin || !ui.selectedSlot || !ui.teamName.trim()) return;
  let clientId = storage.get('black-market:client-id'); if (!clientId) { clientId = uid(); storage.set('black-market:client-id', clientId); }
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
    if (action.type === 'host:confirm') ui.reviewOpen = false;
    if (action.type === 'pupil:play' && ui.modal?.type === 'target') ui.modal = null;
    if (action.type === 'host:finish' || action.type === 'host:end-early') ui.modal = null;
    applyState(data.state, true);
    if (data.result?.message) notice(data.result.message);
    
  } catch (error) { if (generation !== routeGeneration || pending !== action) return;
    if (error.status >= 400 && error.status < 500 && error.status !== 429) { pending = null; storage.remove(pendingKey(pin)); ui.busy = false; ui.error = error.message; render(); await loadState(); }
    else { ui.online = false; ui.error = 'Action not confirmed. Retrying with the same receipt…'; render(); }
  } finally { actionInFlight = false; }
}

const art = (index, cls='') => `<span class="collectible ${cls}" style="--x:${(index%4)*100/3}%;--y:${Math.floor(index/4)*100/3}%" aria-hidden="true"></span>`;
const locked = () => !active() || ui.busy;
function header() {
  return `<header class="topbar"><a class="brand" href="${mode==='join'||mode==='student'?'?student=1':'?teacher=1'}">${art(15,'brand-art')}<span>ENGLISH <b>BLACK MARKET</b><small>BATTLE 9 · ANSWER · BID · STRATEGISE</small></span></a><div class="header-info"><span class="chip ${ui.online?'live':'offline'}">${ui.online?'Connected':'Reconnecting…'}</span>${pin?`<span class="chip">PIN <b>${pin}</b></span>`:''}${mode==='host'?btn('⛶ Full screen','fullscreen','button ghost small'):''}</div></header>`;
}
function hero(lobby=false) { return `<section class="hero ${lobby?'lobby-hero':''}"><div><span class="eyebrow">THE ROYAL UNDERGROUND AUCTION HOUSE</span><h1>${lobby?'Knowledge. Coins.<br>Fortune.':'Every answer opens<br>a new possibility.'}</h1><p>25 questions · 13 live auctions · Most Treasure Points wins.</p></div><span class="hero-seal">★<b>TP WINS</b><small>Money is for bidding.</small></span></section>`; }
function rules() { return `<details class="rules"><summary>How to play</summary><p>Start with $100 and 0 TP. An answer accepted and confirmed by your teacher earns $25 and 1 TP. One auction follows Q2, Q4, … Q24, and Q25. Only the highest bidder pays. Bid increases are at least $5.</p><p>Save theft cards for later, or use them during questions and auctions. A shield blocks one money or TP theft; both the attack card and shield are then used. The leading bid is reserved and cannot be stolen. Cancel target selection to keep your card.</p><p>Highest TP wins. Ties share the win—remaining money is not a tiebreaker. All money is fictional classroom game currency.</p></details>`; }
function lobby() {
  const host=mode==='host';
  return `${hero(true)}<div class="lobby-grid"><section class="panel scan"><span class="eyebrow">YOUR INVITATION TO THE MARKET</span><h2>SCAN TO JOIN</h2><img class="qr" src="${apiBase}/${pin}/qr.svg" alt="QR code to join this Battle 9 game"><small>OR ENTER THE GAME PIN</small><strong class="pin">${pin}</strong>${host?btn('Copy student link','copy-link','button gold wide'):''}</section><section class="panel"><span class="eyebrow">THE GUEST LIST</span><h2>${state.teams.length} teams have arrived</h2><p>One phone per player or team. Your place is saved if your screen sleeps.</p>${host?`<label class="capacity">Available team places <select id="team-count">${[2,4,6,8,10,15,20,25,30,35,40].filter(n=>n>=Math.max(2,...state.takenSlots)).map(n=>`<option value="${n}" ${n===state.teamCount?'selected':''}>${n}</option>`).join('')}</select></label>`:''}<div class="guests">${state.teams.map(t=>`<span style="--team:${teamColor(t.slot)}">${teamIcon(t.slot)} ${esc(t.name)}<small>${t.online?'online':'place saved'}</small></span>`).join('')||'<p>Your students will appear here when they join.</p>'}</div>${host?btn('Open the market →','start','button gold wide',disabled(ui.busy||!state.teams.length)):''}${rules()}</section></div>`;
}
function scoreboard(final=false) {
  return `<section class="panel scoreboard"><span class="eyebrow">${final?'THE MARKET CHAMPIONS':'LIVE TREASURE POINTS'}</span><h2>${final?'Fortune favours the clever.':'The treasure race'}</h2>${final?art(14,'trophy'):''}<div class="ranks">${state.ranking.map(t=>`<article class="rank ${t.rank===1?'leader':''}" style="--team:${teamColor(t.slot)}"><b>#${t.rank}</b><span>${esc(t.name)}${final?`<small>${t.correct} correct · ${t.won} auctions won · ${t.sabotage} successful thefts</small>`:''}</span><strong>${t.tp} <small>TP</small></strong><span class="cash">$${t.money}</span></article>`).join('')}</div>${final?'<p>Equal Treasure Points share a place. Money is shown for information only.</p>':''}</section>`;
}
function questionCard(interactive=false) {
  const q=state.question;if(!q)return '';
  const sub=state.me?.submission, closed=!state.questionOpen||countdown()===0||state.phase!=='question';
  let answers='';
  if(q.type==='mcq') answers=`<div class="choices">${q.choices.map((choice,i)=>`<button class="choice ${ui.selectedAnswer===String.fromCharCode(65+i)?'selected':''}" data-action="option" data-letter="${String.fromCharCode(65+i)}" ${disabled(!interactive||closed||Boolean(sub)||ui.busy)}><b>${String.fromCharCode(65+i)}</b><span>${esc(choice)}</span></button>`).join('')}</div>`;
  else if(q.type==='order') answers=interactive?`<div class="word-answer" aria-label="Your sentence">${ui.order.map((i,n)=>btn(esc(q.words[i]),'remove-word','word',`data-index="${n}" ${disabled(closed||Boolean(sub)||ui.busy)}`)).join('')||'Tap words below to build your sentence.'}</div><div class="word-bank">${q.words.map((word,i)=>btn(esc(word),'word','word',`data-index="${i}" ${disabled(ui.order.includes(i)||closed||Boolean(sub)||ui.busy)}`)).join('')}</div>`:`<div class="word-bank">${q.words.map(w=>`<span class="word">${esc(w)}</span>`).join('')}</div>`;
  else if(interactive)answers=`<label for="answer">Your spelling</label><input id="answer" maxlength="160" autocomplete="off" autocapitalize="none" spellcheck="false" value="${esc(ui.selectedAnswer)}" ${disabled(closed||Boolean(sub)||ui.busy)} placeholder="Type your answer…">`;
  const status=sub?.status==='accepted'?'Correct! +$25 and +1 TP.':sub?.status==='rejected'?'No reward this time. Keep playing!':'Submitted—waiting for teacher.';
  return `<section class="panel question"><div class="panel-heading"><span class="eyebrow">QUESTION ${q.id} / 25</span><span>${esc(q.cat)}</span></div><div class="parchment"><h2>${esc(q.text).replaceAll('\n','<br>')}</h2>${answers}${interactive?(sub?`<p class="answer-status ${sub.status}">${esc(sub.answer||'No answer')}<br><strong>${status}</strong></p>`:btn(closed?'Answers closed':'Submit answer →','submit','button gold wide',disabled(closed||ui.busy||(q.type==='order'?ui.order.length!==q.words.length:!ui.selectedAnswer.trim())))):''}${!interactive&&state.answerReveal?`<div class="revealed"><span>ANSWER</span><strong>${esc(state.answerReveal.answer)}</strong></div>`:''}</div></section>`;
}
function auctionCard(interactive=false) {
  const a=state.auction;if(!a)return '';
  const live=state.phase==='auction'&&a.status==='open', minimum=a.bidder?a.bid+5:a.start;
  return `<section class="panel auction"><div class="panel-heading"><span class="eyebrow">AUCTION ${a.number} / 13</span><span>${a.kind==='mystery'&&a.status!=='sold'?'SEALED MYSTERY':'TREASURE LOT'}</span></div><div class="auction-stage">${art(a.index,'lot-art')}<span class="lot-label">${a.status==='sold'?'SOLD!':a.status==='unsold'?'UNSOLD':a.status==='cancelled'?'CANCELLED':'NOW ON THE PODIUM'}</span></div><div class="auction-body"><h2>${esc(a.name)}</h2><p>${esc(a.description)}</p><div class="highest"><span>${a.status==='sold'?'WINNING BID':'CURRENT HIGHEST BID'}</span><strong>${a.bidder?'$'+a.bid:'No bids yet'}</strong><b>${esc(a.bidderName||'Who will make the first move?')}</b></div>${a.outcome?`<div class="outcome">✦ ${esc(a.outcome)}</div>`:''}${a.status==='unsold'?'<p>Nobody bid. No money spent; no reward given.</p>':''}${interactive&&live?`<p>Next bid: <b>$${minimum}</b> · Your balance: <b>$${state.me.money}</b></p><div class="bid-buttons">${[0,5,20].map(add=>btn(`$${minimum+add}`,'bid','button gold',`data-amount="${minimum+add}" ${disabled(ui.busy||minimum+add>state.me.money||countdown()===0)}`)).join('')}</div><form id="bid-form" class="custom-bid"><label class="sr-only" for="bid">Custom bid amount</label><input type="number" id="bid" min="${minimum}" max="${state.me.money}" step="1" value="${esc(ui.bid)}" placeholder="Your total bid ($)" ${disabled(ui.busy)}><button class="button violet" ${disabled(ui.busy||countdown()===0)}>Place bid</button></form><small>Only the winner pays. Your highest bid is reserved until outbid or sold.</small>`:''}<details class="bid-history"><summary>Recent bids</summary>${[...a.bids].reverse().map(b=>`<p>${esc(b.teamName)} <b>$${b.amount}</b></p>`).join('')||'<p>Waiting for the first bid.</p>'}</details></div></section>`;
}
function events() {return `<section class="panel news"><span class="eyebrow">WHISPERS FROM THE MARKET</span>${[...state.events].reverse().slice(0,6).map(e=>`<p class="event ${e.kind}">${esc(e.text)}</p>`).join('')||'<p>The market awaits its first story.</p>'}</section>`;}
function teacherControls() {
  let controls='';const q=state.question;
  if(state.phase==='question')controls=`<p>${state.teams.filter(t=>t.submitted).length} / ${state.teams.length} answers received</p>${btn('Review answers','review','button violet wide')}${!state.answerReveal?`${btn('Start 10-second countdown','countdown','button ghost wide',disabled(ui.busy||!state.questionOpen||Boolean(state.deadlineAt)))}${btn('Confirm results + reveal','confirm','button gold wide',disabled(ui.busy))}<small>Review whenever you want. Missing answers earn zero. Confirming closes answers and releases rewards.</small>`:btn(state.auctionDue?`Open Auction ${state.nextAuctionNumber} →`:'Next question →',state.auctionDue?'open-auction':'advance','button gold wide',disabled(ui.busy))}`;
  if(state.phase==='auction')controls=`<p>No automatic time limit. You control when bidding ends.</p>${btn('Start 10-second countdown','auction-countdown','button gold wide',disabled(ui.busy||Boolean(state.auction.deadlineAt)))}${btn('SOLD! Close bidding','sold','button emerald wide',disabled(ui.busy))}<small>Students can keep bidding during the countdown.</small>`;
  if(state.phase==='auction-result')controls=btn(q.id===25?'Open final card opportunity →':'Next question →','advance','button gold wide',disabled(ui.busy));
  if(state.phase==='settlement')controls=`<p>Teams may use saved cards. Finalize when everyone is ready.</p>${btn('Finalize results','finish-confirm','button gold wide',disabled(ui.busy))}`;
  return `<aside class="panel desk"><span class="eyebrow">TEACHER’S DESK</span><h2>${state.phase==='auction'?'Going, going…':'You set the pace.'}</h2>${controls}<hr>${btn('Open projector ↗','projector','button ghost wide')}<p class="private-note">Keep review answers private: share the projector window, or pause screen mirroring before opening Review.</p>${rules()}</aside>`;
}
function hostView() {
  if(state.phase==='lobby')return lobby();
  if(state.phase==='finished')return `${scoreboard(true)}${mode==='host'?`<section class="panel end-actions">${btn('New game · new QR code','new-room','button gold')} ${btn('All battles','all-battles','button ghost')}</section>`:'<p class="finished-note">The market is closed. Thank you for playing!</p>'}`;
  return `<div class="game-grid"><div>${state.phase==='auction'||state.phase==='auction-result'?auctionCard():state.phase==='settlement'?`<section class="hero"><div><span class="eyebrow">FINAL CARD OPPORTUNITY</span><h1>One last clever move.</h1><p>Use your saved cards before the teacher locks the results.</p></div></section>`:questionCard()}${scoreboard()}${events()}</div>${mode==='host'?teacherControls():''}</div>`;
}
function studentEntry() {return `${hero(true)}<section class="panel entry"><span class="eyebrow">STUDENT ENTRANCE</span><h2>Your place at the market.</h2><form id="pin-form"><label for="room-pin">Game PIN from your teacher</label><input id="room-pin" name="pin" inputmode="numeric" pattern="[0-9]{5}" maxlength="5" required><button class="button gold wide">Find my game</button></form></section>`;}
function joinView() {
  if(state.phase!=='lobby')return `<section class="panel entry"><h2>${state.phase==='finished'?'This game has ended.':'This game has started.'}</h2><p>Reopen the phone/browser you originally joined with, or ask your teacher for the next game’s QR code.</p>${btn('Enter another PIN','student-entry','button gold')}</section>`;
  return `<section class="panel entry"><span class="eyebrow">WELCOME TO THE MARKET</span><h1>Choose your team.</h1><p>Each player or team uses one place. Start with $100 and 0 TP.</p><form id="join-form"><label for="team-name">Your name / team name</label><input id="team-name" maxlength="28" required value="${esc(ui.teamName)}" placeholder="A name for your crew"><div class="slots">${Array.from({length:state.teamCount},(_,i)=>i+1).map(slot=>btn(`<span>${teamIcon(slot)}</span>${slot}`,'slot',`slot ${slot===ui.selectedSlot?'selected':''}`,`style="--team:${teamColor(slot)}" data-slot="${slot}" ${disabled(state.takenSlots.includes(slot)||ui.busy)}`)).join('')}</div><button class="button gold wide" ${disabled(!ui.selectedSlot||!ui.teamName.trim()||ui.busy)}>Enter the market →</button></form><small>Taken places are dimmed. Your place stays saved when you reconnect.</small></section>`;
}
function inventory() {
  const me=state.me;
  return `<section class="panel inventory"><span class="eyebrow">YOUR PRIVATE COLLECTION</span><h2>Keep a trick up your sleeve.</h2><p>Use saved cards anytime during play. You don’t have to use them straight away.</p><p class="shield-note">${me.shields} shield${me.shields===1?'':'s'} · Blocks the next money or TP theft.</p><div class="cards">${me.cards.map(c=>`<article class="item-card">${art(c.art)}<h3>${esc(c.name)}</h3><p>${esc(c.description)}</p>${btn('Choose a rival','card','button violet wide',`data-card="${c.id}" ${disabled(locked())}`)}</article>`).join('')||`<div class="empty-inventory">${art(7)}<h3>Your collection starts here.</h3><p>Win a special card at auction, then save it for the perfect moment.</p></div>`}</div></section>`;
}
function studentView() {
  const me=state.me,finished=state.phase==='finished';
  return `<section class="wallet"><div><span class="eyebrow">${esc(me.name)}</span><h2>${finished?'Market closed':'Your market passport'}</h2></div><div class="balances"><span>MONEY<strong>$${me.money}</strong></span><span>TREASURE<strong>${me.tp} TP</strong></span><span>SHIELDS<strong>${me.shields}</strong></span></div>${me.reserved?`<small>$${me.reserved} reserved for your leading bid · $${me.available} available</small>`:''}</section>${finished?`${scoreboard(true)}<p class="finished-note">Stay here for the final results. Scan your teacher’s next QR code to join a new game.</p>`:`<nav class="phone-tabs" aria-label="Student game views">${btn(state.phase==='auction'||state.phase==='auction-result'?'Live auction':'Question','tab-game',ui.studentTab==='question'?'active':'')}${btn(`Inventory · ${me.cards.length}`,'tab-inventory',ui.studentTab==='inventory'?'active':'')}</nav>${ui.studentTab==='inventory'?inventory():state.phase==='lobby'?`<section class="panel waiting">${art(1)}<h2>You’re on the guest list!</h2><p>Your teacher will open the market soon.</p></section>`:state.phase==='auction'||state.phase==='auction-result'?auctionCard(true):state.phase==='settlement'?`<section class="panel waiting">${art(14)}<h2>One last opportunity.</h2><p>Use your saved cards before the teacher finalizes the results.</p>${btn('Open inventory','tab-inventory','button gold')}</section>`:questionCard(true)}${events()}`}`;
}
function modal() {
  if(ui.reviewOpen&&mode==='host')return `<div class="modal-backdrop"><section class="modal" role="dialog" aria-modal="true" aria-label="Private answer review"><div class="modal-heading"><div><span class="eyebrow">PRIVATE TEACHER REVIEW · QUESTION ${state.question.id}</span><h2>Review answers</h2></div>${btn('✕','close-modal','button ghost','aria-label="Close review"')}</div><p class="private-note">Do not mirror this private panel to students. Decisions stay private until you confirm. You can change Accept / Reject before confirmation.</p><div class="key">Answer key: <b>${esc(state.answerKey)}</b></div><div class="review-list">${state.reviews.map(r=>`<article class="review-row"><div><b>${esc(r.teamName)}</b><p>${esc(r.answer||'No answer')}</p><small>${r.decision?`Your mark: ${r.decision}`:r.suggestion?`Answer-key suggestion: ${r.suggestion}`:'Unanswered · zero reward'}</small></div><div>${btn('Accept','accept','button emerald small',`data-team="${r.teamId}" ${disabled(ui.busy||!r.answer||Boolean(state.answerReveal))}`)}${btn('Reject','reject','button red small',`data-team="${r.teamId}" ${disabled(ui.busy||Boolean(state.answerReveal))}`)}</div></article>`).join('')}</div>${!state.answerReveal?btn('Confirm results + reveal','confirm','button gold wide',disabled(ui.busy)):''}</section></div>`;
  if(ui.modal?.type==='target'&&state.me){const card=state.me.cards.find(c=>c.id===ui.modal.cardId);if(!card)return '';return `<div class="modal-backdrop"><section class="modal" role="dialog" aria-modal="true" aria-label="Choose a rival"><span class="eyebrow">${esc(card.name)}</span><h2>Who will you target?</h2><p>Cancel to keep your card. A shield blocks one attack and consumes both the card and shield.</p><div class="targets">${state.teams.filter(t=>t.id!==state.me.id).map(t=>{const amount=card.type==='stealMoney'?t.available:t.tp;return btn(`<b>${esc(t.name)}</b><span>${amount>0?`${card.type==='stealMoney'?'$':''}${amount}${card.type==='stealTP'?' TP':' unreserved'} · ${t.shields} shields`:card.type==='stealMoney'?'No unreserved money':'No TP to steal'}</span>`,'target','target',`data-team="${t.id}" ${disabled(locked()||amount<=0)}`);}).join('')}</div>${btn('Cancel — keep card','close-modal','button ghost wide')}</section></div>`;}
  if(ui.modal?.type==='finish'||ui.modal?.type==='end')return `<div class="modal-backdrop"><section class="modal" role="dialog" aria-modal="true" aria-label="End game confirmation"><h2>${ui.modal.type==='finish'?'Finalize the results?':'End this game now?'}</h2><p>All answers, bids and cards will stop. Students stay on their final-results screen. ${ui.modal.type==='end'?'Any open auction is cancelled without charging its bidder.':''}</p>${btn('Keep playing','close-modal','button ghost')} ${btn('End and lock results',ui.modal.type==='finish'?'finish':'end','button red',disabled(ui.busy))}</section></div>`;
  return '';
}
function render() {
  const scroll=window.scrollY,focus=document.activeElement,focusId=focus?.id,caret=focus?.selectionStart,reviewScroll=app.querySelector('.review-list')?.scrollTop||0;
  let main;
  if(mode==='home')main=`${hero(true)}<section class="panel entry"><h2>${ui.error?'Could not open the room':'Opening your auction house…'}</h2><p>${esc(ui.error||'Preparing the questions and student QR code.')}</p>${ui.error?btn('Try again','create','button gold'):''}</section>`;
  else if(mode==='student')main=studentEntry();
  else if(!state)main=`<section class="panel entry"><h2>Finding your market…</h2><p>${esc(ui.error||'Your place and actions are saved while we reconnect.')}</p>${btn('Retry connection','reload','button gold')}${mode==='join'?btn('Enter another PIN','student-entry','button ghost'):''}</section>`;
  else if(mode==='host'||mode==='screen')main=hostView();
  else main=state.me?studentView():joinView();
  app.innerHTML=`<main class="shell ${mode==='join'||mode==='student'?'phone-shell':''}">${header()}${state&&mode==='host'&&state.phase!=='finished'?`<div class="host-tools"><span>25 QUESTIONS · 13 AUCTIONS · HIGHEST TP WINS</span>${btn('End game','end-confirm','button ghost small')}</div>`:''}<div class="timer-strip" id="timer" role="timer" ${countdown()===null?'hidden':''}></div>${main}</main>${state?modal():''}${ui.error&&state?`<div class="toast error" role="alert">${esc(ui.error)} ${btn('✕','clear-error','dismiss')}</div>`:''}${ui.notice?`<div class="toast" role="status">${esc(ui.notice)}</div>`:''}${pending?'<div class="pending" role="status">Confirming safely…</div>':''}`;
  if(focusId){const el=document.getElementById(focusId);el?.focus({preventScroll:true});if(typeof caret==='number'&&el?.setSelectionRange&&el.type!=='number')el.setSelectionRange(caret,caret);}
  const list=app.querySelector('.review-list');if(list)list.scrollTop=reviewScroll;
  window.scrollTo(0,scroll);updateTimers();
}
function updateTimers() {
  const count=countdown(),timer=document.getElementById('timer');
  if(timer){timer.hidden=count===null;timer.textContent=count===null?'':`${count} seconds ${state?.phase==='auction'?'to bid':'to answer'}${count===0?' · Time is up!':''}`;}
  if(count===0)app.querySelectorAll('[data-action="submit"],[data-action="option"],[data-action="word"],[data-action="remove-word"],[data-action="bid"],#bid-form button,#answer').forEach(el=>el.disabled=true);
}
app.addEventListener('input',e=>{
  if(e.target.id==='team-name'){ui.teamName=e.target.value;const b=app.querySelector('#join-form button.button');if(b)b.disabled=!ui.selectedSlot||!ui.teamName.trim()||ui.busy;}
  if(e.target.id==='answer'){ui.selectedAnswer=e.target.value;const b=app.querySelector('[data-action="submit"]');if(b)b.disabled=!ui.selectedAnswer.trim()||ui.busy||!state.questionOpen||countdown()===0;}
  if(e.target.id==='bid')ui.bid=e.target.value;
});
app.addEventListener('change',e=>{if(e.target.id==='team-count')void sendAction('host:settings',{teamCount:Number(e.target.value)});});
app.addEventListener('submit',e=>{
  e.preventDefault();if(e.target.id==='join-form')void joinTeam();
  if(e.target.id==='pin-form'){const value=new FormData(e.target).get('pin');if(/^\d{5}$/.test(value))navigate('join',value);}
  if(e.target.id==='bid-form')void sendAction('pupil:bid',{auctionId:state.auction.id,amount:Number(ui.bid)});
});
app.addEventListener('click',e=>{
  const b=e.target.closest('[data-action]');if(!b||b.disabled)return;
  const a=b.dataset.action,qid=state?.question?.id,aid=state?.auction?.id;
  if(a==='fullscreen'){if(document.fullscreenElement)void document.exitFullscreen();else void document.documentElement.requestFullscreen?.();}
  else if(a==='create'||a==='new-room'){if(isStudentTab())return;mode='home';state=null;pending=null;pin='';token='';routeGeneration++;void createRoom(true);}
  else if(a==='student-entry'){rememberStudent('');navigate('student');}
  else if(a==='reload'){void loadState();if(pendingJoin)void deliverJoin();if(pending)void deliverAction();}
  else if(a==='slot'){ui.selectedSlot=Number(b.dataset.slot);render();}
  else if(a==='option'){ui.selectedAnswer=b.dataset.letter;render();}
  else if(a==='word'){ui.order.push(Number(b.dataset.index));render();}
  else if(a==='remove-word'){ui.order.splice(Number(b.dataset.index),1);render();}
  else if(a==='submit')void sendAction('pupil:submit',{questionId:qid,...(state.question.type==='order'?{order:[...ui.order]}:{answer:ui.selectedAnswer})});
  else if(a==='start')void sendAction('host:start');
  else if(a==='review'){ui.reviewOpen=true;render();}
  else if(a==='accept'||a==='reject')void sendAction('host:review',{questionId:qid,teamId:b.dataset.team,decision:a==='accept'?'accepted':'rejected'});
  else if(a==='confirm')void sendAction('host:confirm',{questionId:qid});
  else if(a==='countdown')void sendAction('host:start-countdown',{questionId:qid});
  else if(a==='advance')void sendAction('host:advance',{questionId:qid,auctionId:aid});
  else if(a==='open-auction')void sendAction('host:open-auction',{questionId:qid});
  else if(a==='auction-countdown')void sendAction('host:auction-countdown',{auctionId:aid});
  else if(a==='sold')void sendAction('host:sold',{auctionId:aid});
  else if(a==='bid')void sendAction('pupil:bid',{auctionId:aid,amount:Number(b.dataset.amount)});
  else if(a==='card'){ui.modal={type:'target',cardId:b.dataset.card};render();}
  else if(a==='target')void sendAction('pupil:play',{cardId:ui.modal.cardId,targetTeamId:b.dataset.team});
  else if(a==='close-modal'){ui.modal=null;ui.reviewOpen=false;render();}
  else if(a==='end-confirm'||a==='finish-confirm'){ui.modal={type:a==='end-confirm'?'end':'finish'};render();}
  else if(a==='end'||a==='finish')void sendAction(a==='end'?'host:end-early':'host:finish');
  else if(a==='tab-game'||a==='tab-inventory'){ui.studentTab=a==='tab-game'?'question':'inventory';render();window.scrollTo(0,0);}
  else if(a==='clear-error'){ui.error='';render();}
  else if(a==='copy-link')void navigator.clipboard.writeText(`${location.origin}/battle9/index.html?join=${pin}`).then(()=>notice('Student link copied.')).catch(()=>notice('Use the QR code or five-digit PIN to join.'));
  else if(a==='projector')window.open(`${location.origin}/battle9/index.html?screen=${pin}`,'_blank','noopener');
  else if(a==='all-battles'&&mode==='host')window.top.location.href='/?teacher=1';
});
setInterval(()=>{
  if(mode==='home'||mode==='student')return;
  if(pendingJoin&&!joinInFlight&&Date.now()-lastJoin>2200)void deliverJoin();
  if(pending&&!actionInFlight&&Date.now()-lastAction>2200)void deliverAction();
  if(!pollInFlight&&Date.now()-lastPoll>(state?.phase==='auction'?650:1400))void loadState();
},300);
setInterval(updateTimers,150);
window.addEventListener('online',()=>{ui.online=true;void loadState();if(pendingJoin)void deliverJoin();if(pending)void deliverAction();});
window.addEventListener('offline',()=>{ui.online=false;render();});
window.addEventListener('pageshow',()=>{void loadState();});
document.addEventListener('visibilitychange',()=>{if(!document.hidden){void loadState();if(pendingJoin)void deliverJoin();if(pending)void deliverAction();}});
initialRoute();
