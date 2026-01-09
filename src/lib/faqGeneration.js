/**
 * FAQ Generation System for Tours
 * 
 * Generates unique, SEO-optimized FAQs by combining:
 * - Viator API tour data
 * - Destination information
 * - Tag characteristics from viator_tag_traits
 * - Tour operator/supplier name
 * 
 * Questions are personalized with tour name, destination, and operator
 * to ensure uniqueness and SEO value.
 */

import { createSupabaseServiceRoleClient } from './supabaseClient.js';

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
 * Format duration from Viator API response
 * Handles both fixed and variable durations
 */
function formatDuration(tour) {
  // Check for variable duration first (fromMinutes to toMinutes)
  if (tour.itinerary?.duration?.variableDurationFromMinutes && 
      tour.itinerary?.duration?.variableDurationToMinutes) {
    const fromMinutes = tour.itinerary.duration.variableDurationFromMinutes;
    const toMinutes = tour.itinerary.duration.variableDurationToMinutes;
    
    const fromHours = Math.round((fromMinutes / 60) * 10) / 10;
    const toHours = Math.round((toMinutes / 60) * 10) / 10;
    
    if (fromHours === toHours) {
      // Same duration, format as fixed
      if (fromHours === 1) return '1 hour';
      if (fromHours % 1 === 0) return `${fromHours} hours`;
      return `${fromHours} hours`;
    }
    
    // Variable duration range
    const fromStr = fromHours === 1 ? '1 hour' : (fromHours % 1 === 0 ? `${fromHours} hours` : `${fromHours} hours`);
    const toStr = toHours === 1 ? '1 hour' : (toHours % 1 === 0 ? `${toHours} hours` : `${toHours} hours`);
    return `${fromStr} to ${toStr}`;
  }
  
  // Fixed duration
  const duration = tour.itinerary?.duration?.fixedDurationInMinutes ||
                   tour.duration?.fixedDurationInMinutes ||
                   tour.duration?.variableDurationFromMinutes ||
                   (typeof tour.duration === 'number' ? tour.duration : null);
  
  if (!duration) return null;
  
  if (duration < 60) {
    return `${duration} minutes`;
  }
  
  const hours = Math.round((duration / 60) * 10) / 10;
  if (hours === 1) return '1 hour';
  if (hours % 1 === 0) return `${hours} hours`;
  return `${hours} hours`;
}

/**
 * Extract destination name from tour
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
 * Extract top inclusions (for FAQ answers)
 */
function extractTopInclusions(tour, limit = 3) {
  if (!Array.isArray(tour.inclusions)) return [];
  
  return tour.inclusions
    .map(item => {
      if (typeof item === 'string') return item;
      if (item.category === 'OTHER' && item.otherDescription) {
        return item.otherDescription;
      }
      return item.description || item.otherDescription || item.typeDescription || '';
    })
    .filter(Boolean)
    .slice(0, limit);
}

/**
 * Get tag characteristics from database
 */
async function getTagCharacteristics(tagIds) {
  if (!tagIds || tagIds.length === 0) return new Map();
  
  const supabase = createSupabaseServiceRoleClient();
  const tagMap = new Map();
  
  // Batch fetch tags (1000 at a time)
  const batchSize = 1000;
  for (let i = 0; i < tagIds.length; i += batchSize) {
    const batch = tagIds.slice(i, i + batchSize);
    const { data, error } = await supabase
      .from('viator_tag_traits')
      .select('*')
      .in('tag_id', batch);
    
    if (error) {
      console.error('Error fetching tag traits:', error);
      continue;
    }
    
    (data || []).forEach(trait => {
      tagMap.set(trait.tag_id, trait);
    });
  }
  
  return tagMap;
}

/**
 * Determine if tour is family-friendly based on tags
 */
function isFamilyFriendly(tagTraits) {
  for (const trait of tagTraits.values()) {
    if (trait.tag_name_en?.toLowerCase().includes('family')) {
      return true;
    }
  }
  return false;
}

/**
 * Determine if tour is private based on logistics
 */
function isPrivateTour(tour) {
  return tour.logistics?.groupType === 'PRIVATE' ||
         tour.logistics?.groupSize?.max === 1 ||
         tour.logistics?.groupSize?.max === 2;
}

