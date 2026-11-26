const glyphs = {
  full: '<path d="M8 3H3v5m13-5h5v5M3 16v5h5m13-5v5h-5"/>',
  cards: '<rect x="8" y="5" width="12" height="16" rx="2"/><path d="m8 17-5-1 2-13 11 1"/>',
  users: '<circle cx="9" cy="8" r="3"/><path d="M3 20v-3a6 6 0 0 1 12 0v3M16 5a3 3 0 0 1 0 6m1 2a5 5 0 0 1 4 5v2"/>',
  clock: '<circle cx="12" cy="12" r="9"/><path d="M12 7v6l4 2"/>',
  screen: '<rect x="2" y="4" width="20" height="14" rx="2"/><path d="M12 18v3m-4 0h8"/>',
  qr: '<path d="M3 3h6v6H3zM15 3h6v6h-6zM3 15h6v6H3zM14 13h3v3h4v5h-4v-3h-4z"/>',
  play: '<path d="m8 4 12 8-12 8z"/>',
  close: '<path d="m6 6 12 12M18 6 6 18"/>',
  help: '<circle cx="12" cy="12" r="9"/><path d="M9 9a3 3 0 0 1 6 0c0 2-3 2.5-3 5m0 3v.1"/>',
  shield: '<path d="M12 2 3 6v6c0 5 5 8 9 10 4-2 9-5 9-10V6z"/><path d="m8 12 3 3 5-6"/>',
  check: '<path d="m3 12 6 6L21 5"/>',
  lock: '<rect x="5" y="10" width="14" height="11" rx="2"/><path d="M8 10V7a4 4 0 0 1 8 0v3"/>',
  crown: '<path d="m2 7 5 4 5-8 5 8 5-4-3 12H5zM6 22h12"/>',
  sound: '<path d="M3 9h4l5-5v16l-5-5H3zM16 8a5 5 0 0 1 0 8m3-11a9 9 0 0 1 0 14"/>',
  mute: '<path d="M3 9h4l5-5v16l-5-5H3zM16 9l6 6m0-6-6 6"/>',
  book: '<path d="M3 4q5-2 9 1 4-3 9-1v15q-5-2-9 1-4-3-9-1zM12 5v15"/>',
};
export const icon = name => `<svg class="icon" viewBox="0 0 24 24" aria-hidden="true">${glyphs[name] ?? ''}</svg>`;
export const escape = value => String(value ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
export const back = (cls = '') => `<span aria-hidden="true" class="back ${cls}"><i class="medallion"></i></span>`;
export const button = (label, action, {cls = '', disabled = false, attrs = '', symbol = ''} = {}) =>
  `<button type="button" data-act="${action}" class="${cls}" ${disabled ? 'disabled' : ''} ${attrs}>${iconIf(symbol)}${escape(label)}</button>`;
function iconIf(name) { return name ? icon(name) : ''; }
export const iconButton = (name, action, label) => `<button type="button" class="icon-button ghost" data-act="${action}" aria-label="${escape(label)}" title="${escape(label)}">${icon(name)}</button>`;
export const powers = {
  flash: {name:'Imbasan Pantas', cost:3, detail:'Sasaran hanya dapat melihat empat kad selama tiga saat, kemudian memilih kad tertutup daripada ingatan.'},
  extra: {name:'Kad Tambahan', cost:2, detail:'Sasaran menerima lima pilihan jawapan untuk soalan seterusnya.'},
  raise: {name:'Naikkan Taruhan', cost:2, detail:'Taruhan sasaran bertambah satu cip. Jawapan betul juga memberinya ganjaran yang lebih besar.'},
  shield: {name:'Perisai', cost:2, detail:'Simpan satu perisai untuk membatalkan serangan seterusnya secara automatik.'},
};
export const rules = `<ol class="rule-list"><li>Baca soalan yang dipaparkan oleh guru.</li><li>Pilih taruhan 1, 2 atau 3 cip dan satu kad jawapan. Tekan <b>Mainkan Kad</b> untuk mengunci pilihan.</li><li>Jawapan betul menambah cip mengikut taruhan. Jawapan salah menolak jumlah yang sama. Tiada bonus kelajuan.</li><li>Setiap lima soalan, kedai dibuka. Beli paling banyak satu kad dan tinggalkan sekurang-kurangnya satu cip.</li></ol><p class="support">Setiap pasukan bermula dengan 10 cip kelas. Jawapan kosong kehilangan taruhan minimum. Pasukan yang kehabisan cip mendapat satu cip pada awal soalan berikutnya. Baki tertinggi selepas soalan ke-32 menang.</p><p class="credit">Ilustrasi cerita daripada komik kelas Meniti Impian oleh Mr Ren, berdasarkan novel karya Osman Ayob.</p>`;
export const credit = '<p class="credit"><a href="https://incompetech.com/music/royalty-free/index.html?isrc=USUAN1600060" target="_blank" rel="noopener">Thinking Music · Kevin MacLeod</a> · <a href="https://creativecommons.org/licenses/by/4.0/" target="_blank" rel="noopener">CC BY 4.0</a></p>';
const art = path => escape(path);
const HERO = '/battle15/art/hero.webp';
const fullTitle = 'Meniti <em>Impian</em>';
const facts = `<div class="facts"><span>${icon('cards')}32 soalan</span><span>${icon('users')}1–12 pasukan</span></div>`;
function heroCard() {
  return `<div class="showcase" aria-hidden="true"><div class="book-card">${back()}<figure class="book-card-face"><div class="cover-art"><img src="${HERO}" alt="" fetchpriority="high"></div><figcaption>Meniti Impian</figcaption></figure></div></div>`;
}
function hero(copy) {
  return `<section class="hero"><div class="hero-copy"><p class="kicker">Bahasa Melayu · Tingkatan 2</p><h1>${fullTitle}</h1>${copy}</div>${heroCard()}</section>`;
}
export function welcome({role, pin, name, busy}) {
  if (role === 'host') return hero(`<p class="support">Uji ingatan tentang perjalanan Zahar dari bengkel Pak Yusuf hingga impiannya terlaksana.</p>${facts}<div class="actions">${button('Cipta Bilik','create',{cls:'primary',symbol:'cards',disabled:busy})}${button('Cara bermain','rules',{cls:'ghost'})}</div>`);
  if (role === 'public') return hero('<p class="support">Masukkan PIN bilik daripada guru untuk membuka paparan kelas.</p>' + pinForm(pin,false));
  return hero(`<p class="support">Sertai meja kelas untuk bermain kad bersama pasukan anda.</p>${pinForm(pin,true,name,busy)}`);
}
function pinForm(pin, joining, name='', busy=false) {
  return `<form class="join-form" id="${joining?'join-form':'screen-form'}"><label>PIN bilik<input name="pin" inputmode="numeric" pattern="[0-9]{5}" maxlength="5" autocomplete="off" value="${escape(pin)}" placeholder="5 digit" required></label>${joining?`<label>Nama atau nama pasukan<input name="name" maxlength="28" autocomplete="nickname" value="${escape(name)}" placeholder="Nama pasukan" required></label>`:''}<button class="primary" ${busy?'disabled':''}>${joining?'Sertai Bilik':'Buka Paparan Kelas'}</button></form>`;
}
function teamList(s) {
  return `<aside class="panel"><p class="kicker">Kehadiran</p><h2>Pasukan <small>${s.joinedCount}/12</small></h2>${s.players.length ? `<ul class="teams-list">${s.players.map(p=>`<li><b class="team-name">${escape(p.name)}</b><span class="presence" data-online="${p.online}">${p.online?'Dalam talian':'Terputus'}</span></li>`).join('')}</ul>` : '<p class="support">Pasukan akan muncul di sini selepas menyertai bilik.</p>'}</aside>`;
}
export function lobby(s, host) {
  const join = `<div class="lobby-join"><img src="/api/meniti/rooms/${s.pin}/qr.svg" alt="Kod QR untuk menyertai bilik ${s.pin}"><div><p class="kicker">PIN bilik</p><strong class="room-pin">${s.pin}</strong><p class="support">Imbas untuk menyertai.</p></div></div>`;
  return `<div class="lobby-grid">${hero(`${join}<div class="actions">${host?button('Mulakan Permainan','start',{cls:'primary',symbol:'play',disabled:!s.joinedCount}):''}${button('Besarkan QR','qr',{cls:'ghost',symbol:'qr'})}</div>`)}${teamList(s)}</div>`;
}
export const phaseNames = {lobby:'Menunggu pasukan', question:'Baca soalan', answering:'Jawapan dibuka', closed:'Jawapan dikunci', reveal:'Jawapan didedahkan', shop:'Kedai dibuka', shopClosed:'Kedai ditutup', ended:'Permainan tamat'};
function meta(s) {
  return `<div class="round-meta"><p class="kicker">Soalan ${s.questionId} / ${s.questionCount}</p><div class="meter"><span class="stat-inline">${icon('cards')}<span data-submitted>${s.submittedCount}/${s.joinedCount} dihantar</span></span><span data-clock class="clock" ${s.phase==='answering'&&s.deadline?'':'hidden'}>${icon('clock')}<span></span></span></div></div>`;
}
function scene(path, alt) {
  return `<figure class="scene-frame"><img src="${art(path)}" alt="${escape(alt)}"></figure>`;
}
export function board(s) {
  if (s.phase==='ended') return finalBoard(s);
  if (s.showLeaderboard) return `<section class="screen-section">${ranking(s.players)}</section>`;
  if (s.phase==='shop'||s.phase==='shopClosed') return `<section class="screen-section shop-board"><p class="kicker">Selepas soalan ${s.questionId}</p><h1>${s.phase==='shop'?'Kedai sabotaj dibuka':'Kedai sabotaj ditutup'}</h1><p class="support">${s.phase==='shop'?'Pilih kad dan sasaran pada telefon pasukan anda. Satu pembelian bagi setiap pasukan.':'Bersedia untuk soalan berikutnya.'}</p>${s.phase==='shop'?powerCards(null):''}</section>`;
  return `<section class="question-stage">${meta(s)}<div class="question-layout"><div><h1 class="question-text">${escape(s.question.prompt)}</h1><p class="status-line">${icon(s.phase==='closed'?'lock':'book')}${phaseNames[s.phase]}</p></div>${scene(s.question.scene,'Suasana dalam novel Meniti Impian')}</div>${s.phase==='reveal'&&s.reveal?reveal(s.reveal):''}</section>`;
}
export function controls(s, seconds) {
  const b=(label,action,options={})=>button(label,action,{cls:'primary',...options});
  let main='';
  switch(s.phase) {
    case 'question': main=b('Edarkan Kad','deal',{symbol:'cards'}); break;
    case 'answering':
      main=`<label class="control-label">Tempoh<select id="seconds" ${s.deadline?'disabled':''}>${[5,10,15,20,30,45,60,90,120].map(t=>`<option value="${t}" ${t===seconds?'selected':''}>${t} saat</option>`).join('')}</select></label>${b('Mulakan Kiraan Detik','countdown',{disabled:!!s.deadline,symbol:'clock'})}${button('Tutup Jawapan','close-answer')}`;
      break;
    case 'closed': main=b('Dedahkan Jawapan','reveal')+button('Semak Jawapan','review'); break;
    case 'reveal': main=(s.shopDue?b('Buka Kedai Sabotaj','open-shop'):b(s.questionId===32?'Paparkan Keputusan Akhir':'Soalan Seterusnya','next'))+button('Semak Jawapan','review'); break;
    case 'shop': main=b('Tutup Kedai Sabotaj','close-shop'); break;
    case 'shopClosed': main=b('Soalan Seterusnya','next');break;
    case 'ended': main= s.history?.length ? b('Semak Soalan Terdahulu','review') : ''; break;
  }
  return `<section class="controls" aria-label="Kawalan guru">${main?`<div class="tools-row">${main}</div>`:''}<div class="tools-row">${s.phase!=='ended'&&s.phase!=='lobby'?button(s.showLeaderboard?'Kembali ke Meja':'Papan Kedudukan','leaderboard'):''}${button('Kod QR','qr',{cls:'ghost',symbol:'qr'})}<a class="action ghost" href="/battle15/index.html?screen=${s.pin}" target="_blank" rel="noopener">${icon('screen')}Paparan Kelas</a>${button('Tetapkan Semula','reset',{cls:'ghost'})}${s.phase!=='ended'?button('Tamatkan Permainan','end',{cls:'danger ghost'}):button('Bilik Baharu','new',{cls:'ghost'})}</div></section>`;
}
function reveal(r, result) {
  const delta=result?`<strong class="result-delta ${result.delta<0?'loss':''}">${outcomes[result.outcome]} · ${signed(result.delta)} cip</strong>`:'';
  return `<section class="revealed">${scene(r.art,'Ilustrasi jawapan yang betul')}<div><p class="kicker">Jawapan betul</p><h2>${escape(r.caption)}</h2><p>${escape(r.explanation)}</p>${r.nilai?`<p class="nilai"><b>${escape(r.nilai.name)}</b> · ${escape(r.nilai.event)}</p>`:''}${delta}</div></section>`;
}
export const outcomes = {correct:'Betul', incorrect:'Salah', unanswered:'Tidak dijawab'};
function signed(n) { return n>0?'+'+n:String(n); }
function ranking(rows) {
  return `<h2>Papan kedudukan</h2><div class="table-scroll"><table><thead><tr><th>Kedudukan</th><th>Pasukan</th><th>Baki cip</th></tr></thead><tbody>${rows.map(p=>`<tr><td>${p.rank}</td><td class="team-name">${escape(p.name)}</td><td>${p.balance}</td></tr>`).join('')}</tbody></table></div>`;
}
function finalBoard(s) {
  const rows=s.results??[],winners=rows.filter(x=>x.rank===1), max=Math.max(0,...rows.map(x=>x.correct));
  const best=rows.filter(x=>x.correct===max);
  return `<section class="winner"><div class="crown">${icon('crown')}</div><p class="kicker">${winners.length>1?'Juara bersama':'Juara Meniti Impian'}</p><h1>${winners.map(x=>escape(x.name)).join(' &amp; ')||'Permainan tamat'}</h1>${winners.length?`<span class="chip-count"><i class="chip-icon"></i>${winners[0].balance} cip</span>`:''}</section><section class="screen-section ranking"><h2>Keputusan akhir</h2><div class="table-scroll"><table class="full-stats"><thead><tr>${['Ked.','Pasukan','Baki cip','Betul','Ketepatan','Salah','Tidak dijawab','Cip diperoleh','Cip hilang (salah)','Cip hilang (kosong)','Belanja kedai'].map(label=>`<th>${label}</th>`).join('')}</tr></thead><tbody>${rows.map(p=>`<tr><td>${p.rank}</td><td class="team-name">${escape(p.name)}</td><td><b>${p.balance}</b></td><td>${p.correct}</td><td>${p.accuracy}%</td><td>${p.incorrect}</td><td>${p.unanswered}</td><td>${p.earned}</td><td>${p.lost}</td><td>${p.unansweredLoss}</td><td>${p.spent}</td></tr>`).join('')}</tbody></table></div>${best.length?`<p class="status-line">Jawapan betul terbanyak (${max}): ${best.map(p=>escape(p.name)).join(', ')}.</p>`:''}</section>`;
}
function powerCards(s) {
  return `<div class="shop-cards">${Object.entries(powers).map(([id,c])=>{
    const sold=s?.me.purchase||s?.me.balance<=c.cost|| (id==='shield'?s?.me.shield:s&&!s.shopTargets.some(t=>t.available));
    const tag=s?'button':'article';
    return `<${tag} class="power-card" ${s?`type="button" data-act="power" data-key="${id}" ${sold?'disabled':''}`:''}><img class="power-art" src="/battle15/art/${id}.webp" alt=""><span class="power-caption">${escape(c.name)}<span class="cost">${c.cost} cip</span></span></${tag}>`;
  }).join('')}</div>`;
}
export function shop(s) {
  const p=s.me.purchase, target=p?.targetId && s.players.find(row=>row.id===p.targetId);
  return `<section class="shop-area"><p class="kicker">Selepas soalan ${s.questionId}</p><h2>Kedai sabotaj</h2><p class="support">${p?`Anda membeli ${powers[p.card].name}${target?' untuk menyasarkan '+escape(target.name):''}.`:'Pilih satu kad. Baki selepas pembelian mestilah sekurang-kurangnya satu cip.'}</p>${attackNotice(s)}${powerCards(s)}</section>`;
}
export function attackNotice(s) {
  const a=s.me?.attack;
  if(!a) return '';
  const title=powers[a.card].name;
  const note=a.blocked?`Perisai anda menghalang ${title} daripada ${escape(a.name)}.`:a.refunded?'Naikkan Taruhan dibatalkan kerana baki cip anda tidak mencukupi.':`${escape(a.name)} menyasarkan pasukan anda dengan ${title}.`;
  return `<p class="phone-note ${a.blocked?'shield-block':'attack-arrival'}"><img src="/battle15/art/${a.blocked?'shield':a.card}.webp" class="sabotage-token" alt="">${note}</p>`;
}
export function phone(s) {
  const hud=`<header class="phone-hud"><div class="hud-team"><span class="brand-mark" aria-hidden="true"><i></i></span><div><p class="kicker">Meniti Impian</p><h2>${escape(s.me.name)}</h2></div></div><div class="hud-wallet"><div class="chip-count" id="balance"><img src="/battle15/art/chip-1.webp" alt=""><span>${s.me.balance}<small> cip</small></span>${s.me.shield?icon('shield'):''}</div>${iconButton('help','rules','Cara bermain')}</div></header>`;
  let content='';
  if(s.phase==='ended') content=finalBoard(s);
  else if(s.phase==='shop') content=shop(s);
  else if(s.phase==='lobby') content=`<div class="waiting">${heroCard()}<h2>Anda sudah menyertai meja.</h2><p class="support">Guru akan memaparkan soalan pertama sebentar lagi.</p>${button('Cara bermain','rules',{cls:'ghost'})}</div>`;
  else if(s.phase==='shopClosed') content=`<div class="waiting">${back('mini-deck')}<h2>Kedai telah ditutup.</h2><p class="support">Tunggu soalan seterusnya.</p></div>`;
  else {
    const reason=s.phase==='question'?'Guru akan mengedarkan kad.':s.phase==='closed'?'Guru akan mendedahkan jawapan.':'Pilihan dan taruhan anda telah dikunci.';
    content=`<section class="phone-question"><div class="question-number"><i></i><span>Soalan ${s.questionId} / ${s.questionCount}</span><i></i></div><h1 class="question-text">${escape(s.question.prompt)}</h1><span data-clock class="clock" ${s.phase==='answering'&&s.deadline?'':'hidden'}>${icon('clock')}<span></span></span></section>${attackNotice(s)}${
      s.phase==='reveal'?reveal(s.reveal,s.me.result):
      s.phase==='answering'&&!s.me.submitted?'<div id="play-area"></div>':
      `<div class="waiting">${back(s.me.submitted?'single-card':'mini-deck')}<h2>${s.me.submitted?'Kad telah dimainkan':s.phase==='closed'?'Jawapan ditutup':'Bersedia di meja'}</h2><p class="support">${reason}${s.me.submitted?` Taruhan: ${s.me.actualWager} cip.`:''}</p></div>`}`;
  }
  return `<article class="play-table" data-phase="${s.phase}">${hud}${content}</article>`;
}
export function reviewView(r,s) {
  return `<div class="review-detail"><label>Soalan<select id="review-question">${s.history.map(id=>`<option value="${id}" ${r.question.id===id?'selected':''}>Soalan ${id}</option>`).join('')}</select></label><h3>${escape(r.question.prompt)}</h3>${reveal(r)}<p><b>Rujukan komik</b> · ${escape(r.reference)}</p><p>${r.correct} betul · ${r.incorrect} salah · ${r.unanswered} tidak dijawab</p><div class="table-scroll"><table><thead><tr>${['Pasukan','Pilihan','Asal','Sebenar','Perubahan cip','Keputusan','Sabotaj'].map(x=>`<th>${x}</th>`).join('')}</tr></thead><tbody>${r.entries.map(e=>`<tr><td class="team-name">${escape(e.name)}</td><td>${escape(e.caption??'—')}</td><td>${e.baseWager??'—'}</td><td>${e.actualWager}</td><td>${signed(e.delta)}</td><td>${outcomes[e.outcome]}</td><td>${e.attack?(powers[e.attack.card].name+(e.attack.blocked?' (dihalang)':e.attack.refunded?' (dibatalkan)':'')):'—'}</td></tr>`).join('')}</tbody></table></div></div>`;
}

