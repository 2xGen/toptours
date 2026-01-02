-- Create restaurant_subscriptions table
-- This is the new unified table for restaurant subscriptions (premium + promoted)
-- Replaces the old restaurant_premium_subscriptions table

CREATE TABLE IF NOT EXISTS restaurant_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  restaurant_id BIGINT NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE,
  destination_id TEXT NOT NULL,
  restaurant_slug TEXT NOT NULL,
  restaurant_name TEXT,
  
  -- Premium subscription
  restaurant_premium_plan TEXT CHECK (restaurant_premium_plan IN ('monthly', 'annual', '')),
  stripe_subscription_id TEXT,
  stripe_customer_id TEXT,
  
  -- Promoted listing
  promoted_listing_plan TEXT CHECK (promoted_listing_plan IN ('monthly', 'annual', '')),
  promoted_until TIMESTAMPTZ,
  
  -- Status
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'active', 'pending_cancellation', 'cancelled', 'expired')),
  
  -- Period dates
  current_period_start TIMESTAMPTZ,
  current_period_end TIMESTAMPTZ,
  
  -- Metadata
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_restaurant_subscriptions_user_id ON restaurant_subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_restaurant_subscriptions_restaurant_id ON restaurant_subscriptions(restaurant_id);
CREATE INDEX IF NOT EXISTS idx_restaurant_subscriptions_status ON restaurant_subscriptions(status);
CREATE INDEX IF NOT EXISTS idx_restaurant_subscriptions_stripe_subscription_id ON restaurant_subscriptions(stripe_subscription_id);

-- Add comments
COMMENT ON TABLE restaurant_subscriptions IS 'Unified table for restaurant subscriptions (premium and/or promoted listings)';
COMMENT ON COLUMN restaurant_subscriptions.restaurant_premium_plan IS 'Premium plan billing cycle: monthly, annual, or empty string if not subscribed';
COMMENT ON COLUMN restaurant_subscriptions.promoted_listing_plan IS 'Promoted listing billing cycle: monthly, annual, or empty string if not promoted';
COMMENT ON COLUMN restaurant_subscriptions.status IS 'Subscription status: pending (payment processing), active, pending_cancellation, cancelled, expired';

-- Create function to update updated_at
CREATE OR REPLACE FUNCTION update_restaurant_subscriptions_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger
DROP TRIGGER IF EXISTS update_restaurant_subscriptions_updated_at ON restaurant_subscriptions;
CREATE TRIGGER update_restaurant_subscriptions_updated_at
  BEFORE UPDATE ON restaurant_subscriptions
  FOR EACH ROW
  EXECUTE FUNCTION update_restaurant_subscriptions_updated_at();

