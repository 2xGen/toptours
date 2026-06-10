const WINDOW_MS = 60 * 1000;
const MAX_REQUESTS_PER_WINDOW = 20;
const ipWindowStore = new Map();

const ALLOWED_BOTS = [/googlebot/i, /googleother/i, /google-adsbot/i, /bingbot/i, /duckduckbot/i];
const BLOCKED_BOTS = [
  /ahrefsbot/i,
  /semrushbot/i,
  /mj12bot/i,
  /dotbot/i,
  /petalbot/i,
  /bytespider/i,
  /ccbot/i,
  /megaindex/i,
  /seznambot/i,
  /claudebot/i,
  /gptbot/i,
  /chatgpt-user/i,
  /cohere-ai/i,
  /perplexitybot/i,
];
const CRAWLER_SIGNATURES = /bot|crawler|spider|crawl|scrapy|slurp|archiver/i;

function botIsAllowed(userAgent = '') {
  return ALLOWED_BOTS.some((pattern) => pattern.test(userAgent));
}

function botIsBlocked(userAgent = '') {
  const allow = botIsAllowed(userAgent);
  if (allow) return false;
  return BLOCKED_BOTS.some((pattern) => pattern.test(userAgent));
}

function isNonAllowlistedCrawler(userAgent = '') {
  if (botIsAllowed(userAgent)) return false;
  return CRAWLER_SIGNATURES.test(userAgent);
}

function getClientIp(req) {
  const forwardedFor = req.headers['x-forwarded-for'];
  if (typeof forwardedFor === 'string' && forwardedFor.length > 0) {
    return forwardedFor.split(',')[0].trim();
  }

  const realIp = req.headers['x-real-ip'];
  if (typeof realIp === 'string' && realIp.length > 0) {
    return realIp.trim();
  }

  return 'unknown';
}

function passRateLimit(ip) {
  const now = Date.now();
  const existing = ipWindowStore.get(ip);

  if (!existing || now - existing.startedAt > WINDOW_MS) {
    ipWindowStore.set(ip, { count: 1, startedAt: now });
    return true;
  }

  existing.count += 1;
  return existing.count <= MAX_REQUESTS_PER_WINDOW;
}

