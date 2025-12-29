# Postman Endpoints for Testing AI Chat vs Guide Page

## 1. AI Chat Search Endpoint

**Endpoint:** `POST /api/ai-chat/search`

**Headers:**
```
Content-Type: application/json
```

**Body (for Bonaire Adventure Tours):**
```json
{
  "intent": "tours",
  "destination": "Bonaire",
  "filters": {
    "activityType": "Bonaire Adventure Tours"
  }
}
```

**Full URL:** `http://localhost:3001/api/ai-chat/search`

---

## 2. AI Chat Categories Endpoint (to get available categories)

**Endpoint:** `GET /api/ai-chat/categories?destination=bonaire`

**Full URL:** `http://localhost:3001/api/ai-chat/categories?destination=bonaire`

---

## 3. AI Chat Destination Lookup Endpoint

**Endpoint:** `GET /api/ai-chat/destination-lookup?destination=Bonaire`

**Full URL:** `http://localhost:3001/api/ai-chat/destination-lookup?destination=Bonaire`

---

## 4. Direct Viator API Endpoint (EXACT SAME AS GUIDE PAGE)

**Endpoint:** `POST https://api.viator.com/partner/search/freetext`

### Headers (in Postman):
```
exp-api-key: YOUR_VIATOR_API_KEY
Accept: application/json;version=2.0
Accept-Language: en-US
Content-Type: application/json
```

### Request Body for "Luxury Puerto Banús Experiences" in Marbella (EXACT GUIDE PAGE CALL):

**Raw JSON:**
```json
{
  "searchTerm": "luxury puerto banus",
  "searchTypes": [
    {
      "searchType": "PRODUCTS",
      "pagination": {
        "start": 1,
        "count": 15
      }
    }
  ],
  "productFiltering": {
    "destination": "22304"
  },
  "currency": "USD"
}
```

**How the search term is built:**
1. Category name from database: "Luxury Puerto Banús Experiences"
2. Remove destination prefix "Marbella" → "Luxury Puerto Banús Experiences"
3. Remove suffix "Experiences" → "Luxury Puerto Banús"
4. Normalize "Banús" → "banus" (remove special characters)
5. Lowercase → "luxury puerto banus"

