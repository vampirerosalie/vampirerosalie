import { createHash, createHmac, randomBytes, randomInt, timingSafeEqual } from 'node:crypto';

export class GameError extends Error {
  constructor(message, code = 'INVALID_ACTION', status = 400) { super(message); this.code = code; this.status = status; }
}
const fail = (message, code = 'INVALID_ACTION', status = 409) => { throw new GameError(message, code, status); };
const hash = value => createHash('sha256').update(value).digest('hex');
const equal = (a,b) => typeof a === 'string' && typeof b === 'string' && a.length === b.length && timingSafeEqual(Buffer.from(a),Buffer.from(b));
const id = () => randomBytes(12).toString('hex');
const clean = value => String(value ?? '').normalize('NFKC').replace(/[\u0000-\u001f\u007f]/g,'').trim().slice(0,28);
const normalized = value => String(value).normalize('NFKC').toLowerCase().replace(/[’‘]/g,"'").replace(/[.?!]/g,'').replace(/\s+/g,' ').trim();
export const AUCTION_QUESTIONS = Object.freeze([2,4,6,8,10,12,14,16,18,20,22,24,25]);
export function rewardText(reward) {
  return reward.type === 'tp' ? `Gain ${reward.n} TP` : reward.type === 'loseTP' ? `Lose up to ${reward.n} TP` : reward.type === 'cashTP' ? `Gain $${reward.n} and ${reward.tp} TP` : reward.type === 'shield' ? `Gain ${reward.n} TP + one shield against money or TP theft` : reward.type === 'stealMoney' ? `Saved card: steal up to $${reward.n}` : `Saved card: steal up to ${reward.n} TP`;
}

