import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Search, Star, ExternalLink, MapPin, Clock, Users, Heart, Camera, Utensils, Landmark, Sparkles } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Card } from '../components/ui/card';
import Navigation from '../components/Navigation';
import Footer from '../components/Footer';

const Paris = () => {
  const [tours, setTours] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('all');

  const tourCategories = [
    { id: 'all', name: 'All Tours', icon: Sparkles, searchTerm: 'Paris' },
    { id: 'food', name: 'Food & Wine', icon: Utensils, searchTerm: 'Paris food wine' },
    { id: 'culture', name: 'Culture & History', icon: Landmark, searchTerm: 'Paris culture history' },
    { id: 'romantic', name: 'Romantic', icon: Heart, searchTerm: 'Paris romantic' },
    { id: 'photography', name: 'Photography', icon: Camera, searchTerm: 'Paris photography' },
    { id: 'daytrips', name: 'Day Trips', icon: MapPin, searchTerm: 'Paris day trips' }
  ];

  const fetchTours = async (searchTerm) => {
    setLoading(true);
    try {
      const response = await fetch('/api/internal/viator-search', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          searchTerm: searchTerm,
          page: 1
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      const products = data.products?.results || [];
      setTours(products);
    } catch (error) {
      console.error('Error fetching tours:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTours('Paris');
  }, []);

  const handleCategoryClick = (category) => {
    setSelectedCategory(category.id);
    fetchTours(category.searchTerm);
  };

  const currentCategory = tourCategories.find(cat => cat.id === selectedCategory);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <Navigation />
      
      {/* Hero Section */}
      <div className="relative pt-20 pb-16 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-900/80 to-purple-900/80"></div>
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1502602898534-47d22c0d3b3c?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80')] bg-cover bg-center opacity-30"></div>
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h1 className="text-5xl md:text-6xl font-bold text-white mb-6">
              Discover Paris
            </h1>
            <p className="text-xl md:text-2xl text-white/90 mb-8 max-w-3xl mx-auto">
              Experience the magic of the City of Light with curated tours, from iconic landmarks to hidden gems
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <div className="flex items-center text-white/80">
                <MapPin className="w-5 h-5 mr-2" />
                <span>Iconic Landmarks</span>
              </div>
              <div className="flex items-center text-white/80">
                <Utensils className="w-5 h-5 mr-2" />
                <span>Gourmet Experiences</span>
              </div>
              <div className="flex items-center text-white/80">
                <Heart className="w-5 h-5 mr-2" />
                <span>Romantic Getaways</span>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* SEO Content Section */}
      <div className="py-16 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <h2 className="text-3xl font-bold text-gray-800 mb-6">
              Best Paris Tours & Experiences in 2024
            </h2>
            
            <div className="prose prose-lg max-w-none text-gray-600">
              <p className="text-xl leading-relaxed mb-6">
                Paris, the enchanting capital of France, offers an unparalleled blend of history, culture, and romance. From the iconic Eiffel Tower to the charming streets of Montmartre, every corner of this magnificent city tells a story waiting to be discovered.
              </p>
              
              <h3 className="text-2xl font-semibold text-gray-800 mt-8 mb-4">
                Why Choose Guided Tours in Paris?
              </h3>
              <p className="mb-6">
                With over 30 million visitors annually, Paris can be overwhelming to explore on your own. Our carefully curated selection of Paris tours offers you:
              </p>
              <ul className="space-y-2 mb-6">
                <li className="flex items-start">
                  <Star className="w-5 h-5 text-yellow-400 mt-0.5 mr-3 flex-shrink-0" />
                  <span><strong>Skip-the-line access</strong> to major attractions like the Louvre and Eiffel Tower</span>
                </li>
                <li className="flex items-start">
                  <Star className="w-5 h-5 text-yellow-400 mt-0.5 mr-3 flex-shrink-0" />
                  <span><strong>Local expert guides</strong> who share fascinating stories and hidden gems</span>
                </li>
                <li className="flex items-start">
                  <Star className="w-5 h-5 text-yellow-400 mt-0.5 mr-3 flex-shrink-0" />
                  <span><strong>Small group experiences</strong> for a more intimate and personalized journey</span>
                </li>
                <li className="flex items-start">
                  <Star className="w-5 h-5 text-yellow-400 mt-0.5 mr-3 flex-shrink-0" />
                  <span><strong>Flexible booking</strong> with free cancellation options</span>
                </li>
              </ul>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Tour Categories */}
      <div className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
          >
            <h2 className="text-3xl font-bold text-gray-800 text-center mb-12">
              Explore Paris by Category
            </h2>
            
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-12">
              {tourCategories.map((category) => (
                <Button
                  key={category.id}
                  onClick={() => handleCategoryClick(category)}
                  variant={selectedCategory === category.id ? "default" : "outline"}
                  className={`h-auto p-4 flex flex-col items-center gap-2 transition-all duration-200 ${
                    selectedCategory === category.id 
                      ? 'sunset-gradient text-white' 
                      : 'bg-white hover:bg-gray-50'
                  }`}
                >
                  <category.icon className="w-6 h-6" />
                  <span className="text-sm font-medium text-center">{category.name}</span>
                </Button>
              ))}
            </div>

            {/* Tour Results */}
            <div className="bg-white rounded-lg p-6">
              <h3 className="text-2xl font-bold text-gray-800 mb-6">
                {currentCategory?.name} in Paris
              </h3>
              
              {loading ? (
                <div className="text-center py-12">
                  <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
                  <p className="mt-4 text-gray-600">Finding amazing Paris tours...</p>
                </div>
              ) : tours.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {tours.slice(0, 6).map((tour, index) => (
                    <motion.div
                      key={tour.productId || index}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="h-full"
                    >
                      <Card className="h-full overflow-hidden hover:shadow-lg transition-all duration-300 hover:-translate-y-1 flex flex-col">
                        {/* Tour Image */}
                        <div className="relative h-48 bg-gray-200 flex-shrink-0">
                          {tour.images?.[0]?.variants?.[3]?.url ? (
                            <img
                              src={tour.images[0].variants[3].url}
                              alt={tour.title}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center bg-gray-200">
                              <Camera className="w-8 h-8 text-gray-400" />
                            </div>
                          )}
                        </div>

                        {/* Tour Content */}
                        <div className="p-4 flex-1 flex flex-col">
                          <h4 className="font-semibold text-lg text-gray-800 mb-2 line-clamp-2 flex-1">
                            {tour.title}
                          </h4>
                          
                          {/* Rating */}
                          {tour.reviews && (
                            <div className="flex items-center mb-3">
                              <Star className="w-4 h-4 text-yellow-400 fill-current" />
                              <span className="font-medium text-gray-700 ml-1">
                                {tour.reviews.combinedAverageRating?.toFixed(1) || 'N/A'}
                              </span>
                              <span className="text-gray-500 text-sm ml-1">
                                ({tour.reviews.totalReviews || 0})
                              </span>
                            </div>
                          )}

                          {/* Price */}
                          <div className="text-xl font-bold text-orange-600 mb-4">
                            From ${tour.pricing?.summary?.fromPrice || 'N/A'}
                          </div>

                          {/* View Details Button */}
                          <Button
                            asChild
                            className="w-full sunset-gradient text-white font-semibold hover:scale-105 transition-transform duration-200 mt-auto"
                          >
                            <a
                              href={tour.productUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center justify-center"
                            >
                              View Details
                              <ExternalLink className="w-4 h-4 ml-2" />
                            </a>
                          </Button>
                        </div>
                      </Card>
                    </motion.div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <Search className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-800 mb-2">No tours found</h3>
                  <p className="text-gray-600">
                    Try selecting a different category or search for something else.
                  </p>
                </div>
              )}
            </div>
          </motion.div>
        </div>
      </div>

      {/* SEO Content - Popular Attractions */}
      <div className="py-16 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
          >
            <h2 className="text-3xl font-bold text-gray-800 mb-8">
              Must-See Attractions in Paris
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <h3 className="text-xl font-semibold text-gray-800 mb-4">Iconic Landmarks</h3>
                <ul className="space-y-2 text-gray-600">
                  <li>• Eiffel Tower - The symbol of Paris</li>
                  <li>• Arc de Triomphe - Historic monument</li>
                  <li>• Notre-Dame Cathedral - Gothic masterpiece</li>
                  <li>• Sacré-Cœur - Stunning basilica</li>
                </ul>
              </div>
              
              <div>
                <h3 className="text-xl font-semibold text-gray-800 mb-4">Cultural Highlights</h3>
                <ul className="space-y-2 text-gray-600">
                  <li>• Louvre Museum - World's largest art museum</li>
                  <li>• Musée d'Orsay - Impressionist masterpieces</li>
                  <li>• Champs-Élysées - Famous avenue</li>
                  <li>• Montmartre - Artistic neighborhood</li>
                </ul>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* FAQ Section */}
      <div className="py-16 bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.8 }}
          >
            <h2 className="text-3xl font-bold text-gray-800 mb-8">
              Frequently Asked Questions About Paris Tours
            </h2>
            
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-2">
                  What is the best time to visit Paris?
                </h3>
                <p className="text-gray-600">
                  Spring (April to June) and fall (September to November) offer pleasant weather and fewer crowds. Summer is peak season with longer days but more tourists.
                </p>
              </div>
              
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-2">
                  How far in advance should I book Paris tours?
                </h3>
                <p className="text-gray-600">
                  Popular tours, especially those with skip-the-line access, should be booked 2-4 weeks in advance. During peak season, book 1-2 months ahead.
                </p>
              </div>
              
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-2">
                  Are Paris tours suitable for families with children?
                </h3>
                <p className="text-gray-600">
                  Yes! Many tours offer family-friendly options with engaging guides who make history fun for kids. Look for tours specifically designed for families.
                </p>
              </div>
              
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-2">
                  What should I wear for Paris tours?
                </h3>
                <p className="text-gray-600">
                  Comfortable walking shoes are essential. Dress in layers as weather can change throughout the day. Many attractions require modest dress.
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default Paris; 