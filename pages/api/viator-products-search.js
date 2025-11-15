export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const body = req.body || {};
    const {
      destinationId,
      flags = [],
      start = 1,
      count = 50,
      sorting = { sort: 'TRAVELER_RATING', order: 'DESCENDING' },
      currency = 'USD',
    } = body;

    const apiKey = process.env.VIATOR_API_KEY || '282a363f-5d60-456a-a6a0-774ec4832b07';

    if (!apiKey) {
      return res.status(500).json({ error: 'API key not configured' });
    }

    const filtering = {};
    if (destinationId) {
      filtering.destination = String(destinationId);
    }
    if (Array.isArray(flags) && flags.length > 0) {
      filtering.flags = flags;
    }

    const payload = {
      filtering,
      sorting,
      pagination: { start, count },
      currency,
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
      console.error('Viator products search error:', response.status, errorText);
      return res
        .status(response.status)
        .json({ error: 'Viator API error', status: response.status, details: errorText });
    }

    const data = await response.json();
    return res.status(200).json(data);
  } catch (error) {
    console.error('Products search error:', error);
    return res.status(500).json({ error: 'Failed to fetch products', details: error.message });
  }
}

