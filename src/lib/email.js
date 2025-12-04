import { Resend } from 'resend';

// Initialize Resend with API key
const resendApiKey = process.env.RESEND_API_KEY;
if (!resendApiKey) {
  console.warn('⚠️ RESEND_API_KEY is not set in environment variables');
}

const resend = resendApiKey ? new Resend(resendApiKey) : null;

const FROM_EMAIL = process.env.RESEND_FROM_EMAIL || 'noreply@toptoursai.com';
const FROM_NAME = 'TopTours.ai™';

// Log configuration on module load (only in development)
if (process.env.NODE_ENV === 'development') {
  console.log('📧 Resend email configuration:', {
    hasApiKey: !!resendApiKey,
    fromEmail: FROM_EMAIL,
    fromName: FROM_NAME,
  });
}

/**
 * Send subscription confirmation email
 */
export async function sendSubscriptionConfirmationEmail({ 
  to, 
  planName, 
  startDate, 
  endDate 
}) {
  if (!resend) {
    console.error('❌ Resend not initialized - RESEND_API_KEY is missing');
    return { success: false, error: 'Resend not configured' };
  }

  try {
    console.log(`📧 Attempting to send subscription confirmation email to: ${to}`);
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
                Questions? Visit <a href="https://toptours.ai/contact" style="color: #667eea;">our contact page</a>.
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
      console.error('❌ Resend API error sending subscription confirmation email:', error);
      console.error('Error details:', JSON.stringify(error, null, 2));
      return { success: false, error };
    }

    console.log('✅ Subscription confirmation email sent successfully:', data?.id);
    return { success: true, data };
  } catch (error) {
    console.error('❌ Exception sending subscription confirmation email:', error);
    console.error('Error stack:', error.stack);
    return { success: false, error };
  }
}

/**
 * Send instant boost payment confirmation email
 * @param {string} type - 'tour' or 'restaurant' (defaults to 'tour')
 */
