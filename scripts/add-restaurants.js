/**
 * Add restaurants for destinations
 * 
 * Usage:
 *   node scripts/add-restaurants.js <region> [--import-only] [--seo-only]
 *   node scripts/add-restaurants.js <destinationId> [--import-only] [--seo-only]
 * 
 * Examples:
 *   # Step 1: Import restaurants only (fast)
 *   node scripts/add-restaurants.js middle-east --import-only
 *   
 *   # Step 2: Generate SEO only (can run separately)
 *   node scripts/add-restaurants.js middle-east --seo-only
 *   
 *   # Or do both (default)
 *   node scripts/add-restaurants.js paris
 */

import { spawn } from 'child_process';
import { destinations } from '../src/data/destinationsData.js';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({ path: join(__dirname, '../.env.local') });

// Region mappings
const regionMap = {
  'europe': 'Europe',
  'north-america': 'North America',
  'south-america': 'South America',
  'asia-pacific': 'Asia-Pacific',
  'africa': 'Africa',
  'middle-east': 'Middle East',
  'caribbean': 'Caribbean',
};

function runCommand(command, args, showOutput = false) {
  return new Promise((resolve, reject) => {
    const child = spawn('node', [command, ...args], {
      stdio: showOutput ? ['inherit', 'pipe', 'pipe'] : 'pipe',
      shell: true,
    });
    
    let stdout = '';
    let stderr = '';
    
    // Always capture output
    child.stdout.on('data', (data) => {
      const text = data.toString();
      stdout += text;
      if (showOutput) {
        process.stdout.write(text); // Also show in real-time
      }
    });
    
    child.stderr.on('data', (data) => {
      const text = data.toString();
      stderr += text;
      if (showOutput) {
        process.stderr.write(text); // Also show in real-time
      }
    });
    
    child.on('close', (code) => {
      if (code === 0) {
        resolve({ stdout, stderr });
      } else {
        reject(new Error(`Process exited with code ${code}. ${stderr.substring(0, 200)}`));
      }
    });
    
    child.on('error', (error) => {
      reject(error);
    });
  });
}

async function fetchRestaurantsForDestination(dest, importOnly = false, seoOnly = false) {
  console.log(`\n📍 ${dest.fullName} (${dest.id})`);
  
  const query = `restaurants in ${dest.fullName}`;
  
  try {
    let importSuccess = false;
    
    // Step 1: Import restaurants (skip if seo-only mode)
    if (!seoOnly) {
      console.log(`   🔍 Fetching restaurants from Google Places...`);
      try {
        // Show output in real-time so we can see what's happening
        // Pass query as a single argument by wrapping in quotes for shell
        const { stdout: fetchOutput, stderr: fetchError } = await runCommand(
          'scripts/fetch-restaurants-from-google-places.js',
          [dest.id, `"${query}"`], // Quote the query to handle spaces
          true // Show output in real-time
        );
        
        // Check if restaurants were actually created/updated
        const output = (fetchOutput || '') + (fetchError || '');
        const hasCreated = output.includes('Created:') || output.includes('✓ Created:');
        const hasUpdated = output.includes('Updated:') || output.includes('✓ Updated:');
        const hasComplete = output.includes('✅ Complete!');
        const hasError = output.includes('✗ Error:') || output.includes('Error:');
        
        if (hasError && !hasCreated && !hasUpdated) {
          console.error(`   ❌ Import failed - check errors above`);
          if (importOnly) return false;
        } else if (hasComplete && (hasCreated || hasUpdated)) {
          // Extract counts from output
          const createdMatch = output.match(/Created:\s*(\d+)/);
          const updatedMatch = output.match(/Updated:\s*(\d+)/);
          const created = createdMatch ? parseInt(createdMatch[1]) : 0;
          const updated = updatedMatch ? parseInt(updatedMatch[1]) : 0;
          console.log(`   ✅ Restaurants fetched: ${created} created, ${updated} updated`);
          importSuccess = true;
        } else if (hasComplete) {
          console.log(`   ⚠️  No restaurants created/updated (may already exist)`);
          importSuccess = true; // Still consider success if script completed
        } else {
          console.log(`   ✅ Restaurants fetched`);
          importSuccess = true;
        }
      } catch (error) {
        console.error(`   ❌ Import error: ${error.message.substring(0, 150)}`);
        if (importOnly) return false;
      }
    } else {
      importSuccess = true; // Assume restaurants exist in seo-only mode
    }
    
    // Step 2: Generate SEO content (skip if import-only mode)
    if (!importOnly && importSuccess) {
      console.log(`   📝 Generating SEO content...`);
      try {
        await runCommand(
          'scripts/generate-restaurant-seo-content.js',
          [dest.id],
          true // Show output in real-time
        );
        console.log(`   ✅ SEO generated`);
      } catch (seoError) {
        // Check if it's just warnings or actual errors
        const errorMsg = seoError.message || '';
        if (errorMsg.includes('Already has SEO content') || errorMsg.includes('Successfully updated')) {
          console.log(`   ✅ SEO already exists or completed`);
        } else {
          console.error(`   ⚠️  SEO generation had issues: ${errorMsg.substring(0, 200)}`);
        }
      }
    }
    
    return importSuccess;
  } catch (error) {
    console.error(`   ❌ Error: ${error.message.substring(0, 150)}`);
    return false;
  }
}

