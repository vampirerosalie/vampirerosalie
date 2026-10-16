import QRCode from 'qrcode';
import { createHash } from 'node:crypto';
import { GameError } from './core/game.js';
import { MarketD1Store } from './d1-store.js';

const MAX_BODY_BYTES = 8192;
const rates = new Map();
function limit(key, maximum, windowMs, now) {
  if (rates.size > 10000) { for (const [id, rate] of rates) if (rate.until <= now) rates.delete(id); if (rates.size > 10000) rates.clear(); }
  let rate = rates.get(key); if (!rate || rate.until <= now) rates.set(key, rate = { count: 0, until: now + windowMs });
  if (++rate.count > maximum) throw new GameError('Too many requests. Wait a moment and retry.', 'RATE_LIMIT', 429);
}
const headers = { 'Cache-Control': 'no-store', 'X-Content-Type-Options': 'nosniff', 'Referrer-Policy': 'no-referrer',
  'Content-Security-Policy': "default-src 'none'; frame-ancestors 'none'" };
const json = (data, status = 200) => Response.json(data, { status, headers: { ...headers, ...(status === 429 || status === 503 ? { 'Retry-After': '1' } : {}) } });

export async function readBody(request) {
  if (!/^application\/json(?:\s*;|\s*$)/i.test(request.headers.get('content-type') ?? '')) throw new GameError('Use application/json.', 'BAD_CONTENT_TYPE', 415);
  if (Number(request.headers.get('content-length')) > MAX_BODY_BYTES) throw new GameError('Request too large.', 'TOO_LARGE', 413);
  const reader = request.body?.getReader(), chunks = []; let bytes = 0;
  if (reader) { try { while (true) { const { value, done } = await reader.read(); if (done) break; bytes += value.byteLength; if (bytes > MAX_BODY_BYTES) { await reader.cancel(); throw new GameError('Request too large.', 'TOO_LARGE', 413); } chunks.push(value); } } finally { reader.releaseLock(); } }
  const collected = new Uint8Array(bytes); let offset = 0; for (const chunk of chunks) { collected.set(chunk, offset); offset += chunk.byteLength; }
  let body; try { body = JSON.parse(new TextDecoder().decode(collected) || '{}'); } catch { throw new GameError('Invalid JSON.', 'INVALID_JSON'); }
  if (!body || typeof body !== 'object' || Array.isArray(body)) throw new GameError('Use a JSON object.', 'INVALID_JSON');
  return body;
}
const links = (state, origin) => ({ ...state, joinUrl: `${origin}/battle9/index.html?join=${state.pin}`,
  projectorUrl: `${origin}/battle9/index.html?screen=${state.pin}` });

/** @param {Request} request
 * @param {unknown} db
 * @param {{bank: object, lots: object, now?: () => number, random?: (max: number) => number, sleep?: (ms: number) => Promise<void>, maxAttempts?: number}} options
 */
export async function handleMarketRequest(request, db, { bank, lots, now = Date.now, random, sleep, maxAttempts }) {
  try {
    const url = new URL(request.url), ip = request.headers.get('cf-connecting-ip') ?? 'local', time = now();
    if (request.method === 'POST') {
      const origin = request.headers.get('origin');
      if ((origin && origin !== url.origin) || request.headers.get('sec-fetch-site') === 'cross-site') throw new GameError('Cross-site requests are not allowed.', 'CROSS_ORIGIN', 403);
      limit(`market-post:${ip}`, 1500, 60000, time);
    }
    if (!db) throw new GameError('The room database is unavailable. Please try again.', 'DATABASE_UNAVAILABLE', 503);
    const store = new MarketD1Store(db, { bank, lots, now, random, sleep, maxAttempts });
    if (url.pathname === '/api/market/health' && request.method === 'GET') return json({ ok: true, battle: 9 });
    if (url.pathname === '/api/market/rooms') {
      if (request.method !== 'POST') throw new GameError('Method not allowed.', 'METHOD_NOT_ALLOWED', 405);
      limit(`market-create:${ip}`, 20, 3600000, time);
      return json(await store.create(await readBody(request)), 201);
    }
    const match = url.pathname.match(/^\/api\/market\/rooms\/(\d{5})\/(join|state|action|qr\.svg)$/);
    if (!match) throw new GameError('Not found.', 'NOT_FOUND', 404);
    const [, pin, operation] = match;
    const authorization = request.headers.get('authorization'); let token;
    if (authorization) { if (!/^Bearer [a-f0-9]{64}$/.test(authorization)) throw new GameError('Invalid device key.', 'UNAUTHORIZED', 401); token = authorization.slice(7); }
    if (operation === 'join' && request.method === 'POST') return json(await store.join(pin, await readBody(request)));
    if (operation === 'state' && request.method === 'GET') { limit(`market-read:${ip}`, 6000, 60000, time); return json(links(await store.state(pin, token), url.origin)); }
    if (operation === 'action' && request.method === 'POST') {
      if (token) limit(`market-token:${createHash('sha256').update(token).digest('hex')}`, 240, 60000, time);
      const result = await store.action(pin, token, await readBody(request)); result.state = links(result.state, url.origin); return json(result);
    }
    if (operation === 'qr.svg' && request.method === 'GET') {
      await store.load(pin);
      const svg = await QRCode.toString(`${url.origin}/battle9/index.html?join=${pin}`, { type: 'svg', errorCorrectionLevel: 'M', margin: 3, width: 320, color: { dark: '#173c34', light: '#fff7e7' } });
      return new Response(svg, { headers: { ...headers, 'Content-Type': 'image/svg+xml; charset=utf-8' } });
    }
    throw new GameError('Method not allowed.', 'METHOD_NOT_ALLOWED', 405);
  } catch (error) {
    if (error instanceof GameError) return json({ error: error.message, code: error.code }, error.status);
    console.error('Market request failed:', error instanceof Error ? error.message : 'Unknown error');
    return json({ error: 'The room server hit a problem. Please retry.', code: 'SERVER_ERROR' }, 500);
  }
}
