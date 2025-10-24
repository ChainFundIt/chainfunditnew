-- Add notify_on_account_change_request column to admin_settings table
ALTER TABLE "admin_settings" ADD COLUMN "notify_on_account_change_request" boolean DEFAULT true NOT NULL;

