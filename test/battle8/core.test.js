import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { DemolitionGame, CARD_WEIGHTS, GameError, validateBank } from '../../app/battle8/core/game.js';

const bank = JSON.parse(readFileSync(new URL('../../app/battle8/data/question-bank.json', import.meta.url), 'utf8'));
const make = (random = () => 0) => {
  let time = 1000000, sequence = 0;
  const game = new DemolitionGame({ bank, now: () => time, random, secret:'unit-secret' });
  const { pin, hostToken } = game.create({ teamCount:40 });
  const join = (slot) => game.join(pin, { clientId:`client-identity-${String(slot).padStart(20,'0')}`, teamSlot:slot, name:`Team ${slot}` });
  const act = (token, type, args = {}, requestId = `receipt-${++sequence}-000000`) => game.action(pin, token, { type, requestId, ...args });
  return { game, pin, hostToken, join, act, advance(ms) { time += ms; }, room:() => game.room(pin) };
};
const submit = (context, team, answer = 'A', q = 1) => context.act(team.teamToken, 'pupil:submit', { questionId:q, answer });
const judge = (context, team, decision = 'accepted', q = 1, requestId) => context.act(context.hostToken, 'host:review', { teamId:team.teamId, questionId:q, decision }, requestId);
const draw = (context, team) => context.act(team.teamToken, 'pupil:draw', { drawId:context.game.state(context.pin, team.teamToken).me.nextDrawId });
const start = context => context.act(context.hostToken, 'host:start');
const close = (context, q) => context.act(context.hostToken, 'host:close-answer', { questionId:q });
const advance = (context, q) => context.act(context.hostToken, 'host:advance', { questionId:q });
function grantCard(context, team, key) {
  const card = { id:`card-${Math.random().toString(36).slice(2)}`, key, questionId:1 };
  context.room().teams.find(item => item.id === team.teamId).hand.push(card);
  return card;
}

test('canonical bank and distribution are exact', () => {
  const questions = validateBank(bank);
  assert.equal(questions.length, 25);
  assert.equal(questions.filter(q => q.type === 'reading').length, 10);
  assert.equal(questions.filter(q => q.type === 'vocabulary').length, 15);
  assert.deepEqual(questions.map(q => q.id), Array.from({ length:25 }, (_, index) => index + 1));
  assert.equal(CARD_WEIGHTS.reduce((sum, [, weight]) => sum + weight, 0), 100);
});

test('four teams independently answer; one approval creates one draw and review stays private', () => {
  const c = make(), teams = [1,2,3,4].map(c.join);
  for (const team of teams) { const view = c.game.state(c.pin, team.teamToken); assert.equal(view.me.original, 12); assert.equal(view.me.walls, 0); assert.equal(view.me.draws, 0); assert.deepEqual(view.me.hand, []); }
  start(c);
  submit(c, teams[0]); judge(c, teams[0]);
  assert.equal(c.game.state(c.pin, teams[0].teamToken).me.draws, 1);
  for (const team of teams.slice(1)) submit(c, team);
  judge(c, teams[1], 'rejected'); judge(c, teams[2], 'accepted');
  assert.equal(c.game.state(c.pin, teams[1].teamToken).me.draws, 0);
  assert.equal(c.game.state(c.pin, teams[2].teamToken).me.draws, 1);
  const publicState = c.game.state(c.pin);
  const studentState = c.game.state(c.pin, teams[3].teamToken);
  assert.ok(!JSON.stringify(publicState).includes('correct_answer'));
  assert.ok(!JSON.stringify(studentState).includes('answerKey'));
  assert.equal(publicState.reviews, undefined);
  assert.equal(studentState.reviewKeys, undefined);
  assert.equal(c.game.state(c.pin, c.hostToken).reviews.length, 4);
});

