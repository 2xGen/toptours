-- Create restaurant_bookmarks table
-- This table stores user bookmarks for restaurants

CREATE TABLE IF NOT EXISTS restaurant_bookmarks (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  restaurant_id BIGINT NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  -- Ensure a user can only bookmark a restaurant once
  UNIQUE(user_id, restaurant_id)
);

-- Indexes for fast lookups
CREATE INDEX IF NOT EXISTS idx_restaurant_bookmarks_user_id ON restaurant_bookmarks(user_id);
CREATE INDEX IF NOT EXISTS idx_restaurant_bookmarks_restaurant_id ON restaurant_bookmarks(restaurant_id);
CREATE INDEX IF NOT EXISTS idx_restaurant_bookmarks_created_at ON restaurant_bookmarks(created_at DESC);

-- Enable Row Level Security (RLS)
ALTER TABLE restaurant_bookmarks ENABLE ROW LEVEL SECURITY;

-- Policy: Users can only see their own bookmarks
CREATE POLICY "Users can view their own bookmarks"
  ON restaurant_bookmarks
  FOR SELECT
  USING (auth.uid() = user_id);

-- Policy: Users can insert their own bookmarks
CREATE POLICY "Users can insert their own bookmarks"
  ON restaurant_bookmarks
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Policy: Users can delete their own bookmarks
CREATE POLICY "Users can delete their own bookmarks"
  ON restaurant_bookmarks
  FOR DELETE
  USING (auth.uid() = user_id);

COMMENT ON TABLE restaurant_bookmarks IS 'Stores user bookmarks for restaurants. Users can bookmark restaurants to save them for later.';
COMMENT ON COLUMN restaurant_bookmarks.user_id IS 'The user who bookmarked this restaurant.';
COMMENT ON COLUMN restaurant_bookmarks.restaurant_id IS 'The restaurant that was bookmarked.';
COMMENT ON COLUMN restaurant_bookmarks.created_at IS 'When the restaurant was bookmarked.';

