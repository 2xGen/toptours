import { GoogleGenerativeAI } from '@google/generative-ai';
import { createClient } from '@supabase/supabase-js';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';
import { readFileSync } from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables
import dotenv from 'dotenv';
dotenv.config({ path: resolve(__dirname, '../.env.local') });

const GEMINI_API_KEY = process.env.GEMINI_API_KEY || process.env.GOOGLE_GENERATIVE_AI_API_KEY;
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!GEMINI_API_KEY) {
  console.error('❌ Missing GEMINI_API_KEY in .env.local');
  process.exit(1);
}

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error('❌ Missing Supabase credentials in .env.local');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

// Import destinations data
const destinationsDataPath = resolve(__dirname, '../src/data/destinationsData.js');
const destinationsContent = readFileSync(destinationsDataPath, 'utf8');
const destinationsMatch = destinationsContent.match(/export const destinations = \[([\s\S]*?)\];/);
if (!destinationsMatch) {
  console.error('Could not find destinations array');
  process.exit(1);
}
const destinations = eval(`[${destinationsMatch[1]}]`);

// 9 Cuisine-Based Restaurant Guide Categories
// These align with how people actually search: "best Italian restaurants in [destination]"
const RESTAURANT_GUIDE_CATEGORIES = [
  {
    slug: 'best-seafood-restaurants',
    name: 'Best Seafood Restaurants',
    filterCriteria: {
      cuisines: ['Seafood'],
      minRating: 4.0,
      minReviews: 30,
      sortBy: 'rating',
      sortOrder: 'desc'
    }
  },
  {
    slug: 'best-italian-restaurants',
    name: 'Best Italian Restaurants',
    filterCriteria: {
      cuisines: ['Italian'],
      minRating: 4.0,
      minReviews: 30,
      sortBy: 'rating',
      sortOrder: 'desc'
    }
  },
  {
    slug: 'best-asian-restaurants',
    name: 'Best Asian Restaurants',
    filterCriteria: {
      cuisines: ['Asian'],
      minRating: 4.0,
      minReviews: 30,
      sortBy: 'rating',
      sortOrder: 'desc'
    }
  },
  {
    slug: 'best-american-restaurants',
    name: 'Best American Restaurants',
    filterCriteria: {
      cuisines: ['American'],
      minRating: 4.0,
      minReviews: 30,
      sortBy: 'rating',
      sortOrder: 'desc'
    }
  },
  {
    slug: 'best-latin-caribbean-restaurants',
    name: 'Best Latin & Caribbean Restaurants',
    filterCriteria: {
      cuisines: ['Caribbean & Latin'],
      minRating: 4.0,
      minReviews: 30,
      sortBy: 'rating',
      sortOrder: 'desc'
    }
  },
  {
    slug: 'best-mediterranean-restaurants',
    name: 'Best Mediterranean Restaurants',
    filterCriteria: {
      cuisines: ['Mediterranean'],
      minRating: 4.0,
      minReviews: 30,
      sortBy: 'rating',
      sortOrder: 'desc'
    }
  },
  {
    slug: 'best-french-european-restaurants',
    name: 'Best French & European Restaurants',
    filterCriteria: {
      cuisines: ['European'],
      minRating: 4.0,
      minReviews: 30,
      sortBy: 'rating',
      sortOrder: 'desc'
    }
  },
  {
    slug: 'best-vegetarian-healthy-restaurants',
    name: 'Best Vegetarian & Healthy Restaurants',
    filterCriteria: {
      cuisines: ['Vegetarian & Vegan'],
      minRating: 4.0,
      minReviews: 30,
      sortBy: 'rating',
      sortOrder: 'desc'
    }
  },
  {
    slug: 'best-cafes-dessert-spots',
    name: 'Best Cafés & Dessert Spots',
    filterCriteria: {
      cuisines: ['Cafés & Casual Eats'],
      minRating: 4.0,
      minReviews: 30,
      sortBy: 'rating',
      sortOrder: 'desc'
    }
  }
];

