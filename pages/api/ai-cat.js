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

    const apiKey = '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';

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
    return res.status(500).json({ error: 'Failed to generate categories' });
  }
}

