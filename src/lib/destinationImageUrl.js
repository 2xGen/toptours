/** Fix accidental double slashes in Supabase storage paths (e.g. destinations//paris.jpg). */
export function normalizeSupabasePublicUrl(url) {
  if (!url || typeof url !== 'string') return url;

  const marker = '/storage/v1/object/public/';
  const idx = url.indexOf(marker);
  if (idx === -1) return url;

  const base = url.slice(0, idx + marker.length);
  const rest = url.slice(idx + marker.length);
  const queryIdx = rest.indexOf('?');
  const path = queryIdx === -1 ? rest : rest.slice(0, queryIdx);
  const query = queryIdx === -1 ? '' : rest.slice(queryIdx);
  const normalizedPath = path.replace(/\/{2,}/g, '/');

  return `${base}${normalizedPath}${query}`;
}

/**
 * Smaller image URLs for listing cards (Supabase render API).
 * Visual layout stays the same; less bytes downloaded per thumbnail.
 */
export function getDestinationListingImageUrl(
  url,
  { width = 640, height = 384, quality = 75 } = {}
) {
  if (!url || typeof url !== 'string') return url;

  const normalized = normalizeSupabasePublicUrl(url);

  if (!normalized.includes('/storage/v1/object/public/')) {
    return normalized;
  }

  const renderUrl = normalized.replace(
    '/storage/v1/object/public/',
    '/storage/v1/render/image/public/'
  );
  const separator = renderUrl.includes('?') ? '&' : '?';
  return `${renderUrl}${separator}width=${width}&height=${height}&resize=cover&quality=${quality}`;
}

/** Compact row thumbnails (~64×48 display). */
export function getDestinationThumbImageUrl(url) {
  return getDestinationListingImageUrl(url, { width: 128, height: 96, quality: 70 });
}
