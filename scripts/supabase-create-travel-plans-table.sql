-- Travel Plans System
-- Community-driven travel plans/itineraries with boost system

-- Main plans table
CREATE TABLE IF NOT EXISTS travel_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL, -- "3 Days in Aruba" or custom
  slug TEXT UNIQUE NOT NULL,
  destination_id TEXT, -- "aruba", "amsterdam" (from destinationsData)
  description TEXT, -- optional, auto-generated
  cover_image_url TEXT, -- optional, from first tour/restaurant
  is_public BOOLEAN DEFAULT true,
  total_score INTEGER DEFAULT 0, -- boost system (all time)
  monthly_score INTEGER DEFAULT 0, -- boost system (this month)
  weekly_score INTEGER DEFAULT 0, -- boost system (this week)
  past_28_days_score INTEGER DEFAULT 0, -- boost system (rolling 28 days)
  last_promoted_at TIMESTAMPTZ,
  first_promoted_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Plan items (tours + restaurants)
CREATE TABLE IF NOT EXISTS travel_plan_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  plan_id UUID REFERENCES travel_plans(id) ON DELETE CASCADE NOT NULL,
  item_type TEXT NOT NULL CHECK (item_type IN ('tour', 'restaurant')),
  product_id TEXT, -- for tours (Viator product ID)
  restaurant_id INTEGER, -- for restaurants (references restaurants table)
  day_number INTEGER, -- 1, 2, 3... or NULL (unassigned)
  order_index INTEGER DEFAULT 0, -- order within day or unassigned
  selected_tip TEXT, -- prefilled tip ID (e.g., "morning", "reserve-ahead")
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Plan promotions (boost system - same as tours/restaurants)
CREATE TABLE IF NOT EXISTS plan_promotions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  plan_id UUID REFERENCES travel_plans(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  points INTEGER NOT NULL CHECK (points > 0),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(plan_id, user_id) -- one boost per user per plan
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_travel_plans_user_id ON travel_plans(user_id);
CREATE INDEX IF NOT EXISTS idx_travel_plans_slug ON travel_plans(slug);
CREATE INDEX IF NOT EXISTS idx_travel_plans_destination_id ON travel_plans(destination_id);
CREATE INDEX IF NOT EXISTS idx_travel_plans_total_score ON travel_plans(total_score DESC);
CREATE INDEX IF NOT EXISTS idx_travel_plans_monthly_score ON travel_plans(monthly_score DESC);
CREATE INDEX IF NOT EXISTS idx_travel_plans_weekly_score ON travel_plans(weekly_score DESC);
CREATE INDEX IF NOT EXISTS idx_travel_plans_past_28_days_score ON travel_plans(past_28_days_score DESC);
CREATE INDEX IF NOT EXISTS idx_travel_plans_is_public ON travel_plans(is_public) WHERE is_public = true;
CREATE INDEX IF NOT EXISTS idx_travel_plans_created_at ON travel_plans(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_travel_plan_items_plan_id ON travel_plan_items(plan_id);
CREATE INDEX IF NOT EXISTS idx_travel_plan_items_day_number ON travel_plan_items(plan_id, day_number, order_index);
CREATE INDEX IF NOT EXISTS idx_travel_plan_items_product_id ON travel_plan_items(product_id) WHERE product_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_travel_plan_items_restaurant_id ON travel_plan_items(restaurant_id) WHERE restaurant_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_plan_promotions_plan_id ON plan_promotions(plan_id);
CREATE INDEX IF NOT EXISTS idx_plan_promotions_user_id ON plan_promotions(user_id);
CREATE INDEX IF NOT EXISTS idx_plan_promotions_created_at ON plan_promotions(created_at);

-- Function to automatically update updated_at
CREATE OR REPLACE FUNCTION update_travel_plans_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION update_travel_plan_items_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for updated_at
CREATE TRIGGER update_travel_plans_updated_at
  BEFORE UPDATE ON travel_plans
  FOR EACH ROW
  EXECUTE FUNCTION update_travel_plans_updated_at();

CREATE TRIGGER update_travel_plan_items_updated_at
  BEFORE UPDATE ON travel_plan_items
  FOR EACH ROW
  EXECUTE FUNCTION update_travel_plan_items_updated_at();

-- Function to update plan scores when promoted (similar to tour promotions)
CREATE OR REPLACE FUNCTION update_plan_promotion_scores()
RETURNS TRIGGER AS $$
DECLARE
  points_to_add INTEGER;
BEGIN
  points_to_add := NEW.points;
  
  -- Update all score types
  UPDATE travel_plans
  SET 
    total_score = total_score + points_to_add,
    monthly_score = monthly_score + points_to_add,
    weekly_score = weekly_score + points_to_add,
    past_28_days_score = past_28_days_score + points_to_add,
    last_promoted_at = NOW(),
    first_promoted_at = COALESCE(first_promoted_at, NOW())
  WHERE id = NEW.plan_id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_update_plan_promotion_scores
  AFTER INSERT ON plan_promotions
  FOR EACH ROW
  EXECUTE FUNCTION update_plan_promotion_scores();

-- RLS Policies
ALTER TABLE travel_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE travel_plan_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE plan_promotions ENABLE ROW LEVEL SECURITY;

-- Users can read all public plans
CREATE POLICY "Public plans are viewable by everyone"
  ON travel_plans FOR SELECT
  USING (is_public = true);

-- Users can read their own plans (public or private)
CREATE POLICY "Users can view their own plans"
  ON travel_plans FOR SELECT
  USING (auth.uid() = user_id);

-- Users can insert their own plans
CREATE POLICY "Users can create their own plans"
  ON travel_plans FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can update their own plans
CREATE POLICY "Users can update their own plans"
  ON travel_plans FOR UPDATE
  USING (auth.uid() = user_id);

-- Users can delete their own plans
CREATE POLICY "Users can delete their own plans"
  ON travel_plans FOR DELETE
  USING (auth.uid() = user_id);

-- Plan items: users can read items for plans they can view
CREATE POLICY "Users can view items for public plans"
  ON travel_plan_items FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM travel_plans
      WHERE travel_plans.id = travel_plan_items.plan_id
      AND travel_plans.is_public = true
    )
  );

