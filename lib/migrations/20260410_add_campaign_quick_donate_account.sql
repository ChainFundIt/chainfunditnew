ALTER TABLE campaigns
ADD COLUMN IF NOT EXISTS quick_donate_customer_code varchar(100),
ADD COLUMN IF NOT EXISTS quick_donate_account_number varchar(20),
ADD COLUMN IF NOT EXISTS quick_donate_bank_name varchar(100),
ADD COLUMN IF NOT EXISTS quick_donate_account_name varchar(255);
