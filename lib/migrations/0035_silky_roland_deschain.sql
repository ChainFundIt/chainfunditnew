ALTER TABLE "donations" ADD COLUMN "quick_donate" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "donations" ADD COLUMN "paystack_customer_code" varchar(100);--> statement-breakpoint
ALTER TABLE "donations" ADD COLUMN "virtual_account_number" varchar(20);--> statement-breakpoint
ALTER TABLE "donations" ADD COLUMN "virtual_account_bank_name" varchar(100);--> statement-breakpoint
ALTER TABLE "donations" ADD COLUMN "virtual_account_name" varchar(255);