"use client";
import { useState } from 'react';
import NavigationNext from '@/components/NavigationNext';
import FooterNext from '@/components/FooterNext';
import SmartTourFinder from '@/components/home/SmartTourFinder';
import { destinations } from '@/data/destinationsData';
import { Search, MapPin, Star, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import Link from 'next/link';
import { motion } from 'framer-motion';

export default function DestinationsPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [preFilledDestination, setPreFilledDestination] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');

  const handleOpenModal = (destination = '') => {
    setPreFilledDestination(destination);
    setIsModalOpen(true);
  };

  const categories = ['All', 'Europe', 'North America', 'Caribbean', 'Asia-Pacific', 'Africa', 'South America'];

  const filteredDestinations = destinations.filter(dest => {
    const matchesSearch = dest.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         dest.region?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         dest.briefDescription?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || dest.category === selectedCategory;
    return matchesSearch && matchesCategory;
  }).sort((a, b) => a.fullName.localeCompare(b.fullName));

  return (
    <>
      <NavigationNext onOpenModal={handleOpenModal} />
      
      <div className="min-h-screen pt-20">
        {/* Hero Section */}
        <div className="ocean-gradient py-16 px-4">
          <div className="container mx-auto max-w-6xl text-center">
            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-4xl md:text-5xl font-bold text-white mb-6"
            >
              Explore Amazing Destinations
            </motion.h1>
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-xl text-white/90 mb-8"
            >
              Discover {destinations.length}+ incredible destinations worldwide
            </motion.p>
            
            {/* Search Bar */}
            <div className="max-w-2xl mx-auto">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <Input
                  type="text"
                  placeholder="Search destinations..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-12 pr-4 py-6 text-lg rounded-full border-2 border-white/30 bg-white/90 backdrop-blur-sm"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Category Filter */}
        <div className="bg-white border-b py-6">
          <div className="container mx-auto px-4 max-w-7xl">
            <div className="flex flex-wrap justify-center gap-3">
              {categories.map((category) => (
                <Button
                  key={category}
                  variant={selectedCategory === category ? "default" : "outline"}
                  onClick={() => setSelectedCategory(category)}
                  className={selectedCategory === category ? 'bg-gradient-to-r from-orange-500 to-pink-500 text-white border-0' : 'border-gray-300 hover:border-orange-500'}
                >
                  {category}
                </Button>
              ))}
            </div>
          </div>
        </div>

        {/* Results Count */}
        <div className="container mx-auto px-4 py-6 max-w-7xl">
          <p className="text-white/90 text-center text-lg">
            Showing <span className="font-semibold">{filteredDestinations.length}</span> 
            {filteredDestinations.length === 1 ? ' destination' : ' destinations'}
            {searchTerm && <span> for "<span className="font-semibold">{searchTerm}</span>"</span>}
            {selectedCategory !== 'All' && <span> in <span className="font-semibold">{selectedCategory}</span></span>}
          </p>
        </div>

        {/* Destinations Grid */}
        <div className="container mx-auto px-4 pb-12 max-w-7xl">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredDestinations.map((destination, index) => (
              <motion.div
                key={destination.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <Link href={`/destinations/${destination.id}`}>
                  <div className="bg-white rounded-xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 cursor-pointer group">
                    <div className="relative h-48 overflow-hidden">
                      <img
                        src={destination.imageUrl}
                        alt={destination.fullName}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                      />
                      <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm rounded-full px-3 py-1 flex items-center gap-1">
                        <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                        <span className="text-sm font-semibold">Popular</span>
                      </div>
                    </div>
                    
                    <div className="p-6">
                      <div className="flex items-center gap-2 text-gray-600 mb-2">
                        <MapPin className="w-4 h-4" />
                        <span className="text-sm">{destination.region || 'Popular Destination'}</span>
                      </div>
                      
                      <h3 className="text-xl font-bold text-gray-800 mb-2 group-hover:text-blue-600 transition-colors">
                        {destination.fullName}
                      </h3>
                      
                      <p className="text-gray-600 mb-4 line-clamp-2">
                        {destination.seo?.description || destination.heroDescription}
                      </p>
                      
                      <Button variant="outline" className="w-full group-hover:bg-blue-50">
                        Explore Tours
                        <ArrowRight className="w-4 h-4 ml-2" />
                      </Button>
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>

          {filteredDestinations.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-600 text-lg">No destinations found matching "{searchTerm}"</p>
            </div>
          )}
        </div>
      </div>

      <FooterNext />
      
      <SmartTourFinder 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        preFilledDestination={preFilledDestination}
      />
    </>
  );
}

