import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import jsQR from 'jsqr';
import { MODEL_ANSWERS } from '../app/battle16/models.js';

// Exercise the real classroom shell, printed QR art, teacher iPad and a team phone.
// node scripts/verify-sastera-classroom.mjs http://localhost:4195 chrome|webkit
const require = createRequire(import.meta.url);
const { chromium, webkit, devices } = require('playwright');
const sharp = createRequire(require.resolve('next/package.json'))('sharp');
const base = new URL(process.argv[2] || 'http://localhost:4195');
assert.ok(['localhost', '127.0.0.1', '[::1]'].includes(base.hostname), 'Use a disposable local room.');
const engine = process.argv[3] || 'chrome';
assert.ok(['chrome', 'webkit'].includes(engine));
const browser = engine === 'chrome' ? await chromium.launch({ channel:'chrome' }) : await webkit.launch();
const errors = [];
const soundtrack = '/battle16/audio/morning.mp3';
const note = message => console.log(engine, message);

async function pageFor(device) {
  const context = await browser.newContext({ ...device });
  await context.addInitScript(() => {
    window.playedMedia = new Set();
    const play = HTMLMediaElement.prototype.play;
    HTMLMediaElement.prototype.play = function(...args) {
      window.playedMedia.add(this);
      return play.apply(this,args);
    };
  });
  const page = await context.newPage();
  page.setDefaultTimeout(20000);
  page.on('pageerror', error => errors.push(error.message));
  page.on('response', res => {
    if (new URL(res.url()).pathname.startsWith('/battle16/art/') && res.status() >= 400) errors.push('Artwork HTTP ' + res.status() + ' ' + res.url());
  });
  return page;
}
const act = (page, key) => page.locator('[data-act="' + key + '"]').first();
async function decodePrintedQR(src) {
  const response = await fetch(src);
  assert.ok(response.ok, 'QR image could not be fetched');
  const {data,info} = await sharp(Buffer.from(await response.arrayBuffer())).ensureAlpha().raw().toBuffer({resolveWithObject:true});
  const scan = jsQR(new Uint8ClampedArray(data), info.width, info.height);
  assert.ok(scan, 'The printed QR image did not decode');
  return new URL(scan.data);
}
async function readStationCards(frame) {
  await act(frame,'cards').click();
  const codes = await frame.locator('.print-sheet .qr-code').evaluateAll(images => images.map(i => i.src));
  assert.equal(codes.length,4);
  const links = await Promise.all(codes.map(decodePrintedQR));
  assert.deepEqual(links.map(l=>l.searchParams.get('station')),['1','2','3','4']);
  for (const link of links) {
    assert.equal(link.origin,base.origin);
    assert.equal(link.searchParams.has('join'),false,'Station card contains a room PIN');
    assert.equal(link.searchParams.has('room'),false,'Station card contains a room PIN');
    assert.ok(link.searchParams.get('code'),'Station card has no station credential');
  }
  await act(frame,'dismiss').click();
  return links;
}
async function register(phone,pin,name) {
  const form = phone.locator('#join-form');
  await form.locator('[name="pin"]').fill(pin);
  await form.locator('[name="name"]').fill(name);
  await form.locator('button[type="submit"]').click();
  await form.waitFor({state:'hidden'});
}
async function readEntrance(frame,pin) {
  const image = frame.locator('img[src$="/rooms/'+pin+'/qr.svg"]').first();
  await image.waitFor();
  const href = await decodePrintedQR(await image.evaluate(img=>img.src));
  assert.equal(href.searchParams.get('join')??href.searchParams.get('room'),pin);
  assert.equal(href.searchParams.has('station'),false);
  return href;
}
// Supply a frame of the actual printed SVG to Chromium's in-game camera decoder.
async function scanPrintedImage(phone,imageSource) {
  await phone.evaluate(async src => {
    const picture = new Image();
    picture.src = src;
    await picture.decode();
    const canvas = document.createElement('canvas');
    canvas.width = canvas.height = 480;
    const brush = canvas.getContext('2d');
    const draw = () => brush.drawImage(picture,0,0,canvas.width,canvas.height);
    draw();
    Object.defineProperty(navigator.mediaDevices,'getUserMedia',{configurable:true,value:async () => {
      const stream = canvas.captureStream(10);
      const timer = setInterval(()=>{if(stream.active)draw();else clearInterval(timer);},100);
      return stream;
    }});
  },imageSource);
  await act(phone,'scanner').click();
  await phone.locator('.portrait-slot.active').waitFor();
  assert.equal(await phone.locator('#overlay').isVisible(),false);
}
async function expectMusic(frame) {
  await frame.waitForFunction(path => [...window.playedMedia].some(audio =>
    audio.loop && !audio.paused && !audio.muted && audio.volume > 0 && audio.currentTime > 0.1 &&
    audio.currentSrc && new URL(audio.currentSrc).pathname === path), soundtrack);
  assert.equal(await frame.evaluate(() => window.playedMedia.size), 1, 'Overlapping classroom tracks');
}
const expectQuiet = frame => frame.waitForFunction(() => [...window.playedMedia].every(audio => audio.paused || audio.muted));
async function pretendHidden(frame, hidden) {
  // Real device visibility events aren't available in Playwright's iPad emulation.
  await frame.evaluate(value => {
    for (const [key, state] of [['hidden',value],['visibilityState',value ? 'hidden' : 'visible']]) {
      if (value) Object.defineProperty(document,key,{value:state, configurable:true});
      else delete document[key];
    }
    document.dispatchEvent(new Event('visibilitychange'));
  },hidden);
}
async function readyToWrite(page) {
  const portrait = page.locator('.portrait-slot.active .speaker-portrait');
  await page.waitForFunction(() => document.querySelector('.portrait-slot.active img')?.naturalWidth > 120);
  const firstSpeaker = await page.locator('.speech .speaker').innerText();
  const firstArt = await portrait.getAttribute('src');
  await act(page, 'next-line').click();
  await page.waitForFunction(() => document.querySelector('.portrait-slot.active img')?.naturalWidth > 120);
  const nextSpeaker = await page.locator('.speech .speaker').innerText();
  if(firstSpeaker !== nextSpeaker) assert.notEqual(await portrait.getAttribute('src'),firstArt,'New speaker should have their own portrait');
  await act(page, 'next-line').click();
  await page.waitForFunction(() => [...document.querySelectorAll('.scene-option img')].filter(img => img.naturalWidth > 200).length === 2);
  const choices = page.locator('button.scene-option');
  const order = await choices.evaluateAll(nodes=>nodes.map(el=>el.dataset.id));
  const unrelatedHeader = await page.locator('.task-page').evaluate(el=>{
    const evidence = new Set([...el.querySelectorAll('.scene-option img')].map(img=>img.currentSrc));
    return [...el.querySelectorAll('header img,.task-art img')].every(img=>!evidence.has(img.currentSrc));
  });
  assert.ok(unrelatedHeader,'The task header reveals a pictured answer');
  await page.reload();
  await choices.first().waitFor();
  assert.deepEqual(await choices.evaluateAll(nodes=>nodes.map(el=>el.dataset.id)),order,'Scene order changed on refresh');
  await act(page, 'choice').click();
}
const feedback = 'Nyatakan tempat dan tugas yang dilakukan oleh para pelatih.';
const updated = 'Nilai kerjasama ditunjukkan apabila Zahar dan para pelatih baharu membersihkan kawasan belakang IKM bersama-sama.';

