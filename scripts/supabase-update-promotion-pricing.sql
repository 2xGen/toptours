-- Update Promotion System for Option B Pricing
-- Adds Pro+ tier and a la carte purchase support

-- Update promotion_accounts to support Pro+ and Enterprise tiers
ALTER TABLE promotion_accounts 
  DROP CONSTRAINT IF EXISTS promotion_accounts_tier_check;

ALTER TABLE promotion_accounts
  ADD CONSTRAINT promotion_accounts_tier_check 
  CHECK (tier IN ('explorer', 'pro_booster', 'pro_plus', 'enterprise'));

-- Add Stripe subscription fields
ALTER TABLE promotion_accounts
  ADD COLUMN IF NOT EXISTS stripe_customer_id TEXT,
  ADD COLUMN IF NOT EXISTS stripe_subscription_id TEXT,
  ADD COLUMN IF NOT EXISTS stripe_price_id TEXT,
  ADD COLUMN IF NOT EXISTS subscription_plan TEXT DEFAULT 'free' CHECK (subscription_plan IN ('free', 'pro', 'pro_plus', 'enterprise')),
  ADD COLUMN IF NOT EXISTS ai_matches_used_today INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS last_ai_match_reset TIMESTAMPTZ DEFAULT NOW();

-- Create index for Stripe customer lookup
CREATE INDEX IF NOT EXISTS idx_promotion_accounts_stripe_customer ON promotion_accounts(stripe_customer_id);

-- Update promotion_transactions to support a la carte packages
ALTER TABLE promotion_transactions
  ADD COLUMN IF NOT EXISTS stripe_payment_intent_id TEXT,
  ADD COLUMN IF NOT EXISTS a_la_carte_package TEXT CHECK (a_la_carte_package IN ('1000_points', '3000_points', '5000_points')),
  ADD COLUMN IF NOT EXISTS amount_paid_cents INTEGER; -- Store in cents for Stripe

-- Create index for Stripe payment lookups
CREATE INDEX IF NOT EXISTS idx_promotion_transactions_stripe_payment ON promotion_transactions(stripe_payment_intent_id);

-- Update reset_daily_points function to support Pro+ tier
CREATE OR REPLACE FUNCTION reset_daily_points()
RETURNS void AS $$
BEGIN
  UPDATE promotion_accounts
  SET 
    daily_points_available = CASE 
      WHEN tier = 'enterprise' AND subscription_status = 'active' THEN 2000
      WHEN tier = 'pro_plus' AND subscription_status = 'active' THEN 600
      WHEN tier = 'pro_booster' AND subscription_status = 'active' THEN 200
      ELSE 50
    END,
    ai_matches_used_today = CASE
      WHEN last_ai_match_reset < NOW() - INTERVAL '24 hours' THEN 0
      ELSE ai_matches_used_today
    END,
    last_daily_reset = NOW(),
    last_ai_match_reset = CASE
      WHEN last_ai_match_reset < NOW() - INTERVAL '24 hours' THEN NOW()
      ELSE last_ai_match_reset
    END
  WHERE 
    last_daily_reset < NOW() - INTERVAL '24 hours'
    OR last_daily_reset IS NULL;
END;
$$ LANGUAGE plpgsql;

-- Add function to get subscription pricing info
CREATE OR REPLACE FUNCTION get_subscription_pricing()
RETURNS TABLE (
  plan_name TEXT,
  daily_points INTEGER,
  monthly_price_cents INTEGER,
  stripe_price_id TEXT
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    'free'::TEXT,
    50::INTEGER,
    0::INTEGER,
    NULL::TEXT
  UNION ALL
  SELECT 
    'pro'::TEXT,
    200::INTEGER,
    399::INTEGER, -- $3.99 in cents
    NULL::TEXT -- Will be set when Stripe products are created
  UNION ALL
  SELECT 
    'pro_plus'::TEXT,
    600::INTEGER,
    999::INTEGER, -- $9.99 in cents
    NULL::TEXT -- Will be set when Stripe products are created
  UNION ALL
  SELECT 
    'enterprise'::TEXT,
    2000::INTEGER,
    2499::INTEGER, -- $24.99 in cents
    NULL::TEXT; -- Will be set when Stripe products are created
END;
$$ LANGUAGE plpgsql;

-- Add function to get a la carte pricing info
CREATE OR REPLACE FUNCTION get_a_la_carte_pricing()
RETURNS TABLE (
  package_name TEXT,
  points INTEGER,
  price_cents INTEGER,
  price_per_point_cents DECIMAL,
  stripe_price_id TEXT
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    '1000_points'::TEXT,
    1000::INTEGER,
    799::INTEGER, -- $7.99 in cents
    (799.0 / 1000.0)::DECIMAL,
    NULL::TEXT -- Will be set when Stripe products are created
  UNION ALL
  SELECT 
    '3000_points'::TEXT,
    3000::INTEGER,
    1899::INTEGER, -- $18.99 in cents
    (1899.0 / 3000.0)::DECIMAL,
    NULL::TEXT
  UNION ALL
  SELECT 
    '5000_points'::TEXT,
    5000::INTEGER,
    2799::INTEGER, -- $27.99 in cents
    (2799.0 / 5000.0)::DECIMAL,
    NULL::TEXT;
END;
$$ LANGUAGE plpgsql;

