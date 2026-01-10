/**
 * Batch seed script for baby equipment rentals pages
 * Creates pages for multiple destinations using minimal configuration
 * Template handles most content automatically
 *
 * Usage:
 *   node scripts/seed-baby-equipment-rentals-batch.js
 *
 * Requirements:
 *   - .env.local (or environment) must define:
 *       NEXT_PUBLIC_SUPABASE_URL (or SUPABASE_URL)
 *       SUPABASE_SERVICE_ROLE_KEY
 */

import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { createClient } from '@supabase/supabase-js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '../.env.local') });

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error('❌ Missing Supabase credentials. Please set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY.');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

// Universal product categories (used by default for all destinations)
const UNIVERSAL_CATEGORIES = [
  {
    name: 'Cribs & Sleep',
    icon: '🛏️',
    description: 'Full-size cribs, pack n plays, bassinets, and sleep essentials to ensure your little one gets a good night\'s rest.',
    enabled: true,
  },
  {
    name: 'Strollers & Wagons',
    icon: '🛴',
    description: 'Lightweight strollers, jogging strollers, and wagons perfect for exploring your destination with ease and comfort.',
    enabled: true,
  },
  {
    name: 'Car Seats',
    icon: '🚗',
    description: 'Safe and certified car seats for infants and toddlers, delivered directly to your rental location or hotel.',
    enabled: true,
  },
  {
    name: 'High Chairs & Mealtime',
    icon: '🍽️',
    description: 'High chairs, booster seats, and feeding accessories to make dining with your family comfortable and convenient.',
    enabled: true,
  },
  {
    name: 'Beach & Outdoor Gear',
    icon: '🏖️',
    description: 'Beach tents, sand toys, outdoor play equipment, and seasonal gear for family fun in the sun.',
    enabled: true,
  },
  {
    name: 'Health & Safety Gear',
    icon: '🏥',
    description: 'Baby gates, outlet covers, monitors, and safety essentials to keep your child safe and secure.',
    enabled: true,
  },
  {
    name: 'Activity & Entertainment',
    icon: '🎮',
    description: 'Bouncers, swings, play mats, and entertainment items to keep your little one happy and engaged.',
    enabled: true,
  },
  {
    name: 'Monitor Gear',
    icon: '📱',
    description: 'Audio and video baby monitors to stay connected with your baby while relaxing during your vacation.',
    enabled: true,
  },
  {
    name: 'Diapering & Bathing',
    icon: '🛁',
    description: 'Changing pads, bath tubs, and diapering essentials to make daily routines stress-free on the go.',
    enabled: true,
  },
  {
    name: 'Toys, Books & Games',
    icon: '🧸',
    description: 'Age-appropriate toys, books, and games to keep your child entertained during travel and downtime.',
    enabled: true,
  },
  {
    name: 'Pet Gear',
    icon: '🐾',
    description: 'Travel-friendly pet gear and accessories for your furry family members during your vacation.',
    enabled: true,
  },
];

// Standard FAQs (used for all destinations)
const STANDARD_FAQS = [
  {
    question: 'Are baby gear items cleaned before they are rented?',
    answer: 'Yes! We require that all BabyQuip Quality Providers meticulously clean all of their baby equipment from top to bottom. Babies\' immune systems are still developing and we understand that you as parents or grandparents rightfully expect clean and sanitized products. Baby gear is inspected and cleaned after every pickup and then inspected and sanitized again before the next delivery. All cleaners used are organic/non-toxic. Read about our cleaning standards for more information.',
  },
  {
    question: 'Does BabyQuip deliver baby gear?',
    answer: 'Quality Providers serve hundreds of locations across the US, Canada, Mexico, Caribbean, Australia & New Zealand. They deliver to hotels, airbnbs, vacation rentals, private residences and even the airport. (Please note that delivery rates vary by location and provider.)',
  },
  {
    question: 'Are the car seats that BabyQuip rents new or used?',
    answer: 'All providers are required to purchase car seats new or rent ones that have been purchased new for their own children that have not been dropped or involved in an automobile accident. All car safety seats have an expiration date and are not allowed to be rented (and are discarded) after the date has passed or if the seat has been involved in a car crash.',
  },
  {
    question: 'How much does it cost to rent a crib?',
    answer: 'Rental prices vary from location to location and among Quality Providers, but cribs and other sleep solutions (including mini cribs and pack \'n plays) range from $12-$22 per day.',
  },
  {
    question: 'How do I get my baby to sleep well on vacation?',
    answer: 'In order to expect your baby to sleep well on vacation, you need to create an atmosphere similar to home. If your baby regularly sleeps in a full sized crib, it\'s not likely that they will sleep well in a pack \'n play on vacation. Rent the gear you need to create a familiar environment.',
  },
];

