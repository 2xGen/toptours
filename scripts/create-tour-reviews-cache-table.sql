-- Tour Reviews Cache Table
-- Stores cached review data from Viator API
-- Complies with Viator requirements:
-- - Weekly cache refresh (triggered on page visit - lazy loading)
-- - Delete reviews that no longer exist in API
-- - Reviews must be non-indexed

CREATE TABLE IF NOT EXISTS tour_reviews_cache (
  product_id TEXT PRIMARY KEY,
  reviews_data JSONB NOT NULL,
  total_reviews_count INTEGER DEFAULT 0,
  viator_count INTEGER DEFAULT 0,
  tripadvisor_count INTEGER DEFAULT 0,
  cached_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  expires_at TIMESTAMPTZ NOT NULL,
  review_count_hash TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for fast lookups
CREATE INDEX IF NOT EXISTS idx_tour_reviews_expires ON tour_reviews_cache(expires_at);
CREATE INDEX IF NOT EXISTS idx_tour_reviews_product ON tour_reviews_cache(product_id);
CREATE INDEX IF NOT EXISTS idx_tour_reviews_cached_at ON tour_reviews_cache(cached_at);

-- Function to automatically update updated_at
CREATE OR REPLACE FUNCTION update_tour_reviews_cache_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to update updated_at on update
CREATE TRIGGER update_tour_reviews_cache_updated_at
  BEFORE UPDATE ON tour_reviews_cache
  FOR EACH ROW
  EXECUTE FUNCTION update_tour_reviews_cache_updated_at();

-- Comment
COMMENT ON TABLE tour_reviews_cache IS 'Cached review data from Viator API. Cache expires weekly and refreshes when page is visited (lazy loading). Reviews that no longer exist in API response are automatically deleted from cache on refresh.';