// Create Gemini prompt for restaurant guide
const createRestaurantGuidePrompt = (destination, category) => {
  // Define long-tail keyword patterns for each cuisine category
  const longTailKeywordPatterns = {
    'best-seafood-restaurants': [
      `best seafood restaurants in ${destination.fullName || destination.name}`,
      `top rated seafood restaurants ${destination.fullName || destination.name}`,
      `fresh seafood dining ${destination.fullName || destination.name}`,
      `where to eat seafood in ${destination.fullName || destination.name}`,
      `seafood restaurants near me ${destination.fullName || destination.name}`,
      `best fish restaurants ${destination.fullName || destination.name}`,
      `oceanfront seafood ${destination.fullName || destination.name}`,
      `seafood restaurants with ocean views ${destination.fullName || destination.name}`
    ],
    'best-italian-restaurants': [
      `best Italian restaurants in ${destination.fullName || destination.name}`,
      `top Italian restaurants ${destination.fullName || destination.name}`,
      `Italian dining ${destination.fullName || destination.name}`,
      `best pizza in ${destination.fullName || destination.name}`,
      `Italian restaurants near me ${destination.fullName || destination.name}`,
      `authentic Italian ${destination.fullName || destination.name}`,
      `best pasta restaurants ${destination.fullName || destination.name}`,
      `Italian cuisine ${destination.fullName || destination.name}`
    ],
    'best-asian-restaurants': [
      `best Asian restaurants in ${destination.fullName || destination.name}`,
      `top Asian restaurants ${destination.fullName || destination.name}`,
      `Asian dining ${destination.fullName || destination.name}`,
      `best Chinese restaurants ${destination.fullName || destination.name}`,
      `best Thai restaurants ${destination.fullName || destination.name}`,
      `best Japanese restaurants ${destination.fullName || destination.name}`,
      `best Indian restaurants ${destination.fullName || destination.name}`,
      `Asian cuisine ${destination.fullName || destination.name}`
    ],
    'best-american-restaurants': [
      `best American restaurants in ${destination.fullName || destination.name}`,
      `top American restaurants ${destination.fullName || destination.name}`,
      `American dining ${destination.fullName || destination.name}`,
      `best burgers in ${destination.fullName || destination.name}`,
      `American restaurants near me ${destination.fullName || destination.name}`,
      `best BBQ ${destination.fullName || destination.name}`,
      `American cuisine ${destination.fullName || destination.name}`,
      `best diners ${destination.fullName || destination.name}`
    ],
    'best-latin-caribbean-restaurants': [
      `best Caribbean restaurants in ${destination.fullName || destination.name}`,
      `best Latin restaurants ${destination.fullName || destination.name}`,
      `Caribbean dining ${destination.fullName || destination.name}`,
      `best Mexican restaurants ${destination.fullName || destination.name}`,
      `Latin American cuisine ${destination.fullName || destination.name}`,
      `Caribbean food ${destination.fullName || destination.name}`,
      `authentic Caribbean ${destination.fullName || destination.name}`,
      `Latin restaurants near me ${destination.fullName || destination.name}`
    ],
    'best-mediterranean-restaurants': [
      `best Mediterranean restaurants in ${destination.fullName || destination.name}`,
      `top Mediterranean restaurants ${destination.fullName || destination.name}`,
      `Mediterranean dining ${destination.fullName || destination.name}`,
      `best Greek restaurants ${destination.fullName || destination.name}`,
      `best Middle Eastern restaurants ${destination.fullName || destination.name}`,
      `Mediterranean cuisine ${destination.fullName || destination.name}`,
      `authentic Mediterranean ${destination.fullName || destination.name}`,
      `Mediterranean restaurants near me ${destination.fullName || destination.name}`
    ],
    'best-french-european-restaurants': [
      `best French restaurants in ${destination.fullName || destination.name}`,
      `best European restaurants ${destination.fullName || destination.name}`,
      `French dining ${destination.fullName || destination.name}`,
      `European cuisine ${destination.fullName || destination.name}`,
      `best French restaurants ${destination.fullName || destination.name}`,
      `best Spanish restaurants ${destination.fullName || destination.name}`,
      `European restaurants near me ${destination.fullName || destination.name}`,
      `authentic French ${destination.fullName || destination.name}`
    ],
    'best-vegetarian-healthy-restaurants': [
      `best vegetarian restaurants in ${destination.fullName || destination.name}`,
      `best vegan restaurants ${destination.fullName || destination.name}`,
      `vegetarian dining ${destination.fullName || destination.name}`,
      `healthy restaurants ${destination.fullName || destination.name}`,
      `vegan restaurants near me ${destination.fullName || destination.name}`,
      `plant based restaurants ${destination.fullName || destination.name}`,
      `vegetarian cuisine ${destination.fullName || destination.name}`,
      `healthy dining ${destination.fullName || destination.name}`
    ],
    'best-cafes-dessert-spots': [
      `best cafes in ${destination.fullName || destination.name}`,
      `best coffee shops ${destination.fullName || destination.name}`,
      `best dessert spots ${destination.fullName || destination.name}`,
      `cafes near me ${destination.fullName || destination.name}`,
      `best bakeries ${destination.fullName || destination.name}`,
      `coffee shops ${destination.fullName || destination.name}`,
      `best brunch spots ${destination.fullName || destination.name}`,
      `dessert restaurants ${destination.fullName || destination.name}`
    ]
  };

  const keywordPatterns = longTailKeywordPatterns[category.slug] || [
    `best ${category.name.toLowerCase()} in ${destination.fullName || destination.name}`,
    `top ${category.name.toLowerCase()} ${destination.fullName || destination.name}`,
    `${category.name.toLowerCase()} near me ${destination.fullName || destination.name}`
  ];

  return `You are an expert SEO content writer specializing in travel and dining content. Your goal is to create a comprehensive, keyword-rich restaurant guide that ranks #1 for long-tail restaurant searches.

DESTINATION: ${destination.fullName || destination.name}
CATEGORY: ${category.name}
CATEGORY SLUG: ${category.slug}
DESTINATION INFO:
- Location: ${destination.country || destination.fullName}
- Region: ${destination.category || 'Unknown'}
- Description: ${destination.briefDescription || 'A popular travel destination'}
- Image URL: ${destination.imageUrl || ''}

TARGET LONG-TAIL KEYWORDS (MUST naturally include these throughout content):
${keywordPatterns.map(kw => `- "${kw}"`).join('\n')}

SEO REQUIREMENTS:
1. PRIMARY KEYWORD: "${category.name.toLowerCase()} ${destination.fullName || destination.name}"
2. Include location name "${destination.fullName || destination.name}" naturally 8-12 times throughout content
3. Use keyword variations naturally (don't stuff keywords)
4. Include question-based keywords in FAQs: "where to eat", "best restaurants for", "what are the best"
5. Use semantic keywords: dining, eateries, cuisine, culinary, gastronomy
6. Include intent keywords: "near me", "with views", "for families", "romantic", "budget"

TASK: Create a comprehensive, SEO-optimized restaurant guide following this EXACT structure:

{
  title: '${category.name} in ${destination.fullName || destination.name}',
  subtitle: 'Compelling 15-20 word subtitle that includes primary keyword naturally and highlights unique dining aspects',
  categoryName: '${category.name}',
  stats: { 
    restaurantsAvailable: 15-30 (estimate based on destination size/popularity),
    avgRating: 4.3-4.7 (realistic average),
    priceFrom: "$" or "$$" (typical price range start),
    priceTo: "$$$" or "$$$$" (typical price range end)
  },
  introduction: \`Write comprehensive 200-250 word introduction that:
  - Naturally includes primary keyword "${category.name.toLowerCase()} ${destination.fullName || destination.name}" in first sentence
  - Includes destination name "${destination.fullName || destination.name}" 3-4 times naturally
  - Mentions specific local dishes, dining culture, or unique features
  - Uses semantic keywords: dining scene, culinary, gastronomy, eateries
  - Answers "what", "why", and "where" questions
  - Creates excitement while being informative
  - Includes at least 2-3 long-tail keyword variations naturally\`,
  seo: {
    title: '${category.name} in ${destination.fullName || destination.name} 2026 | Top Rated Dining Guide',
    description: 'Discover the best ${category.name.toLowerCase()} in ${destination.fullName || destination.name}. 20+ top-rated restaurants with 4.5+ star ratings. Find your perfect dining experience!',
    keywords: '${keywordPatterns.slice(0, 8).join(', ')}, ${destination.fullName || destination.name} restaurants, dining ${destination.fullName || destination.name}, where to eat ${destination.fullName || destination.name}, ${destination.fullName || destination.name} dining guide'
  },
  whyChoose: [
    { icon: 'IconName', title: 'Benefit Title (include keyword variation)', description: 'Specific compelling reason highlighting unique dining advantage. Naturally include destination name "${destination.fullName || destination.name}" and category keyword. 2-3 sentences with practical details.' },
    { icon: 'IconName', title: 'Benefit Title (include keyword variation)', description: 'Specific compelling reason highlighting unique dining advantage. Naturally include destination name "${destination.fullName || destination.name}" and category keyword. 2-3 sentences with practical details.' },
    { icon: 'IconName', title: 'Benefit Title (include keyword variation)', description: 'Specific compelling reason highlighting unique dining advantage. Naturally include destination name "${destination.fullName || destination.name}" and category keyword. 2-3 sentences with practical details.' },
    { icon: 'IconName', title: 'Benefit Title (include keyword variation)', description: 'Specific compelling reason highlighting unique dining advantage. Naturally include destination name "${destination.fullName || destination.name}" and category keyword. 2-3 sentences with practical details.' }
  ],
  whatToExpect: {
    title: 'What to Expect at ${category.name} in ${destination.fullName || destination.name}',
    items: [
      { icon: 'DollarSign', title: 'Price Range for ${category.name.toLowerCase()} in ${destination.fullName || destination.name}', description: 'Specific pricing details for this restaurant category in ${destination.fullName || destination.name}. Include typical price ranges, what you get for the price, and value tips. Naturally mention destination name.' },
      { icon: 'Clock', title: 'Best Times to Dine', description: 'Typical dining hours and best times to visit ${category.name.toLowerCase()} in ${destination.fullName || destination.name}. Include peak hours, off-peak benefits, reservation recommendations.' },
      { icon: 'Users', title: 'Dining Atmosphere', description: 'Describe the typical atmosphere at ${category.name.toLowerCase()} in ${destination.fullName || destination.name}. Include dress code, ambiance, crowd type, and what makes it special.' },
      { icon: 'UtensilsCrossed', title: 'Cuisine & Menu Highlights', description: 'What types of dishes and cuisine you can expect at ${category.name.toLowerCase()} in ${destination.fullName || destination.name}. Mention local specialties, popular dishes, dietary options.' },
      { icon: 'MapPin', title: 'Location & Accessibility', description: 'Where to find ${category.name.toLowerCase()} in ${destination.fullName || destination.name}. Include neighborhoods, accessibility, parking, public transport options.' },
      { icon: 'Star', title: 'Quality & Ratings', description: 'What quality standards to expect from ${category.name.toLowerCase()} in ${destination.fullName || destination.name}. Include typical ratings, what makes restaurants stand out, quality indicators.' }
    ]
  },
  expertTips: [
    'Specific actionable dining tip with insider knowledge. Include destination name "${destination.fullName || destination.name}" naturally. Mention specific restaurant names, neighborhoods, or local insights.',
    'Specific actionable dining tip with insider knowledge. Include destination name "${destination.fullName || destination.name}" naturally. Mention specific restaurant names, neighborhoods, or local insights.',
    'Specific actionable dining tip with insider knowledge. Include destination name "${destination.fullName || destination.name}" naturally. Mention specific restaurant names, neighborhoods, or local insights.',
    'Specific actionable dining tip with insider knowledge. Include destination name "${destination.fullName || destination.name}" naturally. Mention specific restaurant names, neighborhoods, or local insights.',
    'Specific actionable dining tip with insider knowledge. Include destination name "${destination.fullName || destination.name}" naturally. Mention specific restaurant names, neighborhoods, or local insights.',
    'Specific actionable dining tip with insider knowledge. Include destination name "${destination.fullName || destination.name}" naturally. Mention specific restaurant names, neighborhoods, or local insights.',
    'Specific actionable dining tip with insider knowledge. Include destination name "${destination.fullName || destination.name}" naturally. Mention specific restaurant names, neighborhoods, or local insights.',
    'Specific actionable dining tip with insider knowledge. Include destination name "${destination.fullName || destination.name}" naturally. Mention specific restaurant names, neighborhoods, or local insights.'
  ],
  faqs: [
    { question: 'What are the best ${category.name.toLowerCase()} in ${destination.fullName || destination.name}?', answer: 'Comprehensive 150-200 word answer that naturally includes destination name "${destination.fullName || destination.name}" 3-4 times. Include specific restaurant recommendations, what makes them best, ratings, price ranges, locations, and unique features. Use enthusiastic tone with exclamation marks. Include practical details like reservation tips, best times to visit, and what to order.' },
    { question: 'Where can I find ${category.name.toLowerCase()} in ${destination.fullName || destination.name}?', answer: 'Comprehensive 150-200 word answer covering locations, neighborhoods, and areas known for ${category.name.toLowerCase()} in ${destination.fullName || destination.name}. Include specific areas, accessibility, parking, and transportation options. Naturally include destination name 2-3 times.' },
    { question: 'What is the average price for ${category.name.toLowerCase()} in ${destination.fullName || destination.name}?', answer: 'Comprehensive 150-200 word answer with specific pricing details for ${category.name.toLowerCase()} in ${destination.fullName || destination.name}. Include price ranges, what you get for the price, value tips, and how prices compare. Mention destination name naturally 2-3 times.' },
    { question: 'Do I need reservations for ${category.name.toLowerCase()} in ${destination.fullName || destination.name}?', answer: 'Comprehensive 150-200 word answer about reservation requirements for ${category.name.toLowerCase()} in ${destination.fullName || destination.name}. Include when reservations are needed, how to make them, best times, walk-in options, and insider tips. Naturally include destination name 2-3 times.' },
    { question: 'What are the best times to visit ${category.name.toLowerCase()} in ${destination.fullName || destination.name}?', answer: 'Comprehensive 150-200 word answer about optimal dining times for ${category.name.toLowerCase()} in ${destination.fullName || destination.name}. Include peak hours, off-peak benefits, seasonal variations, and insider timing tips. Naturally include destination name 2-3 times.' },
    { question: 'Are there ${category.name.toLowerCase()} in ${destination.fullName || destination.name} suitable for special occasions?', answer: 'Comprehensive 150-200 word answer about special occasion dining options for ${category.name.toLowerCase()} in ${destination.fullName || destination.name}. Include romantic spots, celebration venues, group dining, and what makes them special. Naturally include destination name 2-3 times.' },
    { question: 'What should I know before dining at ${category.name.toLowerCase()} in ${destination.fullName || destination.name}?', answer: 'Comprehensive 150-200 word answer with essential information for ${category.name.toLowerCase()} in ${destination.fullName || destination.name}. Include dress codes, etiquette, tipping culture, dietary options, and local dining customs. Naturally include destination name 2-3 times.' },
    { question: 'How do ${category.name.toLowerCase()} in ${destination.fullName || destination.name} compare to other destinations?', answer: 'Comprehensive 150-200 word answer comparing ${category.name.toLowerCase()} in ${destination.fullName || destination.name} to other destinations. Highlight what makes ${destination.fullName || destination.name} unique, local specialties, and distinctive features. Naturally include destination name 3-4 times.' }
  ]
}

AVAILABLE ICONS (use ONLY these): 
Sun, Waves, Heart, Users, Camera, GlassWater, Music, Star, Clock, MapPin, DollarSign, Calendar, Anchor, Shirt, BookOpen, Sailboat, Ship, PartyPopper, HeartHandshake, UtensilsCrossed

SEO & QUALITY REQUIREMENTS:
1. KEYWORD DENSITY: Include primary keyword "${category.name.toLowerCase()} ${destination.fullName || destination.name}" naturally 8-12 times throughout content
2. DESTINATION NAME: Include "${destination.fullName || destination.name}" naturally 15-20 times throughout entire content
3. LONG-TAIL KEYWORDS: Naturally incorporate all provided long-tail keywords in headings, content, and FAQs
4. HEADING HIERARCHY: Use keyword-rich H2/H3 headings (e.g., "Best ${category.name.toLowerCase()} in ${destination.fullName || destination.name}")
5. SEMANTIC KEYWORDS: Use variations: dining, eateries, cuisine, culinary, gastronomy, restaurants, food scene
6. INTENT KEYWORDS: Include "near me", "with views", "for families", "romantic", "budget", "best", "top rated"
7. QUESTION KEYWORDS: Use "where to eat", "what are the best", "how to find" in FAQs
8. Be SPECIFIC - mention actual local dishes, dining customs, restaurant types, neighborhoods by name
9. Use ENTHUSIASTIC tone with exclamation marks (like our Caribbean guides)
10. Include REALISTIC pricing estimates in USD
11. Make FAQs 150-200 words each with DETAILED information and multiple keyword mentions
12. Expert tips should be ACTIONABLE insider knowledge with destination name naturally included
13. Introduction should be COMPREHENSIVE (200-250 words) with keyword-rich opening
14. Use destination-specific dining knowledge, not generic content
15. Write as if you're a local food expert who knows the destination's dining scene intimately
16. Focus on the dining experience, atmosphere, and what makes this category special in this destination
17. NATURAL KEYWORD PLACEMENT: Never stuff keywords - they should flow naturally in sentences
18. CONTENT LENGTH: Aim for 2000-3000 words total across all sections for comprehensive SEO value

EXAMPLE HIGH-QUALITY FAQ (for reference):
{ question: 'What is the best time to visit seafood restaurants in Aruba?', answer: 'Dinner is prime time! Most seafood restaurants in Aruba open around 5-6 PM and stay open until 10-11 PM. Sunset dining (6-7 PM) is magical with ocean views. Weekends are busier, so book ahead. Many restaurants offer happy hour specials 4-6 PM. Fresh catch arrives daily, so lunch (12-2 PM) is also excellent for freshest fish. Beachfront spots get crowded at sunset - arrive early or make reservations!' }

OUTPUT: Return ONLY the JavaScript object, properly formatted. No markdown, no explanations, just the pure JavaScript object.`;
};

