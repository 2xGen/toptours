-- Performance Indexes for Faster Queries
-- These indexes will speed up common queries on frequently accessed columns

-- ===== PROMOTED TOURS =====
-- Index on destination_id for promoted tours queries
CREATE INDEX IF NOT EXISTS idx_promoted_tours_destination_id ON promoted_tours(destination_id);
-- Index on user_id for profile page queries
CREATE INDEX IF NOT EXISTS idx_promoted_tours_user_id ON promoted_tours(user_id);
-- Index on operator_subscription_id for subscription queries
CREATE INDEX IF NOT EXISTS idx_promoted_tours_operator_subscription_id ON promoted_tours(operator_subscription_id);
-- Index on status for filtering active promotions
CREATE INDEX IF NOT EXISTS idx_promoted_tours_status ON promoted_tours(status);
-- Composite index for common query pattern: destination + status
CREATE INDEX IF NOT EXISTS idx_promoted_tours_destination_status ON promoted_tours(destination_id, status);

-- ===== PROMOTED RESTAURANTS =====
-- Index on destination_id for promoted restaurants queries
CREATE INDEX IF NOT EXISTS idx_promoted_restaurants_destination_id ON promoted_restaurants(destination_id);
-- Index on user_id for profile page queries
CREATE INDEX IF NOT EXISTS idx_promoted_restaurants_user_id ON promoted_restaurants(user_id);
-- Index on restaurant_id for restaurant lookups
CREATE INDEX IF NOT EXISTS idx_promoted_restaurants_restaurant_id ON promoted_restaurants(restaurant_id);
-- Index on status for filtering active promotions
CREATE INDEX IF NOT EXISTS idx_promoted_restaurants_status ON promoted_restaurants(status);
-- Composite index for common query pattern: destination + status
CREATE INDEX IF NOT EXISTS idx_promoted_restaurants_destination_status ON promoted_restaurants(destination_id, status);

-- ===== TOUR OPERATOR SUBSCRIPTIONS =====
-- Index on user_id for profile page queries
CREATE INDEX IF NOT EXISTS idx_tour_operator_subscriptions_user_id ON tour_operator_subscriptions(user_id);
-- Index on status for filtering active subscriptions
CREATE INDEX IF NOT EXISTS idx_tour_operator_subscriptions_status ON tour_operator_subscriptions(status);
-- Index on stripe_subscription_id for webhook lookups
CREATE INDEX IF NOT EXISTS idx_tour_operator_subscriptions_stripe_subscription_id ON tour_operator_subscriptions(stripe_subscription_id);

-- ===== RESTAURANT SUBSCRIPTIONS =====
-- Index on user_id for profile page queries
CREATE INDEX IF NOT EXISTS idx_restaurant_subscriptions_user_id ON restaurant_subscriptions(user_id);
-- Index on restaurant_id for restaurant lookups
CREATE INDEX IF NOT EXISTS idx_restaurant_subscriptions_restaurant_id ON restaurant_subscriptions(restaurant_id);
-- Index on destination_id for destination queries
CREATE INDEX IF NOT EXISTS idx_restaurant_subscriptions_destination_id ON restaurant_subscriptions(destination_id);
-- Index on status for filtering active subscriptions
CREATE INDEX IF NOT EXISTS idx_restaurant_subscriptions_status ON restaurant_subscriptions(status);
-- Index on stripe_subscription_id for webhook lookups
CREATE INDEX IF NOT EXISTS idx_restaurant_subscriptions_stripe_subscription_id ON restaurant_subscriptions(stripe_subscription_id);

-- ===== OPERATOR TOURS =====
-- Index on operator_subscription_id for subscription queries
CREATE INDEX IF NOT EXISTS idx_operator_tours_operator_subscription_id ON operator_tours(operator_subscription_id);
-- Index on product_id for tour lookups
CREATE INDEX IF NOT EXISTS idx_operator_tours_product_id ON operator_tours(product_id);
-- Index on destination_id for destination queries
CREATE INDEX IF NOT EXISTS idx_operator_tours_destination_id ON operator_tours(destination_id);
-- Index on is_selected for filtering selected tours
CREATE INDEX IF NOT EXISTS idx_operator_tours_is_selected ON operator_tours(is_selected);

-- ===== RESTAURANTS =====
-- Index on destination_id for destination restaurant queries
CREATE INDEX IF NOT EXISTS idx_restaurants_destination_id ON restaurants(destination_id);
-- Index on slug for restaurant lookups
CREATE INDEX IF NOT EXISTS idx_restaurants_slug ON restaurants(slug);

-- ===== WEBHOOK EVENTS (Idempotency) =====
-- Note: Table is called "processed_webhook_events" (not "webhook_events")
-- Indexes already exist from supabase-create-webhook-idempotency-table.sql:
-- - idx_webhook_events_subscription (on subscription_id)
-- - idx_webhook_events_restaurant (on restaurant_id)
-- - idx_webhook_events_user (on user_id)
-- - idx_webhook_events_processed_at (on processed_at)
-- - Primary key index on 'id' column (automatic)
-- No additional indexes needed here

-- ===== TOUR OPERATORS CRM =====
-- Index on operator_name for operator name lookups (already exists but ensuring)
CREATE INDEX IF NOT EXISTS idx_tour_operators_crm_operator_name ON tour_operators_crm(operator_name);

-- Notes:
-- These indexes will speed up:
-- 1. Profile page queries (user_id indexes)
-- 2. Destination page queries (destination_id indexes)
-- 3. Webhook processing (stripe_subscription_id indexes)
-- 4. Subscription lookups (status indexes)
-- 5. Operator name matching (operator_name index)
--
-- Trade-off: Indexes take up storage space and slow down writes slightly,
-- but significantly speed up reads (which is the majority of operations).

