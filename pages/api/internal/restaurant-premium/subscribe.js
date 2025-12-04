/**
 * API Route: Subscribe a restaurant to premium visibility
 * POST /api/internal/restaurant-premium/subscribe
 * 
 * Body: {
 *   restaurantId: number,
 *   destinationId: string,
 *   restaurantSlug: string,
 *   restaurantName: string,
 *   planType: 'monthly' | 'yearly',
 *   layoutPreset: 'ocean' | 'sunset' | 'twilight',
 *   colorScheme: 'blue' | 'coral' | 'teal',
 *   heroCTAIndex: number,
 *   midCTAIndex: number,
 *   endCTAIndex: number,
 *   stickyCTAIndex: number,
 *   email: string (optional)
 * }
 * 
 * Creates a Stripe checkout session for restaurant premium subscription
 */

import { createSupabaseServiceRoleClient } from '@/lib/supabaseClient';
import { stripe } from '@/lib/stripe';
import { 
  RESTAURANT_PREMIUM_PRICING, 
  LAYOUT_PRESETS, 
  COLOR_SCHEMES, 
  CTA_OPTIONS,
  RESTAURANT_STRIPE_PRICE_IDS 
} from '@/lib/restaurantPremium';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Check if Stripe is configured
    if (!process.env.STRIPE_SECRET_KEY) {
      console.error('STRIPE_SECRET_KEY is not set');
      return res.status(500).json({
        error: 'Stripe is not configured'
      });
    }

    const {
      restaurantId,
      destinationId,
      restaurantSlug,
      restaurantName,
      planType = 'monthly',
      layoutPreset = 'ocean',
      colorScheme = 'blue',
      heroCTAIndex = 0,
      midCTAIndex = 0,
      endCTAIndex = 0,
      stickyCTAIndex = 0,
      email,
    } = req.body;

    // Validate required fields
    if (!restaurantId || !destinationId || !restaurantSlug) {
      return res.status(400).json({
        error: 'Missing required fields: restaurantId, destinationId, restaurantSlug'
      });
    }

    // Validate plan type
    if (!['monthly', 'yearly'].includes(planType)) {
      return res.status(400).json({
        error: 'Invalid plan type. Must be "monthly" or "yearly"'
      });
    }

    // Validate layout preset
    if (!LAYOUT_PRESETS[layoutPreset]) {
      return res.status(400).json({
        error: 'Invalid layout preset'
      });
    }

    // Validate color scheme
    if (!COLOR_SCHEMES[colorScheme]) {
      return res.status(400).json({
        error: 'Invalid color scheme'
      });
    }

    // Validate CTA indexes
    if (heroCTAIndex < 0 || heroCTAIndex >= CTA_OPTIONS.hero.length) {
      return res.status(400).json({ error: 'Invalid hero CTA index' });
    }
    if (midCTAIndex < 0 || midCTAIndex >= CTA_OPTIONS.mid.length) {
      return res.status(400).json({ error: 'Invalid mid CTA index' });
    }
    if (endCTAIndex < 0 || endCTAIndex >= CTA_OPTIONS.end.length) {
      return res.status(400).json({ error: 'Invalid end CTA index' });
    }
    if (stickyCTAIndex < 0 || stickyCTAIndex >= CTA_OPTIONS.sticky.length) {
      return res.status(400).json({ error: 'Invalid sticky CTA index' });
    }

    // Get the price ID
    const priceId = RESTAURANT_STRIPE_PRICE_IDS[planType];
    if (!priceId) {
      console.error(`Restaurant premium price ID not found for plan: ${planType}`);
      return res.status(500).json({
        error: `Stripe price ID not configured for restaurant premium ${planType} plan. Please set STRIPE_RESTAURANT_PREMIUM_${planType.toUpperCase()}_PRICE_ID in environment variables.`
      });
    }

    const supabase = createSupabaseServiceRoleClient();

    // Check if restaurant already has a subscription
    const { data: existingSubscription } = await supabase
      .from('restaurant_premium_subscriptions')
      .select('*')
      .eq('restaurant_id', restaurantId)
      .eq('destination_id', destinationId)
      .single();

    let customerId = existingSubscription?.stripe_customer_id;

    // Create or get Stripe customer
    if (!customerId) {
      const customer = await stripe.customers.create({
        email: email || undefined,
        metadata: {
          type: 'restaurant_premium',
          restaurantId: String(restaurantId),
          destinationId: destinationId,
          restaurantSlug: restaurantSlug,
          restaurantName: restaurantName || '',
        },
      });
      customerId = customer.id;
    }

    // Verify price exists in Stripe
    try {
      const price = await stripe.prices.retrieve(priceId);
      console.log(`Restaurant premium price verified: ${price.id} for ${planType} plan`);
    } catch (priceError) {
      console.error(`Price ID ${priceId} not found in Stripe:`, priceError);
      return res.status(500).json({
        error: `Price ID "${priceId}" not found in Stripe. Please verify the price ID is correct.`
      });
    }

    // Create checkout session
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      mode: 'subscription',
      payment_method_types: ['card', 'ideal', 'bancontact'], // Common EU payment methods
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      metadata: {
        type: 'restaurant_premium',
        restaurantId: String(restaurantId),
        destinationId: destinationId,
        restaurantSlug: restaurantSlug,
        restaurantName: restaurantName || '',
        planType: planType,
        layoutPreset: layoutPreset,
        colorScheme: colorScheme,
        heroCTAIndex: String(heroCTAIndex),
        midCTAIndex: String(midCTAIndex),
        endCTAIndex: String(endCTAIndex),
        stickyCTAIndex: String(stickyCTAIndex),
      },
      subscription_data: {
        metadata: {
          type: 'restaurant_premium',
          restaurantId: String(restaurantId),
          destinationId: destinationId,
          restaurantSlug: restaurantSlug,
          restaurantName: restaurantName || '',
          planType: planType,
          layoutPreset: layoutPreset,
          colorScheme: colorScheme,
          heroCTAIndex: String(heroCTAIndex),
          midCTAIndex: String(midCTAIndex),
          endCTAIndex: String(endCTAIndex),
          stickyCTAIndex: String(stickyCTAIndex),
        },
      },
      success_url: `${process.env.NEXT_PUBLIC_APP_URL || 'https://toptours.ai'}/destinations/${destinationId}/restaurants/${restaurantSlug}?premium=success`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL || 'https://toptours.ai'}/destinations/${destinationId}/restaurants/${restaurantSlug}?premium=cancelled`,
      allow_promotion_codes: true,
    });

    // Upsert the subscription record (will be activated by webhook)
    const { error: upsertError } = await supabase
      .from('restaurant_premium_subscriptions')
      .upsert({
        restaurant_id: restaurantId,
        destination_id: destinationId,
        restaurant_slug: restaurantSlug,
        restaurant_name: restaurantName || null,
        stripe_customer_id: customerId,
        plan_type: planType,
        status: 'pending', // Will be set to 'active' by webhook
        layout_preset: layoutPreset,
        color_scheme: colorScheme,
        hero_cta_index: heroCTAIndex,
        mid_cta_index: midCTAIndex,
        end_cta_index: endCTAIndex,
        sticky_cta_index: stickyCTAIndex,
        purchaser_email: email || null,
      }, {
        onConflict: 'restaurant_id,destination_id',
      });

    if (upsertError) {
      console.error('Error upserting restaurant premium subscription:', upsertError);
      // Don't fail - the webhook will handle creating the record if needed
    }

    return res.status(200).json({
      success: true,
      checkoutUrl: session.url,
      sessionId: session.id,
    });
  } catch (error) {
    console.error('Error in restaurant-premium/subscribe:', error);
    return res.status(500).json({
      error: error.message || 'Failed to create subscription checkout'
    });
  }
}

