"use client";
import React, { useMemo, useState, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Search, MapPin, Globe, UtensilsCrossed, Ticket, BookOpen, ArrowRight, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import AnimatedHeroBackground from './AnimatedHeroBackground';
// OPTIMIZED: Lazy load large destination data - only load when user starts typing
// This prevents blocking LCP with 1.27 MB of data processing

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

const Hero = ({ onOpenOnboardingModal }) => {
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [isInputFocused, setIsInputFocused] = useState(false);
  // OPTIMIZED: Lazy load destination data - only load when user starts typing
  const [destinationDataLoaded, setDestinationDataLoaded] = useState(false);
  const [destinationLookup, setDestinationLookup] = useState([]);

  const generateSlug = (name) => {
    return name
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '');
  };

  // OPTIMIZED: Load destination data only when user starts typing (lazy load)
  // This prevents blocking LCP with 1.27 MB of data processing
  const loadDestinationData = useCallback(async () => {
    if (destinationDataLoaded) return;
    
    try {
      // Dynamically import large data files only when needed
      const [destinationsModule, viatorDataModule] = await Promise.all([
        import('@/data/destinationsData'),
        import('@/data/viatorDestinationsClassified.json')
      ]);
      
      const destinations = destinationsModule.destinations;
      const viatorDestinationsClassifiedData = viatorDataModule.default;

      const regular = destinations.map((destination) => ({
        id: destination.id,
        name: destination.name,
        fullName: destination.fullName || destination.name,
        country: destination.country || destination.category || '',
        isViator: false,
      }));

      const allClassifiedDestinations = Array.isArray(viatorDestinationsClassifiedData) 
        ? viatorDestinationsClassifiedData 
        : [];

      const curatedSlugs = new Set(
        destinations.map(d => d.id.toLowerCase())
      );

      const curatedBaseNames = new Set();
      const curatedFullNames = new Set();
      
      destinations.forEach(dest => {
        const name = (dest.name || '').toLowerCase().trim();
        const fullName = (dest.fullName || dest.name || '').toLowerCase().trim();
        curatedBaseNames.add(name);
        curatedFullNames.add(fullName);
        const baseName = fullName.split(',')[0].trim();
        if (baseName && baseName !== fullName) {
          curatedBaseNames.add(baseName);
        }
      });
      
      const matchesCurated = (destName, destSlug) => {
        const normalized = destName.toLowerCase().trim();
        const baseName = normalized.split(',')[0].trim();
        if (destSlug && curatedSlugs.has(destSlug.toLowerCase())) {
          return true;
        }
        if (curatedBaseNames.has(normalized) || curatedFullNames.has(normalized)) {
          return true;
        }
        if (curatedBaseNames.has(baseName) || curatedFullNames.has(baseName)) {
          return true;
        }
        return false;
      };

      const viator = allClassifiedDestinations
        .filter(dest => {
          const destName = dest.destinationName || '';
          const destSlug = dest.slug || '';
          return !matchesCurated(destName, destSlug);
        })
        .map((dest) => ({
          id: dest.slug || generateSlug(dest.destinationName || ''),
          name: dest.destinationName || '',
          fullName: dest.destinationName || '',
          country: dest.country || '',
          isViator: true,
        }));

      setDestinationLookup([...regular, ...viator]);
      setDestinationDataLoaded(true);
    } catch (error) {
      console.error('Error loading destination data:', error);
      setDestinationDataLoaded(true); // Prevent retry loops
    }
  }, [destinationDataLoaded]);

  // Load data when user starts typing (query.length > 0)
  React.useEffect(() => {
    if (query.trim().length > 0 && !destinationDataLoaded) {
      loadDestinationData();
    }
  }, [query, destinationDataLoaded, loadDestinationData]);

  const filteredDestinations = useMemo(() => {
    if (!query.trim() || !destinationDataLoaded) return [];
    const searchTerm = query.toLowerCase().trim();
    return destinationLookup.filter((dest) => {
      const nameMatch = dest.name.toLowerCase().includes(searchTerm);
      const fullNameMatch = dest.fullName.toLowerCase().includes(searchTerm);
      const countryMatch = dest.country.toLowerCase().includes(searchTerm);
      return nameMatch || fullNameMatch || countryMatch;
    }).slice(0, 8);
  }, [query, destinationLookup, destinationDataLoaded]);

  const hasValidDestination = filteredDestinations.length > 0;
  const showSuggestions = isInputFocused && filteredDestinations.length > 0;

  const handleDestinationSelect = (destination, tab = null) => {
    if (destination.isViator) {
      router.push(`/destinations?search=${encodeURIComponent(destination.fullName)}`);
    } else {
      const path = tab === 'tours' 
        ? `/destinations/${destination.id}/tours`
        : `/destinations/${destination.id}`;
      router.push(path);
    }
    setQuery('');
    setIsInputFocused(false);
  };

  const handleSpotlightClick = (destination) => {
    if (destination.id) {
      router.push(`/destinations/${destination.id}`);
    } else if (destination.search) {
      router.push(`/destinations?search=${encodeURIComponent(destination.search)}`);
    }
    setQuery('');
    setIsInputFocused(false);
  };

  const handleSearch = () => {
    if (!query.trim()) return;
    if (filteredDestinations.length > 0) {
      handleDestinationSelect(filteredDestinations[0]);
      return;
    }
    router.push(`/destinations?search=${encodeURIComponent(query.trim())}`);
    setQuery('');
    setIsInputFocused(false);
  };

  return (
    <section className="relative overflow-hidden pt-20 pb-16">
      <div className="absolute inset-0 ocean-gradient" />
      <AnimatedHeroBackground />
      <div className="absolute inset-0 bg-black/30" />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-white"
          >
            <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm rounded-full px-4 py-2 mb-6">
              <Sparkles className="w-4 h-4 text-yellow-300" />
              <span className="text-sm font-semibold">Revolutionary Tour & Restaurant Discovery</span>
            </div>
            <h1 className="font-poppins font-bold leading-tight mb-6">
              <span className="block text-4xl sm:text-5xl lg:text-6xl xl:text-7xl mb-2">
                Tours & Restaurants That Match Your Style
              </span>
              <span className="block text-xl sm:text-2xl lg:text-3xl xl:text-4xl gradient-text whitespace-nowrap">
                Powered by AI-driven Best Match
              </span>
            </h1>

            <p className="text-lg md:text-xl text-white/90 mb-8 max-w-3xl mx-auto text-center">
              Get personalized recommendations that match your travel style, budget, and group preferences with <strong className="text-white">AI-powered Best Match</strong>.
            </p>

            {/* Search Bar - Prominent in Hero */}
            <div className="mb-8 max-w-3xl mx-auto">
              <div className="relative">
                <div className="bg-white rounded-2xl shadow-2xl p-2 flex gap-2">
                  <div className="relative flex-1">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 h-5 w-5" />
                    <Input
                      placeholder='Search destinations... Try "Aruba", "Lisbon", "Tokyo"'
                      value={query}
                      onChange={(event) => setQuery(event.target.value)}
                      onFocus={() => setIsInputFocused(true)}
                      onBlur={() => setTimeout(() => setIsInputFocused(false), 200)}
                      onKeyDown={(event) => {
                        if (event.key === 'Enter') handleSearch();
                      }}
                      className="pl-12 h-14 border-0 text-lg text-gray-900 placeholder:text-gray-400 focus-visible:ring-0 shadow-none"
                    />
                  </div>
                  <Button
                    onClick={handleSearch}
                    disabled={!query.trim()}
                    className="h-14 px-8 bg-[#00AA6C] hover:bg-[#008855] text-white font-semibold transition-all disabled:opacity-60"
                  >
                    Search
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>
                </div>

                {/* Search Suggestions Dropdown */}
                {showSuggestions && (
                  <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl shadow-2xl border border-gray-200 divide-y max-h-96 overflow-y-auto z-50">
                    {filteredDestinations.map((destination) => (
                      <div
                        key={destination.id}
                        className="flex items-center justify-between p-4 hover:bg-gray-50 transition-colors"
                      >
                        <button
                          type="button"
                          onMouseDown={(event) => {
                            event.preventDefault();
                            handleDestinationSelect(destination);
                          }}
                          className="flex items-center gap-3 text-left flex-1"
                        >
                          <div className="rounded-full bg-purple-100 text-purple-600 w-10 h-10 flex items-center justify-center">
                            <MapPin className="h-5 w-5" />
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
                          Tours
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Popular Destinations */}
              <div className="mt-6">
                <p className="text-sm text-white/80 mb-3">Popular destinations:</p>
                <div className="flex flex-wrap gap-2 justify-center">
                  {SPOTLIGHT_DESTINATIONS.slice(0, 8).map((destination) => (
                    <button
                      key={destination.id || destination.label}
                      type="button"
                      onClick={() => handleSpotlightClick(destination)}
                      className="px-4 py-2 rounded-full border border-white/30 bg-white/10 backdrop-blur-sm text-white text-sm font-medium hover:bg-white/20 transition-colors"
                    >
                      {destination.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Stats - Real numbers only */}
            <div className="flex flex-wrap gap-6 justify-center text-white/90 text-sm">
              <div className="flex items-center gap-2">
                <Ticket className="h-5 w-5 text-yellow-300" />
                <span>300,000+ tours</span>
              </div>
              <div className="flex items-center gap-2">
                <Globe className="h-5 w-5 text-blue-200" />
                <span>3,300+ destinations</span>
              </div>
              <div className="flex items-center gap-2">
                <UtensilsCrossed className="h-5 w-5 text-green-200" />
                <span>3,500+ restaurants</span>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
