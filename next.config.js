/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    unoptimized: true
  },
  async redirects() {
    return [
      // Redirect old blog subdomain to travel-guides
      {
        source: '/blog',
        destination: '/travel-guides',
        permanent: true,
      },
      {
        source: '/blog/:path*',
        destination: '/travel-guides/:path*',
        permanent: true,
      },
      
      // Banff redirects
      {
        source: '/banff-winter-tours',
        destination: '/travel-guides',
        permanent: true,
      },
      {
        source: '/banff-wildlife-tours',
        destination: '/travel-guides',
        permanent: true,
      },
      {
        source: '/banff-airport-transfers',
        destination: '/travel-guides',
        permanent: true,
      },
      {
        source: '/banff-kayaking-and-rafting-tours',
        destination: '/travel-guides',
        permanent: true,
      },
      {
        source: '/lake-louise-and-moraine-lake-tours',
        destination: '/travel-guides',
        permanent: true,
      },
      {
        source: '/banff-tours',
        destination: '/travel-guides',
        permanent: true,
      },
      
      // Halifax redirects
      {
        source: '/halifax-group-and-private-tours',
        destination: '/travel-guides',
        permanent: true,
      },
      {
        source: '/halifax-airport-transfers',
        destination: '/travel-guides',
        permanent: true,
      },
      {
        source: '/day-trips-from-halifax',
        destination: '/travel-guides',
        permanent: true,
      },
      {
        source: '/halifax-brewery-and-distillery-tours',
        destination: '/travel-guides',
        permanent: true,
      },
      {
        source: '/halifax-titanic-tours',
        destination: '/travel-guides',
        permanent: true,
      },
      {
        source: '/halifax-tours',
        destination: '/travel-guides',
        permanent: true,
      },
      
      // Victoria redirects
      {
        source: '/victoria-private-tours',
        destination: '/travel-guides',
        permanent: true,
      },
      {
        source: '/victoria-craft-beer-and-wine-tours',
        destination: '/travel-guides',
        permanent: true,
      },
      {
        source: '/victoria-city-tours',
        destination: '/travel-guides',
        permanent: true,
      },
      {
        source: '/victoria-airport-transfers',
        destination: '/travel-guides',
        permanent: true,
      },
      {
        source: '/victoria-whale-watching',
        destination: '/travel-guides',
        permanent: true,
      },
      {
        source: '/victoria-tours',
        destination: '/travel-guides',
        permanent: true,
      },
      
      // Ottawa redirects
      {
        source: '/day-trips-from-ottawa',
        destination: '/travel-guides',
        permanent: true,
      },
      {
        source: '/ottawa-airport-transfers',
        destination: '/travel-guides',
        permanent: true,
      },
      {
        source: '/ottawa-river-tours',
        destination: '/travel-guides',
        permanent: true,
      },
      {
        source: '/ottawa-parliament-tours',
        destination: '/travel-guides',
        permanent: true,
      },
      {
        source: '/ottawa-food-tours',
        destination: '/travel-guides',
        permanent: true,
      },
      {
        source: '/ottawa-tours',
        destination: '/travel-guides',
        permanent: true,
      },
      
      // Calgary redirects
      {
        source: '/calgary-kayaking',
        destination: '/travel-guides',
        permanent: true,
      },
      {
        source: '/calgary-nature-day-trips',
        destination: '/travel-guides',
        permanent: true,
      },
      {
        source: '/calgary-western-heritage-tours',
        destination: '/travel-guides',
        permanent: true,
      },
      {
        source: '/calgary-olympic-park-tours',
        destination: '/travel-guides',
        permanent: true,
      },
      {
        source: '/calgary-airport-transfers',
        destination: '/travel-guides',
        permanent: true,
      },
      {
        source: '/calgary-tours',
        destination: '/travel-guides',
        permanent: true,
      },
      
      // Quebec City redirects
      {
        source: '/quebec-city-art-and-craft-tours',
        destination: '/travel-guides',
        permanent: true,
      },
      {
        source: '/quebec-city-fortification-tours',
        destination: '/travel-guides',
        permanent: true,
      },
      {
        source: '/quebec-city-airport-transfers',
        destination: '/travel-guides',
        permanent: true,
      },
      {
        source: '/quebec-city-water-tours',
        destination: '/travel-guides',
        permanent: true,
      },
      {
        source: '/quebec-city-full-day-and-half-day-tours',
        destination: '/travel-guides',
        permanent: true,
      },
      {
        source: '/quebec-city-tours',
        destination: '/travel-guides',
        permanent: true,
      },
      
      // Vancouver redirects
      {
        source: '/vancouver-gastown-food-tours',
        destination: '/travel-guides',
        permanent: true,
      },
      {
        source: '/vancouver-airport-transfers',
        destination: '/travel-guides',
        permanent: true,
      },
      {
        source: '/day-trips-from-vancouver',
        destination: '/travel-guides',
        permanent: true,
      },
      {
        source: '/vancouver-adventure-park-tours',
        destination: '/travel-guides',
        permanent: true,
      },
      {
        source: '/vancouver-whale-watching-tours',
        destination: '/travel-guides',
        permanent: true,
      },
      {
        source: '/vancouver-tours',
        destination: '/travel-guides',
        permanent: true,
      },
      
      // Montreal redirects
      {
        source: '/montreal-airport-transfers',
        destination: '/travel-guides',
        permanent: true,
      },
      {
        source: '/day-trips-from-montreal',
        destination: '/travel-guides',
        permanent: true,
      },
      {
        source: '/montreal-nightlife-tours',
        destination: '/travel-guides',
        permanent: true,
      },
      {
        source: '/montreal-food-tours',
        destination: '/travel-guides',
        permanent: true,
      },
      {
        source: '/montreal-underground-city-tours',
        destination: '/travel-guides',
        permanent: true,
      },
      {
        source: '/montreal-tours',
        destination: '/travel-guides',
        permanent: true,
      },
      
      // Toronto redirects
      {
        source: '/toronto-full-day-and-half-day-tours',
        destination: '/travel-guides',
        permanent: true,
      },
      {
        source: '/day-trips-from-toronto',
        destination: '/travel-guides',
        permanent: true,
      },
      {
        source: '/toronto-airport-transfers',
        destination: '/travel-guides',
        permanent: true,
      },
      {
        source: '/toronto-food-tours',
        destination: '/travel-guides',
        permanent: true,
      },
      {
        source: '/toronto-island-and-harbor-tours',
        destination: '/travel-guides',
        permanent: true,
      },
      {
        source: '/toronto-tours',
        destination: '/travel-guides',
        permanent: true,
      },
      
      // Tulum redirects
      {
        source: '/tulum-jeep-and-atv-tours',
        destination: '/travel-guides',
        permanent: true,
      },
      {
        source: '/tulum-family-wildlife-tours',
        destination: '/travel-guides',
        permanent: true,
      },
      {
        source: '/day-trips-from-tulum',
        destination: '/travel-guides',
        permanent: true,
      },
      {
        source: '/tulum-sailing-and-snorkeling',
        destination: '/travel-guides',
        permanent: true,
      },
      {
        source: '/tulum-cenote-jungle-tours',
        destination: '/travel-guides',
        permanent: true,
      },
      {
        source: '/tulum-tours',
        destination: '/travel-guides',
        permanent: true,
      },
      
      // Cabo San Lucas redirects
      {
        source: '/cabo-san-lucas-camel-tours',
        destination: '/travel-guides',
        permanent: true,
      },
      {
        source: '/cabo-san-lucas-glass-bottom-boat-tours',
        destination: '/travel-guides',
        permanent: true,
      },
      {
        source: '/cabo-san-lucas-full-day-and-half-day-tours',
        destination: '/travel-guides',
        permanent: true,
      },
      {
        source: '/cabo-san-lucas-jeep-and-atv-tours',
        destination: '/travel-guides',
        permanent: true,
      },
      {
        source: '/cabo-san-lucas-fishing-charters',
        destination: '/travel-guides',
        permanent: true,
      },
      {
        source: '/cabo-san-lucas-tours',
        destination: '/travel-guides',
        permanent: true,
      },
      
      // Cozumel redirects
      {
        source: '/cozumel-zipline-adventure',
        destination: '/travel-guides',
        permanent: true,
      },
      {
        source: '/maximize-your-port-day-your-guide-to-the-best-cozumel-shore-excursions-for-cruise-visitors',
        destination: '/travel-guides',
        permanent: true,
      },
      {
        source: '/cozumel-full-day-and-half-day-tours',
        destination: '/travel-guides',
        permanent: true,
      },
      {
        source: '/cozumel-catamaran-snorkeling-tours',
        destination: '/travel-guides',
        permanent: true,
      },
      {
        source: '/cozumel-jeep-and-atv-tours',
        destination: '/travel-guides',
        permanent: true,
      },
      {
        source: '/cozumel-tours',
        destination: '/travel-guides',
        permanent: true,
      },
      
      // Guanajuato redirects
      {
        source: '/guanajuato-airport-transfers',
        destination: '/travel-guides',
        permanent: true,
      },
      {
        source: '/guanajuato-night-tours',
        destination: '/travel-guides',
        permanent: true,
      },
      {
        source: '/day-trips-from-guanajuato',
        destination: '/travel-guides',
        permanent: true,
      },
      {
        source: '/guanajuato-full-day-and-half-day-tours',
        destination: '/travel-guides',
        permanent: true,
      },
      {
        source: '/guanajuato-underground-tours',
        destination: '/travel-guides',
        permanent: true,
      },
      {
        source: '/guanajuato-tours',
        destination: '/travel-guides',
        permanent: true,
      },
      
      // Playa del Carmen redirects
      {
        source: '/playa-del-carmen-family-animal-tours',
        destination: '/travel-guides',
        permanent: true,
      },
      {
        source: '/playa-del-carmen-nightlife-tours',
        destination: '/travel-guides',
        permanent: true,
      },
      {
        source: '/playa-del-carmen-full-day-and-half-day-tours',
        destination: '/travel-guides',
        permanent: true,
      },
      {
        source: '/playa-del-carmen-mayan-ruins-tours',
        destination: '/travel-guides',
        permanent: true,
      },
      {
        source: '/playa-del-carmen-cenote-tours',
        destination: '/travel-guides',
        permanent: true,
      },
      {
        source: '/playa-del-carmen-tours',
        destination: '/travel-guides',
        permanent: true,
      },
      
      // San Miguel de Allende redirects
      {
        source: '/san-miguel-de-allende-day-trips',
        destination: '/travel-guides',
        permanent: true,
      },
      {
        source: '/san-miguel-de-allende-full-day-and-half-day-tours',
        destination: '/travel-guides',
        permanent: true,
      },
      {
        source: '/san-miguel-de-allende-hot-air-balloon-tours',
        destination: '/travel-guides',
        permanent: true,
      },
      {
        source: '/san-miguel-de-allende-cooking-classes',
        destination: '/travel-guides',
        permanent: true,
      },
      {
        source: '/san-miguel-de-allende-art-tours',
        destination: '/travel-guides',
        permanent: true,
      },
      {
        source: '/san-miguel-de-allende-tours',
        destination: '/travel-guides',
        permanent: true,
      },
      
      // Oaxaca redirects
      {
        source: '/oaxaca-water-tours',
        destination: '/travel-guides',
        permanent: true,
      },
      {
        source: '/oaxaca-full-day-and-half-day-tours',
        destination: '/travel-guides',
        permanent: true,
      },
      {
        source: '/monte-alban-day-trip-oaxaca',
        destination: '/travel-guides',
        permanent: true,
      },
      {
        source: '/oaxaca-market-and-artisan-tours',
        destination: '/travel-guides',
        permanent: true,
      },
      {
        source: '/oaxaca-mezcal-tours',
        destination: '/travel-guides',
        permanent: true,
      },
      {
        source: '/oaxaca-tours',
        destination: '/travel-guides',
        permanent: true,
      },
      
      // Puerto Vallarta redirects
      {
        source: '/puerto-vallarta-first-time-visitor-tours',
        destination: '/travel-guides',
        permanent: true,
      },
      {
        source: '/snorkeling-in-puerto-vallarta',
        destination: '/travel-guides',
        permanent: true,
      },
      {
        source: '/day-trips-from-puerto-vallarta',
        destination: '/travel-guides',
        permanent: true,
      },
      {
        source: '/puerto-vallarta-whale-watching-tours',
        destination: '/travel-guides',
        permanent: true,
      },
      {
        source: '/puerto-vallarta-sunset-cruises',
        destination: '/travel-guides',
        permanent: true,
      },
      {
        source: '/puerto-vallarta-tours',
        destination: '/travel-guides',
        permanent: true,
      },
      
      // Mexico City redirects
      {
        source: '/mexico-city-hot-air-balloon-tour',
        destination: '/travel-guides',
        permanent: true,
      },
      {
        source: '/mexico-city-tours-2',
        destination: '/travel-guides',
        permanent: true,
      },
      {
        source: '/day-trips-from-mexico-city',
        destination: '/travel-guides',
        permanent: true,
      },
      {
        source: '/mexico-city-street-art-tour',
        destination: '/travel-guides',
        permanent: true,
      },
      {
        source: '/mexico-city-lucha-libre-tour',
        destination: '/travel-guides',
        permanent: true,
      },
      {
        source: '/mexico-city-tours',
        destination: '/travel-guides',
        permanent: true,
      },
      
      // Atlanta redirects
      {
        source: '/atlanta-movie-tours',
        destination: '/travel-guides',
        permanent: true,
      },
      {
        source: '/sweet-auburn-atlanta',
        destination: '/travel-guides',
        permanent: true,
      },
      {
        source: '/unveiling-the-canvas-exploring-atlantas-vibrant-cabbagetown-street-art-scene',
        destination: '/travel-guides',
        permanent: true,
      },
      {
        source: '/atlanta-beltline-guide',
        destination: '/travel-guides',
        permanent: true,
      },
      {
        source: '/atlanta-civil-rights-history',
        destination: '/travel-guides',
        permanent: true,
      },
      {
        source: '/top-things-to-do-in-atlanta',
        destination: '/travel-guides',
        permanent: true,
      },
      
      // Anchorage redirects
      {
        source: '/northern-lights-viewing-near-anchorage',
        destination: '/travel-guides',
        permanent: true,
      },
      {
        source: '/anchorage-helicopter-tours',
        destination: '/travel-guides',
        permanent: true,
      },
      {
        source: '/fishing-in-anchorage',
        destination: '/travel-guides',
        permanent: true,
      },
      {
        source: '/denali-national-park-from-anchorage',
        destination: '/travel-guides',
        permanent: true,
      },
      {
        source: '/driving-the-seward-highway',
        destination: '/travel-guides',
        permanent: true,
      },
      {
        source: '/things-to-do-in-anchorage',
        destination: '/travel-guides',
        permanent: true,
      },
      
      // Cancun redirects
      {
        source: '/cancun-nightlife',
        destination: '/travel-guides',
        permanent: true,
      },
      {
        source: '/island-escape-your-ultimate-guide-to-an-isla-mujeres-day-trip-from-cancun',
        destination: '/travel-guides',
        permanent: true,
      },
      {
        source: '/best-cancun-water-activities',
        destination: '/travel-guides',
        permanent: true,
      },
      {
        source: '/cancun-adventure-parks',
        destination: '/travel-guides',
        permanent: true,
      },
      {
        source: '/beyond-the-beach-stepping-back-in-time-with-cancuns-best-mayan-ruins-day-trips',
        destination: '/travel-guides',
        permanent: true,
      },
      {
        source: '/getting-around-cancun-taxis-buses-cars-more-2025-guide',
        destination: '/travel-guides',
        permanent: true,
      },
    ]
  },
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: '/api/:path*'
      }
    ]
  },
  webpack: (config) => {
    config.resolve.alias = {
      ...config.resolve.alias,
      '@': require('path').resolve(__dirname, './src'),
    }
    return config
  }
}

module.exports = nextConfig
