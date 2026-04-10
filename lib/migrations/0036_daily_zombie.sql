ALTER TABLE "campaigns" ADD COLUMN "quick_donate_customer_code" varchar(100);--> statement-breakpoint
ALTER TABLE "campaigns" ADD COLUMN "quick_donate_account_number" varchar(20);--> statement-breakpoint
ALTER TABLE "campaigns" ADD COLUMN "quick_donate_bank_name" varchar(100);--> statement-breakpoint
ALTER TABLE "campaigns" ADD COLUMN "quick_donate_account_name" varchar(255);