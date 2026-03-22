/**
 * Viator Pricing API Integration
 *
 * Schedules: GET /availability/schedules/{productCode}?currency=USD — use root `currency` plus
 * `summary.fromPrice` (and bookableItems pricing) as supplier denomination when API does not return USD.
 * For merchant-accurate conversion, Viator documents POST /exchange-rates (cached by expiry); we use
 * static CURRENCY_TO_USD until that is wired.
 */

// Approximate rates to USD when converting supplier-denominated amounts (see schedules root `currency`).
// For production parity with Viator invoicing, prefer POST /exchange-rates (cache by expiry) and replace these.
// https://partnerresources.viator.com — Calculating Product Pricing
const CURRENCY_TO_USD = {
  JPY: 0.0067,
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
  TWD: 0.031,
  VND: 0.00004,
  IDR: 0.000063,
  PHP: 0.018,
  MYR: 0.21,
  AED: 0.27,
  DKK: 0.14,
  NOK: 0.091,
  SEK: 0.091,
  PLN: 0.25,
  TRY: 0.029,
  ZAR: 0.054,
  CLP: 0.001,
  COP: 0.00024,
  ARS: 0.001,
  PEN: 0.27,
  ISK: 0.007,
  FJD: 0.44,
  RUB: 0.011,
  ILS: 0.27,
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
 * Convert a retail amount to USD when we know the ISO currency (Partner API returns the requested
 * currency on `?currency=USD`, but cached rows may still hold supplier-currency numbers).
 */
function convertRetailAmountToUsd(amount, currencyCode) {
  if (amount == null || !Number.isFinite(amount) || amount <= 0) return null;
  const cc = (currencyCode || 'USD').toUpperCase();
  if (cc === 'USD') return amount;
  if (CURRENCY_TO_USD[cc] != null) {
    const usd = Math.round(amount * CURRENCY_TO_USD[cc] * 100) / 100;
    return usd > 0 ? usd : amount;
  }
  return amount;
}

/**
 * Best-effort retail currency from the product payload (schedules use `summary.currencyCode` separately).
 * @param {object|null|undefined} tour
 * @returns {string} ISO code or '' if unknown
 */
export function getProductRetailCurrencyCode(tour) {
  if (!tour || typeof tour !== 'object') return '';
  const root = (tour.currency || '').toString().trim().toUpperCase();
  if (root) return root;
  const sum = tour.pricing?.summary;
  const fromSummary =
    (sum?.currencyCode || sum?.currency || '').toString().trim().toUpperCase() ||
    (tour.pricingInfo?.currency || '').toString().trim().toUpperCase() ||
    (tour.pricing?.currency || '').toString().trim().toUpperCase() ||
    '';
  if (fromSummary) return fromSummary;

  const pi = tour.pricingInfo;
  if (pi && typeof pi === 'object') {
    const top = (pi.currency || pi.priceCurrency || '').toString().trim().toUpperCase();
    if (top) return top;
    // Some cached products store currency only on age-band retail rows
    const band0 = Array.isArray(pi.ageBands) ? pi.ageBands[0] : null;
    const fromBand = (band0?.currency || band0?.recommendedRetailPriceCurrency || '').toString().trim().toUpperCase();
    if (fromBand) return fromBand;
    const bands = Array.isArray(pi.ageBands) ? pi.ageBands : [];
    const bandCurrencies = bands
      .map((b) => (b?.currency || b?.price?.currency || '').toString().trim().toUpperCase())
      .filter(Boolean);
    if (bandCurrencies.length && bandCurrencies.every((x) => x === bandCurrencies[0])) {
      return bandCurrencies[0];
    }
  }
  return '';
}

/** Normalize a single raw retail amount using {@link getProductRetailCurrencyCode} (for legacy fallbacks). */
export function normalizeProductPriceToUsd(rawPrice, tour) {
  const r = parsePositivePrice(rawPrice);
  if (r == null) return null;
  const cc = getProductRetailCurrencyCode(tour) || 'USD';
  return convertRetailAmountToUsd(r, cc);
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

  let raw = null;

  // Same priority as explore cards: priceFrom → recommendedRetailPrice → fromPrice
  const fromInfoTop =
    parsePositivePrice(pi?.priceFrom) ??
    parsePositivePrice(pi?.recommendedRetailPrice) ??
    parsePositivePrice(pi?.fromPrice);
  if (fromInfoTop != null) raw = fromInfoTop;

  if (raw == null) {
    const fromBands = getFromPriceFromPricingInfoAgeBands(pi);
    if (fromBands != null) raw = fromBands;
  }

  if (raw == null) {
    const fromSummary =
      parsePositivePrice(tour.pricing?.summary?.fromPrice) ??
      parsePositivePrice(tour.pricing?.fromPrice) ??
      parsePositivePrice(tour.price?.fromPrice);
    if (fromSummary != null) raw = fromSummary;
  }

  if (raw == null && typeof tour.price === 'number' && tour.price > 0) {
    raw = tour.price;
  }

  return normalizeProductPriceToUsd(raw, tour);
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
 * Merge product-derived price (USD-normalized) with schedules API price (USD).
 * When schedules return a price, it is authoritative: amounts follow supplier currency in the
 * schedules payload (see root `currency` + `summary.fromPrice`), then we convert to USD in getFromPrice.
 * Product cache can be stale or wrong-currency; we do not use numeric ratio heuristics (e.g. p &gt; 2000).
 *
 * @param {number|null|undefined} productPrice
 * @param {number|null|undefined} schedulePrice
 * @param {object|null|undefined} tour
 * @returns {number|null}
 */
export function reconcileProductPriceWithSchedule(productPrice, schedulePrice, _tour) {
  const s = parsePositivePrice(schedulePrice);
  if (s != null && s > 0) {
    return s;
  }
  return parsePositivePrice(productPrice);
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

    // Partner schedules: root `currency` is supplier denomination for summary + bookableItems (see API samples).
    // Example: "currency": "AUD", "summary": { "fromPrice": 56.15 } → 56.15 AUD, not USD.
    const scheduleCurrency = (
      (typeof data.currency === 'string' && data.currency.trim()) ||
      data?.summary?.currencyCode ||
      data?.summary?.currency ||
      ''
    )
      .toString()
      .toUpperCase();

    if (scheduleCurrency === 'USD' || !scheduleCurrency) {
      return rawPrice;
    }

    if (CURRENCY_TO_USD[scheduleCurrency] != null) {
      const usd = Math.round(rawPrice * CURRENCY_TO_USD[scheduleCurrency] * 100) / 100;
      return usd > 0 ? usd : rawPrice;
    }

    // Unknown ISO code: return raw (caller may still show $ — prefer adding rate or POST /exchange-rates).
    return rawPrice;
  } catch (error) {
    return null;
  }
}
