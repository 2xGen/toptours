import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    const { destination, searchTerm } = await request.json();
    const term = destination || searchTerm;

    // Get API key from environment variables
    const apiKey = process.env.OPENAI_API_KEY;
    
    // Debug logging
    console.log('OpenAI Categories API called');
    console.log('Term:', term);
    console.log('API Key exists:', !!apiKey);
    
    if (!apiKey) {
      console.error('OpenAI API key not found in environment variables');
      return NextResponse.json({ error: 'OpenAI API key not configured' }, { status: 500 });
    }
    
    if (!term) {
      console.error('No destination or searchTerm provided');
      return NextResponse.json({ error: 'No destination or searchTerm provided' }, { status: 400 });
    }

    const prompt = `Generate 6 popular tour categories for ${term}. These should be specific search terms that travelers would use to find tours.

Requirements:
- Create exactly 6 categories
- Each category should be 2-4 words max
- Focus on the most popular and unique experiences for this destination
- Use terms that people actually search for
- Include a mix of activities, cultural experiences, and adventures
- Make them specific to ${term}
- IMPORTANT: Do NOT include the destination name in the category - it will be added automatically
- Categories should be generic activity types that work well with the destination

Format: Return only the 6 categories, one per line, no numbering or bullets.

Examples for different destinations:
For Rome: food tours, colosseum tours, vatican tours, walking tours, cooking classes, day trips
For Aruba: snorkeling tours, sunset cruises, jeep tours, horseback riding, water sports, island tours

Note: The destination name will be automatically added to each category, so return only the activity type.`;

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
            content: 'You are a travel expert. Generate popular tour categories for specific destinations that travelers actually search for.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        max_tokens: 150,
        temperature: 0.7
      })
    });

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.status}`);
    }

    const data = await response.json();
    const content = data.choices[0].message.content.trim();
    
    // Split by lines and clean up
    const categoryList = content
      .split('\n')
      .map(line => line.trim())
      .filter(line => line.length > 0)
      .map(line => line.replace(/^[-•*\d.]+\s*/, '')) // Remove bullets or numbers
      .slice(0, 6); // Ensure exactly 6 categories
    
    return NextResponse.json({ success: true, categories: categoryList });

  } catch (error) {
    console.error('OpenAI Categories Error:', error);
    return NextResponse.json(
      { error: 'Failed to generate categories', details: error.message },
      { status: 500 }
    );
  }
}
