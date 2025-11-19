import { getTourPromotionScore } from '@/lib/promotionSystem';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', ['GET']);
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Set cache headers (scores update frequently but can be cached briefly)
  res.setHeader('Cache-Control', 'public, s-maxage=60, stale-while-revalidate=300');

  try {
    const { productId } = req.query;

    if (!productId) {
      return res.status(400).json({ error: 'Product ID required' });
    }

    const score = await getTourPromotionScore(productId);

    if (!score) {
      return res.status(200).json({ 
        productId,
        total_score: 0,
        monthly_score: 0,
        weekly_score: 0,
        past_28_days_score: 0,
      });
    }

    return res.status(200).json(score);
  } catch (error) {
    console.error('Error fetching tour score:', error);
    return res.status(500).json({ error: 'Failed to fetch tour score' });
  }
}

