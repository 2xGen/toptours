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

  // CRITICAL: Check idempotency - prevent duplicate processing
  const { processed, record } = await checkWebhookProcessed(event.id);
  if (processed) {
    console.log(`⚠️ [WEBHOOK] Event ${event.id} already processed, skipping`);
    return NextResponse.json({ received: true, skipped: true, reason: 'already_processed' });
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object;
        // Wrap in try-catch to prevent errors from bubbling up
        try {
          await handleCheckoutSessionCompleted(session);
          // Mark as processed on success
          await markWebhookProcessed(event.id, event.type, {
            subscription_id: session.subscription,
            restaurant_id: session.metadata?.restaurantId,
            user_id: session.metadata?.userId,
          }, 'processed');
        } catch (error) {
          // Mark as failed
          await markWebhookProcessed(event.id, event.type, {
            subscription_id: session.subscription,
            restaurant_id: session.metadata?.restaurantId,
            user_id: session.metadata?.userId,
          }, 'failed', error.message);
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
          await markWebhookProcessed(event.id, event.type, {
            subscription_id: subscription.id,
            user_id: subscription.metadata?.userId,
          }, 'processed');
        } catch (error) {
          await markWebhookProcessed(event.id, event.type, {
            subscription_id: subscription.id,
            user_id: subscription.metadata?.userId,
          }, 'failed', error.message);
          console.error('❌ [WEBHOOK] Error in handleSubscriptionUpdate (logged but not failing webhook):', error);
        }
        break;
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object;
        try {
          await handleSubscriptionDeleted(subscription);
          await markWebhookProcessed(event.id, event.type, {
            subscription_id: subscription.id,
            user_id: subscription.metadata?.userId,
          }, 'processed');
        } catch (error) {
          await markWebhookProcessed(event.id, event.type, {
            subscription_id: subscription.id,
            user_id: subscription.metadata?.userId,
          }, 'failed', error.message);
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

      case 'invoice.payment_failed': {
        const invoice = event.data.object;
        try {
          await handleInvoicePaymentFailed(invoice);
          await markWebhookProcessed(event.id, event.type, {
            subscription_id: invoice.subscription,
            invoice_id: invoice.id,
          }, 'processed');
        } catch (error) {
          await markWebhookProcessed(event.id, event.type, {
            subscription_id: invoice.subscription,
            invoice_id: invoice.id,
          }, 'failed', error.message);
          console.error('❌ [WEBHOOK] Error in handleInvoicePaymentFailed (logged but not failing webhook):', error);
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
  
  // Check if this is a restaurant subscription (premium and/or promoted)
  if (metadata.type === 'restaurant_subscription' || metadata.type === 'restaurant_premium') {
    await handleRestaurantSubscriptionCheckout(session, supabase);
    return;
  }
  
  // Check if this is a tour operator premium subscription
  if (metadata.type === 'tour_operator_premium') {
    await handleTourOperatorPremiumCheckout(session, supabase);
    return;
  }
  
  // Check if this is a tour operator promotion upgrade
  if (metadata.type === 'tour_operator_promotion_upgrade') {
    await handleTourOperatorPromotionUpgrade(session, supabase);
    return;
  }
  
  // Check if this is a restaurant promotion upgrade
  if (metadata.type === 'restaurant_promotion_upgrade') {
    await handleRestaurantPromotionUpgrade(session, supabase);
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
      // NOTE: promotion_accounts table removed - skip this check
      let currentAccount = null;
      try {
        const { data } = await supabase
          .from('promotion_accounts')
          .select('tier, daily_points_available, last_daily_reset')
          .eq('user_id', userId)
          .maybeSingle();
        currentAccount = data;
      } catch (error) {
        // Table doesn't exist - ignore
        console.warn('promotion_accounts table not found, skipping tier check');
      }
      
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
      // NOTE: promotion_accounts table removed - skip this update
      try {
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
          console.warn('promotion_accounts table not found or update failed (table removed):', accountError);
        }
      } catch (error) {
        console.warn('promotion_accounts table not found (table removed), skipping update');
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
      // NOTE: promotion_accounts table removed - skip this update
      try {
        await supabase
          .from('promotion_accounts')
          .update({
            stripe_subscription_id: subscriptionId,
            stripe_customer_id: session.customer,
          })
          .eq('user_id', userId);
      } catch (error) {
        console.warn('promotion_accounts table not found (table removed), skipping fallback update');
      }
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
          
          // Get restaurant name from restaurants table (old restaurant_promotions table removed)
          let restaurantPromo = null;
          try {
            const { data: restaurant } = await supabase
              .from('restaurants')
              .select('name, slug, destination_id')
              .eq('id', parseInt(restaurantId))
              .single();
            
            if (restaurant) {
              restaurantPromo = {
                restaurant_name: restaurant.name,
                restaurant_slug: restaurant.slug,
                destination_id: restaurant.destination_id,
              };
            }
          } catch (error) {
            console.warn('Could not fetch restaurant name:', error);
          }
          
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
          
          // Get tour name from tour cache/API (old tour_promotions table removed)
          let tourPromo = null;
          try {
            // Try to get tour name from cache or API
            const { getCachedTour } = await import('@/lib/viatorCache');
            const tour = await getCachedTour(productId);
            if (tour) {
              tourPromo = {
                tour_name: tour.title || tour.productTitle,
                tour_slug: productId, // Use productId as slug
              };
            }
          } catch (error) {
            console.warn('Could not fetch tour name:', error);
          }
          
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
  
  // Check if this is a restaurant subscription (premium and/or promoted)
  if (metadata.type === 'restaurant_subscription' || metadata.type === 'restaurant_premium') {
    await handleRestaurantPremiumSubscriptionUpdate(subscription, supabase);
    return;
  }
  
  // Check if this is a tour operator premium subscription
  if (metadata.type === 'tour_operator_premium') {
    await handleTourOperatorPremiumSubscriptionUpdate(subscription, supabase);
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
  // NOTE: promotion_accounts table removed - skip this check
  let currentAccount = null;
  try {
    const { data } = await supabase
      .from('promotion_accounts')
      .select('tier, daily_points_available, last_daily_reset')
      .eq('user_id', userId)
      .maybeSingle();
    currentAccount = data;
  } catch (error) {
    // Table doesn't exist - ignore
    console.warn('promotion_accounts table not found, skipping tier check');
  }
  
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
    // NOTE: promotion_accounts table removed - skip this check
    let existingAccount = null;
    try {
      const { data } = await supabase
        .from('promotion_accounts')
        .select('subscription_start_date, subscription_end_date')
        .eq('user_id', userId)
        .maybeSingle();
      existingAccount = data;
    } catch (error) {
      // Table doesn't exist - ignore
      console.warn('promotion_accounts table not found, skipping start_date check');
    }
    
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
  // NOTE: promotion_accounts table removed - skip this update
  try {
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

    if (accountError) {
      console.warn('promotion_accounts table not found or update failed (table removed):', accountError);
    }
  } catch (error) {
    console.warn('promotion_accounts table not found (table removed), skipping update');
  }

  // Also update profiles table (primary source of truth for daily points)
  await supabase
    .from('profiles')
    .update({
      daily_points_available: pointsToSet,
    })
    .eq('id', userId);

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
  
  // Check if this is a restaurant subscription (premium and/or promoted)
  if (metadata.type === 'restaurant_subscription' || metadata.type === 'restaurant_premium') {
    await handleRestaurantPremiumSubscriptionDeleted(subscription, supabase);
    return;
  }
  
  // Check if this is a tour operator premium subscription
  if (metadata.type === 'tour_operator_premium') {
    await handleTourOperatorPremiumSubscriptionDeleted(subscription, supabase);
    return;
  }
  
  const userId = metadata.userId;

  if (!userId) {
    console.error('No userId in subscription metadata');
    return;
  }

  // Downgrade to free tier
  // NOTE: promotion_accounts table removed - skip this update
  try {
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
      console.warn('promotion_accounts table not found or update failed (table removed):', accountError);
    }
  } catch (error) {
    console.warn('promotion_accounts table not found (table removed), skipping update');
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
      // NOTE: promotion_accounts table removed - get subscription info from profiles instead
      const { data: profile } = await supabase
        .from('profiles')
        .select('plan_tier')
        .eq('id', userId)
        .maybeSingle();
      
      const account = profile ? {
        subscription_plan: profile.plan_tier || 'free',
        subscription_end_date: null, // Not stored in profiles
      } : null;
      
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
 * Handle restaurant subscription checkout (premium and/or promoted)
 */
async function handleRestaurantSubscriptionCheckout(session, supabase) {
  const metadata = session.metadata || {};
  const subscriptionId = session.subscription;
  
  const restaurantId = parseInt(metadata.restaurantId);
  const destinationId = metadata.destinationId;
  const restaurantSlug = metadata.restaurantSlug;
  const restaurantName = metadata.restaurantName;
  // Support both old and new metadata keys for backward compatibility
  const premiumPlan = metadata.restaurant_premium_plan || metadata.premiumPlan || ''; // 'monthly', 'annual', or ''
  const promotedPlan = metadata.promoted_listing_plan || metadata.promotedPlan || ''; // 'monthly', 'annual', or ''
  
  if (!restaurantId || !destinationId || !restaurantSlug || !subscriptionId) {
    console.error('Missing required fields for restaurant subscription checkout:', metadata);
    return;
  }
  
  // CRITICAL: Verify subscription exists and is active in Stripe before processing
  // This prevents activating subscriptions that don't exist or are cancelled
  let subscription;
  let currentPeriodEnd = new Date();
  const planType = premiumPlan || promotedPlan || 'monthly';
  currentPeriodEnd.setDate(currentPeriodEnd.getDate() + (planType === 'annual' || planType === 'yearly' ? 365 : 30));
  
  try {
    subscription = await stripe.subscriptions.retrieve(subscriptionId);
    
    // Verify subscription is actually active
    if (subscription.status !== 'active' && subscription.status !== 'trialing') {
      console.error(`❌ [WEBHOOK] Subscription ${subscriptionId} is not active (status: ${subscription.status}), skipping activation`);
      throw new Error(`Subscription ${subscriptionId} is not active (status: ${subscription.status})`);
    }
    
    if (subscription.current_period_end) {
      currentPeriodEnd = new Date(subscription.current_period_end * 1000);
    }
  } catch (err) {
    console.error(`❌ [WEBHOOK] Error fetching/verifying subscription ${subscriptionId} from Stripe:`, err);
    // Don't proceed if we can't verify the subscription - this is a critical failure
    throw new Error(`Failed to verify subscription with Stripe: ${err.message}`);
  }
  
  // Handle Premium subscription if selected
  // Update pending restaurant_premium_subscriptions record to active (like restaurant_subscriptions)
  if (premiumPlan) {
    // First, check if there's a pending record (created before checkout)
    const { data: existingPremiumPending } = await supabase
      .from('restaurant_premium_subscriptions')
      .select('id, status')
      .eq('restaurant_id', restaurantId)
      .eq('destination_id', destinationId)
      .eq('status', 'pending')
      .maybeSingle();
    
    if (existingPremiumPending) {
      // Update pending record to active (preserves customization settings from pending record)
      const { error: updateError } = await supabase
        .from('restaurant_premium_subscriptions')
        .update({
          stripe_subscription_id: subscriptionId,
          stripe_customer_id: session.customer,
          stripe_price_id: session.line_items?.data?.find(item => item.price.id.includes('restaurant_premium'))?.price?.id || null,
          plan_type: premiumPlan === 'annual' ? 'yearly' : 'monthly',
          status: 'active',
          current_period_start: new Date().toISOString(),
          current_period_end: currentPeriodEnd.toISOString(),
          // Note: Customization settings (color_scheme, hero_cta_index, etc.) are preserved from pending record
          // They were set in the subscribe route before checkout
        })
        .eq('id', existingPremiumPending.id);
      
      if (updateError) {
        console.error(`❌ [WEBHOOK] Error updating pending restaurant_premium_subscriptions to active:`, updateError);
      } else {
        console.log(`✅ [WEBHOOK] Updated pending restaurant_premium_subscriptions to active (ID: ${existingPremiumPending.id})`);
      }
    } else {
      // Fallback: Use upsert if no pending record exists (shouldn't happen, but handle gracefully)
      const { error } = await supabase
        .from('restaurant_premium_subscriptions')
        .upsert({
          restaurant_id: restaurantId,
          destination_id: destinationId,
          restaurant_slug: restaurantSlug,
          restaurant_name: restaurantName || null,
          stripe_subscription_id: subscriptionId,
          stripe_customer_id: session.customer,
          stripe_price_id: session.line_items?.data?.find(item => item.price.id.includes('restaurant_premium'))?.price?.id || null,
          plan_type: premiumPlan === 'annual' ? 'yearly' : 'monthly',
          status: 'active',
          current_period_start: new Date().toISOString(),
          current_period_end: currentPeriodEnd.toISOString(),
          layout_preset: metadata.layoutPreset || 'ocean',
          color_scheme: metadata.colorScheme || 'blue',
          hero_cta_index: parseInt(metadata.heroCTAIndex || '0'),
          mid_cta_index: parseInt(metadata.midCTAIndex || '0'),
          end_cta_index: parseInt(metadata.midCTAIndex || '0'), // End uses same as mid
          sticky_cta_index: parseInt(metadata.stickyCTAIndex || '0'),
          pending_website: metadata.pendingWebsite || null,
          website_review_status: metadata.pendingWebsite ? 'pending' : null,
          user_id: metadata.userId || null,
          purchaser_email: session.customer_email || null,
        }, {
          onConflict: 'restaurant_id,destination_id',
        });
      
      if (error) {
        console.error('❌ [WEBHOOK] Error upserting restaurant_premium_subscriptions (fallback):', error);
      } else {
        console.log(`✅ [WEBHOOK] Created/updated restaurant_premium_subscriptions (fallback) for ${restaurantName || restaurantSlug} (${restaurantId})`);
      }
    }
  }
  
  // Normalize destination_id to slug format (needed for both premium and promoted)
  const { normalizeDestinationIdToSlug } = await import('@/lib/destinationIdHelper');
  const destinationSlug = await normalizeDestinationIdToSlug(destinationId);
  
  // Update restaurant_subscriptions record from pending to active
  // The record should already exist as "pending" from the subscribe route
  const { data: existingSub } = await supabase
    .from('restaurant_subscriptions')
    .select('id, status')
    .eq('restaurant_id', restaurantId)
    .eq('user_id', metadata.userId)
    .maybeSingle();
  
  let subscriptionDbId = existingSub?.id;
  
  if (existingSub && existingSub.status === 'pending') {
    // Update pending record to active (preserves customization settings)
    const updateData = {
      stripe_subscription_id: subscriptionId,
      stripe_customer_id: session.customer,
      status: 'active',
      current_period_start: new Date().toISOString(),
      current_period_end: currentPeriodEnd.toISOString(),
      // Ensure user_id and email are set (may have been missing in old records)
      user_id: metadata.userId,
      email: session.customer_email || metadata.email || null,
    };
    
    // Only update premium plan if it was provided (may have changed)
    if (premiumPlan) {
      updateData.restaurant_premium_plan = premiumPlan;
    }
    
    // Only update promoted plan if it was provided (may have changed)
    if (promotedPlan) {
      updateData.promoted_listing_plan = promotedPlan;
      const promotionEndDate = new Date();
      if (promotedPlan === 'annual') {
        promotionEndDate.setFullYear(promotionEndDate.getFullYear() + 1);
      } else {
        promotionEndDate.setMonth(promotionEndDate.getMonth() + 1);
      }
      updateData.promoted_until = promotionEndDate.toISOString();
    }
    
    // Note: Customization settings (color_scheme, hero_cta_index, etc.) are preserved from pending record
    // They were set in the subscribe route before checkout
    
    const { error: subUpdateError } = await supabase
      .from('restaurant_subscriptions')
      .update(updateData)
      .eq('id', subscriptionDbId);
    
    if (subUpdateError) {
      console.error(`❌ [WEBHOOK] Error updating restaurant_subscriptions from pending to active:`, subUpdateError);
    } else {
      console.log(`✅ [WEBHOOK] Updated restaurant_subscriptions from pending to active (ID: ${subscriptionDbId})`);
    }
  } else if (!existingSub) {
    // Fallback: Create new record if pending record doesn't exist (shouldn't happen, but handle gracefully)
    console.warn(`⚠️ [WEBHOOK] No pending restaurant_subscriptions record found, creating new one...`);
    const { data: newSub, error: subInsertError } = await supabase
      .from('restaurant_subscriptions')
      .insert({
        user_id: metadata.userId,
        email: session.customer_email || metadata.email || null, // Save email for easy reference
        restaurant_id: restaurantId,
        destination_id: destinationSlug,
        restaurant_slug: restaurantSlug,
        restaurant_name: restaurantName,
        restaurant_premium_plan: premiumPlan || '',
        promoted_listing_plan: promotedPlan || '',
        stripe_subscription_id: subscriptionId,
        stripe_customer_id: session.customer,
        status: 'active',
        current_period_start: new Date().toISOString(),
        current_period_end: currentPeriodEnd.toISOString(),
        // Customization options from metadata (fallback if pending record missing)
        color_scheme: metadata.colorScheme || 'blue',
        hero_cta_index: parseInt(metadata.heroCTAIndex || '0'),
        mid_cta_index: parseInt(metadata.midCTAIndex || '0'),
        end_cta_index: parseInt(metadata.midCTAIndex || '0'),
        sticky_cta_index: parseInt(metadata.stickyCTAIndex || '0'),
      })
      .select('id')
      .single();
    
    if (subInsertError) {
      console.error(`❌ [WEBHOOK] Error creating restaurant_subscriptions record:`, subInsertError);
    } else {
      subscriptionDbId = newSub.id;
      console.log(`✅ [WEBHOOK] Created restaurant_subscriptions record (fallback): ${subscriptionDbId}`);
    }
  } else {
    // Record exists but is already active - just update subscription details
    const updateData = {
      stripe_subscription_id: subscriptionId,
      stripe_customer_id: session.customer,
      current_period_end: currentPeriodEnd.toISOString(),
      // Ensure user_id and email are set (may have been missing in old records)
      user_id: metadata.userId,
      email: session.customer_email || metadata.email || null,
    };
    
    if (premiumPlan) updateData.restaurant_premium_plan = premiumPlan;
    if (promotedPlan) {
      updateData.promoted_listing_plan = promotedPlan;
      const promotionEndDate = new Date();
      if (promotedPlan === 'annual') {
        promotionEndDate.setFullYear(promotionEndDate.getFullYear() + 1);
      } else {
        promotionEndDate.setMonth(promotionEndDate.getMonth() + 1);
      }
      updateData.promoted_until = promotionEndDate.toISOString();
    }
    
    const { error: subUpdateError } = await supabase
      .from('restaurant_subscriptions')
      .update(updateData)
      .eq('id', subscriptionDbId);
    
    if (subUpdateError) {
      console.error(`❌ [WEBHOOK] Error updating active restaurant_subscriptions:`, subUpdateError);
    } else {
      console.log(`✅ [WEBHOOK] Updated active restaurant_subscriptions record: ${subscriptionDbId}`);
    }
  }
  
  // Handle Promoted listing if selected
  if (promotedPlan) {
    // Calculate promotion end date based on billing cycle
    const promotionEndDate = new Date();
    if (promotedPlan === 'annual') {
      promotionEndDate.setFullYear(promotionEndDate.getFullYear() + 1);
    } else {
      promotionEndDate.setMonth(promotionEndDate.getMonth() + 1);
    }
    
    const promotionStartDate = new Date();
    
    // Update or create promoted_restaurants record
    // First, check if there's a pending record (created before checkout)
    const { data: existingPending } = await supabase
      .from('promoted_restaurants')
      .select('id')
      .eq('restaurant_id', restaurantId)
      .eq('status', 'pending')
      .maybeSingle();
    
    if (existingPending) {
      // Update pending record to active
      const { error: updateError } = await supabase
        .from('promoted_restaurants')
        .update({
          user_id: metadata.userId, // Ensure user_id is set
          stripe_subscription_id: subscriptionId,
          status: 'active',
          start_date: promotionStartDate.toISOString(),
          end_date: promotionEndDate.toISOString(),
          destination_id: destinationSlug, // Normalize to slug
        })
        .eq('id', existingPending.id);
      
      if (updateError) {
        console.error(`❌ [WEBHOOK] Error updating pending promoted_restaurants record:`, updateError);
      } else {
        console.log(`✅ [WEBHOOK] Updated pending promoted_restaurants record to active (active until ${promotionEndDate.toISOString()})`);
      }
    } else {
      // Create new active record (fallback if no pending record exists)
      const { data: newPromoted, error: insertError } = await supabase
        .from('promoted_restaurants')
        .insert({
          restaurant_id: restaurantId,
          user_id: metadata.userId, // Direct link to user for reliable querying
          email: session.customer_email || metadata.email || null, // Save email for easy reference
          restaurant_subscription_id: subscriptionDbId || null, // Link to subscription if available
          stripe_subscription_id: subscriptionId,
          promotion_plan: promotedPlan,
          status: 'active',
          start_date: promotionStartDate.toISOString(),
          end_date: promotionEndDate.toISOString(),
          destination_id: destinationSlug, // Normalize to slug
          restaurant_slug: restaurantSlug,
          restaurant_name: restaurantName,
        })
        .select('id')
        .single();
      
      if (insertError) {
        console.error(`❌ [WEBHOOK] Error creating promoted_restaurants record:`, insertError);
      } else {
        console.log(`✅ [WEBHOOK] Created promoted_restaurants record (active until ${promotionEndDate.toISOString()})`);
        
        // If subscription wasn't available when creating, link it now
        if (subscriptionDbId && !newPromoted.restaurant_subscription_id) {
          const { error: linkError } = await supabase
            .from('promoted_restaurants')
            .update({ restaurant_subscription_id: subscriptionDbId })
            .eq('id', newPromoted.id);
          
          if (linkError) {
            console.error(`❌ [WEBHOOK] Error linking new promoted_restaurants to subscription:`, linkError);
          } else {
            console.log(`✅ [WEBHOOK] Linked new promoted_restaurants to restaurant_subscriptions (ID: ${subscriptionDbId})`);
          }
        }
      }
    }
    
    // Update promoted_restaurants with subscription ID and user_id (if subscription was created/updated above)
    if (subscriptionDbId && existingPending) {
      const { error: linkError } = await supabase
        .from('promoted_restaurants')
        .update({ 
          restaurant_subscription_id: subscriptionDbId,
          user_id: metadata.userId // Ensure user_id is set
        })
        .eq('id', existingPending.id);
      
      if (linkError) {
        console.error(`❌ [WEBHOOK] Error linking promoted_restaurants to subscription:`, linkError);
      } else {
        console.log(`✅ [WEBHOOK] Linked promoted_restaurants to restaurant_subscriptions (ID: ${subscriptionDbId})`);
      }
    }
    
    // Also update restaurants table for backward compatibility
    const { error: promoteError } = await supabase
      .from('restaurants')
      .update({
        is_promoted: true,
        promoted_until: promotionEndDate.toISOString(),
        promotion_plan: promotedPlan,
        promotion_stripe_subscription_id: subscriptionId,
      })
      .eq('id', restaurantId);
    
    if (promoteError) {
      console.error(`❌ [WEBHOOK] Error promoting restaurant ${restaurantId}:`, promoteError);
    } else {
      console.log(`✅ [WEBHOOK] Restaurant ${restaurantId} successfully promoted until ${promotionEndDate.toISOString()}`);
    }
  }
  
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
      console.log(`✅ Restaurant subscription confirmation email sent to ${customerEmail}`);
    } catch (emailError) {
      console.error('Error sending restaurant subscription confirmation email:', emailError);
    }
  }
}

/**
 * Handle restaurant premium subscription checkout (legacy - for backward compatibility)
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
  
  // Support both old and new metadata types
  if (metadata.type !== 'restaurant_premium' && metadata.type !== 'restaurant_subscription') return false;
  
  const restaurantId = parseInt(metadata.restaurantId);
  const destinationId = metadata.destinationId;
  const promotedPlan = metadata.promotedPlan || '';
  
  if (!restaurantId || !destinationId) {
    console.error('Missing restaurant info in subscription metadata');
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
  
  // Update premium subscription if it exists (only if premium plan was selected)
  if (metadata.premiumPlan || metadata.type === 'restaurant_premium') {
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
  }
  
  // Normalize destination_id to slug format
  const { normalizeDestinationIdToSlug } = await import('@/lib/destinationIdHelper');
  const destinationSlug = await normalizeDestinationIdToSlug(destinationId);
  
  // Update restaurant_subscriptions record
  const { data: existingSub } = await supabase
    .from('restaurant_subscriptions')
    .select('id')
    .eq('stripe_subscription_id', subscription.id)
    .maybeSingle();
  
  if (existingSub) {
    const { error: subUpdateError } = await supabase
      .from('restaurant_subscriptions')
      .update({
        status: status,
        current_period_end: currentPeriodEnd,
      })
      .eq('id', existingSub.id);
    
    if (subUpdateError) {
      console.error('Error updating restaurant_subscriptions:', subUpdateError);
    } else {
      console.log(`✅ Updated restaurant_subscriptions for subscription ${subscription.id}`);
    }
  }
  
  // Update promoted_restaurants end_date to match subscription period (renewal handling)
  if (status === 'active' && currentPeriodEnd) {
    const { error: promoteError } = await supabase
      .from('promoted_restaurants')
      .update({
        end_date: currentPeriodEnd,
      })
      .eq('restaurant_id', restaurantId)
      .eq('destination_id', destinationSlug)
      .eq('status', 'active');
    
    if (promoteError) {
      console.error('Error updating promoted_restaurants end_date:', promoteError);
    } else {
      console.log(`✅ Updated promoted_restaurants end_date for restaurant ${restaurantId} (renewal)`);
    }
  }
  
  // Update promoted listing if promoted plan was selected (legacy support)
  if (promotedPlan) {
    if (status === 'active') {
      // Extend promotion end date
      const promotionEndDate = new Date();
      if (promotedPlan === 'annual') {
        promotionEndDate.setFullYear(promotionEndDate.getFullYear() + 1);
      } else {
        promotionEndDate.setMonth(promotionEndDate.getMonth() + 1);
      }
      
      const { error: promoteError } = await supabase
        .from('restaurants')
        .update({
          promoted_until: promotionEndDate.toISOString(),
        })
        .eq('id', restaurantId)
        .eq('is_promoted', true);
      
      if (promoteError) {
        console.error('Error updating promoted listing (legacy):', promoteError);
      } else {
        console.log(`✅ Promoted listing extended until ${promotionEndDate.toISOString()} (legacy)`);
      }
    } else {
      // Remove promotion if subscription is cancelled/expired
      const { error: unpromoteError } = await supabase
        .from('restaurants')
        .update({
          is_promoted: false,
          promoted_until: null,
          promotion_plan: null,
          promotion_stripe_subscription_id: null,
        })
        .eq('id', restaurantId)
        .eq('is_promoted', true);
      
      if (unpromoteError) {
        console.error('Error removing promoted listing (legacy):', unpromoteError);
      } else {
        console.log(`✅ Promoted listing removed due to subscription ${status} (legacy)`);
      }
    }
  }
  
  return true;
}

/**
 * Handle restaurant premium subscription deleted/cancelled
 */
async function handleRestaurantPremiumSubscriptionDeleted(subscription, supabase) {
  const metadata = subscription.metadata || {};
  
  // Support both old and new metadata types
  if (metadata.type !== 'restaurant_premium' && metadata.type !== 'restaurant_subscription') return false;
  
  const restaurantId = parseInt(metadata.restaurantId);
  const destinationId = metadata.destinationId;
  const restaurantSlug = metadata.restaurantSlug;
  const restaurantName = metadata.restaurantName;
  
  if (!restaurantId || !destinationId) {
    console.error('Missing restaurant info in subscription metadata');
    return false;
  }
  
  // Normalize destination_id to slug format (needed for queries)
  const { normalizeDestinationIdToSlug } = await import('@/lib/destinationIdHelper');
  const destinationSlug = await normalizeDestinationIdToSlug(destinationId);
  
  // Cancel restaurant_subscriptions record (ALWAYS update this table)
  // Find by stripe_subscription_id to ensure we get the right record
  const { data: existingSub } = await supabase
    .from('restaurant_subscriptions')
    .select('id, status, user_id, email, current_period_end, restaurant_name, restaurant_slug')
    .eq('stripe_subscription_id', subscription.id)
    .maybeSingle();
  
  // Get the subscription record to find the purchaser email and period end
  // Use restaurant_subscriptions first (primary table), then fallback to restaurant_premium_subscriptions
  let subRecord = existingSub;
  if (!subRecord) {
    const { data: premiumSubRecord } = await supabase
      .from('restaurant_premium_subscriptions')
      .select('purchaser_email, current_period_end, restaurant_name, restaurant_slug')
      .eq('restaurant_id', restaurantId)
      .eq('destination_id', destinationSlug)
      .maybeSingle();
    subRecord = premiumSubRecord;
  }
  
  if (existingSub) {
    const { error: subCancelError } = await supabase
      .from('restaurant_subscriptions')
      .update({
        status: 'cancelled',
        stripe_subscription_id: null, // Clear Stripe subscription ID
        // Keep other fields (restaurant_id, destination_id, etc.) for reference
      })
      .eq('id', existingSub.id);
    
    if (subCancelError) {
      console.error(`❌ [WEBHOOK] Error cancelling restaurant_subscriptions:`, subCancelError);
    } else {
      console.log(`✅ [WEBHOOK] Cancelled restaurant_subscriptions (ID: ${existingSub.id})`);
    }
  } else {
    // Fallback: Try to find by restaurant_id and user_id if stripe_subscription_id not found
    const userId = metadata.userId;
    if (userId) {
      const { data: fallbackSub } = await supabase
        .from('restaurant_subscriptions')
        .select('id')
        .eq('restaurant_id', restaurantId)
        .eq('user_id', userId)
        .eq('status', 'active')
        .maybeSingle();
      
      if (fallbackSub) {
        const { error: fallbackError } = await supabase
          .from('restaurant_subscriptions')
          .update({
            status: 'cancelled',
            stripe_subscription_id: null,
          })
          .eq('id', fallbackSub.id);
        
        if (fallbackError) {
          console.error(`❌ [WEBHOOK] Error cancelling restaurant_subscriptions (fallback):`, fallbackError);
        } else {
          console.log(`✅ [WEBHOOK] Cancelled restaurant_subscriptions (fallback, ID: ${fallbackSub.id})`);
        }
      }
    }
  }
  
  // Cancel premium subscription if it exists (ALWAYS update this table if premium was part of subscription)
  if (metadata.premiumPlan || metadata.restaurant_premium_plan || metadata.type === 'restaurant_premium') {
    const { error } = await supabase
      .from('restaurant_premium_subscriptions')
      .update({
        status: 'cancelled',
        stripe_subscription_id: null,
      })
      .eq('restaurant_id', restaurantId)
      .eq('destination_id', destinationSlug);
    
    if (error) {
      console.error('❌ [WEBHOOK] Error cancelling restaurant_premium_subscriptions:', error);
    } else {
      console.log(`✅ [WEBHOOK] Cancelled restaurant_premium_subscriptions for ${restaurantId}`);
    }
  }
  
  // Cancel promoted_restaurants if it was part of this subscription
  const promotedPlan = metadata.promoted_listing_plan || metadata.promotedPlan || '';
  if (promotedPlan) {
    // Find and cancel promoted_restaurants record
    const { data: promotedRecord } = await supabase
      .from('promoted_restaurants')
      .select('id')
      .eq('stripe_subscription_id', subscription.id)
      .maybeSingle();
    
    if (promotedRecord) {
      const { error: cancelPromotedError } = await supabase
        .from('promoted_restaurants')
        .update({
          status: 'cancelled',
          cancelled_at: new Date().toISOString(),
          stripe_subscription_id: null,
        })
        .eq('id', promotedRecord.id);
      
      if (cancelPromotedError) {
        console.error(`❌ [WEBHOOK] Error cancelling promoted_restaurants:`, cancelPromotedError);
      } else {
        console.log(`✅ [WEBHOOK] Cancelled promoted_restaurants (ID: ${promotedRecord.id})`);
      }
    }
    
    // Also update restaurants table for backward compatibility
    const { error: unpromoteError } = await supabase
      .from('restaurants')
      .update({
        is_promoted: false,
        promoted_until: null,
        promotion_plan: null,
        promotion_stripe_subscription_id: null,
      })
      .eq('id', restaurantId)
      .eq('is_promoted', true);
    
    if (unpromoteError) {
      console.error('❌ [WEBHOOK] Error removing promoted listing on subscription deletion:', unpromoteError);
    } else {
      console.log(`✅ [WEBHOOK] Removed promoted listing from restaurants table`);
    }
  }
  
  // Send cancellation email (always send, regardless of what was cancelled)
  const customerEmail = subRecord?.email || subRecord?.purchaser_email || metadata.email;
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
      console.log(`✅ [WEBHOOK] Restaurant subscription cancellation email sent to ${customerEmail}`);
    } catch (emailError) {
      console.error('❌ [WEBHOOK] Error sending restaurant cancellation email:', emailError);
      // Don't fail the webhook if email fails
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
  
  // CRITICAL: Verify Stripe subscription status before activating
  // This ensures we only activate if payment was actually successful
  let stripeSubscription;
  let priceId = null;
  try {
    stripeSubscription = await stripe.subscriptions.retrieve(subscriptionId);
    
    // Verify subscription is active or trialing
    if (stripeSubscription.status !== 'active' && stripeSubscription.status !== 'trialing') {
      console.error(`❌ [WEBHOOK] Stripe subscription ${subscriptionId} is not active (status: ${stripeSubscription.status}). Not activating.`);
      return;
    }
    console.log(`✅ [WEBHOOK] Stripe subscription ${subscriptionId} verified as ${stripeSubscription.status}`);
    
    // Get price ID from subscription
    priceId = stripeSubscription.items.data[0]?.price?.id || null;
    console.log(`💰 [WEBHOOK] Price ID: ${priceId}`);
  } catch (stripeError) {
    console.error(`❌ [WEBHOOK] Error verifying Stripe subscription ${subscriptionId}:`, stripeError);
    return; // Don't activate if we can't verify
  }
  
  // Get subscription period details from Stripe subscription
  let currentPeriodStart = new Date();
  let currentPeriodEnd = new Date();
  currentPeriodEnd.setDate(currentPeriodEnd.getDate() + (billingCycle === 'annual' ? 365 : 30));
  
  if (stripeSubscription.current_period_start) {
    currentPeriodStart = new Date(stripeSubscription.current_period_start * 1000);
  }
  if (stripeSubscription.current_period_end) {
    currentPeriodEnd = new Date(stripeSubscription.current_period_end * 1000);
  }
  console.log(`📅 [WEBHOOK] Subscription period: ${currentPeriodStart.toISOString()} to ${currentPeriodEnd.toISOString()}`);
  
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
    
    // Handle promoted listings if any are selected
    const promotedTourIdsStr = session.metadata?.promotedTourIds || '';
    const promotedBillingCycle = session.metadata?.promotedBillingCycle || 'monthly';
    
    if (promotedTourIdsStr && promotedTourIdsStr.length > 0) {
      const promotedTourIds = promotedTourIdsStr.split(',').filter(Boolean);
      
      if (promotedTourIds.length > 0) {
        console.log(`📢 [WEBHOOK] Processing ${promotedTourIds.length} promoted tour listing(s)`);
        
        // Calculate promotion dates based on billing cycle
        const promotionStartDate = new Date();
        const promotionEndDate = new Date();
        if (promotedBillingCycle === 'annual') {
          promotionEndDate.setFullYear(promotionEndDate.getFullYear() + 1);
        } else {
          promotionEndDate.setMonth(promotionEndDate.getMonth() + 1);
        }
        
        // Process promoted tours - update existing pending records or create new ones
        for (const productId of promotedTourIds) {
          // Get operator_tours record to get operator_id (which is the operator_tours.id)
          const { data: operatorTour } = await supabase
            .from('operator_tours')
            .select('id, destination_id')
            .eq('operator_subscription_id', subscriptionDbId)
            .eq('product_id', productId)
            .maybeSingle();
          
          if (!operatorTour) {
            console.error(`❌ [WEBHOOK] Could not find operator_tours record for productId ${productId}`);
            continue;
          }
          
          const operatorId = operatorTour.id; // operator_id is the operator_tours.id
          let destinationId = operatorTour.destination_id;
          
          // Normalize destination_id to slug format (like restaurants)
          if (destinationId) {
            try {
              const { normalizeDestinationIdToSlug } = await import('@/lib/destinationIdHelper');
              const normalizedSlug = await normalizeDestinationIdToSlug(destinationId);
              if (normalizedSlug) {
                destinationId = normalizedSlug;
              }
            } catch (e) {
              console.warn(`Could not normalize destination_id ${destinationId} to slug:`, e);
              // Keep original destinationId if normalization fails
            }
          }
          
          // Check if pending record exists (created before checkout)
          const { data: existingPending } = await supabase
            .from('promoted_tours')
            .select('id')
            .eq('product_id', productId)
            .eq('operator_subscription_id', subscriptionDbId)
            .eq('status', 'pending')
            .maybeSingle();
          
          // Get tour name from operator_tours
          let tourName = '';
          const { data: operatorTourData } = await supabase
            .from('operator_tours')
            .select('tour_title')
            .eq('id', operatorId)
            .maybeSingle();
          
          if (operatorTourData?.tour_title) {
            tourName = operatorTourData.tour_title;
          }
          
          // Get email from subscription metadata or tour_operator_subscriptions
          const subscriptionEmail = metadata.operatorEmail || metadata.email;
          let finalEmail = subscriptionEmail;
          if (!finalEmail) {
            const { data: subData } = await supabase
              .from('tour_operator_subscriptions')
              .select('operator_email')
              .eq('id', subscriptionDbId)
              .maybeSingle();
            finalEmail = subData?.operator_email;
          }
          
          // Get user_id from subscription
          const subscriptionUserId = metadata.userId;
          let finalUserId = subscriptionUserId;
          if (!finalUserId) {
            const { data: subData } = await supabase
              .from('tour_operator_subscriptions')
              .select('user_id')
              .eq('id', subscriptionDbId)
              .maybeSingle();
            finalUserId = subData?.user_id;
          }
          
          if (existingPending) {
            // Update existing pending record to active
            const { error: updateError } = await supabase
              .from('promoted_tours')
              .update({
                operator_id: operatorId, // Ensure operator_id is set
                stripe_subscription_id: subscriptionId,
                status: 'active',
                start_date: promotionStartDate.toISOString(),
                end_date: promotionEndDate.toISOString(),
                destination_id: destinationId, // Update destination_id if available
                tour_name: tourName || undefined, // Update tour_name if available
                email: finalEmail || undefined, // Update email if available
                user_id: finalUserId || undefined, // Update user_id if available
              })
              .eq('id', existingPending.id);
            
            if (updateError) {
              console.error(`❌ [WEBHOOK] Error updating pending promoted_tours for ${productId}:`, updateError);
            } else {
              console.log(`✅ [WEBHOOK] Updated pending promoted_tours to active for ${productId} (active until ${promotionEndDate.toISOString()})`);
            }
          } else {
            // No pending record found - create new one (fallback for edge cases)
            console.warn(`⚠️ [WEBHOOK] No pending promoted_tours record found for ${productId}, creating new one`);
            const { error: insertError } = await supabase
              .from('promoted_tours')
              .insert({
                product_id: productId,
                operator_id: operatorId,
                operator_subscription_id: subscriptionDbId,
                stripe_subscription_id: subscriptionId,
                promotion_plan: promotedBillingCycle,
                status: 'active',
                start_date: promotionStartDate.toISOString(),
                end_date: promotionEndDate.toISOString(),
                destination_id: destinationId,
                tour_name: tourName || undefined,
                email: finalEmail || undefined,
                user_id: finalUserId || undefined,
              });
            
            if (insertError) {
              console.error(`❌ [WEBHOOK] Error creating promoted_tours record for ${productId}:`, insertError);
            } else {
              console.log(`✅ [WEBHOOK] Created promoted_tours record for ${productId} (active until ${promotionEndDate.toISOString()})`);
            }
          }
          
          // Also update operator_tours table for backward compatibility and quick queries
          const { error: updateError } = await supabase
            .from('operator_tours')
            .update({
              is_promoted: true,
              promoted_until: promotionEndDate.toISOString(),
              promotion_plan: promotedBillingCycle,
              promotion_stripe_subscription_id: subscriptionId,
            })
            .eq('operator_subscription_id', subscriptionDbId)
            .eq('product_id', productId);
          
          if (updateError) {
            console.error(`❌ [WEBHOOK] Error updating operator_tours for ${productId}:`, updateError);
          }
        }
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
 * Handle tour operator promotion upgrade checkout
 * This handles when users add promotion to existing tours via checkout
 * Internal function (not exported - Next.js routes can only export HTTP methods)
 */
async function handleTourOperatorPromotionUpgrade(session, supabase) {
  try {
    const metadata = session.metadata || {};
    const subscriptionId = session.subscription;
    const subscriptionDbId = metadata.subscriptionId;
    const userId = metadata.userId;
    const promotedTourIdsStr = metadata.promotedTourIds || '';
    const promotedBillingCycle = metadata.promotedBillingCycle || 'monthly';
    
    console.log(`🔄 [WEBHOOK] Processing tour operator promotion upgrade for subscription ${subscriptionDbId}, Stripe subscription ${subscriptionId}`);
    
    if (!subscriptionDbId || !subscriptionId || !userId) {
      console.error('❌ [WEBHOOK] Missing required fields for promotion upgrade:', metadata);
      return;
    }
    
    // Verify payment was successful
    if (session.payment_status !== 'paid') {
      console.error(`❌ [WEBHOOK] Payment status is not 'paid' for session ${session.id}: ${session.payment_status}`);
      return;
    }
    
    console.log(`✅ [WEBHOOK] Payment confirmed as paid for promotion upgrade session ${session.id}`);
    
    // Get subscription details from database
    const { data: subscription, error: subError } = await supabase
      .from('tour_operator_subscriptions')
      .select('*')
      .eq('id', subscriptionDbId)
      .eq('user_id', userId)
      .single();
    
    if (subError || !subscription) {
      console.error('❌ [WEBHOOK] Subscription not found:', subError);
      return;
    }
    
    // Update subscription with new Stripe subscription ID if it's different
    if (subscription.stripe_subscription_id !== subscriptionId) {
      const { error: updateError } = await supabase
        .from('tour_operator_subscriptions')
        .update({ stripe_subscription_id: subscriptionId })
        .eq('id', subscriptionDbId);
      
      if (updateError) {
        console.error('❌ [WEBHOOK] Error updating subscription Stripe ID:', updateError);
      } else {
        console.log(`✅ [WEBHOOK] Updated subscription ${subscriptionDbId} with Stripe subscription ID ${subscriptionId}`);
      }
    }
    
    // Parse promoted tour IDs
    const promotedTourIds = promotedTourIdsStr.split(',').filter(Boolean);
    
    if (promotedTourIds.length === 0) {
      console.error('❌ [WEBHOOK] No promoted tour IDs provided');
      return;
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
      console.error('❌ [WEBHOOK] Error fetching Stripe subscription details:', err);
      // Use fallback calculation
      if (promotedBillingCycle === 'annual') {
        promotionEndDate.setFullYear(promotionEndDate.getFullYear() + 1);
      } else {
        promotionEndDate.setMonth(promotionEndDate.getMonth() + 1);
      }
    }
    
    const promotionStartDate = new Date();
    
    console.log(`📢 [WEBHOOK] Processing ${promotedTourIds.length} promoted tour listing(s) for upgrade`);
    
    // Update each promoted tour
    for (const productId of promotedTourIds) {
      // Get destination_id from operator_tours
      let destinationId = null;
      const { data: operatorTour } = await supabase
        .from('operator_tours')
        .select('destination_id')
        .eq('operator_subscription_id', subscriptionDbId)
        .eq('product_id', productId)
        .maybeSingle();
      
      if (operatorTour?.destination_id) {
        destinationId = operatorTour.destination_id;
        
        // Normalize destination_id to slug format (like restaurants)
        try {
          const { normalizeDestinationIdToSlug } = await import('@/lib/destinationIdHelper');
          const normalizedSlug = await normalizeDestinationIdToSlug(destinationId);
          if (normalizedSlug) {
            destinationId = normalizedSlug;
          }
        } catch (e) {
          console.warn(`Could not normalize destination_id ${destinationId} to slug:`, e);
          // Keep original destinationId if normalization fails
        }
        
        console.log(`   Found destination_id for ${productId}: ${destinationId}`);
      } else {
        console.warn(`   ⚠️ No destination_id found for ${productId} in operator_tours`);
      }
      
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
        console.error(`❌ [WEBHOOK] Error updating operator_tours for ${productId}:`, tourUpdateError);
      } else {
        console.log(`✅ [WEBHOOK] Updated operator_tours for ${productId}`);
      }
      
      // Update existing pending record to active (created before checkout)
      // If no pending record exists, create a new one (fallback)
      const { data: existingPending } = await supabase
        .from('promoted_tours')
        .select('id')
        .eq('product_id', productId)
        .eq('operator_subscription_id', subscriptionDbId)
        .eq('status', 'pending')
        .maybeSingle();
      
      if (existingPending) {
        // Update pending record to active
        const { error: updateError } = await supabase
          .from('promoted_tours')
          .update({
            stripe_subscription_id: subscriptionId,
            status: 'active',
            start_date: promotionStartDate.toISOString(),
            end_date: promotionEndDate.toISOString(),
            destination_id: destinationId, // Update destination_id if available
          })
          .eq('id', existingPending.id);
        
        if (updateError) {
          console.error(`❌ [WEBHOOK] Error updating pending promoted_tours record for ${productId}:`, updateError);
        } else {
          console.log(`✅ [WEBHOOK] Updated pending promoted_tours record to active for ${productId} (active until ${promotionEndDate.toISOString()})`);
        }
      } else {
        // Fallback: Create new record if no pending record exists (shouldn't happen, but safety net)
        const { error: insertError } = await supabase
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
            destination_id: destinationSlug, // Normalize to slug
          });
        
        if (insertError) {
          console.error(`❌ [WEBHOOK] Error creating promoted_tours record for ${productId}:`, insertError);
        } else {
          console.log(`✅ [WEBHOOK] Created promoted_tours record for ${productId} (active until ${promotionEndDate.toISOString()})`);
        }
      }
    }
    
    console.log(`✅ [WEBHOOK] Promotion upgrade completed for ${promotedTourIds.length} tour(s)`);
    
  } catch (error) {
    console.error('❌ [WEBHOOK] Unexpected error in handleTourOperatorPromotionUpgrade (logged but not failing webhook):', error);
    console.error('❌ [WEBHOOK] Error stack:', error.stack);
  }
}

/**
 * Handle restaurant promotion upgrade checkout
 * This handles when users add promotion to existing restaurants via checkout
 * Exported for use in manual processing endpoint
 */
export async function handleRestaurantPromotionUpgrade(session, supabase) {
  try {
    const metadata = session.metadata || {};
    const subscriptionId = session.subscription;
    const subscriptionDbId = metadata.subscriptionId;
    const userId = metadata.userId;
    const restaurantId = metadata.restaurantId;
    const promotedBillingCycle = metadata.promotedBillingCycle || 'monthly';
    
    console.log(`🔄 [WEBHOOK] Processing restaurant promotion upgrade for subscription ${subscriptionDbId}, Stripe subscription ${subscriptionId}`);
    
    if (!subscriptionDbId || !subscriptionId || !userId || !restaurantId) {
      console.error('❌ [WEBHOOK] Missing required fields for restaurant promotion upgrade:', metadata);
      return;
    }
    
    // Verify payment was successful
    if (session.payment_status !== 'paid') {
      console.error(`❌ [WEBHOOK] Payment status is not 'paid' for session ${session.id}: ${session.payment_status}`);
      return;
    }
    
    console.log(`✅ [WEBHOOK] Payment confirmed as paid for restaurant promotion upgrade session ${session.id}`);
    
    // Get subscription details from database (try new table first, then old table)
    let { data: subscription, error: subError } = await supabase
      .from('restaurant_subscriptions')
      .select('*')
      .eq('id', subscriptionDbId)
      .eq('user_id', userId)
      .maybeSingle();
    
    let isOldSubscription = false;
    
    // If not found in new table, try old table
    if (subError || !subscription) {
      const { data: oldSub, error: oldSubError } = await supabase
        .from('restaurant_premium_subscriptions')
        .select('*')
        .eq('id', subscriptionDbId)
        .eq('user_id', userId)
        .maybeSingle();
      
      if (oldSubError || !oldSub) {
        console.error('❌ [WEBHOOK] Restaurant subscription not found:', oldSubError || subError);
        return;
      }
      
      // Convert old subscription format
      subscription = {
        ...oldSub,
        restaurant_premium_plan: oldSub.plan_type === 'yearly' ? 'annual' : 'monthly',
        restaurant_id: oldSub.restaurant_id,
        destination_id: oldSub.destination_id,
        restaurant_slug: oldSub.restaurant_slug,
        restaurant_name: oldSub.restaurant_name,
      };
      isOldSubscription = true;
      
      // Create record in new table if it doesn't exist
      const { data: existingNewSub } = await supabase
        .from('restaurant_subscriptions')
        .select('id')
        .eq('user_id', userId)
        .eq('restaurant_id', subscription.restaurant_id)
        .maybeSingle();
      
      if (!existingNewSub) {
        const { data: newSub } = await supabase
          .from('restaurant_subscriptions')
          .insert({
            user_id: userId,
            restaurant_id: subscription.restaurant_id,
            destination_id: subscription.destination_id,
            restaurant_slug: subscription.restaurant_slug,
            restaurant_name: subscription.restaurant_name,
            restaurant_premium_plan: subscription.restaurant_premium_plan,
            stripe_subscription_id: subscription.stripe_subscription_id,
            stripe_customer_id: subscription.stripe_customer_id,
            status: subscription.status || 'active',
          })
          .select('id')
          .single();
        
        if (newSub) {
          subscriptionDbId = newSub.id; // Update to use new subscription ID
          console.log(`✅ [WEBHOOK] Created restaurant_subscriptions record for old subscription: ${newSub.id}`);
        }
      } else {
        subscriptionDbId = existingNewSub.id; // Use existing new subscription ID
      }
    }
    
    // Update subscription with new Stripe subscription ID if it's different
    if (subscription.stripe_subscription_id !== subscriptionId) {
      const { error: updateError } = await supabase
        .from('restaurant_subscriptions')
        .update({ stripe_subscription_id: subscriptionId })
        .eq('id', subscriptionDbId);
      
      if (updateError) {
        console.error('❌ [WEBHOOK] Error updating subscription Stripe ID:', updateError);
      } else {
        console.log(`✅ [WEBHOOK] Updated subscription ${subscriptionDbId} with Stripe subscription ID ${subscriptionId}`);
      }
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
      console.error('❌ [WEBHOOK] Error fetching Stripe subscription details:', err);
      // Use fallback calculation
      if (promotedBillingCycle === 'annual') {
        promotionEndDate.setFullYear(promotionEndDate.getFullYear() + 1);
      } else {
        promotionEndDate.setMonth(promotionEndDate.getMonth() + 1);
      }
    }
    
    const promotionStartDate = new Date();
    
    console.log(`📢 [WEBHOOK] Processing restaurant promotion upgrade for restaurant ${restaurantId}`);
    
    // Update existing pending record to active (created before checkout)
    // If no pending record exists, create a new one (fallback)
    const { data: existingPending } = await supabase
      .from('promoted_restaurants')
      .select('id')
      .eq('restaurant_id', parseInt(restaurantId))
      .eq('restaurant_subscription_id', subscriptionDbId)
      .eq('status', 'pending')
      .maybeSingle();
    
    // Normalize destination_id to slug format
    const { normalizeDestinationIdToSlug } = await import('@/lib/destinationIdHelper');
    const destinationSlug = await normalizeDestinationIdToSlug(subscription.destination_id);
    
    if (existingPending) {
      // Update pending record to active
      const { error: updateError } = await supabase
        .from('promoted_restaurants')
        .update({
          user_id: userId, // Ensure user_id is set
          stripe_subscription_id: subscriptionId,
          status: 'active',
          start_date: promotionStartDate.toISOString(),
          end_date: promotionEndDate.toISOString(),
          destination_id: destinationSlug, // Normalize to slug
        })
        .eq('id', existingPending.id);
      
      if (updateError) {
        console.error(`❌ [WEBHOOK] Error updating pending promoted_restaurants record:`, updateError);
      } else {
        console.log(`✅ [WEBHOOK] Updated pending promoted_restaurants record to active (active until ${promotionEndDate.toISOString()})`);
      }
    } else {
      // Fallback: Create new record if no pending record exists (shouldn't happen, but safety net)
      const { error: insertError } = await supabase
        .from('promoted_restaurants')
        .insert({
          restaurant_id: parseInt(restaurantId),
          user_id: userId, // Direct link to user for reliable querying
          restaurant_subscription_id: subscriptionDbId,
          stripe_subscription_id: subscriptionId,
          promotion_plan: promotedBillingCycle,
          status: 'active',
          start_date: promotionStartDate.toISOString(),
          end_date: promotionEndDate.toISOString(),
          destination_id: destinationSlug, // Normalize to slug
          restaurant_slug: subscription.restaurant_slug,
          restaurant_name: subscription.restaurant_name,
        });
      
      if (insertError) {
        console.error(`❌ [WEBHOOK] Error creating promoted_restaurants record:`, insertError);
      } else {
        console.log(`✅ [WEBHOOK] Created promoted_restaurants record (active until ${promotionEndDate.toISOString()})`);
      }
    }
    
    // Also update restaurants table for backward compatibility
    const { error: restaurantUpdateError } = await supabase
      .from('restaurants')
      .update({
        is_promoted: true,
        promoted_until: promotionEndDate.toISOString(),
        promotion_plan: promotedBillingCycle,
        promotion_stripe_subscription_id: subscriptionId,
      })
      .eq('id', parseInt(restaurantId));
    
    if (restaurantUpdateError) {
      console.error(`❌ [WEBHOOK] Error updating restaurants table:`, restaurantUpdateError);
    } else {
      console.log(`✅ [WEBHOOK] Updated restaurants table for restaurant ${restaurantId}`);
    }
    
    // Update restaurant_subscriptions table
    const { error: subUpdateError } = await supabase
      .from('restaurant_subscriptions')
      .update({
        promoted_listing_plan: promotedBillingCycle,
        promoted_until: promotionEndDate.toISOString(),
      })
      .eq('id', subscriptionDbId);
    
    if (subUpdateError) {
      console.error(`❌ [WEBHOOK] Error updating restaurant_subscriptions table:`, subUpdateError);
    } else {
      console.log(`✅ [WEBHOOK] Updated restaurant_subscriptions table`);
    }
    
    console.log(`✅ [WEBHOOK] Restaurant promotion upgrade completed`);
    
  } catch (error) {
    console.error('❌ [WEBHOOK] Unexpected error in handleRestaurantPromotionUpgrade (logged but not failing webhook):', error);
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
  
  // Update promoted listings in promoted_tours table
  if (status === 'active') {
    // Extend promotion end date based on subscription period
    const { error: promoteError } = await supabase
      .from('promoted_tours')
      .update({
        status: 'active',
        end_date: currentPeriodEnd.toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq('operator_subscription_id', subscriptionDbId)
      .eq('stripe_subscription_id', subscription.id);
    
    if (promoteError) {
      console.error('Error updating promoted listings:', promoteError);
    } else {
      console.log(`✅ Promoted listings extended until ${currentPeriodEnd.toISOString()}`);
    }
    
    // Also update operator_tours for backward compatibility
    const { error: updateOperatorToursError } = await supabase
      .from('operator_tours')
      .update({
        promoted_until: currentPeriodEnd.toISOString(),
      })
      .eq('operator_subscription_id', subscriptionDbId)
      .eq('is_promoted', true);
    
    if (updateOperatorToursError) {
      console.error('Error updating operator_tours promoted_until:', updateOperatorToursError);
    }
  } else if (status === 'cancelled' || status === 'expired') {
    // Mark promotions as cancelled/expired
    const { error: cancelError } = await supabase
      .from('promoted_tours')
      .update({
        status: status === 'cancelled' ? 'cancelled' : 'expired',
        cancelled_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq('operator_subscription_id', subscriptionDbId)
      .eq('stripe_subscription_id', subscription.id)
      .eq('status', 'active');
    
    if (cancelError) {
      console.error('Error cancelling promoted listings:', cancelError);
    } else {
      console.log(`✅ Promoted listings marked as ${status}`);
    }
    
    // Also update operator_tours for backward compatibility
    const { error: updateOperatorToursError } = await supabase
      .from('operator_tours')
      .update({
        is_promoted: false,
        promoted_until: null,
        promotion_plan: null,
        promotion_stripe_subscription_id: null,
      })
      .eq('operator_subscription_id', subscriptionDbId)
      .eq('is_promoted', true);
    
    if (updateOperatorToursError) {
      console.error('Error updating operator_tours is_promoted:', updateOperatorToursError);
    }
  } else {
    // If subscription is cancelled/expired, remove promotions
    const { error: unpromoteError } = await supabase
      .from('operator_tours')
      .update({
        is_promoted: false,
        promoted_until: null,
      })
      .eq('operator_subscription_id', subscriptionDbId)
      .eq('is_promoted', true);
    
    if (unpromoteError) {
      console.error('Error removing promoted listings:', unpromoteError);
    } else {
      console.log(`✅ Promoted listings removed due to subscription ${status}`);
    }
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
  
  // Cancel promoted listings when subscription is deleted
  // Find by stripe_subscription_id first (most reliable), then fallback to operator_subscription_id
  const { data: promotedRecords } = await supabase
    .from('promoted_tours')
    .select('id')
    .eq('stripe_subscription_id', subscription.id)
    .in('status', ['active', 'pending']);
  
  if (promotedRecords && promotedRecords.length > 0) {
    // Cancel by stripe_subscription_id (most reliable)
    const { error: expirePromoteError } = await supabase
      .from('promoted_tours')
      .update({
        status: 'cancelled',
        cancelled_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        stripe_subscription_id: null, // Clear Stripe subscription ID
      })
      .eq('stripe_subscription_id', subscription.id)
      .in('status', ['active', 'pending']);
    
    if (expirePromoteError) {
      console.error('❌ [WEBHOOK] Error cancelling promoted_tours:', expirePromoteError);
    } else {
      console.log(`✅ [WEBHOOK] Cancelled ${promotedRecords.length} promoted_tours record(s) by stripe_subscription_id`);
    }
  } else {
    // Fallback: Cancel by operator_subscription_id if stripe_subscription_id not found
    const { error: expirePromoteError } = await supabase
      .from('promoted_tours')
      .update({
        status: 'cancelled',
        cancelled_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        stripe_subscription_id: null,
      })
      .eq('operator_subscription_id', subscriptionDbId)
      .in('status', ['active', 'pending']);
    
    if (expirePromoteError) {
      console.error('❌ [WEBHOOK] Error cancelling promoted_tours (fallback):', expirePromoteError);
    } else {
      console.log(`✅ [WEBHOOK] Cancelled promoted_tours by operator_subscription_id (fallback)`);
    }
  }
  
  // Also update operator_tours for backward compatibility
  // Remove promoted listings when subscription is deleted
  const { error: unpromoteError } = await supabase
    .from('operator_tours')
    .update({
      is_promoted: false,
      promoted_until: null,
      promotion_plan: null,
      promotion_stripe_subscription_id: null,
    })
    .eq('operator_subscription_id', subscriptionDbId)
    .eq('is_promoted', true);
  
  if (unpromoteError) {
    console.error('Error removing promoted listings on subscription deletion:', unpromoteError);
  } else {
    console.log(`✅ Promoted listings removed due to subscription deletion`);
  }
  
  // Deactivate all operator tours (but keep them in database for history)
  const { error: deactivateToursError } = await supabase
    .from('operator_tours')
    .update({
      is_active: false,
    })
    .eq('operator_subscription_id', subscriptionDbId)
    .eq('is_active', true);
  
  if (deactivateToursError) {
    console.error('❌ [WEBHOOK] Error deactivating operator_tours:', deactivateToursError);
  } else {
    console.log(`✅ [WEBHOOK] Deactivated operator_tours for subscription ${subscriptionDbId}`);
  }
  
  if (error) {
    console.error('❌ [WEBHOOK] Error cancelling tour operator subscription:', error);
  } else {
    console.log(`✅ [WEBHOOK] Tour operator premium subscription cancelled for ${subscriptionDbId}`);
    
    // Send cancellation email
    if (finalOperatorEmail) {
      try {
        // Get subscription end date from database
        const { data: subscriptionData } = await supabase
          .from('tour_operator_subscriptions')
          .select('current_period_end')
          .eq('id', subscriptionDbId)
          .single();
        
        const endDate = subscriptionData?.current_period_end 
          ? new Date(subscriptionData.current_period_end).toISOString()
          : subscription.current_period_end
            ? new Date(subscription.current_period_end * 1000).toISOString()
            : new Date().toISOString();
        
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

/**
 * Handle invoice payment failed
 * Only deactivates promotions when Stripe gives a "hard no" (unpaid status)
 * Stripe retries multiple times, so we don't deactivate on first failures
 */
async function handleInvoicePaymentFailed(invoice) {
  const supabase = createSupabaseServiceRoleClient();
  const subscriptionId = invoice.subscription;
  
  if (!subscriptionId) {
    console.log('⚠️ [WEBHOOK] Invoice payment failed but no subscription ID');
    return;
  }
  
  try {
    // Fetch the subscription to check its status
    const subscription = await stripe.subscriptions.retrieve(subscriptionId);
    const metadata = subscription.metadata || {};
    
    console.log(`🔍 [WEBHOOK] Invoice payment failed for subscription ${subscriptionId}, status: ${subscription.status}`);
    
    // Only deactivate if Stripe gives a "hard no" (unpaid status)
    // Stripe retries multiple times, so we wait for final failure
    if (subscription.status === 'unpaid') {
      // Unpaid is the final state - deactivate immediately
      console.log(`❌ [WEBHOOK] Subscription ${subscriptionId} is unpaid (final failure) - deactivating promotions`);
      
      // Handle restaurant promotions
      if (metadata.type === 'restaurant_subscription' || metadata.type === 'restaurant_premium' || metadata.type === 'restaurant_promotion_upgrade') {
        await handleRestaurantPremiumSubscriptionDeleted(subscription, supabase);
      }
      
      // Handle tour operator promotions
      if (metadata.type === 'tour_operator_premium' || metadata.type === 'tour_operator_promotion_upgrade') {
        await handleTourOperatorPremiumSubscriptionDeleted(subscription, supabase);
      }
    } else if (subscription.status === 'past_due') {
      // past_due - Stripe is still retrying, don't deactivate yet
      console.log(`⚠️ [WEBHOOK] Subscription ${subscriptionId} is past_due - Stripe is retrying, not deactivating yet`);
    } else {
      console.log(`ℹ️ [WEBHOOK] Subscription ${subscriptionId} status is ${subscription.status} - payment may succeed on retry`);
    }
  } catch (error) {
    console.error(`❌ [WEBHOOK] Error handling invoice payment failed:`, error);
    // Don't throw - we don't want to fail the webhook
  }
}

