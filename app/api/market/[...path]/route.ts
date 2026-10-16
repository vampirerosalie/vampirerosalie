import { env } from 'cloudflare:workers';
import { handleMarketRequest } from '../../../battle9/http.js';
import bank from '../../../battle9/data/questions.json';
import lots from '../../../battle9/data/lots.json';

export const dynamic = 'force-dynamic';
const handle = (request: Request) => handleMarketRequest(request, env.DB, { bank, lots });
export const GET = handle;
export const POST = handle;
export const PUT = handle;
export const PATCH = handle;
export const DELETE = handle;
export const OPTIONS = handle;
