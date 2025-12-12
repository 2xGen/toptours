/**
 * Helper functions for tour operator premium subscriptions
 * URL conversion, verification, and tour management
 */

import { generateTourSlug, getTourUrl } from './tourHelpers';

/**
 * Extract product ID from Viator URL
 * Supports multiple Viator URL formats:
 * - https://www.viator.com/tours/Rome/Colosseum/d511-132779P2
 * - https://www.viator.com/tours/132779P2
 * - https://www.viator.com/en/.../d511-132779P2
 */
export function extractProductIdFromViatorUrl(viatorUrl) {
  if (!viatorUrl || typeof viatorUrl !== 'string') return null;
  
  try {
    // Pattern 1: /d\d+-([A-Z0-9]+)$ (most common: d511-132779P2)
    let match = viatorUrl.match(/d\d+-([A-Z0-9]+)$/);
    if (match) return match[1];
    
    // Pattern 2: /tours/[ProductId] (direct product ID)
    match = viatorUrl.match(/\/tours\/([A-Z0-9]+)(?:\/|$)/);
    if (match) return match[1];
    
    // Pattern 3: Extract from query params or hash
    const url = new URL(viatorUrl);
    const productId = url.searchParams.get('productId') || url.searchParams.get('product_id');
    if (productId) return productId;
    
    return null;
  } catch (error) {
    console.error('Error extracting product ID from Viator URL:', error);
    return null;
  }
}

/**
 * Extract product ID from TopTours URL
 * Supports TopTours URL formats:
 * - https://toptours.ai/tours/132779P2
 * - https://toptours.ai/tours/132779P2/colosseum-roman-forum
 * - /tours/132779P2
 * - /tours/132779P2/colosseum-roman-forum
 */
export function extractProductIdFromTopToursUrl(toptoursUrl) {
  if (!toptoursUrl || typeof toptoursUrl !== 'string') return null;
  
  try {
    // Pattern: /tours/([A-Z0-9]+)(?:/|$)
    // Matches: /tours/132779P2 or /tours/132779P2/slug
    const match = toptoursUrl.match(/\/tours\/([A-Z0-9]+)(?:\/|$)/);
    if (match) return match[1];
    
    return null;
  } catch (error) {
    console.error('Error extracting product ID from TopTours URL:', error);
    return null;
  }
}

/**
 * Extract product information from TripAdvisor URL
 * Format: https://www.tripadvisor.com/AttractionProductReview-g293791-d32865006-Explores_the_Heart_of_Addis_Ababa_city_tour-Addis_Ababa.html
 * Returns: { productRef: 'd32865006', title: 'Explores the Heart of Addis Ababa city tour', location: 'Addis_Ababa' }
 */
export function extractProductInfoFromTripAdvisorUrl(tripAdvisorUrl) {
  if (!tripAdvisorUrl || typeof tripAdvisorUrl !== 'string') return null;
  
  try {
    // Pattern: AttractionProductReview-g\d+-d(\d+)-(.+?)-(.+?)\.html
    const match = tripAdvisorUrl.match(/AttractionProductReview-g\d+-d(\d+)-(.+?)-(.+?)\.html/);
    if (!match) return null;
    
    return {
      productRef: match[1], // e.g., '32865006'
      title: match[2].replace(/_/g, ' '), // e.g., 'Explores the Heart of Addis Ababa city tour'
      location: match[3].replace(/_/g, ' '), // e.g., 'Addis Ababa'
      fullTitle: `${match[2].replace(/_/g, ' ')} - ${match[3].replace(/_/g, ' ')}`
    };
  } catch (error) {
    console.error('Error extracting product info from TripAdvisor URL:', error);
    return null;
  }
}

/**
 * Detect URL type (Viator or TripAdvisor)
 */
export function detectUrlType(url) {
  if (!url || typeof url !== 'string') return null;
  
  if (url.includes('viator.com')) return 'viator';
  if (url.includes('tripadvisor.com')) return 'tripadvisor';
  
  return null;
}

