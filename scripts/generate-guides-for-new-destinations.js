/**
 * Generate guides for newly added destinations (Queensland and Cali)
 * This is a quick script to generate guides for destinations that were just added
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '../.env.local') });

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!GEMINI_API_KEY || !SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error('❌ Missing environment variables');
  process.exit(1);
}

const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash-lite' });
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

// Load generated content
const fullContentPath = path.join(__dirname, '../generated-destination-full-content.json');
const fullContentData = JSON.parse(fs.readFileSync(fullContentPath, 'utf8'));

// Destinations to process
const destinationsToProcess = ['queensland', 'cali'];

// Helper to generate category slug
function generateCategorySlug(categoryName) {
  return categoryName
    .toLowerCase()
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .replace(/&/g, 'and')
    .replace(/'/g, '')
    .replace(/\./g, '')
    .replace(/\s+/g, '-');
}

// Check existing guides
async function getExistingGuides(destinationId) {
  const { data } = await supabase
    .from('category_guides')
    .select('category_slug')
    .eq('destination_id', destinationId);
  return new Set((data || []).map(g => g.category_slug));
}

// Generate guide (same as batch script)
async function generateGuide(destination, category) {
  const categoryName = typeof category === 'string' ? category : category.name;
  
  const prompt = `You are a professional travel writer creating a comprehensive, SEO-optimized category guide for TopTours.ai, an aggregation platform that helps travelers discover and compare tours and activities from multiple operators (like Viator, GetYourGuide, etc.). TopTours.ai does NOT operate tours itself.

Create a detailed guide for "${categoryName}" tours in ${destination.fullName || destination.name}.

WRITING STYLE:
- Write like a professional travel writer or experienced travel blogger
- Use natural, conversational but professional tone
- Avoid AI clichés like "unforgettable journey", "magical experience", "hidden gems" (unless truly appropriate)
- Use varied sentence structures - mix short and long sentences
- Write with deep knowledge of the destination, like a guide, but don't imply personal experience ("These tours..." not "I've been...")
- Sound knowledgeable and helpful, like answering a friend's question
- Be specific with details, prices, and practical information

IMPORTANT - AVOID PROMOTIONAL LANGUAGE:
- DO NOT use "our tours", "we offer", "your golden ticket", "we provide"
- DO use neutral phrasing: "[Destination] [Category] tours take you..." or "These tours..." or "Visitors can explore..."
- TopTours.ai is an aggregation platform, not a tour operator
- Focus on what the tours/activities offer, not what "we" offer

Generate a comprehensive guide object in this EXACT JSON format (no markdown, just raw JSON):

{
  "title": "Full SEO-optimized title (60-70 chars)",
  "subtitle": "Engaging 1-sentence subtitle (120-150 chars)",
  "heroImage": "${destination.imageUrl || 'null'}",
  "stats": {
    "toursAvailable": 15,
    "priceFrom": "$25",
    "duration": "2-3 hours"
  },
  "introduction": "2-3 paragraph engaging introduction (300-400 words) that sets the scene and explains what makes this category special in this destination.",
  "seo": {
    "title": "SEO title (50-60 chars)",
    "description": "Meta description (150-160 chars)",
    "keywords": "comma-separated keywords"
  },
  "whyChoose": [
    {
      "icon": "Sun",
      "title": "Reason title",
      "description": "1-2 sentence explanation"
    }
  ],
  "tourTypes": [
    {
      "icon": "MapPin",
      "title": "Tour type name",
      "description": "2-3 sentence description",
      "features": ["Feature 1", "Feature 2", "Feature 3"]
    }
  ],
  "whatToExpect": {
    "title": "What to Expect on ${categoryName} Tours",
    "items": [
      {
        "icon": "Clock",
        "title": "Duration",
        "description": "Typical duration information"
      }
    ]
  },
  "expertTips": [
    "Practical tip 1",
    "Practical tip 2"
  ],
  "faqs": [
    {
      "question": "Natural question a traveler would ask",
      "answer": "Helpful, natural answer (2-3 sentences) - write like answering a friend's question"
    }
  ]
}

Requirements:
- Make it specific to ${destination.fullName || destination.name} and ${categoryName}
- Use realistic prices in USD or EUR
- Include 5-6 whyChoose items
- Include 3-4 tourTypes with 3-5 features each
- Include 5-6 whatToExpect items (Duration, Weather, Group Size, What's Included, Meeting Point, Costs)
- Include 6-8 expert tips
- Include 6-8 FAQs with natural, helpful answers
- All content should be accurate and helpful
- Write naturally - avoid sounding like AI or overly promotional

Return ONLY the JSON object, no markdown, no code blocks, no explanations.`;

  try {
    await new Promise(resolve => setTimeout(resolve, 200)); // Rate limiting
    
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('Could not extract JSON from response');
    }
    
    return JSON.parse(jsonMatch[0]);
  } catch (error) {
    console.error(`   ❌ Error: ${error.message}`);
    return null;
  }
}

// Save guide to database
async function saveGuide(destinationId, categorySlug, guide, categoryName) {
  const dbGuide = {
    destination_id: destinationId,
    category_slug: categorySlug,
    category_name: categoryName,
    title: guide.title,
    subtitle: guide.subtitle,
    hero_image: guide.heroImage || null,
    stats: guide.stats || null,
    introduction: guide.introduction,
    seo: guide.seo || null,
    why_choose: guide.whyChoose || null,
    tour_types: guide.tourTypes || null,
    what_to_expect: guide.whatToExpect || null,
    expert_tips: guide.expertTips || [],
    faqs: guide.faqs || [],
  };
  
  const { error } = await supabase
    .from('category_guides')
    .upsert(dbGuide, {
      onConflict: 'destination_id,category_slug',
    });
  
  if (error) {
    console.error(`   ❌ Database error: ${error.message}`);
    return false;
  }
  
  return true;
}

// Main function
async function main() {
  console.log('\n🚀 Generating guides for newly added destinations...\n');
  
  for (const slug of destinationsToProcess) {
    const content = fullContentData[slug];
    
    if (!content) {
      console.log(`❌ ${slug}: Not found in generated content`);
      continue;
    }
    
    if (!content.tourCategories || content.tourCategories.length === 0) {
      console.log(`⚠️  ${slug}: No tourCategories defined`);
      continue;
    }
    
    const destination = {
      id: slug,
      name: content.destinationName,
      fullName: content.destinationName,
      imageUrl: content.imageUrl || null,
    };
    
    console.log(`\n🎯 ${destination.fullName}`);
    console.log(`   Categories: ${content.tourCategories.length}`);
    
    const existingGuides = await getExistingGuides(slug);
    let generated = 0;
    
    for (const category of content.tourCategories) {
      const categoryName = typeof category === 'object' ? category.name : category;
      const categorySlug = generateCategorySlug(categoryName);
      
      if (existingGuides.has(categorySlug)) {
        console.log(`   ⏭️  Skipping ${categoryName} - already exists`);
        continue;
      }
      
      console.log(`   📝 Generating: ${categoryName}...`);
      const guide = await generateGuide(destination, category);
      
      if (guide) {
        const saved = await saveGuide(slug, categorySlug, guide, categoryName);
        if (saved) {
          console.log(`   ✅ Generated & saved: ${categoryName}`);
          generated++;
        }
      }
    }
    
    console.log(`\n✅ ${destination.fullName}: Generated ${generated} guides`);
  }
  
  console.log('\n✨ Done!\n');
}

main().catch(error => {
  console.error('\n❌ ERROR:', error);
  process.exit(1);
});

