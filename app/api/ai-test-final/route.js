import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    const { destination } = await request.json();
    const dest = destination || 'Paris';
    
    // Get API key
    const apiKey = process.env.OPENAI_API_KEY;
    
    if (!apiKey) {
      return NextResponse.json({
        error: 'OpenAI API key not configured in Vercel environment variables'
      }, { status: 500 });
    }

    // Call OpenAI
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [{
          role: 'user',
          content: `Write a short exciting sentence about visiting ${dest} for travelers. Include 1-2 emojis.`
        }],
        max_tokens: 100
      })
    });

    if (!response.ok) {
      const error = await response.text();
      return NextResponse.json({
        error: 'OpenAI API failed',
        status: response.status,
        details: error
      }, { status: 500 });
    }

    const data = await response.json();
    const text = data.choices[0].message.content;

    return NextResponse.json({
      success: true,
      text: text,
      destination: dest
    });

  } catch (error) {
    return NextResponse.json({
      error: error.message
    }, { status: 500 });
  }
}

