import { NextResponse } from 'next/server';
import { createSupabaseServiceRoleClient } from '@/lib/supabaseClient';

/**
 * POST /api/internal/tour-operator-premium/remove-tour
 * Remove a tour from an existing tour operator subscription
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
    
    // Check minimum tour requirement (must have at least 2 tours)
    const currentTourCount = subscription.verified_tour_ids?.length || 0;
    if (currentTourCount <= 2) {
      return NextResponse.json(
        { error: 'You must have at least 2 tours in your subscription' },
        { status: 400 }
      );
    }
    
    // Remove tour from operator_tours (set is_selected to false)
    const { error: tourError } = await supabase
      .from('operator_tours')
      .update({
        is_selected: false,
        is_active: false,
      })
      .eq('operator_subscription_id', subscriptionId)
      .eq('product_id', productId);
    
    if (tourError) {
      console.error('Error removing tour:', tourError);
      return NextResponse.json(
        { error: 'Failed to remove tour from subscription' },
        { status: 500 }
      );
    }
    
    // Update subscription's verified_tour_ids array
    const updatedTourIds = (subscription.verified_tour_ids || []).filter(id => id !== productId);
    
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
      // Don't fail - tour is removed, just stats might be off
    }
    
    return NextResponse.json({
      success: true,
      message: 'Tour removed successfully',
    });
    
  } catch (error) {
    console.error('Error removing tour from subscription:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

