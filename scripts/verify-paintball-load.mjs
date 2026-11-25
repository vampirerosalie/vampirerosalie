import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import { setTimeout as wait } from 'node:timers/promises';
import { QUESTIONS } from '../app/battle14/questions.js';
import { applyDelta } from '../public/battle14/arena-wire.js';

// Run against a local Worker. Every run uses newly created, isolated classrooms.
const base = new URL(process.argv[2] || 'http://127.0.0.1:3418');
assert.ok(['127.0.0.1','localhost','[::1]'].includes(base.hostname), 'Provide a local Worker URL.');
const counts = (process.argv[3] || '7,10,12').split(',').map(Number);
assert.ok(counts.every(n => [7,10,12].includes(n)), 'Use 7, 10 or 12 controllers.');
const api = '/api/paintball';
const http = async (path, payload) => {
  const url = new URL(api + path, base);
  const response = await fetch(url, payload === undefined ? {} : {
    method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify(payload),
  });
  const data = await response.json();
  assert.ok(response.ok, path + ' ' + response.status + ' ' + data.error);
  return data;
};

class Peer {
  constructor(pin, token) {
    const url = new URL(api + '/rooms/' + pin + '/socket', base);
    url.protocol = 'ws:';
    this.ws = new WebSocket(url);
    this.listeners = new Set();
    this.recent = [];
    this.inputCount = 0;
    this.frameCount = 0;
    this.frameBytes = 0;
    this.seq = 0;
    this.ws.addEventListener('open', () => this.send({type:'auth', token}));
    this.ws.addEventListener('error', () => { this.error = new Error('Could not connect to local Worker socket.'); });
    this.ws.addEventListener('message', ({data}) => {
      const message = JSON.parse(data);
      this.observe(message, data.length);
      this.recent.push(message.type);
      if (this.recent.length > 12) this.recent.shift();
      for (const listener of this.listeners) listener(message);
    });
  }

  observe(message, bytes) {
    if (message.type === 'probe') this.send({type:'probeAck',nonce:message.nonce});
    if (message.type === 'state') this.state = message.state;
    if (message.type === 'arena') {
      this.frameCount++;
      this.frameBytes += bytes;
      if (message.frame) this.frame = message.frame;
      else if (this.frame && message.delta) this.frame = applyDelta(this.frame, message.delta);
    }
  }
  async action(action) {
    const id = randomUUID();
    const waiting = this.reply(m => (m.type === 'ack' || m.type === 'error') && m.id === id, action.type);
    this.send({type:'action',action,id});
    const response = await waiting;
    assert.notEqual(response.type,'error',action.type + ' ' + response.message);
    return response.result;
  }
  input(input) {
    this.inputCount++;
    const message = {type:'input', round:this.frame?.round, seq:++this.seq, ...input,
      ...(input.fire ? {fireId:input.fireId || randomUUID()} : {})};
    this.send(message);
    return message;
  }
  ping(t) {
    const waiting = this.reply(m => m.type === 'pong' && m.t === t, 'ping');
    this.send({type:'ping',t});
    return waiting;
  }
  diagnostics() {
    const waiting = this.reply(m=>m.type==='diagnostics','room diagnostics');
    this.send({type:'diagnostics'});
    return waiting;
  }
  send(message) { this.ws.send(JSON.stringify(message)); }
  async until(predicate, label, timeout = 5000) {
    const deadline = Date.now() + timeout;
    while (Date.now() < deadline) {
      if (this.error) throw this.error;
      if (predicate()) return;
      await wait(10);
    }
    throw Error(label + ' timed out. Recent message types: ' + this.recent.join(', '));
  }
  reply(test, label, timeout = 5000) {
    return new Promise((resolve,reject) => {
      const listener = message => {
        if (!test(message)) return;
        clearTimeout(timer); this.listeners.delete(listener); resolve(message);
      };
      const timer = setTimeout(() => {
        this.listeners.delete(listener);
        reject(Error(label + ' timed out: ' + this.recent.join(', ')));
      }, timeout);
      this.listeners.add(listener);
    });
  }
  close() { if (this.ws.readyState < 2) this.ws.close(); }
}

const positions = frame => frame.players.map(p => [p.x,p.z]);
const freezeFrame = frame => frame.players.map(p => [p.id,p.x,p.z,p.ammo,p.score,p.frozenMs,p.abilityMs]);

