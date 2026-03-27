import { NextResponse } from 'next/server';

const OG_IMAGE_URL =
  'https://ouqeoizufbofdqbuiwvx.supabase.co/storage/v1/object/public/Aruba/og%20fb%20go.jpg';
const TRACKING_QUERY = 'pid=P00276441&mcid=42383&medium=link';
const VIATOR_BASE = 'https://www.viator.com/';
const SOCIAL_BOT_UA_REGEX =
  /(facebookexternalhit|facebot|twitterbot|linkedinbot|slackbot|whatsapp|telegrambot|discordbot|skypeuripreview|googlebot)/i;

function safeDecodeURIComponent(value) {
  try {
    return decodeURIComponent(value);
  } catch {
    return value;
  }
}

function escapeHtml(unsafe) {
  return String(unsafe)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}

function titleCaseWords(text) {
  return String(text)
    .trim()
    .split(/\s+/g)
    .filter(Boolean)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
    .join(' ');
}

function extractTitleFromPathParts(pathParts) {
  if (!pathParts?.length) return 'TopTours';

  // Heuristic: use the segment right before the product id-ish segment.
  // Example: tours/Aruba/Catamaran-Dolphin-snorkeling/d28-119085P1 -> Catamaran-Dolphin-snorkeling
  const slugSource =
    pathParts.length >= 2 ? pathParts[pathParts.length - 2] : pathParts[pathParts.length - 1];

  const decoded = safeDecodeURIComponent(slugSource);
  const normalized = decoded.replace(/[-_]+/g, ' ');
  return titleCaseWords(normalized);
}

export const dynamic = 'force-dynamic';

