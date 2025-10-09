// Using Pages Router instead of App Router to bypass caching issue

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { destination, searchTerm } = req.body;
    const term = destination || searchTerm;
    
    if (!term) {
      return res.status(400).json({ error: 'No destination provided' });
    }

    const apiKey = process.env.OPENAI_API_KEY;

    const prompt = `Generate 6 popular tour categories for ${term}. Return only the activity types, one per line.`;

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: 'You are a travel expert.' },
          { role: 'user', content: prompt }
        ],
        max_tokens: 150,
        temperature: 0.7
      })
    });

    const data = await response.json();
    
    // Check if OpenAI returned an error
    if (data.error) {
      console.error('OpenAI API Error:', data.error);
      throw new Error(data.error.message || 'OpenAI API error');
    }
    
    // Check if we have the expected response structure
    if (!data.choices || !data.choices[0] || !data.choices[0].message) {
      console.error('Unexpected OpenAI response:', JSON.stringify(data));
      throw new Error('Invalid response from OpenAI');
    }
    
    const content = data.choices[0].message.content.trim();
    
    const categoryList = content
      .split('\n')
      .map(line => line.trim())
      .filter(line => line.length > 0)
      .map(line => line.replace(/^[-•*\d.]+\s*/, ''))
      .slice(0, 6);
    
    res.setHeader('Cache-Control', 'no-store');
    return res.status(200).json({ 
      success: true, 
      categories: categoryList
    });

  } catch (error) {
    console.error('AI Categories API Error:', error);
    return res.status(500).json({ 
      error: 'Failed to generate categories',
      details: error.message 
    });
  }
}

