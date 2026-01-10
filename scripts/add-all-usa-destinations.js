/**
 * Script to add all remaining USA destinations from BabyQuip list to check script
 * This generates the code to insert into check-babyquip-destinations.js
 */

import { readFileSync, writeFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Full list of USA destinations from user (all 500+)
const USA_DESTINATIONS_BY_STATE = {
  AL: ['Birmingham', 'Daphne', 'Dauphin Island', 'Fairhope', 'Gulf Shores', 'Hoover', 'Huntsville', 'Lineville', 'Madison', 'Mobile', 'Montgomery', 'Opelika', 'Orange Beach'],
  AK: ['Anchorage', 'Juneau', 'North Pole', 'Wasilla'],
  AZ: ['Buckeye', 'Chandler', 'Flagstaff', 'Gilbert', 'Glendale', 'Goodyear', 'Maricopa', 'Mesa', 'Peoria', 'Phoenix', 'Pine', 'Prescott', 'San Tan Valley', 'Scottsdale', 'Sedona', 'Show Low', 'Surprise', 'Tempe', 'Tucson', 'Williams'],
  AR: ['Bentonville', 'Fayetteville', 'Hot Springs', 'Jonesboro', 'Little Rock', 'Rogers', 'Springdale'],
  CA: ['Alameda', 'Anaheim', 'Azusa', 'Big Bear', 'Big Sur', 'Burbank', 'Carlsbad', 'Corona', 'Coronado', 'Coto de Caza', 'Disneyland', 'East Bay', 'El Cerrito', 'Eureka', 'Fairfield', 'Fremont', 'Fresno', 'Heavenly', 'Hermosa Beach', 'Hollister', 'Hollywood', 'Huntington Beach', 'Inland Empire', 'Irvine', 'Joshua Tree', 'Laguna Beach', 'Lake County', 'Lake Elsinore', 'Lake Tahoe', 'LAX', 'Lee Vining', 'Long Beach', 'Los Angeles', 'Los Gatos', 'Malibu', 'Mammoth Lakes', 'Manhattan Beach', 'Marin County', 'Modesto', 'Monterey', 'Murrieta', 'Napa', 'Newport Beach', 'North Lake Tahoe', 'Northstar', 'Oakhurst', 'Oakland', 'Oceanside', 'Ontario', 'Orange County', 'Palm Desert', 'Palm Springs', 'Palo Alto', 'Pasadena', 'Paso Robles', 'Petaluma', 'Rancho Palos Verdes', 'Redlands', 'Redwood City', 'Resort at Squaw Creek', 'Roseville', 'Sacramento', 'San Bernardino', 'San Bruno', 'San Diego', 'San Fernando Valley', 'San Francisco', 'San Francisco International Airport', 'San Gabriel Valley', 'San Jose', 'San Luis Obispo', 'San Mateo', 'San Ramon', 'Santa Ana', 'Santa Barbara', 'Santa Clarita', 'Santa Cruz', 'Santa Monica', 'Santa Rosa', 'Sea Ranch', 'Sherman Oaks', 'Solano County', 'Solvang', 'Sonoma', 'Sonora', 'South Bay', 'South Lake Tahoe', 'Squaw Creek', 'Stockton', 'Sunnyvale', 'Temecula', 'Thousand Oaks', 'Torrance', 'Ventura County', 'Visalia', 'Vista', 'Woodland Hills', 'Yosemite'],
  CO: ['Aspen', 'Aspen Highlands', 'Aspen Mountain', 'Aspen Snowmass', 'Aurora', 'Beaver Creek', 'Boulder', 'Breckenridge', 'Buena Vista', 'Buttermilk', 'Colorado Springs', 'Copper Mountain', 'Crested Butte', 'Denver', 'Dillon', 'Durango', 'Estes Park', 'Evergreen', 'Fort Collins', 'Frisco', 'Glenwood Springs', 'Golden', 'Granby', 'Grand Junction', 'Greeley', 'Gunnison', 'Keystone', 'Monte Vista', 'Montrose', 'Pagosa Springs', 'Silverthorne', 'Snowmass', 'Steamboat Springs', 'Sunlight Mountain', 'The Gant', 'Vail', 'Vail Mountain', 'Woodland Park'],
  CT: ['Bridgeport', 'Danbury', 'Greenwich', 'Hartford', 'New Haven', 'North Stonington', 'Norwalk', 'Stamford', 'Trumbull', 'Waterbury', 'Westbrook', 'Westport'],
  DE: ['Camden', 'Delaware Beaches', 'Dover', 'Lewes', 'Rehoboth Beach', 'Smyrna', 'Wilmington'],
  FL: ['30A', 'Amelia Island', 'Apollo Beach', 'Arcadia', 'Boca Raton', 'Boynton Beach', 'Bradenton', 'Cape Canaveral', 'Cape Coral', 'Clearwater', 'Clearwater Beach', 'Clermont', 'Cocoa Beach', 'Coconut Creek', 'Coral Springs', 'Daytona Beach', 'Deerfield Beach', 'Delray Beach', 'Destin', 'Disney World', 'Disneys Animal Kingdom', 'Epcot', 'Fernandina Beach', 'Fort Lauderdale', 'Fort Myers', 'Fort Walton Beach', 'Gainesville', 'Gulf Breeze', 'Hollywood', 'Islamorada', 'Jacksonville', 'Jupiter', 'Key Largo', 'Key West', 'Kissimmee', 'Lakeland', 'Magic Kingdom', 'Marathon', 'Marco Island', 'Melbourne', 'Miami', 'Miramar Beach', 'Naples', 'Navarre', 'North Port', 'Ocala', 'Okaloosa Island', 'Orlando', 'Palm Bay', 'Palm Beach', 'Palm Coast', 'Panama City Beach', 'Pensacola', 'Pensacola Beach', 'Pompano Beach', 'Port Charlotte', 'Port Saint Joe', 'Port St. Lucie', 'Punta Gorda', 'Sanibel Island', 'Santa Rosa Beach', 'Sarasota', 'Seminole', 'Siesta Key', 'Space Coast', 'Spring Hill', 'St. Augustine', 'St. George Island', 'St. Petersburg', 'Sunrise', 'Tallahassee', 'Tampa', 'The Panhandle', 'The Villages', 'Universal Studios', 'Venice', 'West Palm Beach', 'Winter Garden'],
  GA: ['Athens', 'Atlanta', 'Augusta', 'Blue Ridge', 'Columbus', 'Dahlonega', 'Golden Isles', 'Greensboro', 'Jekyll Island', 'Jesup', 'Lawrenceville', 'Macon', 'Martin', 'Ringgold', 'Rome', 'Savannah', 'St. Simons Island', 'Tybee Island'],
  HI: ['Hilo', 'Honolulu', 'Kailua', 'Kailua Kona', 'Kaneohe', 'Kapaa', 'Kauai', 'Kihei', 'Lahaina', 'Lihue', 'Maui', 'Oahu', 'The Big Island', 'Waikiki'],
  ID: ['Boise', 'Caldwell', "Coeur d'Alene", 'Driggs', 'Idaho Falls', 'McCall', 'Meridian', 'Nampa', 'Post Falls', 'Sandpoint', 'Sun Valley', 'Twin Falls', 'Victor'],
  IL: ['Aurora', 'Bloomington', 'Chicago', 'Elizabeth', 'Evanston', 'Joliet', 'Lake Zurich', 'Peoria', 'Springfield', 'Waukegan'],
  IN: ['Bloomington', 'Carmel', 'Evansville', 'Fishers', 'Fort Wayne', 'Gary', 'Hammond', 'Indianapolis', 'Lafayette', 'Noblesville', 'South Bend', 'West Lafayette'],
  IA: ['Ames', 'Ankeny', 'Cedar Rapids', 'Council Bluffs', 'Davenport', 'Des Moines'],
  KS: ['Fort Riley', 'Kansas City', 'Lawrence', 'Overland Park', 'Topeka', 'Wichita'],
  KY: ['Bowling Green', 'Covington', 'Dry Ridge', 'Fort Knox', 'Frankfort', 'Lexington', 'Louisville'],
  LA: ['Baton Rouge', 'Lafayette', 'Lake Charles', 'New Orleans', 'Shreveport'],
  ME: ['Acadia National Park', 'Augusta', 'Bangor', 'Bar Harbor', 'Brunswick', 'Cape Elizabeth', 'Kennebunkport', 'Lewiston', 'Portland', 'Sanford', 'Topsham', 'Wells', 'Winthrop', 'York'],
  MD: ['Annapolis', 'Baltimore', 'Bethesda', 'Bowie', 'Cambridge', 'Cockeysville', 'Columbia', 'Frederick', 'Gaithersburg', 'Germantown', 'Kent Island', 'Montgomery County', 'Ocean City', 'Rockville', 'Salisbury', 'Silver Spring', 'Towson', 'Waldorf'],
  MA: ['Barnstable', 'Boston', 'Brockton', 'Brookline', 'Cambridge', 'Cape Cod', 'Concord', 'Dedham', 'Gloucester', 'Kingston', 'Lenox', 'Lowell', "Martha's Vineyard", 'Nantucket', 'Pittsfield', 'Plymouth', 'Provincetown', 'Salem', 'Springfield', 'Stockbridge', 'Westford', 'Worcester'],
  MI: ['Ann Arbor', 'Dearborn', 'Detroit', 'Grand Rapids', 'Holland', 'Kalamazoo', 'Lansing', 'Lewiston', 'Muskegon', 'Saginaw', 'Saugatuck', 'South Haven', 'Traverse City'],
  MN: ['Brainerd', 'Chaska', 'Duluth', 'Eden Prairie', 'Minneapolis', 'Minnetonka', 'Rochester', 'St. Cloud', 'St. Paul', 'Twin Cities'],
  MS: ['Biloxi', 'Gulfport', 'Holly Springs', 'Jackson', 'Olive Branch', 'Oxford', 'Tunica', 'Tupelo'],
  MO: ['Branson', 'Columbia', 'Jefferson City', 'Joplin', 'Kansas City', 'Lake of the Ozarks', "Lee's Summit", 'St. Louis'],
  MT: ['Big Sky', 'Billings', 'Bozeman', 'Butte', 'Eureka', 'Glacier National Park', 'Kalispell', 'Missoula', 'Red Lodge', 'Whitefish'],
  NE: ['Bellevue', 'Lincoln', 'Ogallala', 'Omaha'],
  NV: ['Carson City', 'Henderson', 'Las Vegas', 'Reno'],
  NH: ['Center Conway', 'Concord', 'Derry', 'Dover', 'Hampton', 'Laconia', 'Lakes Region', 'Lincoln', 'Manchester', 'Merrimack', 'Nashua', 'North Country', 'Portsmouth', 'Rochester', 'Salem', 'Wolfeboro'],
  NJ: ['Asbury Park', 'Atlantic City', 'Bridgeton', 'Cape May', 'Cherry Hill', 'Edison', 'Elizabeth', 'Fair Lawn', 'Jersey City', 'Jersey Shore', 'Lakewood', 'Long Beach Island', 'Madison', 'Montclair', 'Newark', 'Ocean City', 'Paramus', 'Paterson', 'Seaside Heights', 'Toms River', 'Trenton', 'Wildwood', 'Woodbridge'],
  NM: ['Albuquerque', 'Corrales', 'Las Cruces', 'Santa Fe', 'Taos'],
  NY: ['Albany', 'Batavia', 'Boonville', 'Bronx', 'Brookhaven', 'Brooklyn', 'Buffalo', 'Canandaigua', 'Catskill', 'Cooperstown', 'Cornwallville', 'East Hampton', 'Farmington', 'Geneva', 'Hamptons', 'Hempstead', 'Horseheads', 'Hudson', 'Islip', 'Ithaca', 'JFK Airport', 'Jones Beach', 'Kingston', 'Lake George', 'Lake Placid', 'Long Island', 'Manhattan', 'Milford', 'Montauk', 'Nassau', 'New City', 'New York', 'Niagara Falls', 'Oyster Bay', 'Poughkeepsie', 'Prattsburgh', 'Queens', 'Rochester', 'Saratoga Springs', 'Schenectady', 'Southampton', 'Staten Island', 'Syracuse', 'Troy', 'Ulster Park', 'Utica', 'Warwick', 'Windham', 'Woodstock', 'Yonkers'],
  NC: ['Asheville', 'Atlantic Beach', 'Blowing Rock', 'Boone', 'Burlington', 'Carolina Beach', 'Cary', 'Charlotte', 'Corolla', 'Duck', 'Durham', 'Emerald Isle', 'Fayetteville', 'Fort Bragg', 'Great Smoky Mountains National Park', 'Greensboro', 'Kill Devil Hills', 'Kitty Hawk', 'Lake Lure', 'Morrisville', 'Nags Head', 'New Bern', 'Outer Banks', 'Pinehurst', 'Raleigh', 'Sneads Ferry', 'Surf City', 'Topsail Island', 'Wilmington', 'Winston-Salem', 'Wrightsville Beach'],
  ND: ['Bismarck', 'Fargo', 'Minot'],
  OH: ['Akron', 'Canton', 'Cincinnati', 'Cleveland', 'Columbus', 'Dayton', 'Kings Island', 'Toledo', 'Youngstown'],
  OK: ['Broken Arrow', 'Edmond', 'Enid', 'Lawton', 'Norman', 'Oklahoma City', 'Tulsa'],
  OR: ['Albany', 'Ashland', 'Astoria', 'Bend', 'Central Point', 'Corvallis', 'Eugene', 'Grants Pass', 'Lincoln City', 'Medford', 'Portland', 'Roseburg', 'Salem', 'Springfield', 'Sunriver'],
  PA: ['Allentown', 'Altoona', 'Amity', 'Bethlehem', 'Chambersburg', 'Erie', 'Gettysburg', 'Harrisburg', 'Hershey', 'Johnstown', 'Lancaster', 'Latrobe', 'New Derry', 'Philadelphia', 'Pittsburgh', 'Reading', 'State College', 'The Poconos', 'Wilkes-Barre', 'York'],
  RI: ['Cranston', 'Narragansett', 'Newport', 'Pawtucket', 'Providence', 'Warwick', 'Woonsocket'],
  SC: ['Beaufort', 'Charleston', 'Columbia', 'Edisto Island', 'Greenville', 'Hilton Head', 'Mount Pleasant', 'Myrtle Beach', 'Spartanburg', 'Walterboro', 'Wild Dunes'],
  SD: ['Brookings', 'Rapid City', 'Sioux Falls', 'Spearfish'],
  TN: ['Bristol', 'Chattanooga', 'Clarksville', 'Gatlinburg', 'Johnson City', 'Kingsport', 'Knoxville', 'Memphis', 'Nashville', 'Pigeon Forge', 'Sevierville'],
  TX: ['Abilene', 'Amarillo', 'Arlington', 'Austin', 'Brownsville', 'College Station', 'Corpus Christi', 'Dallas', 'Dripping Springs', 'El Paso', 'Fort Worth', 'Galveston', 'Garland', 'Houston', 'Irving', 'Killeen', 'Lakeway', 'Laredo', 'Lubbock', 'McAllen', 'McKinney', 'Mineral Wells', 'New Braunfels', 'Plano', 'Port Aransas', 'San Antonio', 'South Padre Island', 'Spicewood', 'The Woodlands', 'Tyler', 'Waco'],
  UT: ['Alta Ski Area', 'Brighton Ski Resort', 'Cedar City', 'Clinton', 'Deer Valley Resort', 'Moab', 'Newpark Resort', 'Ogden', 'Orem', 'Park City', 'Park City Mountain Resort', 'Provo', 'Salt Lake City', 'Snowbird', 'Solitude Mountain Resort', 'St. George', 'Zion National Park'],
  VT: ['Brattleboro', 'Burlington', 'Essex', 'Killington', 'Montpelier', 'Northfield', 'Stowe', 'Stratton', 'Waterford'],
  VA: ['Alexandria', 'Arlington', 'Bristol', 'Charlottesville', 'Chesapeake', 'Chincoteague Island', 'Fairfax', 'Fredricksburg', 'Hampton Roads', 'Lynchburg', 'Manassas', 'Massanutten', 'Newport News', 'Norfolk', 'Reston', 'Richmond', 'Roanoke', 'Stafford', 'Suffolk', 'Virginia Beach', 'Williamsburg', 'Yorktown'],
  WA: ['Bellevue', 'Bellingham', 'Bremerton', 'Chelan', 'Cle Elum', 'Everett', 'Grand Mound', 'Kennewick', 'Kent', 'Leavenworth', 'Long Beach', 'Monroe', 'Moses Lake', 'Mukilteo', 'Ocean Shores', 'Port Angeles', 'Port Orchard', 'Port Townsend', 'Redmond', 'Seattle', 'Skagit Valley', 'Snoqualmie', 'Spokane', 'Suncadia', 'Tacoma', 'Vancouver', 'Vashon Island', 'Walla Walla', 'Wenatchee', 'Whidbey Island', 'White Salmon'],
  DC: ['Washington'],
  WV: ['Charleston', 'Harpers Ferry', 'Huntington', 'Morgantown', 'Wheeling'],
  WI: ['Appleton', 'Baraboo', 'Door County', 'Eau Claire', 'Elkhart Lake', 'Green Bay', 'Janesville', 'Kenosha', 'La Crosse', 'Lake Geneva', "Land O' Lakes", 'Madison', 'Milwaukee', 'Oshkosh', 'Racine', 'Sheboygan', 'Sturgeon Bay', 'Tomahawk', 'Waukesha', 'Waupaca', 'Wausau', 'Wisconsin Dells'],
  WY: ['Casper', 'Cheyenne', 'Jackson', 'Jackson Hole', 'Laramie', 'Te']
};

// Helper function to generate slug from name
function generateSlug(name) {
  return name
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim();
}

// Helper to handle special cases (altSlug, etc.)
function getDestinationEntry(name, state) {
  const baseSlug = generateSlug(name);
  const entry = {
    name,
    country: 'United States',
    searchSlug: baseSlug,
    state
  };
  
  // Handle special cases for duplicate names
  if (name === 'San Jose' && state === 'CA') {
    entry.searchSlug = 'san-jose-california';
    entry.altSlug = 'san-jose';
  } else if (name === 'LAX' && state === 'CA') {
    entry.searchSlug = 'los-angeles-airport';
    entry.altSlug = 'los-angeles';
  } else if (name === 'San Francisco International Airport' && state === 'CA') {
    entry.searchSlug = 'san-francisco-airport';
    entry.altSlug = 'san-francisco';
  } else if (name === 'Ontario' && state === 'CA') {
    entry.searchSlug = 'ontario-ca';
    entry.altSlug = 'ontario';
  } else if (name === 'Monterey' && state === 'CA') {
    entry.searchSlug = 'monterey-california';
    entry.altSlug = 'monterey';
  } else if (name === 'North Lake Tahoe' && state === 'CA') {
    entry.searchSlug = 'north-lake-tahoe';
    entry.altSlug = 'lake-tahoe';
  } else if (name === 'South Lake Tahoe' && state === 'CA') {
    entry.searchSlug = 'south-lake-tahoe';
    entry.altSlug = 'lake-tahoe';
  } else if (name === 'New York' && state === 'NY') {
    entry.searchSlug = 'new-york-city';
    entry.altSlug = 'new-york';
  } else if (name === 'Rochester' && state === 'NY') {
    entry.searchSlug = 'rochester-ny';
    entry.altSlug = 'rochester';
  } else if (name === 'Albany' && state === 'NY') {
    entry.searchSlug = 'albany-ny';
    entry.altSlug = 'albany';
  } else if (name === 'Portland' && state === 'OR') {
    entry.searchSlug = 'portland-oregon';
    entry.altSlug = 'portland';
  } else if (name === 'Albany' && state === 'OR') {
    entry.searchSlug = 'albany-oregon';
    entry.altSlug = 'albany';
  } else if (name === 'Rochester' && state === 'MN') {
    entry.searchSlug = 'rochester-mn';
    entry.altSlug = 'rochester';
  } else if (name === 'Albany' && state === 'OR') {
    entry.searchSlug = 'albany-oregon';
    entry.altSlug = 'albany';
  } else if (name === 'Portland' && state === 'ME') {
    entry.searchSlug = 'portland-maine';
    entry.altSlug = 'portland';
  } else if (name === 'Madison' && state === 'AL') {
    entry.searchSlug = 'madison-alabama';
    entry.altSlug = 'madison';
  } else if (name === 'Washington' && state === 'DC') {
    entry.searchSlug = 'washington-dc';
    entry.altSlug = 'washington';
  }
  
  // Handle Aspen variations
  if (['Aspen Highlands', 'Aspen Mountain', 'Aspen Snowmass', 'Buttermilk', 'Snowmass', 'The Gant'].includes(name)) {
    entry.altSlug = 'aspen';
  }
  
  // Handle Vail variations
  if (name === 'Vail Mountain') {
    entry.altSlug = 'vail';
  }
  
  return entry;
}

// Generate all USA destinations
const allUSADestinations = [];
for (const [state, cities] of Object.entries(USA_DESTINATIONS_BY_STATE)) {
  for (const city of cities) {
    if (city.trim() && city !== 'Te') { // Skip empty or invalid entries
      allUSADestinations.push(getDestinationEntry(city, state));
    }
  }
}

// Read the check script
const checkScriptPath = join(__dirname, 'check-babyquip-destinations.js');
let checkScript = readFileSync(checkScriptPath, 'utf8');

// Find the position to insert (before the closing bracket of BABYQUIP_DESTINATIONS array)
const insertionMarker = '  // Note: Due to the extremely large number of USA destinations (500+), I\'m starting with major tourist destinations.\n  // We can add the remaining cities in batches after checking which ones have destination pages.\n];';

// Generate the code to insert
const codeToInsert = allUSADestinations
  .filter(dest => {
    // Skip if already exists in the file
    const existingPattern = new RegExp(`searchSlug: ['"]${dest.searchSlug.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}['"]`);
    return !existingPattern.test(checkScript);
  })
  .map(dest => {
    let line = `  { name: '${dest.name.replace(/'/g, "\\'")}', country: 'United States', searchSlug: '${dest.searchSlug}', state: '${dest.state}' }`;
    if (dest.altSlug) {
      line = line.replace('}', `, altSlug: '${dest.altSlug}' }`);
    }
    return line;
  })
  .join(',\n');

// Insert the new destinations
if (codeToInsert) {
  const replacement = `${codeToInsert},\n\n  ${insertionMarker}`;
  checkScript = checkScript.replace(insertionMarker, replacement);
  writeFileSync(checkScriptPath, checkScript, 'utf8');
  console.log(`✅ Added ${codeToInsert.split(',').length} USA destinations to check script`);
} else {
  console.log('ℹ️  All USA destinations already exist in check script');
}

console.log(`📊 Total USA destinations in script: ${allUSADestinations.length}`);
