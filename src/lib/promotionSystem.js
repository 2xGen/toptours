/**
 * Gamified Promotion System
 * Handles daily points, spending, and leaderboard logic
 */

import { createSupabaseServiceRoleClient, createSupabaseBrowserClient } from './supabaseClient';
import { getCachedTour } from '@/lib/viatorCache';

// Subscription Tiers (Option B Pricing)
const TIER_POINTS = {
  explorer: 50,      // Free tier
  pro_booster: 200, // Pro: $3.99/month
  pro_plus: 600,    // Pro+: $9.99/month
  enterprise: 2000,  // Enterprise: $24.99/month
};

// A La Carte Pricing (Option B)
const A_LA_CARTE_PACKAGES = {
  '1000_points': {
    points: 1000,
    priceCents: 799, // $7.99
    pricePerPoint: 0.00799,
  },
  '3000_points': {
    points: 3000,
    priceCents: 1899, // $18.99
    pricePerPoint: 0.00633,
  },
  '5000_points': {
    points: 5000,
    priceCents: 2799, // $27.99
    pricePerPoint: 0.005598,
  },
};

// Subscription Pricing
const SUBSCRIPTION_PRICING = {
  free: {
    planName: 'Free',
    dailyPoints: 50,
    monthlyPriceCents: 0,
    aiMatchesPerDay: 1,
  },
  pro: {
    planName: 'Pro',
    dailyPoints: 200,
    monthlyPriceCents: 399, // $3.99
    aiMatchesPerDay: 5,
  },
  pro_plus: {
    planName: 'Pro+',
    dailyPoints: 600,
    monthlyPriceCents: 999, // $9.99
    aiMatchesPerDay: 5,
  },
  enterprise: {
    planName: 'Enterprise',
    dailyPoints: 2000,
    monthlyPriceCents: 2499, // $24.99
    aiMatchesPerDay: 20,
  },
};

// Export pricing constants for use in UI
export { TIER_POINTS, A_LA_CARTE_PACKAGES, SUBSCRIPTION_PRICING };

/**
 * Get or create promotion account for user
 * NOTE: promotion_accounts table has been removed (old boost system)
 * This function now returns null for backward compatibility
 */
export async function getPromotionAccount(userId) {
  if (!userId) return null;
  
  // Old boost system removed - return null
  return null;
  
  /* OLD CODE - promotion_accounts table removed
  try {
    const supabase = createSupabaseServiceRoleClient();
    
    // Check if account exists
    let { data: account, error } = await supabase
      .from('promotion_accounts')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (error && error.code === 'PGRST116') {
      // Account doesn't exist, create it
      const { data: newAccount, error: createError } = await supabase
        .from('promotion_accounts')
        .insert({
          user_id: userId,
          tier: 'explorer',
          daily_points_available: TIER_POINTS.explorer,
          last_daily_reset: new Date().toISOString(),
        })
        .select()
        .single();

      if (createError) {
        console.error('Error creating promotion account:', createError);
        return null;
      }

      return newAccount;
    }

    if (error) {
      console.error('Error fetching promotion account:', error);
      return null;
    }

    // OLD CODE CONTINUED - promotion_accounts table removed
    return null;
  } catch (error) {
    console.error('Error in getPromotionAccount:', error);
    return null;
  }
  */
}

/**
 * Spend points on a tour
 */
const MIN_BOOST_POINTS = 10; // Minimum boost requirement to prevent inefficient small transactions