/**
 * Extract cancellation deadline from policy
 * Checks both description and refundEligibility array
 */
function extractCancellationDeadline(cancellationPolicy) {
  if (!cancellationPolicy) return null;
  
  // First check refundEligibility array for 100% refund options
  if (cancellationPolicy.refundEligibility && Array.isArray(cancellationPolicy.refundEligibility)) {
    const fullRefund = cancellationPolicy.refundEligibility.find(r => r.percentageRefundable === 100);
    if (fullRefund) {
      const days = fullRefund.dayRangeMin;
      if (days !== undefined && days !== null) {
        if (days === 0) return null; // Same day cancellation
        if (days === 1) return '24 hours';
        return `${days} days`;
      }
    }
  }
  
  // Try to extract hours/days from description
  const desc = cancellationPolicy.description || '';
  const hourMatch = desc.match(/(\d+)\s*hours?/i);
  const dayMatch = desc.match(/(\d+)\s*days?/i);
  
  if (hourMatch) {
    const hours = parseInt(hourMatch[1]);
    if (hours === 24) return '24 hours';
    return `${hours} hours`;
  }
  
  if (dayMatch) {
    const days = parseInt(dayMatch[1]);
    return `${days} day${days !== 1 ? 's' : ''}`;
  }
  
  return null;
}

/**
 * Generate category name from tags or tour data
 */
function extractCategory(tour, tagTraits) {
  // Try to get category from tags
  for (const trait of tagTraits.values()) {
    const tagName = trait.tag_name_en?.toLowerCase() || '';
    // Common categories
    if (tagName.includes('food') || tagName.includes('culinary')) return 'Food & Drink';
    if (tagName.includes('water') || tagName.includes('snorkel') || tagName.includes('dive')) return 'Water Sports';
    if (tagName.includes('adventure') || tagName.includes('hiking')) return 'Adventure';
    if (tagName.includes('cultural') || tagName.includes('heritage')) return 'Cultural';
    if (tagName.includes('sightseeing') || tagName.includes('city')) return 'Sightseeing';
  }
  
  // Fallback to tour category if available
  return tour.category || tour.productType || '';
}

/**
 * Main FAQ generation function
 */
