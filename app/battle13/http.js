import { createRoomHandler } from '../rooms/http.js';
import { TerritoryD1Store } from './d1-store.js';
import { setList } from './sets.js';

export const handleTerritoryRequest = createRoomHandler({
  namespace: 'territory', battle: 13, Store: TerritoryD1Store, setList,
});
