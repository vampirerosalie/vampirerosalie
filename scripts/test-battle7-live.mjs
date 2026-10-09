import assert from 'node:assert/strict';

const base = process.env.GRAMMARTEST_URL || 'https://grammartest.grammarclassroom.workers.dev';
const api = `${base}/api/kitchen`;
const requestId = () => crypto.randomUUID();

async function request(path, { body, token } = {}) {
  const response = await fetch(`${api}/${path}`, {
    method: body === undefined ? 'GET' : 'POST',
    headers: {
      ...(body === undefined ? {} : { 'content-type': 'application/json', origin: base }),
      ...(token ? { authorization: `Bearer ${token}` } : {}),
    },
    ...(body === undefined ? {} : { body: JSON.stringify(body) }),
    signal: AbortSignal.timeout(15_000),
  });
  const contentType = response.headers.get('content-type') || '';
  const data = contentType.includes('json') ? await response.json() : await response.text();
  if (!response.ok) throw new Error(`${response.status} ${typeof data === 'string' ? data : data.error || JSON.stringify(data)}`);
  return { response, data };
}

const health = await request('health');
assert.equal(health.data.ok, true, 'Battle 7 health probe failed.');

const { data: host } = await request('rooms', { body: { teamCount: 2, roomName: 'Battle 7 deployment smoke' } });
assert.match(host.pin, /^\d{5}$/, 'Room PIN was not created.');
assert.match(host.hostToken, /^[a-f0-9]{64}$/, 'Host token was not created.');

const teams = [];
for (let slot = 1; slot <= 2; slot += 1) {
  const { data } = await request(`rooms/${host.pin}/join`, {
    body: { clientId: crypto.randomUUID(), teamSlot: slot, name: `Smoke Team ${slot}` },
  });
  teams.push(data);
}

const hostState = (await request(`rooms/${host.pin}/state`, { token: host.hostToken })).data;
assert.equal(hostState.teams.length, 2, 'Both smoke teams were not present.');
assert.equal(hostState.joinUrl, `${base}/?battle=7&join=${host.pin}`);
assert.equal(hostState.projectorUrl, `${base}/?battle=7&screen=${host.pin}`);

const qr = await request(`rooms/${host.pin}/qr.svg`);
assert.match(qr.response.headers.get('content-type') || '', /^image\/svg\+xml/);
assert.match(qr.data, /^<svg/);

const act = (token, type, extra = {}) => request(`rooms/${host.pin}/action`, {
  token,
  body: { type, requestId: requestId(), ...extra },
});

await act(host.hostToken, 'host:start');
const pupilState = (await request(`rooms/${host.pin}/state`, { token: teams[0].teamToken })).data;
assert.equal(pupilState.phase, 'question');
assert.equal(pupilState.answerKey, undefined, 'Private answer key leaked to a pupil.');
assert.equal(pupilState.question.canonicalAnswer, undefined, 'Canonical answer leaked to a pupil.');
const questionId = pupilState.question.id;
const countdown = await act(host.hostToken, 'host:start-countdown', { questionId, expectedPhase: 'question' });
assert.ok(countdown.data.result.answerCountdownEndsAt > Date.now(), 'Teacher countdown did not start.');
const connectedCountdown = (await request(`rooms/${host.pin}/state`, { token: teams[1].teamToken })).data;
assert.equal(connectedCountdown.answerCountdownEndsAt, countdown.data.result.answerCountdownEndsAt, 'Student did not receive the shared countdown.');
await act(teams[0].teamToken, 'pupil:submit', { questionId, answer: 'Deployment smoke answer' });
await new Promise((resolve) => setTimeout(resolve, Math.max(0, countdown.data.result.answerCountdownEndsAt - Date.now() + 250)));
await assert.rejects(act(teams[1].teamToken, 'pupil:submit', { questionId, answer: 'Late deployment answer' }), /409 Time is up/);

