/**
 * Batch Generate Airport Transfers Content for All Featured Destinations
 *
 * Processes all featured destinations on /destinations (~248):
 * - destinationsData.js (curated) + generated full content with hasGuide + image.
 *
 * Generates unique, destination-specific descriptions and FAQs for airport
 * transfers pages using Gemini 2.5 Flash Lite (cheapest model).
 *
 * Cost: ~$0.01 for all featured destinations
 *
 * Usage: node scripts/generate-airport-transfers-content.js
 * Test:  Set testMode = true and testDestinationId = 'prague' (or any slug).
 */

// CRITICAL: Load environment variables FIRST before any imports that use them
import dotenv from 'dotenv';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join, resolve } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const root = resolve(__dirname, '..');

// Load .env.local first, then .env as fallback
dotenv.config({ path: resolve(__dirname, '..', '.env.local') });
dotenv.config({ path: resolve(__dirname, '..', '.env') });

// Now import modules that use environment variables
import { destinations } from '../src/data/destinationsData.js';
import { createClient } from '@supabase/supabase-js';
import { GoogleGenerativeAI } from '@google/generative-ai';

function generateSlug(name) {
  if (!name) return '';
  return String(name)
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

// Build featured destinations (same logic as /destinations page)
function getFeaturedDestinations() {
  const generatedFullContent = JSON.parse(
    readFileSync(resolve(root, 'generated-destination-full-content.json'), 'utf8')
  );
  const seoContent = JSON.parse(
    readFileSync(resolve(root, 'generated-destination-seo-content.json'), 'utf8')
  );
  const classified = JSON.parse(
    readFileSync(resolve(root, 'src/data/viatorDestinationsClassified.json'), 'utf8')
  );

  const getSeo = (slug) => seoContent[slug] || null;

  const bySlug = new Map();
  for (const cd of classified) {
    const slug = generateSlug(cd.destinationName || cd.name || '');
    if (!slug) continue;
    if (!bySlug.has(slug)) bySlug.set(slug, []);
    bySlug.get(slug).push(cd);
  }

  const regularIds = new Set(destinations.map((d) => d.id));
  const generated = Object.keys(generatedFullContent || {})
    .filter((slug) => {
      if (regularIds.has(slug)) return false;
      const c = generatedFullContent[slug];
      if (!c || !c.tourCategories) return false;
      const hasGuides = c.tourCategories.some((cat) => typeof cat === 'object' && cat.hasGuide === true);
      if (!hasGuides) return false;
      const seo = getSeo(slug);
      return !!(c.imageUrl || seo?.imageUrl || seo?.ogImage);
    })
    .map((slug) => {
      const c = generatedFullContent[slug];
      const seo = getSeo(slug);
      const cls = bySlug.get(slug)?.[0];
      return {
        id: slug,
        name: c.destinationName || slug,
        fullName: c.destinationName || slug,
        country: cls?.country || c.country || null,
        category: cls?.region || c.region || null,
        imageUrl: c.imageUrl || seo?.imageUrl || seo?.ogImage || null,
      };
    });

  const curated = destinations.map((d) => ({
    id: d.id,
    name: d.name,
    fullName: d.fullName || d.name,
    country: d.country || null,
    category: d.category || null,
    imageUrl: d.imageUrl || null,
  }));

  return [...curated, ...generated];
}

// Create Supabase client directly (avoiding import-time env var checks)
const createSupabaseServiceRoleClient = () => {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  
  if (!supabaseUrl || !supabaseServiceRoleKey) {
    throw new Error('Missing Supabase environment variables');
  }
  
  return createClient(supabaseUrl, supabaseServiceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  });
};

// Get Gemini API key
const resolveGeminiKey = () => {
  return process.env.GEMINI_API_KEY || process.env.GOOGLE_GENERATIVE_AI_API_KEY || null;
};

