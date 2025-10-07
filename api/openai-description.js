// OpenAI Description API endpoint for Vercel (Node.js)
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
        message: 'Please configure your OpenAI API key in Vercel environment variables'
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
          content: `Write a compelling 2-3 sentence description for ${searchTerm} in ${destination}. Make it engaging and highlight what makes this experience special.`
        }],
        max_tokens: 150,
        temperature: 0.8
      })
    });

    if (!openaiResponse.ok) {
      throw new Error(`OpenAI API error: ${openaiResponse.status} ${openaiResponse.statusText}`);
    }

    const data = await openaiResponse.json();
    const description = data.choices[0].message.content.trim();
    
    res.status(200).json({ description });

  } catch (error) {
    console.error('OpenAI Description Error:', error);
    res.status(500).json({
      error: 'OpenAI request failed',
      message: error.message
    });
  }
}