async function main() {
  const args = process.argv.slice(2);
  
  if (args.length === 0) {
    console.log('\n📋 Usage:');
    console.log('   node scripts/add-restaurants.js <region> [--import-only] [--seo-only]');
    console.log('   node scripts/add-restaurants.js <destinationId> [--import-only] [--seo-only]');
    console.log('\n📌 Examples:');
    console.log('   # Step 1: Import restaurants (fast)');
    console.log('   node scripts/add-restaurants.js middle-east --import-only');
    console.log('   ');
    console.log('   # Step 2: Generate SEO (run separately)');
    console.log('   node scripts/add-restaurants.js middle-east --seo-only');
    console.log('   ');
    console.log('   # Or do both at once');
    console.log('   node scripts/add-restaurants.js paris');
    console.log('\n🌍 Available regions:');
    console.log('   - europe');
    console.log('   - north-america');
    console.log('   - south-america');
    console.log('   - asia-pacific');
    console.log('   - africa');
    console.log('   - middle-east');
    console.log('   - caribbean');
    process.exit(0);
  }
  
  // Parse flags
  const importOnly = args.includes('--import-only');
  const seoOnly = args.includes('--seo-only');
  const input = args.filter(arg => !arg.startsWith('--'))[0]?.toLowerCase();
  
  if (!input) {
    console.error('\n❌ Please provide a region or destination ID\n');
    process.exit(1);
  }
  
  // Check if it's a region or specific destination
  let targetDestinations = [];
  
  if (regionMap[input]) {
    // It's a region
    const category = regionMap[input];
    targetDestinations = destinations.filter(d => d.category === category);
    const mode = importOnly ? 'IMPORT ONLY' : seoOnly ? 'SEO GENERATION ONLY' : 'FULL (Import + SEO)';
    console.log(`\n🌍 Processing ${category} region (${targetDestinations.length} destinations)`);
    console.log(`   Mode: ${mode}\n`);
  } else {
    // It's a specific destination ID
    const dest = destinations.find(d => d.id === input);
    if (!dest) {
      console.error(`\n❌ Destination "${input}" not found!\n`);
      process.exit(1);
    }
    targetDestinations = [dest];
    const mode = importOnly ? 'IMPORT ONLY' : seoOnly ? 'SEO GENERATION ONLY' : 'FULL (Import + SEO)';
    console.log(`\n📍 Processing: ${dest.fullName}`);
    console.log(`   Mode: ${mode}\n`);
  }
  
  if (targetDestinations.length === 0) {
    console.log('❌ No destinations found to process.');
    process.exit(1);
  }
  
  let successCount = 0;
  let failCount = 0;
  
  for (let i = 0; i < targetDestinations.length; i++) {
    const dest = targetDestinations[i];
    const success = await fetchRestaurantsForDestination(dest, importOnly, seoOnly);
    
    if (success) {
      successCount++;
    } else {
      failCount++;
    }
    
    // Rate limiting between destinations (3 seconds)
    if (i < targetDestinations.length - 1) {
      await new Promise(resolve => setTimeout(resolve, 3000));
    }
  }
  
  console.log(`\n${'='.repeat(60)}`);
  console.log(`✅ Complete!`);
  console.log(`   Successful: ${successCount}`);
  console.log(`   Failed: ${failCount}`);
  console.log(`${'='.repeat(60)}\n`);
}

main().catch(console.error);

