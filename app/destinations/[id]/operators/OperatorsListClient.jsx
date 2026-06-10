'use client';

import React, { useState, useMemo } from 'react';
import NavigationNext from '@/components/NavigationNext';
import FooterNext from '@/components/FooterNext';
import SmartTourFinder from '@/components/home/SmartTourFinder';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import Link from 'next/link';
import {
  ArrowRight,
  Building2,
  Search,
  Share2,
  Star,
  X,
  TrendingUp,
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import ShareModal from '@/components/sharing/ShareModal';

function OperatorCard({ op, featured = false }) {
  return (
    <Link href={op.href} className="group block h-full">
      <Card
        className={`h-full bg-white shadow-sm transition-all group-hover:shadow-md group-hover:border-primary/40 ${
          featured ? 'border-amber-200 ring-1 ring-amber-100' : 'border-gray-200'
        }`}
      >
        <CardContent className="p-5 flex flex-col h-full">
          {featured && (
            <span className="inline-flex items-center gap-1 text-xs font-semibold text-amber-700 bg-amber-50 rounded-full px-2.5 py-0.5 w-fit mb-2">
              <TrendingUp className="w-3 h-3" />
              Most reviewed
            </span>
          )}
          <h3 className="font-bold text-gray-900 group-hover:text-primary line-clamp-2 mb-2">
            {op.operatorName}
          </h3>
          <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-gray-600 mt-auto">
            <span>
              <span className="font-semibold text-gray-900">{op.tourCount}</span>{' '}
              {op.tourCount === 1 ? 'tour' : 'tours'}
            </span>
            {op.averageRating && op.totalReviews > 0 && (
              <span className="inline-flex items-center gap-1">
                <Star className="w-4 h-4 text-amber-500 fill-amber-500 shrink-0" />
                <span className="font-medium text-gray-800">{op.averageRating}</span>
                <span className="text-gray-500">
                  ({op.totalReviews.toLocaleString('en-US')} reviews)
                </span>
              </span>
            )}
          </div>
          <p className="mt-3 text-sm font-medium text-primary inline-flex items-center gap-1">
            View all tours
            <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
          </p>
        </CardContent>
      </Card>
    </Link>
  );
}

export default function OperatorsListClient({
  destination,
  operators = [],
  operatorPages = [],
  operatorPagesEnabled = false,
}) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showStickyButton, setShowStickyButton] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showShareModal, setShowShareModal] = useState(false);

  const hasOperatorLanding = operatorPages.length > 0;
  const destName = destination.fullName || destination.name;

  const sortedByReviews = useMemo(
    () => [...operatorPages].sort((a, b) => (b.totalReviews || 0) - (a.totalReviews || 0)),
    [operatorPages]
  );

  const topPopular = sortedByReviews.slice(0, 6);

  const filteredPages = useMemo(() => {
    if (!searchTerm.trim()) return sortedByReviews;
    const q = searchTerm.toLowerCase();
    return sortedByReviews.filter((op) => op.operatorName.toLowerCase().includes(q));
  }, [sortedByReviews, searchTerm]);

  const totalReviews = sortedByReviews.reduce((sum, op) => sum + (op.totalReviews || 0), 0);

  const defaultOgImage =
    'https://ouqeoizufbofdqbuiwvx.supabase.co/storage/v1/object/public/blogs/Explore%20any%20destination%20with%20TopToursai.png';
  const heroImage = destination.imageUrl || defaultOgImage;
  const pageUrl = `https://toptours.ai/destinations/${destination.id}/operators`;

  const listForSchema = hasOperatorLanding ? operatorPages : operators;

  const itemListJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: `Tour Operators in ${destName}`,
    description: `Tour operators offering experiences in ${destName} with reviews and bookable tours.`,
    numberOfItems: listForSchema.length,
    itemListElement: (hasOperatorLanding ? operatorPages : operators).map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      item: {
        '@type': 'Organization',
        name: hasOperatorLanding ? item.operatorName : item.operator_name,
        url: hasOperatorLanding
          ? `https://toptours.ai${item.href}`
          : pageUrl,
        ...(hasOperatorLanding &&
          item.totalReviews > 0 &&
          item.averageRating && {
            aggregateRating: {
              '@type': 'AggregateRating',
              ratingValue: item.averageRating,
              reviewCount: item.totalReviews,
            },
          }),
      },
    })),
  };

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
      { '@type': 'ListItem', position: 4, name: 'Tour Operators', item: pageUrl },
    ],
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(itemListJsonLd) }} />

      <NavigationNext onOpenModal={() => setIsModalOpen(true)} />
      <SmartTourFinder isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />

      <div className="min-h-screen pt-16 bg-gradient-to-b from-blue-50 via-white to-white">
        {/* Hero */}
        <section className="relative py-16 sm:py-20 ocean-gradient text-white -mt-12 sm:-mt-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid lg:grid-cols-2 gap-10 items-center">
              <div>
                <div className="inline-flex items-center gap-2 text-sm text-white/80 mb-4">
                  <Building2 className="w-4 h-4" />
                  <span>{destName} operators</span>
                </div>
                <div className="flex items-start gap-3 mb-4">
                  <h1 className="text-3xl sm:text-4xl md:text-5xl font-poppins font-bold flex-1">
                    Tour operators in {destName}
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
                <p className="text-lg text-white/90 max-w-xl mb-6">
                  {hasOperatorLanding ? (
                    <>
                      Compare <strong>{operatorPages.length}</strong> local operators — each with
                      their own tour catalog, combined ratings, and live booking links.
                    </>
                  ) : (
                    <>
                      Find trusted tour companies offering experiences in {destName}. Compare
                      operators and book with flexible cancellation.
                    </>
                  )}
                </p>
                {hasOperatorLanding && totalReviews > 0 && (
                  <p className="text-sm text-white/75 mb-6">
                    Based on {totalReviews.toLocaleString('en-US')}+ traveler reviews across
                    operator catalogs on TopTours.ai
                  </p>
                )}
                <div className="flex flex-wrap gap-3">
                  {hasOperatorLanding && (
                    <Button asChild className="bg-white text-blue-600 hover:bg-gray-100">
                      <a href="#all-operators">
                        Browse all operators
                        <ArrowRight className="w-4 h-4 ml-2" />
                      </a>
                    </Button>
                  )}
                  <Button
                    asChild
                    variant={hasOperatorLanding ? 'ghost' : 'default'}
                    className={
                      hasOperatorLanding
                        ? 'border border-white/70 bg-white/10 text-white hover:bg-white/20 hover:text-white'
                        : 'sunset-gradient text-white'
                    }
                  >
                    <Link href={`/destinations/${destination.id}/tours`}>
                      All tours in {destName}
                    </Link>
                  </Button>
                </div>
              </div>
              <div className="hidden sm:block relative">
                <Card className="border-0 shadow-2xl overflow-hidden">
                  <img src={heroImage} alt={destName} className="w-full h-64 object-cover" />
                </Card>
              </div>
            </div>
          </div>
        </section>

        {/* Breadcrumb */}
        <section className="bg-white border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
            <nav className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs sm:text-sm text-gray-500">
              <Link href="/" className="hover:text-gray-700">Home</Link>
              <span>/</span>
              <Link href="/destinations" className="hover:text-gray-700">Destinations</Link>
              <span>/</span>
              <Link href={`/destinations/${destination.id}`} className="hover:text-gray-700">
                {destName}
              </Link>
              <span>/</span>
              <span className="text-gray-900 font-medium">Operators</span>
            </nav>
          </div>
        </section>

        {hasOperatorLanding ? (
          <>
            {/* Most popular */}
            {topPopular.length > 0 && (
              <section className="py-12 sm:py-14 px-4 bg-white">
                <div className="max-w-7xl mx-auto">
                  <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
                    Most popular operators in {destName}
                  </h2>
                  <p className="text-gray-600 mb-8 max-w-2xl">
                    Ranked by total verified reviews across their {destName} tours.
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {topPopular.map((op) => (
                      <OperatorCard key={op.slug} op={op} featured />
                    ))}
                  </div>
                </div>
              </section>
            )}

            {/* All operators */}
            <section id="all-operators" className="py-12 sm:py-14 px-4 bg-gray-50 border-t">
              <div className="max-w-7xl mx-auto">
                <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-8">
                  <div>
                    <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
                      All operators in {destName}
                    </h2>
                    <p className="text-gray-600">
                      {operatorPages.length} tour operators — compare reviews, tours, and book with
                      live availability.
                    </p>
                  </div>
                  <div className="relative w-full md:w-72">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <Input
                      type="text"
                      placeholder="Search operators..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 bg-white"
                    />
                  </div>
                </div>

                {filteredPages.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                    {filteredPages.map((op) => (
                      <OperatorCard key={op.slug} op={op} />
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <p className="text-gray-600 mb-4">No operators match &ldquo;{searchTerm}&rdquo;</p>
                    <Button onClick={() => setSearchTerm('')} variant="outline">
                      Clear search
                    </Button>
                  </div>
                )}
              </div>
            </section>
          </>
        ) : (
          /* Legacy fallback — CRM list (non-clickable unless index is built) */
          <section className="py-12 px-4 bg-white">
            <div className="max-w-7xl mx-auto">
              {operatorPagesEnabled && operators.length > 0 && (
                <p className="mb-6 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
                  Operator detail pages are still being built for {destName}. Individual operator
                  links will appear here once indexing finishes — usually within a few hours.
                </p>
              )}
              <div className="mb-8 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">
                    {operators.length} tour operators in {destName}
                  </h2>
                </div>
                <div className="relative w-full md:w-64">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <Input
                    type="text"
                    placeholder="Search operators..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {operators
                  .filter((op) =>
                    !searchTerm.trim() ||
                    (op.operator_name || '').toLowerCase().includes(searchTerm.toLowerCase())
                  )
                  .map((op) => (
                    <Card key={op.id} className="border border-gray-200">
                      <CardContent className="p-4">
                        <h3 className="font-bold text-gray-900 line-clamp-2">{op.operator_name}</h3>
                        <p className="text-sm text-gray-600 mt-2">
                          {(op.tour_product_ids || []).length} tours tracked
                        </p>
                      </CardContent>
                    </Card>
                  ))}
              </div>
            </div>
          </section>
        )}

        {/* Footer CTA */}
        <section className="py-10 px-4 bg-white border-t">
          <div className="max-w-3xl mx-auto text-center">
            <p className="text-gray-600 mb-4">
              Planning a trip to {destName}? See curated picks, guides, and every bookable tour.
            </p>
            <div className="flex flex-wrap justify-center gap-3">
              <Button asChild variant="outline">
                <Link href={`/destinations/${destination.id}`}>{destName} travel guide</Link>
              </Button>
              <Button asChild className="sunset-gradient text-white">
                <Link href={`/destinations/${destination.id}/tours`}>
                  Browse all tours
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Link>
              </Button>
            </div>
          </div>
        </section>

        {showStickyButton && (
          <div className="fixed bottom-4 right-4 z-40">
            <div className="flex flex-col items-end gap-2">
              <button
                type="button"
                onClick={() => setShowStickyButton(false)}
                className="w-9 h-9 bg-white rounded-full shadow-lg border flex items-center justify-center"
                aria-label="Close"
              >
                <X className="w-4 h-4 text-gray-700" />
              </button>
              <Button asChild className="sunset-gradient text-white shadow-lg rounded-full px-5">
                <Link href={`/destinations/${destination.id}/tours`}>
                  All {destName} tours
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Link>
              </Button>
            </div>
          </div>
        )}
      </div>

      <ShareModal
        isOpen={showShareModal}
        onClose={() => setShowShareModal(false)}
        url={pageUrl}
        title={`Tour operators in ${destName}`}
      />

      <FooterNext />
    </>
  );
}
