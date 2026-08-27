ALTER TABLE `paymentRequests` ADD `businessName` varchar(160);--> statement-breakpoint
ALTER TABLE `paymentRequests` ADD `phone` varchar(40);--> statement-breakpoint
ALTER TABLE `paymentRequests` ADD `billingCycle` enum('monthly','yearly') DEFAULT 'monthly' NOT NULL;--> statement-breakpoint
ALTER TABLE `subscriptions` ADD `billingCycle` enum('monthly','yearly') DEFAULT 'monthly' NOT NULL;--> statement-breakpoint
ALTER TABLE `subscriptions` ADD `validUntil` timestamp;