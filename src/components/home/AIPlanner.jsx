"use client";
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, Sparkles, Globe, Heart, ArrowLeft, MapPin } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { useRouter } from 'next/navigation';
import { interests } from '@/data/homeData';

const AIPlanner = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedInterest, setSelectedInterest] = useState(null);
  const [destination, setDestination] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showSearchModal, setShowSearchModal] = useState(false);
  const router = useRouter();

  const handleInterestSelect = (interestId) => {
    setSelectedInterest(interestId);
  };

  const handleNext = () => {
    if (currentStep === 1) {
      if (selectedInterest) {
        setCurrentStep(2);
      }
    } else if (currentStep === 2) {
      if (destination.trim()) {
        handleSearch();
      }
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSearch = () => {
    setIsLoading(true);
    
    // Get the interest name for the search
    const interest = interests.find(i => i.id === selectedInterest);
    let searchQuery = `${destination.trim()} ${interest?.name.toLowerCase()}`;
    
    // Navigate to results page with search term
    router.push(`/results?searchTerm=${encodeURIComponent(searchQuery)}`);
    
    setIsLoading(false);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleNext();
    }
  };

  const getStepTitle = () => {
    switch (currentStep) {
      case 1:
        return "What's Your Travel Style? 🎯";
      case 2:
        return "Where Are You Going? 🌍";
      default:
        return "What's Your Travel Style? 🎯";
    }
  };

  const getStepDescription = () => {
    switch (currentStep) {
      case 1:
        return "Choose the type of experience that excites you most";
      case 2:
        return "Tell us your dream destination";
      default:
        return "Choose the type of experience that excites you most";
    }
  };

  return (
    <section className="py-20 bg-gradient-to-br from-blue-50 via-white to-orange-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <div className="flex justify-center items-center gap-2 mb-4">
            <Sparkles className="h-8 w-8 text-orange-500" />
            <span className="text-orange-600 font-semibold text-lg">AI-POWERED</span>
            <Sparkles className="h-8 w-8 text-orange-500" />
          </div>
          <h2 className="text-4xl md:text-5xl font-poppins font-bold text-gray-800 mb-6">
            Discover Your Perfect Adventure
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-6">
            Tell us what excites you and watch our AI craft the ultimate travel experience. 
            From hidden gems to bucket-list adventures, we'll find exactly what you're looking for.
          </p>
          <div className="flex flex-wrap justify-center gap-6 text-gray-600">
            <div className="flex items-center gap-2">
              <Globe className="h-5 w-5 text-blue-500" />
              <span className="font-medium">Global Destinations</span>
            </div>
            <div className="flex items-center gap-2">
              <Heart className="h-5 w-5 text-red-500" />
              <span className="font-medium">Personalized Matches</span>
            </div>
            <div className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-orange-500" />
              <span className="font-medium">AI Curated</span>
            </div>
          </div>
        </motion.div>

        <div className="max-w-4xl mx-auto">
          <Card className="light-glass-effect border-0 shadow-2xl bg-white/80 backdrop-blur-sm">
            <CardHeader className="text-center">
              <CardTitle className="text-2xl font-poppins text-gray-800">
                {getStepTitle()}
              </CardTitle>
              <p className="text-gray-600 mt-2">{getStepDescription()}</p>
              
              {/* Progress Bar */}
              <div className="mt-6">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm text-gray-600">Step {currentStep} of 2</span>
                  <span className="text-sm text-gray-600">{Math.round((currentStep / 2) * 100)}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <motion.div
                    className="bg-orange-500 h-2 rounded-full"
                    initial={{ width: 0 }}
                    animate={{ width: `${(currentStep / 2) * 100}%` }}
                    transition={{ duration: 0.3 }}
                  />
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-8">
              <AnimatePresence mode="wait">
                {currentStep === 1 ? (
                  <motion.div
                    key="step1"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="space-y-6"
                  >
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {interests.map((interest) => (
                  <motion.div
                    key={interest.id}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Button
                            variant={selectedInterest === interest.id ? "default" : "outline"}
                      className={`w-full h-20 flex flex-col items-center justify-center gap-2 ${
                              selectedInterest === interest.id 
                                ? 'sunset-gradient text-white shadow-lg' 
                                : 'bg-white hover:bg-gray-50 border-2 hover:border-orange-300'
                      }`}
                            onClick={() => handleInterestSelect(interest.id)}
                    >
                      <span className="text-2xl">{interest.icon}</span>
                      <span className="text-sm font-medium">{interest.name}</span>
                    </Button>
                  </motion.div>
                ))}
              </div>
                  </motion.div>
                ) : currentStep === 2 ? (
                  <motion.div
                    key="step2"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="space-y-6"
                  >
                    <div className="text-center mb-6">
                      <p className="text-gray-600 mb-4">
                        Great choice! Now tell us where you want to experience{' '}
                        <span className="font-semibold text-orange-600">
                          {interests.find(i => i.id === selectedInterest)?.name.toLowerCase()}
                        </span>
                      </p>
                    </div>
                    
                    <div className="relative">
                      <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                      <Input
                        placeholder="e.g., Paris, Tokyo, New York, Bali..."
                        value={destination}
                        onChange={(e) => setDestination(e.target.value)}
                        onKeyPress={handleKeyPress}
                        className="pl-10 h-12 border-gray-300 focus:border-orange-500 focus:ring-orange-500 text-lg"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      {['Paris', 'Rome', 'Tokyo', 'New York', 'London', 'Barcelona'].map((city) => (
                        <Button
                          key={city}
                          variant="outline"
                          onClick={() => setDestination(city)}
                          className="h-10 border-gray-300 hover:border-orange-500 hover:bg-orange-50"
                        >
                          {city}
                        </Button>
                      ))}
                    </div>
                  </motion.div>
                ) : null}
              </AnimatePresence>

              {/* Navigation Buttons */}
              <div className="flex justify-between mt-8">
                <Button
                  variant="outline"
                  onClick={handleBack}
                  disabled={currentStep === 1}
                  className="border-gray-300 hover:border-orange-500 disabled:opacity-50"
                >
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back
                </Button>
                
                <Button 
                  onClick={handleNext}
                  className="px-10 py-4 sunset-gradient text-white font-semibold hover:scale-105 transition-transform duration-200 shadow-lg"
                  disabled={
                    (currentStep === 1 && !selectedInterest) ||
                    (currentStep === 2 && !destination.trim()) ||
                    isLoading
                  }
                >
                  {isLoading ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                      Finding Tours...
                    </>
                  ) : currentStep === 2 ? (
                    <>
                      <Sparkles className="mr-2 h-5 w-5" />
                      Find My Tours
                      <ArrowRight className="ml-2 h-5 w-5" />
                    </>
                  ) : (
                    <>
                      Continue
                  <ArrowRight className="ml-2 h-5 w-5" />
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
};

export default AIPlanner;