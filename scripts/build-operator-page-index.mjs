/**
 * Build operator page index JSON for pilot destinations.
 * Usage: node scripts/build-operator-page-index.mjs aruba
 */
import { config } from 'dotenv';
import { writeFileSync, mkdirSync, readFileSync, existsSync } from 'fs';
import { dirname, join } from 'path';
import { createClient } from '@supabase/supabase-js';
import { discoverOperatorProductCodes } from '../src/lib/operatorDiscovery.js';
import {
  buildOperatorBlurb,
  buildOperatorFaqs,
  truncateHighlight,
} from '../src/lib/operatorPageSeo.js';
import { slugToViatorId, getOperatorViatorIdForSlug } from '../src/data/viatorDestinationMap.js';
import { destinations } from '../src/data/destinationsData.js';

config({ path: '.env.local' });

const destinationSlug = (process.argv[2] || 'aruba').toLowerCase();
const MEANINGFUL_REVIEWS = 5;

const viatorDestinationId = getOperatorViatorIdForSlug(destinationSlug);
if (!viatorDestinationId) {
  console.error('No Viator destination ID for slug:', destinationSlug);
  process.exit(1);
}

function getDestinationDisplayName(slug) {
  const dest = destinations.find((d) => d.id === slug);
  return dest?.fullName || dest?.name || slug.charAt(0).toUpperCase() + slug.slice(1).replace(/-/g, ' ');
}

const apiKey = process.env.VIATOR_API_KEY;
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

function normalizeOperatorKey(name) {
  return (name || '')
    .trim()
    .replace(/_/g, ' ')
    .replace(/\s+/g, ' ')
    .toLowerCase();
}

