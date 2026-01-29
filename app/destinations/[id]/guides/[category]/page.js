import { destinations } from '../../../../../src/data/destinationsData';
import CategoryGuideClient from './CategoryGuideClient';
import { notFound, redirect } from 'next/navigation';
import { getPromotionScoresByDestination } from '@/lib/promotionSystem';
import { createSupabaseServiceRoleClient } from '@/lib/supabaseClient';
import { getDestinationFullContent } from '@/data/destinationFullContent';
import { getAllCategoryGuidesForDestination } from '@/lib/categoryGuides';
import { getDestinationFeatures } from '@/lib/destinationFeatures';
import { slugToViatorId as slugToViatorIdMap } from '@/data/viatorDestinationMap';

// Revalidate every 24 hours - page-level cache (not API JSON cache, so Viator compliant)
export const revalidate = 604800; // 7 days - increased to reduce ISR writes during Google reindexing

// Function to fetch all guides for a destination from database
// NOTE: This function is no longer used - we use getAllCategoryGuidesForDestination instead
// Keeping it for backward compatibility but it's deprecated
async function getAllGuidesFromDatabase(destinationId) {
  try {
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
      return [];
    }
    
    const supabase = createSupabaseServiceRoleClient();
    const { data, error } = await supabase
      .from('category_guides')
      .select('category_slug, category_name')
      .eq('destination_id', destinationId);
    
    if (error) {
      if (error.code === 'PGRST116') {
        return [];
      }
      return [];
    }
    
    return (data || []).map(g => g.category_slug);
  } catch (error) {
    return [];
  }
}

// Function to fetch guide from database
// Normalize slug: convert special characters to ASCII (e.g., "banús" -> "banus")
function normalizeSlug(slug) {
  if (!slug) return '';
  return String(slug)
    .toLowerCase()
    .trim()
    .normalize('NFD') // Decompose characters (ú -> u + combining mark)
    .replace(/[\u0300-\u036f]/g, '') // Remove combining diacritical marks
    .replace(/[^\w\s-]/g, '') // Remove any remaining special characters
    .replace(/\s+/g, '-') // Replace spaces with hyphens
    .replace(/-+/g, '-') // Replace multiple hyphens with single hyphen
    .replace(/^-|-$/g, ''); // Remove leading/trailing hyphens
}

