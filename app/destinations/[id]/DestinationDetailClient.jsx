"use client";
import { useState, useEffect } from 'react';
import NavigationNext from '@/components/NavigationNext';
import FooterNext from '@/components/FooterNext';
import SmartTourFinder from '@/components/home/SmartTourFinder';
import { useToast } from '@/components/ui/use-toast';
import { motion } from 'framer-motion';
import { 
  Star, ExternalLink, Loader2, Brain, MapPin, Calendar, Clock, Car, Hotel, ChevronLeft, ChevronRight
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';

export default function DestinationDetailClient({ destination }) {
  // Ensure destination has required arrays
  const safeDestination = {
    ...destination,
    tourCategories: Array.isArray(destination?.tourCategories) ? destination.tourCategories : [],
    whyVisit: Array.isArray(destination?.whyVisit) ? destination.whyVisit : []
  };

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [preFilledDestination, setPreFilledDestination] = useState('');
  const [tours, setTours] = useState({});
  const [loading, setLoading] = useState({});
  const [carouselIndexes, setCarouselIndexes] = useState({});
  const { toast } = useToast();

  const handleOpenModal = (dest = '') => {
    setPreFilledDestination(dest);
    setIsModalOpen(true);
  };

  useEffect(() => {
    // Initialize carousel indexes for each category
    const indexes = {};
    safeDestination.tourCategories.forEach(category => {
      indexes[category] = 0;
    });
    setCarouselIndexes(indexes);
    
    // Fetch tours for each category
    safeDestination.tourCategories.forEach(category => {
      fetchToursForCategory(safeDestination.name, category);
    });
  }, []);

  const fetchToursForCategory = async (destinationName, category) => {
    setLoading(prev => ({ ...prev, [category]: true }));
    try {
      const searchTerm = `${destinationName} ${category}`;
      const response = await fetch('/api/viator-search', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          destination: searchTerm,
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      const products = data.products || [];
      
      setTours(prev => ({
        ...prev,
        [category]: products.slice(0, 6) // Max 6 tours per category
      }));
    } catch (error) {
      console.error('Error fetching tours:', error);
      toast({
        title: "Error",
        description: `Failed to load ${category} tours`,
        variant: "destructive"
      });
    } finally {
      setLoading(prev => ({ ...prev, [category]: false }));
    }
  };

  const prevSlide = (category) => {
    setCarouselIndexes(prev => ({
      ...prev,
      [category]: Math.max(0, prev[category] - 1)
    }));
  };

  const nextSlide = (category) => {
    const maxIndex = tours[category] ? tours[category].length - 4 : 0;
    setCarouselIndexes(prev => ({
      ...prev,
      [category]: Math.min(maxIndex, prev[category] + 1)
    }));
  };

  return (
    <>
      <NavigationNext onOpenModal={handleOpenModal} />
      
      <div className="min-h-screen pt-16" suppressHydrationWarning>
        {/* Hero Section */}
        <section className="relative py-12 sm:py-16 md:py-20 overflow-hidden">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 sm:gap-12 items-center">
              <motion.div
                initial={{ opacity: 0, x: -30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8 }}
              >
                <div className="flex items-center mb-4">
                  <MapPin className="w-5 h-5 text-blue-600 mr-2" />
                  <span className="text-white font-medium">{safeDestination.category || safeDestination.region}</span>
                </div>
                <h1 className="text-3xl sm:text-4xl md:text-6xl font-poppins font-bold mb-4 md:mb-6 text-white">
                  {safeDestination.fullName}
                </h1>
                <p className="text-lg sm:text-xl text-white/90 mb-6 md:mb-8">
                  {safeDestination.heroDescription}
                </p>
                <div className="flex flex-wrap gap-2 sm:gap-4">
                  {safeDestination.tourCategories.slice(0, 3).map((category, index) => (
                    <Badge key={index} variant="outline" className="bg-white/20 text-white border-white/30 text-sm">
                      {category}
                    </Badge>
                  ))}
                </div>
              </motion.div>
              
              <motion.div
                initial={{ opacity: 0, x: 30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8, delay: 0.2 }}
                className="relative"
              >
                <div className="relative rounded-2xl overflow-hidden shadow-2xl">
                  <img
                    src={safeDestination.imageUrl}
                    alt={safeDestination.fullName}
                    className="w-full h-64 sm:h-80 object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent"></div>
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Breadcrumb */}
        <section className="bg-white border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 sm:py-4">
            <nav className="flex items-center space-x-2 text-xs sm:text-sm">
              <Link href="/" className="text-gray-500 hover:text-gray-700">Home</Link>
              <span className="text-gray-400">/</span>
              <Link href="/destinations" className="text-gray-500 hover:text-gray-700">Destinations</Link>
              <span className="text-gray-400">/</span>
              <span className="text-gray-900 font-medium">{safeDestination.fullName}</span>
            </nav>
          </div>
        </section>

        {/* Why Visit Section */}
        <section className="py-12 sm:py-16 bg-gray-50 overflow-hidden">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
              className="text-center mb-8 sm:mb-12"
            >
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-poppins font-bold text-gray-800 mb-4 sm:mb-6">
                Why Visit {safeDestination.fullName}?
              </h2>
            </motion.div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
              {safeDestination.whyVisit && Array.isArray(safeDestination.whyVisit) && safeDestination.whyVisit.map((reason, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  viewport={{ once: true }}
                >
                  <Card className="bg-white border-0 shadow-lg h-full">
                    <CardContent className="p-6">
                      <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                        <Star className="w-6 h-6 text-blue-600" />
                      </div>
                      <p className="text-gray-700 leading-relaxed">{reason}</p>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Best Time to Visit */}
        <section className="py-12 sm:py-16 bg-white overflow-hidden">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
              className="text-center mb-8 sm:mb-12"
            >
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-poppins font-bold text-gray-800 mb-4 sm:mb-6">
                Best Time to Visit
              </h2>
            </motion.div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 sm:gap-12">
              <motion.div
                initial={{ opacity: 0, x: -30 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8 }}
                viewport={{ once: true }}
              >
                <div className="flex items-start mb-6">
                  <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center mr-4">
                    <Calendar className="w-6 h-6 text-orange-600" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-gray-800 mb-2">Weather</h3>
                    <p className="text-gray-600">{safeDestination.bestTimeToVisit.weather}</p>
                  </div>
                </div>
                
                <div className="flex items-start mb-6">
                  <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mr-4">
                    <Clock className="w-6 h-6 text-green-600" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-gray-800 mb-2">Best Months</h3>
                    <p className="text-gray-600">{safeDestination.bestTimeToVisit.bestMonths}</p>
                  </div>
                </div>
              </motion.div>
              
              <motion.div
                initial={{ opacity: 0, x: 30 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8 }}
                viewport={{ once: true }}
                className="space-y-6"
              >
                <Card className="bg-blue-50 border-blue-200">
                  <CardContent className="p-6">
                    <h3 className="text-lg font-semibold text-blue-800 mb-2">Peak Season</h3>
                    <p className="text-blue-700">{safeDestination.bestTimeToVisit.peakSeason}</p>
                  </CardContent>
                </Card>
                
                <Card className="bg-green-50 border-green-200">
                  <CardContent className="p-6">
                    <h3 className="text-lg font-semibold text-green-800 mb-2">Off Season</h3>
                    <p className="text-green-700">{safeDestination.bestTimeToVisit.offSeason}</p>
                  </CardContent>
                </Card>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Tour Categories */}
        <section className="py-12 sm:py-16 bg-gray-50 overflow-hidden">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
              className="text-center mb-8 sm:mb-12"
            >
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-poppins font-bold text-gray-800 mb-4 sm:mb-6">
                Popular {safeDestination.fullName} Tours & Activities
              </h2>
              <p className="text-base sm:text-lg text-gray-600 max-w-3xl mx-auto">
                Discover the best tours and activities in {safeDestination.fullName} with our AI-powered recommendations
              </p>
            </motion.div>

            {safeDestination.tourCategories && Array.isArray(safeDestination.tourCategories) && safeDestination.tourCategories.map((category, categoryIndex) => (
              <motion.div
                key={category}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: categoryIndex * 0.1 }}
                viewport={{ once: true }}
                className="mb-16"
              >
                <div className="flex items-center justify-between mb-8">
                  <h3 className="text-2xl font-poppins font-bold text-gray-800">
                    {safeDestination.fullName} {category}
                  </h3>
                  <div className="flex space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => prevSlide(category)}
                      disabled={carouselIndexes[category] === 0}
                      className="w-10 h-10 p-0"
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => nextSlide(category)}
                      disabled={!tours[category] || carouselIndexes[category] >= (tours[category].length - 4)}
                      className="w-10 h-10 p-0"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </Button>
                  </div>
                </div>

                {loading[category] ? (
                  <div className="text-center py-12">
                    <Loader2 className="w-8 h-8 animate-spin mx-auto text-blue-600 mb-4" />
                    <p className="text-gray-600">Loading tours...</p>
                  </div>
                ) : tours[category] && tours[category].length > 0 ? (
                  <div className="overflow-hidden">
                    <div 
                      className="flex transition-transform duration-300 ease-in-out gap-6"
                      style={{ transform: `translateX(-${carouselIndexes[category] * 25}%)` }}
                    >
                      {tours[category].map((tour, index) => (
                        <Card key={tour.productCode || index} className="min-w-[calc(25%-1.5rem)] bg-white border-0 shadow-lg hover:shadow-xl transition-shadow overflow-hidden flex-shrink-0">
                          <div className="relative h-48">
                            {tour.images?.[0]?.variants?.[0]?.url && (
                              <img
                                src={tour.images[0].variants[0].url}
                                alt={tour.title}
                                className="w-full h-full object-cover"
                              />
                            )}
                          </div>
                          <CardContent className="p-6">
                            <h4 className="font-bold text-lg mb-2 line-clamp-2">{tour.title}</h4>
                            <div className="flex items-center gap-2 mb-2">
                              <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                              <span className="text-sm">{tour.rating?.average || 'N/A'} ({tour.rating?.totalReviews || 0})</span>
                            </div>
                            <p className="text-2xl font-bold text-blue-600 mb-3">
                              ${tour.pricing?.summary?.fromPrice || 'N/A'}
                            </p>
                            <Button 
                              className="w-full"
                              onClick={() => window.open(tour.productUrl || `https://www.viator.com/tours/${tour.productCode}`, '_blank')}
                            >
                              View Details
                              <ExternalLink className="w-4 h-4 ml-2" />
                            </Button>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-12 bg-white rounded-lg">
                    <p className="text-gray-500">No {category} tours found at the moment.</p>
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        </section>

        {/* Plan Your Trip Section */}
        <section className="py-12 sm:py-16 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
              className="text-center mb-12"
            >
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-poppins font-bold text-gray-800 mb-6">
                Plan Your {safeDestination.fullName} Trip
              </h2>
            </motion.div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 sm:gap-12">
              {/* Transportation Tips */}
              <motion.div
                initial={{ opacity: 0, x: -30 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8 }}
                viewport={{ once: true }}
              >
                <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200 h-full">
                  <CardContent className="p-8">
                    <div className="flex items-center mb-4">
                      <Car className="w-8 h-8 text-blue-600 mr-3" />
                      <h3 className="text-2xl font-bold text-gray-800">Transportation Tips</h3>
                    </div>
                    <p className="text-gray-700 mb-6 leading-relaxed">{safeDestination.gettingAround}</p>
                    <div className="bg-white rounded-lg p-4">
                      <h4 className="font-semibold text-gray-800 mb-2">Car Rental Deals in {safeDestination.fullName}</h4>
                      <p className="text-gray-600 text-sm mb-3">Rent a car for maximum flexibility and explore at your own pace.</p>
                      <Button variant="outline" className="w-full" onClick={() => window.open(`https://www.rentalcars.com/SearchResults.do?city=${encodeURIComponent(safeDestination.fullName)}`, '_blank')}>
                        Find Car Rental Deals
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>

              {/* Where to Stay */}
              <motion.div
                initial={{ opacity: 0, x: 30 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8 }}
                viewport={{ once: true }}
              >
                <Card className="bg-gradient-to-br from-purple-50 to-pink-50 border-purple-200 h-full">
                  <CardContent className="p-8">
                    <div className="flex items-center mb-4">
                      <Hotel className="w-8 h-8 text-purple-600 mr-3" />
                      <h3 className="text-2xl font-bold text-gray-800">Where to Stay</h3>
                    </div>
                    <p className="text-gray-700 mb-6 leading-relaxed">
                      Find the perfect accommodation for your {safeDestination.fullName} adventure. From luxury resorts to cozy hotels, we've got you covered.
                    </p>
                    <div className="bg-white rounded-lg p-4">
                      <h4 className="font-semibold text-gray-800 mb-2">Best Hotel Deals in {safeDestination.fullName}</h4>
                      <p className="text-gray-600 text-sm mb-3">Discover top-rated hotels with exclusive rates and special offers.</p>
                      <Button variant="outline" className="w-full" onClick={() => window.open(`https://www.booking.com/searchresults.html?ss=${encodeURIComponent(safeDestination.fullName)}`, '_blank')}>
                        Find Hotel Deals
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-16 bg-gradient-to-r from-blue-600 to-purple-600">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
            >
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
                Ready to Explore {safeDestination.fullName}?
              </h2>
              <p className="text-xl text-white/90 mb-8">
                Discover the best tours and activities in {safeDestination.fullName} with AI-powered recommendations tailored just for you.
              </p>
              <Button 
                onClick={() => handleOpenModal(safeDestination.fullName)}
                size="lg"
                className="sunset-gradient text-white hover:scale-105 transition-transform duration-200 px-8 py-6 text-lg"
              >
                Start Planning Your {safeDestination.fullName} Trip
              </Button>
            </motion.div>
          </div>
        </section>
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
