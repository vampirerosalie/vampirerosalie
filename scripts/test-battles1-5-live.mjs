import assert from 'node:assert/strict';

const base = process.env.GRAMMARTEST_URL || 'https://grammartest.grammarclassroom.workers.dev';
const endpoint = `${base}/api/game`;
const latencies = [];

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
const id = (prefix) => `${prefix}-${crypto.randomUUID()}`;

async function post(room, payload, expectedStatus = 200) {
  let lastError;
  for (let attempt = 0; attempt < 4; attempt += 1) {
    const started = performance.now();
    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ room, ...payload }),
        signal: AbortSignal.timeout(12_000),
      });
      latencies.push(Math.round(performance.now() - started));
      const data = await response.json();
      if (response.status !== expectedStatus) {
        throw new Error(`${response.status}: ${data.error || JSON.stringify(data)}`);
      }
      return data;
    } catch (error) {
      lastError = error;
      if (attempt < 3) await sleep(350 * 2 ** attempt);
    }
  }
  throw lastError;
}

async function createRoom(label) {
  for (let attempt = 0; attempt < 12; attempt += 1) {
    const room = String(10_000 + Math.floor(Math.random() * 89_999));
    const teacherToken = id(`${label}-teacher`);
    try {
      const state = (await post(room, { action: 'create', teacherToken })).state;
      return { room, teacherToken, state };
    } catch (error) {
      if (!String(error).includes('already in use')) throw error;
    }
  }
  throw new Error(`Could not allocate a room for ${label}.`);
}

async function teacherPoll(test) {
  test.state = (await post(test.room, { action: 'poll', teacherToken: test.teacherToken })).state;
  return test.state;
}

async function studentPoll(test, student) {
  const state = (await post(test.room, { action: 'poll', clientId: student.clientId, name: student.name })).state;
  student.state = state;
  return state;
}

async function setGame(test, phase, qIndex, endsAt = 0) {
  const expected = test.state;
  const result = await post(test.room, {
    action: 'setGame', teacherToken: test.teacherToken, phase, qIndex, endsAt,
    expectedVersion: expected.version,
    expectedPhase: expected.phase,
    expectedQuestion: expected.qIndex,
  });
  assert.equal(result.conflict, undefined, `Battle ${test.battle} state transition conflicted.`);
  test.state = result.state;
  return test.state;
}

const quizAnswers = {
  1: ['washes', 'were doing'],
  2: ['was walking', 'had never given'],
};

async function testQuizBattle(battle) {
  const test = { ...(await createRoom(`b${battle}`)), battle };
  if (battle !== 1) {
    test.state = (await post(test.room, {
      action: 'setBattle', teacherToken: test.teacherToken, battle,
      expectedVersion: test.state.version,
    })).state;
  }
  test.students = [
    { clientId: id(`b${battle}-a`), name: `Battle ${battle} A` },
    { clientId: id(`b${battle}-b`), name: `Battle ${battle} B` },
  ];
  await Promise.all(test.students.map((student) => studentPoll(test, student)));

  for (let qIndex = 0; qIndex < 2; qIndex += 1) {
    if (qIndex === 0) await setGame(test, 'question', 0, Date.now() + 30_000);
    else {
      await setGame(test, 'leaderboard', qIndex - 1);
      await setGame(test, 'get-ready', qIndex, Date.now() + 4_000);
      await setGame(test, 'question', qIndex, Date.now() + 30_000);
    }
    await Promise.all(test.students.map((student, index) => post(test.room, {
      action: 'answer', clientId: student.clientId, name: student.name,
      msgId: id(`b${battle}-q${qIndex}-${index}`), qIndex,
      answer: index === 0 ? quizAnswers[battle][qIndex] : `practice answer ${qIndex}`,
      submittedAt: Date.now(),
    })));
    await setGame(test, 'reveal', qIndex);
    const snapshots = await Promise.all(test.students.map((student) => studentPoll(test, student)));
    assert.equal(snapshots[0].myResult.correct, true, `Battle ${battle} rejected its correct answer.`);
    assert.equal(snapshots[1].myResult.correct, false, `Battle ${battle} accepted a deliberately wrong answer.`);
  }
  test.saved = test.students.map((student) => ({ score: student.state.myScore }));
  return test;
}

async function boardCommand(test, command, extra = {}, actor = 'teacher') {
  const current = actor === 'teacher' ? await teacherPoll(test) : await studentPoll(test, test.students[actor]);
  const payload = {
    action: 'boardCommand', command,
    expectedBoardVersion: current.board.version,
    ...extra,
  };
  if (actor === 'teacher') payload.teacherToken = test.teacherToken;
  else payload.clientId = test.students[actor].clientId;
  const result = await post(test.room, payload);
  if (result.state) test.state = result.state;
  return result;
}

