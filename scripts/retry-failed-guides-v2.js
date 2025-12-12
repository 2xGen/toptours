/**
 * Retry failed guide generations using the same logic as batch script
 * 
 * Usage:
 *   node scripts/retry-failed-guides-v2.js
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
if (!GEMINI_API_KEY) {
  console.error('❌ Missing GEMINI_API_KEY');
  process.exit(1);
}

const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error('❌ Missing Supabase credentials');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

const progressFile = path.join(__dirname, '../generated-guides-batch-progress.json');
const destinationsDataPath = path.join(__dirname, '../src/data/destinationsData.js');

// Load destinations
const destinationsContent = fs.readFileSync(destinationsDataPath, 'utf8');
const destinationsMatch = destinationsContent.match(/export const destinations = \[([\s\S]*?)\];/);
const destinations = destinationsMatch ? eval(`[${destinationsMatch[1]}]`) : [];

// Load progress
let progress = { failed: [] };
if (fs.existsSync(progressFile)) {
  progress = JSON.parse(fs.readFileSync(progressFile, 'utf8'));
}

if (!progress.failed || progress.failed.length === 0) {
  console.log('✅ No failed guides to retry!');
  process.exit(0);
}

console.log(`\n🔄 Retrying ${progress.failed.length} failed guides...\n`);

// Use the same generation function as batch script
async function generateGuideWithGemini(destination, categoryName) {
  const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash-exp' });
  
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
    "Tip 1",
    "Tip 2",
    "Tip 3"
  ],
  "faqs": [
    {
      "question": "Question?",
      "answer": "Answer."
    }
  ]
}

Return ONLY valid JSON, no markdown formatting, no code blocks.`;

  try {
    const result = await model.generateContent({
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: {
        temperature: 0.7,
        topK: 40,
        topP: 0.95,
        maxOutputTokens: 4096,
      }
    });

    const response = await result.response;
    let text = response.text().trim();
    
    // Remove markdown code blocks if present
    text = text.replace(/^```json\s*/i, '').replace(/^```\s*/i, '').replace(/\s*```$/i, '');
    
    return JSON.parse(text);
  } catch (error) {
    throw error;
  }
}

function convertGuideToDBFormat(destinationId, categorySlug, guide, categoryName) {
  return {
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
}

async function saveGuideToDatabase(destinationId, categorySlug, guide, categoryName) {
  const dbGuide = convertGuideToDBFormat(destinationId, categorySlug, guide, categoryName);
  
  const { error } = await supabase
    .from('category_guides')
    .upsert(dbGuide, {
      onConflict: 'destination_id,category_slug',
    });

  if (error) throw error;
  return true;
}

// Process failed guides
let retried = 0;
let stillFailed = [];

for (const fail of progress.failed) {
  // Find destination by slug or id
  const destination = destinations.find(d => 
    d.id === fail.destination || 
    d.slug === fail.destination ||
    d.id?.toLowerCase() === fail.destination?.toLowerCase()
  );
  
  if (!destination) {
    console.log(`⚠️  Destination not found: ${fail.destination}`);
    stillFailed.push(fail);
    continue;
  }

  const categorySlug = fail.category.toLowerCase().replace(/[^a-z0-9]+/g, '-');
  
  console.log(`\n📍 ${destination.fullName || destination.name} - ${fail.category}`);

  try {
    const guide = await generateGuideWithGemini(destination, fail.category);
    await saveGuideToDatabase(destination.id, categorySlug, guide, fail.category);
    console.log(`   ✅ Success!`);
    retried++;
    
    // Rate limiting delay (optimized: 200ms = 300 RPM, much faster than 2s)
    await new Promise(resolve => setTimeout(resolve, 200));
  } catch (error) {
    console.log(`   ❌ Failed: ${error.message}`);
    stillFailed.push(fail);
  }
}

// Update progress
progress.failed = stillFailed;
fs.writeFileSync(progressFile, JSON.stringify(progress, null, 2));

console.log(`\n${'='.repeat(60)}`);
console.log(`✅ Retry complete!`);
console.log(`   Successfully retried: ${retried}`);
console.log(`   Still failed: ${stillFailed.length}`);
console.log(`${'='.repeat(60)}\n`);

