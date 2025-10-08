"use client";
import { useState } from 'react';
import NavigationNext from '@/components/NavigationNext';
import FooterNext from '@/components/FooterNext';
import SmartTourFinder from '@/components/home/SmartTourFinder';
import { travelGuides } from '@/data/travelGuidesData';
import { Search, ArrowRight, Tag, BookOpen } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import Link from 'next/link';
import { motion } from 'framer-motion';

export default function TravelGuidesPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 12; // Show 12 guides per page

  const handleOpenModal = () => {
    setIsModalOpen(true);
  };

  const categories = ['All', 'General Travel Tips', 'Caribbean', 'Europe', 'North America', 'Asia-Pacific', 'Africa', 'South America'];

  const allFilteredGuides = (Array.isArray(travelGuides) ? travelGuides : []).filter(guide => {
    const matchesSearch = guide.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         guide.excerpt.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (Array.isArray(guide.tags) && guide.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase())));
    const matchesCategory = selectedCategory === 'All' || guide.category === selectedCategory;
    return matchesSearch && matchesCategory;
  }).sort((a, b) => new Date(b.publishDate) - new Date(a.publishDate));

  // Pagination
  const totalPages = Math.ceil(allFilteredGuides.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const filteredGuides = allFilteredGuides.slice(startIndex, endIndex);

  const featuredGuides = (Array.isArray(travelGuides) ? travelGuides : []).filter(guide => guide.featured);

  // Reset to page 1 when filters change
  const handleCategoryChange = (category) => {
    setSelectedCategory(category);
    setCurrentPage(1);
  };

  const handleSearchChange = (value) => {
    setSearchTerm(value);
    setCurrentPage(1);
  };

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
                  Travel Guides
                </h1>
                <p className="text-xl text-white/90 max-w-3xl mx-auto mb-8">
                  Discover smart travel insights, destination guides, and AI-powered tips to help you plan your perfect trip — from hidden gems to must-do tours around the world.
                </p>
                
                <div className="max-w-2xl mx-auto">
                  <div className="glass-effect rounded-2xl p-4">
                    <div className="flex gap-4">
                      <div className="flex-1 relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                        <Input
                          placeholder="Search travel guides..."
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

          {/* Featured Guides Section */}
          {featuredGuides.length > 0 && !searchTerm && selectedCategory === 'All' && (
            <section className="py-16 bg-white">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-12">
                  <h2 className="text-3xl font-bold text-gray-900 mb-4">Featured Guides</h2>
                  <p className="text-lg text-gray-600">Top-performing travel guides and expert recommendations</p>
                </div>
                
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  {featuredGuides.slice(0, 2).map((guide, index) => (
                    <motion.div
                      key={guide.id}
                      initial={{ opacity: 0, y: 30 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.4, delay: index * 0.1 }}
                      viewport={{ once: true }}
                      whileHover={{ y: -5 }}
                    >
                      <Card className="bg-white border-0 shadow-xl overflow-hidden h-full hover:shadow-2xl transition-all duration-300 flex flex-col">
                        <div className="relative h-64 overflow-hidden">
                          <img 
                            className="w-full h-full object-cover transition-transform duration-300 hover:scale-105" 
                            alt={guide.title}
                            src={guide.image}
                          />
                          <Badge className="absolute top-4 left-4 adventure-gradient text-white">
                            {guide.category}
                          </Badge>
                          <Badge className="absolute bottom-4 left-4 bg-blue-600 text-white text-xs">
                            {guide.type === 'evergreen' ? 'Essential' : guide.type === 'regional' ? 'Regional' : 'Destination'}
                          </Badge>
                        </div>
                        
                        <CardContent className="p-6 flex flex-col flex-grow">
                          <h3 className="text-xl font-bold text-gray-900 mb-3">
                            {guide.title}
                          </h3>
                          
                          <p className="text-gray-700 mb-4 flex-grow">
                            {guide.excerpt}
                          </p>
                          
                          <Button 
                            className="w-full sunset-gradient text-white hover:scale-105 transition-transform duration-200 h-12 text-base font-semibold mt-auto"
                            asChild
                          >
                            <Link href={`/travel-guides/${guide.id}`}>
                              Read Guide
                              <ArrowRight className="ml-2 h-5 w-5" />
                            </Link>
                          </Button>
                        </CardContent>
                      </Card>
                    </motion.div>
                  ))}
                </div>
              </div>
            </section>
          )}

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
              {filteredGuides.length > 0 ? (
                <>
                  <div className="mb-8 text-center">
                    <p className="text-lg text-gray-600">
                      Showing <span className="font-semibold text-gray-800">{filteredGuides.length}</span> 
                      {filteredGuides.length === 1 ? ' guide' : ' guides'}
                      {searchTerm && (
                        <span> for "<span className="font-semibold text-gray-800">{searchTerm}</span>"</span>
                      )}
                      {selectedCategory !== 'All' && (
                        <span> in <span className="font-semibold text-gray-800">{selectedCategory}</span></span>
                      )}
                    </p>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {filteredGuides.map((guide, index) => (
                      <motion.div
                        key={guide.id}
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.4, delay: index * 0.05 }}
                        viewport={{ once: true }}
                        whileHover={{ y: -5 }}
                        className="cursor-pointer"
                      >
                        <Card className="bg-white border-0 shadow-xl overflow-hidden h-full flex flex-col hover:shadow-2xl transition-all duration-300">
                          <div className="relative h-48 overflow-hidden">
                            <img 
                              className="w-full h-full object-cover transition-transform duration-300 hover:scale-105" 
                              alt={guide.title}
                              src={guide.image}
                              loading="lazy"
                            />
                            <Badge className="absolute top-4 left-4 adventure-gradient text-white">
                              {guide.category}
                            </Badge>
                            {guide.type && (
                              <Badge className="absolute bottom-4 left-4 bg-blue-600 text-white text-xs">
                                {guide.type === 'evergreen' ? 'Essential' : guide.type === 'regional' ? 'Regional' : 'Destination'}
                              </Badge>
                            )}
                          </div>
                          
                          <CardContent className="p-6 flex flex-col flex-grow">
                            <h3 className="text-lg font-bold text-gray-900 mb-3 line-clamp-2">
                              {guide.title}
                            </h3>
                            
                            <p className="text-gray-700 mb-4 flex-grow line-clamp-3">
                              {guide.excerpt}
                            </p>
                            
                            <div className="flex flex-wrap gap-2 mb-4">
                              {Array.isArray(guide.tags) && guide.tags.slice(0, 2).map((tag) => (
                                <Badge key={tag} variant="outline" className="text-xs">
                                  <Tag className="h-3 w-3 mr-1" />
                                  {tag}
                                </Badge>
                              ))}
                            </div>
                            
                            <div className="mt-auto pt-4">
                              <Button 
                                className="w-full sunset-gradient text-white hover:scale-105 transition-transform duration-200 h-12 text-base font-semibold"
                                asChild
                              >
                                <Link href={`/travel-guides/${guide.id}`}>
                                  Read Guide
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
                    <div className="flex justify-center items-center gap-2 mt-12">
                      <Button
                        variant="outline"
                        onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                        disabled={currentPage === 1}
                        className="bg-white disabled:opacity-50"
                      >
                        Previous
                      </Button>
                      
                      <div className="flex gap-2">
                        {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                          <Button
                            key={page}
                            variant={currentPage === page ? "default" : "outline"}
                            onClick={() => setCurrentPage(page)}
                            className={currentPage === page ? "sunset-gradient text-white" : "bg-white"}
                          >
                            {page}
                          </Button>
                        ))}
                      </div>

                      <Button
                        variant="outline"
                        onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                        disabled={currentPage === totalPages}
                        className="bg-white disabled:opacity-50"
                      >
                        Next
                      </Button>
                    </div>
                  )}
                </>
              ) : (
                <div className="text-center py-16">
                  <BookOpen className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <h2 className="text-3xl font-bold text-gray-800 mb-4">
                    No Guides Found
                  </h2>
                  <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                    We couldn't find any travel guides matching your search. Try adjusting your filters or search terms.
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
                  Ready to Plan Your Trip with AI?
                </h2>
                <p className="text-xl text-white/90 mb-8 max-w-3xl mx-auto">
                  Put these travel guides into action with our AI-powered tour recommendations and smart trip planning tools.
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
