import test from 'node:test';
import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import { LanternGame, PERMANENT_SEALS, sealPayload } from '../../app/battle10/core/game.js';
import { DIALOGUE, PASSAGE, QUESTIONS } from '../../app/battle10/data.js';

function setup(n = 2) {
  let now = 1_000_000;
  const game = new LanternGame({ now: () => now, random: () => 0 }), host = game.create();
  const students = Array.from({ length: n }, (_, index) => game.join(host.pin, { clientId: randomUUID(), name: `Student ${index + 1}` }));
  const act = (token, type, extra = {}, requestId = randomUUID()) => game.action(host.pin, token, { type, requestId, ...extra });
  const view = token => game.state(host.pin, token);
  return { game, host, students, act, view, room: () => game.room(host.pin), tick: ms => { now += ms; } };
}
function dialogue(s, token) {
  while (['dialogue', 'hunt-dialogue', 'ending'].includes(s.view(token).me.stage)) s.act(token, 'student:dialogue-next');
  if (s.view(token).me.stage === 'reading') s.act(token, 'student:begin-questions');
}
function progress(s, token, q, answer = QUESTIONS[q - 1].answers[0]) {
  dialogue(s, token);
  assert.equal(s.view(token).me.q, q);
  assert.equal(s.act(token, 'student:submit', { questionNumber: q, answer }).result.correct, true);
  s.act(token, 'student:discover');
  if (q < 10) s.act(token, 'student:collect');
  else dialogue(s, token);
}

