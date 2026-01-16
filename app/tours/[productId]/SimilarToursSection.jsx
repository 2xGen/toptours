import { Suspense } from 'react';
import { getCachedSimilarTours, cacheSimilarTours, generateSimilarToursCacheKey } from '@/lib/viatorCache';
import SimilarToursList from './SimilarToursList';

async function SimilarToursContent({ productId, tour, destinationData }) {
  let similarTours = [];
  
  try {
    // Extract destination name from tour title for search
    const destinationKeywords = ['Aruba', 'Curaçao', 'Jamaica', 'Punta Cana', 'Nassau', 'Barbados', 'St. Lucia', 'Amalfi', 'Italy', 'Rome', 'Florence', 'Venice'];
    let searchTerm = tour.title || '';
    
    // If we can identify a destination, search for tours in that destination
    for (const dest of destinationKeywords) {
      if (tour.title?.includes(dest)) {
        const categoryKeywords = ['Sunset', 'Cruise', 'ATV', 'Snorkel', 'Dive', 'Catamaran', 'Cultural', 'Beach', 'Boat', 'Tour', 'Aperitif'];
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
                count: 20
              }
            }],
            currency: 'USD'
          }),
          next: { revalidate: 3600 },
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
            .slice(0, 6);
          
          await cacheSimilarTours(cacheKey, similarTours);
        }
      }
    }
  } catch (error) {
    console.error('Error fetching similar tours:', error);
  }

  if (similarTours.length === 0) {
    return null;
  }
  
  return (
    <SimilarToursList 
      similarTours={similarTours}
      tour={tour}
      destinationData={destinationData}
    />
  );
}

function SimilarToursSkeleton() {
  return (
    <section className="mt-16">
      <div className="mb-6">
        <div className="h-9 bg-gray-200 rounded w-64 animate-pulse" />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div key={i} className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="h-48 bg-gray-200 animate-pulse" />
            <div className="p-4 space-y-3">
              <div className="h-5 bg-gray-200 rounded w-3/4 animate-pulse" />
              <div className="h-4 bg-gray-200 rounded w-1/2 animate-pulse" />
              <div className="h-6 bg-gray-200 rounded w-24 animate-pulse" />
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

export default function SimilarToursSection({ productId, tour, destinationData }) {
  return (
    <Suspense fallback={<SimilarToursSkeleton />}>
      <SimilarToursContent 
        productId={productId}
        tour={tour}
        destinationData={destinationData}
      />
    </Suspense>
  );
}
