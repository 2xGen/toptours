import { queuePageView } from '@/lib/supabaseCache';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Set cache headers - view tracking doesn't need to block the response
  res.setHeader('Cache-Control', 'no-cache');

  try {
    const body = req.body && typeof req.body === 'object' ? req.body : {};
    
    if (!body.pagePath) {
      return res.status(400).json({ error: 'Missing page path' });
    }

    // Extract page view metadata for analytics
    const pageViewData = {
      pagePath: body.pagePath,
      pageType: body.pageType || determinePageType(body.pagePath),
      productId: body.productId || null,
      destinationId: body.destinationId || null,
      referrer: body.referrer || req.headers.referer || null,
      userAgent: body.userAgent || req.headers['user-agent'] || null,
      sessionId: body.sessionId || null,
      userId: body.userId || null,
      ipAddress: req.headers['x-forwarded-for']?.split(',')[0]?.trim() || 
                 req.headers['x-real-ip'] || 
                 req.socket?.remoteAddress || null,
    };

    // Queue the page view for analytics
    queuePageView(pageViewData);

    // Return immediately - don't wait for database write
    return res.status(200).json({ success: true, queued: true });
  } catch (error) {
    console.error('Error queueing page view:', error);
    // Don't fail the request if tracking fails
    return res.status(200).json({ success: true, queued: false });
  }
}

/**
 * Determine page type from path
 */
function determinePageType(pagePath) {
  if (pagePath.startsWith('/tours/')) return 'tour';
  if (pagePath.startsWith('/destinations/')) {
    if (pagePath.includes('/tours')) return 'destination_tours';
    return 'destination';
  }
  if (pagePath.startsWith('/travel-guides/')) return 'travel_guide';
  if (pagePath === '/') return 'home';
  if (pagePath === '/about') return 'about';
  if (pagePath === '/how-it-works') return 'how_it_works';
  if (pagePath === '/toptours') return 'top_tours';
  if (pagePath === '/destinations') return 'destinations_list';
  if (pagePath === '/travel-guides') return 'travel_guides_list';
  if (pagePath === '/profile') return 'profile';
  if (pagePath === '/auth') return 'auth';
  if (pagePath === '/results') return 'results';
  if (pagePath.startsWith('/terms')) return 'terms';
  if (pagePath.startsWith('/privacy')) return 'privacy';
  if (pagePath.startsWith('/cookie-policy')) return 'cookie_policy';
  
  return 'other';
}

