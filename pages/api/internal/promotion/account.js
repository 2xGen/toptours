import { getPromotionAccount } from '@/lib/promotionSystem';
import { createSupabaseServiceRoleClient } from '@/lib/supabaseClient';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', ['GET']);
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
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

    const account = await getPromotionAccount(user.id);

    if (!account) {
      return res.status(404).json({ error: 'Promotion account not found' });
    }

    return res.status(200).json(account);
  } catch (error) {
    console.error('Error fetching promotion account:', error);
    return res.status(500).json({ error: 'Failed to fetch promotion account' });
  }
}

