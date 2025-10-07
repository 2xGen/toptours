// OpenAI Categories API endpoint for Vercel (Node.js)
export default async function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('Content-Type', 'application/json');

  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  // Only allow POST requests
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  try {
    // Get API key from environment variables
    const apiKey = process.env.OPENAI_API_KEY;
    
    if (!apiKey || apiKey === 'your_openai_api_key_here') {
      res.status(500).json({
        error: 'OpenAI API key not configured',
        message: 'Please configure your OpenAI API key in Vercel environment variables',
        options: [
          '1. Go to Vercel Dashboard → Settings → Environment Variables',
          '2. Add OPENAI_API_KEY with your actual API key',
          '3. Get your API key from: https://platform.openai.com/api-keys'
        ]
      });
      return;
    }

    const { destination, searchTerm } = req.body;

    if (!destination || !searchTerm) {
      res.status(400).json({ error: 'Destination and search term are required' });
      return;
    }

    // Call OpenAI API
    const openaiResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [{
          role: 'user',
          content: `Generate 6 popular tour categories for ${destination} based on the search term "${searchTerm}". Return only a JSON array of category names, no other text.`
        }],
        max_tokens: 200,
        temperature: 0.7
      })
    });

    if (!openaiResponse.ok) {
      throw new Error(`OpenAI API error: ${openaiResponse.status} ${openaiResponse.statusText}`);
    }

    const data = await openaiResponse.json();
    const categories = JSON.parse(data.choices[0].message.content);
    
    res.status(200).json({ categories });

  } catch (error) {
    console.error('OpenAI Categories Error:', error);
    res.status(500).json({
      error: 'OpenAI request failed',
      message: error.message
    });
  }
}
