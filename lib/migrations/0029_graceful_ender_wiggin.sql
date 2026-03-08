ALTER TABLE "impact_hangout_registrations" ADD COLUMN "payment_status" varchar(20) DEFAULT 'pending' NOT NULL;--> statement-breakpoint
ALTER TABLE "impact_hangout_registrations" ADD COLUMN "payment_reference" varchar(100);--> statement-breakpoint
ALTER TABLE "impact_hangout_registrations" ADD COLUMN "paid_at" timestamp;