// Function to call Gemini API
async function generateGuideWithGemini(destination, category) {
  const prompt = createRestaurantGuidePrompt(destination, category);
  
  try {
    const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
    const models = [
      'gemini-2.5-flash-lite', // Cheapest
      'gemini-2.5-flash',
      'gemini-1.5-flash',
      'gemini-1.5-pro'
    ];
    
    let content = null;
    let lastError = null;
    
    for (const modelName of models) {
      try {
        const model = genAI.getGenerativeModel({ 
          model: modelName,
          generationConfig: {
            temperature: 0.7,
            maxOutputTokens: 4000,
          }
        });
        
        const result = await model.generateContent(prompt);
        const response = await result.response;
        content = response.text();
        
        if (content) {
          console.log(`   ✓ Using Gemini model: ${modelName}`);
          break;
        }
      } catch (error) {
        lastError = error;
        continue;
      }
    }
    
    if (!content) {
      throw new Error(lastError?.message || 'All Gemini models failed');
    }
    
    // Extract JavaScript object from response
    const objectMatch = content.match(/\{[\s\S]*\}/);
    if (!objectMatch) {
      throw new Error('Could not extract guide object from response');
    }
    
    return eval(`(${objectMatch[0]})`);
    
  } catch (error) {
    console.error(`❌ Error generating guide for ${destination.name} - ${category.name}:`, error.message);
    return null;
  }
}

