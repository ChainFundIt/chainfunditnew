-- Add Stripe Connect account fields to users table
ALTER TABLE users ADD COLUMN IF NOT EXISTS stripe_account_id VARCHAR(255);
ALTER TABLE users ADD COLUMN IF NOT EXISTS stripe_account_ready BOOLEAN DEFAULT FALSE;
ALTER TABLE users ADD COLUMN IF NOT EXISTS stripe_account_onboarded_at TIMESTAMP;

-- Add index for Stripe account queries
CREATE INDEX IF NOT EXISTS users_stripe_account_id_idx ON users(stripe_account_id);

