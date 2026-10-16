// Isolated teacher-only player. No game API calls, polling, sockets or timers.
(() => {
  let audio=null, panel=null, button=null, slider=null, status=null, allowed=false, room='', pending=false, revision=0, failed=false;
  let volume=.18;
  try { const saved=localStorage.getItem('black-market:music-volume');if(saved!==null&&Number.isFinite(Number(saved)))volume=Math.min(1,Math.max(0,Number(saved))); } catch {}
  const paint=(message)=>{
    if(!panel)return;
    const on=pending||Boolean(audio&&!audio.paused);
    button.textContent=on?'Pause music':'Play music';button.setAttribute('aria-pressed',String(on));
    slider.value=String(Math.round(volume*100));
    status.textContent=message||(pending?'Loading music…':on?'Playing · teacher only':'Off · teacher only');
  };
  function pause(reset=false){revision++;pending=false;if(audio){audio.pause();if(reset){try{audio.currentTime=0;}catch{}}}paint();}
  async function toggle(){
    if(!allowed)return;
    if(pending||(audio&&!audio.paused)){pause();return;}
    const attempt=++revision;pending=true;paint();
    try {
      if(!audio){audio=new Audio();audio.preload='none';audio.loop=true;
        audio.addEventListener('error',()=>{failed=true;pause();paint('Music unavailable. The game continues normally.');});
        audio.src='/battle9/assets/violet-market.wav';
      }
      audio.volume=volume;
      if(failed){failed=false;audio.load();}
      await audio.play();
      if(attempt!==revision)return;
      if(!allowed){audio.pause();return;}
      pending=false;paint();
    }catch{if(attempt!==revision)return;pending=false;paint('Music could not start. Press Play to retry; the game is unaffected.');}
  }
  function mount(slot){
    if(!panel){
      panel=document.createElement('section');panel.className='market-music';panel.setAttribute('aria-label','Teacher background music');
      panel.innerHTML='<span class="music-title">♫ Violet Market<small>Soft instrumental · no vocals</small></span><button type="button" class="button ghost small" aria-pressed="false">Play music</button><label>Volume <input id="music-volume" aria-label="Music volume" type="range" min="0" max="100" step="1"></label><span class="music-status" role="status"></span>';
      button=panel.querySelector('button');slider=panel.querySelector('input');status=panel.querySelector('.music-status');
      button.addEventListener('click',()=>void toggle());
      slider.addEventListener('input',()=>{volume=Math.min(1,Math.max(0,Number(slider.value)/100));if(audio)audio.volume=volume;try{localStorage.setItem('black-market:music-volume',String(volume));}catch{}});
      paint();
    }
    if(panel.parentNode!==slot)slot.appendChild(panel);
  }
  window.MarketMusic={update({teacher,phase,pin,slot}){
    const next=Boolean(teacher&&phase&&phase!=='finished'&&slot);
    if(!next||room!==pin){pause(true);room=pin||'';}
    allowed=next;
    if(allowed)mount(slot);else panel?.remove();
  }};
  window.addEventListener('pagehide',()=>{allowed=false;pause(true);});
})();
