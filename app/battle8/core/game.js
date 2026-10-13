import { createHash, createHmac, randomBytes, randomInt, timingSafeEqual } from 'node:crypto';

export class GameError extends Error {
  constructor(message, code = 'INVALID_ACTION', status = 400) { super(message); this.code = code; this.status = status; }
}
const fail = (message, code, status) => { throw new GameError(message, code, status); };
const hash = value => createHash('sha256').update(value).digest('hex');
const equal = (a, b) => typeof a === 'string' && typeof b === 'string' && a.length === b.length && timingSafeEqual(Buffer.from(a), Buffer.from(b));
const id = () => randomBytes(12).toString('hex');
const nameOf = value => String(value ?? '').normalize('NFKC').replace(/[\u0000-\u001f\u007f]/g, '').trim().slice(0, 28);
const total = team => team.original + team.walls;
const PUBLIC_CARD = {
  hammer: { name: 'Heavy Hammer', icon: '🔨', group: 'Demolition', description: 'Remove 1 piece from your site.' },
  drill: { name: 'Power Drill', icon: '⚙️', group: 'Demolition', description: 'Remove up to 2 pieces from your site.' },
  ball: { name: 'Wrecking Ball', icon: '💥', group: 'Demolition', description: 'Remove up to 3 pieces from your site.' },
  brick: { name: 'Brick Delivery', icon: '🧱', group: 'Sabotage', description: 'Add 1 wall to a rival.' },
  renovation: { name: 'Renovation Crew', icon: '🚧', group: 'Sabotage', description: 'Add 2 walls to a rival.' },
  snatcher: { name: 'Tool Snatcher', icon: '🕵️', group: 'Sabotage', description: 'Take one random saved card from a rival.' },
  shield: { name: 'Safety Permit', icon: '🛡️', group: 'Wild', description: 'Block the next incoming wall-adding action.' },
  double: { name: 'Double or Trouble', icon: '🎲', group: 'Wild', description: '50% remove up to 2 own pieces; 50% add 1 own wall.' },
  oops: { name: 'Oops! Wrong Delivery', icon: '📦', group: 'Wild', description: 'Immediately add 1 wall to your own site.' },
  cleanup: { name: 'Lucky Cleanup', icon: '✨', group: 'Wild', description: 'Remove up to 2 pieces from your site.' },
};
export const CARDS = Object.freeze(PUBLIC_CARD);
export const CARD_WEIGHTS = Object.freeze([
  ['hammer', 39], ['drill', 22], ['ball', 4], ['brick', 16], ['renovation', 6],
  ['snatcher', 3], ['shield', 4], ['double', 3], ['oops', 2], ['cleanup', 1],
]);
if (CARD_WEIGHTS.reduce((n, [, weight]) => n + weight, 0) !== 100) throw new Error('Card weights must add to 100.');
const publicQuestion = question => question && ({
  id: question.id, type: question.type, genre: question.genre, text: question.text,
  question: question.question, options: question.options, ...(question.target_word ? { target_word: question.target_word } : {}),
});

export function validateBank(bank) {
  const questions = Array.isArray(bank) ? bank : bank?.questions;
  if (!Array.isArray(questions) || questions.length !== 25) throw new Error('Exactly 25 Form 3 questions are required.');
  if (questions.filter(q => q.type === 'reading').length !== 10 || questions.filter(q => q.type === 'vocabulary').length !== 15) throw new Error('The bank must contain 10 reading and 15 vocabulary questions.');
  if (questions.some((q, index) => q.id !== index + 1 || !q.text || !q.question || !['A', 'B', 'C', 'D'].every(letter => typeof q.options?.[letter] === 'string') || !['A', 'B', 'C', 'D'].includes(q.correct_answer) || !q.explanation)) throw new Error('The supplied question bank is incomplete.');
  return questions;
}

