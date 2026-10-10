import { env } from 'cloudflare:workers';
import { handleKitchenRequest } from '../../../battle7/http.js';
import bank from '../../../battle7/data/question-bank.json';
import bank2 from '../../../battle7/data/question-bank-set2.json';

export const dynamic = 'force-dynamic';

function handle(request: Request) {
  return handleKitchenRequest(request, env.DB, { questions: bank.questions, questionSets: { set2: bank2.questions } });
}

export const GET = handle;
export const POST = handle;
export const PUT = handle;
export const PATCH = handle;
export const DELETE = handle;
export const OPTIONS = handle;
