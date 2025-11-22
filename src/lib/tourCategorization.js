/**
 * Tour Categorization Helper
 * Groups tours by category based on keywords in title and description
 */

// Category keywords mapping - can be expanded
const CATEGORY_KEYWORDS = {
  'Art and Culture Tours': ['art', 'culture', 'museum', 'gallery', 'exhibition', 'heritage', 'cultural', 'artistic'],
  'Historical Walking Tours': ['history', 'historical', 'walking', 'walk', 'heritage', 'ancient', 'historic', 'monument'],
  'Architectural Exploration': ['architecture', 'architectural', 'building', 'design', 'modern', 'construction', 'landmark'],
  'Culinary Tours': ['culinary', 'food', 'cuisine', 'restaurant', 'tasting', 'dining', 'gastronomy', 'market', 'local food'],
  'Food Tours': ['food', 'culinary', 'tasting', 'restaurant', 'wine', 'dining', 'cuisine', 'gastronomy', 'market'],
  'Bike Tours': ['bike', 'bicycle', 'cycling', 'bike tour', 'pedal', 'two-wheel'],
  'Local Market Visits': ['market', 'bazaar', 'shopping', 'local market', 'street market', 'food market'],
  'Sunset Cruises': ['sunset', 'cruise', 'boat', 'sailing', 'catamaran', 'harbor cruise'],
  'ATV Tours': ['atv', 'quad', 'off-road', '4x4', 'jeep', 'adventure'],
  'Snorkeling Tours': ['snorkel', 'diving', 'underwater', 'reef', 'marine'],
  'Food Tours': ['food', 'culinary', 'tasting', 'restaurant', 'wine', 'dining'],
  'Walking Tours': ['walking', 'walk', 'stroll', 'pedestrian', 'guided walk'],
  'Harbor Cruises': ['harbor', 'harbour', 'port', 'maritime', 'boat tour'],
  'Wine Tours': ['wine', 'vineyard', 'winery', 'tasting', 'vintage'],
  'Photography Tours': ['photography', 'photo', 'photographer', 'camera', 'instagram'],
  'Night Tours': ['night', 'evening', 'sunset', 'nightlife', 'after dark'],
};

/**
 * Categorize a single tour based on its title and description
 */
export function categorizeTour(tour, destinationCategories) {
  const title = (tour.title || '').toLowerCase();
  const description = (tour.description || tour.productContent?.description || '').toLowerCase();
  const text = `${title} ${description}`;
  
  // Score each category based on keyword matches
  const scores = {};
  
  destinationCategories.forEach(category => {
    const categoryName = typeof category === 'string' ? category : category.name;
    const keywords = CATEGORY_KEYWORDS[categoryName] || [];
    
    let score = 0;
    keywords.forEach(keyword => {
      const regex = new RegExp(`\\b${keyword}\\b`, 'i');
      if (regex.test(text)) {
        score += 1;
      }
    });
    
    if (score > 0) {
      scores[categoryName] = score;
    }
  });
  
  // Return category with highest score, or 'Other' if no match
  if (Object.keys(scores).length === 0) {
    return 'Other';
  }
  
  return Object.keys(scores).reduce((a, b) => 
    scores[a] > scores[b] ? a : b
  );
}

/**
 * Group tours by category
 */
export function groupToursByCategory(tours, destinationCategories) {
  const grouped = {};
  
  // Initialize categories
  destinationCategories.forEach(category => {
    const categoryName = typeof category === 'string' ? category : category.name;
    grouped[categoryName] = [];
  });
  grouped['Other'] = [];
  
  // Categorize each tour
  tours.forEach(tour => {
    const category = categorizeTour(tour, destinationCategories);
    if (!grouped[category]) {
      grouped[category] = [];
    }
    grouped[category].push(tour);
  });
  
  // Sort tours within each category by rating/reviews
  Object.keys(grouped).forEach(category => {
    grouped[category].sort((a, b) => {
      const ratingA = a.reviews?.combinedAverageRating || 0;
      const ratingB = b.reviews?.combinedAverageRating || 0;
      const reviewsA = a.reviews?.totalReviews || 0;
      const reviewsB = b.reviews?.totalReviews || 0;
      
      // Sort by rating first, then by number of reviews
      if (ratingA !== ratingB) {
        return ratingB - ratingA;
      }
      return reviewsB - reviewsA;
    });
  });
  
  return grouped;
}

