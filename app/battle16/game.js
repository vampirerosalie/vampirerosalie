import { createHash, createHmac, randomBytes, randomInt, timingSafeEqual } from 'node:crypto';
import { GameError } from '../rooms/error.js';
import { EXERCISES } from '../../public/battle16/content.js';
import { MODEL_ANSWERS } from './models.js';

const stations = [1, 2, 3];
const token = () => randomBytes(32).toString('hex');
const digest = value => createHash('sha256').update(value).digest('hex');
const mac = (secret, value) => createHmac('sha256', secret).update(value).digest('hex');
const same = (a, b) => timingSafeEqual(Buffer.from(a, 'hex'), Buffer.from(b, 'hex'));

function fail(message, code, status = 409) { throw new GameError(message, code, status); }
function isSet(value) { return typeof value === 'string' && Object.hasOwn(EXERCISES, value); }
function clean(value) {
  return typeof value === 'string' ? value.normalize('NFKC').replace(/[\u0000-\u0008\u000B-\u001F\u007F]/g, '').trim() : '';
}
function freshEntries() {
  return stations.map(station => ({ station, revision: 0, status: 'empty', sceneId: null, text: '', feedback: '' }));
}
function freshProgress() {
  return { activeStation: 0, entries: freshEntries(), check: null, won: false };
}
function studentEntry(player, entry) {
  const disclosed = player.check?.items.find(item => item.station === entry.station && item.revision === entry.revision);
  return { ...entry, status: disclosed?.status ?? (entry.revision ? 'pending' : 'empty'), feedback: disclosed?.feedback ?? '' };
}
export function stationHref(pin, station, code) {
  return '/battle16/index.html?' + new URLSearchParams({ join: pin, station, code });
}

export class SasteraGame {
  constructor({ now = Date.now, random = randomInt, secret = token() } = {}) {
    this.now = now;
    this.random = random;
    this.secret = secret;
    this.rooms = new Map();
    this.lastSeen = new Map();
  }

  create(setId = 'nilai') {
    if (!isSet(setId)) fail('Pilih latihan yang sah.', 'BAD_SET', 400);
    const pin = String(10000 + this.random(90000));
    const hostToken = token();
    const createdAt = this.now();
    this.rooms.set(pin, { pin, createdAt, expiresAt: createdAt + 48 * 3600000, hostHash: digest(hostToken),
      players: [], setId, phase: 'lobby', gameId: randomBytes(12).toString('hex'), version: 1, receipts: {} });
    return { pin, hostToken };
  }

  room(pin) {
    const room = this.rooms.get(String(pin));
    if (!room || room.expiresAt <= this.now()) fail('Bilik telah tamat. Dapatkan PIN baharu daripada cikgu.', 'ROOM_NOT_FOUND', 404);
    return room;
  }

  join(pin, { clientId, name } = {}) {
    const room = this.room(pin);
    if (typeof clientId !== 'string' || !/^[-a-zA-Z0-9]{20,100}$/.test(clientId)) fail('Identiti peranti tidak sah.', 'BAD_IDENTITY', 400);
    const playerToken = mac(this.secret, 'sastera:team:' + pin + ':' + room.createdAt + ':' + clientId);
    const existing = room.players.find(player => player.clientId === clientId);
    if (existing) return { playerId: existing.id, playerToken };
    const teamName = clean(name).replace(/\s+/g, ' ');
    if (!teamName || teamName.length > 28) fail('Gunakan nama pasukan yang mengandungi 1 hingga 28 aksara.', 'BAD_NAME', 400);
    if (room.players.length >= 40) fail('Kesemua 40 tempat telah diisi.', 'ROOM_FULL');
    const playerId = randomBytes(12).toString('hex');
    room.players.push({ id: playerId, clientId, name: teamName, tokenHash: digest(playerToken), ...freshProgress() });
    room.version++;
    return { playerId, playerToken };
  }

