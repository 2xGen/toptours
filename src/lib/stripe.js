/**
 * Stripe Configuration
 * Handles Stripe client initialization and price ID mappings
 */

import Stripe from 'stripe';

// Initialize Stripe client
export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2025-08-27.basil',
});

// Price ID mappings
export const STRIPE_PRICE_IDS = {
  // Subscriptions
  pro: process.env.STRIPE_PRO_PRICE_ID || 'price_1SUouQHZJi4L4l1bvI1BuAKn',
  pro_plus: process.env.STRIPE_PRO_PLUS_PRICE_ID || 'price_1SUoveHZJi4L4l1bBAYm3bWX',
  enterprise: process.env.STRIPE_ENTERPRISE_PRICE_ID || 'price_1SUowCHZJi4L4l1bydkPNBk8',
  
  // Instant Boost Packages
  '1000_points': process.env.STRIPE_1000_POINTS_PRICE_ID || 'price_1SUoxvHZJi4L4l1bUBEo8fuH',
  '3000_points': process.env.STRIPE_3000_POINTS_PRICE_ID || 'price_1SUoyPHZJi4L4l1bPTfZ6csD',
  '5000_points': process.env.STRIPE_5000_POINTS_PRICE_ID || 'price_1SUoyvHZJi4L4l1bJjHAD9PI',
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

