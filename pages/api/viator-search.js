export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).json({ error: 'Method not allowed' });
  }

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
    if (!term) {
      return res.status(400).json({ error: 'Search term or destination is required' });
    }

    const perPage = 20;
    const start = (page - 1) * perPage + 1;

    const requestBody = {
      searchTerm: term.trim(),
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

    const specialFeatures = [...flags];
    if (privateTour) {
      specialFeatures.push('PRIVATE_TOUR');
    }

    const productFiltering = {};
    const hasPriceFilter = minPrice > 0 || (maxPrice && maxPrice < 10000);

    if (includeDestination && viatorDestinationId) {
      productFiltering.destination = String(viatorDestinationId);
    }
    if (hasPriceFilter) {
      productFiltering.price = {
        from: minPrice || 0,
        to: maxPrice || 10000,
      };
    }
    if (Array.isArray(flags) && flags.length > 0) {
      productFiltering.flags = flags;
    }

    if (Object.keys(productFiltering).length > 0) {
      requestBody.productFiltering = productFiltering;
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

