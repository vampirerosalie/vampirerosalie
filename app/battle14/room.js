import { DurableObject } from 'cloudflare:workers';
import { createHash, createHmac, randomBytes, randomUUID } from 'node:crypto';
import { readBody } from '../battle7/http.js';
import { json } from './gateway.js';
import { createSession, joinSession, sessionView, quizCommand, finishRound, isController, closeExpiredQuiz } from './session.js';
import { createArena, stepArena, inputArena, pauseArena, resumeArena, endArena, frameArena, clearArenaInput } from './arena.js';
import { diffFrame } from '../../public/battle14/arena-wire.js';

const TTL = 24 * 3600000;
const CLOCK_MS = 100;
const SNAPSHOT_MS = 5000;
const token = () => randomBytes(32).toString('hex');
const hash = value => createHash('sha256').update(value).digest('hex');
const validId = value => typeof value === 'string' && /^[a-zA-Z0-9._:-]{1,96}$/.test(value);
const active = arena => arena && !arena.paused && !arena.finished;

export class PaintballRoom extends DurableObject {
  constructor(ctx, env) {
    super(ctx, env);
    this.ctx = ctx;
    this.clients = new Map();
    this.metrics = { incoming: 0, outgoing: 0, frames: 0, checkpoints: 0, processing: 0, samples: 0, accepted: 0 };
    this.recent = [];
    this.lastSnapshot = 0;
    this.savedEvent = 0;
    this.lastFrame = null;
    this.clock = null;
    this.scheduled = null;
    for (const socket of ctx.getWebSockets()) {
      const data = socket.deserializeAttachment();
      this.clients.set(socket, data || {});
    }
    ctx.blockConcurrencyWhile(async () => {
      const saved = await ctx.storage.get(['room','live']);
      this.data = saved.get('room') || null;
      if (!this.data) return;
      Object.assign(this.data, saved.get('live'));
      this.savedEvent = this.data.arena?.nextEvent || 0;
      if (this.data.arena && this.data.session.phase === 'shootout') {
        for (const player of this.data.arena.players) clearArenaInput(this.data.arena, player.id);
      }
      if (this.data.expiresAt > Date.now()) await this.tick(Date.now(), true);
    });
  }

  async persist() {
    this.lastSnapshot = Date.now();
    this.metrics.checkpoints++;
    const { arena, shots, ...room } = this.data;
    this.savedEvent = arena?.nextEvent || 0;
    await this.ctx.storage.put({ room, live: { arena, shots } });
  }

  async saveArena() {
    const { arena, shots } = this.data;
    this.lastSnapshot = Date.now();
    this.savedEvent = arena.nextEvent;
    this.metrics.checkpoints++;
    await this.ctx.storage.put('live', { arena, shots });
  }

