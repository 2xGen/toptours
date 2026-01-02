-- Add tour_name and email columns to promoted_tours table
-- This makes it easier to display tour information in the profile page

ALTER TABLE promoted_tours
ADD COLUMN IF NOT EXISTS tour_name TEXT,
ADD COLUMN IF NOT EXISTS email TEXT,
ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL;

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_promoted_tours_tour_name ON promoted_tours(tour_name);
CREATE INDEX IF NOT EXISTS idx_promoted_tours_email ON promoted_tours(email);
CREATE INDEX IF NOT EXISTS idx_promoted_tours_user_id ON promoted_tours(user_id);

-- Add comments
COMMENT ON COLUMN promoted_tours.tour_name IS 'Tour title/name for display purposes';
COMMENT ON COLUMN promoted_tours.email IS 'Email of the user who created the promotion';
COMMENT ON COLUMN promoted_tours.user_id IS 'User ID of the user who created the promotion';

