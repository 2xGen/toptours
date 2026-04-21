// Using Pages Router instead of App Router to bypass caching issue

const WINDOW_MS = 60 * 1000;
const MAX_REQUESTS_PER_WINDOW = 10;
const ipWindowStore = new Map();

function getClientIp(req) {
  const forwardedFor = req.headers['x-forwarded-for'];
  if (typeof forwardedFor === 'string' && forwardedFor.length > 0) {
    return forwardedFor.split(',')[0].trim();
  }
  const realIp = req.headers['x-real-ip'];
  if (typeof realIp === 'string' && realIp.length > 0) return realIp.trim();
  return 'unknown';
}

function passRateLimit(ip) {
  const now = Date.now();
  const existing = ipWindowStore.get(ip);
  if (!existing || now - existing.startedAt > WINDOW_MS) {
    ipWindowStore.set(ip, { count: 1, startedAt: now });
    return true;
  }
  existing.count += 1;
  return existing.count <= MAX_REQUESTS_PER_WINDOW;
}

function isSameOriginRequest(req) {
  const host = req.headers.host;
  const origin = req.headers.origin;
  const referer = req.headers.referer;
  try {
    if (origin && new URL(origin).host === host) return true;
  } catch {}
  try {
    if (referer && new URL(referer).host === host) return true;
  } catch {}
  return false;
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const internalApiKey = process.env.INTERNAL_API_KEY;
    const providedInternalApiKey = req.headers['x-internal-api-key'];
    const hasValidInternalKey = Boolean(
      internalApiKey && providedInternalApiKey && providedInternalApiKey === internalApiKey
    );
    if (!hasValidInternalKey && !isSameOriginRequest(req)) {
      return res.status(403).json({ error: 'Forbidden' });
    }

    const ip = getClientIp(req);
    if (!hasValidInternalKey && !passRateLimit(ip)) {
      return res.status(429).json({ error: 'Too many requests' });
    }

    const { destination, searchTerm } = req.body;
    const term = destination || searchTerm;
    
    if (!term) {
      return res.status(400).json({ error: 'No destination provided' });
    }

    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      return res.status(500).json({ error: 'OPENAI_API_KEY not configured' });
    }

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
    
    if (!data.choices || !data.choices[0]) {
      console.error('Unexpected response:', JSON.stringify(data));
      throw new Error('Invalid API response');
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

