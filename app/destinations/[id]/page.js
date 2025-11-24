import { getDestinationById } from '@/data/destinationsData';
import DestinationDetailClient from './DestinationDetailClient';
import { getPromotionScoresByDestination, getTrendingToursByDestination, getHardcodedToursByDestination, getTrendingRestaurantsByDestination } from '@/lib/promotionSystem';
import { getDestinationFullContent } from '@/data/destinationFullContent';
import { getDestinationSeoContent } from '@/data/destinationSeoContent';
import viatorDestinationsClassifiedData from '@/data/viatorDestinationsClassified.json';
import { getRestaurantsForDestination, formatRestaurantForFrontend } from '@/lib/restaurants';
import ErrorBoundary from '@/components/ErrorBoundary';

// Helper to generate slug
function generateSlug(name) {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

// Force dynamic rendering to avoid build-time errors
export const dynamic = 'force-dynamic';

// Generate metadata for SEO
export async function generateMetadata({ params }) {
  const { id } = await params;
  let destination = getDestinationById(id);
  
  // If not in curated destinations, check generated content
  if (!destination) {
    const fullContent = getDestinationFullContent(id);
    const seoContent = getDestinationSeoContent(id);
    
    if (fullContent || seoContent) {
      const destinationName = fullContent?.destinationName || seoContent?.destinationName || id;
      const heroDescription = fullContent?.heroDescription || seoContent?.heroDescription || seoContent?.briefDescription || '';
      const seoTitle = fullContent?.seo?.title || seoContent?.seo?.title || `${destinationName} Tours & Activities`;
      // Use favicon for destinations without images
      const ogImage = seoContent?.ogImage || (fullContent?.imageUrl || seoContent?.imageUrl || 'https://toptours.ai/favicon.ico');
      
      return {
        title: `${seoTitle} | TopTours.ai`,
        description: heroDescription || `Discover the best tours and activities in ${destinationName}. Find top-rated experiences, book instantly, and explore ${destinationName} with AI-powered recommendations.`,
        keywords: `${destinationName} tours, ${destinationName} activities, ${destinationName} experiences, things to do in ${destinationName}`,
        openGraph: {
          title: seoTitle,
          description: heroDescription || `Discover the best tours and activities in ${destinationName}.`,
          url: `https://toptours.ai/destinations/${id}`,
          images: [
            {
              url: ogImage,
              width: 1200,
              height: 630,
              alt: destinationName,
            },
          ],
          type: 'website',
          siteName: 'TopTours.ai',
          locale: 'en_US',
        },
        twitter: {
          card: 'summary_large_image',
          title: seoTitle,
          description: heroDescription || `Discover the best tours and activities in ${destinationName}.`,
          images: [ogImage],
        },
        alternates: {
          canonical: `https://toptours.ai/destinations/${id}`,
        },
      };
    }
    
    // If still not found, return not found metadata
    return {
      title: 'Destination Not Found | TopTours.ai',
    };
  }

  // Use favicon for destinations without images
  const ogImage = destination.imageUrl || 'https://toptours.ai/favicon.ico';
  
  return {
    title: `${destination.fullName} Tours & Activities | TopTours.ai`,
    description: destination.seo?.description || destination.heroDescription,
    keywords: `${destination.fullName} tours, ${destination.fullName} activities, ${destination.fullName} experiences, things to do in ${destination.fullName}`,
    openGraph: {
      title: `${destination.fullName} Tours & Activities`,
      description: destination.seo?.description || destination.heroDescription,
      url: `https://toptours.ai/destinations/${destination.id}`,
      images: [
        {
          url: ogImage,
          width: 1200,
          height: 630,
          alt: destination.fullName,
        },
      ],
      type: 'website',
      siteName: 'TopTours.ai',
      locale: 'en_US',
    },
    twitter: {
      card: 'summary_large_image',
      title: `${destination.fullName} Tours & Activities`,
      description: destination.seo?.description || destination.heroDescription,
      images: [ogImage],
    },
    alternates: {
      canonical: `https://toptours.ai/destinations/${destination.id}`,
    },
  };
}

export default async function DestinationDetailPage({ params }) {
  const { id } = await params;
  let destination = getDestinationById(id);
  
  // If not in our 182 destinations, check if we have generated full content
  if (!destination) {
    const fullContent = getDestinationFullContent(id);
    const seoContent = getDestinationSeoContent(id);
    
    if (fullContent || seoContent) {
      // Find destination in classified data to get country and region
      let country = fullContent?.country || seoContent?.country || null;
      let region = fullContent?.region || seoContent?.region || null;
      
      // Find classified destination data (contains destinationId, country, region)
      // IMPORTANT: Some destinations have duplicate names with different IDs
      // We need to prioritize: CITY > REGION > other types, and match by country/region when available
      let classifiedDest = null;
      try {
        if (Array.isArray(viatorDestinationsClassifiedData) && viatorDestinationsClassifiedData.length > 0) {
          const searchName = (fullContent?.destinationName || seoContent?.destinationName || id).toLowerCase().trim();
          const searchSlug = generateSlug(fullContent?.destinationName || seoContent?.destinationName || id);
          
          // Find all matching destinations
          const matches = viatorDestinationsClassifiedData.filter(dest => {
            if (!dest) return false;
            const destName = (dest.destinationName || dest.name || '').toLowerCase().trim();
            const destSlug = generateSlug(dest.destinationName || dest.name || '');
            return destName === searchName || destSlug === searchSlug || destSlug === id;
          });
          
          if (matches.length > 0) {
            // If multiple matches, prioritize:
            // 1. Match by country if we have country info
            // 2. CITY type over other types
            // 3. First match as fallback
            
            if (matches.length === 1) {
              classifiedDest = matches[0];
            } else {
              // Multiple matches - need to prioritize
              let bestMatch = null;
              
              // First, try to match by country if we have it
              if (country) {
                const countryMatch = matches.find(dest => 
                  dest.country && dest.country.toLowerCase().trim() === country.toLowerCase().trim()
                );
                if (countryMatch) {
                  bestMatch = countryMatch;
                }
              }
              
              // If no country match, prioritize CITY type
              if (!bestMatch) {
                const cityMatch = matches.find(dest => dest.type === 'CITY');
                if (cityMatch) {
                  bestMatch = cityMatch;
                }
              }
              
              // If still no match, prioritize REGION over other types
              if (!bestMatch) {
                const regionMatch = matches.find(dest => dest.type === 'REGION');
                if (regionMatch) {
                  bestMatch = regionMatch;
                }
              }
              
              // Fallback to first match
              classifiedDest = bestMatch || matches[0];
              
              // Log warning if we had to choose between multiple matches
              if (matches.length > 1 && !bestMatch) {
                console.warn(`⚠️ Multiple destination IDs found for "${searchName}":`, 
                  matches.map(m => `${m.destinationId} (${m.type}, ${m.country})`).join(', '),
                  '- Using:', classifiedDest.destinationId
                );
              }
            }
          }
          
          if (classifiedDest) {
            country = classifiedDest.country || country;
            region = classifiedDest.region || region;
            
            // If country is not set, try to get it from parent destination
            if (!country && classifiedDest.parentDestinationId) {
              try {
                const parentDest = viatorDestinationsClassifiedData.find(dest => 
                  dest && (
                    dest.destinationId === classifiedDest.parentDestinationId.toString() || 
                    dest.destinationId === classifiedDest.parentDestinationId
                  )
                );
                if (parentDest && parentDest.country) {
                  country = parentDest.country;
                }
                if (!region && parentDest && parentDest.region) {
                  region = parentDest.region;
                }
              } catch (error) {
                console.error('Error finding parent destination:', error);
              }
            }
          }
        }
      } catch (error) {
        console.error('Error processing viatorDestinationsClassifiedData:', error);
        // Continue without classified data - not critical
      }
      
      // Create destination object from generated content
      const destName = fullContent?.destinationName || seoContent?.destinationName || id;
      
      // CRITICAL: Get destinationId from classified data (100% available as user confirmed)
      const viatorDestinationId = classifiedDest?.destinationId || fullContent?.destinationId;
      
      if (!viatorDestinationId) {
        console.warn(`⚠️ No destinationId found for ${destName} (slug: ${id}). Tours may show incorrectly.`);
      }
      
      // Check if this is a small destination with a parent country (especially Caribbean)
      let parentCountryDestination = null;
      try {
        if (classifiedDest && classifiedDest.parentDestinationId && (region || '').toLowerCase() === 'caribbean') {
          // Find the parent country destination
          const parentDest = viatorDestinationsClassifiedData.find(dest => 
            dest && (
              (dest.destinationId === classifiedDest.parentDestinationId.toString() || 
               dest.destinationId === classifiedDest.parentDestinationId) &&
              dest.type === 'COUNTRY'
            )
          );
          
          if (parentDest) {
            const parentSlug = generateSlug(parentDest.destinationName || parentDest.name || '');
            parentCountryDestination = {
              id: parentSlug,
              name: parentDest.destinationName || parentDest.name,
              fullName: parentDest.destinationName || parentDest.name,
              destinationId: parentDest.destinationId
            };
          }
        }
      } catch (error) {
        console.error('Error finding parent country destination:', error);
        // Continue without parent country - not critical
      }
      
      destination = {
        id: id,
        name: destName,
        fullName: destName,
        category: region || null,
        country: country || null,
        destinationId: viatorDestinationId, // CRITICAL: Always use Viator destination ID for accurate tour filtering
        briefDescription: fullContent?.briefDescription || seoContent?.briefDescription || `Discover tours and activities in ${destName}`,
        heroDescription: fullContent?.heroDescription || seoContent?.heroDescription || null,
        whyVisit: fullContent?.whyVisit || [],
        highlights: fullContent?.highlights || [],
        gettingAround: fullContent?.gettingAround || '',
        bestTimeToVisit: fullContent?.bestTimeToVisit || null,
        tourCategories: fullContent?.tourCategories || [],
        seo: fullContent?.seo || seoContent?.seo || {
          title: `${destName} Tours & Excursions - Top-Rated Activities & Adventures`,
          description: `Discover top-rated ${destName} tours, excursions, and activities powered by AI.`,
        },
        imageUrl: null, // No image for generated destinations
        isViatorDestination: true, // Flag to indicate this is a generated destination
        parentCountryDestination: parentCountryDestination, // For small destinations that belong to a parent country
      };
    }
  }
  
  if (!destination) {
    return (
      <div className="min-h-screen pt-20 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-white mb-4">Destination Not Found</h1>
          <p className="text-white/80 mb-6">Sorry, we couldn't find that destination.</p>
        </div>
      </div>
    );
  }

  // Fetch promotion scores for this destination
  const promotionScores = await getPromotionScoresByDestination(destination.id);

  // Fetch trending tours (past 28 days) for this destination
  const trendingTours = await getTrendingToursByDestination(destination.id, 6);

  // Fetch trending restaurants (past 28 days) for this destination
  const trendingRestaurants = await getTrendingRestaurantsByDestination(destination.id, 6);

  // Fetch hardcoded tours by category (lightweight - no API calls)
  const hardcodedTours = await getHardcodedToursByDestination(destination.id);

  // Fetch restaurants from database for this destination
  // Wrap in try-catch to prevent page crashes if database is unavailable
  let restaurants = [];
  try {
    // Only fetch if we have the required environment variables
    if (process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY) {
      const dbRestaurants = await getRestaurantsForDestination(destination.id);
      // Format restaurants for frontend and limit to 6 for the preview
      // Add extra error handling for each restaurant
      restaurants = (dbRestaurants || [])
        .slice(0, 6)
        .map(restaurant => {
          try {
            return formatRestaurantForFrontend(restaurant);
          } catch (err) {
            console.error('Error formatting restaurant:', err, restaurant?.id);
            return null;
          }
        })
        .filter(restaurant => restaurant !== null && restaurant !== undefined);
    }
  } catch (error) {
    // Silently fail - don't crash the page if restaurants can't be loaded
    console.error('Error fetching restaurants (non-fatal):', error.message);
    restaurants = [];
  }

  // Merge hardcoded tour scores into promotionScores
  if (hardcodedTours && Object.keys(hardcodedTours).length > 0) {
    Object.values(hardcodedTours).forEach(categoryTours => {
      categoryTours.forEach(tour => {
        if (tour.productId && !promotionScores[tour.productId]) {
          promotionScores[tour.productId] = {
            product_id: tour.productId,
            total_score: tour.totalScore || 0,
            monthly_score: 0,
            weekly_score: 0,
            past_28_days_score: tour.lastMonthScore || 0,
          };
        }
      });
    });
  }

  return (
    <>
      {/* TouristDestination Schema */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "TouristDestination",
            "name": destination.fullName,
            "description": destination.seo?.description || destination.heroDescription,
            "image": destination.imageUrl,
            "url": `https://toptours.ai/destinations/${destination.id}`,
            "touristType": "Leisure travelers, Adventure seekers, Culture enthusiasts"
          })
        }}
      />
      
      {/* Article Schema for SEO */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Article",
            "headline": `${destination.fullName} Tours & Activities Guide`,
            "description": destination.seo?.description || destination.heroDescription,
            "image": destination.imageUrl,
            "datePublished": "2025-10-07",
            "dateModified": "2025-10-07",
            "author": {
              "@type": "Organization",
              "name": "TopTours.ai"
            },
            "publisher": {
              "@type": "Organization",
              "name": "TopTours.ai",
              "logo": {
                "@type": "ImageObject",
                "url": "https://toptours.ai/logo.png"
              }
            }
          })
        }}
      />
      
      {/* BreadcrumbList Schema */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "BreadcrumbList",
            "itemListElement": [
              {
                "@type": "ListItem",
                "position": 1,
                "name": "Home",
                "item": "https://toptours.ai"
              },
              {
                "@type": "ListItem",
                "position": 2,
                "name": "Destinations",
                "item": "https://toptours.ai/destinations"
              },
              {
                "@type": "ListItem",
                "position": 3,
                "name": destination.fullName,
                "item": `https://toptours.ai/destinations/${destination.id}`
              }
            ]
          })
        }}
      />
      
      {/* Tour List Schema - Organized by Category */}
      {hardcodedTours && Object.keys(hardcodedTours).length > 0 && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "ItemList",
              "name": `${destination.fullName} Tours & Activities`,
              "description": `Popular tours and activities in ${destination.fullName}`,
              "itemListElement": (() => {
                const items = [];
                let position = 1;
                Object.keys(hardcodedTours).forEach(categoryName => {
                  hardcodedTours[categoryName].forEach(tour => {
                    if (tour.productId && tour.title) {
                      items.push({
                        "@type": "ListItem",
                        "position": position++,
                        "item": {
                          "@type": "TouristAttraction",
                          "name": tour.title,
                          "description": `${tour.title} in ${destination.fullName}`,
                          "image": tour.image || destination.imageUrl,
                          "url": `https://toptours.ai/tours/${tour.productId}/${tour.title.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`
                        }
                      });
                    }
                  });
                });
                return items;
              })()
            })
          }}
        />
      )}
      
      <ErrorBoundary>
        <DestinationDetailClient 
          destination={destination} 
          promotionScores={promotionScores}
          trendingTours={trendingTours}
          trendingRestaurants={trendingRestaurants}
          hardcodedTours={hardcodedTours}
          restaurants={restaurants}
        />
      </ErrorBoundary>
    </>
  );
}
