"use client";
import { useState } from 'react';
import { motion } from 'framer-motion';
import { Brain, Globe, Heart, Users, Award, Zap, ArrowRight } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import NavigationNext from '@/components/NavigationNext';
import FooterNext from '@/components/FooterNext';
import SmartTourFinder from '@/components/home/SmartTourFinder';

export default function AboutPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [preFilledDestination, setPreFilledDestination] = useState('');

  const handleOpenModal = () => {
    setPreFilledDestination(''); // No pre-filled destination for About page
    setIsModalOpen(true);
  };

  const values = [
    {
      icon: Brain,
      title: 'AI-Powered Intelligence',
      description: 'Our advanced algorithms analyze millions of data points to provide personalized recommendations.'
    },
    {
      icon: Globe,
      title: 'Global Reach',
      description: 'Access to tours and activities in over 150 countries worldwide, from popular destinations to hidden gems.'
    },
    {
      icon: Heart,
      title: 'Personalized Experience',
      description: 'Every recommendation is tailored to your unique preferences, interests, and travel style.'
    },
    {
      icon: Users,
      title: 'Trusted Community',
      description: 'Join thousands of satisfied travelers who have discovered amazing experiences through our platform.'
    },
    {
      icon: Award,
      title: 'Quality Assurance',
      description: 'All our partner tours are vetted for quality, safety, and authentic local experiences.'
    },
    {
      icon: Zap,
      title: 'Instant Results',
      description: 'Get personalized tour recommendations in seconds, not hours of manual research.'
    }
  ];

  const stats = [
    { number: '500K+', label: 'Happy Travelers' },
    { number: '150+', label: 'Countries Covered' },
    { number: '10K+', label: 'Curated Tours' },
    { number: '4.9', label: 'Average Rating' }
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
              <h1 className="text-4xl md:text-6xl font-poppins font-bold text-white mb-6">
                About TopTours.ai
              </h1>
              <p className="text-xl text-white/90 max-w-3xl mx-auto">
                We're revolutionizing travel planning with AI-powered recommendations that help you discover 
                the perfect tours and activities for your unique travel style.
              </p>
            </motion.div>
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
                  At TopTours.ai, we believe that every traveler deserves to discover experiences that perfectly 
                  match their interests, budget, and travel style. Our mission is to eliminate the overwhelming 
                  process of researching and booking tours by using artificial intelligence to provide personalized, 
                  curated recommendations.
                </p>
                <p className="text-lg text-gray-600">
                  We partner with trusted tour operators worldwide to ensure you have access to authentic, 
                  high-quality experiences that create lasting memories.
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
                Our core values drive everything we do, from product development to customer service.
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

            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
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
                  The inspiration behind TopTours.ai was the realization that most travel platforms overwhelm users with too many options and too little guidance. We wanted to fix that by using AI to help travelers make smarter, faster decisions—without sacrificing quality or personalization.
                </p>
                <p className="text-lg text-gray-600">
                  We're passionate about connecting people with meaningful travel experiences, and we're constantly evolving the platform to serve that mission.
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
                Join our community of travelers and discover your next amazing adventure with AI-powered recommendations.
              </p>
              <Button 
                onClick={handleOpenModal}
                className="px-8 py-4 bg-white text-blue-600 font-semibold hover:bg-gray-100 hover:scale-105 transition-all duration-200"
              >
                Start Planning Now
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </motion.div>
          </div>
        </section>

        <FooterNext />
      </div>

      <SmartTourFinder
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        preFilledDestination={preFilledDestination}
      />
    </>
  );
}
