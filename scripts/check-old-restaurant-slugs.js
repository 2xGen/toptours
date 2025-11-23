import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({ path: join(__dirname, '../.env.local') });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// Name matching function (copied from restaurants.js logic)
async function findRestaurantByName(destinationId, searchName) {
  // Normalize search name
  const normalize = (str) => {
    return str
      .toLowerCase()
      .trim()
      .replace(/\s+/g, ' ')
      .replace(/\s+aruba$/i, '')
      .replace(/\s+curacao$/i, '')
      .replace(/\s+jamaica$/i, '')
      .replace(/\s+punta-cana$/i, '')
      .replace(/\s+nassau$/i, '')
      .replace(/\s+restaurant$/i, '');
  };

  const normalizedSearch = normalize(searchName);
  
  // Get all restaurants for this destination
  const allRestaurants = [];
  const pageSize = 1000;
  let from = 0;
  let hasMore = true;

  while (hasMore) {
    const { data, error } = await supabase
      .from('restaurants')
      .select('id, name, slug, destination_id')
      .eq('destination_id', destinationId)
      .eq('is_active', true)
      .range(from, from + pageSize - 1);

    if (error) {
      console.error('Error fetching restaurants:', error);
      break;
    }

    if (data && data.length > 0) {
      allRestaurants.push(...data);
    }

    hasMore = data && data.length === pageSize;
    from += pageSize;
  }
  
  // Try to find by name matching
  for (const restaurant of allRestaurants) {
    const restaurantName = restaurant.name || '';
    const normalizedRestaurant = normalize(restaurantName);
    
    // Exact match after normalization
    if (normalizedRestaurant === normalizedSearch) {
      return {
        id: restaurant.id,
        name: restaurant.name,
        slug: restaurant.slug,
      };
    }
    
    // Check if search name contains restaurant name or vice versa
    if (normalizedSearch.includes(normalizedRestaurant) || normalizedRestaurant.includes(normalizedSearch)) {
      const minLength = Math.min(normalizedSearch.length, normalizedRestaurant.length);
      if (minLength >= 5) {
        return {
          id: restaurant.id,
          name: restaurant.name,
          slug: restaurant.slug,
        };
      }
    }
  }
  
  return null;
}

const OLD_RESTAURANT_REDIRECTS = {
  'aruba': {
    'atardi-beach-restaurant-aruba': 'Atardi Beach Restaurant',
    'passions-on-the-beach-aruba': 'Passions On The Beach',
    'flying-fishbone-aruba': 'Flying Fishbone',
    'zeerovers-aruba': 'Zeerover',
    'giannis-restaurant-aruba': 'Giannis Restaurant',
    'wacky-wahoos-seafood-aruba': 'Wacky Wahoo\'s Seafood',
  },
  'curacao': {
    'kome-restaurant-curacao': 'Kome Restaurant',
    'brisa-do-mar-curacao': 'Brisa Do Mar',
    'de-visserij-piscadera-curacao': 'De Visserij Piscadera',
    'la-boheme-curacao': 'La Boheme',
    'gouverneur-de-rouville-curacao': 'Gouverneur De Rouville',
    'zanzibar-beach-restaurant-curacao': 'Zanzibar Beach Restaurant',
  },
  'jamaica': {
    'rockhouse-restaurant-negril': 'Rockhouse Restaurant',
    'broken-plate-restaurant-kingston': 'Broken Plate Restaurant',
    'devon-house-bakery-kingston': 'Devon House Bakery',
    'south-avenue-grill-kingston': 'South Avenue Grill',
    'miss-ts-kitchen-ocho-rios': 'Miss T\'s Kitchen',
    'little-ochie-alligator-pond': 'Little Ochie',
  },
  'punta-cana': {
    'playa-blanca-restaurant-punta-cana': 'Playa Blanca Restaurant',
    'sbg-punta-cana': 'SBG',
    'jellyfish-restaurant-punta-cana': 'Jellyfish Restaurant',
    'la-bruja-chupadora-bbq-punta-cana': 'La Bruja Chupadora BBQ',
    'pearl-beach-club-punta-cana': 'Pearl Beach Club',
    'capitan-cook-restaurant-punta-cana': 'Capitan Cook Restaurant',
  },
  'nassau': {
    'the-new-duff-nassau': 'The New Duff',
    'green-parrot-harbour-front-nassau': 'Green Parrot Harbour Front',
    'twin-brothers-nassau': 'Twin Brothers',
    'goldies-conch-house-nassau': 'Goldies Conch House',
    'poop-deck-nassau': 'Poop Deck',
    'acropolis-cafe-bakery-nassau': 'Acropolis Cafe Bakery',
  },
};

