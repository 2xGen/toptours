/**
 * Stripe Configuration
 * Handles Stripe client initialization and price ID mappings
 */

import Stripe from 'stripe';

// Initialize Stripe client
export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2025-08-27.basil',
});

// Price ID mappings - NO FALLBACKS to prevent using wrong mode prices
export const STRIPE_PRICE_IDS = {
  // Subscriptions
  pro: process.env.STRIPE_PRO_PRICE_ID,
  pro_plus: process.env.STRIPE_PRO_PLUS_PRICE_ID,
  enterprise: process.env.STRIPE_ENTERPRISE_PRICE_ID,
  
  // Instant Boost Packages
  '1000_points': process.env.STRIPE_1000_POINTS_PRICE_ID,
  '3000_points': process.env.STRIPE_3000_POINTS_PRICE_ID,
  '5000_points': process.env.STRIPE_5000_POINTS_PRICE_ID,
  
  // Restaurant Premium Subscriptions
  restaurant_premium_monthly: process.env.STRIPE_RESTAURANT_PREMIUM_MONTHLY_PRICE_ID,
  restaurant_premium_yearly: process.env.STRIPE_RESTAURANT_PREMIUM_YEARLY_PRICE_ID,
};

// Plan to tier mapping
export const PLAN_TO_TIER = {
  pro: 'pro_booster',
  pro_plus: 'pro_plus',
  enterprise: 'enterprise',
};

// Verify Stripe is configured
export function isStripeConfigured() {
  return !!process.env.STRIPE_SECRET_KEY && !!process.env.STRIPE_WEBHOOK_SECRET;
}

