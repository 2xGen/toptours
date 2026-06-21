/**
 * Operator landing pages — long-tail SEO per operator + destination.
 * Pilot: featured destinations in OPERATOR_PAGE_PILOT_DESTINATIONS (starts with aruba).
 */

import { readFileSync, existsSync } from 'fs';
import { join } from 'path';
import { generateTourSlug } from '@/utils/tourHelpers';
import { slugToViatorId } from '@/data/viatorDestinationMap';
import { enrichOperatorSeo } from '@/lib/operatorPageSeo';

/** Destinations with indexable /operators/[slug] pages enabled (phased rollout). */
export const OPERATOR_PAGE_PILOT_DESTINATIONS = new Set([
  'aruba',
  'arusha',
  'prague',
  'curacao',
  'reykjavik',
  'zanzibar',
  'banff',
  'queenstown',
  'galapagos-islands',
  'interlaken',
  'siem-reap',
]);

export function getOperatorPagePilotSlugs() {
  return [...OPERATOR_PAGE_PILOT_DESTINATIONS];
}

/** Min reviews for a single-tour operator page. */
export const OPERATOR_MEANINGFUL_REVIEW_COUNT = 5;

export function isOperatorPagesEnabled(destinationSlug) {
  return OPERATOR_PAGE_PILOT_DESTINATIONS.has(String(destinationSlug || '').toLowerCase());
}

/** Normalize for deduping Charisma_Experience vs Charisma Experience. */
export function normalizeOperatorKey(name) {
  if (!name) return '';
  return name
    .trim()
    .replace(/_/g, ' ')
    .replace(/\s+/g, ' ')
    .replace(/[–—]/g, '-')
    .toLowerCase();
}

