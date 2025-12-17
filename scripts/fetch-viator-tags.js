/**
 * Fetch all tags from Viator API
 * Extracts English tag names and prepares them for classification
 */

import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { writeFileSync } from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({ path: join(__dirname, '../.env.local') });

const VIATOR_API_KEY = process.env.VIATOR_API_KEY;

if (!VIATOR_API_KEY) {
  console.error('❌ Missing VIATOR_API_KEY in .env.local');
  process.exit(1);
}

export async function fetchAllTags() {
  try {
    console.log('📡 Fetching all tags from Viator API...');
    
    const response = await fetch('https://api.viator.com/partner/products/tags', {
      method: 'GET',
      headers: {
        'exp-api-key': VIATOR_API_KEY,
        'Accept': 'application/json;version=2.0',
        'Accept-Language': 'en-US',
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Viator API Error:', response.status, errorText);
      throw new Error(`Viator API error: ${response.status}`);
    }

    const data = await response.json();
    const tags = data.tags || [];

    console.log(`✅ Fetched ${tags.length} tags from Viator`);

    // Extract English names and structure
    const processedTags = tags.map(tag => ({
      tagId: tag.tagId,
      tagNameEn: tag.allNamesByLocale?.en || tag.allNamesByLocale?.en_AU || tag.allNamesByLocale?.en_UK || 'Unknown',
      parentTagIds: tag.parentTagIds || [],
    }));

    // Filter out tags without English names
    const validTags = processedTags.filter(t => t.tagNameEn !== 'Unknown');

    console.log(`📊 Valid tags with English names: ${validTags.length}`);

    // Save to JSON file for review/classification
    const outputPath = join(__dirname, 'viator-tags-raw.json');
    writeFileSync(outputPath, JSON.stringify(validTags, null, 2));
    console.log(`💾 Saved tags to: ${outputPath}`);

    // Also create a simple list for classification
    const tagNames = validTags.map(t => t.tagNameEn).sort();
    const namesPath = join(__dirname, 'viator-tag-names.txt');
    writeFileSync(namesPath, tagNames.join('\n'));
    console.log(`💾 Saved tag names to: ${namesPath}`);

    // Statistics
    const uniqueNames = new Set(validTags.map(t => t.tagNameEn.toLowerCase()));
    console.log(`\n📈 Statistics:`);
    console.log(`   Total tags: ${tags.length}`);
    console.log(`   Valid tags: ${validTags.length}`);
    console.log(`   Unique tag names: ${uniqueNames.size}`);
    console.log(`   Tags with parents: ${validTags.filter(t => t.parentTagIds.length > 0).length}`);

    return validTags;
  } catch (error) {
    console.error('❌ Error fetching tags:', error);
    throw error;
  }
}

// Run if called directly (only if this file is being run, not imported)
// Simple check: if the script filename is in the executed path
const scriptName = 'fetch-viator-tags.js';
const isMainModule = process.argv[1] && process.argv[1].includes(scriptName);

if (isMainModule) {
  fetchAllTags()
    .then(() => {
      console.log('\n✅ Done!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('\n❌ Failed:', error);
      process.exit(1);
    });
}

