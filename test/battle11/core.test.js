import test from 'node:test';
import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import { MuseumGame, STATION_PAYLOADS, VISIT_MS } from '../../app/battle11/core/game.js';
import { ANSWER_KEY, OPTIONS, STATIONS } from '../../app/battle11/data.js';

function setup(n = 3) {
  let now = 1_000_000;
  let nextPin = 0;
  const game = new MuseumGame({ now: () => now, random: () => nextPin++ }), host = game.create();
  const clients = Array.from({ length: n }, (_, i) => ({ clientId: randomUUID(), name: `Group ${i + 1}` }));
  const groups = clients.map(client => game.join(host.pin, client));
  const act = (token, type, extra = {}, requestId = randomUUID()) => game.action(host.pin, token, { type, requestId, ...extra });
  const view = token => game.state(host.pin, token);
  const scan = (token, station) => act(token, 'student:scan', { code: STATION_PAYLOADS[station - 1] });
  const save = (token, station, letter, extra = {}) => act(token, extra.leave ? 'student:save-leave' : 'student:save', {
    station, letter, visitId: view(token).me.activeVisit.id, expectedVersion: view(token).me.answerVersion,
    confirmMove: extra.confirmMove === true,
  });
  return { game, host, clients, groups, act, view, scan, save, room: () => game.room(host.pin), tick: ms => { now += ms; }, now: () => now };
}
function fillSix(s, token, letters = ANSWER_KEY) {
  for (let station = 1; station <= 6; station++) {
    s.scan(token, station); s.save(token, station, letters[station - 1], { leave: true });
  }
}

