import {CONTENT_EDITION,EXERCISES} from "./content.js";
import {btn,esc,welcome,publicView,teacher,review,cards,resetPanel,scanner,studentRound} from "./views.js";
const root=document.getElementById('game'),dialog=document.getElementById('overlay'),panel=document.getElementById('overlay-body');
const tools=document.getElementById('tools'),notice=document.getElementById('notice'),connection=document.getElementById('link-status');
const params=new URLSearchParams(location.search),embedded=window.parent!==window;
const store={
 get(k){try{return localStorage.getItem('sastera:'+k)||'';}catch{return '';}},
 put(k,v){try{localStorage.setItem('sastera:'+k,v);}catch{}},
 del(k){try{localStorage.removeItem('sastera:'+k);}catch{}},
 json(k){try{return JSON.parse(this.get(k))}catch{return null;}}
};
const role=params.has('join')||params.has('student')||params.has('room')?'student':params.has('teacher')||params.has('host')?'host':params.has('screen')?'public':'student';
document.body.classList.add(role);
const valid=v=>/^\d{5}$/.test(v||'');
const uuid=()=>crypto.randomUUID?.()??Array.from(crypto.getRandomValues(new Uint8Array(16)),v=>v.toString(16).padStart(2,'0')).join('');
let pin=(role==='host'?params.get('host')||store.get('host-room'):role==='public'?params.get('screen'):params.get('join')||params.get('room')||'')||'';
if(!valid(pin))pin='';
let token=role!=='public'&&pin?store.get(role+':'+pin):'';
let clientId=store.get('client-id');if(!clientId){clientId=uuid();store.put('client-id',clientId);}
let state=null,busy=false,polling=false,closed=false,latestLayout='',toolLayout='',timer=0,modal=null;
let selected='nilai',draftKey='',seenScanError=false;
let scanTarget=null;
const requestedStation=Number(params.get('station')),requestedCode=params.get('code');
if(role==='student'&&valid(pin)&&requestedStation>=1&&requestedStation<=4&&requestedCode)scanTarget={station:requestedStation,code:requestedCode};
let ui={step:'dialogue',beat:0,text:'',sceneId:'',compare:false};
let pending=pin&&token?store.json('pending:'+role+':'+pin):null;
let actionFlight=false,camera=null,scanFrame=0,cameraTicket=0,nextCameraFrame=0;
let music=null,resumeMusic=false;
const musicOwner=uuid();

