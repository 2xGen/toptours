/**
 * Classify Viator tags using Gemini AI
 * Uses Low/Medium/High classification (not raw scores) for consistency
 */

import dotenv from 'dotenv';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { createClient } from '@supabase/supabase-js';
import { readFileSync, writeFileSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { fetchAllTags } from './fetch-viator-tags.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({ path: join(__dirname, '../.env.local') });

const GEMINI_API_KEY = process.env.GEMINI_API_KEY || process.env.GOOGLE_GENERATIVE_AI_API_KEY;
const VIATOR_API_KEY = process.env.VIATOR_API_KEY;
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!GEMINI_API_KEY) {
  console.error('❌ Missing GEMINI_API_KEY in .env.local');
  process.exit(1);
}

if (!VIATOR_API_KEY) {
  console.error('❌ Missing VIATOR_API_KEY in .env.local');
  process.exit(1);
}

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error('❌ Missing Supabase credentials in .env.local');
  console.error('   Required: NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

// Create Supabase client directly (avoid importing supabaseClient.js which throws on missing vars)
function createSupabaseServiceRoleClient() {
  return createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}

// Mapping: Low/Medium/High -> 0-100 scores
const CLASSIFICATION_TO_SCORE = {
  'Low': 25,
  'Medium': 50,
  'High': 75
};

// Generic tags that should be downweighted
const GENERIC_TAGS = [
  'sightseeing',
  'tours',
  'activities',
  'experiences',
  'popular',
  'recommended',
  'attractions',
];

function isGenericTag(tagName) {
  const lower = tagName.toLowerCase();
  return GENERIC_TAGS.some(generic => lower.includes(generic));
}

function getTagWeight(tagName) {
  if (isGenericTag(tagName)) {
    return 0.5; // Downweight generic tags
  }
  return 1.0; // Normal weight
}

function buildClassificationPrompt(tagName) {
  return `You are classifying travel tour tags for a matching system.

For the tag "${tagName}", classify it as Low, Medium, or High for each dimension:

1. Adventure: How adventurous/thrill-seeking is this tag?
   - Low = Relaxed, calm experiences
   - Medium = Moderate activity
   - High = High adventure, thrill-seeking

2. Relaxation vs Exploration: Does this tag lean toward relaxing or exploring?
   - Low = Relaxing, unwinding
   - Medium = Balanced mix
   - High = Active exploration, discovery

3. Group Intimacy: Does this tag suggest small/private or large groups?
   - Low = Large groups, social
   - Medium = Either way
   - High = Private/small intimate groups

4. Price/Comfort: Does this tag suggest budget or luxury?
   - Low = Budget-conscious
   - Medium = Mid-range value
   - High = Luxury/premium comfort

5. Guidance: Does this tag suggest guided or independent?
   - Low = Independent, self-guided
   - Medium = Mixed approach
   - High = Fully guided, organized

6. Food & Drinks: How important are food/drinks for this tag?
   - Low = Not important
   - Medium = Nice to have
   - High = Very important, foodie-focused

Return ONLY a JSON object with this exact structure (no markdown, no code fences):
{
  "adventure": "Low" | "Medium" | "High",
  "relaxation_exploration": "Low" | "Medium" | "High",
  "group_intimacy": "Low" | "Medium" | "High",
  "price_comfort": "Low" | "Medium" | "High",
  "guidance": "Low" | "Medium" | "High",
  "food_drink": "Low" | "Medium" | "High"
}`;
}

export async function classifyTag(tagName, genAI, model) {
  try {
    const prompt = buildClassificationPrompt(tagName);
    const result = await model.generateContent(prompt);
    const response = await result.response;
    let text = response.text().trim();

    // Remove markdown code fences if present
    text = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();

    const classification = JSON.parse(text);

    // Validate structure
    const requiredKeys = ['adventure', 'relaxation_exploration', 'group_intimacy', 'price_comfort', 'guidance', 'food_drink'];
    for (const key of requiredKeys) {
      if (!classification[key] || !['Low', 'Medium', 'High'].includes(classification[key])) {
        throw new Error(`Invalid classification for ${key}: ${classification[key]}`);
      }
    }

    // Convert to scores
    const scores = {
      adventure_score: CLASSIFICATION_TO_SCORE[classification.adventure],
      relaxation_exploration_score: CLASSIFICATION_TO_SCORE[classification.relaxation_exploration],
      group_intimacy_score: CLASSIFICATION_TO_SCORE[classification.group_intimacy],
      price_comfort_score: CLASSIFICATION_TO_SCORE[classification.price_comfort],
      guidance_score: CLASSIFICATION_TO_SCORE[classification.guidance],
      food_drink_score: CLASSIFICATION_TO_SCORE[classification.food_drink],
    };

    return {
      success: true,
      classification,
      scores,
      rawResponse: text,
    };
  } catch (error) {
    console.error(`   ⚠️  Error classifying "${tagName}":`, error.message);
    return {
      success: false,
      error: error.message,
    };
  }
}

export async function classifyAllTags(tags, batchSize = 5, delayMs = 1000) {
  const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
  
  // Try different models in order of preference
  const models = [
    'gemini-2.5-flash-lite', // Cheapest
    'gemini-2.5-flash',
    'gemini-1.5-flash',
  ];

  let model = null;
  for (const modelName of models) {
    try {
      model = genAI.getGenerativeModel({ model: modelName });
      console.log(`✅ Using Gemini model: ${modelName}`);
      break;
    } catch (error) {
      console.log(`   ⚠️  Model ${modelName} not available, trying next...`);
    }
  }

  if (!model) {
    throw new Error('No Gemini model available');
  }

  const results = [];
  const total = tags.length;

  for (let i = 0; i < tags.length; i += batchSize) {
    const batch = tags.slice(i, i + batchSize);
    console.log(`\n📦 Processing batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(total / batchSize)} (tags ${i + 1}-${Math.min(i + batchSize, total)})`);

    const batchPromises = batch.map(async (tag, index) => {
      const tagIndex = i + index + 1;
      console.log(`   [${tagIndex}/${total}] Classifying: "${tag.tagNameEn}"`);
      
      const result = await classifyTag(tag.tagNameEn, genAI, model);
      
      return {
        ...tag,
        ...result,
        tag_weight: getTagWeight(tag.tagNameEn),
        is_generic: isGenericTag(tag.tagNameEn),
      };
    });

    const batchResults = await Promise.all(batchPromises);
    results.push(...batchResults);

    // Rate limiting: delay between batches
    if (i + batchSize < tags.length) {
      console.log(`   ⏳ Waiting ${delayMs}ms before next batch...`);
      await new Promise(resolve => setTimeout(resolve, delayMs));
    }
  }

  return results;
}

async function saveToDatabase(results) {
  const supabase = createSupabaseServiceRoleClient();

  const successful = results.filter(r => r.success);
  const failed = results.filter(r => !r.success);

  console.log(`   ✅ Successful classifications: ${successful.length}`);
  console.log(`   ❌ Failed classifications: ${failed.length}`);

  if (failed.length > 0) {
    console.log('\n   Failed tags:');
    failed.slice(0, 10).forEach(f => {
      console.log(`     - "${f.tagNameEn}": ${f.error}`);
    });
    if (failed.length > 10) {
      console.log(`     ... and ${failed.length - 10} more`);
    }
  }

  if (successful.length === 0) {
    console.log('\n⚠️  No successful classifications to save!');
    return;
  }

  // Prepare inserts
  const inserts = successful.map(result => ({
    tag_id: result.tagId,
    tag_name_en: result.tagNameEn,
    parent_tag_ids: result.parentTagIds,
    adventure_score: result.scores.adventure_score,
    relaxation_exploration_score: result.scores.relaxation_exploration_score,
    group_intimacy_score: result.scores.group_intimacy_score,
    price_comfort_score: result.scores.price_comfort_score,
    guidance_score: result.scores.guidance_score,
    food_drink_score: result.scores.food_drink_score,
    gemini_classification: result.classification,
    tag_weight: result.tag_weight,
    is_generic: result.is_generic,
  }));

  // Batch insert (Supabase allows up to 1000 rows per insert)
  const batchSize = 500;
  let inserted = 0;
  let errors = 0;

  for (let i = 0; i < inserts.length; i += batchSize) {
    const batch = inserts.slice(i, i + batchSize);
    const batchNum = Math.floor(i / batchSize) + 1;
    const totalBatches = Math.ceil(inserts.length / batchSize);
    
    console.log(`   💾 Inserting batch ${batchNum}/${totalBatches} (${batch.length} tags)...`);
    
    const { data, error } = await supabase
      .from('viator_tag_traits')
      .upsert(batch, { onConflict: 'tag_id' });

    if (error) {
      console.error(`   ❌ Error inserting batch ${batchNum}:`, error.message);
      console.error(`   Details:`, JSON.stringify(error, null, 2));
      errors++;
    } else {
      inserted += batch.length;
      console.log(`   ✅ Batch ${batchNum} inserted: ${inserted}/${inserts.length} tags`);
    }
  }

  if (errors > 0) {
    console.log(`\n⚠️  Completed with ${errors} batch errors. Inserted ${inserted} tags.`);
  } else {
    console.log(`\n✅ Successfully saved ${inserted} tag classifications to database`);
  }
}

async function main() {
  // Load tags from file or fetch fresh
  const tagsPath = join(__dirname, 'viator-tags-raw.json');
  let tags;

  if (existsSync(tagsPath)) {
    console.log('📂 Loading tags from file...');
    tags = JSON.parse(readFileSync(tagsPath, 'utf8'));
    console.log(`   Loaded ${tags.length} tags`);
  } else {
    console.log('📡 Fetching tags from Viator API...');
    tags = await fetchAllTags();
  }

  // Check which tags are already classified
  const supabase = createSupabaseServiceRoleClient();
  
  const { data: existingTags } = await supabase
    .from('viator_tag_traits')
    .select('tag_id');

  const existingTagIds = new Set((existingTags || []).map(t => t.tag_id));
  const unclassifiedTags = tags.filter(t => !existingTagIds.has(t.tagId));

  console.log(`\n📊 Classification Status:`);
  console.log(`   Total tags: ${tags.length}`);
  console.log(`   Already classified: ${existingTagIds.size}`);
  console.log(`   Need classification: ${unclassifiedTags.length}`);

  if (unclassifiedTags.length === 0) {
    console.log('\n✅ All tags are already classified!');
    return;
  }

  // Classify unclassified tags
  console.log(`\n🤖 Classifying ${unclassifiedTags.length} tags with Gemini...`);
  const estimatedMinutes = Math.ceil((unclassifiedTags.length / 5) * (1000 / 60000));
  console.log(`   Estimated time: ~${estimatedMinutes} minutes (${unclassifiedTags.length} tags, 5 per batch, 1s delay)\n`);
  
  try {
    const results = await classifyAllTags(unclassifiedTags, 5, 1000);
    
    console.log(`\n✅ Classification complete! Processed ${results.length} tags.`);
    console.log(`   Successful: ${results.filter(r => r.success).length}`);
    console.log(`   Failed: ${results.filter(r => !r.success).length}`);

    // Save results to database
    console.log('\n💾 Saving to database...');
    await saveToDatabase(results);

    // Save full results to file for review
    const outputPath = join(__dirname, 'viator-tags-classified.json');
    writeFileSync(outputPath, JSON.stringify(results, null, 2));
    console.log(`\n💾 Full results saved to: ${outputPath}`);
  } catch (error) {
    console.error('\n❌ Error during classification:', error);
    console.error('Stack trace:', error.stack);
    throw error;
  }
}

// Run if called directly
const scriptName = 'classify-viator-tags.js';
const isMainModule = process.argv[1] && process.argv[1].includes(scriptName);

if (isMainModule) {
  main()
    .then(() => {
      console.log('\n✅ Done!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('\n❌ Failed:', error);
      console.error(error.stack);
      process.exit(1);
    });
}
