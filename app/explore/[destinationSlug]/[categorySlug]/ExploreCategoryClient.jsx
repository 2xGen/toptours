'use client';

import Link from 'next/link';
import Image from 'next/image';
import {
  ArrowRight,
  MapPin,
  TreePine,
  ChevronDown,
  HelpCircle,
  Bike,
  Footprints,
  Heart,
  Activity,
  Camera,
  Baby,
  Flower2,
  Ticket,
  Music,
  Users,
  Wine,
  Landmark,
  UtensilsCrossed,
  Ship,
  Moon,
  Bus,
  Helicopter,
  Waves,
  Building2,
  Palette,
} from 'lucide-react';
import { getTourUrl } from '@/utils/tourHelpers';

/** Renders text with *asterisk* segments as <strong> (single paragraph, inline). */
function renderTextWithBold(text) {
  if (!text || typeof text !== 'string') return null;
  const parts = text.split(/(\*[^*]+\*)/g);
  return parts.map((part, i) =>
    part.startsWith('*') && part.endsWith('*') ? (
      <strong key={i} className="font-semibold text-gray-800">{part.slice(1, -1)}</strong>
    ) : (
      part
    )
  );
}

const CATEGORY_ICONS = {
  'central-park-tours': TreePine,
  'broadway-shows': Ticket,
  'food-tours': UtensilsCrossed,
  'museum-tours': Landmark,
  'statue-of-liberty-harbor': Ship,
  'walking-neighborhoods': Footprints,
  'night-skyline': Moon,
  'day-trips': Bus,
  'family-kids': Baby,
  'helicopter-views': Helicopter,
  'cruises-water': Waves,
  'brooklyn-tours': Building2,
};

const SUBCATEGORY_ICONS = {
  'bike-tours': Bike,
  'walking-tours': Footprints,
  'carriage-tours': Heart,
  'running-tours': Activity,
  'running-and-yoga': Activity,
  'photography-tours': Camera,
  'family-tours': Baby,
  'yoga-in-central-park': Flower2,
  'show-tickets': Ticket,
  'broadway-musicals': Music,
  'private-tours': Users,
  'food-and-drink-tours': Wine,
  'museum-of-broadway': Landmark,
  'chinatown-asian-food': UtensilsCrossed,
  'greenwich-village-food': UtensilsCrossed,
  'chelsea-market-high-line': UtensilsCrossed,
  'williamsburg-brooklyn-food': UtensilsCrossed,
  'east-village-nolita': UtensilsCrossed,
  'private-astoria-flatiron': UtensilsCrossed,
  'moma-modern-art': Landmark,
  'met-guided-highlights': Landmark,
  'met-themed-tours': Landmark,
  'met-private-special': Landmark,
  '911-memorial': Landmark,
  'intrepid-unique-museums': Landmark,
  'ferry-ellis-island': Ship,
  'ellis-island-guided': Ship,
  'sailing-sunset-cruises': Ship,
  'harbor-skyline-cruises': Ship,
  'day-trips-sightseeing': Ship,
  'greenwich-village-walks': Footprints,
  'downtown-tribeca': Footprints,
  'brooklyn-bridge-walks': Footprints,
  'central-park-walking': Footprints,
  'private-themed-walks': Footprints,
  '42nd-street-williamsburg': Footprints,
  'dumbo-skyline-night': Moon,
  'night-sailboat-cruise': Ship,
  'private-night-tours': Users,
  'brooklyn-bridge-night': Moon,
  'night-bus-tours': Moon,
  'village-nights-speakeasy': Moon,
  // Day trips
  'washington-dc': Landmark,
  'niagara-falls': Ship,
  'nyc-area-sightseeing': MapPin,
  'shopping-wine': Wine,
  'beaches-activity': Waves,
  'other-day-trips': Bus,
  // Family & Kids
  'american-dream-theme-parks': Ticket,
  'farms-planetarium': TreePine,
  'zoos-wildlife': Baby,
  'private-family-tours': Users,
  'food-treats-classes': UtensilsCrossed,
  'brooklyn-family-food': UtensilsCrossed,
  // Helicopter & Views
  'romantic-proposal': Heart,
  'classic-manhattan': Camera,
  'manhattan-brooklyn-skyline': Building2,
  'night-flights': Moon,
  'airport-niagara': Helicopter,
  'big-apple-deluxe': Helicopter,
  // Cruises & Water
  'sightseeing-landmarks': Ship,
  'architecture-yacht': Ship,
  'schooner-sunset': Ship,
  'jazz-holiday-cruises': Music,
  'dinner-brunch-cruises': UtensilsCrossed,
  'city-lights-party': Moon,
  // Brooklyn Tours
  'brooklyn-bridge-dumbo': Footprints,
  'best-of-brooklyn': Building2,
  'culture-history-walks': Landmark,
  'coney-island-sailing': Ship,
  'street-art-graffiti': Palette,
  'brooklyn-brewery-food': Wine,
};