async function testBoardBattle(battle) {
  const test = { ...(await createRoom(`b${battle}`)), battle };
  test.state = (await post(test.room, {
    action: 'setBattle', teacherToken: test.teacherToken, battle,
    expectedVersion: test.state.version,
  })).state;
  await boardCommand(test, 'configureTeams', { teamCount: 2 });
  test.students = [
    { clientId: id(`b${battle}-purple`), name: `Battle ${battle} Purple` },
    { clientId: id(`b${battle}-pink`), name: `Battle ${battle} Pink` },
  ];
  for (let index = 0; index < 2; index += 1) {
    await studentPoll(test, test.students[index]);
    const joined = (await post(test.room, {
      action: 'chooseTeam', clientId: test.students[index].clientId,
      name: test.students[index].name, teamIndex: index,
    })).state;
    assert.equal(joined.myTeam, index, `Battle ${battle} team ${index} could not be claimed.`);
  }
  await teacherPoll(test);
  test.state = (await post(test.room, {
    action: 'startBoard', teacherToken: test.teacherToken,
    expectedVersion: test.state.version,
  })).state;
  assert.equal(test.state.phase, 'board');

  await boardCommand(test, 'roll', {}, 0);
  await boardCommand(test, 'startChallenge');
  const qid = test.state.board.currentQuestionId;
  assert.ok(qid, `Battle ${battle} did not start a challenge.`);
  await Promise.all(test.students.map((student, index) => post(test.room, {
    action: 'boardAnswer', clientId: student.clientId, questionId: qid,
    answer: `Short practice response from team ${index + 1}`,
    submittedAt: Date.now(),
  })));
  if (battle === 4) await boardCommand(test, 'showAnswer');
  await boardCommand(test, 'judge', { teamIndex: 0, verdict: 'accept' });
  await boardCommand(test, 'judge', { teamIndex: 1, verdict: 'reject' });
  await boardCommand(test, 'resolve');
  const snapshots = await Promise.all(test.students.map((student) => studentPoll(test, student)));
  assert.deepEqual(snapshots.map((state) => state.myTeam), [0, 1]);
  assert.equal(test.state.board.phase, 'round_result');
  test.saved = test.students.map((student, index) => ({ team: index, score: student.state.myScore }));
  return test;
}

async function testBattle5Assets() {
  const paths = [
    '/grammar-room/battle5.html', '/grammar-room/index.html', '/grammar-room/game.js',
    '/grammar-room/core.js', '/grammar-room/questions.js', '/grammar-room/room.png',
    '/grammar-room/walking-sheet.png', '/grammar-room/style.css',
  ];
  for (const path of paths) {
    const response = await fetch(`${base}${path}`, { signal: AbortSignal.timeout(12_000) });
    assert.equal(response.status, 200, `Battle 5 asset failed: ${path}`);
    await response.arrayBuffer();
  }
  return paths;
}

const tests = await Promise.all([
  testQuizBattle(1),
  testQuizBattle(2),
  testBoardBattle(3),
  testBoardBattle(4),
]);
const battle5Assets = await testBattle5Assets();

// Six steady heartbeat cycles verify ordinary classroom polling while all clients are active.
for (let cycle = 0; cycle < 6; cycle += 1) {
  await Promise.all(tests.flatMap((test) => test.students.map((student) => studentPoll(test, student))));
  await sleep(2_000);
}

// Simulate a phone going dark for longer than the 45-second online indicator window.
// Student A and the teacher stay active; Student B sends nothing for 48 seconds.
for (let cycle = 0; cycle < 6; cycle += 1) {
  await Promise.all(tests.flatMap((test) => [teacherPoll(test), studentPoll(test, test.students[0])]));
  await sleep(8_000);
}

for (const test of tests) {
  const beforeReconnect = await teacherPoll(test);
  assert.equal(beforeReconnect.onlineCount, 1, `Battle ${test.battle} did not mark the silent phone offline after 45 seconds.`);
  const restored = await studentPoll(test, test.students[1]);
  if (test.battle <= 2) {
    assert.equal(restored.myScore, test.saved[1].score, `Battle ${test.battle} lost the returning student's score.`);
    assert.ok(restored.myResult, `Battle ${test.battle} lost the returning student's answer result.`);
  } else {
    assert.equal(restored.myTeam, test.saved[1].team, `Battle ${test.battle} lost the returning student's team.`);
    assert.equal(restored.board.phase, 'round_result', `Battle ${test.battle} lost its round state.`);
  }
  const afterReconnect = await teacherPoll(test);
  assert.equal(afterReconnect.onlineCount, 2, `Battle ${test.battle} did not restore the returning student online.`);
}

// Battle 5 is deliberately standalone: once loaded, it has no live room connection to drop.
// Re-fetch its entry page after the same dark-screen interval to verify availability.
const battle5Reconnect = await fetch(`${base}/grammar-room/index.html?resume=${Date.now()}`, { signal: AbortSignal.timeout(12_000) });
assert.equal(battle5Reconnect.status, 200);

latencies.sort((a, b) => a - b);
const percentile = (p) => latencies[Math.min(latencies.length - 1, Math.floor(latencies.length * p))];
console.log(JSON.stringify({
  ok: true,
  endpoint,
  battles: {
    1: '2 questions, 2 students, score/result restored after 48s silence',
    2: '2 questions, 2 students, score/result restored after 48s silence',
    3: '1 board challenge, 2 teams, team/round restored after 48s silence',
    4: '1 BM challenge with reveal + judging, 2 teams, team/round restored after 48s silence',
    5: `${battle5Assets.length} live assets loaded before and after the interval; standalone game has no room connection to drop`,
  },
  requests: latencies.length,
  latencyMs: { median: percentile(0.5), p95: percentile(0.95), max: latencies.at(-1) },
}, null, 2));