function showMusicState(){
 const button=tools.querySelector('[data-act="music"]');
 if(!button)return;
 const playing=Boolean(music&&!music.paused);
 button.setAttribute('aria-pressed',String(playing));
 button.title=playing?'Jedakan Morning':'Mainkan Morning';
}
async function playMusic(explicit=false){
 if(role==='student'||closed||document.hidden||(!explicit&&store.get('music')==='off'))return;
 if(!music){
   music=new Audio('/battle16/audio/morning.mp3');
   music.loop=true;
   music.volume=0.17;
   music.addEventListener('play',showMusicState);
   music.addEventListener('pause',showMusicState);
 }
 try{
   await music.play();
   if(!music.paused)store.put('music-owner',musicOwner);
 }catch(error){
   if(explicit&&error.name!=='AbortError')notify('Muzik belum dapat dimainkan. Tekan Muzik untuk mencuba lagi.');
 }
 showMusicState();
}
function toggleMusic(){
 if(role==='student')return;
 resumeMusic=false;
 if(music&&!music.paused){
   store.put('music','off');
   music.pause();
 }else{
   store.put('music','on');
   void playMusic(true);
 }
}
function suspendMusic(){
 if(music&&!music.paused){resumeMusic=true;music.pause();}
}
function restoreMusic(){
 if(!resumeMusic||document.hidden||closed)return;
 resumeMusic=false;
 const owner=store.get('music-owner');
 if(!owner||owner===musicOwner)void playMusic();
}
window.addEventListener('storage',event=>{
 if(event.key==='sastera:music-owner'&&event.newValue!==musicOwner){
   resumeMusic=false;
   music?.pause();
 }
});
function route(){
 if(role==='host')history.replaceState(null,'','/battle16/?teacher=1'+(embedded?'&embedded=1':'')+(pin?'&host='+pin:''));
 if(role==='student'){
   if(pin){try{sessionStorage.setItem('sastera:student-room',pin);}catch{}}
   const q=new URLSearchParams(pin?{join:pin}:{student:'1'});if(scanTarget){q.set('station',scanTarget.station);q.set('code',scanTarget.code);}
   history.replaceState(null,'','/battle16/?'+q);
 }
}
function notify(msg){
 const modalStatus=panel.querySelector('[data-modal-status]');
 if(dialog.open&&modalStatus){modalStatus.textContent=msg;return;}
 notice.textContent=msg;notice.hidden=false;clearTimeout(timer);timer=setTimeout(()=>notice.hidden=true,6200);
}
function offline(failed){
 connection.hidden=!failed;
 if(failed)connection.textContent='Sambungan terputus. Sedang mencuba semula…';
}
async function api(path,body,auth=token){
 const controller=new AbortController(),id=setTimeout(()=>controller.abort(),15000);
 try{
   const res=await fetch('/api/sastera/rooms'+path,{method:body?'POST':'GET',cache:'no-store',signal:controller.signal,
    headers:{...(auth?{Authorization:'Bearer '+auth}:{}),...(body?{'Content-Type':'application/json'}:{})},...(body?{body:JSON.stringify(body)}:{})});
   const data=await res.json();
   if(!res.ok)throw Object.assign(Error(data.error||'Permintaan gagal.'),{status:res.status});
   offline(false);return data;
 }finally{clearTimeout(id);}
}
function signal(type,extra={}){
 if(role==='host'&&embedded)window.parent.postMessage({type,pin,...extra},location.origin);
}
function draw(){
 const toolbar=(pin?`<span class="pin-label">PIN <strong>${esc(pin)}</strong></span>`:'')+
 (role!=='student'?btn('Muzik','music',{cls:'top-btn',icon:'music',attrs:'aria-label="Muzik latar · Morning" aria-pressed="false"'}):'')+
 (role!=='student'?btn('Full screen','fullscreen',{cls:'top-btn',icon:'full',attrs:'data-game-fullscreen-control'}):'');
 if(toolbar!==toolLayout){tools.innerHTML=toolbar;toolLayout=toolbar;showMusicState();}
 let html;
 if(!state&&(role==='public'||token))html='<div class="loading">Membuka bilik latihan…</div>';
 else if(!state)html=welcome(role,pin,store.get('name'));
 else if(role==='host')html=teacher(state,selected);
 else if(role==='public')html=publicView(state);
 else html=studentRound(state,ui);
 if(html!==latestLayout){
  // A poll must not replace a textarea while its owner is writing.
  const field=document.activeElement,typing=field?.id==='answer'&&root.contains(field);
  const pos=typing?[field.selectionStart,field.selectionEnd]:null;
  root.innerHTML=html;latestLayout=html;
  const el=document.getElementById('answer');
  if(el){el.value=ui.text;if(typing){el.focus({preventScroll:true});el.setSelectionRange(...pos);}}
 }
 const waiting=Boolean(busy||pending);
 document.body.classList.toggle('reading',state?.phase==='playing'&&role==='student');
 root.setAttribute('aria-busy',String(waiting));
 for(const el of document.querySelectorAll('[data-act="start"],[data-act="mark"],[data-act="submit"],[data-act="confirm-reset"],[data-act="create"],#join-form button'))el.disabled=waiting;
}
function rememberDraft(){
 if(draftKey)store.put(draftKey,JSON.stringify({text:ui.text,sceneId:ui.sceneId,step:ui.step,beat:ui.beat,edition:ui.edition}));
}
function apply(next){
 if(!next||next.pin!==pin||next.role!==role||state&&next.version<state.version)return;
 const prior=state;state=next;
 if(prior&&prior.gameId!==next.gameId){closeDialog();ui.compare=false;}
 if(role==='student'){
  const n=state.me.activeStation,e=state.me.entries[n-1];
  const nextKey=(state.phase==='playing'&&n>=1&&n<=3&&['empty','revise'].includes(e?.status))?`draft:${pin}:${state.gameId}:${n}:${e.revision}`:'';
  if(nextKey!==draftKey){
    draftKey=nextKey;
    if(draftKey){
      const saved=store.json(draftKey),st=EXERCISES[state.setId].stations[n-1];
      const edition=e.edition??CONTENT_EDITION;
      const available=e.legacyTask?.choices??st.choices;
      const order=state.me.choiceOrder??[];
      const choices=order.map(id=>available.find(c=>c.id===id)).filter(Boolean);
      const choice=(saved && (saved.edition??1)===edition ? saved.sceneId : e.sceneId)||'';
      const validChoice=available.some(c=>c.id===choice);
      ui={...ui,step:e.status==='revise'?(validChoice?'write':'choice'):(['dialogue','choice','write'].includes(saved?.step)?saved.step:'dialogue'),
        beat:Math.max(0,Math.min(Number(saved?.beat)||0,st.dialogue.length-1)),sceneId:validChoice?choice:'',
        choices:choices.length===available.length?choices:available,edition,text:String(saved?.text??e.text??'')};
      if(ui.step==='write'&&!validChoice)ui.step='choice';
    }
  }
 }else if(role==='host'){
   if(!prior||prior.gameId!==state.gameId)selected=state.setId||'nilai';
   signal('sastera:status',{phase:state.phase==='playing'?'active':state.phase,onlineCount:state.onlineCount??state.teams?.filter(t=>t.online).length??0});
   if(modal?.kind==='read'){
     const e=state.teams.find(t=>t.id===modal.team)?.entries[modal.n-1];
     if(!e||e.revision!==modal.revision||e.status!==modal.status){closeDialog();notify('Status jawapan telah berubah. Buka semula untuk menyemaknya.');}
   }
 }
 draw();
}
function clearPending(){store.del('pending:'+role+':'+pin);pending=null;}
function resetSession(err){
 if(err.status!==404&&err.status!==401)return false;
 const old=pin;
 if(role==='public'){state=null;root.innerHTML='<div class="loading">Bilik tidak ditemui. Gunakan pautan paparan kelas yang baharu.</div>';closed=true;return true;}
 clearPending();if(pin)store.del(role+':'+pin);if(role==='host'){store.del('host-room');signal('sastera:unavailable');pin='';}
 if(err.status===404&&role==='student'){pin='';scanTarget=null;}
 token='';state=null;latestLayout='';draftKey='';closeDialog();route();draw();
 notify(err.status===404?`Bilik ${old} telah tamat. Gunakan kod QR bilik semasa.`:'Sila sertai semula bilik anda.');return true;
}
async function refresh(){
 if(closed||polling||!pin||(!token&&role!=='public'))return;
 polling=true;const old=pin,auth=token;
 try{const data=await api('/'+pin+'/state');if(old===pin&&auth===token)apply(data.state??data);}
 catch(e){if(old===pin&&auth===token&&!resetSession(e)){if(!e.status||e.status>=500)offline(true);else notify(e.message);}}
 finally{polling=false;}
 if(state&&pending&&!busy&&!actionFlight)await transmit();
 if(state&&!pending)await initialScan();
}
async function create(){
 if(busy||token||role!=='host')return;busy=true;draw();
 try{const data=await api('',{},'');pin=data.pin;token=data.hostToken;store.put('host-room',pin);store.put('host:'+pin,token);route();await refresh();}
 catch(e){notify(e.message||'Bilik belum dapat dibuka. Cuba lagi.');}
 finally{busy=false;draw();}
}
async function join(form){
 if(busy)return;const data=new FormData(form),name=String(data.get('name')||'').trim(),room=String(data.get('pin')||'').trim();
 if(!valid(room)||!name){notify('Masukkan PIN lima digit dan nama pasukan.');return;}
 busy=true;draw();
 try{
  const result=await api('/'+room+'/join',{name,clientId},'');if(pin!==room)scanTarget=null;pin=room;token=result.playerToken;store.put('student:'+pin,token);store.put('name',name);store.put('student-room',pin);
  route();await refresh();
 }catch(e){notify(e.message||'Penyertaan belum disahkan. Cuba sekali lagi.');}
 finally{busy=false;draw();if(state)void initialScan();}
}
function queue(type,fields={}){
 if(busy||!state||pending)return;
 pending={type,requestId:uuid(),gameId:state.gameId,...fields};
 store.put('pending:'+role+':'+pin,JSON.stringify(pending));
 draw();void transmit();
}
async function initialScan(){
 if(role!=='student'||!state||state.phase!=='playing'||!scanTarget||pending||busy||actionFlight||seenScanError)return;
 // Remove the printed code from this history entry before sending. A reload
 // may retry the pending action, but cannot perform a new final check.
 const target=scanTarget;scanTarget=null;
 queue('scan',target);route();
}
async function transmit(){
 if(!pending||actionFlight||closed)return;
 actionFlight=true;const request=pending;
 try{
   const payload=await api('/'+pin+'/action',request);
   if(pending!==request)return;
   clearPending();
   if(request.type==='submit'&&draftKey){store.del(draftKey);draftKey='';}
   if(['mark','reset'].includes(request.type))closeDialog();
   if(request.type==='scan'){closeDialog();ui.compare=false;seenScanError=false;}
   apply(payload.state??payload);
   if(request.type==='mark')notify('Semakan anda telah disimpan.');
   if(request.type==='submit')notify('Perenggan telah dihantar kepada cikgu.');
 }catch(e){
   if(pending!==request)return;
   if(e.status&&e.status<500&&e.status!==429){
     clearPending();if(request.type==='scan')seenScanError=true;
     if(!resetSession(e)){notify(e.message);await refresh();}
   }else offline(true);
 }finally{actionFlight=false;draw();}
}
function openDialog(kind,extra={}){
 closeDialog();modal={kind,...extra};
 if(kind==='cards'){panel.innerHTML=cards(state);dialog.classList.add('cards-dialog');}
 if(kind==='read')panel.innerHTML=review(state,extra.team,extra.n);
 if(kind==='reset')panel.innerHTML=resetPanel();
 if(kind==='new')panel.innerHTML='<h2 id="overlay-title">Cipta bilik baharu?</h2><p>Pasukan dalam bilik ini akan kekal di sini. Bilik baharu mempunyai PIN dan empat kod QR baharu.</p><div class="mark-actions">'+btn('Batal','dismiss',{cls:'soft'})+btn('Cipta bilik baharu','confirm-new',{cls:'gold'})+'</div>';
 if(kind==='camera')panel.innerHTML=scanner();
 panel.insertAdjacentHTML('beforeend','<p data-modal-status role="status"></p>');
 if(!dialog.open)dialog.showModal();draw();
 if(kind==='camera')void startCamera();
}
function closeDialog(){
 stopCamera();modal=null;dialog.classList.remove('cards-dialog');if(dialog.open)dialog.close();
}
function stopCamera(){
 cameraTicket++;cancelAnimationFrame(scanFrame);scanFrame=0;camera?.getTracks().forEach(t=>t.stop());camera=null;
}
async function startCamera(){
 const run=++cameraTicket,video=panel.querySelector('video'),msg=panel.querySelector('#cam-status');
 try{
   if(!globalThis.jsQR){await new Promise((resolve,reject)=>{const src=document.createElement('script');src.src='/battle10/jsQR.js';src.onload=resolve;src.onerror=reject;document.head.append(src);});}
   if(run!==cameraTicket)return;
   const stream=await navigator.mediaDevices.getUserMedia({video:{facingMode:{ideal:'environment'},width:{ideal:900}},audio:false});
   if(run!==cameraTicket){stream.getTracks().forEach(t=>t.stop());return;}
   camera=stream;video.srcObject=stream;await video.play();
   const canvas=document.createElement('canvas'),ctx=canvas.getContext('2d',{willReadFrequently:true});
   function decode(now){
     if(run!==cameraTicket)return;
     if(now>nextCameraFrame&&video.readyState>=2&&video.videoWidth){nextCameraFrame=now+240;canvas.width=Math.min(video.videoWidth,640);canvas.height=Math.round(video.videoHeight*canvas.width/video.videoWidth);ctx.drawImage(video,0,0,canvas.width,canvas.height);const pixels=ctx.getImageData(0,0,canvas.width,canvas.height),qr=globalThis.jsQR(pixels.data,pixels.width,pixels.height,{inversionAttempts:'dontInvert'});
      if(qr){try{
       const url=new URL(qr.data),n=Number(url.searchParams.get('station')),code=url.searchParams.get('code');
       if(url.origin===location.origin&&/^\/battle16(?:\/(?:index\.html)?)?$/.test(url.pathname)&&url.searchParams.get('join')===pin&&Number.isInteger(n)&&n>=1&&n<=4&&code){
         stopCamera();queue('scan',{station:n,code});return;
       }
      }catch{}msg.textContent='Kod ini bukan kad untuk bilik anda. Imbas kad stesen yang dipamerkan.';}
     }
     scanFrame=requestAnimationFrame(decode);
   }
   scanFrame=requestAnimationFrame(decode);
 }catch{
   if(run!==cameraTicket)return;stopCamera();msg.textContent='Gunakan aplikasi Kamera pada telefon untuk mengimbas kad QR, kemudian buka pautan dalam pelayar yang sama.';
 }
}
root.addEventListener('input',event=>{if(event.target.id==='answer'){ui.text=event.target.value;rememberDraft();}});
document.addEventListener('submit',e=>{
 if(e.target.id!=='join-form'&&e.target.id!=='answer-form')return;e.preventDefault();
 if(e.target.id==='join-form'){void join(e.target);return;}
 if(!state?.me)return;
 const n=state.me.activeStation,text=e.target.querySelector('textarea').value.trim();
 if(!text||!ui.sceneId){notify('Pilih satu peristiwa dan tulis perenggan anda.');return;}
 queue('submit',{station:n,revision:state.me.entries[n-1].revision,sceneId:ui.sceneId,edition:ui.edition,text});
});
document.addEventListener('click',event=>{
 const el=event.target.closest('[data-act]');if(!el||el.disabled)return;
 const act=el.dataset.act;
 switch(act){
 case 'music':toggleMusic();break;
 case 'create':void playMusic();void create();break;
 case 'set':selected=el.dataset.set;draw();break;
 case 'start':void playMusic();queue('start',{setId:selected});break;
 case 'cards':openDialog('cards');break;
 case 'new-room':openDialog('new');break;
 case 'confirm-new':if(!pending&&!busy){closeDialog();pin='';token='';state=null;store.del('host-room');signal('sastera:unavailable');route();void create();}break;
 case 'print':if([...panel.querySelectorAll('.qr-code')].every(i=>i.complete&&i.naturalWidth))window.print();else notify('Tunggu sehingga keempat-empat kod QR dipaparkan.');break;
 case 'reset':openDialog('reset');break;
 case 'confirm-reset':queue('reset');break;
 case 'dismiss':closeDialog();break;
 case 'read':{
   const team=el.dataset.team,n=Number(el.dataset.station),e=state.teams.find(t=>t.id===team)?.entries[n-1];
   if(e)openDialog('read',{team,n,revision:e.revision,status:e.status});break;
 }
 case 'mark':{
   if(!modal||modal.kind!=='read')return;
   const status=el.dataset.status,feedback=document.getElementById('feedback').value.trim();
   if(status==='revise'&&!feedback){notify('Tulis maklum balas supaya pasukan tahu perkara yang perlu dibaiki.');document.getElementById('feedback').focus();return;}
   queue('mark',{teamId:modal.team,station:modal.n,revision:modal.revision,status,feedback});break;
 }
 case 'next-line':{
   const st=EXERCISES[state.setId].stations[state.me.activeStation-1];
   if(ui.beat>=st.dialogue.length-1)ui.step='choice';else ui.beat++;
   rememberDraft();draw();break;
 }
 case 'choose-again':ui.step='choice';rememberDraft();draw();break;
 case 'choice':ui.sceneId=el.dataset.id;ui.step='write';rememberDraft();draw();break;
 case 'scanner':openDialog('camera');break;
 case 'toggle-compare':ui.compare=!ui.compare;draw();root.scrollIntoView({block:'start'});break;
 }
});
dialog.addEventListener('cancel',()=>{stopCamera();modal=null;dialog.classList.remove('cards-dialog');});
dialog.addEventListener('click',e=>{if(e.target===dialog)closeDialog();});
window.addEventListener('pagehide',()=>{closed=true;suspendMusic();stopCamera();});
window.addEventListener('pageshow',()=>{closed=false;restoreMusic();if(token)void refresh();});
document.addEventListener('visibilitychange',()=>{
 if(document.hidden){suspendMusic();if(camera)closeDialog();}
 else {restoreMusic();void refresh();}
});
window.addEventListener('online',()=>void refresh());
if(role==='host'&&!embedded){location.replace('/?battle=16&teacher=1'+(valid(params.get('host'))?'&host='+pin:''));}
else{
 route();draw();
 if(pin&&(token||role==='public'))void refresh();
 setInterval(()=>{if(!document.hidden)void refresh();},2000);
}
