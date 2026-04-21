import { NextResponse } from 'next/server';

const ALLOWED_BOTS = [
  /googlebot/i,
  /googleother/i,
  /google-adsbot/i,
  /bingbot/i,
  /duckduckbot/i,
  /facebookexternalhit/i, // Social link previews
  /twitterbot/i, // Social link previews
  /linkedinbot/i, // Social link previews
];

const BLOCKED_BOTS = [
  /ahrefsbot/i,
  /semrushbot/i,
  /mj12bot/i,
  /dotbot/i,
  /petalbot/i,
  /bytespider/i,
  /ccbot/i,
  /megaindex/i,
  /seznambot/i,
  /claudebot/i,
  /gptbot/i,
  /chatgpt-user/i,
  /cohere-ai/i,
  /perplexitybot/i,
];

const LIKELY_AUTOMATION = [
  /bot|crawler|spider|scrapy/i,
  /python-requests|curl|wget|axios|httpclient|go-http-client/i,
  /headlesschrome|phantomjs|selenium|playwright|node-fetch/i,
];

const CRAWLER_SIGNATURES = /bot|crawler|spider|crawl|scrapy|slurp|archiver/i;

function botIsAllowed(userAgent) {
  return ALLOWED_BOTS.some((pattern) => pattern.test(userAgent));
}

function botIsBlocked(userAgent) {
  if (botIsAllowed(userAgent)) return false;
  return BLOCKED_BOTS.some((pattern) => pattern.test(userAgent));
}

function isLikelyAutomation(userAgent) {
  if (botIsAllowed(userAgent)) return false;
  if (!userAgent || !userAgent.trim()) return true;
  return LIKELY_AUTOMATION.some((pattern) => pattern.test(userAgent));
}

function isNonAllowlistedCrawler(userAgent) {
  if (botIsAllowed(userAgent)) return false;
  return CRAWLER_SIGNATURES.test(userAgent || '');
}

function isLikelyBotRequest(userAgent) {
  if (!userAgent || !userAgent.trim()) return true;
  if (botIsAllowed(userAgent)) return false;
  return (
    CRAWLER_SIGNATURES.test(userAgent) ||
    /amazonbot|meta-external|meta-webindexer|oai-searchbot|chatgpt-user|perplexity-user|seranking|ahrefs|semrush|petalbot|baiduspider|qwantbot|applebot|yandexbot/i.test(
      userAgent
    )
  );
}

function isSameOriginRequest(request) {
  const host = request.headers.get('host');
  const secFetchSite = request.headers.get('sec-fetch-site');
  if (secFetchSite === 'same-origin' || secFetchSite === 'same-site') return true;

  const origin = request.headers.get('origin');
  if (origin) {
    try {
      if (new URL(origin).host === host) return true;
    } catch {}
  }

  const referer = request.headers.get('referer');
  if (referer) {
    try {
      if (new URL(referer).host === host) return true;
    } catch {}
  }

  return false;
}

export function middleware(request) {
  const userAgent = request.headers.get('user-agent') || '';
  const pathname = request.nextUrl.pathname;
  const method = request.method;

  // Always allow robots/sitemaps so Google Search Console can reliably discover URLs.
  if (
    pathname === '/robots.txt' ||
    pathname === '/sitemap.xml' ||
    pathname.startsWith('/sitemap/') ||
    pathname.startsWith('/sitemap-tours/')
  ) {
    return NextResponse.next();
  }

  if (botIsBlocked(userAgent)) {
    return new NextResponse('Forbidden', { status: 403 });
  }

  // Aggressive crawl policy: allow only essential bots, block all other bot-like traffic.
  // This is the strongest lever to keep infra spend bounded on low-human-traffic sites.
  if (
    (method === 'GET' || method === 'HEAD') &&
    (isLikelyBotRequest(userAgent) || isNonAllowlistedCrawler(userAgent) || isLikelyAutomation(userAgent))
  ) {
    // Keep core machine-readable endpoints available.
    if (pathname === '/robots.txt' || pathname === '/sitemap.xml') {
      return NextResponse.next();
    }
    return new NextResponse('Forbidden', { status: 403 });
  }

  if (pathname === '/api/internal/viator-search') {
    if (request.method !== 'POST') {
      return NextResponse.json({ error: 'Method not allowed' }, { status: 405 });
    }

    const internalApiKey = process.env.INTERNAL_API_KEY;
    const requestInternalKey = request.headers.get('x-internal-api-key');
    const hasValidServerKey = Boolean(
      internalApiKey && requestInternalKey && requestInternalKey === internalApiKey
    );
    const sameOrigin = isSameOriginRequest(request);

    // Only enforce strict origin/server-key checks when INTERNAL_API_KEY is configured.
    // This keeps the route usable in environments that haven't added the key yet.
    if (internalApiKey && !hasValidServerKey && !sameOrigin) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/tours/:path*',
    '/destinations/:path*',
    '/api/internal/viator-search',
    '/robots.txt',
    '/sitemap.xml',
    '/sitemap/:path*',
    '/sitemap-tours/:path*',
  ],
};

