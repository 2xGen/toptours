// Using Pages Router instead of App Router to bypass caching issue

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { destination, searchTerm } = req.body;
    const term = destination || searchTerm;
    
    if (!term) {
      return res.status(400).json({ error: 'No search term provided' });
    }

    const apiKey = process.env.OPENAI_API_KEY;

    const prompt = `Create an engaging one-liner (max 120 characters) for ${term} travel page. Include emojis and end with 'just a click away below!'`;

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: 'You are a travel marketing expert.' },
          { role: 'user', content: prompt }
        ],
        max_tokens: 150,
        temperature: 0.8
      })
    });

    const data = await response.json();
    let description = data.choices[0].message.content.trim();
    description = description.replace(/^["']|["']$/g, '');
    
    res.setHeader('Cache-Control', 'no-store');
    return res.status(200).json({ success: true, description });

  } catch (error) {
    console.error('AI Description API Error:', error);
    return res.status(500).json({ 
      error: 'Failed to generate description',
      details: error.message 
    });
  }
}

