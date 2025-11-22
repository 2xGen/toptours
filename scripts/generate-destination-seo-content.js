import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import readline from 'readline';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Read API key directly from config file
const apiKeysContent = fs.readFileSync(path.join(__dirname, '../config/api-keys.js'), 'utf8');
const base64Match = apiKeysContent.match(/OPENAI_API_KEY_BASE64:\s*['"]([^'"]+)['"]/);
if (!base64Match) {
  throw new Error('Could not find OPENAI_API_KEY_BASE64 in config/api-keys.js');
}
const OPENAI_API_KEY_BASE64 = base64Match[1];

// Decode API key from base64
const OPENAI_API_KEY = Buffer.from(OPENAI_API_KEY_BASE64, 'base64').toString('utf8');

// Load destinations data
const viatorDestinationsPath = path.join(__dirname, '../src/data/viatorDestinationsClassified.json');
const destinationsDataPath = path.join(__dirname, '../src/data/destinationsData.js');

// Read classified destinations
const viatorDestinations = JSON.parse(fs.readFileSync(viatorDestinationsPath, 'utf8'));

// Read destinations with guides to exclude them
const destinationsContent = fs.readFileSync(destinationsDataPath, 'utf8');
const destinationsMatch = destinationsContent.match(/export const destinations = \[([\s\S]*?)\];/);
const destinationsWithGuides = eval(`[${destinationsMatch[1]}]`);

// Get destination IDs with guides (both slug and name variations)
const guideDestinationIds = new Set();
const guideDestinationNames = new Set();

destinationsWithGuides.forEach(dest => {
  guideDestinationIds.add(dest.id);
  guideDestinationNames.add((dest.name || '').toLowerCase().trim());
  guideDestinationNames.add((dest.fullName || dest.name || '').toLowerCase().trim());
});

