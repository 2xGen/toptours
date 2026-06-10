'use client';

import Link from 'next/link';
import Image from 'next/image';
import NavigationNext from '@/components/NavigationNext';
import FooterNext from '@/components/FooterNext';
import SmartTourFinder from '@/components/home/SmartTourFinder';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import PrefetchOnHoverLink from '@/components/PrefetchOnHoverLink';
import { getTourUrl } from '@/utils/tourHelpers';
import { OPERATOR_VIATOR_DATA_NOTICE } from '@/lib/operatorPageSeo';
import {
  ArrowRight,
  Building2,
  Star,
  Clock,
  MapPin,
  Share2,
  Info,
} from 'lucide-react';
import { useState } from 'react';
import ShareModal from '@/components/sharing/ShareModal';

const BLUR =
  'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAAIAAoDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAb/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCdABmX/9k=';

function formatPrice(fromPrice) {
  if (fromPrice == null) return null;
  return `From $${Math.round(Number(fromPrice)).toLocaleString('en-US')}`;
}

function ViatorDataInfo({ className = '' }) {
  return (
    <span className={`relative inline-flex items-center group ${className}`}>
      <button
        type="button"
        className="rounded-full p-0.5 text-gray-400 hover:text-gray-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
        aria-label="About ratings and review data from Viator"
      >
        <Info className="w-4 h-4 cursor-help" aria-hidden />
      </button>
      <span
        role="tooltip"
        className="absolute left-1/2 top-full z-20 mt-2 w-64 -translate-x-1/2 rounded-lg bg-gray-900 px-3 py-2 text-xs leading-relaxed text-white opacity-0 shadow-lg transition-opacity duration-200 pointer-events-none group-hover:opacity-100 group-focus-within:opacity-100 sm:w-72"
      >
        {OPERATOR_VIATOR_DATA_NOTICE}
        <span
          className="absolute bottom-full left-1/2 -translate-x-1/2 border-4 border-transparent border-b-gray-900"
          aria-hidden
        />
      </span>
    </span>
  );
}

function formatDuration(minutes) {
  if (!minutes) return null;
  if (minutes < 60) return `${minutes} min`;
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return m === 0 ? `${h}h` : `${h}h ${m}m`;
}

