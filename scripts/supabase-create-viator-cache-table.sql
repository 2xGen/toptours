-- Create viator_cache table for caching Viator API responses
-- This reduces API calls and costs significantly

CREATE TABLE IF NOT EXISTS viator_cache (
  id BIGSERIAL PRIMARY KEY,
  product_id TEXT,
  cache_key TEXT,
  cache_type TEXT DEFAULT 'tour' CHECK (cache_type IN ('tour', 'similar_tours')),
  tour_data JSONB NOT NULL,
  cached_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for fast lookups
CREATE INDEX IF NOT EXISTS idx_viator_cache_product_id ON viator_cache(product_id);
CREATE INDEX IF NOT EXISTS idx_viator_cache_key_type ON viator_cache(cache_key, cache_type);
CREATE INDEX IF NOT EXISTS idx_viator_cache_cached_at ON viator_cache(cached_at);

-- Unique constraint for product_id (one cache entry per tour)
CREATE UNIQUE INDEX IF NOT EXISTS idx_viator_cache_product_id_unique ON viator_cache(product_id) WHERE cache_type = 'tour';

-- Unique constraint for cache_key + cache_type (for similar tours)
CREATE UNIQUE INDEX IF NOT EXISTS idx_viator_cache_key_type_unique ON viator_cache(cache_key, cache_type) WHERE cache_type = 'similar_tours';

-- Function to automatically update updated_at
CREATE OR REPLACE FUNCTION update_viator_cache_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to update updated_at on update
CREATE TRIGGER update_viator_cache_updated_at
  BEFORE UPDATE ON viator_cache
  FOR EACH ROW
  EXECUTE FUNCTION update_viator_cache_updated_at();

-- Cleanup old cache entries (older than 7 days)
CREATE OR REPLACE FUNCTION cleanup_old_viator_cache()
RETURNS void AS $$
BEGIN
  DELETE FROM viator_cache
  WHERE cached_at < NOW() - INTERVAL '7 days';
END;
$$ LANGUAGE plpgsql;

-- Optional: Create a scheduled job to run cleanup (requires pg_cron extension)
-- SELECT cron.schedule('cleanup-viator-cache', '0 2 * * *', 'SELECT cleanup_old_viator_cache()');

