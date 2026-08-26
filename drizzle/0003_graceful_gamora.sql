CREATE TABLE `paymentRequests` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`plan` varchar(40) NOT NULL,
	`amount` int NOT NULL,
	`payerName` varchar(80) NOT NULL,
	`status` enum('pending','approved','rejected') NOT NULL DEFAULT 'pending',
	`note` text,
	`reviewedBy` int,
	`requestedAt` timestamp NOT NULL DEFAULT (now()),
	`reviewedAt` timestamp,
	CONSTRAINT `paymentRequests_id` PRIMARY KEY(`id`)
);
