// Local-only visual fixtures: no multiplayer claims or student shortcuts.
// Not part of public assets/build, and listens only on loopback.
import http from 'node:http';
import {readFile} from 'node:fs/promises';
import {makeFixtures,renderFixture} from '../test/battle11/visual-fixtures.js';
const fixtures=makeFixtures();
const files=new URL('../public/',import.meta.url);
const nav=Object.keys(fixtures).map(name=>'<a href="/preview/'+name+'">'+name+'</a>').join(' · ');
http.createServer(async(req,res)=>{
  const path=new URL(req.url,'http://localhost').pathname;
  if(path==='/') {res.setHeader('Content-Type','text/html');res.end('<h1>LOCAL DESIGN FIXTURES — NOT A LIVE GAME</h1>'+nav);return;}
  if(path.startsWith('/preview/')) {
    const f=fixtures[path.slice(9)];if(!f){res.writeHead(404).end();return;}
    res.setHeader('Content-Type','text/html');
    res.end('<!doctype html><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><base href="/battle11/"><link rel="stylesheet" href="styles.css"><link rel="stylesheet" href="museum-theme.css"><title>LOCAL DESIGN FIXTURE</title><div id="app" class="shell '+(f.mode==='host'?'teacher':'phone')+'">'+renderFixture(f)+'</div><script>document.querySelector("#app").style.setProperty("--header-height",document.querySelector(".topbar").offsetHeight+"px");</script>');
    return;
  }
  // Only serve this game's static visual assets, not arbitrary workspace files.
  if(!/^\/battle11\/(?:styles\.css|museum-theme\.css|assets\/[\w./-]+)$/.test(path)||path.includes('..')) {res.writeHead(404).end();return;}
  try {const data=await readFile(new URL('.'+path,files));res.setHeader('Content-Type',path.endsWith('.css')?'text/css':path.endsWith('.webp')?'image/webp':'image/png');res.end(data);}
  catch {res.writeHead(404).end();}
}).listen(3019,'127.0.0.1',()=>console.log('Local-only layout gallery: http://127.0.0.1:3019'));
