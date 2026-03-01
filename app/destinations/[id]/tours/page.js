import { notFound } from 'next/navigation';
import { getDestinationById } from '@/data/destinationsData';
import { getPopularToursForDestination } from '@/data/popularTours';
import ToursListingClient from './ToursListingClient';
import { slugToViatorId } from '@/data/viatorDestinationMap';
import { getHardcodedToursByDestination, getPromotedToursByDestination } from '@/lib/promotionSystem';
import { getPremiumOperatorTourIdsForDestination } from '@/lib/tourOperatorPremiumServer';
import { getDestinationNameById } from '@/lib/viatorCache';
import { getViatorDestinationById, getViatorDestinationBySlug } from '@/lib/supabaseCache';
import { redirect } from 'next/navigation';
import { getDestinationSeoContent } from '@/data/destinationSeoContent';
// Dynamic import to keep large JSON out of initial server bundle
import { hasDestinationPage, getDestinationFullContent } from '@/data/destinationFullContent';
import { getAllCategoryGuidesForDestination } from '@/lib/categoryGuides';
import { getDestinationFeatures } from '@/lib/destinationFeatures';
import { headers } from 'next/headers';

// Revalidate every 24 hours - page-level cache (not API JSON cache, so Viator compliant)
export const revalidate = 604800; // 7 days - increased to reduce ISR writes during Google reindexing

// Lightweight function to get guide count (for metadata)
async function getGuideCountForMetadata(destinationId) {
  try {
    const guides = await getAllCategoryGuidesForDestination(destinationId);
    return guides?.length || 0;
  } catch (error) {
    return 0;
  }
}

