-- Add tour metadata columns to tour_promotions table
-- This allows us to cache tour name, image, slug, region, and destination_id to avoid API calls

ALTER TABLE tour_promotions
ADD COLUMN IF NOT EXISTS tour_name TEXT,
ADD COLUMN IF NOT EXISTS tour_image_url TEXT,
ADD COLUMN IF NOT EXISTS tour_slug TEXT,
ADD COLUMN IF NOT EXISTS tour_region TEXT,
ADD COLUMN IF NOT EXISTS destination_id TEXT;

-- Add indexes for faster lookups
CREATE INDEX IF NOT EXISTS idx_tour_promotions_tour_name ON tour_promotions(tour_name);
CREATE INDEX IF NOT EXISTS idx_tour_promotions_tour_region ON tour_promotions(tour_region);
CREATE INDEX IF NOT EXISTS idx_tour_promotions_destination_id ON tour_promotions(destination_id);
CREATE INDEX IF NOT EXISTS idx_tour_promotions_tour_slug ON tour_promotions(tour_slug);

-- Update existing records: if region is set but tour_region is not, copy it
UPDATE tour_promotions
SET tour_region = region
WHERE tour_region IS NULL AND region IS NOT NULL;