async function drive(host, controllers, milliseconds) {
  const start = performance.now();
  const startPositions = positions(host.frame);
  const startCounts = controllers.map(p => p.inputCount);
  const initialFrames = host.frameCount, initialBytes = host.frameBytes;
  const latencies = [];
  let step = 0;
  while (performance.now() < start + milliseconds) {
    for (const [i, player] of controllers.entries()) {
      // Turn inwards, then curve periodically so every quadrant is exercised.
      const initialHeading = host.frame.players.find(p => p.id === player.teamId)?.yaw ?? i;
      if (player.heading == null) player.heading = initialHeading;
      const angle = player.heading + Math.sin(step / 16 + i) * 0.75;
      player.input({ dx: Math.sin(angle), dz: -Math.cos(angle), yaw: angle, fire: step % 17 === 0 });
    }
    if (step % 20 === 0) {
      const stamp = Date.now();
      latencies.push(host.ping(stamp).then(() => Date.now() - stamp));
    }
    step++;
    await wait(Math.max(0, start + step * 100 - performance.now()));
  }
  const time = (performance.now() - start) / 1000;
  const rtt = await Promise.all(latencies);
  const moved = positions(host.frame).filter((p,i) =>
    Math.hypot(p[0]-startPositions[i][0],p[1]-startPositions[i][1])>0.02).length;
  const frames = host.frameCount - initialFrames;
  const bytes = host.frameBytes - initialBytes;
  const inputs = controllers.reduce((n,p,i) => n + p.inputCount - startCounts[i],0);
  return { seconds:Number(time.toFixed(2)), controllers:controllers.length, inputs,
    inputHz:Number((inputs/time).toFixed(1)), spectatorHz:Number((frames/time).toFixed(2)),
    spectatorKiBPerSec:Number((bytes/1024/time).toFixed(2)), moved,
    meanLocalRttMs:Number((rtt.reduce((a,b)=>a+b,0)/rtt.length).toFixed(1)),
  };
}

async function startClass(count) {
  const {pin,hostToken,projectorToken} = await http('/rooms',{});
  assert.match(pin,/^\d{5}$/);
  const joinLink = new URL('/battle14/index.html',base);
  joinLink.searchParams.set('join',pin);
  const qr = new URL(api + '/qr',base);
  qr.searchParams.set('text',joinLink.href);
  const response = await fetch(qr);
  assert.ok(response.ok); assert.match(await response.text(),/<svg/);
  const peers = [];
  const open = async ({token,teamId,deviceId,joinKey}) => {
    const peer = new Peer(pin,token);
    Object.assign(peer,{token,teamId,deviceId,joinKey}); peers.push(peer);
    await peer.until(()=>!!peer.state,'initial room state');
    return peer;
  };
  const connect = async (name, teamId) => {
    const creds = await http('/rooms/' + pin + '/join',{deviceName:name,name,teamId,joinKey:randomUUID()});
    return open(creds);
  };
  try {
    const host = await open({ token:hostToken });
    const projector = await open({ token:projectorToken });
    const controllers = [];
    for (let i=0; i<count; i++) controllers.push(await connect('QA team ' + (i+1)));
    assert.equal(new Set(controllers.map(p=>p.teamId)).size,count);
    return {pin,host,projector,controllers,peers,connect,open};
  } catch (error) { peers.forEach(p=>p.close()); throw error; }
}

async function quizBlock(host, controllers, first, projector) {
  for (const q of QUESTIONS.slice(first - 1, first + 4)) {
    await Promise.all([host,...controllers].map(c => c.until(()=>c.state?.question?.id === q.id,'shared ' + q.id)));
    for (const p of controllers) {
      assert.equal(p.state.question.answer,undefined);
      assert.equal(p.state.question.correctAnswer,undefined);
      assert.equal(p.state.review,undefined);
    }
    await projector.until(()=>projector.state?.question?.id===q.id,'projector question');
    assert.equal(projector.state.review,undefined);
    await Promise.all(controllers.map((p,i) => p.action({type:'student:submit',questionId:q.id,
      answer:q.number===1 && i===0 ? 'D' : q.answer})));
    if (q.number===1) {
      await host.action({type:'host:decision',questionId:q.id,teamId:controllers[0].teamId,decision:'accept'});
    }
    if (q.number===6) {
      await host.action({type:'host:decision',questionId:q.id,teamId:controllers[0].teamId,decision:'reject'});
    }
    await host.action({type:'host:finalize',questionId:q.id});
    await host.action({type:'host:next',questionId:q.id});
  }
  await host.until(()=>host.state.phase==='roundReady','manual shootout gate');
}

