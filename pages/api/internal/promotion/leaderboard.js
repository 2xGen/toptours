import { getLeaderboardTours, getLeaderboardRestaurants } from '@/lib/promotionSystem';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', ['GET']);
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Set cache headers for leaderboard (update every 5 minutes)
  res.setHeader('Cache-Control', 'public, s-maxage=300, stale-while-revalidate=600');

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

