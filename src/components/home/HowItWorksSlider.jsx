"use client";
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Users, 
  Brain, 
  Trophy, 
  TrendingUp, 
  Eye, 
  Zap,
  ArrowRight,
  ArrowLeft,
  Play,
  Pause,
  Sparkles
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

const steps = [
  {
    icon: Users,
    title: 'Community-Driven',
    description: 'You decide which tours and restaurants deserve the spotlight. Boost listings you love with daily points. The most-boosted rise to the top, appearing in "Trending Now" sections across destination pages.',
    color: 'from-orange-500 to-yellow-500',
    iconColor: 'text-orange-500',
    bgGradient: 'from-orange-50 to-yellow-50',
    borderColor: 'border-orange-200',
    details: ['You control what\'s trending', 'Boost with daily points', 'Real-time community rankings']
  },
  {
    icon: Brain,
    title: 'AI-Powered Matching',
    description: 'Get personalized tour and restaurant recommendations that actually fit your travel style. See 0-100% match scores with detailed breakdowns explaining why listings match (or don\'t).',
    color: 'from-purple-500 to-pink-500',
    iconColor: 'text-purple-500',
    bgGradient: 'from-purple-50 to-pink-50',
    borderColor: 'border-purple-200',
    details: ['Personalized recommendations', '0-100% match scores', 'Detailed breakdowns']
  },
  {
    icon: Trophy,
    title: 'Real-Time Rankings',
    description: 'See which tours and restaurants are trending right now. Climb the global leaderboard based on community preference. Rankings update in real-time as travelers boost their favorites.',
    color: 'from-yellow-500 to-orange-500',
    iconColor: 'text-yellow-500',
    bgGradient: 'from-yellow-50 to-orange-50',
    borderColor: 'border-yellow-200',
    details: ['Real-time updates', 'Global leaderboard', 'Community-driven rankings']
  },
  {
    icon: TrendingUp,
    title: 'Featured in "Trending Now"',
    description: 'Boosted tours and restaurants appear prominently in "Trending Now" sections on destination pages — the first thing travelers see.',
    color: 'from-orange-500 to-red-500',
    iconColor: 'text-orange-500',
    bgGradient: 'from-orange-50 to-yellow-50',
    borderColor: 'border-orange-200',
    details: ['Prominent placement', 'First thing travelers see', 'High visibility']
  },
  {
    icon: Eye,
    title: 'Massive Visibility',
    description: 'Get featured across destination pages, tour listing pages, and restaurant pages. Thousands of travelers see your promoted listings daily.',
    color: 'from-blue-500 to-indigo-500',
    iconColor: 'text-blue-500',
    bgGradient: 'from-blue-50 to-indigo-50',
    borderColor: 'border-blue-200',
    details: ['Multiple page placements', 'Thousands of daily views', 'Maximum exposure']
  },
  {
    icon: Trophy,
    title: 'Climb the Leaderboard',
    description: 'Compete for top rankings on the global leaderboard. Higher scores mean more visibility and more bookings.',
    color: 'from-green-500 to-emerald-500',
    iconColor: 'text-green-500',
    bgGradient: 'from-green-50 to-emerald-50',
    borderColor: 'border-green-200',
    details: ['Compete globally', 'Higher visibility', 'More bookings']
  },
  {
    icon: Zap,
    title: 'Community-Driven Promotion',
    description: 'Real travelers boost what they love. Listings rise based on actual community preference, not algorithms.',
    color: 'from-purple-500 to-pink-500',
    iconColor: 'text-purple-500',
    bgGradient: 'from-purple-50 to-pink-50',
    borderColor: 'border-purple-200',
    details: ['Real traveler preferences', 'No algorithms', 'Authentic rankings']
  }
];

