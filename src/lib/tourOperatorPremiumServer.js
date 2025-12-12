/**
 * Server-side utilities for tour operator premium subscriptions
 */

import { createSupabaseServiceRoleClient } from '@/lib/supabaseClient';

/**
 * Get premium subscription for a tour operator by product ID
 * Returns subscription if the tour is part of a premium operator bundle
 */
export async function getTourOperatorPremiumSubscription(productId) {
  if (!productId) return null;
  
  try {
    const supabase = createSupabaseServiceRoleClient();
    
    // Find operator subscription that includes this tour
    const { data, error } = await supabase
      .from('operator_tours')
      .select(`
        *,
        tour_operator_subscriptions (
          id,
          operator_name,
          operator_email,
          status,
          subscription_plan,
          total_reviews,
          average_rating,
          total_tours_count,
          current_period_end
        )
      `)
      .eq('product_id', productId)
      .eq('is_selected', true)
      .eq('is_active', true)
      .single();
    
    if (error) {
      if (error.code !== 'PGRST116') { // PGRST116 = no rows found
        console.error('Error fetching tour operator premium subscription:', error);
      }
      return null;
    }
    
    const subscription = data?.tour_operator_subscriptions;
    
    // Check if subscription is active and not expired
    if (subscription && subscription.status === 'active') {
      if (subscription.current_period_end) {
        const endDate = new Date(subscription.current_period_end);
        if (endDate < new Date()) {
          // Subscription has expired
          return null;
        }
      }
      // Return subscription with operator_name and id
      return {
        id: subscription.id,
        operator_name: subscription.operator_name,
        operator_email: subscription.operator_email,
        status: subscription.status,
        subscription_plan: subscription.subscription_plan,
        total_reviews: subscription.total_reviews,
        average_rating: subscription.average_rating,
        total_tours_count: subscription.total_tours_count,
        current_period_end: subscription.current_period_end,
      };
    }
    
    return null;
  } catch (error) {
    console.error('Exception fetching tour operator premium subscription:', error);
    return null;
  }
}

/**
 * Check if a tour has premium operator status
 */
export async function isTourOperatorPremium(productId) {
  const subscription = await getTourOperatorPremiumSubscription(productId);
  return !!subscription;
}

/**
 * Get all premium tour product IDs for an operator
 * Returns up to 5 tours from the same operator bundle
 */
export async function getOperatorPremiumTourIds(productId) {
  if (!productId) return [];
  
  try {
    const supabase = createSupabaseServiceRoleClient();
    
    // First, find which operator subscription this tour belongs to
    const { data: tourData, error: tourError } = await supabase
      .from('operator_tours')
      .select('operator_subscription_id')
      .eq('product_id', productId)
      .eq('is_selected', true)
      .eq('is_active', true)
      .single();
    
    if (tourError || !tourData) {
      return [];
    }
    
    // Get all tours from the same operator subscription
    const { data: operatorTours, error } = await supabase
      .from('operator_tours')
      .select('product_id, tour_title, tour_image_url, review_count, rating, toptours_url')
      .eq('operator_subscription_id', tourData.operator_subscription_id)
      .eq('is_selected', true)
      .eq('is_active', true)
      .order('review_count', { ascending: false }); // Order by review count
    
    if (error) {
      console.error('Error fetching operator premium tour IDs:', error);
      return [];
    }
    
    // Return product IDs (max 5, excluding current tour)
    return (operatorTours || [])
      .filter(tour => tour.product_id !== productId)
      .slice(0, 5)
      .map(tour => ({
        productId: tour.product_id,
        title: tour.tour_title,
        imageUrl: tour.tour_image_url,
        reviewCount: tour.review_count,
        rating: tour.rating,
        url: tour.toptours_url
      }));
  } catch (error) {
    console.error('Exception fetching operator premium tour IDs:', error);
    return [];
  }
}

/**
 * Get all premium tour product IDs for a destination (batch query)
 * Returns an array of product IDs that have premium operator status
 * Used for displaying crown icons on tour cards
 * Note: Since we don't have destination_id in operator_tours, we return all premium tour IDs
 * The client can filter by checking if a tour is in the premium list
 */
export async function getPremiumOperatorTourIdsForDestination(destinationId) {
  try {
    const supabase = createSupabaseServiceRoleClient();
    
    // First, get all active operator subscription IDs
    const { data: activeSubscriptions, error: subsError } = await supabase
      .from('tour_operator_subscriptions')
      .select('id')
      .eq('status', 'active');
    
    if (subsError) {
      console.error('Error fetching active operator subscriptions:', subsError);
      return [];
    }
    
    if (!activeSubscriptions || activeSubscriptions.length === 0) {
      return [];
    }
    
    const subscriptionIds = activeSubscriptions.map(sub => sub.id);
    
    // Get all premium tours from active subscriptions
    const { data: operatorTours, error } = await supabase
      .from('operator_tours')
      .select('product_id')
      .in('operator_subscription_id', subscriptionIds)
      .eq('is_selected', true)
      .eq('is_active', true);
    
    if (error) {
      console.error('Error fetching premium operator tour IDs:', error);
      return [];
    }
    
    // Return array of product IDs
    return (operatorTours || []).map(tour => tour.product_id);
  } catch (error) {
    console.error('Exception fetching premium operator tour IDs:', error);
    return [];
  }
}

/**
 * Get aggregated stats for an operator
 */
export async function getOperatorAggregatedStats(operatorSubscriptionId) {
  if (!operatorSubscriptionId) return null;
  
  try {
    const supabase = createSupabaseServiceRoleClient();
    
    const { data, error } = await supabase
      .from('tour_operator_subscriptions')
      .select('total_reviews, average_rating, total_tours_count, operator_name')
      .eq('id', operatorSubscriptionId)
      .eq('status', 'active')
      .single();
    
    if (error) {
      if (error.code !== 'PGRST116') {
        console.error('Error fetching operator aggregated stats:', error);
      }
      return null;
    }
    
    return data;
  } catch (error) {
    console.error('Exception fetching operator aggregated stats:', error);
    return null;
  }
}

