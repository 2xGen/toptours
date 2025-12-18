import { destinations } from '../../../../../src/data/destinationsData';
import CategoryGuideClient from './CategoryGuideClient';
import { notFound } from 'next/navigation';
import { getPromotionScoresByDestination } from '@/lib/promotionSystem';
import { createSupabaseServiceRoleClient } from '@/lib/supabaseClient';
import { getDestinationFullContent } from '@/data/destinationFullContent';
import { getAllCategoryGuidesForDestination } from '@/lib/categoryGuides';

// Force dynamic rendering since we're querying the database
export const dynamic = 'force-dynamic';

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
async function getGuideFromDatabase(destinationId, categorySlug) {
  try {
    // Only try database if we have the required env vars
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
      return null;
    }
    
    const supabase = createSupabaseServiceRoleClient();
    const { data, error } = await supabase
      .from('category_guides')
      .select('*')
      .eq('destination_id', destinationId)
      .eq('category_slug', categorySlug)
      .single();
    
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
    
    // If not in destinationsData.js, check generated content
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
    
    // All guides are now in the database - no hardcoded fallback
    
    // If we have guide data but no destination, create minimal destination
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
      };
    }

    // Always use standardized OG image so dimensions are correct
    const defaultOgImage = 'https://toptours.ai/OG%20Images/TopTours%20Travel%20Guides.jpg';
    const ogImage = defaultOgImage;
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
  };
  } catch (error) {
    console.error('Error in generateMetadata:', error);
    return {
      title: 'Guide Not Found',
    };
  }
}

// Note: We're using dynamic rendering, so we don't generate static params
// All guides (both from database and JSON) are handled dynamically
// This allows us to serve guides from the database without rebuilding

export default async function CategoryGuidePage({ params }) {
  try {
    const { id: destinationId, category: categorySlug } = await params;
    
    // STEP 1: Get guide data from database (all guides are now in the database)
    let guideData = await getGuideFromDatabase(destinationId, categorySlug);
    let guideSource = 'database';
    
    if (!guideData) {
      console.log(`⚠️ [SERVER] No guide found in database for ${destinationId}/${categorySlug}`);
    } else {
      console.log(`✅ [SERVER] Found guide in database for ${destinationId}/${categorySlug}`);
    }
    
    // If no guide data at all, show not found
    if (!guideData) {
      console.error(`❌ No guide data found for ${destinationId}/${categorySlug}`);
      notFound();
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

  // Fetch tours from Viator API using destination ID and category name (same as database guides)
  // This replaces the hardcoded tours approach - always use live API calls
  let categoryTours = [];
    try {
      // Get Viator destination ID
      const { slugToViatorId } = await import('@/data/viatorDestinationMap');
    const viatorDestinationId = slugToViatorId[destinationId] || destination.destinationId || null;
      
    // Build search term: just the category name (destination ID filter handles the destination)
    // Example: "Historic District Tours" instead of "Amsterdam Historic District Tours"
    const searchTerm = guideData.categoryName || '';
    
    // Determine max tours to fetch (same as database guides - 8 tours)
    const maxTours = 8;
      
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
        next: { revalidate: 3600 } // Cache for 1 hour
        });
        
        if (viatorResponse.ok) {
          const viatorData = await viatorResponse.json();
          const products = viatorData.products?.results || [];
        const totalCount = viatorData.products?.totalCount || 0;
        
        console.log(`🔍 [SERVER] Viator API response: ${products.length} products, totalCount: ${totalCount}`);
          
        // Format tours to match expected structure (same as hardcoded tours)
        categoryTours = products.slice(0, maxTours).map(tour => ({
          productId: tour.productCode || tour.productId,
          title: tour.title,
          image: tour.images?.[0]?.variants?.[3]?.url || tour.images?.[0]?.variants?.[0]?.url || null,
          price: tour.price?.formattedAmount || tour.price?.amount || null,
          rating: tour.reviews?.combinedAverageRating || null,
          reviewCount: tour.reviews?.totalReviews || 0,
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
            
            categoryTours = fallbackProducts.slice(0, maxTours).map(tour => ({
            productId: tour.productCode || tour.productId,
            title: tour.title,
            image: tour.images?.[0]?.variants?.[3]?.url || tour.images?.[0]?.variants?.[0]?.url || null,
              price: tour.price?.formattedAmount || tour.price?.amount || null,
              rating: tour.reviews?.combinedAverageRating || null,
              reviewCount: tour.reviews?.totalReviews || 0,
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

  // JSON-LD Schema for SEO
  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'Article',
        headline: guideData.title,
        description: guideData.subtitle,
        image: guideData.heroImage || destination.imageUrl,
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
        datePublished: '2025-10-10',
        dateModified: '2025-10-10',
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
        image: guideData.heroImage || destination.imageUrl,
        address: {
          '@type': 'PostalAddress',
          addressCountry: destination.category,
        },
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


