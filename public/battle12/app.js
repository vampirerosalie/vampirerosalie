import { resolveTreasureRoute } from './route.js?v=2';
import { retireReviewSession } from './retire-review-session.js?v=1';
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
let {pin,token,hostIntent}=route;
let host=false,state=null,content=null,review=null,busy=false,online=true,lastVersion=-1,screen='answer',readPage=0,readScroll=0;
let clientId=get('client-id');if(!clientId){clientId=crypto.randomUUID();put('client-id',clientId);}
let privateMode=params.get('review')==='1',pending=null;
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
  try{
    const next=await api(`rooms/${pin}/state`);online=true;
    if(state&&next.version<state.version)return;
    if(['ended','finished'].includes(next.phase)&&!ended()){rememberReader();screen='answer';dialog.close();music?.pause();musicOn=false;}
    if(token&&next.role==='host'){host=true;if(!content)content=await api(`rooms/${pin}/content`);}
    if(token&&next.role==='student'){studentRoute();if(!content)content=await api(`rooms/${pin}/content`);}
    const change=force||next.version!==lastVersion||(host&&JSON.stringify(next.players)!==JSON.stringify(state?.players));
    state=next;lastVersion=next.version;
    if(host&&privateMode)review=await api(`rooms/${pin}/review`);
    if(change&&!busy)render();
    updateConnection();
    if(host)parent.postMessage({type:'treasure-raid:status',pin,phase:state.phase,onlineCount:state.onlineCount},location.origin);
  }catch(e){online=false;updateConnection();if(e.status===401){token='';host=false;render();notice('This device cannot open that room. Scan the joining QR again.');}else if(e.status===404){state=null;app.innerHTML=`<section class="join paper"><h1>Room unavailable</h1><p>${esc(e.message)}</p><p>Ask your teacher for the current QR code.</p></section>`;}else if(force)notice(e.message);}
}
function updateConnection(){const c=$('.connection');if(c){c.classList.toggle('offline',!online);c.textContent=online?'Connected · progress saved on the server':'Reconnecting… Your saved progress is safe.';}}
async function send(type,extra={}){
  if(busy)return;saveDraft();rememberReader();busy=true;
  const body=pending??{type,requestId:crypto.randomUUID(),...extra};pending=body;put('pending:'+pin,JSON.stringify(body));
  try{
    const data=await api(`rooms/${pin}/action`,{method:'POST',body});pending=null;del('pending:'+pin);state=data.state;lastVersion=state.version;online=true;
    if(host&&privateMode)review=await api(`rooms/${pin}/review`);
    if(data.result?.title)showOutcome(data.result);else if(type==='student:submit')notice('Answer submitted. Waiting for your teacher.');
  }catch(e){if(!e.network){pending=null;del('pending:'+pin);}notice(e.message);await refresh();}
  finally{busy=false;render();}
}
function modal(title,body,confirmLabel,onConfirm){
  dialog.innerHTML=`<h2>${esc(title)}</h2>${body}<div class="row"><button id="modal-cancel" class="quiet">${confirmLabel?'Cancel':'Close'}</button>${confirmLabel?`<button id="modal-confirm" class="gold">${esc(confirmLabel)}</button>`:''}</div>`;
  $('#modal-cancel').onclick=()=>dialog.close();if(confirmLabel)$('#modal-confirm').onclick=()=>{dialog.close();onConfirm();};if(!dialog.open)dialog.showModal();
}
function showOutcome(o){modal(o.title,`<p>${esc(o.message)}</p>`,null);}
const btn=(label,action,cls='',disabled=false,attrs='')=>`<button type="button" data-action="${action}" class="${cls}" ${disabled?'disabled':''} ${attrs}>${label}</button>`;
const ended=()=>['ended','finished'].includes(state?.phase);
const locations=[['camp','Camp'],['cave','Crystal Cave'],['bridge','Rope Bridge'],['ruins','Old Ruins'],['temple','Sun Temple'],['harbor','Hidden Harbor']];
function resourceBar(){const m=state.me;return `<div class="resources"><div><span>Actions</span><strong>${m.actions}</strong></div><div><span>Backpack</span><strong>${m.bag}</strong></div><div><span>Vault</span><strong>${m.vault}</strong></div></div>`;}
function rules(){return `<p>Read the story and answer your teacher’s question. Every accepted answer earns <b>1 Action</b>.</p><p>Explore for 1 Action, or bank at Camp for 1 Action. Backpack gems are vulnerable; Vault gems are safe. The highest Vault wins. Equal totals share the win.</p><p>Raid takes up to 3 Backpack gems; Sabotage removes up to 2. A Shield blocks one attack. You can use one offensive card per question. A duplicate card becomes 1 Backpack gem.</p><p>Keep an Action if you want to bank. Pausing stops game actions, but answers and teacher marking remain open.</p>`;}
function joinView(){return `<section class="join"><span class="eyebrow">Battle 12 · reading expedition</span><h1>Treasure Raid</h1><img src="/battle12/assets/island.png" alt="Illustrated pirate island map"><section class="paper"><h2>${hostIntent?'Captain’s desk':'Join the adventure'}</h2>${hostIntent?`<p>Create a room, then let students scan its joining QR. They only need to enter a name.</p>${btn('Create a room','create','gold wide')}`:`<form id="join-form"><label for="pin">Room PIN</label><input id="pin" inputmode="numeric" pattern="[0-9]{5}" maxlength="5" value="${esc(pin)}" required><label for="name">Your name</label><input id="name" autocomplete="nickname" maxlength="28" value="${esc(get('name'))}" required><p class="rule-note">One phone per player or crew. No group selection needed.</p><button class="gold wide">Join Treasure Raid →</button></form>`}</section></section>`;}
function questionView(){const q=state.question,m=state.me,r=m.response;
  if(state.phase==='lobby')return `<img class="hero-map" src="/battle12/assets/island.png" alt="Treasure island"><section class="paper"><span class="eyebrow">Welcome aboard, ${esc(m.name)}</span><h1>Your voyage awaits</h1><p>Read Captain Mira’s story while your teacher gets ready.</p>${btn('Read the illustrated story','read','gold wide')}<div class="rules">${rules()}</div></section>`;
  if(state.phase==='finalBank')return `<section class="paper"><span class="eyebrow">Final banking</span><h1>Return to Camp</h1><p>Exploration and attacks are closed. Bank your Backpack for 1 Action, or pass. Only Vault gems score.</p>${m.settled?'<p>Your final banking decision is saved. Waiting for results.</p>':`${btn('Bank · 1 Action','bank','gold wide',m.actions<1||m.bag<1)}${btn('Pass final banking','pass','wide')}`}</section>`;
  if(state.phase==='finalPlay')return `<section class="paper"><span class="eyebrow">All 18 questions complete</span><h1>One last adventure</h1><p>Use or save your earned Actions. Your teacher will open Final banking next.</p>${btn('Visit the island','voyage','gold wide')}</section>`;
  return `<span class="eyebrow">Question ${q.number} / 18 · ${esc(q.group)}</span><section class="paper"><p class="question">${esc(q.prompt)}</p><p class="rule-note">${esc(content.instructions)}</p>${state.revealedAnswer?`<p>Teacher’s revealed answer: <b>${esc(state.revealedAnswer)}</b></p>`:''}<form id="answer-form"><label for="answer">Your answer</label><input id="answer" data-question="${q.id}" maxlength="300" autocomplete="off" value="${esc(draft(q.id)||r?.value||'')}" ${r?.status==='accepted'||r?.status==='submitted'||state.revealedAnswer?'disabled':''}><button class="gold wide" style="margin-top:14px" ${r?.status==='accepted'||r?.status==='submitted'||state.revealedAnswer?'disabled':''}>Submit answer</button></form></section>${r?`<div class="saved"><b>${r.status==='accepted'?'Accepted · 1 Action earned':r.status==='submitted'?'Waiting for teacher review':r.status==='revise'?'Please revise your answer':'Submissions closed'}</b><div class="response">${esc(r.value)}</div></div>`:''}<div class="row">${btn('Read passage','read')}${btn('All 18 notes','notes')}</div>${state.paused?'<p class="saved">Game actions are paused. You can still read and answer.</p>':''}`;
}
function reader(){const art=window.TREASURE_ART[readPage];return `<div class="book-heading"><span class="eyebrow">Captain Mira’s journal · paragraph ${readPage+1} / 9</span><h1>${esc(content.title)}</h1><div class="progress"><span style="width:${(readPage+1)/9*100}%"></span></div></div><div class="reader-page"><img class="book-illustration" src="/battle12/${art.src}" alt="${esc(art.alt)}"><section class="paper book-text"><p><b>[${readPage+1}]</b> ${esc(content.paragraphs[readPage])}</p></section></div>`;}
function readerControls(){return `<div class="book-controls"><div class="row">${btn('← Previous','prev','',readPage===0)}<span>${readPage+1} / 9</span>${btn('Next →','next','',readPage===8)}</div><details><summary>Jump to paragraph</summary><div class="jumps">${Array.from({length:9},(_,i)=>btn(String(i+1),'page','',false,`data-page="${i}" aria-current="${readPage===i?'page':'false'}"`)).join('')}</div></details>${btn(host?'Back to teacher dashboard':'Back to answer',host?'dashboard':'answer','quiet wide')}</div>`;}
function voyage(){return `<span class="eyebrow">Choose your next destination</span><h1>The island awaits</h1><figure class="map"><img src="/battle12/assets/island.png" alt="Treasure Raid’s original island map"></figure><div class="destinations">${locations.map(([id,name])=>btn(`${esc(name)}<small>${id==='camp'?'Bank':'Explore'} · 1 Action</small>`,'place','destination',ended(),`data-place="${id}"`)).join('')}</div><p class="rule-note">Keep an Action for banking. Only gems safely in your Vault count at the end.</p><details><summary>How to play</summary><div class="rules">${rules()}</div></details>`;}
function cards(){const m=state.me,can=!state.paused&&['questions','finalPlay'].includes(state.phase)&&!m.usedAttack;return `<span class="eyebrow">Your satchel</span><h1>Cards & crews</h1><p>Shield: ${m.shields?'Ready · blocks one attack':'None'}</p><p>Your cards: ${m.cards.length?m.cards.map(esc).join(', '):'None yet'}</p>${m.usedAttack?'<p>You have used your attack for this question.</p>':''}${state.players.filter(c=>c.id!==m.id).map(c=>`<section class="rival"><h3>${esc(c.name)}</h3><p>Backpack ${c.bag} · Vault ${c.vault} · Shield ${c.shields}</p><div class="row">${['raid','sabotage'].map(card=>btn(card==='raid'?'Raid':'Sabotage','attack','',!can||!m.cards.includes(card)||c.bag<1,`data-card="${card}" data-target="${c.id}"`)).join('')}</div></section>`).join('')}<p class="rule-note">Vaults are always protected. Attacks cost the card, not an Action.</p>`;}
function results(){return `<section class="panel results"><span class="eyebrow">${state.phase==='ended'?(host?'You ended this game':'Your teacher ended the voyage'):'Voyage complete'}</span><h1>${host?'Final class results':'Treasure safely home'}</h1><p>Only Vault gems count. Unbanked Backpack gems and remaining Actions score zero.</p><ol>${state.results.map(r=>`<li><span>${r.rank===1?'Winner · ':r.rank+'. '}${esc(r.name)}</span><b>${r.vault} gems</b></li>`).join('')}</ol><p class="rule-note">Equal Vault totals share a rank. This is the expedition score, not a reading attainment score.</p></section>`;}
function studentView(){const body=screen==='read'?reader():screen==='notes'?`<section class="paper"><h1>Expedition notes</h1><ol class="notes">${content.items.map(q=>`<li>${esc(q.prompt)}</li>`).join('')}</ol>${btn('Back to answer','answer','gold wide')}</section>`:ended()?results():screen==='voyage'?voyage():screen==='cards'?cards():questionView();
  return `<div class="phone"><header><div class="brand">TREASURE RAID<small>${esc(state.me.name)}</small></div><div class="room-label">Room ${pin}</div></header>${resourceBar()}<div class="connection"></div><section class="scroll">${body}</section>${screen==='read'?readerControls():''}<nav aria-label="Game views">${['voyage','read','answer','cards'].map(s=>btn(({voyage:'Island',read:'Read',answer:ended()?'Results':'Answer',cards:'Cards'})[s],s,'',false,`aria-current="${s===screen?'page':'false'}"`)).join('')}</nav></div>`;
}
function qrContent(){return `<p>Scan to join this same room. Rejoining on the same browser restores your player.</p><img class="qr" src="/api/treasure/rooms/${pin}/qr.svg" alt="Room ${pin} joining QR code"><div class="pin">${pin}</div><p class="join-link"><a href="${esc(state.joinUrl)}" target="_blank" rel="noopener">${esc(state.joinUrl)}</a></p>`;}
function teacherControls(){return `<div class="row">${btn('Read illustrated story','read')}${btn('Show joining QR','qr')}${btn('Full screen','fullscreen')}${btn('Teacher review ↗','review')}${!ended()?btn('End Game','end','danger'):btn('New room','create','gold')}</div><details><summary>Choose another battle</summary><div class="row">${Array.from({length:12},(_,i)=>`<a href="${i===4?'/grammar-room/battle5.html':'/?battle='+(i+1)+'&teacher=1'}">Battle ${i+1}</a>`).join('')}</div><small>Switching pages does not end this room.</small></details>`;}
function teacherView(){
  if(screen==='read')return `<div class="teacher"><header class="topbar"><span class="eyebrow">Teacher mode · room ${pin}</span><div class="row">${btn('Back to teacher dashboard','dashboard')}${btn('Show joining QR','qr')}</div></header><section class="teacher-reader">${reader()}${readerControls()}</section></div>`;
  if(privateMode)return reviewView();
  return `<div class="teacher"><header class="topbar"><div><span class="eyebrow">Battle 12 · TEACHER MODE · room ${pin}</span><h1>Treasure Raid</h1></div>${teacherControls()}</header><div class="row"><span class="badge">${state.onlineCount} online · ${state.joinedCount} joined</span><span class="badge">${esc(state.phase)}</span>${musicControls()}</div><div class="connection"></div>${ended()?results():`<div class="teacher-layout"><section><img class="hero-map" src="/battle12/assets/island.png" alt="Treasure Raid island map">${state.phase==='lobby'?`<section class="panel"><h2>Teacher lobby</h2><p>Students enter a name—no crew selection required.</p>${btn('Start question 1','start','gold wide',!state.joinedCount)}</section>`:`<section class="paper"><span class="eyebrow">Question ${state.question.number} / 18 · ${esc(state.question.group)}</span><p class="question">${esc(state.question.prompt)}</p>${state.revealedAnswer?`<p>Revealed answer: <b>${esc(state.revealedAnswer)}</b></p>`:''}<p>${state.phase==='finalBank'?'Final banking is open. Wait for each player to bank or pass.':state.phase==='finalPlay'?'Final normal play: let players use or save their Actions before opening Final banking.':'Players can use their Actions while the shared questions continue.'}</p><div class="row">${['questions','finalPlay'].includes(state.phase)?btn(state.paused?'Resume actions':'Pause actions','pause'):''}${state.phase==='questions'?`${btn(state.question.number===18?'Finish questions →':'Next question →','advance','gold')}${btn('Reveal answer to all','reveal','quiet')}`:''}${state.phase==='finalPlay'?btn('Open Final banking','final-banking','gold'):''}${state.phase==='finalBank'?btn('Show final results','finish','gold',state.players.some(p=>!p.settled)):''}</div></section>`}</section><aside class="panel"><h2>Student joining QR</h2>${qrContent()}${state.phase==='lobby'?'':`<h2>Live expedition</h2><p>Answer text stays off this dashboard. Open Teacher review on your private display to mark submissions.</p><p>${state.players.filter(p=>p.answerStatus==='submitted').length} waiting for review</p><ul class="log">${state.log.slice(0,6).map(l=>`<li>${esc(l.text)}</li>`).join('')}</ul>`}</aside></div>`}<section class="roster">${state.players.map(p=>`<article class="player"><b>${esc(p.name)}</b> <small>${p.online?'Online':'Disconnected'}</small><div class="score"><span>Actions <strong>${p.actions}</strong></span><span>Backpack <strong>${p.bag}</strong></span><span>Vault <strong>${p.vault}</strong></span></div><small>${esc(p.answerStatus)} · ${p.acceptedCount}/18 accepted${state.phase==='finalBank'?' · '+(p.settled?'Settled':'Banking decision pending'):''}</small></article>`).join('')}</section><p class="credits">Music: “Master of the Feast” by Kevin MacLeod (<a href="https://incompetech.com/music/royalty-free/index.html?isrc=USUAN1400019" target="_blank" rel="noopener">incompetech.com</a>), <a href="https://creativecommons.org/licenses/by/4.0/" target="_blank" rel="noopener">CC BY 4.0</a>. Original recording, repeated playback with a gentle volume fade.</p></div>`;
}
function reviewView(){const q=review?.question;return `<div class="teacher"><div class="review-controls"><span class="eyebrow">TEACHER MODE · Private answer review · room ${pin}</span><h1>Mark answers</h1><p class="review-warning">Private teacher material. This window IS visible if you mirror this screen. Keep the main dashboard on the projector.</p><div class="row">${btn('Back to teacher dashboard','dashboard','gold')}${btn('Show joining QR','qr')}${btn('Refresh review','refresh')}${btn('Read illustrated story','read')}</div></div>${q?`<section class="paper"><h2>${q.number}. ${esc(q.prompt)}</h2><p>Suggested answer: <b>${esc(q.modelAnswer)}</b></p><p>Accepted variants: ${q.acceptedAnswers.map(esc).join(' / ')}</p><p>Paragraph ${q.evidenceParagraph}: ${esc(q.evidenceQuote)}</p><p>${esc(q.markingNotes)}</p><small>Suggestions do not award Actions. Your Accept/Reject decision is authoritative. Over three words is flagged for review.</small></section>${review.entries.map(e=>`<section class="panel review-card"><h3>${esc(e.name)}</h3>${e.response?`<blockquote>${esc(e.response.value)}</blockquote><p>${esc(e.response.status)} · ${e.suggestion.status==='suggest_accept'?'Allowlist match — suggested accept':'Teacher judgement required'}${e.suggestion.overWordLimit?' · OVER 3 WORDS':''}</p><div class="row">${btn('Accept · +1 Action','accept','gold',ended()||e.response.status!=='submitted',`data-player="${e.id}" data-attempt="${e.response.attempts}"`)}${btn('Reject · ask to revise','reject','',ended()||e.response.status!=='submitted',`data-player="${e.id}" data-attempt="${e.response.attempts}"`)}</div>`:'<p>No submission yet.</p>'}</section>`).join('')}`:'<p>Loading review…</p>'}</div>`;}
let music=null,musicOn=false,volume=.2;
function musicControls(){return `<div class="music">${btn(musicOn?'Music: on ♫':'Music: off','music')}<label for="volume">Volume</label><input id="volume" type="range" min="0" max="0.6" step="0.01" value="${volume}" aria-label="Music volume"><small>Teacher only</small></div>`;}
async function toggleMusic(){if(!host)return;if(!music){music=new Audio('/battle12/assets/master-of-the-feast.mp3');music.preload='none';music.addEventListener('ended',()=>{if(musicOn){music.currentTime=0;music.play().catch(()=>notice('Tap Music to resume playback.'));}});music.addEventListener('timeupdate',()=>{if(!Number.isFinite(music.duration))return;music.volume=volume*Math.min(1,music.currentTime/2,(music.duration-music.currentTime)/2);});}if(musicOn){music.pause();musicOn=false;}else{music.volume=volume;try{await music.play();musicOn=true;}catch{notice('Music could not start. Tap Music again.');}}render();}
function render(){saveDraft();const active=document.activeElement,focus=active?.id,selection=active?.selectionStart,scroll=$('.scroll')?.scrollTop??0,joiningName=$('#name')?.value,joiningPin=$('#pin')?.value;
  app.innerHTML=token&&!state?'<p class="loading">Reconnecting to your saved voyage…</p>':!state||!token||state.role==='public'?joinView():host?teacherView():studentView();
  if($('#name')&&joiningName!==undefined)$('#name').value=joiningName;
  if($('#pin')&&joiningPin!==undefined)$('#pin').value=joiningPin;
  if(screen==='read'&&$('.scroll'))$('.scroll').scrollTop=readScroll;else if($('.scroll'))$('.scroll').scrollTop=scroll;
  if(focus&&document.getElementById(focus)){document.getElementById(focus).focus({preventScroll:true});try{document.getElementById(focus).setSelectionRange(selection,selection);}catch{}}
  if(pending){const bar=document.createElement('div');bar.className='panel';bar.innerHTML=`<p>A previous action needs confirmation from the server. Retry safely with the same receipt.</p>${btn('Retry saved action','retry','gold')}`;app.prepend(bar);}
  updateConnection();
  $('#join-form')?.addEventListener('submit',join);
  $('#answer')?.addEventListener('input',saveDraft);
  $('#answer-form')?.addEventListener('submit',e=>{e.preventDefault();send('student:submit',{questionId:state.question.id,answer:$('#answer').value,attempt:state.me.response?.attempts??0});});
  $('#volume')?.addEventListener('input',e=>{volume=Number(e.target.value);if(music)music.volume=volume;});
}
async function join(e){e.preventDefault();if(busy)return;busy=true;
  try{pin=$('#pin').value.trim();const name=$('#name').value;const result=await api(`rooms/${pin}/join`,{method:'POST',body:{clientId,name},auth:''});token=result.playerToken;put('student:'+pin,token);put('name',name);studentRoute();content=null;lastVersion=-1;await refresh();}
  catch(error){notice(error.message);}finally{busy=false;render();}
}
app.addEventListener('click',async e=>{
  const button=e.target.closest('[data-action]');if(!button||busy)return;const action=button.dataset.action;saveDraft();rememberReader();
  if(['answer','read','voyage','cards','notes'].includes(action)){screen=action;render();if($('.scroll'))$('.scroll').scrollTop=screen==='read'?readScroll:0;return;}
  if(['next','prev','page'].includes(action)){readPage=Math.max(0,Math.min(8,action==='page'?Number(button.dataset.page):readPage+(action==='next'?1:-1)));readScroll=0;put('reader:'+pin,JSON.stringify({page:readPage,scroll:0}));render();window.scrollTo(0,0);return;}
  if(action==='create'){
    if(get('student-room')&&!hostIntent&&!host)return notice('Use your teacher’s QR to join a room.');
    if(state&&!ended())return notice('End this room before creating another.');busy=true;
    try{const result=await api('rooms',{method:'POST',body:{},auth:''});pin=result.pin;token=result.hostToken;host=true;hostIntent=true;put('host:'+pin,token);put('host-room',pin);history.replaceState(null,'','/battle12/?host='+pin);state=null;content=null;lastVersion=-1;pending=null;await refresh();}catch(error){notice(error.message);}finally{busy=false;render();}return;
  }
  if(action==='refresh')return refresh(true);
  if(action==='dashboard'&&host){privateMode=false;screen='answer';history.replaceState(null,'','/battle12/?host='+pin);render();return;}
  if(action==='retry')return send(pending.type);
  if(action==='music')return toggleMusic();
  if(action==='fullscreen'){try{if(document.fullscreenElement)await document.exitFullscreen();else await document.documentElement.requestFullscreen();}catch{notice('Use your browser’s full-screen button.');}return;}
  if(action==='qr')return modal('Join room '+pin,qrContent(),null);
  if(action==='review')return modal('Open teacher review',`<p>Use a private screen. If your laptop screen is mirrored to the projector, this new window will also be visible.</p>`,'Open review',()=>window.open('/battle12/?host='+pin+'&review=1','_blank','noopener'));
  if(action==='start')return send('host:start');
  if(action==='pause')return send('host:pause',{paused:!state.paused});
  if(action==='advance')return modal(state.question.number===18?'Finish questions?':'Open the next question?',`<p>First mark every pending submission. Players without an accepted answer will not earn an Action for this question.</p>`,'Continue',()=>send('host:advance',{questionId:state.question.id,skip:true}));
  if(action==='reveal')return modal('Reveal to every player?',`<p>This shows the answer, closes new submissions for this question, and pauses game actions. Existing submissions can still be marked.</p>`,'Reveal answer',()=>send('host:reveal',{questionId:state.question.id}));
  if(action==='final-banking')return modal('Open Final banking?',`<p>Exploration and attacks will close. Players may spend one saved Action to bank, or pass.</p>`,'Open Final banking',()=>send('host:final-banking'));
  if(action==='finish')return send('host:finish');
  if(action==='end')return modal('End room '+pin+' now?',`<p>All answers, marking and game actions stop immediately. Only gems already in Vaults count. Backpack gems and unused Actions score zero.</p><p><b>No automatic banking or extra banking turn will happen.</b> Scores will be locked and students stay on their own results pages.</p>`,'End Game now',()=>send('host:end',{confirm:true}));
  if(action==='accept'||action==='reject')return send('host:review',{questionId:review.question.id,playerId:button.dataset.player,attempt:Number(button.dataset.attempt),decision:action==='accept'?'accept':'revise'});
  const version=state.me?.actionVersion;
  if(action==='place'){
    const location=button.dataset.place,[,name]=locations.find(l=>l[0]===location);
    return modal(name,`<img src="/battle12/assets/island.png" alt="Treasure island"><p>${location==='camp'?'Bank':'Explore'} · <b>1 Action</b></p>${state.me.actions===1?'<p>This uses your last Action. Banking also costs 1 Action.</p>':''}`,location==='camp'?'Bank now':'Explore now',()=>send(location==='camp'?'student:bank':'student:explore',{location,expectedVersion:version}));
  }
  if(action==='bank')return modal('Bank your Backpack?',`<p>Transfer ${state.me.bag} gems to your Vault for 1 Action.</p>`,'Bank · 1 Action',()=>send('student:bank',{expectedVersion:version}));
  if(action==='pass')return modal('Pass final banking?',`<p>Your remaining Backpack gems will not score. This decision cannot be undone.</p>`,'Pass',()=>send('student:pass',{expectedVersion:version}));
  if(action==='attack'){const target=state.players.find(p=>p.id===button.dataset.target);return modal('Use '+button.dataset.card+'?',`<p>Target: ${esc(target.name)}. This uses your card and your one attack for this question. Their Vault stays protected.</p>`,'Use card',()=>send('student:attack',{targetId:target.id,card:button.dataset.card,expectedVersion:version}));}
});
window.addEventListener('pagehide',()=>{saveDraft();rememberReader();music?.pause();});
window.addEventListener('pageshow',()=>refresh(true));
window.addEventListener('online',()=>refresh(true));
window.addEventListener('popstate',()=>{if(!host){studentRoute();refresh(true);}});
render();if(pin)refresh(true);setInterval(()=>{if(!busy&&!document.hidden)refresh();},1800);