// Helper function to format destination name for hero text
function formatDestinationName(destinationId) {
  return destinationId
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

// Helper function to create destination-specific FAQ
function createDestinationFAQs(destinationId, destinationName) {
  return STANDARD_FAQS.map(faq => {
    if (faq.question.includes('crib')) {
      return {
        ...faq,
        question: `How much does it cost to rent a crib in ${destinationName}?`,
      };
    }
    if (faq.question.includes('sleep well')) {
      return {
        ...faq,
        question: `How do I get my baby to sleep well on vacation in ${destinationName}?`,
      };
    }
    return faq;
  });
}

// List of destinations to seed (destination_id, optional custom name for display)
const DESTINATIONS_TO_SEED = [
  // Previous batches (already created)
  { id: 'jamaica', name: 'Jamaica' },
  { id: 'panama-city', name: 'Panama City' },
  { id: 'puerto-rico', name: 'Puerto Rico' },
  { id: 'st-kitts-and-nevis', name: 'Saint Kitts and Nevis' },
  { id: 'cape-town', name: 'Cape Town' },
  { id: 'chiang-mai', name: 'Chiang Mai' },
  { id: 'nassau', name: 'Nassau' },
  { id: 'exuma', name: 'Exuma' },
  { id: 'dubai', name: 'Dubai' },
  { id: 'antigua', name: 'Antigua' }, // Guatemala
  { id: 'auckland', name: 'Auckland' },
  { id: 'wellington', name: 'Wellington' },
  { id: 'cancun', name: 'Cancun' },
  { id: 'mexico-city', name: 'Mexico City' },
  { id: 'bangkok', name: 'Bangkok' },
  
  // European destinations (previous batch)
  { id: 'lisbon', name: 'Lisbon' }, // Portugal
  { id: 'barcelona', name: 'Barcelona' }, // Spain
  { id: 'seville', name: 'Seville' }, // Spain
  { id: 'mallorca', name: 'Mallorca' }, // Spain
  { id: 'madrid', name: 'Madrid' }, // Spain
  { id: 'london', name: 'London' }, // United Kingdom
  { id: 'zurich', name: 'Zurich' }, // Switzerland
  { id: 'stockholm', name: 'Stockholm' }, // Sweden
  { id: 'krakow', name: 'Krakow' }, // Poland
  { id: 'liverpool', name: 'Liverpool' }, // United Kingdom
  
  // NEW BATCH: Ready-to-create destinations from BabyQuip list (32 destinations)
  { id: 'aruba', name: 'Aruba' },
  { id: 'antigua-and-barbuda', name: 'Antigua and Barbuda' }, // Saint George -> Antigua and Barbuda
  { id: 'sydney', name: 'Sydney' }, // Australia
  { id: 'brisbane', name: 'Brisbane' }, // Australia
  { id: 'gold-coast', name: 'Gold Coast' }, // Australia
  { id: 'sunshine-coast', name: 'Sunshine Coast' }, // Australia
  { id: 'adelaide', name: 'Adelaide' }, // Australia
  { id: 'melbourne', name: 'Melbourne' }, // Australia
  { id: 'perth', name: 'Perth' }, // Australia
  { id: 'guatemala-city', name: 'Guatemala City' }, // Guatemala
  { id: 'montego-bay', name: 'Montego Bay' }, // Jamaica
  { id: 'ensenada', name: 'Ensenada' }, // Mexico
  { id: 'cabo-san-lucas', name: 'Cabo San Lucas' }, // Mexico
  { id: 'la-paz', name: 'La Paz' }, // Mexico
  { id: 'los-cabos', name: 'Los Cabos' }, // Mexico
  { id: 'san-jose-del-cabo', name: 'San Jose del Cabo' }, // Mexico
  { id: 'chihuahua', name: 'Chihuahua' }, // Mexico
  { id: 'puerto-vallarta', name: 'Puerto Vallarta' }, // Mexico
  { id: 'guadalajara', name: 'Guadalajara' }, // Mexico
  { id: 'sayulita', name: 'Sayulita' }, // Mexico
  { id: 'monterrey', name: 'Monterrey' }, // Mexico
  { id: 'oaxaca', name: 'Oaxaca' }, // Mexico
  { id: 'queretaro', name: 'Queretaro' }, // Mexico
  { id: 'cozumel', name: 'Cozumel' }, // Mexico
  { id: 'playa-del-carmen', name: 'Playa del Carmen' }, // Mexico
  { id: 'veracruz', name: 'Veracruz' }, // Mexico
  { id: 'merida', name: 'Merida' }, // Mexico
  { id: 'isabela', name: 'Isabela' }, // Puerto Rico
  { id: 'san-juan', name: 'San Juan' }, // Puerto Rico
  { id: 'eleuthera', name: 'Eleuthera' }, // The Bahamas
  { id: 'st-croix', name: 'St Croix' }, // U.S. Virgin Islands
  { id: 'st-john', name: 'St John' }, // U.S. Virgin Islands
  { id: 'st-thomas', name: 'St Thomas' }, // U.S. Virgin Islands
  
  // NEW BATCH: Canadian destinations from BabyQuip list (24 destinations)
  // Alberta
  { id: 'banff', name: 'Banff' }, // Canada
  { id: 'calgary', name: 'Calgary' }, // Canada
  { id: 'edmonton', name: 'Edmonton' }, // Canada
  // British Columbia
  { id: 'nanaimo', name: 'Nanaimo' }, // Canada
  { id: 'revelstoke', name: 'Revelstoke' }, // Canada
  { id: 'squamish', name: 'Squamish' }, // Canada
  { id: 'vancouver', name: 'Vancouver' }, // Canada
  { id: 'victoria', name: 'Victoria' }, // Canada
  { id: 'whistler', name: 'Whistler' }, // Canada (Whistler Blackcomb maps to same)
  // Manitoba
  { id: 'winnipeg', name: 'Winnipeg' }, // Canada
  // New Brunswick
  { id: 'dieppe', name: 'Dieppe' }, // Canada
  { id: 'saint-john', name: 'Saint John' }, // Canada
  // Nova Scotia
  { id: 'halifax', name: 'Halifax' }, // Canada
  // Ontario
  { id: 'barrie', name: 'Barrie' }, // Canada
  { id: 'collingwood', name: 'Collingwood' }, // Canada
  { id: 'ottawa', name: 'Ottawa' }, // Canada
  { id: 'toronto', name: 'Toronto' }, // Canada
  { id: 'windsor', name: 'Windsor' }, // Canada
  // Prince Edward Island
  { id: 'charlottetown', name: 'Charlottetown' }, // Canada
  { id: 'prince-edward-island', name: 'Prince Edward Island' }, // Canada
  // Quebec
  { id: 'mont-tremblant', name: 'Mont-Tremblant' }, // Canada
  { id: 'montreal', name: 'Montreal' }, // Canada
  // Yukon
  { id: 'whitehorse', name: 'Whitehorse' }, // Canada
  
  // NEW BATCH: USA destinations from BabyQuip list (89 destinations ready to create)
  // Alabama
  { id: 'birmingham', name: 'Birmingham' }, // USA, AL
  { id: 'gulf-shores', name: 'Gulf Shores' }, // USA, AL
  { id: 'huntsville', name: 'Huntsville' }, // USA, AL
  { id: 'madison', name: 'Madison' }, // USA, AL (different from Madison, WI)
  { id: 'mobile', name: 'Mobile' }, // USA, AL
  { id: 'montgomery', name: 'Montgomery' }, // USA, AL
  { id: 'orange-beach', name: 'Orange Beach' }, // USA, AL
  // Alaska
  { id: 'anchorage', name: 'Anchorage' }, // USA, AK
  { id: 'juneau', name: 'Juneau' }, // USA, AK
  // Arizona
  { id: 'flagstaff', name: 'Flagstaff' }, // USA, AZ
  { id: 'phoenix', name: 'Phoenix' }, // USA, AZ
  { id: 'prescott', name: 'Prescott' }, // USA, AZ
  { id: 'scottsdale', name: 'Scottsdale' }, // USA, AZ
  { id: 'sedona', name: 'Sedona' }, // USA, AZ
  { id: 'tucson', name: 'Tucson' }, // USA, AZ
  // Arkansas
  { id: 'fayetteville', name: 'Fayetteville' }, // USA, AR
  { id: 'hot-springs', name: 'Hot Springs' }, // USA, AR
  { id: 'little-rock', name: 'Little Rock' }, // USA, AR
  // California
  { id: 'los-angeles', name: 'Los Angeles' }, // USA, CA
  { id: 'san-francisco', name: 'San Francisco' }, // USA, CA
  { id: 'san-diego', name: 'San Diego' }, // USA, CA
  { id: 'sacramento', name: 'Sacramento' }, // USA, CA
  { id: 'oakland', name: 'Oakland' }, // USA, CA
  { id: 'santa-barbara', name: 'Santa Barbara' }, // USA, CA
  { id: 'santa-monica', name: 'Santa Monica' }, // USA, CA
  { id: 'palm-springs', name: 'Palm Springs' }, // USA, CA
  { id: 'lake-tahoe', name: 'Lake Tahoe' }, // USA, CA
  // Colorado
  { id: 'denver', name: 'Denver' }, // USA, CO
  { id: 'colorado-springs', name: 'Colorado Springs' }, // USA, CO
  { id: 'aspen', name: 'Aspen' }, // USA, CO
  { id: 'vail', name: 'Vail' }, // USA, CO
  { id: 'breckenridge', name: 'Breckenridge' }, // USA, CO
  { id: 'boulder', name: 'Boulder' }, // USA, CO
  { id: 'estes-park', name: 'Estes Park' }, // USA, CO
  // Florida
  { id: 'miami', name: 'Miami' }, // USA, FL
  { id: 'orlando', name: 'Orlando' }, // USA, FL
  { id: 'tampa', name: 'Tampa' }, // USA, FL
  { id: 'jacksonville', name: 'Jacksonville' }, // USA, FL
  { id: 'fort-lauderdale', name: 'Fort Lauderdale' }, // USA, FL
  { id: 'key-west', name: 'Key West' }, // USA, FL
  { id: 'key-largo', name: 'Key Largo' }, // USA, FL
  { id: 'naples', name: 'Naples' }, // USA, FL
  { id: 'sarasota', name: 'Sarasota' }, // USA, FL
  { id: 'st-petersburg', name: 'St. Petersburg' }, // USA, FL
  { id: 'west-palm-beach', name: 'West Palm Beach' }, // USA, FL
  { id: 'destin', name: 'Destin' }, // USA, FL
  { id: 'pensacola', name: 'Pensacola' }, // USA, FL
  { id: 'daytona-beach', name: 'Daytona Beach' }, // USA, FL
  // Georgia
  { id: 'atlanta', name: 'Atlanta' }, // USA, GA
  { id: 'savannah', name: 'Savannah' }, // USA, GA
  // Hawaii
  { id: 'honolulu', name: 'Honolulu' }, // USA, HI
  { id: 'maui', name: 'Maui' }, // USA, HI
  { id: 'kauai', name: 'Kauai' }, // USA, HI
  { id: 'oahu', name: 'Oahu' }, // USA, HI
  // Illinois
  { id: 'chicago', name: 'Chicago' }, // USA, IL
  // Louisiana
  { id: 'new-orleans', name: 'New Orleans' }, // USA, LA
  // Massachusetts
  { id: 'boston', name: 'Boston' }, // USA, MA
  { id: 'cape-cod', name: 'Cape Cod' }, // USA, MA
  // Nevada
  { id: 'las-vegas', name: 'Las Vegas' }, // USA, NV
  { id: 'reno', name: 'Reno' }, // USA, NV
  // New York
  { id: 'new-york-city', name: 'New York', displayName: 'New York City' }, // USA, NY
  { id: 'brooklyn', name: 'Brooklyn' }, // USA, NY
  { id: 'buffalo', name: 'Buffalo' }, // USA, NY
  { id: 'rochester', name: 'Rochester' }, // USA, NY
  { id: 'albany', name: 'Albany' }, // USA, NY
  { id: 'syracuse', name: 'Syracuse' }, // USA, NY
  { id: 'niagara-falls', name: 'Niagara Falls' }, // USA, NY
  // North Carolina
  { id: 'charlotte', name: 'Charlotte' }, // USA, NC
  { id: 'asheville', name: 'Asheville' }, // USA, NC
  { id: 'raleigh', name: 'Raleigh' }, // USA, NC
  { id: 'outer-banks', name: 'Outer Banks' }, // USA, NC
  // Oregon
  { id: 'portland', name: 'Portland' }, // USA, OR (different from Portland, ME)
  { id: 'bend', name: 'Bend' }, // USA, OR
  { id: 'eugene', name: 'Eugene' }, // USA, OR
  // Pennsylvania
  { id: 'philadelphia', name: 'Philadelphia' }, // USA, PA
  { id: 'pittsburgh', name: 'Pittsburgh' }, // USA, PA
  // Texas
  { id: 'houston', name: 'Houston' }, // USA, TX
  { id: 'dallas', name: 'Dallas' }, // USA, TX
  { id: 'austin', name: 'Austin' }, // USA, TX
  { id: 'san-antonio', name: 'San Antonio' }, // USA, TX
  { id: 'fort-worth', name: 'Fort Worth' }, // USA, TX
  { id: 'galveston', name: 'Galveston' }, // USA, TX
  { id: 'el-paso', name: 'El Paso' }, // USA, TX
  // Utah
  { id: 'salt-lake-city', name: 'Salt Lake City' }, // USA, UT
  { id: 'park-city', name: 'Park City' }, // USA, UT
  { id: 'moab', name: 'Moab' }, // USA, UT
  { id: 'zion-national-park', name: 'Zion National Park' }, // USA, UT
  // Washington
  { id: 'seattle', name: 'Seattle' }, // USA, WA
  // Washington, DC
  { id: 'washington-dc', name: 'Washington', displayName: 'Washington, DC' }, // USA, DC
];

async function seedBatch() {
  const results = [];
  const errors = [];

  for (const dest of DESTINATIONS_TO_SEED) {
    try {
      const destinationId = dest.id.toLowerCase();
      const destinationName = dest.name || formatDestinationName(destinationId);
      
      // Determine if beach destination (affects category descriptions)
      // Note: Most Canadian destinations are not beach destinations (mountains, cities, etc.)
      // USA destinations: Most Florida, California coast, Hawaii, etc. are beach destinations
      const isBeachDestination = [
        'jamaica', 'nassau', 'exuma', 'puerto-rico', 'st-kitts-and-nevis', 'cancun', 
        'cape-town', 'mallorca', 'barcelona', 'aruba', 'antigua-and-barbuda',
        'sydney', 'brisbane', 'gold-coast', 'sunshine-coast', 'adelaide', 'melbourne', 'perth',
        'montego-bay', 'ensenada', 'cabo-san-lucas', 'la-paz', 'los-cabos', 'san-jose-del-cabo',
        'puerto-vallarta', 'sayulita', 'cozumel', 'playa-del-carmen', 'isabela', 'san-juan',
        'eleuthera', 'st-croix', 'st-john', 'st-thomas',
        // Some Canadian destinations that could have beach/outdoor activities (limited)
        'victoria', 'vancouver', 'nanaimo', // Coastal cities with beaches
        // USA beach destinations
        'gulf-shores', 'orange-beach', 'miami', 'orlando', 'tampa', 'jacksonville',
        'fort-lauderdale', 'key-west', 'key-largo', 'naples', 'sarasota', 'st-petersburg',
        'west-palm-beach', 'destin', 'pensacola', 'daytona-beach', 'clearwater-beach',
        'los-angeles', 'san-diego', 'santa-barbara', 'santa-monica', // California beaches
        'savannah', // Georgia coastal
        'honolulu', 'maui', 'kauai', 'oahu', 'waikiki', // Hawaii (all beach destinations)
        'cape-cod', // Massachusetts coastal
        'outer-banks', // North Carolina coastal
        'galveston' // Texas coastal
      ].includes(destinationId);
      
      // Customize categories for beach destinations
      const productCategories = UNIVERSAL_CATEGORIES.map(cat => {
        if (cat.name === 'Beach & Outdoor Gear' && isBeachDestination) {
          return {
            ...cat,
            description: `Beach tents, sand toys, outdoor play equipment, and seasonal gear for family fun in the sun. Perfect for ${destinationName}'s pristine beaches.`,
          };
        }
        if (cat.name === 'Strollers & Wagons' && isBeachDestination) {
          return {
            ...cat,
            description: `Lightweight strollers, jogging strollers, and stroller wagons perfect for exploring ${destinationName}'s beautiful beaches and attractions with ease and comfort.`,
          };
        }
        // For non-beach destinations, disable beach gear or make it generic
        // Most Canadian destinations are mountain/city destinations, not beach destinations
        // USA non-beach destinations: mountains, deserts, cities, etc.
        if (cat.name === 'Beach & Outdoor Gear' && !isBeachDestination && [
          'bangkok', 'mexico-city', 'chiang-mai', 'antigua', 'madrid', 'seville', 'london', 
          'zurich', 'lisbon', 'stockholm', 'krakow', 'liverpool', 'guatemala-city',
          'chihuahua', 'guadalajara', 'monterrey', 'oaxaca', 'queretaro', 'veracruz', 'merida',
          // Canadian destinations (most are not beach destinations)
          'banff', 'calgary', 'edmonton', 'revelstoke', 'squamish', 'whistler', 'winnipeg',
          'dieppe', 'saint-john', 'halifax', 'barrie', 'collingwood', 'ottawa', 'toronto', 'windsor',
          'charlottetown', 'prince-edward-island', 'mont-tremblant', 'montreal', 'whitehorse',
          // USA non-beach destinations
          'birmingham', 'huntsville', 'madison', 'mobile', 'montgomery', // Alabama cities
          'anchorage', 'juneau', // Alaska
          'flagstaff', 'phoenix', 'prescott', 'scottsdale', 'sedona', 'tucson', // Arizona (desert/mountains)
          'fayetteville', 'hot-springs', 'little-rock', // Arkansas
          'oakland', 'sacramento', 'san-francisco', 'palm-springs', 'lake-tahoe', // California non-beach
          'denver', 'colorado-springs', 'aspen', 'vail', 'breckenridge', 'boulder', 'estes-park', // Colorado (mountains)
          'atlanta', // Georgia (city)
          'chicago', // Illinois (city)
          'new-orleans', // Louisiana (city, but could be beach - keeping enabled)
          'boston', // Massachusetts (city)
          'las-vegas', 'reno', // Nevada (desert)
          'new-york-city', 'brooklyn', 'buffalo', 'rochester', 'albany', 'syracuse', 'niagara-falls', // New York
          'charlotte', 'asheville', 'raleigh', // North Carolina (cities, not coastal)
          'portland', 'bend', 'eugene', // Oregon (cities)
          'philadelphia', 'pittsburgh', // Pennsylvania (cities)
          'houston', 'dallas', 'austin', 'san-antonio', 'fort-worth', 'el-paso', // Texas (cities/desert)
          'salt-lake-city', 'park-city', 'moab', 'zion-national-park', // Utah (mountains/desert)
          'seattle', // Washington (city)
          'washington-dc' // DC (city)
        ].includes(destinationId)) {
          return {
            ...cat,
            enabled: false,
          };
        }
        return {
          ...cat,
          description: cat.description.replace('your destination', destinationName),
        };
      }).filter(cat => cat.enabled !== false);

      const heroDescription = `Families and little ones adore ${destinationName}. Don't want to lug all your baby gear? No problem, we're here to help!`;
      
      const seoKeywords = [
        `baby equipment rental ${destinationName}`,
        `baby gear rental ${destinationName}`,
        `stroller rental ${destinationName}`,
        `car seat rental ${destinationName}`,
        `crib rental ${destinationName}`,
        `baby equipment ${destinationName}`,
      ];

      // Add country-specific keywords if applicable
      // Mexico destinations (all Mexico cities)
      if (['cancun', 'mexico-city', 'ensenada', 'cabo-san-lucas', 'la-paz', 'los-cabos', 
           'san-jose-del-cabo', 'chihuahua', 'puerto-vallarta', 'guadalajara', 'sayulita', 
           'monterrey', 'oaxaca', 'queretaro', 'cozumel', 'playa-del-carmen', 'veracruz', 'merida'].includes(destinationId)) {
        seoKeywords.push('baby gear rental Mexico', 'baby equipment rental Mexico');
      }
      // Australia destinations
      if (['sydney', 'brisbane', 'gold-coast', 'sunshine-coast', 'adelaide', 'melbourne', 'perth'].includes(destinationId)) {
        seoKeywords.push('baby gear rental Australia', 'baby equipment rental Australia');
      }
      // Thailand destinations
      if (['chiang-mai', 'bangkok'].includes(destinationId)) {
        seoKeywords.push('baby gear rental Thailand', 'baby equipment rental Thailand');
      }
      // New Zealand destinations
      if (['auckland', 'wellington'].includes(destinationId)) {
        seoKeywords.push('baby gear rental New Zealand', 'baby equipment rental New Zealand');
      }
      // South Africa destinations
      if (destinationId === 'cape-town') {
        seoKeywords.push('baby gear rental South Africa', 'baby equipment rental South Africa');
      }
      // UAE destinations
      if (destinationId === 'dubai') {
        seoKeywords.push('baby gear rental UAE', 'baby equipment rental United Arab Emirates');
      }
      // Guatemala destinations (Antigua is a city in Guatemala, not Antigua and Barbuda)
      if (destinationId === 'antigua') {
        seoKeywords.push('baby gear rental Guatemala', 'baby equipment rental Guatemala');
      }
      // Antigua and Barbuda (country - Saint George maps here)
      if (destinationId === 'antigua-and-barbuda') {
        seoKeywords.push('baby gear rental Antigua and Barbuda', 'baby equipment rental Antigua', 'baby equipment rental Barbuda');
      }
      // Puerto Rico destinations
      if (['isabela', 'san-juan'].includes(destinationId)) {
        seoKeywords.push('baby gear rental Puerto Rico', 'baby equipment rental Puerto Rico');
      }
      // U.S. Virgin Islands destinations
      if (['st-croix', 'st-john', 'st-thomas'].includes(destinationId)) {
        seoKeywords.push('baby gear rental U.S. Virgin Islands', 'baby equipment rental USVI');
      }
      // The Bahamas destinations
      if (['eleuthera', 'nassau'].includes(destinationId)) {
        seoKeywords.push('baby gear rental The Bahamas', 'baby equipment rental Bahamas');
      }
      // Canadian destinations - add Canada-specific keywords
      if (['banff', 'calgary', 'edmonton', 'nanaimo', 'revelstoke', 'squamish', 'vancouver', 
           'victoria', 'whistler', 'winnipeg', 'dieppe', 'saint-john', 'halifax', 'barrie', 
           'collingwood', 'ottawa', 'toronto', 'windsor', 'charlottetown', 'prince-edward-island', 
           'mont-tremblant', 'montreal', 'whitehorse'].includes(destinationId)) {
        seoKeywords.push('baby gear rental Canada', 'baby equipment rental Canada');
        // Add province-specific keywords for better SEO
        if (['banff', 'calgary', 'edmonton'].includes(destinationId)) {
          seoKeywords.push('baby equipment rental Alberta', 'baby gear rental Alberta');
        }
        if (['nanaimo', 'revelstoke', 'squamish', 'vancouver', 'victoria', 'whistler'].includes(destinationId)) {
          seoKeywords.push('baby equipment rental British Columbia', 'baby gear rental BC');
        }
        if (destinationId === 'winnipeg') {
          seoKeywords.push('baby equipment rental Manitoba', 'baby gear rental Manitoba');
        }
        if (['dieppe', 'saint-john'].includes(destinationId)) {
          seoKeywords.push('baby equipment rental New Brunswick', 'baby gear rental New Brunswick');
        }
        if (destinationId === 'halifax') {
          seoKeywords.push('baby equipment rental Nova Scotia', 'baby gear rental Nova Scotia');
        }
        if (['barrie', 'collingwood', 'ottawa', 'toronto', 'windsor'].includes(destinationId)) {
          seoKeywords.push('baby equipment rental Ontario', 'baby gear rental Ontario');
        }
        if (['charlottetown', 'prince-edward-island'].includes(destinationId)) {
          seoKeywords.push('baby equipment rental Prince Edward Island', 'baby gear rental PEI');
        }
        if (['mont-tremblant', 'montreal'].includes(destinationId)) {
          seoKeywords.push('baby equipment rental Quebec', 'baby gear rental Quebec');
        }
        if (destinationId === 'whitehorse') {
          seoKeywords.push('baby equipment rental Yukon', 'baby gear rental Yukon');
        }
      }
      // European destinations
      if (['barcelona', 'madrid', 'seville', 'mallorca'].includes(destinationId)) {
        seoKeywords.push('baby gear rental Spain', 'baby equipment rental Spain');
      }
      if (destinationId === 'lisbon') {
        seoKeywords.push('baby gear rental Portugal', 'baby equipment rental Portugal');
      }
      if (['liverpool', 'london'].includes(destinationId)) {
        seoKeywords.push('baby gear rental United Kingdom', 'baby equipment rental UK', 'baby equipment rental England');
      }
      if (destinationId === 'zurich') {
        seoKeywords.push('baby gear rental Switzerland', 'baby equipment rental Switzerland');
      }
      if (destinationId === 'stockholm') {
        seoKeywords.push('baby gear rental Sweden', 'baby equipment rental Sweden');
      }
      if (destinationId === 'krakow') {
        seoKeywords.push('baby gear rental Poland', 'baby equipment rental Poland');
      }
      // USA destinations - add USA-specific keywords
      if ([
        'birmingham', 'gulf-shores', 'huntsville', 'madison', 'mobile', 'montgomery', 'orange-beach',
        'anchorage', 'juneau', 'flagstaff', 'phoenix', 'prescott', 'scottsdale', 'sedona', 'tucson',
        'fayetteville', 'hot-springs', 'little-rock', 'los-angeles', 'san-francisco', 'san-diego',
        'sacramento', 'oakland', 'santa-barbara', 'santa-monica', 'palm-springs', 'lake-tahoe',
        'denver', 'colorado-springs', 'aspen', 'vail', 'breckenridge', 'boulder', 'estes-park',
        'miami', 'orlando', 'tampa', 'jacksonville', 'fort-lauderdale', 'key-west', 'key-largo',
        'naples', 'sarasota', 'st-petersburg', 'west-palm-beach', 'destin', 'pensacola', 'daytona-beach',
        'atlanta', 'savannah', 'honolulu', 'maui', 'kauai', 'oahu', 'chicago', 'new-orleans',
        'boston', 'cape-cod', 'las-vegas', 'reno', 'new-york-city', 'brooklyn', 'buffalo',
        'rochester', 'albany', 'syracuse', 'niagara-falls', 'charlotte', 'asheville', 'raleigh',
        'outer-banks', 'portland', 'bend', 'eugene', 'philadelphia', 'pittsburgh', 'houston',
        'dallas', 'austin', 'san-antonio', 'fort-worth', 'galveston', 'el-paso', 'salt-lake-city',
        'park-city', 'moab', 'zion-national-park', 'seattle', 'washington-dc'
      ].includes(destinationId)) {
        seoKeywords.push('baby gear rental USA', 'baby equipment rental United States', 'baby gear rental America');
        
        // Add state-specific keywords for major states
        if (['birmingham', 'gulf-shores', 'huntsville', 'madison', 'mobile', 'montgomery', 'orange-beach'].includes(destinationId)) {
          seoKeywords.push('baby equipment rental Alabama', 'baby gear rental AL');
        }
        if (['anchorage', 'juneau'].includes(destinationId)) {
          seoKeywords.push('baby equipment rental Alaska', 'baby gear rental AK');
        }
        if (['flagstaff', 'phoenix', 'prescott', 'scottsdale', 'sedona', 'tucson'].includes(destinationId)) {
          seoKeywords.push('baby equipment rental Arizona', 'baby gear rental AZ');
        }
        if (['los-angeles', 'san-francisco', 'san-diego', 'sacramento', 'oakland', 'santa-barbara', 'santa-monica', 'palm-springs', 'lake-tahoe'].includes(destinationId)) {
          seoKeywords.push('baby equipment rental California', 'baby gear rental CA');
        }
        if (['denver', 'colorado-springs', 'aspen', 'vail', 'breckenridge', 'boulder', 'estes-park'].includes(destinationId)) {
          seoKeywords.push('baby equipment rental Colorado', 'baby gear rental CO');
        }
        if (['miami', 'orlando', 'tampa', 'jacksonville', 'fort-lauderdale', 'key-west', 'key-largo', 'naples', 'sarasota', 'st-petersburg', 'west-palm-beach', 'destin', 'pensacola', 'daytona-beach'].includes(destinationId)) {
          seoKeywords.push('baby equipment rental Florida', 'baby gear rental FL');
        }
        if (['atlanta', 'savannah'].includes(destinationId)) {
          seoKeywords.push('baby equipment rental Georgia', 'baby gear rental GA');
        }
        if (['honolulu', 'maui', 'kauai', 'oahu'].includes(destinationId)) {
          seoKeywords.push('baby equipment rental Hawaii', 'baby gear rental HI');
        }
        if (destinationId === 'chicago') {
          seoKeywords.push('baby equipment rental Illinois', 'baby gear rental IL');
        }
        if (destinationId === 'new-orleans') {
          seoKeywords.push('baby equipment rental Louisiana', 'baby gear rental LA');
        }
        if (['boston', 'cape-cod'].includes(destinationId)) {
          seoKeywords.push('baby equipment rental Massachusetts', 'baby gear rental MA');
        }
        if (['las-vegas', 'reno'].includes(destinationId)) {
          seoKeywords.push('baby equipment rental Nevada', 'baby gear rental NV');
        }
        if (['new-york-city', 'brooklyn', 'buffalo', 'rochester', 'albany', 'syracuse', 'niagara-falls'].includes(destinationId)) {
          seoKeywords.push('baby equipment rental New York', 'baby gear rental NY');
        }
        if (['charlotte', 'asheville', 'raleigh', 'outer-banks'].includes(destinationId)) {
          seoKeywords.push('baby equipment rental North Carolina', 'baby gear rental NC');
        }
        if (['portland', 'bend', 'eugene'].includes(destinationId)) {
          seoKeywords.push('baby equipment rental Oregon', 'baby gear rental OR');
        }
        if (['philadelphia', 'pittsburgh'].includes(destinationId)) {
          seoKeywords.push('baby equipment rental Pennsylvania', 'baby gear rental PA');
        }
        if (['houston', 'dallas', 'austin', 'san-antonio', 'fort-worth', 'galveston', 'el-paso'].includes(destinationId)) {
          seoKeywords.push('baby equipment rental Texas', 'baby gear rental TX');
        }
        if (['salt-lake-city', 'park-city', 'moab', 'zion-national-park'].includes(destinationId)) {
          seoKeywords.push('baby equipment rental Utah', 'baby gear rental UT');
        }
        if (destinationId === 'seattle') {
          seoKeywords.push('baby equipment rental Washington', 'baby gear rental WA');
        }
        if (destinationId === 'washington-dc') {
          seoKeywords.push('baby equipment rental Washington DC', 'baby gear rental DC');
        }
      }

      const pageData = {
        destination_id: destinationId,
        hero_title: `Baby Equipment Rentals in ${destinationName}`,
        hero_description: heroDescription,
        hero_tagline: heroDescription,
        product_categories: productCategories,
        intro_text: 'Rates vary by provider and availability, and exclude taxes, delivery, and additional fees.',
        rates_note: 'Rates vary by provider and availability, and exclude taxes, delivery, and additional fees.',
        faqs: createDestinationFAQs(destinationId, destinationName),
        pricing_info: null, // Not displayed on page, so we skip it
        seo_title: `Baby Equipment Rentals in ${destinationName} | TopTours.ai`,
        seo_description: `Rent baby equipment in ${destinationName}: strollers, car seats, cribs, and more delivered to your hotel or vacation rental. Clean, safe, and insured gear from BabyQuip.`,
        seo_keywords: seoKeywords,
        is_active: true,
      };

      console.log(`🌱 Seeding ${destinationName} (${destinationId})...`);

      const { data, error } = await supabase
        .from('baby_equipment_rentals')
        .upsert({
          destination_id: destinationId,
          hero_title: pageData.hero_title || null,
          hero_description: pageData.hero_description || null,
          hero_tagline: pageData.hero_tagline || null,
          product_categories: pageData.product_categories ? JSON.parse(JSON.stringify(pageData.product_categories)) : null,
          intro_text: pageData.intro_text || null,
          rates_note: pageData.rates_note || null,
          faqs: pageData.faqs ? JSON.parse(JSON.stringify(pageData.faqs)) : null,
          pricing_info: pageData.pricing_info ? JSON.parse(JSON.stringify(pageData.pricing_info)) : null,
          seo_title: pageData.seo_title || null,
          seo_description: pageData.seo_description || null,
          seo_keywords: pageData.seo_keywords || null,
          is_active: pageData.is_active !== undefined ? pageData.is_active : true,
        }, {
          onConflict: 'destination_id',
        })
        .select()
        .single();

      if (error) {
        console.error(`❌ Error seeding ${destinationName}:`, error.message);
        errors.push({ destination: destinationName, error: error.message });
      } else {
        console.log(`✅ Successfully seeded ${destinationName}!`);
        results.push({ destination: destinationName, id: data.id });
      }
    } catch (error) {
      console.error(`❌ Error processing ${dest.name}:`, error.message);
      errors.push({ destination: dest.name, error: error.message });
    }
  }

  console.log('\n📊 Summary:');
  console.log(`✅ Successfully seeded: ${results.length} destinations`);
  console.log(`❌ Errors: ${errors.length} destinations`);
  
  if (results.length > 0) {
    console.log('\n✅ Seeded destinations:');
    results.forEach(r => console.log(`   - ${r.destination} (ID: ${r.id})`));
  }
  
  if (errors.length > 0) {
    console.log('\n❌ Failed destinations:');
    errors.forEach(e => console.log(`   - ${e.destination}: ${e.error}`));
    process.exit(1);
  }
  
  process.exit(0);
}

seedBatch();
