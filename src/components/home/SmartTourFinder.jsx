import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, MapPin, Sparkles, ArrowLeft, ArrowRight, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from '@/components/ui/use-toast';

const SmartTourFinder = ({ isOpen, onClose, preFilledDestination = '' }) => {
  const [step, setStep] = useState(1);
  const [destination, setDestination] = useState('');
  const [userInterests, setUserInterests] = useState('');
  const [surpriseMe, setSurpriseMe] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const modalRef = useRef(null);

  // Reset form when modal opens/closes
  useEffect(() => {
    if (isOpen) {
      setStep(1);
      setDestination(preFilledDestination);
      setUserInterests('');
      setSurpriseMe(false);
    }
  }, [isOpen, preFilledDestination]);

  // Close modal when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (modalRef.current && !modalRef.current.contains(event.target)) {
        handleClose();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  const handleClose = () => {
    onClose();
    setStep(1);
    setDestination('');
    setUserInterests('');
    setSurpriseMe(false);
  };

  const handleNext = () => {
    if (step === 1 && !destination.trim()) {
      toast({
        title: "Please enter a destination",
        description: "Where would you like to explore?"
      });
      return;
    }
    
    if (step === 1) {
      setStep(2);
    } else if (step === 2) {
      handleSearch();
    }
  };

  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  };

  const handleSearch = () => {
    setIsLoading(true);
    
    // Build base search query (without filters)
    let searchQuery = destination.trim();
    
    if (!surpriseMe && userInterests.trim()) {
      searchQuery += ` ${userInterests.trim()}`;
    }

    // Navigate to results page
    const url = `/results?searchTerm=${encodeURIComponent(searchQuery)}`;
    navigate(url);
    
    setIsLoading(false);
    handleClose();
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleNext();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        className="bg-white rounded-2xl max-w-md w-full shadow-2xl"
        ref={modalRef}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-bold text-gray-800">Plan Your Trip</h2>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="h-5 w-5" />
          </Button>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Progress Bar */}
          <div className="mb-6">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm text-gray-600">Step {step} of 2</span>
              <span className="text-sm text-gray-600">{Math.round((step / 2) * 100)}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <motion.div
                className="bg-orange-500 h-2 rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${(step / 2) * 100}%` }}
                transition={{ duration: 0.3 }}
              />
            </div>
          </div>

          <AnimatePresence mode="wait">
            {step === 1 ? (
              <motion.div
                key="step1"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <div className="text-center">
                  <h3 className="text-lg font-semibold text-gray-800 mb-2">
                    {preFilledDestination ? `Planning your trip to ${preFilledDestination}?` : 'Where do you want to explore?'}
                  </h3>
                  <p className="text-gray-600">
                    {preFilledDestination ? 'Tell us what you want to see and do' : 'Tell us your dream destination'}
                  </p>
                </div>
                
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                  <Input
                    placeholder="e.g., Paris, Tokyo, New York..."
                    value={destination}
                    onChange={(e) => setDestination(e.target.value)}
                    onKeyPress={handleKeyPress}
                    className="pl-10 h-12 border-gray-300 focus:border-orange-500 focus:ring-orange-500"
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
            ) : step === 2 ? (
              <motion.div
                key="step2"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <div className="text-center">
                  <h3 className="text-lg font-semibold text-gray-800 mb-2">What do you want to see in {destination}?</h3>
                  <p className="text-gray-600">
                    {preFilledDestination ? 'Tell us your interests or let us surprise you with the best experiences' : 'Tell us your interests or let us surprise you'}
                  </p>
                </div>
                
                <div className="space-y-4">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                    <Input
                      placeholder="e.g., food tours, museums, adventure activities..."
                      value={userInterests}
                      onChange={(e) => setUserInterests(e.target.value)}
                      onKeyPress={handleKeyPress}
                      disabled={surpriseMe}
                      className="pl-10 h-12 border-gray-300 focus:border-orange-500 focus:ring-orange-500 disabled:opacity-50"
                    />
                  </div>

                  <div className="flex items-center space-x-3">
                    <input
                      type="checkbox"
                      id="surpriseMe"
                      checked={surpriseMe}
                      onChange={(e) => {
                        setSurpriseMe(e.target.checked);
                        if (e.target.checked) {
                          setUserInterests('');
                        }
                      }}
                      className="w-4 h-4 text-orange-600 bg-gray-100 border-gray-300 rounded focus:ring-orange-500"
                    />
                    <label htmlFor="surpriseMe" className="text-gray-700 font-medium">
                      🎉 Surprise me with the best tours in {destination}!
                    </label>
                  </div>
                </div>
              </motion.div>
            ) : null}
          </AnimatePresence>

          {/* Navigation Buttons */}
          <div className="flex justify-between mt-8">
            <Button
              variant="outline"
              onClick={handleBack}
              disabled={step === 1}
              className="border-gray-300 hover:border-orange-500 disabled:opacity-50"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>

            <Button
              onClick={handleNext}
              disabled={isLoading}
              className="sunset-gradient text-white font-semibold hover:scale-105 transition-transform duration-200 disabled:opacity-50"
            >
              {isLoading ? (
                <div className="flex items-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Searching...
                </div>
              ) : step === 2 ? (
                <>
                  <Search className="h-4 w-4 mr-2" />
                  Find Tours
                </>
              ) : (
                <>
                  Next
                  <ArrowRight className="h-4 w-4 ml-2" />
                </>
              )}
            </Button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default SmartTourFinder; 