  async fetch(request) {
    try {
      const op = new URL(request.url).pathname.split('/').pop();
      const now = Date.now();
      if (op === 'create') {
        if (this.data && this.data.expiresAt > now) return json({ error: 'PIN already in use.' }, 409);
        if (this.data) await this.expire();
        const pin = await request.text();
        if (!/^\d{5}$/.test(pin)) return json({ error: 'Invalid PIN.' }, 400);
        const hostToken = token(), projectorToken = token(), hostHash = hash(hostToken);
        this.data = { session: createSession({ pin, hostTokenHash: hostHash, now }),
          credentials: { [hostHash]: { role: 'host' }, [hash(projectorToken)]: { role: 'projector' } },
          joinSecret: token(), joins: {}, shots: {}, arena: null, expiresAt: now + TTL };
        await this.persist();
        await this.schedule();
        return json({ pin, hostToken, projectorToken }, 201);
      }
      if (!this.data || this.data.expiresAt <= now) {
        if (op === 'socket') {
          // A failed HTTP upgrade only reports 1006 to browsers. Return a terminal
          // application close code so a genuinely expired PIN stops reconnecting.
          const [client, server] = Object.values(new WebSocketPair());
          server.accept();
          server.close(4001, 'Room unavailable. Check the current joining PIN.');
          return new Response(null, {status:101,webSocket:client});
        }
        return json({ error: 'Room unavailable. Check the current joining PIN.' }, 404);
      }
      const session = this.data.session;
      if (op === 'teams') return json({ phase: session.phase, teams: session.teams.map(({ id, name, color, colorName }) => ({ id, name, color, colorName })) });
      if (op === 'join') {
        const body = await readBody(request);
        if (body.joinKey && (!validId(body.joinKey) || body.joinKey.length < 24)) return json({ error: 'Invalid join key.' }, 400);
        const joinKey = body.joinKey || randomUUID();
        const deviceToken = createHmac('sha256', this.data.joinSecret).update(joinKey).digest('hex');
        const key = hash(deviceToken);
        const fingerprint = JSON.stringify([body.name || '', body.teamId || '', body.deviceName || '']);
        const existing = this.data.joins[key];
        if (existing && existing.fingerprint !== fingerprint) return json({ error: 'This join attempt has already been used.' }, 409);
        if (!existing) {
          if (Object.keys(this.data.joins).length >= 120) return json({ error: 'This room has reached its device limit.' }, 409);
          const deviceId = randomUUID();
          const result = joinSession(session, { name: body.name, teamId: body.teamId, deviceName: body.deviceName, deviceId }, now);
          this.data.credentials[key] = { role: 'team', teamId: result.teamId, deviceId };
          this.data.joins[key] = { fingerprint, teamId: result.teamId, deviceId };
          await this.persist();
          this.broadcastState();
        }
        const { teamId, deviceId } = this.data.joins[key];
        return json({ pin: session.pin, teamId, deviceId, token: deviceToken }, existing ? 200 : 201);
      }
      if (op === 'socket') {
        if (this.clients.size >= 144) return json({ error: 'Too many room connections.' }, 429);
        const pair = new WebSocketPair();
        const [client, server] = Object.values(pair);
        const attachment = { joined: now };
        this.ctx.acceptWebSocket(server);
        server.serializeAttachment(attachment);
        this.clients.set(server, attachment);
        // An unauthenticated connection must promptly present its room credential.
        setTimeout(() => { if (this.clients.has(server) && !this.clients.get(server).actor) server.close(4001, 'Sign in again.'); }, 10000);
        this.metrics.accepted++;
        return new Response(null, { status: 101, webSocket: client });
      }
      return json({ error: 'Unknown room route.' }, 404);
    } catch (error) {
      return json({ error: error.message || 'Invalid room request.' }, error.status || 400);
    }
  }

  meter(field) {
    const second = Math.floor(Date.now() / 1000);
    let bucket = this.recent.at(-1);
    if (bucket?.second !== second) {
      bucket = { second, incoming: 0, outgoing: 0, frames: 0 };
      this.recent = this.recent.filter(item => second - item.second < 5);
      this.recent.push(bucket);
    }
    bucket[field]++;
    this.metrics[field]++;
  }

  send(socket, data) {
    try {
      socket.send(typeof data === 'string' ? data : JSON.stringify(data));
      this.meter('outgoing');
    } catch { /* A closing socket is removed by its lifecycle event. */ }
  }

  online() {
    return new Set([...this.clients.values()].map(c => c.actor?.deviceId).filter(Boolean));
  }

  sendState(socket, actor, now, online) {
    const state = sessionView(this.data.session, actor, {now, onlineDeviceIds: online});
    const client = this.clients.get(socket);
    if (!client) return;
    // A private marking change normally affects only the host. Skip unchanged
    // role-specific views when a peer reconnects or the teacher reviews an answer.
    const signature = JSON.stringify({ ...state, serverTime: 0 });
    if (signature === client.lastState) return;
    client.lastState = signature;
    this.send(socket, { type: 'state', state, serverTime: now });
  }

  broadcastState() {
    const now = Date.now(), online = this.online();
    for (const [socket, client] of this.clients) if (client.actor) this.sendState(socket, client.actor, now, online);
  }

  broadcastFrame(force = false) {
    if (!this.data?.arena) return;
    const frame = frameArena(this.data.arena), now = Date.now();
    const packet = force || !this.lastFrame ? { frame } : { delta: diffFrame(this.lastFrame, frame) };
    this.lastFrame = frame;
    const wire = JSON.stringify({ type: 'arena', ...packet, serverTime: now });
    this.meter('frames');
    for (const [socket, client] of this.clients) if (client.actor) this.send(socket, wire);
  }