// Create prompt for Gemini
const createPrompt = (destination, airportCode) => {
  const airportInfo = airportCode ? `Airport code: ${airportCode} (use this code to identify the full airport name - e.g., AUA = Queen Beatrix International Airport, PRG = Václav Havel Airport Prague, JFK = John F. Kennedy International Airport)` : 'Airport code: Not available';
  const airportName = airportCode ? `${airportCode} Airport` : 'the airport';
  
  return `Generate SEO-optimized content for airport transfers in ${destination.fullName || destination.name}.

IMPORTANT: This is a travel platform that helps travelers find and compare airport transfer options from various providers. We do NOT operate the transfers ourselves. Use neutral, informational tone - never say "we offer" or "our service". Instead use "you can book", "transfers are available", "compare options", etc.

Context:
- Destination: ${destination.fullName || destination.name}
- Country: ${destination.country || destination.category || 'Unknown'}
- ${airportInfo}

CRITICAL: You MUST include the FULL airport name (not just the code) in the content. Use the airport code provided to identify the correct airport name. For example:
- AUA = Queen Beatrix International Airport (Aruba)
- PRG = Václav Havel Airport Prague
- JFK = John F. Kennedy International Airport
- LHR = London Heathrow Airport

Requirements:
1. SEO Title: 50-60 characters, include destination name, "Airport Transfer" or "Airport Transfers", and year 2026. Include airport name or code if available (e.g., "Prague Airport Transfer" or "PRG Airport Transfer").
2. Meta Description: 150-160 characters, compelling, keyword-rich, MUST include the full airport name (e.g., "Queen Beatrix International Airport" not just "AUA"), mention "shared & private transfers", include call-to-action like "compare options" or "find transfers".
3. Description: 2-3 sentences (max 120 words), informational tone, MUST mention the full airport name (e.g., "Queen Beatrix International Airport" or "Václav Havel Airport Prague"), explain that travelers can compare and book transfers from various providers. NO "we offer" language.
4. What to Expect: Generate 4 items with destination-specific information:
   - Duration: Include actual travel time from the airport to city/resorts (e.g., "15-30 minutes from Queen Beatrix International Airport to Aruba resorts")
   - Group Size: Destination-specific info about private vs shared options
   - Pricing: Include approximate pricing if known, or general pricing structure (e.g., "Fixed prices from $X. Shared transfers start around $Y")
   - Pickup Location: Include airport name and specific pickup details (e.g., "Meet at Queen Beatrix International Airport arrivals hall")
5. FAQs: Exactly 3 destination-specific, practical questions. MUST include the full airport name in at least one FAQ (e.g., "Queen Beatrix International Airport (AUA)" or "Václav Havel Airport Prague"). Answers should be informational and helpful, explaining what travelers can expect or how to find options. NO language implying we operate the service.
6. FAQ Answers: 50-100 words each, practical and helpful. Use neutral language like "transfers typically", "you can find", "most providers", "booking platforms", etc. Never say "our drivers", "we provide", "our service". Include the airport name when relevant.
7. Use natural, informational tone - like a helpful travel guide, not a sales pitch.

TONE EXAMPLES:
✅ GOOD: "Compare shared and private airport transfer options from Queen Beatrix International Airport (AUA) to Aruba resorts. Book in advance for fixed pricing and peace of mind."
✅ GOOD: "Most transfer providers offer meet-and-greet services at the arrivals hall of Václav Havel Airport Prague."
✅ GOOD: "Travel time from Queen Beatrix International Airport to popular Aruba resorts typically ranges from 15-30 minutes."
❌ BAD: "We offer airport transfers with our professional drivers."
❌ BAD: "Our service includes meet-and-greet at the airport."
❌ BAD: "We provide transfers to all major resorts."
❌ BAD: "Transfers from AUA Airport..." (use full name: "Queen Beatrix International Airport (AUA)")

Return ONLY valid JSON (no markdown, no code blocks):
{
  "seoTitle": "SEO-optimized title (50-60 chars, include 2026)",
  "seoDescription": "SEO-optimized meta description (150-160 chars, compelling, keyword-rich)",
  "description": "2-3 sentence description (max 120 words, informational, neutral tone)",
  "whatToExpect": {
    "items": [
      {"icon": "Clock", "title": "Duration", "description": "Destination-specific duration info (e.g., '15-30 minutes from Queen Beatrix International Airport to Aruba resorts')"},
      {"icon": "Users", "title": "Group Size", "description": "Destination-specific group size info (e.g., 'Private transfers accommodate 1-8 people, shared transfers available for budget travelers')"},
      {"icon": "DollarSign", "title": "Pricing", "description": "Destination-specific pricing info (e.g., 'Fixed prices from $X. Shared transfers start around $Y, private transfers from $Z')"},
      {"icon": "MapPin", "title": "Pickup Location", "description": "Destination-specific pickup info (e.g., 'Meet at Queen Beatrix International Airport arrivals hall or hotel lobby. Many providers offer meet-and-greet service')"}
    ]
  },
  "faqs": [
    {"question": "Specific question about airport transfers in this destination", "answer": "Informational answer (50-100 words, neutral tone, no 'we offer' language)"},
    {"question": "Another specific question", "answer": "Informational answer (50-100 words, neutral tone)"},
    {"question": "Third specific question", "answer": "Informational answer (50-100 words, neutral tone)"}
  ]
}`;
};

