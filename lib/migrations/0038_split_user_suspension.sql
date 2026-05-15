ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "suspended_at" timestamp;
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "suspended_reason" text;
CREATE INDEX IF NOT EXISTS "users_suspended_at_idx" ON "users" ("suspended_at");
