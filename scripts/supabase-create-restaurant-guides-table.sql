-- Restaurant Guides System
-- Stores destination restaurant guides (e.g., "Best Seafood Restaurants in Aruba", "Family-Friendly Restaurants in Aruba")
-- Similar structure to category_guides but for restaurant content

CREATE TABLE IF NOT EXISTS restaurant_guides (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  destination_id TEXT NOT NULL, -- e.g., "aruba", "marbella" (from destinationsData.js)
  category_slug TEXT NOT NULL, -- e.g., "best-seafood-restaurants", "family-friendly-restaurants"
  category_name TEXT NOT NULL, -- e.g., "Best Seafood Restaurants", "Family-Friendly Restaurants"
  
  -- Basic Information
  title TEXT NOT NULL, -- e.g., "Best Seafood Restaurants in Aruba"
  subtitle TEXT NOT NULL, -- e.g., "Fresh catches, ocean views, and unforgettable dining"
  hero_image TEXT, -- URL to hero image
  
  -- Statistics (auto-calculated from filtered restaurants)
  stats JSONB, -- { restaurantsAvailable: 24, avgRating: 4.5, priceFrom: "$", priceTo: "$$$" }
  
  -- Content
  introduction TEXT NOT NULL, -- SEO-optimized intro paragraph
  seo JSONB, -- { title: "...", description: "...", keywords: "..." }
  why_choose JSONB, -- Array of { icon, title, description }
  what_to_expect JSONB, -- { title: "...", items: [{ icon, title, description }] }
  expert_tips TEXT[], -- Array of tip strings
  faqs JSONB, -- Array of { question, answer }
  
  -- Filter Criteria (stored for dynamic filtering)
  filter_criteria JSONB, -- { cuisines: ["Seafood"], minRating: 4.0, minReviews: 50, priceLevelMin: null, priceLevelMax: null, goodForChildren: null, liveMusic: null, outdoorSeating: null, reservable: null, servesWine: null, servesCocktails: null, sortBy: "rating", sortOrder: "desc" }
  
  -- Metadata
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  -- Unique constraint: one guide per destination-category combination
  UNIQUE(destination_id, category_slug)
);

-- Indexes for fast lookups
CREATE INDEX IF NOT EXISTS idx_restaurant_guides_destination_id ON restaurant_guides(destination_id);
CREATE INDEX IF NOT EXISTS idx_restaurant_guides_category_slug ON restaurant_guides(category_slug);
CREATE INDEX IF NOT EXISTS idx_restaurant_guides_destination_category ON restaurant_guides(destination_id, category_slug);

-- Function to automatically update updated_at
CREATE OR REPLACE FUNCTION update_restaurant_guides_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to update updated_at on update
CREATE TRIGGER update_restaurant_guides_updated_at
  BEFORE UPDATE ON restaurant_guides
  FOR EACH ROW
  EXECUTE FUNCTION update_restaurant_guides_updated_at();

-- RLS: Public read access, but we'll manage writes through service role
ALTER TABLE restaurant_guides ENABLE ROW LEVEL SECURITY;

-- Policy: Allow public read access
CREATE POLICY "Allow public read access"
  ON restaurant_guides
  FOR SELECT
  USING (true);

-- Policy: Only service role can insert/update/delete
CREATE POLICY "Service role only for writes"
  ON restaurant_guides
  FOR ALL
  USING (auth.role() = 'service_role');

