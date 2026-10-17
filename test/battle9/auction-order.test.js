import test from 'node:test';
import assert from 'node:assert/strict';
import {randomUUID} from 'node:crypto';
import {MarketGame, createAuctionOrder, AUCTION_QUESTIONS, rewardText} from '../../app/battle9/core/game.js';
import {MarketD1Store} from '../../app/battle9/d1-store.js';
import {bank,lots,TestD1,setup,open} from './helpers.js';

const eligible = [0,1,2,3,4,5,6,11];
const powerful = [7,8,9,10,12];
const all = lots.map((_,i)=>i);
function seeded(seed) { return max => { seed=(Math.imul(seed,1664525)+1013904223)>>>0; return Math.floor(seed/4294967296*max); }; }

test('2,000 new games obey opening restrictions, exact inventory and freely shuffled remaining positions',()=>{
  const openingPairs=new Set(),positions=lots.map(()=>new Set());let decreasing=false;
  for(let seed=1;seed<=2000;seed++){
    const game=new MarketGame({bank,lots,random:seeded(seed)}),host=game.create(),order=game.room(host.pin).auctionOrder;
    assert.deepEqual([...order].sort((a,b)=>a-b),all);
    assert.ok(order.slice(0,2).every(i=>eligible.includes(i)));
    openingPairs.add(order.slice(0,2).join(','));
    order.forEach((item,pos)=>positions[item].add(pos));
    const tp=order.map(i=>lots[i].reward).filter(r=>r?.type==='tp').map(r=>r.n);
    decreasing ||= tp.some((n,i)=>i>0&&n<tp[i-1]);
  }
  assert.equal(openingPairs.size,56);
  for(const i of powerful)assert.deepEqual([...positions[i]].sort((a,b)=>a-b),all.slice(2));
  for(const i of eligible){assert.ok(positions[i].has(0));assert.ok(positions[i].has(1));}
  assert.ok(decreasing);
});

test('fresh rooms draw new orders; order is created once and absent from every client view',()=>{
  const game=new MarketGame({bank,lots,random:seeded(91)}),orders=[];
  for(let i=0;i<5;i++){
    const host=game.create(),client={clientId:randomUUID(),teamSlot:1,name:'Reconnect'},team=game.join(host.pin,client);
    const saved=structuredClone(game.room(host.pin).auctionOrder);orders.push(saved.join(','));
    game.random=()=>{throw new Error('Must not reshuffle during reconnect/read/start');};
    for(const token of [undefined,host.hostToken,team.teamToken]){
      const view=game.state(host.pin,token);assert.equal(view.auctionOrder,undefined);assert.deepEqual(view.auctions,[]);
    }
    assert.deepEqual(game.join(host.pin,client),team);
    game.action(host.pin,host.hostToken,{type:'host:start',requestId:randomUUID()});
    assert.deepEqual(game.room(host.pin).auctionOrder,saved);
    game.random=seeded(200+i);
  }
  assert.equal(new Set(orders).size,5);
});

test('20 complete randomized games preserve schedule, prices, artwork, rewards and mystery secrecy',()=>{
  let earlyVault=false,otherFinal=false;
  for(let seed=1;seed<=20;seed++){
    const s=setup(2);s.room().auctionOrder=createAuctionOrder(lots,seeded(seed));const order=[...s.room().auctionOrder];
    s.act(s.host.hostToken,'host:start');
    // Fund the buyer to exercise every lot, independent of question awards.
    s.room().teams[0].money=10000;
    for(let q=1;q<=25;q++){
      assert.equal(s.view().question.text,bank[q-1].text);
      s.act(s.host.hostToken,'host:confirm',{questionId:q});
      if(!AUCTION_QUESTIONS.includes(q)){s.act(s.host.hostToken,'host:advance',{questionId:q});continue;}
      const position=AUCTION_QUESTIONS.indexOf(q),lotIndex=order[position],lot=lots[lotIndex],receipt=randomUUID();
      s.act(s.host.hostToken,'host:open-auction',{questionId:q},receipt);
      const a=s.room().auction,expected=structuredClone(a.outcome),buyer=s.room().teams[0],before=structuredClone(buyer);
      s.act(s.host.hostToken,'host:open-auction',{questionId:q},receipt);
      for(const token of [undefined,s.host.hostToken,...s.teams.map(t=>t.teamToken)]){
        const v=s.view(token);assert.equal(v.auction.number,position+1);assert.equal(v.auction.lotIndex,lotIndex);
        assert.equal(v.auction.name,lot.name);assert.equal(v.auction.start,lot.start);
        assert.equal(v.auction.outcome,undefined);assert.equal(v.auction.pool,undefined);assert.equal(v.auctionOrder,undefined);
        assert.equal(v.auction.description,lot.kind==='mystery'?'A sealed surprise. Its contents stay secret until SOLD!':rewardText(lot.reward));
      }
      const mysteryRoll=lot.kind==='mystery'?lot.pool[0]:lot.reward;assert.deepEqual(expected,mysteryRoll);
      assert.throws(()=>s.act(s.teams[0].teamToken,'pupil:bid',{auctionId:a.id,amount:lot.start-1}),/at least/);
      s.act(s.teams[1].teamToken,'pupil:bid',{auctionId:a.id,amount:lot.start});
      const amount=lot.start+5;
      s.act(s.teams[0].teamToken,'pupil:bid',{auctionId:a.id,amount});
      assert.deepEqual(s.room().auction.outcome,expected);
      assert.equal(s.room().auction.deadlineAt,null);
      if(position%2===0){s.act(s.host.hostToken,'host:auction-countdown',{auctionId:a.id});s.tick(10000);s.view(s.teams[0].teamToken);}
      else s.act(s.host.hostToken,'host:sold',{auctionId:a.id});
      s.act(s.host.hostToken,'host:sold',{auctionId:a.id});
      const after=s.room().teams[0];
      assert.equal(after.money,before.money-amount+(expected.type==='cashTP'?expected.n:0));
      assert.equal(s.room().teams[1].money,100);
      assert.equal(after.tp,expected.type==='loseTP'?Math.max(0,before.tp-expected.n):before.tp+(['tp','shield'].includes(expected.type)?expected.n:expected.type==='cashTP'?expected.tp:0));
      if(expected.type.startsWith('steal')){assert.equal(after.cards.at(-1).art,lotIndex);assert.equal(after.cards.at(-1).name,lot.name);}
      assert.equal(s.view().auction.outcome,rewardText(expected));
      assert.deepEqual(s.room().auctionOrder,order);
      s.act(s.host.hostToken,'host:advance',{questionId:q,auctionId:a.id});
      assert.equal(s.room().phase,q===25?'settlement':'question');
      earlyVault ||= lotIndex===12&&position<12;otherFinal ||= position===12&&lotIndex!==12;
    }
    assert.deepEqual(s.room().auctions.map(a=>a.lotIndex),order);
    s.act(s.host.hostToken,'host:finish');assert.equal(s.view().phase,'finished');
  }
  assert.ok(earlyVault);assert.ok(otherFinal);
});

