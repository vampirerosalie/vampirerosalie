import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import test from 'node:test';
import { MenitiGame } from '../../app/battle15/game.js';
import { QUESTIONS } from '../../app/battle15/questions.js';

function fixture(size = 3) {
  let time = 1_000_000;
  let seed = 19;
  const random = limit => {
    seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0;
    return Math.floor(seed / 4294967296 * limit);
  };
  const options = { now: () => time, random };
  let game = new MenitiGame(options);
  const { pin, hostToken } = game.create();
  const clients = Array.from({ length: size }, (_, i) => ({ name: 'Pasukan ' + i, clientId: randomUUID() }));
  const teams = clients.map(client => game.join(pin, client));
  const room = () => game.room(pin);
  const view = key => game.state(pin, key);
  const call = (key, type, extra = {}) => game.action(pin, key, {
    type, requestId: randomUUID(), questionId: room().questionId, gameId: room().gameId, ...extra,
  });
  const host = (type, extra) => call(hostToken, 'host:' + type, extra);
  const student = (i, type, extra) => call(teams[i].playerToken, 'student:' + type, extra);
  const me = i => view(teams[i].playerToken).me;
  const play = (i, optionId, wager = 1) => {
    const seat = room().rounds[room().questionId].seats[teams[i].playerId];
    const card = seat.hand.find(c => c.optionId === optionId);
    return student(i, 'submit', { cardId: card.id, wager });
  };
  const restartWorker = () => {
    const previous = game;
    const saved = JSON.stringify(room());
    game = new MenitiGame({ ...options, secret: previous.secret });
    game.rooms.set(pin, JSON.parse(saved));
  };
  const finish = () => { host('close'); host('reveal'); };
  const toShop = () => {
    host('start');
    for (let n = 1; n <= 5; n++) {
      host('deal');
      for (let i = 0; i < size; i++) play(i, QUESTIONS[n - 1].correctId);
      finish();
      if (n < 5) host('next');
    }
    host('openShop');
  };
  return { pin, teams, clients, room, view, host, hostToken, student, me, play, call, finish, toShop,
    tick: ms => { time += ms; }, restartWorker, join: client => game.join(pin, client),
    review: (id, key = hostToken) => game.review(pin, key, id) };
}
const rejects = (fn, code) => assert.throws(fn, err => err.code === code);

