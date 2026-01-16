-- Create table for tracking tours that should be included in sitemap
-- Lightweight solution: tracks tours that have been visited/rendered
-- Similar to tour_operators_crm but specifically for sitemap generation

CREATE TABLE IF NOT EXISTS tour_sitemap (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id TEXT NOT NULL UNIQUE,
  tour_title TEXT,
  tour_slug TEXT,
  destination_id TEXT,
  destination_slug TEXT,
  first_visited_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  last_visited_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  visit_count INTEGER NOT NULL DEFAULT 1,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for fast lookups
CREATE INDEX IF NOT EXISTS idx_tour_sitemap_product_id ON tour_sitemap(product_id);
CREATE INDEX IF NOT EXISTS idx_tour_sitemap_destination_id ON tour_sitemap(destination_id);
CREATE INDEX IF NOT EXISTS idx_tour_sitemap_last_visited ON tour_sitemap(last_visited_at DESC);
CREATE INDEX IF NOT EXISTS idx_tour_sitemap_visit_count ON tour_sitemap(visit_count DESC);

-- Function to upsert tour visit (insert or update)
CREATE OR REPLACE FUNCTION upsert_tour_sitemap(
  p_product_id TEXT,
  p_tour_title TEXT DEFAULT NULL,
  p_tour_slug TEXT DEFAULT NULL,
  p_destination_id TEXT DEFAULT NULL,
  p_destination_slug TEXT DEFAULT NULL
)
RETURNS void AS $$
BEGIN
  INSERT INTO tour_sitemap (
    product_id,
    tour_title,
    tour_slug,
    destination_id,
    destination_slug,
    first_visited_at,
    last_visited_at,
    visit_count
  )
  VALUES (
    p_product_id,
    p_tour_title,
    p_tour_slug,
    p_destination_id,
    p_destination_slug,
    NOW(),
    NOW(),
    1
  )
  ON CONFLICT (product_id) 
  DO UPDATE SET
    tour_title = COALESCE(EXCLUDED.tour_title, tour_sitemap.tour_title),
    tour_slug = COALESCE(EXCLUDED.tour_slug, tour_sitemap.tour_slug),
    destination_id = COALESCE(EXCLUDED.destination_id, tour_sitemap.destination_id),
    destination_slug = COALESCE(EXCLUDED.destination_slug, tour_sitemap.destination_slug),
    last_visited_at = NOW(),
    visit_count = tour_sitemap.visit_count + 1,
    updated_at = NOW();
END;
$$ LANGUAGE plpgsql;

-- Function to automatically update updated_at
CREATE OR REPLACE FUNCTION update_tour_sitemap_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to update updated_at on update
CREATE TRIGGER update_tour_sitemap_updated_at
  BEFORE UPDATE ON tour_sitemap
  FOR EACH ROW
  EXECUTE FUNCTION update_tour_sitemap_updated_at();

-- Optional: Cleanup old tours (older than 1 year without visits)
-- Uncomment if you want to auto-cleanup
-- CREATE OR REPLACE FUNCTION cleanup_old_tour_sitemap()
-- RETURNS void AS $$
-- BEGIN
--   DELETE FROM tour_sitemap
--   WHERE last_visited_at < NOW() - INTERVAL '1 year'
--     AND visit_count < 5;
-- END;
-- $$ LANGUAGE plpgsql;

-- Add comment
COMMENT ON TABLE tour_sitemap IS 'Tracks tours that have been visited/rendered for sitemap generation. Lightweight solution to include only visited tours in sitemap.';
