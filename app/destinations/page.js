"use client";
import { useState, useEffect, useMemo } from 'react';
import NavigationNext from '@/components/NavigationNext';
import FooterNext from '@/components/FooterNext';
import SmartTourFinder from '@/components/home/SmartTourFinder';
import { destinations, getDestinationsByCountry } from '@/data/destinationsData';
import viatorDestinationsData from '@/data/viatorDestinations.json';
import viatorDestinationsClassifiedData from '@/data/viatorDestinationsClassified.json';
import { getDestinationSeoContent } from '@/data/destinationSeoContent';
import { getDestinationFullContent } from '@/data/destinationFullContent';
import generatedFullContentData from '../../generated-destination-full-content.json';

// Use classified destinations (has region/country data)
const viatorDestinationsClassified = Array.isArray(viatorDestinationsClassifiedData) ? viatorDestinationsClassifiedData : null;
let classifiedDataIndex = null; // Index for fast lookup

// Create indexes for fast lookup
if (viatorDestinationsClassified) {
  
  classifiedDataIndex = {
    byId: new Map(),
    byName: new Map(),
    bySlug: new Map(),
  };
  
  viatorDestinationsClassified.forEach(cd => {
      // Handle both string and number IDs
      const id = cd.destinationId?.toString() || String(cd.destinationId || '');
      const idNum = id ? String(parseInt(id.replace(/^d/i, ''), 10)) : '';
      const name = (cd.destinationName || cd.name || '').toLowerCase().trim();
      const slug = generateSlug(cd.destinationName || cd.name || '');
      
      // Index by ID (handle both with and without 'd' prefix, and numeric versions)
      if (id) {
        classifiedDataIndex.byId.set(id, cd);
        const numericId = id.replace(/^d/i, '');
        if (numericId !== id && numericId) {
          classifiedDataIndex.byId.set(numericId, cd);
        }
        if (idNum && idNum !== id && idNum !== numericId) {
          classifiedDataIndex.byId.set(idNum, cd);
        }
      }
      
      // Index by name
      if (name) {
        if (!classifiedDataIndex.byName.has(name)) {
          classifiedDataIndex.byName.set(name, []);
        }
        classifiedDataIndex.byName.get(name).push(cd);
      }
      
      // Index by slug
      if (slug) {
        if (!classifiedDataIndex.bySlug.has(slug)) {
          classifiedDataIndex.bySlug.set(slug, []);
        }
        classifiedDataIndex.bySlug.get(slug).push(cd);
      }
    });
}

// Map OpenAI regions to our category names
const regionToCategory = {
  'Europe': 'Europe',
  'North America': 'North America',
  'Caribbean': 'Caribbean',
  'Asia-Pacific': 'Asia-Pacific',
  'Africa': 'Africa',
  'South America': 'South America',
  'Middle East': 'Middle East',
  // Handle variations
  'Australia': 'Asia-Pacific',
  'Oceania': 'Asia-Pacific',
  'Australia & Oceania': 'Asia-Pacific',
  'Central America': 'North America',
  'Asia': 'Asia-Pacific',
  'Central Asia': 'Asia-Pacific',
};

