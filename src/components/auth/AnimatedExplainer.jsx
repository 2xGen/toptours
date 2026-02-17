"use client";
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Globe, 
  TrendingUp, 
  Coins, 
  Sparkles, 
  Trophy, 
  Bookmark,
  ArrowRight,
  ArrowLeft,
  Play,
  Pause,
  Check
} from 'lucide-react';
import { Button } from '@/components/ui/button';

const steps = [
  {
    icon: Globe,
    title: 'Discover',
    description: 'Browse 300,000+ tours across 3,300+ destinations',
    color: 'from-blue-500 to-cyan-500',
    iconColor: 'text-blue-500',
    details: ['Explore worldwide destinations', 'Find amazing tours & activities', 'Read real traveler reviews']
  },
  {
    icon: TrendingUp,
    title: 'Boost',
    description: 'Give points to places you love and help them rise in rankings',
    color: 'from-orange-500 to-red-500',
    iconColor: 'text-orange-500',
    details: ['50 free points every day', 'Support your favorites', 'Make your voice heard']
  },
  {
    icon: Coins,
    title: 'Earn Points',
    description: 'Build your daily streak and earn more points to boost even more',
    color: 'from-yellow-500 to-amber-500',
    iconColor: 'text-yellow-500',
    details: ['Daily login streak rewards', 'Earn bonus points', 'Unlock achievements']
  },
  {
    icon: Sparkles,
    title: 'Shape Trends',
    description: 'Your boosts help determine what\'s trending in real-time',
    color: 'from-purple-500 to-pink-500',
    iconColor: 'text-purple-500',
    details: ['Influence what\'s popular', 'See trending now sections', 'Community-driven rankings']
  },
  {
    icon: Sparkles,
    title: 'AI Matching',
    description: 'Get 1 personalized AI match per day based on your preferences',
    color: 'from-indigo-500 to-purple-500',
    iconColor: 'text-indigo-500',
    details: ['Personalized recommendations', 'AI-powered suggestions', 'Discover hidden gems']
  },
  {
    icon: Trophy,
    title: 'Leaderboard',
    description: 'Compete and see your rank among top promoters worldwide',
    color: 'from-green-500 to-emerald-500',
    iconColor: 'text-green-500',
    details: ['Climb the rankings', 'See your impact', 'Compete globally']
  },
  {
    icon: Bookmark,
    title: 'Save & Explore',
    description: 'Save unlimited tours for your next adventure',
    color: 'from-teal-500 to-cyan-500',
    iconColor: 'text-teal-500',
    details: ['Save favorites', 'Plan your trips', 'Never lose a great find']
  }
];

export default function AnimatedExplainer({ autoPlay = true, onComplete }) {
  const [currentStep, setCurrentStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(autoPlay);
  const [hasStarted, setHasStarted] = useState(false);

  useEffect(() => {
    if (!isPlaying || !hasStarted) return;

    const interval = setInterval(() => {
      setCurrentStep((prev) => {
        if (prev >= steps.length - 1) {
          setIsPlaying(false);
          if (onComplete) onComplete();
          return prev;
        }
        return prev + 1;
      });
    }, 4000); // 4 seconds per step

    return () => clearInterval(interval);
  }, [isPlaying, hasStarted, onComplete]);

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
      setHasStarted(true);
      setIsPlaying(false);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
      setHasStarted(true);
      setIsPlaying(false);
    }
  };

  const handlePlayPause = () => {
    setIsPlaying(!isPlaying);
    setHasStarted(true);
  };

  const handleStepClick = (index) => {
    setCurrentStep(index);
    setHasStarted(true);
    setIsPlaying(false);
  };

  const currentStepData = steps[currentStep];
  const Icon = currentStepData.icon;

  return (
    <div className="w-full h-full flex flex-col">
      {/* Progress Dots */}
      <div className="flex justify-center gap-2 mb-6">
        {steps.map((_, index) => (
          <button
            key={index}
            onClick={() => handleStepClick(index)}
            className={`transition-all duration-300 rounded-full ${
              index === currentStep
                ? 'w-3 h-3 bg-yellow-300 shadow-lg'
                : index < currentStep
                ? 'w-3 h-3 bg-yellow-300/50'
                : 'w-2 h-2 bg-white/30'
            }`}
            aria-label={`Go to step ${index + 1}`}
          />
        ))}
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col items-center justify-center">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: -20 }}
            transition={{ duration: 0.5 }}
            className="text-center w-full"
          >
            {/* Icon with animated background */}
            <div className="mb-6 flex justify-center">
              <motion.div
                className={`relative w-24 h-24 rounded-full bg-gradient-to-br ${currentStepData.color} flex items-center justify-center shadow-xl border-2 border-white/30`}
                animate={{ 
                  scale: [1, 1.1, 1],
                  rotate: [0, 5, -5, 0]
                }}
                transition={{ 
                  duration: 2,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
              >
                <Icon className={`w-12 h-12 text-white drop-shadow-lg`} />
                <motion.div
                  className="absolute inset-0 rounded-full bg-white opacity-20"
                  animate={{ scale: [1, 1.5, 1], opacity: [0.2, 0, 0.2] }}
                  transition={{ duration: 2, repeat: Infinity }}
                />
              </motion.div>
            </div>

            {/* Title */}
            <motion.h3
              className="text-2xl font-bold text-white mb-3"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
            >
              {currentStepData.title}
            </motion.h3>

            {/* Description */}
            <motion.p
              className="text-white/90 mb-6 max-w-md mx-auto"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
            >
              {currentStepData.description}
            </motion.p>

            {/* Details List */}
            <motion.ul
              className="space-y-2 mb-6 text-left max-w-sm mx-auto"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
            >
              {currentStepData.details.map((detail, index) => (
                <motion.li
                  key={index}
                  className="flex items-center gap-2 text-sm text-white/90"
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.5 + index * 0.1 }}
                >
                  <Check className="w-4 h-4 text-yellow-300 flex-shrink-0" />
                  <span>{detail}</span>
                </motion.li>
              ))}
            </motion.ul>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Controls */}
      <div className="flex items-center justify-center gap-4 mt-6">
        <Button
          variant="outline"
          size="sm"
          onClick={handlePrevious}
          disabled={currentStep === 0}
          className="flex items-center gap-1 bg-white/10 backdrop-blur-sm border-white/30 text-white hover:bg-white/20"
        >
          <ArrowLeft className="w-4 h-4" />
          Previous
        </Button>

        <Button
          variant="outline"
          size="sm"
          onClick={handlePlayPause}
          className="flex items-center gap-1 bg-white/10 backdrop-blur-sm border-white/30 text-white hover:bg-white/20"
        >
          {isPlaying ? (
            <>
              <Pause className="w-4 h-4" />
              Pause
            </>
          ) : (
            <>
              <Play className="w-4 h-4" />
              Play
            </>
          )}
        </Button>

        <Button
          variant="outline"
          size="sm"
          onClick={handleNext}
          disabled={currentStep === steps.length - 1}
          className="flex items-center gap-1 bg-white/10 backdrop-blur-sm border-white/30 text-white hover:bg-white/20"
        >
          Next
          <ArrowRight className="w-4 h-4" />
        </Button>
      </div>

      {/* Step Counter */}
      <div className="text-center mt-4 text-sm text-white/80">
        Step {currentStep + 1} of {steps.length}
      </div>
    </div>
  );
}

