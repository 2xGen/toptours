"use client";
import React from 'react';
import Link from 'next/link';
import { ArrowRight, Ticket, MapPin } from 'lucide-react';
import { destinations } from '@/data/destinationsData';

const DestinationLinksFooter = () => {
  // Map of destination names to IDs (matching user's list)
  const destinationNameMap = {
    // Caribbean
    'Aruba': 'aruba',
    'Curaçao': 'curacao',
    'St. Lucia': 'st-lucia',
    'Barbados': 'barbados',
    'Jamaica': 'jamaica',
    'Punta Cana': 'punta-cana',
    'Santo Domingo': 'santo-domingo',
    'Nassau': 'nassau',
    'Exuma': 'exuma',
    'Puerto Rico': 'puerto-rico',
    'Turks and Caicos': 'turks-and-caicos',
    'Grenada': 'grenada',
    'St. Martin / Sint Maarten': 'st-martin',
    'Bonaire': 'bonaire',
    'Cayman Islands': 'cayman-islands',
    'Antigua and Barbuda': 'antigua-and-barbuda',
    'Trinidad and Tobago': 'trinidad-and-tobago',
    'British Virgin Islands': 'british-virgin-islands',
    'St. Kitts and Nevis': 'st-kitts-and-nevis',
    'Martinique': 'martinique',
    'Guadeloupe': 'guadeloupe',
    // Europe
    'Paris': 'paris',
    'Nice': 'nice',
    'French Riviera (Côte d\'Azur)': 'french-riviera',
    'Rome': 'rome',
    'Venice': 'venice',
    'Florence': 'florence',
    'Amalfi Coast': 'amalfi-coast',
    'Barcelona': 'barcelona',
    'Madrid': 'madrid',
    'Seville': 'seville',
    'Marbella': 'marbella',
    'Mallorca': 'mallorca',
    'Ibiza': 'ibiza',
    'Athens': 'athens',
    'Santorini': 'santorini',
    'Mykonos': 'mykonos',
    'Crete': 'crete',
    'Lisbon': 'lisbon',
    'Porto': 'porto',
    'Madeira': 'madeira',
    'London': 'london',
    'Edinburgh': 'edinburgh',
    'Amsterdam': 'amsterdam',
    'Berlin': 'berlin',
    'Munich': 'munich',
    'Zurich': 'zurich',
    'Interlaken': 'interlaken',
    'Dubrovnik': 'dubrovnik',
    'Split': 'split'
  };

  // Get destinations that match the user's list
  const featuredDestinations = Object.entries(destinationNameMap)
    .map(([name, id]) => {
      const dest = destinations.find(d => d.id === id);
      if (dest) {
        return { ...dest, displayName: name };
      }
      return null;
    })
    .filter(Boolean);

  // Popular destinations with tours (all major tour destinations)
  const tourDestinations = [
    // Europe
    'paris', 'rome', 'barcelona', 'london', 'amsterdam', 'lisbon', 'athens',
    'madrid', 'venice', 'florence', 'dublin', 'prague', 'vienna', 'brussels',
    'santorini', 'mykonos', 'dubrovnik', 'split', 'interlaken',
    // Caribbean
    'aruba', 'curacao', 'barbados', 'jamaica', 'punta-cana', 'nassau',
    'st-lucia', 'grenada', 'trinidad-and-tobago', 'puerto-rico',
    // North America
    'new-york-city', 'los-angeles', 'miami', 'san-francisco', 'chicago',
    'boston', 'seattle', 'washington-d-c', 'toronto', 'vancouver',
    // Asia-Pacific
    'tokyo', 'bangkok', 'singapore', 'melbourne', 'sydney', 'hong-kong',
    'seoul', 'taipei', 'mumbai', 'delhi', 'bali',
    // Middle East & Africa
    'dubai', 'istanbul', 'cairo', 'marrakech', 'cape-town',
    // South America
    'rio-de-janeiro', 'buenos-aires', 'sao-paulo', 'lima', 'bogota'
  ].map(id => {
    const dest = destinations.find(d => d.id === id);
    if (dest) {
      return { ...dest, displayName: dest.fullName || dest.name };
    }
    return null;
  }).filter(Boolean).sort((a, b) => {
    const nameA = (a.displayName || a.fullName || a.name || '').toLowerCase();
    const nameB = (b.displayName || b.fullName || b.name || '').toLowerCase();
    return nameA.localeCompare(nameB);
  });

  return (
    <>
      {/* Explore More Destinations Section */}
      <section className="py-12 bg-gray-50 border-t border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-center gap-2 mb-6">
            <MapPin className="w-5 h-5 text-purple-600" />
            <h3 className="text-xl font-bold text-gray-900">
              Explore More Destinations
            </h3>
          </div>
          <div className="flex flex-wrap gap-3 justify-center">
            {featuredDestinations.map((destination) => (
              <Link
                key={destination.id}
                href={`/destinations/${destination.id}`}
                className="text-sm text-gray-600 hover:text-purple-600 hover:underline transition-colors"
              >
                {destination.displayName || destination.fullName || destination.name}
              </Link>
            ))}
            <Link
              href="/destinations"
              className="text-sm font-semibold text-purple-600 hover:text-purple-700 flex items-center gap-1"
            >
              View All Destinations
              <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
        </div>
      </section>

      {/* Explore Top Tours Section */}
      <section className="py-12 bg-gray-50 border-t border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-center gap-2 mb-6">
            <Ticket className="w-5 h-5 text-purple-600" />
            <h3 className="text-xl font-bold text-gray-900">
              Explore Top Tours in
            </h3>
          </div>
          <div className="flex flex-wrap gap-3 justify-center">
            {tourDestinations.map((destination) => (
              <Link
                key={destination.id}
                href={`/destinations/${destination.id}/tours`}
                className="text-sm text-gray-600 hover:text-purple-600 hover:underline transition-colors"
              >
                {destination.displayName || destination.fullName || destination.name}
              </Link>
            ))}
            <Link
              href="/destinations"
              className="text-sm font-semibold text-purple-600 hover:text-purple-700 flex items-center gap-1"
            >
              View All Destinations with Tours
              <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
        </div>
      </section>
    </>
  );
};

export default DestinationLinksFooter;
