/**
 * Single-product fetch for Viator partner API (same behavior as tour page getCachedTourData).
 */
import { getCachedTour, cacheTour, useSupabaseCache } from '@/lib/viatorCache';

export async function fetchViatorProductJson(productId) {
  if (!productId) return null;

  if (useSupabaseCache()) {
    const cached = await getCachedTour(productId);
    if (cached) return cached;
  }

  const apiKey = process.env.VIATOR_API_KEY || '282a363f-5d60-456a-a6a0-774ec4832b07';
  const url = `https://api.viator.com/partner/products/${productId}?currency=USD`;

  const productResponse = await fetch(url, {
    method: 'GET',
    headers: {
      'exp-api-key': apiKey,
      Accept: 'application/json;version=2.0',
      'Accept-Language': 'en-US',
      'Content-Type': 'application/json',
    },
    next: { revalidate: 86400 },
  });

  if (!productResponse.ok) {
    return null;
  }

  const tour = await productResponse.json();
  if (!tour || tour.error) {
    return null;
  }

  await cacheTour(productId, tour);
  return tour;
}
