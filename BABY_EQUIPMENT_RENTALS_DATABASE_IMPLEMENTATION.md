# Baby Equipment Rentals - Database Implementation

## Overview
This implementation uses a **database-driven approach** (like restaurants) where each destination has unique content stored in Supabase. This scales for 2000+ destinations.

## Database Schema
**Table:** `baby_equipment_rentals`
- `destination_id` (unique) - e.g., 'aruba', 'curacao'
- `hero_title`, `hero_description`, `hero_tagline` - Custom hero content
- `product_categories` (JSONB) - Available categories per destination (e.g., Prague won't have "Beach & Outdoor")
- `faqs` (JSONB) - Destination-specific FAQs
- `pricing_info` (JSONB) - Pricing ranges, currency
- `seo_title`, `seo_description`, `seo_keywords` - Custom SEO

## How It Works

1. **Create Database Table**: Run `scripts/supabase-create-baby-equipment-rentals-table.sql`

2. **Seed Destination Data**: Use `scripts/seed-baby-equipment-rentals-curacao.js` as a template
   - Extract unique content from BabyQuip pages
   - Include only relevant product categories (e.g., Prague = no beach gear)
   - Add destination-specific FAQs
   - Set pricing info

3. **Page Generation**: 
   - Page checks database first: `getBabyEquipmentRentalsByDestination(id)`
   - If no page data exists → returns 404 (not found)
   - If page data exists → renders with unique content from database

4. **Template Updates**: When you update the template (BabyEquipmentClient.jsx), changes apply to ALL destinations automatically (like restaurants)

## Next Steps

1. ✅ Database schema created
2. ✅ Library functions created (`src/lib/babyEquipmentRentals.js`)
3. ✅ Seed script template created (Curacao)
4. ⏳ Update page.js (in progress - uses database instead of whitelist)
5. ⏳ Update BabyEquipmentClient.jsx to use pageData
6. ⏳ Update DestinationDetailClient.jsx to check database
7. ⏳ Run seed script for Curacao
8. ⏳ Create more seed scripts per destination as you get content

## Benefits

- **Scalable**: Easy to add 2000 destinations
- **Unique Content**: Each destination has custom content (categories, FAQs, hero)
- **Template Updates**: Update template once, affects all destinations
- **Easy Maintenance**: Update content via database, no code changes
- **SEO Optimized**: Custom SEO per destination
