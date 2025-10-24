-- Add ambassador management fields to chainers table
ALTER TABLE "chainers" ADD COLUMN "status" varchar(20) DEFAULT 'active' NOT NULL;
ALTER TABLE "chainers" ADD COLUMN "commission_rate" numeric(5, 2) DEFAULT 5.0 NOT NULL;
ALTER TABLE "chainers" ADD COLUMN "is_verified" boolean DEFAULT false NOT NULL;
ALTER TABLE "chainers" ADD COLUMN "notes" text;
ALTER TABLE "chainers" ADD COLUMN "suspended_at" timestamp;
ALTER TABLE "chainers" ADD COLUMN "suspended_reason" text;
ALTER TABLE "chainers" ADD COLUMN "last_activity" timestamp DEFAULT now() NOT NULL;
