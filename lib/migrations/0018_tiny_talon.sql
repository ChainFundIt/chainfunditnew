ALTER TABLE "admin_settings" ALTER COLUMN "push_notifications_enabled" SET DEFAULT true;--> statement-breakpoint
ALTER TABLE "admin_settings" ALTER COLUMN "daily_summary_enabled" SET DEFAULT true;--> statement-breakpoint
ALTER TABLE "user_preferences" ALTER COLUMN "daily_summary_enabled" SET DEFAULT true;