test('six exact paragraphs, one gap each, stable eight options and private key', () => {
  assert.deepEqual(ANSWER_KEY, ['E', 'B', 'H', 'A', 'F', 'C']);
  assert.deepEqual(Object.keys(OPTIONS), ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H']);
  assert.deepEqual(STATIONS.map(s => s.number), [1, 2, 3, 4, 5, 6]);
  assert.deepEqual(STATION_PAYLOADS, ['MMJ1|S|1|N7QK2M8R', 'MMJ1|S|2|V4P9T6HX', 'MMJ1|S|3|J8W3C5LD',
    'MMJ1|S|4|R2Y7F9NB', 'MMJ1|S|5|K6D4Q8SZ', 'MMJ1|S|6|T5H9M3VP']);
  assert.ok(STATIONS.every(s => s.before && s.after && s.explanation));
  const s = setup(1), t = s.groups[0].playerToken;
  assert.equal(s.view(t).paragraph, undefined); assert.equal(s.view().options, undefined);
  assert.equal(s.view(t).solutions, undefined); assert.equal(s.view(s.host.hostToken).solutions, undefined);
});

test('group may begin at any station; only scanning admits and exposes that paragraph', () => {
  const s = setup(1), t = s.groups[0].playerToken;
  s.act(s.host.hostToken, 'host:start');
  assert.equal(s.view(t).paragraph, undefined);
  assert.throws(() => s.act(t, 'student:scan', { code: 'https://unrelated.test/' }), /not a Museum Jewel/);
  assert.equal(s.scan(t, 6).result.admitted, true);
  const v = s.view(t); assert.equal(v.paragraph.number, 6); assert.equal(v.paragraph.before, STATIONS[5].before);
  assert.equal(v.paragraph.after, STATIONS[5].after); assert.equal(v.me.activeVisit.expiresAt - v.me.activeVisit.startedAt, VISIT_MS);
  assert.equal(v.paragraph.answer, undefined); assert.equal(v.solutions, undefined);
});

test('two places per station, full rejection leaves no access or route history', () => {
  const s = setup(), [a, b, c] = s.groups.map(g => g.playerToken); s.act(s.host.hostToken, 'host:start');
  s.scan(a, 1); s.tick(2000); s.scan(b, 1);
  assert.throws(() => s.scan(c, 1), /station is full/);
  assert.equal(s.view(c).paragraph, undefined); assert.equal(s.view(c).me.activeVisit, null);
  assert.equal(s.room().players[2].lastDepartedStation, null);
  assert.equal(s.view(s.host.hostToken).stations[0].count, 2);
  assert.equal(s.view(a).me.activeVisit.expiresAt, 1_000_000 + VISIT_MS);
  assert.equal(s.view(b).me.activeVisit.expiresAt, 1_002_000 + VISIT_MS);
  assert.throws(() => s.scan(a, 2), /Leave Station 1/);
  assert.equal(s.scan(a, 1).result.restored, true);
  assert.equal(s.view(a).me.activeVisit.expiresAt, 1_000_000 + VISIT_MS);
});

test('expiry releases only its own slot, retains saved answer, rejects late writes and does not renew', () => {
  const s = setup(), [a, b, c] = s.groups.map(g => g.playerToken); s.act(s.host.hostToken, 'host:start');
  s.scan(a, 1); s.save(a, 1, 'E'); const oldVisit = s.view(a).me.activeVisit;
  s.tick(1000); s.scan(b, 1); s.tick(VISIT_MS - 1000);
  assert.equal(s.view(a).me.activeVisit, null); assert.equal(s.view(a).me.choices[0], 'E');
  assert.equal(s.view(a).paragraph, undefined); assert.equal(s.view(b).me.activeVisit.station, 1);
  assert.equal(s.view(s.host.hostToken).stations[0].count, 1);
  assert.throws(() => s.act(a, 'student:save', { station: 1, visitId: oldVisit.id, letter: 'D', expectedVersion: 1 }), /no longer active/);
  s.scan(c, 1); assert.equal(s.view(s.host.hostToken).stations[0].count, 2);
  assert.throws(() => s.scan(a, 1), /different station/);
});

test('exploration route requires a genuine different admitted visit, while review removes that restriction', () => {
  const s = setup(3), [a, b, c] = s.groups.map(g => g.playerToken); s.act(s.host.hostToken, 'host:start');
  s.scan(a, 1); s.save(a, 1, 'E', { leave: true });
  assert.throws(() => s.scan(a, 1), /different station/);
  s.scan(b, 2); s.scan(c, 2); assert.throws(() => s.scan(a, 2), /station is full/);
  assert.throws(() => s.scan(a, 1), /different station/);
  s.scan(a, 3); s.save(a, 3, 'H', { leave: true }); s.scan(a, 1);
  assert.equal(s.view(a).me.choices[0], 'E'); s.save(a, 1, 'E', { leave: true });
  for (const [station, letter] of [[2, 'B'], [4, 'A'], [5, 'F'], [6, 'C']]) {
    if (station === 2) { s.tick(VISIT_MS); s.view(a); }
    s.scan(a, station); s.save(a, station, letter, { leave: true });
  }
  assert.equal(s.view(a).me.reviewUnlocked, true); s.scan(a, 6); s.save(a, 6, 'C', { leave: true }); s.scan(a, 6);
  assert.equal(s.view(a).me.activeVisit.station, 6);
});

test('provisional choices are ungraded, letter moves require confirmation and are atomic', () => {
  const s = setup(1), t = s.groups[0].playerToken; s.act(s.host.hostToken, 'host:start');
  s.scan(t, 1); const receipt = randomUUID();
  const first = s.act(t, 'student:save', { visitId: s.view(t).me.activeVisit.id, station: 1, letter: 'D', expectedVersion: 0 }, receipt);
  assert.equal(first.result.saved, true); assert.equal(first.result.correct, undefined);
  assert.equal(s.act(t, 'student:save', { visitId: s.view(t).me.activeVisit.id, station: 1, letter: 'D', expectedVersion: 0 }, receipt).replayed, true);
  assert.equal(s.view(t).me.answerVersion, 1);
  assert.throws(() => s.act(t, 'student:save', { visitId: s.view(t).me.activeVisit.id, station: 1, letter: 'E', expectedVersion: 0 }), /newer answer/);
  s.save(t, 1, 'D', { leave: true }); s.scan(t, 2);
  assert.throws(() => s.save(t, 2, 'D'), /already saved at Station 1/);
  assert.deepEqual(s.view(t).me.choices.slice(0, 2), ['D', null]);
  s.save(t, 2, 'D', { confirmMove: true });
  assert.deepEqual(s.view(t).me.choices.slice(0, 2), [null, 'D']);
  assert.equal(s.view(t).me.answeredCount, 1);
});

test('review sticks after six saved stations, but a moved letter blocks final submission until the blank is refilled', () => {
  const s = setup(1), t = s.groups[0].playerToken; s.act(s.host.hostToken, 'host:start'); fillSix(s, t);
  assert.equal(s.view(t).me.reviewUnlocked, true); assert.equal(s.view(t).me.answeredCount, 6);
  s.scan(t, 6); s.save(t, 6, 'E', { confirmMove: true, leave: true });
  assert.equal(s.view(t).me.reviewUnlocked, true); assert.equal(s.view(t).me.answeredCount, 5);
  assert.throws(() => s.act(t, 'student:submit', { expectedVersion: s.view(t).me.answerVersion }), /six different/);
  s.scan(t, 1); s.save(t, 1, 'C', { leave: true });
  assert.equal(s.view(t).me.answeredCount, 6);
});

test('final lock scores only six snapshot letters, score outranks time and exact ties share rank', () => {
  const s = setup(4), [a, b, c, d] = s.groups.map(g => g.playerToken); s.act(s.host.hostToken, 'host:start');
  fillSix(s, a, ANSWER_KEY); s.tick(1000); s.act(a, 'student:submit', { expectedVersion: s.view(a).me.answerVersion });
  fillSix(s, b, ANSWER_KEY); s.tick(1000); s.act(b, 'student:submit', { expectedVersion: s.view(b).me.answerVersion });
  fillSix(s, c, ['D', ...ANSWER_KEY.slice(1)]); s.act(c, 'student:submit', { expectedVersion: s.view(c).me.answerVersion });
  fillSix(s, d, ANSWER_KEY); s.act(d, 'student:submit', { expectedVersion: s.view(d).me.answerVersion });
  assert.equal(s.room().players[0].score, 6); assert.equal(s.room().players[2].score, 5);
  assert.equal(s.view(a).myScore, undefined); assert.equal(s.view(c).solutions, undefined);
  assert.throws(() => s.scan(a, 1), /locked/);
  assert.throws(() => s.act(a, 'student:submit', { expectedVersion: 6 }), /locked/);
  s.act(s.host.hostToken, 'host:reveal');
  assert.deepEqual(s.view(s.host.hostToken).ranking.map(p => [p.name, p.rank, p.score]), [
    ['Group 1', 1, 6], ['Group 2', 2, 6], ['Group 4', 2, 6], ['Group 3', 4, 5],
  ]);
  assert.equal(s.view(a).myScore, 6); assert.equal(s.view(a).solutions.length, 6);
});

test('one submission does not end the game; teacher close is separate and unsubmitted remain unranked', () => {
  const s = setup(2), [a, b] = s.groups.map(g => g.playerToken); s.act(s.host.hostToken, 'host:start'); fillSix(s, a);
  s.act(a, 'student:submit', { expectedVersion: s.view(a).me.answerVersion });
  assert.equal(s.view(b).phase, 'active'); assert.equal(s.view(b).solutions, undefined);
  assert.equal(s.view(s.host.hostToken).groups[1].submitted, false);
  s.act(s.host.hostToken, 'host:end'); assert.equal(s.view(b).phase, 'ended');
  assert.equal(s.view(s.host.hostToken).ranking, undefined);
  s.act(s.host.hostToken, 'host:reveal'); assert.equal(s.view(s.host.hostToken).ranking.length, 1);
  assert.equal(s.view(s.host.hostToken).groups[1].elapsedMs, null);
});

test('room start, occupancy, choices and scoring stay isolated between rooms; printed codes do not change', () => {
  const s = setup(1), firstCodes = [...STATION_PAYLOADS], other = s.game.create();
  const group = s.game.join(other.pin, { clientId: randomUUID(), name: 'Other class' });
  s.act(s.host.hostToken, 'host:start'); s.scan(s.groups[0].playerToken, 4);
  assert.deepEqual(STATION_PAYLOADS, firstCodes);
  assert.equal(s.game.state(other.pin, group.playerToken).phase, 'lobby');
  assert.equal(s.game.state(other.pin, group.playerToken).stations[3].count, 0);
  assert.equal(s.view(s.groups[0].playerToken).stations[3].count, 1);
});