  probe(socket, client) {
    client.probe = { nonce: randomUUID(), at: Date.now() };
    this.send(socket, { type: 'probe', nonce: client.probe.nonce });
  }

  diagnostics() {
    const now = Math.floor(Date.now() / 1000);
    const recent = this.recent.filter(b => now - b.second < 5);
    const rate = field => recent.reduce((sum, bucket) => sum + bucket[field], 0) / 5;
    const latencies = [...this.clients.values()].map(c => c.rtt).filter(Number.isFinite);
    const m = this.metrics;
    return { type: 'diagnostics', connectedClients: [...this.clients.values()].filter(c => c.actor).length,
      incomingPerSecond: rate('incoming'), outgoingPerSecond: rate('outgoing'), framesPerSecond: rate('frames'),
      averageLatencyMs: latencies.length ? latencies.reduce((a,b) => a+b,0) / latencies.length : null,
      averageProcessingMs: m.samples ? m.processing / m.samples : null, messagesReceived: m.incoming,
      estimatedRequestUnits: m.accepted + m.incoming / 20, checkpointWrites: m.checkpoints };
  }

  async webSocketMessage(socket, raw) {
    const start = performance.now();
    this.meter('incoming');
    let id;
    try {
      const client = this.clients.get(socket);
      if (!client || !this.data) return socket.close(4001, 'Room expired.');
      if (typeof raw !== 'string' || raw.length > 4096) return socket.close(1009, 'Message too large.');
      const msg = JSON.parse(raw);
      if (!msg || typeof msg !== 'object') throw new Error('Invalid message.');
      if (validId(msg.id)) id = msg.id;
      const now = Date.now();
      if (!client.actor) {
        const actor = msg.type === 'auth' && typeof msg.token === 'string' && /^[a-f0-9]{64}$/.test(msg.token) &&
          this.data.credentials[hash(msg.token)];
        if (!actor || now - client.joined > 10000 || this.data.expiresAt <= now) {
          this.send(socket, { type: 'error', message: 'Room credential expired or invalid. Open the joining link again.' });
          return socket.close(4001, 'Invalid room credential.');
        }
        if (actor.deviceId) {
          for (const [other, peer] of this.clients) if (other !== socket && peer.actor?.deviceId === actor.deviceId) {
            this.clients.delete(other);
            other.close(4009, 'This device opened another connection.');
          }
          if (this.data.arena && isController(this.data.session, actor)) clearArenaInput(this.data.arena, actor.teamId);
        }
        client.actor = actor;
        socket.serializeAttachment({ joined: now, actor });
        this.broadcastState();
        if (this.data.arena && ['shootout','roundResults','finished'].includes(this.data.session.phase)) {
          this.send(socket, { type: 'arena', frame: this.lastFrame || frameArena(this.data.arena), serverTime: now });
        }
        this.probe(socket, client);
        return;
      }
      if (!client.window || now - client.window >= 1000) { client.window = now; client.rate = 0; }
      if (++client.rate > 60) return socket.close(1008, 'Too many messages.');
      if (msg.type === 'ping') return this.send(socket, { type: 'pong', t: Number(msg.t) || 0, serverTime: now });
      if (msg.type === 'probeAck') {
        if (client.probe?.nonce === msg.nonce) { client.rtt = now - client.probe.at; delete client.probe; }
        return;
      }
      if (msg.type === 'diagnostics' && client.actor.role === 'host') {
        this.send(socket, this.diagnostics());
        for (const [s, c] of this.clients) if (c.actor) this.probe(s, c);
        return;
      }
      if (msg.type === 'input') return this.applyInput(client.actor, msg, now);
      if (msg.type !== 'action' || !id || !msg.action || typeof msg.action.type !== 'string') throw new Error('Invalid game action.');
      await this.action(socket, client.actor, id, msg.action, now);
    } catch (error) {
      this.send(socket, { type: 'error', id, message: error.message || 'Game action failed.' });
    } finally {
      this.metrics.processing += performance.now() - start;
      this.metrics.samples++;
    }
  }

  applyInput(actor, msg, now) {
    const { session, arena, shots } = this.data;
    if (session.phase !== 'shootout' || !active(arena) || arena.round !== msg.round || !isController(session, actor)) return;
    if (msg.fire === true) {
      if (!validId(msg.fireId)) return;
      const seen = shots[actor.teamId] ||= [];
      if (seen.includes(msg.fireId)) return;
      if (seen.length >= 1024) return;
      if (inputArena(arena, actor.teamId, msg, now)) seen.push(msg.fireId);
    } else inputArena(arena, actor.teamId, msg, now);
  }

