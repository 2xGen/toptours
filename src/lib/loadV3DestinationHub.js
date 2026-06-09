import { getV3LandingAllToursForDestination, getV3LandingData, getV3ViatorProductSummaries } from '@/lib/v3LandingData';
import { fetchProductsBulk } from '@/lib/viatorBulk';

/**
 * Load v3 tour-hub content for /destinations/[slug] when a v3_landing_destinations row exists.
 */
export async function loadV3DestinationHub(destinationSlug) {
  let { destination, topPicks, categories } = await getV3LandingData(destinationSlug);
  if (!destination) return null;

  const toursData = await getV3LandingAllToursForDestination(destinationSlug);
  const tours = toursData?.tours ?? [];
  const categoriesForFilter = toursData?.categories?.length ? toursData.categories : categories;

  if (topPicks?.length > 0) {
    const productCodes = topPicks.map((p) => p.product_id).filter(Boolean);
    if (productCodes.length > 0) {
      try {
        const dbSummaries = await getV3ViatorProductSummaries(productCodes);
        topPicks = topPicks.map((pick) => {
          const s = dbSummaries.get(pick.product_id);
          return {
            ...pick,
            image_url: pick.image_url || (s && s.imageUrl) || null,
            from_price: pick.from_price || (s && s.fromPrice) || null,
          };
        });
      } catch {
        // DB-only values
      }
      try {
        const liveSummaries = await fetchProductsBulk(productCodes, { destinationSlug });
        const byCode = new Map(liveSummaries.map((s) => [s.productCode, s]));
        topPicks = topPicks.map((pick) => {
          const s = byCode.get(pick.product_id);
          return {
            ...pick,
            image_url: pick.image_url || (s && s.imageUrl) || null,
            from_price: pick.from_price || (s && s.fromPrice) || null,
          };
        });
      } catch {
        // keep enriched DB values
      }
    }
    topPicks = topPicks.map((p) => ({
      ...p,
      image_url: p.image_url ?? null,
      from_price: p.from_price ?? null,
    }));
  }

  return {
    destination,
    destinationSlug,
    topPicks: topPicks ?? [],
    categories: categoriesForFilter ?? [],
    tours,
  };
}
