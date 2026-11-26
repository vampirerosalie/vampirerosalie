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

async function join(url, name) {
  const page = await newPage(mobile);
  page.on('request', req => {
    if (/\.(mp3|ogg|m4a)(?:[?#]|$)/i.test(req.url())) studentAudioRequests.push(req.url());
  });
  await page.goto(url);
  const form = page.locator('#join-form');
  assert.equal(await form.locator('[name=pin]').inputValue(), pin);
  await form.locator('[name=name]').fill(name);
  await form.locator('button').click();
  await page.getByRole('heading', {name,exact:true}).waitFor();
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

try {
  const host = await newPage({viewport:{width:1440,height:900}});
  await host.goto(new URL('/?battle=15&teacher=1', base).href);
  const teacher = host.frameLocator('iframe[src*="battle15"]');
  const created = host.waitForResponse(r => new URL(r.url()).pathname === '/api/meniti/rooms' && r.request().method() === 'POST');
  await action(teacher,'create').click();
  ({ pin, hostToken:teacherToken } = await (await created).json());
  const qr = teacher.locator('img[src$="/qr.svg"]').first();
  await qr.waitFor();
  const buffer = await qr.screenshot();
  const png = await sharp(buffer).resize(480,480).ensureAlpha().raw().toBuffer({ resolveWithObject:true });
  const url = jsQR(new Uint8ClampedArray(png.data), png.info.width, png.info.height)?.data;
  assert.equal(url, new URL('/battle15/index.html?join=' + pin, base).href);
  const extra = await join(url, 'Pasukan Emas');
  const flash = await join(url, 'Pasukan Zamrud');
  const screen = await newPage({viewport:{width:1366,height:768}});
  await screen.goto(new URL('/battle15/index.html?screen=' + pin,base).href);
  await action(teacher,'start').click();
  await action(teacher,'deal').waitFor();
  await action(teacher,'music').click();
  const musicPanel = teacher.locator('dialog[open]');
  await musicPanel.getByRole('link',{name:/Kevin MacLeod/}).waitFor();
  await musicPanel.getByRole('link',{name:/CC BY 4\.0/}).waitFor();
  const toggle = action(musicPanel,'toggle-music');
  if ((await toggle.innerText()).includes('Mainkan')) await toggle.click();
  await musicPanel.getByRole('button',{name:'Hentikan Muzik'}).waitFor();
  const classroomFrame = host.frames().find(f=>new URL(f.url()).pathname.startsWith('/battle15/'));
  await classroomFrame.waitForFunction(() => window.menitiTestMedia.some(audio=>!audio.paused && audio.currentTime>0));
  await toggle.click();
  await musicPanel.getByRole('button',{name:'Mainkan Muzik'}).waitFor();
  assert.ok(await classroomFrame.evaluate(()=>window.menitiTestMedia.every(audio=>audio.paused)));
  await action(musicPanel,'dismiss').click();
  note('Teacher music played and stopped using the room controls, with visible Kevin MacLeod and CC BY 4.0 attribution.');
  await screen.getByRole('heading',{name:/Apakah perabot/}).waitFor();
  assert.equal(await screen.getByText('Rak kasut', {exact:true}).count(),0);
  assert.equal(await cards(screen).count(),0);
  note(engine + ' started Battle 15 inside the shell; the rendered QR admitted two mobile teams and a separate classroom display.');

  await action(teacher,'deal').click();
  await extra.page.bringToFront();
  await waitHand(extra.page,4);
  await decodedHand(extra.page);
  const confirm = action(extra.page,'submit');
  assert.ok(!await confirm.isVisible() || await confirm.isDisabled());
  const visible = await ids(extra.page);
  await extra.page.locator('[data-act=wager][data-base="1"]').tap();
  await cards(extra.page).filter({hasText:'Almari pakaian'}).tap();
  await extra.page.locator('[data-act=wager][data-base="3"]').tap();
  await cards(extra.page).filter({hasText:'Rak kasut'}).tap();
  assert.deepEqual(await ids(extra.page),visible);
  await action(extra.page,'submit').tap();
  await action(extra.page,'submit').waitFor({state:'detached'});
  assert.equal((await api('state',extra.key)).me.actualWager,3);
  await extra.page.reload();
  await extra.page.getByText('Kad telah dimainkan',{exact:true}).waitFor();
  await action(teacher,'close-answer').click();
  await action(teacher,'review').click();
  const review = teacher.locator('dialog[open]');
  await review.getByText('Rak kasut',{exact:true}).first().waitFor();
  const row = review.getByRole('row').filter({hasText:extra.name});
  const values = await row.locator('td').allTextContents();
  assert.deepEqual(values.slice(1,6), ['Rak kasut','3','3','+3','Betul']);
  assert.equal(await screen.getByText('Rak kasut',{exact:true}).count(),0);
  await action(review,'dismiss').click();
  await action(teacher,'reveal').click();
  await screen.getByText('Rak kasut',{exact:true}).waitFor();
  assert.equal((await api('state',extra.key)).me.balance,13);
  note('Changing a wager and card before confirmation kept the hand stable. Reload preserved the lock; private review and public reveal awarded exactly 3 chips.');

  for (let n = 2; n <= 5; n++) {
    await teacherAction('next'); await teacherAction('deal');
    await teacherAction('close'); await teacherAction('reveal');
  }
  await action(teacher,'open-shop').click();
  await buy(extra,'flash',flash);
  await buy(flash,'extra',extra);
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

  await teacher.locator('#seconds').selectOption('5');
  await action(teacher,'countdown').click();
  await action(teacher,'review').waitFor();
  assert.equal((await api('state',teacherToken)).phase,'closed');
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