  async action(socket, actor, id, action, now) {
    const data = this.data, s = data.session;
    await this.tick(now);
    const effect = quizCommand(s, actor, { ...action, requestId: id }, now) || {};
    if (effect.replayed) {
      this.sendState(socket, actor, now, this.online());
      return this.send(socket, { type: 'ack', id });
    }
    if (effect.startRound) {
      data.arena = createArena({ ...effect.startRound, now });
      data.shots = {};
      this.lastFrame = null;
    }
    if (effect.pauseRound) pauseArena(data.arena, now);
    if (effect.resumeRound) resumeArena(data.arena, now);
    if (effect.endRound && data.arena) {
      endArena(data.arena, now);
      finishRound(s, frameArena(data.arena), now, !!effect.finishGame);
    }
    if (action.type === 'host:controller') clearArenaInput(data.arena, action.teamId);
    if (data.expiresAt < now + TTL / 2) data.expiresAt = now + TTL;
    await this.persist();
    await this.schedule();
    this.manageClock();
    this.broadcastState();
    if (effect.startRound || effect.pauseRound || effect.resumeRound || effect.endRound) this.broadcastFrame(true);
    this.send(socket, { type: 'ack', id });
  }

  manageClock() {
    const running = this.data?.session.phase === 'shootout' && active(this.data.arena);
    if (!running && this.clock !== null) { clearInterval(this.clock); this.clock = null; }
    if (running && this.clock === null) {
      this.clock = setInterval(() => this.ctx.waitUntil(this.tick(Date.now())), CLOCK_MS);
    }
  }

  async tick(now, restoring = false) {
    if (!this.data) return;
    const { arena, session } = this.data;
    let milestone = closeExpiredQuiz(session, now);
    const duringRound = session.phase === 'shootout' && arena && !arena.paused;
    if (duringRound) {
      if (stepArena(arena, now)) { finishRound(session, frameArena(arena), now); milestone = true; }
    }
    this.manageClock();
    if (milestone) await this.persist();
    else if (active(arena) && (arena.nextEvent !== this.savedEvent || now - this.lastSnapshot >= SNAPSHOT_MS)) {
      // Batch consumed shots and pickups before announcing them, so reconnecting
      // after an eviction cannot give back a shot or duplicate a scored hit.
      // Movement alone causes at most one small arena checkpoint per five seconds.
      await this.saveArena();
    }
    if (duringRound) this.broadcastFrame(restoring);
    if (milestone) this.broadcastState();
    if (milestone || restoring) await this.schedule();
  }

  async schedule() {
    if (!this.data) return;
    const { session, arena, expiresAt } = this.data;
    const deadline = session.phase === 'shootout' && active(arena) ? arena.lastWall + 60000 - arena.elapsed : expiresAt;
    const next = Math.min(expiresAt, session.quizDeadline || expiresAt, deadline);
    if (next !== this.scheduled) { this.scheduled = next; await this.ctx.storage.setAlarm(next); }
  }

  async alarm() {
    this.scheduled = null;
    if (!this.data) return;
    if (this.data.expiresAt <= Date.now()) return this.expire();
    await this.tick(Date.now());
    await this.schedule();
  }

  async expire() {
    for (const socket of this.clients.keys()) socket.close(4001, 'Room expired.');
    this.clients.clear();
    this.data = null;
    this.manageClock();
    this.lastFrame = null;
    this.scheduled = null;
    await this.ctx.storage.deleteAlarm();
    await this.ctx.storage.deleteAll();
  }

  disconnect(socket) {
    const client = this.clients.get(socket);
    this.clients.delete(socket);
    if (!client?.actor || !this.data) return;
    if (isController(this.data.session, client.actor)) clearArenaInput(this.data.arena, client.actor.teamId);
    this.broadcastState();
  }
  webSocketClose(socket, code, reason) {
    this.disconnect(socket);
    try { socket.close(code === 1005 || code === 1006 ? 1000 : code, reason); } catch { /* Already closed. */ }
  }
  webSocketError(socket) { this.disconnect(socket); }
}
