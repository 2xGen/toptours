-- Reset Tour Operators CRM Table
-- Drops existing table and creates a fresh lightweight version
-- Safe to run even if table doesn't exist

-- Drop functions first (they might reference the table)
DROP FUNCTION IF EXISTS update_tour_count() CASCADE;

-- Drop table (CASCADE automatically drops all triggers, policies, indexes, etc.)
DROP TABLE IF EXISTS tour_operators_crm CASCADE;

-- Create new lightweight table
CREATE TABLE tour_operators_crm (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  operator_name TEXT NOT NULL UNIQUE,
  email TEXT,
  date_sent_email TIMESTAMPTZ,
  reminder_date TIMESTAMPTZ,
  status TEXT DEFAULT 'not_contacted' CHECK (status IN ('not_contacted', 'no_answer', 'declined', 'claimed_promo', 'paid_subscribed')),
  tour_product_ids TEXT[] DEFAULT '{}',
  destination_ids TEXT[] DEFAULT '{}', -- Array of Viator destination IDs (lightweight)
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Indexes
CREATE INDEX idx_tour_operators_crm_operator_name ON tour_operators_crm(operator_name);
CREATE INDEX idx_tour_operators_crm_status ON tour_operators_crm(status);
CREATE INDEX idx_tour_operators_crm_created_at ON tour_operators_crm(created_at DESC);
CREATE INDEX idx_tour_operators_crm_destination_ids ON tour_operators_crm USING GIN(destination_ids);

-- RLS
ALTER TABLE tour_operators_crm ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Service role can manage tour operators CRM"
  ON tour_operators_crm
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

