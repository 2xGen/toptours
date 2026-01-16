import { fetchProductRecommendations, fetchRecommendedTours } from '@/lib/viatorRecommendations';

export async function POST(request) {
  try {
    const { productId } = await request.json();
    
    if (!productId) {
      return Response.json({ tours: [] });
    }
    
    // Get recommended product codes
    const recommendedProductCodes = await fetchProductRecommendations(productId);
    
    if (!recommendedProductCodes || recommendedProductCodes.length === 0) {
      return Response.json({ tours: [] });
    }
    
    // Fetch full tour data for recommended tours (limit to 6)
    const recommendedTours = await fetchRecommendedTours(recommendedProductCodes.slice(0, 6));
    
    return Response.json({ tours: recommendedTours || [] });
  } catch (error) {
    console.error('Error fetching recommended tours:', error);
    return Response.json({ tours: [], error: error.message });
  }
}
