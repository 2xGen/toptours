-- Add structured_values JSONB column to tour_enrichment table
-- This stores extracted tour characteristics (adventureLevel, structureLevel, etc.)
-- for preference matching without requiring AI on every request

ALTER TABLE tour_enrichment 
ADD COLUMN IF NOT EXISTS structured_values JSONB;

-- Add index for faster queries
CREATE INDEX IF NOT EXISTS idx_tour_enrichment_structured_values 
ON tour_enrichment USING GIN (structured_values);

-- Add comment
COMMENT ON COLUMN tour_enrichment.structured_values IS 'Structured tour values extracted by AI (one-time): adventureLevel, structureLevel, foodImportance, groupType, budgetLevel, relaxationVsExploration (all 0-100)';

