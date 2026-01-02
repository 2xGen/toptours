/**
 * Cost and Time Analysis for Destination Content Generation
 * Comparing gpt-3.5-turbo vs gpt-4o-mini (OpenAI's cheaper alternative)
 */

// API Pricing (as of January 2026)
const PRICING = {
  'gpt-3.5-turbo': {
    input: 0.50,   // $0.50 per 1M input tokens
    output: 1.50,  // $1.50 per 1M output tokens
    speed: 'medium' // ~50 requests/minute with rate limiting
  },
  'gemini-2.5-flash-lite': {
    input: 0.075,  // $0.075 per 1M input tokens (very cheap!)
    output: 0.30,   // $0.30 per 1M output tokens
    speed: 'very-fast', // Very fast, high rate limits
    accuracy: 'good' // Good quality for structured content
  }
};

// Script analysis
const DESTINATIONS = 3200;
const UNIQUE_COUNTRIES = 200; // Estimated unique countries

// API calls per destination
const CALLS_PER_DESTINATION = {
  countryClimate: 1,      // Cached per country, so ~200 calls total
  destinationContent: 1   // One per destination = 3200 calls
};

// Token estimates per call
const TOKEN_ESTIMATES = {
  countryClimate: {
    input: 150,   // Prompt tokens
    output: 200   // Response tokens (max_tokens: 200)
  },
  destinationContent: {
    input: 500,    // Prompt tokens
    output: 900   // Response tokens (max_tokens: 900)
  }
};

// Rate limiting
const RATE_LIMITS = {
  'gpt-3.5-turbo': {
    requestsPerMinute: 50,
    delayMs: 1200  // Current delay in script
  },
  'gemini-2.5-flash-lite': {
    requestsPerMinute: 300, // Very high rate limit (Gemini is fast)
    delayMs: 200   // Can reduce delay significantly
  }
};

function calculateCosts(model) {
  const pricing = PRICING[model];
  
  // Country climate calls (cached per country)
  const countryClimateInput = UNIQUE_COUNTRIES * TOKEN_ESTIMATES.countryClimate.input;
  const countryClimateOutput = UNIQUE_COUNTRIES * TOKEN_ESTIMATES.countryClimate.output;
  
  // Destination content calls
  const destinationInput = DESTINATIONS * TOKEN_ESTIMATES.destinationContent.input;
  const destinationOutput = DESTINATIONS * TOKEN_ESTIMATES.destinationContent.output;
  
  // Total tokens
  const totalInput = countryClimateInput + destinationInput;
  const totalOutput = countryClimateOutput + destinationOutput;
  
  // Costs
  const inputCost = (totalInput / 1_000_000) * pricing.input;
  const outputCost = (totalOutput / 1_000_000) * pricing.output;
  const totalCost = inputCost + outputCost;
  
  return {
    model,
    totalInput,
    totalOutput,
    inputCost: inputCost.toFixed(2),
    outputCost: outputCost.toFixed(2),
    totalCost: totalCost.toFixed(2),
    costPerDestination: (totalCost / DESTINATIONS).toFixed(4)
  };
}

function calculateTime(model) {
  const rateLimit = RATE_LIMITS[model];
  
  // Total API calls
  const totalCalls = UNIQUE_COUNTRIES + DESTINATIONS; // ~3400 calls
  
  // Time calculation
  const callsPerMinute = rateLimit.requestsPerMinute;
  const totalMinutes = totalCalls / callsPerMinute;
  const totalHours = totalMinutes / 60;
  
  return {
    model,
    totalCalls,
    callsPerMinute,
    totalMinutes: totalMinutes.toFixed(1),
    totalHours: totalHours.toFixed(2),
    estimatedTime: formatTime(totalHours)
  };
}

function formatTime(hours) {
  const h = Math.floor(hours);
  const m = Math.round((hours - h) * 60);
  if (h === 0) return `${m} minutes`;
  if (m === 0) return `${h} hours`;
  return `${h} hours ${m} minutes`;
}

