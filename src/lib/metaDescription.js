/**
 * Enhanced Meta Description Generator
 *
 * Operator/supplier name is included in title + meta for brand-intent searches
 * (e.g. "Viator tour operator name + destination").
 */

function formatNumber(num) {
  if (!num || num === 0) return null;
  if (num >= 1000) {
    const thousands = (num / 1000).toFixed(1);
    return thousands.endsWith('.0') ? `${thousands.slice(0, -2)}K` : `${thousands}K`;
  }
  return num.toLocaleString('en-US');
}

function extractDestinationName(tour, destinationData) {
  if (destinationData?.destinationName) {
    return destinationData.destinationName;
  }

  if (Array.isArray(tour.destinations) && tour.destinations.length > 0) {
    const primary = tour.destinations.find((d) => d.primary) || tour.destinations[0];
    return primary.destinationName || primary.name || '';
  }

  return tour.destinationName || '';
}

function extractOperatorName(tour) {
  return (
    tour.supplier?.name ||
    tour.supplierName ||
    tour.operator?.name ||
    tour.vendor?.name ||
    tour.partner?.name ||
    ''
  );
}

function extractPricing(tour) {
  return (
    tour.pricing?.summary?.fromPrice ||
    tour.pricing?.fromPrice ||
    tour.priceFrom ||
    tour.price?.from ||
    null
  );
}

const TITLE_SUFFIX = ' | Reviews, Price & Booking';
const TITLE_SUFFIX_WITH_RATING = '★ Reviews & Instant Booking';

/**
 * Build enhanced meta description for SEO.
 * Includes operator name when available for supplier/brand searches.
 */
export function buildEnhancedMetaDescription(tour, destinationData = null, enrichment = null) {
  const tourTitle = tour.title || 'Tour';
  const destinationName = extractDestinationName(tour, destinationData);
  const operatorName = extractOperatorName(tour);
  const rating = tour.reviews?.combinedAverageRating || tour.reviews?.averageRating || null;
  const reviewCount = tour.reviews?.totalReviews || tour.reviews?.totalCount || 0;
  const hasFreeCancellation = tour.cancellationPolicy?.freeCancellation || false;
  const hasInstantConfirmation =
    tour.bookingConfirmationSettings?.confirmationType === 'INSTANT' || tour.instantConfirmation || false;

  let opener;
  if (destinationName && operatorName) {
    opener = `Book ${tourTitle} in ${destinationName} by ${operatorName}.`;
  } else if (destinationName) {
    opener = `Book ${tourTitle} in ${destinationName}.`;
  } else if (operatorName) {
    opener = `Book ${tourTitle} by ${operatorName}.`;
  } else {
    opener = `Book ${tourTitle}.`;
  }

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
    if (operatorName && opener.includes(` by ${operatorName}`)) {
      const withoutOperator = destinationName
        ? `Book ${tourTitle} in ${destinationName}.`
        : `Book ${tourTitle}.`;
      description = withoutOperator + ratingSentence + actionSentence + trustPhrase;
    }
    if (description.length > 160 && showRating) {
      description = opener + actionSentence + trustPhrase;
    }
    if (description.length > 160) {
      description = opener + ' See prices & availability.' + trustPhrase;
    }
  }
  return description.slice(0, 160).trim();
}

/**
 * Build enhanced title for SEO.
 * Template: {Tour} in {City} by {Operator} | Reviews, Price & Booking
 */
export function buildEnhancedTitle(tour, destinationData = null, enrichment = null) {
  const tourTitle = tour.title || 'Tour';
  const destinationName = extractDestinationName(tour, destinationData);
  const operatorName = extractOperatorName(tour);
  const rating = tour.reviews?.combinedAverageRating || tour.reviews?.averageRating || null;
  const hasHighRating = rating != null && rating >= 4.5;
  const maxLen = 65;

  let base;
  if (destinationName && operatorName) {
    base = `${tourTitle} in ${destinationName} by ${operatorName}`;
  } else if (destinationName) {
    base = `${tourTitle} in ${destinationName}`;
  } else if (operatorName) {
    base = `${tourTitle} by ${operatorName}`;
  } else {
    base = tourTitle;
  }

  const withSuffix = hasHighRating
    ? `${base} | ${rating.toFixed(1)}${TITLE_SUFFIX_WITH_RATING}`
    : `${base}${TITLE_SUFFIX}`;

  if (withSuffix.length <= maxLen) return withSuffix;

  const suffix = hasHighRating
    ? ` | ${rating.toFixed(1)}${TITLE_SUFFIX_WITH_RATING}`
    : TITLE_SUFFIX;
  if (base.length + suffix.length <= maxLen) return base + suffix;

  const trimBase = base.slice(0, maxLen - suffix.length - 1).trim();
  const cleaned = trimBase.endsWith(',') ? trimBase.slice(0, -1) : trimBase;
  return cleaned + suffix;
}

export { formatNumber, extractDestinationName, extractOperatorName, extractPricing };
