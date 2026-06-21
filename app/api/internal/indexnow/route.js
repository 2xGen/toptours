import { NextResponse } from 'next/server';
import {
  dedupeAbsoluteUrls,
  getIndexNowKeyFromEnv,
  isValidIndexNowKey,
  submitUrlsToIndexNow,
} from '../../../../lib/indexNow.js';
import { getSiteOrigin } from '@/lib/siteUrl';

function authorizeInternalRequest(request) {
  const internalApiKey = process.env.INTERNAL_API_KEY;
  if (!internalApiKey) return true;
  return request.headers.get('x-internal-api-key') === internalApiKey;
}

export async function POST(request) {
  if (!authorizeInternalRequest(request)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const key = getIndexNowKeyFromEnv();
  if (!key || !isValidIndexNowKey(key)) {
    return NextResponse.json({ error: 'INDEXNOW_KEY is not configured' }, { status: 503 });
  }

  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  const urls = dedupeAbsoluteUrls(Array.isArray(body?.urls) ? body.urls : []);
  if (urls.length === 0) {
    return NextResponse.json({ error: 'Provide a non-empty urls array' }, { status: 400 });
  }

  if (urls.length > 10000) {
    return NextResponse.json({ error: 'Maximum 10,000 URLs per request' }, { status: 400 });
  }

  try {
    const origin = getSiteOrigin();
    const result = await submitUrlsToIndexNow({ urls, origin, key });
    return NextResponse.json({
      ok: true,
      submitted: result.submitted,
      batches: result.batches,
      responses: result.responses,
    });
  } catch (err) {
    console.error('IndexNow API error:', err);
    return NextResponse.json({ error: err?.message || 'IndexNow submit failed' }, { status: 502 });
  }
}
