-- Batched delete for viator_cache (tour + similar_tours) to avoid statement timeout.
-- Run ONE of the options below. Repeat the same statement until it returns 0 rows.

-- =============================================================================
-- OPTION A: Delete in batches of 2000 (run repeatedly until 0 rows deleted)
-- =============================================================================
-- Copy-paste and run in Supabase SQL Editor. Run again until "DELETE 0" or no rows.

WITH batch AS (
  SELECT id
  FROM viator_cache
  WHERE cache_type IN ('tour', 'similar_tours')
  ORDER BY id
  LIMIT 2000
)
DELETE FROM viator_cache
WHERE id IN (SELECT id FROM batch);

-- =============================================================================
-- OPTION B: Tours only, batches of 2000 (if you want to keep similar_tours)
-- =============================================================================
-- Uncomment and run repeatedly:

-- WITH batch AS (
--   SELECT id FROM viator_cache WHERE cache_type = 'tour' ORDER BY id LIMIT 2000
-- )
-- DELETE FROM viator_cache WHERE id IN (SELECT id FROM batch);

-- =============================================================================
-- OPTION C: Smaller batches (1000) if 2000 still times out
-- =============================================================================
-- Change LIMIT 2000 to LIMIT 1000 in Option A or B above.
