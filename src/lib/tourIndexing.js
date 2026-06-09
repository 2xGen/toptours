/**
 * Tour PDP indexing policy — tuned for crawl cost vs SEO on comparison/destination hubs.
 *
 * Default: noindex all tour detail pages (conversion layer, not SEO inventory).
 * Optional: set TOUR_INDEX_MIN_REVIEWS=100 in Vercel to index only high-review tours.
 * Optional: set ENABLE_TOUR_SITEMAP=true to include tour URLs in sitemap (off by default).
 */

const INDEX_ROBOTS = {
  index: true,
  follow: true,
  googleBot: {
    index: true,
    follow: true,
    'max-video-preview': -1,
    'max-image-preview': 'large',
    'max-snippet': -1,
  },
};

const NOINDEX_ROBOTS = {
  index: false,
  follow: true,
  googleBot: {
    index: false,
    follow: true,
    'max-video-preview': -1,
    'max-image-preview': 'large',
    'max-snippet': -1,
  },
};

export function getTourReviewCount(tour) {
  if (!tour) return 0;
  const n = tour.reviews?.totalReviews ?? tour.reviews?.totalCount ?? 0;
  const parsed = Number(n);
  return Number.isFinite(parsed) ? parsed : 0;
}

/**
 * @param {object|null|undefined} tour - Viator product (or partial) with reviews
 * @param {{ forceIndex?: boolean }} [options]
 */
export function getTourDetailRobots(tour, options = {}) {
  if (options.forceIndex) return INDEX_ROBOTS;

  const minReviews = Number(process.env.TOUR_INDEX_MIN_REVIEWS || 0);
  if (minReviews <= 0) {
    return NOINDEX_ROBOTS;
  }

  const reviewCount = getTourReviewCount(tour);
  return reviewCount >= minReviews ? INDEX_ROBOTS : NOINDEX_ROBOTS;
}

export function isTourSitemapEnabled() {
  return process.env.ENABLE_TOUR_SITEMAP === 'true';
}

export { INDEX_ROBOTS, NOINDEX_ROBOTS };
