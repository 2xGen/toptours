import { NextResponse } from 'next/server';
import { createSupabaseServiceRoleClient } from '@/lib/supabaseClient';
import { stripe, STRIPE_PRICE_IDS } from '@/lib/stripe';

/**
 * POST /api/partners/tour-operators/upgrade
 * Adds promotion to existing tours in a tour operator subscription
 */
export async function POST(request) {
  try {
    const body = await request.json();
    const {
      userId,
      subscriptionId,
      promotedTourIds, // Array of product IDs to promote
      promotedBillingCycle, // 'monthly' or 'annual'
    } = body;
    
    // Require authentication
    if (!userId || !subscriptionId) {
      return NextResponse.json(
        { error: 'User ID and subscription ID are required.' },
        { status: 400 }
      );
    }
    
    if (!promotedTourIds || !Array.isArray(promotedTourIds) || promotedTourIds.length === 0) {
      return NextResponse.json(
        { error: 'At least one tour must be selected for promotion.' },
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
    
    // Verify subscription exists and belongs to user
    const { data: subscription, error: subError } = await supabase
      .from('tour_operator_subscriptions')
      .select('*')
      .eq('id', subscriptionId)
      .eq('user_id', userId)
      .in('status', ['active', 'pending_cancellation'])
      .single();
    
    if (subError || !subscription) {
      return NextResponse.json(
        { error: 'Subscription not found or you do not have permission to modify it.' },
        { status: 404 }
      );
    }
    
    // Verify all tours belong to this subscription
    const subscriptionTourIds = subscription.verified_tour_ids || [];
    const invalidTours = promotedTourIds.filter(id => !subscriptionTourIds.includes(id));
    
    if (invalidTours.length > 0) {
      return NextResponse.json(
        { error: `The following tours are not part of this subscription: ${invalidTours.join(', ')}` },
        { status: 400 }
      );
    }
    
    // Get Stripe customer ID (optional - Stripe can create customer during checkout)
    let customerId = subscription.stripe_customer_id;
    if (!customerId) {
      // Try to get from other tour operator subscriptions for this user
      const { data: otherSub } = await supabase
        .from('tour_operator_subscriptions')
        .select('stripe_customer_id')
        .eq('user_id', userId)
        .not('stripe_customer_id', 'is', null)
        .maybeSingle();
      
      customerId = otherSub?.stripe_customer_id;
      
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
    
    // Get the existing Stripe subscription
    let stripeSubscriptionId = subscription.stripe_subscription_id;
    if (!stripeSubscriptionId) {
      return NextResponse.json(
        { error: 'Stripe subscription ID not found. Please contact support.' },
        { status: 400 }
      );
    }
    
    // Calculate promotion end date (will be updated by webhook with actual Stripe subscription end date)
    const promotionStartDate = new Date();
    let promotionEndDate = new Date();
    if (promotedBillingCycle === 'annual') {
      promotionEndDate.setFullYear(promotionEndDate.getFullYear() + 1);
    } else {
      promotionEndDate.setMonth(promotionEndDate.getMonth() + 1);
    }
    
    // Get operator_id from subscription or from operator_tours table
    let operatorId = subscription.operator_id;
    
    if (!operatorId) {
      // Try to get operator_id from operator_tours table
      const { data: operatorTour } = await supabase
        .from('operator_tours')
        .select('operator_id')
        .eq('operator_subscription_id', subscriptionId)
        .limit(1)
        .maybeSingle();
      
      if (operatorTour && operatorTour.operator_id) {
        operatorId = operatorTour.operator_id;
        // Update subscription with operator_id for future use
        await supabase
          .from('tour_operator_subscriptions')
          .update({ operator_id: operatorId })
          .eq('id', subscriptionId);
        console.log(`✅ Retrieved and saved operator_id ${operatorId} from operator_tours`);
      } else {
        // Generate a new operator_id (UUID) if none exists
        // This can happen for older subscriptions created before operator_id was required
        // Use crypto.randomUUID() instead of uuid package
        operatorId = crypto.randomUUID();
        // Update subscription with new operator_id
        await supabase
          .from('tour_operator_subscriptions')
          .update({ operator_id: operatorId })
          .eq('id', subscriptionId);
        console.log(`✅ Generated new operator_id ${operatorId} for subscription`);
      }
    }
    
    // Create pending records in promoted_tours table BEFORE redirecting to Stripe
    // This allows tracking of pending promotions and manual activation if needed
    console.log(`📝 Creating pending promotion records in database...`);
    console.log(`   Subscription ID: ${subscriptionId}`);
    console.log(`   Operator ID: ${operatorId}`);
    console.log(`   Tours to promote: ${promotedTourIds.join(', ')}`);
    
    const pendingPromotions = [];
    const skippedTours = [];
    
    for (const productId of promotedTourIds) {
      console.log(`\n🔍 Processing tour ${productId}...`);
      
      // Get destination_id from operator_tours for this product
      let destinationId = null;
      const { data: operatorTour } = await supabase
        .from('operator_tours')
        .select('destination_id')
        .eq('product_id', productId)
        .eq('operator_subscription_id', subscriptionId)
        .maybeSingle();
      
      if (operatorTour?.destination_id) {
        destinationId = operatorTour.destination_id;
        console.log(`   Found destination_id: ${destinationId}`);
      } else {
        console.warn(`   ⚠️ No destination_id found for ${productId} in operator_tours`);
      }
      
      // Check if an active promotion already exists for this tour
      const { data: existingActive } = await supabase
        .from('promoted_tours')
        .select('id, status')
        .eq('product_id', productId)
        .eq('operator_subscription_id', subscriptionId)
        .eq('status', 'active')
        .maybeSingle();
      
      if (existingActive) {
        console.log(`⚠️ Tour ${productId} already has an active promotion, skipping...`);
        skippedTours.push({ productId, reason: 'already_active' });
        continue;
      }
      
      // Check if a pending promotion exists (we'll update it)
      const { data: existingPending } = await supabase
        .from('promoted_tours')
        .select('id, status')
        .eq('product_id', productId)
        .eq('operator_subscription_id', subscriptionId)
        .eq('status', 'pending')
        .maybeSingle();
      
      if (existingPending) {
        // Update existing pending record (allows retry of failed checkout)
        const { error: updateError } = await supabase
          .from('promoted_tours')
          .update({
            promotion_plan: promotedBillingCycle,
            requested_at: new Date().toISOString(),
            stripe_subscription_id: null, // Reset in case of retry
            start_date: null,
            end_date: null,
            cancelled_at: null, // Clear cancellation if retrying
            destination_id: destinationId, // Update destination_id if available
          })
          .eq('id', existingPending.id);
        
        if (updateError) {
          console.error(`❌ Error updating pending promotion for ${productId}:`, updateError);
          skippedTours.push({ productId, reason: 'update_failed', error: updateError.message });
        } else {
          console.log(`✅ Updated pending promotion record for ${productId} (retry)`);
          pendingPromotions.push({ productId, recordId: existingPending.id, action: 'updated' });
        }
      } else {
        // Check for cancelled/expired promotions - allow re-promoting those
        const { data: existingCancelledOrExpired } = await supabase
          .from('promoted_tours')
          .select('id, status')
          .eq('product_id', productId)
          .eq('operator_subscription_id', subscriptionId)
          .in('status', ['cancelled', 'expired'])
          .maybeSingle();
        
        if (existingCancelledOrExpired) {
          // Update cancelled/expired record to pending (re-promote)
          const { error: updateError } = await supabase
            .from('promoted_tours')
            .update({
              promotion_plan: promotedBillingCycle,
              status: 'pending',
              requested_at: new Date().toISOString(),
              stripe_subscription_id: null,
              start_date: null,
              end_date: null,
              cancelled_at: null,
              destination_id: destinationId, // Update destination_id if available
            })
            .eq('id', existingCancelledOrExpired.id);
          
          if (updateError) {
            console.error(`❌ Error re-promoting cancelled/expired promotion for ${productId}:`, updateError);
            skippedTours.push({ productId, reason: 're_promote_failed', error: updateError.message });
          } else {
            console.log(`✅ Re-promoted tour ${productId} (was ${existingCancelledOrExpired.status})`);
            pendingPromotions.push({ productId, recordId: existingCancelledOrExpired.id, action: 're_promoted' });
          }
        } else {
          // Create new pending record
          const { data: newRecord, error: insertError } = await supabase
            .from('promoted_tours')
            .insert({
              product_id: productId,
              operator_id: operatorId,
              operator_subscription_id: subscriptionId,
              stripe_subscription_id: null, // Will be set by webhook
              promotion_plan: promotedBillingCycle,
              status: 'pending',
              requested_at: new Date().toISOString(),
              start_date: null, // Will be set by webhook when payment confirmed
              end_date: null, // Will be set by webhook when payment confirmed
              destination_id: destinationId, // Store destination_id for direct querying
            })
            .select('id')
            .single();
          
          if (insertError) {
            console.error(`❌ Error creating pending promotion for ${productId}:`, insertError);
            console.error(`   Error details:`, JSON.stringify(insertError, null, 2));
            skippedTours.push({ productId, reason: 'insert_failed', error: insertError.message, details: insertError });
            // Continue with other tours even if one fails
          } else if (!newRecord) {
            console.error(`❌ No record returned after insert for ${productId}`);
            skippedTours.push({ productId, reason: 'insert_failed', error: 'No record returned' });
          } else {
            console.log(`✅ Created pending promotion record for ${productId} (ID: ${newRecord.id})`);
            pendingPromotions.push({ productId, recordId: newRecord.id, action: 'created' });
          }
        }
      }
    }
    
    console.log(`📊 Promotion processing summary: ${pendingPromotions.length} processed, ${skippedTours.length} skipped`);
    
    if (pendingPromotions.length === 0) {
      const activeCount = skippedTours.filter(s => s.reason === 'already_active').length;
      const failedCount = skippedTours.filter(s => s.reason !== 'already_active').length;
      
      let errorMessage = 'No tours could be processed for promotion.';
      if (activeCount > 0) {
        errorMessage += ` ${activeCount} tour(s) already have active promotions.`;
      }
      if (failedCount > 0) {
        errorMessage += ` ${failedCount} tour(s) failed to process.`;
        // Include first error details for debugging
        const firstError = skippedTours.find(s => s.reason !== 'already_active');
        if (firstError && firstError.error) {
          errorMessage += ` Error: ${firstError.error}`;
        }
      }
      if (skippedTours.length === 0) {
        errorMessage = 'No tours could be processed for promotion. Please check the server logs for details.';
      }
      
      return NextResponse.json({
        error: errorMessage,
        skippedTours: skippedTours.map(s => ({ 
          productId: s.productId, 
          reason: s.reason,
          error: s.error || 'Unknown error'
        })),
        debug: process.env.NODE_ENV === 'development' ? {
          subscriptionId,
          operatorId: subscription.operator_id,
          promotedTourIds,
        } : undefined,
      }, { status: 400 });
    }
    
    // ALWAYS create a checkout session for promotion upgrades
    // Payment must be processed before we activate the database records
    // The webhook will handle updating records from "pending" to "active" after payment is confirmed
    
    console.log(`🛒 Creating checkout session for promotion upgrade...`);
    console.log(`   Customer: ${customerId || 'Will be created by Stripe'}`);
    console.log(`   Tours to promote: ${promotedTourIds.join(', ')}`);
    console.log(`   Billing cycle: ${promotedBillingCycle}`);
    console.log(`   Price ID: ${promotedPriceId}`);
    console.log(`   Pending records created: ${pendingPromotions.length}`);
    
    try {
      // Build checkout session params
      const checkoutParams = {
        mode: 'subscription',
        payment_method_types: ['card'],
        line_items: promotedTourIds.map(() => ({
          price: promotedPriceId,
          quantity: 1,
        })),
        metadata: {
          type: 'tour_operator_promotion_upgrade',
          subscriptionId: subscriptionId,
          userId: userId,
          promotedTourIds: promotedTourIds.join(','),
          promotedBillingCycle: promotedBillingCycle,
        },
        success_url: `${process.env.NEXT_PUBLIC_SITE_URL || 'https://toptours.ai'}/profile?tab=my-tours&promotion_success=true`,
        cancel_url: `${process.env.NEXT_PUBLIC_SITE_URL || 'https://toptours.ai'}/profile?tab=my-tours&promotion_canceled=true`,
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
        message: 'Please complete checkout to add promotion to your tours.',
      });
      
    } catch (error) {
      console.error('❌ [UPGRADE] Error creating checkout session:', error);
      return NextResponse.json({
        error: `Failed to create checkout session: ${error.message || 'Unknown error'}. Please try again or contact support.`,
      }, { status: 500 });
    }
    
  } catch (error) {
    const errorMsg = error?.message || 'Internal server error';
    console.error('[Tour Operator Upgrade] Error:', errorMsg);
    
    return NextResponse.json(
      { 
        error: errorMsg,
        ...(process.env.NODE_ENV === 'development' && error?.stack ? { stack: error.stack } : {})
      },
      { status: 500 }
    );
  }
}

