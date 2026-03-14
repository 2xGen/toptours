/**
 * Explore category page content: tours (top picks + other) and subcategories.
 * Keyed by destinationSlug + categorySlug. Replace placeholder product IDs with your 10 tours.
 *
 * Structure:
 * - tours: array of 10 { productId, title, imageUrl?, fromPrice? }. First 4 = top picks, next 6 = other.
 * - subcategories: array of 6 { slug, title, description, productIds: string[] (2-3), faqs?, about? }.
 *   productIds must be a subset of the 10 tour productIds.
 */

const SITE_URL = 'https://toptours.ai';

/** @type {Record<string, { tours: Array<{ productId: string, title: string, imageUrl?: string, fromPrice?: string }>, subcategories: Array<{ slug: string, title: string, description: string, productIds: string[], faqs?: Array<{ question: string, answer: string }>, about?: string }> }>} */
const categoryContent = {
  'new-york-city_central-park-tours': {
    // Replace these 10 with your real product IDs and titles. First 4 = top picks, next 6 = other tours.
    tours: [
      { productId: '3483P1', title: 'Central Park Bike Rental', imageUrl: null, fromPrice: null },
      { productId: '3721P1', title: 'Central Park Walking Tour', imageUrl: null, fromPrice: null },
      { productId: '26146P3', title: 'Central Park Horse Carriage Ride', imageUrl: null, fromPrice: null },
      { productId: '54570P16', title: 'Central Park Guided Tour', imageUrl: null, fromPrice: null },
      { productId: '38421P4', title: 'Central Park Running Tour', imageUrl: null, fromPrice: null },
      { productId: '18421P4', title: 'Central Park Photography Tour', imageUrl: null, fromPrice: null },
      { productId: '3483P2', title: 'Central Park Segway Tour', imageUrl: null, fromPrice: null },
      { productId: '3721P2', title: 'Central Park Pedicab Tour', imageUrl: null, fromPrice: null },
      { productId: '26146P4', title: 'Central Park Family Tour', imageUrl: null, fromPrice: null },
      { productId: '54570P17', title: 'Central Park Sunset Tour', imageUrl: null, fromPrice: null },
    ],
    subcategories: [
      {
        slug: 'bike-tours',
        title: 'Central Park bike tours',
        description: 'Rent a bike or join a guided bike tour to explore Central Park. Compare options and book with free cancellation.',
        productIds: ['3483P1', '54570P16', '3483P2'],
        about: 'Bike tours and rentals let you cover more of the park in less time. Guided bike tours often include stops at Bethesda Fountain, Bow Bridge, and other landmarks.',
        faqs: [
          { question: 'Are Central Park bike tours good for beginners?', answer: 'Yes. Most Central Park bike tours are suitable for all levels. The park has flat paths and dedicated bike lanes. Rentals and guided tours include safety briefings.' },
          { question: 'How long do Central Park bike tours last?', answer: 'Guided bike tours typically run 2–3 hours. Rentals can be by the hour or for the day. Check each product for exact duration.' },
        ],
      },
      {
        slug: 'walking-tours',
        title: 'Central Park walking tours',
        description: 'Explore Central Park on foot with a guided walking tour. See famous landmarks and hidden spots with a local guide.',
        productIds: ['3721P1', '54570P16'],
        about: 'Walking tours are ideal for taking in the park at a relaxed pace. Guides often cover film locations, history, and seasonal highlights.',
        faqs: [
          { question: 'How long are Central Park walking tours?', answer: 'Most walking tours run 2–2.5 hours. Some offer shorter or longer options. Check the tour description for exact duration.' },
        ],
      },
      {
        slug: 'carriage-tours',
        title: 'Central Park horse carriage rides',
        description: 'Classic horse-drawn carriage rides through Central Park. A romantic and iconic way to see the park.',
        productIds: ['26146P3'],
        about: 'Carriage rides offer a classic NYC experience. Rides typically follow a set route through the park and last about 45–60 minutes.',
        faqs: [
          { question: 'How long is a Central Park carriage ride?', answer: 'Standard carriage rides are typically 45 minutes to one hour. Some operators offer longer or private rides.' },
        ],
      },
      {
        slug: 'running-tours',
        title: 'Central Park running tours',
        description: 'Combine a run through Central Park with a guided tour. Perfect for active visitors who want to see the park while exercising.',
        productIds: ['38421P4'],
        about: 'Running tours let you cover a lot of ground while learning about the park. Pace is usually relaxed; suitable for regular runners.',
        faqs: [],
      },
      {
        slug: 'photography-tours',
        title: 'Central Park photography tours',
        description: 'Guided photography tours of Central Park. Get to the best spots for photos and learn tips from a local photographer.',
        productIds: ['18421P4', '54570P17'],
        about: 'Photography tours focus on the most photogenic spots and best light. Great for solo travelers, couples, and anyone who wants memorable shots.',
        faqs: [],
      },
      {
        slug: 'family-tours',
        title: 'Central Park tours for families',
        description: 'Family-friendly Central Park tours designed for kids and parents. Engaging guides and activities suited to all ages.',
        productIds: ['26146P4', '54570P16', '3721P1'],
        about: 'Family tours often include stories, games, and stops that keep kids engaged. Many walking and bike tours welcome children; check age requirements.',
        faqs: [
          { question: 'Are Central Park tours suitable for young children?', answer: 'Many walking and bike tours welcome families. Carriage rides are also popular with kids. Check each tour for minimum age and whether strollers are allowed.' },
        ],
      },
    ],
    // Optional SEO for the main category page
    about: 'Central Park is one of the world’s most famous urban parks. Bike, walking, and carriage tours let you explore its bridges, lawns, and landmarks with a guide or at your own pace. Book in advance in peak season for the best choice.',
    faqs: [
      { question: 'What are the best Central Park tours?', answer: 'Popular options include guided walking tours, bike rentals and bike tours, horse-drawn carriage rides, and running or photography tours. The best choice depends on your interests and how much of the park you want to cover.' },
      { question: 'Do I need to book Central Park tours in advance?', answer: 'Booking in advance is recommended, especially in spring and fall. Carriage rides and guided tours can sell out on busy days.' },
      { question: 'Are Central Park tours good for families?', answer: 'Yes. Many walking and bike tours are family-friendly. Carriage rides are also popular with children. Check each tour for age requirements and pace.' },
    ],
  },
};