// Generate content using Gemini
async function generateContent(destination, airportCode) {
  const apiKey = resolveGeminiKey();
  if (!apiKey) {
    throw new Error('Missing GEMINI_API_KEY environment variable');
  }

  try {
    const prompt = createPrompt(destination, airportCode);
    const genAI = new GoogleGenerativeAI(apiKey);
    
    // Try models in order of preference (cheapest first)
    const models = [
      'gemini-2.5-flash-lite', // Cheapest
      'gemini-2.5-flash',
      'gemini-1.5-flash',
    ];
    
    let content = null;
    let lastError = null;
    let usedModel = null;
    
    for (const modelName of models) {
      try {
        const model = genAI.getGenerativeModel({ model: modelName });
        const result = await model.generateContent(prompt);
        const response = await result.response;
        content = response.text();
        
        if (content) {
          usedModel = modelName;
          break;
        }
      } catch (error) {
        lastError = error;
        console.log(`   ⚠️  Model ${modelName} failed, trying next...`);
        continue;
      }
    }
    
    if (!content) {
      throw new Error(`All Gemini models failed: ${lastError?.message || 'Unknown error'}`);
    }

    // Extract JSON from response (handle markdown code blocks)
    let jsonMatch = content.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('No JSON found in response');
    }

    const parsed = JSON.parse(jsonMatch[0]);
    
    // Validate structure
    if (!parsed.description || !Array.isArray(parsed.faqs) || parsed.faqs.length !== 3) {
      throw new Error('Invalid response structure: missing description or FAQs');
    }
    
    // Validate SEO fields
    if (!parsed.seoTitle || !parsed.seoDescription) {
      throw new Error('Invalid response structure: missing SEO title or description');
    }
    
    // Validate whatToExpect structure
    if (!parsed.whatToExpect || !Array.isArray(parsed.whatToExpect.items) || parsed.whatToExpect.items.length !== 4) {
      throw new Error('Invalid response structure: missing or incomplete whatToExpect items');
    }
    
    // Ensure SEO title is within limits (60 chars max for best practice)
    if (parsed.seoTitle.length > 65) {
      console.warn(`   ⚠️  SEO title too long (${parsed.seoTitle.length} chars), truncating...`);
      parsed.seoTitle = parsed.seoTitle.substring(0, 60).trim() + '...';
    }
    
    // Ensure meta description is within limits (160 chars max)
    if (parsed.seoDescription.length > 165) {
      console.warn(`   ⚠️  Meta description too long (${parsed.seoDescription.length} chars), truncating...`);
      parsed.seoDescription = parsed.seoDescription.substring(0, 160).trim() + '...';
    }

    console.log(`   ✅ Generated using ${usedModel}`);
    return parsed;
  } catch (error) {
    console.error(`   ❌ Generation failed: ${error.message}`);
    throw error;
  }
}

// Get airport code from database
async function getAirportCode(destinationId) {
  try {
    const supabase = createSupabaseServiceRoleClient();
    
    // Try to find destination by slug/name
    const { data, error } = await supabase
      .from('viator_destinations')
      .select('iata_codes, name')
      .or(`slug.ilike.${destinationId},name.ilike.${destinationId}`)
      .maybeSingle();
    
    if (error || !data) {
      return null;
    }
    
    // Return first IATA code if available
    if (data.iata_codes && Array.isArray(data.iata_codes) && data.iata_codes.length > 0) {
      return data.iata_codes[0];
    }
    
    return null;
  } catch (error) {
    console.warn(`   ⚠️  Could not fetch airport code: ${error.message}`);
    return null;
  }
}

// Save to database
async function saveToDatabase(destinationId, destination, generatedContent) {
  try {
    const supabase = createSupabaseServiceRoleClient();
    
    // Prepare guide data (matching category_guides table structure)
    const guideData = {
      destination_id: destinationId,
      category_slug: 'airport-transfers',
      category_name: 'Airport Transfers',
      title: `${destination.fullName || destination.name} Airport Transfers`,
      subtitle: generatedContent.description,
      hero_image: destination.imageUrl || null,
      stats: {},
      introduction: generatedContent.description,
      seo: {
        title: generatedContent.seoTitle,
        description: generatedContent.seoDescription,
        keywords: `airport transfer, airport shuttle, airport taxi, private transfer, shared transfer, ${destination.fullName || destination.name} airport, ${destination.fullName || destination.name} airport transfer 2026`
      },
      why_choose: [],
      tour_types: [],
      what_to_expect: generatedContent.whatToExpect || {
        items: [
          {
            icon: 'Clock',
            title: 'Duration',
            description: 'Transfer times typically range from 30-60 minutes depending on traffic and distance'
          },
          {
            icon: 'Users',
            title: 'Group Size',
            description: 'Choose between private transfers (1-8 people) or shared transfers (multiple passengers)'
          },
          {
            icon: 'DollarSign',
            title: 'Pricing',
            description: 'Fixed prices with no hidden fees. Shared transfers are more economical, private transfers offer exclusivity'
          },
          {
            icon: 'MapPin',
            title: 'Pickup Location',
            description: 'Meet at the airport terminal or hotel lobby. Some services offer meet-and-greet at arrivals'
          }
        ]
      },
      expert_tips: [
        'Book in advance for better prices and availability',
        'Private transfers offer more flexibility and comfort',
        'Shared transfers are more budget-friendly',
        'Check if your hotel offers transfer services'
      ],
      faqs: generatedContent.faqs
    };

    // Upsert (insert or update)
    const { data, error } = await supabase
      .from('category_guides')
      .upsert(guideData, {
        onConflict: 'destination_id,category_slug',
        ignoreDuplicates: false
      })
      .select()
      .single();

    if (error) {
      throw error;
    }

    return data;
  } catch (error) {
    console.error(`   ❌ Database save failed: ${error.message}`);
    throw error;
  }
}

