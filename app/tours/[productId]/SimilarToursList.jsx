"use client";

import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Star, MapPin } from 'lucide-react';
import PrefetchOnHoverLink from '@/components/PrefetchOnHoverLink';
import { getTourUrl, getTourProductId } from '@/utils/tourHelpers';

export default function SimilarToursList({ similarTours, tour, destinationData }) {

  if (!similarTours || similarTours.length === 0) {
    return null;
  }

  // Section title - "Similar tours to {Tour Name}"
  const similarSectionTitle = `Similar tours to ${tour?.title || 'this tour'}`;

  return (
    <motion.section
      id="similar-tours"
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6 }}
      className="mt-16"
    >
      <div className="mb-6">
        <h2 className="text-3xl font-bold text-gray-900">{similarSectionTitle}</h2>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {similarTours.map((similarTour, index) => {
          const similarTourId = getTourProductId(similarTour);
          const similarTourUrl = getTourUrl(similarTourId, similarTour.title);
          const similarImage = similarTour.images?.[0]?.variants?.[5]?.url || 
                              similarTour.images?.[0]?.variants?.[4]?.url || 
                              similarTour.images?.[0]?.variants?.[3]?.url || 
                              similarTour.images?.[0]?.variants?.[0]?.url || '';
          const similarRating = similarTour.reviews?.combinedAverageRating || 0;
          const similarReviewCount = similarTour.reviews?.totalReviews || 0;
          const similarPrice = similarTour.pricing?.summary?.fromPrice || 0;

          return (
            <Card key={similarTourId || index} className="bg-white overflow-hidden hover:shadow-lg transition-all duration-300 hover:-translate-y-1 flex flex-col">
              <PrefetchOnHoverLink href={similarTourUrl}>
                <div className="relative h-48 bg-gray-200 flex-shrink-0 cursor-pointer">
                {similarImage ? (
                  <img
                    src={similarImage}
                    alt={similarTour.title}
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gray-200">
                    <MapPin className="w-8 h-8 text-gray-400" />
                  </div>
                )}
                </div>
              </PrefetchOnHoverLink>
              
              <CardContent className="p-4 flex-1 flex flex-col">
                <PrefetchOnHoverLink href={similarTourUrl}>
                  <h3 className="font-semibold text-gray-800 mb-2 line-clamp-2 flex-1 cursor-pointer hover:text-purple-600 transition-colors">
                    {similarTour.title}
                  </h3>
                </PrefetchOnHoverLink>
                
                {similarRating > 0 && (
                  <div className="flex items-center mb-2">
                    <Star className="w-4 h-4 text-yellow-400 fill-current" />
                    <span className="font-medium text-gray-700 ml-1 text-sm">
                      {similarRating.toFixed(1)}
                    </span>
                    <span className="text-gray-500 text-xs ml-1">
                      ({similarReviewCount.toLocaleString('en-US')})
                    </span>
                  </div>
                )}

                {similarPrice > 0 && (
                  <div className="text-lg font-bold text-orange-600 mb-3">
                    From ${similarPrice.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </div>
                )}

                <Button
                  asChild
                  variant="outline"
                  size="sm"
                  className="w-full mt-auto border-purple-300 text-purple-700 hover:bg-purple-50"
                >
                  <PrefetchOnHoverLink href={similarTourUrl}>
                    View Details
                  </PrefetchOnHoverLink>
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </motion.section>
  );
}
