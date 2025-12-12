import { NextResponse } from 'next/server';
import { createSupabaseServiceRoleClient } from '@/lib/supabaseClient';
import { extractProductIdFromViatorUrl, extractProductIdFromTopToursUrl } from '@/utils/tourOperatorHelpers';
import { getCachedTour } from '@/lib/viatorCache';
import { getTourUrl } from '@/utils/tourHelpers';

/**
 * POST /api/internal/tour-operator-premium/add-tour
 * Add a tour to an existing tour operator subscription
 */
export async function POST(request) {
  try {
    const body = await request.json();
    const { subscriptionId, productId, userId } = body;
    
    if (!subscriptionId || !productId || !userId) {
      return NextResponse.json(
        { error: 'Missing required fields: subscriptionId, productId, userId' },
        { status: 400 }
      );
    }
    
    const supabase = createSupabaseServiceRoleClient();
    
    // Verify subscription belongs to user
    const { data: subscription, error: subError } = await supabase
      .from('tour_operator_subscriptions')
      .select('*')
      .eq('id', subscriptionId)
      .eq('user_id', userId)
      .single();
    
    if (subError || !subscription) {
      return NextResponse.json(
        { error: 'Subscription not found or access denied' },
        { status: 404 }
      );
    }
    
    // Check if subscription is active
    if (subscription.status !== 'active') {
      return NextResponse.json(
        { error: 'Subscription must be active to add tours' },
        { status: 400 }
      );
    }
    
    // Check tour limit
    const maxTours = subscription.subscription_plan.includes('5-tours') ? 5 : 15;
    const currentTourCount = subscription.verified_tour_ids?.length || 0;
    
    if (currentTourCount >= maxTours) {
      return NextResponse.json(
        { error: `You have reached the maximum of ${maxTours} tours for your plan` },
        { status: 400 }
      );
    }
    
    // Check if tour is already added
    if (subscription.verified_tour_ids?.includes(productId)) {
      return NextResponse.json(
        { error: 'Tour is already in your subscription' },
        { status: 400 }
      );
    }
    
    // Fetch tour data to verify it exists and get operator name
    let tourData = await getCachedTour(productId);
    
    if (!tourData) {
      // Try fetching from Viator API
      const apiKey = process.env.VIATOR_API_KEY || '282a363f-5d60-456a-a6a0-774ec4832b07';
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
      
      if (!response.ok) {
        return NextResponse.json(
          { error: 'Tour not found. Please verify the tour URL is correct.' },
          { status: 404 }
        );
      }
      
      tourData = await response.json();
    }
    
    // Verify operator name matches existing tours
    const tourOperatorName = tourData.supplier?.name || 
                             tourData.supplierName || 
                             tourData.operator?.name || 
                             tourData.vendor?.name || 
                             '';
    
    if (!tourOperatorName) {
      return NextResponse.json(
        { error: 'Could not find operator name for this tour' },
        { status: 400 }
      );
    }
    
    // Get existing tours to check operator name
    const { data: existingTours } = await supabase
      .from('operator_tours')
      .select('operator_name')
      .eq('operator_subscription_id', subscriptionId)
      .eq('is_selected', true)
      .limit(1)
      .single();
    
    if (existingTours) {
      // Normalize and compare operator names
      const { normalizeOperatorName, calculateOperatorMatchScore } = await import('@/utils/tourOperatorHelpers');
      const existingNormalized = normalizeOperatorName(existingTours.operator_name);
      const newNormalized = normalizeOperatorName(tourOperatorName);
      const matchScore = calculateOperatorMatchScore(existingNormalized, newNormalized);
      
      if (matchScore < 0.8) {
        return NextResponse.json(
          { 
            error: 'Operator name does not match. All tours must be from the same operator.',
            details: {
              existingOperator: existingTours.operator_name,
              newOperator: tourOperatorName
            }
          },
          { status: 400 }
        );
      }
    }
    
    // Add tour to operator_tours table
    const toptoursUrl = getTourUrl(productId, tourData.title || '');
    
    const { data: newTour, error: tourError } = await supabase
      .from('operator_tours')
      .insert({
        operator_subscription_id: subscriptionId,
        product_id: productId,
        toptours_url: toptoursUrl,
        operator_name: subscription.operator_name,
        tour_title: tourData.title || tourData.seo?.title || '',
        tour_image_url: tourData.images?.[0]?.variants?.[3]?.url || 
                        tourData.images?.[0]?.variants?.[0]?.url || 
                        null,
        review_count: tourData.reviews?.totalReviews || 0,
        rating: tourData.reviews?.combinedAverageRating || 0,
        is_selected: true,
        is_active: true,
      })
      .select()
      .single();
    
    if (tourError) {
      console.error('Error adding tour:', tourError);
      return NextResponse.json(
        { error: 'Failed to add tour to subscription' },
        { status: 500 }
      );
    }
    
    // Update subscription's verified_tour_ids array
    const updatedTourIds = [...(subscription.verified_tour_ids || []), productId];
    
    // Recalculate aggregated stats
    const { data: allTours } = await supabase
      .from('operator_tours')
      .select('review_count, rating')
      .eq('operator_subscription_id', subscriptionId)
      .eq('is_selected', true)
      .eq('is_active', true);
    
    const totalReviews = allTours?.reduce((sum, t) => sum + (t.review_count || 0), 0) || 0;
    const totalRating = allTours?.reduce((sum, t) => sum + (t.rating || 0) * (t.review_count || 0), 0) || 0;
    const averageRating = totalReviews > 0 ? totalRating / totalReviews : 0;
    
    const { error: updateError } = await supabase
      .from('tour_operator_subscriptions')
      .update({
        verified_tour_ids: updatedTourIds,
        total_tours_count: updatedTourIds.length,
        total_reviews: totalReviews,
        average_rating: averageRating.toFixed(2),
        updated_at: new Date().toISOString(),
      })
      .eq('id', subscriptionId);
    
    if (updateError) {
      console.error('Error updating subscription:', updateError);
      // Don't fail - tour is added, just stats might be off
    }
    
    return NextResponse.json({
      success: true,
      message: 'Tour added successfully',
    });
    
  } catch (error) {
    console.error('Error adding tour to subscription:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

