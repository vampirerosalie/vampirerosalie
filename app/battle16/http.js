import QRCode from 'qrcode';
import { createRoomHandler } from '../rooms/http.js';
import { createRoomPersistence } from '../rooms/persistence.js';
import { SasteraGame, stationHref } from './game.js';
import { printedStationHref } from './station-cards.js';

const { RoomStore } = createRoomPersistence('sastera', SasteraGame);
const roomRequest = createRoomHandler({ namespace: 'sastera', battle: 16, Store: RoomStore });

export async function handleSasteraRequest(request, db, options = {}) {
  const url = new URL(request.url);
  const match = /^\/api\/sastera\/(?:rooms\/(\d{5})\/)?stations\/([1-4])\/qr\.svg$/.exec(url.pathname);
  if (!match) return roomRequest(request, db, options);
  if (request.method !== 'GET') return new Response(null, { status: 405, headers: { Allow: 'GET' } });
  const [, pin, number] = match;
  const station = Number(number);
  const code = url.searchParams.get('code');
  if (pin && !/^[a-f0-9]{32}$/.test(code ?? '')) return new Response(null, { status: 400 });
  const href = pin ? stationHref(pin, station, code) : printedStationHref(station);
  const svg = await QRCode.toString(url.origin + href, { type: 'svg', errorCorrectionLevel: 'M', margin: 4, width: 440 });
  return new Response(svg, { headers: { 'content-type': 'image/svg+xml; charset=utf-8', 'cache-control': pin ? 'private, max-age=3600' : 'public, max-age=86400',
    'x-content-type-options': 'nosniff', 'referrer-policy': 'no-referrer', 'content-security-policy': "default-src 'none'; frame-ancestors 'none'" } });
}
