-- Add currency field to commission_payouts table for multi-currency support
ALTER TABLE commission_payouts ADD COLUMN IF NOT EXISTS currency VARCHAR(3) DEFAULT 'USD';

-- Add index for currency queries
CREATE INDEX IF NOT EXISTS commission_payouts_currency_idx ON commission_payouts(currency);

-- Update existing records to have USD as default currency if null
UPDATE commission_payouts SET currency = 'USD' WHERE currency IS NULL;

