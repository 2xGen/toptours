/**
 * Lightweight Viator bulk helper for explore pages.
 * Uses POST /products/bulk + /availability/schedules/bulk to get image, rating, reviews, and from-price.
 * Converts non-USD (e.g. JPY for Tokyo) to USD so the site shows consistent "$" pricing.
 *
 * Env:
 * - VIATOR_API_KEY (required for live)
 * - VIATOR_API_BASE_URL (optional, default https://api.viator.com/partner)
 * - VIATOR_USE_LIVE_API: set to "true" to actually call Viator; otherwise returns [] (safe in dev).
 */

// Approximate rates to USD (match viatorPricing.js). Used when API returns local currency (e.g. JPY for Tokyo).
const CURRENCY_TO_USD = {
  JPY: 0.0067,
  EUR: 1.08,
  GBP: 1.27,
  AUD: 0.65,
  CAD: 0.72,
  CHF: 1.12,
  MXN: 0.058,
  KRW: 0.00075,
  CNY: 0.14,
  THB: 0.029,
  SGD: 0.74,
  HKD: 0.13,
  NZD: 0.6,
};

function toUsd(amount, currencyCode) {
  if (amount == null || typeof amount !== 'number' || amount <= 0) return null;
  const code = (currencyCode || '').toUpperCase();
  if (code === 'USD') return amount;
  const rate = CURRENCY_TO_USD[code];
  if (rate == null) return null;
  return Math.round(amount * rate * 100) / 100;
}

function pixelArea(c) {
  const w = c.width ?? 0;
  const h = c.height ?? 0;
  return w * h || w || h || 0;
}

function tryUpscaleImageUrl(url, targetSize = 1024) {
  if (!url || typeof url !== 'string') return url;
  let out = url;
  out = out.replace(/\/(\d{2,4})x(\d{2,4})\//g, `/${targetSize}x${Math.round((targetSize * 3) / 4)}/`);
  out = out.replace(/\/(\d{2,4})\/(?=[^/]*$)/g, `/${targetSize}/`);
  out = out.replace(/-(\d{2,4})x(\d{2,4})-/g, `-${targetSize}x${Math.round((targetSize * 3) / 4)}-`);
  out = out.replace(/_(\d{2,4})x(\d{2,4})_/g, `_${targetSize}x${Math.round((targetSize * 3) / 4)}_`);
  out = out.replace(/([?&])(w|width)=(\d+)/gi, (m, p, k) => `${p}${k}=${targetSize}`);
  out = out.replace(/([?&])h(eight)?=(\d+)/gi, (m, p) => `${p}h=${Math.round((targetSize * 3) / 4)}`);
  return out;
}

function findFirstUrl(obj) {
  if (obj === null || typeof obj !== 'object') return null;
  const record = obj;
  if (typeof record.url === 'string' && record.url.length > 0) return record.url;
  for (const key of Object.keys(record)) {
    const v = record[key];
    if (typeof v === 'string' && key.toLowerCase().includes('url') && v.length > 0) return v;
    if (Array.isArray(v) && v.length > 0) {
      const inFirst = findFirstUrl(v[0]);
      if (inFirst) return inFirst;
    }
    if (v && typeof v === 'object' && !Array.isArray(v)) {
      const nested = findFirstUrl(v);
      if (nested) return nested;
    }
  }
  return null;
}

function getFirstImageUrl(images) {
  if (!images || !images.length) return null;
  const img = images.find((i) => i.isCover) ?? images[0];
  if (!img || typeof img !== 'object') return null;

  const variants = img.variants;
  if (Array.isArray(variants) && variants.length > 0) {
    const withUrl = variants
      .map((v) => ({ url: v.url, width: v.width, height: v.height }))
      .filter((v) => typeof v.url === 'string' && v.url.length > 0);
    if (withUrl.length > 0) {
      const best = withUrl.reduce((a, b) => (pixelArea(b) > pixelArea(a) ? b : a));
      return best.url;
    }
  }

  const variantsObj = variants && !Array.isArray(variants) ? variants : null;
  if (variantsObj) {
    const order = ['large', 'xlarge', 'hero', 'cover', 'main', 'medium', 'small', 'thumbnail'];
    for (const key of order) {
      const u = variantsObj[key]?.url;
      if (typeof u === 'string' && u.length > 0) return u;
    }
  }

  const photoVersions = img.photoVersions;
  if (Array.isArray(photoVersions) && photoVersions.length > 0) {
    const withSize = photoVersions
      .map((p) => ({ url: p.url, width: p.width, height: p.height }))
      .filter((p) => typeof p.url === 'string' && p.url.length > 0);
    if (withSize.length > 0) {
      const best = withSize.reduce((a, b) => (pixelArea(b) > pixelArea(a) ? b : a));
      return best.url;
    }
  }

  const directUrl = img.url ?? img.imageUrl;
  if (typeof directUrl === 'string' && directUrl.length > 0) return tryUpscaleImageUrl(directUrl);

  const deep = findFirstUrl(img);
  return deep ? tryUpscaleImageUrl(deep) : null;
}

function mapBulkItemToSummary(item) {
  if (!item || item.status !== 'ACTIVE' || !item.productCode || !item.productUrl) return null;
  const pricing = item.pricingInfo || {};
  let priceFrom =
    typeof pricing.priceFrom === 'number'
      ? pricing.priceFrom
      : typeof pricing.fromPrice === 'number'
      ? pricing.fromPrice
      : undefined;
  if (priceFrom === undefined && typeof pricing.recommendedRetailPrice === 'number') {
    priceFrom = pricing.recommendedRetailPrice;
  }
  if (priceFrom === undefined && typeof pricing.minPrice === 'number') {
    priceFrom = pricing.minPrice;
  }
  if (priceFrom === undefined && Array.isArray(pricing.ageBands) && pricing.ageBands.length > 0) {
    const prices = pricing.ageBands
      .map((b) => b.recommendedRetailPrice ?? b.price)
      .filter((n) => typeof n === 'number');
    if (prices.length > 0) priceFrom = Math.min(...prices);
  }
  const currency = (pricing.currency || 'USD').toUpperCase();
  let displayPrice = priceFrom;
  let displayCurrency = currency;
  if (typeof priceFrom === 'number' && currency !== 'USD') {
    const usd = toUsd(priceFrom, currency);
    if (usd != null && usd > 0) {
      displayPrice = usd;
      displayCurrency = 'USD';
    }
  }
  const currencySymbol = displayCurrency === 'USD' ? '$' : `${displayCurrency} `;
  let fromPriceDisplay;
  if (typeof displayPrice === 'number') {
    fromPriceDisplay = `Price from ${currencySymbol}${Math.round(displayPrice)}`;
  } else if (typeof pricing.summary === 'string' && pricing.summary.trim()) {
    const s = pricing.summary.trim();
    fromPriceDisplay = /^(from\s+)?\$?\d+/i.test(s)
      ? `Price from ${s.replace(/^from\s+/i, '').trim()}`
      : s;
  } else {
    fromPriceDisplay = 'Price from (see options)';
  }

  const totalReviews = Number(item.reviews?.totalReviews) || 0;
  const averageRating =
    Number(item.reviews?.averageRating) || Number(item.reviews?.combinedAverageRating) || 0;
  const firstImage = getFirstImageUrl(item.images);
  const policyText = String(item.cancellationPolicy?.type ?? '') + String(item.cancellationPolicy?.description ?? '');
  const freeCancellation = policyText.toUpperCase().includes('FREE');

  return {
    productCode: item.productCode,
    title: item.title || 'Tour',
    productUrl: item.productUrl,
    fromPriceDisplay,
    fromPrice: typeof displayPrice === 'number' ? displayPrice : undefined,
    currency,
    reviewCount: totalReviews,
    rating: averageRating,
    imageUrl: firstImage || null,
    freeCancellation,
  };
}

async function fetchPricesFromSchedules(productCodes) {
  const apiKey = process.env.VIATOR_API_KEY;
  if (!apiKey || !productCodes.length) return new Map();
  const base = process.env.VIATOR_API_BASE_URL || 'https://api.viator.com/partner';
  const url = `${base}/availability/schedules/bulk`;
  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json;version=2.0',
      'Accept-Language': 'en-US',
      'exp-api-key': apiKey,
    },
    body: JSON.stringify({ productCodes }),
    next: { revalidate: 3600 },
  });
  if (!res.ok) return new Map();

  const data = await res.json();
  const list = data?.availabilitySchedules || [];
  const map = new Map();

  for (const schedule of list) {
    const code = schedule.productCode;
    if (!code) continue;
    let minPrice = null;
    for (const item of schedule.bookableItems || []) {
      for (const season of item.seasons || []) {
        for (const record of season.pricingRecords || []) {
          for (const detail of record.pricingDetails || []) {
            const rrp = detail.price?.original?.recommendedRetailPrice;
            if (typeof rrp === 'number' && rrp > 0) {
              if (minPrice === null || rrp < minPrice) minPrice = rrp;
            }
          }
        }
      }
    }
    if (minPrice !== null) map.set(code, minPrice);
  }
  return map;
}

