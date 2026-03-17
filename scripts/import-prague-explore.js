/**
 * Import Prague explore data from prague-export.json into v3_landing_* tables.
 * Creates /explore/prague with same structure as /explore/new-york-city.
 *
 * Usage (from project root):
 *   node scripts/import-prague-explore.js
 *   node scripts/import-prague-explore.js "C:\path\to\prague-export.json"
 *
 * Env: .env.local with NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY
 * Optional: PRAGUE_EXPORT_JSON env or first CLI arg = path to prague-export.json
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const envPath = path.join(__dirname, '..', '.env.local');
if (fs.existsSync(envPath)) {
  dotenv.config({ path: envPath });
}

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error('❌ Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env.local');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

function getExportPath() {
  const env = process.env.PRAGUE_EXPORT_JSON;
  if (env && env.trim()) return path.resolve(env.trim());
  const arg = process.argv[2];
  if (arg && arg.trim()) return path.resolve(arg.trim());
  const defaultPath = path.join(__dirname, '..', 'prague-export.json');
  if (fs.existsSync(defaultPath)) return defaultPath;
  console.error(
    '❌ No prague-export.json path. Set PRAGUE_EXPORT_JSON or pass path: node scripts/import-prague-explore.js "C:\\path\\to\\prague-export.json"'
  );
  process.exit(1);
}

function loadExport(filePath) {
  const raw = fs.readFileSync(filePath, 'utf8');
  return JSON.parse(raw);
}

function toJsonb(val) {
  if (val == null) return null;
  if (Array.isArray(val)) return val;
  if (typeof val === 'object') return val;
  return null;
}

async function run() {
  const filePath = getExportPath();
  console.log('📂 Loading', filePath);
  const data = loadExport(filePath);

  const { destination, categories = [], subcategories = [], tours = [], pillarProductCodes = {} } = data;
  if (!destination || destination.slug !== 'prague') {
    console.error('❌ Export must have destination.slug === "prague"');
    process.exit(1);
  }

  const destSlug = destination.slug;
  const destName = destination.name || 'Prague';

  console.log('🗑️  Removing existing Prague v3 data...');
  await supabase.from('v3_landing_category_tours').delete().eq('destination_slug', destSlug);
  await supabase.from('v3_landing_category_subcategories').delete().eq('destination_slug', destSlug);
  await supabase.from('v3_landing_category_pages').delete().eq('destination_slug', destSlug);
  await supabase.from('v3_landing_categories').delete().eq('destination_slug', destSlug);
  await supabase.from('v3_landing_top_picks').delete().eq('destination_slug', destSlug);

  console.log('📥 Inserting destination...');
  const destRow = {
    slug: destSlug,
    name: destName,
    meta_title: 'Prague Tours & Excursions: Old Town Walks, Castle Tours, Day Trips & More | TopTours.ai',
    meta_description:
      'Book Prague walking tours, Old Town & Jewish Quarter tours, Prague Castle visits, river cruises, food and beer tastings, and day trips. Compare top-rated excursions and reserve with free cancellation.',
    hero_title: 'Prague Tours & Excursions: Top-Rated Activities',
    hero_subtitle:
      'Book Old Town & Jewish Quarter walks, Prague Castle tours, river cruises, beer tastings, and day trips. Compare top-rated Prague experiences and reserve with free cancellation.',
    hero_cta_text: 'See top tours',
    hero_badge: `${destName} Tours & Activities`,
    og_image_url: null,
    is_active: true,
    why_visit_text: null,
    why_visit_bullets: null,
    what_to_expect_bullets: null,
    tips_bullets: null,
    faq_json: null,
  };
  const { error: destErr } = await supabase.from('v3_landing_destinations').upsert(destRow, { onConflict: 'slug' });
  if (destErr) {
    console.error('❌ Destination insert failed:', destErr.message);
    process.exit(1);
  }

  console.log('📥 Inserting categories...');
  const categoryRows = categories.map((c, i) => ({
    destination_slug: destSlug,
    slug: c.slug,
    title: c.title,
    description: c.description || null,
    icon_name: null,
    position: i + 1,
    meta_title: null,
    meta_description: null,
  }));
  const { error: catErr } = await supabase.from('v3_landing_categories').upsert(categoryRows, { onConflict: 'destination_slug,slug' });
  if (catErr) {
    console.error('❌ Categories insert failed:', catErr.message);
    process.exit(1);
  }

  console.log('📥 Inserting category pages...');
  const pageRows = categories.map((c) => ({
    destination_slug: destSlug,
    category_slug: c.slug,
    hero_description: c.description || null,
    about: c.about || null,
    insider_tips: toJsonb(c.insiderTips) ?? null,
    what_to_expect: toJsonb(c.whatToExpect) ?? null,
    who_is_this_for: toJsonb(c.whoIsThisFor) ?? null,
    highlights: toJsonb(c.highlights) ?? null,
    faq_json: toJsonb(c.faqs) ?? null,
    seo_meta_title: null,
    seo_meta_description: null,
    top_picks_heading: null,
    top_picks_subtext: null,
  }));
  const { error: pageErr } = await supabase.from('v3_landing_category_pages').upsert(pageRows, { onConflict: 'destination_slug,category_slug' });
  if (pageErr) {
    console.error('❌ Category pages insert failed:', pageErr.message);
    process.exit(1);
  }

  const topPickProductIds = [];
  for (let i = 0; i < Math.min(6, categories.length); i++) {
    const codes = pillarProductCodes[categories[i].slug];
    if (codes && codes.length > 0) topPickProductIds.push(codes[0]);
  }
  if (topPickProductIds.length > 0) {
    console.log('📥 Inserting top picks (', topPickProductIds.length, ')...');
    const topPickRows = topPickProductIds.map((product_id, i) => ({
      destination_slug: destSlug,
      product_id,
      position: i + 1,
    }));
    const { error: tpErr } = await supabase.from('v3_landing_top_picks').upsert(topPickRows, { onConflict: 'destination_slug,position' });
    if (tpErr) console.warn('⚠️ Top picks warning:', tpErr.message);
  }

  const tourByKey = new Map();
  for (const t of tours) {
    tourByKey.set(`${t.categorySlug}|${t.slug}`, t);
  }

  console.log('📥 Inserting subcategories...');
  const subRows = subcategories.map((sub, i) => {
    const productIds = (sub.picks || [])
      .map((p) => {
        const tour = tourByKey.get(`${sub.categorySlug}|${p.slug}`);
        return tour ? tour.productCode : null;
      })
      .filter(Boolean);
    return {
      destination_slug: destSlug,
      category_slug: sub.categorySlug,
      slug: sub.slug,
      title: sub.title,
      description: sub.description || null,
      product_ids: productIds.length ? productIds : [],
      about: sub.intro || sub.about || null,
      faq_json: toJsonb(sub.faqs) ?? null,
      position: i + 1,
      why_book: null,
      what_to_expect: toJsonb(sub.whatToExpect) ?? null,
      summary_paragraph: sub.intro || null,
    };
  });
  if (subRows.length > 0) {
    const { error: subErr } = await supabase.from('v3_landing_category_subcategories').upsert(subRows, { onConflict: 'destination_slug,category_slug,slug' });
    if (subErr) {
      console.error('❌ Subcategories insert failed:', subErr.message);
      process.exit(1);
    }
  }

  console.log('📥 Inserting category tours...');
  const tourByCatAndCode = new Map();
  for (const t of tours) {
    if (t.categorySlug && t.productCode) tourByCatAndCode.set(`${t.categorySlug}|${t.productCode}`, t);
  }
  const tourRows = [];
  for (const cat of categories) {
    const codes = pillarProductCodes[cat.slug];
    if (!codes || !Array.isArray(codes)) continue;
    codes.forEach((product_id, idx) => {
      const t = tourByCatAndCode.get(`${cat.slug}|${product_id}`);
      const title = t ? (t.seoTitle || t.operator || t.angle || 'Tour') : product_id;
      const tour_slug = t && t.slug ? t.slug : null;
      tourRows.push({
        destination_slug: destSlug,
        category_slug: cat.slug,
        product_id,
        title,
        tour_slug,
        image_url: null,
        from_price: null,
        rating: null,
        review_count: null,
        position: idx + 1,
        is_top_pick: idx < 4,
        seo_meta_title: t?.seoTitle || null,
        seo_meta_description: t?.metaDescription || null,
        seo_about: t?.intro || null,
        who_is_this_for: toJsonb(t?.whoIsThisFor || t?.bestFor) ?? null,
        insider_tips: null,
        faq_json: toJsonb(t?.faqs) ?? null,
        highlights: toJsonb(t?.highlights) ?? null,
        why_we_recommend: Array.isArray(t?.whyWeRecommend) ? t.whyWeRecommend.join('\n\n') : (t?.whyWeRecommend || null),
      });
    });
  }
  if (tourRows.length > 0) {
    const BATCH = 100;
    for (let i = 0; i < tourRows.length; i += BATCH) {
      const chunk = tourRows.slice(i, i + BATCH);
      const { error: trErr } = await supabase.from('v3_landing_category_tours').upsert(chunk, { onConflict: 'destination_slug,category_slug,position' });
      if (trErr) {
        console.error('❌ Category tours insert failed:', trErr.message);
        process.exit(1);
      }
    }
  }

  console.log('✅ Prague explore import done.');
  console.log('   Destination:', destSlug);
  console.log('   Categories:', categories.length);
  console.log('   Subcategories:', subRows.length);
  console.log('   Tours:', tourRows.length);
  console.log('   Visit: https://toptours.ai/explore/prague');
}

run().catch((e) => {
  console.error('❌', e.message || e);
  process.exit(1);
});

