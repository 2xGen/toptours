/**
 * TopTours 3.0 landing page data from Supabase.
 * Used by /explore/[destinationSlug] (e.g. NYC: 6 top picks + 12 categories).
 */
import { createSupabaseServiceRoleClient } from '@/lib/supabaseClient';

/**
 * @param {string} destinationSlug - e.g. 'new-york-city'
 * @returns {Promise<{ slug: string, name: string, meta_title: string, meta_description: string, hero_title: string, hero_subtitle: string, hero_cta_text: string, og_image_url: string } | null>}
 */
export async function getV3LandingDestination(destinationSlug) {
  if (!destinationSlug) return null;
  try {
    const supabase = createSupabaseServiceRoleClient();
    const { data, error } = await supabase
      .from('v3_landing_destinations')
      .select('slug, name, meta_title, meta_description, hero_title, hero_subtitle, hero_cta_text, hero_badge, og_image_url, why_visit_text, why_visit_bullets, what_to_expect_bullets, tips_bullets, faq_json')
      .eq('slug', destinationSlug)
      .eq('is_active', true)
      .maybeSingle();

    if (error || !data) return null;
    return data;
  } catch (e) {
    console.error('getV3LandingDestination:', e?.message || e);
    return null;
  }
}

/**
 * @param {string} destinationSlug
 * @returns {Promise<Array<{ product_id: string, position: number, title_override?: string, image_url_override?: string, from_price_override?: string }>>}
 */
export async function getV3LandingTopPicks(destinationSlug) {
  if (!destinationSlug) return [];
  try {
    const supabase = createSupabaseServiceRoleClient();
    const { data, error } = await supabase
      .from('v3_landing_top_picks')
      .select('product_id, position, title_override, image_url_override, from_price_override')
      .eq('destination_slug', destinationSlug)
      .order('position', { ascending: true });

    if (error) return [];
    return data || [];
  } catch (e) {
    console.error('getV3LandingTopPicks:', e?.message || e);
    return [];
  }
}

/**
 * @param {string} destinationSlug
 * @returns {Promise<Array<{ slug: string, title: string, description: string | null, icon_name: string | null, position: number }>>}
 */
export async function getV3LandingCategories(destinationSlug) {
  if (!destinationSlug) return [];
  try {
    const supabase = createSupabaseServiceRoleClient();
    const { data, error } = await supabase
      .from('v3_landing_categories')
      .select('slug, title, description, icon_name, position')
      .eq('destination_slug', destinationSlug)
      .order('position', { ascending: true });

    if (error) return [];
    return data || [];
  } catch (e) {
    console.error('getV3LandingCategories:', e?.message || e);
    return [];
  }
}

/**
 * One top-pick tour per category for the first 6 categories (for landing "Popular now").
 * @param {string} destinationSlug
 * @returns {Promise<Array<{ product_id: string, title: string, tour_slug: string, category_slug: string, category_title: string, image_url: string | null, from_price: string | null }>>}
 */
export async function getV3LandingTopPicksFromCategories(destinationSlug) {
  if (!destinationSlug) return [];
  try {
    const supabase = createSupabaseServiceRoleClient();
    const [catRes, toursRes] = await Promise.all([
      supabase
        .from('v3_landing_categories')
        .select('slug, title')
        .eq('destination_slug', destinationSlug)
        .order('position', { ascending: true })
        .limit(6),
      supabase
        .from('v3_landing_category_tours')
        .select('product_id, title, tour_slug, category_slug, image_url, from_price, position')
        .eq('destination_slug', destinationSlug)
        .eq('is_top_pick', true)
        .order('position', { ascending: true }),
    ]);
    const categories = catRes.data || [];
    const tours = toursRes.data || [];
    const byCat = {};
    for (const t of tours) {
      if (!byCat[t.category_slug]) byCat[t.category_slug] = [];
      byCat[t.category_slug].push(t);
    }
    for (const slug of Object.keys(byCat)) {
      byCat[slug].sort((a, b) => (a.position ?? 0) - (b.position ?? 0));
    }
    const result = [];
    for (const cat of categories) {
      const arr = byCat[cat.slug];
      if (arr && arr.length) {
        const row = arr[0];
        const img = typeof row.image_url === 'string' && row.image_url.trim() ? row.image_url : null;
        result.push({
          product_id: row.product_id,
          title: row.title,
          tour_slug: row.tour_slug,
          category_slug: row.category_slug,
          category_title: cat.title,
          image_url: img,
          from_price: row.from_price ?? null,
        });
      }
    }
    return result;
  } catch (e) {
    console.error('getV3LandingTopPicksFromCategories:', e?.message || e);
    return [];
  }
}