async function roundTest(count) {
  const {host,projector,controllers,peers,connect,open} = await startClass(count);
  try {
    const first = controllers[0];
    const spectator = await connect('Second device',first.teamId);
    await host.action({type:'host:start'});
    await quizBlock(host,controllers,1,projector);
    await host.action({type:'host:start-round',round:1});
    await Promise.all([host,projector,...controllers,spectator].map(p=>p.until(()=>p.frame?.players?.length===count,'arena baseline')));
    assert.ok(host.frame.players.every(p=>p.ammo===15));
    const baseline = host.frame.players.find(p=>p.id===first.teamId);
    const oldAmmo = baseline.ammo;
    spectator.input({dx:0,dz:0,yaw:0,fire:true});
    await wait(220);
    assert.equal(host.frame.players.find(p=>p.id===first.teamId).ammo,oldAmmo,'spectators cannot fire');
    const initialDiagnostics = await host.diagnostics();
    const metrics = await drive(host,controllers,7000);
    const diagnostics = await host.diagnostics();
    metrics.checkpointWrites = diagnostics.checkpointWrites - initialDiagnostics.checkpointWrites;
    assert.equal(metrics.moved,count,'all controllers move across the network');
    assert.ok(metrics.spectatorHz > 2 && metrics.spectatorHz <= 13,'batched spectator updates');
    await host.action({type:'host:pause',round:1});
    await host.until(()=>host.frame?.paused,'server paused');
    const paused = freezeFrame(host.frame), pausedMs = host.frame.remainingMs;
    for (const c of controllers) c.input({dx:1,dz:0,yaw:0,fire:true});
    await wait(650);
    assert.deepEqual(freezeFrame(host.frame),paused);
    assert.equal(host.frame.remainingMs,pausedMs);

    await host.action({type:'host:controller',teamId:first.teamId,deviceId:spectator.deviceId});
    await host.action({type:'host:resume',round:1});
    await host.until(()=>!host.frame.paused,'server resumed');
    const before = host.frame.players.find(p=>p.id===first.teamId).ammo;
    first.input({dx:0,dz:0,yaw:0,fire:true});
    await wait(250);
    assert.equal(host.frame.players.find(p=>p.id===first.teamId).ammo,before,'previous controller loses input authority');
    const shot = spectator.input({dx:0,dz:0,yaw:0,fire:true});
    await host.until(()=>host.frame.players.find(p=>p.id===first.teamId).ammo===before-1,'new controller can fire');
    await wait(230);
    spectator.input({dx:0,dz:0,yaw:0,fire:true,fireId:shot.fireId});
    await wait(220);
    assert.equal(host.frame.players.find(p=>p.id===first.teamId).ammo,before-1,'retrying a shot spends nothing twice');
    controllers[0]=spectator;
    const current = controllers[1];
    current.close(); await wait(150);
    const recovered = await open(current);
    await recovered.until(()=>recovered.frame?.round===1,'recovered arena');
    assert.equal(recovered.frame.players.find(p=>p.id===current.teamId).ammo,
      host.frame.players.find(p=>p.id===current.teamId).ammo,'reconnecting preserves ammunition');
    controllers[1]=recovered;
    let sustained;
    if (count===12) {
      // Wait for the authoritative deadline. Phones should retain their results screen.
      sustained = await drive(host,controllers,Math.max(1000,host.frame.remainingMs-1500));
      await host.until(()=>host.state.phase==='roundResults','60-second server round',62000);
      await Promise.all(controllers.map(p=>p.until(()=>p.state.phase==='roundResults','phone round end')));
    } else {
      await host.action({type:'host:end-round',round:1});
      await host.until(()=>host.state.phase==='roundResults','early round end');
    }
    if (count===7) {
      for (const round of [2,3,4]) {
        await host.action({type:'host:continue',round:round-1});
        await quizBlock(host,controllers,round*5-4,projector);
        await host.action({type:'host:start-round',round});
        await host.until(()=>host.frame.round===round,'round ' + round);
        assert.equal(host.frame.players[0].ammo,round===2 ? 13 : 15,'separate earned round budget');
        assert.ok(host.frame.players.every(p=>!p.hitIds.length && !p.ability));
        await host.action({type:'host:end-round',round});
        await host.until(()=>host.state.phase==='roundResults','round ' + round + ' results');
      }
    }
    await host.action({type:'host:finish'});
    await Promise.all(controllers.map(p=>p.until(()=>p.state.phase==='finished','phone finale')));
    const finale = controllers[0].state;
    assert.equal(finale.completedRounds,count===7 ? 4 : 1);
    for (const team of finale.teams) {
      const {firstHits,drones,stolen,lost} = team.stats;
      assert.equal(team.score,3*firstHits+drones+stolen-lost,'score totals reconcile exactly');
      const expectedEnglish = count===7 ? (team.id===first.teamId ? 19 : 20) : 5;
      assert.equal(team.englishCorrect,expectedEnglish,'finalized English marks are separate');
    }
    console.log(JSON.stringify({teams:count,measured:metrics,sustained,diagnostics}));
  } finally { peers.forEach(p=>p.close()); }
}

for (const count of counts) await roundTest(count);
