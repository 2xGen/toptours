/**
 * Add Gouda image and generate guides for Zakynthos
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load configuration
dotenv.config({ path: path.join(__dirname, '../.env.local') });

// Initialize Gemini
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
if (!GEMINI_API_KEY) {
  console.error('❌ Missing GEMINI_API_KEY in .env.local');
  process.exit(1);
}
const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash-lite' });

// Initialize Supabase
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error('❌ Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

// Load generated content
const fullContentPath = path.join(__dirname, '../generated-destination-full-content.json');
const fullContentData = JSON.parse(fs.readFileSync(fullContentPath, 'utf8'));

console.log('\n🚀 Adding Gouda image and generating Zakynthos guides...\n');
console.log('━'.repeat(80));

// Step 1: Add Gouda image
console.log('\n📍 Step 1: Adding Gouda image...\n');

const goudaImageUrl = 'https://ouqeoizufbofdqbuiwvx.supabase.co/storage/v1/object/public/overige%20destinations/gouda.png';

if (fullContentData.gouda) {
  fullContentData.gouda.imageUrl = goudaImageUrl;
  console.log(`✅ Added image to Gouda: ${goudaImageUrl}`);
  
  // Update guides if they exist
  const { count } = await supabase
    .from('category_guides')
    .select('*', { count: 'exact', head: true })
    .eq('destination_id', 'gouda');
  
  if (count > 0) {
    await supabase
      .from('category_guides')
      .update({ hero_image: goudaImageUrl })
      .eq('destination_id', 'gouda');
    console.log(`✅ Updated ${count} guide(s) with hero image`);
  }
} else {
  console.log('⚠️  Gouda not found in generated content');
}

// Step 2: Generate guides for Zakynthos
console.log('\n📍 Step 2: Generating guides for Zakynthos...\n');

const zakynthos = fullContentData.zakynthos;

if (!zakynthos) {
  console.log('❌ Zakynthos not found in generated content');
  process.exit(1);
}

if (!zakynthos.tourCategories || zakynthos.tourCategories.length === 0) {
  console.log('❌ Zakynthos has no tour categories');
  process.exit(1);
}

// Check existing guides
const { data: existingGuides } = await supabase
  .from('category_guides')
  .select('category_slug')
  .eq('destination_id', 'zakynthos');

const existingSlugs = new Set((existingGuides || []).map(g => g.category_slug));

// Generate category slug
function generateCategorySlug(categoryName) {
  return categoryName
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

// Generate guide content
async function generateGuideContent(destinationName, categoryName, destinationData) {
  const prompt = `You are a travel content expert. Generate a comprehensive travel guide for "${categoryName}" in ${destinationName}.

Destination context:
- Name: ${destinationName}
- Country: ${destinationData.country || 'Unknown'}
- Region: ${destinationData.region || 'Unknown'}
${destinationData.briefDescription ? `- Description: ${destinationData.briefDescription}` : ''}

Generate a detailed travel guide in JSON format with the following structure:
{
  "title": "A compelling, SEO-friendly title (60-70 chars)",
  "subtitle": "A brief, engaging subtitle (120-160 chars)",
  "introduction": "A comprehensive introduction paragraph (200-300 words) about ${categoryName} in ${destinationName}",
  "stats": {
    "averageDuration": "X hours/days",
    "bestTime": "Time of day/year",
    "difficulty": "Easy/Moderate/Challenging",
    "priceRange": "$-$$$"
  },
  "whyChoose": [
    "Reason 1 (one sentence)",
    "Reason 2 (one sentence)",
    "Reason 3 (one sentence)",
    "Reason 4 (one sentence)"
  ],
  "tourTypes": [
    "Type 1",
    "Type 2",
    "Type 3"
  ],
  "whatToExpect": {
    "overview": "What travelers can expect (2-3 sentences)",
    "highlights": ["Highlight 1", "Highlight 2", "Highlight 3"],
    "tips": ["Tip 1", "Tip 2", "Tip 3"]
  },
  "expertTips": [
    "Expert tip 1 (one sentence)",
    "Expert tip 2 (one sentence)",
    "Expert tip 3 (one sentence)"
  ],
  "faqs": [
    {
      "question": "Question 1",
      "answer": "Answer 1 (2-3 sentences)"
    },
    {
      "question": "Question 2",
      "answer": "Answer 2 (2-3 sentences)"
    },
    {
      "question": "Question 3",
      "answer": "Answer 3 (2-3 sentences)"
    }
  ],
  "seo": {
    "title": "SEO title (50-60 chars)",
    "description": "SEO description (150-160 chars)",
    "keywords": "keyword1, keyword2, keyword3"
  }
}

Make the content engaging, informative, and optimized for SEO. Focus on practical information that helps travelers plan their visit.`;

  try {
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    // Extract JSON from response
    let jsonText = text.trim();
    if (jsonText.startsWith('```json')) {
      jsonText = jsonText.replace(/^```json\n?/, '').replace(/\n?```$/, '');
    } else if (jsonText.startsWith('```')) {
      jsonText = jsonText.replace(/^```\n?/, '').replace(/\n?```$/, '');
    }
    
    return JSON.parse(jsonText);
  } catch (error) {
    console.error(`Error generating guide for ${categoryName}:`, error);
    throw error;
  }
}

// Save guide to database
async function saveGuideToDatabase(destinationId, categorySlug, categoryName, guideData, imageUrl) {
  const guideRecord = {
    destination_id: destinationId,
    category_slug: categorySlug,
    category_name: categoryName,
    title: guideData.title || '',
    subtitle: guideData.subtitle || '',
    hero_image: imageUrl || null,
    stats: guideData.stats || null,
    introduction: guideData.introduction || '',
    seo: guideData.seo || null,
    why_choose: guideData.whyChoose || null,
    tour_types: guideData.tourTypes || null,
    what_to_expect: guideData.whatToExpect || null,
    expert_tips: guideData.expertTips || [],
    faqs: guideData.faqs || [],
  };

  const { data, error } = await supabase
    .from('category_guides')
    .upsert(guideRecord, { onConflict: 'destination_id,category_slug' });

  if (error) {
    console.error(`Error saving guide ${categorySlug}:`, error);
    throw error;
  }

  return data;
}

// Process Zakynthos categories
let generated = 0;
let skipped = 0;

for (const category of zakynthos.tourCategories) {
  const categoryObj = typeof category === 'object' ? category : { name: category };
  const categoryName = categoryObj.name;
  const categorySlug = generateCategorySlug(categoryName);

  // Skip if guide already exists
  if (existingSlugs.has(categorySlug)) {
    console.log(`   ⏭️  Skipping ${categoryName} - guide already exists`);
    skipped++;
    continue;
  }

  // Skip if hasGuide is false
  if (categoryObj.hasGuide === false) {
    console.log(`   ⏭️  Skipping ${categoryName} - hasGuide: false`);
    skipped++;
    continue;
  }

  // Only generate first 6 categories
  if (generated >= 6) {
    console.log(`   ⏭️  Skipping ${categoryName} - already generated 6 guides`);
    skipped++;
    continue;
  }

  try {
    console.log(`   🔄 Generating guide for: ${categoryName}...`);
    
    // Generate guide content
    const guideData = await generateGuideContent(
      zakynthos.destinationName,
      categoryName,
      zakynthos
    );

    // Save to database
    await saveGuideToDatabase(
      'zakynthos',
      categorySlug,
      categoryName,
      guideData,
      zakynthos.imageUrl
    );

    console.log(`   ✅ Generated guide: ${categoryName}`);
    generated++;

    // Rate limiting delay
    await new Promise(resolve => setTimeout(resolve, 200));
  } catch (error) {
    console.error(`   ❌ Error generating guide for ${categoryName}:`, error.message);
  }
}

// Save updated content
fs.writeFileSync(fullContentPath, JSON.stringify(fullContentData, null, 2));

console.log('\n' + '━'.repeat(80));
console.log(`\n📊 SUMMARY:`);
console.log(`   ✅ Gouda: Image added`);
console.log(`   ✅ Zakynthos: ${generated} guides generated, ${skipped} skipped`);
console.log(`\n💾 Saved to: ${fullContentPath}\n`);

