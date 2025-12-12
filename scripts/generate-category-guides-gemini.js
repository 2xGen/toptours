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
const viatorDestinationsPath = path.join(__dirname, '../src/data/viatorDestinationsClassified.json');

let seoContentData = {};
let fullContentData = {};
let viatorDestinations = [];

try {
  if (fs.existsSync(seoContentPath)) {
    seoContentData = JSON.parse(fs.readFileSync(seoContentPath, 'utf8'));
  }
  if (fs.existsSync(fullContentPath)) {
    fullContentData = JSON.parse(fs.readFileSync(fullContentPath, 'utf8'));
  }
  if (fs.existsSync(viatorDestinationsPath)) {
    viatorDestinations = JSON.parse(fs.readFileSync(viatorDestinationsPath, 'utf8'));
  }
} catch (error) {
  console.warn('Could not load generated content files:', error.message);
}

// Helper to find destination by slug from all sources
function findDestinationBySlug(slug) {
  // First check destinationsData.js
  let dest = destinations.find(d => d.id === slug);
  if (dest) return dest;
  
  // Check generated SEO content
  const seoContent = seoContentData[slug];
  const fullContent = fullContentData[slug];
  
  if (seoContent || fullContent) {
    const content = fullContent || seoContent;
    const viatorDest = viatorDestinations.find(d => {
      const destSlug = (d.destinationName || '').toLowerCase().replace(/[^a-z0-9]+/g, '-');
      return destSlug === slug || (d.destinationName || '').toLowerCase() === slug;
    });
    
    return {
      id: slug,
      name: content?.destinationName || seoContent?.destinationName || slug,
      fullName: content?.destinationName || seoContent?.destinationName || slug,
      country: content?.country || seoContent?.country || viatorDest?.country || null,
      category: content?.region || seoContent?.region || viatorDest?.region || 'Europe',
      briefDescription: content?.briefDescription || seoContent?.briefDescription || '',
      imageUrl: content?.imageUrl || seoContent?.ogImage || null,
      tourCategories: content?.tourCategories || [], // May need to be generated
      destinationId: viatorDest?.destinationId || null,
    };
  }
  
  return null;
}

// Initialize Gemini
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
if (!GEMINI_API_KEY) {
  console.error('❌ GEMINI_API_KEY not found in environment variables');
  process.exit(1);
}

const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
// Using gemini-2.5-flash-lite - cheapest and most cost-effective model ($0.10 input, $0.40 output per 1M tokens)
// Alternative: gemini-2.0-flash-lite is even cheaper ($0.075 input, $0.30 output) but older
const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash-lite' });

// Load example guide for style reference
const exampleGuidePath = path.join(__dirname, '../app/destinations/[id]/guides/guidesData.js');
const exampleContent = fs.readFileSync(exampleGuidePath, 'utf8');

// Extract an example guide (Aruba Sunset Cruises)
const exampleMatch = exampleContent.match(/'sunset-cruises':\s*\{([\s\S]*?)\n\s*\},/);
let exampleGuide = null;
if (exampleMatch) {
  try {
    // Parse the example guide structure
    const exampleText = exampleMatch[1];
    exampleGuide = {
      hasStats: exampleText.includes('stats:'),
      hasWhyChoose: exampleText.includes('whyChoose:'),
      hasTourTypes: exampleText.includes('tourTypes:'),
      hasWhatToExpect: exampleText.includes('whatToExpect:'),
      hasExpertTips: exampleText.includes('expertTips:'),
      hasFaqs: exampleText.includes('faqs:'),
    };
  } catch (error) {
    console.warn('Could not parse example guide, continuing without it');
  }
}

