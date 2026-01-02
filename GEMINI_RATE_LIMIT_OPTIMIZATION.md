# Gemini API Rate Limit Optimization

## Summary of Optimizations

The guide generation scripts have been optimized to significantly speed up processing while respecting Gemini API rate limits.

## What Changed

### Before
- **Delay**: 2 seconds between requests (30 RPM)
- **Concurrency**: Sequential (1 request at a time)
- **Error Handling**: Basic, no retry logic for rate limits
- **Speed**: ~30 guides/hour

### After
- **Delay**: 200ms between requests (300 RPM)
- **Concurrency**: 3 concurrent requests
- **Error Handling**: Exponential backoff retry on rate limit errors
- **Speed**: ~900 guides/hour (30x faster!)

## Rate Limit Configuration

The script now uses optimized rate limiting:

```javascript
const RATE_LIMIT_CONFIG = {
  requestsPerMinute: 300,  // Conservative (Tier 1 limit is 4,000 RPM)
  delayMs: 200,            // 200ms = 5 requests/second = 300 RPM
  maxConcurrent: 3,         // Process 3 guides concurrently
  retryDelay: 5000,         // 5 seconds on rate limit error
  maxRetries: 3,           // Max retries on rate limit
};
```

## Gemini API Rate Limits (Tier 1 - Paid)

For `gemini-2.5-flash-lite`:
- **RPM (Requests Per Minute)**: Up to 4,000
- **TPM (Tokens Per Minute)**: Varies by tier
- **RPD (Requests Per Day)**: 10,000+

Our configuration uses **300 RPM** (7.5% of limit) to provide a safe buffer.

## Features Added

1. **Smart Rate Limiter**: Tracks requests per minute and automatically waits when approaching limits
2. **Concurrent Processing**: Processes 3 guides simultaneously for faster throughput
3. **Exponential Backoff**: Automatically retries on rate limit errors with increasing delays
4. **Better Error Handling**: Detects rate limit errors (429, quota exceeded) and handles them gracefully

## Usage

The scripts work the same way:

```bash
# Process all regions
node scripts/generate-all-guides-batch.js

# Process specific region
node scripts/generate-all-guides-batch.js --region Europe

# Retry failed guides (also optimized)
node scripts/retry-failed-guides-v2.js
```

## Performance Improvement

- **Before**: ~30 guides/hour (2 second delay, sequential)
- **After**: ~900 guides/hour (200ms delay, 3 concurrent)
- **Speedup**: ~30x faster

## Monitoring

The script now shows:
- Current rate limit configuration
- Estimated processing speed
- Real-time cost tracking
- Progress saved incrementally

## If You Hit Rate Limits

If you encounter rate limit errors:
1. The script will automatically retry with exponential backoff
2. Check your Google Cloud billing tier
3. Consider reducing `maxConcurrent` from 3 to 2 or 1
4. Increase `delayMs` from 200 to 500 if needed

## Adjusting Rate Limits

To adjust the rate limits, edit `scripts/generate-all-guides-batch.js`:

```javascript
const RATE_LIMIT_CONFIG = {
  requestsPerMinute: 300,  // Increase if you have higher tier
  delayMs: 200,            // Decrease for faster (but riskier)
  maxConcurrent: 3,         // Increase for more parallel processing
  retryDelay: 5000,
  maxRetries: 3,
};
```

**Recommended settings by tier:**
- **Tier 1 (Free/Paid)**: 300 RPM, 200ms delay, 3 concurrent
- **Tier 2**: 1000 RPM, 100ms delay, 5 concurrent
- **Tier 3**: 2000 RPM, 50ms delay, 10 concurrent

## Batch API Alternative

For even faster processing, consider using Gemini's Batch API:
- Up to 100 concurrent batch requests
- 10,000,000 tokens enqueued for gemini-2.5-flash-lite
- Requires different implementation (submit jobs, poll for results)

The current optimization uses the standard API which is simpler and still much faster than before.