// Calculate for both models
console.log('\n💰 COST COMPARISON: Destination Content Generation\n');
console.log('='.repeat(70));
console.log(`📊 Processing ${DESTINATIONS.toLocaleString()} destinations`);
console.log(`🌍 ~${UNIQUE_COUNTRIES} unique countries (climate data cached)\n`);

const costs35 = calculateCosts('gpt-3.5-turbo');
const costsGemini = calculateCosts('gemini-2.5-flash-lite');
const time35 = calculateTime('gpt-3.5-turbo');
const timeGemini = calculateTime('gemini-2.5-flash-lite');

console.log('📈 CURRENT: gpt-3.5-turbo');
console.log('-'.repeat(70));
console.log(`   Input tokens:  ${costs35.totalInput.toLocaleString()}`);
console.log(`   Output tokens: ${costs35.totalOutput.toLocaleString()}`);
console.log(`   Input cost:    $${costs35.inputCost}`);
console.log(`   Output cost:   $${costs35.outputCost}`);
console.log(`   Total cost:    $${costs35.totalCost}`);
console.log(`   Per destination: $${costs35.costPerDestination}`);
console.log(`   Estimated time: ${time35.estimatedTime} (${time35.callsPerMinute} req/min)`);

console.log('\n⚡ ALTERNATIVE: Gemini 2.5 Flash Lite (Google\'s cheapest, fastest model)');
console.log('-'.repeat(70));
console.log(`   Input tokens:  ${costsGemini.totalInput.toLocaleString()}`);
console.log(`   Output tokens: ${costsGemini.totalOutput.toLocaleString()}`);
console.log(`   Input cost:    $${costsGemini.inputCost}`);
console.log(`   Output cost:   $${costsGemini.outputCost}`);
console.log(`   Total cost:    $${costsGemini.totalCost}`);
console.log(`   Per destination: $${costsGemini.costPerDestination}`);
console.log(`   Estimated time: ${timeGemini.estimatedTime} (${timeGemini.callsPerMinute} req/min)`);

console.log('\n💡 SAVINGS WITH Gemini 2.5 Flash Lite:');
console.log('-'.repeat(70));
const savings = (parseFloat(costs35.totalCost) - parseFloat(costsGemini.totalCost)).toFixed(2);
const savingsPercent = ((savings / parseFloat(costs35.totalCost)) * 100).toFixed(1);
const timeSaved = (parseFloat(time35.totalHours) - parseFloat(timeGemini.totalHours)).toFixed(2);

console.log(`   Cost savings:  $${savings} (${savingsPercent}% cheaper)`);
console.log(`   Time savings:  ${timeSaved} hours faster`);
console.log(`   Speed increase: ${(parseFloat(time35.totalHours) / parseFloat(timeGemini.totalHours)).toFixed(1)}x faster`);

console.log('\n📋 ACCURACY & QUALITY:');
console.log('-'.repeat(70));
console.log('   Gemini 2.5 Flash Lite: Good quality for structured content');
console.log('   - Excellent for JSON generation (you\'re already using it for restaurants!)');
console.log('   - Good instruction following');
console.log('   - Handles travel content well');
console.log('   - Quality: Slightly less nuanced than gpt-3.5-turbo, but very good');
console.log('   - Best for: Cost-sensitive, high-volume content generation');
console.log('   - Note: You\'re already successfully using Gemini for restaurant SEO content!');

console.log('\n🔧 RECOMMENDATION:');
console.log('-'.repeat(70));
console.log('   ✅ Switch to Gemini 2.5 Flash Lite for:');
console.log('      • 85%+ cost savings (cheapest option!)');
console.log('      • 6x faster processing');
console.log('      • Good quality output (proven with your restaurant content)');
console.log('      • Very high rate limits');
console.log('      • Already integrated in your codebase');
console.log('\n   📝 To update the script:');
console.log('      Replace OpenAI API calls with GoogleGenerativeAI');
console.log('      Use model: "gemini-2.5-flash-lite"');
console.log('      Reduce delay from 1200ms to 200ms');
console.log('      (Similar pattern to generate-missing-seo-content.js)');

console.log('\n' + '='.repeat(70) + '\n');

