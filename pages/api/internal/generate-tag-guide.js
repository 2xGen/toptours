/**
 * POST /api/internal/generate-tag-guide
 * Generates tag guide content with Gemini and saves to tag_guide_content.
 * Called when user clicks "Generate guide with AI" on a placeholder tag guide page.
 * Body: { destinationId: string, tagSlug: string }
 */
import {
  getTagBySlug,
  getTagGuideContent,
  saveTagGuideContent,
  generateTagGuideContentWithGemini,
} from '@/lib/tagGuideContent';
import { getViatorDestinationBySlug } from '@/lib/supabaseCache';

function normalizeSlug(s) {
  if (!s) return '';
  return String(s)
    .toLowerCase()
    .trim()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

const WINDOW_MS = 60 * 1000;
const MAX_REQUESTS_PER_WINDOW = 6;
const ipWindowStore = new Map();

function getClientIp(req) {
  const forwardedFor = req.headers['x-forwarded-for'];
  if (typeof forwardedFor === 'string' && forwardedFor.length > 0) {
    return forwardedFor.split(',')[0].trim();
  }
  const realIp = req.headers['x-real-ip'];
  if (typeof realIp === 'string' && realIp.length > 0) return realIp.trim();
  return 'unknown';
}

function passRateLimit(ip) {
  const now = Date.now();
  const existing = ipWindowStore.get(ip);
  if (!existing || now - existing.startedAt > WINDOW_MS) {
    ipWindowStore.set(ip, { count: 1, startedAt: now });
    return true;
  }
  existing.count += 1;
  return existing.count <= MAX_REQUESTS_PER_WINDOW;
}

function isSameOriginRequest(req) {
  const host = req.headers.host;
  const origin = req.headers.origin;
  const referer = req.headers.referer;
  try {
    if (origin && new URL(origin).host === host) return true;
  } catch {}
  try {
    if (referer && new URL(referer).host === host) return true;
  } catch {}
  return false;
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const internalApiKey = process.env.INTERNAL_API_KEY;
    const providedInternalApiKey = req.headers['x-internal-api-key'];
    const hasValidInternalKey = Boolean(
      internalApiKey && providedInternalApiKey && providedInternalApiKey === internalApiKey
    );
    if (!hasValidInternalKey && !isSameOriginRequest(req)) {
      return res.status(403).json({ error: 'Forbidden' });
    }

    const ip = getClientIp(req);
    if (!hasValidInternalKey && !passRateLimit(ip)) {
      return res.status(429).json({ error: 'Too many requests' });
    }

    const { destinationId, tagSlug } = req.body || {};
    if (!destinationId || !tagSlug) {
      return res.status(400).json({ error: 'destinationId and tagSlug are required' });
    }

    const tag = await getTagBySlug(tagSlug);
    const derivedTagNameFromSlug = (slug) => {
      if (!slug) return 'Guide';
      return String(slug)
        .replace(/[_]/g, ' ')
        .split('-')
        .filter(Boolean)
        .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
        .join(' ');
    };

    // If viator_tag_traits doesn't know this slug, still allow generation based on the slug itself.
    // This prevents 404 UX when the UI links to a tag slug that doesn't exactly match Viator traits.
    const tagNameEn = tag?.tag_name_en || derivedTagNameFromSlug(tagSlug);

    const normalizedDestId = normalizeSlug(destinationId);
    const existing = await getTagGuideContent(normalizedDestId, tagSlug);
    if (existing) {
      return res.status(200).json({ success: true, alreadyCached: true });
    }

    const destInfo = await getViatorDestinationBySlug(destinationId);
    const destName = destInfo?.name || destinationId;

    const content = await generateTagGuideContentWithGemini(destName, tagNameEn);
    if (!content) {
      return res.status(500).json({ error: 'Failed to generate guide content' });
    }

    await saveTagGuideContent(normalizedDestId, tagSlug, tagNameEn, content);
    return res.status(200).json({ success: true });
  } catch (error) {
    console.error('[generate-tag-guide]', error?.message || error);
    return res.status(500).json({ error: error?.message || 'Internal server error' });
  }
}
