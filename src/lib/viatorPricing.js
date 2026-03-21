/**
 * Viator Pricing API Integration
 *
 * Fetches fromPrice from /availability/schedules endpoint.
 * Schedules API returns supplier (local) currency by default; we request USD and
 * fall back to converting JPY/other common currencies so the site always shows USD.
 */

// Approximate rates to USD (used only when API returns non-USD). Update periodically if needed.
const CURRENCY_TO_USD = {
  JPY: 0.0067,   // ~150 JPY = 1 USD
  EUR: 1.08,
  GBP: 1.27,
  AUD: 0.65,
  CAD: 0.72,
  CHF: 1.12,
  MXN: 0.058,
  BRL: 0.17,
  INR: 0.012,
  KRW: 0.00075,
  CNY: 0.14,
  THB: 0.029,
  SGD: 0.74,
  HKD: 0.13,
  NZD: 0.60,
};

/**
 * Parse a numeric price from mixed Viator fields.
 * @param {unknown} raw
 * @returns {number|null}
 */
function parsePositivePrice(raw) {
  if (raw == null) return null;
  if (typeof raw === 'number' && Number.isFinite(raw) && raw > 0) return raw;
  if (typeof raw === 'string') {
    const cleaned = raw.replace(/[$,\s]/g, '');
    const parsed = parseFloat(cleaned);
    if (Number.isFinite(parsed) && parsed > 0) return parsed;
  }
  return null;
}

/**
 * Best retail-style price from age bands: avoids picking INFANT/CHILD minimum when ADULT exists.
 * UNIT/private products: TRAVELER band usually holds the whole-booking "from" price.
 *
 * @param {object} pricingInfo
 * @returns {number|null}
 */
function getFromPriceFromPricingInfoAgeBands(pricingInfo) {
  if (!pricingInfo || !Array.isArray(pricingInfo.ageBands) || pricingInfo.ageBands.length === 0) {
    return null;
  }

  const type = pricingInfo.type || 'PER_PERSON';

  if (type === 'UNIT') {
    const traveler = pricingInfo.ageBands.find((b) => b.ageBand === 'TRAVELER');
    const t =
      parsePositivePrice(traveler?.recommendedRetailPrice) ??
      parsePositivePrice(traveler?.price) ??
      parsePositivePrice(traveler?.fromPrice);
    if (t != null) return t;
  }

  const adult = pricingInfo.ageBands.find((b) => b.ageBand === 'ADULT');
  const a =
    parsePositivePrice(adult?.recommendedRetailPrice) ??
    parsePositivePrice(adult?.price) ??
    parsePositivePrice(adult?.fromPrice);
  if (a != null) return a;

  const senior = pricingInfo.ageBands.find((b) => b.ageBand === 'SENIOR');
  const s =
    parsePositivePrice(senior?.recommendedRetailPrice) ??
    parsePositivePrice(senior?.price) ??
    parsePositivePrice(senior?.fromPrice);
  if (s != null) return s;

  // Fallback: max non-infant band (avoid $0 infant / cheap child as "from")
  let best = null;
  for (const band of pricingInfo.ageBands) {
    if (band?.ageBand === 'INFANT') continue;
    const v =
      parsePositivePrice(band?.recommendedRetailPrice) ??
      parsePositivePrice(band?.price) ??
      parsePositivePrice(band?.fromPrice);
    if (v != null && (best == null || v > best)) best = v;
  }
  return best;
}

/**
 * Official "from" price from the product payload (search / products API).
 *
 * Important: `pricing.summary.fromPrice` is often a **lowest** bookable amount across options
 * and age bands (can be a small add-on or child slice). Prefer `pricingInfo` marketing fields
 * and ADULT / TRAVELER age-band retail prices — aligned with list/explore behavior.
 *
 * @param {object|null|undefined} tour - Raw Viator product object
 * @returns {number|null}
 */
export function getFromPriceFromProductTour(tour) {
  if (!tour || typeof tour !== 'object') return null;

  const pi = tour.pricingInfo;

  // Same priority as explore cards: priceFrom → recommendedRetailPrice → fromPrice
  const fromInfoTop =
    parsePositivePrice(pi?.priceFrom) ??
    parsePositivePrice(pi?.recommendedRetailPrice) ??
    parsePositivePrice(pi?.fromPrice);
  if (fromInfoTop != null) return fromInfoTop;

  const fromBands = getFromPriceFromPricingInfoAgeBands(pi);
  if (fromBands != null) return fromBands;

  const fromSummary =
    parsePositivePrice(tour.pricing?.summary?.fromPrice) ??
    parsePositivePrice(tour.pricing?.fromPrice) ??
    parsePositivePrice(tour.price?.fromPrice);

  if (fromSummary != null) return fromSummary;

  if (typeof tour.price === 'number' && tour.price > 0) return tour.price;

  return null;
}