// Get restaurant count for stats
async function getRestaurantCountForGuide(destinationId, filterCriteria) {
  try {
    let query = supabase
      .from('restaurants')
      .select('id', { count: 'exact', head: true })
      .eq('destination_id', destinationId)
      .eq('is_active', true);
    
    if (filterCriteria.cuisines && filterCriteria.cuisines.length > 0) {
      query = query.contains('cuisines', filterCriteria.cuisines);
    }
    
    if (filterCriteria.minRating) {
      query = query.gte('google_rating', filterCriteria.minRating);
    }
    
    if (filterCriteria.minReviews) {
      query = query.gte('review_count', filterCriteria.minReviews);
    }
    
    if (filterCriteria.priceLevelMin !== undefined) {
      query = query.gte('price_level', filterCriteria.priceLevelMin);
    }
    
    if (filterCriteria.priceLevelMax !== undefined) {
      query = query.lte('price_level', filterCriteria.priceLevelMax);
    }
    
    if (filterCriteria.goodForChildren !== undefined) {
      query = query.eq('good_for_children', filterCriteria.goodForChildren);
    }
    
    if (filterCriteria.liveMusic !== undefined) {
      query = query.eq('live_music', filterCriteria.liveMusic);
    }
    
    if (filterCriteria.outdoorSeating !== undefined) {
      query = query.eq('outdoor_seating', filterCriteria.outdoorSeating);
    }
    
    if (filterCriteria.reservable !== undefined) {
      query = query.eq('reservable', filterCriteria.reservable);
    }
    
    if (filterCriteria.servesWine !== undefined) {
      query = query.eq('serves_wine', filterCriteria.servesWine);
    }
    
    if (filterCriteria.servesCocktails !== undefined) {
      query = query.eq('serves_cocktails', filterCriteria.servesCocktails);
    }
    
    const { count, error } = await query;
    
    if (error) {
      console.warn('Error counting restaurants:', error.message);
      return 0;
    }
    
    return count || 0;
  } catch (error) {
    console.warn('Error counting restaurants:', error.message);
    return 0;
  }
}

