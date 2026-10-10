import assert from 'node:assert/strict';

const base = process.env.GRAMMARTEST_URL || 'https://grammartest.grammarclassroom.workers.dev';
const api = `${base}/api/kitchen/rooms`;

async function request(path = '', { body, token, expected = 200 } = {}) {
  const response = await fetch(`${api}${path}`, {
    method: body === undefined ? 'GET' : 'POST',
    headers: {
      ...(body === undefined ? {} : { 'content-type': 'application/json', origin: base }),
      ...(token ? { authorization: `Bearer ${token}` } : {}),
    },
    ...(body === undefined ? {} : { body: JSON.stringify(body) }),
    signal: AbortSignal.timeout(15_000),
  });
  const data = await response.json();
  assert.equal(response.status, expected, data.error || JSON.stringify(data));
  return data;
}

const created = await request('', { body: { teamCount: 2, roomName: 'Set 2 deployment smoke' }, expected: 201 });
const path = `/${created.pin}`;
const hostAction = (type, extra = {}, expected = 200) => request(`${path}/action`, {
  token: created.hostToken,
  body: { type, requestId: crypto.randomUUID(), ...extra },
  expected,
});
let teams = [];

try {
  assert.equal((await request(`${path}/state`, { token: created.hostToken })).questionSetId, 'set1');
  await hostAction('host:select-set', { questionSetId: 'set2', expectedPhase: 'lobby' });
  assert.equal((await request(`${path}/state`, { token: created.hostToken })).questionSetId, 'set2');

  teams = await Promise.all([1, 2].map(teamSlot => request(`${path}/join`, {
    body: { teamSlot, name: `Set 2 smoke ${teamSlot}`, clientId: crypto.randomUUID() },
  })));
  await hostAction('host:start', { expectedPhase: 'lobby' });

  const [host, red, blue] = await Promise.all([
    request(`${path}/state`, { token: created.hostToken }),
    request(`${path}/state`, { token: teams[0].teamToken }),
    request(`${path}/state`, { token: teams[1].teamToken }),
  ]);
  assert.equal(host.phase, 'question');
  assert.equal(host.questionSetId, 'set2');
  assert.match(host.question.id, /^S2-\d{2}$/);
  assert.equal(red.question.id, host.question.id);
  assert.equal(blue.question.id, host.question.id);
  assert.equal(red.role, 'team');
  assert.equal(blue.role, 'team');
  assert.equal(red.answerKey, undefined);
  assert.equal(red.question.canonicalAnswer, undefined);
  assert.ok(host.answerKey?.canonicalAnswer);
  assert.equal(host.totalQuestions, 20);
  assert.equal(red.me.recipes.length, 0);
  assert.equal(red.me.stars, 0);

  const refused = await hostAction('host:select-set', {
    questionSetId: 'set1', questionId: host.question.id, expectedPhase: 'question',
  }, 409);
  assert.equal(refused.code, 'WRONG_PHASE');
  assert.equal((await request(`${path}/state`, { token: created.hostToken })).questionSetId, 'set2');

  await request(`${path}/action`, {
    token: teams[0].teamToken,
    body: { type: 'pupil:submit', requestId: crypto.randomUUID(), questionId: host.question.id, answer: 'Student response' },
  });
  const reviewed = await hostAction('host:review', {
    teamId: teams[0].teamId, questionId: host.question.id, decision: 'accepted',
  });
  assert.equal(reviewed.result.rewards.length, 2);
  const after = await request(`${path}/state`, { token: teams[0].teamToken });
  assert.equal(Object.values(after.me.inventory).reduce((sum, count) => sum + count, 0), 2);
  assert.equal(after.me.recipes.length, 0);
} finally {
  await hostAction('host:close');
  if (teams.length) {
    const finalStudent = await request(`${path}/state`, { token: teams[0].teamToken });
    assert.equal(finalStudent.role, 'team');
    assert.equal(finalStudent.phase, 'closed');
  }
}
console.log(JSON.stringify({ ok: true, endpoint: api, room: created.pin, checks: [
  'Set 2 lobby selection', 'two independent joins', 'shared Set 2 question',
  'teacher-only answer key', 'midgame switch rejected', 'two-unit reward',
  'student-only ended session',
] }, null, 2));
