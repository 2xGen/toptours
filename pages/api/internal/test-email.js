/**
 * Test endpoint to diagnose Resend email setup
 * GET /api/internal/test-email - Check configuration
 * POST /api/internal/test-email - Send test email
 */

import { Resend } from 'resend';

export default async function handler(req, res) {
  // Only allow in development or with secret key
  if (process.env.NODE_ENV === 'production' && req.query.secret !== process.env.ADMIN_SECRET) {
    return res.status(403).json({ error: 'Forbidden' });
  }

  const apiKey = process.env.RESEND_API_KEY;
  const fromEmail = process.env.RESEND_FROM_EMAIL || 'noreply@toptoursai.com';

  // GET - Check configuration OR send test email with ?send=your@email.com
  if (req.method === 'GET') {
    // If ?send= is provided, send a test email directly
    if (req.query.send) {
      const to = req.query.send;
      
      if (!apiKey) {
        return res.status(500).json({ error: 'RESEND_API_KEY not configured' });
      }

      try {
        const resend = new Resend(apiKey);
        
        const { data, error } = await resend.emails.send({
          from: `TopTours.ai <${fromEmail}>`,
          to: [to],
          subject: '✅ TopTours.ai Email Test - Success!',
          html: `
            <div style="font-family: Arial, sans-serif; padding: 20px; max-width: 500px; margin: 0 auto;">
              <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; border-radius: 10px;">
                <h1 style="color: white; margin: 0;">🎉 It Works!</h1>
              </div>
              <div style="padding: 20px; background: #f9f9f9; border-radius: 0 0 10px 10px;">
                <p>Your Resend email setup is working correctly!</p>
                <p><strong>From:</strong> ${fromEmail}</p>
                <p><strong>To:</strong> ${to}</p>
                <p><strong>Time:</strong> ${new Date().toLocaleString()}</p>
              </div>
            </div>
          `,
        });

        if (error) {
          return res.status(500).json({ 
            success: false, 
            error: error.message || JSON.stringify(error),
            hint: getErrorHint(error)
          });
        }

        return res.status(200).json({ 
          success: true, 
          message: `✅ Test email sent to ${to}! Check your inbox.`,
          messageId: data?.id 
        });
      } catch (err) {
        return res.status(500).json({ 
          success: false, 
          error: err.message,
          hint: getErrorHint(err)
        });
      }
    }

    // Otherwise, show configuration
    const config = {
      hasApiKey: !!apiKey,
      apiKeyPrefix: apiKey ? apiKey.substring(0, 10) + '...' : null,
      apiKeyLength: apiKey ? apiKey.length : 0,
      fromEmail: fromEmail,
      nodeEnv: process.env.NODE_ENV,
      testUrl: `${req.headers.host}/api/internal/test-email?send=YOUR_EMAIL`,
      status: apiKey ? '✅ API key configured - use ?send=email to test' : '❌ No API key',
    };

    return res.status(200).json(config);
  }

  // POST - Send test email
  if (req.method === 'POST') {
    const { to } = req.body;

    if (!to) {
      return res.status(400).json({ error: 'Missing "to" email address in request body' });
    }

    if (!apiKey) {
      return res.status(500).json({ 
        error: 'RESEND_API_KEY is not configured',
        hint: 'Add RESEND_API_KEY to your .env.local file'
      });
    }

    try {
      const resend = new Resend(apiKey);
      
      console.log(`📧 Attempting to send test email to: ${to}`);
      console.log(`📧 From: ${fromEmail}`);
      
      const { data, error } = await resend.emails.send({
        from: `TopTours.ai Test <${fromEmail}>`,
        to: [to],
        subject: '✅ TopTours.ai Email Test - It Works!',
        html: `
          <!DOCTYPE html>
          <html>
            <head>
              <meta charset="utf-8">
            </head>
            <body style="font-family: Arial, sans-serif; padding: 20px;">
              <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; border-radius: 10px;">
                <h1 style="color: white; margin: 0;">🎉 Email Test Successful!</h1>
              </div>
              <div style="padding: 20px;">
                <p>If you're reading this, your Resend email setup is working correctly!</p>
                <p><strong>Configuration:</strong></p>
                <ul>
                  <li>From: ${fromEmail}</li>
                  <li>To: ${to}</li>
                  <li>Sent at: ${new Date().toISOString()}</li>
                </ul>
                <p>You can now receive transactional emails from TopTours.ai.</p>
              </div>
            </body>
          </html>
        `,
      });

      if (error) {
        console.error('❌ Resend API error:', error);
        return res.status(500).json({ 
          success: false, 
          error: error.message || JSON.stringify(error),
          errorDetails: error,
          hint: getErrorHint(error)
        });
      }

      console.log('✅ Test email sent successfully:', data?.id);
      return res.status(200).json({ 
        success: true, 
        messageId: data?.id,
        message: `Test email sent to ${to}. Check your inbox!`
      });

    } catch (err) {
      console.error('❌ Exception sending test email:', err);
      return res.status(500).json({ 
        success: false, 
        error: err.message,
        stack: process.env.NODE_ENV === 'development' ? err.stack : undefined,
        hint: getErrorHint(err)
      });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}

function getErrorHint(error) {
  const msg = error?.message?.toLowerCase() || '';
  
  if (msg.includes('api key') || msg.includes('unauthorized') || msg.includes('invalid')) {
    return 'Your API key may be invalid. Check RESEND_API_KEY in your environment variables.';
  }
  if (msg.includes('domain') || msg.includes('from') || msg.includes('not verified')) {
    return 'Your "from" domain may not be verified in Resend. Go to resend.com/domains to verify your domain, or use onboarding@resend.dev for testing.';
  }
  if (msg.includes('rate') || msg.includes('limit')) {
    return 'You may have hit rate limits. Wait a few minutes and try again.';
  }
  return 'Check the Resend dashboard for more details: https://resend.com/emails';
}

