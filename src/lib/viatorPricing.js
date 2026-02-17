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
 * Fetch fromPrice in USD from Viator schedules API.
 * Requests currency=USD when possible; if API returns local currency, converts to USD.
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
    const rawPrice = data?.summary?.fromPrice;
    if (rawPrice == null || typeof rawPrice !== 'number' || rawPrice <= 0) {
      return null;
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
