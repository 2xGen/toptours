"use client";
import React, { useMemo, useState, useEffect } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Search, MapPin, Sparkles, Globe, ShieldCheck, ArrowRight } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from '@/components/ui/use-toast';
import AnimatedHeroBackground from './AnimatedHeroBackground';
import { destinations } from '@/data/destinationsData';
import viatorDestinationsClassifiedData from '@/data/viatorDestinationsClassified.json';

const FEATURED_TOURS_DESTINATION = 'curacao';
const SPOTLIGHT_DESTINATIONS = [
  { id: 'aruba', label: 'Aruba' },
  { id: 'curacao', label: 'Curaçao' },
  { id: 'punta-cana', label: 'Punta Cana' },
  { id: 'lisbon', label: 'Lisbon' },
  { id: 'bali', label: 'Bali' },
  { id: 'amsterdam', label: 'Amsterdam' },
  { id: 'tokyo', label: 'Tokyo' },
  { id: 'new-york-city', label: 'New York' },
  { id: 'rome', label: 'Rome' },
  { label: 'Sydney', search: 'Sydney' },
];

const Hero = () => {
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [isInputFocused, setIsInputFocused] = useState(false);

  // Helper function to generate URL-friendly slug
  const generateSlug = (name) => {
    return name
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, '') // Remove special characters
      .replace(/\s+/g, '-') // Replace spaces with hyphens
      .replace(/-+/g, '-') // Replace multiple hyphens with single hyphen
      .replace(/^-|-$/g, ''); // Remove leading/trailing hyphens
  };

  // Combine regular and Viator destinations
  // Use the same data source as /destinations page (viatorDestinationsClassified.json)
  const DESTINATION_LOOKUP = useMemo(() => {
    const regular = destinations.map((destination) => ({
      id: destination.id,
      name: destination.name,
      fullName: destination.fullName || destination.name,
      country: destination.country || destination.category || '',
      isViator: false,
    }));

    // Get all destinations from classified data (same as /destinations page)
    const allClassifiedDestinations = Array.isArray(viatorDestinationsClassifiedData) 
      ? viatorDestinationsClassifiedData 
      : [];

    // Get curated destination slugs for filtering
    const curatedSlugs = new Set(
      destinations.map(d => d.id.toLowerCase())
    );

    // Create normalized names from our curated destinations for matching
    const curatedBaseNames = new Set();
    const curatedFullNames = new Set();
    
    destinations.forEach(dest => {
      const name = (dest.name || '').toLowerCase().trim();
      const fullName = (dest.fullName || dest.name || '').toLowerCase().trim();
      
      curatedBaseNames.add(name);
      curatedFullNames.add(fullName);
      
      // Extract base name (remove country suffix)
      const baseName = fullName.split(',')[0].trim();
      if (baseName && baseName !== fullName) {
        curatedBaseNames.add(baseName);
      }
    });
    
    // Helper function to check if a destination matches any curated destination
    const matchesCurated = (destName, destSlug) => {
      const normalized = destName.toLowerCase().trim();
      const baseName = normalized.split(',')[0].trim();
      
      // Check by slug first (most reliable)
      if (destSlug && curatedSlugs.has(destSlug.toLowerCase())) {
        return true;
      }
      
      // Check exact matches
      if (curatedBaseNames.has(normalized) || curatedFullNames.has(normalized)) {
        return true;
      }
      
      // Check base name matches (e.g., "Abu Dhabi" matches "Abu Dhabi, UAE")
      if (curatedBaseNames.has(baseName) || curatedFullNames.has(baseName)) {
        return true;
      }
      
      return false;
    };

    // Filter classified destinations - exclude ones that match our curated destinations
    // Also deduplicate by name
    const seenViatorNames = new Set();
    
    const viator = allClassifiedDestinations
      .filter(dest => {
        const destName = (dest.destinationName || dest.name || '').trim();
        if (!destName) return false;
        
        const normalized = destName.toLowerCase().trim();
        const slug = generateSlug(destName);
        
        // Skip if it matches a curated destination
        if (matchesCurated(destName, slug)) {
          return false;
        }
        
        // Skip if we've already seen this exact name
        if (seenViatorNames.has(normalized)) {
          return false;
        }
        
        seenViatorNames.add(normalized);
        return true;
      })
      .map((dest) => {
        const destName = dest.destinationName || dest.name || '';
        const slug = generateSlug(destName);
        return {
          id: slug, // Use slug as ID for SEO-friendly URLs
          name: destName,
          fullName: destName,
          country: dest.country || dest.region || '',
          isViator: true,
          viatorId: dest.destinationId || dest.id, // Store original Viator ID
        };
      });

    return [...regular, ...viator];
  }, []);

  const filteredDestinations = useMemo(() => {
    if (!query.trim()) return [];
    const term = query.toLowerCase();
    return DESTINATION_LOOKUP.filter((destination) =>
      destination.name.toLowerCase().includes(term) ||
      destination.fullName.toLowerCase().includes(term) ||
      destination.country.toLowerCase().includes(term)
    ).slice(0, 6);
  }, [query, DESTINATION_LOOKUP]);

  const showSuggestions = isInputFocused && filteredDestinations.length > 0;
  const hasValidDestination = filteredDestinations.length > 0;

  const handleDestinationSelect = (destination, target = 'destination') => {
    // Check if it's a Viator destination
    const isViator = destination.isViator || false;
    const destinationId = destination.id || destination;
    
    // Viator destinations always go to tours page (no landing page)
    const path = isViator || target === 'tours'
      ? `/destinations/${destinationId}/tours`
      : `/destinations/${destinationId}`;
    router.push(path);
    setQuery('');
    setIsInputFocused(false);
  };

  const handleSpotlightClick = (spotlight) => {
    if (spotlight.id) {
      const dest = DESTINATION_LOOKUP.find((destination) => destination.id === spotlight.id);
      if (dest) {
        handleDestinationSelect(dest);
        return;
      }
    }

    const fallbackQuery = spotlight.search || spotlight.label;
    router.push(`/destinations?search=${encodeURIComponent(fallbackQuery)}`);
  };

  const handleSearch = () => {
    if (!query.trim()) {
      toast({
        title: 'Choose a destination',
        description: 'Start typing to search from 3300+ destinations worldwide.',
      });
      return;
    }

    if (!hasValidDestination) {
      toast({
        title: 'Pick a destination from the list',
        description: 'Use one of our suggested destinations so we can pull the right guide for you.',
      });
      return;
    }

    if (filteredDestinations.length > 0) {
      handleDestinationSelect(filteredDestinations[0]);
      return;
    }

    router.push(`/destinations?search=${encodeURIComponent(query.trim())}`);
    setQuery('');
    setIsInputFocused(false);
  };

  return (
    <section className="relative overflow-hidden pt-24 pb-16">
      <div className="absolute inset-0 ocean-gradient" />
      <AnimatedHeroBackground />
      <div className="absolute inset-0 bg-black/30" />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-12 gap-10 items-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="lg:col-span-7 text-white"
          >
            <h1 className="font-poppins font-bold leading-tight mb-6">
              <span className="block text-4xl sm:text-5xl lg:text-6xl xl:text-7xl">
                The smarter way
              </span>
              <span className="gradient-text block text-4xl sm:text-5xl lg:text-6xl xl:text-7xl">
                to discover tours
              </span>
            </h1>

            <p className="text-lg md:text-xl text-white/90 mb-8 max-w-2xl">
              Skip the endless research. Jump straight into curated destination guides, expert AI
              insights, and direct booking links for 3300+ destinations worldwide and thousands of tours.
            </p>

            <div className="flex flex-wrap gap-4 mb-10">
              <Button
                asChild
                className="sunset-gradient text-white font-semibold shadow-lg hover:scale-105 transition-transform duration-200 px-8 py-3 text-lg"
              >
                <Link href="/destinations">
                  All Destinations
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Link>
              </Button>
              <Button
                asChild
                variant="secondary"
                className="bg-white/90 text-purple-700 border border-purple-100 hover:bg-white px-8 py-3 text-lg font-semibold"
              >
                <Link href="/toptours">
                  View leaderboard
                </Link>
              </Button>
            </div>

            <div className="flex flex-wrap gap-4 text-white/80">
              <div className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-yellow-300" />
                <span>AI-personalized</span>
              </div>
              <div className="flex items-center gap-2">
                <Globe className="h-5 w-5 text-blue-200" />
                <span>3300+ destinations</span>
              </div>
              <div className="flex items-center gap-2">
                <ShieldCheck className="h-5 w-5 text-emerald-200" />
                <span>Trusted partners</span>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.1 }}
            className="lg:col-span-5 w-full"
          >
            <div className="bg-white/95 rounded-3xl shadow-2xl p-6 backdrop-blur-sm border border-white/40">
              <div className="text-left mb-4">
                <p className="text-sm font-semibold text-purple-600 uppercase tracking-[0.3em]">
                  Jump right in
                </p>
                <h2 className="text-2xl font-poppins text-gray-900">
                  Search destinations & tour hubs
                </h2>
              </div>

              <div className="space-y-3">
                <div className="flex flex-col sm:flex-row gap-3">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-5 w-5" />
                    <Input
                      placeholder="Try “Aruba”, “Lisbon”, “Tokyo”, “Bali”…"
                      value={query}
                      onChange={(event) => setQuery(event.target.value)}
                      onFocus={() => setIsInputFocused(true)}
                      onBlur={() => setTimeout(() => setIsInputFocused(false), 120)}
                      onKeyDown={(event) => {
                        if (event.key === 'Enter') handleSearch();
                      }}
                      className="pl-10 h-12 border-gray-300 focus-visible:ring-purple-500"
                    />
                  </div>
                  <Button
                    onClick={handleSearch}
                    disabled={!hasValidDestination}
                    className="h-12 px-8 sunset-gradient text-white font-semibold transition-transform duration-200 disabled:opacity-60 disabled:cursor-not-allowed hover:scale-105 disabled:hover:scale-100"
                  >
                    Go
                  </Button>
                </div>

                {showSuggestions && (
                  <div className="border border-gray-200 rounded-2xl mt-2 divide-y bg-white shadow-xl">
                    {filteredDestinations.map((destination) => (
                      <div
                        key={destination.id}
                        className="flex items-center justify-between p-3 hover:bg-gray-50 transition-colors"
                      >
                        <button
                          type="button"
                          onMouseDown={(event) => {
                            event.preventDefault();
                            handleDestinationSelect(destination);
                          }}
                          className="flex items-center gap-3 text-left"
                        >
                          <div className="rounded-full bg-purple-50 text-purple-600 w-9 h-9 flex items-center justify-center">
                            <MapPin className="h-4 w-4" />
                          </div>
                          <div>
                            <p className="font-semibold text-gray-900">
                              {destination.fullName}
                            </p>
                            {destination.country && (
                              <p className="text-sm text-gray-500">{destination.country}</p>
                            )}
                          </div>
                        </button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onMouseDown={(event) => {
                            event.preventDefault();
                            handleDestinationSelect(destination, 'tours');
                          }}
                          className="text-purple-600 hover:text-purple-800"
                        >
                          View tours
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="mt-6">
                <p className="text-xs uppercase tracking-[0.3em] text-gray-500 mb-3">
                  Popular right now
                </p>
                <div className="flex flex-wrap gap-2">
                  {SPOTLIGHT_DESTINATIONS.map((destination) => (
                    <button
                      key={destination.id || destination.label}
                      type="button"
                      onClick={() => handleSpotlightClick(destination)}
                      className="px-3 py-1.5 rounded-full border border-gray-200 text-sm font-medium text-gray-700 hover:border-purple-400 hover:text-purple-600 transition-colors"
                    >
                      {destination.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default Hero;