// Quality-focused prompt template
const createGuidePrompt = (destination, category) => {
  return `You are an expert travel content writer creating comprehensive SEO-optimized tour category guides for TopTours.ai.

DESTINATION: ${destination.fullName || destination.name}
CATEGORY: ${category.name}
DESTINATION INFO:
- Location: ${destination.country || destination.fullName}
- Region: ${destination.category}
- Description: ${destination.briefDescription}
- Image URL: ${destination.imageUrl}

IMPORTANT: TopTours.ai is a tour aggregation platform - we do NOT offer tours ourselves. We connect travelers with tours from providers like Viator. Write in a neutral, informative style - NEVER use "our tours", "we offer", "your golden ticket", or any language suggesting we operate tours.

WRITING STYLE:
- Write like a professional travel guide or destination expert - knowledgeable, authoritative, and helpful
- Natural, conversational but professional tone - not overly enthusiastic or salesy
- Avoid AI clichés: "Prepare to be amazed", "Get ready to", "Step into a world", excessive exclamation marks
- Use varied sentence structures - mix short and long sentences
- Write with deep knowledge of the destination - like a guide who knows the area intimately
- Be specific and descriptive without being flowery
- Sound knowledgeable and helpful, not robotic or overly casual
- Avoid repetitive patterns or formulaic phrases
- Write as a knowledgeable guide sharing information - don't imply personal experience, just demonstrate expertise

TASK: Create a comprehensive guide for "${destination.fullName} ${category.name}" following this EXACT structure:

{
  title: 'Destination Category Tours',
  subtitle: 'Compelling 15-20 word subtitle highlighting unique aspects and appeal',
  categoryName: '${category.name}',
  heroImage: '${destination.imageUrl}',
  stats: { 
    toursAvailable: 12-25 (estimate based on destination size/popularity),
    priceFrom: XX (realistic starting price in USD or EUR),
    duration: 'typical duration range'
  },
  introduction: \`Write a natural, informative 150-200 word introduction. Write like a travel writer who has actually been there - specific, descriptive, and helpful. Use phrases like "[Destination] [Category] tours take you..." or "These tours..." or "Discover..." - NEVER "our tours", "we offer", "prepare to", "get ready to", or "step into a world". 

Describe what travelers will experience, specific attractions they'll visit, what makes this category special. Use varied sentence structures. Be specific about locations, experiences, and what makes it unique. Write naturally - not overly enthusiastic or formulaic.

Example of good style:
"Step back in time as you wander through Marbella's enchanting Old Town, where narrow cobblestone streets wind past whitewashed buildings adorned with colorful flower pots and wrought-iron balconies. This historic quarter, dating back to Moorish times, offers a perfect blend of Andalusian charm, Spanish culture, and Mediterranean beauty. Marbella Old Town walking tours take you through the Orange Square (Plaza de los Naranjos), past the 15th-century town hall, into charming tapas bars, and through hidden courtyards that reveal centuries of history. Experience the authentic side of Marbella beyond the glitz of Puerto Banús, discover local artisans, taste traditional Andalusian cuisine, and immerse yourself in the laid-back atmosphere that makes this one of the Costa del Sol's most beloved destinations."

Notice: Natural flow, specific details, varied sentences, no clichés, informative without being salesy.\`,
  seo: {
    title: 'SEO-optimized title under 60 chars with year 2025',
    description: 'Compelling 150-160 char meta description with keywords and call-to-action',
    keywords: 'Primary keywords, secondary keywords, long-tail keywords'
  },
  whyChoose: [
    { icon: 'IconName', title: 'Benefit Title', description: 'Specific compelling reason highlighting unique advantage or appeal' },
    { icon: 'IconName', title: 'Benefit Title', description: 'Specific compelling reason highlighting unique advantage or appeal' },
    { icon: 'IconName', title: 'Benefit Title', description: 'Specific compelling reason highlighting unique advantage or appeal' },
    { icon: 'IconName', title: 'Benefit Title', description: 'Specific compelling reason highlighting unique advantage or appeal' },
    { icon: 'IconName', title: 'Benefit Title', description: 'Specific compelling reason highlighting unique advantage or appeal' },
    { icon: 'IconName', title: 'Benefit Title', description: 'Specific compelling reason highlighting unique advantage or appeal' }
  ],
  tourTypes: [
    { icon: 'IconName', title: 'Tour Type Name', description: 'What this tour type offers - 2 sentences.', features: ['Feature 1', 'Feature 2', 'Feature 3', 'Feature 4', 'Feature 5'] },
    { icon: 'IconName', title: 'Tour Type Name', description: 'What this tour type offers - 2 sentences.', features: ['Feature 1', 'Feature 2', 'Feature 3', 'Feature 4', 'Feature 5'] },
    { icon: 'IconName', title: 'Tour Type Name', description: 'What this tour type offers - 2 sentences.', features: ['Feature 1', 'Feature 2', 'Feature 3', 'Feature 4', 'Feature 5'] },
    { icon: 'IconName', title: 'Tour Type Name', description: 'What this tour type offers - 2 sentences.', features: ['Feature 1', 'Feature 2', 'Feature 3', 'Feature 4', 'Feature 5'] }
  ],
  whatToExpect: {
    title: 'What to Expect on Destination Category Tours',
    items: [
      { icon: 'Clock', title: 'Duration', description: 'Specific duration details for different tour types' },
      { icon: 'IconName', title: 'Title', description: 'Specific detail about this aspect of the tours' },
      { icon: 'IconName', title: 'Title', description: 'Specific detail about this aspect of the tours' },
      { icon: 'IconName', title: 'Title', description: 'Specific detail about this aspect of the tours' },
      { icon: 'IconName', title: 'Title', description: 'Specific detail about this aspect of the tours' },
      { icon: 'IconName', title: 'Title', description: 'Specific detail about this aspect of the tours' }
    ]
  },
  expertTips: [
    'Specific actionable tip with insider knowledge',
    'Specific actionable tip with insider knowledge',
    'Specific actionable tip with insider knowledge',
    'Specific actionable tip with insider knowledge',
    'Specific actionable tip with insider knowledge',
    'Specific actionable tip with insider knowledge',
    'Specific actionable tip with insider knowledge',
    'Specific actionable tip with insider knowledge'
  ],
  faqs: [
    { question: 'Specific question travelers would ask?', answer: 'Comprehensive 100-150 word answer with specific details, practical information, and insider knowledge. Write naturally and helpfully - like answering a friend's question. Include specifics like prices, times, tips. Be informative without being overly enthusiastic.' },
    { question: 'Specific question travelers would ask?', answer: 'Comprehensive 100-150 word answer...' },
    { question: 'Specific question travelers would ask?', answer: 'Comprehensive 100-150 word answer...' },
    { question: 'Specific question travelers would ask?', answer: 'Comprehensive 100-150 word answer...' },
    { question: 'Specific question travelers would ask?', answer: 'Comprehensive 100-150 word answer...' },
    { question: 'Specific question travelers would ask?', answer: 'Comprehensive 100-150 word answer...' },
    { question: 'Specific question travelers would ask?', answer: 'Comprehensive 100-150 word answer...' },
    { question: 'Specific question travelers would ask?', answer: 'Comprehensive 100-150 word answer...' }
  ]
}

AVAILABLE ICONS (use ONLY these): 
Sun, Waves, Heart, Users, Camera, GlassWater, Music, Star, Clock, MapPin, DollarSign, Calendar, Anchor, Shirt, BookOpen, Sailboat, Ship, PartyPopper, HeartHandshake

QUALITY REQUIREMENTS:
1. Be SPECIFIC - mention actual attractions, sites, activities by name
2. Write naturally - like a professional travel writer, not AI-generated content
3. Avoid AI clichés: "Prepare to", "Get ready to", "Step into", "Unlock", "Embark on", excessive exclamation marks
4. Use varied sentence structures - mix short punchy sentences with longer descriptive ones
5. NEVER use "our", "we", "your golden ticket", or any language suggesting TopTours.ai operates tours
6. Use neutral phrasing: "[Destination] [Category] tours take you..." or "These tours..." or "Discover..."
7. Sound knowledgeable and helpful - like a professional guide with deep destination expertise
8. Include REALISTIC pricing estimates in USD or EUR (match destination currency)
9. Make FAQs 100-150 words each with DETAILED information - write naturally, not formulaically
10. Expert tips should be ACTIONABLE insider knowledge - write like a local sharing real tips
11. Introduction should be COMPREHENSIVE (150-200 words) with specific details and natural flow
12. Use destination-specific knowledge, not generic content
13. Write as a professional travel guide or destination expert - informative, engaging, and naturally authoritative
14. Avoid repetitive patterns - each section should have its own voice and structure

EXAMPLE HIGH-QUALITY FAQ (for reference):
{ question: 'What is la bandera?', answer: 'Dominican national dish meaning "the flag." Rice, red beans, stewed meat (chicken, beef, or pork), salad. Simple but flavorful. Represents Dominican flag colors. Lunch staple. Every restaurant serves it. Authentic taste of Dominican home cooking. Usually very affordable ($5-10). Essential Dominican food experience!' }

OUTPUT: Return ONLY the JavaScript object, properly formatted. No markdown, no explanations, just the pure JavaScript object.`;
};

