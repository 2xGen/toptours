'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  ArrowRight,
  CheckCircle2,
  HelpCircle,
  Star,
  MapPin,
  ExternalLink,
  Lightbulb,
  Users,
  Sparkles,
} from 'lucide-react';
import { getTourUrl, getViatorAffiliateTourUrl } from '@/utils/tourHelpers';

/** Primary CTA — signals full product page + dates on partner site (A/B vs shorter “Check availability”). */
const VIATOR_CTA_LABEL = 'Check Availability & Book on Viator';

function ExploreBetweenSectionsCta({ bookUrl, headline, subline }) {
  if (!bookUrl) return null;
  return (
    <div className="rounded-xl border border-[#00AA6C]/30 bg-gradient-to-br from-[#f2fbf7] to-white px-4 py-4 shadow-[0_8px_24px_rgba(0,170,108,0.08)] sm:px-5">
      <a
        href={bookUrl}
        target="_blank"
        rel="sponsored noopener noreferrer"
        className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[#00AA6C] px-4 py-3 text-center text-sm font-semibold leading-snug text-white transition-colors hover:bg-[#008855]"
      >
        <span className="min-w-0">{headline}</span>
        <ExternalLink className="h-4 w-4 shrink-0" aria-hidden />
      </a>
      {subline ? (
        <p className="mt-2.5 text-center text-xs leading-snug text-gray-600">{subline}</p>
      ) : null}
    </div>
  );
}

/**
 * Aru365-style single tour page for explore: hero, intro, what's included, itinerary, similar tours, FAQ, CTA.
 * Data from Viator tour object (getCachedTour). Optional tourSeo from DB: unique copy, who is this for, insider tips, FAQs.
 */
export default function ExploreTourDetailClient({
  tour,
  tourSummary = null,
  productId,
  destinationSlug,
  categorySlug,
  categoryTitle,
  destinationName,
  categoryHref,
  relatedTours = [],
  tourSeo = null,
}) {
  const [travelers, setTravelers] = useState(1);
  /** First FAQ open by default; React <details> does not support defaultOpen in this stack — use controlled open. */
  const [openFaqIndices, setOpenFaqIndices] = useState(() => new Set([0]));

  useEffect(() => {
    setOpenFaqIndices(new Set([0]));
  }, [productId]);

  const formatCurrency = (value) =>
    new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(value);

  const displayTitle = tour?.title || 'Tour';
  const operator = tour?.supplier?.name || tour?.supplierName || 'Tour operator';
  const rating = tour?.reviews?.combinedAverageRating ?? tour?.reviews?.averageRating ?? tourSummary?.rating ?? tourSeo?.rating ?? 0;
  const reviewCount = tour?.reviews?.totalReviews ?? tourSummary?.reviewCount ?? tourSeo?.reviewCount ?? 0;
  const hasRating = rating > 0 && reviewCount > 0;

  const pricing = tour?.pricingInfo ?? tour?.pricing;
  let priceDisplay = 'Price from (see options)';
  let numericPrice = null;
  if (pricing) {
    const fromPrice =
      pricing.priceFrom ?? pricing.fromPrice ?? pricing.recommendedRetailPrice ?? pricing.minPrice;
    if (typeof fromPrice === 'number') {
      numericPrice = fromPrice;
      priceDisplay = `From ${formatCurrency(fromPrice)}`;
    } else if (typeof pricing.summary === 'string' && pricing.summary.trim()) {
      priceDisplay = pricing.summary.trim();
    }
  }
  // Use bulk/schedules price when full product API doesn't provide a numeric price
  if (priceDisplay === 'Price from (see options)' && tourSummary?.fromPriceDisplay) {
    priceDisplay = tourSummary.fromPriceDisplay;
    if (typeof tourSummary.fromPrice === 'number') numericPrice = tourSummary.fromPrice;
  }
  if (priceDisplay === 'Price from (see options)' && tourSeo?.fromPrice && typeof tourSeo.fromPrice === 'string') {
    priceDisplay = tourSeo.fromPrice.trim();
  }

  // Fallback numeric parsing from string prices like "From $87.50"
  if (numericPrice === null && typeof priceDisplay === 'string') {
    const match = priceDisplay.replace(/,/g, '').match(/(\d+(?:\.\d{1,2})?)/);
    if (match) {
      const parsed = Number.parseFloat(match[1]);
      if (Number.isFinite(parsed)) numericPrice = parsed;
    }
  }

  const estimatedTotal = useMemo(
    () => (typeof numericPrice === 'number' ? numericPrice * travelers : null),
    [numericPrice, travelers]
  );

  const bookingPriceLabel = typeof numericPrice === 'number' ? `From ${formatCurrency(numericPrice)}` : priceDisplay;
  const hasInstantConfirmation = Array.isArray(tour?.flags)
    ? tour.flags.some((flag) => typeof flag === 'string' && flag.toLowerCase().includes('instant'))
    : false;
  const hasFreeCancellation = typeof tour?.cancellationPolicy?.description === 'string'
    ? /free cancellation/i.test(tour.cancellationPolicy.description)
    : false;
  const heroFromPriceLabel =
    typeof estimatedTotal === 'number'
      ? `From ${formatCurrency(estimatedTotal)} for ${travelers} traveler${travelers > 1 ? 's' : ''}`
      : bookingPriceLabel;

  const bookUrl =
    getViatorAffiliateTourUrl({ productUrl: tour?.productUrl, destinationSlug, productCode: productId })
    || tour?.productUrl
    || getViatorAffiliateTourUrl({ destinationSlug, productCode: productId });

  const imageUrl = (() => {
    const imgs = tour?.images;
    if (!imgs?.length) return null;
    const cover = imgs.find((i) => i.isCover) || imgs[0];
    const variants = cover?.variants;
    if (Array.isArray(variants) && variants.length > 0) {
      const best = variants.reduce((a, b) => {
        const areaA = (a.width || 0) * (a.height || 0);
        const areaB = (b.width || 0) * (b.height || 0);
        return areaB > areaA ? b : a;
      });
      return best?.url || variants[0]?.url || null;
    }
    return cover?.url ?? null;
  })();

  const description = (() => {
    if (typeof tourSeo?.seoAbout === 'string' && tourSeo.seoAbout.trim()) return tourSeo.seoAbout.trim();
    const d = tour?.description;
    if (typeof d === 'string' && d.trim()) return d.trim();
    if (d?.summary) return d.summary;
    if (d?.shortDescription) return d.shortDescription;
    if (d?.description) return d.description;
    return '';
  })();

  const inclusions = (() => {
    const inc = tour?.inclusions;
    let list = [];
    if (Array.isArray(inc) && inc.length > 0) {
      list = inc
        .map((item) =>
          typeof item === 'string' ? item : item?.description || item?.name || item?.otherDescription || ''
        )
        .filter(Boolean);
    } else {
      const included = tour?.inclusions?.includedItems || tour?.inclusions?.included || tour?.productContent?.inclusions?.included;
      if (Array.isArray(included)) {
        list = included
          .map((item) => (typeof item === 'string' ? item : item?.description || item?.name || ''))
          .filter(Boolean);
      }
    }
    // For bike/cycling tours, ensure "Helmets" appears in What's included when not already stated
    const isBikeTour = /\b(bike|bicycle|cycling|cycle)\b/i.test((displayTitle || '') + ' ' + (description || ''));
    const hasHelmet = list.some((s) => /helmet/i.test(s));
    if (isBikeTour && !hasHelmet) list = [...list, 'Helmets provided'];
    return list;
  })();

  const exclusions = (() => {
    const exc = tour?.exclusions;
    if (Array.isArray(exc) && exc.length > 0) {
      return exc
        .map((item) =>
          typeof item === 'string' ? item : item?.description || item?.name || item?.otherDescription || ''
        )
        .filter(Boolean);
    }
    const excluded = tour?.exclusions?.excludedItems || tour?.exclusions?.excluded || tour?.productContent?.exclusions?.excluded;
    if (Array.isArray(excluded)) {
      return excluded
        .map((item) => (typeof item === 'string' ? item : item?.description || item?.name || ''))
        .filter(Boolean);
    }
    return [];
  })();

  const itinerarySteps = (() => {
    const items = tour?.itinerary?.itineraryItems;
    if (!Array.isArray(items) || items.length === 0) return [];
    return items.map((item, i) => ({
      stop: typeof item?.title === 'string' && item.title.trim() ? item.title.trim() : `Stop ${i + 1}`,
      description: typeof item?.description === 'string' ? item.description.trim() : '',
    })).filter((s) => s.description.length > 0);
  })();

  const faqs = (() => {
    if (Array.isArray(tourSeo?.faqs) && tourSeo.faqs.length > 0) return tourSeo.faqs;
    if (Array.isArray(tour?.faqs) && tour.faqs.length > 0) {
      return tour.faqs.map((f) => ({ question: f.question || f.q, answer: f.answer || f.a })).filter((f) => f.question && f.answer);
    }
    return [];
  })();

  const destinationHref = `/explore/${destinationSlug}`;
  const toursInDestinationHref = `/explore/${destinationSlug}/tours`;

  return (
    <article className="min-h-screen bg-[#f8f9fa] pb-36">
      {/* Sticky booking bar (mobile + desktop) */}
      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-gray-200 bg-white/95 backdrop-blur">
        <div className="mx-auto flex max-w-5xl flex-col gap-2 px-4 py-3 md:flex-row md:flex-wrap md:items-center md:gap-3 md:px-6">
          <div className="flex flex-wrap items-center gap-3 md:flex-1 md:min-w-0">
            <div className="min-w-0 flex-1">
              {hasRating && (
                <p className="text-xs font-semibold text-gray-700">
                  {Number(rating).toFixed(1)}★ {reviewCount.toLocaleString('en-US')}
                </p>
              )}
              <p className="text-sm font-semibold text-gray-900">{bookingPriceLabel} <span className="font-normal text-gray-500">per person</span></p>
              {estimatedTotal !== null && (
                <p className="text-xs text-gray-600">Est. Total: {formatCurrency(estimatedTotal)}</p>
              )}
            </div>
            <div className="inline-flex items-center rounded-lg border border-gray-200 bg-white">
              <button
                type="button"
                onClick={() => setTravelers((prev) => Math.max(1, prev - 1))}
                className="h-9 w-9 text-base font-semibold text-gray-700"
                aria-label="Decrease travelers"
              >
                -
              </button>
              <span className="w-9 text-center text-sm font-semibold text-gray-900">{travelers}</span>
              <button
                type="button"
                onClick={() => setTravelers((prev) => Math.min(20, prev + 1))}
                className="h-9 w-9 text-base font-semibold text-gray-700"
                aria-label="Increase travelers"
              >
                +
              </button>
            </div>
          </div>
          <div className="flex w-full md:w-auto md:min-w-[200px]">
            <a
              href={bookUrl}
              target="_blank"
              rel="sponsored noopener noreferrer"
              className="inline-flex w-full max-w-full items-center justify-center gap-2 rounded-lg bg-[#00AA6C] px-3 py-2.5 text-center text-xs font-semibold leading-snug text-white hover:bg-[#008855] sm:text-sm sm:px-4"
            >
              <span className="min-w-0">{VIATOR_CTA_LABEL}</span>
              <ExternalLink className="h-4 w-4 shrink-0" aria-hidden />
            </a>
          </div>
        </div>
      </div>

      {/* Single clean nav: breadcrumb + destination links */}
      <div className="bg-white border-b border-gray-100">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-3">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <nav className="flex items-center gap-2 text-sm text-gray-500" aria-label="Breadcrumb">
              <Link href={destinationHref} className="text-gray-600 hover:text-primary font-medium transition-colors">
                {destinationName}
              </Link>
              <span className="text-gray-300" aria-hidden>›</span>
              <Link href={categoryHref} className="text-gray-600 hover:text-primary font-medium transition-colors">
                {categoryTitle}
              </Link>
              <span className="text-gray-300" aria-hidden>›</span>
              <span className="text-gray-900 font-medium truncate max-w-[140px] sm:max-w-[240px]" title={displayTitle}>
                {displayTitle}
              </span>
            </nav>
            <div className="flex items-center gap-4 text-sm">
              <Link
                href={destinationHref}
                className="text-gray-500 hover:text-primary transition-colors hidden sm:inline"
              >
                Explore {destinationName}
              </Link>
              <Link
                href={toursInDestinationHref}
                className="text-gray-500 hover:text-primary transition-colors"
              >
                All tours
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Hero */}
      <section className="bg-white border-b border-gray-100">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-10">
          <div className="grid lg:grid-cols-5 gap-8 lg:gap-10 items-start rounded-3xl border border-gray-200/90 bg-gradient-to-br from-white via-[#f9fafb] to-[#f3f6fb] p-6 sm:p-7 lg:p-9 shadow-[0_18px_42px_rgba(15,23,42,0.08)]">
            <div className="lg:col-span-2 rounded-2xl overflow-hidden bg-gray-100 aspect-[4/3] lg:aspect-[4/3] lg:min-h-[260px] shadow-[0_10px_28px_rgba(15,23,42,0.12)]">
              {imageUrl ? (
                <Image
                  src={imageUrl}
                  alt=""
                  width={600}
                  height={400}
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="h-full w-full flex items-center justify-center text-gray-400">
                  <MapPin className="w-16 h-16 opacity-50" aria-hidden />
                </div>
              )}
            </div>
            <div className="lg:col-span-3">
              <span className="text-xs font-medium text-primary uppercase tracking-wider">
                {categoryTitle}
              </span>
              <h1 className="mt-2 font-poppins font-bold text-2xl sm:text-3xl text-gray-900 tracking-tight leading-tight">
                {displayTitle}
              </h1>
              <p className="mt-1.5 text-gray-500 text-sm">Operated by {operator}</p>
              {hasRating && (
                <div className="mt-4 flex items-center gap-2 text-sm">
                  <span className="inline-flex items-center gap-1 font-semibold text-gray-900">
                    <Star className="w-4 h-4 text-amber-500 fill-amber-500 shrink-0" />
                    {Number(rating).toFixed(1)}
                  </span>
                  <span className="text-gray-500">{reviewCount.toLocaleString('en-US')} reviews</span>
                </div>
              )}
              <div className="mt-6 rounded-2xl border border-gray-200/90 bg-white p-5 shadow-[0_10px_28px_rgba(15,23,42,0.08)] ring-1 ring-black/5">
                <p className="text-sm font-semibold text-gray-900">Book with confidence</p>
                <div className="mt-2 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <ul className="space-y-1.5 text-xs text-gray-700 sm:flex-1">
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-primary" aria-hidden />
                      <span>Get live availability and the latest price in real time.</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-primary" aria-hidden />
                      <span>
                        {hasInstantConfirmation
                          ? 'Instant confirmation is available on eligible timeslots.'
                          : 'Quick, clear checkout with confirmation details upfront.'}
                      </span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-primary" aria-hidden />
                      <span>
                        {hasFreeCancellation
                          ? 'Free cancellation is available on eligible bookings.'
                          : 'Flexible booking options are shown before you confirm.'}
                      </span>
                    </li>
                  </ul>

                  <div className="sm:ml-4 sm:min-w-[120px]">
                    <p className="text-[11px] font-semibold uppercase tracking-wide text-gray-500">Travelers</p>
                    <div className="mt-1 inline-flex items-center rounded-lg border border-gray-200 bg-white shadow-sm">
                      <button
                        type="button"
                        onClick={() => setTravelers((prev) => Math.max(1, prev - 1))}
                        className="h-8 w-8 text-base font-semibold text-gray-700 hover:bg-gray-50"
                        aria-label="Decrease travelers"
                      >
                        -
                      </button>
                      <span className="w-8 text-center text-sm font-semibold text-gray-900">{travelers}</span>
                      <button
                        type="button"
                        onClick={() => setTravelers((prev) => Math.min(20, prev + 1))}
                        className="h-8 w-8 text-base font-semibold text-gray-700 hover:bg-gray-50"
                        aria-label="Increase travelers"
                      >
                        +
                      </button>
                    </div>
                  </div>
                </div>

                <div className="mt-4 flex flex-col gap-3">
                  <div className="space-y-1">
                    <span className="text-xl font-semibold text-gray-900 block">{heroFromPriceLabel}</span>
                    <p className="text-xs text-gray-600">Prices vary by date — check yours instantly</p>
                  </div>
                  <a
                    href={bookUrl}
                    target="_blank"
                    rel="sponsored noopener noreferrer"
                    className="inline-flex max-w-full items-center justify-center gap-2 rounded-xl bg-[#00AA6C] px-4 py-3 text-center text-sm font-semibold leading-snug text-white transition-colors hover:bg-[#008855] sm:px-5 sm:text-base"
                  >
                    <span className="min-w-0">{VIATOR_CTA_LABEL}</span>
                    <ExternalLink className="h-4 w-4 shrink-0" aria-hidden />
                  </a>
                </div>
                <p className="mt-2 text-[11px] leading-snug text-gray-600" role="note">
                  Partner: <span className="font-medium">Viator</span>. &quot;{VIATOR_CTA_LABEL}&quot; opens in a new tab.{' '}
                  <Link
                    href="/disclosure"
                    className="font-medium text-primary underline decoration-primary/40 underline-offset-2 hover:decoration-primary"
                  >
                    Affiliate disclosure
                  </Link>
                  .
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Contextual Viator CTA */}
      <section className="py-4 lg:py-6">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-4xl">
          <ExploreBetweenSectionsCta
            bookUrl={bookUrl}
            headline="Pick your dates on Viator — check live availability"
            subline="Popular time slots can fill up fast."
          />
        </div>
      </section>

      {/* Why we recommend (trust) */}
      {tourSeo?.whyWeRecommend && (
        <section className="py-6 lg:py-8">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-4xl">
            <div className="rounded-xl bg-amber-50/60 border border-amber-100 p-6 lg:p-8">
              <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-2">Why we recommend this tour</h2>
              <p className="text-gray-800 leading-relaxed">{tourSeo.whyWeRecommend}</p>
            </div>
          </div>
        </section>
      )}

      {/* About */}
      {description && (
        <section className="py-6 lg:py-8">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-4xl">
            <div className="rounded-xl bg-slate-50 border border-slate-200 p-6 lg:p-8">
              <h2 className="font-poppins font-bold text-lg text-gray-900 mb-4">About this tour</h2>
              <p className="text-gray-600 leading-relaxed whitespace-pre-line">{description}</p>
            </div>
          </div>
        </section>
      )}

      {/* Mid-page booking CTA */}
      <section className="py-6 lg:py-8">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-4xl">
          <div className="rounded-2xl border-2 border-[#00AA6C]/30 bg-[#f2fbf7] p-4 sm:p-5 shadow-[0_10px_30px_rgba(0,170,108,0.12)] ring-1 ring-[#00AA6C]/10">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="text-xl font-bold text-gray-900 leading-tight">{bookingPriceLabel}</p>
                <p className="text-xs text-gray-500">per person</p>
                {hasRating && (
                  <p className="mt-1 text-xs font-semibold text-gray-700">
                    {Number(rating).toFixed(1)}★ · {reviewCount.toLocaleString('en-US')}
                  </p>
                )}
              </div>
              <div className="min-w-[170px]">
                <p className="text-[11px] font-semibold uppercase tracking-wide text-gray-500">Travelers</p>
                <p className="text-xs text-gray-600">Number of travelers</p>
                <div className="mt-1.5 inline-flex items-center rounded-lg border border-gray-200 bg-white shadow-sm">
                  <button
                    type="button"
                    onClick={() => setTravelers((prev) => Math.max(1, prev - 1))}
                    className="h-9 w-9 text-base font-semibold text-gray-700 hover:bg-gray-50"
                    aria-label="Decrease travelers"
                  >
                    -
                  </button>
                  <span className="w-9 text-center text-sm font-semibold text-gray-900">{travelers}</span>
                  <button
                    type="button"
                    onClick={() => setTravelers((prev) => Math.min(20, prev + 1))}
                    className="h-9 w-9 text-base font-semibold text-gray-700 hover:bg-gray-50"
                    aria-label="Increase travelers"
                  >
                    +
                  </button>
                </div>
              </div>
            </div>

            <div className="mt-3 flex flex-col gap-3 rounded-xl bg-white px-3 py-3 ring-1 ring-[#00AA6C]/15 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
              <div>
                <p className="text-sm font-semibold text-gray-900 leading-tight">
                  Estimated Total: {estimatedTotal !== null ? formatCurrency(estimatedTotal) : 'See price on Viator'}
                </p>
                <p className="text-[11px] text-gray-500">Final price may vary. Check availability for exact pricing.</p>
              </div>
              <div className="flex sm:items-end">
                <a
                  href={bookUrl}
                  target="_blank"
                  rel="sponsored noopener noreferrer"
                  className="inline-flex w-full max-w-full items-center justify-center gap-2 rounded-lg bg-[#00AA6C] px-3 py-2.5 text-center text-xs font-semibold leading-snug text-white transition-colors hover:bg-[#008855] sm:w-auto sm:text-sm sm:px-4"
                >
                  <span className="min-w-0">{VIATOR_CTA_LABEL}</span>
                  <ExternalLink className="h-4 w-4 shrink-0" aria-hidden />
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Highlights */}
      {Array.isArray(tourSeo?.highlights) && tourSeo.highlights.length > 0 && (
        <section className="py-6 lg:py-8">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-4xl">
            <div className="rounded-xl bg-violet-50/50 border border-violet-100 p-6 lg:p-8">
              <h2 className="font-poppins font-bold text-lg text-gray-900 mb-4 flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-primary shrink-0" />
                Highlights
              </h2>
              <ul className="grid sm:grid-cols-2 gap-2 text-gray-700">
              {tourSeo.highlights.map((item, i) => (
                <li key={i} className="flex gap-3">
                  <span className="shrink-0 mt-1.5 w-2 h-2 rounded-full bg-primary" aria-hidden />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
            </div>
          </div>
        </section>
      )}

      {/* Who is this tour for */}
      {Array.isArray(tourSeo?.whoIsThisFor) && tourSeo.whoIsThisFor.length > 0 && (
        <section className="py-6 lg:py-8">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-4xl">
            <div className="rounded-xl bg-sky-50/60 border border-sky-100 p-6 lg:p-8">
            <h2 className="font-poppins font-bold text-lg text-gray-900 mb-4 flex items-center gap-2">
              <Users className="w-5 h-5 text-primary shrink-0" />
              Who is this tour for?
            </h2>
            <ul className="space-y-2 text-gray-700">
              {tourSeo.whoIsThisFor.map((item, i) => (
                <li key={i} className="flex gap-3">
                  <span className="shrink-0 mt-1.5 w-2 h-2 rounded-full bg-primary" aria-hidden />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
            </div>
          </div>
        </section>
      )}

      {/* Insider tips */}
      {Array.isArray(tourSeo?.insiderTips) && tourSeo.insiderTips.length > 0 && (
        <section className="py-6 lg:py-8">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-4xl">
            <div className="rounded-xl bg-teal-50/60 border border-teal-100 p-6 lg:p-8">
            <h2 className="font-poppins font-bold text-lg text-gray-900 mb-4 flex items-center gap-2">
              <Lightbulb className="w-5 h-5 text-primary shrink-0" />
              Insider tips
            </h2>
            <ul className="space-y-2 text-gray-700">
              {tourSeo.insiderTips.map((item, i) => (
                <li key={i} className="flex gap-3">
                  <span className="shrink-0 mt-1.5 w-2 h-2 rounded-full bg-primary" aria-hidden />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
            </div>
          </div>
        </section>
      )}

      {/* What's included */}
      {inclusions.length > 0 && (
        <section className="py-6 lg:py-8">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-4xl">
            <div className="rounded-xl bg-emerald-50/60 border border-emerald-100 p-6 lg:p-8">
            <h2 className="font-poppins font-bold text-lg text-gray-900 mb-4 flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-primary shrink-0" />
              What&apos;s included
            </h2>
            <ul className="grid sm:grid-cols-2 gap-2 text-gray-700">
              {inclusions.map((item, i) => (
                <li key={i} className="flex gap-3">
                  <span className="shrink-0 mt-1.5 w-2 h-2 rounded-full bg-primary" aria-hidden />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
            </div>
          </div>
        </section>
      )}

      {/* Verify inclusions CTA */}
      {inclusions.length > 0 && (
        <section className="py-4 lg:py-6">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-4xl">
            <ExploreBetweenSectionsCta
              bookUrl={bookUrl}
              headline="Verify inclusions & book on Viator"
            />
          </div>
        </section>
      )}

      {/* What's not included */}
      {exclusions.length > 0 && (
        <section className="py-6 lg:py-8">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-4xl">
            <div className="rounded-xl bg-rose-50/50 border border-rose-100 p-6 lg:p-8">
            <h2 className="font-poppins font-bold text-lg text-gray-900 mb-4">
              What&apos;s not included
            </h2>
            <ul className="grid sm:grid-cols-2 gap-2 text-gray-700">
              {exclusions.map((item, i) => (
                <li key={i} className="flex gap-3">
                  <span className="shrink-0 mt-1.5 w-2 h-2 rounded-full bg-gray-300" aria-hidden />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
            </div>
          </div>
        </section>
      )}

      {/* Itinerary */}
      {itinerarySteps.length > 0 && (
        <section className="py-6 lg:py-8">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-4xl">
            <div className="rounded-xl bg-indigo-50/40 border border-indigo-100 p-6 lg:p-8">
            <h2 className="font-poppins font-bold text-lg text-gray-900 mb-4">Itinerary</h2>
            <ol className="space-y-6">
              {itinerarySteps.map((step, i) => (
                <li key={i} className="flex gap-4">
                  <span className="shrink-0 w-10 h-10 rounded-full bg-primary/20 text-primary font-bold flex items-center justify-center">
                    {i + 1}
                  </span>
                  <div>
                    <h3 className="font-semibold text-gray-900">{step.stop}</h3>
                    <p className="mt-1 text-gray-600 leading-relaxed">{step.description}</p>
                  </div>
                </li>
              ))}
            </ol>
            </div>
          </div>
        </section>
      )}

      {/* Destination-focused availability CTA */}
      {destinationName ? (
        <section className="py-4 lg:py-6">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-4xl">
            <ExploreBetweenSectionsCta
              bookUrl={bookUrl}
              headline={`${destinationName}: check live availability on Viator`}
            />
          </div>
        </section>
      ) : null}

      {/* More tours on partner page (no internal similar-tours API call) */}
      <section className="py-6 lg:py-8">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-4xl">
          <div className="rounded-xl border border-[#00AA6C]/30 bg-gradient-to-br from-[#f2fbf7] to-white p-6 shadow-[0_8px_24px_rgba(0,170,108,0.08)]">
            <h2 className="mb-2 text-2xl font-bold text-gray-900">More tours</h2>
            <p className="mb-4 text-sm leading-relaxed text-gray-700">
              Open Viator with this tour under <span className="font-medium">You selected</span>, plus hundreds of
              other experiences in {destinationName} - same link as availability &amp; booking.
            </p>
            <a
              href={bookUrl}
              target="_blank"
              rel="sponsored noopener noreferrer"
              className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[#00AA6C] px-4 py-3 text-center text-sm font-semibold leading-snug text-white transition-colors hover:bg-[#008855]"
            >
              <span>View similar tours on Viator</span>
              <ExternalLink className="h-4 w-4 shrink-0" aria-hidden />
            </a>
          </div>
        </div>
      </section>

      {/* Similar tours */}
      {relatedTours.length > 0 && (
        <section className="py-6 lg:py-8">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-4xl">
            <h2 className="font-poppins font-bold text-lg text-gray-900 mb-1">Similar tours</h2>
            <p className="text-gray-500 text-sm mb-1">Handpicked from the same category in {destinationName} — easy alternatives if you want to compare.</p>
            <p className="text-gray-500 text-sm mb-4">More {categoryTitle.toLowerCase()} in {destinationName}.</p>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {relatedTours.slice(0, 6).map((t) => {
                const href = t.tourSlug
                  ? `/explore/${destinationSlug}/${categorySlug}/${t.tourSlug}`
                  : getTourUrl(t.productId, t.title);
                return (
                  <Link
                    key={t.productId}
                    href={href}
                    className="group flex flex-col rounded-xl border-2 border-gray-200 bg-white overflow-hidden text-left transition-all hover:border-primary/30 hover:shadow-lg"
                  >
                    <div className="aspect-[16/9] w-full overflow-hidden bg-primary/5">
                      {t.imageUrl ? (
                        <Image
                          src={t.imageUrl}
                          alt=""
                          width={400}
                          height={225}
                          className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      ) : (
                        <div className="h-full w-full flex items-center justify-center text-gray-400">
                          <MapPin className="w-10 h-10 opacity-50" />
                        </div>
                      )}
                    </div>
                    <div className="p-4 flex flex-col flex-1">
                      <h3 className="font-semibold text-gray-900 group-hover:text-primary transition-colors line-clamp-2">
                        {t.title}
                      </h3>
                      {typeof t.rating === 'number' && t.rating > 0 && typeof t.reviewCount === 'number' && t.reviewCount > 0 && (
                        <div className="mt-2 flex items-center gap-1.5 text-xs text-gray-500">
                          <span className="inline-flex items-center gap-1 font-medium text-gray-800">
                            <svg className="w-3.5 h-3.5 text-amber-500 fill-amber-500" viewBox="0 0 20 20" aria-hidden>
                              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                            </svg>
                            {Number(t.rating).toFixed(1)}
                          </span>
                          <span>({t.reviewCount.toLocaleString('en-US')})</span>
                        </div>
                      )}
                      {t.fromPrice && (
                        <p className="mt-1 text-xs text-gray-600">{t.fromPrice}</p>
                      )}
                      <span className="mt-3 inline-flex items-center gap-1.5 text-sm font-semibold text-primary">
                        View tour
                        <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                      </span>
                    </div>
                  </Link>
                );
              })}
            </div>
            <Link
              href={categoryHref}
              className="mt-4 inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:underline"
            >
              View all {categoryTitle.toLowerCase()}
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </section>
      )}

      {/* Compare reviews / final price CTA */}
      <section className="py-4 lg:py-6">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-4xl">
          <ExploreBetweenSectionsCta
            bookUrl={bookUrl}
            headline="Compare reviews & final price on Viator"
          />
        </div>
      </section>

      {/* Post–similar-tours CTA (captures scrollers who browsed alternatives) */}
      <section className="py-6 lg:py-8">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-4xl">
          <div className="rounded-2xl border-2 border-[#00AA6C]/25 bg-[#f2fbf7] p-5 sm:p-6 text-center shadow-sm">
            <h2 className="font-poppins font-bold text-lg text-gray-900">Still interested in this experience?</h2>
            <p className="mt-1 text-sm text-gray-600">Lock in dates and see live availability on Viator.</p>
            <a
              href={bookUrl}
              target="_blank"
              rel="sponsored noopener noreferrer"
              className="mt-4 inline-flex max-w-full items-center justify-center gap-2 rounded-xl bg-[#00AA6C] px-4 py-3 text-center text-xs font-semibold leading-snug text-white transition-colors hover:bg-[#008855] sm:px-6 sm:text-sm"
            >
              <span className="min-w-0">{VIATOR_CTA_LABEL}</span>
              <ExternalLink className="h-4 w-4 shrink-0" aria-hidden />
            </a>
          </div>
        </div>
      </section>

      {/* FAQ */}
      {faqs.length > 0 && (
        <section className="py-6 lg:py-8">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-4xl">
            <div className="rounded-xl bg-gray-50 border border-gray-200 p-6 lg:p-8">
            <h2 id="faq-heading" className="font-poppins font-bold text-lg text-gray-900 mb-4 flex items-center gap-2">
              <HelpCircle className="w-5 h-5 text-primary shrink-0" />
              Frequently asked questions
            </h2>
            <div className="space-y-3">
              {faqs.map((faq, i) => (
                <details
                  key={i}
                  open={openFaqIndices.has(i)}
                  onToggle={(e) => {
                    const isOpen = e.currentTarget.open;
                    setOpenFaqIndices((prev) => {
                      const next = new Set(prev);
                      if (isOpen) next.add(i);
                      else next.delete(i);
                      return next;
                    });
                  }}
                  className="group rounded-lg border border-gray-200 overflow-hidden hover:border-gray-300 transition-colors"
                >
                  <summary className="px-5 py-4 font-semibold text-gray-900 cursor-pointer list-none flex justify-between items-center gap-4 select-none outline-none focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 focus-visible:ring-inset rounded-xl">
                    <span className="pr-2">{faq.question}</span>
                    <span className="shrink-0 w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center group-open:bg-primary group-open:text-white transition-colors">
                      <ArrowRight className="w-5 h-5 group-open:rotate-90 transition-transform" />
                    </span>
                  </summary>
                  <div className="px-5 pb-5 pt-0 text-gray-600 leading-relaxed">
                    {faq.answer}
                  </div>
                </details>
              ))}
            </div>
            </div>
          </div>
        </section>
      )}

      {/* Final CTA + explore more */}
      <section className="py-12 lg:py-14 bg-white border-t border-gray-100">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-4xl text-center">
          <a
            href={bookUrl}
            target="_blank"
            rel="sponsored noopener noreferrer"
            className="inline-flex max-w-full items-center justify-center gap-2 rounded-xl bg-[#00AA6C] px-4 py-3.5 text-center text-xs font-semibold leading-snug text-white transition-colors hover:bg-[#008855] sm:px-6 sm:text-sm"
          >
            <span className="min-w-0">{VIATOR_CTA_LABEL}</span>
            <ExternalLink className="h-4 w-4 shrink-0" aria-hidden />
          </a>
          <div className="mt-6 flex flex-wrap items-center justify-center gap-x-3 gap-y-2 text-sm text-gray-500">
            <span className="font-medium text-gray-500">Explore:</span>
            <Link href={categoryHref} className="font-medium text-gray-700 hover:text-primary transition-colors">
              {categoryTitle}
            </Link>
            <span aria-hidden className="text-gray-300">|</span>
            <Link href={destinationHref} className="font-medium text-gray-700 hover:text-primary transition-colors">
              {destinationName}
            </Link>
            <span aria-hidden className="text-gray-300">|</span>
            <Link href={toursInDestinationHref} className="font-medium text-gray-700 hover:text-primary transition-colors">
              All tours
            </Link>
          </div>
        </div>
      </section>
    </article>
  );
}
