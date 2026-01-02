import { NextResponse } from 'next/server';
import { createSupabaseServiceRoleClient } from '@/lib/supabaseClient';
import { stripe, STRIPE_PRICE_IDS } from '@/lib/stripe';
import { normalizeDestinationIdToSlug } from '@/lib/destinationIdHelper';

/**
 * POST /api/partners/restaurants/upgrade
 * Adds promotion to an existing restaurant subscription
 */
export async function POST(request) {
  try {
    const body = await request.json();
    const {
      userId,
      subscriptionId,
      promotedBillingCycle, // 'monthly' or 'annual'
    } = body;
    
    // Require authentication
    if (!userId || !subscriptionId) {
      return NextResponse.json(
        { error: 'User ID and subscription ID are required.' },
        { status: 400 }
      );
    }
    
    if (!promotedBillingCycle || !['monthly', 'annual'].includes(promotedBillingCycle)) {
      return NextResponse.json(
        { error: 'Valid billing cycle (monthly or annual) is required.' },
        { status: 400 }
      );
    }
    
    const supabase = createSupabaseServiceRoleClient();
    
    // Try new table first, then old table
    let { data: subscription, error: subError } = await supabase
      .from('restaurant_subscriptions')
      .select('*')
      .eq('id', subscriptionId)
      .eq('user_id', userId)
      .in('status', ['active', 'pending_cancellation'])
      .maybeSingle();
    
    let isOldSubscription = false;
    
    // If not found in new table, try old table
    if (subError || !subscription) {
      const { data: oldSub, error: oldSubError } = await supabase
        .from('restaurant_premium_subscriptions')
        .select('*')
        .eq('id', subscriptionId)
        .eq('user_id', userId)
        .in('status', ['active', 'pending_cancellation'])
        .maybeSingle();
      
      if (oldSubError || !oldSub) {
        return NextResponse.json(
          { error: 'Subscription not found or you do not have permission to modify it.' },
          { status: 404 }
        );
      }
      
      // Convert old subscription format to new format
      subscription = {
        ...oldSub,
        restaurant_premium_plan: oldSub.plan_type === 'yearly' ? 'annual' : 'monthly',
        restaurant_id: oldSub.restaurant_id,
        destination_id: oldSub.destination_id,
        restaurant_slug: oldSub.restaurant_slug,
        restaurant_name: oldSub.restaurant_name,
      };
      isOldSubscription = true;
    }
    
    // Check if already has promotion
    if (subscription.promoted_listing_plan && subscription.promoted_listing_plan !== '') {
      return NextResponse.json(
        { error: 'This restaurant already has a promoted listing. Use the billing portal to manage it.' },
        { status: 400 }
      );
    }
    
    // Check if has premium (required for promotion)
    if (!subscription.restaurant_premium_plan || subscription.restaurant_premium_plan === '') {
      return NextResponse.json(
        { error: 'Premium subscription is required before adding promotion. Please subscribe to premium first.' },
        { status: 400 }
      );
    }
    
    // Get Stripe customer ID
    let customerId = subscription.stripe_customer_id;
    
    // Skip test customer IDs (they start with cus_test_)
    if (customerId && customerId.startsWith('cus_test_')) {
      console.warn(`⚠️ Found test customer ID ${customerId}, will create new customer`);
      customerId = null;
    }
    
    if (!customerId) {
      // Try to get from other restaurant subscriptions for this user
      const { data: otherSub } = await supabase
        .from('restaurant_subscriptions')
        .select('stripe_customer_id')
        .eq('user_id', userId)
        .not('stripe_customer_id', 'is', null)
        .maybeSingle();
      
      customerId = otherSub?.stripe_customer_id;
      
      // Skip test customer IDs
      if (customerId && customerId.startsWith('cus_test_')) {
        console.warn(`⚠️ Found test customer ID ${customerId}, will create new customer`);
        customerId = null;
      }
      
      // If still no customer ID, we'll let Stripe create one during checkout
      // This is fine for new customers or localhost testing
      if (!customerId) {
        console.log('⚠️ No Stripe customer ID found - Stripe will create one during checkout');
      }
    }
    
    // Get the promoted listing price ID
    const promotedPriceIdKey = `promoted_listing_${promotedBillingCycle}`;
    const promotedPriceId = STRIPE_PRICE_IDS[promotedPriceIdKey];
    
    if (!promotedPriceId) {
      return NextResponse.json({
        error: `Stripe price ID not configured for promoted listings. Please add STRIPE_PROMOTED_LISTING_${promotedBillingCycle.toUpperCase()}_PRICE_ID to your .env.local file.`,
      }, { status: 500 });
    }
    
    // Calculate promotion end date (will be updated by webhook with actual Stripe subscription end date)
    const promotionStartDate = new Date();
    let promotionEndDate = new Date();
    if (promotedBillingCycle === 'annual') {
      promotionEndDate.setFullYear(promotionEndDate.getFullYear() + 1);
    } else {
      promotionEndDate.setMonth(promotionEndDate.getMonth() + 1);
    }
    
    // If this is an old subscription, create a record in the new table first
    let actualSubscriptionId = subscriptionId;
    if (isOldSubscription) {
      // Check if record already exists in new table
      const { data: existingNewSub } = await supabase
        .from('restaurant_subscriptions')
        .select('id')
        .eq('user_id', userId)
        .eq('restaurant_id', subscription.restaurant_id)
        .maybeSingle();
      
      if (existingNewSub) {
        actualSubscriptionId = existingNewSub.id;
        console.log(`✅ Using existing restaurant_subscriptions record: ${actualSubscriptionId}`);
      } else {
        // Create a record in restaurant_subscriptions for the old subscription
        const { data: newSub, error: createSubError } = await supabase
          .from('restaurant_subscriptions')
          .insert({
            user_id: userId,
            restaurant_id: subscription.restaurant_id,
            destination_id: subscription.destination_id,
            restaurant_slug: subscription.restaurant_slug,
            restaurant_name: subscription.restaurant_name,
            restaurant_premium_plan: subscription.restaurant_premium_plan || 'monthly',
            stripe_subscription_id: subscription.stripe_subscription_id,
            stripe_customer_id: customerId, // Use the verified customer ID (not test ID)
            status: subscription.status || 'active',
            current_period_end: subscription.current_period_end,
          })
          .select('id')
          .single();
        
        if (createSubError) {
          console.error('Error creating restaurant_subscriptions record:', createSubError);
          // Continue anyway - we'll use NULL for restaurant_subscription_id
          actualSubscriptionId = null;
        } else {
          actualSubscriptionId = newSub.id;
          console.log(`✅ Created restaurant_subscriptions record for old subscription: ${actualSubscriptionId}`);
        }
      }
    }
    
    // Create pending record in promoted_restaurants table BEFORE redirecting to Stripe
    // This allows tracking of pending promotions and manual activation if needed
    console.log(`📝 Creating pending promotion record for restaurant ${subscription.restaurant_id}...`);
    
    // Normalize destination_id to slug format (simple, reliable)
    const destinationSlug = await normalizeDestinationIdToSlug(subscription.destination_id);
    
    // Check if a pending or active promotion already exists
    let existingActiveQuery = supabase
      .from('promoted_restaurants')
      .select('id, status')
      .eq('restaurant_id', subscription.restaurant_id)
      .eq('status', 'active');
    
    if (actualSubscriptionId) {
      existingActiveQuery = existingActiveQuery.eq('restaurant_subscription_id', actualSubscriptionId);
    }
    
    const { data: existingActive } = await existingActiveQuery.maybeSingle();
    
    if (existingActive) {
      return NextResponse.json({
        error: 'This restaurant already has an active promotion.',
      }, { status: 400 });
    }
    
    // Check if a pending promotion exists (we'll update it)
    let existingPendingQuery = supabase
      .from('promoted_restaurants')
      .select('id, status')
      .eq('restaurant_id', subscription.restaurant_id)
      .eq('status', 'pending');
    
    if (actualSubscriptionId) {
      existingPendingQuery = existingPendingQuery.eq('restaurant_subscription_id', actualSubscriptionId);
    }
    
    const { data: existingPending } = await existingPendingQuery.maybeSingle();
    
    let pendingRecordId;
    
    if (existingPending) {
      // Update existing pending record (allows retry of failed checkout)
      const { error: updateError } = await supabase
        .from('promoted_restaurants')
        .update({
          user_id: subscription.user_id, // Ensure user_id is set
          promotion_plan: promotedBillingCycle,
          requested_at: new Date().toISOString(),
          stripe_subscription_id: null, // Reset in case of retry
          start_date: null,
          end_date: null,
          cancelled_at: null,
          destination_id: destinationSlug, // Always store as slug
          restaurant_slug: subscription.restaurant_slug,
          restaurant_name: subscription.restaurant_name,
        })
        .eq('id', existingPending.id);
      
      if (updateError) {
        console.error(`❌ Error updating pending promotion:`, updateError);
        return NextResponse.json({
          error: `Failed to update pending promotion: ${updateError.message}`,
        }, { status: 500 });
      }
      
      pendingRecordId = existingPending.id;
      console.log(`✅ Updated pending promotion record (ID: ${pendingRecordId})`);
    } else {
      // Create new pending record
      const { data: newRecord, error: insertError } = await supabase
        .from('promoted_restaurants')
        .insert({
          restaurant_id: subscription.restaurant_id,
          user_id: subscription.user_id, // Direct link to user for reliable querying
          restaurant_subscription_id: actualSubscriptionId, // Use the actual subscription ID (or NULL for old subscriptions)
          stripe_subscription_id: null, // Will be set by webhook
          promotion_plan: promotedBillingCycle,
          status: 'pending',
          requested_at: new Date().toISOString(),
          start_date: null, // Will be set by webhook when payment confirmed
          end_date: null, // Will be set by webhook when payment confirmed
          destination_id: destinationSlug, // Always store as slug
          restaurant_slug: subscription.restaurant_slug,
          restaurant_name: subscription.restaurant_name,
        })
        .select('id')
        .single();
      
      if (insertError) {
        console.error(`❌ Error creating pending promotion:`, insertError);
        return NextResponse.json({
          error: `Failed to create pending promotion: ${insertError.message}`,
        }, { status: 500 });
      }
      
      pendingRecordId = newRecord.id;
      console.log(`✅ Created pending promotion record (ID: ${pendingRecordId})`);
    }
    
    // ALWAYS create a checkout session for promotion upgrades
    // Payment must be processed before we activate the database records
    // The webhook will handle updating records from "pending" to "active" after payment is confirmed
    
    console.log(`🛒 Creating checkout session for restaurant promotion upgrade...`);
    console.log(`   Customer: ${customerId || 'Will be created by Stripe'}`);
    console.log(`   Restaurant ID: ${subscription.restaurant_id}`);
    console.log(`   Billing cycle: ${promotedBillingCycle}`);
    console.log(`   Price ID: ${promotedPriceId}`);
    
    try {
      // Build checkout session params
      const checkoutParams = {
        mode: 'subscription',
        payment_method_types: ['card'],
        line_items: [{
          price: promotedPriceId,
          quantity: 1,
        }],
        metadata: {
          type: 'restaurant_promotion_upgrade',
          subscriptionId: actualSubscriptionId || subscriptionId, // Use actual subscription ID if we created one
          userId: userId,
          restaurantId: subscription.restaurant_id.toString(),
          promotedBillingCycle: promotedBillingCycle,
          isOldSubscription: isOldSubscription ? 'true' : 'false', // Flag for webhook
        },
        success_url: `${process.env.NEXT_PUBLIC_SITE_URL || 'https://toptours.ai'}/profile?tab=my-restaurants&promotion_success=true`,
        cancel_url: `${process.env.NEXT_PUBLIC_SITE_URL || 'https://toptours.ai'}/profile?tab=my-restaurants&promotion_canceled=true`,
      };
      
      // Only add customer if we have one (Stripe can create one during checkout)
      if (customerId) {
        checkoutParams.customer = customerId;
      } else {
        // For new customers, we can optionally add customer_email from user profile
        // This helps Stripe pre-fill the email in checkout
        const { data: userProfile } = await supabase
          .from('profiles')
          .select('email')
          .eq('id', userId)
          .maybeSingle();
        
        if (userProfile?.email) {
          checkoutParams.customer_email = userProfile.email;
        }
      }
      
      const checkoutSession = await stripe.checkout.sessions.create(checkoutParams);
      
      console.log(`✅ Checkout session created: ${checkoutSession.url}`);
      console.log(`   Session ID: ${checkoutSession.id}`);
      
      return NextResponse.json({
        success: false,
        requiresCheckout: true,
        checkoutUrl: checkoutSession.url,
        message: 'Please complete checkout to add promotion to your restaurant.',
      });
      
    } catch (stripeError) {
      console.error('❌ [UPGRADE] Error creating checkout session:', stripeError);
      return NextResponse.json({
        error: `Failed to create checkout session: ${stripeError.message || 'Unknown error'}. Please try again or contact support.`,
      }, { status: 500 });
    }
    
  } catch (error) {
    const errorMsg = error?.message || 'Internal server error';
    console.error('[Restaurant Upgrade] Error:', errorMsg);
    
    return NextResponse.json(
      { 
        error: errorMsg,
        ...(process.env.NODE_ENV === 'development' && error?.stack ? { stack: error.stack } : {})
      },
      { status: 500 }
    );
  }
}

