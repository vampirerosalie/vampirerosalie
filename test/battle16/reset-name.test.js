import test from 'node:test';
import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import { SasteraGame } from '../../app/battle16/game.js';
import { createRoomPersistence } from '../../app/rooms/persistence.js';
import { TestD1 } from '../battle7/d1-helper.js';

test('a fresh-team reset clears the roster and lets the same phones enter new names', async () => {
  const { RoomStore } = createRoomPersistence('sastera', SasteraGame);
  const store = new RoomStore(new TestD1());
  const { pin, hostToken } = await store.create();
  const host = () => store.state(pin, hostToken);
  const first = await host();
  const phone = randomUUID();
  const previous = await store.join(pin, { clientId: phone, name: 'Delima' });
  const other = await store.join(pin, { clientId: randomUUID(), name: 'Intan' });
  const reset = { type: 'reset', freshTeams: true, gameId: first.gameId, requestId: randomUUID() };
  await assert.rejects(store.action(pin, previous.playerToken, reset), { code: 'FORBIDDEN' });
  await store.action(pin, hostToken, { type: 'start', setId: 'nilai', gameId: first.gameId });
  const { state: lobby } = await store.action(pin, hostToken, reset);
  assert.deepEqual(lobby.teams, []);
  assert.equal(lobby.onlineCount, 0);
  assert.deepEqual(lobby.stationLinks, first.stationLinks);
  await assert.rejects(store.state(pin, previous.playerToken), { code: 'UNAUTHORIZED' });
  await assert.rejects(store.state(pin, other.playerToken), { code: 'UNAUTHORIZED' });

  const join = () => store.join(pin, { clientId: phone, name: 'Mutiara' });
  const [current, same] = await Promise.all([join(), join()]);
  assert.deepEqual(same, current);
  assert.notEqual(current.playerId, previous.playerId);
  assert.notEqual(current.playerToken, previous.playerToken);
  await assert.rejects(store.state(pin, previous.playerToken), { code: 'UNAUTHORIZED' });
  // A delayed old join cannot rename a team after it has registered.
  assert.deepEqual(await store.join(pin, { clientId: phone, name: 'Delima' }), current);
  // A retried teacher request cannot clear teams a second time.
  assert.equal((await store.action(pin, hostToken, reset)).replayed, true);
  assert.deepEqual((await host()).teams.map(team => team.name), ['Mutiara']);
  const me = (await store.state(pin, current.playerToken)).me;
  assert.equal(me.name, 'Mutiara');
  assert.ok(me.entries.every(entry => entry.status === 'empty' && entry.text === ''));

  // The teacher can keep the same class for its next exercise.
  await store.action(pin, hostToken, { type: 'reset', gameId: lobby.gameId });
  assert.deepEqual(await join(), current);
  assert.equal((await store.state(pin, current.playerToken)).me.name, 'Mutiara');
});
