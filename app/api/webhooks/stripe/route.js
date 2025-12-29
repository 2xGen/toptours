/**
 * Stripe Webhook Handler
 * Handles payment events from Stripe
 * 
 * Events handled:
 * - checkout.session.completed: Payment successful
 * - customer.subscription.created: New subscription
 * - customer.subscription.updated: Subscription changed (upgrade/downgrade)
 * - customer.subscription.deleted: Subscription cancelled
 * - payment_intent.succeeded: One-time payment succeeded
 */

import { NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';
import { createSupabaseServiceRoleClient } from '@/lib/supabaseClient';
import { purchaseALaCartePoints, purchaseALaCartePointsForRestaurant } from '@/lib/promotionSystem';
import { PLAN_TO_TIER, STRIPE_PRICE_IDS } from '@/lib/stripe';
import { TIER_POINTS } from '@/lib/promotionSystem';
import { 
  sendSubscriptionConfirmationEmail, 
  sendInstantBoostConfirmationEmail,
  sendSubscriptionCancellationEmail 
} from '@/lib/email';

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

export async function POST(request) {
  const body = await request.text();
  const signature = request.headers.get('stripe-signature');

  if (!signature || !webhookSecret) {
    console.error('Missing Stripe signature or webhook secret');
    return NextResponse.json(
      { error: 'Missing signature' },
      { status: 400 }
    );
  }

  let event;

  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
  } catch (err) {
    console.error('Webhook signature verification failed:', err.message);
    return NextResponse.json(
      { error: `Webhook Error: ${err.message}` },
      { status: 400 }
    );
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object;
        // Wrap in try-catch to prevent errors from bubbling up
        try {
          await handleCheckoutSessionCompleted(session);
        } catch (error) {
          // Log error but don't fail the webhook - Stripe will retry if we return error
          // Instead, log and return success so Stripe doesn't keep retrying
          console.error('❌ [WEBHOOK] Error in handleCheckoutSessionCompleted (logged but not failing webhook):', error);
        }
        break;
      }

      case 'customer.subscription.created':
      case 'customer.subscription.updated': {
        const subscription = event.data.object;
        try {
          await handleSubscriptionUpdate(subscription);
        } catch (error) {
          console.error('❌ [WEBHOOK] Error in handleSubscriptionUpdate (logged but not failing webhook):', error);
        }
        break;
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object;
        try {
          await handleSubscriptionDeleted(subscription);
        } catch (error) {
          console.error('❌ [WEBHOOK] Error in handleSubscriptionDeleted (logged but not failing webhook):', error);
        }
        break;
      }

      case 'payment_intent.succeeded': {
        const paymentIntent = event.data.object;
        try {
          await handlePaymentIntentSucceeded(paymentIntent);
        } catch (error) {
          console.error('❌ [WEBHOOK] Error in handlePaymentIntentSucceeded (logged but not failing webhook):', error);
        }
        break;
      }

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    // ALWAYS return success to Stripe, even if processing had errors
    // This prevents Stripe from retrying and ensures users don't see any issues
    // Errors are logged server-side for debugging
    return NextResponse.json({ received: true });
  } catch (error) {
    // Even if there's a catastrophic error, return success to Stripe
    // We don't want Stripe to keep retrying and we don't want users affected
    console.error('❌ [WEBHOOK] Critical error processing webhook (logged but returning success):', error);
    return NextResponse.json({ received: true });
  }
}

/**
 * Handle checkout session completed
 * This fires for both subscriptions and one-time payments
 */
