import { POTION_QUESTIONS } from '../app/battle6-data.ts';

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
const correctSlots = Object.entries(teacher.potion.optionOrders).map(([questionId, order]) => {
  const question = POTION_QUESTIONS.find((item) => item.id === questionId);
  assert(question?.type === 'MCQ', `Option order was created for non-MCQ question ${questionId}.`);
  const sourceIndex = question.options.findIndex((option) => option === question.answer);
  const presentedIndex = order.indexOf(sourceIndex);
  assert(presentedIndex >= 0, `Correct answer disappeared from ${questionId}.`);
  return presentedIndex;
});
assert(correctSlots.length > 0 && new Set(correctSlots).size >= Math.min(4, correctSlots.length), 'MCQ correct answers were not distributed across answer letters.');

teacher = (await post({
  action: 'potionCommand', command: 'configureTeams', teamCount: 10,
  teacherToken, expectedPotionVersion: teacher.potion.version,
})).state;
assert(teacher.potion.teamCount === 10 && teacher.potion.teams.length === 10, 'Teacher could not configure ten teams.');
assert(new Set(teacher.potion.teams.map((team) => team.name)).size === 10, 'Ten distinct potion teams were not created.');
const capacityStudents = Array.from({ length: 10 }, (_, index) => ({
  clientId: `p6-capacity-${index}-${crypto.randomUUID()}`,
  name: `Capacity ${index + 1}`,
}));
for (let index = 0; index < capacityStudents.length; index += 1) {
  await post({ action: 'poll', ...capacityStudents[index] });
  const joined = (await post({ action: 'chooseTeam', ...capacityStudents[index], teamIndex: index })).state;
  assert(joined.myPotionTeam === index, `Capacity player ${index + 1} could not claim team ${index + 1}.`);
}
teacher = (await post({ action: 'poll', teacherToken })).state;
assert(teacher.potionTeamStatuses.filter((status) => status.occupied).length === 10, 'All ten potion team places were not available.');

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
for (const student of students) {
  await post({
    action: 'potionAnswer', clientId: student.clientId,
    questionId: teacher.potion.currentQuestionId, answer: `Private answer from ${student.name}`,
    submittedAt: Date.now(),
  });
}

publicState = (await post({ action: 'poll', ...students[0] })).state;
assert(!publicState.potionResponses && !publicState.potionAnswerKey, 'Private review data leaked to a student.');
teacher = (await post({ action: 'poll', teacherToken })).state;
assert(teacher.potionResponses.length === 2 && teacher.potionAnswerKey, 'Teacher review did not receive responses and answer key.');

for (let teamIndex = 0; teamIndex < students.length; teamIndex += 1) {
  await post({
    action: 'potionCommand', command: 'judge', teacherToken, teamIndex, verdict: 'accept',
    expectedPotionVersion: teacher.potion.version,
  });
}
teacher = (await post({ action: 'poll', teacherToken })).state;
teacher = (await post({
  action: 'potionCommand', command: 'startPotionPhase', teacherToken,
  expectedPotionVersion: teacher.potion.version,
})).state;
assert(teacher.potion.phase === 'potion_pick' && teacher.potion.pickEndsAt > Date.now(), 'Simultaneous potion phase did not start.');
assert(teacher.potion.eligible.length === 2 && teacher.potion.picks.every((pick) => pick === null), 'Both accepted teams were not enabled together.');
assert(teacher.potion.treasuresRemaining === 12, 'The shelf does not contain exactly 12 hidden Treasures.');
assert(!('treasureBottles' in teacher.potion) && !('treasureStocked' in teacher.potion), 'Hidden Treasure locations leaked to the teacher.');

let firstPicker = (await post({ action: 'poll', ...students[0] })).state;
firstPicker = (await post({
  action: 'potionCommand', command: 'choosePotion', number: 12,
  clientId: students[0].clientId, expectedPotionVersion: firstPicker.potion.version,
})).state;
assert(firstPicker.potion.phase === 'potion_pick' && firstPicker.potion.picks[0] === 12, 'First simultaneous selection was not locked.');

