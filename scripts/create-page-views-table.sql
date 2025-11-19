-- Create page_views table for analytics
-- Stores individual view records for flexible analysis

CREATE TABLE IF NOT EXISTS page_views (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  page_path TEXT NOT NULL,
  page_type TEXT, -- 'tour', 'destination', 'home', 'about', etc.
  product_id TEXT, -- For tour pages
  destination_id TEXT, -- For destination/tour pages
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL, -- If user is logged in
  session_id TEXT, -- Browser session identifier
  referrer TEXT, -- Where they came from
  user_agent TEXT, -- Browser info
  ip_address INET, -- IP address (for geographic analysis)
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Indexes for efficient queries
CREATE INDEX IF NOT EXISTS idx_page_views_page_path ON page_views(page_path);
CREATE INDEX IF NOT EXISTS idx_page_views_page_type ON page_views(page_type);
CREATE INDEX IF NOT EXISTS idx_page_views_product_id ON page_views(product_id) WHERE product_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_page_views_destination_id ON page_views(destination_id) WHERE destination_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_page_views_created_at ON page_views(created_at);
CREATE INDEX IF NOT EXISTS idx_page_views_user_id ON page_views(user_id) WHERE user_id IS NOT NULL;

-- Composite index for common queries (most viewed pages by date)
CREATE INDEX IF NOT EXISTS idx_page_views_path_date ON page_views(page_path, created_at DESC);

-- Enable Row Level Security (RLS) - only service role can insert
ALTER TABLE page_views ENABLE ROW LEVEL SECURITY;

-- Policy: Only service role can insert (for API)
CREATE POLICY "Service role can insert page views"
  ON page_views
  FOR INSERT
  TO service_role
  WITH CHECK (true);

-- Policy: Service role can read all
CREATE POLICY "Service role can read page views"
  ON page_views
  FOR SELECT
  TO service_role
  USING (true);

