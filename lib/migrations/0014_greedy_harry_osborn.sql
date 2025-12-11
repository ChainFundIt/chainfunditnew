ALTER TABLE "donations" ADD COLUMN "converted_amount" numeric(10, 2);--> statement-breakpoint
ALTER TABLE "donations" ADD COLUMN "converted_currency" varchar(3);--> statement-breakpoint
ALTER TABLE "donations" ADD COLUMN "exchange_rate" numeric(15, 6);--> statement-breakpoint
ALTER TABLE "donations" ADD COLUMN "exchange_rate_date" timestamp;