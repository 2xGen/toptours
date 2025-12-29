# Phase 2: AI Trip Planner - Cost Recalculation

## Gemini 1.5 Flash Pricing (Actual)

Based on Google AI pricing:
- **Input:** $0.07-$0.15 per million tokens
- **Output:** $0.30-$1.25 per million tokens

*Note: Pricing varies by version and context length, but these are typical ranges.*

---

## Token Usage Per Query

### Typical AI Query Structure

**Input Tokens (~500-1000 tokens):**
- User query: ~20 tokens
- Destination data: ~200 tokens (name, description, highlights)
- User preferences: ~100 tokens (adventure level, budget, group size, etc.)
- Available tours/restaurants: ~200-500 tokens (top 10 with match scores)
- System prompt: ~100 tokens
- **Total: ~500-1000 tokens**

**Output Tokens (~200-500 tokens):**
- Response message: ~100-200 tokens
- Recommendations (3-5 items): ~100-300 tokens
- **Total: ~200-500 tokens**

**Total per query: ~700-1500 tokens**

---

## Cost Per Query

### Conservative Estimate (Higher pricing)
- Input: 1000 tokens × $0.15/million = **$0.00015**
- Output: 500 tokens × $1.25/million = **$0.000625**
- **Total: ~$0.000775 per query**

### Optimistic Estimate (Lower pricing)
- Input: 500 tokens × $0.07/million = **$0.000035**
- Output: 200 tokens × $0.30/million = **$0.00006**
- **Total: ~$0.000095 per query**

### Realistic Estimate (Middle ground)
- Input: 750 tokens × $0.10/million = **$0.000075**
- Output: 350 tokens × $0.60/million = **$0.00021**
- **Total: ~$0.000285 per query**

**Let's use $0.0003 per query as a realistic average.**

---

## Monthly Cost Calculation

### Scenario 1: Low Usage (100 queries/day total)
- **Structured responses (90%):** 90 queries/day = 2,700/month = **$0** (free)
- **AI responses (10%):** 10 queries/day = 300/month × $0.0003 = **$0.09/month**

**Total: ~$0.10/month** ✅

### Scenario 2: Medium Usage (1,000 queries/day total)
- **Structured responses (90%):** 900 queries/day = 27,000/month = **$0** (free)
- **AI responses (10%):** 100 queries/day = 3,000/month × $0.0003 = **$0.90/month**

**Total: ~$1/month** ✅

### Scenario 3: High Usage (10,000 queries/day total)
- **Structured responses (90%):** 9,000 queries/day = 270,000/month = **$0** (free)
- **AI responses (10%):** 1,000 queries/day = 30,000/month × $0.0003 = **$9/month**

**Total: ~$9/month** ✅

### Scenario 4: Very High Usage (100,000 queries/day total)
- **Structured responses (90%):** 90,000 queries/day = 2,700,000/month = **$0** (free)
- **AI responses (10%):** 10,000 queries/day = 300,000/month × $0.0003 = **$90/month**

**Total: ~$90/month** ✅

---

## Comparison: Old vs. New Estimate

### Old Estimate (Incorrect)
- Low usage: $20-100/month ❌
- Medium usage: $100-300/month ❌
- High usage: $1,000-3,000/month ❌

### New Estimate (Correct)
- Low usage: **$0.10/month** ✅
- Medium usage: **$1/month** ✅
- High usage: **$9/month** ✅
- Very high usage: **$90/month** ✅

**Correction: Costs are 100-1000x lower than initially estimated!**

---

## Why the Hybrid Approach is Even Better

### Cost Breakdown

**Without Hybrid (AI for everything):**
- 100 queries/day = 3,000/month × $0.0003 = **$0.90/month**
- 1,000 queries/day = 30,000/month × $0.0003 = **$9/month**
- 10,000 queries/day = 300,000/month × $0.0003 = **$90/month**

**With Hybrid (90% structured, 10% AI):**
- 100 queries/day = 300 AI/month × $0.0003 = **$0.09/month** (90% savings)
- 1,000 queries/day = 3,000 AI/month × $0.0003 = **$0.90/month** (90% savings)
- 10,000 queries/day = 30,000 AI/month × $0.0003 = **$9/month** (90% savings)

**Hybrid approach saves 90% on costs!**

---

## Real-World Usage Scenarios

### Small Site (1,000 visitors/day, 10% use chat)
- 100 chat queries/day
- 10 AI queries/day = 300/month
- **Cost: $0.09/month** ✅

### Medium Site (10,000 visitors/day, 10% use chat)
- 1,000 chat queries/day
- 100 AI queries/day = 3,000/month
- **Cost: $0.90/month** ✅

### Large Site (100,000 visitors/day, 10% use chat)
- 10,000 chat queries/day
- 1,000 AI queries/day = 30,000/month
- **Cost: $9/month** ✅

### Very Large Site (1,000,000 visitors/day, 10% use chat)
- 100,000 chat queries/day
- 10,000 AI queries/day = 300,000/month
- **Cost: $90/month** ✅

---

## Cost Optimization Strategies

### 1. Caching Common Queries
Cache responses for:
- "What to do in [destination]?" (structured, already free)
- "Best [activity] in [destination]?" (AI response, cache for 1 hour)

**Potential savings:** 50% reduction in AI calls = **$0.05-5/month** (depending on usage)

### 2. Rate Limiting
- Free users: 5 AI queries/day
- Premium users: Unlimited

**Potential savings:** Reduces abuse, but minimal cost impact (already very cheap)

### 3. Prompt Optimization
- Reduce input tokens by:
  - Sending only top 5 tours/restaurants (not 10)
  - Shorter system prompts
  - More efficient data formatting

**Potential savings:** 30% reduction in tokens = **$0.03-3/month** (depending on usage)

---

## Updated Cost Estimates for Documentation

### Phase 2: AI Trip Planner MVP (Hybrid Approach)

**Development Time:** 2-3 weeks
**Monthly Operating Cost:**
- Low usage (100 queries/day): **$0.10/month**
- Medium usage (1,000 queries/day): **$1/month**
- High usage (10,000 queries/day): **$9/month**
- Very high usage (100,000 queries/day): **$90/month**

**Cost per AI query:** ~$0.0003 (0.03 cents)

**Key Insight:** With 90% structured responses, AI costs are negligible even at high scale!

---

## Conclusion

**Original Estimate:** $20-100/month ❌
**Corrected Estimate:** $0.10-90/month ✅

**The hybrid approach makes AI costs essentially negligible:**
- Even at 10,000 queries/day, costs are only **$9/month**
- At typical usage (1,000 queries/day), costs are only **$1/month**
- The 90% structured response rate means most queries are **completely free**

**This makes the AI Trip Planner extremely cost-effective and scalable!**

