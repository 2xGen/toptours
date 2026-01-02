-- Link tour_operators_crm with tour_operator_subscriptions
-- Add index on operator_name in tour_operator_subscriptions for faster lookups
-- This allows us to query tours by operator name efficiently

-- Add index on operator_name in tour_operator_subscriptions (if not exists)
CREATE INDEX IF NOT EXISTS idx_tour_operator_subscriptions_operator_name 
ON tour_operator_subscriptions(operator_name);

-- Add index on operator_name in operator_tours (if not exists)
CREATE INDEX IF NOT EXISTS idx_operator_tours_operator_name 
ON operator_tours(operator_name);

-- Add index on tour_product_ids in tour_operators_crm for faster array searches
-- This is already indexed via GIN, but let's ensure it exists
CREATE INDEX IF NOT EXISTS idx_tour_operators_crm_tour_product_ids 
ON tour_operators_crm USING GIN(tour_product_ids);

-- Add comment explaining the relationship
COMMENT ON COLUMN tour_operator_subscriptions.operator_name IS 
'Operator name from Viator. Can be used to link with tour_operators_crm.operator_name to find related tours.';

COMMENT ON COLUMN tour_operators_crm.tour_product_ids IS 
'Array of Viator product IDs for this operator. Used to suggest tours when user provides a tour URL.';

