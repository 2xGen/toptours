/**
 * Lightweight Tour Operators CRM
 * Simple sync function - extracts operator name and stores it
 */

import { createSupabaseServiceRoleClient } from './supabaseClient';

/**
 * Extract operator name from tour data (lightweight - no extra API calls)
 */
function extractOperatorName(tourData) {
  // Try supplier.name first (most common in Viator API)
  if (tourData.supplier?.name) return tourData.supplier.name;
  if (tourData.supplierName) return tourData.supplierName;
  if (tourData.operator?.name) return tourData.operator.name;
  
  // Fallback: Extract from SEO title (format: "Operator Name – Tour Title")
  if (tourData.seo?.title) {
    const parts = tourData.seo.title.split(/[–-]/);
    if (parts.length > 1) return parts[0].trim();
  }
  
  // Fallback: Extract from regular title
  if (tourData.title) {
    const parts = tourData.title.split(/[–-]/);
    if (parts.length > 1) return parts[0].trim();
  }
  
  return null;
}

/**
 * Sync operator to CRM when tour is viewed
 */
export async function syncOperator(tourData, productId) {
  console.log('🔄 [CRM] syncOperator called', { productId, hasTourData: !!tourData });
  
  if (!tourData || !productId) {
    console.warn('🔄 [CRM] Missing data', { hasTourData: !!tourData, productId });
    return { success: false, error: 'Missing data' };
  }

  const operatorName = extractOperatorName(tourData);
  console.log('🔄 [CRM] Extracted operator name:', operatorName);
  
  if (!operatorName) {
    console.warn('🔄 [CRM] No operator name found', { 
      productId,
      hasSupplier: !!tourData.supplier,
      hasTitle: !!tourData.title,
      hasSeo: !!tourData.seo
    });
    return { success: false, error: 'No operator name found' };
  }

  // Extract destination IDs from tour data (lightweight - just store IDs)
  const destinationIds = [];
  if (tourData.destinations && Array.isArray(tourData.destinations)) {
    tourData.destinations.forEach(dest => {
      const destId = dest.destinationId || dest.id || dest.ref;
      if (destId) {
        // Normalize: remove 'd' prefix if present, convert to string
        const normalizedId = destId.toString().replace(/^d/i, '');
        if (normalizedId && !destinationIds.includes(normalizedId)) {
          destinationIds.push(normalizedId);
        }
      }
    });
  }
  console.log('🔄 [CRM] Extracted destination IDs:', destinationIds);

  try {
    const supabase = createSupabaseServiceRoleClient();
    console.log('🔄 [CRM] Database connection created');
    
    // Check if operator exists
    const { data: existing } = await supabase
      .from('tour_operators_crm')
      .select('tour_product_ids, destination_ids')
      .eq('operator_name', operatorName)
      .single();

    if (existing) {
      // Update: Add product ID and destination IDs if not already present
      const productIds = existing.tour_product_ids || [];
      const existingDestIds = existing.destination_ids || [];
      
      let needsUpdate = false;
      const updates = {};
      
      if (!productIds.includes(productId)) {
        updates.tour_product_ids = [...productIds, productId];
        needsUpdate = true;
      }
      
      // Merge destination IDs
      const mergedDestIds = [...existingDestIds];
      destinationIds.forEach(id => {
        if (!mergedDestIds.includes(id)) {
          mergedDestIds.push(id);
          needsUpdate = true;
        }
      });
      
      if (needsUpdate) {
        if (updates.tour_product_ids) {
          updates.destination_ids = mergedDestIds;
        } else {
          updates.destination_ids = mergedDestIds;
        }
        updates.updated_at = new Date().toISOString();
        
        await supabase
          .from('tour_operators_crm')
          .update(updates)
          .eq('operator_name', operatorName);
      }
    } else {
      // Insert: Create new operator
      console.log('🔄 [CRM] Inserting new operator:', { operatorName, productId, destinationIds });
      const { data: inserted, error: insertError } = await supabase
        .from('tour_operators_crm')
        .insert({
          operator_name: operatorName,
          tour_product_ids: [productId],
          destination_ids: destinationIds,
          status: 'not_contacted'
        })
        .select();

      if (insertError) {
        console.error('❌ [CRM] Insert error:', insertError);
        throw insertError;
      }
      console.log('✅ [CRM] Operator inserted:', inserted);
    }

    console.log('✅ [CRM] Sync successful:', { operatorName, productId });
    return { success: true, operatorName };
  } catch (error) {
    console.error('CRM sync error:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Get all operators
 */
export async function getOperators() {
  try {
    const supabase = createSupabaseServiceRoleClient();
    const { data, error } = await supabase
      .from('tour_operators_crm')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return { success: true, data: data || [] };
  } catch (error) {
    return { success: false, error: error.message, data: [] };
  }
}

/**
 * Update operator
 */
export async function updateOperator(id, updates) {
  try {
    const supabase = createSupabaseServiceRoleClient();
    const { data, error } = await supabase
      .from('tour_operators_crm')
      .update({
        ...updates,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return { success: true, data };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

