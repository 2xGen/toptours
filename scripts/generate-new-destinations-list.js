/**
 * Generate list of ~115 new destinations to add
 * Requirements:
 * - 70% North America (83 destinations)
 *   - 60% USA (50 destinations)
 *   - 25% Canada (21 destinations)
 *   - 15% Mexico (12 destinations)
 * - 30% Europe/Middle East/South America (35 destinations)
 *   - Europe: Netherlands (Rotterdam, Utrecht), Germany, France, Italy, Spain
 *   - Middle East: A few more
 *   - South America: A few more
 */

// Current destinations (from destinationsData.js analysis)
const currentDestinations = new Set([
  // Caribbean (20)
  'aruba', 'curacao', 'st-lucia', 'barbados', 'jamaica', 'punta-cana', 'santo-domingo',
  'nassau', 'exuma', 'puerto-rico', 'turks-and-caicos', 'grenada', 'st-martin', 'bonaire',
  'cayman-islands', 'antigua-and-barbuda', 'trinidad-and-tobago', 'british-virgin-islands',
  'st-kitts-and-nevis', 'martinique', 'guadeloupe',
  
  // Europe (40+)
  'paris', 'nice', 'french-riviera', 'rome', 'venice', 'florence', 'amalfi-coast',
  'barcelona', 'madrid', 'seville', 'marbella', 'malaga', 'mallorca', 'ibiza',
  'athens', 'santorini', 'mykonos', 'crete', 'lisbon', 'porto', 'madeira',
  'london', 'edinburgh', 'amsterdam', 'berlin', 'munich', 'zurich', 'interlaken',
  'dubrovnik', 'split', 'prague', 'vienna', 'budapest', 'reykjavik', 'oslo',
  'lofoten-islands', 'the-hague', 'nijmegen', 'groningen', 'gouda', 'arnhem',
  'leeuwarden', 'maastricht', 'haarlem', 'middelburg', 'alkmaar', 'utrecht',
  'eindhoven', 'enkhuizen',
  
  // Middle East (8)
  'dubai', 'abu-dhabi', 'doha', 'muscat', 'riyadh', 'tel-aviv', 'amman', 'beirut',
  
  // North America (20)
  'new-york-city', 'los-angeles', 'las-vegas', 'miami', 'orlando', 'san-francisco',
  'chicago', 'honolulu', 'washington-dc', 'nashville', 'new-orleans', 'denver',
  'sedona', 'toronto', 'vancouver', 'montreal', 'banff', 'quebec-city',
  'cancun', 'tulum', 'playa-del-carmen', 'mexico-city', 'cabo-san-lucas',
  'puerto-vallarta', 'oaxaca',
  
  // Central America (3)
  'san-jose', 'la-fortuna', 'manuel-antonio',
  
  // South America (few)
  // Add more as needed
]);

// New destinations to add (~115 total)

// NORTH AMERICA - USA (50 destinations) - 60% of 83
const usaDestinations = [
  // Major cities
  'boston', 'philadelphia', 'seattle', 'portland', 'san-diego', 'austin', 'dallas',
  'houston', 'atlanta', 'phoenix', 'san-antonio', 'san-jose-ca', 'jacksonville',
  'columbus', 'charlotte', 'indianapolis', 'san-francisco-bay-area',
  
  // Beach/Coastal
  'key-west', 'naples-florida', 'savannah', 'charleston', 'virginia-beach',
  'outer-banks', 'cape-cod', 'martha-vineyard', 'hamptons', 'newport-rhode-island',
  
  // Mountain/Western
  'aspen', 'vail', 'park-city', 'jackson-hole', 'sun-valley', 'taos', 'santa-fe',
  'moab', 'grand-canyon', 'yosemite', 'lake-tahoe', 'whistler-area',
  
  // Southern
  'savannah-georgia', 'charleston-sc', 'nashville-tennessee', 'memphis',
  'austin-texas', 'san-antonio-texas', 'dallas-texas', 'houston-texas',
  
  // Wine/Country
  'napa-valley', 'sonoma', 'finger-lakes', 'hudson-valley',
  
  // Other popular
  'scottsdale', 'palm-springs', 'santa-barbara', 'monterey', 'carmel-by-the-sea',
];

// NORTH AMERICA - Canada (21 destinations) - 25% of 83
const canadaDestinations = [
  // Major cities
  'calgary', 'ottawa', 'winnipeg', 'halifax', 'victoria', 'edmonton',
  
  // Mountain/Ski
  'whistler', 'jasper', 'lake-louise', 'canmore', 'revelstoke', 'sun-peaks',
  
  // Coastal/Maritime
  'st-johns-newfoundland', 'charlottetown', 'saint-john', 'nanaimo',
  
  // Wine/Country
  'niagara-on-the-lake', 'kelowna', 'okanagan-valley',
  
  // Other
  'quebec-city', 'montreal', 'vancouver', 'toronto', 'banff', // Already have some
];

