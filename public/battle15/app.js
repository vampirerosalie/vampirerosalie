import {iconButton,button,escape,welcome,lobby,board,controls,phone,reviewView,powers,rules,credit} from './views.js';
import {configureHand,clearHand,warmImages,renderHand,retryImages,pickCard,pickWager,selection,chipFlight} from './hand.js';

const table=document.querySelector('#table'), tools=document.querySelector('#tools');
const dialog=document.querySelector('#dialog'), modal=document.querySelector('#modal');
const connection=document.querySelector('#connection'), toast=document.querySelector('#notice');
const query=new URLSearchParams(location.search);
const prefix='meniti:';
const local={
  read(key){try{return localStorage.getItem(prefix+key)??'';}catch{return '';}},
  write(key,value){try{localStorage.setItem(prefix+key,value);}catch{}},
  remove(key){try{localStorage.removeItem(prefix+key);}catch{}},
};
const validPin=pin=>/^\d{5}$/.test(pin??'');
const uuid=()=>crypto.randomUUID?.()??Array.from(crypto.getRandomValues(new Uint8Array(16)),b=>b.toString(16).padStart(2,'0')).join('');
const role=query.has('join')||query.has('student')||query.has('room')?'student':query.has('screen')?'public':query.has('teacher')||query.has('host')?'host':'student';
const embedded = window.parent !== window;
const openTeacherShell = role === 'host' && !embedded;
document.body.classList.add(role==='public'?'projector':role);
const requestedPin=role==='student' ? query.get('join') ?? query.get('room') ?? (query.has('student') ? '' : null) : query.get(role==='public'?'screen':'host');
let pin=requestedPin??(role==='public'?'':local.read(role+'-room'));
if(!validPin(pin))pin='';
let key=role==='public'?'':local.read(role+':'+pin);
let clientId=local.read('client-id');
if(!clientId) {clientId=uuid();local.write('client-id',clientId);}
let state=null, busy=false, pending=null, pollActive=false, closed=false;
let choosingHint=null;
let lastLayout='',lastTools='',reviewTicket=0, lastVersion=0,lastSample=0;
let timer,clockSample=null,roundPaintQueued=false,welcomeId='', modalMode='';
let music=null,playing=false, enabled=local.read('music')!=='off', volume=.16;
const savedVolume=local.read('volume');
if(savedVolume&&Number.isFinite(+savedVolume))volume=Math.min(1,Math.max(0,+savedVolume));
function serverClock(){return clockSample?clockSample.time+performance.now()-clockSample.at:Date.now();}
function stampRoute() {
  if(role==='student') {
    try{sessionStorage.setItem(prefix+'student-room',pin);}catch{}
    if(pin)local.write('student-room',pin);else local.remove('student-room');
    history.replaceState(null,'',location.pathname+(pin?'?join='+pin:'?student=1'));
  }else if(role==='host') {
    history.replaceState(null,'',location.pathname+'?teacher=1'+(window.parent!==window?'&embedded=1':'')+(pin?'&host='+pin:''));
  }
}
function postToShell(type,extra={}) {
  if(role==='host'&&window.parent!==window) window.parent.postMessage({type,pin,...extra},location.origin);
}
if(role==='student')stampRoute();
function pendingKey(){return 'pending:'+role+':'+pin;}
function restorePending(){try{pending=JSON.parse(local.read(pendingKey())||'null');}catch{pending=null;}}
restorePending();
function clearPending(){pending=null;local.remove(pendingKey());}
function online(ok) {
  connection.hidden=ok;
  if(!ok)connection.textContent='Menyambung semula ke bilik…';
}
function notice(message){
  toast.textContent=message;toast.hidden=false;clearTimeout(timer);
  timer=setTimeout(()=>toast.hidden=true,5600);
}
async function api(path,{body,auth=key}={}){
  const abort=new AbortController(),timeout=setTimeout(()=>abort.abort(),14000);
  let response;
  try {
    response=await fetch('/api/meniti/rooms'+path,{
      method:body?'POST':'GET',cache:'no-store',signal:abort.signal,
      headers:{...(auth?{Authorization:'Bearer '+auth}:{}),...(body?{'Content-Type':'application/json'}:{})},
      ...(body?{body:JSON.stringify(body)}:{}),
    });
    const data=await response.json();
    if(!response.ok)throw Object.assign(Error(data.error??'Permintaan gagal.'),{status:response.status,code:data.code,retry:response.status>=500||response.status===429});
    online(true);return data;
  }catch(error){
    if(!error.status){online(false);throw Object.assign(Error('Sambungan terganggu. Sedang mencuba semula.'),{retry:true});}
    throw error;
  }finally{clearTimeout(timeout);}
}
function renderTools(){
  const html=(pin && !(role==='host' && embedded)?`<span class="room-tag">PIN <b>${pin}</b></span>`:'')+
    (role!=='student'?iconButton(playing?'sound':'mute','music','Tetapan muzik'):'')+
    iconButton('help','rules','Cara bermain')+
    (role==='host'?button('Full screen','fullscreen',{cls:'ghost',attrs:'data-game-fullscreen-control',symbol:'full'}):role==='public'?(document.body.classList.contains('projector-fullscreen')
      ?button('Exit full screen','fullscreen',{cls:'primary',attrs:'aria-pressed="true"',symbol:'full'})
      :iconButton('full','fullscreen','Skrin penuh')):'');
  if(lastTools!==html){tools.innerHTML=html;lastTools=html;}
}
function showWelcome(force=false) {
  document.body.classList.remove('seated','round-table','teacher-answering');
  const id=[role,pin,key,busy].join('|');
  if(!force&&id===welcomeId)return;
  welcomeId=id;lastLayout='';renderTools();
  table.innerHTML=welcome({role,pin,name:local.read('name'),busy});
  table.setAttribute('aria-busy',String(busy));
}
function renderClock(){
  const deadline=state?.phase==='answering'?state.deadline:null;
  for(const el of table.querySelectorAll('[data-clock]')){
    el.hidden=!deadline;
    if(deadline)el.querySelector('span').textContent=Math.max(0,Math.ceil((deadline-serverClock())/1000))+' s';
  }
}
function draw(){
  if(!state){showWelcome();return;}
  document.body.classList.toggle('seated',role==='student');
  document.body.classList.toggle('round-table',role==='student'&&['question','answering','closed'].includes(state.phase));
  document.body.classList.toggle('teacher-answering',role==='host'&&['answering','closed'].includes(state.phase));
  let html;
  if(role==='student') {
    html=phone(state);
  }else {
    html=(state.phase==='lobby'?lobby(state,role==='host'):board(state,role==='host'))+(role==='host'?controls(state):'');
  }
  if(html!==lastLayout){
    const focus=document.activeElement?.closest('[data-act]');
    const oldPlay=document.getElementById('play-area');
    const active=focus&&[focus.dataset.act,focus.dataset.card??focus.dataset.base??focus.dataset.key];
    table.innerHTML=html;
    if(oldPlay&&table.querySelector('#play-area')) table.querySelector('#play-area').replaceWith(oldPlay);
    lastLayout=html;
    if(active&&active[0]){
      const replacement=[...table.querySelectorAll('[data-act]')].find(el=>el.dataset.act===active[0]&&(el.dataset.card??el.dataset.base??el.dataset.key)===active[1]);
      replacement?.focus({preventScroll:true});
    }
  }
  if(role==='student')renderHand(state);
  table.setAttribute('aria-busy','false');
  renderClock();renderTools();
}
function queueHand(){
  if(roundPaintQueued)return;
  roundPaintQueued=true;
  queueMicrotask(()=>{roundPaintQueued=false;if(state?.me)renderHand(state);});
}
function accept(next,sent) {
  if(!next||next.pin!==pin||next.role!==role)return false;
  if(next.version<lastVersion || next.version===lastVersion&&next.serverNow<lastSample)return false;
  const previous=state;
  lastVersion=next.version;lastSample=next.serverNow;
  const arrived=performance.now(),estimate=next.serverNow+Math.min(300,(arrived-sent)/2);
  // Keep the clock monotonic throughout a preview, including after a background-tab resume.
  const sameRound=previous?.gameId===next.gameId&&previous?.questionId===next.questionId;
  const inPreview=sameRound&&next.me?.previewStart&&next.me.previewStart===previous.me?.previewStart&&serverClock()<next.me.previewEnd;
  if(!inPreview)clockSample={time:sameRound?Math.max(serverClock(),estimate):estimate,at:arrived};
  state=next;
  if(!sameRound){clearHand();closeDialog();}
  if(!sameRound||next.phase!=='answering'||next.me?.submitted)choosingHint=null;
  if(sameRound&&previous.phase==='answering'&&next.phase!=='answering'&&modalMode==='review'&&modal.querySelector('[data-live="true"]'))openReview(next.questionId);
  if(previous?.phase!==next.phase&&modalMode==='purchase')closeDialog();
  if(playing && (next.phase==='ended' || (next.phase==='lobby' && previous && (previous.phase!=='lobby' || previous.gameId!==next.gameId)))) stopMusic();
  if(next.phase==='lobby'&&previous?.gameId!==next.gameId)clearPending();
  if(role==='student')warmImages(next);
  if(role==='public'||role==='host'){
    // Public/teacher screens prefetch the next illustrated question while reading this one.
    warmImages(next);
  }
  draw();
  if(next.me&&next.phase==='answering'&&!next.me.submitted){
    const draft=selection();
    if(draft.cardId||draft.wager)notifyChoosing();
  }
  if(previous?.me&&previous.me.balance!==next.me?.balance)chipFlight(next.me.balance>previous.me.balance);
  if(role==='host')postToShell('meniti:status',{phase:next.phase,onlineCount:next.onlineCount});
  return true;
}
function recover(error) {
  if(error.code!=='ROOM_NOT_FOUND'&&error.status!==401)return false;
  const oldPin=pin;clearPending();local.remove(role+':'+pin);
  if(role==='host')postToShell('meniti:unavailable');
  if(local.read(role+'-room')===pin)local.remove(role+'-room');
  if(error.code==='ROOM_NOT_FOUND'||role==='host')pin='';
  if(role==='public')history.replaceState(null,'',location.pathname+'?screen=');
  else stampRoute();
  key='';state=null;lastVersion=0;lastSample=0;clockSample=null;clearHand();closeDialog();
  showWelcome(true);
  notice(error.status===401?'Sila sertai semula dengan identiti peranti anda.':`Bilik ${oldPin} telah tamat. Gunakan PIN bilik semasa.`);
  return true;
}
async function refresh() {
  if(closed||pollActive||!pin||(!key&&role!=='public'))return;
  pollActive=true;const savedPin=pin,savedKey=key,sent=performance.now();
  try {
    const next=await api('/'+pin+'/state');
    if(pin!==savedPin||key!==savedKey)return;
    accept(next,sent);
    if(pending&&!busy)await transmit(pending);
  }catch(error){if(pin===savedPin&&key===savedKey&&!recover(error)&&!error.retry)notice(error.message);}
  finally{pollActive=false;}
}
async function create(){
  if(busy)return;
  busy=true;showWelcome(true);
  try {
    const result=await api('',{body:{},auth:''});pin=result.pin;key=result.hostToken;
    local.write('host-room',pin);local.write('host:'+pin,key);stampRoute();lastVersion=0;lastSample=0;
    await refresh();
  }catch(error){notice(error.message);}
  finally{busy=false;if(!state)showWelcome(true);}
}
async function join(form){
  if(busy)return;
  const data=new FormData(form),room=String(data.get('pin')).trim(),name=String(data.get('name')??'').trim();
  if(!validPin(room)||!name){notice('Masukkan PIN lima digit dan nama pasukan.');return;}
  busy=true;form.querySelector('button').disabled=true;
  try {
    const result=await api('/'+room+'/join',{body:{clientId,name},auth:''});
    pin=room;key=result.playerToken;local.write('student:'+pin,key);local.write('name',name);
    stampRoute();restorePending();lastVersion=0;lastSample=0;await refresh();
  }catch(error){notice(error.message);}
  finally{busy=false;form.querySelector('button').disabled=false;}
}
async function transmit(body){
  if(busy||!state)return false;
  busy=true;pending=body;local.write(pendingKey(),JSON.stringify(body));
  const sent=performance.now();
  try {
    const data=await api('/'+pin+'/action',{body});
    clearPending();accept(data.state,sent);return true;
  }catch(error){
    if(!error.retry)clearPending();
    if(!recover(error))notice(error.message);
    return false;
  }finally{busy=false;queueHand();}
}
async function act(type,extra={}){
  if(!state||busy||pending)return false;
  return transmit({type,gameId:state.gameId,questionId:state.questionId,requestId:uuid(),...extra});
}
// Progress is independent of the confirmed action queue. A slow hint must never delay play.
async function notifyChoosing(){
  if(role!=='student'||state?.phase!=='answering'||state.me.submitted)return;
  if(!choosingHint){
    const marker=[pin,state.gameId,state.questionId,state.me.id].join(':');
    let delivered=false;
    try{delivered=sessionStorage.getItem('meniti:choosing')===marker;}catch{}
    const body={type:'student:choosing',gameId:state.gameId,questionId:state.questionId,requestId:uuid()};
    choosingHint={marker,body,delivered,sending:false};
  }
  const hint=choosingHint;
  if(hint.delivered||hint.sending)return;
  hint.sending=true;
  try{
    await api('/'+pin+'/action',{body:hint.body});
    if(hint===choosingHint){
      hint.delivered=true;
      try{sessionStorage.setItem('meniti:choosing',hint.marker);}catch{}
    }
  }catch(error){
    // A transient failure is retried with the same request ID on the next state poll.
    if(!error.retry)hint.delivered=true;
  }finally{hint.sending=false;}
}
configureHand({serverClock,frame:queueHand,ready: s=>s===state?act('student:ready'):false});
function closeDialog(){reviewTicket++;modalMode='';if(dialog.open)dialog.close();}
function openDialog(mode,title,html) {
  modalMode=mode;
  modal.innerHTML=`<div class="modal-head"><h2 id="dialog-title">${escape(title)}</h2>${iconButton('close','dismiss','Tutup')}</div>${html}`;
  if(!dialog.open)dialog.showModal();
}
async function openReview(id) {
  if(role!=='host')return;
  const questionId=id??(state.phase==='answering'?state.questionId:state.history.at(-1));
  if(!questionId)return;
  const ticket=++reviewTicket;const game=state.gameId;
  try{
    const result=await api('/'+pin+'/review?questionId='+Number(questionId));
    if(ticket!==reviewTicket||state?.gameId!==game)return;
    if(result.live&&(state.phase!=='answering'||state.questionId!==questionId))return openReview(questionId);
    openDialog('review','Semakan jawapan',reviewView(result,state));
  }catch(error){notice(error.message);}
}
function openShopCard(card) {
  const power=powers[card];if(!power||state.phase!=='shop'||state.me.purchase)return;
  const targets=state.shopTargets.filter(t=>t.available&&(card!=='raise'||(state.players.find(p=>p.id===t.id)?.balance??0)>=2));
  const choose=card!=='shield';
  openDialog('purchase',power.name,`<div class="purchase-details"><img src="/battle15/art/${card}.webp" class="purchase-art" alt=""><div><p>${power.detail}</p><p><b>Harga ${power.cost} cip</b> · Baki selepas belian ${state.me.balance-power.cost} cip</p></div></div><form id="buy-form" class="purchase-form" data-key="${card}">${choose?`<label>Pasukan sasaran<select name="target" required><option value="">Pilih sasaran</option>${targets.map(t=>`<option value="${escape(t.id)}">${escape(t.name)}</option>`).join('')}</select></label>`:''}<button class="primary" ${choose&&!targets.length?'disabled':''}>Beli Kad · ${power.cost} cip</button></form>`);
}
function openQR() {
  const link=new URL('/battle15/index.html?join='+pin,location.origin).href;
  openDialog('qr','Sertai bilik '+pin,`<img class="qr-image" src="/api/meniti/rooms/${pin}/qr.svg" alt="Kod QR bilik ${pin}"><p class="support">Imbas menggunakan kamera telefon atau buka pautan ini.</p><a class="qr-link" href="${escape(link)}" target="_blank" rel="noopener">${escape(link)}</a>`);
}
function confirmAction(mode) {
  const reset=mode==='reset',msg=reset?'Semua keputusan, pembelian dan cip akan ditetapkan semula. Pasukan yang berdaftar kekal di bilik ini.':'Pusingan terbuka akan ditanda dan keputusan semasa akan dimuktamadkan.';
  openDialog(mode,reset?'Tetapkan semula permainan?':'Tamatkan permainan?',`<p>${msg}</p><div class="actions modal-actions">${button('Batal','dismiss')}${button(reset?'Tetapkan Semula':'Tamatkan Permainan','confirmed',{cls:'primary'})}</div>`);
}
function showMusicState(){
  renderTools();
  const toggle=modal.querySelector('[data-act="toggle-music"]');
  if(toggle)toggle.textContent=playing?'Hentikan Muzik':'Mainkan Muzik';
}
function stopMusic(){
  if(music)music.pause();
  playing=false;showMusicState();
}
async function startMusic(){
  if(role==='student'||!enabled||playing)return;
  if(!music){music=new Audio('/battle15/audio/backbay-lounge.mp3');music.loop=true;music.preload='none';}
  music.volume=volume;
  try{
    // Only one teacher/projector tab plays this room's music on this browser.
    await music.play();
    if(music.paused||playing)return;
    playing=true;local.write('music-owner',uuid());showMusicState();
  }catch{playing=false;showMusicState();}
}
window.addEventListener('storage',event=>{if(event.key===prefix+'music-owner'&&playing)stopMusic();});
function musicDialog(){
  openDialog('music','Muzik meja',`<div class="actions">${button(playing?'Hentikan Muzik':'Mainkan Muzik','toggle-music',{cls:'primary'})}</div><label class="volume">Kelantangan<input type="range" id="volume" min="0" max="100" value="${Math.round(volume*100)}"></label>${credit}`);
}
function setProjectorFullscreen(active){
  const focused=document.activeElement?.dataset.act==='fullscreen';
  document.body.classList.toggle('projector-fullscreen',active);
  renderTools();
  if(focused)tools.querySelector('[data-act="fullscreen"]')?.focus({preventScroll:true});
}
async function toggleProjectorFullscreen(){
  if(document.fullscreenElement){
    await document.exitFullscreen();
  }else if(document.body.classList.contains('projector-fullscreen')){
    setProjectorFullscreen(false);
  }else if(navigator.maxTouchPoints>0||!document.fullscreenEnabled){
    setProjectorFullscreen(true);
  }else{
    try{await document.documentElement.requestFullscreen();}
    catch{setProjectorFullscreen(true);}
  }
}
if(role==='public'){
  document.addEventListener('fullscreenchange',()=>setProjectorFullscreen(Boolean(document.fullscreenElement)));
}
async function handle(action,el) {
  if(action==='create')return create();
  if(action==='rules')return openDialog('rules','Cara bermain',rules);
  if(action==='music')return musicDialog();
  if(action==='toggle-music'){enabled=!playing;local.write('music',enabled?'on':'off');if(enabled)await startMusic();else stopMusic();return;}
  if(action==='dismiss'){closeDialog();return;}
  if(action==='fullscreen'&&role==='public')return toggleProjectorFullscreen();
  if(!state)return;
  switch(action){
    case 'qr': return openQR();
    case 'start': { const request=act('host:start');if(enabled)startMusic();if(!await request)stopMusic();return; }
    case 'countdown': return act('host:countdown',{seconds:10});
    case 'review': return openReview();
    case 'refresh-review': return openReview(Number(modal.querySelector('#review-question').value));
    case 'reveal': return act('host:reveal');
    case 'next': return act('host:next');
    case 'open-shop': return act('host:openShop');
    case 'close-shop': return act('host:closeShop');
    case 'leaderboard': return act('host:leaderboard',{visible:!state.showLeaderboard});
    case 'end': case 'reset': return confirmAction(action);
    case 'confirmed': {const mode=modalMode;closeDialog();if(mode==='end'||mode==='reset')return act('host:'+mode,{confirm:true});return;}
    case 'wager': pickWager(Number(el.dataset.base));void notifyChoosing();return;
    case 'card': pickCard(el.dataset.card);void notifyChoosing();return;
    case 'submit': return act('student:submit',selection());
    case 'retry-art': return retryImages();
    case 'power': return openShopCard(el.dataset.key);
    case 'new':
      if(state.phase==='ended'){postToShell('meniti:unavailable');pin='';key='';state=null;lastVersion=0;lastSample=0;local.remove('host-room');stampRoute();showWelcome(true);}return;
  }
}
document.addEventListener('click',event=>{
  const target=event.target.closest('[data-act]');
  if(target&&!target.disabled)handle(target.dataset.act,target).catch(error=>notice(error.message));
});
document.addEventListener('submit',async event=>{
  const form=event.target;event.preventDefault();
  if(form.id==='join-form'){await join(form);return;}
  if(form.id==='screen-form'){const room=form.elements.pin.value;if(validPin(room))location.assign(location.pathname+'?screen='+room);return;}
  if(form.id==='buy-form'){
    const card=form.dataset.key,targetId=form.elements.target?.value;
    if(card!=='shield'&&!targetId)return;
    const success=await act('student:buy',{card,...(targetId?{targetId}:{})});
    closeDialog();
    if(success)notice('Pembelian '+powers[card].name+' berjaya.');
    else await refresh();
  }
});
document.addEventListener('change',event=>{
  if(event.target.id==='review-question')openReview(Number(event.target.value));
});
document.addEventListener('input',event=>{
  if(event.target.id==='volume'){volume=Number(event.target.value)/100;local.write('volume',String(volume));if(music)music.volume=volume;}
});
dialog.addEventListener('cancel',()=>{reviewTicket++;modalMode='';});
window.addEventListener('online',()=>{retryImages();refresh();});
function concealPreview() { if(state?.me?.effect==='flash')table.classList.add('suspended'); }
function resumePreview() { if(state?.me){renderHand(state);table.classList.remove('suspended');}refresh(); }
document.addEventListener('visibilitychange',()=>{if(document.hidden)concealPreview();else resumePreview();});
window.addEventListener('pagehide',()=>{closed=true;concealPreview();stopMusic();});
window.addEventListener('pageshow',()=>{if(closed){closed=false;resumePreview();}});
let expiryRead='';
setInterval(()=>{
  if(document.hidden||!state)return;
  renderClock();
  if(state.phase==='answering'&&state.deadline&&serverClock()>=state.deadline){
    const id=state.gameId+':'+state.questionId;queueHand();if(expiryRead!==id){expiryRead=id;refresh();}
  }
},160);
setInterval(()=>{if(!document.hidden&&!busy)refresh();},1000);
if(openTeacherShell) location.replace('/?battle=15&teacher=1'+(validPin(requestedPin)?'&host='+requestedPin:''));
else if(key||role==='public'&&pin){renderTools();refresh();}else showWelcome(true);

