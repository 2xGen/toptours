import { getTrendingToursByDestination, getPromotedToursByDestination } from '@/lib/promotionSystem';
import { getAllCategoryGuidesForDestination } from '@/lib/categoryGuides';
import { getHardcodedToursByDestination } from '@/lib/promotionSystem';
import { getBabyEquipmentRentalsByDestination } from '@/lib/babyEquipmentRentals';

/**
 * Fetches all destination data in parallel for better performance
 * This function parallelizes independent queries to reduce total load time
 */
export async function fetchDestinationData(destination, destinationIdForScores) {
  // Parallelize all independent data fetching operations (promotion scores removed to save compute; restaurants removed)
  const [
    trendingTours,
    promotedTourData,
    hardcodedTours,
    categoryGuides,
    hasBabyEquipmentRentals
  ] = await Promise.allSettled([
    // Trending tours
    getTrendingToursByDestination(destinationIdForScores, 3).catch(() => []),
    
    // Promoted tour data (just IDs first)
    getPromotedToursByDestination(destinationIdForScores, 6).catch(() => []),
    
    // Hardcoded tours (lightweight - no API calls)
    getHardcodedToursByDestination(destination.id).catch(() => ({})),
    
    // Category guides
    getAllCategoryGuidesForDestination(destination.id).catch(() => []),
    
    // Baby equipment rentals check
    getBabyEquipmentRentalsByDestination(destination.id)
      .then(data => !!data)
      .catch(() => false)
  ]);

  // Extract values from Promise.allSettled results (promotion scores no longer fetched - pass empty; restaurants removed)
  const result = {
    promotionScores: {},
    trendingTours: trendingTours.status === 'fulfilled' ? trendingTours.value : [],
    promotedTourData: promotedTourData.status === 'fulfilled' ? promotedTourData.value : [],
    hardcodedTours: hardcodedTours.status === 'fulfilled' ? hardcodedTours.value : {},
    categoryGuides: categoryGuides.status === 'fulfilled' ? categoryGuides.value : [],
    hasBabyEquipmentRentals: hasBabyEquipmentRentals.status === 'fulfilled' ? hasBabyEquipmentRentals.value : false,
  };

  // Enrich tourCategories with hasGuide property
  if (destination.tourCategories && Array.isArray(destination.tourCategories) && result.categoryGuides.length > 0) {
    const guideSlugs = new Set(result.categoryGuides.map(g => g.category_slug));
    destination.tourCategories = destination.tourCategories.map(category => {
      const categoryName = typeof category === 'string' ? category : category.name;
      const categorySlug = categoryName.toLowerCase()
        .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
        .replace(/&/g, 'and')
        .replace(/'/g, '')
        .replace(/\./g, '')
        .replace(/ /g, '-');
      
      const hasGuide = guideSlugs.has(categorySlug);
      
      if (typeof category === 'string') {
        return { name: category, hasGuide };
      } else {
        return { ...category, hasGuide };
      }
    });
  }

  // Fetch full promoted tour data (this needs to happen after we have the IDs)
  let promotedTours = [];
  if (result.promotedTourData.length > 0) {
    try {
      const { getCachedTour, useSupabaseCache } = await import('@/lib/viatorCache');
      const apiKey = process.env.VIATOR_API_KEY;
      
      const fetchPromises = result.promotedTourData.map(async (promoted) => {
        const productId = promoted.product_id || promoted.productId || promoted.productCode;
        if (!productId) return null;
        
        try {
          let tour = null;
          if (useSupabaseCache()) tour = await getCachedTour(productId);
          if (!tour && apiKey) {
            const url = `https://api.viator.com/partner/products/${productId}?currency=USD`;
            const response = await fetch(url, {
              method: 'GET',
              headers: {
                'exp-api-key': apiKey,
                'Accept': 'application/json;version=2.0',
                'Accept-Language': 'en-US',
                'Content-Type': 'application/json'
              },
              next: { revalidate: 86400 }, // Cache for 24 hours - we also use getCachedTour for Supabase caching, this reduces fetch calls
            });
            
            if (response.ok) {
              tour = await response.json();
            } else {
              return null;
            }
          }
          
          if (!tour) return null;
          
          // Return tour with product_id for matching
          return {
            ...tour,
            productId: productId,
            productCode: productId,
            product_id: productId,
          };
        } catch (error) {
          return null;
        }
      });
      
      const fetchedTours = await Promise.all(fetchPromises);
      promotedTours = fetchedTours.filter(t => t !== null);
      
    } catch (error) {
      // Silently continue - promoted tours are optional
    }
  }

  return {
    ...result,
    promotedTours,
  };
}
