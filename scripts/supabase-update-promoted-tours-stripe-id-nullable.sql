-- Update promoted_tours table to allow NULL for stripe_subscription_id
-- This is needed for pending promotions that haven't completed payment yet

-- First, update any existing records that might have issues
-- Then alter the column to allow NULL

ALTER TABLE promoted_tours 
  ALTER COLUMN stripe_subscription_id DROP NOT NULL;

-- Update the comment to reflect that it can be NULL
COMMENT ON COLUMN promoted_tours.stripe_subscription_id IS 'Stripe subscription ID for this promotion. NULL for pending promotions, set when payment is confirmed.';

