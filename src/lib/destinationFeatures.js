/**
 * Lightweight helper functions to check destination features
 * Used for sticky navigation and conditional UI elements
 * Optimized to avoid unnecessary API calls
 */

import { DESTINATIONS_WITH_RESTAURANTS } from '@/data/destinationsWithRestaurants';
import { createSupabaseServiceRoleClient } from './supabaseClient';
import { getBabyEquipmentRentalsByDestination } from './babyEquipmentRentals';
import { getAllCategoryGuidesForDestination } from './categoryGuides';

/**
 * Lightweight check if destination has restaurants
 * Uses static Set for curated destinations, DB check for others
 */
export async function checkHasRestaurants(destinationId) {
  if (!destinationId) return false;
  
  const normalizedId = destinationId.toLowerCase();
  
  // First check static Set (instant, zero DB calls for 183 curated destinations)
  if (DESTINATIONS_WITH_RESTAURANTS.has(normalizedId)) {
    return true;
  }
  
  // For destinations NOT in the curated list, check database (lightweight check only)
  try {
    const supabase = createSupabaseServiceRoleClient();
    const { count, error } = await supabase
      .from('restaurants')
      .select('*', { count: 'exact', head: true })
      .eq('destination_id', destinationId)
      .eq('is_active', true)
      .limit(1);
    
    if (!error && count && count > 0) {
      return true;
    }
  } catch (error) {
    // If DB check fails, return false (don't block)
  }
  
  return false;
}

/**
 * Lightweight check if destination has baby equipment rentals
 */
export async function checkHasBabyEquipment(destinationId) {
  if (!destinationId) return false;
  
  try {
    const data = await getBabyEquipmentRentalsByDestination(destinationId);
    return !!data;
  } catch (error) {
    return false;
  }
}

/**
 * Lightweight check if destination has airport transfers guide
 */
export async function checkHasAirportTransfers(destinationId) {
  if (!destinationId) return false;
  
  try {
    const guides = await getAllCategoryGuidesForDestination(destinationId);
    return guides?.some(guide => guide.category_slug === 'airport-transfers') || false;
  } catch (error) {
    return false;
  }
}

/**
 * Get all destination features in one call (optimized)
 * Returns object with hasRestaurants, hasBabyEquipment, hasAirportTransfers
 */
export async function getDestinationFeatures(destinationId) {
  if (!destinationId) {
    return {
      hasRestaurants: false,
      hasBabyEquipment: false,
      hasAirportTransfers: false,
    };
  }
  
  // Run all checks in parallel for better performance
  const [hasRestaurants, hasBabyEquipment, hasAirportTransfers] = await Promise.all([
    checkHasRestaurants(destinationId),
    checkHasBabyEquipment(destinationId),
    checkHasAirportTransfers(destinationId),
  ]);
  
  return {
    hasRestaurants,
    hasBabyEquipment,
    hasAirportTransfers,
  };
}
