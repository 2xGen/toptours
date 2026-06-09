'use client';

import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight, MapPin } from 'lucide-react';
import { getTourUrl } from '@/utils/tourHelpers';

export default function V3ToursListingClient({ tours = [], destinationName }) {
  if (tours.length === 0) {
    return (
      <div className="rounded-2xl border-2 border-dashed border-gray-200 bg-gray-50/50 py-16 text-center">
        <p className="text-gray-500">No tours in this category yet. Try &quot;All categories&quot; or check back later.</p>
      </div>
    );
  }

  return (
    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl">
      {tours.map((tour) => {
        const href = getTourUrl(tour.productId, tour.title);
        const imageUrl = tour.imageUrl ?? tour.image_url ?? null;
        const priceDisplay = tour.fromPrice || 'From price on request';
        const hasRating = typeof tour.rating === 'number' && tour.rating > 0 && typeof tour.reviewCount === 'number' && tour.reviewCount > 0;

        return (
          <Link
            key={`${tour.categorySlug}-${tour.productId}`}
            href={href}
            className="group flex flex-col rounded-2xl border-2 border-gray-100 bg-white p-6 text-left shadow-sm transition-all duration-300 hover:border-primary/40 hover:shadow-xl hover:-translate-y-1 min-h-0"
          >
            <div className="aspect-[16/10] w-full overflow-hidden rounded-xl bg-primary/5">
              {imageUrl ? (
                <Image
                  src={imageUrl}
                  alt=""
                  width={400}
                  height={250}
                  className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
              ) : (
                <div className="h-full w-full flex items-center justify-center text-primary/40">
                  <MapPin className="w-12 h-12" />
                </div>
              )}
            </div>
            <h3 className="mt-4 font-semibold text-gray-900 group-hover:text-primary line-clamp-2">
              {tour.title}
            </h3>
            {destinationName && (
              <p className="mt-1 text-sm text-gray-500">{destinationName}</p>
            )}
            <div className="mt-auto pt-4 flex items-center justify-between gap-2">
              <span className="text-sm font-semibold text-gray-800">{priceDisplay}</span>
              {hasRating && (
                <span className="text-xs text-gray-500">
                  {tour.rating.toFixed(1)} ({tour.reviewCount})
                </span>
              )}
            </div>
            <span className="mt-3 inline-flex items-center text-sm font-semibold text-primary">
              View tour
              <ArrowRight className="ml-1 h-4 w-4" />
            </span>
          </Link>
        );
      })}
    </div>
  );
}