/**
 * Fetch summary data (image, price, rating, reviewCount, productUrl) for up to 500 products.
 * Returns [] when VIATOR_USE_LIVE_API is not \"true\" or when API calls fail.
 * @param {string[]} productCodes
 * @param {{ destinationSlug?: string }} [opts] - If destinationSlug is 'tokyo' (or other JPY destination), schedule overlay prices are treated as JPY when API doesn't return currency.
 */
export async function fetchProductsBulk(productCodes, opts = {}) {
  const useLive = process.env.VIATOR_USE_LIVE_API === 'true';
  if (!useLive || !productCodes || productCodes.length === 0) return [];
  const apiKey = process.env.VIATOR_API_KEY;
  if (!apiKey) return [];
  const base = process.env.VIATOR_API_BASE_URL || 'https://api.viator.com/partner';
  const url = `${base}/products/bulk`;
  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json;version=2.0',
      'Accept-Language': 'en-US',
      'exp-api-key': apiKey,
    },
    body: JSON.stringify({ productCodes }),
    next: { revalidate: 3600 },
  });
  if (!res.ok) return [];

  const data = await res.json();
  if (!Array.isArray(data)) return [];

  const destinationSlug = opts?.destinationSlug || '';
  const assumeJpy = /^tokyo$/i.test(destinationSlug);

  const summaries = [];
  for (const item of data) {
    const summary = mapBulkItemToSummary(item);
    if (summary) summaries.push(summary);
  }

  // Overlay from-price from schedules when available (schedules often return local currency e.g. JPY for Tokyo)
  const priceMap = await fetchPricesFromSchedules(productCodes);
  for (const s of summaries) {
    const p = priceMap.get(s.productCode);
    if (typeof p === 'number') {
      let usd = null;
      if (s.currency && s.currency !== 'USD') {
        usd = toUsd(p, s.currency);
      } else if (assumeJpy && p >= 500 && p <= 500000) {
        usd = toUsd(p, 'JPY');
      }
      if (usd != null && usd > 0) {
        s.fromPrice = usd;
        s.fromPriceDisplay = `Price from $${Math.round(usd)}`;
      } else {
        s.fromPrice = p;
        s.fromPriceDisplay = `Price from $${Math.round(p)}`;
      }
    }
    delete s.currency;
  }

  return summaries;
}

