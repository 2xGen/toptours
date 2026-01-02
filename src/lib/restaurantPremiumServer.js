/**
 * Server-side utilities for restaurant premium subscriptions
 */

import { createSupabaseServiceRoleClient } from '@/lib/supabaseClient';

/**
 * Get premium subscription for a restaurant (server-side)
 */
export async function getRestaurantPremiumSubscription(restaurantId, destinationId) {
  if (!restaurantId || !destinationId) return null;
  
  try {
    const supabase = createSupabaseServiceRoleClient();
    
    // Normalize destination_id to handle both numeric IDs and slugs
    // The database may have records with either format
    const { normalizeDestinationIdToSlug } = await import('@/lib/destinationIdHelper');
    const normalizedDestinationId = await normalizeDestinationIdToSlug(destinationId);
    
    // Query with both normalized slug and original destinationId to catch all cases
    const { data, error } = await supabase
      .from('restaurant_premium_subscriptions')
      .select('*')
      .eq('restaurant_id', restaurantId)
      .in('destination_id', [normalizedDestinationId, destinationId].filter(Boolean))
      .in('status', ['active', 'pending_cancellation'])
      .order('status', { ascending: true }) // Prefer 'active' over 'pending_cancellation'
      .order('created_at', { ascending: false }) // Prefer newer records
      .limit(1)
      .maybeSingle();
    
    if (error) {
      // PGRST116 = no rows found, which is normal for non-premium restaurants
      if (error.code !== 'PGRST116') {
        console.error('Error fetching restaurant premium subscription:', error);
      }
      return null;
    }
    
    // Check if subscription is active and within billing period
    if (data && data.status === 'active' || data?.status === 'pending_cancellation') {
      if (data.current_period_end) {
        const endDate = new Date(data.current_period_end);
        if (endDate < new Date()) {
          // Subscription has expired
          return null;
        }
      }
      return data;
    }
    
    return null;
  } catch (error) {
    console.error('Exception fetching restaurant premium subscription:', error);
    return null;
  }
}

/**
 * Check if a restaurant has premium status
 */
export async function isRestaurantPremium(restaurantId, destinationId) {
  const subscription = await getRestaurantPremiumSubscription(restaurantId, destinationId);
  return !!subscription;
}

/**
 * Get all premium restaurant IDs for a destination (batch query - efficient!)
 * Returns a Set for O(1) lookup
 */
export async function getPremiumRestaurantIds(destinationId) {
  if (!destinationId) return new Set();
  
  try {
    const supabase = createSupabaseServiceRoleClient();
    const now = new Date().toISOString();
    
    // Normalize destination_id to handle both numeric IDs and slugs
    const { normalizeDestinationIdToSlug } = await import('@/lib/destinationIdHelper');
    const normalizedDestinationId = await normalizeDestinationIdToSlug(destinationId);
    
    // Query active subscriptions - allow null current_period_end for test records
    // Query with both normalized slug and original destinationId to catch all cases
    const { data, error } = await supabase
      .from('restaurant_premium_subscriptions')
      .select('restaurant_id, current_period_end')
      .in('destination_id', [normalizedDestinationId, destinationId].filter(Boolean))
      .in('status', ['active', 'pending_cancellation']);
    
    if (error) {
      console.error('Error fetching premium restaurant IDs:', error);
      return new Set();
    }
    
    // Filter to only include active subscriptions (not expired)
    const activeIds = (data || []).filter(row => {
      // If no period_end set, consider it active (test records)
      if (!row.current_period_end) return true;
      // Check if subscription hasn't expired
      return new Date(row.current_period_end) > new Date(now);
    }).map(row => row.restaurant_id);
    
    return new Set(activeIds);
  } catch (error) {
    console.error('Exception fetching premium restaurant IDs:', error);
    return new Set();
  }
}

