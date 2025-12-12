/**
 * Generate guides for specific destinations (Buffalo, Park City, St. Louis)
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

// Destinations to process
const destinationSlugs = ['buffalo', 'park-city', 'st-louis'];

console.log('\n🚀 Generating guides for specific destinations...\n');
console.log('━'.repeat(60));

// Check existing guides in database
async function getExistingGuides(destinationId) {
  const { data, error } = await supabase
    .from('category_guides')
    .select('category_slug')
    .eq('destination_id', destinationId);
  
  if (error) {
    console.error(`Error fetching existing guides for ${destinationId}:`, error);
    return new Set();
  }
  
  return new Set((data || []).map(g => g.category_slug));
}

// Generate category slug from category name
function generateCategorySlug(categoryName) {
  return categoryName
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

// Generate guide content using Gemini
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
    
    // Extract JSON from response (handle markdown code blocks)
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

// Process a single destination
async function processDestination(slug) {
  const destination = fullContentData[slug];
  
  if (!destination) {
    console.log(`\n❌ ${slug}: NOT FOUND in generated content`);
    return;
  }

  console.log(`\n📍 Processing: ${destination.destinationName} (${slug})`);
  console.log(`   Image: ${destination.imageUrl || 'NONE'}`);
  
  if (!destination.tourCategories || destination.tourCategories.length === 0) {
    console.log(`   ⚠️  No tour categories defined`);
    return;
  }

  // Get existing guides
  const existingGuides = await getExistingGuides(slug);
  console.log(`   📚 Existing guides: ${existingGuides.size}`);

  // Process each category
  let generated = 0;
  let skipped = 0;

  for (const category of destination.tourCategories) {
    const categoryObj = typeof category === 'object' ? category : { name: category };
    const categoryName = categoryObj.name;
    const categorySlug = generateCategorySlug(categoryName);

    // Skip if guide already exists
    if (existingGuides.has(categorySlug)) {
      console.log(`   ⏭️  Skipping ${categoryName} - guide already exists`);
      skipped++;
      continue;
    }

    // Skip if hasGuide is false (optional categories)
    if (categoryObj.hasGuide === false) {
      console.log(`   ⏭️  Skipping ${categoryName} - hasGuide: false`);
      skipped++;
      continue;
    }

    try {
      console.log(`   🔄 Generating guide for: ${categoryName}...`);
      
      // Generate guide content
      const guideData = await generateGuideContent(
        destination.destinationName,
        categoryName,
        destination
      );

      // Save to database
      await saveGuideToDatabase(
        slug,
        categorySlug,
        categoryName,
        guideData,
        destination.imageUrl
      );

      console.log(`   ✅ Generated guide: ${categoryName}`);
      generated++;

      // Rate limiting delay
      await new Promise(resolve => setTimeout(resolve, 200));
    } catch (error) {
      console.error(`   ❌ Error generating guide for ${categoryName}:`, error.message);
    }
  }

  console.log(`   📊 Summary: ${generated} generated, ${skipped} skipped`);
}

// Main execution
async function main() {
  for (const slug of destinationSlugs) {
    await processDestination(slug);
  }

  console.log('\n' + '━'.repeat(60));
  console.log('\n✅ Guide generation complete!\n');
}

main().catch(console.error);

