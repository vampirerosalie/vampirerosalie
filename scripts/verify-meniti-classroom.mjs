import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import { randomUUID } from 'node:crypto';
import jsQR from 'jsqr';

// Uses the repository's existing browser QA tools (also resolvable via NODE_PATH).
// node scripts/verify-meniti-classroom.mjs http://localhost:4195 chrome|webkit
const require = createRequire(import.meta.url);
const { chromium, webkit, devices } = require('playwright');
const sharp = createRequire(require.resolve('next/package.json'))('sharp');
const base = new URL(process.argv[2] ?? 'http://localhost:4195');
const engine = process.argv[3] ?? 'chrome';
assert.ok(['localhost', '127.0.0.1', '[::1]'].includes(base.hostname), 'Use a local classroom Worker.');
assert.ok(['chrome', 'webkit'].includes(engine), 'Choose chrome or webkit.');
const browser = engine === 'webkit' ? await webkit.launch() : await chromium.launch({ channel: 'chrome' });
const mobile = devices[engine === 'webkit' ? 'iPhone 13' : 'Pixel 7'];
const errors = [];
const failedImages = [];
const studentAudioRequests = [];
let pin, teacherToken;
const action = (page, name) => page.locator('[data-act="' + name + '"]').first();
const cards = page => page.locator('button[data-act="card"]');
const ids = page => cards(page).evaluateAll(nodes => nodes.map(el => el.dataset.card));
const note = message => console.log('PASS ' + message);

async function api(endpoint, key, body) {
  const response = await fetch(new URL('/api/meniti/rooms/' + pin + '/' + endpoint, base), {
    method: body ? 'POST' : 'GET',
    headers: { ...(body ? {'Content-Type':'application/json'} : {}), ...(key ? {Authorization:'Bearer ' + key} : {}) },
    ...(body ? {body:JSON.stringify(body)} : {}),
  });
  const result = await response.json();
  assert.equal(response.status, 200, JSON.stringify(result));
  return result;
}

async function teacherAction(type, values) {
  const { gameId, questionId } = await api('state', teacherToken);
  return api('action', teacherToken, { type:'host:' + type, gameId, questionId, requestId:randomUUID(), ...values });
}

async function newPage(options) {
  const context = await browser.newContext(options);
  await context.addInitScript(() => {
    window.menitiTestMedia = [];
    const play = HTMLMediaElement.prototype.play;
    HTMLMediaElement.prototype.play = function(...args) {
      if (!window.menitiTestMedia.includes(this)) window.menitiTestMedia.push(this);
      return play.apply(this, args);
    };
  });
  const page = await context.newPage();
  page.setDefaultTimeout(25000);
  page.on('pageerror', error => errors.push(error.message));
  page.on('response', response => {
    if (response.url().includes('/battle15/art/') && response.status() >= 400) failedImages.push(response.status());
  });
  return page;
}

