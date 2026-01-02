-- Prevent duplicate pending promotions
-- This ensures only one pending promotion can exist per restaurant/tour at a time

-- For promoted_restaurants: Only one pending promotion per restaurant_id
CREATE UNIQUE INDEX IF NOT EXISTS idx_promoted_restaurants_unique_pending 
ON promoted_restaurants(restaurant_id) 
WHERE status = 'pending';

-- For promoted_tours: Only one pending promotion per product_id
CREATE UNIQUE INDEX IF NOT EXISTS idx_promoted_tours_unique_pending 
ON promoted_tours(product_id) 
WHERE status = 'pending';

-- Add comments
COMMENT ON INDEX idx_promoted_restaurants_unique_pending IS 'Prevents multiple pending promotions for the same restaurant';
COMMENT ON INDEX idx_promoted_tours_unique_pending IS 'Prevents multiple pending promotions for the same tour';

