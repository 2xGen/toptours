/** Shared helpers for /go (Viator) and /fb (BabyQuip) affiliate interstitial routes. */

export const BABY_DESTINATION_PREFIX = /^baby-equipment-rental-in-(.+)$/i;

/**
 * Next.js 15 may pass `params` as a Promise. `path` is usually string[]; also parse from request URL.
 * @param {'go' | 'fb'} base - first path segment after origin
 */
export async function resolveCatchAllPath(request, params, base) {
  let resolved = params;
  if (params && typeof params.then === 'function') {
    resolved = await params;
  }

  const raw = resolved?.path;
  if (Array.isArray(raw) && raw.length > 0) {
    return raw.map(String);
  }
  if (typeof raw === 'string' && raw.length > 0) {
    return raw.split('/').filter(Boolean);
  }

  try {
    const u = new URL(request.url);
    const m = u.pathname.match(new RegExp(`^/${base}/(.+)$`, 'i'));
    if (m) {
      return m[1]
        .split('/')
        .filter(Boolean)
        .map((seg) => String(seg));
    }
  } catch {
    // ignore
  }

  return [];
}

/** `baby-equipment-rental-in-aruba` or `baby-equipment-rental-in/aruba`. */
export function resolveBabyDestinationSlug(pathParts) {
  if (!pathParts?.length) return null;
  const first = pathParts[0] || '';
  const hyphenForm = BABY_DESTINATION_PREFIX.exec(first);
  if (hyphenForm) return hyphenForm[1].trim();

  if (
    pathParts.length >= 2 &&
    String(pathParts[0]).toLowerCase() === 'baby-equipment-rental-in'
  ) {
    return pathParts.slice(1).join('/').trim();
  }

  return null;
}

export function safeDecodeURIComponent(value) {
  try {
    return decodeURIComponent(value);
  } catch {
    return value;
  }
}

export function escapeHtml(unsafe) {
  return String(unsafe)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}

export function titleCaseWords(text) {
  return String(text)
    .trim()
    .split(/\s+/g)
    .filter(Boolean)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
    .join(' ');
}
