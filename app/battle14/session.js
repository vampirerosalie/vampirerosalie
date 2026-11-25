import { QUESTIONS } from './questions.js';
import { COLORS, COLOR_NAMES } from '../../public/battle13/map-data.js';
import { createHash } from 'node:crypto';

function requireRule(allowed, message, status = 409) {
  if (!allowed) throw Object.assign(new Error(message), { status });
}
const clean = value => String(value ?? '').normalize('NFKC').replace(/[\u0000-\u001f\u007f]/g, '').trim().slice(0, 28);
const at = (s) => QUESTIONS[s.questionIndex];
const newQuiz = () => ({ closed:false, finalized:false, revealed:false, entries:{} });
const quiz = (s) => s.quizzes[at(s).id];
const emptyStats = () => ({ firstHits:0, drones:0, stolen:0, lost:0 });

export function createSession({ pin, hostTokenHash, now = Date.now() }) {
  return { pin, hostTokenHash, createdAt:now, phase:'lobby', round:1, paused:false, questionIndex:0,
    teams:[], quizzes:{}, quizDeadline:null, history:[], receipts:{} };
}

export function joinSession(s, {deviceId, teamId, name, deviceName}) {
  requireRule(typeof deviceId === 'string' && deviceId.length > 0, 'A device identity is required.', 400);
  const existing = s.teams.find(t => t.devices.some(d => d.id === deviceId));
  if (existing) return { teamId:existing.id, deviceId };
  requireRule(s.phase !== 'finished', 'This game has finished.');
  let team;
  if (teamId) {
    team = s.teams.find(t => t.id === teamId);
    requireRule(team, 'Choose a team from this room.', 400);
  } else {
    requireRule(s.phase === 'lobby', 'New teams can join before the first question. Choose an existing team to watch.');
    requireRule(s.teams.length < 12, 'All twelve teams have joined.');
    const teamName = clean(name);
    requireRule(teamName, 'Enter a team name.', 400);
    requireRule(!s.teams.some(t => t.name.toLowerCase() === teamName.toLowerCase()), 'That team already exists. Choose it to join as a teammate.');
    const i = COLORS.findIndex(color => !s.teams.some(t => t.color === color));
    team = { id:'team-' + (s.teams.length+1), name:teamName, color:COLORS[i], colorName:COLOR_NAMES[i],
      controllerId:deviceId, devices:[], score:0, stats:emptyStats() };
    s.teams.push(team);
  }
  team.devices.push({id:deviceId, name:clean(deviceName) || 'Device ' + (team.devices.length+1)});
  return { teamId:team.id, deviceId };
}

export function isController(s, actor) {
  return actor?.role === 'team' && s.teams.some(t => t.id === actor.teamId && t.controllerId === actor.deviceId);
}

export function closeExpiredQuiz(s, now = Date.now()) {
  if (s.phase !== 'quiz' || s.quizDeadline == null || now < s.quizDeadline) return false;
  quiz(s).closed = true;
  s.quizDeadline = null;
  return true;
}

function enterQuiz(s, index) {
  s.phase = 'quiz';
  s.questionIndex = index;
  s.round = Math.floor(index / 5) + 1;
  s.quizDeadline = null;
  s.quizzes[at(s).id] = newQuiz();
}

function correct(s, teamId, questions) {
  return questions.filter(q => s.quizzes[q.id]?.finalized && s.quizzes[q.id].entries[teamId]?.decision === 'accept').length;
}

function startRound(s) {
  const block = QUESTIONS.slice(5*(s.round-1), 5*s.round);
  requireRule(block.every(q => s.quizzes[q.id]?.finalized), 'Finalize all five questions first.');
  const teams = s.teams.map(t => ({
    id:t.id, name:t.name, color:t.color, ammo:5+2*correct(s,t.id,block), score:t.score, stats:{...t.stats},
  }));
  s.phase = 'shootout';
  s.paused = false;
  return {startRound:{round:s.round,teams}};
}

