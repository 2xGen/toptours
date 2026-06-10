/**
 * Discover all Viator product codes for a supplier in a destination via freetext search.
 * CRM only stores tours that were viewed on-site — this fills the gap.
 */

export function normalizeOperatorKey(name) {
  if (!name) return '';
  return name
    .trim()
    .replace(/_/g, ' ')
    .replace(/\s+/g, ' ')
    .replace(/[–—]/g, '-')
    .toLowerCase();
}

/** True when Viator supplier name matches our CRM / canonical operator name. */
export function supplierMatchesOperator(supplierName, operatorName) {
  const a = normalizeOperatorKey(supplierName);
  const b = normalizeOperatorKey(operatorName);
  if (!a || !b) return false;
  if (a === b) return true;
  const shorter = a.length <= b.length ? a : b;
  const longer = a.length <= b.length ? b : a;
  if (shorter.length >= 10 && longer.includes(shorter)) return true;
  const aLead = a.split(' ').slice(0, 3).join(' ');
  const bLead = b.split(' ').slice(0, 3).join(' ');
  return aLead === bLead;
}

/** Search terms to try (full legal names often return 0 results). */
export function buildOperatorSearchTerms(operatorName) {
  const cleaned = (operatorName || '').replace(/&/g, ' ').replace(/\s+/g, ' ').trim();
  const words = cleaned.split(' ').filter(Boolean);
  const terms = new Set();
  if (words.length >= 2) terms.add(words.slice(0, 2).join(' '));
  if (words.length >= 3) terms.add(words.slice(0, 3).join(' '));
  if (words.length >= 4) terms.add(words.slice(0, 4).join(' '));
  return [...terms].filter((t) => t.length >= 4);
}

const VIATOR_HEADERS = {
  Accept: 'application/json;version=2.0',
  'Accept-Language': 'en-US',
  'Content-Type': 'application/json',
};

async function fetchProductSupplierName(productCode, apiKey) {
  const res = await fetch(
    `https://api.viator.com/partner/products/${productCode}?currency=USD`,
    {
      headers: { 'exp-api-key': apiKey, ...VIATOR_HEADERS },
    }
  );
  if (!res.ok) return null;
  const tour = await res.json();
  return tour?.supplier?.name || null;
}

async function productMatchesOperator(product, operatorName, apiKey) {
  const inlineSupplier = product.supplier?.name;
  if (inlineSupplier && supplierMatchesOperator(inlineSupplier, operatorName)) {
    return true;
  }
  const code = product.productCode || product.productId;
  if (!code) return false;
  const supplier = await fetchProductSupplierName(code, apiKey);
  return supplierMatchesOperator(supplier, operatorName);
}

/**
 * @param {string} operatorName
 * @param {string} viatorDestinationId
 * @param {string} [apiKey]
 * @returns {Promise<string[]>}
 */
export async function discoverOperatorProductCodes(operatorName, viatorDestinationId, apiKey) {
  const key = apiKey || process.env.VIATOR_API_KEY;
  if (!key || !operatorName || !viatorDestinationId) return [];

  const found = new Set();
  for (const searchTerm of buildOperatorSearchTerms(operatorName)) {
    try {
      const response = await fetch('https://api.viator.com/partner/search/freetext', {
        method: 'POST',
        headers: { 'exp-api-key': key, ...VIATOR_HEADERS },
        body: JSON.stringify({
          searchTerm,
          productFiltering: { destination: String(viatorDestinationId) },
          productSorting: { sort: 'DEFAULT' },
          searchTypes: [{ searchType: 'PRODUCTS', pagination: { start: 1, count: 50 } }],
          currency: 'USD',
        }),
        next: { revalidate: 86400 },
      });
      if (!response.ok) continue;
      const data = await response.json();
      const results = data?.products?.results || [];
      for (const product of results) {
        const code = product.productCode || product.productId;
        if (!code || found.has(String(code))) continue;
        if (await productMatchesOperator(product, operatorName, key)) {
          found.add(String(code));
        }
      }
      if (found.size > 0) break;
    } catch {
      /* try next term */
    }
  }
  return [...found];
}
