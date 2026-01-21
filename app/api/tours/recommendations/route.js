import { fetchProductRecommendations, fetchRecommendedTours } from '@/lib/viatorRecommendations';

// Cache for 1 hour (3600 seconds) - reduces API calls from crawlers
export const dynamic = 'force-dynamic'; // POST routes are dynamic, but we cache responses

export async function POST(request) {
  try {
    const { productId } = await request.json();
    
    if (!productId) {
      return Response.json({ tours: [] }, {
        headers: {
          'Cache-Control': 'public, s-maxage=86400, stale-while-revalidate=604800',
        },
      });
    }
    
    // Get recommended product codes
    const recommendedProductCodes = await fetchProductRecommendations(productId);
    
    if (!recommendedProductCodes || recommendedProductCodes.length === 0) {
      return Response.json({ tours: [] }, {
        headers: {
          'Cache-Control': 'public, s-maxage=86400, stale-while-revalidate=604800',
        },
      });
    }
    
    // Fetch full tour data for recommended tours (limit to 12 for better internal linking)
    const recommendedTours = await fetchRecommendedTours(recommendedProductCodes.slice(0, 12));
    
    return Response.json({ tours: recommendedTours || [] }, {
      headers: {
        'Cache-Control': 'public, s-maxage=86400, stale-while-revalidate=604800',
      },
    });
  } catch (error) {
    console.error('Error fetching recommended tours:', error);
    return Response.json({ tours: [], error: error.message }, {
      headers: {
        'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400', // Cache errors too to reduce calls
      },
    });
  }
}
