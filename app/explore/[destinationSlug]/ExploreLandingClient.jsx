'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  ArrowRight,
  MapPin,
  Sparkles,
  ChevronDown,
  CheckCircle2,
  Lightbulb,
  HelpCircle,
} from 'lucide-react';
import { getTourUrl } from '@/utils/tourHelpers';
import ExploreToursListingClient from './tours/ExploreToursListingClient';

const SITE_URL = 'https://toptours.ai';

function stripDestinationName(text, destinationName) {
  if (!text || typeof text !== 'string' || !destinationName) return text;
  const escaped = destinationName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  // Common dataset pattern: "X in Curaçao" / "X in Curaçao." — remove destination repetition.
  return text
    .replace(new RegExp(`\\s+in\\s+${escaped}(?:\\.)?`, 'gi'), '')
    .replace(/\s{2,}/g, ' ')
    .trim();
}

export default function ExploreLandingClient({ destination, destinationSlug, topPicks = [], categories = [], tours = [] }) {
  const heroTitle = destination.hero_title || `Best Tours in ${destination.name}`;
  const heroSubtitle = destination.hero_subtitle || '';
  const heroCta = destination.hero_cta_text || 'Find tours';
  const heroBadge = destination.hero_badge || 'Tours & excursions';
  const whyVisitText = destination.why_visit_text || null;
  const whyVisitBullets = Array.isArray(destination.why_visit_bullets) ? destination.why_visit_bullets : [];
  const whatToExpectBullets = Array.isArray(destination.what_to_expect_bullets) ? destination.what_to_expect_bullets : [];
  const tipsBullets = Array.isArray(destination.tips_bullets) ? destination.tips_bullets : [];
  const faqs = Array.isArray(destination.faq_json) ? destination.faq_json : [];
  const destinationName = destination?.name;

  // Landing page preview grid: 3 columns x 3 rows
  const TOURS_PER_PAGE = 9;
  const [selectedCategory, setSelectedCategory] = useState('');

  const filteredTours = useMemo(() => {
    if (!selectedCategory) return tours;
    return tours.filter((t) => t.categorySlug === selectedCategory);
  }, [tours, selectedCategory]);

  const toursToShow = filteredTours.slice(0, TOURS_PER_PAGE);
  const totalTours = filteredTours.length;
  const shownFrom = totalTours === 0 ? 0 : 1;
  const shownTo = Math.min(totalTours, TOURS_PER_PAGE);

  return (
    <>
      {/* Schema: WebPage + TouristDestination */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'WebPage',
            name: heroTitle,
            description: destination.meta_description || heroSubtitle,
            url: `${SITE_URL}/explore/${destinationSlug}`,
            isPartOf: { '@type': 'WebSite', name: 'TopTours.ai', url: SITE_URL },
            about: {
              '@type': 'TouristDestination',
              name: destination.name,
              description: heroSubtitle,
            },
          }),
        }}
      />
      {/* FAQPage schema for rich results */}
      {faqs.length > 0 && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'FAQPage',
              mainEntity: faqs.map((faq) => ({
                '@type': 'Question',
                name: faq.question,
                acceptedAnswer: { '@type': 'Answer', text: faq.answer },
              })),
            }),
          }}
        />
      )}

      {/* Hero — ocean-gradient extends under nav */}
      <section
        className="relative -mt-16 pt-20 pb-12 sm:pt-24 sm:pb-16 md:pt-24 md:pb-20 overflow-hidden ocean-gradient"
        aria-labelledby="hero-heading"
      >
        <div className="container relative z-10 mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-[1fr,320px] gap-10 lg:gap-12 items-center">
            <div>
              <p className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm rounded-full px-4 py-2 text-sm font-medium text-white/95 uppercase tracking-wider">
                <Sparkles className="h-4 w-4" />
                {heroBadge}
              </p>
              <h1
                id="hero-heading"
                className="mt-5 font-poppins font-bold text-3xl sm:text-4xl lg:text-5xl text-white tracking-tight drop-shadow-sm"
              >
                {heroTitle}
              </h1>
              {heroSubtitle && (
                <p className="mt-4 text-lg text-white/90 max-w-2xl">
                  {heroSubtitle}
                </p>
              )}
              <div className="mt-8">
                <a
                  href="#tour-results"
                  className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-semibold text-white sunset-gradient hover:opacity-95 transition-opacity shadow-lg min-w-[200px]"
                >
                  {heroCta}
                  <ArrowRight className="h-5 w-5" />
                </a>
              </div>
            </div>
            {/* Quick navigation — top 6 categories */}
            {categories.length > 0 && (
              <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-5 lg:p-6">
                <h3 className="font-poppins font-bold text-gray-900 text-lg mb-3">
                  Quick navigation
                </h3>
                <p className="text-sm text-gray-600 mb-4">
                  Top 6 categories
                </p>
                <ul className="space-y-2">
                  {categories.slice(0, 6).map((cat) => (
                    <li key={cat.slug}>
                      <Link
                        href={`/explore/${destinationSlug}/${cat.slug}`}
                        className="flex items-center gap-2 text-gray-700 hover:text-primary font-medium text-sm py-1.5 hover:bg-gray-100 rounded-lg px-2 -mx-2 transition-colors"
                      >
                        <ArrowRight className="w-3.5 h-3.5 text-primary/70 shrink-0" />
                        {stripDestinationName(cat.title, destinationName)}
                      </Link>
                    </li>
                  ))}
                </ul>
                <Link
                  href="#categories"
                  className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-primary hover:underline"
                >
                  View all categories
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Category filter + results (embedded like /explore/[destinationSlug]/tours) */}
      <section id="tour-results" className="border-b border-gray-200 bg-white py-10">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-6xl">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div className="min-w-0">
              <h2 className="font-poppins font-bold text-2xl sm:text-3xl text-gray-900 tracking-tight">
                Tours &amp; Activities in {destination.name}
              </h2>
              <p className="mt-2 text-sm text-gray-600">
                Browse and book tours and activities in {destination.name}. Compare options and prices in one place.
              </p>
            </div>

            <div className="min-w-[220px]">
              <label htmlFor="explore-destination-category-filter" className="block text-sm font-semibold text-gray-700 mb-2">
                Category
              </label>
              <select
                id="explore-destination-category-filter"
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full appearance-none rounded-xl border-2 border-gray-200 bg-white py-3 pl-4 pr-10 text-sm font-semibold text-gray-800 shadow-sm transition-colors hover:border-primary/50 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 cursor-pointer"
              >
                <option value="">All categories</option>
                {categories.map((cat) => (
                  <option key={cat.slug} value={cat.slug}>
                    {stripDestinationName(cat.title, destinationName)}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <p className="mt-6 text-gray-500 text-sm">
            {totalTours === 0 ? (
              'No tours found.'
            ) : (
              <>
                Showing {shownFrom}–{shownTo} of {totalTours} tours.
              </>
            )}
          </p>

          <div className="mt-6">
            <ExploreToursListingClient
              tours={toursToShow}
              destinationSlug={destinationSlug}
              destinationName={destination.name}
            />
          </div>
        </div>
      </section>

      {/* Categories — clean card grid (no icons) */}
      <section
        id="categories"
        className="py-16 lg:py-20 bg-white"
        aria-labelledby="categories-heading"
      >
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-6xl">
          <div className="text-center mb-12">
            <span className="inline-block rounded-full bg-primary/10 text-primary px-4 py-1.5 text-xs font-semibold uppercase tracking-widest">
              Browse by type
            </span>
            <h2
              id="categories-heading"
              className="mt-4 font-poppins font-bold text-2xl sm:text-3xl lg:text-4xl text-gray-900"
            >
              Popular categories
            </h2>
            <p className="mt-3 text-gray-600 max-w-xl mx-auto">
              Find the right type of experience for you.
            </p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {categories.map((cat) => {
              return (
                <Link
                  key={cat.slug}
                  href={`/explore/${destinationSlug}/${cat.slug}`}
                  className="group flex items-start bg-white rounded-2xl border-2 border-gray-100 p-5 text-left transition-all duration-300 hover:shadow-lg hover:border-primary/30 hover:-translate-y-0.5 shadow-sm"
                >
                  <div className="min-w-0 flex-1 pr-2">
                    <span className="font-semibold text-gray-800 group-hover:text-primary block">
                      {stripDestinationName(cat.title, destinationName)}
                    </span>
                    {cat.description && (
                      <span className="text-sm text-gray-500 mt-0.5 line-clamp-2 block">
                        {stripDestinationName(cat.description, destinationName)}
                      </span>
                    )}
                  </div>
                  <ArrowRight className="w-5 h-5 text-gray-300 group-hover:text-primary shrink-0 mt-1 transition-colors" />
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* Why visit [destination] for tours — card + tinted section */}
      {(whyVisitText || whyVisitBullets.length > 0) && (
        <section className="py-16 lg:py-20 bg-gradient-to-b from-primary/5 to-white" aria-labelledby="why-visit-heading">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-6xl">
            <div className="rounded-3xl bg-white border-2 border-primary/10 shadow-lg p-8 sm:p-10">
              <div className="flex items-center gap-3 mb-6">
                <span className="flex-shrink-0 w-12 h-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                  <MapPin className="w-6 h-6" />
                </span>
                <h2 id="why-visit-heading" className="font-poppins font-bold text-2xl sm:text-3xl text-gray-900">
                  Why book tours in {destination.name}
                </h2>
              </div>
              {whyVisitText && <p className="text-gray-600 text-lg leading-relaxed max-w-3xl">{whyVisitText}</p>}
              {whyVisitBullets.length > 0 && (
                <ul className="mt-6 grid sm:grid-cols-2 gap-3 max-w-3xl">
                  {whyVisitBullets.map((item, i) => (
                    <li key={i} className="flex items-start gap-2 text-gray-700">
                      <CheckCircle2 className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </section>
      )}

      {/* What to expect — card grid */}
      {whatToExpectBullets.length > 0 && (
        <section className="py-16 lg:py-20 bg-white" aria-labelledby="what-to-expect-heading">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-6xl">
            <div className="rounded-3xl bg-gradient-to-br from-primary/5 to-primary/10 border-2 border-primary/10 shadow-lg p-8 sm:p-10">
              <h2 id="what-to-expect-heading" className="font-poppins font-bold text-2xl sm:text-3xl text-gray-900 mb-6 flex items-center gap-2">
                <CheckCircle2 className="w-8 h-8 text-primary shrink-0" />
                What to expect when you book
              </h2>
              <ul className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {whatToExpectBullets.map((item, i) => (
                  <li key={i} className="flex items-start gap-3 rounded-xl bg-white/80 border border-primary/10 p-4 text-gray-700">
                    <CheckCircle2 className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>
      )}

      {/* Practical tips — card section */}
      {tipsBullets.length > 0 && (
        <section className="py-16 lg:py-20 bg-gradient-to-b from-primary/5 to-white" aria-labelledby="tips-heading">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-6xl">
            <div className="rounded-3xl bg-white border-2 border-primary/10 shadow-lg p-8 sm:p-10">
              <h2 id="tips-heading" className="font-poppins font-bold text-2xl sm:text-3xl text-gray-900 mb-6 flex items-center gap-3">
                <span className="flex-shrink-0 w-12 h-12 rounded-xl bg-amber-100 text-amber-600 flex items-center justify-center">
                  <Lightbulb className="w-6 h-6" />
                </span>
                Tips for booking {destination.name} tours
              </h2>
              <ul className="space-y-3 max-w-3xl">
                {tipsBullets.map((item, i) => (
                  <li key={i} className="flex items-start gap-3 rounded-xl bg-amber-50/80 border border-amber-100 px-4 py-3 text-gray-700">
                    <span className="text-amber-500 font-bold shrink-0">{(i + 1)}.</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>
      )}

      {/* FAQ — card section + accordion */}
      {faqs.length > 0 && (
        <section className="py-16 lg:py-20 bg-white" aria-labelledby="faq-heading">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-6xl">
            <div className="rounded-3xl bg-gradient-to-br from-primary/5 to-primary/10 border-2 border-primary/10 shadow-lg p-8 sm:p-10">
              <h2 id="faq-heading" className="font-poppins font-bold text-2xl sm:text-3xl text-gray-900 mb-8 flex items-center gap-3">
                <span className="flex-shrink-0 w-12 h-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                  <HelpCircle className="w-6 h-6" />
                </span>
                Frequently asked questions about {destination.name} tours
              </h2>
              <div className="space-y-3">
                {faqs.map((faq, i) => (
                  <details
                    key={i}
                    className="group rounded-2xl border-2 border-primary/10 bg-white hover:border-primary/30 transition-colors shadow-sm"
                  >
                    <summary className="px-5 py-4 font-semibold text-gray-900 cursor-pointer list-none flex justify-between items-center gap-4 select-none outline-none focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 focus-visible:ring-inset rounded-xl">
                      <span className="pr-2">{faq.question}</span>
                      <span className="shrink-0 w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center group-open:bg-primary group-open:text-white transition-colors">
                        <ChevronDown className="w-5 h-5 group-open:rotate-180 transition-transform" />
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
    </>
  );
}