/**
 * Load full landing data for a destination (destination + top picks + categories).
 * Top picks = one tour from each of the first 6 categories (from v3_landing_category_tours).
 * @param {string} destinationSlug
 */
export async function getV3LandingData(destinationSlug) {
  const [destination, topPicksFromCategories, categories] = await Promise.all([
    getV3LandingDestination(destinationSlug),
    getV3LandingTopPicksFromCategories(destinationSlug),
    getV3LandingCategories(destinationSlug),
  ]);
  return { destination, topPicks: topPicksFromCategories, categories };
}

/**
 * Category page content: tours (top picks + other) and subcategories from Supabase.
 * @param {string} destinationSlug
 * @param {string} categorySlug
 * @returns {Promise<{ topPicks: Array<{ productId: string, title: string, imageUrl?: string, fromPrice?: string }>, otherTours: Array<{ productId: string, title: string, imageUrl?: string, fromPrice?: string }>, subcategories: Array<{ slug: string, title: string, description: string, productIds: string[], faqs?: Array<{ question: string, answer: string }>, about?: string }>, about?: string, faqs?: Array<{ question: string, answer: string }> } | null>}
 */
export async function getV3LandingCategoryContent(destinationSlug, categorySlug) {
  if (!destinationSlug || !categorySlug) return null;
  try {
    const supabase = createSupabaseServiceRoleClient();
    const [toursRes, pageRes, subRes] = await Promise.all([
      supabase
        .from('v3_landing_category_tours')
        .select('product_id, title, tour_slug, image_url, from_price, position, is_top_pick')
        .eq('destination_slug', destinationSlug)
        .eq('category_slug', categorySlug)
        .order('position', { ascending: true }),
      supabase
        .from('v3_landing_category_pages')
        .select('hero_description, about, insider_tips, what_to_expect, who_is_this_for, highlights, faq_json, seo_meta_title, seo_meta_description, top_picks_heading, top_picks_subtext')
        .eq('destination_slug', destinationSlug)
        .eq('category_slug', categorySlug)
        .maybeSingle(),
      supabase
        .from('v3_landing_category_subcategories')
        .select('slug, title, description, product_ids, about, faq_json, position')
        .eq('destination_slug', destinationSlug)
        .eq('category_slug', categorySlug)
        .order('position', { ascending: true }),
    ]);

    const tours = toursRes.data || [];
    if (tours.length === 0) return null;

    const toTour = (row) => ({
      productId: row.product_id,
      title: row.title,
      tourSlug: row.tour_slug || undefined,
      imageUrl: row.image_url || undefined,
      fromPrice: row.from_price || undefined,
    });

    const topPicks = tours.filter((t) => t.is_top_pick).map(toTour);
    const otherTours = tours.filter((t) => !t.is_top_pick).map(toTour);
    if (topPicks.length === 0 && otherTours.length === 0) return null;

    const page = pageRes.data;
    const faqs = Array.isArray(page?.faq_json) ? page.faq_json : [];
    const insiderTips = Array.isArray(page?.insider_tips) ? page.insider_tips : [];
    const whatToExpect = Array.isArray(page?.what_to_expect) ? page.what_to_expect : [];
    const whoIsThisFor = Array.isArray(page?.who_is_this_for) ? page.who_is_this_for : [];
    const highlights = Array.isArray(page?.highlights) ? page.highlights : [];

    const subcategories = (subRes.data || []).map((s) => ({
      slug: s.slug,
      title: s.title,
      description: s.description || '',
      productIds: Array.isArray(s.product_ids) ? s.product_ids : [],
      about: s.about || undefined,
      faqs: Array.isArray(s.faq_json) ? s.faq_json : [],
    }));

    return {
      topPicks: topPicks.length > 0 ? topPicks : tours.slice(0, 4).map(toTour),
      otherTours: otherTours.length > 0 ? otherTours : tours.slice(4, 10).map(toTour),
      subcategories,
      heroDescription: page?.hero_description || undefined,
      about: page?.about || undefined,
      insiderTips,
      whatToExpect,
      whoIsThisFor,
      highlights,
      faqs,
      seoMetaTitle: page?.seo_meta_title || undefined,
      seoMetaDescription: page?.seo_meta_description || undefined,
      topPicksHeading: page?.top_picks_heading || undefined,
      topPicksSubtext: page?.top_picks_subtext || undefined,
    };
  } catch (e) {
    console.error('getV3LandingCategoryContent:', e?.message || e);
    return null;
  }
}

