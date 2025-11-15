"use client";
import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Search, Star, ExternalLink, ArrowLeft, Sparkles, Brain, X, Filter, Clock, Users, MapPin, ArrowRight, Loader2, Crown } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Card, CardContent } from '../components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import Navigation from '../components/Navigation';
import Footer from '../components/Footer';
import SmartTourFinder from '../components/home/SmartTourFinder';
import { Helmet } from 'react-helmet';
import { useToast } from '@/components/ui/use-toast';

const Results = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const searchTerm = searchParams.get('searchTerm');
  const [tours, setTours] = useState([]);
  const [filteredTours, setFilteredTours] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [pageDescription, setPageDescription] = useState('');
  const [generatingDescription, setGeneratingDescription] = useState(false);
  const [bookingReasons, setBookingReasons] = useState({});
  const [generatingReasons, setGeneratingReasons] = useState({});
  const [selectedTour, setSelectedTour] = useState(null);
  const [showBookingPopup, setShowBookingPopup] = useState(false);
  const [showSearchModal, setShowSearchModal] = useState(false);
  const [destinationCategories, setDestinationCategories] = useState([]);
  const [generatingCategories, setGeneratingCategories] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedPage, setSelectedPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  
  // Filter state
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [filters, setFilters] = useState({
    priceFrom: '',
    priceTo: '',
    privateTour: false
  });
  const [activeFilters, setActiveFilters] = useState({});
  const [filterError, setFilterError] = useState('');
  const { toast } = useToast();

  const structuredData = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    "name": "Tour Search Results - TopTours.ai",
    "description": "AI-powered tour and activity recommendations based on your search criteria. Find the perfect tours for your next adventure.",
    "url": "https://toptours.ai/results",
    "numberOfItems": tours.length,
    "itemListElement": tours.map((tour, index) => ({
      "@type": "TouristAttraction",
      "position": index + 1,
      "name": tour.title,
      "description": tour.description,
      "url": tour.bookingLink,
      "image": tour.imageUrl,
      "aggregateRating": {
        "@type": "AggregateRating",
        "ratingValue": tour.rating,
        "reviewCount": tour.reviewCount
      },
      "offers": {
        "@type": "Offer",
        "price": tour.price,
        "priceCurrency": "USD",
        "availability": "https://schema.org/InStock"
      }
    }))
  };

  useEffect(() => {
    if (searchTerm) {
      // Prepare filter parameters if there are active filters
      const filterParams = {};
      if (activeFilters.priceFrom) {
        filterParams.minPrice = parseInt(activeFilters.priceFrom);
      }
      if (activeFilters.priceTo) {
        filterParams.maxPrice = parseInt(activeFilters.priceTo);
      }
      if (activeFilters.privateTour) {
        filterParams.privateTour = true;
      }
      
      fetchTours(searchTerm, currentPage, Object.keys(filterParams).length > 0 ? filterParams : null);
      generatePageDescription(searchTerm);
      generateDestinationCategories(searchTerm);
      window.scrollTo(0, 0);
    }
  }, [searchTerm, currentPage, activeFilters]);

  // Apply filters when tours change
  useEffect(() => {
    applyFilters();
  }, [tours, activeFilters]);

  const applyFilters = () => {
    if (!tours.length) {
      setFilteredTours([]);
      return;
    }

    let filtered = [...tours];

    // Price filter
    if (activeFilters.priceFrom) {
      filtered = filtered.filter(tour => {
        const price = parseFloat(tour.pricing?.summary?.fromPrice);
        return !isNaN(price) && price >= parseFloat(activeFilters.priceFrom);
      });
    }

    if (activeFilters.priceTo) {
      filtered = filtered.filter(tour => {
        const price = parseFloat(tour.pricing?.summary?.fromPrice);
        return !isNaN(price) && price <= parseFloat(activeFilters.priceTo);
      });
    }

    // Special features filters
    if (activeFilters.privateTour) {
      filtered = filtered.filter(tour => 
        tour.badges?.some(badge => 
          badge.text?.toLowerCase().includes('private') ||
          tour.title?.toLowerCase().includes('private')
        )
      );
    }

    setFilteredTours(filtered);
  };

  const handleApplyFilters = async () => {
    // Validate price range
    if (filters.priceFrom && filters.priceTo) {
      const minPrice = parseInt(filters.priceFrom);
      const maxPrice = parseInt(filters.priceTo);
      
      if (maxPrice < minPrice) {
        setFilterError('Maximum price cannot be lower than minimum price');
        return;
      }
    }
    
    // Clear any previous errors
    setFilterError('');
    
    const newActiveFilters = {};
    
    if (filters.priceFrom) newActiveFilters.priceFrom = filters.priceFrom;
    if (filters.priceTo) newActiveFilters.priceTo = filters.priceTo;
    if (filters.privateTour) newActiveFilters.privateTour = true;

    setActiveFilters(newActiveFilters);
    setShowFilterModal(false);
    
    // Make new API call with filters
    const requestBody = {
      searchTerm: searchTerm,
      page: currentPage
    };
    
    // Add price filters if set
    if (filters.priceFrom) {
      requestBody.minPrice = parseInt(filters.priceFrom);
    }
    if (filters.priceTo) {
      requestBody.maxPrice = parseInt(filters.priceTo);
    }
    
    // Add private tour flag if checked
    if (filters.privateTour) {
      requestBody.privateTour = true;
    }
    
    // Fetch filtered results
    setLoading(true);
    try {
      const response = await fetch('/api/internal/viator-search', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody)
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      if (data.error) {
        throw new Error(data.error);
      }
      
      const products = data.products?.results || [];
      const total = data.products?.totalCount || 0;
      
      setTours(products);
      setTotalCount(total);
      
      toast({
        title: "Filters applied",
        description: `Found ${total} tours matching your criteria`,
      });
    } catch (err) {
      console.error('Filter API error:', err);
      toast({
        title: "Filter error",
        description: "Failed to apply filters. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleClearFilters = async () => {
    setActiveFilters({});
    setFilters({
      priceFrom: '',
      priceTo: '',
      privateTour: false
    });
    setFilterError('');
    
    // Reset to original search without filters
    setLoading(true);
    try {
      const response = await fetch('/api/internal/viator-search', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          searchTerm: searchTerm,
          page: currentPage
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      if (data.error) {
        throw new Error(data.error);
      }
      
      const products = data.products?.results || [];
      const total = data.products?.totalCount || 0;
      
      setTours(products);
      setTotalCount(total);
      
      toast({
        title: "Filters cleared",
        description: "Showing all available tours",
      });
    } catch (err) {
      console.error('Clear filters API error:', err);
      toast({
        title: "Error",
        description: "Failed to clear filters. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const hasActiveFilters = Object.keys(activeFilters).length > 0;

  const generatePageDescription = async (term) => {
    setGeneratingDescription(true);
    
    try {
      const response = await fetch('/api/openai-description', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          searchTerm: term
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      if (data.success && data.description) {
        setPageDescription(data.description);
      }
    } catch (err) {
      console.error('Description generation error:', err);
      // Fallback description if AI fails - make it more specific
      const capitalized = term.split(' ').map(word => 
        word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
      ).join(' ');
      setPageDescription(`Explore the wonders of ${capitalized} and discover unforgettable experiences—your perfect adventure awaits just a click away below! ✨`);
    } finally {
      setGeneratingDescription(false);
    }
  };

  const fetchTours = async (term, page = 1, filterParams = null) => {
    setLoading(true);
    setError(null);
    
    try {
      // Prepare request body with search term and page
      const requestBody = {
        searchTerm: term,
        page: page
      };
      
      // Add filter parameters if provided
      if (filterParams) {
        if (filterParams.minPrice) {
          requestBody.minPrice = filterParams.minPrice;
        }
        if (filterParams.maxPrice) {
          requestBody.maxPrice = filterParams.maxPrice;
        }
        if (filterParams.privateTour) {
          requestBody.privateTour = filterParams.privateTour;
        }
      }
      
      // Call your PHP API endpoint
      const response = await fetch('/api/internal/viator-search', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody)
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('API Response:', errorText);
        throw new Error(`HTTP error! status: ${response.status} - ${errorText}`);
      }

      const data = await response.json();
      
      // Check if the response contains an error
      if (data.error) {
        throw new Error(data.error);
      }
      
      const products = data.products?.results || [];
      const total = data.products?.totalCount || 0;
      
      setTours(products);
      setTotalCount(total);
    } catch (err) {
      console.error('Fetch error:', err);
      setError(`Error: ${err.message}. Please check your API key and try again.`);
    } finally {
      setLoading(false);
    }
  };

  const generateBookingReasons = async (tour) => {
    const tourId = tour.productId || tour.title;
    
    // Don't regenerate if we already have reasons
    if (bookingReasons[tourId]) return;
    
    setGeneratingReasons(prev => ({ ...prev, [tourId]: true }));
    
    try {
      const response = await fetch('/api/openai-why-book.php', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          tourData: {
            title: tour.title,
            location: tour.destinations?.[0]?.name || 'Unknown location',
            rating: tour.reviews?.combinedAverageRating?.toFixed(1) || 'N/A',
            reviewCount: tour.reviews?.totalReviews || 0,
            price: tour.pricing?.summary?.fromPrice || 'N/A',
            duration: tour.duration || 'N/A'
          }
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      if (data.success && data.reasons) {
        setBookingReasons(prev => ({ ...prev, [tourId]: data.reasons }));
      }
    } catch (err) {
      console.error('Booking reasons generation error:', err);
      // Generate more valuable fallback reasons based on tour data
      const fallbackReasons = [
        `⭐ ${tour.reviews?.combinedAverageRating ? `Rated ${tour.reviews.combinedAverageRating} stars by ${tour.reviews.totalReviews} travelers` : 'Highly rated by travelers'}`,
        `🎯 ${tour.title.toLowerCase().includes('adventure') ? 'Perfect for thrill-seekers' : tour.title.toLowerCase().includes('food') ? 'Culinary experience you won\'t forget' : 'Unique experience you\'ll love'}`,
        `💎 ${tour.pricing?.summary?.fromPrice ? `Premium experience at just $${tour.pricing.summary.fromPrice}` : 'Excellent value for money'}`
      ];
      setBookingReasons(prev => ({ ...prev, [tourId]: fallbackReasons.join('\n') }));
    } finally {
      setGeneratingReasons(prev => ({ ...prev, [tourId]: false }));
    }
  };

  const handleBookingPopup = async (tour) => {
    try {
      setSelectedTour(tour);
      setShowBookingPopup(true);
    } catch (err) {
      console.error('Error opening tour details popup:', err);
      // Fallback: just show the basic tour info
      setSelectedTour(tour);
      setShowBookingPopup(true);
    }
  };

  const handlePageChange = (newPage) => {
    setCurrentPage(newPage);
    window.scrollTo(0, 0);
  };

  const generateViatorLink = (searchTerm) => {
    return `https://www.viator.com/searchResults/all?text=${encodeURIComponent(searchTerm)}&pid=P00222666&mcid=42383&medium=link`;
  };

  // Function to create dynamic title
  const createDynamicTitle = (searchTerm) => {
    if (!searchTerm) return '';
    
    // Capitalize first letter of each word
    const capitalized = searchTerm.split(' ').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
    ).join(' ');
    
    return `You are looking for ${capitalized}!`;
  };

  const handleStartPlanning = () => {
    setShowSearchModal(true);
  };

  const generateDestinationCategories = async (searchTerm) => {
    setGeneratingCategories(true);
    
    try {
      // Extract destination from search term (e.g., "aruba snorkeling" -> "aruba")
      const destination = extractDestination(searchTerm);
      
      const response = await fetch('/api/openai-categories', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          destination: destination
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      if (data.success && data.categories) {
        setDestinationCategories(data.categories);
      }
    } catch (err) {
      console.error('Categories generation error:', err);
      // Fallback categories
      const destination = extractDestination(searchTerm);
      setDestinationCategories([
        `${destination} tours`,
        `${destination} activities`,
        `${destination} experiences`,
        `${destination} adventures`,
        `${destination} sightseeing`,
        `${destination} day trips`
      ]);
    } finally {
      setGeneratingCategories(false);
    }
  };

  const extractDestination = (searchTerm) => {
    // Simple extraction - take the first word as destination
    const words = searchTerm.toLowerCase().split(' ');
    return words[0].charAt(0).toUpperCase() + words[0].slice(1);
  };

  const handleCategorySearch = async (category) => {
    const newSearchTerm = `${extractDestination(searchTerm)} ${category}`;
    
    // Navigate to results with the new search term
    navigate(`/results?searchTerm=${encodeURIComponent(newSearchTerm)}`);
    
    // Reset page to 1 for new search
    setCurrentPage(1);
  };

  if (!searchTerm) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
        <Navigation onOpenModal={handleStartPlanning} />
        <div className="container mx-auto px-4 pt-20 py-16 text-center">
          <h1 className="text-3xl font-bold text-gray-800 mb-4">No Search Term Provided</h1>
          <p className="text-gray-600 mb-8">Please go back and enter a search term.</p>
          <Button onClick={() => window.history.back()} className="sunset-gradient text-white font-semibold hover:scale-105 transition-transform duration-200">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Go Back
          </Button>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>Tour Search Results - AI-Powered Travel Recommendations | TopTours.ai</title>
        <meta name="description" content="Discover personalized tour and activity recommendations powered by AI. Browse curated travel experiences based on your preferences and find the perfect adventure." />
        <meta name="keywords" content="tour search results, travel recommendations, AI travel planning, tour booking, travel activities, personalized tours" />
        <link rel="canonical" href="https://toptours.ai/results" />
        
        {/* Open Graph */}
        <meta property="og:title" content="Tour Search Results - AI-Powered Travel Recommendations | TopTours.ai" />
        <meta property="og:description" content="Discover personalized tour and activity recommendations powered by AI. Browse curated travel experiences based on your preferences." />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://toptours.ai/results" />
        <meta property="og:image" content="https://ouqeoizufbofdqbuiwvx.supabase.co/storage/v1/object/public/destinations//TopTours-Featured_image.jpg" />
        <meta property="og:image:width" content="1200" />
        <meta property="og:image:height" content="630" />
        <meta property="og:site_name" content="TopTours.ai" />
        <meta property="og:locale" content="en_US" />
        <meta property="og:image:alt" content="AI-Powered Tour Search Results" />
        
        {/* Twitter Card */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Tour Search Results - AI-Powered Travel Recommendations | TopTours.ai" />
        <meta name="twitter:description" content="Discover personalized tour and activity recommendations powered by AI." />
        <meta name="twitter:image" content="https://toptours.ai/og-image.jpg" />
        <meta name="twitter:image:alt" content="AI-Powered Tour Search Results" />
        
        {/* Structured Data */}
        <script type="application/ld+json">
          {JSON.stringify(structuredData)}
        </script>
      </Helmet>
      
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
        <Navigation onOpenModal={handleStartPlanning} />
        
        {/* Header Section - Vertical Layout */}
        <div className="container mx-auto px-4 pt-20 pb-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6"
          >
            {/* Search Title */}
            <div className="bg-white/90 backdrop-blur-sm border border-gray-200 rounded-xl p-6 shadow-sm mb-4">
              <h1 className="text-3xl font-bold text-gray-800 mb-3 flex items-center gap-2">
                <Search className="w-6 h-6 text-blue-600" />
                {createDynamicTitle(searchTerm)}
              </h1>
              
              {/* AI Generated Description */}
              {generatingDescription ? (
                <div className="flex items-center gap-3">
                  <div className="w-5 h-5 animate-spin rounded-full border-2 border-blue-500 border-t-transparent"></div>
                  <div>
                    <p className="text-base font-medium text-gray-700">Crafting your perfect adventure...</p>
                    <p className="text-sm text-gray-500">Our AI is analyzing the best experiences for you</p>
                  </div>
                </div>
              ) : pageDescription ? (
                <div>
                  <div className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-full px-3 py-1 mb-2">
                    <div className="w-1.5 h-1.5 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full animate-pulse"></div>
                    <span className="text-sm font-medium text-blue-700">AI-Powered Insight</span>
                    <Sparkles className="w-3 h-3 text-blue-500" />
                  </div>
                  <p className="text-base text-gray-700 leading-relaxed">
                    {pageDescription}
                  </p>
                </div>
              ) : (
                <p className="text-base text-gray-600">
                  Discover amazing tours and experiences
                </p>
              )}
            </div>
            
            {/* Popular Categories */}
            {!loading && !error && (
              <div className="bg-white/90 backdrop-blur-sm border border-gray-200 rounded-xl p-6 shadow-sm">
                <div className="text-center mb-4">
                  <div className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-full px-3 py-1 mb-2">
                    <div className="w-1.5 h-1.5 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full animate-pulse"></div>
                    <span className="text-sm font-medium text-blue-700">AI Recommended</span>
                    <Brain className="w-3 h-3 text-blue-500" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-800 mb-1">
                    Popular categories in {extractDestination(searchTerm)}
                  </h3>
                  <p className="text-sm text-gray-600">
                    Discover popular experiences and activities
                  </p>
                </div>
                
                {generatingCategories ? (
                  <div className="text-center py-4">
                    <div className="w-6 h-6 animate-spin rounded-full border border-blue-500 border-t-transparent mx-auto mb-2"></div>
                    <p className="text-sm text-gray-600">Finding popular categories...</p>
                  </div>
                ) : destinationCategories.length > 0 ? (
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-2">
                    {Array.from({ length: 6 }).map((_, index) => {
                      const category = destinationCategories[index];
                      return category ? (
                        <motion.div
                          key={category}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.1 }}
                        >
                          <Button
                            onClick={() => handleCategorySearch(category)}
                            variant="outline"
                            size="sm"
                            className="h-16 w-full flex flex-col justify-center items-center p-2 bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200 text-blue-700 hover:from-blue-100 hover:to-purple-100 hover:border-blue-300 transition-all duration-200 hover:scale-105"
                          >
                            <div className="text-sm font-medium leading-tight text-center">
                              {category}
                            </div>
                          </Button>
                        </motion.div>
                      ) : (
                        <div key={index} className="h-16 w-full opacity-0 pointer-events-none"></div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="text-center py-4">
                    <p className="text-sm text-gray-600">No categories available for this destination.</p>
                  </div>
                )}
              </div>
            )}
          </motion.div>
        </div>

        {/* Filter Section */}
        {!loading && !error && tours.length > 0 && (
          <div className="container mx-auto px-4">
            <div className="mb-6 bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl border border-blue-200 px-4 py-3 flex flex-wrap items-center justify-between gap-3">
              {totalCount > 0 && (
                <div>
                  <p className="text-base text-gray-700 font-medium">
                    Found <span className="font-bold text-blue-600">{totalCount}</span> tours • Page <span className="font-bold text-purple-600">{currentPage}</span> of <span className="font-bold text-purple-600">{Math.ceil(totalCount / 20)}</span>
                  </p>
                </div>
              )}
              
              <div className="flex items-center gap-3">
                <Button
                  onClick={() => setShowFilterModal(true)}
                  variant="outline"
                  className="bg-white border-blue-200 text-blue-700 hover:bg-blue-50 hover:border-blue-300"
                >
                  <Filter className="w-4 h-4 mr-2" />
                  Filter Tours
                </Button>
                
                {hasActiveFilters && (
                  <Button
                    onClick={handleClearFilters}
                    variant="outline"
                    className="bg-white border-red-200 text-red-700 hover:bg-red-50 hover:border-red-300"
                  >
                    <X className="w-4 h-4 mr-2" />
                    Clear Filters
                  </Button>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Loading State */}
        {loading && (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
            <p className="mt-4 text-gray-600">Searching for amazing tours...</p>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="text-center py-12">
            <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md mx-auto">
              <p className="text-red-600 font-medium">Error loading tours</p>
              <p className="text-red-500 text-sm mt-2">{error}</p>
            </div>
          </div>
        )}

        {/* Results Grid */}
        {!loading && !error && tours.length > 0 && (
          <div className="container mx-auto px-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-8"
            >
              {tours.map((tour, index) => {
                const tourId = tour.productId || index;
                
                return (
                  <motion.div
                    key={tourId}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="h-full cursor-pointer"
                    onClick={() => handleBookingPopup(tour)}
                  >
                    <Card className="h-full overflow-hidden hover:shadow-lg transition-all duration-300 hover:-translate-y-1 flex flex-col">
                      {/* Tour Image */}
                      <div className="relative h-32 bg-gray-200 flex-shrink-0">
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

                      {/* Tour Content */}
                      <div className="p-3 flex-1 flex flex-col">
                        <h3 className="font-semibold text-sm text-gray-800 mb-2 line-clamp-2 flex-1">
                          {tour.title}
                        </h3>
                        
                        {/* Tour Badges - Display ALL flags from Viator API */}
                        {tour.flags && Array.isArray(tour.flags) && tour.flags.length > 0 && (
                          <div className="flex flex-wrap gap-1 mb-2">
                            {tour.flags.map((flag, flagIndex) => {
                              // Style different flags with different colors
                              let badgeClass = "text-xs font-medium px-2 py-1 rounded-full";
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
                                <Badge
                                  key={flagIndex}
                                  variant="secondary"
                                  className={badgeClass}
                                >
                                  {flag.replace(/_/g, ' ')}
                                </Badge>
                              );
                            })}
                          </div>
                        )}

                        {/* Rating */}
                        {tour.reviews && (
                          <div className="flex items-center mb-2">
                            <Star className="w-3 h-3 text-yellow-400 fill-current" />
                            <span className="font-medium text-gray-700 ml-1 text-sm">
                              {tour.reviews.combinedAverageRating?.toFixed(1) || 'N/A'}
                            </span>
                            <span className="text-gray-500 text-xs ml-1">
                              ({tour.reviews.totalReviews || 0})
                            </span>
                          </div>
                        )}

                        {/* Price */}
                        <div className="text-lg font-bold text-orange-600 mb-3">
                          From ${tour.pricing?.summary?.fromPrice || 'N/A'}
                        </div>

                        {/* AI Booking Reasons Button */}
                        <Button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleBookingPopup(tour);
                          }}
                          variant="outline"
                          size="sm"
                          className="mb-2 bg-gradient-to-r from-purple-50 to-blue-50 border-purple-200 text-purple-700 hover:from-purple-100 hover:to-blue-100 hover:border-purple-300 transition-all duration-200 text-xs"
                        >
                          <Brain className="w-3 h-3 mr-1" />
                          Quick View
                        </Button>

                        {/* View Details Button */}
                        <Button
                          asChild
                          size="sm"
                          onClick={(e) => e.stopPropagation()}
                          className="w-full sunset-gradient text-white font-semibold hover:scale-105 transition-transform duration-200 mt-auto text-xs"
                        >
                          <a
                            href={tour.productUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center justify-center"
                          >
                            View Details
                            <ExternalLink className="w-3 h-3 ml-1" />
                          </a>
                        </Button>
                      </div>
                    </Card>
                  </motion.div>
                );
              })}
            </motion.div>
          </div>
        )}

        {/* No Results */}
        {!loading && !error && tours.length === 0 && (
          <div className="text-center py-12">
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-8 max-w-md mx-auto">
              <Search className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-800 mb-2">No tours found</h3>
              <p className="text-gray-600 mb-4">
                We couldn't find any tours matching "{searchTerm}". Try a different search term.
              </p>
              {hasActiveFilters && (
                <Button
                  onClick={handleClearFilters}
                  variant="outline"
                  className="bg-white border-blue-200 text-blue-700 hover:bg-blue-50 hover:border-blue-300"
                >
                  <X className="w-4 h-4 mr-2" />
                  Reset Filters
                </Button>
              )}
            </div>
          </div>
        )}

        {/* Pagination */}
        {!loading && !error && totalCount > 20 && (
          <div className="container mx-auto px-4">
            <div className="flex justify-center items-center space-x-4 mb-8">
              <Button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                variant="outline"
                className="bg-white hover:bg-gray-50"
              >
                Previous
              </Button>
              <span className="text-gray-600">
                Page {currentPage} of {Math.ceil(totalCount / 20)}
              </span>
              <Button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage >= Math.ceil(totalCount / 20)}
                variant="outline"
                className="bg-white hover:bg-gray-50"
              >
                Next
              </Button>
            </div>
          </div>
        )}

        {/* Go Back to All Tours Button */}
        {!loading && !error && tours.length > 0 && (
          <div className="container mx-auto px-4">
            <div className="text-center mb-8">
              <Button
                onClick={() => {
                  const destination = extractDestination(searchTerm);
                  const newSearchTerm = destination;
                  
                  // Navigate to results with just the destination
                  navigate(`/results?searchTerm=${encodeURIComponent(newSearchTerm)}`);
                  
                  // Reset page to 1 for new search
                  setCurrentPage(1);
                }}
                variant="outline"
                size="lg"
                className="bg-white border-blue-200 text-blue-700 hover:bg-blue-50 hover:border-blue-300 px-8 py-3"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Go back to all tours in {extractDestination(searchTerm)}
              </Button>
            </div>
          </div>
        )}

        {/* See All Tours Button */}
        {!loading && !error && tours.length > 0 && (
          <div className="container mx-auto px-4">
            <div className="text-center mb-8">
              <Button
                asChild
                size="lg"
                className="sunset-gradient text-white font-semibold hover:scale-105 transition-transform duration-200 px-8 py-3"
              >
                <a
                  href={generateViatorLink(searchTerm)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center"
                >
                  Want to see all "{searchTerm}" tours? Click here!
                  <ExternalLink className="w-4 h-4 ml-2" />
                </a>
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Filter Modal */}
      {showFilterModal && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
          onClick={() => setShowFilterModal(false)}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="bg-white rounded-2xl shadow-2xl max-w-md w-full max-h-[80vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                  <Filter className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="font-bold text-lg text-gray-800">Filter Tours</h3>
                  <p className="text-sm text-gray-600">Refine your search results</p>
                </div>
              </div>
              <Button
                onClick={() => setShowFilterModal(false)}
                variant="ghost"
                size="icon"
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="w-5 h-5" />
              </Button>
            </div>

            {/* Filter Content */}
            <div className="p-6 space-y-6">
              {/* Error Message */}
              {filterError && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                  <p className="text-red-700 text-sm">{filterError}</p>
                </div>
              )}
              
              {/* Price Range */}
              <div>
                <h4 className="font-semibold text-gray-800 mb-3">Price Range</h4>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">From</label>
                    <Input
                      type="number"
                      placeholder="$ Min price"
                      value={filters.priceFrom}
                      onChange={(e) => setFilters(prev => ({ ...prev, priceFrom: e.target.value }))}
                      className="w-full"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">To</label>
                    <Input
                      type="number"
                      placeholder="$ Max price"
                      value={filters.priceTo}
                      onChange={(e) => setFilters(prev => ({ ...prev, priceTo: e.target.value }))}
                      className="w-full"
                    />
                  </div>
                </div>
              </div>

              {/* Special Features */}
              <div>
                <h4 className="font-semibold text-gray-800 mb-3">Special Features</h4>
                <div className="space-y-2">
                  <label className="flex items-center space-x-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={filters.privateTour}
                      onChange={(e) => setFilters(prev => ({ ...prev, privateTour: e.target.checked }))}
                      className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                    <span className="text-sm text-gray-700">Private Tour</span>
                  </label>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="flex gap-3 p-6 border-t border-gray-200">
              <Button
                onClick={() => setShowFilterModal(false)}
                variant="outline"
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                onClick={handleApplyFilters}
                className="flex-1 bg-gradient-to-r from-blue-500 to-purple-500 text-white hover:from-blue-600 hover:to-purple-600"
              >
                Apply Filters
              </Button>
            </div>
          </motion.div>
        </div>
      )}

      {/* Tour Details Popup */}
      {showBookingPopup && selectedTour && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
          onClick={() => setShowBookingPopup(false)}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="bg-white rounded-2xl shadow-2xl max-w-lg w-full max-h-[85vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full flex items-center justify-center">
                  <Brain className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="font-bold text-lg text-gray-800">Tour Details</h3>
                  <p className="text-sm text-gray-600">Complete tour information</p>
                </div>
              </div>
              <Button
                onClick={() => setShowBookingPopup(false)}
                variant="ghost"
                size="icon"
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="w-5 h-5" />
              </Button>
            </div>

            {/* Tour Image */}
            <div className="relative h-48 bg-gray-200">
              {selectedTour.images?.[0]?.variants?.[3]?.url ? (
                <img
                  src={selectedTour.images[0].variants[3].url}
                  alt={selectedTour.title}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-gray-200">
                  <Search className="w-8 h-8 text-gray-400" />
                </div>
              )}
            </div>

            {/* Tour Content */}
            <div className="p-6 space-y-4">
              <div>
                <h2 className="text-xl font-bold text-gray-800 mb-3 leading-tight">{selectedTour.title}</h2>
                
                {/* Tour Badges - Display ALL flags from Viator API */}
                {selectedTour.flags && Array.isArray(selectedTour.flags) && selectedTour.flags.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-4">
                    {selectedTour.flags.map((flag, flagIndex) => {
                      // Style different flags with different colors
                      let badgeClass = "text-xs font-medium px-2 py-1 rounded-full";
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
                        <Badge
                          key={flagIndex}
                          variant="secondary"
                          className={badgeClass}
                        >
                          {flag.replace(/_/g, ' ')}
                        </Badge>
                      );
                    })}
                  </div>
                )}
                
                {/* Legacy badges fallback */}
                {(!selectedTour.flags || selectedTour.flags.length === 0) && selectedTour.badges && Array.isArray(selectedTour.badges) && selectedTour.badges.length > 0 && selectedTour.badges.some(badge => badge && badge.text) && (
                  <div className="flex flex-wrap gap-2 mb-4">
                    {selectedTour.badges.filter(badge => badge && badge.text).map((badge, badgeIndex) => (
                      <Badge
                        key={badgeIndex}
                        variant="secondary"
                        className="bg-gradient-to-r from-blue-50 to-purple-50 text-blue-700 border-blue-200"
                      >
                        {badge.text}
                      </Badge>
                    ))}
                  </div>
                )}

                {/* Rating and Price */}
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center">
                    <Star className="w-5 h-5 text-yellow-400 fill-current" />
                    <span className="font-medium text-gray-700 ml-1">
                      {selectedTour.reviews?.combinedAverageRating?.toFixed(1) || 'N/A'}
                    </span>
                    <span className="text-gray-500 text-sm ml-1">
                      ({selectedTour.reviews?.totalReviews || 0} reviews)
                    </span>
                  </div>
                  <div className="text-2xl font-bold text-orange-600">
                    From ${selectedTour.pricing?.summary?.fromPrice || 'N/A'}
                  </div>
                </div>
              </div>

              {/* Description */}
              {selectedTour.description && (
                <div>
                  <h4 className="font-semibold text-gray-800 mb-2">Description</h4>
                  <p className="text-gray-700 leading-relaxed text-sm">{selectedTour.description}</p>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="flex gap-3 p-6 border-t border-gray-200">
              <Button
                onClick={() => setShowBookingPopup(false)}
                variant="outline"
                className="flex-1"
              >
                Close
              </Button>
              <Button
                asChild
                className="flex-1 bg-gradient-to-r from-orange-500 to-red-500 text-white hover:from-orange-600 hover:to-red-600"
              >
                <a
                  href={selectedTour.productUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center"
                >
                  View All Details
                  <ExternalLink className="w-4 h-4 ml-2" />
                </a>
              </Button>
            </div>
          </motion.div>
        </div>
      )}

      <Footer />
    </>
  );
};

export default Results;