-- Add user_id column to promoted_restaurants table
-- This allows direct querying by user, making it more reliable than matching by restaurant_subscription_id

-- Step 1: Add user_id column (nullable initially)
ALTER TABLE promoted_restaurants
ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;

-- Step 2: Populate user_id from restaurant_subscriptions for existing records
UPDATE promoted_restaurants pr
SET user_id = rs.user_id
FROM restaurant_subscriptions rs
WHERE pr.restaurant_subscription_id = rs.id
  AND pr.user_id IS NULL;

-- Step 3: Also try to populate from restaurant_id if restaurant_subscription_id is null
-- (for standalone promotions)
UPDATE promoted_restaurants pr
SET user_id = rs.user_id
FROM restaurant_subscriptions rs
WHERE pr.restaurant_id = rs.restaurant_id
  AND pr.restaurant_subscription_id IS NULL
  AND pr.user_id IS NULL;

-- Step 4: Add index for faster queries
CREATE INDEX IF NOT EXISTS idx_promoted_restaurants_user_id 
ON promoted_restaurants(user_id) 
WHERE user_id IS NOT NULL;

-- Step 5: Add index for user_id + status queries (common query pattern)
CREATE INDEX IF NOT EXISTS idx_promoted_restaurants_user_status 
ON promoted_restaurants(user_id, status) 
WHERE user_id IS NOT NULL AND status IN ('active', 'pending');

-- Note: After this migration, all new promotions should populate user_id
-- Existing promotions without user_id will need to be manually updated or will be populated
-- when they're updated through the normal flow

