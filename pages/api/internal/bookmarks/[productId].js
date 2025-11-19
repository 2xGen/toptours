import { createSupabaseServiceRoleClient } from '@/lib/supabaseClient';

export default async function handler(req, res) {
  const supabase = createSupabaseServiceRoleClient();

  if (req.method !== 'DELETE') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { productId } = req.query;
    const { userId } = req.body || {};
    if (!productId || !userId) return res.status(400).json({ error: 'Missing productId or userId' });
    const { error } = await supabase
      .from('bookmarks')
      .delete()
      .eq('user_id', userId)
      .eq('product_id', productId);
    if (error) throw error;
    return res.status(200).json({ ok: true });
  } catch (err) {
    return res.status(500).json({ error: err.message || 'Server error' });
  }
}


