/**
 * Single source for public site origin + absolute URLs.
 * Use NEXT_PUBLIC_BASE_URL on staging/preview; defaults to production.
 */

const DEFAULT_ORIGIN = 'https://toptours.ai';

export function getSiteOrigin() {
  const raw = process.env.NEXT_PUBLIC_BASE_URL || DEFAULT_ORIGIN;
  const trimmed = String(raw || '').trim();
  if (!trimmed) return DEFAULT_ORIGIN;

  const withProtocol = /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;

  try {
    const parsed = new URL(withProtocol);
    parsed.protocol = 'https:';
    if (parsed.hostname.toLowerCase() === 'www.toptours.ai') {
      parsed.hostname = 'toptours.ai';
    }
    const origin = parsed.origin.replace(/\/$/, '');
    return origin || DEFAULT_ORIGIN;
  } catch {
    const https = withProtocol.replace(/^http:\/\//i, 'https://').replace(/\/$/, '');
    return https || DEFAULT_ORIGIN;
  }
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
