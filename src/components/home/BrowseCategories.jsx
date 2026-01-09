"use client";
import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { 
  Mountain, 
  UtensilsCrossed, 
  Camera, 
  Waves, 
  Plane, 
  Heart,
  Bike,
  Music,
  ArrowRight
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

const BrowseCategories = () => {
  // Link to destinations instead of non-functional category pages
  const categories = [
    {
      id: 'adventure',
      name: 'Adventure Tours',
      icon: Mountain,
      color: 'from-orange-500 to-red-500',
      description: 'Thrilling experiences',
      link: '/destinations',
    },
    {
      id: 'food',
      name: 'Food & Drink',
      icon: UtensilsCrossed,
      color: 'from-pink-500 to-rose-500',
      description: 'Culinary experiences',
      link: '/destinations',
    },
    {
      id: 'sightseeing',
      name: 'Sightseeing',
      icon: Camera,
      color: 'from-blue-500 to-cyan-500',
      description: 'Explore landmarks',
      link: '/destinations',
    },
    {
      id: 'water',
      name: 'Water Activities',
      icon: Waves,
      color: 'from-cyan-500 to-blue-500',
      description: 'Ocean & water fun',
      link: '/destinations',
    },
    {
      id: 'tours',
      name: 'Day Trips',
      icon: Plane,
      color: 'from-purple-500 to-indigo-500',
      description: 'Multi-day adventures',
      link: '/destinations',
    },
    {
      id: 'romantic',
      name: 'Romantic',
      icon: Heart,
      color: 'from-pink-500 to-purple-500',
      description: 'Couples experiences',
      link: '/destinations',
    },
    {
      id: 'sports',
      name: 'Sports & Outdoors',
      icon: Bike,
      color: 'from-green-500 to-emerald-500',
      description: 'Active adventures',
      link: '/destinations',
    },
    {
      id: 'culture',
      name: 'Culture & History',
      icon: Music,
      color: 'from-amber-500 to-orange-500',
      description: 'Cultural immersion',
      link: '/destinations',
    },
  ];

  return (
    <section className="py-16 bg-white" id="browse-categories">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Popular Tour Categories
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Explore tours and activities by type across 3,300+ destinations worldwide
          </p>
        </motion.div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
          {categories.map((category, index) => {
            const Icon = category.icon;
            return (
              <motion.div
                key={category.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: index * 0.05 }}
                viewport={{ once: true }}
              >
                <Link href={category.link}>
                  <Card className="h-full hover:shadow-lg transition-all duration-300 hover:scale-105 cursor-pointer border-2 hover:border-purple-300">
                    <CardContent className="p-6 text-center">
                      <div className={`w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br ${category.color} flex items-center justify-center shadow-lg`}>
                        <Icon className="w-8 h-8 text-white" />
                      </div>
                      <h3 className="font-bold text-gray-900 mb-1 text-sm md:text-base">
                        {category.name}
                      </h3>
                      <p className="text-xs text-gray-500">{category.description}</p>
                    </CardContent>
                  </Card>
                </Link>
              </motion.div>
            );
          })}
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.5 }}
          viewport={{ once: true }}
          className="text-center mt-8"
        >
          <Link
            href="/destinations"
            className="inline-flex items-center gap-2 text-purple-600 font-semibold hover:text-purple-700 transition-colors"
          >
            Explore All Destinations
            <ArrowRight className="w-4 h-4" />
          </Link>
        </motion.div>
      </div>
    </section>
  );
};

export default BrowseCategories;
