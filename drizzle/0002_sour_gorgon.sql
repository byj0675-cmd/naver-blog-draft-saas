CREATE TABLE `usageCounters` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`periodKey` varchar(7) NOT NULL,
	`generationCount` int NOT NULL DEFAULT 0,
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `usageCounters_id` PRIMARY KEY(`id`),
	CONSTRAINT `userPeriodUnique` UNIQUE(`userId`,`periodKey`)
);
--> statement-breakpoint
ALTER TABLE `draftHistories` ADD `regenerationCount` int DEFAULT 0 NOT NULL;