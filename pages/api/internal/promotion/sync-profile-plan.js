/**
 * Sync Profile Plan from Promotion Account
 * POST /api/internal/promotion/sync-profile-plan
 * 
 * Body: { userId: string }
 * 
 * Syncs the plan_tier in profiles table from promotion_accounts
 */

import { createSupabaseServiceRoleClient } from '@/lib/supabaseClient';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { userId } = req.body;

    if (!userId) {
      return res.status(400).json({
        error: 'Missing required field: userId'
      });
    }

    const supabase = createSupabaseServiceRoleClient();

    // Get current subscription plan from promotion_accounts
    const { data: account, error: accountError } = await supabase
      .from('promotion_accounts')
      .select('subscription_plan')
      .eq('user_id', userId)
      .single();

    if (accountError || !account) {
      return res.status(404).json({
        error: 'Promotion account not found'
      });
    }

    const plan = account.subscription_plan || 'free';
    const dailyPromoQuota = plan === 'pro' ? 5 : plan === 'pro_plus' ? 5 : plan === 'enterprise' ? 20 : 1;

    // Update profiles table
    const { error: profileError } = await supabase
      .from('profiles')
      .update({
        plan_tier: plan,
        daily_promo_quota: dailyPromoQuota,
      })
      .eq('id', userId);

    if (profileError) {
      console.error('Error updating profiles:', profileError);
      return res.status(500).json({
        error: 'Failed to update profile',
        details: profileError.message
      });
    }

    return res.status(200).json({
      success: true,
      message: `Profile synced: ${plan}`,
      plan,
      dailyPromoQuota,
    });
  } catch (error) {
    console.error('Error in sync-profile-plan:', error);
    return res.status(500).json({
      error: error.message || 'Failed to sync profile plan'
    });
  }
}

