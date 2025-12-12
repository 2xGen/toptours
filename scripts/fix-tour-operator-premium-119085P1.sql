-- Add tour 119085P1 to operator_tours table for premium operator subscription
-- This will make premium features appear on the tour page

DO $$
DECLARE
  subscription_record RECORD;
  tour_exists BOOLEAN;
BEGIN
  -- Find active subscription that has 119085P1 in verified_tour_ids
  FOR subscription_record IN 
    SELECT id, operator_name, verified_tour_ids
    FROM tour_operator_subscriptions
    WHERE status = 'active' 
      AND '119085P1' = ANY(verified_tour_ids)
  LOOP
    -- Check if tour already exists in operator_tours
    SELECT EXISTS(
      SELECT 1 FROM operator_tours 
      WHERE product_id = '119085P1' 
        AND operator_subscription_id = subscription_record.id
    ) INTO tour_exists;
    
    IF NOT tour_exists THEN
      -- Insert the tour into operator_tours
      -- Note: You may need to update the tour_title and toptours_url with actual values
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
        '119085P1',
        subscription_record.operator_name,
        'Tour 119085P1', -- Update with actual tour title if known
        '/tours/119085P1', -- Update with actual slug if known
        true,
        true
      );
      
      RAISE NOTICE '✅ Inserted tour 119085P1 for subscription %', subscription_record.id;
    ELSE
      -- Update existing tour to ensure flags are correct
      UPDATE operator_tours
      SET 
        is_selected = true,
        is_active = true
      WHERE product_id = '119085P1' 
        AND operator_subscription_id = subscription_record.id;
      
      RAISE NOTICE '✅ Updated tour 119085P1 for subscription %', subscription_record.id;
    END IF;
  END LOOP;
  
  IF NOT FOUND THEN
    RAISE NOTICE '⚠️  No active subscription found with tour 119085P1 in verified_tour_ids';
    RAISE NOTICE '💡 Tip: Make sure 119085P1 is in the verified_tour_ids array of an active subscription';
  END IF;
END $$;

-- Verify the fix
SELECT 
  ot.product_id,
  ot.tour_title,
  ot.is_selected,
  ot.is_active,
  tos.status as subscription_status,
  tos.operator_name,
  tos.verified_tour_ids
FROM operator_tours ot
JOIN tour_operator_subscriptions tos ON ot.operator_subscription_id = tos.id
WHERE ot.product_id = '119085P1';

