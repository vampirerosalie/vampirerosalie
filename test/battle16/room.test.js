import test from 'node:test';
import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import { createRequire } from 'node:module';
import decodeQR from 'jsqr';
import { TestD1 } from '../battle7/d1-helper.js';
import { handleSasteraRequest } from '../../app/battle16/http.js';
import { CONTENT_EDITION, EXERCISES } from '../../public/battle16/content.js';
import { MODEL_ANSWERS } from '../../app/battle16/models.js';
import { SasteraGame } from '../../app/battle16/game.js';
import previousTasks from '../../app/battle16/previous-tasks.json' with { type:'json' };

const require = createRequire(import.meta.url);
const sharp = createRequire(require.resolve('next/package.json'))('sharp');
const origin = 'https://classroom.example';

test('model paragraphs use the comic’s opening for their station and introduce the evidence', () => {
  const openings = {
    nilai: ['Nilai murni yang pertama ialah', 'Selain itu, nilai murni yang kedua ialah', 'Seterusnya, nilai murni yang ketiga ialah'],
    pengajaran: ['Pengajaran yang pertama ialah kita hendaklah', 'Selain itu, pengajaran yang kedua ialah kita hendaklah', 'Seterusnya, pengajaran yang ketiga ialah kita hendaklah'],
    persoalan: ['Persoalan yang pertama ialah', 'Selain itu, persoalan yang kedua ialah', 'Seterusnya, persoalan yang ketiga ialah'],
  };
  const table = {
    gigih: 'Zahar tetap melanjutkan pengajian di IKM walaupun Suhaili memperlekehkan pilihannya, lalu berjaya membuka bengkel sendiri.',
    bekerjasama: 'Zahar bersama pelatih baharu membersihkan kawasan belakang IKM.',
    menyayangi: 'Pak Yusuf mengambil berat tentang keluarga Zahar dengan membantu persekolahan adik-adiknya.',
    memaafkan: 'Zahar memaafkan Suhaili yang pernah memperlekehkan pilihannya belajar di IKM.',
    rajin: 'Zahar belajar bersungguh-sungguh dan membuat persediaan awal untuk menghadapi peperiksaan di IKM.',
  };
  const examples = {
    nilai: [table.gigih, table.bekerjasama, table.menyayangi],
    pengajaran: [table.gigih, table.memaafkan, table.bekerjasama],
    persoalan: [table.gigih, table.rajin, table.bekerjasama],
  };
  for (const [setId, stems] of Object.entries(openings)) {
    const models = MODEL_ANSWERS[setId];
    assert.equal(models.length, stems.length);
    stems.forEach((stem, index) => {
      const [isi, ...evidence] = models[index].split('. Sebagai contoh, ');
      assert.ok(isi.startsWith(stem + ' '));
      assert.deepEqual(evidence, [examples[setId][index]]);
    });
  }
});

test('each team keeps its own station order after a refresh or another QR scan', () => {
  const game = new SasteraGame({secret:'order-test'});
  const {pin,hostToken} = game.create('pengajaran');
  const room = game.room(pin);
  room.gameId = 'same-class';
  const station = 3;
  const code = game.stationCode(room, station);
  game.action(pin,hostToken,{type:'start',gameId:room.gameId,setId:'pengajaran'});
  const expected = EXERCISES.pengajaran.stations[2].choices.map(c=>c.id);
  const positions = new Set();
  for(let i=0;i<16;i++){
    const {playerToken} = game.join(pin,{clientId:'student-device-number-'+i,name:'Team '+i});
    room.players[i].id = 'team-'+i;
    const scan = () => game.action(pin,playerToken,{type:'scan',gameId:room.gameId,station,code}).state.me.choiceOrder;
    const order=scan();
    positions.add(order[0]);
    assert.deepEqual([...order].sort(),[...expected].sort());
    assert.deepEqual(game.state(pin,playerToken).me.choiceOrder,order);
    assert.deepEqual(scan(),order);
  }
  assert.equal(positions.size,2);
});

