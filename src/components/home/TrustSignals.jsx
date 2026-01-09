"use client";
import React from 'react';
import { motion } from 'framer-motion';
import { Ticket, UtensilsCrossed, BookOpen, Award } from 'lucide-react';

const TrustSignals = () => {
  const stats = [
    { icon: Ticket, label: 'Tours Available', value: '300,000+', description: 'Tours and activities' },
    { icon: Award, label: 'Destinations', value: '3,300+', description: 'Worldwide coverage' },
    { icon: UtensilsCrossed, label: 'Restaurants', value: '3,500+', description: 'Curated dining options' },
    { icon: BookOpen, label: 'Travel Guides', value: '19,000+', description: 'Destination insights' },
  ];


  return (
    <section className="py-10 bg-gray-50" id="trust-signals">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center mb-8"
        >
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3">
            Trusted by Travelers Worldwide
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Join thousands of travelers who have discovered their perfect tours and restaurants with TopTours.ai
          </p>
        </motion.div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="bg-white rounded-xl p-4 md:p-5 shadow-sm border border-gray-100 text-center hover:shadow-md transition-shadow"
              >
                <Icon className="w-7 h-7 md:w-8 md:h-8 text-purple-600 mx-auto mb-2" />
                <div className="text-2xl md:text-3xl font-bold text-gray-900 mb-1">{stat.value}</div>
                <div className="text-sm font-semibold text-gray-700 mb-1">{stat.label}</div>
                <div className="text-xs text-gray-500">{stat.description}</div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default TrustSignals;
