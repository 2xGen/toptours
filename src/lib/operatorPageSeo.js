/**
 * Template SEO copy for operator pages — pure functions, no API calls.
 * Used at build time (written to JSON) and at runtime (fallback if JSON predates rebuild).
 */

/** Tooltip copy — ratings/durations come from cached Viator data. */
export const OPERATOR_VIATOR_DATA_NOTICE =
  'Ratings, review counts, and durations are from Viator, our booking partner. They change over time — open a tour for the latest details before booking.';

export function truncateHighlight(text, maxLen = 160) {
  if (!text || typeof text !== 'string') return null;
  const clean = text.replace(/\s+/g, ' ').trim();
  if (!clean) return null;
  if (clean.length <= maxLen) return clean;
  const cut = clean.slice(0, maxLen);
  const lastSpace = cut.lastIndexOf(' ');
  const trimmed = (lastSpace > 60 ? cut.slice(0, lastSpace) : cut).trim();
  return `${trimmed}…`;
}

export function extractTourHighlight(tour) {
  const raw =
    tour?.highlight ||
    tour?.description?.shortDescription ||
    tour?.viatorUniqueContent?.shortDescription ||
    null;
  return truncateHighlight(raw);
}

const TOUR_THEME_KEYWORDS = [
  ['snorkel', 'snorkeling'],
  ['sail', 'sailing'],
  ['catamaran', 'catamaran cruises'],
  ['utv', 'UTV adventures'],
  ['atv', 'ATV tours'],
  ['jeep', 'jeep safaris'],
  ['bus', 'sightseeing tours'],
  ['sunset', 'sunset cruises'],
  ['submarine', 'submarine tours'],
  ['island', 'island day trips'],
  ['transfer', 'airport transfers'],
  ['kayak', 'kayaking'],
  ['dive', 'diving'],
  ['food', 'food tours'],
  ['private', 'private tours'],
];

/** Infer activity themes from tour titles — no API. */
export function inferTourThemes(tours = []) {
  const found = new Set();
  for (const tour of tours) {
    const title = (tour?.title || '').toLowerCase();
    for (const [keyword, label] of TOUR_THEME_KEYWORDS) {
      if (title.includes(keyword)) found.add(label);
    }
  }
  return [...found];
}

/**
 * Editorial blurb for the About section — intentionally avoids repeating hero stats.
 */
export function buildOperatorBlurb({
  operatorName,
  destinationName,
  tours = [],
  tourCount,
}) {
  const dest = destinationName || 'this destination';
  const count = tourCount ?? tours.length;
  const themes = inferTourThemes(tours);
  const themeText =
    themes.length >= 2
      ? `${themes.slice(0, -1).join(', ')} and ${themes[themes.length - 1]}`
      : themes[0] || 'popular local experiences';

  const sentences = [
    `${operatorName} specializes in ${themeText} across ${dest}.`,
    `Use this page as a single hub to compare every ${operatorName} listing we track — each tour below has its own ratings, duration, and link to full details with live pricing.`,
  ];

  if (count <= 3 && tours[0]?.title) {
    const names = tours
      .slice(0, count)
      .map((t) => t.title)
      .join(count === 2 ? ' and ' : ', ');
    sentences.push(`Their ${dest} lineup includes ${names}.`);
  }

  return sentences.slice(0, 3).join(' ');
}

/** Three FAQ items for long-tail queries — no API. */
export function buildOperatorFaqs({
  operatorName,
  destinationName,
  tours = [],
  tourCount,
  totalReviews,
  averageRating,
}) {
  const dest = destinationName || 'this destination';
  const count = tourCount ?? tours.length;
  const top = tours[0];
  const faqs = [];

  if (totalReviews > 0 && averageRating) {
    const verdict =
      averageRating >= 4.5
        ? 'generally excellent'
        : averageRating >= 4.0
          ? 'solid'
          : 'mixed but still popular';
    faqs.push({
      question: `Is ${operatorName} worth it?`,
      answer: `Based on ${Number(totalReviews).toLocaleString('en-US')} verified traveler reviews averaging ${averageRating} stars, ${operatorName} is ${verdict} for tours in ${dest}. Compare individual experiences below and check live availability before booking.`,
    });
  } else {
    faqs.push({
      question: `Is ${operatorName} worth it?`,
      answer: `${operatorName} offers ${count} bookable tours in ${dest}. Compare options below and read reviews on each tour page before booking.`,
    });
  }

  faqs.push({
    question: `How many tours does ${operatorName} offer in ${dest}?`,
    answer: `${operatorName} currently lists ${count} bookable ${count === 1 ? 'tour' : 'tours'} in ${dest} on TopTours.ai, including snorkeling, sightseeing, and day-trip options where available.`,
  });

  if (top?.title) {
    faqs.push({
      question: `What is the most popular ${operatorName} tour in ${dest}?`,
      answer: `The highest-reviewed option is "${top.title}"${top.reviewCount ? ` with ${Number(top.reviewCount).toLocaleString('en-US')} traveler reviews` : ''}${top.rating ? ` and a ${Number(top.rating).toFixed(1)}-star average` : ''}.`,
    });
  }

  return faqs;
}

/** Fill blurb/faqs from JSON or generate from cached tour data. */
export function enrichOperatorSeo(entry, destinationName) {
  if (!entry) return null;
  const base = {
    tourCount: entry.tourCount,
    totalReviews: entry.totalReviews,
    averageRating: entry.averageRating,
  };
  const ctx = {
    operatorName: entry.operatorName,
    destinationName: destinationName || entry.destinationName,
    tours: entry.tours || [],
    ...base,
  };
  return {
    ...entry,
    blurb: entry.blurb || buildOperatorBlurb(ctx),
    faqs: entry.faqs?.length ? entry.faqs : buildOperatorFaqs(ctx),
  };
}
