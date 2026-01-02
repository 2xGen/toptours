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

    if (!subscriptionId && !restaurantId) {
      return NextResponse.json(
        { error: 'subscriptionId or restaurantId is required' },
        { status: 400 }
      );
    }

    const supabase = createSupabaseServiceRoleClient();

    // Find the subscription
    let query = supabase
      .from('restaurant_subscriptions')
      .select('*, restaurants:restaurant_id(name, slug, destination_id)')
      .eq('status', 'active');

    if (subscriptionId) {
      query = query.eq('id', subscriptionId);
    } else if (restaurantId) {
      query = query.eq('restaurant_id', restaurantId);
    }

    if (userId) {
      query = query.eq('user_id', userId);
    }

    const { data: subscription, error: subError } = await query.maybeSingle();

    if (subError || !subscription) {
      return NextResponse.json(
        { error: 'Subscription not found' },
        { status: 404 }
      );
    }

    // Get user email
    let userEmail = subscription.email;
    if (!userEmail && userId) {
      try {
        const { data: { user } } = await supabase.auth.admin.getUserById(userId);
        userEmail = user?.email;
      } catch (error) {
        console.error('Error fetching user email:', error);
      }
    }

    if (!userEmail) {
      return NextResponse.json(
        { error: 'User email not found' },
        { status: 400 }
      );
    }

    // Get restaurant details
    const restaurantName = subscription.restaurant_name || 'Your Restaurant';
    const restaurantSlug = subscription.restaurant_slug || '';
    const destinationId = subscription.destination_id || '';
    const planType = subscription.restaurant_premium_plan || 'monthly';
    const endDate = subscription.current_period_end || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();

    // Send confirmation email
    const emailResult = await sendRestaurantPremiumConfirmationEmail({
      to: userEmail,
      restaurantName: restaurantName,
      planType: planType === 'annual' ? 'yearly' : 'monthly',
      destinationId: destinationId,
      restaurantSlug: restaurantSlug,
      endDate: endDate,
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

