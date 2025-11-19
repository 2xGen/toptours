import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

const FROM_EMAIL = process.env.RESEND_FROM_EMAIL || 'noreply@toptoursai.com';
const FROM_NAME = 'TopTours.ai™';

/**
 * Send subscription confirmation email
 */
export async function sendSubscriptionConfirmationEmail({ 
  to, 
  planName, 
  startDate, 
  endDate 
}) {
  try {
    const { data, error } = await resend.emails.send({
      from: `${FROM_NAME} <${FROM_EMAIL}>`,
      to: [to],
      subject: `Welcome to ${planName}! Your subscription is active`,
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
          </head>
          <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
              <h1 style="color: white; margin: 0; font-size: 28px;">Welcome to ${planName}! 🎉</h1>
            </div>
            
            <div style="background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px;">
              <p style="font-size: 16px; margin-bottom: 20px;">Thank you for subscribing to TopTours.ai™!</p>
              
              <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #667eea;">
                <h2 style="margin-top: 0; color: #667eea;">Subscription Details</h2>
                <p style="margin: 10px 0;"><strong>Plan:</strong> ${planName}</p>
                <p style="margin: 10px 0;"><strong>Started:</strong> ${new Date(startDate).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
                <p style="margin: 10px 0;"><strong>Renews:</strong> ${new Date(endDate).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
              </div>
              
              <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0;">
                <h3 style="margin-top: 0; color: #333;">What's Next?</h3>
                <ul style="padding-left: 20px;">
                  <li>Start promoting your favorite tours with daily points</li>
                  <li>Build your streak to unlock exclusive benefits</li>
                  <li>Climb the leaderboard and become a top promoter</li>
                  <li>Get AI-powered tour recommendations</li>
                </ul>
              </div>
              
              <div style="text-align: center; margin: 30px 0;">
                <a href="https://toptours.ai/profile?tab=plan" style="display: inline-block; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; font-weight: 600;">View Your Profile</a>
              </div>
              
              <p style="font-size: 14px; color: #666; margin-top: 30px; border-top: 1px solid #e5e7eb; padding-top: 20px;">
                Questions? Reply to this email or visit <a href="https://toptours.ai/contact" style="color: #667eea;">our contact page</a>.
              </p>
              
              <p style="font-size: 12px; color: #999; margin-top: 20px;">
                © ${new Date().getFullYear()} TopTours.ai™. All rights reserved.
              </p>
            </div>
          </body>
        </html>
      `,
    });

    if (error) {
      console.error('Error sending subscription confirmation email:', error);
      return { success: false, error };
    }

    return { success: true, data };
  } catch (error) {
    console.error('Error sending subscription confirmation email:', error);
    return { success: false, error };
  }
}

/**
 * Send instant boost payment confirmation email
 */
export async function sendInstantBoostConfirmationEmail({ 
  to, 
  tourName, 
  points, 
  tourUrl 
}) {
  try {
    const { data, error } = await resend.emails.send({
      from: `${FROM_NAME} <${FROM_EMAIL}>`,
      to: [to],
      subject: `Your instant boost is live! ${points} points added`,
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
          </head>
          <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
              <h1 style="color: white; margin: 0; font-size: 28px;">Boost Successful! ⚡</h1>
            </div>
            
            <div style="background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px;">
              <p style="font-size: 16px; margin-bottom: 20px;">Your instant boost has been applied successfully!</p>
              
              <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #f59e0b;">
                <h2 style="margin-top: 0; color: #f59e0b;">Boost Details</h2>
                <p style="margin: 10px 0;"><strong>Tour:</strong> ${tourName || 'Your selected tour'}</p>
                <p style="margin: 10px 0;"><strong>Points Added:</strong> ${points.toLocaleString()}</p>
                <p style="margin: 10px 0;"><strong>Status:</strong> <span style="color: #10b981; font-weight: 600;">✓ Live on leaderboard</span></p>
              </div>
              
              <div style="background: #fef3c7; padding: 15px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #f59e0b;">
                <p style="margin: 0; font-size: 14px; color: #92400e;">
                  <strong>Note:</strong> Instant boosts add points immediately but don't count toward your daily streak or top promoter rankings. For those benefits, use your daily subscription points!
                </p>
              </div>
              
              ${tourUrl ? `
              <div style="text-align: center; margin: 30px 0;">
                <a href="${tourUrl}" style="display: inline-block; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; font-weight: 600;">View Tour</a>
              </div>
              ` : ''}
              
              <p style="font-size: 14px; color: #666; margin-top: 30px; border-top: 1px solid #e5e7eb; padding-top: 20px;">
                Questions? Reply to this email or visit <a href="https://toptours.ai/contact" style="color: #667eea;">our contact page</a>.
              </p>
              
              <p style="font-size: 12px; color: #999; margin-top: 20px;">
                © ${new Date().getFullYear()} TopTours.ai™. All rights reserved.
              </p>
            </div>
          </body>
        </html>
      `,
    });

    if (error) {
      console.error('Error sending instant boost confirmation email:', error);
      return { success: false, error };
    }

    return { success: true, data };
  } catch (error) {
    console.error('Error sending instant boost confirmation email:', error);
    return { success: false, error };
  }
}

/**
 * Send subscription cancellation email
 */
export async function sendSubscriptionCancellationEmail({ 
  to, 
  planName, 
  endDate 
}) {
  try {
    const { data, error } = await resend.emails.send({
      from: `${FROM_NAME} <${FROM_EMAIL}>`,
      to: [to],
      subject: `Your ${planName} subscription has been cancelled`,
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
          </head>
          <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
              <h1 style="color: white; margin: 0; font-size: 28px;">Subscription Cancelled</h1>
            </div>
            
            <div style="background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px;">
              <p style="font-size: 16px; margin-bottom: 20px;">We're sorry to see you go! Your subscription has been cancelled.</p>
              
              <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #f59e0b;">
                <h2 style="margin-top: 0; color: #f59e0b;">What Happens Next?</h2>
                <p style="margin: 10px 0;"><strong>Plan:</strong> ${planName}</p>
                <p style="margin: 10px 0;"><strong>Active Until:</strong> ${new Date(endDate).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
                <p style="margin: 10px 0; color: #666;">Your subscription benefits will remain active until this date.</p>
              </div>
              
              <div style="background: #fee2e2; padding: 15px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #ef4444;">
                <h3 style="margin-top: 0; color: #991b1b;">After ${new Date(endDate).toLocaleDateString('en-US', { month: 'long', day: 'numeric' })}:</h3>
                <ul style="padding-left: 20px; color: #7f1d1d;">
                  <li>Daily points will reset to 50 (free tier)</li>
                  <li>AI matches will reset to 1 per day</li>
                  <li>Subscription badge will be removed</li>
                  <li>You'll be moved to the free plan automatically</li>
                </ul>
              </div>
              
              <div style="text-align: center; margin: 30px 0;">
                <a href="https://toptours.ai/profile?tab=plan" style="display: inline-block; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; font-weight: 600;">Reactivate Subscription</a>
              </div>
              
              <p style="font-size: 14px; color: #666; margin-top: 30px; border-top: 1px solid #e5e7eb; padding-top: 20px;">
                Changed your mind? You can reactivate your subscription anytime before ${new Date(endDate).toLocaleDateString('en-US', { month: 'long', day: 'numeric' })}.
              </p>
              
              <p style="font-size: 14px; color: #666; margin-top: 20px;">
                Questions? Reply to this email or visit <a href="https://toptours.ai/contact" style="color: #667eea;">our contact page</a>.
              </p>
              
              <p style="font-size: 12px; color: #999; margin-top: 20px;">
                © ${new Date().getFullYear()} TopTours.ai™. All rights reserved.
              </p>
            </div>
          </body>
        </html>
      `,
    });

    if (error) {
      console.error('Error sending subscription cancellation email:', error);
      return { success: false, error };
    }

    return { success: true, data };
  } catch (error) {
    console.error('Error sending subscription cancellation email:', error);
    return { success: false, error };
  }
}

/**
 * Send welcome email (optional)
 */
export async function sendWelcomeEmail({ to, displayName }) {
  try {
    const { data, error } = await resend.emails.send({
      from: `${FROM_NAME} <${FROM_EMAIL}>`,
      to: [to],
      subject: 'Welcome to TopTours.ai™! Start discovering amazing tours',
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
          </head>
          <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
              <h1 style="color: white; margin: 0; font-size: 28px;">Welcome to TopTours.ai™! 🎉</h1>
            </div>
            
            <div style="background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px;">
              <p style="font-size: 16px; margin-bottom: 20px;">Hi ${displayName || 'there'},</p>
              
              <p style="font-size: 16px; margin-bottom: 20px;">Welcome to TopTours.ai™! We're excited to have you join our community of travelers discovering amazing tours worldwide.</p>
              
              <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0;">
                <h2 style="margin-top: 0; color: #667eea;">Get Started</h2>
                <ol style="padding-left: 20px;">
                  <li style="margin: 10px 0;"><strong>Explore destinations</strong> - Browse 170+ destinations worldwide</li>
                  <li style="margin: 10px 0;"><strong>Promote tours</strong> - Use your daily points to boost tours you love</li>
                  <li style="margin: 10px 0;"><strong>Build your streak</strong> - Claim points daily to unlock benefits</li>
                  <li style="margin: 10px 0;"><strong>Climb the leaderboard</strong> - Become a top promoter</li>
                </ol>
              </div>
              
              <div style="text-align: center; margin: 30px 0;">
                <a href="https://toptours.ai/destinations" style="display: inline-block; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; font-weight: 600; margin: 5px;">Explore Destinations</a>
                <a href="https://toptours.ai/how-it-works" style="display: inline-block; background: white; color: #667eea; padding: 12px 30px; text-decoration: none; border-radius: 6px; font-weight: 600; border: 2px solid #667eea; margin: 5px;">How It Works</a>
              </div>
              
              <p style="font-size: 14px; color: #666; margin-top: 30px; border-top: 1px solid #e5e7eb; padding-top: 20px;">
                Questions? Reply to this email or visit <a href="https://toptours.ai/contact" style="color: #667eea;">our contact page</a>.
              </p>
              
              <p style="font-size: 12px; color: #999; margin-top: 20px;">
                © ${new Date().getFullYear()} TopTours.ai™. All rights reserved.
              </p>
            </div>
          </body>
        </html>
      `,
    });

    if (error) {
      console.error('Error sending welcome email:', error);
      return { success: false, error };
    }

    return { success: true, data };
  } catch (error) {
    console.error('Error sending welcome email:', error);
    return { success: false, error };
  }
}

