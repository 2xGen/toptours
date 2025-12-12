-- Diagnostic and fix script for tour operator premium status
-- This script checks and fixes issues with tour operator premium subscriptions

-- Step 1: Check if tour 119085P2 exists in operator_tours
SELECT 
  ot.id,
  ot.product_id,
  ot.operator_subscription_id,
  ot.is_selected,
  ot.is_active,
  tos.status as subscription_status,
  tos.operator_name,
  tos.verified_tour_ids
FROM operator_tours ot
LEFT JOIN tour_operator_subscriptions tos ON ot.operator_subscription_id = tos.id
WHERE ot.product_id = '119085P2';

-- Step 2: Check all active subscriptions and their tours
SELECT 
  tos.id as subscription_id,
  tos.operator_name,
  tos.status,
  tos.verified_tour_ids,
  COUNT(ot.id) as tours_in_table,
  COUNT(CASE WHEN ot.is_selected = true AND ot.is_active = true THEN 1 END) as active_selected_tours
FROM tour_operator_subscriptions tos
LEFT JOIN operator_tours ot ON ot.operator_subscription_id = tos.id
WHERE tos.status = 'active'
GROUP BY tos.id, tos.operator_name, tos.status, tos.verified_tour_ids;

-- Step 3: If tour is missing, check which subscription it should belong to
-- (This will show subscriptions that have 119085P2 in verified_tour_ids but not in operator_tours)
SELECT 
  tos.id,
  tos.operator_name,
  tos.verified_tour_ids,
  CASE 
    WHEN '119085P2' = ANY(tos.verified_tour_ids) THEN 'Tour is in verified_tour_ids'
    ELSE 'Tour is NOT in verified_tour_ids'
  END as tour_status
FROM tour_operator_subscriptions tos
WHERE tos.status = 'active';

-- Step 4: Fix - Ensure tour is in operator_tours if it's in verified_tour_ids
-- First, find the subscription that should have this tour
DO $$
DECLARE
  subscription_record RECORD;
  tour_exists BOOLEAN;
BEGIN
  -- Find active subscription that has 119085P2 in verified_tour_ids
  FOR subscription_record IN 
    SELECT id, operator_name, verified_tour_ids
    FROM tour_operator_subscriptions
    WHERE status = 'active' 
      AND '119085P2' = ANY(verified_tour_ids)
  LOOP
    -- Check if tour already exists in operator_tours
    SELECT EXISTS(
      SELECT 1 FROM operator_tours 
      WHERE product_id = '119085P2' 
        AND operator_subscription_id = subscription_record.id
    ) INTO tour_exists;
    
    IF NOT tour_exists THEN
      -- Insert the tour into operator_tours
      -- Note: We need to fetch tour data from Viator API to get title, image, etc.
      -- For now, we'll insert with minimal data
      INSERT INTO operator_tours (
        operator_subscription_id,
        product_id,
        operator_name,
        tour_title,
        is_selected,
        is_active
      ) VALUES (
        subscription_record.id,
        '119085P2',
        subscription_record.operator_name,
        'Aruba Sunset Sail Cruise Aboard The Dolphin Catamaran',
        true,
        true
      );
      
      RAISE NOTICE 'Inserted tour 119085P2 for subscription %', subscription_record.id;
    ELSE
      -- Update existing tour to ensure flags are correct
      UPDATE operator_tours
      SET 
        is_selected = true,
        is_active = true
      WHERE product_id = '119085P2' 
        AND operator_subscription_id = subscription_record.id;
      
      RAISE NOTICE 'Updated tour 119085P2 for subscription %', subscription_record.id;
    END IF;
  END LOOP;
END $$;

-- Step 5: Verify the fix
SELECT 
  ot.product_id,
  ot.is_selected,
  ot.is_active,
  tos.status as subscription_status,
  tos.operator_name
FROM operator_tours ot
JOIN tour_operator_subscriptions tos ON ot.operator_subscription_id = tos.id
WHERE ot.product_id = '119085P2';

