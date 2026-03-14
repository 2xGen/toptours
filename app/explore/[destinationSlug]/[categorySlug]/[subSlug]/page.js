import { notFound } from 'next/navigation';
import {
  getV3LandingDestination,
  getV3LandingCategories,
  getV3LandingSubcategory,
  getV3LandingSubcategoryParams,
  getV3LandingTourBySlug,
  getV3LandingTourParams,
  getV3LandingCategoryContent,
  getV3ViatorProduct,
  getV3ViatorProductSummaries,
} from '@/lib/v3LandingData';
import { getExploreSubcategory, getExploreCategoryContent } from '@/data/exploreCategoryContent';
import NavigationNext from '@/components/NavigationNext';
import FooterNext from '@/components/FooterNext';
import ExploreSubcategoryClient from './ExploreSubcategoryClient';
import ExploreTourDetailClient from './ExploreTourDetailClient';

export const revalidate = 3600;

const META_DESC_MAX = 160;

function truncateMetaDesc(str) {
  if (!str || str.length <= META_DESC_MAX) return str || '';
  return str.slice(0, META_DESC_MAX - 3).trim() + '...';
}

export async function generateMetadata({ params }) {
  const { destinationSlug, categorySlug, subSlug } = await params;
  const [destination, categories, subFromDb, tourFromDb] = await Promise.all([
    getV3LandingDestination(destinationSlug),
    getV3LandingCategories(destinationSlug),
    getV3LandingSubcategory(destinationSlug, categorySlug, subSlug),
    getV3LandingTourBySlug(destinationSlug, categorySlug, subSlug),
  ]);
  const category = categories?.find((c) => c.slug === categorySlug);
  const canonical = `https://toptours.ai/explore/${destinationSlug}/${categorySlug}/${subSlug}`;
  const openGraphBase = { url: canonical, siteName: 'TopTours.ai', type: 'website', locale: 'en_US' };

  if (tourFromDb) {
    if (!destination || !category) return { title: 'Tour' };
    const title = tourFromDb.seoMetaTitle || `${tourFromDb.title} | ${category.title} | ${destination.name} | TopTours.ai`;
    const description = truncateMetaDesc(
      tourFromDb.seoMetaDescription || `Book ${tourFromDb.title} in ${destination.name}. Compare and book with free cancellation.`
    );
    return {
      title,
      description,
      alternates: { canonical },
      openGraph: { ...openGraphBase, title, description },
      robots: { index: true, follow: true },
    };
  }

  const sub = subFromDb || getExploreSubcategory(destinationSlug, categorySlug, subSlug);
  if (!destination || !category || !sub) return { title: 'Tours' };

  const title = `${sub.title} | ${category.title} | ${destination.name} | TopTours.ai`;
  const description = truncateMetaDesc(
    sub.description || `Book the best ${sub.title.toLowerCase()} in ${destination.name}. Compare and book with free cancellation.`
  );
  return {
    title,
    description,
    alternates: { canonical },
    openGraph: { ...openGraphBase, title, description },
    robots: { index: true, follow: true },
  };
}

export async function generateStaticParams() {
  const [subParams, tourParams] = await Promise.all([
    getV3LandingSubcategoryParams(),
    getV3LandingTourParams(),
  ]);
  const combined = [...subParams, ...tourParams];
  if (combined.length > 0) return combined;
  const { getExploreSubcategoryParams } = await import('@/data/exploreCategoryContent');
  return getExploreSubcategoryParams();
}

