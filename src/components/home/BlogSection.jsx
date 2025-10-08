import React from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { ArrowRight, MapPin } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

const TopDestinations = () => {
  // Popular destinations from different categories
  const topDestinations = [
    {
      id: 'paris',
      name: 'Paris',
      fullName: 'Paris, France',
      category: 'Europe',
      briefDescription: 'The City of Light offers iconic landmarks, world-class museums, and unforgettable culinary experiences.',
      imageUrl: 'https://ouqeoizufbofdqbuiwvx.supabase.co/storage/v1/object/public/destinations//paris.jpg'
    },
    {
      id: 'bali',
      name: 'Bali',
      fullName: 'Bali, Indonesia',
      category: 'Asia-Pacific',
      briefDescription: 'Tropical paradise with ancient temples, pristine beaches, and rich cultural heritage.',
      imageUrl: 'https://ouqeoizufbofdqbuiwvx.supabase.co/storage/v1/object/public/destinations//Bali.jpeg'
    },
    {
      id: 'new-york-city',
      name: 'New York City',
      fullName: 'New York City, USA',
      category: 'North America',
      briefDescription: 'The Big Apple offers world-famous attractions, diverse neighborhoods, and endless entertainment.',
      imageUrl: 'https://ouqeoizufbofdqbuiwvx.supabase.co/storage/v1/object/public/destinations//New%20York%20City.jpeg'
    },
    {
      id: 'santorini',
      name: 'Santorini',
      fullName: 'Santorini, Greece',
      category: 'Europe',
      briefDescription: 'Stunning sunsets, white-washed buildings, and crystal-clear waters in the Aegean Sea.',
      imageUrl: 'https://ouqeoizufbofdqbuiwvx.supabase.co/storage/v1/object/public/destinations//Santorini.avif'
    },
    {
      id: 'tokyo',
      name: 'Tokyo',
      fullName: 'Tokyo, Japan',
      category: 'Asia-Pacific',
      briefDescription: 'A fascinating blend of ultramodern technology and ancient traditions in Japan\'s capital.',
      imageUrl: 'https://ouqeoizufbofdqbuiwvx.supabase.co/storage/v1/object/public/destinations//tokyo.webp'
    },
    {
      id: 'cancun',
      name: 'Cancún',
      fullName: 'Cancún, Mexico',
      category: 'North America',
      briefDescription: 'Pristine beaches, ancient Mayan ruins, and vibrant nightlife on the Yucatán Peninsula.',
      imageUrl: 'https://ouqeoizufbofdqbuiwvx.supabase.co/storage/v1/object/public/destinations//Cancun.webp'
    }
  ];

  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-poppins font-bold text-gray-800 mb-6">
            Top Destinations
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Discover the world's most popular destinations with curated tours and unforgettable experiences.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {topDestinations.map((destination, index) => (
            <motion.div
              key={destination.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              viewport={{ once: true }}
              className="h-full"
            >
              <Link href={`/destinations/${destination.id}`} className="block h-full group">
                <Card className="bg-white border-0 shadow-lg group-hover:shadow-xl transition-all duration-300 overflow-hidden h-full flex flex-col hover:-translate-y-1">
                  <div className="relative w-full h-56 overflow-hidden">
                    <img
                      src={destination.imageUrl}
                      alt={destination.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      loading="lazy"
                    />
                    <Badge className="absolute top-4 left-4 adventure-gradient text-white">
                      {destination.category}
                    </Badge>
                    <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm rounded-lg px-3 py-1">
                      <span className="text-sm font-medium text-gray-800">{destination.fullName}</span>
                    </div>
                  </div>
                  <CardContent className="p-6 flex-grow flex flex-col">
                    <div className="flex items-center text-gray-600 mb-2">
                      <MapPin className="h-4 w-4 mr-1" />
                      <span className="font-semibold">{destination.name}</span>
                    </div>
                    <p className="text-gray-700 mb-4 flex-grow">
                      {destination.briefDescription}
                    </p>
                    <div className="mt-auto pt-4">
                      <Button 
                        className="w-full sunset-gradient text-white hover:scale-105 transition-transform duration-200 h-12 text-base font-semibold"
                      >
                        Explore {destination.name}
                        <ArrowRight className="ml-2 h-5 w-5" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            </motion.div>
          ))}
        </div>
        
        <div className="text-center mt-16">
          <Link href="/destinations">
            <Button variant="outline" className="px-8 py-3 text-blue-600 border-blue-600 hover:bg-blue-600 hover:text-white transition-colors duration-300">
              View All Destinations
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
};

export default TopDestinations;