async function handleCheckoutSessionCompleted(session) {
  const supabase = createSupabaseServiceRoleClient();
  const metadata = session.metadata || {};
  
  // Check if this is a restaurant premium subscription
  if (metadata.type === 'restaurant_premium') {
    await handleRestaurantPremiumCheckout(session, supabase);
    return;
  }
  
  // Check if this is a tour operator premium subscription
  if (metadata.type === 'tour_operator_premium') {
    await handleTourOperatorPremiumCheckout(session, supabase);
    return;
  }
  
  const userId = metadata.userId;

  if (!userId) {
    console.error('No userId in checkout session metadata');
    return;
  }

  // Check if this is a subscription or one-time payment
  if (session.mode === 'subscription') {
    // Subscription - update immediately from checkout session
    const subscriptionId = session.subscription;
    const plan = metadata.plan;
    const tier = metadata.tier || PLAN_TO_TIER[plan];
    
    if (subscriptionId && plan && tier) {
      // Fetch subscription details to get price ID
      let priceId = null;
      try {
        const subscription = await stripe.subscriptions.retrieve(subscriptionId);
        priceId = subscription.items.data[0]?.price?.id || null;
      } catch (err) {
        console.error('Error fetching subscription details:', err);
      }
      
      const dailyPoints = TIER_POINTS[tier] || TIER_POINTS.explorer;
      
      // Get current account to check if tier changed
      const { data: currentAccount } = await supabase
        .from('promotion_accounts')
        .select('tier, daily_points_available, last_daily_reset')
        .eq('user_id', userId)
        .single();
      
      // Determine points to set
      let pointsToSet = dailyPoints;
      const tierChanged = currentAccount?.tier !== tier;
      
      if (tierChanged) {
        // Tier changed (upgrade/downgrade) - always give full new tier points
        pointsToSet = dailyPoints;
        console.log(`Tier changed from ${currentAccount?.tier} to ${tier}, setting points to ${dailyPoints}`);
      } else if (currentAccount?.last_daily_reset) {
        // Same tier, check if reset was today
        const lastReset = new Date(currentAccount.last_daily_reset);
        const now = new Date();
        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        const lastResetDate = new Date(lastReset.getFullYear(), lastReset.getMonth(), lastReset.getDate());
        
        // If reset was today, preserve current points (user might have spent some)
        if (lastResetDate.getTime() === today.getTime()) {
          // Keep current points, but ensure they don't exceed the tier limit
          pointsToSet = Math.min(currentAccount.daily_points_available || 0, dailyPoints);
        }
        // Otherwise, reset to tier's daily points
      }
      
      // Calculate subscription dates (monthly subscription = 30 days)
      const startDate = new Date();
      const endDate = new Date();
      endDate.setDate(endDate.getDate() + 30); // 30 days from now
      
      // Update promotion account with subscription details
      const { error: accountError } = await supabase
        .from('promotion_accounts')
        .update({
          tier: tier,
          subscription_status: 'active',
          stripe_subscription_id: subscriptionId,
          stripe_customer_id: session.customer,
          stripe_price_id: priceId,
          daily_points_available: pointsToSet, // Keep for backward compatibility
          subscription_plan: plan,
          subscription_start_date: startDate.toISOString().split('T')[0], // Store as date only
          subscription_end_date: endDate.toISOString().split('T')[0], // Store as date only
        })
        .eq('user_id', userId);
      
      if (accountError) {
        console.error('Error updating promotion_accounts:', accountError);
      }
      
      // Also update profiles table (primary source of truth for daily points)
      const { error: profileError } = await supabase
        .from('profiles')
        .update({
          plan_tier: plan, // Use plan name (pro, pro_plus, enterprise) not tier name
          daily_promo_quota: plan === 'pro' ? 5 : plan === 'pro_plus' ? 5 : plan === 'enterprise' ? 20 : 1,
          daily_points_available: pointsToSet, // Primary source of truth
        })
        .eq('id', userId);
      
      if (profileError) {
        console.error('Error updating profiles:', profileError);
      }
      
      if (!accountError && !profileError) {
        console.log(`Subscription activated for user ${userId}: ${plan} (${tier})`);
        
        // Send confirmation email
        try {
          const { data: { user }, error: userError } = await supabase.auth.admin.getUserById(userId);
          
          if (user?.email) {
            const emailResult = await sendSubscriptionConfirmationEmail({
              to: user.email,
              planName: plan.charAt(0).toUpperCase() + plan.slice(1),
              startDate: startDate.toISOString(),
              endDate: endDate.toISOString(),
            });
            if (emailResult.success) {
              console.log(`✅ Subscription confirmation email sent to ${user.email}`);
            } else {
              console.error(`❌ Failed to send subscription confirmation email to ${user.email}:`, emailResult.error);
            }
          } else {
            console.warn(`⚠️ No email found for user ${userId}, skipping subscription confirmation email`);
          }
        } catch (emailError) {
          console.error('❌ Exception sending subscription confirmation email:', emailError);
          // Don't fail the webhook if email fails
        }
      }
    } else {
      // Fallback: just save customer and subscription IDs
      await supabase
        .from('promotion_accounts')
        .update({
          stripe_subscription_id: subscriptionId,
          stripe_customer_id: session.customer,
        })
        .eq('user_id', userId);
    }
  } else if (session.mode === 'payment') {
    // One-time payment - handle instant boost purchase
    // IMPORTANT: This only fires when payment is SUCCESSFUL
    // If user cancels, this webhook never fires, so no points are added ✅
    const type = metadata.type || 'tour'; // Default to 'tour' for backward compatibility
    const productId = metadata.productId;
    const restaurantId = metadata.restaurantId;
    const packageName = metadata.packageName;
    const paymentIntentId = session.payment_intent;

    if ((!productId && !restaurantId) || !packageName || !paymentIntentId) {
      console.error('Missing required fields for instant boost purchase:', { productId, restaurantId, packageName, paymentIntentId, type });
      return;
    }

    // Verify payment was actually successful
    if (session.payment_status !== 'paid') {
      console.warn(`Payment status is not 'paid' for session ${session.id}: ${session.payment_status}`);
      return;
    }

    if (type === 'restaurant' && restaurantId) {
      // Handle restaurant purchase
      console.log(`💰 Processing instant boost purchase: ${packageName} for restaurant ${restaurantId}`);
      const result = await purchaseALaCartePointsForRestaurant(
        userId,
        parseInt(restaurantId),
        packageName,
        paymentIntentId,
        null // restaurantData can be fetched from database if needed
      );
      console.log(`✅ Instant boost points added successfully for restaurant ${restaurantId}`);
      
      // Send confirmation email
      if (result.success) {
        try {
          const { data: { user } } = await supabase.auth.admin.getUserById(userId);
          
          // Get restaurant name from restaurant_promotions table
          const { data: restaurantPromo } = await supabase
            .from('restaurant_promotions')
            .select('restaurant_name, restaurant_slug, destination_id')
            .eq('restaurant_id', parseInt(restaurantId))
            .single();
          
          if (user?.email) {
            const packageInfo = {
              '1000_points': { points: 1000 },
              '3000_points': { points: 3000 },
              '5000_points': { points: 5000 },
            }[packageName] || { points: 0 };
            
            const restaurantUrl = restaurantPromo?.restaurant_slug && restaurantPromo?.destination_id
              ? `https://toptours.ai/destinations/${restaurantPromo.destination_id}/restaurants/${restaurantPromo.restaurant_slug}`
              : null;
            
            const emailResult = await sendInstantBoostConfirmationEmail({
              to: user.email,
              tourName: restaurantPromo?.restaurant_name || 'Your selected restaurant',
              points: packageInfo.points,
              tourUrl: restaurantUrl,
              type: 'restaurant',
            });
            if (emailResult.success) {
              console.log(`✅ Instant boost confirmation email sent to ${user.email}`);
            }
          }
        } catch (emailError) {
          console.error('❌ Exception sending instant boost confirmation email:', emailError);
        }
      }
    } else if (type === 'tour' && productId) {
      // Handle tour purchase (existing logic)
      // Build minimal tourData with only destinationId if available
      // The purchaseALaCartePoints function will fetch full tour metadata from cache/API if needed
      let tourData = null;
      if (metadata.destinationId) {
        tourData = {
          _destinationId: metadata.destinationId,
        };
      }

      console.log(`💰 Processing instant boost purchase: ${packageName} for tour ${productId}`);
      const result = await purchaseALaCartePoints(
        userId,
        productId,
        packageName,
        paymentIntentId,
        tourData
      );
      console.log(`✅ Instant boost points added successfully for tour ${productId}`);
      
      // Send confirmation email
      if (result.success) {
        try {
          const { data: { user }, error: userError } = await supabase.auth.admin.getUserById(userId);
          
          // Get tour name from tour_promotions table
          const { data: tourPromo } = await supabase
            .from('tour_promotions')
            .select('tour_name, tour_slug')
            .eq('product_id', productId)
            .single();
          
          if (user?.email) {
            const packageInfo = {
              '1000_points': { points: 1000 },
              '3000_points': { points: 3000 },
              '5000_points': { points: 5000 },
            }[packageName] || { points: 0 };
            
            const tourUrl = tourPromo?.tour_slug 
              ? `https://toptours.ai/tours/${productId}`
              : null;
            
            const emailResult = await sendInstantBoostConfirmationEmail({
              to: user.email,
              tourName: tourPromo?.tour_name || 'Your selected tour',
              points: packageInfo.points,
              tourUrl: tourUrl,
            });
            if (emailResult.success) {
              console.log(`✅ Instant boost confirmation email sent to ${user.email}`);
            } else {
              console.error(`❌ Failed to send instant boost confirmation email to ${user.email}:`, emailResult.error);
            }
          } else {
            console.warn(`⚠️ No email found for user ${userId}, skipping instant boost confirmation email`);
          }
        } catch (emailError) {
          console.error('❌ Exception sending instant boost confirmation email:', emailError);
          // Don't fail the webhook if email fails
        }
      }
    }
  }
}