export function finishRound(s, frame, now = Date.now(), finishGame = false) {
  if (s.phase !== 'shootout' || (frame.round != null && frame.round !== s.round)) return false;
  for (const team of s.teams) {
    const player = frame.players.find(p => p.id === team.id);
    if (player) {
      team.score = player.score;
      team.stats = {...player.stats};
    }
  }
  s.history.push({round:s.round,endedAt:now,teams:s.teams.map(t => ({id:t.id,score:t.score,stats:{...t.stats}}))});
  s.phase = finishGame ? 'finished' : 'roundResults';
  s.paused = false;
  return true;
}

function applyQuizCommand(s, actor, b, now) {
  const q = at(s), r = quiz(s), team = s.teams.find(t => t.id === actor.teamId);
  const requireQuiz = () => requireRule(s.phase === 'quiz' && b.questionId === q.id, 'The question changed. Check the current question.');
  const requireRound = (phase) => requireRule(s.phase === phase && b.round === s.round, 'The round changed. Check the current shootout.');
  if (b.type === 'student:submit' || b.type === 'student:writing') {
    requireRule(isController(s, actor), 'Only the active team controller can send an answer.', 403);
    requireQuiz();
    requireRule(!r.closed, 'Submissions have closed.');
    const old = r.entries[team.id];
    if (b.type === 'student:writing') {
      if (!old) r.entries[team.id] = {writing:true};
      return {};
    }
    requireRule(!old?.answer, 'Your team already submitted an answer.');
    requireRule(['A','B','C','D'].includes(b.answer), 'Choose A, B, C or D.', 400);
    r.entries[team.id] = {answer:b.answer, decision:b.answer === q.answer ? 'accept' : 'reject'};
    return {};
  }
  requireRule(actor.role === 'host', 'Teacher controls require the room’s teacher key.', 403);
  switch (b.type) {
    case 'host:start':
      requireRule(s.phase === 'lobby' && s.teams.length > 0, 'At least one team must join the lobby first.');
      enterQuiz(s, 0);
      break;
    case 'host:controller': {
      requireRule(s.phase !== 'finished', 'This game has finished.');
      const target = s.teams.find(t => t.id === b.teamId);
      requireRule(target?.devices.some(d => d.id === b.deviceId), 'Choose a device belonging to this team.');
      target.controllerId = b.deviceId;
      break;
    }
    case 'host:edit-team': {
      requireRule(s.phase === 'lobby', 'Team details can be edited in the lobby.');
      const target = s.teams.find(t => t.id === b.teamId), name = clean(b.name), colorIndex = COLORS.indexOf(b.color);
      requireRule(target && name && colorIndex >= 0, 'Choose a team name and colour.');
      requireRule(!s.teams.some(t => t !== target && t.name.toLowerCase() === name.toLowerCase()), 'That name belongs to another team.');
      const other = s.teams.find(t => t !== target && t.color === b.color);
      if (other) { other.color = target.color; other.colorName = target.colorName; }
      target.name = name;
      target.color = b.color;
      target.colorName = COLOR_NAMES[colorIndex];
      break;
    }
    case 'host:countdown':
      requireQuiz();
      requireRule(!r.closed, 'Submissions have closed.');
      s.quizDeadline ??= now + 10000;
      break;
    case 'host:close':
      requireQuiz();
      r.closed = true;
      s.quizDeadline = null;
      break;
    case 'host:decision':
      requireQuiz();
      requireRule(!r.finalized, 'These marks have been finalized.');
      requireRule(s.teams.some(t => t.id === b.teamId) && ['accept','reject'].includes(b.decision), 'Choose a team and a marking decision.');
      requireRule(r.entries[b.teamId]?.answer || b.decision === 'reject', 'An unanswered question earns zero paintballs.');
      (r.entries[b.teamId] ??= {}).decision = b.decision;
      break;
    case 'host:finalize':
      requireQuiz();
      r.closed = r.finalized = true;
      s.quizDeadline = null;
      break;
    case 'host:reveal':
      requireQuiz();
      requireRule(r.finalized, 'Finalize answers before revealing the key.');
      r.revealed = true;
      break;
    case 'host:next':
      requireQuiz();
      requireRule(r.finalized, 'Finalize answers before continuing.');
      if (q.number % 5 === 0) s.phase = 'roundReady';
      else enterQuiz(s, s.questionIndex+1);
      break;
    case 'host:start-round':
      requireRound('roundReady');
      return startRound(s);
    case 'host:pause':
      requireRound('shootout');
      requireRule(!s.paused, 'The shootout is already paused.');
      s.paused = true;
      return {pauseRound:true};
    case 'host:resume':
      requireRound('shootout');
      requireRule(s.paused, 'The shootout is already running.');
      s.paused = false;
      return {resumeRound:true};
    case 'host:end-round':
      requireRound('shootout');
      return {endRound:true};
    case 'host:continue':
      requireRound('roundResults');
      requireRule(s.round < 4, 'All four shootouts are complete.');
      enterQuiz(s, s.round*5);
      break;
    case 'host:finish':
      if (s.phase === 'shootout') return {endRound:true,finishGame:true};
      s.quizDeadline = null;
      s.phase = 'finished';
      break;
    default: requireRule(false, 'Unknown game action.', 400);
  }
  return {};
}

