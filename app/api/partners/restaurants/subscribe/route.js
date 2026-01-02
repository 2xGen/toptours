import { NextResponse } from 'next/server';
import { createSupabaseServiceRoleClient } from '@/lib/supabaseClient';
import { stripe, STRIPE_PRICE_IDS } from '@/lib/stripe';
import { normalizeDestinationIdToSlug } from '@/lib/destinationIdHelper';

/**
 * POST /api/partners/restaurants/subscribe
 * Creates a restaurant premium and/or promoted listing subscription
 */
export async function POST(request) {
  try {
    const body = await request.json();
    const {
      userId,
      email,
      restaurantId,
      destinationId,
      restaurantSlug,
      restaurantName,
      isPremiumSelected,
      premiumBillingCycle, // 'monthly' or 'annual'
      isPromotedSelected,
      promotedBillingCycle, // 'monthly' or 'annual' or null
    } = body;
    
    // Require authentication
    if (!userId || !email) {
      return NextResponse.json(
        { error: 'Authentication required. Please sign in to continue.' },
        { status: 401 }
      );
    }
    
    // Require premium plan (promotion is optional)
    if (!isPremiumSelected) {
      return NextResponse.json(
        { error: 'Please select a Restaurant Premium plan to continue.' },
        { status: 400 }
      );
    }
    
    // Validate restaurant data
    if (!restaurantId || !restaurantSlug || !restaurantName) {
      return NextResponse.json(
        { error: 'Missing restaurant information. Please select a restaurant.' },
        { status: 400 }
      );
    }
    
    const supabase = createSupabaseServiceRoleClient();
    
    // Verify restaurant exists
    // Note: restaurants.destination_id is stored as a slug (e.g., "auckland"), not UUID
    // So we lookup by restaurant id only, then verify the destination_id matches the slug
    let { data: restaurant, error: restaurantError } = await supabase
      .from('restaurants')
      .select('id, name, slug, destination_id')
      .eq('id', restaurantId)
      .single();
    
    if (restaurantError || !restaurant) {
      console.error(`[Restaurant Subscribe] Restaurant not found. ID: ${restaurantId}, Error:`, restaurantError);
      return NextResponse.json(
        { 
          error: 'Restaurant not found. Please verify your selection.',
          details: `Restaurant ID: ${restaurantId}, Error: ${restaurantError?.message || 'Unknown error'}`
        },
        { status: 400 }
      );
    }
    
    // Normalize destination_id to slug format (needed for all records)
    // Do this early so we can use it for validation and all database operations
    const destinationSlug = await normalizeDestinationIdToSlug(destinationId || restaurant.destination_id);
    
    // Verify destination matches (restaurants.destination_id is a slug)
    if (restaurant.destination_id !== destinationSlug) {
      console.warn(`[Restaurant Subscribe] Destination mismatch. Restaurant destination_id: ${restaurant.destination_id}, Normalized slug: ${destinationSlug}`);
      // Don't fail - just log a warning, as the restaurant ID is the primary identifier
    }
    
    // Get or create Stripe customer
    // Check existing restaurant subscriptions for this user to get Stripe customer ID
    let { data: existingSub } = await supabase
      .from('restaurant_subscriptions')
      .select('stripe_customer_id')
      .eq('user_id', userId)
      .not('stripe_customer_id', 'is', null)
      .maybeSingle();
    
    let customerId = existingSub?.stripe_customer_id;
    let customerExists = false;
    
    // Verify customer exists in Stripe if we have a customer ID
    if (customerId) {
      try {
        await stripe.customers.retrieve(customerId);
        customerExists = true;
      } catch (error) {
        console.warn(`Customer ${customerId} not found in Stripe, will create new customer`);
        customerId = null;
      }
    }
    
    if (!customerId || !customerExists) {
      // Create Stripe customer
      try {
        const customer = await stripe.customers.create({
          email: email,
          metadata: {
            userId: userId,
          },
        });
        customerId = customer.id;
        
        // Note: stripe_customer_id will be saved in restaurant_subscriptions when the subscription is created
        // No need to save to a separate table
      } catch (stripeError) {
        console.error('Error creating Stripe customer:', stripeError);
        return NextResponse.json(
          { error: 'Failed to create Stripe customer. Please try again.' },
          { status: 500 }
        );
      }
    }
    
    // Build line items
    const lineItems = [];
    
    // Add premium subscription (required)
    if (isPremiumSelected && premiumBillingCycle) {
      const premiumPriceIdKey = `restaurant_premium_${premiumBillingCycle === 'annual' ? 'yearly' : 'monthly'}`;
      const premiumPriceId = STRIPE_PRICE_IDS[premiumPriceIdKey];
      
      if (!premiumPriceId) {
        console.error(`Price ID not found for ${premiumPriceIdKey}`);
        return NextResponse.json({
          error: `Stripe price ID not configured for restaurant premium. Please add STRIPE_RESTAURANT_PREMIUM_${premiumBillingCycle.toUpperCase()}_PRICE_ID to your .env.local file.`,
        }, { status: 500 });
      }
      
      lineItems.push({
        price: premiumPriceId,
        quantity: 1,
      });
    }
    
    // Add promoted listing if selected (optional)
    if (isPromotedSelected && promotedBillingCycle) {
      const promotedPriceIdKey = `promoted_listing_${promotedBillingCycle}`;
      const promotedPriceId = STRIPE_PRICE_IDS[promotedPriceIdKey];
      
      if (!promotedPriceId) {
        console.error(`Price ID not found for ${promotedPriceIdKey}`);
        return NextResponse.json({
          error: `Stripe price ID not configured for promoted listings. Please add STRIPE_PROMOTED_LISTING_${promotedBillingCycle.toUpperCase()}_PRICE_ID to your .env.local file.`,
        }, { status: 500 });
      }
      
      lineItems.push({
        price: promotedPriceId,
        quantity: 1,
      });
    }
    
    if (lineItems.length === 0) {
      return NextResponse.json(
        { error: 'No valid plans selected.' },
        { status: 400 }
      );
    }
    
    // Create pending promotion record if promotion is selected
    // This allows tracking of pending promotions even before payment
    if (isPromotedSelected && promotedBillingCycle) {
      console.log(`📝 Creating pending promotion record for restaurant ${restaurantId}...`);
      
      // Check if a pending or active promotion already exists
      const { data: existingActive } = await supabase
        .from('promoted_restaurants')
        .select('id, status')
        .eq('restaurant_id', restaurantId)
        .eq('status', 'active')
        .maybeSingle();
      
      if (existingActive) {
        return NextResponse.json({
          error: 'This restaurant already has an active promotion.',
        }, { status: 400 });
      }
      
      // Check if a pending promotion exists (we'll update it)
      const { data: existingPending } = await supabase
        .from('promoted_restaurants')
        .select('id, status')
        .eq('restaurant_id', restaurantId)
        .eq('status', 'pending')
        .maybeSingle();
      
      if (existingPending) {
        // Update existing pending record (allows retry of failed checkout)
        const { error: updateError } = await supabase
          .from('promoted_restaurants')
          .update({
            user_id: userId, // Ensure user_id is set
            email: email, // Save email for easy reference
            promotion_plan: promotedBillingCycle,
            requested_at: new Date().toISOString(),
            stripe_subscription_id: null, // Reset in case of retry
            start_date: null,
            end_date: null,
            cancelled_at: null,
            destination_id: destinationSlug, // Always store as slug
            restaurant_slug: restaurantSlug || restaurant.slug,
            restaurant_name: restaurantName || restaurant.name,
          })
          .eq('id', existingPending.id);
        
        if (updateError) {
          console.error(`❌ Error updating pending promotion:`, updateError);
          // Don't fail - just log, continue with checkout
        } else {
          console.log(`✅ Updated pending promotion record (ID: ${existingPending.id})`);
        }
      } else {
        // Create new pending record (restaurant_subscription_id will be set by webhook after subscription is created)
        const { data: newRecord, error: insertError } = await supabase
          .from('promoted_restaurants')
          .insert({
            restaurant_id: restaurantId,
            user_id: userId, // Direct link to user for reliable querying
            email: email, // Save email for easy reference
            restaurant_subscription_id: null, // Will be set by webhook after subscription is created
            stripe_subscription_id: null, // Will be set by webhook
            promotion_plan: promotedBillingCycle,
            status: 'pending',
            requested_at: new Date().toISOString(),
            start_date: null, // Will be set by webhook when payment confirmed
            end_date: null, // Will be set by webhook when payment confirmed
            destination_id: destinationSlug, // Always store as slug
            restaurant_slug: restaurantSlug || restaurant.slug,
            restaurant_name: restaurantName || restaurant.name,
          })
          .select('id')
          .single();
        
        if (insertError) {
          console.error(`❌ Error creating pending promotion:`, insertError);
          // Don't fail - just log, continue with checkout
          // The webhook can create it if needed
        } else {
          console.log(`✅ Created pending promotion record (ID: ${newRecord.id})`);
        }
      }
    }
    
    // ALWAYS create pending restaurant_subscriptions record (like promoted_restaurants)
    // This ensures we have a record BEFORE Stripe checkout, regardless of what was selected
    console.log(`📝 Creating pending restaurant subscription record for restaurant ${restaurantId}...`);
    
    // Check if a pending or active subscription already exists
    const { data: existingActive } = await supabase
      .from('restaurant_subscriptions')
      .select('id, status')
      .eq('restaurant_id', restaurantId)
      .eq('user_id', userId)
      .eq('status', 'active')
      .maybeSingle();
    
    if (existingActive) {
      // Update existing active subscription instead of creating new one
      const { error: updateError } = await supabase
        .from('restaurant_subscriptions')
        .update({
          restaurant_premium_plan: isPremiumSelected && premiumBillingCycle ? premiumBillingCycle : existingActive.restaurant_premium_plan,
          promoted_listing_plan: isPromotedSelected && promotedBillingCycle ? promotedBillingCycle : existingActive.promoted_listing_plan,
          // Customization settings from request body
          color_scheme: body.colorScheme || 'blue',
          hero_cta_index: body.heroCTAIndex || 0,
          mid_cta_index: body.midCTAIndex || 0,
          end_cta_index: body.midCTAIndex || 0, // End uses same as mid
          sticky_cta_index: body.stickyCTAIndex || 0,
        })
        .eq('id', existingActive.id);
      
      if (updateError) {
        console.error(`❌ Error updating existing subscription:`, updateError);
      } else {
        console.log(`✅ Updated existing subscription record (ID: ${existingActive.id})`);
      }
    } else {
      // Check if a pending subscription exists (we'll update it)
      const { data: existingPending } = await supabase
        .from('restaurant_subscriptions')
        .select('id, status')
        .eq('restaurant_id', restaurantId)
        .eq('user_id', userId)
        .eq('status', 'pending')
        .maybeSingle();
      
      if (existingPending) {
        // Update existing pending record (allows retry of failed checkout)
        const updateData = {
          user_id: userId, // Ensure user_id is set
          email: email, // Save email for easy reference
          destination_id: destinationSlug,
          restaurant_slug: restaurantSlug || restaurant.slug,
          restaurant_name: restaurantName || restaurant.name,
          // Customization settings from request body
          color_scheme: body.colorScheme || 'blue',
          hero_cta_index: body.heroCTAIndex || 0,
          mid_cta_index: body.midCTAIndex || 0,
          end_cta_index: body.midCTAIndex || 0, // End uses same as mid
          sticky_cta_index: body.stickyCTAIndex || 0,
          stripe_subscription_id: null, // Reset in case of retry
        };
        
        // Only update plans if they're provided
        if (isPremiumSelected && premiumBillingCycle) {
          updateData.restaurant_premium_plan = premiumBillingCycle;
        }
        if (isPromotedSelected && promotedBillingCycle) {
          updateData.promoted_listing_plan = promotedBillingCycle;
        }
        
        const { error: updateError } = await supabase
          .from('restaurant_subscriptions')
          .update(updateData)
          .eq('id', existingPending.id);
        
        if (updateError) {
          console.error(`❌ Error updating pending subscription:`, updateError);
        } else {
          console.log(`✅ Updated pending subscription record (ID: ${existingPending.id})`);
        }
      } else {
        // Create new pending record (ALWAYS create, regardless of what was selected)
        const insertData = {
          user_id: userId, // Direct link to user for reliable querying
          email: email, // Save email for easy reference
          restaurant_id: restaurantId,
          destination_id: destinationSlug,
          restaurant_slug: restaurantSlug || restaurant.slug,
          restaurant_name: restaurantName || restaurant.name,
          stripe_subscription_id: null, // Will be set by webhook
          stripe_customer_id: null, // Will be set by webhook
          status: 'pending', // Pending until payment confirmed
          current_period_start: null, // Will be set by webhook
          current_period_end: null, // Will be set by webhook
          // Customization settings from request body
          color_scheme: body.colorScheme || 'blue',
          hero_cta_index: body.heroCTAIndex || 0,
          mid_cta_index: body.midCTAIndex || 0,
          end_cta_index: body.midCTAIndex || 0, // End uses same as mid
          sticky_cta_index: body.stickyCTAIndex || 0,
        };
        
        // Only set plans if they're provided
        if (isPremiumSelected && premiumBillingCycle) {
          insertData.restaurant_premium_plan = premiumBillingCycle;
        } else {
          insertData.restaurant_premium_plan = null; // Explicitly set to null if not selected
        }
        
        if (isPromotedSelected && promotedBillingCycle) {
          insertData.promoted_listing_plan = promotedBillingCycle;
        } else {
          insertData.promoted_listing_plan = null; // Explicitly set to null if not selected
        }
        
        const { data: newRecord, error: insertError } = await supabase
          .from('restaurant_subscriptions')
          .insert(insertData)
          .select('id')
          .single();
        
        if (insertError) {
          console.error(`❌ Error creating pending subscription:`, insertError);
          // Don't fail - just log, continue with checkout
          // The webhook can create it if needed
        } else {
          console.log(`✅ Created pending subscription record (ID: ${newRecord.id})`);
        }
      }
    }
    
    // ALSO create pending restaurant_premium_subscriptions record if premium is selected
    // This ensures backward compatibility and matches the promoted_restaurants pattern
    if (isPremiumSelected && premiumBillingCycle) {
      console.log(`📝 Creating pending restaurant_premium_subscriptions record for restaurant ${restaurantId}...`);
      
      const { data: existingPremiumPending } = await supabase
        .from('restaurant_premium_subscriptions')
        .select('id, status')
        .eq('restaurant_id', restaurantId)
        .eq('destination_id', destinationSlug)
        .eq('status', 'pending')
        .maybeSingle();
      
      if (existingPremiumPending) {
        // Update existing pending record
        const { error: updateError } = await supabase
          .from('restaurant_premium_subscriptions')
          .update({
            user_id: userId,
            purchaser_email: email,
            restaurant_slug: restaurantSlug || restaurant.slug,
            restaurant_name: restaurantName || restaurant.name,
            plan_type: premiumBillingCycle === 'annual' ? 'yearly' : 'monthly',
            layout_preset: 'ocean',
            color_scheme: body.colorScheme || 'blue',
            hero_cta_index: body.heroCTAIndex || 0,
            mid_cta_index: body.midCTAIndex || 0,
            end_cta_index: body.midCTAIndex || 0,
            sticky_cta_index: body.stickyCTAIndex || 0,
            stripe_subscription_id: null, // Reset in case of retry
          })
          .eq('id', existingPremiumPending.id);
        
        if (updateError) {
          console.error(`❌ Error updating pending premium subscription:`, updateError);
        } else {
          console.log(`✅ Updated pending premium subscription record (ID: ${existingPremiumPending.id})`);
        }
      } else {
        // Create new pending record
        const { data: newPremiumRecord, error: insertError } = await supabase
          .from('restaurant_premium_subscriptions')
          .insert({
            restaurant_id: restaurantId,
            destination_id: destinationSlug,
            restaurant_slug: restaurantSlug || restaurant.slug,
            restaurant_name: restaurantName || restaurant.name,
            stripe_subscription_id: null, // Will be set by webhook
            stripe_customer_id: null, // Will be set by webhook
            stripe_price_id: null, // Will be set by webhook
            plan_type: premiumBillingCycle === 'annual' ? 'yearly' : 'monthly',
            status: 'pending', // Pending until payment confirmed
            current_period_start: null, // Will be set by webhook
            current_period_end: null, // Will be set by webhook
            layout_preset: 'ocean',
            color_scheme: body.colorScheme || 'blue',
            hero_cta_index: body.heroCTAIndex || 0,
            mid_cta_index: body.midCTAIndex || 0,
            end_cta_index: body.midCTAIndex || 0,
            sticky_cta_index: body.stickyCTAIndex || 0,
            pending_website: null,
            website_review_status: null,
            user_id: userId,
            purchaser_email: email,
          })
          .select('id')
          .single();
        
        if (insertError) {
          console.error(`❌ Error creating pending premium subscription:`, insertError);
          // Don't fail - just log, continue with checkout
        } else {
          console.log(`✅ Created pending premium subscription record (ID: ${newPremiumRecord.id})`);
        }
      }
    }
    
    // Create Stripe checkout session
    let session;
    try {
      session = await stripe.checkout.sessions.create({
        customer: customerId,
        mode: 'subscription',
        payment_method_types: ['card'],
        line_items: lineItems,
        metadata: {
          type: 'restaurant_subscription',
          userId: userId,
          restaurantId: restaurantId.toString(),
          destinationId: destinationId,
          restaurantSlug: restaurantSlug,
          restaurantName: restaurantName,
          restaurant_premium_plan: isPremiumSelected ? premiumBillingCycle : '',
          promoted_listing_plan: isPromotedSelected ? promotedBillingCycle : '',
          // Customization options
          colorScheme: body.colorScheme || 'blue',
          heroCTAIndex: body.heroCTAIndex?.toString() || '0',
          midCTAIndex: body.midCTAIndex?.toString() || '0',
          stickyCTAIndex: body.stickyCTAIndex?.toString() || '0',
        },
        success_url: `${process.env.NEXT_PUBLIC_SITE_URL || 'https://toptours.ai'}/partners/restaurants?success=true&session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${process.env.NEXT_PUBLIC_SITE_URL || 'https://toptours.ai'}/partners/restaurants?canceled=true`,
      });
      
      if (!session || !session.url) {
        throw new Error('Stripe checkout session was created but no URL was returned');
      }
    } catch (stripeError) {
      console.error('Stripe checkout session creation error:', stripeError);
      return NextResponse.json({
        error: `Failed to create Stripe checkout session: ${stripeError.message || 'Unknown error'}. Please check your Stripe configuration.`,
      }, { status: 500 });
    }
    
    return NextResponse.json({
      success: true,
      checkoutUrl: session.url,
    });
    
  } catch (error) {
    const errorMsg = error?.message || 'Internal server error';
    console.error('[Restaurant Subscribe] Error:', errorMsg);
    
    return NextResponse.json(
      { 
        error: errorMsg,
        ...(process.env.NODE_ENV === 'development' && error?.stack ? { stack: error.stack } : {})
      },
      { status: 500 }
    );
  }
}

