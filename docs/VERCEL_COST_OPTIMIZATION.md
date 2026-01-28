# Vercel Cost Optimization Guide

## Current Issue
- **ISR Writes**: 6.48K (Dec) → 295.89K (Jan 12 days) = **45x increase**
- **Image Optimization**: New cost (~$3-4/month)
- **Total**: $29.79/month → $44.71 in 12 days

## Immediate Actions Taken
✅ **Image optimization disabled** - saves ~$3-4/month

## Investigation Steps

### 1. Check Vercel Analytics
Go to: **Vercel Dashboard → Analytics → Functions**

Look for:
- Which routes are being called most?
- Are there specific tour pages being hit repeatedly?
- Bot/crawler patterns?

### 2. Check ISR Write Patterns
The spike suggests:
- **Google reindexing** after SEO improvements (temporary)
- **Bot traffic** crawling many tour pages
- **Cache misses** triggering on-demand regeneration

### 3. Monitor for 3-5 Days
- If ISR writes decrease → Google reindexing (temporary)
- If ISR writes stay high → Need to optimize further

## Potential Optimizations (If Needed)

### Option A: Increase Revalidate Times (If Safe)
Current: 7 days (604800 seconds)
- Tour pages: Already at 7 days ✓
- Destination pages: Already at 7 days ✓

### Option B: Add Bot Detection (Reduce Unnecessary ISR)
```javascript
// In middleware.js or API routes
const userAgent = req.headers['user-agent'] || '';
const isBot = /bot|crawler|spider|crawling|googlebot|bingbot/i.test(userAgent);

if (isBot) {
  // Serve cached version, don't trigger ISR regeneration
  // This prevents bots from causing expensive ISR writes
}
```

### Option C: Limit Dynamic Route Generation
If tour pages are being generated on-demand:
- Consider pre-generating popular tours at build time
- Use `generateStaticParams` for top 100-500 tours

## Expected Timeline
- **Week 1-2**: Google reindexing (high ISR writes) - **EXPECTED**
- **Week 3+**: Should normalize to ~10-20K ISR writes/month

## Cost Projection
- **If temporary**: ~$30-35/month (normal)
- **If persistent**: Need to implement bot detection (~$25-30/month)

## Next Steps
1. ✅ Disable image optimization (DONE)
2. ⏳ Monitor ISR writes for 3-5 days
3. ⏳ Check Vercel Analytics for patterns
4. ⏳ If still high after 1 week → Implement bot detection
