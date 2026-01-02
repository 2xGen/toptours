-- Add destination_id column to operator_tours table
-- This allows us to store the destination where each tour operates
-- This is needed to efficiently query promoted tours by destination

ALTER TABLE operator_tours 
  ADD COLUMN IF NOT EXISTS destination_id TEXT;

-- Create index for performance
CREATE INDEX IF NOT EXISTS idx_operator_tours_destination_id ON operator_tours(destination_id);

-- Add comment
COMMENT ON COLUMN operator_tours.destination_id IS 'Destination ID (slug or numeric) where this tour operates. Retrieved from tour data when tour is added.';

-- Note: Existing records will have NULL destination_id
-- They will be populated when tours are updated or when we fetch tour data
-- New tours added will automatically have destination_id set from the tour data

