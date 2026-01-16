"use client";

import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Star, MapPin } from 'lucide-react';
import Link from 'next/link';
import { getTourUrl } from '@/utils/tourHelpers';

export default function RecommendedToursList({ recommendedTours, tour }) {

  if (!recommendedTours || recommendedTours.length === 0) {
    return null;
  }

  return (
    <motion.section
      id="recommended-tours"
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6 }}
      className="mt-16"
    >
      <div className="mb-6">
        <h2 className="text-3xl font-bold text-gray-900">
          Similar tours to {tour?.title || 'this tour'}
        </h2>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {recommendedTours.map((recommendedTour, index) => {
          const recommendedTourId = recommendedTour.productId || recommendedTour.productCode;
          const recommendedTourUrl = getTourUrl(recommendedTourId, recommendedTour.title);
          const recommendedImage = recommendedTour.images?.[0]?.variants?.[5]?.url || 
                                  recommendedTour.images?.[0]?.variants?.[4]?.url || 
                                  recommendedTour.images?.[0]?.variants?.[3]?.url || 
                                  recommendedTour.images?.[0]?.variants?.[0]?.url || '';
          const recommendedRating = recommendedTour.reviews?.combinedAverageRating || 0;
          const recommendedReviewCount = recommendedTour.reviews?.totalReviews || 0;
          const recommendedPrice = recommendedTour.pricing?.summary?.fromPrice || 
                                  recommendedTour.pricingInfo?.fromPrice || 
                                  recommendedTour.pricing?.fromPrice || 
                                  recommendedTour.price || 
                                  null;

          return (
            <Card key={recommendedTourId || index} className="bg-white overflow-hidden hover:shadow-lg transition-all duration-300 hover:-translate-y-1 flex flex-col">
              <Link href={recommendedTourUrl} prefetch={true}>
                <div className="relative h-48 bg-gray-200 flex-shrink-0 cursor-pointer">
                {recommendedImage ? (
                  <img
                    src={recommendedImage}
                    alt={recommendedTour.title}
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gray-200">
                    <MapPin className="w-8 h-8 text-gray-400" />
                  </div>
                )}
                </div>
              </Link>
              
              <CardContent className="p-4 flex-1 flex flex-col">
                <Link href={recommendedTourUrl} prefetch={true}>
                  <h3 className="font-semibold text-gray-800 mb-2 line-clamp-2 flex-1 cursor-pointer hover:text-purple-600 transition-colors">
                    {recommendedTour.title}
                  </h3>
                </Link>
                
                {recommendedRating > 0 && (
                  <div className="flex items-center mb-2">
                    <Star className="w-4 h-4 text-yellow-400 fill-current" />
                    <span className="font-medium text-gray-700 ml-1 text-sm">
                      {recommendedRating.toFixed(1)}
                    </span>
                    <span className="text-gray-500 text-xs ml-1">
                      ({recommendedReviewCount.toLocaleString('en-US')})
                    </span>
                  </div>
                )}

                {recommendedPrice && recommendedPrice > 0 && (
                  <div className="text-lg font-bold text-orange-600 mb-3">
                    From ${recommendedPrice.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </div>
                )}

                <Button
                  asChild
                  variant="outline"
                  size="sm"
                  className="w-full mt-auto border-purple-300 text-purple-700 hover:bg-purple-50"
                >
                  <Link href={recommendedTourUrl} prefetch={true}>
                    View Details
                  </Link>
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </motion.section>
  );
}
