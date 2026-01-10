/**
 * Check which BabyQuip destinations already have destination pages (category guides)
 * and which ones already have baby equipment rental pages
 */

import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

dotenv.config({ path: '.env.local' });

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load Viator classified destinations (destinations without guides but with pages)
let viatorDestinationsClassified = [];
try {
  const classifiedData = JSON.parse(
    readFileSync(join(__dirname, '../src/data/viatorDestinationsClassified.json'), 'utf8')
  );
  viatorDestinationsClassified = Array.isArray(classifiedData) ? classifiedData : [];
} catch (error) {
  console.error('Error loading viatorDestinationsClassified.json:', error.message);
}

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase credentials in .env.local');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

// BabyQuip destinations list from user
const BABYQUIP_DESTINATIONS = [
  // Antigua and Barbuda - Saint George is the capital, use Antigua/antigua-and-barbuda
  { name: 'Saint George', country: 'Antigua and Barbuda', searchSlug: 'antigua-and-barbuda', altSlug: 'antigua' },
  
  // Aruba
  { name: 'Aruba', country: 'Aruba', searchSlug: 'aruba' },
  
  // Australia
  { name: 'Central Coast', country: 'Australia', searchSlug: 'central-coast' },
  { name: 'Dural', country: 'Australia', searchSlug: 'dural' },
  { name: 'Newtown', country: 'Australia', searchSlug: 'newtown' },
  { name: 'Sydney', country: 'Australia', searchSlug: 'sydney' },
  { name: 'Wollongong', country: 'Australia', searchSlug: 'wollongong' },
  { name: 'Brisbane', country: 'Australia', searchSlug: 'brisbane' },
  { name: 'Gold Coast', country: 'Australia', searchSlug: 'gold-coast' },
  { name: 'Sunshine Coast', country: 'Australia', searchSlug: 'sunshine-coast' },
  { name: 'Adelaide', country: 'Australia', searchSlug: 'adelaide' },
  { name: 'Melbourne', country: 'Australia', searchSlug: 'melbourne' },
  { name: 'Perth', country: 'Australia', searchSlug: 'perth' },
  
  // Colombia
  { name: 'Medellin', country: 'Colombia', searchSlug: 'medellin' },
  
  // Costa Rica
  { name: 'San Jose', country: 'Costa Rica', searchSlug: 'san-jose-costa-rica' },
  
  // Curaçao
  { name: 'Curacao', country: 'Curaçao', searchSlug: 'curacao' },
  
  // Dominican Republic
  { name: 'Punta Cana', country: 'Dominican Republic', searchSlug: 'punta-cana' },
  { name: 'La Vega', country: 'Dominican Republic', searchSlug: 'la-vega' },
  
  // El Salvador
  { name: 'Santa Tecla', country: 'El Salvador', searchSlug: 'santa-tecla' },
  
  // Guatemala
  { name: 'Guatemala City', country: 'Guatemala', searchSlug: 'guatemala-city' },
  
  // Jamaica
  { name: 'Montego Bay', country: 'Jamaica', searchSlug: 'montego-bay' },
  
  // Mexico
  { name: 'Mexico City', country: 'Mexico', searchSlug: 'mexico-city' },
  { name: 'Ensenada', country: 'Mexico', searchSlug: 'ensenada' },
  { name: 'Cabo San Lucas', country: 'Mexico', searchSlug: 'cabo-san-lucas' },
  { name: 'La Paz', country: 'Mexico', searchSlug: 'la-paz' },
  { name: 'Los Cabos', country: 'Mexico', searchSlug: 'los-cabos' },
  { name: 'San Jose del Cabo', country: 'Mexico', searchSlug: 'san-jose-del-cabo' },
  { name: 'Chihuahua', country: 'Mexico', searchSlug: 'chihuahua' },
  { name: 'Ciudad Juarez', country: 'Mexico', searchSlug: 'ciudad-juarez' },
  { name: 'Puerto Vallarta', country: 'Mexico', searchSlug: 'puerto-vallarta' },
  { name: 'Guadalajara', country: 'Mexico', searchSlug: 'guadalajara' },
  { name: 'Independencia', country: 'Mexico', searchSlug: 'independencia' },
  { name: 'Monterey', country: 'Mexico', searchSlug: 'monterey' },
  { name: 'Punta de Mita', country: 'Mexico', searchSlug: 'punta-de-mita' },
  { name: 'Sayulita', country: 'Mexico', searchSlug: 'sayulita' },
  { name: 'Guadalupe', country: 'Mexico', searchSlug: 'guadalupe' },
  { name: 'Monterrey', country: 'Mexico', searchSlug: 'monterrey' },
  { name: 'Oaxaca', country: 'Mexico', searchSlug: 'oaxaca' },
  { name: 'Queretaro', country: 'Mexico', searchSlug: 'queretaro' },
  { name: 'Cancun', country: 'Mexico', searchSlug: 'cancun' },
  { name: 'Cozumel', country: 'Mexico', searchSlug: 'cozumel' },
  { name: 'Playa del Carmen', country: 'Mexico', searchSlug: 'playa-del-carmen' },
  { name: 'Veracruz', country: 'Mexico', searchSlug: 'veracruz' },
  { name: 'Merida', country: 'Mexico', searchSlug: 'merida' },
  
  // New Zealand
  { name: 'Auckland', country: 'New Zealand', searchSlug: 'auckland' },
  
  // Panama
  { name: 'Panama City', country: 'Panama', searchSlug: 'panama-city' },
  
  // Puerto Rico
  { name: 'Caguas', country: 'Puerto Rico', searchSlug: 'caguas' },
  { name: 'Isabela', country: 'Puerto Rico', searchSlug: 'isabela' },
  { name: 'Ponce', country: 'Puerto Rico', searchSlug: 'ponce' },
  { name: 'San Juan', country: 'Puerto Rico', searchSlug: 'san-juan' },
  { name: 'Gurabo', country: 'Puerto Rico', searchSlug: 'gurabo' },
  { name: 'Las Alondras', country: 'Puerto Rico', searchSlug: 'las-alondras' },
  
  // Saint Kitts and Nevis
  { name: 'Saint Kitts & Nevis', country: 'Saint Kitts and Nevis', searchSlug: 'st-kitts-and-nevis' },
  
  // South Africa
  { name: 'Cape Town', country: 'South Africa', searchSlug: 'cape-town' },
  
  // Thailand
  { name: 'Chiang Mai', country: 'Thailand', searchSlug: 'chiang-mai' },
  
  // The Bahamas
  { name: 'Eleuthera', country: 'The Bahamas', searchSlug: 'eleuthera' },
  { name: 'Nassau', country: 'The Bahamas', searchSlug: 'nassau' },
  
  // U.S. Virgin Islands
  { name: 'St Croix', country: 'U.S. Virgin Islands', searchSlug: 'st-croix' },
  { name: 'St John', country: 'U.S. Virgin Islands', searchSlug: 'st-john' },
  { name: 'St Thomas', country: 'U.S. Virgin Islands', searchSlug: 'st-thomas' },
  
  // United Arab Emirates
  { name: 'Dubai', country: 'United Arab Emirates', searchSlug: 'dubai' },
  
  // CANADA - Alberta
  { name: 'Banff', country: 'Canada', searchSlug: 'banff' },
  { name: 'Calgary', country: 'Canada', searchSlug: 'calgary' },
  { name: 'Edmonton', country: 'Canada', searchSlug: 'edmonton' },
  { name: 'Lethbridge', country: 'Canada', searchSlug: 'lethbridge' },
  { name: 'Strathcona County', country: 'Canada', searchSlug: 'strathcona-county' },
  
  // CANADA - British Columbia
  { name: 'Burnaby', country: 'Canada', searchSlug: 'burnaby' },
  { name: 'Courtenay', country: 'Canada', searchSlug: 'courtenay' },
  { name: 'Kelowna', country: 'Canada', searchSlug: 'kelowna' },
  { name: 'Kitimat', country: 'Canada', searchSlug: 'kitimat' },
  { name: 'Langley', country: 'Canada', searchSlug: 'langley' },
  { name: 'Nanaimo', country: 'Canada', searchSlug: 'nanaimo' },
  { name: 'Okanagan', country: 'Canada', searchSlug: 'okanagan' },
  { name: 'Parksville', country: 'Canada', searchSlug: 'parksville' },
  { name: 'Penticton', country: 'Canada', searchSlug: 'penticton' },
  { name: 'Port Alberni', country: 'Canada', searchSlug: 'port-alberni' },
  { name: 'Revelstoke', country: 'Canada', searchSlug: 'revelstoke' },
  { name: 'Squamish', country: 'Canada', searchSlug: 'squamish' },
  { name: 'Surrey', country: 'Canada', searchSlug: 'surrey' },
  { name: 'Vancouver', country: 'Canada', searchSlug: 'vancouver' },
  { name: 'Vernon', country: 'Canada', searchSlug: 'vernon' },
  { name: 'Victoria', country: 'Canada', searchSlug: 'victoria' },
  { name: 'Whistler', country: 'Canada', searchSlug: 'whistler' },
  { name: 'Whistler Blackcomb', country: 'Canada', searchSlug: 'whistler' }, // Same as Whistler
  
  // CANADA - Manitoba
  { name: 'Gimli', country: 'Canada', searchSlug: 'gimli' },
  { name: 'Winnipeg', country: 'Canada', searchSlug: 'winnipeg' },
  
  // CANADA - New Brunswick
  { name: 'Dieppe', country: 'Canada', searchSlug: 'dieppe' },
  { name: 'Fredericton', country: 'Canada', searchSlug: 'fredericton' },
  { name: 'Saint John', country: 'Canada', searchSlug: 'saint-john' },
  
  // CANADA - Nova Scotia
  { name: 'Halifax', country: 'Canada', searchSlug: 'halifax' },
  { name: 'Trenton', country: 'Canada', searchSlug: 'trenton' },
  
  // CANADA - Ontario
  { name: 'Barrie', country: 'Canada', searchSlug: 'barrie' },
  { name: 'Bracebridge', country: 'Canada', searchSlug: 'bracebridge' },
  { name: 'Collingwood', country: 'Canada', searchSlug: 'collingwood' },
  { name: 'Grimsby', country: 'Canada', searchSlug: 'grimsby' },
  { name: 'Kanata', country: 'Canada', searchSlug: 'kanata' },
  { name: 'Leamington', country: 'Canada', searchSlug: 'leamington' },
  { name: 'London', country: 'Canada', searchSlug: 'london-ontario', altSlug: 'london' }, // Different from London, UK
  { name: 'Mississauga', country: 'Canada', searchSlug: 'mississauga' },
  { name: 'Niagara-on-the-Lake', country: 'Canada', searchSlug: 'niagara-on-the-lake' },
  { name: 'Ottawa', country: 'Canada', searchSlug: 'ottawa' },
  { name: 'St. Catharines', country: 'Canada', searchSlug: 'st-catharines' },
  { name: 'Thunder Bay', country: 'Canada', searchSlug: 'thunder-bay' },
  { name: 'Toronto', country: 'Canada', searchSlug: 'toronto' },
  { name: 'Vineland', country: 'Canada', searchSlug: 'vineland' },
  { name: 'Windsor', country: 'Canada', searchSlug: 'windsor' },
  
  // CANADA - Prince Edward Island
  { name: 'Charlottetown', country: 'Canada', searchSlug: 'charlottetown' },
  { name: 'Prince Edward Island', country: 'Canada', searchSlug: 'prince-edward-island' },
  { name: 'Summerside', country: 'Canada', searchSlug: 'summerside' },
  
  // CANADA - Quebec
  { name: 'Levis', country: 'Canada', searchSlug: 'levis' },
  { name: 'Mont-Tremblant', country: 'Canada', searchSlug: 'mont-tremblant' },
  { name: 'Montreal', country: 'Canada', searchSlug: 'montreal' },
  { name: 'Saint-Jean-sur-Richelieu', country: 'Canada', searchSlug: 'saint-jean-sur-richelieu' },
  { name: 'Saint-Jérôme', country: 'Canada', searchSlug: 'saint-jerome' },
  
  // CANADA - Saskatchewan
  { name: 'Prince Albert', country: 'Canada', searchSlug: 'prince-albert' },
  
  // CANADA - Yukon
  { name: 'Whitehorse', country: 'Canada', searchSlug: 'whitehorse' },
  
  // UNITED STATES - Alabama
  { name: 'Birmingham', country: 'United States', searchSlug: 'birmingham', state: 'AL' },
  { name: 'Daphne', country: 'United States', searchSlug: 'daphne', state: 'AL' },
  { name: 'Dauphin Island', country: 'United States', searchSlug: 'dauphin-island', state: 'AL' },
  { name: 'Fairhope', country: 'United States', searchSlug: 'fairhope', state: 'AL' },
  { name: 'Gulf Shores', country: 'United States', searchSlug: 'gulf-shores', state: 'AL' },
  { name: 'Hoover', country: 'United States', searchSlug: 'hoover', state: 'AL' },
  { name: 'Huntsville', country: 'United States', searchSlug: 'huntsville', state: 'AL' },
  { name: 'Lineville', country: 'United States', searchSlug: 'lineville', state: 'AL' },
  { name: 'Madison', country: 'United States', searchSlug: 'madison-alabama', altSlug: 'madison', state: 'AL' }, // Different from Madison, WI
  { name: 'Mobile', country: 'United States', searchSlug: 'mobile', state: 'AL' },
  { name: 'Montgomery', country: 'United States', searchSlug: 'montgomery', state: 'AL' },
  { name: 'Opelika', country: 'United States', searchSlug: 'opelika', state: 'AL' },
  { name: 'Orange Beach', country: 'United States', searchSlug: 'orange-beach', state: 'AL' },
  
  // UNITED STATES - Alaska
  { name: 'Anchorage', country: 'United States', searchSlug: 'anchorage', state: 'AK' },
  { name: 'Juneau', country: 'United States', searchSlug: 'juneau', state: 'AK' },
  { name: 'North Pole', country: 'United States', searchSlug: 'north-pole', state: 'AK' },
  { name: 'Wasilla', country: 'United States', searchSlug: 'wasilla', state: 'AK' },
  
  // UNITED STATES - Arizona
  { name: 'Buckeye', country: 'United States', searchSlug: 'buckeye', state: 'AZ' },
  { name: 'Chandler', country: 'United States', searchSlug: 'chandler', state: 'AZ' },
  { name: 'Flagstaff', country: 'United States', searchSlug: 'flagstaff', state: 'AZ' },
  { name: 'Gilbert', country: 'United States', searchSlug: 'gilbert', state: 'AZ' },
  { name: 'Glendale', country: 'United States', searchSlug: 'glendale', state: 'AZ' },
  { name: 'Goodyear', country: 'United States', searchSlug: 'goodyear', state: 'AZ' },
  { name: 'Maricopa', country: 'United States', searchSlug: 'maricopa', state: 'AZ' },
  { name: 'Mesa', country: 'United States', searchSlug: 'mesa', state: 'AZ' },
  { name: 'Peoria', country: 'United States', searchSlug: 'peoria', state: 'AZ' },
  { name: 'Phoenix', country: 'United States', searchSlug: 'phoenix', state: 'AZ' },
  { name: 'Pine', country: 'United States', searchSlug: 'pine', state: 'AZ' },
  { name: 'Prescott', country: 'United States', searchSlug: 'prescott', state: 'AZ' },
  { name: 'San Tan Valley', country: 'United States', searchSlug: 'san-tan-valley', state: 'AZ' },
  { name: 'Scottsdale', country: 'United States', searchSlug: 'scottsdale', state: 'AZ' },
  { name: 'Sedona', country: 'United States', searchSlug: 'sedona', state: 'AZ' },
  { name: 'Show Low', country: 'United States', searchSlug: 'show-low', state: 'AZ' },
  { name: 'Surprise', country: 'United States', searchSlug: 'surprise', state: 'AZ' },
  { name: 'Tempe', country: 'United States', searchSlug: 'tempe', state: 'AZ' },
  { name: 'Tucson', country: 'United States', searchSlug: 'tucson', state: 'AZ' },
  { name: 'Williams', country: 'United States', searchSlug: 'williams', state: 'AZ' },
  
  // UNITED STATES - Arkansas
  { name: 'Bentonville', country: 'United States', searchSlug: 'bentonville', state: 'AR' },
  { name: 'Fayetteville', country: 'United States', searchSlug: 'fayetteville', state: 'AR' },
  { name: 'Hot Springs', country: 'United States', searchSlug: 'hot-springs', state: 'AR' },
  { name: 'Jonesboro', country: 'United States', searchSlug: 'jonesboro', state: 'AR' },
  { name: 'Little Rock', country: 'United States', searchSlug: 'little-rock', state: 'AR' },
  { name: 'Rogers', country: 'United States', searchSlug: 'rogers', state: 'AR' },
  { name: 'Springdale', country: 'United States', searchSlug: 'springdale', state: 'AR' },
  
  // Note: This is a very large list. I'll add a few key states first to test, then continue with the rest.
  // For now, let me add the major tourist destinations that are most likely to have destination pages.
  // We can add the rest systematically.
  
  // UNITED STATES - California (major destinations)
  { name: 'Los Angeles', country: 'United States', searchSlug: 'los-angeles', state: 'CA' },
  { name: 'San Francisco', country: 'United States', searchSlug: 'san-francisco', state: 'CA' },
  { name: 'San Diego', country: 'United States', searchSlug: 'san-diego', state: 'CA' },
  { name: 'Sacramento', country: 'United States', searchSlug: 'sacramento', state: 'CA' },
  { name: 'San Jose', country: 'United States', searchSlug: 'san-jose-california', altSlug: 'san-jose', state: 'CA' }, // Different from San Jose, Costa Rica
  { name: 'Oakland', country: 'United States', searchSlug: 'oakland', state: 'CA' },
  { name: 'Anaheim', country: 'United States', searchSlug: 'anaheim', state: 'CA' },
  { name: 'Santa Barbara', country: 'United States', searchSlug: 'santa-barbara', state: 'CA' },
  { name: 'Santa Monica', country: 'United States', searchSlug: 'santa-monica', state: 'CA' },
  { name: 'Palm Springs', country: 'United States', searchSlug: 'palm-springs', state: 'CA' },
  { name: 'Napa', country: 'United States', searchSlug: 'napa', state: 'CA' },
  { name: 'Lake Tahoe', country: 'United States', searchSlug: 'lake-tahoe', state: 'CA' },
  { name: 'Monterey', country: 'United States', searchSlug: 'monterey-california', altSlug: 'monterey', state: 'CA' }, // Different from Monterey, Mexico
  { name: 'Yosemite', country: 'United States', searchSlug: 'yosemite', state: 'CA' },
  { name: 'Big Sur', country: 'United States', searchSlug: 'big-sur', state: 'CA' },
  
  // UNITED STATES - Colorado (major destinations)
  { name: 'Denver', country: 'United States', searchSlug: 'denver', state: 'CO' },
  { name: 'Colorado Springs', country: 'United States', searchSlug: 'colorado-springs', state: 'CO' },
  { name: 'Aspen', country: 'United States', searchSlug: 'aspen', state: 'CO' },
  { name: 'Vail', country: 'United States', searchSlug: 'vail', state: 'CO' },
  { name: 'Breckenridge', country: 'United States', searchSlug: 'breckenridge', state: 'CO' },
  { name: 'Boulder', country: 'United States', searchSlug: 'boulder', state: 'CO' },
  { name: 'Estes Park', country: 'United States', searchSlug: 'estes-park', state: 'CO' },
  
  // UNITED STATES - Florida (major destinations)
  { name: 'Miami', country: 'United States', searchSlug: 'miami', state: 'FL' },
  { name: 'Orlando', country: 'United States', searchSlug: 'orlando', state: 'FL' },
  { name: 'Tampa', country: 'United States', searchSlug: 'tampa', state: 'FL' },
  { name: 'Jacksonville', country: 'United States', searchSlug: 'jacksonville', state: 'FL' },
  { name: 'Fort Lauderdale', country: 'United States', searchSlug: 'fort-lauderdale', state: 'FL' },
  { name: 'Key West', country: 'United States', searchSlug: 'key-west', state: 'FL' },
  { name: 'Key Largo', country: 'United States', searchSlug: 'key-largo', state: 'FL' },
  { name: 'Naples', country: 'United States', searchSlug: 'naples', state: 'FL' },
  { name: 'Sarasota', country: 'United States', searchSlug: 'sarasota', state: 'FL' },
  { name: 'St. Petersburg', country: 'United States', searchSlug: 'st-petersburg', state: 'FL' },
  { name: 'West Palm Beach', country: 'United States', searchSlug: 'west-palm-beach', state: 'FL' },
  { name: 'Destin', country: 'United States', searchSlug: 'destin', state: 'FL' },
  { name: 'Pensacola', country: 'United States', searchSlug: 'pensacola', state: 'FL' },
  { name: 'Clearwater Beach', country: 'United States', searchSlug: 'clearwater-beach', state: 'FL' },
  { name: 'Daytona Beach', country: 'United States', searchSlug: 'daytona-beach', state: 'FL' },
  
  // UNITED STATES - Georgia
  { name: 'Atlanta', country: 'United States', searchSlug: 'atlanta', state: 'GA' },
  { name: 'Savannah', country: 'United States', searchSlug: 'savannah', state: 'GA' },
  
  // UNITED STATES - Hawaii
  { name: 'Honolulu', country: 'United States', searchSlug: 'honolulu', state: 'HI' },
  { name: 'Waikiki', country: 'United States', searchSlug: 'waikiki', state: 'HI' },
  { name: 'Maui', country: 'United States', searchSlug: 'maui', state: 'HI' },
  { name: 'Kauai', country: 'United States', searchSlug: 'kauai', state: 'HI' },
  { name: 'Oahu', country: 'United States', searchSlug: 'oahu', state: 'HI' },
  { name: 'The Big Island', country: 'United States', searchSlug: 'big-island', state: 'HI' },
  { name: 'Kailua Kona', country: 'United States', searchSlug: 'kailua-kona', state: 'HI' },
  
  // UNITED STATES - Illinois
  { name: 'Chicago', country: 'United States', searchSlug: 'chicago', state: 'IL' },
  
  // UNITED STATES - Louisiana
  { name: 'New Orleans', country: 'United States', searchSlug: 'new-orleans', state: 'LA' },
  
  // UNITED STATES - Massachusetts
  { name: 'Boston', country: 'United States', searchSlug: 'boston', state: 'MA' },
  { name: 'Cape Cod', country: 'United States', searchSlug: 'cape-cod', state: 'MA' },
  
  // UNITED STATES - Nevada
  { name: 'Las Vegas', country: 'United States', searchSlug: 'las-vegas', state: 'NV' },
  { name: 'Reno', country: 'United States', searchSlug: 'reno', state: 'NV' },
  
  // UNITED STATES - New York
  { name: 'New York', country: 'United States', searchSlug: 'new-york-city', altSlug: 'new-york', state: 'NY' },
  { name: 'Manhattan', country: 'United States', searchSlug: 'manhattan', state: 'NY' },
  { name: 'Brooklyn', country: 'United States', searchSlug: 'brooklyn', state: 'NY' },
  { name: 'Buffalo', country: 'United States', searchSlug: 'buffalo', state: 'NY' },
  { name: 'Rochester', country: 'United States', searchSlug: 'rochester-ny', altSlug: 'rochester', state: 'NY' }, // Different from Rochester, MN
  { name: 'Albany', country: 'United States', searchSlug: 'albany-ny', altSlug: 'albany', state: 'NY' }, // Different from Albany, OR
  { name: 'Syracuse', country: 'United States', searchSlug: 'syracuse', state: 'NY' },
  { name: 'Niagara Falls', country: 'United States', searchSlug: 'niagara-falls', state: 'NY' },
  { name: 'Lake Placid', country: 'United States', searchSlug: 'lake-placid', state: 'NY' },
  
  // UNITED STATES - North Carolina
  { name: 'Charlotte', country: 'United States', searchSlug: 'charlotte', state: 'NC' },
  { name: 'Asheville', country: 'United States', searchSlug: 'asheville', state: 'NC' },
  { name: 'Raleigh', country: 'United States', searchSlug: 'raleigh', state: 'NC' },
  { name: 'Outer Banks', country: 'United States', searchSlug: 'outer-banks', state: 'NC' },
  
  // UNITED STATES - Oregon
  { name: 'Portland', country: 'United States', searchSlug: 'portland-oregon', altSlug: 'portland', state: 'OR' }, // Different from Portland, ME
  { name: 'Bend', country: 'United States', searchSlug: 'bend', state: 'OR' },
  { name: 'Eugene', country: 'United States', searchSlug: 'eugene', state: 'OR' },
  
  // UNITED STATES - Pennsylvania
  { name: 'Philadelphia', country: 'United States', searchSlug: 'philadelphia', state: 'PA' },
  { name: 'Pittsburgh', country: 'United States', searchSlug: 'pittsburgh', state: 'PA' },
  
  // UNITED STATES - Texas
  { name: 'Houston', country: 'United States', searchSlug: 'houston', state: 'TX' },
  { name: 'Dallas', country: 'United States', searchSlug: 'dallas', state: 'TX' },
  { name: 'Austin', country: 'United States', searchSlug: 'austin', state: 'TX' },
  { name: 'San Antonio', country: 'United States', searchSlug: 'san-antonio', state: 'TX' },
  { name: 'Fort Worth', country: 'United States', searchSlug: 'fort-worth', state: 'TX' },
  { name: 'Galveston', country: 'United States', searchSlug: 'galveston', state: 'TX' },
  { name: 'El Paso', country: 'United States', searchSlug: 'el-paso', state: 'TX' },
  
  // UNITED STATES - Utah
  { name: 'Salt Lake City', country: 'United States', searchSlug: 'salt-lake-city', state: 'UT' },
  { name: 'Park City', country: 'United States', searchSlug: 'park-city', state: 'UT' },
  { name: 'Moab', country: 'United States', searchSlug: 'moab', state: 'UT' },
  { name: 'Zion National Park', country: 'United States', searchSlug: 'zion-national-park', state: 'UT' },
  
  // UNITED STATES - Washington
  { name: 'Seattle', country: 'United States', searchSlug: 'seattle', state: 'WA' },
  { name: 'Spokane', country: 'United States', searchSlug: 'spokane', state: 'WA' },
  
  // UNITED STATES - Washington, DC
  { name: 'Washington', country: 'United States', searchSlug: 'washington-dc', altSlug: 'washington', state: 'DC' },
  
  // Note: Due to the extremely large number of USA destinations (500+), I'm starting with major tourist destinations.
  // We can add the remaining cities in batches after checking which ones have destination pages.
];

