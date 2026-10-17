// Creates and finishes two isolated QA rooms. Never opens or modifies user rooms.
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {randomUUID} from 'node:crypto';
const base=process.argv[2]||'https://grammartest.grammarclassroom.workers.dev';
const bank=JSON.parse(readFileSync(new URL('../app/battle9/data/questions.json',import.meta.url)));
const lots=JSON.parse(readFileSync(new URL('../app/battle9/data/lots.json',import.meta.url)));
const page=await fetch(base+'/battle9/index.html');assert.equal(page.status,200);
assert.match(await page.text(),/app.js\?v=auction-order-1/,'Updated frontend not deployed yet');
const asset=await fetch(base+'/battle9/app.js?v=auction-order-1');
assert.equal(await asset.text(),readFileSync(new URL('../public/battle9/app.js',import.meta.url),'utf8'));
async function api(path,token,body){
  const r=await fetch(base+'/api/market/rooms'+path,{method:body?'POST':'GET',headers:{...(token?{Authorization:'Bearer '+token}:{}),...(body?{'Content-Type':'application/json'}:{})},body:body?JSON.stringify(body):undefined,signal:AbortSignal.timeout(20000)});
  const data=await r.json();assert.ok(r.ok,data.error||String(r.status));return data;
}
const orders=[];
for(let game=1;game<=2;game++){
  const host=await api('','',{roomName:'QA auction randomization '+game}),teams=[],clients=[];
  const state=token=>api('/'+host.pin+'/state',token);
  const action=(token,type,extra={},requestId=randomUUID())=>api('/'+host.pin+'/action',token,{type,requestId,...extra});
  let finished=false;
  try{
    assert.equal((await state(host.hostToken)).teamCount,40);
    const qr=await fetch(base+'/api/market/rooms/'+host.pin+'/qr.svg');assert.equal(qr.status,200);assert.match(await qr.text(),/<svg/);
    for(const slot of [1,40]){const client={clientId:randomUUID(),teamSlot:slot,name:'QA bidder '+slot};clients.push(client);teams.push(await api('/'+host.pin+'/join','',client));}
    await action(host.hostToken,'host:start');
    const order=[];
    for(let q=1;q<=25;q++){
      const source=bank[q-1],answer=source.type==='order'?{order:q===7?[4,0,2,3,1]:[1,0,4,2,3,5]}:{answer:source.correct};
      await Promise.all(teams.map(t=>action(t.teamToken,'pupil:submit',{questionId:q,...answer})));
      let view=await state(host.hostToken);assert.ok(view.reviews.every(r=>r.decision==='accepted'));
      assert.equal((await state(teams[0].teamToken)).me.submission.status,'submitted');
      await action(host.hostToken,'host:confirm',{questionId:q});
      if(q%2!==0&&q!==25){await action(host.hostToken,'host:advance',{questionId:q});continue;}
      const receipt=randomUUID();view=(await action(host.hostToken,'host:open-auction',{questionId:q},receipt)).state;
      const a=view.auction,lot=lots[a.lotIndex];assert.ok(lot);order.push(a.lotIndex);
      assert.equal(a.number,order.length);assert.equal(a.name,lot.name);assert.equal(a.start,lot.start);
      assert.equal(a.outcome,undefined);assert.equal(a.pool,undefined);assert.equal(view.auctionOrder,undefined);
      if(order.length<=2)assert.ok([0,1,2,3,4,5,6,11].includes(a.lotIndex));
      assert.equal((await action(host.hostToken,'host:open-auction',{questionId:q},receipt)).state.auction.id,a.id);
      const reconnect=await api('/'+host.pin+'/join','',clients[0]);assert.deepEqual(reconnect,teams[0]);
      for(const token of [undefined,...teams.map(t=>t.teamToken)]){
        const v=await state(token);assert.equal(v.auction.lotIndex,a.lotIndex);assert.equal(v.auctionOrder,undefined);assert.equal(v.answerKey,undefined);
      }
      const buyer=[...view.teams].sort((a,b)=>b.money-a.money)[0],buyerToken=teams.find(t=>t.teamId===buyer.id).teamToken;
      assert.ok(buyer.money>=a.start);
      await action(buyerToken,'pupil:bid',{auctionId:a.id,amount:a.start});
      if(order.length===1){
        view=(await action(host.hostToken,'host:auction-countdown',{auctionId:a.id})).state;
        const phone=await state(buyerToken);assert.equal(phone.auction.deadlineAt,view.auction.deadlineAt);
      }
      const soldId=randomUUID();view=(await action(host.hostToken,'host:sold',{auctionId:a.id},soldId)).state;
      assert.equal(view.auction.status,'sold');assert.ok(view.auction.outcome);
      const balances=view.teams.map(t=>[t.money,t.tp,t.shields,t.won]);
      assert.deepEqual((await action(host.hostToken,'host:sold',{auctionId:a.id},soldId)).state.teams.map(t=>[t.money,t.tp,t.shields,t.won]),balances);
      // Exercise saved cards obtained from the randomized lot, with duplicate protection.
      const phone=await state(buyerToken),card=phone.me.cards[0];
      if(card){
        assert.equal(card.art,a.lotIndex);assert.equal(card.name,lot.name);
        const rival=view.teams.find(t=>t.id!==buyer.id),playId=randomUUID(),body={cardId:card.id,targetTeamId:rival.id};
        const played=await action(buyerToken,'pupil:play',body,playId);
        assert.equal(played.state.me.cards.length,0);
        const replay=await action(buyerToken,'pupil:play',body,playId);assert.equal(replay.replayed,true);
        assert.deepEqual(replay.state.teams.map(t=>[t.money,t.tp,t.shields]),played.state.teams.map(t=>[t.money,t.tp,t.shields]));
      }
      view=(await action(host.hostToken,'host:advance',{questionId:q,auctionId:a.id})).state;
      assert.equal(view.phase,q===25?'settlement':'question');
    }
    assert.deepEqual([...order].sort((a,b)=>a-b),lots.map((_,i)=>i));
    await action(host.hostToken,'host:finish');finished=true;
    for(const t of teams){const v=await state(t.teamToken);assert.equal(v.role,'team');assert.equal(v.phase,'finished');assert.equal(v.answerKey,undefined);}
    orders.push(order);console.log(JSON.stringify({game,status:'PASS',auctions:order.map(i=>lots[i].name)}));
  }finally{if(!finished)await action(host.hostToken,'host:end-early');}
}
console.log(JSON.stringify({result:'PASS',games:2,questions:50,auctions:26,distinctOrders:JSON.stringify(orders[0])!==JSON.stringify(orders[1]),checks:'QR, teacher/student roles, slots 1/40, auto-mark privacy, constrained order, prices, reconnect, duplicate open/SOLD, countdown, saved cards, end-game'}));