test('passage is complete and question order, vocabulary and dialogue remain server-owned', () => {
  assert.equal(PASSAGE.length, 6); assert.equal(QUESTIONS.length, 10);
  assert.equal(QUESTIONS[0].answers[0], 'fishing boats'); assert.equal(QUESTIONS[9].answers[0], 'the moon cupboard');
  assert.equal(QUESTIONS[7].answers[0], 'reluctant'); assert.equal(QUESTIONS[8].answers[0], 'faint');
  assert.equal(DIALOGUE[1].length, 3);
});
test('opening dialogue pauses at the six-page reading stage until the student begins questions', () => {
  const s = setup(1), token = s.students[0].playerToken;
  s.act(s.host.hostToken, 'host:start');
  for (let i = 0; i < DIALOGUE[1].length; i++) s.act(token, 'student:dialogue-next');
  const reading = s.view(token);
  assert.equal(reading.me.stage, 'reading'); assert.deepEqual(reading.passage, PASSAGE);
  assert.equal(s.view(s.host.hostToken).students[0].status, 'Reading passage');
  assert.throws(() => s.act(token, 'student:submit', { questionNumber: 1, answer: 'boats' }), /no longer open/);
  const receipt = randomUUID(); s.act(token, 'student:begin-questions', {}, receipt);
  assert.equal(s.act(token, 'student:begin-questions', {}, receipt).replayed, true);
  assert.equal(s.view(token).me.stage, 'question');
  assert.equal(s.view(token).me.completed, 0);
  assert.deepEqual(s.view(s.host.hostToken).passage, PASSAGE);
  assert.throws(() => s.act(token, 'student:begin-questions'), /Finish the opening passage/);
});
test('two students progress independently through every question, nine objects and the final hunt', () => {
  const s = setup(), a = s.students[0].playerToken, b = s.students[1].playerToken;
  assert.equal(s.view(a).phase, 'lobby'); s.act(s.host.hostToken, 'host:start');
  const hostBefore = s.view(s.host.hostToken); assert.equal(hostBefore.students.length, 2); assert.equal(hostBefore.students[0].completed, 0);
  for (let q = 1; q <= 9; q++) {
    progress(s, a, q);
    assert.equal(s.view(a).me.discoveries.length, q);
    assert.equal(s.view(b).me.q, 1);
    assert.equal(s.view(b).me.stage, 'dialogue');
  }
  const before = s.view(a); assert.equal(before.me.q, 10); assert.equal(before.me.discoveries.length, 9);
  progress(s, a, 10, ' The moon cupboard ');
  assert.equal(s.view(a).me.stage, 'hunt');
  assert.equal(s.view(a).me.completed, 10);
  assert.equal(s.view(a).me.discoveries.length, 9);
  assert.equal(s.act(a, 'student:scan', { code: `LK1|${s.host.pin}|${s.room().seals.decoy}` }).result.first, true);
  assert.equal(s.act(a, 'student:scan', { code: s.room().seals.decoy }).result.first, false);
  assert.equal(s.view(a).me.stage, 'hunt');
  s.act(a, 'student:scan', { code: s.room().seals.genuine });
  assert.equal(s.view(a).me.stage, 'star'); assert.equal(s.view(a).me.discoveries.length, 9);
  s.act(a, 'student:star'); dialogue(s, a);
  assert.equal(s.view(a).me.stage, 'complete'); assert.equal(s.view(a).me.discoveries.length, 10);
  assert.equal(s.view(b).me.stage, 'dialogue');
  const host = s.view(s.host.hostToken); assert.equal(host.students[0].finished, true); assert.equal(host.students[1].finished, false);
});
test('strict answers retain word limit, retry and hint without unlocking on rejection', () => {
  const s = setup(1), t = s.students[0].playerToken; s.act(s.host.hostToken, 'host:start'); dialogue(s, t);
  assert.equal(s.act(t, 'student:submit', { questionNumber: 1, answer: 'a boat' }).result.correct, false);
  assert.equal(s.act(t, 'student:submit', { questionNumber: 1, answer: 'not fishing boats' }).result.correct, false);
  assert.match(s.view(t).me.hint, /waiting outside/i);
  assert.throws(() => s.act(t, 'student:submit', { questionNumber: 1, answer: 'one two three four five six' }), /five words/);
  assert.equal(s.view(t).me.stage, 'question'); assert.equal(s.view(t).me.discoveries.length, 0);
  assert.equal(s.act(t, 'student:submit', { questionNumber: 1, answer: '  fishing boats  ' }).result.correct, true);
  assert.equal(s.view(t).me.stage, 'success');
  assert.throws(() => s.act(t, 'student:submit', { questionNumber: 1, answer: 'boats' }), /no longer open/);
  s.act(t, 'student:discover'); s.act(t, 'student:collect');
  for (let q = 2; q <= 7; q++) progress(s, t, q);
  dialogue(s, t); assert.equal(s.view(t).me.q, 8);
  assert.equal(s.act(t, 'student:submit', { questionNumber: 8, answer: 'hesitant' }).result.correct, false);
  assert.throws(() => s.act(t, 'student:submit', { questionNumber: 8, answer: 'very reluctant' }), /one word/);
  assert.equal(s.act(t, 'student:submit', { questionNumber: 8, answer: 'Reluctant' }).result.correct, true);
  s.act(t, 'student:discover'); s.act(t, 'student:collect');
  assert.equal(s.view(t).me.q, 9); assert.equal(s.view(t).me.stage, 'question');
  assert.equal(s.act(t, 'student:submit', { questionNumber: 9, answer: 'Faint' }).result.correct, true);
});
test('every approved exact answer is accepted, with only outer whitespace trimmed', () => {
  for (let q = 1; q <= 10; q++) for (const variant of QUESTIONS[q - 1].answers) {
    const s = setup(1), token = s.students[0].playerToken;
    const room = s.room(), player = room.players[0]; room.phase = 'active'; player.stage = 'question'; player.q = q;
    assert.equal(s.act(token, 'student:submit', { questionNumber: q, answer: `  ${variant}  ` }).result.correct, true, `Q${q}: ${variant}`);
    assert.equal(s.view(token).me.stage, 'success');
  }
});
test('unapproved capitalisation, synonyms, fragments, punctuation and extra words never unlock discoveries', () => {
  const rejected = {
    1: ['Fishing boats', 'FISHING BOATS', 'boats', 'the fishing boats', 'fishing boats.', 'fishing  boats'],
    2: ['RAINWATER', 'water', 'rain water', 'Rainwater.', 'rainwater and cloth'],
    3: ['Copper', 'copper', 'The Copper Lantern', 'the copper lantern.', 'copper lantern and silver'],
    4: ['handle', 'The Damaged Handle', 'a damaged handle', 'the damaged handle.'],
    5: ['walkway', 'The covered walkway', 'a Covered walkway', 'covered walkway.'],
    6: ['stone floor', 'the firm stone floor', 'Its Firm Stone Floor', 'firm stone floor.'],
    7: ['shutter', 'the loose shutter', 'A Loose Shutter', 'loose shutter.'],
    8: ['RELUCTANT', 'hesitant', 'reluctantly', 'reluctant.'],
    9: ['FAINT', 'faintly', 'weak', 'Faint.'],
    10: ['moon', 'moon or sun', 'The Moon Cupboard', 'the moon cupboard.'],
  };
  for (let q = 1; q <= 10; q++) for (const answer of rejected[q]) {
    const s = setup(1), token = s.students[0].playerToken;
    const room = s.room(), player = room.players[0]; room.phase = 'active'; player.stage = 'question'; player.q = q;
    assert.equal(s.act(token, 'student:submit', { questionNumber: q, answer }).result.correct, false, `Q${q}: ${answer}`);
    assert.equal(s.view(token).me.stage, 'question');
    assert.equal(s.view(token).me.discoveries.length, 0);
    assert.throws(() => s.act(token, 'student:discover'), /Answer the reading question first/);
  }
});
test('sealed QR claims cannot bypass reading or duplicate collection; retry receipt is idempotent', () => {
  const s = setup(1), t = s.students[0].playerToken; s.act(s.host.hostToken, 'host:start'); dialogue(s, t);
  assert.throws(() => s.act(t, 'student:scan', { code: s.room().seals.genuine }), /Finish the investigation/);
  assert.throws(() => s.act(t, 'student:collect'), /not ready/);
  const receipt = randomUUID(), args = { questionNumber: 1, answer: 'fishing boats' };
  const first = s.act(t, 'student:submit', args, receipt), second = s.act(t, 'student:submit', args, receipt);
  assert.equal(first.result.correct, true); assert.equal(second.replayed, true); assert.equal(s.room().players[0].attempts[0], 1);
  s.act(t, 'student:discover'); const collectId = randomUUID(); s.act(t, 'student:collect', {}, collectId);
  assert.equal(s.act(t, 'student:collect', {}, collectId).replayed, true);
  assert.equal(s.view(t).me.discoveries.length, 1);
});
test('student and public views never expose answer keys, seal values or teacher controls', () => {
  const s = setup(1), t = s.students[0].playerToken; s.act(s.host.hostToken, 'host:start'); dialogue(s, t);
  const student = JSON.stringify(s.view(t)), publicView = JSON.stringify(s.view());
  assert.doesNotMatch(student, /"answers"|"hint":"Who or what|"seals"|"hostHash"|"tokenHash"/);
  assert.doesNotMatch(publicView, /fishing boats|"players"|"seals"|"hostHash"/);
  assert.throws(() => s.game.sealCards(s.host.pin, t), /Only the teacher/);
  assert.throws(() => s.act(t, 'host:end'), /another role/);
});
test('a room accepts 40 independent students, preserves reconnect identity, and locks on teacher end', () => {
  const s = setup(40); assert.equal(s.room().players.length, 40);
  const same = s.game.join(s.host.pin, { clientId: s.room().players[0].clientId, name: 'Renamed' });
  assert.equal(same.playerId, s.students[0].playerId);
  assert.throws(() => s.game.join(s.host.pin, { clientId: randomUUID(), name: '41st' }), /40 students/);
  s.act(s.host.hostToken, 'host:start'); s.act(s.host.hostToken, 'host:end');
  assert.equal(s.view(s.students[0].playerToken).phase, 'ended');
  assert.throws(() => s.act(s.students[0].playerToken, 'student:dialogue-next'), /ended/);
  assert.throws(() => s.game.join(s.host.pin, { clientId: randomUUID(), name: 'Late student' }), /ended/);
});
test('late students join the same active room at Question 1 without resetting existing students', () => {
  const s = setup(1), first = s.students[0].playerToken;
  s.act(s.host.hostToken, 'host:start'); dialogue(s, first);
  assert.equal(s.view(first).me.stage, 'question');
  const identity = randomUUID();
  const late = s.game.join(s.host.pin, { clientId: identity, name: 'Late student' });
  assert.equal(s.view(late.playerToken).phase, 'active');
  assert.equal(s.view(late.playerToken).me.q, 1);
  assert.equal(s.view(late.playerToken).me.stage, 'dialogue');
  assert.equal(s.view(first).me.stage, 'question');
  assert.equal(s.view(s.host.hostToken).students.length, 2);
  assert.equal(s.game.join(s.host.pin, { clientId: identity, name: 'Renamed' }).playerId, late.playerId);
  assert.equal(s.view(s.host.hostToken).students.length, 2);
});

test('permanent seals work across new rooms but only advance the authenticated student after the hunt unlocks', () => {
  const s = setup(2), token = s.students[0].playerToken;
  s.game.random = () => 1;
  const host2 = s.game.create(), student2 = s.game.join(host2.pin, { clientId: randomUUID(), name: 'Next class' });
  const other = {
    view: t => s.game.state(host2.pin, t),
    act: (t, type, extra = {}, requestId = randomUUID()) => s.game.action(host2.pin, t, { type, requestId, ...extra }),
  };
  const cards = s.game.sealCards(s.host.pin, s.host.hostToken), nextCards = s.game.sealCards(host2.pin, host2.hostToken);
  assert.notEqual(cards.pin, nextCards.pin);
  for (const key of ['genuine', 'decoy', 'genuineCard']) assert.equal(cards[key], nextCards[key]);
  s.act(s.host.hostToken, 'host:start'); other.act(host2.hostToken, 'host:start');
  assert.throws(() => other.act(student2.playerToken, 'student:scan', { code: sealPayload(cards.genuine) }), /Finish the investigation/);
  for (let q = 1; q <= 10; q++) progress(s, token, q);
  assert.equal(s.act(token, 'student:scan', { code: sealPayload(cards.decoy) }).result.decoy, true);
  assert.equal(s.act(token, 'student:scan', { code: sealPayload(cards.decoy) }).result.first, false);
  assert.equal(s.view(token).me.stage, 'hunt');
  assert.throws(() => s.act(token, 'student:scan', { code: 'https://unrelated.example/' }), /not a keeper seal/);
  s.act(token, 'student:scan', { code: sealPayload(cards.genuine) });
  const receipt = randomUUID(); s.act(token, 'student:star', {}, receipt);
  assert.equal(s.act(token, 'student:star', {}, receipt).replayed, true);
  assert.equal(s.view(token).me.discoveries.length, 10);
  assert.equal(s.view(s.students[1].playerToken).me.discoveries.length, 0);
  assert.equal(other.view(student2.playerToken).me.discoveries.length, 0);
  s.act(s.host.hostToken, 'host:end');
  for (let q = 1; q <= 10; q++) progress(other, student2.playerToken, q);
  assert.equal(other.act(student2.playerToken, 'student:scan', { code: sealPayload(cards.genuine) }).result.genuine, true);
  assert.equal(other.view(student2.playerToken).me.stage, 'star');
});

test('legacy printed room seals remain valid only in their original room; new printouts are permanent', () => {
  const s = setup(1), token = s.students[0].playerToken;
  s.room().seals = { genuine: 'OLDGENUINE12', decoy: 'OLDDECOY1234', genuineCard: 'B' };
  const cards = s.game.sealCards(s.host.pin, s.host.hostToken);
  assert.equal(cards.genuine, PERMANENT_SEALS.genuine); assert.equal(cards.genuineCard, 'A');
  s.act(s.host.hostToken, 'host:start');
  for (let q = 1; q <= 10; q++) progress(s, token, q);
  assert.throws(() => s.act(token, 'student:scan', { code: 'LK1|99999|OLDGENUINE12' }), /not a keeper seal/);
  assert.equal(s.act(token, 'student:scan', { code: `LK1|${s.host.pin}|OLDDECOY1234` }).result.decoy, true);
  assert.equal(s.act(token, 'student:scan', { code: PERMANENT_SEALS.decoy }).result.decoy, true);
  assert.equal(s.act(token, 'student:scan', { code: `LK1|${s.host.pin}|OLDGENUINE12` }).result.genuine, true);
});

test('first genuine scan wins before collection, persists on reconnect/end, and ignores client timing', () => {
  const s = setup(2), [a, b] = s.students.map(p => p.playerToken);
  s.act(s.host.hostToken, 'host:start');
  assert.equal(s.room().startedAt, 1_000_000);
  assert.throws(() => s.act(a, 'student:scan', { code: sealPayload(PERMANENT_SEALS.genuine) }), /Finish the investigation/);
  for (const token of [a, b]) for (let q = 1; q <= 10; q++) progress(s, token, q);
  s.act(a, 'student:scan', { code: sealPayload(PERMANENT_SEALS.decoy) });
  assert.equal(s.view(s.host.hostToken).winner, null);
  s.tick(123456);
  const receipt = randomUUID(), payload = { code: sealPayload(PERMANENT_SEALS.genuine), foundAt: 0, elapsedMs: 0 };
  s.act(b, 'student:scan', payload, receipt);
  const winner = s.view(s.host.hostToken).winner;
  assert.deepEqual(winner, { playerId: s.students[1].playerId, name: 'Student 2', foundAt: 1_123_456, elapsedMs: 123456 });
  assert.equal(s.view(b).me.stage, 'star');
  assert.equal(s.view(b).me.discoveries.length, 9);
  assert.equal(s.view(b).winner, undefined);
  assert.equal(s.game.state(s.host.pin).winner, undefined);
  s.tick(1000);
  assert.equal(s.act(b, 'student:scan', payload, receipt).replayed, true);
  s.act(a, 'student:scan', { code: sealPayload(PERMANENT_SEALS.genuine) });
  s.act(a, 'student:star'); // Losing player collects first; the winner cannot change.
  assert.deepEqual(s.view(s.host.hostToken).winner, winner);
  assert.equal(s.view(a).phase, 'active');
  const restored = new LanternGame({ secret: s.game.secret, now: () => 1_124_456 });
  restored.rooms.set(s.host.pin, JSON.parse(JSON.stringify(s.room())));
  assert.deepEqual(restored.state(s.host.pin, s.host.hostToken).winner, winner);
  s.act(s.host.hostToken, 'host:end');
  assert.deepEqual(s.view(s.host.hostToken).winner, winner);
  s.game.random = () => 1;
  const next = s.game.create();
  assert.equal(s.game.state(next.pin, next.hostToken).winner, null);
});

test('older rooms with previous real-seal discoveries do not invent a winner', () => {
  const s = setup(2), [a, b] = s.students.map(p => p.playerToken);
  s.act(s.host.hostToken, 'host:start');
  for (const token of [a, b]) for (let q = 1; q <= 10; q++) progress(s, token, q);
  s.room().players[0].stage = 'star'; // Saved pre-update room without scan timestamps.
  delete s.room().startedAt; delete s.room().winner;
  assert.equal(s.view(s.host.hostToken).winnerUnavailable, true);
  s.act(b, 'student:scan', { code: sealPayload(PERMANENT_SEALS.genuine) });
  assert.equal(s.view(s.host.hostToken).winner, null);
  assert.equal(s.view(s.host.hostToken).winnerUnavailable, true);
});