/**
 * Get category tours and subcategories for a destination + category.
 * @param {string} destinationSlug - e.g. 'new-york-city'
 * @param {string} categorySlug - e.g. 'central-park-tours'
 * @returns {{ tours: Array<{ productId: string, title: string, imageUrl?: string, fromPrice?: string }>, topPickProductIds: string[], otherProductIds: string[], subcategories: Array<{ slug: string, title: string, description: string, productIds: string[], faqs?: Array<{ question: string, answer: string }>, about?: string }>, about?: string, faqs?: Array<{ question: string, answer: string }> } | null}
 */
export function getExploreCategoryContent(destinationSlug, categorySlug) {
  const key = `${destinationSlug}_${categorySlug}`;
  const config = categoryContent[key];
  if (!config || !config.tours || config.tours.length === 0) return null;

  const topPickProductIds = config.tours.slice(0, 4).map((t) => t.productId);
  const otherProductIds = config.tours.slice(4, 10).map((t) => t.productId);
  const tourByProductId = new Map(config.tours.map((t) => [t.productId, t]));

  return {
    tours: config.tours,
    topPickProductIds,
    otherProductIds,
    topPicks: config.tours.slice(0, 4),
    otherTours: config.tours.slice(4, 10),
    subcategories: config.subcategories || [],
    heroDescription: config.hero_description || undefined,
    about: config.about,
    insiderTips: config.insider_tips || [],
    whatToExpect: config.what_to_expect || [],
    whoIsThisFor: config.who_is_this_for || [],
    highlights: config.highlights || [],
    faqs: config.faqs || [],
  };
}

/**
 * Get a single subcategory by slug.
 * @param {string} destinationSlug
 * @param {string} categorySlug
 * @param {string} subSlug
 * @returns {{ slug: string, title: string, description: string, productIds: string[], tours: Array<{ productId: string, title: string, imageUrl?: string, fromPrice?: string }>, faqs?: Array<{ question: string, answer: string }>, about?: string } | null}
 */
export function getExploreSubcategory(destinationSlug, categorySlug, subSlug) {
  const content = getExploreCategoryContent(destinationSlug, categorySlug);
  if (!content) return null;
  const sub = content.subcategories.find((s) => s.slug === subSlug);
  if (!sub) return null;

  const tourByProductId = new Map(content.tours.map((t) => [t.productId, t]));
  const tours = (sub.productIds || [])
    .map((id) => tourByProductId.get(id))
    .filter(Boolean);

  return {
    slug: sub.slug,
    title: sub.title,
    description: sub.description,
    productIds: sub.productIds || [],
    tours,
    faqs: sub.faqs || [],
    about: sub.about,
  };
}

/**
 * All [destinationSlug, categorySlug] pairs that have content (for generateStaticParams).
 */
export function getExploreCategoryContentKeys() {
  return Object.keys(categoryContent).map((key) => {
    const [destinationSlug, categorySlug] = key.split('_');
    return { destinationSlug, categorySlug };
  });
}

/**
 * All [destinationSlug, categorySlug, subSlug] for subcategory pages.
 */
export function getExploreSubcategoryParams() {
  const params = [];
  for (const { destinationSlug, categorySlug } of getExploreCategoryContentKeys()) {
    const content = getExploreCategoryContent(destinationSlug, categorySlug);
    if (content?.subcategories) {
      for (const sub of content.subcategories) {
        params.push({ destinationSlug, categorySlug, subSlug: sub.slug });
      }
    }
  }
  return params;
}

export { SITE_URL };