function getCategoryIcon(slug) {
  return CATEGORY_ICONS[slug] || MapPin;
}

function getSubcategoryIcon(slug) {
  return SUBCATEGORY_ICONS[slug] || MapPin;
}

export default function ExploreCategoryClient({
  destinationSlug,
  destinationName,
  categorySlug,
  categoryTitle,
  categoryDescription,
  topPicks = [],
  otherTours = [],
  subcategories = [],
  about,
  insiderTips = [],
  whatToExpect = [],
  whoIsThisFor = [],
  highlights = [],
  faqs = [],
  topPicksHeading,
  topPicksSubtext,
  allCategories = [],
}) {
  const CategoryIcon = getCategoryIcon(categorySlug);

  function TourCard({ tour, size = 'default' }) {
    const href = tour.tourSlug
      ? `/explore/${destinationSlug}/${categorySlug}/${tour.tourSlug}`
      : getTourUrl(tour.productId, tour.title);
    const imageUrl = tour.imageUrl || null;
    const priceDisplay = tour.fromPrice || 'From price on request';
    const hasRating = typeof tour.rating === 'number' && tour.rating > 0 && typeof tour.reviewCount === 'number' && tour.reviewCount > 0;
    const isLarge = size === 'large';

    return (
      <Link
        href={href}
        className={`group flex flex-col bg-white rounded-2xl shadow-md border-2 border-gray-100 overflow-hidden text-left transition-all duration-300 hover:shadow-xl hover:border-primary/40 hover:-translate-y-1 min-h-0 ${
          isLarge ? 'shadow-lg' : 'shadow-sm'
        }`}
      >
        <div className={`w-full overflow-hidden ${imageUrl ? '' : 'bg-gradient-to-br from-primary/10 to-primary/5'} ${isLarge ? 'aspect-[16/10]' : 'aspect-[16/9]'}`}>
          {imageUrl ? (
            <Image
              src={imageUrl}
              alt=""
              width={isLarge ? 400 : 360}
              height={isLarge ? 250 : 200}
              className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
          ) : (
            <div className="h-full w-full flex items-center justify-center text-primary/50">
              <MapPin className={isLarge ? 'w-12 h-12' : 'w-10 h-10'} />
            </div>
          )}
        </div>
        <div className={`flex-1 flex flex-col border-t border-gray-100 ${isLarge ? 'p-5' : 'p-4'}`}>
          <h3 className={`font-semibold text-gray-900 group-hover:text-primary transition-colors line-clamp-2 ${isLarge ? 'text-lg' : 'text-base'}`}>
            {tour.title}
          </h3>
          {hasRating && (
            <div className="mt-2 flex items-center gap-2 text-xs text-gray-500">
              <span className="inline-flex items-center gap-1 font-medium text-gray-800">
                <svg className="w-3.5 h-3.5 text-amber-500 fill-amber-500" viewBox="0 0 20 20" aria-hidden>
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
                {Number(tour.rating).toFixed(1)}
              </span>
              <span>({tour.reviewCount.toLocaleString('en-US')})</span>
            </div>
          )}
          <div className="mt-auto pt-4 flex flex-wrap items-center justify-between gap-3">
            <p className="text-gray-500 text-sm">{priceDisplay}</p>
            <span className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-white bg-primary shadow-sm hover:opacity-90 transition-opacity">
              View &amp; Book
              <ArrowRight className="w-4 h-4" />
            </span>
          </div>
        </div>
      </Link>
    );
  }

  return (
    <>
      {/* Hero – ocean-gradient extends under nav (like explore landing) */}
      <section className="relative -mt-16 pt-20 pb-12 sm:pt-24 sm:pb-16 md:pt-24 md:pb-20 overflow-hidden ocean-gradient" aria-labelledby="category-hero-heading">
        <div className="container relative z-10 mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-[1fr,320px] gap-8 lg:gap-10 items-start">
            <div className="min-w-0 max-w-3xl">
              <p className="text-sm sm:text-base font-medium text-white/90 uppercase tracking-wide">
                Tours in {destinationName}
              </p>
              <div className="mt-4 flex flex-col sm:flex-row sm:items-start gap-6 sm:gap-8">
                <span className="flex-shrink-0 w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-white/20 backdrop-blur-sm border border-white/30 text-white flex items-center justify-center shadow-lg">
                  <CategoryIcon className="w-8 h-8 sm:w-10 sm:h-10" />
                </span>
                <div className="min-w-0">
                  <h1 id="category-hero-heading" className="font-poppins font-bold text-3xl sm:text-4xl lg:text-5xl text-white tracking-tight leading-tight">
                    {categoryTitle}
                  </h1>
                  {categoryDescription && (
                    <p className="mt-4 text-lg sm:text-xl text-white/90 leading-relaxed">
                      {categoryDescription}
                    </p>
                  )}
                  <div className="mt-6 flex flex-wrap items-center gap-3">
                    <Link
                      href={`/explore/${destinationSlug}/tours`}
                      className="inline-flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-semibold text-white sunset-gradient hover:opacity-95 transition-opacity shadow-lg"
                    >
                      View all tours in {destinationName}
                      <ArrowRight className="h-4 w-4" />
                    </Link>
                    <Link
                      href={`/explore/${destinationSlug}`}
                      className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold bg-white/10 text-white border border-white/30 hover:bg-white/20 transition-colors"
                    >
                      Back to {destinationName}
                      <ArrowRight className="h-4 w-4 rotate-180" />
                    </Link>
                  </div>
                </div>
              </div>
            </div>
            {/* Quick navigation – 6 subcategories */}
            {subcategories.length > 0 && (
              <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-5 lg:p-6">
                <h3 className="font-poppins font-bold text-gray-900 text-lg mb-3">
                  Quick navigation
                </h3>
                <p className="text-sm text-gray-600 mb-4">
                  {categoryTitle} — guides
                </p>
                <ul className="space-y-2">
                  {subcategories.slice(0, 6).map((sub) => {
                    const SubIcon = getSubcategoryIcon(sub.slug);
                    return (
                      <li key={sub.slug}>
                        <Link
                          href={`/explore/${destinationSlug}/${categorySlug}/${sub.slug}`}
                          className="flex items-center gap-2 text-gray-700 hover:text-primary font-medium text-sm py-1.5 hover:bg-gray-100 rounded-lg px-2 -mx-2 transition-colors"
                        >
                          <SubIcon className="w-3.5 h-3.5 text-primary/70 shrink-0" />
                          {sub.title}
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Breadcrumbs – below hero */}
      <div className="bg-gray-50/80 border-b border-gray-200">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-3">
          <nav className="flex items-center gap-2 text-sm text-gray-500" aria-label="Breadcrumb">
            <Link href="/" className="hover:text-primary transition-colors">Home</Link>
            <span aria-hidden className="text-gray-300">/</span>
            <Link href={`/explore/${destinationSlug}`} className="hover:text-primary transition-colors">{destinationName}</Link>
            <span aria-hidden className="text-gray-300">/</span>
            <span className="text-gray-900 font-medium">{categoryTitle}</span>
          </nav>
        </div>
      </div>

      {/* Top picks – 4 cards in 2x2, section in card */}
      {topPicks.length > 0 && (
        <section id="top-picks" className="py-16 lg:py-20 bg-gradient-to-b from-primary/5 via-white to-primary/[0.03]" aria-labelledby="top-picks-heading">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-5xl">
            <div className="rounded-3xl bg-white/80 backdrop-blur-sm border-2 border-primary/10 shadow-lg p-8 sm:p-10 mb-10">
              <span className="inline-block rounded-full bg-primary/10 text-primary px-4 py-1.5 text-xs font-semibold uppercase tracking-widest">
                Top picks
              </span>
              <h2 id="top-picks-heading" className="font-poppins font-bold text-2xl sm:text-3xl text-gray-900 mt-3 mb-1">
                {topPicksHeading || 'Popular choices — view & book'}
              </h2>
              <p className="text-gray-600 text-sm">
                {topPicksSubtext || `Handpicked ${categoryTitle.toLowerCase()} we recommend. Compare and book with free cancellation on most tours.`}
              </p>
            </div>
            <div className="grid sm:grid-cols-2 gap-6">
              {topPicks.map((tour) => (
                <TourCard key={tour.productId} tour={tour} size="large" />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Other tours – 6 in 3 cols */}
      {otherTours.length > 0 && (
        <section className="py-16 lg:py-20 bg-white" aria-labelledby="other-tours-heading">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-6xl">
            <div className="rounded-2xl bg-gradient-to-br from-primary/5 to-primary/10 border-2 border-primary/10 shadow-md p-6 sm:p-8 mb-10 inline-block">
              <span className="text-xs font-semibold text-primary uppercase tracking-widest">More options</span>
              <h2 id="other-tours-heading" className="font-poppins font-bold text-xl sm:text-2xl text-gray-900 mt-1">
                More {categoryTitle.toLowerCase()}
              </h2>
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {otherTours.map((tour) => (
                <TourCard key={tour.productId} tour={tour} size="default" />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Guides – subcategory links (Aru365-style label) */}
      {subcategories.length > 0 && (
        <section className="py-16 lg:py-20 bg-primary/5 border-y border-primary/10" aria-labelledby="subcategories-heading">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-5xl">
            <p className="text-sm font-medium text-primary uppercase tracking-wider">Guides</p>
            <h2 id="subcategories-heading" className="font-poppins font-bold text-2xl text-gray-900 mt-1 mb-2">
              Find the right option for you
            </h2>
            <p className="text-gray-600 mb-8 max-w-2xl">
              Use these guides to compare by style, time of day, or what&apos;s included—then come back here to see specific tours and book.
            </p>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {subcategories.map((sub) => {
                const SubIcon = getSubcategoryIcon(sub.slug);
                return (
                  <Link
                    key={sub.slug}
                    href={`/explore/${destinationSlug}/${categorySlug}/${sub.slug}`}
                    className="group flex items-center gap-4 rounded-2xl border-2 border-gray-100 bg-white px-6 py-5 font-medium text-gray-800 shadow-sm transition-all duration-200 hover:border-primary/30 hover:shadow-lg hover:-translate-y-0.5"
                  >
                    <span className="flex-shrink-0 w-12 h-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center group-hover:bg-primary group-hover:text-white transition-colors">
                      <SubIcon className="w-6 h-6" />
                    </span>
                    <span className="min-w-0 flex-1 group-hover:text-primary transition-colors">{sub.title}</span>
                    <ArrowRight className="w-5 h-5 text-gray-300 group-hover:text-primary shrink-0 transition-colors" />
                  </Link>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* About */}
      {about && (
        <section className="py-14 lg:py-20 bg-white" aria-labelledby="about-heading">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-4xl">
            <div className="rounded-2xl border-l-4 border-primary bg-primary/5 p-8 lg:p-10">
              <h2 id="about-heading" className="font-poppins font-bold text-xl text-gray-900 mb-4">
                About {categoryTitle}
              </h2>
              <p className="text-gray-600 leading-relaxed">{renderTextWithBold(about)}</p>
            </div>
          </div>
        </section>
      )}

      {/* Content cards: Insider tips, What to expect, Who is this for, Highlights (Aru365-style) */}
      {(insiderTips.length > 0 || whatToExpect.length > 0 || whoIsThisFor.length > 0 || highlights.length > 0) && (
        <section className="py-14 lg:py-20 bg-gray-50/80 border-y border-gray-200" aria-labelledby="content-cards-heading">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-4xl">
            <div className="grid sm:grid-cols-1 lg:grid-cols-2 gap-6">
              {insiderTips.length > 0 && (
                <div className="rounded-2xl border-2 border-amber-200 bg-white p-6 lg:p-8 shadow-sm">
                  <h2 className="font-poppins font-bold text-lg text-gray-900 mb-4 flex items-center gap-2">
                    <span className="text-amber-600" aria-hidden>
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" /></svg>
                    </span>
                    Insider tips
                  </h2>
                  <ul className="space-y-3 text-gray-600 leading-relaxed">
                    {insiderTips.map((tip, i) => (
                      <li key={i} className="flex gap-3">
                        <span className="shrink-0 mt-1 w-1.5 h-1.5 rounded-full bg-amber-500" aria-hidden />
                        <span>{tip}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              {whatToExpect.length > 0 && (
                <div className="rounded-2xl border-2 border-primary/20 bg-white p-6 lg:p-8 shadow-sm">
                  <h2 className="font-poppins font-bold text-lg text-gray-900 mb-4 flex items-center gap-2">
                    <span className="text-primary" aria-hidden>
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" /></svg>
                    </span>
                    What to expect
                  </h2>
                  <ol className="space-y-3 text-gray-600 leading-relaxed list-none">
                    {whatToExpect.map((step, i) => (
                      <li key={i} className="flex gap-3">
                        <span className="shrink-0 font-semibold text-primary w-6">{i + 1}.</span>
                        <span>{step}</span>
                      </li>
                    ))}
                  </ol>
                </div>
              )}
              {whoIsThisFor.length > 0 && (
                <div className="rounded-2xl border-2 border-emerald-200 bg-white p-6 lg:p-8 shadow-sm lg:col-span-2">
                  <h2 className="font-poppins font-bold text-lg text-gray-900 mb-4 flex items-center gap-2">
                    <span className="text-emerald-600" aria-hidden>
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /></svg>
                    </span>
                    Who is this for?
                  </h2>
                  <ul className="space-y-2 text-gray-600 leading-relaxed">
                    {whoIsThisFor.map((item, i) => (
                      <li key={i} className="flex gap-3">
                        <span className="shrink-0 mt-1.5 w-2 h-2 rounded-full bg-emerald-500" aria-hidden />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              {highlights.length > 0 && (
                <div className="rounded-2xl border-2 border-primary/20 bg-white p-6 lg:p-8 shadow-sm lg:col-span-2">
                  <h2 className="font-poppins font-bold text-lg text-gray-900 mb-4 flex items-center gap-2">
                    <span className="text-amber-500" aria-hidden>
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>
                    </span>
                    Highlights
                  </h2>
                  <ul className="flex flex-wrap gap-2">
                    {highlights.map((h, i) => (
                      <li key={i}>
                        <span className="inline-flex items-center px-3 py-1.5 rounded-full text-sm font-medium bg-primary/10 text-primary border border-primary/20">
                          {h}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        </section>
      )}

      {/* FAQ – card wrapper + accordion */}
      {faqs.length > 0 && (
        <section className="py-16 lg:py-20 bg-gradient-to-b from-primary/5 to-white border-y border-primary/10" aria-labelledby="faq-heading">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-4xl">
            <p className="text-sm font-medium text-primary uppercase tracking-wider">Help</p>
            <h2 id="faq-heading" className="font-poppins font-bold text-2xl text-gray-900 mt-1 mb-8 flex items-center gap-2">
              <HelpCircle className="w-7 h-7 text-primary" />
              Frequently asked questions
            </h2>
              <div className="space-y-3">
                {faqs.map((faq, i) => (
                  <details
                    key={i}
                    className="group rounded-2xl border-2 border-primary/10 bg-gray-50/50 overflow-hidden hover:border-primary/30 transition-colors"
                  >
                    <summary className="px-5 py-4 font-semibold text-gray-900 cursor-pointer list-none flex justify-between items-center gap-4 select-none outline-none focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 focus-visible:ring-inset rounded-xl">
                      <span className="pr-2">{faq.question}</span>
                      <span className="shrink-0 w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center group-open:bg-primary group-open:text-white transition-colors">
                        <ChevronDown className="w-5 h-5 group-open:rotate-180 transition-transform" />
                      </span>
                    </summary>
                    <div className="px-5 pb-5 pt-0 text-gray-600 leading-relaxed border-t border-gray-100 bg-white">
                      {faq.answer}
                    </div>
                  </details>
                ))}
              </div>
          </div>
        </section>
      )}

      {/* Related categories */}
      {allCategories.length > 0 && (
        <section className="py-14 lg:py-20 bg-white border-t border-gray-200" aria-labelledby="related-heading">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-5xl">
            <p className="text-sm font-medium text-primary uppercase tracking-wider">More to explore</p>
            <h2 id="related-heading" className="font-poppins font-bold text-2xl text-gray-900 mt-1 mb-8">
              Related categories in {destinationName}
            </h2>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {allCategories
                .filter((c) => c.slug !== categorySlug)
                .slice(0, 6)
                .map((c) => (
                  <Link
                    key={c.slug}
                    href={`/explore/${destinationSlug}/${c.slug}`}
                    className="group flex items-center gap-4 rounded-2xl border-2 border-gray-100 bg-white px-5 py-4 font-medium text-gray-800 shadow-sm transition-all duration-200 hover:border-primary/30 hover:shadow-md hover:-translate-y-0.5"
                  >
                    <span className="min-w-0 flex-1 group-hover:text-primary transition-colors">{c.title}</span>
                    <ArrowRight className="w-5 h-5 text-gray-300 group-hover:text-primary shrink-0 transition-colors" />
                  </Link>
                ))}
            </div>
            <Link
              href={`/explore/${destinationSlug}/tours`}
              className="mt-8 inline-flex items-center gap-2 px-6 py-3 rounded-xl font-semibold text-white bg-primary hover:opacity-90 transition-opacity shadow-md"
            >
              View all tours in {destinationName}
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </section>
      )}
    </>
  );
}
