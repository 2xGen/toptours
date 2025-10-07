import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    const { destination, category, budget, duration, groupSize } = await request.json();

    // Get API key from environment variables
    const apiKey = process.env.VIATOR_API_KEY;
    
    if (!apiKey) {
      return NextResponse.json({ error: 'API key not configured' }, { status: 500 });
    }

    // Construct the Viator API URL
    const baseUrl = 'https://api.viator.com/partner/products/search';
    const params = new URLSearchParams({
      topX: '10-50',
      currency: 'USD',
      destId: destination || '684',
      sortOrder: 'FEATURED',
      sortOrder: 'REVIEW_AVG_RATING_D',
      topX: '1-20'
    });

    const response = await fetch(`${baseUrl}?${params}`, {
      method: 'GET',
      headers: {
        'exp-api-key': apiKey,
        'Accept': 'application/json',
        'Accept-Language': 'en-US'
      }
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
