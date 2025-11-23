-- Add additional SEO and valuable fields from Google Places API
-- Run this after creating the restaurants table and adding attributes

DO $$ 
BEGIN
  -- Address Components (for structured data)
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'restaurants' AND column_name = 'address_components') THEN
    ALTER TABLE restaurants ADD COLUMN address_components JSONB;
  END IF;
  
  -- Plus Code (Google location code)
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'restaurants' AND column_name = 'plus_code') THEN
    ALTER TABLE restaurants ADD COLUMN plus_code JSONB;
  END IF;
  
  -- Viewport (for maps bounding box)
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'restaurants' AND column_name = 'viewport') THEN
    ALTER TABLE restaurants ADD COLUMN viewport JSONB;
  END IF;
  
  -- Business Status (OPERATIONAL, CLOSED_PERMANENTLY, etc.)
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'restaurants' AND column_name = 'business_status') THEN
    ALTER TABLE restaurants ADD COLUMN business_status TEXT;
  END IF;
  
  -- Primary Type (Restaurant, Bar, etc.)
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'restaurants' AND column_name = 'primary_type') THEN
    ALTER TABLE restaurants ADD COLUMN primary_type TEXT;
  END IF;
  
  -- Additional Service Attributes
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'restaurants' AND column_name = 'serves_beer') THEN
    ALTER TABLE restaurants ADD COLUMN serves_beer BOOLEAN;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'restaurants' AND column_name = 'serves_wine') THEN
    ALTER TABLE restaurants ADD COLUMN serves_wine BOOLEAN;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'restaurants' AND column_name = 'serves_brunch') THEN
    ALTER TABLE restaurants ADD COLUMN serves_brunch BOOLEAN;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'restaurants' AND column_name = 'serves_dinner') THEN
    ALTER TABLE restaurants ADD COLUMN serves_dinner BOOLEAN;
  END IF;
  
  -- Timezone
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'restaurants' AND column_name = 'utc_offset_minutes') THEN
    ALTER TABLE restaurants ADD COLUMN utc_offset_minutes INTEGER;
  END IF;
  
  -- HTML Formatted Address (for structured data)
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'restaurants' AND column_name = 'adr_format_address') THEN
    ALTER TABLE restaurants ADD COLUMN adr_format_address TEXT;
  END IF;
  
  -- Google Maps Direct Links
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'restaurants' AND column_name = 'google_maps_uri') THEN
    ALTER TABLE restaurants ADD COLUMN google_maps_uri TEXT;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'restaurants' AND column_name = 'reviews_uri') THEN
    ALTER TABLE restaurants ADD COLUMN reviews_uri TEXT;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'restaurants' AND column_name = 'photos_uri') THEN
    ALTER TABLE restaurants ADD COLUMN photos_uri TEXT;
  END IF;
  
  -- Next Open Time (when restaurant next opens)
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'restaurants' AND column_name = 'next_open_time') THEN
    ALTER TABLE restaurants ADD COLUMN next_open_time TIMESTAMPTZ;
  END IF;
  
  -- Open Now Status
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'restaurants' AND column_name = 'open_now') THEN
    ALTER TABLE restaurants ADD COLUMN open_now BOOLEAN;
  END IF;
END $$;

-- Comments for documentation
COMMENT ON COLUMN restaurants.address_components IS 'Structured address components (street_number, route, locality, country) for SEO structured data';
COMMENT ON COLUMN restaurants.plus_code IS 'Google Plus Code for location';
COMMENT ON COLUMN restaurants.business_status IS 'Business status: OPERATIONAL, CLOSED_PERMANENTLY, etc.';
COMMENT ON COLUMN restaurants.primary_type IS 'Primary business type (Restaurant, Bar, etc.)';
COMMENT ON COLUMN restaurants.google_maps_uri IS 'Direct Google Maps URI';
COMMENT ON COLUMN restaurants.reviews_uri IS 'Direct link to Google reviews page';
COMMENT ON COLUMN restaurants.photos_uri IS 'Direct link to Google photos page';
COMMENT ON COLUMN restaurants.next_open_time IS 'When the restaurant next opens (for closed restaurants)';
COMMENT ON COLUMN restaurants.open_now IS 'Whether the restaurant is currently open';

