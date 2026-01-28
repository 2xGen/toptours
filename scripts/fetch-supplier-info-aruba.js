/**
 * Script to fetch supplier information from Viator Sandbox API
 * and update tour_operators_crm table with email and supplier details
 * 
 * Tests with Aruba operators (destination_id: 28)
 * Uses sandbox API: https://api.sandbox.viator.com/partner/suppliers/search/product-codes
 * 
 * Usage:
 *   node scripts/fetch-supplier-info-aruba.js
 *   node scripts/fetch-supplier-info-aruba.js "Eila"  (process specific operator)
 * 
 * What it does:
 *   1. Fetches operators from tour_operators_crm for Aruba (or specific operator)
 *   2. Gets all product codes from tour_product_ids
 *   3. Calls Viator Sandbox API to get supplier info (max 500 codes per request)
 *   4. Updates email field (if not already set and not example email)
 *   5. Appends supplier info to notes field (reference, name, type, verified status, contact info)
 * 
 * Environment variables needed:
 *   - NEXT_PUBLIC_SUPABASE_URL
 *   - SUPABASE_SERVICE_ROLE_KEY
 *   - VIATOR_API_KEY (optional, has default)
 *   - USE_SANDBOX (optional, default: true) - Set to "false" to use production API
 * 
 * Note: Sandbox API may require a different API key than production.
 *       If you get 401 errors with sandbox, try setting USE_SANDBOX=false
 */

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables
dotenv.config({ path: join(__dirname, '../.env.local') });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// Use sandbox API for testing (set USE_SANDBOX=false to use production)
const USE_SANDBOX = process.env.USE_SANDBOX !== 'false'; // Default to true for safety
const VIATOR_API_BASE = USE_SANDBOX 
  ? 'https://api.sandbox.viator.com/partner'
  : 'https://api.viator.com/partner';
const VIATOR_API_KEY = process.env.VIATOR_API_KEY || '282a363f-5d60-456a-a6a0-774ec4832b07';

// Aruba destination ID (Viator destination ID)
const ARUBA_DESTINATION_ID = '28';

// Get operator name from command line args (optional)
const OPERATOR_NAME = process.argv[2] || null;

/**
 * Fetch supplier information for product codes
 * @param {string[]} productCodes - Array of product codes (max 500)
 * @returns {Promise<Object>} Supplier information
 */
