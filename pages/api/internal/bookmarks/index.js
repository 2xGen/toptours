import { createSupabaseServiceRoleClient } from '@/lib/supabaseClient';

export default async function handler(req, res) {
  const supabase = createSupabaseServiceRoleClient();

  try {
    if (req.method === 'GET') {
      const userId = req.query.userId;
      if (!userId) return res.status(400).json({ error: 'Missing userId' });
      const { data, error } = await supabase
        .from('bookmarks')
        .select('product_id, created_at')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return res.status(200).json({ bookmarks: data || [] });
    }

    if (req.method === 'POST') {
      const { userId, productId } = req.body || {};
      if (!userId || !productId) return res.status(400).json({ error: 'Missing userId or productId' });
      const { error } = await supabase
        .from('bookmarks')
        .upsert({ user_id: userId, product_id: productId });
      if (error) throw error;
      return res.status(200).json({ ok: true });
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (err) {
    return res.status(500).json({ error: err.message || 'Server error' });
  }
}