test('approval retries and repeated decisions cannot duplicate rewards', () => {
  const c = make(), team = c.join(1); start(c); submit(c, team);
  const receipt = 'same-approval-receipt-000';
  const first = judge(c, team, 'accepted', 1, receipt);
  assert.equal(judge(c, team, 'accepted', 1, receipt).replayed, true);
  judge(c, team, 'accepted');
  assert.equal(first.result.rewardIssued, true);
  assert.equal(c.game.state(c.pin, team.teamToken).me.draws, 1);
  assert.throws(() => submit(c, team), error => error instanceof GameError && error.code === 'ALREADY_SUBMITTED');
});

test('stale draw retry cannot spend a later question’s credit after receipt expiry', () => {
  const c = make(), team = c.join(1); start(c); submit(c, team); judge(c, team);
  const firstDrawId = c.game.state(c.pin, team.teamToken).me.nextDrawId;
  c.act(team.teamToken, 'pupil:draw', { drawId:firstDrawId });
  const offer = c.game.state(c.pin, team.teamToken).me.offer;
  c.act(team.teamToken, 'pupil:choose', { offerId:offer.id, slotId:offer.slots[0].id });
  close(c, 1); advance(c, 1); submit(c, team, 'B', 2); judge(c, team, 'accepted', 2);
  assert.throws(() => c.act(team.teamToken, 'pupil:draw', { drawId:firstDrawId }, 'very-late-draw-retry-000'), error => error.code === 'STALE_DRAW');
  assert.equal(c.game.state(c.pin, team.teamToken).me.draws, 1);
});

test('blind draw has three opaque independent slots and survives reconnect and question change', () => {
  const sequence = [0, 99, 0]; let position = 0;
  const c = make(n => n === 100 ? sequence[position++ % sequence.length] : 0), team = c.join(1);
  start(c); submit(c, team); judge(c, team);
  draw(c, team);
  const first = c.game.state(c.pin, team.teamToken).me.offer;
  assert.equal(first.slots.length, 3);
  assert.equal(first.slots.every(slot => Object.keys(slot).join() === 'id'), true);
  const hidden = c.room().teams[0].offer.slots.map(slot => slot.key);
  assert.deepEqual(hidden, ['hammer','cleanup','hammer']);
  assert.deepEqual(c.game.state(c.pin, team.teamToken).me.offer, first);
  close(c, 1); advance(c, 1);
  assert.deepEqual(c.game.state(c.pin, team.teamToken).me.offer, first);
  c.act(team.teamToken, 'pupil:choose', { offerId:first.id, slotId:first.slots[0].id });
  assert.equal(c.game.state(c.pin, team.teamToken).me.hand.length, 1);
  assert.throws(() => c.act(team.teamToken, 'pupil:choose', { offerId:first.id, slotId:first.slots[1].id }), /no longer open/);
});

test('immediate bad card applies once on selection; reconnect does not reroll', () => {
  const c = make(n => n === 100 ? 97 : 0), team = c.join(1);
  start(c); submit(c, team); judge(c, team); draw(c, team);
  const offer = c.game.state(c.pin, team.teamToken).me.offer;
  const receipt = 'same-choice-receipt-0000', args = { offerId:offer.id, slotId:offer.slots[0].id };
  c.act(team.teamToken, 'pupil:choose', args, receipt);
  c.act(team.teamToken, 'pupil:choose', args, receipt);
  assert.equal(c.game.state(c.pin, team.teamToken).me.walls, 1);
  assert.equal(c.game.state(c.pin, team.teamToken).me.hand.length, 0);
});

