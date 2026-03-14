/**
 * Generate tour-level SEO content for explore pages (e.g. /explore/new-york-city/.../tour-slug).
 * Reads tours from v3_landing_category_tours (DB-backed; see docs/SEO_OPTIMIZATION_PLAN.md),
 * fetches Viator product description, calls Gemini, and writes seo_meta_title, seo_meta_description,
 * seo_about, who_is_this_for, insider_tips, faq_json, highlights back to the DB.
 *
 * Quality rules (aligned with Google Feb 2026 Discover + AEO/GEO):
 * - Human-first, in-depth, original; no keyword stuffing or AI fluff.
 * - Direct 40–60 word answer at start of seo_about for snippets/AI overviews.
 * - Structured bullets and FAQs; no sensational or clickbait language.
 *
 * Usage:
 *   node scripts/generate-explore-tour-seo-gemini.js --slug central-park-bike-tour   # single tour (test)
 *   node scripts/generate-explore-tour-seo-gemini.js                    # NYC only, skip already-filled
 *   node scripts/generate-explore-tour-seo-gemini.js --dry-run            # no DB writes
 *   node scripts/generate-explore-tour-seo-gemini.js --limit 3            # first 3 tours
 *   node scripts/generate-explore-tour-seo-gemini.js --overwrite           # regenerate even if SEO exists
 *   node scripts/generate-explore-tour-seo-gemini.js --destination new-york-city
 *
 * Env: GEMINI_API_KEY, VIATOR_API_KEY, NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY
 * Loaded from .env.local (or .env).
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
const VIATOR_API_KEY = process.env.VIATOR_API_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error('❌ Missing Supabase credentials. Set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in .env.local');
  process.exit(1);
}
if (!GEMINI_API_KEY) {
  console.error('❌ Missing GEMINI_API_KEY in .env.local');
  process.exit(1);
}
if (!VIATOR_API_KEY) {
  console.error('❌ Missing VIATOR_API_KEY in .env.local (needed to fetch tour descriptions)');
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
  const slugIdx = args.indexOf('--slug');
  const tourSlug = slugIdx >= 0 && args[slugIdx + 1] ? args[slugIdx + 1].trim() : null;
  return { dryRun, overwrite, limit, destinationSlug, tourSlug };
}

/** Get Viator product from viator_products table (v3 ingest); returns same shape as fetchViatorProduct for prompt. */
async function getViatorContextFromDb(productId) {
  const { data, error } = await supabase
    .from('viator_products')
    .select('payload')
    .eq('product_code', productId)
    .maybeSingle();
  if (error || !data?.payload) return null;
  const data_ = data.payload;
  const d = data_.description;
  let description = '';
  if (typeof d === 'string' && d.trim()) description = d.trim();
  else if (d?.summary) description = String(d.summary);
  else if (d?.shortDescription) description = String(d.shortDescription);
  else if (d?.description) description = String(d.description);
  return {
    description: description.slice(0, 8000),
    inclusions: Array.isArray(data_.inclusions)
      ? data_.inclusions.map((i) => (typeof i === 'string' ? i : i?.description || i?.name || '')).filter(Boolean)
      : [],
    duration: data_.duration?.summary || data_.duration?.duration || null,
  };
}

/** Fetch one Viator product from API (fallback when not in viator_products). */
async function fetchViatorProduct(productId) {
  const url = `https://api.viator.com/partner/products/${productId}?currency=USD`;
  const res = await fetch(url, {
    method: 'GET',
    headers: {
      'exp-api-key': VIATOR_API_KEY,
      Accept: 'application/json;version=2.0',
      'Accept-Language': 'en-US',
      'Content-Type': 'application/json',
    },
  });
  if (!res.ok) return null;
  const data = await res.json();
  if (!data || data.error) return null;
  const d = data.description;
  let description = '';
  if (typeof d === 'string' && d.trim()) description = d.trim();
  else if (d?.summary) description = String(d.summary);
  else if (d?.shortDescription) description = String(d.shortDescription);
  else if (d?.description) description = String(d.description);
  return {
    description: description.slice(0, 8000),
    inclusions: Array.isArray(data.inclusions)
      ? data.inclusions.map((i) => (typeof i === 'string' ? i : i?.description || i?.name || '')).filter(Boolean)
      : [],
    duration: data.duration?.summary || data.duration?.duration || null,
  };
}

