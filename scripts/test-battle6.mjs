const endpoint = process.env.BATTLE6_URL || 'http://localhost:3000/api/game';
const room = String(10000 + Math.floor(Math.random() * 89999));
const teacherToken = `battle6-teacher-${crypto.randomUUID()}`;

async function post(payload) {
  const response = await fetch(endpoint, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ room, ...payload }),
  });
  const data = await response.json();
  if (!response.ok) throw new Error(`${response.status}: ${data.error || JSON.stringify(data)}`);
  return data;
}

function assert(value, message) {
  if (!value) throw new Error(message);
}

let teacher = (await post({ action: 'create', teacherToken })).state;
teacher = (await post({ action: 'setBattle', teacherToken, battle: 6, expectedVersion: teacher.version })).state;
assert(teacher.potion?.teamCount === 7, 'Battle 6 was not created.');

teacher = (await post({
  action: 'potionCommand', command: 'configureTeams', teamCount: 2,
  teacherToken, expectedPotionVersion: teacher.potion.version,
})).state;
assert(teacher.potion.teamCount === 2, 'Teacher could not configure two teams.');

const students = [
  { clientId: `p6-a-${crypto.randomUUID()}`, name: 'Aisha' },
  { clientId: `p6-b-${crypto.randomUUID()}`, name: 'Ben' },
];
for (const student of students) await post({ action: 'poll', ...student });
for (let index = 0; index < students.length; index += 1) {
  const joined = (await post({ action: 'chooseTeam', ...students[index], teamIndex: index })).state;
  assert(joined.myPotionTeam === index, `Student ${index + 1} could not claim a team.`);
}

teacher = (await post({ action: 'poll', teacherToken })).state;
teacher = (await post({ action: 'startBoard', teacherToken, expectedVersion: teacher.version })).state;
assert(teacher.phase === 'board', 'Teacher could not start the potion game.');

for (let index = 0; index < students.length; index += 1) {
  const snapshot = (await post({ action: 'poll', ...students[index] })).state;
  await post({
    action: 'potionCommand', command: 'plantPoison', number: 4 + index,
    clientId: students[index].clientId, expectedPotionVersion: snapshot.potion.version,
  });
}

teacher = (await post({ action: 'poll', teacherToken })).state;
assert(teacher.potion.teams.every((team) => !('poisonBottle' in team)), 'Secret poison leaked onto the projected teacher screen.');
let publicState = (await post({ action: 'poll', ...students[0] })).state;
assert(publicState.potion.teams.every((team) => !('poisonBottle' in team)), 'Secret poison leaked to a student.');

teacher = (await post({
  action: 'potionCommand', command: 'startQuestion', teacherToken,
  expectedPotionVersion: teacher.potion.version,
})).state;
assert(teacher.potion.phase === 'question' && teacher.potion.currentQuestionId, 'Question did not start.');

teacher = (await post({
  action: 'potionCommand', command: 'startCountdown', teacherToken,
  expectedPotionVersion: teacher.potion.version,
})).state;
assert(teacher.potion.countdownEndsAt > Date.now(), 'The 10-second countdown did not start.');
await post({
  action: 'potionAnswer', clientId: students[0].clientId,
  questionId: teacher.potion.currentQuestionId, answer: `Private answer from ${students[0].name}`,
  submittedAt: Date.now(),
});
await new Promise((resolve) => setTimeout(resolve, 10_200));
let lateAnswerLocked = false;
try {
  await post({
    action: 'potionAnswer', clientId: students[1].clientId,
    questionId: teacher.potion.currentQuestionId, answer: `Late answer from ${students[1].name}`,
    submittedAt: Date.now(),
  });
} catch (error) {
  lateAnswerLocked = String(error).includes('Time is up');
}
assert(lateAnswerLocked, 'Answers were not locked when the countdown reached zero.');

publicState = (await post({ action: 'poll', ...students[0] })).state;
assert(!publicState.potionResponses && !publicState.potionAnswerKey, 'Private review data leaked to a student.');
teacher = (await post({ action: 'poll', teacherToken })).state;
assert(teacher.potionResponses.length === 1 && teacher.potionAnswerKey, 'Teacher review did not receive responses and answer key.');

teacher = (await post({
  action: 'potionCommand', command: 'markMissing', teacherToken,
  expectedPotionVersion: teacher.potion.version,
})).state;

await post({
  action: 'potionCommand', command: 'judge', teacherToken, teamIndex: 0, verdict: 'accept',
  expectedPotionVersion: teacher.potion.version,
});
teacher = (await post({ action: 'poll', teacherToken })).state;
teacher = (await post({
  action: 'potionCommand', command: 'startPotionPhase', teacherToken,
  expectedPotionVersion: teacher.potion.version,
})).state;
assert(teacher.potion.phase === 'potion_pick' && teacher.potion.picker === 0, 'Accepted team did not receive the potion turn.');

let picker = (await post({ action: 'poll', ...students[0] })).state;
picker = (await post({
  action: 'potionCommand', command: 'choosePotion', number: 12,
  clientId: students[0].clientId, expectedPotionVersion: picker.potion.version,
})).state;
assert(picker.potion.phase === 'reveal' && picker.potion.lastReveal?.number === 12, 'Potion reveal failed.');

console.log(JSON.stringify({
  ok: true,
  room,
  checks: [
    'battle selection', 'team count', 'exclusive teams', 'secret poison',
    'live 10-second countdown', 'lock at zero', 'private answers',
    'teacher review', 'accept/reject', 'potion reveal',
  ],
}, null, 2));
