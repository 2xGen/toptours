-- Add email field to restaurant_subscriptions and promoted_restaurants tables
-- This allows easy reference to the user's email without joining with auth.users

-- Add email to restaurant_subscriptions
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'restaurant_subscriptions' AND column_name = 'email'
  ) THEN
    ALTER TABLE restaurant_subscriptions ADD COLUMN email TEXT;
  END IF;
END $$;

-- Add email to promoted_restaurants
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'promoted_restaurants' AND column_name = 'email'
  ) THEN
    ALTER TABLE promoted_restaurants ADD COLUMN email TEXT;
  END IF;
END $$;

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_restaurant_subscriptions_email ON restaurant_subscriptions(email);
CREATE INDEX IF NOT EXISTS idx_promoted_restaurants_email ON promoted_restaurants(email);

-- Add comments
COMMENT ON COLUMN restaurant_subscriptions.email IS 'User email for easy reference without joining auth.users';
COMMENT ON COLUMN promoted_restaurants.email IS 'User email for easy reference without joining auth.users';