// Save guide to database
async function saveGuideToDatabase(destination, category, guideData, filterCriteria) {
  try {
    const restaurantCount = await getRestaurantCountForGuide(destination.id, filterCriteria);
    
    // Update stats with actual count
    const stats = {
      ...guideData.stats,
      restaurantsAvailable: restaurantCount || guideData.stats.restaurantsAvailable
    };
    
    const { error } = await supabase
      .from('restaurant_guides')
      .upsert({
        destination_id: destination.id,
        category_slug: category.slug,
        category_name: category.name,
        title: guideData.title,
        subtitle: guideData.subtitle,
        hero_image: destination.imageUrl || null,
        stats: stats,
        introduction: guideData.introduction,
        seo: guideData.seo,
        why_choose: guideData.whyChoose,
        what_to_expect: guideData.whatToExpect,
        expert_tips: guideData.expertTips,
        faqs: guideData.faqs,
        filter_criteria: filterCriteria,
        updated_at: new Date().toISOString()
      }, {
        onConflict: 'destination_id,category_slug'
      });
    
    if (error) {
      throw error;
    }
    
    return true;
  } catch (error) {
    console.error('Error saving guide to database:', error.message);
    return false;
  }
}

// Main generation function
async function generateGuidesForDestination(destination) {
  console.log(`\n🎯 Generating restaurant guides for ${destination.fullName || destination.name}...`);
  
  const results = [];
  
  for (const category of RESTAURANT_GUIDE_CATEGORIES) {
    console.log(`   📝 Generating: ${category.name}...`);
    
    const guide = await generateGuideWithGemini(destination, category);
    
    if (guide) {
      const saved = await saveGuideToDatabase(destination, category, guide, category.filterCriteria);
      if (saved) {
        console.log(`   ✅ Generated and saved: ${category.name}`);
        results.push({ category: category.name, success: true });
      } else {
        console.log(`   ❌ Failed to save: ${category.name}`);
        results.push({ category: category.name, success: false });
      }
      
      // Add delay to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 2000));
    } else {
      console.log(`   ❌ Failed to generate: ${category.name}`);
      results.push({ category: category.name, success: false });
    }
  }
  
  return results;
}

