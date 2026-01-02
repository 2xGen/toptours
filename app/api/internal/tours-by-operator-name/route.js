import { NextResponse } from 'next/server';
import { createSupabaseServiceRoleClient } from '@/lib/supabaseClient';

/**
 * GET /api/internal/tours-by-operator-name?operatorName=...
 * 
 * Fetches tours from tour_operators_crm by operator name.
 * Returns product IDs that can be used to fetch full tour data.
 * 
 * This allows users to select tours from the database instead of pasting multiple URLs.
 */
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const operatorName = searchParams.get('operatorName');

    if (!operatorName || operatorName.trim() === '') {
      return NextResponse.json(
        { error: 'operatorName parameter is required' },
        { status: 400 }
      );
    }

    const supabase = createSupabaseServiceRoleClient();

    // Query tour_operators_crm for matching operator name
    // Use case-insensitive matching for better results
    const { data: crmEntry, error: crmError } = await supabase
      .from('tour_operators_crm')
      .select('tour_product_ids, operator_name')
      .ilike('operator_name', operatorName.trim())
      .limit(1)
      .single();

    if (crmError && crmError.code !== 'PGRST116') { // PGRST116 = no rows returned
      console.error('Error querying tour_operators_crm:', crmError);
      return NextResponse.json(
        { error: 'Failed to query database', details: crmError.message },
        { status: 500 }
      );
    }

    // If no exact match, try fuzzy matching (contains)
    let productIds = [];
    if (crmEntry && crmEntry.tour_product_ids) {
      productIds = crmEntry.tour_product_ids;
    } else {
      // Try fuzzy match - operator name contains the search term or vice versa
      const { data: fuzzyMatches, error: fuzzyError } = await supabase
        .from('tour_operators_crm')
        .select('tour_product_ids, operator_name')
        .or(`operator_name.ilike.%${operatorName.trim()}%,operator_name.ilike.${operatorName.trim()}%`)
        .limit(5);

      if (!fuzzyError && fuzzyMatches && fuzzyMatches.length > 0) {
        // Use the first match (most likely)
        productIds = fuzzyMatches[0].tour_product_ids || [];
      }
    }

    // Also check tour_operator_subscriptions for active subscriptions with matching operator name
    // This gives us tours from operators who have already subscribed
    const { data: subscriptions, error: subError } = await supabase
      .from('tour_operator_subscriptions')
      .select('verified_tour_ids, operator_name')
      .eq('status', 'active')
      .ilike('operator_name', operatorName.trim())
      .limit(5);

    if (!subError && subscriptions && subscriptions.length > 0) {
      // Merge product IDs from subscriptions
      subscriptions.forEach(sub => {
        if (sub.verified_tour_ids && Array.isArray(sub.verified_tour_ids)) {
          productIds = [...new Set([...productIds, ...sub.verified_tour_ids])];
        }
      });
    }

    // Remove duplicates and return
    const uniqueProductIds = [...new Set(productIds)].filter(Boolean);

    return NextResponse.json({
      operatorName: operatorName.trim(),
      productIds: uniqueProductIds,
      count: uniqueProductIds.length,
      found: uniqueProductIds.length > 0
    });

  } catch (error) {
    console.error('Error in /api/internal/tours-by-operator-name:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    );
  }
}

