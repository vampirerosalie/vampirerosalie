import {connectRoom,requestId} from './connection.js';

const $ = id => document.getElementById(id);
const params = new URLSearchParams(location.search);
const mode = params.has('join') || params.has('student') ? 'team' : params.has('projector') ? 'projector' : params.has('teacher') || params.has('host') ? 'host' : 'team';
document.body.classList.toggle('projected', mode === 'projector');
document.body.classList.toggle('student-view', mode === 'team');
const esc = value => String(value ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const key = key => 'paintball:' + key;
function get(k, perTab = false) { try { return (perTab ? sessionStorage : localStorage).getItem(key(k)) || ''; } catch { return ''; } }
function save(k,v,perTab = false) { try { const s = perTab ? sessionStorage : localStorage; if(v)s.setItem(key(k),v);else s.removeItem(key(k)); } catch {} }
const validPin = v => /^\d{5}$/.test(v || '') ? v : '';
const routePin = mode === 'team' ? params.get('join') : mode === 'host' ? params.get('host') : params.get('projector');
let pin = validPin(routePin || get(mode+'-room'));
const credentialKey = () => mode + ':' + pin;
let token = mode === 'projector' ? location.hash.slice(1) || get(credentialKey(),true) : get(credentialKey());
if (mode === 'projector' && location.hash) {
  save(credentialKey(),token,true);
  history.replaceState(null,'',location.pathname+location.search);
}
let state=null, frame=null, socket=null, connection='connecting', busy=false, roomError='', dialogType='';
let selected='', draftQuestion='', roster=[], arena=null, arenaKey='', arenaVersion=0, diagnostics=null;
let roomLookup='', lobbyPhase='', gameOffset=0, sendWritingFor='', lastHud=0, started=false;
const paths={target:'<circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="5"/><circle cx="12" cy="12" r="1.4" fill="currentColor"/>',qr:'<path d="M3 3h6v6H3zM15 3h6v6h-6zM3 15h6v6H3zM14 14h3v3h-3zM20 14v7h-5"/>',screen:'<rect x="2" y="3" width="20" height="14" rx="2"/><path d="M12 17v4m-4 0h8"/>',expand:'<path d="M3 9V3h6m6 0h6v6m0 6v6h-6M9 21H3v-6"/>',cup:'<path d="M7 3h10v6a5 5 0 0 1-10 0zm0 2H3v2a4 4 0 0 0 4 4m10-6h4v2a4 4 0 0 1-4 4m-5 3v5m-4 2h8"/>',team:'<circle cx="9" cy="8" r="3"/><path d="M3 20v-3a6 6 0 0 1 12 0v3m0-15a3 3 0 0 1 0 6m3 2a5 5 0 0 1 3 5"/>',arrow:'<path d="M4 12h15m-6-6 6 6-6 6"/>'};
const icon = name => `<svg class="icon" viewBox="0 0 24 24" aria-hidden="true">${paths[name]||''}</svg>`;
const btn = (label,action,cls='',disabled=false,attributes='') => `<button type="button" class="btn ${cls}" data-act="${action}" ${disabled?'disabled':''} ${attributes}>${label}</button>`;
const attr = (k,v) => `data-${k}="${esc(v)}"`;
const dot = team => `<i class="dot" style="background:${esc(team.color)}"></i>`;
const host = () => mode === 'host';
const player = () => mode === 'team';
const me = () => state?.teams.find(t=>t.id===state.teamId);
const joinLink = () => new URL('/battle14/index.html?join='+pin,location.origin).href;
const projectorLink = () => new URL('/battle14/index.html?projector='+pin+'#'+encodeURIComponent(get('projection:'+pin)),location.origin).href;
function notice(message) { $('notice').textContent=message; $('notice').hidden=false;clearTimeout(notice.timer);notice.timer=setTimeout(()=>{$('notice').hidden=true;},5800); }
async function api(path,body) {
  const res = await fetch('/api/paintball/'+path,{method:body?'POST':'GET',...(body?{headers:{'Content-Type':'application/json'},body:JSON.stringify(body)}:{}),cache:'no-store'});
  const data=await res.json().catch(()=>({}));
  if(!res.ok)throw Object.assign(new Error(data.error||data.message||'The room could not be reached.'),{status:res.status});
  return data;
}
async function perform(fn) {
  if(busy)return;
  busy=true;
  try { await fn(); }
  catch(e){notice(e.message||'Please try again.');}
  finally{busy=false;}
}
function disconnect(){socket?.close();socket=null;state=frame=null;started=false;}
function startConnection() {
  if(!token||!pin)return;
  started=true;roomError='';
  socket=connectRoom({pin,token,onStatus(s){
    connection=s;
    if(s!=='connected'){frame=null;arena?.suspendInput?.();}
    if(started)renderMast();
  },
    onState(next,serverTime){
      const changed=state && (state.phase!==next.phase||state.question?.id!==next.question?.id);
      if(changed){closeDialog();frame=null;}
      state=next;gameOffset=(serverTime||next.serverTime||Date.now())-Date.now();
      if(next.question?.id!==draftQuestion){draftQuestion=next.question?.id;selected=next.ownAnswer||get('draft:'+pin+':'+draftQuestion,true);sendWritingFor='';}
      if(next.ownAnswer)selected=next.ownAnswer;
      render();
      if(dialogType==='review'||dialogType==='teams')refreshDialog();
      if(host()&&window.parent!==window)parent.postMessage({type:'paintball:status',pin,phase:state.phase,onlineCount:state.onlineCount},location.origin);
    },
    onFrame(next){frame=next;arena?.update(next);if(performance.now()-lastHud>150){updateLive();lastHud=performance.now();}},
    onDiagnostics(d){diagnostics=d;if(dialogType==='diagnostics')refreshDialog();},
    onError(message){roomError=message;notice(message);if(!state)render();}
  });
}
function rememberRoom() {
  save(mode+'-room',pin);
  if(player())save('student-room',pin,true);
  if(mode!=='projector')save(credentialKey(),token);
  history.replaceState(null,'',location.pathname+'?'+(host()?'teacher=1&host=':player()?'join=':'projector=')+pin);
}
async function createRoom(){
  const result=await api('rooms',{});
  disconnect();pin=result.pin;token=result.hostToken;save('projection:'+pin,result.projectorToken);
  rememberRoom();render();startConnection();
}
async function lookup(input) {
  const target=validPin(input);
  if(!target)throw Error('Enter the five-digit room PIN.');
  const result=await api('rooms/'+target+'/teams');
  pin=target;roster=result.teams||[];lobbyPhase=result.phase||'lobby';roomLookup=target;roomError='';render();
}
function pendingJoin(){
  try {
    const saved=JSON.parse(get('joining',true)||'null');
    // Earlier pages saved one more item after the name. The original request
    // key still recovers that phone if the first join response was lost.
    const [room,teamId,name]=JSON.parse(saved?.identity||'[]');
    if(room===pin&&saved.joinKey&&(teamId||name))return {teamId,name:teamId?'':name,joinKey:saved.joinKey};
  } catch {}
}
async function enterTeam({teamId,name,joinKey}){
  const identity=JSON.stringify([pin,teamId,name]);
  save('joining',JSON.stringify({identity,joinKey}),true);
  const result=await api('rooms/'+pin+'/join',{...(teamId?{teamId}:{name}),joinKey});
  token=result.token;rememberRoom();save('joining','',true);render();startConnection();
}
async function join(form) {
  const values=new FormData(form);
  if(!roomLookup){await lookup(String(values.get('pin')||''));return;}
  const teamId=String(values.get('teamId')||''),name=teamId?'':String(values.get('name')||'').trim();
  if(!teamId&&!name)throw Error('Enter your new team’s name.');
  const pending=pendingJoin();
  const joinKey=pending?.teamId===teamId&&pending?.name===name?pending.joinKey:requestId();
  await enterTeam({teamId,name,joinKey});
}
async function restoreStudentEntry() {
  const attempt=pendingJoin();
  if(attempt) {
    try { await enterTeam(attempt); return; }
    catch(e) {
      if(e.status>=400&&e.status<500&&e.status!==429)save('joining','',true);
      notice(e.message);
    }
  }
  await lookup(pin);
}
function resetEntry(){disconnect();closeDialog();save(credentialKey(),'');save(mode+'-room','');if(player())save('student-room','',true);pin=token=roomLookup=roomError='';roster=[];history.replaceState(null,'',location.pathname+(host()?'?teacher=1':'?student=1'));render();}
function renderMast(){
  $('mast').innerHTML=`<div class="brand"><span class="brandmark">${icon('target')}</span><div><strong>Paintball Showdown</strong><small>Battle 14 · ${esc(state?.deviceLabel||'Toybox Arena')}</small></div></div>
  <div class="top-controls">${pin?`<span class="room-code"><small>PIN</small><b>${esc(pin)}</b></span>`:''}
  ${state?`<span class="online-label ${connection!=='connected'?'offline':''}">${connection==='connected'?'Live':'Reconnecting'}</span>`:''}
  ${host()&&state?btn(icon('qr')+' Join QR','qr','dark')+`<a class="link-btn dark" href="${esc(projectorLink())}" target="_blank" rel="noopener">${icon('screen')} Projector view</a>`:''}
  ${state&&!player()?btn(icon('expand')+' Fullscreen','fullscreen','dark'):''}</div>`;
}
function visual(kind){
  const desired=kind==='live' ? 'live:'+state.round+':'+state.teamId+':'+state.canControl : kind;
  const el=$('stage-visual');el.hidden=!desired;
  if(desired===arenaKey)return;
  arenaKey=desired;const version=++arenaVersion;
  arena?.destroy();arena=null;el.replaceChildren();if(!desired)return;
  const surface=document.createElement('div');el.append(surface);
  if(kind==='preview'){const label=document.createElement('span');label.className='preview-label';label.textContent='Toybox Battle Arena';el.append(label);}
  if(kind==='preview'&&player()){
    const poster=new Image();
    poster.className='arena-poster';
    poster.src='./arena-poster.webp';
    poster.alt='Toybox Arena with colourful barriers and team robots';
    surface.append(poster);
    return;
  }
  import('./arena-view.js').then(({mountArena})=>{
    if(version!==arenaVersion)return;
    arena=mountArena(surface,{teamId:kind==='live'?state.teamId:null,canControl:kind==='live'&&state.canControl,teams:state?.teams||[],
      onInput(input){if(state?.canControl&&state.phase==='shootout'&&!state.paused)socket?.input({...input,round:state.round});}});
    if(kind==='live'&&frame)arena.update(frame);
  }).catch(()=>{if(version===arenaVersion)surface.innerHTML='<div class="panel">The 3D arena could not load. Reload this page to retry.</div>';});
}
function welcome(){
  if(started&&!state)return `<section class="panel"><h1>${roomError?'Room unavailable':'Connecting to the arena…'}</h1><p>${esc(roomError||'Restoring your place in the room.')}</p>${btn(host()?'Back to rooms':'Enter another PIN','reset-entry')}</section>`;
  if(host())return `<section class="panel start-panel splash-preview"><div class="kicker">Battle 14 · English</div><h1 class="big-title">Paintball <span>Showdown</span></h1><p>Answer five questions to earn paintballs. Then take your robot into the arena for a 60-second shootout.</p><div class="stat-grid"><div class="stat"><small>English questions</small><b>20</b></div><div class="stat"><small>Shootouts</small><b>4</b></div></div>${btn('Create room '+icon('arrow'),'create','sun fullrow')}</section>`;
  if(mode==='projector')return `<section class="panel"><h1>Projector view</h1><p>Open Projector view from the teacher’s room to display the live game.</p></section>`;
  const allowNew=lobbyPhase==='lobby'&&roster.length<12;
  const teamSelect=roster.map(t=>`<option value="${esc(t.id)}">${esc(t.name)}</option>`).join('');
  return `<section class="panel start-panel"><div class="kicker">Student entrance</div><h1>Join the arena</h1>
    <form id="join-form">${roomLookup?`<p>${allowNew?'Start a team or join an existing one as a teammate.':'Choose your team to follow its robot.'} Your teacher can switch who controls the robot.</p>
    <label class="field">Team<select name="teamId" id="join-team">${allowNew?'<option value="">Create a new team</option>':''}${teamSelect}</select></label>
    <label class="field" id="new-team-field" ${allowNew?'':'hidden'}>Team name<input name="name" maxlength="28" autocomplete="off" placeholder="Your team name"></label>`:
    `<p>Enter the PIN displayed on your teacher’s screen.</p><label class="field">Room PIN<input name="pin" maxlength="5" inputmode="numeric" pattern="[0-9]{5}" value="${esc(pin)}" required></label>`}
    <button class="btn primary fullrow" type="submit">${roomLookup?'Join room':'Find room'}</button></form>${roomLookup?btn('Use another PIN','reset-entry','tiny mid'):''}</section>`;
}
function teamRoster({devices=false}={}){
  if(!state.teams.length)return '<p class="small">Teams appear here as they scan the joining QR.</p>';
  return `<div class="roster">${state.teams.map(t=>`<div class="team-row"><div class="team-name">${dot(t)}<span><strong>${esc(t.name)}</strong><small>${t.online?'Online':'Disconnected'}${state.phase==='quiz'?' · '+esc(t.answerStatus):''}</small></span></div>
    <span class="small">${devices&&host()?esc(t.devices?.length||0)+' device(s)':state.phase==='roundReady'&&t.startingAmmo!==undefined?t.startingAmmo+' paintballs':esc(t.colorName)}</span></div>`).join('')}</div>`;
}
function lobby(){
  if(player())return `<section class="panel start-panel"><div class="kicker">Team lobby</div><h1>${esc(me()?.name)}</h1><p>${state.canControl?'You control this team’s robot.':'You are watching this team. Your teacher can give you control.'}</p><div class="status-note">Waiting for the teacher to start Question 1.</div></section>`;
  return `<section class="panel start-panel"><div class="kicker">Room lobby</div><div class="heading-line"><h1>Ready room</h1><span class="badge">${state.teams.length} / 12 teams</span></div>
    <div class="join-display"><img src="/api/paintball/qr?text=${encodeURIComponent(joinLink())}" alt="Scan to join this Paintball room"><div><h3>Scan to join</h3><strong>${esc(pin)}</strong>${btn('Copy group link','copy','tiny')}</div></div>${teamRoster({devices:true})}
    ${host()?`<div class="buttons actions">${btn('Start game','start','sun',!state.teams.length)}${btn('Manage teams','teams','',!state.teams.length)}</div><div class="buttons actions">${btn('End game','end-game','tiny danger')}</div>`:''}</section>`;
}
function questionPanel(){
  const q=state.question, canAnswer=player()&&state.canControl&&!state.closed&&!state.ownAnswer;
  return `<section class="panel question-sheet"><div class="question-copy"><div class="heading-line"><div class="kicker">Question ${q.number} / 20</div><span class="badge">Stage ${state.round} / 4</span></div>
    <h1>${esc(q.prompt).replace('______','<span class="blank" aria-label="blank">______</span>')}</h1></div>
    <div class="question-responses"><div class="options">${Object.entries(q.options).map(([id,text])=>{
      const chosen=player()&&selected===id, css=(chosen?' chosen':'')+(state.revealed===id?' revealed':'');
      return `<button class="option${css}" type="button" data-act="option" data-choice="${id}" ${canAnswer?'':'disabled'} aria-pressed="${chosen}"><b>${id}</b><span>${esc(text)}</span></button>`;
    }).join('')}</div>${state.revealed?`<div class="status-note">Correct answer · ${esc(state.revealed)} · ${esc(q.options[state.revealed])}</div>`:''}
    ${player()?(state.ownAnswer?`<div class="status-note">Submitted · ${esc(state.ownAnswer)}</div>`:state.closed?'<div class="status-note">Submissions closed</div>':state.canControl?btn('Submit answer','submit','primary fullrow',!selected):'<div class="status-note">Watching your team’s controller</div>'):''}
    </div><div class="stage-track" aria-hidden="true">${Array.from({length:5},(_,i)=>`<i class="${i<(q.number-1)%5?'fill':i===(q.number-1)%5?'active':''}"></i>`).join('')}</div>
    ${state.deadline?'<p class="badge clock" id="quiz-clock"></p>':''}</section>`;
}
function controls(){
  const q=state.question;
  return `<div class="stack"><section class="panel"><div class="heading-line"><h2>Question controls</h2></div><div class="badge">${state.finalized?'Answers finalized':state.closed?'Submissions closed':'Accepting answers'}</div>
    <div class="actions"><div class="buttons">${btn('Start 10-second countdown','countdown','',state.closed||!!state.deadline)}${btn('Close submissions','close','',state.closed)}</div>
    <div class="buttons">${btn('Review answers','review','primary')+btn('Finalize answers','finalize','',state.finalized)+btn('Reveal answer','reveal','',!state.finalized||!!state.revealed)}</div>
    <div class="buttons">${btn(q.number%5===0?'Prepare shootout':'Next question','next','sun fullrow',!state.finalized)}</div></div></section>
    <section class="panel"><div class="heading-line"><h2>Teams</h2>${btn('Manage','teams','tiny')}</div>${teamRoster()}<div class="buttons actions">${btn('End game','end-game','tiny danger')}</div></section></div>`;
}
function roundReady(){
  const t=me();return `<section class="panel start-panel"><div class="kicker">Shootout ${state.round} / 4</div><h1>Ready to play</h1><p>60 seconds. Score 3 for your first hit on each opponent and 1 for each drone.</p>
  ${player()?`<div class="stat"><small>Your starting paintballs</small><b>${t.startingAmmo}</b></div><div class="status-note">${state.canControl?'Move with your left thumb. Drag FIRE with your right thumb to aim, then release to shoot.':'Your team controller will play. You can watch here.'}</div>`:teamRoster()}
  ${host()?`<div class="buttons actions">${btn('Start shootout','start-round','sun')}${btn('Manage teams','teams')}${btn('End game','end-game','tiny danger')}</div>`:''}</section>`;
}
function livePanel(){
  if(player())return '';
  return `<section class="panel"><div class="kicker">Shootout ${state.round} / 4</div><div class="heading-line"><h1 class="timer" id="round-clock">1:00</h1><span class="badge">${state.paused?'Paused':'Live arena'}</span></div><div id="live-roster"></div>
    ${host()?`<div class="buttons actions">${btn(state.paused?'Resume':'Pause',state.paused?'resume':'pause','sun')}${btn('End shootout','end-round','danger')}</div>
    <div class="buttons actions">${btn('Manage teams','teams','tiny')}${btn('Diagnostics','diagnostics','tiny')}${btn('End game','end-game','tiny danger')}</div>`:''}</section>`;
}
function results(){
  const final=state.phase==='finished', ranked=[...state.teams].sort((a,b)=>b.score-a.score), top=ranked.filter(t=>t.score===ranked[0]?.score);
  const before = state.history?.at(-2)?.teams || [];
  const scoredThisRound = t => t.score - (before.find(other => t.id === other.id)?.score ?? 0);
  const heading=final?(top.length?top.map(t=>esc(t.name)).join(' &amp; '):'Game complete'):'Shootout '+state.round+' complete';
  return `<section class="panel ${final?'winner':'start-panel'}">${final?'<span class="winner-mark">'+icon('cup')+'</span>':''}<div class="kicker">${final?(top.length>1?'Joint winners':'Final standings'):'Round results'}</div><h1>${heading}</h1>
    <p>${final&&top.length?`<strong>${top[0].score} shooting points</strong> · ${state.completedRounds} completed shootout${state.completedRounds===1?'':'s'}`:'Each team’s shooting points carry forward to the next round.'}</p>
    <div class="scroll"><table class="leader-table"><thead><tr><th scope="col">Team</th>${final?'':'<th>This round</th>'}<th>Total points</th>${final?'<th>English</th>':''}<th>First hits</th><th>Drones</th><th>Stolen</th><th>Lost</th></tr></thead><tbody>
    ${ranked.map(t=>`<tr><td><div class="team-name">${dot(t)} <strong>${esc(t.name)}</strong></div></td>${final?'':`<td>${scoredThisRound(t)>0?'+':''}${scoredThisRound(t)}</td>`}<td><b>${t.score}</b></td>${final?`<td>${t.englishCorrect}/20</td>`:''}<td>${t.stats.firstHits}</td><td>${t.stats.drones}</td><td>${t.stats.stolen}</td><td>${t.stats.lost}</td></tr>`).join('')}</tbody></table></div>
    ${host()?`<div class="buttons actions">${final?btn('New game','new-game','primary'):state.round===4?btn('Show final standings','finish','sun'):btn('Continue to questions','continue','sun')+btn('End game','end-game','tiny danger')}</div>`:''}</section>`;
}
function render(){
  renderMast();
  const phase=state?.phase||'welcome',inQuiz=phase==='quiz',live=phase==='shootout',direct=live&&player();
  const preview=phase==='lobby'||phase==='roundReady'||(phase==='welcome'&&!(token&&pin));
  document.body.classList.toggle('player-shoot',direct);
  document.body.classList.toggle('student-quiz',inQuiz&&player());
  $('stage').className=direct?'direct shoot':live?'studio shoot':preview?'studio splash-preview':'';
  visual(preview?'preview':live?'live':'');
  $('content').className=phase==='quiz'&&player()?'phone-wrap':'';
  $('content').innerHTML=!state?welcome():phase==='lobby'?lobby():inQuiz?(host()?`<div class="quiz-grid">${questionPanel()}${controls()}</div>`:questionPanel()):phase==='roundReady'?roundReady():live?livePanel():results();
  updateLive();
}
function updateLive(){
  if($('quiz-clock')&&state?.deadline)$('quiz-clock').textContent='Submissions close in '+Math.max(0,Math.ceil((state.deadline-Date.now()-gameOffset)/1000))+'s';
  if(!$('round-clock'))return;
  const seconds=frame?Math.ceil(frame.remainingMs/1000):60;
  $('round-clock').textContent=Math.floor(seconds/60)+':'+String(seconds%60).padStart(2,'0');$('round-clock').classList.toggle('urgent',seconds<=10);
  $('live-roster').innerHTML=state.teams.map(t=>{const p=frame?.players.find(p=>p.id===t.id);return `<div class="team-row"><span class="team-name">${dot(t)}<span><strong>${esc(t.name)}</strong><small>${t.controllerOnline?'Controller online':'Controller offline'}</small></span></span><span class="score">${p?.score??t.score} pts <small class="muted">· ${p?.ammo??'–'} ammo</small></span></div>`;}).join('');
}
function closeDialog(){dialogType='';if($('dialog').open)$('dialog').close();}
function openDialog(type){dialogType=type;refreshDialog();if(!$('dialog').open)$('dialog').showModal();}
function refreshDialog(){
  let title='',body='';
  switch(dialogType){
    case 'review':
      if(!state?.review)return closeDialog();
      title='Review answers';
      body=`<p>Teacher only · Question ${state.question.number}</p><div class="status-note">Answer key · ${state.review.answer} · ${esc(state.question.options[state.review.answer])}</div>
      ${state.review.entries.map(entry=>{const team=state.teams.find(t=>t.id===entry.teamId);return `<div class="review-row"><div class="team-name">${dot(team)}<strong>${esc(team.name)}</strong></div><span class="small">${entry.answer?'Submitted '+entry.answer+' · Automatic suggestion '+(entry.suggestion==='accept'?'correct':'incorrect'):'No answer submitted'}</span>
        <div class="buttons">${['accept','reject'].map(d=>btn(d==='accept'?'Accept':'Reject','decision','tiny '+d+(entry.decision===d?' current':''),state.finalized||(!entry.answer&&d==='accept'),attr('team',team.id)+' '+attr('decision',d))).join('')}</div></div>`;}).join('')}
      <div class="buttons">${btn('Finalize answers','finalize','primary',state.finalized)}</div>`;
      break;
    case 'qr':
      title='Scan to join';body=`<img class="qr-image" src="/api/paintball/qr?text=${encodeURIComponent(joinLink())}" alt="QR code to join this room"><div class="large-pin">${esc(pin)}</div><p class="code-link">${esc(joinLink())}</p>${btn('Copy group link','copy','primary fullrow')}`;break;
    case 'teams':
      title='Manage teams';body=state.teams.map(t=>`<div class="review-row"><div class="team-name">${dot(t)}<strong>${esc(t.name)}</strong></div>
      ${state.phase==='lobby'?`<form data-rename="${esc(t.id)}"><label class="field">Team name<input name="name" value="${esc(t.name)}" maxlength="28" required></label><label class="field">Team colour<select name="color">${state.colors.map(c=>`<option value="${c.color}" ${c.color===t.color?'selected':''}>${esc(c.name)}</option>`).join('')}</select></label><button class="btn tiny" type="submit">Save team</button></form>`:''}
      ${t.devices.map(d=>`<div class="team-row"><div><strong>${esc(d.name)}</strong><small class="small"> · ${d.online?'Online':'Offline'}</small></div>${btn(d.controller?'Active controller':'Give control','controller','tiny'+(d.controller?' current':''),d.controller,attr('team',t.id)+' '+attr('device',d.id))}</div>`).join('')}</div>`).join('');break;
    case 'diagnostics':
      title='Room diagnostics';
      body=diagnostics?Object.entries({connectedClients:'Connected clients',incomingPerSecond:'Messages received / second',outgoingPerSecond:'Messages sent / second',framesPerSecond:'Arena updates / second',averageLatencyMs:'Average round-trip latency (ms)',averageProcessingMs:'Average processing time (ms)',checkpointWrites:'State checkpoint writes',estimatedRequestUnits:'Estimated request units'}).map(([k,label])=>`<div class="team-row"><span>${label}</span><strong>${Number.isFinite(diagnostics[k])?Number(diagnostics[k].toFixed(2)):'–'}</strong></div>`).join(''):'<p>Measuring…</p>';
      body+=btn('Refresh','diagnostics','tiny mid');break;
    case 'end-round':
      title='End this shootout early?';body='<p>All robots stop and the points already scored are kept.</p>'+btn('End shootout now','end-round-confirm','danger');break;
    case 'end-game':
      title='End this game?';body='<p>Students will see the final standings, including all shooting points earned so far.</p>'+btn('End game now','finish','danger');break;
    default:return;
  }
  $('dialog').innerHTML=`<div class="dialog-head"><h2>${title}</h2>${btn('Close','dismiss','tiny')}</div><div class="dialog-body">${body}</div>`;
}
async function command(type,extra={}){await socket.action({type,...(state.question?{questionId:state.question.id}:{}),round:state.round,...extra});}
$('app').addEventListener('submit',e=>{if(e.target.id==='join-form'){e.preventDefault();perform(()=>join(e.target));}});
$('dialog').addEventListener('submit',e=>{if(e.target.matches('[data-rename]')){e.preventDefault();const values=new FormData(e.target);perform(()=>command('host:edit-team',{teamId:e.target.dataset.rename,name:values.get('name'),color:values.get('color')}));}});
document.addEventListener('change',e=>{if(e.target.id==='join-team')$('new-team-field').hidden=!!e.target.value;});
$('dialog').addEventListener('close',()=>{dialogType='';});
async function clicked(el){
  const action=el.dataset.act;
  switch(action){
    case 'dismiss':closeDialog();return;
    case 'create':case 'new-game':await createRoom();return;
    case 'reset-entry':resetEntry();return;
    case 'fullscreen':if(document.fullscreenElement)await document.exitFullscreen();else await document.documentElement.requestFullscreen();return;
    case 'qr':case 'teams':case 'review':case 'end-game':case 'end-round':openDialog(action);return;
    case 'diagnostics':openDialog(action);socket.diagnostics();return;
    case 'copy':try{await navigator.clipboard.writeText(joinLink());notice('Group joining link copied.');}catch{window.prompt('Copy this group joining link',joinLink());}return;
    case 'option':
      selected=el.dataset.choice;save('draft:'+pin+':'+state.question.id,selected,true);
      render();if(sendWritingFor!==state.question.id){sendWritingFor=state.question.id;socket.action({type:'student:writing',questionId:state.question.id}).catch(()=>{});}return;
    case 'submit':await command('student:submit',{answer:selected});return;
    case 'controller':await command('host:controller',{teamId:el.dataset.team,deviceId:el.dataset.device});return;
    case 'decision':await command('host:decision',{teamId:el.dataset.team,decision:el.dataset.decision});return;
    case 'end-round-confirm':closeDialog();await command('host:end-round');return;
    case 'finalize':case 'finish':closeDialog();break;
  }
  await command('host:'+action);
}
document.addEventListener('click',event=>{const button=event.target.closest('[data-act]');if(button&&!button.disabled)perform(()=>clicked(button));});
setInterval(()=>{if(state?.phase==='quiz'&&state.deadline)updateLive();},240);
if(pin&&token)startConnection();
render();
if(pin&&!token&&player())restoreStudentEntry().catch(e=>{roomError=e.message;notice(e.message);});
