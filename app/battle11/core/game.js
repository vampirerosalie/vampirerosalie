import { createHash, createHmac, randomBytes, randomInt, timingSafeEqual } from 'node:crypto';
import { ANSWER_KEY, DISTRACTOR_EXPLANATIONS, INSTRUCTIONS, OPTIONS, STATIONS } from '../data.js';

export const VISIT_MS = 300_000;
export const STATION_CODES = Object.freeze(['N7QK2M8R', 'V4P9T6HX', 'J8W3C5LD', 'R2Y7F9NB', 'K6D4Q8SZ', 'T5H9M3VP']);
export const STATION_PAYLOADS = Object.freeze(STATION_CODES.map((code, i) => `MMJ1|S|${i + 1}|${code}`));
export class GameError extends Error {
  constructor(message, code = 'INVALID_ACTION', status = 409) { super(message); this.code = code; this.status = status; }
}
const fail = (message, code = 'INVALID_ACTION', status = 409) => { throw new GameError(message, code, status); };
const hash = value => createHash('sha256').update(String(value)).digest('hex');
const equal = (a, b) => typeof a === 'string' && typeof b === 'string' && a.length === b.length && timingSafeEqual(Buffer.from(a), Buffer.from(b));
const id = () => randomBytes(12).toString('hex');
const cleanName = value => String(value ?? '').normalize('NFKC').replace(/[\u0000-\u001f\u007f]/g, '').trim().slice(0, 28);
const countAnswers = p => p.choices.filter(Boolean).length;
const elapsed = (room, p) => p.submittedAt === null ? null : p.submittedAt - room.startAt;

