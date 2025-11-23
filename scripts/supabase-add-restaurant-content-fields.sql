-- Add fields for AI-generated unique content, SEO title, and meta description
-- Run this after the initial table creation and other field additions

ALTER TABLE restaurants
ADD COLUMN IF NOT EXISTS unique_content TEXT,
ADD COLUMN IF NOT EXISTS seo_title VARCHAR(255),
ADD COLUMN IF NOT EXISTS meta_description VARCHAR(255);

-- Add index for faster queries
CREATE INDEX IF NOT EXISTS idx_restaurants_seo_title ON restaurants(seo_title);

COMMENT ON COLUMN restaurants.unique_content IS 'AI-generated unique content description (100-150 words)';
COMMENT ON COLUMN restaurants.seo_title IS 'AI-generated SEO title (under 60 characters)';
COMMENT ON COLUMN restaurants.meta_description IS 'AI-generated meta description (under 160 characters)';

