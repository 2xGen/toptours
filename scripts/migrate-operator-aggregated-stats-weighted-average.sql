-- Run in Supabase SQL editor (once): weighted average matches Viator-style aggregation
-- and matches app/api/internal/tour-operator-premium/add-tour + remove-tour.

CREATE OR REPLACE FUNCTION update_operator_aggregated_stats()
RETURNS TRIGGER AS $$
DECLARE
  total_reviews_count INTEGER;
  avg_rating DECIMAL(3,2);
  tours_count INTEGER;
BEGIN
  SELECT
    COALESCE(SUM(COALESCE(review_count, 0)), 0)::integer,
    CASE
      WHEN COALESCE(SUM(COALESCE(review_count, 0)), 0) > 0 THEN
        ROUND(
          (
            SUM(COALESCE(rating, 0)::numeric * COALESCE(review_count, 0)::numeric)
            / NULLIF(SUM(COALESCE(review_count, 0))::numeric, 0)
          )::numeric,
          2
        )
      ELSE 0::numeric
    END,
    COUNT(*)::integer
  INTO total_reviews_count, avg_rating, tours_count
  FROM operator_tours
  WHERE operator_subscription_id = COALESCE(NEW.operator_subscription_id, OLD.operator_subscription_id)
    AND is_selected = true
    AND is_active = true;

  UPDATE tour_operator_subscriptions
  SET
    total_reviews = total_reviews_count,
    average_rating = avg_rating,
    total_tours_count = tours_count,
    updated_at = NOW()
  WHERE id = COALESCE(NEW.operator_subscription_id, OLD.operator_subscription_id);

  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- Backfill all subscriptions that have active selected tours
WITH agg AS (
  SELECT
    operator_subscription_id AS sid,
    COALESCE(SUM(COALESCE(review_count, 0)), 0)::integer AS trc,
    CASE
      WHEN COALESCE(SUM(COALESCE(review_count, 0)), 0) > 0 THEN
        ROUND(
          (
            SUM(COALESCE(rating, 0)::numeric * COALESCE(review_count, 0)::numeric)
            / NULLIF(SUM(COALESCE(review_count, 0))::numeric, 0)
          )::numeric,
          2
        )
      ELSE 0::numeric
    END AS ar,
    COUNT(*)::integer AS tc
  FROM operator_tours
  WHERE is_selected = true AND is_active = true
  GROUP BY operator_subscription_id
)
UPDATE tour_operator_subscriptions t
SET
  total_reviews = agg.trc,
  average_rating = agg.ar,
  total_tours_count = agg.tc,
  updated_at = NOW()
FROM agg
WHERE t.id = agg.sid;

-- Subscriptions with no selected+active tours: clear cached aggregates
UPDATE tour_operator_subscriptions t
SET
  total_reviews = 0,
  average_rating = 0,
  total_tours_count = 0,
  updated_at = NOW()
WHERE NOT EXISTS (
  SELECT 1
  FROM operator_tours ot
  WHERE ot.operator_subscription_id = t.id
    AND ot.is_selected = true
    AND ot.is_active = true
);
