/**
 * API Route: Subscribe to a promotion plan
 * POST /api/internal/promotion/subscribe
 * 
 * Body: { plan: 'pro' | 'pro_plus' | 'enterprise', userId: string }
 * 
 * Creates a Stripe checkout session for subscription
 */

import { createSupabaseServiceRoleClient } from '@/lib/supabaseClient';
import { SUBSCRIPTION_PRICING } from '@/lib/promotionSystem';
import { stripe, STRIPE_PRICE_IDS, PLAN_TO_TIER } from '@/lib/stripe';

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

    const { plan, userId } = req.body;

    if (!plan || !['pro', 'pro_plus', 'enterprise'].includes(plan)) {
      return res.status(400).json({
        error: 'Invalid plan. Must be "pro", "pro_plus", or "enterprise"'
      });
    }

    if (!userId) {
      return res.status(401).json({
        error: 'User ID required'
      });
    }

    const planInfo = SUBSCRIPTION_PRICING[plan];
    if (!planInfo) {
      return res.status(400).json({
        error: 'Invalid plan'
      });
    }

    const priceId = STRIPE_PRICE_IDS[plan];
    if (!priceId) {
      return res.status(500).json({
        error: 'Stripe price ID not configured for this plan'
      });
    }

    // Get user email from Supabase
    const supabase = createSupabaseServiceRoleClient();
    let userEmail = null;

    // Try to get email from profiles table
    const { data: profile } = await supabase
      .from('profiles')
      .select('email')
      .eq('id', userId)
      .single();

    if (profile?.email) {
      userEmail = profile.email;
    } else {
      // Fallback: try to get from auth.users
      try {
        const { data: { users } } = await supabase.auth.admin.listUsers();
        const user = users?.find(u => u.id === userId);
        if (user?.email) {
          userEmail = user.email;
        }
      } catch (err) {
        console.error('Error fetching user email:', err);
        // Continue without email - Stripe will still work
      }
    }

    // Get or create Stripe customer
    let { data: account } = await supabase
      .from('promotion_accounts')
      .select('stripe_customer_id')
      .eq('user_id', userId)
      .single();

    let customerId = account?.stripe_customer_id;

    if (!customerId) {
      // Create Stripe customer
      const customer = await stripe.customers.create({
        email: userEmail,
        metadata: {
          userId: userId,
        },
      });
      customerId = customer.id;

      // Save customer ID to database
      await supabase
        .from('promotion_accounts')
        .upsert({
          user_id: userId,
          stripe_customer_id: customerId,
        }, {
          onConflict: 'user_id',
        });
    }

    // Create checkout session
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      mode: 'subscription',
      payment_method_types: ['card'],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      metadata: {
        userId: userId,
        plan: plan,
        tier: PLAN_TO_TIER[plan],
      },
      success_url: `${process.env.NEXT_PUBLIC_APP_URL || 'https://toptours.ai'}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL || 'https://toptours.ai'}/cancel`,
      subscription_data: {
        metadata: {
          userId: userId,
          plan: plan,
          tier: PLAN_TO_TIER[plan],
        },
      },
    });

    return res.status(200).json({
      success: true,
      checkoutUrl: session.url,
      sessionId: session.id,
    });
  } catch (error) {
    console.error('Error in subscribe endpoint:', error);
    console.error('Error stack:', error.stack);
    return res.status(500).json({
      error: error.message || 'Failed to create subscription',
      details: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
}