export async function generateMetadata({ params }) {
  const { id } = await params;
  const viatorDestinationsClassifiedData = (await import('@/data/viatorDestinationsClassified.json')).default;
  let destination = getDestinationById(id);
  let seoContent = null;
  
  // If not in our 182 destinations, try to get from Viator API cache or SEO content
  if (!destination) {
    // First check if we have SEO content for this slug
    seoContent = getDestinationSeoContent(id);
    
    if (seoContent) {
      // Find destination in classified data to get country and region (same as destinations page)
      let country = null;
      let region = null;
      if (Array.isArray(viatorDestinationsClassifiedData)) {
        const classifiedDest = viatorDestinationsClassifiedData.find(dest => {
          const destName = (dest.destinationName || dest.name || '').toLowerCase().trim();
          const searchName = seoContent.destinationName.toLowerCase().trim();
          return destName === searchName;
        });
        if (classifiedDest) {
          country = classifiedDest.country || null;
          region = classifiedDest.region || null;
          
          // If country is not set, try to get it from parent destination
          if (!country && classifiedDest.parentDestinationId) {
            const parentDest = viatorDestinationsClassifiedData.find(dest => 
              dest.destinationId === classifiedDest.parentDestinationId.toString() || 
              dest.destinationId === classifiedDest.parentDestinationId
            );
            if (parentDest && parentDest.country) {
              country = parentDest.country;
            }
            if (!region && parentDest && parentDest.region) {
              region = parentDest.region;
            }
          }
        }
      }
      
      // Fallback to SEO content country if not found in classified data
      if (!country && seoContent.country) {
        country = seoContent.country;
      }
      
      // Final fallback: try to extract country from hero description (e.g., "the Netherlands' architectural gem")
      if (!country && seoContent.heroDescription) {
        const heroDesc = seoContent.heroDescription;
        const countryMatch = heroDesc.match(/the\s+([A-Z][a-z]+(?:'s)?)/i);
        if (countryMatch) {
          const extractedCountry = countryMatch[1].replace(/'s$/, '');
          // Common country names that might appear
          const knownCountries = ['Netherlands', 'Italy', 'France', 'Spain', 'Greece', 'Germany', 'Portugal', 'Croatia'];
          if (knownCountries.includes(extractedCountry)) {
            country = extractedCountry;
          }
        }
      }
      
      // Use SEO content to create destination object (with full content)
      destination = {
        id: id,
        name: seoContent.destinationName,
        fullName: seoContent.destinationName,
        imageUrl: seoContent.seo?.ogImage || 'https://toptours.ai/favicon.ico',
        seo: seoContent.seo,
        briefDescription: seoContent.briefDescription,
        heroDescription: seoContent.heroDescription,
        whyVisit: seoContent.whyVisit || [],
        highlights: seoContent.highlights || [],
        bestTimeToVisit: seoContent.bestTimeToVisit,
        tourCategories: seoContent.tourCategories || [],
        country: country, // Get from classified data (same as destinations page)
        region: region,
      };
    } else {
      // Check if id is a Viator destination ID (numeric or starts with 'd')
      if (/^d?\d+$/.test(id)) {
        // It's a numeric ID - try Supabase lookup first (same as page component)
        const viatorDestinationId = id.startsWith('d') ? id.replace(/^d/i, '') : id;
        try {
          const destInfo = await getViatorDestinationById(viatorDestinationId);
          if (destInfo && destInfo.name) {
            const slug = destInfo.slug || generateSlug(destInfo.name);
            // Don't redirect in metadata - just use the info we have
            destination = {
              id: id,
              name: destInfo.name,
              fullName: destInfo.name,
              imageUrl: 'https://toptours.ai/favicon.ico',
              seo: {
                description: `Discover the best tours and activities in ${destInfo.name}. Browse trusted operators and secure instant confirmations.`,
              },
              briefDescription: `Explore ${destInfo.name} with curated tours and activities.`,
              tourCategories: [],
            };
          }
        } catch (error) {
          // Continue with fallback
        }
      }
      
      // Try slug lookup using database (same as page component line 458)
      if (!destination) {
        try {
          const destInfo = await getViatorDestinationBySlug(id);
          if (destInfo && destInfo.name) {
            destination = {
              id: id,
              name: destInfo.name,
              fullName: destInfo.name,
              destinationId: destInfo.id, // Use id from database (Viator destination ID)
              imageUrl: 'https://toptours.ai/favicon.ico',
              seo: {
                description: `Discover the best tours and activities in ${destInfo.name}. Browse trusted operators and secure instant confirmations.`,
              },
              briefDescription: `Explore ${destInfo.name} with curated tours and activities.`,
              tourCategories: [],
            };
          }
        } catch (error) {
          // Continue with fallback
        }
      }
      
      // Final fallback: JSON file lookup (same as page component line 267)
      if (!destination) {
        const viatorId = id.startsWith('d') ? id : `d${id}`;
        const destinationInfo = await getDestinationNameById(viatorId);
        
        if (destinationInfo && destinationInfo.destinationName) {
          // Create a minimal destination object for metadata
          destination = {
            id: id,
            name: destinationInfo.destinationName,
            fullName: destinationInfo.destinationName,
            destinationId: destinationInfo.destinationId,
            imageUrl: 'https://toptours.ai/favicon.ico',
            seo: {
              description: `Discover the best tours and activities in ${destinationInfo.destinationName}. Browse trusted operators and secure instant confirmations.`,
            },
            briefDescription: `Explore ${destinationInfo.destinationName} with curated tours and activities.`,
            tourCategories: [],
          };
        }
      }
    }
  }
  
  if (!destination) {
    return {
      title: 'Tours Not Found',
      robots: {
        index: false,
        follow: false,
        noindex: true,
        nofollow: true,
      },
    };
  }

  const destinationName = destination.fullName || destination.name;
  
  // Get full content if available (for 182 curated destinations)
  const fullContent = getDestinationFullContent(destination.id || id);
  
  // Check if destination has guides (for metadata)
  const guideCount = await getGuideCountForMetadata(destination.id || id);
  const hasGuides = guideCount > 0;
  const region = destination.category || destination.region || fullContent?.region || fullContent?.category;
  
  // Use ALL available content from destination (prioritize fullContent for 182 curated destinations)
  const briefDescription = fullContent?.briefDescription || destination.briefDescription || '';
  const heroDescription = fullContent?.heroDescription || destination.heroDescription || '';
  const whyVisit = fullContent?.whyVisit || destination.whyVisit || [];
  const highlights = fullContent?.highlights || destination.highlights || [];
  const bestTimeToVisit = fullContent?.bestTimeToVisit || destination.bestTimeToVisit;
  const tourCategories = fullContent?.tourCategories || destination.tourCategories || [];
  
  // SEO title: Transactional listing page - keyword-focused, clean format
  // Pattern: {Destination} Tours & Activities | Top-Rated Excursions
  const seoTitle = `${destinationName} Tours & Activities | Top-Rated Excursions`;
  
  // OG title: Human, clickable, shareable - separate from SEO for better social CTR
  const ogTitle = `Best Tours & Things to Do in ${destinationName}`;
  
  // Build RICH description with consistent opener, then dynamic content
  // OPTIMIZED: Prioritize most important content, respect 155 char limit (safe for mobile 120 + desktop 158)
  const MAX_DESC_LENGTH = 155; // Safe limit: works on mobile (120) and desktop (158)
  
  // Consistent opener for all tours listing pages
  const opener = `Discover top-rated tours and activities in ${destinationName}.`;
  let dynamicContent = '';
  
  // Priority 1: Build dynamic content from briefDescription or heroDescription
  if (briefDescription) {
    const firstSentence = briefDescription.split(/[.!?]+/)[0].trim();
    if (firstSentence.length <= MAX_DESC_LENGTH - opener.length - 5) {
      dynamicContent = briefDescription.length <= MAX_DESC_LENGTH - opener.length - 5 
        ? briefDescription 
        : firstSentence + '.';
    } else {
      dynamicContent = firstSentence.substring(0, MAX_DESC_LENGTH - opener.length - 8).trim() + '...';
    }
  } else if (heroDescription) {
    const sentences = heroDescription.split(/[.!?]+/).filter(s => s.trim().length > 0);
    const firstSentence = sentences[0]?.trim() || '';
    if (firstSentence.length <= MAX_DESC_LENGTH - opener.length - 5) {
      dynamicContent = firstSentence + (firstSentence.endsWith('.') ? '' : '.');
    } else {
      dynamicContent = firstSentence.substring(0, MAX_DESC_LENGTH - opener.length - 8).trim() + '...';
    }
  }
  
  // Priority 2: Add highlights (must-see places) if we have room
  const currentLength = opener.length + dynamicContent.length;
  if (highlights.length > 0 && currentLength < MAX_DESC_LENGTH - 40) {
    const highlightText = highlights.slice(0, 2)
      .map(h => {
        const name = typeof h === 'string' ? h.split(/[-]/)[0].trim().split(/[.,]/)[0].trim() : h;
        return name;
      })
      .filter(Boolean)
      .join(', ');
    
    if (highlightText) {
      const addition = ` Must-see: ${highlightText}.`;
      if (currentLength + addition.length <= MAX_DESC_LENGTH) {
        dynamicContent += addition;
      }
    }
  }
  
  // Priority 3: Add tour-specific info (this is a tours page, not restaurants)
  // Focus on tours, activities, excursions - what people search for
  const updatedLength = opener.length + dynamicContent.length;
  if (updatedLength < MAX_DESC_LENGTH - 30 && tourCategories.length > 0) {
    const topCategories = tourCategories.slice(0, 2)
      .map(cat => typeof cat === 'string' ? cat : cat.name)
      .filter(Boolean)
      .join(', ');
    if (topCategories) {
      const addition = ` Popular: ${topCategories}.`;
      if (updatedLength + addition.length <= MAX_DESC_LENGTH) {
        dynamicContent += addition;
      }
    }
  }
  
  // Priority 4: Add best time to visit if we have room (very concise)
  const finalLength = opener.length + dynamicContent.length;
  if (bestTimeToVisit?.bestMonths && finalLength < MAX_DESC_LENGTH - 25) {
    const bestMonths = bestTimeToVisit.bestMonths.split(/[.,]/)[0].trim();
    if (bestMonths) {
      const addition = ` Best: ${bestMonths}.`;
      if (finalLength + addition.length <= MAX_DESC_LENGTH) {
        dynamicContent += addition;
      }
    }
  }
  
  // Combine opener + dynamic content
  let description = opener + (dynamicContent ? ' ' + dynamicContent : '');
  
  // Fallback if we still don't have a good description
  if (!dynamicContent || description.length < 50) {
    description = `Discover top-rated tours and activities in ${destinationName}. ${highlights.length > 0 ? `Explore ${highlights[0]}` : 'Browse top-rated excursions'} and experience the best of ${destinationName}.`;
  }
  
  // Final trim: Ensure description is optimal length (155 chars max for 2026 SEO)
  if (description.length > MAX_DESC_LENGTH) {
    const trimmed = description.substring(0, MAX_DESC_LENGTH - 3);
    const lastPeriod = trimmed.lastIndexOf('.');
    const lastExclamation = trimmed.lastIndexOf('!');
    const lastQuestion = trimmed.lastIndexOf('?');
    const lastPunctuation = Math.max(lastPeriod, lastExclamation, lastQuestion);
    
    if (lastPunctuation > 80) {
      description = trimmed.substring(0, lastPunctuation + 1);
    } else {
      const lastSpace = trimmed.lastIndexOf(' ');
      if (lastSpace > 100) {
        description = trimmed.substring(0, lastSpace) + '...';
      } else {
        description = trimmed + '...';
      }
    }
  }
  
  // Generate enhanced keywords using ALL available content
  let keywords = `${destinationName} tours, ${destinationName} activities, ${destinationName} experiences, things to do in ${destinationName}, ${destinationName} travel guide, explore tours ${destinationName}, ${destinationName} excursions, ${destinationName} attractions, ${destinationName} vacation, ${destinationName} travel planning`;
  
  // Add intent keywords
  keywords += `, best ${destinationName}, top ${destinationName}, popular ${destinationName}, where to visit ${destinationName}`;
  
  // Add highlight keywords (must-see places)
  if (highlights.length > 0) {
    const highlightKeywords = highlights.slice(0, 3)
      .map(h => {
        const name = typeof h === 'string' ? h.split(/[-]/)[0].trim().split(/[.,]/)[0].trim() : h;
        return name ? `${name} ${destinationName}` : null;
      })
      .filter(Boolean)
      .join(', ');
    if (highlightKeywords) {
      keywords += `, ${highlightKeywords}`;
    }
  }
  
  // Focus keywords on tours, activities, excursions (this is a tours listing page)
  // Add tour-specific intent keywords (use "explore" and "view" instead of "book")
  keywords += `, ${destinationName} excursions, ${destinationName} day trips, ${destinationName} sightseeing tours, ${destinationName} guided tours, explore ${destinationName} tours, ${destinationName} tour operators, ${destinationName} activities, view ${destinationName} tours`;
  
  // Add tour category keywords
  if (tourCategories.length > 0) {
    const categoryKeywords = tourCategories
      .slice(0, 4)
      .map(cat => {
        const name = typeof cat === 'string' ? cat : cat.name;
        return name ? `${name} ${destinationName}` : null;
      })
      .filter(Boolean)
      .join(', ');
    if (categoryKeywords) {
      keywords += `, ${categoryKeywords}`;
    }
  }
  
  // Use destination image if available, otherwise fall back to default OG image
  const defaultOgImage = 'https://toptours.ai/OG%20Images/Browse%20Tours%20by%20Best%20Match.jpg';
  const ogImage = destination.imageUrl || fullContent?.imageUrl || defaultOgImage;
  
  return {
    title: seoTitle, // SEO title: keyword-focused, transactional
    description: description,
    keywords,
    openGraph: {
      title: ogTitle, // OG title: human, clickable, shareable (separate from SEO)
      description: description.length > 200 ? description.substring(0, 197) + '...' : description,
      url: `https://toptours.ai/destinations/${id}/tours`,
      images: [
        {
          url: ogImage,
          width: 1200,
          height: 630,
          alt: `${destinationName} Tours`,
        },
      ],
      type: 'website',
      siteName: 'TopTours.ai',
      locale: 'en_US',
    },
    twitter: {
      card: 'summary_large_image',
      title: ogTitle, // Use OG title for Twitter too (human, shareable)
      description: description.length > 200 ? description.substring(0, 197) + '...' : description,
      images: [ogImage],
    },
    alternates: {
      canonical: `https://toptours.ai/destinations/${id}/tours`,
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

/**
 * Generate a URL-friendly slug from a destination name
 */
function generateSlug(name) {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '') // Remove special characters
    .replace(/\s+/g, '-') // Replace spaces with hyphens
    .replace(/-+/g, '-') // Replace multiple hyphens with single hyphen
    .replace(/^-|-$/g, ''); // Remove leading/trailing hyphens
}

/**
 * Tours listing page for a destination
 */
export default async function ToursListingPage({ params }) {
  const { id } = await params;
  const viatorDestinationsClassifiedData = (await import('@/data/viatorDestinationsClassified.json')).default;
  let destination = getDestinationById(id);
  let isViatorDestination = false;
  let viatorDestinationId = null;
  
  // If not in our 182 destinations, try to get from Viator API cache
  if (!destination) {
    let destinationInfo = null;
    let lookupId = id;
    
    // Check if id is a Viator destination ID (numeric or starts with 'd')
    if (/^d?\d+$/.test(id)) {
      // It's a numeric ID - look up the destination name and redirect to slug
      lookupId = id.startsWith('d') ? id : `d${id}`;
      viatorDestinationId = id.startsWith('d') ? id.replace(/^d/i, '') : id;
      
      // Try Supabase lookup first (most reliable)
      let destInfo = null;
      try {
        destInfo = await getViatorDestinationById(viatorDestinationId);
        if (destInfo && destInfo.name) {
          const slug = destInfo.slug || generateSlug(destInfo.name);
          redirect(`/destinations/${slug}/tours`);
        }
      } catch (error) {
        // Continue with fallback
      }
      
      // Fallback to JSON file lookup
      if (!destInfo) {
        destinationInfo = await getDestinationNameById(lookupId);
        
        if (destinationInfo && destinationInfo.destinationName) {
          // Generate slug and redirect to SEO-friendly URL
          const slug = generateSlug(destinationInfo.destinationName);
          redirect(`/destinations/${slug}/tours`);
        }
      } else {
        // Use Supabase data
        destinationInfo = {
          destinationName: destInfo.name,
          destinationId: destInfo.id,
        };
      }
    } else {
      // It's a slug - find the destination by slug
      try {
        const destInfo = await getViatorDestinationBySlug(id);
        if (destInfo && destInfo.name) {
          destinationInfo = {
            destinationName: destInfo.name,
            destinationId: destInfo.id,
          };
          viatorDestinationId = destInfo.id;
        }
      } catch (error) {
        // Continue with fallback
      }
    }
    
    if (destinationInfo && destinationInfo.destinationName) {
      // Check if we have SEO content for this destination
      const seoContent = getDestinationSeoContent(id);
      
      // Find destination in classified data to get country and region (same as destinations page)
      let country = null;
      let region = null;
      if (Array.isArray(viatorDestinationsClassifiedData)) {
        const classifiedDest = viatorDestinationsClassifiedData.find(dest => {
          const destName = (dest.destinationName || dest.name || '').toLowerCase().trim();
          const searchName = destinationInfo.destinationName.toLowerCase().trim();
          return destName === searchName;
        });
        if (classifiedDest) {
          country = classifiedDest.country || null;
          region = classifiedDest.region || null;
          
          // If country is not set, try to get it from parent destination
          if (!country && classifiedDest.parentDestinationId) {
            const parentDest = viatorDestinationsClassifiedData.find(dest => 
              dest.destinationId === classifiedDest.parentDestinationId.toString() || 
              dest.destinationId === classifiedDest.parentDestinationId
            );
            if (parentDest && parentDest.country) {
              country = parentDest.country;
            }
            if (!region && parentDest && parentDest.region) {
              region = parentDest.region;
            }
          }
        }
      }
      
      // Fallback to SEO content country if not found in classified data
      if (!country && seoContent?.country) {
        country = seoContent.country;
      }
      
      // Final fallback: try to extract country from hero description (e.g., "the Netherlands' architectural gem")
      if (!country && seoContent?.heroDescription) {
        const heroDesc = seoContent.heroDescription;
        const countryMatch = heroDesc.match(/the\s+([A-Z][a-z]+(?:'s)?)/i);
        if (countryMatch) {
          const extractedCountry = countryMatch[1].replace(/'s$/, '');
          // Common country names that might appear
          const knownCountries = ['Netherlands', 'Italy', 'France', 'Spain', 'Greece', 'Germany', 'Portugal', 'Croatia'];
          if (knownCountries.includes(extractedCountry)) {
            country = extractedCountry;
          }
        }
      }
      
      // CRITICAL: Get destinationId from classified data (100% available as user confirmed)
      const classifiedDest = Array.isArray(viatorDestinationsClassifiedData) 
        ? viatorDestinationsClassifiedData.find(dest => {
            const destName = (dest.destinationName || dest.name || '').toLowerCase().trim();
            const searchName = destinationInfo.destinationName.toLowerCase().trim();
            return destName === searchName || generateSlug(destName) === id;
          })
        : null;
      
      // Use destinationId from classified data if not already set
      if (!viatorDestinationId && classifiedDest?.destinationId) {
        viatorDestinationId = classifiedDest.destinationId;
      }
      
      // Check if this is a small destination with a parent country (especially Caribbean)
      let parentCountryDestination = null;
      if (classifiedDest && classifiedDest.parentDestinationId && (region || '').toLowerCase() === 'caribbean') {
        // Find the parent country destination
        const parentDest = viatorDestinationsClassifiedData.find(dest => 
          (dest.destinationId === classifiedDest.parentDestinationId.toString() || 
           dest.destinationId === classifiedDest.parentDestinationId) &&
          dest.type === 'COUNTRY'
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
      
      // Create a minimal destination object for dynamic destinations
      destination = {
        id: id, // Use the slug as id (already in URL)
        name: destinationInfo.destinationName,
        fullName: destinationInfo.destinationName,
        destinationId: viatorDestinationId || classifiedDest?.destinationId || null, // CRITICAL: Include Viator destination ID
        imageUrl: seoContent?.seo?.ogImage || 'https://toptours.ai/favicon.ico',
        seo: seoContent?.seo || {
          description: `Discover the best tours and activities in ${destinationInfo.destinationName}. Browse trusted operators and secure instant confirmations.`,
        },
        briefDescription: seoContent?.briefDescription || `Explore ${destinationInfo.destinationName} with curated tours and activities.`,
        heroDescription: seoContent?.heroDescription || null,
        tourCategories: [],
        country: country, // Get from classified data (same as destinations page)
        region: region,
        parentCountryDestination: parentCountryDestination, // For small destinations that belong to a parent country
      };
      isViatorDestination = true;
    }
  }
  
  if (!destination) {
    notFound();
  }

  // Get hardcoded popular tours for this destination (only for our 182 destinations)
  const popularTours = isViatorDestination ? [] : getPopularToursForDestination(id);
  
  // Get Viator destination ID
  // CRITICAL: Use database as source of truth - query by slug to get correct destination ID
  // This ensures we use the correct ID from the database (id field = Viator destination ID)
  if (!isViatorDestination) {
    // Curated destination - query database by slug to get the correct destination ID
    const dbDestination = await getViatorDestinationBySlug(id);
    if (dbDestination && dbDestination.id) {
      viatorDestinationId = dbDestination.id.toString();
    } else {
      // Fallback to hardcoded map if database lookup fails
      viatorDestinationId = slugToViatorId[id] || null;
    }
    // CRITICAL: Add destinationId to destination object for 182 destinations
    // This ensures consistency with destination detail page
    if (viatorDestinationId && !destination.destinationId) {
      destination.destinationId = viatorDestinationId;
    }
  } else {
    // For Viator destinations, get from destination object or classified data
    viatorDestinationId = destination.destinationId || viatorDestinationId;
    
    // If still not set, try classified data lookup
    if (!viatorDestinationId && Array.isArray(viatorDestinationsClassifiedData)) {
      const classifiedDest = viatorDestinationsClassifiedData.find(dest => {
        const destName = (dest.destinationName || dest.name || '').toLowerCase().trim();
        const searchName = (destination.fullName || destination.name || '').toLowerCase().trim();
        return destName === searchName || generateSlug(destName) === id;
      });
      if (classifiedDest?.destinationId) {
        viatorDestinationId = classifiedDest.destinationId;
        if (!destination.destinationId) {
          destination.destinationId = viatorDestinationId;
        }
      }
    }
  }
  
  // CRITICAL: Ensure destination.destinationId is set to the final viatorDestinationId
  // This ensures consistency between server-side and client-side API calls
  if (viatorDestinationId && !destination.destinationId) {
    destination.destinationId = viatorDestinationId;
  } else if (destination.destinationId && !viatorDestinationId) {
    // If destination has ID but viatorDestinationId doesn't, use destination's ID
    viatorDestinationId = destination.destinationId;
  }

  // Fetch dynamic tours - EXACT SAME FUNCTION as destination detail page
  // 100% IDENTICAL - same endpoint, same parameters, same logic
  let dynamicTours = [];
  let totalToursAvailable = 0;
  try {
    // EXACT same variable names and logic as DestinationDetailClient.jsx line 400-401
    const destinationName = destination.fullName || destination.name || destination.destinationName || destination.id;
    const viatorDestinationId = destination.destinationId || destination.viatorDestinationId;
    
    // Prefer env baseUrl so we avoid headers() and allow static/ISR; fallback to request host for same-origin fetch.
    let baseUrl = process.env.NEXT_PUBLIC_BASE_URL || (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : null);
    if (!baseUrl) {
      const headersList = await headers();
      const host = headersList.get('host') || 'localhost:3000';
      baseUrl = `${process.env.NODE_ENV === 'production' ? 'https' : 'http'}://${host}`;
    }

    // Use /products/search endpoint (standard approach) when we have destination ID and no search term
    // This is 100% accurate for all 3300+ destinations
    let requestBody = {
      searchTerm: '', // No search term - use /products/search endpoint
      page: 1,
      viatorDestinationId: viatorDestinationId ? String(viatorDestinationId) : null,
      includeDestination: !!viatorDestinationId // Use /products/search when destination ID is available
    };

    // EXACT same fetch call as DestinationDetailClient.jsx line 423-429
    // Cache allowed - our API route has 1h cache headers, and page has 24h cache
    let response = await fetch(`${baseUrl}/api/internal/viator-search`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
      next: { revalidate: 86400 }, // Cache for 24 hours - increased to reduce costs
    });

    if (!response.ok) {
      let errorData = {};
      try {
        const text = await response.text();
        try {
          errorData = JSON.parse(text);
        } catch {
          errorData = { error: text || 'Unknown error', raw: text };
        }
      } catch (e) {
        errorData = { error: 'Failed to parse error response', details: e.message };
      }
      
      const errorMessage = errorData.error || errorData.details || errorData.message || `HTTP ${response.status}`;
      throw new Error(`Failed to fetch tours: ${response.status} - ${errorMessage}`);
    }

    // EXACT same data extraction as DestinationDetailClient.jsx line 454-458
    const data = await response.json();
    const allTours = data.products?.results || data.tours || [];
    totalToursAvailable = data.products?.totalCount || allTours.length || 0; // Fix: assign to outer variable, don't declare new one
    
    // COMPLIANCE: Only fetch page 1 on initial load (max 50 products per Viator rules)
    // Client-side will handle pagination when users click "Load More" or "Next Page"
    // This ensures we comply with Viator's requirement: "Paginate through the search results
    // only when the customer wants to move to the next page with search results"
    const allToursList = [];
    const seenTourIds = new Set();
    
    // Process only the first page (user-driven pagination happens client-side)
    if (data && !data.error) {
      const tours = data.products?.results || [];
      for (const tour of tours) {
        const tourId = tour.productId || tour.productCode;
        if (tourId && !seenTourIds.has(tourId)) {
          seenTourIds.add(tourId);
          allToursList.push(tour);
        }
      }
    }
    
    // Filter out tours that are already in popularTours
    const popularProductIds = new Set(popularTours.map(t => t.productId));
    dynamicTours = allToursList.filter(tour => {
      const tourId = tour.productId || tour.productCode;
      return !popularProductIds.has(tourId);
    });
    
    // Keep production logs clean (debug logging removed)
  } catch (error) {
    // Continue with empty dynamic tours
  }

  // Fetch all promotion scores for this destination
  // CRITICAL: Use the SAME destination ID that we use for fetching tours
  // This ensures promotions match the tours being displayed
  // destination.destinationId is set from database lookup (getViatorDestinationBySlug)
  // This ensures consistency between tours and promotions
  let destinationIdForScores;
  
  // Use the destinationId from destination object (set from database lookup above)
  // This is the same ID we use for fetching tours, ensuring consistency
  if (destination.destinationId) {
    // Use the database-derived destination ID (numeric Viator ID)
    destinationIdForScores = destination.destinationId;
  } else if (viatorDestinationId) {
    // Fallback to viatorDestinationId if destination.destinationId not set
    destinationIdForScores = viatorDestinationId;
  } else {
    // Last resort: use slug, promotion function will look up numeric ID
    destinationIdForScores = id;
  }
  
  // Parallelize independent data fetching operations
  const allProductIds = [
    ...popularTours.map(t => t.productId).filter(Boolean),
    ...dynamicTours.map(t => t.productId || t.productCode).filter(Boolean),
  ];

  // Fetch promoted tour data and features in parallel (promotion scores and restaurants removed)
  const [
    promotedTourDataResult,
    premiumOperatorTourIdsResult,
    categoryGuidesResult,
    destinationFeaturesResult
  ] = await Promise.allSettled([
    // Promoted tour data
    destinationIdForScores 
      ? getPromotedToursByDestination(destinationIdForScores, 20).catch(() => [])
      : Promise.resolve([]),
    
    // Premium operator tour IDs
    destination.id 
      ? getPremiumOperatorTourIdsForDestination(destination.id).catch(() => [])
      : Promise.resolve([]),
    
    // Category guides
    getAllCategoryGuidesForDestination(destination.id).catch(() => []),
    
    // Destination features (lightweight checks for sticky nav)
    destination.id 
      ? getDestinationFeatures(destination.id).catch(() => ({ hasRestaurants: false, hasBabyEquipment: false, hasAirportTransfers: false }))
      : Promise.resolve({ hasRestaurants: false, hasBabyEquipment: false, hasAirportTransfers: false })
  ]);

  // Extract results
  const promotionScores = {};
  const promotedTourData = promotedTourDataResult.status === 'fulfilled' ? promotedTourDataResult.value : [];
  const premiumOperatorTourIds = premiumOperatorTourIdsResult.status === 'fulfilled' ? premiumOperatorTourIdsResult.value : [];
  let categoryGuides = categoryGuidesResult.status === 'fulfilled' ? categoryGuidesResult.value : [];
  const destinationFeatures = destinationFeaturesResult.status === 'fulfilled' ? destinationFeaturesResult.value : { hasRestaurants: false, hasBabyEquipment: false, hasAirportTransfers: false };

  // Fetch promoted tours for this destination
  let promotedTours = [];
  try {
    // Match promoted product IDs with actual tour data (from both dynamicTours and popularTours)
    const promotedTourProductIds = new Set(promotedTourData.map(pt => pt.product_id || pt.productId || pt.productCode).filter(Boolean));
    
    // First, try to find promoted tours in dynamicTours and popularTours
    const allAvailableTours = [...dynamicTours, ...popularTours];
    const foundPromotedTours = allAvailableTours.filter(tour => {
      const productId = tour.productId || tour.productCode;
      return productId && promotedTourProductIds.has(productId);
    });
    
    // Find which promoted tours are missing
    const foundProductIds = new Set(foundPromotedTours.map(t => t.productId || t.productCode).filter(Boolean));
    const missingProductIds = Array.from(promotedTourProductIds).filter(id => !foundProductIds.has(id));
    
    // Fetch missing promoted tours directly from Viator API
    if (missingProductIds.length > 0) {
      const apiKey = process.env.VIATOR_API_KEY;
      if (apiKey) {
        const fetchPromises = missingProductIds.slice(0, 6).map(async (productId) => {
          try {
            const url = `https://api.viator.com/partner/products/${productId}?currency=USD`;
            const response = await fetch(url, {
              method: 'GET',
              headers: {
                'exp-api-key': apiKey,
                'Accept': 'application/json;version=2.0',
                'Accept-Language': 'en-US',
                'Content-Type': 'application/json'
              },
              next: { revalidate: 86400 }, // Cache for 24 hours - wrapped by unstable_cache anyway, this reduces fetch calls
            });
            
            if (response.ok) {
              return await response.json();
            }
            return null;
          } catch (error) {
            return null;
          }
        });
        
        const fetchedTours = await Promise.all(fetchPromises);
        promotedTours = [...foundPromotedTours, ...fetchedTours.filter(Boolean)];
      } else {
        promotedTours = foundPromotedTours;
      }
    } else {
      promotedTours = foundPromotedTours;
    }
  } catch (error) {
    // Continue with empty array
  }

  // Generate JSON-LD schema for SEO
  const schemaTours = [...(popularTours || []), ...(dynamicTours || [])]
    .filter(Boolean)
    .slice(0, 24);

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: `Tours & Activities in ${destination.fullName || destination.name}`,
    description: `Discover the best tours and activities in ${destination.fullName || destination.name}`,
    numberOfItems: schemaTours.length,
    itemListElement: schemaTours.map((tour, index) => {
      const productId = tour.productId || tour.productCode;
      const title = tour.seo?.title || tour.title || 'Tour';
      const slug = tour.slug || generateSlug(title);
      const url = productId ? `https://toptours.ai/tours/${productId}/${slug}` : `https://toptours.ai/destinations/${id}/tours`;

      // Use Product type for tours (supports offers and aggregateRating properly)
      // TouristAttraction doesn't support offers property according to Schema.org
      const price = tour.pricing?.summary?.fromPrice;
      const currency = tour.pricing?.currency;
      
      const item = {
        '@type': 'Product',
        name: title,
        description: tour.description || tour.seo?.description || `Experience ${title} in ${destination.fullName || destination.name}`,
        url,
        category: 'Tour',
        additionalType: 'https://schema.org/TouristAttraction', // Indicate it's also a tourist attraction
      };

      const image =
        tour.images?.[0]?.variants?.find((v) => v?.width >= 400)?.url ||
        tour.images?.[0]?.variants?.[0]?.url ||
        null;
      if (image) item.image = image;

      const rating = tour.reviews?.combinedAverageRating;
      const reviewCount = tour.reviews?.totalReviews;
      if (typeof rating === 'number' && typeof reviewCount === 'number' && reviewCount > 0 && rating > 0) {
        item.aggregateRating = {
          '@type': 'AggregateRating',
          ratingValue: rating,
          reviewCount,
        };
      }

      // Product type supports offers property
      if (typeof price === 'number' && currency) {
        item.offers = {
          '@type': 'Offer',
          price,
          priceCurrency: currency,
          url,
          availability: 'https://schema.org/InStock',
        };
      }

      return {
        '@type': 'ListItem',
        position: index + 1,
        item,
      };
    }),
  };

  return (
    <>
      {/* OPTIMIZED: Enhanced TouristDestination Schema for better SEO */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "TouristDestination",
            "name": destination.fullName || destination.name,
            "description": destination.seo?.description || destination.briefDescription,
            "image": destination.imageUrl,
            "url": `https://toptours.ai/destinations/${id}/tours`,
            "touristType": ["Leisure travelers", "Adventure seekers", "Culture enthusiasts", "Family travelers"],
            "containsPlace": {
              "@type": "Place",
              "name": destination.fullName || destination.name,
              "address": {
                "@type": "PostalAddress",
                "addressLocality": destination.name || destination.fullName,
                "addressCountry": destination.country || undefined,
                "addressRegion": destination.category || undefined
              }
            }
          })
        }}
      />
      
      {/* ItemList Schema for Tours */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
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
                "name": destination.fullName || destination.name,
                "item": hasDestinationPage(id) ? `https://toptours.ai/destinations/${id}` : `https://toptours.ai/destinations/${id}/tours`
              },
              {
                "@type": "ListItem",
                "position": 4,
                "name": "Tours",
                "item": `https://toptours.ai/destinations/${id}/tours`
              }
            ]
          })
        }}
      />
      
      <ToursListingClient 
        destination={destination}
        popularTours={popularTours}
        dynamicTours={dynamicTours}
        viatorDestinationId={viatorDestinationId}
        totalToursAvailable={totalToursAvailable}
        promotionScores={promotionScores}
        promotedTours={promotedTours}
        isViatorDestination={isViatorDestination}
        premiumOperatorTourIds={premiumOperatorTourIds}
        categoryGuides={categoryGuides}
        destinationFeatures={destinationFeatures}
      />
    </>
  );
}

