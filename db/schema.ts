import { index, integer, primaryKey, sqliteTable, text, uniqueIndex } from 'drizzle-orm/sqlite-core';

export const rooms = sqliteTable('rooms', {
  roomId: text('room_id').primaryKey(),
  teacherToken: text('teacher_token').notNull(),
  phase: text('phase').notNull().default('lobby'),
  battle: integer('battle').notNull().default(1),
  questionIndex: integer('question_index').notNull().default(0),
  endsAt: integer('ends_at').notNull().default(0),
  updatedAt: integer('updated_at').notNull(),
});

export const players = sqliteTable('players', {
  roomId: text('room_id').notNull(),
  clientId: text('client_id').notNull(),
  name: text('name').notNull(),
  score: integer('score').notNull().default(0),
  lastSeen: integer('last_seen').notNull(),
  answeredQuestion: integer('answered_question'),
}, (table) => [
  primaryKey({ columns: [table.roomId, table.clientId] }),
  index('idx_players_room_seen').on(table.roomId, table.lastSeen),
]);

export const answers = sqliteTable('answers', {
  roomId: text('room_id').notNull(),
  questionIndex: integer('question_index').notNull(),
  clientId: text('client_id').notNull(),
  messageId: text('message_id').notNull(),
  name: text('name').notNull(),
  answer: text('answer').notNull(),
  submittedAt: integer('submitted_at').notNull(),
  correct: integer('correct', { mode: 'boolean' }).notNull(),
  scoreEarned: integer('score_earned').notNull(),
}, (table) => [
  primaryKey({ columns: [table.roomId, table.questionIndex, table.clientId] }),
  uniqueIndex('idx_answers_message_id').on(table.messageId),
]);

export const boardGames = sqliteTable('board_games', {
  roomId: text('room_id').primaryKey(),
  stateJson: text('state_json').notNull(),
  updatedAt: integer('updated_at').notNull(),
});

export const boardMembers = sqliteTable('board_members', {
  roomId: text('room_id').notNull(),
  clientId: text('client_id').notNull(),
  teamIndex: integer('team_index').notNull(),
  lastSeen: integer('last_seen').notNull(),
}, (table) => [
  primaryKey({ columns: [table.roomId, table.clientId] }),
  index('idx_board_members_room_seen').on(table.roomId, table.lastSeen),
]);

export const boardAnswers = sqliteTable('board_answers', {
  roomId: text('room_id').notNull(),
  questionId: text('question_id').notNull(),
  teamIndex: integer('team_index').notNull(),
  answer: text('answer').notNull(),
  submittedAt: integer('submitted_at').notNull(),
  verdict: text('verdict'),
}, (table) => [
  primaryKey({ columns: [table.roomId, table.questionId, table.teamIndex] }),
]);

// Battle 7 is intentionally isolated from the room and board tables above.
export const kitchenRooms = sqliteTable('kitchen_rooms', {
  pin: text('pin').primaryKey(),
  stateJson: text('state_json').notNull(),
  roomSecret: text('room_secret').notNull(),
  version: integer('version').notNull(),
  expiresAt: integer('expires_at').notNull(),
  updatedAt: integer('updated_at').notNull(),
}, (table) => [
  index('idx_kitchen_rooms_expiry').on(table.expiresAt),
]);

export const kitchenPresence = sqliteTable('kitchen_presence', {
  pin: text('pin').notNull().references(() => kitchenRooms.pin, { onDelete: 'cascade' }),
  teamId: text('team_id').notNull(),
  lastSeen: integer('last_seen').notNull(),
}, (table) => [
  primaryKey({ columns: [table.pin, table.teamId] }),
]);
