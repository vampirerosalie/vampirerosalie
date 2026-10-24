import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync,statSync} from 'node:fs';
import vm from 'node:vm';

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
  assert.match(html,/style\.css\?v=4/);assert.match(html,/pirate-theme\.css\?v=1/);
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
