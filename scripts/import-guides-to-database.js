import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables
dotenv.config({ path: path.join(__dirname, '../.env.local') });

// Import generated guides - check both possible files
const geminiOutputPath = path.join(__dirname, '../generated-guides-gemini-output.js');
const batchOutputPath = path.join(__dirname, '../generated-guides-batch-output.js');

let generatedGuidesPath = null;
if (fs.existsSync(batchOutputPath)) {
  generatedGuidesPath = batchOutputPath;
  console.log('📁 Found: generated-guides-batch-output.js');
} else if (fs.existsSync(geminiOutputPath)) {
  generatedGuidesPath = geminiOutputPath;
  console.log('📁 Found: generated-guides-gemini-output.js');
} else {
  console.error('❌ No generated guides file found.');
  console.error('   Looking for: generated-guides-batch-output.js or generated-guides-gemini-output.js');
  process.exit(1);
}

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error('❌ Missing Supabase environment variables');
  console.error('Required: NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

// Function to load generated guides
async function loadGeneratedGuides() {
  // Convert Windows path to file:// URL format
  const fileUrl = generatedGuidesPath.replace(/\\/g, '/');
  const fullPath = path.isAbsolute(fileUrl) ? fileUrl : path.resolve(fileUrl);
  const moduleUrl = `file:///${fullPath.replace(/\\/g, '/').replace(/^\/+/, '')}`;
  
  try {
    // Try to import as ES module
    const guidesModule = await import(moduleUrl + `?t=${Date.now()}`);
    if (guidesModule.generatedGuides) {
      return guidesModule.generatedGuides;
    }
    throw new Error('generatedGuides export not found');
  } catch (importError) {
    // Fallback: parse file content using vm module for safer execution
    console.warn('⚠️  Could not import as module, trying to parse with vm...');
    
    const generatedContent = fs.readFileSync(generatedGuidesPath, 'utf8');
    const guidesMatch = generatedContent.match(/export const generatedGuides = ([\s\S]*?);/);
    if (!guidesMatch) {
      throw new Error('Could not find generatedGuides export in file');
    }
    
    try {
      const vm = await import('vm');
      const context = vm.createContext({});
      const code = `const generatedGuides = ${guidesMatch[1]}; generatedGuides;`;
      const script = new vm.Script(code);
      return script.runInContext(context);
    } catch (vmError) {
      console.error('❌ Error parsing with vm:', vmError.message);
      throw new Error(`Could not parse generated guides: ${vmError.message}`);
    }
  }
}

// Load destination data to get image URLs
const destinationsDataPath = path.join(__dirname, '../src/data/destinationsData.js');
const generatedFullContentPath = path.join(__dirname, '../generated-destination-full-content.json');
const generatedSeoContentPath = path.join(__dirname, '../generated-destination-seo-content.json');

let destinationImageMap = {};

try {
  // Try to load from destinationsData.js
  if (fs.existsSync(destinationsDataPath)) {
    const destinationsContent = fs.readFileSync(destinationsDataPath, 'utf8');
    const destinationsMatch = destinationsContent.match(/export const destinations = \[([\s\S]*?)\];/);
    if (destinationsMatch) {
      const destinations = eval(`[${destinationsMatch[1]}]`);
      destinations.forEach(dest => {
        if (dest.imageUrl) {
          destinationImageMap[dest.id] = dest.imageUrl;
        }
      });
    }
  }
  
  // Also check generated content files
  if (fs.existsSync(generatedFullContentPath)) {
    const fullContent = JSON.parse(fs.readFileSync(generatedFullContentPath, 'utf8'));
    Object.entries(fullContent).forEach(([id, data]) => {
      if (data.imageUrl && !destinationImageMap[id]) {
        destinationImageMap[id] = data.imageUrl;
      }
    });
  }
  
  if (fs.existsSync(generatedSeoContentPath)) {
    const seoContent = JSON.parse(fs.readFileSync(generatedSeoContentPath, 'utf8'));
    Object.entries(seoContent).forEach(([id, data]) => {
      if (data.ogImage && !destinationImageMap[id]) {
        destinationImageMap[id] = data.ogImage;
      }
    });
  }
} catch (error) {
  console.warn('⚠️  Could not load destination image URLs:', error.message);
}

// Convert slug to readable category name
function slugToCategoryName(slug) {
  return slug
    .split('-')
    .map(word => {
      // Capitalize first letter
      return word.charAt(0).toUpperCase() + word.slice(1);
    })
    .join(' ')
    .replace(/\bAnd\b/g, '&')
    .replace(/\bTours\b/g, 'Tours')
    .replace(/\bTour\b/g, 'Tour');
}

// Extract category name from title
function extractCategoryNameFromTitle(title, destinationId) {
  if (!title) return null;
  
  // Pattern: "Destination Category Name: Subtitle" or "Destination, State Category Name: Subtitle"
  // e.g., "Boston Freedom Trail Tours: Your Guide to Revolutionary History"
  // e.g., "Portland, ME Food & Brewery Tours: Taste Maine's Best"
  
  // Split by colon to get the main part
  const mainPart = title.split(':')[0].trim();
  
  // Remove destination name patterns
  // 1. "Destination, State " (e.g., "Portland, ME ")
  let categoryPart = mainPart.replace(/^[^,]+,\s*[A-Z]{2}\s+/, '');
  
  // 2. "Destination " (e.g., "Boston ")
  const destinationName = destinationId.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
  if (categoryPart.toLowerCase().startsWith(destinationName.toLowerCase() + ' ')) {
    categoryPart = categoryPart.substring(destinationName.length + 1).trim();
  }
  
  // If we still have something, return it
  if (categoryPart && categoryPart.length > 0) {
    return categoryPart;
  }
  
  return null;
}

// Convert guide object to database format
function convertGuideToDBFormat(destinationId, categorySlug, guide) {
  // Fix heroImage: if it's "null" string or null, use destination image URL
  let heroImage = guide.heroImage || guide.hero_image;
  if (heroImage === "null" || heroImage === null || heroImage === undefined) {
    heroImage = destinationImageMap[destinationId] || null;
  }
  
  // Get category name - try multiple sources
  let categoryName = guide.categoryName || guide.category_name;
  if (!categoryName) {
    // Try to extract from title
    categoryName = extractCategoryNameFromTitle(guide.title, destinationId);
    
    // Fallback: convert slug to readable name
    if (!categoryName) {
      categoryName = slugToCategoryName(categorySlug);
    }
  }
  
  return {
    destination_id: destinationId,
    category_slug: categorySlug,
    category_name: categoryName,
    title: guide.title,
    subtitle: guide.subtitle,
    hero_image: heroImage,
    stats: guide.stats || null,
    introduction: guide.introduction,
    seo: guide.seo || null,
    why_choose: guide.whyChoose || guide.why_choose || null,
    tour_types: guide.tourTypes || guide.tour_types || null,
    what_to_expect: guide.whatToExpect || guide.what_to_expect || null,
    expert_tips: guide.expertTips || guide.expert_tips || [],
    faqs: guide.faqs || [],
  };
}

// Main import function
async function importGuides() {
  console.log('\n🚀 IMPORTING GUIDES TO DATABASE\n');
  console.log('━'.repeat(60));
  
  // Load generated guides
  console.log('📖 Loading generated guides...');
  const generatedGuides = await loadGeneratedGuides();
  console.log(`✅ Loaded guides for ${Object.keys(generatedGuides).length} destination(s)\n`);
  
  let totalImported = 0;
  let totalErrors = 0;
  
  for (const [destinationId, categories] of Object.entries(generatedGuides)) {
    console.log(`\n📦 Processing ${destinationId}...`);
    
    for (const [categorySlug, guide] of Object.entries(categories)) {
      try {
        const dbGuide = convertGuideToDBFormat(destinationId, categorySlug, guide);
        
        // Use upsert to handle both insert and update
        const { data, error } = await supabase
          .from('category_guides')
          .upsert(dbGuide, {
            onConflict: 'destination_id,category_slug',
          })
          .select();
        
        if (error) {
          console.error(`   ❌ Error importing ${categorySlug}:`, error.message);
          totalErrors++;
        } else {
          console.log(`   ✅ Imported: ${categorySlug}`);
          totalImported++;
        }
        
        // Small delay to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 100));
        
      } catch (error) {
        console.error(`   ❌ Error processing ${categorySlug}:`, error.message);
        totalErrors++;
      }
    }
  }
  
  console.log('\n━'.repeat(60));
  console.log(`\n✅ IMPORT COMPLETE!`);
  console.log(`📊 Total imported: ${totalImported}`);
  console.log(`❌ Total errors: ${totalErrors}`);
}

// Run the import
importGuides().catch(error => {
  console.error('\n❌ FATAL ERROR:', error);
  process.exit(1);
});
