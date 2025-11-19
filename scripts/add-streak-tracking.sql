-- Add Streak Tracking to Promotion System
-- Adds gamification elements: streak days and last claim date

-- Add streak tracking columns to promotion_accounts
ALTER TABLE promotion_accounts
  ADD COLUMN IF NOT EXISTS streak_days INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS last_claim_date DATE;

-- Create index for streak queries (optional, for leaderboards)
CREATE INDEX IF NOT EXISTS idx_promotion_accounts_streak ON promotion_accounts(streak_days DESC);

-- Update reset_daily_points function to track streaks
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
    END,
    -- Streak tracking: increment if claimed yesterday, reset if missed
    streak_days = CASE
      WHEN last_claim_date = CURRENT_DATE - INTERVAL '1 day' THEN COALESCE(streak_days, 0) + 1
      WHEN last_claim_date = CURRENT_DATE THEN COALESCE(streak_days, 0) -- Same day, keep streak
      WHEN last_claim_date IS NULL THEN 1 -- First time claiming
      ELSE 1 -- Missed a day, reset to 1
    END,
    last_claim_date = CURRENT_DATE
  WHERE 
    last_daily_reset < NOW() - INTERVAL '24 hours'
    OR last_daily_reset IS NULL;
END;
$$ LANGUAGE plpgsql;