export class MuseumGame {
  constructor({ now = Date.now, random = randomInt, secret = randomBytes(32).toString('hex'), retentionHours = 48 } = {}) {
    this.now = now; this.random = random; this.secret = secret; this.retentionMs = retentionHours * 3600000;
    this.rooms = new Map(); this.lastSeen = new Map();
  }
  save() {}
  room(pin) {
    if (!/^\d{5}$/.test(String(pin))) fail('Enter the five-digit room PIN.', 'INVALID_PIN', 400);
    const room = this.rooms.get(String(pin));
    if (!room || room.expiresAt <= this.now()) fail('This museum room has expired. Ask your teacher for the current QR code.', 'ROOM_NOT_FOUND', 404);
    return room;
  }
  create() {
    let pin; do { pin = String(10000 + this.random(90000)); } while (this.rooms.has(pin));
    const hostToken = randomBytes(32).toString('hex');
    const room = { pin, hostHash: hash(hostToken), createdAt: this.now(), expiresAt: this.now() + this.retentionMs,
      version: 1, phase: 'lobby', startAt: null, resultsReleased: false, players: [], receipts: {} };
    this.rooms.set(pin, room); this.save(room); return { pin, hostToken };
  }
  studentToken(room, clientId) { return createHmac('sha256', this.secret).update(`museum:${room.pin}:${room.createdAt}:${clientId}`).digest('hex'); }
  join(pin, { clientId, name } = {}) {
    const room = this.room(pin);
    if (typeof clientId !== 'string' || !/^[-a-zA-Z0-9]{20,100}$/.test(clientId)) fail('Reload this phone to create its saved identity.', 'BAD_IDENTITY', 400);
    const existing = room.players.find(p => p.clientId === clientId);
    if (existing) { this.touch(room, existing); return { playerId: existing.id, playerToken: this.studentToken(room, clientId) }; }
    if (room.phase === 'ended' || room.resultsReleased) fail('This museum game is closed to new groups.', 'JOIN_CLOSED');
    if (room.players.length >= 40) fail('This room already has 40 groups.', 'ROOM_FULL');
    const safeName = cleanName(name); if (!safeName) fail('Enter your group name.', 'NAME_REQUIRED', 400);
    const token = this.studentToken(room, clientId);
    const player = { id: id(), clientId, tokenHash: hash(token), name: safeName, choices: Array(6).fill(null),
      answerVersion: 0, reviewUnlocked: false, activeVisit: null, lastDepartedStation: null, visitHistory: [],
      submittedAt: null, lockedChoices: null, score: null, lastVisitEnd: null };
    room.players.push(player); room.version++; this.touch(room, player); this.save(room);
    return { playerId: player.id, playerToken: token };
  }
  touch(room, player) { this.lastSeen.set(`${room.pin}:${player.id}`, this.now()); }
  auth(room, token) {
    if (!token) return { role: 'public' };
    const digest = hash(token);
    if (equal(digest, room.hostHash)) return { role: 'host' };
    const player = room.players.find(p => equal(digest, p.tokenHash));
    if (!player) fail('This saved group key could not be verified.', 'UNAUTHORIZED', 401);
    this.touch(room, player); return { role: 'student', player };
  }
  expireVisits(room) {
    let changed = false;
    for (const p of room.players) if (p.activeVisit && p.activeVisit.expiresAt <= this.now()) {
      this.depart(p, 'expired', p.activeVisit.expiresAt); changed = true;
    }
    if (changed) { room.version++; this.save(room); }
  }
  depart(p, reason, at = this.now()) {
    const visit = p.activeVisit; if (!visit) return;
    p.lastDepartedStation = visit.station;
    p.visitHistory.push({ station: visit.station, visitId: visit.id, startedAt: visit.startedAt, endedAt: at, reason });
    p.lastVisitEnd = { station: visit.station, reason, at, hadSavedAnswer: Boolean(p.choices[visit.station - 1]) };
    p.activeVisit = null;
  }
  occupancy(room) {
    return STATIONS.map(station => {
      const occupying = room.players.filter(p => p.activeVisit?.station === station.number).map(p => ({
        id: p.id, name: p.name, visitEndsAt: p.activeVisit.expiresAt,
      }));
      return { number: station.number, title: station.cardTitle, count: occupying.length, capacity: 2, occupying };
    });
  }
  status(room, p) {
    if (p.submittedAt !== null) return 'Final submitted';
    if (room.phase === 'lobby') return 'In lobby';
    if (p.activeVisit) return `At Station ${p.activeVisit.station}`;
    if (p.reviewUnlocked) return 'Review unlocked';
    return 'Finding a station';
  }
  ranking(room) {
    const sorted = room.players.filter(p => p.submittedAt !== null).sort((a, b) => b.score - a.score || elapsed(room, a) - elapsed(room, b));
    let last = null, rank = 0;
    return sorted.map((p, index) => {
      const key = `${p.score}|${elapsed(room, p)}`;
      if (key !== last) rank = index + 1;
      last = key;
      return { rank, id: p.id, name: p.name, score: p.score, elapsedMs: elapsed(room, p), submittedAt: p.submittedAt };
    });
  }
  solutions() {
    return STATIONS.map(s => ({ number: s.number, title: s.title, before: s.before, after: s.after, answer: s.answer,
      sentence: OPTIONS[s.answer], explanation: s.explanation }));
  }
  view(room, actor) {
    const now = this.now(), base = { pin: room.pin, role: actor.role, phase: room.phase, version: room.version,
      serverTime: now, startAt: room.startAt, resultsReleased: room.resultsReleased,
      joinedCount: room.players.length, onlineCount: room.players.filter(p => (this.lastSeen.get(`${room.pin}:${p.id}`) ?? 0) > now - 25_000).length,
      stations: this.occupancy(room) };
    if (actor.role === 'host') return { ...base, groups: room.players.map(p => ({ id: p.id, name: p.name,
      online: (this.lastSeen.get(`${room.pin}:${p.id}`) ?? 0) > now - 25_000, status: this.status(room, p),
      currentStation: p.activeVisit?.station ?? null, visitEndsAt: p.activeVisit?.expiresAt ?? null,
      answeredCount: countAnswers(p), savedStations: p.choices.map(Boolean), reviewUnlocked: p.reviewUnlocked,
      submitted: p.submittedAt !== null, elapsedMs: elapsed(room, p), submittedAt: p.submittedAt })),
      ...(room.resultsReleased ? { ranking: this.ranking(room), solutions: this.solutions(), distractors: DISTRACTOR_EXPLANATIONS } : {}) };
    if (actor.role === 'student') {
      const p = actor.player, visit = p.activeVisit;
      return { ...base, instructions: INSTRUCTIONS, options: OPTIONS, me: {
        id: p.id, name: p.name, status: this.status(room, p), choices: p.choices, answerVersion: p.answerVersion,
        answeredCount: countAnswers(p), reviewUnlocked: p.reviewUnlocked,
        activeVisit: visit ? { id: visit.id, station: visit.station, startedAt: visit.startedAt, expiresAt: visit.expiresAt } : null,
        lastVisitEnd: p.lastVisitEnd, submitted: p.submittedAt !== null,
        lockedChoices: p.lockedChoices, elapsedMs: elapsed(room, p),
      }, ...(visit ? { paragraph: { number: visit.station, title: STATIONS[visit.station - 1].title,
        image: STATIONS[visit.station - 1].image, before: STATIONS[visit.station - 1].before,
        after: STATIONS[visit.station - 1].after } } : {}),
      ...(room.resultsReleased ? { ranking: this.ranking(room), solutions: this.solutions(), distractors: DISTRACTOR_EXPLANATIONS,
        myScore: p.score } : {}) };
    }
    return { ...base, stations: base.stations.map(({ number, title, count, capacity }) => ({ number, title, count, capacity })) };
  }
  state(pin, token) { const room = this.room(pin); this.expireVisits(room); return this.view(room, this.auth(room, token)); }
  action(pin, token, body = {}) {
    const room = this.room(pin); this.expireVisits(room); const actor = this.auth(room, token);
    if (actor.role === 'public') fail('A teacher or group key is required.', 'UNAUTHORIZED', 401);
    const { type, requestId } = body;
    if (typeof requestId !== 'string' || !/^[-a-zA-Z0-9]{12,100}$/.test(requestId)) fail('This action needs a receipt ID.', 'MISSING_REQUEST_ID', 400);
    if ((String(type).startsWith('host:') && actor.role !== 'host') || (String(type).startsWith('student:') && actor.role !== 'student')) fail('That action belongs to another role.', 'FORBIDDEN', 403);
    const key = `${actor.role === 'host' ? 'host' : actor.player.id}:${requestId}`;
    const signature = hash(JSON.stringify({ ...body, requestId: undefined })), receipt = room.receipts[key];
    if (receipt) {
      if (receipt.signature !== signature) fail('Receipt already used for a different action.', 'RECEIPT_CONFLICT');
      return { ok: true, replayed: true, result: receipt.result, state: this.view(room, actor) };
    }
    const backup = structuredClone(room);
    try {
      const result = this.apply(room, actor, body);
      room.version++; room.receipts[key] = { signature, result };
      const keys = Object.keys(room.receipts); if (keys.length > 2500) for (const old of keys.slice(0, keys.length - 2500)) delete room.receipts[old];
      this.save(room); return { ok: true, result, state: this.view(room, actor) };
    } catch (error) { this.rooms.set(pin, backup); throw error; }
  }
  apply(room, actor, body) {
    const type = body.type, p = actor.player;
    if (type === 'host:start') {
      if (room.phase !== 'lobby' || !room.players.length) fail('Wait for a group to join before starting.');
      room.phase = 'active'; room.startAt = this.now(); return { started: true };
    }
    if (type === 'host:end') {
      if (room.phase === 'ended') fail('This room is already closed.');
      room.phase = 'ended'; for (const player of room.players) this.depart(player, 'room-ended');
      return { ended: true };
    }
    if (type === 'host:reveal') {
      if (room.phase === 'lobby') fail('Start the game before revealing results.');
      room.resultsReleased = true; return { released: true };
    }
    if (room.phase !== 'active' || actor.role !== 'student') fail('The museum game is not active.', 'WRONG_PHASE');
    if (p.submittedAt !== null) fail('Your final answers are locked.', 'FINAL_LOCKED');
    if (type === 'student:scan') {
      const scanned = String(body.code ?? '').trim().toUpperCase();
      let index = STATION_PAYLOADS.indexOf(scanned);
      if (index < 0) index = STATION_CODES.indexOf(scanned);
      if (index < 0) fail('That is not a Museum Jewel station QR code or backup code.', 'UNRELATED_QR', 400);
      const station = index + 1;
      if (p.activeVisit) {
        if (p.activeVisit.station === station) return { restored: true, visitId: p.activeVisit.id };
        fail(`Leave Station ${p.activeVisit.station} before scanning another station.`, 'ONE_SLOT');
      }
      if (!p.reviewUnlocked && p.lastDepartedStation === station) fail('Visit a different station before returning here.', 'CONSECUTIVE_STATION');
      if (room.players.filter(other => other.activeVisit?.station === station).length >= 2)
        fail('This station is full. Two groups are working here. Please choose another station.', 'STATION_FULL');
      const startedAt = this.now(); p.activeVisit = { id: id(), station, startedAt, expiresAt: startedAt + VISIT_MS };
      p.lastVisitEnd = null;
      return { admitted: true, visitId: p.activeVisit.id };
    }
    if (type === 'student:save' || type === 'student:save-leave') {
      const visit = p.activeVisit;
      if (!visit || body.visitId !== visit.id || body.station !== visit.station) fail('This visit is no longer active. Scan the station again.', 'VISIT_EXPIRED');
      if (visit.expiresAt <= this.now()) fail('Time is up. Your last saved answer has been kept.', 'VISIT_EXPIRED');
      if (body.expectedVersion !== p.answerVersion) fail('A newer answer was saved on this group’s device. Refresh before changing it.', 'STALE_ANSWER');
      const letter = String(body.letter ?? '');
      if (!Object.hasOwn(OPTIONS, letter)) fail('Choose one sentence A–H.', 'BAD_LETTER', 400);
      const previous = p.choices.findIndex((choice, index) => index !== visit.station - 1 && choice === letter);
      if (previous >= 0 && body.confirmMove !== true) fail(`Sentence ${letter} is already saved at Station ${previous + 1}. Confirm before moving it.`, 'LETTER_IN_USE');
      if (previous >= 0) p.choices[previous] = null;
      p.choices[visit.station - 1] = letter; p.answerVersion++;
      if (countAnswers(p) === 6) p.reviewUnlocked = true;
      if (type === 'student:save-leave') this.depart(p, 'left');
      return { saved: true, movedFrom: previous >= 0 ? previous + 1 : null, left: type === 'student:save-leave', reviewUnlocked: p.reviewUnlocked };
    }
    if (type === 'student:submit') {
      if (countAnswers(p) !== 6 || new Set(p.choices).size !== 6) fail('Save six different sentence choices before final submission.', 'ANSWERS_INCOMPLETE');
      if (body.expectedVersion !== p.answerVersion) fail('Your saved answers changed. Review them before submitting.', 'STALE_ANSWER');
      const submittedAt = this.now();
      p.lockedChoices = [...p.choices]; p.score = p.lockedChoices.reduce((score, choice, index) => score + Number(choice === ANSWER_KEY[index]), 0);
      p.submittedAt = submittedAt; this.depart(p, 'submitted', submittedAt);
      return { submitted: true, elapsedMs: submittedAt - room.startAt };
    }
    fail('Unknown museum action.', 'UNKNOWN_ACTION', 404);
  }
}
