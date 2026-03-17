/**
 * Generate SEO content for explore category pages (e.g. /explore/new-york-city/food-tours).
 * Reads categories that have tours from v3_landing_category_tours, calls Gemini, and writes
 * to v3_landing_category_pages: seo_meta_title, seo_meta_description, hero_description, about,
 * insider_tips, what_to_expect, who_is_this_for, highlights, faq_json (5–6 FAQs), top_picks_heading, top_picks_subtext.
 *
 * Run docs/seeds/add_category_page_seo_columns.sql first to add seo_meta_title, seo_meta_description,
 * top_picks_heading, top_picks_subtext to v3_landing_category_pages.
 *
 * Usage:
 *   node scripts/generate-explore-category-seo-gemini.js                     # NYC, skip already-filled
 *   node scripts/generate-explore-category-seo-gemini.js --dry-run           # no DB writes
 *   node scripts/generate-explore-category-seo-gemini.js --limit 2            # first 2 categories
 *   node scripts/generate-explore-category-seo-gemini.js --overwrite           # regenerate all
 *   node scripts/generate-explore-category-seo-gemini.js --destination new-york-city
 *
 * Env: GEMINI_API_KEY, NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY (.env.local)
 */

import { createClient } from '@supabase/supabase-js';
import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({ path: join(__dirname, '../.env.local') });
dotenv.config({ path: join(__dirname, '../.env') });

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const GEMINI_API_KEY = process.env.GEMINI_API_KEY || process.env.GOOGLE_GENERATIVE_AI_API_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error('❌ Missing Supabase credentials. Set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in .env.local');
  process.exit(1);
}
if (!GEMINI_API_KEY) {
  console.error('❌ Missing GEMINI_API_KEY in .env.local');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

function parseArgs() {
  const args = process.argv.slice(2);
  const dryRun = args.includes('--dry-run');
  const overwrite = args.includes('--overwrite');
  const limitIdx = args.indexOf('--limit');
  const limit = limitIdx >= 0 && args[limitIdx + 1] ? parseInt(args[limitIdx + 1], 10) : null;
  const destIdx = args.indexOf('--destination');
  const destinationSlug = destIdx >= 0 && args[destIdx + 1] ? args[destIdx + 1] : 'new-york-city';
  return { dryRun, overwrite, limit, destinationSlug };
}

/** Build prompt for one category page. Output must be valid JSON. */
function buildPrompt(categoryTitle, destinationName, subcategoryTitles, tourTitles, currentContent) {
  const tourList = (tourTitles || []).slice(0, 20).join(', ');
  const subList = (subcategoryTitles || []).join(', ');

  return `You are an expert travel content writer creating SEO content for a category page on a tours website. The page lists multiple tours in one category (e.g. "Food & Culture Tours" in New York City). Content must satisfy Google and AI answer engines: unique, specific, helpful; no keyword stuffing or generic fluff.

RULES (strict):
- Write like a knowledgeable local or travel specialist. Be specific to this category and destination.
- No generic AI phrases: avoid "dive into", "immerse yourself", "unforgettable experience", "don't miss", "bucket list".
- Meta title: under 60 characters, include category and destination. Example: "Food & Culture Tours | New York City | TopTours.ai"
- Meta description: 150–160 chars, direct and useful; include what travelers can do and a light CTA.
- Hero description: 1–2 sentences for the hero section; mention neighborhoods or types of tours (e.g. Chinatown, Chelsea Market, walking food tours). Unique, not generic.
- About: 2–3 short paragraphs describing what this category offers in this destination. Specific names (neighborhoods, operators, tour types).
- FAQs: exactly 5–6 questions. Specific to this category (e.g. "Are dietary restrictions accommodated on food tours?", "How long do most food tours last?"). Answers: 1–3 sentences, factual.
- Insider tips: 4–5 short, practical tips (booking ahead, what to wear, arrival time, etc.).
- Who is this for: 3–5 short strings (e.g. "Food lovers and first-time visitors", "Couples and small groups").
- Highlights: 4–6 short strings (neighborhoods, tour types, or themes).
- What to expect: 3 short steps (e.g. "Meet your guide at the designated spot", "Walk through the neighborhood with tastings", "Duration typically 2–3 hours").
- top_picks_heading: ONE short phrase for the "top picks" section. Vary the wording—use one of these styles (or similar): "Popular choices — view & book", "AI picks", "Insider picks", "Handpicked favorites", "Our top recommendations". Do not repeat the same phrase for every category.
- top_picks_subtext: One sentence (e.g. "Handpicked food & culture tours we recommend. Compare and book with free cancellation on most tours."). Can mention the category name.

INPUT:
- Category title: ${categoryTitle}
- Destination: ${destinationName}
${subList ? `- Subcategory guide names (for context): ${subList}` : ''}
- Sample tour titles on this page (for context): ${tourList || '(none)'}
${currentContent?.hero_description ? `- Current hero description (improve or vary): ${currentContent.hero_description.slice(0, 300)}` : ''}

OUTPUT: Return a single JSON object only, no markdown or code fences, with exactly these keys:
- seo_meta_title: string (under 60 chars)
- seo_meta_description: string (150–160 chars)
- hero_description: string (1–2 sentences)
- about: string (2–3 short paragraphs)
- faq_json: array of 5–6 objects with "question" and "answer" (strings)
- insider_tips: array of 4–5 strings
- who_is_this_for: array of 3–5 strings
- highlights: array of 4–6 strings
- what_to_expect: array of 3 strings (short steps)
- top_picks_heading: string (one short phrase, varied style)
- top_picks_subtext: string (one sentence)

Return only the JSON object, no other text.`;
}

/** Extract JSON from model response (handles markdown code fences and truncated output). */
function parseJsonFromResponse(text) {
  if (!text || typeof text !== 'string') return null;
  let raw = text.trim();
  const codeBlock = raw.match(/```(?:json)?\s*([\s\S]*?)(?:```|$)/);
  if (codeBlock) raw = codeBlock[1].trim();
  try {
    return JSON.parse(raw);
  } catch {
    const start = raw.indexOf('{');
    const end = raw.lastIndexOf('}');
    if (start >= 0 && end > start) {
      try {
        return JSON.parse(raw.slice(start, end + 1));
      } catch {
        return null;
      }
    }
    return null;
  }
}

