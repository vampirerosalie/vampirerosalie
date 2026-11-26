import { env } from 'cloudflare:workers';
import { handleSasteraRequest } from '../../../battle16/http.js';

export const dynamic = 'force-dynamic';
const handle = (request: Request) => handleSasteraRequest(request, env.DB);
export { handle as GET, handle as POST, handle as PUT, handle as PATCH, handle as DELETE, handle as OPTIONS };
