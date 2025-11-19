-- Add daily_points_available to profiles table for simpler, more reliable access
ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS daily_points_available INTEGER DEFAULT 50;

-- Set default value for existing users
UPDATE profiles
SET daily_points_available = 50
WHERE daily_points_available IS NULL;

