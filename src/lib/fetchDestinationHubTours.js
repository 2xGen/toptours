/** Server-side fetch for curated destination hubs. */

import {
  getDestinationHubPicks,
  collectHubPickProductCodes,
  hubUsesStaticDisplay,
} from '@/lib/destinationHubPicks';
import { fetchViatorProductJson } from '@/lib/viatorProductFetch';

function getTourProductCode(tour) {
  return tour?.productCode || tour?.productId || tour?.product_id || tour?.id || null;
}

async function fetchToursByProductCodes(productCodes) {
  const unique = [...new Set(productCodes.filter(Boolean).map(String))];
  if (unique.length === 0) return [];

  const results = await Promise.all(unique.map((code) => fetchViatorProductJson(code)));
  return results.filter(Boolean);
}

function mergeTours(...lists) {
  const merged = [];
  const seen = new Set();
  for (const list of lists) {
    for (const tour of list) {
      const code = getTourProductCode(tour);
      if (!code || seen.has(code)) continue;
      seen.add(code);
      merged.push(tour);
    }
  }
  return merged;
}

async function fetchTopRatedTours(viatorDestinationId, limit = 50) {
  const apiKey = process.env.VIATOR_API_KEY;
  if (!apiKey || !viatorDestinationId) {
    return { tours: [], totalCount: 0 };
  }

  const count = Math.min(Math.max(Number(limit) || 50, 1), 50);

  try {
    const response = await fetch('https://api.viator.com/partner/products/search', {
      method: 'POST',
      headers: {
        'exp-api-key': apiKey,
        Accept: 'application/json;version=2.0',
        'Accept-Language': 'en-US',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        filtering: { destination: String(viatorDestinationId) },
        sorting: { sort: 'TRAVELER_RATING', order: 'DESCENDING' },
        pagination: { start: 1, count },
        currency: 'USD',
      }),
      next: { revalidate: 86400 },
    });

    if (!response.ok) {
      return { tours: [], totalCount: 0 };
    }

    const data = await response.json();
    return {
      tours: Array.isArray(data.products) ? data.products : [],
      totalCount: data.totalCount || 0,
    };
  } catch {
    return { tours: [], totalCount: 0 };
  }
}

/**
 * Static hub pages use baked-in card data — return catalog count only (no tour payloads).
 */
export async function fetchDestinationHubTours(viatorDestinationId, options = {}) {
  const limit = options.limit ?? 50;
  const destinationId = options.destinationId || null;
  const hubConfig = destinationId ? getDestinationHubPicks(destinationId) : null;

  if (hubUsesStaticDisplay(hubConfig)) {
    const searchData = viatorDestinationId
      ? await fetchTopRatedTours(viatorDestinationId, 1)
      : { tours: [], totalCount: 0 };
    return {
      tours: [],
      totalCount: searchData.totalCount || hubConfig.catalogTourCount || 0,
    };
  }

  const pickCodes = hubConfig ? collectHubPickProductCodes(hubConfig) : [];

  const [pickTours, searchData] = await Promise.all([
    fetchToursByProductCodes(pickCodes),
    fetchTopRatedTours(viatorDestinationId, limit),
  ]);

  return {
    tours: mergeTours(pickTours, searchData.tours),
    totalCount: searchData.totalCount || 0,
  };
}
