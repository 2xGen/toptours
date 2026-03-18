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

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
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
