/**
 * Resend Restaurant Subscription Confirmation Email
 * 
 * Allows users to resend their confirmation email if they didn't receive it.
 * This is useful for troubleshooting email delivery issues.
 * 
 * POST /api/internal/resend-restaurant-confirmation-email
 * Body: { subscriptionId, restaurantId, userId }
 */

import { NextResponse } from 'next/server';
import { createSupabaseServiceRoleClient } from '@/lib/supabaseClient';
import { sendRestaurantPremiumConfirmationEmail } from '@/lib/email';

export async function POST(request) {
  try {
    const body = await request.json();
    const { subscriptionId, restaurantId, userId } = body;

    console.log('[RESEND EMAIL] Request received:', { subscriptionId, restaurantId, userId });

    if (!subscriptionId && !restaurantId) {
      return NextResponse.json(
        { error: 'subscriptionId or restaurantId is required' },
        { status: 400 }
      );
    }

    const supabase = createSupabaseServiceRoleClient();

    // Find the subscription - match exactly how webhook queries
    let query = supabase
      .from('restaurant_premium_subscriptions')
      .select('*')
      .in('status', ['active', 'pending_cancellation', 'pending']);

    if (subscriptionId) {
      query = query.eq('id', subscriptionId);
    } else if (restaurantId) {
      query = query.eq('restaurant_id', restaurantId);
    }

    if (userId) {
      query = query.eq('user_id', userId);
    }

    const { data: subscription, error: subError } = await query.maybeSingle();

    if (subError) {
      console.error('[RESEND EMAIL] Error querying subscription:', subError);
      return NextResponse.json(
        { error: `Subscription query failed: ${subError.message}` },
        { status: 500 }
      );
    }

    if (!subscription) {
      console.error('[RESEND EMAIL] Subscription not found');
      return NextResponse.json(
        { error: 'Subscription not found' },
        { status: 404 }
      );
    }

    console.log('[RESEND EMAIL] Found subscription:', { id: subscription.id, restaurant_name: subscription.restaurant_name });

    // Get user email - try multiple sources like webhook does
    let userEmail = subscription.purchaser_email;
    
    if (!userEmail && userId) {
      try {
        const { data: { user }, error: userError } = await supabase.auth.admin.getUserById(userId);
        if (userError) {
          console.error('[RESEND EMAIL] Error fetching user:', userError);
        } else {
          userEmail = user?.email;
          console.log('[RESEND EMAIL] Got email from auth:', userEmail);
        }
      } catch (error) {
        console.error('[RESEND EMAIL] Exception fetching user email:', error);
      }
    }

    if (!userEmail) {
      console.error('[RESEND EMAIL] No email found for subscription:', subscription.id);
      return NextResponse.json(
        { error: 'User email not found. Please contact support.' },
        { status: 400 }
      );
    }

    console.log('[RESEND EMAIL] Sending email to:', userEmail);

    // Get restaurant details - match exactly how webhook does it
    const restaurantName = subscription.restaurant_name || subscription.restaurant_slug || 'Your Restaurant';
    const restaurantSlug = subscription.restaurant_slug || '';
    const destinationId = subscription.destination_id || '';
    
    // Normalize plan type - match webhook format
    const emailPlanType = subscription.plan_type === 'yearly' ? 'yearly' : 'monthly';
    
    // Normalize destination ID to slug format (like webhook does)
    const { normalizeDestinationIdToSlug } = await import('@/lib/destinationIdHelper');
    const emailDestinationId = await normalizeDestinationIdToSlug(destinationId);
    
    // Get period end date
    const currentPeriodEnd = subscription.current_period_end 
      ? new Date(subscription.current_period_end).toISOString()
      : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();

    // Send confirmation email - match exactly how webhook sends it
    const emailResult = await sendRestaurantPremiumConfirmationEmail({
      to: userEmail,
      restaurantName: restaurantName,
      planType: emailPlanType,
      destinationId: emailDestinationId || destinationId,
      restaurantSlug: restaurantSlug,
      endDate: currentPeriodEnd,
    });

    if (emailResult.success) {
      return NextResponse.json({
        success: true,
        message: 'Confirmation email sent successfully',
      });
    } else {
      return NextResponse.json(
        { error: emailResult.error || 'Failed to send email' },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Error resending confirmation email:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to resend email' },
      { status: 500 }
    );
  }
}

