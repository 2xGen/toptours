import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    const { destination } = await request.json();

    // Get API key from environment variables
    const apiKey = process.env.OPENAI_API_KEY;
    
    if (!apiKey) {
      return NextResponse.json({ error: 'OpenAI API key not configured' }, { status: 500 });
    }

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-3.5-turbo',
        messages: [
          {
            role: 'system',
            content: `You are a travel expert specializing in ${destination}. Generate 6-8 popular tour categories that visitors typically book in this destination. Return only a JSON array of category names, no additional text.`
          },
          {
            role: 'user',
            content: `What are the most popular tour categories for ${destination}?`
          }
        ],
        max_tokens: 200,
        temperature: 0.7
      })
    });

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.status}`);
    }

    const data = await response.json();
    const categories = JSON.parse(data.choices[0].message.content);
    
    return NextResponse.json({ categories });

  } catch (error) {
    console.error('OpenAI Categories Error:', error);
    return NextResponse.json(
      { error: 'Failed to generate categories', details: error.message },
      { status: 500 }
    );
  }
}
