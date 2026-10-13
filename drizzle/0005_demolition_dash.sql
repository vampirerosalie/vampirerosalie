CREATE TABLE IF NOT EXISTS `demolition_rooms` (
  `pin` text PRIMARY KEY NOT NULL,
  `state_json` text NOT NULL,
  `room_secret` text NOT NULL,
  `version` integer NOT NULL,
  `expires_at` integer NOT NULL,
  `updated_at` integer NOT NULL
);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS `idx_demolition_rooms_expiry` ON `demolition_rooms` (`expires_at`);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS `demolition_presence` (
  `pin` text NOT NULL,
  `team_id` text NOT NULL,
  `last_seen` integer NOT NULL,
  PRIMARY KEY (`pin`, `team_id`),
  FOREIGN KEY (`pin`) REFERENCES `demolition_rooms`(`pin`) ON UPDATE no action ON DELETE cascade
);
