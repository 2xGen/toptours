-- Add promoted listing fields to operator_tours and restaurants tables
-- This enables paid promotion feature ($19.99/month annual or $24.99/month monthly)

-- Add fields to operator_tours table
ALTER TABLE operator_tours
ADD COLUMN IF NOT EXISTS is_promoted BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS promoted_until TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS promotion_plan TEXT CHECK (promotion_plan IN ('monthly', 'annual')),
ADD COLUMN IF NOT EXISTS promotion_stripe_subscription_id TEXT;

-- Add fields to restaurants table
ALTER TABLE restaurants
ADD COLUMN IF NOT EXISTS is_promoted BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS promoted_until TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS promotion_plan TEXT CHECK (promotion_plan IN ('monthly', 'annual')),
ADD COLUMN IF NOT EXISTS promotion_stripe_subscription_id TEXT;

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_operator_tours_is_promoted ON operator_tours(is_promoted) WHERE is_promoted = true;
CREATE INDEX IF NOT EXISTS idx_operator_tours_promoted_until ON operator_tours(promoted_until) WHERE is_promoted = true;
CREATE INDEX IF NOT EXISTS idx_restaurants_is_promoted ON restaurants(is_promoted) WHERE is_promoted = true;
CREATE INDEX IF NOT EXISTS idx_restaurants_promoted_until ON restaurants(promoted_until) WHERE is_promoted = true;
CREATE INDEX IF NOT EXISTS idx_restaurants_destination_promoted ON restaurants(destination_id, is_promoted) WHERE is_promoted = true;

-- Add comments
COMMENT ON COLUMN operator_tours.is_promoted IS 'Whether this tour is currently promoted (paid listing)';
COMMENT ON COLUMN operator_tours.promoted_until IS 'When the promotion expires (NULL for monthly subscriptions)';
COMMENT ON COLUMN operator_tours.promotion_plan IS 'Promotion billing cycle: monthly ($24.99) or annual ($19.99/month)';
COMMENT ON COLUMN operator_tours.promotion_stripe_subscription_id IS 'Stripe subscription ID for this promotion';

COMMENT ON COLUMN restaurants.is_promoted IS 'Whether this restaurant is currently promoted (paid listing)';
COMMENT ON COLUMN restaurants.promoted_until IS 'When the promotion expires (NULL for monthly subscriptions)';
COMMENT ON COLUMN restaurants.promotion_plan IS 'Promotion billing cycle: monthly ($24.99) or annual ($19.99/month)';
COMMENT ON COLUMN restaurants.promotion_stripe_subscription_id IS 'Stripe subscription ID for this promotion';

