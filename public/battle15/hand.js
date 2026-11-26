import {button,back,escape} from './views.js';

const cache = new Map();
let clock = () => Date.now();
let flashTimeout;
let roundKey = '', handKey = '', flashArmed = false, dealing = false;
let chosen = '', base = null, latestView, lastButtons = '', lastStage = '';
let flashCardHeight = 0;
let onReady, onFrame;

export function configureHand({serverClock, ready, frame}) {
  clock = serverClock; onReady = ready; onFrame = frame;
}
function loadImage(url) {
  if (cache.has(url)) return cache.get(url);
  const image = new Image();
  const entry = {image, status:'loading'};
  entry.promise = new Promise((resolve, reject) => {
    image.onload = resolve;
    image.onerror = () => reject(Error('Ilustrasi gagal dimuatkan.'));
    image.src = url;
  }).then(() => image.decode ? image.decode() : undefined).then(() => {
    entry.status = 'ready'; onFrame?.();
  }).catch(() => { entry.status = 'failed'; onFrame?.(); });
  cache.set(url,entry);
  return entry;
}
export function warmImages(view) {
  const wanted = new Set([...(view.preload??[]),...['back','frame','chip-1','chip-2','chip-3'].map(file=>'/battle15/art/'+file+'.webp')]);
  if(view.me)wanted.add('/battle15/art/table-seated.webp');
  for(const url of cache.keys()) if(!wanted.has(url)) cache.delete(url);
  for (const url of wanted) loadImage(url);
}
export function retryImages() {
  for (const [url,entry] of cache) if(entry.status==='failed') cache.delete(url);
  if(latestView) warmImages(latestView);
  onFrame?.();
}
export function clearHand() {
  clearTimeout(flashTimeout);
  roundKey='';handKey='';lastStage='';lastButtons='';flashArmed=false;chosen='';base=null;latestView=null;flashCardHeight=0;
}
function faceState(s) {
  const m=s.me;
  if(m.effect!=='flash') return 'faces';
  if(!m.ready || clock()<m.previewStart) return 'waiting';
  return clock()<m.previewEnd ? 'preview' : 'backs';
}
function saveDraft() {
  try { sessionStorage.setItem('meniti:draft',JSON.stringify({roundKey,chosen,base,flashCardHeight,width:innerWidth})); } catch {}
}
function readDraft(key) {
  try { const value=JSON.parse(sessionStorage.getItem('meniti:draft'));return value?.roundKey===key?value:{}; } catch { return {}; }
}
function scheduleFlash(s) {
  clearTimeout(flashTimeout);
  if(s.me.effect!=='flash'||!s.me.ready) return;
  const now=clock();
  const edge = now<s.me.previewStart?s.me.previewStart:now<s.me.previewEnd?s.me.previewEnd:null;
  if(edge!==null) flashTimeout=setTimeout(()=>{if(latestView===s)renderHand(s);}, Math.max(0,Math.ceil(edge-now)));
}
export function renderHand(s) {
  latestView=s;
  const root=document.getElementById('play-area');
  if(!root || s.phase!=='answering'||s.me.submitted) return;
  const m=s.me, key=s.gameId+':'+s.questionId;
  if(roundKey!==key) {
    clearHand(); latestView=s;roundKey=key;
    const draft=readDraft(key); chosen=draft.chosen??'';base=draft.base??null;
    flashCardHeight=draft.width===innerWidth?draft.flashCardHeight??0:0;dealing=true;
  }
  if(!root.firstElementChild) {
    root.innerHTML='<div class="wager-row"><div class="foil-label"><i></i><b>Pilih taruhan</b><i></i></div><div class="wager-options" id="wagers"></div></div><div class="phone-stage"><div id="slot"></div><div id="confirm-play" class="confirmation"></div></div><div id="hand-message" class="hand-status" role="status"></div><div class="hand-tray"><div id="hand" class="hand"></div></div>';
    handKey='';lastButtons='';lastStage='';
  }
  const flash=m.effect==='flash', face=faceState(s);
  const longCaptions=!!m.longCaptions;
  root.classList.toggle('flash-play',flash);
  const needed=flash ? (s.currentPreload??s.preload??[]) : m.hand.map(c=>c.art).filter(Boolean);
  const assets=needed.map(loadImage);
  const failed=assets.some(x=>x.status==='failed');
  const loaded=(face==='backs') || assets.every(x=>x.status==='ready');
  if(flash && !m.ready && loaded && !failed && !flashArmed) {
    flashArmed=true;
    Promise.resolve().then(()=>onReady(s)).then(success=>{if(!success && roundKey===key)flashArmed=false;});
  }
  scheduleFlash(s);
  if(flash && face==='backs') {
    // Drop captions and artwork as soon as the server-scheduled window ends.
    for(const card of m.hand) { delete card.art; delete card.caption; }
  }
  const visible=loaded&&face!=='waiting';
  const canSelect=visible&&face!=='preview'&&(!s.deadline||clock()<s.deadline);
  const selected=m.hand.find(c=>c.id===chosen);
  const wager=m.wagers.find(w=>w.base===base);
  const slot=document.getElementById('slot'), played=document.getElementById('confirm-play');
  const selection=canSelect&&selected;
  const stage=selection?`<span class="play-slot occupied">${face==='backs'?back():`<img class="thumb" src="${escape(selected.art)}" alt="">`}<b>${face==='backs'?'Kad tertutup dipilih':escape(selected.caption)}</b></span>`:`<span class="play-slot"><i class="foil-card" aria-hidden="true"><i></i></i><span>${face==='preview'?'Ingat kedudukan kad':'Pilih kad jawapan'}</span></span>`;
  if(lastStage!==stage){slot.innerHTML=stage;lastStage=stage;}
  if(!played.firstElementChild)played.innerHTML=button('Mainkan Kad','submit',{cls:'primary',symbol:'play'});
  const confirm=played.firstElementChild;
  confirm.disabled=!canSelect||!selection||!wager;
  played.hidden=confirm.disabled;
  const labels=m.wagers.map(w=>`<button type="button" class="wager" data-act="wager" data-base="${w.base}" aria-label="${w.base} cip${m.effect==='raise'?', taruhan sebenar '+w.actual+' cip':''}" aria-pressed="${base===w.base}"><span class="ceramic-chip"><img src="/battle15/art/chip-${w.base}.webp" alt=""><strong>${w.base}</strong></span>${m.effect==='raise'?`<span class="raised-stake">${w.actual} cip</span>`:''}</button>`).join('');
  if(lastButtons!==labels){document.getElementById('wagers').innerHTML=labels;lastButtons=labels;}
  const msg=document.getElementById('hand-message');
  const status=face==='backs'?'Pilih mengikut kedudukan yang anda ingat.':failed&&!loaded?`Ilustrasi belum dapat dimuatkan. ${button('Cuba semula','retry-art')}`:!loaded?'Memuatkan ilustrasi kad…':face==='waiting'?'Bersedia untuk imbasan tiga saat…':face==='preview'?'Imbasan Pantas · Ingat kedudukan kad dalam tiga saat.':m.effect==='raise'?'Taruhan sebenar ditambah satu cip untuk pusingan ini.':m.effect==='extra'?'Lima kad telah diedarkan. Pilih satu jawapan.':'';
  if(msg.innerHTML!==status)msg.innerHTML=status;
  msg.hidden=!status;
  const hand=document.getElementById('hand');
  const fingerprint=key+':'+(visible?face:'load')+':'+(visible?m.hand.map(x=>x.id).join(','):'');
  if(fingerprint!==handKey) {
    const backs=face==='backs';
    const animate=dealing&&visible&&!flash;
    hand.className='hand'+(m.hand.length===5?' five':'')+(longCaptions?' long-hand':' short-hand')+(animate?' deal':'');
    hand.innerHTML=visible?m.hand.map((c,i)=>{
      const distance=i-(m.hand.length-1)/2;
      return `<button type="button" data-act="card" data-card="${escape(c.id)}" aria-pressed="false" ${backs?`aria-label="Kad tertutup ${i+1}"`:''} class="answer-card${backs?' hidden-face':''}" style="--tilt:${distance*5}deg;--arc:${Math.abs(distance)*7}px${backs&&flashCardHeight?';height:'+flashCardHeight+'px;min-height:0':''}">${backs?back():`<span class="art-field"><img src="${escape(c.art)}" alt="" draggable="false"></span><span class="caption">${escape(c.caption)}</span>`}</button>`;
    }).join(''):'';
    handKey=fingerprint;if(visible)dealing=false;
  }
  if(face==='preview'&&visible&&hand.firstElementChild?.offsetHeight!==flashCardHeight){
    flashCardHeight=hand.firstElementChild?.offsetHeight??0;saveDraft();
  }
  for(const el of hand.children) {
    const pressed=el.dataset.card===chosen&&canSelect;
    el.classList.toggle('chosen',pressed);
    el.setAttribute('aria-pressed',String(pressed));
    el.disabled=!canSelect;
  }
}
export function pickCard(cardId) {
  const s=latestView;
  if(!s||faceState(s)==='preview'||!s.me.hand.some(c=>c.id===cardId))return;
  const original=document.querySelector(`[data-card="${CSS.escape(cardId)}"]`);
  chosen=cardId;saveDraft();renderHand(s);
  if(original) fly(original,document.getElementById('slot'));
}
export function pickWager(value) {
  if(!latestView?.me.wagers.some(w=>w.base===value))return;
  base=value;saveDraft();renderHand(latestView);
}
export function selection() {
  return {cardId:chosen,wager:base};
}
const reduced=()=>window.matchMedia('(prefers-reduced-motion: reduce)').matches;
function fly(source,target) {
  if(!source||!target||reduced()||!source.animate)return;
  const a=source.getBoundingClientRect(), b=target.getBoundingClientRect();
  const clone=source.cloneNode(true);
  clone.removeAttribute('data-act');clone.removeAttribute('data-card');clone.tabIndex=-1;
  clone.style.cssText=`position:fixed;left:${a.left}px;top:${a.top}px;width:${a.width}px;height:${a.height}px;max-width:none;pointer-events:none`;
  document.getElementById('animation-layer').append(clone);
  const animation=clone.animate([{transform:'translate(0,0) scale(1)',opacity:.85},
    {transform:`translate(${b.left+b.width/2-a.left-a.width/2}px,${b.top+b.height/2-a.top-a.height/2}px) scale(.25)`,opacity:0}],
    {duration:270,easing:'ease-out'});
  animation.onfinish=()=>clone.remove(); animation.oncancel=()=>clone.remove();
}
export function chipFlight(gain) {
  const target=document.getElementById('balance');
  if(!target||reduced()||!target.animate)return;
  const box=target.getBoundingClientRect(),x=box.left+15,y=box.top+10;
  const layer=document.getElementById('animation-layer');
  for(let i=0;i<3;i++){
    const chip=document.createElement('i');chip.className='flight chip-flight';
    chip.style.left=x+'px';chip.style.top=y+'px';layer.append(chip);
    const far={transform:`translate(${-65+i*13}px,${55+i*6}px)`,opacity:0};
    const near={transform:'translate(0,0)',opacity:1};
    const animation=chip.animate(gain?[far,near]:[near,far],{duration:420,delay:i*52,fill:'both'});
    animation.onfinish=()=>chip.remove();animation.oncancel=()=>chip.remove();
  }
}

