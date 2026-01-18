-- Add notify_on_campaign_created column to admin_settings table
ALTER TABLE "admin_settings" ADD COLUMN "notify_on_campaign_created" boolean DEFAULT true NOT NULL;

