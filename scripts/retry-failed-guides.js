/**
 * Retry failed guide generations from batch progress file
 * 
 * Usage:
 *   node scripts/retry-failed-guides.js
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
  console.error('❌ Missing GEMINI_API_KEY in environment variables');
  process.exit(1);
}

const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);

// Initialize Supabase
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error('❌ Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

// File paths
const progressFile = path.join(__dirname, '../generated-guides-batch-progress.json');

// Import destinations data
const destinationsDataPath = path.join(__dirname, '../src/data/destinationsData.js');
const destinationsContent = fs.readFileSync(destinationsDataPath, 'utf8');
const destinationsMatch = destinationsContent.match(/export const destinations = \[([\s\S]*?)\];/);
let destinations = [];
if (destinationsMatch) {
  destinations = eval(`[${destinationsMatch[1]}]`);
}

// Load progress file
let progress = { processed: [], failed: [], totalCost: 0, totalGuides: 0 };
if (fs.existsSync(progressFile)) {
  progress = JSON.parse(fs.readFileSync(progressFile, 'utf8'));
}

if (!progress.failed || progress.failed.length === 0) {
  console.log('✅ No failed guides to retry!');
  process.exit(0);
}

console.log(`\n🔄 Retrying ${progress.failed.length} failed guides...\n`);

// Group failed guides by destination
const failedByDestination = {};
progress.failed.forEach(fail => {
  if (!failedByDestination[fail.destination]) {
    failedByDestination[fail.destination] = [];
  }
  failedByDestination[fail.destination].push(fail.category);
});

// Function to generate a single guide
async function generateGuide(destination, categoryName) {
  const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash-exp' });
  
  const prompt = `You are a travel guide expert. Create a comprehensive category guide for ${destination.fullName || destination.name} focused on "${categoryName}".

Requirements:
- Write in a friendly, informative tone
- Include practical information (prices, durations, best times to visit)
- Mention specific tours, activities, or experiences
- Include tips and recommendations
- Keep it engaging and useful for travelers
- Length: 800-1200 words

Format as a well-structured guide with clear sections.`;

  try {
    const result = await model.generateContent({
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: {
        temperature: 0.7,
        topK: 40,
        topP: 0.95,
        maxOutputTokens: 2048,
      }
    });

    const response = await result.response;
    return response.text();
  } catch (error) {
    throw error;
  }
}

// Function to save guide to database
async function saveGuideToDB(destinationId, categorySlug, guideContent) {
  const { error } = await supabase
    .from('category_guides')
    .upsert({
      destination_id: destinationId,
      category_slug: categorySlug,
      content: guideContent,
      updated_at: new Date().toISOString(),
    }, {
      onConflict: 'destination_id,category_slug'
    });

  if (error) {
    throw error;
  }
}

// Retry failed guides
let retried = 0;
let stillFailed = [];

for (const [destId, categories] of Object.entries(failedByDestination)) {
  // Try to find destination by ID first, then by slug
  let destination = destinations.find(d => d.id === destId);
  if (!destination) {
    // Try finding by slug (destId might be a slug)
    destination = destinations.find(d => d.slug === destId || d.id === destId);
  }
  if (!destination) {
    console.log(`⚠️  Destination not found: ${destId}`);
    // Keep in failed list
    categories.forEach(cat => {
      stillFailed.push({
        destination: destId,
        category: cat,
        error: 'Destination not found'
      });
    });
    continue;
  }

  console.log(`\n📍 Retrying ${destination.fullName || destination.name}...`);

  for (const categoryName of categories) {
    const categorySlug = categoryName.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    
    console.log(`   🔄 Retrying: ${categoryName}...`);

    try {
      // Generate guide
      const guideContent = await generateGuide(destination, categoryName);
      
      // Save to database
      await saveGuideToDB(destId, categorySlug, guideContent);
      
      console.log(`   ✅ Success: ${categoryName}`);
      retried++;
      
      // Remove from failed list
      progress.failed = progress.failed.filter(
        f => !(f.destination === destId && f.category === categoryName)
      );
      
      // Add delay to avoid rate limits
      await new Promise(resolve => setTimeout(resolve, 2000));
      
    } catch (error) {
      console.log(`   ❌ Still failed: ${categoryName} - ${error.message}`);
      stillFailed.push({
        destination: destId,
        category: categoryName,
        error: error.message
      });
    }
  }
}

// Update progress file
progress.failed = stillFailed;
fs.writeFileSync(progressFile, JSON.stringify(progress, null, 2));

console.log(`\n${'='.repeat(60)}`);
console.log(`✅ Retry complete!`);
console.log(`   Successfully retried: ${retried}`);
console.log(`   Still failed: ${stillFailed.length}`);
console.log(`${'='.repeat(60)}\n`);