test('existing paragraphs retain their original prompt and pictures and use the comic model for comparison', () => {
  const game = new SasteraGame();
  const {pin,hostToken} = game.create('pengajaran');
  const room = game.room(pin);
  const {playerToken,playerId}=game.join(pin,{clientId:'existing-student-device',name:'Delima'});
  game.action(pin,hostToken,{type:'start',gameId:room.gameId,setId:'pengajaran'});
  delete room.contentEdition; // Room already playing when the revised tasks were published.
  const send=(key,type,fields)=>game.action(pin,key,{type,gameId:room.gameId,...fields}).state;
  const scan=n=>send(playerToken,'scan',{station:n,code:game.stationCode(room,n)});
  for(const station of [1,2,3]){
    scan(station);
    const legacy=station===3;
    const sceneId=legacy?'poem':EXERCISES.pengajaran.stations[station-1].choices[0].id;
    send(playerToken,'submit',{station,revision:0,sceneId,text:'Perenggan pasukan.',...(legacy?{}:{edition:CONTENT_EDITION})});
    send(hostToken,'mark',{teamId:playerId,station,revision:1,status:legacy?'revise':'correct',feedback:legacy?'Berikan bukti.':''});
  }
  delete room.players[0].entries[2].edition; // Older stored rows have no edition field.
  const graded=game.state(pin,hostToken).teams[0].entries[2];
  const old=previousTasks.sets.pengajaran[2];
  assert.equal(graded.legacyTask.prompt,old.prompt);
  assert.deepEqual(game.state(pin,hostToken).models,MODEL_ANSWERS.pengajaran);
  scan(4);
  const revision=scan(3).me;
  assert.deepEqual([...revision.choiceOrder].sort(),[...old.scenes].sort());
  assert.equal(revision.entries[2].legacyModel,undefined);
  assert.ok(!JSON.stringify(revision).includes(MODEL_ANSWERS.pengajaran[2]));
  send(playerToken,'submit',{station:3,revision:1,sceneId:old.scenes[0],edition:1,text:'Perenggan yang telah dibaiki.'});
  send(hostToken,'mark',{station:3,revision:2,teamId:playerId,status:'correct'});
  assert.deepEqual(scan(4).me.models,MODEL_ANSWERS.pengajaran);
});

async function setup() {
  const db = new TestD1();
  const ip = randomUUID();
  async function request(path, body, key) {
    const headers = { 'content-type': 'application/json', origin, 'cf-connecting-ip': ip };
    if (key) headers.authorization = 'Bearer ' + key;
    const response = await handleSasteraRequest(new Request(origin + path, {
      method: body === undefined ? 'GET' : 'POST', headers,
      body: body === undefined ? undefined : JSON.stringify(body),
    }), db, { sleep: async () => {} });
    return response;
  }
  async function json(path, body, key, status = 200) {
    const response = await request(path, body, key);
    const result = await response.json();
    assert.equal(response.status, status, JSON.stringify(result));
    return result;
  }
  const { pin, hostToken } = await json('/api/sastera/rooms', {}, undefined, 201);
  const prefix = '/api/sastera/rooms/' + pin + '/';
  const state = key => json(prefix + 'state', undefined, key);
  const join = (clientId = randomUUID(), name = 'Pasukan') => json(prefix + 'join', { clientId, name });
  const first = await state(hostToken);
  let gameId = first.gameId;
  const action = (key, type, extra = {}, status) => json(prefix + 'action', { type, gameId, ...extra }, key, status);
  const host = (...args) => action(hostToken, ...args);
  const links = first.stationLinks;
  const scans = links.map(({ href, station }) => ({ station, code: new URL(href, origin).searchParams.get('code') }));
  const scan = (key, station) => action(key, 'scan', scans[station - 1]);
  const reset = async () => { const result = await host('reset'); gameId = result.state.gameId; };
  return { request, json, prefix, pin, hostToken, state, join, action, host, links, scans, scan, reset };
}