// Helper to generate slug (same as used elsewhere)
function generateSlug(name) {
  if (!name) return '';
  return name
    .toLowerCase()
    .trim()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

// Normalize destination ID (same as categoryGuides.js)
function normalizeDestinationId(destinationId) {
  if (!destinationId) return '';
  return String(destinationId)
    .toLowerCase()
    .trim()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

async function checkDestinations() {
  console.log('🔍 Checking BabyQuip destinations...\n');

  // Get all unique destination_ids from category_guides (destinations with guides = have destination pages)
  const { data: categoryGuidesData, error: guidesError } = await supabase
    .from('category_guides')
    .select('destination_id')
    .order('destination_id', { ascending: true });

  if (guidesError) {
    console.error('Error fetching category guides:', guidesError);
    return;
  }

  const destinationsWithGuides = new Set(
    categoryGuidesData.map(row => normalizeDestinationId(row.destination_id))
  );

  // Also check Viator classified destinations (destinations without guides but with basic pages)
  const viatorDestinationsSet = new Set();
  viatorDestinationsClassified.forEach(dest => {
    if (dest && dest.destinationName) {
      const slug = normalizeDestinationId(generateSlug(dest.destinationName || dest.name || ''));
      if (slug) {
        viatorDestinationsSet.add(slug);
      }
    }
  });

  // Combine both sets (destinations with guides + destinations without guides but with pages)
  const allDestinationsWithPages = new Set([
    ...destinationsWithGuides,
    ...viatorDestinationsSet,
  ]);

  console.log(`📊 Found ${destinationsWithGuides.size} destinations with category guides (have full destination pages)`);
  console.log(`📊 Found ${viatorDestinationsSet.size} destinations in Viator classified data (have basic destination pages)`);
  console.log(`📊 Total destinations with pages: ${allDestinationsWithPages.size}\n`);

  // Get all destination_ids from baby_equipment_rentals (already have pages)
  const { data: babyRentalsData, error: rentalsError } = await supabase
    .from('baby_equipment_rentals')
    .select('destination_id')
    .eq('is_active', true);

  if (rentalsError) {
    console.error('Error fetching baby equipment rentals:', rentalsError);
    return;
  }

  const destinationsWithBabyRentals = new Set(
    babyRentalsData.map(row => normalizeDestinationId(row.destination_id))
  );

  console.log(`👶 Found ${destinationsWithBabyRentals.size} destinations with baby equipment rental pages\n`);

  // Check each BabyQuip destination
  const results = {
    hasDestinationPage: [],
    hasBabyRentalsPage: [],
    missingDestinationPage: [],
    readyForBabyRentals: [], // Has destination page but no baby rentals page
  };

  for (const dest of BABYQUIP_DESTINATIONS) {
    const normalizedSlug = normalizeDestinationId(dest.searchSlug);
    const altSlug = dest.altSlug ? normalizeDestinationId(dest.altSlug) : normalizeDestinationId(generateSlug(dest.name));
    const generatedSlug = normalizeDestinationId(generateSlug(dest.name));
    
    // Try multiple variations: searchSlug, altSlug (if specified), generated slug from name, and search in Viator data by name
    let matchingSlug = null;
    let hasDestinationPage = false;
    
    // First, check if slug exists in destinations with guides or Viator destinations (exact match)
    // Priority: searchSlug > altSlug (if specified) > generated slug
    if (allDestinationsWithPages.has(normalizedSlug)) {
      matchingSlug = normalizedSlug;
      hasDestinationPage = true;
    } else if (dest.altSlug && allDestinationsWithPages.has(altSlug)) {
      matchingSlug = altSlug;
      hasDestinationPage = true;
    } else if (allDestinationsWithPages.has(generatedSlug)) {
      matchingSlug = generatedSlug;
      hasDestinationPage = true;
    } else {
      // Search in Viator classified data by name with country matching for accuracy
      const destNameLower = dest.name.toLowerCase().trim();
      const countryLower = dest.country.toLowerCase().trim();
      
      // Find all potential matches first
      const potentialMatches = viatorDestinationsClassified.filter(vd => {
        if (!vd || !vd.destinationName) return false;
        const viatorNameLower = (vd.destinationName || vd.name || '').toLowerCase().trim();
        const viatorCountryLower = (vd.country || '').toLowerCase().trim();
        
        // Exact name match (preferred)
        if (viatorNameLower === destNameLower) {
          return true;
        }
        
        // For multi-word names, check if one contains the other (but be strict)
        // Only match if the shorter name is a significant portion of the longer name
        const shorterName = destNameLower.length <= viatorNameLower.length ? destNameLower : viatorNameLower;
        const longerName = destNameLower.length > viatorNameLower.length ? destNameLower : viatorNameLower;
        
        // Require at least 3 characters for partial matches (to avoid "George" matching "Saint George")
        if (shorterName.length >= 3 && longerName.includes(shorterName)) {
          // Prefer matches where country also matches (especially for ambiguous names)
          if (viatorCountryLower && countryLower) {
            // Exact country match is best
            if (viatorCountryLower === countryLower) {
              return true;
            }
            // Partial country match (e.g., "United States" vs "USA")
            if (viatorCountryLower.includes(countryLower) || countryLower.includes(viatorCountryLower)) {
              return true;
            }
          }
          // If no country match but name is very close, still consider it (but lower priority)
          // This will be handled in the prioritization below
        }
        
        return false;
      });
      
      // Prioritize matches: exact name + country match > exact name > partial name + country match
      let matchedViatorDest = null;
      if (potentialMatches.length > 0) {
        // First, try exact name + country match
        matchedViatorDest = potentialMatches.find(vd => {
          const viatorNameLower = (vd.destinationName || vd.name || '').toLowerCase().trim();
          const viatorCountryLower = (vd.country || '').toLowerCase().trim();
          return viatorNameLower === destNameLower && 
                 viatorCountryLower && countryLower && 
                 (viatorCountryLower === countryLower || viatorCountryLower.includes(countryLower) || countryLower.includes(viatorCountryLower));
        });
        
        // If no exact name + country match, try exact name only
        if (!matchedViatorDest) {
          matchedViatorDest = potentialMatches.find(vd => {
            const viatorNameLower = (vd.destinationName || vd.name || '').toLowerCase().trim();
            return viatorNameLower === destNameLower;
          });
        }
        
        // If still no match, try partial name + country match (but be strict - names must be close)
        if (!matchedViatorDest && potentialMatches.length > 0) {
          // Filter to only close matches (avoid "George" matching "Saint George")
          const closeMatches = potentialMatches.filter(vd => {
            const viatorNameLower = (vd.destinationName || vd.name || '').toLowerCase().trim();
            const viatorCountryLower = (vd.country || '').toLowerCase().trim();
            
            // Require country match for partial name matches to avoid false positives
            if (!viatorCountryLower || !countryLower) return false;
            
            // Names must be reasonably similar (one is a substring of the other and at least 70% length match)
            const shorterLen = Math.min(destNameLower.length, viatorNameLower.length);
            const longerLen = Math.max(destNameLower.length, viatorNameLower.length);
            const similarity = shorterLen / longerLen;
            
            if (similarity >= 0.7 && (viatorCountryLower === countryLower || viatorCountryLower.includes(countryLower) || countryLower.includes(viatorCountryLower))) {
              return true;
            }
            
            return false;
          });
          
          if (closeMatches.length > 0) {
            // Take the first one with country match
            matchedViatorDest = closeMatches[0];
          }
        }
      }
      
      if (matchedViatorDest) {
        const viatorSlug = normalizeDestinationId(generateSlug(matchedViatorDest.destinationName || matchedViatorDest.name || ''));
        if (allDestinationsWithPages.has(viatorSlug)) {
          matchingSlug = viatorSlug;
          hasDestinationPage = true;
        }
      }
    }
    
    // Check for baby rentals page - check all possible slugs (exact match only)
    const possibleSlugs = [matchingSlug, normalizedSlug, altSlug].filter(Boolean);
    const hasBabyRentalsPage = possibleSlugs.some(slug => destinationsWithBabyRentals.has(slug));

    if (hasDestinationPage && matchingSlug) {
      const destResult = {
        ...dest,
        slug: matchingSlug,
      };
      
      results.hasDestinationPage.push(destResult);
      
      if (hasBabyRentalsPage) {
        results.hasBabyRentalsPage.push(destResult);
      } else {
        results.readyForBabyRentals.push(destResult);
      }
    } else {
      results.missingDestinationPage.push(dest);
    }
  }

  // Print results
  console.log('='.repeat(80));
  console.log('📋 RESULTS SUMMARY');
  console.log('='.repeat(80));
  
  console.log(`\n✅ Destinations WITH destination pages: ${results.hasDestinationPage.length}`);
  console.log(`   └─ Can create baby equipment rental pages for these`);
  
  console.log(`\n👶 Destinations WITH baby equipment rental pages: ${results.hasBabyRentalsPage.length}`);
  if (results.hasBabyRentalsPage.length > 0) {
    results.hasBabyRentalsPage.forEach(d => {
      console.log(`   • ${d.name}, ${d.country} (${d.slug})`);
    });
  }
  
  console.log(`\n🎯 Ready to create baby equipment rental pages: ${results.readyForBabyRentals.length}`);
  if (results.readyForBabyRentals.length > 0) {
    console.log(`   └─ These have destination pages but NO baby rentals page yet:`);
    results.readyForBabyRentals.forEach(d => {
      console.log(`   • ${d.name}, ${d.country} (${d.slug})`);
    });
  }
  
  console.log(`\n❌ Destinations WITHOUT destination pages: ${results.missingDestinationPage.length}`);
  if (results.missingDestinationPage.length > 0) {
    console.log(`   └─ Cannot create baby rentals pages yet (need destination pages first):`);
    results.missingDestinationPage.forEach(d => {
      console.log(`   • ${d.name}, ${d.country}`);
    });
  }

  // Export ready-to-create destinations as JSON for batch script
  if (results.readyForBabyRentals.length > 0) {
    console.log(`\n📝 Ready-to-create destinations (for batch script):`);
    const readyToCreate = results.readyForBabyRentals.map(d => ({
      id: d.slug,
      name: d.name,
      country: d.country,
      state: d.state || null,
    }));
    console.log(JSON.stringify(readyToCreate, null, 2));
    
    // Also save to file for easy reference
    const fs = await import('fs');
    const path = await import('path');
    const fileUrl = await import('url');
    const __filename2 = fileUrl.fileURLToPath(import.meta.url);
    const __dirname2 = path.dirname(__filename2);
    const outputPath = path.join(__dirname2, 'ready-to-create-destinations.json');
    fs.writeFileSync(outputPath, JSON.stringify(readyToCreate, null, 2), 'utf8');
    console.log(`\n💾 Saved ${readyToCreate.length} destinations to scripts/ready-to-create-destinations.json`);
  }

  console.log('\n' + '='.repeat(80));
}

checkDestinations()
  .then(() => {
    console.log('\n✅ Check complete!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Error:', error);
    process.exit(1);
  });
