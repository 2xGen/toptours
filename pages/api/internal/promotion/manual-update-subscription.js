/**
 * Manual Subscription Update Endpoint
 * Use this to manually update a subscription if webhooks fail
 * POST /api/internal/promotion/manual-update-subscription
 * 
 * Body: { userId: string, subscriptionId: string }
 * 
 * This fetches the subscription from Stripe and updates the database
 */

import { createSupabaseServiceRoleClient } from '@/lib/supabaseClient';
import { stripe, PLAN_TO_TIER } from '@/lib/stripe';
import { TIER_POINTS } from '@/lib/promotionSystem';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { userId, subscriptionId } = req.body;

    if (!userId || !subscriptionId) {
      return res.status(400).json({
        error: 'Missing required fields: userId, subscriptionId'
      });
    }

    // Fetch subscription from Stripe
    const subscription = await stripe.subscriptions.retrieve(subscriptionId);
    
    // Get plan and tier from metadata
    const plan = subscription.metadata?.plan;
    const tier = subscription.metadata?.tier || PLAN_TO_TIER[plan] || 'explorer';
    
    if (!plan) {
      return res.status(400).json({
        error: 'Subscription metadata missing plan information'
      });
    }

    const dailyPoints = TIER_POINTS[tier] || TIER_POINTS.explorer;
    const priceId = subscription.items.data[0]?.price?.id || null;

    // Update database
    const supabase = createSupabaseServiceRoleClient();
    const { error } = await supabase
      .from('promotion_accounts')
      .update({
        tier: tier,
        subscription_status: subscription.status === 'active' ? 'active' : 'inactive',
        stripe_subscription_id: subscription.id,
        stripe_customer_id: subscription.customer,
        stripe_price_id: priceId,
        daily_points_available: dailyPoints,
        subscription_plan: plan,
      })
      .eq('user_id', userId);

    if (error) {
      console.error('Error updating subscription:', error);
      return res.status(500).json({
        error: 'Failed to update subscription',
        details: error.message
      });
    }

    return res.status(200).json({
      success: true,
      message: `Subscription updated: ${plan} (${tier})`,
      tier,
      plan,
      dailyPoints,
    });
  } catch (error) {
    console.error('Error in manual-update-subscription:', error);
    return res.status(500).json({
      error: error.message || 'Failed to update subscription'
    });
  }
}

