-- Add 'pending_cancellation' to allowed subscription_status values
-- This allows us to show a badge when subscription is cancelled but still active

ALTER TABLE promotion_accounts
DROP CONSTRAINT IF EXISTS promotion_accounts_subscription_status_check;

ALTER TABLE promotion_accounts
ADD CONSTRAINT promotion_accounts_subscription_status_check 
CHECK (subscription_status IN ('free', 'active', 'pending_cancellation', 'cancelled', 'expired'));

