import { applyDelta } from './arena-wire.js';

export function requestId() {
  if (globalThis.crypto.randomUUID) return globalThis.crypto.randomUUID();
  const bytes=crypto.getRandomValues(new Uint8Array(16));
  bytes[6]=(bytes[6]&15)|64;
  bytes[8]=(bytes[8]&63)|128;
  const hex=Array.from(bytes,b=>b.toString(16).padStart(2,'0')).join('');
  return [hex.slice(0,8),hex.slice(8,12),hex.slice(12,16),hex.slice(16,20),hex.slice(20)].join('-');
}

export function connectRoom({pin,token,onState,onFrame,onStatus,onDiagnostics,onError}) {
  const url=new URL('/api/paintball/rooms/'+encodeURIComponent(pin)+'/socket',location.href);
  url.protocol=location.protocol==='https:'?'wss:':'ws:';
  const pending=new Map();
  let socket=null,ready=false,stopped=false,retryTimer,watchdog,attempt=0,seq=0,frame=null;
  let status='';
  const publishStatus=value=>{
    if(value!==status){status=value;onStatus?.(value);}
  };
  function send(message) {
    if (socket?.readyState!==WebSocket.OPEN) return false;
    socket.send(JSON.stringify(message));
    return true;
  }
  function clearTimers() {
    clearTimeout(retryTimer);clearTimeout(watchdog);
  }
  function failPending(reason) {
    for(const item of pending.values())item.reject(new Error(reason));
    pending.clear();
  }
  function open(){
    if(stopped)return;
    clearTimers();
    publishStatus(attempt?'offline':'connecting');
    const active=new WebSocket(url.href);
    socket=active;ready=false;frame=null;
    // Covers a stalled upgrade as well as an accepted socket with no authenticated state.
    watchdog=setTimeout(()=>{if(socket===active&&!ready)active.close(4000,'Connection timed out');},11000);
    active.onopen=()=>{if(socket===active)send({type:'auth',token});};
    active.onmessage=event=>{
      if(socket!==active||stopped)return;
      let message;
      try{message=JSON.parse(event.data);}catch{return;}
      if(message.type==='state'){
        const first=!ready;
        ready=true;attempt=0;clearTimeout(watchdog);publishStatus('connected');
        onState?.(message.state,message.serverTime);
        if(first){
          // Only unresolved commands replay. The server remembers their original IDs.
          for(const [id,item] of pending)send({type:'action',id,action:item.action});
          send({type:'ping',t:Date.now()});
        }
      }else if(message.type==='arena'){
        frame=message.frame || (message.delta && applyDelta(frame,message.delta));
        if(frame)onFrame?.(frame);
      }else if(message.type==='ack'){
        const item=pending.get(message.id);
        if(item){pending.delete(message.id);item.resolve(message.result);}
      }else if(message.type==='error'){
        const reason=message.message||'The room could not complete that action.';
        const item=pending.get(message.id);
        if(item){pending.delete(message.id);item.reject(new Error(reason));}
        else onError?.(reason);
      }else if(message.type==='probe'){
        send({type:'probeAck',nonce:message.nonce});
      }else if(message.type==='diagnostics'){
        onDiagnostics?.(message);
      }
    };
    active.onclose=event=>{
      if(socket!==active||stopped)return;
      clearTimers();ready=false;publishStatus('offline');
      if([4001,4003,4004,4009,4401,4403,4404].includes(event.code)){
        stopped=true;
        const reason=event.reason || (event.code===4009?'This device is connected in another tab.':'This room credential is no longer available.');
        failPending(reason);onError?.(reason);return;
      }
      const wait=Math.min(6000,350*2**Math.min(attempt++,5))*(.85+.3*Math.random());
      retryTimer=setTimeout(open,wait);
    };
    active.onerror=()=>{ /* onclose owns recovery, including failed initial upgrades. */ };
  }
  function retryWhenOnline(){
    if(!stopped&&socket?.readyState===WebSocket.CLOSED)open();
  }
  window.addEventListener('online',retryWhenOnline);
  document.addEventListener('visibilitychange',retryWhenOnline);
  open();
  return {
    action(action){
      if(stopped)return Promise.reject(new Error('The room connection is closed.'));
      if(pending.size>=12)return Promise.reject(new Error('Waiting for the room to confirm your last action.'));
      const id=requestId();
      return new Promise((resolve,reject)=>{
        pending.set(id,{action,resolve,reject});
        if(ready)send({type:'action',id,action});
      });
    },
    input(input){
      if(!ready||!frame||frame.paused||frame.finished||socket?.bufferedAmount>8192)return;
      const {dx,dz,yaw,fire}=input;
      const round=input.round??frame.round;
      if(round!==frame.round)return;
      send({type:'input',round,seq:++seq,dx,dz,yaw,fire:!!fire,...(fire?{fireId:requestId()}:{})});
    },
    diagnostics(){if(ready)send({type:'diagnostics'});},
    close(){
      stopped=true;ready=false;clearTimers();
      window.removeEventListener('online',retryWhenOnline);
      document.removeEventListener('visibilitychange',retryWhenOnline);
      failPending('The room was closed on this device.');
      socket?.close(1000,'Left room');socket=null;
    },
  };
}

