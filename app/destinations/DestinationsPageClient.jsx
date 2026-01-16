"use client";
import { useState, useEffect, useMemo } from 'react';
import NavigationNext from '@/components/NavigationNext';
import FooterNext from '@/components/FooterNext';
import SmartTourFinder from '@/components/home/SmartTourFinder';
import { destinations, getDestinationsByCountry } from '@/data/destinationsData';
import { Search, MapPin, ArrowRight, Globe, Ticket, UtensilsCrossed } from 'lucide-react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';

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

export default function DestinationsPageClient({ 
  viatorDestinations = [], 
  viatorDestinationsClassified = [],
  totalAvailableDestinations = 0 
}) {
  const router = useRouter();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [currentPage, setCurrentPage] = useState(1);
  const [otherDestinationsPage, setOtherDestinationsPage] = useState(1);
  const [showMoreCountryDestinations, setShowMoreCountryDestinations] = useState(12);
  const itemsPerPage = 24; // Show 24 destinations per page

  // Create indexes for fast lookup (only if data provided)
  const classifiedDataIndex = useMemo(() => {
    if (!viatorDestinationsClassified || !Array.isArray(viatorDestinationsClassified)) {
      return { byId: new Map(), byName: new Map(), bySlug: new Map() };
    }

    const index = {
      byId: new Map(),
      byName: new Map(),
      bySlug: new Map(),
    };

    viatorDestinationsClassified.forEach(cd => {
      const id = cd.destinationId?.toString() || String(cd.destinationId || '');
      const idNum = id ? String(parseInt(id.replace(/^d/i, ''), 10)) : '';
      const name = (cd.destinationName || cd.name || '').toLowerCase().trim();
      const slug = generateSlug(cd.destinationName || cd.name || '');

      if (id) {
        index.byId.set(id, cd);
        const numericId = id.replace(/^d/i, '');
        if (numericId !== id && numericId) {
          index.byId.set(numericId, cd);
        }
        if (idNum && idNum !== id && idNum !== numericId) {
          index.byId.set(idNum, cd);
        }
      }

      if (name) {
        if (!index.byName.has(name)) {
          index.byName.set(name, []);
        }
        index.byName.get(name).push(cd);
      }

      if (slug) {
        if (!index.bySlug.has(slug)) {
          index.bySlug.set(slug, []);
        }
        index.bySlug.get(slug).push(cd);
      }
    });

    return index;
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
  const allDestinations = useMemo(() => {
    const result = [...destinations];

    // Add Viator destinations when there's a search term OR when a region filter is selected
    if (searchTerm || (selectedCategory !== 'All')) {
      if (viatorDestinationsClassified && Array.isArray(viatorDestinationsClassified)) {
        viatorDestinationsClassified.forEach(vd => {
          const destinationName = vd.destinationName || vd.name || '';
          const slug = generateSlug(destinationName);
          
          // Check if already in destinations (by slug or name)
          const exists = destinations.some(d => 
            d.id === slug || 
            d.name?.toLowerCase() === destinationName.toLowerCase() ||
            d.fullName?.toLowerCase() === destinationName.toLowerCase()
          );

          if (!exists && destinationName) {
            const region = vd.region || '';
            const category = regionToCategory[region] || 'Other';
            
            result.push({
              id: slug,
              name: destinationName,
              fullName: destinationName,
              category: category,
              country: vd.country || '',
              region: region,
              imageUrl: null,
              briefDescription: `Explore tours and activities in ${destinationName}`,
            });
          }
        });
      }
    }

    return result;
  }, [destinations, viatorDestinationsClassified, searchTerm, selectedCategory]);

  // Filter destinations based on search and category
  const filteredDestinations = useMemo(() => {
    let filtered = allDestinations;

    // Apply search filter
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      filtered = filtered.filter(dest => {
        const name = (dest.fullName || dest.name || '').toLowerCase();
        const country = (dest.country || '').toLowerCase();
        const category = (dest.category || '').toLowerCase();
        return name.includes(searchLower) || country.includes(searchLower) || category.includes(searchLower);
      });
    }

    // Apply category filter
    if (selectedCategory !== 'All') {
      filtered = filtered.filter(dest => {
        const destCategory = dest.category || '';
        return destCategory === selectedCategory || regionToCategory[destCategory] === selectedCategory;
      });
    }

    return filtered;
  }, [allDestinations, searchTerm, selectedCategory]);

  // Separate destinations with guides from others
  const destinationsWithGuides = useMemo(() => {
    return filteredDestinations.filter(dest => {
      // Check if destination has full content (guide)
      try {
        const { getDestinationFullContent } = require('@/data/destinationFullContent');
        return getDestinationFullContent(dest.id) !== null;
      } catch {
        return false;
      }
    });
  }, [filteredDestinations]);

  const otherDestinations = useMemo(() => {
    const guideIds = new Set(destinationsWithGuides.map(d => d.id));
    return filteredDestinations.filter(d => !guideIds.has(d.id));
  }, [filteredDestinations, destinationsWithGuides]);

  // Pagination for featured destinations
  const featuredStartIndex = 0;
  const featuredEndIndex = featuredStartIndex + 6;
  const featuredDestinations = destinationsWithGuides.slice(featuredStartIndex, featuredEndIndex);

  // Pagination for other destinations
  const otherStartIndex = (otherDestinationsPage - 1) * itemsPerPage;
  const otherEndIndex = otherStartIndex + itemsPerPage;
  const paginatedOtherDestinations = otherDestinations.slice(otherStartIndex, otherEndIndex);
  const totalOtherPages = Math.ceil(otherDestinations.length / itemsPerPage);

  // Group destinations by country for "Other destinations in country" section
  const destinationsByCountry = useMemo(() => {
    const grouped = {};
    otherDestinations.forEach(dest => {
      const country = dest.country || 'Other';
      if (!grouped[country]) {
        grouped[country] = [];
      }
      grouped[country].push(dest);
    });
    return grouped;
  }, [otherDestinations]);

  // Detect country from featured destinations
  const detectedCountry = useMemo(() => {
    if (featuredDestinations.length === 0) return null;
    const countries = featuredDestinations.map(d => d.country).filter(Boolean);
    if (countries.length > 0) {
      return countries[0]; // Use first country
    }
    return null;
  }, [featuredDestinations]);

  // Get other destinations in the same country
  const otherDestinationsInCountry = useMemo(() => {
    if (!detectedCountry) return [];
    return destinationsByCountry[detectedCountry] || [];
  }, [detectedCountry, destinationsByCountry]);

  return (
    <>
      <div className="min-h-screen flex flex-col bg-gray-50">
        <NavigationNext onOpenModal={handleOpenModal} />
        <main className="flex-grow">
          {/* Hero Section */}
          <section className="pt-24 pb-16 ocean-gradient">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="text-center"
              >
                <h1 className="text-4xl md:text-5xl lg:text-6xl font-poppins font-bold text-white mb-6">
                  Discover {totalAvailableDestinations.toLocaleString()}+ Destinations
                </h1>
                <p className="text-xl md:text-2xl text-white/90 mb-8 max-w-3xl mx-auto">
                  Find your perfect adventure with AI-powered tour recommendations across {totalAvailableDestinations.toLocaleString()}+ destinations worldwide.
                </p>
                
                {/* Search Bar */}
                <div className="max-w-2xl mx-auto">
                  <div className="relative">
                    <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <Input
                      type="text"
                      placeholder="Search destinations..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-12 pr-4 py-6 text-lg bg-white/95 backdrop-blur-sm border-0 shadow-lg"
                    />
                  </div>
                </div>
              </motion.div>
            </div>
          </section>

          {/* Category Filters */}
          <section className="bg-white border-b py-8 sticky top-16 z-40 backdrop-blur-sm bg-white/95">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex flex-wrap justify-center gap-3">
                {categories.map((category) => (
                  <Button
                    key={category}
                    variant={selectedCategory === category ? "default" : "outline"}
                    onClick={() => setSelectedCategory(category)}
                    className={`px-6 py-2 rounded-full transition-all ${
                      selectedCategory === category
                        ? 'bg-purple-600 text-white shadow-md'
                        : 'bg-white text-gray-700 hover:bg-purple-50 border-gray-200'
                    }`}
                  >
                    {category}
                  </Button>
                ))}
              </div>
            </div>
          </section>

          {/* Featured Destinations (with guides) */}
          {featuredDestinations.length > 0 && (
            <section className="py-20 bg-gray-50">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="mb-12 text-center">
                  <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                    Featured Destinations
                  </h2>
                  <p className="text-lg text-gray-600">
                    Curated travel guides with detailed information, tours, and local insights
                  </p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {featuredDestinations.map((destination) => (
                    <Card key={destination.id} className="bg-white overflow-hidden hover:shadow-xl transition-all duration-300 hover:-translate-y-2">
                      <Link href={`/destinations/${destination.id}`}>
                        <div className="relative h-64 bg-gradient-to-br from-purple-400 to-blue-500">
                          {destination.imageUrl ? (
                            <Image
                              src={destination.imageUrl}
                              alt={destination.fullName || destination.name}
                              fill
                              className="object-cover"
                              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <MapPin className="w-16 h-16 text-white/50" />
                            </div>
                          )}
                          <div className="absolute top-4 right-4">
                            <Badge className="bg-white/90 text-purple-700">Featured</Badge>
                          </div>
                        </div>
                        <CardContent className="p-6">
                          <h3 className="text-xl font-bold text-gray-900 mb-2">
                            {destination.fullName || destination.name}
                          </h3>
                          {destination.briefDescription && (
                            <p className="text-gray-600 mb-4 line-clamp-2">
                              {destination.briefDescription}
                            </p>
                          )}
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2 text-sm text-gray-500">
                              <Globe className="w-4 h-4" />
                              <span>{destination.country || destination.category}</span>
                            </div>
                            <Button variant="ghost" size="sm" className="text-purple-600">
                              Explore <ArrowRight className="w-4 h-4 ml-1" />
                            </Button>
                          </div>
                        </CardContent>
                      </Link>
                    </Card>
                  ))}
                </div>
              </div>
            </section>
          )}

          {/* Other Destinations */}
          {paginatedOtherDestinations.length > 0 && (
            <section className="py-20 bg-white">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="mb-12">
                  <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                    All Destinations
                  </h2>
                  <p className="text-lg text-gray-600">
                    {otherDestinations.length.toLocaleString()} destinations available
                  </p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {paginatedOtherDestinations.map((destination) => (
                    <Card key={destination.id} className="bg-white hover:shadow-lg transition-all duration-300">
                      <Link href={`/destinations/${destination.id}/tours`}>
                        <CardContent className="p-6">
                          <div className="flex items-start justify-between mb-3">
                            <h3 className="text-lg font-semibold text-gray-900 flex-1">
                              {destination.fullName || destination.name}
                            </h3>
                            <Ticket className="w-5 h-5 text-purple-600 flex-shrink-0 ml-2" />
                          </div>
                          <div className="flex items-center gap-2 text-sm text-gray-500 mb-4">
                            <MapPin className="w-4 h-4" />
                            <span>{destination.country || destination.category || 'Worldwide'}</span>
                          </div>
                          <Button variant="outline" size="sm" className="w-full border-purple-300 text-purple-700 hover:bg-purple-50">
                            View Tours
                          </Button>
                        </CardContent>
                      </Link>
                    </Card>
                  ))}
                </div>

                {/* Pagination */}
                {totalOtherPages > 1 && (
                  <div className="mt-12 flex justify-center gap-2">
                    <Button
                      variant="outline"
                      onClick={() => setOtherDestinationsPage(prev => Math.max(1, prev - 1))}
                      disabled={otherDestinationsPage === 1}
                    >
                      Previous
                    </Button>
                    <span className="flex items-center px-4 text-gray-600">
                      Page {otherDestinationsPage} of {totalOtherPages}
                    </span>
                    <Button
                      variant="outline"
                      onClick={() => setOtherDestinationsPage(prev => Math.min(totalOtherPages, prev + 1))}
                      disabled={otherDestinationsPage === totalOtherPages}
                    >
                      Next
                    </Button>
                  </div>
                )}
              </div>
            </section>
          )}

          {/* Other Destinations in Country Section */}
          {detectedCountry && otherDestinationsInCountry.length > 0 && (
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
          )}

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
