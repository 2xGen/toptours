"use client";
import React, { useMemo, useState, useEffect } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Search, MapPin, ArrowRight } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { destinations } from '@/data/destinationsData';
import viatorDestinationsClassifiedData from '@/data/viatorDestinationsClassified.json';

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

const DestinationSearch = () => {
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [isInputFocused, setIsInputFocused] = useState(false);

  // Helper function to generate URL-friendly slug
  const generateSlug = (name) => {
    return name
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '');
  };

  // Combine regular and Viator destinations
  const DESTINATION_LOOKUP = useMemo(() => {
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

    return [...regular, ...viator];
  }, []);

  const filteredDestinations = useMemo(() => {
    if (!query.trim()) return [];
    const searchTerm = query.toLowerCase().trim();
    return DESTINATION_LOOKUP.filter((dest) => {
      const nameMatch = dest.name.toLowerCase().includes(searchTerm);
      const fullNameMatch = dest.fullName.toLowerCase().includes(searchTerm);
      const countryMatch = dest.country.toLowerCase().includes(searchTerm);
      return nameMatch || fullNameMatch || countryMatch;
    }).slice(0, 8);
  }, [query, DESTINATION_LOOKUP]);

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
    <section className="py-20 bg-gradient-to-br from-purple-50 to-blue-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
        >
          <div className="bg-white rounded-3xl shadow-2xl p-8 border-2 border-purple-200">
            <div className="text-center mb-6">
              <p className="text-sm font-semibold text-purple-600 uppercase tracking-[0.3em] mb-2">
                Jump right in
              </p>
              <h2 className="text-3xl font-poppins font-bold text-gray-900 mb-2">
                Search destinations & tour hubs
              </h2>
              <p className="text-gray-600">
                Find tours, restaurants, and travel guides for your next adventure
              </p>
            </div>

            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-5 w-5" />
                  <Input
                    placeholder='Try "Aruba", "Lisbon", "Tokyo", "Bali"...'
                    value={query}
                    onChange={(event) => setQuery(event.target.value)}
                    onFocus={() => setIsInputFocused(true)}
                    onBlur={() => setTimeout(() => setIsInputFocused(false), 120)}
                    onKeyDown={(event) => {
                      if (event.key === 'Enter') handleSearch();
                    }}
                    className="pl-10 h-14 border-gray-300 focus-visible:ring-purple-500 text-lg"
                  />
                </div>
                <Button
                  onClick={handleSearch}
                  disabled={!hasValidDestination}
                  className="h-14 px-8 sunset-gradient text-white font-semibold transition-transform duration-200 disabled:opacity-60 disabled:cursor-not-allowed hover:scale-105 disabled:hover:scale-100"
                >
                  Go
                  <ArrowRight className="h-4 w-4 ml-2" />
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
                        className="flex items-center gap-3 text-left flex-1"
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
              <p className="text-xs uppercase tracking-[0.3em] text-gray-500 mb-3 text-center">
                Popular right now
              </p>
              <div className="flex flex-wrap gap-2 justify-center">
                {SPOTLIGHT_DESTINATIONS.map((destination) => (
                  <button
                    key={destination.id || destination.label}
                    type="button"
                    onClick={() => handleSpotlightClick(destination)}
                    className="px-4 py-2 rounded-full border border-gray-200 text-sm font-medium text-gray-700 hover:border-purple-400 hover:text-purple-600 hover:bg-purple-50 transition-colors"
                  >
                    {destination.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default DestinationSearch;

