-- Cleanup Abandoned Checkouts
-- Removes pending restaurant subscriptions older than 7 days
-- This prevents database bloat from abandoned checkout sessions while giving
-- enough time (7 days) to troubleshoot any issues
-- Run this daily via cron job or scheduled task

-- Delete pending subscriptions older than 7 days
DELETE FROM restaurant_subscriptions 
WHERE status = 'pending' 
AND created_at < NOW() - INTERVAL '7 days';

-- Also cleanup old pending promoted_restaurants (if they exist without subscription)
DELETE FROM promoted_restaurants
WHERE status = 'pending'
AND requested_at < NOW() - INTERVAL '7 days'
AND restaurant_subscription_id IS NULL;

-- Log cleanup results (optional - for monitoring)
-- You can query this to see how many records will be cleaned up
-- SELECT COUNT(*) FROM restaurant_subscriptions WHERE status = 'pending' AND created_at < NOW() - INTERVAL '7 days';
-- SELECT COUNT(*) FROM promoted_restaurants WHERE status = 'pending' AND requested_at < NOW() - INTERVAL '7 days' AND restaurant_subscription_id IS NULL;

