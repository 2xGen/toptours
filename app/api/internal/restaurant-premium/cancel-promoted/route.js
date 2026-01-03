import { NextResponse } from 'next/server';
import { createSupabaseServiceRoleClient } from '@/lib/supabaseClient';
import { stripe } from '@/lib/stripe';

/**
 * POST /api/internal/restaurant-premium/cancel-promoted
 * Cancel a promoted restaurant listing subscription separately from premium
 */
export async function POST(request) {
  try {
    const body = await request.json();
    const { restaurantId, userId, destinationId } = body;

    if (!restaurantId || !userId || !destinationId) {
      return NextResponse.json(
        { error: 'restaurantId, userId, and destinationId are required' },
        { status: 400 }
      );
    }

    const supabase = createSupabaseServiceRoleClient();

    // Find the promoted restaurant record
    const { data: promotedRecord, error: promotedError } = await supabase
      .from('promoted_restaurants')
      .select('id, stripe_subscription_id, status, restaurant_name')
      .eq('restaurant_id', restaurantId)
      .eq('user_id', userId)
      .eq('destination_id', destinationId)
      .in('status', ['active', 'pending'])
      .maybeSingle();

    if (promotedError || !promotedRecord) {
      return NextResponse.json(
        { error: 'Promoted listing not found' },
        { status: 404 }
      );
    }

    if (!promotedRecord.stripe_subscription_id) {
      // If no Stripe subscription, just mark as cancelled in database
      const { error: updateError } = await supabase
        .from('promoted_restaurants')
        .update({
          status: 'cancelled',
          cancelled_at: new Date().toISOString(),
        })
        .eq('id', promotedRecord.id);

      if (updateError) {
        return NextResponse.json(
          { error: 'Failed to cancel promoted listing', details: updateError.message },
          { status: 500 }
        );
      }

      return NextResponse.json({
        success: true,
        message: 'Promoted listing cancelled successfully',
      });
    }

    // Cancel the Stripe subscription (at period end)
    try {
      const subscription = await stripe.subscriptions.update(
        promotedRecord.stripe_subscription_id,
        {
          cancel_at_period_end: true,
        }
      );

      // Update database to reflect pending cancellation
      const { error: updateError } = await supabase
        .from('promoted_restaurants')
        .update({
          status: 'pending_cancellation',
        })
        .eq('id', promotedRecord.id);

      if (updateError) {
        console.error('Error updating promoted_restaurants status:', updateError);
        // Don't fail - Stripe cancellation succeeded
      }

      return NextResponse.json({
        success: true,
        message: 'Promoted listing will be cancelled at the end of the billing period',
        cancelDate: subscription.current_period_end 
          ? new Date(subscription.current_period_end * 1000).toISOString()
          : null,
      });
    } catch (stripeError) {
      console.error('Error cancelling Stripe subscription:', stripeError);
      return NextResponse.json(
        { error: 'Failed to cancel Stripe subscription', details: stripeError.message },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Error in cancel-promoted route:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