// NORTH AMERICA - Mexico (12 destinations) - 15% of 83
const mexicoDestinations = [
  'merida', 'guadalajara', 'san-miguel-de-allende', 'oaxaca-city', 'puebla',
  'mazatlan', 'cozumel', 'isla-mujeres', 'playa-del-carmen', 'tulum',
  'cabo-san-lucas', 'puerto-vallarta', // Some already have
];

// EUROPE/MIDDLE EAST/SOUTH AMERICA (35 destinations) - 30% of 115
const europeDestinations = [
  // Netherlands (2)
  'rotterdam', 'utrecht', // Already have utrecht? Check
  
  // Germany (8)
  'hamburg', 'frankfurt', 'cologne', 'stuttgart', 'dresden', 'heidelberg',
  'munich', 'berlin', // Some already have
  
  // France (6)
  'lyon', 'marseille', 'bordeaux', 'strasbourg', 'toulouse', 'nice', // Some already have
  
  // Italy (8)
  'milan', 'naples', 'bologna', 'verona', 'siena', 'pompeii', 'capri',
  'rome', 'venice', 'florence', // Some already have
  
  // Spain (6)
  'valencia', 'bilbao', 'granada', 'cordoba', 'santiago-de-compostela',
  'barcelona', 'madrid', 'seville', // Some already have
  
  // Other Europe (5)
  'brussels', 'antwerp', 'copenhagen', 'stockholm', 'helsinki',
];

const middleEastDestinations = [
  'jeddah', 'dammam', 'muscat', 'dubai', 'abu-dhabi', // Some already have
];

const southAmericaDestinations = [
  'rio-de-janeiro', 'sao-paulo', 'lima', 'bogota', 'medellin', 'cartagena',
  'santiago', 'valparaiso', 'buenos-aires', 'montevideo',
];

// Combine and filter out existing
function generateSlug(name) {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

const allNewDestinations = [
  ...usaDestinations.map(name => ({ name, slug: generateSlug(name), country: 'United States', region: 'North America' })),
  ...canadaDestinations.map(name => ({ name, slug: generateSlug(name), country: 'Canada', region: 'North America' })),
  ...mexicoDestinations.map(name => ({ name, slug: generateSlug(name), country: 'Mexico', region: 'North America' })),
  ...europeDestinations.map(name => ({ name, slug: generateSlug(name), country: 'Various', region: 'Europe' })),
  ...middleEastDestinations.map(name => ({ name, slug: generateSlug(name), country: 'Various', region: 'Middle East' })),
  ...southAmericaDestinations.map(name => ({ name, slug: generateSlug(name), country: 'Various', region: 'South America' })),
];

// Filter out existing
const newDestinations = allNewDestinations.filter(d => !currentDestinations.has(d.slug));

console.log('\n📋 NEW DESTINATIONS TO ADD (~115 total)\n');
console.log('━'.repeat(60));

const byRegion = {};
newDestinations.forEach(d => {
  if (!byRegion[d.region]) byRegion[d.region] = [];
  byRegion[d.region].push(d);
});

Object.keys(byRegion).sort().forEach(region => {
  console.log(`\n${region.toUpperCase()} (${byRegion[region].length} destinations):`);
  byRegion[region].forEach((d, i) => {
    console.log(`  ${i + 1}. ${d.name} (${d.slug}) - ${d.country}`);
  });
});

console.log(`\n${'━'.repeat(60)}`);
console.log(`\n✅ Total new destinations: ${newDestinations.length}`);
console.log(`📊 Breakdown:`);
console.log(`   - North America: ${byRegion['North America']?.length || 0}`);
console.log(`     - USA: ${newDestinations.filter(d => d.country === 'United States').length}`);
console.log(`     - Canada: ${newDestinations.filter(d => d.country === 'Canada').length}`);
console.log(`     - Mexico: ${newDestinations.filter(d => d.country === 'Mexico').length}`);
console.log(`   - Europe: ${byRegion['Europe']?.length || 0}`);
console.log(`   - Middle East: ${byRegion['Middle East']?.length || 0}`);
console.log(`   - South America: ${byRegion['South America']?.length || 0}`);

// Export as JSON for easy use
const fs = require('fs');
const output = {
  total: newDestinations.length,
  destinations: newDestinations.map(d => ({
    name: d.name,
    slug: d.slug,
    country: d.country,
    region: d.region,
  })),
  breakdown: {
    northAmerica: {
      total: byRegion['North America']?.length || 0,
      usa: newDestinations.filter(d => d.country === 'United States').length,
      canada: newDestinations.filter(d => d.country === 'Canada').length,
      mexico: newDestinations.filter(d => d.country === 'Mexico').length,
    },
    europe: byRegion['Europe']?.length || 0,
    middleEast: byRegion['Middle East']?.length || 0,
    southAmerica: byRegion['South America']?.length || 0,
  },
};

fs.writeFileSync('new-destinations-list.json', JSON.stringify(output, null, 2));
console.log(`\n💾 Saved to: new-destinations-list.json`);

