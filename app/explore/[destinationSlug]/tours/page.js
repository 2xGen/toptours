import { notFound } from 'next/navigation';
import Link from 'next/link';
import { Suspense } from 'react';
import {
  getV3LandingDestination,
  getV3LandingAllToursForDestination,
  getV3ViatorProductSummaries,
} from '@/lib/v3LandingData';
import { fetchProductsBulk } from '@/lib/viatorBulk';
import NavigationNext from '@/components/NavigationNext';
import FooterNext from '@/components/FooterNext';
import { ToursCategoryFilter } from '@/components/explore/ToursCategoryFilter';
import { ToursSortSelect } from '@/components/explore/ToursSortSelect';
import ExploreToursListingClient from './ExploreToursListingClient';

export const revalidate = 3600;

/** Static params: destinations that have v3 landing tours (e.g. new-york-city). */
export async function generateStaticParams() {
  try {
    const { createSupabaseServiceRoleClient } = await import('@/lib/supabaseClient');
    const supabase = createSupabaseServiceRoleClient();
    const { data } = await supabase
      .from('v3_landing_category_tours')
      .select('destination_slug')
      .limit(100);
    const slugs = [...new Set((data || []).map((r) => r.destination_slug).filter(Boolean))];
    return slugs.map((destinationSlug) => ({ destinationSlug }));
  } catch {
    return [{ destinationSlug: 'new-york-city' }];
  }
}

const TOURS_PER_PAGE = 21;
const VALID_SORT = ['price_asc', 'price_desc', 'rating_asc', 'rating_desc'];

function parsePrice(str) {
  if (!str || typeof str !== 'string') return 0;
  const m = str.match(/[\d,]+(?:\.\d{2})?/);
  return m ? parseFloat(m[0].replace(/,/g, '')) : 0;
}

function buildQuery(params) {
  const q = new URLSearchParams();
  if (params.category) q.set('category', params.category);
  if (params.sort) q.set('sort', params.sort);
  if (params.page && params.page > 1) q.set('page', String(params.page));
  const s = q.toString();
  return s ? `?${s}` : '';
}

export async function generateMetadata({ params, searchParams }) {
  const { destinationSlug } = await params;
  const { category: categoryParam } = await searchParams || {};
  const destination = await getV3LandingDestination(destinationSlug);
  const data = await getV3LandingAllToursForDestination(destinationSlug);
  if (!destination || !data) return { title: 'Tours' };

  const validCategory =
    categoryParam && data.categories.some((c) => c.slug === categoryParam) ? categoryParam : null;
  const category = validCategory ? data.categories.find((c) => c.slug === validCategory) : null;

  const basePath = `/explore/${destinationSlug}/tours`;
  const canonical = category
    ? `https://toptours.ai${basePath}?category=${encodeURIComponent(validCategory)}`
    : `https://toptours.ai${basePath}`;

  const openGraphBase = { url: canonical, siteName: 'TopTours.ai', type: 'website', locale: 'en_US' };
  const META_DESC_MAX = 160;

  if (category) {
    const title = `${category.title} | Tours & Activities | ${destination.name} | TopTours.ai`;
    let description =
      category.description ||
      `Browse and book ${category.title.toLowerCase()} in ${destination.name}. Compare options and prices.`;
    if (description.length > META_DESC_MAX) description = description.slice(0, META_DESC_MAX - 3).trim() + '...';
    return {
      title,
      description,
      alternates: { canonical },
      openGraph: { ...openGraphBase, title, description },
      robots: { index: true, follow: true },
    };
  }

  const title = `Tours & Activities in ${destination.name} | TopTours.ai`;
  const description = `Browse and book tours and activities in ${destination.name}. Compare options and prices in one place.`;
  return {
    title,
    description,
    alternates: { canonical },
    openGraph: { ...openGraphBase, title, description },
    robots: { index: true, follow: true },
  };
}

