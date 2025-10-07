import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useToast } from '@/components/ui/use-toast';
import { motion } from 'framer-motion';
import { Helmet } from 'react-helmet';
import { 
  MapPin, 
  Star, 
  ArrowRight, 
  Clock, 
  Calendar, 
  Car, 
  Camera,
  ExternalLink,
  ChevronLeft,
  ChevronRight,
  Search
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { toast } from '@/components/ui/use-toast';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import BlueCTASection from '@/components/ui/blue-cta-section';
import { getDestinationById } from '@/data/destinationsData';

const DestinationDetail = ({ onOpenModal }) => {
  const { destinationId } = useParams();
  const [destination, setDestination] = useState(null);
  const [tours, setTours] = useState({});
  const [loading, setLoading] = useState({});
  const [carouselIndexes, setCarouselIndexes] = useState({});
  const { toast } = useToast();

  useEffect(() => {
    const dest = getDestinationById(destinationId);
    if (dest) {
      setDestination(dest);
      // Initialize carousel indexes for each category
      const indexes = {};
      dest.tourCategories.forEach(category => {
        indexes[category] = 0;
      });
      setCarouselIndexes(indexes);
      
      // Fetch tours for each category
      dest.tourCategories.forEach(category => {
        fetchToursForCategory(dest.name, category);
      });
    }
  }, [destinationId]);

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
          searchTerm: searchTerm,
          page: 1
        })
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('API Response:', errorText);
        throw new Error(`HTTP error! status: ${response.status} - ${errorText}`);
      }

      const data = await response.json();
      
      // Check if the response contains an error
      if (data.error) {
        throw new Error(data.error);
      }
      
      const products = data.products?.results || [];
      
      setTours(prev => ({
        ...prev,
        [category]: products.slice(0, 6) // Max 6 tours per category
      }));
    } catch (error) {
      console.error('Error fetching tours:', error);
      toast({
        title: "Error",
        description: `Failed to load ${category} tours: ${error.message}`,
        variant: "destructive"
      });
    } finally {
      setLoading(prev => ({ ...prev, [category]: false }));
    }
  };

  const nextSlide = (category) => {
    setCarouselIndexes(prev => ({
      ...prev,
      [category]: Math.min(prev[category] + 1, (tours[category]?.length || 0) - 3)
    }));
  };

  const prevSlide = (category) => {
    setCarouselIndexes(prev => ({
      ...prev,
      [category]: Math.max(prev[category] - 1, 0)
    }));
  };

  if (!destination) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-800 mb-4">Destination Not Found</h1>
          <Link to="/destinations" className="text-blue-600 hover:underline">
            ← Back to Destinations
          </Link>
        </div>
      </div>
    );
  }

  // Check if we're on a static HTML page (prevent Helmet from overriding)
  const isStaticPage = window.__PREVENT_HELMET__ || window.location.pathname === '/aruba';

  return (
    <>
      {!isStaticPage && (
        <Helmet>
        <title>{destination.seo.title}</title>
        <meta name="description" content={destination.seo.description} />
        <meta name="keywords" content={destination.seo.keywords} />
        
        {/* Open Graph */}
        <meta property="og:title" content={destination.seo.title} />
        <meta property="og:description" content={destination.seo.description} />
        <meta property="og:type" content="website" />
        <meta property="og:url" content={`https://toptours.ai/destinations/${destination.id}`} />
        <meta property="og:image" content={destination.imageUrl || 'https://ouqeoizufbofdqbuiwvx.supabase.co/storage/v1/object/public/destinations//TopTours-Featured_image.jpg'} />
        <meta property="og:image:width" content="1200" />
        <meta property="og:image:height" content="630" />
        <meta property="og:site_name" content="TopTours.ai" />
        <meta property="og:locale" content="en_US" />
        <meta property="og:image:alt" content={`${destination.fullName} - Tours and Activities`} />
        
        {/* Twitter Card */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={destination.seo.title} />
        <meta name="twitter:description" content={destination.seo.description} />
        <meta name="twitter:image" content={destination.imageUrl || 'https://ouqeoizufbofdqbuiwvx.supabase.co/storage/v1/object/public/destinations//TopTours-Featured_image.jpg'} />
        <meta name="twitter:image:alt" content={`${destination.fullName} - Tours and Activities`} />
        
        {/* Structured Data */}
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "TouristDestination",
            "name": destination.fullName,
            "description": destination.seo.description,
            "image": destination.imageUrl || 'https://ouqeoizufbofdqbuiwvx.supabase.co/storage/v1/object/public/destinations//TopTours-Featured_image.jpg',
            "url": `https://toptours.ai/destinations/${destination.id}`,
            "geo": {
              "@type": "GeoCoordinates",
              "latitude": "12.5211",
              "longitude": "-69.9683"
            },
            "address": {
              "@type": "PostalAddress",
              "addressCountry": "AW"
            }
          })}
        </script>
        </Helmet>
      )}

      <div className="min-h-screen overflow-x-hidden w-full">
        <Navigation onOpenModal={() => onOpenModal(destination?.fullName || '')} />
        
        {/* Hero Section */}
        <section className="pt-24 pb-16 ocean-gradient overflow-hidden w-full max-w-full">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center">
              <motion.div
                initial={{ opacity: 0, x: -30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8 }}
                className="text-white"
              >
                <div className="flex items-center mb-4">
                  <MapPin className="h-5 w-5 mr-2" />
                  <span className="text-lg font-medium">{destination.fullName}</span>
                  <Badge className="ml-4 adventure-gradient text-white">
                    {destination.category}
                  </Badge>
                </div>
                <h1 className="text-3xl sm:text-4xl md:text-6xl font-poppins font-bold mb-4 md:mb-6">
                  {destination.fullName}
                </h1>
                <p className="text-lg sm:text-xl text-white/90 mb-6 md:mb-8">
                  {destination.heroDescription}
                </p>
                <div className="flex flex-wrap gap-2 sm:gap-4">
                  {destination.tourCategories.slice(0, 3).map((category, index) => (
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
                    src={destination.imageUrl || 'https://ouqeoizufbofdqbuiwvx.supabase.co/storage/v1/object/public/destinations//TopTours-Featured_image.jpg'}
                    alt={destination.fullName}
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
              <Link to="/" className="text-gray-500 hover:text-gray-700">Home</Link>
              <span className="text-gray-400">/</span>
              <Link to="/destinations" className="text-gray-500 hover:text-gray-700">Destinations</Link>
              <span className="text-gray-400">/</span>
              <span className="text-gray-900 font-medium">{destination.fullName}</span>
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
                Why Visit {destination.fullName}?
              </h2>
            </motion.div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
              {destination.whyVisit.map((reason, index) => (
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
                    <p className="text-gray-600">{destination.bestTimeToVisit.weather}</p>
                  </div>
                </div>
                
                <div className="flex items-start mb-6">
                  <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mr-4">
                    <Clock className="w-6 h-6 text-green-600" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-gray-800 mb-2">Best Months</h3>
                    <p className="text-gray-600">{destination.bestTimeToVisit.bestMonths}</p>
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
                    <p className="text-blue-700">{destination.bestTimeToVisit.peakSeason}</p>
                  </CardContent>
                </Card>
                
                <Card className="bg-green-50 border-green-200">
                  <CardContent className="p-6">
                    <h3 className="text-lg font-semibold text-green-800 mb-2">Off Season</h3>
                    <p className="text-green-700">{destination.bestTimeToVisit.offSeason}</p>
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
                Popular {destination.fullName} Tours & Activities
              </h2>
              <p className="text-base sm:text-lg text-gray-600 max-w-3xl mx-auto">
                Discover the best tours and activities in {destination.fullName} with our AI-powered recommendations
              </p>
            </motion.div>

            {destination.tourCategories.map((category, categoryIndex) => (
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
                    {destination.fullName} {category}
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
                    <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
                    <p className="mt-4 text-gray-600">Loading {category} tours...</p>
                  </div>
                ) : tours[category] && tours[category].length > 0 ? (
                  <div className="relative">
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6"
                    >
                      {tours[category]
                        .slice(carouselIndexes[category], carouselIndexes[category] + 4)
                        .map((tour, tourIndex) => {
                          const tourId = tour.productId || tourIndex;
                          
                          return (
                            <motion.div
                              key={tourId}
                              initial={{ opacity: 0, y: 20 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ delay: tourIndex * 0.1 }}
                              className="h-full cursor-pointer"
                              onClick={() => window.open(tour.productUrl, '_blank')}
                            >
                              <Card className="h-full overflow-hidden hover:shadow-lg transition-all duration-300 hover:-translate-y-1 flex flex-col">
                                {/* Tour Image */}
                                <div className="relative h-32 bg-gray-200 flex-shrink-0">
                                  {tour.images?.[0]?.variants?.[3]?.url ? (
                                    <img
                                      src={tour.images[0].variants[3].url}
                                      alt={tour.title}
                                      className="w-full h-full object-cover"
                                    />
                                  ) : (
                                    <div className="w-full h-full flex items-center justify-center bg-gray-200">
                                      <Search className="w-6 h-6 text-gray-400" />
                                    </div>
                                  )}
                                </div>

                                {/* Tour Content */}
                                <div className="p-3 flex-1 flex flex-col">
                                  <h3 className="font-semibold text-sm text-gray-800 mb-2 line-clamp-2 flex-1">
                                    {tour.title}
                                  </h3>
                                  
                                  {/* Tour Badges - Display ALL flags from Viator API */}
                                  {tour.flags && Array.isArray(tour.flags) && tour.flags.length > 0 && (
                                    <div className="flex flex-wrap gap-1 mb-2 overflow-hidden">
                                      {tour.flags.map((flag, flagIndex) => {
                                        // Style different flags with different colors
                                        let badgeClass = "text-xs font-medium px-2 py-1 rounded-full";
                                        if (flag === "FREE_CANCELLATION") {
                                          badgeClass += " bg-green-50 text-green-700 border border-green-200";
                                        } else if (flag === "PRIVATE_TOUR") {
                                          badgeClass += " bg-purple-50 text-purple-700 border border-purple-200";
                                        } else if (flag === "LIKELY_TO_SELL_OUT") {
                                          badgeClass += " bg-orange-50 text-orange-700 border border-orange-200";
                                        } else {
                                          badgeClass += " bg-blue-50 text-blue-700 border border-blue-200";
                                        }
                                        
                                        return (
                                          <Badge
                                            key={flagIndex}
                                            variant="secondary"
                                            className={badgeClass}
                                          >
                                            {flag.replace(/_/g, ' ')}
                                          </Badge>
                                        );
                                      })}
                                    </div>
                                  )}

                                  {/* Rating */}
                                  {tour.reviews && (
                                    <div className="flex items-center mb-2">
                                      <Star className="w-3 h-3 text-yellow-400 fill-current" />
                                      <span className="font-medium text-gray-700 ml-1 text-sm">
                                        {tour.reviews.combinedAverageRating?.toFixed(1) || 'N/A'}
                                      </span>
                                      <span className="text-gray-500 text-xs ml-1">
                                        ({tour.reviews.totalReviews || 0})
                                      </span>
                                    </div>
                                  )}

                                  {/* Price */}
                                  <div className="text-lg font-bold text-orange-600 mb-3">
                                    From ${tour.pricing?.summary?.fromPrice || 'N/A'}
                                  </div>

                                  {/* View Details Button */}
                                  <Button
                                    asChild
                                    size="sm"
                                    onClick={(e) => e.stopPropagation()}
                                    className="w-full sunset-gradient text-white font-semibold hover:scale-105 transition-transform duration-200 mt-auto text-xs"
                                  >
                                    <a
                                      href={tour.productUrl}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="flex items-center justify-center"
                                    >
                                      View Details
                                      <ExternalLink className="w-3 h-3 ml-1" />
                                    </a>
                                  </Button>
                                </div>
                              </Card>
                            </motion.div>
                          );
                        })}
                    </motion.div>
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <p className="text-gray-500">No {category} tours found at the moment.</p>
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        </section>



        {/* Getting Around */}
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
                Plan Your {destination.fullName} Trip
              </h2>
            </motion.div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8">
              <motion.div
                initial={{ opacity: 0, x: -30 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8 }}
                viewport={{ once: true }}
              >
                <Card className="bg-blue-50 border-blue-200 h-full">
                  <CardContent className="p-6 sm:p-8">
                    <div className="flex items-start">
                      <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mr-4">
                        <Car className="w-6 h-6 text-blue-600" />
                      </div>
                      <div>
                        <h3 className="text-xl font-semibold text-blue-800 mb-3">Transportation Tips</h3>
                        <p className="text-blue-700 leading-relaxed mb-4">{destination.gettingAround}</p>
                        <div className="bg-blue-100 rounded-lg p-4">
                          <h4 className="font-semibold text-blue-800 mb-2">Car Rental Deals in {destination.fullName}</h4>
                          <p className="text-blue-700 text-sm mb-3">Rent a car for maximum flexibility and explore at your own pace.</p>
                          <Button 
                            asChild
                            size="sm"
                            className="bg-blue-600 hover:bg-blue-700 text-white"
                          >
                            <a 
                              href="https://expedia.com/affiliates/expedia-home.08CyqKu" 
                              target="_blank" 
                              rel="noopener noreferrer"
                            >
                              Find Car Rental Deals
                              <ExternalLink className="ml-2 h-4 w-4" />
                            </a>
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: 30 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8, delay: 0.2 }}
                viewport={{ once: true }}
              >
                <Card className="bg-green-50 border-green-200 h-full">
                  <CardContent className="p-6 sm:p-8">
                    <div className="flex items-start">
                      <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mr-4">
                        <MapPin className="w-6 h-6 text-green-600" />
                      </div>
                      <div>
                        <h3 className="text-xl font-semibold text-green-800 mb-3">Where to Stay</h3>
                        <p className="text-green-700 leading-relaxed mb-4">
                          Find the perfect accommodation for your {destination.fullName} adventure. From luxury resorts to cozy hotels, we've got you covered.
                        </p>
                        <div className="bg-green-100 rounded-lg p-4">
                          <h4 className="font-semibold text-green-800 mb-2">Best Hotel Deals in {destination.fullName}</h4>
                          <p className="text-green-700 text-sm mb-3">Discover top-rated hotels with exclusive rates and special offers.</p>
                          <Button 
                            asChild
                            size="sm"
                            className="bg-green-600 hover:bg-green-700 text-white"
                          >
                            <a 
                              href="https://expedia.com/affiliates/expedia-home.08CyqKu" 
                              target="_blank" 
                              rel="noopener noreferrer"
                            >
                              Find Hotel Deals
                              <ExternalLink className="ml-2 h-4 w-4" />
                            </a>
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            </div>
          </div>
        </section>

                  <BlueCTASection onOpenModal={() => onOpenModal(destination.fullName)} destination={destination.fullName} />
        <Footer />
      </div>
    </>
  );
};

export default DestinationDetail; 