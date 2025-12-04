/**
 * API Route: Get restaurant premium subscription status
 * GET /api/internal/restaurant-premium/status?restaurantId=123&destinationId=abc
 * 
 * Returns the current premium subscription status for a restaurant
 */

import { createSupabaseServiceRoleClient } from '@/lib/supabaseClient';
import { isPremiumRestaurant, getPremiumConfig } from '@/lib/restaurantPremium';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', ['GET']);
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { restaurantId, destinationId } = req.query;

    if (!restaurantId || !destinationId) {
      return res.status(400).json({
        error: 'Missing required parameters: restaurantId and destinationId'
      });
    }

    const supabase = createSupabaseServiceRoleClient();

    const { data: subscription, error } = await supabase
      .from('restaurant_premium_subscriptions')
      .select('*')
      .eq('restaurant_id', parseInt(restaurantId))
      .eq('destination_id', destinationId)
      .single();

    if (error && error.code !== 'PGRST116') { // PGRST116 = no rows found
      console.error('Error fetching restaurant premium status:', error);
      return res.status(500).json({ error: 'Failed to fetch subscription status' });
    }

    const isPremium = isPremiumRestaurant(subscription);
    const config = getPremiumConfig(subscription);

    return res.status(200).json({
      success: true,
      isPremium,
      subscription: isPremium ? {
        status: subscription.status,
        planType: subscription.plan_type,
        currentPeriodEnd: subscription.current_period_end,
        layoutPreset: subscription.layout_preset,
        colorScheme: subscription.color_scheme,
        heroCTAIndex: subscription.hero_cta_index,
        midCTAIndex: subscription.mid_cta_index,
        endCTAIndex: subscription.end_cta_index,
        stickyCTAIndex: subscription.sticky_cta_index,
      } : null,
      config,
    });
  } catch (error) {
    console.error('Error in restaurant-premium/status:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

