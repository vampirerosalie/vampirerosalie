CREATE TABLE `board_answers` (
	`room_id` text NOT NULL,
	`question_id` text NOT NULL,
	`team_index` integer NOT NULL,
	`answer` text NOT NULL,
	`submitted_at` integer NOT NULL,
	`verdict` text,
	PRIMARY KEY(`room_id`, `question_id`, `team_index`)
);
--> statement-breakpoint
CREATE TABLE `board_games` (
	`room_id` text PRIMARY KEY NOT NULL,
	`state_json` text NOT NULL,
	`updated_at` integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE `board_members` (
	`room_id` text NOT NULL,
	`client_id` text NOT NULL,
	`team_index` integer NOT NULL,
	`last_seen` integer NOT NULL,
	PRIMARY KEY(`room_id`, `client_id`)
);
--> statement-breakpoint
CREATE INDEX `idx_board_members_room_seen` ON `board_members` (`room_id`,`last_seen`);