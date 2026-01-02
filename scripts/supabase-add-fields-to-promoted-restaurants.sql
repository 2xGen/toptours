-- Add destination_id, restaurant_slug, and restaurant_name to promoted_restaurants table
-- These fields match restaurant_subscriptions for consistency

-- Add columns if they don't exist
DO $$ 
BEGIN
  -- Add destination_id
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'promoted_restaurants' AND column_name = 'destination_id'
  ) THEN
    ALTER TABLE promoted_restaurants ADD COLUMN destination_id TEXT;
  END IF;
  
  -- Add restaurant_slug
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'promoted_restaurants' AND column_name = 'restaurant_slug'
  ) THEN
    ALTER TABLE promoted_restaurants ADD COLUMN restaurant_slug TEXT;
  END IF;
  
  -- Add restaurant_name
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'promoted_restaurants' AND column_name = 'restaurant_name'
  ) THEN
    ALTER TABLE promoted_restaurants ADD COLUMN restaurant_name TEXT;
  END IF;
END $$;

-- Populate existing records from restaurants table
-- Note: restaurants.destination_id is already stored as slug, so we can use it directly
UPDATE promoted_restaurants pr
SET 
  destination_id = LOWER(TRIM(r.destination_id)), -- Normalize to lowercase slug
  restaurant_slug = r.slug,
  restaurant_name = r.name
FROM restaurants r
WHERE pr.restaurant_id = r.id
  AND (pr.destination_id IS NULL OR pr.restaurant_slug IS NULL OR pr.restaurant_name IS NULL);

-- If destination_id is numeric, convert it to slug by looking up in viator_destinations
-- This handles cases where destination_id was stored as numeric ID (e.g., "4474")
UPDATE promoted_restaurants pr
SET destination_id = LOWER(vd.slug)
FROM viator_destinations vd
WHERE pr.destination_id ~ '^\d+$' -- Only numeric IDs
  AND vd.id::text = pr.destination_id
  AND vd.slug IS NOT NULL;

-- Create indexes for the new columns
CREATE INDEX IF NOT EXISTS idx_promoted_restaurants_destination_id ON promoted_restaurants(destination_id);
CREATE INDEX IF NOT EXISTS idx_promoted_restaurants_restaurant_slug ON promoted_restaurants(restaurant_slug);

-- Add comments
COMMENT ON COLUMN promoted_restaurants.destination_id IS 'Destination ID (slug) for efficient filtering, matches restaurant_subscriptions';
COMMENT ON COLUMN promoted_restaurants.restaurant_slug IS 'Restaurant slug for efficient filtering, matches restaurant_subscriptions';
COMMENT ON COLUMN promoted_restaurants.restaurant_name IS 'Restaurant name for display, matches restaurant_subscriptions';