async function checkOldSlugs() {
  console.log('\n🔍 Checking old restaurant slugs with smart redirect logic...\n');

  const results = {
    exactMatch: [],      // Exact slug match - works normally
    nameMatch: [],       // Found by name - redirects to new slug
    notFound: [],        // Not found - redirects to hub
  };

  for (const [destinationId, oldRestaurants] of Object.entries(OLD_RESTAURANT_REDIRECTS)) {
    console.log(`\n📍 ${destinationId.toUpperCase()}:`);
    
    for (const [oldSlug, expectedName] of Object.entries(oldRestaurants)) {
      // First check exact slug match
      const { data: exactMatch, error: exactError } = await supabase
        .from('restaurants')
        .select('id, name, slug, destination_id')
        .eq('slug', oldSlug)
        .eq('destination_id', destinationId)
        .limit(1);

      if (exactError && exactError.code !== 'PGRST116') {
        console.error(`   ❌ Error checking ${oldSlug}:`, exactError.message);
        continue;
      }

      if (exactMatch && exactMatch.length > 0) {
        console.log(`   ✓ EXACT MATCH: ${oldSlug} -> "${exactMatch[0].name}" (works normally)`);
        results.exactMatch.push({ destinationId, oldSlug, newSlug: oldSlug, name: exactMatch[0].name });
      } else {
        // Try name matching
        const foundByName = await findRestaurantByName(destinationId, expectedName);
        
        if (foundByName && foundByName.slug) {
          console.log(`   🔄 NAME MATCH: ${oldSlug} -> "${foundByName.name}" -> redirects to ${foundByName.slug}`);
          results.nameMatch.push({ destinationId, oldSlug, newSlug: foundByName.slug, name: foundByName.name });
        } else {
          console.log(`   ✗ NOT FOUND: ${oldSlug} -> redirects to hub`);
          results.notFound.push({ destinationId, oldSlug, expectedName });
        }
      }
    }
  }

  console.log('\n\n📊 SUMMARY:');
  console.log(`   ✅ Exact match (works normally): ${results.exactMatch.length}`);
  console.log(`   🔄 Name match (redirects to new slug): ${results.nameMatch.length}`);
  console.log(`   ✗ Not found (redirects to hub): ${results.notFound.length}`);
  console.log(`   📦 Total checked: ${results.exactMatch.length + results.nameMatch.length + results.notFound.length}`);

  if (results.exactMatch.length > 0) {
    console.log('\n✅ EXACT MATCHES (work normally, no redirect):');
    results.exactMatch.forEach(({ destinationId, oldSlug, name }) => {
      console.log(`   - /destinations/${destinationId}/restaurants/${oldSlug} -> "${name}"`);
    });
  }

  if (results.nameMatch.length > 0) {
    console.log('\n🔄 NAME MATCHES (redirect to correct new slug):');
    results.nameMatch.forEach(({ destinationId, oldSlug, newSlug, name }) => {
      console.log(`   - /destinations/${destinationId}/restaurants/${oldSlug}`);
      console.log(`     → /destinations/${destinationId}/restaurants/${newSlug} ("${name}")`);
    });
  }

  if (results.notFound.length > 0) {
    console.log('\n✗ NOT FOUND (redirect to hub):');
    results.notFound.forEach(({ destinationId, oldSlug }) => {
      console.log(`   - /destinations/${destinationId}/restaurants/${oldSlug}`);
      console.log(`     → /destinations/${destinationId}/restaurants`);
    });
  }

  console.log('\n');
}

checkOldSlugs().catch(console.error);

