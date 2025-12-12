-- Add restaurant columns to partner_invite_codes table
-- Run this if you already created the table without restaurant columns

ALTER TABLE partner_invite_codes 
ADD COLUMN IF NOT EXISTS restaurant_id INTEGER,
ADD COLUMN IF NOT EXISTS destination_id TEXT,
ADD COLUMN IF NOT EXISTS restaurant_slug TEXT,
ADD COLUMN IF NOT EXISTS restaurant_name TEXT,
ADD COLUMN IF NOT EXISTS restaurant_url TEXT;

