-- Create restaurants table for storing Google Places API restaurant data
-- This table stores restaurant information fetched from Google Places API

CREATE TABLE IF NOT EXISTS restaurants (
  id BIGSERIAL PRIMARY KEY,
  destination_id TEXT NOT NULL,
  google_place_id TEXT UNIQUE NOT NULL,
  slug TEXT NOT NULL,
  
  -- Basic Information
  name TEXT NOT NULL,
  short_name TEXT,
  description TEXT,
  summary TEXT,
  tagline TEXT,
  
  -- Images
  hero_image_url TEXT,
  image_alt TEXT,
  
  -- Contact Information
  address TEXT,
  formatted_address TEXT,
  phone TEXT,
  formatted_phone TEXT,
  email TEXT,
  website TEXT,
  google_maps_url TEXT,
  neighborhood TEXT,
  
  -- Location
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),
  
  -- Ratings & Reviews
  google_rating DECIMAL(3, 2),
  review_count INTEGER,
  rating_source TEXT DEFAULT 'Google Reviews',
  
  -- Cuisine & Pricing
  cuisines TEXT[], -- Array of cuisine types
  price_level INTEGER, -- 0-4 (0 = free, 4 = very expensive)
  price_range TEXT, -- e.g., "$$$ – $$$$"
  price_range_label TEXT,
  
  -- Hours
  opening_hours JSONB, -- Store hours as JSON
  
  -- Additional Data
  menu_highlights JSONB, -- Store menu highlights as JSON
  highlights TEXT[], -- Array of highlight strings
  review_summary TEXT,
  story JSONB, -- Store story paragraphs as JSON
  
  -- SEO
  seo_title TEXT,
  seo_description TEXT,
  seo_keywords TEXT[],
  
  -- Booking Information
  booking_partner TEXT,
  booking_note TEXT,
  booking_url TEXT,
  booking_is_active BOOLEAN DEFAULT false,
  
  -- Sustainability (optional)
  sustainability JSONB,
  
  -- Practical Info
  practical_info JSONB,
  
  -- Business Attributes
  outdoor_seating BOOLEAN,
  live_music BOOLEAN,
  menu_for_children BOOLEAN,
  serves_cocktails BOOLEAN,
  serves_dessert BOOLEAN,
  serves_coffee BOOLEAN,
  good_for_children BOOLEAN,
  allows_dogs BOOLEAN,
  restroom BOOLEAN,
  good_for_groups BOOLEAN,
  reservable BOOLEAN,
  dine_in BOOLEAN,
  takeout BOOLEAN,
  delivery BOOLEAN,
  
  -- Payment Options
  payment_options JSONB, -- { acceptsCreditCards, acceptsDebitCards, acceptsCashOnly, acceptsNfc }
  
  -- Parking Options
  parking_options JSONB, -- { paidParkingLot, paidStreetParking, valetParking, freeParkingLot, etc. }
  
  -- Accessibility Options
  accessibility_options JSONB, -- { wheelchairAccessibleEntrance, wheelchairAccessibleRestroom, wheelchairAccessibleSeating }
  
  -- Schema.org structured data
  schema_data JSONB,
  
  -- Metadata
  google_data JSONB, -- Store full Google Places API response for reference
  data_fetched_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  data_updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  -- Status
  is_active BOOLEAN DEFAULT true,
  is_featured BOOLEAN DEFAULT false
);

-- Indexes for fast lookups
CREATE INDEX IF NOT EXISTS idx_restaurants_destination_id ON restaurants(destination_id);
CREATE INDEX IF NOT EXISTS idx_restaurants_slug ON restaurants(slug);
CREATE INDEX IF NOT EXISTS idx_restaurants_google_place_id ON restaurants(google_place_id);
CREATE INDEX IF NOT EXISTS idx_restaurants_is_active ON restaurants(is_active);
CREATE INDEX IF NOT EXISTS idx_restaurants_is_featured ON restaurants(is_featured);
CREATE INDEX IF NOT EXISTS idx_restaurants_google_rating ON restaurants(google_rating DESC);

-- Unique constraint for destination_id + slug combination
CREATE UNIQUE INDEX IF NOT EXISTS idx_restaurants_destination_slug_unique ON restaurants(destination_id, slug);

-- Function to automatically update updated_at
CREATE OR REPLACE FUNCTION update_restaurants_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to update updated_at on update
CREATE TRIGGER update_restaurants_updated_at
  BEFORE UPDATE ON restaurants
  FOR EACH ROW
  EXECUTE FUNCTION update_restaurants_updated_at();

-- Function to automatically update data_updated_at when data changes
CREATE OR REPLACE FUNCTION update_restaurants_data_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.data_updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to update data_updated_at when google_data changes
CREATE TRIGGER update_restaurants_data_updated_at
  BEFORE UPDATE OF google_data, google_rating, review_count, opening_hours ON restaurants
  FOR EACH ROW
  EXECUTE FUNCTION update_restaurants_data_updated_at();

-- Comments for documentation
COMMENT ON TABLE restaurants IS 'Stores restaurant information fetched from Google Places API';
COMMENT ON COLUMN restaurants.google_place_id IS 'Unique Google Places API place ID';
COMMENT ON COLUMN restaurants.google_data IS 'Full JSON response from Google Places API for reference';
COMMENT ON COLUMN restaurants.data_fetched_at IS 'When the data was first fetched from Google Places API';
COMMENT ON COLUMN restaurants.data_updated_at IS 'When the Google Places data was last updated';

