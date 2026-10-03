CREATE TABLE `answers` (
	`room_id` text NOT NULL,
	`question_index` integer NOT NULL,
	`client_id` text NOT NULL,
	`message_id` text NOT NULL,
	`name` text NOT NULL,
	`answer` text NOT NULL,
	`submitted_at` integer NOT NULL,
	`correct` integer NOT NULL,
	`score_earned` integer NOT NULL,
	PRIMARY KEY(`room_id`, `question_index`, `client_id`)
);
--> statement-breakpoint
CREATE UNIQUE INDEX `idx_answers_message_id` ON `answers` (`message_id`);--> statement-breakpoint
CREATE TABLE `players` (
	`room_id` text NOT NULL,
	`client_id` text NOT NULL,
	`name` text NOT NULL,
	`score` integer DEFAULT 0 NOT NULL,
	`last_seen` integer NOT NULL,
	`answered_question` integer,
	PRIMARY KEY(`room_id`, `client_id`)
);
--> statement-breakpoint
CREATE TABLE `rooms` (
	`room_id` text PRIMARY KEY NOT NULL,
	`teacher_token` text NOT NULL,
	`phase` text DEFAULT 'lobby' NOT NULL,
	`question_index` integer DEFAULT 0 NOT NULL,
	`ends_at` integer DEFAULT 0 NOT NULL,
	`updated_at` integer NOT NULL
);
