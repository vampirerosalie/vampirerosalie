import { resolveTreasureRoute, treasureTeacherShellUrl } from './route.js?v=3';
import { retireReviewSession } from './retire-review-session.js?v=1';
import { questionDesk, responseStatuses, reviewDialog } from './teacher-desk.js?v=2';
import { REWARD_ART, rewardArt, artImage } from './reward-art.js?v=1';
import { locationScene } from './location-scenes.js?v=1';
const $=s=>document.querySelector(s), app=$('#app'), dialog=$('#dialog');
const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const PREFIX='treasure-raid:', params=new URLSearchParams(location.search);
const get=(k,f='')=>{try{return localStorage.getItem(PREFIX+k)??f;}catch{return f;}};
const put=(k,v)=>{try{localStorage.setItem(PREFIX+k,v);}catch{}};
const del=k=>{try{localStorage.removeItem(PREFIX+k);}catch{}};
try {
  await retireReviewSession(location.search,localStorage,sessionStorage,async (room,key)=>{
    const response=await fetch('/api/treasure/rooms/'+room+'/state',{headers:{Authorization:'Bearer '+key},cache:'no-store',signal:AbortSignal.timeout(16000)});
    return response.ok ? response.json() : null;
  });
} catch { /* Storage restrictions must not interrupt normal joining. */ }
let marker='';try{marker=sessionStorage.getItem(PREFIX+'student-route')??'';}catch{}
const route=resolveTreasureRoute(location.search,get,marker);
const embedded=window.parent!==window;
let {pin,token,hostIntent}=route;
let host=false,state=null,content=null,review=null,busy=false,online=true,lastVersion=-1,screen='answer',readPage=0,readScroll=0;
let clientId=get('client-id');if(!clientId){clientId=crypto.randomUUID();put('client-id',clientId);}
let reviewOpen=false,serverOffset=0,pending=null,roomUnavailable=false;
try{pending=JSON.parse(get('pending:'+pin,'null'));}catch{}
const drafts=()=>{try{return JSON.parse(get('drafts:'+pin,'{}'));}catch{return {};}};
const draft=q=>drafts()[q]??'';
function saveDraft(){const input=$('#answer');if(input&&state){const all=drafts();all[input.dataset.question]=input.value;put('drafts:'+pin,JSON.stringify(all));}}
function rememberReader(){const el=$('.scroll');if(screen==='read'&&el)readScroll=el.scrollTop;put('reader:'+pin,JSON.stringify({page:readPage,scroll:readScroll}));}
try{const r=JSON.parse(get('reader:'+pin,'{}'));readPage=Math.max(0,Math.min(8,r.page??0));readScroll=r.scroll??0;}catch{}
function studentRoute(){host=false;hostIntent=false;put('student-room',pin);try{sessionStorage.setItem(PREFIX+'student-route',JSON.stringify({room:pin}));}catch{}history.replaceState(null,'','/battle12/?'+(pin?'join='+pin:'student=1'));}
if(route.student)studentRoute();
function notice(message){$('#notice').textContent=message;$('#notice').style.display='block';clearTimeout(notice.timer);notice.timer=setTimeout(()=>$('#notice').style.display='none',6000);}
async function api(path,{method='GET',body,auth=token}={}){
  let response;try{response=await fetch('/api/treasure/'+path,{method,headers:{...(auth?{Authorization:'Bearer '+auth}:{}),...(body?{'Content-Type':'application/json'}:{})},...(body?{body:JSON.stringify(body)}:{}),cache:'no-store',signal:AbortSignal.timeout(16000)});}catch{throw Object.assign(Error('Connection interrupted. Your progress is saved. Retry the same action.'),{network:true});}
  const data=await response.json();if(!response.ok)throw Object.assign(Error(data.error||'Please retry.'),{status:response.status,code:data.code,network:response.status>=500});return data;
}
async function refresh(force=false){
  if(!pin)return;
  const requestedPin=pin;
  try{
    const next=await api(`rooms/${requestedPin}/state`);
    if(pin!==requestedPin)return;
    online=true;
    if(state&&next.version<state.version)return;
    if(['ended','finished'].includes(next.phase)&&!ended()){rememberReader();screen='answer';dialog.close();music?.pause();musicOn=false;}
    if(token&&next.role==='host'){host=true;if(!content)content=await api(`rooms/${pin}/content`);}
    if(token&&next.role==='student'){studentRoute();if(!content)content=await api(`rooms/${pin}/content`);}
    const change=roomUnavailable||force||next.version!==lastVersion||(host&&JSON.stringify(next.players)!==JSON.stringify(state?.players));
    roomUnavailable=false;
    if(state?.question?.id!==next.question?.id){reviewOpen=false;if(dialog.classList.contains('answer-review'))dialog.close();}
    state=next;lastVersion=next.version;serverOffset=next.serverTime-Date.now();
    if(host&&reviewOpen)review=await api(`rooms/${pin}/review`);
    if(change&&!busy)render();
    updateConnection();
    if(host)parent.postMessage({type:'treasure-raid:status',pin,phase:state.phase,onlineCount:state.onlineCount},location.origin);
  }catch(e){if(pin!==requestedPin)return;online=false;updateConnection();if(e.status===401){token='';host=false;render();notice('This device cannot open that room. Scan the joining QR again.');}else if(e.status===404&&e.code==='ROOM_NOT_FOUND'){state=null;content=null;review=null;reviewOpen=false;dialog.close();music?.pause();musicOn=false;roomUnavailable=true;render();}else if(force)notice(e.message);}
}
function updateConnection(){const c=$('.connection');if(c){c.classList.toggle('offline',!online);c.textContent=online?'Connected · progress saved on the server':'Reconnecting… Your saved progress is safe.';}}
async function send(type,extra={}){
  if(busy)return;saveDraft();rememberReader();busy=true;
  const body=pending??{type,requestId:crypto.randomUUID(),...extra};pending=body;put('pending:'+pin,JSON.stringify(body));
  try{
    const data=await api(`rooms/${pin}/action`,{method:'POST',body});pending=null;del('pending:'+pin);state=data.state;lastVersion=state.version;online=true;
    serverOffset=state.serverTime-Date.now();
    if(host&&reviewOpen)review=await api(`rooms/${pin}/review`);
    if(data.result?.title)showOutcome(data.result);else if(type==='student:submit')notice(data.result?.autoAccepted?'Answer accepted · 1 Action earned.':'Answer submitted. Waiting for your teacher.');
  }catch(e){if(!e.network){pending=null;del('pending:'+pin);}notice(e.message);await refresh();}
  finally{busy=false;render();}
}
function modal(title,body,confirmLabel,onConfirm){
  reviewOpen=false;dialog.classList.remove('reward-dialog','answer-review');
  dialog.innerHTML=`<h2>${esc(title)}</h2>${body}<div class="row"><button id="modal-cancel" class="quiet">${confirmLabel?'Cancel':'Close'}</button>${confirmLabel?`<button id="modal-confirm" class="gold">${esc(confirmLabel)}</button>`:''}</div>`;
  $('#modal-cancel').onclick=()=>dialog.close();if(confirmLabel)$('#modal-confirm').onclick=()=>{dialog.close();onConfirm();};if(!dialog.open)dialog.showModal();
}
function showOutcome(o){
  const art=rewardArt(o);
  modal(o.title,`${art?`<div class="reward-stage">${artImage(art,'reward-illustration')}</div><p class="reward-label">${art.label}</p>`:''}<p class="reward-message">${esc(o.message)}</p>`,null);
  if(art)dialog.classList.add('reward-dialog');
  $('#modal-cancel').textContent='Continue →';
}
const btn=(label,action,cls='',disabled=false,attrs='')=>`<button type="button" data-action="${action}" class="${cls}" ${disabled?'disabled':''} ${attrs}>${label}</button>`;
const ended=()=>['ended','finished'].includes(state?.phase);
const locations=[['camp','Camp'],['cave','Crystal Cave'],['bridge','Rope Bridge'],['ruins','Old Ruins'],['temple','Sun Temple'],['harbor','Hidden Harbor']];
function resourceBar(){const m=state.me;return `<div class="resources"><div><img src="/battle12/assets/ui/compass.webp" alt="" width="39" height="39"><span>Actions</span><strong>${m.actions}</strong></div><div><img src="/battle12/assets/ui/backpack.webp" alt="" width="39" height="39"><span>Backpack</span><strong>${m.bag}</strong></div><div><img src="/battle12/assets/ui/vault.webp" alt="" width="39" height="39"><span>Vault</span><strong>${m.vault}</strong></div></div>`;}
function rules(){return `<p>Read the story and answer your teacher’s question. Every accepted answer earns <b>1 Action</b>.</p><p>Explore for 1 Action, or bank at Camp for 1 Action. Backpack gems are vulnerable; Vault gems are safe. The highest Vault wins. Equal totals share the win.</p><p>Raid takes up to 3 Backpack gems; Sabotage removes up to 2. A Shield blocks one attack. You can use one offensive card per question. A duplicate card becomes 1 Backpack gem.</p><p>Keep an Action if you want to bank. Pausing stops game actions, but answers and teacher marking remain open.</p>`;}
function unavailableView(){return `<section class="join"><span class="eyebrow">Battle 12 · Treasure Raid</span><h1>${hostIntent?'Start a fresh voyage':'Room unavailable'}</h1><img src="/battle12/assets/island.png" alt="Illustrated pirate island map"><section class="paper"><h2>Room ${esc(pin)} is no longer available</h2><p>This room may have expired. Rooms are available for 48 hours after creation.</p>${hostIntent?`<p>Create a new room to show a fresh joining QR. Your students can scan it and enter their names.</p>${btn('Create a new room','create','gold wide')}`:`<p>Ask your teacher for the current joining QR or room PIN.</p>${btn('Enter a different room PIN','change-room','gold wide')}`}${btn('Retry this room','refresh','quiet wide')}</section></section>`;}
function joinView(){return `<section class="join"><span class="eyebrow">Battle 12 · reading expedition</span><h1>Treasure Raid</h1><img src="/battle12/assets/island.png" alt="Illustrated pirate island map"><section class="paper"><h2>${hostIntent?'Captain’s desk':'Join the adventure'}</h2>${hostIntent?`<p>Create a room, then let students scan its joining QR. They only need to enter a name.</p>${btn('Create a room','create','gold wide')}`:`<form id="join-form"><label for="pin">Room PIN</label><input id="pin" inputmode="numeric" pattern="[0-9]{5}" maxlength="5" value="${esc(pin)}" required><label for="name">Your name</label><input id="name" autocomplete="nickname" maxlength="28" value="${esc(get('name'))}" required><p class="rule-note">One phone per player or crew. No group selection needed.</p><button class="gold wide">Join Treasure Raid →</button></form>`}</section></section>`;}
function questionView(){const q=state.question,m=state.me,r=m.response;
  if(state.phase==='lobby')return `<img class="hero-map" src="/battle12/assets/island.png" alt="Treasure island"><section class="paper"><span class="eyebrow">Welcome aboard, ${esc(m.name)}</span><h1>Your voyage awaits</h1><p>Read Captain Mira’s story while your teacher gets ready.</p>${btn('Read the illustrated story','read','gold wide')}<div class="rules">${rules()}</div></section>`;
  if(state.phase==='finalBank')return `<section class="paper"><span class="eyebrow">Final banking</span><h1>Return to Camp</h1><p>Exploration and attacks are closed. Bank your Backpack for 1 Action, or pass. Only Vault gems score.</p>${m.settled?'<p>Your final banking decision is saved. Waiting for results.</p>':`${btn('Bank · 1 Action','bank','gold wide',m.actions<1||m.bag<1)}${btn('Pass final banking','pass','wide')}`}</section>`;
  if(state.phase==='finalPlay')return `<section class="paper"><span class="eyebrow">All 18 questions complete</span><h1>One last adventure</h1><p>Use or save your earned Actions. Your teacher will open Final banking next.</p>${btn('Visit the island','voyage','gold wide')}</section>`;
  return `<span class="eyebrow">Question ${q.number} / 18 · ${esc(q.group)}</span><section class="paper"><p class="question">${esc(q.prompt)}</p><p class="rule-note">${esc(content.instructions)}</p>${state.revealedAnswer?`<p>Teacher’s revealed answer: <b>${esc(state.revealedAnswer)}</b></p>`:''}<div class="answer-clock" data-countdown hidden></div>${state.answersClosed&&!state.finalized?'<p>Time’s up. Your teacher is reviewing the answers.</p>':''}<form id="answer-form"><label for="answer">Your answer</label><input id="answer" data-question="${q.id}" maxlength="300" autocomplete="off" value="${esc(draft(q.id)||r?.value||'')}" ${r?.status==='accepted'||r?.status==='submitted'||state.answersClosed?'disabled':''}><button class="gold wide" style="margin-top:14px" ${r?.status==='accepted'||r?.status==='submitted'||state.answersClosed?'disabled':''}>Submit answer</button></form></section>${r?`<div class="saved"><b>${r.status==='accepted'?'Accepted · 1 Action earned':r.status==='submitted'?'Waiting for teacher review':'Not accepted this question'}</b><div class="response">${esc(r.value)}</div></div>`:''}<div class="row">${btn('Read passage','read')}${btn('All 18 notes','notes')}</div>${state.paused?'<p class="saved">Game actions are paused. You can still read and answer.</p>':''}`;
}
function reader(){const art=window.TREASURE_ART[readPage];return `<div class="book-heading"><span class="eyebrow">Captain Mira’s journal · paragraph ${readPage+1} / 9</span><h1>${esc(content.title)}</h1><div class="progress"><span style="width:${(readPage+1)/9*100}%"></span></div></div><div class="reader-page"><img class="book-illustration" src="/battle12/${art.src}" alt="${esc(art.alt)}"><section class="paper book-text"><p><b>[${readPage+1}]</b> ${esc(content.paragraphs[readPage])}</p></section></div>`;}
function readerControls(){return `<div class="book-controls"><div class="row">${btn('← Previous','prev','',readPage===0)}<span>${readPage+1} / 9</span>${btn('Next →','next','',readPage===8)}</div><details><summary>Jump to paragraph</summary><div class="jumps">${Array.from({length:9},(_,i)=>btn(String(i+1),'page','',false,`data-page="${i}" aria-current="${readPage===i?'page':'false'}"`)).join('')}</div></details>${btn(host?'Back to teacher dashboard':'Back to answer',host?'dashboard':'answer','quiet wide')}</div>`;}
function voyage(){return `<span class="eyebrow">Choose your next destination</span><h1>The island awaits</h1><figure class="map"><img src="/battle12/assets/island.png" alt="Treasure Raid’s original island map"></figure><div class="destinations">${locations.map(([id,name])=>btn(`${esc(name)}<small>${id==='camp'?'Bank':'Explore'} · 1 Action</small>`,'place','destination',ended(),`data-place="${id}"`)).join('')}</div><p class="rule-note">Keep an Action for banking. Only gems safely in your Vault count at the end.</p><details><summary>How to play</summary><div class="rules">${rules()}</div></details>`;}
function collectedCards(m){
  const held=[...m.cards,...(m.shields?['shield']:[])];
  if(!held.length)return '<section class="panel empty-satchel"><h2>Your satchel is waiting</h2><p>No cards or shield yet. Any you discover will appear here.</p></section>';
  return `<div class="collected-cards">${held.map(kind=>{const art=REWARD_ART[kind];return `<article class="collected-card">${artImage(art,'collected-illustration')}<h2>${esc(kind==='shield'?'Shield':kind==='raid'?'Raid card':'Sabotage card')}</h2><p>${kind==='shield'?'Ready · blocks one attack':kind==='raid'?'Take up to 3 Backpack gems':'Remove up to 2 Backpack gems'}</p></article>`;}).join('')}</div>`;
}
function cards(){const m=state.me,can=!state.paused&&['questions','finalPlay'].includes(state.phase)&&!m.usedAttack;return `<span class="eyebrow">Your satchel</span><h1>Cards & crews</h1>${collectedCards(m)}${m.usedAttack?'<p>You have used your attack for this question.</p>':''}${state.players.filter(c=>c.id!==m.id).map(c=>`<section class="rival"><h3>${esc(c.name)}</h3><p>Backpack ${c.bag} · Vault ${c.vault} · Shield ${c.shields}</p><div class="row">${['raid','sabotage'].map(card=>btn(card==='raid'?'Raid':'Sabotage','attack','',!can||!m.cards.includes(card)||c.bag<1,`data-card="${card}" data-target="${c.id}"`)).join('')}</div></section>`).join('')}<p class="rule-note">Vaults are always protected. Attacks cost the card, not an Action.</p>`;}
function results(){return `<section class="panel results"><span class="eyebrow">${state.phase==='ended'?(host?'You ended this game':'Your teacher ended the voyage'):'Voyage complete'}</span><h1>${host?'Final class results':'Treasure safely home'}</h1><p>Only Vault gems count. Unbanked Backpack gems and remaining Actions score zero.</p><ol>${state.results.map(r=>`<li><span>${r.rank===1?'Winner · ':r.rank+'. '}${esc(r.name)}</span><b>${r.vault} gems</b></li>`).join('')}</ol><p class="rule-note">Equal Vault totals share a rank. This is the expedition score, not a reading attainment score.</p></section>`;}
function studentView(){const body=screen==='read'?reader():screen==='notes'?`<section class="paper"><h1>Expedition notes</h1><ol class="notes">${content.items.map(q=>`<li>${esc(q.prompt)}</li>`).join('')}</ol>${btn('Back to answer','answer','gold wide')}</section>`:ended()?results():screen==='voyage'?voyage():screen==='cards'?cards():questionView();
  return `<div class="phone"><header><div class="brand">TREASURE RAID<small>${esc(state.me.name)}</small></div><div class="room-label">Room ${pin}</div></header>${resourceBar()}<div class="connection"></div><section class="scroll">${body}</section>${screen==='read'?readerControls():''}<nav aria-label="Game views">${['voyage','read','answer','cards'].map(s=>btn(`<img class="nav-art" src="/battle12/assets/ui/${({voyage:'compass.webp',read:'book.svg',answer:ended()?'vault.webp':'notes.svg',cards:'cards.svg'})[s]}" alt="" width="29" height="29"><span>${({voyage:'Island',read:'Read',answer:ended()?'Results':'Answer',cards:'Cards'})[s]}</span>`,s,'',false,`aria-current="${s===screen?'page':'false'}"`)).join('')}</nav></div>`;
}
function qrContent(){return `<p>Scan to join this same room. Rejoining on the same browser restores your player.</p><img class="qr" src="/api/treasure/rooms/${pin}/qr.svg" alt="Room ${pin} joining QR code"><div class="pin">${pin}</div><p class="join-link"><a href="${esc(state.joinUrl)}" target="_blank" rel="noopener">${esc(state.joinUrl)}</a></p>`;}
function teacherControls(){return `<div class="row">${btn('Read illustrated story','read')}${btn('Show joining QR','qr')}${btn('Game full screen','fullscreen')}${!ended()?btn('End Game','end','danger'):btn('New room','create','gold')}</div>`;}
function lobbyDesk(){return `<section class="lobby-join panel"><span class="eyebrow">Join the adventure</span><h2>Scan to join Treasure Raid</h2>${qrContent()}<p>Enter your name. No group selection needed.</p>${btn('Start question 1 →','start','gold wide',!state.joinedCount)}<p>${state.joinedCount} joined · ${state.onlineCount} online</p></section><section class="panel"><h2>Ready crew</h2>${state.players.length?state.players.map(p=>`<div class="status-row"><b>${esc(p.name)}</b><span>${p.online?'Connected':'Reconnecting'}</span></div>`).join(''):'<p>Student names will appear here.</p>'}</section>`;}
function showReview(){
  if(!reviewOpen||!host||review?.question?.id!==state.question.id)return;
  const scroll=dialog.querySelector('.answer-list')?.scrollTop??0;
  const focused=dialog.contains(document.activeElement)?{...document.activeElement.dataset}:null;
  dialog.classList.remove('reward-dialog');dialog.classList.add('answer-review');
  dialog.innerHTML=reviewDialog(state,review);
  if(!dialog.open)dialog.showModal();
  dialog.querySelector('.answer-list').scrollTop=scroll;
  if(focused?.action)[...dialog.querySelectorAll('[data-action]')].find(el=>Object.entries(focused).every(([k,v])=>el.dataset[k]===v))?.focus({preventScroll:true});
}
function updateCountdown(){
  if(!state)return;
  const seconds=state.answerCountdownEndsAt?Math.max(0,Math.ceil((state.answerCountdownEndsAt-Date.now()-serverOffset)/1000)):null;
  for(const el of document.querySelectorAll('[data-countdown]')){el.hidden=seconds===null;el.textContent=seconds===null?'':seconds>0?seconds+' seconds left':"Time’s up — answers locked";}
  if(!host&&(state.answersClosed||seconds===0))for(const el of document.querySelectorAll('#answer-form input,#answer-form button'))el.disabled=true;
}
dialog.addEventListener('close',()=>{reviewOpen=false;dialog.classList.remove('answer-review');dialog.innerHTML='';review=null;});
function teacherMap(){
  const points={camp:[23,64],cave:[24,22],bridge:[49,20],ruins:[75,18],temple:[79,43],harbor:[81,72]};
  return `<section class="island-desk"><div class="map-heading"><div><span class="eyebrow">Live island</span><h2>Where students are</h2></div><span class="badge">${state.onlineCount} online · ${state.joinedCount} joined</span></div><p class="rule-note">Latest confirmed destination: exploring moves a player there; banking returns them to Camp.</p><div class="live-map"><img src="/battle12/assets/island.png" alt="Treasure Raid island with live student destinations">${locations.map(([id,name])=>{const people=state.players.filter(p=>(p.location??'camp')===id),[x,y]=points[id];return `<button class="map-pin ${people.length?'occupied':''}" style="left:${x}%;top:${y}%" data-action="map-place" data-place="${id}" aria-label="${esc(name)}: ${people.length} players"><strong>${esc(name)}</strong><span>${people.length?people.slice(0,2).map(p=>esc(p.name)).join(', ')+(people.length>2?' +'+(people.length-2):''):'0 players'}</span></button>`;}).join('')}</div><section class="vault-standings"><h3><img src="/battle12/assets/ui/vault.webp" alt="" width="43" height="43">Vault standings</h3>${state.players.length?'<ol>'+[...state.players].sort((a,b)=>b.vault-a.vault).slice(0,6).map(p=>`<li>${esc(p.name)}<b>${p.vault}</b></li>`).join('')+'</ol>':'<p>Your crew’s protected treasure will appear here.</p>'}</section><div class="location-list">${locations.map(([id,name])=>{const people=state.players.filter(p=>(p.location??'camp')===id);return `<section><h3>${esc(name)} <span>${people.length}</span></h3><p>${people.length?people.map(p=>`<span class="location-player">${esc(p.name)}${p.online?'':' · offline'}</span>`).join(''):'<span class="muted">Nobody here</span>'}</p></section>`;}).join('')}</div><details><summary>Recent activity</summary><ul class="log">${state.log.slice(0,8).map(l=>`<li>${esc(l.text)}</li>`).join('')}</ul></details></section>`;
}
function teacherView(){
  if(screen==='read')return `<div class="teacher"><header class="topbar"><span class="eyebrow">Teacher mode · room ${pin}</span><div class="row">${btn('Back to teacher dashboard','dashboard')}${btn('Show joining QR','qr')}</div></header><section class="teacher-reader">${reader()}${readerControls()}</section></div>`;
  return `<div class="teacher command-centre"><header class="topbar"><div><span class="eyebrow">Battle 12 · TEACHER MODE · room ${pin}</span><h1>Treasure Raid</h1></div><div class="captain-tools">${teacherControls()}${musicControls()}</div></header><div class="connection"></div>${ended()?results():''}<div class="teacher-workspace"><aside class="marking-desk">${state.phase==='lobby'?lobbyDesk():!ended()?questionDesk(state)+responseStatuses(state):''}</aside>${teacherMap()}</div><section class="roster" ${state.phase==='lobby'?'hidden':''}>${state.players.map(p=>`<article class="player"><b>${esc(p.name)}</b> <small>${p.online?'Online':'Disconnected'}</small><div class="score"><span>Actions <strong>${p.actions}</strong></span><span>Backpack <strong>${p.bag}</strong></span><span>Vault <strong>${p.vault}</strong></span></div><small>${p.acceptedCount}/18 accepted${state.phase==='finalBank'?' · '+(p.settled?'Settled':'Banking decision pending'):''}</small></article>`).join('')}</section><p class="credits">Music: “Master of the Feast” by Kevin MacLeod (<a href="https://incompetech.com/music/royalty-free/index.html?isrc=USUAN1400019" target="_blank" rel="noopener">incompetech.com</a>), <a href="https://creativecommons.org/licenses/by/4.0/" target="_blank" rel="noopener">CC BY 4.0</a>.</p></div>`;
}
let music=null,musicOn=false,volume=.2;
function musicControls(){return `<div class="music">${btn(musicOn?'Music: on ♫':'Music: off','music')}<label for="volume">Volume</label><input id="volume" type="range" min="0" max="0.6" step="0.01" value="${volume}" aria-label="Music volume"><small>Teacher only</small></div>`;}
async function toggleMusic(){if(!host)return;if(!music){music=new Audio('/battle12/assets/master-of-the-feast.mp3');music.preload='none';music.addEventListener('ended',()=>{if(musicOn){music.currentTime=0;music.play().catch(()=>notice('Tap Music to resume playback.'));}});music.addEventListener('timeupdate',()=>{if(!Number.isFinite(music.duration))return;music.volume=volume*Math.min(1,music.currentTime/2,(music.duration-music.currentTime)/2);});}if(musicOn){music.pause();musicOn=false;}else{music.volume=volume;try{await music.play();musicOn=true;}catch{notice('Music could not start. Tap Music again.');}}render();}
function syncGameFullscreen(){
  const control=app.querySelector('[data-action="fullscreen"]');
  if(control){control.textContent=document.fullscreenElement?'Exit game full screen':'Game full screen';control.setAttribute('aria-pressed',String(Boolean(document.fullscreenElement)));}
}
function render(){saveDraft();const active=document.activeElement,focus=active?.id,selection=active?.selectionStart,scroll=$('.scroll')?.scrollTop??0,joiningName=$('#name')?.value,joiningPin=$('#pin')?.value;
  const answerScroll=$('.answer-list')?.scrollTop??0,openedDetails=[...app.querySelectorAll('details[open]')].map(d=>d.querySelector('summary')?.textContent);
  app.innerHTML=roomUnavailable?unavailableView():token&&!state?'<p class="loading">Reconnecting to your saved voyage…</p>':!state||!token||state.role==='public'?joinView():host?teacherView():studentView();
  syncGameFullscreen();
  if($('#name')&&joiningName!==undefined)$('#name').value=joiningName;
  if($('#pin')&&joiningPin!==undefined)$('#pin').value=joiningPin;
  for(const details of app.querySelectorAll('details'))if(openedDetails.includes(details.querySelector('summary')?.textContent))details.open=true;
  if($('.answer-list'))$('.answer-list').scrollTop=answerScroll;
  if(screen==='read'&&$('.scroll'))$('.scroll').scrollTop=readScroll;else if($('.scroll'))$('.scroll').scrollTop=scroll;
  if(focus&&document.getElementById(focus)){document.getElementById(focus).focus({preventScroll:true});try{document.getElementById(focus).setSelectionRange(selection,selection);}catch{}}
  if(pending&&!roomUnavailable){const bar=document.createElement('div');bar.className='panel';bar.innerHTML=`<p>A previous action needs confirmation from the server. Retry safely with the same receipt.</p>${btn('Retry saved action','retry','gold')}`;app.prepend(bar);}
  updateConnection();updateCountdown();showReview();
  $('#join-form')?.addEventListener('submit',join);
  $('#answer')?.addEventListener('input',saveDraft);
  $('#answer-form')?.addEventListener('submit',e=>{e.preventDefault();send('student:submit',{questionId:state.question.id,answer:$('#answer').value,attempt:state.me.response?.attempts??0});});
  $('#volume')?.addEventListener('input',e=>{volume=Number(e.target.value);if(music)music.volume=volume;});
}
async function join(e){e.preventDefault();if(busy)return;busy=true;
  try{pin=$('#pin').value.trim();const name=$('#name').value;const result=await api(`rooms/${pin}/join`,{method:'POST',body:{clientId,name},auth:''});token=result.playerToken;put('student:'+pin,token);put('name',name);studentRoute();content=null;lastVersion=-1;await refresh();}
  catch(error){notice(error.message);}finally{busy=false;render();}
}
document.addEventListener('click',async e=>{
  const button=e.target.closest('[data-action]');if(!button||button.disabled||busy||(!app.contains(button)&&!dialog.contains(button)))return;const action=button.dataset.action;saveDraft();rememberReader();
  if(['answer','read','voyage','cards','notes'].includes(action)){screen=action;render();if($('.scroll'))$('.scroll').scrollTop=screen==='read'?readScroll:0;return;}
  if(['next','prev','page'].includes(action)){readPage=Math.max(0,Math.min(8,action==='page'?Number(button.dataset.page):readPage+(action==='next'?1:-1)));readScroll=0;put('reader:'+pin,JSON.stringify({page:readPage,scroll:0}));render();window.scrollTo(0,0);return;}
  if(action==='create'){
    if(get('student-room')&&!hostIntent&&!host)return notice('Use your teacher’s QR to join a room.');
    if(state&&!ended())return notice('End this room before creating another.');busy=true;
    try{const result=await api('rooms',{method:'POST',body:{},auth:''});pin=result.pin;token=result.hostToken;host=true;hostIntent=true;roomUnavailable=false;put('host:'+pin,token);put('host-room',pin);history.replaceState(null,'','/battle12/?host='+pin);state=null;content=null;lastVersion=-1;pending=null;await refresh();}catch(error){notice(error.message);}finally{busy=false;render();}return;
  }
  if(action==='change-room'&&!hostIntent&&!host){pin='';token='';state=null;content=null;review=null;pending=null;roomUnavailable=false;lastVersion=-1;studentRoute();render();return;}
  if(action==='refresh')return refresh(true);
  if(action==='dashboard'&&host){screen='answer';history.replaceState(null,'','/battle12/?host='+pin);render();return;}
  if(action==='review-open'&&host){
    try{review=await api(`rooms/${pin}/review`);reviewOpen=true;showReview();}catch(e){notice(e.message);}return;
  }
  if(action==='review-close'){reviewOpen=false;dialog.close();return;}
  if(action==='accept-all'&&host){
    const revision=review.reviewVersion;
    return modal('Accept all submitted answers?', '<p>This accepts every submitted answer, including those that did not match automatically. No Actions are awarded until finalization.</p>','Accept all',async()=>{await send('host:accept-all',{questionId:state.question.id,reviewVersion:revision});review=await api(`rooms/${pin}/review`);reviewOpen=true;showReview();});
  }
  if(action==='countdown'&&host)return send('host:start-countdown',{questionId:state.question.id});
  if(action==='map-place'&&host){const id=button.dataset.place,name=locations.find(l=>l[0]===id)?.[1],people=state.players.filter(p=>(p.location??'camp')===id);return modal(name,people.length?`<ul>${people.map(p=>`<li>${esc(p.name)} · ${p.online?'Online':'Disconnected'} · Backpack ${p.bag} · Vault ${p.vault}</li>`).join('')}</ul>`:'<p>Nobody is at this destination yet.</p>',null);}
  if(action==='retry')return send(pending.type);
  if(action==='music')return toggleMusic();
  if(action==='fullscreen'){try{if(document.fullscreenElement)await document.exitFullscreen();else await document.documentElement.requestFullscreen();}catch{notice('Use your browser’s full-screen button.');}return;}
  if(action==='qr')return modal('Join room '+pin,qrContent(),null);
  if(action==='start')return send('host:start');
  if(action==='pause')return send('host:pause',{paused:!state.paused});
  if(action==='advance')return send('host:advance',{questionId:state.question.id});
  if(action==='finalize'){
    const questionId=state.question.id,revision=state.reviewVersion;
    const missing=state.players.filter(p=>['not-submitted','unanswered'].includes(p.answerStatus)).length;
    return modal('Finalize & reveal answer?',`<p>Lock your decisions, reveal the answer to everyone, and award 1 Action per accepted answer.</p>${missing?`<p>${missing} student(s) have no submitted answer and will receive no Action.</p>`:''}<p>Pause actions will stay ${state.paused?'on':'off'}.</p>`,'Finalize & reveal',()=>send('host:reveal',{questionId,reviewVersion:revision}));
  }
  if(action==='final-banking')return modal('Open Final banking?',`<p>Exploration and attacks will close. Players may spend one saved Action to bank, or pass.</p>`,'Open Final banking',()=>send('host:final-banking'));
  if(action==='finish')return send('host:finish');
  if(action==='end')return modal('End room '+pin+' now?',`<p>All answers, marking and game actions stop immediately. Only gems already in Vaults count. Backpack gems and unused Actions score zero.</p><p><b>No automatic banking or extra banking turn will happen.</b> Scores will be locked and students stay on their own results pages.</p>`,'End Game now',()=>send('host:end',{confirm:true}));
  if(action==='accept'||action==='reject')return send('host:review',{questionId:review.question.id,playerId:button.dataset.player,attempt:Number(button.dataset.attempt),decision:action==='accept'?'accept':'reject'});
  const version=state.me?.actionVersion;
  if(action==='place'){
    const location=button.dataset.place,[,name]=locations.find(l=>l[0]===location);
    const scene=locationScene(location);
    return modal(name,`<img class="location-illustration" src="${scene.src}" alt="${esc(scene.alt)}"><p class="location-hint">${esc(scene.hint)}</p><p>${location==='camp'?'Bank':'Explore'} · <b>1 Action</b></p>${state.me.actions===1?'<p>This uses your last Action. Banking also costs 1 Action.</p>':''}`,location==='camp'?'Bank now':'Explore now',()=>send(location==='camp'?'student:bank':'student:explore',{location,expectedVersion:version}));
  }
  if(action==='bank')return modal('Bank your Backpack?',`<p>Transfer ${state.me.bag} gems to your Vault for 1 Action.</p>`,'Bank · 1 Action',()=>send('student:bank',{expectedVersion:version}));
  if(action==='pass')return modal('Pass final banking?',`<p>Your remaining Backpack gems will not score. This decision cannot be undone.</p>`,'Pass',()=>send('student:pass',{expectedVersion:version}));
  if(action==='attack'){const target=state.players.find(p=>p.id===button.dataset.target);return modal('Use '+button.dataset.card+'?',`<p>Target: ${esc(target.name)}. This uses your card and your one attack for this question. Their Vault stays protected.</p>`,'Use card',()=>send('student:attack',{targetId:target.id,card:button.dataset.card,expectedVersion:version}));}
});
window.addEventListener('pagehide',()=>{saveDraft();rememberReader();music?.pause();});
document.addEventListener('fullscreenchange',syncGameFullscreen);
window.addEventListener('pageshow',()=>refresh(true));
window.addEventListener('online',()=>refresh(true));
window.addEventListener('popstate',()=>{if(!host){studentRoute();refresh(true);}});
const shellUrl=treasureTeacherShellUrl(route,embedded);
if(shellUrl)location.replace(shellUrl);
else{render();setInterval(updateCountdown,250);if(pin)refresh(true);setInterval(()=>{if(!busy&&!document.hidden)refresh();},1800);}
