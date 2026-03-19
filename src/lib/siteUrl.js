/**
 * Single source for public site origin + absolute URLs.
 * Use NEXT_PUBLIC_BASE_URL on staging/preview; defaults to production.
 */

const DEFAULT_ORIGIN = 'https://toptours.ai';

export function getSiteOrigin() {
  const raw = process.env.NEXT_PUBLIC_BASE_URL || DEFAULT_ORIGIN;
  const trimmed = String(raw).trim().replace(/\/$/, '');
  const https = trimmed.replace(/^http:\/\//i, 'https://');
  return https || DEFAULT_ORIGIN;
}

/**
 * @param {string} pathname - Must start with / (e.g. /about, /destinations/paris)
 */
export function absoluteUrl(pathname) {
  const origin = getSiteOrigin();
  if (!pathname || pathname === '/') return origin;
  const path = pathname.startsWith('/') ? pathname : `/${pathname}`;
  return `${origin}${path}`;
}
