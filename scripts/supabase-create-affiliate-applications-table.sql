-- Affiliate Applications Table
-- Stores affiliate program applications submitted through the /affiliates page

CREATE TABLE IF NOT EXISTS affiliate_applications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Contact Information
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  
  -- Application Details
  partner_program TEXT NOT NULL CHECK (partner_program IN ('both', 'tour_operators', 'restaurants')),
  promotion_plan TEXT NOT NULL,
  website_url TEXT,
  
  -- Status
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'in_review')),
  
  -- Admin Notes
  admin_notes TEXT,
  
  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_affiliate_applications_email ON affiliate_applications(email);
CREATE INDEX IF NOT EXISTS idx_affiliate_applications_status ON affiliate_applications(status);
CREATE INDEX IF NOT EXISTS idx_affiliate_applications_created_at ON affiliate_applications(created_at DESC);

-- Enable Row Level Security (RLS)
ALTER TABLE affiliate_applications ENABLE ROW LEVEL SECURITY;

-- Policy: Only service role can insert/read (no public access for now)
-- You can adjust this later if you want authenticated users to view their own applications
CREATE POLICY "Service role can do everything" ON affiliate_applications
  FOR ALL
  USING (auth.role() = 'service_role');

-- Add updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_affiliate_applications_updated_at BEFORE UPDATE ON affiliate_applications
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
