"use client";
import React from 'react';
import Link from 'next/link';
import { ArrowRight, MapPin } from 'lucide-react';
import { HOME_POPULAR_DESTINATION_LINKS } from '@/data/homePopularDestinationLinks';
import { SITE_STATS } from '@/lib/siteStats';

const DestinationLinksFooter = () => {
  return (
    <section className="py-10 bg-gray-50 border-t border-gray-200">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <div className="flex items-center justify-center gap-2 mb-2">
          <MapPin className="w-5 h-5 text-purple-600" aria-hidden />
          <h2 className="text-lg font-bold text-gray-900">Popular destinations</h2>
        </div>
        <p className="text-sm text-gray-600 mb-5">
          Hand-picked from {SITE_STATS.destinationsLabel} — tours, guides, and trip ideas
        </p>
        <div className="flex flex-wrap gap-2 justify-center">
          {HOME_POPULAR_DESTINATION_LINKS.map((destination) => (
            <Link
              key={destination.id}
              href={`/destinations/${destination.id}`}
              className="inline-flex items-center rounded-full bg-white border border-gray-200 px-3.5 py-1.5 text-sm text-gray-700 hover:text-purple-700 hover:border-purple-300 hover:bg-purple-50 transition-colors"
            >
              {destination.label}
            </Link>
          ))}
        </div>
        <Link
          href="/destinations"
          className="inline-flex items-center gap-1 mt-6 text-sm font-semibold text-purple-600 hover:text-purple-700"
        >
          View all {SITE_STATS.destinations} destinations
          <ArrowRight className="w-3.5 h-3.5" aria-hidden />
        </Link>
      </div>
    </section>
  );
};

export default DestinationLinksFooter;
