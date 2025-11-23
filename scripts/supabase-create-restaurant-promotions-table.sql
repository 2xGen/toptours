-- Restaurant Promotion System Database Schema
-- Similar to tour_promotions but for restaurants

-- Restaurant promotion scores (tracks all score types for different leaderboards)
CREATE TABLE IF NOT EXISTS restaurant_promotions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  restaurant_id BIGINT NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE UNIQUE,
  total_score INTEGER NOT NULL DEFAULT 0, -- All Time
  monthly_score INTEGER NOT NULL DEFAULT 0, -- This Month (resets monthly)
  weekly_score INTEGER NOT NULL DEFAULT 0, -- This Week (resets weekly)
  past_28_days_score INTEGER NOT NULL DEFAULT 0, -- Past 28 Days (rolling window)
  region TEXT, -- 'caribbean', 'europe', 'north_america', 'asia', etc.
  destination_id TEXT, -- Store destination_id for efficient filtering
  restaurant_name TEXT, -- Cache restaurant name
  restaurant_image_url TEXT, -- Cache restaurant image
  restaurant_slug TEXT, -- Cache restaurant slug
  last_promoted_at TIMESTAMPTZ,
  first_promoted_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_restaurant_promotions_restaurant_id ON restaurant_promotions(restaurant_id);
CREATE INDEX IF NOT EXISTS idx_restaurant_promotions_total_score ON restaurant_promotions(total_score DESC);
CREATE INDEX IF NOT EXISTS idx_restaurant_promotions_monthly_score ON restaurant_promotions(monthly_score DESC);
CREATE INDEX IF NOT EXISTS idx_restaurant_promotions_weekly_score ON restaurant_promotions(weekly_score DESC);
CREATE INDEX IF NOT EXISTS idx_restaurant_promotions_past_28_days ON restaurant_promotions(past_28_days_score DESC);
CREATE INDEX IF NOT EXISTS idx_restaurant_promotions_region ON restaurant_promotions(region);
CREATE INDEX IF NOT EXISTS idx_restaurant_promotions_destination_id ON restaurant_promotions(destination_id);

-- Update promotion_transactions to support restaurants
-- Add restaurant_id column if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'promotion_transactions' 
    AND column_name = 'restaurant_id'
  ) THEN
    ALTER TABLE promotion_transactions 
    ADD COLUMN restaurant_id BIGINT REFERENCES restaurants(id) ON DELETE SET NULL;
    
    CREATE INDEX IF NOT EXISTS idx_promotion_transactions_restaurant_id 
    ON promotion_transactions(restaurant_id);
  END IF;
END $$;

-- Function to automatically update updated_at
CREATE TRIGGER update_restaurant_promotions_updated_at
  BEFORE UPDATE ON restaurant_promotions
  FOR EACH ROW
  EXECUTE FUNCTION update_promotion_updated_at();

-- Function to reset monthly scores for restaurants (called on 1st of each month)
CREATE OR REPLACE FUNCTION reset_restaurant_monthly_scores()
RETURNS void AS $$
BEGIN
  UPDATE restaurant_promotions SET monthly_score = 0;
END;
$$ LANGUAGE plpgsql;

-- Function to reset weekly scores for restaurants (called on Mondays)
CREATE OR REPLACE FUNCTION reset_restaurant_weekly_scores()
RETURNS void AS $$
BEGIN
  UPDATE restaurant_promotions SET weekly_score = 0;
END;
$$ LANGUAGE plpgsql;

-- Function to update past 28 days score for restaurants (rolling window)
CREATE OR REPLACE FUNCTION update_restaurant_past_28_days_scores()
RETURNS void AS $$
BEGIN
  UPDATE restaurant_promotions rp
  SET past_28_days_score = COALESCE((
    SELECT SUM(points_spent)
    FROM promotion_transactions
    WHERE restaurant_id = rp.restaurant_id
      AND created_at >= NOW() - INTERVAL '28 days'
  ), 0);
END;
$$ LANGUAGE plpgsql;

-- RLS Policies (Row Level Security)
ALTER TABLE restaurant_promotions ENABLE ROW LEVEL SECURITY;

-- Anyone can read restaurant promotions (for leaderboard)
CREATE POLICY "Anyone can view restaurant promotions"
  ON restaurant_promotions FOR SELECT
  USING (true);

