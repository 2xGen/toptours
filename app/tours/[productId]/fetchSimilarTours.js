import { getCachedSimilarTours, cacheSimilarTours, generateSimilarToursCacheKey } from '@/lib/viatorCache';

export async function fetchSimilarToursServer(productId, tour, destinationData) {
  let similarTours = [];
  let error = null;
  
  try {
    // Use destinationData if available (preferred method)
    let searchTerm = '';
    
    if (destinationData?.destinationName) {
      // Use the destination name from destinationData
      searchTerm = destinationData.destinationName;
      
      // Try to extract a category keyword from the tour title
      const categoryKeywords = ['Sunset', 'Cruise', 'ATV', 'Snorkel', 'Dive', 'Catamaran', 'Cultural', 'Beach', 'Boat', 'Tour', 'Aperitif', 'Taj Mahal', 'Fort', 'Palace', 'Temple', 'Museum', 'Walking', 'Food', 'Culinary'];
      for (const keyword of categoryKeywords) {
        if (tour.title?.toLowerCase().includes(keyword.toLowerCase())) {
          searchTerm = `${destinationData.destinationName} ${keyword}`;
          break;
        }
      }
    } else {
      // Fallback: Extract destination name from tour title
      const destinationKeywords = ['Aruba', 'Curaçao', 'Jamaica', 'Punta Cana', 'Nassau', 'Barbados', 'St. Lucia', 'Amalfi', 'Italy', 'Rome', 'Florence', 'Venice', 'Agra', 'Delhi', 'Mumbai', 'Bangkok', 'Bali', 'Phuket'];
      searchTerm = tour.title || '';
      
      // If we can identify a destination, search for tours in that destination
      for (const dest of destinationKeywords) {
        if (tour.title?.includes(dest)) {
          const categoryKeywords = ['Sunset', 'Cruise', 'ATV', 'Snorkel', 'Dive', 'Catamaran', 'Cultural', 'Beach', 'Boat', 'Tour', 'Aperitif', 'Taj Mahal', 'Fort', 'Palace'];
          for (const keyword of categoryKeywords) {
            if (tour.title?.includes(keyword)) {
              searchTerm = `${dest} ${keyword}`;
              break;
            }
          }
          if (searchTerm === tour.title) {
            searchTerm = dest;
          }
          break;
        }
      }
    }
    
    // If still no search term, use destination name from tour destinations array
    if (!searchTerm && tour?.destinations && tour.destinations.length > 0) {
      const primaryDest = tour.destinations.find(d => d.primary) || tour.destinations[0];
      searchTerm = primaryDest?.destinationName || primaryDest?.name || tour.title || '';
    }
    
    // Generate cache key for similar tours
    const cacheKey = generateSimilarToursCacheKey(productId, searchTerm);
    
    // Try to get cached similar tours first
    const cachedSimilarTours = await getCachedSimilarTours(cacheKey);
    
    if (cachedSimilarTours) {
      similarTours = cachedSimilarTours;
    } else {
      // Cache miss - fetch from Viator API
      const apiKey = process.env.VIATOR_API_KEY;
      
      if (apiKey) {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 120000);

        const similarResponse = await fetch('https://api.viator.com/partner/search/freetext', {
          method: 'POST',
          headers: {
            'exp-api-key': apiKey,
            'Accept': 'application/json;version=2.0',
            'Accept-Language': 'en-US',
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            searchTerm: searchTerm,
            searchTypes: [{
              searchType: 'PRODUCTS',
              pagination: {
                start: 1,
                count: 12
              }
            }],
            currency: 'USD'
          }),
          next: { revalidate: 86400 }, // 24 hours - increased to reduce API calls
          signal: controller.signal,
        });

        clearTimeout(timeoutId);

        if (similarResponse.ok) {
          const similarData = await similarResponse.json();
          const allTours = similarData.products?.results || [];
          similarTours = allTours
            .filter(t => {
              const tId = t.productId || t.productCode;
              return tId && tId !== productId;
            })
            .sort((a, b) => {
              const ratingA = a.reviews?.combinedAverageRating || 0;
              const ratingB = b.reviews?.combinedAverageRating || 0;
              return ratingB - ratingA;
            })
            .slice(0, 12);
          
          await cacheSimilarTours(cacheKey, similarTours);
        }
      }
    }
  } catch (err) {
    error = err;
  }

  return { similarTours, error };
}
