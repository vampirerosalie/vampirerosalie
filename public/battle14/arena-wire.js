// Shared by the room and browser. Player roster order is fixed for each round.
const fields=['x','z','yaw','ammo','score','ability','abilityMs','frozenMs','hitIds','stats'];
function differs(previous,next){
  if(previous===next)return false;
  if(typeof previous==='object'&&previous!==null&&typeof next==='object'&&next!==null){
    const keys=Object.keys(next);
    return keys.length!==Object.keys(previous).length || keys.some(k=>previous[k]!==next[k]);
  }
  return true;
}
function sameItems(before,after){
  return before.length===after.length && after.every((item,i)=>!differs(before[i],item));
}

export function diffFrame(previous,next){
  if(!previous||previous.round!==next.round||previous.players.length!==next.players.length||
     next.players.some((p,i)=>p.id!==previous.players[i].id)) return {full:next};
  const delta={ms:next.remainingMs};
  if(previous.paused!==next.paused)delta.paused=next.paused;
  if(previous.finished!==next.finished)delta.finished=next.finished;
  const players=[];
  next.players.forEach((player,index)=>{
    let mask=0;
    const values=[];
    fields.forEach((field,i)=>{
      if(differs(previous.players[index][field],player[field])){
        mask|=1<<i;
        values.push(player[field]);
      }
    });
    if(mask)players.push([index,mask,...values]);
  });
  if(players.length)delta.p=players;
  if(!sameItems(previous.drones,next.drones))delta.d=next.drones;
  if(!sameItems(previous.pickups,next.pickups))delta.k=next.pickups;
  const latestId=previous.events.at(-1)?.id??0;
  const events=next.events.filter(e=>e.id>latestId);
  if(events.length)delta.e=events;
  return delta;
}

export function applyDelta(previous,delta){
  if(delta.full)return delta.full;
  if(!previous)return null;
  const players=previous.players.slice();
  for(const [index,mask,...values] of delta.p||[]){
    if(!players[index])return null;
    const player={...players[index]};
    let pos=0;
    fields.forEach((field,i)=>{if(mask & (1<<i))player[field]=values[pos++];});
    players[index]=player;
  }
  return {...previous,remainingMs:delta.ms,paused:delta.paused??previous.paused,finished:delta.finished??previous.finished,
    players,drones:delta.d??previous.drones,pickups:delta.k??previous.pickups,events:delta.e??[]};
}

