import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { MapPin, Trophy, ArrowRight, Flame, Star, Zap, Crown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { getTourUrl } from '@/utils/tourHelpers';

const FeaturedTours = ({ onOpenModal, topTours = [], topPromoters = [] }) => {
  // Always render the section, even if data is empty (for SEO and layout consistency)
  const hasTours = topTours && topTours.length > 0;
  const hasPromoters = topPromoters && topPromoters.length > 0;


  // Tier badge config
  const tierConfig = {
    explorer: { label: 'Free', color: 'bg-gray-100 text-gray-700', icon: Star },
    pro_booster: { label: 'Pro', color: 'bg-blue-100 text-blue-700', icon: Zap },
    pro_plus: { label: 'Pro+', color: 'bg-purple-100 text-purple-700', icon: Zap },
    enterprise: { label: 'Enterprise', color: 'bg-yellow-100 text-yellow-700', icon: Crown },
  };

  return (
    <section className="py-20 adventure-gradient" style={{ background: 'linear-gradient(135deg, #48dbfb 0%, #0abde3 100%)' }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-poppins font-bold text-white mb-6">
            Top Tours & Top Promoters
          </h2>
          <p className="text-xl text-white/90 max-w-3xl mx-auto">
            See which tours and restaurants are trending and who's leading the community in promoting amazing experiences.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {hasTours ? topTours.map((tour, index) => {
            let tourUrl = '#';
            try {
              if (tour.slug) {
                tourUrl = `/tours/${tour.productId}/${tour.slug}`;
              } else if (tour.productId && tour.title) {
                tourUrl = getTourUrl(tour.productId, tour.title);
              } else if (tour.productId) {
                tourUrl = `/tours/${tour.productId}`;
              }
            } catch (error) {
              console.error('Error generating tour URL:', error);
              tourUrl = tour.productId ? `/tours/${tour.productId}` : '#';
            }
            
            return (
              <motion.div
                key={tour.productId || index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: index * 0.1 }}
                viewport={{ once: true }}
                whileHover={{ y: -10 }}
              >
                <Card className="bg-white/95 backdrop-blur-sm border-0 shadow-xl overflow-hidden">
                  <div className="relative h-48 overflow-hidden">
                    {tour.image ? (
                      <img 
                        className="w-full h-full object-cover transition-transform duration-300 hover:scale-110" 
                        alt={tour.title}
                        src={tour.image} 
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-orange-100 to-yellow-100 flex items-center justify-center">
                        <Trophy className="w-12 h-12 text-orange-300" />
                      </div>
                    )}
                    <Badge className="absolute top-4 left-4 sunset-gradient text-white">
                      #{index + 1}
                    </Badge>
                  </div>
                  <CardContent className="p-6">
                    <h3 className="text-xl font-poppins font-semibold text-gray-800 mb-2 line-clamp-2">
                      {tour.title}
                    </h3>
                    <div className="flex items-center text-gray-600 mb-3">
                      <MapPin className="h-4 w-4 mr-1" />
                      <span className="text-sm">{tour.location}</span>
                    </div>
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-2">
                        <Trophy className="h-4 w-4 text-orange-600" />
                        <span className="text-sm font-semibold text-orange-600">
                          {tour.score.toLocaleString()} points
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center justify-end">
                      <Link
                        href={tourUrl}
                        className="sunset-gradient text-white px-4 py-2 rounded-full font-medium flex items-center gap-2 transition-transform duration-200 hover:scale-105"
                      >
                        View Tour
                        <ArrowRight className="w-4 h-4" />
                      </Link>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            );
          }) : (
            // Empty state when no tours available
            <div className="col-span-3 text-center py-12">
              <Trophy className="w-16 h-16 text-white/50 mx-auto mb-4" />
              <p className="text-white/80 text-lg">No tours on the leaderboard yet. Be the first to promote a tour!</p>
            </div>
          )}
        </div>

        {/* Top Promoters Section */}
        {topPromoters && topPromoters.length > 0 && (
          <div className="mt-12">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
              className="text-center mb-6"
            >
              <h3 className="text-2xl md:text-3xl font-poppins font-bold text-white mb-1">
                Top Promoters
              </h3>
              <p className="text-base text-white/80">
                Community members leading the way in promoting amazing tours
              </p>
            </motion.div>

            <div className="flex items-end justify-center gap-3 md:gap-4 max-w-4xl mx-auto">
              {topPromoters.length >= 3 ? (
                // Podium layout for top 3: 2nd (left), 1st (center), 3rd (right)
                [
                  topPromoters[1], // 2nd place - left
                  topPromoters[0], // 1st place - center
                  topPromoters[2], // 3rd place - right
                ].map((promoter, podiumIndex) => {
                  const actualIndex = podiumIndex === 0 ? 1 : podiumIndex === 1 ? 0 : 2;
                  const tier = promoter.tier || 'explorer';
                  const streakDays = promoter.streak_days || 0;
                  const tierInfo = tierConfig[tier] || tierConfig.explorer;
                  const TierIcon = tierInfo.icon;
                  const isFirst = actualIndex === 0;
                  const isSecond = actualIndex === 1;
                  const isThird = actualIndex === 2;

                  return (
                    <motion.div
                      key={promoter.user_id || actualIndex}
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.4, delay: podiumIndex * 0.1 }}
                      viewport={{ once: true }}
                      className={`flex-1 max-w-[240px] ${isFirst ? 'order-2 -mt-6' : isSecond ? 'order-1' : 'order-3'}`}
                    >
                      <Card className={`bg-white/95 backdrop-blur-sm border-0 shadow-xl overflow-hidden ${
                        isFirst ? 'shadow-2xl border-2 border-yellow-200' : ''
                      }`}>
                        <CardContent className={`${isFirst ? 'p-5' : 'p-4'}`}>
                          <div className="flex flex-col items-center text-center mb-3">
                            <Trophy className={`${isFirst ? 'w-10 h-10 mb-2' : 'w-7 h-7 mb-1.5'} flex-shrink-0 ${
                              isFirst ? 'text-yellow-500' :
                              isSecond ? 'text-gray-400' :
                              isThird ? 'text-orange-500' :
                              'text-gray-400'
                            }`} />
                            <h4 className={`${isFirst ? 'text-lg' : 'text-base'} font-poppins font-semibold text-gray-800 mb-1.5`}>
                              {promoter.display_name || 'Anonymous'}
                            </h4>
                            <div className="flex items-center justify-center gap-1.5 flex-wrap">
                              <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${tierInfo.color}`}>
                                <TierIcon className="w-3 h-3" />
                                {tierInfo.label}
                              </span>
                              {streakDays > 0 && (
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-orange-100 text-orange-700">
                                  <Flame className="w-3 h-3" />
                                  {streakDays}
                                </span>
                              )}
                            </div>
                          </div>
                          <div className="flex items-center justify-center pt-3 border-t border-gray-200">
                            <div className="flex items-center gap-2">
                              <Trophy className="h-4 w-4 text-orange-600" />
                              <span className="text-sm font-semibold text-gray-700">
                                {promoter.total_points_spent.toLocaleString()} points
                              </span>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  );
                })
              ) : (
                // Fallback to regular grid if less than 3 promoters
                topPromoters.map((promoter, index) => {
                  const tier = promoter.tier || 'explorer';
                  const streakDays = promoter.streak_days || 0;
                  const tierInfo = tierConfig[tier] || tierConfig.explorer;
                  const TierIcon = tierInfo.icon;

                  return (
                    <motion.div
                      key={promoter.user_id || index}
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.4, delay: index * 0.1 }}
                      viewport={{ once: true }}
                      className="flex-1"
                    >
                      <Card className="bg-white/95 backdrop-blur-sm border-0 shadow-xl overflow-hidden">
                        <CardContent className="p-6">
                          <div className="flex items-center gap-3 mb-4">
                            <Trophy className={`w-6 h-6 flex-shrink-0 ${
                              index === 0 ? 'text-yellow-500' :
                              index === 1 ? 'text-gray-400' :
                              index === 2 ? 'text-orange-500' :
                              'text-gray-400'
                            }`} />
                            <div className="flex-1">
                              <h4 className="text-lg font-poppins font-semibold text-gray-800">
                                {promoter.display_name || 'Anonymous'}
                              </h4>
                              <div className="flex items-center gap-2 mt-1">
                                <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${tierInfo.color}`}>
                                  <TierIcon className="w-3 h-3" />
                                  {tierInfo.label}
                                </span>
                                {streakDays > 0 && (
                                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-orange-100 text-orange-700">
                                    <Flame className="w-3 h-3" />
                                    {streakDays}
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                            <div className="flex items-center gap-2">
                              <Trophy className="h-4 w-4 text-orange-600" />
                              <span className="text-sm font-semibold text-gray-700">
                                {promoter.total_points_spent.toLocaleString()} points
                              </span>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  );
                })
              )}
            </div>
          </div>
        )}

        <div className="text-center mt-8">
          <Button 
            asChild
            variant="outline" 
            className="bg-white/20 border-white text-white hover:bg-white hover:text-gray-800 transition-all duration-200"
          >
            <Link href="/leaderboard?type=last_month">
              View Leaderboard
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
};

export default FeaturedTours;