// Function to generate slug
function generateSlug(name) {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

// Filter destinations without guides - check multiple name variations
const destinationsWithoutGuides = viatorDestinations.filter(dest => {
  const destName = (dest.destinationName || dest.name || '').toLowerCase().trim();
  const baseName = destName.split(',')[0].trim(); // Remove country suffix
  
  // Check if this destination matches any guide destination
  if (guideDestinationNames.has(destName)) return false;
  if (guideDestinationNames.has(baseName)) return false;
  
  // Also check if slug matches any guide destination ID
  const slug = generateSlug(destName);
  if (guideDestinationIds.has(slug)) return false;
  
  return true;
});

console.log(`\n📊 DESTINATION ANALYSIS:`);
console.log(`   Total destinations: ${viatorDestinations.length}`);
console.log(`   Destinations with guides: ${destinationsWithGuides.length}`);
console.log(`   Destinations without guides: ${destinationsWithoutGuides.length}\n`);

// Verify we're not including any destinations with guides
const verification = destinationsWithoutGuides.filter(dest => {
  const destName = (dest.destinationName || dest.name || '').toLowerCase().trim();
  return guideDestinationNames.has(destName);
});

if (verification.length > 0) {
  console.error(`❌ ERROR: Found ${verification.length} destinations with guides in the list!`);
  console.error(`   Examples: ${verification.slice(0, 5).map(d => d.destinationName || d.name).join(', ')}`);
  process.exit(1);
} else {
  console.log(`✅ VERIFICATION: No destinations with guides found in the list to process.\n`);
}

// Function to create prompt for generating content
function createContentPrompt(destination) {
  const destName = destination.destinationName || destination.name || '';
  const country = destination.country || '';
  const region = destination.region || '';
  const type = destination.type || '';
  
  return `You are an expert travel content writer creating SEO-optimized content for destination tour pages.

DESTINATION: ${destName}
COUNTRY: ${country}
REGION: ${region}
TYPE: ${type}

TASK: Generate three pieces of content for this destination:

1. CARD SENTENCE (briefDescription): A compelling one-sentence description (15-25 words) that captures the essence of the destination. Format: "Key feature, key feature, and key feature — [Destination] is [Country/Region]'s [unique descriptor]."

Examples:
- "Dramatic cliffs, colorful villages, and Mediterranean beauty — the Amalfi Coast is Italy's most stunning coastline."
- "Canal city, artistic heritage, and Dutch charm — Amsterdam is the Netherlands' cultural heart."
- "Ancient ruins, vibrant markets, and rich history — Athens is Greece's legendary capital."

2. HERO DESCRIPTION: A 2-3 sentence description (40-60 words) for the main hero section. Start with "Discover top-rated [Destination] tours, excursions, and activities powered by AI." Then mention 2-3 specific tour types or experiences. End with "find the perfect way to explore [unique aspect of destination]."

Examples:
- "Discover top-rated Amalfi Coast tours, excursions, and activities powered by AI. From coastal boat tours to Positano experiences, find the perfect way to explore Italy's most beautiful coastline."
- "Discover top-rated Athens tours, excursions, and activities powered by AI. From Acropolis tours to ancient Greece experiences, find the perfect way to explore the cradle of Western civilization."

3. SEO TITLE: A 50-60 character title optimized for search engines. Format: "[Destination] Tours & Excursions - Top-Rated Activities & Adventures"

Examples:
- "Amalfi Coast Tours & Excursions - Top-Rated Activities & Adventures"
- "Athens Tours & Excursions - Top-Rated Activities & Adventures"

IMPORTANT:
- Be specific and accurate about the destination
- Use compelling, descriptive language
- Make each piece unique to this destination
- Keep card sentence under 25 words
- Keep hero description between 40-60 words
- Keep SEO title under 60 characters
- Focus on SEO-rich keywords naturally integrated

Return ONLY a valid JSON object (no markdown, no code blocks) in this exact format:
{
  "cardSentence": "...",
  "heroDescription": "...",
  "seoTitle": "..."
}

Do not include any text before or after the JSON object.`;
}

// Function to call OpenAI API
async function generateContentWithAI(destination) {
  const prompt = createContentPrompt(destination);
  
  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: 'gpt-3.5-turbo',
        messages: [
          {
            role: 'system',
            content: 'You are an expert travel content writer creating SEO-optimized destination descriptions. You write with enthusiasm, accuracy, and specific details. Always return valid JSON only. Focus on natural keyword integration and compelling descriptions that drive engagement.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.7,
        max_tokens: 300
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`OpenAI API error: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    const generatedContent = data.choices[0].message.content;
    
    // Extract JSON from response (handle both pure JSON and JSON wrapped in text)
    let content;
    try {
      // Try parsing directly
      content = JSON.parse(generatedContent);
    } catch (e) {
      // Try extracting JSON object from text
      const jsonMatch = generatedContent.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        content = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error('Could not extract JSON from response');
      }
    }
    
    return {
      cardSentence: content.cardSentence || '',
      heroDescription: content.heroDescription || '',
      seoTitle: content.seoTitle || ''
    };
    
  } catch (error) {
    console.error(`❌ Error generating content for ${destination.destinationName}:`, error.message);
    return null;
  }
}

// Function to estimate cost
function estimateCost(numDestinations) {
  // Per destination:
  // - Input: ~400 tokens (prompt + destination info)
  // - Output: ~200 tokens (3 pieces of content)
  
  const inputTokens = numDestinations * 400;
  const outputTokens = numDestinations * 200;
  
  // GPT-3.5 Turbo pricing (as of 2024)
  const inputCostPerMillion = 0.50; // $0.50 per 1M input tokens
  const outputCostPerMillion = 1.50; // $1.50 per 1M output tokens
  
  const inputCost = (inputTokens / 1_000_000) * inputCostPerMillion;
  const outputCost = (outputTokens / 1_000_000) * outputCostPerMillion;
  const totalCost = inputCost + outputCost;
  
  return {
    inputTokens,
    outputTokens,
    inputCost,
    outputCost,
    totalCost
  };
}

// Main execution
async function main() {
  console.log('🚀 DESTINATION SEO CONTENT GENERATION\n');
  console.log('━'.repeat(60));
  
  // Estimate cost
  const costEstimate = estimateCost(destinationsWithoutGuides.length);
  console.log(`\n💰 COST ESTIMATE:`);
  console.log(`   Destinations to process: ${destinationsWithoutGuides.length}`);
  console.log(`   Estimated input tokens: ${costEstimate.inputTokens.toLocaleString()}`);
  console.log(`   Estimated output tokens: ${costEstimate.outputTokens.toLocaleString()}`);
  console.log(`   Estimated input cost: $${costEstimate.inputCost.toFixed(4)}`);
  console.log(`   Estimated output cost: $${costEstimate.outputCost.toFixed(4)}`);
  console.log(`   TOTAL ESTIMATED COST: $${costEstimate.totalCost.toFixed(4)}`);
  console.log(`\n   Note: Actual cost may vary based on actual token usage.\n`);
  
  // Check for auto-confirm flag or ask for confirmation
  const autoConfirm = process.argv.includes('--yes') || process.argv.includes('-y');
  
  if (!autoConfirm) {
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    });
    
    const answer = await new Promise(resolve => {
      rl.question('Do you want to proceed with generation? (yes/no): ', resolve);
    });
    rl.close();
    
    if (answer.toLowerCase() !== 'yes') {
      console.log('Generation cancelled.');
      return;
    }
  } else {
    console.log('Auto-confirming generation (--yes flag detected)...\n');
  }
  
  console.log('\n📝 GENERATING CONTENT...\n');
  console.log('━'.repeat(60));
  
  const results = {};
  let successCount = 0;
  let errorCount = 0;
  
  // Process in batches to avoid rate limits
  const batchSize = 10;
  const delayBetweenBatches = 2000; // 2 seconds
  
  for (let i = 0; i < destinationsWithoutGuides.length; i += batchSize) {
    const batch = destinationsWithoutGuides.slice(i, i + batchSize);
    const batchNumber = Math.floor(i / batchSize) + 1;
    const totalBatches = Math.ceil(destinationsWithoutGuides.length / batchSize);
    
    console.log(`\n📦 Processing batch ${batchNumber}/${totalBatches} (${batch.length} destinations)...`);
    
    const batchPromises = batch.map(async (destination) => {
      const slug = generateSlug(destination.destinationName || destination.name || '');
      const content = await generateContentWithAI(destination);
      
      if (content) {
        results[slug] = {
          destinationId: destination.destinationId || destination.id,
          destinationName: destination.destinationName || destination.name,
          country: destination.country || '',
          region: destination.region || '',
          type: destination.type || '',
          briefDescription: content.cardSentence,
          heroDescription: content.heroDescription,
          seo: {
            title: content.seoTitle,
            description: content.cardSentence, // Card sentence becomes meta description
            ogImage: "https://ouqeoizufbofdqbuiwvx.supabase.co/storage/v1/object/public/blogs/How%20to%20Choose%20the%20Best%20Tour%20for%20Your%20Next%20Vacation.png"
          }
        };
        successCount++;
        process.stdout.write('✅ ');
      } else {
        errorCount++;
        process.stdout.write('❌ ');
      }
    });
    
    await Promise.all(batchPromises);
    
    // Delay between batches to avoid rate limits
    if (i + batchSize < destinationsWithoutGuides.length) {
      console.log(`\n⏳ Waiting ${delayBetweenBatches / 1000} seconds before next batch...`);
      await new Promise(resolve => setTimeout(resolve, delayBetweenBatches));
    }
  }
  
  console.log('\n\n━'.repeat(60));
  console.log(`\n✅ GENERATION COMPLETE!`);
  console.log(`   Successfully generated: ${successCount}`);
  console.log(`   Errors: ${errorCount}`);
  console.log(`   Total processed: ${successCount + errorCount}`);
  
  // Save results
  const outputPath = path.join(__dirname, '../generated-destination-seo-content.json');
  fs.writeFileSync(outputPath, JSON.stringify(results, null, 2));
  
  console.log(`\n📁 Results saved to: generated-destination-seo-content.json`);
  console.log(`\n📋 NEXT STEPS:`);
  console.log(`   1. Review generated-destination-seo-content.json`);
  console.log(`   2. Integrate into app/destinations/page.js (update briefDescription)`);
  console.log(`   3. Create destination detail pages with heroDescription and seo.title`);
  console.log(`   4. Use briefDescription as meta description\n`);
}

// Run if called directly
main().catch(console.error);

export { generateContentWithAI, estimateCost };