  auth(room, key) {
    if (!key) return { role: 'public' };
    if (typeof key !== 'string') fail('Kunci peranti tidak sah.', 'UNAUTHORIZED', 401);
    const hashed = digest(key);
    if (same(hashed, room.hostHash)) return { role: 'host' };
    const player = room.players.find(team => same(hashed, team.tokenHash));
    if (!player) fail('Kunci peranti tidak sah.', 'UNAUTHORIZED', 401);
    return { role: 'student', player };
  }

  stationCode(room, station) {
    // Include the room identity, but keep printed QR cards valid between latihan.
    return mac(this.secret, 'sastera:station:' + room.pin + ':' + room.createdAt + ':' + station).slice(0, 32);
  }

  state(pin, token) {
    const room = this.room(pin);
    return this.view(room, this.auth(room, token));
  }

  view(room, actor) {
    const online = player => {
      const seen = this.lastSeen.get(room.pin + ':' + player.id);
      return seen !== undefined && this.now() - seen < 45000;
    };
    const winners = room.players.filter(player => player.won).map(({ name }) => ({ name }));
    const result = { role: actor.role, pin: room.pin, phase: room.phase, gameId: room.gameId, setId: room.setId,
      version: room.version, teamCount: room.players.length, onlineCount: room.players.filter(online).length, winnerCount: winners.length, winners };
    if (actor.role === 'host') {
      result.stationLinks = [1, 2, 3, 4].map(station => {
        const code = this.stationCode(room, station);
        return { station, href: stationHref(room.pin, station, code), qrUrl: '/api/sastera/rooms/' + room.pin + '/stations/' + station + '/qr.svg?code=' + code };
      });
      result.teams = room.players.map(player => ({ id: player.id, name: player.name, online: online(player), won: player.won, entries: player.entries }));
      result.models = MODEL_ANSWERS[room.setId];
    } else if (actor.player) {
      const p = actor.player;
      result.me = { id: p.id, name: p.name, activeStation: p.activeStation, entries: p.entries.map(entry => studentEntry(p, entry)),
        won: p.won, check: p.check, models: p.won ? MODEL_ANSWERS[room.setId] : null };
    }
    return result;
  }

  review(pin, token) {
    const room = this.room(pin), actor = this.auth(room, token);
    if (actor.role !== 'host') fail('Semakan ini untuk cikgu sahaja.', 'FORBIDDEN', 403);
    return this.view(room, actor);
  }

  scan(room, player, { station, code }) {
    if (![1, 2, 3, 4].includes(station) || typeof code !== 'string' || !/^[a-f0-9]{32}$/.test(code)
      || !same(code, this.stationCode(room, station))) fail('Imbas kod QR stesen bagi bilik ini.', 'BAD_STATION', 400);
    if (station === 4) {
      const items = player.entries.map(({ station, status, feedback, revision }) => ({ station, status, feedback, revision }));
      player.won = items.every(item => item.status === 'correct');
      player.check = { items, won: player.won };
    }
    player.activeStation = station;
  }

  submit(room, player, { station, revision, text, sceneId }) {
    if (!stations.includes(station) || player.activeStation !== station) fail('Imbas kod QR stesen ini dahulu.', 'SCAN_REQUIRED');
    const entry = player.entries[station - 1];
    const answer = clean(text);
    if (!answer || answer.length > 800) fail('Tulis jawapan antara 1 hingga 800 aksara.', 'BAD_TEXT', 400);
    const task = EXERCISES[room.setId].stations[station - 1];
    if (!task.choices.some(choice => choice.id === sceneId)) fail('Pilih satu peristiwa di stesen ini.', 'BAD_SCENE', 400);
    if (revision !== entry.revision) {
      if (revision === entry.revision - 1 && sceneId === entry.sceneId && answer === entry.text) return false;
      fail('Versi jawapan telah berubah. Muat semula jawapan.', 'STALE_REVISION');
    }
    const canRevise = entry.status === 'revise' && studentEntry(player, entry).status === 'revise';
    if (entry.status !== 'empty' && !canRevise) fail('Jawapan telah dihantar. Semak di QR 4.', 'LOCKED');
    Object.assign(entry, { revision: revision + 1, status: 'pending', text: answer, sceneId, feedback: '' });
    return true;
  }

