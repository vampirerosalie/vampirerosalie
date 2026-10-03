const endpoint = process.env.BATTLE6_URL || 'http://localhost:3000/api/game';
const room = String(10000 + Math.floor(Math.random() * 89999));
const teacherToken = `battle6-restock-${crypto.randomUUID()}`;
const students = [
  { clientId: `restock-a-${crypto.randomUUID()}`, name: 'Aisha' },
  { clientId: `restock-b-${crypto.randomUUID()}`, name: 'Ben' },
];

async function post(payload, allowError = false) {
  const response = await fetch(endpoint, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ room, ...payload }),
  });
  const data = await response.json();
  if (!response.ok && !allowError) throw new Error(`${response.status}: ${data.error || JSON.stringify(data)}`);
  return { response, data };
}

function assert(value, message) {
  if (!value) throw new Error(message);
}

let teacher = (await post({ action: 'create', teacherToken })).data.state;
teacher = (await post({ action: 'setBattle', teacherToken, battle: 6, expectedVersion: teacher.version })).data.state;
teacher = (await post({ action: 'potionCommand', command: 'configureTeams', teamCount: 2, teacherToken, expectedPotionVersion: teacher.potion.version })).data.state;
for (const student of students) await post({ action: 'poll', ...student });
for (let index = 0; index < students.length; index += 1) await post({ action: 'chooseTeam', ...students[index], teamIndex: index });
teacher = (await post({ action: 'poll', teacherToken })).data.state;
teacher = (await post({ action: 'startBoard', teacherToken, expectedVersion: teacher.version })).data.state;

for (let index = 0; index < students.length; index += 1) {
  const state = (await post({ action: 'poll', ...students[index] })).data.state;
  await post({ action: 'potionCommand', command: 'plantPoison', number: 40 - index, clientId: students[index].clientId, expectedPotionVersion: state.potion.version });
}
teacher = (await post({ action: 'poll', teacherToken })).data.state;
teacher = (await post({ action: 'potionCommand', command: 'startQuestion', teacherToken, expectedPotionVersion: teacher.potion.version })).data.state;
assert(teacher.potion.treasuresRemaining === 12, 'Initial shelf was not stocked with twelve Treasures.');

let nextPotion = 1;
while (teacher.potion.phase !== 'restock' && teacher.potion.round <= 20) {
  assert(teacher.potion.phase === 'question', `Unexpected phase before restock: ${teacher.potion.phase}`);
  for (const student of students) {
    await post({ action: 'potionAnswer', clientId: student.clientId, questionId: teacher.potion.currentQuestionId, answer: 'Accepted test answer', submittedAt: Date.now() });
  }
  teacher = (await post({ action: 'poll', teacherToken })).data.state;
  for (let teamIndex = 0; teamIndex < students.length; teamIndex += 1) {
    await post({ action: 'potionCommand', command: 'judge', teacherToken, teamIndex, verdict: 'accept', expectedPotionVersion: teacher.potion.version });
  }
  teacher = (await post({ action: 'poll', teacherToken })).data.state;
  teacher = (await post({ action: 'potionCommand', command: 'startPotionPhase', teacherToken, expectedPotionVersion: teacher.potion.version })).data.state;

  for (let teamIndex = 0; teamIndex < students.length; teamIndex += 1) {
    while (teacher.potion.opened.includes(nextPotion) || teacher.potion.picks.includes(nextPotion) || nextPotion >= 39) nextPotion += 1;
    let studentState = (await post({ action: 'poll', ...students[teamIndex] })).data.state;
    const attempt = await post({ action: 'potionCommand', command: 'choosePotion', number: nextPotion, clientId: students[teamIndex].clientId, expectedPotionVersion: studentState.potion.version }, true);
    if (!attempt.response.ok || attempt.data.conflict) {
      studentState = (await post({ action: 'poll', ...students[teamIndex] })).data.state;
      const retry = await post({ action: 'potionCommand', command: 'choosePotion', number: nextPotion, clientId: students[teamIndex].clientId, expectedPotionVersion: studentState.potion.version });
      teacher = retry.data.state;
    } else {
      teacher = attempt.data.state;
    }
    nextPotion += 1;
  }

  teacher = (await post({ action: 'poll', teacherToken })).data.state;
  assert(teacher.potion.phase === 'reveal', 'A round did not reach the grouped reveal.');
  teacher = (await post({ action: 'potionCommand', command: 'continueReveal', teacherToken, expectedPotionVersion: teacher.potion.version })).data.state;
}

assert(teacher.potion.phase === 'restock', 'Neither restock condition triggered.');
assert(teacher.potion.treasuresRemaining === 0 || teacher.potion.opened.length >= 30, 'Restock triggered without exhausting Treasure or reaching ten potions.');
const trigger = teacher.potion.treasuresRemaining === 0 ? 'all twelve Treasures discovered' : 'ten or fewer potions remained';
const treasureScores = teacher.potion.teams.map((team) => team.treasure);
teacher = (await post({ action: 'potionCommand', command: 'restock', teacherToken, expectedPotionVersion: teacher.potion.version })).data.state;
assert(teacher.potion.phase === 'poison_setup' && teacher.potion.opened.length === 0, 'Restock did not return all forty bottles.');
assert(teacher.potion.treasuresRemaining === 0 && teacher.potion.teams.every((team, index) => team.treasure === treasureScores[index]), 'Restock did not preserve scores or reset the hidden shelf.');

console.log(JSON.stringify({ ok: true, room, trigger, roundsPlayed: teacher.potion.round, treasureScores }, null, 2));
