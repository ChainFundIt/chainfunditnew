ALTER TABLE "impact_hangout_registrations"
ADD COLUMN "short_pitch" text,
ADD COLUMN "story" text,
ADD COLUMN "event_date" timestamp,
ADD COLUMN "event_end_date" timestamp,
ADD COLUMN "timezone" varchar(100),
ADD COLUMN "location_type" varchar(20),
ADD COLUMN "venue_name" varchar(255),
ADD COLUMN "venue_address" text,
ADD COLUMN "meeting_link" text,
ADD COLUMN "impact_tiers_json" text,
ADD COLUMN "faqs_json" text;
