/**
 * Helper functions for tour management
 * Generates slugs, manages tour data, and provides utilities for tour pages
 */

/**
 * Generate a URL-friendly slug from a tour title
 * @param {string} title - Tour title
 * @returns {string} - URL-friendly slug
 */
export function generateTourSlug(title) {
  if (!title) return '';
  
  return title
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Remove accents
    .replace(/&/g, 'and')
    .replace(/'/g, '') // Remove apostrophes
    .replace(/\./g, '') // Remove periods
    .replace(/[^a-z0-9]+/g, '-') // Replace non-alphanumeric with hyphens
    .replace(/^-+|-+$/g, ''); // Remove leading/trailing hyphens
}

/**
 * Generate tour URL path
 * @param {string} productId - Viator product ID
 * @param {string} title - Tour title
 * @returns {string} - Internal tour URL
 */
export function getTourUrl(productId, title) {
  if (!productId) return '#';
  const slug = generateTourSlug(title);
  return `/tours/${productId}${slug ? `/${slug}` : ''}`;
}

/**
 * Extract product ID from tour object
 * @param {object} tour - Tour object from Viator API
 * @returns {string} - Product ID
 */
export function getTourProductId(tour) {
  return tour.productId || tour.productCode || tour.id || null;
}

/**
 * Get tour category from destination and search term
 * @param {string} destination - Destination name
 * @param {string} searchTerm - Search term used
 * @returns {string} - Category name
 */
export function extractCategoryFromSearch(destination, searchTerm) {
  if (!searchTerm || !destination) return null;
  
  const categoryKeywords = {
    'sunset cruise': 'Sunset Cruises',
    'sunset sail': 'Sunset Cruises',
    'atv tour': 'ATV Tours',
    'atv adventure': 'ATV Tours',
    'snorkeling': 'Snorkeling Tours',
    'snorkel': 'Snorkeling Tours',
    'diving': 'Diving Tours',
    'dive': 'Diving Tours',
    'catamaran': 'Catamaran Sailing',
    'sailing': 'Catamaran Sailing',
    'jeep tour': 'Jeep Off-Road Tours',
    'off-road': 'Jeep Off-Road Tours',
    'cultural': 'Cultural Tours',
    'heritage': 'Cultural Heritage Tours',
    'walking tour': 'Willemstad Walking Tours',
    'hiking': 'Piton Hiking Tours',
    'rainforest': 'Rainforest Tours',
    'mud bath': 'Volcanic Mud Bath Tours',
    'surfing': 'Surfing Tours',
    'rum': 'Rum Distillery Tours',
    'historical': 'Historical Tours'
  };
  
  const lowerSearch = searchTerm.toLowerCase();
  const lowerDest = destination.toLowerCase();
  const searchWithoutDest = lowerSearch.replace(lowerDest, '').trim();
  
  for (const [keyword, category] of Object.entries(categoryKeywords)) {
    if (searchWithoutDest.includes(keyword) || lowerSearch.includes(keyword)) {
      return category;
    }
  }
  
  return null;
}

/**
 * Get similar tours for a given tour
 * This will be used to show related tours on the detail page
 * @param {string} productId - Current tour product ID
 * @param {string} destination - Destination name
 * @param {string} category - Tour category
 * @param {array} allTours - Array of all available tours
 * @param {number} limit - Maximum number of similar tours to return
 * @returns {array} - Array of similar tours
 */
export function getSimilarTours(productId, destination, category, allTours = [], limit = 6) {
  if (!allTours || allTours.length === 0) return [];
  
  // Filter out the current tour
  const otherTours = allTours.filter(tour => {
    const tourId = getTourProductId(tour);
    return tourId !== productId;
  });
  
  // If we have a category, prioritize tours in the same category
  if (category) {
    const categoryTours = otherTours.filter(tour => {
      const tourTitle = (tour.title || '').toLowerCase();
      const categoryLower = category.toLowerCase();
      return tourTitle.includes(categoryLower.split(' ')[0]); // Match first word of category
    });
    
    // Sort by rating (highest first), then by review count
    const sorted = categoryTours.sort((a, b) => {
      const ratingA = a.reviews?.combinedAverageRating || 0;
      const ratingB = b.reviews?.combinedAverageRating || 0;
      const reviewsA = a.reviews?.totalReviews || 0;
      const reviewsB = b.reviews?.totalReviews || 0;
      
      if (ratingB !== ratingA) {
        return ratingB - ratingA;
      }
      return reviewsB - reviewsA;
    });
    
    return sorted.slice(0, limit);
  }
  
  // If no category, return highest rated tours from the same destination
  const sorted = otherTours.sort((a, b) => {
    const ratingA = a.reviews?.combinedAverageRating || 0;
    const ratingB = b.reviews?.combinedAverageRating || 0;
    const reviewsA = a.reviews?.totalReviews || 0;
    const reviewsB = b.reviews?.totalReviews || 0;
    
    if (ratingB !== ratingA) {
      return ratingB - ratingA;
    }
    return reviewsB - reviewsA;
  });
  
  return sorted.slice(0, limit);
}

