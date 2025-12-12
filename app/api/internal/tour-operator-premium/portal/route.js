import { NextResponse } from 'next/server';
import { createSupabaseServiceRoleClient } from '@/lib/supabaseClient';
import { stripe } from '@/lib/stripe';

/**
 * POST /api/internal/tour-operator-premium/portal
 * Create a Stripe billing portal session for tour operator subscription management
 */
export async function POST(request) {
  try {
    const body = await request.json();
    const { subscriptionId, userId } = body;
    
    if (!subscriptionId || !userId) {
      return NextResponse.json(
        { error: 'Missing required fields: subscriptionId, userId' },
        { status: 400 }
      );
    }
    
    const supabase = createSupabaseServiceRoleClient();
    
    // Verify subscription belongs to user
    const { data: subscription, error: subError } = await supabase
      .from('tour_operator_subscriptions')
      .select('stripe_customer_id')
      .eq('id', subscriptionId)
      .eq('user_id', userId)
      .single();
    
    if (subError || !subscription) {
      return NextResponse.json(
        { error: 'Subscription not found or access denied' },
        { status: 404 }
      );
    }
    
    if (!subscription.stripe_customer_id) {
      return NextResponse.json(
        { error: 'No Stripe customer ID found for this subscription' },
        { status: 400 }
      );
    }
    
    // Create billing portal session
    const session = await stripe.billingPortal.sessions.create({
      customer: subscription.stripe_customer_id,
      return_url: `${process.env.NEXT_PUBLIC_SITE_URL || 'https://toptours.ai'}/profile?tab=my-tours`,
    });
    
    return NextResponse.json({
      url: session.url,
    });
    
  } catch (error) {
    console.error('Error creating billing portal session:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to create billing portal session' },
      { status: 500 }
    );
  }
}

