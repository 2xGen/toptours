import { notFound } from 'next/navigation';
import { getV3LandingDestination, getV3LandingCategories, getV3LandingCategoryContent, getV3LandingCategoryPageMeta, getV3ViatorProductSummaries } from '@/lib/v3LandingData';
import Link from 'next/link';
import { getExploreCategoryContent } from '@/data/exploreCategoryContent';
import NavigationNext from '@/components/NavigationNext';
import FooterNext from '@/components/FooterNext';
import ExploreCategoryClient from './ExploreCategoryClient';
import { ArrowRight } from 'lucide-react';
import { fetchProductsBulk } from '@/lib/viatorBulk';

export const revalidate = 3600;

const META_DESC_MAX = 160;

export async function generateMetadata({ params }) {
  const { destinationSlug, categorySlug } = await params;
  const [destination, categories, pageMeta] = await Promise.all([
    getV3LandingDestination(destinationSlug),
    getV3LandingCategories(destinationSlug),
    getV3LandingCategoryPageMeta(destinationSlug, categorySlug),
  ]);
  const category = categories?.find((c) => c.slug === categorySlug);

  if (!destination || !category) return { title: 'Category' };

  const title = pageMeta?.seoMetaTitle || `${category.title} | ${destination.name} | TopTours.ai`;
  let description = pageMeta?.seoMetaDescription || category.meta_description || category.description || `Book ${category.title} in ${destination.name}. Compare and book with free cancellation.`;
  if (description.length > META_DESC_MAX) description = description.slice(0, META_DESC_MAX - 3).trim() + '...';

  const canonical = `https://toptours.ai/explore/${destinationSlug}/${categorySlug}`;
  return {
    title,
    description,
    alternates: { canonical },
    openGraph: {
      title,
      description,
      url: canonical,
      siteName: 'TopTours.ai',
      type: 'website',
      locale: 'en_US',
    },
    robots: { index: true, follow: true },
  };
}

export default async function ExploreCategoryPage({ params }) {
  const { destinationSlug, categorySlug } = await params;
  const [destination, categories, contentFromDb] = await Promise.all([
    getV3LandingDestination(destinationSlug),
    getV3LandingCategories(destinationSlug),
    getV3LandingCategoryContent(destinationSlug, categorySlug),
  ]);
  const content = contentFromDb || getExploreCategoryContent(destinationSlug, categorySlug);

  const category = categories?.find((c) => c.slug === categorySlug);
  if (!destination || !category) notFound();

  // Full category page with tours and subcategories
  if (content) {
    // Enrich top picks + other tours: first viator_products (works in prod), then live API if enabled
    let enrichedTopPicks = content.topPicks;
    let enrichedOtherTours = content.otherTours;
    const allTours = [...(content.topPicks || []), ...(content.otherTours || [])];
    const productCodes = Array.from(new Set(allTours.map((t) => t.productId))).filter(Boolean);
    if (productCodes.length > 0) {
      try {
        const dbSummaries = await getV3ViatorProductSummaries(productCodes);
        const mergeFromDb = (tour) => {
          const s = dbSummaries.get(tour.productId);
          if (!s) return tour;
          return {
            ...tour,
            imageUrl: tour.imageUrl || s.imageUrl || null,
            fromPrice: tour.fromPrice || s.fromPrice || null,
            rating: tour.rating ?? s.rating,
            reviewCount: tour.reviewCount ?? s.reviewCount,
          };
        };
        enrichedTopPicks = (content.topPicks || []).map(mergeFromDb);
        enrichedOtherTours = (content.otherTours || []).map(mergeFromDb);
      } catch {
        // continue with DB-only values
      }
      try {
        const summaries = await fetchProductsBulk(productCodes, { destinationSlug });
        const byCode = new Map(summaries.map((s) => [s.productCode, s]));
        const mergeLive = (tour) => {
          const s = byCode.get(tour.productId);
          if (!s) return tour;
          return {
            ...tour,
            imageUrl: tour.imageUrl || s.imageUrl || null,
            fromPrice: tour.fromPrice || s.fromPriceDisplay || null,
            rating: s.rating,
            reviewCount: s.reviewCount,
          };
        };
        enrichedTopPicks = enrichedTopPicks.map(mergeLive);
        enrichedOtherTours = enrichedOtherTours.map(mergeLive);
      } catch {
        // cards use DB/viator_products values
      }
    }

    const breadcrumbSchema = {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://toptours.ai' },
        { '@type': 'ListItem', position: 2, name: destination.name, item: `https://toptours.ai/explore/${destinationSlug}` },
        { '@type': 'ListItem', position: 3, name: category.title, item: `https://toptours.ai/explore/${destinationSlug}/${categorySlug}` },
      ],
    };

    return (
      <>
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />
        {/* FAQPage schema when we have FAQs */}
        {content.faqs?.length > 0 && (
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{
              __html: JSON.stringify({
                '@context': 'https://schema.org',
                '@type': 'FAQPage',
                mainEntity: content.faqs.map((faq) => ({
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
          <ExploreCategoryClient
            destinationSlug={destinationSlug}
            destinationName={destination.name}
            categorySlug={categorySlug}
            categoryTitle={category.title}
            categoryDescription={content.heroDescription || category.description}
            topPicks={enrichedTopPicks}
            otherTours={enrichedOtherTours}
            subcategories={content.subcategories}
            about={content.about}
            insiderTips={content.insiderTips}
            whatToExpect={content.whatToExpect}
            whoIsThisFor={content.whoIsThisFor}
            highlights={content.highlights}
            faqs={content.faqs}
            topPicksHeading={content.topPicksHeading}
            topPicksSubtext={content.topPicksSubtext}
            allCategories={categories}
          />
        </main>
        <FooterNext />
      </>
    );
  }

  // Placeholder when no category content yet
  return (
    <>
      <NavigationNext />
      <main className="min-h-screen bg-white pt-16">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <nav className="mb-8 text-sm text-slate-500">
            <Link href="/" className="hover:text-slate-700">Home</Link>
            <span className="mx-2">/</span>
            <Link href={`/explore/${destinationSlug}`} className="hover:text-slate-700">{destination.name}</Link>
            <span className="mx-2">/</span>
            <span className="text-slate-900">{category.title}</span>
          </nav>
          <h1 className="font-bold text-3xl text-slate-900">{category.title}</h1>
          {category.description && (
            <p className="mt-2 text-lg text-slate-600 max-w-2xl">{category.description}</p>
          )}
          <div className="mt-8">
            <Link
              href={`/explore/${destinationSlug}/tours`}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-semibold text-white bg-primary hover:opacity-90"
            >
              View all tours in {destination.name}
              <ArrowRight className="h-5 w-5" />
            </Link>
          </div>
          <p className="mt-8 text-slate-500 text-sm">
            Handpicked tours for this category will appear here. For now, browse all {destination.name} tours above.
          </p>
        </div>
      </main>
      <FooterNext />
    </>
  );
}
