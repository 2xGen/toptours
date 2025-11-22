"use client";
import { useState, useEffect } from 'react';
import NavigationNext from '@/components/NavigationNext';
import FooterNext from '@/components/FooterNext';
import SmartTourFinder from '@/components/home/SmartTourFinder';
import { useToast } from '@/components/ui/use-toast';
import { motion } from 'framer-motion';
import { 
  Star, ExternalLink, Loader2, Brain, MapPin, Calendar, Clock, Car, Hotel, Search, BookOpen, ArrowRight, X, UtensilsCrossed, DollarSign
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';
import { getRelatedDestinations, getDestinationsByIds, getDestinationsByCountry } from '../../../src/data/destinationsData.js';
import { getGuidesByCategory, getGuidesByIds, getGuidesByCountry } from '../../../src/data/travelGuidesData.js';
import { getRestaurantsForDestination } from './restaurants/restaurantsData';
import { getTourUrl, getTourProductId } from '@/utils/tourHelpers';
import TourPromotionCard from '@/components/promotion/TourPromotionCard';
import { TrendingUp } from 'lucide-react';
import { groupToursByCategory } from '@/lib/tourCategorization';
import viatorDestinationsClassifiedData from '@/data/viatorDestinationsClassified.json';
import { getDestinationSeoContent } from '@/data/destinationSeoContent';

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

// Map category names for display (e.g., "Culinary Tours" -> "Food Tours")
function getDisplayCategoryName(categoryName) {
  const categoryMap = {
    'Culinary Tours': 'Food Tours',
  };
  return categoryMap[categoryName] || categoryName;
}

export default function DestinationDetailClient({ destination, promotionScores = {}, trendingTours = [], hardcodedTours = {} }) {
  
  // Ensure destination has required arrays
  const safeDestination = {
    ...destination,
    tourCategories: Array.isArray(destination?.tourCategories) ? destination.tourCategories : [],
    whyVisit: Array.isArray(destination?.whyVisit) ? destination.whyVisit : [],
    highlights: Array.isArray(destination?.highlights) ? destination.highlights : [],
    gettingAround: destination?.gettingAround || '',
    bestTimeToVisit: destination?.bestTimeToVisit || null,
    parentCountryDestination: destination?.parentCountryDestination || null, // For small destinations that belong to a parent country
  };
  const destinationName = safeDestination.name || safeDestination.fullName || safeDestination.id;

  // Debug: Log destination data (remove in production)
  if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
    console.log('Destination data:', {
      id: safeDestination.id,
      name: safeDestination.name,
      whyVisit: safeDestination.whyVisit,
      highlights: safeDestination.highlights,
      gettingAround: safeDestination.gettingAround,
      bestTimeToVisit: safeDestination.bestTimeToVisit,
    });
  }

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [tours, setTours] = useState({ all: [] });
  const [loading, setLoading] = useState({ all: false });
  const [totalToursCount, setTotalToursCount] = useState(null);
  const [visibleTours, setVisibleTours] = useState({});
  const [relatedDestinations, setRelatedDestinations] = useState([]);
  const [relatedGuides, setRelatedGuides] = useState([]);
  const [categoryGuides, setCategoryGuides] = useState([]);
  const [countryDestinations, setCountryDestinations] = useState([]);
  const [showMoreCountryDestinations, setShowMoreCountryDestinations] = useState(12);
  const [guideCarouselIndex, setGuideCarouselIndex] = useState(0);
  const [isMobile, setIsMobile] = useState(false);
  const [selectedTour, setSelectedTour] = useState(null);
  const [isTourModalOpen, setIsTourModalOpen] = useState(false);
  const [showStickyButton, setShowStickyButton] = useState(true);
  const [showParentCountryModal, setShowParentCountryModal] = useState(false);
  const { toast } = useToast();
  const restaurants = getRestaurantsForDestination(safeDestination.id);
  const hasRestaurants = restaurants.length > 0;
  const normalizedRelatedGuides = Array.isArray(relatedGuides) ? relatedGuides : [];

  const handleOpenModal = () => {
    setIsModalOpen(true);
  };

  useEffect(() => {
    // Scroll to top when component mounts (e.g., when navigating back)
    window.scrollTo({ top: 0, behavior: 'instant' });
    
    // Check if mobile
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    // Show parent country modal after 5 seconds (if destination has parent country)
    let timer = null;
    if (safeDestination.parentCountryDestination) {
      timer = setTimeout(() => {
        setShowParentCountryModal(true);
      }, 5000); // 5 seconds
    }
    
    // Initialize visible tours for each category (mobile only)
    const visible = {};
    safeDestination.tourCategories.forEach(category => {
      const categoryName = typeof category === 'string' ? category : category.name;
      visible[categoryName] = 4; // Start with 4 visible tours on mobile
    });
    setVisibleTours(visible);
    
    // Use hardcoded tours if available, otherwise fetch from API with caching
    if (hardcodedTours && Object.keys(hardcodedTours).length > 0) {
      // Convert hardcoded tours to the format expected by the UI
      const formattedTours = {};
      Object.keys(hardcodedTours).forEach(categoryName => {
        formattedTours[categoryName] = hardcodedTours[categoryName].map(tour => ({
          productId: tour.productId,
          productCode: tour.productId,
          title: tour.title,
          // Format images to match Viator API structure
          images: tour.image ? [{
            variants: [
              { url: tour.image }, // small
              { url: tour.image }, // medium
              { url: tour.image }, // large
              { url: tour.image }  // variant[3] - what UI expects
            ]
          }] : [],
          pricing: {
            summary: {
              fromPrice: null, // Will be fetched on detail page
              currency: 'USD'
            }
          },
          reviews: {
            combinedAverageRating: null, // Will be fetched on detail page
            totalReviews: 0
          },
          flags: [], // No flags for hardcoded tours
          // Add TopTours score to promotionScores for TourPromotionCard
        }));
      });
      // Convert to new flat format
      const allHardcodedTours = [];
      Object.keys(formattedTours).forEach(categoryName => {
        allHardcodedTours.push(...formattedTours[categoryName]);
      });
      
      // Sort and take top 12
      const sortedTours = allHardcodedTours.sort((a, b) => {
        const ratingA = a.reviews?.combinedAverageRating || 0;
        const ratingB = b.reviews?.combinedAverageRating || 0;
        const reviewsA = a.reviews?.totalReviews || 0;
        const reviewsB = b.reviews?.totalReviews || 0;
        
        if (ratingA !== ratingB) {
          return ratingB - ratingA;
        }
        return reviewsB - reviewsA;
      });
      
      setTours({ all: sortedTours.slice(0, 12) });
      setLoading({ all: false });
    } else {
      // No hardcoded tours - fetch all tours with one API call (cached for 7 days)
      fetchAllToursForDestination();
    }

    // Load all related destinations from the same region
    const related = getRelatedDestinations(safeDestination.id);
    setRelatedDestinations(related);

    // Load guides by country (for SEO internal linking)
    if (safeDestination.country) {
      const guidesByCountry = getGuidesByCountry(safeDestination.country);
      const guideIds = Array.isArray(safeDestination.relatedGuides) ? safeDestination.relatedGuides : [];
      const guidesByIds = guideIds.length > 0 ? getGuidesByIds(guideIds) : [];

      const combinedGuidesMap = new Map();
      guidesByCountry.forEach((guide) => combinedGuidesMap.set(guide.id, guide));
      guidesByIds.forEach((guide) => combinedGuidesMap.set(guide.id, guide));

      setRelatedGuides(Array.from(combinedGuidesMap.values()));
    }
    
    // Load guides by category/region (for bottom section)
    if (safeDestination.category) {
      const guidesByCategory = getGuidesByCategory(safeDestination.category);
      setCategoryGuides(guidesByCategory); // Show all
    }
    
    // Load other destinations in the same country (for SEO internal linking)
    if (safeDestination.country) {
      // First get from curated destinations (182 destinations)
      const curatedDests = getDestinationsByCountry(safeDestination.country, safeDestination.id);
      
      // Also get from classified data (all destinations)
      const allCountryDests = [];
      const currentSlug = safeDestination.id;
      const currentName = (safeDestination.name || safeDestination.fullName || '').toLowerCase().trim();
      
      // Track seen IDs and names to prevent duplicates
      const seenIds = new Set();
      const seenNames = new Set();
      
      // Add curated destinations first
      curatedDests.forEach(dest => {
        const destId = dest.id || '';
        const destName = (dest.name || dest.fullName || '').toLowerCase().trim();
        if (destId && !seenIds.has(destId)) {
          seenIds.add(destId);
          seenNames.add(destName);
          allCountryDests.push(dest);
        }
      });
      
      if (Array.isArray(viatorDestinationsClassifiedData)) {
        const classifiedDests = viatorDestinationsClassifiedData
          .filter(dest => {
            const destCountry = (dest.country || '').toLowerCase().trim();
            const targetCountry = (safeDestination.country || '').toLowerCase().trim();
            const destName = (dest.destinationName || dest.name || '').toLowerCase().trim();
            const destSlug = generateSlug(dest.destinationName || dest.name || '');
            
            // Must match country, be a city, not be the current destination
            return destCountry === targetCountry && 
                   dest.type === 'CITY' &&
                   destName !== currentName &&
                   destSlug !== currentSlug &&
                   destName.length > 0;
          })
          .map(dest => {
            const slug = generateSlug(dest.destinationName || dest.name || '');
            const seoContent = getDestinationSeoContent(slug);
            
            return {
              id: slug,
              name: dest.destinationName || dest.name,
              fullName: dest.destinationName || dest.name,
              briefDescription: seoContent?.briefDescription || seoContent?.heroDescription || `Explore tours and activities in ${dest.destinationName || dest.name}`,
              imageUrl: null,
              country: dest.country
            };
          });
        
        // Add classified destinations, avoiding duplicates by both ID and name
        classifiedDests.forEach(dest => {
          const destId = dest.id || '';
          const destName = (dest.name || dest.fullName || '').toLowerCase().trim();
          
          // Check both ID and name to avoid duplicates
          if (destId && !seenIds.has(destId) && !seenNames.has(destName)) {
            seenIds.add(destId);
            seenNames.add(destName);
            allCountryDests.push(dest);
          }
        });
      }
      
      // Sort alphabetically
      const sortedDests = allCountryDests.sort((a, b) => 
        (a.name || '').localeCompare(b.name || '')
      );
      
      setCountryDestinations(sortedDests);
    }
    
    // Cleanup
    return () => {
      if (timer) {
        clearTimeout(timer);
      }
      window.removeEventListener('resize', checkMobile);
    };
  }, [safeDestination.parentCountryDestination]);

  // Fetch all tours for destination (single API call, cached for 7 days)
  const fetchAllToursForDestination = async () => {
    // Set loading state
    setLoading({ all: true });

    try {
      // Use the existing working viator-search endpoint instead
      const destinationName = safeDestination.fullName || safeDestination.name || safeDestination.destinationName || safeDestination.id;
      const viatorDestinationId = safeDestination.destinationId || safeDestination.viatorDestinationId;
      
      // CRITICAL: If we have a destination ID, use it for filtering instead of text search
      // This prevents matching tours by name (e.g., "Main" matching "Main Sights" tours)
      if (!viatorDestinationId) {
        console.error('❌ No Viator destination ID found for', destinationName, '- falling back to text search (may show irrelevant tours)');
        console.error('Destination object:', safeDestination);
      } else {
        console.log('✅ Using Viator Destination ID for filtering:', viatorDestinationId, 'for', destinationName);
      }
      
      const requestBody = {
        // Use destination name as searchTerm (for API compatibility)
        // The destination ID filter ensures accurate results, not text matching
        searchTerm: destinationName, // Keep destination name for API compatibility
        page: 1,
        viatorDestinationId: viatorDestinationId ? String(viatorDestinationId) : null, // Ensure it's a string
        includeDestination: !!viatorDestinationId // CRITICAL: This filter ensures accuracy, not the searchTerm
      };
      
      console.log('API Request Body:', JSON.stringify(requestBody, null, 2));
      
      const response = await fetch('/api/internal/viator-search', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
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
        
        console.error('API Error Response:', {
          status: response.status,
          statusText: response.statusText,
          errorData: errorData
        });
        
        const errorMessage = errorData.error || errorData.details || errorData.message || `HTTP ${response.status}`;
        throw new Error(`Failed to fetch tours: ${response.status} - ${errorMessage}`);
      }

      const data = await response.json();
      
      // The viator-search endpoint returns data.products.results, not data.tours
      const allTours = data.products?.results || data.tours || [];
      const totalCount = data.products?.totalCount || allTours.length || 0;
      
      // Store total count for button
      setTotalToursCount(totalCount);

      // Store all tours (no need to group by category anymore)
      if (allTours.length > 0) {
        // Sort by rating/reviews
        const sortedTours = allTours.sort((a, b) => {
          const ratingA = a.reviews?.combinedAverageRating || 0;
          const ratingB = b.reviews?.combinedAverageRating || 0;
          const reviewsA = a.reviews?.totalReviews || 0;
          const reviewsB = b.reviews?.totalReviews || 0;
          
          if (ratingA !== ratingB) {
            return ratingB - ratingA;
          }
          return reviewsB - reviewsA;
        });
        
        // Store as a flat array, take top 12
        setTours({ all: sortedTours.slice(0, 12) });
      } else {
        setTours({ all: [] });
        setTotalToursCount(0);
      }

      // Set loading to false
      setLoading({ all: false });
    } catch (error) {
      console.error('Error fetching tours:', error);
      toast({
        title: 'Error',
        description: 'Failed to load tours. Please try again later.',
        variant: 'destructive',
      });
      
      // Set loading to false
      setLoading({ all: false });
    }
  };

  const fetchToursForCategory = async (destinationName, category) => {
    // This function is kept for backward compatibility but shouldn't be used
    // All tours are now fetched in one call via fetchAllToursForDestination
    console.warn('fetchToursForCategory is deprecated. Use fetchAllToursForDestination instead.');
    setLoading(prev => ({ ...prev, [category]: true }));
    try {
      const searchTerm = `${destinationName} ${category}`;
      const response = await fetch('/api/internal/viator-search', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          destination: searchTerm,
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      // Viator API returns products in data.products.results
      const products = Array.isArray(data.products?.results) ? data.products.results : 
                      Array.isArray(data.products) ? data.products : [];
      
      setTours(prev => ({
        ...prev,
        [category]: Array.isArray(products) ? products.slice(0, 6) : [] // Max 6 tours per category
      }));
    } catch (error) {
      console.error('Error fetching tours:', error);
      toast({
        title: "Error",
        description: `Failed to load ${category} tours`,
        variant: "destructive"
      });
    } finally {
      setLoading(prev => ({ ...prev, [category]: false }));
    }
  };


  const loadMoreTours = (category) => {
    setVisibleTours(prev => ({
      ...prev,
      [category]: (prev[category] || 4) + 4
    }));
  };

  return (
    <>
      <NavigationNext onOpenModal={handleOpenModal} />
      
      <div className="min-h-screen pt-16 overflow-x-hidden" suppressHydrationWarning>
        {/* Hero Section */}
        <section className="relative py-12 sm:py-16 md:py-20 overflow-hidden ocean-gradient">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            {safeDestination.imageUrl ? (
              // Hero with image - side by side layout (original style)
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 sm:gap-12 items-center">
                <motion.div
                  initial={{ opacity: 0, x: -30 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.8 }}
                >
                  <div className="flex items-center mb-4">
                    <MapPin className="w-5 h-5 text-blue-600 mr-2" />
                    <span className="text-white font-medium">{safeDestination.category || safeDestination.region}</span>
                  </div>
                  <h1 className="text-3xl sm:text-4xl md:text-6xl font-poppins font-bold mb-4 md:mb-6 text-white">
                    {safeDestination.fullName}
                  </h1>
                  <p className="text-lg sm:text-xl text-white/90 mb-6 md:mb-8">
                    {safeDestination.heroDescription}
                  </p>
                  <div className="flex flex-wrap gap-2 sm:gap-4 mb-6">
                    {safeDestination.tourCategories
                      .filter(category => {
                        // Only show categories that have guides
                        if (typeof category === 'object' && category.hasGuide) return true;
                        // If it's a string, check if there's a guide for it
                        const categoryName = typeof category === 'string' ? category : category.name;
                        return safeDestination.tourCategories.some(c => 
                          typeof c === 'object' && c.name === categoryName && c.hasGuide
                        );
                      })
                      .slice(0, 3)
                      .map((category, index) => {
                        const categoryName = typeof category === 'string' ? category : category.name;
                        const categorySlug = categoryName
                          .toLowerCase()
                          .normalize('NFD').replace(/[\u0300-\u036f]/g, '') // Remove accents
                          .replace(/&/g, 'and')
                          .replace(/'/g, '') // Remove apostrophes
                          .replace(/\./g, '') // Remove periods
                          .replace(/\s+/g, '-'); // Replace spaces with hyphens
                        
                        return (
                          <Link
                            key={index}
                            href={`/destinations/${safeDestination.id}/guides/${categorySlug}`}
                            className="inline-block"
                          >
                            <Badge variant="outline" className="bg-white/20 text-white border-white/30 text-sm hover:bg-white/30 hover:border-white/40 transition-colors cursor-pointer">
                              {categoryName}
                            </Badge>
                          </Link>
                        );
                      })}
                  </div>
                  <div className="flex flex-wrap gap-3">
                    <Button
                      asChild
                      className="sunset-gradient text-white font-semibold px-6 py-3 hover:scale-105 transition-transform duration-200"
                    >
                      <Link href={`/destinations/${safeDestination.id}/tours`}>
                        View All Tours & Activities in {safeDestination.fullName || safeDestination.name}
                        <ArrowRight className="w-4 h-4 ml-2" />
                      </Link>
                    </Button>
                  </div>
                </motion.div>
                
                <motion.div
                  initial={{ opacity: 0, x: 30 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.8, delay: 0.2 }}
                  className="relative"
                >
                  <div className="relative rounded-2xl overflow-hidden shadow-2xl">
                    <img
                      src={safeDestination.imageUrl}
                      alt={safeDestination.fullName}
                      className="w-full h-64 sm:h-80 object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent"></div>
                  </div>
                </motion.div>
              </div>
            ) : (
              // Hero without image - centered layout (matching /tours page style)
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
                className="text-center"
              >
                <div className="flex items-center justify-center mb-4">
                  <MapPin className="w-5 h-5 text-blue-200 mr-2" />
                  <span className="text-white font-medium">{safeDestination.category || safeDestination.region}</span>
                </div>
                <h1 className="text-3xl sm:text-4xl md:text-6xl font-poppins font-bold mb-4 md:mb-6 text-white">
                  {safeDestination.fullName}
                </h1>
                <p className="text-lg sm:text-xl text-white/90 mb-8 max-w-3xl mx-auto">
                  {safeDestination.heroDescription}
                </p>
                <div className="flex flex-wrap justify-center gap-3">
                  <Button
                    asChild
                    className="sunset-gradient text-white font-semibold px-6 py-3 hover:scale-105 transition-transform duration-200"
                  >
                    <Link href={`/destinations/${safeDestination.id}/tours`}>
                      View All Tours & Activities in {safeDestination.fullName || safeDestination.name}
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Link>
                  </Button>
                </div>
              </motion.div>
            )}
          </div>
        </section>

        {/* Breadcrumb */}
        <section className="bg-white border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 sm:py-4">
            <nav className="flex items-center space-x-2 text-xs sm:text-sm" aria-label="Breadcrumb">
              <Link href="/" className="text-gray-500 hover:text-gray-700 transition-colors cursor-pointer">Home</Link>
              <span className="text-gray-400">/</span>
              <Link href="/destinations" className="text-gray-500 hover:text-gray-700 transition-colors cursor-pointer">Destinations</Link>
              <span className="text-gray-400">/</span>
              <span className="text-gray-900 font-medium" aria-current="page">{safeDestination.fullName || safeDestination.name}</span>
            </nav>
          </div>
        </section>

        {/* Why Visit Section */}
        {safeDestination.whyVisit && safeDestination.whyVisit.length > 0 && (
          <section className="py-12 sm:py-16 bg-gray-50 overflow-hidden">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
                viewport={{ once: true }}
                className="text-center mb-8 sm:mb-12"
              >
                <h2 className="text-2xl sm:text-3xl md:text-4xl font-poppins font-bold text-gray-800 mb-4 sm:mb-6">
                  Why Visit {safeDestination.fullName}?
                </h2>
              </motion.div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 mb-8">
                {safeDestination.whyVisit.map((reason, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: index * 0.1 }}
                    viewport={{ once: true }}
                  >
                    <Card className="bg-white border-0 shadow-lg h-full">
                      <CardContent className="p-6">
                        <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                          <Star className="w-6 h-6 text-blue-600" />
                        </div>
                        <p className="text-gray-700 leading-relaxed">{reason}</p>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>

              {/* Getting Around & Must-See Attractions - Combined */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8">
                {/* Getting Around - Compact */}
                {safeDestination.gettingAround && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    viewport={{ once: true }}
                  >
                    <Card className="bg-white border-0 shadow-sm h-full">
                      <CardContent className="p-4 sm:p-5">
                        <div className="flex items-start gap-3">
                          <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                            <Car className="w-5 h-5 text-blue-600" />
                          </div>
                          <div className="flex-1">
                            <h3 className="text-lg font-semibold text-gray-800 mb-2">Getting Around</h3>
                            <p className="text-gray-600 text-sm leading-relaxed mb-3">{safeDestination.gettingAround}</p>
                            <div className="pt-2 border-t border-gray-100">
                              <p className="text-gray-600 text-xs mb-2">Prefer renting a car? See options here.</p>
                              <Button 
                                variant="outline" 
                                size="sm"
                                className="w-full text-xs"
                                onClick={() => window.open(`https://expedia.com/affiliate?siteid=1&landingPage=https%3A%2F%2Fwww.expedia.com%2F&camref=1110lee9j&creativeref=1100l68075&adref=PZXFUWFJMk`, '_blank')}
                              >
                                <Car className="w-3 h-3 mr-1.5" />
                                Find Car Rental Deals
                                <ExternalLink className="w-3 h-3 ml-1.5" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                )}

                {/* Must-See Attractions - Compact List */}
                {safeDestination.highlights && safeDestination.highlights.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    viewport={{ once: true }}
                  >
                    <Card className="bg-white border-0 shadow-sm h-full">
                      <CardContent className="p-4 sm:p-5">
                        <div className="flex items-start gap-3">
                          <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
                            <MapPin className="w-5 h-5 text-purple-600" />
                          </div>
                          <div className="flex-1">
                            <h3 className="text-lg font-semibold text-gray-800 mb-3">Must-See Attractions</h3>
                            <ul className="space-y-2">
                              {safeDestination.highlights.map((highlight, index) => (
                                <li key={index} className="flex items-start gap-2">
                                  <span className="text-purple-600 mt-1">•</span>
                                  <span className="text-gray-600 text-sm leading-relaxed">{highlight}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                )}
              </div>
            </div>
          </section>
        )}

        {/* Best Time to Visit */}
        {safeDestination.bestTimeToVisit && (
          <section className="py-12 sm:py-16 bg-gray-50 overflow-hidden">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
                viewport={{ once: true }}
                className="text-center mb-8 sm:mb-12"
              >
                <h2 className="text-2xl sm:text-3xl md:text-4xl font-poppins font-bold text-gray-800 mb-4 sm:mb-6">
                  Best Time to Visit
                </h2>
              </motion.div>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 sm:gap-12">
                <motion.div
                  initial={{ opacity: 0, x: -30 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.8 }}
                  viewport={{ once: true }}
                >
                  <div className="flex items-start mb-6">
                    <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center mr-4">
                      <Calendar className="w-6 h-6 text-orange-600" />
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold text-gray-800 mb-2">Weather</h3>
                      <p className="text-gray-600">{safeDestination.bestTimeToVisit.weather}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start mb-6">
                    <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mr-4">
                      <Clock className="w-6 h-6 text-green-600" />
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold text-gray-800 mb-2">Best Months</h3>
                      <p className="text-gray-600">{safeDestination.bestTimeToVisit.bestMonths}</p>
                    </div>
                  </div>
                </motion.div>
                
                <motion.div
                  initial={{ opacity: 0, x: 30 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.8 }}
                  viewport={{ once: true }}
                  className="space-y-6"
                >
                  <Card className="bg-blue-50 border-blue-200">
                    <CardContent className="p-6">
                      <h3 className="text-lg font-semibold text-blue-800 mb-2">Peak Season</h3>
                      <p className="text-blue-700">{safeDestination.bestTimeToVisit.peakSeason}</p>
                    </CardContent>
                  </Card>
                  
                  <Card className="bg-green-50 border-green-200">
                    <CardContent className="p-6">
                      <h3 className="text-lg font-semibold text-green-800 mb-2">Off Season</h3>
                      <p className="text-green-700">{safeDestination.bestTimeToVisit.offSeason}</p>
                    </CardContent>
                  </Card>
                </motion.div>
              </div>
            </div>
          </section>
        )}


        {/* Trending Now Section - Past 28 Days */}
        {trendingTours && trendingTours.length > 0 && (
          <section className="py-12 bg-white">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex items-center gap-2 mb-6">
                <TrendingUp className="w-5 h-5 text-orange-600" />
                <h2 className="text-2xl font-bold text-gray-900">Trending Now in {safeDestination.fullName}</h2>
                <Badge variant="secondary" className="ml-2 bg-orange-100 text-orange-700 border-orange-300">
                  Past 28 Days
                </Badge>
              </div>
              <p className="text-sm text-gray-600 mb-6">
                Tours that are currently popular based on recent community boosts
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {trendingTours.map((trending, index) => {
                  const tourId = trending.product_id;
                  const tourUrl = trending.tour_slug 
                    ? `/tours/${tourId}/${trending.tour_slug}` 
                    : getTourUrl(tourId, trending.tour_name);
                  
                  return (
                    <motion.div
                      key={tourId || index}
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.4, delay: index * 0.1 }}
                      viewport={{ once: true }}
                    >
                      <Card className="bg-white border-0 shadow-lg overflow-hidden h-full flex flex-col hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                        <Link href={tourUrl}>
                          <div className="relative h-48 overflow-hidden">
                            {trending.tour_image_url ? (
                              <img
                                src={trending.tour_image_url}
                                alt={trending.tour_name}
                                className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center bg-gray-200">
                                <Search className="w-6 h-6 text-gray-400" />
                              </div>
                            )}
                            <div className="absolute top-3 left-3">
                              <Badge className="adventure-gradient text-white">
                                <TrendingUp className="w-3 h-3 mr-1" />
                                Trending
                              </Badge>
                            </div>
                          </div>
                        </Link>

                        <CardContent className="p-4 flex-1 flex flex-col">
                          <Link href={tourUrl}>
                            <h3 className="font-semibold text-lg text-gray-800 mb-2 line-clamp-2 hover:text-purple-600 transition-colors">
                              {trending.tour_name}
                            </h3>
                          </Link>

                          {/* Promotion Score */}
                          <div className="mb-3">
                            <TourPromotionCard 
                              productId={tourId} 
                              compact={true}
                              tourData={{
                                productId: tourId,
                                productCode: tourId,
                                title: trending.tour_name,
                                images: trending.tour_image_url ? [{
                                  variants: [
                                    { url: trending.tour_image_url },
                                    { url: trending.tour_image_url },
                                    { url: trending.tour_image_url },
                                    { url: trending.tour_image_url }
                                  ]
                                }] : []
                              }}
                              destinationId={safeDestination.id}
                              initialScore={{
                                product_id: tourId,
                                total_score: trending.total_score || 0,
                                monthly_score: trending.monthly_score || 0,
                                weekly_score: trending.weekly_score || 0,
                                past_28_days_score: trending.past_28_days_score || 0,
                              }}
                            />
                          </div>

                          <Button
                            asChild
                            className="w-full sunset-gradient text-white hover:scale-105 transition-transform duration-200 mt-auto"
                          >
                            <Link href={tourUrl}>
                              View Details
                              <ArrowRight className="w-4 h-4 ml-2" />
                            </Link>
                          </Button>
                        </CardContent>
                      </Card>
                    </motion.div>
                  );
                })}
              </div>
            </div>
          </section>
        )}

        {/* Popular Tours & Activities */}
        <section className="py-12 sm:py-16 bg-gray-50 overflow-hidden">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
              className="text-center mb-8 sm:mb-12"
            >
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-poppins font-bold text-gray-800 mb-4 sm:mb-6">
                Popular {safeDestination.fullName} Tours & Activities
              </h2>
              <p className="text-base sm:text-lg text-gray-600 max-w-3xl mx-auto">
                Discover the best tours and activities in {safeDestination.fullName} with our AI-powered recommendations
              </p>
            </motion.div>

            {loading.all ? (
              <div className="text-center py-12">
                <Loader2 className="w-8 h-8 animate-spin mx-auto text-blue-600 mb-4" />
                <p className="text-gray-600">Loading tours...</p>
              </div>
            ) : tours.all && tours.all.length > 0 ? (
              <>
                {/* Mobile grid layout - 1 column */}
                <div className="md:hidden grid grid-cols-1 gap-6">
                  {tours.all.slice(0, 12).map((tour, index) => {
                    const tourId = getTourProductId(tour);
                    const tourUrl = getTourUrl(tourId, tour.title);
                    
                    return (
                      <Card key={`${tourId}-${index}`} className="bg-white overflow-hidden hover:shadow-lg transition-all duration-300 hover:-translate-y-1 flex flex-col">
                        <Link href={tourUrl}>
                          <div className="relative h-48 bg-gray-200 flex-shrink-0 cursor-pointer">
                            {tour.images?.[0]?.variants?.[3]?.url ? (
                              <img
                                src={tour.images[0].variants[3].url}
                                alt={tour.title}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center bg-gray-200">
                                <Search className="w-8 h-8 text-gray-400" />
                              </div>
                            )}
                          </div>
                        </Link>

                        <CardContent className="p-4 flex-1 flex flex-col">
                          <Link href={tourUrl}>
                            <h4 className="font-semibold text-base text-gray-800 mb-2 line-clamp-2 hover:text-purple-600 transition-colors cursor-pointer">
                              {tour.title}
                            </h4>
                          </Link>
                          
                          {tour.flags && Array.isArray(tour.flags) && tour.flags.length > 0 && (
                            <div className="flex flex-wrap gap-1 mb-3">
                              {tour.flags.slice(0, 2).map((flag, flagIndex) => {
                                let badgeClass = "text-xs font-medium px-2 py-1 rounded-full";
                                if (flag === "FREE_CANCELLATION") {
                                  badgeClass += " bg-green-50 text-green-700 border border-green-200";
                                } else if (flag === "PRIVATE_TOUR") {
                                  badgeClass += " bg-purple-50 text-purple-700 border border-purple-200";
                                } else if (flag === "LIKELY_TO_SELL_OUT") {
                                  badgeClass += " bg-orange-50 text-orange-700 border border-orange-200";
                                } else if (flag === "NEW_ON_VIATOR") {
                                  badgeClass += " bg-pink-50 text-pink-700 border border-pink-200";
                                } else {
                                  badgeClass += " bg-blue-50 text-blue-700 border border-blue-200";
                                }
                                
                                return (
                                  <Badge key={flagIndex} variant="secondary" className={badgeClass}>
                                    {flag === "NEW_ON_VIATOR" ? "NEW" : flag.replace(/_/g, ' ')}
                                  </Badge>
                                );
                              })}
                            </div>
                          )}

                          <div className="mb-3">
                            <TourPromotionCard 
                              productId={tourId} 
                              compact={true}
                              tourData={tour}
                              destinationId={safeDestination.id}
                              initialScore={promotionScores[tourId] || {
                                product_id: tourId,
                                total_score: 0,
                                monthly_score: 0,
                                weekly_score: 0,
                                past_28_days_score: 0,
                              }}
                            />
                          </div>

                          <Button
                            asChild
                            size="sm"
                            className="w-full sunset-gradient text-white font-semibold hover:scale-105 transition-transform duration-200 mt-auto"
                          >
                            <Link href={tourUrl}>
                              View Details
                              <ArrowRight className="w-4 h-4 ml-1" />
                            </Link>
                          </Button>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
                
                {/* Desktop grid layout - 4 columns, 12 tours */}
                <div className="hidden md:grid md:grid-cols-4 gap-6">
                  {tours.all.slice(0, 12).map((tour, index) => {
                    const tourId = getTourProductId(tour);
                    const tourUrl = getTourUrl(tourId, tour.title);
                    
                    return (
                      <Card key={`${tourId}-${index}`} className="bg-white overflow-hidden hover:shadow-lg transition-all duration-300 hover:-translate-y-1 flex flex-col">
                        <Link href={tourUrl}>
                          <div className="relative h-40 bg-gray-200 flex-shrink-0 cursor-pointer">
                            {tour.images?.[0]?.variants?.[3]?.url ? (
                              <img
                                src={tour.images[0].variants[3].url}
                                alt={tour.title}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center bg-gray-200">
                                <Search className="w-6 h-6 text-gray-400" />
                              </div>
                            )}
                          </div>
                        </Link>

                        <CardContent className="p-4 flex-1 flex flex-col">
                          <Link href={tourUrl}>
                            <h4 className="font-semibold text-sm text-gray-800 mb-2 line-clamp-2 h-10 hover:text-purple-600 transition-colors cursor-pointer">
                              {tour.title}
                            </h4>
                          </Link>
                          
                          {tour.flags && Array.isArray(tour.flags) && tour.flags.length > 0 && (
                            <div className="flex flex-wrap gap-1 mb-2">
                              {tour.flags.slice(0, 2).map((flag, flagIndex) => {
                                let badgeClass = "text-xs font-medium px-2 py-1 rounded-full";
                                if (flag === "FREE_CANCELLATION") {
                                  badgeClass += " bg-green-50 text-green-700 border border-green-200";
                                } else if (flag === "PRIVATE_TOUR") {
                                  badgeClass += " bg-purple-50 text-purple-700 border border-purple-200";
                                } else if (flag === "LIKELY_TO_SELL_OUT") {
                                  badgeClass += " bg-orange-50 text-orange-700 border border-orange-200";
                                } else if (flag === "NEW_ON_VIATOR") {
                                  badgeClass += " bg-pink-50 text-pink-700 border border-pink-200";
                                } else {
                                  badgeClass += " bg-blue-50 text-blue-700 border border-blue-200";
                                }
                                
                                return (
                                  <Badge key={flagIndex} variant="secondary" className={badgeClass}>
                                    {flag === "NEW_ON_VIATOR" ? "NEW" : flag.replace(/_/g, ' ')}
                                  </Badge>
                                );
                              })}
                            </div>
                          )}

                          <div className="mb-2">
                            <TourPromotionCard 
                              productId={tourId} 
                              compact={true}
                              tourData={tour}
                              destinationId={safeDestination.id}
                              initialScore={promotionScores[tourId] || {
                                product_id: tourId,
                                total_score: 0,
                                monthly_score: 0,
                                weekly_score: 0,
                                past_28_days_score: 0,
                              }}
                            />
                          </div>

                          <Button
                            asChild
                            size="sm"
                            className="w-full sunset-gradient text-white font-semibold hover:scale-105 transition-transform duration-200 mt-auto text-xs"
                          >
                            <Link href={tourUrl}>
                              View Details
                              <ArrowRight className="w-3 h-3 ml-1" />
                            </Link>
                          </Button>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>

                {/* View All Button */}
                <div className="text-center mt-8">
                  <Button
                    asChild
                    size="lg"
                    className="sunset-gradient text-white font-semibold hover:scale-105 transition-transform duration-200 px-8 py-6"
                  >
                    <Link href={`/destinations/${safeDestination.id}/tours`}>
                      {totalToursCount !== null && totalToursCount > 0 
                        ? `View All ${totalToursCount} Tours & Activities in ${safeDestination.fullName}`
                        : `View All Tours & Activities in ${safeDestination.fullName}`
                      }
                      <ArrowRight className="w-5 h-5 ml-2" />
                    </Link>
                  </Button>
                  <p className="text-sm text-gray-500 mt-2">
                    Browse all available tours, filter by category, price, and more
                  </p>
                </div>
              </>
            ) : (
              <div className="text-center py-12 bg-white rounded-lg">
                <p className="text-gray-500 mb-2">Tours are loading or no tours found at the moment.</p>
                <p className="text-sm text-gray-400 mb-6">Try browsing all tours to see what's available.</p>
                <Button
                  asChild
                  size="lg"
                  className="sunset-gradient text-white font-semibold hover:scale-105 transition-transform duration-200"
                >
                  <Link href={`/destinations/${safeDestination.id}/tours`}>
                    Browse All Tours & Activities
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </Link>
                </Button>
              </div>
            )}
          </div>
        </section>

        {/* Other Destinations in Same Country */}
        {countryDestinations.length > 0 && safeDestination.country && (
          <section className="py-12 bg-white border-t">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="mb-6">
                <Card className="bg-gradient-to-br from-purple-50 to-blue-50 border-purple-200">
                  <CardContent className="p-4 sm:p-6">
                    <div className="flex flex-col sm:flex-row items-start gap-3 sm:gap-4">
                      <div className="w-10 h-10 sm:w-12 sm:h-12 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0">
                        <MapPin className="w-5 h-5 sm:w-6 sm:h-6 text-purple-600" />
                      </div>
                      <div className="flex-1 w-full">
                        <h3 className="text-base sm:text-lg font-bold text-gray-900 mb-1 sm:mb-2">
                          Top Tours in Other {safeDestination.country} Destinations
                        </h3>
                        <p className="text-xs sm:text-sm text-gray-600 mb-3">
                          Explore top-rated tours and activities in other amazing destinations across {safeDestination.country}.
                        </p>
                        <div className="grid grid-cols-2 sm:flex sm:flex-wrap gap-2 mb-3">
                          {countryDestinations.slice(0, showMoreCountryDestinations).map((otherDest, index) => (
                            <Link key={`${otherDest.id}-${index}`} href={`/destinations/${otherDest.id}/tours`}>
                              <Button 
                                variant="outline" 
                                size="sm"
                                className="w-full sm:w-auto border-purple-300 text-purple-700 hover:bg-purple-50 text-xs px-2 sm:px-3 py-1.5 h-auto whitespace-nowrap justify-center"
                              >
                                {otherDest.name}
                              </Button>
                            </Link>
                          ))}
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {countryDestinations.length > showMoreCountryDestinations && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => setShowMoreCountryDestinations(countryDestinations.length)}
                              className="text-purple-700 hover:text-purple-800 hover:bg-purple-50 text-xs"
                            >
                              View All ({countryDestinations.length} destinations)
                              <ArrowRight className="w-3 h-3 ml-1" />
                            </Button>
                          )}
                          {showMoreCountryDestinations > 12 && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => setShowMoreCountryDestinations(12)}
                              className="text-gray-600 hover:text-gray-800 hover:bg-gray-50 text-xs"
                            >
                              Show Less
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </section>
        )}

        {/* Popular Categories */}
        {safeDestination.tourCategories && Array.isArray(safeDestination.tourCategories) && safeDestination.tourCategories.length > 0 && (
          <section className="py-12 sm:py-16 bg-white overflow-hidden">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
                viewport={{ once: true }}
                className="text-center mb-8 sm:mb-12"
              >
                <h2 className="text-2xl sm:text-3xl md:text-4xl font-poppins font-bold text-gray-800 mb-4 sm:mb-6">
                  Popular Categories in {safeDestination.fullName}
                </h2>
                <p className="text-base sm:text-lg text-gray-600 max-w-3xl mx-auto">
                  Explore the most popular tour categories in {safeDestination.fullName}
                </p>
              </motion.div>

              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                {safeDestination.tourCategories.slice(0, 6).map((category, index) => {
                  const categoryName = typeof category === 'string' ? category : category.name;
                  const displayName = getDisplayCategoryName(categoryName);
                  const hasGuide = typeof category === 'object' && category.hasGuide;
                  const categorySlug = categoryName.toLowerCase()
                    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
                    .replace(/&/g, 'and')
                    .replace(/'/g, '')
                    .replace(/\./g, '')
                    .replace(/ /g, '-');
                  
                  // Link to tours page with category filter, or guide if available
                  const categoryLink = hasGuide 
                    ? `/destinations/${safeDestination.id}/guides/${categorySlug}`
                    : `/destinations/${safeDestination.id}/tours`;
                  
                  return (
                    <motion.div
                      key={categoryName}
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5, delay: index * 0.1 }}
                      viewport={{ once: true }}
                    >
                      <Link href={categoryLink}>
                        <Card className={`bg-gradient-to-br transition-all duration-300 hover:shadow-lg hover:-translate-y-1 cursor-pointer h-full border-0 ${
                          hasGuide 
                            ? 'from-purple-50 to-pink-50 hover:from-purple-100 hover:to-pink-100 border-2 border-purple-200' 
                            : 'from-blue-50 to-purple-50 hover:from-blue-100 hover:to-purple-100'
                        }`}>
                          <CardContent className="p-6 text-center flex flex-col items-center justify-center min-h-[120px]">
                            {hasGuide && (
                              <BookOpen className="w-5 h-5 text-purple-600 mb-2" />
                            )}
                            <h3 className="font-poppins font-semibold text-gray-800 text-sm md:text-base mb-1">
                              {displayName}
                            </h3>
                            {hasGuide ? (
                              <p className="text-xs text-purple-600 font-medium">Read Guide</p>
                            ) : (
                              <p className="text-xs text-gray-500">View Tours</p>
                            )}
                          </CardContent>
                        </Card>
                      </Link>
                    </motion.div>
                  );
                })}
              </div>
            </div>
          </section>
        )}


        {/* Related Travel Guides Carousel Section */}
        {normalizedRelatedGuides.length > 0 && (
          <section className="py-12 bg-white">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <h3 className="text-2xl font-poppins font-bold text-gray-800 mb-6 text-center">
                {safeDestination.country} Travel Guides
              </h3>
              {isMobile ? (
                <div className="flex justify-center">
                  <div className="relative w-full max-w-sm">
                    <div className="flex items-center justify-center mb-6 space-x-4">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setGuideCarouselIndex(Math.max(0, guideCarouselIndex - 1))}
                        disabled={guideCarouselIndex === 0}
                        className="w-10 h-10 p-0"
                      >
                        <ChevronLeft className="w-4 h-4" />
                      </Button>
                      <span className="text-sm text-gray-600">
                        {guideCarouselIndex + 1} of {normalizedRelatedGuides.length}
                      </span>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setGuideCarouselIndex(Math.min(normalizedRelatedGuides.length - 1, guideCarouselIndex + 1))}
                        disabled={guideCarouselIndex >= normalizedRelatedGuides.length - 1}
                        className="w-10 h-10 p-0"
                      >
                        <ChevronRight className="w-4 h-4" />
                      </Button>
                    </div>
                    <div className="overflow-hidden px-4">
                      <div 
                        className="flex transition-transform duration-300 ease-in-out gap-6"
                        style={{ 
                          transform: `translateX(calc(-${guideCarouselIndex * 100}% - ${guideCarouselIndex * 1.5}rem))`
                        }}
                      >
                        {normalizedRelatedGuides.map((guide) => (
                          <Link 
                            key={guide.id}
                            href={`/travel-guides/${guide.id}`}
                            className="w-[calc(100%-2rem)] flex-shrink-0 group"
                          >
                            <Card className="h-full overflow-hidden hover:shadow-xl transition-all duration-300 hover:-translate-y-1 flex flex-col">
                              <div className="relative h-48 overflow-hidden bg-gray-200">
                                {guide.image ? (
                                  <img
                                    src={guide.image}
                                    alt={guide.title}
                                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                                  />
                                ) : (
                                  <div className="w-full h-full flex items-center justify-center bg-gradient-to-r from-blue-100 to-purple-100">
                                    <BookOpen className="w-12 h-12 text-gray-400" />
                                  </div>
                                )}
                                {guide.category && (
                                  <Badge className="absolute top-4 left-4 adventure-gradient text-white">
                                    {guide.category}
                                  </Badge>
                                )}
                              </div>
                              <CardContent className="p-6 flex flex-col flex-grow">
                                <h4 className="text-lg font-bold text-gray-900 mb-3 line-clamp-2 group-hover:text-blue-600 transition-colors">
                                  {guide.title}
                                </h4>
                                
                                <p className="text-gray-700 mb-4 line-clamp-3 flex-grow text-sm">
                                  {guide.excerpt}
                                </p>
                                
                                <Button 
                                  className="w-full sunset-gradient text-white hover:scale-105 transition-transform duration-200 h-10 text-sm font-semibold mt-auto"
                                >
                                  Read Guide
                                  <ArrowRight className="ml-2 h-4 w-4" />
                                </Button>
                              </CardContent>
                            </Card>
                          </Link>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 justify-items-center max-w-5xl mx-auto">
                        {normalizedRelatedGuides.map((guide) => (
                    <Link 
                      key={guide.id}
                      href={`/travel-guides/${guide.id}`}
                      className="group w-full max-w-sm"
                    >
                      <Card className="h-full overflow-hidden hover:shadow-xl transition-all duration-300 hover:-translate-y-1 flex flex-col">
                        <div className="relative h-48 overflow-hidden bg-gray-200">
                          {guide.image ? (
                            <img
                              src={guide.image}
                              alt={guide.title}
                              className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center bg-gradient-to-r from-blue-100 to-purple-100">
                              <BookOpen className="w-12 h-12 text-gray-400" />
                            </div>
                          )}
                          {guide.category && (
                            <Badge className="absolute top-4 left-4 adventure-gradient text-white">
                              {guide.category}
                            </Badge>
                          )}
                        </div>
                        <CardContent className="p-6 flex flex-col flex-grow">
                          <h4 className="text-lg font-bold text-gray-900 mb-3 line-clamp-2 group-hover:text-blue-600 transition-colors">
                            {guide.title}
                          </h4>
                          
                          <p className="text-gray-700 mb-4 line-clamp-3 flex-grow text-sm">
                            {guide.excerpt}
                          </p>
                          
                          <Button 
                            className="w-full sunset-gradient text-white hover:scale-105 transition-transform duration-200 h-10 text-sm font-semibold mt-auto"
                          >
                            Read Guide
                            <ArrowRight className="ml-2 h-4 w-4" />
                          </Button>
                        </CardContent>
                      </Card>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </section>
        )}

        {/* Plan Your Trip Section */}
        <section className="py-12 sm:py-16 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
              className="text-center mb-12"
            >
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-poppins font-bold text-gray-800 mb-6">
                Plan Your {safeDestination.fullName} Trip
              </h2>
            </motion.div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 sm:gap-12">
              {/* Transportation Tips */}
              <motion.div
                initial={{ opacity: 0, x: -30 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8 }}
                viewport={{ once: true }}
              >
                <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200 h-full">
                  <CardContent className="p-8">
                    <div className="flex items-center mb-4">
                      <Car className="w-8 h-8 text-blue-600 mr-3" />
                      <h3 className="text-2xl font-bold text-gray-800">Transportation Tips</h3>
                    </div>
                    <p className="text-gray-700 mb-6 leading-relaxed">{safeDestination.gettingAround}</p>
                    <div className="bg-white rounded-lg p-4">
                      <h4 className="font-semibold text-gray-800 mb-2">Car Rental Deals in {safeDestination.fullName}</h4>
                      <p className="text-gray-600 text-sm mb-3">Rent a car for maximum flexibility and explore at your own pace on Expedia USA.</p>
                      <Button variant="outline" className="w-full flex items-center justify-center gap-2" onClick={() => window.open(`https://expedia.com/affiliate?siteid=1&landingPage=https%3A%2F%2Fwww.expedia.com%2F&camref=1110lee9j&creativeref=1100l68075&adref=PZXFUWFJMk`, '_blank')}>
                        Find Car Rental Deals
                        <ExternalLink className="w-4 h-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>

              {/* Where to Stay */}
              <motion.div
                initial={{ opacity: 0, x: 30 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8 }}
                viewport={{ once: true }}
              >
                <Card className="bg-gradient-to-br from-purple-50 to-pink-50 border-purple-200 h-full">
                  <CardContent className="p-8">
                    <div className="flex items-center mb-4">
                      <Hotel className="w-8 h-8 text-purple-600 mr-3" />
                      <h3 className="text-2xl font-bold text-gray-800">Where to Stay</h3>
                    </div>
                    <p className="text-gray-700 mb-6 leading-relaxed">
                      Find the perfect accommodation for your {safeDestination.fullName} adventure. From luxury resorts to cozy hotels, we've got you covered.
                    </p>
                    <div className="bg-white rounded-lg p-4">
                      <h4 className="font-semibold text-gray-800 mb-2">Best Hotel Deals in {safeDestination.fullName}</h4>
                      <p className="text-gray-600 text-sm mb-3">Discover top-rated hotels with exclusive rates and special offers on Expedia USA.</p>
                      <Button variant="outline" className="w-full flex items-center justify-center gap-2" onClick={() => window.open(`https://expedia.com/affiliate?siteid=1&landingPage=https%3A%2F%2Fwww.expedia.com%2F&camref=1110lee9j&creativeref=1100l68075&adref=PZXFUWFJMk`, '_blank')}>
                        Find Hotel Deals
                        <ExternalLink className="w-4 h-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            </div>
          </div>
        </section>

        {hasRestaurants && (
          <section className="py-12 sm:py-16 bg-gray-50 overflow-hidden">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
                viewport={{ once: true }}
                className="mb-8 sm:mb-12"
              >
                <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-6">
                  <div className="text-center sm:text-left">
                    <h2 className="text-2xl sm:text-3xl md:text-4xl font-poppins font-bold text-gray-800 mb-4 sm:mb-3">
                      Top Restaurants in {safeDestination.fullName}
                    </h2>
                    <p className="text-base sm:text-lg text-gray-600 max-w-3xl sm:max-w-xl mx-auto sm:mx-0">
                      Reserve a table at our hand-picked local favorites and plan dinner around your tours in {safeDestination.fullName}.
                    </p>
                  </div>
                  <Link href={`/destinations/${safeDestination.id}/restaurants`} className="self-center sm:self-end">
                    <Button variant="outline" className="gap-2">
                      View All Restaurants
                      <ArrowRight className="w-4 h-4" />
                    </Button>
                  </Link>
                </div>
              </motion.div>

              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 sm:gap-8">
                {restaurants.map((restaurant) => {
                  const addressParts = restaurant.contact?.address
                    ? restaurant.contact.address.split(',').map(part => part.trim())
                    : [];
                  const neighborhood = addressParts.length >= 2
                    ? addressParts[addressParts.length - 2]
                    : null;

                  const restaurantUrl = `/destinations/${safeDestination.id}/restaurants/${restaurant.slug}`;

                  return (
                    <motion.article
                      key={restaurant.id}
                      initial={{ opacity: 0, y: 30 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.6 }}
                      viewport={{ once: true }}
                      className="h-full overflow-hidden rounded-2xl border border-blue-100 bg-white shadow-xl transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl"
                    >
                      <div className="relative h-52">
                        <Link href={restaurantUrl} aria-label={`View ${restaurant.name} restaurant details`} className="block h-full">
                          <img
                            src={restaurant.heroImage || safeDestination.imageUrl}
                            alt={restaurant.imageAlt || restaurant.name}
                            className="w-full h-full object-cover"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/15 to-transparent" />
                          <div className="absolute top-4 left-4 flex gap-2">
                            {restaurant.ratings?.googleRating && (
                              <Badge className="bg-white/95 text-gray-900 flex items-center gap-1">
                                <Star className="w-3.5 h-3.5 text-yellow-500" />
                                {restaurant.ratings.googleRating.toFixed(1)}
                              </Badge>
                            )}
                            {restaurant.pricing?.priceRange && (
                              <Badge className="bg-white/85 text-gray-900">
                                {restaurant.pricing.priceRange}
                              </Badge>
                            )}
                          </div>
                        </Link>
                      </div>

                      <div className="p-6 space-y-4">
                        <div className="flex items-start gap-3">
                          <div className="bg-blue-50 text-blue-600 rounded-lg p-2 shadow-inner">
                            <UtensilsCrossed className="w-5 h-5" />
                          </div>
                          <div>
                            <h3 className="text-xl font-semibold text-gray-900 leading-tight">
                              {restaurant.name}
                            </h3>
                            {restaurant.cuisines && (
                              <p className="text-xs uppercase tracking-wide text-blue-600 font-semibold">
                                {restaurant.cuisines.join(' · ')}
                              </p>
                            )}
                          </div>
                        </div>

                        <p className="text-sm text-gray-600 leading-relaxed">
                          {restaurant.tagline || restaurant.summary}
                        </p>

                        <Link
                          href={restaurantUrl}
                          className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-lg bg-orange-500 px-4 py-2.5 text-sm font-semibold text-white shadow-md transition-all duration-200 hover:bg-orange-600"
                        >
                          View Restaurant
                          <ArrowRight className="w-4 h-4" />
                        </Link>
                      </div>
                    </motion.article>
                  );
                })}
              </div>
            </div>
          </section>
        )}

        {/* CTA Section */}
        <section className="py-16 adventure-gradient">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
            >
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
                Ready to Explore {safeDestination.fullName}?
              </h2>
              <p className="text-xl text-white/90 mb-8">
                Discover the best tours and activities in {safeDestination.fullName} with AI-powered recommendations tailored just for you.
              </p>
              <div className="flex flex-wrap justify-center gap-4">
                <Button
                  asChild
                  size="lg"
                  className="sunset-gradient text-white hover:scale-105 transition-transform duration-200 px-8 py-6 text-lg font-semibold"
                >
                  <Link href={`/destinations/${safeDestination.id}/tours`}>
                    View All Tours & Activities in {safeDestination.fullName}
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Link>
                </Button>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Combined Internal Linking Section */}
        {(categoryGuides.length > 0 || relatedDestinations.length > 0) && (
          <section className="py-12 px-4" style={{ backgroundColor: '#764ba2' }}>
            <div className="max-w-7xl mx-auto">
              {/* Related Destinations */}
              {relatedDestinations.length > 0 && (
                <div className="mb-12">
                  <h3 className="text-xl font-semibold text-white mb-6">
                    More {safeDestination.category} Destinations
                  </h3>
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                    {relatedDestinations.map((dest) => (
                      <Link 
                        key={dest.id}
                        href={`/destinations/${dest.id}`}
                        className="text-white/80 hover:text-white transition-colors duration-200 hover:underline"
                      >
                        {dest.name}
                      </Link>
                    ))}
                  </div>
                </div>
              )}

              {/* Related Travel Guides by Region */}
              {categoryGuides.length > 0 && (
                <div>
                  <h3 className="text-xl font-semibold text-white mb-6 text-center">
                    {safeDestination.category} Travel Guides
                  </h3>
                  <div className="flex flex-wrap justify-center gap-4 max-w-5xl mx-auto">
                    {categoryGuides.map((guide) => (
                      <Link 
                        key={guide.id}
                        href={`/travel-guides/${guide.id}`}
                        className="bg-white/10 hover:bg-white/20 backdrop-blur-sm border border-white/20 rounded-lg px-5 py-4 transition-all duration-200 hover:scale-105 w-full max-w-xs"
                      >
                        <div className="text-white hover:text-blue-200 font-medium line-clamp-2 h-12 flex items-center">
                        {guide.title}
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </section>
        )}
      </div>

      {/* Sticky Floating Button */}
      {showStickyButton && (
        <div className="fixed bottom-4 right-4 md:bottom-6 md:right-6 z-40 transition-opacity duration-300">
          <div className="flex flex-col items-end gap-2">
            <button
              onClick={() => setShowStickyButton(false)}
              className="w-10 h-10 bg-white hover:bg-gray-100 rounded-full flex items-center justify-center shadow-xl border-2 border-gray-300 transition-all duration-200 hover:scale-110"
              aria-label="Close"
            >
              <X className="w-6 h-6 text-gray-900 stroke-2" />
            </button>
            <Link href={`/destinations/${safeDestination.id}/tours`}>
              <Button 
                size="lg"
                className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-2xl hover:shadow-3xl transition-all duration-300 hover:scale-105 px-4 py-4 md:px-6 md:py-6 rounded-full font-semibold text-sm md:text-base"
              >
                <span>See {destinationName} Tours & Prices</span>
                <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
            </Link>
          </div>
        </div>
      )}

      <FooterNext />
      
      <SmartTourFinder
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />

      {/* Parent Country Modal - Shows after 5 seconds for small destinations */}
      {showParentCountryModal && safeDestination.parentCountryDestination && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"
          onClick={() => setShowParentCountryModal(false)}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.3 }}
            className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 sm:p-8"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center">
                  <MapPin className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900">Explore More Tours</h3>
                  <p className="text-sm text-gray-500">Discover all destinations</p>
                </div>
              </div>
              <button
                onClick={() => setShowParentCountryModal(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
                aria-label="Close"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <div className="mb-6">
              <p className="text-gray-700 leading-relaxed">
                <span className="font-semibold text-gray-900">{safeDestination.fullName}</span> is part of{' '}
                <span className="font-semibold text-blue-600">{safeDestination.parentCountryDestination.fullName}</span>.
              </p>
              <p className="text-gray-600 mt-2 text-sm">
                View all tours and activities available across {safeDestination.parentCountryDestination.fullName} for the best selection.
              </p>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-3">
              <Button
                asChild
                className="flex-1 sunset-gradient text-white hover:scale-105 transition-transform duration-200 font-semibold"
              >
                <Link href={`/destinations/${safeDestination.parentCountryDestination.id}/tours`}>
                  View All Tours in {safeDestination.parentCountryDestination.fullName}
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button
                variant="outline"
                onClick={() => setShowParentCountryModal(false)}
                className="px-6 border-gray-300 hover:bg-gray-50"
              >
                Stay Here
              </Button>
            </div>
          </motion.div>
        </div>
      )}

      {/* Tour Details Modal */}
      {isTourModalOpen && selectedTour && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4 overflow-y-auto"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setIsTourModalOpen(false);
              setSelectedTour(null);
            }
          }}
        >
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto relative">
            <button 
              onClick={() => {
                setIsTourModalOpen(false);
                setSelectedTour(null);
              }}
              className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 z-10 bg-white rounded-full p-2 shadow-lg"
            >
              ✕
            </button>
            
            <div className="p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Tour Details</h2>
              <p className="text-gray-600 mb-6">Complete tour information</p>
              
              {/* Tour Image */}
              {selectedTour.images?.[0]?.variants?.[3]?.url && (
                <div className="relative h-64 mb-6 rounded-lg overflow-hidden">
                  <img
                    src={selectedTour.images[0].variants[3].url}
                    alt={selectedTour.title}
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
              
              {/* Tour Title and Rating */}
              <h3 className="text-xl font-bold text-gray-900 mb-3">{selectedTour.title}</h3>
              
              {/* Badges */}
              {selectedTour.flags && selectedTour.flags.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-4">
                  {selectedTour.flags.map((flag, index) => {
                    let badgeClass = "text-xs font-medium px-3 py-1 rounded-full";
                    if (flag === "FREE_CANCELLATION") {
                      badgeClass += " bg-green-50 text-green-700 border border-green-200";
                    } else if (flag === "PRIVATE_TOUR") {
                      badgeClass += " bg-purple-50 text-purple-700 border border-purple-200";
                    } else if (flag === "LIKELY_TO_SELL_OUT") {
                      badgeClass += " bg-orange-50 text-orange-700 border border-orange-200";
                    } else {
                      badgeClass += " bg-blue-50 text-blue-700 border border-blue-200";
                    }
                    
                    return (
                      <span key={index} className={badgeClass}>
                        {flag.replace(/_/g, ' ')}
                      </span>
                    );
                  })}
                </div>
              )}
              
              {/* Rating */}
              {selectedTour.reviews && (
                <div className="flex items-center mb-4">
                  <div className="flex items-center bg-yellow-50 px-3 py-1 rounded-full">
                    <Star className="w-4 h-4 text-yellow-400 fill-current mr-1" />
                    <span className="font-semibold text-gray-900">
                      {selectedTour.reviews.combinedAverageRating?.toFixed(1) || 'N/A'}
                    </span>
                    <span className="text-gray-600 ml-1 text-sm">
                      ({selectedTour.reviews.totalReviews || 0} reviews)
                    </span>
                  </div>
                </div>
              )}
              
              {/* Price */}
              <div className="text-2xl font-bold text-orange-600 mb-6">
                From ${selectedTour.pricing?.summary?.fromPrice || 'N/A'}
              </div>
              
              {/* Description */}
              <div className="mb-6">
                <h4 className="font-semibold text-gray-900 mb-2">Description</h4>
                <p className="text-gray-700 leading-relaxed whitespace-pre-line">
                  {selectedTour.description || 'No description available.'}
                </p>
              </div>
              
              {/* Action Buttons */}
              <div className="flex gap-3 pt-4 border-t">
                <Button
                  onClick={() => {
                    setIsTourModalOpen(false);
                    setSelectedTour(null);
                  }}
                  variant="outline"
                  className="flex-1"
                >
                  Close
                </Button>
                <Button
                  onClick={() => {
                    window.open(selectedTour.productUrl || `https://www.viator.com/tours/${selectedTour.productCode}`, '_blank');
                  }}
                  className="flex-1 sunset-gradient text-white"
                >
                  View All Details
                  <ExternalLink className="w-4 h-4 ml-2" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
