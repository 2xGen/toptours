import { notFound } from 'next/navigation';
import { getDestinationById } from '@/data/destinationsData';
import { getDestinationFullContent } from '@/data/destinationFullContent';
import { getDestinationSeoContent } from '@/data/destinationSeoContent';
import viatorDestinationsClassifiedData from '@/data/viatorDestinationsClassified.json';
import { getViatorDestinationById, getViatorDestinationBySlug } from '@/lib/supabaseCache';
import { redirect } from 'next/navigation';
import ErrorBoundary from '@/components/ErrorBoundary';
import DestinationDetailClient from './DestinationDetailClient';
import { fetchDestinationData } from './DestinationDataLoader';
import { trackToursForSitemap } from '@/lib/tourSitemap';

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

// Revalidate every 24 hours - page-level cache (not API JSON cache, so Viator compliant)
export const revalidate = 604800; // 7 days - increased to reduce ISR writes during Google reindexing

// Add HTTP cache headers to serve from edge cache (reduces function invocations for crawlers)
export async function headers() {
  return {
    'Cache-Control': 'public, s-maxage=604800, stale-while-revalidate=2592000', // 7 days cache, 30 days stale
  };
}

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
      // Always use standardized OG image so dimensions are correct
      const defaultOgImage = 'https://toptours.ai/OG%20Images/TopTours%20Destinations.jpg';
      const ogImage = defaultOgImage;
      
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
    }
    
    // If still not found, return not found metadata
    return {
      title: 'Destination Not Found | TopTours.ai',
    };
  }

  // Always use standardized OG image so dimensions are correct
  const defaultOgImage = 'https://toptours.ai/OG%20Images/TopTours%20Destinations.jpg';
  const ogImage = defaultOgImage;
  
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
}

