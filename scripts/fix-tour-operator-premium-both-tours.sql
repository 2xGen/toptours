-- Add both tours 119085P2 and 119085P1 to operator_tours table
-- This will make premium features appear on both tour pages

DO $$
DECLARE
  subscription_record RECORD;
  tour_exists BOOLEAN;
  tour_product_ids TEXT[] := ARRAY['119085P2', '119085P1'];
  tour_titles TEXT[] := ARRAY[
    'Aruba Sunset Sail Cruise Aboard The Dolphin Catamaran',
    'Tour 119085P1' -- Update with actual title if known
  ];
  tour_urls TEXT[] := ARRAY[
    '/tours/119085P2/aruba-sunset-sail-cruise-aboard-the-dolphin-catamaran',
    '/tours/119085P1' -- Update with actual slug if known
  ];
  tour_idx INT;
  current_product_id TEXT;
  current_title TEXT;
  current_url TEXT;
BEGIN
  -- Loop through each tour product ID
  FOR tour_idx IN 1..array_length(tour_product_ids, 1) LOOP
    current_product_id := tour_product_ids[tour_idx];
    current_title := tour_titles[tour_idx];
    current_url := tour_urls[tour_idx];
    
    -- Find active subscription that has this tour in verified_tour_ids
    FOR subscription_record IN 
      SELECT id, operator_name, verified_tour_ids
      FROM tour_operator_subscriptions
      WHERE status = 'active' 
        AND current_product_id = ANY(verified_tour_ids)
    LOOP
      -- Check if tour already exists in operator_tours
      SELECT EXISTS(
        SELECT 1 FROM operator_tours 
        WHERE product_id = current_product_id
          AND operator_subscription_id = subscription_record.id
      ) INTO tour_exists;
      
      IF NOT tour_exists THEN
        -- Insert the tour into operator_tours
        INSERT INTO operator_tours (
          operator_subscription_id,
          product_id,
          operator_name,
          tour_title,
          toptours_url,
          is_selected,
          is_active
        ) VALUES (
          subscription_record.id,
          current_product_id,
          subscription_record.operator_name,
          current_title,
          current_url,
          true,
          true
        );
        
        RAISE NOTICE '✅ Inserted tour % for subscription %', current_product_id, subscription_record.id;
      ELSE
        -- Update existing tour to ensure flags are correct
        UPDATE operator_tours
        SET 
          is_selected = true,
          is_active = true
        WHERE product_id = current_product_id
          AND operator_subscription_id = subscription_record.id;
        
        RAISE NOTICE '✅ Updated tour % for subscription %', current_product_id, subscription_record.id;
      END IF;
    END LOOP;
  END LOOP;
END $$;

-- Verify both tours
SELECT 
  ot.product_id,
  ot.tour_title,
  ot.is_selected,
  ot.is_active,
  tos.status as subscription_status,
  tos.operator_name
FROM operator_tours ot
JOIN tour_operator_subscriptions tos ON ot.operator_subscription_id = tos.id
WHERE ot.product_id IN ('119085P2', '119085P1')
ORDER BY ot.product_id;

