import React from 'react';
import { motion } from 'framer-motion';
import { MapPin, Star, ArrowRight, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { featuredTours } from '@/data/homeData';

const FeaturedTours = ({ onOpenModal }) => {
  const handleViewTour = (bookingUrl) => {
    window.open(bookingUrl, '_blank');
  };

  return (
    <section className="py-20 adventure-gradient">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-poppins font-bold text-white mb-6">
            Top-Rated Tours & Activities
          </h2>
          <p className="text-xl text-white/90 max-w-3xl mx-auto">
            Discover amazing experiences loved by thousands of travelers worldwide.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {featuredTours.map((tour, index) => (
            <motion.div
              key={tour.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: index * 0.1 }}
              viewport={{ once: true }}
              whileHover={{ y: -10 }}
            >
              <Card className="bg-white/95 backdrop-blur-sm border-0 shadow-xl overflow-hidden">
                <div className="relative h-48 overflow-hidden">
                  <img 
                    className="w-full h-full object-cover transition-transform duration-300 hover:scale-110" 
                    alt={tour.title}
                    src={tour.image} />
                  <Badge className="absolute top-4 left-4 sunset-gradient text-white">
                    {tour.category}
                  </Badge>
                </div>
                <CardContent className="p-6">
                  <h3 className="text-xl font-poppins font-semibold text-gray-800 mb-2">
                    {tour.title}
                  </h3>
                  <div className="flex items-center text-gray-600 mb-3">
                    <MapPin className="h-4 w-4 mr-1" />
                    <span className="text-sm">{tour.location}</span>
                  </div>
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center">
                      <Star className="h-4 w-4 text-yellow-400 fill-current" />
                      <span className="text-sm font-medium ml-1">{tour.rating}</span>
                      <span className="text-sm text-gray-500 ml-1">({tour.reviews})</span>
                    </div>
                    <span className="text-sm text-gray-600">{tour.duration}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-2xl font-bold text-gray-800">{tour.price}</span>
                    <Button 
                      onClick={() => handleViewTour(tour.bookingUrl)}
                      className="sunset-gradient text-white hover:scale-105 transition-transform duration-200 flex items-center gap-2"
                    >
                      View Tour
                      <ExternalLink className="w-4 h-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        <div className="text-center mt-12">
          <Button 
            onClick={onOpenModal}
            variant="outline" 
            className="bg-white/20 border-white text-white hover:bg-white hover:text-gray-800 transition-all duration-200"
          >
            View All Tours
            <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
        </div>
      </div>
    </section>
  );
};

export default FeaturedTours;