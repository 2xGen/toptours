"use client";
import { useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Brain, Globe, Heart, Users, Award, Zap, ArrowRight, Trophy, Sparkles } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import NavigationNext from '@/components/NavigationNext';
import FooterNext from '@/components/FooterNext';
import SmartTourFinder from '@/components/home/SmartTourFinder';

export default function AboutPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleOpenModal = () => {
    setIsModalOpen(true);
  };

  const values = [
    {
      icon: Users,
      title: 'Community-Driven Discovery',
      description: 'You decide which tours deserve the spotlight. Every day, travelers use their points to boost tours they love, creating real-time rankings based on actual community preference—not just algorithms.'
    },
    {
      icon: Brain,
      title: 'AI-Powered Matching',
      description: 'Get personalized tour recommendations that actually fit your style. Our AI analyzes your travel preferences and shows you detailed match scores (0-100%) with explanations of why a tour matches or doesn\'t.'
    },
    {
      icon: Trophy,
      title: 'Real-Time Rankings',
      description: 'See which tours are trending based on community boosts. Tours with the most points appear in "Trending Now" sections and climb the global leaderboard, giving you insight into what travelers actually love.'
    },
    {
      icon: Globe,
      title: '170+ Destinations',
      description: 'Access to thousands of tours and activities across 170+ destinations worldwide, from popular hotspots to hidden gems, all curated and community-validated.'
    },
    {
      icon: Heart,
      title: 'Personalized Experience',
      description: 'Fill out your travel preferences once—adventure level, travel style, budget comfort, group preference—and get matches forever with detailed breakdowns.'
    },
    {
      icon: Zap,
      title: 'Transparent & Fair',
      description: 'Tours rise to the top because travelers boost them, and you see exactly how well each tour matches your preferences with detailed match scores and explanations.'
    }
  ];

  const stats = [
    { number: '170+', label: 'Destinations Covered' },
    { number: '1050+', label: 'Guides Written' },
    { number: '300k+', label: 'Tours Available' }
  ];

  return (
    <>
      <NavigationNext onOpenModal={handleOpenModal} />
      
      <div className="min-h-screen" suppressHydrationWarning>
        {/* Hero Section */}
        <section className="pt-24 pb-16 ocean-gradient">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="text-center"
            >
              <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm rounded-full px-4 py-2 mb-6">
                <Sparkles className="w-4 h-4 text-white" />
                <span className="text-sm font-semibold text-white">The smarter way to discover tours</span>
              </div>
              <h1 className="text-4xl md:text-6xl font-poppins font-bold text-white mb-6">
                About TopTours.ai<span className="text-xs align-super">™</span>
              </h1>
              <p className="text-xl text-white/90 max-w-3xl mx-auto">
                We're revolutionizing tour booking by combining the power of community with cutting-edge AI. 
                The first platform where travelers decide which tours deserve the spotlight, and AI helps you 
                discover tours that actually match your style.
              </p>
            </motion.div>
          </div>
        </section>

        {/* Breadcrumb */}
        <section className="bg-white border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 sm:py-4">
            <nav className="flex items-center space-x-2 text-xs sm:text-sm">
              <Link href="/" className="text-gray-500 hover:text-gray-700">Home</Link>
              <span className="text-gray-400">/</span>
              <span className="text-gray-900 font-medium">About</span>
            </nav>
          </div>
        </section>

        {/* Mission Section */}
        <section className="py-20 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
              <motion.div
                initial={{ opacity: 0, x: -30 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8 }}
                viewport={{ once: true }}
              >
                <h2 className="text-4xl font-poppins font-bold text-gray-800 mb-6">
                  Our Mission
                </h2>
                <p className="text-lg text-gray-600 mb-6">
                  At TopTours.ai<span className="text-xs align-super">™</span>, we're pioneering a new way to discover and book tours. 
                  We've built something unique: a platform where the community decides which tours deserve visibility, 
                  and AI helps you find tours that actually fit your travel preferences. This combination creates a 
                  more personalized, transparent, and engaging experience for travelers.
                </p>
                <p className="text-lg text-gray-600 mb-6">
                  Our mission is to create the most personalized tour discovery experience ever built by combining 
                  real community preference with intelligent matching. Every day, travelers use their points to 
                  boost tours they love, creating real-time rankings based on actual community preference. Meanwhile, 
                  our AI analyzes your travel style to show you tours with detailed match scores, so you know exactly 
                  why a tour fits you perfectly.
                </p>
                <p className="text-lg text-gray-600">
                  We partner with trusted tour operators worldwide to ensure you have access to authentic, 
                  high-quality experiences. But more importantly, we give you the power to shape which tours 
                  get discovered—and the intelligence to find the ones that match you perfectly.
                </p>
              </motion.div>
              <motion.div
                initial={{ opacity: 0, x: 30 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8 }}
                viewport={{ once: true }}
              >
                <img  
                  className="w-full h-96 object-cover rounded-lg shadow-xl" 
                  alt="Team collaboration and travel planning"
                  src="https://images.unsplash.com/flagged/photo-1564445477052-8a3787406bbf" 
                />
              </motion.div>
            </div>
          </div>
        </section>

        {/* Values Section */}
        <section className="py-20 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
              className="text-center mb-16"
            >
              <h2 className="text-4xl md:text-5xl font-poppins font-bold text-gray-800 mb-6">
                What Makes Us Different
              </h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                We're the first platform to combine community-driven promotion with AI-powered matching. 
                This unique approach creates a more transparent, personalized, and fair way to discover tours.
              </p>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {values.map((value, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: index * 0.1 }}
                  viewport={{ once: true }}
                >
                  <Card className="bg-white border-0 shadow-lg h-full hover:shadow-xl transition-shadow duration-300">
                    <CardContent className="p-8 text-center">
                      <div className="w-16 h-16 sunset-gradient rounded-full flex items-center justify-center mx-auto mb-6">
                        <value.icon className="h-8 w-8 text-white" />
                      </div>
                      <h3 className="text-xl font-poppins font-semibold text-gray-800 mb-4">
                        {value.title}
                      </h3>
                      <p className="text-gray-600">
                        {value.description}
                      </p>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Stats Section */}
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
                Our Impact in Numbers
              </h2>
              <p className="text-xl text-white/90 max-w-3xl mx-auto">
                See how we're helping travelers worldwide discover amazing experiences.
              </p>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {stats.map((stat, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, scale: 0.8 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.8, delay: index * 0.1 }}
                  viewport={{ once: true }}
                  className="text-center"
                >
                  <div className="text-4xl md:text-5xl font-poppins font-bold text-white mb-2">
                    {stat.number}
                  </div>
                  <div className="text-white/90 font-medium">
                    {stat.label}
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Why We Built This Section */}
        <section className="py-20 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
              <motion.div
                initial={{ opacity: 0, x: -30 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8 }}
                viewport={{ once: true }}
              >
                <img  
                  className="w-full h-96 object-cover rounded-lg shadow-xl" 
                  alt="Travel inspiration and innovation"
                  src="https://images.unsplash.com/photo-1488646953014-85cb44e25828?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80" 
                />
              </motion.div>
              <motion.div
                initial={{ opacity: 0, x: 30 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8 }}
                viewport={{ once: true }}
              >
                <h2 className="text-4xl font-poppins font-bold text-gray-800 mb-6">
                  Why We Built This
                </h2>
                <p className="text-lg text-gray-600 mb-6">
                  The inspiration behind TopTours.ai<span className="text-xs align-super">™</span> came from a simple question: 
                  What if travelers could shape which tours get discovered, while AI helps them find tours that perfectly 
                  match their style? We saw an opportunity to create something entirely new—a platform that combines the 
                  collective wisdom of the community with intelligent, personalized matching.
                </p>
                <p className="text-lg text-gray-600 mb-6">
                  We realized that the best way to discover great tours is by combining the power of community preference 
                  with the intelligence of AI. When travelers can boost tours they love, the best experiences naturally rise 
                  to the top based on real preference. When AI analyzes your travel style and shows you detailed match 
                  scores, you can make confident decisions with full transparency about why a tour fits you.
                </p>
                <p className="text-lg text-gray-600">
                  This combination of community-driven promotion and AI-powered matching creates something entirely new: 
                  a transparent, fair, and personalized way to discover tours. We're passionate about giving travelers 
                  the power to shape which tours get discovered—and the intelligence to find the ones that match them 
                  perfectly. That's how we're changing tour booking, one boost and one match at a time.
                </p>
              </motion.div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 cta-gradient">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
            >
              <h2 className="text-4xl md:text-5xl font-poppins font-bold text-white mb-6">
                Ready to Start Your Journey?
              </h2>
              <p className="text-xl text-white/90 mb-8 max-w-3xl mx-auto">
                Join our community of travelers and discover your next amazing adventure. Boost tours you love, 
                get AI-powered matches that fit your style, and be part of how tour discovery works.
              </p>
              <Button 
                asChild
                className="px-8 py-4 bg-white text-blue-600 font-semibold hover:bg-gray-100 hover:scale-105 transition-all duration-200"
              >
                <Link href="/destinations">
                  Start Planning Now
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
            </motion.div>
          </div>
        </section>

        <FooterNext />
      </div>

      <SmartTourFinder
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </>
  );
}
