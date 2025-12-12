/**
 * Batch script to generate category guides for ALL destinations
 * Features:
 * - Processes by region to avoid rate limits
 * - Saves progress incrementally
 * - Can resume if interrupted
 * - Shows cost tracking
 * - Processes destinations that don't already have guides
 * 
 * Usage:
 *   node scripts/generate-all-guides-batch.js                    # Process all regions
 *   node scripts/generate-all-guides-batch.js --region europe     # Process specific region
 *   node scripts/generate-all-guides-batch.js --resume            # Resume from last checkpoint
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

// Pricing configuration (from existing script - gemini-2.5-flash-lite)
const PRICING = {
  inputPerMillion: 0.10,   // $0.10 per 1M input tokens
  outputPerMillion: 0.40,  // $0.40 per 1M output tokens
  estimatedInputTokens: 2500,   // Estimated tokens per guide (input)
  estimatedOutputTokens: 2000,  // Estimated tokens per guide (output)
};

// Rate limiting configuration
// Tier 1 (Paid): gemini-2.5-flash-lite supports up to 4,000 RPM
// We'll use a conservative 300 RPM (5 requests/second) to stay well under limits
const RATE_LIMIT_CONFIG = {
  requestsPerMinute: 300,  // Conservative limit (actual Tier 1 limit is 4,000 RPM)
  delayMs: 200,            // 200ms = 5 requests/second = 300 RPM (safe buffer)
  maxConcurrent: 3,         // Process 3 guides concurrently
  retryDelay: 5000,         // 5 seconds on rate limit error
  maxRetries: 3,           // Max retries on rate limit
};

// Calculate cost per guide
const costPerGuide = (
  (PRICING.estimatedInputTokens * PRICING.inputPerMillion / 1000000) +
  (PRICING.estimatedOutputTokens * PRICING.outputPerMillion / 1000000)
);

// File paths
const progressFile = path.join(__dirname, '../generated-guides-batch-progress.json');
const checkpointFile = path.join(__dirname, '../generated-guides-batch-checkpoint.json');

// Initialize Supabase
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error('❌ Missing Supabase environment variables');
  console.error('Required: NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

// Import destinations data
const destinationsDataPath = path.join(__dirname, '../src/data/destinationsData.js');
const destinationsContent = fs.readFileSync(destinationsDataPath, 'utf8');
const destinationsMatch = destinationsContent.match(/export const destinations = \[([\s\S]*?)\];/);
let destinations = [];
if (destinationsMatch) {
  destinations = eval(`[${destinationsMatch[1]}]`);
}

const seoContentPath = path.join(__dirname, '../generated-destination-seo-content.json');
const fullContentPath = path.join(__dirname, '../generated-destination-full-content.json');

let seoContentData = {};
let fullContentData = {};
let destinationImageMap = {};

try {
  if (fs.existsSync(seoContentPath)) {
    seoContentData = JSON.parse(fs.readFileSync(seoContentPath, 'utf8'));
  }
  if (fs.existsSync(fullContentPath)) {
    fullContentData = JSON.parse(fs.readFileSync(fullContentPath, 'utf8'));
  }
  
  // Build destination image map for hero_image fallback
  destinations.forEach(dest => {
    if (dest.imageUrl) {
      destinationImageMap[dest.id] = dest.imageUrl;
    }
  });
  Object.entries(fullContentData).forEach(([id, data]) => {
    if (data.imageUrl && !destinationImageMap[id]) {
      destinationImageMap[id] = data.imageUrl;
    }
  });
  Object.entries(seoContentData).forEach(([id, data]) => {
    if (data.ogImage && !destinationImageMap[id]) {
      destinationImageMap[id] = data.ogImage;
    }
  });
} catch (error) {
  console.warn('Could not load generated content files:', error.message);
}

// Region mapping
const regionToCategory = {
  'Europe': 'Europe',
  'North America': 'North America',
  'Asia-Pacific': 'Asia-Pacific',
  'Caribbean': 'Caribbean',
  'Africa': 'Africa',
  'South America': 'South America',
  'Middle East': 'Middle East',
};

// Initialize Gemini
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
if (!GEMINI_API_KEY) {
  console.error('❌ GEMINI_API_KEY not found in .env.local');
  process.exit(1);
}

const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash-lite' });

// Load or create progress tracking
function loadProgress() {
  if (fs.existsSync(progressFile)) {
    return JSON.parse(fs.readFileSync(progressFile, 'utf8'));
  }
  return {
    processed: [],
    failed: [],
    totalCost: 0,
    totalGuides: 0,
    startTime: new Date().toISOString(),
  };
}

function saveProgress(progress) {
  fs.writeFileSync(progressFile, JSON.stringify(progress, null, 2));
}

// Load or create checkpoint
function loadCheckpoint() {
  if (fs.existsSync(checkpointFile)) {
    return JSON.parse(fs.readFileSync(checkpointFile, 'utf8'));
  }
  return {
    currentRegion: null,
    currentDestinationIndex: 0,
    currentCategoryIndex: 0,
  };
}

function saveCheckpoint(checkpoint) {
  fs.writeFileSync(checkpointFile, JSON.stringify(checkpoint, null, 2));
}

// Find destination by slug
function findDestinationBySlug(slug) {
  let dest = destinations.find(d => d.id === slug);
  if (dest) return dest;
  
  const seoContent = seoContentData[slug];
  const fullContent = fullContentData[slug];
  
  if (seoContent || fullContent) {
    const content = fullContent || seoContent;
    return {
      id: slug,
      name: content?.destinationName || seoContent?.destinationName || slug,
      fullName: content?.destinationName || seoContent?.destinationName || slug,
      country: content?.country || seoContent?.country || null,
      category: content?.region || seoContent?.region || 'Europe',
      briefDescription: content?.briefDescription || seoContent?.briefDescription || '',
      imageUrl: content?.imageUrl || seoContent?.ogImage || null,
      tourCategories: content?.tourCategories || [],
      destinationId: null,
    };
  }
  
  return null;
}

// Get all destinations with tour categories, grouped by region
function getAllDestinationsByRegion() {
  const byRegion = {};
  
  // From destinationsData.js
  destinations.forEach(dest => {
    if (dest.tourCategories && dest.tourCategories.length > 0) {
      const region = dest.category || 'Other';
      if (!byRegion[region]) byRegion[region] = [];
      byRegion[region].push(dest);
    }
  });
  
  // From generated content
  Object.keys(fullContentData).forEach(slug => {
    const content = fullContentData[slug];
    if (content && content.tourCategories && content.tourCategories.length > 0) {
      const region = content.region || 'Other';
      if (!byRegion[region]) byRegion[region] = [];
      
      const dest = findDestinationBySlug(slug);
      if (dest && !byRegion[region].find(d => d.id === dest.id)) {
        byRegion[region].push(dest);
      }
    }
  });
  
  return byRegion;
}

// Convert guide object to database format
function convertGuideToDBFormat(destinationId, categorySlug, guide, categoryName) {
  // Fix heroImage: if it's "null" string or null, use destination image URL
  let heroImage = guide.heroImage || guide.hero_image;
  if (heroImage === "null" || heroImage === null || heroImage === undefined) {
    heroImage = destinationImageMap[destinationId] || null;
  }
  
  return {
    destination_id: destinationId,
    category_slug: categorySlug,
    category_name: categoryName || guide.categoryName || guide.category_name,
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

// Check which categories already have guides in the database
async function getExistingGuidesFromDatabase(destinationId) {
  try {
    const { data, error } = await supabase
      .from('category_guides')
      .select('category_slug')
      .eq('destination_id', destinationId);
    
    if (error) {
      console.warn(`   ⚠️  Could not check database for ${destinationId}: ${error.message}`);
      return new Set();
    }
    
    return new Set((data || []).map(g => g.category_slug));
  } catch (error) {
    console.warn(`   ⚠️  Error checking database: ${error.message}`);
    return new Set();
  }
}

// Save guide directly to database
async function saveGuideToDatabase(destinationId, categorySlug, guide, categoryName) {
  try {
    const dbGuide = convertGuideToDBFormat(destinationId, categorySlug, guide, categoryName);
    
    // Use upsert to handle both insert and update
    const { data, error } = await supabase
      .from('category_guides')
      .upsert(dbGuide, {
        onConflict: 'destination_id,category_slug',
      })
      .select();
    
    if (error) {
      console.error(`   ❌ Database error: ${error.message}`);
      return false;
    }
    
    return true;
  } catch (error) {
    console.error(`   ❌ Error saving to database: ${error.message}`);
    return false;
  }
}

// Rate limiter: track requests per minute
class RateLimiter {
  constructor(rpm, delayMs) {
    this.rpm = rpm;
    this.delayMs = delayMs;
    this.requests = [];
    this.queue = [];
    this.processing = false;
  }

  async wait() {
    const now = Date.now();
    // Remove requests older than 1 minute
    this.requests = this.requests.filter(time => now - time < 60000);
    
    // If we're at the limit, wait
    if (this.requests.length >= this.rpm) {
      const oldestRequest = this.requests[0];
      const waitTime = 60000 - (now - oldestRequest) + 100; // Add 100ms buffer
      if (waitTime > 0) {
        await new Promise(resolve => setTimeout(resolve, waitTime));
        return this.wait(); // Recursively check again
      }
    }
    
    // Add this request
    this.requests.push(Date.now());
    
    // Apply base delay
    await new Promise(resolve => setTimeout(resolve, this.delayMs));
  }
}

// Initialize rate limiter
const rateLimiter = new RateLimiter(RATE_LIMIT_CONFIG.requestsPerMinute, RATE_LIMIT_CONFIG.delayMs);

// Generate guide using the same prompt as generate-category-guides-gemini.js
async function generateGuideWithGemini(destination, category, retryCount = 0) {
  try {
    // Apply rate limiting
    await rateLimiter.wait();
    
    const categoryName = typeof category === 'string' ? category : category.name;
    
    // Use the exact same prompt structure as generate-category-guides-gemini.js
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

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('Could not extract JSON from response');
    }
    
    const guideObject = JSON.parse(jsonMatch[0]);
    
    const categorySlug = categoryName
      .toLowerCase()
      .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
      .replace(/&/g, 'and')
      .replace(/'/g, '')
      .replace(/\./g, '')
      .replace(/\s+/g, '-');
    guideObject.categorySlug = categorySlug;
    
    return guideObject;
    
  } catch (error) {
    const errorMsg = error.message || error.toString();
    
    // Check if it's a rate limit error
    if (errorMsg.includes('429') || 
        errorMsg.includes('quota') || 
        errorMsg.includes('Quota exceeded') ||
        errorMsg.includes('RESOURCE_EXHAUSTED') ||
        errorMsg.includes('rate limit')) {
      
      if (retryCount < RATE_LIMIT_CONFIG.maxRetries) {
        const retryDelay = RATE_LIMIT_CONFIG.retryDelay * (retryCount + 1); // Exponential backoff
        console.log(`   ⏳ Rate limit hit. Waiting ${Math.ceil(retryDelay / 1000)}s before retry ${retryCount + 1}/${RATE_LIMIT_CONFIG.maxRetries}...`);
        await new Promise(resolve => setTimeout(resolve, retryDelay));
        
        // Clear recent requests to reset rate limiter
        rateLimiter.requests = [];
        
        return generateGuideWithGemini(destination, category, retryCount + 1);
      } else {
        console.error(`   ❌ Rate limit error after ${RATE_LIMIT_CONFIG.maxRetries} retries`);
        return null;
      }
    }
    
    console.error(`❌ Error: ${errorMsg}`);
    return null;
  }
}

// Main processing function
async function processDestinations() {
  const progress = loadProgress();
  const checkpoint = loadCheckpoint();
  const allDestinationsByRegion = getAllDestinationsByRegion();
  
  const regions = Object.keys(allDestinationsByRegion).sort();
  const targetRegion = process.argv.includes('--region') 
    ? process.argv[process.argv.indexOf('--region') + 1]
    : null;
  
  console.log('\n🚀 BATCH GUIDE GENERATION FOR ALL DESTINATIONS\n');
  console.log('━'.repeat(60));
  console.log(`💰 Cost per guide: $${costPerGuide.toFixed(6)}`);
  console.log(`📊 Total destinations: ${Object.values(allDestinationsByRegion).reduce((sum, dests) => sum + dests.length, 0)}`);
  console.log(`📝 Estimated total guides: ${Object.values(allDestinationsByRegion).reduce((sum, dests) => sum + dests.reduce((dSum, d) => dSum + (d.tourCategories?.length || 0), 0), 0)}`);
  console.log(`💵 Estimated total cost: $${(Object.values(allDestinationsByRegion).reduce((sum, dests) => sum + dests.reduce((dSum, d) => dSum + (d.tourCategories?.length || 0), 0), 0) * costPerGuide).toFixed(2)}`);
  console.log('━'.repeat(60));
  console.log(`⚡ Rate Limit: ${RATE_LIMIT_CONFIG.requestsPerMinute} RPM (${RATE_LIMIT_CONFIG.delayMs}ms delay)`);
  console.log(`⚡ Concurrency: ${RATE_LIMIT_CONFIG.maxConcurrent} concurrent requests`);
  console.log(`⚡ Estimated speed: ~${Math.round(RATE_LIMIT_CONFIG.requestsPerMinute / 60 * RATE_LIMIT_CONFIG.maxConcurrent)} guides/minute`);
  console.log('━'.repeat(60));
  console.log('💾 Writing directly to database (no file accumulation)');
  console.log('━'.repeat(60));
  
  // Debug: Show available regions if target region specified
  if (targetRegion) {
    console.log(`\n🔍 Looking for region: "${targetRegion}"`);
    console.log(`📋 Available regions: ${regions.join(', ')}`);
    const matchingRegion = regions.find(r => r.toLowerCase() === targetRegion.toLowerCase());
    if (matchingRegion) {
      console.log(`✅ Found matching region: "${matchingRegion}"`);
    } else {
      console.log(`❌ No matching region found. Available: ${regions.join(', ')}`);
    }
  }
  
  let startRegionIndex = 0;
  // If target region is specified, start from that region (ignore checkpoint)
  if (targetRegion) {
    const targetRegionIndex = regions.findIndex(r => r.toLowerCase() === targetRegion.toLowerCase());
    if (targetRegionIndex !== -1) {
      startRegionIndex = targetRegionIndex;
      console.log(`🎯 Starting from target region: ${regions[startRegionIndex]} (index ${startRegionIndex})`);
    }
  } else if (checkpoint.currentRegion) {
    // Only use checkpoint if no target region specified
    startRegionIndex = regions.indexOf(checkpoint.currentRegion);
    if (startRegionIndex === -1) startRegionIndex = 0;
  }
  
  for (let regionIndex = startRegionIndex; regionIndex < regions.length; regionIndex++) {
    const region = regions[regionIndex];
    
    // Case-insensitive region matching
    if (targetRegion && region.toLowerCase() !== targetRegion.toLowerCase()) {
      continue;
    }
    
    // Debug: Show we're entering this region
    console.log(`\n🔍 Entering region loop for: ${region}`);
    
    const regionDestinations = allDestinationsByRegion[region] || [];
    console.log(`🌍 Processing region: ${region} (${regionDestinations.length} destinations)`);
    
    if (regionDestinations.length === 0) {
      console.log(`   ⚠️  No destinations with tour categories found in ${region}`);
      console.log(`   💡 This might mean all ${region} destinations are in other regions or don't have tour categories defined`);
      console.log(`   📋 Checking getAllDestinationsByRegion keys: ${Object.keys(allDestinationsByRegion).join(', ')}`);
      continue;
    }
    
    console.log(`   📋 First few destinations: ${regionDestinations.slice(0, 5).map(d => d.fullName || d.name || d.id).join(', ')}`);
    
    console.log(`   📋 First few destinations: ${regionDestinations.slice(0, 5).map(d => d.fullName || d.name || d.id).join(', ')}`);
    
    let startDestIndex = 0;
    if (checkpoint.currentRegion === region) {
      startDestIndex = checkpoint.currentDestinationIndex;
    }
    
    let skippedCount = 0;
    let processedCount = 0;
    
    for (let destIndex = startDestIndex; destIndex < regionDestinations.length; destIndex++) {
      const destination = regionDestinations[destIndex];
      
      // Check database for existing guides (more reliable than processed list)
      const existingGuides = await getExistingGuidesFromDatabase(destination.id);
      
      // Skip if already processed AND all categories have guides in database
      if (progress.processed.includes(destination.id)) {
        // Double-check database to make sure all guides actually exist (ONLY trust database)
        const categories = destination.tourCategories || [];
        const allCategoriesHaveGuides = categories.every(cat => {
          const categoryObj = typeof cat === 'object' ? cat : { name: cat };
          const categorySlug = categoryObj.name.toLowerCase().replace(/ /g, '-').replace(/&/g, 'and');
          // ONLY trust database - hasGuide flag may be incorrectly set
          return existingGuides.has(categorySlug);
        });
        
        if (allCategoriesHaveGuides) {
          skippedCount++;
          if (destIndex < 5 || destIndex === regionDestinations.length - 1) {
            console.log(`   ⏭️  Skipping ${destination.fullName || destination.name} - already processed & all guides exist`);
          }
          continue;
        } else {
          // Destination was marked processed but doesn't have all guides - process it
          console.log(`   🔄 Re-processing ${destination.fullName || destination.name} - missing some guides`);
        }
      }
      
      // Skip if all categories already have guides (ONLY check database - ignore hasGuide flag as it may be incorrect)
      const categories = destination.tourCategories || [];
      const allHaveGuides = categories.every(cat => {
        const categoryObj = typeof cat === 'object' ? cat : { name: cat };
        const categorySlug = categoryObj.name.toLowerCase().replace(/ /g, '-').replace(/&/g, 'and');
        // ONLY trust database - hasGuide flag may be incorrectly set
        return existingGuides.has(categorySlug);
      });
      
      if (allHaveGuides) {
        console.log(`   ⏭️  Skipping ${destination.fullName || destination.name} - all guides exist in database`);
        progress.processed.push(destination.id);
        saveProgress(progress);
        continue;
      }
      
      console.log(`\n🎯 [${destIndex + 1}/${regionDestinations.length}] ${destination.fullName || destination.name}`);
      
      let destinationGuidesGenerated = 0;
      
      let startCatIndex = 0;
      if (checkpoint.currentRegion === region && checkpoint.currentDestinationIndex === destIndex) {
        startCatIndex = checkpoint.currentCategoryIndex;
      }
      
      // Process categories with controlled concurrency
      const categoriesToProcess = [];
      for (let catIndex = startCatIndex; catIndex < categories.length; catIndex++) {
        const category = categories[catIndex];
        const categoryObj = typeof category === 'string' ? { name: category } : category;
        const categorySlug = categoryObj.name.toLowerCase().replace(/ /g, '-').replace(/&/g, 'and');
        
        // Skip if already has guide (ONLY check database - ignore hasGuide flag as it may be incorrect)
        if (existingGuides.has(categorySlug)) {
          console.log(`   ⏭️  Skipping ${categoryObj.name} - guide exists in database`);
          continue;
        }
        
        categoriesToProcess.push({ categoryObj, catIndex, categorySlug });
      }
      
      // Process categories with controlled concurrency
      for (let i = 0; i < categoriesToProcess.length; i += RATE_LIMIT_CONFIG.maxConcurrent) {
        const batch = categoriesToProcess.slice(i, i + RATE_LIMIT_CONFIG.maxConcurrent);
        
        const batchPromises = batch.map(async ({ categoryObj, catIndex, categorySlug }) => {
          console.log(`   📝 [${catIndex + 1}/${categories.length}] Generating: ${categoryObj.name}...`);
          
          const guide = await generateGuideWithGemini(destination, categoryObj);
          
          if (guide) {
            // Save directly to database
            const saved = await saveGuideToDatabase(destination.id, categorySlug, guide, categoryObj.name);
            
            if (saved) {
              progress.totalCost += costPerGuide;
              progress.totalGuides += 1;
              destinationGuidesGenerated++;
              console.log(`   ✅ Generated & saved: ${categoryObj.name} (Cost: $${costPerGuide.toFixed(6)}, Total: $${progress.totalCost.toFixed(2)})`);
              return { success: true, category: categoryObj.name };
            } else {
              console.log(`   ⚠️  Generated but failed to save: ${categoryObj.name}`);
              progress.failed.push({
                destination: destination.id,
                category: categoryObj.name,
                error: 'Database save failed'
              });
              return { success: false, category: categoryObj.name, error: 'Database save failed' };
            }
          } else {
            console.log(`   ❌ Failed to generate: ${categoryObj.name}`);
            progress.failed.push({
              destination: destination.id,
              category: categoryObj.name,
              error: 'Generation failed'
            });
            return { success: false, category: categoryObj.name, error: 'Generation failed' };
          }
        });
        
        // Wait for batch to complete
        await Promise.all(batchPromises);
        
        // Save checkpoint after each batch
        const lastCatIndex = batch[batch.length - 1].catIndex;
        saveCheckpoint({
          currentRegion: region,
          currentDestinationIndex: destIndex,
          currentCategoryIndex: lastCatIndex + 1,
        });
        
        // Save progress incrementally
        saveProgress(progress);
      }
      
      if (destinationGuidesGenerated > 0) {
        progress.processed.push(destination.id);
        saveProgress(progress);
      }
      
      // Reset checkpoint for next destination
      saveCheckpoint({
        currentRegion: region,
        currentDestinationIndex: destIndex + 1,
        currentCategoryIndex: 0,
      });
    }
    
    console.log(`\n✅ Completed region: ${region}`);
  }
  
  console.log('\n━'.repeat(60));
  console.log(`\n✅ BATCH GENERATION COMPLETE!`);
  console.log(`📊 Total guides generated & saved to database: ${progress.totalGuides}`);
  console.log(`💰 Total cost: $${progress.totalCost.toFixed(2)}`);
  console.log(`📋 Progress saved to: ${progressFile}`);
  console.log(`\n💡 Next step: Run "node scripts/update-hasguide-from-database.js" to update hasGuide flags`);
  
  if (progress.failed.length > 0) {
    console.log(`\n⚠️  Failed guides: ${progress.failed.length}`);
    console.log(`   Review ${progressFile} for details`);
  }
}

// Run
processDestinations().catch(error => {
  console.error('\n❌ FATAL ERROR:', error);
  process.exit(1);
});

