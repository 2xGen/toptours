import { notFound } from 'next/navigation';
import { getV3LandingData } from '@/lib/v3LandingData';
import { fetchProductsBulk } from '@/lib/viatorBulk';
import ExploreLandingClient from './ExploreLandingClient';
import NavigationNext from '@/components/NavigationNext';
import FooterNext from '@/components/FooterNext';

export const revalidate = 3600; // 1 hour

const META_DESC_MAX = 160;

export async function generateMetadata({ params }) {
  const { destinationSlug } = await params;
  const { destination } = await getV3LandingData(destinationSlug);
  if (!destination) return { title: 'Explore' };

  const title = destination.meta_title || `Best Tours in ${destination.name} | TopTours.ai`;
  let description = destination.meta_description || destination.hero_subtitle || `Book tours and activities in ${destination.name}. Compare options and prices.`;
  if (description.length > META_DESC_MAX) description = description.slice(0, META_DESC_MAX - 3).trim() + '...';

  const canonical = `https://toptours.ai/explore/${destinationSlug}`;
  return {
    title,
    description,
    openGraph: {
      title,
      description,
      url: canonical,
      siteName: 'TopTours.ai',
      type: 'website',
      locale: 'en_US',
      images: destination.og_image_url ? [{ url: destination.og_image_url, width: 1200, height: 630, alt: destination.name }] : [],
    },
    alternates: { canonical },
    robots: { index: true, follow: true },
  };
}

export default async function ExploreDestinationPage({ params }) {
  const { destinationSlug } = await params;
  let { destination, topPicks, categories } = await getV3LandingData(destinationSlug);

  if (!destination) notFound();

  // Enrich top picks with image and price from Viator when DB values are missing
  if (topPicks?.length > 0) {
    try {
      const productCodes = topPicks.map((p) => p.product_id).filter(Boolean);
      if (productCodes.length > 0) {
        const summaries = await fetchProductsBulk(productCodes);
        const byCode = new Map(summaries.map((s) => [s.productCode, s]));
        topPicks = topPicks.map((pick) => {
          const s = byCode.get(pick.product_id);
          if (!s) return pick;
          return {
            ...pick,
            image_url: pick.image_url || s.imageUrl || null,
            from_price: pick.from_price || s.fromPriceDisplay || null,
          };
        });
      }
    } catch {
      // Fail silently; cards use DB values or fallback text
    }
  }

  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://toptours.ai' },
      { '@type': 'ListItem', position: 2, name: destination.name, item: `https://toptours.ai/explore/${destinationSlug}` },
    ],
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />
      <NavigationNext />
      <main className="min-h-screen bg-white pt-16">
        <ExploreLandingClient
          destination={destination}
          destinationSlug={destinationSlug}
          topPicks={topPicks}
          categories={categories}
        />
      </main>
      <FooterNext />
    </>
  );
}