/**
 * Handle subscription created or updated
 */
async function handleSubscriptionUpdate(subscription) {
  const supabase = createSupabaseServiceRoleClient();
  const metadata = subscription.metadata || {};
  
  // Check if this is a restaurant premium subscription
  if (metadata.type === 'restaurant_premium') {
    await handleRestaurantPremiumSubscriptionUpdate(subscription, supabase);
    return;
  }
  
  const userId = metadata.userId;
  const plan = metadata.plan;
  const tier = metadata.tier || PLAN_TO_TIER[plan];

  if (!userId || !plan) {
    console.error('Missing userId or plan in subscription metadata');
    return;
  }

  // Determine tier and points from plan
  const dailyPoints = TIER_POINTS[tier] || TIER_POINTS.explorer;

  // Get current account to check if tier changed
  const { data: currentAccount } = await supabase
    .from('promotion_accounts')
    .select('tier, daily_points_available, last_daily_reset')
    .eq('user_id', userId)
    .single();
  
  // Determine points to set
  let pointsToSet = dailyPoints;
  const tierChanged = currentAccount?.tier !== tier;
  
  if (tierChanged) {
    // Tier changed (upgrade/downgrade) - always give full new tier points
    pointsToSet = dailyPoints;
    console.log(`Tier changed from ${currentAccount?.tier} to ${tier}, setting points to ${dailyPoints}`);
  } else if (currentAccount?.last_daily_reset) {
    // Same tier, check if reset was today
    const lastReset = new Date(currentAccount.last_daily_reset);
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const lastResetDate = new Date(lastReset.getFullYear(), lastReset.getMonth(), lastReset.getDate());
    
    // If reset was today, preserve current points (user might have spent some)
    if (lastResetDate.getTime() === today.getTime()) {
      // Keep current points, but ensure they don't exceed the tier limit
      pointsToSet = Math.min(currentAccount.daily_points_available || 0, dailyPoints);
    }
    // Otherwise, reset to tier's daily points
  }

  // Calculate subscription dates
  // IMPORTANT: Always use Stripe's current_period_end as the source of truth
  // Don't calculate or extend dates ourselves - Stripe knows the actual period end
  let startDate = new Date();
  let endDate = new Date();
  
  if (subscription.status === 'active') {
    // Check if subscription already exists to preserve start_date
    const { data: existingAccount } = await supabase
      .from('promotion_accounts')
      .select('subscription_start_date, subscription_end_date')
      .eq('user_id', userId)
      .single();
    
    if (existingAccount?.subscription_start_date) {
      startDate = new Date(existingAccount.subscription_start_date);
    }
    
    // ALWAYS use Stripe's current_period_end as the source of truth
    // This prevents date extension bugs - Stripe knows the actual period end
    if (subscription.current_period_end) {
      // Stripe provides current_period_end in Unix timestamp (seconds)
      // Convert to JavaScript Date (milliseconds)
      endDate = new Date(subscription.current_period_end * 1000);
      console.log(`Using Stripe current_period_end: ${endDate.toISOString()} (cancel_at_period_end: ${subscription.cancel_at_period_end})`);
    } else {
      // Fallback: if Stripe doesn't provide it, use 30 days from now
      // This should rarely happen
      endDate.setDate(endDate.getDate() + 30);
      console.warn('Stripe subscription missing current_period_end, using fallback calculation');
    }
  }
  
  // Determine subscription status
  // If subscription is active but set to cancel at period end, preserve 'pending_cancellation' status
  // Otherwise, use 'active' or 'inactive' based on subscription.status
  let subscriptionStatus = subscription.status === 'active' ? 'active' : 'inactive';
  if (subscription.status === 'active' && subscription.cancel_at_period_end) {
    // Subscription is active but will cancel at period end - show as pending cancellation
    subscriptionStatus = 'pending_cancellation';
  }
  
  // Update promotion account
  const { error: accountError } = await supabase
    .from('promotion_accounts')
    .update({
      tier: tier,
      subscription_status: subscriptionStatus,
      stripe_subscription_id: subscription.id,
      stripe_customer_id: subscription.customer,
      stripe_price_id: subscription.items.data[0]?.price?.id,
      daily_points_available: pointsToSet, // Keep for backward compatibility
      subscription_plan: plan,
      subscription_start_date: subscription.status === 'active' ? startDate.toISOString().split('T')[0] : null,
      subscription_end_date: subscription.status === 'active' ? endDate.toISOString().split('T')[0] : null,
    })
    .eq('user_id', userId);

  // Also update profiles table (primary source of truth for daily points)
  await supabase
    .from('profiles')
    .update({
      daily_points_available: pointsToSet,
    })
    .eq('id', userId);

  if (accountError) {
    console.error('Error updating promotion_accounts:', accountError);
  }

  // Also update profiles table for UI display
  const { error: profileError } = await supabase
    .from('profiles')
    .update({
      plan_tier: plan, // Use plan name (pro, pro_plus, enterprise) not tier name
      daily_promo_quota: plan === 'pro' ? 5 : plan === 'pro_plus' ? 5 : plan === 'enterprise' ? 20 : 1,
    })
    .eq('id', userId);

  if (profileError) {
    console.error('Error updating profiles:', profileError);
  }

  if (!accountError && !profileError) {
    console.log(`Subscription updated for user ${userId}: ${plan} (${tier})`);
  }
}

