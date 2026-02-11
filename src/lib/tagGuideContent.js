/**
 * Tag guide content: on-demand generated guides for (destination + Viator tag).
 * Uses same template as category guides (CategoryGuideClient). Content generated on first load via Gemini, cached in tag_guide_content.
 */

import { createSupabaseServiceRoleClient } from '@/lib/supabaseClient';

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

/** Slug for tag guide URL from tag name (e.g. "Coffee & Tea Tours" → "coffee-tea-tours"). Use for links from tour detail only. */
export function getTagSlugFromName(tagName) {
  return normalizeSlug(tagName || '');
}

const tagBySlugCache = new Map();

/**
 * Resolve a URL slug to a tag from viator_tag_traits (tag_id, tag_name_en).
 * @param {string} slug - e.g. "coffee-and-tea-tours"
 * @returns {Promise<{ tag_id: number, tag_name_en: string } | null>}
 */
export async function getTagBySlug(slug) {
  const normalized = normalizeSlug(slug);
  if (!normalized) return null;
  if (tagBySlugCache.has(normalized)) return tagBySlugCache.get(normalized);

  try {
    const supabase = createSupabaseServiceRoleClient();
    const { data, error } = await supabase
      .from('viator_tag_traits')
      .select('tag_id, tag_name_en');

    if (error || !Array.isArray(data)) return null;

    const found = data.find((row) => normalizeSlug(row.tag_name_en) === normalized) || null;
    if (found) tagBySlugCache.set(normalized, found);
    return found;
  } catch (e) {
    return null;
  }
}

/**
 * Get cached tag guide content for (destination, tag_slug).
 * @param {string} destinationId - normalized destination slug
 * @param {string} tagSlug - normalized tag slug
 * @returns {Promise<object | null>} content JSONB or null
 */
export async function getTagGuideContent(destinationId, tagSlug) {
  const destNorm = normalizeSlug(destinationId);
  const tagNorm = normalizeSlug(tagSlug);
  if (!destNorm || !tagNorm) return null;

  try {
    const supabase = createSupabaseServiceRoleClient();
    const { data, error } = await supabase
      .from('tag_guide_content')
      .select('content')
      .eq('destination_id', destNorm)
      .eq('tag_slug', tagNorm)
      .maybeSingle();

    if (error || !data?.content) return null;
    return typeof data.content === 'string' ? JSON.parse(data.content) : data.content;
  } catch (e) {
    return null;
  }
}

/**
 * Get all tag guides for a destination (for listing on /destinations/[id]/guides).
 * Returns same shape as category guide list: { category_slug, category_name, title, subtitle, hero_image }.
 */
export async function getTagGuidesForDestination(destinationId) {
  const destNorm = normalizeSlug(destinationId);
  if (!destNorm) return [];

  try {
    const supabase = createSupabaseServiceRoleClient();
    const { data, error } = await supabase
      .from('tag_guide_content')
      .select('tag_slug, tag_name_en, content')
      .eq('destination_id', destNorm);

    if (error || !Array.isArray(data)) return [];
    return data.map((row) => {
      const content = typeof row.content === 'string' ? JSON.parse(row.content) : row.content || {};
      return {
        category_slug: row.tag_slug,
        category_name: row.tag_name_en,
        title: content.title || row.tag_name_en,
        subtitle: content.subtitle || '',
        hero_image: content.heroImage || null,
      };
    });
  } catch (e) {
    return [];
  }
}

/**
 * Save generated tag guide content.
 * @param {string} destinationId - normalized
 * @param {string} tagSlug - normalized
 * @param {string} tagNameEn - display name
 * @param {object} content - full guide shape (title, subtitle, introduction, seo, etc.)
 */
export async function saveTagGuideContent(destinationId, tagSlug, tagNameEn, content) {
  const destNorm = normalizeSlug(destinationId);
  const tagNorm = normalizeSlug(tagSlug);
  if (!destNorm || !tagNorm) return;

  try {
    const supabase = createSupabaseServiceRoleClient();
    await supabase
      .from('tag_guide_content')
      .upsert(
        {
          destination_id: destNorm,
          tag_slug: tagNorm,
          tag_name_en: tagNameEn,
          content,
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'destination_id,tag_slug' }
      );
  } catch (e) {
    console.error('[tagGuideContent] saveTagGuideContent error:', e?.message || e);
  }
}