export async function GET(request, { params }) {
  const pathParts = Array.isArray(params?.path) ? params.path : [];
  const userAgent = request.headers.get('user-agent') || '';
  const isSocialPreviewBot = SOCIAL_BOT_UA_REGEX.test(userAgent);

  const decodedParts = pathParts.map((p) => safeDecodeURIComponent(p));
  const viatorPath = decodedParts.join('/');
  const destinationBaseUrl = `${VIATOR_BASE}${viatorPath}`;

  const queryJoiner = destinationBaseUrl.includes('?') ? '&' : '?';
  const destinationUrl = `${destinationBaseUrl}${queryJoiner}${TRACKING_QUERY}`;

  const title = extractTitleFromPathParts(decodedParts);

  const origin = (() => {
    try {
      const u = new URL(request.url);
      return u.origin;
    } catch {
      return 'https://toptours.ai';
    }
  })();

  const pageUrl = `${origin}/go/${decodedParts.join('/')}`;

  const htmlTitle = escapeHtml(title);
  const escapedDestinationUrl = escapeHtml(destinationUrl);
  const redirectHeadMarkup = isSocialPreviewBot
    ? ''
    : `<!-- Redirect -->
    <meta http-equiv="refresh" content="1; url=${escapedDestinationUrl}" />`;

  const redirectScriptMarkup = isSocialPreviewBot
    ? ''
    : `<script>
      (function () {
        var destinationUrl = ${JSON.stringify(destinationUrl)};
        var countdownEl = document.getElementById('countdown');
        var etaEl = document.getElementById('eta');
        var fallbackEl = document.getElementById('fallback');

        var durationMs = 1000;
        var start = Date.now();
        var deadline = start + durationMs;

        function tick() {
          var now = Date.now();
          var remainingMs = Math.max(0, deadline - now);
          var remainingSec = Math.ceil(remainingMs / 1000);
          if (countdownEl) countdownEl.textContent = String(remainingSec);

          if (etaEl) {
            var eta = remainingMs <= 0 ? 0 : remainingMs;
            etaEl.textContent = 'ETA ~' + (eta <= 0 ? 0 : Math.ceil(eta / 1000)) + 's';
          }

          if (remainingMs <= 0) return;
          requestAnimationFrame(tick);
        }

        tick();

        setTimeout(function () {
          try {
            window.location.replace(destinationUrl);
          } catch (e) {
            if (fallbackEl) fallbackEl.style.display = 'inline';
          }
        }, durationMs);
      })();
    </script>`;

  const html = `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <meta name="robots" content="noindex,nofollow" />

    <!-- Social preview -->
    <meta property="og:type" content="website" />
    <meta property="og:title" content="${htmlTitle}" />
    <meta property="og:description" content="Taking you to the best price..." />
    <meta property="og:image" content="${OG_IMAGE_URL}" />
    <meta property="og:url" content="${escapeHtml(pageUrl)}" />

    <meta property="twitter:card" content="summary_large_image" />
    <meta property="twitter:title" content="${htmlTitle}" />
    <meta property="twitter:description" content="Taking you to the best price..." />
    <meta property="twitter:image" content="${OG_IMAGE_URL}" />

    ${redirectHeadMarkup}
    <title>${htmlTitle} | TopTours.ai</title>

    <style>
      :root {
        --brand: #00AA6C;
        --brand2: #667eea;
        --text: #ffffff;
        --muted: rgba(255,255,255,.75);
        --glass: rgba(15,23,42,.22);
      }
      * { box-sizing: border-box; }
      body {
        margin: 0;
        min-height: 100vh;
        font-family: ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial, "Apple Color Emoji","Segoe UI Emoji";
        color: var(--text);
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        position: relative;
        overflow: hidden;
        display: grid;
        place-items: center;
        padding: 24px;
      }
      /* Decorative animated blobs (hero-like background) */
      .bgblob {
        position: absolute;
        border-radius: 999px;
        filter: blur(40px);
        opacity: .35;
        transform: translateZ(0);
        animation: floaty 10s ease-in-out infinite;
        pointer-events: none;
      }
      .bgblob.b1 { width: 340px; height: 340px; left: -80px; top: -90px; background: rgba(124,58,237,.9); }
      .bgblob.b2 { width: 420px; height: 420px; right: -170px; top: -60px; background: rgba(37,99,235,.9); animation-duration: 13s; }
      .bgblob.b3 { width: 380px; height: 380px; left: 10%; bottom: -210px; background: rgba(0,170,108,.55); animation-duration: 16s; }
      @keyframes floaty {
        0%,100% { transform: translate3d(0,0,0) scale(1); }
        50% { transform: translate3d(0,-18px,0) scale(1.06); }
      }
      .overlay {
        position: absolute;
        inset: 0;
        background: rgba(0,0,0,.28);
        pointer-events: none;
      }
      .card {
        width: min(720px, 100%);
        border-radius: 22px;
        background: rgba(255,255,255,.10);
        border: 1px solid rgba(255,255,255,.18);
        box-shadow: 0 22px 55px rgba(2,6,23,.22);
        padding: 28px 22px;
        text-align: center;
        backdrop-filter: blur(12px);
        position: relative;
        z-index: 1;
      }
      .brandmark {
        display: inline-flex;
        align-items: center;
        gap: 10px;
        padding: 8px 16px;
        border-radius: 999px;
        background: rgba(255,255,255,.12);
        border: 1px solid rgba(255,255,255,.20);
        margin-bottom: 16px;
      }
      .brandDot {
        width: 10px;
        height: 10px;
        border-radius: 50%;
        background: linear-gradient(135deg, var(--brand2), var(--brand));
        box-shadow: 0 0 0 6px rgba(0,170,108,.10);
      }
      h1 {
        font-size: 22px;
        line-height: 1.25;
        margin: 0 0 10px;
        letter-spacing: -0.01em;
      }
      .sub {
        margin: 0 0 16px;
        color: var(--muted);
        font-size: 14px;
      }
      .row {
        display: flex;
        gap: 14px;
        align-items: center;
        justify-content: center;
        flex-wrap: wrap;
      }
      .spinner {
        width: 44px;
        height: 44px;
        border-radius: 50%;
        border: 3px solid rgba(255,255,255,.22);
        border-top-color: rgba(255,255,255,.95);
        border-right-color: rgba(0,170,108,.75);
        animation: spin 1s linear infinite;
      }
      .progressWrap {
        min-width: 220px;
        flex: 1;
      }
      .progressMeta {
        display: flex;
        justify-content: space-between;
        font-size: 12px;
        color: var(--muted);
        margin-bottom: 8px;
      }
      .bar {
        height: 10px;
        border-radius: 999px;
        background: rgba(255,255,255,.15);
        overflow: hidden;
        border: 1px solid rgba(255,255,255,.18);
      }
      .bar > div {
        height: 100%;
        width: 100%;
        transform-origin: left;
        background: linear-gradient(90deg, var(--brand), var(--brand2));
        transform: scaleX(0);
        animation: fill 1s ease-out forwards;
      }
      @keyframes fill {
        to { transform: scaleX(1); }
      }
      .cta {
        margin-top: 18px;
        font-size: 13px;
        color: var(--muted);
      }
      .cta a {
        color: var(--brand);
        text-decoration: none;
        font-weight: 600;
      }
      .cta a:hover { text-decoration: underline; }
      .countdown {
        font-variant-numeric: tabular-nums;
        font-weight: 700;
        color: #ffffff;
      }
      @media (prefers-reduced-motion: reduce) {
        .spinner { animation: none; }
        .bar > div { animation: none; transform: scaleX(1); }
      }
    </style>
  </head>
  <body>
    <div class="bgblob b1" aria-hidden="true"></div>
    <div class="bgblob b2" aria-hidden="true"></div>
    <div class="bgblob b3" aria-hidden="true"></div>
    <div class="overlay" aria-hidden="true"></div>
    <main class="card">
      <div class="brandmark" aria-hidden="true">
        <span class="brandDot" aria-hidden="true"></span>
        <span style="font-weight: 800; letter-spacing: .2px;">TopTours.ai</span>
      </div>
      <h1>Taking you to the best price...</h1>
      <p class="sub">
        ${isSocialPreviewBot
          ? 'Preparing rich preview details for social platforms.'
          : 'Finding your tour and calculating the best price in <span class="countdown" id="countdown">1</span> second<span id="plural"> </span>.'}
      </p>
      <div class="row">
        <div class="spinner" aria-hidden="true"></div>
        <div class="progressWrap">
          <div class="progressMeta">
            <span>Finding best price</span>
            <span id="eta">${isSocialPreviewBot ? 'Crawler mode' : 'ETA ~1s'}</span>
          </div>
          <div class="bar"><div></div></div>
        </div>
      </div>

      <div class="cta">
        <noscript>
          <p><a href="${escapedDestinationUrl}" rel="noopener noreferrer">Continue</a></p>
        </noscript>
        <span id="fallback" style="display:none;">
          <a href="${escapedDestinationUrl}" rel="noopener noreferrer">Continue</a>
        </span>
      </div>
    </main>

    ${redirectScriptMarkup}
  </body>
</html>`;

  return new NextResponse(html, {
    status: 200,
    headers: {
      'Content-Type': 'text/html; charset=utf-8',
      'X-Robots-Tag': 'noindex',
      'Cache-Control': 'no-store, max-age=0',
    },
  });
}

