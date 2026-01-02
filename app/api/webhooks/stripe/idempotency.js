/**
 * Webhook Idempotency Handler
 * Prevents duplicate processing of Stripe webhook events
 * This is CRITICAL for production reliability
 */

import { createSupabaseServiceRoleClient } from '@/lib/supabaseClient';

/**
 * Check if webhook event has already been processed
 * @param {string} eventId - Stripe event ID
 * @returns {Promise<{processed: boolean, record: object|null}>}
 */
export async function checkWebhookProcessed(eventId) {
  if (!eventId) {
    return { processed: false, record: null };
  }

  const supabase = createSupabaseServiceRoleClient();
  
  const { data, error } = await supabase
    .from('processed_webhook_events')
    .select('*')
    .eq('id', eventId)
    .maybeSingle();

  if (error && error.code !== 'PGRST116') { // PGRST116 = not found, which is OK
    console.error(`Error checking webhook idempotency for ${eventId}:`, error);
    // On error, assume not processed (fail open) but log it
    return { processed: false, record: null };
  }

  if (data && data.status === 'processed') {
    console.log(`⚠️ Webhook event ${eventId} already processed at ${data.processed_at}`);
    return { processed: true, record: data };
  }

  return { processed: false, record: data };
}

/**
 * Mark webhook event as processed
 * @param {string} eventId - Stripe event ID
 * @param {string} eventType - Event type (e.g., 'checkout.session.completed')
 * @param {object} metadata - Additional metadata (subscription_id, restaurant_id, user_id, etc.)
 * @param {string} status - 'processed', 'failed', 'retrying'
 * @param {string} errorMessage - Error message if status is 'failed'
 */
export async function markWebhookProcessed(eventId, eventType, metadata = {}, status = 'processed', errorMessage = null) {
  if (!eventId) {
    console.warn('Cannot mark webhook as processed without event ID');
    return;
  }

  const supabase = createSupabaseServiceRoleClient();
  
  const record = {
    id: eventId,
    event_type: eventType,
    processed_at: new Date().toISOString(),
    status: status,
    subscription_id: metadata.subscription_id || metadata.subscriptionId || null,
    restaurant_id: metadata.restaurant_id || metadata.restaurantId || null,
    user_id: metadata.user_id || metadata.userId || null,
    error_message: errorMessage,
    metadata: metadata,
  };

  const { error } = await supabase
    .from('processed_webhook_events')
    .upsert(record, {
      onConflict: 'id',
    });

  if (error) {
    console.error(`Error marking webhook ${eventId} as processed:`, error);
    // Don't throw - this is logging, not critical path
  } else {
    console.log(`✅ Marked webhook event ${eventId} as ${status}`);
  }
}

