/**
 * Preview email templates
 * GET /api/internal/preview-email?template=welcome
 * GET /api/internal/preview-email?template=restaurant-premium
 * GET /api/internal/preview-email?template=subscription
 * GET /api/internal/preview-email?template=cancellation
 */

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { template } = req.query;
  const FROM_NAME = 'TopTours.ai™';

  // Sample data for previews
  const sampleData = {
    welcome: {
      displayName: 'Matthijs',
    },
    restaurantPremium: {
      restaurantName: 'Driftwood Restaurant Aruba',
      planType: 'yearly',
      priceLabel: '$4.99/month (billed yearly)',
      destinationId: 'aruba',
      restaurantSlug: 'driftwood-restaurant-aruba-aruba',
      restaurantUrl: 'https://toptours.ai/destinations/aruba/restaurants/driftwood-restaurant-aruba-aruba',
      endDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }),
    },
    subscription: {
      planName: 'Explorer Pro',
      startDate: new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }),
      endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }),
    },
    cancellation: {
      planName: 'Explorer Pro',
      endDate: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000),
    },
    restaurantPremiumCancellation: {
      restaurantName: 'Driftwood Restaurant Aruba',
      destinationId: 'aruba',
      restaurantSlug: 'driftwood-restaurant-aruba-aruba',
      restaurantUrl: 'https://toptours.ai/destinations/aruba/restaurants/driftwood-restaurant-aruba-aruba',
      endDate: new Date(Date.now() + 20 * 24 * 60 * 60 * 1000),
    },
    instantBoostTour: {
      tourName: 'Aruba Island Ultimate Tour with Snorkeling',
      points: 3000,
      tourUrl: 'https://toptours.ai/tours/12345',
    },
    instantBoostRestaurant: {
      restaurantName: 'Driftwood Restaurant Aruba',
      points: 1000,
      restaurantUrl: 'https://toptours.ai/destinations/aruba/restaurants/driftwood-restaurant-aruba-aruba',
    },
  };

  let html = '';

  switch (template) {
    case 'welcome':
      const { displayName } = sampleData.welcome;
      html = `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Welcome Email Preview</title>
          </head>
          <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; background: #f5f5f5;">
            <div style="background: #fff; border-radius: 10px; overflow: hidden; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
              <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center;">
                <h1 style="color: white; margin: 0; font-size: 28px;">Welcome to TopTours.ai™! 🎉</h1>
              </div>
              
              <div style="padding: 30px;">
                <p style="font-size: 16px; margin-bottom: 20px;">Hi ${displayName},</p>
                
                <p style="font-size: 16px; margin-bottom: 20px;">Welcome to TopTours.ai™! We're excited to have you join our community of travelers discovering amazing tours and restaurants worldwide.</p>
                
                <div style="background: #f9fafb; padding: 20px; border-radius: 8px; margin: 20px 0;">
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
            </div>
          </body>
        </html>
      `;
      break;

    case 'restaurant-premium':
      const rp = sampleData.restaurantPremium;
      html = `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Restaurant Premium Email Preview</title>
          </head>
          <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; background: #f5f5f5;">
            <div style="background: #fff; border-radius: 10px; overflow: hidden; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
              <div style="background: linear-gradient(135deg, #f59e0b 0%, #ea580c 100%); padding: 30px; text-align: center;">
                <h1 style="color: white; margin: 0; font-size: 28px;">👑 Premium Activated!</h1>
              </div>
              
              <div style="background: #fffbeb; padding: 30px; border: 2px solid #fbbf24; border-top: none;">
                <p style="font-size: 16px; margin-bottom: 20px;">Congratulations! <strong>${rp.restaurantName}</strong> is now featured as a Premium restaurant on TopTours.ai.</p>
                
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
                  <p style="margin: 10px 0;"><strong>Restaurant:</strong> ${rp.restaurantName}</p>
                  <p style="margin: 10px 0;"><strong>Plan:</strong> ${rp.priceLabel}</p>
                  <p style="margin: 10px 0;"><strong>Renews:</strong> ${rp.endDate}</p>
                </div>
                
                <div style="text-align: center; margin: 30px 0;">
                  <a href="${rp.restaurantUrl}" style="display: inline-block; background: linear-gradient(135deg, #f59e0b 0%, #ea580c 100%); color: white; padding: 14px 32px; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 16px;">View Your Premium Page</a>
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
            </div>
          </body>
        </html>
      `;
      break;

    case 'subscription':
      const sub = sampleData.subscription;
      html = `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Subscription Confirmation Email Preview</title>
          </head>
          <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; background: #f5f5f5;">
            <div style="background: #fff; border-radius: 10px; overflow: hidden; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
              <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center;">
                <h1 style="color: white; margin: 0; font-size: 28px;">Welcome to ${sub.planName}! 🎉</h1>
              </div>
              
              <div style="background: #f9fafb; padding: 30px;">
                <p style="font-size: 16px; margin-bottom: 20px;">Thank you for subscribing to TopTours.ai™!</p>
                
                <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #667eea;">
                  <h2 style="margin-top: 0; color: #667eea;">Subscription Details</h2>
                  <p style="margin: 10px 0;"><strong>Plan:</strong> ${sub.planName}</p>
                  <p style="margin: 10px 0;"><strong>Started:</strong> ${sub.startDate}</p>
                  <p style="margin: 10px 0;"><strong>Renews:</strong> ${sub.endDate}</p>
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
            </div>
          </body>
        </html>
      `;
      break;

    case 'cancellation':
      const cancel = sampleData.cancellation;
      const cancelEndDate = cancel.endDate.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
      const cancelShortDate = cancel.endDate.toLocaleDateString('en-US', { month: 'long', day: 'numeric' });
      html = `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Cancellation Email Preview</title>
          </head>
          <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; background: #f5f5f5;">
            <div style="background: #fff; border-radius: 10px; overflow: hidden; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
              <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center;">
                <h1 style="color: white; margin: 0; font-size: 28px;">Subscription Cancelled</h1>
              </div>
              
              <div style="background: #f9fafb; padding: 30px;">
                <p style="font-size: 16px; margin-bottom: 20px;">We're sorry to see you go! Your subscription has been cancelled.</p>
                
                <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #f59e0b;">
                  <h2 style="margin-top: 0; color: #f59e0b;">What Happens Next?</h2>
                  <p style="margin: 10px 0;"><strong>Plan:</strong> ${cancel.planName}</p>
                  <p style="margin: 10px 0;"><strong>Active Until:</strong> ${cancelEndDate}</p>
                  <p style="margin: 10px 0; color: #666;">Your subscription benefits will remain active until this date.</p>
                </div>
                
                <div style="background: #fee2e2; padding: 15px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #ef4444;">
                  <h3 style="margin-top: 0; color: #991b1b;">After ${cancelShortDate}:</h3>
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
                  Changed your mind? You can reactivate your subscription anytime before ${cancelShortDate}.
                </p>
                
                <p style="font-size: 14px; color: #666; margin-top: 20px;">
                  Questions? Visit <a href="https://toptours.ai/contact" style="color: #667eea;">our contact page</a>.
                </p>
                
                <p style="font-size: 12px; color: #999; margin-top: 20px;">
                  © ${new Date().getFullYear()} TopTours.ai™. All rights reserved.
                </p>
              </div>
            </div>
          </body>
        </html>
      `;
      break;

    case 'instant-boost-tour':
      const ibt = sampleData.instantBoostTour;
      html = `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Instant Boost (Tour) Email Preview</title>
          </head>
          <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; background: #f5f5f5;">
            <div style="background: #fff; border-radius: 10px; overflow: hidden; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
              <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center;">
                <h1 style="color: white; margin: 0; font-size: 28px;">Boost Successful! ⚡</h1>
              </div>
              
              <div style="background: #f9fafb; padding: 30px;">
                <p style="font-size: 16px; margin-bottom: 20px;">Your instant boost has been applied successfully!</p>
                
                <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #f59e0b;">
                  <h2 style="margin-top: 0; color: #f59e0b;">Boost Details</h2>
                  <p style="margin: 10px 0;"><strong>Tour:</strong> ${ibt.tourName}</p>
                  <p style="margin: 10px 0;"><strong>Points Added:</strong> ${ibt.points.toLocaleString()}</p>
                  <p style="margin: 10px 0;"><strong>Status:</strong> <span style="color: #10b981; font-weight: 600;">✓ Live on leaderboard</span></p>
                </div>
                
                <div style="background: #fef3c7; padding: 15px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #f59e0b;">
                  <p style="margin: 0; font-size: 14px; color: #92400e;">
                    <strong>Note:</strong> Instant boosts add points immediately but don't count toward your daily streak or top promoter rankings. For those benefits, use your daily subscription points!
                  </p>
                </div>
                
                <div style="text-align: center; margin: 30px 0;">
                  <a href="${ibt.tourUrl}" style="display: inline-block; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; font-weight: 600;">View Tour</a>
                </div>
                
                <p style="font-size: 14px; color: #666; margin-top: 30px; border-top: 1px solid #e5e7eb; padding-top: 20px;">
                  Questions? Visit <a href="https://toptours.ai/contact" style="color: #667eea;">our contact page</a>.
                </p>
                
                <p style="font-size: 12px; color: #999; margin-top: 20px;">
                  © ${new Date().getFullYear()} TopTours.ai™. All rights reserved.
                </p>
              </div>
            </div>
          </body>
        </html>
      `;
      break;

    case 'instant-boost-restaurant':
      const ibr = sampleData.instantBoostRestaurant;
      html = `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Instant Boost (Restaurant) Email Preview</title>
          </head>
          <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; background: #f5f5f5;">
            <div style="background: #fff; border-radius: 10px; overflow: hidden; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
              <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center;">
                <h1 style="color: white; margin: 0; font-size: 28px;">Boost Successful! ⚡</h1>
              </div>
              
              <div style="background: #f9fafb; padding: 30px;">
                <p style="font-size: 16px; margin-bottom: 20px;">Your instant boost has been applied successfully!</p>
                
                <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #f59e0b;">
                  <h2 style="margin-top: 0; color: #f59e0b;">Boost Details</h2>
                  <p style="margin: 10px 0;"><strong>Restaurant:</strong> ${ibr.restaurantName}</p>
                  <p style="margin: 10px 0;"><strong>Points Added:</strong> ${ibr.points.toLocaleString()}</p>
                  <p style="margin: 10px 0;"><strong>Status:</strong> <span style="color: #10b981; font-weight: 600;">✓ Live on leaderboard</span></p>
                </div>
                
                <div style="background: #fef3c7; padding: 15px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #f59e0b;">
                  <p style="margin: 0; font-size: 14px; color: #92400e;">
                    <strong>Note:</strong> Instant boosts add points immediately but don't count toward your daily streak or top promoter rankings. For those benefits, use your daily subscription points!
                  </p>
                </div>
                
                <div style="text-align: center; margin: 30px 0;">
                  <a href="${ibr.restaurantUrl}" style="display: inline-block; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; font-weight: 600;">View Restaurant</a>
                </div>
                
                <p style="font-size: 14px; color: #666; margin-top: 30px; border-top: 1px solid #e5e7eb; padding-top: 20px;">
                  Questions? Visit <a href="https://toptours.ai/contact" style="color: #667eea;">our contact page</a>.
                </p>
                
                <p style="font-size: 12px; color: #999; margin-top: 20px;">
                  © ${new Date().getFullYear()} TopTours.ai™. All rights reserved.
                </p>
              </div>
            </div>
          </body>
        </html>
      `;
      break;

    case 'restaurant-premium-cancellation':
      const rpc = sampleData.restaurantPremiumCancellation;
      const rpcEndDate = rpc.endDate.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
      const rpcShortDate = rpc.endDate.toLocaleDateString('en-US', { month: 'long', day: 'numeric' });
      html = `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Restaurant Premium Cancellation Email Preview</title>
          </head>
          <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; background: #f5f5f5;">
            <div style="background: #fff; border-radius: 10px; overflow: hidden; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
              <div style="background: linear-gradient(135deg, #f59e0b 0%, #ea580c 100%); padding: 30px; text-align: center;">
                <h1 style="color: white; margin: 0; font-size: 28px;">Premium Subscription Cancelled</h1>
              </div>
              
              <div style="background: #f9fafb; padding: 30px;">
                <p style="font-size: 16px; margin-bottom: 20px;">We're sorry to see you go! Your Premium subscription for <strong>${rpc.restaurantName}</strong> has been cancelled.</p>
                
                <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #f59e0b;">
                  <h2 style="margin-top: 0; color: #f59e0b;">What Happens Next?</h2>
                  <p style="margin: 10px 0;"><strong>Restaurant:</strong> ${rpc.restaurantName}</p>
                  <p style="margin: 10px 0;"><strong>Premium Active Until:</strong> ${rpcEndDate}</p>
                  <p style="margin: 10px 0; color: #666;">Your premium features will remain active until this date.</p>
                </div>
                
                <div style="background: #fee2e2; padding: 15px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #ef4444;">
                  <h3 style="margin-top: 0; color: #991b1b;">After ${rpcShortDate}:</h3>
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
                    <strong>Changed your mind?</strong> You can reactivate Premium anytime before ${rpcShortDate} to keep your enhanced visibility.
                  </p>
                </div>
                
                <div style="text-align: center; margin: 30px 0;">
                  <a href="${rpc.restaurantUrl}" style="display: inline-block; background: linear-gradient(135deg, #f59e0b 0%, #ea580c 100%); color: white; padding: 14px 32px; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 16px;">Reactivate Premium</a>
                </div>
                
                <p style="font-size: 14px; color: #666; margin-top: 30px; border-top: 1px solid #e5e7eb; padding-top: 20px;">
                  Questions? Visit <a href="https://toptours.ai/contact" style="color: #f59e0b;">our contact page</a>.
                </p>
                
                <p style="font-size: 12px; color: #999; margin-top: 20px;">
                  © ${new Date().getFullYear()} TopTours.ai™. All rights reserved.
                </p>
              </div>
            </div>
          </body>
        </html>
      `;
      break;

    default:
      return res.status(200).send(`
        <!DOCTYPE html>
        <html>
          <head>
            <title>Email Template Previews</title>
            <style>
              body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 40px auto; padding: 20px; }
              h1 { color: #333; }
              .template-list { list-style: none; padding: 0; }
              .template-list li { margin: 15px 0; }
              .template-list a { display: block; padding: 15px 20px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; text-decoration: none; border-radius: 8px; font-weight: 600; }
              .template-list a:hover { opacity: 0.9; }
              .template-list a.orange { background: linear-gradient(135deg, #f59e0b 0%, #ea580c 100%); }
              .template-list a.red { background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%); }
            </style>
          </head>
          <body>
            <h1>📧 Email Template Previews</h1>
            <p>Click to preview each email template:</p>
            <ul class="template-list">
              <li><a href="?template=welcome">Welcome Email (New User Signup)</a></li>
              <li><a href="?template=instant-boost-tour">Instant Boost - Tour</a></li>
              <li><a href="?template=instant-boost-restaurant">Instant Boost - Restaurant</a></li>
              <li><a href="?template=restaurant-premium" class="orange">Restaurant Premium Confirmation</a></li>
              <li><a href="?template=restaurant-premium-cancellation" class="red">Restaurant Premium Cancellation</a></li>
              <li><a href="?template=subscription">Subscription Confirmation</a></li>
              <li><a href="?template=cancellation">Subscription Cancellation</a></li>
            </ul>
          </body>
        </html>
      `);
  }

  res.setHeader('Content-Type', 'text/html');
  return res.status(200).send(html);
}

