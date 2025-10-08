"use client";
import { useState } from 'react';
import { motion } from 'framer-motion';
import { Search, Brain, MapPin, Star, ArrowRight, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import NavigationNext from '@/components/NavigationNext';
import FooterNext from '@/components/FooterNext';
import SmartTourFinder from '@/components/home/SmartTourFinder';

export default function HowItWorksPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleOpenModal = () => {
    setIsModalOpen(true);
  };

  const steps = [
    {
      icon: Search,
      title: 'Tell Us Your Preferences',
      description: 'Share your destination, travel dates, interests, and budget. Our smart form makes it quick and easy.',
      details: ['Choose your destination', 'Select travel dates (coming soon)', 'Pick your interests', 'Set your budget range (coming soon)']
    },
    {
      icon: Brain,
      title: 'AI Analyzes & Matches',
      description: 'Our advanced AI processes thousands of tours and activities to find perfect matches for your unique preferences.',
      details: ['AI analyzes your preferences', 'Matches with tour database', 'Considers reviews & ratings', 'Filters by availability']
    },
    {
      icon: MapPin,
      title: 'Get Personalized Recommendations',
      description: 'Receive curated tour suggestions with detailed information, reviews, and booking options.',
      details: ['Personalized tour list', 'Detailed descriptions', 'Real traveler reviews', 'Instant booking links']
    },
    {
      icon: Star,
      title: 'Book & Enjoy',
      description: 'Book directly through our trusted partners and enjoy amazing experiences with confidence.',
      details: ['Secure booking process', 'Best price guarantee', '24/7 customer support', 'Memorable experiences']
    }
  ];

  const benefits = [
    'Save hours of research time',
    'Discover hidden gems and local favorites',
    'Get personalized recommendations',
    'Access exclusive deals and discounts',
    'Read verified traveler reviews',
    'Book with confidence through trusted partners'
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
                How TopTours.ai Works
              </h1>
              <p className="text-xl text-white/90 max-w-3xl mx-auto">
                Discover how our AI-powered platform transforms the way you plan and book travel experiences.
              </p>
            </motion.div>
          </div>
        </section>

        {/* Steps Section */}
        <section className="py-20 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
              {steps.map((step, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: index % 2 === 0 ? -30 : 30 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.8, delay: index * 0.2 }}
                  viewport={{ once: true }}
                  className={`${index % 2 === 1 ? 'lg:order-2' : ''}`}
                >
                  <Card className="border-0 shadow-xl">
                    <CardContent className="p-8">
                      <div className="flex items-center mb-6">
                        <div className="w-16 h-16 sunset-gradient rounded-full flex items-center justify-center mr-4">
                          <step.icon className="h-8 w-8 text-white" />
                        </div>
                        <div>
                          <span className="text-sm font-semibold text-gray-500 uppercase tracking-wide">
                            Step {index + 1}
                          </span>
                          <h3 className="text-2xl font-poppins font-bold text-gray-800">
                            {step.title}
                          </h3>
                        </div>
                      </div>
                      <p className="text-gray-600 mb-6 text-lg">
                        {step.description}
                      </p>
                      <ul className="space-y-3">
                        {step.details.map((detail, detailIndex) => (
                          <li key={detailIndex} className="flex items-center">
                            <CheckCircle className="h-5 w-5 text-green-500 mr-3" />
                            <span className="text-gray-700">{detail}</span>
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Benefits Section */}
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
                Why Choose TopTours.ai?
              </h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                Experience the future of travel planning with our intelligent platform.
              </p>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {benefits.map((benefit, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: index * 0.1 }}
                  viewport={{ once: true }}
                  className="flex items-center p-6 bg-white rounded-lg shadow-md"
                >
                  <CheckCircle className="h-6 w-6 text-green-500 mr-4 flex-shrink-0" />
                  <span className="text-gray-800 font-medium">{benefit}</span>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 adventure-gradient">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
            >
              <h2 className="text-4xl md:text-5xl font-poppins font-bold text-white mb-6">
                Ready to Experience Smart Travel?
              </h2>
              <p className="text-xl text-white/90 mb-8 max-w-3xl mx-auto">
                Join thousands of travelers who have discovered their perfect adventures with TopTours.ai.
              </p>
              <Button 
                onClick={handleOpenModal}
                className="px-8 py-4 bg-white text-blue-600 font-semibold hover:bg-gray-100 hover:scale-105 transition-all duration-200"
              >
                Start Planning Your Trip
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
      />
    </>
  );
}