async function fetchSupplierInfo(productCodes) {
  if (!productCodes || productCodes.length === 0) {
    console.log('⚠️  No product codes provided');
    return { suppliers: [] };
  }

  // Limit to 500 per request (API limit)
  const codesToFetch = productCodes.slice(0, 500);
  
  console.log(`📡 Fetching supplier info for ${codesToFetch.length} product codes...`);

  try {
    const response = await fetch(`${VIATOR_API_BASE}/suppliers/search/product-codes`, {
      method: 'POST',
      headers: {
        'exp-api-key': VIATOR_API_KEY,
        'Accept': 'application/json;version=2.0',
        'Accept-Language': 'en-US',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        productCodes: codesToFetch,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`❌ API Error: ${response.status} ${response.statusText}`);
      console.error(`Response: ${errorText}`);
      
      if (response.status === 401) {
        console.error('\n⚠️  Authentication failed! Possible issues:');
        console.error('   1. API key is invalid or expired');
        console.error('   2. Sandbox API requires a different key (check Viator partner portal)');
        console.error('   3. Try setting USE_SANDBOX=false to use production API');
        console.error(`   4. Current API base: ${VIATOR_API_BASE}`);
      }
      
      throw new Error(`Viator API error: ${response.status}`);
    }

    const data = await response.json();
    console.log(`✅ Received supplier info for ${data.suppliers?.length || 0} suppliers`);
    
    return data;
  } catch (error) {
    console.error('❌ Error fetching supplier info:', error.message);
    throw error;
  }
}

/**
 * Format supplier information for notes field
 * @param {Object} supplier - Supplier data from API
 * @returns {string} Formatted notes
 */
function formatSupplierNotes(supplier) {
  const notes = [];
  
  notes.push(`Supplier Reference: ${supplier.reference || 'N/A'}`);
  notes.push(`Supplier Name: ${supplier.name || 'N/A'}`);
  notes.push(`Type: ${supplier.type || 'N/A'}`);
  notes.push(`Verified: ${supplier.supplierInfoVerified ? 'Yes' : 'No'}`);
  
  if (supplier.contact) {
    if (supplier.contact.address) {
      notes.push(`Address: ${supplier.contact.address}`);
    }
    if (supplier.contact.phone) {
      notes.push(`Phone: ${supplier.contact.phone}`);
    }
  }
  
  notes.push(`Product Code: ${supplier.productCode || 'N/A'}`);
  notes.push(`Fetched: ${new Date().toISOString()}`);
  
  return notes.join('\n');
}

/**
 * Check if email is a TripAdvisor encoded/protected email
 * TripAdvisor encodes emails as hashes like: "abc123def456@tripadvisor.com"
 */
function isTripAdvisorEncodedEmail(email) {
  if (!email) return false;
  // TripAdvisor encoded emails are long alphanumeric strings before @tripadvisor.com
  // They're typically 32+ character hex strings
  const tripadvisorEmailPattern = /^[a-f0-9]{20,}@tripadvisor\.com$/i;
  return tripadvisorEmailPattern.test(email);
}

/**
 * Update operator CRM record with supplier information
 * @param {string} operatorId - Operator ID
 * @param {string} email - Supplier email
 * @param {string} notes - Supplier notes
 */
async function updateOperatorCRM(operatorId, email, notes) {
  const updateData = {
    updated_at: new Date().toISOString(),
  };

  // Only update email if it's a real email (not example, not TripAdvisor encoded)
  if (email && 
      email !== 'email@example.com' && 
      !isTripAdvisorEncodedEmail(email)) {
    updateData.email = email;
  } else if (isTripAdvisorEncodedEmail(email)) {
    // Add note that email is protected/encoded
    console.log(`  ⚠️  Email is TripAdvisor-encoded (protected), not storing in email field`);
  }

  // Append supplier info to notes (or create if doesn't exist)
  if (notes) {
    const { data: currentOperator } = await supabase
      .from('tour_operators_crm')
      .select('notes')
      .eq('id', operatorId)
      .single();

    const existingNotes = currentOperator?.notes || '';
    updateData.notes = existingNotes 
      ? `${existingNotes}\n\n--- Supplier Info ---\n${notes}`
      : notes;
  }

  const { error } = await supabase
    .from('tour_operators_crm')
    .update(updateData)
    .eq('id', operatorId);

  if (error) {
    console.error(`❌ Error updating operator ${operatorId}:`, error);
    throw error;
  }

  console.log(`✅ Updated operator ${operatorId}`);
}

/**
 * Main function to process Aruba operators
 */
async function processArubaOperators() {
  console.log('🚀 Starting supplier info fetch for Aruba operators...\n');
  console.log(`📍 Looking for operators with destination_id: ${ARUBA_DESTINATION_ID}`);
  console.log(`🌐 Using API: ${USE_SANDBOX ? 'SANDBOX (testing)' : 'PRODUCTION'}`);
  console.log(`🔑 API Key: ${VIATOR_API_KEY.substring(0, 8)}...${VIATOR_API_KEY.substring(VIATOR_API_KEY.length - 4)}\n`);

  // Try to fetch operators with destination_ids field first
  // If that fails or returns empty, fetch all and filter manually
  let operators;
  let fetchError;

  try {
    // Normalize destination ID (remove 'd' prefix if present, same as getOperatorsForDestination)
    const normalizedDestId = ARUBA_DESTINATION_ID.toString().replace(/^d/i, '');
    
    let query = supabase.from('tour_operators_crm').select('*');
    
    // If operator name specified, filter by name
    if (OPERATOR_NAME) {
      console.log(`🔍 Filtering by operator name: ${OPERATOR_NAME}`);
      query = query.eq('operator_name', OPERATOR_NAME);
    } else {
      // Use the same query method as the website: .contains() for array matching
      console.log(`🔍 Filtering by destination_id: ${normalizedDestId} (normalized from ${ARUBA_DESTINATION_ID})`);
      query = query.contains('destination_ids', [normalizedDestId]);
    }
    
    const result = await query;
    operators = result.data;
    fetchError = result.error;

    // If contains() didn't work or returned empty, try fallback (client-side filter)
    if ((!operators || operators.length === 0) && !OPERATOR_NAME) {
      console.log('⚠️  .contains() query returned no results, trying fallback...');
      const { data: allOperators } = await supabase
        .from('tour_operators_crm')
        .select('*');
      
      if (allOperators) {
        operators = allOperators.filter(op => {
          const destIds = Array.isArray(op.destination_ids) ? op.destination_ids : [];
          // Check both normalized and original ID formats
          return destIds.includes(normalizedDestId) || destIds.includes(ARUBA_DESTINATION_ID);
        });
      }
    }
  } catch (err) {
    fetchError = err;
  }

  if (fetchError) {
    console.error('❌ Error fetching operators:', fetchError);
    return;
  }

  if (!operators || operators.length === 0) {
    console.log('⚠️  No operators found');
    console.log('💡 Tip: Make sure operators have destination_ids field or tour_product_ids');
    
    // Debug: Show what destination IDs exist in the database
    console.log('\n🔍 Debug: Checking what destination_ids exist in database...');
    try {
      const { data: sampleOperators } = await supabase
        .from('tour_operators_crm')
        .select('operator_name, destination_ids, tour_product_ids')
        .limit(10);
      
      if (sampleOperators && sampleOperators.length > 0) {
        console.log('Sample operators in database:');
        sampleOperators.forEach((op, idx) => {
          console.log(`  ${idx + 1}. ${op.operator_name}`);
          console.log(`     destination_ids: ${JSON.stringify(op.destination_ids)}`);
          console.log(`     tour_product_ids count: ${op.tour_product_ids?.length || 0}`);
        });
      } else {
        console.log('  No operators found in database at all');
      }
    } catch (debugError) {
      console.error('  Error checking database:', debugError.message);
    }
    
    return;
  }

  console.log(`📋 Found ${operators.length} operator(s) to process\n`);
  
  // Display operators being processed
  operators.forEach((op, idx) => {
    console.log(`  ${idx + 1}. ${op.operator_name} (${op.tour_product_ids?.length || 0} product codes)`);
  });
  console.log('');


  // Collect all product codes
  const allProductCodes = [];
  const operatorProductMap = new Map(); // Map product code to operator

  operators.forEach(operator => {
    if (operator.tour_product_ids && Array.isArray(operator.tour_product_ids)) {
      operator.tour_product_ids.forEach(productCode => {
        allProductCodes.push(productCode);
        if (!operatorProductMap.has(productCode)) {
          operatorProductMap.set(productCode, []);
        }
        operatorProductMap.get(productCode).push(operator);
      });
    }
  });

  if (allProductCodes.length === 0) {
    console.log('⚠️  No product codes found in operators');
    return;
  }

  console.log(`📦 Total unique product codes: ${new Set(allProductCodes).size}`);
  console.log(`📦 Total product codes (with duplicates): ${allProductCodes.length}\n`);

  // Fetch supplier info in batches of 500
  const uniqueProductCodes = [...new Set(allProductCodes)];
  const batches = [];
  
  for (let i = 0; i < uniqueProductCodes.length; i += 500) {
    batches.push(uniqueProductCodes.slice(i, i + 500));
  }

  console.log(`📦 Processing ${batches.length} batch(es)...\n`);

  const allUpdateSummaries = [];

  for (let batchIndex = 0; batchIndex < batches.length; batchIndex++) {
    const batch = batches[batchIndex];
    console.log(`\n📦 Processing batch ${batchIndex + 1}/${batches.length} (${batch.length} product codes)...`);

    try {
      const supplierData = await fetchSupplierInfo(batch);
      const suppliers = supplierData.suppliers || [];

      // Map suppliers by product code
      const supplierMap = new Map();
      suppliers.forEach(supplier => {
        if (supplier.productCode) {
          supplierMap.set(supplier.productCode, supplier);
        }
      });

      // Update operators with supplier info
      const updatedOperators = new Set();
      const updateSummary = [];

      for (const supplier of suppliers) {
        const productCode = supplier.productCode;
        const operatorsForProduct = operatorProductMap.get(productCode) || [];

        for (const operator of operatorsForProduct) {
          if (!updatedOperators.has(operator.id)) {
            const email = supplier.contact?.email;
            const notes = formatSupplierNotes(supplier);

            await updateOperatorCRM(operator.id, email, notes);
            updatedOperators.add(operator.id);

            const summary = {
              operatorName: operator.operator_name,
              email: email && email !== 'email@example.com' ? email : null,
              supplierName: supplier.name,
              verified: supplier.supplierInfoVerified,
            };
            updateSummary.push(summary);

            console.log(`  ✅ Updated: ${operator.operator_name}`);
            if (summary.email) {
              console.log(`     📧 Email: ${summary.email}`);
            }
            console.log(`     🏢 Supplier: ${supplier.name} (${supplier.supplierInfoVerified ? 'Verified' : 'Not Verified'})`);
          }
        }
      }

      allUpdateSummaries.push(...updateSummary);

      // Wait a bit between batches to avoid rate limiting
      if (batchIndex < batches.length - 1) {
        console.log('⏳ Waiting 2 seconds before next batch...');
        await new Promise(resolve => setTimeout(resolve, 2000));
      }
    } catch (error) {
      console.error(`❌ Error processing batch ${batchIndex + 1}:`, error.message);
      // Continue with next batch
    }
  }

  console.log('\n✅ Supplier info fetch completed!\n');
  
  // Print summary
  console.log('📊 Summary:');
  console.log(`   Total operators processed: ${allUpdateSummaries.length}`);
  const withEmail = allUpdateSummaries.filter(s => s.email).length;
  const verified = allUpdateSummaries.filter(s => s.verified).length;
  console.log(`   Operators with email: ${withEmail}`);
  console.log(`   Verified suppliers: ${verified}`);
  
  if (allUpdateSummaries.length > 0) {
    console.log('\n📋 Updated Operators:');
    allUpdateSummaries.forEach((summary, idx) => {
      console.log(`   ${idx + 1}. ${summary.operatorName}`);
      if (summary.email) {
        console.log(`      📧 ${summary.email}`);
      }
      console.log(`      🏢 ${summary.supplierName} ${summary.verified ? '✓ Verified' : ''}`);
    });
  }
}

// Run the script
processArubaOperators()
  .then(() => {
    console.log('\n🎉 Script finished successfully');
    process.exit(0);
  })
  .catch(error => {
    console.error('\n❌ Script failed:', error);
    process.exit(1);
  });
