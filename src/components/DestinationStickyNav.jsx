"use client";

import Link from 'next/link';
import { Car, BookOpen, Baby } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

/**
 * Reusable sticky navigation bar for destination-related pages
 * Shows quick access to Tours, Travel Guides, and Car Rentals
 * 
 * @param {Object} props
 * @param {string} props.destinationId - Destination slug/ID
 * @param {string} props.destinationName - Display name for destination (optional, falls back to ID)
 * @param {boolean} props.showCounts - Whether to show counts (default: false to avoid API calls)
 * @param {number} props.tourCount - Optional tour count to display
 * @param {number} props.guideCount - Optional guide count to display
 * @param {boolean} props.hasRestaurants - Whether to show restaurants link
 * @param {number} props.restaurantCount - Optional restaurant count
 * @param {boolean} props.hasAirportTransfers - Whether airport transfers guide exists
 * @param {boolean} props.hasBabyEquipment - Whether baby equipment rentals page exists
 */
export default function DestinationStickyNav({
  destinationId,
  destinationName,
  showCounts = false,
  tourCount = null,
  guideCount = null,
  hasRestaurants = false,
  restaurantCount = null,
  hasAirportTransfers = false,
  hasBabyEquipment = false,
}) {
  if (!destinationId) {
    return null;
  }

  return (
    <section className="sticky top-16 z-40 bg-white border-b shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <nav className="flex items-center gap-6 py-4 overflow-x-auto hide-scrollbar">
          {/* Tours */}
          <Link 
            href={`/destinations/${destinationId}/tours`}
            className="flex items-center gap-2 whitespace-nowrap font-semibold text-gray-900 hover:text-blue-600 transition-colors border-b-2 border-transparent hover:border-blue-600 pb-1"
          >
            <span>Tours</span>
            {showCounts && tourCount !== null && (
              <Badge variant="secondary" className="bg-blue-100 text-blue-700">
                {tourCount.toLocaleString()}+
              </Badge>
            )}
          </Link>

          {/* Travel Guides */}
          <Link 
            href={`/destinations/${destinationId}/guides`}
            className="flex items-center gap-2 whitespace-nowrap font-semibold text-gray-900 hover:text-indigo-600 transition-colors border-b-2 border-transparent hover:border-indigo-600 pb-1"
          >
            <BookOpen className="w-4 h-4" />
            <span>Travel Guides</span>
            {showCounts && guideCount !== null && (
              <Badge variant="secondary" className="bg-indigo-100 text-indigo-700">
                {guideCount}+
              </Badge>
            )}
          </Link>

          {/* Car Rentals - Always available */}
          <Link 
            href={`/destinations/${destinationId}/car-rentals`}
            className="flex items-center gap-2 whitespace-nowrap font-semibold text-gray-900 hover:text-green-600 transition-colors border-b-2 border-transparent hover:border-green-600 pb-1"
          >
            <Car className="w-4 h-4" />
            <span>Car Rentals</span>
          </Link>

          {/* Restaurants - Optional */}
          {hasRestaurants && (
            <Link 
              href={`/destinations/${destinationId}/restaurants`}
              className="flex items-center gap-2 whitespace-nowrap font-semibold text-gray-900 hover:text-purple-600 transition-colors border-b-2 border-transparent hover:border-purple-600 pb-1"
            >
              <span>Restaurants</span>
              {showCounts && restaurantCount !== null && (
                <Badge variant="secondary" className="bg-purple-100 text-purple-700">
                  {restaurantCount}+
                </Badge>
              )}
            </Link>
          )}

          {/* Airport Transfers - Optional */}
          {hasAirportTransfers && (
            <Link 
              href={`/destinations/${destinationId}/guides/airport-transfers`}
              className="flex items-center gap-2 whitespace-nowrap font-semibold text-gray-900 hover:text-cyan-600 transition-colors border-b-2 border-transparent hover:border-cyan-600 pb-1"
            >
              <span>Airport Transfers</span>
            </Link>
          )}

          {/* Baby Equipment Rentals - Optional */}
          {hasBabyEquipment && (
            <Link 
              href={`/destinations/${destinationId}/baby-equipment-rentals`}
              className="flex items-center gap-2 whitespace-nowrap font-semibold text-gray-900 hover:text-pink-600 transition-colors border-b-2 border-transparent hover:border-pink-600 pb-1"
            >
              <Baby className="w-4 h-4" />
              <span>Baby Equipment</span>
            </Link>
          )}
        </nav>
      </div>
    </section>
  );
}
