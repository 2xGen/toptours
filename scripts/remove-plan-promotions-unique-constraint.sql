-- Remove the unique constraint on plan_promotions to allow users to boost plans multiple times
-- This matches the behavior of tours and restaurants which can be boosted multiple times

-- Drop the unique constraint
ALTER TABLE plan_promotions 
DROP CONSTRAINT IF EXISTS plan_promotions_plan_id_user_id_key;

-- Also drop any unique index that might exist
DROP INDEX IF EXISTS plan_promotions_plan_id_user_id_key;