test('32 supplied answer keys, every fifth distractor, and student and projector privacy', () => {
  const normalKey = 'BCADACBDACBDACBDACBDACBDACBDACBD';
  const extras = [
    'Kerusi kayu','Tawaran mengikuti Kursus Lukisan Seni Bina','Dia terlibat dalam latihan bola sepak.',
    'Mencari pekerjaan tetap di kilang perabot','Mendapatkan pekerjaan tetap untuk Zahar','Razali dan Maarof',
    'Membersihkan bahagian pengeluaran kilang perabot','Mendeklamasikan sajak karya orang lain',
    'Membuka bengkel sebelum mengikuti latihan praktikal','Suhaili menerima tawaran melanjutkan pengajian di luar negara.',
    'Suhaili mahu mengucapkan tahniah atas kejayaan Zahar.','Meminta bantuan Cikgu Baharum',
    'Membantu mengatur strategi tanpa bermain','Pemain lawan melalui gol sendiri','Kerusi','Kerusi',
    'Keputusan kedua-duanya ditangguhkan.','Kerusi','Sebuah kilang perabot di Petaling Jaya','Pak Usin',
    'Dia pernah menghalang Zahar daripada menyertai pasukan bola sepak.',
    'Dia mahu berhenti daripada bidang pertukangan perabot.',
    'Meminta Razali menceritakan perkara itu kepada Miss Ooi','Ramli','Dia tidak lulus peperiksaan.',
    'Dia mahu bekerja di Petaling Jaya.','Meminta Suhaili membantunya membuka bengkel','Pak Kamil',
    'RM20,000','Ramli, Maarof dan pasukan bola sepak IKM',
    'Zahar menghentikan pengeluaran untuk mengikuti kursus lain.','Mengunjungi Zahar di kilang perabot di Kamunting',
  ];
  const s = fixture();
  assert.equal(QUESTIONS.length, 32);
  s.host('start');
  for (const [i, q] of QUESTIONS.entries()) {
    assert.equal(q.id, i + 1);
    assert.equal(q.options.length, 5);
    assert.equal(q.correctId, q.options['ABCD'.indexOf(normalKey[i])].id);
    assert.equal(q.options[4].caption, extras[i]);
    assert.equal(new Set(q.options.map(o => o.id)).size, 5);
    assert.equal(s.me(0).hand.length, 0);
    s.host('deal');
    const projected = s.view();
    assert.equal(projected.me, undefined);
    for (const opt of q.options) {
      assert.ok(!projected.preload.includes(opt.art));
      assert.ok(!JSON.stringify(projected).includes(JSON.stringify(opt.caption)));
    }
    for (const key of ['title','options','reference','explanation','nilai','correctId']) {
      assert.equal(Object.hasOwn(projected.question, key), false);
    }
    const hand = s.me(0).hand;
    assert.equal(hand.length, 4);
    assert.deepEqual(hand.map(c => c.caption).sort(), q.options.slice(0,4).map(o => o.caption).sort());
    assert.equal(new Set(hand.map(c => c.id)).size, 4);
    assert.equal(s.view(s.teams[0].playerToken).reveal, null);
    for (const c of hand) {
      assert.match(c.id, /^[a-f0-9]{32}$/);
      assert.deepEqual(Object.keys(c).sort(), ['art','caption','id']);
    }
    if (i === 0) {
      const other = s.me(1).hand;
      assert.notDeepEqual(hand.map(c => c.caption), other.map(c => c.caption));
      assert.deepEqual(s.view(s.teams[0].playerToken).preload, s.view(s.teams[1].playerToken).preload);
      rejects(() => s.student(1, 'submit', { cardId: hand[0].id, wager: 1 }), 'INVALID_PLAY');
    }
    s.play(0, q.correctId, 1 + i % 3);
    s.play(1, q.options.find(o => o.id !== q.correctId).id);
    s.host('close');
    assert.equal(s.me(0).result, null);
    assert.equal(s.view().reveal, null);
    s.host('reveal');
    const report = s.review(i + 1);
    assert.deepEqual([report.correct, report.incorrect, report.unanswered], [1,1,1]);
    assert.equal(report.reference, q.reference);
    assert.equal(s.view().reveal.explanation, q.explanation);
    assert.equal(s.me(0).result.delta, 1 + i % 3);
    if ([4,5,7,30].includes(i + 1)) assert.ok(report.nilai?.event);
    if (s.view().shopDue) { s.host('openShop'); s.host('closeShop'); }
    s.host('next');
  }
  const final = s.view();
  assert.equal(final.phase, 'ended');
  const winner = final.results[0];
  assert.equal(winner.correct, 32);
  assert.equal(winner.earned, 63);
  assert.equal(winner.balance, 73);
  assert.equal(winner.accuracy, 100);
  assert.equal(final.results[1].rank, final.results[2].rank);
  assert.equal(s.view(s.hostToken).history.length, 32);
  s.review(1);
  assert.deepEqual(s.view().results, final.results);
});

test('Extra Card is pooled before the shuffle and can occupy every position across repeated deals', () => {
  const s = fixture(2);
  s.toShop();
  const targetId = s.teams[1].playerId;
  s.student(0, 'buy', { card: 'extra', targetId });
  s.host('closeShop'); s.host('next');
  const seat = s.room().rounds[6].seats[targetId];
  const seen = new Set(), correctSlots = new Set();
  // Reconstruct the same pre-deal state while advancing the seeded RNG.
  for (let i = 0; i < 100; i++) {
    s.room().phase = 'question';
    s.host('deal');
    assert.equal(s.me(0).hand.length, 4);
    const hand = s.me(1).hand;
    assert.equal(hand.length, 5);
    seen.add(hand.findIndex(c => c.caption === QUESTIONS[5].options[4].caption));
    correctSlots.add(seat.hand.findIndex(c => c.optionId === QUESTIONS[5].correctId));
    for (const c of hand) assert.deepEqual(Object.keys(c).sort(), ['art','caption','id']);
  }
  assert.deepEqual([...seen].sort(), [0,1,2,3,4]);
  assert.deepEqual([...correctSlots].sort(), [0,1,2,3,4]);
  const saved = s.me(1).hand;
  s.restartWorker();
  assert.deepEqual(s.join(s.clients[1]), s.teams[1]);
  assert.deepEqual(s.me(1).hand, saved);
  s.play(1, QUESTIONS[5].options[4].id, 2);
  s.finish();
  assert.equal(s.me(1).result.delta, -2);
});

