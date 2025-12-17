-- Add destinations column to existing tour_operators_crm table
-- Run this if the table already exists but doesn't have the destinations column

ALTER TABLE tour_operators_crm 
  ADD COLUMN IF NOT EXISTS destinations TEXT[] DEFAULT '{}';

