/**
 * Generate SEO content for explore subcategory pages (e.g. /explore/new-york-city/food-tours/chinatown-asian-food).
 * Reads subcategories from v3_landing_category_subcategories, calls Gemini, and writes
 * description, about, faq_json (5–6 FAQs), why_book, what_to_expect, summary_paragraph.
 *
 * Usage:
 *   node scripts/generate-explore-subcategory-seo-gemini.js                     # NYC, skip already-filled
 *   node scripts/generate-explore-subcategory-seo-gemini.js --dry-run            # no DB writes
 *   node scripts/generate-explore-subcategory-seo-gemini.js --limit 5            # first 5 subcategories
 *   node scripts/generate-explore-subcategory-seo-gemini.js --overwrite          # regenerate all
 *   node scripts/generate-explore-subcategory-seo-gemini.js --category food-tours # one category's subs only
 *   node scripts/generate-explore-subcategory-seo-gemini.js --destination new-york-city
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
  const catIdx = args.indexOf('--category');
  const categorySlug = catIdx >= 0 && args[catIdx + 1] ? args[catIdx + 1].trim() : null;
  return { dryRun, overwrite, limit, destinationSlug, categorySlug };
}

/** Build prompt for one subcategory page. */
function buildPrompt(subTitle, categoryTitle, destinationName, tourTitles, currentContent) {
  const tourList = (tourTitles || []).slice(0, 15).join(', ');

  return `You are an expert travel content writer creating SEO content for a subcategory page on a tours website. This page is a narrow slice of a category (e.g. "Chinatown & Asian food tours" under "Food & Culture Tours" in New York City). Content must be unique, specific, and helpful; no keyword stuffing or generic fluff.

RULES (strict):
- Write like a knowledgeable local. Be specific to this subcategory and destination.
- No generic AI phrases: avoid "dive into", "immerse yourself", "unforgettable experience", "don't miss".
- Use *asterisks* around show names, place names, or tour names when you want them emphasized (e.g. *Moulin Rouge*, *Chelsea Market*).
- description: 1–2 sentences for the hero section. What this subcategory offers and why it's worth booking. Unique.
- about: 2–3 short paragraphs. What travelers get, typical duration, highlights. Specific names and details.
- summary_paragraph: One paragraph (3–5 sentences) summarizing the subcategory for SEO/snippet. Can repeat key points from about in a tighter form.
- why_book: 1–2 sentences. Why book this type of experience in this destination. Direct and useful.
- what_to_expect: exactly 3 short steps (e.g. "Meet your guide at the designated spot", "Walk and taste at 4–5 stops", "Duration typically 2–3 hours").
- faq_json: exactly 5–6 questions. Specific to THIS subcategory (e.g. "How long is the Chinatown food tour?", "Are vegetarian options available?"). Answers: 1–3 sentences, factual.

INPUT:
- Subcategory title: ${subTitle}
- Parent category: ${categoryTitle}
- Destination: ${destinationName}
- Sample tour titles on this page: ${tourList || '(none)'}
${currentContent?.description ? `- Current description (improve or vary): ${currentContent.description.slice(0, 200)}` : ''}

OUTPUT: Return a single JSON object only, no markdown or code fences, with exactly these keys:
- description: string (1–2 sentences, hero)
- about: string (2–3 short paragraphs)
- summary_paragraph: string (one paragraph)
- why_book: string (1–2 sentences)
- what_to_expect: array of 3 strings (short steps)
- faq_json: array of 5–6 objects with "question" and "answer" (strings)

Return only the JSON object, no other text.`;
}

/** Extract JSON from model response. */
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

/** Normalize Gemini output for DB. */
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
    description: str(obj.description) || null,
    about: str(obj.about) || null,
    summary_paragraph: str(obj.summary_paragraph ?? obj.summaryParagraph) || null,
    why_book: str(obj.why_book ?? obj.whyBook) || null,
    what_to_expect: arr(obj.what_to_expect ?? obj.whatToExpect).filter((s) => typeof s === 'string' && s.trim()).slice(0, 5) || null,
    faq_json: faqs.length >= 3 ? faqs.slice(0, 8) : null,
  };
}

