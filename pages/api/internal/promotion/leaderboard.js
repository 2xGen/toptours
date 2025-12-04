import { getLeaderboardTours, getLeaderboardRestaurants } from '@/lib/promotionSystem';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', ['GET']);
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Check if request is from a logged-in user (has auth cookie or fresh=true param)
  const wantsFresh = req.query.fresh === 'true' || req.headers.cookie?.includes('sb-');
  
  if (wantsFresh) {
    // Logged-in users get fresh data (no CDN cache, but browser can cache briefly)
    res.setHeader('Cache-Control', 'private, max-age=30, must-revalidate');
  } else {
    // Anonymous users get CDN-cached data (cost savings)
    res.setHeader('Cache-Control', 'public, s-maxage=120, stale-while-revalidate=300');
  }

  try {
    const { scoreType = 'all', region = null, limit = 100, offset = 0, type = 'tours' } = req.query;

    if (type === 'restaurants') {
      const restaurants = await getLeaderboardRestaurants({
        scoreType,
        region: region || null,
        limit: parseInt(limit) || 100,
        offset: parseInt(offset) || 0,
      });

      return res.status(200).json({ restaurants, count: restaurants.length });
    } else {
      const tours = await getLeaderboardTours({
        scoreType,
        region: region || null,
        limit: parseInt(limit) || 100,
        offset: parseInt(offset) || 0,
      });

      return res.status(200).json({ tours, count: tours.length });
    }
  } catch (error) {
    console.error('Error fetching leaderboard:', error);
    return res.status(500).json({ error: 'Failed to fetch leaderboard' });
  }
}

