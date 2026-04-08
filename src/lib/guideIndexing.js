/**
 * Guide indexing policy:
 * - Keep high-intent destination/activity guides indexable.
 * - Noindex operational/marketing/filter-style tags that look thin or duplicative.
 */

function normalize(value) {
  return String(value || '')
    .toLowerCase()
    .trim()
    .replace(/[_]+/g, ' ')
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

const KEEP_INTENT_HINTS = [
  'airport transfer',
  'airport transfers',
  'canal boat',
  'atv',
  'snorkel',
  'catamaran',
  'sunset cruise',
  'walking tour',
  'food',
  'beer',
  'castle tour',
  'charles bridge',
  'old town',
  'anne frank house',
  'central park',
  'broadway',
  'day trip',
  'cooking class',
  'museum tour',
  'architecture',
  'bike tour',
  'packing list',
  'itinerary',
];

const THIN_TAG_HINTS = [
  'low cancellation',
  'sell out',
  'book before',
  'dont miss out',
  'available now',
  'short-term availability',
  'last-minute',
  'viator experience awards',
  'award-winning viator',
  'viator award-winning',
  'viator award winning',
  'best conversion',
  'curated experiences',
  'premium experiences',
  'top-rated experiences',
  'ultimate experiences',
  'newest experiences',
  'newest tours',
  'discover new tours',
  'viator plus',
  'small group adventures',
  'half-day adventures',
  'full-day tours',
  'multi-day tours',
  'worry-free shore excursions',
  'spring break getaways',
  'aquatic adventures',
  'watch out for extra costs',
  'likely to sell out',
];

export function isLowValueGuideTag(input = {}) {
  const slug = normalize(input.slug);
  const name = normalize(input.name);
  const title = normalize(input.title);
  const text = [slug, name, title].filter(Boolean).join(' | ');
  if (!text) return false;

  // Keep clear user-intent guides indexed, even if they accidentally match broad words.
  if (KEEP_INTENT_HINTS.some((k) => text.includes(k))) return false;

  return THIN_TAG_HINTS.some((k) => text.includes(k));
}

