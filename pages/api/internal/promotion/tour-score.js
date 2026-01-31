// Promotion scores removed: no DB call, return zero to avoid unnecessary compute/egress
// import { getTourPromotionScore } from '@/lib/promotionSystem';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', ['GET']);
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Check if request is from a logged-in user (has auth cookie or fresh=true param)
  const wantsFresh = req.query.fresh === 'true' || req.headers.cookie?.includes('sb-');
  
  if (wantsFresh) {
    // Logged-in users get fresh data (no CDN cache)
    res.setHeader('Cache-Control', 'private, max-age=10, must-revalidate');
  } else {
    // Anonymous users get CDN-cached data (cost savings)
    res.setHeader('Cache-Control', 'public, s-maxage=60, stale-while-revalidate=180');
  }

  try {
    const { productId } = req.query;

    if (!productId) {
      return res.status(400).json({ error: 'Product ID required' });
    }

    // Promotion scores removed: return zero without DB call (saves compute/egress)
    return res.status(200).json({
      product_id: productId,
      productId,
      total_score: 0,
      monthly_score: 0,
      weekly_score: 0,
      past_28_days_score: 0,
    });
  } catch (error) {
    console.error('Error in tour-score:', error);
    return res.status(500).json({ error: 'Failed to fetch tour score' });
  }
}

