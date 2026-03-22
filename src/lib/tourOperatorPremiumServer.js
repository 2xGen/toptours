/**
 * Server-side utilities for tour operator premium subscriptions
 */

import { createSupabaseServerClientForTourOperatorPremiumReads } from '@/lib/supabaseClient';
import { getTourUrl } from '@/utils/tourHelpers';

/** Prefer DB toptours_url only when it already includes a slug segment; else derive from title. */
function operatorTourInternalUrl(productId, tourTitle, toptoursUrl) {
  const u = typeof toptoursUrl === 'string' ? toptoursUrl.trim() : '';
  if (u && /^\/tours\/[^/]+\/[^/]+/.test(u) && !u.includes('//')) {
    return u;
  }
  if (tourTitle) {
    return getTourUrl(productId, tourTitle);
  }
  return u || `/tours/${productId}`;
}

/** Normalize Viator product codes for comparison (case-insensitive). */
function normalizeProductIdKey(productId) {
  return String(productId ?? '').trim().toLowerCase();
}

function subscriptionRowToPremiumPayload(subscription) {
  if (!subscription || subscription.status !== 'active') return null;
  if (subscription.current_period_end) {
    const endDate = new Date(subscription.current_period_end);
    if (endDate < new Date()) return null;
  }
  return {
    id: subscription.id,
    operator_name: subscription.operator_name,
    operator_email: subscription.operator_email,
    status: subscription.status,
    subscription_plan: subscription.subscription_plan,
    total_reviews: subscription.total_reviews,
    average_rating: subscription.average_rating,
    total_tours_count: subscription.total_tours_count,
    current_period_end: subscription.current_period_end,
    verified_tour_ids: Array.isArray(subscription.verified_tour_ids) ? subscription.verified_tour_ids : [],
  };
}

/**
 * When operator_tours rows are missing (e.g. insert failed at signup) but the subscription
 * row is active and lists product IDs in verified_tour_ids, still treat the tour as premium.
 */
async function findActiveSubscriptionByVerifiedTourId(supabase, productId) {
  const key = normalizeProductIdKey(productId);
  if (!key) return null;

  const { data: subs, error } = await supabase
    .from('tour_operator_subscriptions')
    .select(
      'id, operator_name, operator_email, status, subscription_plan, total_reviews, average_rating, total_tours_count, current_period_end, verified_tour_ids'
    )
    .eq('status', 'active');

  if (error) {
    console.error('Error fetching tour_operator_subscriptions for premium fallback:', error);
    return null;
  }

  const row = (subs || []).find(
    (s) =>
      Array.isArray(s.verified_tour_ids) &&
      s.verified_tour_ids.some((id) => normalizeProductIdKey(id) === key)
  );

  return row || null;
}

/**
 * operator_tours can point at an old pending/canceled subscription while Stripe-verified
 * tours live on the active row (verified_tour_ids). Prefer verified_tour_ids first.
 */
async function pickActiveSubscriptionFromOperatorTours(supabase, productId) {
  const selectNested = `
    *,
    tour_operator_subscriptions (
      id,
      operator_name,
      operator_email,
      status,
      subscription_plan,
      total_reviews,
      average_rating,
      total_tours_count,
      current_period_end,
      verified_tour_ids
    )
  `;

  const { data: rows, error } = await supabase
    .from('operator_tours')
    .select(selectNested)
    .eq('product_id', productId)
    .eq('is_selected', true)
    .eq('is_active', true);

  if (error && error.code !== 'PGRST116') {
    console.error('Error fetching operator_tours for premium:', error);
  }

  const list = rows || [];
  const active = list.find((r) => r.tour_operator_subscriptions?.status === 'active');
  if (active?.tour_operator_subscriptions) {
    return active.tour_operator_subscriptions;
  }

  if (list.length === 0) {
    const { data: ilikeRows } = await supabase
      .from('operator_tours')
      .select(selectNested)
      .ilike('product_id', productId)
      .eq('is_selected', true)
      .eq('is_active', true);

    const ilist = ilikeRows || [];
    const activeI = ilist.find((r) => r.tour_operator_subscriptions?.status === 'active');
    if (activeI?.tour_operator_subscriptions) {
      return activeI.tour_operator_subscriptions;
    }
  }

  return null;
}

async function getActiveOperatorSubscriptionIdForProduct(supabase, productId) {
  const sub = await pickActiveSubscriptionFromOperatorTours(supabase, productId);
  return sub?.id ?? null;
}

/**
 * Get premium subscription for a tour operator by product ID
 * Returns subscription if the tour is part of a premium operator bundle
 */
export async function getTourOperatorPremiumSubscription(productId) {
  if (!productId) return null;
  
  try {
    const supabase = createSupabaseServerClientForTourOperatorPremiumReads();

    // 1) Stripe / billing truth: active subscription lists this product in verified_tour_ids
    const verifiedSub = await findActiveSubscriptionByVerifiedTourId(supabase, productId);
    if (verifiedSub) {
      return subscriptionRowToPremiumPayload(verifiedSub);
    }

    // 2) operator_tours → only follow links to an *active* subscription (skip stale pending rows)
    const subscription = await pickActiveSubscriptionFromOperatorTours(supabase, productId);
    if (subscription && subscription.status === 'active') {
      return subscriptionRowToPremiumPayload(subscription);
    }

    return null;
  } catch (error) {
    console.error('Exception fetching tour operator premium subscription:', error);
    return null;
  }
}

/**
 * Check if a tour has premium operator status
 */
export async function isTourOperatorPremium(productId) {
  const subscription = await getTourOperatorPremiumSubscription(productId);
  return !!subscription;
}