test('walls are removed before originals; zero is attackable and wall count has no small cap', () => {
  const c = make(), [owner, rival] = [c.join(1), c.join(2)]; start(c);
  for (let index = 0; index < 8; index++) {
    const card = grantCard(c, rival, 'renovation');
    c.act(rival.teamToken, 'pupil:play', { cardId:card.id, targetTeamId:owner.teamId });
  }
  assert.equal(c.game.state(c.pin, owner.teamToken).me.walls, 16);
  const drill = grantCard(c, owner, 'drill'); c.act(owner.teamToken, 'pupil:play', { cardId:drill.id });
  assert.equal(c.game.state(c.pin, owner.teamToken).me.walls, 14);
  assert.equal(c.game.state(c.pin, owner.teamToken).me.original, 12);
  for (let index = 0; index < 9; index++) { const ball = grantCard(c, owner, 'ball'); c.act(owner.teamToken, 'pupil:play', { cardId:ball.id }); }
  assert.equal(c.game.state(c.pin, owner.teamToken).me.remaining, 0);
  const hammer = grantCard(c, owner, 'hammer');
  assert.throws(() => c.act(owner.teamToken, 'pupil:play', { cardId:hammer.id }), /Save this tool/);
  assert.equal(c.game.state(c.pin, owner.teamToken).me.hand.some(item => item.id === hammer.id), true);
  const brick = grantCard(c, rival, 'brick'); c.act(rival.teamToken, 'pupil:play', { cardId:brick.id, targetTeamId:owner.teamId });
  assert.equal(c.game.state(c.pin, owner.teamToken).me.remaining, 1);
  c.act(owner.teamToken, 'pupil:play', { cardId:hammer.id });
  assert.equal(c.game.state(c.pin, owner.teamToken).me.remaining, 0);
});

test('shield blocks a whole attack once; theft transfers one card and failed target keeps card', () => {
  const c = make(), [a,b] = [c.join(1), c.join(2)]; start(c);
  const shield = grantCard(c, b, 'shield'); c.act(b.teamToken, 'pupil:play', { cardId:shield.id });
  const first = grantCard(c, a, 'renovation'); c.act(a.teamToken, 'pupil:play', { cardId:first.id, targetTeamId:b.teamId });
  assert.equal(c.game.state(c.pin, b.teamToken).me.shields, 0);
  assert.equal(c.game.state(c.pin, b.teamToken).me.walls, 0);
  const second = grantCard(c, a, 'renovation'); c.act(a.teamToken, 'pupil:play', { cardId:second.id, targetTeamId:b.teamId });
  assert.equal(c.game.state(c.pin, b.teamToken).me.walls, 2);
  const stolen = grantCard(c, b, 'hammer'), snatch = grantCard(c, a, 'snatcher');
  c.act(a.teamToken, 'pupil:play', { cardId:snatch.id, targetTeamId:b.teamId });
  assert.equal(c.game.state(c.pin, a.teamToken).me.hand.some(item => item.id === stolen.id), true);
  assert.equal(c.game.state(c.pin, b.teamToken).me.hand.length, 0);
  const retry = grantCard(c, a, 'snatcher');
  assert.throws(() => c.act(a.teamToken, 'pupil:play', { cardId:retry.id, targetTeamId:b.teamId }), /no saved card/);
  assert.equal(c.game.state(c.pin, a.teamToken).me.hand.some(item => item.id === retry.id), true);
});

test('teacher-triggered deadline blocks late answers, but not cards or earlier reviews', () => {
  const c = make(), [a,b] = [c.join(1), c.join(2)]; start(c);
  assert.equal(c.game.state(c.pin).deadlineAt, null);
  submit(c, a);
  c.act(c.hostToken, 'host:start-countdown', { questionId:1 }); c.advance(10001);
  assert.throws(() => submit(c, b), /time is up/);
  judge(c, a); draw(c, a);
  close(c, 1); advance(c, 1);
  assert.equal(c.game.state(c.pin).deadlineAt, null);
  assert.equal(c.game.state(c.pin).question.id, 2);
  const offer = c.game.state(c.pin, a.teamToken).me.offer;
  assert.equal(offer.slots.length, 3);
  assert.throws(() => c.act(c.hostToken, 'host:close-answer', { questionId:1 }), /changed/);
});

