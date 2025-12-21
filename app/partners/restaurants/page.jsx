"use client";

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Crown, 
  CheckCircle2, 
  TrendingUp,
  Zap,
  ArrowRight,
  Shield,
  UtensilsCrossed,
  MousePointerClick,
  DollarSign,
  Search,
  Loader2,
  Mail,
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import NavigationNext from '@/components/NavigationNext';
import FooterNext from '@/components/FooterNext';
import Link from 'next/link';

export default function RestaurantsPartnerPage() {
  const [destinations, setDestinations] = useState([]);
  const [selectedDestinationId, setSelectedDestinationId] = useState('');
  const [selectedDestination, setSelectedDestination] = useState(null);
  const [restaurants, setRestaurants] = useState([]);
  const [loadingDestinations, setLoadingDestinations] = useState(true);
  const [loadingRestaurants, setLoadingRestaurants] = useState(false);

  const handleDestinationChange = (e) => {
    const destId = e.target.value;
    setSelectedDestinationId(destId);
    
    if (destId) {
      const dest = destinations.find(d => d.id === destId);
      setSelectedDestination(dest);
    } else {
      setSelectedDestination(null);
      setRestaurants([]);
    }
  };

  // Fetch destinations that have restaurants on mount
  useEffect(() => {
    const fetchDestinations = async () => {
      try {
        // Fetch destinations with restaurants
        const response = await fetch('/api/partners/destinations-with-restaurants');
        if (!response.ok) {
          const errorText = await response.text();
          console.error('API Error:', errorText);
          throw new Error(`Failed to fetch destinations: ${response.status}`);
        }
        const data = await response.json();
        
        console.log('Destinations API response:', data);
        
        if (data.error) {
          console.error('API returned error:', data.error, data.details);
          setDestinations([]);
        } else if (data.destinations && Array.isArray(data.destinations)) {
          // Sort alphabetically by name
          const sorted = data.destinations.sort((a, b) => 
            a.name.localeCompare(b.name)
          );
          setDestinations(sorted);
          console.log(`Loaded ${sorted.length} destinations with restaurants`);
        } else {
          console.warn('No destinations in response:', data);
          setDestinations([]);
        }
      } catch (error) {
        console.error('Error fetching destinations:', error);
        setDestinations([]);
      } finally {
        setLoadingDestinations(false);
      }
    };

    fetchDestinations();
  }, []);

  // Fetch restaurants when destination is selected
  useEffect(() => {
    if (!selectedDestinationId || !selectedDestination) {
      setRestaurants([]);
      return;
    }

    const fetchRestaurants = async () => {
      setLoadingRestaurants(true);
      setRestaurants([]);

      try {
        const response = await fetch(`/api/partners/check-restaurant?destinationName=${encodeURIComponent(selectedDestination.name)}`);
        if (!response.ok) {
          throw new Error('Failed to fetch restaurants');
        }
        const data = await response.json();

        console.log('Restaurants API response:', data);

        if (data.error) {
          console.error('API returned error:', data.error);
          setRestaurants([]);
        } else if (data.destinationFound && data.restaurants) {
          // Sort restaurants alphabetically by name
          const sorted = data.restaurants.sort((a, b) => 
            a.name.localeCompare(b.name)
          );
          setRestaurants(sorted);
          console.log(`Loaded ${sorted.length} restaurants for ${selectedDestination?.name}`);
        } else if (data.multipleDestinations) {
          console.warn('Multiple destinations found, but no restaurants returned');
          setRestaurants([]);
        } else {
          console.warn('No restaurants in response:', data);
          setRestaurants([]);
        }
      } catch (error) {
        console.error('Error fetching restaurants:', error);
      } finally {
        setLoadingRestaurants(false);
      }
    };

    fetchRestaurants();
  }, [selectedDestinationId, selectedDestination]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      <NavigationNext />
      
      <main className="container mx-auto px-4 py-16 md:py-20 max-w-4xl">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <div className="flex items-center justify-center gap-3 mb-6 md:mb-8">
            <UtensilsCrossed className="w-10 h-10 md:w-12 md:h-12 text-amber-500" />
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900">Restaurant Partner Program</h1>
          </div>
          <p className="text-xl md:text-2xl text-gray-600 max-w-2xl mx-auto">
            Increase visibility and drive more bookings through our partnership with Google Places
          </p>
        </motion.div>

        {/* About Section - Google Places Partnership */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-12"
        >
          <Card className="shadow-xl border-2 border-purple-100">
            <CardContent className="p-8">
              <div className="flex items-center gap-3 mb-6">
                <Shield className="w-8 h-8 text-purple-600" />
                <h2 className="text-2xl font-bold text-gray-900">How TopTours.ai Works</h2>
              </div>
              
              <div className="prose prose-lg max-w-none text-gray-700 space-y-4">
                <p>
                  TopTours.ai operates as a <strong>partner with Google Places API</strong>, pulling restaurant data 
                  directly from Google's comprehensive database. We ensure you always have the most up-to-date information 
                  about your restaurant, including hours, ratings, and contact details.
                </p>
                <p>
                  <strong>All bookings and reservations are handled directly through your restaurant's website or booking partner</strong> - 
                  we do not manage bookings ourselves. When travelers click to reserve, they're redirected to your 
                  website or booking platform where they complete their reservation. This ensures a seamless, trusted booking experience.
                </p>
                <p className="bg-purple-50 border-l-4 border-purple-500 p-4 rounded">
                  <strong>Why partner with us?</strong> We help increase visibility and clicks to your restaurant 
                  listings through our Restaurant Premium Program, featuring top placement and premium badges.
                </p>
              </div>
            </CardContent>
          </Card>
        </motion.section>

        {/* Two Methods Section */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-12"
        >
          <h2 className="text-3xl font-bold text-gray-900 text-center mb-8">
            Restaurant Premium Program
          </h2>
          
          <div className="max-w-4xl mx-auto">
            {/* Restaurant Premium */}
            <Card className="shadow-xl border-2 border-amber-200">
              <CardContent className="p-8">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-12 h-12 bg-gradient-to-br from-amber-500 to-orange-500 rounded-xl flex items-center justify-center">
                    <Crown className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900">Restaurant Premium</h3>
                </div>
                
                <p className="text-gray-700 mb-6">
                  Get premium placement with customizable CTAs, premium badge, and multiple visibility touchpoints 
                  to drive more clicks and reservations to your restaurant.
                </p>
                
                {/* 5-12× More Clicks */}
                <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg p-6 mb-6 border-2 border-green-200">
                  <div className="text-center mb-4">
                    <div className="text-4xl font-black text-green-600 mb-2">5-12×</div>
                    <div className="text-lg font-bold text-gray-900 mb-1">more clicks</div>
                    <div className="text-sm text-gray-600">vs. standard listings</div>
                  </div>
                  
                  <div className="bg-white rounded-lg p-4 border border-green-200">
                    <div className="text-xs text-gray-500 uppercase tracking-wide mb-3 text-center">Real Click-Through Rates</div>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="text-center">
                        <div className="text-xs text-gray-500 mb-1">Without Premium</div>
                        <div className="text-2xl font-bold text-gray-400">~1%</div>
                      </div>
                      <div className="text-center">
                        <div className="text-xs text-gray-500 mb-1">With Premium</div>
                        <div className="text-2xl font-bold text-green-600">5-12%</div>
                      </div>
                    </div>
                    <div className="mt-3 pt-3 border-t border-green-200 text-center">
                      <p className="text-xs text-gray-600">
                        <strong className="text-gray-900">Up to 1,100% more engagement.</strong> That's the difference between 
                        1 click and 12 clicks for every 100 visitors.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Fully Customizable */}
                <div className="bg-amber-50 rounded-lg p-6 mb-6">
                  <h4 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <Crown className="w-5 h-5 text-amber-600" />
                    Fully Customizable
                  </h4>
                  <div className="space-y-2 text-sm text-gray-700">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-green-600 flex-shrink-0" />
                      <span><strong>Button Colors</strong> - 3 colors to match your brand</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-green-600 flex-shrink-0" />
                      <span><strong>CTA Text</strong> - Pick your button text</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-green-600 flex-shrink-0" />
                      <span><strong>Premium Badge</strong> - Crown signals quality</span>
                    </div>
                  </div>
                </div>

                {/* What's Included */}
                <div className="bg-blue-50 rounded-lg p-6 mb-6">
                  <h4 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <MousePointerClick className="w-5 h-5 text-blue-600" />
                    What's Included
                  </h4>
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-blue-600 flex-shrink-0" />
                      <span className="text-gray-700"><strong>Hero CTA</strong> - Top of page</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-blue-600 flex-shrink-0" />
                      <span className="text-gray-700"><strong>Mid Banner</strong> - Catches scrollers</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-blue-600 flex-shrink-0" />
                      <span className="text-gray-700"><strong>Sticky Button</strong> - Always visible</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-blue-600 flex-shrink-0" />
                      <span className="text-gray-700"><strong>TOP Badge</strong> - Premium look</span>
                    </div>
                  </div>
                </div>

                {/* Pays for Itself */}
                <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg p-6 mb-6 border-2 border-green-200">
                  <h4 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <DollarSign className="w-5 h-5 text-green-600" />
                    Pays for Itself Instantly
                  </h4>
                  <div className="bg-white rounded-lg p-4 border border-green-200">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="flex-1 bg-gray-50 rounded-lg p-3 border border-gray-200 text-center">
                        <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">You Pay</p>
                        <p className="text-2xl font-black text-gray-900">$4.99</p>
                        <p className="text-xs text-gray-500">per month</p>
                      </div>
                      <ArrowRight className="w-6 h-6 text-green-500" />
                      <div className="flex-1 bg-green-50 rounded-lg p-3 border-2 border-green-500 text-center">
                        <p className="text-xs text-green-700 uppercase tracking-wide mb-1 font-semibold">1 Extra Table =</p>
                        <p className="text-2xl font-black text-green-600">$40-120</p>
                        <p className="text-xs text-green-700">in revenue</p>
                      </div>
                    </div>
                    <div className="text-center pt-3 border-t border-green-200">
                      <p className="text-sm text-gray-700">
                        <strong className="text-gray-900">8× return</strong> on just ONE extra reservation per month
                      </p>
                    </div>
                  </div>
                </div>

                {/* Pricing */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-amber-50 border-2 border-amber-400 rounded-lg p-4 text-center">
                    <div className="text-xs text-gray-500 mb-1">Annual (12 months)</div>
                    <div className="text-2xl font-bold text-amber-600">$4.99</div>
                    <div className="text-sm text-gray-600">per month</div>
                    <div className="text-xs text-gray-400 mt-1">One-time payment</div>
                    <Badge className="mt-2 bg-green-100 text-green-700 text-xs">Best Value</Badge>
                  </div>
                  <div className="bg-white border-2 border-amber-200 rounded-lg p-4 text-center">
                    <div className="text-xs text-gray-500 mb-1">Monthly billing</div>
                    <div className="text-2xl font-bold text-gray-900">$7.99</div>
                    <div className="text-sm text-gray-600">per month</div>
                    <div className="text-xs text-gray-400 mt-1">Billed monthly</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </motion.section>

        {/* Restaurant Lookup Tool */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mb-12"
        >
          <Card className="shadow-xl border-2 border-purple-200 bg-gradient-to-br from-purple-50 to-white">
            <CardContent className="p-8 md:p-12">
              <div className="flex items-center gap-3 mb-6">
                <Search className="w-8 h-8 text-purple-600" />
                <h2 className="text-3xl font-bold text-gray-900">Check if Your Restaurant is Listed</h2>
              </div>
              
              <p className="text-gray-600 mb-6">
                Select your destination below to see all restaurants listed on TopTours.ai for that location.
              </p>
              
              <div className="space-y-4">
                {/* Destination Dropdown */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Select Destination
                  </label>
                  <select
                    value={selectedDestinationId}
                    onChange={handleDestinationChange}
                    disabled={loadingDestinations}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white"
                  >
                    <option value="">
                      {loadingDestinations ? 'Loading destinations...' : 'Choose a destination'}
                    </option>
                    {destinations.length > 0 ? (
                      destinations.map((dest) => (
                        <option key={dest.id} value={dest.id}>
                          {dest.name}
                        </option>
                      ))
                    ) : !loadingDestinations ? (
                      <option value="" disabled>
                        No destinations with restaurants found
                      </option>
                    ) : null}
                  </select>
                  {!loadingDestinations && destinations.length === 0 && (
                    <p className="mt-2 text-sm text-amber-600">
                      No destinations with restaurants found. Please check the console for details.
                    </p>
                  )}
                </div>

                {/* Restaurant List - Show when destination selected */}
                {selectedDestinationId && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mt-6"
                  >
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">
                      Restaurants in {selectedDestination?.name}
                    </h3>
                    {loadingRestaurants ? (
                      <div className="flex items-center justify-center gap-2 text-gray-600 py-8">
                        <Loader2 className="w-5 h-5 animate-spin" />
                        <span>Loading restaurants...</span>
                      </div>
                    ) : restaurants.length > 0 ? (
                      <div className="bg-white border border-gray-200 rounded-lg divide-y divide-gray-200 max-h-96 overflow-y-auto">
                        {restaurants.map((rest) => (
                          <div
                            key={rest.id}
                            className="p-4 hover:bg-gray-50 transition-colors"
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex-1">
                                <h4 className="font-medium text-gray-900">{rest.name}</h4>
                                {rest.slug && (
                                  <a
                                    href={`/destinations/${selectedDestination?.slug}/restaurants/${rest.slug}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-sm text-purple-600 hover:text-purple-700 hover:underline mt-1 inline-block"
                                  >
                                    View on TopTours.ai →
                                  </a>
                                )}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="p-6 bg-gray-50 border border-gray-200 rounded-lg text-center">
                        <p className="text-gray-600 mb-4">
                          No restaurants found for this destination.
                        </p>
                        <p className="text-sm text-gray-500 mb-4">
                          Want to add your restaurant? Send us an email:
                        </p>
                        <a
                          href="mailto:mail@toptours.ai?subject=Add Restaurant Request&body=Hi,%0D%0A%0D%0AI would like to add my restaurant to TopTours.ai.%0D%0A%0D%0ADestination: [Your Destination]%0D%0ARestaurant Name: [Your Restaurant Name]%0D%0AAdditional Information: [Any additional details]"
                          className="inline-flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                        >
                          <Mail className="w-4 h-4" />
                          Send Request to mail@toptours.ai
                        </a>
                      </div>
                    )}
                  </motion.div>
                )}

              </div>
            </CardContent>
          </Card>
        </motion.section>

        {/* Add Restaurant Section */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mb-12"
        >
          <Card className="shadow-xl border-2 border-amber-200 bg-gradient-to-br from-amber-50 to-white">
            <CardContent className="p-8 md:p-12">
              <div className="text-center">
                <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">
                  Want to add your restaurant?
                </h2>
                <p className="text-gray-600 mb-6">
                  Is your destination in the list above but your restaurant isn't? Send us an email to request adding your restaurant to TopTours.ai.
                </p>
                <a
                  href="mailto:mail@toptours.ai?subject=Add Restaurant Request&body=Hi,%0D%0A%0D%0AI would like to add my restaurant to TopTours.ai.%0D%0A%0D%0ADestination: [Your Destination]%0D%0ARestaurant Name: [Your Restaurant Name]%0D%0AAdditional Information: [Any additional details]"
                  className="inline-flex items-center gap-2 px-6 py-3 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors font-medium"
                >
                  <Mail className="w-5 h-5" />
                  Send Request to mail@toptours.ai
                </a>
              </div>
            </CardContent>
          </Card>
        </motion.section>
      </main>

      <FooterNext />
    </div>
  );
}

