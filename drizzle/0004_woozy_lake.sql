ALTER TABLE `usageCounters` DROP INDEX `userPeriodUnique`;--> statement-breakpoint
ALTER TABLE `usageCounters` ADD `brandId` int DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE `usageCounters` ADD CONSTRAINT `userBrandPeriodUnique` UNIQUE(`userId`,`brandId`,`periodKey`);