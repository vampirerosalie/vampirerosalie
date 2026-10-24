import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {makeFixtures,renderFixture} from './visual-fixtures.js';
import {OPTIONS,STATIONS} from '../../app/battle11/data.js';
const fixtures=makeFixtures();
test('all student routes and teacher states render with the common museum components',()=>{
  for(const [name,fixture] of Object.entries(fixtures)) {
    const html=renderFixture(fixture);
    assert.match(html,/The Missing Museum Jewel/,name);
    assert.doesNotMatch(html,/undefined|NaN/,name);
  }
});
test('active visit keeps complete before/after paragraph, eight full options, clock and separate action row',()=>{
  const html=renderFixture(fixtures.reading);
  assert.ok(html.includes(STATIONS[1].before));assert.ok(html.includes(STATIONS[1].after));
  for(const [letter,text] of Object.entries(OPTIONS)) {assert.ok(html.includes(text));assert.ok(html.includes('data-letter="'+letter+'"'));}
  assert.match(html,/station-workspace" data-scroll-key="station-reading"/);
  assert.match(html,/<\/details><\/div><div class="station-actions">/);
  assert.match(html,/TIME LEFT/);assert.match(html,/Save Answer/);assert.match(html,/Save &amp; Leave|Save & Leave/);
  assert.doesNotMatch(html,/Correct|Try another option/);
  assert.match(renderFixture(fixtures.options),/not saved yet/);
  assert.match(renderFixture(fixtures.saved),/saved on the server/);
});
test('outside visits no paragraph leaks; overview and receipt show only chosen sentences',()=>{
  for(const name of ['map','scanner','camera-denied','station-full','expired-saved','expired-unsaved','left-station','review','overview','submit-confirmation','receipt','closed']) {
    const html=renderFixture(fixtures[name]);
    for(const p of STATIONS) assert.ok(!html.includes(p.before),name);
  }
  assert.match(renderFixture(fixtures['expired-saved']),/saved answer has been kept/);
  assert.match(renderFixture(fixtures['expired-unsaved']),/No answer was saved/);
  assert.match(renderFixture(fixtures['move-confirmation']),/leave Station 2 unanswered/);
  assert.match(renderFixture(fixtures.receipt),/choices are locked/);
  assert.doesNotMatch(renderFixture(fixtures.receipt),/Your score|Answer E:/);
  assert.match(renderFixture(fixtures.results),/Your score/);
});
test('dark shared surfaces, readable text, two-column map and no overlaid station controls',()=>{
  const css=readFileSync(new URL('../../public/battle11/museum-theme.css',import.meta.url),'utf8');
  assert.match(css,/\.panel,\.paper,\.results,\.modal \{ background:linear-gradient\(135deg,#421522,#290e1a\)/);
  assert.match(css,/grid-template-rows:auto minmax\(0,1fr\) auto/);
  assert.match(css,/\.option-bank \{ max-height:none; overflow:visible/);
  assert.match(css,/font:20px\/1\.65 Georgia/);
  assert.match(css,/font:18px\/1\.5/);
  assert.match(css,/@media\(max-width:390px\).*repeat\(2,minmax\(0,1fr\)\)/);
  assert.match(css,/\.sticky-actions \{ position:static/);
});
