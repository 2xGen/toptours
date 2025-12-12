/**
 * Script to generate category guides for selected US destinations
 * Run with: node scripts/generate-guides-for-selected-destinations.js
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load configuration
dotenv.config({ path: path.join(__dirname, '../.env.local') });

// Import destinations data from multiple sources
const destinationsDataPath = path.join(__dirname, '../src/data/destinationsData.js');
const destinationsContent = fs.readFileSync(destinationsDataPath, 'utf8');

// Extract destinations array (simple parsing)
const destinationsMatch = destinationsContent.match(/export const destinations = \[([\s\S]*?)\];/);
let destinations = [];
if (destinationsMatch) {
  destinations = eval(`[${destinationsMatch[1]}]`);
}

// Also load from generated content files for destinations not in destinationsData.js
const seoContentPath = path.join(__dirname, '../generated-destination-seo-content.json');
const fullContentPath = path.join(__dirname, '../generated-destination-full-content.json');

let seoContentData = {};
let fullContentData = {};

try {
  if (fs.existsSync(seoContentPath)) {
    seoContentData = JSON.parse(fs.readFileSync(seoContentPath, 'utf8'));
  }
  if (fs.existsSync(fullContentPath)) {
    fullContentData = JSON.parse(fs.readFileSync(fullContentPath, 'utf8'));
  }
} catch (error) {
  console.warn('Could not load generated content files:', error.message);
}

// Selected destinations from the user's list
const SELECTED_DESTINATIONS = [
  // Tier 1 Cities
  'san diego',
  'seattle',
  'portland',
  'boston',
  'philadelphia',
  'dallas',
  'austin',
  'houston',
  'san antonio',
  'charleston',
  'savannah',
  'scottsdale',
  'phoenix',
  // National Parks
  'yosemite',
  'yellowstone',
  'grand teton',
  'grand canyon',
  'zion',
  'bryce canyon',
  'arches',
  'rocky mountain',
  'glacier',
  'mount rainier',
  // Tier 2 Cities
  'minneapolis',
  'milwaukee',
  'kansas city',
  'st. louis',
  'indianapolis',
  'columbus',
  'cincinnati',
  'providence',
  'buffalo',
  'anchorage',
  'juneau',
  'fairbanks'
];

// Initialize Gemini
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
if (!GEMINI_API_KEY) {
  console.error('❌ GEMINI_API_KEY not found in .env.local');
  process.exit(1);
}

const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
// Using gemini-2.5-flash-lite - cheapest and most cost-effective model
const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash-lite' });

// Helper to find destination by name (fuzzy matching)
function findDestinationByName(searchName) {
  const searchLower = searchName.toLowerCase().trim();
  const searchNormalized = searchLower.replace(/[^a-z0-9]/g, '');
  
  // First check destinationsData.js - prioritize exact matches
  let found = destinations.find(d => {
    const name = (d.fullName || d.name).toLowerCase();
    const nameNormalized = name.replace(/[^a-z0-9]/g, '');
    // Exact match first
    if (name === searchLower || nameNormalized === searchNormalized) return true;
    // Then check if search term is contained in name (but not vice versa to avoid false matches)
    if (name.includes(searchLower)) return true;
    // Only check if search contains name if name is at least 4 chars (to avoid "phi" matching "delphi")
    if (name.length >= 4 && searchLower.includes(name)) return true;
    return false;
  });
  
  if (found) {
    return {
      id: found.id,
      name: found.fullName || found.name,
      fullName: found.fullName || found.name,
      country: found.country || 'United States',
      category: found.category || 'North America',
      briefDescription: found.briefDescription || '',
      imageUrl: found.imageUrl || null,
      tourCategories: found.tourCategories || [],
      destinationId: found.destinationId || null,
    };
  }
  
  // Check generated content - prioritize exact matches
  for (const [slug, content] of Object.entries(fullContentData)) {
    const destName = (content.destinationName || slug).toLowerCase();
    const destNameNormalized = destName.replace(/[^a-z0-9]/g, '');
    // Exact match first
    if (destName === searchLower || destNameNormalized === searchNormalized) {
      const seoContent = seoContentData[slug];
      return {
        id: slug,
        name: content.destinationName || slug,
        fullName: content.destinationName || slug,
        country: content.country || 'United States',
        category: content.region || 'North America',
        briefDescription: content.briefDescription || seoContent?.briefDescription || '',
        imageUrl: content.imageUrl || seoContent?.imageUrl || seoContent?.ogImage || null,
        tourCategories: content.tourCategories || [],
        destinationId: null,
      };
    }
    // Then check if search term is contained in name (but not vice versa to avoid false matches)
    if (destName.includes(searchLower)) {
      const seoContent = seoContentData[slug];
      return {
        id: slug,
        name: content.destinationName || slug,
        fullName: content.destinationName || slug,
        country: content.country || 'United States',
        category: content.region || 'North America',
        briefDescription: content.briefDescription || seoContent?.briefDescription || '',
        imageUrl: content.imageUrl || seoContent?.imageUrl || seoContent?.ogImage || null,
        tourCategories: content.tourCategories || [],
        destinationId: null,
      };
    }
    // Only check if search contains name if name is at least 4 chars (to avoid "phi" matching "delphi")
    if (destName.length >= 4 && searchLower.includes(destName)) {
      const seoContent = seoContentData[slug];
      return {
        id: slug,
        name: content.destinationName || slug,
        fullName: content.destinationName || slug,
        country: content.country || 'United States',
        category: content.region || 'North America',
        briefDescription: content.briefDescription || seoContent?.briefDescription || '',
        imageUrl: content.imageUrl || seoContent?.imageUrl || seoContent?.ogImage || null,
        tourCategories: content.tourCategories || [],
        destinationId: null,
      };
    }
  }
  
  return null;
}

// Helper to find destination by slug (from existing script)
function findDestinationBySlug(slug) {
  // First check destinationsData.js
  let dest = destinations.find(d => d.id === slug);
  if (dest) return dest;
  
  // Check generated SEO content
  const seoContent = seoContentData[slug];
  const fullContent = fullContentData[slug];
  
  if (seoContent || fullContent) {
    const content = fullContent || seoContent;
    return {
      id: slug,
      name: content?.destinationName || seoContent?.destinationName || slug,
      fullName: content?.destinationName || seoContent?.destinationName || slug,
      country: content?.country || seoContent?.country || 'United States',
      category: content?.region || seoContent?.region || 'North America',
      briefDescription: content?.briefDescription || seoContent?.briefDescription || '',
      imageUrl: content?.imageUrl || seoContent?.ogImage || null,
      tourCategories: content?.tourCategories || [],
      destinationId: null,
    };
  }
  
  return null;
}

// Generate guide for a single category
async function generateGuideWithGemini(destination, category) {
  try {
    const categoryName = typeof category === 'string' ? category : category.name;
    
    // Get destination context
    const destinationContext = `
Destination: ${destination.fullName || destination.name}
Country: ${destination.country || 'United States'}
Brief Description: ${destination.briefDescription || 'A popular travel destination'}
${destination.imageUrl ? `Image URL: ${destination.imageUrl}` : ''}
`;

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
  "introduction": "2-3 paragraph engaging introduction (300-400 words) that sets the scene and explains what makes this category special in this destination. Use the destination's imageUrl if available.",
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
- Use realistic prices in USD
- Include 5-6 whyChoose items
- Include 3-4 tourTypes with 3-5 features each
- Include 5-6 whatToExpect items (Duration, Weather, Group Size, What's Included, Meeting Point, Costs)
- Include 6-8 expert tips
- Include 6-8 FAQs with natural, helpful answers
- All content should be accurate and helpful
- Write naturally - avoid sounding like AI or overly promotional

Return ONLY the JSON object, no markdown, no code blocks, no explanations.`;

    console.log(`   🤖 Calling Gemini API for ${categoryName}...`);
    
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    // Extract JSON from response
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('Could not extract JSON from response');
    }
    
    const guideObject = JSON.parse(jsonMatch[0]);
    
    // Add category slug
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
    console.error(`❌ Error generating guide for ${destination.name} - ${category.name}:`, error.message);
    return null;
  }
}

// Generate guides for a destination
async function generateGuidesForDestination(destination) {
  console.log(`\n🎯 Generating guides for ${destination.fullName || destination.name}...`);
  
  if (!destination.tourCategories || destination.tourCategories.length === 0) {
    console.log(`   ⚠️  No tour categories defined - skipping`);
    return null;
  }
  
  const guides = {};
  
  // Generate guides for all categories (we'll set hasGuide: true after)
  for (let i = 0; i < destination.tourCategories.length; i++) {
    const category = destination.tourCategories[i];
    const categoryObj = typeof category === 'string' ? { name: category } : category;
    
    // Skip if already has guide
    if (categoryObj.hasGuide === true) {
      console.log(`   ⏭️  Skipping ${categoryObj.name} - guide already exists`);
      continue;
    }
    
    console.log(`   📝 Generating: ${categoryObj.name}...`);
    
    const guide = await generateGuideWithGemini(destination, categoryObj);
    
    if (guide) {
      const categorySlug = categoryObj.name.toLowerCase().replace(/ /g, '-').replace(/&/g, 'and');
      guides[categorySlug] = guide;
      console.log(`   ✅ Generated: ${categoryObj.name}`);
      
      // Add delay to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 2000));
    } else {
      console.log(`   ❌ Failed: ${categoryObj.name}`);
    }
  }
  
  return guides;
}

// Main execution
async function main() {
  console.log('\n🚀 GENERATING GUIDES FOR SELECTED US DESTINATIONS\n');
  console.log('━'.repeat(60));
  console.log(`📋 Processing ${SELECTED_DESTINATIONS.length} destinations\n`);
  
  const allGeneratedGuides = {};
  const foundDestinations = [];
  const notFoundDestinations = [];
  
  // Find all destinations
  for (const destName of SELECTED_DESTINATIONS) {
    const dest = findDestinationByName(destName);
    if (dest) {
      foundDestinations.push(dest);
      console.log(`✅ Found: ${dest.fullName || dest.name}`);
    } else {
      notFoundDestinations.push(destName);
      console.log(`❌ Not found: ${destName}`);
    }
  }
  
  console.log(`\n📊 Summary:`);
  console.log(`   ✅ Found: ${foundDestinations.length}`);
  console.log(`   ❌ Not found: ${notFoundDestinations.length}`);
  
  if (notFoundDestinations.length > 0) {
    console.log(`\n⚠️  Destinations not found in database:`);
    notFoundDestinations.forEach(d => console.log(`   - ${d}`));
    console.log(`\n💡 These may need to be added to generated-destination-full-content.json first.`);
  }
  
  if (foundDestinations.length === 0) {
    console.error(`\n❌ No destinations found. Exiting.`);
    process.exit(1);
  }
  
  console.log(`\n🧪 GENERATING GUIDES FOR ${foundDestinations.length} DESTINATIONS\n`);
  
  // Generate guides
  for (const destination of foundDestinations) {
    const guides = await generateGuidesForDestination(destination);
    if (guides && Object.keys(guides).length > 0) {
      allGeneratedGuides[destination.id] = guides;
    }
  }
  
  // Save to file
  const outputPath = path.join(__dirname, '../generated-guides-selected-destinations.js');
  const outputContent = `// AUTO-GENERATED CATEGORY GUIDES FOR SELECTED US DESTINATIONS
// Generated on: ${new Date().toISOString()}
// Review this content before integrating into database

export const generatedGuides = ${JSON.stringify(allGeneratedGuides, null, 2)};

// INTEGRATION INSTRUCTIONS:
// 1. Review each guide for quality and accuracy
// 2. Check all prices, facts, and details are correct
// 3. Use scripts/import-guides-to-database.js to import into Supabase
// 4. Update generated-destination-full-content.json to set hasGuide: true for all categories
// 5. Test on localhost before deploying
`;
  
  fs.writeFileSync(outputPath, outputContent);
  
  console.log('\n━'.repeat(60));
  console.log(`\n✅ GENERATION COMPLETE!`);
  console.log(`📁 Output saved to: generated-guides-selected-destinations.js`);
  console.log(`📊 Generated guides for ${Object.keys(allGeneratedGuides).length} destinations`);
  console.log(`📝 Total guides created: ${Object.values(allGeneratedGuides).reduce((sum, guides) => sum + Object.keys(guides).length, 0)}`);
  console.log(`\n👀 NEXT STEPS:`);
  console.log(`   1. Review generated-guides-selected-destinations.js for quality`);
  console.log(`   2. Verify pricing and factual accuracy`);
  console.log(`   3. Run: node scripts/import-guides-to-database.js`);
  console.log(`   4. Update generated-destination-full-content.json to set hasGuide: true`);
  console.log(`   5. Test on localhost`);
}

// Run the script
main().catch(error => {
  console.error('\n❌ FATAL ERROR:', error);
  process.exit(1);
});

