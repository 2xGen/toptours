-- Add pending_website field to restaurant_premium_subscriptions table
-- This allows restaurants to submit/update their website during checkout
-- The website will require manual review before being activated

ALTER TABLE restaurant_premium_subscriptions 
ADD COLUMN IF NOT EXISTS pending_website TEXT,
ADD COLUMN IF NOT EXISTS website_review_status VARCHAR(50) DEFAULT 'pending'; -- 'pending', 'approved', 'rejected'

COMMENT ON COLUMN restaurant_premium_subscriptions.pending_website IS 'Website URL submitted by restaurant owner, pending manual review';
COMMENT ON COLUMN restaurant_premium_subscriptions.website_review_status IS 'Status of website review: pending, approved, rejected';

