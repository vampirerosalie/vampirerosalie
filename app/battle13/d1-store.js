import { TerritoryGame } from './game.js';
import { createRoomPersistence } from '../rooms/persistence.js';

export const {
  RoomStore: TerritoryD1Store, ensureSchema: ensureTerritorySchema, schema: TERRITORY_SCHEMA,
} = createRoomPersistence('territory', TerritoryGame);
