const fs = require('fs');
const path = require('path');
const { OPENAI_API_KEY } = require('../config/api-keys');

// Import destinations data
const destinationsDataPath = path.join(__dirname, '../src/data/destinationsData.js');
const destinationsContent = fs.readFileSync(destinationsDataPath, 'utf8');

// Extract destinations array (simple parsing)
const destinationsMatch = destinationsContent.match(/export const destinations = \[([\s\S]*?)\];/);
if (!destinationsMatch) {
  console.error('Could not find destinations array');
  process.exit(1);
}

// Parse destinations (we'll use eval in controlled environment)
const destinations = eval(`[${destinationsMatch[1]}]`);

// Import existing guides
const guidesDataPath = path.join(__dirname, '../app/destinations/[id]/guides/guidesData.js');
const guidesContent = fs.readFileSync(guidesDataPath, 'utf8');

// Find destinations that already have guides
const existingDestinations = [];
const destMatches = guidesContent.matchAll(/^  '?([a-z-]+)'?: \{$/gm);
for (const match of destMatches) {
  if (!existingDestinations.includes(match[1])) {
    existingDestinations.push(match[1]);
  }
}

console.log('\n📊 GUIDE GENERATION STATUS:');
console.log(`✅ Destinations with guides: ${existingDestinations.length}`);
console.log(`⏳ Destinations needing guides: ${destinations.length - existingDestinations.length}`);
console.log(`📝 Total guides to generate: ${(destinations.length - existingDestinations.length) * 6}\n`);

// Filter destinations that need guides
const destinationsNeedingGuides = destinations.filter(dest => 
  !existingDestinations.includes(dest.id)
);

if (destinationsNeedingGuides.length === 0) {
  console.log('✅ All destinations already have guides!');
  process.exit(0);
}

console.log('🎯 Destinations needing guides:');
destinationsNeedingGuides.forEach((dest, i) => {
  console.log(`   ${i + 1}. ${dest.fullName || dest.name} (${dest.category})`);
});

// Quality-focused prompt template
const createGuidePrompt = (destination, category) => {
  return `You are an expert travel content writer creating comprehensive SEO-optimized tour category guides.

DESTINATION: ${destination.fullName || destination.name}
CATEGORY: ${category.name}
DESTINATION INFO:
- Location: ${destination.country || destination.fullName}
- Region: ${destination.category}
- Description: ${destination.briefDescription}
- Image URL: ${destination.imageUrl}

TASK: Create a comprehensive guide for "${destination.fullName} ${category.name}" following this EXACT structure:

{
  title: 'Destination Category Tours',
  subtitle: 'Compelling 15-20 word subtitle highlighting unique aspects and appeal',
  categoryName: '${category.name}',
  stats: { 
    toursAvailable: 12-25 (estimate based on destination size/popularity),
    priceFrom: XX (realistic starting price in USD),
    duration: 'typical duration range'
  },
  introduction: \`Write comprehensive 150-200 word introduction covering: what this category offers, why it's special in this destination, variety of experiences available, what travelers will discover, and appeal to different traveler types. Use engaging storytelling. Mention specific attractions/features. Create excitement.\`,
  seo: {
    title: 'SEO-optimized title under 60 chars with year 2025',
    description: 'Compelling 150-160 char meta description with keywords and call-to-action',
    keywords: 'Primary keywords, secondary keywords, long-tail keywords'
  },
  whyChoose: [
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
    title: 'What to Expect on Your Destination Category Tours',
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
    { question: 'Specific question travelers would ask?', answer: 'Comprehensive 100-150 word answer with specific details, practical information, and insider knowledge. Use enthusiastic tone with exclamation marks. Include specifics like prices, times, tips.' },
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
2. Use ENTHUSIASTIC tone with exclamation marks (like our Caribbean guides)
3. Include REALISTIC pricing estimates in USD
4. Make FAQs 100-150 words each with DETAILED information
5. Expert tips should be ACTIONABLE insider knowledge
6. Introduction should be COMPREHENSIVE (150-200 words)
7. Use destination-specific knowledge, not generic content
8. Write as if you're a local expert who knows the destination intimately

EXAMPLE HIGH-QUALITY FAQ (for reference):
{ question: 'What is la bandera?', answer: 'Dominican national dish meaning "the flag." Rice, red beans, stewed meat (chicken, beef, or pork), salad. Simple but flavorful. Represents Dominican flag colors. Lunch staple. Every restaurant serves it. Authentic taste of Dominican home cooking. Usually very affordable ($5-10). Essential Dominican food experience!' }

OUTPUT: Return ONLY the JavaScript object, properly formatted. No markdown, no explanations, just the pure JavaScript object.`;
};

// Function to call OpenAI API
async function generateGuideWithAI(destination, category) {
  const prompt = createGuidePrompt(destination, category);
  
  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: 'gpt-4o', // Using GPT-4 for highest quality
        messages: [
          {
            role: 'system',
            content: 'You are an expert travel content writer creating comprehensive, SEO-optimized tour guides. You write with enthusiasm, specific details, and insider knowledge. Your content is always 100% accurate and helpful for travelers.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.7,
        max_tokens: 4000
      })
    });

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.status}`);
    }

    const data = await response.json();
    const generatedContent = data.choices[0].message.content;
    
    // Extract JavaScript object from response
    const objectMatch = generatedContent.match(/\{[\s\S]*\}/);
    if (!objectMatch) {
      throw new Error('Could not extract guide object from response');
    }
    
    return eval(`(${objectMatch[0]})`);
    
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
  
  for (let i = 0; i < destination.tourCategories.length; i++) {
    const category = destination.tourCategories[i];
    const categoryObj = typeof category === 'string' ? { name: category } : category;
    const categorySlug = categoryObj.name.toLowerCase().replace(/ /g, '-');
    
    console.log(`   📝 Generating: ${categoryObj.name}...`);
    
    const guide = await generateGuideWithAI(destination, categoryObj);
    
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

// Main execution
async function main() {
  console.log('\n🚀 STARTING AUTOMATED GUIDE GENERATION\n');
  console.log('━'.repeat(60));
  
  const allGeneratedGuides = {};
  
  // Process specific destination - Update this ID for next generation
  const testDestinationIds = ['marbella']; // Generate guides for Marbella
  const testBatch = destinations.filter(dest => testDestinationIds.includes(dest.id));
  
  console.log(`\n🧪 GENERATING GUIDES FOR: ${testBatch.map(d => d.fullName || d.name).join(', ')}\n`);
  
  for (const destination of testBatch) {
    const guides = await generateGuidesForDestination(destination);
    if (guides && Object.keys(guides).length > 0) {
      allGeneratedGuides[destination.id] = guides;
    }
  }
  
  // Save to file
  const outputPath = path.join(__dirname, '../generated-guides-output.js');
  const outputContent = `// AUTO-GENERATED CATEGORY GUIDES
