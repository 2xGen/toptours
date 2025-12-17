-- Remove Partner Invite Codes System
-- This script removes the partner_invite_codes table since we're switching to Stripe coupon codes
-- Run this in Supabase SQL Editor when ready

-- Drop the table (this will also drop any related indexes and constraints)
DROP TABLE IF EXISTS partner_invite_codes CASCADE;

-- Verify removal
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name = 'partner_invite_codes';
-- Should return 0 rows