/**
 * Handle subscription deleted (cancelled)
 */
async function handleSubscriptionDeleted(subscription) {
  const supabase = createSupabaseServiceRoleClient();
  const metadata = subscription.metadata || {};
  
  // Check if this is a restaurant premium subscription
  if (metadata.type === 'restaurant_premium') {
    await handleRestaurantPremiumSubscriptionDeleted(subscription, supabase);
    return;
  }
  
  const userId = metadata.userId;

  if (!userId) {
    console.error('No userId in subscription metadata');
    return;
  }

  // Downgrade to free tier
  const { error: accountError } = await supabase
    .from('promotion_accounts')
    .update({
      tier: 'explorer',
      subscription_status: 'cancelled',
      stripe_subscription_id: null,
      stripe_price_id: null,
      daily_points_available: TIER_POINTS.explorer, // Keep for backward compatibility
      subscription_plan: 'free',
      subscription_start_date: null,
      subscription_end_date: null,
    })
    .eq('user_id', userId);

  if (accountError) {
    console.error('Error updating promotion_accounts:', accountError);
  }

  // Also update profiles table (primary source of truth for daily points)
  const { error: profileError } = await supabase
    .from('profiles')
    .update({
      plan_tier: 'free',
      daily_promo_quota: 1,
      daily_points_available: TIER_POINTS.explorer,
    })
    .eq('id', userId);

  if (profileError) {
    console.error('Error updating profiles:', profileError);
  }

  if (!accountError && !profileError) {
    console.log(`Subscription cancelled for user ${userId}`);
    
    // Send cancellation email
    try {
      const { data: account } = await supabase
        .from('promotion_accounts')
        .select('subscription_plan, subscription_end_date')
        .eq('user_id', userId)
        .single();
      
      const { data: { user }, error: userError } = await supabase.auth.admin.getUserById(userId);
      
      if (user?.email && account?.subscription_plan) {
        const endDate = account.subscription_end_date 
          ? new Date(account.subscription_end_date)
          : new Date();
        
        await sendSubscriptionCancellationEmail({
          to: user.email,
          planName: account.subscription_plan.charAt(0).toUpperCase() + account.subscription_plan.slice(1),
          endDate: endDate.toISOString(),
        });
        console.log(`✅ Subscription cancellation email sent to ${user.email}`);
      }
    } catch (emailError) {
      console.error('Error sending subscription cancellation email:', emailError);
      // Don't fail the webhook if email fails
    }
  }
}

