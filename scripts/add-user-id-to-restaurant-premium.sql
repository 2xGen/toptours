-- Add user_id column to restaurant_premium_subscriptions
-- This links the subscription to a Supabase user for self-service management

-- Add the user_id column
ALTER TABLE restaurant_premium_subscriptions 
ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL;

-- Create an index for efficient lookups by user_id
CREATE INDEX IF NOT EXISTS idx_restaurant_premium_user_id ON restaurant_premium_subscriptions(user_id);

-- Add RLS policy to allow users to view and update their own subscriptions
CREATE POLICY "Users can view their own restaurant premium subscriptions"
  ON restaurant_premium_subscriptions
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own restaurant premium subscriptions"
  ON restaurant_premium_subscriptions
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

COMMENT ON COLUMN restaurant_premium_subscriptions.user_id IS 'Supabase user ID - links subscription to user account for self-service management';

