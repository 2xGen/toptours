/**
 * Enhanced Meta Description Generator
 * 
 * Creates SEO-optimized meta descriptions with:
 * - Tour name + destination (highest priority)
 * - Operator name (for brand searches)
 * - Rating + review count (social proof)
 * - Pricing (if competitive)
 * - Trust signals (free cancellation, instant confirmation)
 * 
 * Format: "[Tour Name] in [Destination] by [Operator] • 4.8★ • 1,234+ reviews • From $89 • Free cancellation"
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
 * 
 * Priority order:
 * 1. Tour name + destination (highest SEO value)
 * 2. Operator name (for brand searches)
 * 3. Rating (if high - 4.5+)
 * 4. Review count (if significant - 100+)
 * 5. Pricing (if competitive - under $200)
 * 6. Trust signals (free cancellation, instant confirmation)
 * 7. Value prop from enrichment (if available)
 */
export function buildEnhancedMetaDescription(tour, destinationData = null, enrichment = null) {
  const parts = [];
  
  // Extract key data
  const tourTitle = tour.title || 'Tour';
  const destinationName = extractDestinationName(tour, destinationData);
  const operatorName = extractOperatorName(tour);
  const rating = tour.reviews?.combinedAverageRating || tour.reviews?.averageRating || null;
  const reviewCount = tour.reviews?.totalReviews || tour.reviews?.totalCount || 0;
  const pricing = extractPricing(tour);
  const hasFreeCancellation = tour.cancellationPolicy?.freeCancellation || false;
  const hasInstantConfirmation = tour.bookingConfirmationSettings?.confirmationType === 'INSTANT' ||
                                  tour.instantConfirmation || false;
  
  // 1. Tour name + destination (ALWAYS include - highest SEO value)
  if (destinationName) {
    parts.push(`${tourTitle} in ${destinationName}`);
  } else {
    parts.push(tourTitle);
  }
  
  // 2. Operator name (if available - for brand searches)
  if (operatorName) {
    parts.push(`by ${operatorName}`);
  }
  
  // 3. Rating (if high - 4.5+)
  if (rating && rating >= 4.5) {
    parts.push(`${rating.toFixed(1)}★`);
  }
  
  // 4. Review count (if significant - 100+)
  if (reviewCount >= 100) {
    const formattedCount = formatNumber(reviewCount);
    if (formattedCount) {
      parts.push(`${formattedCount}+ reviews`);
    }
  }
  
  // 5. Pricing (if competitive - under $200, or always show if available)
  if (pricing) {
    const priceNum = typeof pricing === 'number' ? pricing : parseFloat(pricing);
    if (!isNaN(priceNum)) {
      // Show pricing if under $200, or if no other trust signals
      if (priceNum < 200 || (!hasFreeCancellation && !hasInstantConfirmation)) {
        parts.push(`From $${Math.round(priceNum)}`);
      }
    }
  }
  
  // 6. Trust signals (free cancellation, instant confirmation)
  if (hasFreeCancellation) {
    parts.push('Free cancellation');
  } else if (hasInstantConfirmation) {
    parts.push('Instant confirmation');
  }
  
  // 7. Value prop from enrichment (if available and space allows)
  if (enrichment?.ai_summary) {
    const summary = enrichment.ai_summary.trim();
    // Only add if we have space and it's meaningful
    if (summary.length > 0 && summary.length < 80) {
      // Check current length
      const currentLength = parts.join(' • ').length;
      const remainingSpace = 160 - currentLength - 3; // -3 for " • "
      if (remainingSpace > summary.length + 10) {
        parts.push(summary);
      }
    }
  }
  
  // Join parts and limit to 160 characters
  let description = parts.join(' • ');
  
  // If still too long, prioritize and trim
  if (description.length > 160) {
    // Priority order: Tour name + destination > Operator > Rating > Reviews > Pricing > Trust > Value prop
    const priorityParts = [];
    
    // Always keep tour name + destination
    if (destinationName) {
      priorityParts.push(`${tourTitle} in ${destinationName}`);
    } else {
      priorityParts.push(tourTitle);
    }
    
    // Add operator if space allows
    if (operatorName) {
      const withOperator = `${priorityParts[0]} by ${operatorName}`;
      if (withOperator.length <= 100) {
        priorityParts[0] = withOperator;
      }
    }
    
    // Add rating if space allows
    if (rating && rating >= 4.5) {
      const withRating = `${priorityParts[0]} • ${rating.toFixed(1)}★`;
      if (withRating.length <= 120) {
        priorityParts[0] = withRating;
      }
    }
    
    // Add review count if space allows
    if (reviewCount >= 100) {
      const formattedCount = formatNumber(reviewCount);
      if (formattedCount) {
        const withReviews = `${priorityParts[0]} • ${formattedCount}+ reviews`;
        if (withReviews.length <= 140) {
          priorityParts[0] = withReviews;
        }
      }
    }
    
    // Add pricing if space allows
    if (pricing) {
      const priceNum = typeof pricing === 'number' ? pricing : parseFloat(pricing);
      if (!isNaN(priceNum) && priceNum < 200) {
        const withPricing = `${priorityParts[0]} • From $${Math.round(priceNum)}`;
        if (withPricing.length <= 155) {
          priorityParts[0] = withPricing;
        }
      }
    }
    
    // Add trust signal if space allows
    if (hasFreeCancellation) {
      const withTrust = `${priorityParts[0]} • Free cancellation`;
      if (withTrust.length <= 160) {
        priorityParts[0] = withTrust;
      }
    }
    
    description = priorityParts[0];
  }
  
  // Final trim to 160 characters
  return description.slice(0, 160).trim();
}

