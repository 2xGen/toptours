/**
 * Enhanced Meta Description Generator
 *
 * Intent-focused, action-driven meta descriptions. Operator is kept on-page and in schema, not in meta.
 * - Book {Tour} in {City}. Rated X★ by Y travelers. See prices, duration, photos & availability. Trust signal.
 * - Rating block only when rating >= 4.5 and reviews > 0.
 * - Trust: Instant confirmation, else Free cancellation, else omit.
 */

/**
 * Format number for display (e.g., 1234 -> "1.2K" or "1,234")
 */
function formatNumber(num) {
  if (!num || num === 0) return null;
  if (num >= 1000) {
    const thousands = (num / 1000).toFixed(1);
    // Remove .0 if whole number
    return thousands.endsWith('.0') ? `${thousands.slice(0, -2)}K` : `${thousands}K`;
  }
  return num.toLocaleString('en-US');
}

/**
 * Extract destination name from tour or destination data
 */
function extractDestinationName(tour, destinationData) {
  if (destinationData?.destinationName) {
    return destinationData.destinationName;
  }
  
  if (Array.isArray(tour.destinations) && tour.destinations.length > 0) {
    const primary = tour.destinations.find(d => d.primary) || tour.destinations[0];
    return primary.destinationName || primary.name || '';
  }
  
  return tour.destinationName || '';
}

/**
 * Extract operator/supplier name
 */
function extractOperatorName(tour) {
  return tour.supplier?.name ||
         tour.supplierName ||
         tour.operator?.name ||
         tour.vendor?.name ||
         tour.partner?.name ||
         '';
}

/**
 * Extract pricing from tour
 */
function extractPricing(tour) {
  // Try multiple locations for pricing
  return tour.pricing?.summary?.fromPrice ||
         tour.pricing?.fromPrice ||
         tour.priceFrom ||
         tour.price?.from ||
         null;
}

/**
 * Build enhanced meta description for SEO
 * Template: Book {Tour} in {City}. Rated X★ by Y travelers. See prices, duration, photos & availability. Trust signal.
 * No operator in meta. Rating only when >= 4.5 and reviews > 0. Trust: Instant confirmation else Free cancellation.
 */
export function buildEnhancedMetaDescription(tour, destinationData = null, enrichment = null) {
  const tourTitle = tour.title || 'Tour';
  const destinationName = extractDestinationName(tour, destinationData);
  const rating = tour.reviews?.combinedAverageRating || tour.reviews?.averageRating || null;
  const reviewCount = tour.reviews?.totalReviews || tour.reviews?.totalCount || 0;
  const hasFreeCancellation = tour.cancellationPolicy?.freeCancellation || false;
  const hasInstantConfirmation = tour.bookingConfirmationSettings?.confirmationType === 'INSTANT' ||
                                  tour.instantConfirmation || false;

  const opener = destinationName
    ? `Book ${tourTitle} in ${destinationName}.`
    : `Book ${tourTitle}.`;

  const showRating = rating != null && rating >= 4.5 && reviewCount > 0;
  const ratingSentence = showRating
    ? ` Rated ${rating.toFixed(1)}★ by ${reviewCount.toLocaleString('en-US')} travelers.`
    : '';

  const actionSentence = ' See prices, duration, photos & availability.';
  const trustPhrase = hasInstantConfirmation
    ? ' Instant confirmation.'
    : hasFreeCancellation
      ? ' Free cancellation.'
      : '';

  let description = opener + ratingSentence + actionSentence + trustPhrase;
  if (description.length > 160) {
    if (showRating && (opener + ratingSentence).length > 100) {
      description = opener + actionSentence + trustPhrase;
    }
    if (description.length > 160) {
      description = opener + ' See prices & availability.' + trustPhrase;
    }
  }
  return description.slice(0, 160).trim();
}

/**
 * Build enhanced title for SEO
 * Intent-focused: no operator, no brand suffix. Commercial modifiers for CTR.
 * Template: {Tour} in {City} | Reviews, Price & Booking (or with rating when >= 4.5).
 */
const TITLE_SUFFIX = ' | Reviews, Price & Booking';
const TITLE_SUFFIX_WITH_RATING = '★ Reviews & Instant Booking';

export function buildEnhancedTitle(tour, destinationData = null, enrichment = null) {
  const tourTitle = tour.title || 'Tour';
  const destinationName = extractDestinationName(tour, destinationData);
  const rating = tour.reviews?.combinedAverageRating || tour.reviews?.averageRating || null;
  const hasHighRating = rating != null && rating >= 4.5;
  const maxLen = 65;

  const base = destinationName ? `${tourTitle} in ${destinationName}` : tourTitle;
  const withSuffix = hasHighRating
    ? `${base} | ${rating.toFixed(1)}${TITLE_SUFFIX_WITH_RATING}`
    : `${base}${TITLE_SUFFIX}`;

  if (withSuffix.length <= maxLen) return withSuffix;
  if (base.length + TITLE_SUFFIX.length <= maxLen) return base + TITLE_SUFFIX;
  const trimBase = base.slice(0, maxLen - TITLE_SUFFIX.length - 1).trim();
  return (trimBase.endsWith(',') ? trimBase.slice(0, -1) : trimBase) + TITLE_SUFFIX;
}