test('four printable QR codes decode to the same station URLs in every room', async () => {
  const g = await setup();
  const other = await setup();
  assert.deepEqual(g.links, other.links);
  const { playerToken: otherTeam } = await other.join();
  await other.host('start',{setId:'nilai'});
  assert.equal((await other.action(otherTeam,'scan',g.scans[0])).state.me.activeStation,1);
  assert.equal((await g.action(otherTeam,'scan',g.scans[0],401)).code,'UNAUTHORIZED');
  assert.equal(g.links.length, 4);
  for (const link of g.links) {
    const response = await g.request(link.qrUrl);
    assert.equal(response.status, 200);
    const { data, info } = await sharp(Buffer.from(await response.text())).resize(450,450).ensureAlpha().raw().toBuffer({resolveWithObject:true});
    assert.equal(decodeQR(new Uint8ClampedArray(data),info.width,info.height)?.data, origin + link.href);
    const url = new URL(link.href, origin);
    assert.equal(url.searchParams.has('join'), false);
    assert.equal(url.searchParams.get('station'), String(link.station));
    assert.equal(url.searchParams.get('code').length, 32);
  }
  // These exact identifiers are already on physical classroom cards.
  assert.deepEqual(g.scans.map(x => x.code), [
    '68d8e7043f4fd3e73c24566f2ee26d1d',
    '8b25fd88f39ce005d0f95067bfe8b963',
    '5f5e132f010ae835cb933f4947568aa9',
    '513aa9435b3303f051a1ff854470a620',
  ]);
  const clients = await Promise.all(Array.from({length:12}, (_, i) => g.join(randomUUID(), 'Meja ' + i)));
  assert.equal(new Set(clients.map(team => team.playerId)).size, 12);
  const before = await g.state(g.hostToken);
  assert.equal(before.onlineCount,12);
  await g.host('start',{setId:'pengajaran'});
  const who = clients[0].playerToken;
  assert.equal((await g.action(who,'scan',{ ...g.scans[0], station:4 },400)).code,'BAD_STATION');
  assert.equal((await g.action(who,'scan',{ ...g.scans[0], code:'0'.repeat(32) },400)).code,'BAD_STATION');
  await g.scan(who,1);
  await g.reset();
  const after = await g.state(g.hostToken);
  assert.deepEqual(after.stationLinks, before.stationLinks);
  assert.equal(after.teamCount, 12);
  assert.equal(after.phase, 'lobby');
  assert.equal((await g.state(who)).me.activeStation,0);
  assert.equal((await g.action(who,'scan',{...g.scans[0],gameId:before.gameId},409)).code,'STALE_GAME');
  await g.host('start',{setId:'persoalan'});
  assert.equal((await g.scan(who,2)).state.setId,'persoalan');
});

test('previously printed room codes remain usable only with their original room', async () => {
  let serial = 0;
  const game = new SasteraGame({ random: () => ++serial });
  const first = game.create();
  const second = game.create();
  const oldCode = game.stationCode(game.room(first.pin), 2);
  const response = await handleSasteraRequest(new Request(origin + '/api/sastera/rooms/' + first.pin + '/stations/2/qr.svg?code=' + oldCode));
  const { data, info } = await sharp(Buffer.from(await response.text())).ensureAlpha().raw().toBuffer({resolveWithObject:true});
  const link = new URL(decodeQR(new Uint8ClampedArray(data),info.width,info.height).data);
  assert.equal(link.searchParams.get('join'),first.pin);
  assert.equal(link.searchParams.get('code'),oldCode);
  for (const {pin,hostToken} of [first, second]) {
    const gameId = game.room(pin).gameId;
    const { playerToken } = game.join(pin,{clientId:randomUUID(),name:'Meja ujian'});
    game.action(pin,hostToken,{type:'start',setId:'nilai',gameId});
    const scan = () => game.action(pin,playerToken,{type:'scan',station:2,code:oldCode,gameId});
    if (pin === first.pin) assert.equal(scan().state.me.activeStation,2);
    else assert.throws(scan, {code:'BAD_STATION'});
  }
});

