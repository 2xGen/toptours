/**
 * IndexNow client — notifies Bing, Yandex, and other participating engines of URL updates.
 * @see https://www.indexnow.org/documentation
 */

export const INDEXNOW_ENDPOINT = 'https://api.indexnow.org/IndexNow';
export const MAX_URLS_PER_BATCH = 10000;

/** @param {string | undefined | null} key */
export function isValidIndexNowKey(key) {
  return typeof key === 'string' && /^[a-zA-Z0-9-]{8,128}$/.test(key.trim());
}

export function getIndexNowKeyFromEnv() {
  return String(process.env.INDEXNOW_KEY || '').trim();
}

/** @param {string} origin e.g. https://toptours.ai */
export function getIndexNowHost(origin) {
  try {
    return new URL(origin).hostname.replace(/^www\./i, '');
  } catch {
    return 'toptours.ai';
  }
}

/**
 * @param {string} origin
 * @param {string} key
 */
export function getIndexNowKeyLocation(origin, key) {
  const base = String(origin || '').replace(/\/$/, '');
  return `${base}/${key}.txt`;
}

/**
 * @param {string[]} urls
 */
export function dedupeAbsoluteUrls(urls) {
  const seen = new Set();
  const result = [];
  for (const raw of urls || []) {
    const url = String(raw || '').trim();
    if (!url || !/^https?:\/\//i.test(url) || seen.has(url)) continue;
    seen.add(url);
    result.push(url);
  }
  return result;
}

/**
 * @param {string[]} urls
 * @param {number} batchSize
 */
export function chunkUrls(urls, batchSize = MAX_URLS_PER_BATCH) {
  const chunks = [];
  for (let i = 0; i < urls.length; i += batchSize) {
    chunks.push(urls.slice(i, i + batchSize));
  }
  return chunks;
}

/**
 * @param {{ urls: string[], origin: string, key: string, fetchImpl?: typeof fetch }} options
 */
export async function submitUrlsToIndexNow({ urls, origin, key, fetchImpl = fetch }) {
  const trimmedKey = String(key || '').trim();
  if (!isValidIndexNowKey(trimmedKey)) {
    throw new Error('Invalid INDEXNOW_KEY (must be 8–128 chars: a-z, A-Z, 0-9, hyphen)');
  }

  const baseOrigin = String(origin || '').replace(/\/$/, '');
  if (!baseOrigin) {
    throw new Error('Missing site origin for IndexNow submit');
  }

  const uniqueUrls = dedupeAbsoluteUrls(urls);
  if (uniqueUrls.length === 0) {
    return { submitted: 0, batches: 0, responses: [] };
  }

  const host = getIndexNowHost(baseOrigin);
  const keyLocation = getIndexNowKeyLocation(baseOrigin, trimmedKey);
  const batches = chunkUrls(uniqueUrls);
  const responses = [];

  for (const urlList of batches) {
    const response = await fetchImpl(INDEXNOW_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json; charset=utf-8',
      },
      body: JSON.stringify({
        host,
        key: trimmedKey,
        keyLocation,
        urlList,
      }),
    });

    responses.push({
      status: response.status,
      count: urlList.length,
      ok: response.status >= 200 && response.status < 300,
    });

    if (!response.ok && response.status !== 202) {
      const body = await response.text().catch(() => '');
      throw new Error(`IndexNow submit failed (${response.status}): ${body || response.statusText}`);
    }
  }

  return {
    submitted: uniqueUrls.length,
    batches: batches.length,
    responses,
  };
}

/**
 * Priority URLs for Bing discovery: hubs, guides, operators, and key editorial pages.
 * @param {string} url
 */
export function isPriorityIndexNowUrl(url) {
  let pathname = '';
  try {
    pathname = new URL(url).pathname;
  } catch {
    return false;
  }

  if (pathname === '/' || pathname === '/destinations' || pathname === '/travel-insurance') {
    return true;
  }
  if (/^\/travel-guides(\/|$)/.test(pathname)) return true;
  if (/^\/destinations\/[^/]+\/operators(\/|$)/.test(pathname)) return true;
  if (/^\/destinations\/[^/]+\/guides\//.test(pathname)) return true;
  if (/^\/destinations\/[^/]+$/.test(pathname)) return true;
  return false;
}

/**
 * @param {{ url: string }[]} entries
 * @param {'priority' | 'all'} mode
 */
export function filterSitemapEntriesForIndexNow(entries, mode = 'priority') {
  const list = Array.isArray(entries) ? entries : [];
  if (mode === 'all') {
    return list.map((entry) => entry?.url).filter(Boolean);
  }
  return list.filter((entry) => entry?.url && isPriorityIndexNowUrl(entry.url)).map((entry) => entry.url);
}

/** Skip IndexNow on preview/staging unless INDEXNOW_SUBMIT=true. */
export function shouldSubmitIndexNowAtBuild() {
  if (process.env.INDEXNOW_SUBMIT === 'false') return false;
  if (process.env.INDEXNOW_SUBMIT === 'true') return true;

  const vercelEnv = String(process.env.VERCEL_ENV || '').toLowerCase();
  if (vercelEnv === 'preview' || vercelEnv === 'development') return false;
  if (vercelEnv === 'production') return true;

  const origin = String(process.env.NEXT_PUBLIC_BASE_URL || 'https://toptours.ai').replace(/\/$/, '');
  try {
    const host = new URL(origin).hostname.toLowerCase();
    return host === 'toptours.ai' || host === 'www.toptours.ai';
  } catch {
    return false;
  }
}