/**
 * Convert Viator URL to TopTours URL
 * @param {string} viatorUrl - Viator tour URL
 * @param {string} tourTitle - Tour title (optional, for slug generation)
 * @returns {string|null} - TopTours URL or null if invalid
 */
export function convertViatorToTopToursUrl(viatorUrl, tourTitle = '') {
  const productId = extractProductIdFromViatorUrl(viatorUrl);
  if (!productId) return null;
  
  return getTourUrl(productId, tourTitle);
}

/**
 * Normalize operator name for comparison
 * Removes common variations, case-insensitive
 */
export function normalizeOperatorName(name) {
  if (!name || typeof name !== 'string') return '';
  
  return name
    .toLowerCase()
    .trim()
    .replace(/\s+/g, ' ') // Normalize whitespace
    .replace(/[^\w\s]/g, '') // Remove special characters
    .replace(/\b(inc|llc|ltd|limited|tours|tour|travel|company|co)\b/gi, '') // Remove common suffixes
    .trim();
}

/**
 * Calculate match score between two operator names
 * Returns 0-1, where 1 is perfect match
 */
export function calculateOperatorMatchScore(name1, name2) {
  const normalized1 = normalizeOperatorName(name1);
  const normalized2 = normalizeOperatorName(name2);
  
  if (normalized1 === normalized2) return 1.0;
  
  // Check if one contains the other (for partial matches)
  if (normalized1.includes(normalized2) || normalized2.includes(normalized1)) {
    const shorter = normalized1.length < normalized2.length ? normalized1 : normalized2;
    const longer = normalized1.length >= normalized2.length ? normalized1 : normalized2;
    return shorter.length / longer.length;
  }
  
  // Simple Levenshtein-like comparison (simplified)
  const words1 = normalized1.split(' ');
  const words2 = normalized2.split(' ');
  const commonWords = words1.filter(word => words2.includes(word));
  const totalWords = Math.max(words1.length, words2.length);
  
  return totalWords > 0 ? commonWords.length / totalWords : 0;
}

/**
 * Verify if a tour belongs to an operator
 * @param {string} viatorUrl - Viator tour URL
 * @param {string} operatorName - Submitted operator name
 * @param {object} tourData - Tour data from Viator API (optional, will fetch if not provided)
 * @returns {Promise<object>} - Verification result
 */
export async function verifyTourOperator(viatorUrl, operatorName, tourData = null) {
  const productId = extractProductIdFromViatorUrl(viatorUrl);
  
  if (!productId) {
    return {
      success: false,
      error: 'Invalid Viator URL format',
      productId: null
    };
  }
  
  // If tour data not provided, would need to fetch from API
  // For now, assume tourData is provided
  if (!tourData) {
    return {
      success: false,
      error: 'Tour data required for verification',
      productId
    };
  }
  
  const tourOperatorName = tourData.supplier?.name || 
                          tourData.supplierName || 
                          tourData.operator?.name || 
                          tourData.vendor?.name || 
                          '';
  
  if (!tourOperatorName) {
    return {
      success: false,
      error: 'No operator name found in tour data',
      productId
    };
  }
  
  const matchScore = calculateOperatorMatchScore(operatorName, tourOperatorName);
  const matches = matchScore >= 0.8; // 80% threshold
  
  return {
    success: true,
    productId,
    matches,
    matchScore,
    tourOperatorName,
    submittedOperatorName: operatorName,
    tourTitle: tourData.title || tourData.seo?.title || '',
    toptoursUrl: getTourUrl(productId, tourData.title || tourData.seo?.title || ''),
    reviewCount: tourData.reviews?.totalReviews || 0,
    rating: tourData.reviews?.combinedAverageRating || 0,
    tourImageUrl: tourData.images?.[0]?.variants?.[3]?.url || 
                  tourData.images?.[0]?.variants?.[0]?.url || 
                  null
  };
}

/**
 * Get all premium tour product IDs for an operator
 * @param {string} productId - Current tour product ID
 * @returns {Promise<Array>} - Array of product IDs (max 5)
 */
export async function getOperatorPremiumTourIds(productId) {
  // This will be implemented in the server-side function
  // Returns array of product IDs for the same operator
  return [];
}