export async function spendPointsOnTour(userId, productId, pointsToSpend, scoreType = 'all', tourData = null) {
  if (!userId || !productId || pointsToSpend <= 0) {
    return { error: 'Invalid parameters' };
  }

  // Enforce minimum boost requirement
  if (pointsToSpend < MIN_BOOST_POINTS) {
    return { error: `Minimum boost is ${MIN_BOOST_POINTS} points. This prevents inefficient small transactions.` };
  }

  try {
    const supabase = createSupabaseServiceRoleClient();

    // Get user's promotion account
    const account = await getPromotionAccount(userId);
    if (!account) {
      return { error: 'Promotion account not found' };
    }

    // Read daily points from profiles table (primary source of truth)
    const { data: profile } = await supabase
      .from('profiles')
      .select('daily_points_available')
      .eq('id', userId)
      .single();

    const currentPoints = profile?.daily_points_available ?? account.daily_points_available ?? 0;

    // Check if user has enough points
    if (currentPoints < pointsToSpend) {
      return { error: 'Insufficient points available' };
    }

    // Deduct points from both promotion_accounts and profiles tables
    const newPointsAvailable = currentPoints - pointsToSpend;
    const { error: deductError } = await supabase
      .from('promotion_accounts')
      .update({
        daily_points_available: newPointsAvailable, // Keep for backward compatibility
        total_points_spent_all_time: (account.total_points_spent_all_time || 0) + pointsToSpend,
      })
      .eq('user_id', userId);

    // Also update profiles table (primary source of truth)
    await supabase
      .from('profiles')
      .update({
        daily_points_available: newPointsAvailable,
      })
      .eq('id', userId);

    if (deductError) {
      console.error('Error deducting points:', deductError);
      return { error: 'Failed to deduct points' };
    }

    // Get or create tour promotion record
    let { data: tourPromo, error: tourError } = await supabase
      .from('tour_promotions')
      .select('*')
      .eq('product_id', productId)
      .single();

    const isNewTour = tourError && tourError.code === 'PGRST116';
    const needsMetadata = isNewTour || !tourPromo?.tour_name;

    // Extract destination_id early if available from tourData
    let destinationId = null;
    if (tourData) {
      destinationId = tourData._destinationId || null;
      // Normalize _destinationId (remove 'd' prefix if present, convert to string)
      if (destinationId) {
        destinationId = destinationId.toString().replace(/^d/i, '');
      }
      // Also try to extract from destinations array if _destinationId not provided
      if (!destinationId && tourData.destinations && tourData.destinations.length > 0) {
        const dest = tourData.destinations[0];
        destinationId = dest?.ref || dest?.destinationId || dest?.id || null;
        // Normalize (remove 'd' prefix if present)
        if (destinationId) {
          destinationId = destinationId.toString().replace(/^d/i, '');
        }
      }
    }

    if (isNewTour) {
      // Tour doesn't exist, create it
      const { data: newTourPromo, error: createError } = await supabase
        .from('tour_promotions')
        .insert({
          product_id: productId,
          total_score: scoreType === 'all' ? pointsToSpend : 0,
          monthly_score: scoreType === 'monthly' ? pointsToSpend : 0,
          weekly_score: scoreType === 'weekly' ? pointsToSpend : 0,
          past_28_days_score: pointsToSpend, // Always update past 28 days
          destination_id: destinationId || null, // Include destination_id from the start
          first_promoted_at: new Date().toISOString(),
          last_promoted_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (createError) {
        console.error('Error creating tour promotion:', createError);
        return { error: 'Failed to create tour promotion' };
      }

      tourPromo = newTourPromo;
    } else if (tourError) {
      console.error('Error fetching tour promotion:', tourError);
      return { error: 'Failed to fetch tour promotion' };
    } else {
      // Update existing tour promotion
      const updateData = {
        last_promoted_at: new Date().toISOString(),
        past_28_days_score: (tourPromo.past_28_days_score || 0) + pointsToSpend,
      };

      if (scoreType === 'all') {
        updateData.total_score = (tourPromo.total_score || 0) + pointsToSpend;
      } else if (scoreType === 'monthly') {
        updateData.monthly_score = (tourPromo.monthly_score || 0) + pointsToSpend;
      } else if (scoreType === 'weekly') {
        updateData.weekly_score = (tourPromo.weekly_score || 0) + pointsToSpend;
      }

      const { error: updateError } = await supabase
        .from('tour_promotions')
        .update(updateData)
        .eq('product_id', productId);

      if (updateError) {
        console.error('Error updating tour promotion:', updateError);
        return { error: 'Failed to update tour promotion' };
      }
    }

    // Save tour metadata if needed - use provided data, cache, or fetch from Viator
    if (needsMetadata) {
      try {
        // Priority 1: Use tour data provided from the page (no API call!)
        if (tourData) {
          await updateTourMetadata(productId, tourData);
          console.log(`✅ Metadata saved from page data for ${productId}`);
        } else {
          // Priority 2: Try cache first (no API call if cached)
          const cached = await getCachedTour(productId);
          if (cached) {
            await updateTourMetadata(productId, cached);
            console.log(`✅ Metadata saved from cache for ${productId}`);
          } else {
            // Priority 3: Only fetch from Viator if not in cache
            await fetchTourMetadataAsync(productId);
          }
        }
      } catch (err) {
        console.error(`Error saving metadata for ${productId}:`, err);
        // Continue even if metadata save fails
      }
    }

    // Create transaction record
    const { error: transactionError } = await supabase
      .from('promotion_transactions')
      .insert({
        user_id: userId,
        product_id: productId,
        points_spent: pointsToSpend,
        transaction_type: 'daily_points',
        score_type: scoreType,
      });

    if (transactionError) {
      console.error('Error creating transaction:', transactionError);
      // Don't fail the whole operation if transaction logging fails
    }

    // Return remaining points from profiles (primary source of truth)
    return { success: true, remainingPoints: newPointsAvailable };
  } catch (error) {
    console.error('Error in spendPointsOnTour:', error);
    return { error: 'Failed to spend points' };
  }
}

/**
 * Get tour promotion score
 */
export async function getTourPromotionScore(productId) {
  if (!productId) return null;

  try {
    const supabase = createSupabaseServiceRoleClient();
    const { data, error } = await supabase
      .from('tour_promotions')
      .select('*')
      .eq('product_id', productId)
      .single();

    if (error && error.code === 'PGRST116') {
      return null; // Tour not promoted yet
    }

    if (error) {
      console.error('Error fetching tour promotion:', error);
      return null;
    }

    return data;
  } catch (error) {
    console.error('Error in getTourPromotionScore:', error);
    return null;
  }
}

/**
 * Fetch tour metadata from Viator API and cache it
 * This is called when a tour is first promoted to save all necessary data
 */
async function fetchTourMetadataAsync(productId) {
  try {
    // Use same fallback pattern as other API routes
    const apiKey = process.env.VIATOR_API_KEY || '282a363f-5d60-456a-a6a0-774ec4832b07';
    
    if (!apiKey) {
      console.warn(`VIATOR_API_KEY not set, cannot fetch metadata for ${productId}`);
      return;
    }

    const response = await fetch(
      `https://api.viator.com/partner/products/${productId}?currency=USD`,
      {
        headers: {
          'exp-api-key': apiKey,
          'Accept': 'application/json',
          'Accept-Language': 'en-US',
        },
      }
    );

    if (!response.ok) {
      const errorText = await response.text().catch(() => 'Unknown error');
      console.error(`Failed to fetch tour ${productId}: ${response.status} ${response.statusText} - ${errorText}`);
      return;
    }

    const tourData = await response.json();
    if (tourData) {
      await updateTourMetadata(productId, tourData);
      console.log(`✅ Metadata saved for ${productId}`);
    } else {
      console.error(`No tour data returned for ${productId}`);
    }
  } catch (error) {
    console.error(`Error fetching tour metadata for ${productId}:`, error);
    // Don't throw - let the boost succeed even if metadata fetch fails
  }
}

/**
 * Update tour metadata in tour_promotions (name, image, region)
 * This caches tour data to avoid repeated API calls
 */
export async function updateTourMetadata(productId, tourData) {
  if (!productId || !tourData) return;

  try {
    const supabase = createSupabaseServiceRoleClient();
    
    // Extract tour name
    const tourName = tourData.seo?.title || 
                     tourData.title || 
                     tourData.productContent?.title ||
                     tourData.productContent?.productName ||
                     tourData.productContent?.name ||
                     tourData.name ||
                     null;

    // Extract tour image (prefer high quality variant)
    const tourImageUrl = tourData.images?.[0]?.variants?.[3]?.url || 
                         tourData.images?.[0]?.variants?.[2]?.url ||
                         tourData.images?.[0]?.variants?.[1]?.url ||
                         tourData.images?.[0]?.variants?.[0]?.url ||
                         null;

    // Extract slug for URL generation
    const tourSlug = tourData.seo?.slug || 
                     tourData.slug ||
                     (tourName ? tourName.toLowerCase()
                       .replace(/[^a-z0-9]+/g, '-')
                       .replace(/(^-|-$)/g, '') : null);

    // Extract region and destination_id from destinations
    // Priority 1: Use _destinationId if provided (from page context) - this is the Viator numeric ID
    // Priority 2: Extract from tourData.destinations array
    let tourRegion = null;
    let destinationId = tourData._destinationId || null;
    // Normalize _destinationId if provided (remove 'd' prefix, ensure it's a string)
    if (destinationId) {
      destinationId = destinationId.toString().replace(/^d/i, '');
    }
    
    // Track if we have a numeric Viator ID (not a slug)
    const hasNumericViatorId = destinationId && /^\d+$/.test(destinationId);
    
    if (tourData.destinations && tourData.destinations.length > 0) {
      // Try to determine region from destination
      const destination = tourData.destinations[0];
      const destinationName = (destination.destinationName || destination.name || '').toLowerCase();
      const destinationRef = destination.destinationRef || destination.ref || '';
      
      // Try to match with our internal destinations data (for region detection only)
      try {
        const { destinations } = await import('@/data/destinationsData');
        const { slugToViatorId } = await import('@/data/viatorDestinationMap');
        
        // Build reverse map (viatorId -> slug)
        const viatorIdToSlug = {};
        Object.entries(slugToViatorId).forEach(([slug, viatorId]) => {
          viatorIdToSlug[viatorId] = slug;
        });
        
        // First, try to match by Viator destination ID
        let matchedDestination = null;
        if (destinationRef) {
          const viatorId = destinationRef.replace('d', ''); // Remove 'd' prefix
          const slug = viatorIdToSlug[viatorId];
          if (slug) {
            matchedDestination = destinations.find(d => d.id === slug);
          }
        }
        
        // If no match by ID, try to match by name
        if (!matchedDestination) {
          matchedDestination = destinations.find(d => 
            destinationName.includes(d.name.toLowerCase()) || 
            destinationName.includes(d.id.toLowerCase())
          );
        }
        
        // Only use matched destination for region, NOT for destinationId if we already have a numeric Viator ID
        if (matchedDestination && !hasNumericViatorId) {
          // Only set destinationId to slug if we don't already have a numeric Viator ID
          destinationId = matchedDestination.id;
          
          if (matchedDestination.category) {
            // Map category to region slug
            const categoryLower = matchedDestination.category.toLowerCase();
            if (categoryLower === 'caribbean') {
              tourRegion = 'caribbean';
            } else if (categoryLower === 'europe') {
              tourRegion = 'europe';
            } else if (categoryLower === 'north america' || categoryLower === 'usa' || categoryLower === 'united states') {
              tourRegion = 'north_america';
            } else if (categoryLower === 'asia') {
              tourRegion = 'asia';
            } else if (categoryLower === 'oceania' || categoryLower === 'australia') {
              tourRegion = 'oceania';
            } else if (categoryLower === 'south america' || categoryLower === 'latin america') {
              tourRegion = 'south_america';
            } else if (categoryLower === 'africa') {
              tourRegion = 'africa';
            } else if (categoryLower === 'middle east') {
              tourRegion = 'middle_east';
            }
          }
        }
      } catch (importError) {
        // Fallback to simple name matching if import fails
        console.warn('Could not import destinations data for region detection:', importError);
      }
      
      // If destination_id was provided directly but region not set, try to get it from destination
      if (destinationId && !tourRegion) {
        try {
          const { destinations } = await import('@/data/destinationsData');
          const matchedDestination = destinations.find(d => d.id === destinationId);
          if (matchedDestination && matchedDestination.category) {
            const categoryLower = matchedDestination.category.toLowerCase();
            if (categoryLower === 'caribbean') {
              tourRegion = 'caribbean';
            } else if (categoryLower === 'europe') {
              tourRegion = 'europe';
            } else if (categoryLower === 'north america' || categoryLower === 'usa' || categoryLower === 'united states') {
              tourRegion = 'north_america';
            } else if (categoryLower === 'asia') {
              tourRegion = 'asia';
            } else if (categoryLower === 'oceania' || categoryLower === 'australia') {
              tourRegion = 'oceania';
            } else if (categoryLower === 'south america' || categoryLower === 'latin america') {
              tourRegion = 'south_america';
            } else if (categoryLower === 'africa') {
              tourRegion = 'africa';
            } else if (categoryLower === 'middle east') {
              tourRegion = 'middle_east';
            }
          }
        } catch (importError2) {
          console.warn('Could not import destinations data for region detection:', importError2);
        }
      }
      
      // Fallback: Simple region mapping if no match found
      if (!tourRegion) {
        if (destinationName.includes('caribbean') || 
            ['aruba', 'curacao', 'jamaica', 'nassau', 'punta cana', 'barbados', 'bahamas'].some(d => destinationName.includes(d))) {
          tourRegion = 'caribbean';
        } else if (destinationName.includes('europe') || 
                   ['amsterdam', 'paris', 'london', 'rome', 'barcelona', 'amalfi'].some(d => destinationName.includes(d))) {
          tourRegion = 'europe';
        } else if (destinationName.includes('north america') || 
                   ['new york', 'los angeles', 'miami', 'chicago', 'san francisco'].some(d => destinationName.includes(d))) {
          tourRegion = 'north_america';
        } else if (destinationName.includes('asia') || 
                   ['tokyo', 'bali', 'singapore', 'bangkok', 'hong kong'].some(d => destinationName.includes(d))) {
          tourRegion = 'asia';
        } else if (destinationName.includes('middle east') || 
                   ['dubai', 'abu dhabi', 'doha', 'muscat', 'riyadh', 'tel aviv', 'amman', 'beirut', 'cairo', 'istanbul'].some(d => destinationName.includes(d))) {
          tourRegion = 'middle_east';
        }
      }
    }

    // Check if tour_promotions record exists
    const { data: existingTour, error: fetchError } = await supabase
      .from('tour_promotions')
      .select('product_id')
      .eq('product_id', productId)
      .single();

    const recordExists = existingTour && !fetchError;

    if (recordExists) {
      // Update existing record
      const { error: updateError } = await supabase
        .from('tour_promotions')
        .update({
          tour_name: tourName,
          tour_image_url: tourImageUrl,
          tour_slug: tourSlug || null,
          tour_region: tourRegion || null,
          region: tourRegion || null, // Also update region field
          destination_id: destinationId || null, // Store destination ID for efficient filtering
        })
        .eq('product_id', productId);

      if (updateError) {
        console.error(`Error updating tour metadata for ${productId}:`, updateError);
      } else {
        console.log(`✅ Successfully updated metadata for tour ${productId}: ${tourName || 'N/A'}`);
      }
    } else {
      // Create new record with metadata (will be updated with scores later by purchaseALaCartePoints)
      const { error: insertError } = await supabase
        .from('tour_promotions')
        .insert({
          product_id: productId,
          total_score: 0,
          monthly_score: 0,
          weekly_score: 0,
          past_28_days_score: 0,
          tour_name: tourName,
          tour_image_url: tourImageUrl,
          tour_slug: tourSlug || null,
          tour_region: tourRegion || null,
          region: tourRegion || null,
          destination_id: destinationId || null,
          first_promoted_at: new Date().toISOString(),
          last_promoted_at: new Date().toISOString(),
        });

      if (insertError) {
        console.error(`Error creating tour metadata record for ${productId}:`, insertError);
      } else {
        console.log(`✅ Successfully created metadata record for tour ${productId}: ${tourName || 'N/A'}`);
      }
    }

  } catch (error) {
    console.error('Error updating tour metadata:', error);
  }
}

/**
 * Fetch all promotion scores for a specific destination (most efficient)
 * Returns a map of productId -> score object for all tours with points in that destination
 */
export async function getPromotionScoresByDestination(destinationId) {
  if (!destinationId) return {};

  try {
    const supabase = createSupabaseServiceRoleClient();
    // Normalize destination ID (convert to string, remove 'd' prefix if present)
    const normalizedId = destinationId.toString().replace(/^d/i, '');
    const isNumericId = /^\d+$/.test(normalizedId);
    
    // Build array of possible destination_id values to query
    const possibleIds = [normalizedId];
    
    // If we have a numeric ID, also try to get the slug
    if (isNumericId) {
      try {
        const { data: destInfo } = await supabase
          .from('viator_destinations')
          .select('slug')
          .eq('id', normalizedId)
          .maybeSingle();
        
        if (destInfo?.slug) {
          possibleIds.push(destInfo.slug);
        }
      } catch (lookupError) {
        console.warn('Could not lookup destination slug:', lookupError);
      }
    } else {
      // If it's a slug, try to find the numeric ID
      try {
        const { data: destInfo } = await supabase
          .from('viator_destinations')
          .select('id')
          .eq('slug', normalizedId)
          .maybeSingle();
        
        if (destInfo?.id) {
          possibleIds.push(destInfo.id.toString());
        }
      } catch (lookupError) {
        console.warn('Could not lookup destination ID from slug:', lookupError);
      }
    }
    
    // Query by all possible IDs using OR condition
    // Supabase doesn't support OR directly, so we'll query each and merge
    const allScores = {};
    const seenProductIds = new Set();
    
    for (const idToQuery of possibleIds) {
    const { data, error } = await supabase
      .from('tour_promotions')
      .select('*')
        .eq('destination_id', idToQuery)
      .gt('total_score', 0); // Only tours with points

      if (!error && data) {
      data.forEach(score => {
          // Only add if we haven't seen this product_id yet (avoid duplicates)
          if (!seenProductIds.has(score.product_id)) {
            seenProductIds.add(score.product_id);
            allScores[score.product_id] = score;
          }
      });
      }
    }

    return allScores;
  } catch (error) {
    console.error('Error in getPromotionScoresByDestination:', error);
    return {};
  }
}

/**
 * Get trending tours for a destination (past 28 days score)
 * Returns tours sorted by past_28_days_score, with full metadata
 */
export async function getTrendingToursByDestination(destinationId, limit = 6) {
  if (!destinationId) return [];

  try {
    const supabase = createSupabaseServiceRoleClient();
    // Normalize destination ID (convert to string, remove 'd' prefix if present)
    const normalizedId = destinationId.toString().replace(/^d/i, '');
    const isNumericId = /^\d+$/.test(normalizedId);
    
    // Build array of possible destination_id values to query
    const possibleIds = [normalizedId];
    
    // If we have a numeric ID, also try to get the slug
    if (isNumericId) {
      try {
        const { data: destInfo } = await supabase
          .from('viator_destinations')
          .select('slug')
          .eq('id', normalizedId)
          .maybeSingle();
        
        if (destInfo?.slug) {
          possibleIds.push(destInfo.slug);
        }
      } catch (lookupError) {
        console.warn('Could not lookup destination slug:', lookupError);
      }
    } else {
      // If it's a slug, try to find the numeric ID
      try {
        const { data: destInfo } = await supabase
          .from('viator_destinations')
          .select('id')
          .eq('slug', normalizedId)
          .maybeSingle();
        
        if (destInfo?.id) {
          possibleIds.push(destInfo.id.toString());
        }
      } catch (lookupError) {
        console.warn('Could not lookup destination ID from slug:', lookupError);
      }
    }
    
    // Query by all possible IDs and merge results
    const allTours = [];
    const seenProductIds = new Set();
    
    for (const idToQuery of possibleIds) {
    const { data, error } = await supabase
      .from('tour_promotions')
      .select('*')
        .eq('destination_id', idToQuery)
      .gt('past_28_days_score', 0) // Only tours with points in last 28 days
      .order('past_28_days_score', { ascending: false })
        .limit(limit * 2); // Get more to account for duplicates
      
      if (!error && data) {
        data.forEach(tour => {
          // Only add if we haven't seen this product_id yet (avoid duplicates)
          if (!seenProductIds.has(tour.product_id)) {
            seenProductIds.add(tour.product_id);
            allTours.push(tour);
    }
        });
      }
    }
    
    // Sort by past_28_days_score and limit
    const sortedTours = allTours
      .sort((a, b) => (b.past_28_days_score || 0) - (a.past_28_days_score || 0))
      .slice(0, limit);
    
    return sortedTours;
  } catch (error) {
    console.error('Error in getTrendingToursByDestination:', error);
    return [];
  }
}

/**
 * Batch fetch promotion scores for multiple tours (efficient - one query instead of many)
 * Returns scores with cached metadata (name, image, region) if available
 * NOTE: For destination pages, use getPromotionScoresByDestination() instead - it's more efficient
 */
/**
 * Get tour promotion scores batch
 * NOTE: tour_promotions table has been removed (old boost system)
 * This function now returns empty scores for backward compatibility
 */
export async function getTourPromotionScoresBatch(productIds) {
  if (!productIds || productIds.length === 0) return {};

  // Old boost system removed - return empty scores
  const result = {};
  productIds.forEach(productId => {
    result[productId] = {
      product_id: productId,
      total_score: 0,
      monthly_score: 0,
      weekly_score: 0,
      past_28_days_score: 0,
    };
  });

  return result;
}

/**
 * Get leaderboard tours
 */
export async function getLeaderboardTours({
  scoreType = 'all', // 'all', 'monthly', 'weekly', 'last_month'
  region = null,
  limit = 20,
  offset = 0,
}) {
  try {
    const supabase = createSupabaseServiceRoleClient();
    
    let query = supabase
      .from('tour_promotions')
      .select('*')
      .order(getScoreColumn(scoreType), { ascending: false })
      .range(offset, offset + limit - 1);

    if (region) {
      query = query.eq('region', region);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching leaderboard:', error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error('Error in getLeaderboardTours:', error);
    return [];
  }
}

/**
 * Get score column name based on score type
 */
function getScoreColumn(scoreType) {
  switch (scoreType) {
    case 'monthly':
      return 'monthly_score';
    case 'weekly':
      return 'weekly_score';
    case 'last_month':
      return 'past_28_days_score'; // Using past_28_days for "last month(s)"
    default:
      return 'total_score';
  }
}

/**
 * Update tour region (auto-detect from destination)
 */
export async function updateTourRegion(productId, region) {
  if (!productId || !region) return;

  try {
    const supabase = createSupabaseServiceRoleClient();
    await supabase
      .from('tour_promotions')
      .upsert({
        product_id: productId,
        region: region,
      }, {
        onConflict: 'product_id',
      });
  } catch (error) {
    console.error('Error updating tour region:', error);
  }
}

/**
 * Purchase a la carte points for a specific tour
 * This is called after Stripe payment is confirmed
 * Points are applied immediately to the tour (not added to user's wallet)
 */
export async function purchaseALaCartePoints(userId, productId, packageName, stripePaymentIntentId, tourData = null) {
  if (!userId || !productId || !packageName || !stripePaymentIntentId) {
    return { error: 'Invalid parameters' };
  }

  const packageInfo = A_LA_CARTE_PACKAGES[packageName];
  if (!packageInfo) {
    return { error: 'Invalid package name' };
  }

  try {
    const supabase = createSupabaseServiceRoleClient();

    // SIMPLIFIED: Just like regular boosts, but with instant boost points
    // Metadata is already saved during checkout, so we just need to add points
    
    // Get or create tour promotion record
    let { data: tourPromo, error: tourError } = await supabase
      .from('tour_promotions')
      .select('*')
      .eq('product_id', productId)
      .single();

    const isNewTour = tourError && tourError.code === 'PGRST116';

    if (isNewTour) {
      // Tour doesn't exist - create it with points
      // Metadata should already be saved during checkout, so it should exist
      // But if it doesn't, we'll create the record anyway (metadata will be saved separately if needed)
      const { data: newTourPromo, error: createError } = await supabase
        .from('tour_promotions')
        .insert({
          product_id: productId,
          total_score: packageInfo.points,
          monthly_score: packageInfo.points,
          weekly_score: packageInfo.points,
          past_28_days_score: packageInfo.points,
          first_promoted_at: new Date().toISOString(),
          last_promoted_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (createError) {
        console.error('Error creating tour promotion:', createError);
        return { error: 'Failed to create tour promotion' };
      }

      tourPromo = newTourPromo;
    } else if (tourError) {
      console.error('Error fetching tour promotion:', tourError);
      return { error: 'Failed to fetch tour promotion' };
    } else {
      // Update existing tour promotion - add points to all score types (just like regular boost)
      const { error: updateError } = await supabase
        .from('tour_promotions')
        .update({
          total_score: (tourPromo.total_score || 0) + packageInfo.points,
          monthly_score: (tourPromo.monthly_score || 0) + packageInfo.points,
          weekly_score: (tourPromo.weekly_score || 0) + packageInfo.points,
          past_28_days_score: (tourPromo.past_28_days_score || 0) + packageInfo.points,
          last_promoted_at: new Date().toISOString(),
        })
        .eq('product_id', productId);

      if (updateError) {
        console.error('Error updating tour promotion:', updateError);
        return { error: 'Failed to update tour promotion' };
      }
    }

    // Check if this payment intent was already processed (prevent duplicate processing)
    // This ensures that if the webhook fires twice, we don't add points twice
    const { data: existingTransaction } = await supabase
      .from('promotion_transactions')
      .select('id')
      .eq('stripe_payment_intent_id', stripePaymentIntentId)
      .single();

    if (existingTransaction) {
      console.warn(`⚠️ Payment intent ${stripePaymentIntentId} was already processed. Skipping duplicate to prevent double-counting.`);
      return { 
        error: 'This payment has already been processed',
        alreadyProcessed: true 
      };
    }

    // Create transaction record
    const { error: transactionError } = await supabase
      .from('promotion_transactions')
      .insert({
        user_id: userId,
        product_id: productId,
        points_spent: packageInfo.points,
        transaction_type: 'a_la_carte',
        a_la_carte_package: packageName,
        amount_paid_cents: packageInfo.priceCents,
        stripe_payment_intent_id: stripePaymentIntentId,
        score_type: 'all', // A la carte affects all score types
      });

    if (transactionError) {
      console.error('Error creating transaction:', transactionError);
      // Transaction is already applied, so we don't fail here
    } else {
      console.log(`✅ Transaction record created for payment intent ${stripePaymentIntentId}`);
    }

    return { 
      success: true, 
      pointsApplied: packageInfo.points,
      newTotalScore: (tourPromo?.total_score || 0) + packageInfo.points,
    };
  } catch (error) {
    console.error('Error in purchaseALaCartePoints:', error);
    return { error: 'Failed to purchase a la carte points' };
  }
}

/**
 * Purchase a la carte points for a specific restaurant
 * This is called after Stripe payment is confirmed
 * Points are applied immediately to the restaurant (not added to user's wallet)
 */
export async function purchaseALaCartePointsForRestaurant(userId, restaurantId, packageName, stripePaymentIntentId, restaurantData = null) {
  if (!userId || !restaurantId || !packageName || !stripePaymentIntentId) {
    return { error: 'Invalid parameters' };
  }

  const packageInfo = A_LA_CARTE_PACKAGES[packageName];
  if (!packageInfo) {
    return { error: 'Invalid package name' };
  }

  try {
    const supabase = createSupabaseServiceRoleClient();

    // SIMPLIFIED: Just like regular boosts, but with instant boost points
    // Metadata is already saved during checkout, so we just need to add points
    
    // Get or create restaurant promotion record
    let { data: restaurantPromo, error: restaurantError } = await supabase
      .from('restaurant_promotions')
      .select('*')
      .eq('restaurant_id', restaurantId)
      .single();

    const isNewRestaurant = restaurantError && restaurantError.code === 'PGRST116';

    if (isNewRestaurant) {
      // Restaurant doesn't exist - create it with points
      // Metadata should already be saved during checkout, so it should exist
      // But if it doesn't, we'll create the record anyway (metadata will be saved separately if needed)
      const { data: newRestaurantPromo, error: createError } = await supabase
        .from('restaurant_promotions')
        .insert({
          restaurant_id: restaurantId,
          total_score: packageInfo.points,
          monthly_score: packageInfo.points,
          weekly_score: packageInfo.points,
          past_28_days_score: packageInfo.points,
          first_promoted_at: new Date().toISOString(),
          last_promoted_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (createError) {
        console.error('Error creating restaurant promotion:', createError);
        return { error: 'Failed to create restaurant promotion' };
      }

      restaurantPromo = newRestaurantPromo;
    } else if (restaurantError) {
      console.error('Error fetching restaurant promotion:', restaurantError);
      return { error: 'Failed to fetch restaurant promotion' };
    } else {
      // Update existing restaurant promotion - add points to all score types (just like regular boost)
      const { error: updateError } = await supabase
        .from('restaurant_promotions')
        .update({
          total_score: (restaurantPromo.total_score || 0) + packageInfo.points,
          monthly_score: (restaurantPromo.monthly_score || 0) + packageInfo.points,
          weekly_score: (restaurantPromo.weekly_score || 0) + packageInfo.points,
          past_28_days_score: (restaurantPromo.past_28_days_score || 0) + packageInfo.points,
          last_promoted_at: new Date().toISOString(),
        })
        .eq('restaurant_id', restaurantId);

      if (updateError) {
        console.error('Error updating restaurant promotion:', updateError);
        return { error: 'Failed to update restaurant promotion' };
      }
    }

    // Check if this payment intent was already processed (prevent duplicate processing)
    // This ensures that if the webhook fires twice, we don't add points twice
    const { data: existingTransaction } = await supabase
      .from('promotion_transactions')
      .select('id')
      .eq('stripe_payment_intent_id', stripePaymentIntentId)
      .single();

    if (existingTransaction) {
      console.warn(`⚠️ Payment intent ${stripePaymentIntentId} was already processed. Skipping duplicate to prevent double-counting.`);
      return { 
        error: 'This payment has already been processed',
        alreadyProcessed: true 
      };
    }

    // Create transaction record
    const { error: transactionError } = await supabase
      .from('promotion_transactions')
      .insert({
        user_id: userId,
        restaurant_id: restaurantId,
        points_spent: packageInfo.points,
        transaction_type: 'a_la_carte',
        a_la_carte_package: packageName,
        amount_paid_cents: packageInfo.priceCents,
        stripe_payment_intent_id: stripePaymentIntentId,
        score_type: 'all', // A la carte affects all score types
      });

    if (transactionError) {
      console.error('Error creating transaction:', transactionError);
      // Transaction is already applied, so we don't fail here
    } else {
      console.log(`✅ Transaction record created for payment intent ${stripePaymentIntentId}`);
    }

    return { 
      success: true, 
      pointsApplied: packageInfo.points,
      newTotalScore: (restaurantPromo?.total_score || 0) + packageInfo.points,
    };
  } catch (error) {
    console.error('Error in purchaseALaCartePointsForRestaurant:', error);
    return { error: 'Failed to purchase a la carte points' };
  }
}

/**
 * Get recent boosts (transactions) - includes both tours and restaurants
 */
export async function getRecentBoosts(limit = 20) {
  try {
    const supabase = createSupabaseServiceRoleClient();
    
    // First, get the transactions (both tours and restaurants)
    const { data: transactions, error: transactionsError } = await supabase
      .from('promotion_transactions')
      .select('id, user_id, product_id, restaurant_id, points_spent, created_at, transaction_type')
      .order('created_at', { ascending: false })
      .limit(limit * 2); // Get more to account for filtering

    if (transactionsError) {
      console.error('Error fetching recent boosts:', transactionsError);
      return [];
    }

    // Also get recent restaurant promotions directly from restaurant_promotions table
    // This catches restaurants that might have null restaurant_id in transactions
    const { data: recentRestaurants, error: restaurantsError } = await supabase
      .from('restaurant_promotions')
      .select('restaurant_id, last_promoted_at, destination_id')
      .not('last_promoted_at', 'is', null)
      .order('last_promoted_at', { ascending: false })
      .limit(limit);

    if (restaurantsError) {
      console.warn('Error fetching recent restaurant promotions:', restaurantsError);
    }

    // Get recent plan promotions
    const { data: recentPlans, error: plansError } = await supabase
      .from('plan_promotions')
      .select('id, plan_id, user_id, points, created_at')
      .order('created_at', { ascending: false })
      .limit(limit);

    if (plansError) {
      console.warn('Error fetching recent plan promotions:', plansError);
    }

    // Get transactions for restaurants that were recently promoted
    // This ensures we catch restaurants even if restaurant_id was null in some transactions
    let restaurantTransactions = [];
    if (recentRestaurants && recentRestaurants.length > 0) {
      const restaurantIds = recentRestaurants.map(r => r.restaurant_id);
      
      // Get all transactions for these restaurants
      const { data: restTransactions, error: restTransError } = await supabase
        .from('promotion_transactions')
        .select('id, user_id, product_id, restaurant_id, points_spent, created_at, transaction_type, destination_id')
        .in('restaurant_id', restaurantIds)
        .order('created_at', { ascending: false });

      if (!restTransError && restTransactions) {
        // Group transactions by restaurant_id and get the most recent one for each
        const restaurantTransactionMap = {};
        restTransactions.forEach(trans => {
          if (trans.restaurant_id) {
            const existing = restaurantTransactionMap[trans.restaurant_id];
            if (!existing || new Date(trans.created_at) > new Date(existing.created_at)) {
              restaurantTransactionMap[trans.restaurant_id] = trans;
            }
          }
        });

        // For restaurants that were recently promoted but don't have a matching transaction,
        // try to find a transaction created around the same time (within 1 hour)
        recentRestaurants.forEach(restaurant => {
          if (!restaurantTransactionMap[restaurant.restaurant_id]) {
            // Try to find a transaction created around the same time as last_promoted_at
            const promoTime = new Date(restaurant.last_promoted_at);
            const timeWindowStart = new Date(promoTime.getTime() - 3600000); // 1 hour before
            const timeWindowEnd = new Date(promoTime.getTime() + 3600000); // 1 hour after
            
            const matchingTrans = (transactions || []).find(trans => {
              if (trans.restaurant_id === restaurant.restaurant_id) return true;
              const transTime = new Date(trans.created_at);
              return transTime >= timeWindowStart && transTime <= timeWindowEnd && !trans.product_id;
            });

            if (matchingTrans) {
              // Found a transaction that might be for this restaurant
              restaurantTransactionMap[restaurant.restaurant_id] = {
                ...matchingTrans,
                restaurant_id: restaurant.restaurant_id, // Ensure restaurant_id is set
                destination_id: restaurant.destination_id,
              };
            } else {
              // No transaction found - create a synthetic entry (user will be anonymous)
              restaurantTransactionMap[restaurant.restaurant_id] = {
                id: `restaurant_${restaurant.restaurant_id}_${restaurant.last_promoted_at}`,
                user_id: null,
                product_id: null,
                restaurant_id: restaurant.restaurant_id,
                points_spent: null,
                created_at: restaurant.last_promoted_at,
                transaction_type: 'restaurant_promotion',
                destination_id: restaurant.destination_id,
              };
            }
          } else {
            // Add destination_id to existing transaction if missing
            if (!restaurantTransactionMap[restaurant.restaurant_id].destination_id) {
              restaurantTransactionMap[restaurant.restaurant_id].destination_id = restaurant.destination_id;
            }
          }
        });

        restaurantTransactions = Object.values(restaurantTransactionMap);
      } else if (recentRestaurants.length > 0) {
        // If we couldn't get transactions, still create entries for the restaurants
        recentRestaurants.forEach(restaurant => {
          restaurantTransactions.push({
            id: `restaurant_${restaurant.restaurant_id}_${restaurant.last_promoted_at}`,
            user_id: null,
            product_id: null,
            restaurant_id: restaurant.restaurant_id,
            points_spent: null,
            created_at: restaurant.last_promoted_at,
            transaction_type: 'restaurant_promotion',
            destination_id: restaurant.destination_id,
          });
        });
      }
    }

    // Combine all transactions (tours + restaurants + plans)
    // Start with tour transactions (those with product_id)
    const tourTransactions = (transactions || []).filter(t => t.product_id && !t.restaurant_id);
    
    // Get restaurant transactions from the main transactions list
    const restaurantTransFromMain = (transactions || []).filter(t => t.restaurant_id);
    
    // Convert plan promotions to transaction-like format
    const planTransactions = (recentPlans || []).map(plan => ({
      id: plan.id,
      user_id: plan.user_id,
      plan_id: plan.plan_id,
      product_id: null,
      restaurant_id: null,
      points_spent: plan.points,
      created_at: plan.created_at,
      transaction_type: 'plan_promotion',
    }));
    
    // Combine: tours + restaurant transactions from main list + restaurant transactions from restaurant_promotions + plans
    const allTransactions = [...tourTransactions, ...restaurantTransFromMain, ...planTransactions];
    
    // Add restaurant transactions from restaurant_promotions that aren't already in the list
    if (restaurantTransactions.length > 0) {
      restaurantTransactions.forEach(restTrans => {
        // Check if we already have this restaurant transaction
        const exists = allTransactions.some(t => 
          t.restaurant_id === restTrans.restaurant_id && 
          Math.abs(new Date(t.created_at) - new Date(restTrans.created_at)) < 60000 // Within 1 minute
        );
        if (!exists) {
          allTransactions.push(restTrans);
        }
      });
    }

    // Sort by created_at and limit
    allTransactions.sort((a, b) => {
      const dateA = new Date(a.created_at);
      const dateB = new Date(b.created_at);
      return dateB - dateA;
    });

    const finalTransactions = allTransactions.slice(0, limit);

    if (finalTransactions.length === 0) {
      return [];
    }

    // Get unique user IDs
    const userIds = [...new Set(finalTransactions.map(t => t.user_id).filter(Boolean))];
    
    // Fetch profiles, promotion accounts (for tier/streak), and emails
    let profilesMap = {};
    let accountsMap = {};
    
    if (userIds.length > 0) {
      // Fetch profiles
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('id, display_name')
        .in('id', userIds);

      if (profilesError) {
        console.error('Error fetching profiles for recent boosts:', profilesError);
      }
      
      // NOTE: promotion_accounts table has been removed (old boost system)
      // Skip fetching promotion accounts - always use empty map
      const accountsMap = {};
      
      if (profiles && profiles.length > 0) {
        // Get emails from auth.users for these user IDs
        const emailsMap = {};
        try {
          const { data: { users }, error: authError } = await supabase.auth.admin.listUsers();
          if (!authError && users) {
            users.forEach(authUser => {
              if (userIds.includes(authUser.id) && authUser.email) {
                emailsMap[authUser.id] = authUser.email;
              }
            });
          }
        } catch (err) {
          console.warn('Could not fetch user emails (non-critical):', err);
        }
        
        profilesMap = profiles.reduce((acc, profile) => {
          acc[profile.id] = {
            id: profile.id,
            display_name: profile.display_name,
            email: emailsMap[profile.id] || null,
            tier: accountsMap[profile.id]?.tier || 'explorer',
            streak_days: accountsMap[profile.id]?.streak_days || 0,
          };
          return acc;
        }, {});
      }
    }

    // Combine transactions with profiles and account data
    const boosts = finalTransactions.map(transaction => {
      const profile = transaction.user_id ? profilesMap[transaction.user_id] || null : null;
      
      return {
        ...transaction,
        profiles: profile,
        user_email: profile?.email || null,
        tier: profile?.tier || 'explorer',
        streak_days: profile?.streak_days || 0,
      };
    });

    return boosts;
  } catch (error) {
    console.error('Error in getRecentBoosts:', error);
    return [];
  }
}

/**
 * Get top promoters (lightweight - just queries promotion_accounts and profiles)
 * Only counts points from subscriptions (daily points), not instant boosts
 */
export async function getTopPromoters(limit = 10) {
  try {
    const supabase = createSupabaseServiceRoleClient();
    
    // Get top promoters by total_points_spent_all_time
    // This only includes points from daily subscriptions, not instant boosts
    const { data: accounts, error: accountsError } = await supabase
      .from('promotion_accounts')
      .select('user_id, total_points_spent_all_time, tier, streak_days')
      .not('total_points_spent_all_time', 'is', null)
      .gt('total_points_spent_all_time', 0)
      .order('total_points_spent_all_time', { ascending: false })
      .limit(limit);

    if (accountsError) {
      console.error('Error fetching top promoters:', accountsError);
      return [];
    }

    if (!accounts || accounts.length === 0) {
      return [];
    }

    // Get user IDs
    const userIds = accounts.map(a => a.user_id).filter(Boolean);
    
    // Fetch display names from profiles
    const { data: profiles, error: profilesError } = await supabase
      .from('profiles')
      .select('id, display_name')
      .in('id', userIds);

    if (profilesError) {
      console.error('Error fetching profiles for top promoters:', profilesError);
      // Continue without display names
    }

    // Create profiles map
    const profilesMap = {};
    if (profiles) {
      profiles.forEach(profile => {
        profilesMap[profile.id] = profile.display_name;
      });
    }

    // Combine accounts with profiles
    const promoters = accounts.map(account => ({
      user_id: account.user_id,
      display_name: profilesMap[account.user_id] || null,
      total_points_spent: account.total_points_spent_all_time || 0,
      tier: account.tier || 'explorer',
      streak_days: account.streak_days || 0,
    }));

    return promoters;
  } catch (error) {
    console.error('Error in getTopPromoters:', error);
    return [];
  }
}

/**
 * Get hardcoded tours for a specific destination and category
 * Lightweight function - fetches from Supabase (no API calls)
 * Returns tours for the specified category with TopTours scores
 */
export async function getHardcodedToursByCategory(destinationId, categoryName) {
  if (!destinationId || !categoryName) return [];

  try {
    const supabase = createSupabaseServiceRoleClient();
    
    // Fetch hardcoded tours for this destination and category
    const { data: hardcodedTours, error: toursError } = await supabase
      .from('hardcoded_destination_tours')
      .select('*')
      .eq('destination', destinationId)
      .eq('category', categoryName)
      .order('position');

    if (toursError) {
      console.error('Error fetching hardcoded tours by category:', toursError);
      return [];
    }

    if (!hardcodedTours || hardcodedTours.length === 0) {
      return []; // No hardcoded tours for this category
    }

    // Get product IDs to fetch scores
    const productIds = hardcodedTours.map(tour => tour.product_id).filter(Boolean);
    
    // Fetch TopTours scores for these tours
    let scoresMap = {};
    if (productIds.length > 0) {
      const { data: scores, error: scoresError } = await supabase
        .from('tour_promotions')
        .select('product_id, total_score, past_28_days_score')
        .in('product_id', productIds);

      if (!scoresError && scores) {
        scoresMap = scores.reduce((acc, score) => {
          acc[score.product_id] = {
            totalScore: score.total_score || 0,
            lastMonthScore: score.past_28_days_score || 0,
          };
          return acc;
        }, {});
      }
    }

    // Format tours with scores
    return hardcodedTours.map(tour => {
      const score = scoresMap[tour.product_id] || { totalScore: 0, lastMonthScore: 0 };
      
      return {
        productId: tour.product_id,
        title: tour.title,
        image: tour.image_url,
        totalScore: score.totalScore,
        lastMonthScore: score.lastMonthScore,
      };
    });
  } catch (error) {
    console.error('Error in getHardcodedToursByCategory:', error);
    return [];
  }
}

/**
 * Get hardcoded tours for a destination by category
 * Lightweight function - fetches from Supabase (no API calls)
 * Returns tours organized by category with TopTours scores
 */
export async function getHardcodedToursByDestination(destinationId) {
  if (!destinationId) return {};

  try {
    const supabase = createSupabaseServiceRoleClient();
    
    // Fetch hardcoded tours for this destination
    const { data: hardcodedTours, error: toursError } = await supabase
      .from('hardcoded_destination_tours')
      .select('*')
      .eq('destination', destinationId)
      .order('category')
      .order('position');

    if (toursError) {
      console.error('Error fetching hardcoded tours:', toursError);
      return {};
    }

    if (!hardcodedTours || hardcodedTours.length === 0) {
      return {}; // No hardcoded tours yet
    }

    // Get product IDs to fetch scores
    const productIds = hardcodedTours.map(tour => tour.product_id).filter(Boolean);
    
    // Fetch TopTours scores for these tours
    let scoresMap = {};
    if (productIds.length > 0) {
      const { data: scores, error: scoresError } = await supabase
        .from('tour_promotions')
        .select('product_id, total_score, past_28_days_score')
        .in('product_id', productIds);

      if (!scoresError && scores) {
        scoresMap = scores.reduce((acc, score) => {
          acc[score.product_id] = {
            totalScore: score.total_score || 0,
            lastMonthScore: score.past_28_days_score || 0,
          };
          return acc;
        }, {});
      }
    }

    // Organize tours by category
    const toursByCategory = {};
    hardcodedTours.forEach(tour => {
      if (!toursByCategory[tour.category]) {
        toursByCategory[tour.category] = [];
      }
      
      const score = scoresMap[tour.product_id] || { totalScore: 0, lastMonthScore: 0 };
      
      toursByCategory[tour.category].push({
        productId: tour.product_id,
        title: tour.title,
        image: tour.image_url,
        // Add score data
        totalScore: score.totalScore,
        lastMonthScore: score.lastMonthScore,
      });
    });

    return toursByCategory;
  } catch (error) {
    console.error('Error in getHardcodedToursByDestination:', error);
    return {};
  }
}

// ============================================================================
// RESTAURANT PROMOTION FUNCTIONS
// ============================================================================

/**
 * Spend points on a restaurant
 */
export async function spendPointsOnRestaurant(userId, restaurantId, pointsToSpend, scoreType = 'all', restaurantData = null) {
  if (!userId || !restaurantId || pointsToSpend <= 0) {
    return { error: 'Invalid parameters' };
  }

  // Enforce minimum boost requirement
  if (pointsToSpend < MIN_BOOST_POINTS) {
    return { error: `Minimum boost is ${MIN_BOOST_POINTS} points. This prevents inefficient small transactions.` };
  }

  try {
    const supabase = createSupabaseServiceRoleClient();

    // Get user's promotion account
    const account = await getPromotionAccount(userId);
    if (!account) {
      return { error: 'Promotion account not found' };
    }

    // Read daily points from profiles table (primary source of truth)
    const { data: profile } = await supabase
      .from('profiles')
      .select('daily_points_available')
      .eq('id', userId)
      .single();

    const currentPoints = profile?.daily_points_available ?? account.daily_points_available ?? 0;

    // Check if user has enough points
    if (currentPoints < pointsToSpend) {
      return { error: 'Insufficient points available' };
    }

    // Deduct points from both promotion_accounts and profiles tables
    const newPointsAvailable = currentPoints - pointsToSpend;
    const { error: deductError } = await supabase
      .from('promotion_accounts')
      .update({
        daily_points_available: newPointsAvailable, // Keep for backward compatibility
        total_points_spent_all_time: (account.total_points_spent_all_time || 0) + pointsToSpend,
      })
      .eq('user_id', userId);

    // Also update profiles table (primary source of truth)
    await supabase
      .from('profiles')
      .update({
        daily_points_available: newPointsAvailable,
      })
      .eq('id', userId);

    if (deductError) {
      console.error('Error deducting points:', deductError);
      return { error: 'Failed to deduct points' };
    }

    // Get or create restaurant promotion record
    let { data: restaurantPromo, error: restaurantError } = await supabase
      .from('restaurant_promotions')
      .select('*')
      .eq('restaurant_id', restaurantId)
      .single();

    const isNewRestaurant = restaurantError && restaurantError.code === 'PGRST116';
    const needsMetadata = isNewRestaurant || !restaurantPromo?.restaurant_name;

    if (isNewRestaurant) {
      // Restaurant doesn't exist, create it
      const { data: newRestaurantPromo, error: createError } = await supabase
        .from('restaurant_promotions')
        .insert({
          restaurant_id: restaurantId,
          total_score: scoreType === 'all' ? pointsToSpend : 0,
          monthly_score: scoreType === 'monthly' ? pointsToSpend : 0,
          weekly_score: scoreType === 'weekly' ? pointsToSpend : 0,
          past_28_days_score: pointsToSpend, // Always update past 28 days
          first_promoted_at: new Date().toISOString(),
          last_promoted_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (createError) {
        console.error('Error creating restaurant promotion:', createError);
        return { error: 'Failed to create restaurant promotion' };
      }

      restaurantPromo = newRestaurantPromo;
    } else if (restaurantError) {
      console.error('Error fetching restaurant promotion:', restaurantError);
      return { error: 'Failed to fetch restaurant promotion' };
    } else {
      // Update existing restaurant promotion
      const updateData = {
        last_promoted_at: new Date().toISOString(),
        past_28_days_score: (restaurantPromo.past_28_days_score || 0) + pointsToSpend,
      };

      if (scoreType === 'all') {
        updateData.total_score = (restaurantPromo.total_score || 0) + pointsToSpend;
      } else if (scoreType === 'monthly') {
        updateData.monthly_score = (restaurantPromo.monthly_score || 0) + pointsToSpend;
      } else if (scoreType === 'weekly') {
        updateData.weekly_score = (restaurantPromo.weekly_score || 0) + pointsToSpend;
      }

      const { error: updateError } = await supabase
        .from('restaurant_promotions')
        .update(updateData)
        .eq('restaurant_id', restaurantId);

      if (updateError) {
        console.error('Error updating restaurant promotion:', updateError);
        return { error: 'Failed to update restaurant promotion' };
      }
    }

    // Save restaurant metadata if needed
    if (needsMetadata) {
      try {
        if (restaurantData) {
          await updateRestaurantMetadata(restaurantId, restaurantData);
          console.log(`✅ Metadata saved from page data for restaurant ${restaurantId}`);
        } else {
          // Fetch from restaurants table
          const { data: restaurant, error: fetchError } = await supabase
            .from('restaurants')
            .select('*')
            .eq('id', restaurantId)
            .single();

          if (!fetchError && restaurant) {
            await updateRestaurantMetadata(restaurantId, restaurant);
            console.log(`✅ Metadata saved from database for restaurant ${restaurantId}`);
          }
        }
      } catch (err) {
        console.error(`Error saving metadata for restaurant ${restaurantId}:`, err);
        // Continue even if metadata save fails
      }
    }

    // Create transaction record
    const { error: transactionError } = await supabase
      .from('promotion_transactions')
      .insert({
        user_id: userId,
        restaurant_id: restaurantId,
        points_spent: pointsToSpend,
        transaction_type: 'daily_points',
        score_type: scoreType,
      });

    if (transactionError) {
      console.error('Error creating transaction:', transactionError);
      // Don't fail the whole operation if transaction logging fails
    }

    // Return remaining points from profiles (primary source of truth)
    return { success: true, remainingPoints: newPointsAvailable };
  } catch (error) {
    console.error('Error in spendPointsOnRestaurant:', error);
    return { error: 'Failed to spend points' };
  }
}

/**
 * Update restaurant metadata in restaurant_promotions
 */
export async function updateRestaurantMetadata(restaurantId, restaurantData) {
  if (!restaurantId || !restaurantData) return;

  try {
    const supabase = createSupabaseServiceRoleClient();
    
    const restaurantName = restaurantData.name || null;
    const restaurantImageUrl = restaurantData.hero_image_url || restaurantData.heroImage || null;
    const restaurantSlug = restaurantData.slug || null;
    const destinationId = restaurantData.destination_id || null;
    
    // Determine region from destination
    let region = null;
    if (destinationId) {
      try {
        const { destinations } = await import('@/data/destinationsData');
        const destination = Array.isArray(destinations) 
          ? destinations.find(d => d.id === destinationId)
          : null;
        
        if (destination && destination.category) {
          const categoryLower = destination.category.toLowerCase();
          if (categoryLower === 'caribbean') {
            region = 'caribbean';
          } else if (categoryLower === 'europe') {
            region = 'europe';
          } else if (categoryLower === 'north america' || categoryLower === 'usa' || categoryLower === 'united states') {
            region = 'north_america';
          } else if (categoryLower === 'asia' || categoryLower === 'asia-pacific') {
            region = 'asia';
          } else if (categoryLower === 'oceania' || categoryLower === 'australia') {
            region = 'oceania';
          } else if (categoryLower === 'south america' || categoryLower === 'latin america') {
            region = 'south_america';
          } else if (categoryLower === 'africa') {
            region = 'africa';
          } else if (categoryLower === 'middle east') {
            region = 'middle_east';
          }
        }
      } catch (importError) {
        console.warn('Could not import destinations data for region detection:', importError);
      }
    }

    // Check if restaurant_promotions record exists
    const { data: existingRestaurant, error: fetchError } = await supabase
      .from('restaurant_promotions')
      .select('restaurant_id')
      .eq('restaurant_id', restaurantId)
      .single();

    const recordExists = existingRestaurant && !fetchError;

    if (recordExists) {
      // Update existing record
      const { error: updateError } = await supabase
        .from('restaurant_promotions')
        .update({
          restaurant_name: restaurantName,
          restaurant_image_url: restaurantImageUrl,
          restaurant_slug: restaurantSlug,
          destination_id: destinationId,
          region: region,
        })
        .eq('restaurant_id', restaurantId);

      if (updateError) {
        console.error(`Error updating restaurant metadata for ${restaurantId}:`, updateError);
      } else {
        console.log(`✅ Successfully updated metadata for restaurant ${restaurantId}: ${restaurantName || 'N/A'}`);
      }
    } else {
      // Create new record with metadata (will be updated with scores later)
      const { error: insertError } = await supabase
        .from('restaurant_promotions')
        .insert({
          restaurant_id: restaurantId,
          total_score: 0,
          monthly_score: 0,
          weekly_score: 0,
          past_28_days_score: 0,
          restaurant_name: restaurantName,
          restaurant_image_url: restaurantImageUrl,
          restaurant_slug: restaurantSlug,
          destination_id: destinationId,
          region: region,
          first_promoted_at: new Date().toISOString(),
          last_promoted_at: new Date().toISOString(),
        });

      if (insertError) {
        console.error(`Error creating restaurant metadata record for ${restaurantId}:`, insertError);
      } else {
        console.log(`✅ Successfully created metadata record for restaurant ${restaurantId}: ${restaurantName || 'N/A'}`);
      }
    }

  } catch (error) {
    console.error('Error updating restaurant metadata:', error);
  }
}

/**
 * Get restaurant promotion score
 * NOTE: restaurant_promotions table has been removed (old boost system)
 * This function now returns null for backward compatibility
 */
export async function getRestaurantPromotionScore(restaurantId) {
  if (!restaurantId) return null;
  
  // Old boost system removed - return null
  return null;
}

/**
 * Fetch all promotion scores for restaurants in a specific destination
 * NOTE: restaurant_promotions table has been removed (old boost system)
 * This function now returns empty object for backward compatibility
 */
export async function getRestaurantPromotionScoresByDestination(destinationId) {
  if (!destinationId) return {};
  
  // Old boost system removed - return empty scores
  return {};
}

/**
 * Get trending restaurants for a destination (past 28 days score)
 * NOTE: restaurant_promotions table has been removed (old boost system)
 * This function now returns empty array for backward compatibility
 */
export async function getTrendingRestaurantsByDestination(destinationId, limit = 6) {
  if (!destinationId) return [];
  
  // Old boost system removed - return empty array
  return [];
}

/**
 * Get promoted tours for a destination
 * Queries operator_tours where is_promoted = true and matches with destination
 * Returns array of product IDs that are promoted for this destination
 */
/**
 * Get promoted tours for a destination
 * Uses the new promoted_tours table for better tracking
 */
export async function getPromotedToursByDestination(destinationId, limit = 6) {
  if (!destinationId) return [];

  try {
    const supabase = createSupabaseServiceRoleClient();
    const { normalizeDestinationIdToSlug } = await import('./destinationIdHelper');
    
    // Normalize to slug format (simple, reliable)
    const slug = await normalizeDestinationIdToSlug(destinationId);
    if (!slug) {
      console.warn(`Could not normalize destination ID ${destinationId} to slug`);
      return [];
    }
    
    // Get numeric ID if destinationId is numeric, or lookup numeric ID from slug
    let numericId = null;
    const idString = destinationId.toString().trim();
    if (/^\d+$/.test(idString)) {
      // Already numeric
      numericId = idString;
    } else {
      // Lookup numeric ID from slug
      const { data: destInfo } = await supabase
        .from('viator_destinations')
        .select('id')
        .eq('slug', slug)
        .maybeSingle();
      numericId = destInfo?.id?.toString();
    }
    
    // Query by both slug and numeric ID (handle both cases)
    // Some records might have slug, others might have numeric ID
    const now = new Date().toISOString();
    
    // Build array of possible destination_id values (slug and numeric)
    const destinationIds = [slug];
    if (numericId) {
      destinationIds.push(numericId);
    }
    
    // Also include child destinations (e.g., if viewing "bali", also show "ubud", "seminyak", etc.)
    try {
      // Query viator_destinations to find child destinations
      const { data: currentDest } = await supabase
        .from('viator_destinations')
        .select('id')
        .or(`slug.eq.${slug}${numericId ? `,id.eq.${numericId}` : ''}`)
        .maybeSingle();
      
      if (currentDest?.id) {
        // Find all child destinations (where parent_destination_id matches current destination)
        const { data: childDests } = await supabase
          .from('viator_destinations')
          .select('slug, id')
          .eq('parent_destination_id', currentDest.id);
        
        if (childDests && childDests.length > 0) {
          childDests.forEach(child => {
            if (child.slug && !destinationIds.includes(child.slug)) {
              destinationIds.push(child.slug);
            }
            // Also add numeric ID if available
            if (child.id && !destinationIds.includes(child.id.toString())) {
              destinationIds.push(child.id.toString());
            }
          });
        }
      }
    } catch (error) {
      console.warn('Could not query child destinations:', error);
    }
    
    const { data: promotedTours, error } = await supabase
      .from('promoted_tours')
      .select('product_id, status, start_date, end_date, promotion_plan, destination_id')
      .eq('status', 'active')
      .in('destination_id', destinationIds) // Match slug, numeric ID, or child destinations
      .or(`end_date.is.null,end_date.gte.${now}`)
      .order('start_date', { ascending: true })
      .limit(limit);
    
    if (error) {
      console.error('Error fetching promoted tours:', error);
      return [];
    }
    
    if (!promotedTours || promotedTours.length === 0) {
      return [];
    }
    
    // Return product IDs - the calling code will match these with actual tour data
    return promotedTours.map(item => ({
      product_id: item.product_id,
      productId: item.product_id,
      productCode: item.product_id,
      promoted_until: item.end_date,
      promotion_plan: item.promotion_plan,
    }));
  } catch (error) {
    console.error('Error in getPromotedToursByDestination:', error);
    return [];
  }
}

/**
 * Get promoted restaurants for a destination
 * Uses the new promoted_restaurants table for better tracking
 */
export async function getPromotedRestaurantsByDestination(destinationId, limit = 6) {
  if (!destinationId) return [];

  try {
    const supabase = createSupabaseServiceRoleClient();
    const { normalizeDestinationIdToSlug } = await import('./destinationIdHelper');
    
    // Normalize to slug format (simple, reliable)
    const slug = await normalizeDestinationIdToSlug(destinationId);
    if (!slug) {
      console.warn(`Could not normalize destination ID ${destinationId} to slug`);
      return [];
    }
    
    // Build array of destination slugs (including child destinations)
    const destinationSlugs = [slug];
    
    // Also include child destinations (e.g., if viewing "bali", also show "ubud", "seminyak", etc.)
    try {
      // Query viator_destinations to find child destinations
      const { data: currentDest } = await supabase
        .from('viator_destinations')
        .select('id')
        .eq('slug', slug)
        .maybeSingle();
      
      if (currentDest?.id) {
        // Find all child destinations (where parent_destination_id matches current destination)
        const { data: childDests } = await supabase
          .from('viator_destinations')
          .select('slug')
          .eq('parent_destination_id', currentDest.id);
        
        if (childDests && childDests.length > 0) {
          childDests.forEach(child => {
            if (child.slug && !destinationSlugs.includes(child.slug)) {
              destinationSlugs.push(child.slug);
            }
          });
        }
      }
    } catch (error) {
      console.warn('Could not query child destinations:', error);
    }
    
    // Query by slug (including child destinations)
    const now = new Date().toISOString();
    const { data: promotedRestaurants, error } = await supabase
      .from('promoted_restaurants')
      .select('restaurant_id, status, start_date, end_date, promotion_plan, destination_id, restaurant_slug, restaurant_name')
      .eq('status', 'active')
      .in('destination_id', destinationSlugs) // Match slug or child destination slugs
      .or(`end_date.is.null,end_date.gte.${now}`)
      .order('start_date', { ascending: true, nullsFirst: true })
      .limit(limit);
    
    if (error) {
      console.error(`❌ [getPromotedRestaurantsByDestination] Error fetching for ${destinationId} (slug: ${slug}):`, error);
      return [];
    }
    
    if (!promotedRestaurants || promotedRestaurants.length === 0) {
      console.log(`ℹ️ [getPromotedRestaurantsByDestination] No promoted restaurants found for ${destinationId} (slug: ${slug})`);
      return [];
    }
    
    console.log(`✅ [getPromotedRestaurantsByDestination] Found ${promotedRestaurants.length} promoted restaurant(s) for ${destinationId} (slug: ${slug})`);
    
    // Return simple, clean data
    return promotedRestaurants.map(item => ({
      id: item.restaurant_id,
      restaurant_id: item.restaurant_id,
      slug: item.restaurant_slug,
      name: item.restaurant_name,
      promoted_until: item.end_date,
      promotion_plan: item.promotion_plan,
    }));
  } catch (error) {
    console.error('Error in getPromotedRestaurantsByDestination:', error);
    return [];
  }
}

/**
 * Get leaderboard restaurants
 */
export async function getLeaderboardRestaurants({
  scoreType = 'all', // 'all', 'monthly', 'weekly', 'last_month'
  region = null,
  limit = 20,
  offset = 0,
}) {
  try {
    const supabase = createSupabaseServiceRoleClient();
    
    let query = supabase
      .from('restaurant_promotions')
      .select('*')
      .order(getRestaurantScoreColumn(scoreType), { ascending: false })
      .range(offset, offset + limit - 1);

    if (region) {
      query = query.eq('region', region);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching restaurant leaderboard:', error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error('Error in getLeaderboardRestaurants:', error);
    return [];
  }
}

/**
 * Get score column name based on score type (for restaurants)
 */
function getRestaurantScoreColumn(scoreType) {
  switch (scoreType) {
    case 'monthly':
      return 'monthly_score';
    case 'weekly':
      return 'weekly_score';
    case 'last_month':
      return 'past_28_days_score';
    default:
      return 'total_score';
  }
}

/**
 * Spend points on a travel plan
 */
export async function spendPointsOnPlan(userId, planId, pointsToSpend, scoreType = 'all') {
  if (!userId || !planId || pointsToSpend <= 0) {
    return { error: 'Invalid parameters' };
  }

  // Enforce minimum boost requirement
  if (pointsToSpend < MIN_BOOST_POINTS) {
    return { error: `Minimum boost is ${MIN_BOOST_POINTS} points. This prevents inefficient small transactions.` };
  }

  try {
    const supabase = createSupabaseServiceRoleClient();
    
    // Get user's promotion account
    const account = await getPromotionAccount(userId);
    if (!account) {
      return { error: 'Promotion account not found' };
    }

    // Read daily points from profiles table (primary source of truth)
    const { data: profile } = await supabase
      .from('profiles')
      .select('daily_points_available')
      .eq('id', userId)
      .single();

    const currentPoints = profile?.daily_points_available ?? account.daily_points_available ?? 0;

    // Check if user has enough points
    if (currentPoints < pointsToSpend) {
      return { error: 'Insufficient points available' };
    }

    // Deduct points from both promotion_accounts and profiles tables
    const newPointsAvailable = currentPoints - pointsToSpend;
    const { error: deductError } = await supabase
      .from('promotion_accounts')
      .update({
        daily_points_available: newPointsAvailable,
        total_points_spent_all_time: (account.total_points_spent_all_time || 0) + pointsToSpend,
      })
      .eq('user_id', userId);

    // Also update profiles table (primary source of truth)
    await supabase
      .from('profiles')
      .update({
        daily_points_available: newPointsAvailable,
      })
      .eq('id', userId);

    if (deductError) {
      console.error('Error deducting points:', deductError);
      return { error: 'Failed to deduct points' };
    }

    // Get or create plan promotion record
    let { data: planPromo, error: planError } = await supabase
      .from('travel_plans')
      .select('*')
      .eq('id', planId)
      .single();

    if (planError) {
      console.error('Error fetching plan:', planError);
      return { error: 'Plan not found' };
    }

    // Create promotion record (trigger will update scores)
    const { data: promotion, error: promoError } = await supabase
      .from('plan_promotions')
      .insert({
        plan_id: planId,
        user_id: userId,
        points: pointsToSpend,
      })
      .select()
      .single();

    if (promoError) {
      console.error('Error creating plan promotion:', promoError);
      // Refund points if promotion creation fails
      await supabase
        .from('promotion_accounts')
        .update({
          daily_points_available: currentPoints,
          total_points_spent_all_time: (account.total_points_spent_all_time || 0) - pointsToSpend,
        })
        .eq('user_id', userId);
      await supabase
        .from('profiles')
        .update({
          daily_points_available: currentPoints,
        })
        .eq('id', userId);
      
      // Provide more specific error message
      if (promoError.code === '23505' || promoError.message?.includes('unique') || promoError.message?.includes('duplicate')) {
        return { error: 'You have already boosted this plan. Please remove the unique constraint on plan_promotions table to allow multiple boosts.' };
      }
      
      return { error: `Failed to create plan promotion: ${promoError.message || 'Unknown error'}` };
    }

    // Get updated plan with new scores
    const { data: updatedPlan } = await supabase
      .from('travel_plans')
      .select('*')
      .eq('id', planId)
      .single();

    return {
      success: true,
      promotion,
      plan: updatedPlan,
      pointsRemaining: newPointsAvailable,
    };
  } catch (error) {
    console.error('Error in spendPointsOnPlan:', error);
    return { error: 'Failed to spend points' };
  }
}

/**
 * Get plan promotion scores by destination
 */
export async function getPlanPromotionScoresByDestination(destinationId) {
  if (!destinationId) {
    return {};
  }

  try {
    const supabase = createSupabaseServiceRoleClient();
    
    const { data: plans, error } = await supabase
      .from('travel_plans')
      .select('id, total_score, monthly_score, weekly_score, past_28_days_score')
      .eq('destination_id', destinationId)
      .eq('is_public', true);

    if (error) {
      console.error('Error fetching plan promotion scores:', error);
      return {};
    }

    // Convert to map by plan ID
    const scoresMap = {};
    plans?.forEach(plan => {
      scoresMap[plan.id] = {
        plan_id: plan.id,
        total_score: plan.total_score || 0,
        monthly_score: plan.monthly_score || 0,
        weekly_score: plan.weekly_score || 0,
        past_28_days_score: plan.past_28_days_score || 0,
      };
    });

    return scoresMap;
  } catch (error) {
    console.error('Error in getPlanPromotionScoresByDestination:', error);
    return {};
  }
}

/**
 * Get plan promotion score for a single plan
 */
export async function getPlanPromotionScore(planId) {
  if (!planId) {
    return null;
  }

  try {
    const supabase = createSupabaseServiceRoleClient();
    
    const { data: plan, error } = await supabase
      .from('travel_plans')
      .select('id, total_score, monthly_score, weekly_score, past_28_days_score')
      .eq('id', planId)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return null; // Plan not found
      }
      console.error('Error fetching plan promotion score:', error);
      return null;
    }

    return {
      planId: plan.id,
      total_score: plan.total_score || 0,
      monthly_score: plan.monthly_score || 0,
      weekly_score: plan.weekly_score || 0,
      past_28_days_score: plan.past_28_days_score || 0,
    };
  } catch (error) {
    console.error('Error in getPlanPromotionScore:', error);
    return null;
  }
}


