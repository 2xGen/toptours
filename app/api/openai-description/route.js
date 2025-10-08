import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    const { destination, searchTerm } = await request.json();
    const term = destination || searchTerm;

    // Get API key from environment
    const apiKey = process.env.OPENAI_API_KEY;
    
    console.log('OpenAI Description API called');
    console.log('Term:', term);
    
    if (!apiKey) {
      console.error('OpenAI API key not configured');
      return NextResponse.json({ error: 'OpenAI API key not configured' }, { status: 500 });
    }
    
    if (!term) {
      console.error('No destination or searchTerm provided');
      return NextResponse.json({ error: 'No destination or searchTerm provided' }, { status: 400 });
    }

    const prompt = `Create an engaging, descriptive one-liner (max 120 characters) for a travel search results page.

Search Term: ${term}

The description should:
- Be specific to the destination and activity mentioned in the search term
- Include vivid, sensory details about the location or activity
- Mention the actual destination name and activity type
- Include relevant emojis (2-3 max)
- End with a call to action like 'just a click away below!'
- Be written in an exciting, enthusiastic tone
- Avoid generic phrases like 'amazing tours and experiences'

Examples of good descriptions:
- 'Dive into the crystal-clear waters of Aruba and discover a world of vibrant marine life—your perfect snorkeling adventure awaits just a click away below! 🌊🐠'
- 'Savor the authentic flavors of Rome as you wander through historic streets and hidden trattorias—your culinary journey through the Eternal City awaits just a click away below! 🍝🏛️'
- 'Soar above the Grand Canyon on a thrilling helicopter ride and witness nature's masterpiece from the sky—your aerial adventure awaits just a click away below! 🚁🏜️'

Make it specific to the search term provided.`;

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: 'You are a travel marketing expert. Create engaging, descriptive one-liners for travel search results that excite users about their search.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        max_tokens: 150,
        temperature: 0.8
      })
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('OpenAI API error:', response.status, errorData);
      throw new Error(`OpenAI API error: ${response.status} - ${JSON.stringify(errorData)}`);
    }

    const data = await response.json();
    console.log('OpenAI response received successfully');
    let description = data.choices[0].message.content.trim();
    // Remove quotes if present
    description = description.replace(/^["']|["']$/g, '');
    
    return NextResponse.json({ success: true, description });

  } catch (error) {
    console.error('OpenAI Description Error:', error);
    console.error('Error stack:', error.stack);
    return NextResponse.json(
      { error: 'Failed to generate description', details: error.message },
      { status: 500 }
    );
  }
}
