import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables
dotenv.config({ path: path.join(__dirname, '../.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceRoleKey) {
  console.error('❌ Missing Supabase environment variables');
  console.error('   Required: NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceRoleKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

const baseUrl = 'https://toptours.ai';
/** Sitemap lastmod date for search engines (update when you want to signal a fresh sitemap) */
const SITEMAP_LASTMOD = '2026-02-11';

async function generateGuidesSitemap() {
  console.log('🚀 Generating guides sitemap from database...\n');

  try {
    // Fetch all guides from database with pagination (Supabase has 1000 row limit per query)
    console.log('📊 Fetching all category guides from database...');
    
    let allGuides = [];
    let page = 0;
    const pageSize = 1000;
    let hasMore = true;

    while (hasMore) {
      const from = page * pageSize;
      const to = from + pageSize - 1;
      
      console.log(`   Fetching page ${page + 1} (rows ${from + 1}-${to + 1})...`);
      
      const { data: guides, error, count } = await supabase
        .from('category_guides')
        .select('destination_id, category_slug, updated_at', { count: 'exact' })
        .order('destination_id', { ascending: true })
        .order('category_slug', { ascending: true })
        .range(from, to);

      if (error) {
        console.error('❌ Error fetching guides:', error);
        process.exit(1);
      }

      if (!guides || guides.length === 0) {
        hasMore = false;
        break;
      }

      allGuides = allGuides.concat(guides);
      console.log(`   ✅ Fetched ${guides.length} guides (total: ${allGuides.length})`);

      // Check if there are more pages
      if (guides.length < pageSize) {
        hasMore = false;
      } else {
        page++;
      }
    }

    if (allGuides.length === 0) {
      console.warn('⚠️  No guides found in database');
      return;
    }

    console.log(`\n✅ Found ${allGuides.length} total guides in database\n`);

    // Generate XML
    const guideUrls = allGuides.map((guide) => {
      return `  <url>
    <loc>${baseUrl}/destinations/${guide.destination_id}/guides/${guide.category_slug}</loc>
    <lastmod>${SITEMAP_LASTMOD}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>`;
    });

    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${guideUrls.join('\n')}
</urlset>`;

    // Write to public folder
    const outputPath = path.join(__dirname, '../public/sitemap-guides.xml');
    fs.writeFileSync(outputPath, xml, 'utf8');

    console.log(`✅ Generated sitemap-guides.xml`);
    console.log(`   📁 Location: ${outputPath}`);
    console.log(`   📊 Total URLs: ${allGuides.length}`);
    console.log(`\n✨ Guides sitemap generated successfully!`);
  } catch (error) {
    console.error('❌ Error generating guides sitemap:', error);
    process.exit(1);
  }
}

// Run the script
generateGuidesSitemap();

