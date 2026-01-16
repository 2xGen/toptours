/**
 * Viator Pricing API Integration
 * 
 * Fetches fromPrice from /availability/schedules endpoint
 */

/**
 * Fetch fromPrice from Viator schedules API
 * The product endpoint doesn't include pricing - only this endpoint does
 */
export async function getFromPrice(productId) {
  try {
    const apiKey = process.env.VIATOR_API_KEY;
    
    if (!apiKey) {
      return null;
    }
    
    const url = `https://api.viator.com/partner/availability/schedules/${productId}`;
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'exp-api-key': apiKey,
        'Accept': 'application/json;version=2.0',
        'Accept-Language': 'en-US',
        'Content-Type': 'application/json',
      },
      next: { revalidate: 3600 },
    });
    
    if (!response.ok) {
      return null;
    }
    
    const data = await response.json();
    
    // Return the fromPrice from summary
    return data?.summary?.fromPrice || null;
  } catch (error) {
    return null;
  }
}
