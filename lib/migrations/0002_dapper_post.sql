CREATE TABLE "accounts" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"type" varchar(255) NOT NULL,
	"provider" varchar(255) NOT NULL,
	"provider_account_id" varchar(255) NOT NULL,
	"refresh_token" text,
	"access_token" text,
	"expires_at" integer,
	"token_type" varchar(255),
	"scope" varchar(255),
	"id_token" text,
	"session_state" varchar(255)
);
--> statement-breakpoint
CREATE TABLE "sessions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"session_token" varchar(255) NOT NULL,
	"user_id" uuid NOT NULL,
	"expires" timestamp NOT NULL,
	CONSTRAINT "sessions_session_token_unique" UNIQUE("session_token")
);
--> statement-breakpoint
CREATE TABLE "verification_tokens" (
	"identifier" varchar(255) NOT NULL,
	"token" varchar(255) NOT NULL,
	"expires" timestamp NOT NULL,
	CONSTRAINT "verification_tokens_token_unique" UNIQUE("token")
);
--> statement-breakpoint
CREATE TABLE "phone_otps" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"phone" varchar(20) NOT NULL,
	"otp" varchar(10) NOT NULL,
	"expires_at" timestamp NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "campaigns" ALTER COLUMN "goal_amount" SET DATA TYPE numeric(15, 2);--> statement-breakpoint
ALTER TABLE "campaigns" ALTER COLUMN "currency" SET DATA TYPE varchar(50);--> statement-breakpoint
ALTER TABLE "campaigns" ALTER COLUMN "minimum_donation" SET DATA TYPE numeric(15, 2);--> statement-breakpoint
ALTER TABLE "campaigns" ALTER COLUMN "current_amount" SET DATA TYPE numeric(15, 2);--> statement-breakpoint
ALTER TABLE "campaigns" ALTER COLUMN "current_amount" SET DEFAULT '0';--> statement-breakpoint
ALTER TABLE "campaigns" ADD COLUMN "slug" varchar(255) NOT NULL;--> statement-breakpoint
ALTER TABLE "campaigns" ADD COLUMN "subtitle" varchar(255);--> statement-breakpoint
ALTER TABLE "campaigns" ADD COLUMN "reason" varchar(100);--> statement-breakpoint
ALTER TABLE "campaigns" ADD COLUMN "fundraising_for" varchar(100);--> statement-breakpoint
ALTER TABLE "campaigns" ADD COLUMN "duration" varchar(50);--> statement-breakpoint
ALTER TABLE "campaigns" ADD COLUMN "video_url" varchar(255);--> statement-breakpoint
ALTER TABLE "campaigns" ADD COLUMN "cover_image_url" varchar(255);--> statement-breakpoint
ALTER TABLE "campaigns" ADD COLUMN "gallery_images" text;--> statement-breakpoint
ALTER TABLE "campaigns" ADD COLUMN "documents" text;--> statement-breakpoint
ALTER TABLE "donations" ADD COLUMN "retry_attempts" integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE "donations" ADD COLUMN "failure_reason" varchar(255);--> statement-breakpoint
ALTER TABLE "donations" ADD COLUMN "last_status_update" timestamp DEFAULT now() NOT NULL;--> statement-breakpoint
ALTER TABLE "donations" ADD COLUMN "provider_status" varchar(50);--> statement-breakpoint
ALTER TABLE "donations" ADD COLUMN "provider_error" text;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "has_completed_profile" boolean DEFAULT false;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "has_seen_welcome_modal" boolean DEFAULT false;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "instagram" varchar(255);--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "facebook" varchar(255);--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "linkedin" varchar(255);--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "twitter" varchar(255);--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "tiktok" varchar(255);--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "youtube" varchar(255);--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "bio" text;--> statement-breakpoint
CREATE INDEX "email_otps_email_idx" ON "email_otps" USING btree ("email");--> statement-breakpoint
CREATE INDEX "email_otps_expires_idx" ON "email_otps" USING btree ("expires_at");--> statement-breakpoint
CREATE INDEX "email_otps_email_otp_idx" ON "email_otps" USING btree ("email","otp");--> statement-breakpoint
CREATE INDEX "users_email_idx" ON "users" USING btree ("email");--> statement-breakpoint
CREATE INDEX "users_phone_idx" ON "users" USING btree ("phone");--> statement-breakpoint
CREATE INDEX "users_verified_idx" ON "users" USING btree ("is_verified");--> statement-breakpoint
ALTER TABLE "campaigns" ADD CONSTRAINT "campaigns_slug_unique" UNIQUE("slug");