ALTER TABLE "impact_hangout_registrations" ADD COLUMN "short_pitch" text;--> statement-breakpoint
ALTER TABLE "impact_hangout_registrations" ADD COLUMN "story" text;--> statement-breakpoint
ALTER TABLE "impact_hangout_registrations" ADD COLUMN "event_date" timestamp;--> statement-breakpoint
ALTER TABLE "impact_hangout_registrations" ADD COLUMN "event_end_date" timestamp;--> statement-breakpoint
ALTER TABLE "impact_hangout_registrations" ADD COLUMN "timezone" varchar(100);--> statement-breakpoint
ALTER TABLE "impact_hangout_registrations" ADD COLUMN "location_type" varchar(20);--> statement-breakpoint
ALTER TABLE "impact_hangout_registrations" ADD COLUMN "venue_name" varchar(255);--> statement-breakpoint
ALTER TABLE "impact_hangout_registrations" ADD COLUMN "venue_address" text;--> statement-breakpoint
ALTER TABLE "impact_hangout_registrations" ADD COLUMN "meeting_link" text;--> statement-breakpoint
ALTER TABLE "impact_hangout_registrations" ADD COLUMN "impact_tiers_json" text;--> statement-breakpoint
ALTER TABLE "impact_hangout_registrations" ADD COLUMN "faqs_json" text;