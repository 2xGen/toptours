/** Pure restaurant ↔ destination country matching (no Supabase imports — safe for build scripts). */

function normalizeText(value) {
  return String(value || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9\s-]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function canonicalCountry(value) {
  const v = normalizeText(value);
  const aliases = {
    us: 'united states',
    usa: 'united states',
    'united states of america': 'united states',
    gb: 'united kingdom',
    uk: 'united kingdom',
    britain: 'united kingdom',
    'great britain': 'united kingdom',
    'czech republic': 'czechia',
  };
  return aliases[v] || v;
}

function inferCountryFromAddress(row) {
  const address = normalizeText(
    row?.formatted_address ||
      row?.formattedAddress ||
      row?.contact?.address ||
      row?.address ||
      ''
  );
  if (!address) return '';

  if (address.includes(' usa') || address.includes(' united states')) return 'united states';
  if (address.includes(' uk') || address.includes(' united kingdom')) return 'united kingdom';

  const parts = address
    .split(',')
    .map((p) => canonicalCountry(p.trim()))
    .filter(Boolean);
  const tail = parts.slice(-2);
  for (const chunk of tail) {
    if (chunk.length >= 3 && chunk.length <= 40) return chunk;
  }

  return '';
}

function safeParseJsonObject(value) {
  if (!value) return null;
  if (typeof value === 'object') return value;
  if (typeof value !== 'string') return null;
  try {
    return JSON.parse(value);
  } catch {
    return null;
  }
}

function extractRestaurantCountrySignals(row) {
  const result = {
    longName: '',
    shortName: '',
    isoCode: '',
    isoCountryName: '',
  };

  result.isoCode = normalizeText(row?.country_iso_code || row?.countryIsoCode || '');
  try {
    const isoRaw = String(row?.country_iso_code || row?.countryIsoCode || '').trim().toUpperCase();
    if (/^[A-Z]{2}$/.test(isoRaw) && typeof Intl !== 'undefined' && Intl.DisplayNames) {
      const dn = new Intl.DisplayNames(['en'], { type: 'region' });
      result.isoCountryName = normalizeText(dn.of(isoRaw) || '');
    }
  } catch {
    // Ignore locale conversion failures.
  }

  const components = safeParseJsonObject(row?.address_components || row?.addressComponents);
  if (Array.isArray(components)) {
    const countryComp = components.find(
      (comp) => Array.isArray(comp?.types) && comp.types.includes('country')
    );
    if (countryComp) {
      result.longName = normalizeText(countryComp.long_name || '');
      result.shortName = normalizeText(countryComp.short_name || '');
    }
  }

  return result;
}

export function isRestaurantLikelyInDestination(row, destination) {
  if (!row || !destination) return true;
  const destinationCountry = canonicalCountry(destination.country || '');
  if (!destinationCountry) return true;

  const country = extractRestaurantCountrySignals(row);
  let observedCountry = canonicalCountry(
    country.longName || country.isoCountryName || country.shortName || country.isoCode
  );
  if (!observedCountry) {
    observedCountry = canonicalCountry(inferCountryFromAddress(row));
  }
  if (!observedCountry) return false;

  if (observedCountry === destinationCountry) return true;
  if (observedCountry.includes(destinationCountry) || destinationCountry.includes(observedCountry)) {
    return true;
  }

  return false;
}
