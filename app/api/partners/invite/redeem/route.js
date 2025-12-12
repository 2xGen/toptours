import { NextResponse } from 'next/server';
import { createSupabaseServiceRoleClient } from '@/lib/supabaseClient';
import { sendTourOperatorPremiumConfirmationEmail, sendRestaurantPremiumConfirmationEmail } from '@/lib/email';

/**
 * POST /api/partners/invite/redeem
 * Redeem a partner invite code
 * 
 * Body: {
 *   code: string,
 *   email: string,
 *   operatorName?: string (for tour operators),
 *   restaurantId?: number (for restaurants),
 *   destinationId?: string (for restaurants),
 *   restaurantSlug?: string (for restaurants),
 *   restaurantName?: string (for restaurants),
 *   tourUrls?: string[] (for tour operators),
 *   selectedTourIds?: string[] (for tour operators)
 * }
 */
export async function POST(request) {
  try {
    const body = await request.json();
    const {
      code,
      email,
      operatorName,
      tourUrls,
      selectedTourIds
    } = body;
    
    // These will be set from the invite code for restaurants
    let restaurantId;
    let destinationId;
    let restaurantSlug;
    let restaurantName;

    if (!code || !email) {
      return NextResponse.json(
        { error: 'Code and email are required' },
        { status: 400 }
      );
    }

    const supabase = createSupabaseServiceRoleClient();

    // Find the invite code
    const { data: inviteCode, error: codeError } = await supabase
      .from('partner_invite_codes')
      .select('*')
      .eq('code', code.toUpperCase().trim())
      .single();

    if (codeError || !inviteCode) {
      return NextResponse.json(
        { error: 'Invalid invite code' },
        { status: 404 }
      );
    }

    // Validate code
    if (!inviteCode.is_active) {
      return NextResponse.json(
        { error: 'This invite code has been deactivated' },
        { status: 400 }
      );
    }

    if (inviteCode.used_at) {
      return NextResponse.json(
        { error: 'This invite code has already been used' },
        { status: 400 }
      );
    }

    if (inviteCode.expires_at && new Date(inviteCode.expires_at) < new Date()) {
      return NextResponse.json(
        { error: 'This invite code has expired' },
        { status: 400 }
      );
    }

    // Calculate period end
    const periodStart = new Date();
    const periodEnd = new Date();
    periodEnd.setMonth(periodEnd.getMonth() + inviteCode.duration_months);

    // Handle tour operator redemption
    if (inviteCode.type === 'tour_operator') {
      if (!operatorName) {
        return NextResponse.json(
          { error: 'Operator name is required for tour operator codes' },
          { status: 400 }
        );
      }

      // Try to find user by email to link subscription to account if they have one
      let userId = null;
      try {
        const { data: { users } } = await supabase.auth.admin.listUsers();
        const user = users?.find(u => u.email?.toLowerCase() === email.toLowerCase());
        if (user) {
          userId = user.id;
          console.log(`Found user account for ${email}, linking subscription to user ${userId}`);
        }
      } catch (userLookupError) {
        console.log('Could not lookup user by email (non-critical):', userLookupError.message);
        // Continue without user linking - subscription will work with email only
      }

      // Create tour operator subscription
      const maxTours = inviteCode.max_tours || 15;
      const subscriptionPlan = maxTours === 15 ? '15-tours-monthly' : '5-tours-monthly';

      const { data: subscription, error: subError } = await supabase
        .from('tour_operator_subscriptions')
        .insert({
          operator_name: operatorName,
          operator_email: email,
          status: 'active',
          subscription_plan: subscriptionPlan,
          stripe_subscription_id: `invite_code_${inviteCode.code}`, // Mark as invite code
          stripe_customer_id: null,
          stripe_price_id: null,
          current_period_start: periodStart.toISOString(),
          current_period_end: periodEnd.toISOString(),
          verification_status: 'verified', // Auto-verify invite codes
          verified_tour_ids: selectedTourIds || [],
          ...(userId && { user_id: userId }), // Link to user account if found
        })
        .select()
        .single();

      if (subError) {
        console.error('Error creating tour operator subscription:', subError);
        return NextResponse.json(
          { error: 'Failed to create subscription' },
          { status: 500 }
        );
      }

      // Add tours if provided
      if (selectedTourIds && selectedTourIds.length > 0) {
        const tourInserts = selectedTourIds.map(productId => ({
          operator_subscription_id: subscription.id,
          product_id: productId,
          is_active: true,
        }));

        const { error: toursError } = await supabase
          .from('operator_tours')
          .insert(tourInserts);

        if (toursError) {
          console.error('Error adding tours:', toursError);
          // Don't fail - subscription is created, tours can be added later
        }
      }

      // Mark code as used
      await supabase
        .from('partner_invite_codes')
        .update({
          used_by_email: email,
          used_at: new Date().toISOString(),
          subscription_id: subscription.id,
        })
        .eq('id', inviteCode.id);

      // Send confirmation email
      try {
        await sendTourOperatorPremiumConfirmationEmail({
          to: email,
          operatorName: operatorName,
          tourCount: maxTours,
          billingCycle: 'monthly', // Free trial, but use monthly billing cycle format
          endDate: periodEnd.toISOString(),
        });
      } catch (emailError) {
        console.error('Error sending confirmation email:', emailError);
        // Don't fail if email fails
      }

      return NextResponse.json({
        success: true,
        message: userId 
          ? 'Invite code redeemed successfully! Your subscription is linked to your account.'
          : 'Invite code redeemed successfully!',
        subscription: {
          id: subscription.id,
          type: 'tour_operator',
          periodEnd: periodEnd.toISOString(),
          maxTours: maxTours,
          linkedToAccount: !!userId,
        }
      });

    } else if (inviteCode.type === 'restaurant') {
      // Handle restaurant redemption
      // Use stored restaurant info from the code
      console.log('Restaurant invite code data:', {
        restaurant_id: inviteCode.restaurant_id,
        destination_id: inviteCode.destination_id,
        restaurant_slug: inviteCode.restaurant_slug,
        restaurant_name: inviteCode.restaurant_name,
      });

      if (!inviteCode.restaurant_id || !inviteCode.destination_id || !inviteCode.restaurant_slug) {
        console.error('Missing restaurant info in invite code:', inviteCode);
        return NextResponse.json(
          { error: 'This invite code is missing restaurant information. Please contact support.' },
          { status: 400 }
        );
      }

      // Use the restaurant info stored with the code
      restaurantId = inviteCode.restaurant_id;
      destinationId = inviteCode.destination_id;
      restaurantSlug = inviteCode.restaurant_slug;
      restaurantName = inviteCode.restaurant_name || null;

      console.log('Using restaurant data:', { restaurantId, destinationId, restaurantSlug, restaurantName });

      // Try to find user by email to link subscription to account if they have one
      let userId = null;
      try {
        const { data: { users } } = await supabase.auth.admin.listUsers();
        const user = users?.find(u => u.email?.toLowerCase() === email.toLowerCase());
        if (user) {
          userId = user.id;
          console.log(`Found user account for ${email}, linking subscription to user ${userId}`);
        }
      } catch (userLookupError) {
        console.log('Could not lookup user by email (non-critical):', userLookupError.message);
        // Continue without user linking - subscription will work with email only
      }

      // Create restaurant premium subscription
      // Use upsert to handle existing subscriptions (update if exists, insert if not)
      // Set sensible defaults for premium features (they can customize later in profile)
      const subscriptionData = {
        restaurant_id: parseInt(restaurantId), // Ensure it's an integer
        destination_id: destinationId,
        restaurant_slug: restaurantSlug,
        restaurant_name: restaurantName || null,
        stripe_subscription_id: `invite_code_${inviteCode.code}`, // Mark as invite code
        stripe_customer_id: null,
        stripe_price_id: null,
        plan_type: 'monthly', // Free tier, but use monthly format
        status: 'active',
        current_period_start: periodStart.toISOString(),
        current_period_end: periodEnd.toISOString(),
        purchaser_email: email,
        // Premium feature defaults - all CTAs enabled with sensible defaults
        layout_preset: 'ocean', // Blue gradient theme
        color_scheme: 'blue', // Blue CTA buttons
        hero_cta_index: 0, // First hero CTA option
        mid_cta_index: 0, // First mid-page CTA option
        end_cta_index: 0, // First end-page CTA option
        sticky_cta_index: 0, // First sticky CTA option
        ...(userId && { user_id: userId }), // Link to user account if found
      };

      console.log('Creating restaurant premium subscription with data:', subscriptionData);

      const { data: subscription, error: subError } = await supabase
        .from('restaurant_premium_subscriptions')
        .upsert(subscriptionData, {
          onConflict: 'restaurant_id,destination_id',
        })
        .select()
        .single();

      if (subError) {
        console.error('Error creating restaurant premium subscription:', subError);
        console.error('Restaurant data:', { restaurantId, destinationId, restaurantSlug, restaurantName });
        return NextResponse.json(
          { error: 'Failed to create subscription', details: subError.message },
          { status: 500 }
        );
      }

      // Mark code as used
      await supabase
        .from('partner_invite_codes')
        .update({
          used_by_email: email,
          used_at: new Date().toISOString(),
          subscription_id: subscription.id,
        })
        .eq('id', inviteCode.id);

      // Send confirmation email
      try {
        await sendRestaurantPremiumConfirmationEmail({
          to: email,
          restaurantName: restaurantName || restaurantSlug,
          planType: 'monthly',
          destinationId: destinationId,
          restaurantSlug: restaurantSlug,
          endDate: periodEnd.toISOString(),
        });
      } catch (emailError) {
        console.error('Error sending confirmation email:', emailError);
        // Don't fail if email fails - subscription is already created
      }

      return NextResponse.json({
        success: true,
        message: 'Invite code redeemed successfully!',
        subscription: {
          id: subscription.id,
          type: 'restaurant',
          periodEnd: periodEnd.toISOString(),
          linkedToAccount: !!userId,
        },
        ...(userId && { 
          message: 'Invite code redeemed successfully! Your subscription is linked to your account.',
        }),
      });
    }

    return NextResponse.json(
      { error: 'Invalid invite code type' },
      { status: 400 }
    );

  } catch (error) {
    console.error('Error redeeming invite code:', error);
    console.error('Error stack:', error.stack);
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    );
  }
}

