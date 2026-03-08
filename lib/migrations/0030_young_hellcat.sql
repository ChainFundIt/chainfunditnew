ALTER TABLE "impact_hangout_registrations" ADD COLUMN "event_type" varchar(100);--> statement-breakpoint
ALTER TABLE "impact_hangout_registrations" ADD COLUMN "hangout_name" varchar(255);--> statement-breakpoint
ALTER TABLE "impact_hangout_registrations" ADD COLUMN "fundraising_goal_ngn" integer;--> statement-breakpoint
ALTER TABLE "impact_hangout_registrations" ADD COLUMN "commitment_amount_ngn" integer;--> statement-breakpoint
ALTER TABLE "impact_hangout_registrations" ADD COLUMN "milestone_25_sent_at" timestamp;--> statement-breakpoint
ALTER TABLE "impact_hangout_registrations" ADD COLUMN "milestone_50_sent_at" timestamp;--> statement-breakpoint
ALTER TABLE "impact_hangout_registrations" ADD COLUMN "milestone_75_sent_at" timestamp;--> statement-breakpoint
ALTER TABLE "impact_hangout_registrations" ADD COLUMN "milestone_100_sent_at" timestamp;--> statement-breakpoint
ALTER TABLE "impact_hangout_registrations" ADD COLUMN "reminder_5min_sent_at" timestamp;--> statement-breakpoint
ALTER TABLE "impact_hangout_registrations" ADD COLUMN "reminder_1day_sent_at" timestamp;--> statement-breakpoint
ALTER TABLE "impact_hangout_registrations" ADD COLUMN "reminder_5days_sent_at" timestamp;