/** Build prompt for one tour; output must be valid JSON. */
function buildPrompt(tour, destinationName, categoryTitle, viatorContext) {
  const { title, product_id } = tour;
  const desc = viatorContext?.description || '';
  const duration = viatorContext?.duration || '';
  const inclusions = (viatorContext?.inclusions || []).slice(0, 12).join('; ');

  return `You are an expert travel content writer creating SEO content for a single tour page. The content will be shown on a real site (explore pages like /explore/new-york-city/...) and must satisfy modern search and AI answer engines (Google 2026 Discover, E-E-A-T, Featured Snippets).

RULES (strict):
- Write like a knowledgeable local or tour specialist. Be specific and useful, not generic.
- No keyword stuffing. No lists of repeated keywords. No clickbait or sensational language.
- No generic AI phrases: avoid "dive into", "immerse yourself", "unforgettable experience", "create lasting memories", "perfect for", "don't miss", "bucket list".
- Intent-first: answer the questions travelers actually ask (duration, meeting point, what's included, who it's for, cancellation).
- For Featured Snippets and AI overviews: the first 40–60 words of "seo_about" must be a direct, concise answer to "What is this tour?" — then you can add 1–2 short paragraphs with more detail.
- FAQs must be specific to THIS tour (e.g. duration, meeting place, what to bring), not generic "How do I book?".
- Use natural language and varied sentence structure. Sound human and expert.

INPUT:
- Tour title: ${title}
- Destination: ${destinationName}
- Category: ${categoryTitle}
- Viator product description (use as source of facts only; rewrite in your own words, more concise and structured): ${desc || '(none provided)'}
${duration ? `- Typical duration: ${duration}` : ''}
${inclusions ? `- Inclusions (reference only): ${inclusions}` : ''}

OUTPUT: Return a single JSON object only, no markdown or code fences, with exactly these keys (all strings or arrays of strings; for faq_json use objects with "question" and "answer" strings):
- seo_meta_title: One line, under 60 chars, include tour name and location. Example: "Central Park Bike Tour | Central Park Tours | New York City | TopTours.ai"
- seo_meta_description: 1–2 sentences, 150–160 chars, direct and useful; no filler.
- seo_about: 2–3 short paragraphs. First 40–60 words must directly answer "What is this tour?" in one clear statement. Then add context (what you see/do, why it's worthwhile). No bullet points inside this field.
- why_we_recommend: 1–2 short sentences (max 200 chars). Why TopTours recommends this tour: who it's best for and one standout reason. Natural, no fluff. Example: "We recommend this tour for first-time visitors who want to cover the park in a few hours—the guided route hits the best spots without the hassle of navigating yourself."
- who_is_this_for: Array of 4–7 short strings (e.g. "First-time visitors who want to see the park in a few hours", "Families with children 6 and older").
- insider_tips: Array of 3–6 short strings (practical: best time, what to bring, booking tip, what to avoid).
- highlights: Array of 5–8 short strings (what you'll see or do on the tour).
- faq_json: Array of 5–9 objects, each with "question" and "answer". Questions must be specific to this tour (e.g. "How long is the Central Park bike tour?", "Where does the tour start?"). Answers: 1–3 sentences, factual.

Return only the JSON object, no other text.`;
}

