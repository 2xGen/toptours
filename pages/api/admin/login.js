import { createSupabaseServiceRoleClient } from '@/lib/supabaseClient';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { password } = req.body;

    if (!password) {
      return res.status(400).json({ error: 'Password is required' });
    }

    const supabase = createSupabaseServiceRoleClient();

    // Get admin password from settings
    const { data: setting, error } = await supabase
      .from('admin_settings')
      .select('setting_value')
      .eq('setting_key', 'admin_password')
      .single();

    if (error || !setting) {
      console.error('Error fetching admin password:', error);
      return res.status(500).json({ error: 'Failed to verify password' });
    }

    // Simple password comparison (plain text for now)
    // In production, you might want to hash the password
    if (password === setting.setting_value) {
      // Generate a simple session token (in production, use proper JWT)
      const sessionToken = `admin_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      return res.status(200).json({ 
        success: true, 
        token: sessionToken,
        message: 'Login successful' 
      });
    } else {
      return res.status(401).json({ error: 'Invalid password' });
    }
  } catch (error) {
    console.error('Error in admin login:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