// Generated on: ${new Date().toISOString()}
// Review this content before integrating into guidesData.js

export const generatedGuides = ${JSON.stringify(allGeneratedGuides, null, 2)};

// INTEGRATION INSTRUCTIONS:
// 1. Review each guide for quality and accuracy
// 2. Check all prices, facts, and details are correct
// 3. Copy the approved destination sections into app/destinations/[id]/guides/guidesData.js
// 4. Update destinationsData.js to set hasGuide: true for all categories
// 5. Test on localhost before deploying
`;
  
  fs.writeFileSync(outputPath, outputContent);
  
  console.log('\n━'.repeat(60));
  console.log(`\n✅ GENERATION COMPLETE!`);
  console.log(`📁 Output saved to: generated-guides-output.js`);
  console.log(`📊 Generated guides for ${Object.keys(allGeneratedGuides).length} destinations`);
  console.log(`📝 Total guides created: ${Object.values(allGeneratedGuides).reduce((sum, guides) => sum + Object.keys(guides).length, 0)}`);
  console.log(`\n👀 NEXT STEPS:`);
  console.log(`   1. Review generated-guides-output.js for quality`);
  console.log(`   2. Verify pricing and factual accuracy`);
  console.log(`   3. Ready to integrate into guidesData.js`);
}

// Run the script
main().catch(error => {
  console.error('\n❌ FATAL ERROR:', error);
  process.exit(1);
});

