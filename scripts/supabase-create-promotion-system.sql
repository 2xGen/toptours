-- Gamified Promotion System Database Schema
-- Phase 1: Daily Points + Leaderboard
-- Future: A La Carte packages, regional filtering, monthly winners

-- User promotion accounts (tracks daily points and tier)
CREATE TABLE IF NOT EXISTS promotion_accounts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE NOT NULL,
  tier TEXT NOT NULL DEFAULT 'explorer' CHECK (tier IN ('explorer', 'pro_booster')),
  daily_points_available INTEGER NOT NULL DEFAULT 50,
  last_daily_reset TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  subscription_status TEXT DEFAULT 'free' CHECK (subscription_status IN ('free', 'active', 'cancelled', 'expired')),
  subscription_expires_at TIMESTAMPTZ,
  total_points_spent_all_time INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Tour promotion scores (tracks all score types for different leaderboards)
CREATE TABLE IF NOT EXISTS tour_promotions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id TEXT NOT NULL UNIQUE,
  total_score INTEGER NOT NULL DEFAULT 0, -- All Time
  monthly_score INTEGER NOT NULL DEFAULT 0, -- This Month (resets monthly)
  weekly_score INTEGER NOT NULL DEFAULT 0, -- This Week (resets weekly)
  past_28_days_score INTEGER NOT NULL DEFAULT 0, -- Past 28 Days (rolling window)
  region TEXT, -- 'caribbean', 'europe', 'north_america', 'asia', etc.
  last_promoted_at TIMESTAMPTZ,
  first_promoted_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Point spending transactions (audit trail)
