import { createHash, createHmac, randomBytes, randomInt, timingSafeEqual } from 'node:crypto';
import { DIALOGUE, PASSAGE, QUESTIONS } from '../data.js';

export class GameError extends Error {
  constructor(message, code = 'INVALID_ACTION', status = 400) { super(message); this.code = code; this.status = status; }
}
const fail = (message, code = 'INVALID_ACTION', status = 409) => { throw new GameError(message, code, status); };
const hash = value => createHash('sha256').update(value).digest('hex');
const equal = (a, b) => typeof a === 'string' && typeof b === 'string' && a.length === b.length && timingSafeEqual(Buffer.from(a), Buffer.from(b));
const id = () => randomBytes(12).toString('hex');
const seal = () => randomBytes(9).toString('base64url').toUpperCase();
const nameOf = value => String(value ?? '').normalize('NFKC').replace(/[\u0000-\u001f\u007f]/g, '').trim().slice(0, 28);
const answerOf = value => String(value ?? '').normalize('NFKC').toLowerCase().replace(/[’‘]/g, "'").trim().replace(/[.!?。！？]+$/u, '').replace(/\s+/g, ' ').trim();
export const sceneFor = q => q <= 1 ? 0 : q <= 5 ? 1 : q <= 6 ? 2 : 3;
const dialogueFor = (stage, q) => stage === 'hunt-dialogue' ? DIALOGUE.hunt : stage === 'ending' ? DIALOGUE.ending : DIALOGUE[q] ?? [];