let collisionRejected = false;
let secondPicker = (await post({ action: 'poll', ...students[1] })).state;
try {
  await post({
    action: 'potionCommand', command: 'choosePotion', number: 12,
    clientId: students[1].clientId, expectedPotionVersion: secondPicker.potion.version,
  });
} catch (error) {
  collisionRejected = String(error).includes('just claimed');
}
assert(collisionRejected, 'Two teams were allowed to claim the same potion.');

secondPicker = (await post({ action: 'poll', ...students[1] })).state;
const revealState = (await post({
  action: 'potionCommand', command: 'choosePotion', number: 13,
  clientId: students[1].clientId, expectedPotionVersion: secondPicker.potion.version,
})).state;
assert(revealState.potion.phase === 'reveal', 'Results were not revealed after every eligible team chose.');
assert(revealState.potion.roundReveals.length === 2, 'The simultaneous reveal did not include both teams.');
assert(new Set(revealState.potion.roundReveals.map((reveal) => reveal.number)).size === 2, 'The reveal contains duplicate potion claims.');

teacher = (await post({ action: 'poll', teacherToken })).state;
teacher = (await post({
  action: 'potionCommand', command: 'continueReveal', teacherToken,
  expectedPotionVersion: teacher.potion.version,
})).state;
assert(teacher.potion.phase === 'question', 'The game did not continue to the next question after the simultaneous reveal.');

for (const student of students) {
  await post({
    action: 'potionAnswer', clientId: student.clientId,
    questionId: teacher.potion.currentQuestionId, answer: `Round two answer from ${student.name}`,
    submittedAt: Date.now(),
  });
}
teacher = (await post({ action: 'poll', teacherToken })).state;
for (let teamIndex = 0; teamIndex < students.length; teamIndex += 1) {
  await post({
    action: 'potionCommand', command: 'judge', teacherToken, teamIndex, verdict: 'accept',
    expectedPotionVersion: teacher.potion.version,
  });
}
teacher = (await post({ action: 'poll', teacherToken })).state;
teacher = (await post({
  action: 'potionCommand', command: 'startPotionPhase', teacherToken,
  expectedPotionVersion: teacher.potion.version,
})).state;
let timeoutPicker = (await post({ action: 'poll', ...students[0] })).state;
timeoutPicker = (await post({
  action: 'potionCommand', command: 'choosePotion', number: 14,
  clientId: students[0].clientId, expectedPotionVersion: timeoutPicker.potion.version,
})).state;
assert(timeoutPicker.potion.phase === 'potion_pick', 'Potion phase ended before the second team had time to choose.');
await new Promise((resolve) => setTimeout(resolve, 10_200));
teacher = (await post({ action: 'poll', teacherToken })).state;
assert(teacher.potion.phase === 'reveal' && teacher.potion.roundReveals.length === 2, 'Missing team was not auto-assigned after ten seconds.');
assert(new Set(teacher.potion.roundReveals.map((reveal) => reveal.number)).size === 2, 'Timeout auto-assignment reused a claimed potion.');

const reconnected = (await post({ action: 'poll', ...students[0] })).state;
assert(reconnected.myPotionTeam === 0 && reconnected.potion.opened.includes(12) && reconnected.potion.opened.includes(14), 'A reconnect did not restore the team and locked potion state.');

console.log(JSON.stringify({
  ok: true,
  room,
  checks: [
    'battle selection', 'randomized MCQ answer positions', '10-team capacity', 'exclusive teams', 'secret poison',
    'live 10-second answer countdown', 'private answers', 'teacher review',
    'accept/reject', '12 hidden Treasures', 'simultaneous potion choices',
    'first-confirmed unique claim', 'group reveal', '10-second auto-assignment',
    'reconnect restoration',
  ],
}, null, 2));
