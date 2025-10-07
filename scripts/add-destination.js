import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Function to generate destination data based on Aruba template
const generateDestinationData = (name, imageUrl, category = 'Other') => {
  const id = name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
  
  return {
    id: id,
    name: name,
    fullName: name,
    category: category,
    briefDescription: `Discover the magic of ${name} with unforgettable experiences and adventures. From cultural treasures to natural wonders, ${name} offers something for every traveler.`,
    heroDescription: `Welcome to ${name}, where adventure meets discovery and every moment becomes a memory. Whether you're exploring historic sites, enjoying local cuisine, or immersing yourself in the culture, ${name} promises an extraordinary journey. Let our AI-powered planner help you uncover the best experiences this destination has to offer.`,
    imageUrl: imageUrl,
    tourCategories: [
      'Cultural Tours',
      'Adventure Tours',
      'Food & Wine Tours',
      'Historical Tours',
      'Nature Tours',
      'City Tours'
    ],
    seo: {
      title: `${name} Tours & Excursions - Top-Rated Activities & Adventures`,
      description: `Discover top-rated ${name} tours, excursions, and activities powered by AI. From cultural experiences to adventure activities, find the perfect way to explore ${name}.`,
      keywords: `${name} tours, ${name} excursions, ${name} activities, ${name} experiences, things to do in ${name}`,
      primaryKeyword: `${name} tours`,
      secondaryKeywords: [
        `${name} excursions`,
        `${name} activities`,
        `${name} experiences`,
        `${name} sightseeing`,
        `${name} adventures`,
        `Things to do in ${name}`
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
      weather: `${name} offers a variety of weather conditions throughout the year, making it an interesting destination to visit in different seasons.`,
      bestMonths: 'Spring and fall typically offer the best combination of pleasant weather and fewer crowds.',
      peakSeason: 'Summer months bring peak tourist season with higher prices but perfect weather for outdoor activities.',
      offSeason: 'Winter months offer lower prices and a more authentic local experience.'
    },
    gettingAround: 'Public transportation is readily available, or you can rent a car for maximum flexibility. Many tours include hotel pickup and drop-off.',
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
const updateDestinationsData = (newDestination) => {
  const dataPath = path.join(__dirname, '../src/data/destinationsData.js');
  let content = fs.readFileSync(dataPath, 'utf8');
  
  // Find the end of the destinations array (before the closing bracket)
  const insertIndex = content.lastIndexOf(']');
  if (insertIndex === -1) {
    throw new Error('Could not find destinations array in destinationsData.js');
  }
  
  // Add the new destination before the closing bracket
  const newDestinationString = `,\n  ${JSON.stringify(newDestination, null, 2)}`;
  content = content.slice(0, insertIndex) + newDestinationString + content.slice(insertIndex);
  
  fs.writeFileSync(dataPath, content);
  console.log(`✅ Added ${newDestination.name} to destinationsData.js`);
};

// Function to update .htaccess for the new destination
const updateHtaccess = (destinationId) => {
  const htaccessPath = path.join(__dirname, '../.htaccess');
  let content = fs.readFileSync(htaccessPath, 'utf8');
  
  // Add the new destination route
  const newRoute = `RewriteRule ^${destinationId}$ /${destinationId}.html [L]\n`;
  
  // Insert after the existing RewriteRule for aruba
  const insertIndex = content.indexOf('RewriteRule ^aruba$ /aruba.html [L]') + 'RewriteRule ^aruba$ /aruba.html [L]'.length;
  content = content.slice(0, insertIndex) + '\n' + newRoute + content.slice(insertIndex);
  
  fs.writeFileSync(htaccessPath, content);
  console.log(`✅ Added ${destinationId} route to .htaccess`);
};

// Function to update dist/.htaccess as well
const updateDistHtaccess = (destinationId) => {
  const distHtaccessPath = path.join(__dirname, '../dist/.htaccess');
  if (fs.existsSync(distHtaccessPath)) {
    let content = fs.readFileSync(distHtaccessPath, 'utf8');
    
    // Add the new destination route
    const newRoute = `RewriteRule ^${destinationId}$ /destinations/${destinationId}.html [L]\n`;
    
    // Insert after the existing RewriteRule for aruba
    const insertIndex = content.indexOf('RewriteRule ^aruba$ /destinations/aruba.html [L]') + 'RewriteRule ^aruba$ /destinations/aruba.html [L]'.length;
    content = content.slice(0, insertIndex) + '\n' + newRoute + content.slice(insertIndex);
    
    fs.writeFileSync(distHtaccessPath, content);
    console.log(`✅ Added ${destinationId} route to dist/.htaccess`);
  }
};

// Main function to add a destination
const addDestination = (name, imageUrl, category = 'Other') => {
  try {
    console.log(`\n🚀 Adding destination: ${name}`);
    console.log(`📸 Image URL: ${imageUrl}`);
    console.log(`🏷️  Category: ${category}`);
    
    // Generate destination data
    const destination = generateDestinationData(name, imageUrl, category);
    
    // Update destinationsData.js
    updateDestinationsData(destination);
    
    // Update .htaccess files
    updateHtaccess(destination.id);
    updateDistHtaccess(destination.id);
    
    console.log(`\n✅ Successfully added ${name}!`);
    console.log(`\n📋 Next steps:`);
    console.log(`1. Run 'npm run build' to generate the static HTML file`);
    console.log(`2. Test the page at http://localhost:5173/${destination.id}`);
    console.log(`3. Customize the destination data in src/data/destinationsData.js if needed`);
    
    return destination;
  } catch (error) {
    console.error('❌ Error adding destination:', error.message);
    throw error;
  }
};

// CLI interface
if (process.argv.length < 4) {
  console.log('\n📝 Usage: node scripts/add-destination.js "Destination Name" "Image URL" [Category]');
  console.log('\n📋 Example:');
  console.log('node scripts/add-destination.js "Paris" "https://example.com/paris.jpg" "Europe"');
  console.log('node scripts/add-destination.js "Tokyo" "https://example.com/tokyo.jpg" "Asia-Pacific"');
  console.log('\n🏷️  Available categories: Europe, North America, Caribbean, Asia-Pacific, Africa, South America, Other');
  process.exit(1);
}

const name = process.argv[2];
const imageUrl = process.argv[3];
const category = process.argv[4] || 'Other';

addDestination(name, imageUrl, category); 