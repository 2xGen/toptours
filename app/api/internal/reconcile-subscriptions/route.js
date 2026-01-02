/**
 * Subscription Reconciliation Job
 * 
 * This endpoint should be called daily (via cron) to reconcile Stripe subscriptions
 * with the database. It ensures that:
 * 1. All active Stripe subscriptions have corresponding database records
 * 2. All database records match their Stripe subscription status
 * 3. Any discrepancies are logged and fixed
 * 
 * This is CRITICAL for production reliability - webhooks can fail, but this ensures
 * the system eventually becomes consistent.
 * 
 * Usage: Set up a daily cron job to call this endpoint
 * Example: 0 2 * * * curl https://yourdomain.com/api/internal/reconcile-subscriptions
 */

import { NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';
import { createSupabaseServiceRoleClient } from '@/lib/supabaseClient';

const RECONCILE_API_KEY = process.env.RECONCILE_API_KEY; // Set in .env.local for security

export async function GET(request) {
  // Security: Require API key to prevent unauthorized access
  const authHeader = request.headers.get('authorization');
  if (!authHeader || authHeader !== `Bearer ${RECONCILE_API_KEY}`) {
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401 }
    );
  }

  const supabase = createSupabaseServiceRoleClient();
  const results = {
    checked: 0,
    fixed: 0,
    errors: [],
  };

  try {
    // ===== RESTAURANT SUBSCRIPTIONS =====
    const { data: dbRestaurantSubs, error: dbRestaurantError } = await supabase
      .from('restaurant_subscriptions')
      .select('id, stripe_subscription_id, status, restaurant_id, user_id, restaurant_name')
      .in('status', ['active', 'pending']);

    if (dbRestaurantError) {
      throw new Error(`Database query failed: ${dbRestaurantError.message}`);
    }

    results.checked += dbRestaurantSubs?.length || 0;

    // For each restaurant subscription, verify it exists and is active in Stripe
    for (const dbSub of dbRestaurantSubs || []) {
      if (!dbSub.stripe_subscription_id) {
        continue;
      }

      try {
        const stripeSub = await stripe.subscriptions.retrieve(dbSub.stripe_subscription_id);

        if (stripeSub.status === 'active' && dbSub.status !== 'active') {
          console.log(`🔧 [RECONCILE] Fixing restaurant subscription ${dbSub.id}: Stripe=active, DB=${dbSub.status}`);
          
          const { error: updateError } = await supabase
            .from('restaurant_subscriptions')
            .update({ status: 'active' })
            .eq('id', dbSub.id);

          if (updateError) {
            results.errors.push(`Failed to fix restaurant subscription ${dbSub.id}: ${updateError.message}`);
          } else {
            results.fixed++;
            console.log(`✅ [RECONCILE] Fixed restaurant subscription ${dbSub.id}`);
          }
        } else if ((stripeSub.status === 'canceled' || stripeSub.status === 'unpaid') && dbSub.status === 'active') {
          console.log(`🔧 [RECONCILE] Fixing restaurant subscription ${dbSub.id}: Stripe=${stripeSub.status}, DB=active`);
          
          const { error: updateError } = await supabase
            .from('restaurant_subscriptions')
            .update({ status: 'cancelled' })
            .eq('id', dbSub.id);

          if (updateError) {
            results.errors.push(`Failed to fix restaurant subscription ${dbSub.id}: ${updateError.message}`);
          } else {
            results.fixed++;
            console.log(`✅ [RECONCILE] Fixed restaurant subscription ${dbSub.id}`);
          }
        }
      } catch (stripeError) {
        if (stripeError.code === 'resource_missing') {
          console.log(`🔧 [RECONCILE] Restaurant subscription ${dbSub.stripe_subscription_id} not found in Stripe, marking as cancelled`);
          
          const { error: updateError } = await supabase
            .from('restaurant_subscriptions')
            .update({ status: 'cancelled' })
            .eq('id', dbSub.id);

          if (updateError) {
            results.errors.push(`Failed to cancel missing restaurant subscription ${dbSub.id}: ${updateError.message}`);
          } else {
            results.fixed++;
            console.log(`✅ [RECONCILE] Cancelled missing restaurant subscription ${dbSub.id}`);
          }
        } else {
          results.errors.push(`Error checking restaurant subscription ${dbSub.stripe_subscription_id}: ${stripeError.message}`);
        }
      }
    }

    // ===== TOUR OPERATOR SUBSCRIPTIONS =====
    const { data: dbTourSubs, error: dbTourError } = await supabase
      .from('tour_operator_subscriptions')
      .select('id, stripe_subscription_id, status, operator_name, user_id')
      .in('status', ['active', 'pending']);

    if (dbTourError) {
      console.error(`Database query failed for tour subscriptions: ${dbTourError.message}`);
      results.errors.push(`Tour subscriptions query failed: ${dbTourError.message}`);
    } else {
      results.checked += dbTourSubs?.length || 0;

      for (const dbSub of dbTourSubs || []) {
        if (!dbSub.stripe_subscription_id) {
          continue;
        }

        try {
          const stripeSub = await stripe.subscriptions.retrieve(dbSub.stripe_subscription_id);

          if (stripeSub.status === 'active' && dbSub.status !== 'active') {
            console.log(`🔧 [RECONCILE] Fixing tour subscription ${dbSub.id}: Stripe=active, DB=${dbSub.status}`);
            
            const { error: updateError } = await supabase
              .from('tour_operator_subscriptions')
              .update({ status: 'active' })
              .eq('id', dbSub.id);

            if (updateError) {
              results.errors.push(`Failed to fix tour subscription ${dbSub.id}: ${updateError.message}`);
            } else {
              results.fixed++;
              console.log(`✅ [RECONCILE] Fixed tour subscription ${dbSub.id}`);
            }
          } else if ((stripeSub.status === 'canceled' || stripeSub.status === 'unpaid') && dbSub.status === 'active') {
            console.log(`🔧 [RECONCILE] Fixing tour subscription ${dbSub.id}: Stripe=${stripeSub.status}, DB=active`);
            
            const { error: updateError } = await supabase
              .from('tour_operator_subscriptions')
              .update({ status: 'cancelled' })
              .eq('id', dbSub.id);

            if (updateError) {
              results.errors.push(`Failed to fix tour subscription ${dbSub.id}: ${updateError.message}`);
            } else {
              results.fixed++;
              console.log(`✅ [RECONCILE] Fixed tour subscription ${dbSub.id}`);
            }
          }
        } catch (stripeError) {
          if (stripeError.code === 'resource_missing') {
            console.log(`🔧 [RECONCILE] Tour subscription ${dbSub.stripe_subscription_id} not found in Stripe, marking as cancelled`);
            
            const { error: updateError } = await supabase
              .from('tour_operator_subscriptions')
              .update({ status: 'cancelled' })
              .eq('id', dbSub.id);

            if (updateError) {
              results.errors.push(`Failed to cancel missing tour subscription ${dbSub.id}: ${updateError.message}`);
            } else {
              results.fixed++;
              console.log(`✅ [RECONCILE] Cancelled missing tour subscription ${dbSub.id}`);
            }
          } else {
            results.errors.push(`Error checking tour subscription ${dbSub.stripe_subscription_id}: ${stripeError.message}`);
          }
        }
      }
    }

    // ===== PROMOTED RESTAURANTS =====
    const { data: dbPromotedRestaurants, error: dbPromotedRestaurantError } = await supabase
      .from('promoted_restaurants')
      .select('id, stripe_subscription_id, status, restaurant_id, restaurant_name')
      .in('status', ['active', 'pending']);

    if (dbPromotedRestaurantError) {
      console.error(`Database query failed for promoted restaurants: ${dbPromotedRestaurantError.message}`);
      results.errors.push(`Promoted restaurants query failed: ${dbPromotedRestaurantError.message}`);
    } else {
      results.checked += dbPromotedRestaurants?.length || 0;

      for (const dbPromo of dbPromotedRestaurants || []) {
        if (!dbPromo.stripe_subscription_id) {
          continue;
        }

        try {
          const stripeSub = await stripe.subscriptions.retrieve(dbPromo.stripe_subscription_id);

          if (stripeSub.status === 'active' && dbPromo.status !== 'active') {
            console.log(`🔧 [RECONCILE] Fixing promoted restaurant ${dbPromo.id}: Stripe=active, DB=${dbPromo.status}`);
            
            const { error: updateError } = await supabase
              .from('promoted_restaurants')
              .update({ status: 'active' })
              .eq('id', dbPromo.id);

            if (updateError) {
              results.errors.push(`Failed to fix promoted restaurant ${dbPromo.id}: ${updateError.message}`);
            } else {
              results.fixed++;
              console.log(`✅ [RECONCILE] Fixed promoted restaurant ${dbPromo.id}`);
            }
          } else if ((stripeSub.status === 'canceled' || stripeSub.status === 'unpaid') && dbPromo.status === 'active') {
            console.log(`🔧 [RECONCILE] Fixing promoted restaurant ${dbPromo.id}: Stripe=${stripeSub.status}, DB=active`);
            
            const { error: updateError } = await supabase
              .from('promoted_restaurants')
              .update({ status: 'cancelled', cancelled_at: new Date().toISOString() })
              .eq('id', dbPromo.id);

            if (updateError) {
              results.errors.push(`Failed to fix promoted restaurant ${dbPromo.id}: ${updateError.message}`);
            } else {
              results.fixed++;
              console.log(`✅ [RECONCILE] Fixed promoted restaurant ${dbPromo.id}`);
            }
          }
        } catch (stripeError) {
          if (stripeError.code === 'resource_missing') {
            console.log(`🔧 [RECONCILE] Promoted restaurant ${dbPromo.stripe_subscription_id} not found in Stripe, marking as cancelled`);
            
            const { error: updateError } = await supabase
              .from('promoted_restaurants')
              .update({ status: 'cancelled', cancelled_at: new Date().toISOString() })
              .eq('id', dbPromo.id);

            if (updateError) {
              results.errors.push(`Failed to cancel missing promoted restaurant ${dbPromo.id}: ${updateError.message}`);
            } else {
              results.fixed++;
              console.log(`✅ [RECONCILE] Cancelled missing promoted restaurant ${dbPromo.id}`);
            }
          } else {
            results.errors.push(`Error checking promoted restaurant ${dbPromo.stripe_subscription_id}: ${stripeError.message}`);
          }
        }
      }
    }

    // ===== PROMOTED TOURS =====
    const { data: dbPromotedTours, error: dbPromotedTourError } = await supabase
      .from('promoted_tours')
      .select('id, stripe_subscription_id, status, product_id, tour_name')
      .in('status', ['active', 'pending']);

    if (dbPromotedTourError) {
      console.error(`Database query failed for promoted tours: ${dbPromotedTourError.message}`);
      results.errors.push(`Promoted tours query failed: ${dbPromotedTourError.message}`);
    } else {
      results.checked += dbPromotedTours?.length || 0;

      for (const dbPromo of dbPromotedTours || []) {
        if (!dbPromo.stripe_subscription_id) {
          continue;
        }

        try {
          const stripeSub = await stripe.subscriptions.retrieve(dbPromo.stripe_subscription_id);

          if (stripeSub.status === 'active' && dbPromo.status !== 'active') {
            console.log(`🔧 [RECONCILE] Fixing promoted tour ${dbPromo.id}: Stripe=active, DB=${dbPromo.status}`);
            
            const { error: updateError } = await supabase
              .from('promoted_tours')
              .update({ status: 'active' })
              .eq('id', dbPromo.id);

            if (updateError) {
              results.errors.push(`Failed to fix promoted tour ${dbPromo.id}: ${updateError.message}`);
            } else {
              results.fixed++;
              console.log(`✅ [RECONCILE] Fixed promoted tour ${dbPromo.id}`);
            }
          } else if ((stripeSub.status === 'canceled' || stripeSub.status === 'unpaid') && dbPromo.status === 'active') {
            console.log(`🔧 [RECONCILE] Fixing promoted tour ${dbPromo.id}: Stripe=${stripeSub.status}, DB=active`);
            
            const { error: updateError } = await supabase
              .from('promoted_tours')
              .update({ status: 'cancelled', cancelled_at: new Date().toISOString() })
              .eq('id', dbPromo.id);

            if (updateError) {
              results.errors.push(`Failed to fix promoted tour ${dbPromo.id}: ${updateError.message}`);
            } else {
              results.fixed++;
              console.log(`✅ [RECONCILE] Fixed promoted tour ${dbPromo.id}`);
            }
          }
        } catch (stripeError) {
          if (stripeError.code === 'resource_missing') {
            console.log(`🔧 [RECONCILE] Promoted tour ${dbPromo.stripe_subscription_id} not found in Stripe, marking as cancelled`);
            
            const { error: updateError } = await supabase
              .from('promoted_tours')
              .update({ status: 'cancelled', cancelled_at: new Date().toISOString() })
              .eq('id', dbPromo.id);

            if (updateError) {
              results.errors.push(`Failed to cancel missing promoted tour ${dbPromo.id}: ${updateError.message}`);
            } else {
              results.fixed++;
              console.log(`✅ [RECONCILE] Cancelled missing promoted tour ${dbPromo.id}`);
            }
          } else {
            results.errors.push(`Error checking promoted tour ${dbPromo.stripe_subscription_id}: ${stripeError.message}`);
          }
        }
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Reconciliation completed',
      results,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('❌ [RECONCILE] Critical error during reconciliation:', error);
    return NextResponse.json(
      {
        success: false,
        error: error.message,
        results,
      },
      { status: 500 }
    );
  }
}

