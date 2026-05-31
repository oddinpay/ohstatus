CREATE TABLE `subscribers` (
	`email` text PRIMARY KEY NOT NULL,
	`created_at` integer DEFAULT (unixepoch()) NOT NULL
);