export class LanternGame {
  constructor({ now = Date.now, random = randomInt, secret = randomBytes(32).toString('hex'), retentionHours = 48 } = {}) {
    this.now = now; this.random = random; this.secret = secret; this.retentionMs = retentionHours * 3600000;
    this.rooms = new Map(); this.lastSeen = new Map();
  }
  save() {}
  room(pin) {
    if (!/^\d{5}$/.test(String(pin))) fail('Enter the five-digit room PIN.', 'INVALID_PIN', 400);
    const room = this.rooms.get(String(pin));
    if (!room || room.expiresAt <= this.now()) fail('This adventure room has expired. Ask your teacher for the current QR code.', 'ROOM_NOT_FOUND', 404);
    return room;
  }
  create() {
    let pin; do { pin = String(10000 + this.random(90000)); } while (this.rooms.has(pin));
    const hostToken = randomBytes(32).toString('hex');
    const room = { pin, hostHash: hash(hostToken), createdAt: this.now(), expiresAt: this.now() + this.retentionMs,
      version: 1, phase: 'lobby', players: [], seals: { genuine: seal(), decoy: seal(), genuineCard: this.random(2) === 0 ? 'A' : 'B' }, receipts: {} };
    this.rooms.set(pin, room); this.save(room); return { pin, hostToken };
  }
  studentToken(room, clientId) { return createHmac('sha256', this.secret).update(`lantern:${room.pin}:${room.createdAt}:${clientId}`).digest('hex'); }
  join(pin, { clientId, name } = {}) {
    const room = this.room(pin);
    if (typeof clientId !== 'string' || !/^[-a-zA-Z0-9]{20,100}$/.test(clientId)) fail('Reload this phone to create its saved identity.', 'BAD_IDENTITY', 400);
    const existing = room.players.find(p => p.clientId === clientId);
    if (existing) { this.touch(room, existing); return { playerId: existing.id, playerToken: this.studentToken(room, clientId) }; }
    if (room.phase !== 'lobby') fail('The adventure has begun. Joined students may still reconnect.', 'JOIN_CLOSED');
    if (room.players.length >= 40) fail('This adventure room has 40 students already.', 'ROOM_FULL');
    if (!nameOf(name)) fail('Enter your name.');
    const token = this.studentToken(room, clientId);
    const player = { id: id(), clientId, tokenHash: hash(token), name: nameOf(name), q: 1, stage: 'lobby', dialogueIndex: 0,
      attempts: Array(10).fill(0), accepted: Array(10).fill(null), hints: [], discoveries: [], decoySeen: false };
    room.players.push(player); room.version++; this.touch(room, player); this.save(room);
    return { playerId: player.id, playerToken: token };
  }
  touch(room, player) { this.lastSeen.set(`${room.pin}:${player.id}`, this.now()); }
  auth(room, token) {
    if (!token) return { role: 'public' };
    const digest = hash(String(token));
    if (equal(digest, room.hostHash)) return { role: 'host' };
    const player = room.players.find(p => equal(digest, p.tokenHash));
    if (!player) fail('This saved device key could not be verified.', 'UNAUTHORIZED', 401);
    this.touch(room, player); return { role: 'student', player };
  }
  status(player) {
    if (player.stage === 'complete') return 'Adventure complete';
    if (player.stage === 'star') return 'Glass star discovered';
    if (player.stage === 'hunt') return 'Final QR hunt';
    if (player.stage === 'camera') return 'Discovery ready';
    if (player.stage === 'success' || player.stage === 'hunt-dialogue') return 'Answer accepted';
    if (player.stage === 'question') return player.q === 8 || player.q === 9 ? 'Vocabulary' : 'Answering';
    if (player.stage === 'reading') return 'Reading passage';
    if (player.stage === 'ending') return 'Returning to beacon';
    return player.stage === 'lobby' ? 'Waiting' : 'Story dialogue';
  }
  view(room, actor) {
    const base = { pin: room.pin, role: actor.role, version: room.version, phase: room.phase, serverTime: this.now(),
      joinedCount: room.players.length, onlineCount: room.players.filter(p => (this.lastSeen.get(`${room.pin}:${p.id}`) ?? 0) > this.now() - 25000).length };
    if (actor.role === 'host') {
      return { ...base, passage: PASSAGE, students: room.players.map(p => ({ id: p.id, name: p.name, q: p.q, completed: p.accepted.filter(Boolean).length,
        discoveries: p.discoveries.length, status: this.status(p), finalSearch: ['hunt', 'star', 'ending', 'complete'].includes(p.stage),
        finished: p.stage === 'complete', online: (this.lastSeen.get(`${room.pin}:${p.id}`) ?? 0) > this.now() - 25000 })) };
    }
    if (actor.role === 'student') {
      const p = actor.player, question = QUESTIONS[p.q - 1];
      return { ...base, me: { id: p.id, name: p.name, q: p.q, stage: p.stage, dialogueIndex: p.dialogueIndex,
        attempts: p.attempts[p.q - 1] ?? 0, hint: p.attempts[p.q - 1] >= 2 && !['complete', 'ending'].includes(p.stage) ? question?.hint : null,
        completed: p.accepted.filter(Boolean).length, discoveries: p.discoveries, decoySeen: p.decoySeen },
        scene: sceneFor(p.q), question: p.stage === 'question' ? { number: p.q, text: question.text, vocabulary: Boolean(question.vocabulary) } : null,
        dialogue: ['dialogue', 'hunt-dialogue', 'ending'].includes(p.stage) ? dialogueFor(p.stage, p.q)[p.dialogueIndex] ?? null : null,
        dialogueHistory: Object.entries(DIALOGUE).filter(([key]) => /^\d+$/.test(key) && Number(key) <= p.q).map(([key, lines]) => ({ question: Number(key), lines })),
        discovery: ['success', 'camera'].includes(p.stage) ? { number: p.q, name: question.discovery, action: question.action } : null,
        passage: PASSAGE, journal: p.discoveries.map(number => ({ number, name: QUESTIONS[number - 1].discovery, evidence: QUESTIONS[number - 1].evidence })),
      };
    }
    return base;
  }
  state(pin, token) { const room = this.room(pin); return this.view(room, this.auth(room, token)); }
  sealCards(pin, token) {
    const room = this.room(pin), actor = this.auth(room, token);
    if (actor.role !== 'host') fail('Only the teacher can print hunt seals.', 'FORBIDDEN', 403);
    return { pin, genuine: room.seals.genuine, decoy: room.seals.decoy, genuineCard: room.seals.genuineCard };
  }
  action(pin, token, body = {}) {
    const room = this.room(pin), actor = this.auth(room, token);
    if (actor.role === 'public') fail('A teacher or student key is required.', 'UNAUTHORIZED', 401);
    const { type, requestId } = body;
    if (typeof requestId !== 'string' || !/^[-a-zA-Z0-9]{12,100}$/.test(requestId)) fail('This action needs a receipt ID.', 'MISSING_REQUEST_ID', 400);
    if ((String(type).startsWith('host:') && actor.role !== 'host') || (String(type).startsWith('student:') && actor.role !== 'student')) fail('That action belongs to another role.', 'FORBIDDEN', 403);
    const key = `${actor.role === 'host' ? 'host' : actor.player.id}:${requestId}`;
    const signature = hash(JSON.stringify({ ...body, requestId: undefined })), receipt = room.receipts[key];
    if (receipt) {
      if (receipt.signature !== signature) fail('Receipt already used for a different action.', 'RECEIPT_CONFLICT');
      return { ok: true, replayed: true, result: receipt.result, state: this.view(room, actor) };
    }
    if (room.phase === 'ended') fail('This adventure has ended. Your progress is preserved.', 'GAME_ENDED');
    const backup = structuredClone(room);
    try {
      const result = this.apply(room, actor, body);
      room.version++; room.receipts[key] = { signature, result };
      const keys = Object.keys(room.receipts); if (keys.length > 320) for (const old of keys.slice(0, keys.length - 320)) delete room.receipts[old];
      this.save(room); return { ok: true, result, state: this.view(room, actor) };
    } catch (error) { this.rooms.set(pin, backup); throw error; }
  }
  apply(room, actor, body) {
    const type = body.type, p = actor.player;
    if (type === 'host:start') {
      if (room.phase !== 'lobby' || !room.players.length) fail('Wait for a student to join before starting.');
      room.phase = 'active'; for (const player of room.players) { player.stage = 'dialogue'; player.dialogueIndex = 0; }
      return { started: true };
    }
    if (type === 'host:end') { room.phase = 'ended'; return { ended: true }; }
    if (room.phase !== 'active' || actor.role !== 'student') fail('The adventure has not started.', 'WRONG_PHASE');
    if (type === 'student:dialogue-next') {
      if (!['dialogue', 'hunt-dialogue', 'ending'].includes(p.stage)) fail('There is no dialogue to continue.');
      const lines = dialogueFor(p.stage, p.q);
      if (++p.dialogueIndex >= lines.length) {
        p.dialogueIndex = 0;
        p.stage = p.stage === 'hunt-dialogue' ? 'hunt' : p.stage === 'ending' ? 'complete' : p.q === 1 && !p.readingComplete ? 'reading' : 'question';
      }
      return { advanced: true };
    }
    if (type === 'student:begin-questions') {
      if (p.stage !== 'reading' || p.q !== 1) fail('Finish the opening passage before beginning the questions.');
      p.readingComplete = true; p.stage = 'question';
      return { began: true };
    }
    if (type === 'student:submit') {
      if (p.stage !== 'question' || body.questionNumber !== p.q) fail('That question is no longer open for you.', 'STALE_QUESTION');
      if (typeof body.answer !== 'string' || !body.answer.trim() || body.answer.length > 120) fail('Enter a short answer.', 'BAD_ANSWER', 400);
      const answer = answerOf(body.answer), question = QUESTIONS[p.q - 1], words = answer ? answer.split(' ').length : 0;
      if (!answer || words > (question.vocabulary ? 1 : 5)) fail(question.vocabulary ? 'Enter one word from the passage.' : 'Use no more than five words from the passage.', 'BAD_ANSWER', 400);
      p.attempts[p.q - 1] = Math.min(999, p.attempts[p.q - 1] + 1);
      const correct = question.answers.some(variant => answerOf(variant) === answer);
      if (correct) { p.accepted[p.q - 1] = answer; p.stage = 'success'; }
      return { correct, attempts: p.attempts[p.q - 1] };
    }
    if (type === 'student:discover') {
      if (p.stage !== 'success') fail('Answer the reading question first.', 'ANSWER_REQUIRED');
      p.stage = p.q === 10 ? 'hunt-dialogue' : 'camera'; p.dialogueIndex = 0;
      return { ready: true };
    }
    if (type === 'student:collect') {
      if (p.stage !== 'camera' || p.q >= 10 || !p.accepted[p.q - 1]) fail('This discovery is not ready.', 'DISCOVERY_REQUIRED');
      if (!p.discoveries.includes(p.q)) p.discoveries.push(p.q);
      p.q++;
      p.stage = DIALOGUE[p.q] ? 'dialogue' : 'question'; p.dialogueIndex = 0;
      return { collected: true, nextQuestion: p.q };
    }
    if (type === 'student:scan') {
      if (p.stage !== 'hunt' || !p.accepted[9] || p.discoveries.length !== 9) fail('Finish the investigation before scanning a seal.', 'HUNT_LOCKED');
      const scanned = String(body.code ?? '').trim().toUpperCase();
      const code = scanned.startsWith(`LK1|${room.pin}|`) ? scanned.slice(10) : scanned;
      if (equal(code, room.seals.decoy)) { const first = !p.decoySeen; p.decoySeen = true; return { decoy: true, first }; }
      if (equal(code, room.seals.genuine)) { p.stage = 'star'; return { genuine: true }; }
      fail('That is not one of this room’s two hidden seals. Keep searching.', 'UNKNOWN_SEAL');
    }
    if (type === 'student:star') {
      if (p.stage !== 'star' || !p.accepted[9]) fail('Find the genuine seal first.', 'SEAL_REQUIRED');
      p.discoveries.push(10); p.stage = 'ending'; p.dialogueIndex = 0;
      return { collected: true };
    }
    fail('Unknown adventure action.', 'UNKNOWN_ACTION', 404);
  }
}
