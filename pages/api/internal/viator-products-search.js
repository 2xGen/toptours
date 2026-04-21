const WINDOW_MS = 60 * 1000;
const MAX_REQUESTS_PER_WINDOW = 20;
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
    res.setHeader('Allow', ['POST']);
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const internalApiKey = process.env.INTERNAL_API_KEY;
    const requestInternalApiKey = req.headers['x-internal-api-key'];
    const hasValidInternalApiKey = Boolean(
      internalApiKey && requestInternalApiKey && requestInternalApiKey === internalApiKey
    );
    const sameOrigin = isSameOriginRequest(req);
    if (internalApiKey && !hasValidInternalApiKey && !sameOrigin) {
      return res.status(403).json({ error: 'Forbidden' });
    }

    const ip = getClientIp(req);
    if (!sameOrigin && !hasValidInternalApiKey && !passRateLimit(ip)) {
      return res.status(429).json({ error: 'Too many requests' });
    }

    const body = req.body || {};
    const {
      destinationId,
      flags = [],
      start = 1,
      count = 50,
      sorting = { sort: 'TRAVELER_RATING', order: 'DESCENDING' },
      currency = 'USD',
    } = body;
    const normalizedCount = Math.min(Math.max(Number(count) || 50, 1), 50);
    const normalizedStart = Math.max(Number(start) || 1, 1);

    const apiKey = process.env.VIATOR_API_KEY;

    if (!apiKey) {
      return res.status(500).json({ error: 'API key not configured' });
    }

    const filtering = {};
    if (destinationId) {
      filtering.destination = String(destinationId);
    }
    if (Array.isArray(flags) && flags.length > 0) {
      filtering.flags = flags;
    }

    const payload = {
      filtering,
      sorting,
      pagination: { start: normalizedStart, count: normalizedCount },
      currency,
    };

    // Cache repeated destination searches to cut origin compute.
    res.setHeader('Cache-Control', 'public, s-maxage=3600, stale-while-revalidate=86400');

    // Keep function runtime bounded for cost control.
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 20000); // 20 seconds

    const response = await fetch('https://api.viator.com/partner/products/search', {
      method: 'POST',
      headers: {
        'exp-api-key': apiKey,
        Accept: 'application/json;version=2.0',
        'Accept-Language': 'en-US',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      const errorText = await response.text();
      // Only log errors in development to reduce I/O during crawls
      if (process.env.NODE_ENV === 'development') {
        console.error('Viator products search error:', response.status, errorText);
      }
      return res
        .status(response.status)
        .json({ error: 'Viator API error', status: response.status, details: errorText });
    }

    const data = await response.json();
    return res.status(200).json(data);
  } catch (error) {
    // Only log errors in development to reduce I/O during crawls
    if (process.env.NODE_ENV === 'development') {
      console.error('Products search error:', error);
    }
    if (error.name === 'AbortError') {
      return res.status(504).json({ error: 'Request timeout', details: 'Viator API request exceeded 20 second timeout' });
    }
    return res.status(500).json({ error: 'Failed to fetch products', details: error.message });
  }
}

