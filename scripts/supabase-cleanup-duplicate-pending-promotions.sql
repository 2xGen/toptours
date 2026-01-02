-- Cleanup duplicate pending promotions
-- This removes duplicate pending promotions, keeping only the most recent one per restaurant/tour

-- For promoted_restaurants: Keep only the most recent pending promotion per restaurant_id
-- Delete older duplicates
DELETE FROM promoted_restaurants
WHERE id IN (
  SELECT id
  FROM (
    SELECT 
      id,
      ROW_NUMBER() OVER (
        PARTITION BY restaurant_id 
        ORDER BY requested_at DESC, created_at DESC
      ) as rn
    FROM promoted_restaurants
    WHERE status = 'pending'
  ) ranked
  WHERE rn > 1
);

-- For promoted_tours: Keep only the most recent pending promotion per product_id
-- Delete older duplicates
DELETE FROM promoted_tours
WHERE id IN (
  SELECT id
  FROM (
    SELECT 
      id,
      ROW_NUMBER() OVER (
        PARTITION BY product_id 
        ORDER BY requested_at DESC, created_at DESC
      ) as rn
    FROM promoted_tours
    WHERE status = 'pending'
  ) ranked
  WHERE rn > 1
);

-- Show summary of remaining pending promotions with details
SELECT 
  'promoted_restaurants' as table_name,
  pr.restaurant_id,
  r.name as restaurant_name,
  r.destination_id,
  COUNT(*) as pending_count,
  ARRAY_AGG(pr.id ORDER BY pr.requested_at DESC) as promotion_ids,
  ARRAY_AGG(pr.requested_at ORDER BY pr.requested_at DESC) as requested_dates
FROM promoted_restaurants pr
LEFT JOIN restaurants r ON r.id = pr.restaurant_id
WHERE pr.status = 'pending'
GROUP BY pr.restaurant_id, r.name, r.destination_id
HAVING COUNT(*) > 1;

SELECT 
  'promoted_tours' as table_name,
  pt.product_id,
  COUNT(*) as pending_count,
  ARRAY_AGG(pt.id ORDER BY pt.requested_at DESC) as promotion_ids,
  ARRAY_AGG(pt.requested_at ORDER BY pt.requested_at DESC) as requested_dates
FROM promoted_tours pt
WHERE pt.status = 'pending'
GROUP BY pt.product_id
HAVING COUNT(*) > 1;

