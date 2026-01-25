-- Partner Guides Directory
-- Stores external travel guide websites for backlink outreach

CREATE TABLE IF NOT EXISTS partner_guides (
  id BIGSERIAL PRIMARY KEY,
  
  -- Basic Information
  name TEXT NOT NULL, -- e.g., "Aruba.com"
  url TEXT NOT NULL, -- e.g., "https://aruba.com"
  description TEXT, -- Brief description of the guide
  screenshot_url TEXT, -- URL to screenshot of homepage
  
  -- Destination/Region
  destination_id TEXT, -- Viator destination ID or slug (e.g., "aruba")
  destination_name TEXT, -- Display name (e.g., "Aruba")
  country TEXT, -- Country name
  region TEXT, -- Region (e.g., "Caribbean")
  
  -- Type/Category
  guide_type TEXT DEFAULT 'website', -- 'website', 'blog', 'resource', 'official_guide'
  
  -- Status
  is_approved BOOLEAN DEFAULT false, -- Admin approval
  is_active BOOLEAN DEFAULT true, -- Show/hide from directory
  
  -- Outreach Tracking
  outreach_sent_at TIMESTAMPTZ, -- When we sent the email
  backlink_received BOOLEAN DEFAULT false, -- Did they link back?
  backlink_url TEXT, -- URL where they linked to us
  
  -- Metadata
  submitted_by TEXT, -- Email of submitter (if from form)
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for fast lookups
CREATE INDEX IF NOT EXISTS idx_partner_guides_destination_id ON partner_guides(destination_id);
CREATE INDEX IF NOT EXISTS idx_partner_guides_country ON partner_guides(country);
CREATE INDEX IF NOT EXISTS idx_partner_guides_region ON partner_guides(region);
CREATE INDEX IF NOT EXISTS idx_partner_guides_is_approved ON partner_guides(is_approved);
CREATE INDEX IF NOT EXISTS idx_partner_guides_is_active ON partner_guides(is_active);

-- Function to automatically update updated_at
CREATE OR REPLACE FUNCTION update_partner_guides_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to update updated_at on update
CREATE TRIGGER update_partner_guides_updated_at
  BEFORE UPDATE ON partner_guides
  FOR EACH ROW
  EXECUTE FUNCTION update_partner_guides_updated_at();

-- RLS: Public read, admin write (adjust as needed)
ALTER TABLE partner_guides ENABLE ROW LEVEL SECURITY;

-- Allow public to read approved and active guides
CREATE POLICY "Public can view approved active guides"
  ON partner_guides
  FOR SELECT
  USING (is_approved = true AND is_active = true);

-- Admin can do everything (adjust role check as needed)
CREATE POLICY "Admins can manage guides"
  ON partner_guides
  FOR ALL
  USING (auth.jwt() ->> 'role' = 'admin');
