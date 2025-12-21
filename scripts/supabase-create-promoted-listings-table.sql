-- Promoted Listings System Database Schema
-- B2B subscription model for top placement ($29/month or $299/year)

CREATE TABLE IF NOT EXISTS promoted_listings (
  id BIGSERIAL PRIMARY KEY,
  product_id TEXT NOT NULL, -- tour product_code or restaurant id
  product_type TEXT NOT NULL CHECK (product_type IN ('tour', 'restaurant')),
  destination_id TEXT NOT NULL,
  subscription_status TEXT NOT NULL DEFAULT 'active' CHECK (subscription_status IN ('active', 'cancelled', 'expired', 'pending')),
  subscription_start DATE NOT NULL DEFAULT CURRENT_DATE,
  subscription_end DATE, -- NULL for monthly recurring, set for yearly
  billing_cycle TEXT NOT NULL CHECK (billing_cycle IN ('monthly', 'yearly')),
  price_paid DECIMAL(10, 2) NOT NULL, -- 29.00 for monthly, 299.00 for yearly
  operator_email TEXT, -- Contact email for the operator
  operator_name TEXT, -- Name of the operator/restaurant owner
  notes TEXT, -- Internal notes
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  -- Ensure one active promotion per product per destination
  UNIQUE(product_id, destination_id, product_type)
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_promoted_listings_product_id ON promoted_listings(product_id);
CREATE INDEX IF NOT EXISTS idx_promoted_listings_destination_id ON promoted_listings(destination_id);
CREATE INDEX IF NOT EXISTS idx_promoted_listings_product_type ON promoted_listings(product_type);
CREATE INDEX IF NOT EXISTS idx_promoted_listings_status ON promoted_listings(subscription_status);
CREATE INDEX IF NOT EXISTS idx_promoted_listings_active ON promoted_listings(destination_id, product_type, subscription_status) 
  WHERE subscription_status = 'active';
CREATE INDEX IF NOT EXISTS idx_promoted_listings_subscription_end ON promoted_listings(subscription_end) 
  WHERE subscription_status = 'active';

-- Function to automatically update updated_at
CREATE OR REPLACE FUNCTION update_promoted_listings_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to update updated_at
CREATE TRIGGER update_promoted_listings_updated_at
  BEFORE UPDATE ON promoted_listings
  FOR EACH ROW
  EXECUTE FUNCTION update_promoted_listings_updated_at();

-- Function to check if subscription is active (not expired)
CREATE OR REPLACE FUNCTION is_promoted_listing_active(p_listing promoted_listings)
RETURNS BOOLEAN AS $$
BEGIN
  IF p_listing.subscription_status != 'active' THEN
    RETURN FALSE;
  END IF;
  
  -- For monthly subscriptions, check if subscription_end is NULL or in the future
  IF p_listing.billing_cycle = 'monthly' THEN
    RETURN p_listing.subscription_end IS NULL OR p_listing.subscription_end >= CURRENT_DATE;
  END IF;
  
  -- For yearly subscriptions, check if subscription_end is in the future
  IF p_listing.billing_cycle = 'yearly' THEN
    RETURN p_listing.subscription_end IS NULL OR p_listing.subscription_end >= CURRENT_DATE;
  END IF;
  
  RETURN FALSE;
END;
$$ LANGUAGE plpgsql;

-- RLS Policies (Row Level Security)
ALTER TABLE promoted_listings ENABLE ROW LEVEL SECURITY;

-- Anyone can read active promoted listings (for display)
CREATE POLICY "Anyone can view active promoted listings"
  ON promoted_listings FOR SELECT
  USING (subscription_status = 'active' AND (subscription_end IS NULL OR subscription_end >= CURRENT_DATE));

-- Only service role can insert/update/delete (via API)
CREATE POLICY "Service role can manage promoted listings"
  ON promoted_listings FOR ALL
  USING (auth.role() = 'service_role');

-- Comments for documentation
COMMENT ON TABLE promoted_listings IS 'B2B subscription system for promoted listings ($29/month or $299/year)';
COMMENT ON COLUMN promoted_listings.product_id IS 'Tour product_code (for tours) or restaurant id (for restaurants)';
COMMENT ON COLUMN promoted_listings.subscription_end IS 'NULL for active monthly subscriptions, set to end date for yearly subscriptions';
COMMENT ON COLUMN promoted_listings.price_paid IS 'Amount paid for this subscription period';

