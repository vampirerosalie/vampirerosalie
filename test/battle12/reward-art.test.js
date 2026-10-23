import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync,existsSync } from 'node:fs';
import vm from 'node:vm';
import { REWARD_ART,rewardArt,artImage } from '../../public/battle12/reward-art.js';

test('confirmed outcomes map to the right individual illustrations, including duplicates and blocked attacks',()=>{
  for(const kind of ['gems','shield','raid','sabotage','trap','bank'])assert.equal(rewardArt({visual:kind}),REWARD_ART[kind]);
  assert.equal(rewardArt({kind:'shield',visual:'duplicate'}).file,'gems.png');
  assert.equal(rewardArt({visual:'blocked'}).file,'shield.png');
  assert.equal(rewardArt({kind:'gems'}).file,'gems.png');
  assert.equal(rewardArt({visual:'unknown'}),null);
  assert.equal(artImage(null),'');
});

test('every illustration is a separate real PNG with accessible fixed asset markup',()=>{
  for(const art of Object.values(REWARD_ART)){
    const path=new URL('../../public/battle12/assets/rewards/'+art.file,import.meta.url);
    assert.ok(existsSync(path),art.file);
    const bytes=readFileSync(path);assert.equal(bytes.subarray(1,4).toString(),'PNG');
    assert.ok(bytes.length>10000);assert.match(artImage(art),/alt=".+"/);
    assert.match(artImage(art),/width="512" height="512"/);
  }
});

test('satchel shows only actually held cards/shield, not potential finds',()=>{
  const src=readFileSync(new URL('../../public/battle12/app.js',import.meta.url),'utf8');
  const fn=src.slice(src.indexOf('function collectedCards('),src.indexOf('\nfunction cards('));
  const render=m=>vm.runInNewContext(fn+';collectedCards(m)',{m,REWARD_ART,artImage,esc:String});
  const empty=render({cards:[],shields:0});assert.doesNotMatch(empty,/<img|raid.png|shield.png/);
  const held=render({cards:['raid'],shields:1});assert.match(held,/raid.png/);assert.match(held,/shield.png/);assert.doesNotMatch(held,/sabotage.png/);
  const preview=src.slice(src.indexOf("if(action==='place')"),src.indexOf("if(action==='bank')"));
  assert.doesNotMatch(preview,/rewardArt|REWARD_ART|assets\/rewards|odds|percent/);
  assert.match(preview,/1 Action/);
});

test('reveal artwork cannot cover the controls and respects reduced motion',()=>{
  const css=readFileSync(new URL('../../public/battle12/style.css',import.meta.url),'utf8');
  assert.match(css,/reward-illustration[^}]*object-fit:contain/);
  assert.match(css,/@media\(prefers-reduced-motion:no-preference\)\{\.reward-dialog/);
  assert.match(css,/dialog\{[^}]*max-height:88dvh/);
});
