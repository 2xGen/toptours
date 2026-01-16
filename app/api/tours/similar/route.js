import { getCachedSimilarTours, cacheSimilarTours, generateSimilarToursCacheKey } from '@/lib/viatorCache';

export async function POST(request) {
  try {
    const { productId, searchTerm } = await request.json();
    
    if (!productId || !searchTerm) {
      return Response.json({ tours: [] });
    }
    
    const apiKey = process.env.VIATOR_API_KEY;
    if (!apiKey) {
      return Response.json({ tours: [] });
    }
    
    // Check cache first
    const cacheKey = generateSimilarToursCacheKey(productId, searchTerm);
    const cachedSimilar = await getCachedSimilarTours(cacheKey);
    
    if (cachedSimilar && cachedSimilar.length > 0) {
      return Response.json({ tours: cachedSimilar });
    }
    
    // Fetch from Viator API
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
        searchTypes: [{ searchType: 'PRODUCTS', pagination: { start: 1, count: 20 } }],
        currency: 'USD'
      })
    });
    
    if (!similarResponse.ok) {
      console.error('Viator API error:', similarResponse.status);
      return Response.json({ tours: [] });
    }
    
    const similarData = await similarResponse.json();
    const allTours = similarData.products?.results || [];
    
    const similarTours = allTours
      .filter(t => (t.productId || t.productCode) !== productId)
      .sort((a, b) => (b.reviews?.combinedAverageRating || 0) - (a.reviews?.combinedAverageRating || 0))
      .slice(0, 6);
    
    // Cache for future requests
    if (similarTours.length > 0) {
      await cacheSimilarTours(cacheKey, similarTours);
    }
    
    return Response.json({ tours: similarTours });
  } catch (error) {
    console.error('Error fetching similar tours:', error);
    return Response.json({ tours: [], error: error.message });
  }
}
