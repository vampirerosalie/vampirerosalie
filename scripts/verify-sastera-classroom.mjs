import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import jsQR from 'jsqr';

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
const note = message => console.log(engine, message);

async function pageFor(device) {
  const context = await browser.newContext({ ...device });
  const page = await context.newPage();
  page.setDefaultTimeout(20000);
  page.on('pageerror', error => errors.push(error.message));
  page.on('response', res => {
    if (new URL(res.url()).pathname.startsWith('/battle16/art/') && res.status() >= 400) errors.push('Artwork HTTP ' + res.status() + ' ' + res.url());
  });
  return page;
}
const act = (page, key) => page.locator('[data-act="' + key + '"]').first();
async function readyToWrite(page) {
  await page.waitForFunction(() => document.querySelector('.novel-art')?.naturalWidth > 200);
  await act(page, 'next-line').click();
  await act(page, 'next-line').click();
  await page.waitForFunction(() => [...document.querySelectorAll('.scene-option img')].filter(img => img.naturalWidth > 200).length === 2);
  await act(page, 'choice').click();
}
const feedback = 'Nyatakan tempat dan tugas yang dilakukan oleh para pelatih.';
const updated = 'Nilai kerjasama ditunjukkan apabila Zahar dan para pelatih baharu membersihkan kawasan belakang IKM bersama-sama.';

try {
  const host = await pageFor(devices['iPad (gen 7) landscape']);
  const phone = await pageFor(devices[engine === 'chrome' ? 'Pixel 7' : 'iPhone 13']);
  await host.goto(new URL('/?battle=12&teacher=1', base).href);
  await host.getByRole('tab', {name:/BATTLE 16/i}).click();
  const frame = host.frameLocator('iframe[src*="battle16"]');
  await act(frame, 'create').click();
  await frame.locator('[data-set="persoalan"]').waitFor();
  assert.equal(await frame.locator('[data-set]').count(), 3);
  await act(frame, 'fullscreen').click();
  await frame.getByRole('button',{name:'Exit full screen',exact:true}).click();
  await act(frame, 'cards').click();
  const codes = await frame.locator('.qr-code').evaluateAll(images => images.map(i => i.src));
  assert.equal(codes.length,4);
  const links = await Promise.all(codes.map(async url => {
    const {data,info} = await sharp(Buffer.from(await (await fetch(url)).arrayBuffer())).ensureAlpha().raw().toBuffer({resolveWithObject:true});
    return new URL(jsQR(new Uint8ClampedArray(data),info.width,info.height).data);
  }));
  assert.deepEqual(links.map(l=>l.searchParams.get('station')),['1','2','3','4']);
  await act(frame, 'dismiss').click();
  const pin = links[0].searchParams.get('join');
  await host.waitForURL(url => url.searchParams.get('host') === pin);
  await host.reload();
  await frame.locator('[data-set="nilai"]').waitFor();
  await phone.goto(links[0].href);
  await phone.locator('input[name="name"]').fill('Pasukan Delima');
  await phone.getByRole('button',{name:'Sertai bilik'}).click();
  await phone.getByRole('heading',{name:'Menunggu cikgu'}).waitFor();
  await act(frame,'start').click();
  const pub = await pageFor({viewport:{width:1024,height:768}});
  await pub.goto(new URL('/?battle=16&screen='+pin,base).href);
  await pub.getByRole('heading',{name:'Misi sedang berlangsung'}).waitFor();
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
  await phone.getByText(updated,{exact:true}).waitFor();
  note('Paragraph draft, manual marking, return to station, resubmission, final rescan and three unlocked model answers passed.');

  for(const [key,label] of [['pengajaran','Latihan 2'],['persoalan','Latihan 3']]) {
    await act(frame,'reset').click();
    await act(frame,'confirm-reset').click();
    await frame.locator('[data-set="'+key+'"]').click();
    await act(frame,'start').click();
    await frame.getByRole('heading',{name:new RegExp(label)}).waitFor();
    for(const link of links.slice(0,3)) {
      await phone.goto(link.href);
      await readyToWrite(phone);
      assert.equal(await phone.locator('#answer').inputValue(),'');
      assert.ok(await phone.locator('body').evaluate(el=>el.scrollWidth<=innerWidth+1),'Phone horizontally overflows');
    }
  }
  assert.deepEqual(errors,[]);
  note('All nine stations and repeat use of the same four QR cards across the three latihan passed.');
} finally {
  await browser.close();
}
