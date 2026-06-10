/** Fix accidental double slashes in Supabase storage paths (e.g. destinations//paris.jpg). */
export function normalizeSupabasePublicUrl(url) {
  if (!url || typeof url !== 'string') return url;

  // Never use /render/image/ — billed per unique origin image per billing period.
  let cleaned = url.replace('/storage/v1/render/image/public/', '/storage/v1/object/public/');

  const marker = '/storage/v1/object/public/';
  const idx = cleaned.indexOf(marker);
  if (idx === -1) return cleaned;

  const base = cleaned.slice(0, idx + marker.length);
  const rest = cleaned.slice(idx + marker.length);
  const queryIdx = rest.indexOf('?');
  const path = queryIdx === -1 ? rest : rest.slice(0, queryIdx);
  const normalizedPath = path.replace(/\/{2,}/g, '/');

  return `${base}${normalizedPath}`;
}

/**
 * Destination card image URL — direct Supabase public object (no on-the-fly transforms).
 * next.config.js uses images.unoptimized: true; avoids Storage Image Transformations billing.
 */
export function getDestinationListingImageUrl(url, _options = {}) {
  if (!url || typeof url !== 'string') return url;
  return normalizeSupabasePublicUrl(url);
}

/** Compact row thumbnails — same direct URL; sized via CSS/layout. */
export function getDestinationThumbImageUrl(url) {
  return getDestinationListingImageUrl(url);
}
