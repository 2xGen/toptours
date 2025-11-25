-- Viator destinations reference table
-- Stores the 3,300+ destination IDs we already imported from Viator
-- Allows fast lookups for breadcrumbs, promotions, etc.

CREATE TABLE IF NOT EXISTS viator_destinations (
  id TEXT PRIMARY KEY, -- Viator destinationId
  name TEXT NOT NULL,
  slug TEXT NOT NULL,
  country TEXT,
  region TEXT,
  type TEXT,
  parent_destination_id TEXT,
  lookup_id TEXT,
  default_currency_code TEXT,
  time_zone TEXT,
  destination_url TEXT,
  country_calling_code TEXT,
  iata_codes TEXT[],
  languages TEXT[],
  raw JSONB, -- Store the full JSON payload for future use
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE UNIQUE INDEX IF NOT EXISTS viator_destinations_slug_key ON viator_destinations(slug);
CREATE INDEX IF NOT EXISTS viator_destinations_country_idx ON viator_destinations(country);
CREATE INDEX IF NOT EXISTS viator_destinations_region_idx ON viator_destinations(region);

-- Simple trigger to keep updated_at fresh
CREATE OR REPLACE FUNCTION update_viator_destinations_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_viator_destinations_updated_at ON viator_destinations;
CREATE TRIGGER trg_viator_destinations_updated_at
  BEFORE UPDATE ON viator_destinations
  FOR EACH ROW
  EXECUTE FUNCTION update_viator_destinations_updated_at();

-- RLS: keep it simple for now (internal reference table)
ALTER TABLE viator_destinations DISABLE ROW LEVEL SECURITY;

