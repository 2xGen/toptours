import { NextResponse } from 'next/server';
import { createSupabaseServiceRoleClient } from '@/lib/supabaseClient';
import { stripe } from '@/lib/stripe';

/**
 * POST /api/internal/process-promotion-upgrade
 * Manually process a promotion upgrade checkout session (for testing)
 * Pass the checkout session ID from Stripe
 * 
 * Usage: POST /api/internal/process-promotion-upgrade
 * Body: { "checkoutSessionId": "cs_test_..." }
 */
export async function POST(request) {
  try {
    const body = await request.json();
    const { checkoutSessionId } = body;
    
    if (!checkoutSessionId) {
      return NextResponse.json(
        { error: 'checkoutSessionId is required' },
        { status: 400 }
      );
    }
    
    console.log(`🔄 [MANUAL] Processing promotion upgrade for checkout session: ${checkoutSessionId}`);
    
    // Retrieve the checkout session from Stripe
    const session = await stripe.checkout.sessions.retrieve(checkoutSessionId, {
      expand: ['subscription'],
    });
    
    console.log(`✅ [MANUAL] Retrieved checkout session:`, {
      id: session.id,
      payment_status: session.payment_status,
      subscription: session.subscription,
      metadata: session.metadata,
    });
    
    // Verify payment was successful
    if (session.payment_status !== 'paid') {
      return NextResponse.json({
        error: `Payment status is not 'paid': ${session.payment_status}`,
        payment_status: session.payment_status,
      }, { status: 400 });
    }
    
    const supabase = createSupabaseServiceRoleClient();
    const metadata = session.metadata || {};
    const subscriptionId = session.subscription;
    const subscriptionDbId = metadata.subscriptionId;
    const userId = metadata.userId;
    const promotedTourIdsStr = metadata.promotedTourIds || '';
    const promotedBillingCycle = metadata.promotedBillingCycle || 'monthly';
    
    console.log(`🔄 [MANUAL] Processing tour operator promotion upgrade for subscription ${subscriptionDbId}, Stripe subscription ${subscriptionId}`);
    
    if (!subscriptionDbId || !subscriptionId || !userId) {
      return NextResponse.json({
        error: 'Missing required fields for promotion upgrade',
        metadata,
      }, { status: 400 });
    }
    
    // Get subscription details from database
    const { data: subscription, error: subError } = await supabase
      .from('tour_operator_subscriptions')
      .select('*')
      .eq('id', subscriptionDbId)
      .eq('user_id', userId)
      .single();
    
    if (subError || !subscription) {
      return NextResponse.json({
        error: 'Subscription not found',
        errorDetails: subError,
      }, { status: 404 });
    }
    
    // Update subscription with new Stripe subscription ID if it's different
    if (subscription.stripe_subscription_id !== subscriptionId) {
      const { error: updateError } = await supabase
        .from('tour_operator_subscriptions')
        .update({ stripe_subscription_id: subscriptionId })
        .eq('id', subscriptionDbId);
      
      if (updateError) {
        console.error('❌ [MANUAL] Error updating subscription Stripe ID:', updateError);
      } else {
        console.log(`✅ [MANUAL] Updated subscription ${subscriptionDbId} with Stripe subscription ID ${subscriptionId}`);
      }
    }
    
    // Parse promoted tour IDs
    const promotedTourIds = promotedTourIdsStr.split(',').filter(Boolean);
    
    if (promotedTourIds.length === 0) {
      return NextResponse.json({
        error: 'No promoted tour IDs provided',
      }, { status: 400 });
    }
    
    // Get subscription period end from Stripe
    let promotionEndDate = new Date();
    try {
      const stripeSubscription = await stripe.subscriptions.retrieve(subscriptionId);
      if (stripeSubscription.current_period_end) {
        promotionEndDate = new Date(stripeSubscription.current_period_end * 1000);
      } else {
        // Fallback: calculate based on billing cycle
        if (promotedBillingCycle === 'annual') {
          promotionEndDate.setFullYear(promotionEndDate.getFullYear() + 1);
        } else {
          promotionEndDate.setMonth(promotionEndDate.getMonth() + 1);
        }
      }
    } catch (err) {
      console.error('❌ [MANUAL] Error fetching Stripe subscription details:', err);
      // Use fallback calculation
      if (promotedBillingCycle === 'annual') {
        promotionEndDate.setFullYear(promotionEndDate.getFullYear() + 1);
      } else {
        promotionEndDate.setMonth(promotionEndDate.getMonth() + 1);
      }
    }
    
    const promotionStartDate = new Date();
    
    console.log(`📢 [MANUAL] Processing ${promotedTourIds.length} promoted tour listing(s) for upgrade`);
    
    const results = [];
    
    // Update each promoted tour
    for (const productId of promotedTourIds) {
      // Update operator_tours table
      const { error: tourUpdateError } = await supabase
        .from('operator_tours')
        .update({
          is_promoted: true,
          promoted_until: promotionEndDate.toISOString(),
          promotion_plan: promotedBillingCycle,
          promotion_stripe_subscription_id: subscriptionId,
        })
        .eq('operator_subscription_id', subscriptionDbId)
        .eq('product_id', productId);
      
      if (tourUpdateError) {
        console.error(`❌ [MANUAL] Error updating operator_tours for ${productId}:`, tourUpdateError);
        results.push({ productId, operator_tours: { success: false, error: tourUpdateError.message } });
      } else {
        console.log(`✅ [MANUAL] Updated operator_tours for ${productId}`);
        results.push({ productId, operator_tours: { success: true } });
      }
      
      // Create record in promoted_tours table
      const { error: promotedToursError } = await supabase
        .from('promoted_tours')
        .insert({
          product_id: productId,
          operator_id: subscription.operator_id,
          operator_subscription_id: subscriptionDbId,
          stripe_subscription_id: subscriptionId,
          promotion_plan: promotedBillingCycle,
          status: 'active',
          start_date: promotionStartDate.toISOString(),
          end_date: promotionEndDate.toISOString(),
        });
      
      if (promotedToursError) {
        console.error(`❌ [MANUAL] Error creating promoted_tours record for ${productId}:`, promotedToursError);
        results[results.length - 1].promoted_tours = { success: false, error: promotedToursError.message };
      } else {
        console.log(`✅ [MANUAL] Created promoted_tours record for ${productId} (active until ${promotionEndDate.toISOString()})`);
        results[results.length - 1].promoted_tours = { success: true };
      }
    }
    
    console.log(`✅ [MANUAL] Promotion upgrade completed for ${promotedTourIds.length} tour(s)`);
    
    return NextResponse.json({
      success: true,
      message: 'Promotion upgrade processed successfully',
      sessionId: session.id,
      subscriptionId: subscriptionDbId,
      promotedTourIds,
      promotionEndDate: promotionEndDate.toISOString(),
      results,
    });
    
  } catch (error) {
    console.error('❌ [MANUAL] Error processing promotion upgrade:', error);
    return NextResponse.json({
      error: error.message || 'Failed to process promotion upgrade',
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined,
    }, { status: 500 });
  }
}
