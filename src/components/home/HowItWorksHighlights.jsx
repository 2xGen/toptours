import React from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { Users, Brain, Trophy, ArrowRight, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';

const HowItWorksHighlights = () => {
  const highlights = [
    {
      icon: Users,
      title: 'Community-Driven',
      description: 'You decide which tours deserve the spotlight. Boost tours you love with daily points.',
      color: 'orange',
      gradient: 'from-orange-50 to-yellow-50',
      border: 'border-orange-200',
      iconBg: 'bg-orange-500'
    },
    {
      icon: Brain,
      title: 'AI-Powered Matching',
      description: 'Get personalized tour recommendations that actually fit your travel style with detailed match scores.',
      color: 'purple',
      gradient: 'from-purple-50 to-pink-50',
      border: 'border-purple-200',
      iconBg: 'bg-purple-500'
    },
    {
      icon: Trophy,
      title: 'Real-Time Rankings',
      description: 'See which tours are trending and climb the global leaderboard based on community preference.',
      color: 'yellow',
      gradient: 'from-yellow-50 to-orange-50',
      border: 'border-yellow-200',
      iconBg: 'bg-yellow-500'
    }
  ];

  return (
    <section className="py-16 bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <div className="inline-flex items-center gap-2 bg-white/80 backdrop-blur-sm rounded-full px-4 py-2 mb-4">
            <Sparkles className="w-4 h-4 text-purple-600" />
            <span className="text-sm font-semibold text-gray-700">How It Works</span>
          </div>
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            How TopTours.ai<span className="text-xs align-super">™</span> Works
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Discover tours that match your style through community-driven promotion and AI-powered matching.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-6 mb-8">
          {highlights.map((highlight, index) => {
            const Icon = highlight.icon;
            return (
              <motion.div
                key={highlight.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
              >
                <div className={`bg-gradient-to-br ${highlight.gradient} rounded-xl p-6 border-2 ${highlight.border} shadow-md hover:shadow-lg transition-all h-full`}>
                  <div className={`w-12 h-12 rounded-full ${highlight.iconBg} flex items-center justify-center mb-4`}>
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-3">
                    {highlight.title}
                  </h3>
                  <p className="text-gray-700 text-sm leading-relaxed">
                    {highlight.description}
                  </p>
                </div>
              </motion.div>
            );
          })}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          viewport={{ once: true }}
          className="text-center"
        >
          <Link href="/how-it-works">
            <Button className="sunset-gradient text-white font-bold px-8 py-6 text-lg shadow-lg hover:shadow-xl transition-all hover:scale-105">
              Learn More About How It Works
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
          </Link>
        </motion.div>
      </div>
    </section>
  );
};

export default HowItWorksHighlights;

