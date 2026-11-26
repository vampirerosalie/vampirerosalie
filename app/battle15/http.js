import { createRoomHandler } from '../rooms/http.js';
import { MenitiStore } from './d1-store.js';

export const handleMenitiRequest = createRoomHandler({
  namespace: 'meniti', battle: 15, Store: MenitiStore, tickBeforeReview: true,
});
