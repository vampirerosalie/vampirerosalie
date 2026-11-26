import assert from 'node:assert/strict';
import { createRequire } from 'node:module';

// Run against the local classroom Worker. Opening the teacher screens creates local rooms.
const { chromium, webkit, devices } = createRequire(import.meta.url)('playwright');
const base = new URL(process.argv[2] ?? 'http://localhost:4195');
assert.ok(['localhost', '127.0.0.1', '[::1]'].includes(base.hostname));
const engine = process.argv[3] ?? 'webkit';
assert.ok(['chrome', 'webkit'].includes(engine));
const browser = engine === 'chrome' ? await chromium.launch({ channel: 'chrome' }) : await webkit.launch();
const tablet = devices['iPad (gen 7) landscape'];
const desktop = devices['Desktop Safari'];
const onScreen = el => {
  const rect = el.getBoundingClientRect();
  return rect.top >= 0 && rect.bottom <= innerHeight + 1 && rect.right <= innerWidth + 1
    && rect.height >= 44 && el.contains(document.elementFromPoint(rect.x + rect.width / 2, rect.y + rect.height / 2));
};

try {
  for (const isTablet of [true, false]) {
    const options = isTablet ? tablet : {viewport: {width: 1280, height: 800}};
    const context = await browser.newContext(options);
    try {
      // iPad Safari can present the desktop Safari UA while retaining multi-touch.
      if (isTablet) await context.addInitScript(userAgent => {
        Object.defineProperty(navigator, 'platform', {configurable:true, get:()=> 'MacIntel'});
        Object.defineProperty(navigator, 'userAgent', {configurable:true, get:()=>userAgent});
      }, desktop.userAgent);
      await context.addInitScript(() => {
        window.nativeFullscreenRequests = 0;
        for (const method of ['requestFullscreen', 'webkitRequestFullscreen']) {
          const original = Element.prototype[method];
          if (original) Element.prototype[method] = function (...args) {
            window.nativeFullscreenRequests++;
            return original.apply(this, args);
          };
        }
      });
      const page = await context.newPage();
      for (const battle of (isTablet ? [1,2,3,4,6,7,8,9,10,11,12,13,14,15] : [1,11,15])) {
        await page.goto(new URL('/?battle=' + battle + '&teacher=1', base).href, { waitUntil: 'domcontentloaded' });
        const siteHeader = page.locator('.host-topbar');
        const enter = siteHeader.getByRole('button', {name:'FULL SCREEN',exact:true});
        const exit = siteHeader.getByRole('button', {name:'EXIT FULL SCREEN',exact:true});
        await enter.waitFor();
        // A changing DOM or room PIN during a live poll is normal. Replacing an iframe is not.
        await enter.evaluate(() => { window.fullscreenTestFrame = document.querySelector('iframe.battle7-frame'); });
        const nativeSupported = await page.evaluate(() => document.fullscreenEnabled);
        if (isTablet) await enter.tap(); else await enter.click();
        await exit.waitFor();
        if (isTablet) {
          assert.equal(await page.evaluate(() => !!document.fullscreenElement || window.nativeFullscreenRequests > 0), false, 'Safari prompt on Battle '+battle);
          await page.evaluate(() => {
            window.scrollTo(0, document.body.scrollHeight);
            for (const frame of document.querySelectorAll('iframe')) {
              frame.contentWindow?.scrollTo(0, frame.contentDocument?.body?.scrollHeight ?? 0);
            }
            const shell = document.querySelector('.host-shell');
            if (shell) shell.scrollTop = shell.scrollHeight;
          });
          assert.ok(await exit.evaluate(onScreen), 'Exit must remain tappable on Battle '+battle);
          await exit.tap();
        } else {
          if (nativeSupported) assert.equal(await page.evaluate(() => !!document.fullscreenElement), true);
          await exit.click();
        }
        await enter.waitFor();
        assert.ok(await page.evaluate(() => !document.fullscreenElement && document.querySelector('iframe.battle7-frame') === window.fullscreenTestFrame));
        console.log('PASS',engine,isTablet?'iPad':'desktop','teacher fullscreen',battle);
        if (battle < 7) {
          const gameButton = page.locator('.game-fullscreen-button');
          const game = page.locator('.core-game-surface');
          await gameButton.waitFor();
          const session = await siteHeader.locator('.pin-pill strong').innerText();
          if (isTablet) await gameButton.tap(); else await gameButton.click();
          await game.getByRole('button',{name:/^exit full screen$/i}).waitFor();
          assert.ok(await gameButton.evaluate(onScreen), 'The inner exit button must be visible.');
          assert.ok(await game.evaluate(el=>{
            const box=el.getBoundingClientRect();
            return box.top<=1 && box.left<=1 && box.width>=innerWidth-2 && box.height>=innerHeight-2;
          }), 'Only the current game should fill the viewport.');
          if (isTablet) assert.equal(await page.evaluate(()=>window.nativeFullscreenRequests),0);
          if (isTablet) await gameButton.tap(); else await gameButton.click();
          await enter.waitFor();
          if (/^\d{5}$/.test(session)) assert.equal(await siteHeader.locator('.pin-pill strong').innerText(),session);
          console.log('PASS',engine,isTablet?'iPad':'desktop','game-only fullscreen',battle);
        }
      }
      await page.goto(new URL('/grammar-room/battle5.html',base).href);
      assert.equal(await page.getByRole('button',{name:/full\s?screen/i}).count(),0);
      await page.goto(new URL('/grammar-room/index.html',base).href);
      await page.getByRole('button',{name:/^full screen$/i}).waitFor();
      await page.locator('#start-button').click();
      await page.locator('#close-panel').click();
      const gameEnter = page.getByRole('button',{name:/^full screen$/i});
      const gameExit = page.getByRole('button',{name:/^exit full screen$/i});
      if (isTablet) await gameEnter.tap(); else await gameEnter.click();
      await gameExit.waitFor();
      assert.ok(await gameExit.evaluate(onScreen));
      if (isTablet) {
        assert.equal(await page.evaluate(()=>window.nativeFullscreenRequests),0);
        await gameExit.tap();
      } else await gameExit.click();
      await gameEnter.waitFor();
      assert.ok(await page.locator('#start').isHidden());
      console.log('PASS',engine,isTablet?'iPad':'desktop','game-only fullscreen',5);
    } finally { await context.close(); }
  }
} finally { await browser.close(); }