// Main function
async function main() {
  console.log('🚀 Starting Airport Transfers Content Generation\n');

  const featured = getFeaturedDestinations();

  // Set testMode = true and testDestinationId to process a single destination only
  const testMode = false;
  const testDestinationId = 'prague';

  let destinationsToProcess = featured;
  if (testMode) {
    destinationsToProcess = featured.filter((d) => d.id === testDestinationId);
    if (destinationsToProcess.length === 0) {
      console.error(`❌ Test destination "${testDestinationId}" not found in featured list.`);
      process.exit(1);
    }
    console.log(`🧪 TEST MODE: Processing only ${testDestinationId}\n`);
  }

  console.log(`📊 Total destinations to process: ${destinationsToProcess.length} (featured: ${featured.length})\n`);

  // Verify environment variables are loaded
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  
  if (!supabaseUrl || !supabaseServiceRoleKey) {
    console.error('❌ Missing Supabase environment variables');
    console.error('   Please ensure .env.local contains:');
    console.error('   - NEXT_PUBLIC_SUPABASE_URL');
    console.error('   - SUPABASE_SERVICE_ROLE_KEY');
    process.exit(1);
  }
  
  const supabase = createSupabaseServiceRoleClient();

  const apiKey = resolveGeminiKey();
  if (!apiKey) {
    console.error('❌ Missing GEMINI_API_KEY environment variable');
    process.exit(1);
  }

  let successCount = 0;
  let errorCount = 0;
  const errors = [];

  // Process destinations with delay to avoid rate limits
  for (let i = 0; i < destinationsToProcess.length; i++) {
    const destination = destinationsToProcess[i];
    const destinationId = destination.id;
    
    console.log(`\n[${i + 1}/${destinationsToProcess.length}] Processing: ${destination.fullName || destination.name} (${destinationId})`);
    
    try {
      // Get airport code
      const airportCode = await getAirportCode(destinationId);
      if (airportCode) {
        console.log(`   ✈️  Airport code: ${airportCode}`);
      } else {
        console.log(`   ⚠️  No airport code found`);
      }

      // Generate content
      const generatedContent = await generateContent(destination, airportCode);
      
      // Save to database
      await saveToDatabase(destinationId, destination, generatedContent);
      
      console.log(`   ✅ Successfully saved to database`);
      successCount++;

      // Small delay to avoid rate limits (Gemini has generous limits, but be safe)
      if (i < destinationsToProcess.length - 1) {
        await new Promise(resolve => setTimeout(resolve, 500)); // 500ms delay
      }
    } catch (error) {
      console.error(`   ❌ Failed: ${error.message}`);
      errorCount++;
      errors.push({
        destination: destination.fullName || destination.name,
        destinationId,
        error: error.message
      });
    }
  }

  // Summary
  console.log('\n' + '='.repeat(60));
  console.log('📊 GENERATION SUMMARY');
  console.log('='.repeat(60));
  console.log(`✅ Success: ${successCount}/${destinationsToProcess.length}`);
  console.log(`❌ Errors: ${errorCount}/${destinationsToProcess.length}`);
  
  if (testMode) {
    console.log('\n🧪 TEST MODE COMPLETE - Review the results above');
    console.log(`   To process all ${featured.length} featured destinations, set testMode = false in the script`);
  }
  
  if (errors.length > 0) {
    console.log('\n❌ Failed Destinations:');
    errors.forEach(({ destination, destinationId, error }) => {
      console.log(`   - ${destination} (${destinationId}): ${error}`);
    });
  }

  console.log(`\n💰 Estimated cost: ~$${(successCount * 0.0000165).toFixed(4)}`);
  console.log('\n✨ Done!');
}

// Run
main().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});