test('all 25 questions require explicit final lock, pending reviews block it, ties share rank', () => {
  const c = make(), [a,b] = [c.join(1), c.join(2)]; start(c);
  submit(c, a);
  for (let q = 1; q <= 25; q++) { close(c, q); advance(c, q); }
  assert.equal(c.game.state(c.pin).phase, 'wrap');
  assert.throws(() => c.act(c.hostToken, 'host:finish'), /Review submitted answers/);
  judge(c, a, 'accepted', 1);
  assert.equal(c.game.state(c.pin, a.teamToken).me.draws, 1);
  const brick = grantCard(c, a, 'brick'); c.act(a.teamToken, 'pupil:play', { cardId:brick.id, targetTeamId:b.teamId });
  assert.equal(c.game.state(c.pin).ranking[0].id, a.teamId);
  const secondBrick = grantCard(c, b, 'brick'); c.act(b.teamToken, 'pupil:play', { cardId:secondBrick.id, targetTeamId:a.teamId });
  assert.deepEqual(c.game.state(c.pin).ranking.map(row => row.rank), [1,1]);
  c.act(c.hostToken, 'host:finish');
  assert.equal(c.game.state(c.pin).phase, 'finished');
  assert.throws(() => c.act(a.teamToken, 'pupil:draw'), /locked/);
});

test('teacher can end a lobby and open a fresh room without advancing questions', () => {
  const c = make();
  const receipt = 'end-empty-room-receipt-000';
  const ended = c.act(c.hostToken, 'host:end-early', {}, receipt);
  assert.equal(ended.state.phase, 'finished');
  assert.equal(ended.result.endedEarly, true);
  assert.deepEqual(ended.state.ranking, []);
  assert.equal(c.act(c.hostToken, 'host:end-early', {}, receipt).replayed, true);
  const fresh = make(() => 1);
  assert.notEqual(fresh.pin, c.pin);
  assert.equal(fresh.game.state(fresh.pin, fresh.hostToken).phase, 'lobby');
});

test('teacher can end during question 1; student sees final result and all game actions lock', () => {
  const c = make(), [a,b] = [c.join(1), c.join(2)]; start(c);
  submit(c, a);
  judge(c, a, 'accepted');
  submit(c, b, 'B'); // Deliberately leave a review pending.
  c.act(c.hostToken, 'host:start-countdown', { questionId:1 });
  const first = c.act(c.hostToken, 'host:end-early', {}, 'early-end-receipt-0000');
  assert.equal(first.state.phase, 'finished');
  assert.equal(first.state.questionOpen, false);
  assert.equal(first.state.deadlineAt, null);
  assert.equal(first.state.pendingReviewCount, 1);
  assert.equal(first.state.ranking.length, 2);
  assert.equal(c.game.state(c.pin, a.teamToken).phase, 'finished');
  assert.equal(c.game.state(c.pin, b.teamToken).phase, 'finished');
  assert.equal(c.act(c.hostToken, 'host:end-early', {}, 'early-end-receipt-0000').replayed, true);
  assert.throws(() => c.act(c.hostToken, 'host:end-early'), error => error.code === 'GAME_LOCKED');
  assert.throws(() => c.act(c.hostToken, 'host:advance', { questionId:1 }), error => error.code === 'GAME_LOCKED');
  assert.throws(() => draw(c, a), error => error.code === 'GAME_LOCKED');
  assert.throws(() => submit(c, b), error => error.code === 'GAME_LOCKED');
});

test('student cannot end the game early', () => {
  const c = make(), team = c.join(1); start(c);
  assert.throws(() => c.act(team.teamToken, 'host:end-early'), error => error.code === 'FORBIDDEN');
  assert.equal(c.game.state(c.pin).phase, 'question');
});

test('team cannot act as host or for another team', () => {
  const c = make(), [a,b] = [c.join(1), c.join(2)]; start(c);
  assert.throws(() => c.act(a.teamToken, 'host:review', { teamId:b.teamId, questionId:1, decision:'accepted' }), /another role/);
  assert.throws(() => c.act('', 'host:finish'), /key is required/);
  assert.throws(() => c.act('0'.repeat(64), 'host:finish'), /invalid/);
});
