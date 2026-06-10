'use client';

import { useMemo } from 'react';
import Image from 'next/image';
import {
  ArrowRight,
  Heart,
  Users,
  Mountain,
  Loader2,
  Star,
  Clock,
  Ship,
  UtensilsCrossed,
  Lightbulb,
  Wallet,
  Compass,
} from 'lucide-react';
import PrefetchOnHoverLink from '@/components/PrefetchOnHoverLink';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { resolveHubPicksConfig } from '@/lib/destinationHubPicks';
import { getTourProductId, getTourUrl } from '@/utils/tourHelpers';

const BLUR =
  'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAAIAAoDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAhEAACAQMDBQAAAAAAAAAAAAABAgMABAUGIWGRkqGx0f/EABUBAQEAAAAAAAAAAAAAAAAAAAMF/8QAGhEAAgIDAAAAAAAAAAAAAAAAAAECEgMRkf/aAAwDAQACEQMRAD8AltJagyeH0AthI5xdrLcNM91BF5pX2HaH9bcfaSXWGaRmknyJckliyjqTzSlT54b6bk+h0R//2Q==';

const SECTION_META = {
  couples: { icon: Heart, accent: 'from-rose-500/10 to-pink-50 border-rose-200/60' },
  families: { icon: Users, accent: 'from-sky-500/10 to-blue-50 border-sky-200/60' },
  adventure: { icon: Mountain, accent: 'from-emerald-500/10 to-green-50 border-emerald-200/60' },
  cruise: { icon: Ship, accent: 'from-violet-500/10 to-purple-50 border-violet-200/60' },
  budget: { icon: Wallet, accent: 'from-lime-500/10 to-green-50 border-lime-200/60' },
  solo: { icon: Compass, accent: 'from-indigo-500/10 to-violet-50 border-indigo-200/60' },
  culture: { icon: UtensilsCrossed, accent: 'from-amber-500/10 to-orange-50 border-amber-200/60' },
};

function getTourImage(tour, destination) {
  const variants = tour?.images?.[0]?.variants;
  if (Array.isArray(variants) && variants.length > 0) {
    const best = [...variants].sort((a, b) => (b.width || 0) - (a.width || 0))[0];
    if (best?.url) return best.url;
  }
  return tour?.tour_image_url || destination?.imageUrl || '';
}

function formatPrice(tour) {
  const price =
    tour?.pricing?.summary?.fromPrice ?? tour?.price ?? tour?.fromPrice ?? null;
  if (price == null || price === 0) return null;
  const n = Number(price);
  if (!Number.isFinite(n)) return null;
  return `From $${n % 1 === 0 ? n.toFixed(0) : n.toFixed(2)}`;
}

function getTourDurationLabel(tour) {
  const minutes =
    tour?.itinerary?.duration?.fixedDurationInMinutes ||
    tour?.duration?.fixedDurationInMinutes ||
    tour?.duration?.variableDurationFromMinutes ||
    (typeof tour?.duration === 'number' ? tour.duration : null);
  if (!minutes) return null;
  if (minutes < 60) return `${minutes} min`;
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  if (mins === 0) return `${hours}h`;
  return `${hours}h ${mins}m`;
}