test('Flash waits for decoded art then provides one synchronized three-second preview; reload never restarts it', () => {
  const s = fixture(2);
  s.toShop();
  s.student(0, 'buy', { card:'flash', targetId:s.teams[1].playerId });
  s.host('closeShop'); s.host('next'); s.host('deal');
  assert.deepEqual(s.me(1).hand, []);
  s.tick(120000);
  s.student(1, 'ready');
  const preview = s.me(1);
  assert.equal(preview.hand.length, 4);
  assert.equal(preview.previewEnd - preview.previewStart, 3000);
  s.tick(3599);
  const play = { cardId:preview.hand[2].id, wager:2 };
  rejects(() => s.student(1, 'submit', play), 'PREVIEW_ACTIVE');
  s.tick(1);
  s.restartWorker();
  s.student(1, 'ready');
  assert.equal(s.me(1).previewEnd, preview.previewEnd);
  assert.deepEqual(s.me(1).hand, preview.hand.map(({id}) => ({id})));
  s.student(1, 'submit', play);
  assert.equal(s.me(1).submitted, true);
  assert.deepEqual(s.me(1).hand, []);
});

test('no speed advantage, countdown boundary, duplicate plays and single settlement with read-only review', () => {
  const s = fixture(4);
  s.host('start'); s.host('deal');
  const answer = QUESTIONS[0].correctId;
  s.tick(3000);
  s.play(0, answer, 3);
  s.tick(17000);
  s.play(1, answer, 3);
  rejects(() => s.play(0, answer, 1), 'ALREADY_SUBMITTED');
  s.host('countdown', {seconds:10});
  s.tick(9999);
  s.play(2, QUESTIONS[0].options[0].id, 3);
  s.tick(1);
  rejects(() => s.play(3, answer, 2), 'WRONG_PHASE');
  rejects(() => s.host('close'), 'WRONG_PHASE');
  const report = s.review('1');
  assert.deepEqual(report.entries.map(e => e.delta), [3,3,-3,-1]);
  assert.deepEqual(s.view().players.map(p => p.balance), [10,10,10,10]);
  for (let i = 0; i < 3; i++) s.view();
  rejects(() => s.review(1, s.teams[0].playerToken), 'FORBIDDEN');
  s.host('reveal');
  assert.deepEqual(s.view().players.map(p => [p.balance,p.rank]), [[13,1],[13,1],[9,3],[7,4]]);
});

test('one purchase and one attack lock; shield survives across rounds and consumes a blocked attack', () => {
  const s = fixture(4);
  s.toShop();
  const [a,b,c,d] = s.teams.map(t => t.playerId);
  s.student(0, 'buy', {card:'shield'});
  s.student(1, 'buy', {card:'extra',targetId:a});
  rejects(() => s.student(2, 'buy', {card:'raise',targetId:a}), 'TARGET_TAKEN');
  assert.equal(s.me(2).balance, 15);
  rejects(() => s.student(2, 'buy', {card:'raise',targetId:c}), 'INVALID_TARGET');
  s.student(2, 'buy', {card:'raise',targetId:b});
  s.student(3, 'buy', {card:'shield'});
  rejects(() => s.student(2, 'buy', {card:'extra',targetId:d}), 'ALREADY_PURCHASED');
  s.host('closeShop'); s.host('next');
  assert.equal(s.me(0).shield, false);
  assert.equal(s.me(0).effect, null);
  assert.equal(s.me(0).attack.blocked, true);
  assert.equal(s.me(1).balance, 13);
  assert.equal(s.me(1).effect, 'raise');
  assert.equal(s.me(3).shield, true);
  s.host('deal');
  assert.equal(s.me(0).hand.length, 4);
  assert.deepEqual(s.me(1).wagers.map(w=>w.actual), [2,3,4]);
  s.play(1, QUESTIONS[5].correctId, 3);
  s.finish();
  assert.equal(s.me(1).result.delta, 4);
  assert.equal(s.review(6).entries[1].baseWager, 3);
  s.host('next');
  assert.equal(s.me(1).effect, null);
  assert.equal(s.me(3).shield, true);
});

