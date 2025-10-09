CREATE TABLE "charities" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(255) NOT NULL,
	"slug" varchar(255) NOT NULL,
	"description" text,
	"mission" text,
	"email" varchar(255),
	"phone" varchar(50),
	"website" varchar(500),
	"address" text,
	"city" varchar(100),
	"state" varchar(100),
	"country" varchar(100),
	"postal_code" varchar(20),
	"registration_number" varchar(100),
	"tax_id" varchar(100),
	"is_verified" boolean DEFAULT false NOT NULL,
	"verified_at" timestamp,
	"category" varchar(100),
	"focus_areas" jsonb,
	"logo" varchar(500),
	"cover_image" varchar(500),
	"images" jsonb,
	"bank_name" varchar(255),
	"account_number" varchar(100),
	"account_name" varchar(255),
	"bank_code" varchar(20),
	"swift_code" varchar(20),
	"iban" varchar(50),
	"total_received" numeric(12, 2) DEFAULT '0' NOT NULL,
	"total_paid_out" numeric(12, 2) DEFAULT '0' NOT NULL,
	"pending_amount" numeric(12, 2) DEFAULT '0' NOT NULL,
	"source_url" varchar(500),
	"scraped_at" timestamp,
	"last_updated" timestamp DEFAULT now() NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"is_paused" boolean DEFAULT false NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "charities_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "charity_donations" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"charity_id" uuid NOT NULL,
	"donor_id" uuid,
	"donor_name" varchar(255),
	"donor_email" varchar(255),
	"amount" numeric(10, 2) NOT NULL,
	"currency" varchar(3) DEFAULT 'USD' NOT NULL,
	"payment_status" varchar(20) DEFAULT 'pending' NOT NULL,
	"payment_method" varchar(50) NOT NULL,
	"payment_intent_id" varchar(255),
	"transaction_id" varchar(255),
	"message" text,
	"is_anonymous" boolean DEFAULT false NOT NULL,
	"payout_status" varchar(20) DEFAULT 'pending' NOT NULL,
	"payout_reference" varchar(255),
	"paid_out_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "charity_payouts" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"charity_id" uuid NOT NULL,
	"amount" numeric(12, 2) NOT NULL,
	"currency" varchar(3) DEFAULT 'USD' NOT NULL,
	"status" varchar(20) DEFAULT 'pending' NOT NULL,
	"payment_method" varchar(50) NOT NULL,
	"reference" varchar(255),
	"bank_name" varchar(255),
	"account_number" varchar(100),
	"account_name" varchar(255),
	"donation_ids" jsonb,
	"failure_reason" text,
	"retry_attempts" numeric(2, 0) DEFAULT '0' NOT NULL,
	"processed_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "campaigns" ADD COLUMN "is_chained" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "campaigns" ADD COLUMN "visibility" varchar(20) DEFAULT 'public' NOT NULL;--> statement-breakpoint
ALTER TABLE "campaigns" ADD COLUMN "goal_reached_at" timestamp;--> statement-breakpoint
ALTER TABLE "campaigns" ADD COLUMN "auto_close_at" timestamp;--> statement-breakpoint
ALTER TABLE "campaigns" ADD COLUMN "expires_at" timestamp;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "account_number" varchar(20);--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "bank_code" varchar(10);--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "bank_name" varchar(100);--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "account_name" varchar(255);--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "account_verified" boolean DEFAULT false;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "account_verification_date" timestamp;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "account_locked" boolean DEFAULT false;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "account_change_requested" boolean DEFAULT false;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "account_change_reason" text;--> statement-breakpoint
ALTER TABLE "charity_donations" ADD CONSTRAINT "charity_donations_charity_id_charities_id_fk" FOREIGN KEY ("charity_id") REFERENCES "public"."charities"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "charity_payouts" ADD CONSTRAINT "charity_payouts_charity_id_charities_id_fk" FOREIGN KEY ("charity_id") REFERENCES "public"."charities"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "users_account_number_idx" ON "users" USING btree ("account_number");--> statement-breakpoint
CREATE INDEX "users_account_verified_idx" ON "users" USING btree ("account_verified");--> statement-breakpoint
CREATE INDEX "users_account_locked_idx" ON "users" USING btree ("account_locked");