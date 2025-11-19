/**
 * Cancel a Stripe subscription
 * 
 * POST /api/internal/promotion/cancel-subscription
 * Body: { userId: string }
 * 
 * Cancels the user's active Stripe subscription
 */

import { createSupabaseServiceRoleClient } from '@/lib/supabaseClient';
import { stripe } from '@/lib/stripe';
import { TIER_POINTS } from '@/lib/promotionSystem';
import { sendSubscriptionCancellationEmail } from '@/lib/email';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Check if Stripe is configured
    if (!process.env.STRIPE_SECRET_KEY) {
      console.error('STRIPE_SECRET_KEY is not set in environment variables');
      return res.status(500).json({
        error: 'Stripe is not configured. Please set STRIPE_SECRET_KEY in environment variables.'
      });
    }

    const { userId } = req.body;

    if (!userId) {
      return res.status(400).json({
        error: 'User ID is required'
      });
    }

    const supabase = createSupabaseServiceRoleClient();

    // Get user's subscription ID
    const { data: account, error: accountError } = await supabase
      .from('promotion_accounts')
      .select('stripe_subscription_id, subscription_plan')
      .eq('user_id', userId)
      .single();

    if (accountError || !account) {
      console.error('Error fetching promotion account:', accountError);
      return res.status(404).json({
        error: 'Promotion account not found'
      });
    }

    if (!account.stripe_subscription_id) {
      return res.status(400).json({
        error: 'No active subscription found'
      });
    }

    // Cancel the subscription in Stripe (at period end)
    try {
      const subscription = await stripe.subscriptions.update(
        account.stripe_subscription_id,
        {
          cancel_at_period_end: true,
        }
      );

      console.log(`Subscription ${account.stripe_subscription_id} set to cancel at period end`);

      // Get subscription details for email (refresh account data)
      const { data: accountData } = await supabase
        .from('promotion_accounts')
        .select('subscription_plan, subscription_end_date')
        .eq('user_id', userId)
        .single();
      
      // Update database to reflect pending cancellation
      // Set subscription_status to 'pending_cancellation' so UI can show cancellation status
      // The webhook will handle the final status change to 'cancelled' when the period ends
      await supabase
        .from('promotion_accounts')
        .update({ subscription_status: 'pending_cancellation' })
        .eq('user_id', userId);
      
      // Send cancellation email
      try {
        const { data: { user }, error: userError } = await supabase.auth.admin.getUserById(userId);
        
        if (user?.email && accountData?.subscription_plan) {
          const endDate = accountData.subscription_end_date 
            ? new Date(accountData.subscription_end_date)
            : subscription.current_period_end 
              ? new Date(subscription.current_period_end * 1000)
              : new Date();
          
          await sendSubscriptionCancellationEmail({
            to: user.email,
            planName: accountData.subscription_plan.charAt(0).toUpperCase() + accountData.subscription_plan.slice(1),
            endDate: endDate.toISOString(),
          });
          console.log(`✅ Cancellation email sent to ${user.email}`);
        }
      } catch (emailError) {
        console.error('Error sending cancellation email:', emailError);
        // Don't fail the request if email fails
      }
      
      return res.status(200).json({
        success: true,
        message: 'Subscription will be cancelled at the end of the billing period',
        cancelAtPeriodEnd: subscription.cancel_at_period_end,
        currentPeriodEnd: subscription.current_period_end,
      });
    } catch (stripeError) {
      console.error('Error cancelling Stripe subscription:', stripeError);
      return res.status(500).json({
        error: `Failed to cancel subscription: ${stripeError.message}`
      });
    }
  } catch (error) {
    console.error('Error in cancel-subscription endpoint:', error);
    return res.status(500).json({
      error: 'Internal server error'
    });
  }
}

