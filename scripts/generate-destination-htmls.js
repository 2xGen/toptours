import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Import destinations data
const destinationsDataPath = path.join(__dirname, '../src/data/destinationsData.js');
const destinationsDataContent = fs.readFileSync(destinationsDataPath, 'utf8');

// Extract destinations array using regex
const destinationsMatch = destinationsDataContent.match(/export const destinations = (\[[\s\S]*?\]);/);
if (!destinationsMatch) {
  console.error('Could not find destinations data');
  process.exit(1);
}

// Evaluate the destinations array (safe since it's our own data)
const destinations = eval(destinationsMatch[1]);

// Create destinations directory if it doesn't exist
const destinationsDir = path.join(__dirname, '../destinations');
if (!fs.existsSync(destinationsDir)) {
  fs.mkdirSync(destinationsDir, { recursive: true });
}

// Generate HTML for each destination
destinations.forEach(destination => {
  const html = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${destination.seo.title}</title>
    <meta name="description" content="${destination.seo.description}">
    <meta name="keywords" content="${destination.seo.keywords}">
    
    <!-- Open Graph Meta Tags -->
    <meta property="og:title" content="${destination.seo.title}">
    <meta property="og:description" content="${destination.seo.description}">
    <meta property="og:image" content="${destination.imageUrl}">
    <meta property="og:url" content="https://toptours.ai/destinations/${destination.id}">
    <meta property="og:type" content="website">
    <meta property="og:site_name" content="TopTours AI">
    
    <!-- Twitter Card Meta Tags -->
    <meta name="twitter:card" content="summary_large_image">
    <meta name="twitter:title" content="${destination.seo.title}">
    <meta name="twitter:description" content="${destination.seo.description}">
    <meta name="twitter:image" content="${destination.imageUrl}">
    
    <!-- Additional Meta Tags -->
    <meta name="robots" content="index, follow">
    <meta name="author" content="TopTours AI">
    <link rel="canonical" href="https://toptours.ai/destinations/${destination.id}">
    
    <!-- Redirect to React app -->
    <script>
        window.location.href = '/destinations/${destination.id}';
    </script>
</head>
<body>
    <h1>${destination.fullName}</h1>
    <p>${destination.briefDescription}</p>
    <p>Redirecting to <a href="/destinations/${destination.id}">${destination.fullName} page</a>...</p>
</body>
</html>`;

  const filePath = path.join(destinationsDir, `${destination.id}.html`);
  fs.writeFileSync(filePath, html);
  console.log(`Generated: ${filePath}`);
});

console.log(`\n✅ Generated ${destinations.length} destination HTML files with Open Graph meta tags!`);
console.log(`📁 Files created in: ${destinationsDir}`);
console.log(`🌐 Each file includes:`);
console.log(`   - Open Graph meta tags for social sharing`);
console.log(`   - Twitter Card meta tags`);
console.log(`   - SEO meta tags`);
console.log(`   - Automatic redirect to React app`); 