/**
 * Get all premium tour product IDs for an operator
 * Returns up to 5 tours from the same operator bundle
 */
export async function getOperatorPremiumTourIds(productId) {
  if (!productId) return [];
  
  try {
    const supabase = createSupabaseServerClientForTourOperatorPremiumReads();
    const key = normalizeProductIdKey(productId);

    const verifiedSub = await findActiveSubscriptionByVerifiedTourId(supabase, productId);
    if (verifiedSub?.id && Array.isArray(verifiedSub.verified_tour_ids)) {
      const { data: operatorTours, error } = await supabase
        .from('operator_tours')
        .select('product_id, tour_title, tour_image_url, review_count, rating, toptours_url')
        .eq('operator_subscription_id', verifiedSub.id)
        .eq('is_selected', true)
        .eq('is_active', true)
        .order('review_count', { ascending: false });

      if (error) {
        console.error('Error fetching operator premium tour IDs:', error);
      }

      const byPid = new Map(
        (operatorTours || []).map((t) => [normalizeProductIdKey(t.product_id), t])
      );

      const siblings = verifiedSub.verified_tour_ids
        .filter((id) => normalizeProductIdKey(id) !== key)
        .slice(0, 5);

      return siblings.map((pid) => {
        const t = byPid.get(normalizeProductIdKey(pid));
        if (t) {
          return {
            productId: t.product_id,
            title: t.tour_title,
            imageUrl: t.tour_image_url,
            reviewCount: t.review_count,
            rating: t.rating,
            url: operatorTourInternalUrl(t.product_id, t.tour_title, t.toptours_url),
          };
        }
        return {
          productId: pid,
          title: null,
          imageUrl: null,
          reviewCount: 0,
          rating: 0,
          url: `/tours/${pid}`,
        };
      });
    }

    const subId = await getActiveOperatorSubscriptionIdForProduct(supabase, productId);
    if (!subId) return [];

    const { data: operatorTours, error } = await supabase
      .from('operator_tours')
      .select('product_id, tour_title, tour_image_url, review_count, rating, toptours_url')
      .eq('operator_subscription_id', subId)
      .eq('is_selected', true)
      .eq('is_active', true)
      .order('review_count', { ascending: false });

    if (error) {
      console.error('Error fetching operator premium tour IDs:', error);
      return [];
    }

    return (operatorTours || [])
      .filter((tour) => normalizeProductIdKey(tour.product_id) !== key)
      .slice(0, 5)
      .map((tour) => ({
        productId: tour.product_id,
        title: tour.tour_title,
        imageUrl: tour.tour_image_url,
        reviewCount: tour.review_count,
        rating: tour.rating,
        url: operatorTourInternalUrl(tour.product_id, tour.tour_title, tour.toptours_url),
      }));
  } catch (error) {
    console.error('Exception fetching operator premium tour IDs:', error);
    return [];
  }
}

/**
 * Get all premium tour product IDs for a destination (batch query)
 * Returns an array of product IDs that have premium operator status
 * Used for displaying crown icons on tour cards
 * Note: Since we don't have destination_id in operator_tours, we return all premium tour IDs
 * The client can filter by checking if a tour is in the premium list
 */
/** @param {string} [_destinationId] Reserved for future destination-scoped filtering; currently unused. */
export async function getPremiumOperatorTourIdsForDestination(_destinationId) {
  try {
    const supabase = createSupabaseServerClientForTourOperatorPremiumReads();
    
    // Active subscriptions: need ids + verified_tour_ids for fallback when operator_tours is empty
    const { data: activeSubscriptions, error: subsError } = await supabase
      .from('tour_operator_subscriptions')
      .select('id, verified_tour_ids')
      .eq('status', 'active');
    
    if (subsError) {
      console.error('Error fetching active operator subscriptions:', subsError);
      return [];
    }
    
    if (!activeSubscriptions || activeSubscriptions.length === 0) {
      return [];
    }
    
    const subscriptionIds = activeSubscriptions.map((sub) => sub.id);
    
    const { data: operatorTours, error } = await supabase
      .from('operator_tours')
      .select('product_id')
      .in('operator_subscription_id', subscriptionIds)
      .eq('is_selected', true)
      .eq('is_active', true);
    
    if (error) {
      console.error('Error fetching premium operator tour IDs:', error);
      return [];
    }

    const fromOperatorTours = (operatorTours || []).map((t) => t.product_id);
    const fromVerified = activeSubscriptions.flatMap((s) =>
      Array.isArray(s.verified_tour_ids) ? s.verified_tour_ids : []
    );

    // Union: listing badges work even if operator_tours insert failed but subscription lists IDs
    return [...new Set([...fromOperatorTours, ...fromVerified])];
  } catch (error) {
    console.error('Exception fetching premium operator tour IDs:', error);
    return [];
  }
}

/**
 * Get aggregated stats for an operator
 */
export async function getOperatorAggregatedStats(operatorSubscriptionId) {
  if (!operatorSubscriptionId) return null;
  
  try {
    const supabase = createSupabaseServerClientForTourOperatorPremiumReads();
    
    const { data, error } = await supabase
      .from('tour_operator_subscriptions')
      .select('total_reviews, average_rating, total_tours_count, operator_name')
      .eq('id', operatorSubscriptionId)
      .eq('status', 'active')
      .single();
    
    if (error) {
      if (error.code !== 'PGRST116') {
        console.error('Error fetching operator aggregated stats:', error);
      }
      return null;
    }
    
    return data;
  } catch (error) {
    console.error('Exception fetching operator aggregated stats:', error);
    return null;
  }
}

