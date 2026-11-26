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
        const enter = page.getByRole('button', {name:'FULL SCREEN',exact:true});
        const exit = page.getByRole('button', {name:'EXIT FULL SCREEN',exact:true});
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
      }
      if (isTablet) {
        for(const path of ['/grammar-room/battle5.html','/grammar-room/index.html']){
          await page.goto(new URL(path,base).href);
          assert.equal(await page.getByRole('button',{name:/full\s?screen/i}).count(),0);
          assert.equal(await page.evaluate(()=>window.nativeFullscreenRequests),0);
        }
        console.log('PASS Battle 5 continues to use its regular page without a fullscreen control.');
      }
    } finally { await context.close(); }
  }
} finally { await browser.close(); }