export async function generateTourFAQs(tour, destinationData = null, productId = null) {
  const faqs = [];
  
  // Extract key data
  const tourTitle = tour.title || 'this tour';
  const destinationName = extractDestinationName(tour, destinationData);
  const operatorName = extractOperatorName(tour);
  const duration = formatDuration(tour);
  const topInclusions = extractTopInclusions(tour, 3);
  const category = extractCategory(tour, new Map()); // Will be enhanced with tags
  
  // Get tag characteristics if tags are available
  let tagTraits = new Map();
  if (tour.tags && Array.isArray(tour.tags) && tour.tags.length > 0) {
    const tagIds = tour.tags
      .map(t => typeof t === 'object' ? (t.tagId || t.id || t.tag_id) : t)
      .filter(Boolean);
    
    if (tagIds.length > 0) {
      tagTraits = await getTagCharacteristics(tagIds);
    }
  }
  
  // Update category with tag data
  const enhancedCategory = extractCategory(tour, tagTraits) || category;
  const familyFriendly = isFamilyFriendly(tagTraits);
  const isPrivate = isPrivateTour(tour);
  
  // Extract cancellation policy info for use across multiple FAQs
  const hasBadWeatherCancellation = tour.cancellationPolicy?.cancelIfBadWeather || false;
  let badWeatherMentionedInCancellation = false;
  
  // FAQ 1: Who operates this tour? (Only if operator available)
  if (operatorName) {
    const categoryContext = enhancedCategory ? `, a local ${enhancedCategory.toLowerCase()} provider` : '';
    const locationContext = destinationName ? ` in ${destinationName}` : '';
    faqs.push({
      question: `Who operates this experience?`,
      answer: `This experience is operated by ${operatorName}${categoryContext}${locationContext}.`
    });
  }
  
  // FAQ 2: What's Included
  if (topInclusions.length > 0) {
    const inclusionList = topInclusions.length === 1 
      ? topInclusions[0]
      : topInclusions.length === 2
      ? `${topInclusions[0]} and ${topInclusions[1]}`
      : `${topInclusions.slice(0, -1).join(', ')}, and ${topInclusions[topInclusions.length - 1]}`;
    
    const additionalNote = tour.inclusions && tour.inclusions.length > topInclusions.length 
      ? ' Additional amenities and services are included.' 
      : '';
    
    faqs.push({
      question: `What's included?`,
      answer: `This tour includes ${inclusionList}.${additionalNote} All inclusions are provided by the tour operator.`
    });
  }
  
  // FAQ 3: Duration (with alternative question format for better search coverage)
  if (duration) {
    // Use alternative format for better search query matching
    // Deterministic based on productId to ensure consistency
    const useAlternative = productId ? (parseInt(productId.replace(/\D/g, '')) % 2 === 0) : false;
    const durationQuestion = useAlternative
      ? `How long does this experience take?`
      : `How long is this tour?`;
    
    faqs.push({
      question: durationQuestion,
      answer: `The experience lasts approximately ${duration}, giving you time to fully enjoy your chosen activity.`
    });
  }
  
  // FAQ 4: Cancellation Policy (High SEO value - "Can I cancel [Tour Name]?")
  if (tour.cancellationPolicy) {
    const policy = tour.cancellationPolicy;
    const canCancel = policy.freeCancellation || false;
    const deadline = extractCancellationDeadline(policy);
    const hasRefundEligibility = policy.refundEligibility && Array.isArray(policy.refundEligibility) && policy.refundEligibility.length > 0;
    const policyDescription = policy.description || '';
    
    // Build cancellation answer - concise and factual
    let cancellationAnswer = '';
    
    // Priority 1: Check if deadline was extracted (from description or refundEligibility)
    if (deadline) {
      cancellationAnswer = `Yes, you can cancel up to ${deadline} before the scheduled departure time for a full refund.`;
    }
    // Priority 2: Check refundEligibility array for 100% refund
    else if (hasRefundEligibility) {
      const fullRefund = policy.refundEligibility.find(r => r.percentageRefundable === 100);
      if (fullRefund) {
        const days = fullRefund.dayRangeMin;
        if (days !== undefined && days !== null) {
          if (days === 1) {
            cancellationAnswer = `Yes, you can cancel up to 24 hours before the scheduled departure time for a full refund.`;
          } else if (days > 1) {
            cancellationAnswer = `Yes, you can cancel up to ${days} days before the scheduled departure time for a full refund.`;
          } else if (days === 0) {
            cancellationAnswer = `Yes, you can cancel for a full refund.`;
          }
        }
      }
    }
    // Priority 3: Check if freeCancellation flag is true
    else if (canCancel) {
      cancellationAnswer = `Yes, you can cancel free of charge${deadline ? ` up to ${deadline} before` : ''}.`;
    }
    // Priority 4: Use policy description if available (simplified)
    else if (policyDescription && policyDescription.length > 20) {
      // Extract just the key info from description
      const simplifiedDesc = policyDescription.length > 100 
        ? policyDescription.substring(0, 100) + '...'
        : policyDescription;
      cancellationAnswer = `Cancellation policies depend on the selected date and option. ${simplifiedDesc}`;
    }
    // Priority 5: Generic fallback
    else {
      cancellationAnswer = `Cancellation policies depend on the selected date and option. Please review the full cancellation terms during booking.`;
    }
    
    // Add bad weather cancellation if applicable (concise)
    if (hasBadWeatherCancellation) {
      cancellationAnswer += ` If weather conditions are unsafe, the tour may be canceled by the operator. In such cases, you'll be offered a refund or reschedule.`;
      badWeatherMentionedInCancellation = true;
    }
    
    faqs.push({
      question: `Can I cancel this tour?`,
      answer: cancellationAnswer
    });
  }
  
  // FAQ 5: Meeting Point
  if (tour.logistics?.meetingPoint && Array.isArray(tour.logistics.meetingPoint) && tour.logistics.meetingPoint.length > 0) {
    const firstPoint = tour.logistics.meetingPoint[0];
    const meetingDescription = firstPoint.description || firstPoint.address || '';
    
    if (meetingDescription && meetingDescription.length > 20) {
      faqs.push({
        question: `Where does this tour start?`,
        answer: `The meeting point is ${meetingDescription}. Exact location details will be confirmed upon booking.`
      });
    }
  }
  
  // FAQ 6: Private vs Group
  if (tour.logistics?.groupType) {
    faqs.push({
      question: `Is this a private or group tour?`,
      answer: isPrivate
        ? `This is a private tour, meaning it's exclusively for you and your party.`
        : `This is a group tour where you'll join other travelers.`
    });
  }
  
  // FAQ 7: Family-Friendly
  if (familyFriendly || tour.logistics?.isFamilyFriendly) {
    faqs.push({
      question: `Is this tour good for families?`,
      answer: `Yes, this experience is family-friendly and suitable for travelers of all ages.`
    });
  }
  
  // FAQ 8: What to Bring (Category-based, concise)
  if (enhancedCategory) {
    const categoryLower = enhancedCategory.toLowerCase();
    let whatToBring = '';
    
    if (categoryLower.includes('water') || categoryLower.includes('snorkel') || categoryLower.includes('dive')) {
      whatToBring = `We recommend bringing a swimsuit, towel, and sunscreen. All necessary equipment is provided by the tour operator.`;
    } else if (categoryLower.includes('food') || categoryLower.includes('culinary')) {
      whatToBring = `Come with an appetite and comfortable walking shoes. All food and beverages are included.`;
    } else if (categoryLower.includes('adventure') || categoryLower.includes('hiking')) {
      whatToBring = `Bring comfortable walking or hiking shoes, a water bottle, and appropriate clothing for the activity level. Safety equipment is provided as needed.`;
    } else {
      whatToBring = `We recommend bringing comfortable walking shoes, a camera, and weather-appropriate clothing. All necessary equipment is provided.`;
    }
    
    if (whatToBring) {
      faqs.push({
        question: `What should I bring?`,
        answer: whatToBring
      });
    }
  }
  
  // FAQ 9: Weather Policy (only if bad weather cancellation exists but wasn't mentioned in cancellation FAQ)
  if (hasBadWeatherCancellation && !badWeatherMentionedInCancellation) {
    faqs.push({
      question: `What happens if the weather is bad?`,
      answer: `If weather conditions are unsafe, the tour may be canceled by the operator. In such cases, you'll be offered a refund or reschedule.`
    });
  }
  
  // FAQ 10: Transportation (if included)
  const hasTransportation = tour.inclusions?.some(i => {
    const text = (typeof i === 'string' ? i : (i.description || i.otherDescription || '')).toLowerCase();
    return text.includes('pickup') || text.includes('transfer') || text.includes('transportation') || i.category === 'TRANSPORTATION';
  });
  
  if (hasTransportation) {
    faqs.push({
      question: `Is transportation included?`,
      answer: `Yes, transportation is included. Hotel pickup and drop-off are typically provided.`
    });
  }
  
  // FAQ 11: Age Restrictions (if available)
  if (tour.logistics?.ageRestrictions) {
    const ageRestrictions = tour.logistics.ageRestrictions;
    let ageAnswer = '';
    
    if (ageRestrictions.minimumAge) {
      ageAnswer = `This tour has a minimum age requirement of ${ageRestrictions.minimumAge} years old.`;
    } else if (ageRestrictions.maximumAge) {
      ageAnswer = `This tour is suitable for travelers up to ${ageRestrictions.maximumAge} years old.`;
    } else {
      ageAnswer = `This tour has specific age restrictions.`;
    }
    
    if (ageAnswer) {
      faqs.push({
        question: `Are there age restrictions?`,
        answer: `${ageAnswer} Please check the full tour details when booking.`
      });
    }
  }
  
  // FAQ 12: Instant Confirmation (if available)
  if (tour.bookingConfirmationSettings?.confirmationType === 'INSTANT' || tour.instantConfirmation) {
    faqs.push({
      question: `Will I receive instant confirmation?`,
      answer: `Yes, you'll receive instant confirmation when you book.`
    });
  }
  
  // FAQ 13: Is it worth it? (Common search query)
  const rating = tour.reviews?.combinedAverageRating || tour.reviews?.averageRating || null;
  const reviewCount = tour.reviews?.totalReviews || tour.reviews?.totalCount || 0;
  if (rating && rating >= 4.0 && reviewCount >= 50) {
    faqs.push({
      question: `Is this tour worth it?`,
      answer: `Yes, this experience has a ${rating.toFixed(1)}-star rating based on ${formatNumber(reviewCount) || reviewCount}+ reviews, making it a highly rated option${destinationName ? ` in ${destinationName}` : ''}.`
    });
  }
  
  // FAQ 14: What to expect (Common search query)
  if (topInclusions.length > 0 || tour.description?.summary) {
    const inclusionHint = topInclusions.length > 0 ? ` You'll have access to ${topInclusions[0]}${topInclusions.length > 1 ? ` and more` : ''}.` : '';
    faqs.push({
      question: `What to expect on this tour?`,
      answer: `This ${enhancedCategory ? enhancedCategory.toLowerCase() : 'tour'} experience${duration ? ` lasts approximately ${duration}` : ''} and includes all necessary equipment and guidance.${inclusionHint}`
    });
  }
  
  // FAQ 15: Best time to do (Category-based)
  if (enhancedCategory) {
    const categoryLower = enhancedCategory.toLowerCase();
    if (categoryLower.includes('water') || categoryLower.includes('snorkel') || categoryLower.includes('dive') || categoryLower.includes('boat')) {
      faqs.push({
        question: `What's the best time to do this tour?`,
        answer: `Morning and early afternoon are typically the best times for water activities, as conditions are usually calmer and visibility is better.`
      });
    } else if (categoryLower.includes('sunset') || categoryLower.includes('evening')) {
      faqs.push({
        question: `What's the best time to do this tour?`,
        answer: `This experience is designed for sunset or evening hours to provide the best views and atmosphere.`
      });
    } else if (categoryLower.includes('food') || categoryLower.includes('culinary')) {
      faqs.push({
        question: `What's the best time to do this tour?`,
        answer: `This culinary experience is typically best enjoyed during meal times, allowing you to fully appreciate the local food culture.`
      });
    }
  }
  
  // FAQ 16: Category-specific - Water activities
  if (enhancedCategory) {
    const categoryLower = enhancedCategory.toLowerCase();
    if (categoryLower.includes('water') || categoryLower.includes('snorkel') || categoryLower.includes('dive') || categoryLower.includes('swim') || categoryLower.includes('kayak') || categoryLower.includes('paddle')) {
      faqs.push({
        question: `Do I need to know how to swim?`,
        answer: `Swimming ability requirements vary. Life jackets and safety equipment are provided. Please check the tour details or contact the operator if you have concerns about swimming requirements.`
      });
    }
  }
  
  // FAQ 17: Category-specific - Food tours
  if (enhancedCategory) {
    const categoryLower = enhancedCategory.toLowerCase();
    if (categoryLower.includes('food') || categoryLower.includes('culinary') || categoryLower.includes('dining') || categoryLower.includes('cooking')) {
      faqs.push({
        question: `Are dietary restrictions accommodated?`,
        answer: `Dietary restrictions may be accommodated depending on the tour. Please inform the operator of any dietary requirements when booking so they can make appropriate arrangements.`
      });
    }
  }
  
  // FAQ 18: Category-specific - Adventure/Physical activity
  if (enhancedCategory) {
    const categoryLower = enhancedCategory.toLowerCase();
    if (categoryLower.includes('adventure') || categoryLower.includes('hiking') || categoryLower.includes('climbing') || categoryLower.includes('biking') || categoryLower.includes('atv')) {
      faqs.push({
        question: `What fitness level is required?`,
        answer: `This adventure activity requires a moderate level of physical fitness. Please review the tour details for specific requirements, or contact the operator if you have concerns about your fitness level.`
      });
    }
  }
  
  // Limit to 10-12 FAQs for optimal SEO (more FAQs = more long-tail keyword coverage)
  // But keep it reasonable to avoid overwhelming users
  return faqs.slice(0, 12);
}

/**
 * Generate FAQPage schema for SEO
 */
export function generateFAQSchema(faqs) {
  if (!faqs || faqs.length === 0) return null;
  
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": faqs.map(faq => ({
      "@type": "Question",
      "name": faq.question,
      "acceptedAnswer": {
        "@type": "Answer",
        "text": faq.answer
      }
    }))
  };
}
