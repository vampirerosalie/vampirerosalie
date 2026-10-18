import test from 'node:test';
import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import { LanternGame } from '../../app/battle10/core/game.js';
import { DIALOGUE, PASSAGE, QUESTIONS } from '../../app/battle10/data.js';

function setup(n = 2) {
  let now = 1_000_000;
  const game = new LanternGame({ now: () => now, random: () => 0 }), host = game.create();
  const students = Array.from({ length: n }, (_, index) => game.join(host.pin, { clientId: randomUUID(), name: `Student ${index + 1}` }));
  const act = (token, type, extra = {}, requestId = randomUUID()) => game.action(host.pin, token, { type, requestId, ...extra });
  const view = token => game.state(host.pin, token);
  return { game, host, students, act, view, room: () => game.room(host.pin), tick: ms => { now += ms; } };
}
function dialogue(s, token) { while (['dialogue', 'hunt-dialogue', 'ending'].includes(s.view(token).me.stage)) s.act(token, 'student:dialogue-next'); }
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
  progress(s, a, 10, ' THE MOON CUPBOARD. ');
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
test('accepted answer variants, strict vocabulary, word limit, retry and hint', () => {
  const s = setup(1), t = s.students[0].playerToken; s.act(s.host.hostToken, 'host:start'); dialogue(s, t);
  assert.equal(s.act(t, 'student:submit', { questionNumber: 1, answer: 'a boat' }).result.correct, false);
  assert.equal(s.act(t, 'student:submit', { questionNumber: 1, answer: 'not fishing boats' }).result.correct, false);
  assert.match(s.view(t).me.hint, /waiting outside/i);
  assert.throws(() => s.act(t, 'student:submit', { questionNumber: 1, answer: 'one two three four five six' }), /five words/);
  assert.equal(s.act(t, 'student:submit', { questionNumber: 1, answer: '  BOATS!! ' }).result.correct, true);
  assert.equal(s.view(t).me.stage, 'success');
  assert.throws(() => s.act(t, 'student:submit', { questionNumber: 1, answer: 'boats' }), /no longer open/);
  s.act(t, 'student:discover'); s.act(t, 'student:collect');
  for (let q = 2; q <= 7; q++) progress(s, t, q);
  dialogue(s, t); assert.equal(s.view(t).me.q, 8);
  assert.equal(s.act(t, 'student:submit', { questionNumber: 8, answer: 'hesitant' }).result.correct, false);
  assert.throws(() => s.act(t, 'student:submit', { questionNumber: 8, answer: 'very reluctant' }), /one word/);
  assert.equal(s.act(t, 'student:submit', { questionNumber: 8, answer: 'RELUCTANT.' }).result.correct, true);
  s.act(t, 'student:discover'); s.act(t, 'student:collect');
  assert.equal(s.view(t).me.q, 9); assert.equal(s.view(t).me.stage, 'question');
  assert.equal(s.act(t, 'student:submit', { questionNumber: 9, answer: 'faint.' }).result.correct, true);
});
test('every approved short-answer variation is accepted as a complete answer', () => {
  for (let q = 1; q <= 10; q++) for (const variant of QUESTIONS[q - 1].answers) {
    const s = setup(1), token = s.students[0].playerToken;
    const room = s.room(), player = room.players[0]; room.phase = 'active'; player.stage = 'question'; player.q = q;
    assert.equal(s.act(token, 'student:submit', { questionNumber: q, answer: `  ${variant.toUpperCase()}.  ` }).result.correct, true, `Q${q}: ${variant}`);
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
});