/** Extract JSON from model response (strip markdown if present). */
function parseJsonFromResponse(text) {
  if (!text || typeof text !== 'string') return null;
  let raw = text.trim();
  const codeBlock = raw.match(/```(?:json)?\s*([\s\S]*?)```/);
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

/** Validate and normalize Gemini output for DB. Accepts snake_case or camelCase keys. */
function normalizeSeoPayload(obj) {
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
  const whyWeRecommend = str(obj.why_we_recommend ?? obj.whyWeRecommend);
  const whoRaw = obj.who_is_this_for ?? obj.whoIsThisFor;
  const tipsRaw = obj.insider_tips ?? obj.insiderTips;
  const highRaw = obj.highlights;
  return {
    seo_meta_title: str(obj.seo_meta_title ?? obj.seoMetaTitle) || null,
    seo_meta_description: str(obj.seo_meta_description ?? obj.seoMetaDescription) || null,
    seo_about: str(obj.seo_about ?? obj.seoAbout) || null,
    why_we_recommend: whyWeRecommend && whyWeRecommend.length <= 500 ? whyWeRecommend : (whyWeRecommend ? whyWeRecommend.slice(0, 500) : null),
    who_is_this_for: arr(whoRaw).filter((s) => typeof s === 'string' && s.trim()).slice(0, 12) || null,
    insider_tips: arr(tipsRaw).filter((s) => typeof s === 'string' && s.trim()).slice(0, 10) || null,
    highlights: arr(highRaw).filter((s) => typeof s === 'string' && s.trim()).slice(0, 12) || null,
    faq_json: faqs.length ? faqs.slice(0, 12) : null,
  };
}

/** Call Gemini and return normalized SEO payload. */
async function generateTourSeo(tour, destinationName, categoryTitle) {
  let viatorContext = null;
  try {
    viatorContext = await getViatorContextFromDb(tour.product_id);
    if (!viatorContext) viatorContext = await fetchViatorProduct(tour.product_id);
  } catch (e) {
    console.warn(`   ⚠ Viator fetch failed for ${tour.product_id}: ${e?.message || e}`);
  }
  if (!viatorContext?.description) {
    console.warn(`   ⚠ No Viator description for ${tour.product_id}; generating from title only.`);
  }

  const prompt = buildPrompt(tour, destinationName, categoryTitle, viatorContext);
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
          maxOutputTokens: 4096,
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
        console.log(`   ⏳ Rate limit; waiting 15s before retry...`);
        await new Promise((r) => setTimeout(r, 15000));
      }
      continue;
    }
  }

  if (!content) {
    throw lastError || new Error('Gemini returned no content');
  }

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
  const payload = normalizeSeoPayload(parsed);
  const hasRequired = payload && (payload.seo_meta_title || payload.seo_about || payload.why_we_recommend);
  if (!hasRequired) {
    const snippet = content.slice(0, 600);
    console.error('   Raw Gemini response (first 600 chars):', snippet);
    throw new Error('Gemini output missing required fields (seo_meta_title, seo_about, or why_we_recommend). Check raw response above.');
  }
  return payload;
}

/** Update one tour row with SEO fields. */
async function updateTourSeo(destinationSlug, categorySlug, tourSlug, payload, dryRun) {
  if (dryRun) {
    console.log('   [DRY RUN] Would update:', { destinationSlug, categorySlug, tourSlug, keys: Object.keys(payload) });
    return;
  }
  const { error } = await supabase
    .from('v3_landing_category_tours')
    .update({
      seo_meta_title: payload.seo_meta_title,
      seo_meta_description: payload.seo_meta_description,
      seo_about: payload.seo_about,
      why_we_recommend: payload.why_we_recommend,
      who_is_this_for: payload.who_is_this_for,
      insider_tips: payload.insider_tips,
      highlights: payload.highlights,
      faq_json: payload.faq_json,
    })
    .eq('destination_slug', destinationSlug)
    .eq('category_slug', categorySlug)
    .eq('tour_slug', tourSlug);

  if (error) throw error;
  console.log('   ✓ DB updated');
}

async function main() {
  const { dryRun, overwrite, limit, destinationSlug, tourSlug } = parseArgs();

  console.log('🔍 Explore tour SEO generator (Gemini)');
  console.log(`   Destination: ${destinationSlug}`);
  if (tourSlug) console.log(`   Single tour (slug): ${tourSlug}`);
  console.log(`   Overwrite existing: ${overwrite}`);
  if (limit) console.log(`   Limit: ${limit}`);
  if (dryRun) console.log('   Mode: DRY RUN (no DB writes)\n');

  let query = supabase
    .from('v3_landing_category_tours')
    .select('destination_slug, category_slug, tour_slug, product_id, title')
    .eq('destination_slug', destinationSlug)
    .not('tour_slug', 'is', null)
    .order('position', { ascending: true });

  if (tourSlug) {
    query = query.eq('tour_slug', tourSlug);
  }
  if (!overwrite && !tourSlug) {
    query = query.is('seo_meta_title', null);
  }
  if (tourSlug) {
    query = query.limit(1);
  } else if (limit) {
    query = query.limit(limit);
  }

  const { data: tours, error: toursError } = await query;

  if (toursError) {
    console.error('❌ Failed to fetch tours:', toursError.message);
    process.exit(1);
  }
  if (!tours?.length) {
    console.log('No tours to process. (Add --overwrite to regenerate existing SEO.)');
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

  console.log(`\n📋 Processing ${tours.length} tour(s)...\n`);

  let done = 0;
  let failed = 0;

  for (const tour of tours) {
    const catTitle = categoryBySlug.get(tour.category_slug) || tour.category_slug;
    console.log(`[${done + failed + 1}/${tours.length}] ${tour.title} (${tour.tour_slug})`);

    try {
      const payload = await generateTourSeo(tour, destinationName, catTitle);
      await updateTourSeo(tour.destination_slug, tour.category_slug, tour.tour_slug, payload, dryRun);
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