/**
 * Handle restaurant premium subscription checkout
 */
async function handleRestaurantPremiumCheckout(session, supabase) {
  const metadata = session.metadata || {};
  const subscriptionId = session.subscription;
  
  const restaurantId = parseInt(metadata.restaurantId);
  const destinationId = metadata.destinationId;
  const restaurantSlug = metadata.restaurantSlug;
  const restaurantName = metadata.restaurantName;
  const planType = metadata.planType || 'monthly';
  const pendingWebsite = metadata.pendingWebsite || null;
  
  if (!restaurantId || !destinationId || !restaurantSlug || !subscriptionId) {
    console.error('Missing required fields for restaurant premium checkout:', metadata);
    return;
  }
  
  // Get subscription details from Stripe
  let currentPeriodEnd = new Date();
  currentPeriodEnd.setDate(currentPeriodEnd.getDate() + (planType === 'yearly' ? 365 : 30));
  
  try {
    const subscription = await stripe.subscriptions.retrieve(subscriptionId);
    if (subscription.current_period_end) {
      currentPeriodEnd = new Date(subscription.current_period_end * 1000);
    }
  } catch (err) {
    console.error('Error fetching subscription details:', err);
  }
  
  // Update the restaurant premium subscription
  const { error } = await supabase
    .from('restaurant_premium_subscriptions')
    .upsert({
      restaurant_id: restaurantId,
      destination_id: destinationId,
      restaurant_slug: restaurantSlug,
      restaurant_name: restaurantName || null,
      stripe_subscription_id: subscriptionId,
      stripe_customer_id: session.customer,
      stripe_price_id: session.line_items?.data?.[0]?.price?.id || null,
      plan_type: planType,
      status: 'active',
      current_period_start: new Date().toISOString(),
      current_period_end: currentPeriodEnd.toISOString(),
      layout_preset: metadata.layoutPreset || 'ocean',
      color_scheme: metadata.colorScheme || 'blue',
      hero_cta_index: parseInt(metadata.heroCTAIndex) || 0,
      mid_cta_index: parseInt(metadata.midCTAIndex) || 0,
      end_cta_index: parseInt(metadata.endCTAIndex) || 0,
      sticky_cta_index: parseInt(metadata.stickyCTAIndex) || 0,
      pending_website: pendingWebsite || null,
      website_review_status: pendingWebsite ? 'pending' : null,
      user_id: metadata.userId || null, // Link to Supabase user for self-service management
      purchaser_email: session.customer_email || null,
    }, {
      onConflict: 'restaurant_id,destination_id',
    });
  
  if (error) {
    console.error('Error updating restaurant premium subscription:', error);
  } else {
    console.log(`✅ Restaurant premium subscription activated for ${restaurantName || restaurantSlug} (${restaurantId})`);
    
    // Send confirmation email
    const customerEmail = session.customer_email;
    if (customerEmail) {
      try {
        const { sendRestaurantPremiumConfirmationEmail } = await import('@/lib/email');
        await sendRestaurantPremiumConfirmationEmail({
          to: customerEmail,
          restaurantName: restaurantName || restaurantSlug,
          planType: planType,
          destinationId: destinationId,
          restaurantSlug: restaurantSlug,
          endDate: currentPeriodEnd.toISOString(),
        });
        console.log(`✅ Restaurant premium confirmation email sent to ${customerEmail}`);
      } catch (emailError) {
        console.error('Error sending restaurant premium confirmation email:', emailError);
        // Don't fail the webhook if email fails
      }
    }
  }
}

/**
 * Handle restaurant premium subscription update
 */
async function handleRestaurantPremiumSubscriptionUpdate(subscription, supabase) {
  const metadata = subscription.metadata || {};
  
  if (metadata.type !== 'restaurant_premium') return false;
  
  const restaurantId = parseInt(metadata.restaurantId);
  const destinationId = metadata.destinationId;
  
  if (!restaurantId || !destinationId) {
    console.error('Missing restaurant info in premium subscription metadata');
    return false;
  }
  
  // Determine status
  let status = subscription.status === 'active' ? 'active' : 'inactive';
  if (subscription.status === 'active' && subscription.cancel_at_period_end) {
    status = 'pending_cancellation';
  }
  
  // Calculate period end
  let currentPeriodEnd = null;
  if (subscription.current_period_end) {
    currentPeriodEnd = new Date(subscription.current_period_end * 1000).toISOString();
  }
  
  const { error } = await supabase
    .from('restaurant_premium_subscriptions')
    .update({
      stripe_subscription_id: subscription.id,
      stripe_price_id: subscription.items.data[0]?.price?.id,
      status: status,
      current_period_end: currentPeriodEnd,
    })
    .eq('restaurant_id', restaurantId)
    .eq('destination_id', destinationId);
  
  if (error) {
    console.error('Error updating restaurant premium subscription:', error);
  } else {
    console.log(`Restaurant premium subscription updated for ${restaurantId}: ${status}`);
  }
  
  return true;
}

/**
 * Handle restaurant premium subscription deleted/cancelled
 */
