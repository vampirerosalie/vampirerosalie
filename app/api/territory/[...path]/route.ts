import { env } from 'cloudflare:workers';
import { handleTerritoryRequest } from '../../../battle13/http.js';
export const dynamic = 'force-dynamic';
const handle = (request: Request) => handleTerritoryRequest(request, env.DB);
export const GET=handle;
export const POST=handle;
export const PUT=handle;
export const PATCH=handle;
export const DELETE=handle;
export const OPTIONS=handle;