async function getGuideFromDatabase(destinationId, categorySlug) {
  try {
    // Only try database if we have the required env vars
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
      return null;
    }
    
    // Normalize both destination ID and category slug to handle special characters
    const normalizedDestinationId = normalizeSlug(destinationId);
    const normalizedCategorySlug = normalizeSlug(categorySlug);
    
    const supabase = createSupabaseServiceRoleClient();
    
    // Try exact match first (in case slug is stored with special characters)
    let { data, error } = await supabase
      .from('category_guides')
      .select('*')
      .eq('destination_id', normalizedDestinationId)
      .eq('category_slug', normalizedCategorySlug)
      .single();
    
    // If not found with normalized slug, try original slug (might be stored with special chars)
    if (error && error.code === 'PGRST116') {
      const { data: data2, error: error2 } = await supabase
        .from('category_guides')
        .select('*')
        .eq('destination_id', destinationId) // Try original destination ID too
        .eq('category_slug', categorySlug) // Try original category slug
        .single();
      
      if (!error2 && data2) {
        data = data2;
        error = null;
      } else {
        // Try with normalized destination but original category slug
        const { data: data3, error: error3 } = await supabase
          .from('category_guides')
          .select('*')
          .eq('destination_id', normalizedDestinationId)
          .eq('category_slug', categorySlug)
          .single();
        
        if (!error3 && data3) {
          data = data3;
          error = null;
        }
      }
    }
    
    if (error) {
      // PGRST116 means no rows found - this is expected for guides not in database
      if (error.code === 'PGRST116') {
        return null;
      }
      // Other errors - log but don't throw
      console.warn(`Database error for ${destinationId}/${categorySlug}:`, error.message);
      return null;
    }
    
    if (!data) {
      return null;
    }
    
    // Mark that this came from database
    console.log(`✅ [DATABASE] Found guide for ${destinationId}/${categorySlug} in database`);
    console.log(`📊 [DATABASE] Guide title: ${data.title || 'N/A'}`);
    
    // Convert database format to frontend format
    // Parse JSON strings if they're strings (Supabase returns JSONB as objects, but sometimes as strings)
    let stats = data.stats;
    if (typeof stats === 'string') {
      try {
        stats = JSON.parse(stats);
      } catch (e) {
        stats = {};
      }
    }
    
    let seo = data.seo;
    if (typeof seo === 'string') {
      try {
        seo = JSON.parse(seo);
      } catch (e) {
        seo = {};
      }
    }
    
    let whyChoose = data.why_choose;
    if (typeof whyChoose === 'string') {
      try {
        whyChoose = JSON.parse(whyChoose);
      } catch (e) {
        whyChoose = [];
      }
    }
    
    let tourTypes = data.tour_types;
    if (typeof tourTypes === 'string') {
      try {
        tourTypes = JSON.parse(tourTypes);
      } catch (e) {
        tourTypes = [];
      }
    }
    
    let whatToExpect = data.what_to_expect;
    if (typeof whatToExpect === 'string') {
      try {
        whatToExpect = JSON.parse(whatToExpect);
      } catch (e) {
        whatToExpect = {};
      }
    }
    
    let faqs = data.faqs;
    if (typeof faqs === 'string') {
      try {
        faqs = JSON.parse(faqs);
      } catch (e) {
        faqs = [];
      }
    }
    
    return {
      title: data.title,
      subtitle: data.subtitle,
      categoryName: data.category_name,
      heroImage: data.hero_image,
      stats: stats || {},
      introduction: data.introduction,
      seo: seo || {},
      whyChoose: whyChoose || [],
      tourTypes: tourTypes || [],
      whatToExpect: whatToExpect || {},
      expertTips: Array.isArray(data.expert_tips) ? data.expert_tips : [],
      faqs: faqs || [],
    };
  } catch (error) {
    // Silently fail - fallback to JSON files
    return null;
  }
}