try {
  const host = await pageFor(devices['iPad (gen 7) landscape']);
  const phone = await pageFor(devices[engine === 'chrome' ? 'Pixel 7' : 'iPhone 13']);
  const studentAudio = [];
  phone.on('request', req => { if(new URL(req.url()).pathname === soundtrack) studentAudio.push(req.url()); });
  await host.goto(new URL('/?battle=12&teacher=1', base).href);
  await host.getByRole('tab', {name:/BATTLE 16/i}).click();
  const frame = host.frameLocator('iframe[src*="battle16"]');
  await act(frame, 'create').click();
  await frame.locator('[data-set="persoalan"]').waitFor();
  await frame.getByRole('link',{name:'Morning · Kevin MacLeod'}).waitFor();
  await frame.getByRole('link',{name:'CC BY 4.0'}).waitFor();
  let gameFrame = host.frames().find(f => new URL(f.url()).pathname.startsWith('/battle16/'));
  await expectMusic(gameFrame);
  await frame.locator('[data-set="persoalan"]').click();
  await frame.locator('[data-set="nilai"]').click();
  await expectMusic(gameFrame);
  await act(frame,'music').click();
  await expectQuiet(gameFrame);
  assert.equal(await frame.locator('[data-set]').count(), 3);
  await act(frame, 'fullscreen').click();
  await frame.getByRole('button',{name:'Exit full screen',exact:true}).click();
  const links = await readStationCards(frame);
  await host.waitForURL(url => /^\d{5}$/.test(url.searchParams.get('host')??''));
  const pin = new URL(host.url()).searchParams.get('host');
  const entrance = await readEntrance(frame,pin);
  await host.reload();
  await frame.locator('[data-set="nilai"]').waitFor();
  gameFrame = host.frames().find(f => new URL(f.url()).pathname.startsWith('/battle16/'));
  await phone.goto(links[0].href);
  assert.equal(await phone.locator('input[name="pin"]').inputValue(),'');
  await register(phone,pin,'Pasukan Delima');
  await phone.getByRole('heading',{name:'Menunggu cikgu'}).waitFor();
  await act(frame,'start').click();
  await frame.getByRole('heading',{name:/Latihan 1/}).waitFor();
  await expectQuiet(gameFrame);
  await act(frame,'music').click();
  await expectMusic(gameFrame);
  await pretendHidden(gameFrame,true);
  await expectQuiet(gameFrame);
  await pretendHidden(gameFrame,false);
  await expectMusic(gameFrame);
  const pub = await host.context().newPage();
  await pub.goto(new URL('/?battle=16&screen='+pin,base).href);
  await pub.getByRole('heading',{name:'Misi sedang berlangsung'}).waitFor();
  await expectQuiet(pub);
  await act(pub,'music').click();
  await expectMusic(pub);
  await expectQuiet(gameFrame);
  await act(pub,'music').click();
  await expectQuiet(pub);
  note('Morning plays on teacher start, survives redraws, remembers mute, pauses when hidden and can be enabled separately on the projector.');
  note('Four printed codes decoded. Same-site teacher, projector, phone join, refresh and game fullscreen passed.');

  for (let n=1; n<=3; n++) {
    if(n>1) await phone.goto(links[n-1].href);
    await readyToWrite(phone);
    const text='Nilai yang ditunjukkan dalam peristiwa ini ialah nilai dalam tugasan '+n+'.';
    await phone.locator('#answer').fill(text);
    if(n===2) {
      await phone.locator('#answer').evaluate(el=>{window.testAnswerField=el;});
      await phone.waitForResponse(r=>new URL(r.url()).pathname.endsWith('/state'));
      assert.ok(await phone.locator('#answer').evaluate(el=>el===window.testAnswerField), 'Polling replaced the active text field');
      await phone.reload();
      assert.equal(await phone.locator('#answer').inputValue(),text);
    }
    await act(phone,'submit').click();
    await phone.getByRole('heading',{name:'Perenggan dihantar'}).waitFor();
  }
  async function mark(n,status) {
    const target=frame.locator('button[data-act="read"][data-station="'+n+'"]');
    await target.click();
    await frame.getByText('Jawapan contoh untuk cikgu',{exact:true}).click();
    await frame.getByText(MODEL_ANSWERS.nilai[n-1],{exact:true}).waitFor();
    if(status==='revise')await frame.locator('#feedback').fill(feedback);
    await frame.locator('[data-act="mark"][data-status="'+status+'"]').click();
    await frame.locator('#overlay').waitFor({state:'hidden'});
  }
  await mark(1,'correct');
  await mark(2,'revise');
  // Station 3 is still unmarked at the first final scan.
  await phone.goto(links[3].href);
  await phone.getByText(feedback,{exact:true}).waitFor();
  await phone.getByText('Menunggu semakan cikgu',{exact:true}).waitFor();
  await mark(3,'correct');
  await phone.goto(links[1].href);
  assert.match(await phone.locator('#answer').inputValue(),/tugasan 2/);
  await phone.locator('#answer').fill(updated);
  await act(phone,'submit').click();
  await phone.getByRole('heading',{name:'Perenggan dihantar'}).waitFor();
  await frame.getByRole('button',{name:'Semak semula'}).waitFor();
  await mark(2,'correct');
  assert.equal(await act(phone,'toggle-compare').count(),0);
  await phone.goto(links[3].href);
  await phone.getByRole('heading',{name:/Tahniah, Pasukan Delima/}).waitFor();
  await act(phone,'toggle-compare').click();
  assert.equal(await phone.locator('.compare').count(),3);
  for(const model of MODEL_ANSWERS.nilai) await phone.getByText(model,{exact:true}).waitFor();
  await phone.getByText(updated,{exact:true}).waitFor();
  note('Paragraph draft, manual marking, return to station, resubmission, final rescan and three unlocked model answers passed.');

  for(const [key,label] of [['pengajaran','Latihan 2'],['persoalan','Latihan 3']]) {
    await act(frame,'reset').click();
    await act(frame,'confirm-reset').click();
    await frame.locator('[data-set="'+key+'"]').click();
    await frame.getByText('Pasukan Delima',{exact:true}).waitFor();
    await act(frame,'start').click();
    await frame.getByRole('heading',{name:new RegExp(label)}).waitFor();
    for(const link of links.slice(0,3)) {
      await phone.goto(link.href);
      await readyToWrite(phone);
      assert.equal(await phone.locator('#answer').inputValue(),'');
      assert.ok(await phone.locator('body').evaluate(el=>el.scrollWidth<=innerWidth+1),'Phone horizontally overflows');
    }
  }
  await phone.locator('#answer').fill('Draf kumpulan sebelum pertukaran nama.');
  await act(frame,'reset').click();
  await act(frame,'reset-teams').click();
  await frame.locator('[data-set="nilai"]').waitFor();
  assert.equal(await frame.getByText('Pasukan Delima',{exact:true}).count(),0,'Reset kept the old team in the roster');
  await phone.locator('#join-form').waitFor();
  assert.equal(await phone.locator('input[name="name"]').inputValue(),'');
  assert.equal(await phone.locator('input[name="pin"]').inputValue(),pin);
  await register(phone,pin,'Pasukan Intan');
  await frame.getByText('Pasukan Intan',{exact:true}).waitFor();
  await act(frame,'start').click();
  await phone.goto(links[3].href);
  await phone.getByText('Perenggan belum dihantar',{exact:true}).first().waitFor();
  assert.equal(await phone.getByText('Perenggan belum dihantar',{exact:true}).count(),3);
  assert.equal(await act(phone,'toggle-compare').count(),0,'Fresh team inherited an unlocked final QR');
  await phone.goto(links[2].href);
  await readyToWrite(phone);
  assert.equal(await phone.locator('#answer').inputValue(),'','New name inherited an old draft');
  await phone.locator('#answer').fill('Draf di dalam bilik pertama.');
  note('Reset can keep the earlier team or ask the same phone for a new name and three fresh paragraphs.');

  await act(frame,'new-room').click();
  await act(frame,'confirm-new').click();
  await host.waitForURL(url=>{
    const next=url.searchParams.get('host');
    return /^\d{5}$/.test(next??'') && next!==pin;
  });
  const nextPin = new URL(host.url()).searchParams.get('host');
  const secondEntrance = await readEntrance(frame,nextPin);
  assert.notEqual(secondEntrance.href,entrance.href);
  const secondPrint = await readStationCards(frame);
  assert.deepEqual(secondPrint.map(url=>url.href),links.map(url=>url.href),'Printed stations changed across rooms');
  await phone.goto(secondEntrance.href);
  await phone.locator('#join-form').waitFor();
  assert.equal(await phone.locator('input[name="pin"]').inputValue(),nextPin);
  await register(phone,nextPin,'Pasukan Melur');
  await frame.getByText('Pasukan Melur',{exact:true}).waitFor();
  assert.equal(await frame.getByText('Pasukan Intan',{exact:true}).count(),0);
  await act(frame,'start').click();
  if(engine==='chrome') {
    await scanPrintedImage(phone,new URL('/api/sastera/stations/1/qr.svg',base).href);
    note('The in-game camera decoded the printed station image in the new room.');
  }
  // The system Camera may open a new tab without the original tab's sessionStorage.
  const cameraTab = await phone.context().newPage();
  await cameraTab.goto(links[2].href);
  const resume = act(cameraTab,'resume-room');
  await resume.waitFor();
  assert.ok((await resume.innerText()).includes(nextPin));
  let releaseScan;
  const scanGate=new Promise(resolve=>{releaseScan=resolve;});
  const scanRoute='**/api/sastera/rooms/*/action';
  await cameraTab.route(scanRoute,async route=>{
    if(route.request().postDataJSON()?.type==='scan')await scanGate;
    await route.continue();
  });
  try {
    await Promise.all([
      cameraTab.waitForRequest(req=>new URL(req.url()).pathname.endsWith('/action') && req.postDataJSON()?.type==='scan'),
      resume.click(),
    ]);
    assert.equal(await cameraTab.getByText('Stesen 1',{exact:true}).isVisible(),false,
      'A pending native Camera scan showed the previous station');
  } finally {releaseScan();}
  await cameraTab.locator('.scene-banner').getByText('Stesen 3',{exact:true}).waitFor();
  await cameraTab.unroute(scanRoute);
  await readyToWrite(cameraTab);
  assert.equal(await cameraTab.locator('#answer').inputValue(),'','First room draft reached the new room');
  await cameraTab.locator('#answer').fill('Perenggan kumpulan di dalam bilik kedua.');
  await act(cameraTab,'submit').click();
  await cameraTab.getByRole('heading',{name:'Perenggan dihantar'}).waitFor();
  await frame.locator('button[data-act="read"][data-station="3"]').click();
  await frame.getByText('Perenggan kumpulan di dalam bilik kedua.',{exact:true}).waitFor();
  await act(frame,'dismiss').click();
  await cameraTab.goto(links[3].href);
  await cameraTab.getByText('Menunggu semakan cikgu',{exact:true}).waitFor();
  assert.equal(await cameraTab.getByText('Perenggan belum dihantar',{exact:true}).count(),2);
  await act(cameraTab,'switch-room').click();
  await register(cameraTab,pin,'Pasukan Intan');
  await cameraTab.goto(links[2].href);
  assert.equal(await cameraTab.locator('#answer').inputValue(),'Draf di dalam bilik pertama.','Changing PIN did not restore the earlier room');
  await cameraTab.close();
  note('The same four printed QR codes work in two rooms. The entrance QR and PIN select the room, and phone drafts and final checks stay with that room.');
  assert.deepEqual(errors,[]);
  assert.equal(await act(phone,'music').count(),0);
  assert.deepEqual(studentAudio,[],'Student phones must stay silent and skip the soundtrack download.');
  note('All nine stations and repeat use of the same four QR cards across the three latihan passed.');
} finally {
  await browser.close();
}
