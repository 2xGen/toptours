import { createSupabaseServiceRoleClient } from '@/lib/supabaseClient';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { displayName } = req.body;

    if (!displayName || !displayName.trim()) {
      return res.status(400).json({ error: 'Display name is required' });
    }

    // Use service role to bypass RLS
    const supabase = createSupabaseServiceRoleClient();
    
    const { data, error } = await supabase
      .from('profiles')
      .select('id')
      .eq('display_name', displayName.trim())
      .maybeSingle();

    if (error) {
      // PGRST116 = no rows returned (name is available)
      if (error.code === 'PGRST116') {
        return res.status(200).json({ available: true });
      }
      console.error('Error checking display name:', error);
      return res.status(500).json({ error: 'Failed to check display name availability' });
    }

    // If data exists, name is taken; if no data, name is available
    return res.status(200).json({ available: !data });
  } catch (err) {
    console.error('Error in check-display-name API:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

