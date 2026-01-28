-- Personal Match form submissions
-- Stores requests from /match-your-style Personal Match form. Data used only to find the best tour experience; not for marketing.

CREATE TABLE IF NOT EXISTS personal_match_submissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Required
  email TEXT NOT NULL,
  destination TEXT NOT NULL,

  -- Travel dates: either (start + end) or notes
  travel_start_date DATE,
  travel_end_date DATE,
  travel_dates_notes TEXT,

  -- Optional
  group_size TEXT,
  primary_goal TEXT,
  name TEXT,

  -- Consent
  terms_accepted_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_personal_match_submissions_email ON personal_match_submissions(email);
CREATE INDEX IF NOT EXISTS idx_personal_match_submissions_destination ON personal_match_submissions(destination);
CREATE INDEX IF NOT EXISTS idx_personal_match_submissions_created_at ON personal_match_submissions(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_personal_match_submissions_travel_start ON personal_match_submissions(travel_start_date) WHERE travel_start_date IS NOT NULL;

-- RLS: only service role can read/write (no public access)
ALTER TABLE personal_match_submissions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Service role only" ON personal_match_submissions
  FOR ALL
  USING (auth.role() = 'service_role')
  WITH CHECK (auth.role() = 'service_role');

COMMENT ON TABLE personal_match_submissions IS 'Personal Match form submissions. Data used only to find the best tour experience for the user; not for marketing.';