/**
 * Lightweight fetch of category page meta (for generateMetadata). Returns null if no row.
 * @param {string} destinationSlug
 * @param {string} categorySlug
 * @returns {Promise<{ seoMetaTitle?: string, seoMetaDescription?: string } | null>}
 */
export async function getV3LandingCategoryPageMeta(destinationSlug, categorySlug) {
  if (!destinationSlug || !categorySlug) return null;
  try {
    const supabase = createSupabaseServiceRoleClient();
    const { data, error } = await supabase
      .from('v3_landing_category_pages')
      .select('seo_meta_title, seo_meta_description')
      .eq('destination_slug', destinationSlug)
      .eq('category_slug', categorySlug)
      .maybeSingle();
    if (error || !data) return null;
    return {
      seoMetaTitle: data.seo_meta_title || undefined,
      seoMetaDescription: data.seo_meta_description || undefined,
    };
  } catch (e) {
    console.error('getV3LandingCategoryPageMeta:', e?.message || e);
    return null;
  }
}

/**
 * Single subcategory by slug; resolves tours from category_tours by product_ids.
 * @param {string} destinationSlug
 * @param {string} categorySlug
 * @param {string} subSlug
 * @returns {Promise<{ slug: string, title: string, description: string, productIds: string[], tours: Array<{ productId: string, title: string, imageUrl?: string, fromPrice?: string }>, about?: string, faqs?: Array<{ question: string, answer: string }> } | null>}
 */
export async function getV3LandingSubcategory(destinationSlug, categorySlug, subSlug) {
  if (!destinationSlug || !categorySlug || !subSlug) return null;
  try {
    const supabase = createSupabaseServiceRoleClient();
    const { data: sub, error: subErr } = await supabase
      .from('v3_landing_category_subcategories')
      .select('slug, title, description, product_ids, about, faq_json, why_book, what_to_expect, summary_paragraph')
      .eq('destination_slug', destinationSlug)
      .eq('category_slug', categorySlug)
      .eq('slug', subSlug)
      .maybeSingle();

    if (subErr || !sub) return null;

    const productIds = Array.isArray(sub.product_ids) ? sub.product_ids : [];
    if (productIds.length === 0) {
      return {
        slug: sub.slug,
        title: sub.title,
        description: sub.description || '',
        productIds: [],
        tours: [],
        about: sub.about || undefined,
        faqs: Array.isArray(sub.faq_json) ? sub.faq_json : [],
        whyBook: sub.why_book || undefined,
        whatToExpect: Array.isArray(sub.what_to_expect) ? sub.what_to_expect : [],
        summaryParagraph: sub.summary_paragraph || undefined,
      };
    }

    const { data: tourRows } = await supabase
      .from('v3_landing_category_tours')
      .select('product_id, title, tour_slug, image_url, from_price, rating, review_count')
      .eq('destination_slug', destinationSlug)
      .eq('category_slug', categorySlug)
      .in('product_id', productIds);

    const tourByProductId = new Map((tourRows || []).map((t) => [t.product_id, t]));
    const tours = productIds
      .map((id) => tourByProductId.get(id))
      .filter(Boolean)
      .map((t) => ({
        productId: t.product_id,
        title: t.title,
        tourSlug: t.tour_slug || undefined,
        imageUrl: t.image_url || undefined,
        fromPrice: t.from_price || undefined,
        rating: t.rating,
        reviewCount: t.review_count,
      }));

    return {
      slug: sub.slug,
      title: sub.title,
      description: sub.description || '',
      productIds,
      tours,
      about: sub.about || undefined,
      faqs: Array.isArray(sub.faq_json) ? sub.faq_json : [],
      whyBook: sub.why_book || undefined,
      whatToExpect: Array.isArray(sub.what_to_expect) ? sub.what_to_expect : [],
      summaryParagraph: sub.summary_paragraph || undefined,
    };
  } catch (e) {
    console.error('getV3LandingSubcategory:', e?.message || e);
    return null;
  }
}

/**
 * All (destination_slug, category_slug, slug) for subcategory static params.
 * @returns {Promise<Array<{ destinationSlug: string, categorySlug: string, subSlug: string }>>}
 */
export async function getV3LandingSubcategoryParams() {
  try {
    const supabase = createSupabaseServiceRoleClient();
    const { data, error } = await supabase
      .from('v3_landing_category_subcategories')
      .select('destination_slug, category_slug, slug');
    if (error || !data?.length) return [];
    return data.map((r) => ({
      destinationSlug: r.destination_slug,
      categorySlug: r.category_slug,
      subSlug: r.slug,
    }));
  } catch (e) {
    return [];
  }
}

