/**
 * Check which guides are missing in the database and regenerate only those
 * 
 * Usage:
 *   node scripts/check-and-regenerate-missing-guides.js                    # Check all regions
 *   node scripts/check-and-regenerate-missing-guides.js --region "North America"  # Check specific region
 *   node scripts/check-and-regenerate-missing-guides.js --region "North America" --regenerate  # Check and regenerate missing
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

// Initialize Supabase
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error('❌ Missing Supabase environment variables');
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

const fullContentPath = path.join(__dirname, '../generated-destination-full-content.json');
let fullContentData = {};
let destinationImageMap = {};

try {
  if (fs.existsSync(fullContentPath)) {
    fullContentData = JSON.parse(fs.readFileSync(fullContentPath, 'utf8'));
  }
  
  // Build destination image map
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
} catch (error) {
  console.warn('Could not load generated content files:', error.message);
}

// Find destination by slug
function findDestinationBySlug(slug) {
  let dest = destinations.find(d => d.id === slug);
  if (dest) return dest;
  
  const fullContent = fullContentData[slug];
  
  if (fullContent) {
    return {
      id: slug,
      name: fullContent?.destinationName || slug,
      fullName: fullContent?.destinationName || slug,
      country: fullContent?.country || null,
      category: fullContent?.region || 'Europe',
      briefDescription: fullContent?.briefDescription || '',
      imageUrl: fullContent?.imageUrl || null,
      tourCategories: fullContent?.tourCategories || [],
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

// Generate category slug
function generateCategorySlug(categoryName) {
  return categoryName
    .toLowerCase()
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .replace(/&/g, 'and')
    .replace(/'/g, '')
    .replace(/\./g, '')
    .replace(/\s+/g, '-');
}

// Check what guides exist in database
async function checkMissingGuides(region = null) {
  console.log('\n🔍 CHECKING MISSING GUIDES IN DATABASE\n');
  console.log('━'.repeat(60));
  
  const allDestinationsByRegion = getAllDestinationsByRegion();
  const regions = region ? [region] : Object.keys(allDestinationsByRegion).sort();
  
  const missingGuides = [];
  const existingGuides = [];
  
  for (const regionName of regions) {
    if (!allDestinationsByRegion[regionName]) {
      console.log(`⚠️  Region "${regionName}" not found`);
      continue;
    }
    
    const regionDestinations = allDestinationsByRegion[regionName];
    console.log(`\n🌍 Checking region: ${regionName} (${regionDestinations.length} destinations)`);
    
    for (const destination of regionDestinations) {
      const categories = destination.tourCategories || [];
      
      for (const category of categories) {
        const categoryObj = typeof category === 'object' ? category : { name: category };
        const categorySlug = generateCategorySlug(categoryObj.name);
        
        // Check if guide exists in database
        const { data, error } = await supabase
          .from('category_guides')
          .select('id, destination_id, category_slug')
          .eq('destination_id', destination.id)
          .eq('category_slug', categorySlug)
          .maybeSingle();
        
        if (error && error.code !== 'PGRST116') {
          console.error(`   ⚠️  Error checking ${destination.id}/${categorySlug}: ${error.message}`);
        }
        
        if (data) {
          existingGuides.push({
            destination: destination.id,
            destinationName: destination.fullName || destination.name,
            category: categoryObj.name,
            categorySlug: categorySlug
          });
        } else {
          missingGuides.push({
            destination: destination.id,
            destinationName: destination.fullName || destination.name,
            category: categoryObj.name,
            categorySlug: categorySlug,
            region: regionName
          });
        }
      }
    }
  }
  
  console.log('\n━'.repeat(60));
  console.log(`\n📊 SUMMARY:`);
  console.log(`   ✅ Existing guides: ${existingGuides.length}`);
  console.log(`   ❌ Missing guides: ${missingGuides.length}`);
  
  if (missingGuides.length > 0) {
    console.log(`\n📋 MISSING GUIDES:`);
    missingGuides.forEach((guide, index) => {
      console.log(`   ${index + 1}. ${guide.destinationName} - ${guide.category}`);
    });
    
    // Save missing guides to file
    const missingFile = path.join(__dirname, '../missing-guides-report.json');
    fs.writeFileSync(missingFile, JSON.stringify({
      checkedAt: new Date().toISOString(),
      region: region || 'all',
      existing: existingGuides.length,
      missing: missingGuides.length,
      missingGuides: missingGuides
    }, null, 2));
    console.log(`\n💾 Missing guides saved to: ${missingFile}`);
  }
  
  return { missingGuides, existingGuides };
}

// Regenerate missing guides (reuse functions from generate-all-guides-batch.js)
async function regenerateMissingGuides(missingGuides) {
  console.log('\n🔄 REGENERATING MISSING GUIDES\n');
  console.log('━'.repeat(60));
  
  // Initialize Gemini
  const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
  if (!GEMINI_API_KEY) {
    console.error('❌ GEMINI_API_KEY not found in .env.local');
    process.exit(1);
  }
  
  const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
  const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash-lite' });
  
  // Pricing
  const costPerGuide = 0.000001; // Simplified for now
  
  let totalCost = 0;
  let successCount = 0;
  let failCount = 0;
  
  for (let i = 0; i < missingGuides.length; i++) {
    const guideInfo = missingGuides[i];
    const destination = findDestinationBySlug(guideInfo.destination);
    
    if (!destination) {
      console.log(`\n⚠️  [${i + 1}/${missingGuides.length}] Destination not found: ${guideInfo.destination}`);
      failCount++;
      continue;
    }
    
    console.log(`\n🎯 [${i + 1}/${missingGuides.length}] ${guideInfo.destinationName} - ${guideInfo.category}`);
    
    try {
      // Generate guide (reuse prompt from generate-all-guides-batch.js)
      const prompt = `You are a professional travel writer creating a comprehensive, SEO-optimized category guide for TopTours.ai, an aggregation platform that helps travelers discover and compare tours and activities from multiple operators (like Viator, GetYourGuide, etc.). TopTours.ai does NOT operate tours itself.

Create a detailed guide for "${guideInfo.category}" tours in ${destination.fullName || destination.name}.

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
    "title": "What to Expect on ${guideInfo.category} Tours",
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
- Make it specific to ${destination.fullName || destination.name} and ${guideInfo.category}
- Use realistic prices in USD or EUR
- Include 5-6 whyChoose items
- Include 3-4 tourTypes with 3-5 features each
- Include 5-6 whatToExpect items (Duration, Weather, Group Size, What's Included, Meeting Point, Costs)
- Include 6-8 expert tips
- Include 6-8 FAQs with natural, helpful answers
- All content should be accurate and helpful
- Write naturally - avoid sounding like AI or overly promotional

Return ONLY the JSON object, no markdown, no code blocks, no explanations.`;

      console.log(`   📝 Generating guide...`);
      const result = await model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();
      
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('Could not extract JSON from response');
      }
      
      const guideObject = JSON.parse(jsonMatch[0]);
      
      // Convert to database format
      let heroImage = guideObject.heroImage || guideObject.hero_image;
      if (heroImage === "null" || heroImage === null || heroImage === undefined) {
        heroImage = destinationImageMap[destination.id] || null;
      }
      
      const dbGuide = {
        destination_id: destination.id,
        category_slug: guideInfo.categorySlug,
        category_name: guideInfo.category,
        title: guideObject.title,
        subtitle: guideObject.subtitle,
        hero_image: heroImage,
        stats: guideObject.stats || null,
        introduction: guideObject.introduction,
        seo: guideObject.seo || null,
        why_choose: guideObject.whyChoose || guideObject.why_choose || null,
        tour_types: guideObject.tourTypes || guideObject.tour_types || null,
        what_to_expect: guideObject.whatToExpect || guideObject.what_to_expect || null,
        expert_tips: guideObject.expertTips || guideObject.expert_tips || [],
        faqs: guideObject.faqs || [],
      };
      
      // Save to database
      const { error: dbError } = await supabase
        .from('category_guides')
        .upsert(dbGuide, {
          onConflict: 'destination_id,category_slug',
        });
      
      if (dbError) {
        console.error(`   ❌ Database error: ${dbError.message}`);
        failCount++;
      } else {
        console.log(`   ✅ Generated & saved to database`);
        successCount++;
        totalCost += costPerGuide;
      }
      
      // Rate limiting
      await new Promise(resolve => setTimeout(resolve, 2000));
      
    } catch (error) {
      console.error(`   ❌ Error: ${error.message}`);
      failCount++;
    }
  }
  
  console.log('\n━'.repeat(60));
  console.log(`\n✅ REGENERATION COMPLETE!`);
  console.log(`   ✅ Success: ${successCount}`);
  console.log(`   ❌ Failed: ${failCount}`);
  console.log(`   💰 Estimated cost: $${totalCost.toFixed(2)}`);
}

// Main
async function main() {
  const args = process.argv.slice(2);
  const regionIndex = args.indexOf('--region');
  const region = regionIndex !== -1 ? args[regionIndex + 1] : null;
  const shouldRegenerate = args.includes('--regenerate');
  
  const { missingGuides } = await checkMissingGuides(region);
  
  if (missingGuides.length > 0 && shouldRegenerate) {
    console.log(`\n🔄 Starting regeneration of ${missingGuides.length} missing guides...`);
    await regenerateMissingGuides(missingGuides);
  } else if (missingGuides.length > 0) {
    console.log(`\n💡 To regenerate missing guides, run:`);
    console.log(`   node scripts/check-and-regenerate-missing-guides.js --region "${region || 'all'}" --regenerate`);
  } else {
    console.log(`\n✅ All guides are present in the database!`);
  }
}

main().catch(error => {
  console.error('\n❌ FATAL ERROR:', error);
  process.exit(1);
});

