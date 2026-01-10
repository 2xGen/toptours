/**
 * Baby Equipment Rentals data fetching from Supabase database
 */

import { createSupabaseServiceRoleClient } from './supabaseClient';

/**
 * Get baby equipment rentals page data for a destination
 * @param {string} destinationId - Destination ID (e.g., 'aruba', 'curacao')
 * @returns {Promise<Object|null>} Baby equipment rentals page data or null
 */
export async function getBabyEquipmentRentalsByDestination(destinationId) {
  if (!destinationId) {
    return null;
  }

  const supabase = createSupabaseServiceRoleClient();
  
  const { data, error } = await supabase
    .from('baby_equipment_rentals')
    .select('*')
    .eq('destination_id', destinationId.toLowerCase())
    .eq('is_active', true)
    .single();

  if (error) {
    if (error.code === 'PGRST116') {
      // No rows returned - destination doesn't have a page yet
      return null;
    }
    console.error('Error fetching baby equipment rentals:', error);
    return null;
  }

  return data;
}

/**
 * Insert or update baby equipment rentals page data
 * @param {Object} pageData - Page data object
 * @returns {Promise<Object|null>} Inserted/updated data or null
 */
export async function upsertBabyEquipmentRentals(pageData) {
  if (!pageData || !pageData.destination_id) {
    throw new Error('destination_id is required');
  }

  const supabase = createSupabaseServiceRoleClient();
  
  const { data, error } = await supabase
    .from('baby_equipment_rentals')
    .upsert({
      destination_id: pageData.destination_id.toLowerCase(),
      hero_title: pageData.hero_title || null,
      hero_description: pageData.hero_description || null,
      hero_tagline: pageData.hero_tagline || null,
      product_categories: pageData.product_categories ? JSON.parse(JSON.stringify(pageData.product_categories)) : null,
      intro_text: pageData.intro_text || null,
      rates_note: pageData.rates_note || null,
      faqs: pageData.faqs ? JSON.parse(JSON.stringify(pageData.faqs)) : null,
      pricing_info: pageData.pricing_info ? JSON.parse(JSON.stringify(pageData.pricing_info)) : null,
      seo_title: pageData.seo_title || null,
      seo_description: pageData.seo_description || null,
      seo_keywords: pageData.seo_keywords || null,
      is_active: pageData.is_active !== undefined ? pageData.is_active : true,
    }, {
      onConflict: 'destination_id',
    })
    .select()
    .single();

  if (error) {
    console.error('Error upserting baby equipment rentals:', error);
    throw error;
  }

  return data;
}

/**
 * Get all active baby equipment rentals destinations
 * @returns {Promise<Array>} Array of objects with destination_id and updated_at for baby equipment rentals pages
 */
export async function getAllBabyEquipmentRentalsDestinations() {
  const supabase = createSupabaseServiceRoleClient();
  
  const { data, error } = await supabase
    .from('baby_equipment_rentals')
    .select('destination_id, updated_at')
    .eq('is_active', true);

  if (error) {
    console.error('Error fetching baby equipment rentals destinations:', error);
    return [];
  }

  return data;
}
