-- Add destination_ids column to existing tour_operators_crm table
-- Safe to run even if column already exists

ALTER TABLE tour_operators_crm 
ADD COLUMN IF NOT EXISTS destination_ids TEXT[] DEFAULT '{}';

-- Add index for faster queries
CREATE INDEX IF NOT EXISTS idx_tour_operators_crm_destination_ids 
ON tour_operators_crm USING GIN(destination_ids);