/** Normalize Gemini output for DB. Accepts snake_case or camelCase. */
function normalizePayload(obj) {
  if (!obj || typeof obj !== 'object') return null;
  const arr = (v) => (Array.isArray(v) ? v : []);
  const str = (v) => (typeof v === 'string' && v.trim() ? v.trim() : null);
  const faqRaw = obj.faq_json ?? obj.faqJson;
  const faqs = arr(faqRaw)
    .map((item) => {
      const q = str(item?.question ?? item?.q);
      const a = str(item?.answer ?? item?.a);
      return q && a ? { question: q, answer: a } : null;
    })
    .filter(Boolean);
  return {
    seo_meta_title: str(obj.seo_meta_title ?? obj.seoMetaTitle) || null,
    seo_meta_description: str(obj.seo_meta_description ?? obj.seoMetaDescription) || null,
    hero_description: str(obj.hero_description ?? obj.heroDescription) || null,
    about: str(obj.about) || null,
    insider_tips: arr(obj.insider_tips ?? obj.insiderTips).filter((s) => typeof s === 'string' && s.trim()).slice(0, 8) || null,
    who_is_this_for: arr(obj.who_is_this_for ?? obj.whoIsThisFor).filter((s) => typeof s === 'string' && s.trim()).slice(0, 8) || null,
    highlights: arr(obj.highlights).filter((s) => typeof s === 'string' && s.trim()).slice(0, 10) || null,
    what_to_expect: arr(obj.what_to_expect ?? obj.whatToExpect).filter((s) => typeof s === 'string' && s.trim()).slice(0, 5) || null,
    faq_json: faqs.length >= 3 ? faqs.slice(0, 8) : null,
    top_picks_heading: str(obj.top_picks_heading ?? obj.topPicksHeading) || null,
    top_picks_subtext: str(obj.top_picks_subtext ?? obj.topPicksSubtext) || null,
  };
}

