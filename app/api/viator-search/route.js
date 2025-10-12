import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    const { destination, category, budget, duration, groupSize } = await request.json();

    // Hardcoded API key for local testing
    const apiKey = '282a363f-5d60-456a-a6a0-774ec4832b07';
    
    if (!apiKey) {
      return NextResponse.json({ error: 'API key not configured' }, { status: 500 });
    }

    // Construct the Viator API URL
    const baseUrl = 'https://api.viator.com/partner/search/freetext';
    
    const requestBody = {
      searchTerm: destination.trim(),
      searchTypes: [{
        searchType: 'PRODUCTS',
        pagination: {
          start: 1,
          count: 20
        }
      }],
      currency: 'USD'
    };

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
