import { NextResponse } from 'next/server';
import { createSupabaseServiceRoleClient } from '@/lib/supabaseClient';
import { stripe } from '@/lib/stripe';

/**
 * POST /api/internal/restaurant-premium/portal
 * Create a Stripe billing portal session for restaurant subscription management
 */
export async function POST(request) {
  try {
    const body = await request.json();
    const { customerId, subscriptionId, userId } = body;
    
    // Support both customerId (direct) and subscriptionId (fetch from DB) approaches
    let stripeCustomerId = customerId;
    
    if (!stripeCustomerId && subscriptionId && userId) {
      // Fetch customer ID from subscription if not provided directly
      const supabase = createSupabaseServiceRoleClient();
      
      // Try restaurant_subscriptions first (new unified table)
      let { data: subscription, error: subError } = await supabase
        .from('restaurant_subscriptions')
        .select('stripe_customer_id, stripe_subscription_id')
        .eq('id', subscriptionId)
        .eq('user_id', userId)
        .maybeSingle();
      
      // If not found, try restaurant_premium_subscriptions (legacy table)
      if (subError || !subscription) {
        const { data: premiumSub, error: premiumError } = await supabase
          .from('restaurant_premium_subscriptions')
          .select('stripe_customer_id, stripe_subscription_id')
          .eq('id', subscriptionId)
          .eq('user_id', userId)
          .maybeSingle();
        
        if (!premiumError && premiumSub) {
          subscription = premiumSub;
        }
      }
      
      if (subscription?.stripe_customer_id) {
        stripeCustomerId = subscription.stripe_customer_id;
      } else if (subscription?.stripe_subscription_id) {
        // Fallback: Fetch customer ID from Stripe subscription
        try {
          const stripeSubscription = await stripe.subscriptions.retrieve(subscription.stripe_subscription_id);
          if (stripeSubscription.customer) {
            stripeCustomerId = typeof stripeSubscription.customer === 'string' 
              ? stripeSubscription.customer 
              : stripeSubscription.customer.id;
          }
        } catch (stripeError) {
          console.error('Error fetching customer ID from Stripe subscription:', stripeError);
        }
      }
    }
    
    if (!stripeCustomerId) {
      return NextResponse.json(
        { error: 'Customer ID is required. Please contact support if you continue to see this error.' },
        { status: 400 }
      );
    }
    
    // Create billing portal session
    const returnUrl = body.returnUrl || `${process.env.NEXT_PUBLIC_SITE_URL || 'https://toptours.ai'}/profile?tab=my-restaurants`;
    
    const session = await stripe.billingPortal.sessions.create({
      customer: stripeCustomerId,
      return_url: returnUrl,
    });
    
    return NextResponse.json({
      url: session.url,
    });
    
  } catch (error) {
    console.error('Error creating restaurant billing portal session:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to create billing portal session' },
      { status: 500 }
    );
  }
}

