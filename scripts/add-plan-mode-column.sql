-- Add plan_mode column to travel_plans table
ALTER TABLE travel_plans 
ADD COLUMN IF NOT EXISTS plan_mode TEXT DEFAULT 'favorites' CHECK (plan_mode IN ('favorites', 'itinerary'));

-- Create index for filtering by plan mode
CREATE INDEX IF NOT EXISTS idx_travel_plans_plan_mode ON travel_plans(plan_mode) WHERE is_public = true;

