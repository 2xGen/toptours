-- Add BiteReserve fields to restaurants table
-- This adds country_iso_code (2-letter ISO) and bitereserve_code (5-digit random code)

DO $$ 
BEGIN
  -- Add country_iso_code column (2-letter ISO code)
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'restaurants' AND column_name = 'country_iso_code') THEN
    ALTER TABLE restaurants ADD COLUMN country_iso_code TEXT;
  END IF;
  
  -- Add bitereserve_code column (5-digit code, e.g., "04480")
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'restaurants' AND column_name = 'bitereserve_code') THEN
    ALTER TABLE restaurants ADD COLUMN bitereserve_code TEXT;
  END IF;
END $$;

-- Create indexes for faster lookups
CREATE INDEX IF NOT EXISTS idx_restaurants_country_iso_code ON restaurants(country_iso_code);
CREATE INDEX IF NOT EXISTS idx_restaurants_bitereserve_code ON restaurants(bitereserve_code);

-- Create unique constraint for country_iso_code + bitereserve_code combination
-- This ensures each code is unique within a country
CREATE UNIQUE INDEX IF NOT EXISTS idx_restaurants_country_code_unique 
ON restaurants(country_iso_code, bitereserve_code) 
WHERE country_iso_code IS NOT NULL AND bitereserve_code IS NOT NULL;
