import { NextResponse } from 'next/server';
import { BABYQUIP_AFFILIATE_URL, BABY_EQUIPMENT_OG_IMAGE_URL } from '@/lib/babyquipAffiliate';
import { safeDecodeURIComponent, escapeHtml, titleCaseWords } from '@/lib/affiliateRedirectUtils';

const SOCIAL_BOT_UA_REGEX =
  /(facebookexternalhit|facebot|twitterbot|linkedinbot|slackbot|whatsapp|telegrambot|discordbot|skypeuripreview|googlebot)/i;

const BABY_SEGMENT_PREFIX = /^baby-equipment-rental-in-(.+)$/i;

export const dynamic = 'force-dynamic';

async function resolveSegmentParam(request, params) {
  const resolved = params && typeof params.then === 'function' ? await params : params;
  let segment = safeDecodeURIComponent(String(resolved?.segment ?? ''));
  if (segment) return segment;
  try {
    const u = new URL(request.url);
    const m = u.pathname.match(/^\/fb\/([^/]+)$/i);
    if (m) return safeDecodeURIComponent(m[1]);
  } catch {
    // ignore
  }
  return '';
}

export async function GET(request, { params }) {
  const rawSegment = await resolveSegmentParam(request, params);
  const match = BABY_SEGMENT_PREFIX.exec(rawSegment.trim());
  if (!match) {
    return new NextResponse(
      '<!DOCTYPE html><html><head><meta charset="utf-8"><title>Not found</title></head><body><p>Invalid baby gear link.</p></body></html>',
      {
        status: 404,
        headers: {
          'Content-Type': 'text/html; charset=utf-8',
          'X-Robots-Tag': 'noindex',
          'Cache-Control': 'no-store, max-age=0',
        },
      }
    );
  }

  const babySlug = match[1].trim().toLowerCase();

  const userAgent = request.headers.get('user-agent') || '';
  const isSocialPreviewBot = SOCIAL_BOT_UA_REGEX.test(userAgent);

  const origin = (() => {
    try {
      const u = new URL(request.url);
      return u.origin;
    } catch {
      return 'https://toptours.ai';
    }
  })();

  const destName = titleCaseWords(babySlug.replace(/[-_]+/g, ' '));
  const destinationUrl = BABYQUIP_AFFILIATE_URL;
  const previewTitle = `Baby Equipment Rentals in ${destName}`;
  const ogDescription = `Rent strollers, car seats, cribs, and more in ${destName}. Delivered to your hotel or vacation rental.`;
  const ogImageUrl = BABY_EQUIPMENT_OG_IMAGE_URL;
  const pageUrl = `${origin}/fb/${rawSegment.trim()}`;

  const loadingHeadline = 'Just a second while we open BabyQuip…';
  const loadingSubHtml = isSocialPreviewBot
    ? 'Preparing preview for social platforms.'
    : 'Sending you to BabyQuip with our partner link in <span class="countdown" id="countdown">1</span> second<span id="plural"> </span>.';
  const loadingStatusInitial = isSocialPreviewBot ? 'Preparing social preview.' : 'Getting your baby gear link ready…';
  const progressLabel = 'Connecting to BabyQuip';
  const statusSteps = [
    'Getting your baby gear link ready…',
    'Opening clean, safe rentals…',
    'Sending you there now…',
  ];

  const htmlTitle = escapeHtml(previewTitle);
  const htmlOgDescription = escapeHtml(ogDescription);
  const escapedDestinationUrl = escapeHtml(destinationUrl);
  const escapedOgImage = escapeHtml(ogImageUrl);

  const redirectHeadMarkup = isSocialPreviewBot
    ? ''
    : `<!-- Redirect -->
    <meta http-equiv="refresh" content="1; url=${escapedDestinationUrl}" />`;

  const statusStepsJson = JSON.stringify(statusSteps);

  const redirectScriptMarkup = isSocialPreviewBot
    ? ''
    : `<script>
      (function () {
        var destinationUrl = ${JSON.stringify(destinationUrl)};
        var countdownEl = document.getElementById('countdown');
        var etaEl = document.getElementById('eta');
        var statusEl = document.getElementById('statusText');
        var fallbackEl = document.getElementById('fallback');
        var statusSteps = ${statusStepsJson};

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

          if (statusEl) {
            var progress = 1 - remainingMs / durationMs;
            var idx = Math.min(statusSteps.length - 1, Math.floor(progress * statusSteps.length));
            statusEl.textContent = statusSteps[idx];
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

    <meta property="og:type" content="website" />
    <meta property="og:title" content="${htmlTitle}" />
    <meta property="og:description" content="${htmlOgDescription}" />
    <meta property="og:image" content="${escapedOgImage}" />
    <meta property="og:url" content="${escapeHtml(pageUrl)}" />

    <meta property="twitter:card" content="summary_large_image" />
    <meta property="twitter:title" content="${htmlTitle}" />
    <meta property="twitter:description" content="${htmlOgDescription}" />
    <meta property="twitter:image" content="${escapedOgImage}" />

    ${redirectHeadMarkup}
    <title>${htmlTitle} | TopTours.ai</title>

    <style>
      :root {
        --brand: #00AA6C;
        --brand2: #2f80ed;
        --text: #0f172a;
        --muted: #475569;
      }
      * { box-sizing: border-box; }
      body {
        margin: 0;
        min-height: 100vh;
        font-family: ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial, "Apple Color Emoji","Segoe UI Emoji";
        color: var(--text);
        background: radial-gradient(900px 360px at 95% -20%, rgba(47,128,237,.13), transparent 55%),
                    radial-gradient(900px 420px at -10% 120%, rgba(0,170,108,.10), transparent 60%),
                    linear-gradient(180deg, #f8fafc 0%, #f1f5f9 100%);
        position: relative;
        overflow: hidden;
        display: grid;
        place-items: center;
        padding: 24px;
      }
      .card {
        width: min(700px, 100%);
        border-radius: 20px;
        background: rgba(255,255,255,.92);
        border: 1px solid rgba(148,163,184,.25);
        box-shadow: 0 18px 45px rgba(15,23,42,.08);
        padding: 26px 22px;
        text-align: center;
        backdrop-filter: blur(6px);
        position: relative;
        z-index: 1;
      }
      .brandmark {
        display: inline-flex;
        align-items: center;
        gap: 10px;
        padding: 8px 16px;
        border-radius: 999px;
        background: rgba(47,128,237,.08);
        border: 1px solid rgba(47,128,237,.18);
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
        font-size: 24px;
        line-height: 1.25;
        margin: 0 0 10px;
        letter-spacing: -0.01em;
      }
      .sub {
        margin: 0 0 16px;
        color: var(--muted);
        font-size: 14px;
      }
      .status {
        margin: 0 0 14px;
        color: #0f172a;
        font-weight: 600;
        font-size: 14px;
        min-height: 20px;
      }
      .row {
        display: flex;
        gap: 14px;
        align-items: center;
        justify-content: center;
        flex-wrap: wrap;
      }
      .spinner {
        width: 34px;
        height: 34px;
        border-radius: 50%;
        border: 3px solid rgba(15,23,42,.12);
        border-top-color: var(--brand2);
        border-right-color: var(--brand);
        animation: spin .85s linear infinite;
      }
      @keyframes spin { to { transform: rotate(360deg); } }
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
        height: 8px;
        border-radius: 999px;
        background: rgba(148,163,184,.20);
        overflow: hidden;
        border: 1px solid rgba(148,163,184,.25);
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
        margin-top: 14px;
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
        color: #0f172a;
      }
      @media (prefers-reduced-motion: reduce) {
        .spinner { animation: none; }
        .bar > div { animation: none; transform: scaleX(1); }
      }
    </style>
  </head>
  <body>
    <main class="card">
      <div class="brandmark" aria-hidden="true">
        <span class="brandDot" aria-hidden="true"></span>
        <span style="font-weight: 800; letter-spacing: .2px;">TopTours.ai</span>
      </div>
      <h1>${escapeHtml(loadingHeadline)}</h1>
      <p class="sub">
        ${loadingSubHtml}
      </p>
      <p class="status" id="statusText">${escapeHtml(loadingStatusInitial)}</p>
      <div class="row">
        <div class="spinner" aria-hidden="true"></div>
        <div class="progressWrap">
          <div class="progressMeta">
            <span>${escapeHtml(progressLabel)}</span>
            <span id="eta">${isSocialPreviewBot ? 'Preview mode' : 'Almost there'}</span>
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
