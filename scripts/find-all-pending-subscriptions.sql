-- Find ALL pending restaurant subscriptions (regardless of user or destination)
-- This helps debug missing subscriptions

-- Check ALL pending subscriptions
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
WHERE status = 'pending'
ORDER BY created_at DESC;

-- Check ALL subscriptions (active and pending) for Barcelona
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
  user_id,
  email,
  created_at
FROM restaurant_subscriptions
WHERE destination_id LIKE '%barcelona%'
   OR restaurant_slug LIKE '%barcelona%'
   OR restaurant_name LIKE '%barcelona%'
ORDER BY created_at DESC;

-- Check ALL subscriptions created in the last 24 hours
SELECT 
  id,
  restaurant_id,
  destination_id,
  restaurant_name,
  status,
  restaurant_premium_plan,
  promoted_listing_plan,
  user_id,
  email,
  created_at
FROM restaurant_subscriptions
WHERE created_at > NOW() - INTERVAL '24 hours'
ORDER BY created_at DESC;

-- Check for subscriptions with NULL stripe_subscription_id (might be pending)
SELECT 
  id,
  restaurant_id,
  destination_id,
  restaurant_name,
  status,
  stripe_subscription_id,
  user_id,
  created_at
FROM restaurant_subscriptions
WHERE stripe_subscription_id IS NULL
ORDER BY created_at DESC;