// Generate metadata for SEO
export async function generateMetadata({ params }) {
  try {
    const { id: destinationId, category: categorySlug } = await params;
    
    // Try database first, then JSON files
    let guideData = await getGuideFromDatabase(destinationId, categorySlug);
    let destination = destinations.find(d => d.id === destinationId);
    
    // If not in destinationsData.js, check generated content (JSON files)
    if (!destination) {
      try {
        const fullContent = getDestinationFullContent(destinationId);
        if (fullContent && fullContent.destinationName) {
          destination = {
            id: destinationId,
            name: fullContent.destinationName,
            fullName: fullContent.destinationName,
            imageUrl: fullContent.imageUrl || null,
          };
        }
      } catch (error) {
        // Silently continue
      }
    }
    
    // Try database lookups (for 3,382+ destinations not in static/JSON files)
    if (!destination) {
      // Check if id is a Viator destination ID (numeric or starts with 'd')
      if (/^d?\d+$/.test(destinationId)) {
        const viatorDestinationId = destinationId.startsWith('d') ? destinationId.replace(/^d/i, '') : destinationId;
        try {
          const { getViatorDestinationById } = await import('@/lib/supabaseCache');
          const destInfo = await getViatorDestinationById(viatorDestinationId);
          if (destInfo && destInfo.name) {
            destination = {
              id: destinationId,
              name: destInfo.name,
              fullName: destInfo.name,
              imageUrl: null,
            };
          }
        } catch (error) {
          // Continue with fallback
        }
      }
      
      // Try slug lookup using database (same as destination page)
      if (!destination) {
        try {
          const { getViatorDestinationBySlug } = await import('@/lib/supabaseCache');
          const destInfo = await getViatorDestinationBySlug(destinationId);
          if (destInfo && destInfo.name) {
            destination = {
              id: destinationId,
              name: destInfo.name,
              fullName: destInfo.name,
              imageUrl: null,
            };
          }
        } catch (error) {
          // Continue
        }
      }
    }
    
    // If we have guide data but no destination, create minimal destination (last resort)
    if (guideData && !destination) {
      const destinationName = destinationId.charAt(0).toUpperCase() + destinationId.slice(1).replace(/-/g, ' ');
      destination = {
        id: destinationId,
        name: destinationName,
        fullName: destinationName,
        imageUrl: guideData.heroImage || null,
      };
    }
    
    if (!destination || !guideData) {
      return {
        title: 'Guide Not Found',
        robots: {
          index: false,
          follow: false,
          noindex: true,
          nofollow: true,
        },
      };
    }

    // Use guide heroImage if available, otherwise destination imageUrl, otherwise fallback to category-specific default
    const TRAVEL_GUIDE_OG_IMAGE = 'https://ouqeoizufbofdqbuiwvx.supabase.co/storage/v1/object/public/blogs/travel%20guides.png';
    const AIRPORT_TRANSFERS_OG_IMAGE = 'https://ouqeoizufbofdqbuiwvx.supabase.co/storage/v1/object/public/blogs/airport%20transfers.png';
    const defaultOgImage = categorySlug === 'airport-transfers' ? AIRPORT_TRANSFERS_OG_IMAGE : TRAVEL_GUIDE_OG_IMAGE;
    const ogImage = guideData.heroImage || destination.imageUrl || defaultOgImage;
    const seo = guideData.seo || {};

    return {
      title: seo.title || guideData.title,
      description: seo.description || guideData.subtitle,
      keywords: seo.keywords || '',
      openGraph: {
        title: seo.title || guideData.title,
        description: seo.description || guideData.subtitle,
        url: `https://toptours.ai/destinations/${destinationId}/guides/${categorySlug}`,
        images: [
          {
            url: ogImage,
            width: 1200,
            height: 630,
            alt: `${guideData.title} - ${destination.fullName || destination.name}`,
          },
        ],
        type: 'article',
        siteName: 'TopTours.ai',
        locale: 'en_US',
      },
      twitter: {
        card: 'summary_large_image',
        title: seo.title || guideData.title,
        description: seo.description || guideData.subtitle,
        images: [ogImage],
      },
      alternates: {
        canonical: `https://toptours.ai/destinations/${destinationId}/guides/${categorySlug}`,
      },
      robots: {
        index: true,
        follow: true,
        googleBot: {
          index: true,
          follow: true,
          'max-video-preview': -1,
          'max-image-preview': 'large',
          'max-snippet': -1,
        },
      },
    };
  } catch (error) {
    console.error('Error in generateMetadata:', error);
    return {
      title: 'Guide Not Found',
      robots: {
        index: false,
        follow: false,
        noindex: true,
        nofollow: true,
      },
    };
  }
}

// Note: We're using dynamic rendering, so we don't generate static params
// All guides (both from database and JSON) are handled dynamically
// This allows us to serve guides from the database without rebuilding

