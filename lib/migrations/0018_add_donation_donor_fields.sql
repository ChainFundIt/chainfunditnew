--> statement-breakpoint
ALTER TABLE "donations" ADD COLUMN IF NOT EXISTS "donor_name" varchar(255);

--> statement-breakpoint
ALTER TABLE "donations" ADD COLUMN IF NOT EXISTS "donor_email" varchar(255);

--> statement-breakpoint
ALTER TABLE "donations" ADD COLUMN IF NOT EXISTS "donor_phone" varchar(50);


