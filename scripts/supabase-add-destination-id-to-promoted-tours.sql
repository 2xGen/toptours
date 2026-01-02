-- Add destination_id column to promoted_tours table
-- This allows us to directly query promoted tours by destination without joining with operator_tours
-- 
-- IMPORTANT: Run scripts/supabase-add-destination-id-to-operator-tours.sql FIRST
-- to add destination_id to operator_tours table

ALTER TABLE promoted_tours 
  ADD COLUMN IF NOT EXISTS destination_id TEXT;

-- Create index for performance
CREATE INDEX IF NOT EXISTS idx_promoted_tours_destination_id ON promoted_tours(destination_id) WHERE status = 'active';

-- Add comment
COMMENT ON COLUMN promoted_tours.destination_id IS 'Destination ID (slug or numeric) where this tour should be promoted. Retrieved from operator_tours table or tour data.';

-- Update existing records with destination_id from operator_tours (if operator_tours has destination_id)
-- This will only work if operator_tours.destination_id column exists
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'operator_tours' AND column_name = 'destination_id'
  ) THEN
    UPDATE promoted_tours pt
    SET destination_id = ot.destination_id
    FROM operator_tours ot
    WHERE pt.product_id = ot.product_id
      AND pt.destination_id IS NULL
      AND ot.destination_id IS NOT NULL;
    
    RAISE NOTICE 'Updated promoted_tours with destination_id from operator_tours';
  ELSE
    RAISE NOTICE 'operator_tours.destination_id column does not exist. Run supabase-add-destination-id-to-operator-tours.sql first.';
  END IF;
END $$;

