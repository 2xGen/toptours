/**
 * Promoted Listings System
 * B2B subscription model for top placement ($29/month or $299/year)
 */

import { createSupabaseServiceRoleClient, createSupabaseBrowserClient } from './supabaseClient';

/**
 * Get all active promoted listings for a destination
 * @param {string} destinationId - Destination ID
 * @param {string} productType - 'tour' or 'restaurant'
 * @param {object} supabaseClient - Optional Supabase client (for server-side)
 * @returns {Promise<Array>} Array of promoted listings
 */
export async function getPromotedListings(destinationId, productType, supabaseClient = null) {
  const supabase = supabaseClient || createSupabaseServiceRoleClient();
  
  const { data, error } = await supabase
    .from('promoted_listings')
    .select('*')
    .eq('destination_id', destinationId)
    .eq('product_type', productType)
    .eq('subscription_status', 'active')
    .or(`subscription_end.is.null,subscription_end.gte.${new Date().toISOString().split('T')[0]}`)
    .order('subscription_start', { ascending: true }); // Oldest first (loyalty reward)
  
  if (error) {
    console.error('Error fetching promoted listings:', error);
    return [];
  }
  
  return data || [];
}

/**
 * Check if a specific product is promoted
 * @param {string} productId - Tour product_code or restaurant id
 * @param {string} destinationId - Destination ID
 * @param {string} productType - 'tour' or 'restaurant'
 * @param {object} supabaseClient - Optional Supabase client
 * @returns {Promise<boolean>} True if product is promoted
 */
export async function isProductPromoted(productId, destinationId, productType, supabaseClient = null) {
  const supabase = supabaseClient || createSupabaseServiceRoleClient();
  
  const { data, error } = await supabase
    .from('promoted_listings')
    .select('id')
    .eq('product_id', productId)
    .eq('destination_id', destinationId)
    .eq('product_type', productType)
    .eq('subscription_status', 'active')
    .or(`subscription_end.is.null,subscription_end.gte.${new Date().toISOString().split('T')[0]}`)
    .limit(1)
    .single();
  
  if (error) {
    if (error.code === 'PGRST116') {
      // No rows returned (not promoted)
      return false;
    }
    console.error('Error checking promoted status:', error);
    return false;
  }
  
  return !!data;
}

/**
 * Get promoted status for multiple products (batch check)
 * @param {Array<string>} productIds - Array of product IDs
 * @param {string} destinationId - Destination ID
 * @param {string} productType - 'tour' or 'restaurant'
 * @param {object} supabaseClient - Optional Supabase client
 * @returns {Promise<Set<string>>} Set of promoted product IDs
 */
export async function getPromotedProductIds(productIds, destinationId, productType, supabaseClient = null) {
  if (!productIds || productIds.length === 0) {
    return new Set();
  }
  
  const supabase = supabaseClient || createSupabaseServiceRoleClient();
  
  const { data, error } = await supabase
    .from('promoted_listings')
    .select('product_id')
    .eq('destination_id', destinationId)
    .eq('product_type', productType)
    .eq('subscription_status', 'active')
    .in('product_id', productIds)
    .or(`subscription_end.is.null,subscription_end.gte.${new Date().toISOString().split('T')[0]}`);
  
  if (error) {
    console.error('Error fetching promoted product IDs:', error);
    return new Set();
  }
  
  return new Set((data || []).map(item => item.product_id));
}

/**
 * Create a new promoted listing subscription
 * @param {object} listingData - Subscription data
 * @param {string} listingData.productId - Tour product_code or restaurant id
 * @param {string} listingData.productType - 'tour' or 'restaurant'
 * @param {string} listingData.destinationId - Destination ID
 * @param {string} listingData.billingCycle - 'monthly' or 'yearly'
 * @param {number} listingData.pricePaid - Amount paid (29.00 or 299.00)
 * @param {string} listingData.operatorEmail - Contact email
 * @param {string} listingData.operatorName - Operator name
 * @param {string} listingData.notes - Internal notes
 * @param {object} supabaseClient - Optional Supabase client
 * @returns {Promise<object>} Created listing or null
 */
export async function createPromotedListing(listingData, supabaseClient = null) {
  const supabase = supabaseClient || createSupabaseServiceRoleClient();
  
  // Calculate subscription_end for yearly subscriptions
  let subscriptionEnd = null;
  if (listingData.billingCycle === 'yearly') {
    const endDate = new Date();
    endDate.setFullYear(endDate.getFullYear() + 1);
    subscriptionEnd = endDate.toISOString().split('T')[0];
  }
  
  const { data, error } = await supabase
    .from('promoted_listings')
    .insert({
      product_id: listingData.productId,
      product_type: listingData.productType,
      destination_id: listingData.destinationId,
      billing_cycle: listingData.billingCycle,
      price_paid: listingData.pricePaid,
      subscription_start: new Date().toISOString().split('T')[0],
      subscription_end: subscriptionEnd,
      operator_email: listingData.operatorEmail,
      operator_name: listingData.operatorName,
      notes: listingData.notes || null,
      subscription_status: 'active',
    })
    .select()
    .single();
  
  if (error) {
    console.error('Error creating promoted listing:', error);
    return null;
  }
  
  return data;
}

/**
 * Update subscription status (cancel, expire, etc.)
 * @param {number} listingId - Promoted listing ID
 * @param {string} status - New status ('active', 'cancelled', 'expired')
 * @param {object} supabaseClient - Optional Supabase client
 * @returns {Promise<boolean>} Success status
 */
export async function updatePromotedListingStatus(listingId, status, supabaseClient = null) {
  const supabase = supabaseClient || createSupabaseServiceRoleClient();
  
  const { data, error } = await supabase
    .from('promoted_listings')
    .update({ subscription_status: status })
    .eq('id', listingId)
    .select()
    .single();
  
  if (error) {
    console.error('Error updating promoted listing status:', error);
    return false;
  }
  
  return !!data;
}

/**
 * Sort products with promoted listings first
 * @param {Array} products - Array of products (tours or restaurants)
 * @param {Set<string>} promotedProductIds - Set of promoted product IDs
 * @returns {Array} Sorted products (promoted first)
 */
export function sortWithPromotedFirst(products, promotedProductIds) {
  if (!promotedProductIds || promotedProductIds.size === 0) {
    return products;
  }
  
  const promoted = [];
  const regular = [];
  
  products.forEach(product => {
    const productId = product.productCode || product.id || product.product_id;
    if (promotedProductIds.has(String(productId))) {
      promoted.push(product);
    } else {
      regular.push(product);
    }
  });
  
  return [...promoted, ...regular];
}