test('Raise the Bet caps base wagers, refunds an unaffordable target, charges both increased losses and unanswered stakes', () => {
  const s = fixture(6);
  s.toShop();
  const id = i => s.teams[i].playerId;
  s.room().players[1].balance = 3;
  s.room().players[2].balance = 2;
  rejects(() => s.student(2, 'buy', {card:'shield'}), 'INSUFFICIENT_CHIPS');
  s.student(0, 'buy', {card:'raise',targetId:id(1)});
  s.student(1, 'buy', {card:'shield'});
  rejects(() => s.student(3, 'buy', {card:'raise',targetId:id(1)}), 'TARGET_TAKEN');
  s.student(3, 'buy', {card:'raise',targetId:id(2)});
  s.student(4, 'buy', {card:'raise',targetId:id(5)});
  s.host('closeShop'); s.host('next'); s.host('deal');
  assert.equal(s.me(0).balance, 15);
  assert.equal(s.room().players[0].spent, 0);
  assert.equal(s.me(1).shield, true);
  assert.equal(s.me(1).attack.refunded, true);
  assert.deepEqual(s.me(2).wagers, [{base:1,actual:2}]);
  rejects(() => s.play(2, QUESTIONS[5].correctId, 2), 'INVALID_PLAY');
  s.play(5, QUESTIONS[5].options[0].id, 3);
  s.finish();
  assert.equal(s.me(5).result.delta, -4);
  assert.equal(s.me(2).result.delta, -2);
  assert.equal(s.me(2).balance, 0);
  s.host('next');
  for (let i = 0; i < 3; i++) assert.equal(s.me(2).balance, 1);
  s.host('deal');
  assert.deepEqual(s.me(2).wagers, [{base:1, actual:1}]);
});

test('reset retains identities, clears all gameplay, rejects stale requests and replays the reset receipt', () => {
  const s = fixture(2);
  s.toShop();
  s.student(0, 'buy', {card:'flash',targetId:s.teams[1].playerId});
  s.host('closeShop'); s.host('next'); s.host('deal'); s.host('countdown');
  const stale = { gameId:s.room().gameId, questionId:6 };
  const requestId = randomUUID();
  s.host('reset', {confirm:true,requestId,...stale});
  assert.equal(s.host('reset', {confirm:true,requestId,...stale}).replayed, true);
  assert.equal(s.view().phase, 'lobby');
  assert.equal(s.view().deadline, null);
  assert.equal(s.me(1).effect, null);
  assert.equal(s.me(0).shield, false);
  assert.equal(s.me(0).purchase, null);
  assert.deepEqual(s.me(1).hand, []);
  assert.deepEqual(s.view(s.hostToken).history, []);
  assert.deepEqual(s.join(s.clients[1]), s.teams[1]);
  rejects(() => s.host('close', stale), 'STALE_ROUND');
  rejects(() => s.call(s.teams[0].playerToken, 'host:start'), 'FORBIDDEN');
  s.host('start'); s.host('deal');
  assert.equal(s.me(1).balance,10);
  assert.equal(s.me(1).hand.length,4);
});

test('a full room rejects new clients and reconnects every existing identity', () => {
  const s = fixture(12);
  rejects(() => s.join({name:'Lagi',clientId:randomUUID()}), 'ROOM_FULL');
  s.host('start');
  for (const [i, client] of s.clients.entries()) assert.deepEqual(s.join(client), s.teams[i]);
  s.host('deal');
  for (let i = 0; i < 12; i++) s.play(i, QUESTIONS[0].correctId);
  assert.equal(s.view().submittedCount, 12);
  s.finish();
  assert.equal(s.view().players.every(row => row.rank === 1), true);
});