export class MarketGame {
  constructor({ bank, lots, now = Date.now, random = randomInt, secret = randomBytes(32).toString('hex'), retentionHours = 48 } = {}) {
    if (!Array.isArray(bank) || bank.length !== 25 || bank.some(q => !q.text || !q.correct || !['mcq','order','type'].includes(q.type))) throw new Error('The exact 25-question bank is required.');
    if (!Array.isArray(lots) || lots.length !== 13) throw new Error('Exactly 13 scheduled lots are required.');
    this.questions = bank; this.lots = lots; this.now = now; this.random = random; this.secret = secret; this.retentionMs = retentionHours * 3600000;
    this.rooms = new Map(); this.lastSeen = new Map();
  }
  save() {}
  room(pin) {
    if (!/^\d{5}$/.test(String(pin))) fail('Enter a five-digit room PIN.','INVALID_PIN',400);
    const room = this.rooms.get(String(pin));
    if (!room || room.expiresAt <= this.now()) fail('This room has expired. Ask your teacher for the current QR code.','ROOM_NOT_FOUND',404);
    return room;
  }
  create({ teamCount = 40, roomName = 'English Black Market' } = {}) {
    if (!Number.isInteger(teamCount) || teamCount < 2 || teamCount > 40) fail('Choose 2–40 team places.');
    let pin; do { pin = String(10000 + this.random(90000)); } while (this.rooms.has(pin));
    const hostToken = randomBytes(32).toString('hex');
    const room = { pin, name:clean(roomName), hostHash:hash(hostToken), createdAt:this.now(), expiresAt:this.now()+this.retentionMs,
      version:1, phase:'lobby', teamCount, questionIndex:-1, questionOpen:false, deadlineAt:null, confirmed:[], teams:[], submissions:{},
      auction:null, auctions:[], events:[], receipts:{} };
    this.rooms.set(pin,room); this.save(room); return { pin,hostToken };
  }
  teamToken(room, clientId) { return createHmac('sha256',this.secret).update(`team:${room.pin}:${room.createdAt}:${clientId}`).digest('hex'); }
  join(pin,{ clientId,teamSlot,name } = {}) {
    const room = this.room(pin);
    if (typeof clientId !== 'string' || !/^[-a-zA-Z0-9]{20,100}$/.test(clientId)) fail('Reload this phone to create its saved identity.','BAD_IDENTITY',400);
    const existing = room.teams.find(t => t.clientId === clientId);
    if (existing) { this.touch(room,existing); return { teamId:existing.id,teamToken:this.teamToken(room,clientId) }; }
    if (room.phase !== 'lobby') fail('This game has started. Existing players can still reconnect.','JOIN_CLOSED');
    if (!Number.isInteger(teamSlot) || teamSlot < 1 || teamSlot > room.teamCount) fail('Choose an available team place.');
    if (room.teams.some(t => t.slot === teamSlot)) fail('That place was just taken. Choose another.','SLOT_TAKEN');
    if (!clean(name)) fail('Enter your team name.');
    const token = this.teamToken(room,clientId), team = { id:id(),clientId,tokenHash:hash(token),slot:teamSlot,name:clean(name),money:100,tp:0,shields:0,cards:[],correct:0,won:0,sabotage:0 };
    room.teams.push(team); room.version++; this.touch(room,team); this.save(room);
    return { teamId:team.id,teamToken:token };
  }
  touch(room,team) { this.lastSeen.set(`${room.pin}:${team.id}`,this.now()); }
  auth(room,token) {
    if (!token) return {role:'public'};
    const h = hash(String(token)); if (equal(h,room.hostHash)) return {role:'host'};
    const team = room.teams.find(t => equal(h,t.tokenHash));
    if (!team) fail('This saved device key is invalid.','UNAUTHORIZED',401);
    this.touch(room,team); return {role:'team',team};
  }
  question(room) { const q = this.questions[room.questionIndex]; return q ? {...q,id:room.questionIndex+1} : null; }
  event(room,text,kind='info') { room.events.push({id:id(),text,kind,at:this.now()}); room.events = room.events.slice(-24); }
  reserved(room,team) { return room.auction?.status === 'open' && room.auction.bidder === team.id ? room.auction.bid : 0; }
  available(room,team) { return team.money-this.reserved(room,team); }
  ranking(room) {
    let last = null, rank = 0;
    return [...room.teams].sort((a,b) => b.tp-a.tp || a.slot-b.slot).map((t,i) => { if (t.tp !== last) rank=i+1; last=t.tp; return {id:t.id,name:t.name,slot:t.slot,tp:t.tp,money:t.money,correct:t.correct,won:t.won,sabotage:t.sabotage,rank}; });
  }
  publicAuction(auction) {
    if (!auction) return null;
    const lot = this.lots[auction.index];
    return {id:auction.id,index:auction.index,number:auction.index+1,name:lot.name,kind:lot.kind,start:lot.start,
      description:lot.kind === 'mystery' ? 'A sealed surprise. Its contents stay secret until SOLD!' : rewardText(lot.reward),
      status:auction.status,bid:auction.bid,bidder:auction.bidder,bidderName:auction.bidderName,deadlineAt:auction.deadlineAt,
      bids:auction.bids, ...(auction.status === 'sold' ? {outcome:rewardText(auction.outcome)} : {})};
  }
  view(room,actor) {
    const q = this.question(room), rows = room.submissions[q?.id] ?? {}, confirmed = room.confirmed.includes(q?.id);
    const data = {pin:room.pin,roomName:room.name,role:actor.role,version:room.version,phase:room.phase,serverTime:this.now(),teamCount:room.teamCount,
      questionNumber:room.questionIndex+1,totalQuestions:25,questionOpen:room.questionOpen && (!room.deadlineAt || this.now()<room.deadlineAt),deadlineAt:room.deadlineAt,
      question:q ? {id:q.id,cat:q.cat,type:q.type,text:q.text,choices:q.choices,words:q.words} : null,
      answerReveal:confirmed && q ? {answer:q.type==='mcq'?`${q.correct}. ${q.choices[q.correct.charCodeAt(0)-65]}`:q.correct} : null,
      auction:this.publicAuction(room.auction),auctions:room.auctions.map(a=>this.publicAuction(a)),nextAuctionNumber:room.auctions.length+1,
      auctionDue:confirmed && AUCTION_QUESTIONS.includes(q?.id) && room.auctions.length < AUCTION_QUESTIONS.indexOf(q.id)+1,
      takenSlots:room.teams.map(t=>t.slot),ranking:this.ranking(room),events:room.events,
      teams:room.teams.map(t=>({id:t.id,name:t.name,slot:t.slot,money:t.money,available:this.available(room,t),tp:t.tp,shields:t.shields,correct:t.correct,won:t.won,sabotage:t.sabotage,
        online:(this.lastSeen.get(`${room.pin}:${t.id}`)??0)>this.now()-20000,submitted:Boolean(rows[t.id]?.answer),verdict:confirmed ? rows[t.id]?.decision??'missing' : rows[t.id]?'submitted':'waiting'}))};
    if (actor.role==='host') {
      data.answerKey=q?.correct ?? null;
      data.reviews=room.teams.map(t=>({teamId:t.id,teamName:t.name,answer:rows[t.id]?.answer??'',decision:rows[t.id]?.decision??null,suggestion:rows[t.id]?.suggestion??null}));
      data.pendingReviewCount=data.reviews.filter(r=>r.answer && !r.decision).length;
    }
    if (actor.role==='team') {
      const t=actor.team,s=rows[t.id]; data.me={id:t.id,name:t.name,slot:t.slot,money:t.money,available:this.available(room,t),reserved:this.reserved(room,t),tp:t.tp,shields:t.shields,cards:t.cards,
        submission:s?{answer:s.answer,status:confirmed?s.decision??'missing':'submitted'}:null};
    }
    return data;
  }
  state(pin,token) { const room=this.room(pin); this.tick(room); return this.view(room,this.auth(room,token)); }
  tick(room) {
    if (room.phase==='auction' && room.auction?.status==='open' && room.auction.deadlineAt && this.now()>=room.auction.deadlineAt) {
      this.sell(room); room.version++; this.save(room);
    }
  }
  sell(room) {
    const a=room.auction; if (!a || a.status!=='open') return;
    a.deadlineAt=null;
    if (!a.bidder) { a.status='unsold'; this.event(room,`${this.lots[a.index].name} — UNSOLD. No money spent.`,'sold'); }
    else {
      const team=room.teams.find(t=>t.id===a.bidder);
      if (!team || team.money<a.bid) throw new Error('Reserved winning bid invariant failed.');
      team.money-=a.bid; team.won++; a.status='sold';
      const r=a.outcome;
      if (r.type==='tp') team.tp+=r.n;
      else if(r.type==='loseTP') team.tp=Math.max(0,team.tp-r.n);
      else if(r.type==='cashTP') {team.money+=r.n;team.tp+=r.tp;}
      else if(r.type==='shield') {team.tp+=r.n;team.shields++;}
      else team.cards.push({id:id(),type:r.type,n:r.n,name:this.lots[a.index].name,art:a.index,description:rewardText(r)});
      this.event(room,`SOLD! ${team.name} paid $${a.bid} for ${this.lots[a.index].name}. ${rewardText(r)}.`,'sold');
    }
    room.auctions.push(structuredClone(a)); room.phase='auction-result';
  }
  action(pin,token,body={}) {
    const room=this.room(pin),actor=this.auth(room,token);
    if (actor.role==='public') fail('A teacher or team key is required.','UNAUTHORIZED',401);
    const {type,requestId}=body;
    if (typeof requestId!=='string'||!/^[-a-zA-Z0-9]{12,100}$/.test(requestId)) fail('This action needs a receipt ID.','MISSING_REQUEST_ID',400);
    if ((String(type).startsWith('host:')&&actor.role!=='host')||(String(type).startsWith('pupil:')&&actor.role!=='team')) fail('That action belongs to another role.','FORBIDDEN',403);
    this.tick(room);
    const key=`${actor.role==='host'?'host':actor.team.id}:${requestId}`,signature=hash(JSON.stringify({...body,requestId:undefined})),receipt=room.receipts[key];
    if (receipt) {if(receipt.signature!==signature)fail('Receipt already used for a different action.','RECEIPT_CONFLICT');return{ok:true,replayed:true,result:receipt.result,state:this.view(room,actor)};}
    if(room.phase==='finished')fail('This game has ended. Results are locked.','GAME_LOCKED');
    const backup=structuredClone(room);
    try {
      const result=this.apply(room,actor,body);room.version++;room.receipts[key]={signature,result};
      const keys=Object.keys(room.receipts);if(keys.length>300)for(const old of keys.slice(0,keys.length-300))delete room.receipts[old];
      this.save(room);return{ok:true,result,state:this.view(room,actor)};
    } catch(error){this.rooms.set(pin,backup);throw error;}
  }
  apply(room,actor,b) {
    const q=this.question(room),team=actor.team;
    const phase=(...p)=>{if(!p.includes(room.phase))fail('That action is not available in this phase.','WRONG_PHASE');};
    const question=()=>{if(b.questionId!==q?.id)fail('The question changed.','STALE_QUESTION');};
    const auction=()=>{if(b.auctionId!==room.auction?.id)fail('The auction changed.','STALE_AUCTION');};
    switch(b.type) {
      case 'host:settings': phase('lobby');if(!Number.isInteger(b.teamCount)||b.teamCount<2||b.teamCount>40||room.teams.some(t=>t.slot>b.teamCount))fail('Choose 2–40 places, keeping every joined team.');room.teamCount=b.teamCount;return{teamCount:room.teamCount};
      case 'host:start':phase('lobby');if(!room.teams.length)fail('Wait for a team to join.');room.phase='question';room.questionIndex=0;room.questionOpen=true;this.event(room,'The market is open! Answer, earn, bid and collect Treasure Points.');return{started:true};
      case 'host:start-countdown':phase('question');question();if(!room.questionOpen||room.confirmed.includes(q.id))fail('Answers are already closed.');room.deadlineAt??=this.now()+10000;return{deadlineAt:room.deadlineAt};
      case 'pupil:submit': {
        phase('question');question();if(!room.questionOpen||(room.deadlineAt&&this.now()>=room.deadlineAt))fail('Time is up. Your inventory still works.','ANSWER_TIME_UP');
        const rows=room.submissions[q.id]??={};if(rows[team.id])fail('Your answer is already saved.','ALREADY_SUBMITTED');
        let answer;
        if(q.type==='mcq'){if(!['A','B','C','D'].includes(b.answer))fail('Choose an answer.');answer=b.answer;}
        else if(q.type==='order') {if(!Array.isArray(b.order)||b.order.length!==q.words.length||new Set(b.order).size!==q.words.length||b.order.some(i=>!Number.isInteger(i)||i<0||i>=q.words.length))fail('Use each word once.');answer=b.order.map(i=>q.words[i]).join(' ');}
        else {if(typeof b.answer!=='string'||!b.answer.trim()||b.answer.length>160)fail('Enter a short answer.');answer=b.answer.trim();}
        rows[team.id]={answer,decision:null,suggestion:normalized(answer)===normalized(q.correct)?'accepted':'rejected'};return{submitted:true};
      }
      case 'host:review': {
        phase('question');question();if(room.confirmed.includes(q.id))fail('Results are confirmed. Review before confirming.','RESULTS_LOCKED');
        if(!['accepted','rejected'].includes(b.decision))fail('Choose Accept or Reject.');
        const target=room.teams.find(t=>t.id===b.teamId);if(!target)fail('Team unavailable.');
        const rows=room.submissions[q.id]??={},sub=rows[target.id];
        if(!sub?.answer){if(b.decision==='accepted')fail('An unanswered question earns no reward.');rows[target.id]={answer:'',decision:'rejected',suggestion:null};}
        else sub.decision=b.decision;
        return{decision:b.decision,private:true};
      }
      case 'host:confirm': {
        phase('question');question();if(room.confirmed.includes(q.id))return{confirmed:true};
        const rows=room.submissions[q.id]??={};
        if(Object.values(rows).some(s=>s.answer&&!s.decision))fail('Review each submitted answer first. Missing answers may be marked wrong.','REVIEWS_PENDING');
        room.questionOpen=false;room.deadlineAt=null;
        for(const t of room.teams){const s=rows[t.id]??={answer:'',decision:'rejected',suggestion:null};if(s.decision==='accepted'){t.money+=25;t.tp++;t.correct++;}}
        room.confirmed.push(q.id);this.event(room,`Question ${q.id} confirmed. Accepted answers earn $25 and 1 TP.`,'reward');return{confirmed:true};
      }
      case 'host:advance': {
        question();
        if(room.phase==='auction-result'){auction();if(q.id===25){room.phase='settlement';this.event(room,'Final card opportunity. The teacher will finalize when ready.');return{phase:room.phase};}}
        else {phase('question');if(!room.confirmed.includes(q.id))fail('Review and confirm this question first.');if(AUCTION_QUESTIONS.includes(q.id))fail('Open and complete the scheduled auction first.','AUCTION_DUE');}
        room.questionIndex++;room.phase='question';room.questionOpen=true;room.deadlineAt=null;return{questionNumber:room.questionIndex+1};
      }
      case 'host:open-auction': {
        phase('question');question();if(!room.confirmed.includes(q.id))fail('Confirm the question before opening its auction.');
        const index=room.auctions.length;if(AUCTION_QUESTIONS[index]!==q.id)fail('There is no auction after this question.','NOT_AUCTION_TIME');
        const lot=this.lots[index];room.auction={id:id(),index,status:'open',bid:0,bidder:null,bidderName:null,deadlineAt:null,bids:[],outcome:structuredClone(lot.kind==='mystery'?lot.pool[this.random(lot.pool.length)]:lot.reward)};
        room.phase='auction';this.event(room,`Auction ${index+1}: ${lot.name} is now open.`,'auction');return{auctionId:room.auction.id};
      }
      case 'host:auction-countdown':phase('auction');auction();room.auction.deadlineAt??=this.now()+10000;return{deadlineAt:room.auction.deadlineAt};
      case 'host:sold':auction();if(room.auction.status!=='open')return{closed:true};phase('auction');this.sell(room);return{closed:true};
      case 'pupil:bid': {
        phase('auction');auction();const a=room.auction,min=a.bidder?a.bid+5:this.lots[a.index].start;
        if(!Number.isSafeInteger(b.amount)||b.amount<min)fail(`Bid at least $${min}.`,'BID_TOO_LOW');
        if(b.amount>team.money)fail('That bid is higher than your balance.','INSUFFICIENT_FUNDS');
        a.bid=b.amount;a.bidder=team.id;a.bidderName=team.name;a.bids.push({teamName:team.name,amount:b.amount});a.bids=a.bids.slice(-8);return{bid:b.amount};
      }
      case 'pupil:play': {
        phase('question','auction','auction-result','settlement');
        const card=team.cards.find(c=>c.id===b.cardId);if(!card)fail('That saved card is no longer available.','CARD_USED');
        const rival=room.teams.find(t=>t.id===b.targetTeamId&&t.id!==team.id);if(!rival)fail('Choose another team. Your card is saved.','INVALID_TARGET');
        const available=card.type==='stealMoney'?this.available(room,rival):rival.tp;
        if(available<=0)fail(card.type==='stealMoney'?'No unreserved money to steal. Your card is saved.':'No TP to steal. Your card is saved.','EMPTY_TARGET');
        let message,amount=0,blocked=false;
        if(rival.shields){rival.shields--;blocked=true;message=`${rival.name}’s shield blocked ${team.name}’s ${card.name}. Both card and shield were used.`;}
        else {amount=Math.min(card.n,available);const key=card.type==='stealMoney'?'money':'tp';rival[key]-=amount;team[key]+=amount;team.sabotage++;message=`${team.name} stole ${key==='money'?'$':''}${amount}${key==='tp'?' TP':''} from ${rival.name}.`;}
        team.cards=team.cards.filter(c=>c.id!==card.id);this.event(room,message,blocked?'shield':'theft');return{amount,blocked,message};
      }
      case 'host:finish':phase('settlement');if(room.auctions.length!==13||room.confirmed.length!==25)fail('Finish all questions and auctions first.');room.phase='finished';this.event(room,'Final results! Most Treasure Points wins; money is not a tiebreaker.','finish');return{finished:true};
      case 'host:end-early':room.phase='finished';room.questionOpen=false;room.deadlineAt=null;if(room.auction?.status==='open'){room.auction.status='cancelled';room.auction.deadlineAt=null;}this.event(room,'Teacher ended the game. All actions are locked.','finish');return{finished:true};
      default:fail('Unknown game action.','UNKNOWN_ACTION',404);
    }
  }
}
