"use client";
import { useState, useEffect } from 'react';
import NavigationNext from '@/components/NavigationNext';
import FooterNext from '@/components/FooterNext';
import SmartTourFinder from '@/components/home/SmartTourFinder';
import { destinations } from '@/data/destinationsData';
import { Search, MapPin, ArrowRight, Globe } from 'lucide-react';
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
  const itemsPerPage = 24; // Show 24 destinations per page

  // Scroll to top when page changes
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [currentPage]);

  const handleOpenModal = () => {
    setIsModalOpen(true);
  };

  const categories = ['All', 'Europe', 'North America', 'Caribbean', 'Asia-Pacific', 'Africa', 'South America'];

  const allFilteredDestinations = (Array.isArray(destinations) ? destinations : []).filter(dest => {
    const matchesSearch = dest.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (dest.fullName && dest.fullName.toLowerCase().includes(searchTerm.toLowerCase())) ||
                         (dest.briefDescription && dest.briefDescription.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesCategory = selectedCategory === 'All' || 
                           (dest.category && dest.category === selectedCategory);
    return matchesSearch && matchesCategory;
  }).sort((a, b) => a.name.localeCompare(b.name));

  // Pagination
  const totalPages = Math.ceil(allFilteredDestinations.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const filteredDestinations = allFilteredDestinations.slice(startIndex, endIndex);

  // Reset to page 1 when filters change
  const handleCategoryChange = (category) => {
    setSelectedCategory(category);
    setCurrentPage(1);
  };

  const handleSearchChange = (value) => {
    setSearchTerm(value);
    setCurrentPage(1);
  };

  const primaryDestinationName = searchTerm.trim() || filteredDestinations[0]?.name || filteredDestinations[0]?.fullName || 'Top Tours';

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
              {filteredDestinations.length > 0 ? (
                <>
                  <div className="mb-8 text-center">
                    <p className="text-lg text-gray-600">
                      Showing <span className="font-semibold text-gray-800">{startIndex + 1}-{Math.min(endIndex, allFilteredDestinations.length)}</span> of <span className="font-semibold text-gray-800">{allFilteredDestinations.length}</span>
                      {allFilteredDestinations.length === 1 ? ' destination' : ' destinations'}
                      {searchTerm && (
                        <span> for "<span className="font-semibold text-gray-800">{searchTerm}</span>"</span>
                      )}
                      {selectedCategory !== 'All' && (
                        <span> in <span className="font-semibold text-gray-800">{selectedCategory}</span></span>
                      )}
                    </p>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {filteredDestinations.map((destination, index) => (
                      <motion.div
                        key={destination.id}
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.4, delay: index * 0.05 }}
                        viewport={{ once: true }}
                        whileHover={{ y: -5 }}
                        className="cursor-pointer"
                        onClick={() => router.push(`/destinations/${destination.id}`)}
                      >
                        <Card className="bg-white border-0 shadow-xl overflow-hidden h-full flex flex-col hover:shadow-2xl transition-all duration-300">
                          <div className="relative h-48 overflow-hidden">
                            <img 
                              className="w-full h-full object-cover transition-transform duration-300 hover:scale-105" 
                              alt={destination.name}
                              src={destination.imageUrl}
                              loading="lazy"
                              onError={(e) => {
                                e.target.src = "https://images.unsplash.com/photo-1595872018818-97555653a011";
                              }}
                            />
                            <Badge className="absolute top-4 left-4 adventure-gradient text-white">
                              {destination.category}
                            </Badge>
                            <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm rounded-lg px-3 py-1">
                              <span className="text-sm font-medium text-gray-800">{destination.country || destination.fullName}</span>
                            </div>
                          </div>
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
                                  Explore {destination.name}
                                  <ArrowRight className="ml-2 h-5 w-5" />
                                </Link>
                              </Button>
                              <Button
                                asChild
                                variant="secondary"
                                className="w-full bg-white text-purple-700 border border-purple-200 hover:bg-purple-50 h-12 text-base font-semibold"
                                onClick={(e) => e.stopPropagation()}
                              >
                                <Link href={`/destinations/${destination.id}/tours`}>
                                  View Top Tours in {destination.name}
                                  <ArrowRight className="ml-2 h-5 w-5" />
                                </Link>
                              </Button>
                            </div>
                          </CardContent>
                        </Card>
                      </motion.div>
                    ))}
                  </div>

                  {/* Pagination Controls */}
                  {totalPages > 1 && (
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
    </>
  );
}
