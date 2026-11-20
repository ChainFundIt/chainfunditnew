CREATE TABLE IF NOT EXISTS "collection_payouts" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"collection_id" uuid NOT NULL,
	"requested_amount" numeric(12, 2) NOT NULL,
	"gross_amount" numeric(12, 2) NOT NULL,
	"fees" numeric(12, 2) DEFAULT 0 NOT NULL,
	"net_amount" numeric(12, 2) NOT NULL,
	"currency" varchar(3) DEFAULT 'USD' NOT NULL,
	"status" varchar(20) DEFAULT 'pending' NOT NULL,
	"payout_provider" varchar(50) NOT NULL,
	"reference" varchar(255),
	"bank_name" varchar(255),
	"account_number" varchar(100),
	"account_name" varchar(255),
	"bank_code" varchar(10),
	"notes" text,
	"rejection_reason" text,
	"approved_by" uuid,
	"approved_at" timestamp,
	"transaction_id" varchar(255),
	"failure_reason" text,
	"retry_attempts" numeric(2, 0) DEFAULT 0 NOT NULL,
	"processed_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
DO $$ BEGIN
	ALTER TABLE "collection_payouts" ADD CONSTRAINT "collection_payouts_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
	WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
	ALTER TABLE "collection_payouts" ADD CONSTRAINT "collection_payouts_collection_id_collections_id_fk" FOREIGN KEY ("collection_id") REFERENCES "public"."collections"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
	WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "collection_payouts_collection_id_idx" ON "collection_payouts" ("collection_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "collection_payouts_status_idx" ON "collection_payouts" ("status");
