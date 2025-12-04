/**
 * Restaurant Premium - Stripe Customer Portal
 * Creates a portal session for customers to manage their subscription
 */

import { stripe } from '@/lib/stripe';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { customerId, returnUrl } = req.body;

    if (!customerId) {
      return res.status(400).json({ error: 'Customer ID is required' });
    }

    if (!returnUrl) {
      return res.status(400).json({ error: 'Return URL is required' });
    }

    // Create a portal session
    const portalSession = await stripe.billingPortal.sessions.create({
      customer: customerId,
      return_url: returnUrl,
    });

    return res.status(200).json({ url: portalSession.url });
  } catch (error) {
    console.error('Error creating portal session:', error);
    return res.status(500).json({ error: error.message || 'Failed to create portal session' });
  }
}