// Helper to generate slug (same as used elsewhere)
function generateSlug(name) {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

// Helper to truncate destination names for buttons (30 chars max with ellipsis)
function truncateDestinationName(name, maxLength = 30) {
  if (!name || name.length <= maxLength) {
    return name;
  }
  return name.substring(0, maxLength).trim() + '...';
}
import { Search, MapPin, ArrowRight, Globe, Ticket, UtensilsCrossed } from 'lucide-react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';

export default function DestinationsPage() {
  const router = useRouter();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [currentPage, setCurrentPage] = useState(1);
  const [otherDestinationsPage, setOtherDestinationsPage] = useState(1);
  const [showMoreCountryDestinations, setShowMoreCountryDestinations] = useState(12);
  const itemsPerPage = 24; // Show 24 destinations per page
  
  // Use Viator destinations from JSON file (no API call needed)
  const viatorDestinations = Array.isArray(viatorDestinationsData) ? viatorDestinationsData : [];
  
  // Calculate total available destinations
  // The classified destinations already include all destinations, so we just use that count
  // Destinations with guides are a subset of the classified data
  const totalAvailableDestinations = useMemo(() => {
    const classifiedCount = Array.isArray(viatorDestinationsClassified) ? viatorDestinationsClassified.length : 0;
    return classifiedCount;
  }, [viatorDestinationsClassified]);


  // Scroll to top when page changes
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [currentPage, otherDestinationsPage]);
  
  // Reset other destinations page when filters change
  useEffect(() => {
    setOtherDestinationsPage(1);
  }, [searchTerm, selectedCategory]);

  const handleOpenModal = () => {
    setIsModalOpen(true);
  };

  const categories = ['All', 'Europe', 'North America', 'Caribbean', 'Asia-Pacific', 'Africa', 'South America', 'Middle East'];

  // Combine regular destinations with Viator destinations
  // Include Viator destinations when there's a search term OR when a region filter is selected
  // Always show destinations with guides (from destinationsData.js + generated content with guides)
  const allDestinations = useMemo(() => {
    const regularDests = (Array.isArray(destinations) ? destinations : []).map(dest => ({
      ...dest,
      isViator: false,
    }));
    
    // Also include destinations from generated content that have guides AND an image but aren't in destinationsData.js
    // Logic: Only show destinations with guides if they have a featured image (for the premium experience)
    const regularDestIds = new Set(regularDests.map(d => d.id));
    const generatedDestsWithGuides = Object.keys(generatedFullContentData || {})
      .filter(slug => {
        // Skip if already in regular destinations
        if (regularDestIds.has(slug)) return false;
        
        // Check if this destination has any categories with guides
        const content = generatedFullContentData[slug];
        if (!content || !content.tourCategories) return false;
        
        // Check if any category has hasGuide: true
        const hasGuides = content.tourCategories.some(cat => 
          typeof cat === 'object' && cat.hasGuide === true
        );
        
        if (!hasGuides) return false;
        
        // Also check if destination has an image (featured image requirement)
        const seoContent = getDestinationSeoContent(slug);
        const hasImage = !!(content.imageUrl || seoContent?.imageUrl || seoContent?.ogImage);
        
        // Only include if it has both guides AND an image
        return hasImage;
      })
      .map(slug => {
        const content = generatedFullContentData[slug];
        const seoContent = getDestinationSeoContent(slug);
        const classifiedDest = classifiedDataIndex?.bySlug.get(slug)?.[0];
        
        return {
          id: slug,
          name: content.destinationName || slug,
          fullName: content.destinationName || slug,
          category: classifiedDest?.region ? (regionToCategory[classifiedDest.region] || classifiedDest.region) : null,
          region: classifiedDest?.region || content.region || null,
          country: classifiedDest?.country || content.country || null,
          briefDescription: seoContent?.briefDescription || content.briefDescription || `Discover tours and activities in ${content.destinationName || slug}`,
          heroDescription: seoContent?.heroDescription || content.heroDescription || null,
          imageUrl: content.imageUrl || seoContent?.imageUrl || seoContent?.ogImage || null,
          tourCategories: content.tourCategories || [],
          whyVisit: content.whyVisit || [],
          highlights: content.highlights || [],
          gettingAround: content.gettingAround || '',
          bestTimeToVisit: content.bestTimeToVisit || null,
          seo: content.seo || seoContent?.seo || null,
          isViator: false, // These have guides, so they're featured destinations
        };
      });
    
    // Combine regular destinations with generated destinations that have guides
    const allFeaturedDests = [...regularDests, ...generatedDestsWithGuides];
    
    // Include Viator destinations if there's a search term OR if a region filter is selected (not "All")
    const shouldIncludeViator = searchTerm.trim() || (selectedCategory !== 'All');
    
    if (!shouldIncludeViator) {
      return allFeaturedDests;
    }
    
    // Get classified data - ensure it's available
    const classifiedData = Array.isArray(viatorDestinationsClassified) ? viatorDestinationsClassified : [];
    
    // Create normalized names from our curated destinations for matching
    // Extract base names (remove country suffixes like ", UAE", ", Italy", etc.)
    const curatedBaseNames = new Set();
    const curatedFullNames = new Set();
    
    // Include both regular destinations and generated destinations with guides
    allFeaturedDests.forEach(dest => {
      const name = (dest.name || '').toLowerCase().trim();
      const fullName = (dest.fullName || dest.name || '').toLowerCase().trim();
      
      curatedBaseNames.add(name);
      curatedFullNames.add(fullName);
      
      // Extract base name (remove country suffix)
      const baseName = fullName.split(',')[0].trim();
      if (baseName && baseName !== fullName) {
        curatedBaseNames.add(baseName);
      }
    });
    
    // Helper function to check if a Viator destination matches any curated destination
    const matchesCurated = (viatorName) => {
      const normalized = viatorName.toLowerCase().trim();
      const baseName = normalized.split(',')[0].trim();
      
      // Check exact matches
      if (curatedBaseNames.has(normalized) || curatedFullNames.has(normalized)) {
        return true;
      }
      
      // Check base name matches (e.g., "Abu Dhabi" matches "Abu Dhabi, UAE")
      if (curatedBaseNames.has(baseName) || curatedFullNames.has(baseName)) {
        return true;
      }
      
      return false;
    };
    
    // Use classified data directly as the source for destinations without guides
    // This file already has destinationId, destinationName, region, and country
    const seenViatorNames = new Set();
    
    const viatorDests = classifiedData
      .filter(classifiedDest => {
        const destName = classifiedDest.destinationName || classifiedDest.name || '';
        if (!destName) return false; // Skip entries without a name
        
        const normalized = destName.toLowerCase().trim();
        
        // Skip if it matches a curated destination
        if (matchesCurated(destName)) {
          return false;
        }
        
        // Skip if we've already seen this exact name with the same country
        const country = (classifiedDest.country || '').toLowerCase();
        const nameCountryKey = `${normalized}|${country}`;
        if (seenViatorNames.has(nameCountryKey)) {
          return false;
        }
        
        seenViatorNames.add(nameCountryKey);
        return true;
      })
      .map(classifiedDest => {
        const destName = classifiedDest.destinationName || classifiedDest.name || '';
        const slug = generateSlug(destName);
        
        // Use region and country directly from classified data (already set by OpenAI script)
        // But fallback to generated content if classified data doesn't have it
        const generatedContent = generatedFullContentData[slug];
        const region = classifiedDest.region || generatedContent?.region || null;
        const country = classifiedDest.country || generatedContent?.country || null;
        
        // Map region to category for filtering
        const category = region ? (regionToCategory[region] || region) : null;
        
        // Get SEO content if available
        const seoContent = getDestinationSeoContent(slug);
        
        return {
          id: slug, // Use slug as ID for SEO-friendly URLs
          name: destName,
          fullName: destName,
          briefDescription: seoContent?.briefDescription || generatedContent?.briefDescription || `Discover tours and activities in ${destName}`,
          heroDescription: seoContent?.heroDescription || generatedContent?.heroDescription || null,
          category: category, // Map region to category for filtering
          region: region,
          country: country,
          imageUrl: null, // No image for Viator destinations
          isViator: true,
          viatorId: classifiedDest.destinationId || classifiedDest.id, // Store original Viator ID for API calls
          seo: seoContent?.seo || null,
        };
      });
    
    return [...allFeaturedDests, ...viatorDests];
  }, [destinations, searchTerm, selectedCategory, viatorDestinationsClassified]);

  // Deduplicate by ID to ensure unique keys - remove duplicates, keeping curated destinations over Viator ones
  const uniqueDestinations = useMemo(() => {
    const seen = new Map();
    allDestinations.forEach(dest => {
      const existing = seen.get(dest.id);
      if (!existing) {
        seen.set(dest.id, dest);
      } else if (!existing.isViator && dest.isViator) {
        // Keep curated over Viator if duplicate
        return;
      } else if (existing.isViator && !dest.isViator) {
        // Replace Viator with curated if duplicate
        seen.set(dest.id, dest);
      }
    });
    return Array.from(seen.values());
  }, [allDestinations]);

  const allFilteredDestinations = uniqueDestinations.filter(dest => {
    if (!searchTerm.trim() && selectedCategory === 'All') {
      // No filters, show all
      return true;
    }
    
    const searchLower = searchTerm.toLowerCase();
    
    // Search in name, fullName, briefDescription, and country
    const matchesSearch = !searchTerm.trim() || 
                         dest.name.toLowerCase().includes(searchLower) ||
                         (dest.fullName && dest.fullName.toLowerCase().includes(searchLower)) ||
                         (dest.briefDescription && dest.briefDescription.toLowerCase().includes(searchLower)) ||
                         // Also search in country field (for both curated and Viator destinations)
                         (dest.country && dest.country.toLowerCase().includes(searchLower));
    
    const matchesCategory = selectedCategory === 'All' || 
                           (dest.category && dest.category === selectedCategory) ||
                           // Also check region field and map it to category
                           (dest.region && regionToCategory[dest.region] === selectedCategory) ||
                           (dest.region && dest.region === selectedCategory);
    return matchesSearch && matchesCategory;
  }).sort((a, b) => {
    // When "All" is selected, sort alphabetically by name only (no grouping by region)
    if (selectedCategory === 'All') {
      return a.name.localeCompare(b.name);
    }
    
    // When a specific category is selected, sort by category first, then by name
    if (a.category !== b.category) {
      const categoryOrder = ['Europe', 'North America', 'Caribbean', 'Asia-Pacific', 'Africa', 'South America', 'Middle East'];
      const aIndex = categoryOrder.indexOf(a.category || '');
      const bIndex = categoryOrder.indexOf(b.category || '');
      if (aIndex !== -1 && bIndex !== -1) return aIndex - bIndex;
      if (aIndex !== -1) return -1;
      if (bIndex !== -1) return 1;
    }
    return a.name.localeCompare(b.name);
  });

  // Separate featured destinations (with guides) from other destinations (Viator-only)
  const featuredDestinations = allFilteredDestinations.filter(dest => !dest.isViator);
  const otherDestinations = allFilteredDestinations.filter(dest => dest.isViator);
  
  // Calculate total filtered destinations (matching current search + category filter)
  // This is the count of all destinations (both featured and Viator) that match the current filters
  const totalFilteredDestinations = allFilteredDestinations.length;
  
  // Pagination for featured destinations
  const featuredTotalPages = Math.ceil(featuredDestinations.length / itemsPerPage);
  const featuredStartIndex = (currentPage - 1) * itemsPerPage;
  const featuredEndIndex = featuredStartIndex + itemsPerPage;
  const paginatedFeaturedDestinations = featuredDestinations.slice(featuredStartIndex, featuredEndIndex);
  
  // Pagination for other destinations (without guides)
  const otherDestinationsTotalPages = Math.ceil(otherDestinations.length / itemsPerPage);
  const otherDestinationsStartIndex = (otherDestinationsPage - 1) * itemsPerPage;
  const otherDestinationsEndIndex = otherDestinationsStartIndex + itemsPerPage;
  const paginatedOtherDestinations = otherDestinations.slice(otherDestinationsStartIndex, otherDestinationsEndIndex);
  
  // Total pages for pagination controls (based on featured destinations)
  const totalPages = featuredTotalPages;
  
  // Reset other destinations page when filters change
  useEffect(() => {
    setOtherDestinationsPage(1);
  }, [searchTerm, selectedCategory]);

  // Reset to page 1 when filters change
  const handleCategoryChange = (category) => {
    setSelectedCategory(category);
    setCurrentPage(1);
  };

  const handleSearchChange = (value) => {
    setSearchTerm(value);
    setCurrentPage(1);
    // Reset category filter to 'All' when user starts typing
    if (value.trim() && selectedCategory !== 'All') {
      setSelectedCategory('All');
    }
  };

  // Helper function to generate simple pagination numbers: 1, 2 ... 41, 42
  const getPaginationNumbers = (currentPage, totalPages) => {
    const pages = [];
    
    if (totalPages <= 4) {
      // Show all pages if total is 4 or less
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      // Always show: 1, 2 ... (last-1), (last)
      pages.push(1);
      pages.push(2);
      if (totalPages > 4) {
        pages.push('ellipsis');
      }
      pages.push(totalPages - 1);
      pages.push(totalPages);
    }
    
    return pages;
  };

  const primaryDestinationName = searchTerm.trim() || paginatedFeaturedDestinations[0]?.name || paginatedFeaturedDestinations[0]?.fullName || paginatedOtherDestinations[0]?.name || 'Top Tours';

  return (
    <>
      <NavigationNext onOpenModal={handleOpenModal} />
      
      <div className="min-h-screen flex flex-col bg-gray-50" suppressHydrationWarning>
        <main className="flex-grow">
          <section className="pt-24 pb-16 ocean-gradient">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
                className="text-center"
              >
                <h1 className="text-4xl md:text-6xl font-poppins font-bold text-white mb-6">
                  Popular Destinations
                </h1>
                <p className="text-xl text-white/90 max-w-3xl mx-auto mb-8">
                  Discover incredible tours and activities in the world's most captivating destinations.
                </p>
                
                <div className="max-w-2xl mx-auto">
                  <div className="glass-effect rounded-2xl p-4">
                    <div className="flex gap-4">
                      <div className="flex-1 relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                        <Input
                          placeholder="Search destinations..."
                          value={searchTerm}
                          onChange={(e) => handleSearchChange(e.target.value)}
                          className="pl-10 h-12 bg-white/90 border-0 text-gray-800 placeholder:text-gray-500"
                        />
                      </div>
                      <Button className="h-12 px-6 sunset-gradient text-white font-semibold">
                        Search
                      </Button>
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>
          </section>

          <section className="bg-white border-b">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 sm:py-4">
              <nav className="flex items-center space-x-2 text-xs sm:text-sm text-gray-500">
                <Link href="/" className="hover:text-gray-700">Home</Link>
                <span className="text-gray-400">/</span>
                <span className="text-gray-900 font-medium">Destinations</span>
              </nav>
            </div>
          </section>

          <section className="py-8 bg-white border-b">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex flex-wrap justify-center gap-4">
                {categories.map((category) => (
                  <Button
                    key={category}
                    variant={selectedCategory === category ? "default" : "outline"}
                    onClick={() => handleCategoryChange(category)}
                    className={selectedCategory === category ? 'sunset-gradient text-white' : ''}
                  >
                    {category}
                  </Button>
                ))}
              </div>
            </div>
          </section>

          <section className="py-20 bg-gray-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              {(paginatedFeaturedDestinations.length > 0 || paginatedOtherDestinations.length > 0) ? (
                <>
                  {/* Featured Destinations Section */}
                  {paginatedFeaturedDestinations.length > 0 && (
                    <div className="mb-16">
                      <div className="mb-8">
                        <h2 className="text-3xl font-bold text-gray-900 mb-2">
                          Featured Destinations
                        </h2>
                        <p className="text-lg text-gray-600">
                          Showing {featuredStartIndex + 1}-{Math.min(featuredEndIndex, featuredDestinations.length)} of {featuredDestinations.length} featured destinations
                          {searchTerm.trim() && (
                            <span> matching "{searchTerm}"</span>
                          )}
                          {selectedCategory !== 'All' && (
                            <span> in {selectedCategory}</span>
                          )}
                          {otherDestinations.length > 0 && (
                            <span> and {otherDestinations.length} other destinations</span>
                          )}
                          {!searchTerm.trim() && selectedCategory === 'All' && totalAvailableDestinations > featuredDestinations.length + otherDestinations.length && (
                            <span> ({totalAvailableDestinations} destinations in total)</span>
                          )}
                        </p>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {paginatedFeaturedDestinations.map((destination, index) => (
                          <motion.div
                            key={`featured-${destination.id}-${index}`}
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.4, delay: index * 0.05 }}
                            viewport={{ once: true }}
                            whileHover={{ y: -5 }}
                            className="cursor-pointer"
                            onClick={() => router.push(`/destinations/${destination.id}`)}
                          >
                            <Card className="bg-white border-0 shadow-xl overflow-hidden h-full flex flex-col hover:shadow-2xl transition-all duration-300">
                              {destination.imageUrl && (
                                <div className="relative h-48 overflow-hidden">
                                  <Image
                                    src={destination.imageUrl}
                                    alt={destination.fullName || destination.name}
                                    fill
                                    className="object-cover transition-transform duration-300 hover:scale-105"
                                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                                    loading="lazy"
                                  />
                                  {destination.category && (
                                    <Badge className="absolute top-4 left-4 adventure-gradient text-white">
                                      {destination.category}
                                    </Badge>
                                  )}
                                  <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm rounded-lg px-3 py-1">
                                    <span className="text-sm font-medium text-gray-800">{destination.country || destination.fullName || destination.name}</span>
                                  </div>
                                </div>
                              )}
                              <CardContent className="p-6 flex flex-col flex-grow">
                                <div className="flex items-center text-gray-600 mb-2">
                                  <MapPin className="h-4 w-4 mr-1" />
                                  <span className="font-semibold">{destination.name}</span>
                                </div>
                                <p className="text-gray-700 mb-4 flex-grow">
                                  {destination.briefDescription}
                                </p>
                                
                                <div className="mt-auto pt-4 space-y-3">
                                  <Button
                                    asChild
                                    className="w-full sunset-gradient text-white hover:scale-105 transition-transform duration-200 h-12 text-base font-semibold"
                                    onClick={(e) => e.stopPropagation()}
                                  >
                                    <Link href={`/destinations/${destination.id}`}>
                                      Explore {truncateDestinationName(destination.name)}
                                      <ArrowRight className="ml-2 h-5 w-5" />
                                    </Link>
                                  </Button>
                                  <Button
                                    asChild
                                    variant="secondary"
                                    className="w-full bg-white text-purple-700 border border-purple-200 hover:bg-purple-50 hover:scale-105 transition-transform duration-200 h-12 text-base font-semibold"
                                    onClick={(e) => e.stopPropagation()}
                                  >
                                    <Link href={`/destinations/${destination.id}/tours`}>
                                      View Top Tours in {truncateDestinationName(destination.name)}
                                      <ArrowRight className="ml-2 h-5 w-5" />
                                    </Link>
                                  </Button>
                                </div>
                              </CardContent>
                            </Card>
                          </motion.div>
                        ))}
                      </div>
                  </div>
                  )}

                  {/* Other Destinations Section */}
                  {otherDestinations.length > 0 && (
                    <div className={`${paginatedFeaturedDestinations.length > 0 ? 'mt-16 pt-16 border-t-2 border-gray-200' : ''}`}>
                      <div className="mb-8">
                        <h2 className="text-3xl font-bold text-gray-900 mb-2">All Destinations</h2>
                        <p className="text-lg text-gray-600">
                          Showing {otherDestinationsStartIndex + 1}-{Math.min(otherDestinationsEndIndex, otherDestinations.length)} of {otherDestinations.length} {otherDestinations.length === 1 ? 'destination' : 'destinations'} with tours and activities
                          {selectedCategory !== 'All' && (
                            <span> in {selectedCategory}</span>
                          )}
                          {searchTerm.trim() && (
                            <span> matching "{searchTerm}"</span>
                          )}
                        </p>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {paginatedOtherDestinations.map((destination, index) => (
                          <motion.div
                            key={`other-${destination.id}-${index}`}
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.4, delay: index * 0.05 }}
                            viewport={{ once: true }}
                            whileHover={{ y: -5 }}
                          >
                            <Card className="bg-white border border-gray-200 shadow-lg overflow-hidden h-full flex flex-col hover:shadow-xl transition-all duration-300">
                              <CardContent className="p-6 flex flex-col flex-grow">
                                <div className="flex items-center justify-between mb-2">
                                  <div className="flex items-center text-gray-600">
                                    <MapPin className="h-4 w-4 mr-1" />
                                    <span className="font-semibold">{destination.name}</span>
                                  </div>
                                  {(destination.category || destination.region) && (
                                    <Badge className="adventure-gradient text-white text-xs">
                                      {destination.category || destination.region}
                                    </Badge>
                                  )}
                                </div>
                                {destination.country && (
                                  <p className="text-sm text-gray-500 mb-2">
                                    {destination.country}
                                  </p>
                                )}
                                <p className="text-gray-700 mb-4 flex-grow">
                                  {destination.briefDescription}
                                </p>
                                
                                <div className="mt-auto pt-4 space-y-3">
                                  <Button
                                    asChild
                                    className="w-full sunset-gradient text-white hover:scale-105 transition-transform duration-200 h-12 text-base font-semibold"
                                  >
                                    <Link href={`/destinations/${destination.id}`}>
                                      Explore {truncateDestinationName(destination.name)}
                                      <ArrowRight className="ml-2 h-5 w-5" />
                                    </Link>
                                  </Button>
                                  <Button
                                    asChild
                                    variant="secondary"
                                    className="w-full bg-white text-purple-700 border border-purple-200 hover:bg-purple-50 hover:scale-105 transition-transform duration-200 h-12 text-base font-semibold"
                                  >
                                    <Link href={`/destinations/${destination.id}/tours`}>
                                      View Top Tours in {truncateDestinationName(destination.name)}
                                      <ArrowRight className="ml-2 h-5 w-5" />
                                    </Link>
                                  </Button>
                                </div>
                              </CardContent>
                            </Card>
                          </motion.div>
                        ))}
                      </div>
                      
                      {/* Pagination Controls for Other Destinations */}
                      {otherDestinationsTotalPages > 1 && (
                        <div className="flex flex-col md:flex-row justify-center items-center gap-4 mt-12 w-full">
                          <Button
                            variant="outline"
                            onClick={() => setOtherDestinationsPage(prev => Math.max(1, prev - 1))}
                            disabled={otherDestinationsPage === 1}
                            className="bg-white disabled:opacity-50 w-full sm:w-auto"
                          >
                            Previous
                          </Button>

                          <div className="flex flex-wrap justify-center gap-2 max-w-full">
                            {getPaginationNumbers(otherDestinationsPage, otherDestinationsTotalPages).map((page, index) => {
                              if (page === 'ellipsis') {
                                return (
                                  <span key={`ellipsis-${index}`} className="px-2 text-gray-500">
                                    ...
                                  </span>
                                );
                              }
                              return (
                                <Button
                                  key={page}
                                  variant={otherDestinationsPage === page ? "default" : "outline"}
                                  onClick={() => setOtherDestinationsPage(page)}
                                  className={`${otherDestinationsPage === page ? "bg-purple-600 text-white hover:bg-purple-700" : "bg-white"} min-w-[48px]`}
                                >
                                  {page}
                                </Button>
                              );
                            })}
                          </div>

                          <Button
                            variant="outline"
                            onClick={() => setOtherDestinationsPage(prev => Math.min(otherDestinationsTotalPages, prev + 1))}
                            disabled={otherDestinationsPage === otherDestinationsTotalPages}
                            className="bg-white disabled:opacity-50 w-full sm:w-auto"
                          >
                            Next
                          </Button>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Pagination Controls for Featured Destinations - Only show if there are featured destinations */}
                  {paginatedFeaturedDestinations.length > 0 && totalPages > 1 && (
                    <div className="flex flex-col md:flex-row justify-center items-center gap-4 mt-12 w-full">
                      <Button
                        variant="outline"
                        onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                        disabled={currentPage === 1}
                        className="bg-white disabled:opacity-50 w-full sm:w-auto"
                      >
                        Previous
                      </Button>
                      
                      <div className="flex flex-wrap justify-center gap-2 max-w-full">
                        {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                          <Button
                            key={page}
                            variant={currentPage === page ? "default" : "outline"}
                            onClick={() => setCurrentPage(page)}
                            className={`${currentPage === page ? "sunset-gradient text-white" : "bg-white"} min-w-[48px]`}
                          >
                            {page}
                          </Button>
                        ))}
                      </div>

                      <Button
                        variant="outline"
                        onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                        disabled={currentPage === totalPages}
                        className="bg-white disabled:opacity-50 w-full sm:w-auto"
                      >
                        Next
                      </Button>
                    </div>
                  )}
                </>
              ) : (
                <div className="text-center py-16">
                  <Globe className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <h2 className="text-3xl font-bold text-gray-800 mb-4">
                    Destinations Coming Soon
                  </h2>
                  <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                    We're working on bringing you the most amazing destinations with curated tours and activities. 
                    Each destination will feature popular tour categories and hand-picked experiences.
                  </p>
                </div>
              )}
            </div>
          </section>

          {/* Other Destinations in Country Section */}
          {(() => {
            // Detect if we're showing destinations from a specific country
            const detectedCountry = useMemo(() => {
              if (allFilteredDestinations.length === 0) return null;
              
              // Check if search term is a country name
              const searchLower = searchTerm.toLowerCase().trim();
              const commonCountries = ['netherlands', 'france', 'italy', 'spain', 'germany', 'greece', 'portugal', 'turkey', 'croatia', 'poland', 'czech republic', 'austria', 'switzerland', 'belgium', 'norway', 'sweden', 'denmark', 'finland', 'ireland', 'united kingdom', 'uk', 'united states', 'usa', 'canada', 'mexico', 'japan', 'china', 'thailand', 'vietnam', 'indonesia', 'philippines', 'india', 'australia', 'new zealand', 'south africa', 'egypt', 'morocco', 'kenya', 'brazil', 'argentina', 'chile', 'peru', 'colombia'];
              
              // Check if search matches a country
              for (const country of commonCountries) {
                if (searchLower === country || searchLower.includes(country)) {
                  // Find the actual country name from destinations
                  const matchingDest = allFilteredDestinations.find(d => 
                    d.country && d.country.toLowerCase().includes(country)
                  );
                  if (matchingDest && matchingDest.country) {
                    return matchingDest.country;
                  }
                }
              }
              
              // If no country match in search, check if all filtered destinations share the same country
              if (allFilteredDestinations.length > 0) {
                const countries = new Set();
                allFilteredDestinations.forEach(dest => {
                  if (dest.country) {
                    countries.add(dest.country);
                  }
                });
                
                // If all destinations share the same country and we have multiple destinations
                if (countries.size === 1 && allFilteredDestinations.length > 1) {
                  return Array.from(countries)[0];
                }
              }
              
              return null;
            }, [searchTerm, allFilteredDestinations]);
            
            // Get other destinations in the detected country
            const otherDestinationsInCountry = useMemo(() => {
              if (!detectedCountry) return [];
              
              // Get all destinations in this country (excluding current filtered ones)
              const allCountryDests = [];
              
              // From curated destinations
              const curatedDests = getDestinationsByCountry(detectedCountry);
              curatedDests.forEach(dest => {
                if (!allFilteredDestinations.find(d => d.id === dest.id)) {
                  allCountryDests.push({
                    id: dest.id,
                    name: dest.name || dest.fullName,
                    fullName: dest.fullName || dest.name,
                    briefDescription: dest.briefDescription,
                    imageUrl: dest.imageUrl,
                    country: dest.country
                  });
                }
              });
              
              // From classified data
              if (viatorDestinationsClassified) {
                const classifiedDests = viatorDestinationsClassified.filter(dest => {
                  const destCountry = (dest.country || '').toLowerCase().trim();
                  const targetCountry = detectedCountry.toLowerCase().trim();
                  return destCountry === targetCountry && 
                         dest.type === 'CITY' && // Only cities
                         !allFilteredDestinations.find(d => {
                           const dName = (d.name || '').toLowerCase().trim();
                           const destName = (dest.destinationName || dest.name || '').toLowerCase().trim();
                           return dName === destName || generateSlug(dName) === generateSlug(destName);
                         });
                });
                
                classifiedDests.forEach(dest => {
                  const slug = generateSlug(dest.destinationName || dest.name || '');
                  const seoContent = getDestinationSeoContent(slug);
                  
                  allCountryDests.push({
                    id: slug,
                    name: dest.destinationName || dest.name,
                    fullName: dest.destinationName || dest.name,
                    briefDescription: seoContent?.briefDescription || seoContent?.heroDescription || `Explore tours and activities in ${dest.destinationName || dest.name}`,
                    imageUrl: null,
                    country: dest.country
                  });
                });
              }
              
              // Remove duplicates and sort alphabetically
              const uniqueDests = [];
              const seenNames = new Set();
              
              allCountryDests.forEach(dest => {
                const nameKey = (dest.name || '').toLowerCase().trim();
                if (!seenNames.has(nameKey)) {
                  seenNames.add(nameKey);
                  uniqueDests.push(dest);
                }
              });
              
              return uniqueDests.sort((a, b) => 
                (a.name || '').localeCompare(b.name || '')
              );
            }, [detectedCountry, allFilteredDestinations]);
            
            if (!detectedCountry || otherDestinationsInCountry.length === 0) {
              return null;
            }
            
            return (
              <section className="py-12 bg-gradient-to-br from-purple-50 to-blue-50 border-t-2 border-gray-200">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                  <Card className="bg-gradient-to-br from-purple-50 to-blue-50 border-purple-200">
                    <CardContent className="p-4 sm:p-6">
                      <div className="flex flex-col sm:flex-row items-start gap-3 sm:gap-4">
                        <div className="w-10 h-10 sm:w-12 sm:h-12 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0">
                          <MapPin className="w-5 h-5 sm:w-6 sm:h-6 text-purple-600" />
                        </div>
                        <div className="flex-1 w-full">
                          <h3 className="text-base sm:text-lg font-bold text-gray-900 mb-1 sm:mb-2">
                            Top Tours in Other {detectedCountry} Destinations
                          </h3>
                          <p className="text-xs sm:text-sm text-gray-600 mb-3">
                            Explore top-rated tours and activities in other amazing destinations across {detectedCountry}.
                          </p>
                          <div className="grid grid-cols-2 sm:flex sm:flex-wrap gap-2 mb-3">
                            {otherDestinationsInCountry.slice(0, showMoreCountryDestinations).map((otherDest) => (
                              <Link key={otherDest.id} href={`/destinations/${otherDest.id}/tours`}>
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
                            {otherDestinationsInCountry.length > showMoreCountryDestinations && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setShowMoreCountryDestinations(otherDestinationsInCountry.length)}
                                className="text-purple-700 hover:text-purple-800 hover:bg-purple-50 text-xs"
                              >
                                View All ({otherDestinationsInCountry.length} destinations)
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
              </section>
            );
          })()}

          {/* CTA Section */}
          <section className="py-20 adventure-gradient">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
                viewport={{ once: true }}
              >
                <h2 className="text-4xl md:text-5xl font-poppins font-bold text-white mb-6">
                  Ready to Experience Smart Travel?
                </h2>
                <p className="text-xl text-white/90 mb-8 max-w-3xl mx-auto">
                  Join thousands of travelers who have discovered their perfect adventures with TopTours.ai.
                </p>
                <Button 
                  onClick={() => handleOpenModal()}
                  className="px-8 py-4 bg-white text-blue-600 font-semibold hover:bg-gray-100 hover:scale-105 transition-all duration-200"
                >
                  Start Planning Your Trip
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </motion.div>
            </div>
          </section>
        </main>
        <FooterNext />
      </div>

      <SmartTourFinder
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />

      {/* CollectionPage Schema for SEO */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "CollectionPage",
            "name": "Travel Destinations | TopTours.ai",
            "description": "Discover thousands of destinations worldwide with curated tours, activities, and travel guides. Find your next adventure.",
            "url": "https://toptours.ai/destinations",
            "mainEntity": {
              "@type": "ItemList",
              "numberOfItems": allDestinations.length,
              "itemListElement": allDestinations.slice(0, 50).map((dest, index) => ({
                "@type": "ListItem",
                "position": index + 1,
                "item": {
                  "@type": "TouristDestination",
                  "name": dest.fullName || dest.name,
                  "url": `https://toptours.ai/destinations/${dest.id}`,
                  "description": dest.briefDescription || `Explore tours and activities in ${dest.fullName || dest.name}`,
                  "image": dest.imageUrl || undefined,
                }
              }))
            }
          })
        }}
      />
    </>
  );
}
