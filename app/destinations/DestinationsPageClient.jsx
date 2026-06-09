"use client";
import { useState, useEffect, useMemo } from 'react';
import NavigationNext from '@/components/NavigationNext';
import FooterNext from '@/components/FooterNext';
import SmartTourFinder from '@/components/home/SmartTourFinder';
import { Search, MapPin, ArrowRight, Compass } from 'lucide-react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { useRouter, useSearchParams } from 'next/navigation';
import { getDestinationListingImageUrl, getDestinationThumbImageUrl } from '@/lib/destinationImageUrl';

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

const POPULAR_DESTINATION_SLUGS = [
  'aruba',
  'curacao',
  'reykjavik',
  'barcelona',
  'paris',
  'rome',
  'new-york-city',
  'amsterdam',
  'turks-and-caicos',
  'tokyo',
];

export default function DestinationsPageClient({ featuredDestinations = [] }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 24;

  // Deep-link / SEO: ?q= or ?search= pre-fills the destination search (matches WebSite SearchAction in layout)
  const queryFromUrl = (searchParams.get('q') || searchParams.get('search') || '').trim();
  useEffect(() => {
    if (queryFromUrl) setSearchTerm(queryFromUrl);
  }, [queryFromUrl]);

  // Scroll to top when page changes
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [currentPage]);

  const handleOpenModal = () => {
    setIsModalOpen(true);
  };

  const categories = ['All', 'Europe', 'North America', 'Caribbean', 'Asia-Pacific', 'Africa', 'South America', 'Middle East'];

  const allDestinations = useMemo(() => {
    return (Array.isArray(featuredDestinations) ? featuredDestinations : []).map((dest) => ({
      ...dest,
      category: dest.category || (dest.region ? (regionToCategory[dest.region] || dest.region) : null),
    }));
  }, [featuredDestinations]);

  const allFilteredDestinations = useMemo(() => {
    const searchLower = searchTerm.toLowerCase().trim();
    return allDestinations
      .filter((dest) => {
        const matchesSearch = !searchLower ||
          (dest.name || '').toLowerCase().includes(searchLower) ||
          (dest.fullName || '').toLowerCase().includes(searchLower) ||
          (dest.briefDescription || '').toLowerCase().includes(searchLower) ||
          (dest.country || '').toLowerCase().includes(searchLower);
        const matchesCategory = selectedCategory === 'All' ||
          dest.category === selectedCategory ||
          (dest.region && regionToCategory[dest.region] === selectedCategory) ||
          dest.region === selectedCategory;
        return matchesSearch && matchesCategory;
      })
      .sort((a, b) => (a.name || '').localeCompare(b.name || ''));
  }, [allDestinations, searchTerm, selectedCategory]);

  const totalPages = Math.ceil(allFilteredDestinations.length / itemsPerPage);
  const featuredStartIndex = (currentPage - 1) * itemsPerPage;
  const featuredEndIndex = featuredStartIndex + itemsPerPage;
  const paginatedFeaturedDestinations = allFilteredDestinations.slice(featuredStartIndex, featuredEndIndex);

  const hasActiveFilters = Boolean(searchTerm.trim()) || selectedCategory !== 'All';
  const showEmptyState = allFilteredDestinations.length === 0;

  const popularDestinations = useMemo(() => {
    const byId = new Map(allDestinations.map((dest) => [dest.id, dest]));
    const picked = [];
    for (const slug of POPULAR_DESTINATION_SLUGS) {
      const dest = byId.get(slug);
      if (dest) picked.push(dest);
      if (picked.length >= 10) break;
    }
    if (picked.length < 10) {
      for (const dest of allDestinations) {
        if (!picked.some((item) => item.id === dest.id)) {
          picked.push(dest);
          if (picked.length >= 10) break;
        }
      }
    }
    return picked;
  }, [allDestinations]);

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

  return (
    <>
      <div className="min-h-screen flex flex-col bg-gray-50">
        <NavigationNext onOpenModal={handleOpenModal} />
        <main className="flex-grow">
          {/* Search-first header */}
          <section className="pt-20 pb-7 ocean-gradient">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="text-center"
              >
                <h1 className="text-2xl md:text-4xl font-poppins font-bold text-white mb-2">
                  Find your destination
                </h1>
                <p className="text-sm md:text-base text-white/90 max-w-2xl mx-auto mb-4">
                  Search by destination, country, or region and jump straight to tours
                </p>
                
                <div className="max-w-2xl mx-auto">
                  <div className="glass-effect rounded-2xl p-3">
                    <div className="flex gap-3">
                      <div className="flex-1 relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                        <Input
                          placeholder="Search destinations..."
                          value={searchTerm}
                          onChange={(e) => handleSearchChange(e.target.value)}
                          className="pl-10 h-12 bg-white/90 border-0 text-gray-800 placeholder:text-gray-500"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>
          </section>

          <section className="bg-white border-b">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 sm:py-4">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <nav className="flex items-center space-x-2 text-xs sm:text-sm text-gray-500">
                  <Link href="/" className="hover:text-gray-700">Home</Link>
                  <span className="text-gray-400">/</span>
                  <span className="text-gray-900 font-medium">Destinations</span>
                </nav>

                <div className="w-full sm:w-[260px]">
                  <label htmlFor="destinations-region-filter" className="sr-only">Filter by region</label>
                  <select
                    id="destinations-region-filter"
                    value={selectedCategory}
                    onChange={(e) => handleCategoryChange(e.target.value)}
                    className="h-10 w-full rounded-lg border border-gray-200 bg-white px-3 text-sm font-medium text-gray-700 shadow-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                  >
                    {categories.map((category) => (
                      <option key={category} value={category}>
                        {category === 'All' ? 'All regions' : category}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          </section>

          {/* Featured Destinations Section */}
          {paginatedFeaturedDestinations.length > 0 && (
            <section className="py-12 bg-gray-50">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="mb-8">
                  <h2 className="text-3xl font-bold text-gray-900 mb-2">
                    Featured destinations
                  </h2>
                  <p className="text-lg text-gray-600">
                    Showing {featuredStartIndex + 1}-{Math.min(featuredEndIndex, allFilteredDestinations.length)} of {allFilteredDestinations.length} destinations
                    {searchTerm.trim() && (
                      <span> matching "{searchTerm}"</span>
                    )}
                    {selectedCategory !== 'All' && (
                      <span> in {selectedCategory}</span>
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
                            src={getDestinationListingImageUrl(destination.imageUrl)}
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
                        
                        <div className="mt-auto pt-4">
                          <Button
                            asChild
                            className="w-full sunset-gradient text-white hover:scale-105 transition-transform duration-200 h-12 text-base font-semibold"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <Link href={`/destinations/${destination.id}`} prefetch={true}>
                              Explore {truncateDestinationName(destination.name)}
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
            </section>
          )}

          {showEmptyState && (
            <section className="py-12 bg-gray-50">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="max-w-2xl mx-auto text-center mb-10">
                  <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-primary/10 text-primary mb-5">
                    <Compass className="w-7 h-7" />
                  </div>
                  <h2 className="text-2xl sm:text-3xl font-poppins font-bold text-gray-900 mb-3">
                    {hasActiveFilters ? "We couldn't find that destination" : 'No destinations to show right now'}
                  </h2>
                  <p className="text-gray-600 text-base sm:text-lg leading-relaxed">
                    {hasActiveFilters ? (
                      <>
                        Sorry — we don&apos;t have a curated guide for{' '}
                        <span className="font-semibold text-gray-800">
                          &ldquo;{searchTerm.trim() || selectedCategory}&rdquo;
                        </span>{' '}
                        yet. Try a different spelling, clear your filters, or pick one of these popular places below.
                      </>
                    ) : (
                      'Our destination list is being updated. In the meantime, here are some traveler favorites worth exploring.'
                    )}
                  </p>
                  {hasActiveFilters && (
                    <Button
                      type="button"
                      variant="outline"
                      className="mt-6 bg-white"
                      onClick={() => {
                        setSearchTerm('');
                        setSelectedCategory('All');
                        setCurrentPage(1);
                      }}
                    >
                      Clear search &amp; filters
                    </Button>
                  )}
                </div>

                {popularDestinations.length > 0 && (
                  <>
                    <div className="text-center mb-8">
                      <h3 className="text-xl font-bold text-gray-900">
                        Popular destinations worth exploring
                      </h3>
                      <p className="mt-2 text-gray-600">
                        Hand-picked hubs with tours, guides, and trip ideas
                      </p>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-w-4xl mx-auto">
                      {popularDestinations.map((destination) => {
                        const name = destination.name || destination.fullName || destination.id;
                        const countryLabel =
                          destination.country &&
                          destination.country.toLowerCase() !== name.toLowerCase() &&
                          destination.country.toLowerCase() !== (destination.fullName || '').toLowerCase()
                            ? destination.country
                            : null;

                        return (
                          <Link
                            key={destination.id}
                            href={`/destinations/${destination.id}`}
                            prefetch={true}
                            className="group"
                          >
                            <Card className="bg-white border border-gray-100 shadow-sm overflow-hidden hover:shadow-md hover:border-primary/20 transition-all duration-200">
                              <CardContent className="p-3 flex items-center gap-3">
                                {destination.imageUrl ? (
                                  <div className="relative w-16 h-12 shrink-0 rounded-md overflow-hidden bg-gray-100">
                                    <Image
                                      src={getDestinationThumbImageUrl(destination.imageUrl)}
                                      alt=""
                                      width={64}
                                      height={48}
                                      className="object-cover w-full h-full transition-transform duration-300 group-hover:scale-105"
                                      sizes="64px"
                                      loading="lazy"
                                    />
                                  </div>
                                ) : (
                                  <div className="w-16 h-12 shrink-0 rounded-md bg-primary/10 flex items-center justify-center">
                                    <MapPin className="h-5 w-5 text-primary/60" />
                                  </div>
                                )}
                                <div className="min-w-0 flex-1">
                                  <p className="font-semibold text-sm text-gray-900 line-clamp-1 group-hover:text-primary transition-colors">
                                    {name}
                                  </p>
                                  {countryLabel && (
                                    <p className="text-xs text-gray-500 line-clamp-1 mt-0.5">{countryLabel}</p>
                                  )}
                                </div>
                                <ArrowRight className="h-4 w-4 text-gray-300 shrink-0 group-hover:text-primary transition-colors" />
                              </CardContent>
                            </Card>
                          </Link>
                        );
                      })}
                    </div>
                  </>
                )}
              </div>
            </section>
          )}

          {/* Pagination Controls for Featured Destinations - Only show if there are featured destinations */}
          {paginatedFeaturedDestinations.length > 0 && totalPages > 1 && (
            <section className="py-8 bg-gray-50">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex flex-col md:flex-row justify-center items-center gap-4 w-full">
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

      {/* BreadcrumbList Schema for SEO */}
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
              }
            ]
          })
        }}
      />

      {/* CollectionPage Schema for SEO */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "CollectionPage",
            "name": "Best Travel Destinations 2026",
            "description": "Explore hand-picked travel destinations with curated tours, activities, and travel guides.",
            "url": "https://toptours.ai/destinations",
            "numberOfItems": allFilteredDestinations.length,
            "mainEntity": {
              "@type": "ItemList",
              "numberOfItems": allFilteredDestinations.length,
              "itemListElement": allFilteredDestinations.slice(0, 24).map((dest, index) => ({
                "@type": "ListItem",
                "position": index + 1,
                "item": {
                  "@type": "TouristDestination",
                  "name": dest.fullName || dest.name,
                  "url": `https://toptours.ai/destinations/${dest.id}`,
                  "description": dest.briefDescription || `Explore tours and activities in ${dest.fullName || dest.name}`,
                  "address": dest.country ? {
                    "@type": "PostalAddress",
                    "addressLocality": dest.name,
                    "addressCountry": dest.country,
                  } : undefined,
                }
              }))
            }
          })
        }}
      />
    </>
  );
}