function operatorNameToSlug(name) {
  return (name || '')
    .toLowerCase()
    .trim()
    .replace(/_/g, '-')
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

function tourBelongsToDest(tour, destId) {
  const target = String(destId);
  return (tour?.destinations || []).some((d) => {
    const id = String(d.destinationId || d.id || d.ref || '').replace(/^d/i, '');
    return id === target;
  });
}

function extractCard(tour) {
  const productId = tour.productCode || tour.productId;
  const variants = tour?.images?.[0]?.variants;
  let imageUrl = null;
  if (Array.isArray(variants) && variants.length) {
    const sorted = [...variants].sort((a, b) => (b.width || 0) - (a.width || 0));
    imageUrl = sorted.find((v) => v.width >= 400 && v.width <= 800)?.url || sorted[0]?.url;
  }
  const title = tour.title || 'Tour';
  const slug = title
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .slice(0, 80);
  const highlight = truncateHighlight(
    tour.description?.shortDescription || tour.viatorUniqueContent?.shortDescription
  );
  return {
    productId: String(productId),
    title,
    slug,
    imageUrl,
    highlight,
    fromPrice: tour.pricing?.summary?.fromPrice ?? null,
    rating: tour.reviews?.combinedAverageRating ?? null,
    reviewCount: tour.reviews?.totalReviews ?? 0,
    durationMinutes:
      tour?.itinerary?.duration?.fixedDurationInMinutes ||
      tour?.duration?.fixedDurationInMinutes ||
      null,
  };
}

function loadOverrides(destSlug) {
  const path = join('src/data/operatorPages/overrides', `${destSlug}.json`);
  if (!existsSync(path)) return {};
  try {
    const raw = JSON.parse(readFileSync(path, 'utf8'));
    const { _comment, ...rest } = raw;
    return rest;
  } catch {
    return {};
  }
}

async function fetchProduct(code, attempt = 1) {
  const maxAttempts = 5;
  try {
    const res = await fetch(`https://api.viator.com/partner/products/${code}?currency=USD`, {
      headers: {
        'exp-api-key': apiKey,
        Accept: 'application/json;version=2.0',
        'Accept-Language': 'en-US',
      },
    });
    if (!res.ok) return null;
    return res.json();
  } catch (err) {
    if (attempt >= maxAttempts) throw err;
    const wait = Math.min(1000 * 2 ** attempt, 15000);
    console.warn(`  fetch ${code} failed (${err?.cause?.code || err.message}), retry ${attempt}/${maxAttempts - 1} in ${wait}ms`);
    await new Promise((r) => setTimeout(r, wait));
    return fetchProduct(code, attempt + 1);
  }
}

function writeIndex(outPath, payload) {
  mkdirSync(dirname(outPath), { recursive: true });
  writeFileSync(outPath, JSON.stringify(payload, null, 2));
}

function loadExistingSlugs(outPath) {
  if (!existsSync(outPath)) return new Set();
  try {
    const existing = JSON.parse(readFileSync(outPath, 'utf8'));
    return new Set((existing?.operators || []).map((o) => o.slug));
  } catch {
    return new Set();
  }
}

async function main() {
  const { data: operators, error } = await supabase
    .from('tour_operators_crm')
    .select('operator_name, tour_product_ids, destination_ids')
    .contains('destination_ids', [viatorDestinationId]);

  if (error) {
    console.error(error);
    process.exit(1);
  }

  console.log(`Processing ${operators.length} CRM operators for ${destinationSlug}...`);

  const bySlug = new Map();
  for (const op of operators) {
    const slug = operatorNameToSlug(op.operator_name);
    if (!slug) continue;
    if (!bySlug.has(slug)) bySlug.set(slug, []);
    bySlug.get(slug).push(op);
  }

  const overrides = loadOverrides(destinationSlug);
  const destDisplayName = getDestinationDisplayName(destinationSlug);
  const outPath = join('src/data/operatorPages', `${destinationSlug}.json`);
  const doneSlugs = loadExistingSlugs(outPath);
  const eligible = [];
  if (doneSlugs.size > 0) {
    try {
      const existing = JSON.parse(readFileSync(outPath, 'utf8'));
      eligible.push(...(existing?.operators || []));
      console.log(`Resuming — ${eligible.length} operators already in ${outPath}`);
    } catch {
      /* start fresh */
    }
  }

  let processed = 0;

  for (const [slug, rows] of bySlug) {
    processed++;
    if (doneSlugs.has(slug)) continue;
    const mergedIds = new Set();
    const mergedDestIds = new Set();
    let canonicalName = rows[0].operator_name;
    for (const row of rows) {
      (row.tour_product_ids || []).forEach((id) => mergedIds.add(String(id)));
      (row.destination_ids || []).forEach((id) => mergedDestIds.add(String(id).replace(/^d/i, '')));
      if ((row.tour_product_ids || []).length > (rows[0].tour_product_ids || []).length) {
        canonicalName = row.operator_name;
      }
    }

    const discovered = await discoverOperatorProductCodes(
      canonicalName,
      viatorDestinationId,
      apiKey
    );
    discovered.forEach((id) => mergedIds.add(String(id)));
    await new Promise((r) => setTimeout(r, 180));

    const productIds = [...mergedIds];
    if (productIds.length === 0) continue;

    const tours = [];
    for (const code of productIds) {
      const tour = await fetchProduct(code);
      await new Promise((r) => setTimeout(r, 150));
      if (!tour) continue;
      const inDest =
        tourBelongsToDest(tour, viatorDestinationId) ||
        (mergedDestIds.size === 1 && mergedDestIds.has(viatorDestinationId));
      if (!inDest) continue;
      tours.push(extractCard(tour));
    }

    tours.sort((a, b) => (b.reviewCount || 0) - (a.reviewCount || 0));

    const passes =
      tours.length >= 2 ||
      (tours.length === 1 && (tours[0].reviewCount || 0) >= MEANINGFUL_REVIEWS);

    if (!passes) continue;

    let totalReviews = 0;
    let weighted = 0;
    for (const t of tours) {
      if (t.reviewCount > 0 && t.rating > 0) {
        weighted += t.rating * t.reviewCount;
        totalReviews += t.reviewCount;
      }
    }

    const averageRating =
      totalReviews > 0 ? Math.round((weighted / totalReviews) * 100) / 100 : null;
    const seoCtx = {
      operatorName: canonicalName,
      destinationName: destDisplayName,
      tours,
      tourCount: tours.length,
      totalReviews,
      averageRating,
    };
    const manual = overrides[slug] || {};

    eligible.push({
      slug,
      operatorName: canonicalName,
      operatorKey: normalizeOperatorKey(canonicalName),
      tourCount: tours.length,
      totalReviews,
      averageRating,
      blurb: manual.blurb || buildOperatorBlurb(seoCtx),
      faqs: manual.faqs?.length ? manual.faqs : buildOperatorFaqs(seoCtx),
      tours,
    });
    doneSlugs.add(slug);

    if (processed % 10 === 0 || eligible.length % 10 === 0) {
      console.log(`  …${processed}/${bySlug.size} slug groups, ${eligible.length} eligible`);
      writeIndex(outPath, {
        destinationSlug,
        viatorDestinationId,
        destinationName: destDisplayName,
        builtAt: new Date().toISOString(),
        partial: true,
        operatorCount: eligible.length,
        operators: [...eligible].sort((a, b) => a.operatorName.localeCompare(b.operatorName)),
      });
    }
  }

  eligible.sort((a, b) => a.operatorName.localeCompare(b.operatorName));

  const out = {
    destinationSlug,
    viatorDestinationId,
    destinationName: destDisplayName,
    builtAt: new Date().toISOString(),
    operatorCount: eligible.length,
    operators: eligible,
  };

  writeIndex(outPath, out);
  console.log(`Wrote ${eligible.length} operators to ${outPath}`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
