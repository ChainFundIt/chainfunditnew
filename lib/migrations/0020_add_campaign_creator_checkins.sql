-- Track campaign creator check-in emails (days 2, 5, 7)
CREATE TABLE IF NOT EXISTS "campaign_creator_checkins" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "campaign_id" uuid NOT NULL,
  "user_id" uuid NOT NULL,
  "day" integer NOT NULL,
  "sent_at" timestamp DEFAULT now() NOT NULL,
  CONSTRAINT "campaign_creator_checkins_campaign_day_unique" UNIQUE("campaign_id", "day")
);

