// Decorative sprites only. Names, scores, choices and controls remain live HTML.
const names=['crown','actions','science','land','question','kingdom','cards','standings'];
export function royalIcon(name,extra=''){
  if(!names.includes(name))return '';
  return `<i class="royal-icon icon-${name} ${extra}" aria-hidden="true"></i>`;
}
export function collectionCard(kind,count){
  const shield=kind==='shield',name=shield?'Shield':'Rebellion';
  return `<article class="royal-card ${shield?'shield-card':'rebellion-card'}">
    <div class="card-scene"><img src="/battle13/assets/${shield?'shield':'rebellion'}.webp" alt="${name} illustrated card"><span class="card-count" aria-label="${count} ${name} cards">× ${count}</span><h3>${name}</h3></div>
    <div class="card-inscription"><span class="card-kind">${shield?'ROYAL PROTECTION':'KINGDOM POWER'}</span><p>${shield?'Secretly protect one of your lands. Blocks one capture, rebellion or mystery land effect. Only your team sees it.':'Return enemy land to neutral. Fortresses block rebellion.'}</p><button type="button" data-action="card-target" data-card="${shield?'shield':'rebellion'}" class="gold wide" ${count?'':'disabled'}>${count?'Choose a territory':'No cards held'}</button></div>
  </article>`;
}
