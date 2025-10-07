import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Function to generate country data
const generateCountryData = (countryName, imageUrl, category = 'Other', destinations = []) => {
  const id = countryName.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
  
  return {
    id: id,
    name: countryName,
    fullName: countryName,
    category: category,
    isCountry: true,
    destinations: destinations,
    briefDescription: `Discover the diverse beauty of ${countryName} with multiple incredible destinations to explore. From pristine beaches to historic cities, ${countryName} offers unforgettable experiences for every traveler.`,
    heroDescription: `Welcome to ${countryName}, a country rich in culture, history, and natural beauty. With multiple world-class destinations to choose from, each offering unique experiences and attractions. Let our AI-powered planner help you discover the best destinations and experiences this amazing country has to offer.`,
    imageUrl: imageUrl,
    tourCategories: [
      'Beach Tours',
      'Cultural Tours',
      'Adventure Tours',
      'Historical Tours',
      'Nature Tours',
      'City Tours'
    ],
    seo: {
      title: `${countryName} Tours & Destinations - Top-Rated Activities & Adventures`,
      description: `Discover top-rated ${countryName} tours, destinations, and activities powered by AI. Explore multiple incredible locations with personalized recommendations.`,
      keywords: `${countryName} tours, ${countryName} destinations, ${countryName} travel, ${countryName} activities, things to do in ${countryName}`,
      primaryKeyword: `${countryName} tours`,
      secondaryKeywords: [
        `${countryName} destinations`,
        `${countryName} travel`,
        `${countryName} activities`,
        `${countryName} vacation`,
        `${countryName} holidays`,
        `Things to do in ${countryName}`
      ]
    },
    whyVisit: [
      'Multiple world-class destinations in one country',
      'Diverse landscapes from beaches to mountains',
      'Rich cultural heritage and authentic experiences',
      'Excellent value for money and accessibility',
      'Year-round perfect weather for outdoor activities',
      'Friendly locals and warm hospitality'
    ],
    bestTimeToVisit: {
      weather: `${countryName} offers excellent weather throughout most of the year, with tropical conditions perfect for outdoor activities and beach vacations.`,
      bestMonths: 'December to April offers the best combination of weather and fewer crowds.',
      peakSeason: 'December to April brings peak tourist season with higher prices but perfect weather.',
      offSeason: 'May to November offers lower prices and still excellent weather for most activities.'
    },
    gettingAround: 'Domestic flights, buses, and organized tours connect the major destinations. Many resorts offer airport transfers and local transportation.',
    highlights: [
      'Multiple world-class destinations to explore',
      'Diverse natural landscapes and ecosystems',
      'Rich cultural heritage and historical sites',
      'Excellent beaches and water activities',
      'Authentic local cuisine and dining experiences',
      'Adventure activities and outdoor recreation'
    ]
  };
};

// Function to generate individual destination data
const generateDestinationData = (destinationName, imageUrl, countryName, category = 'Other') => {
  const id = destinationName.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
  
  return {
    id: id,
    name: destinationName,
    fullName: destinationName,
    category: category,
    country: countryName,
    briefDescription: `Discover the magic of ${destinationName}, one of ${countryName}'s most popular destinations. From stunning landscapes to rich culture, ${destinationName} offers unforgettable experiences.`,
    heroDescription: `Welcome to ${destinationName}, a premier destination in ${countryName} that combines natural beauty with authentic experiences. Whether you're seeking adventure, relaxation, or cultural immersion, ${destinationName} promises an extraordinary journey. Let our AI-powered planner help you discover the best experiences this destination has to offer.`,
    imageUrl: imageUrl,
    tourCategories: [
      'Cultural Tours',
      'Adventure Tours',
      'Beach Tours',
      'Historical Tours',
      'Nature Tours',
      'City Tours'
    ],
    seo: {
      title: `${destinationName} Tours & Excursions - Top-Rated Activities & Adventures`,
      description: `Discover top-rated ${destinationName} tours, excursions, and activities powered by AI. From cultural experiences to adventure activities, find the perfect way to explore ${destinationName}.`,
      keywords: `${destinationName} tours, ${destinationName} excursions, ${destinationName} activities, ${destinationName} experiences, things to do in ${destinationName}`,
      primaryKeyword: `${destinationName} tours`,
      secondaryKeywords: [
        `${destinationName} excursions`,
        `${destinationName} activities`,
        `${destinationName} experiences`,
        `${destinationName} sightseeing`,
        `${destinationName} adventures`,
        `Things to do in ${destinationName}`
      ]
    },
    whyVisit: [
      'Rich cultural heritage and authentic experiences',
      'Stunning natural landscapes and scenic beauty',
      'Diverse range of activities for all interests',
      'Friendly locals and warm hospitality',
      'Excellent cuisine and dining experiences',
      'Safe and welcoming environment for travelers'
    ],
    bestTimeToVisit: {
      weather: `${destinationName} enjoys excellent weather throughout most of the year, making it a great destination to visit in any season.`,
      bestMonths: 'December to April offers the best combination of weather and fewer crowds.',
      peakSeason: 'December to April brings peak tourist season with higher prices but perfect weather.',
      offSeason: 'May to November offers lower prices and still excellent weather for most activities.'
    },
    gettingAround: 'Local transportation is readily available, or you can rent a car for maximum flexibility. Many tours include hotel pickup and drop-off.',
    highlights: [
      'Historic landmarks and cultural sites',
      'Natural wonders and scenic viewpoints',
      'Local markets and shopping districts',
      'Traditional restaurants and cafes',
      'Parks and outdoor recreation areas',
      'Museums and cultural institutions'
    ]
  };
};

