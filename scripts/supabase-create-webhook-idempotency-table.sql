-- Webhook Idempotency Table
-- Prevents duplicate processing of Stripe webhook events
-- This is CRITICAL for production reliability

CREATE TABLE IF NOT EXISTS processed_webhook_events (
  id TEXT PRIMARY KEY, -- Stripe event ID (e.g., "evt_1234567890")
  event_type TEXT NOT NULL,
  processed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  subscription_id TEXT, -- Stripe subscription ID
  restaurant_id BIGINT,
  user_id UUID,
  status TEXT DEFAULT 'processed', -- 'processed', 'failed', 'retrying'
  error_message TEXT,
  metadata JSONB -- Store additional context
);

-- Indexes for fast lookups
CREATE INDEX IF NOT EXISTS idx_webhook_events_subscription ON processed_webhook_events(subscription_id);
CREATE INDEX IF NOT EXISTS idx_webhook_events_restaurant ON processed_webhook_events(restaurant_id);
CREATE INDEX IF NOT EXISTS idx_webhook_events_user ON processed_webhook_events(user_id);
CREATE INDEX IF NOT EXISTS idx_webhook_events_processed_at ON processed_webhook_events(processed_at);

-- Add comment
COMMENT ON TABLE processed_webhook_events IS 'Tracks processed Stripe webhook events to prevent duplicate processing (idempotency)';

