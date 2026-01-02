-- Create a separate table for promoted restaurants
-- This allows better tracking of promotion history, status, and lifecycle

CREATE TABLE IF NOT EXISTS promoted_restaurants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  restaurant_id BIGINT NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE,
  restaurant_subscription_id UUID REFERENCES restaurant_subscriptions(id) ON DELETE CASCADE,
  stripe_subscription_id TEXT, -- NULL for pending, set when payment confirmed
  promotion_plan TEXT NOT NULL CHECK (promotion_plan IN ('monthly', 'annual')),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'active', 'cancelled', 'expired')),
  requested_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  start_date TIMESTAMPTZ,
  end_date TIMESTAMPTZ,
  cancelled_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_promoted_restaurants_restaurant_id ON promoted_restaurants(restaurant_id);
CREATE INDEX IF NOT EXISTS idx_promoted_restaurants_subscription_id ON promoted_restaurants(restaurant_subscription_id);
CREATE INDEX IF NOT EXISTS idx_promoted_restaurants_stripe_subscription_id ON promoted_restaurants(stripe_subscription_id);
CREATE INDEX IF NOT EXISTS idx_promoted_restaurants_status ON promoted_restaurants(status) WHERE status = 'active';
CREATE INDEX IF NOT EXISTS idx_promoted_restaurants_active ON promoted_restaurants(restaurant_id, status) WHERE status = 'active';

-- Add comments
COMMENT ON TABLE promoted_restaurants IS 'Tracks promoted restaurant listings with full lifecycle management';
COMMENT ON COLUMN promoted_restaurants.restaurant_id IS 'Reference to the restaurant';
COMMENT ON COLUMN promoted_restaurants.restaurant_subscription_id IS 'Reference to the restaurant subscription';
COMMENT ON COLUMN promoted_restaurants.stripe_subscription_id IS 'Stripe subscription ID for this promotion. NULL for pending promotions, set when payment is confirmed.';
COMMENT ON COLUMN promoted_restaurants.promotion_plan IS 'Billing cycle: monthly ($24.99) or annual ($19.99/month)';
COMMENT ON COLUMN promoted_restaurants.status IS 'Promotion status: pending (payment processing), active (live), cancelled (user cancelled), expired (subscription ended)';
COMMENT ON COLUMN promoted_restaurants.requested_at IS 'When the promotion was requested/created';
COMMENT ON COLUMN promoted_restaurants.start_date IS 'When the promotion became active';
COMMENT ON COLUMN promoted_restaurants.end_date IS 'When the promotion expires (based on subscription period)';
COMMENT ON COLUMN promoted_restaurants.cancelled_at IS 'When the promotion was cancelled (if applicable)';

-- Create a function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_promoted_restaurants_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to auto-update updated_at
-- Drop existing trigger if it exists, then create it
DROP TRIGGER IF EXISTS update_promoted_restaurants_updated_at ON promoted_restaurants;
CREATE TRIGGER update_promoted_restaurants_updated_at
  BEFORE UPDATE ON promoted_restaurants
  FOR EACH ROW
  EXECUTE FUNCTION update_promoted_restaurants_updated_at();

