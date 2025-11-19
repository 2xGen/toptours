import { queueViewCountUpdate } from '@/lib/supabaseCache';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Set cache headers - view tracking doesn't need to block the response
  res.setHeader('Cache-Control', 'no-cache');

  try {
    const { productId } = req.query;
    if (!productId) {
      return res.status(400).json({ error: 'Missing product id' });
    }

    const body = req.body && typeof req.body === 'object' ? req.body : {};
    const destinationId = body.destinationId || null;

    // Extract page view metadata for analytics
    const pageViewData = {
      pagePath: body.pagePath || `/tours/${productId}`,
      referrer: body.referrer || req.headers.referer || null,
      userAgent: body.userAgent || req.headers['user-agent'] || null,
      sessionId: body.sessionId || null,
      userId: body.userId || null,
      ipAddress: req.headers['x-forwarded-for']?.split(',')[0]?.trim() || 
                 req.headers['x-real-ip'] || 
                 req.socket?.remoteAddress || null,
    };

    // Queue the update with page view data for analytics
    // This stores both aggregated counts AND raw page view records
    queueViewCountUpdate(productId, destinationId, pageViewData);

    // Return immediately - don't wait for database write
    return res.status(200).json({ success: true, queued: true });
  } catch (error) {
    console.error('Error queueing view count:', error);
    // Don't fail the request if tracking fails
    return res.status(200).json({ success: true, queued: false });
  }
}

