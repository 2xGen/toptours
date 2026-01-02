-- Create a separate table for promoted tours
-- This allows better tracking of promotion history, status, and lifecycle

CREATE TABLE IF NOT EXISTS promoted_tours (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id TEXT NOT NULL,
  operator_id UUID NOT NULL,
  operator_subscription_id UUID NOT NULL REFERENCES tour_operator_subscriptions(id) ON DELETE CASCADE,
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
CREATE INDEX IF NOT EXISTS idx_promoted_tours_product_id ON promoted_tours(product_id);
CREATE INDEX IF NOT EXISTS idx_promoted_tours_operator_id ON promoted_tours(operator_id);
CREATE INDEX IF NOT EXISTS idx_promoted_tours_operator_subscription_id ON promoted_tours(operator_subscription_id);
CREATE INDEX IF NOT EXISTS idx_promoted_tours_stripe_subscription_id ON promoted_tours(stripe_subscription_id);
CREATE INDEX IF NOT EXISTS idx_promoted_tours_status ON promoted_tours(status) WHERE status = 'active';
CREATE INDEX IF NOT EXISTS idx_promoted_tours_active ON promoted_tours(product_id, status) WHERE status = 'active';

-- Add comments
COMMENT ON TABLE promoted_tours IS 'Tracks promoted tour listings with full lifecycle management';
COMMENT ON COLUMN promoted_tours.product_id IS 'Viator product ID of the promoted tour';
COMMENT ON COLUMN promoted_tours.operator_id IS 'Operator ID from operator_tours table';
COMMENT ON COLUMN promoted_tours.operator_subscription_id IS 'Reference to the tour operator subscription';
COMMENT ON COLUMN promoted_tours.stripe_subscription_id IS 'Stripe subscription ID for this promotion';
COMMENT ON COLUMN promoted_tours.promotion_plan IS 'Billing cycle: monthly ($24.99) or annual ($19.99/month)';
COMMENT ON COLUMN promoted_tours.status IS 'Promotion status: pending (payment processing), active (live), cancelled (user cancelled), expired (subscription ended)';
COMMENT ON COLUMN promoted_tours.requested_at IS 'When the promotion was requested/created';
COMMENT ON COLUMN promoted_tours.start_date IS 'When the promotion became active';
COMMENT ON COLUMN promoted_tours.end_date IS 'When the promotion expires (based on subscription period)';
COMMENT ON COLUMN promoted_tours.cancelled_at IS 'When the promotion was cancelled (if applicable)';

-- Create a function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_promoted_tours_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to auto-update updated_at
-- Drop existing trigger if it exists, then create it
DROP TRIGGER IF EXISTS update_promoted_tours_updated_at ON promoted_tours;
CREATE TRIGGER update_promoted_tours_updated_at
  BEFORE UPDATE ON promoted_tours
  FOR EACH ROW
  EXECUTE FUNCTION update_promoted_tours_updated_at();