export default async function ExploreSubcategoryPage({ params }) {
  const { destinationSlug, categorySlug, subSlug } = await params;
  const [destination, categories, subFromDb, tourFromDb] = await Promise.all([
    getV3LandingDestination(destinationSlug),
    getV3LandingCategories(destinationSlug),
    getV3LandingSubcategory(destinationSlug, categorySlug, subSlug),
    getV3LandingTourBySlug(destinationSlug, categorySlug, subSlug),
  ]);
  const category = categories?.find((c) => c.slug === categorySlug);

  // Tour detail page: /explore/nyc/central-park-tours/central-park-bike-tour
  if (tourFromDb) {
    if (!destination || !category) notFound();
    let tour = await getV3ViatorProduct(tourFromDb.productId);
    if (!tour) notFound();

    const content = await getV3LandingCategoryContent(destinationSlug, categorySlug);
    const allTours = [...(content?.topPicks || []), ...(content?.otherTours || [])];
    let relatedTours = allTours
      .filter((t) => t.productId !== tourFromDb.productId)
      .map((t) => ({
        productId: t.productId,
        title: t.title,
        tourSlug: t.tourSlug,
        imageUrl: t.imageUrl,
        fromPrice: t.fromPrice,
      }));

    const relatedCodes = relatedTours.map((t) => t.productId).filter(Boolean);
    if (relatedCodes.length > 0) {
      const summaries = await getV3ViatorProductSummaries(relatedCodes);
      relatedTours = relatedTours.map((t) => {
        const s = summaries.get(t.productId);
        if (!s) return t;
        return {
          ...t,
          imageUrl: t.imageUrl || s.imageUrl || null,
          fromPrice: t.fromPrice || s.fromPrice || null,
          rating: s.rating,
          reviewCount: s.reviewCount,
        };
      });
    }

    const tourSummary = null;

    const categoryHref = `/explore/${destinationSlug}/${categorySlug}`;
    const tourFaqs = tourFromDb.faqs;
    const tourBreadcrumbSchema = {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://toptours.ai' },
        { '@type': 'ListItem', position: 2, name: destination.name, item: `https://toptours.ai/explore/${destinationSlug}` },
        { '@type': 'ListItem', position: 3, name: category.title, item: `https://toptours.ai/explore/${destinationSlug}/${categorySlug}` },
        { '@type': 'ListItem', position: 4, name: tourFromDb.title, item: `https://toptours.ai/explore/${destinationSlug}/${categorySlug}/${subSlug}` },
      ],
    };
    return (
      <>
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(tourBreadcrumbSchema) }} />
        {Array.isArray(tourFaqs) && tourFaqs.length > 0 && (
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{
              __html: JSON.stringify({
                '@context': 'https://schema.org',
                '@type': 'FAQPage',
                mainEntity: tourFaqs.map((faq) => ({
                  '@type': 'Question',
                  name: faq.question,
                  acceptedAnswer: { '@type': 'Answer', text: faq.answer },
                })),
              }),
            }}
          />
        )}
        <NavigationNext />
        <main className="min-h-screen bg-white pt-16">
          <ExploreTourDetailClient
            tour={tour}
            tourSummary={tourSummary}
            productId={tourFromDb.productId}
            destinationSlug={destinationSlug}
            categorySlug={categorySlug}
            categoryTitle={category.title}
            destinationName={destination.name}
            categoryHref={categoryHref}
            relatedTours={relatedTours}
            tourSeo={tourFromDb}
          />
        </main>
        <FooterNext />
      </>
    );
  }

  const sub = subFromDb || getExploreSubcategory(destinationSlug, categorySlug, subSlug);
  if (!destination || !category || !sub) notFound();

  const categoryHref = `/explore/${destinationSlug}/${categorySlug}`;

  // All subcategories for "More ways to explore" links (DB or fallback)
  const categoryContent = await getV3LandingCategoryContent(destinationSlug, categorySlug);
  const fallbackContent = getExploreCategoryContent(destinationSlug, categorySlug);
  const allSubs = categoryContent?.subcategories || fallbackContent?.subcategories || [];
  const otherSubcategories = allSubs
    .filter((s) => s.slug !== subSlug)
    .map((s) => ({ slug: s.slug, title: s.title }));

  // Enrich subcategory tours with image/price/rating from bulk API when available
  let tours = sub.tours || [];
  if (tours.length > 0) {
    try {
      const codes = tours.map((t) => t.productId).filter(Boolean);
      if (codes.length > 0) {
        const summaries = await fetchProductsBulk(codes);
        const byCode = new Map(summaries.map((s) => [s.productCode, s]));
        tours = tours.map((t) => {
          const s = byCode.get(t.productId);
          if (!s) return t;
          return {
            ...t,
            imageUrl: t.imageUrl || s.imageUrl || null,
            fromPrice: t.fromPrice || s.fromPriceDisplay || null,
            rating: s.rating,
            reviewCount: s.reviewCount,
          };
        });
      }
    } catch {
      // keep existing tour data
    }
  }

  const subBreadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://toptours.ai' },
      { '@type': 'ListItem', position: 2, name: destination.name, item: `https://toptours.ai/explore/${destinationSlug}` },
      { '@type': 'ListItem', position: 3, name: category.title, item: `https://toptours.ai/explore/${destinationSlug}/${categorySlug}` },
      { '@type': 'ListItem', position: 4, name: sub.title, item: `https://toptours.ai/explore/${destinationSlug}/${categorySlug}/${subSlug}` },
    ],
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(subBreadcrumbSchema) }} />
      {sub.faqs?.length > 0 && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'FAQPage',
              mainEntity: sub.faqs.map((faq) => ({
                '@type': 'Question',
                name: faq.question,
                acceptedAnswer: { '@type': 'Answer', text: faq.answer },
              })),
            }),
          }}
        />
      )}
      <NavigationNext />
      <main className="min-h-screen bg-white pt-16">
        <ExploreSubcategoryClient
          destinationSlug={destinationSlug}
          destinationName={destination.name}
          categorySlug={categorySlug}
          categoryTitle={category.title}
          categoryHref={categoryHref}
          subTitle={sub.title}
          subDescription={sub.description}
          tours={tours}
          about={sub.about}
          faqs={sub.faqs}
          summaryParagraph={sub.summaryParagraph}
          whyBook={sub.whyBook}
          whatToExpect={sub.whatToExpect}
          otherSubcategories={otherSubcategories}
        />
      </main>
      <FooterNext />
    </>
  );
}
