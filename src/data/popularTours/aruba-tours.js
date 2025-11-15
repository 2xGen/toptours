// Popular Tours for Aruba
// This file contains hardcoded, SEO-optimized tour data
// Structure supports future comparison and analytics features

export const arubaTours = [
  // Example structure - will be populated with actual tours
  // {
  //   productId: '119085P2',
  //   slug: 'aruba-sunset-sail-cruise-dolphin-catamaran',
  //   destinationId: 'aruba',
  //   
  //   // SEO content (hardcoded, AI-optimized)
  //   seo: {
  //     title: 'Aruba Sunset Sail Cruise on Dolphin Catamaran | TopTours.ai',
  //     description: 'Experience Aruba\'s most popular sunset cruise aboard the Dolphin catamaran. 2-hour sailing with open bar, snacks, and Caribbean music. Book your Aruba sunset cruise today.',
  //     keywords: ['aruba sunset cruise', 'catamaran tour aruba', 'aruba boat tour', 'sunset sail aruba']
  //   },
  //   
  //   // AI-optimized blog-style content
  //   content: {
  //     heroDescription: 'As the Caribbean sun begins its descent...',
  //     fullDescription: 'Aruba\'s Dolphin Catamaran offers one of the island\'s most...',
  //     whyBook: ['Best sunset views in Aruba', 'Open bar included', 'Professional crew'],
  //     highlights: ['2-hour sailing experience', 'Caribbean music', 'Swim stop with rope swing'],
  //     tips: ['Bring a camera for sunset photos', 'Wear comfortable clothing'],
  //     faq: [
  //       { question: 'What is included?', answer: '...' }
  //     ]
  //   },
  //   
  //   // Dynamic fields (from API)
  //   dynamic: {
  //     pricing: true,
  //     availability: true,
  //     reviews: true,
  //     images: true
  //   },
  //   
  //   // Metadata for filtering and comparison
  //   metadata: {
  //     category: 'Sunset Cruises',
  //     tags: [367654, 367659, 21442], // Viator tag IDs
  //     difficulty: 'easy',
  //     duration: 120,
  //     groupSize: 'small',
  //     priceRange: 'mid',
  //     travelerTypes: ['couples', 'families', 'groups']
  //   }
  // }
];

// Helper function to get tours by category
export function getArubaToursByCategory(category) {
  return arubaTours.filter(tour => tour.metadata?.category === category);
}

// Helper function to get tour by productId
export function getArubaTourById(productId) {
  return arubaTours.find(tour => tour.productId === productId);
}

// Get all Aruba tours
export function getAllArubaTours() {
  return arubaTours;
}