export class DemolitionGame {
  constructor({ bank, now = Date.now, random = randomInt, secret = randomBytes(32).toString('hex'), retentionHours = 48 } = {}) {
    this.questions = validateBank(bank);
    this.now = now; this.random = random; this.secret = secret; this.retentionMs = retentionHours * 3600000;
    this.rooms = new Map(); this.lastSeen = new Map();
  }
  save() {}
  room(pin) {
    if (!/^\d{5}$/.test(String(pin))) fail('Enter a five-digit room PIN.', 'INVALID_PIN');
    const room = this.rooms.get(String(pin));
    if (!room || room.expiresAt <= this.now()) fail('This room is unavailable. Ask your teacher for the current PIN.', 'ROOM_NOT_FOUND', 404);
    return room;
  }
  create({ roomName = 'Demolition Dash', teamCount = 40 } = {}) {
    if (!Number.isInteger(teamCount) || teamCount < 2 || teamCount > 40) fail('Choose 2–40 team places.');
    let pin; do { pin = String(10000 + this.random(90000)); } while (this.rooms.has(pin));
    const hostToken = randomBytes(32).toString('hex');
    const room = { pin, name: nameOf(roomName) || 'Demolition Dash', hostHash: hash(hostToken), createdAt: this.now(), expiresAt: this.now() + this.retentionMs,
      version: 1, phase: 'lobby', teamCount, questionIndex: -1, questionOpen: false, deadlineAt: null,
      revealed: [], teams: [], submissions: {}, receipts: {}, events: [] };
    this.rooms.set(pin, room); this.save(room); return { pin, hostToken };
  }
  teamToken(room, clientId) { return createHmac('sha256', this.secret).update(`team:${room.pin}:${room.createdAt}:${clientId}`).digest('hex'); }
  join(pin, { clientId, teamSlot, name } = {}) {
    const room = this.room(pin);
    if (typeof clientId !== 'string' || !/^[-a-zA-Z0-9]{20,100}$/.test(clientId)) fail('This device needs a valid identity. Reload and try again.', 'BAD_IDENTITY');
    const existing = room.teams.find(team => team.clientId === clientId);
    if (existing) { this.touch(room, existing); return { teamId: existing.id, teamToken: this.teamToken(room, clientId) }; }
    if (room.phase !== 'lobby') fail('This game has already started. Reopen the phone that joined earlier.', 'JOIN_CLOSED', 409);
    if (!Number.isInteger(teamSlot) || teamSlot < 1 || teamSlot > room.teamCount) fail('Choose a valid team place.');
    if (room.teams.some(team => team.slot === teamSlot)) fail('That team place was just taken. Choose another.', 'SLOT_TAKEN', 409);
    const teamName = nameOf(name); if (!teamName) fail('Give your team a name.');
    const token = this.teamToken(room, clientId);
    const team = { id: id(), clientId, tokenHash: hash(token), slot: teamSlot, name: teamName,
      original: 12, walls: 0, shields: 0, draws: [], offer: null, hand: [], lastReveal: null };
    room.teams.push(team); room.version++; this.save(room); this.touch(room, team);
    return { teamId: team.id, teamToken: token };
  }
  auth(room, token) {
    if (!token) return { role: 'public' };
    const tokenHash = hash(String(token));
    if (equal(tokenHash, room.hostHash)) return { role: 'host' };
    const team = room.teams.find(item => equal(tokenHash, item.tokenHash));
    if (team) { this.touch(room, team); return { role: 'team', team }; }
    fail('This device key is invalid. Reopen your saved team link.', 'UNAUTHORIZED', 401);
  }
  touch(room, team) { this.lastSeen.set(`${room.pin}:${team.id}`, this.now()); }
  question(room) { return this.questions[room.questionIndex] ?? null; }
  event(room, text, kind = 'info') { room.events.push({ id: id(), text, kind, at: this.now() }); room.events = room.events.slice(-60); }
  ranking(room) {
    const sorted = room.teams.map(team => ({ id: team.id, name: team.name, slot: team.slot, original: team.original, walls: team.walls, remaining: total(team) })).sort((a, b) => a.remaining - b.remaining || a.slot - b.slot);
    let previous = -1, rank = 0;
    return sorted.map((team, index) => { if (team.remaining !== previous) rank = index + 1; previous = team.remaining; return { ...team, rank }; });
  }
  view(room, auth) {
    const q = this.question(room), rows = q ? room.submissions[q.id] ?? {} : {};
    const data = { pin: room.pin, roomName: room.name, role: auth.role, phase: room.phase, version: room.version, serverTime: this.now(), teamCount: room.teamCount,
      questionNumber: room.questionIndex + 1, totalQuestions: 25, questionOpen: room.questionOpen, deadlineAt: room.deadlineAt,
      question: publicQuestion(q), answerReveal: q && room.revealed.includes(q.id) ? { questionId: q.id, letter: q.correct_answer, explanation: q.explanation } : null,
      teams: room.teams.map(team => ({ id: team.id, slot: team.slot, name: team.name, original: team.original, walls: team.walls, shields: team.shields,
        remaining: total(team), handCount: team.hand.length, online: (this.lastSeen.get(`${room.pin}:${team.id}`) ?? 0) > this.now() - 20000,
        submitted: Boolean(rows[team.id]?.answer), verdict: rows[team.id]?.status ?? 'waiting' })).sort((a, b) => a.slot - b.slot),
      takenSlots: room.teams.map(team => team.slot), ranking: this.ranking(room), events: room.events.slice(-12) };
    if (auth.role === 'host') {
      data.reviewKeys = this.questions.slice(0, room.questionIndex + 1).map(item => ({ questionId: item.id, answerKey: item.correct_answer, explanation: item.explanation }));
      data.reviews = Object.entries(room.submissions).flatMap(([questionId, submissions]) => Object.entries(submissions).map(([teamId, sub]) => ({
        questionId: Number(questionId), teamId, teamName: room.teams.find(t => t.id === teamId)?.name ?? 'Team',
        answer: sub.answer ?? '', status: sub.status, decisionSource: sub.decisionSource ?? null, rewardIssued: Boolean(sub.rewardIssued), rewardLocked: Boolean(sub.rewardLocked),
        answerKey: this.questions[Number(questionId) - 1]?.correct_answer, explanation: this.questions[Number(questionId) - 1]?.explanation,
      }))).sort((a, b) => b.questionId - a.questionId || a.teamName.localeCompare(b.teamName));
      data.pendingReviewCount = data.reviews.filter(row => row.status === 'submitted').length;
    }
    if (auth.role === 'team') {
      const team = auth.team;
      data.me = { id: team.id, slot: team.slot, name: team.name, original: team.original, walls: team.walls, remaining: total(team), shields: team.shields,
        draws: team.draws.length, nextDrawId: team.draws[0]?.id ?? null,
        offer: team.offer ? { id: team.offer.id, slots: team.offer.slots.map(slot => ({ id: slot.id })) } : null,
        hand: team.hand.map(card => ({ id: card.id, key: card.key, ...CARDS[card.key] })), lastReveal: team.lastReveal,
        submission: rows[team.id] ? { status: rows[team.id].status, answer: rows[team.id].answer ?? '', questionId: q.id } : null };
    }
    return data;
  }
  state(pin, token) { const room = this.room(pin), actor = this.auth(room, token); return this.view(room, actor); }
  sampleCard() { let roll = this.random(100); for (const [key, weight] of CARD_WEIGHTS) { if (roll < weight) return key; roll -= weight; } throw new Error('Invalid card roll.'); }
  demolish(team, amount) { const wallsRemoved = Math.min(team.walls, amount); team.walls -= wallsRemoved; const originalRemoved = Math.min(team.original, amount - wallsRemoved); team.original -= originalRemoved; return wallsRemoved + originalRemoved; }
  action(pin, token, body = {}) {
    const room = this.room(pin), actor = this.auth(room, token);
    if (actor.role === 'public') fail('A teacher or team key is required.', 'UNAUTHORIZED', 401);
    const { type, requestId } = body;
    if (typeof requestId !== 'string' || !/^[-a-zA-Z0-9]{12,100}$/.test(requestId)) fail('This action needs a receipt ID.', 'MISSING_REQUEST_ID');
    if ((String(type).startsWith('host:') && actor.role !== 'host') || (String(type).startsWith('pupil:') && actor.role !== 'team')) fail('This action belongs to another role.', 'FORBIDDEN', 403);
    const receiptKey = `${actor.role === 'host' ? 'host' : actor.team.id}:${requestId}`;
    const signature = hash(JSON.stringify({ ...body, requestId: undefined }));
    const receipt = room.receipts[receiptKey];
    if (receipt) { if (receipt.signature !== signature) fail('That receipt was used for another action.', 'RECEIPT_CONFLICT', 409); return { ok: true, replayed: true, result: receipt.result, state: this.view(room, actor) }; }
    if (['finished', 'closed'].includes(room.phase)) fail('The results are locked. No more game actions are allowed.', 'GAME_LOCKED', 409);
    const backup = structuredClone(room);
    let result;
    try {
      result = this.apply(room, actor, body); room.version++; room.receipts[receiptKey] = { signature, result, at: this.now() };
      // Old receipts may be dropped: each action also checks its own consumed
      // draw/card/submission state, so a very late retry cannot repeat it.
      const receipts = Object.keys(room.receipts);
      if (receipts.length > 600) for (const key of receipts.slice(0, receipts.length - 600)) delete room.receipts[key];
      this.save(room);
    }
    catch (error) { this.rooms.set(pin, backup); throw error; }
    return { ok: true, result, state: this.view(room, actor) };
  }
  apply(room, actor, body) {
    const q = this.question(room), team = actor.team;
    const requirePhase = (...phases) => { if (!phases.includes(room.phase)) fail('This action is not available now.', 'WRONG_PHASE', 409); };
    const requireActions = () => requirePhase('question', 'wrap');
    switch (body.type) {
      case 'host:start':
        requirePhase('lobby'); if (!room.teams.length) fail('Wait for at least one team to join.', 'NEED_TEAM', 409);
        room.phase = 'question'; room.questionIndex = 0; room.questionOpen = true; room.deadlineAt = null; this.event(room, 'The demolition challenge begins!'); return { started: true };
      case 'host:start-countdown':
        requirePhase('question'); if (body.questionId !== q.id) fail('That question has changed.', 'STALE_QUESTION', 409);
        if (!room.questionOpen) fail('Answers are already closed.', 'ANSWERS_CLOSED', 409);
        if (!room.deadlineAt) room.deadlineAt = this.now() + 10000;
        return { deadlineAt: room.deadlineAt };
      case 'host:close-answer':
        requirePhase('question'); if (body.questionId !== q.id) fail('That question has changed.', 'STALE_QUESTION', 409);
        room.questionOpen = false; room.deadlineAt = null;
        for (const joined of room.teams) { const subs = room.submissions[q.id] ??= {}; if (!subs[joined.id]) subs[joined.id] = { answer: '', status: 'missing', at: this.now() }; }
        return { closedQuestionId: q.id };
      case 'host:reveal':
        requirePhase('question'); if (body.questionId !== q.id) fail('That question has changed.', 'STALE_QUESTION', 409);
        if (room.questionOpen) fail('Close answers before revealing the key.', 'ANSWERS_OPEN', 409);
        if (!room.revealed.includes(q.id)) room.revealed.push(q.id);
        return { revealedQuestionId: q.id };
      case 'host:advance':
        requirePhase('question'); if (body.questionId !== q.id) fail('That question has changed.', 'STALE_QUESTION', 409);
        if (room.questionOpen) fail('Close this question’s answers before advancing.', 'ANSWERS_OPEN', 409);
        room.deadlineAt = null;
        if (room.questionIndex === 24) { room.phase = 'wrap'; this.event(room, 'Final Tool Yard: use saved cards before the teacher locks results.'); }
        else { room.questionIndex++; room.questionOpen = true; }
        return { phase: room.phase, questionNumber: room.questionIndex + 1 };
      case 'host:review': {
        requirePhase('question', 'wrap');
        if (!Number.isInteger(body.questionId) || body.questionId < 1 || body.questionId > room.questionIndex + 1) fail('Choose a valid earlier question.', 'STALE_QUESTION', 409);
        if (!['accepted', 'rejected'].includes(body.decision)) fail('Choose Accept or Reject.');
        const judged = room.teams.find(t => t.id === body.teamId); if (!judged) fail('That team is unavailable.', 'TEAM_NOT_FOUND', 404);
        const subs = room.submissions[body.questionId] ??= {}; let sub = subs[judged.id];
        if (!sub) { if (body.decision !== 'rejected') fail('A missing answer cannot be accepted.', 'NO_SUBMISSION', 409); sub = subs[judged.id] = { answer: '', status: 'missing', at: this.now() }; }
        if (!sub.answer) { sub.status = 'missing'; return { decision: 'missing' }; }
        if (sub.status === body.decision) return { decision: sub.status, rewardIssued: Boolean(sub.rewardIssued) };
        if (sub.status === 'accepted' && body.decision === 'rejected') {
          if (sub.rewardLocked) fail('This team has already opened that reward. Its accepted decision cannot be reversed.', 'REWARD_USED', 409);
          judged.draws = judged.draws.filter(draw => draw.questionId !== body.questionId);
          sub.rewardIssued = false;
        }
        if (body.decision === 'accepted' && !sub.rewardIssued) { judged.draws.push({ id: id(), questionId: body.questionId }); sub.rewardIssued = true; }
        sub.status = body.decision; sub.decisionSource = 'teacher'; sub.reviewedAt = this.now();
        this.event(room, `${judged.name}’s Question ${body.questionId} answer was ${body.decision}.`);
        return { decision: sub.status, rewardIssued: Boolean(sub.rewardIssued) };
      }
      case 'host:finish':
        requirePhase('wrap');
        if (Object.values(room.submissions).some(subs => Object.values(subs).some(sub => sub.status === 'submitted'))) fail('Review submitted answers before locking results.', 'REVIEWS_PENDING', 409);
        room.phase = 'finished'; room.questionOpen = false; room.deadlineAt = null;
        this.event(room, 'Results locked. Fewest remaining pieces wins!');
        return { ranking: this.ranking(room) };
      case 'host:end-early':
        requirePhase('lobby', 'question', 'wrap');
        room.phase = 'finished'; room.questionOpen = false; room.deadlineAt = null;
        this.event(room, 'The teacher ended this game. Final results are locked.');
        return { endedEarly: true, ranking: this.ranking(room) };
      case 'pupil:submit': {
        requirePhase('question');
        if (body.questionId !== q.id) fail('That question has changed.', 'STALE_QUESTION', 409);
        if (!room.questionOpen || (room.deadlineAt && this.now() >= room.deadlineAt)) fail('Answer time is up. Your cards are still usable.', 'ANSWER_TIME_UP', 409);
        if (!['A', 'B', 'C', 'D'].includes(body.answer)) fail('Choose A, B, C or D.');
        const subs = room.submissions[q.id] ??= {};
        if (subs[team.id]) fail('Your team has already answered this question.', 'ALREADY_SUBMITTED', 409);
        const correct = body.answer === q.correct_answer;
        subs[team.id] = { answer: body.answer, status: correct ? 'accepted' : 'rejected', decisionSource: 'auto',
          at: this.now(), rewardIssued: correct, rewardLocked: false };
        if (correct) team.draws.push({ id: id(), questionId: q.id });
        return { submitted: true, correct, questionId: q.id, rewardIssued: correct };
      }
      case 'pupil:draw': {
        requireActions();
        if (team.offer) fail('Finish your open mystery choice first.', 'OFFER_OPEN', 409);
        const credit = team.draws[0]; if (!credit) fail('No mystery draw is available yet.', 'NO_DRAW', 409);
        if (body.drawId !== credit.id) fail('That mystery draw was already opened or has changed.', 'STALE_DRAW', 409);
        team.draws.shift();
        const sub = room.submissions[credit.questionId]?.[team.id]; if (sub) sub.rewardLocked = true;
        team.offer = { id: id(), questionId: credit.questionId, slots: Array.from({ length: 3 }, () => ({ id: id(), key: this.sampleCard() })) };
        return { offerId: team.offer.id };
      }
      case 'pupil:choose': {
        requireActions();
        const offer = team.offer;
        if (!offer || offer.id !== body.offerId) fail('That mystery offer is no longer open.', 'OFFER_CLOSED', 409);
        const selected = offer.slots.find(slot => slot.id === body.slotId);
        if (!selected) fail('Choose one of your three face-down cards.', 'INVALID_SLOT', 409);
        const card = { id: id(), key: selected.key, questionId: offer.questionId };
        team.offer = null;
        if (card.key === 'oops') { team.walls++; this.event(room, `${team.name} received a wrong delivery: +1 own wall!`, 'wall'); }
        else team.hand.push(card);
        team.lastReveal = { id: id(), key: card.key, ...CARDS[card.key], immediate: card.key === 'oops' };
        return { card: team.lastReveal };
      }
      case 'pupil:play': {
        requireActions();
        const card = team.hand.find(item => item.id === body.cardId);
        if (!card) fail('That card is not in your hand.', 'CARD_NOT_FOUND', 409);
        const rivalNeeded = ['brick', 'renovation', 'snatcher'].includes(card.key);
        const target = rivalNeeded ? room.teams.find(item => item.id === body.targetTeamId && item.id !== team.id) : null;
        if (rivalNeeded && !target) fail('Choose another team. Your card is saved.', 'INVALID_TARGET', 409);
        let message;
        if (['hammer', 'drill', 'ball', 'cleanup'].includes(card.key)) {
          if (!total(team)) fail('Your site is clear. Save this tool for any walls added later.', 'NOTHING_TO_REMOVE', 409);
          const amount = { hammer: 1, drill: 2, ball: 3, cleanup: 2 }[card.key];
          message = `${team.name} removed ${this.demolish(team, amount)} piece(s) with ${CARDS[card.key].name}.`;
        } else if (card.key === 'brick' || card.key === 'renovation') {
          const amount = card.key === 'brick' ? 1 : 2;
          if (target.shields > 0) { target.shields--; message = `${target.name}’s Safety Permit blocked ${team.name}’s wall delivery.`; }
          else { target.walls += amount; message = `${team.name} added ${amount} wall(s) to ${target.name}.`; }
        } else if (card.key === 'snatcher') {
          if (!target.hand.length) fail('That rival has no saved card to take. Your card is saved.', 'EMPTY_HAND', 409);
          const stolen = target.hand.splice(this.random(target.hand.length), 1)[0]; team.hand.push(stolen);
          message = `${team.name} took one saved tool from ${target.name}.`;
        } else if (card.key === 'shield') { team.shields++; message = `${team.name} armed a Safety Permit.`; }
        else if (card.key === 'double') {
          if (this.random(2) === 0) { const removed = this.demolish(team, 2); message = `${team.name} rolled well and removed ${removed} piece(s).`; }
          else { team.walls++; message = `${team.name} rolled trouble and gained 1 own wall.`; }
        } else fail('That card cannot be played.', 'INVALID_CARD', 409);
        team.hand = team.hand.filter(item => item.id !== card.id);
        this.event(room, message, 'card'); return { played: card.key, message };
      }
      default: fail('Unknown game action.', 'UNKNOWN_ACTION', 404);
    }
  }
}
