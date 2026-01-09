/**
 * Viator Recommendations API Integration
 * 
 * Fetches product recommendations from Viator API
 * Uses the /partner/products/recommendations endpoint
 */

/**
 * Fetch product recommendations from Viator API
 */
export async function fetchProductRecommendations(productId, options = {}) {
  // Use sandbox key for sandbox API, production key for production API
  const apiBaseUrl = process.env.VIATOR_API_BASE_URL || 'https://api.sandbox.viator.com';
  const isSandbox = apiBaseUrl.includes('sandbox');
  const apiKey = isSandbox 
    ? (process.env.VIATOR_SANDBOX_API_KEY || process.env.VIATOR_API_KEY)
    : process.env.VIATOR_API_KEY;
  
  if (!apiKey) {
    throw new Error(`VIATOR_API_KEY not configured${isSandbox ? ' (sandbox)' : ''}`);
  }

  const requestBody = {
    productCodes: [productId],
    recommendationTypes: options.recommendationTypes || ['IS_SIMILAR_TO'],
  };

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout

    const recommendationsEndpoint = `${apiBaseUrl}/partner/products/recommendations`;

    console.log(`🔍 [RECOMMENDATIONS] Fetching from: ${recommendationsEndpoint}`);
    console.log(`🔍 [RECOMMENDATIONS] Request body:`, JSON.stringify(requestBody, null, 2));

    const response = await fetch(recommendationsEndpoint, {
      method: 'POST',
      headers: {
        'exp-api-key': apiKey,
        'Accept': 'application/json;version=2.0',
        'Accept-Language': 'en-US',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Viator API error: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    console.log(`✅ [RECOMMENDATIONS] Received recommendations for ${productId}`);
    
    // Extract recommended product codes
    if (data && data.length > 0 && data[0].recommendations) {
      const recommendedCodes = data[0].recommendations.IS_SIMILAR_TO || [];
      console.log(`✅ [RECOMMENDATIONS] Found ${recommendedCodes.length} similar tours`);
      return recommendedCodes;
    }
    
    return [];
  } catch (error) {
    if (error.name === 'AbortError') {
      throw new Error('Request timeout - Viator API took too long to respond');
    }
    console.error('Error fetching recommendations:', error);
    throw error;
  }
}

/**
 * Fetch full tour data for recommended product codes
 * Uses the existing tour fetching mechanism (getCachedTour + cacheTour)
 * Fetches each tour individually using GET /partner/products/{productId}
 * Capped at maximum 6 tours
 */
export async function fetchRecommendedTours(recommendedProductCodes) {
  if (!recommendedProductCodes || recommendedProductCodes.length === 0) {
    return [];
  }

  // Cap at maximum 6 tours
  const limitedCodes = recommendedProductCodes.slice(0, 6);

  // Import the tour caching functions
  const { getCachedTour, cacheTour } = await import('./viatorCache');
  
  // Use sandbox key for sandbox API, production key for production API
  const apiBaseUrl = process.env.VIATOR_API_BASE_URL || 'https://api.sandbox.viator.com';
  const isSandbox = apiBaseUrl.includes('sandbox');
  const apiKey = isSandbox 
    ? (process.env.VIATOR_SANDBOX_API_KEY || process.env.VIATOR_API_KEY)
    : process.env.VIATOR_API_KEY;
  
  if (!apiKey) {
    throw new Error(`VIATOR_API_KEY not configured${isSandbox ? ' (sandbox)' : ''}`);
  }

  try {
    const allTours = [];
    
    // Fetch each tour individually using GET /partner/products/{productId}
    for (const productCode of limitedCodes) {
      try {
        // First check cache
        let tour = await getCachedTour(productCode);
        
        if (!tour) {
          // Cache miss - fetch from API using GET endpoint (same as tour detail page)
          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), 30000);

          const productEndpoint = `${apiBaseUrl}/partner/products/${productCode}?currency=USD`;
          
          console.log(`🔍 [RECOMMENDATIONS] Fetching tour ${productCode} from: ${productEndpoint}`);
          
          const response = await fetch(productEndpoint, {
            method: 'GET',
            headers: {
              'exp-api-key': apiKey,
              'Accept': 'application/json;version=2.0',
              'Accept-Language': 'en-US',
              'Content-Type': 'application/json',
            },
            signal: controller.signal,
          });

          clearTimeout(timeoutId);

          if (response.ok) {
            tour = await response.json();
            
            if (tour && !tour.error) {
              // Cache it for future use
              await cacheTour(productCode, tour);
              console.log(`✅ [RECOMMENDATIONS] Fetched and cached tour ${productCode}`);
            } else {
              console.warn(`⚠️ [RECOMMENDATIONS] Tour ${productCode} returned error:`, tour?.error);
            }
          } else {
            const errorText = await response.text();
            console.error(`❌ [RECOMMENDATIONS] API error for ${productCode}: ${response.status} - ${errorText}`);
          }
        } else {
          console.log(`✅ [RECOMMENDATIONS] Using cached tour ${productCode}`);
        }
        
        if (tour && !tour.error) {
          allTours.push(tour);
        }
      } catch (error) {
        console.error(`❌ [RECOMMENDATIONS] Error fetching tour ${productCode}:`, error);
        // Continue with next tour
      }
    }

    console.log(`✅ [RECOMMENDATIONS] Fetched ${allTours.length} recommended tours`);
    return allTours;
  } catch (error) {
    console.error('Error fetching recommended tours:', error);
    return [];
  }
}