async function join(url, name, typePin = false) {
  const page = await newPage(mobile);
  page.on('request', req => {
    if (/\.(mp3|ogg|m4a)(?:[?#]|$)/i.test(req.url())) studentAudioRequests.push(req.url());
  });
  await page.goto(url);
  const form = page.locator('#join-form');
  const code = form.locator('[name=pin]');
  assert.equal(await code.inputValue(), typePin ? '' : pin);
  if (typePin) await code.fill(pin);
  await form.locator('[name=name]').fill(name);
  await form.locator('button').click();
  await page.getByRole('heading', {name,exact:true}).waitFor();
  assert.equal(await page.getByRole('tablist').count(), 0);
  assert.equal(await action(page,'create').count(), 0);
  const key = await page.evaluate(pin => localStorage.getItem('meniti:student:' + pin), pin);
  assert.ok(key);
  return { page, key, name };
}

async function buy(buyer, card, target) {
  const page = buyer.page;
  await page.bringToFront();
  await page.locator('[data-act="power"][data-key="' + card + '"]').tap();
  const form = page.locator('#buy-form');
  await form.locator('select').selectOption({ label:target.name });
  await form.locator('button').tap();
  await form.waitFor({state:'hidden'});
  assert.equal((await api('state',buyer.key)).me.purchase.card, card);
}

async function waitHand(page, count) {
  await page.waitForFunction(n => document.querySelectorAll('button[data-act=card]').length === n, count);
}

async function decodedHand(page) {
  assert.ok(await cards(page).evaluateAll(nodes => nodes.every(node => {
    const img = node.querySelector('img');
    return img?.complete && img.naturalWidth > 0 && node.innerText.trim();
  })), 'Each card has a decoded illustration and caption');
}

async function checkSideSeats(page) {
  const scenery = page.locator('.side-seat-fans[aria-hidden="true"]');
  await scenery.waitFor();
  const rendered = await scenery.evaluate(layer => {
    const box = layer.getBoundingClientRect();
    const fans = [...layer.querySelectorAll('.side-seat-fan')].map(fan => fan.getBoundingClientRect());
    return {
      centers: fans.map(fan => (fan.left + fan.right) / 2).sort((a,b) => a-b),
      middle: (box.left + box.right) / 2,
      intersectsTable: fans.every(fan => fan.width > 0 && fan.height > 0 &&
        fan.right > box.left && fan.left < box.right && fan.bottom > box.top && fan.top < box.bottom),
      passesTaps: [layer, ...layer.querySelectorAll('*')].every(el => getComputedStyle(el).pointerEvents === 'none'),
      controls: layer.querySelectorAll('a,button,input,select,textarea,[tabindex]').length,
    };
  });
  assert.equal(rendered.centers.length,2);
  assert.ok(rendered.centers[0] < rendered.middle && rendered.middle < rendered.centers[1]);
  assert.ok(rendered.intersectsTable && rendered.passesTaps);
  assert.equal(rendered.controls,0);
}

try {
  const host = await newPage({viewport:{width:1440,height:900}});
  const selected = (name) => host.getByRole('tab',{name,selected:true});
  const selectBattle = (name) => host.getByRole('tab',{name}).click();
  const menitiShell = url => url.pathname === '/' && url.searchParams.get('battle') === '15' && url.searchParams.get('teacher') === '1';
  await host.goto(new URL('/?battle=12&teacher=1', base).href);
  await selected(/Treasure Raid/).waitFor();
  await selectBattle(/Meniti Impian/);
  await host.waitForURL(menitiShell);
  await selected(/Meniti Impian/).waitFor();
  const shell = host.locator('header.host-topbar');
  await shell.waitFor();
  const teacher = host.frameLocator('iframe[src*="battle15"]');
  const created = host.waitForResponse(r => new URL(r.url()).pathname === '/api/meniti/rooms' && r.request().method() === 'POST');
  await action(teacher,'create').click();
  ({ pin, hostToken:teacherToken } = await (await created).json());
  const qr = teacher.locator('img[src$="/qr.svg"]').first();
  await qr.waitFor();
  await qr.evaluate(image => image.decode());
  const buffer = await qr.screenshot();
  const png = await sharp(buffer).resize(480,480).ensureAlpha().raw().toBuffer({ resolveWithObject:true });
  const url = jsQR(new Uint8ClampedArray(png.data), png.info.width, png.info.height)?.data;
  assert.equal(url, new URL('/battle15/index.html?join=' + pin, base).href);
  const extra = await join(url, 'Pasukan Emas');
  const flash = await join(new URL('/?battle=15&student=1',base).href, 'Pasukan Zamrud', true);
  const shellPin = shell.locator('.pin-pill strong').filter({hasText:new RegExp('^' + pin + '$')});
  await shellPin.waitFor();
  await shell.locator('.online-pill').filter({hasText:/^2\s/}).waitFor();
  await host.goto(new URL('/battle15/index.html?host=' + pin, base).href);
  await host.waitForURL(menitiShell);
  await selected(/Meniti Impian/).waitFor();
  await host.reload();
  await shellPin.waitFor();
  const screen = await newPage({viewport:{width:1366,height:768}});
  await screen.goto(new URL('/battle15/index.html?screen=' + pin,base).href);
  await action(teacher,'start').click();
  await action(teacher,'deal').waitFor();
  await action(teacher,'music').click();
  const musicPanel = teacher.locator('dialog[open]');
  await musicPanel.getByRole('link',{name:/Backbay Lounge.*Kevin MacLeod/i}).waitFor();
  await musicPanel.getByRole('link',{name:/CC BY 4\.0/}).waitFor();
  const toggle = action(musicPanel,'toggle-music');
  if ((await toggle.innerText()).includes('Mainkan')) await toggle.click();
  await musicPanel.getByRole('button',{name:'Hentikan Muzik'}).waitFor();
  const classroomFrame = host.frames().find(f=>new URL(f.url()).pathname.startsWith('/battle15/'));
  await classroomFrame.waitForFunction(() => window.menitiTestMedia.some(audio=>!audio.paused && audio.currentTime>0 && new URL(audio.currentSrc).pathname==='/battle15/audio/backbay-lounge.mp3'));
  await toggle.click();
  await musicPanel.getByRole('button',{name:'Mainkan Muzik'}).waitFor();
  assert.ok(await classroomFrame.evaluate(()=>window.menitiTestMedia.every(audio=>audio.paused)));
  await action(musicPanel,'dismiss').click();
  note('Teacher controls played and stopped Backbay Lounge, with visible Kevin MacLeod and CC BY 4.0 attribution.');
  await screen.getByRole('heading',{name:/Apakah perabot/}).waitFor();
  assert.equal(await screen.getByText('Rak kasut', {exact:true}).count(),0);
  assert.equal(await cards(screen).count(),0);
  note(engine + ' opened Battle 15 from Battle 12. QR and typed PIN joins populated the shared header; the legacy teacher URL and refresh restored the same room.');

  await action(teacher,'deal').click();
  await action(teacher,'countdown').waitFor();
  await selected(/Meniti Impian/).waitFor();
  await selectBattle(/Treasure Raid/);
  await selected(/Treasure Raid/).waitFor();
  await selectBattle(/Meniti Impian/);
  await host.waitForURL(menitiShell);
  await selected(/Meniti Impian/).waitFor();
  await shellPin.waitFor();
  await host.goBack();
  await selected(/Treasure Raid/).waitFor();
  await host.goForward();
  await selected(/Meniti Impian/).waitFor();
  await shellPin.waitFor();
  const desk = teacher.locator('.controls .tools-row').first();
  const labels = ['Review answers','Start 10-second countdown','Confirm results + reveal'];
  await desk.getByRole('button',{name:labels[0],exact:true}).waitFor();
  assert.deepEqual(await desk.getByRole('button').allTextContents(), labels);
  const roster = teacher.getByRole('region',{name:'Team status'});
  const extraSeat = roster.getByRole('row').filter({hasText:extra.name});
  const flashSeat = roster.getByRole('row').filter({hasText:flash.name});
  await extraSeat.getByText('Waiting',{exact:true}).waitFor();
  await flashSeat.getByText('Waiting',{exact:true}).waitFor();
  assert.equal(await extraSeat.locator('.seat-chips').textContent(),'10');
  await action(teacher,'leaderboard').click();
  await teacher.getByRole('heading',{name:'Papan kedudukan'}).waitFor();
  await extraSeat.getByText('Waiting',{exact:true}).waitFor();
  await action(teacher,'leaderboard').click();
  await teacher.getByRole('heading',{name:/Apakah perabot/}).waitFor();
  assert.equal(await screen.locator('.teacher-roster').count(),0);
  assert.equal(await extra.page.locator('.teacher-roster').count(),0);
  const hints = [];
  extra.page.on('request', req => {
    if (req.method()!=='POST'||!req.url().endsWith('/action')) return;
    const message=req.postDataJSON();
    if (message.type==='student:choosing'&&message.questionId===1) hints.push(message);
  });
  await extra.page.bringToFront();
  await waitHand(extra.page,4);
  await decodedHand(extra.page);
  await checkSideSeats(extra.page);
  const confirm = action(extra.page,'submit');
  assert.ok(!await confirm.isVisible() || await confirm.isDisabled());
  const visible = await ids(extra.page);
  await extra.page.locator('[data-act=wager][data-base="1"]').tap();
  await cards(extra.page).filter({hasText:'Almari pakaian'}).tap();
  await extra.page.locator('[data-act=wager][data-base="3"]').tap();
  await cards(extra.page).filter({hasText:'Rak kasut'}).tap();
  assert.deepEqual(await ids(extra.page),visible);
  await host.bringToFront();
  await extraSeat.getByText('Choosing a card',{exact:true}).waitFor();
  await flashSeat.getByText('Waiting',{exact:true}).waitFor();
  assert.equal(hints.length,1);
  assert.deepEqual(Object.keys(hints[0]).sort(),['gameId','questionId','requestId','type']);
  const beforeSubmission = await api('review?questionId=1',teacherToken);
  assert.ok(beforeSubmission.entries.every(entry=>entry.outcome==='pending'&&entry.caption===null&&entry.baseWager===null&&entry.actualWager===null));
  assert.ok((await api('state')).players.every(p=>!('answerStatus' in p)));
  assert.ok((await api('state',flash.key)).players.every(p=>!('answerStatus' in p)));
  await extra.page.bringToFront();
  await action(extra.page,'submit').tap();
  await action(extra.page,'submit').waitFor({state:'detached'});
  assert.equal((await api('state',extra.key)).me.actualWager,3);
  await extra.page.reload();
  await extra.page.getByText('Kad telah dimainkan',{exact:true}).waitFor();
  await checkSideSeats(extra.page);
  await host.bringToFront();
  await extraSeat.getByText('Submitted',{exact:true}).waitFor();
  await roster.getByText('1/2 submitted',{exact:true}).waitFor();
  assert.equal(await extraSeat.locator('.seat-chips').textContent(),'10');
  await desk.getByRole('button',{name:labels[0],exact:true}).click();
  const review = teacher.locator('dialog[open]');
  await review.locator('[data-live="true"]').waitFor();
  const row = review.getByRole('row').filter({hasText:extra.name});
  const secondRow = review.getByRole('row').filter({hasText:flash.name});
  const answers = async team => (await team.locator('td').allTextContents()).slice(1,6);
  assert.deepEqual(await answers(row), ['Rak kasut','3','3','—','Betul']);
  assert.deepEqual(await answers(secondRow), ['—','—','—','—','Belum menjawab']);
  const privateRound = await api('state');
  assert.equal(privateRound.phase,'answering');
  assert.equal(privateRound.deadline,null);
  assert.equal(privateRound.reveal,null);
  assert.equal(await screen.getByText('Rak kasut',{exact:true}).count(),0);

  await flash.page.bringToFront();
  await waitHand(flash.page,4);
  await flash.page.locator('[data-act=wager][data-base="1"]').tap();
  await cards(flash.page).filter({hasText:'Rak buku'}).tap();
  await action(flash.page,'submit').tap();
  await flash.page.getByText('Kad telah dimainkan',{exact:true}).waitFor();
  await host.bringToFront();
  await action(review,'refresh-review').click();
  await secondRow.getByText('Salah',{exact:true}).waitFor();
  assert.deepEqual(await answers(secondRow), ['Rak buku','1','1','—','Salah']);
  assert.equal((await api('state',extra.key)).me.balance,10);
  assert.equal((await api('state',flash.key)).me.result,null);
  assert.equal((await api('state')).reveal,null);
  await action(review,'dismiss').click();
  await desk.getByRole('button',{name:labels[2],exact:true}).click();
  await screen.getByText('Rak kasut',{exact:true}).waitFor();
  assert.equal((await api('state',extra.key)).me.balance,13);
  assert.equal((await api('state',flash.key)).me.balance,9);
  await extraSeat.locator('.seat-chips').filter({hasText:/^13$/}).waitFor();
  await flashSeat.locator('.seat-chips').filter({hasText:/^9$/}).waitFor();
  await action(teacher,'review').click();
  await review.locator('[data-live="false"]').waitFor();
  assert.deepEqual(await answers(row), ['Rak kasut','3','3','+3','Betul']);
  assert.deepEqual(await answers(secondRow), ['Rak buku','1','1','-1','Salah']);
  await action(review,'dismiss').click();
  note('A second phone submitted during private review. Refresh showed both answers while scores stayed private. One confirmation revealed the answer and settled the +3 and −1 wagers.');

  for (let n = 2; n <= 5; n++) {
    await teacherAction('next'); await teacherAction('deal');
    await teacherAction('close'); await teacherAction('reveal');
  }
  await action(teacher,'open-shop').click();
  await buy(extra,'flash',flash);
  await buy(flash,'extra',extra);
  await host.bringToFront();
  await extraSeat.locator('.seat-chips').filter({hasText:/^6$/}).waitFor();
  await flashSeat.locator('.seat-chips').filter({hasText:/^3$/}).waitFor();
  await action(teacher,'close-shop').click();
  await action(teacher,'next').click();
  await action(teacher,'deal').waitFor();
  await flash.page.bringToFront();
  // Record changes in the rendered card faces even if the host or another phone is active.
  await flash.page.evaluate(() => {
    const events = [];
    window.menitiPreviewEvents = events;
    const sample = () => {
      const hand = [...document.querySelectorAll('button[data-act=card]')];
      if (hand.length !== 4) return;
      const showing = hand.every(el => el.innerText.trim().length > 0);
      if (events.at(-1)?.showing === showing) return;
      const submit = document.querySelector('[data-act=submit]');
      events.push({ showing, time:performance.now(), ids:hand.map(el=>el.dataset.card),
        locked:!submit || submit.disabled || !submit.getClientRects().length, labels:hand.map(el=>el.innerText.trim()) });
    };
    new MutationObserver(sample).observe(document.querySelector('#table'), {childList:true,subtree:true,attributes:true});
  });
  await teacherAction('deal');
  await flash.page.waitForFunction(() => window.menitiPreviewEvents.some(e=>e.showing), null, {polling:50});
  await flash.page.waitForFunction(() => window.menitiPreviewEvents.some(e=>!e.showing), null, {polling:50});
  const preview = await flash.page.evaluate(() => window.menitiPreviewEvents);
  assert.equal(preview[0].showing,true);
  assert.equal(preview[0].locked,true);
  assert.deepEqual(preview[1].ids, preview[0].ids);
  const duration = Math.round(preview[1].time-preview[0].time);
  assert.ok(duration >= 2650 && duration <= 3350, 'Observed preview duration: ' + duration + 'ms');
  const hidden = await api('state',flash.key);
  assert.equal(hidden.me.previewEnd-hidden.me.previewStart,3000);
  assert.ok(hidden.me.hand.every(c=>Object.keys(c).length===1));
  await flash.page.reload();
  await waitHand(flash.page,4);
  assert.deepEqual(await ids(flash.page),preview[0].ids);
  assert.ok((await cards(flash.page).allTextContents()).every(s=>!s.trim()));
  await cards(flash.page).first().tap();
  await flash.page.locator('[data-act=wager][data-base="1"]').tap();
  await action(flash.page,'submit').tap();
  note('Flash Hand displayed all four cards for ' + duration + ' ms. Submission was locked during preview; refresh kept all positions and captions concealed.');

  await extra.page.bringToFront();
  await waitHand(extra.page,5);
  await decodedHand(extra.page);
  await checkSideSeats(extra.page);
  const five = await ids(extra.page);
  const traits = await cards(extra.page).evaluateAll(nodes=>nodes.map(n=>({
    width:n.offsetWidth,height:n.offsetHeight,cls:n.className,
    border:getComputedStyle(n).borderColor,animation:getComputedStyle(n).animationName,
    delay:getComputedStyle(n).animationDelay,
  })));
  for (const item of traits) {
    assert.ok(Math.abs(item.width-traits[0].width)<=1 && Math.abs(item.height-traits[0].height)<=1,'Uniform five-card dimensions ' + JSON.stringify(traits));
    for (const key of ['cls','border','animation','delay']) assert.equal(item[key],traits[0][key]);
  }
  assert.ok(await extra.page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1));
  await extra.page.reload(); await waitHand(extra.page,5);
  assert.deepEqual(await ids(extra.page),five);
  await extra.page.locator('[data-act=wager][data-base="1"]').tap();
  assert.deepEqual(await ids(extra.page),five);
  note('All five answer cards shared dimensions, frame, animation and delay. Reload and wager changes preserved the complete hand.');

  await host.bringToFront();
  const timerButton = desk.getByRole('button',{name:labels[1],exact:true});
  const timerResponse = host.waitForResponse(r => r.url().endsWith('/action') && r.request().method()==='POST' && r.request().postDataJSON()?.type==='host:countdown');
  await timerButton.click();
  const response = await timerResponse;
  assert.equal(response.request().postDataJSON().seconds,10);
  const started = (await response.json()).state;
  assert.ok(started.deadline-started.serverNow > 8000 && started.deadline-started.serverNow <= 10000);
  await timerButton.waitFor({state:'detached'});
  assert.equal((await api('state',teacherToken)).phase,'closed');
  assert.equal((await api('state')).reveal,null);
  assert.deepEqual(await desk.getByRole('button').allTextContents(), [labels[0],labels[2]]);
  await desk.getByRole('button',{name:labels[0],exact:true}).click();
  await review.locator('[data-live="false"]').waitFor();
  await action(review,'dismiss').click();
  await desk.getByRole('button',{name:labels[2],exact:true}).click();
  await action(teacher,'next').waitFor();
  assert.equal((await api('state')).phase,'reveal');
  await action(teacher,'end').click(); await action(teacher.locator('dialog[open]'),'confirmed').click();
  await action(teacher,'new').waitFor();
  assert.equal((await api('state',teacherToken)).phase,'ended');
  assert.deepEqual(failedImages,[]);
  assert.deepEqual(studentAudioRequests,[]);
  for (const {page} of [extra,flash]) {
    assert.equal(await page.locator('[data-act=music]').count(),0);
    assert.ok(await page.evaluate(()=>window.menitiTestMedia.every(el=>el.paused)));
  }
  assert.deepEqual(errors,[]);
  note('Countdown locked the round, teacher ended the room, all requested artwork loaded, and no uncaught browser errors were observed.');
} finally {
  if (pin && teacherToken) {
    const state = await api('state',teacherToken).catch(()=>null);
    if (state && state.phase!=='ended') await teacherAction('end',{confirm:true}).catch(error=>console.error('Test room cleanup failed:',error.message));
  }
  await browser.close();
}
