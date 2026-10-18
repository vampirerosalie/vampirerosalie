import { env } from 'cloudflare:workers';
import { handleLanternRequest } from '../../../battle10/http.js';

export const dynamic = 'force-dynamic';
const handle = (request: Request) => handleLanternRequest(request, env.DB);
export const GET = handle;
export const POST = handle;
export const PUT = handle;
export const PATCH = handle;
export const DELETE = handle;
export const OPTIONS = handle;
