CREATE TABLE `brandProfiles` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`name` varchar(120) NOT NULL,
	`industry` varchar(120),
	`services` text,
	`audience` text,
	`strengths` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `brandProfiles_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `draftHistories` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`brandId` int NOT NULL,
	`title` text NOT NULL,
	`intro` text NOT NULL,
	`body` text NOT NULL,
	`ending` text NOT NULL,
	`hashtags` text NOT NULL,
	`keywords` text NOT NULL,
	`seoScore` int NOT NULL DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `draftHistories_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `subscriptions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`plan` varchar(40) NOT NULL,
	`creditsTotal` int NOT NULL,
	`creditsUsed` int NOT NULL DEFAULT 0,
	`status` enum('active','pending','failed') NOT NULL DEFAULT 'active',
	`paymentProvider` varchar(40),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `subscriptions_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `toneProfiles` (
	`id` int AUTO_INCREMENT NOT NULL,
	`brandId` int NOT NULL,
	`sampleCount` int NOT NULL DEFAULT 0,
	`profileJson` text NOT NULL,
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `toneProfiles_id` PRIMARY KEY(`id`)
);
