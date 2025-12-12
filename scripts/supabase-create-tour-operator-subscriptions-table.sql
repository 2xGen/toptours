-- Tour Operator Premium Subscriptions
-- Allows tour operators to bundle up to 5 or 15 tours and show aggregated reviews

-- Drop and recreate the constraint if it exists
ALTER TABLE IF EXISTS tour_operator_subscriptions 
  DROP CONSTRAINT IF EXISTS tour_operator_subscriptions_subscription_plan_check;

CREATE TABLE IF NOT EXISTS tour_operator_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  operator_name TEXT NOT NULL,
  operator_email TEXT NOT NULL,
  contact_name TEXT,
  website TEXT,
  user_id UUID REFERENCES auth.users(id), -- Optional account link
  
  -- Subscription
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'active', 'cancelled', 'expired', 'pending_review')),
  subscription_plan TEXT NOT NULL CHECK (subscription_plan IN ('5-tours-monthly', '5-tours-annual', '15-tours-monthly', '15-tours-annual')),
  stripe_customer_id TEXT,
  stripe_subscription_id TEXT,
  stripe_price_id TEXT,
  current_period_start TIMESTAMPTZ,
  current_period_end TIMESTAMPTZ,
  
  -- Verification
  verification_status TEXT DEFAULT 'pending' CHECK (verification_status IN ('pending', 'verified', 'rejected', 'needs_review')),
  submitted_tour_urls TEXT[], -- Array of Viator URLs submitted
  verified_tour_ids TEXT[], -- Array of verified product IDs (max 5 or 15 depending on plan)
  
  -- Aggregated stats (cached, updated when tours change)
  total_reviews INTEGER DEFAULT 0,
  average_rating DECIMAL(3,2) DEFAULT 0,
  total_tours_count INTEGER DEFAULT 0, -- Should be <= 5 or 15 depending on plan
  
  -- Admin notes
  admin_notes TEXT,
  reviewed_by UUID REFERENCES auth.users(id),
  reviewed_at TIMESTAMPTZ,
  
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Update the constraint if table already exists (drop old, add new)
DO $$ 
BEGIN
  -- Only run if table exists
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'tour_operator_subscriptions') THEN
    -- Drop the old constraint if it exists
    ALTER TABLE tour_operator_subscriptions 
      DROP CONSTRAINT IF EXISTS tour_operator_subscriptions_subscription_plan_check;
    
    -- Add the new constraint
    ALTER TABLE tour_operator_subscriptions
      ADD CONSTRAINT tour_operator_subscriptions_subscription_plan_check 
      CHECK (subscription_plan IN ('5-tours-monthly', '5-tours-annual', '15-tours-monthly', '15-tours-annual'));
  END IF;
END $$;

-- Tour to Operator mapping (max 5 or 15 per operator depending on plan)
CREATE TABLE IF NOT EXISTS operator_tours (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  operator_subscription_id UUID REFERENCES tour_operator_subscriptions(id) ON DELETE CASCADE,
  product_id TEXT NOT NULL, -- Viator product ID (e.g., "132779P2")
  viator_url TEXT, -- Original Viator URL
  toptours_url TEXT, -- Generated TopTours URL
  operator_name TEXT NOT NULL, -- Cached operator name from tour
  tour_title TEXT,
  tour_image_url TEXT,
  review_count INTEGER DEFAULT 0,
  rating DECIMAL(3,2) DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  is_selected BOOLEAN DEFAULT true, -- For the 5 selected tours
  verified_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  UNIQUE(operator_subscription_id, product_id)
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_operator_tours_product_id ON operator_tours(product_id);
CREATE INDEX IF NOT EXISTS idx_operator_tours_operator_subscription ON operator_tours(operator_subscription_id);
CREATE INDEX IF NOT EXISTS idx_operator_tours_is_selected ON operator_tours(is_selected) WHERE is_selected = true;
CREATE INDEX IF NOT EXISTS idx_operator_subscriptions_status ON tour_operator_subscriptions(status);
CREATE INDEX IF NOT EXISTS idx_operator_subscriptions_email ON tour_operator_subscriptions(operator_email);
CREATE INDEX IF NOT EXISTS idx_operator_subscriptions_verification ON tour_operator_subscriptions(verification_status);

-- Function to automatically update updated_at
CREATE OR REPLACE FUNCTION update_tour_operator_subscriptions_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to update updated_at on update
DROP TRIGGER IF EXISTS update_tour_operator_subscriptions_updated_at ON tour_operator_subscriptions;
CREATE TRIGGER update_tour_operator_subscriptions_updated_at
  BEFORE UPDATE ON tour_operator_subscriptions
  FOR EACH ROW
  EXECUTE FUNCTION update_tour_operator_subscriptions_updated_at();

-- Function to update aggregated stats when tours are added/removed
CREATE OR REPLACE FUNCTION update_operator_aggregated_stats()
RETURNS TRIGGER AS $$
DECLARE
  total_reviews_count INTEGER;
  avg_rating DECIMAL(3,2);
  tours_count INTEGER;
BEGIN
  -- Calculate aggregated stats for the operator
  SELECT 
    COALESCE(SUM(review_count), 0),
    COALESCE(AVG(rating), 0),
    COUNT(*)
  INTO total_reviews_count, avg_rating, tours_count
  FROM operator_tours
  WHERE operator_subscription_id = COALESCE(NEW.operator_subscription_id, OLD.operator_subscription_id)
    AND is_selected = true
    AND is_active = true;
  
  -- Update operator subscription
  UPDATE tour_operator_subscriptions
  SET 
    total_reviews = total_reviews_count,
    average_rating = avg_rating,
    total_tours_count = tours_count,
    updated_at = NOW()
  WHERE id = COALESCE(NEW.operator_subscription_id, OLD.operator_subscription_id);
  
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- Trigger to update stats when tours are added/updated/deleted
DROP TRIGGER IF EXISTS update_operator_stats_on_tour_change ON operator_tours;
CREATE TRIGGER update_operator_stats_on_tour_change
  AFTER INSERT OR UPDATE OR DELETE ON operator_tours
  FOR EACH ROW
  EXECUTE FUNCTION update_operator_aggregated_stats();

-- Row Level Security (RLS) policies
ALTER TABLE tour_operator_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE operator_tours ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Public can read active operator subscriptions" ON tour_operator_subscriptions;
DROP POLICY IF EXISTS "Service role full access to operator subscriptions" ON tour_operator_subscriptions;
DROP POLICY IF EXISTS "Public can read operator tours" ON operator_tours;
DROP POLICY IF EXISTS "Service role full access to operator tours" ON operator_tours;

-- Policy: Anyone can read active subscriptions (for public display)
CREATE POLICY "Public can read active operator subscriptions"
  ON tour_operator_subscriptions
  FOR SELECT
  USING (status = 'active');

-- Policy: Service role can do everything
CREATE POLICY "Service role full access to operator subscriptions"
  ON tour_operator_subscriptions
  FOR ALL
  USING (auth.role() = 'service_role');

-- Policy: Public can read operator tours for active subscriptions
CREATE POLICY "Public can read operator tours"
  ON operator_tours
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM tour_operator_subscriptions
      WHERE id = operator_tours.operator_subscription_id
        AND status = 'active'
    )
  );

-- Policy: Service role can do everything
CREATE POLICY "Service role full access to operator tours"
  ON operator_tours
  FOR ALL
  USING (auth.role() = 'service_role');

