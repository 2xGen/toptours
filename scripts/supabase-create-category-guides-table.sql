-- Category Guides System
-- Stores destination category guides (e.g., "Aruba Sunset Cruises", "Marbella Old Town Walking Tours")
-- This replaces the large JSON files for better scalability and performance

CREATE TABLE IF NOT EXISTS category_guides (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  destination_id TEXT NOT NULL, -- e.g., "marbella", "aruba" (from destinationsData.js)
  category_slug TEXT NOT NULL, -- e.g., "marbella-old-town-walking-tours", "sunset-cruises"
  category_name TEXT NOT NULL, -- e.g., "Marbella Old Town Walking Tours", "Sunset Cruises"
  
  -- Basic Information
  title TEXT NOT NULL,
  subtitle TEXT NOT NULL,
  hero_image TEXT, -- URL to hero image
  
  -- Statistics
  stats JSONB, -- { toursAvailable: 18, priceFrom: 25, duration: "2-3 hours" }
  
  -- Content
  introduction TEXT NOT NULL,
  seo JSONB, -- { title: "...", description: "...", keywords: "..." }
  why_choose JSONB, -- Array of { icon, title, description }
  tour_types JSONB, -- Array of { icon, title, description, features: [] }
  what_to_expect JSONB, -- { title: "...", items: [{ icon, title, description }] }
  expert_tips TEXT[], -- Array of tip strings
  faqs JSONB, -- Array of { question, answer }
  
  -- Metadata
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  -- Unique constraint: one guide per destination-category combination
  UNIQUE(destination_id, category_slug)
);

-- Indexes for fast lookups
CREATE INDEX IF NOT EXISTS idx_category_guides_destination_id ON category_guides(destination_id);
CREATE INDEX IF NOT EXISTS idx_category_guides_category_slug ON category_guides(category_slug);
CREATE INDEX IF NOT EXISTS idx_category_guides_destination_category ON category_guides(destination_id, category_slug);

-- Function to automatically update updated_at
CREATE OR REPLACE FUNCTION update_category_guides_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to update updated_at on update
CREATE TRIGGER update_category_guides_updated_at
  BEFORE UPDATE ON category_guides
  FOR EACH ROW
  EXECUTE FUNCTION update_category_guides_updated_at();

-- RLS: Public read access, but we'll manage writes through service role
ALTER TABLE category_guides ENABLE ROW LEVEL SECURITY;

-- Policy: Allow public read access
CREATE POLICY "Allow public read access"
  ON category_guides
  FOR SELECT
  USING (true);

-- Policy: Only service role can insert/update/delete
CREATE POLICY "Service role only for writes"
  ON category_guides
  FOR ALL
  USING (auth.role() = 'service_role');

