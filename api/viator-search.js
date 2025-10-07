// Viator API endpoint for Vercel (Node.js)
export default async function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('Content-Type', 'application/json');

  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  // Only allow POST requests
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  try {
    // Get API key from environment variables
    const apiKey = process.env.VIATOR_API_KEY;
    
    if (!apiKey || apiKey === 'your_viator_api_key_here') {
      res.status(500).json({
        error: 'API key not configured',
        message: 'Please configure your Viator API key in Vercel environment variables',
        options: [
          '1. Go to Vercel Dashboard → Settings → Environment Variables',
          '2. Add VIATOR_API_KEY with your actual API key',
          '3. Get your API key from: https://www.viator.com/partner/'
        ]
      });
      return;
    }

    // Get request data
    const { searchTerm, page = 1, minPrice = 0, maxPrice = 1000, privateTour = false, flags = [] } = req.body;

    if (!searchTerm) {
      res.status(400).json({ error: 'Search term is required' });
      return;
    }

    // Prepare Viator API request
    const perPage = 20;
    const start = (page - 1) * perPage + 1;

    const requestData = {
      searchTerm: searchTerm.trim(),
      searchTypes: [{
        searchType: 'PRODUCTS',
        pagination: {
          start: start,
          count: perPage
        }
      }],
      currency: 'USD'
    };

    // Add product filtering if needed
    if (minPrice > 0 || maxPrice < 1000 || privateTour || flags.length > 0) {
      const specialFeatures = [...flags];
      if (privateTour) {
        specialFeatures.push('PRIVATE_TOUR');
      }

      requestData.productFiltering = {
        price: {
          from: minPrice,
          to: maxPrice
        }
      };

      if (specialFeatures.length > 0) {
        requestData.productFiltering.flags = specialFeatures;
      }
    }

    // Call Viator API
    const viatorResponse = await fetch('https://api.viator.com/partner/search/freetext', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json;version=2.0',
        'Accept-Language': 'en-US',
        'exp-api-key': apiKey
      },
      body: JSON.stringify(requestData)
    });

    if (!viatorResponse.ok) {
      throw new Error(`Viator API error: ${viatorResponse.status} ${viatorResponse.statusText}`);
    }

    const data = await viatorResponse.json();
    res.status(200).json(data);

  } catch (error) {
    console.error('Viator API Error:', error);
    res.status(500).json({
      error: 'API request failed',
      message: error.message,
      debug: {
        hasApiKey: !!process.env.VIATOR_API_KEY,
        searchTerm: req.body?.searchTerm,
        method: req.method
      }
    });
  }
}
