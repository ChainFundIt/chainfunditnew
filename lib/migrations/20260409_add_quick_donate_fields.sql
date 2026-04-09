ALTER TABLE donations
ADD COLUMN IF NOT EXISTS quick_donate boolean DEFAULT false NOT NULL,
ADD COLUMN IF NOT EXISTS paystack_customer_code varchar(100),
ADD COLUMN IF NOT EXISTS virtual_account_number varchar(20),
ADD COLUMN IF NOT EXISTS virtual_account_bank_name varchar(100),
ADD COLUMN IF NOT EXISTS virtual_account_name varchar(255);
