-- Lightweight Tour Operators CRM Table
-- Simple table for tracking operator outreach
-- Run reset-tour-operators-crm.sql first if you want to start fresh

CREATE TABLE IF NOT EXISTS tour_operators_crm (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  operator_name TEXT NOT NULL UNIQUE,
  email TEXT,
  date_sent_email TIMESTAMPTZ,
  reminder_date TIMESTAMPTZ,
  status TEXT DEFAULT 'not_contacted' CHECK (status IN ('not_contacted', 'no_answer', 'declined', 'claimed_promo', 'paid_subscribed')),
  tour_product_ids TEXT[] DEFAULT '{}',
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_tour_operators_crm_operator_name ON tour_operators_crm(operator_name);
CREATE INDEX IF NOT EXISTS idx_tour_operators_crm_status ON tour_operators_crm(status);
CREATE INDEX IF NOT EXISTS idx_tour_operators_crm_created_at ON tour_operators_crm(created_at DESC);

-- RLS
ALTER TABLE tour_operators_crm ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Service role can manage tour operators CRM" ON tour_operators_crm;
CREATE POLICY "Service role can manage tour operators CRM"
  ON tour_operators_crm
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