/**
 * Tour by slug for explore tour detail page: /explore/[dest]/[category]/[tourSlug].
 * Includes optional SEO fields (seo_meta_title, seo_meta_description, seo_about, who_is_this_for, insider_tips, faq_json, highlights).
 * @param {string} destinationSlug
 * @param {string} categorySlug
 * @param {string} tourSlug
 * @returns {Promise<{ productId: string, title: string, tourSlug: string, imageUrl?: string, fromPrice?: string, rating?: number, reviewCount?: number, seoMetaTitle?: string, seoMetaDescription?: string, seoAbout?: string, whoIsThisFor?: string[], insiderTips?: string[], faqs?: Array<{ question: string, answer: string }>, highlights?: string[] } | null>}
 */
export async function getV3LandingTourBySlug(destinationSlug, categorySlug, tourSlug) {
  if (!destinationSlug || !categorySlug || !tourSlug) return null;
  try {
    const supabase = createSupabaseServiceRoleClient();
    const { data, error } = await supabase
      .from('v3_landing_category_tours')
      .select('product_id, title, tour_slug, image_url, from_price, rating, review_count, seo_meta_title, seo_meta_description, seo_about, who_is_this_for, insider_tips, faq_json, highlights, why_we_recommend')
      .eq('destination_slug', destinationSlug)
      .eq('category_slug', categorySlug)
      .eq('tour_slug', tourSlug)
      .maybeSingle();
    if (error || !data) return null;
    const faqRaw = data.faq_json;
    const faqs = Array.isArray(faqRaw)
      ? faqRaw
          .map((item) => {
            const q = item?.question ?? item?.q;
            const a = item?.answer ?? item?.a;
            return typeof q === 'string' && typeof a === 'string' ? { question: q, answer: a } : null;
          })
          .filter(Boolean)
      : undefined;
    const whoIsThisFor = Array.isArray(data.who_is_this_for) ? data.who_is_this_for.filter((s) => typeof s === 'string') : undefined;
    const insiderTips = Array.isArray(data.insider_tips) ? data.insider_tips.filter((s) => typeof s === 'string') : undefined;
    const highlights = Array.isArray(data.highlights) ? data.highlights.filter((s) => typeof s === 'string') : undefined;
    return {
      productId: data.product_id,
      title: data.title,
      tourSlug: data.tour_slug,
      imageUrl: data.image_url || undefined,
      fromPrice: data.from_price || undefined,
      rating: data.rating != null ? Number(data.rating) : undefined,
      reviewCount: data.review_count != null ? Number(data.review_count) : undefined,
      seoMetaTitle: data.seo_meta_title || undefined,
      seoMetaDescription: data.seo_meta_description || undefined,
      seoAbout: data.seo_about || undefined,
      whoIsThisFor: whoIsThisFor?.length ? whoIsThisFor : undefined,
      insiderTips: insiderTips?.length ? insiderTips : undefined,
      faqs: faqs?.length ? faqs : undefined,
      highlights: highlights?.length ? highlights : undefined,
      whyWeRecommend: data.why_we_recommend && data.why_we_recommend.trim() ? data.why_we_recommend.trim() : undefined,
    };
  } catch (e) {
    console.error('getV3LandingTourBySlug:', e?.message || e);
    return null;
  }
}

/**
 * Extract first image URL from Viator payload.images (for similar-tours cards).
 */
function getFirstImageUrlFromPayload(payload) {
  const images = payload?.images;
  if (!Array.isArray(images) || images.length === 0) return null;
  const img = images.find((i) => i.isCover) ?? images[0];
  if (!img?.variants?.length) return img?.url ?? img?.imageUrl ?? null;
  const withUrl = img.variants.filter((v) => typeof v?.url === 'string');
  if (withUrl.length === 0) return null;
  const best = withUrl.reduce((a, b) => {
    const area = (v) => (v.width || 0) * (v.height || 0);
    return area(b) > area(a) ? b : a;
  });
  return best.url;
}

/**
 * Full Viator product from viator_products table (v3 explore only).
 * Used by explore tour detail page and SEO script so itinerary, inclusions, exclusions come from DB.
 * @param {string} productCode - Viator product_code (e.g. from v3_landing_category_tours.product_id)
 * @returns {Promise<object | null>} Full Viator product object (payload) or null if not in DB
 */
export async function getV3ViatorProduct(productCode) {
  if (!productCode) return null;
  try {
    const supabase = createSupabaseServiceRoleClient();
    const { data, error } = await supabase
      .from('viator_products')
      .select('payload')
      .eq('product_code', productCode)
      .maybeSingle();
    if (error || !data?.payload) return null;
    return data.payload;
  } catch (e) {
    console.error('getV3ViatorProduct:', e?.message || e);
    return null;
  }
}