**Key points:**
- `searchTerm`: "luxury puerto banus" (NOT "puerto banus" alone)
- `destination`: "22304" (Marbella's Viator destination ID)
- `count`: 15 (matches guide page maxTours = 15)

### Postman Setup Steps:

1. **Method:** POST
2. **URL:** `https://api.viator.com/partner/search/freetext`
3. **Headers Tab:**
   - `exp-api-key`: `YOUR_VIATOR_API_KEY` (replace with your actual key)
   - `Accept`: `application/json;version=2.0`
   - `Accept-Language`: `en-US`
   - `Content-Type`: `application/json`
4. **Body Tab:**
   - Select: **raw**
   - Select: **JSON** (from dropdown)
   - Paste the JSON above
5. **Click Send**

### For Other Destinations:

**Curaçao Catamaran Cruises:**
```json
{
  "searchTerm": "catamaran cruises",
  "searchTypes": [
    {
      "searchType": "PRODUCTS",
      "pagination": {
        "start": 1,
        "count": 8
      }
    }
  ],
  "productFiltering": {
    "destination": "77"
  },
  "currency": "USD"
}
```

**Aruba ATV Tours:**
```json
{
  "searchTerm": "atv tours",
  "searchTypes": [
    {
      "searchType": "PRODUCTS",
      "pagination": {
        "start": 1,
        "count": 8
      }
    }
  ],
  "productFiltering": {
    "destination": "4308"
  },
  "currency": "USD"
}
```

**Marbella - Luxury Puerto Banús Experiences (GUIDE PAGE USES FALLBACK):**

**First Call (with destination filter - returns 0):**
```json
{
  "searchTerm": "luxury puerto banus",
  "searchTypes": [
    {
      "searchType": "PRODUCTS",
      "pagination": {
        "start": 1,
        "count": 15
      }
    }
  ],
  "productFiltering": {
    "destination": "22304"
  },
  "currency": "USD"
}
```
**Result:** Returns 0 products (that's why you got 0 in Postman!)

**Fallback Call (without destination filter - returns 15):**
```json
{
  "searchTerm": "Marbella luxury puerto banus",
  "searchTypes": [
    {
      "searchType": "PRODUCTS",
      "pagination": {
        "start": 1,
        "count": 15
      }
    }
  ],
  "currency": "USD"
}
```
**Result:** Returns 15 products (this is what the guide page actually shows!)

**Why the guide page shows 15 results:**
1. First call with destination filter returns 0
2. Guide page automatically tries fallback: `"Marbella luxury puerto banus"` WITHOUT destination filter
3. Fallback returns 15 results
4. Guide page displays the 15 results from the fallback call

**To replicate in Postman:** Use the **fallback call** (second one above) - that's what actually returns results!

**Note:** 
- Destination ID "4308" is for Bonaire (from database)
- Destination ID "77" is for Curaçao (from your example)
- Destination ID "28" is for Aruba
- Destination ID "22304" is for Marbella (from hardcoded map)
- You need to find the correct Viator destination ID first using endpoint #5 below

---

## 5. Viator Destination Lookup (to find destination ID)

**Endpoint:** `GET https://api.viator.com/partner/destinations/search?searchTerm=Bonaire`

### Postman Setup:

1. **Method:** GET
2. **URL:** `https://api.viator.com/partner/destinations/search?searchTerm=Bonaire`
3. **Headers Tab:**
   - `exp-api-key`: `YOUR_VIATOR_API_KEY`
   - `Accept`: `application/json;version=2.0`
   - `Accept-Language`: `en-US`
4. **Click Send**

**Response will contain:**
```json
{
  "destinations": [
    {
      "destinationId": "4308",  // <-- This is what you need! (Bonaire)
      "destinationName": "Bonaire",
      ...
    }
  ]
}
```

**Use the `destinationId` value in the `productFiltering.destination` field of endpoint #4.**

---

## 6. Guide Page (Server Component - Not an API)

The guide page at `/destinations/bonaire/guides/adventure-tours` is a **server component**, not an API endpoint. It runs server-side and:
1. Gets `destinationId = "bonaire"` from URL params
2. Uses `slugToViatorId['bonaire']` to get Viator destination ID
3. Calls Viator API with the same payload as shown in endpoint #4

---

## Testing Steps

### Step 1: Find Bonaire's Viator Destination ID

**GET** `http://localhost:3001/api/ai-chat/destination-lookup?destination=Bonaire`

This should return:
```json
{
  "destination": {
    "id": "4308",  // This is the Viator destination ID (Bonaire)
    "name": "Bonaire",
    "slug": "bonaire"
  }
}
```

### Step 2: Test AI Chat Search

**POST** `http://localhost:3001/api/ai-chat/search`

**Body:**
```json
{
  "intent": "tours",
  "destination": "Bonaire",
  "filters": {
    "activityType": "Bonaire Adventure Tours"
  }
}
```

**Expected Response:**
- Should return 8 tours (same as guide page)
- Check the `viatorDestinationId` in the logs - should be "4308"

### Step 3: Test Direct Viator API (Same as Guide Page)

**POST** `https://api.viator.com/partner/search/freetext`

**Body:**
```json
{
  "searchTerm": "adventure tours",
  "searchTypes": [
    {
      "searchType": "PRODUCTS",
      "pagination": {
        "start": 1,
        "count": 8
      }
    }
  ],
  "productFiltering": {
    "destination": "4308"
  },
  "currency": "USD"
}
```

**Expected Response:**
- Should return 8+ tours for Bonaire

---

## Debugging: Check What's Different

### Check 1: Destination ID Lookup
Compare the `viatorDestinationId` returned by:
- AI Chat: `GET /api/ai-chat/destination-lookup?destination=Bonaire`
- Guide Page: Check server logs when visiting `/destinations/bonaire/guides/adventure-tours`

They should both return `"4308"` for Bonaire.

### Check 2: Search Term
Compare the `searchTerm`:
- Guide Page: `"adventure tours"` (removes "Bonaire" prefix)
- AI Chat: Should also be `"adventure tours"` (removes "Bonaire" prefix)

### Check 3: API Payload
Compare the exact payload sent to Viator:
- Both should have `productFiltering.destination = "4308"`
- Both should have `searchTerm = "adventure tours"`
- Both should have `count = 8`

---

## Common Issues

1. **Wrong Destination ID**: If AI chat returns 0 tours but guide page returns 8, check if `viatorDestinationId` is correct
2. **Search Term Issue**: If search term includes "Bonaire" prefix, it won't match properly
3. **Missing Destination Filter**: If `productFiltering.destination` is missing, you'll get tours from all destinations

---

## Debugging: Why Guide Page Works But AI Chat Doesn't

### Key Difference:

**Guide Page:**
- Gets `destinationId = "bonaire"` directly from URL params
- Uses: `slugToViatorId[destinationId] || destination.destinationId || null`
- If Bonaire is NOT in `slugToViatorId`, it uses `destination.destinationId` from the destination object

**AI Chat:**
- Gets `destination = "Bonaire"` (name, not slug)
- Normalizes to `"bonaire"` slug
- Uses: `slugToViatorId[destinationSlug] || destinationData?.destinationId || null`
- Then falls back to database lookup by name

### The Problem:
If Bonaire is not in the hardcoded `slugToViatorId` map, the guide page gets `destination.destinationId` from the destination object (which comes from `getDestinationFullContent` or database). But the AI chat might not be getting the same `destination.destinationId` value.

### Solution:
Check what `destination.destinationId` is for Bonaire in the guide page vs what the AI chat gets from the database lookup.

### Test This:
1. Check server logs when visiting `/destinations/bonaire/guides/adventure-tours` - note the `viatorDestinationId` value
2. Check server logs when calling `/api/ai-chat/search` with `destination: "Bonaire"` - compare the `viatorDestinationId` value
3. They should be the SAME number (e.g., "4308" for Bonaire)

