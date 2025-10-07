import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Import your destinations data
import { getAllDestinations } from '../src/data/destinationsData.js';

// HTML template for destination pages
const createDestinationHTML = (destination) => {
  return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>${destination.seo.title}</title>
    <meta name="description" content="${destination.seo.description}" />
    <meta name="keywords" content="${destination.seo.keywords}" />
    
    <!-- Open Graph -->
    <meta property="og:title" content="${destination.seo.title}" />
    <meta property="og:description" content="${destination.seo.description}" />
    <meta property="og:type" content="website" />
    <meta property="og:url" content="https://toptours.ai/destinations/${destination.id}" />
    <meta property="og:image" content="${destination.imageUrl || 'https://ouqeoizufbofdqbuiwvx.supabase.co/storage/v1/object/public/destinations//TopTours-Featured_image.jpg'}" />
    <meta property="og:image:width" content="1200" />
    <meta property="og:image:height" content="630" />
    <meta property="og:site_name" content="TopTours.ai" />
    <meta property="og:locale" content="en_US" />
    <meta property="og:image:alt" content="${destination.fullName} - Tours and Activities" />
    
    <!-- Twitter Card -->
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content="${destination.seo.title}" />
    <meta name="twitter:description" content="${destination.seo.description}" />
    <meta name="twitter:image" content="${destination.imageUrl || 'https://ouqeoizufbofdqbuiwvx.supabase.co/storage/v1/object/public/destinations//TopTours-Featured_image.jpg'}" />
    <meta name="twitter:image:alt" content="${destination.fullName} - Tours and Activities" />
    
    <!-- Structured Data -->
    <script type="application/ld+json">
    {
      "@context": "https://schema.org",
      "@type": "TouristDestination",
      "name": "${destination.fullName}",
      "description": "${destination.seo.description}",
      "image": "${destination.imageUrl || 'https://ouqeoizufbofdqbuiwvx.supabase.co/storage/v1/object/public/destinations//TopTours-Featured_image.jpg'}",
      "url": "https://toptours.ai/destinations/${destination.id}",
      "geo": {
        "@type": "GeoCoordinates",
        "latitude": "12.5211",
        "longitude": "-69.9683"
      },
      "address": {
        "@type": "PostalAddress",
        "addressCountry": "AW"
      }
    }
    </script>
    
    <!-- Article Schema -->
    <script type="application/ld+json">
    {
      "@context": "https://schema.org",
      "@type": "Article",
      "headline": "${destination.seo.title}",
      "description": "${destination.seo.description}",
      "image": "${destination.imageUrl || 'https://ouqeoizufbofdqbuiwvx.supabase.co/storage/v1/object/public/destinations//TopTours-Featured_image.jpg'}",
      "articleBody": "Discover the best ${destination.fullName} tours, excursions, and activities. Our comprehensive guide helps you find top-rated experiences and must-see attractions in ${destination.fullName}.",
      "wordCount": 800,
      "articleSection": "Travel Destinations",
      "author": {
        "@type": "Organization",
        "name": "TopTours.ai"
      },
      "publisher": {
        "@type": "Organization",
        "name": "TopTours.ai",
        "logo": {
          "@type": "ImageObject",
          "url": "https://toptours.ai/logo.png"
        }
      },
      "datePublished": "2025-10-07",
      "dateModified": "2025-10-07",
      "mainEntityOfPage": {
        "@type": "WebPage",
        "@id": "https://toptours.ai/destinations/${destination.id}"
      }
    }
    </script>
    
    <!-- Favicon -->
    <link rel="icon" type="image/svg+xml" href="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPGNpcmNsZSBjeD0iMTIiIGN5PSIxMiIgcj0iMTIiIGZpbGw9IiNmOTczMWIiLz4KPHBhdGggZD0iTTEyIDZMMTMuMDkgMTAuMjZMMTggMTFMMTMuMDkgMTEuNzRMMTIgMTZMMTAuOTEgMTEuNzRMMTYgMTFMMTAuOTEgMTAuMjZMMTIgNloiIGZpbGw9IndoaXRlIi8+Cjwvc3ZnPgo=" />
    
    <!-- CSS and JS -->
    <link rel="stylesheet" href="/assets/index-6d44402f.css">
    
    <!-- Canonical URL -->
    <link rel="canonical" href="https://toptours.ai/destinations/${destination.id}">
    
    <!-- Redirect to React app for interactive features -->
    <script>
        // Only redirect for human users, not for bots/crawlers
        if (!navigator.userAgent.match(/(bot|crawler|spider|scraper|facebookexternalhit|twitterbot|linkedinbot|whatsapp|telegram|slack|discord|skype|viber|line|kik|wechat|qq|baiduspider|googlebot|bingbot|yandexbot|duckduckbot|slurp|ia_archiver|rich-results-test|google-rich-results|search-console)/i)) {
            window.location.href = '/destinations/${destination.id}';
        }
    </script>
</head>
<body>
    <div id="root"></div>
    
    <!-- Content for crawlers and SEO -->
    <div style="display: none;">
        <h1>${destination.fullName} Tours & Activities</h1>
        <p>${destination.seo.description}</p>
        
        <h2>Discover ${destination.fullName}</h2>
        <p>${destination.heroDescription}</p>
        
        <h2>Why Visit ${destination.fullName}?</h2>
        <ul>
            ${destination.whyVisit.map(reason => `<li>${reason}</li>`).join('')}
        </ul>
        
        <h2>Best Time to Visit ${destination.fullName}</h2>
        <h3>Weather</h3>
        <p>${destination.bestTimeToVisit.weather}</p>
        
        <h3>Best Months</h3>
        <p>${destination.bestTimeToVisit.bestMonths}</p>
        
        <h3>Peak Season</h3>
        <p>${destination.bestTimeToVisit.peakSeason}</p>
        
        <h3>Off Season</h3>
        <p>${destination.bestTimeToVisit.offSeason}</p>
        
        <h2>Popular ${destination.fullName} Tours & Activities</h2>
        <ul>
            ${destination.tourCategories.map(category => `<li>${destination.fullName} ${category}</li>`).join('')}
        </ul>
        
        <h2>Top Attractions in ${destination.fullName}</h2>
        <ul>
            ${destination.highlights.map(highlight => `<li>${highlight}</li>`).join('')}
        </ul>
        
        <h2>Getting Around ${destination.fullName}</h2>
        <p>${destination.gettingAround}</p>
    </div>
    
    <script type="module" crossorigin src="/assets/index-bb4205e9.js"></script>
</body>
</html>`;
};

// HTML template for destinations listing page
const createDestinationsListingHTML = () => {
  return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Popular Destinations - TopTours.ai</title>
    <meta name="description" content="Discover amazing tours and activities in the world's most popular destinations. Find the perfect adventure for your next trip with AI-powered recommendations." />
    <meta name="keywords" content="travel destinations, popular destinations, tours, activities, travel planning" />
    
    <!-- Open Graph -->
    <meta property="og:title" content="Popular Destinations - TopTours.ai" />
    <meta property="og:description" content="Discover amazing tours and activities in the world's most popular destinations. Find the perfect adventure for your next trip with AI-powered recommendations." />
    <meta property="og:type" content="website" />
    <meta property="og:url" content="https://toptours.ai/destinations" />
    <meta property="og:image" content="https://ouqeoizufbofdqbuiwvx.supabase.co/storage/v1/object/public/destinations//TopTours-Featured_image.jpg" />
    <meta property="og:image:width" content="1200" />
    <meta property="og:image:height" content="630" />
    <meta property="og:site_name" content="TopTours.ai" />
    <meta property="og:locale" content="en_US" />
    <meta property="og:image:alt" content="Popular Travel Destinations" />
    
    <!-- Twitter Card -->
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content="Popular Destinations - TopTours.ai" />
    <meta name="twitter:description" content="Discover amazing tours and activities in the world's most popular destinations." />
    <meta name="twitter:image" content="https://ouqeoizufbofdqbuiwvx.supabase.co/storage/v1/object/public/destinations//TopTours-Featured_image.jpg" />
    <meta name="twitter:image:alt" content="Popular Travel Destinations" />
    
    <!-- Structured Data -->
    <script type="application/ld+json">
    {
      "@context": "https://schema.org",
      "@type": "WebPage",
      "name": "Popular Destinations",
      "description": "Discover amazing tours and activities in the world's most popular destinations.",
      "url": "https://toptours.ai/destinations",
      "publisher": {
        "@type": "Organization",
        "name": "TopTours.ai"
      }
    }
    </script>
    
    <!-- Favicon -->
    <link rel="icon" type="image/svg+xml" href="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPGNpcmNsZSBjeD0iMTIiIGN5PSIxMiIgcj0iMTIiIGZpbGw9IiNmOTczMWIiLz4KPHBhdGggZD0iTTEyIDZMMTMuMDkgMTAuMjZMMTggMTFMMTMuMDkgMTEuNzRMMTIgMTZMMTAuOTEgMTEuNzRMMTYgMTFMMTAuOTEgMTAuMjZMMTIgNloiIGZpbGw9IndoaXRlIi8+Cjwvc3ZnPgo=" />
    
    <!-- CSS and JS -->
    <link rel="stylesheet" href="/assets/index-6d44402f.css">
</head>
<body>
    <div id="root"></div>
    <script type="module" crossorigin src="/assets/index-bb4205e9.js"></script>
</body>
</html>`;
};

