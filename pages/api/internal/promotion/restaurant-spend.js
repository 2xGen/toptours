import { spendPointsOnRestaurant } from '@/lib/promotionSystem';
import { createSupabaseServiceRoleClient } from '@/lib/supabaseClient';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { restaurantId, points, scoreType = 'all', restaurantData } = req.body;

    if (!restaurantId || !points || points <= 0) {
      return res.status(400).json({ error: 'Invalid parameters' });
    }

    // Get user ID from auth token
    const supabase = createSupabaseServiceRoleClient();
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);

    if (authError || !user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const result = await spendPointsOnRestaurant(user.id, parseInt(restaurantId), points, scoreType, restaurantData);

    if (result.error) {
      return res.status(400).json({ error: result.error });
    }

    return res.status(200).json(result);
  } catch (error) {
    console.error('Error spending points on restaurant:', error);
    return res.status(500).json({ error: 'Failed to spend points' });
  }
}

