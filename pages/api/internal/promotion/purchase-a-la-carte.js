/**
 * API Route: Purchase a la carte points for a specific tour
 * POST /api/internal/promotion/purchase-a-la-carte
 * 
 * Body: { 
 *   productId: string,
 *   packageName: '1000_points' | '3000_points' | '5000_points',
 *   userId: string,
 *   tourData: object (optional, to avoid extra API call)
 * }
 * 
 * Creates a Stripe checkout session for one-time payment
 */

import { createSupabaseServiceRoleClient } from '@/lib/supabaseClient';
import { A_LA_CARTE_PACKAGES, updateTourMetadata, updateRestaurantMetadata } from '@/lib/promotionSystem';
import { stripe, STRIPE_PRICE_IDS } from '@/lib/stripe';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Check if Stripe is configured
    if (!process.env.STRIPE_SECRET_KEY) {
      // Only log errors in development to reduce I/O during crawls
      if (process.env.NODE_ENV === 'development') {
        console.error('STRIPE_SECRET_KEY is not set in environment variables');
      }
      return res.status(500).json({
        error: 'Stripe is not configured. Please set STRIPE_SECRET_KEY in environment variables.'
      });
    }

    const { productId, restaurantId, packageName, userId, tourData, restaurantData, returnUrl, type = 'tour' } = req.body;

    // Support both tours (productId) and restaurants (restaurantId)
    const entityId = type === 'restaurant' ? restaurantId : productId;
    
    if (!entityId || !packageName || !userId) {
      return res.status(400).json({
        error: `Missing required fields: ${type === 'restaurant' ? 'restaurantId' : 'productId'}, packageName, userId`
      });
    }

    if (!['1000_points', '3000_points', '5000_points'].includes(packageName)) {
      return res.status(400).json({
        error: 'Invalid package name'
      });
    }

    const packageInfo = A_LA_CARTE_PACKAGES[packageName];
    if (!packageInfo) {
      return res.status(400).json({
        error: 'Package not found'
      });
    }

    const priceId = STRIPE_PRICE_IDS[packageName];
    if (!priceId) {
      // Only log errors in development to reduce I/O during crawls
      if (process.env.NODE_ENV === 'development') {
        console.error(`Price ID not found for package: ${packageName}`);
        console.error('Available price IDs:', Object.keys(STRIPE_PRICE_IDS).map(key => `${key}: ${STRIPE_PRICE_IDS[key] || 'NOT SET'}`));
      }
      return res.status(500).json({
        error: `Stripe price ID not configured for package: ${packageName}. Please set STRIPE_${packageName.toUpperCase()}_PRICE_ID in environment variables.`
      });
    }

    // Get user email from Supabase (try profiles first, then auth.users)
    const supabase = createSupabaseServiceRoleClient();
    let userEmail = null;
    
    // Try to get email from profiles table
    const { data: profile } = await supabase
      .from('profiles')
      .select('email')
      .eq('id', userId)
      .single();

    if (profile?.email) {
      userEmail = profile.email;
    } else {
      // Fallback: try to get from auth.users
      try {
        const { data: { users } } = await supabase.auth.admin.listUsers();
        const user = users?.find(u => u.id === userId);
        if (user?.email) {
          userEmail = user.email;
        }
      } catch (err) {
        // Only log errors in development to reduce I/O during crawls
        if (process.env.NODE_ENV === 'development') {
          console.error('Error fetching user email from auth:', err);
        }
        // Continue without email - Stripe will still work
      }
    }

    // Save metadata immediately if provided (same as regular boosts)
    // This uses the data already available, no API call needed!
    if (type === 'restaurant' && restaurantData) {
      try {
        // Only log in development to reduce I/O during crawls
        if (process.env.NODE_ENV === 'development') {
          console.log(`📦 Attempting to save metadata for restaurant ${restaurantId} with restaurantData:`, {
            hasName: !!restaurantData.name,
            hasImage: !!restaurantData.hero_image_url || !!restaurantData.heroImage,
            hasDestinationId: !!restaurantData.destination_id,
          });
        }
        await updateRestaurantMetadata(parseInt(restaurantId), restaurantData);
        // Only log in development to reduce I/O during crawls
        if (process.env.NODE_ENV === 'development') {
          console.log(`✅ Metadata saved from page data for restaurant ${restaurantId} (instant boost)`);
        }
      } catch (metadataError) {
        // Only log errors in development to reduce I/O during crawls
        if (process.env.NODE_ENV === 'development') {
          console.error(`❌ Error saving restaurant metadata for ${restaurantId}:`, metadataError);
        }
        // Continue even if metadata save fails
      }
    } else if (type === 'tour' && tourData) {
      try {
        // Only log in development to reduce I/O during crawls
        if (process.env.NODE_ENV === 'development') {
          console.log(`📦 Attempting to save metadata for ${productId} with tourData:`, {
            hasTitle: !!(tourData.title || tourData.seo?.title || tourData.productContent?.title),
            hasImages: !!tourData.images,
            hasDestinations: !!tourData.destinations,
            hasDestinationId: !!tourData._destinationId || !!tourData.destinationId,
          });
        }
        await updateTourMetadata(productId, tourData);
        // Only log in development to reduce I/O during crawls
        if (process.env.NODE_ENV === 'development') {
          console.log(`✅ Metadata saved from page data for ${productId} (instant boost)`);
        }
      } catch (metadataError) {
        // Only log errors in development to reduce I/O during crawls
        if (process.env.NODE_ENV === 'development') {
          console.error(`❌ Error saving tour metadata for ${productId}:`, metadataError);
        }
        // Continue even if metadata save fails
      }
    } else {
      // Only log in development to reduce I/O during crawls
      if (process.env.NODE_ENV === 'development') {
        console.log(`⚠️ No ${type}Data provided for ${entityId}, metadata will be fetched from cache/API later`);
      }
    }

    // Get or create Stripe customer
    let { data: account } = await supabase
      .from('promotion_accounts')
      .select('stripe_customer_id')
      .eq('user_id', userId)
      .single();

    let customerId = account?.stripe_customer_id;

    if (!customerId) {
      // Create Stripe customer with email
      const customer = await stripe.customers.create({
        email: userEmail || null,
        metadata: {
          userId: userId,
        },
      });
      customerId = customer.id;

      // Save customer ID to database
      await supabase
        .from('promotion_accounts')
        .upsert({
          user_id: userId,
          stripe_customer_id: customerId,
        }, {
          onConflict: 'user_id',
        });
    }

    // Verify price exists in Stripe before creating checkout
    try {
      const price = await stripe.prices.retrieve(priceId);
      // Only log in development to reduce I/O during crawls
      if (process.env.NODE_ENV === 'development') {
        console.log(`Price verified: ${price.id} for package ${packageName}`);
      }
    } catch (priceError) {
      // Only log errors in development to reduce I/O during crawls
      if (process.env.NODE_ENV === 'development') {
        console.error(`Price ID ${priceId} not found in Stripe:`, priceError);
      }
      return res.status(500).json({
        error: `Price ID "${priceId}" not found in Stripe. Please verify the price ID is correct and exists in your Stripe account (check if you're using test vs live mode).`
      });
    }

    // Create checkout session for one-time payment
    // Only use customer_email if we don't have a customer ID (Stripe doesn't allow both)
    const sessionConfig = {
      mode: 'payment',
      payment_method_types: ['card'],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      metadata: {
        userId: userId,
        [type === 'restaurant' ? 'restaurantId' : 'productId']: entityId,
        type: type, // 'tour' or 'restaurant'
        packageName: packageName,
        points: packageInfo.points.toString(),
        // Only include destinationId if available (for metadata update)
        destinationId: type === 'restaurant' 
          ? (restaurantData?.destination_id || '')
          : (tourData?._destinationId || tourData?.destinationId || ''),
        // Include return URL for redirect after payment
        returnUrl: returnUrl || '',
      },
      success_url: `${process.env.NEXT_PUBLIC_APP_URL || 'https://toptours.ai'}/success?session_id={CHECKOUT_SESSION_ID}${returnUrl ? `&return_url=${encodeURIComponent(returnUrl)}&boost_success=true` : ''}`,
      cancel_url: returnUrl || `${process.env.NEXT_PUBLIC_APP_URL || 'https://toptours.ai'}/cancel`,
    };

    // Only add customer or customer_email, not both
    if (customerId) {
      sessionConfig.customer = customerId;
    } else if (userEmail) {
      sessionConfig.customer_email = userEmail;
    }

    const session = await stripe.checkout.sessions.create(sessionConfig);

    return res.status(200).json({
      success: true,
      checkoutUrl: session.url,
      sessionId: session.id,
      [type === 'restaurant' ? 'restaurantId' : 'productId']: entityId,
      type: type,
      packageName,
      points: packageInfo.points,
      priceCents: packageInfo.priceCents,
    });
  } catch (error) {
    // Only log errors in development to reduce I/O during crawls
    if (process.env.NODE_ENV === 'development') {
      console.error('Error in purchase-a-la-carte endpoint:', error);
      console.error('Error stack:', error.stack);
    }
    return res.status(500).json({
      error: error.message || 'Failed to create purchase session',
      details: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
}


