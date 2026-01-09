"use client";
import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowRight, UserPlus, Ticket, UtensilsCrossed, Crown, TrendingUp, BarChart3 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

const PartnerWithUs = () => {
  const benefits = [
    {
      icon: Crown,
      title: 'Reach a Global Audience',
      description: 'Connect with travelers actively searching for tours and restaurants. Our platform reaches a global audience across 3,300+ destinations worldwide.'
    },
    {
      icon: BarChart3,
      title: 'Build Trust & Credibility',
      description: 'Leverage our platform\'s reputation and aggregated reviews to showcase your quality and build trust with potential customers before they even visit your site.'
    },
    {
      icon: TrendingUp,
      title: 'Grow Your Business',
      description: 'Join a fast-growing platform that helps partners increase bookings and revenue through enhanced visibility, better SEO, and access to a qualified travel audience.'
    },
  ];

  const partnerTypes = [
    {
      icon: Ticket,
      title: 'Tour Operators',
      description: 'Increase visibility for your tours and activities. Get premium placement, aggregated reviews, and tools to showcase your offerings.',
      link: '/partners/tour-operators',
      cta: 'Become a Tour Operator Partner'
    },
    {
      icon: UtensilsCrossed,
      title: 'Restaurants',
      description: 'Get premium visibility for your restaurant. Enhanced search placement, premium badges, and drive more traffic to your establishment.',
      link: '/partners/restaurants',
      cta: 'Become a Restaurant Partner'
    }
  ];

  return (
    <section className="py-20 bg-gradient-to-b from-purple-50 to-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Partner with TopTours.ai
          </h2>
          <p className="text-xl md:text-2xl text-gray-600 max-w-3xl mx-auto">
            Join tour operators and restaurants looking to grow their business. Get premium visibility across 3,300+ destinations worldwide and reach millions of travelers.
          </p>
        </motion.div>

        {/* Partner Types */}
        <div className="grid md:grid-cols-2 gap-8 mb-16 max-w-5xl mx-auto">
          {partnerTypes.map((partner, index) => {
            const Icon = partner.icon;
            // Tour Operators: amber/orange, Restaurants: purple/indigo
            const isTourOperator = partner.title === 'Tour Operators';
            const iconGradient = isTourOperator 
              ? 'from-amber-500 to-orange-500' 
              : 'from-purple-500 to-indigo-500';
            const borderColor = isTourOperator 
              ? 'border-amber-200' 
              : 'border-purple-200';
            const bgColor = isTourOperator 
              ? 'bg-amber-50' 
              : 'bg-purple-50';
            
            return (
              <motion.div
                key={partner.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
              >
                <Card className={`h-full shadow-xl border-2 ${borderColor} hover:shadow-2xl transition-all duration-300`}>
                  <CardContent className="p-8">
                    <div className="flex items-center gap-3 mb-6">
                      <div className={`w-12 h-12 bg-gradient-to-br ${iconGradient} rounded-xl flex items-center justify-center shadow-lg`}>
                        <Icon className="w-6 h-6 text-white" />
                      </div>
                      <h3 className="text-2xl font-bold text-gray-900">{partner.title}</h3>
                    </div>
                    
                    <p className="text-gray-700 mb-6 leading-relaxed">
                      {partner.description}
                    </p>
                    
                    <Button
                      asChild
                      size="lg"
                      className="w-full sunset-gradient text-white font-semibold shadow-lg hover:shadow-xl transition-all"
                    >
                      <Link href={partner.link}>
                        {partner.cta}
                        <ArrowRight className="ml-2 w-5 h-5" />
                      </Link>
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>

        {/* Partner Benefits */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          viewport={{ once: true }}
          className="mb-6 max-w-4xl mx-auto"
        >
          <h3 className="text-3xl font-bold text-gray-900 mb-8 text-center">
            Why Partner with Us?
          </h3>
          <div className="grid md:grid-cols-3 gap-6">
            {benefits.map((benefit, index) => {
              const Icon = benefit.icon;
              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  viewport={{ once: true }}
                >
                  <Card className="h-full border-2 border-gray-100 hover:border-purple-300 transition-colors shadow-sm">
                    <CardContent className="p-6">
                      <div className="flex items-start gap-4">
                        <div className="flex-shrink-0 w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                          <Icon className="w-6 h-6 text-purple-600" />
                        </div>
                        <div>
                          <h4 className="font-bold text-gray-900 mb-2">{benefit.title}</h4>
                          <p className="text-sm text-gray-600 leading-relaxed">{benefit.description}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default PartnerWithUs;
