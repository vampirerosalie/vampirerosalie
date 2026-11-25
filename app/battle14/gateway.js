import { randomInt } from 'node:crypto';
import QRCode from 'qrcode';
import { readBody } from '../battle7/http.js';

const headers = { 'Cache-Control': 'no-store', 'X-Content-Type-Options': 'nosniff', 'Referrer-Policy': 'no-referrer' };
export const json = (data, status = 200) => Response.json(data, { status, headers });
const creations = new Map();

function allowCreation(ip, now) {
  if (creations.size > 1000) {
    for (const [key, value] of creations) if (now >= value.until) creations.delete(key);
  }
  let rate = creations.get(ip);
  if (!rate || now >= rate.until) creations.set(ip, rate = { until: now + 3600000, count: 0 });
  return ++rate.count <= 30;
}

export async function paintballRequest(request, env) {
  try {
    const url = new URL(request.url);
    const origin = request.headers.get('Origin');
    if ((origin && origin !== url.origin) || request.headers.get('Sec-Fetch-Site') === 'cross-site') {
      return json({ error: 'Open the game on the classroom site.' }, 403);
    }
    const ns = env.PAINTBALL_ROOMS;
    const path = url.pathname.slice('/api/paintball'.length);
    if (path === '/health' && request.method === 'GET') return json({ ok: !!ns, battle: 14 }, ns ? 200 : 503);
    if (path === '/qr' && request.method === 'GET') {
      const text = url.searchParams.get('text') || '';
      let join;
      try { join = new URL(text); } catch { return json({ error: 'Invalid join link.' }, 400); }
      if (join.origin !== url.origin || text.length > 512 || join.username || join.password || join.hash ||
          !/^\d{5}$/.test(join.searchParams.get('join') || '') ||
          !(join.pathname === '/battle14/index.html' || (join.pathname === '/' && join.searchParams.get('battle') === '14'))) {
        return json({ error: 'Use the Paintball room joining link.' }, 400);
      }
      const svg = await QRCode.toString(join.href, { type: 'svg', errorCorrectionLevel: 'M', margin: 4, width: 340 });
      return new Response(svg, { headers: { ...headers, 'Content-Type': 'image/svg+xml; charset=utf-8' } });
    }
    if (!ns) return json({ error: 'The Paintball room service is unavailable.' }, 503);
    if (path === '/rooms' && request.method === 'POST') {
      await readBody(request);
      if (!allowCreation(request.headers.get('CF-Connecting-IP') || 'local', Date.now())) {
        return json({ error: 'Too many new rooms. Try again later.' }, 429);
      }
      for (let i = 0; i < 10; i++) {
        const pin = String(randomInt(10000, 100000));
        const response = await ns.get(ns.idFromName(pin)).fetch('https://room/create', {
          method: 'POST', body: pin,
        });
        if (response.status !== 409) return response;
      }
      return json({ error: 'Could not allocate a PIN. Try again.' }, 503);
    }
    const match = /^\/rooms\/(\d{5})\/(join|teams|socket)$/.exec(path);
    if (!match) return json({ error: 'Unknown Paintball route.' }, 404);
    const [, pin, op] = match;
    if (request.method !== (op === 'join' ? 'POST' : 'GET')) return json({ error: 'Method not allowed.' }, 405);
    if (op === 'socket' && request.headers.get('upgrade')?.toLowerCase() !== 'websocket') {
      return json({ error: 'Open a WebSocket connection.' }, 426);
    }
    return await ns.get(ns.idFromName(pin)).fetch(request);
  } catch (error) {
    if (error.status) return json({ error: error.message }, error.status);
    console.error('Paintball gateway failed', error.message);
    return json({ error: 'The Paintball server could not complete this request.' }, 500);
  }
}