async function handleRestaurantPremiumSubscriptionDeleted(subscription, supabase) {
  const metadata = subscription.metadata || {};
  
  if (metadata.type !== 'restaurant_premium') return false;
  
  const restaurantId = parseInt(metadata.restaurantId);
  const destinationId = metadata.destinationId;
  const restaurantSlug = metadata.restaurantSlug;
  const restaurantName = metadata.restaurantName;
  
  if (!restaurantId || !destinationId) {
    console.error('Missing restaurant info in premium subscription metadata');
    return false;
  }
  
  // Get the subscription record to find the purchaser email and period end
  const { data: subRecord } = await supabase
    .from('restaurant_premium_subscriptions')
    .select('purchaser_email, current_period_end, restaurant_name, restaurant_slug')
    .eq('restaurant_id', restaurantId)
    .eq('destination_id', destinationId)
    .single();
  
  const { error } = await supabase
    .from('restaurant_premium_subscriptions')
    .update({
      status: 'cancelled',
      stripe_subscription_id: null,
    })
    .eq('restaurant_id', restaurantId)
    .eq('destination_id', destinationId);
  
  if (error) {
    console.error('Error cancelling restaurant premium subscription:', error);
  } else {
    console.log(`✅ Restaurant premium subscription cancelled for ${restaurantId}`);
    
    // Send cancellation email
    const customerEmail = subRecord?.purchaser_email;
    const endDate = subRecord?.current_period_end || new Date().toISOString();
    const name = restaurantName || subRecord?.restaurant_name || 'Your Restaurant';
    const slug = restaurantSlug || subRecord?.restaurant_slug;
    
    if (customerEmail && slug) {
      try {
        const { sendRestaurantPremiumCancellationEmail } = await import('@/lib/email');
        await sendRestaurantPremiumCancellationEmail({
          to: customerEmail,
          restaurantName: name,
          destinationId: destinationId,
          restaurantSlug: slug,
          endDate: endDate,
        });
        console.log(`✅ Restaurant premium cancellation email sent to ${customerEmail}`);
      } catch (emailError) {
        console.error('Error sending restaurant premium cancellation email:', emailError);
        // Don't fail the webhook if email fails
      }
    }
  }
  
  return true;
}

/**
 * Handle tour operator premium subscription checkout
 */