function PickCard({ pick, destination, priority = false }) {
  const tour = pick.tour;
  const display = pick.display;
  const productId = (tour ? getTourProductId(tour) : null) || pick.productCode || null;
  const title = pick.resolvedTitle;
  const href = productId
    ? getTourUrl(productId, title)
    : `/destinations/${destination.id}/tours`;
  const image =
    display?.imageUrl || (tour ? getTourImage(tour, destination) : '') || destination?.imageUrl || '';
  const price = formatPrice(tour, display);
  const rating =
    display?.rating ?? tour?.reviews?.combinedAverageRating ?? tour?.rating ?? null;
  const reviews =
    display?.reviewCount ?? tour?.reviews?.totalReviews ?? tour?.review_count ?? null;
  const duration = getTourDurationLabel(tour, display);

  return (
    <article className="flex flex-col h-full">
      <PrefetchOnHoverLink href={href} className="group block">
        <div className="relative aspect-[4/3] rounded-2xl overflow-hidden bg-slate-100 shadow-md ring-1 ring-black/5">
          {image ? (
            <Image
              src={image}
              alt={title}
              fill
              sizes="(max-width: 768px) 100vw, 33vw"
              className="object-cover transition-transform duration-500 group-hover:scale-105"
              priority={priority}
              placeholder="blur"
              blurDataURL={BLUR}
            />
          ) : (
            <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-primary/5" />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-transparent to-transparent" />
          <Badge className="absolute top-3 left-3 bg-white/95 text-gray-900 border-0 shadow-sm font-semibold text-xs max-w-[85%] truncate">
            {pick.label}
          </Badge>
          {price && (
            <span className="absolute bottom-3 right-3 rounded-lg bg-white/95 px-2.5 py-1 text-sm font-bold text-gray-900 shadow-sm">
              {price}
            </span>
          )}
        </div>

        <div className="mt-4">
          <h4 className="font-semibold text-gray-900 leading-snug line-clamp-2 group-hover:text-primary transition-colors">
            {title}
          </h4>
          <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-gray-600">
            {rating ? (
              <span className="inline-flex items-center gap-1 font-medium text-gray-800">
                <Star className="w-4 h-4 text-amber-500 fill-amber-500 shrink-0" aria-hidden />
                {Number(rating).toFixed(1)}
                {reviews ? (
                  <span className="text-gray-500 font-normal">
                    ({Number(reviews).toLocaleString('en-US')})
                  </span>
                ) : null}
              </span>
            ) : null}
            {duration ? (
              <span className="inline-flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 shrink-0" aria-hidden />
                {duration}
              </span>
            ) : null}
          </div>
        </div>
      </PrefetchOnHoverLink>

      <div className="mt-3 flex-1 flex flex-col">
        {pick.bestFor ? (
          <p className="text-xs font-medium text-primary mb-2">
            Best for: {pick.bestFor}
          </p>
        ) : null}
        <p className="text-sm text-slate-600 leading-relaxed rounded-xl bg-slate-50 border border-slate-100 px-4 py-3 flex-1">
          {pick.why}
        </p>
        <Button
          asChild
          size="sm"
          className="mt-3 w-full sunset-gradient text-white font-semibold"
        >
          <PrefetchOnHoverLink href={href}>
            Check availability
            <ArrowRight className="w-4 h-4 ml-1.5" />
          </PrefetchOnHoverLink>
        </Button>
      </div>
    </article>
  );
}

function PickCardSkeleton() {
  return (
    <div className="animate-pulse">
      <div className="aspect-[4/3] rounded-2xl bg-slate-200" />
      <div className="mt-4 h-5 bg-slate-200 rounded w-3/4" />
      <div className="mt-2 h-4 bg-slate-100 rounded w-1/2" />
      <div className="mt-3 h-24 bg-slate-100 rounded-xl" />
    </div>
  );
}

export default function DestinationHubCuratedPicks({
  config,
  tours = [],
  destination,
  loading = false,
  totalToursCount = null,
}) {
  const resolved = useMemo(() => resolveHubPicksConfig(config, tours), [config, tours]);

  if (!resolved) return null;

  const showSkeleton = loading;

  const destinationLabel = destination?.fullName || destination?.name || 'destination';
  const toursUrl = `/destinations/${destination.id}/tours`;

  return (
    <section id="curated-tours" className="py-10 sm:py-14 bg-gradient-to-b from-slate-50 to-white border-b scroll-mt-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-10">
          <div>
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 font-poppins">
              {resolved.headline}
            </h2>
            <p className="text-gray-600 mt-1 text-sm sm:text-base max-w-2xl">
              {resolved.subheadline}
            </p>
          </div>
          <Button
            asChild
            variant="outline"
            className="border-blue-200 text-blue-700 hover:bg-blue-50 shrink-0 self-start sm:self-auto"
          >
            <PrefetchOnHoverLink href={toursUrl}>
              Browse all {totalToursCount ? totalToursCount.toLocaleString('en-US') : ''} tours
              <ArrowRight className="w-4 h-4 ml-2" />
            </PrefetchOnHoverLink>
          </Button>
        </div>

        {showSkeleton ? (
          <div className="space-y-12">
            {[0, 1, 2].map((i) => (
              <div key={i}>
                <div className="h-8 w-40 bg-slate-200 rounded-lg mb-6 animate-pulse" />
                <div className="grid md:grid-cols-3 gap-6">
                  <PickCardSkeleton />
                  <PickCardSkeleton />
                  <PickCardSkeleton />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <>
            <div className="space-y-12 sm:space-y-14">
              {resolved.travelerSections.map((section) => {
                const meta = SECTION_META[section.id] || SECTION_META.couples;
                const Icon = meta.icon;
                return (
                  <div
                    key={section.id}
                    className={`rounded-3xl border bg-gradient-to-br p-6 sm:p-8 ${meta.accent}`}
                  >
                    <div className="mb-6">
                      <h3 className="flex items-center gap-3 text-xl sm:text-2xl font-bold text-gray-900 font-poppins">
                        <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-white shadow-sm text-primary shrink-0">
                          <Icon className="h-5 w-5" aria-hidden />
                        </span>
                        {section.title}
                      </h3>
                      {section.description ? (
                        <p className="mt-3 text-sm sm:text-base text-slate-700 leading-relaxed w-full">
                          {section.description}
                        </p>
                      ) : null}
                    </div>
                    <div className="grid md:grid-cols-3 gap-6 lg:gap-8">
                      {section.picks.map((pick, index) => (
                        <PickCard
                          key={pick.titleMatch}
                          pick={pick}
                          destination={destination}
                          priority={index === 0}
                        />
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>

            {resolved.quickAnswers?.length > 0 && (
              <div className="mt-12 rounded-2xl border border-slate-200 bg-white p-6 sm:p-8 shadow-sm">
                <h3 className="flex items-center gap-2 text-lg font-bold text-gray-900 font-poppins mb-4">
                  <Lightbulb className="w-5 h-5 text-amber-500" aria-hidden />
                  Quick answers
                </h3>
                <ul className="space-y-3">
                  {resolved.quickAnswers.map((item) => {
                    const tour = item.tour;
                    const productId =
                      (tour ? getTourProductId(tour) : null) || item.productCode || null;
                    const href = productId
                      ? getTourUrl(productId, item.resolvedTitle)
                      : toursUrl;
                    return (
                      <li key={item.label} className="text-sm text-slate-700">
                        <span className="font-semibold text-gray-900">{item.label}: </span>
                        {productId ? (
                          <PrefetchOnHoverLink href={href} className="hover:text-primary underline-offset-2 hover:underline">
                            {item.text}
                          </PrefetchOnHoverLink>
                        ) : (
                          item.text
                        )}
                      </li>
                    );
                  })}
                </ul>
              </div>
            )}

            <div className="text-center mt-12">
              <Button
                asChild
                size="lg"
                className="sunset-gradient text-white font-semibold hover:scale-[1.02] transition-transform px-8"
              >
                <PrefetchOnHoverLink href={toursUrl}>
                  {totalToursCount
                    ? `Browse all ${totalToursCount.toLocaleString('en-US')} ${destinationLabel} tours & filters`
                    : `Browse all ${destinationLabel} tours & filters`}
                  <ArrowRight className="w-5 h-5 ml-2" />
                </PrefetchOnHoverLink>
              </Button>
              <p className="text-sm text-gray-500 mt-2">
                Category, price, duration, and search on the full tours page
              </p>
            </div>
          </>
        )}
      </div>
    </section>
  );
}