/**
 * Build guideData shape expected by CategoryGuideClient from our stored/generated content.
 * @param {object} content - from getTagGuideContent or generateTagGuideContentWithGemini
 * @param {string} destinationName
 * @param {string} heroImage - optional
 */
export function contentToGuideData(content, destinationName, heroImage = null) {
  if (!content) return null;
  return {
    title: content.title || `${content.categoryName || 'Guide'} in ${destinationName}`,
    subtitle: content.subtitle || '',
    categoryName: content.categoryName || '',
    heroImage: content.heroImage || heroImage || null,
    stats: content.stats || {},
    introduction: content.introduction || '',
    seo: content.seo || {},
    whyChoose: content.whyChoose || [],
    tourTypes: content.tourTypes || [],
    whatToExpect: content.whatToExpect || {},
    expertTips: content.expertTips || [],
    faqs: content.faqs || [],
  };
}

/**
 * Generate short tag guide content on first load (inexpensive Gemini prompt).
 * Returns content shape to be stored and passed to contentToGuideData.
 * @param {string} destinationName - e.g. "Tanah Rata"
 * @param {string} tagName - e.g. "Coffee & Tea Tours"
 * @returns {Promise<object | null>}
 */
export async function generateTagGuideContentWithGemini(destinationName, tagName) {
  const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_GENERATIVE_AI_API_KEY;
  if (!apiKey || typeof window !== 'undefined') return null;

  try {
    const { GoogleGenerativeAI } = await import('@google/generative-ai');
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash-lite' });

    const prompt = `You are a travel content writer. Write a SHORT guide for TopTours.ai (we aggregate tours; we do not run them).

DESTINATION: ${destinationName}
ACTIVITY/TAG: ${tagName}

Output a JSON object only, no markdown, with these exact keys:
- title: "${tagName} in ${destinationName}" (or similar, under 60 chars)
- subtitle: One short sentence (under 20 words) about what travelers can expect
- categoryName: "${tagName}"
- introduction: 2 short paragraphs (about 150 words total). Neutral tone. Use "[Destination] [tag] tours..." or "These experiences...". No "our tours" or "we offer".
- seo: { title: "string under 60 chars", description: "meta description 150-160 chars", keywords: "comma-separated" }
- whyChoose: array of 3 items, each { icon: "IconName", title: "short", description: "1 sentence" }. Use only: Sun, Clock, Users, MapPin, Star, Heart, Camera
- faqs: array of 3 items, each { question: "string", answer: "2-3 sentences" }
- whatToExpect: { title: "What to Expect on Your [Tag] Tours", items: array of 4 items, each { icon: "IconName", title: "short", description: "1-2 sentences" }. Use only: Sun, Clock, Users, MapPin, Star, Heart, Camera }
- expertTips: array of 4 short tip strings (e.g. "Book in advance for popular seasons", "Wear comfortable shoes")

Also include: tourTypes: [], stats: {} so the object is complete.
Return ONLY the JSON object.`;

    const result = await model.generateContent(prompt);
    const text = result?.response?.text?.() || '';
    const match = text.match(/\{[\s\S]*\}/);
    if (!match) return null;

    let raw = match[0];
    // Fix common Gemini JSON issues: trailing commas before ] or }
    raw = raw.replace(/,(\s*[}\]])/g, '$1');

    let content = null;
    try {
      content = JSON.parse(raw);
    } catch (parseError) {
      // Retry with only trailing-comma fix (avoid over-sanitizing)
      try {
        const fixed = match[0].replace(/,(\s*[}\]])/g, '$1');
        content = JSON.parse(fixed);
      } catch (_) {
        if (process.env.NODE_ENV === 'development') {
          console.error('[tagGuideContent] generateTagGuideContentWithGemini parse:', parseError?.message || parseError);
        }
        return null;
      }
    }
    return content;
  } catch (e) {
    if (process.env.NODE_ENV === 'development') {
      console.error('[tagGuideContent] generateTagGuideContentWithGemini:', e?.message || e);
    }
    return null;
  }
}
