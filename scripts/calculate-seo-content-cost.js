// Simple cost calculator for destination SEO content generation

function estimateCost(numDestinations) {
  // Per destination:
  // - Input: ~400 tokens (prompt + destination info)
  // - Output: ~200 tokens (3 pieces of content: card sentence, hero description, SEO title)
  
  const inputTokens = numDestinations * 400;
  const outputTokens = numDestinations * 200;
  
  // GPT-3.5 Turbo pricing (as of 2024)
  const inputCostPerMillion = 0.50; // $0.50 per 1M input tokens
  const outputCostPerMillion = 1.50; // $1.50 per 1M output tokens
  
  const inputCost = (inputTokens / 1_000_000) * inputCostPerMillion;
  const outputCost = (outputTokens / 1_000_000) * outputCostPerMillion;
  const totalCost = inputCost + outputCost;
  
  return {
    numDestinations,
    inputTokens,
    outputTokens,
    inputCost,
    outputCost,
    totalCost,
    costPerDestination: totalCost / numDestinations,
    inputCostPerMillion: inputCostPerMillion,
    outputCostPerMillion: outputCostPerMillion
  };
}

// Calculate for 3,200 destinations
const estimate = estimateCost(3200);

console.log('\n💰 COST ESTIMATE FOR DESTINATION SEO CONTENT GENERATION\n');
console.log('━'.repeat(60));
console.log(`\n📊 DESTINATIONS TO PROCESS: ${estimate.numDestinations.toLocaleString()}`);
console.log(`\n📝 CONTENT PER DESTINATION:`);
console.log(`   • 1 Card Sentence (briefDescription)`);
console.log(`   • 1 Hero Description`);
console.log(`   • 1 SEO Title`);
console.log(`   • Meta Description (uses card sentence)\n`);
console.log('━'.repeat(60));
console.log(`\n💵 TOKEN USAGE:`);
console.log(`   Input tokens:  ${estimate.inputTokens.toLocaleString()} (~400 per destination)`);
console.log(`   Output tokens: ${estimate.outputTokens.toLocaleString()} (~200 per destination)`);
console.log(`   Total tokens:  ${(estimate.inputTokens + estimate.outputTokens).toLocaleString()}\n`);
console.log('━'.repeat(60));
console.log(`\n💰 COST BREAKDOWN (GPT-3.5 Turbo):`);
console.log(`   Input cost:  $${estimate.inputCost.toFixed(4)} ($${estimate.inputCostPerMillion.toFixed(2)} per 1M tokens)`);
console.log(`   Output cost: $${estimate.outputCost.toFixed(4)} ($${estimate.outputCostPerMillion.toFixed(2)} per 1M tokens)`);
console.log(`   ─────────────────────────────────────────`);
console.log(`   TOTAL COST:  $${estimate.totalCost.toFixed(4)}`);
console.log(`   Cost per destination: $${estimate.costPerDestination.toFixed(6)}\n`);
console.log('━'.repeat(60));
console.log(`\n📌 NOTES:`);
console.log(`   • Actual cost may vary based on actual token usage`);
console.log(`   • Processing will be done in batches to avoid rate limits`);
console.log(`   • Estimated processing time: ~2-3 hours (with delays between batches)`);
console.log(`   • Results will be saved to: generated-destination-seo-content.json\n`);

