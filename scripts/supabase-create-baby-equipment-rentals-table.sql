-- Create baby_equipment_rentals table for storing destination-specific baby equipment rental pages
-- This table stores unique content per destination (hero, categories, FAQs, etc.)

CREATE TABLE IF NOT EXISTS baby_equipment_rentals (
  id BIGSERIAL PRIMARY KEY,
  destination_id TEXT NOT NULL UNIQUE, -- Links to destinations table (e.g., 'aruba', 'curacao')
  
  -- Hero Section
  hero_title TEXT, -- "Baby Equipment Rentals in Curacao" (if null, auto-generate)
  hero_description TEXT, -- Destination-specific intro text
  hero_tagline TEXT, -- Short tagline (e.g., "Families and little ones adore Curacao...")
  
  -- Product Categories (JSONB array of available categories)
  -- Format: [{"name": "Cribs & Sleep", "icon": "🛏️", "description": "...", "enabled": true}, ...]
  -- If null, use universal categories template
  product_categories JSONB, -- Available categories for this destination (null = all universal)
  
  -- Content Sections
  intro_text TEXT, -- Optional intro paragraph before product categories
  rates_note TEXT, -- "Rates vary by provider and availability..." (optional)
  
  -- FAQ Section (JSONB array of FAQs)
  -- Format: [{"question": "...", "answer": "..."}, ...]
  -- If null, use generic FAQs
  faqs JSONB, -- Destination-specific FAQs
  
  -- Pricing Info (optional)
  pricing_info JSONB, -- {"crib_min": 12, "crib_max": 22, "car_seat_min": 8, "car_seat_max": 12, "currency": "€"}
  
  -- SEO
  seo_title TEXT, -- Custom SEO title (if null, auto-generate)
  seo_description TEXT, -- Custom SEO description (if null, auto-generate)
  seo_keywords TEXT[], -- Custom keywords array
  
  -- Metadata
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for fast lookups
CREATE INDEX IF NOT EXISTS idx_baby_equipment_rentals_destination_id ON baby_equipment_rentals(destination_id);
CREATE INDEX IF NOT EXISTS idx_baby_equipment_rentals_is_active ON baby_equipment_rentals(is_active);

-- Unique constraint for destination_id
CREATE UNIQUE INDEX IF NOT EXISTS idx_baby_equipment_rentals_destination_unique ON baby_equipment_rentals(destination_id);

-- Function to automatically update updated_at
CREATE OR REPLACE FUNCTION update_baby_equipment_rentals_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to update updated_at on update
CREATE TRIGGER update_baby_equipment_rentals_updated_at
  BEFORE UPDATE ON baby_equipment_rentals
  FOR EACH ROW
  EXECUTE FUNCTION update_baby_equipment_rentals_updated_at();

-- RLS: Keep it simple for now (internal reference table)
ALTER TABLE baby_equipment_rentals DISABLE ROW LEVEL SECURITY;
