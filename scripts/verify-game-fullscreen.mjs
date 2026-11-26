import assert from 'node:assert/strict';
import { createRequire } from 'node:module';

// Opens disposable teacher rooms on the local Worker and exercises the buttons inside the games.
const { chromium, webkit, devices } = createRequire(import.meta.url)('playwright');
const base = new URL(process.argv[2] ?? 'http://localhost:4195');
assert.ok(['localhost', '127.0.0.1', '[::1]'].includes(base.hostname));
const engine = process.argv[3] ?? 'webkit';
assert.ok(['chrome', 'webkit'].includes(engine));
const browser = engine === 'chrome' ? await chromium.launch({channel:'chrome'}) : await webkit.launch();
const controlSelector = 'button[data-action="fullscreen"], button[data-act="fullscreen"]';
const exitName = /^exit (game )?full\s?screen$/i;

// A game can replace a toolbar as a room update arrives. Tap the current visible location.
async function press(page, control, tablet) {
  await control.waitFor();
  await control.evaluate(el => el.scrollIntoView({block:'nearest', behavior:'instant'}));
  const box = await control.boundingBox();
  assert.ok(box && box.height && box.width, 'Fullscreen control is hidden');
  const x = box.x + box.width / 2, y = box.y + box.height / 2;
  if (tablet) await page.touchscreen.tap(x, y);
  else await page.mouse.click(x, y);
}

async function assertGameFillsViewport(page) {
  await page.waitForFunction(() => {
    const frame = document.querySelector('iframe.battle7-frame');
    const rect = frame.getBoundingClientRect();
    return Math.abs(rect.top) < 2 && Math.abs(rect.left) < 2
      && Math.abs(rect.width - innerWidth) < 2 && Math.abs(rect.height - innerHeight) < 2
      && document.elementFromPoint(8,8) === frame;
  });
}

async function checkGame(page, battle, tablet) {
  await page.goto(new URL('/?battle=' + battle + '&teacher=1',base).href, {waitUntil:'domcontentloaded'});
  const frame = page.frameLocator('iframe.battle7-frame');
  if (battle >= 12 && tablet) {
    const create = frame.locator('button[data-action="create"], button[data-act="create"]').first();
    await create.click();
    await create.waitFor({state:'hidden'});
  }
  const entry = frame.locator(controlSelector).first();
  await entry.waitFor();
  assert.match(await entry.innerText(), /full\s?screen/i, 'The button should have a visible label');
  await entry.evaluate(() => { window.fullscreenTestRoom = location.href; });

  // Battle 11 also tests using the inner button while the separate yellow toolbar is expanded.
  const outerAlreadyExpanded = tablet && battle === 11;
  if (outerAlreadyExpanded) await page.getByRole('button',{name:'FULL SCREEN',exact:true}).tap();
  await press(page,entry,tablet);
  await assertGameFillsViewport(page);
  if (tablet) {
    assert.equal(await page.locator('.host-topbar').isVisible(), false);
    await frame.locator('body').evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    const exit = frame.getByRole('button',{name:exitName});
    await exit.waitFor();
    assert.ok(await exit.evaluate(el => {
      const rect = el.getBoundingClientRect();
      return rect.height >= 44 && rect.top >= 0 && rect.bottom <= innerHeight + 1
        && el.contains(document.elementFromPoint(rect.x + rect.width / 2,rect.y + rect.height / 2));
    }), 'Exit must remain tappable after scrolling');
    assert.equal(await frame.locator('body').evaluate(() => window.nativeFullscreenRequests),0);
    await press(page,exit,true);
    await page.waitForFunction(() => !document.querySelector('iframe[data-game-fullscreen]'));
  } else {
    assert.ok(await frame.locator('body').evaluate(() => document.fullscreenElement === document.documentElement));
    const labelledExit = frame.getByRole('button',{name:exitName});
    await press(page,await labelledExit.isVisible()?labelledExit:entry,false);
    await page.waitForFunction(() => !document.fullscreenElement);
  }
  assert.ok(await entry.evaluate(() => window.fullscreenTestRoom === location.href), 'The same room and document must survive exit');
  await page.getByRole('button',{name:outerAlreadyExpanded?'EXIT FULL SCREEN':'FULL SCREEN',exact:true}).waitFor();
  if (outerAlreadyExpanded) await page.getByRole('button',{name:'EXIT FULL SCREEN',exact:true}).tap();
  console.log('PASS',engine,tablet?'iPad':'desktop','game-only fullscreen, Battle',battle);
}

let ownedRooms;
let kitchenRoom;
try {
  for (const tablet of [true,false]) {
    const context = await browser.newContext(tablet ? devices['iPad (gen 7) landscape']
      : {viewport:{width:1280,height:800},storageState:ownedRooms});
    try {
      // Crazy Kitchen remembers the teacher's active room in the tab as well as local storage.
      if (kitchenRoom) await context.addInitScript(pin => sessionStorage.setItem('crazy-kitchen:last-host',pin),kitchenRoom);
      await context.addInitScript(() => {
        window.nativeFullscreenRequests = 0;
        for (const method of ['requestFullscreen','webkitRequestFullscreen']) {
          const native = Element.prototype[method];
          if (native) Element.prototype[method] = function(...args) {
            window.nativeFullscreenRequests++;
            return native.apply(this,args);
          };
        }
      });
      const page = await context.newPage();
      page.setDefaultTimeout(20000);
      for (const battle of (tablet ? [7,8,9,10,11,12,13,14,15] : [7,11,15])) {
        await checkGame(page,battle,tablet);
      }
      if (tablet) {
        ownedRooms = await context.storageState();
        kitchenRoom = await page.evaluate(() => sessionStorage.getItem('crazy-kitchen:last-host'));
      }
    } finally { await context.close(); }
  }
} finally { await browser.close(); }