test('all mystery outcomes remain selectable and hidden irrespective of randomized slot and bid',()=>{
  for(const lotIndex of [1,4,7,10])for(let roll=0;roll<3;roll++){
    const s=setup(1);[s.room().auctionOrder[2],s.room().auctionOrder[lotIndex]]=[s.room().auctionOrder[lotIndex],s.room().auctionOrder[2]];
    s.game.random=()=>roll;const aid=open(s,2),lot=lots[lotIndex];
    assert.deepEqual(s.room().auction.outcome,lot.pool[roll]);
    assert.equal(s.view(s.host.hostToken).auction.outcome,undefined);
    s.act(s.teams[0].teamToken,'pupil:bid',{auctionId:aid,amount:100});
    s.act(s.host.hostToken,'host:sold',{auctionId:aid});
    assert.equal(s.view().auction.outcome,rewardText(lot.pool[roll]));
  }
});

test('durable order survives worker replacement, concurrent reconnects, lost-open retry and countdown/SOLD races',async()=>{
  const db=new TestD1();let now=1000000;
  const store=(random)=>new MarketD1Store(db,{bank,lots,random,now:()=>now,sleep:async()=>{}});
  const host=await store(seeded(76)).create(),order=db.room(host.pin).auctionOrder;
  const clients=Array.from({length:4},(_,i)=>({clientId:randomUUID(),teamSlot:i+1,name:'Team '+i}));
  const noRandom=()=>{throw new Error('Unexpected shuffle on existing room');};
  const teams=await Promise.all(clients.map(c=>store(noRandom).join(host.pin,c)));
  const act=(token,type,more={},requestId=randomUUID())=>store(()=>0).action(host.pin,token,{type,requestId,...more});
  await act(host.hostToken,'host:start');
  await act(host.hostToken,'host:confirm',{questionId:1});await act(host.hostToken,'host:advance',{questionId:1});await act(host.hostToken,'host:confirm',{questionId:2});
  const requestId=randomUUID();db.failAfterCommit=true;
  await assert.rejects(act(host.hostToken,'host:open-auction',{questionId:2},requestId),/Lost response/);
  const opened=structuredClone(db.room(host.pin).auction);
  await act(host.hostToken,'host:open-auction',{questionId:2},requestId);
  assert.deepEqual(db.room(host.pin).auction,opened);
  await Promise.all(clients.map((c,i)=>store(noRandom).join(host.pin,c).then(t=>assert.deepEqual(t,teams[i]))));
  for(const token of [undefined,host.hostToken,...teams.map(t=>t.teamToken)]){
    const v=await store(noRandom).state(host.pin,token);assert.equal(v.auction.lotIndex,order[0]);assert.equal(v.auctionOrder,undefined);
  }
  const amount=lots[order[0]].start;
  const bids=await Promise.allSettled(teams.map(t=>act(t.teamToken,'pupil:bid',{auctionId:opened.id,amount})));
  assert.equal(bids.filter(r=>r.status==='fulfilled').length,1);
  await act(host.hostToken,'host:auction-countdown',{auctionId:opened.id});now+=10000;
  await Promise.all([act(host.hostToken,'host:sold',{auctionId:opened.id}),...teams.map(t=>store(noRandom).state(host.pin,t.teamToken))]);
  const room=db.room(host.pin);assert.deepEqual(room.auctionOrder,order);assert.equal(room.auctions.length,1);
  assert.equal(room.teams.reduce((n,t)=>n+t.won,0),1);
  assert.equal(room.teams.reduce((n,t)=>n+t.money,0),400-amount);
  assert.ok(db.conflicts>0);
});

test('pre-update rooms, open auctions and saved cards retain legacy identities without reshuffling',()=>{
  const s=setup(1);delete s.room().auctionOrder;
  const aid=open(s,2);delete s.room().auction.lotIndex;
  s.game.random=()=>{throw new Error('Legacy room reshuffled');};
  assert.equal(s.view().auction.name,'Pickpocket Gloves');
  s.act(s.teams[0].teamToken,'pupil:bid',{auctionId:aid,amount:30});s.act(s.host.hostToken,'host:sold',{auctionId:aid});
  assert.equal(s.view(s.teams[0].teamToken).me.cards[0].art,2);
  assert.equal(s.view().auctions.at(-1).lotIndex,2);
  open(s,3);assert.equal(s.view().auction.name,'Sapphire Chest');assert.equal(s.room().auctionOrder,undefined);
});