/**
 * Fetch image (and optional price/rating) for multiple products from viator_products (for similar tours, 100% DB).
 * @param {string[]} productCodes
 * @returns {Promise<Map<string, { imageUrl?: string, fromPrice?: string, rating?: number, reviewCount?: number }>>}
 */
export async function getV3ViatorProductSummaries(productCodes) {
  if (!Array.isArray(productCodes) || productCodes.length === 0) return new Map();
  try {
    const supabase = createSupabaseServiceRoleClient();
    const { data: rows, error } = await supabase
      .from('viator_products')
      .select('product_code, payload')
      .in('product_code', productCodes);
    if (error || !rows?.length) return new Map();
    const map = new Map();
    for (const row of rows) {
      const code = row.product_code;
      const p = row.payload;
      const imageUrl = getFirstImageUrlFromPayload(p);
      const pricing = p?.pricingInfo ?? p?.pricing;
      let fromPrice;
      const num = pricing?.priceFrom ?? pricing?.fromPrice ?? pricing?.recommendedRetailPrice ?? pricing?.minPrice;
      if (typeof num === 'number') fromPrice = `Price from $${Math.round(num)}`;
      const rating = p?.reviews?.combinedAverageRating ?? p?.reviews?.averageRating;
      const reviewCount = p?.reviews?.totalReviews;
      map.set(code, {
        imageUrl: imageUrl || undefined,
        fromPrice: fromPrice || undefined,
        rating: typeof rating === 'number' ? rating : undefined,
        reviewCount: typeof reviewCount === 'number' ? reviewCount : undefined,
      });
    }
    return map;
  } catch (e) {
    console.error('getV3ViatorProductSummaries:', e?.message || e);
    return new Map();
  }
}

/**
 * All (destination_slug, category_slug, tour_slug) for explore tour static params.
 * @returns {Promise<Array<{ destinationSlug: string, categorySlug: string, subSlug: string }>>}
 */
export async function getV3LandingTourParams() {
  try {
    const supabase = createSupabaseServiceRoleClient();
    const { data, error } = await supabase
      .from('v3_landing_category_tours')
      .select('destination_slug, category_slug, tour_slug')
      .not('tour_slug', 'is', null);
    if (error || !data?.length) return [];
    return data.map((r) => ({
      destinationSlug: r.destination_slug,
      categorySlug: r.category_slug,
      subSlug: r.tour_slug,
    }));
  } catch (e) {
    return [];
  }
}

/**
 * All tours for a destination (aggregate across categories) for "All tours" listing page.
 * @param {string} destinationSlug
 * @returns {Promise<{ tours: Array<{ productId: string, title: string, tourSlug?: string, imageUrl?: string, fromPrice?: string, rating?: number, reviewCount?: number, categorySlug: string, categoryTitle: string }>, categories: Array<{ slug: string, title: string, description?: string }> } | null>}
 */
export async function getV3LandingAllToursForDestination(destinationSlug) {
  if (!destinationSlug) return null;
  try {
    const supabase = createSupabaseServiceRoleClient();
    const [toursRes, categoriesRes] = await Promise.all([
      supabase
        .from('v3_landing_category_tours')
        .select('product_id, title, tour_slug, image_url, from_price, rating, review_count, category_slug')
        .eq('destination_slug', destinationSlug)
        .order('category_slug', { ascending: true })
        .order('position', { ascending: true }),
      supabase
        .from('v3_landing_categories')
        .select('slug, title, description')
        .eq('destination_slug', destinationSlug)
        .order('position', { ascending: true }),
    ]);
    const tourRows = toursRes.data || [];
    const categoryRows = categoriesRes.data || [];
    if (tourRows.length === 0) return null;

    const categoryBySlug = new Map(categoryRows.map((c) => [c.slug, { slug: c.slug, title: c.title, description: c.description || undefined }]));
    const categories = categoryRows.map((c) => ({ slug: c.slug, title: c.title, description: c.description || undefined }));

    const tours = tourRows.map((row) => ({
      productId: row.product_id,
      title: row.title,
      tourSlug: row.tour_slug || undefined,
      imageUrl: row.image_url ?? null,
      fromPrice: row.from_price ?? null,
      rating: row.rating,
      reviewCount: row.review_count,
      categorySlug: row.category_slug,
      categoryTitle: categoryBySlug.get(row.category_slug)?.title || row.category_slug,
    }));

    return { tours, categories };
  } catch (e) {
    console.error('getV3LandingAllToursForDestination:', e?.message || e);
    return null;
  }
}