/**
 * Build enhanced title for SEO
 * 
 * Format: "[Tour Name] by [Operator]" or "[Tour Name] in [Destination] by [Operator]"
 * NO brand name - better for SEO rankings and keyword optimization
 * Includes operator name to differentiate from competitors and rank for operator searches
 */
export function buildEnhancedTitle(tour, destinationData = null, enrichment = null) {
  const tourTitle = tour.title || 'Tour';
  const destinationName = extractDestinationName(tour, destinationData);
  const operatorName = extractOperatorName(tour);
  
  // Priority 1: Tour name + destination + operator (best for SEO - differentiates from competitors)
  if (destinationName && operatorName) {
    const title = `${tourTitle} in ${destinationName} by ${operatorName}`;
    // Allow up to 65 chars (slightly over 60 is fine, Google will show it)
    if (title.length <= 65) {
      return title; // NO brand name
    }
    // If too long, try without destination
    const titleWithoutDest = `${tourTitle} by ${operatorName}`;
    if (titleWithoutDest.length <= 65) {
      return titleWithoutDest;
    }
  }
  
  // Priority 2: Tour name + operator (if operator available, no destination)
  if (operatorName) {
    const title = `${tourTitle} by ${operatorName}`;
    if (title.length <= 65) {
      return title; // NO brand name
    }
    // If still too long, trim operator name intelligently
    const maxTourLength = 50;
    if (tourTitle.length <= maxTourLength) {
      const remainingSpace = 65 - tourTitle.length - 6; // -6 for " by "
      if (remainingSpace > 10) {
        const trimmedOperator = operatorName.substring(0, remainingSpace).trim();
        return `${tourTitle} by ${trimmedOperator}`;
      }
    }
  }
  
  // Priority 3: Tour name + destination (if destination available, no operator)
  if (destinationName) {
    const title = `${tourTitle} in ${destinationName}`;
    if (title.length <= 65) {
      return title; // NO brand name
    }
  }
  
  // Fallback: Just tour name (trim if too long)
  if (tourTitle.length > 65) {
    return tourTitle.substring(0, 62) + '...';
  }
  return tourTitle; // NO brand name
}
