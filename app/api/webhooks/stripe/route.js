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
        await handleCheckoutSessionCompleted(session);
        break;
      }

      case 'customer.subscription.created':
      case 'customer.subscription.updated': {
        const subscription = event.data.object;
        await handleSubscriptionUpdate(subscription);
        break;
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object;
        await handleSubscriptionDeleted(subscription);
        break;
      }

      case 'payment_intent.succeeded': {
        const paymentIntent = event.data.object;
        await handlePaymentIntentSucceeded(paymentIntent);
        break;
      }

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('Error processing webhook:', error);
    return NextResponse.json(
      { error: 'Webhook processing failed' },
      { status: 500 }
    );
  }
}

/**
 * Handle checkout session completed
 * This fires for both subscriptions and one-time payments
 */
async function handleCheckoutSessionCompleted(session) {
  const supabase = createSupabaseServiceRoleClient();
  const metadata = session.metadata || {};
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

/**
 * Handle subscription created or updated
 */
async function handleSubscriptionUpdate(subscription) {
  const supabase = createSupabaseServiceRoleClient();
  const metadata = subscription.metadata || {};
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

