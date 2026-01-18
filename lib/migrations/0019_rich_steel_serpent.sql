CREATE TABLE "campaign_creator_checkins" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"campaign_id" uuid NOT NULL,
	"user_id" uuid NOT NULL,
	"day" integer NOT NULL,
	"sent_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "admin_settings" ADD COLUMN "notify_on_campaign_created" boolean DEFAULT true NOT NULL;--> statement-breakpoint
CREATE UNIQUE INDEX "campaign_creator_checkins_campaign_day_unique" ON "campaign_creator_checkins" USING btree ("campaign_id","day");