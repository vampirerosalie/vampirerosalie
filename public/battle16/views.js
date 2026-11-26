import {EXERCISES,HERO_ART} from "./content.js";
const icons={
  book:'<path d="M3 4c3.5-.8 6.3-.2 9 1.5 2.7-1.7 5.5-2.3 9-1.5v14c-3.5-.8-6.3-.2-9 1.5C9.3 17.8 6.5 17.2 3 18zM12 6v13"/>',
  scan:'<path d="M3 8V3h5m8 0h5v5m0 8v5h-5m-8 0H3v-5M4 12h16"/>',
  full:'<path d="M3 9V3h6m6 0h6v6m0 6v6h-6m-6 0H3v-6"/>',
  print:'<path d="M7 8V3h10v5M7 17H3V9h18v8h-4M7 14h10v7H7z"/>',
  screen:'<path d="M2 4h20v13H2zM12 17v4m-5 0h10"/>',
  check:'<path d="m4 12 5 5L20 6"/>',write:'<path d="m4 16 12-12 4 4L8 20l-5 1zM13 7l4 4"/>',
  retry:'<path d="M3 10a9 9 0 1 1 1.7 8M3 4v6h6"/>',close:'<path d="M5 5l14 14m0-14L5 19"/>',
  send:'<path d="m2 11 19-8-6 18-4-7-9-3zM11 14 21 3"/>',clock:'<circle cx="12" cy="12" r="9"/><path d="M12 7v6l3 2"/>',
  group:'<circle cx="9" cy="8" r="3"/><path d="M2 21v-3a7 7 0 0 1 14 0v3M16 5a3 3 0 0 1 0 6m2 3a5 5 0 0 1 4 5"/>'
};
function icon(k){return icons[k]?`<svg class="icon" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24">${icons[k]}</svg>`:'';}
function esc(v){return String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));}
function btn(text,act,opts={}){
 return `<button type="button" class="btn ${opts.cls||''}" data-act="${act}" ${opts.attrs||''}>${icon(opts.icon)}${esc(text)}</button>`;
}
function art(src,cls='',alt=''){return `<img class="${cls}" src="${esc(src)}" alt="${esc(alt)}" draggable="false">`;}
function paperK(t){return `<p class="kicker">${esc(t)}</p>`;}
const stateNames={empty:'Belum dihantar',pending:'Menunggu semakan',correct:'Betul',revise:'Perlu dibaiki'};
function shortTitle(set){return `${set.title} · ${set.label}`;}
function allSets(){return Object.entries(EXERCISES);}
function scene(set,st,id){return set.stations[st-1]?.choices.find(c=>c.id===id);}
function poster(content,cls='',image=HERO_ART){return `<section class="poster ${cls}">${art(image,'poster-art')}<div class="poster-content">${content}</div></section>`;}
function welcome(role,pin,name){
 const host=role==='host';
 return `<div class="welcome">${poster(`${paperK('Novel Tingkatan 2 · Osman Ayob')}<h1>Meniti Impian</h1><span class="chapter">Misi 10 Markah</span>`,'welcome-art')}<section class="paper entry"><div class="ink-rule"></div>${paperK(host?'Paparan cikgu':'Pasukan anda')}<h2>${host?'Bilik latihan':'Sertai misi'}</h2>${host?btn('Cipta bilik','create',{cls:'gold',icon:'book'}):`<form id="join-form"><label>PIN bilik<input name="pin" required pattern="[0-9]{5}" maxlength="5" inputmode="numeric" value="${esc(pin)}" placeholder="5 digit"></label><label>Nama pasukan<input name="name" required maxlength="28" autocomplete="off" value="${esc(name)}" placeholder="Nama pasukan anda"></label><button class="btn gold" type="submit">${icon('book')}Sertai bilik</button></form>`}</section></div>`;
}
function publicView(s){
 const set=EXERCISES[s.setId]??allSets()[0][1],active=s.phase==='playing';
 return `<div class="public-page">${poster(`${paperK('Paparan kelas · PIN '+s.pin)}<h1>Meniti Impian</h1><p class="chapter">${esc(active?shortTitle(set):'Misi 10 Markah')}</p>`,'public-hero',active?set.cover:HERO_ART)}<section class="paper public-info">${paperK('Misi kelas')}<h2>${s.winnerCount?`${s.winnerCount} pasukan berjaya`:active?'Misi sedang berlangsung':'Menunggu cikgu'}</h2><p>${Number(s.teamCount)||0} pasukan menyertai bilik.</p>${s.winners?.length?`<div class="winner-list">${s.winners.map(w=>`<span>${icon('check')}${esc(w.name)}</span>`).join('')}</div>`:''}<p>${active?'Imbas QR di setiap stesen. Setelah tiga perenggan dihantar, imbas QR 4.':'Sediakan pasukan dan imbas kod di stesen pertama anda.'}</p></section></div>`;
}
function chooseSet(id){
 return `<div class="exercise-grid">${allSets().map(([key,set])=>`<button class="exercise ${id===key?'selected':''}" type="button" data-act="set" data-set="${key}" aria-pressed="${id===key}"><span class="exercise-cover">${art(set.cover)}<span class="exercise-caption"><small>${esc(set.title)}</small><b>${esc(set.label)}</b></span></span><span class="exercise-list">${set.stations.map(st=>`<span><i>${st.number}</i>${esc(st.title)}</span>`).join('')}</span>${id===key?`<span class="tick">${icon('check')}</span>`:''}</button>`).join('')}</div>`;
}
function hostTools(s){
 return `<div class="room-tools">${btn('Kad QR stesen','cards',{icon:'print'})}<a class="btn" target="_blank" rel="noopener" href="/battle16/?screen=${s.pin}">${icon('screen')}Paparan kelas</a>${s.phase==='playing'?btn('Tukar latihan','reset',{icon:'retry'}):''}${btn('Bilik baharu','new-room',{icon:'group'})}</div>`;
}
function roster(s,playing){
 return `<section class="paper roster">${paperK('Meja cikgu')}<div class="section-head"><h2>${playing?'Semakan perenggan':'Pasukan dalam bilik'}</h2><span>${s.teamCount} pasukan</span></div>${s.teams.length?`<div class="table-scroll"><table><thead><tr><th>Pasukan</th>${playing?'<th>Stesen 1</th><th>Stesen 2</th><th>Stesen 3</th>':'<th>Status</th>'}</tr></thead><tbody>${s.teams.map(t=>`<tr><th scope="row"><span>${esc(t.name)}</span>${playing?`<small>${t.won?'Berjaya':t.online?'Dalam talian':'Luar talian'}</small>`:''}</th>${playing?t.entries.map(e=>`<td><button type="button" class="entry-status ${e.status}" data-act="read" data-team="${esc(t.id)}" data-station="${e.station}" ${e.status==='empty'?'disabled':''}>${icon({pending:'clock',correct:'check',revise:'retry',empty:'write'}[e.status])}${e.status==='pending'?(e.revision>1?'Semak semula':'Semak'):esc(stateNames[e.status])}</button></td>`).join(''):`<td>${t.online?'Dalam talian':'Luar talian'}</td>`}</tr>`).join('')}</tbody></table></div>`:`<p class="empty">${icon('group')}Menunggu pasukan mengimbas kod QR stesen.</p>`}</section>`;
}
function teacher(s,chosen){
 const play=s.phase==='playing',set=EXERCISES[play?s.setId:chosen]??allSets()[0][1];
 return `<div class="desk">${poster(`${paperK('Bilik '+s.pin+' · Paparan cikgu')}<h1>${play?esc(shortTitle(set)):'Meniti Impian'}</h1><p class="chapter">${play?'Misi sedang berlangsung':'Misi 10 Markah'}</p>`,'desk-hero',play?set.cover:HERO_ART)}
 ${!play?`<section class="paper set-picker">${paperK('Tiga stesen · Tiga perenggan')}<h2>Pilih latihan</h2>${chooseSet(chosen)}<div class="set-footer"><span>${esc(shortTitle(set))}</span>${btn('Mulakan latihan','start',{cls:'gold',icon:'book'})}</div></section>`:''}
 ${hostTools(s)}${roster(s,play)}</div>`;
}
function review(s,teamId,n){
 const team=s.teams.find(t=>t.id===teamId),entry=team?.entries[n-1];if(!entry||entry.status==='empty')return '';
 const set=EXERCISES[s.setId],story=scene(set,n,entry.sceneId);
 return `<div class="modal-head"><div>${paperK(`Stesen ${n} · ${team.name}`)}<h2 id="overlay-title">Semakan cikgu</h2></div>${btn('Tutup','dismiss',{cls:'soft'})}</div><p class="review-prompt">${esc(set.stations[n-1].prompt)}</p>${story?`<div class="review-scene">${art(story.image)}<span>${esc(story.caption)}</span></div>`:''}<h3>Jawapan pasukan</h3><blockquote>${esc(entry.text)}</blockquote><details class="sample"><summary>Jawapan contoh untuk cikgu</summary><p>${esc(s.models?.[n-1])}</p></details>${entry.status==='pending'?`<label for="feedback">Maklum balas cikgu</label><textarea id="feedback" maxlength="320" rows="3" placeholder="Nyatakan perkara yang perlu dibaiki."></textarea><div class="mark-actions">${btn('Perlu dibaiki','mark',{cls:'revise',icon:'retry',attrs:'data-status="revise"'})}${btn('Betul','mark',{cls:'gold',icon:'check',attrs:'data-status="correct"'})}</div>`:`<h3>${esc(stateNames[entry.status])}</h3>${entry.feedback?`<p>${esc(entry.feedback)}</p>`:''}`}`;
}
function cards(s){
 return `<div class="cards-head"><div>${paperK('Bilik '+s.pin)}<h1 id="overlay-title">Kad QR stesen</h1><p>Gunakan empat kad ini untuk ketiga-tiga latihan dalam bilik ini.</p></div><div>${btn('Cetak empat kad','print',{cls:'gold',icon:'print'})} ${btn('Tutup','dismiss',{cls:'soft'})}</div></div><section class="print-sheet">${s.stationLinks.map(l=>`<article class="qr-card"><div>${paperK('Meniti Impian · Bilik '+s.pin)}<h2>${l.station===4?'QR 4 · Semakan akhir':`Stesen ${l.station}`}</h2></div><img src="${esc(l.qrUrl)}" alt="Kod QR stesen ${l.station}" class="qr-code"><p>${l.station===4?'Imbas untuk menerima keputusan cikgu.':'Imbas untuk menulis atau membaiki perenggan.'}</p></article>`).join('')}</section>`;
}
function resetPanel(){return `<h2 id="overlay-title">Mulakan latihan lain?</h2><p>Jawapan dan keputusan latihan ini akan dikosongkan. Pasukan dan empat kad QR bilik ini boleh digunakan semula.</p><div class="mark-actions">${btn('Kekalkan latihan','dismiss',{cls:'soft'})}${btn('Kembali ke pilihan latihan','confirm-reset',{cls:'gold'})}</div>`;}
function scanner(){return `<div class="modal-head"><h2 id="overlay-title">Imbas kod stesen</h2>${btn('Tutup','dismiss',{cls:'soft'})}</div><div class="scanner-frame"><video playsinline muted autoplay></video></div><p id="cam-status" role="status">Halakan kamera ke kod QR di stesen.</p>`;}
function stampProgress(me){
 return `<div class="stamps">${me.entries.map(e=>`<span class="stamp ${e.status}">${e.status!=='empty'?icon(e.status==='revise'?'retry':'check'):''} Stesen ${e.station}</span>`).join('')}</div>`;
}
function studentMap(s,set){
 return `<div class="student-home">${poster(`${paperK(s.me.name)}<h1>${esc(s.phase==='playing'?shortTitle(set):'Meniti Impian')}</h1>`,'student-cover',s.phase==='playing'?set.cover:HERO_ART)}<div class="paper student-note">${paperK('PIN '+s.pin)}<h2>${s.phase==='playing'?'Imbas kod di stesen':'Menunggu cikgu'}</h2><p>${s.phase==='playing'?'Gunakan kamera untuk membuka kod QR di stesen anda.':'Latihan akan dibuka apabila cikgu memulakannya.'}</p>${s.phase==='playing'?`${stampProgress(s.me)}${btn('Imbas QR stesen','scanner',{cls:'gold wide',icon:'scan'})}`:''}</div></div>`;
}
function studentRound(s,ui){
 const set=EXERCISES[s.setId]??allSets()[0][1],me=s.me;
 if(s.phase!=='playing')return studentMap(s,set);
 if(me.won||me.activeStation===4)return finalView(s,set,ui.compare);
 const n=me.activeStation;
 if(!n)return studentMap(s,set);
 const st=set.stations[n-1],entry=me.entries[n-1];
 const heading=`<div class="chapter-nav"><span>${icon('book')}${esc(me.name)}</span><span>${esc(set.title)} · Stesen ${n}/3</span></div>`;
 if(entry.status==='pending'||entry.status==='correct')return `${heading}<div class="student-home">${poster(`${paperK('Stesen '+n)}<h1>${entry.status==='correct'?'Perenggan diluluskan':'Perenggan dihantar'}</h1>`,'student-cover',st.opening)}<div class="paper student-note">${stampProgress(me)}<p>${me.entries.every(e=>e.status!=='empty')?'Tiga perenggan telah dihantar. Pergi ke QR 4 untuk semakan akhir.':'Teruskan ke stesen lain dan imbas kod QR yang dipamerkan.'}</p>${btn('Imbas QR seterusnya','scanner',{cls:'gold wide',icon:'scan'})}</div></div>`;
 if(ui.step==='write'||ui.step==='choice'){
  const current=st.choices.find(c=>c.id===ui.sceneId);
  return `${heading}<div class="task-page">${poster(`${paperK('Stesen '+n+' · '+st.title)}<h1>${ui.step==='write'?'Tulis satu perenggan':'Pilih peristiwa'}</h1>`,'task-art',st.opening)}<section class="paper task-sheet"><p class="prompt">${esc(st.prompt)}</p>${entry.status==='revise'?`<aside class="teacher-note"><b>Maklum balas cikgu</b><p>${esc(entry.feedback)}</p></aside>`:''}
  ${ui.step==='choice'?`<div class="scene-options">${st.choices.map(c=>`<button type="button" data-act="choice" data-id="${esc(c.id)}" class="scene-option">${art(c.image,'',c.caption)}<span>${esc(c.caption)}</span></button>`).join('')}</div>`:`${current?`<div class="selected-scene">${art(current.image)}<span>${esc(current.caption)}</span>${btn('Tukar','choose-again',{cls:'soft'})}</div>`:''}<form id="answer-form"><label for="answer">Jawapan pasukan</label><textarea id="answer" required maxlength="800" rows="5" placeholder="Tulis isi dahulu, kemudian contoh peristiwa."></textarea><div class="submit-row"><small>${esc(st.hint||'Satu isi dan satu contoh peristiwa.')}</small><button type="submit" class="btn gold" data-act="submit">${icon('send')}${entry.revision?'Hantar semula':'Hantar kepada cikgu'}</button></div></form>`}</section></div>`;
 }
 const line=st.dialogue[Math.min(ui.beat,st.dialogue.length-1)];
 return `${heading}<article class="visual-novel" style="--opening:url('${esc(st.opening)}')">${art(st.opening,'novel-art')}<div class="scene-banner">${paperK('Stesen '+n)}<h1>${esc(st.title)}</h1></div><div class="conversation"><div class="speech"><span class="speaker">${esc(line.speaker)}</span><p>${esc(line.text)}</p></div>${btn(ui.beat>=st.dialogue.length-1?'Mulakan tugasan':'Teruskan','next-line',{cls:'gold'})}</div></article>`;
}
function finalView(s,set,compare){
 const me=s.me,won=me.won;
 if(won&&compare)return `<div class="model-page">${paperK('Jawapan contoh · '+set.title)}<h1>Bandingkan perenggan</h1>${me.entries.map((e,i)=>`<article class="paper compare"><h2>${esc(set.stations[i].title)}</h2><div><section><h3>Jawapan pasukan</h3><p>${esc(e.text)}</p></section><section><h3>Jawapan contoh</h3><p>${esc(me.models?.[i])}</p></section></div></article>`).join('')}${btn('Kembali ke keputusan','toggle-compare',{cls:'gold'})}</div>`;
 const rows=me.check?.items??me.entries;
 return `<div class="student-home final-page">${poster(`${paperK('QR 4 · Semakan akhir')}<h1>${won?'Tahniah, '+esc(me.name)+'!':'Semakan pasukan'}</h1><p class="chapter">${won?'3 daripada 3 betul':esc(me.name)}</p>`,'student-cover',won?'/battle16/art/completion.webp':set.cover)}<section class="paper student-note">${won?`<h2>Misi berjaya</h2>${btn('Bandingkan dengan jawapan contoh','toggle-compare',{cls:'gold wide',icon:'book'})}`:`<div class="checklist">${rows.map(e=>`<article class="${e.status}"><div>${paperK('Stesen '+e.station)}<b>${esc(e.status==='revise'?`Kembali ke Stesen ${e.station}`:e.status==='empty'?'Perenggan belum dihantar':e.status==='pending'?'Menunggu semakan cikgu':'Betul')}</b></div>${e.feedback?`<p>${esc(e.feedback)}</p>`:''}</article>`).join('')}</div><p>Pergi ke stesen yang perlu dibaiki. Imbas QR 4 sekali lagi selepas semakan cikgu.</p>${btn('Imbas kod QR','scanner',{cls:'gold wide',icon:'scan'})}`}</section></div>`;
}
export {btn,esc,icon,welcome,publicView,teacher,review,cards,resetPanel,scanner,studentRound};
