import { createHash, createHmac, randomBytes, randomInt, timingSafeEqual } from 'node:crypto';
import { GameError } from '../rooms/error.js';
import { QUESTIONS } from './questions.js';

export { GameError };
const COST = Object.freeze({ flash: 3, extra: 2, raise: 2, shield: 2 });
const SHOP_AFTER = new Set([5, 10, 15, 20, 25, 30]);
const token = () => randomBytes(32).toString('hex');
const digest = value => createHash('sha256').update(value).digest('hex');
const mac = (secret, value) => createHmac('sha256', secret).update(value).digest('hex');
const same = (a, b) => timingSafeEqual(Buffer.from(a, 'hex'), Buffer.from(b, 'hex'));
const questionFor = room => QUESTIONS[room.questionId - 1];
const roundFor = room => room.rounds[room.questionId];
const publicQuestion = question => question ? { id: question.id, prompt: question.prompt, scene: question.scene } : null;
const initialTeam = () => ({
  balance: 10, shield: false, correct: 0, incorrect: 0, unanswered: 0,
  earned: 0, lost: 0, unansweredLoss: 0, spent: 0,
});
const freshGame = () => ({
  gameId: token().slice(0, 24), phase: 'lobby', questionId: 0,
  rounds: {}, shop: null, receipts: {}, showLeaderboard: false, results: null,
});
function fail(message, code = 'INVALID_ACTION', status = 409) {
  throw new GameError(message, code, status);
}
function requirePhase(room, ...allowed) {
  if (!allowed.includes(room.phase)) fail('Tindakan ini tidak tersedia pada fasa ini.', 'WRONG_PHASE');
}
function shuffle(values, random) {
  const result = [...values];
  for (let i = result.length - 1; i > 0; i--) {
    const j = random(i + 1);
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}
function wagers(balance, effect) {
  const extra = effect === 'raise' ? 1 : 0;
  return [1, 2, 3].map(base => ({ base, actual: base + extra })).filter(x => x.actual <= balance);
}
function standings(room, final = false) {
  const round = roundFor(room);
  const ranked = room.players.map(p => {
    // While marking is private, avoid revealing correctness through balance movements.
    const balance = room.phase === 'closed' ? round.seats[p.id].openingBalance : p.balance;
    const row = { id: p.id, name: p.name, balance };
    if (final) {
      const { correct, incorrect, unanswered, earned, lost, unansweredLoss, spent } = p;
      Object.assign(row, { correct, incorrect, unanswered, earned, lost, unansweredLoss, spent,
        accuracy: Math.round(100 * correct / (correct + incorrect + unanswered || 1)) });
    }
    return row;
  }).sort((a, b) => b.balance - a.balance);
  let rank = 0;
  return ranked.map((row, i) => {
    if (i === 0 || row.balance !== ranked[i - 1].balance) rank = i + 1;
    return { ...row, rank };
  });
}
function responseOutcome(q, seat) {
  if (seat.result) return seat.result.outcome;
  if (!seat.submission) return 'pending';
  return seat.submission.optionId === q.correctId ? 'correct' : 'incorrect';
}
function answerStatus(round, playerId) {
  const seat = round.seats[playerId];
  if (seat.submission) return 'submitted';
  if (round.settled) return 'unanswered';
  return seat.choosing ? 'choosing' : 'waiting';
}
function answerInfo(q, round) {
  const answer = q.options.find(option => option.id === q.correctId);
  const votes = { correct: 0, incorrect: 0, unanswered: 0 };
  if (!round.settled) votes.pending = 0;
  for (const seat of Object.values(round.seats)) votes[responseOutcome(q, seat)]++;
  return { caption: answer.caption, art: answer.art, explanation: q.explanation,
    nilai: q.nilai ?? null, ...votes };
}

export class MenitiGame {
  constructor({ now = Date.now, random = randomInt, secret = token() } = {}) {
    this.now = now;
    this.random = random;
    this.secret = secret;
    this.rooms = new Map();
    this.lastSeen = new Map();
  }

  create() {
    const pin = String(10000 + this.random(90000));
    const hostToken = token();
    const createdAt = this.now();
    this.rooms.set(pin, { pin, hostHash: digest(hostToken), createdAt,
      expiresAt: createdAt + 48 * 3600000, version: 1, players: [], ...freshGame() });
    return { pin, hostToken };
  }

  room(pin) {
    const r = this.rooms.get(String(pin));
    if (!r || r.expiresAt <= this.now()) fail('Bilik telah tamat. Dapatkan kod QR baharu daripada guru.', 'ROOM_NOT_FOUND', 404);
    return r;
  }

  join(pin, { clientId, name } = {}) {
    const r = this.room(pin);
    if (typeof clientId !== 'string' || !/^[-a-zA-Z0-9]{20,100}$/.test(clientId)) {
      fail('Muat semula untuk mengenal pasti peranti.', 'BAD_IDENTITY', 400);
    }
    const playerToken = mac(this.secret, 'meniti:' + pin + ':' + r.createdAt + ':' + clientId);
    const existing = r.players.find(p => p.clientId === clientId);
    if (existing) return { playerId: existing.id, playerToken };
    requirePhase(r, 'lobby');
    if (r.players.length >= 12) fail('Kesemua 12 tempat telah diisi.', 'ROOM_FULL');
    const teamName = typeof name === 'string' ? name.normalize('NFKC').replace(/[\u0000-\u001f\u007f]/g, '').trim().slice(0, 28) : '';
    if (!teamName) fail('Masukkan nama pasukan.', 'NAME_REQUIRED', 400);
    const playerId = randomBytes(12).toString('hex');
    r.players.push({ id: playerId, clientId, name: teamName, tokenHash: digest(playerToken), ...initialTeam() });
    r.version++;
    this.lastSeen.set(pin + ':' + playerId, this.now());
    return { playerId, playerToken };
  }

  auth(room, key) {
    if (!key) return { role: 'public' };
    if (typeof key !== 'string') fail('Kunci peranti tidak sah.', 'UNAUTHORIZED', 401);
    const hashed = digest(key);
    if (same(hashed, room.hostHash)) return { role: 'host' };
    const player = room.players.find(p => same(hashed, p.tokenHash));
    if (!player) fail('Kunci peranti tidak sah.', 'UNAUTHORIZED', 401);
    this.lastSeen.set(room.pin + ':' + player.id, this.now());
    return { role: 'student', player };
  }

  startQuestion(room) {
    const attacks = {};
    if (room.shop) {
      // Eligibility is determined after all purchases, before any refunds change a balance.
      const unaffordable = new Set(room.players.filter(p => p.balance < 2).map(p => p.id));
      for (const [from, purchase] of Object.entries(room.shop.purchases)) {
        if (purchase.card === 'shield') continue;
        const buyer = room.players.find(p => p.id === from);
        const target = room.players.find(p => p.id === purchase.targetId);
        const refunded = purchase.card === 'raise' && unaffordable.has(target.id);
        const blocked = !refunded && target.shield;
        if (refunded) {
          buyer.balance += COST.raise;
          buyer.spent -= COST.raise;
        } else if (blocked) {
          target.shield = false;
        }
        attacks[target.id] = { from, name: buyer.name, card: purchase.card, blocked, refunded };
      }
    }
    room.shop = null;
    room.showLeaderboard = false;
    room.questionId++;
    const seats = {};
    for (const player of room.players) {
      if (player.balance === 0) player.balance = 1;
      const attack = attacks[player.id] ?? null;
      seats[player.id] = { openingBalance: player.balance, attack,
        effect: attack && !attack.blocked && !attack.refunded ? attack.card : null,
        hand: [], previewStart: null, previewEnd: null, choosing: false, submission: null, result: null };
    }
    room.rounds[room.questionId] = { deadline: null, settled: false, revealed: false, seats };
    this.deal(room);
  }

  deal(room) {
    const q = questionFor(room);
    for (const p of room.players) {
      const seat = roundFor(room).seats[p.id];
      const pool = q.options.slice(0, seat.effect === 'extra' ? 5 : 4);
      seat.hand = shuffle(pool, this.random).map(opt => ({ optionId: opt.id,
        id: mac(this.secret, [room.gameId, q.id, p.id, opt.id].join(':')).slice(0, 32) }));
    }
    room.phase = 'answering';
  }

  settle(room) {
    const round = roundFor(room);
    if (round.settled) return;
    const q = questionFor(room);
    for (const p of room.players) {
      const seat = round.seats[p.id];
      const sub = seat.submission;
      const outcome = sub ? responseOutcome(q, seat) : 'unanswered';
      const actual = sub?.actualWager ?? Math.min(p.balance, seat.effect === 'raise' ? 2 : 1);
      const delta = outcome === 'correct' ? actual : -actual;
      p.balance += delta;
      p[outcome]++;
      if (outcome === 'correct') p.earned += actual;
      if (outcome === 'incorrect') p.lost += actual;
      if (outcome === 'unanswered') p.unansweredLoss += actual;
      seat.result = { outcome, delta, actualWager: actual };
    }
    round.settled = true;
    room.phase = 'closed';
  }

  tick(room) {
    // Resume rooms saved by an earlier release while the teacher was still reading the question.
    if (room.phase === 'question') {
      this.deal(room);
      room.version++;
    }
    if (room.phase === 'answering' && roundFor(room).deadline !== null && this.now() >= roundFor(room).deadline) {
      this.settle(room);
      room.version++;
    }
  }

  state(pin, key) {
    const room = this.room(pin);
    const actor = this.auth(room, key);
    this.tick(room);
    return this.view(room, actor);
  }

  review(pin, key, questionId) {
    const room = this.room(pin);
    if (this.auth(room, key).role !== 'host') fail('Kunci guru diperlukan.', 'FORBIDDEN', 403);
    const id = Number(questionId ?? room.questionId);
    const round = room.rounds[id];
    const live = id === room.questionId && room.phase === 'answering';
    if (!round || (!round.settled && !live)) fail('Tunggu sehingga kad diedarkan.', 'NOT_SETTLED');
    const q = QUESTIONS[id - 1];
    return { question: publicQuestion(q), live, settled: round.settled, pending: 0,
      ...answerInfo(q, round), reference: q.reference,
      entries: room.players.map(p => {
        const seat = round.seats[p.id];
        const option = q.options.find(opt => opt.id === seat.submission?.optionId);
        const result = seat.result ?? { outcome: responseOutcome(q, seat),
          actualWager: seat.submission?.actualWager ?? null, delta: null };
        return { id: p.id, name: p.name, caption: option?.caption ?? null,
          baseWager: seat.submission?.baseWager ?? null, ...result, effect: seat.effect, attack: seat.attack };
      }) };
  }

  view(room, actor) {
    const serverNow = this.now();
    const q = questionFor(room);
    const round = roundFor(room);
    const online = id => {
      const seen = this.lastSeen.get(room.pin + ':' + id);
      return seen !== undefined && serverNow - seen < 25000;
    };
    const players = standings(room).map(row => ({ ...row, online: online(row.id) }));
    const upcoming = QUESTIONS[room.questionId];
    const sources = new Set();
    for (const item of [q, upcoming]) {
      if (!item || room.phase === 'ended') continue;
      sources.add(item.scene);
      if (actor.role === 'student') for (const opt of item.options) sources.add(opt.art);
    }
    // A shared, unordered asset set always includes all distractors. Preloads never
    // encode which cards are in a team's hand or where a card will be dealt.
    const preload = [...sources].map(url => ({ url, order: mac(this.secret, url) }))
      .sort((a, b) => a.order.localeCompare(b.order)).map(item => item.url);
    const v = { pin: room.pin, gameId: room.gameId, role: actor.role, version: room.version,
      phase: room.phase, serverNow, questionId: room.questionId, questionCount: QUESTIONS.length,
      question: publicQuestion(q), players, joinedCount: players.length,
      onlineCount: players.filter(p => p.online).length,
      submittedCount: round ? Object.values(round.seats).filter(seat => seat.submission).length : 0,
      deadline: round?.deadline ?? null, showLeaderboard: room.showLeaderboard,
      shopDue: room.phase === 'reveal' && SHOP_AFTER.has(room.questionId), preload,
      reveal: round?.revealed ? answerInfo(q, round) : null, results: room.results };
    if (actor.role === 'host') {
      if (round) {
        for (const player of players) player.answerStatus = answerStatus(round, player.id);
      }
      v.history = Object.keys(room.rounds).map(Number).filter(id => room.rounds[id].settled);
    }
    if (actor.role !== 'student') return v;
    const currentArt = new Set(q?.options.map(option => option.art));
    v.currentPreload = preload.filter(url => currentArt.has(url));
    const p = actor.player;
    const seat = round?.seats[p.id];
    const answering = room.phase === 'answering';
    const isFlash = seat?.effect === 'flash';
    const visible = !isFlash || (seat.previewEnd !== null && serverNow < seat.previewEnd);
    let hand = [];
    if (answering && !seat.submission && (!isFlash || seat.previewStart !== null)) {
      hand = seat.hand.map(card => {
        if (!visible) return { id: card.id };
        const opt = q.options.find(o => o.id === card.optionId);
        return { id: card.id, caption: opt.caption, art: opt.art };
      });
    }
    v.me = { id: p.id, name: p.name, balance: players.find(row => row.id === p.id).balance,
      shield: p.shield, effect: seat?.effect ?? null, attack: seat?.attack ?? null, hand,
      // Layout is shared by the whole question, including concealed hands on a fresh device.
      longCaptions: q?.options.some(option => option.caption.length > 27) ?? false,
      ready: seat?.previewStart != null, previewStart: seat?.previewStart ?? null, previewEnd: seat?.previewEnd ?? null,
      submitted: !!seat?.submission, baseWager: seat?.submission?.baseWager ?? null,
      actualWager: seat?.submission?.actualWager ?? null, purchase: room.shop?.purchases[p.id] ?? null,
      wagers: answering ? wagers(p.balance, seat.effect) : [],
      result: (round?.revealed || room.phase === 'ended') ? seat?.result ?? null : null };
    if (room.phase === 'shop') {
      v.shopTargets = players.filter(other => other.id !== p.id).map(other => ({
        id: other.id, name: other.name, available: !room.shop.targets[other.id],
      }));
      const from = room.shop.targets[p.id];
      if (from) v.me.attack = { from, name: players.find(other => other.id === from).name,
        card: room.shop.purchases[from].card, blocked: false, refunded: false };
    }
    return v;
  }

  buy(room, player, { card, targetId }) {
    requirePhase(room, 'shop');
    if (!Object.hasOwn(COST, card)) fail('Pilih kad sabotaj yang sah.', 'INVALID_CARD');
    const { purchases, targets } = room.shop;
    if (purchases[player.id]) fail('Anda telah membeli kad dalam fasa ini.', 'ALREADY_PURCHASED');
    const cost = COST[card];
    if (player.balance - cost < 1) fail('Tinggalkan sekurang-kurangnya satu cip.', 'INSUFFICIENT_CHIPS');
    if (card === 'shield') {
      if (player.shield) fail('Anda sudah memiliki perisai.', 'ALREADY_SHIELDED');
      player.shield = true;
    } else {
      const target = room.players.find(p => p.id === targetId);
      if (!target || target === player) fail('Pilih pasukan lain sebagai sasaran.', 'INVALID_TARGET');
      if (targets[target.id]) fail('Pasukan ini telah disasarkan. Pilih pasukan lain.', 'TARGET_TAKEN');
      if (card === 'raise' && target.balance < 2) fail('Sasaran tidak mampu menaikkan taruhan. Pilih pasukan lain.', 'UNAFFORDABLE_TARGET');
      targets[target.id] = player.id;
    }
    player.balance -= cost;
    player.spent += cost;
    purchases[player.id] = { card, targetId: card === 'shield' ? null : targetId };
  }

  apply(room, actor, body) {
    const round = roundFor(room);
    const seat = round?.seats[actor.player?.id];
    switch (body.type) {
      case 'host:start':
        requirePhase(room, 'lobby');
        if (!room.players.length) fail('Tunggu sekurang-kurangnya satu pasukan.', 'NO_TEAMS');
        return this.startQuestion(room);
      case 'host:deal':
        // An older teacher tab may have already queued a deal for this question.
        requirePhase(room, 'answering');
        return false;
      case 'host:countdown': {
        requirePhase(room, 'answering');
        const seconds = body.seconds ?? 10;
        if (!Number.isInteger(seconds) || seconds < 5 || seconds > 120) fail('Pilih 5 hingga 120 saat.', 'INVALID_DURATION');
        if (round.deadline !== null) fail('Kiraan detik telah bermula.', 'COUNTDOWN_STARTED');
        round.deadline = this.now() + seconds * 1000;
        return;
      }
      case 'student:ready':
        requirePhase(room, 'answering');
        if (seat.effect !== 'flash' || seat.submission) fail('Pratonton ini tidak tersedia.', 'NO_PREVIEW');
        if (seat.previewStart === null) {
          // The client acknowledges decoded images. A short lead lets the phone
          // schedule both edges using the same server clock, independently of polls.
          seat.previewStart = this.now() + 600;
          seat.previewEnd = seat.previewStart + 3000;
        }
        return;
      case 'student:choosing':
        if (round?.settled) return false;
        requirePhase(room, 'answering');
        if (body.cardId !== undefined || body.wager !== undefined) {
          fail('Hantar status sahaja tanpa kad atau taruhan.', 'INVALID_STATUS', 400);
        }
        if (seat.submission || seat.choosing) return false;
        seat.choosing = true;
        return;
      case 'student:submit': {
        requirePhase(room, 'answering');
        if (seat.submission) fail('Jawapan telah dikunci.', 'ALREADY_SUBMITTED');
        if (seat.effect === 'flash' && (seat.previewEnd === null || this.now() < seat.previewEnd)) {
          fail('Tunggu sehingga kad diterbalikkan.', 'PREVIEW_ACTIVE');
        }
        const card = seat.hand.find(c => c.id === body.cardId);
        const wager = wagers(actor.player.balance, seat.effect).find(w => w.base === body.wager);
        if (!card || !wager) fail('Pilih kad dan taruhan yang sah.', 'INVALID_PLAY', 400);
        seat.submission = { optionId: card.optionId, baseWager: wager.base, actualWager: wager.actual };
        return;
      }
      case 'host:close':
        requirePhase(room, 'answering');
        return this.settle(room);
      case 'host:reveal':
        requirePhase(room, 'answering', 'closed', 'reveal');
        if (room.phase === 'answering') this.settle(room);
        round.revealed = true;
        room.phase = 'reveal';
        return;
      case 'host:openShop':
        requirePhase(room, 'reveal');
        if (!SHOP_AFTER.has(room.questionId)) fail('Kedai belum dibuka untuk soalan ini.', 'NO_SHOP');
        room.shop = { purchases: {}, targets: {} };
        room.phase = 'shop';
        room.showLeaderboard = false;
        return;
      case 'student:buy':
        return this.buy(room, actor.player, body);
      case 'host:closeShop':
        requirePhase(room, 'shop');
        room.phase = 'shopClosed';
        return;
      case 'host:next':
        requirePhase(room, SHOP_AFTER.has(room.questionId) ? 'shopClosed' : 'reveal');
        if (room.questionId < QUESTIONS.length) return this.startQuestion(room);
        room.phase = 'ended';
        room.results = standings(room, true);
        return;
      case 'host:leaderboard':
        if (typeof body.visible !== 'boolean') fail('Pilih paparan kedudukan.', 'BAD_DISPLAY', 400);
        room.showLeaderboard = body.visible;
        return;
      case 'host:end':
        if (body.confirm !== true) fail('Sahkan tamat permainan.', 'CONFIRM_REQUIRED');
        if (room.phase === 'answering') this.settle(room);
        room.phase = 'ended';
        room.results = standings(room, true);
        return;
      case 'host:reset':
        if (body.confirm !== true) fail('Sahkan mula semula.', 'CONFIRM_REQUIRED');
        Object.assign(room, freshGame());
        for (const p of room.players) Object.assign(p, initialTeam());
        return;
      default:
        fail('Tindakan tidak dikenali.', 'UNKNOWN_ACTION', 400);
    }
  }

  action(pin, key, body = {}) {
    const room = this.room(pin);
    const actor = this.auth(room, key);
    if (actor.role === 'public') fail('Sertai bilik terlebih dahulu.', 'UNAUTHORIZED', 401);
    if (typeof body.type !== 'string' || !body.type.startsWith(actor.role === 'host' ? 'host:' : 'student:')) {
      fail('Tindakan ini memerlukan peranan lain.', 'FORBIDDEN', 403);
    }
    if (typeof body.requestId !== 'string' || !/^[-a-zA-Z0-9]{12,100}$/.test(body.requestId)) {
      fail('ID permintaan diperlukan.', 'MISSING_REQUEST_ID', 400);
    }
    this.tick(room);
    const receiptKey = (actor.player?.id ?? 'host') + ':' + body.requestId;
    const signature = digest(JSON.stringify(body));
    if (room.receipts[receiptKey]) {
      if (room.receipts[receiptKey] !== signature) fail('ID permintaan telah digunakan.', 'RECEIPT_CONFLICT');
      return { replayed: true, state: this.view(room, actor) };
    }
    if (body.gameId !== room.gameId || body.questionId !== room.questionId) {
      fail('Permainan atau soalan telah berubah. Semak skrin semasa.', 'STALE_ROUND');
    }
    if (room.phase === 'ended' && body.type !== 'host:reset') fail('Keputusan telah dimuktamadkan.', 'GAME_ENDED');
    // An action that was already applied needs no new receipt or version.
    if (this.apply(room, actor, body) === false) return { ok: true, state: this.view(room, actor) };
    room.receipts[receiptKey] = signature;
    room.version++;
    return { ok: true, state: this.view(room, actor) };
  }
}
