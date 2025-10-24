-- Migration: Add role field to users table
-- This adds role-based access control to the users table

-- Add role column with default 'user'
ALTER TABLE "users" ADD COLUMN "role" varchar(20) DEFAULT 'user';

-- Create index for role field for efficient queries
CREATE INDEX "users_role_idx" ON "users" USING btree ("role");

-- Update existing users to have 'user' role (explicitly set)
UPDATE "users" SET "role" = 'user' WHERE "role" IS NULL;