export async function sendInstantBoostConfirmationEmail({ 
  to, 
  tourName, 
  points, 
  tourUrl,
  type = 'tour'
}) {
  if (!resend) {
    console.error('❌ Resend not initialized - RESEND_API_KEY is missing');
    return { success: false, error: 'Resend not configured' };
  }

  const isRestaurant = type === 'restaurant';
  const itemLabel = isRestaurant ? 'Restaurant' : 'Tour';
  const itemName = tourName || (isRestaurant ? 'Your selected restaurant' : 'Your selected tour');
  const buttonText = isRestaurant ? 'View Restaurant' : 'View Tour';

  try {
    console.log(`📧 Attempting to send instant boost confirmation email to: ${to}`);
    const { data, error } = await resend.emails.send({
      from: `${FROM_NAME} <${FROM_EMAIL}>`,
      to: [to],
      subject: `Your instant boost is live! ${points.toLocaleString()} points added`,
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
                <p style="margin: 10px 0;"><strong>${itemLabel}:</strong> ${itemName}</p>
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
                <a href="${tourUrl}" style="display: inline-block; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; font-weight: 600;">${buttonText}</a>
              </div>
              ` : ''}
              
              <p style="font-size: 14px; color: #666; margin-top: 30px; border-top: 1px solid #e5e7eb; padding-top: 20px;">
                Questions? Visit <a href="https://toptours.ai/contact" style="color: #667eea;">our contact page</a>.
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
      console.error('❌ Resend API error sending instant boost confirmation email:', error);
      console.error('Error details:', JSON.stringify(error, null, 2));
      return { success: false, error };
    }

    console.log('✅ Instant boost confirmation email sent successfully:', data?.id);
    return { success: true, data };
  } catch (error) {
    console.error('❌ Exception sending instant boost confirmation email:', error);
    console.error('Error stack:', error.stack);
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
  if (!resend) {
    console.error('❌ Resend not initialized - RESEND_API_KEY is missing');
    return { success: false, error: 'Resend not configured' };
  }

  try {
    console.log(`📧 Attempting to send subscription cancellation email to: ${to}`);
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
                Questions? Visit <a href="https://toptours.ai/contact" style="color: #667eea;">our contact page</a>.
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
 * Send restaurant premium subscription confirmation email
 */
export async function sendRestaurantPremiumConfirmationEmail({ 
  to, 
  restaurantName, 
  planType,
  destinationId,
  restaurantSlug,
  endDate 
}) {
  if (!resend) {
    console.error('❌ Resend not initialized - RESEND_API_KEY is missing');
    return { success: false, error: 'Resend not configured' };
  }

  try {
    console.log(`📧 Attempting to send restaurant premium confirmation email to: ${to}`);
    const restaurantUrl = `https://toptours.ai/destinations/${destinationId}/restaurants/${restaurantSlug}`;
    const priceLabel = planType === 'yearly' ? '$4.99/month (billed yearly)' : '$7.99/month';
    
    const { data, error } = await resend.emails.send({
      from: `${FROM_NAME} <${FROM_EMAIL}>`,
      to: [to],
      subject: `🎉 ${restaurantName} is now Premium on TopTours.ai!`,
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
          </head>
          <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="background: linear-gradient(135deg, #f59e0b 0%, #ea580c 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
              <h1 style="color: white; margin: 0; font-size: 28px;">👑 Premium Activated!</h1>
            </div>
            
            <div style="background: #fffbeb; padding: 30px; border-radius: 0 0 10px 10px; border: 2px solid #fbbf24; border-top: none;">
              <p style="font-size: 16px; margin-bottom: 20px;">Congratulations! <strong>${restaurantName}</strong> is now featured as a Premium restaurant on TopTours.ai.</p>
              
              <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #f59e0b;">
                <h2 style="margin-top: 0; color: #f59e0b;">What's Active Now</h2>
                <ul style="padding-left: 20px; margin: 10px 0;">
                  <li style="margin: 8px 0;">👑 <strong>TOP Badge</strong> - Premium crown next to your name</li>
                  <li style="margin: 8px 0;">🔵 <strong>Hero CTA Button</strong> - Prominent "Reserve" button</li>
                  <li style="margin: 8px 0;">📢 <strong>Mid-Page Banner</strong> - Eye-catching call-to-action</li>
                  <li style="margin: 8px 0;">📌 <strong>Sticky Button</strong> - Always visible floating button</li>
                  <li style="margin: 8px 0;">⭐ <strong>Featured Section</strong> - Premium placement above competitors</li>
                </ul>
              </div>
              
              <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0;">
                <h3 style="margin-top: 0; color: #333;">Subscription Details</h3>
                <p style="margin: 10px 0;"><strong>Restaurant:</strong> ${restaurantName}</p>
                <p style="margin: 10px 0;"><strong>Plan:</strong> ${priceLabel}</p>
                <p style="margin: 10px 0;"><strong>Renews:</strong> ${new Date(endDate).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
              </div>
              
              <div style="text-align: center; margin: 30px 0;">
                <a href="${restaurantUrl}" style="display: inline-block; background: linear-gradient(135deg, #f59e0b 0%, #ea580c 100%); color: white; padding: 14px 32px; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 16px;">View Your Premium Page</a>
              </div>
              
              <div style="background: #fef3c7; padding: 15px; border-radius: 8px; margin: 20px 0;">
                <p style="margin: 0; font-size: 14px; color: #92400e;">
                  <strong>💡 Tip:</strong> You can customize your button colors and CTA text anytime from your <a href="https://toptours.ai/profile?tab=my-restaurants" style="color: #d97706; font-weight: 600;">profile page</a>.
                </p>
              </div>
              
              <p style="font-size: 14px; color: #666; margin-top: 30px; border-top: 1px solid #e5e7eb; padding-top: 20px;">
                Questions? Visit <a href="https://toptours.ai/contact" style="color: #f59e0b;">our contact page</a>.
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
      console.error('❌ Resend API error sending restaurant premium confirmation email:', error);
      return { success: false, error };
    }

    console.log('✅ Restaurant premium confirmation email sent successfully:', data?.id);
    return { success: true, data };
  } catch (error) {
    console.error('❌ Exception sending restaurant premium confirmation email:', error);
    return { success: false, error };
  }
}

/**
 * Send restaurant premium cancellation email
 */
export async function sendRestaurantPremiumCancellationEmail({ 
  to, 
  restaurantName, 
  destinationId,
  restaurantSlug,
  endDate 
}) {
  if (!resend) {
    console.error('❌ Resend not initialized - RESEND_API_KEY is missing');
    return { success: false, error: 'Resend not configured' };
  }

  try {
    console.log(`📧 Attempting to send restaurant premium cancellation email to: ${to}`);
    const restaurantUrl = `https://toptours.ai/destinations/${destinationId}/restaurants/${restaurantSlug}`;
    const profileUrl = 'https://toptours.ai/profile?tab=my-restaurants';
    
    const { data, error } = await resend.emails.send({
      from: `${FROM_NAME} <${FROM_EMAIL}>`,
      to: [to],
      subject: `Your Premium subscription for ${restaurantName} has been cancelled`,
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
          </head>
          <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="background: linear-gradient(135deg, #f59e0b 0%, #ea580c 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
              <h1 style="color: white; margin: 0; font-size: 28px;">Premium Subscription Cancelled</h1>
            </div>
            
            <div style="background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px;">
              <p style="font-size: 16px; margin-bottom: 20px;">We're sorry to see you go! Your Premium subscription for <strong>${restaurantName}</strong> has been cancelled.</p>
              
              <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #f59e0b;">
                <h2 style="margin-top: 0; color: #f59e0b;">What Happens Next?</h2>
                <p style="margin: 10px 0;"><strong>Restaurant:</strong> ${restaurantName}</p>
                <p style="margin: 10px 0;"><strong>Premium Active Until:</strong> ${new Date(endDate).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
                <p style="margin: 10px 0; color: #666;">Your premium features will remain active until this date.</p>
              </div>
              
              <div style="background: #fee2e2; padding: 15px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #ef4444;">
                <h3 style="margin-top: 0; color: #991b1b;">After ${new Date(endDate).toLocaleDateString('en-US', { month: 'long', day: 'numeric' })}:</h3>
                <ul style="padding-left: 20px; color: #7f1d1d; margin: 10px 0;">
                  <li>👑 TOP Badge will be removed</li>
                  <li>🔵 Hero CTA button will be removed</li>
                  <li>📢 Mid-page banner will be removed</li>
                  <li>📌 Sticky button will be removed</li>
                  <li>⭐ Featured section placement will end</li>
                </ul>
                <p style="margin: 10px 0 0 0; color: #991b1b; font-size: 14px;">Your restaurant page will return to the standard listing format.</p>
              </div>
              
              <div style="background: #ecfdf5; padding: 15px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #10b981;">
                <p style="margin: 0; color: #065f46;">
                  <strong>Changed your mind?</strong> You can reactivate Premium anytime before ${new Date(endDate).toLocaleDateString('en-US', { month: 'long', day: 'numeric' })} to keep your enhanced visibility.
                </p>
              </div>
              
              <div style="text-align: center; margin: 30px 0;">
                <a href="${restaurantUrl}" style="display: inline-block; background: linear-gradient(135deg, #f59e0b 0%, #ea580c 100%); color: white; padding: 14px 32px; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 16px;">Reactivate Premium</a>
              </div>
              
              <p style="font-size: 14px; color: #666; margin-top: 30px; border-top: 1px solid #e5e7eb; padding-top: 20px;">
                Questions? Visit <a href="https://toptours.ai/contact" style="color: #f59e0b;">our contact page</a>.
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
      console.error('❌ Resend API error sending restaurant premium cancellation email:', error);
      return { success: false, error };
    }

    console.log('✅ Restaurant premium cancellation email sent successfully:', data?.id);
    return { success: true, data };
  } catch (error) {
    console.error('❌ Exception sending restaurant premium cancellation email:', error);
    return { success: false, error };
  }
}

/**
 * Send welcome email to new users
 */
export async function sendWelcomeEmail({ to, displayName }) {
  if (!resend) {
    console.error('❌ Resend not initialized - RESEND_API_KEY is missing');
    return { success: false, error: 'Resend not configured' };
  }

  try {
    console.log(`📧 Attempting to send welcome email to: ${to}`);
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
              
<p style="font-size: 16px; margin-bottom: 20px;">Welcome to TopTours.ai™! We're excited to have you join our community of travelers discovering amazing tours and restaurants worldwide.</p>
                
                <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0;">
                  <h2 style="margin-top: 0; color: #667eea;">Get Started</h2>
                  <ol style="padding-left: 20px;">
                    <li style="margin: 10px 0;"><strong>Explore destinations</strong> - Browse 3,500+ destinations worldwide</li>
                    <li style="margin: 10px 0;"><strong>Promote tours & restaurants</strong> - Use your daily points to boost tours and restaurants you love</li>
                    <li style="margin: 10px 0;"><strong>Build your streak</strong> - Claim points daily to unlock benefits</li>
                    <li style="margin: 10px 0;"><strong>Climb the leaderboard</strong> - Become a top promoter</li>
                  </ol>
                </div>
              
              <div style="text-align: center; margin: 30px 0;">
                <a href="https://toptours.ai/destinations" style="display: inline-block; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; font-weight: 600; margin: 5px;">Explore Destinations</a>
                <a href="https://toptours.ai/how-it-works" style="display: inline-block; background: white; color: #667eea; padding: 12px 30px; text-decoration: none; border-radius: 6px; font-weight: 600; border: 2px solid #667eea; margin: 5px;">How It Works</a>
              </div>
              
<p style="font-size: 14px; color: #666; margin-top: 30px; border-top: 1px solid #e5e7eb; padding-top: 20px;">
                  Questions? Visit <a href="https://toptours.ai/contact" style="color: #667eea;">our contact page</a>.
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

    console.log('✅ Welcome email sent successfully:', data?.id);
    return { success: true, data };
  } catch (error) {
    console.error('Error sending welcome email:', error);
    return { success: false, error };
  }
}

