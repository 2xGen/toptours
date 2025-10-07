import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { MapPin, Star, ArrowRight, Search, Globe } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import BlueCTASection from '@/components/ui/blue-cta-section';
import { Helmet } from 'react-helmet';
import { getAllDestinations } from '@/data/destinationsData';

const Destinations = ({ onOpenModal }) => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [destinations, setDestinations] = useState([]);

  const categories = ['All', 'Europe', 'North America', 'Caribbean', 'Asia-Pacific', 'Africa', 'South America'];

  useEffect(() => {
    const allDestinations = getAllDestinations();
    setDestinations(allDestinations);
  }, []);

  const filteredDestinations = destinations.filter(dest => {
    const matchesSearch = dest.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (dest.fullName && dest.fullName.toLowerCase().includes(searchTerm.toLowerCase())) ||
                         (dest.briefDescription && dest.briefDescription.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesCategory = selectedCategory === 'All' || 
                           (dest.category && dest.category === selectedCategory);
    return matchesSearch && matchesCategory;
  }).sort((a, b) => a.name.localeCompare(b.name));

  return (
    <>
      <Helmet>
        <title>Popular Destinations - TopTours.ai</title>
        <meta name="description" content="Discover amazing tours and activities in the world's most popular destinations. Find the perfect adventure for your next trip." />
        <meta name="keywords" content="travel destinations, popular destinations, tours, activities, travel planning" />
        
        {/* Open Graph */}
        <meta property="og:title" content="Popular Destinations - TopTours.ai" />
        <meta property="og:description" content="Discover amazing tours and activities in the world's most popular destinations. Find the perfect adventure for your next trip with AI-powered recommendations." />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://toptours.ai/destinations" />
        <meta property="og:image" content="https://ouqeoizufbofdqbuiwvx.supabase.co/storage/v1/object/public/destinations//TopTours-Featured_image.jpg" />
        <meta property="og:image:width" content="1200" />
        <meta property="og:image:height" content="630" />
        <meta property="og:site_name" content="TopTours.ai" />
        <meta property="og:locale" content="en_US" />
        
        {/* Twitter Card */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Popular Destinations - TopTours.ai" />
        <meta name="twitter:description" content="Discover amazing tours and activities in the world's most popular destinations." />
        <meta name="twitter:image" content="https://toptours.ai/og-destinations.jpg" />
      </Helmet>
      
      <div className="min-h-screen flex flex-col bg-gray-50">
        <Navigation onOpenModal={onOpenModal} />
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
                      onChange={(e) => setSearchTerm(e.target.value)}
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
                onClick={() => setSelectedCategory(category)}
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
                      Showing <span className="font-semibold text-gray-800">{filteredDestinations.length}</span> 
                      {filteredDestinations.length === 1 ? ' destination' : ' destinations'}
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
                      onClick={() => navigate(`/destinations/${destination.id}`)}
              >
                      <Card className="bg-white border-0 shadow-xl overflow-hidden h-full flex flex-col hover:shadow-2xl transition-all duration-300">
                  <div className="relative h-48 overflow-hidden">
                    <img 
                            className="w-full h-full object-cover transition-transform duration-300 hover:scale-105" 
                      alt={destination.name}
                            src={destination.imageUrl}
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
                    
                    <div className="mt-auto pt-4">
                      <Button 
                              asChild
                        className="w-full sunset-gradient text-white hover:scale-105 transition-transform duration-200 h-12 text-base font-semibold"
                              onClick={(e) => e.stopPropagation()}
                      >
                              <Link to={`/destinations/${destination.id}`}>
                        Explore {destination.name}
                        <ArrowRight className="ml-2 h-5 w-5" />
                              </Link>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
                  </div>
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

          <BlueCTASection 
            onOpenModal={() => onOpenModal()}
            title="Ready to Experience Smart Travel?"
            description="Join thousands of travelers who have discovered their perfect adventures with TopTours.ai."
            buttonText="Start Planning Your Trip"
          />
        </main>
      <Footer />
    </div>
    </>
  );
};

export default Destinations;