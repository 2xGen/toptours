import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    const { destination, searchTerm } = await request.json();
    const term = destination || searchTerm;

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
            content: `You are a travel expert. Write a compelling, SEO-friendly description for ${term} tours and activities. Keep it under 150 words, highlight unique experiences, and include local insights. Make it engaging for potential visitors.`
          },
          {
            role: 'user',
            content: `Write a compelling description for ${term} tours and activities.`
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
    const description = data.choices[0].message.content;
    
    return NextResponse.json({ description });

  } catch (error) {
    console.error('OpenAI Description Error:', error);
    return NextResponse.json(
      { error: 'Failed to generate description', details: error.message },
      { status: 500 }
    );
  }
}
