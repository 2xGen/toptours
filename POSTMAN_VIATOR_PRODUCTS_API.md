# Postman Guide: Testing Viator Products API

## Purpose
Test the Viator Products API to verify destination IDs returned in the response. This helps ensure we're correctly extracting and using destination data.

## Endpoint Details

### Get Product Details
**Method:** `GET`  
**URL:** `https://api.viator.com/partner/products/{product-code}`

### Base URL
- **Production:** `https://api.viator.com/partner/products/`
- **Sandbox:** `https://api.sandbox.viator.com/partner/products/`

## Required Headers

```
exp-api-key: YOUR_VIATOR_API_KEY
Accept: application/json;version=2.0
Accept-Language: en-US
Content-Type: application/json
```

## Query Parameters

- `currency` (optional): Currency code (e.g., `USD`, `EUR`)
  - Example: `?currency=USD`

## Test Cases

### Test Case 1: Nusa Penida Tour (Known Issue)
**Product Code:** `144258P1`  
**Expected Destination ID:** `60448` (Nusa Penida)  
**Full URL:** `https://api.viator.com/partner/products/144258P1?currency=USD`

**What to Check:**
1. Look for `destinations` array in the response
2. Find the destination with `id: "60448"` or `ref: "60448"`
3. Verify the `destinationName` or `name` field
4. Check if `primary: true` is set correctly
5. Note all destination IDs in the array

### Test Case 2: Bali Tour
**Product Code:** `110505P1`  
**Expected Destination IDs:** `34198` (Seminyak), `5467` (Bali)  
**Full URL:** `https://api.viator.com/partner/products/110505P1?currency=USD`

### Test Case 3: Aruba Tour
**Product Code:** `119085P5`  
**Full URL:** `https://api.viator.com/partner/products/119085P5?currency=USD`

## Postman Setup

### Step 1: Create New Request
1. Open Postman
2. Click "New" → "HTTP Request"
3. Set method to `GET`

### Step 2: Enter URL
```
https://api.viator.com/partner/products/144258P1?currency=USD
```

### Step 3: Add Headers
Go to "Headers" tab and add:

| Key | Value |
|-----|-------|
| `exp-api-key` | `282a363f-5d60-456a-a6a0-774ec4832b07` (or your actual key) |
| `Accept` | `application/json;version=2.0` |
| `Accept-Language` | `en-US` |
| `Content-Type` | `application/json` |

### Step 4: Send Request
Click "Send" and examine the response.

## Response Structure to Examine

### Key Fields to Check:

1. **`destinations` Array:**
   ```json
   {
     "destinations": [
       {
         "ref": "60448",
         "destinationId": "60448",
         "id": "60448",
         "destinationName": "Nusa Penida",
         "name": "Nusa Penida",
         "primary": true
       }
     ]
   }
   ```

2. **Look for:**
   - `ref` - Destination reference ID
   - `destinationId` - Destination ID
   - `id` - Destination ID (alternative field)
   - `destinationName` - Destination name
   - `name` - Destination name (alternative field)
   - `primary` - Boolean indicating if this is the primary destination

## Validation Checklist

For each test case, verify:

- [ ] Response status is `200 OK`
- [ ] `destinations` array exists and is not empty
- [ ] Destination IDs match expected values
- [ ] Primary destination is correctly marked (`primary: true`)
- [ ] Destination names match expected locations
- [ ] All destination IDs are valid (check against our database)

## Common Issues to Watch For

1. **Multiple Destinations:** Some tours have multiple destinations. Check which one is marked `primary: true`
2. **ID Format:** IDs might be strings or numbers - check both formats
3. **Missing Fields:** Some fields might be missing - check all possible field names
4. **Wrong Destination:** If the API returns wrong destination, this is a Viator API issue, not our code

## Expected Response Structure

```json
{
  "productCode": "144258P1",
  "title": "Nusa Penida Two Dives Trip for Certified Divers",
  "destinations": [
    {
      "ref": "60448",
      "destinationId": "60448",
      "destinationName": "Nusa Penida",
      "primary": true
    }
  ],
  // ... other fields
}
```

## Postman Collection JSON

You can import this into Postman:

```json
{
  "info": {
    "name": "Viator Products API - Destination Testing",
    "schema": "https://schema.getpostman.com/json/collection/v2.1.0/collection.json"
  },
  "item": [
    {
      "name": "Get Product - Nusa Penida Tour",
      "request": {
        "method": "GET",
        "header": [
          {
            "key": "exp-api-key",
            "value": "282a363f-5d60-456a-a6a0-774ec4832b07",
            "type": "text"
          },
          {
            "key": "Accept",
            "value": "application/json;version=2.0",
            "type": "text"
          },
          {
            "key": "Accept-Language",
            "value": "en-US",
            "type": "text"
          },
          {
            "key": "Content-Type",
            "value": "application/json",
            "type": "text"
          }
        ],
        "url": {
          "raw": "https://api.viator.com/partner/products/144258P1?currency=USD",
          "protocol": "https",
          "host": ["api", "viator", "com"],
          "path": ["partner", "products", "144258P1"],
          "query": [
            {
              "key": "currency",
              "value": "USD"
            }
          ]
        }
      }
    },
    {
      "name": "Get Product - Bali Tour",
      "request": {
        "method": "GET",
        "header": [
          {
            "key": "exp-api-key",
            "value": "282a363f-5d60-456a-a6a0-774ec4832b07",
            "type": "text"
          },
          {
            "key": "Accept",
            "value": "application/json;version=2.0",
            "type": "text"
          },
          {
            "key": "Accept-Language",
            "value": "en-US",
            "type": "text"
          },
          {
            "key": "Content-Type",
            "value": "application/json",
            "type": "text"
          }
        ],
        "url": {
          "raw": "https://api.viator.com/partner/products/110505P1?currency=USD",
          "protocol": "https",
          "host": ["api", "viator", "com"],
          "path": ["partner", "products", "110505P1"],
          "query": [
            {
              "key": "currency",
              "value": "USD"
            }
          ]
        }
      }
    }
  ]
}
```

## Next Steps After Testing

1. **Document Findings:** Note any discrepancies between expected and actual destination IDs
2. **Compare with Database:** Verify the destination IDs exist in our `viator_destinations` table
3. **Check Our Code:** If API returns correct IDs but our page shows wrong destination, the issue is in our lookup logic
4. **Report Issues:** If Viator API returns wrong destination IDs, report to Viator support

## Important Notes

⚠️ **API Key Security:** Never commit your actual API key to git. Use environment variables in production.

⚠️ **Rate Limits:** Be mindful of Viator API rate limits when testing.

⚠️ **Data Accuracy:** If the API consistently returns wrong destination IDs, this is a Viator data quality issue that needs to be reported.

