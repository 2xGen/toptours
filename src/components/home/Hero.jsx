import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Search, MapPin, Sparkles, Globe, Heart } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from '@/components/ui/use-toast';
import AnimatedHeroBackground from './AnimatedHeroBackground';
import SmartTourFinder from './SmartTourFinder';

const Hero = ({ onOpenModal }) => {
  const [destination, setDestination] = useState('');
  const navigate = useNavigate();

  const handleSearch = () => {
    if (!destination.trim()) {
      toast({
        title: "Please enter a destination",
        description: "Enter a destination to search for amazing tours and activities."
      });
      return;
    }
    
    // Navigate to results page with search term
    navigate(`/results?searchTerm=${encodeURIComponent(destination.trim())}`);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-20">
      <div className="absolute inset-0 ocean-gradient"></div>
      <AnimatedHeroBackground />
      <div className="absolute inset-0 bg-black/20"></div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <motion.div
          initial={{ opacity: 0, y: 0 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="flex flex-col items-center justify-center min-h-[calc(100vh-5rem)]"
        >
          <h1 className="font-poppins font-bold text-white mb-6">
            <span className="block text-4xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl">AI Powered</span>
            <span className="block text-4xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl">Travel Planning</span>
            <span className="gradient-text block text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl">Tour Recommendations</span>
          </h1>
          
          <p className="text-xl md:text-2xl text-white/90 mb-8 max-w-3xl mx-auto">
            Discover and book the best tours and activities worldwide with smart recommendations tailored just for you.
          </p>
          
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.1 }}
            className="mb-8"
          >
            <Button 
              onClick={onOpenModal}
              className="sunset-gradient text-white font-semibold hover:scale-105 transition-transform duration-200 px-8 py-3 text-lg"
            >
              Start Planning
            </Button>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.15 }}
            className="flex flex-wrap justify-center gap-4 text-white/80 mb-8"
          >
            <div className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-yellow-400" />
              <span>Smart</span>
            </div>
            <div className="flex items-center gap-2">
              <Globe className="h-5 w-5 text-blue-400" />
              <span>Worldwide</span>
            </div>
            <div className="flex items-center gap-2">
              <Heart className="h-5 w-5 text-red-400" />
              <span>Personalized</span>
            </div>
          </motion.div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="max-w-2xl mx-auto"
        >
          <SmartTourFinder />
        </motion.div>
      </div>
    </section>
  );
};

export default Hero;