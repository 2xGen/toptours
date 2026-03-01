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
const SITEMAP_LASTMOD = '2026-03-01';

async function generateGuidesSitemap() {
  console.log('🚀 Generating guides sitemap from database (category_guides + tag_guide_content)...\n');

  try {
    const pageSize = 1000;
    const allUrlEntries = []; // { url: string } to dedupe and output

    // 1. Fetch all category_guides (destination_id, category_slug)
    console.log('📊 Fetching category_guides...');
    let from = 0;
    let hasMore = true;
    while (hasMore) {
      const { data: guides, error } = await supabase
        .from('category_guides')
        .select('destination_id, category_slug')
        .order('destination_id', { ascending: true })
        .order('category_slug', { ascending: true })
        .range(from, from + pageSize - 1);

      if (error) {
        console.error('❌ Error fetching category_guides:', error);
        process.exit(1);
      }
      if (!guides || guides.length === 0) break;
      guides.forEach((g) => {
        if (g.destination_id && g.category_slug) {
          allUrlEntries.push(`${baseUrl}/destinations/${g.destination_id}/guides/${g.category_slug}`);
        }
      });
      from += pageSize;
      hasMore = guides.length === pageSize;
    }
    const categoryCount = allUrlEntries.length;
    console.log(`   ✅ Category guides: ${categoryCount} URLs`);

    // 2. Fetch all tag_guide_content (destination_id, tag_slug)
    console.log('📊 Fetching tag_guide_content...');
    from = 0;
    hasMore = true;
    const seen = new Set(allUrlEntries);
    let tagCount = 0;
    while (hasMore) {
      const { data: rows, error } = await supabase
        .from('tag_guide_content')
        .select('destination_id, tag_slug')
        .order('destination_id', { ascending: true })
        .range(from, from + pageSize - 1);

      if (error) {
        console.warn('⚠️  Error fetching tag_guide_content (optional):', error.message);
        break;
      }
      if (!rows || rows.length === 0) break;
      rows.forEach((r) => {
        if (r.destination_id && r.tag_slug) {
          const url = `${baseUrl}/destinations/${r.destination_id}/guides/${r.tag_slug}`;
          if (!seen.has(url)) {
            seen.add(url);
            allUrlEntries.push(url);
            tagCount++;
          }
        }
      });
      from += pageSize;
      hasMore = rows.length === pageSize;
    }
    console.log(`   ✅ Tag guides (new URLs): ${tagCount}`);

    const total = allUrlEntries.length;
    if (total === 0) {
      console.warn('⚠️  No guide URLs found');
      return;
    }

    console.log(`\n✅ Total guide URLs: ${total} (category: ${categoryCount}, tag: ${tagCount})\n`);

    // Generate XML (max 50,000 per sitemap; split if needed)
    const MAX_PER_FILE = 50000;
    const chunks = [];
    for (let i = 0; i < allUrlEntries.length; i += MAX_PER_FILE) {
      chunks.push(allUrlEntries.slice(i, i + MAX_PER_FILE));
    }

    const writtenFiles = [];
    for (let c = 0; c < chunks.length; c++) {
      const urls = chunks[c];
      const guideUrlsXml = urls
        .map(
          (url) => `  <url>
    <loc>${url}</loc>
    <lastmod>${SITEMAP_LASTMOD}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>`
        )
        .join('\n');

      const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${guideUrlsXml}
</urlset>`;

      const filename = chunks.length > 1 ? `sitemap-guides-${c + 1}.xml` : 'sitemap-guides.xml';
      const outputPath = path.join(__dirname, '../public', filename);
      fs.writeFileSync(outputPath, xml, 'utf8');
      writtenFiles.push({ filename, count: urls.length });
      console.log(`✅ Wrote ${filename} (${urls.length} URLs)`);
    }

    // If split into multiple files, write sitemap-guides.xml as an index so GSC URL still works
    if (chunks.length > 1) {
      const indexXml = `<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${writtenFiles.map((f) => `  <sitemap>
    <loc>${baseUrl}/${f.filename}</loc>
    <lastmod>${SITEMAP_LASTMOD}</lastmod>
  </sitemap>`).join('\n')}
</sitemapindex>`;
      const indexPath = path.join(__dirname, '../public/sitemap-guides.xml');
      fs.writeFileSync(indexPath, indexXml, 'utf8');
      console.log('✅ Wrote sitemap-guides.xml (index of part files)');
    }

    console.log(`\n✨ Guides sitemap generated successfully!`);
    console.log('   Keep https://toptours.ai/sitemap-guides.xml submitted in GSC.');
  } catch (error) {
    console.error('❌ Error generating guides sitemap:', error);
    process.exit(1);
  }
}

// Run the script
generateGuidesSitemap();

