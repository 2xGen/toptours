'use client';

import NavigationNext from '@/components/NavigationNext';
import FooterNext from '@/components/FooterNext';
import SmartTourFinder from '@/components/home/SmartTourFinder';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Search, MapPin, ArrowRight, Compass } from 'lucide-react';
import { hasDestinationPage } from '@/data/destinationFullContent';

const categories = ['All', 'Europe', 'North America', 'Caribbean', 'Asia-Pacific', 'Africa', 'South America', 'Middle East'];

export default function ToursHubClient({ 
  destinations, 
  totalDestinations = 0,
  currentPage = 1,
  totalPages = 1,
  onPageChange,
  searchTerm = '',
  selectedCategory = 'All',
  onSearchChange,
  onCategoryChange,
  onOpenModal,
  onCloseModal,
  isModalOpen
}) {

  return (
    <>
      <NavigationNext onOpenModal={onOpenModal} />

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
                  Best Tours & Activities by Destination
                </h1>
                <p className="text-xl text-white/90 max-w-3xl mx-auto mb-8">
                  Discover incredible tours, excursions, and activities in the world's most captivating destinations. Browse tours by location and find the perfect adventure for your trip.
                </p>

                <div className="max-w-2xl mx-auto">
                  <div className="glass-effect rounded-2xl p-4">
                    <div className="flex gap-4">
                      <div className="flex-1 relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                        <Input
                          placeholder="Search destinations..."
                          value={searchTerm}
                          onChange={(e) => onSearchChange(e.target.value)}
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
                <Link href="/" className="hover:text-gray-700">
                  Home
                </Link>
                <span className="text-gray-400">/</span>
                <span className="text-gray-900 font-medium">Tours</span>
              </nav>
            </div>
          </section>

          <section className="py-8 bg-white border-b">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex flex-wrap justify-center gap-4">
                {categories.map((category) => (
                  <Button
                    key={category}
                    variant={selectedCategory === category ? 'default' : 'outline'}
                    onClick={() => onCategoryChange(category)}
                    className={
                      selectedCategory === category
                        ? 'sunset-gradient text-white'
                        : ''
                    }
                  >
                    {category}
                  </Button>
                ))}
              </div>
            </div>
          </section>

          <section className="py-20 bg-gray-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              {destinations.length > 0 ? (
                <>
                  <div className="mb-8">
                    <h2 className="text-3xl font-bold text-gray-900 mb-2">
                      {searchTerm.trim()
                        ? `Destinations with Tours`
                        : 'Tour Destinations'}
                    </h2>
                    <p className="text-lg text-gray-600">
                      Showing {((currentPage - 1) * 24) + 1}-{Math.min(currentPage * 24, totalDestinations)} of {totalDestinations.toLocaleString()}{' '}
                      {totalDestinations === 1
                        ? 'destination'
                        : 'destinations'}
                      {searchTerm.trim() && (
                        <span> matching "{searchTerm}"</span>
                      )}
                      {selectedCategory !== 'All' && (
                        <span> in {selectedCategory}</span>
                      )}
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {destinations.map((destination, index) => (
                      <motion.div
                        key={`${destination.id}-${index}-${destination.isViator ? 'viator' : 'curated'}`}
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.4, delay: index * 0.05 }}
                        viewport={{ once: true }}
                        whileHover={{ y: -5 }}
                        className="cursor-pointer"
                      >
                        <Card className="bg-white border-0 shadow-xl overflow-hidden h-full flex flex-col hover:shadow-2xl transition-all duration-300">
                          <CardContent className="p-5 flex flex-col flex-grow">
                            <div className="flex items-center gap-3 mb-3">
                              <Compass className="h-5 w-5 text-purple-600 flex-shrink-0" />
                              <div className="flex-1">
                                <div className="flex items-center gap-2 flex-wrap">
                                  <h3 className="font-semibold text-gray-900 text-base">
                                    {destination.name}
                                  </h3>
                                  {destination.category && (
                                    <Badge className="adventure-gradient text-white text-xs">
                                      {destination.category}
                                    </Badge>
                                  )}
                                </div>
                                {destination.country && (
                                  <div className="flex items-center text-gray-600 mt-1">
                                    <span className="text-xs">{destination.country}</span>
                                  </div>
                                )}
                              </div>
                            </div>
                            
                            <p className="text-gray-700 mb-3 flex-grow text-sm leading-relaxed">
                              {destination.briefDescription ||
                                `Discover top-rated tours and activities in ${destination.fullName}.`}
                            </p>

                            <div className="mt-auto pt-3 space-y-2">
                              <Button
                                asChild
                                className="w-full sunset-gradient text-white hover:scale-105 transition-transform duration-200 h-10 text-sm font-semibold"
                              >
                                <Link href={`/destinations/${destination.id}/tours`}>
                                  View Tours
                                  <ArrowRight className="ml-2 h-4 w-4" />
                                </Link>
                              </Button>
                              {hasDestinationPage(destination.id) && (
                                <Button
                                  asChild
                                  variant="secondary"
                                  className="w-full bg-white text-purple-700 border border-purple-200 hover:bg-purple-50 hover:scale-105 transition-transform duration-200 h-10 text-sm font-semibold"
                                >
                                  <Link href={`/destinations/${destination.id}`}>
                                    Explore {destination.name}
                                    <ArrowRight className="ml-2 h-4 w-4" />
                                  </Link>
                                </Button>
                              )}
                            </div>
                          </CardContent>
                        </Card>
                      </motion.div>
                    ))}
                  </div>

                  {/* Pagination */}
                  {totalPages > 1 && (
                    <div className="flex flex-col md:flex-row justify-center items-center gap-4 mt-12 w-full">
                      <Button
                        variant="outline"
                        onClick={() => onPageChange(Math.max(1, currentPage - 1))}
                        disabled={currentPage === 1}
                        className="bg-white disabled:opacity-50 w-full sm:w-auto"
                      >
                        Previous
                      </Button>

                      <div className="flex flex-wrap justify-center gap-2 max-w-full">
                        {Array.from({ length: Math.min(totalPages, 10) }, (_, i) => i + 1).map(page => (
                          <Button
                            key={page}
                            variant={currentPage === page ? "default" : "outline"}
                            onClick={() => onPageChange(page)}
                            className={`${currentPage === page ? "sunset-gradient text-white" : "bg-white"} min-w-[48px]`}
                          >
                            {page}
                          </Button>
                        ))}
                        {totalPages > 10 && (
                          <>
                            <span className="px-2 text-gray-500">...</span>
                            <Button
                              variant={currentPage === totalPages ? "default" : "outline"}
                              onClick={() => onPageChange(totalPages)}
                              className={`${currentPage === totalPages ? "sunset-gradient text-white" : "bg-white"} min-w-[48px]`}
                            >
                              {totalPages}
                            </Button>
                          </>
                        )}
                      </div>

                      <Button
                        variant="outline"
                        onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
                        disabled={currentPage === totalPages}
                        className="bg-white disabled:opacity-50 w-full sm:w-auto"
                      >
                        Next
                      </Button>
                    </div>
                  )}
                </>
              ) : (
                <div className="text-center py-20">
                  <p className="text-xl text-gray-600 mb-4">
                    No destinations found
                    {searchTerm.trim() && ` matching "${searchTerm}"`}
                    {selectedCategory !== 'All' && ` in ${selectedCategory}`}
                  </p>
                  <Button
                    onClick={() => {
                      onSearchChange('');
                      onCategoryChange('All');
                    }}
                    variant="outline"
                  >
                    Clear Filters
                  </Button>
                </div>
              )}
            </div>
          </section>
        </main>
      </div>

      <FooterNext />

      <SmartTourFinder isOpen={isModalOpen} onClose={onCloseModal} />
    </>
  );
}

