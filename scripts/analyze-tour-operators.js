/**
 * Analyze Tour Operators CRM Database
 * Checks if operators have multiple tours and identifies potential duplicates
 */

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({ path: join(__dirname, '../.env.local') });

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error('❌ Missing Supabase credentials. Please set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY.');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

/**
 * Normalize operator name for comparison (same logic as in tourOperatorsCRM.js)
 */
function normalizeOperatorName(name) {
  if (!name) return null;
  return name
    .trim()
    .replace(/\s+/g, ' ') // Replace multiple spaces with single space
    .replace(/[–—]/g, '-') // Normalize dashes
    .toLowerCase(); // Case-insensitive matching
}

async function analyzeOperators() {
  console.log('🔍 Analyzing Tour Operators CRM Database...\n');

  // Fetch all operators with pagination
  let allOperators = [];
  let from = 0;
  const pageSize = 1000;
  let hasMore = true;

  while (hasMore) {
    const { data, error } = await supabase
      .from('tour_operators_crm')
      .select('id, operator_name, tour_product_ids, destination_ids, created_at')
      .order('created_at', { ascending: false })
      .range(from, from + pageSize - 1);

    if (error) {
      console.error('❌ Error fetching operators:', error);
      process.exit(1);
    }

    if (data && data.length > 0) {
      allOperators = [...allOperators, ...data];
      from += pageSize;
      hasMore = data.length === pageSize;
    } else {
      hasMore = false;
    }
  }

  console.log(`📊 Total operators in database: ${allOperators.length}\n`);

  // Analyze tour counts per operator
  const tourCountStats = {
    1: 0,      // Operators with exactly 1 tour
    2: 0,      // Operators with exactly 2 tours
    3: 0,      // Operators with exactly 3 tours
    '4-10': 0, // Operators with 4-10 tours
    '11-50': 0, // Operators with 11-50 tours
    '51+': 0   // Operators with 51+ tours
  };

  const operatorsWithMultipleTours = [];
  const operatorsWithOneTour = [];

  allOperators.forEach(op => {
    const tourCount = Array.isArray(op.tour_product_ids) ? op.tour_product_ids.length : 0;
    
    if (tourCount === 1) {
      tourCountStats[1]++;
      operatorsWithOneTour.push(op);
    } else if (tourCount === 2) {
      tourCountStats[2]++;
      operatorsWithMultipleTours.push(op);
    } else if (tourCount === 3) {
      tourCountStats[3]++;
      operatorsWithMultipleTours.push(op);
    } else if (tourCount >= 4 && tourCount <= 10) {
      tourCountStats['4-10']++;
      operatorsWithMultipleTours.push(op);
    } else if (tourCount >= 11 && tourCount <= 50) {
      tourCountStats['11-50']++;
      operatorsWithMultipleTours.push(op);
    } else if (tourCount > 50) {
      tourCountStats['51+']++;
      operatorsWithMultipleTours.push(op);
    }

    // Handle empty or null arrays
    if (tourCount === 0) {
      console.warn(`⚠️  Operator "${op.operator_name}" has no tours!`);
    }
  });

  // Display statistics
  console.log('📈 Tour Count Distribution:');
  console.log(`   Operators with 1 tour:        ${tourCountStats[1].toLocaleString()}`);
  console.log(`   Operators with 2 tours:      ${tourCountStats[2].toLocaleString()}`);
  console.log(`   Operators with 3 tours:      ${tourCountStats[3].toLocaleString()}`);
  console.log(`   Operators with 4-10 tours:    ${tourCountStats['4-10'].toLocaleString()}`);
  console.log(`   Operators with 11-50 tours:   ${tourCountStats['11-50'].toLocaleString()}`);
  console.log(`   Operators with 51+ tours:     ${tourCountStats['51+'].toLocaleString()}`);
  console.log(`\n✅ Operators with multiple tours: ${operatorsWithMultipleTours.length.toLocaleString()}`);

  // Show examples of operators with multiple tours
  if (operatorsWithMultipleTours.length > 0) {
    console.log('\n📋 Examples of operators with multiple tours:');
    const sortedByTours = [...operatorsWithMultipleTours]
      .sort((a, b) => {
        const aCount = Array.isArray(a.tour_product_ids) ? a.tour_product_ids.length : 0;
        const bCount = Array.isArray(b.tour_product_ids) ? b.tour_product_ids.length : 0;
        return bCount - aCount;
      })
      .slice(0, 20); // Show top 20

    sortedByTours.forEach(op => {
      const tourCount = Array.isArray(op.tour_product_ids) ? op.tour_product_ids.length : 0;
      const destCount = Array.isArray(op.destination_ids) ? op.destination_ids.length : 0;
      console.log(`   • "${op.operator_name}" - ${tourCount} tours, ${destCount} destinations`);
    });
  }

  // Check for potential duplicates (same normalized name, different exact name)
  console.log('\n🔍 Checking for potential duplicate operators (same name, different casing/spacing)...');
  
  const normalizedMap = new Map();
  const duplicates = [];

  allOperators.forEach(op => {
    const normalized = normalizeOperatorName(op.operator_name);
    if (!normalized) return;

    if (normalizedMap.has(normalized)) {
      const existing = normalizedMap.get(normalized);
      if (existing.operator_name !== op.operator_name) {
        // Found a duplicate with different exact name
        duplicates.push({
          normalized,
          variants: [existing, op]
        });
      }
    } else {
      normalizedMap.set(normalized, op);
    }
  });

  if (duplicates.length > 0) {
    console.log(`\n⚠️  Found ${duplicates.length} potential duplicate operator groups:\n`);
    duplicates.slice(0, 10).forEach((dup, idx) => {
      console.log(`   Group ${idx + 1} (normalized: "${dup.normalized}"):`);
      dup.variants.forEach(variant => {
        const tourCount = Array.isArray(variant.tour_product_ids) ? variant.tour_product_ids.length : 0;
        console.log(`      - "${variant.operator_name}" (${tourCount} tours)`);
      });
    });
    if (duplicates.length > 10) {
      console.log(`   ... and ${duplicates.length - 10} more duplicate groups`);
    }
  } else {
    console.log('✅ No duplicate operators found (based on normalized name matching)');
  }

  // Summary
  console.log('\n' + '='.repeat(60));
  console.log('📊 SUMMARY:');
  console.log(`   Total operators: ${allOperators.length.toLocaleString()}`);
  console.log(`   Operators with 1 tour: ${tourCountStats[1].toLocaleString()} (${((tourCountStats[1] / allOperators.length) * 100).toFixed(1)}%)`);
  console.log(`   Operators with 2+ tours: ${operatorsWithMultipleTours.length.toLocaleString()} (${((operatorsWithMultipleTours.length / allOperators.length) * 100).toFixed(1)}%)`);
  console.log(`   Potential duplicates: ${duplicates.length}`);
  console.log('='.repeat(60));
}

// Run the analysis
analyzeOperators().catch(error => {
  console.error('❌ Error:', error);
  process.exit(1);
});


