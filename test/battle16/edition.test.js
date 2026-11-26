import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import test from 'node:test';
import { SasteraGame } from '../../app/battle16/game.js';
import { MODEL_ANSWERS } from '../../app/battle16/models.js';
import { CONTENT_EDITION, EXERCISES } from '../../public/battle16/content.js';

const factoryIds = ['factory-offer', 'factory-conversation'];
const currentIds = EXERCISES.pengajaran.stations[0].choices.map(choice => choice.id);

function existingRoom() {
  const game = new SasteraGame();
  const { pin, hostToken } = game.create('pengajaran');
  const room = game.room(pin);
  const action = (key, type, fields) => game.action(pin, key, { type, gameId: room.gameId, ...fields }).state;
  action(hostToken, 'start', { setId: 'pengajaran' });
  room.contentEdition = 2;
  const { playerToken, playerId } = game.join(pin, { clientId: randomUUID(), name: 'Pasukan' });
  return {
    scan: (station, edition) => action(playerToken, 'scan', { station, edition, code: game.stationCode(room, station) }).me,
    send: (station, revision, sceneId, edition) => action(playerToken, 'submit', {
      station, revision, sceneId, edition, text: 'Jawapan pasukan ' + revision,
    }),
    mark: (station, revision, status) => action(hostToken, 'mark', {
      teamId: playerId, station, revision, status, feedback: status === 'revise' ? 'Jelaskan peristiwa.' : '',
    }),
    teacher: () => game.state(pin, hostToken),
    student: () => game.state(pin, playerToken).me,
  };
}

test('a refreshed team in an existing room can submit the replacement exercise with the same shuffled side', () => {
  const room = existingRoom();
  const oldScan = room.scan(1);
  assert.deepEqual(oldScan.choiceOrder, oldScan.reverseChoices ? [...factoryIds].reverse() : factoryIds);
  const refreshedScan = room.scan(1, CONTENT_EDITION);
  assert.equal(refreshedScan.reverseChoices, oldScan.reverseChoices);
  assert.deepEqual(refreshedScan.choiceOrder, oldScan.reverseChoices ? [...currentIds].reverse() : currentIds);
  assert.deepEqual(room.student().choiceOrder, refreshedScan.choiceOrder);
  assert.throws(() => room.send(1, 0, factoryIds[0], CONTENT_EDITION), { code: 'BAD_SCENE' });
  assert.equal(room.send(1, 0, currentIds[0], CONTENT_EDITION).me.entries[0].edition, CONTENT_EDITION);
});

test('a cached factory-station submission retains its prompt and pictures through feedback, with the comic models at the final QR', () => {
  const room = existingRoom();
  const oldScan = room.scan(1);
  room.send(1, 0, factoryIds[0], 2);
  const entry = room.teacher().teams[0].entries[0];
  assert.match(entry.legacyTask.prompt, /apabila latihan industri tamat/);
  assert.deepEqual(entry.legacyTask.choices.map(choice => choice.id), factoryIds);
  assert.deepEqual(room.teacher().models, MODEL_ANSWERS.pengajaran);
  room.mark(1, 1, 'revise');
  room.scan(4, CONTENT_EDITION);
  const revision = room.scan(1, CONTENT_EDITION);
  assert.equal(revision.models, null);
  assert.equal(revision.entries[0].feedback, 'Jelaskan peristiwa.');
  assert.deepEqual(revision.choiceOrder, oldScan.choiceOrder);
  assert.throws(() => room.send(1, 1, currentIds[0], CONTENT_EDITION), { code: 'STALE_TASK' });
  room.send(1, 1, factoryIds[1], 2);
  room.mark(1, 2, 'correct');
  for (const station of [2, 3]) {
    room.scan(station, CONTENT_EDITION);
    room.send(station, 0, EXERCISES.pengajaran.stations[station - 1].choices[0].id, CONTENT_EDITION);
    room.mark(station, 1, 'correct');
  }
  assert.deepEqual(room.scan(4, CONTENT_EDITION).models, MODEL_ANSWERS.pengajaran);
});
