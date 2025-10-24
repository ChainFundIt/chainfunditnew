CREATE TABLE "user_preferences" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"email_notifications_enabled" boolean DEFAULT true NOT NULL,
	"notification_email" varchar(255),
	"notify_on_charity_donation" boolean DEFAULT false NOT NULL,
	"notify_on_campaign_donation" boolean DEFAULT true NOT NULL,
	"notify_on_payout_request" boolean DEFAULT true NOT NULL,
	"notify_on_large_donation" boolean DEFAULT true NOT NULL,
	"large_donation_threshold" varchar(20) DEFAULT '1000',
	"push_notifications_enabled" boolean DEFAULT false NOT NULL,
	"push_subscription" jsonb,
	"daily_summary_enabled" boolean DEFAULT false NOT NULL,
	"weekly_summary_enabled" boolean DEFAULT true NOT NULL,
	"summary_time" varchar(10) DEFAULT '09:00',
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "user_preferences_user_id_unique" UNIQUE("user_id")
);
