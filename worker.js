import classroom from 'vinext/server/app-router-entry';
import { paintballRequest } from './app/battle14/gateway.js';

export { PaintballRoom } from './app/battle14/room.js';

export default {
  fetch(request, env, ctx) {
    if (new URL(request.url).pathname.startsWith('/api/paintball/')) {
      return paintballRequest(request, env);
    }
    return classroom.fetch(request, env, ctx);
  },
};
