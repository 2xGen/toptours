/**
 * Operator-wide review stats from live Viator product JSON (same fields as Guest Ratings / hero).
 * Falls back to DB snapshot on tour_operator_subscriptions when Viator data is unavailable.
 */
import { fetchViatorProductJson } from '@/lib/viatorProductFetch';
import { getOperatorAggregatedStats } from '@/lib/tourOperatorPremiumServer';

function ratingAndCountFromTour(t) {
  if (!t) return { rating: 0, count: 0 };
  const rating = Number(t.reviews?.combinedAverageRating ?? t.reviews?.averageRating ?? 0);
  const count = Number(t.reviews?.totalReviews ?? t.reviews?.totalCount ?? 0);
  return { rating, count };
}

/**
 * @param {string[]} productIds
 * @param {string} [operatorName]
 * @param {string} [currentProductId] Reuse this page's tour JSON (avoids duplicate fetch)
 * @param {object} [currentTourJson]
 */
export async function computeOperatorAggregatedStatsFromViator(
  productIds,
  operatorName,
  currentProductId,
  currentTourJson
) {
  const ids = [...new Set((productIds || []).map(String).filter(Boolean))];
  if (ids.length === 0) return null;

  const tours = await Promise.all(
    ids.map((id) =>
      currentProductId && String(currentProductId) === String(id) && currentTourJson
        ? Promise.resolve(currentTourJson)
        : fetchViatorProductJson(id)
    )
  );

  let totalReviews = 0;
  let weightedSum = 0;
  let gotAny = false;

  for (const tour of tours) {
    const { rating, count } = ratingAndCountFromTour(tour);
    if (count > 0 && rating > 0) {
      weightedSum += rating * count;
      totalReviews += count;
      gotAny = true;
    }
  }

  if (!gotAny) return null;

  return {
    total_reviews: totalReviews,
    average_rating: Math.round((weightedSum / totalReviews) * 100) / 100,
    total_tours_count: ids.length,
    operator_name: operatorName || null,
  };
}

/**
 * Prefer Viator-weighted stats (matches Guest Ratings). Falls back to DB aggregates.
 */
export async function resolveOperatorAggregatedStatsForDisplay(operatorPremiumData, currentProductId, currentTourJson) {
  if (!operatorPremiumData?.id) return null;

  const verified = operatorPremiumData.verified_tour_ids;
  if (Array.isArray(verified) && verified.length > 0) {
    const vi = await computeOperatorAggregatedStatsFromViator(
      verified,
      operatorPremiumData.operator_name,
      currentProductId,
      currentTourJson
    );
    if (vi) return vi;
  }

  return getOperatorAggregatedStats(operatorPremiumData.id);
}
