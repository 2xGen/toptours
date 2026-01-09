"use client";
import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { ArrowRight, BookOpen, Clock } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { travelGuides } from '@/data/travelGuidesData';

const TravelGuidesPreview = () => {
  // Get 3 featured travel guides
  const featuredGuides = travelGuides
    .filter(guide => guide.featured)
    .slice(0, 3);

  if (featuredGuides.length === 0) {
    return null;
  }

  return (
    <section className="py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <div className="inline-flex items-center gap-2 bg-purple-100 rounded-full px-4 py-2 mb-4">
            <BookOpen className="w-5 h-5 text-purple-600" />
            <span className="text-sm font-semibold text-purple-700">Travel Guides</span>
          </div>
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Latest Travel Guides & Tips
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Discover expert travel advice, destination guides, and insider tips to make your next trip unforgettable
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {featuredGuides.map((guide, index) => (
            <motion.div
              key={guide.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              viewport={{ once: true }}
            >
              <Card className="h-full overflow-hidden hover:shadow-xl transition-all duration-300 border border-gray-200 hover:border-purple-300 group">
                <div className="relative h-48 w-full overflow-hidden">
                  {guide.image ? (
                    <Image
                      src={guide.image}
                      alt={guide.title}
                      fill
                      className="object-cover group-hover:scale-110 transition-transform duration-500"
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                      loading="lazy"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-purple-400 to-pink-400 flex items-center justify-center">
                      <BookOpen className="w-16 h-16 text-white/50" />
                    </div>
                  )}
                  <div className="absolute top-4 left-4">
                    {guide.category && (
                      <span className="bg-white/90 backdrop-blur-sm rounded-full px-3 py-1 text-xs font-semibold text-gray-800">
                        {guide.category}
                      </span>
                    )}
                  </div>
                </div>
                <CardContent className="p-6">
                  <h3 className="text-xl font-bold text-gray-900 mb-2 line-clamp-2">
                    {guide.title}
                  </h3>
                  <p className="text-gray-600 mb-4 line-clamp-3">
                    {guide.excerpt}
                  </p>
                  <div className="flex items-center justify-between">
                    {guide.readTime && (
                      <div className="flex items-center gap-1 text-sm text-gray-500">
                        <Clock className="w-4 h-4" />
                        <span>{guide.readTime}</span>
                      </div>
                    )}
                    <Link
                      href={`/travel-guides/${guide.id}`}
                      className="text-purple-600 hover:text-purple-700 font-semibold flex items-center gap-1 group-hover:gap-2 transition-all"
                    >
                      Read Guide
                      <ArrowRight className="w-4 h-4" />
                    </Link>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          viewport={{ once: true }}
          className="text-center mt-12"
        >
          <Link href="/travel-guides">
            <button className="px-8 py-3 bg-purple-600 hover:bg-purple-700 text-white font-semibold rounded-lg transition-colors inline-flex items-center gap-2">
              View All Travel Guides
              <ArrowRight className="w-5 h-5" />
            </button>
          </Link>
        </motion.div>
      </div>
    </section>
  );
};

export default TravelGuidesPreview;
