# Destinations with Images Ready (28 total)

These 28 destinations have images available and should be **prioritized** for addition. Images will be used for:
- ✅ OG Image (Open Graph/Twitter cards for SEO)
- ✅ Category Guide Hero Images (all 6 guides per destination)
- ✅ Destination Page Hero Section

---

## 📸 Complete List with Image URLs

### USA - Major Cities (10)
1. **Boston, Massachusetts**  
   `https://ouqeoizufbofdqbuiwvx.supabase.co/storage/v1/object/public/new%20destinations/Boston.png`

2. **Philadelphia, Pennsylvania**  
   `https://ouqeoizufbofdqbuiwvx.supabase.co/storage/v1/object/public/new%20destinations/Philadelphia.png`

3. **Seattle, Washington**  
   `https://ouqeoizufbofdqbuiwvx.supabase.co/storage/v1/object/public/new%20destinations/seattle.png`

4. **Portland, Oregon**  
   `https://ouqeoizufbofdqbuiwvx.supabase.co/storage/v1/object/public/new%20destinations/Portland.png`

5. **San Diego, California**  
   `https://ouqeoizufbofdqbuiwvx.supabase.co/storage/v1/object/public/new%20destinations/san%20diego.png`

6. **Austin, Texas**  
   `https://ouqeoizufbofdqbuiwvx.supabase.co/storage/v1/object/public/new%20destinations/Austin.png`

7. **Dallas, Texas**  
   `https://ouqeoizufbofdqbuiwvx.supabase.co/storage/v1/object/public/new%20destinations/Dallas.png`

8. **Houston, Texas**  
   `https://ouqeoizufbofdqbuiwvx.supabase.co/storage/v1/object/public/new%20destinations/Houston.png`

9. **San Antonio, Texas**  
   `https://ouqeoizufbofdqbuiwvx.supabase.co/storage/v1/object/public/new%20destinations/San%20Antonio.png`

10. **Columbus, Ohio**  
    `https://ouqeoizufbofdqbuiwvx.supabase.co/storage/v1/object/public/new%20destinations/Columbus.png`

11. **Minneapolis, Minnesota**  
    `https://ouqeoizufbofdqbuiwvx.supabase.co/storage/v1/object/public/new%20destinations/Minneapolis.png`

12. **St. Louis, Missouri**  
    `https://ouqeoizufbofdqbuiwvx.supabase.co/storage/v1/object/public/new%20destinations/St.%20Louis.png`

### USA - Beach/Coastal (4)
13. **Key West, Florida**  
    `https://ouqeoizufbofdqbuiwvx.supabase.co/storage/v1/object/public/new%20destinations/Key%20West.png`

14. **Savannah, Georgia**  
    `https://ouqeoizufbofdqbuiwvx.supabase.co/storage/v1/object/public/new%20destinations/Savannah.png`

15. **Charleston, South Carolina**  
    `https://ouqeoizufbofdqbuiwvx.supabase.co/storage/v1/object/public/new%20destinations/Charleston.png`

16. **Providence, Rhode Island**  
    `https://ouqeoizufbofdqbuiwvx.supabase.co/storage/v1/object/public/new%20destinations/Providence.png`

### USA - Mountain/Ski (5)
17. **Aspen, Colorado**  
    `https://ouqeoizufbofdqbuiwvx.supabase.co/storage/v1/object/public/new%20destinations/Aspen.png`

18. **Vail, Colorado**  
    `https://ouqeoizufbofdqbuiwvx.supabase.co/storage/v1/object/public/new%20destinations/Vail.png`

19. **Park City, Utah**  
    `https://ouqeoizufbofdqbuiwvx.supabase.co/storage/v1/object/public/new%20destinations/Park%20City.png`

20. **Breckenridge, Colorado**  
    `https://ouqeoizufbofdqbuiwvx.supabase.co/storage/v1/object/public/new%20destinations/Breckenridge.png`

21. **Juneau, Alaska**  
    `https://ouqeoizufbofdqbuiwvx.supabase.co/storage/v1/object/public/new%20destinations/Juneau.png`

### USA - Other (7)
22. **Scottsdale, Arizona** (also for Phoenix)  
    `https://ouqeoizufbofdqbuiwvx.supabase.co/storage/v1/object/public/new%20destinations/Scottsdale.png`

23. **Indianapolis, Indiana**  
    `https://ouqeoizufbofdqbuiwvx.supabase.co/storage/v1/object/public/new%20destinations/Indianapolis.png`

24. **Buffalo, New York**  
    `https://ouqeoizufbofdqbuiwvx.supabase.co/storage/v1/object/public/new%20destinations/Buffalo.png`

25. **Cincinnati, Ohio**  
    `https://ouqeoizufbofdqbuiwvx.supabase.co/storage/v1/object/public/new%20destinations/Cincinnati.png`

26. **Kansas City, Missouri**  
    `https://ouqeoizufbofdqbuiwvx.supabase.co/storage/v1/object/public/new%20destinations/Kansas%20City.png`

27. **Milwaukee, Wisconsin**  
    `https://ouqeoizufbofdqbuiwvx.supabase.co/storage/v1/object/public/new%20destinations/Milwaukee.png`

28. **Anchorage, Alaska**  
    `https://ouqeoizufbofdqbuiwvx.supabase.co/storage/v1/object/public/new%20destinations/Anchorage.png`

---

## 🎯 Implementation Notes

### Image Usage
When adding these destinations to `destinationsData.js`, use the image URL for:
1. **`imageUrl`** property - Used for:
   - Destination page hero section
   - OG image in metadata
   - Default image for category guides (if guide doesn't have specific hero_image)

2. **Category Guide Hero Images** - When generating guides, the image will automatically be used as `hero_image` for all 6 category guides (via the migration script logic that uses `destinationImageMap`)

### Priority
Since these destinations have images ready, they should be:
- ✅ Added to `destinationsData.js` first
- ✅ Included in the "destinations with guides" category (like Utrecht and Rotterdam)
- ✅ Generated content and guides created immediately
- ✅ Restaurant data added

### Next Steps
1. Add these 28 destinations to `destinationsData.js` with their image URLs
2. Generate full content for these destinations
3. Generate 6 category guides per destination (images will be used automatically)
4. Add restaurant data for these destinations