async function handleTourOperatorPremiumCheckout(session, supabase) {
  try {
    const metadata = session.metadata || {};
    const subscriptionId = session.subscription;
    
    const subscriptionDbId = metadata.subscriptionId;
    const userId = metadata.userId;
    const operatorName = metadata.operatorName;
    const operatorEmail = metadata.operatorEmail;
    const tourCount = parseInt(metadata.tourCount || '5');
    const billingCycle = metadata.billingCycle || 'monthly';
    const selectedTourIds = metadata.selectedTourIds ? metadata.selectedTourIds.split(',') : [];
    
    console.log(`🔄 [WEBHOOK] Processing tour operator premium checkout for subscription ${subscriptionDbId}, Stripe subscription ${subscriptionId}`);
    
    if (!subscriptionDbId || !subscriptionId || !userId) {
      console.error('❌ [WEBHOOK] Missing required fields for tour operator premium checkout:', metadata);
      return; // Return early, don't throw - webhook will still return success
    }
  
  // Verify payment was successful
  if (session.payment_status !== 'paid') {
    console.error(`❌ [WEBHOOK] Payment status is not 'paid' for session ${session.id}: ${session.payment_status}`);
    return;
  }
  
  console.log(`✅ [WEBHOOK] Payment confirmed as paid for session ${session.id}`);
  
  // Get subscription details from Stripe
  let currentPeriodStart = new Date();
  let currentPeriodEnd = new Date();
  currentPeriodEnd.setDate(currentPeriodEnd.getDate() + (billingCycle === 'annual' ? 365 : 30));
  
  try {
    const subscription = await stripe.subscriptions.retrieve(subscriptionId);
    if (subscription.current_period_start) {
      currentPeriodStart = new Date(subscription.current_period_start * 1000);
    }
    if (subscription.current_period_end) {
      currentPeriodEnd = new Date(subscription.current_period_end * 1000);
    }
    console.log(`📅 [WEBHOOK] Subscription period: ${currentPeriodStart.toISOString()} to ${currentPeriodEnd.toISOString()}`);
  } catch (err) {
    console.error('❌ [WEBHOOK] Error fetching subscription details:', err);
  }
  
  // Get price ID from subscription
  let priceId = null;
  try {
    const subscription = await stripe.subscriptions.retrieve(subscriptionId);
    priceId = subscription.items.data[0]?.price?.id || null;
    console.log(`💰 [WEBHOOK] Price ID: ${priceId}`);
  } catch (err) {
    console.error('❌ [WEBHOOK] Error fetching subscription price ID:', err);
  }
  
  // Fetch current subscription to check verification status and current status
  const { data: currentSubscription, error: fetchError } = await supabase
    .from('tour_operator_subscriptions')
    .select('verification_status, status')
    .eq('id', subscriptionDbId)
    .single();
  
  if (fetchError) {
    console.error('❌ [WEBHOOK] Error fetching subscription for webhook:', fetchError);
    // If we can't verify, don't activate
    return;
  }
  
  console.log(`📋 [WEBHOOK] Current subscription status: ${currentSubscription?.status}, verification_status: ${currentSubscription?.verification_status}`);
  
  // Only activate if verified (all operator names matched)
  // If not verified, something went wrong - log and don't activate
  const verificationStatus = currentSubscription?.verification_status;
  
  if (verificationStatus !== 'verified') {
    console.error(`⚠️ [WEBHOOK] Tour operator subscription ${subscriptionDbId} is not verified. Status: ${verificationStatus}. This should not happen if validation worked correctly.`);
    // Don't activate - subscription should have been rejected at creation time
    return;
  }
  
  const subscriptionStatus = 'active'; // Only verified subscriptions reach this point
  
  console.log(`🔄 [WEBHOOK] Updating subscription ${subscriptionDbId} from "${currentSubscription?.status}" to "${subscriptionStatus}"`);
  
  // Update the tour operator subscription - EXPLICITLY set status to 'active'
  const { error, data: updatedSubscription } = await supabase
    .from('tour_operator_subscriptions')
    .update({
      status: subscriptionStatus, // CRITICAL: Set to 'active' when payment succeeds
      verification_status: verificationStatus,
      stripe_subscription_id: subscriptionId,
      stripe_customer_id: session.customer,
      stripe_price_id: priceId,
      current_period_start: currentPeriodStart.toISOString(),
      current_period_end: currentPeriodEnd.toISOString(),
    })
    .eq('id', subscriptionDbId)
    .select()
    .single();
  
  if (error) {
    console.error('❌ [WEBHOOK] Error updating tour operator subscription:', error);
    console.error('❌ [WEBHOOK] Update payload:', {
      status: subscriptionStatus,
      verification_status: verificationStatus,
      stripe_subscription_id: subscriptionId,
      stripe_customer_id: session.customer,
      stripe_price_id: priceId,
      current_period_start: currentPeriodStart.toISOString(),
      current_period_end: currentPeriodEnd.toISOString(),
    });
  } else {
    // Verify the update worked
    if (updatedSubscription?.status === 'active') {
      console.log(`✅ [WEBHOOK] Tour operator premium subscription successfully activated for ${operatorName} (${subscriptionDbId})`);
      console.log(`✅ [WEBHOOK] Status confirmed as 'active' in database`);
    } else {
      console.error(`❌ [WEBHOOK] CRITICAL: Status update may have failed. Expected 'active', got '${updatedSubscription?.status}'`);
    }
    
    // Verify status was actually updated (double-check)
    const { data: verificationCheck } = await supabase
      .from('tour_operator_subscriptions')
      .select('status')
      .eq('id', subscriptionDbId)
      .single();
    
    if (verificationCheck?.status !== 'active') {
      console.error(`❌ [WEBHOOK] CRITICAL: Status verification failed! Expected 'active', database shows '${verificationCheck?.status}'. Retrying update...`);
      
      // Retry the update
      const { error: retryError } = await supabase
        .from('tour_operator_subscriptions')
        .update({ status: 'active' })
        .eq('id', subscriptionDbId);
      
      if (retryError) {
        console.error('❌ [WEBHOOK] Retry update also failed:', retryError);
      } else {
        console.log('✅ [WEBHOOK] Retry update succeeded - status now set to active');
      }
    } else {
      console.log(`✅ [WEBHOOK] Status verification passed - subscription ${subscriptionDbId} is confirmed as 'active'`);
    }
    
    // Calculate aggregated stats from all selected tours
    if (selectedTourIds.length > 0) {
      const { data: operatorTours } = await supabase
        .from('operator_tours')
        .select('review_count, rating')
        .eq('operator_subscription_id', subscriptionDbId)
        .in('product_id', selectedTourIds)
        .eq('is_selected', true);
      
      if (operatorTours && operatorTours.length > 0) {
        const totalReviews = operatorTours.reduce((sum, tour) => sum + (tour.review_count || 0), 0);
        const avgRating = operatorTours.reduce((sum, tour) => sum + (tour.rating || 0), 0) / operatorTours.length;
        
        // Cap reviews at 10 tours worth
        const cappedReviews = Math.min(totalReviews, Math.ceil(totalReviews / selectedTourIds.length) * 10);
        
        await supabase
          .from('tour_operator_subscriptions')
          .update({
            total_reviews: cappedReviews,
            average_rating: Math.round(avgRating * 100) / 100,
            total_tours_count: selectedTourIds.length,
          })
          .eq('id', subscriptionDbId);
      }
    }
    
    // Send confirmation email
    const customerEmail = session.customer_email || operatorEmail;
    if (customerEmail) {
      try {
        const { sendTourOperatorPremiumConfirmationEmail } = await import('@/lib/email');
        await sendTourOperatorPremiumConfirmationEmail({
          to: customerEmail,
          operatorName: operatorName,
          tourCount: tourCount,
          billingCycle: billingCycle,
          endDate: currentPeriodEnd.toISOString(),
        });
        console.log(`✅ Tour operator premium confirmation email sent to ${customerEmail}`);
      } catch (emailError) {
        console.error('Error sending tour operator premium confirmation email:', emailError);
        // Don't fail the webhook if email fails
      }
    }
  } catch (error) {
    // Catch any unexpected errors and log them, but don't throw
    // This ensures the webhook always returns success to Stripe
    // Users will never see these errors - they're only in server logs
    console.error('❌ [WEBHOOK] Unexpected error in handleTourOperatorPremiumCheckout (logged but not failing webhook):', error);
    console.error('❌ [WEBHOOK] Error stack:', error.stack);
  }
}

/**
 * Handle tour operator premium subscription update
 */
async function handleTourOperatorPremiumSubscriptionUpdate(subscription, supabase) {
  const metadata = subscription.metadata || {};
  
  if (metadata.type !== 'tour_operator_premium') return false;
  
  const subscriptionDbId = metadata.subscriptionId;
  
  if (!subscriptionDbId) {
    console.error('Missing subscription ID in premium subscription metadata');
    return false;
  }
  
  // Get current period dates
  let currentPeriodStart = new Date();
  let currentPeriodEnd = new Date();
  
  if (subscription.current_period_start) {
    currentPeriodStart = new Date(subscription.current_period_start * 1000);
  }
  if (subscription.current_period_end) {
    currentPeriodEnd = new Date(subscription.current_period_end * 1000);
  }
  
  // Determine status based on Stripe subscription status
  let status = 'active';
  if (subscription.status === 'canceled' || subscription.status === 'unpaid') {
    status = 'cancelled';
  } else if (subscription.status === 'past_due') {
    status = 'expired';
  }
  
  const { error } = await supabase
    .from('tour_operator_subscriptions')
    .update({
      status: status,
      current_period_start: currentPeriodStart.toISOString(),
      current_period_end: currentPeriodEnd.toISOString(),
    })
    .eq('id', subscriptionDbId);
  
  if (error) {
    console.error('Error updating tour operator subscription:', error);
    return false;
  }
  
  console.log(`Tour operator premium subscription updated for ${subscriptionDbId}: ${status}`);
  return true;
}

/**
 * Handle tour operator premium subscription deleted/cancelled
 */
async function handleTourOperatorPremiumSubscriptionDeleted(subscription, supabase) {
  const metadata = subscription.metadata || {};
  
  if (metadata.type !== 'tour_operator_premium') return false;
  
  const subscriptionDbId = metadata.subscriptionId;
  const operatorName = metadata.operatorName;
  const operatorEmail = metadata.operatorEmail;
  
  if (!subscriptionDbId) {
    console.error('Missing subscription ID in premium subscription metadata');
    return false;
  }
  
  // Get subscription record to find email
  const { data: subRecord } = await supabase
    .from('tour_operator_subscriptions')
    .select('operator_email, operator_name')
    .eq('id', subscriptionDbId)
    .single();
  
  const finalOperatorName = operatorName || subRecord?.operator_name || 'Tour Operator';
  const finalOperatorEmail = operatorEmail || subRecord?.operator_email;
  
  // Update subscription status to cancelled
  const { error } = await supabase
    .from('tour_operator_subscriptions')
    .update({
      status: 'cancelled',
    })
    .eq('id', subscriptionDbId);
  
  // Deactivate all operator tours
  await supabase
    .from('operator_tours')
    .update({
      is_active: false,
    })
    .eq('operator_subscription_id', subscriptionDbId);
  
  if (error) {
    console.error('Error cancelling tour operator subscription:', error);
  } else {
    console.log(`✅ Tour operator premium subscription cancelled for ${subscriptionDbId}`);
    
    // Send cancellation email
    if (finalOperatorEmail) {
      try {
        // Get subscription end date from database
        const { data: subscriptionData } = await supabase
          .from('tour_operator_subscriptions')
          .select('period_end')
          .eq('id', subscriptionDbId)
          .single();
        
        const endDate = subscriptionData?.period_end 
          ? new Date(subscriptionData.period_end).toISOString()
          : subscription.current_period_end
            ? new Date(subscription.current_period_end * 1000).toISOString()
            : null;
        
        const { sendTourOperatorPremiumCancellationEmail } = await import('@/lib/email');
        await sendTourOperatorPremiumCancellationEmail({
          to: finalOperatorEmail,
          operatorName: finalOperatorName,
          endDate: endDate,
        });
        console.log(`✅ Tour operator premium cancellation email sent to ${finalOperatorEmail}`);
      } catch (emailError) {
        console.error('Error sending tour operator premium cancellation email:', emailError);
        // Don't fail the webhook if email fails
      }
    }
  }
  
  return true;
}

/**
 * Handle payment intent succeeded (backup for one-time payments)
 */
async function handlePaymentIntentSucceeded(paymentIntent) {
  // This is a backup handler - checkout.session.completed should handle most cases
  // But we'll process it here if needed
  const metadata = paymentIntent.metadata || {};
  const userId = metadata.userId;
  const type = metadata.type || 'tour';
  const productId = metadata.productId;
  const restaurantId = metadata.restaurantId;
  const packageName = metadata.packageName;

  if (userId && packageName) {
    if (type === 'restaurant' && restaurantId) {
      await purchaseALaCartePointsForRestaurant(
        userId,
        parseInt(restaurantId),
        packageName,
        paymentIntent.id,
        null
      );
    } else if (type === 'tour' && productId) {
      // Build minimal tourData with only destinationId if available
      let tourData = null;
      if (metadata.destinationId) {
        tourData = {
          _destinationId: metadata.destinationId,
        };
      }

      await purchaseALaCartePoints(
        userId,
        productId,
        packageName,
        paymentIntent.id,
        tourData
      );
    }
  }
}

