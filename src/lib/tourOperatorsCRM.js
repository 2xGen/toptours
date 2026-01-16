/**
 * Lightweight Tour Operators CRM
 * Simple sync function - extracts operator name and stores it
 */

import { createSupabaseServiceRoleClient } from './supabaseClient';

/**
 * Normalize operator name for consistent matching
 * Removes extra spaces, normalizes case, trims whitespace
 */
function normalizeOperatorName(name) {
  if (!name) return null;
  return name
    .trim()
    .replace(/\s+/g, ' ') // Replace multiple spaces with single space
    .replace(/[–—]/g, '-') // Normalize dashes
    .toLowerCase(); // Case-insensitive matching
}

/**
 * Extract operator name from tour data (lightweight - no extra API calls)
 */
function extractOperatorName(tourData) {
  let operatorName = null;
  
  // Try supplier.name first (most common in Viator API)
  if (tourData.supplier?.name) {
    operatorName = tourData.supplier.name;
  } else if (tourData.supplierName) {
    operatorName = tourData.supplierName;
  } else if (tourData.operator?.name) {
    operatorName = tourData.operator.name;
  } else if (tourData.seo?.title) {
    // Fallback: Extract from SEO title (format: "Operator Name – Tour Title")
    const parts = tourData.seo.title.split(/[–-]/);
    if (parts.length > 1) operatorName = parts[0].trim();
  } else if (tourData.title) {
    // Fallback: Extract from regular title
    const parts = tourData.title.split(/[–-]/);
    if (parts.length > 1) operatorName = parts[0].trim();
  }
  
  return operatorName ? operatorName.trim() : null;
}

/**
 * Sync operator to CRM when tour is viewed
 */
export async function syncOperator(tourData, productId) {
  if (!tourData || !productId) {
    return { success: false, error: 'Missing data' };
  }

  const operatorName = extractOperatorName(tourData);
  
  if (!operatorName) {
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

  try {
    const supabase = createSupabaseServiceRoleClient();
    
    // Normalize operator name for lookup (case-insensitive, space-normalized)
    const normalizedName = normalizeOperatorName(operatorName);
    
    // Check if operator exists (case-insensitive match using ILIKE or fetch all and filter)
    // Since Supabase doesn't support case-insensitive .eq(), we'll fetch and filter
    const { data: allOperators, error: fetchError } = await supabase
      .from('tour_operators_crm')
      .select('id, operator_name, tour_product_ids, destination_ids');
    
    if (fetchError) {
      throw fetchError;
    }
    
    // Find matching operator (case-insensitive, normalized)
    const existing = allOperators?.find(op => 
      normalizeOperatorName(op.operator_name) === normalizedName
    );

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
          .eq('id', existing.id);
      }
    } else {
      // Insert: Create new operator
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
        // This is non-critical and should never break the page.
        // In practice this is usually a duplicate operator_name or a transient DB issue.
        const safeError =
          insertError && typeof insertError === 'object'
            ? {
                message: insertError.message,
                code: insertError.code,
                details: insertError.details,
                hint: insertError.hint,
              }
            : { message: String(insertError || 'Unknown error') };

        // Treat duplicates as success (non-blocking)
        if (safeError.code === '23505') {
          // Operator already exists - this is expected when the same tour/operator is viewed multiple times
          return { success: true, operatorName, skipped: true };
        }

        return { success: false, error: safeError.message || 'Unknown CRM insert error' };
      }
    }

    return { success: true, operatorName };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

/**
 * Get all operators
 */
export async function getOperators() {
  try {
    const supabase = createSupabaseServiceRoleClient();
    
    // Fetch all operators with pagination to avoid Supabase's 1000 row limit
    let allData = [];
    let from = 0;
    const pageSize = 1000;
    let hasMore = true;

    while (hasMore) {
      const { data, error } = await supabase
        .from('tour_operators_crm')
        .select('*')
        .order('created_at', { ascending: false })
        .range(from, from + pageSize - 1);

      if (error) throw error;
      
      if (data && data.length > 0) {
        allData = [...allData, ...data];
        from += pageSize;
        hasMore = data.length === pageSize; // If we got a full page, there might be more
      } else {
        hasMore = false;
      }
    }

    return { success: true, data: allData };
  } catch (error) {
    return { success: false, error: error.message, data: [] };
  }
}

/**
 * Get operators for a specific destination
 * Returns operators that have tours in the given destination
 */
export async function getOperatorsForDestination(destinationId) {
  try {
    const supabase = createSupabaseServiceRoleClient();
    
    // Normalize destination ID (remove 'd' prefix if present)
    const normalizedDestId = destinationId.toString().replace(/^d/i, '');
    
    // Fetch all operators and filter client-side (PostgreSQL array contains check)
    // Using GIN index on destination_ids for efficient query
    // Note: Supabase uses cs (contains) operator for array contains
    const { data, error } = await supabase
      .from('tour_operators_crm')
      .select('id, operator_name, tour_product_ids, destination_ids, status, created_at, updated_at')
      .contains('destination_ids', [normalizedDestId]);

    if (error) {
      console.error('Error fetching operators for destination:', error);
      // Fallback: fetch all and filter client-side
      const { data: allData, error: fetchAllError } = await supabase
        .from('tour_operators_crm')
        .select('id, operator_name, tour_product_ids, destination_ids, status, created_at, updated_at');
      
      if (fetchAllError) {
        return { success: false, error: fetchAllError.message, data: [] };
      }
      
      // Filter client-side
      const filtered = (allData || []).filter(op => {
        const destIds = Array.isArray(op.destination_ids) ? op.destination_ids : [];
        return destIds.includes(normalizedDestId);
      });
      
      return { success: true, data: filtered };
    }

    // Process operators to count tours in this destination
    // Note: We can't easily filter tour_product_ids by destination without API calls,
    // so we'll show all tours for operators that operate in this destination
    const operators = (data || []).map(op => {
      const tourCount = Array.isArray(op.tour_product_ids) ? op.tour_product_ids.length : 0;
      const destinationCount = Array.isArray(op.destination_ids) ? op.destination_ids.length : 0;
      
      return {
        ...op,
        tourCount,
        destinationCount,
        // Tours in this destination (we'll approximate as total tours since we don't have per-destination tour mapping)
        toursInDestination: tourCount
      };
    });

    // Sort alphabetically by operator name
    operators.sort((a, b) => {
      const nameA = (a.operator_name || '').toLowerCase();
      const nameB = (b.operator_name || '').toLowerCase();
      return nameA.localeCompare(nameB);
    });

    return { success: true, data: operators };
  } catch (error) {
    console.error('Error in getOperatorsForDestination:', error);
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
