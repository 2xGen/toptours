import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    const { destination, searchTerm, page = 1, minPrice = 0, maxPrice = 1000, privateTour = false, flags = [] } = await request.json();

    // Get API key
    const apiKey = process.env.VIATOR_API_KEY || '282a363f-5d60-456a-a6a0-774ec4832b07';
    
    if (!apiKey) {
      return NextResponse.json({ error: 'API key not configured' }, { status: 500 });
    }

    const term = destination || searchTerm;
    if (!term) {
      return NextResponse.json({ error: 'Search term or destination is required' }, { status: 400 });
    }

    // Prepare Viator API request
    const perPage = 20;
    const start = (page - 1) * perPage + 1;

    // Construct the Viator API URL
    const baseUrl = 'https://api.viator.com/partner/search/freetext';
    
    const requestBody = {
      searchTerm: term.trim(),
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

      requestBody.productFiltering = {
        price: {
          from: minPrice,
          to: maxPrice
        }
      };

      if (specialFeatures.length > 0) {
        requestBody.productFiltering.flags = specialFeatures;
      }
    }

    const response = await fetch(baseUrl, {
      method: 'POST',
      headers: {
        'exp-api-key': apiKey,
        'Accept': 'application/json;version=2.0',
        'Accept-Language': 'en-US',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(requestBody)
    });

    if (!response.ok) {
      throw new Error(`Viator API error: ${response.status}`);
    }

    const data = await response.json();
    return NextResponse.json(data);

  } catch (error) {
    console.error('Viator API Error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch tours', details: error.message },
      { status: 500 }
    );
  }
}
