-- Partner Invite Codes Table
-- Allows admins to generate codes for free premium subscriptions
-- Supports both tour operators and restaurants

CREATE TABLE IF NOT EXISTS partner_invite_codes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT UNIQUE NOT NULL, -- e.g., "PARTNER2026-ABC123"
  type TEXT NOT NULL CHECK (type IN ('tour_operator', 'restaurant')),
  duration_months INTEGER NOT NULL CHECK (duration_months IN (1, 3)),
  max_tours INTEGER DEFAULT 15, -- For tour operators only (null for restaurants)
  restaurant_id INTEGER, -- For restaurants: restaurant database ID
  destination_id TEXT, -- For restaurants: destination slug (e.g., "aruba")
  restaurant_slug TEXT, -- For restaurants: restaurant slug (e.g., "barefoot-beach-bar")
  restaurant_name TEXT, -- For restaurants: restaurant display name
  restaurant_url TEXT, -- For restaurants: full URL stored for reference
  used_by UUID REFERENCES auth.users(id), -- Who redeemed it
  used_by_email TEXT, -- Email of person who redeemed (in case no account)
  used_at TIMESTAMPTZ,
  expires_at TIMESTAMPTZ,
  created_by UUID REFERENCES auth.users(id), -- Admin who created it
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  is_active BOOLEAN DEFAULT true,
  notes TEXT, -- Optional notes about who this is for
  subscription_id UUID -- Link to created subscription (tour_operator_subscriptions or restaurant_premium_subscriptions)
);

-- Indexes for fast lookups
CREATE INDEX IF NOT EXISTS idx_partner_invite_codes_code ON partner_invite_codes(code);
CREATE INDEX IF NOT EXISTS idx_partner_invite_codes_type ON partner_invite_codes(type);
CREATE INDEX IF NOT EXISTS idx_partner_invite_codes_used_by ON partner_invite_codes(used_by);
CREATE INDEX IF NOT EXISTS idx_partner_invite_codes_is_active ON partner_invite_codes(is_active);
CREATE INDEX IF NOT EXISTS idx_partner_invite_codes_expires_at ON partner_invite_codes(expires_at);

-- Function to automatically update updated_at (if needed)
CREATE OR REPLACE FUNCTION update_partner_invite_codes_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to update updated_at on update
DROP TRIGGER IF EXISTS update_partner_invite_codes_updated_at ON partner_invite_codes;
CREATE TRIGGER update_partner_invite_codes_updated_at
  BEFORE UPDATE ON partner_invite_codes
  FOR EACH ROW
  EXECUTE FUNCTION update_partner_invite_codes_updated_at();

-- RLS: Disable for now (using service role)
ALTER TABLE partner_invite_codes DISABLE ROW LEVEL SECURITY;