export default async function CategoryGuidePage({ params }) {
  try {
    const { id: destinationId, category: categorySlug } = await params;
    
    // Check if category slug needs normalization (has special characters)
    // Normalize the slug and compare - if different, redirect to normalized version
    const normalizedCategorySlug = normalizeSlug(categorySlug);
    const originalLower = categorySlug.toLowerCase().trim();
    
    // If normalization changed the slug (e.g., "banús" -> "banus"), redirect
    // This handles URLs with special characters like "ban%C3%BAs" (URL-encoded "banús")
    // Only redirect if the normalized version is actually different
    if (normalizedCategorySlug && normalizedCategorySlug !== originalLower) {
      // Redirect to normalized version
      // Note: redirect() throws NEXT_REDIRECT error which is expected - Next.js catches it
      redirect(`/destinations/${destinationId}/guides/${normalizedCategorySlug}`);
    }
    
    // STEP 1: Get guide data from database (all guides are now in the database)
    let guideData = await getGuideFromDatabase(destinationId, categorySlug);
    let guideSource = 'database';
    
    if (!guideData) {
      console.log(`⚠️ [SERVER] No guide found in database for ${destinationId}/${categorySlug}`);
    } else {
      console.log(`✅ [SERVER] Found guide in database for ${destinationId}/${categorySlug}`);
    }
    
    // STEP 2: Try to get destination (destinationsData.js first, then generated content)
    let destination = destinations.find(d => d.id === destinationId);
    
    if (!destination) {
      try {
        const fullContent = getDestinationFullContent(destinationId);
        if (fullContent && fullContent.destinationName) {
          // Use FULL destination data from generated content - this has all the data we need!
          destination = {
            id: destinationId,
            name: fullContent.destinationName,
            fullName: fullContent.destinationName,
            imageUrl: fullContent.imageUrl || null,
            country: fullContent.country || null,
            category: fullContent.region || null,
            tourCategories: fullContent.tourCategories || [],
            bestTimeToVisit: fullContent.bestTimeToVisit || null,
            gettingAround: fullContent.gettingAround || null,
            whyVisit: fullContent.whyVisit || [],
            highlights: fullContent.highlights || [],
            briefDescription: fullContent.briefDescription || null,
            heroDescription: fullContent.heroDescription || null,
            seo: fullContent.seo || null,
          };
          console.log(`✅ Found full destination data from generated content: ${destinationId} -> ${destination.name}`);
        }
      } catch (error) {
        console.warn(`Error getting destination full content for ${destinationId}:`, error.message);
      }
    }
    
    // STEP 3: If still no destination but we have guide data, create minimal destination
    // This should rarely happen if generated content exists
    if (!destination && guideData) {
      // Extract destination name from guide's category name
      let destinationName = 'Destination';
      if (guideData.categoryName) {
        const parts = guideData.categoryName.split(' ');
        // Usually first word is destination (e.g., "Malaga Food & Tapas" -> "Malaga")
        destinationName = parts[0];
      } else {
        // Fallback: capitalize slug
        destinationName = destinationId.charAt(0).toUpperCase() + destinationId.slice(1).replace(/-/g, ' ');
      }
      
      destination = {
        id: destinationId,
        name: destinationName,
        fullName: destinationName,
        imageUrl: guideData.heroImage || null,
        country: null,
        category: null,
        tourCategories: [], // Empty array to prevent errors
        bestTimeToVisit: null, // Will be handled with optional chaining in component
        gettingAround: null,
        whyVisit: [],
        highlights: [],
      };
      console.log(`⚠️ Created minimal destination for ${destinationId}: ${destinationName} (no generated content found)`);
    }
    
    // Special case: airport-transfers - create default guide if not in database
    if (!guideData && categorySlug === 'airport-transfers') {
      const destinationName = destination?.fullName || destination?.name || 'Destination';
      guideData = {
        title: `${destinationName} Airport Transfers`,
        subtitle: `Find reliable airport transfer services to and from ${destinationName}. Compare shared and private transfers, book in advance, and start your trip stress-free.`,
        categoryName: 'Airport Transfers',
        heroImage: destination?.imageUrl || null,
        stats: {},
        introduction: `Planning your arrival or departure? Book your airport transfer in advance for a smooth start to your ${destinationName} adventure.`,
        seo: {
          title: `${destinationName} Airport Transfer: Shared & Private Transfers`,
          description: `Book reliable airport transfers to and from ${destinationName}. Compare shared and private transfer options, prices, and durations.`,
          keywords: `airport transfer, airport shuttle, airport taxi, private transfer, shared transfer, ${destinationName} airport`
        },
        whyChoose: [
          'Pre-booked transfers for peace of mind',
          'Compare shared and private options',
          'Fixed prices, no surprises',
          'Meet and greet service available'
        ],
        tourTypes: [],
        whatToExpect: {
          items: [
            {
              icon: 'Clock',
              title: 'Duration',
              description: 'Transfer times typically range from 30-60 minutes depending on traffic and distance'
            },
            {
              icon: 'Users',
              title: 'Group Size',
              description: 'Choose between private transfers (1-8 people) or shared transfers (multiple passengers)'
            },
            {
              icon: 'DollarSign',
              title: 'Pricing',
              description: 'Fixed prices with no hidden fees. Shared transfers are more economical, private transfers offer exclusivity'
            },
            {
              icon: 'MapPin',
              title: 'Pickup Location',
              description: 'Meet at the airport terminal or hotel lobby. Some services offer meet-and-greet at arrivals'
            }
          ]
        },
        expertTips: [
          'Book in advance for better prices and availability',
          'Private transfers offer more flexibility and comfort',
          'Shared transfers are more budget-friendly',
          'Check if your hotel offers transfer services'
        ],
        faqs: [
          {
            question: `How do I get from the airport to ${destinationName}?`,
            answer: `You can book a private or shared transfer in advance, take a taxi, or use public transportation. Pre-booking a transfer ensures a smooth arrival with fixed pricing.`
          },
          {
            question: 'What is the difference between shared and private transfers?',
            answer: 'Shared transfers are more economical and may include stops at multiple hotels. Private transfers offer direct service to your destination with more flexibility and comfort.'
          },
          {
            question: 'How long does an airport transfer take?',
            answer: 'Transfer times vary by destination and traffic. Most transfers take 30-60 minutes, but this can vary. Check the specific transfer details when booking.'
          }
        ]
      };
      guideSource = 'default';
      console.log(`✅ [SERVER] Created default airport transfers guide for ${destinationId}`);
    }
    
    // Final check
    if (!destination || !guideData) {
      console.error(`❌ Cannot render page: destination=${!!destination}, guideData=${!!guideData}`);
      notFound();
    }
    
    console.log(`✅ Rendering guide: ${destination.name} - ${guideData.title}`);
    console.log(`📊 GUIDE SOURCE: ${guideSource.toUpperCase()} ${guideSource === 'database' ? '✅ (from database - migrated)' : '⚠️ (from hardcoded JSON - not migrated)'}`);
    console.log('Guide data structure:', {
      hasTitle: !!guideData.title,
      hasSubtitle: !!guideData.subtitle,
      hasSeo: !!guideData.seo,
      hasStats: !!guideData.stats,
      hasWhyChoose: Array.isArray(guideData.whyChoose),
      hasTourTypes: Array.isArray(guideData.tourTypes),
      hasFaqs: Array.isArray(guideData.faqs),
    });

  // Get all available guides for this destination using the same function as destination detail page
  // This handles both database guides (for 3200+ destinations) and hardcoded guides (for 182 destinations)
  let allAvailableGuides = [];
  try {
    allAvailableGuides = await getAllCategoryGuidesForDestination(destinationId);
  } catch (error) {
    console.error('Error fetching category guides for guide page:', error);
    // Fallback to empty array
    allAvailableGuides = [];
  }
  
  // Also create slugs array for backward compatibility
  const allAvailableGuideSlugs = allAvailableGuides.map(g => g.category_slug).filter(Boolean);

  // Fetch destination features (lightweight checks for sticky nav)
  const features = await getDestinationFeatures(destinationId);

  // Fetch tours from Viator API using destination ID and category name (same as database guides)
  // This replaces the hardcoded tours approach - always use live API calls
  let categoryTours = [];
    try {
      // Get Viator destination ID - CRITICAL: Use database as source of truth (same as tours page)
      const { getViatorDestinationBySlug } = await import('@/lib/supabaseCache');
      
      // Try database lookup first (same as tours page line 390-392)
      let viatorDestinationId = null;
      const dbDestination = await getViatorDestinationBySlug(destinationId);
      if (dbDestination && dbDestination.id) {
        viatorDestinationId = dbDestination.id.toString();
        console.log(`🔍 Guide Page - Destination "${destinationId}": Using database ID = ${viatorDestinationId} (name: ${dbDestination.name})`);
      } else {
        // Fallback to hardcoded map or destination.destinationId
        viatorDestinationId = slugToViatorIdMap[destinationId] || destination.destinationId || null;
        if (viatorDestinationId) {
          console.log(`⚠️ Guide Page - Destination "${destinationId}": Database lookup failed, using fallback = ${viatorDestinationId}`);
        }
      }
      
    // Build search term: extract just the activity type from category name
    // Special handling for airport-transfers: use "airport transfers" as search term
    let searchTerm = '';
    
    if (categorySlug === 'airport-transfers') {
      // Special case: airport transfers page
      searchTerm = 'airport transfers';
    } else {
      // Default: extract from category name
      searchTerm = guideData.categoryName || '';
      
      // Remove destination name from the beginning of the category name
      if (searchTerm && destination) {
        const destinationName = destination.fullName || destination.name || '';
        // Remove destination name if it appears at the start (case-insensitive)
        const destinationPrefix = new RegExp(`^${destinationName}\\s+`, 'i');
        searchTerm = searchTerm.replace(destinationPrefix, '').trim();
      }
      
      // Remove common activity suffixes for better Viator API matching
      // "adventure tours" -> "adventure", "catamaran cruises" -> "catamaran", "puerto banus experiences" -> "puerto banus"
      const commonSuffixes = ['tours', 'tour', 'cruises', 'cruise', 'sailing', 'sail', 'tours & activities', 'activities', 'experiences', 'experience', 'trails', 'trail'];
      for (const suffix of commonSuffixes) {
        const suffixRegex = new RegExp(`\\s+${suffix}\\s*$`, 'i');
        searchTerm = searchTerm.replace(suffixRegex, '').trim();
      }
      
      // Convert to lowercase for better matching (same as AI chat search)
      searchTerm = searchTerm.toLowerCase();
    }
    
    // Determine max tours to fetch - increased to show more results (was 8, now 15)
    const maxTours = 15;
      
    // Call Viator API search endpoint directly (same as database guides)
      const apiKey = process.env.VIATOR_API_KEY;
    if (apiKey && viatorDestinationId) {
        const requestBody = {
          searchTerm: searchTerm.trim(),
          searchTypes: [{
            searchType: 'PRODUCTS',
            pagination: {
              start: 1,
            count: maxTours
            }
          }],
        productFiltering: {
          destination: viatorDestinationId.toString() // Filter by destination ID
        },
        productSorting: {
          sort: 'DEFAULT', // Sort by relevancy (best matches first) - order field must be omitted for DEFAULT
        },
          currency: 'USD'
        };
      
      console.log(`🔍 [SERVER] Fetching tours for ${destinationId}: searchTerm="${searchTerm}", destinationId=${viatorDestinationId}`);
        
        const viatorResponse = await fetch('https://api.viator.com/partner/search/freetext', {
          method: 'POST',
          headers: {
            'exp-api-key': apiKey,
            'Accept': 'application/json;version=2.0',
            'Accept-Language': 'en-US',
            'Content-Type': 'application/json'
          },
        body: JSON.stringify(requestBody),
        next: { revalidate: 86400 } // Cache for 24 hours - reduced to cut costs
        });
        
        if (viatorResponse.ok) {
          const viatorData = await viatorResponse.json();
          const products = viatorData.products?.results || [];
        const totalCount = viatorData.products?.totalCount || 0;
        
        console.log(`🔍 [SERVER] Viator API response: ${products.length} products, totalCount: ${totalCount}`);
          
        // Pass full tour objects from Viator API (TourCard expects full structure)
        categoryTours = products.slice(0, maxTours).map(tour => ({
          ...tour, // Include all fields from Viator API
          productId: tour.productCode || tour.productId,
          productCode: tour.productCode || tour.productId,
        }));
        
        console.log(`✅ Fetched ${categoryTours.length} live tours for ${destinationId}/${guideData.categoryName} from Viator API (destination ID: ${viatorDestinationId}, searchTerm: "${searchTerm}")`);
        
        // If no results with destination filter, try without filter (broader search)
        if (categoryTours.length === 0 && searchTerm) {
          console.log(`🔍 [SERVER] No results with destination filter, trying broader search: "${destination.fullName || destination.name} ${searchTerm}"`);
          const fallbackRequestBody = {
            searchTerm: `${destination.fullName || destination.name} ${searchTerm}`.trim(),
            searchTypes: [{
              searchType: 'PRODUCTS',
              pagination: {
                start: 1,
                count: maxTours
              }
            }],
            productSorting: {
              sort: 'DEFAULT', // Sort by relevancy (best matches first) - order field must be omitted for DEFAULT
            },
            currency: 'USD'
          };
          
          const fallbackResponse = await fetch('https://api.viator.com/partner/search/freetext', {
            method: 'POST',
            headers: {
              'exp-api-key': apiKey,
              'Accept': 'application/json;version=2.0',
              'Accept-Language': 'en-US',
              'Content-Type': 'application/json'
            },
            body: JSON.stringify(fallbackRequestBody),
            next: { revalidate: 3600 }
          });
          
          if (fallbackResponse.ok) {
            const fallbackData = await fallbackResponse.json();
            const fallbackProducts = fallbackData.products?.results || [];
            console.log(`🔍 [SERVER] Fallback search returned ${fallbackProducts.length} products`);
            
            // Pass full tour objects from Viator API (TourCard expects full structure)
            categoryTours = fallbackProducts.slice(0, maxTours).map(tour => ({
              ...tour, // Include all fields from Viator API
              productId: tour.productCode || tour.productId,
              productCode: tour.productCode || tour.productId,
            }));
            
            console.log(`✅ Fallback search fetched ${categoryTours.length} tours`);
          }
        }
      } else {
        const errorText = await viatorResponse.text().catch(() => '');
        console.warn(`⚠️ Viator API search failed for ${destinationId}/${guideData.categoryName}: ${viatorResponse.status} - ${errorText.substring(0, 200)}`);
      }
    } else if (!viatorDestinationId) {
      console.warn(`⚠️ No Viator destination ID found for ${destinationId}, cannot fetch live tours`);
      }
    } catch (error) {
      console.error('Error fetching tours from Viator API for category guide:', error);
      // Continue with empty array if API call fails
      categoryTours = [];
  }
  
  // Fetch promotion scores for these tours
  const promotionScores = await getPromotionScoresByDestination(destinationId);

  // OG image: airport-transfers use dedicated image; other guides use travel guide OG
  const TRAVEL_GUIDE_OG_IMAGE = 'https://ouqeoizufbofdqbuiwvx.supabase.co/storage/v1/object/public/blogs/travel%20guides.png';
  const AIRPORT_TRANSFERS_OG_IMAGE = 'https://ouqeoizufbofdqbuiwvx.supabase.co/storage/v1/object/public/blogs/airport%20transfers.png';
  const categoryOgImage = categorySlug === 'airport-transfers' ? AIRPORT_TRANSFERS_OG_IMAGE : TRAVEL_GUIDE_OG_IMAGE;
  const schemaImage = categorySlug === 'airport-transfers' ? AIRPORT_TRANSFERS_OG_IMAGE : (guideData.heroImage || destination.imageUrl);
  const pageUrl = `https://toptours.ai/destinations/${destinationId}/guides/${categorySlug}`;

  // JSON-LD Schema for SEO: WebPage, Article, FAQPage, BreadcrumbList, TouristAttraction, ItemList(s)
  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'WebPage',
        '@id': `${pageUrl}#webpage`,
        url: pageUrl,
        name: guideData.title,
        description: guideData.subtitle || guideData.seo?.description,
        primaryImageOfPage: {
          '@type': 'ImageObject',
          url: categoryOgImage,
          width: 1200,
          height: 630,
        },
        isPartOf: { '@type': 'WebSite', '@id': 'https://toptours.ai/#website', name: 'TopTours.ai', url: 'https://toptours.ai' },
        publisher: { '@type': 'Organization', name: 'TopTours.ai', logo: { '@type': 'ImageObject', url: 'https://toptours.ai/logo.png' } },
      },
      {
        '@type': 'Article',
        headline: guideData.title,
        description: guideData.subtitle,
        image: schemaImage,
        author: {
          '@type': 'Organization',
          name: 'TopTours AI',
        },
        publisher: {
          '@type': 'Organization',
          name: 'TopTours AI',
          logo: {
            '@type': 'ImageObject',
            url: 'https://toptours.ai/logo.png',
          },
        },
        datePublished: '2025-12-31',
        dateModified: '2025-12-31',
      },
      {
        '@type': 'FAQPage',
        mainEntity: (guideData.faqs || []).map(faq => ({
          '@type': 'Question',
          name: faq.question,
          acceptedAnswer: {
            '@type': 'Answer',
            text: faq.answer,
          },
        })),
      },
      {
        '@type': 'BreadcrumbList',
        itemListElement: [
          {
            '@type': 'ListItem',
            position: 1,
            name: 'Home',
            item: 'https://toptours.ai',
          },
          {
            '@type': 'ListItem',
            position: 2,
            name: 'Destinations',
            item: 'https://toptours.ai/destinations',
          },
          {
            '@type': 'ListItem',
            position: 3,
            name: destination.name,
            item: `https://toptours.ai/destinations/${destinationId}`,
          },
          {
            '@type': 'ListItem',
            position: 4,
            name: guideData.title,
            item: `https://toptours.ai/destinations/${destinationId}/guides/${categorySlug}`,
          },
        ],
      },
      {
        '@type': 'TouristAttraction',
        name: `${guideData.categoryName} in ${destination.name}`,
        description: guideData.subtitle,
        image: schemaImage,
        ...(destination.category ? { address: { '@type': 'PostalAddress', addressCountry: destination.category } } : {}),
      },
      // Tour List Schema - Featured tours for this category (max 8 tours)
      ...(categoryTours && categoryTours.length > 0 ? [{
        '@type': 'ItemList',
        name: `${guideData.categoryName} Tours in ${destination.name}`,
        description: `Featured ${guideData.categoryName.toLowerCase()} tours and activities in ${destination.name}`,
        numberOfItems: categoryTours.length,
        itemListElement: categoryTours.slice(0, 8).map((tour, index) => ({
          '@type': 'ListItem',
          position: index + 1,
          item: {
            '@type': 'TouristAttraction',
            name: tour.title,
            description: `${tour.title} - ${guideData.categoryName} in ${destination.name}`,
            image: tour.image || guideData.heroImage || destination.imageUrl,
            url: `https://toptours.ai/tours/${tour.productId}/${tour.title.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`
          }
        }))
      }] : []),
      // Related Travel Guides List Schema - Other category guides for this destination
      ...(allAvailableGuides && allAvailableGuides.length > 0 ? [{
        '@type': 'ItemList',
        name: `Related Travel Guides for ${destination.name}`,
        description: `Explore comprehensive guides to plan your perfect trip to ${destination.name}, including other popular tour categories and travel experiences`,
        numberOfItems: Math.min(allAvailableGuides.length, 6), // Max 6 related guides shown
        itemListElement: allAvailableGuides
          .filter(guide => guide.category_slug !== categorySlug) // Exclude current guide
          .slice(0, 6) // Show up to 6 other guides
          .map((guide, index) => ({
            '@type': 'ListItem',
            position: index + 1,
            item: {
              '@type': 'Article',
              '@id': `https://toptours.ai/destinations/${destinationId}/guides/${guide.category_slug}`,
              name: guide.title || guide.category_name,
              description: guide.subtitle || `Discover ${guide.category_name} in ${destination.name}`,
              image: guide.hero_image || destination.imageUrl,
              url: `https://toptours.ai/destinations/${destinationId}/guides/${guide.category_slug}`
          }
        }))
      }] : []),
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <CategoryGuideClient 
        destinationId={destinationId} 
        categorySlug={categorySlug}
        guideData={guideData}
        categoryTours={categoryTours}
        promotionScores={promotionScores}
        availableGuideSlugs={allAvailableGuideSlugs}
        allAvailableGuides={allAvailableGuides}
        destinationFeatures={features}
        destination={{
          id: destination.id,
          name: destination.name,
          fullName: destination.fullName || destination.name,
          imageUrl: destination.imageUrl || null,
          country: destination.country || null,
          category: destination.category || null,
          tourCategories: destination.tourCategories || [],
          bestTimeToVisit: destination.bestTimeToVisit || null,
          gettingAround: destination.gettingAround || null,
          whyVisit: destination.whyVisit || [],
          highlights: destination.highlights || [],
          briefDescription: destination.briefDescription || null,
          heroDescription: destination.heroDescription || null,
          seo: destination.seo || null,
        }}
      />
    </>
  );
  } catch (error) {
    console.error('Error in CategoryGuidePage:', error);
    notFound();
  }
}


