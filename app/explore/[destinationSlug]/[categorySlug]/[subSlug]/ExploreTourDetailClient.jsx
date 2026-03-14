'use client';

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
import { getTourUrl } from '@/utils/tourHelpers';

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
      priceDisplay = `From $${Math.round(fromPrice)}`;
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

  const bookUrl =
    tour?.productUrl || `https://www.viator.com/tours/New-York-City/${productId}`;

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
    <article className="min-h-screen bg-[#f8f9fa]">
      {/* Sticky book button */}
      <div className="fixed bottom-6 right-6 z-40">
        <a
          href={bookUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 px-5 py-3.5 rounded-xl font-semibold text-white bg-primary hover:opacity-95 transition-opacity shadow-lg hover:shadow-xl"
        >
          View options &amp; book
          <ExternalLink className="w-4 h-4" />
        </a>
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
          <div className="grid lg:grid-cols-5 gap-8 lg:gap-10 items-start">
            <div className="lg:col-span-2 rounded-xl overflow-hidden bg-gray-100 aspect-[4/3] lg:aspect-[4/3] lg:min-h-[260px] shadow-sm">
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
              <div className="mt-6 flex flex-wrap items-center gap-4">
                <span className="text-xl font-semibold text-gray-900">{priceDisplay}</span>
                <a
                  href={bookUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-5 py-3 rounded-xl font-semibold text-white bg-primary hover:opacity-95 transition-opacity"
                >
                  Check availability
                  <ArrowRight className="w-4 h-4" />
                </a>
              </div>
              <p className="mt-3 text-xs text-gray-400">Free cancellation on most experiences · Powered by Viator</p>
            </div>
          </div>
        </div>
      </section>

      {/* Why we recommend (trust) */}
      {tourSeo?.whyWeRecommend && (
        <section className="py-6 lg:py-8">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-4xl">
            <div className="rounded-xl bg-white border border-gray-100 p-6 lg:p-8">
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
            <div className="rounded-xl bg-white border border-gray-100 p-6 lg:p-8">
              <h2 className="font-poppins font-bold text-lg text-gray-900 mb-4">About this tour</h2>
              <p className="text-gray-600 leading-relaxed whitespace-pre-line">{description}</p>
            </div>
          </div>
        </section>
      )}

      {/* Highlights */}
      {Array.isArray(tourSeo?.highlights) && tourSeo.highlights.length > 0 && (
        <section className="py-6 lg:py-8">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-4xl">
            <div className="rounded-xl bg-white border border-gray-100 p-6 lg:p-8">
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
            <div className="rounded-xl bg-white border border-gray-100 p-6 lg:p-8">
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
            <div className="rounded-xl bg-white border border-gray-100 p-6 lg:p-8">
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
            <div className="rounded-xl bg-white border border-gray-100 p-6 lg:p-8">
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

      {/* What's not included */}
      {exclusions.length > 0 && (
        <section className="py-6 lg:py-8">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-4xl">
            <div className="rounded-xl bg-white border border-gray-100 p-6 lg:p-8">
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
            <div className="rounded-xl bg-white border border-gray-100 p-6 lg:p-8">
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

      {/* Similar tours */}
      {relatedTours.length > 0 && (
        <section className="py-6 lg:py-8">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-4xl">
            <h2 className="font-poppins font-bold text-lg text-gray-900 mb-1">Similar tours</h2>
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

      {/* FAQ */}
      {faqs.length > 0 && (
        <section className="py-6 lg:py-8">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-4xl">
            <div className="rounded-xl bg-white border border-gray-100 p-6 lg:p-8">
            <h2 id="faq-heading" className="font-poppins font-bold text-lg text-gray-900 mb-4 flex items-center gap-2">
              <HelpCircle className="w-5 h-5 text-primary shrink-0" />
              Frequently asked questions
            </h2>
            <div className="space-y-3">
              {faqs.map((faq, i) => (
                <details
                  key={i}
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
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl font-semibold text-white bg-primary hover:opacity-95 transition-opacity"
          >
            View options &amp; book
            <ExternalLink className="w-4 h-4" />
          </a>
          <p className="mt-6 text-sm text-gray-500">
            <Link href={categoryHref} className="text-gray-600 hover:text-primary font-medium">← {categoryTitle}</Link>
            {' · '}
            <Link href={destinationHref} className="text-gray-600 hover:text-primary font-medium">{destinationName}</Link>
            {' · '}
            <Link href={toursInDestinationHref} className="text-gray-600 hover:text-primary font-medium">All tours</Link>
          </p>
        </div>
      </section>
    </article>
  );
}