function isSameOriginRequest(req) {
  const host = req.headers.host;
  const secFetchSite = req.headers['sec-fetch-site'];
  if (secFetchSite === 'same-origin' || secFetchSite === 'same-site') {
    return true;
  }

  const origin = req.headers.origin;
  if (origin) {
    try {
      if (new URL(origin).host === host) return true;
    } catch {}
  }

  const referer = req.headers.referer;
  if (referer) {
    try {
      if (new URL(referer).host === host) return true;
    } catch {}
  }

  return false;
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const userAgent = req.headers['user-agent'] || '';
  if (
    botIsBlocked(userAgent) ||
    isNonAllowlistedCrawler(userAgent) ||
    /amazonbot|meta-external|meta-webindexer|oai-searchbot|chatgpt-user|perplexity-user|seranking|ahrefs|semrush|petalbot|baiduspider|qwantbot|applebot|yandexbot|barkrowler/i.test(
      userAgent
    )
  ) {
    return res.status(403).json({ error: 'Forbidden' });
  }

  const internalApiKey = process.env.INTERNAL_API_KEY;
  const requestInternalApiKey = req.headers['x-internal-api-key'];
  const hasValidInternalApiKey = Boolean(
    internalApiKey && requestInternalApiKey && requestInternalApiKey === internalApiKey
  );
  const sameOrigin = isSameOriginRequest(req);

  if (internalApiKey && !hasValidInternalApiKey && !sameOrigin) {
    return res.status(403).json({ error: 'Forbidden' });
  }

  const ip = getClientIp(req);
  if (!sameOrigin && !hasValidInternalApiKey && !passRateLimit(ip)) {
    return res.status(429).json({ error: 'Too many requests' });
  }

  try {
    const body = req.body || {};
    
    // Set cache headers for Vercel Edge Network
    // For search requests (with searchTerm), disable caching to ensure fresh results
    // For destination-only requests (no searchTerm), allow caching for performance
    const hasSearchTerm = (body.searchTerm || body.destination || '').trim().length > 0;
    if (hasSearchTerm) {
      // No caching for search requests - always get fresh results
      res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, private');
    } else {
      // Cache destination-only requests aggressively to minimize repeat function work/cost.
      res.setHeader('Cache-Control', 'public, s-maxage=86400, stale-while-revalidate=604800');
    }
    const {
      destination,
      searchTerm,
      page = 1,
      minPrice = body.minPrice || 0,
      maxPrice = body.maxPrice || 10000,
      privateTour = false,
      flags = body.flags || [],
      viatorDestinationId = body.viatorDestinationId,
      includeDestination = body.includeDestination !== false,
      tagIds = body.tagIds || [],
      count: requestedCount = body.count,
    } = body;

    const apiKey = process.env.VIATOR_API_KEY;

    if (!apiKey) {
      return res.status(500).json({ error: 'API key not configured' });
    }

    const term = destination || searchTerm;
    // Reuse hasSearchTerm from above (already calculated for cache headers)
    const perPage = Math.min(Math.max(Number(requestedCount) || 48, 1), 50);
    const start = (page - 1) * perPage + 1;

    // Use /products/search when we have destination ID AND no search term (default destination page)
    // Use /search/freetext when we have search term OR category filters (user search or category selection)
    if (includeDestination && viatorDestinationId && !hasSearchTerm) {
      // Standard /products/search endpoint - 100% accurate for destination pages
      const specialFeatures = [...flags];
      if (privateTour) {
        specialFeatures.push('PRIVATE_TOUR');
      }

      // Minimal filtering - destination ID; optionally filter by tag IDs (e.g. for tag guide "Load tours")
      const filtering = {
        destination: String(viatorDestinationId),
      };
      if (Array.isArray(tagIds) && tagIds.length > 0) {
        filtering.tagIds = tagIds.map((id) => Number(id)).filter((n) => !Number.isNaN(n));
      }
      if (Array.isArray(filtering.tagIds) && filtering.tagIds.length === 0) {
        delete filtering.tagIds;
      }

      // Only add price filter if explicitly specified
      if (minPrice > 0 || (maxPrice && maxPrice < 10000)) {
        filtering.lowestPrice = minPrice || 0;
        filtering.highestPrice = maxPrice || 10000;
      }

      // Only add flags if explicitly specified
      if (Array.isArray(flags) && flags.length > 0) {
        filtering.flags = flags;
      } else if (privateTour) {
        filtering.flags = ['PRIVATE_TOUR'];
      }

      const payload = {
        filtering,
        sorting: {
          sort: 'TRAVELER_RATING',
          order: 'DESCENDING',
        },
        pagination: {
          start,
          count: perPage,
        },
        currency: 'USD',
      };

      // COMPLIANCE: 120-second timeout for all Viator API calls
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 120000); // 120 seconds

      const response = await fetch('https://api.viator.com/partner/products/search', {
        method: 'POST',
        headers: {
          'exp-api-key': apiKey,
          Accept: 'application/json;version=2.0',
          'Accept-Language': 'en-US',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        let errorText = '';
        try {
          errorText = await response.text();
        } catch (e) {
          // Only log errors in development to reduce I/O during crawls
          if (process.env.NODE_ENV === 'development') {
            console.error('Failed to read error response body:', e.message);
          }
          errorText = `Unable to read error response: ${e.message}`;
        }
        
        // Only log errors in development to reduce I/O during crawls
        if (process.env.NODE_ENV === 'development') {
          console.error('Viator products/search API Error Response:', response.status, errorText);
        }
        return res.status(response.status || 500).json({
          error: 'Viator API error',
          status: response.status,
          statusText: response.statusText,
          details: errorText || 'Unknown error from Viator API',
          payload: payload,
        });
      }

      const data = await response.json();
      // Transform /products/search response to match freetext format for compatibility
      // /products/search returns: { products: [...], totalCount: number }
      // We need: { products: { results: [...], totalCount: number } }
      return res.status(200).json({
        products: {
          results: Array.isArray(data.products) ? data.products : [],
          totalCount: data.totalCount || (Array.isArray(data.products) ? data.products.length : 0),
        },
      });
    }

    // Use /search/freetext when we have search term OR category filters
    // searchTerm should NOT include destination name, just the search term (e.g., "snorkeling tours")
    if (!term && !(includeDestination && viatorDestinationId)) {
      return res.status(400).json({ error: 'Search term or destination is required (or use destination ID filter)' });
    }

    const specialFeatures = [...flags];
    if (privateTour) {
      specialFeatures.push('PRIVATE_TOUR');
    }

    const productFiltering = {
      destination: includeDestination && viatorDestinationId ? String(viatorDestinationId) : undefined,
      dateRange: {},
      price: {},
      rating: {},
      durationInMinutes: {},
      tags: [],
      flags: [],
      includeAutomaticTranslations: true,
    };

    // Remove undefined destination
    if (!productFiltering.destination) {
      delete productFiltering.destination;
    }

    // Add price filter if specified
    if (minPrice > 0 || (maxPrice && maxPrice < 10000)) {
      productFiltering.price = {
        from: minPrice || 0,
        to: maxPrice || 10000,
      };
    }

    // Add flags if specified
    if (Array.isArray(flags) && flags.length > 0) {
      productFiltering.flags = flags;
    } else if (specialFeatures.length > 0) {
      productFiltering.flags = specialFeatures;
    }

    // Clean up empty filter objects/arrays before sending to API
    if (Object.keys(productFiltering.dateRange).length === 0) {
      delete productFiltering.dateRange;
    }
    if (Object.keys(productFiltering.price).length === 0) {
      delete productFiltering.price;
    }
    if (Object.keys(productFiltering.rating).length === 0) {
      delete productFiltering.rating;
    }
    if (Object.keys(productFiltering.durationInMinutes).length === 0) {
      delete productFiltering.durationInMinutes;
    }
    if (!Array.isArray(productFiltering.tags) || productFiltering.tags.length === 0) {
      delete productFiltering.tags;
    }
    if (!Array.isArray(productFiltering.flags) || productFiltering.flags.length === 0) {
      delete productFiltering.flags;
    }

    const requestBody = {
      searchTerm: term ? term.trim() : '',
      productFiltering: Object.keys(productFiltering).length > 0 ? productFiltering : undefined,
      productSorting: {
        sort: 'DEFAULT', // Sort by relevancy (best matches first) - order field must be omitted for DEFAULT
      },
      searchTypes: [
        {
          searchType: 'PRODUCTS',
          pagination: {
            start,
            count: perPage,
          },
        },
      ],
      currency: 'USD',
    };

    // Remove undefined productFiltering
    if (!requestBody.productFiltering) {
      delete requestBody.productFiltering;
    }

    // COMPLIANCE: 120-second timeout for all Viator API calls
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 120000); // 120 seconds

    const response = await fetch('https://api.viator.com/partner/search/freetext', {
      method: 'POST',
      headers: {
        'exp-api-key': apiKey,
        Accept: 'application/json;version=2.0',
        'Accept-Language': 'en-US',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      let errorText = '';
      try {
        errorText = await response.text();
      } catch (e) {
        // Only log errors in development to reduce I/O during crawls
        if (process.env.NODE_ENV === 'development') {
          console.error('Failed to read error response body:', e.message);
        }
        errorText = `Unable to read error response: ${e.message}`;
      }
      
      // Only log errors in development to reduce I/O during crawls
      if (process.env.NODE_ENV === 'development') {
        console.error('Viator API Error Response:', response.status, errorText);
      }
      return res.status(response.status || 500).json({
        error: 'Viator API error',
        status: response.status,
        statusText: response.statusText,
        details: errorText || 'Unknown error from Viator API',
        requestBody: requestBody,
      });
    }

    const data = await response.json();
    return res.status(200).json(data);
  } catch (error) {
    // Only log errors in development to reduce I/O during crawls
    if (process.env.NODE_ENV === 'development') {
      console.error('Viator API Error:', error);
    }
    if (error.name === 'AbortError') {
      return res.status(504).json({ error: 'Request timeout', details: 'Viator API request exceeded 120 second timeout' });
    }
    return res.status(500).json({ error: 'Failed to fetch tours', details: error.message });
  }
}

