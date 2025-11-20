-- Create table for hardcoded destination tours
-- Stores minimal data: productId, title, image only
-- Price and rating are fetched live on tour detail page

CREATE TABLE IF NOT EXISTS hardcoded_destination_tours (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  destination TEXT NOT NULL,
  category TEXT NOT NULL,
  product_id TEXT NOT NULL,
  position INTEGER NOT NULL, -- 1-4 (which of the 4 tours in this category)
  
  -- Minimal static data only
  title TEXT NOT NULL,
  image_url TEXT NOT NULL,
  
  -- Metadata
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  
  -- Ensure unique combination
  UNIQUE(destination, category, product_id)
);

-- Create indexes for fast queries
CREATE INDEX IF NOT EXISTS idx_hardcoded_destination ON hardcoded_destination_tours(destination);
CREATE INDEX IF NOT EXISTS idx_hardcoded_destination_category ON hardcoded_destination_tours(destination, category);
CREATE INDEX IF NOT EXISTS idx_hardcoded_product_id ON hardcoded_destination_tours(product_id);

-- Add comment
COMMENT ON TABLE hardcoded_destination_tours IS 'Hardcoded tours for destination pages. Stores only productId, title, and image. Price/rating fetched live on tour detail page.';

