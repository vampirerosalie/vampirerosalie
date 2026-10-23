import { createHash, createHmac, randomBytes, randomInt, timingSafeEqual } from 'node:crypto';
import E from './engine.js';
import CONTENT from '../content.json' with { type: 'json' };

export { CONTENT, E };
export class GameError extends Error {
  constructor(message, code = 'INVALID_ACTION', status = 409) { super(message); this.code = code; this.status = status; }
}
const fail = (m, c, s) => { throw new GameError(m, c, s); };
const hash = v => createHash('sha256').update(String(v)).digest('hex');
const equal = (a,b) => typeof a === 'string' && typeof b === 'string' && a.length === b.length && timingSafeEqual(Buffer.from(a),Buffer.from(b));
const question = s => CONTENT.items[s.questionIndex];
const publicQuestion = q => ({ id:q.id, number:q.number, group:q.group, prompt:q.prompt });
const closed = s => ['ended','finished'].includes(s.phase);
export class TreasureGame {
  constructor({ now=Date.now, random=randomInt, secret=randomBytes(32).toString('hex') }={}) {
    this.now=now; this.random=random; this.secret=secret; this.rooms=new Map(); this.lastSeen=new Map();
  }
  create() {
    let pin; do { pin=String(10000+this.random(90000)); } while(this.rooms.has(pin));
    const hostToken=randomBytes(32).toString('hex'), game=E.createState('treasure-raid-v02');
    game.crews=[]; delete game.role; delete game.crewId; delete game.operations;
    const room={pin,hostHash:hash(hostToken),createdAt:this.now(),expiresAt:this.now()+48*3600000,version:1,players:[],receipts:{},game,autoMark:true,startAt:null,endedAt:null,results:null};
    this.rooms.set(pin,room); return {pin,hostToken};
  }
  room(pin) {
    if(!/^\d{5}$/.test(String(pin))) fail('Enter the five-digit room PIN.','INVALID_PIN',400);
    const r=this.rooms.get(String(pin));
    if(!r||r.expiresAt<=this.now()) fail('This room is unavailable. Ask your teacher for the current joining QR.','ROOM_NOT_FOUND',404);
    return r;
  }
  studentToken(r,clientId) { return createHmac('sha256',this.secret).update(`treasure:${r.pin}:${r.createdAt}:${clientId}`).digest('hex'); }
  join(pin,{clientId,name}={}) {
    const r=this.room(pin);
    if(typeof clientId!=='string'||!/^[-a-zA-Z0-9]{20,100}$/.test(clientId)) fail('Reload to create a saved device identity.','BAD_IDENTITY',400);
    const existing=r.players.find(p=>p.clientId===clientId);
    if(existing) return {playerId:existing.id,playerToken:this.studentToken(r,clientId)};
    if(closed(r.game)||r.game.phase==='finalBank') fail('This voyage is closed to new players.','JOIN_CLOSED');
    if(r.players.length>=40) fail('This room has reached its 40-player limit.','ROOM_FULL');
    const safeName=String(name??'').normalize('NFKC').replace(/[\u0000-\u001f\u007f]/g,'').trim().slice(0,28);
    if(!safeName) fail('Please enter your name.','NAME_REQUIRED',400);
    const token=this.studentToken(r,clientId), id=randomBytes(12).toString('hex');
    r.players.push({id,clientId,name:safeName,tokenHash:hash(token),actionVersion:0});
    r.game.crews.push({id,name:safeName,bag:0,vault:0,actions:0,cards:[],shields:0,responses:{},attacks:{},location:'camp',settled:false});
    r.reviewVersion=(r.reviewVersion??0)+1;r.version++; return {playerId:id,playerToken:token};
  }
  auth(r,token) {
    if(!token) return {role:'public'};
    const digest=hash(token);
    if(equal(digest,r.hostHash)) return {role:'host'};
    const player=r.players.find(p=>equal(digest,p.tokenHash));
    if(!player) fail('This saved device key is not valid for this room.','UNAUTHORIZED',401);
    this.lastSeen.set(`${r.pin}:${player.id}`,this.now()); return {role:'student',player};
  }
  ranking(r) {
    let prior=null,rank=0;
    return [...r.game.crews].sort((a,b)=>b.vault-a.vault).map((c,i)=>{if(prior!==c.vault)rank=i+1;prior=c.vault;return {id:c.id,name:c.name,vault:c.vault,rank};});
  }
  view(r,actor) {
    const s=r.game,q=question(s),now=this.now();
    const base={pin:r.pin,role:actor.role,version:r.version,phase:s.phase==='reading'?'lobby':s.phase,paused:s.paused,serverTime:now,startAt:r.startAt,endedAt:r.endedAt,onlineCount:r.players.filter(p=>(this.lastSeen.get(`${r.pin}:${p.id}`)??0)>now-25000).length,joinedCount:r.players.length};
    if(actor.role==='public') return base;
    const players=s.crews.map(c=>({id:c.id,name:c.name,bag:c.bag,vault:c.vault,actions:c.actions,shields:c.shields,settled:c.settled,online:(this.lastSeen.get(`${r.pin}:${c.id}`)??0)>now-25000,answerStatus:c.responses[q.id]?.unanswered?'unanswered':c.responses[q.id]?.status??'not-submitted',acceptedCount:Object.values(c.responses).filter(v=>v.awarded).length}));
    const finalized=!!s.finalized?.[q.id];
    const result={...base,players,question:publicQuestion(q),questionCount:18,log:s.log,finalized,
      answerCountdownEndsAt:r.answerCountdownEndsAt??null,
      answersClosed:finalized||!!s.revealed[q.id]||!!(r.answerCountdownEndsAt&&now>=r.answerCountdownEndsAt),
      ...(s.revealed[q.id]?{revealedAnswer:q.modelAnswer}:{}),...(r.results?{results:r.results}:{} )};
    if(actor.role==='host') {
      result.autoMark=r.autoMark!==false;
      result.reviewVersion=r.reviewVersion??0;
      result.pendingReviewCount=s.crews.filter(c=>c.responses[q.id]?.status==='submitted').length;
      for(const player of players)player.location=E.getCrew(s,player.id).location;
    }
    if(actor.role==='student') {
      const c=E.getCrew(s,actor.player.id);
      result.me={...players.find(p=>p.id===c.id),cards:[...c.cards],location:c.location,actionVersion:actor.player.actionVersion,response:c.responses[q.id]??null,usedAttack:!!c.attacks[q.id]};
      // Provisional teacher decisions are not results; reveal them only on finalize.
      if(!finalized){
        for(const player of players)if(!['not-submitted','unanswered'].includes(player.answerStatus))player.answerStatus='submitted';
        if(result.me.response?.unanswered){result.me.response=null;result.me.answerStatus='not-submitted';}
        if(result.me.response&&!result.me.response.awarded){result.me.response={value:result.me.response.value,attempts:result.me.response.attempts,status:'submitted',awarded:false};result.me.answerStatus='submitted';}
      }
    }
    return result;
  }
  state(pin,token){ const r=this.room(pin);return this.view(r,this.auth(r,token)); }
  content(pin,token){ const r=this.room(pin),a=this.auth(r,token);if(a.role==='public') fail('Join this room to read.','UNAUTHORIZED',401);return {title:CONTENT.title,instructions:CONTENT.instructions,paragraphs:CONTENT.passageParagraphs,items:CONTENT.items.map(publicQuestion)}; }
  review(pin,token){ const r=this.room(pin),a=this.auth(r,token);if(a.role!=='host') fail('Teacher key required.','FORBIDDEN',403);const q=question(r.game);return {question:q,reviewVersion:r.reviewVersion??0,entries:r.game.crews.map(c=>({id:c.id,name:c.name,response:c.responses[q.id]??null,suggestion:c.responses[q.id]?.value?E.suggestAnswer(c.responses[q.id].value,q):null}))}; }
  action(pin,token,body={}) {
    const r=this.room(pin),a=this.auth(r,token);
    if(a.role==='public') fail('Join this room first.','UNAUTHORIZED',401);
    if(typeof body.type!=='string'||!['host:','student:'].some(p=>body.type.startsWith(p))) fail('Unknown action.','UNKNOWN_ACTION',400);
    if(body.type.startsWith(a.role==='host'?'student:':'host:')) fail('That action requires a different role.','FORBIDDEN',403);
    if(!/^[-a-zA-Z0-9]{12,100}$/.test(body.requestId??'')) fail('A request ID is required.','MISSING_REQUEST_ID',400);
    const key=`${a.player?.id??'host'}:${body.requestId}`,signature=hash(JSON.stringify(body)),receipt=r.receipts[key];
    if(receipt){if(receipt.signature!==signature)fail('Request ID reused for a different action.','RECEIPT_CONFLICT');return {replayed:true,result:receipt.result,state:this.view(r,a)};}
    if(body.type!=='host:end'&&Object.keys(r.receipts).length>=30000) fail('This room has reached its action limit. Please finish this voyage.','ACTION_LIMIT');
    const before=structuredClone(r);
    try {
      const result=this.apply(r,a,body)??null;
      r.version++;r.receipts[key]={signature,result};return {ok:true,result,state:this.view(r,a)};
    } catch(error){this.rooms.set(pin,before);if(error instanceof GameError)throw error;throw new GameError(error.message);}
  }
  apply(r,a,b) {
    const s=r.game,q=question(s),p=a.player;
    if(b.type==='host:end') {
      if(closed(s)) return {ended:true};
      if(b.confirm!==true) fail('Confirm immediate ending first.','CONFIRM_REQUIRED');
      s.phase='ended';s.paused=true;r.endedAt=this.now();r.results=this.ranking(r);return {ended:true};
    }
    if(closed(s)) fail('This voyage has ended. Scores are locked.','GAME_ENDED');
    if(b.type==='host:start'){if(!r.players.length)fail('Wait for someone to join.');E.start(s);r.startAt=this.now();return;}
    if(b.type==='host:pause'){if(typeof b.paused!=='boolean')fail('Choose pause or resume.');E.pause(s,b.paused);return;}
    if(b.type==='host:auto-mark'){
      if(typeof b.enabled!=='boolean')fail('Choose automatic or manual marking.');
      r.autoMark=b.enabled;
      if(b.enabled&&s.phase==='questions'&&!s.finalized?.[q.id])for(const crew of s.crews)this.autoAccept(r,crew,q);
      r.reviewVersion=(r.reviewVersion??0)+1;
      return;
    }
    if(['host:review','host:accept-all','host:start-countdown','host:advance','host:reveal','student:submit'].includes(b.type)&&b.questionId!==q.id) fail('The question has changed. Reload the current question.','STALE_QUESTION');
    if(b.type==='host:start-countdown'){
      if(s.phase!=='questions'||s.finalized?.[q.id]||s.revealed[q.id])fail('This question is closed.','QUESTION_CLOSED');
      r.answerCountdownEndsAt??=this.now()+10000;
      return {answerCountdownEndsAt:r.answerCountdownEndsAt};
    }
    if(b.type==='host:review'){
      if(s.phase!=='questions'||s.finalized?.[q.id])fail('This question is finalized.','QUESTION_CLOSED');
      const c=E.getCrew(s,b.playerId);let response=c.responses[q.id];
      if((response?.attempts??0)!==b.attempt) fail('This answer has changed. Review the latest submission.','STALE_ANSWER');
      if(!['accept','reject','revise'].includes(b.decision))fail('Choose Accept or Mark wrong.');
      if(response?.awarded)fail('This action was already awarded by the earlier game version; it cannot be changed.','REWARD_LOCKED');
      if(b.decision==='accept'&&(!response||response.unanswered))fail('No answer was submitted.','NO_SUBMISSION');
      if(!response){if(b.decision==='accept')fail('No answer was submitted.','NO_SUBMISSION');response=c.responses[q.id]={value:'',attempts:0,awarded:false,unanswered:true};}
      response.status=b.decision==='accept'?'accepted':'rejected';response.markedBy='teacher';
      r.reviewVersion=(r.reviewVersion??0)+1;return;
    }
    if(b.type==='host:accept-all'){
      if(s.phase!=='questions'||s.finalized?.[q.id])fail('This question is finalized.','QUESTION_CLOSED');
      if(b.reviewVersion!==(r.reviewVersion??0))fail('Answers changed. Review the latest answers before accepting all.','STALE_REVIEW');
      for(const c of s.crews){const response=c.responses[q.id];if(response&&!response.unanswered&&!response.awarded){response.status='accepted';response.markedBy='teacher';}}
      r.reviewVersion=(r.reviewVersion??0)+1;return;
    }
    if(b.type==='host:advance'){
      if(!s.finalized?.[q.id])fail('Finalize and reveal this answer before moving to the next question.','NOT_FINALIZED');
      E.advance(s,CONTENT,true);r.answerCountdownEndsAt=null;r.reviewVersion=(r.reviewVersion??0)+1;
      for(const player of r.players)player.actionVersion++;return;
    }
    if(b.type==='host:reveal'){
      if(s.phase!=='questions')fail('No question to finalize.','QUESTION_CLOSED');
      if(s.finalized?.[q.id])return {finalized:true};
      if(b.reviewVersion!==(r.reviewVersion??0))fail('Answers changed. Review the latest answers before finalizing.','STALE_REVIEW');
      if(s.crews.some(c=>c.responses[q.id]?.status==='submitted'))fail('Review every submitted answer before finalizing.','REVIEWS_PENDING');
      for(const c of s.crews){
        const response=c.responses[q.id]??={value:'',attempts:0,status:'rejected',unanswered:true,awarded:false};
        if(response.status==='accepted'&&!response.awarded){response.awarded=true;c.actions++;r.players.find(p=>p.id===c.id).actionVersion++;}
        response.finalized=true;
      }
      (s.finalized??={})[q.id]=true;s.revealed[q.id]=true;r.answerCountdownEndsAt=null;
      r.reviewVersion=(r.reviewVersion??0)+1;
      // Answer reveal must never toggle the teacher's separate Pause actions control.
      return {finalized:true};
    }
    if(b.type==='host:final-banking'){E.finalBanking(s);return;}
    if(b.type==='host:finish'){E.finish(s);r.endedAt=this.now();r.results=this.ranking(r);return;}
    if(b.type==='student:submit'){
      if(s.finalized?.[q.id]||(r.answerCountdownEndsAt&&this.now()>=r.answerCountdownEndsAt))fail('Time is up. Wait for your teacher to review the answers.','ANSWER_TIME_UP');
      if(typeof b.answer!=='string'||b.answer.length>300)fail('Use a short written answer (maximum 300 characters).','BAD_ANSWER',400);
      const previous=E.getCrew(s,p.id).responses[q.id];
      if(b.attempt!==(previous?.attempts??0))fail('Your answer has changed. Refresh before resubmitting.','STALE_ANSWER');
      if(previous&&!previous.unanswered)fail('Your answer is already submitted. Wait for the next question.','ALREADY_SUBMITTED');
      E.submit(s,CONTENT,p.id,b.answer);
      this.autoAccept(r,E.getCrew(s,p.id),q);r.reviewVersion=(r.reviewVersion??0)+1;
      return {submitted:true};
    }
    if(a.role==='student'&&['student:explore','student:bank','student:attack','student:pass'].includes(b.type)){
      if(b.expectedVersion!==p.actionVersion)fail('Your resources changed. Please check them and try again.','STALE_RESOURCES');
      let result;
      if(b.type==='student:explore'){
        // Fresh secret entropy for every server transaction; the prototype's seed never leaves the server.
        const crew=E.getCrew(s,p.id),held=new Set(crew.cards);
        if(crew.shields)held.add('shield');
        s.seed=randomInt(0x100000000);result=E.explore(s,p.id,b.location);delete result.weight;
        result.visual=held.has(result.kind)?'duplicate':result.kind;
      }
      if(b.type==='student:bank')result={visual:'bank',title:`Banked ${E.bank(s,p.id)} gems`,message:'Your vault is protected.'};
      if(b.type==='student:attack'){const blocked=E.getCrew(s,b.targetId).shields>0;result=E.attack(s,p.id,b.targetId,b.card,CONTENT);result.visual=blocked?'blocked':b.card;r.players.find(x=>x.id===b.targetId).actionVersion++;}
      if(b.type==='student:pass')E.pass(s,p.id);
      p.actionVersion++;return result;
    }
    fail('Unknown Treasure Raid action.','UNKNOWN_ACTION',400);
  }
  autoAccept(r,crew,q) {
    const response=crew.responses[q.id];
    if(r.autoMark===false||response?.status!=='submitted'||E.suggestAnswer(response.value,q).status!=='suggest_accept')return false;
    response.status='accepted';
    response.markedBy='automatic';
    return true;
  }
}
