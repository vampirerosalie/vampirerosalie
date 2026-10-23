// Presentation only. The server still decides and records every outcome.
export const REWARD_ART = Object.freeze({
  gems: {file:'gems.png',alt:'A treasure pouch filled with glowing gemstones.',label:'Treasure discovered'},
  shield: {file:'shield.png',alt:'A teal wooden shield with brass trim.',label:'Protection discovered'},
  raid: {file:'raid.png',alt:'An illustrated Raid card with a grappling hook and gem pouch.',label:'Raid card'},
  sabotage: {file:'sabotage.png',alt:'An illustrated Sabotage card with a loosened rope and tipped pouch.',label:'Sabotage card'},
  trap: {file:'trap.png',alt:'A broken plank and spilled gems beside an island pit.',label:'Island mishap'},
  bank: {file:'vault.png',alt:'A locked pirate treasure chest protecting your banked gems.',label:'Treasure secured'},
});
export function rewardArt(outcome) {
  const kind=outcome?.visual??outcome?.kind;
  if(kind==='duplicate')return {...REWARD_ART.gems,label:'Duplicate converted'};
  if(kind==='blocked')return {...REWARD_ART.shield,label:'Attack blocked'};
  return REWARD_ART[kind]??null;
}
export function artImage(art,className='') {
  if(!art)return '';
  // All fields come from the fixed manifest, never decoded/user-generated markup.
  return `<img class="${className}" src="/battle12/assets/rewards/${art.file}" alt="${art.alt}" width="512" height="512" decoding="async">`;
}
