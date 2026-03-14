'use client';

import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight, MapPin } from 'lucide-react';
import { getTourUrl } from '@/utils/tourHelpers';

/**
 * Grid of tour cards for explore tours listing (Aru365-style).
 */
export default function ExploreToursListingClient({ tours = [], destinationSlug, destinationName }) {
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
        const href = tour.tourSlug && tour.categorySlug
          ? `/explore/${destinationSlug}/${tour.categorySlug}/${tour.tourSlug}`
          : getTourUrl(tour.productId, tour.title);
        const imageUrl = tour.imageUrl ?? tour.image_url ?? null;
        const priceDisplay = tour.fromPrice || 'From price on request';
        const hasRating = typeof tour.rating === 'number' && tour.rating > 0 && typeof tour.reviewCount === 'number' && tour.reviewCount > 0;

        return (
          <Link
            key={`${tour.categorySlug}-${tour.productId}`}
            href={href}
            className="group flex flex-col rounded-2xl border-2 border-gray-100 bg-white p-6 text-left transition-all duration-300 hover:border-primary/40 hover:shadow-xl hover:-translate-y-1 min-h-0"
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
            <p className="text-xs font-medium text-primary uppercase tracking-wider mt-2">
              {tour.categoryTitle.replace(new RegExp(`\\s+in\\s+${destinationName}$`, 'i'), '').trim() || tour.categoryTitle}
            </p>
            <h2 className="font-poppins font-bold text-lg text-gray-900 mt-1 group-hover:text-primary transition-colors line-clamp-2">
              {tour.title}
            </h2>
            <div className="mt-2 flex flex-wrap items-center gap-x-2 gap-y-1 text-sm">
              {hasRating && (
                <span className="inline-flex items-center gap-1 font-semibold text-gray-800">
                  <svg className="w-4 h-4 text-amber-500 shrink-0 fill-amber-500" viewBox="0 0 20 20" aria-hidden>
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                  {Number(tour.rating).toFixed(1)}
                </span>
              )}
              {hasRating && tour.reviewCount > 0 && <span className="text-gray-400">·</span>}
              {tour.reviewCount > 0 && (
                <span className="text-gray-500">{tour.reviewCount.toLocaleString('en-US')} reviews</span>
              )}
            </div>
            <div className="mt-auto pt-4 flex flex-wrap items-center justify-between gap-3">
              <p className="text-gray-500 text-sm">{priceDisplay}</p>
              <span className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-white bg-primary group-hover:opacity-90 transition-opacity shadow-sm">
                View &amp; Book
                <ArrowRight className="w-4 h-4" />
              </span>
            </div>
          </Link>
        );
      })}
    </div>
  );
}
