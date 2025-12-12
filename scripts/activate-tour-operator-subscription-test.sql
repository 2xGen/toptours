-- SQL script to manually activate a tour operator subscription for testing
-- This simulates a successful Stripe payment for localhost testing

-- Update the subscription to active status
UPDATE tour_operator_subscriptions
SET 
  status = 'active',
  stripe_subscription_id = 'sub_test_' || id::text, -- Placeholder subscription ID for testing
  current_period_start = NOW(),
  current_period_end = CASE 
    WHEN subscription_plan LIKE '%-annual' THEN NOW() + INTERVAL '1 year'
    WHEN subscription_plan LIKE '%-monthly' THEN NOW() + INTERVAL '1 month'
    ELSE NOW() + INTERVAL '1 month'
  END,
  updated_at = NOW()
WHERE 
  id = 'c26b85ac-4dd2-4ebd-ac8f-f6d41fc28504' -- Your subscription ID
  AND status = 'pending';

-- Verify the update
SELECT 
  id,
  operator_name,
  operator_email,
  status,
  subscription_plan,
  stripe_subscription_id,
  current_period_start,
  current_period_end,
  verification_status,
  verified_tour_ids,
  total_tours_count,
  created_at,
  updated_at
FROM tour_operator_subscriptions
WHERE id = 'c26b85ac-4dd2-4ebd-ac8f-f6d41fc28504';

