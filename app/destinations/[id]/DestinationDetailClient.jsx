"use client";
import { useState, useEffect } from 'react';
import NavigationNext from '@/components/NavigationNext';
import Footer from '@/components/Footer';
import SmartTourFinder from '@/components/home/SmartTourFinder';
import { useToast } from '@/components/ui/use-toast';
import { motion } from 'framer-motion';
import { 
  Star, ExternalLink, Loader2, Brain
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export default function DestinationDetailClient({ destination }) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [preFilledDestination, setPreFilledDestination] = useState('');
  const [tours, setTours] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [aiInsight, setAiInsight] = useState('');
  const [generatingInsight, setGeneratingInsight] = useState(false);
  const [popularCategories, setPopularCategories] = useState([]);
  const [generatingCategories, setGeneratingCategories] = useState(false);
  const { toast } = useToast();

  const handleOpenModal = (dest = '') => {
    setPreFilledDestination(dest);
    setIsModalOpen(true);
  };

  useEffect(() => {
    fetchTours();
    generateAIInsight();
    generatePopularCategories();
  }, []);

  const fetchTours = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch('/api/viator-search', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          destination: destination.viatorId || destination.fullName,
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      if (data.products && Array.isArray(data.products)) {
        setTours(data.products.slice(0, 12));
      } else {
        setTours([]);
      }
    } catch (err) {
      console.error('Error loading tours:', err);
      setError('Unable to load tours at this time. Please try again later.');
      toast({
        title: "Error loading tours",
        description: err.message,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const generateAIInsight = async () => {
    setGeneratingInsight(true);
    
    try {
      const response = await fetch('/api/openai-description', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          destination: destination.fullName
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      if (data.success && data.description) {
        setAiInsight(data.description);
      } else {
        setAiInsight(destination.heroDescription || `Discover the best tours and activities in ${destination.fullName}!`);
      }
    } catch (err) {
      console.error('AI insight generation error:', err);
      setAiInsight(destination.heroDescription || `Discover the best tours and activities in ${destination.fullName}!`);
    } finally {
      setGeneratingInsight(false);
    }
  };

  const generatePopularCategories = async () => {
    setGeneratingCategories(true);
    
    try {
      const response = await fetch('/api/openai-categories', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          destination: destination.fullName
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      if (data.success && data.categories) {
        setPopularCategories(data.categories);
      } else {
        setPopularCategories(destination.tourCategories || []);
      }
    } catch (err) {
      console.error('Categories generation error:', err);
      setPopularCategories(destination.tourCategories || []);
    } finally {
      setGeneratingCategories(false);
    }
  };

  return (
    <>
      <NavigationNext onOpenModal={handleOpenModal} />
      
      <div className="min-h-screen pt-16">
        {/* Hero Section */}
        <div className="relative h-96 overflow-hidden">
          <img
            src={destination.imageUrl}
            alt={destination.fullName}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
          <div className="absolute bottom-0 left-0 right-0 p-8">
            <div className="container mx-auto max-w-6xl">
              <motion.h1 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-4xl md:text-5xl font-bold text-white mb-4"
              >
                {destination.fullName}
              </motion.h1>
              <motion.p 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="text-xl text-white/90 max-w-3xl"
              >
                {destination.seo?.description || destination.heroDescription}
              </motion.p>
            </div>
          </div>
        </div>

        {/* AI Insight Section */}
        <div className="container mx-auto px-4 py-8 max-w-6xl">
          <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-6 mb-8 border border-blue-100">
            <div className="flex items-center gap-2 mb-3">
              <Brain className="w-5 h-5 text-blue-600" />
              <h2 className="text-lg font-bold text-blue-900">AI-Powered Insight</h2>
              {generatingInsight && <Loader2 className="w-4 h-4 text-blue-600 animate-spin" />}
            </div>
            <p className="text-gray-700 leading-relaxed">
              {aiInsight || 'Generating personalized insights...'}
            </p>
          </div>

          {/* Popular Categories */}
          {popularCategories.length > 0 && (
            <div className="mb-8">
              <h3 className="text-2xl font-bold text-white mb-4">Popular Categories</h3>
              <div className="flex flex-wrap gap-3">
                {popularCategories.map((category, index) => (
                  <Badge 
                    key={index}
                    className="bg-white/20 text-white hover:bg-white/30 cursor-pointer px-4 py-2 text-sm"
                  >
                    {category}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Tours Grid */}
          {loading ? (
            <div className="text-center py-12">
              <Loader2 className="w-12 h-12 animate-spin mx-auto text-white mb-4" />
              <p className="text-white">Loading amazing tours...</p>
            </div>
          ) : error ? (
            <div className="text-center py-12">
              <p className="text-red-400">{error}</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {tours.map((tour, index) => (
                <Card key={tour.productCode || index} className="overflow-hidden hover:shadow-xl transition-shadow">
                  <div className="relative h-48">
                    {tour.images?.[0]?.variants?.[0]?.url && (
                      <img
                        src={tour.images[0].variants[0].url}
                        alt={tour.title}
                        className="w-full h-full object-cover"
                      />
                    )}
                  </div>
                  <CardContent className="p-4">
                    <h3 className="font-bold text-lg mb-2 line-clamp-2">{tour.title}</h3>
                    <div className="flex items-center gap-2 mb-2">
                      <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                      <span className="text-sm">{tour.rating?.average || 'N/A'} ({tour.rating?.totalReviews || 0})</span>
                    </div>
                    <p className="text-2xl font-bold text-blue-600 mb-3">
                      ${tour.pricing?.summary?.fromPrice || 'N/A'}
                    </p>
                    <Button 
                      className="w-full"
                      onClick={() => window.open(tour.productUrl || `https://www.viator.com/tours/${tour.productCode}`, '_blank')}
                    >
                      View Details
                      <ExternalLink className="w-4 h-4 ml-2" />
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>

      <Footer />
      
      <SmartTourFinder 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        preFilledDestination={preFilledDestination}
      />
    </>
  );
}

