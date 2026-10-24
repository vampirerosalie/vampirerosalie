import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync,statSync} from 'node:fs';
import vm from 'node:vm';
import {LOCATION_SCENES,locationScene} from '../../public/battle12/location-scenes.js';

const root=new URL('../../public/battle12/',import.meta.url);
const source=readFileSync(new URL('app.js',root),'utf8');
const css=readFileSync(new URL('pirate-theme.css',root),'utf8');
function fn(name){const start=source.indexOf('function '+name+'('),end=source.indexOf('\nfunction ',start+1);return source.slice(start,end);}
test('illustrated resource counters remain live text, not values baked into images',()=>{
  const html=vm.runInNewContext(fn('resourceBar')+';resourceBar()',{state:{me:{actions:7,bag:13,vault:21}}});
  assert.match(html,/<strong>7<\/strong>/);assert.match(html,/<strong>13<\/strong>/);assert.match(html,/<strong>21<\/strong>/);
  assert.equal((html.match(/alt=""/g)||[]).length,3);
  for(const name of ['compass','backpack','vault'])assert.ok(html.includes(`/assets/ui/${name}.webp`));
});
test('pirate material layer is Battle 12 scoped, with lightweight complete assets and originals',()=>{
  const html=readFileSync(new URL('index.html',root),'utf8');
  assert.match(html,/style\.css\?v=4/);assert.match(html,/pirate-theme\.css\?v=2/);
  let total=0;
  for(const name of ['ship-deck','timber','parchment','compass','backpack','vault']){
    const path=new URL(`assets/ui/${name}.webp`,root),bytes=readFileSync(path);
    assert.equal(bytes.toString('ascii',8,12),'WEBP'); total+=statSync(path).size;
    if(name!=='vault')assert.ok(statSync(new URL(`../../artwork/battle12-ui/source/${name}.png`,import.meta.url)).size>10000);
  }
  assert.ok(total<500000,`New WebP total ${total} must stay below 500 KB`);
  for(const name of ['book','notes','cards'])assert.match(readFileSync(new URL(`assets/ui/${name}.svg`,root),'utf8'),/<svg/);
  assert.match(css,/prefers-reduced-motion:reduce/);
  assert.match(css,/object-fit: contain/);
  assert.match(css,/\.phone \.scroll/);
});
test('reader illustrations fill the card without a height cap, distortion or cropping',()=>{
  const rule=css.match(/\.phone \.book-illustration\s*\{([^}]+)\}/)[1];
  for(const declaration of ['width: 100%','height: auto','max-height: none','object-fit: contain'])assert.ok(rule.includes(declaration));
  assert.doesNotMatch(rule,/clamp|cover/);
});
test('six distinct illustrated destinations provide approved qualitative hints, not reward tables',()=>{
  const ids=['camp','cave','bridge','ruins','temple','harbor'];
  assert.deepEqual(Object.keys(LOCATION_SCENES),ids);
  assert.equal(new Set(ids.map(id=>locationScene(id).src)).size,6);
  for(const id of ids){
    const scene=locationScene(id);
    assert.ok(scene.hint.length>30);assert.ok(scene.alt.length>20);
    assert.doesNotMatch(scene.hint,/\d|%/);
    const bytes=readFileSync(new URL('assets/locations/'+id+'.webp',root));
    assert.equal(bytes.toString('ascii',8,12),'WEBP');assert.ok(bytes.length<250000);
  }
  assert.equal(locationScene('unrelated'),null);
  const preview=source.slice(source.indexOf("if(action==='place')"),source.indexOf("if(action==='bank')"));
  assert.match(preview,/locationScene\(location\)/);assert.match(preview,/scene.hint/);
  assert.match(preview,/1 Action/);assert.doesNotMatch(preview,/island\.png|DECKS|weight|percent/);
});
test('illustrated navigation retains real buttons, labels and original actions',()=>{
  const ctx={state:{me:{name:'TEST reader'}},pin:'12345',screen:'answer',esc:String,ended:()=>false,
    questionView:()=>'<form id="answer-form"><input id="answer"></form>',resourceBar:()=>'',
    btn:(label,action,cls,disabled,attrs)=>`<button data-action="${action}" ${attrs}>${label}</button>`};
  const html=vm.runInNewContext(fn('studentView')+';studentView()',ctx);
  assert.match(html,/id="answer"/);
  for(const name of ['Island','Read','Answer','Cards'])assert.ok(html.includes(`<span>${name}</span>`));
  for(const action of ['voyage','read','answer','cards'])assert.ok(html.includes(`data-action="${action}"`));
  assert.match(html,/data-action="answer" aria-current="page"/);
});