export default function HowItWorksSlider() {
  const [currentStep, setCurrentStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [hasStarted, setHasStarted] = useState(false);

  useEffect(() => {
    if (!isPlaying || !hasStarted) return;

    const interval = setInterval(() => {
      setCurrentStep((prev) => {
        if (prev >= steps.length - 1) {
          setIsPlaying(false);
          return prev;
        }
        return prev + 1;
      });
    }, 4000); // 4 seconds per step

    return () => clearInterval(interval);
  }, [isPlaying, hasStarted]);

  const handleNext = () => {
    setCurrentStep((prev) => (prev >= steps.length - 1 ? 0 : prev + 1));
    setHasStarted(true);
  };

  const handlePrevious = () => {
    setCurrentStep((prev) => (prev <= 0 ? steps.length - 1 : prev - 1));
    setHasStarted(true);
  };

  const handlePlayPause = () => {
    setIsPlaying(!isPlaying);
    setHasStarted(true);
  };

  const goToStep = (index) => {
    setCurrentStep(index);
    setHasStarted(true);
  };

  const currentStepData = steps[currentStep];
  const Icon = currentStepData.icon;

  return (
    <section className="py-20 bg-gradient-to-br from-purple-50 via-blue-50 to-orange-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
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
            The first platform where <strong>you control what's trending</strong>. Boost tours and restaurants you love, get AI recommendations that match your style, and see real-time rankings based on community preference — not algorithms.
          </p>
        </motion.div>

        {/* Slider Container */}
        <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl border-2 border-white/50 overflow-hidden">
          <div className="relative bg-gradient-to-br from-white via-purple-50/30 to-blue-50/30 p-4 sm:p-6 md:p-8 lg:p-12">
            {/* Step Content */}
            <div className="min-h-[300px] sm:min-h-[350px] md:min-h-[400px] flex flex-col items-center justify-center">
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentStep}
                  initial={{ opacity: 0, x: 50 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -50 }}
                  transition={{ duration: 0.5 }}
                  className="w-full max-w-3xl mx-auto text-center"
                >
                  {/* Icon */}
                  <div className="mb-4 sm:mb-6 flex justify-center">
                    <motion.div
                      className={`relative w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 rounded-full bg-gradient-to-br ${currentStepData.color} flex items-center justify-center shadow-xl border-2 border-white/30`}
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
                      <Icon className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 text-white drop-shadow-lg" />
                      <motion.div
                        className="absolute inset-0 rounded-full bg-white opacity-20"
                        animate={{ scale: [1, 1.5, 1], opacity: [0.2, 0, 0.2] }}
                        transition={{ duration: 2, repeat: Infinity }}
                      />
                    </motion.div>
                  </div>

                  {/* Title */}
                  <h3 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-gray-900 mb-3 sm:mb-4 px-2">
                    {currentStepData.title}
                  </h3>

                  {/* Description */}
                  <p className="text-sm sm:text-base md:text-lg text-gray-700 mb-4 sm:mb-6 md:mb-8 max-w-2xl mx-auto leading-relaxed px-2">
                    {currentStepData.description}
                  </p>

                  {/* Details */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4 mb-4 sm:mb-6 md:mb-8 w-full px-2">
                    {currentStepData.details.map((detail, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 + index * 0.1 }}
                        className={`bg-gradient-to-br ${currentStepData.bgGradient} rounded-xl p-3 sm:p-4 border-2 ${currentStepData.borderColor} shadow-md`}
                      >
                        <p className="text-xs sm:text-sm font-semibold text-gray-800">{detail}</p>
                      </motion.div>
                    ))}
                  </div>
                </motion.div>
              </AnimatePresence>
            </div>

            {/* Controls */}
            <div className="flex items-center justify-center gap-3 sm:gap-4 mt-4 sm:mt-6 md:mt-8">
              <button
                onClick={handlePrevious}
                className="p-2 sm:p-2.5 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors touch-manipulation"
                aria-label="Previous step"
              >
                <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5 text-gray-700" />
              </button>

              <button
                onClick={handlePlayPause}
                className="p-2.5 sm:p-3 rounded-full bg-gradient-to-r from-orange-500 to-yellow-500 hover:from-orange-600 hover:to-yellow-600 text-white transition-all shadow-lg hover:shadow-xl touch-manipulation"
                aria-label={isPlaying ? "Pause" : "Play"}
              >
                {isPlaying ? (
                  <Pause className="w-4 h-4 sm:w-5 sm:h-5" />
                ) : (
                  <Play className="w-4 h-4 sm:w-5 sm:h-5" />
                )}
              </button>

              <button
                onClick={handleNext}
                className="p-2 sm:p-2.5 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors touch-manipulation"
                aria-label="Next step"
              >
                <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 text-gray-700" />
              </button>
            </div>

            {/* Progress Dots */}
            <div className="flex justify-center gap-1.5 sm:gap-2 mt-4 sm:mt-6 overflow-x-auto pb-2 px-2">
              {steps.map((_, index) => (
                <button
                  key={index}
                  onClick={() => goToStep(index)}
                  className={`transition-all rounded-full touch-manipulation flex-shrink-0 ${
                    index === currentStep
                      ? `bg-gradient-to-r ${currentStepData.color} w-6 sm:w-8 h-2 sm:h-3`
                      : 'bg-gray-300 w-2 sm:w-3 h-2 sm:h-3 hover:bg-gray-400'
                  }`}
                  aria-label={`Go to step ${index + 1}`}
                />
              ))}
            </div>

            {/* Step Counter */}
            <div className="text-center mt-3 sm:mt-4">
              <span className="text-xs sm:text-sm text-gray-600">
                Step {currentStep + 1} of {steps.length}
              </span>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          viewport={{ once: true }}
          className="text-center mt-12"
        >
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link href="/how-it-works">
              <Button className="sunset-gradient text-white font-bold px-8 py-6 text-lg shadow-lg hover:shadow-xl transition-all hover:scale-105">
                Learn More About How It Works
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </Link>
            <Link href="/auth">
              <Button 
                variant="outline" 
                className="border-2 border-orange-300 text-orange-700 hover:bg-orange-50 font-bold px-8 py-6 text-lg"
              >
                Get Started Free
              </Button>
            </Link>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

