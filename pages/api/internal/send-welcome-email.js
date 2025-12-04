/**
 * Send welcome email to new users
 * POST /api/internal/send-welcome-email
 */

import { createSupabaseServiceRoleClient } from '@/lib/supabaseClient';
import { sendWelcomeEmail } from '@/lib/email';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { userId } = req.body;

    if (!userId) {
      return res.status(400).json({ error: 'Missing userId' });
    }

    const supabase = createSupabaseServiceRoleClient();

    // Get user email and profile
    const { data: { user }, error: userError } = await supabase.auth.admin.getUserById(userId);
    
    if (userError || !user) {
      console.error('Error fetching user:', userError);
      return res.status(404).json({ error: 'User not found' });
    }

    // Get display name from profile
    const { data: profile } = await supabase
      .from('profiles')
      .select('display_name')
      .eq('id', userId)
      .single();

    const displayName = profile?.display_name || 'there';
    const email = user.email;

    if (!email) {
      return res.status(400).json({ error: 'User has no email' });
    }

    // Send welcome email
    console.log(`📧 Sending welcome email to ${email} (${displayName})`);
    const result = await sendWelcomeEmail({ to: email, displayName });

    if (!result.success) {
      console.error('Failed to send welcome email:', result.error);
      return res.status(500).json({ error: 'Failed to send email', details: result.error });
    }

    console.log(`✅ Welcome email sent to ${email}`);
    return res.status(200).json({ success: true, message: `Welcome email sent to ${email}` });

  } catch (error) {
    console.error('Error in send-welcome-email:', error);
    return res.status(500).json({ error: error.message });
  }
}