// Function to call Gemini API
async function generateGuideWithGemini(destination, category) {
  const prompt = createGuidePrompt(destination, category);
  
  try {
    console.log(`   🤖 Calling Gemini API for ${category.name}...`);
    
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const generatedContent = response.text();
    
    // Extract JavaScript object from response
    const objectMatch = generatedContent.match(/\{[\s\S]*\}/);
    if (!objectMatch) {
      throw new Error('Could not extract guide object from response');
    }
    
    // Parse the JavaScript object
    const guideObject = eval(`(${objectMatch[0]})`);
    
    // Add category slug (normalize like the URL generation does)
    const categorySlug = category.name
      .toLowerCase()
      .normalize('NFD').replace(/[\u0300-\u036f]/g, '') // Remove accents
      .replace(/&/g, 'and')
      .replace(/'/g, '') // Remove apostrophes
      .replace(/\./g, '') // Remove periods
      .replace(/\s+/g, '-'); // Replace spaces with hyphens
    guideObject.categorySlug = categorySlug;
    
    return guideObject;
    
  } catch (error) {
    console.error(`❌ Error generating guide for ${destination.name} - ${category.name}:`, error.message);
    return null;
  }
}

// Main generation function
async function generateGuidesForDestination(destination) {
  console.log(`\n🎯 Generating guides for ${destination.fullName || destination.name}...`);
  
  if (!destination.tourCategories || destination.tourCategories.length === 0) {
    console.log(`   ⚠️  No tour categories defined - skipping`);
    return null;
  }
  
  const guides = {};
  
  // Only generate guides for categories that don't already have hasGuide: true
  // This avoids regenerating guides that already exist (like Amsterdam, Rotterdam, Utrecht)
  for (let i = 0; i < destination.tourCategories.length; i++) {
    const category = destination.tourCategories[i];
    const categoryObj = typeof category === 'string' ? { name: category } : category;
    
    // Skip if this category already has a guide
    if (categoryObj.hasGuide === true) {
      console.log(`   ⏭️  Skipping ${categoryObj.name} - guide already exists`);
      continue;
    }
    
    const categorySlug = categoryObj.name.toLowerCase().replace(/ /g, '-').replace(/&/g, 'and');
    
    console.log(`   📝 Generating: ${categoryObj.name}...`);
    
    const guide = await generateGuideWithGemini(destination, categoryObj);
    
    if (guide) {
      guides[categorySlug] = guide;
      console.log(`   ✅ Generated: ${categoryObj.name}`);
      
      // Add small delay to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 2000));
    } else {
      console.log(`   ❌ Failed: ${categoryObj.name}`);
    }
  }
  
  return guides;
}

// Default tour categories for destinations without categories defined
const DEFAULT_TOUR_CATEGORIES = [
  { name: 'Walking Tours', hasGuide: false },
  { name: 'Cultural Tours', hasGuide: false },
  { name: 'Food & Drink Tours', hasGuide: false },
  { name: 'Historical Tours', hasGuide: false },
  { name: 'Nature & Outdoor Tours', hasGuide: false },
  { name: 'Adventure Tours', hasGuide: false }
];

// Destination-specific category mappings (only for destinations without categories in generated content)
const DESTINATION_CATEGORIES = {
  // Add destination-specific categories here only if they're missing from generated content files
};

// Main execution
async function main() {
  console.log('\n🚀 STARTING GEMINI-POWERED GUIDE GENERATION\n');
  console.log('━'.repeat(60));
  
  const allGeneratedGuides = {};
  
  // Process destinations based on command line arguments
  // Usage examples:
  //   node generate-category-guides-gemini.js rotterdam,utrecht,malaga  (specific destinations)
  //   node generate-category-guides-gemini.js --country netherlands     (all destinations in country)
  //   node generate-category-guides-gemini.js --region europe            (all destinations in region)
  //   node generate-category-guides-gemini.js --all                      (all destinations with guides)
  
  let testDestinationIds = [];
  
  if (process.argv.includes('--country')) {
    const countryIndex = process.argv.indexOf('--country');
    const country = process.argv[countryIndex + 1];
    if (!country) {
      console.error('❌ Please specify a country: --country netherlands');
      process.exit(1);
    }
    console.log(`\n🌍 Finding all destinations in ${country}...`);
    
    // Find all destinations in this country from generated content that have tourCategories
    // We'll generate guides for all categories, not just those with hasGuide: true
    const countryDests = Object.keys(fullContentData || {})
      .filter(slug => {
        const content = fullContentData[slug];
        return content && 
               content.country && 
               content.country.toLowerCase() === country.toLowerCase() &&
               content.tourCategories && 
               content.tourCategories.length > 0;
      });
    
    testDestinationIds = countryDests;
    console.log(`✅ Found ${countryDests.length} destinations in ${country} with tour categories`);
  } else if (process.argv.includes('--region')) {
    const regionIndex = process.argv.indexOf('--region');
    const region = process.argv[regionIndex + 1];
    if (!region) {
      console.error('❌ Please specify a region: --region europe');
      process.exit(1);
    }
    console.log(`\n🌍 Finding all destinations in ${region}...`);
    
    // Find all destinations in this region from generated content that have tourCategories
    const regionDests = Object.keys(fullContentData || {})
      .filter(slug => {
        const content = fullContentData[slug];
        return content && 
               content.region && 
               content.region.toLowerCase() === region.toLowerCase() &&
               content.tourCategories && 
               content.tourCategories.length > 0;
      });
    
    testDestinationIds = regionDests;
    console.log(`✅ Found ${regionDests.length} destinations in ${region} with tour categories`);
  } else if (process.argv.includes('--all')) {
    console.log(`\n🌍 Finding all destinations with tour categories...`);
    
    // Find all destinations that have tourCategories (we'll generate guides for all)
    const allDestsWithCategories = Object.keys(fullContentData || {})
      .filter(slug => {
        const content = fullContentData[slug];
        return content && content.tourCategories && content.tourCategories.length > 0;
      });
    
    testDestinationIds = allDestsWithCategories;
    console.log(`✅ Found ${allDestsWithCategories.length} destinations with tour categories`);
    console.log(`⚠️  WARNING: This will generate approximately ${allDestsWithCategories.length * 6} guides. This may take a long time and cost money.`);
  } else {
    // Default: process specific destinations from command line or default to malaga
    testDestinationIds = process.argv[2] ? process.argv[2].split(',') : ['malaga'];
  }
  
  // Find destinations from all sources
  const testBatch = [];
  for (const destId of testDestinationIds) {
    let dest = destinations.find(d => d.id === destId);
    if (!dest) {
      dest = findDestinationBySlug(destId);
    }
    if (dest) {
      // Ensure tourCategories exist - check destination-specific first, then defaults
      if (!dest.tourCategories || dest.tourCategories.length === 0) {
        if (DESTINATION_CATEGORIES[destId]) {
          console.log(`✅ Using destination-specific categories for ${dest.name}`);
          dest.tourCategories = DESTINATION_CATEGORIES[destId];
        } else {
          console.log(`⚠️  ${dest.name} has no tourCategories - using defaults`);
          dest.tourCategories = DEFAULT_TOUR_CATEGORIES;
        }
      }
      
      // Check if destination has tourCategories
      if (!dest.tourCategories || dest.tourCategories.length === 0) {
        console.log(`⚠️  Skipping ${dest.name} - no tourCategories defined`);
        continue;
      }
      
      // Check if ALL categories already have guides (hasGuide: true)
      const allCategoriesHaveGuides = dest.tourCategories.every(cat => {
        const categoryObj = typeof cat === 'object' ? cat : { name: cat };
        return categoryObj.hasGuide === true;
      });
      
      if (allCategoriesHaveGuides) {
        console.log(`⏭️  Skipping ${dest.name} - all categories already have guides`);
        continue;
      }
      
      // Check how many categories need guides
      const categoriesNeedingGuides = dest.tourCategories.filter(cat => {
        const categoryObj = typeof cat === 'object' ? cat : { name: cat };
        return categoryObj.hasGuide !== true;
      });
      
      if (categoriesNeedingGuides.length > 0) {
        console.log(`✅ Including ${dest.name} - ${categoriesNeedingGuides.length} of ${dest.tourCategories.length} categories need guides`);
        testBatch.push(dest);
      }
    } else {
      console.error(`❌ Destination not found: ${destId}`);
    }
  }
  
  if (testBatch.length === 0) {
    console.error(`❌ No destinations found with guides for: ${testDestinationIds.length > 10 ? `${testDestinationIds.length} destinations` : testDestinationIds.join(', ')}`);
    process.exit(1);
  }
  
  console.log(`\n🧪 GENERATING GUIDES FOR: ${testBatch.length} destination(s)`);
  if (testBatch.length <= 10) {
    console.log(`   ${testBatch.map(d => d.fullName || d.name).join(', ')}\n`);
  } else {
    console.log(`   (First 10: ${testBatch.slice(0, 10).map(d => d.fullName || d.name).join(', ')}...)\n`);
  }
  
  for (const destination of testBatch) {
    const guides = await generateGuidesForDestination(destination);
    if (guides && Object.keys(guides).length > 0) {
      allGeneratedGuides[destination.id] = guides;
    }
  }
  
  // Save to file
  const outputPath = path.join(__dirname, '../generated-guides-gemini-output.js');
  
  // Also create a summary of which destinations had guides generated
  const summary = Object.keys(allGeneratedGuides).map(destId => {
    const dest = testBatch.find(d => d.id === destId);
    const guideCount = Object.keys(allGeneratedGuides[destId] || {}).length;
    return {
      destinationId: destId,
      destinationName: dest?.fullName || dest?.name || destId,
      guidesGenerated: guideCount,
      categories: Object.keys(allGeneratedGuides[destId] || {})
    };
  });
  
  const outputContent = `// AUTO-GENERATED CATEGORY GUIDES (Gemini API)
// Generated on: ${new Date().toISOString()}
// Review this content before integrating into database

export const generatedGuides = ${JSON.stringify(allGeneratedGuides, null, 2)};

// SUMMARY:
// Generated guides for ${Object.keys(allGeneratedGuides).length} destination(s)
// Total guides: ${Object.values(allGeneratedGuides).reduce((sum, guides) => sum + Object.keys(guides).length, 0)}
${summary.length > 0 ? `\n// Destinations:\n${summary.map(s => `//   - ${s.destinationName}: ${s.guidesGenerated} guides`).join('\n')}` : ''}

// INTEGRATION INSTRUCTIONS:
// 1. Review each guide for quality and accuracy
// 2. Check all prices, facts, and details are correct
// 3. Use scripts/import-guides-to-database.js to import into Supabase
// 4. Update generated-destination-full-content.json to set hasGuide: true for all categories that got guides
// 5. Test on localhost before deploying
`;
  
  fs.writeFileSync(outputPath, outputContent);
  
  console.log('\n━'.repeat(60));
  console.log(`\n✅ GENERATION COMPLETE!`);
  console.log(`📁 Output saved to: generated-guides-gemini-output.js`);
  console.log(`📊 Generated guides for ${Object.keys(allGeneratedGuides).length} destinations`);
  console.log(`📝 Total guides created: ${Object.values(allGeneratedGuides).reduce((sum, guides) => sum + Object.keys(guides).length, 0)}`);
  console.log(`\n👀 NEXT STEPS:`);
  console.log(`   1. Review generated-guides-gemini-output.js for quality`);
  console.log(`   2. Verify pricing and factual accuracy`);
  console.log(`   3. Run: node scripts/import-guides-to-database.js`);
  console.log(`   4. Test on localhost`);
}

// Run the script
main().catch(error => {
  console.error('\n❌ FATAL ERROR:', error);
  process.exit(1);
});

