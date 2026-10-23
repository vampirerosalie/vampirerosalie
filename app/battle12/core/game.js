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
    const room={pin,hostHash:hash(hostToken),createdAt:this.now(),expiresAt:this.now()+48*3600000,version:1,players:[],receipts:{},game,startAt:null,endedAt:null,results:null};
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
    r.version++; return {playerId:id,playerToken:token};
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
    const players=s.crews.map(c=>({id:c.id,name:c.name,bag:c.bag,vault:c.vault,actions:c.actions,shields:c.shields,settled:c.settled,online:(this.lastSeen.get(`${r.pin}:${c.id}`)??0)>now-25000,answerStatus:c.responses[q.id]?.status??'not-submitted',acceptedCount:Object.values(c.responses).filter(v=>v.awarded).length}));
    const result={...base,players,question:publicQuestion(q),questionCount:18,log:s.log,...(s.revealed[q.id]?{revealedAnswer:q.modelAnswer}:{}),...(r.results?{results:r.results}:{} )};
    if(actor.role==='student') {
      const c=E.getCrew(s,actor.player.id);
      result.me={...players.find(p=>p.id===c.id),cards:[...c.cards],location:c.location,actionVersion:actor.player.actionVersion,response:c.responses[q.id]??null,usedAttack:!!c.attacks[q.id]};
    }
    return result;
  }
  state(pin,token){ const r=this.room(pin);return this.view(r,this.auth(r,token)); }
  content(pin,token){ const r=this.room(pin),a=this.auth(r,token);if(a.role==='public') fail('Join this room to read.','UNAUTHORIZED',401);return {title:CONTENT.title,instructions:CONTENT.instructions,paragraphs:CONTENT.passageParagraphs,items:CONTENT.items.map(publicQuestion)}; }
  review(pin,token){ const r=this.room(pin),a=this.auth(r,token);if(a.role!=='host') fail('Teacher key required.','FORBIDDEN',403);const q=question(r.game);return {question:q,entries:r.game.crews.map(c=>({id:c.id,name:c.name,response:c.responses[q.id]??null,suggestion:c.responses[q.id]?E.suggestAnswer(c.responses[q.id].value,q):null}))}; }
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
    if(['host:review','host:advance','host:reveal','student:submit'].includes(b.type)&&b.questionId!==q.id) fail('The question has changed. Reload the current question.','STALE_QUESTION');
    if(b.type==='host:review'){
      const c=E.getCrew(s,b.playerId),response=c.responses[q.id];
      if(!response||response.attempts!==b.attempt) fail('This answer has changed. Review the latest submission.','STALE_ANSWER');
      E.review(s,CONTENT,c.id,b.decision);r.players.find(x=>x.id===c.id).actionVersion++;return;
    }
    if(b.type==='host:advance'){E.advance(s,CONTENT,b.skip===true);for(const player of r.players)player.actionVersion++;return;}
    if(b.type==='host:reveal'){E.reveal(s,CONTENT);return;}
    if(b.type==='host:final-banking'){E.finalBanking(s);return;}
    if(b.type==='host:finish'){E.finish(s);r.endedAt=this.now();r.results=this.ranking(r);return;}
    if(b.type==='student:submit'){
      if(typeof b.answer!=='string'||b.answer.length>300)fail('Use a short written answer (maximum 300 characters).','BAD_ANSWER',400);
      const previous=E.getCrew(s,p.id).responses[q.id];
      if(b.attempt!==(previous?.attempts??0))fail('Your answer has changed. Refresh before resubmitting.','STALE_ANSWER');
      E.submit(s,CONTENT,p.id,b.answer);return {submitted:true};
    }
    if(a.role==='student'&&['student:explore','student:bank','student:attack','student:pass'].includes(b.type)){
      if(b.expectedVersion!==p.actionVersion)fail('Your resources changed. Please check them and try again.','STALE_RESOURCES');
      let result;
      if(b.type==='student:explore'){
        // Fresh secret entropy for every server transaction; the prototype's seed never leaves the server.
        s.seed=randomInt(0x100000000);result=E.explore(s,p.id,b.location);delete result.weight;
      }
      if(b.type==='student:bank')result={title:`Banked ${E.bank(s,p.id)} gems`,message:'Your vault is protected.'};
      if(b.type==='student:attack'){result=E.attack(s,p.id,b.targetId,b.card,CONTENT);r.players.find(x=>x.id===b.targetId).actionVersion++;}
      if(b.type==='student:pass')E.pass(s,p.id);
      p.actionVersion++;return result;
    }
    fail('Unknown Treasure Raid action.','UNKNOWN_ACTION',400);
  }
}
