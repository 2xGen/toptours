-- Check for Barcelona restaurant subscription
-- This script helps find the subscription record for Barcelona

-- Check in the new restaurant_subscriptions table
SELECT 
  id,
  restaurant_id,
  destination_id,
  restaurant_name,
  restaurant_slug,
  status,
  restaurant_premium_plan,
  promoted_listing_plan,
  stripe_subscription_id,
  stripe_customer_id,
  user_id,
  email,
  created_at,
  updated_at
FROM restaurant_subscriptions
WHERE destination_id LIKE '%barcelona%'
   OR restaurant_slug LIKE '%barcelona%'
   OR restaurant_name LIKE '%barcelona%'
ORDER BY created_at DESC;

-- Also check in the old restaurant_premium_subscriptions table (for comparison)
SELECT 
  id,
  restaurant_id,
  destination_id,
  restaurant_name,
  restaurant_slug,
  status,
  plan_type,
  stripe_subscription_id,
  stripe_customer_id,
  user_id,
  purchaser_email,
  created_at,
  updated_at
FROM restaurant_premium_subscriptions
WHERE destination_id LIKE '%barcelona%'
   OR restaurant_slug LIKE '%barcelona%'
   OR restaurant_name LIKE '%barcelona%'
ORDER BY created_at DESC;

-- Check for any pending subscriptions (might be waiting for webhook)
SELECT 
  id,
  restaurant_id,
  destination_id,
  restaurant_name,
  status,
  stripe_subscription_id,
  created_at
FROM restaurant_subscriptions
WHERE status = 'pending'
ORDER BY created_at DESC
LIMIT 10;