/** URL slug from operator display name. */
export function operatorNameToSlug(name) {
  if (!name) return '';
  return name
    .toLowerCase()
    .trim()
    .replace(/_/g, '-')
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

export function getViatorDestinationIdForSlug(destinationSlug) {
  return slugToViatorId?.[destinationSlug] ? String(slugToViatorId[destinationSlug]) : null;
}

export function tourBelongsToViatorDestination(tour, viatorDestinationId) {
  if (!tour || !viatorDestinationId) return false;
  const target = String(viatorDestinationId).replace(/^d/i, '');
  const dests = tour?.destinations || [];
  if (!Array.isArray(dests) || dests.length === 0) return false;
  return dests.some((d) => {
    const id = String(d.destinationId || d.id || d.ref || '').replace(/^d/i, '');
    return id === target;
  });
}

function bestTourImage(tour) {
  const variants = tour?.images?.[0]?.variants;
  if (Array.isArray(variants) && variants.length) {
    const sorted = [...variants].sort((a, b) => (b.width || 0) - (a.width || 0));
    return (
      sorted.find((v) => v.width >= 400 && v.width <= 800)?.url ||
      sorted[0]?.url ||
      null
    );
  }
  return tour?.images?.[0]?.url || null;
}

function durationMinutes(tour) {
  return (
    tour?.itinerary?.duration?.fixedDurationInMinutes ||
    tour?.duration?.fixedDurationInMinutes ||
    tour?.duration?.variableDurationFromMinutes ||
    null
  );
}

export function extractTourCardFromViator(tour) {
  if (!tour) return null;
  const productId = tour.productCode || tour.productId;
  if (!productId) return null;
  const title = tour.title || 'Tour';
  const rating = tour.reviews?.combinedAverageRating ?? tour.reviews?.averageRating ?? null;
  const reviewCount = tour.reviews?.totalReviews ?? tour.reviews?.totalCount ?? 0;
  return {
    productId: String(productId),
    title,
    slug: generateTourSlug(title),
    imageUrl: bestTourImage(tour),
    fromPrice: tour.pricing?.summary?.fromPrice ?? null,
    rating: rating != null ? Math.round(Number(rating) * 10) / 10 : null,
    reviewCount: Number(reviewCount) || 0,
    durationMinutes: durationMinutes(tour),
    flags: tour.flags || [],
  };
}

export function meetsOperatorPageQualityGate(toursInDestination) {
  const tours = toursInDestination || [];
  if (tours.length >= 2) return true;
  if (tours.length === 1) {
    const reviews = tours[0].reviewCount || 0;
    return reviews >= OPERATOR_MEANINGFUL_REVIEW_COUNT;
  }
  return false;
}

export function computeOperatorAggregatedStats(tours) {
  let totalReviews = 0;
  let weightedSum = 0;
  for (const t of tours || []) {
    const count = Number(t.reviewCount) || 0;
    const rating = Number(t.rating) || 0;
    if (count > 0 && rating > 0) {
      weightedSum += rating * count;
      totalReviews += count;
    }
  }
  if (totalReviews === 0) {
    return { averageRating: null, totalReviews: 0, tourCount: tours?.length || 0 };
  }
  return {
    averageRating: Math.round((weightedSum / totalReviews) * 100) / 100,
    totalReviews,
    tourCount: tours?.length || 0,
  };
}

function operatorPageIndexPath(destinationSlug) {
  return join(process.cwd(), 'src/data/operatorPages', `${destinationSlug}.json`);
}

function loadOperatorOverrides(destinationSlug) {
  const filePath = join(process.cwd(), 'src/data/operatorPages/overrides', `${destinationSlug}.json`);
  if (!existsSync(filePath)) return {};
  try {
    const raw = JSON.parse(readFileSync(filePath, 'utf8'));
    const { _comment, ...rest } = raw;
    return rest;
  } catch {
    return {};
  }
}

export function loadOperatorPageIndex(destinationSlug) {
  const slug = String(destinationSlug || '').toLowerCase();
  if (!isOperatorPagesEnabled(slug)) return null;
  const filePath = operatorPageIndexPath(slug);
  if (!existsSync(filePath)) return null;
  try {
    return JSON.parse(readFileSync(filePath, 'utf8'));
  } catch {
    return null;
  }
}

export function getOperatorEntriesFromIndex(index) {
  if (!index?.operators) return [];
  return index.operators;
}

/**
 * Resolve operator slug → page payload from prebuilt JSON only (zero runtime API calls).
 */
export function resolveOperatorPage(destinationSlug, operatorSlug) {
  const destSlug = String(destinationSlug || '').toLowerCase();
  const opSlug = String(operatorSlug || '').toLowerCase();
  if (!isOperatorPagesEnabled(destSlug) || !opSlug) return null;

  const index = loadOperatorPageIndex(destSlug);
  const indexed = index?.operators?.find((o) => o.slug === opSlug);
  if (!indexed?.tours?.length) return null;
  if (!meetsOperatorPageQualityGate(indexed.tours)) return null;

  const destName = index.destinationName || null;
  const manual = loadOperatorOverrides(destSlug)[opSlug] || {};
  const merged = {
    ...indexed,
    ...(manual.blurb ? { blurb: manual.blurb } : {}),
    ...(manual.faqs?.length ? { faqs: manual.faqs } : {}),
  };
  const enriched = enrichOperatorSeo(merged, destName);

  return {
    ...enriched,
    destinationSlug: destSlug,
    viatorDestinationId: index.viatorDestinationId,
    destinationName: destName,
  };
}

/** Merge CRM rows that share the same slug / normalized name. */
export function mergeOperatorCrmRows(rows) {
  if (!rows?.length) return null;
  const sorted = [...rows].sort((a, b) => {
    const ta = (a.tour_product_ids || []).length;
    const tb = (b.tour_product_ids || []).length;
    return tb - ta;
  });
  const primary = sorted[0];
  const productIds = new Set();
  const destIds = new Set();
  for (const row of rows) {
    (row.tour_product_ids || []).forEach((id) => productIds.add(String(id)));
    (row.destination_ids || []).forEach((id) => destIds.add(String(id).replace(/^d/i, '')));
  }
  return {
    ...primary,
    operator_name: primary.operator_name,
    tour_product_ids: [...productIds],
    destination_ids: [...destIds],
  };
}

/** Short hero line — stats live in the stat boxes; About section holds editorial copy. */
export function buildOperatorIntro({ operatorName, destinationName }) {
  const dest = destinationName || 'this destination';
  return `Every ${operatorName} tour in ${dest} in one place — compare ratings, duration, and book with live availability.`;
}

export function getOperatorPagePath(destinationSlug, operatorSlug) {
  return `/destinations/${destinationSlug}/operators/${operatorSlug}`;
}