/** Reviews block — single tour shows tour stats; multiple shows operator aggregate. */
function OperatorReviewsSection({ operator, destName }) {
  const tours = operator.tours || [];
  const tourCount = operator.tourCount || tours.length;
  const topTour = tours[0];
  if (!topTour?.rating || !operator.totalReviews) return null;

  const isSingleTour = tourCount === 1;
  const rating = isSingleTour ? Number(topTour.rating) : Number(operator.averageRating);
  const reviewCount = isSingleTour ? Number(topTour.reviewCount) : Number(operator.totalReviews);
  const reviewsTourUrl = getTourUrl(topTour.productId, topTour.title);

  return (
    <section className="py-10 sm:py-12 px-4 bg-gray-50 border-b">
      <div className="max-w-3xl mx-auto">
        <div className="flex flex-wrap items-center gap-x-2 gap-y-1 mb-4">
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900">
            {operator.operatorName} reviews in {destName}
          </h2>
          <ViatorDataInfo className="shrink-0" />
        </div>

        <div className="rounded-2xl border border-gray-200 bg-white p-6 sm:p-8 shadow-sm">
          <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
            <div className="flex items-center gap-2">
              <Star className="w-8 h-8 text-amber-500 fill-amber-500 shrink-0" aria-hidden />
              <span className="text-4xl font-bold text-gray-900">{rating.toFixed(2)}</span>
            </div>
            <div>
              <p className="text-lg font-semibold text-gray-900">
                {reviewCount.toLocaleString('en-US')} verified reviews
              </p>
              <p className="text-sm text-gray-600 mt-0.5">
                {isSingleTour ? (
                  <>
                    For <span className="font-medium text-gray-800">{topTour.title}</span>
                  </>
                ) : (
                  <>
                    Combined average across {tourCount} {tourCount === 1 ? 'tour' : 'tours'} in{' '}
                    {destName}
                  </>
                )}
              </p>
            </div>
          </div>

          <p className="mt-4 text-sm text-gray-500 leading-relaxed">
            Ratings and review counts are sourced from Viator, our booking partner, and may change
            over time.
          </p>

          <Button asChild variant="outline" className="mt-5">
            <Link href={reviewsTourUrl}>
              View and read reviews here
              <ArrowRight className="w-4 h-4 ml-2" />
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
}

/** SEO-oriented tour row: H3 title, meta line, image, CTA — lighter than full TourCard. */
function OperatorTourRow({ tour, operatorName, destination, priority, imageRight }) {
  const href = getTourUrl(tour.productId, tour.title);
  const duration = formatDuration(tour.durationMinutes);
  const anchorId = tour.slug || `tour-${tour.productId}`;

  return (
    <article id={anchorId} className="scroll-mt-24 border-b border-gray-100 pb-10 last:border-0 last:pb-0">
      <div
        className={`grid gap-8 items-center md:grid-cols-2 ${imageRight ? 'md:[&>div:first-child]:order-2 md:[&>div:last-child]:order-1' : ''}`}
      >
        <div>
          <h3 className="text-xl sm:text-2xl font-bold text-gray-900 leading-snug">
            <PrefetchOnHoverLink href={href} className="hover:text-primary transition-colors">
              {tour.title}
            </PrefetchOnHoverLink>
          </h3>

          <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-gray-600">
            {tour.rating ? (
              <span className="inline-flex items-center gap-1.5 font-medium text-gray-800">
                <span className="text-gray-500 font-normal">Rating:</span>
                <Star className="w-4 h-4 text-amber-500 fill-amber-500 shrink-0" aria-hidden />
                {Number(tour.rating).toFixed(1)}
                {tour.reviewCount ? (
                  <span className="text-gray-500 font-normal">
                    ({Number(tour.reviewCount).toLocaleString('en-US')} reviews)
                  </span>
                ) : null}
              </span>
            ) : null}
            {duration ? (
              <span className="inline-flex items-center gap-1.5">
                <span className="text-gray-500">Duration:</span>
                <Clock className="w-3.5 h-3.5 shrink-0" aria-hidden />
                {duration}
              </span>
            ) : null}
            <span className="inline-flex items-center gap-1">
              <Building2 className="w-3.5 h-3.5 shrink-0" aria-hidden />
              Operated by {operatorName}
            </span>
          </div>

          {tour.highlight ? (
            <p className="mt-4 text-gray-600 leading-relaxed">{tour.highlight}</p>
          ) : null}

          {tour.fromPrice != null ? (
            <p className="mt-3 text-sm font-semibold text-gray-900">{formatPrice(tour.fromPrice)}</p>
          ) : null}

          <Button asChild className="mt-5 sunset-gradient text-white">
            <Link href={href}>
              View tour &amp; check availability
              <ArrowRight className="w-4 h-4 ml-2" />
            </Link>
          </Button>
        </div>

        <PrefetchOnHoverLink href={href} className="group block">
          <div className="relative aspect-[16/10] rounded-2xl overflow-hidden bg-slate-100 shadow-md ring-1 ring-black/5">
            {tour.imageUrl ? (
              <Image
                src={tour.imageUrl}
                alt={tour.title}
                fill
                sizes="(max-width: 768px) 100vw, 50vw"
                className="object-cover transition-transform duration-500 group-hover:scale-105"
                priority={priority}
                placeholder="blur"
                blurDataURL={BLUR}
              />
            ) : (
              <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-primary/5" />
            )}
          </div>
        </PrefetchOnHoverLink>
      </div>
    </article>
  );
}

export default function OperatorDetailClient({
  destination,
  operator,
  intro,
  pageUrl,
}) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);

  const destName = destination.fullName || destination.name;
  const heroImage =
    operator.tours?.[0]?.imageUrl ||
    destination.imageUrl ||
    'https://ouqeoizufbofdqbuiwvx.supabase.co/storage/v1/object/public/blogs/Explore%20any%20destination%20with%20TopToursai.png';

  const breadcrumbLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://toptours.ai/' },
      { '@type': 'ListItem', position: 2, name: 'Destinations', item: 'https://toptours.ai/destinations' },
      {
        '@type': 'ListItem',
        position: 3,
        name: destName,
        item: `https://toptours.ai/destinations/${destination.id}`,
      },
      {
        '@type': 'ListItem',
        position: 4,
        name: 'Tour Operators',
        item: `https://toptours.ai/destinations/${destination.id}/operators`,
      },
      {
        '@type': 'ListItem',
        position: 5,
        name: operator.operatorName,
        item: pageUrl,
      },
    ],
  };

  const orgLd = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: operator.operatorName,
    url: pageUrl,
    ...(operator.totalReviews > 0 &&
      operator.averageRating && {
        aggregateRating: {
          '@type': 'AggregateRating',
          ratingValue: operator.averageRating,
          reviewCount: operator.totalReviews,
          bestRating: 5,
          worstRating: 1,
        },
      }),
  };

  const itemListLd = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: `${operator.operatorName} tours in ${destName}`,
    numberOfItems: operator.tours?.length || 0,
    itemListElement: (operator.tours || []).map((tour, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      url: `https://toptours.ai${getTourUrl(tour.productId, tour.title)}`,
      name: tour.title,
    })),
  };

  const faqLd =
    operator.faqs?.length > 0
      ? {
          '@context': 'https://schema.org',
          '@type': 'FAQPage',
          mainEntity: operator.faqs.map((faq) => ({
            '@type': 'Question',
            name: faq.question,
            acceptedAnswer: { '@type': 'Answer', text: faq.answer },
          })),
        }
      : null;

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(orgLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(itemListLd) }} />
      {faqLd ? (
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqLd) }} />
      ) : null}

      <NavigationNext onOpenModal={() => setIsModalOpen(true)} />
      <SmartTourFinder isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />

      <div className="min-h-screen pt-16 bg-gradient-to-b from-blue-50 via-white to-white">
        <section className="relative py-16 sm:py-20 ocean-gradient text-white overflow-hidden -mt-12 sm:-mt-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid lg:grid-cols-2 gap-10 items-center">
              <div>
                <div className="inline-flex items-center gap-2 text-sm text-white/80 mb-4">
                  <Building2 className="w-4 h-4" />
                  <span>Tour operator in {destName}</span>
                </div>
                <div className="flex items-start gap-3 mb-4">
                  <h1 className="text-3xl sm:text-4xl md:text-5xl font-poppins font-bold flex-1">
                    {operator.operatorName} tours in {destName}
                  </h1>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-white hover:bg-white/20 shrink-0"
                    onClick={() => setShowShareModal(true)}
                    title="Share"
                  >
                    <Share2 className="w-5 h-5" />
                  </Button>
                </div>
                <p className="text-lg text-white/90 max-w-2xl mb-6">{intro}</p>
                <div className="flex flex-wrap gap-4 mb-8">
                  {operator.averageRating && operator.totalReviews > 0 && (
                    <div className="rounded-xl bg-white/15 px-4 py-3 backdrop-blur-sm">
                      <p className="text-xs uppercase tracking-wide text-white/70 mb-1">Average rating</p>
                      <div className="flex items-center gap-2 text-2xl font-bold">
                        <Star className="w-6 h-6 fill-amber-400 text-amber-400" />
                        {operator.averageRating}
                      </div>
                      <p className="text-sm text-white/80 mt-1">
                        {operator.totalReviews.toLocaleString('en-US')} verified reviews
                      </p>
                    </div>
                  )}
                  <div className="rounded-xl bg-white/15 px-4 py-3 backdrop-blur-sm">
                    <p className="text-xs uppercase tracking-wide text-white/70 mb-1">Tour count</p>
                    <p className="text-2xl font-bold">{operator.tourCount || operator.tours?.length || 0}</p>
                    <p className="text-sm text-white/80 mt-1">
                      {(operator.tourCount || operator.tours?.length) === 1 ? 'tour' : 'tours'} in {destName}
                    </p>
                  </div>
                </div>
                <div className="flex flex-wrap gap-3">
                  <Button asChild className="bg-white text-blue-600 hover:bg-gray-100">
                    <Link href={`/destinations/${destination.id}/tours`}>
                      All tours in {destName}
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Link>
                  </Button>
                  <Button
                    asChild
                    variant="ghost"
                    className="border border-white/70 bg-white/10 text-white hover:bg-white/20 hover:text-white"
                  >
                    <Link href={`/destinations/${destination.id}/operators`}>More operators</Link>
                  </Button>
                </div>
              </div>
              <div className="relative hidden sm:block">
                <Card className="border-0 shadow-2xl overflow-hidden">
                  <img src={heroImage} alt={operator.operatorName} className="w-full h-72 object-cover" />
                </Card>
              </div>
            </div>
          </div>
        </section>

        <section className="bg-white border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
            <nav className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs sm:text-sm text-gray-500">
              <Link href="/" className="hover:text-gray-700">Home</Link>
              <span>/</span>
              <Link href="/destinations" className="hover:text-gray-700">Destinations</Link>
              <span>/</span>
              <Link href={`/destinations/${destination.id}`} className="hover:text-gray-700">{destName}</Link>
              <span>/</span>
              <Link href={`/destinations/${destination.id}/operators`} className="hover:text-gray-700">Operators</Link>
              <span>/</span>
              <span className="text-gray-900 font-medium truncate max-w-[200px] sm:max-w-none">
                {operator.operatorName}
              </span>
            </nav>
          </div>
        </section>

        {operator.blurb ? (
          <section className="py-10 sm:py-12 px-4 bg-white border-b">
            <div className="max-w-3xl mx-auto">
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-3">
                About {operator.operatorName}
              </h2>
              <p className="text-gray-700 leading-relaxed">{operator.blurb}</p>
            </div>
          </section>
        ) : null}

        <OperatorReviewsSection operator={operator} destName={destName} />

        <section className="py-12 sm:py-16 px-4">
          <div className="max-w-4xl mx-auto">
            <div className="flex items-center gap-2 mb-8">
              <MapPin className="w-5 h-5 text-primary shrink-0" />
              <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">
                Tours by {operator.operatorName}
              </h2>
            </div>
            <div className="space-y-10">
              {(operator.tours || []).map((tour, i) => (
                <OperatorTourRow
                  key={tour.productId}
                  tour={tour}
                  operatorName={operator.operatorName}
                  destination={destination}
                  priority={i < 2}
                  imageRight={i % 2 === 1}
                />
              ))}
            </div>
          </div>
        </section>

        {operator.faqs?.length > 0 ? (
          <section className="py-12 sm:py-16 px-4 bg-gray-50 border-t">
            <div className="max-w-3xl mx-auto">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">
                Frequently asked questions
              </h2>
              <div className="space-y-3">
                {operator.faqs.map((faq) => (
                  <details
                    key={faq.question}
                    className="group rounded-xl border border-gray-200 bg-white px-5 py-4 open:shadow-sm"
                  >
                    <summary className="cursor-pointer font-medium text-gray-900 list-none flex items-center justify-between gap-4">
                      {faq.question}
                      <span className="text-gray-400 text-lg group-open:rotate-45 transition-transform" aria-hidden>
                        +
                      </span>
                    </summary>
                    <p className="mt-3 text-gray-600 leading-relaxed">{faq.answer}</p>
                  </details>
                ))}
              </div>
            </div>
          </section>
        ) : null}

        <section className="py-12 bg-white border-t">
          <div className="max-w-3xl mx-auto px-4 text-center">
            <h2 className="text-xl font-bold text-gray-900 mb-3">Explore more in {destName}</h2>
            <p className="text-gray-600 mb-6">
              Compare hundreds of other tours, guides, and curated picks on the {destName} destination hub.
            </p>
            <Button asChild className="sunset-gradient text-white">
              <Link href={`/destinations/${destination.id}`}>
                {destName} destination guide
                <ArrowRight className="w-4 h-4 ml-2" />
              </Link>
            </Button>
          </div>
        </section>
      </div>

      <FooterNext />
      <ShareModal
        isOpen={showShareModal}
        onClose={() => setShowShareModal(false)}
        url={pageUrl}
        title={`${operator.operatorName} tours in ${destName}`}
      />
    </>
  );
}
