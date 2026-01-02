/**
 * Verify Stripe Checkout Session
 * 
 * This endpoint verifies that a checkout session was actually successful
 * before showing success message to the user. This prevents showing success
 * for cancelled or failed payments.
 * 
 * GET /api/internal/verify-checkout-session?session_id=cs_xxx
 */

import { NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const sessionId = searchParams.get('session_id');

    if (!sessionId) {
      return NextResponse.json(
        { error: 'session_id is required' },
        { status: 400 }
      );
    }

    // Verify session with Stripe
    let session;
    try {
      session = await stripe.checkout.sessions.retrieve(sessionId);
    } catch (error) {
      console.error(`Error retrieving checkout session ${sessionId}:`, error);
      return NextResponse.json(
        { error: 'Invalid session ID', verified: false },
        { status: 400 }
      );
    }

    // Check if payment was successful
    const isSuccessful = 
      session.payment_status === 'paid' && 
      (session.status === 'complete' || session.status === 'open');

    // Get subscription status if it's a subscription
    let subscriptionStatus = null;
    if (session.mode === 'subscription' && session.subscription) {
      try {
        const subscription = await stripe.subscriptions.retrieve(session.subscription);
        subscriptionStatus = subscription.status;
      } catch (error) {
        console.warn(`Could not retrieve subscription ${session.subscription}:`, error);
      }
    }

    return NextResponse.json({
      verified: isSuccessful,
      session: {
        id: session.id,
        payment_status: session.payment_status,
        status: session.status,
        mode: session.mode,
        subscription_id: session.subscription,
        subscription_status: subscriptionStatus,
        customer_email: session.customer_email,
        metadata: session.metadata,
      },
    });
  } catch (error) {
    console.error('Error verifying checkout session:', error);
    return NextResponse.json(
      { error: 'Failed to verify session', verified: false },
      { status: 500 }
    );
  }
}

