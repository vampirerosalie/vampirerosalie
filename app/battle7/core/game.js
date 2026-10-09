import {randomBytes, randomInt, createHash, createHmac, timingSafeEqual} from 'node:crypto';

export const INGREDIENTS = ['Bread','Egg','Cheese','Tomato','Chicken','Mushroom','Milk','Chocolate','Fruit','Rice'];
export const recipeKey = xs => [...xs].sort().join('|');
const entries = [
 ['Mini Pizza','🍕',2,'Bread Cheese Tomato'],
 ['Breakfast Sandwich','🥪',1,'Bread Egg Cheese'],
 ['Chicken Mushroom Rice','🍚',2,'Rice Chicken Mushroom'],
 ["Chef’s Special Chicken",'🍗',3,'Chicken Tomato Cheese'],
 ['Chocolate Berry Shake','🥤',2,'Chocolate Fruit Milk'],
 ['Creamy Mushroom Toast','🍄',2,'Bread Mushroom Milk'],
 ['Egg Fried Rice','🍳',2,'Rice Egg Tomato'],
 ['Cheesy Rice Bowl','🍚',1,'Rice Cheese Milk'],
 ['Chicken & Egg Bowl','🍜',2,'Rice Chicken Egg'],
 ['Garden Rice','🥗',2,'Rice Tomato Mushroom'],
 ['Mushroom Omelette','🍳',2,'Egg Mushroom Cheese'],
 ['Fluffy Scrambled Eggs','🍳',1,'Egg Cheese Milk'],
 ['Tomato Omelette','🍅',2,'Egg Tomato Cheese'],
 ['French Toast','🍞',2,'Bread Egg Milk'],
 ['Chocolate Toast','🍫',1,'Bread Chocolate Milk'],
 ['Fruit Toast','🍓',1,'Bread Fruit Milk'],
 ['Fruit & Chocolate Tart','🥧',2,'Bread Chocolate Fruit'],
 ['Chicken Sandwich','🥪',2,'Bread Chicken Tomato'],
 ['Cheesy Chicken Toast','🥪',2,'Bread Chicken Cheese'],
 ['Mushroom Melt','🥪',2,'Bread Mushroom Cheese'],
 ['Tomato Soup','🥣',1,'Tomato Milk Cheese'],
 ['Creamy Chicken Soup','🥣',2,'Chicken Mushroom Milk'],
 ['Garden Soup','🥣',1,'Tomato Mushroom Milk'],
 ['Creamy Mushroom Rice','🍚',2,'Rice Mushroom Milk'],
 ['Chocolate Rice Pudding','🍮',2,'Rice Chocolate Milk'],
 ['Fruity Rice Pudding','🍮',2,'Rice Fruit Milk'],
 ['Chocolate Custard','🍮',2,'Egg Chocolate Milk'],
 ['Fruit Custard','🍮',2,'Egg Fruit Milk'],
 ['Sweet & Tangy Chicken','🍍',2,'Chicken Fruit Tomato'],
 ['Cheese & Fruit Platter','🧀',1,'Bread Cheese Fruit'],
 ['Double Bread Toastie','🥪',1,'Bread Bread Cheese'],
 ['Double Egg Omelette','🍳',1,'Egg Egg Cheese'],
 ['Double Chocolate Shake','🥤',2,'Chocolate Chocolate Milk'],
 ['Double Fruit Shake','🥤',1,'Fruit Fruit Milk'],
 ['Chocolate Bread Pudding','🍮',2,'Bread Egg Chocolate'],
 ['Chocolate Fruit Cheesecake','🍰',3,'Chocolate Fruit Cheese'],
 ['Chocolate Fruit Pancake','🥞',3,'Chocolate Egg Fruit'],
 ['Fruity Chicken Rice','🍚',3,'Fruit Rice Chicken'],
 ['Cheesy Mushroom Risotto','🍚',2,'Mushroom Rice Cheese'],
 ['Garden Toast','🍞',1,'Bread Tomato Mushroom'],
 ['Sneaky Snack','🦝',0,'Bread Mushroom Fruit','steal'],
];
export const RECIPES = Object.fromEntries(entries.map(([name,emoji,stars,items,type='dish']) => {
 const ingredients=items.split(' '); return [recipeKey(ingredients),{name,emoji,stars,ingredients,type,success:true}];
}));
export class GameError extends Error { constructor(message,code='INVALID_ACTION',status=400){super(message);this.code=code;this.status=status;} }
const fail=(message,code,status)=>{throw new GameError(message,code,status);};
const hash=x=>createHash('sha256').update(x).digest('hex');
const secureEqual=(a,b)=>typeof a==='string' && typeof b==='string' && a.length===b.length && timingSafeEqual(Buffer.from(a),Buffer.from(b));
const shuffle=(a)=>{a=[...a];for(let i=a.length-1;i>0;i--){const j=randomInt(i+1);[a[i],a[j]]=[a[j],a[i]];}return a;};
const cleanName=(s,max)=>String(s??'').normalize('NFKC').replace(/[\u0000-\u001f\u007f]/g,'').trim().slice(0,max);
export function normalizeAnswer(s){return String(s).normalize('NFKC').replace(/[‘’ʼ]/g,"'").trim().replace(/\s+/g,' ').replace(/\s*'\s*/g,"'").replace(/[.!?]+$/,'').trim().toLowerCase();}
const freshBag=()=>Object.fromEntries(INGREDIENTS.map(x=>[x,0]));
const countBag=bag=>Object.values(bag).reduce((a,b)=>a+b,0);
const rewardItems=submission=>Array.isArray(submission?.rewards)&&submission.rewards.length?submission.rewards:submission?.reward?[submission.reward]:[];
const rewardCounts=submission=>rewardItems(submission).reduce((bag,item)=>(bag[item]=(bag[item]??0)+1,bag),{});
const rewardLocked=(team,submission)=>submission?.status==='accepted'&&(submission.rewardSpent===true||Object.entries(rewardCounts(submission)).some(([item,quantity])=>team.inventory[item]<quantity));
// Source token IDs are authoring metadata and may encode answer order. Never
// publish them. A keyed, room-specific presentation ID is stable on reconnect
// but reveals no original position, including for previously saved rooms.
const publicQuestion=(q,tokenId)=>{
 if(!q)return null;
 const shown=Object.fromEntries(['id','format','instruction','instructionZh','promptSegments','options'].filter(k=>q[k]!==undefined).map(k=>[k,q[k]]));
 if(q.tokens)shown.tokens=q.tokens.map(({id,text})=>({id:tokenId(id),text}));
 return shown;
};

function visibleCook(cook,auth){
 if(auth.role==='host'||(auth.role==='team'&&auth.team.id===cook.teamId))return cook;
 // Shared reveals celebrate the outcome, not another team's hidden recipe.
 const {id,teamId,teamName,starsEarned,discoveryBonus,isNewForTeam,at}=cook;
 const {name,emoji,stars,success,type}=cook.dish;
 return {id,teamId,teamName,dish:{name,emoji,stars,success,type},starsEarned,discoveryBonus,isNewForTeam,at};
}

export class GameStore {
 constructor({questions,now=Date.now,random=randomInt,retentionHours=48,ingredientWeights={},secret=randomBytes(32).toString('hex')}={}){
  if(!questions||questions.length!==20)throw new Error('Exactly 20 questions required.');
  this.questions=questions;this.now=now;this.random=random;this.retentionMs=retentionHours*3600000;this.rooms=new Map();this.lastSeen=new Map();
  this.weights=Object.fromEntries(INGREDIENTS.map(x=>[x,ingredientWeights[x]??1]));
  if(Object.values(this.weights).some(x=>!Number.isInteger(x)||x<0||x>100)||!Object.values(this.weights).some(Boolean))throw new Error('Ingredient weights must be integers 0–100, with at least one positive weight.');
  this.secret=secret;
 }
 // Persistence belongs to the request-local D1 adapter; the game core has no I/O.
 save(){}
 prune(){for(const [pin,r]of this.rooms){if(r.expiresAt<=this.now())this.rooms.delete(pin);}}
 room(pin){if(!/^\d{5}$/.test(String(pin)))fail('Enter the five-digit kitchen PIN.','INVALID_PIN');const r=this.rooms.get(String(pin));if(!r||r.expiresAt<=this.now()){this.prune();fail('This kitchen is unavailable or has expired. Ask your teacher for the new PIN.','ROOM_NOT_FOUND',404);}return r;}
 create({teamCount=10,roomName='Crazy Kitchen'}={}){
  if(!Number.isInteger(teamCount)||teamCount<2||teamCount>10)fail('Choose 2–10 teams.');
  this.prune();if(this.rooms.size>=100)fail('This server has reached its room limit.','CAPACITY',503);
  let pin;do{pin=String(randomInt(10000,100000));}while(this.rooms.has(pin));
  const hostToken=randomBytes(32).toString('hex');const now=this.now();
  const questionSet=shuffle(this.questions).map(q=>({...structuredClone(q),...(q.options?{options:shuffle(q.options)}:{})}));
  const r={pin,roomName:cleanName(roomName,48)||'Crazy Kitchen',hostHash:hash(hostToken),createdAt:now,expiresAt:now+this.retentionMs,phase:'lobby',version:1,teamCount,questionIndex:-1,questions:questionSet,teams:[],submissions:{},discoveries:{},latestCooks:[],events:[],rushEndsAt:null,answerCountdownEndsAt:null,rushNumber:0,incomingThefts:{},receipts:{},weights:this.weights};
  this.save(r);this.rooms.set(pin,r);return {pin,hostToken};
 }
 teamToken(r,clientId){return createHmac('sha256',this.secret).update(`team:${r.pin}:${r.createdAt}:${clientId}`).digest('hex');}
 join(pin,{teamSlot,name,clientId}={}){
  const r=this.room(pin);if(typeof clientId!=='string'||!/^[-a-zA-Z0-9]{20,100}$/.test(clientId))fail('Your device identity is missing. Reload this page.','BAD_IDENTITY');
  const existing=r.teams.find(t=>t.clientId===clientId);if(existing){this.touch(r,existing);return {teamId:existing.id,teamToken:this.teamToken(r,clientId)};}
  if(r.phase!=='lobby')fail('This kitchen has already started. Ask your teacher to open another room.','JOIN_CLOSED',409);
  if(!Number.isInteger(teamSlot)||teamSlot<1||teamSlot>r.teamCount)fail('Choose an available team station.');
  if(r.teams.some(t=>t.slot===teamSlot))fail('That station was just taken. Pick another one.','SLOT_TAKEN',409);
  name=cleanName(name,28);if(!name)fail('Enter a team nickname.');
  const token=this.teamToken(r,clientId);const t={id:randomBytes(8).toString('hex'),slot:teamSlot,name,clientId,tokenHash:hash(token),stars:0,inventory:freshBag(),recipes:{},powers:[]};
  r.teams.push(t);r.version++;this.save(r);this.touch(r,t);return {teamId:t.id,teamToken:token};
 }
 auth(r,token){if(!token)return {role:'public'};const h=hash(String(token));if(secureEqual(h,r.hostHash))return {role:'host'};const team=r.teams.find(t=>secureEqual(h,t.tokenHash));if(team){this.touch(r,team);return{role:'team',team};}fail('This device key is no longer valid. Rejoin the kitchen.','UNAUTHORIZED',401);}
 touch(r,t){this.lastSeen.set(`${r.pin}:${t.id}`,this.now());}
 currentQuestion(r){return r.questions[r.questionIndex]??null;}
 // Saved rooms may still be in the old rush phase. Treat those as an
 // untimed, already-revealed question until the teacher advances.
 cookingAvailable(r){return ['question','reveal','rush'].includes(r.phase);}
 state(pin,token){const r=this.room(pin);const auth=this.auth(r,token);return this.view(r,auth);}
 view(r,auth){
  const q=this.currentQuestion(r);const submissions=q?r.submissions[q.id]??{}:{};
  const showAnswer=['reveal','rush','finished'].includes(r.phase);
  const tokenId=id=>createHmac('sha256',this.secret).update(`rebuild:${r.pin}:${r.createdAt}:${q?.id}:${id}`).digest('hex').slice(0,24);
  const data={pin:r.pin,roomName:r.roomName,phase:r.phase,version:r.version,serverTime:this.now(),expiresAt:r.expiresAt,role:auth.role,teamCount:r.teamCount,questionNumber:r.questionIndex+1,totalQuestions:r.questions.length,question:publicQuestion(q,tokenId),answerReveal:showAnswer&&q?{canonicalAnswer:q.canonicalAnswer,feedback:q.feedback}:null,cookingAvailable:this.cookingAvailable(r),rushEndsAt:null,answerCountdownEndsAt:r.answerCountdownEndsAt??null,rushEnded:false,rushNumber:r.rushNumber??0,teams:r.teams.map(t=>({id:t.id,slot:t.slot,name:t.name,stars:t.stars,inventoryCount:countBag(t.inventory),acceptedCount:Object.values(r.submissions).filter(s=>s[t.id]?.status==='accepted').length,submissionStatus:submissions[t.id]?.status??'waiting',online:(this.lastSeen.get(`${r.pin}:${t.id}`)??0)>this.now()-20000,recipesCount:Object.keys(t.recipes).length,canBeStolenFrom:this.cookingAvailable(r)&&countBag(t.inventory)>0&&!r.incomingThefts[t.id]})).sort((a,b)=>a.slot-b.slot),latestCooks:r.latestCooks.slice(-100).map(cook=>visibleCook(cook,auth)),events:r.events.slice(-10),takenSlots:r.teams.map(t=>t.slot),winners:['finished','closed'].includes(r.phase)?r.teams.filter(t=>t.stars===Math.max(...r.teams.map(t=>t.stars))).filter(t=>Object.values(r.submissions).filter(s=>s[t.id]?.status==='accepted').length===Math.max(...r.teams.filter(x=>x.stars===Math.max(...r.teams.map(y=>y.stars))).map(x=>Object.values(r.submissions).filter(s=>s[x.id]?.status==='accepted').length))).map(t=>t.id):[]};
  if(auth.role==='host'){data.answerKey=q?Object.fromEntries(['canonicalAnswer','acceptedVariants','correctOptionId','targetTense','feedback','canonicalTokenOrder','acceptedTokenOrders'].filter(k=>q[k]!==undefined).map(k=>[k,k==='canonicalTokenOrder'?q[k].map(tokenId):k==='acceptedTokenOrders'?q[k].map(order=>order.map(tokenId)):q[k]])):null;data.submissions=r.teams.map(t=>{const s=submissions[t.id],rewards=s?.status==='accepted'?rewardItems(s):[];return{teamId:t.id,teamName:t.name,answer:s?.answer??'',status:s?.status??'waiting',unanswered:Boolean(s?.unanswered),reward:rewards[0]??null,rewards,rewardLocked:rewardLocked(t,s)};});data.settings={cookingMode:'anytime',teamCount:r.teamCount,ingredientWeights:r.weights,theftRecipe:'Sneaky Snack',theftMaxIncomingPerQuestion:1};data.joinPath=`/?battle=7&join=${r.pin}`;}
  if(auth.role==='team'){const t=auth.team;const s=submissions[t.id],rewards=s?.status==='accepted'?rewardItems(s):[];data.me={id:t.id,name:t.name,slot:t.slot,stars:t.stars,inventory:{...t.inventory},recipes:Object.values(t.recipes),powers:t.powers.map(p=>({...p})),submission:s?{answer:s.answer,status:s.status,unanswered:Boolean(s.unanswered),reward:rewards[0]??null,rewards}:null};}
  return data;
 }
 event(r,text){r.events.push({id:randomBytes(8).toString('hex'),text,at:this.now()});r.events=r.events.slice(-100);}
 ingredient(r){const total=Object.values(r.weights).reduce((a,b)=>a+b,0);let pick=this.random(total);for(const [item,weight] of Object.entries(r.weights)){pick-=weight;if(pick<0)return item;}throw new Error('Invalid ingredient roll');}
 consume(r,team,ingredients){
  for(const item of ingredients)team.inventory[item]--;
  // Older ingredients of the same kind are spent first. Once the current
  // answer's reward is used up, a later theft/reward cannot make it reversible
  // again. Only the current question can still be reviewed by the teacher.
  const submission=r.submissions[this.currentQuestion(r)?.id]?.[team.id];
  if(submission?.status==='accepted'&&Object.entries(rewardCounts(submission)).some(([item,quantity])=>team.inventory[item]<quantity))submission.rewardSpent=true;
 }
 action(pin,token,body={}){
  let r=this.room(pin);const auth=this.auth(r,token);
  if(auth.role==='public')fail('A teacher or team key is required.','UNAUTHORIZED',401);
  const {type,requestId}=body;if(typeof requestId!=='string'||!/^[-a-zA-Z0-9]{12,100}$/.test(requestId))fail('An action receipt ID is required.','MISSING_REQUEST_ID');
  if((String(type).startsWith('host:')&&auth.role!=='host')||(String(type).startsWith('pupil:')&&auth.role!=='team'))fail('This action belongs to another role.','FORBIDDEN',403);
  const actor=auth.role==='host'?'host':auth.team.id;const receiptKey=`${actor}:${requestId}`;const signature=hash(JSON.stringify({...body,requestId:undefined}));
  const receipt=r.receipts[receiptKey];if(receipt){if(receipt.signature!==signature)fail('This receipt ID was already used for a different action.','RECEIPT_CONFLICT',409);return{ok:true,replayed:true,result:receipt.result,state:this.view(r,auth)};}
  if(r.phase==='closed')fail('This kitchen is closed.','ROOM_CLOSED',409);
  // A never-committed offline command must not act on a later round/phase.
  // This check deliberately follows receipt replay, so a committed retry can
  // still retrieve its original result after the class has moved on.
  if(['host:start-countdown','host:reveal','host:advance','host:end-rush','pupil:cook','pupil:steal'].includes(type)){
   const sameCookingWindow=['pupil:cook','pupil:steal'].includes(type)&&this.cookingAvailable(r)&&['question','reveal','rush'].includes(body.expectedPhase);
   if(body.questionId!==this.currentQuestion(r)?.id||(body.expectedPhase!==r.phase&&!sameCookingWindow))fail('That round or phase has ended. Nothing was changed.','STALE_CONTEXT',409);
  }
  const backup=structuredClone(r);let result;
  try{result=this.apply(r,auth,body);r.version++;r.receipts[receiptKey]={signature,result,at:this.now()};this.save(r);}catch(e){this.rooms.set(pin,backup);throw e;}
  return{ok:true,result,state:this.view(r,auth)};
 }
 apply(r,auth,b){
  const q=this.currentQuestion(r);const requirePhase=(phase)=>{if(r.phase!==phase)fail(`This action is only available during ${phase}.`,'WRONG_PHASE',409);};
  const requireCooking=()=>{if(!this.cookingAvailable(r))fail('Cooking is only available while the kitchen is open.','WRONG_PHASE',409);};
  switch(b.type){
   case 'host:configure':{
    requirePhase('lobby');
    if(!Number.isInteger(b.teamCount)||b.teamCount<2||b.teamCount>10)fail('Choose 2–10 teams.');
    if(r.teams.some(t=>t.slot>b.teamCount))fail('A joined team is using a higher station. Keep that station available.','STATION_OCCUPIED',409);
    r.teamCount=b.teamCount;return{teamCount:r.teamCount};
   }
   case 'host:start': requirePhase('lobby');if(r.teams.length<r.teamCount)fail(`Waiting for all ${r.teamCount} team stations to join.`, 'NEED_TEAMS',409);r.phase='question';r.questionIndex=0;r.answerCountdownEndsAt=null;this.event(r,'The kitchen is open!');return{started:true};
   case 'host:start-countdown':{
    requirePhase('question');if(b.questionId!==q.id)fail('That question is no longer open.','STALE_QUESTION',409);
    if(!r.answerCountdownEndsAt)r.answerCountdownEndsAt=this.now()+10000;
    return{answerCountdownEndsAt:r.answerCountdownEndsAt};
   }
   case 'pupil:submit':{
    requirePhase('question');if(b.questionId!==q.id)fail('That question has ended. Your answer was not submitted to the new round.','STALE_QUESTION',409);
    if(r.answerCountdownEndsAt&&this.now()>=r.answerCountdownEndsAt)fail('Time is up. Your teacher can review the answers now.','ANSWER_TIME_UP',409);
    if(typeof b.answer!=='string'||!b.answer.trim()||b.answer.length>500)fail('Enter an answer of 1–500 characters.');
    const subs=r.submissions[q.id]??={};if(subs[auth.team.id])fail('Your team has already submitted this answer.','ALREADY_SUBMITTED',409);
    subs[auth.team.id]={answer:b.answer.trim(),status:'submitted',rewards:null,at:this.now()};return{submitted:true};
   }
   case 'host:review':{
    requirePhase('question');if(b.questionId!==q.id)fail('That question is no longer open.','STALE_QUESTION',409);if(!['accepted','rejected'].includes(b.decision))fail('Choose Accept or Reject.');
    const team=r.teams.find(t=>t.id===b.teamId);if(!team)fail('That team is unavailable.','TEAM_NOT_FOUND',404);
    const subs=r.submissions[q.id]??={};let sub=subs[b.teamId];
    if(!sub){
     if(b.decision!=='rejected')fail('A team that did not answer can only be marked wrong.','NO_SUBMISSION',409);
     sub={answer:'',status:'rejected',rewards:null,at:this.now(),unanswered:true};subs[b.teamId]=sub;return{decision:'rejected',reward:null,rewards:[],unanswered:true};
    }
    if(sub.status===b.decision){const rewards=sub.status==='accepted'?rewardItems(sub):[];return{decision:sub.status,reward:rewards[0]??null,rewards};}
    if(sub.status==='accepted'){
     if(rewardLocked(team,sub))fail('One or both of this answer’s ingredients have already been used or stolen. Its accepted reward can no longer be reversed.','REWARD_ALREADY_USED',409);
     for(const item of rewardItems(sub))team.inventory[item]--;
    }
    if(b.decision==='accepted'){if(!rewardItems(sub).length)sub.rewards=[this.ingredient(r),this.ingredient(r)];for(const item of rewardItems(sub))team.inventory[item]++;}
    sub.status=b.decision;const rewards=sub.status==='accepted'?rewardItems(sub):[];return{decision:sub.status,reward:rewards[0]??null,rewards};
   }
   case 'host:reveal': requirePhase('question');if(Object.values(r.submissions[q.id]??{}).some(s=>s.status==='submitted'))fail('Review every submitted answer before revealing.','REVIEWS_PENDING',409);r.phase='reveal';r.answerCountdownEndsAt=null;return{revealed:true};
   case 'host:advance':{
    if(!['reveal','rush'].includes(r.phase))fail('Reveal the answer before moving on.','WRONG_PHASE',409);
    r.rushEndsAt=null;r.answerCountdownEndsAt=null;
    if(r.questionIndex===r.questions.length-1){r.phase='finished';this.event(r,'Service complete. Meet your Master Chefs!');}
    else{r.questionIndex++;r.phase='question';r.incomingThefts={};}
    return{phase:r.phase};
   }
   // Backward-compatible acknowledgement for an old client's queued command.
   // New clients never create a timed rush or need to send this action.
   case 'host:end-rush':requirePhase('rush');r.rushEndsAt=null;return{rushEnded:true};
   case 'pupil:cook':{
    requireCooking();
    const xs=b.ingredients;if(!Array.isArray(xs)||xs.length!==3||xs.some(x=>!INGREDIENTS.includes(x)))fail('Select exactly three ordinary ingredients.');
    const needed=freshBag();for(const x of xs)needed[x]++;const t=auth.team;if(INGREDIENTS.some(x=>t.inventory[x]<needed[x]))fail('Your ingredient bag changed. Choose again.','NOT_ENOUGH_INGREDIENTS',409);
    this.consume(r,t,xs);
    const key=recipeKey(xs);const recipe=RECIPES[key];let dish,starsEarned=0,discoveryBonus=0,isNewForTeam=false,power=null;
    if(recipe){dish={...recipe};isNewForTeam=!t.recipes[key];t.recipes[key]=dish;if(recipe.type==='steal'){power={id:randomBytes(10).toString('hex'),type:'steal'};t.powers.push(power);}else{if(!r.discoveries[key]){r.discoveries[key]={teamId:t.id,at:this.now()};discoveryBonus=1;}starsEarned=recipe.stars+discoveryBonus;t.stars+=starsEarned;}}
    // Any valid experiment makes a basic dish. Only catalogue recipes count
    // as discoveries; new combinations cannot farm first-discovery bonuses.
    else{dish={name:'Creative Kitchen Dish',emoji:'🍽️',stars:1,success:true,type:'basic'};starsEarned=1;t.stars+=starsEarned;}
    const cook={id:randomBytes(10).toString('hex'),teamId:t.id,teamName:t.name,dish,ingredients:[...xs],starsEarned,discoveryBonus,isNewForTeam,at:this.now()};r.latestCooks.push(cook);r.latestCooks=r.latestCooks.slice(-100);
    this.event(r,`${t.name} cooked ${dish.name}${starsEarned?` and earned ${starsEarned} star${starsEarned===1?'':'s'}`:recipe?.type==='steal'?' and found a Sneaky Snack power':'! A brave experiment'}.`);
    return{cook,power};
   }
   case 'pupil:steal':{
    requireCooking();
    const t=auth.team;const p=t.powers.find(p=>p.id===b.powerId&&p.type==='steal');if(!p)fail('That Sneaky Snack has already been used or is unavailable.','NO_POWER',409);
    const rival=r.teams.find(t=>t.id===b.targetTeamId);if(!rival||rival.id===t.id)fail('Choose a rival team.');if(r.incomingThefts[rival.id])fail('This rival has already lost an ingredient this question. Your power is still saved.','TARGET_PROTECTED',409);
    const available=INGREDIENTS.flatMap(x=>Array(rival.inventory[x]).fill(x));if(!available.length)fail('That rival has no ingredients. Your power is still saved.','EMPTY_TARGET',409);
    const item=available[this.random(available.length)];this.consume(r,rival,[item]);t.inventory[item]++;t.powers=t.powers.filter(x=>x.id!==p.id);r.incomingThefts[rival.id]=true;this.event(r,`${t.name} used a Sneaky Snack to take one ${item} from ${rival.name}.`);return{ingredient:item,targetTeamId:rival.id};
   }
   case 'host:close':r.phase='closed';r.rushEndsAt=null;r.answerCountdownEndsAt=null;return{closed:true};
   default:fail('Unknown action.');
  }
 }
}
