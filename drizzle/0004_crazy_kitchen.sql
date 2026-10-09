-- Battle 7 only. Idempotent to coexist with first-request table bootstrap.
CREATE TABLE IF NOT EXISTS `kitchen_presence` (
	`pin` text NOT NULL,
	`team_id` text NOT NULL,
	`last_seen` integer NOT NULL,
	PRIMARY KEY(`pin`, `team_id`),
	FOREIGN KEY (`pin`) REFERENCES `kitchen_rooms`(`pin`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS `kitchen_rooms` (
	`pin` text PRIMARY KEY NOT NULL,
	`state_json` text NOT NULL,
	`room_secret` text NOT NULL,
	`version` integer NOT NULL,
	`expires_at` integer NOT NULL,
	`updated_at` integer NOT NULL
);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS `idx_kitchen_rooms_expiry` ON `kitchen_rooms` (`expires_at`);