export function quizCommand(s, actor, command, now = Date.now()) {
  requireRule(command && typeof command.type === 'string', 'Specify a game action.', 400);
  requireRule(typeof command.requestId === 'string' && /^[a-zA-Z0-9_.:-]{1,120}$/.test(command.requestId), 'A request ID is required.', 400);
  const owner = actor.role === 'host' ? 'host' : actor.deviceId;
  const key = '~' + command.requestId;
  const signature = createHash('sha256').update(JSON.stringify(command)).digest('base64url').slice(0,22);
  if (s.receipts[owner]?.[key]) {
    requireRule(s.receipts[owner][key] === signature, 'This request ID belongs to a different action.');
    return {replayed:true};
  }
  closeExpiredQuiz(s, now);
  const effect = applyQuizCommand(s, actor, command, now);
  (s.receipts[owner] ??= {})[key] = signature;
  return effect;
}

export function sessionView(s, actor, {now = Date.now(), onlineDeviceIds = []} = {}) {
  const online = onlineDeviceIds instanceof Set ? onlineDeviceIds : new Set(onlineDeviceIds);
  const host = actor.role === 'host', q = at(s), r = quiz(s);
  const teams = s.teams.map(t => {
    const entry = r?.entries[t.id];
    const info = {id:t.id,name:t.name,color:t.color,colorName:t.colorName,score:t.score,stats:{...t.stats},
      online:t.devices.some(d => online.has(d.id)),controllerOnline:online.has(t.controllerId),
      answerStatus:entry?.answer ? 'Answered' : entry?.writing ? 'Writing' : 'Waiting'};
    if (host) info.devices = t.devices.map(d => ({...d,online:online.has(d.id),controller:d.id === t.controllerId}));
    if (s.phase === 'finished') info.englishCorrect = correct(s,t.id,QUESTIONS);
    return info;
  });
  const view = {pin:s.pin,role:actor.role,teamId:actor.teamId??null,canControl:isController(s,actor),
    phase:s.phase,round:s.round,paused:s.paused,serverTime:now,teams,onlineCount:teams.filter(t=>t.online).length,
    completedRounds:s.history.length,questionCount:20};
  if (s.phase === 'quiz') {
    const {answer,...publicQuestion} = q;
    view.question = publicQuestion;
    view.closed = r.closed || (s.quizDeadline != null && now >= s.quizDeadline);
    view.deadline = s.quizDeadline;
    view.finalized = r.finalized;
    if (r.revealed) view.revealed = answer;
    if (actor.role === 'team') view.ownAnswer = r.entries[actor.teamId]?.answer ?? null;
    if (host) view.review = {answer,entries:s.teams.map(t => {
      const entry = r.entries[t.id];
      return {teamId:t.id,answer:entry?.answer??null,suggestion:entry?.answer === answer?'accept':'reject',decision:entry?.decision??'reject'};
    })};
  }
  if (s.phase === 'roundReady') {
    const block = QUESTIONS.slice(5*(s.round-1),5*s.round);
    for (const t of teams) if (host || t.id === actor.teamId) t.startingAmmo = 5+2*correct(s,t.id,block);
  }
  if (s.phase === 'roundResults' || s.phase === 'finished') view.history = structuredClone(s.history);
  if (host && s.phase === 'lobby') view.colors = COLORS.map((color, i) => ({color,name:COLOR_NAMES[i]}));
  return view;
}