// Main execution
async function main() {
  console.log('\n🚀 STARTING RESTAURANT GUIDE GENERATION\n');
  console.log('━'.repeat(60));
  
  // Get destination ID from command line or use test destination
  const destinationId = process.argv[2] || 'aruba';
  const destination = destinations.find(d => d.id === destinationId);
  
  if (!destination) {
    console.error(`❌ Destination "${destinationId}" not found`);
    process.exit(1);
  }
  
  console.log(`\n🧪 GENERATING GUIDES FOR: ${destination.fullName || destination.name}\n`);
  
  const results = await generateGuidesForDestination(destination);
  
  const successCount = results.filter(r => r.success).length;
  const failCount = results.filter(r => !r.success).length;
  
  console.log('\n━'.repeat(60));
  console.log(`\n✅ GENERATION COMPLETE!`);
  console.log(`📊 Success: ${successCount}/${results.length}`);
  console.log(`❌ Failed: ${failCount}/${results.length}`);
  console.log(`\n👀 NEXT STEPS:`);
  console.log(`   1. Check database for generated guides`);
  console.log(`   2. Test pages at /destinations/${destinationId}/restaurants/guides/[category]`);
  console.log(`   3. Review content quality and make adjustments if needed`);
}

// Run the script
main().catch(error => {
  console.error('\n❌ FATAL ERROR:', error);
  process.exit(1);
});

