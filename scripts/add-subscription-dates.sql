-- Add subscription start and end date columns to promotion_accounts
ALTER TABLE promotion_accounts
ADD COLUMN IF NOT EXISTS subscription_start_date DATE,
ADD COLUMN IF NOT EXISTS subscription_end_date DATE;