async function generateCategorySeo(categorySlug, categoryTitle, destinationName, subcategoryTitles, tourTitles, currentContent) {
  const prompt = buildPrompt(categoryTitle, destinationName, subcategoryTitles, tourTitles, currentContent);
  const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
  const models = ['gemini-2.5-flash', 'gemini-2.0-flash', 'gemini-1.5-flash'];

  let content = null;
  let lastError = null;

  for (const modelName of models) {
    try {
      const model = genAI.getGenerativeModel({ model: modelName });
      const result = await model.generateContent({
        contents: [{ role: 'user', parts: [{ text: prompt }] }],
        generationConfig: {
          temperature: 0.6,
          topK: 40,
          topP: 0.95,
          maxOutputTokens: 16384,
        },
      });
      const response = result.response;
      if (!response?.candidates?.length) continue;
      const part = response.candidates[0].content?.parts?.[0];
      content = part?.text || null;
      if (content) break;
    } catch (err) {
      lastError = err;
      if (String(err?.message || '').includes('429') || String(err?.message || '').includes('quota')) {
        console.log('   ⏳ Rate limit; waiting 15s...');
        await new Promise((r) => setTimeout(r, 15000));
      }
      continue;
    }
  }

  if (!content) throw lastError || new Error('Gemini returned no content');

  let parsed = parseJsonFromResponse(content);
  if (!parsed && content.includes('{')) {
    const start = content.indexOf('{');
    let depth = 0;
    let end = -1;
    for (let i = start; i < content.length; i++) {
      if (content[i] === '{') depth++;
      else if (content[i] === '}') { depth--; if (depth === 0) { end = i; break; } }
    }
    if (end > start) {
      try {
        parsed = JSON.parse(content.slice(start, end + 1));
      } catch {
        parsed = null;
      }
    }
  }

  const payload = normalizePayload(parsed);
  const hasCore = payload && (payload.seo_meta_title || payload.hero_description);
  if (!hasCore) {
    console.error('   Raw (first 500 chars):', content.slice(0, 500));
    throw new Error('Gemini output missing required fields (seo_meta_title or hero_description).');
  }
  if (!payload.faq_json?.length || payload.faq_json.length < 3) {
    console.log('   ⚠️ Fewer than 3 FAQs in response (possible truncation); saving anyway.');
  }
  return payload;
}

async function upsertCategoryPage(destinationSlug, categorySlug, payload, dryRun) {
  if (dryRun) {
    console.log('   [DRY RUN] Would upsert:', { destinationSlug, categorySlug, keys: Object.keys(payload) });
    return;
  }
  const row = {
    destination_slug: destinationSlug,
    category_slug: categorySlug,
    hero_description: payload.hero_description,
    about: payload.about,
    insider_tips: payload.insider_tips,
    what_to_expect: payload.what_to_expect,
    who_is_this_for: payload.who_is_this_for,
    highlights: payload.highlights,
    faq_json: payload.faq_json,
    seo_meta_title: payload.seo_meta_title,
    seo_meta_description: payload.seo_meta_description,
    top_picks_heading: payload.top_picks_heading,
    top_picks_subtext: payload.top_picks_subtext,
    updated_at: new Date().toISOString(),
  };
  const { error } = await supabase
    .from('v3_landing_category_pages')
    .upsert(row, { onConflict: 'destination_slug,category_slug' });

  if (error) throw error;
  console.log('   ✓ DB updated');
}

