ALTER TABLE `paymentRequests` ADD `paymentStatus` enum('not_sent','sent','paid') DEFAULT 'not_sent' NOT NULL;--> statement-breakpoint
ALTER TABLE `paymentRequests` ADD `paidAt` timestamp;