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

const { data: host } = await request('rooms', { body: { teamCount: 2, rushSeconds: 15, roomName: 'Battle 7 deployment smoke' } });
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

for (const team of teams) {
  await act(team.teamToken, 'pupil:submit', { questionId, answer: 'Deployment smoke answer' });
}

const reviewState = (await request(`rooms/${host.pin}/state`, { token: host.hostToken })).data;
for (const team of reviewState.teams) {
  await act(host.hostToken, 'host:review', { teamId: team.id, questionId, decision: 'accepted' });
}

await act(host.hostToken, 'host:reveal', { questionId, expectedPhase: 'question' });
const revealed = (await request(`rooms/${host.pin}/state`, { token: host.hostToken })).data;
assert.equal(revealed.phase, 'reveal');
assert.ok(revealed.answerReveal?.canonicalAnswer, 'Teacher reveal did not include the answer.');
await act(host.hostToken, 'host:advance', { questionId, expectedPhase: 'reveal' });
const rush = (await request(`rooms/${host.pin}/state`, { token: teams[0].teamToken })).data;
assert.equal(rush.phase, 'rush', 'Cooking phase did not open.');
assert.equal(Object.values(rush.me.inventory).reduce((total, quantity) => total + quantity, 0), 1, 'Accepted answer did not award one ingredient.');

await act(host.hostToken, 'host:close');

console.log(JSON.stringify({
  ok: true,
  endpoint: api,
  room: host.pin,
  checks: ['health', 'room creation', 'two team joins', 'QR', 'privacy', 'submissions', 'teacher review', 'reveal', 'cooking phase', 'room close'],
}, null, 2));