async function main() {
  const { dryRun, overwrite, limit, destinationSlug } = parseArgs();

  console.log('🔍 Explore category page SEO generator (Gemini)');
  console.log(`   Destination: ${destinationSlug}`);
  console.log(`   Overwrite existing: ${overwrite}`);
  if (limit) console.log(`   Limit: ${limit}`);
  if (dryRun) console.log('   Mode: DRY RUN (no DB writes)\n');

  // Distinct (destination_slug, category_slug) that have tours
  const { data: tourRows, error: toursError } = await supabase
    .from('v3_landing_category_tours')
    .select('destination_slug, category_slug')
    .eq('destination_slug', destinationSlug);

  if (toursError) {
    console.error('❌ Failed to fetch tours:', toursError.message);
    process.exit(1);
  }

  const pairs = [];
  const seen = new Set();
  for (const r of tourRows || []) {
    const key = `${r.destination_slug}:${r.category_slug}`;
    if (!seen.has(key)) {
      seen.add(key);
      pairs.push({ destination_slug: r.destination_slug, category_slug: r.category_slug });
    }
  }

  let toProcess = pairs;
  if (limit) toProcess = toProcess.slice(0, limit);

  const { data: destRows } = await supabase
    .from('v3_landing_destinations')
    .select('slug, name')
    .eq('slug', destinationSlug)
    .limit(1);
  const destinationName = destRows?.[0]?.name || destinationSlug;

  const { data: catRows } = await supabase
    .from('v3_landing_categories')
    .select('slug, title')
    .eq('destination_slug', destinationSlug);
  const categoryBySlug = new Map((catRows || []).map((c) => [c.slug, c.title]));

  const { data: subRows } = await supabase
    .from('v3_landing_category_subcategories')
    .select('destination_slug, category_slug, title')
    .eq('destination_slug', destinationSlug);
  const subcategoriesByCategory = new Map();
  for (const s of subRows || []) {
    const key = `${s.destination_slug}:${s.category_slug}`;
    if (!subcategoriesByCategory.has(key)) subcategoriesByCategory.set(key, []);
    subcategoriesByCategory.get(key).push(s.title);
  }

  if (toProcess.length === 0) {
    console.log('No category pages to process (no tours for this destination).');
    process.exit(0);
  }

  console.log(`\n📋 Processing ${toProcess.length} category page(s)...\n`);

  let done = 0;
  let failed = 0;

  for (const { destination_slug, category_slug } of toProcess) {
    const categoryTitle = categoryBySlug.get(category_slug) || category_slug;
    console.log(`[${done + failed + 1}/${toProcess.length}] ${categoryTitle} (${category_slug})`);

    try {
      const [pageRes, toursRes] = await Promise.all([
        supabase
          .from('v3_landing_category_pages')
          .select('hero_description, faq_json')
          .eq('destination_slug', destination_slug)
          .eq('category_slug', category_slug)
          .maybeSingle(),
        supabase
          .from('v3_landing_category_tours')
          .select('title')
          .eq('destination_slug', destination_slug)
          .eq('category_slug', category_slug)
          .order('position', { ascending: true }),
      ]);

      const currentContent = pageRes.data || null;
      const tourTitles = (toursRes.data || []).map((t) => t.title);
      const subKey = `${destination_slug}:${category_slug}`;
      const subcategoryTitles = subcategoriesByCategory.get(subKey) || [];

      if (!overwrite && currentContent?.hero_description && Array.isArray(currentContent?.faq_json) && currentContent.faq_json.length >= 5) {
        console.log('   ⏭ Skipped (already has content; use --overwrite to regenerate)');
        continue;
      }

      const payload = await generateCategorySeo(
        category_slug,
        categoryTitle,
        destinationName,
        subcategoryTitles,
        tourTitles,
        currentContent
      );
      await upsertCategoryPage(destination_slug, category_slug, payload, dryRun);
      done++;
      await new Promise((r) => setTimeout(r, 800));
    } catch (e) {
      console.error(`   ❌ ${e?.message || e}`);
      failed++;
    }
  }

  console.log(`\n✅ Done. Updated: ${done}, Failed: ${failed}${dryRun ? ' (dry run)' : ''}`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