// Generate static files for all destinations
const generateStaticFiles = () => {
  const destinations = getAllDestinations();
  const distPath = path.join(__dirname, '../dist');
  
  // Create destinations directory if it doesn't exist
  const destinationsDir = path.join(distPath, 'destinations');
  if (!fs.existsSync(destinationsDir)) {
    fs.mkdirSync(destinationsDir, { recursive: true });
  }
  
  // Generate individual destination pages
  destinations.forEach(destination => {
    const html = createDestinationHTML(destination);
    const filePath = path.join(destinationsDir, `${destination.id}.html`);
    
    fs.writeFileSync(filePath, html);
    console.log(`Generated: /destinations/${destination.id}.html`);
  });
  
  // Generate destinations listing page
  const destinationsListingHTML = createDestinationsListingHTML();
  const destinationsListingPath = path.join(distPath, 'destinations.html');
  fs.writeFileSync(destinationsListingPath, destinationsListingHTML);
  console.log(`Generated: /destinations.html`);
  
  console.log(`\n✅ Generated ${destinations.length + 1} pages with Open Graph meta tags!`);
  console.log(`📁 Files created:`);
  console.log(`   - /destinations.html (destinations listing)`);
  destinations.forEach(dest => {
    console.log(`   - /destinations/${dest.id}.html (${dest.fullName})`);
  });
  
  console.log(`\n🔧 .htaccess updated for Open Graph support`);
  console.log(`📋 URL Structure:`);
  console.log(`   - /destinations → serves /destinations.html (with Open Graph)`);
  console.log(`   - /destinations/aruba → serves /destinations/aruba.html (with Open Graph)`);
  console.log(`   - Other routes → serve index.html (React Router)`);
};

// Run the generation
generateStaticFiles(); 