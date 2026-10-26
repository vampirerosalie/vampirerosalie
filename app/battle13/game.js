import {createHash,createHmac,randomBytes,randomInt,timingSafeEqual} from 'node:crypto';
import {SETS,publicQuestion,mark,setList} from './sets.js';
import {MAP,COLORS,COLOR_NAMES,RULES} from '../../public/battle13/map-data.js';
export class GameError extends Error{constructor(message,code='INVALID_ACTION',status=409){super(message);this.code=code;this.status=status;}}
const fail=(m,c,s)=>{throw new GameError(m,c,s);};
const hash=v=>createHash('sha256').update(String(v)).digest('hex');
const equal=(a,b)=>typeof a==='string'&&typeof b==='string'&&a.length===b.length&&timingSafeEqual(Buffer.from(a),Buffer.from(b));
const name=v=>String(v??'').normalize('NFKC').replace(/[\u0000-\u001f\u007f]/g,'').trim().slice(0,28);
export class TerritoryGame{
  constructor({now=Date.now,random=randomInt,secret=randomBytes(32).toString('hex')}={}){Object.assign(this,{now,random,secret});this.rooms=new Map();this.lastSeen=new Map();}
  create(setId='science-f1-ch6'){
    if(typeof setId!=='string'||!Object.hasOwn(SETS,setId))fail('Choose an available question set.','INVALID_SET',400);
    const pin=String(10000+this.random(90000)),hostToken=randomBytes(32).toString('hex');
    const r={pin,setId,hostHash:hash(hostToken),createdAt:this.now(),expiresAt:this.now()+48*3600000,version:1,phase:'lobby',paused:false,questionIndex:0,startAt:null,endedAt:null,results:null,players:[],rounds:{},reviewVersion:0,receipts:{},log:[],tiles:MAP.map(t=>({...t,owner:null,fortress:false,shield:false,resolved:false,version:0}))};
    this.rooms.set(pin,r);return {pin,hostToken};
  }
  room(pin){const r=this.rooms.get(String(pin));if(!r||r.expiresAt<=this.now())fail('This room is unavailable. Ask your teacher for the current joining QR.','ROOM_NOT_FOUND',404);return r;}
  studentToken(r,id){return createHmac('sha256',this.secret).update(`territory:${r.pin}:${r.createdAt}:${id}`).digest('hex');}
  join(pin,{clientId,name:rawName}={}){
    const r=this.room(pin);if(typeof clientId!=='string'||!/^[-a-zA-Z0-9]{20,100}$/.test(clientId))fail('Reload to create your device identity.','BAD_IDENTITY',400);
    const old=r.players.find(p=>p.clientId===clientId);if(old)return {playerId:old.id,playerToken:this.studentToken(r,clientId)};
    if(r.phase==='ended')fail('This game has ended.','JOIN_CLOSED');if(r.players.length>=12)fail('All 12 team places are filled.','ROOM_FULL');
    const safeName=name(rawName);if(!safeName)fail('Enter your team name.','NAME_REQUIRED',400);
    const token=this.studentToken(r,clientId),id=randomBytes(12).toString('hex'),color=COLORS.find(c=>!r.players.some(p=>p.color===c));
    r.players.push({id,clientId,name:safeName,color,tokenHash:hash(token),balance:0,science:0,cards:[],responses:{},actionVersion:0,writingUntil:0});r.version++;r.reviewVersion++;
    return {playerId:id,playerToken:token};
  }
  auth(r,token){if(!token)return {role:'public'};const digest=hash(token);if(equal(digest,r.hostHash))return {role:'host'};const player=r.players.find(p=>equal(digest,p.tokenHash));if(!player)fail('This device key is not valid for this room.','UNAUTHORIZED',401);this.lastSeen.set(`${r.pin}:${player.id}`,this.now());return {role:'student',player};}
  question(r){return SETS[r.setId].questions[r.questionIndex];}
  round(r,q=this.question(r)){return r.rounds[q.id]??{};}
  isClosed(r,q=this.question(r)){const x=this.round(r,q);return r.phase!=='active'||!!x.closed||!!x.finalized||!!(x.deadline&&this.now()>=x.deadline);}
  standings(r,final=false){let prev='',rank=0;return r.players.map(p=>{const tiles=r.tiles.filter(t=>t.owner===p.id);return {id:p.id,name:p.name,color:p.color,territories:tiles.length,science:p.science,actions:Math.max(0,p.balance),debt:Math.max(0,-p.balance),fortresses:tiles.filter(t=>t.fortress).length,crown:tiles.some(t=>t.kind==='crown'),score:tiles.length+(final&&tiles.some(t=>t.kind==='crown')?RULES.crownBonus:0)};}).sort((a,b)=>b.score-a.score||b.science-a.science).map((p,i)=>{const key=p.score+':'+p.science;if(key!==prev)rank=i+1;prev=key;return {...p,rank};});}
  view(r,a){const q=this.question(r),round=this.round(r),now=this.now();const base={pin:r.pin,role:a.role,version:r.version,set:{id:r.setId,title:SETS[r.setId].title},phase:r.phase,serverTime:now,onlineCount:r.players.filter(p=>(this.lastSeen.get(`${r.pin}:${p.id}`)??0)>now-25000).length,joinedCount:r.players.length};if(a.role==='public')return base;
    const players=this.standings(r).map(p=>{const raw=r.players.find(x=>x.id===p.id),res=raw.responses[q.id];return {...p,online:(this.lastSeen.get(`${r.pin}:${p.id}`)??0)>now-25000,answerStatus:res?(res.unanswered?'Unanswered':'Answered'):raw.writingUntil>now?'Writing':'Waiting'};});
    const v={...base,players,tiles:r.tiles,question:publicQuestion(q),questionCount:SETS[r.setId].questions.length,paused:r.paused,answersClosed:this.isClosed(r),deadline:round.deadline??null,finalized:!!round.finalized,startedAt:r.startAt,endedAt:r.endedAt,log:r.log.slice(-30),...(r.results?{results:r.results}:{})};
    if(round.revealed)v.revealed={answer:q.answer,explanation:q.explanation,options:q.options};
    if(a.role==='host'){v.reviewVersion=r.reviewVersion;v.sets=setList();}
    if(a.role==='student'){const p=a.player,res=p.responses[q.id];v.me={...players.find(x=>x.id===p.id),actionVersion:p.actionVersion,cards:p.cards,response:res?{answer:res.answer,unanswered:!!res.unanswered,finalized:res.finalized,decision:res.finalized?res.awarded?'accept':'reject':res.auto?'accept':'reject'}:null};}
    return v;
  }
  state(pin,token){const r=this.room(pin);return this.view(r,this.auth(r,token));}
  review(pin,token,questionId){const r=this.room(pin);if(this.auth(r,token).role!=='host')fail('Teacher key required.','FORBIDDEN',403);const q=SETS[r.setId].questions.find(x=>x.id===(questionId??this.question(r).id));if(!q||q.number>r.questionIndex+1)fail('Question is not open.');return {question:q,reviewVersion:r.reviewVersion,questions:SETS[r.setId].questions.slice(0,r.questionIndex+1).map(publicQuestion),entries:r.players.map(p=>({id:p.id,name:p.name,response:p.responses[q.id]??null})),log:r.log};}
  action(pin,token,b={}){const r=this.room(pin),a=this.auth(r,token);if(a.role==='public')fail('Join this room first.','UNAUTHORIZED',401);if(typeof b.type!=='string'||!b.type.startsWith(a.role==='host'?'host:':'student:'))fail('That action requires a different role.','FORBIDDEN',403);if(!/^[-a-zA-Z0-9]{12,100}$/.test(b.requestId??''))fail('Request ID required.','MISSING_REQUEST_ID',400);
    const key=`${a.player?.id??'host'}:${b.requestId}`,signature=hash(JSON.stringify(b)),receipt=r.receipts[key];if(receipt){if(receipt.signature!==signature)fail('Request ID reused.','RECEIPT_CONFLICT');return {replayed:true,result:receipt.result,state:this.view(r,a)};}
    if(Object.keys(r.receipts).length>=30000&&b.type!=='host:end')fail('Room action limit reached. Finish this game.');
    const before=structuredClone(r);try{const result=this.apply(r,a,b)??null;r.version++;r.receipts[key]={signature,result};return {ok:true,result,state:this.view(r,a)};}catch(e){Object.keys(r).forEach(k=>delete r[k]);Object.assign(r,before);throw e;}
  }
  log(r,type,playerId,details){r.log.push({time:this.now(),type,playerId,...details});}
  finalize(r,p,q){const res=p.responses[q.id];if(!res||res.unanswered)return;const award=res.decision==='accept',delta=Number(award)-Number(!!res.awarded);if(delta){p.science+=delta;p.balance+=delta;p.actionVersion++;this.log(r,'mark-adjustment',p.id,{questionId:q.id,delta,balance:p.balance});}res.awarded=award;res.finalized=true;}
  apply(r,a,b){const q=this.question(r),p=a.player;
    if(b.type==='host:end'){if(r.phase==='ended')return {ended:true};if(b.confirm!==true)fail('Confirm End Game first.');r.phase='ended';r.paused=true;r.endedAt=this.now();r.results=this.standings(r,true);this.log(r,'end',null,{});return {ended:true};}
    if(r.phase==='ended')fail('This game has ended. Results are locked.','GAME_ENDED');
    if(b.type==='host:set'){if(r.phase!=='lobby')fail('Choose the set before starting.');if(typeof b.setId!=='string'||!Object.hasOwn(SETS,b.setId))fail('Unknown question set.');r.setId=b.setId;return;}
    if(b.type==='host:team'){const team=r.players.find(x=>x.id===b.playerId);if(!team)fail('Team not found.');const safeName=name(b.name);if(!safeName)fail('Enter a team name.');if(!COLORS.includes(b.color))fail('Choose a team colour.');const other=r.players.find(x=>x.id!==team.id&&x.color===b.color);if(other)other.color=team.color;team.name=safeName;team.color=b.color;return;}
    if(b.type==='host:start'){if(r.phase!=='lobby')fail('Game already started.');if(r.players.length<2)fail('At least two teams must join.');r.phase='active';r.startAt=this.now();return;}
    if(b.type==='host:pause'){if(typeof b.paused!=='boolean')fail('Choose pause or resume.');r.paused=b.paused;return;}
    if(r.phase!=='active')fail('Wait for your teacher to start.','NOT_STARTED');
    if(['host:countdown','host:close','host:finalize-all','host:reveal','host:next','student:submit','student:writing'].includes(b.type)&&b.questionId!==q.id)fail('The question changed. Check the current question.','STALE_QUESTION');
    if(b.type==='host:countdown'){if(this.isClosed(r))fail('Submissions are closed.');const round=r.rounds[q.id]??={};round.deadline??=this.now()+10000;return;}
    if(b.type==='host:close'){(r.rounds[q.id]??={}).closed=true;return;}
    if(b.type==='host:decision'||b.type==='host:finalize-one'){
      const targetQ=SETS[r.setId].questions.find(x=>x.id===b.questionId),team=r.players.find(x=>x.id===b.playerId),res=team?.responses[b.questionId];
      if(!targetQ||!res||res.unanswered)fail('No answer was submitted.','NO_SUBMISSION');if(b.reviewVersion!==r.reviewVersion)fail('Answers changed. Reopen review.','STALE_REVIEW');
      if(b.type==='host:decision'){if(!['accept','reject'].includes(b.decision))fail('Choose Accept or Mark wrong.');if(res.finalized&&b.amend!==true)fail('Confirm an amendment to the finalized mark.','CONFIRM_AMENDMENT');res.decision=b.decision;res.markedBy='teacher';if(res.finalized)this.finalize(r,team,targetQ);}
      else this.finalize(r,team,targetQ);
      r.reviewVersion++;return;
    }
    if(b.type==='host:finalize-all'){const round=r.rounds[q.id]??={};if(round.finalized)return;if(b.reviewVersion!==r.reviewVersion)fail('Answers changed. Reopen review before finalizing.','STALE_REVIEW');for(const team of r.players){if(!team.responses[q.id])team.responses[q.id]={answer:'',unanswered:true,finalized:true,awarded:false};else this.finalize(r,team,q);}round.closed=true;round.finalized=true;r.reviewVersion++;return;}
    if(b.type==='host:reveal'){if(!this.round(r).finalized)fail('Finalize this question first.');r.rounds[q.id].revealed=true;return;}
    if(b.type==='host:next'){if(!this.round(r).finalized)fail('Finalize answers before the next question.');if(r.questionIndex>=SETS[r.setId].questions.length-1)fail('All questions are complete. End Game when ready.');r.questionIndex++;r.reviewVersion++;for(const team of r.players)team.writingUntil=0;return;}
    if(b.type==='student:writing'){if(!this.isClosed(r)&&!p.responses[q.id])p.writingUntil=this.now()+9000;return;}
    if(b.type==='student:submit'){if(this.isClosed(r))fail('Submissions are closed.','ANSWER_TIME_UP');if(p.responses[q.id])fail('Your answer is already submitted.');if(typeof b.answer!=='string'||!b.answer.trim()||b.answer.length>200||(q.type==='mcq'&&!['A','B','C','D'].includes(b.answer)))fail('Enter a valid answer.','BAD_ANSWER',400);const auto=mark(q,b.answer);p.responses[q.id]={answer:b.answer,auto,decision:auto?'accept':'reject',finalized:false,awarded:false};p.writingUntil=0;r.reviewVersion++;return {submitted:true};}
    if(['student:claim','student:fortify','student:rebellion','student:shield'].includes(b.type)){
      if(r.paused)fail('Territory actions are paused by your teacher.','PAUSED');
      const tile=r.tiles.find(t=>t.id===b.tileId);if(!tile)fail('Choose a territory.');if(b.tileVersion!==tile.version||b.expectedVersion!==p.actionVersion)fail('This territory or your Actions changed. Check the new details and confirm again.','STALE_TARGET');
      const own=tile.owner===p.id;let cost=0,result;
      if(b.type==='student:claim'){if(own)fail('You already own this territory.');cost=!tile.owner?RULES.claim:tile.fortress?RULES.fortressCapture:RULES.capture;if(p.balance<cost)fail('Not enough Actions. Answer more questions.');if(tile.shield){tile.shield=false;result={art:'shield',title:'Shield blocked the capture',message:'The shield was consumed. No Actions were spent.'};}else{p.balance-=cost;tile.owner=p.id;tile.fortress=false;result={art:tile.kind==='crown'?'crown':'claim',title:'Territory claimed',message:`${cost} Action${cost===1?'':'s'} spent. This land is yours.`};if(tile.kind==='mystery'&&!tile.resolved){tile.resolved=true;const roll=this.random(100);if(roll<RULES.mystery[0]){p.balance++;result={art:'energy',title:'A spark of opportunity',message:'Mystery Land gave you 1 additional Action.'};}else if(roll<RULES.mystery[0]+RULES.mystery[1]){const card=RULES.cards[this.random(RULES.cards.length)];p.cards.push(card);result={art:card,title:`${card==='shield'?'Shield':'Rebellion'} card discovered`,message:'A one-use card has been added to your collection.'};}else{tile.owner=null;result={art:'trap',title:'The land slipped away',message:'This territory returned to neutral. Your claim Action was spent.'};}}}}
      if(b.type==='student:fortify'){if(!own||tile.fortress)fail('Choose your own unfortified land.');if(r.tiles.filter(t=>t.owner===p.id&&t.fortress).length>=RULES.maxFortresses)fail('You already have three active Fortresses.');cost=RULES.fortify;if(p.balance<cost)fail('Not enough Actions.');p.balance-=cost;tile.fortress=true;result={art:'fortress',title:'Fortress constructed',message:'Capturing this land now costs an opponent 3 Actions.'};}
      if(b.type==='student:shield'){const i=p.cards.indexOf('shield');if(i<0)fail('You do not have a Shield card.');if(!own||tile.shield)fail('Choose your own unshielded land.');p.cards.splice(i,1);tile.shield=true;result={art:'shield',title:'Shield placed',message:'This land will block the next capture or rebellion.'};}
      if(b.type==='student:rebellion'){const i=p.cards.indexOf('rebellion');if(i<0)fail('You do not have a Rebellion card.');if(!tile.owner||own||tile.fortress)fail('Choose an enemy territory without a Fortress.');p.cards.splice(i,1);if(tile.shield){tile.shield=false;result={art:'shield',title:'Shield blocked the rebellion',message:'The Shield and your Rebellion card were consumed. No Actions were spent.'};}else{tile.owner=null;result={art:'rebellion',title:'Rebellion succeeded',message:'The enemy territory is now neutral.'};}}
      tile.version++;p.actionVersion++;this.log(r,b.type,p.id,{tileId:tile.id,cost:result.title.startsWith('Shield blocked')?0:cost,owner:tile.owner,art:result.art});return result;
    }
    fail('Unknown action.','UNKNOWN_ACTION',400);
  }
}
