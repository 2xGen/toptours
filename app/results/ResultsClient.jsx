"use client";
import React, { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Search, Star, ExternalLink, ArrowLeft, Sparkles, Brain, X, Filter, Clock, Users, MapPin, ArrowRight, Loader2, Crown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import NavigationNext from '@/components/NavigationNext';
import FooterNext from '@/components/FooterNext';
import SmartTourFinder from '@/components/home/SmartTourFinder';
import { useToast } from '@/components/ui/use-toast';
import Link from 'next/link';
import { destinations } from '@/data/destinationsData';
import { travelGuides } from '@/data/travelGuidesData';
import { getTourUrl, getTourProductId } from '@/utils/tourHelpers';

const regions = ['Africa', 'Asia-Pacific', 'Caribbean', 'Europe', 'North America', 'South America'];

const regionThemes = {
  'Africa': {
    emoji: '🌍',
    background: 'bg-neutral-50',
    border: 'border-neutral-200',
    text: 'text-neutral-700',
    chip: 'bg-white text-neutral-700 border-neutral-200',
  },
  'Asia-Pacific': {
    emoji: '🌏',
    background: 'bg-neutral-50',
    border: 'border-neutral-200',
    text: 'text-neutral-700',
    chip: 'bg-white text-neutral-700 border-neutral-200',
  },
  'Caribbean': {
    emoji: '🏝️',
    background: 'bg-neutral-50',
    border: 'border-neutral-200',
    text: 'text-neutral-700',
    chip: 'bg-white text-neutral-700 border-neutral-200',
  },
  'Europe': {
    emoji: '🗺️',
    background: 'bg-neutral-50',
    border: 'border-neutral-200',
    text: 'text-neutral-700',
    chip: 'bg-white text-neutral-700 border-neutral-200',
  },
  'North America': {
    emoji: '🧭',
    background: 'bg-neutral-50',
    border: 'border-neutral-200',
    text: 'text-neutral-700',
    chip: 'bg-white text-neutral-700 border-neutral-200',
  },
  'South America': {
    emoji: '⛰️',
    background: 'bg-neutral-50',
    border: 'border-neutral-200',
    text: 'text-neutral-700',
    chip: 'bg-white text-neutral-700 border-neutral-200',
  },
  'General Travel Tips': {
    emoji: '📚',
    background: 'bg-neutral-50',
    border: 'border-neutral-200',
    text: 'text-neutral-700',
    chip: 'bg-white text-neutral-700 border-neutral-200',
  },
};

const defaultRegionTheme = {
  emoji: '🌎',
  background: 'bg-neutral-50',
  border: 'border-neutral-200',
  text: 'text-neutral-700',
  chip: 'bg-white text-neutral-700 border-neutral-200',
};

const popularDestinationsByRegion = regions.reduce((acc, region) => {
  const regionDestinations = (destinations || [])
    .filter(destination => destination.category === region)
    .sort((a, b) => a.name.localeCompare(b.name))
    .slice(0, 10)
    .map(destination => ({
      id: destination.id,
      name: destination.name || destination.fullName || destination.id,
    }));

  if (regionDestinations.length > 0) {
    acc[region] = regionDestinations;
  }
  return acc;
}, {});

const travelGuideRegions = [...regions, 'General Travel Tips'];

const travelGuidesByRegion = travelGuideRegions.reduce((acc, region) => {
  const guides = (travelGuides || [])
    .filter(guide => guide.category === region)
    .sort((a, b) => {
      if (a.featured && !b.featured) return -1;
      if (!a.featured && b.featured) return 1;
      return new Date(b.publishDate) - new Date(a.publishDate);
    });

  if (guides.length > 0) {
    acc[region] = guides;
  }

  return acc;
}, {});

const Results = () => {
  const searchParams = useSearchParams();
  const router = useRouter();
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
      const response = await fetch('/api/viator-search', {
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
      const response = await fetch('/api/viator-search', {
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
      const response = await fetch('/api/ai-desc', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          searchTerm: term
        })
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Description API HTTP error:', response.status, errorText);
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log('Description API full response:', JSON.stringify(data, null, 2));
      
      // If there's an error in the response, log it
      if (data.error) {
        console.error('Description API returned error:', data.error, data.details);
        throw new Error(data.error);
      }
      
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
      const response = await fetch('/api/viator-search', {
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
      
      const response = await fetch('/api/ai-cat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          destination: destination
        })
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Categories API HTTP error:', response.status, errorText);
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log('Categories API full response:', JSON.stringify(data, null, 2));
      console.log('Categories API response:', data);
      console.log('Categories array:', data.categories);
      console.log('Response has error?', data.error);
      
      // If there's an error in the response, throw it
      if (data.error) {
        console.error('Categories API returned error:', data.error, data.details);
        throw new Error(data.error);
      }
      
      if (data.success && data.categories && Array.isArray(data.categories)) {
        console.log('Setting categories:', data.categories);
        setDestinationCategories(data.categories);
      } else {
        console.log('Categories not valid, using fallback');
        throw new Error('Invalid categories response');
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
    router.push(`/results?searchTerm=${encodeURIComponent(newSearchTerm)}`);
    
    // Reset page to 1 for new search
    setCurrentPage(1);
  };

  if (!searchTerm) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
        <NavigationNext onOpenModal={handleStartPlanning} />
        <div className="container mx-auto px-4 pt-20 py-16 text-center">
          <h1 className="text-3xl font-bold text-gray-800 mb-4">No Search Term Provided</h1>
          <p className="text-gray-600 mb-8">Please go back and enter a search term.</p>
          <Button onClick={() => window.history.back()} className="sunset-gradient text-white font-semibold hover:scale-105 transition-transform duration-200">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Go Back
          </Button>
        </div>
        <FooterNext />
      </div>
    );
  }

  return (
    <>
      {/* SEO meta tags will be handled by parent page.js */}
      {/* Structured Data for search results */}
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }} />
      
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100" suppressHydrationWarning>
        <NavigationNext onOpenModal={handleStartPlanning} />
        
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
            
            {/* Popular Categories - FORCED TO SHOW */}
            <div className="bg-white/90 backdrop-blur-sm border border-gray-200 rounded-xl p-6 shadow-sm mt-6">
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
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-2">
                    {[1, 2, 3, 4, 5, 6].map((index) => (
                      <div
                        key={index}
                        className="h-16 w-full flex flex-col justify-center items-center p-2 bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-md animate-pulse"
                      >
                        <div className="h-4 bg-blue-200 rounded w-3/4"></div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-2">
                    {destinationCategories.map((category, index) => (
                      <Button
                        key={category}
                        onClick={() => handleCategorySearch(category)}
                        variant="outline"
                        size="sm"
                        className="h-16 w-full flex flex-col justify-center items-center p-2 bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200 text-blue-700 hover:from-blue-100 hover:to-purple-100 hover:border-blue-300 transition-all duration-200 hover:scale-105"
                      >
                        <div className="text-sm font-medium leading-tight text-center">
                          {category}
                        </div>
                      </Button>
                    ))}
                  </div>
                )}
              </div>
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
                const tourId = getTourProductId(tour);
                const tourUrl = getTourUrl(tourId, tour.title);
                
                return (
                  <motion.div
                    key={tourId || index}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="h-full"
                  >
                    <Card className="h-full overflow-hidden hover:shadow-lg transition-all duration-300 hover:-translate-y-1 flex flex-col">
                      {/* Tour Image - Clickable link to internal page */}
                      <Link href={tourUrl}>
                        <div className="relative h-32 bg-gray-200 flex-shrink-0 cursor-pointer">
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

                      {/* Tour Content */}
                      <div className="p-3 flex-1 flex flex-col">
                        <Link href={tourUrl}>
                          <h3 className="font-semibold text-sm text-gray-800 mb-2 line-clamp-2 flex-1 hover:text-purple-600 transition-colors cursor-pointer">
                            {tour.title}
                          </h3>
                        </Link>
                        
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
                              ({tour.reviews.totalReviews?.toLocaleString('en-US') || 0})
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

                        {/* View Details Button - Links to internal page */}
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
                  router.push(`/results?searchTerm=${encodeURIComponent(newSearchTerm)}`);
                  
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
                  rel="sponsored noopener noreferrer"
                  className="flex items-center justify-center"
                >
                  Want to see all "{searchTerm}" tours? Click here!
                  <ExternalLink className="w-4 h-4 ml-2" />
                </a>
              </Button>
            </div>
          </div>
        )}

        {/* Popular Destinations by Region */}
        <div className="container mx-auto px-4 pb-12">
          <div className="bg-white/90 backdrop-blur-sm border border-gray-200 rounded-2xl p-8 shadow-sm">
            <div className="text-center mb-8">
              <div className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-full px-3 py-1 mb-3">
                <div className="w-1.5 h-1.5 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full animate-pulse"></div>
                <span className="text-sm font-medium text-blue-700">Plan by Region</span>
                <MapPin className="w-3 h-3 text-blue-500" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900">Popular Destinations</h3>
              <p className="text-sm text-gray-600 mt-2">Explore 10 hand-picked destinations in every region we cover</p>
            </div>
            <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
              {Object.entries(popularDestinationsByRegion).map(([region, regionDestinations]) => {
                const theme = regionThemes[region] || defaultRegionTheme;
                return (
                  <div
                    key={region}
                    className={`rounded-2xl border ${theme.border} ${theme.background} p-5 shadow-sm transition-transform duration-200 hover:-translate-y-0.5`}
                  >
                    <div className="flex items-center justify-between gap-3 mb-4">
                      <div className="flex items-center gap-3">
                        <span className="text-2xl" aria-hidden="true">{theme.emoji}</span>
                        <div>
                          <h4 className={`text-lg font-semibold text-gray-900`}>{region}</h4>
                          <p className={`text-xs uppercase tracking-wide font-medium ${theme.text}`}>
                            {regionDestinations.length} destinations
                          </p>
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {regionDestinations.map(destination => (
                        <Button
                          key={destination.id}
                          asChild
                          variant="outline"
                          size="sm"
                          className={`border ${theme.chip} hover:shadow-sm hover:-translate-y-0.5 transition-transform duration-150`}
                        >
                          <Link href={`/destinations/${destination.id}`}>
                            {destination.name}
                          </Link>
                        </Button>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Travel Guides by Region */}
        <div className="container mx-auto px-4 pb-20">
          <div className="bg-white/90 backdrop-blur-sm border border-gray-200 rounded-2xl p-8 shadow-sm">
            <div className="text-center mb-8">
              <div className="inline-flex items-center gap-2 bg-gradient-to-r from-purple-50 via-blue-50 to-purple-100 border border-purple-200 rounded-full px-3 py-1 mb-3">
                <div className="w-1.5 h-1.5 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full animate-pulse"></div>
                <span className="text-sm font-medium text-purple-700">Travel Library</span>
                <Crown className="w-3 h-3 text-purple-500" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900">Travel Guides by Region</h3>
              <p className="text-sm text-gray-600 mt-2">Every long-form travel guide we&apos;ve published, organized by the regions you love</p>
            </div>
            <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
              {Object.entries(travelGuidesByRegion).map(([region, guides]) => {
                const theme = regionThemes[region] || defaultRegionTheme;
                const isGeneralTips = region === 'General Travel Tips';
                const cardClasses = `rounded-xl border ${theme.border} ${theme.background} p-5`;
                const responsiveClasses = isGeneralTips ? 'md:col-span-2 xl:col-span-3' : '';
                const contentAlignment = isGeneralTips ? 'items-center text-center' : 'items-center';
                const justifyClass = isGeneralTips ? 'justify-center' : 'justify-between';

                return (
                  <div
                    key={region}
                    className={`${cardClasses} ${responsiveClasses}`.trim()}
                  >
                    <div className={`flex ${contentAlignment} ${justifyClass} gap-3 mb-4`}>
                      <div className={`flex gap-3 ${isGeneralTips ? 'flex-col' : 'flex-row items-center'}`}>
                        <span className="text-2xl" aria-hidden="true">{theme.emoji}</span>
                        <div className={isGeneralTips ? 'space-y-1' : ''}>
                          <h4 className="text-lg font-semibold text-gray-900">{region}</h4>
                          <p className={`text-xs uppercase tracking-wide font-medium ${theme.text}`}>
                            {guides.length} guides
                          </p>
                        </div>
                      </div>
                      {!isGeneralTips && <span className="text-xs text-neutral-500">{guides.length} guides</span>}
                    </div>
                    <div className={`flex flex-wrap gap-2 ${isGeneralTips ? 'justify-center' : ''}`}>
                      {guides.map(guide => (
                        <Link
                          key={guide.id}
                          href={`/travel-guides/${guide.id}`}
                          className={`px-3 py-1 text-sm rounded-full border bg-white ${theme.chip} hover:shadow-sm hover:-translate-y-0.5 transition-transform duration-150`}
                        >
                          {guide.title}
                        </Link>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
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
                  rel="sponsored noopener noreferrer"
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

      <FooterNext />
    </>
  );
};

export default Results;