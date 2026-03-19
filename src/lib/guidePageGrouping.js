/**
 * Dedupe, section grouping, and tour matching for destination guide listing pages.
 */

import { getTourProductId } from '@/utils/tourHelpers';

/** @typedef {{ id: string, label: string, order: number, keywords: string[] }} GuideSectionDef */

/** @type {GuideSectionDef[]} — first keyword hit wins by highest score; order is section sort */
export const GUIDE_SECTION_DEFS = [
  {
    id: 'logistics',
    label: 'Plan & get around',
    order: 10,
    keywords: [
      'airport',
      'transfer',
      'shuttle',
      'ferry',
      'transport',
      'tuk tuk',
      'bus tour',
      'getting around',
      'shore excursion',
    ],
  },
  {
    id: 'water',
    label: 'Water, beaches & boats',
    order: 20,
    keywords: [
      'beach',
      'snorkel',
      'snorkeling',
      'dive',
      'diving',
      'scuba',
      'catamaran',
      'cruise',
      'boat',
      'sailing',
      'kayak',
      'paddle',
      'island',
      'marine',
      'reef',
      'swim',
      'yacht',
      'sail',
    ],
  },
  {
    id: 'adventure',
    label: 'Adventure & nature',
    order: 30,
    keywords: [
      'atv',
      'quad',
      'buggy',
      'zipline',
      'zip line',
      'adventure',
      'hiking',
      'e-bike',
      'ebike',
      'mountain bike',
      'jungle',
      'wildlife',
      'elephant',
      'safari',
      'photo shoot',
      'photography',
    ],
  },
  {
    id: 'culture-food',
    label: 'Culture, food & city',
    order: 40,
    keywords: [
      'food',
      'culinary',
      'cooking',
      'wine',
      'beer',
      'tasting',
      'culture',
      'heritage',
      'museum',
      'architecture',
      'historic',
      'walking tour',
      'old town',
      'market',
      'castle',
      'charles bridge',
      'unesco',
    ],
  },
  {
    id: 'wellness',
    label: 'Wellness & relaxation',
    order: 50,
    keywords: ['yoga', 'spa', 'wellness', 'meditation', 'massage', 'brunch'],
  },
  {
    id: 'private-luxury',
    label: 'Private & luxury',
    order: 60,
    keywords: ['private', 'luxury', 'vip', 'chauffeur', 'exclusive'],
  },
  {
    id: 'curated',
    label: 'Curated picks & deals',
    order: 70,
    keywords: [
      'curated',
      'catalog',
      'finest',
      'excellent quality',
      'top product',
      "don't miss",
      'award',
      'low cancellation',
      'last-minute',
      'new tour',
      'seeking',
      'book before',
    ],
  },
];

function normalizeTitleForDedupe(s) {
  return String(s || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function titlesSimilar(a, b) {
  if (!a || !b) return false;
  if (a === b) return true;
  if (a.length < 12 || b.length < 12) return false;
  if (a.includes(b) || b.includes(a)) return true;
  const wa = new Set(a.split(' ').filter((w) => w.length > 3));
  const wb = new Set(b.split(' ').filter((w) => w.length > 3));
  if (wa.size === 0 || wb.size === 0) return false;
  let inter = 0;
  for (const w of wa) {
    if (wb.has(w)) inter += 1;
  }
  const j = inter / Math.min(wa.size, wb.size);
  return j >= 0.85;
}

/**
 * Remove near-duplicate guides (e.g. two "Low cancellation" variants).
 * @param {object[]} guides
 */
export function dedupeCategoryGuides(guides) {
  if (!Array.isArray(guides) || guides.length === 0) return [];
  const kept = [];
  for (const g of guides) {
    const n = normalizeTitleForDedupe(g.title || g.category_name || '');
    if (!n) {
      kept.push(g);
      continue;
    }
    const isDup = kept.some((k) => titlesSimilar(normalizeTitleForDedupe(k.title || k.category_name || ''), n));
    if (!isDup) kept.push(g);
  }
  return kept;
}

function haystackForGuide(guide) {
  return [guide.category_slug, guide.title, guide.category_name, guide.subtitle || '']
    .filter(Boolean)
    .join(' ')
    .toLowerCase();
}

/**
 * @param {object} guide
 * @returns {{ id: string, label: string }}
 */
export function assignGuideSection(guide) {
  const hay = haystackForGuide(guide);
  let bestId = 'other';
  let bestLabel = 'More guides';
  let bestScore = 0;

  for (const sec of GUIDE_SECTION_DEFS) {
    let sc = 0;
    for (const kw of sec.keywords) {
      const k = kw.toLowerCase();
      if (hay.includes(k)) sc += k.split(/\s+/).filter(Boolean).length || 1;
    }
    if (sc > bestScore) {
      bestScore = sc;
      bestId = sec.id;
      bestLabel = sec.label;
    }
  }

  if (bestScore <= 0) {
    return { id: 'other', label: 'More guides' };
  }
  return { id: bestId, label: bestLabel };
}

/**
 * @param {object[]} guides — deduped recommended
 * @returns {{ id: string, label: string, order: number, guides: object[] }[]}
 */
export function groupGuidesIntoSections(guides) {
  const byId = new Map();
  for (const sec of GUIDE_SECTION_DEFS) {
    byId.set(sec.id, { id: sec.id, label: sec.label, order: sec.order, guides: [] });
  }
  byId.set('other', { id: 'other', label: 'More guides', order: 100, guides: [] });

  for (const g of guides) {
    const { id } = assignGuideSection(g);
    const block = byId.get(id);
    if (block) block.guides.push(g);
    else byId.get('other').guides.push(g);
  }

  return [...byId.values()]
    .filter((b) => b.guides.length > 0)
    .sort((a, b) => a.order - b.order);
}

function tokenize(s) {
  return String(s || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .split(/[^a-z0-9]+/)
    .filter((w) => w.length > 2);
}

function slugTokens(slug) {
  return String(slug || '')
    .split(/[-_]+/)
    .map((t) => t.toLowerCase())
    .filter((t) => t.length > 2);
}

/**
 * Pick up to `limit` tours most relevant to a category guide (keyword overlap).
 * @param {object} guide
 * @param {object[]} tours — Viator-shaped products
 * @param {number} [limit]
 */
export function pickToursForGuide(guide, tours, limit = 3) {
  if (!Array.isArray(tours) || tours.length === 0) return [];

  const guideText = [guide.title, guide.category_name, guide.subtitle, guide.category_slug].filter(Boolean).join(' ');
  const gTokens = new Set([
    ...tokenize(guideText),
    ...slugTokens(guide.category_slug),
    ...tokenize(String(guide.category_slug || '').replace(/-/g, ' ')),
  ]);

  const scored = tours
    .map((tour) => {
      const title = (tour.title || tour.productTitle || '').toLowerCase();
      const desc = (
        tour.description ||
        tour.shortDescription ||
        tour.productContent?.description ||
        ''
      ).toLowerCase();
      const tTokens = new Set(tokenize(`${title} ${desc}`));
      let score = 0;
      for (const tok of gTokens) {
        if (tTokens.has(tok)) score += 2;
        if (tok.length > 3 && title.includes(tok)) score += 1;
      }
      return { tour, score };
    })
    .filter((x) => x.score > 0)
    .sort((a, b) => b.score - a.score);

  const out = [];
  const seen = new Set();
  for (const { tour } of scored) {
    const id = getTourProductId(tour);
    if (!id || seen.has(id)) continue;
    seen.add(id);
    out.push(tour);
    if (out.length >= limit) break;
  }
  return out;
}
