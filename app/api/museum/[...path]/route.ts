import { env } from 'cloudflare:workers';
import { handleMuseumRequest } from '../../../battle11/http.js';

export const dynamic = 'force-dynamic';
const handle = (request: Request) => handleMuseumRequest(request, env.DB);
export const GET = handle;
export const POST = handle;
export const PUT = handle;
export const PATCH = handle;
export const DELETE = handle;
export const OPTIONS = handle;
