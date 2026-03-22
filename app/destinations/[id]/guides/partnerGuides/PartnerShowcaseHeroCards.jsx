'use client';

import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { MapPin, Star, Crown, ExternalLink } from 'lucide-react';
import { getTourUrl, withViatorAffiliateParams } from '@/utils/tourHelpers';

function formatDurationHours(hours) {
  if (hours == null || Number.isNaN(Number(hours))) return null;
  const h = Number(hours);
  if (h >= 24) {
    const d = Math.round(h / 24);
    return `${d} day${d === 1 ? '' : 's'}`;
  }
  return `${h} hours`;
}

/**
 * Tour-detail hero styling: gradient panel, 4:3 image, soft shadow (matches TourDetailClient primary hero card).
 */
export default function PartnerShowcaseHeroCards({
  tours = [],
  operatorLabel = 'Kiliclimb Africa Safaris',
}) {
  if (!Array.isArray(tours) || tours.length === 0) return null;

  return (
    <section className="bg-white border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-12">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45 }}
          className="text-center max-w-3xl mx-auto mb-10"
        >
          <div className="inline-flex items-center gap-2 rounded-full border border-amber-200/80 bg-amber-50/90 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-amber-900 mb-3">
            <Crown className="w-3.5 h-3.5 text-amber-600" aria-hidden />
            Premium partner
          </div>
          <h2 className="text-2xl sm:text-3xl font-poppins font-bold text-gray-900 mb-2">
            Hand-picked Tanzania departures
          </h2>
          <p className="text-gray-600 text-sm sm:text-base leading-relaxed">
            Compare these experiences on TopTours with {operatorLabel}, then finish on our partner checkout with live
            availability. Affiliate disclosure applies to outbound booking links.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-5 gap-6">
          {tours.map((tour, index) => {
            const title = tour.title || 'Tour';
            const pid = tour.productId;
            if (!pid) return null;
            const topToursUrl = getTourUrl(pid, title);
            const bookUrl = withViatorAffiliateParams(tour.viatorBookingUrl || '');
            const durationLabel = formatDurationHours(tour.durationHours);
            const price =
              tour.priceFrom != null && !Number.isNaN(Number(tour.priceFrom))
                ? `From $${Math.round(Number(tour.priceFrom))}`
                : null;
            const rating = tour.rating != null ? Number(tour.rating) : null;
            const reviews = tour.reviewCount != null ? Number(tour.reviewCount) : null;

            return (
              <motion.article
                key={`${pid}-${index}`}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: index * 0.05 }}
                className="rounded-3xl border border-gray-200/90 bg-gradient-to-br from-white via-[#f9fafb] to-[#f3f6fb] p-6 sm:p-7 shadow-[0_18px_42px_rgba(15,23,42,0.08)] flex flex-col h-full"
              >
                <div className="relative rounded-2xl overflow-hidden bg-gray-100 aspect-[4/3] shadow-[0_10px_28px_rgba(15,23,42,0.12)] mb-4">
                  {tour.imageUrl ? (
                    <Image
                      src={tour.imageUrl}
                      alt=""
                      width={480}
                      height={360}
                      className="h-full w-full object-cover"
                      sizes="(max-width: 640px) 100vw, (max-width: 1280px) 50vw, 20vw"
                      unoptimized
                    />
                  ) : (
                    <div className="h-full w-full flex items-center justify-center text-gray-400 min-h-[160px]">
                      <MapPin className="w-12 h-12 opacity-40" aria-hidden />
                    </div>
                  )}
                </div>

                <p className="flex items-center gap-1.5 text-xs font-medium text-primary uppercase tracking-wider mb-2">
                  <MapPin className="w-3.5 h-3.5 shrink-0" aria-hidden />
                  <span className="line-clamp-2">{tour.tagLabel || 'Tanzania'}</span>
                </p>

                <h3 className="font-semibold text-gray-900 text-base leading-snug mb-3 line-clamp-3 min-h-[3.75rem]">
                  {title}
                </h3>

                <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-gray-600 mb-3">
                  {durationLabel && <span>{durationLabel}</span>}
                  {price && <span className="font-semibold text-emerald-800">{price}</span>}
                </div>

                {rating != null && rating > 0 && (
                  <div className="flex items-center gap-1.5 text-sm text-gray-700 mb-4">
                    <Star className="w-4 h-4 text-amber-500 fill-amber-400 shrink-0" aria-hidden />
                    <span className="font-medium">{rating.toFixed(1)}</span>
                    {reviews != null && reviews > 0 && (
                      <span className="text-gray-500">({reviews} reviews)</span>
                    )}
                  </div>
                )}

                <div className="mt-auto flex flex-col gap-2 pt-2">
                  <Link
                    href={topToursUrl}
                    className="inline-flex items-center justify-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-semibold text-gray-900 shadow-sm transition-colors hover:bg-gray-50"
                  >
                    View on TopTours
                  </Link>
                  {bookUrl ? (
                    <a
                      href={bookUrl}
                      target="_blank"
                      rel="nofollow sponsored noopener noreferrer"
                      className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground shadow-sm transition-opacity hover:opacity-95"
                    >
                      Check availability
                      <ExternalLink className="w-4 h-4 shrink-0" aria-hidden />
                    </a>
                  ) : null}
                </div>
              </motion.article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