for (const setId of ['nilai','pengajaran','persoalan']) {
  test(setId + ': manual marking, private feedback at QR 4, station revision, explicit final scan then model answers', async () => {
    const g = await setup();
    await g.host('start', { setId });
    const clientId = randomUUID();
    const team = await g.join(clientId,'Delima');
    const other = await g.join(randomUUID(),'Intan');
    const u = team.playerToken;
    const submit = (station, revision, text, status, extra) => g.action(u, 'submit', { station, revision, text,
      sceneId: EXERCISES[setId].stations[station - 1].choices[0].id, ...extra }, status);
    const mark = (station,revision,status,feedback,expected) =>
      g.host('mark',{teamId:team.playerId,station,revision,status,feedback},expected);
    assert.equal((await submit(1,0,'Jawapan awal.',409)).code,'SCAN_REQUIRED');
    for (const station of [1,2,3]) {
      await g.scan(u,station);
      assert.equal((await submit(station,0,'Jawapan.',400, {sceneId:'made-up'})).code,'BAD_SCENE');
      const requestId = randomUUID();
      const responses = await Promise.all([1,2].map(()=>submit(station,0,'Jawapan awal.',200,{requestId})));
      assert.deepEqual(responses.map(response=>response.state.me.entries[station - 1].revision),[1,1]);
      assert.equal(responses.filter(a=>a.replayed).length,1);
    }
    assert.equal((await g.action(u,'mark',{teamId:team.playerId,station:1,revision:1,status:'correct'},403)).code,'FORBIDDEN');
    assert.equal((await g.action(g.hostToken,'scan',g.scans[0],403)).code,'FORBIDDEN');
    assert.deepEqual(await g.join(clientId,'Delima'),team);
    await mark(1,1,'correct','');
    await mark(2,1,'revise','Nyatakan peristiwa dalam novel.');
    await g.scan(u,2);
    assert.equal((await submit(2,1,'Cubaan sebelum QR 4.',409)).code,'LOCKED');
    assert.equal((await g.state(u)).me.entries[1].status,'pending');
    assert.equal((await g.state(u)).me.entries[1].feedback,'');
    assert.equal((await g.state(u)).me.models,null);
    const firstCheck = (await g.scan(u,4)).state.me;
    assert.deepEqual(firstCheck.check.items.map(x=>x.status),['correct','revise','pending']);
    assert.equal(firstCheck.check.items[1].feedback,'Nyatakan peristiwa dalam novel.');
    assert.equal((await submit(2,1,'Cubaan tanpa kembali ke stesen.',409)).code,'SCAN_REQUIRED');
    await g.scan(u,2);
    assert.equal((await g.state(u)).me.entries[1].text,'Jawapan awal.');
    await submit(2,1,'Zahar dan pelatih baharu membersihkan kawasan belakang IKM.');
    assert.equal((await g.state(u)).me.entries[1].status,'pending');
    assert.equal((await mark(2,1,'correct','',409)).code,'STALE_REVISION');
    await Promise.all([mark(2,2,'correct',''),mark(3,1,'correct','')]);
    const beforeWin = await g.state(u);
    assert.equal(beforeWin.me.models,null);
    assert.equal(beforeWin.me.won,false);
    assert.equal((await g.state(g.hostToken)).winnerCount,0);
    const win = (await g.scan(u,4)).state;
    assert.equal(win.me.won,true);
    assert.equal(win.winnerCount,1);
    assert.deepEqual(win.me.models,MODEL_ANSWERS[setId]);
    assert.equal(win.me.models.length,3);
    await g.scan(u,4);
    assert.equal((await g.state(g.hostToken)).winnerCount,1);
    assert.equal((await g.state(other.playerToken)).me.models,null);
    for (const key of [undefined,other.playerToken]) {
      const state = await g.state(key);
      assert.equal(state.teams,undefined); assert.equal(state.models,undefined); assert.equal(state.stationLinks,undefined);
      assert.ok(!JSON.stringify(state).includes('Nyatakan peristiwa dalam novel.'));
      assert.ok(!JSON.stringify(state).includes('Zahar dan pelatih baharu membersihkan kawasan belakang IKM.'));
      await g.json(g.prefix+'review',undefined,key,403);
    }
    assert.equal((await g.state(g.hostToken)).teams.find(t=>t.id===team.playerId).entries[1].revision,2);
    await g.reset();
    const restored = (await g.state(u)).me;
    assert.deepEqual(restored.entries.map(e=>e.status),['empty','empty','empty']);
    assert.equal(restored.won,false); assert.equal(restored.models,null); assert.equal(restored.check,null);
  });
}

test('competing teacher decisions cannot silently replace each other, and teams cannot submit for a different team', async () => {
  const g = await setup();
  await g.host('start',{setId:'nilai'});
  const [a, b] = await Promise.all([g.join(randomUUID(),'A'),g.join(randomUUID(),'B')]);
  await g.scan(a.playerToken,1);
  const response = await g.action(a.playerToken,'submit',{
    teamId:b.playerId, station:1, revision:0, text:'Peristiwa bagi kumpulan A.', sceneId:EXERCISES.nilai.stations[0].choices[0].id,
  });
  assert.equal(response.state.me.id,a.playerId);
  assert.equal((await g.state(b.playerToken)).me.entries[0].status,'empty');
  const attempt = status => g.request(g.prefix+'action',{
    type:'mark',gameId:response.state.gameId,teamId:a.playerId,station:1,revision:1,status,feedback:'Ulasan cikgu.',
  },g.hostToken);
  const competing = await Promise.all([attempt('correct'),attempt('revise')]);
  assert.deepEqual(competing.map(res=>res.status).sort(),[200,409]);
  const checked = (await g.scan(a.playerToken,4)).state.me.check;
  assert.equal(checked.won,false);
  assert.deepEqual(checked.items.slice(1).map(item=>item.status),['empty','empty']);
  assert.equal((await g.action(b.playerToken,'scan',{...g.scans[2],station:4},400)).code,'BAD_STATION');
});
