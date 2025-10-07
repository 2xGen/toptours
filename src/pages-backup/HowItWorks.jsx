import React from 'react';
import { motion } from 'framer-motion';
import { Helmet } from 'react-helmet';
import { Search, Brain, MapPin, Star, ArrowRight, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import BlueCTASection from '@/components/ui/blue-cta-section';

const HowItWorks = ({ onOpenModal }) => {
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

  const structuredData = {
    "@context": "https://schema.org",
    "@type": "HowTo",
    "name": "How TopTours.ai Works - AI-Powered Travel Planning",
    "description": "Learn how TopTours.ai uses artificial intelligence to provide personalized tour and activity recommendations for your next trip.",
    "step": [
      {
        "@type": "HowToStep",
        "name": "Enter Destination",
        "text": "Tell us where you want to go and your travel dates"
      },
      {
        "@type": "HowToStep", 
        "name": "AI Analysis",
        "text": "Our AI analyzes your preferences and available options"
      },
      {
        "@type": "HowToStep",
        "name": "Get Recommendations", 
        "text": "Receive personalized tour recommendations"
      },
      {
        "@type": "HowToStep",
        "name": "Book Confidently",
        "text": "Secure your booking through our trusted partners"
      }
    ],
    "totalTime": "PT5M",
    "estimatedCost": {
      "@type": "MonetaryAmount",
      "currency": "USD",
      "value": "0"
    }
  };

  return (
    <>
      <Helmet>
        <title>How TopTours.ai Works - AI-Powered Travel Planning Process</title>
        <meta name="description" content="Discover how TopTours.ai uses artificial intelligence to provide personalized tour recommendations. Our 4-step process makes travel planning effortless and smart." />
        <meta name="keywords" content="how TopTours.ai works, AI travel planning, tour booking process, personalized travel recommendations, smart travel planning" />
        <link rel="canonical" href="https://toptours.ai/how-it-works" />
        
        {/* Open Graph */}
        <meta property="og:title" content="How TopTours.ai Works - AI-Powered Travel Planning Process" />
        <meta property="og:description" content="Discover how TopTours.ai uses artificial intelligence to provide personalized tour recommendations. Our 4-step process makes travel planning effortless and smart." />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://toptours.ai/how-it-works" />
        <meta property="og:image" content="https://ouqeoizufbofdqbuiwvx.supabase.co/storage/v1/object/public/destinations//TopTours-Featured_image.jpg" />
        <meta property="og:site_name" content="TopTours.ai" />
        
        {/* Twitter Card */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="How TopTours.ai Works - AI-Powered Travel Planning Process" />
        <meta name="twitter:description" content="Discover how TopTours.ai uses artificial intelligence to provide personalized tour recommendations." />
        <meta name="twitter:image" content="https://toptours.ai/og-image.jpg" />
        
        {/* Structured Data */}
        <script type="application/ld+json">
          {JSON.stringify(structuredData)}
        </script>
      </Helmet>
      
      <div className="min-h-screen">
        <Navigation onOpenModal={onOpenModal} />
      
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
        <BlueCTASection 
          onOpenModal={onOpenModal} 
          gradientClass="adventure-gradient"
        />

      <Footer />
    </div>
    </>
  );
};

export default HowItWorks;
