import { env } from 'cloudflare:workers';
import { handleDemolitionRequest } from '../../../battle8/http.js';
import bank from '../../../battle8/data/question-bank.json';

export const dynamic = 'force-dynamic';
const handle = (request: Request) => handleDemolitionRequest(request, env.DB, { bank });
export const GET = handle;
export const POST = handle;
export const PUT = handle;
export const PATCH = handle;
export const DELETE = handle;
export const OPTIONS = handle;
