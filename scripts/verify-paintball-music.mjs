import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import { readFile } from 'node:fs/promises';
import { QUESTIONS } from '../app/battle14/questions.js';

const { chromium } = createRequire(import.meta.url)('playwright');
const local = 'http://paintball.test';
const origin = process.argv[2] || local;
const browser = await chromium.launch({ channel:'chrome', args:['--disable-webgl'] });
const types = { js:'text/javascript', css:'text/css', html:'text/html', mp3:'audio/mpeg', webp:'image/webp' };
try {
  for (const role of ['host','team','projector']) {
    const page = await browser.newPage();
    const errors = [];
    page.on('pageerror', e => errors.push(e.message));
    let audioRequests = 0;
    await page.route('**/*', async route => {
      const url = new URL(route.request().url());
      if (url.origin !== origin || !url.pathname.startsWith('/battle14/') || route.request().method() !== 'GET') return route.abort();
      const file = url.pathname.split('/').pop();
      if (file === 'electrodoodle.mp3') audioRequests++;
      if (origin !== local) return route.continue();
      return route.fulfill({body:await readFile(new URL('../public/battle14/'+file,import.meta.url)),contentType:types[file.split('.').pop()]});
    });
    const state = {pin:'12345',role,phase:'quiz',teams:[],round:1,question:QUESTIONS[0],onlineCount:0};
    let socket;
    const sendState = () => socket.send(JSON.stringify({type:'state',state,serverTime:Date.now()}));
    await page.routeWebSocket('**/socket', ws => {
      socket = ws;
      ws.onMessage(raw => {if (JSON.parse(raw).type === 'auth') sendState();});
    });
    await page.addInitScript(role => {
      const storage = role === 'projector' ? sessionStorage : localStorage;
      storage.setItem('paintball:'+role+':12345','browser-fixture');
      window.audioPlayers = [];
      const NativeAudio = window.Audio;
      window.Audio = class extends NativeAudio {
        constructor(...args) { super(...args); window.audioPlayers.push(this); }
      };
    }, role);
    const query = {host:'teacher=1&host',team:'join',projector:'projector'}[role];
    await page.goto(origin+'/battle14/index.html?'+query+'=12345');
    await page.locator('.question-sheet').waitFor();
    assert.equal(audioRequests,0);
    const panel = page.locator('#teacher-music');
    assert.equal(await panel.isVisible(),role==='host');
    if (role==='host') {
      await panel.getByText('Play music').click();
      await page.waitForFunction(()=>window.audioPlayers[0]?.currentTime>0.15);
      const settings=await page.evaluate(()=>{
        const a=window.audioPlayers[0];
        return {volume:a.volume,duration:a.duration,loop:a.loop};
      });
      assert.ok(settings.duration>160 && settings.duration<172);
      assert.equal(settings.loop,true);
      state.phase='shootout';sendState();
      await page.waitForFunction(v=>window.audioPlayers[0].volume>v,settings.volume);
      state.phase='quiz';sendState();
      await page.waitForFunction(v=>window.audioPlayers[0].volume===v,settings.volume);
      await panel.getByText('Mute music').click();
      assert.equal(await page.evaluate(()=>window.audioPlayers[0].paused),true);
      await panel.getByText('Play music').click();
      await page.waitForFunction(()=>!window.audioPlayers[0].paused);
      state.phase='finished';sendState();
      await panel.waitFor({state:'hidden'});
      assert.equal(await page.evaluate(()=>window.audioPlayers.length===1 && window.audioPlayers[0].paused),true);
    }
    assert.deepEqual(errors,[]);
    await page.close();
  }
  console.log('Verified MP3 playback, looping, quiz/shootout volume, teacher mute and finish. Student and projector pages did not request audio.');
} finally { await browser.close(); }
