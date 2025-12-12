import { NextResponse } from 'next/server';
import { createSupabaseServiceRoleClient } from '@/lib/supabaseClient';
import { extractProductIdFromViatorUrl, convertViatorToTopToursUrl, extractProductIdFromTopToursUrl } from '@/utils/tourOperatorHelpers';
import { stripe, STRIPE_PRICE_IDS } from '@/lib/stripe';
import { cookies } from 'next/headers';

/**
 * POST /api/partners/tour-operators/subscribe
 * Creates a tour operator premium subscription
 */
export async function POST(request) {
  try {
    const body = await request.json();
    const {
      userId,
      email,
      tourUrls,
      selectedTourIds,
      tourPackage // e.g., '5-tours-monthly', '5-tours-annual', '15-tours-monthly', '15-tours-annual'
    } = body;
    
    // Require authentication
    if (!userId || !email) {
      return NextResponse.json(
        { error: 'Authentication required. Please sign in to continue.' },
        { status: 401 }
      );
    }
    
    // Parse tourPackage to get tour count and billing cycle
    const packageMatch = tourPackage?.match(/^(\d+)-tours-(monthly|annual)$/);
    if (!packageMatch) {
      return NextResponse.json(
        { error: 'Invalid tour package' },
        { status: 400 }
      );
    }
    
    const tourCount = parseInt(packageMatch[1]);
    const billingCycle = packageMatch[2]; // 'monthly' or 'annual'
    
    if (!selectedTourIds || selectedTourIds.length < 2 || selectedTourIds.length > tourCount) {
      return NextResponse.json(
        { error: `Please select 2-${tourCount} tours` },
        { status: 400 }
      );
    }
    
    const supabase = createSupabaseServiceRoleClient();
    
    // Fetch tour data for selected tours
    const apiKey = process.env.VIATOR_API_KEY || '282a363f-5d60-456a-a6a0-774ec4832b07';
    const tourDataPromises = selectedTourIds.map(async (productId) => {
      try {
        const response = await fetch(
          `https://api.viator.com/partner/products/${productId}?currency=USD`,
          {
            headers: {
              'exp-api-key': apiKey,
              'Accept': 'application/json;version=2.0',
              'Accept-Language': 'en-US',
            }
          }
        );
        
        if (!response.ok) return null;
        return await response.json();
      } catch (error) {
        console.error(`Error fetching tour ${productId}:`, error);
        return null;
      }
    });
    
    const tourDataArray = await Promise.all(tourDataPromises);
    const validTours = tourDataArray.filter(Boolean);
    
    if (validTours.length === 0) {
      return NextResponse.json(
        { error: 'Could not fetch tour data. Please verify your tour URLs.' },
        { status: 400 }
      );
    }
    
    // Verify that all selected tours have matching operator names
    // We only care that tours match each other, not the company name (company could be a marketing agency, etc.)
    let allOperatorsMatch = false;
    let operatorNames = [];
    
    try {
      const { normalizeOperatorName, calculateOperatorMatchScore } = await import('@/utils/tourOperatorHelpers');
      operatorNames = validTours.map(tour => {
        return tour.supplier?.name || 
               tour.supplierName || 
               tour.operator?.name || 
               tour.vendor?.name || 
               '';
      }).filter(name => name); // Filter out empty names
      
      if (operatorNames.length === 0) {
        return NextResponse.json(
          { error: 'Could not find operator names in tour data. Please verify your tour URLs are valid Viator tours.' },
          { status: 400 }
        );
      }
      
      if (operatorNames.length !== validTours.length) {
        return NextResponse.json(
          { error: 'Some tours are missing operator information. Please verify all tour URLs are valid.' },
          { status: 400 }
        );
      }
      
      // Check if all tour operator names match each other (we don't care about company name)
      if (operatorNames.length > 1) {
        const firstNormalized = normalizeOperatorName(operatorNames[0]);
        allOperatorsMatch = operatorNames.slice(1).every(tourOperatorName => {
          const normalizedTourName = normalizeOperatorName(tourOperatorName);
          const matchScore = calculateOperatorMatchScore(firstNormalized, normalizedTourName);
          return matchScore >= 0.8; // 80% threshold for match
        });
      } else {
        // Only one tour, so it matches by default
        allOperatorsMatch = true;
      }
      
      // REJECT if tour operator names don't match each other
      if (!allOperatorsMatch) {
        const uniqueOperators = [...new Set(operatorNames)];
        return NextResponse.json(
          { 
            error: 'Operator names do not match. All selected tours must be from the same operator to be bundled together.',
            details: {
              tourOperators: operatorNames,
              uniqueOperators: uniqueOperators
            }
          },
          { status: 400 }
        );
      }
    } catch (matchError) {
      console.error('Error checking operator name matching:', matchError);
      return NextResponse.json(
        { error: 'Error verifying operator names. Please try again or contact support.' },
        { status: 500 }
      );
    }
    
    // Determine subscription plan string for database
    const subscriptionPlan = `${tourCount}-tours-${billingCycle}`;
    
    // Derive company name from the first tour's operator name (all tours have matching operators at this point)
    const companyName = operatorNames[0] || 'Tour Operator';
    const contactName = 'Tour Operator'; // Default contact name
    
    // Create subscription record (status will be updated by webhook after payment)
    // If all operators match, we'll auto-verify in the webhook
    const { data: subscription, error: subError } = await supabase
      .from('tour_operator_subscriptions')
      .insert({
        operator_name: companyName,
        operator_email: email,
        contact_name: contactName,
        website: null,
        user_id: userId, // Link to authenticated user
        subscription_plan: subscriptionPlan,
        status: 'pending', // Will be updated to 'active' by webhook after payment
        verification_status: 'verified', // All names matched, so verified (we already rejected if they didn't match)
        submitted_tour_urls: tourUrls,
        verified_tour_ids: selectedTourIds,
      })
      .select()
      .single();
    
    if (subError) {
      console.error('Error creating subscription:', subError);
      return NextResponse.json(
        { error: `Failed to create subscription: ${subError.message || JSON.stringify(subError)}` },
        { status: 500 }
      );
    }
    
    // Create operator_tours records
    // Match tours to product IDs by index (since we fetched them in the same order as selectedTourIds)
    const operatorTours = validTours.map((tourData, index) => {
      // Get productId from the selectedTourIds array at the same index
      const productId = selectedTourIds[index] || tourData.productCode;
      
      if (!productId) {
        console.error('Could not find productId for tour at index:', index, tourData);
        return null;
      }
      // Find URL - could be Viator or TopTours
      let viatorUrl = '';
      let toptoursUrl = '';
      
      const matchingUrl = tourUrls.find(url => {
        const urlProductId = extractProductIdFromViatorUrl(url) || extractProductIdFromTopToursUrl(url);
        return urlProductId === productId;
      });
      
      if (matchingUrl) {
        if (matchingUrl.includes('toptours.ai') || matchingUrl.startsWith('/tours/')) {
          toptoursUrl = matchingUrl.startsWith('http') ? matchingUrl : `https://toptours.ai${matchingUrl}`;
        } else {
          viatorUrl = matchingUrl;
          toptoursUrl = convertViatorToTopToursUrl(viatorUrl, tourData.title || '');
        }
      }
      
      return {
        operator_subscription_id: subscription.id,
        product_id: productId,
        viator_url: viatorUrl || null,
        toptours_url: toptoursUrl,
        operator_name: companyName,
        tour_title: tourData.title || tourData.seo?.title || '',
        tour_image_url: tourData.images?.[0]?.variants?.[3]?.url || 
                        tourData.images?.[0]?.variants?.[0]?.url || 
                        null,
        review_count: tourData.reviews?.totalReviews || 0,
        rating: tourData.reviews?.combinedAverageRating || 0,
        is_selected: true,
        is_active: true,
      };
    });
    
    // Filter out any null entries
    const validOperatorTours = operatorTours.filter(tour => tour !== null);
    
    if (validOperatorTours.length > 0) {
      const { error: toursError } = await supabase
        .from('operator_tours')
        .insert(validOperatorTours);
      
      if (toursError) {
        console.error('Error creating operator tours:', toursError);
        // Don't fail - subscription is created, tours can be added later
      }
    } else {
      console.warn('No valid operator tours to insert');
    }
    
    // Get or create Stripe customer
    let { data: account } = await supabase
      .from('promotion_accounts')
      .select('stripe_customer_id')
      .eq('user_id', userId)
      .maybeSingle(); // Use maybeSingle to avoid error if not found
    
    let customerId = account?.stripe_customer_id;
    let customerExists = false;
    
    // Verify customer exists in Stripe if we have a customer ID
    if (customerId) {
      try {
        await stripe.customers.retrieve(customerId);
        customerExists = true;
      } catch (error) {
        // Customer doesn't exist in Stripe, we'll create a new one
        console.warn(`Customer ${customerId} not found in Stripe, will create new customer`);
        customerId = null;
      }
    }
    
    if (!customerId || !customerExists) {
      // Create Stripe customer using email from request
      try {
        const customer = await stripe.customers.create({
          email: email, // Use email from request body
          metadata: {
            userId: userId,
          },
        });
        customerId = customer.id;
        
        // Save customer ID to database
        const { error: upsertError } = await supabase
          .from('promotion_accounts')
          .upsert({
            user_id: userId,
            stripe_customer_id: customerId,
          }, {
            onConflict: 'user_id',
          });
        
        if (upsertError) {
          console.error('Error saving Stripe customer ID:', upsertError);
          // Continue anyway - customer is created in Stripe
        }
      } catch (stripeError) {
        console.error('Error creating Stripe customer:', stripeError);
        return NextResponse.json(
          { error: 'Failed to create Stripe customer. Please try again.' },
          { status: 500 }
        );
      }
    }
    
    // Determine Stripe price ID
    const priceIdKey = `tour_operator_${tourCount}_${billingCycle}`;
    const priceId = STRIPE_PRICE_IDS[priceIdKey];
    
    if (!priceId) {
      const availableKeys = Object.keys(STRIPE_PRICE_IDS).filter(k => k.includes('tour_operator'));
      console.error(`Price ID not found for ${priceIdKey}. Available tour operator keys:`, availableKeys);
      return NextResponse.json({
        error: `Stripe price ID not configured for ${priceIdKey}. Please add STRIPE_TOUR_OPERATOR_${tourCount}_${billingCycle.toUpperCase()}_PRICE_ID to your .env.local file. Available keys: ${availableKeys.join(', ')}`,
      }, { status: 500 });
    }
    
    // Create Stripe checkout session
    let session;
    try {
      session = await stripe.checkout.sessions.create({
        customer: customerId,
        mode: 'subscription',
        payment_method_types: ['card'],
        line_items: [
          {
            price: priceId,
            quantity: 1,
          },
        ],
        metadata: {
          type: 'tour_operator_premium',
          subscriptionId: subscription.id,
          userId: userId,
          operatorName: companyName,
          operatorEmail: email,
          tourCount: tourCount.toString(),
          billingCycle: billingCycle,
          selectedTourIds: selectedTourIds.join(','),
        },
        success_url: `${process.env.NEXT_PUBLIC_SITE_URL || 'https://toptours.ai'}/partners/tour-operators?success=true&session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${process.env.NEXT_PUBLIC_SITE_URL || 'https://toptours.ai'}/partners/tour-operators?canceled=true`,
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
      subscriptionId: subscription.id,
      checkoutUrl: session.url,
    });
    
  } catch (error) {
    // Log error for debugging (server-side only)
    const errorMsg = error?.message || 'Internal server error';
    console.error('[Tour Operator Subscribe] Error:', errorMsg);
    
    // Always return a proper error message
    return NextResponse.json(
      { 
        error: errorMsg,
        ...(process.env.NODE_ENV === 'development' && error?.stack ? { stack: error.stack } : {})
      },
      { status: 500 }
    );
  }
}