// Function to update destinationsData.js
const updateDestinationsData = (newEntries) => {
  const dataPath = path.join(__dirname, '../src/data/destinationsData.js');
  let content = fs.readFileSync(dataPath, 'utf8');
  
  // Find the end of the destinations array (before the closing bracket)
  const insertIndex = content.lastIndexOf(']');
  if (insertIndex === -1) {
    throw new Error('Could not find destinations array in destinationsData.js');
  }
  
  // Add the new entries before the closing bracket
  const newEntriesString = newEntries.map(entry => `,\n  ${JSON.stringify(entry, null, 2)}`).join('');
  content = content.slice(0, insertIndex) + newEntriesString + content.slice(insertIndex);
  
  fs.writeFileSync(dataPath, content);
  console.log(`✅ Added ${newEntries.length} entries to destinationsData.js`);
};

// Function to update .htaccess for the new routes
const updateHtaccess = (routes) => {
  const htaccessPath = path.join(__dirname, '../.htaccess');
  let content = fs.readFileSync(htaccessPath, 'utf8');
  
  // Add the new routes
  const newRoutes = routes.map(route => `RewriteRule ^${route}$ /${route}.html [L]`).join('\n');
  
  // Insert after the existing RewriteRule for aruba
  const insertIndex = content.indexOf('RewriteRule ^aruba$ /aruba.html [L]') + 'RewriteRule ^aruba$ /aruba.html [L]'.length;
  content = content.slice(0, insertIndex) + '\n' + newRoutes + content.slice(insertIndex);
  
  fs.writeFileSync(htaccessPath, content);
  console.log(`✅ Added routes to .htaccess`);
};

// Function to update dist/.htaccess as well
const updateDistHtaccess = (routes) => {
  const distHtaccessPath = path.join(__dirname, '../dist/.htaccess');
  if (fs.existsSync(distHtaccessPath)) {
    let content = fs.readFileSync(distHtaccessPath, 'utf8');
    
    // Add the new routes
    const newRoutes = routes.map(route => `RewriteRule ^${route}$ /destinations/${route}.html [L]`).join('\n');
    
    // Insert after the existing RewriteRule for aruba
    const insertIndex = content.indexOf('RewriteRule ^aruba$ /destinations/aruba.html [L]') + 'RewriteRule ^aruba$ /destinations/aruba.html [L]'.length;
    content = content.slice(0, insertIndex) + '\n' + newRoutes + content.slice(insertIndex);
    
    fs.writeFileSync(distHtaccessPath, content);
    console.log(`✅ Added routes to dist/.htaccess`);
  }
};

// Main function to add a country with destinations
const addCountryWithDestinations = (countryName, countryImageUrl, category, destinations) => {
  try {
    console.log(`\n🚀 Adding country: ${countryName}`);
    console.log(`📸 Country Image URL: ${countryImageUrl}`);
    console.log(`🏷️  Category: ${category}`);
    console.log(`📍 Destinations: ${destinations.map(d => d.name).join(', ')}`);
    
    // Generate country data
    const country = generateCountryData(countryName, countryImageUrl, category, destinations.map(d => d.name));
    
    // Generate destination data for each destination
    const destinationEntries = destinations.map(dest => 
      generateDestinationData(dest.name, dest.imageUrl, countryName, category)
    );
    
    // Combine all entries
    const allEntries = [country, ...destinationEntries];
    
    // Update destinationsData.js
    updateDestinationsData(allEntries);
    
    // Update .htaccess files
    const routes = allEntries.map(entry => entry.id);
    updateHtaccess(routes);
    updateDistHtaccess(routes);
    
    console.log(`\n✅ Successfully added ${countryName} with ${destinations.length} destinations!`);
    console.log(`\n📋 Next steps:`);
    console.log(`1. Run 'npm run build' to generate the static HTML files`);
    console.log(`2. Test the country page at http://localhost:5173/${country.id}`);
    console.log(`3. Test destination pages at:`);
    destinationEntries.forEach(dest => {
      console.log(`   - http://localhost:5173/${dest.id}`);
    });
    console.log(`4. Customize the destination data in src/data/destinationsData.js if needed`);
    
    return { country, destinations: destinationEntries };
  } catch (error) {
    console.error('❌ Error adding country with destinations:', error.message);
    throw error;
  }
};

// CLI interface
if (process.argv.length < 4) {
  console.log('\n📝 Usage: node scripts/add-country-with-destinations.js "Country Name" "Country Image URL" "Category" "Destination1:ImageURL1" "Destination2:ImageURL2" ...');
  console.log('\n📋 Example:');
  console.log('node scripts/add-country-with-destinations.js "Dominican Republic" "https://example.com/dr.jpg" "Caribbean" "Punta Cana:https://example.com/punta-cana.jpg" "Santo Domingo:https://example.com/santo-domingo.jpg"');
  console.log('\n🏷️  Available categories: Europe, North America, Caribbean, Asia-Pacific, Africa, South America, Other');
  process.exit(1);
}

const countryName = process.argv[2];
const countryImageUrl = process.argv[3];
const category = process.argv[4] || 'Other';

// Parse destinations from command line arguments
const destinations = [];
for (let i = 5; i < process.argv.length; i++) {
  const [destName, destImageUrl] = process.argv[i].split(':');
  if (destName && destImageUrl) {
    destinations.push({ name: destName, imageUrl: destImageUrl });
  }
}

if (destinations.length === 0) {
  console.log('❌ Error: No destinations provided. Please provide destinations in format "Name:ImageURL"');
  process.exit(1);
}

addCountryWithDestinations(countryName, countryImageUrl, category, destinations); 