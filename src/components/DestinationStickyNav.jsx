"use client";

import Link from 'next/link';
import { ArrowRight, BookOpen, Baby, Shield, Plane, UtensilsCrossed, Building2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import PrefetchOnHoverLink from '@/components/PrefetchOnHoverLink';
import { destinationHasTravelInsurancePage } from '@/lib/destinationTravelInsurance';
import { isOperatorPilotDestination } from '@/data/operatorPilotDestinations';

/**
 * Reusable sticky navigation for destination hub and sub-pages.
 */
export default function DestinationStickyNav({
  destinationId,
  destinationName,
  toursLinkText = null,
  activeKey = null,
  showCounts = false,
  tourCount = null,
  guideCount = null,
  hasRestaurants = false,
  restaurantCount = null,
  hasAirportTransfers = false,
  hasBabyEquipment = false,
  showBrowseButton = false,
}) {
  if (!destinationId) {
    return null;
  }

  const displayName = destinationName || destinationId;
  const travelInsuranceHref = destinationHasTravelInsurancePage(destinationId)
    ? `/destinations/${destinationId}/travel-insurance`
    : '/travel-insurance';
  const showOperators = isOperatorPilotDestination(destinationId);

  const itemClass = (key) => {
    const isActive = activeKey === key || (activeKey === 'hub' && key === 'tours');
    return [
      'flex items-center gap-2 whitespace-nowrap font-semibold transition-colors border-b-2 pb-1 shrink-0',
      isActive
        ? 'text-blue-700 border-blue-600'
        : 'text-gray-900 border-transparent hover:text-blue-600 hover:border-blue-600',
    ].join(' ');
  };

  return (
    <section className="sticky top-16 z-40 bg-white border-b shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 py-3 sm:py-2">
        <nav className="flex items-center gap-5 sm:gap-6 py-1 overflow-x-auto hide-scrollbar min-w-0 flex-1">
          {activeKey !== 'hub' && (
            <Link href={`/destinations/${destinationId}`} className={itemClass('hub')}>
              <span>Explore {displayName}</span>
            </Link>
          )}

          <Link href={`/destinations/${destinationId}/tours`} className={itemClass('tours')}>
            <span>{toursLinkText || 'Tours'}</span>
            {showCounts && tourCount != null && tourCount > 0 && (
              <Badge variant="secondary" className="bg-blue-100 text-blue-700">
                {tourCount.toLocaleString('en-US')}+
              </Badge>
            )}
          </Link>

          <Link href={`/destinations/${destinationId}/guides`} className={itemClass('guides')}>
            <BookOpen className="w-4 h-4 shrink-0" aria-hidden />
            <span>Guides</span>
            {showCounts && guideCount != null && guideCount > 0 && (
              <Badge variant="secondary" className="bg-indigo-100 text-indigo-700">
                {guideCount}+
              </Badge>
            )}
          </Link>

          {showOperators && (
            <Link href={`/destinations/${destinationId}/operators`} className={itemClass('operators')}>
              <Building2 className="w-4 h-4 shrink-0" aria-hidden />
              <span>Operators</span>
            </Link>
          )}

          {hasRestaurants && (
            <Link href={`/destinations/${destinationId}/restaurants`} className={itemClass('restaurants')}>
              <UtensilsCrossed className="w-4 h-4 shrink-0" aria-hidden />
              <span>Restaurants</span>
              {showCounts && restaurantCount != null && restaurantCount > 0 && (
                <Badge variant="secondary" className="bg-rose-100 text-rose-700">
                  {restaurantCount}+
                </Badge>
              )}
            </Link>
          )}

          <Link href={travelInsuranceHref} className={itemClass('travel-insurance')}>
            <Shield className="w-4 h-4 shrink-0" aria-hidden />
            <span>Travel Insurance</span>
          </Link>

          {hasAirportTransfers && (
            <Link
              href={`/destinations/${destinationId}/guides/airport-transfers`}
              className={itemClass('airport-transfers')}
            >
              <Plane className="w-4 h-4 shrink-0" aria-hidden />
              <span>Airport Transfers</span>
            </Link>
          )}

          {hasBabyEquipment && (
            <Link
              href={`/destinations/${destinationId}/baby-equipment-rentals`}
              className={itemClass('baby-equipment')}
            >
              <Baby className="w-4 h-4 shrink-0" aria-hidden />
              <span>Baby Equipment</span>
            </Link>
          )}
        </nav>

        {showBrowseButton && (
          <div className="flex items-center gap-2 shrink-0 sm:pl-2">
            <Button
              asChild
              size="sm"
              className="w-full sm:w-auto sunset-gradient text-white font-semibold shadow-md hover:scale-[1.02] transition-transform"
            >
              <PrefetchOnHoverLink
                href={`/destinations/${destinationId}/tours`}
                className="inline-flex items-center justify-center gap-1.5"
              >
                Browse tours
                <ArrowRight className="w-4 h-4 shrink-0" />
              </PrefetchOnHoverLink>
            </Button>
          </div>
        )}
      </div>
    </section>
  );
}
