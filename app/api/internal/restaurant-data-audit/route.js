import { NextResponse } from 'next/server';
import { createSupabaseServiceRoleClient } from '@/lib/supabaseClient';
import { destinations } from '@/data/destinationsData';

function normalizeText(value = '') {
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

function safeParse(value) {
  if (!value) return null;
  if (typeof value === 'object') return value;
  if (typeof value !== 'string') return null;
  try {
    return JSON.parse(value);
  } catch {
    return null;
  }
}

function extractCountry(row) {
  const iso = normalizeText(row.country_iso_code || '');
  let isoCountryName = '';
  try {
    const isoRaw = String(row.country_iso_code || '').trim().toUpperCase();
    if (/^[A-Z]{2}$/.test(isoRaw) && typeof Intl !== 'undefined' && Intl.DisplayNames) {
      const dn = new Intl.DisplayNames(['en'], { type: 'region' });
      isoCountryName = normalizeText(dn.of(isoRaw) || '');
    }
  } catch {
    // Ignore conversion failures.
  }
  const components = safeParse(row.address_components);
  if (Array.isArray(components)) {
    const countryComp = components.find(
      (item) => Array.isArray(item?.types) && item.types.includes('country'),
    );
    const longName = normalizeText(countryComp?.long_name || '');
    const shortName = normalizeText(countryComp?.short_name || '');
    return longName || isoCountryName || shortName || iso || '';
  }
  return isoCountryName || iso || '';
}

export async function GET() {
  try {
    const supabase = createSupabaseServiceRoleClient();
    const countryByDestination = new Map(
      (destinations || []).map((d) => [d.id, canonicalCountry(d.country || '')]),
    );

    const allRows = [];
    const pageSize = 1000;
    let from = 0;
    let hasMore = true;

    while (hasMore) {
      const { data, error } = await supabase
        .from('restaurants')
        .select('id, destination_id, slug, name, country_iso_code, address_components, formatted_address')
        .eq('is_active', true)
        .range(from, from + pageSize - 1);

      if (error) {
        return NextResponse.json(
          { error: 'Failed to fetch restaurants', details: error.message },
          { status: 500 },
        );
      }

      if (Array.isArray(data) && data.length > 0) {
        allRows.push(...data);
      }

      hasMore = Array.isArray(data) && data.length === pageSize;
      from += pageSize;
    }

    const mismatches = [];
    for (const row of allRows) {
      const destinationCountry = countryByDestination.get(row.destination_id);
      if (!destinationCountry) continue;
      const restaurantCountry = canonicalCountry(extractCountry(row));
      if (!restaurantCountry) continue;

      const matches =
        restaurantCountry === destinationCountry ||
        restaurantCountry.includes(destinationCountry) ||
        destinationCountry.includes(restaurantCountry);

      if (!matches) {
        mismatches.push({
          id: row.id,
          destination_id: row.destination_id,
          slug: row.slug,
          name: row.name,
          destination_country: destinationCountry,
          detected_country: restaurantCountry,
          formatted_address: row.formatted_address || null,
        });
      }
    }

    const countByDestination = mismatches.reduce((acc, item) => {
      acc[item.destination_id] = (acc[item.destination_id] || 0) + 1;
      return acc;
    }, {});

    const topAffectedDestinations = Object.entries(countByDestination)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 25)
      .map(([destination_id, count]) => ({ destination_id, count }));

    return NextResponse.json({
      total_active_rows: allRows.length,
      mismatch_count: mismatches.length,
      mismatch_ratio: allRows.length ? Number((mismatches.length / allRows.length).toFixed(4)) : 0,
      top_affected_destinations: topAffectedDestinations,
      examples: mismatches.slice(0, 100),
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Unexpected audit error', details: error?.message || String(error) },
      { status: 500 },
    );
  }
}