async function generateSubcategorySeo(subTitle, categoryTitle, destinationName, tourTitles, currentContent) {
  const prompt = buildPrompt(subTitle, categoryTitle, destinationName, tourTitles, currentContent);
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
          maxOutputTokens: 8192,
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
  const hasRequired = payload && (payload.description || payload.about) && (payload.faq_json?.length >= 3);
  if (!hasRequired) {
    console.error('   Raw (first 500 chars):', content.slice(0, 500));
    throw new Error('Gemini output missing required fields (description or about, and at least 3 FAQs).');
  }
  return payload;
}

async function updateSubcategory(destinationSlug, categorySlug, slug, payload, dryRun) {
  if (dryRun) {
    console.log('   [DRY RUN] Would update:', { destinationSlug, categorySlug, slug, keys: Object.keys(payload) });
    return;
  }
  const { error } = await supabase
    .from('v3_landing_category_subcategories')
    .update({
      description: payload.description,
      about: payload.about,
      summary_paragraph: payload.summary_paragraph,
      why_book: payload.why_book,
      what_to_expect: payload.what_to_expect,
      faq_json: payload.faq_json,
      updated_at: new Date().toISOString(),
    })
    .eq('destination_slug', destinationSlug)
    .eq('category_slug', categorySlug)
    .eq('slug', slug);

  if (error) throw error;
  console.log('   ✓ DB updated');
}

async function main() {
  const { dryRun, overwrite, limit, destinationSlug, categorySlug } = parseArgs();

  console.log('🔍 Explore subcategory page SEO generator (Gemini)');
  console.log(`   Destination: ${destinationSlug}`);
  if (categorySlug) console.log(`   Category filter: ${categorySlug}`);
  console.log(`   Overwrite existing: ${overwrite}`);
  if (limit) console.log(`   Limit: ${limit}`);
  if (dryRun) console.log('   Mode: DRY RUN (no DB writes)\n');

  let query = supabase
    .from('v3_landing_category_subcategories')
    .select('destination_slug, category_slug, slug, title, description, product_ids, about, faq_json')
    .eq('destination_slug', destinationSlug)
    .order('category_slug')
    .order('position', { ascending: true });

  if (categorySlug) query = query.eq('category_slug', categorySlug);
  if (limit) query = query.limit(limit);

  const { data: subcategories, error: subError } = await query;

  if (subError) {
    console.error('❌ Failed to fetch subcategories:', subError.message);
    process.exit(1);
  }
  if (!subcategories?.length) {
    console.log('No subcategories to process.');
    process.exit(0);
  }

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

  const { data: tourRows } = await supabase
    .from('v3_landing_category_tours')
    .select('destination_slug, category_slug, product_id, title')
    .eq('destination_slug', destinationSlug);
  const toursByCategory = new Map();
  for (const t of tourRows || []) {
    const key = `${t.destination_slug}:${t.category_slug}`;
    if (!toursByCategory.has(key)) toursByCategory.set(key, []);
    toursByCategory.get(key).push(t.title);
  }

  console.log(`\n📋 Processing ${subcategories.length} subcategory page(s)...\n`);

  let done = 0;
  let failed = 0;

  for (const sub of subcategories) {
    const categoryTitle = categoryBySlug.get(sub.category_slug) || sub.category_slug;
    const productIds = Array.isArray(sub.product_ids) ? sub.product_ids : [];
    const catKey = `${sub.destination_slug}:${sub.category_slug}`;
    const allToursInCategory = toursByCategory.get(catKey) || [];
    let tourTitles = [];
    if (productIds.length > 0) {
      const byProduct = new Map((tourRows || [])
        .filter((t) => t.category_slug === sub.category_slug)
        .map((t) => [t.product_id, t.title]));
      tourTitles = productIds.map((id) => byProduct.get(id)).filter(Boolean);
    }
    if (tourTitles.length === 0) tourTitles = allToursInCategory.slice(0, 10);

    console.log(`[${done + failed + 1}/${subcategories.length}] ${sub.title} (${sub.category_slug}/${sub.slug})`);

    try {
      if (!overwrite && sub.about && Array.isArray(sub.faq_json) && sub.faq_json.length >= 3) {
        console.log('   ⏭ Skipped (already has content; use --overwrite to regenerate)');
        continue;
      }

      const payload = await generateSubcategorySeo(
        sub.title,
        categoryTitle,
        destinationName,
        tourTitles,
        { description: sub.description, about: sub.about }
      );
      await updateSubcategory(sub.destination_slug, sub.category_slug, sub.slug, payload, dryRun);
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
