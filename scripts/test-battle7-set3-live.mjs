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

const created = await request('', { body: { teamCount: 2, roomName: 'Set 3 deployment smoke' }, expected: 201 });
const path = `/${created.pin}`;
const hostAction = (type, extra = {}) => request(`${path}/action`, {
  token: created.hostToken,
  body: { type, requestId: crypto.randomUUID(), ...extra },
});
const studentAction = (token, type, extra = {}) => request(`${path}/action`, {
  token,
  body: { type, requestId: crypto.randomUUID(), ...extra },
});
let joined;

try {
  await hostAction('host:select-set', { questionSetId: 'set3', expectedPhase: 'lobby' });
  const lobby = await request(`${path}/state`, { token: created.hostToken });
  assert.equal(lobby.questionSetId, 'set3');
  assert.equal(lobby.totalQuestions, 25);
  joined = await request(`${path}/join`, {
    body: { teamSlot: 1, name: 'Set 3 smoke student', clientId: crypto.randomUUID() },
  });
  await hostAction('host:start', { expectedPhase: 'lobby' });

  const ids = [];
  for (let i = 0; i < 20; i++) {
    const host = await request(`${path}/state`, { token: created.hostToken });
    assert.equal(host.questionNumber, i + 1);
    assert.equal(host.question.format, 'multiple_choice');
    assert.match(host.question.id, /^S3-\d{2}$/);
    ids.push(host.question.id);
    if (i === 0) {
      const student = await request(`${path}/state`, { token: joined.teamToken });
      assert.equal(student.role, 'team');
      assert.equal(student.question.id, host.question.id);
      assert.equal(student.question.canonicalAnswer, undefined);
      assert.equal(student.answerKey, undefined);
    }
    await hostAction('host:reveal', { questionId: host.question.id, expectedPhase: 'question' });
    await hostAction('host:advance', { questionId: host.question.id, expectedPhase: 'reveal' });
  }
  assert.equal(new Set(ids).size, 20);

  for (const [index, word] of ['journey', 'ticket', 'travel', 'plane', 'luggage'].entries()) {
    const host = await request(`${path}/state`, { token: created.hostToken });
    const student = await request(`${path}/state`, { token: joined.teamToken });
    assert.equal(host.questionNumber, index + 21);
    assert.equal(host.question.id, `S3-${index + 21}`);
    assert.equal(student.question.format, 'letter_spell');
    assert.equal(student.question.initialLetter, word[0].toUpperCase());
    assert.equal(student.question.answerLength, word.length);
    assert.equal(student.question.canonicalAnswer, undefined);
    assert.equal(student.answerKey, undefined);
    await studentAction(joined.teamToken, 'pupil:submit', { questionId: host.question.id, answer: word.toUpperCase() });
    const reviewed = await request(`${path}/state`, { token: created.hostToken });
    assert.equal(reviewed.submissions.find(item => item.teamId === joined.teamId).status, 'accepted');
    await hostAction('host:reveal', { questionId: host.question.id, expectedPhase: 'question' });
    const rewarded = await request(`${path}/state`, { token: joined.teamToken });
    assert.equal(rewarded.me.submission.status, 'accepted');
    await hostAction('host:advance', { questionId: host.question.id, expectedPhase: 'reveal' });
  }
  const final = await request(`${path}/state`, { token: joined.teamToken });
  assert.equal(final.role, 'team');
  assert.equal(final.phase, 'finished');
  assert.equal(final.totalQuestions, 25);
  console.log(JSON.stringify({ ok: true, room: created.pin, set: 'set3', mcqCount: ids.length, spellingCount: 5, finalPhase: final.phase }, null, 2));
} finally {
  await hostAction('host:close');
}
