-- Restaurant Premium Subscriptions Schema
-- This table stores premium subscription data for restaurants that pay for enhanced visibility

-- Create the restaurant_premium_subscriptions table
CREATE TABLE IF NOT EXISTS restaurant_premium_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Restaurant identification
  restaurant_id INTEGER NOT NULL,
  destination_id VARCHAR(255) NOT NULL,
  restaurant_slug VARCHAR(255) NOT NULL,
  restaurant_name VARCHAR(500),
  
  -- Stripe subscription data
  stripe_subscription_id VARCHAR(255) UNIQUE,
  stripe_customer_id VARCHAR(255),
  stripe_price_id VARCHAR(255),
  
  -- Subscription details
  plan_type VARCHAR(50) NOT NULL DEFAULT 'monthly', -- 'monthly' or 'yearly'
  status VARCHAR(50) NOT NULL DEFAULT 'inactive', -- 'active', 'inactive', 'cancelled', 'past_due', 'pending_cancellation'
  
  -- Billing period
  current_period_start TIMESTAMPTZ,
  current_period_end TIMESTAMPTZ,
  
  -- Customization options (preset-based, no custom input)
  layout_preset VARCHAR(50) NOT NULL DEFAULT 'ocean', -- 'ocean', 'sunset', 'twilight'
  color_scheme VARCHAR(50) NOT NULL DEFAULT 'blue', -- 'blue', 'coral', 'teal'
  
  -- Pre-approved CTA headlines (index references to predefined options)
  hero_cta_index INTEGER NOT NULL DEFAULT 0, -- Index into HERO_CTA_OPTIONS array
  mid_cta_index INTEGER NOT NULL DEFAULT 0, -- Index into MID_CTA_OPTIONS array
  end_cta_index INTEGER NOT NULL DEFAULT 0, -- Index into END_CTA_OPTIONS array
  sticky_cta_index INTEGER NOT NULL DEFAULT 0, -- Index into STICKY_CTA_OPTIONS array
  
  -- Purchaser info (optional, no KYC required)
  purchaser_email VARCHAR(255),
  
  -- Metadata
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create indexes for efficient lookups
CREATE INDEX IF NOT EXISTS idx_restaurant_premium_restaurant_id ON restaurant_premium_subscriptions(restaurant_id);
CREATE INDEX IF NOT EXISTS idx_restaurant_premium_destination ON restaurant_premium_subscriptions(destination_id);
CREATE INDEX IF NOT EXISTS idx_restaurant_premium_status ON restaurant_premium_subscriptions(status);
CREATE INDEX IF NOT EXISTS idx_restaurant_premium_stripe_sub ON restaurant_premium_subscriptions(stripe_subscription_id);
CREATE UNIQUE INDEX IF NOT EXISTS idx_restaurant_premium_unique ON restaurant_premium_subscriptions(restaurant_id, destination_id);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_restaurant_premium_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for auto-updating updated_at
DROP TRIGGER IF EXISTS trigger_restaurant_premium_updated_at ON restaurant_premium_subscriptions;
CREATE TRIGGER trigger_restaurant_premium_updated_at
  BEFORE UPDATE ON restaurant_premium_subscriptions
  FOR EACH ROW
  EXECUTE FUNCTION update_restaurant_premium_updated_at();

-- Grant appropriate permissions (adjust based on your Supabase setup)
-- These allow the service role to manage subscriptions
ALTER TABLE restaurant_premium_subscriptions ENABLE ROW LEVEL SECURITY;

-- Policy: Allow service role full access
CREATE POLICY "Service role has full access to restaurant_premium_subscriptions"
  ON restaurant_premium_subscriptions
  FOR ALL
  USING (true)
  WITH CHECK (true);

-- Policy: Allow anyone to read active subscriptions (for frontend display)
CREATE POLICY "Anyone can read active restaurant premium subscriptions"
  ON restaurant_premium_subscriptions
  FOR SELECT
  USING (status = 'active');

COMMENT ON TABLE restaurant_premium_subscriptions IS 'Stores premium subscription data for restaurants with enhanced visibility features';
COMMENT ON COLUMN restaurant_premium_subscriptions.layout_preset IS 'Visual layout preset: ocean (blue gradient), sunset (warm orange), twilight (purple/elegant)';
COMMENT ON COLUMN restaurant_premium_subscriptions.color_scheme IS 'CTA button color scheme: blue, coral (orange), teal (green)';
COMMENT ON COLUMN restaurant_premium_subscriptions.hero_cta_index IS 'Index into predefined hero CTA text options (0-based)';