export default async function ExploreToursPage({ params, searchParams }) {
  const { destinationSlug } = await params;
  const search = await searchParams || {};
  const categoryParam = search.category;
  const sortParam = search.sort;
  const pageParam = search.page;

  const [destination, data] = await Promise.all([
    getV3LandingDestination(destinationSlug),
    getV3LandingAllToursForDestination(destinationSlug),
  ]);

  if (!destination || !data) notFound();

  const { tours: allTours, categories } = data;
  const validCategory =
    categoryParam && categories.some((c) => c.slug === categoryParam) ? categoryParam : null;
  const category = validCategory ? categories.find((c) => c.slug === validCategory) : null;

  let tours = validCategory ? allTours.filter((t) => t.categorySlug === validCategory) : [...allTours];
  const validSort = sortParam && VALID_SORT.includes(sortParam) ? sortParam : null;

  if (validSort) {
    tours = [...tours].sort((a, b) => {
      if (validSort === 'price_asc' || validSort === 'price_desc') {
        const pa = parsePrice(a.fromPrice);
        const pb = parsePrice(b.fromPrice);
        return validSort === 'price_asc' ? pa - pb : pb - pa;
      }
      const ra = Number(a.rating) || 0;
      const rb = Number(b.rating) || 0;
      return validSort === 'rating_desc' ? rb - ra : ra - rb;
    });
  }

  const totalTours = tours.length;
  const totalPages = Math.max(1, Math.ceil(totalTours / TOURS_PER_PAGE));
  const page = Math.min(totalPages, Math.max(1, parseInt(pageParam ?? '1', 10) || 1));
  const start = (page - 1) * TOURS_PER_PAGE;
  const toursOnPage = tours.slice(start, start + TOURS_PER_PAGE);

  // Enrich with images/prices: DB first, then viator_products, then live API. Always pass explicit imageUrl so client gets it.
  let enrichedTours = toursOnPage;
  const codes = toursOnPage.map((t) => t.productId).filter(Boolean);
  if (codes.length > 0) {
    try {
      const dbSummaries = await getV3ViatorProductSummaries(codes);
      enrichedTours = toursOnPage.map((t) => {
        const s = dbSummaries.get(t.productId);
        const imageUrl = t.imageUrl || (s && s.imageUrl) || null;
        const fromPrice = t.fromPrice || (s && s.fromPrice) || null;
        return {
          ...t,
          imageUrl,
          fromPrice,
          rating: t.rating ?? (s && s.rating),
          reviewCount: t.reviewCount ?? (s && s.reviewCount),
        };
      });
    } catch {
      // keep existing
    }
    try {
      const summaries = await fetchProductsBulk(codes);
      const byCode = new Map(summaries.map((s) => [s.productCode, s]));
      enrichedTours = enrichedTours.map((t) => {
        const s = byCode.get(t.productId);
        const imageUrl = t.imageUrl || (s && s.imageUrl) || null;
        const fromPrice = t.fromPrice || (s && s.fromPriceDisplay) || null;
        return {
          ...t,
          imageUrl,
          fromPrice,
          rating: t.rating ?? (s && s.rating),
          reviewCount: t.reviewCount ?? (s && s.reviewCount),
        };
      });
    } catch {
      // keep DB/viator_products values
    }
  }
  // Normalize: ensure every tour has imageUrl (string | null) so client never receives undefined
  enrichedTours = enrichedTours.map((t) => ({
    ...t,
    imageUrl: t.imageUrl ?? null,
    fromPrice: t.fromPrice ?? null,
  }));

  const basePath = `/explore/${destinationSlug}/tours`;
  const pageTitle = category ? category.title : `Tours & Activities in ${destination.name}`;
  const pageDescription = category
    ? (category.description || `Browse and book ${category.title.toLowerCase()} in ${destination.name}. Compare options and prices.`)
    : `Browse and book tours and activities in ${destination.name}. Compare options and prices in one place.`;

  const categoryFilterOptions = categories.map((c) => ({
    value: c.slug,
    label: c.title.replace(new RegExp(`\\s+in\\s+${destination.name}$`, 'i'), '').trim() || c.title,
  }));

  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://toptours.ai' },
      { '@type': 'ListItem', position: 2, name: destination.name, item: `https://toptours.ai/explore/${destinationSlug}` },
      { '@type': 'ListItem', position: 3, name: 'Tours & Activities', item: `https://toptours.ai${basePath}${validCategory ? `?category=${encodeURIComponent(validCategory)}` : ''}` },
    ],
  };

  const listSchema = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: pageTitle,
    description: pageDescription,
    url: `https://toptours.ai${basePath}${validCategory ? `?category=${encodeURIComponent(validCategory)}` : ''}`,
    numberOfItems: totalTours,
    itemListElement: enrichedTours.map((t, i) => ({
      '@type': 'ListItem',
      position: start + i + 1,
      item: {
        '@type': 'Product',
        name: t.title,
        url: t.tourSlug
          ? `https://toptours.ai/explore/${destinationSlug}/${t.categorySlug}/${t.tourSlug}`
          : `https://toptours.ai/tours/${t.productId}/${(t.title || '').toLowerCase().replace(/[^a-z0-9]+/g, '-')}`,
      },
    })),
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(listSchema) }}
      />
      <NavigationNext />
      <main className="min-h-screen bg-white pt-16">
        <div className="border-b border-gray-200 bg-white">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <nav className="flex items-center gap-2 text-sm text-gray-500" aria-label="Breadcrumb">
              <Link href="/" className="hover:text-primary transition-colors">Home</Link>
              <span aria-hidden>/</span>
              <Link href={`/explore/${destinationSlug}`} className="hover:text-primary transition-colors">{destination.name}</Link>
              <span aria-hidden>/</span>
              <span className="text-gray-900 font-medium">Tours &amp; Activities</span>
            </nav>
          </div>
        </div>

        <div className="bg-primary/5 border-b border-primary/10 py-12 lg:py-16">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-4xl">
            <h1 className="font-poppins font-bold text-3xl sm:text-4xl text-gray-900 tracking-tight">
              {pageTitle}
            </h1>
            <p className="mt-4 text-lg text-gray-600 leading-relaxed">
              {pageDescription}
            </p>
            <div className="mt-8">
              <Suspense fallback={<div className="h-12 w-52 rounded-xl bg-gray-100 animate-pulse" />}>
                <ToursCategoryFilter
                  options={categoryFilterOptions}
                  currentValue={validCategory}
                  basePath={basePath}
                />
              </Suspense>
            </div>
          </div>
        </div>

        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-10 lg:py-14">
          <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
            <p className="text-gray-500 text-sm">
              {totalTours === 0 ? (
                'No tours found.'
              ) : totalPages > 1 ? (
                <>
                  Showing {start + 1}–{Math.min(start + TOURS_PER_PAGE, totalTours)} of {totalTours} tour{totalTours !== 1 ? 's' : ''}.
                </>
              ) : validCategory ? (
                <>
                  Showing {totalTours} tour{totalTours !== 1 ? 's' : ''} in this category.
                </>
              ) : (
                <>Showing all {totalTours} tours and activities.</>
              )}
            </p>
            <Suspense fallback={<div className="h-12 w-44 rounded-xl bg-gray-100 animate-pulse" />}>
              <ToursSortSelect currentValue={validSort} basePath={basePath} />
            </Suspense>
          </div>

          <ExploreToursListingClient
            tours={enrichedTours}
            destinationSlug={destinationSlug}
            destinationName={destination.name}
          />

          {totalPages > 1 && (
            <nav className="mt-12 flex flex-wrap items-center justify-center gap-2" aria-label="Pagination">
              {page > 1 && (
                <Link
                  href={`${basePath}${buildQuery({ category: validCategory, sort: validSort, page: page - 1 })}`}
                  className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-sm font-semibold text-gray-700 bg-white border-2 border-gray-200 hover:border-primary hover:text-primary transition-colors"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                  Previous
                </Link>
              )}
              <span className="px-4 py-2.5 text-sm font-medium text-gray-600">
                Page {page} of {totalPages}
              </span>
              {page < totalPages && (
                <Link
                  href={`${basePath}${buildQuery({ category: validCategory, sort: validSort, page: page + 1 })}`}
                  className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-sm font-semibold text-gray-700 bg-white border-2 border-gray-200 hover:border-primary hover:text-primary transition-colors"
                >
                  Next
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </Link>
              )}
            </nav>
          )}
        </div>
      </main>
      <FooterNext />
    </>
  );
}
