-- Add support for 'destination_tours' cache type in viator_cache table
-- This allows caching all tours for a destination (7-day TTL)

-- Step 1: Drop the existing CHECK constraint if it exists
ALTER TABLE viator_cache 
DROP CONSTRAINT IF EXISTS viator_cache_cache_type_check;

-- Step 2: Add new CHECK constraint that includes 'destination_tours'
ALTER TABLE viator_cache 
ADD CONSTRAINT viator_cache_cache_type_check 
CHECK (cache_type IN ('tour', 'similar_tours', 'destination', 'destination_tours'));

-- Step 3: Add unique constraint for destination_tours caching (cache_key + cache_type)
CREATE UNIQUE INDEX IF NOT EXISTS idx_viator_cache_key_type_destination_tours_unique 
ON viator_cache(cache_key, cache_type) 
WHERE cache_type = 'destination_tours';

-- Verify the changes
-- You can run this to check:
-- SELECT constraint_name, constraint_type 
-- FROM information_schema.table_constraints 
-- WHERE table_name = 'viator_cache';

