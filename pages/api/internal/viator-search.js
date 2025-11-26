export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Set cache headers for Vercel Edge Network (shorter cache for search results)
  res.setHeader('Cache-Control', 'public, s-maxage=1800, stale-while-revalidate=3600');

  try {
    const body = req.body || {};
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
    } = body;

    const apiKey = process.env.VIATOR_API_KEY || '282a363f-5d60-456a-a6a0-774ec4832b07';

    if (!apiKey) {
      return res.status(500).json({ error: 'API key not configured' });
    }

    const term = destination || searchTerm;
    const hasSearchTerm = term && term.trim().length > 0;
    const perPage = 20;
    const start = (page - 1) * perPage + 1;

    // Use /products/search when we have destination ID AND no search term (default destination page)
    // Use /search/freetext when we have search term OR category filters (user search or category selection)
    if (includeDestination && viatorDestinationId && !hasSearchTerm) {
      // Standard /products/search endpoint - 100% accurate for destination pages
      const specialFeatures = [...flags];
      if (privateTour) {
        specialFeatures.push('PRIVATE_TOUR');
      }

      // Minimal filtering - just destination ID (no other filters that might restrict results)
      const filtering = {
        destination: String(viatorDestinationId),
      };

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

      const response = await fetch('https://api.viator.com/partner/products/search', {
        method: 'POST',
        headers: {
          'exp-api-key': apiKey,
          Accept: 'application/json;version=2.0',
          'Accept-Language': 'en-US',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Viator products/search API Error Response:', response.status, errorText);
        return res.status(response.status).json({
          error: 'Viator API error',
          status: response.status,
          details: errorText,
          payload,
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

    const requestBody = {
      searchTerm: term ? term.trim() : '',
      productFiltering: Object.keys(productFiltering).length > 0 ? productFiltering : undefined,
      productSorting: {
        sort: 'PRICE',
        order: 'DESCENDING',
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

    const response = await fetch('https://api.viator.com/partner/search/freetext', {
      method: 'POST',
      headers: {
        'exp-api-key': apiKey,
        Accept: 'application/json;version=2.0',
        'Accept-Language': 'en-US',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Viator API Error Response:', response.status, errorText);
      return res.status(response.status).json({
        error: 'Viator API error',
        status: response.status,
        details: errorText,
        requestBody,
      });
    }

    const data = await response.json();
    return res.status(200).json(data);
  } catch (error) {
    console.error('Viator API Error:', error);
    return res.status(500).json({ error: 'Failed to fetch tours', details: error.message });
  }
}