-- Plan items: users can read items for their own plans
CREATE POLICY "Users can view items for their own plans"
  ON travel_plan_items FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM travel_plans
      WHERE travel_plans.id = travel_plan_items.plan_id
      AND travel_plans.user_id = auth.uid()
    )
  );

-- Plan items: users can insert items for their own plans
CREATE POLICY "Users can create items for their own plans"
  ON travel_plan_items FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM travel_plans
      WHERE travel_plans.id = travel_plan_items.plan_id
      AND travel_plans.user_id = auth.uid()
    )
  );

-- Plan items: users can update items for their own plans
CREATE POLICY "Users can update items for their own plans"
  ON travel_plan_items FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM travel_plans
      WHERE travel_plans.id = travel_plan_items.plan_id
      AND travel_plans.user_id = auth.uid()
    )
  );

-- Plan items: users can delete items for their own plans
CREATE POLICY "Users can delete items for their own plans"
  ON travel_plan_items FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM travel_plans
      WHERE travel_plans.id = travel_plan_items.plan_id
      AND travel_plans.user_id = auth.uid()
    )
  );

-- Plan promotions: users can read all promotions
CREATE POLICY "Plan promotions are viewable by everyone"
  ON plan_promotions FOR SELECT
  USING (true);

-- Plan promotions: users can create promotions
CREATE POLICY "Users can create plan promotions"
  ON plan_promotions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Plan promotions: users can delete their own promotions
CREATE POLICY "Users can delete their own plan promotions"
  ON plan_promotions FOR DELETE
  USING (auth.uid() = user_id);

