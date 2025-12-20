-- Add GIN index on cuisines array for fast filtering
-- This index enables efficient queries like "find all restaurants with cuisine X"
-- GIN (Generalized Inverted Index) is optimized for array containment queries

CREATE INDEX IF NOT EXISTS idx_restaurants_cuisines_gin ON restaurants USING GIN (cuisines);

-- This index supports queries like:
-- SELECT * FROM restaurants WHERE cuisines @> ARRAY['Seafood'];
-- SELECT * FROM restaurants WHERE cuisines && ARRAY['Italian', 'Mediterranean'];

COMMENT ON INDEX idx_restaurants_cuisines_gin IS 'GIN index on cuisines array for fast filtering by cuisine type';