CREATE TABLE IF NOT EXISTS promotion_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  product_id TEXT NOT NULL,
  points_spent INTEGER NOT NULL CHECK (points_spent > 0),
  transaction_type TEXT NOT NULL CHECK (transaction_type IN ('daily_points', 'a_la_carte')),
  package_name TEXT, -- For a la carte: '24_hour_blitz', '7_day_push', etc.
  personalized_message TEXT, -- For a la carte (max 200 chars)
  promotion_start TIMESTAMPTZ, -- For a la carte guaranteed time
  promotion_end TIMESTAMPTZ, -- For a la carte guaranteed time
  score_type TEXT NOT NULL DEFAULT 'all' CHECK (score_type IN ('all', 'monthly', 'weekly', 'past_28_days')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Monthly winners (historical tracking for "Winner of December" etc.)
CREATE TABLE IF NOT EXISTS monthly_winners (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id TEXT NOT NULL,
  region TEXT,
  month INTEGER NOT NULL CHECK (month >= 1 AND month <= 12),
  year INTEGER NOT NULL,
  total_score INTEGER NOT NULL,
  rank INTEGER NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(product_id, region, month, year)
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_promotion_accounts_user_id ON promotion_accounts(user_id);
CREATE INDEX IF NOT EXISTS idx_promotion_accounts_last_reset ON promotion_accounts(last_daily_reset);
CREATE INDEX IF NOT EXISTS idx_tour_promotions_product_id ON tour_promotions(product_id);
CREATE INDEX IF NOT EXISTS idx_tour_promotions_total_score ON tour_promotions(total_score DESC);
CREATE INDEX IF NOT EXISTS idx_tour_promotions_monthly_score ON tour_promotions(monthly_score DESC);
CREATE INDEX IF NOT EXISTS idx_tour_promotions_weekly_score ON tour_promotions(weekly_score DESC);
CREATE INDEX IF NOT EXISTS idx_tour_promotions_past_28_days ON tour_promotions(past_28_days_score DESC);
CREATE INDEX IF NOT EXISTS idx_tour_promotions_region ON tour_promotions(region);
CREATE INDEX IF NOT EXISTS idx_promotion_transactions_user_id ON promotion_transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_promotion_transactions_product_id ON promotion_transactions(product_id);
CREATE INDEX IF NOT EXISTS idx_promotion_transactions_created_at ON promotion_transactions(created_at);
CREATE INDEX IF NOT EXISTS idx_monthly_winners_region_month_year ON monthly_winners(region, month, year, rank);

-- Function to automatically update updated_at
CREATE OR REPLACE FUNCTION update_promotion_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for updated_at
CREATE TRIGGER update_promotion_accounts_updated_at
  BEFORE UPDATE ON promotion_accounts
  FOR EACH ROW
  EXECUTE FUNCTION update_promotion_updated_at();

CREATE TRIGGER update_tour_promotions_updated_at
  BEFORE UPDATE ON tour_promotions
  FOR EACH ROW
  EXECUTE FUNCTION update_promotion_updated_at();

-- Function to reset daily points (called by cron or API)
CREATE OR REPLACE FUNCTION reset_daily_points()
RETURNS void AS $$
BEGIN
  UPDATE promotion_accounts
  SET 
    daily_points_available = CASE 
      WHEN tier = 'pro_booster' AND subscription_status = 'active' THEN 200
      ELSE 50
    END,
    last_daily_reset = NOW()
  WHERE 
    last_daily_reset < NOW() - INTERVAL '24 hours'
    OR last_daily_reset IS NULL;
END;
$$ LANGUAGE plpgsql;

-- Function to reset monthly scores (called on 1st of each month)
CREATE OR REPLACE FUNCTION reset_monthly_scores()
RETURNS void AS $$
BEGIN
  -- Archive current month's winners before reset
  INSERT INTO monthly_winners (product_id, region, month, year, total_score, rank)
  SELECT 
    product_id,
    region,
    EXTRACT(MONTH FROM NOW() - INTERVAL '1 month')::INTEGER,
    EXTRACT(YEAR FROM NOW() - INTERVAL '1 month')::INTEGER,
    monthly_score,
    ROW_NUMBER() OVER (PARTITION BY region ORDER BY monthly_score DESC)::INTEGER
  FROM tour_promotions
  WHERE monthly_score > 0
  ON CONFLICT (product_id, region, month, year) DO NOTHING;
  
  -- Reset monthly scores
  UPDATE tour_promotions SET monthly_score = 0;
END;
$$ LANGUAGE plpgsql;

-- Function to reset weekly scores (called on Mondays)
CREATE OR REPLACE FUNCTION reset_weekly_scores()
RETURNS void AS $$
BEGIN
  UPDATE tour_promotions SET weekly_score = 0;
END;
$$ LANGUAGE plpgsql;

-- Function to update past 28 days score (rolling window)
CREATE OR REPLACE FUNCTION update_past_28_days_scores()
RETURNS void AS $$
BEGIN
  UPDATE tour_promotions tp
  SET past_28_days_score = COALESCE((
    SELECT SUM(points_spent)
    FROM promotion_transactions
    WHERE product_id = tp.product_id
      AND created_at >= NOW() - INTERVAL '28 days'
  ), 0);
END;
$$ LANGUAGE plpgsql;

-- RLS Policies (Row Level Security)
ALTER TABLE promotion_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE tour_promotions ENABLE ROW LEVEL SECURITY;
ALTER TABLE promotion_transactions ENABLE ROW LEVEL SECURITY;

-- Users can read their own promotion account
CREATE POLICY "Users can view own promotion account"
  ON promotion_accounts FOR SELECT
  USING (auth.uid() = user_id);

-- Users can update their own promotion account (for spending points)
CREATE POLICY "Users can update own promotion account"
  ON promotion_accounts FOR UPDATE
  USING (auth.uid() = user_id);

-- Anyone can read tour promotions (for leaderboard)
CREATE POLICY "Anyone can view tour promotions"
  ON tour_promotions FOR SELECT
  USING (true);

-- Users can read their own transactions
CREATE POLICY "Users can view own transactions"
  ON promotion_transactions FOR SELECT
  USING (auth.uid() = user_id);

-- Anyone can read monthly winners
ALTER TABLE monthly_winners ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view monthly winners"
  ON monthly_winners FOR SELECT
  USING (true);