export default async function DestinationDetailPage({ params }) {
  const { id } = await params;
  let destination = getDestinationById(id);
  
  // If ID is numeric (Viator destination ID), look it up in Supabase and redirect to slug
  if (!destination && /^\d+$/.test(id)) {
    try {
      const destInfo = await getViatorDestinationById(id);
      if (destInfo && destInfo.name) {
        const slug = destInfo.slug || generateSlug(destInfo.name);
        redirect(`/destinations/${slug}`);
      }
    } catch (error) {
      // Continue without database lookup - fallback to static data
    }
  }
  
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
                // Continue without parent destination data
              }
            }
          }
        }
      } catch (error) {
        // Continue without classified data - not critical
      }
      
      // Create destination object from generated content
      const destName = fullContent?.destinationName || seoContent?.destinationName || id;
      
      // CRITICAL: Get destinationId from classified data (100% available as user confirmed)
      const viatorDestinationId = classifiedDest?.destinationId || fullContent?.destinationId;
      
      
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
        imageUrl: fullContent?.imageUrl || seoContent?.imageUrl || seoContent?.ogImage || null,
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

  // CRITICAL: For promotion queries, we need to handle both old (182) and new (3300+) destinations
  // Old destinations: database has slugs (e.g., "amsterdam", "aruba") - pass slug directly
  // New destinations: database has numeric IDs (e.g., "50751") - pass numeric ID
  // The query functions handle both formats, but we should pass what matches the database
  
  // CRITICAL: Use database as source of truth - query by slug to get correct destination ID
  // This ensures we use the correct ID from the database (id field = Viator destination ID)
  let slugToViatorId = {};
  let isCuratedDestination = false;
  
  try {
    const viatorMap = await import('@/data/viatorDestinationMap');
    slugToViatorId = viatorMap.slugToViatorId || {};
    isCuratedDestination = destination.id && slugToViatorId[destination.id];
  } catch (error) {
    // Continue without the map - will use database lookup only
  }

  // Query database by slug to get the correct destination ID
  if (isCuratedDestination && !destination.destinationId) {
    try {
      const dbDestination = await getViatorDestinationBySlug(destination.id);
      if (dbDestination && dbDestination.id) {
        destination.destinationId = dbDestination.id.toString();
      } else if (slugToViatorId[destination.id]) {
          destination.destinationId = slugToViatorId[destination.id];
      }
    } catch (error) {
      if (slugToViatorId[destination.id]) {
        destination.destinationId = slugToViatorId[destination.id];
      }
    }
  }
  
  // Use the same destination ID for promotions as we use for tours
  const destinationIdForScores = destination.destinationId || destination.id;
  
  // Fetch all destination data in parallel for better performance
  const {
    promotionScores,
    trendingTours,
    trendingRestaurants,
    promotedTours,
    promotedRestaurants,
    hardcodedTours,
    restaurants,
    restaurantPromotionScores,
    premiumRestaurantIds,
    categoryGuides,
    hasBabyEquipmentRentals
  } = await fetchDestinationData(destination, destinationIdForScores);

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
            "datePublished": "2025-12-31",
            "dateModified": "2025-12-31",
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
      
      {/* FAQPage Schema */}
      {(() => {
        // Build FAQ questions array
        const faqQuestions = [];
        
        // Best time to visit
        if (destination.bestTimeToVisit?.weather) {
          let answerText = destination.bestTimeToVisit.weather;
          if (destination.bestTimeToVisit.bestMonths) {
            answerText += ` ${destination.bestTimeToVisit.bestMonths}`;
          }
          if (destination.bestTimeToVisit.peakSeason) {
            answerText += ` Peak season: ${destination.bestTimeToVisit.peakSeason}.`;
          }
          if (destination.bestTimeToVisit.offSeason) {
            answerText += ` Off season: ${destination.bestTimeToVisit.offSeason}.`;
          }
          
          faqQuestions.push({
            "@type": "Question",
            "name": `What is the best time to visit ${destination.fullName}?`,
            "acceptedAnswer": {
              "@type": "Answer",
              "text": answerText
            }
          });
        }
        
        // Getting around
        if (destination.gettingAround) {
          faqQuestions.push({
            "@type": "Question",
            "name": `How do I get around ${destination.fullName}?`,
            "acceptedAnswer": {
              "@type": "Answer",
              "text": destination.gettingAround
            }
          });
        }
        
        // Why visit
        if (destination.whyVisit && destination.whyVisit.length > 0) {
          const whyVisitText = destination.whyVisit.slice(0, 3).join(' ');
          faqQuestions.push({
            "@type": "Question",
            "name": `Why should I visit ${destination.fullName}?`,
            "acceptedAnswer": {
              "@type": "Answer",
              "text": whyVisitText
            }
          });
        }
        
        // Must-see attractions
        if (destination.highlights && destination.highlights.length > 0) {
          const highlightsText = destination.highlights.map(h => `• ${h}`).join(' ');
          faqQuestions.push({
            "@type": "Question",
            "name": `What are the must-see attractions in ${destination.fullName}?`,
            "acceptedAnswer": {
              "@type": "Answer",
              "text": highlightsText
            }
          });
        }
        
        // Tour types available
        if (destination.tourCategories && destination.tourCategories.length > 0) {
          const categoryNames = destination.tourCategories
            .slice(0, 4)
            .map(cat => typeof cat === 'string' ? cat : cat.name)
            .filter(Boolean);
          
          if (categoryNames.length > 0) {
            faqQuestions.push({
              "@type": "Question",
              "name": `What types of tours are available in ${destination.fullName}?`,
              "acceptedAnswer": {
                "@type": "Answer",
                "text": `${destination.fullName} offers a variety of tour experiences including: ${categoryNames.join(', ')}.`
              }
            });
          }
        }
        
        // Popular tours (from category guides)
        if (categoryGuides && categoryGuides.length > 0) {
          const popularToursText = categoryGuides
            .slice(0, 6)
            .map(guide => guide.title || guide.category_name || '')
            .filter(Boolean)
            .join(', ');
          
          if (popularToursText) {
            faqQuestions.push({
              "@type": "Question",
              "name": `What are the most popular tours in ${destination.fullName}?`,
              "acceptedAnswer": {
                "@type": "Answer",
                "text": `The most popular tours in ${destination.fullName} include: ${popularToursText}. Discover comprehensive guides for each tour category to plan your perfect trip.`
              }
            });
          }
        }
        
        // Only render schema if we have at least one question
        if (faqQuestions.length > 0) {
          return (
            <script
              type="application/ld+json"
              dangerouslySetInnerHTML={{
                __html: JSON.stringify({
                  "@context": "https://schema.org",
                  "@type": "FAQPage",
                  "mainEntity": faqQuestions
                }, null, 2)
              }}
            />
          );
        }
        
        return null;
      })()}
      
      {/* Track tours for sitemap (non-blocking) */}
      {(() => {
        const allTours = [
          ...(promotedTours || []),
          ...(trendingTours || []),
          ...Object.values(hardcodedTours || {}).flat()
        ];
        if (allTours.length > 0) {
          trackToursForSitemap(allTours, { id: destination.id, slug: destination.id });
        }
        return null;
      })()}
      
      <ErrorBoundary>
        <DestinationDetailClient 
          destination={destination} 
          promotionScores={promotionScores}
          trendingTours={trendingTours}
          trendingRestaurants={trendingRestaurants}
          promotedTours={promotedTours}
          promotedRestaurants={promotedRestaurants}
          hardcodedTours={hardcodedTours}
          restaurants={restaurants}
          restaurantPromotionScores={restaurantPromotionScores}
          premiumRestaurantIds={premiumRestaurantIds}
          categoryGuides={categoryGuides}
          hasBabyEquipmentRentals={hasBabyEquipmentRentals}
        />
      </ErrorBoundary>
    </>
  );
}