const reviewState = (await request(`rooms/${host.pin}/state`, { token: host.hostToken })).data;
const acceptedReview = { type: 'host:review', requestId: requestId(), teamId: reviewState.teams[0].id, questionId, decision: 'accepted' };
await request(`rooms/${host.pin}/action`, { token: host.hostToken, body: acceptedReview });
await request(`rooms/${host.pin}/action`, { token: host.hostToken, body: acceptedReview });
await act(host.hostToken, 'host:review', { teamId: reviewState.teams[0].id, questionId, decision: 'accepted' });
await act(host.hostToken, 'host:review', { teamId: reviewState.teams[1].id, questionId, decision: 'rejected' });
const reviewedTeam = (await request(`rooms/${host.pin}/state`, { token: teams[0].teamToken })).data;
const rejectedTeam = (await request(`rooms/${host.pin}/state`, { token: teams[1].teamToken })).data;
assert.equal(Object.values(reviewedTeam.me.inventory).reduce((total, quantity) => total + quantity, 0), 2, 'Accepted answer did not award exactly two ingredients once.');
assert.equal(Object.values(rejectedTeam.me.inventory).reduce((total, quantity) => total + quantity, 0), 0, 'Rejected answer awarded ingredients.');
assert.equal(rejectedTeam.me.submission.unanswered, true, 'Missing answer was not recorded as teacher-reviewed wrong.');

await act(host.hostToken, 'host:reveal', { questionId, expectedPhase: 'question' });
const revealed = (await request(`rooms/${host.pin}/state`, { token: host.hostToken })).data;
assert.equal(revealed.phase, 'reveal');
assert.ok(revealed.answerReveal?.canonicalAnswer, 'Teacher reveal did not include the answer.');
await act(host.hostToken, 'host:advance', { questionId, expectedPhase: 'reveal' });
const nextQuestion = (await request(`rooms/${host.pin}/state`, { token: teams[0].teamToken })).data;
assert.equal(nextQuestion.phase, 'question', 'Next question should open without a cooking timer.');
assert.equal(nextQuestion.cookingAvailable, true, 'Cooking must remain available during questions.');
assert.equal(nextQuestion.rushEndsAt, null, 'No forced cooking timer should remain.');
assert.equal(Object.values(nextQuestion.me.inventory).reduce((total, quantity) => total + quantity, 0), 2, 'Accepted pair was not preserved after advancing.');

const secondQuestionId = nextQuestion.question.id;
await act(teams[0].teamToken, 'pupil:submit', { questionId: secondQuestionId, answer: 'Second deployment smoke answer' });
await act(host.hostToken, 'host:review', { teamId: reviewState.teams[0].id, questionId: secondQuestionId, decision: 'accepted' });
const readyToCook = (await request(`rooms/${host.pin}/state`, { token: teams[0].teamToken })).data;
assert.equal(Object.values(readyToCook.me.inventory).reduce((total, quantity) => total + quantity, 0), 4, 'Second accepted answer did not add another pair.');
const ingredients = Object.entries(readyToCook.me.inventory).flatMap(([ingredient, quantity]) => Array(quantity).fill(ingredient)).slice(0, 3);
assert.equal(ingredients.length, 3, 'Accepted rewards did not provide enough ingredients for a three-ingredient cook.');
await act(teams[0].teamToken, 'pupil:cook', { questionId: secondQuestionId, expectedPhase: 'question', ingredients });
const afterCook = (await request(`rooms/${host.pin}/state`, { token: teams[0].teamToken })).data;
assert.equal(Object.values(afterCook.me.inventory).reduce((total, quantity) => total + quantity, 0), 1, 'Cooking did not consume exactly three ingredients.');

await act(host.hostToken, 'host:close');

console.log(JSON.stringify({
  ok: true,
  endpoint: api,
  room: host.pin,
  checks: ['health', 'room creation', 'two team joins', 'QR', 'privacy', 'shared 10-second countdown', 'typing before zero', 'lock at zero', 'missing-answer rejection', 'two-unit accepted reward', 'zero rejected reward', 'retry idempotency', 'reveal', 'three-ingredient anytime cooking', 'room close'],
}, null, 2));
