import { incrementViewCount } from '@/lib/tourEnrichment';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { productId } = req.query;
    if (!productId) {
      return res.status(400).json({ error: 'Missing product id' });
    }

    const destinationId =
      req.body && typeof req.body === 'object' ? req.body.destinationId || null : null;

    const result = await incrementViewCount(productId, destinationId);

    if (result?.error) {
      return res.status(500).json({ error: result.error });
    }

    return res.status(200).json({ success: true });
  } catch (error) {
    console.error('Error tracking view:', error);
    return res.status(500).json({ error: 'Failed to track view' });
  }
}