/**
 * True when product payload has trustworthy pricing outside `pricing.summary.fromPrice`
 * (top-level pricingInfo or age bands). Cached Supabase rows sometimes only retain summary.fromPrice,
 * which can be a junk minimum — then schedules should win when it disagrees materially.
 *
 * @param {object|null|undefined} tour
 * @returns {boolean}
 */
export function hasRichPricingInfoInTour(tour) {
  const pi = tour?.pricingInfo;
  if (!pi || typeof pi !== 'object') return false;
  if (parsePositivePrice(pi.priceFrom) != null) return true;
  if (parsePositivePrice(pi.recommendedRetailPrice) != null) return true;
  if (parsePositivePrice(pi.fromPrice) != null) return true;
  if (Array.isArray(pi.ageBands) && pi.ageBands.length > 0) {
    return pi.ageBands.some(
      (b) =>
        parsePositivePrice(b?.recommendedRetailPrice) != null ||
        parsePositivePrice(b?.price) != null ||
        parsePositivePrice(b?.fromPrice) != null
    );
  }
  return false;
}

/**
 * Merge product-derived price with schedules API price. When the cached product only has a weak
 * `pricing.summary.fromPrice`, schedules often matches list cards / Viator (e.g. private charters).
 *
 * @param {number|null|undefined} productPrice
 * @param {number|null|undefined} schedulePrice
 * @param {object|null|undefined} tour
 * @returns {number|null}
 */
export function reconcileProductPriceWithSchedule(productPrice, schedulePrice, tour) {
  const p = parsePositivePrice(productPrice);
  const s = parsePositivePrice(schedulePrice);

  if (p == null && s == null) return null;
  if (s == null) return p;
  if (p == null) return s;

  if (hasRichPricingInfoInTour(tour)) {
    return p;
  }

  // Thin product: summary-only or stale cache — schedules is more reliable when it's much higher
  if (s > p && s > 100) {
    if (p < 45) return s;
    if (p / s < 0.12) return s;
    if (p <= 35 && s - p >= 150) return s;
  }

  return p;
}

/**
 * Lowest recommendedRetailPrice among ADULT / TRAVELER / SENIOR rows in schedules payload.
 * @param {object} scheduleData - JSON from GET /availability/schedules/{product}
 * @returns {number|null}
 */
function getMinRecommendedRetailPrimaryBands(scheduleData) {
  if (!scheduleData || typeof scheduleData !== 'object') return null;
  const PRIMARY = new Set(['ADULT', 'TRAVELER', 'SENIOR']);
  let min = null;
  for (const item of scheduleData.bookableItems || []) {
    for (const season of item.seasons || []) {
      for (const record of season.pricingRecords || []) {
        for (const detail of record.pricingDetails || []) {
          if (!PRIMARY.has(detail.ageBand)) continue;
          const rrp = detail.price?.original?.recommendedRetailPrice;
          if (typeof rrp === 'number' && rrp > 0) {
            if (min === null || rrp < min) min = rrp;
          }
        }
      }
    }
  }
  return min;
}

/**
 * Fetch fromPrice in USD from Viator schedules API.
 * Requests currency=USD when possible; if API returns local currency, converts to USD.
 * Use as fallback when {@link getFromPriceFromProductTour} returns null.
 */
export async function getFromPrice(productId) {
  try {
    const apiKey = process.env.VIATOR_API_KEY;

    if (!apiKey) {
      return null;
    }

    const url = `https://api.viator.com/partner/availability/schedules/${productId}?currency=USD`;

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'exp-api-key': apiKey,
        'Accept': 'application/json;version=2.0',
        'Accept-Language': 'en-US',
        'Content-Type': 'application/json',
      },
      next: { revalidate: 3600 },
    });

    if (!response.ok) {
      return null;
    }

    const data = await response.json();
    let rawPrice = data?.summary?.fromPrice;
    if (rawPrice == null || typeof rawPrice !== 'number' || rawPrice <= 0) {
      return null;
    }

    // Schedules `summary.fromPrice` can be an anomalous low vs ADULT/TRAVELER `recommendedRetailPrice`
    // in bookableItems (e.g. private charters). When summary is tiny but primary bands are high-ticket, trust bands.
    const minPrimaryBandRrp = getMinRecommendedRetailPrimaryBands(data);
    if (
      minPrimaryBandRrp != null &&
      minPrimaryBandRrp >= 200 &&
      rawPrice < Math.min(150, minPrimaryBandRrp * 0.2)
    ) {
      rawPrice = minPrimaryBandRrp;
    }

    const currency = (data?.summary?.currencyCode || data?.summary?.currency || '').toUpperCase();

    if (currency === 'USD') {
      return rawPrice;
    }

    if (currency && CURRENCY_TO_USD[currency] != null) {
      const usd = Math.round(rawPrice * CURRENCY_TO_USD[currency] * 100) / 100;
      return usd > 0 ? usd : rawPrice;
    }

    if (!currency && rawPrice > 2000 && rawPrice < 500000) {
      return Math.round(rawPrice * CURRENCY_TO_USD.JPY * 100) / 100;
    }

    return rawPrice;
  } catch (error) {
    return null;
  }
}
