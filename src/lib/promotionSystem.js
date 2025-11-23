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
 */
export async function getPromotionAccount(userId) {
  if (!userId) return null;

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

    // Check if daily reset is needed
    const lastReset = new Date(account.last_daily_reset);
    const now = new Date();
    const hoursSinceReset = (now - lastReset) / (1000 * 60 * 60);

    if (hoursSinceReset >= 24) {
      // Reset daily points based on tier
      let pointsToReset = TIER_POINTS.explorer;
      if (account.subscription_status === 'active') {
        if (account.tier === 'enterprise') {
          pointsToReset = TIER_POINTS.enterprise;
        } else if (account.tier === 'pro_plus') {
          pointsToReset = TIER_POINTS.pro_plus;
        } else if (account.tier === 'pro_booster') {
          pointsToReset = TIER_POINTS.pro_booster;
        }
      }

      // Calculate streak: increment if claimed yesterday, reset if missed
      const lastClaimDate = account.last_claim_date ? new Date(account.last_claim_date) : null;
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);
      
      let newStreak = 1;
      if (lastClaimDate) {
        lastClaimDate.setHours(0, 0, 0, 0);
        if (lastClaimDate.getTime() === yesterday.getTime()) {
          // Claimed yesterday - increment streak
          newStreak = (account.streak_days || 0) + 1;
        } else if (lastClaimDate.getTime() === today.getTime()) {
          // Already claimed today - keep streak
          newStreak = account.streak_days || 0;
        }
        // Otherwise missed a day - reset to 1 (already set)
      }

      // Update both promotion_accounts and profiles tables for reliability
      const { data: updatedAccount, error: updateError } = await supabase
        .from('promotion_accounts')
        .update({
          daily_points_available: pointsToReset, // Keep for backward compatibility
          last_daily_reset: now.toISOString(),
          streak_days: newStreak,
          last_claim_date: today.toISOString().split('T')[0], // Store as date only
        })
        .eq('user_id', userId)
        .select()
        .single();

      // Also update profiles table (primary source of truth for daily points)
      await supabase
        .from('profiles')
        .update({
          daily_points_available: pointsToReset,
        })
        .eq('id', userId);

      if (updateError) {
        console.error('Error resetting daily points:', updateError);
        return account; // Return old account if update fails
      }

      return updatedAccount;
    }

    return account;
  } catch (error) {
    console.error('Error in getPromotionAccount:', error);
    return null;
  }
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
    // Priority 1: Use _destinationId if provided (from page context)
    // Priority 2: Extract from tourData.destinations array
    let tourRegion = null;
    let destinationId = tourData._destinationId || null;
    if (tourData.destinations && tourData.destinations.length > 0) {
      // Try to determine region from destination
      const destination = tourData.destinations[0];
      const destinationName = (destination.destinationName || destination.name || '').toLowerCase();
      const destinationRef = destination.destinationRef || destination.ref || '';
      
      // Try to match with our internal destinations data
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
        
        if (matchedDestination) {
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
    const { data, error } = await supabase
      .from('tour_promotions')
      .select('*')
      .eq('destination_id', destinationId)
      .gt('total_score', 0); // Only tours with points

    if (error) {
      console.error('Error fetching promotion scores by destination:', error);
      return {};
    }

    // Convert array to map for easy lookup
    const scoresMap = {};
    if (data) {
      data.forEach(score => {
        scoresMap[score.product_id] = score;
      });
    }

    return scoresMap;
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
    const { data, error } = await supabase
      .from('tour_promotions')
      .select('*')
      .eq('destination_id', destinationId)
      .gt('past_28_days_score', 0) // Only tours with points in last 28 days
      .order('past_28_days_score', { ascending: false })
      .limit(limit);

    if (error) {
      console.error('Error fetching trending tours by destination:', error);
      return [];
    }

    return data || [];
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
export async function getTourPromotionScoresBatch(productIds) {
  if (!productIds || productIds.length === 0) return {};

  try {
    const supabase = createSupabaseServiceRoleClient();
    const { data, error } = await supabase
      .from('tour_promotions')
      .select('*')
      .in('product_id', productIds);

    if (error) {
      console.error('Error batch fetching tour promotions:', error);
      return {};
    }

    // Convert array to map for easy lookup
    const scoresMap = {};
    if (data) {
      data.forEach(score => {
        scoresMap[score.product_id] = score;
      });
    }

    // Return map with all productIds (including those with no score = 0)
    const result = {};
    productIds.forEach(productId => {
      result[productId] = scoresMap[productId] || {
        product_id: productId,
        total_score: 0,
        monthly_score: 0,
        weekly_score: 0,
        past_28_days_score: 0,
      };
    });

    return result;
  } catch (error) {
    console.error('Error in getTourPromotionScoresBatch:', error);
    return {};
  }
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
 * Get recent boosts (transactions)
 */
export async function getRecentBoosts(limit = 20) {
  try {
    const supabase = createSupabaseServiceRoleClient();
    
    // First, get the transactions
    const { data: transactions, error: transactionsError } = await supabase
      .from('promotion_transactions')
      .select('id, user_id, product_id, points_spent, created_at, transaction_type')
      .order('created_at', { ascending: false })
      .limit(limit);

    if (transactionsError) {
      console.error('Error fetching recent boosts:', transactionsError);
      return [];
    }

    if (!transactions || transactions.length === 0) {
      return [];
    }

    // Get unique user IDs
    const userIds = [...new Set(transactions.map(t => t.user_id).filter(Boolean))];
    
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
      
      // Fetch promotion accounts for tier and streak
      const { data: accounts, error: accountsError } = await supabase
        .from('promotion_accounts')
        .select('user_id, tier, streak_days')
        .in('user_id', userIds);

      if (accountsError) {
        console.error('Error fetching promotion accounts for recent boosts:', accountsError);
      }
      
      if (accounts && accounts.length > 0) {
        accountsMap = accounts.reduce((acc, account) => {
          acc[account.user_id] = {
            tier: account.tier,
            streak_days: account.streak_days || 0,
          };
          return acc;
        }, {});
      }
      
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
    const boosts = transactions.map(transaction => {
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
 */
export async function getRestaurantPromotionScore(restaurantId) {
  if (!restaurantId) return null;

  try {
    const supabase = createSupabaseServiceRoleClient();
    const { data, error } = await supabase
      .from('restaurant_promotions')
      .select('*')
      .eq('restaurant_id', restaurantId)
      .single();

    if (error && error.code === 'PGRST116') {
      return null; // Restaurant not promoted yet
    }

    if (error) {
      console.error('Error fetching restaurant promotion:', error);
      return null;
    }

    return data;
  } catch (error) {
    console.error('Error in getRestaurantPromotionScore:', error);
    return null;
  }
}

/**
 * Fetch all promotion scores for restaurants in a specific destination
 */
export async function getRestaurantPromotionScoresByDestination(destinationId) {
  if (!destinationId) return {};

  try {
    const supabase = createSupabaseServiceRoleClient();
    const { data, error } = await supabase
      .from('restaurant_promotions')
      .select('*')
      .eq('destination_id', destinationId)
      .gt('total_score', 0); // Only restaurants with points

    if (error) {
      console.error('Error fetching restaurant promotion scores by destination:', error);
      return {};
    }

    // Convert array to map for easy lookup
    const scoresMap = {};
    if (data) {
      data.forEach(score => {
        scoresMap[score.restaurant_id] = score;
      });
    }

    return scoresMap;
  } catch (error) {
    console.error('Error in getRestaurantPromotionScoresByDestination:', error);
    return {};
  }
}

/**
 * Get trending restaurants for a destination (past 28 days score)
 * Returns restaurants sorted by past_28_days_score, with full metadata
 */
export async function getTrendingRestaurantsByDestination(destinationId, limit = 6) {
  if (!destinationId) return [];

  try {
    const supabase = createSupabaseServiceRoleClient();
    const { data, error } = await supabase
      .from('restaurant_promotions')
      .select('*')
      .eq('destination_id', destinationId)
      .gt('past_28_days_score', 0) // Only restaurants with points in last 28 days
      .order('past_28_days_score', { ascending: false })
      .limit(limit);

    if (error) {
      console.error('Error fetching trending restaurants by destination:', error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error('Error in getTrendingRestaurantsByDestination:', error);
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


