import { MenitiGame } from './game.js';
import { createRoomPersistence } from '../rooms/persistence.js';

export const { RoomStore: MenitiStore } = createRoomPersistence('meniti', MenitiGame);
