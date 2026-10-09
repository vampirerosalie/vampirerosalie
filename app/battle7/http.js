import QRCode from 'qrcode';
import { createHash } from 'node:crypto';
import { GameError } from './core/game.js';
import { KitchenD1Store } from './d1-store.js';

const MAX_BODY_BYTES = 8192;
const rates = new Map();

// This is only an isolate-local burst guard, not a distributed quota. Gameplay
// correctness and the 100-active-room cap are always enforced in D1.
function limit(key, maximum, windowMs, now) {
  if (rates.size > 10000) {
    for (const [id, rate] of rates) if (rate.until <= now) rates.delete(id);
    if (rates.size > 10000) rates.clear();
  }
  let rate = rates.get(key);
  if (!rate || rate.until <= now) rates.set(key, rate = { count: 0, until: now + windowMs });
  if (++rate.count > maximum) throw new GameError('Too many requests. Please wait a moment and try again.', 'RATE_LIMIT', 429);
}

const baseHeaders = {
  'Cache-Control': 'no-store',
  'X-Content-Type-Options': 'nosniff',
  'Referrer-Policy': 'no-referrer',
  'Content-Security-Policy': "default-src 'none'; frame-ancestors 'none'",
};

function json(data, status = 200) {
  return Response.json(data, {
    status,
    headers: { ...baseHeaders, ...(status === 429 || status === 503 ? { 'Retry-After': '1' } : {}) },
  });
}

/** Read a byte-bounded JSON object, including when Content-Length is absent. */
export async function readBody(request) {
  if (!/^application\/json(?:\s*;|\s*$)/i.test(request.headers.get('content-type') ?? '')) {
    throw new GameError('Use application/json.', 'BAD_CONTENT_TYPE', 415);
  }
  if (Number(request.headers.get('content-length')) > MAX_BODY_BYTES) throw new GameError('Request too large.', 'TOO_LARGE', 413);
  const reader = request.body?.getReader();
  const chunks = [];
  let total = 0;
  if (reader) {
    try {
      while (true) {
        const { value, done } = await reader.read();
        if (done) break;
        total += value.byteLength;
        if (total > MAX_BODY_BYTES) {
          await reader.cancel();
          throw new GameError('Request too large.', 'TOO_LARGE', 413);
        }
        chunks.push(value);
      }
    } finally {
      reader.releaseLock();
    }
  }
  const bytes = new Uint8Array(total);
  let offset = 0;
  for (const chunk of chunks) { bytes.set(chunk, offset); offset += chunk.byteLength; }
  let body;
  try { body = JSON.parse(new TextDecoder().decode(bytes) || '{}'); }
  catch { throw new GameError('Invalid JSON.', 'INVALID_JSON'); }
  if (!body || typeof body !== 'object' || Array.isArray(body)) throw new GameError('Use a JSON object.', 'INVALID_JSON');
  return body;
}

function links(state, origin) {
  return {
    ...state,
    joinUrl: `${origin}/?battle=7&join=${state.pin}`,
    projectorUrl: `${origin}/?battle=7&screen=${state.pin}`,
  };
}

/**
 * @param {Request} request
 * @param {D1Database} db
 * @param {{ questions: object[], now?: () => number, random?: (max: number) => number, sleep?: (ms: number) => Promise<void>, maxAttempts?: number }} options
 */
export async function handleKitchenRequest(request, db, { questions, now = Date.now, random, sleep, maxAttempts } = {}) {
  try {
    const url = new URL(request.url);
    const ip = request.headers.get('cf-connecting-ip') ?? 'local';
    const time = now();
    if (request.method === 'POST') {
      const origin = request.headers.get('origin');
      if ((origin && origin !== url.origin) || request.headers.get('sec-fetch-site') === 'cross-site') {
        throw new GameError('Cross-site requests are not allowed.', 'CROSS_ORIGIN', 403);
      }
      limit(`post:${ip}`, 1500, 60000, time);
    }
    if (!db) throw new GameError('The kitchen database is unavailable. Please try again.', 'DATABASE_UNAVAILABLE', 503);
    const store = new KitchenD1Store(db, { questions, now, random, sleep, maxAttempts });
    if (url.pathname === '/api/kitchen/health' && request.method === 'GET') {
      return json({ ok: true, service: 'crazy-kitchen', battle: 7 });
    }
    if (url.pathname === '/api/kitchen/rooms') {
      if (request.method !== 'POST') throw new GameError('Method not allowed.', 'METHOD_NOT_ALLOWED', 405);
      limit(`create:${ip}`, 20, 3600000, time);
      return json(await store.create(await readBody(request)), 201);
    }
    const match = url.pathname.match(/^\/api\/kitchen\/rooms\/(\d{5})\/(join|state|action|qr\.svg)$/);
    if (!match) throw new GameError('Not found.', 'NOT_FOUND', 404);
    const [, pin, op] = match;
    const authorization = request.headers.get('authorization');
    let token;
    if (authorization) {
      if (!/^Bearer [a-f0-9]{64}$/.test(authorization)) throw new GameError('This device key is invalid. Rejoin the kitchen.', 'UNAUTHORIZED', 401);
      token = authorization.slice(7);
    }
    if (op === 'join' && request.method === 'POST') return json(await store.join(pin, await readBody(request)));
    if (op === 'state' && request.method === 'GET') {
      limit(`read:${ip}`, 2500, 60000, time);
      return json(links(await store.state(pin, token), url.origin));
    }
    if (op === 'action' && request.method === 'POST') {
      if (token) limit(`token:${createHash('sha256').update(token).digest('hex')}`, 180, 60000, time);
      const result = await store.action(pin, token, await readBody(request));
      result.state = links(result.state, url.origin);
      return json(result);
    }
    if (op === 'qr.svg' && request.method === 'GET') {
      await store.load(pin);
      const svg = await QRCode.toString(`${url.origin}/?battle=7&join=${pin}`, {
        type: 'svg', errorCorrectionLevel: 'M', margin: 3, width: 300,
        color: { dark: '#123d32', light: '#ffffff' },
      });
      return new Response(svg, { headers: { ...baseHeaders, 'Content-Type': 'image/svg+xml; charset=utf-8' } });
    }
    throw new GameError('Method not allowed.', 'METHOD_NOT_ALLOWED', 405);
  } catch (error) {
    if (error instanceof GameError) return json({ error: error.message, code: error.code }, error.status);
    // Do not log bodies, saved state, or credentials. A caller can safely retry
    // an uncertain action using its original requestId; D1 owns the receipt.
    console.error('Kitchen request failed:', error instanceof Error ? error.message : 'Unknown error');
    return json({ error: 'The kitchen server hit a problem. Please try again.', code: 'SERVER_ERROR' }, 500);
  }
}
