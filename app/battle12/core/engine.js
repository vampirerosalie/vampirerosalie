// Supplied V02 engine. Only its module wrapper is adapted for Cloudflare ESM.
  const CREWS = [
    { id: 'coral', name: 'Coral Corsairs', color: '#ffad87', flag: '☀' },
    { id: 'jade', name: 'Jade Voyagers', color: '#8ce0c3', flag: '✦' },
    { id: 'indigo', name: 'Indigo Explorers', color: '#b9b9ff', flag: '☽' }
  ];
  const LOCATIONS = [
    { id: 'camp', name: 'Camp', subtitle: 'Make your treasure safe', x: 23, y: 64, icon: '⚑' },
    { id: 'cave', name: 'Crystal Cave', subtitle: 'Reliable small finds', x: 24, y: 22, icon: '◆' },
    { id: 'bridge', name: 'Rope Bridge', subtitle: 'A balanced adventure', x: 49, y: 20, icon: '≋' },
    { id: 'ruins', name: 'Old Ruins', subtitle: 'Discover useful cards', x: 75, y: 18, icon: '▤' },
    { id: 'temple', name: 'Sun Temple', subtitle: 'Bigger finds · bigger risks', x: 79, y: 43, icon: '✧' },
    { id: 'harbor', name: 'Hidden Harbor', subtitle: 'Treasures by the sea', x: 81, y: 72, icon: '⚓' }
  ];
  const DECKS = {
    cave: [{kind:'gems',value:2,weight:50},{kind:'gems',value:3,weight:50}],
    bridge: [{kind:'trap',value:2,weight:20},{kind:'gems',value:2,weight:30},{kind:'gems',value:5,weight:50}],
    ruins: [{kind:'gems',value:1,weight:20},{kind:'raid',weight:30},{kind:'sabotage',weight:20},{kind:'shield',weight:30}],
    temple: [{kind:'trap',value:4,weight:40},{kind:'gems',value:2,weight:20},{kind:'gems',value:8,weight:40}],
    harbor: [{kind:'gems',value:2,weight:40},{kind:'gems',value:4,weight:30},{kind:'raid',weight:10},{kind:'sabotage',weight:10},{kind:'shield',weight:10}]
  };
  function normalize(value) {
    return String(value ?? '').normalize('NFKC').toLocaleLowerCase('en').replace(/[‘’]/gu, "'").replace(/[‐‑‒–—]/gu, '-').trim().replace(/^[\s"'“”«».,!?;:()[\]{}]+|[\s"'“”«».,!?;:()[\]{}]+$/gu, '').replace(/\s+/gu, ' ').trim();
  }
  function suggestAnswer(raw,item) { const normalized=normalize(raw); if(!normalized) return {status:'empty',wordCount:0,overWordLimit:false}; const wordCount=normalized.split(' ').length,overWordLimit=wordCount>3; return {status:item.acceptedAnswers.some(a=>normalize(a)===normalized)&&!overWordLimit?'suggest_accept':'teacher_review',wordCount,overWordLimit}; }
  function matches(value, answers) { return suggestAnswer(value,{acceptedAnswers:answers||[]}).status==='suggest_accept'; }
  function createState(contentId) {
    return { version:2, contentId, questionIndex:0, phase:'reading', paused:true, revealed:{}, revision:0, operations:[], role:'crew', crewId:'coral', seed:1729,
      crews:CREWS.map(c=>({...c, bag:0, vault:0, actions:0, cards:[], shields:0, responses:{}, attacks:{}, location:'camp', settled:false})),
      log:[{text:'Welcome aboard. Read the story, then open the first question.',kind:'info'}] };
  }
  function getCrew(state,id) { const crew = state.crews.find(c=>c.id===id); if(!crew) throw Error('Choose a crew.'); return crew; }
  function log(state,text,kind='info') { state.log.unshift({text,kind}); state.log=state.log.slice(0,50); }
  function question(content,state) { return content.items[state.questionIndex]; }
  function submit(state,content,id,value) {
    if(state.phase!=='questions') throw Error('This question is not open for answers.');
    const crew=getCrew(state,id), q=question(content,state), previous=crew.responses[q.id];
    if(state.revealed[q.id]) throw Error('This answer has been revealed. New submissions are closed.');
    if(previous?.status==='accepted') throw Error('This answer has already earned its action.');
    if(previous?.status==='submitted') throw Error('Your answer is waiting for teacher review.');
    if(!String(value).trim()) throw Error('Write an answer before submitting.');
    const history=previous?[...(previous.history||[]),{value:previous.value,status:previous.status,source:previous.source||'typed'}]:[];
    crew.responses[q.id]={value:String(value),status:'submitted',attempts:(previous?.attempts||0)+1,awarded:previous?.awarded||false,preReveal:true,history};
  }
  function review(state,content,id,decision) {
    if(state.phase!=='questions') throw Error('Review is closed.');
    const crew=getCrew(state,id), q=question(content,state), response=crew.responses[q.id];
    if(!response || response.status!=='submitted') throw Error('There is no new answer to review.');
    if(decision==='accept') {
      response.status='accepted';
      if(!response.awarded) { response.awarded=true; crew.actions++; log(state,`${crew.name} earned an action.`, 'success'); }
    } else if(decision==='revise') { response.status=state.revealed[q.id]?'closed':'revise'; }
    else throw Error('Choose Accept or Revise.');
  }
  function start(state) { if(state.phase!=='reading') throw Error('The voyage has already started.'); state.phase='questions'; state.paused=false; log(state,'Question 1 is open for every crew.'); }
  function pause(state,value) { if(!['questions','finalPlay'].includes(state.phase)) throw Error('Game pause is not available now.'); state.paused=value; log(state,value?'Game actions paused. Answers and review stay open.':'Game actions resumed.'); }
  function reveal(state,content) { if(state.phase!=='questions') throw Error('No question to reveal.'); const q=question(content,state); state.revealed[q.id]=true; state.paused=true; log(state,`Answer ${state.questionIndex+1} revealed. Existing submissions can still be marked.`); }
  function advance(state,content,skip=false) {
    if(state.phase!=='questions') throw Error('Questions are not in progress.');
    const q=question(content,state);
    const unfinished=state.crews.some(c=>c.responses[q.id]?.status!=='accepted');
    if(unfinished&&!skip) throw Error('Some crews have not been accepted yet.');
    if(state.crews.some(c=>c.responses[q.id]?.status==='submitted')) throw Error('Mark every submitted answer before moving on.');
    if(state.questionIndex<content.items.length-1) { state.questionIndex++; log(state,`Question ${state.questionIndex+1} is open for every crew.`); }
    else { state.phase='finalPlay'; state.paused=false; log(state,'Final normal play: use or save your earned actions before final banking.'); }
  }
  function random(state,n) { state.seed=(Math.imul(1664525,state.seed)+1013904223)>>>0; return Math.floor(state.seed/4294967296*n); }
  function explore(state,id,location) {
    if(!['questions','finalPlay'].includes(state.phase)||state.paused) throw Error('Exploration is paused or closed.');
    if(!DECKS[location]) throw Error('Choose an exploration location.');
    const crew=getCrew(state,id); if(crew.actions<1) throw Error('You need 1 action to explore.');
    crew.actions--; crew.location=location;
    const roll=random(state,100); let sum=0; const event={...DECKS[location].find(e=>(sum+=e.weight)>roll)};
    if(event.kind==='gems') { crew.bag+=event.value; event.title=`Found ${event.value} gems!`; event.message='These gems are in your backpack. Bank them at Camp to make them safe.'; }
    else if(event.kind==='trap') { event.value=Math.min(event.value,crew.bag); crew.bag-=event.value; event.title=event.value?`Lost ${event.value} gems`:'A narrow escape'; event.message=event.value?'A trap took gems from your backpack. Your vault is safe.':'Your backpack was empty. You lost no gems.'; }
    else if((event.kind==='shield'&&crew.shields)||crew.cards.includes(event.kind)) { crew.bag++; event.title='Duplicate card → 1 gem'; event.message='You already hold this card or shield. The duplicate became 1 backpack gem.'; }
    else if(event.kind==='shield') { crew.shields=1; event.title='Shield discovered'; event.message='Your shield automatically blocks the next backpack attack. Traps are not attacks.'; }
    else { crew.cards.push(event.kind); event.title=event.kind==='raid'?'Raid card discovered':'Sabotage card discovered'; event.message=event.kind==='raid'?'Use it to move up to 3 rival backpack gems into your backpack.':'Use it to remove up to 2 rival backpack gems. You do not collect them.'; }
    log(state,`${crew.name}: ${event.title}.`,event.kind==='trap'?'warning':'success'); return event;
  }
  function bank(state,id) {
    if(!['questions','finalPlay','finalBank'].includes(state.phase)||state.paused) throw Error('Banking is paused or closed.');
    const crew=getCrew(state,id); if(crew.bag<=0) throw Error('Your backpack is empty. No action was spent.');
    if(state.phase==='finalBank'&&crew.settled) throw Error('This crew has settled.');
    if(crew.actions<1) throw Error('You need 1 action to bank.'); crew.actions--;
    if(state.phase==='finalBank') crew.settled=true;
    const amount=crew.bag; crew.vault+=amount; crew.bag=0; crew.location='camp'; log(state,`${crew.name} banked ${amount} gems.`, 'success'); return amount;
  }
  function attack(state,fromId,toId,card,content) {
    if(!['questions','finalPlay'].includes(state.phase)||state.paused) throw Error('Attacks are paused or closed.');
    if(fromId===toId) throw Error('Choose another crew.');
    const from=getCrew(state,fromId), to=getCrew(state,toId), index=from.cards.indexOf(card);
    if(index<0) throw Error('This card is no longer available.');
    const gapId=question(content,state).id;
    if(from.attacks[gapId]) throw Error('This crew has already used an attack for this gap.');
    if(!['raid','sabotage'].includes(card)) throw Error('Choose an attack card.');
    if(to.bag<=0) throw Error('That backpack is empty. Your card was kept.');
    from.cards.splice(index,1);
    from.attacks[gapId]=true;
    if(to.shields>0) { to.shields--; log(state,`${to.name}'s shield blocked ${from.name}'s attack.`); return {title:'Shield blocked the attack',message:'One shield and your card were used. No gems moved.'}; }
    const amount=Math.min(card==='raid'?3:2,to.bag); to.bag-=amount; if(card==='raid') from.bag+=amount;
    log(state,`${from.name} ${card==='raid'?'raided':'removed'} ${amount} gems from ${to.name}.`);
    return {title:card==='raid'?`${amount} gems raided`:`${amount} gems removed`,message:card==='raid'?'The gems are now in your backpack. Bank them to score.':'The gems were removed. All vaults remain safe.'};
  }
  function finalBanking(state) { if(state.phase!=='finalPlay') throw Error('Allow the final normal play opportunity first.'); state.phase='finalBank'; state.paused=false; state.crews.forEach(c=>c.settled=c.bag===0||c.actions===0); log(state,'Final banking is open. Bank once for 1 Action, or pass. No more exploration or attacks.'); }
  function pass(state,id) { if(state.phase!=='finalBank') throw Error('Settlement is not open.'); getCrew(state,id).settled=true; log(state,`${getCrew(state,id).name} passed final banking.`); }
  function finish(state,allowUnbanked=false) {
    if(state.phase!=='finalBank') throw Error('Complete the questions first.');
    if(state.crews.some(c=>!c.settled)&&!allowUnbanked) throw Error('Eligible crews must bank or explicitly pass first.');
    state.phase='finished'; log(state,'Voyage complete. Only vault gems count. Equal scores share a place.');
  }
  function transact(state,operationId,mutate) { if(state.operations.includes(operationId)) return {state,result:null,repeated:true}; const next=JSON.parse(JSON.stringify(state)); const result=mutate(next); next.operations.push(operationId); next.revision++; return {state:next,result,repeated:false}; }
  function recordPaper(state,content,id,value) { submit(state,content,id,value); getCrew(state,id).responses[question(content,state).id].source='paper/oral'; }
  const api={CREWS,LOCATIONS,DECKS,normalize,suggestAnswer,matches,createState,getCrew,question,submit,recordPaper,review,start,pause,reveal,advance,explore,bank,attack,finalBanking,pass,finish,transact};
export default api;
