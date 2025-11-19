# Gamified Promotion System - Phase 1 Setup Guide

## Overview

The gamified promotion system allows users to spend daily points to promote tours, creating a competitive leaderboard. This is Phase 1 (MVP) with future enhancements planned.

## Database Setup

### 1. Run SQL Script

Execute the SQL script in Supabase SQL Editor:

```sql
-- File: scripts/supabase-create-promotion-system.sql
```

This creates:
- `promotion_accounts` - User accounts with daily points
- `tour_promotions` - Tour scores (all time, monthly, weekly, past 28 days)
- `promotion_transactions` - Audit trail of all point spending
- `monthly_winners` - Historical monthly winners
- Indexes for performance
- RLS policies for security

### 2. Verify Tables

Check that all tables were created:
```sql
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name LIKE 'promotion%';
```

## Features Implemented (Phase 1)

### ✅ Daily Point System
- **Explorer (Free)**: 50 points/day
- **Pro Booster (Paid)**: 200 points/day (future)
- Points reset every 24 hours
- "Use it or lose it" mechanic

### ✅ Point Spending
- Users can spend points on any tour
- Points add to tour's Total Score
- Real-time score updates
- Transaction logging

### ✅ Leaderboard (`/toptours`)
- Sorted by Total Score (default)
- Filter by time period:
  - All Time
  - This Month
  - This Week
  - Past 28 Days
- Filter by region (future)
- Top 50 tours per page

### ✅ Tour Card Integration
- Promotion score displayed on tour cards
- Shows trophy icon + score
- Only displays if score > 0

## API Endpoints

### `GET /api/internal/promotion/account`
Get user's promotion account (points available, tier, etc.)

**Auth**: Required (Bearer token)

**Response**:
```json
{
  "user_id": "uuid",
  "tier": "explorer",
  "daily_points_available": 50,
  "last_daily_reset": "2024-01-01T00:00:00Z",
  "total_points_spent_all_time": 150
}
```

### `POST /api/internal/promotion/spend`
Spend points on a tour

**Auth**: Required (Bearer token)

**Body**:
```json
{
  "productId": "324189P1",
  "points": 25,
  "scoreType": "all"
}
```

**Response**:
```json
{
  "success": true,
  "remainingPoints": 25
}
```

### `GET /api/internal/promotion/leaderboard`
Get leaderboard tours

**Query Params**:
- `scoreType`: 'all' | 'monthly' | 'weekly' | 'past_28_days'
- `region`: optional region filter
- `limit`: number of results (default: 100)
- `offset`: pagination offset (default: 0)

**Response**:
```json
{
  "tours": [...],
  "count": 50
}
```

### `GET /api/internal/promotion/tour-score`
Get promotion score for a specific tour

**Query Params**:
- `productId`: Tour product ID

**Response**:
```json
{
  "product_id": "324189P1",
  "total_score": 1250,
  "monthly_score": 450,
  "weekly_score": 120,
  "past_28_days_score": 800
}
```

## Frontend Components

### `usePromotion()` Hook
React hook for managing promotion state:

```jsx
const { account, loading, spendPoints, refreshAccount } = usePromotion();
```

### `<TourPromotionScore />`
Displays tour score on cards (lightweight, cached)

### `<TourPromotionCard />`
Full promotion UI with spending capability (for detail pages)

### `/toptours` Page
Leaderboard page with filters and rankings

## Daily Reset Logic

Points automatically reset when:
1. User's `last_daily_reset` is > 24 hours old
2. User loads their account (via `getPromotionAccount()`)

The reset happens automatically - no cron job needed for Phase 1.

## Future Enhancements (Not in Phase 1)

- [ ] A La Carte packages (24h, 7d, 14d, 30d)
- [ ] Payment integration (Stripe)
- [ ] Pro Booster subscription ($3.99/mo)
- [ ] Regional filtering on leaderboard
- [ ] Monthly winners tracking
- [ ] Personalized messages for a la carte
- [ ] Anti-gaming measures (email verification, rate limiting)

## Testing

1. **Create test account**: Sign up at `/auth`
2. **Check points**: Should have 50 points available
3. **Spend points**: Go to any tour listing, spend points
4. **Check leaderboard**: Visit `/toptours` to see rankings
5. **Verify reset**: Wait 24 hours or manually update `last_daily_reset` in database

## Monitoring

Check promotion activity:
```sql
-- Most promoted tours
SELECT product_id, total_score, monthly_score 
FROM tour_promotions 
ORDER BY total_score DESC 
LIMIT 10;

-- Recent transactions
SELECT * FROM promotion_transactions 
ORDER BY created_at DESC 
LIMIT 20;

-- User activity
SELECT user_id, tier, daily_points_available, total_points_spent_all_time
FROM promotion_accounts
ORDER BY total_points_spent_all_time DESC;
```

## Troubleshooting

**Points not resetting?**
- Check `last_daily_reset` timestamp in database
- Verify `getPromotionAccount()` is being called

**Scores not updating?**
- Check `promotion_transactions` table for errors
- Verify RLS policies allow inserts

**Leaderboard empty?**
- Check if tours have scores > 0
- Verify indexes are created
- Check API cache headers