  mark(room, { teamId, station, revision, status, feedback }) {
    const team = room.players.find(player => player.id === teamId);
    if (!team || !stations.includes(station)) fail('Pasukan atau stesen tidak sah.', 'BAD_MARK', 400);
    const entry = team.entries[station - 1];
    if (!['correct', 'revise'].includes(status)) fail('Pilih keputusan semakan.', 'BAD_MARK', 400);
    const note = clean(feedback);
    if (note.length > 320 || (status === 'revise' && !note)) fail('Berikan maklum balas kepada pasukan (maksimum 320 aksara).', 'BAD_FEEDBACK', 400);
    if (revision !== entry.revision || entry.revision === 0) fail('Jawapan ini telah berubah.', 'STALE_REVISION');
    if (entry.status === status && entry.feedback === note) return false;
    if (entry.status !== 'pending' || team.won) fail('Versi jawapan ini sudah disemak.', 'ALREADY_MARKED');
    Object.assign(entry, { status, feedback: note });
    return true;
  }

  action(pin, token, body = {}) {
    const room = this.room(pin), actor = this.auth(room, token);
    if (actor.role === 'public') fail('Sertai bilik terlebih dahulu.', 'UNAUTHORIZED', 401);
    const actions = actor.role === 'host' ? ['start', 'reset', 'mark'] : ['scan', 'submit'];
    if (!actions.includes(body.type)) fail('Tindakan ini tidak dibenarkan.', 'FORBIDDEN', 403);
    const actorKey = actor.player?.id ?? 'host';
    const receiptList = room.receipts[actorKey] || [];
    let signature;
    if (body.requestId !== undefined) {
      if (typeof body.requestId !== 'string' || !/^[-a-zA-Z0-9]{12,100}$/.test(body.requestId)) fail('ID permintaan tidak sah.', 'BAD_REQUEST_ID', 400);
      signature = digest(JSON.stringify(body));
      const previous = receiptList.find(receipt => receipt.id === body.requestId);
      if (previous) {
        if (signature !== previous.signature) fail('ID permintaan telah digunakan.', 'RECEIPT_CONFLICT');
        return { replayed: true, state: this.view(room, actor) };
      }
    }
    if (body.gameId !== room.gameId) fail('Latihan sudah berubah. Muat semula.', 'STALE_GAME');
    let changed = true;
    if (body.type === 'start') {
      if (!isSet(body.setId)) fail('Pilih latihan yang sah.', 'BAD_SET', 400);
      if (room.phase !== 'lobby' && room.setId !== body.setId) fail('Tetapkan semula sebelum menukar latihan.', 'WRONG_PHASE');
      changed = room.phase !== 'playing';
      room.setId = body.setId;
      room.phase = 'playing';
    } else if (body.type === 'reset') {
      for (const player of room.players) Object.assign(player, freshProgress());
      room.phase = 'lobby';
      room.gameId = randomBytes(12).toString('hex');
      room.receipts = {};
    } else {
      if (room.phase !== 'playing') fail('Tunggu sehingga cikgu memulakan latihan.', 'WRONG_PHASE');
      if (body.type === 'scan') this.scan(room, actor.player, body);
      if (body.type === 'submit') changed = this.submit(room, actor.player, body);
      if (body.type === 'mark') changed = this.mark(room, body);
    }
    if (changed) {
      if (signature) {
        const kept = body.type === 'reset' ? [] : receiptList.slice(-23);
        room.receipts[actorKey] = [...kept, { id: body.requestId, signature }];
      }
      room.version++;
    }
    return { ok: true, state: this.view(room, actor) };
  }
}
