export const destinations = [
  {
    id: 'aruba',
    name: 'Aruba',
    fullName: 'Aruba',
    category: 'Caribbean',
    country: 'Aruba',
    briefDescription: 'White-sand beaches, turquoise waters, and endless adventure — Aruba is the Caribbean\'s ultimate island escape.',
    relatedGuides: ['aruba-packing-list', 'best-time-to-visit-aruba', '3-day-aruba-itinerary', 'aruba-vs-curacao', 'aruba-vs-punta-cana', 'aruba-vs-jamaica'],
    heroDescription: 'Welcome to Aruba, where constant sunshine meets stunning coastlines and warm hospitality. Whether you\'re cruising at sunset, exploring hidden coves on an ATV, or snorkeling vibrant reefs, Aruba offers unforgettable experiences for every traveler. Let our AI-powered planner help you discover the best this island has to offer.',
    imageUrl: 'https://ouqeoizufbofdqbuiwvx.supabase.co/storage/v1/object/public/destinations//aruba.webp',
    tourCategories: [
      { name: 'Sunset Cruises', hasGuide: true },
      { name: 'ATV Tours', hasGuide: true }, 
      { name: 'Snorkeling Tours', hasGuide: true },
      { name: 'Cultural Tours', hasGuide: true },
      { name: 'Catamaran Sailing', hasGuide: true },
      { name: 'Jeep Off-Road Tours', hasGuide: true }
    ],
    seo: {
      title: 'Aruba Tours & Excursions - Top-Rated Activities & Adventures',
      description: 'Discover top-rated Aruba tours, excursions, and activities powered by AI. From snorkeling and catamaran cruises to off-road adventures, find the perfect way to explore Aruba.',
      keywords: 'Aruba tours, Aruba excursions, Aruba activities, Aruba sunset cruise, Aruba ATV tour, Aruba snorkeling tour, things to do in Aruba',
      primaryKeyword: 'Aruba tours',
      secondaryKeywords: [
        'Aruba excursions',
        'Aruba activities', 
        'Aruba sunset cruise',
        'Aruba ATV tour',
        'Aruba snorkeling tour',
        'Things to do in Aruba'
      ]
    },
    whyVisit: [
      'Year-round perfect weather with constant trade winds',
      'Stunning white-sand beaches and crystal-clear waters',
      'Rich cultural heritage and friendly local hospitality',
      'Diverse adventure activities from water sports to off-road exploration',
      'Excellent dining scene with fresh seafood and local cuisine',
      'Safe and welcoming environment for all travelers'
    ],
    bestTimeToVisit: {
      weather: 'Aruba enjoys year-round sunshine with average temperatures of 82°F (28°C). The island is outside the hurricane belt, making it a reliable destination any time of year.',
      bestMonths: 'April to August offers the best combination of weather and fewer crowds.',
      peakSeason: 'December to April brings peak tourist season with higher prices but perfect weather.',
      offSeason: 'September to November offers lower prices and still excellent weather.'
    },
    gettingAround: 'Rent a car for maximum flexibility, or use taxis and public buses. Many tours include hotel pickup and drop-off.',
    highlights: [
      'Eagle Beach - One of the world\'s most beautiful beaches',
      'Arikok National Park - Rugged desert landscape and natural pools',
      'Oranjestad - Charming capital with Dutch colonial architecture',
      'Baby Beach - Perfect for families with calm, shallow waters',
      'California Lighthouse - Stunning sunset views',
      'Natural Bridge - Iconic rock formation (collapsed but still scenic)'
    ]
  },
  {
    id: 'curacao',
    name: 'Curaçao',
    fullName: 'Curaçao',
    category: 'Caribbean',
    country: 'Curaçao',
    briefDescription: 'Vibrant coral reefs, colorful Dutch architecture, and crystal-clear waters — Curaçao is the Caribbean\'s hidden gem waiting to be discovered.',
    relatedGuides: ['best-time-to-visit-curacao', 'curacao-packing-list', '3-day-curacao-itinerary', 'aruba-vs-curacao', 'curacao-vs-jamaica', 'curacao-vs-punta-cana'],
    heroDescription: 'Welcome to Curaçao, where Caribbean charm meets European elegance. From diving pristine coral reefs to exploring the colorful streets of Willemstad, this island offers a perfect blend of adventure and culture. Let our AI-powered planner help you discover the best experiences this unique destination has to offer.',
    imageUrl: 'https://ouqeoizufbofdqbuiwvx.supabase.co/storage/v1/object/public/destinations//curacao.jpg',
    tourCategories: [
      { name: 'Diving Tours', hasGuide: true },
      { name: 'Snorkeling Tours', hasGuide: true },
      { name: 'Willemstad Walking Tours', hasGuide: true },
      { name: 'Beach Tours', hasGuide: true },
      { name: 'Catamaran Cruises', hasGuide: true },
      { name: 'Cultural Heritage Tours', hasGuide: true }
    ],
    seo: {
      title: 'Curaçao Tours & Excursions - Top-Rated Activities & Adventures',
      description: 'Discover top-rated Curaçao tours, excursions, and activities powered by AI. From diving and snorkeling to cultural tours, find the perfect way to explore Curaçao.',
      keywords: 'Curaçao tours, Curaçao diving, Curaçao snorkeling, Willemstad tours, Curaçao excursions, things to do in Curaçao',
      primaryKeyword: 'Curaçao tours',
      secondaryKeywords: [
        'Curaçao diving tours',
        'Curaçao snorkeling tours',
        'Willemstad walking tours',
        'Curaçao beach tours',
        'Curaçao catamaran cruises',
        'Things to do in Curaçao'
      ]
    },
    whyVisit: [
      'World-class diving and snorkeling with pristine coral reefs',
      'UNESCO World Heritage site of Willemstad with colorful Dutch architecture',
      'Year-round perfect weather outside the hurricane belt',
      'Rich cultural heritage blending Dutch, African, and Caribbean influences',
      'Crystal-clear turquoise waters and beautiful beaches',
      'Authentic Caribbean experience with European sophistication'
    ],
    bestTimeToVisit: {
      weather: 'Curaçao enjoys year-round sunshine with average temperatures of 82°F (28°C). The island is outside the hurricane belt, making it a reliable destination any time of year.',
      bestMonths: 'May to November offers the best combination of weather and fewer crowds, with excellent diving conditions.',
      peakSeason: 'December to April brings peak tourist season with higher prices but perfect weather for all activities.',
      offSeason: 'September to November offers lower prices and still excellent weather, ideal for diving and snorkeling.'
    },
    gettingAround: 'Rent a car for maximum flexibility to explore the island, or use taxis and public buses. Many tours include hotel pickup and drop-off.',
    highlights: [
      'Willemstad - UNESCO World Heritage site with colorful Dutch architecture',
      'Christoffel National Park - Hiking trails and stunning viewpoints',
      'Shete Boka National Park - Dramatic coastline and sea turtle nesting',
      'Playa Kenepa - One of the most beautiful beaches in the Caribbean',
      'Curaçao Sea Aquarium - Marine life encounters and dolphin shows',
      'Hato Caves - Ancient limestone caves with historical significance'
    ]
  },
  {
    id: 'st-lucia',
    name: 'St. Lucia',
    fullName: 'St. Lucia',
    category: 'Caribbean',
    briefDescription: 'Lush rainforests, iconic Pitons, and pristine beaches — St. Lucia is the Caribbean\'s most romantic and adventurous island paradise.',
    heroDescription: 'Welcome to St. Lucia, where dramatic volcanic peaks meet crystal-clear waters and lush tropical rainforests. From hiking the iconic Pitons to relaxing in volcanic mud baths, this island offers the perfect blend of adventure and luxury. Let our AI-powered planner help you discover the best experiences this stunning destination has to offer.',
    imageUrl: 'https://ouqeoizufbofdqbuiwvx.supabase.co/storage/v1/object/public/destinations//st%20lucia.webp',
    tourCategories: [
      { name: 'Piton Hiking Tours', hasGuide: true },
      { name: 'Rainforest Tours', hasGuide: true },
      { name: 'Volcanic Mud Bath Tours', hasGuide: true },
      { name: 'Catamaran Cruises', hasGuide: true },
      { name: 'Snorkeling Tours', hasGuide: true },
      { name: 'Cultural Heritage Tours', hasGuide: true }
    ],
    seo: {
      title: 'St. Lucia Tours & Excursions - Top-Rated Activities & Adventures',
      description: 'Discover top-rated St. Lucia tours, excursions, and activities powered by AI. From hiking the Pitons to rainforest adventures, find the perfect way to explore St. Lucia.',
      keywords: 'St. Lucia tours, St. Lucia hiking, Pitons tours, St. Lucia rainforest, St. Lucia excursions, things to do in St. Lucia',
      primaryKeyword: 'St. Lucia tours',
      secondaryKeywords: [
        'St. Lucia hiking tours',
        'Pitons hiking tours',
        'St. Lucia rainforest tours',
        'St. Lucia catamaran cruises',
        'St. Lucia snorkeling tours',
        'Things to do in St. Lucia'
      ]
    },
    whyVisit: [
      'Iconic Pitons - UNESCO World Heritage site and hiking paradise',
      'Lush rainforests with diverse wildlife and waterfalls',
      'Volcanic mud baths and hot springs for relaxation',
      'Pristine beaches with crystal-clear waters',
      'Rich cultural heritage and Creole cuisine',
      'Perfect blend of adventure and luxury experiences'
    ],
    bestTimeToVisit: {
      weather: 'St. Lucia enjoys tropical weather year-round with average temperatures of 82°F (28°C). The island has a wet and dry season.',
      bestMonths: 'December to April offers the best weather with less rainfall and perfect conditions for all activities.',
      peakSeason: 'December to April brings peak tourist season with higher prices but ideal weather.',
      offSeason: 'May to November offers lower prices and still good weather, though with more rainfall.'
    },
    gettingAround: 'Rent a car for maximum flexibility, or use taxis and organized tours. Many resorts offer airport transfers and local transportation.',
    highlights: [
      'The Pitons - Iconic twin volcanic peaks and UNESCO World Heritage site',
      'Sulphur Springs - World\'s only drive-in volcano with mud baths',
      'Diamond Falls - Beautiful waterfall and botanical gardens',
      'Marigot Bay - Stunning bay featured in movies',
      'Pigeon Island National Park - Historic site with hiking trails',
      'Anse Chastanet - One of the most beautiful beaches in the Caribbean'
    ]
  },
  {
    id: 'barbados',
    name: 'Barbados',
    fullName: 'Barbados',
    category: 'Caribbean',
    briefDescription: 'Pink sand beaches, British charm, and world-class surfing — Barbados is the Caribbean\'s most sophisticated island destination.',
    heroDescription: 'Welcome to Barbados, where British colonial charm meets Caribbean warmth and natural beauty. From surfing the famous Soup Bowl to exploring historic Bridgetown, this island offers a perfect blend of culture, adventure, and relaxation. Let our AI-powered planner help you discover the best experiences this elegant destination has to offer.',
    imageUrl: 'https://ouqeoizufbofdqbuiwvx.supabase.co/storage/v1/object/public/destinations//Barbados.jpg',
    tourCategories: [
      { name: 'Surfing Tours', hasGuide: true },
      { name: 'Cultural Heritage Tours', hasGuide: true },
      { name: 'Rum Distillery Tours', hasGuide: true },
      { name: 'Catamaran Cruises', hasGuide: true },
      { name: 'Snorkeling Tours', hasGuide: true },
      { name: 'Historical Tours', hasGuide: true }
    ],
    seo: {
      title: 'Barbados Tours & Excursions - Top-Rated Activities & Adventures',
      description: 'Discover top-rated Barbados tours, excursions, and activities powered by AI. From surfing and cultural tours to rum tastings, find the perfect way to explore Barbados.',
      keywords: 'Barbados tours, Barbados surfing, Barbados rum tours, Barbados excursions, things to do in Barbados',
      primaryKeyword: 'Barbados tours',
      secondaryKeywords: [
        'Barbados surfing tours',
        'Barbados rum distillery tours',
        'Barbados cultural tours',
        'Barbados catamaran cruises',
        'Barbados snorkeling tours',
        'Things to do in Barbados'
      ]
    },
    whyVisit: [
      'World-class surfing with famous breaks like Soup Bowl',
      'Rich British colonial heritage and UNESCO World Heritage sites',
      'Famous rum distilleries and Bajan cuisine',
      'Pink sand beaches and crystal-clear waters',
      'Sophisticated culture with excellent dining and nightlife',
      'Year-round perfect weather and friendly locals'
    ],
    bestTimeToVisit: {
      weather: 'Barbados enjoys year-round tropical weather with average temperatures of 82°F (28°C). The island is outside the hurricane belt.',
      bestMonths: 'December to April offers the best weather with less rainfall and perfect conditions for all activities.',
      peakSeason: 'December to April brings peak tourist season with higher prices but ideal weather.',
      offSeason: 'May to November offers lower prices and still excellent weather, with great surfing conditions.'
    },
    gettingAround: 'Use public buses for an authentic experience, rent a car for flexibility, or use taxis. Many tours include hotel pickup and drop-off.',
    highlights: [
      'Bathsheba Beach - Famous surfing spot and natural beauty',
      'Bridgetown - UNESCO World Heritage site with colonial architecture',
      'Mount Gay Rum Distillery - World\'s oldest rum producer',
      'Harrison\'s Cave - Spectacular limestone cave system',
      'Oistins Fish Fry - Famous Friday night food and music event',
      'Crane Beach - One of the most beautiful pink sand beaches'
    ]
  },
  {
    id: 'jamaica',
    name: 'Jamaica',
    fullName: 'Jamaica',
    category: 'Caribbean',
    country: 'Jamaica',
    briefDescription: 'Reggae rhythms, cascading waterfalls, and vibrant culture — Jamaica is the Caribbean\'s most spirited and adventurous island.',
    heroDescription: 'Welcome to Jamaica, where reggae music fills the air and natural wonders await around every corner. From climbing Dunn\'s River Falls to exploring Bob Marley\'s legacy, this island offers an authentic Caribbean experience like no other. Let our AI-powered planner help you discover the best experiences this vibrant destination has to offer.',
    imageUrl: 'https://ouqeoizufbofdqbuiwvx.supabase.co/storage/v1/object/public/destinations//jamaica.webp',
    tourCategories: [
      { name: 'Waterfall Tours', hasGuide: true },
      { name: 'Reggae Music Tours', hasGuide: true },
      { name: 'Adventure Tours', hasGuide: true },
      { name: 'Cultural Heritage Tours', hasGuide: true },
      { name: 'Beach Tours', hasGuide: true },
      { name: 'Historical Tours', hasGuide: true }
    ],
    relatedGuides: ['curacao-vs-jamaica', 'aruba-vs-jamaica'],
    seo: {
      title: 'Jamaica Tours & Excursions - Top-Rated Activities & Adventures',
      description: 'Discover top-rated Jamaica tours, excursions, and activities powered by AI. From waterfall adventures to reggae music tours, find the perfect way to explore Jamaica.',
      keywords: 'Jamaica tours, Jamaica waterfalls, Jamaica reggae tours, Jamaica excursions, things to do in Jamaica',
      primaryKeyword: 'Jamaica tours',
      secondaryKeywords: [
        'Jamaica waterfall tours',
        'Jamaica reggae music tours',
        'Jamaica adventure tours',
        'Jamaica cultural tours',
        'Jamaica beach tours',
        'Things to do in Jamaica'
      ]
    },
    whyVisit: [
      'Famous waterfalls like Dunn\'s River Falls and Blue Hole',
      'Rich reggae music heritage and Bob Marley legacy',
      'Diverse landscapes from mountains to beaches',
      'Authentic Jamaican culture and cuisine',
      'Adventure activities and natural wonders',
      'Warm hospitality and vibrant atmosphere'
    ],
    bestTimeToVisit: {
      weather: 'Jamaica enjoys tropical weather year-round with average temperatures of 82°F (28°C). The island has distinct wet and dry seasons.',
      bestMonths: 'December to April offers the best weather with less rainfall and perfect conditions for all activities.',
      peakSeason: 'December to April brings peak tourist season with higher prices but ideal weather.',
      offSeason: 'May to November offers lower prices and still good weather, though with more rainfall.'
    },
    gettingAround: 'Rent a car for maximum flexibility, use organized tours, or hire private drivers. Many resorts offer airport transfers and local transportation.',
    highlights: [
      'Dunn\'s River Falls - Famous cascading waterfall you can climb',
      'Blue Hole - Natural swimming hole and adventure spot',
      'Bob Marley Museum - Tribute to the reggae legend',
      'Negril Seven Mile Beach - One of the Caribbean\'s best beaches',
      'Mystic Mountain - Adventure park with zip lines and bobsled',
      'Port Antonio - Authentic Jamaican town with beautiful beaches'
    ]
  },
  {
    id: 'punta-cana',
    name: 'Punta Cana',
    fullName: 'Punta Cana',
    country: 'Dominican Republic',
    category: 'Caribbean',
    briefDescription: 'Pristine beaches, luxury resorts, and endless sunshine — Punta Cana is the Dominican Republic\'s premier beach destination.',
    heroDescription: 'Welcome to Punta Cana, where miles of white-sand beaches meet crystal-clear turquoise waters. From water sports and golf to cultural experiences and adventure tours, this paradise offers the perfect blend of relaxation and excitement. Let our AI-powered planner help you discover the best experiences this stunning destination has to offer.',
    imageUrl: 'https://ouqeoizufbofdqbuiwvx.supabase.co/storage/v1/object/public/destinations//punta%20cana.webp',
    tourCategories: [
      { name: 'Beach Tours', hasGuide: true },
      { name: 'Water Sports', hasGuide: true },
      { name: 'Golf Tours', hasGuide: true },
      { name: 'Cultural Tours', hasGuide: true },
      { name: 'Adventure Tours', hasGuide: true },
      { name: 'Catamaran Cruises', hasGuide: true }
    ],
    seo: {
      title: 'Punta Cana Tours & Excursions - Top-Rated Activities & Adventures',
      description: 'Discover top-rated Punta Cana tours, excursions, and activities powered by AI. From beach tours to water sports, find the perfect way to explore Punta Cana.',
      keywords: 'Punta Cana tours, Punta Cana beach tours, Punta Cana water sports, Punta Cana excursions, things to do in Punta Cana',
      primaryKeyword: 'Punta Cana tours',
      secondaryKeywords: [
        'Punta Cana beach tours',
        'Punta Cana water sports',
        'Punta Cana golf tours',
        'Punta Cana cultural tours',
        'Punta Cana adventure tours',
        'Things to do in Punta Cana'
      ]
    },
    whyVisit: [
      'Miles of pristine white-sand beaches with crystal-clear waters',
      'World-class golf courses designed by top architects',
      'Luxury all-inclusive resorts and excellent service',
      'Diverse water sports and adventure activities',
      'Rich Dominican culture and authentic experiences',
      'Year-round perfect weather and warm hospitality'
    ],
    bestTimeToVisit: {
      weather: 'Punta Cana enjoys year-round tropical weather with average temperatures of 82°F (28°C). The region has a pleasant climate with consistent sunshine and trade winds.',
      bestMonths: 'December to April offers the best weather with minimal rainfall, perfect beach conditions, and ideal temperatures for all activities.',
      peakSeason: 'December to April brings peak tourist season with higher prices but guaranteed excellent weather and minimal hurricane risk.',
      offSeason: 'May to June and September to October offer lower prices, fewer crowds, and still excellent weather, though with occasional afternoon showers.'
    },
    gettingAround: 'Most resorts offer shuttle services, rent a car for flexibility, or use organized tours. Taxis are readily available for local transportation.',
    highlights: [
      'Bavaro Beach - One of the most beautiful beaches in the Caribbean',
      'Saona Island - Pristine island with crystal-clear waters',
      'Los Haitises National Park - Mangrove forests and caves',
      'Altos de Chavon - Replica 16th-century Mediterranean village',
      'Scape Park - Adventure park with zip lines and natural pools',
      'Catalina Island - Perfect for snorkeling and diving'
    ],
    relatedGuides: ['curacao-vs-punta-cana', 'aruba-vs-punta-cana']
  },
  {
    id: 'santo-domingo',
    name: 'Santo Domingo',
    fullName: 'Santo Domingo',
    country: 'Dominican Republic',
    category: 'Caribbean',
    briefDescription: 'Historic charm, colonial architecture, and vibrant culture — Santo Domingo is the Caribbean\'s oldest city and the heart of the Dominican Republic.',
    heroDescription: 'Welcome to Santo Domingo, where history comes alive in the first city of the New World. From exploring UNESCO World Heritage sites to experiencing vibrant Dominican culture, this city offers a perfect blend of old-world charm and modern excitement. Let our AI-powered planner help you discover the best experiences this historic destination has to offer.',
    imageUrl: 'https://ouqeoizufbofdqbuiwvx.supabase.co/storage/v1/object/public/destinations//santo%20domingo.webp',
    tourCategories: [
      { name: 'Historical Tours', hasGuide: true },
      { name: 'Cultural Tours', hasGuide: true },
      { name: 'Food Tours', hasGuide: true },
      { name: 'Architecture Tours', hasGuide: true },
      { name: 'Museum Tours', hasGuide: true },
      { name: 'Walking Tours', hasGuide: true }
    ],
    seo: {
      title: 'Santo Domingo Tours & Excursions - Top-Rated Activities & Adventures',
      description: 'Discover top-rated Santo Domingo tours, excursions, and activities powered by AI. From historical tours to cultural experiences, find the perfect way to explore Santo Domingo.',
      keywords: 'Santo Domingo tours, Santo Domingo historical tours, Santo Domingo cultural tours, Santo Domingo excursions, things to do in Santo Domingo',
      primaryKeyword: 'Santo Domingo tours',
      secondaryKeywords: [
        'Santo Domingo historical tours',
        'Santo Domingo cultural tours',
        'Santo Domingo food tours',
        'Santo Domingo architecture tours',
        'Santo Domingo museum tours',
        'Things to do in Santo Domingo'
      ]
    },
    whyVisit: [
      'UNESCO World Heritage site with the oldest European settlement in the Americas',
      'Rich colonial architecture and historic landmarks',
      'Vibrant Dominican culture and authentic cuisine',
      'Excellent museums and cultural institutions',
      'Lively atmosphere with music, dance, and entertainment',
      'Perfect blend of history and modern Caribbean life'
    ],
    bestTimeToVisit: {
      weather: 'Santo Domingo enjoys tropical weather year-round with average temperatures of 82°F (28°C). The city has a pleasant climate with occasional rain showers and cooling sea breezes.',
      bestMonths: 'December to April offers the best weather with minimal rainfall, comfortable temperatures, and perfect conditions for exploring the historic city.',
      peakSeason: 'December to April brings peak tourist season with higher prices but guaranteed excellent weather and minimal hurricane risk.',
      offSeason: 'May to November offers lower prices and fewer crowds, though summer months (June-August) can be hot and humid with more frequent rain showers.'
    },
    gettingAround: 'Use taxis, ride-sharing services, or public transportation. The Colonial Zone is best explored on foot, and many tours include transportation.',
    highlights: [
      'Colonial Zone - UNESCO World Heritage site with historic architecture',
      'Alcazar de Colon - 16th-century palace and museum',
      'Catedral Primada de America - First cathedral in the Americas',
      'Plaza de Espana - Historic square with colonial buildings',
      'Museo de las Casas Reales - Museum of the Royal Houses',
      'Malecon - Beautiful waterfront promenade'
    ]
  },
  {
    id: 'nassau',
    name: 'Nassau',
    fullName: 'Nassau',
    country: 'Bahamas',
    category: 'Caribbean',
    briefDescription: 'Historic charm, crystal-clear waters, and vibrant culture — Nassau is the capital and heart of the Bahamas.',
    heroDescription: 'Welcome to Nassau, where colonial history meets tropical paradise. From exploring historic forts to swimming with pigs, this vibrant capital offers the perfect blend of culture and adventure. Let our AI-powered planner help you discover the best experiences this Bahamian gem has to offer.',
    imageUrl: 'https://ouqeoizufbofdqbuiwvx.supabase.co/storage/v1/object/public/destinations//nassau%20bahama.jpg',
    tourCategories: [
      { name: 'Historical Tours', hasGuide: true },
      { name: 'Beach Tours', hasGuide: true },
      { name: 'Water Sports', hasGuide: true },
      { name: 'Cultural Tours', hasGuide: true },
      { name: 'Adventure Tours', hasGuide: true },
      { name: 'Boat Tours', hasGuide: true }
    ],
    seo: {
      title: 'Nassau Tours & Excursions - Top-Rated Activities & Adventures',
      description: 'Discover top-rated Nassau tours, excursions, and activities powered by AI. From historical tours to water sports, find the perfect way to explore Nassau.',
      keywords: 'Nassau tours, Nassau Bahamas tours, Nassau excursions, things to do in Nassau',
      primaryKeyword: 'Nassau tours',
      secondaryKeywords: [
        'Nassau historical tours',
        'Nassau beach tours',
        'Nassau water sports',
        'Nassau cultural tours',
        'Nassau adventure tours',
        'Things to do in Nassau'
      ]
    },
    whyVisit: [
      'Rich colonial history with historic forts and architecture',
      'Crystal-clear turquoise waters perfect for water sports',
      'Famous swimming pigs and marine life encounters',
      'Vibrant Bahamian culture and authentic cuisine',
      'Beautiful beaches and excellent snorkeling',
      'Perfect blend of history and tropical adventure'
    ],
    bestTimeToVisit: {
      weather: 'Nassau enjoys tropical weather year-round with average temperatures of 82°F (28°C). The region has pleasant trade winds and occasional rain showers.',
      bestMonths: 'December to April offers the best weather with minimal rainfall, perfect beach conditions, and ideal temperatures for all activities.',
      peakSeason: 'December to April brings peak tourist season with higher prices but guaranteed excellent weather and minimal hurricane risk.',
      offSeason: 'May to November offers lower prices and fewer crowds, though June to November is hurricane season with occasional storms.'
    },
    gettingAround: 'Use taxis, rent a car for flexibility, or take organized tours. Many resorts offer shuttle services, and the downtown area is walkable.',
    highlights: [
      'Paradise Island - Home to Atlantis Resort and beautiful beaches',
      'Fort Charlotte - Historic British colonial fort with stunning views',
      'Pig Beach - Famous swimming pigs on nearby islands',
      'Queen\'s Staircase - Historic landmark carved from limestone',
      'Cable Beach - One of the most beautiful beaches in the Bahamas',
      'Straw Market - Authentic Bahamian crafts and souvenirs'
    ]
  },
  {
    id: 'exuma',
    name: 'Exuma',
    fullName: 'Exuma',
    country: 'Bahamas',
    category: 'Caribbean',
    briefDescription: 'Pristine beaches, swimming pigs, and crystal-clear waters — Exuma is the Bahamas\' most stunning island chain.',
    heroDescription: 'Welcome to Exuma, where turquoise waters meet white sand beaches and swimming pigs create unforgettable memories. From exploring hidden coves to swimming with marine life, this paradise offers the ultimate Bahamian adventure. Let our AI-powered planner help you discover the best experiences this stunning destination has to offer.',
    imageUrl: 'https://ouqeoizufbofdqbuiwvx.supabase.co/storage/v1/object/public/destinations//exuma.jpg',
    tourCategories: [
      { name: 'Swimming Pigs Tours', hasGuide: true },
      { name: 'Boat Tours', hasGuide: true },
      { name: 'Snorkeling Tours', hasGuide: true },
      { name: 'Beach Tours', hasGuide: true },
      { name: 'Adventure Tours', hasGuide: true },
      { name: 'Island Hopping', hasGuide: true }
    ],
    seo: {
      title: 'Exuma Tours & Excursions - Top-Rated Activities & Adventures',
      description: 'Discover top-rated Exuma tours, excursions, and activities powered by AI. From swimming pigs to snorkeling, find the perfect way to explore Exuma.',
      keywords: 'Exuma tours, Exuma Bahamas tours, swimming pigs Exuma, Exuma excursions, things to do in Exuma',
      primaryKeyword: 'Exuma tours',
      secondaryKeywords: [
        'Exuma swimming pigs tours',
        'Exuma boat tours',
        'Exuma snorkeling tours',
        'Exuma beach tours',
        'Exuma adventure tours',
        'Things to do in Exuma'
      ]
    },
    whyVisit: [
      'Famous swimming pigs on Big Major Cay',
      'Crystal-clear waters perfect for snorkeling and diving',
      'Pristine white sand beaches and hidden coves',
      'Excellent marine life and coral reefs',
      'Authentic Bahamian island experience',
      'Perfect for water sports and adventure activities'
    ],
    bestTimeToVisit: {
      weather: 'Exuma enjoys tropical weather year-round with average temperatures of 82°F (28°C). The region has pleasant trade winds and crystal-clear waters.',
      bestMonths: 'December to April offers the best weather with minimal rainfall, perfect water visibility, and ideal conditions for all water activities.',
      peakSeason: 'December to April brings peak tourist season with higher prices but guaranteed excellent weather and minimal hurricane risk.',
      offSeason: 'May to November offers lower prices and fewer crowds, though June to November is hurricane season with occasional storms.'
    },
    gettingAround: 'Use organized boat tours, rent a boat, or take water taxis between islands. Many tours include transportation and equipment.',
    highlights: [
      'Big Major Cay - Home to the famous swimming pigs',
      'Thunderball Grotto - Underwater cave system from James Bond films',
      'Staniel Cay - Beautiful island with excellent snorkeling',
      'Compass Cay - Nurse sharks and pristine beaches',
      'Great Exuma - Main island with charming settlements',
      'Little Exuma - Secluded beaches and authentic Bahamian life'
    ]
  },
  {
    id: 'puerto-rico',
    name: 'Puerto Rico',
    fullName: 'Puerto Rico',
    category: 'Caribbean',
    briefDescription: 'Rich culture, historic forts, and tropical beauty — Puerto Rico is the Caribbean\'s most diverse island destination.',
    heroDescription: 'Welcome to Puerto Rico, where Spanish colonial history meets Caribbean charm. From exploring the historic streets of Old San Juan to hiking in El Yunque rainforest, this island offers an incredible blend of culture, history, and natural beauty. Let our AI-powered planner help you discover the best experiences this vibrant destination has to offer.',
    imageUrl: 'https://ouqeoizufbofdqbuiwvx.supabase.co/storage/v1/object/public/destinations//puerto%20rico.jpg',
    tourCategories: [
      { name: 'Historical Tours', hasGuide: true },
      { name: 'Rainforest Tours', hasGuide: true },
      { name: 'Beach Tours', hasGuide: true },
      { name: 'Cultural Tours', hasGuide: true },
      { name: 'Adventure Tours', hasGuide: true },
      { name: 'Food Tours', hasGuide: true }
    ],
    seo: {
      title: 'Puerto Rico Tours & Excursions - Top-Rated Activities & Adventures',
      description: 'Discover top-rated Puerto Rico tours, excursions, and activities powered by AI. From historical tours to rainforest adventures, find the perfect way to explore Puerto Rico.',
      keywords: 'Puerto Rico tours, Puerto Rico excursions, Old San Juan tours, El Yunque tours, things to do in Puerto Rico',
      primaryKeyword: 'Puerto Rico tours',
      secondaryKeywords: [
        'Puerto Rico historical tours',
        'Puerto Rico rainforest tours',
        'Puerto Rico beach tours',
        'Puerto Rico cultural tours',
        'Puerto Rico adventure tours',
        'Things to do in Puerto Rico'
      ]
    },
    whyVisit: [
      'Historic Old San Juan with Spanish colonial architecture',
      'El Yunque National Forest - Only tropical rainforest in US',
      'Rich Puerto Rican culture and authentic cuisine',
      'Beautiful beaches and crystal-clear waters',
      'Bioluminescent bays and natural wonders',
      'Perfect blend of history, culture, and adventure'
    ],
    bestTimeToVisit: {
      weather: 'Puerto Rico enjoys tropical weather year-round with average temperatures of 82°F (28°C). The island has pleasant trade winds and occasional rain showers.',
      bestMonths: 'December to April offers the best weather with minimal rainfall, comfortable temperatures, and perfect conditions for all activities.',
      peakSeason: 'December to April brings peak tourist season with higher prices but guaranteed excellent weather and minimal hurricane risk.',
      offSeason: 'May to November offers lower prices and fewer crowds, though June to November is hurricane season with occasional storms.'
    },
    gettingAround: 'Rent a car for maximum flexibility, use public transportation in San Juan, or take organized tours. Taxis and ride-sharing are readily available.',
    highlights: [
      'Old San Juan - Historic Spanish colonial district',
      'El Yunque National Forest - Tropical rainforest with waterfalls',
      'Bioluminescent Bay - Glowing waters in Fajardo',
      'Castillo San Felipe del Morro - Historic Spanish fort',
      'Culebra Island - Pristine beaches and snorkeling',
      'Vieques Island - Secluded beaches and bioluminescent bay'
    ]
  },
  {
    id: 'turks-and-caicos',
    name: 'Turks and Caicos',
    fullName: 'Turks and Caicos',
    category: 'Caribbean',
    briefDescription: 'Pristine beaches, world-class diving, and luxury resorts — Turks and Caicos is the Caribbean\'s ultimate paradise.',
    heroDescription: 'Welcome to Turks and Caicos, where powder-white beaches meet crystal-clear turquoise waters. From world-class diving on the third-largest barrier reef to relaxing on pristine shores, this archipelago offers the perfect Caribbean escape. Let our AI-powered planner help you discover the best experiences this stunning destination has to offer.',
    imageUrl: 'https://ouqeoizufbofdqbuiwvx.supabase.co/storage/v1/object/public/destinations//turks%20and%20caicos.webp',
    tourCategories: [
      { name: 'Diving Tours', hasGuide: true },
      { name: 'Beach Tours', hasGuide: true },
      { name: 'Snorkeling Tours', hasGuide: true },
      { name: 'Boat Tours', hasGuide: true },
      { name: 'Adventure Tours', hasGuide: true },
      { name: 'Luxury Tours', hasGuide: true }
    ],
    seo: {
      title: 'Turks and Caicos Tours & Excursions - Top-Rated Activities & Adventures',
      description: 'Discover top-rated Turks and Caicos tours, excursions, and activities powered by AI. From diving to beach tours, find the perfect way to explore Turks and Caicos.',
      keywords: 'Turks and Caicos tours, Turks and Caicos diving, Turks and Caicos excursions, things to do in Turks and Caicos',
      primaryKeyword: 'Turks and Caicos tours',
      secondaryKeywords: [
        'Turks and Caicos diving tours',
        'Turks and Caicos beach tours',
        'Turks and Caicos snorkeling tours',
        'Turks and Caicos boat tours',
        'Turks and Caicos adventure tours',
        'Things to do in Turks and Caicos'
      ]
    },
    whyVisit: [
      'World-class diving on the third-largest barrier reef',
      'Pristine powder-white beaches with crystal-clear waters',
      'Luxury resorts and excellent service',
      'Excellent marine life and coral reefs',
      'Relaxed atmosphere and uncrowded beaches',
      'Perfect for water sports and luxury relaxation'
    ],
    bestTimeToVisit: {
      weather: 'Turks and Caicos enjoys tropical weather year-round with average temperatures of 82°F (28°C). The region has pleasant trade winds and excellent water visibility.',
      bestMonths: 'December to April offers the best weather with minimal rainfall, perfect water visibility, and ideal conditions for diving and beach activities.',
      peakSeason: 'December to April brings peak tourist season with higher prices but guaranteed excellent weather and minimal hurricane risk.',
      offSeason: 'May to November offers lower prices and fewer crowds, though June to November is hurricane season with occasional storms.'
    },
    gettingAround: 'Rent a car for flexibility, use taxis, or take organized tours. Many resorts offer shuttle services and water taxis between islands.',
    highlights: [
      'Grace Bay Beach - One of the world\'s most beautiful beaches',
      'Providenciales - Main island with luxury resorts',
      'Grand Turk - Historic island with excellent diving',
      'Chalk Sound - Stunning turquoise lagoon',
      'Conch Bar Caves - Largest cave system in the Caribbean',
      'Salt Cay - Historic salt industry and whale watching'
    ]
  },
  {
    id: 'grenada',
    name: 'Grenada',
    fullName: 'Grenada',
    category: 'Caribbean',
    briefDescription: 'Spice island charm, pristine beaches, and lush rainforests — Grenada is the Caribbean\'s hidden gem.',
    heroDescription: 'Welcome to Grenada, the Spice Island of the Caribbean. From exploring aromatic spice plantations to diving pristine coral reefs, this island offers an authentic Caribbean experience with rich culture and natural beauty. Let our AI-powered planner help you discover the best experiences this enchanting destination has to offer.',
    imageUrl: 'https://ouqeoizufbofdqbuiwvx.supabase.co/storage/v1/object/public/destinations//grenada.jpg',
    tourCategories: [
      { name: 'Spice Tours', hasGuide: true },
      { name: 'Rainforest Tours', hasGuide: true },
      { name: 'Beach Tours', hasGuide: true },
      { name: 'Diving Tours', hasGuide: true },
      { name: 'Cultural Tours', hasGuide: true },
      { name: 'Adventure Tours', hasGuide: true }
    ],
    seo: {
      title: 'Grenada Tours & Excursions - Top-Rated Activities & Adventures',
      description: 'Discover top-rated Grenada tours, excursions, and activities powered by AI. From spice tours to diving, find the perfect way to explore Grenada.',
      keywords: 'Grenada tours, Grenada spice tours, Grenada excursions, things to do in Grenada',
      primaryKeyword: 'Grenada tours',
      secondaryKeywords: [
        'Grenada spice tours',
        'Grenada rainforest tours',
        'Grenada beach tours',
        'Grenada diving tours',
        'Grenada cultural tours',
        'Things to do in Grenada'
      ]
    },
    whyVisit: [
      'Famous spice plantations and aromatic experiences',
      'Lush rainforests and stunning waterfalls',
      'Pristine beaches and excellent diving',
      'Authentic Caribbean culture and cuisine',
      'Less crowded than other Caribbean destinations',
      'Perfect blend of adventure and relaxation'
    ],
    bestTimeToVisit: {
      weather: 'Grenada enjoys tropical weather year-round with average temperatures of 82°F (28°C). The island has pleasant trade winds and lush vegetation.',
      bestMonths: 'December to April offers the best weather with minimal rainfall, perfect conditions for all activities, and ideal spice harvesting.',
      peakSeason: 'December to April brings peak tourist season with higher prices but guaranteed excellent weather and minimal hurricane risk.',
      offSeason: 'May to November offers lower prices and fewer crowds, though June to November is hurricane season with occasional storms.'
    },
    gettingAround: 'Rent a car for flexibility, use taxis, or take organized tours. Many tours include transportation and the island is relatively small.',
    highlights: [
      'Grand Etang National Park - Lush rainforest and crater lake',
      'Spice Plantations - Nutmeg, cinnamon, and cocoa tours',
      'Grand Anse Beach - One of the Caribbean\'s best beaches',
      'Underwater Sculpture Park - Unique diving experience',
      'Concord Falls - Beautiful three-tiered waterfall',
      'St. George\'s - Charming capital with colorful architecture'
    ]
  },
  {
    id: 'st-martin',
    name: 'St. Martin',
    fullName: 'St. Martin / Sint Maarten',
    category: 'Caribbean',
    briefDescription: 'Dual-nation charm, pristine beaches, and culinary excellence — St. Martin is the Caribbean\'s most unique island.',
    heroDescription: 'Welcome to St. Martin, where French sophistication meets Dutch hospitality on one beautiful island. From world-class dining to pristine beaches and vibrant culture, this dual-nation paradise offers the best of both worlds. Let our AI-powered planner help you discover the best experiences this unique destination has to offer.',
    imageUrl: 'https://ouqeoizufbofdqbuiwvx.supabase.co/storage/v1/object/public/destinations//St%20martin.jpg',
    tourCategories: [
      { name: 'Beach Tours', hasGuide: true },
      { name: 'Food Tours', hasGuide: true },
      { name: 'Cultural Tours', hasGuide: true },
      { name: 'Water Sports', hasGuide: true },
      { name: 'Adventure Tours', hasGuide: true },
      { name: 'Shopping Tours', hasGuide: true }
    ],
    seo: {
      title: 'St. Martin Tours & Excursions - Top-Rated Activities & Adventures',
      description: 'Discover top-rated St. Martin tours, excursions, and activities powered by AI. From beach tours to culinary experiences, find the perfect way to explore St. Martin.',
      keywords: 'St. Martin tours, Sint Maarten tours, St. Martin excursions, things to do in St. Martin',
      primaryKeyword: 'St. Martin tours',
      secondaryKeywords: [
        'St. Martin beach tours',
        'St. Martin food tours',
        'St. Martin cultural tours',
        'St. Martin water sports',
        'St. Martin adventure tours',
        'Things to do in St. Martin'
      ]
    },
    whyVisit: [
      'Unique dual-nation experience (French and Dutch)',
      'World-class dining and culinary excellence',
      'Pristine beaches and crystal-clear waters',
      'Duty-free shopping and vibrant nightlife',
      'Rich cultural heritage and friendly locals',
      'Perfect blend of relaxation and excitement'
    ],
    bestTimeToVisit: {
      weather: 'St. Martin enjoys tropical weather year-round with average temperatures of 82°F (28°C). The island has pleasant trade winds and occasional rain showers.',
      bestMonths: 'December to April offers the best weather with minimal rainfall, perfect beach conditions, and ideal temperatures for all activities.',
      peakSeason: 'December to April brings peak tourist season with higher prices but guaranteed excellent weather and minimal hurricane risk.',
      offSeason: 'May to November offers lower prices and fewer crowds, though June to November is hurricane season with occasional storms.'
    },
    gettingAround: 'Rent a car for flexibility, use taxis, or take organized tours. The island is small and easy to navigate between French and Dutch sides.',
    highlights: [
      'Maho Beach - Famous for airplane landings',
      'Orient Bay - Beautiful beach with water sports',
      'Philipsburg - Dutch capital with duty-free shopping',
      'Marigot - French capital with excellent dining',
      'Pinel Island - Perfect for snorkeling and relaxation',
      'Grand Case - Culinary capital of the Caribbean'
    ]
  },
  {
    id: 'bonaire',
    name: 'Bonaire',
    fullName: 'Bonaire',
    category: 'Caribbean',
    briefDescription: 'Diving paradise, pristine reefs, and natural beauty — Bonaire is the Caribbean\'s premier underwater destination.',
    heroDescription: 'Welcome to Bonaire, where crystal-clear waters reveal some of the world\'s most pristine coral reefs. From shore diving to exploring the protected marine park, this island offers an unparalleled underwater adventure. Let our AI-powered planner help you discover the best experiences this diving paradise has to offer.',
    imageUrl: 'https://ouqeoizufbofdqbuiwvx.supabase.co/storage/v1/object/public/destinations//Bonaire.jpg',
    tourCategories: [
      { name: 'Diving Tours', hasGuide: true },
      { name: 'Snorkeling Tours', hasGuide: true },
      { name: 'Marine Park Tours', hasGuide: true },
      { name: 'Beach Tours', hasGuide: true },
      { name: 'Adventure Tours', hasGuide: true },
      { name: 'Nature Tours', hasGuide: true }
    ],
    seo: {
      title: 'Bonaire Tours & Excursions - Top-Rated Activities & Adventures',
      description: 'Discover top-rated Bonaire tours, excursions, and activities powered by AI. From diving to marine park exploration, find the perfect way to explore Bonaire.',
      keywords: 'Bonaire tours, Bonaire diving, Bonaire excursions, things to do in Bonaire',
      primaryKeyword: 'Bonaire tours',
      secondaryKeywords: [
        'Bonaire diving tours',
        'Bonaire snorkeling tours',
        'Bonaire marine park tours',
        'Bonaire beach tours',
        'Bonaire adventure tours',
        'Things to do in Bonaire'
      ]
    },
    whyVisit: [
      'World-class diving with pristine coral reefs',
      'Bonaire Marine Park - Protected underwater paradise',
      'Shore diving accessible from most beaches',
      'Excellent marine life and biodiversity',
      'Relaxed atmosphere and uncrowded beaches',
      'Perfect for water sports and nature lovers'
    ],
    bestTimeToVisit: {
      weather: 'Bonaire enjoys tropical weather year-round with average temperatures of 82°F (28°C). The island has pleasant trade winds and excellent water visibility.',
      bestMonths: 'December to April offers the best weather with minimal rainfall, perfect water visibility, and ideal conditions for diving and snorkeling.',
      peakSeason: 'December to April brings peak tourist season with higher prices but guaranteed excellent weather and minimal hurricane risk.',
      offSeason: 'May to November offers lower prices and fewer crowds, though June to November is hurricane season with occasional storms.'
    },
    gettingAround: 'Rent a car for flexibility, use taxis, or take organized tours. Many dive sites are accessible by car and the island is relatively small.',
    highlights: [
      'Bonaire Marine Park - Protected coral reefs',
      'Klein Bonaire - Uninhabited island with pristine beaches',
      'Washington Slagbaai National Park - Natural beauty and hiking',
      'Lac Bay - Perfect for windsurfing and kiteboarding',
      'Salt Flats - Historic salt industry and flamingos',
      'Donkey Sanctuary - Unique wildlife experience'
    ]
  },
  {
    id: 'cayman-islands',
    name: 'Cayman Islands',
    fullName: 'Cayman Islands',
    category: 'Caribbean',
    briefDescription: 'Luxury resorts, world-class diving, and pristine beaches — Cayman Islands is the Caribbean\'s sophisticated paradise.',
    heroDescription: 'Welcome to the Cayman Islands, where luxury meets natural beauty in the heart of the Caribbean. From world-class diving at Stingray City to relaxing on Seven Mile Beach, this archipelago offers the perfect blend of adventure and sophistication. Let our AI-powered planner help you discover the best experiences this stunning destination has to offer.',
    imageUrl: 'https://ouqeoizufbofdqbuiwvx.supabase.co/storage/v1/object/public/destinations//cayman%20islands.jpg',
    tourCategories: [
      { name: 'Diving Tours', hasGuide: true },
      { name: 'Beach Tours', hasGuide: true },
      { name: 'Stingray Tours', hasGuide: true },
      { name: 'Luxury Tours', hasGuide: true },
      { name: 'Adventure Tours', hasGuide: true },
      { name: 'Cultural Tours', hasGuide: true }
    ],
    seo: {
      title: 'Cayman Islands Tours & Excursions - Top-Rated Activities & Adventures',
      description: 'Discover top-rated Cayman Islands tours, excursions, and activities powered by AI. From diving to luxury experiences, find the perfect way to explore the Cayman Islands.',
      keywords: 'Cayman Islands tours, Cayman Islands diving, Stingray City tours, things to do in Cayman Islands',
      primaryKeyword: 'Cayman Islands tours',
      secondaryKeywords: [
        'Cayman Islands diving tours',
        'Cayman Islands beach tours',
        'Cayman Islands stingray tours',
        'Cayman Islands luxury tours',
        'Cayman Islands adventure tours',
        'Things to do in Cayman Islands'
      ]
    },
    whyVisit: [
      'Stingray City - Famous stingray encounters',
      'Seven Mile Beach - One of the Caribbean\'s best beaches',
      'World-class diving and snorkeling',
      'Luxury resorts and excellent service',
      'Financial center with sophisticated atmosphere',
      'Perfect blend of adventure and luxury'
    ],
    bestTimeToVisit: {
      weather: 'Cayman Islands enjoy tropical weather year-round with average temperatures of 82°F (28°C). The region has pleasant trade winds and excellent water visibility.',
      bestMonths: 'December to April offers the best weather with minimal rainfall, perfect water visibility, and ideal conditions for all activities.',
      peakSeason: 'December to April brings peak tourist season with higher prices but guaranteed excellent weather and minimal hurricane risk.',
      offSeason: 'May to November offers lower prices and fewer crowds, though June to November is hurricane season with occasional storms.'
    },
    gettingAround: 'Rent a car for flexibility, use taxis, or take organized tours. Many resorts offer shuttle services and the islands are relatively small.',
    highlights: [
      'Stingray City - Famous sandbar with friendly stingrays',
      'Seven Mile Beach - Pristine white sand beach',
      'Grand Cayman - Main island with luxury resorts',
      'Cayman Brac - Excellent diving and rock climbing',
      'Little Cayman - Secluded paradise with pristine reefs',
      'George Town - Capital with duty-free shopping'
    ]
  },
  {
    id: 'antigua-and-barbuda',
    name: 'Antigua and Barbuda',
    fullName: 'Antigua and Barbuda',
    category: 'Caribbean',
    briefDescription: '365 beaches, historic harbors, and sailing paradise — Antigua and Barbuda is the Caribbean\'s beach lover\'s dream.',
    heroDescription: 'Welcome to Antigua and Barbuda, where you can visit a different beach every day of the year. From historic Nelson\'s Dockyard to pristine pink sand beaches, this dual-island nation offers the perfect blend of history, culture, and natural beauty. Let our AI-powered planner help you discover the best experiences this stunning destination has to offer.',
    imageUrl: 'https://ouqeoizufbofdqbuiwvx.supabase.co/storage/v1/object/public/destinations//Antigua%20and%20Barbuda.jpg',
    tourCategories: [
      { name: 'Beach Tours', hasGuide: true },
      { name: 'Sailing Tours', hasGuide: true },
      { name: 'Historical Tours', hasGuide: true },
      { name: 'Water Sports', hasGuide: true },
      { name: 'Adventure Tours', hasGuide: true },
      { name: 'Cultural Tours', hasGuide: true }
    ],
    seo: {
      title: 'Antigua and Barbuda Tours & Excursions - Top-Rated Activities & Adventures',
      description: 'Discover top-rated Antigua and Barbuda tours, excursions, and activities powered by AI. From beach tours to sailing adventures, find the perfect way to explore Antigua and Barbuda.',
      keywords: 'Antigua and Barbuda tours, Antigua tours, Barbuda tours, sailing tours, things to do in Antigua and Barbuda',
      primaryKeyword: 'Antigua and Barbuda tours',
      secondaryKeywords: [
        'Antigua and Barbuda beach tours',
        'Antigua and Barbuda sailing tours',
        'Antigua and Barbuda historical tours',
        'Antigua and Barbuda water sports',
        'Antigua and Barbuda adventure tours',
        'Things to do in Antigua and Barbuda'
      ]
    },
    whyVisit: [
      '365 beaches - one for every day of the year',
      'Historic Nelson\'s Dockyard UNESCO World Heritage site',
      'World-class sailing and yachting destination',
      'Pristine pink sand beaches on Barbuda',
      'Rich colonial history and culture',
      'Perfect blend of adventure and relaxation'
    ],
    bestTimeToVisit: {
      weather: 'Antigua and Barbuda enjoy tropical weather year-round with average temperatures of 82°F (28°C). The islands have pleasant trade winds and excellent sailing conditions.',
      bestMonths: 'December to April offers the best weather with minimal rainfall, perfect beach conditions, and ideal temperatures for all activities.',
      peakSeason: 'December to April brings peak tourist season with higher prices but guaranteed excellent weather and minimal hurricane risk.',
      offSeason: 'May to November offers lower prices and fewer crowds, though June to November is hurricane season with occasional storms.'
    },
    gettingAround: 'Rent a car for flexibility, use taxis, or take organized tours. Ferries connect Antigua and Barbuda, and many resorts offer shuttle services.',
    highlights: [
      'Nelson\'s Dockyard - Historic UNESCO World Heritage site',
      'Shirley Heights - Panoramic views and Sunday parties',
      'Barbuda Pink Sand Beach - One of the world\'s most beautiful beaches',
      'English Harbour - Historic sailing port and marina',
      'Devil\'s Bridge - Natural limestone arch formation',
      'Falmouth Harbour - Luxury yachting destination'
    ]
  },
  {
    id: 'trinidad-and-tobago',
    name: 'Trinidad and Tobago',
    fullName: 'Trinidad and Tobago',
    category: 'Caribbean',
    briefDescription: 'Carnival culture, pristine beaches, and vibrant energy — Trinidad and Tobago is the Caribbean\'s most dynamic destination.',
    heroDescription: 'Welcome to Trinidad and Tobago, where Carnival spirit meets natural beauty. From the world-famous Carnival celebrations to pristine beaches and lush rainforests, this dual-island nation offers an authentic Caribbean experience with rich culture and biodiversity. Let our AI-powered planner help you discover the best experiences this vibrant destination has to offer.',
    imageUrl: 'https://ouqeoizufbofdqbuiwvx.supabase.co/storage/v1/object/public/destinations//Trinidad%20and%20Tobago.jpeg',
    tourCategories: [
      { name: 'Carnival Tours', hasGuide: true },
      { name: 'Beach Tours', hasGuide: true },
      { name: 'Cultural Tours', hasGuide: true },
      { name: 'Nature Tours', hasGuide: true },
      { name: 'Adventure Tours', hasGuide: true },
      { name: 'Food Tours', hasGuide: true }
    ],
    seo: {
      title: 'Trinidad and Tobago Tours & Excursions - Top-Rated Activities & Adventures',
      description: 'Discover top-rated Trinidad and Tobago tours, excursions, and activities powered by AI. From Carnival to nature tours, find the perfect way to explore Trinidad and Tobago.',
      keywords: 'Trinidad and Tobago tours, Carnival tours, Trinidad tours, Tobago tours, things to do in Trinidad and Tobago',
      primaryKeyword: 'Trinidad and Tobago tours',
      secondaryKeywords: [
        'Trinidad and Tobago Carnival tours',
        'Trinidad and Tobago beach tours',
        'Trinidad and Tobago cultural tours',
        'Trinidad and Tobago nature tours',
        'Trinidad and Tobago adventure tours',
        'Things to do in Trinidad and Tobago'
      ]
    },
    whyVisit: [
      'World-famous Carnival celebrations and culture',
      'Pristine beaches and excellent diving',
      'Rich biodiversity and nature reserves',
      'Authentic Caribbean culture and cuisine',
      'Less touristy than other Caribbean destinations',
      'Perfect blend of culture, nature, and adventure'
    ],
    bestTimeToVisit: {
      weather: 'Trinidad and Tobago enjoy tropical weather year-round with average temperatures of 82°F (28°C). The islands have distinct wet and dry seasons and are located outside the hurricane belt, making them safer year-round.',
      bestMonths: 'January to May offers the best weather with minimal rainfall, perfect conditions for all activities, and Carnival season.',
      peakSeason: 'February brings Carnival season with higher prices but incredible cultural experiences. December to April has excellent weather.',
      offSeason: 'June to December offers lower prices and fewer crowds, though with more rainfall during the wet season. The islands are hurricane-safe.'
    },
    gettingAround: 'Rent a car for flexibility, use taxis, or take organized tours. Domestic flights connect Trinidad and Tobago, and public transportation is available.',
    highlights: [
      'Port of Spain Carnival - World-famous celebration',
      'Pigeon Point Beach - Tobago\'s most beautiful beach',
      'Asa Wright Nature Centre - Birdwatching paradise',
      'Maracas Bay - Famous for shark and bake',
      'Buccoo Reef - Protected marine park and snorkeling',
      'Caroni Bird Sanctuary - Scarlet ibis and wildlife'
    ]
  },
  {
    id: 'british-virgin-islands',
    name: 'British Virgin Islands',
    fullName: 'British Virgin Islands',
    category: 'Caribbean',
    briefDescription: 'Sailing paradise, pristine beaches, and island hopping — British Virgin Islands is the Caribbean\'s ultimate adventure destination.',
    heroDescription: 'Welcome to the British Virgin Islands, where 60+ islands and cays create the perfect sailing and island-hopping paradise. From the Baths on Virgin Gorda to the famous beach bars of Jost Van Dyke, this archipelago offers endless adventure and natural beauty. Let our AI-powered planner help you discover the best experiences this stunning destination has to offer.',
    imageUrl: 'https://ouqeoizufbofdqbuiwvx.supabase.co/storage/v1/object/public/destinations//British%20Virgin%20Islands.jpg',
    tourCategories: [
      { name: 'Sailing Tours', hasGuide: true },
      { name: 'Island Hopping', hasGuide: true },
      { name: 'Beach Tours', hasGuide: true },
      { name: 'Diving Tours', hasGuide: true },
      { name: 'Adventure Tours', hasGuide: true },
      { name: 'Boat Tours', hasGuide: true }
    ],
    seo: {
      title: 'British Virgin Islands Tours & Excursions - Top-Rated Activities & Adventures',
      description: 'Discover top-rated British Virgin Islands tours, excursions, and activities powered by AI. From sailing to island hopping, find the perfect way to explore the British Virgin Islands.',
      keywords: 'British Virgin Islands tours, BVI tours, sailing tours, island hopping, things to do in British Virgin Islands',
      primaryKeyword: 'British Virgin Islands tours',
      secondaryKeywords: [
        'British Virgin Islands sailing tours',
        'British Virgin Islands island hopping',
        'British Virgin Islands beach tours',
        'British Virgin Islands diving tours',
        'British Virgin Islands adventure tours',
        'Things to do in British Virgin Islands'
      ]
    },
    whyVisit: [
      '60+ islands and cays perfect for sailing',
      'The Baths on Virgin Gorda - Unique rock formations',
      'Famous beach bars and island culture',
      'Pristine beaches and excellent diving',
      'Relaxed atmosphere and uncrowded islands',
      'Perfect for water sports and island exploration'
    ],
    bestTimeToVisit: {
      weather: 'British Virgin Islands enjoy tropical weather year-round with average temperatures of 82°F (28°C). The region has pleasant trade winds and excellent sailing conditions.',
      bestMonths: 'December to April offers the best weather with minimal rainfall, perfect sailing conditions, and ideal temperatures for all activities.',
      peakSeason: 'December to April brings peak tourist season with higher prices but guaranteed excellent weather and minimal hurricane risk.',
      offSeason: 'May to November offers lower prices and fewer crowds, though June to November is hurricane season with occasional storms.'
    },
    gettingAround: 'Charter a boat for the ultimate experience, use ferries between islands, or take organized tours. Many resorts offer water taxis and transportation.',
    highlights: [
      'The Baths - Virgin Gorda\'s unique rock formations',
      'Jost Van Dyke - Famous beach bars and relaxed vibe',
      'Anegada - Flat coral island with pristine beaches',
      'Tortola - Main island with charming settlements',
      'Norman Island - Inspiration for Treasure Island',
      'Cooper Island - Secluded paradise with excellent diving'
    ]
  },
  {
    id: 'st-kitts-and-nevis',
    name: 'St. Kitts and Nevis',
    fullName: 'St. Kitts and Nevis',
    category: 'Caribbean',
    briefDescription: 'Historic charm, volcanic peaks, and pristine beaches — St. Kitts and Nevis is the Caribbean\'s hidden treasure.',
    heroDescription: 'Welcome to St. Kitts and Nevis, where volcanic peaks meet pristine beaches and rich colonial history. From exploring historic Brimstone Hill Fortress to hiking Mount Liamuiga, this dual-island nation offers the perfect blend of adventure and relaxation. Let our AI-powered planner help you discover the best experiences this stunning destination has to offer.',
    imageUrl: 'https://ouqeoizufbofdqbuiwvx.supabase.co/storage/v1/object/public/destinations//St.%20Kitts%20and%20Nevis.jpeg',
    tourCategories: [
      { name: 'Historical Tours', hasGuide: true },
      { name: 'Hiking Tours', hasGuide: true },
      { name: 'Beach Tours', hasGuide: true },
      { name: 'Cultural Tours', hasGuide: true },
      { name: 'Adventure Tours', hasGuide: true },
      { name: 'Railway Tours', hasGuide: true }
    ],
    seo: {
      title: 'St. Kitts and Nevis Tours & Excursions - Top-Rated Activities & Adventures',
      description: 'Discover top-rated St. Kitts and Nevis tours, excursions, and activities powered by AI. From historical tours to hiking adventures, find the perfect way to explore St. Kitts and Nevis.',
      keywords: 'St. Kitts and Nevis tours, St. Kitts tours, Nevis tours, things to do in St. Kitts and Nevis',
      primaryKeyword: 'St. Kitts and Nevis tours',
      secondaryKeywords: [
        'St. Kitts and Nevis historical tours',
        'St. Kitts and Nevis hiking tours',
        'St. Kitts and Nevis beach tours',
        'St. Kitts and Nevis cultural tours',
        'St. Kitts and Nevis adventure tours',
        'Things to do in St. Kitts and Nevis'
      ]
    },
    whyVisit: [
      'Brimstone Hill Fortress - UNESCO World Heritage site',
      'Mount Liamuiga - Volcanic peak for hiking',
      'Pristine beaches and excellent diving',
      'Rich colonial history and culture',
      'Less crowded than other Caribbean destinations',
      'Perfect blend of adventure and relaxation'
    ],
    bestTimeToVisit: {
      weather: 'St. Kitts and Nevis enjoy tropical weather year-round with average temperatures of 82°F (28°C). The islands have pleasant trade winds and lush vegetation.',
      bestMonths: 'December to April offers the best weather with minimal rainfall, perfect conditions for hiking and all activities.',
      peakSeason: 'December to April brings peak tourist season with higher prices but guaranteed excellent weather and minimal hurricane risk.',
      offSeason: 'May to November offers lower prices and fewer crowds, though June to November is hurricane season with occasional storms.'
    },
    gettingAround: 'Rent a car for flexibility, use taxis, or take organized tours. Ferries connect St. Kitts and Nevis, and many resorts offer shuttle services.',
    highlights: [
      'Brimstone Hill Fortress - Historic UNESCO site',
      'Mount Liamuiga - Volcanic peak and hiking destination',
      'Scenic Railway - Historic sugar train tour',
      'Pinney\'s Beach - Nevis\' most beautiful beach',
      'Charlestown - Charming Nevis capital',
      'Basseterre - Historic St. Kitts capital'
    ]
  },
  {
    id: 'martinique',
    name: 'Martinique',
    fullName: 'Martinique',
    category: 'Caribbean',
    briefDescription: 'French Caribbean charm, volcanic peaks, and rum heritage — Martinique is the Caribbean\'s sophisticated island.',
    heroDescription: 'Welcome to Martinique, where French sophistication meets Caribbean charm. From exploring the volcanic Mount Pelée to tasting world-famous rum, this French overseas territory offers a unique blend of European culture and tropical beauty. Let our AI-powered planner help you discover the best experiences this enchanting destination has to offer.',
    imageUrl: 'https://ouqeoizufbofdqbuiwvx.supabase.co/storage/v1/object/public/destinations//Martinique.jpg',
    tourCategories: [
      { name: 'Rum Tours', hasGuide: true },
      { name: 'Volcano Tours', hasGuide: true },
      { name: 'Beach Tours', hasGuide: true },
      { name: 'Cultural Tours', hasGuide: true },
      { name: 'Adventure Tours', hasGuide: true },
      { name: 'Food Tours', hasGuide: true }
    ],
    seo: {
      title: 'Martinique Tours & Excursions - Top-Rated Activities & Adventures',
      description: 'Discover top-rated Martinique tours, excursions, and activities powered by AI. From rum tours to volcano adventures, find the perfect way to explore Martinique.',
      keywords: 'Martinique tours, Martinique rum tours, Mount Pelée tours, things to do in Martinique',
      primaryKeyword: 'Martinique tours',
      secondaryKeywords: [
        'Martinique rum tours',
        'Martinique volcano tours',
        'Martinique beach tours',
        'Martinique cultural tours',
        'Martinique adventure tours',
        'Things to do in Martinique'
      ]
    },
    whyVisit: [
      'Mount Pelée - Active volcano and hiking destination',
      'World-famous rum distilleries and heritage',
      'French Caribbean culture and cuisine',
      'Pristine beaches and excellent diving',
      'Less touristy than other Caribbean destinations',
      'Perfect blend of adventure and sophistication'
    ],
    bestTimeToVisit: {
      weather: 'Martinique enjoys tropical weather year-round with average temperatures of 82°F (28°C). The island has pleasant trade winds, lush vegetation, and distinct dry (December to April) and wet (May to November) seasons.',
      bestMonths: 'December to April offers the best weather with minimal rainfall, perfect conditions for hiking and all activities.',
      peakSeason: 'December to April brings peak tourist season with higher prices but guaranteed excellent weather and minimal hurricane risk.',
      offSeason: 'May to November offers lower prices and fewer crowds, though June to November is hurricane season with occasional storms.'
    },
    gettingAround: 'Rent a car for flexibility, use public transportation, or take organized tours. The island has good roads and many attractions are easily accessible.',
    highlights: [
      'Mount Pelée - Active volcano and hiking destination',
      'Rum Distilleries - World-famous rum heritage',
      'Les Salines Beach - One of the Caribbean\'s best beaches',
      'Fort-de-France - Charming French colonial capital',
      'Jardin de Balata - Beautiful botanical gardens',
      'Diamond Rock - Historic landmark and diving site'
    ]
  },
  {
    id: 'guadeloupe',
    name: 'Guadeloupe',
    fullName: 'Guadeloupe',
    category: 'Caribbean',
    briefDescription: 'Butterfly-shaped paradise, volcanic peaks, and French charm — Guadeloupe is the Caribbean\'s natural wonder.',
    heroDescription: 'Welcome to Guadeloupe, where the butterfly-shaped archipelago offers diverse landscapes from volcanic peaks to pristine beaches. From exploring the Soufrière volcano to relaxing on white sand beaches, this French overseas territory offers an authentic Caribbean experience with European sophistication. Let our AI-powered planner help you discover the best experiences this stunning destination has to offer.',
    imageUrl: 'https://ouqeoizufbofdqbuiwvx.supabase.co/storage/v1/object/public/destinations//Guadeloupe.jpg',
    tourCategories: [
      { name: 'Volcano Tours', hasGuide: true },
      { name: 'Beach Tours', hasGuide: true },
      { name: 'Cultural Tours', hasGuide: true },
      { name: 'Adventure Tours', hasGuide: true },
      { name: 'Nature Tours', hasGuide: true },
      { name: 'Food Tours', hasGuide: true }
    ],
    seo: {
      title: 'Guadeloupe Tours & Excursions - Top-Rated Activities & Adventures',
      description: 'Discover top-rated Guadeloupe tours, excursions, and activities powered by AI. From volcano tours to beach adventures, find the perfect way to explore Guadeloupe.',
      keywords: 'Guadeloupe tours, Soufrière volcano tours, Guadeloupe excursions, things to do in Guadeloupe',
      primaryKeyword: 'Guadeloupe tours',
      secondaryKeywords: [
        'Guadeloupe volcano tours',
        'Guadeloupe beach tours',
        'Guadeloupe cultural tours',
        'Guadeloupe adventure tours',
        'Guadeloupe nature tours',
        'Things to do in Guadeloupe'
      ]
    },
    whyVisit: [
      'Soufrière Volcano - Active volcano and hiking destination',
      'Butterfly-shaped archipelago with diverse landscapes',
      'French Caribbean culture and cuisine',
      'Pristine beaches and excellent diving',
      'Less touristy than other Caribbean destinations',
      'Perfect blend of adventure and natural beauty'
    ],
    bestTimeToVisit: {
      weather: 'Guadeloupe enjoys tropical weather year-round with average temperatures of 82°F (28°C). The island has pleasant trade winds, lush vegetation, and distinct dry (December to April) and wet (May to November) seasons.',
      bestMonths: 'December to April offers the best weather with minimal rainfall, perfect conditions for hiking and all activities.',
      peakSeason: 'December to April brings peak tourist season with higher prices but guaranteed excellent weather and minimal hurricane risk.',
      offSeason: 'May to November offers lower prices and fewer crowds, though June to November is hurricane season with occasional storms.'
    },
    gettingAround: 'Rent a car for flexibility, use public transportation, or take organized tours. The island has good roads and many attractions are easily accessible.',
    highlights: [
      'Soufrière Volcano - Active volcano and hiking destination',
      'Pointe-à-Pitre - Charming French colonial capital',
      'Les Saintes - Beautiful archipelago with pristine beaches',
      'La Soufrière - Volcanic peak and hiking destination',
      'Marie-Galante - Authentic island with sugar heritage',
      'Basse-Terre - Lush rainforest and natural beauty'
    ]
  },
  {
    id: 'paris',
    name: 'Paris',
    fullName: 'Paris',
    country: 'France',
    category: 'Europe',
    briefDescription: 'The City of Light, art, culture, and romance — Paris is the world\'s most enchanting capital.',
    relatedGuides: ['paris-travel-guide'],
    heroDescription: 'Welcome to Paris, where every street tells a story and every corner reveals a masterpiece. From the iconic Eiffel Tower to the charming Montmartre, from world-class museums to intimate cafés, this magical city offers the perfect blend of history, culture, and modern sophistication. Let our AI-powered planner help you discover the best experiences this timeless destination has to offer.',
    imageUrl: 'https://ouqeoizufbofdqbuiwvx.supabase.co/storage/v1/object/public/destinations//paris.jpg',
    tourCategories: [
      { name: 'Eiffel Tower Tours', hasGuide: true },
      { name: 'Louvre Museum Tours', hasGuide: true },
      { name: 'Seine River Cruises', hasGuide: true },
      { name: 'Food & Wine Tours', hasGuide: true },
      { name: 'Montmartre Art Tours', hasGuide: true },
      { name: 'Notre-Dame Tours', hasGuide: true }
    ],
    seo: {
      title: 'Paris Tours & Excursions - Top-Rated Activities & Adventures',
      description: 'Discover top-rated Paris tours, excursions, and activities powered by AI. From cultural tours to food experiences, find the perfect way to explore the City of Light.',
      keywords: 'Paris tours, Paris excursions, Paris activities, Eiffel Tower tours, Louvre tours, things to do in Paris',
      primaryKeyword: 'Paris tours',
      secondaryKeywords: [
        'Paris cultural tours',
        'Paris museum tours',
        'Paris food tours',
        'Paris historical tours',
        'Paris art tours',
        'Things to do in Paris'
      ]
    },
    whyVisit: [
      'Iconic landmarks like Eiffel Tower and Arc de Triomphe',
      'World-class museums including the Louvre and Musée d\'Orsay',
      'Charming neighborhoods and historic architecture',
      'Exceptional French cuisine and wine culture',
      'Rich history and artistic heritage',
      'Perfect blend of romance and sophistication'
    ],
    bestTimeToVisit: {
      weather: 'Paris enjoys a temperate climate with four distinct seasons. Summers are warm (70-80°F/21-27°C), winters are cool (35-45°F/2-7°C), and spring/fall offer mild temperatures.',
      bestMonths: 'April to June and September to October offer the best weather with mild temperatures, fewer crowds, and beautiful spring blooms or autumn colors.',
      peakSeason: 'June to August brings peak tourist season with warm weather but larger crowds and higher prices.',
      offSeason: 'November to March offers lower prices and fewer crowds, though with cooler weather and occasional rain.'
    },
    gettingAround: 'Excellent public transportation with Metro, buses, and RER trains. Walking is perfect for exploring central areas, and taxis/Uber are readily available.',
    highlights: [
      'Eiffel Tower - Iconic symbol of Paris',
      'Louvre Museum - World\'s largest art museum',
      'Notre-Dame Cathedral - Gothic masterpiece',
      'Champs-Élysées - Famous avenue and shopping',
      'Montmartre - Artistic neighborhood and Sacré-Cœur',
      'Seine River - Romantic boat cruises and walks'
    ]
  },
  {
    id: 'nice',
    name: 'Nice',
    fullName: 'Nice',
    country: 'France',
    category: 'Europe',
    briefDescription: 'Mediterranean charm, Promenade des Anglais, and French Riviera elegance — Nice is the gateway to the Côte d\'Azur.',
    heroDescription: 'Welcome to Nice, where the Mediterranean meets French sophistication. From the famous Promenade des Anglais to the colorful Old Town, from pristine beaches to world-class dining, this coastal gem offers the perfect blend of relaxation and culture. Let our AI-powered planner help you discover the best experiences this stunning destination has to offer.',
    imageUrl: 'https://ouqeoizufbofdqbuiwvx.supabase.co/storage/v1/object/public/destinations//Nice.webp',
    tourCategories: [
      { name: 'Promenade des Anglais Tours', hasGuide: true },
      { name: 'Old Town Walking Tours', hasGuide: true },
      { name: 'Mediterranean Beach Tours', hasGuide: true },
      { name: 'French Riviera Day Trips', hasGuide: true },
      { name: 'Castle Hill Tours', hasGuide: true },
      { name: 'Monaco Excursions', hasGuide: true }
    ],
    seo: {
      title: 'Nice Tours & Excursions - Top-Rated Activities & Adventures',
      description: 'Discover top-rated Nice tours, excursions, and activities powered by AI. From beach tours to cultural experiences, find the perfect way to explore the French Riviera.',
      keywords: 'Nice tours, Nice excursions, French Riviera tours, Promenade des Anglais, things to do in Nice',
      primaryKeyword: 'Nice tours',
      secondaryKeywords: [
        'Nice beach tours',
        'Nice cultural tours',
        'Nice food tours',
        'Nice coastal tours',
        'French Riviera tours',
        'Things to do in Nice'
      ]
    },
    whyVisit: [
      'Famous Promenade des Anglais along the Mediterranean',
      'Colorful Old Town (Vieux Nice) with authentic charm',
      'Pristine beaches and crystal-clear waters',
      'Exceptional French and Mediterranean cuisine',
      'Gateway to the French Riviera and Monaco',
      'Perfect climate year-round'
    ],
    bestTimeToVisit: {
      weather: 'Nice enjoys a Mediterranean climate with mild winters and warm summers. Average temperatures range from 50°F (10°C) in winter to 80°F (27°C) in summer.',
      bestMonths: 'May to June and September to October offer the best weather with warm temperatures, fewer crowds, and perfect conditions for all activities.',
      peakSeason: 'July to August brings peak tourist season with hot weather, crowded beaches, and higher prices.',
      offSeason: 'November to April offers lower prices and fewer crowds, though with cooler weather and occasional rain.'
    },
    gettingAround: 'Excellent public transportation with buses and trams. Walking is perfect for exploring the city center, and trains connect to other French Riviera destinations.',
    highlights: [
      'Promenade des Anglais - Famous coastal walkway',
      'Old Town (Vieux Nice) - Charming historic quarter',
      'Castle Hill - Panoramic views of the city',
      'Cours Saleya - Famous flower and food market',
      'Russian Orthodox Cathedral - Architectural gem',
      'Monaco and Monte Carlo - Easy day trip destination'
    ]
  },
  {
    id: 'french-riviera',
    name: 'French Riviera',
    fullName: 'French Riviera (Côte d\'Azur)',
    country: 'France',
    category: 'Europe',
    briefDescription: 'Luxury, glamour, and Mediterranean beauty — the French Riviera is Europe\'s most sophisticated coastline.',
    heroDescription: 'Welcome to the French Riviera, where luxury meets natural beauty along the stunning Mediterranean coast. From the glamorous beaches of Saint-Tropez to the artistic heritage of Antibes, from the casino culture of Monaco to the perfume capital of Grasse, this legendary region offers endless sophistication and charm. Let our AI-powered planner help you discover the best experiences this iconic destination has to offer.',
    imageUrl: 'https://ouqeoizufbofdqbuiwvx.supabase.co/storage/v1/object/public/destinations//french%20riviera.avif',
    tourCategories: [
      { name: 'Monaco & Monte Carlo Tours', hasGuide: true },
      { name: 'Saint-Tropez Beach Tours', hasGuide: true },
      { name: 'Antibes & Cannes Tours', hasGuide: true },
      { name: 'Provence Wine Tours', hasGuide: true },
      { name: 'Grasse Perfume Tours', hasGuide: true },
      { name: 'Eze Village Tours', hasGuide: true }
    ],
    seo: {
      title: 'French Riviera Tours & Excursions - Top-Rated Activities & Adventures',
      description: 'Discover top-rated French Riviera tours, excursions, and activities powered by AI. From luxury experiences to cultural tours, find the perfect way to explore the Côte d\'Azur.',
      keywords: 'French Riviera tours, Côte d\'Azur tours, Monaco tours, Saint-Tropez tours, things to do in French Riviera',
      primaryKeyword: 'French Riviera tours',
      secondaryKeywords: [
        'French Riviera luxury tours',
        'French Riviera beach tours',
        'French Riviera wine tours',
        'Monaco tours',
        'Saint-Tropez tours',
        'Things to do in French Riviera'
      ]
    },
    whyVisit: [
      'Legendary beaches and crystal-clear Mediterranean waters',
      'Glamorous destinations like Monaco and Saint-Tropez',
      'World-class dining and luxury experiences',
      'Rich artistic heritage and cultural sites',
      'Perfect climate and stunning coastal scenery',
      'Sophisticated atmosphere and international flair'
    ],
    bestTimeToVisit: {
      weather: 'The French Riviera enjoys a Mediterranean climate with mild winters and warm summers. Average temperatures range from 50°F (10°C) in winter to 85°F (29°C) in summer.',
      bestMonths: 'May to June and September to October offer the best weather with warm temperatures, fewer crowds, and perfect conditions for all activities.',
      peakSeason: 'July to August brings peak tourist season with hot weather, crowded beaches, and higher prices.',
      offSeason: 'November to April offers lower prices and fewer crowds, though with cooler weather and occasional rain.'
    },
    gettingAround: 'Excellent train connections along the coast, local buses, and car rentals for flexibility. Many resorts offer shuttle services and private transfers.',
    highlights: [
      'Monaco - Glamorous principality and casino culture',
      'Saint-Tropez - Famous beach destination and nightlife',
      'Antibes - Historic port and artistic heritage',
      'Cannes - Film festival city and luxury shopping',
      'Grasse - Perfume capital of the world',
      'Eze - Medieval village with stunning views'
    ]
  },
  {
    id: 'rome',
    name: 'Rome',
    fullName: 'Rome',
    country: 'Italy',
    category: 'Europe',
    briefDescription: 'The Eternal City, ancient ruins, and Renaissance art — Rome is history come to life.',
    relatedGuides: ['rome-weekend-guide'],
    heroDescription: 'Welcome to Rome, where every stone tells a story and every corner reveals a masterpiece. From the iconic Colosseum to the magnificent Vatican, from ancient ruins to Renaissance art, this eternal city offers the perfect blend of history, culture, and modern Italian life. Let our AI-powered planner help you discover the best experiences this timeless destination has to offer.',
    imageUrl: 'https://ouqeoizufbofdqbuiwvx.supabase.co/storage/v1/object/public/destinations//rome.jpg',
    tourCategories: [
      { name: 'Colosseum Tours', hasGuide: true },
      { name: 'Vatican Tours', hasGuide: true },
      { name: 'Ancient Rome Tours', hasGuide: true },
      { name: 'Food & Wine Tours', hasGuide: true },
      { name: 'Art & Architecture Tours', hasGuide: true },
      { name: 'Trevi Fountain Tours', hasGuide: true }
    ],
    seo: {
      title: 'Rome Tours & Excursions - Top-Rated Activities & Adventures',
      description: 'Discover top-rated Rome tours, excursions, and activities powered by AI. From Colosseum tours to Vatican experiences, find the perfect way to explore the Eternal City.',
      keywords: 'Rome tours, Rome excursions, Colosseum tours, Vatican tours, things to do in Rome',
      primaryKeyword: 'Rome tours',
      secondaryKeywords: [
        'Rome Colosseum tours',
        'Rome Vatican tours',
        'Rome ancient tours',
        'Rome food tours',
        'Rome art tours',
        'Things to do in Rome'
      ]
    },
    whyVisit: [
      'Iconic Colosseum and ancient Roman ruins',
      'Magnificent Vatican City and St. Peter\'s Basilica',
      'Renaissance art and architecture',
      'Authentic Italian cuisine and culture',
      'Rich history spanning over 2,000 years',
      'Perfect blend of ancient and modern life'
    ],
    bestTimeToVisit: {
      weather: 'Rome enjoys a Mediterranean climate with hot summers and mild winters. Summers are warm (75-90°F/24-32°C), winters are cool (40-55°F/4-13°C), and spring/fall offer pleasant temperatures.',
      bestMonths: 'April to June and September to October offer the best weather with mild temperatures, fewer crowds, and perfect conditions for sightseeing.',
      peakSeason: 'June to August brings peak tourist season with hot weather, larger crowds, and higher prices.',
      offSeason: 'November to March offers lower prices and fewer crowds, though with cooler weather and occasional rain.'
    },
    gettingAround: 'Excellent public transportation with Metro, buses, and trams. Walking is perfect for exploring the historic center, and taxis are readily available.',
    highlights: [
      'Colosseum - Iconic ancient amphitheater',
      'Vatican City - St. Peter\'s Basilica and Sistine Chapel',
      'Roman Forum - Ancient government center',
      'Trevi Fountain - Famous Baroque fountain',
      'Pantheon - Ancient temple and architectural marvel',
      'Piazza Navona - Beautiful Baroque square'
    ]
  },
  {
    id: 'venice',
    name: 'Venice',
    fullName: 'Venice',
    country: 'Italy',
    category: 'Europe',
    briefDescription: 'Floating city, romantic canals, and timeless beauty — Venice is a dream come to life.',
    heroDescription: 'Welcome to Venice, where gondolas glide through ancient canals and every bridge tells a story. From the magnificent St. Mark\'s Square to the charming backstreets, from world-class art to authentic Venetian cuisine, this floating city offers a magical experience unlike any other. Let our AI-powered planner help you discover the best experiences this enchanting destination has to offer.',
    imageUrl: 'https://ouqeoizufbofdqbuiwvx.supabase.co/storage/v1/object/public/destinations//Venice.webp',
    tourCategories: [
      { name: 'Gondola Tours', hasGuide: true },
      { name: 'St. Mark\'s Basilica Tours', hasGuide: true },
      { name: 'Canal Tours', hasGuide: true },
      { name: 'Murano Glass Tours', hasGuide: true },
      { name: 'Food & Wine Tours', hasGuide: true },
      { name: 'Art & History Tours', hasGuide: true }
    ],
    seo: {
      title: 'Venice Tours & Excursions - Top-Rated Activities & Adventures',
      description: 'Discover top-rated Venice tours, excursions, and activities powered by AI. From gondola tours to St. Mark\'s experiences, find the perfect way to explore the Floating City.',
      keywords: 'Venice tours, Venice excursions, gondola tours, St. Mark\'s tours, things to do in Venice',
      primaryKeyword: 'Venice tours',
      secondaryKeywords: [
        'Venice gondola tours',
        'Venice St. Mark\'s tours',
        'Venice canal tours',
        'Venice Murano tours',
        'Venice food tours',
        'Things to do in Venice'
      ]
    },
    whyVisit: [
      'Iconic gondola rides through historic canals',
      'Magnificent St. Mark\'s Basilica and Square',
      'World-famous Murano glass craftsmanship',
      'Authentic Venetian cuisine and culture',
      'Unique floating city architecture',
      'Perfect romantic and cultural destination'
    ],
    bestTimeToVisit: {
      weather: 'Venice enjoys a Mediterranean climate with hot summers and cool winters. Summers are warm (70-85°F/21-29°C), winters are cool (35-50°F/2-10°C), and spring/fall offer pleasant temperatures.',
      bestMonths: 'April to June and September to October offer the best weather with mild temperatures, fewer crowds, and perfect conditions for exploring.',
      peakSeason: 'June to August brings peak tourist season with hot weather, larger crowds, and higher prices.',
      offSeason: 'November to March offers lower prices and fewer crowds, though with cooler weather and occasional flooding (acqua alta).'
    },
    gettingAround: 'Vaporetto (water buses) and water taxis for canal transportation. Walking is perfect for exploring the historic center, and gondolas for romantic experiences.',
    highlights: [
      'St. Mark\'s Basilica - Magnificent Byzantine cathedral',
      'Grand Canal - Main waterway with historic palaces',
      'Rialto Bridge - Iconic bridge and market area',
      'Murano Island - Famous glassmaking tradition',
      'Doge\'s Palace - Historic government building',
      'Gondola Rides - Romantic canal experiences'
    ]
  },
  {
    id: 'florence',
    name: 'Florence',
    fullName: 'Florence',
    country: 'Italy',
    category: 'Europe',
    briefDescription: 'Cradle of the Renaissance, artistic masterpieces, and Tuscan charm — Florence is art history come alive.',
    heroDescription: 'Welcome to Florence, where the Renaissance was born and artistic masterpieces await around every corner. From the magnificent Duomo to the world-famous Uffizi Gallery, from Michelangelo\'s David to authentic Tuscan cuisine, this cultural capital offers an unparalleled artistic and culinary experience. Let our AI-powered planner help you discover the best experiences this magnificent destination has to offer.',
    imageUrl: 'https://ouqeoizufbofdqbuiwvx.supabase.co/storage/v1/object/public/destinations//Florence.jpeg',
    tourCategories: [
      { name: 'Uffizi Gallery Tours', hasGuide: true },
      { name: 'Duomo Tours', hasGuide: true },
      { name: 'Tuscan Wine Tours', hasGuide: true },
      { name: 'Art & History Tours', hasGuide: true },
      { name: 'Food & Cooking Tours', hasGuide: true },
      { name: 'Michelangelo Tours', hasGuide: true }
    ],
    seo: {
      title: 'Florence Tours & Excursions - Top-Rated Activities & Adventures',
      description: 'Discover top-rated Florence tours, excursions, and activities powered by AI. From Uffizi tours to Tuscan wine experiences, find the perfect way to explore the Cradle of the Renaissance.',
      keywords: 'Florence tours, Florence excursions, Uffizi tours, Duomo tours, things to do in Florence',
      primaryKeyword: 'Florence tours',
      secondaryKeywords: [
        'Florence Uffizi tours',
        'Florence Duomo tours',
        'Florence wine tours',
        'Florence art tours',
        'Florence food tours',
        'Things to do in Florence'
      ]
    },
    whyVisit: [
      'World-famous Uffizi Gallery with Renaissance masterpieces',
      'Magnificent Duomo and architectural wonders',
      'Michelangelo\'s David and artistic treasures',
      'Authentic Tuscan cuisine and wine culture',
      'Birthplace of the Renaissance',
      'Perfect blend of art, history, and culture'
    ],
    bestTimeToVisit: {
      weather: 'Florence enjoys a Mediterranean climate with hot summers and mild winters. Summers are warm (75-90°F/24-32°C), winters are cool (40-55°F/4-13°C), and spring/fall offer pleasant temperatures.',
      bestMonths: 'April to June and September to October offer the best weather with mild temperatures, fewer crowds, and perfect conditions for sightseeing.',
      peakSeason: 'June to August brings peak tourist season with hot weather, larger crowds, and higher prices.',
      offSeason: 'November to March offers lower prices and fewer crowds, though with cooler weather and occasional rain.'
    },
    gettingAround: 'Excellent public transportation with buses and trams. Walking is perfect for exploring the compact historic center, and taxis are readily available.',
    highlights: [
      'Uffizi Gallery - World\'s greatest Renaissance art collection',
      'Florence Cathedral (Duomo) - Magnificent Gothic cathedral',
      'Ponte Vecchio - Historic bridge with jewelry shops',
      'Pitti Palace - Grand Renaissance palace',
      'Boboli Gardens - Beautiful historic gardens',
      'Tuscan Wine Country - Easy day trips to Chianti'
    ]
  },
  {
    id: 'amalfi-coast',
    name: 'Amalfi Coast',
    fullName: 'Amalfi Coast',
    country: 'Italy',
    category: 'Europe',
    briefDescription: 'Dramatic cliffs, colorful villages, and Mediterranean beauty — the Amalfi Coast is Italy\'s most stunning coastline.',
    heroDescription: 'Welcome to the Amalfi Coast, where dramatic cliffs meet crystal-clear waters and colorful villages cling to the mountainside. From the charming town of Positano to the historic Amalfi, from scenic drives to boat tours, this UNESCO World Heritage site offers the perfect blend of natural beauty and Italian charm. Let our AI-powered planner help you discover the best experiences this breathtaking destination has to offer.',
    imageUrl: 'https://ouqeoizufbofdqbuiwvx.supabase.co/storage/v1/object/public/destinations//Amalfi%20Coast.webp',
    tourCategories: [
      { name: 'Coastal Boat Tours', hasGuide: true },
      { name: 'Positano Tours', hasGuide: true },
      { name: 'Ravello Gardens Tours', hasGuide: true },
      { name: 'Amalfi Town Tours', hasGuide: true },
      { name: 'Capri Island Tours', hasGuide: true },
      { name: 'Coastal Hiking Tours', hasGuide: true }
    ],
    seo: {
      title: 'Amalfi Coast Tours & Excursions - Top-Rated Activities & Adventures',
      description: 'Discover top-rated Amalfi Coast tours, excursions, and activities powered by AI. From coastal boat tours to Positano experiences, find the perfect way to explore Italy\'s most beautiful coastline.',
      keywords: 'Amalfi Coast tours, Positano tours, Capri tours, coastal tours, things to do in Amalfi Coast',
      primaryKeyword: 'Amalfi Coast tours',
      secondaryKeywords: [
        'Amalfi Coast boat tours',
        'Amalfi Coast Positano tours',
        'Amalfi Coast Capri tours',
        'Amalfi Coast hiking tours',
        'Amalfi Coast food tours',
        'Things to do in Amalfi Coast'
      ]
    },
    whyVisit: [
      'Dramatic coastal scenery and colorful villages',
      'Charming Positano and historic Amalfi',
      'Beautiful Ravello with stunning gardens',
      'Crystal-clear Mediterranean waters',
      'Scenic coastal drives and boat tours',
      'Perfect blend of natural beauty and culture'
    ],
    bestTimeToVisit: {
      weather: 'The Amalfi Coast enjoys a Mediterranean climate with hot summers and mild winters. Summers are warm (75-85°F/24-29°C), winters are mild (45-60°F/7-16°C), and spring/fall offer pleasant temperatures.',
      bestMonths: 'April to June and September to October offer the best weather with mild temperatures, fewer crowds, and perfect conditions for coastal activities.',
      peakSeason: 'June to August brings peak tourist season with warm weather, larger crowds, and higher prices.',
      offSeason: 'November to March offers lower prices and fewer crowds, though with cooler weather and some seasonal closures.'
    },
    gettingAround: 'Buses and ferries connect coastal towns, private drivers for scenic drives, and boat tours for coastal exploration. Walking is perfect for exploring individual towns.',
    highlights: [
      'Positano - Colorful cliffside village',
      'Amalfi - Historic maritime republic',
      'Ravello - Elegant gardens and villas',
      'Capri Island - Glamorous island destination',
      'Path of the Gods - Scenic hiking trail',
      'Coastal Boat Tours - Best way to see the coastline'
    ]
  },
  {
    id: 'barcelona',
    name: 'Barcelona',
    fullName: 'Barcelona',
    country: 'Spain',
    category: 'Europe',
    briefDescription: 'Cosmopolitan city, stunning architecture, and Mediterranean charm — Barcelona is Catalonia\'s vibrant capital.',
    heroDescription: 'Welcome to Barcelona, where Gaudi\'s architectural masterpieces meet Mediterranean beaches and Catalan culture thrives. From the iconic Sagrada Familia to the bustling Las Ramblas, from Gothic Quarter charm to modern innovation, this cosmopolitan city offers the perfect blend of history, art, and contemporary life. Let our AI-powered planner help you discover the best experiences this dynamic destination has to offer.',
    imageUrl: 'https://ouqeoizufbofdqbuiwvx.supabase.co/storage/v1/object/public/destinations//Barcelona.jpg',
    tourCategories: [
      { name: 'Sagrada Familia Tours', hasGuide: true },
      { name: 'Park Guell Tours', hasGuide: true },
      { name: 'Gothic Quarter Tours', hasGuide: true },
      { name: 'La Rambla Tours', hasGuide: true },
      { name: 'Casa Batllo Tours', hasGuide: true },
      { name: 'Tapas Food Tours', hasGuide: true }
    ],
    seo: {
      title: 'Barcelona Tours & Excursions - Top-Rated Activities & Adventures',
      description: 'Discover top-rated Barcelona tours, excursions, and activities powered by AI. From Gaudi tours to food experiences, find the perfect way to explore Catalonia\'s vibrant capital.',
      keywords: 'Barcelona tours, Barcelona excursions, Gaudi tours, Sagrada Familia tours, things to do in Barcelona',
      primaryKeyword: 'Barcelona tours',
      secondaryKeywords: [
        'Barcelona Gaudi tours',
        'Barcelona Sagrada Familia tours',
        'Barcelona food tours',
        'Barcelona Gothic Quarter tours',
        'Barcelona beach tours',
        'Things to do in Barcelona'
      ]
    },
    whyVisit: [
      'Iconic Sagrada Familia and Gaudi architecture',
      'Vibrant Gothic Quarter and historic charm',
      'Beautiful Mediterranean beaches',
      'World-class Catalan cuisine and culture',
      'Perfect blend of history and modernity',
      'Excellent shopping and nightlife'
    ],
    bestTimeToVisit: {
      weather: 'Barcelona enjoys a Mediterranean climate with hot summers and mild winters. Summers are warm (75-85°F/24-29°C), winters are mild (45-60°F/7-16°C), and spring/fall offer pleasant temperatures.',
      bestMonths: 'April to June and September to October offer the best weather with mild temperatures, fewer crowds, and perfect conditions for sightseeing.',
      peakSeason: 'June to August brings peak tourist season with hot weather, larger crowds, and higher prices.',
      offSeason: 'November to March offers lower prices and fewer crowds, though with cooler weather and occasional rain.'
    },
    gettingAround: 'Excellent public transportation with Metro, buses, and trams. Walking is perfect for exploring the compact city center, and taxis are readily available.',
    highlights: [
      'Sagrada Familia - Gaudi\'s iconic basilica',
      'Park Güell - Colorful Gaudi park',
      'Gothic Quarter - Historic medieval district',
      'Las Ramblas - Famous pedestrian boulevard',
      'Barceloneta Beach - Popular city beach',
      'Casa Batlló - Gaudi\'s architectural masterpiece'
    ]
  },
  {
    id: 'madrid',
    name: 'Madrid',
    fullName: 'Madrid',
    country: 'Spain',
    category: 'Europe',
    briefDescription: 'Royal capital, world-class art, and vibrant culture — Madrid is Spain\'s dynamic heart.',
    heroDescription: 'Welcome to Madrid, where royal palaces meet contemporary art and Spanish culture comes alive. From the magnificent Royal Palace to the world-famous Prado Museum, from historic plazas to modern neighborhoods, this dynamic capital offers the perfect blend of tradition and innovation. Let our AI-powered planner help you discover the best experiences this vibrant destination has to offer.',
    imageUrl: 'https://ouqeoizufbofdqbuiwvx.supabase.co/storage/v1/object/public/destinations//Madrid.webp',
    tourCategories: [
      { name: 'Prado Museum Tours', hasGuide: true },
      { name: 'Royal Palace Tours', hasGuide: true },
      { name: 'Historic Plaza Tours', hasGuide: true },
      { name: 'Food & Tapas Tours', hasGuide: true },
      { name: 'Art & Culture Tours', hasGuide: true },
      { name: 'Retiro Park Tours', hasGuide: true }
    ],
    seo: {
      title: 'Madrid Tours & Excursions - Top-Rated Activities & Adventures',
      description: 'Discover top-rated Madrid tours, excursions, and activities powered by AI. From Prado tours to royal palace experiences, find the perfect way to explore Spain\'s dynamic capital.',
      keywords: 'Madrid tours, Madrid excursions, Prado tours, Royal Palace tours, things to do in Madrid',
      primaryKeyword: 'Madrid tours',
      secondaryKeywords: [
        'Madrid Prado tours',
        'Madrid Royal Palace tours',
        'Madrid food tours',
        'Madrid art tours',
        'Madrid historic tours',
        'Things to do in Madrid'
      ]
    },
    whyVisit: [
      'World-famous Prado Museum with Spanish masterpieces',
      'Magnificent Royal Palace and historic architecture',
      'Vibrant tapas culture and Spanish cuisine',
      'Beautiful Retiro Park and green spaces',
      'Rich history and cultural heritage',
      'Perfect blend of tradition and modernity'
    ],
    bestTimeToVisit: {
      weather: 'Madrid enjoys a continental climate with hot summers and cold winters. Summers are hot (80-95°F/27-35°C), winters are cold (35-50°F/2-10°C), and spring/fall offer pleasant temperatures.',
      bestMonths: 'April to June and September to October offer the best weather with mild temperatures, fewer crowds, and perfect conditions for sightseeing.',
      peakSeason: 'June to August brings peak tourist season with hot weather, larger crowds, and higher prices.',
      offSeason: 'November to March offers lower prices and fewer crowds, though with cold weather and occasional snow.'
    },
    gettingAround: 'Excellent public transportation with Metro, buses, and commuter trains. Walking is perfect for exploring the historic center, and taxis are readily available.',
    highlights: [
      'Prado Museum - World\'s greatest Spanish art collection',
      'Royal Palace - Magnificent royal residence',
      'Plaza Mayor - Historic central square',
      'Retiro Park - Beautiful urban park',
      'Gran Via - Famous shopping street',
      'Puerta del Sol - City center and meeting point'
    ]
  },
  {
    id: 'seville',
    name: 'Seville',
    fullName: 'Seville',
    country: 'Spain',
    category: 'Europe',
    briefDescription: 'Andalusian charm, flamenco passion, and Moorish heritage — Seville is southern Spain\'s soul.',
    heroDescription: 'Welcome to Seville, where flamenco rhythms echo through historic streets and Moorish architecture tells stories of centuries past. From the magnificent Alcázar to the iconic Cathedral, from passionate flamenco shows to authentic tapas culture, this Andalusian gem offers the perfect blend of history, culture, and Spanish passion. Let our AI-powered planner help you discover the best experiences this enchanting destination has to offer.',
    imageUrl: 'https://ouqeoizufbofdqbuiwvx.supabase.co/storage/v1/object/public/destinations//Seville.jpeg',
    tourCategories: [
      { name: 'Alcázar Palace Tours', hasGuide: true },
      { name: 'Cathedral Tours', hasGuide: true },
      { name: 'Flamenco Show Tours', hasGuide: true },
      { name: 'Tapas & Food Tours', hasGuide: true },
      { name: 'Historic Quarter Tours', hasGuide: true },
      { name: 'Plaza de España Tours', hasGuide: true }
    ],
    seo: {
      title: 'Seville Tours & Excursions - Top-Rated Activities & Adventures',
      description: 'Discover top-rated Seville tours, excursions, and activities powered by AI. From Alcázar tours to flamenco experiences, find the perfect way to explore Andalusia\'s cultural heart.',
      keywords: 'Seville tours, Seville excursions, Alcázar tours, flamenco tours, things to do in Seville',
      primaryKeyword: 'Seville tours',
      secondaryKeywords: [
        'Seville Alcázar tours',
        'Seville Cathedral tours',
        'Seville flamenco tours',
        'Seville food tours',
        'Seville historic tours',
        'Things to do in Seville'
      ]
    },
    whyVisit: [
      'Magnificent Alcázar Palace with Moorish architecture',
      'Iconic Cathedral and Giralda tower',
      'Passionate flamenco culture and shows',
      'Authentic Andalusian cuisine and tapas',
      'Rich Moorish and Spanish heritage',
      'Perfect blend of history and passion'
    ],
    bestTimeToVisit: {
      weather: 'Seville enjoys a Mediterranean climate with very hot summers and mild winters. Summers are extremely hot (85-100°F/29-38°C), winters are mild (45-65°F/7-18°C), and spring/fall offer pleasant temperatures.',
      bestMonths: 'March to May and September to November offer the best weather with mild temperatures, fewer crowds, and perfect conditions for sightseeing.',
      peakSeason: 'June to August brings peak tourist season with extremely hot weather, larger crowds, and higher prices.',
      offSeason: 'December to February offers lower prices and fewer crowds, though with cooler weather and occasional rain.'
    },
    gettingAround: 'Excellent public transportation with buses and trams. Walking is perfect for exploring the compact historic center, and taxis are readily available.',
    highlights: [
      'Alcázar Palace - Stunning Moorish royal palace',
      'Seville Cathedral - World\'s largest Gothic cathedral',
      'Plaza de España - Magnificent architectural square',
      'Barrio Santa Cruz - Charming historic quarter',
      'Flamenco Shows - Authentic cultural performances',
      'Tapas Culture - Traditional Spanish dining'
    ]
  },
  {
    id: 'marbella',
    name: 'Marbella',
    fullName: 'Marbella',
    country: 'Spain',
    category: 'Europe',
    briefDescription: 'Luxury resort town, golden beaches, and Andalusian charm — Marbella is the Costa del Sol\'s glamorous heart.',
    heroDescription: 'Welcome to Marbella, where luxury meets Mediterranean beauty and Andalusian culture thrives. From the charming Old Town to the glamorous Puerto Banús, from pristine beaches to Sierra Blanca mountains, this Costa del Sol gem offers the perfect blend of sophistication, history, and natural beauty. Let our AI-powered planner help you discover the best experiences this stunning destination has to offer.',
    imageUrl: 'https://ouqeoizufbofdqbuiwvx.supabase.co/storage/v1/object/public/destinations/marbella.png',
    tourCategories: [
      { name: 'Marbella Old Town Walking Tours', hasGuide: true },
      { name: 'Costa del Sol Beach & Dune Exploration', hasGuide: true },
      { name: 'Luxury Puerto Banús Experiences', hasGuide: true },
      { name: 'Andalusian Culinary & Tapas Trails', hasGuide: true },
      { name: 'Historical Ruins & Roman Heritage', hasGuide: true },
      { name: 'Sierra Blanca Nature & Hiking Adventures', hasGuide: true }
    ],
    seo: {
      title: 'Marbella Tours & Excursions - Top-Rated Activities & Adventures',
      description: 'Discover top-rated Marbella tours, excursions, and activities powered by AI. From Old Town walking tours to Puerto Banús luxury experiences, find the perfect way to explore the Costa del Sol.',
      keywords: 'Marbella tours, Marbella excursions, Puerto Banús tours, Costa del Sol tours, things to do in Marbella',
      primaryKeyword: 'Marbella tours',
      secondaryKeywords: [
        'Marbella Old Town tours',
        'Puerto Banús tours',
        'Costa del Sol beach tours',
        'Marbella tapas tours',
        'Sierra Blanca hiking',
        'Things to do in Marbella'
      ]
    },
    whyVisit: [
      'Charming Old Town with whitewashed buildings and historic charm',
      'Glamorous Puerto Banús with luxury yachts and designer boutiques',
      'Pristine beaches and crystal-clear Mediterranean waters',
      'Rich Roman history and archaeological sites',
      'Sierra Blanca mountains offering hiking and nature adventures',
      'Authentic Andalusian cuisine and vibrant tapas culture'
    ],
    bestTimeToVisit: {
      weather: 'Marbella enjoys a Mediterranean climate with hot summers and mild winters. Summers are hot (75-85°F/24-29°C), winters are mild (55-65°F/13-18°C), and spring/fall offer perfect temperatures.',
      bestMonths: 'April to June and September to October offer the best weather with warm temperatures, fewer crowds, and perfect conditions for beach and outdoor activities.',
      peakSeason: 'July to August brings peak tourist season with hot weather, larger crowds, and higher prices.',
      offSeason: 'November to March offers lower prices and fewer crowds, though with cooler weather and occasional rain.'
    },
    gettingAround: 'Excellent public transportation with buses connecting Marbella to nearby towns. Walking is perfect for exploring the Old Town, and taxis are readily available. Car rental is ideal for exploring the Costa del Sol.',
    highlights: [
      'Marbella Old Town - Charming historic quarter with whitewashed buildings',
      'Puerto Banús - Glamorous marina with luxury yachts and designer shopping',
      'Playa de la Fontanilla - Beautiful golden sand beach',
      'Bonsai Museum - Unique collection of miniature trees',
      'Roman Ruins of Ronda la Vieja - Ancient archaeological site',
      'Sierra Blanca - Scenic mountain range perfect for hiking'
    ]
  },
  {
    id: 'mallorca',
    name: 'Mallorca',
    fullName: 'Mallorca',
    country: 'Spain',
    category: 'Europe',
    briefDescription: 'Mediterranean paradise, stunning beaches, and Balearic beauty — Mallorca is Spain\'s largest island.',
    heroDescription: 'Welcome to Mallorca, where crystal-clear waters meet dramatic mountains and charming villages dot the coastline. From pristine beaches to historic Palma, from scenic drives to boat tours, this Mediterranean paradise offers the perfect blend of natural beauty and Spanish island culture. Let our AI-powered planner help you discover the best experiences this breathtaking destination has to offer.',
    imageUrl: 'https://ouqeoizufbofdqbuiwvx.supabase.co/storage/v1/object/public/destinations//Mallorca.jpeg',
    tourCategories: [
      { name: 'Palma Cathedral Tours', hasGuide: true },
      { name: 'Coastal Boat Tours', hasGuide: true },
      { name: 'Mountain Hiking Tours', hasGuide: true },
      { name: 'Beach & Water Sports', hasGuide: true },
      { name: 'Wine & Food Tours', hasGuide: true },
      { name: 'Historic Village Tours', hasGuide: true }
    ],
    seo: {
      title: 'Mallorca Tours & Excursions - Top-Rated Activities & Adventures',
      description: 'Discover top-rated Mallorca tours, excursions, and activities powered by AI. From Palma tours to coastal experiences, find the perfect way to explore Spain\'s largest island.',
      keywords: 'Mallorca tours, Mallorca excursions, Palma tours, beach tours, things to do in Mallorca',
      primaryKeyword: 'Mallorca tours',
      secondaryKeywords: [
        'Mallorca Palma tours',
        'Mallorca beach tours',
        'Mallorca boat tours',
        'Mallorca hiking tours',
        'Mallorca wine tours',
        'Things to do in Mallorca'
      ]
    },
    whyVisit: [
      'Stunning Mediterranean beaches and crystal-clear waters',
      'Historic Palma with magnificent cathedral',
      'Dramatic mountain scenery and hiking trails',
      'Charming coastal villages and towns',
      'Excellent water sports and outdoor activities',
      'Perfect blend of nature and culture'
    ],
    bestTimeToVisit: {
      weather: 'Mallorca enjoys a Mediterranean climate with hot summers and mild winters. Summers are warm (75-85°F/24-29°C), winters are mild (45-60°F/7-16°C), and spring/fall offer pleasant temperatures.',
      bestMonths: 'May to June and September to October offer the best weather with mild temperatures, fewer crowds, and perfect conditions for beach and outdoor activities.',
      peakSeason: 'July to August brings peak tourist season with hot weather, larger crowds, and higher prices.',
      offSeason: 'November to April offers lower prices and fewer crowds, though with cooler weather and some seasonal closures.'
    },
    gettingAround: 'Rental cars for island exploration, buses for main routes, and ferries for coastal access. Walking is perfect for exploring towns and cities.',
    highlights: [
      'Palma Cathedral - Magnificent Gothic cathedral',
      'Cala d\'Or - Beautiful coastal resort',
      'Tramuntana Mountains - UNESCO World Heritage site',
      'Port de Pollença - Charming coastal town',
      'Cala Millor - Popular beach destination',
      'Historic Villages - Traditional island culture'
    ]
  },
  {
    id: 'ibiza',
    name: 'Ibiza',
    fullName: 'Ibiza',
    country: 'Spain',
    category: 'Europe',
    briefDescription: 'Party paradise, pristine beaches, and Balearic magic — Ibiza is the Mediterranean\'s most famous island.',
    heroDescription: 'Welcome to Ibiza, where world-famous nightlife meets pristine Mediterranean beaches and bohemian charm. From legendary clubs to hidden coves, from historic Dalt Vila to sunset parties, this iconic island offers the perfect blend of excitement and relaxation. Let our AI-powered planner help you discover the best experiences this legendary destination has to offer.',
    imageUrl: 'https://ouqeoizufbofdqbuiwvx.supabase.co/storage/v1/object/public/destinations//Ibiza.jpg',
    tourCategories: [
      { name: 'Dalt Vila Tours', hasGuide: true },
      { name: 'Beach & Boat Tours', hasGuide: true },
      { name: 'Sunset Party Tours', hasGuide: true },
      { name: 'Water Sports Tours', hasGuide: true },
      { name: 'Food & Wine Tours', hasGuide: true },
      { name: 'Island Exploration Tours', hasGuide: true }
    ],
    seo: {
      title: 'Ibiza Tours & Excursions - Top-Rated Activities & Adventures',
      description: 'Discover top-rated Ibiza tours, excursions, and activities powered by AI. From Dalt Vila tours to beach experiences, find the perfect way to explore the Mediterranean\'s most famous island.',
      keywords: 'Ibiza tours, Ibiza excursions, Dalt Vila tours, beach tours, things to do in Ibiza',
      primaryKeyword: 'Ibiza tours',
      secondaryKeywords: [
        'Ibiza Dalt Vila tours',
        'Ibiza beach tours',
        'Ibiza boat tours',
        'Ibiza sunset tours',
        'Ibiza water sports',
        'Things to do in Ibiza'
      ]
    },
    whyVisit: [
      'World-famous nightlife and legendary clubs',
      'Pristine Mediterranean beaches and crystal-clear waters',
      'Historic Dalt Vila UNESCO World Heritage site',
      'Beautiful sunset parties and beach clubs',
      'Excellent water sports and outdoor activities',
      'Perfect blend of excitement and relaxation'
    ],
    bestTimeToVisit: {
      weather: 'Ibiza enjoys a Mediterranean climate with hot summers and mild winters. Summers are warm (75-85°F/24-29°C), winters are mild (45-60°F/7-16°C), and spring/fall offer pleasant temperatures.',
      bestMonths: 'May to June and September to October offer the best weather with mild temperatures, fewer crowds, and perfect conditions for beach and outdoor activities.',
      peakSeason: 'July to August brings peak tourist season with hot weather, larger crowds, and higher prices.',
      offSeason: 'November to April offers lower prices and fewer crowds, though with cooler weather and some seasonal closures.'
    },
    gettingAround: 'Rental cars for island exploration, buses for main routes, and ferries for coastal access. Walking is perfect for exploring towns and cities.',
    highlights: [
      'Dalt Vila - Historic UNESCO World Heritage site',
      'Playa d\'en Bossa - Famous beach and nightlife',
      'Es Vedrà - Mysterious island landmark',
      'Cala Comte - Beautiful beach with stunning views',
      'Sunset Strip - Famous sunset party destination',
      'Hidden Coves - Secluded beach experiences'
    ]
  },
  {
    id: 'athens',
    name: 'Athens',
    fullName: 'Athens',
    country: 'Greece',
    category: 'Europe',
    briefDescription: 'Ancient capital, classical ruins, and Mediterranean charm — Athens is the cradle of Western civilization.',
    heroDescription: 'Welcome to Athens, where ancient ruins meet modern life and Greek culture thrives. From the iconic Acropolis to the historic Plaka district, from world-class museums to authentic Greek cuisine, this timeless city offers the perfect blend of history, culture, and contemporary Mediterranean life. Let our AI-powered planner help you discover the best experiences this legendary destination has to offer.',
    imageUrl: 'https://ouqeoizufbofdqbuiwvx.supabase.co/storage/v1/object/public/destinations//Athens.jpg',
    tourCategories: [
      { name: 'Acropolis Tours', hasGuide: true },
      { name: 'Ancient Greece Tours', hasGuide: true },
      { name: 'Museum Tours', hasGuide: true },
      { name: 'Food Wine Tours', hasGuide: true },
      { name: 'Historic District Tours', hasGuide: true },
      { name: 'Archaeological Site Tours', hasGuide: true }
    ],
    seo: {
      title: 'Athens Tours & Excursions - Top-Rated Activities & Adventures',
      description: 'Discover top-rated Athens tours, excursions, and activities powered by AI. From Acropolis tours to ancient Greece experiences, find the perfect way to explore the cradle of Western civilization.',
      keywords: 'Athens tours, Athens excursions, Acropolis tours, ancient Greece tours, things to do in Athens',
      primaryKeyword: 'Athens tours',
      secondaryKeywords: [
        'Athens Acropolis tours',
        'Athens ancient Greece tours',
        'Athens museum tours',
        'Athens food tours',
        'Athens historic tours',
        'Things to do in Athens'
      ]
    },
    whyVisit: [
      'Iconic Acropolis and Parthenon',
      'Rich ancient Greek history and archaeology',
      'World-class museums and cultural sites',
      'Authentic Greek cuisine and culture',
      'Perfect blend of ancient and modern life',
      'Excellent shopping and nightlife'
    ],
    bestTimeToVisit: {
      weather: 'Athens enjoys a Mediterranean climate with hot summers and mild winters. Summers are hot (80-95°F/27-35°C), winters are mild (45-65°F/7-18°C), and spring/fall offer pleasant temperatures.',
      bestMonths: 'April to June and September to October offer the best weather with mild temperatures, fewer crowds, and perfect conditions for sightseeing.',
      peakSeason: 'June to August brings peak tourist season with hot weather, larger crowds, and higher prices.',
      offSeason: 'November to March offers lower prices and fewer crowds, though with cooler weather and occasional rain.'
    },
    gettingAround: 'Excellent public transportation with Metro, buses, and trams. Walking is perfect for exploring the historic center, and taxis are readily available.',
    highlights: [
      'Acropolis - Iconic ancient citadel',
      'Parthenon - Magnificent ancient temple',
      'Ancient Agora - Historic marketplace',
      'Plaka District - Charming historic neighborhood',
      'National Archaeological Museum - World-class collection',
      'Temple of Olympian Zeus - Ancient ruins'
    ]
  },
  {
    id: 'santorini',
    name: 'Santorini',
    fullName: 'Santorini',
    country: 'Greece',
    category: 'Europe',
    briefDescription: 'Volcanic beauty, stunning sunsets, and Aegean magic — Santorini is Greece\'s most romantic island.',
    heroDescription: 'Welcome to Santorini, where dramatic volcanic cliffs meet crystal-clear Aegean waters and white-washed buildings create a picture-perfect paradise. From the iconic caldera views to stunning sunsets, from charming villages to pristine beaches, this volcanic island offers the perfect blend of natural beauty and Greek island charm. Let our AI-powered planner help you discover the best experiences this breathtaking destination has to offer.',
    imageUrl: 'https://ouqeoizufbofdqbuiwvx.supabase.co/storage/v1/object/public/destinations//Santorini.avif',
    tourCategories: [
      { name: 'Caldera Tours', hasGuide: true },
      { name: 'Sunset Tours', hasGuide: true },
      { name: 'Volcano Tours', hasGuide: true },
      { name: 'Wine & Food Tours', hasGuide: true },
      { name: 'Beach & Boat Tours', hasGuide: true },
      { name: 'Village Exploration Tours', hasGuide: true }
    ],
    seo: {
      title: 'Santorini Tours & Excursions - Top-Rated Activities & Adventures',
      description: 'Discover top-rated Santorini tours, excursions, and activities powered by AI. From caldera tours to sunset experiences, find the perfect way to explore Greece\'s most romantic island.',
      keywords: 'Santorini tours, Santorini excursions, caldera tours, sunset tours, things to do in Santorini',
      primaryKeyword: 'Santorini tours',
      secondaryKeywords: [
        'Santorini caldera tours',
        'Santorini sunset tours',
        'Santorini volcano tours',
        'Santorini wine tours',
        'Santorini beach tours',
        'Things to do in Santorini'
      ]
    },
    whyVisit: [
      'Dramatic caldera views and volcanic landscapes',
      'World-famous sunsets and romantic atmosphere',
      'Charming white-washed villages and architecture',
      'Excellent Greek wine and cuisine',
      'Pristine beaches and crystal-clear waters',
      'Perfect blend of natural beauty and culture'
    ],
    bestTimeToVisit: {
      weather: 'Santorini enjoys a Mediterranean climate with hot summers and mild winters. Summers are warm (75-85°F/24-29°C), winters are mild (45-60°F/7-16°C), and spring/fall offer pleasant temperatures.',
      bestMonths: 'May to June and September to October offer the best weather with mild temperatures, fewer crowds, and perfect conditions for sightseeing.',
      peakSeason: 'July to August brings peak tourist season with hot weather, larger crowds, and higher prices.',
      offSeason: 'November to April offers lower prices and fewer crowds, though with cooler weather and some seasonal closures.'
    },
    gettingAround: 'Rental cars and ATVs for island exploration, local buses for main routes, and boat tours for caldera access. Walking is perfect for exploring villages.',
    highlights: [
      'Oia - Famous sunset village',
      'Fira - Island capital with caldera views',
      'Red Beach - Unique volcanic beach',
      'Santorini Volcano - Active volcanic island',
      'Wine Villages - Traditional wine production',
      'Caldera Boat Tours - Best way to see the island'
    ]
  },
  {
    id: 'mykonos',
    name: 'Mykonos',
    fullName: 'Mykonos',
    country: 'Greece',
    category: 'Europe',
    briefDescription: 'Cosmopolitan island, pristine beaches, and Aegean charm — Mykonos is Greece\'s most glamorous destination.',
    heroDescription: 'Welcome to Mykonos, where cosmopolitan style meets traditional Greek island charm and pristine beaches stretch along the Aegean coast. From the iconic windmills to vibrant nightlife, from crystal-clear waters to charming villages, this glamorous island offers the perfect blend of luxury and authentic Greek culture. Let our AI-powered planner help you discover the best experiences this stunning destination has to offer.',
    imageUrl: 'https://ouqeoizufbofdqbuiwvx.supabase.co/storage/v1/object/public/destinations//Mykonos.avif',
    tourCategories: [
      { name: 'Windmill Tours', hasGuide: true },
      { name: 'Beach & Boat Tours', hasGuide: true },
      { name: 'Island Hopping Tours', hasGuide: true },
      { name: 'Food & Wine Tours', hasGuide: true },
      { name: 'Water Sports Tours', hasGuide: true },
      { name: 'Village Exploration Tours', hasGuide: true }
    ],
    seo: {
      title: 'Mykonos Tours & Excursions - Top-Rated Activities & Adventures',
      description: 'Discover top-rated Mykonos tours, excursions, and activities powered by AI. From windmill tours to beach experiences, find the perfect way to explore Greece\'s most glamorous island.',
      keywords: 'Mykonos tours, Mykonos excursions, windmill tours, beach tours, things to do in Mykonos',
      primaryKeyword: 'Mykonos tours',
      secondaryKeywords: [
        'Mykonos windmill tours',
        'Mykonos beach tours',
        'Mykonos boat tours',
        'Mykonos island hopping',
        'Mykonos water sports',
        'Things to do in Mykonos'
      ]
    },
    whyVisit: [
      'Iconic windmills and charming architecture',
      'Pristine beaches and crystal-clear Aegean waters',
      'Vibrant nightlife and cosmopolitan atmosphere',
      'Excellent Greek cuisine and island culture',
      'Perfect water sports and outdoor activities',
      'Beautiful villages and traditional charm'
    ],
    bestTimeToVisit: {
      weather: 'Mykonos enjoys a Mediterranean climate with hot summers and mild winters. Summers are warm (75-85°F/24-29°C), winters are mild (45-60°F/7-16°C), and spring/fall offer pleasant temperatures.',
      bestMonths: 'May to June and September to October offer the best weather with mild temperatures, fewer crowds, and perfect conditions for beach activities.',
      peakSeason: 'July to August brings peak tourist season with hot weather, larger crowds, and higher prices.',
      offSeason: 'November to April offers lower prices and fewer crowds, though with cooler weather and some seasonal closures.'
    },
    gettingAround: 'Rental cars and ATVs for island exploration, local buses for main routes, and boat tours for coastal access. Walking is perfect for exploring villages.',
    highlights: [
      'Mykonos Town - Charming island capital',
      'Windmills - Iconic island landmark',
      'Paradise Beach - Famous party beach',
      'Delos Island - Ancient archaeological site',
      'Little Venice - Picturesque waterfront area',
      'Beach Clubs - World-famous entertainment'
    ]
  },
  {
    id: 'crete',
    name: 'Crete',
    fullName: 'Crete',
    country: 'Greece',
    category: 'Europe',
    briefDescription: 'Ancient civilization, diverse landscapes, and Mediterranean beauty — Crete is Greece\'s largest and most diverse island.',
    heroDescription: 'Welcome to Crete, where ancient Minoan civilization meets stunning natural landscapes and authentic Greek island culture. From the historic Palace of Knossos to dramatic gorges and pristine beaches, from traditional villages to modern cities, this diverse island offers the perfect blend of history, nature, and Mediterranean charm. Let our AI-powered planner help you discover the best experiences this magnificent destination has to offer.',
    imageUrl: 'https://ouqeoizufbofdqbuiwvx.supabase.co/storage/v1/object/public/destinations//Crete.jpeg',
    tourCategories: [
      { name: 'Knossos Palace Tours', hasGuide: true },
      { name: 'Samaria Gorge Tours', hasGuide: true },
      { name: 'Beach Coastal Tours', hasGuide: true },
      { name: 'Food Wine Tours', hasGuide: true },
      { name: 'Archaeological Site Tours', hasGuide: true },
      { name: 'Mountain Village Tours', hasGuide: true }
    ],
    seo: {
      title: 'Crete Tours & Excursions - Top-Rated Activities & Adventures',
      description: 'Discover top-rated Crete tours, excursions, and activities powered by AI. From Knossos tours to gorge experiences, find the perfect way to explore Greece\'s largest island.',
      keywords: 'Crete tours, Crete excursions, Knossos tours, Samaria Gorge tours, things to do in Crete',
      primaryKeyword: 'Crete tours',
      secondaryKeywords: [
        'Crete Knossos tours',
        'Crete Samaria Gorge tours',
        'Crete beach tours',
        'Crete archaeological tours',
        'Crete food tours',
        'Things to do in Crete'
      ]
    },
    whyVisit: [
      'Ancient Palace of Knossos and Minoan civilization',
      'Dramatic Samaria Gorge and natural landscapes',
      'Diverse beaches and crystal-clear waters',
      'Authentic Cretan cuisine and culture',
      'Traditional villages and mountain scenery',
      'Perfect blend of history and nature'
    ],
    bestTimeToVisit: {
      weather: 'Crete enjoys a Mediterranean climate with hot summers and mild winters. Summers are warm (75-90°F/24-32°C), winters are mild (45-65°F/7-18°C), and spring/fall offer pleasant temperatures.',
      bestMonths: 'April to June and September to October offer the best weather with mild temperatures, fewer crowds, and perfect conditions for outdoor activities.',
      peakSeason: 'July to August brings peak tourist season with hot weather, larger crowds, and higher prices.',
      offSeason: 'November to March offers lower prices and fewer crowds, though with cooler weather and occasional rain.'
    },
    gettingAround: 'Rental cars for island exploration, buses for main routes, and ferries for coastal access. Walking is perfect for exploring cities and villages.',
    highlights: [
      'Palace of Knossos - Ancient Minoan palace',
      'Samaria Gorge - Europe\'s longest gorge',
      'Heraklion - Island capital and port',
      'Chania - Charming Venetian harbor',
      'Elafonisi Beach - Pink sand beach',
      'Traditional Villages - Authentic island culture'
    ]
  },
  {
    id: 'lisbon',
    name: 'Lisbon',
    fullName: 'Lisbon',
    country: 'Portugal',
    category: 'Europe',
    briefDescription: 'Historic capital, colorful tiles, and Atlantic charm — Lisbon is Portugal\'s vibrant heart.',
    heroDescription: 'Welcome to Lisbon, where historic trams climb steep hills and colorful tiles tell stories of centuries past. From the iconic Belém Tower to the charming Alfama district, from world-class cuisine to Fado music, this Atlantic capital offers the perfect blend of history, culture, and modern Portuguese life. Let our AI-powered planner help you discover the best experiences this enchanting destination has to offer.',
    imageUrl: 'https://ouqeoizufbofdqbuiwvx.supabase.co/storage/v1/object/public/destinations//Lisbon.jpeg',
    tourCategories: [
      { name: 'Belém Tower Tours', hasGuide: true },
      { name: 'Alfama District Tours', hasGuide: true },
      { name: 'Tram Tours', hasGuide: true },
      { name: 'Food & Wine Tours', hasGuide: true },
      { name: 'Fado Music Tours', hasGuide: true },
      { name: 'Historic Quarter Tours', hasGuide: true }
    ],
    seo: {
      title: 'Lisbon Tours & Excursions - Top-Rated Activities & Adventures',
      description: 'Discover top-rated Lisbon tours, excursions, and activities powered by AI. From Belém tours to Fado experiences, find the perfect way to explore Portugal\'s vibrant capital.',
      keywords: 'Lisbon tours, Lisbon excursions, Belém tours, Alfama tours, things to do in Lisbon',
      primaryKeyword: 'Lisbon tours',
      secondaryKeywords: [
        'Lisbon Belém tours',
        'Lisbon Alfama tours',
        'Lisbon tram tours',
        'Lisbon food tours',
        'Lisbon Fado tours',
        'Things to do in Lisbon'
      ]
    },
    whyVisit: [
      'Iconic Belém Tower and historic monuments',
      'Charming Alfama district with Fado music',
      'Colorful tiles and traditional architecture',
      'World-class Portuguese cuisine and wine',
      'Historic trams and scenic viewpoints',
      'Perfect blend of history and modern life'
    ],
    bestTimeToVisit: {
      weather: 'Lisbon enjoys a Mediterranean climate with hot summers and mild winters. Summers are warm (75-85°F/24-29°C), winters are mild (45-65°F/7-18°C), and spring/fall offer pleasant temperatures.',
      bestMonths: 'March to May and September to November offer the best weather with mild temperatures, fewer crowds, and perfect conditions for sightseeing.',
      peakSeason: 'June to August brings peak tourist season with hot weather, larger crowds, and higher prices.',
      offSeason: 'December to February offers lower prices and fewer crowds, though with cooler weather and occasional rain.'
    },
    gettingAround: 'Excellent public transportation with Metro, trams, and buses. Walking is perfect for exploring the historic center, and taxis are readily available.',
    highlights: [
      'Belém Tower - Iconic 16th-century fortress',
      'Alfama District - Historic neighborhood with Fado',
      'Tram 28 - Famous historic tram route',
      'Jerónimos Monastery - Magnificent Manueline architecture',
      'São Jorge Castle - Medieval castle with city views',
      'Pastéis de Belém - Famous Portuguese custard tarts'
    ]
  },
  {
    id: 'porto',
    name: 'Porto',
    fullName: 'Porto',
    country: 'Portugal',
    category: 'Europe',
    briefDescription: 'Port wine capital, historic bridges, and Douro charm — Porto is Portugal\'s northern gem.',
    heroDescription: 'Welcome to Porto, where historic wine cellars line the Douro River and medieval architecture tells stories of centuries past. From the iconic Dom Luís Bridge to the charming Ribeira district, from world-famous port wine to traditional Portuguese cuisine, this northern city offers the perfect blend of history, culture, and authentic Portuguese charm. Let our AI-powered planner help you discover the best experiences this magnificent destination has to offer.',
    imageUrl: 'https://ouqeoizufbofdqbuiwvx.supabase.co/storage/v1/object/public/destinations//Porto.jpeg',
    tourCategories: [
      { name: 'Port Wine Tours', hasGuide: true },
      { name: 'Ribeira District Tours', hasGuide: true },
      { name: 'Douro River Tours', hasGuide: true },
      { name: 'Food & Wine Tours', hasGuide: true },
      { name: 'Historic Bridge Tours', hasGuide: true },
      { name: 'Wine Cellar Tours', hasGuide: true }
    ],
    seo: {
      title: 'Porto Tours & Excursions - Top-Rated Activities & Adventures',
      description: 'Discover top-rated Porto tours, excursions, and activities powered by AI. From port wine tours to Douro River experiences, find the perfect way to explore Portugal\'s northern gem.',
      keywords: 'Porto tours, Porto excursions, port wine tours, Ribeira tours, things to do in Porto',
      primaryKeyword: 'Porto tours',
      secondaryKeywords: [
        'Porto port wine tours',
        'Porto Ribeira tours',
        'Porto Douro River tours',
        'Porto food tours',
        'Porto wine cellar tours',
        'Things to do in Porto'
      ]
    },
    whyVisit: [
      'World-famous port wine and historic cellars',
      'Charming Ribeira district with medieval architecture',
      'Iconic Dom Luís Bridge and Douro River views',
      'Authentic Portuguese cuisine and culture',
      'Historic churches and traditional tiles',
      'Perfect blend of history and wine culture'
    ],
    bestTimeToVisit: {
      weather: 'Porto enjoys a Mediterranean climate with warm summers and mild winters. Summers are warm (70-80°F/21-27°C), winters are mild (45-60°F/7-16°C), and spring/fall offer pleasant temperatures.',
      bestMonths: 'March to May and September to November offer the best weather with mild temperatures, fewer crowds, and perfect conditions for sightseeing.',
      peakSeason: 'June to August brings peak tourist season with warm weather, larger crowds, and higher prices.',
      offSeason: 'December to February offers lower prices and fewer crowds, though with cooler weather and occasional rain.'
    },
    gettingAround: 'Excellent public transportation with Metro, buses, and trams. Walking is perfect for exploring the historic center, and taxis are readily available.',
    highlights: [
      'Dom Luís Bridge - Iconic double-deck bridge',
      'Ribeira District - Historic riverside quarter',
      'Port Wine Cellars - Traditional wine production',
      'Livraria Lello - Famous historic bookstore',
      'Clérigos Tower - Baroque bell tower',
      'Douro River - Scenic river cruises'
    ]
  },
  {
    id: 'madeira',
    name: 'Madeira',
    fullName: 'Madeira',
    country: 'Portugal',
    category: 'Europe',
    briefDescription: 'Island paradise, dramatic landscapes, and Atlantic beauty — Madeira is Portugal\'s floating garden.',
    heroDescription: 'Welcome to Madeira, where dramatic volcanic landscapes meet lush subtropical gardens and the Atlantic Ocean provides endless natural beauty. From the historic Funchal to the famous levada walks, from world-class wine to stunning viewpoints, this Atlantic island offers the perfect blend of nature, culture, and Portuguese island charm. Let our AI-powered planner help you discover the best experiences this breathtaking destination has to offer.',
    imageUrl: 'https://ouqeoizufbofdqbuiwvx.supabase.co/storage/v1/object/public/destinations//Madeira.jpg',
    tourCategories: [
      { name: 'Levada Walking Tours', hasGuide: true },
      { name: 'Funchal City Tours', hasGuide: true },
      { name: 'Wine & Food Tours', hasGuide: true },
      { name: 'Mountain & Valley Tours', hasGuide: true },
      { name: 'Coastal Boat Tours', hasGuide: true },
      { name: 'Garden & Nature Tours', hasGuide: true }
    ],
    seo: {
      title: 'Madeira Tours & Excursions - Top-Rated Activities & Adventures',
      description: 'Discover top-rated Madeira tours, excursions, and activities powered by AI. From levada walks to Funchal experiences, find the perfect way to explore Portugal\'s floating garden.',
      keywords: 'Madeira tours, Madeira excursions, levada walks, Funchal tours, things to do in Madeira',
      primaryKeyword: 'Madeira tours',
      secondaryKeywords: [
        'Madeira levada walks',
        'Madeira Funchal tours',
        'Madeira wine tours',
        'Madeira mountain tours',
        'Madeira boat tours',
        'Things to do in Madeira'
      ]
    },
    whyVisit: [
      'Dramatic volcanic landscapes and mountain scenery',
      'Famous levada walks through lush valleys',
      'Historic Funchal with Portuguese charm',
      'World-class Madeira wine and cuisine',
      'Beautiful gardens and subtropical climate',
      'Perfect blend of nature and culture'
    ],
    bestTimeToVisit: {
      weather: 'Madeira enjoys a subtropical climate with mild temperatures year-round. Summers are warm (70-80°F/21-27°C), winters are mild (60-70°F/16-21°C), and the island offers pleasant weather throughout the year.',
      bestMonths: 'April to June and September to November offer the best weather with mild temperatures, fewer crowds, and perfect conditions for outdoor activities.',
      peakSeason: 'July to August brings peak tourist season with warm weather, larger crowds, and higher prices.',
      offSeason: 'December to March offers lower prices and fewer crowds, though with occasional rain and cooler temperatures.'
    },
    gettingAround: 'Rental cars for island exploration, local buses for main routes, and boat tours for coastal access. Walking is perfect for exploring Funchal and levada paths.',
    highlights: [
      'Funchal - Historic island capital',
      'Levada Walks - Famous irrigation path hikes',
      'Pico do Arieiro - Stunning mountain viewpoints',
      'Monte Palace Gardens - Beautiful botanical gardens',
      'Cabo Girão - Europe\'s highest sea cliff',
      'Madeira Wine - Traditional fortified wine'
    ]
  },
  {
    id: 'london',
    name: 'London',
    fullName: 'London',
    country: 'United Kingdom',
    category: 'Europe',
    briefDescription: 'Historic capital, royal heritage, and global culture — London is the world\'s most dynamic city.',
    heroDescription: 'Welcome to London, where centuries of history meet cutting-edge culture and royal traditions blend with modern innovation. From the iconic Big Ben to the magnificent Buckingham Palace, from world-class museums to vibrant neighborhoods, this global capital offers the perfect blend of tradition, culture, and contemporary British life. Let our AI-powered planner help you discover the best experiences this legendary destination has to offer.',
    imageUrl: 'https://ouqeoizufbofdqbuiwvx.supabase.co/storage/v1/object/public/destinations//London.jpeg',
    tourCategories: [
      { name: 'Buckingham Palace Tours', hasGuide: true },
      { name: 'Tower of London Tours', hasGuide: true },
      { name: 'Big Ben & Parliament Tours', hasGuide: true },
      { name: 'Museum & Gallery Tours', hasGuide: true },
      { name: 'Food & Pub Tours', hasGuide: true },
      { name: 'Royal London Tours', hasGuide: true }
    ],
    seo: {
      title: 'London Tours & Excursions - Top-Rated Activities & Adventures',
      description: 'Discover top-rated London tours, excursions, and activities powered by AI. From royal palace tours to museum experiences, find the perfect way to explore the world\'s most dynamic city.',
      keywords: 'London tours, London excursions, Buckingham Palace tours, Tower of London tours, things to do in London',
      primaryKeyword: 'London tours',
      secondaryKeywords: [
        'London Buckingham Palace tours',
        'London Tower of London tours',
        'London Big Ben tours',
        'London museum tours',
        'London food tours',
        'Things to do in London'
      ]
    },
    whyVisit: [
      'Iconic Buckingham Palace and royal heritage',
      'Historic Tower of London and Crown Jewels',
      'World-class museums and cultural institutions',
      'Diverse neighborhoods and vibrant culture',
      'Excellent British cuisine and pub culture',
      'Perfect blend of history and modernity'
    ],
    bestTimeToVisit: {
      weather: 'London enjoys a temperate maritime climate with mild temperatures year-round. Summers are warm (65-75°F/18-24°C), winters are cool (35-50°F/2-10°C), and spring/fall offer pleasant temperatures.',
      bestMonths: 'March to May and September to November offer the best weather with mild temperatures, fewer crowds, and perfect conditions for sightseeing.',
      peakSeason: 'June to August brings peak tourist season with warm weather, larger crowds, and higher prices.',
      offSeason: 'December to February offers lower prices and fewer crowds, though with cooler weather and occasional rain.'
    },
    gettingAround: 'Excellent public transportation with Underground, buses, and trains. Walking is perfect for exploring central London, and taxis are readily available.',
    highlights: [
      'Buckingham Palace - Royal residence and Changing of the Guard',
      'Tower of London - Historic castle and Crown Jewels',
      'Big Ben & Houses of Parliament - Iconic British landmarks',
      'British Museum - World-class cultural collection',
      'Westminster Abbey - Historic royal church',
      'Tower Bridge - Famous Victorian bridge'
    ]
  },
  {
    id: 'edinburgh',
    name: 'Edinburgh',
    fullName: 'Edinburgh',
    country: 'United Kingdom',
    category: 'Europe',
    briefDescription: 'Medieval capital, Scottish heritage, and cultural charm — Edinburgh is Scotland\'s historic heart.',
    heroDescription: 'Welcome to Edinburgh, where medieval castles meet Georgian elegance and Scottish traditions come alive. From the iconic Edinburgh Castle to the historic Royal Mile, from world-famous festivals to authentic Scottish culture, this historic capital offers the perfect blend of history, culture, and Scottish charm. Let our AI-powered planner help you discover the best experiences this magnificent destination has to offer.',
    imageUrl: 'https://ouqeoizufbofdqbuiwvx.supabase.co/storage/v1/object/public/destinations//Edinburgh.jpeg',
    tourCategories: [
      { name: 'Edinburgh Castle Tours', hasGuide: true },
      { name: 'Royal Mile Tours', hasGuide: true },
      { name: 'Whisky Food Tours', hasGuide: true },
      { name: 'Ghost History Tours', hasGuide: true },
      { name: 'Arthurs Seat Tours', hasGuide: true },
      { name: 'Scottish Culture Tours', hasGuide: true }
    ],
    seo: {
      title: 'Edinburgh Tours & Excursions - Top-Rated Activities & Adventures',
      description: 'Discover top-rated Edinburgh tours, excursions, and activities powered by AI. From castle tours to whisky experiences, find the perfect way to explore Scotland\'s historic capital.',
      keywords: 'Edinburgh tours, Edinburgh excursions, Edinburgh Castle tours, Royal Mile tours, things to do in Edinburgh',
      primaryKeyword: 'Edinburgh tours',
      secondaryKeywords: [
        'Edinburgh Castle tours',
        'Edinburgh Royal Mile tours',
        'Edinburgh whisky tours',
        'Edinburgh ghost tours',
        'Edinburgh food tours',
        'Things to do in Edinburgh'
      ]
    },
    whyVisit: [
      'Iconic Edinburgh Castle and royal heritage',
      'Historic Royal Mile with medieval architecture',
      'World-famous whisky and Scottish cuisine',
      'Rich Scottish history and cultural traditions',
      'Beautiful Georgian architecture and gardens',
      'Perfect blend of history and Scottish charm'
    ],
    bestTimeToVisit: {
      weather: 'Edinburgh enjoys a temperate maritime climate with mild temperatures year-round. Summers are cool (60-70°F/16-21°C), winters are cold (35-50°F/2-10°C), and spring/fall offer pleasant temperatures.',
      bestMonths: 'May to September offer the best weather with mild temperatures and longer daylight hours for sightseeing.',
      peakSeason: 'July to August brings peak tourist season with the famous Edinburgh Festival, larger crowds, and higher prices.',
      offSeason: 'October to April offers lower prices and fewer crowds, though with cooler weather and shorter days.'
    },
    gettingAround: 'Excellent public transportation with buses and trams. Walking is perfect for exploring the compact historic center, and taxis are readily available.',
    highlights: [
      'Edinburgh Castle - Iconic fortress and royal palace',
      'Royal Mile - Historic street connecting castle to palace',
      'Arthur\'s Seat - Ancient volcano with city views',
      'Holyrood Palace - Royal residence',
      'Scottish Whisky Experience - Traditional whisky culture',
      'Princes Street Gardens - Beautiful city park'
    ]
  },
  {
    id: 'amsterdam',
    name: 'Amsterdam',
    fullName: 'Amsterdam',
    country: 'Netherlands',
    category: 'Europe',
    briefDescription: 'Canal city, artistic heritage, and Dutch charm — Amsterdam is the Netherlands\' cultural heart.',
    relatedGuides: ['amsterdam-3-day-itinerary'],
    heroDescription: 'Welcome to Amsterdam, where historic canals wind through charming neighborhoods and artistic masterpieces tell stories of centuries past. From the iconic Anne Frank House to the world-famous Van Gogh Museum, from picturesque canals to vibrant culture, this Dutch capital offers the perfect blend of history, art, and contemporary European life. Let our AI-powered planner help you discover the best experiences this enchanting destination has to offer.',
    imageUrl: 'https://ouqeoizufbofdqbuiwvx.supabase.co/storage/v1/object/public/destinations//Amsterdam.jpg',
    tourCategories: [
      { name: 'Canal Boat Tours', hasGuide: true },
      { name: 'Van Gogh Museum Tours', hasGuide: true },
      { name: 'Anne Frank House Tours', hasGuide: true },
      { name: 'Food Beer Tours', hasGuide: true },
      { name: 'Historic District Tours', hasGuide: true },
      { name: 'Art Culture Tours', hasGuide: true }
    ],
    seo: {
      title: 'Amsterdam Tours & Excursions - Top-Rated Activities & Adventures',
      description: 'Discover top-rated Amsterdam tours, excursions, and activities powered by AI. From canal tours to museum experiences, find the perfect way to explore the Netherlands\' cultural heart.',
      keywords: 'Amsterdam tours, Amsterdam excursions, canal tours, Van Gogh Museum tours, things to do in Amsterdam',
      primaryKeyword: 'Amsterdam tours',
      secondaryKeywords: [
        'Amsterdam canal tours',
        'Amsterdam Van Gogh Museum tours',
        'Amsterdam Anne Frank House tours',
        'Amsterdam food tours',
        'Amsterdam art tours',
        'Things to do in Amsterdam'
      ]
    },
    whyVisit: [
      'Iconic canal network and historic architecture',
      'World-famous Van Gogh Museum and art collections',
      'Historic Anne Frank House and cultural heritage',
      'Excellent Dutch cuisine and beer culture',
      'Beautiful parks and vibrant neighborhoods',
      'Perfect blend of history and modern culture'
    ],
    bestTimeToVisit: {
      weather: 'Amsterdam enjoys a temperate maritime climate with mild temperatures year-round. Summers are warm (65-75°F/18-24°C), winters are cool (35-50°F/2-10°C), and spring/fall offer pleasant temperatures.',
      bestMonths: 'April to May and September to October offer the best weather with mild temperatures, beautiful tulips in spring, and perfect conditions for sightseeing.',
      peakSeason: 'June to August brings peak tourist season with warm weather, larger crowds, and higher prices.',
      offSeason: 'November to March offers lower prices and fewer crowds, though with cooler weather and occasional rain.'
    },
    gettingAround: 'Excellent public transportation with trams, buses, and trains. Walking and cycling are perfect for exploring the compact city center.',
    highlights: [
      'Canal Belt - UNESCO World Heritage site',
      'Van Gogh Museum - World\'s largest Van Gogh collection',
      'Anne Frank House - Historic museum and memorial',
      'Rijksmuseum - Dutch national museum',
      'Vondelpark - Beautiful urban park',
      'Jordaan District - Charming historic neighborhood'
    ]
  },
  {
    id: 'berlin',
    name: 'Berlin',
    fullName: 'Berlin',
    country: 'Germany',
    category: 'Europe',
    briefDescription: 'Dynamic capital, historic landmarks, and cultural innovation — Berlin is Germany\'s vibrant heart.',
    heroDescription: 'Welcome to Berlin, where historic landmarks tell stories of transformation and cutting-edge culture thrives in every neighborhood. From the iconic Brandenburg Gate to the historic Berlin Wall, from world-class museums to vibrant nightlife, this dynamic capital offers the perfect blend of history, culture, and modern German life. Let our AI-powered planner help you discover the best experiences this fascinating destination has to offer.',
    imageUrl: 'https://ouqeoizufbofdqbuiwvx.supabase.co/storage/v1/object/public/destinations//Berlin.jpg',
    tourCategories: [
      { name: 'Brandenburg Gate Tours', hasGuide: true },
      { name: 'Berlin Wall Tours', hasGuide: true },
      { name: 'Museum Island Tours', hasGuide: true },
      { name: 'Food Beer Tours', hasGuide: true },
      { name: 'Historic District Tours', hasGuide: true },
      { name: 'Art Culture Tours', hasGuide: true }
    ],
    seo: {
      title: 'Berlin Tours & Excursions - Top-Rated Activities & Adventures',
      description: 'Discover top-rated Berlin tours, excursions, and activities powered by AI. From historic tours to museum experiences, find the perfect way to explore Germany\'s dynamic capital.',
      keywords: 'Berlin tours, Berlin excursions, Brandenburg Gate tours, Berlin Wall tours, things to do in Berlin',
      primaryKeyword: 'Berlin tours',
      secondaryKeywords: [
        'Berlin Brandenburg Gate tours',
        'Berlin Wall tours',
        'Berlin Museum Island tours',
        'Berlin food tours',
        'Berlin art tours',
        'Things to do in Berlin'
      ]
    },
    whyVisit: [
      'Iconic Brandenburg Gate and historic landmarks',
      'Historic Berlin Wall and Cold War history',
      'World-class Museum Island and cultural institutions',
      'Excellent German cuisine and beer culture',
      'Vibrant neighborhoods and cutting-edge culture',
      'Perfect blend of history and modernity'
    ],
    bestTimeToVisit: {
      weather: 'Berlin enjoys a temperate continental climate with warm summers and cold winters. Summers are warm (70-80°F/21-27°C), winters are cold (30-45°F/-1-7°C), and spring/fall offer pleasant temperatures.',
      bestMonths: 'May to September offer the best weather with mild temperatures, longer daylight hours, and perfect conditions for sightseeing.',
      peakSeason: 'June to August brings peak tourist season with warm weather, larger crowds, and higher prices.',
      offSeason: 'October to April offers lower prices and fewer crowds, though with cold weather and shorter days.'
    },
    gettingAround: 'Excellent public transportation with U-Bahn, S-Bahn, buses, and trams. Walking is perfect for exploring central Berlin, and taxis are readily available.',
    highlights: [
      'Brandenburg Gate - Iconic neoclassical monument',
      'Berlin Wall Memorial - Historic Cold War site',
      'Museum Island - UNESCO World Heritage site',
      'Reichstag Building - German parliament',
      'Checkpoint Charlie - Historic border crossing',
      'East Side Gallery - Famous wall art gallery'
    ]
  },
  {
    id: 'munich',
    name: 'Munich',
    fullName: 'Munich',
    country: 'Germany',
    category: 'Europe',
    briefDescription: 'Bavarian capital, Oktoberfest city, and cultural heritage — Munich is Germany\'s southern gem.',
    heroDescription: 'Welcome to Munich, where Bavarian traditions meet modern sophistication and world-famous beer culture comes alive. From the iconic Marienplatz to the magnificent Nymphenburg Palace, from traditional beer gardens to cutting-edge museums, this Bavarian capital offers the perfect blend of tradition, culture, and authentic German charm. Let our AI-powered planner help you discover the best experiences this magnificent destination has to offer.',
    imageUrl: 'https://ouqeoizufbofdqbuiwvx.supabase.co/storage/v1/object/public/destinations//Munich.webp',
    tourCategories: [
      { name: 'Oktoberfest Tours', hasGuide: true },
      { name: 'Beer Garden Tours', hasGuide: true },
      { name: 'Palace & Castle Tours', hasGuide: true },
      { name: 'Food & Beer Tours', hasGuide: true },
      { name: 'Historic District Tours', hasGuide: true },
      { name: 'Bavarian Culture Tours', hasGuide: true }
    ],
    seo: {
      title: 'Munich Tours & Excursions - Top-Rated Activities & Adventures',
      description: 'Discover top-rated Munich tours, excursions, and activities powered by AI. From Oktoberfest tours to beer garden experiences, find the perfect way to explore Bavaria\'s capital.',
      keywords: 'Munich tours, Munich excursions, Oktoberfest tours, beer garden tours, things to do in Munich',
      primaryKeyword: 'Munich tours',
      secondaryKeywords: [
        'Munich Oktoberfest tours',
        'Munich beer garden tours',
        'Munich palace tours',
        'Munich food tours',
        'Munich Bavarian tours',
        'Things to do in Munich'
      ]
    },
    whyVisit: [
      'World-famous Oktoberfest and beer culture',
      'Magnificent Nymphenburg Palace and royal heritage',
      'Traditional beer gardens and Bavarian cuisine',
      'Historic Marienplatz and medieval architecture',
      'Excellent museums and cultural institutions',
      'Perfect blend of tradition and modernity'
    ],
    bestTimeToVisit: {
      weather: 'Munich enjoys a temperate continental climate with warm summers and cold winters. Summers are warm (70-80°F/21-27°C), winters are cold (30-45°F/-1-7°C), and spring/fall offer pleasant temperatures.',
      bestMonths: 'May to September offer the best weather with mild temperatures, longer daylight hours, and perfect conditions for sightseeing.',
      peakSeason: 'September to October brings Oktoberfest season with larger crowds and higher prices.',
      offSeason: 'November to April offers lower prices and fewer crowds, though with cold weather and shorter days.'
    },
    gettingAround: 'Excellent public transportation with U-Bahn, S-Bahn, buses, and trams. Walking is perfect for exploring the compact city center, and taxis are readily available.',
    highlights: [
      'Marienplatz - Historic central square',
      'Nymphenburg Palace - Magnificent royal residence',
      'Oktoberfest - World\'s largest beer festival',
      'English Garden - Beautiful urban park',
      'Hofbräuhaus - Famous beer hall',
      'Frauenkirche - Iconic cathedral'
    ]
  },
  {
    id: 'zurich',
    name: 'Zurich',
    fullName: 'Zurich',
    country: 'Switzerland',
    category: 'Europe',
    briefDescription: 'Financial hub, lakeside beauty, and Swiss precision — Zurich is Switzerland\'s cosmopolitan heart.',
    heroDescription: 'Welcome to Zurich, where pristine Lake Zurich meets historic Old Town and Swiss precision creates a perfect urban experience. From the charming Altstadt to the beautiful lakefront, from world-class shopping to authentic Swiss cuisine, this cosmopolitan city offers the perfect blend of tradition, culture, and modern Swiss life. Let our AI-powered planner help you discover the best experiences this sophisticated destination has to offer.',
    imageUrl: 'https://ouqeoizufbofdqbuiwvx.supabase.co/storage/v1/object/public/destinations//Zurich.jpeg',
    tourCategories: [
      { name: 'Old Town Tours', hasGuide: true },
      { name: 'Lake Zurich Tours', hasGuide: true },
      { name: 'Swiss Alps Tours', hasGuide: true },
      { name: 'Food & Chocolate Tours', hasGuide: true },
      { name: 'Historic District Tours', hasGuide: true },
      { name: 'Shopping & Culture Tours', hasGuide: true }
    ],
    seo: {
      title: 'Zurich Tours & Excursions - Top-Rated Activities & Adventures',
      description: 'Discover top-rated Zurich tours, excursions, and activities powered by AI. From Old Town tours to lake experiences, find the perfect way to explore Switzerland\'s cosmopolitan heart.',
      keywords: 'Zurich tours, Zurich excursions, Old Town tours, Lake Zurich tours, things to do in Zurich',
      primaryKeyword: 'Zurich tours',
      secondaryKeywords: [
        'Zurich Old Town tours',
        'Zurich Lake Zurich tours',
        'Zurich Swiss Alps tours',
        'Zurich food tours',
        'Zurich shopping tours',
        'Things to do in Zurich'
      ]
    },
    whyVisit: [
      'Charming Old Town with medieval architecture',
      'Beautiful Lake Zurich and waterfront promenades',
      'Easy access to Swiss Alps and mountain scenery',
      'World-class shopping and Swiss luxury',
      'Excellent Swiss cuisine and chocolate culture',
      'Perfect blend of tradition and sophistication'
    ],
    bestTimeToVisit: {
      weather: 'Zurich enjoys a temperate climate with warm summers and cold winters. Summers are warm (70-80°F/21-27°C), winters are cold (30-45°F/-1-7°C), and spring/fall offer pleasant temperatures.',
      bestMonths: 'May to September offer the best weather with mild temperatures, longer daylight hours, and perfect conditions for sightseeing.',
      peakSeason: 'June to August brings peak tourist season with warm weather, larger crowds, and higher prices.',
      offSeason: 'October to April offers lower prices and fewer crowds, though with cold weather and shorter days.'
    },
    gettingAround: 'Excellent public transportation with trams, buses, and trains. Walking is perfect for exploring the compact city center, and taxis are readily available.',
    highlights: [
      'Old Town (Altstadt) - Historic medieval quarter',
      'Lake Zurich - Beautiful alpine lake',
      'Bahnhofstrasse - Famous shopping street',
      'Grossmünster - Iconic twin-towered church',
      'Uetliberg - Mountain with city views',
      'Swiss National Museum - Cultural history'
    ]
  },
  {
    id: 'interlaken',
    name: 'Interlaken',
    fullName: 'Interlaken',
    country: 'Switzerland',
    category: 'Europe',
    briefDescription: 'Alpine paradise, adventure capital, and mountain beauty — Interlaken is Switzerland\'s outdoor playground.',
    heroDescription: 'Welcome to Interlaken, where the majestic Swiss Alps provide a stunning backdrop for endless outdoor adventures and natural beauty. From the iconic Jungfrau region to pristine lakes, from thrilling adventure sports to peaceful mountain hikes, this alpine paradise offers the perfect blend of nature, adventure, and Swiss mountain culture. Let our AI-powered planner help you discover the best experiences this breathtaking destination has to offer.',
    imageUrl: 'https://ouqeoizufbofdqbuiwvx.supabase.co/storage/v1/object/public/destinations//Interlaken.jpg',
    tourCategories: [
      { name: 'Jungfrau Region Tours', hasGuide: true },
      { name: 'Adventure Sports Tours', hasGuide: true },
      { name: 'Mountain Hiking Tours', hasGuide: true },
      { name: 'Lake & Boat Tours', hasGuide: true },
      { name: 'Alpine Village Tours', hasGuide: true },
      { name: 'Scenic Train Tours', hasGuide: true }
    ],
    seo: {
      title: 'Interlaken Tours & Excursions - Top-Rated Activities & Adventures',
      description: 'Discover top-rated Interlaken tours, excursions, and activities powered by AI. From Jungfrau tours to adventure experiences, find the perfect way to explore Switzerland\'s outdoor playground.',
      keywords: 'Interlaken tours, Interlaken excursions, Jungfrau tours, adventure tours, things to do in Interlaken',
      primaryKeyword: 'Interlaken tours',
      secondaryKeywords: [
        'Interlaken Jungfrau tours',
        'Interlaken adventure tours',
        'Interlaken hiking tours',
        'Interlaken lake tours',
        'Interlaken mountain tours',
        'Things to do in Interlaken'
      ]
    },
    whyVisit: [
      'Stunning Jungfrau region and alpine scenery',
      'World-class adventure sports and outdoor activities',
      'Beautiful lakes and pristine mountain landscapes',
      'Charming alpine villages and Swiss culture',
      'Excellent hiking trails and scenic viewpoints',
      'Perfect blend of adventure and natural beauty'
    ],
    bestTimeToVisit: {
      weather: 'Interlaken enjoys an alpine climate with cool summers and cold winters. Summers are mild (60-75°F/16-24°C), winters are cold (25-40°F/-4-4°C), and the region offers year-round outdoor activities.',
      bestMonths: 'June to September offer the best weather for hiking and outdoor activities with mild temperatures and longer daylight hours.',
      peakSeason: 'July to August brings peak tourist season with warm weather, larger crowds, and higher prices.',
      offSeason: 'October to May offers lower prices and fewer crowds, though with cold weather and some seasonal closures.'
    },
    gettingAround: 'Excellent public transportation with trains, buses, and cable cars. Walking is perfect for exploring the town center, and mountain transport connects to surrounding areas.',
    highlights: [
      'Jungfraujoch - Top of Europe viewpoint',
      'Lake Thun & Lake Brienz - Beautiful alpine lakes',
      'Harder Kulm - Mountain with panoramic views',
      'Adventure Sports - Paragliding, hiking, skiing',
      'Schynige Platte - Historic cogwheel railway',
      'Alpine Villages - Traditional Swiss mountain culture'
    ]
  },
  {
    id: 'dubrovnik',
    name: 'Dubrovnik',
    fullName: 'Dubrovnik',
    country: 'Croatia',
    category: 'Europe',
    briefDescription: 'Medieval fortress, Adriatic beauty, and Croatian charm — Dubrovnik is Croatia\'s pearl of the Adriatic.',
    heroDescription: 'Welcome to Dubrovnik, where ancient stone walls encircle a perfectly preserved medieval city and the crystal-clear Adriatic Sea provides endless natural beauty. From the iconic city walls to historic churches, from pristine beaches to charming streets, this UNESCO World Heritage site offers the perfect blend of history, culture, and Croatian coastal charm. Let our AI-powered planner help you discover the best experiences this magnificent destination has to offer.',
    imageUrl: 'https://ouqeoizufbofdqbuiwvx.supabase.co/storage/v1/object/public/destinations//Dubrovnik.webp',
    tourCategories: [
      { name: 'City Walls Tours', hasGuide: true },
      { name: 'Old Town Tours', hasGuide: true },
      { name: 'Adriatic Boat Tours', hasGuide: true },
      { name: 'Food Wine Tours', hasGuide: true },
      { name: 'Game of Thrones Tours', hasGuide: true },
      { name: 'Island Hopping Tours', hasGuide: true }
    ],
    seo: {
      title: 'Dubrovnik Tours & Excursions - Top-Rated Activities & Adventures',
      description: 'Discover top-rated Dubrovnik tours, excursions, and activities powered by AI. From city walls tours to Adriatic experiences, find the perfect way to explore Croatia\'s pearl of the Adriatic.',
      keywords: 'Dubrovnik tours, Dubrovnik excursions, city walls tours, Old Town tours, things to do in Dubrovnik',
      primaryKeyword: 'Dubrovnik tours',
      secondaryKeywords: [
        'Dubrovnik city walls tours',
        'Dubrovnik Old Town tours',
        'Dubrovnik boat tours',
        'Dubrovnik food tours',
        'Dubrovnik Game of Thrones tours',
        'Things to do in Dubrovnik'
      ]
    },
    whyVisit: [
      'Iconic city walls and medieval architecture',
      'Historic Old Town with UNESCO World Heritage status',
      'Crystal-clear Adriatic Sea and pristine beaches',
      'Excellent Croatian cuisine and wine culture',
      'Beautiful island scenery and boat tours',
      'Perfect blend of history and coastal beauty'
    ],
    bestTimeToVisit: {
      weather: 'Dubrovnik enjoys a Mediterranean climate with hot summers and mild winters. Summers are hot (75-85°F/24-29°C), winters are mild (45-60°F/7-16°C), and spring/fall offer pleasant temperatures.',
      bestMonths: 'May to June and September to October offer the best weather with mild temperatures, fewer crowds, and perfect conditions for sightseeing.',
      peakSeason: 'July to August brings peak tourist season with hot weather, larger crowds, and higher prices.',
      offSeason: 'November to April offers lower prices and fewer crowds, though with cooler weather and some seasonal closures.'
    },
    gettingAround: 'Walking is perfect for exploring the compact Old Town. Buses connect to surrounding areas, and boat tours provide access to nearby islands.',
    highlights: [
      'City Walls - Iconic medieval fortifications',
      'Old Town - UNESCO World Heritage site',
      'Lokrum Island - Beautiful nature reserve',
      'Cable Car - Panoramic city views',
      'Banje Beach - Popular city beach',
      'Game of Thrones Locations - Famous filming sites'
    ]
  },
  {
    id: 'split',
    name: 'Split',
    fullName: 'Split',
    country: 'Croatia',
    category: 'Europe',
    briefDescription: 'Roman heritage, coastal beauty, and Dalmatian charm — Split is Croatia\'s historic seaside gem.',
    heroDescription: 'Welcome to Split, where ancient Roman ruins meet modern Croatian life and the stunning Dalmatian coast provides endless natural beauty. From the magnificent Diocletian\'s Palace to pristine beaches, from historic churches to vibrant waterfront, this coastal city offers the perfect blend of history, culture, and Croatian seaside charm. Let our AI-powered planner help you discover the best experiences this fascinating destination has to offer.',
    imageUrl: 'https://ouqeoizufbofdqbuiwvx.supabase.co/storage/v1/object/public/destinations//Split.jpg',
    tourCategories: [
      { name: 'Diocletian\'s Palace Tours', hasGuide: true },
      { name: 'Coastal Boat Tours', hasGuide: true },
      { name: 'Island Hopping Tours', hasGuide: true },
      { name: 'Food & Wine Tours', hasGuide: true },
      { name: 'Historic District Tours', hasGuide: true },
      { name: 'Beach & Water Sports', hasGuide: true }
    ],
    seo: {
      title: 'Split Tours & Excursions - Top-Rated Activities & Adventures',
      description: 'Discover top-rated Split tours, excursions, and activities powered by AI. From palace tours to coastal experiences, find the perfect way to explore Croatia\'s historic seaside gem.',
      keywords: 'Split tours, Split excursions, Diocletian\'s Palace tours, coastal tours, things to do in Split',
      primaryKeyword: 'Split tours',
      secondaryKeywords: [
        'Split Diocletian\'s Palace tours',
        'Split coastal tours',
        'Split island hopping',
        'Split food tours',
        'Split beach tours',
        'Things to do in Split'
      ]
    },
    whyVisit: [
      'Magnificent Diocletian\'s Palace and Roman heritage',
      'Beautiful Dalmatian coast and pristine beaches',
      'Excellent Croatian cuisine and wine culture',
      'Charming historic center and waterfront',
      'Easy access to nearby islands and natural beauty',
      'Perfect blend of history and coastal life'
    ],
    bestTimeToVisit: {
      weather: 'Split enjoys a Mediterranean climate with hot summers and mild winters. Summers are hot (75-85°F/24-29°C), winters are mild (45-60°F/7-16°C), and spring/fall offer pleasant temperatures.',
      bestMonths: 'May to June and September to October offer the best weather with mild temperatures, fewer crowds, and perfect conditions for sightseeing.',
      peakSeason: 'July to August brings peak tourist season with hot weather, larger crowds, and higher prices.',
      offSeason: 'November to April offers lower prices and fewer crowds, though with cooler weather and some seasonal closures.'
    },
    gettingAround: 'Walking is perfect for exploring the compact historic center. Buses connect to surrounding areas, and ferries provide access to nearby islands.',
    highlights: [
      'Diocletian\'s Palace - UNESCO World Heritage site',
      'Riva Waterfront - Beautiful seaside promenade',
      'Marjan Hill - Scenic viewpoint and park',
      'Bacvice Beach - Popular city beach',
      'Cathedral of Saint Domnius - Historic church',
      'Island Excursions - Easy access to nearby islands'
    ]
  },
  {
    id: 'prague',
    name: 'Prague',
    fullName: 'Prague',
    country: 'Czech Republic',
    category: 'Europe',
    briefDescription: 'Medieval magic, Gothic grandeur, and Bohemian charm — Prague is the Czech Republic\'s golden city.',
    heroDescription: 'Welcome to Prague, where medieval spires pierce the sky and centuries of history come alive in every cobblestone street. From the iconic Charles Bridge to the magnificent Prague Castle, from charming Old Town to vibrant culture, this golden city offers the perfect blend of history, architecture, and Czech charm. Let our AI-powered planner help you discover the best experiences this enchanting destination has to offer.',
    imageUrl: 'https://ouqeoizufbofdqbuiwvx.supabase.co/storage/v1/object/public/destinations//Prague.webp',
    tourCategories: [
      { name: 'Prague Castle Tours', hasGuide: true },
      { name: 'Charles Bridge Tours', hasGuide: true },
      { name: 'Old Town Tours', hasGuide: true },
      { name: 'Beer & Food Tours', hasGuide: true },
      { name: 'Historic District Tours', hasGuide: true },
      { name: 'Architecture & Culture Tours', hasGuide: true }
    ],
    seo: {
      title: 'Prague Tours & Excursions - Top-Rated Activities & Adventures',
      description: 'Discover top-rated Prague tours, excursions, and activities powered by AI. From castle tours to historic experiences, find the perfect way to explore the Czech Republic\'s golden city.',
      keywords: 'Prague tours, Prague excursions, Prague Castle tours, Charles Bridge tours, things to do in Prague',
      primaryKeyword: 'Prague tours',
      secondaryKeywords: [
        'Prague Castle tours',
        'Prague Charles Bridge tours',
        'Prague Old Town tours',
        'Prague beer tours',
        'Prague architecture tours',
        'Things to do in Prague'
      ]
    },
    whyVisit: [
      'Magnificent Prague Castle and royal heritage',
      'Iconic Charles Bridge and medieval architecture',
      'Charming Old Town with historic squares',
      'Excellent Czech beer and traditional cuisine',
      'Beautiful Gothic and Baroque architecture',
      'Perfect blend of history and Bohemian culture'
    ],
    bestTimeToVisit: {
      weather: 'Prague enjoys a temperate continental climate with warm summers and cold winters. Summers are warm (70-80°F/21-27°C), winters are cold (25-40°F/-4-4°C), and spring/fall offer pleasant temperatures.',
      bestMonths: 'April to May and September to October offer the best weather with mild temperatures, fewer crowds, and perfect conditions for sightseeing.',
      peakSeason: 'June to August brings peak tourist season with warm weather, larger crowds, and higher prices.',
      offSeason: 'November to March offers lower prices and fewer crowds, though with cold weather and shorter days.'
    },
    gettingAround: 'Excellent public transportation with metro, trams, and buses. Walking is perfect for exploring the compact historic center, and taxis are readily available.',
    highlights: [
      'Prague Castle - Largest ancient castle complex',
      'Charles Bridge - Iconic medieval bridge',
      'Old Town Square - Historic central square',
      'Astronomical Clock - Famous medieval clock',
      'St. Vitus Cathedral - Magnificent Gothic cathedral',
      'Wenceslas Square - Historic boulevard'
    ]
  },
  {
    id: 'vienna',
    name: 'Vienna',
    fullName: 'Vienna',
    country: 'Austria',
    category: 'Europe',
    briefDescription: 'Imperial elegance, musical heritage, and Austrian charm — Vienna is Austria\'s cultural heart.',
    heroDescription: 'Welcome to Vienna, where imperial palaces echo with the music of Mozart and centuries of Habsburg grandeur create a city of unmatched elegance. From the magnificent Schönbrunn Palace to the historic Hofburg, from world-class opera to charming coffee houses, this imperial capital offers the perfect blend of history, culture, and Austrian sophistication. Let our AI-powered planner help you discover the best experiences this magnificent destination has to offer.',
    imageUrl: 'https://ouqeoizufbofdqbuiwvx.supabase.co/storage/v1/object/public/destinations//Vienna.webp',
    tourCategories: [
      { name: 'Schönbrunn Palace Tours', hasGuide: true },
      { name: 'Hofburg Palace Tours', hasGuide: true },
      { name: 'Classical Music Tours', hasGuide: true },
      { name: 'Coffee House Tours', hasGuide: true },
      { name: 'Historic District Tours', hasGuide: true },
      { name: 'Art & Culture Tours', hasGuide: true }
    ],
    seo: {
      title: 'Vienna Tours & Excursions - Top-Rated Activities & Adventures',
      description: 'Discover top-rated Vienna tours, excursions, and activities powered by AI. From palace tours to classical music experiences, find the perfect way to explore Austria\'s cultural heart.',
      keywords: 'Vienna tours, Vienna excursions, Schönbrunn Palace tours, Hofburg tours, things to do in Vienna',
      primaryKeyword: 'Vienna tours',
      secondaryKeywords: [
        'Vienna Schönbrunn Palace tours',
        'Vienna Hofburg tours',
        'Vienna classical music tours',
        'Vienna coffee house tours',
        'Vienna art tours',
        'Things to do in Vienna'
      ]
    },
    whyVisit: [
      'Magnificent Schönbrunn Palace and imperial heritage',
      'Historic Hofburg and Habsburg history',
      'World-class classical music and opera',
      'Traditional coffee houses and Austrian cuisine',
      'Beautiful Baroque and Art Nouveau architecture',
      'Perfect blend of imperial grandeur and culture'
    ],
    bestTimeToVisit: {
      weather: 'Vienna enjoys a temperate continental climate with warm summers and cold winters. Summers are warm (70-80°F/21-27°C), winters are cold (25-40°F/-4-4°C), and spring/fall offer pleasant temperatures.',
      bestMonths: 'April to May and September to October offer the best weather with mild temperatures, fewer crowds, and perfect conditions for sightseeing.',
      peakSeason: 'June to August brings peak tourist season with warm weather, larger crowds, and higher prices.',
      offSeason: 'November to March offers lower prices and fewer crowds, though with cold weather and shorter days.'
    },
    gettingAround: 'Excellent public transportation with U-Bahn, trams, and buses. Walking is perfect for exploring the compact city center, and taxis are readily available.',
    highlights: [
      'Schönbrunn Palace - Magnificent imperial residence',
      'Hofburg Palace - Historic Habsburg palace',
      'St. Stephen\'s Cathedral - Iconic Gothic cathedral',
      'Belvedere Palace - Beautiful Baroque palace',
      'Vienna State Opera - World-famous opera house',
      'Prater Park - Historic amusement park'
    ]
  },
  {
    id: 'budapest',
    name: 'Budapest',
    fullName: 'Budapest',
    country: 'Hungary',
    category: 'Europe',
    briefDescription: 'Danube beauty, thermal baths, and Hungarian heritage — Budapest is Hungary\'s pearl of the Danube.',
    heroDescription: 'Welcome to Budapest, where the majestic Danube River divides two historic cities and thermal springs have been healing visitors for centuries. From the magnificent Parliament Building to the historic thermal baths, from charming Buda Castle to vibrant Pest, this dual city offers the perfect blend of history, culture, and Hungarian charm. Let our AI-powered planner help you discover the best experiences this fascinating destination has to offer.',
    imageUrl: 'https://ouqeoizufbofdqbuiwvx.supabase.co/storage/v1/object/public/destinations//Budapest.webp',
    tourCategories: [
      { name: 'Parliament Building Tours', hasGuide: true },
      { name: 'Thermal Bath Tours', hasGuide: true },
      { name: 'Buda Castle Tours', hasGuide: true },
      { name: 'Danube River Tours', hasGuide: true },
      { name: 'Food Wine Tours', hasGuide: true },
      { name: 'Historic District Tours', hasGuide: true }
    ],
    seo: {
      title: 'Budapest Tours & Excursions - Top-Rated Activities & Adventures',
      description: 'Discover top-rated Budapest tours, excursions, and activities powered by AI. From parliament tours to thermal bath experiences, find the perfect way to explore Hungary\'s pearl of the Danube.',
      keywords: 'Budapest tours, Budapest excursions, Parliament tours, thermal baths, things to do in Budapest',
      primaryKeyword: 'Budapest tours',
      secondaryKeywords: [
        'Budapest Parliament tours',
        'Budapest thermal bath tours',
        'Budapest Buda Castle tours',
        'Budapest Danube tours',
        'Budapest food tours',
        'Things to do in Budapest'
      ]
    },
    whyVisit: [
      'Magnificent Parliament Building and political heritage',
      'Historic thermal baths and spa culture',
      'Beautiful Buda Castle and medieval architecture',
      'Scenic Danube River and bridge views',
      'Excellent Hungarian cuisine and wine culture',
      'Perfect blend of history and thermal wellness'
    ],
    bestTimeToVisit: {
      weather: 'Budapest enjoys a temperate continental climate with warm summers and cold winters. Summers are warm (70-80°F/21-27°C), winters are cold (25-40°F/-4-4°C), and spring/fall offer pleasant temperatures.',
      bestMonths: 'April to May and September to October offer the best weather with mild temperatures, fewer crowds, and perfect conditions for sightseeing.',
      peakSeason: 'June to August brings peak tourist season with warm weather, larger crowds, and higher prices.',
      offSeason: 'November to March offers lower prices and fewer crowds, though with cold weather and shorter days.'
    },
    gettingAround: 'Excellent public transportation with metro, trams, and buses. Walking is perfect for exploring the compact city center, and taxis are readily available.',
    highlights: [
      'Parliament Building - Magnificent neo-Gothic palace',
      'Széchenyi Thermal Baths - Famous spa complex',
      'Buda Castle - Historic royal palace',
      'Chain Bridge - Iconic Danube bridge',
      'Fisherman\'s Bastion - Beautiful lookout terrace',
      'Heroes\' Square - Historic monument square'
    ]
  },
  {
    id: 'reykjavik',
    name: 'Reykjavik',
    fullName: 'Reykjavik',
    country: 'Iceland',
    category: 'Europe',
    briefDescription: 'Northern lights, geothermal wonders, and Icelandic charm — Reykjavik is Iceland\'s vibrant capital.',
    heroDescription: 'Welcome to Reykjavik, where geothermal energy powers a modern city and the northern lights dance across Arctic skies. From the iconic Hallgrímskirkja to the famous Blue Lagoon, from vibrant culture to stunning natural wonders, this northern capital offers the perfect blend of urban life and Icelandic nature. Let our AI-powered planner help you discover the best experiences this unique destination has to offer.',
    imageUrl: 'https://ouqeoizufbofdqbuiwvx.supabase.co/storage/v1/object/public/destinations//Reykjavik.jpg',
    tourCategories: [
      { name: 'Northern Lights Tours', hasGuide: true },
      { name: 'Golden Circle Tours', hasGuide: true },
      { name: 'Blue Lagoon Tours', hasGuide: true },
      { name: 'Geothermal Tours', hasGuide: true },
      { name: 'Food & Culture Tours', hasGuide: true },
      { name: 'Adventure Tours', hasGuide: true }
    ],
    seo: {
      title: 'Reykjavik Tours & Excursions - Top-Rated Activities & Adventures',
      description: 'Discover top-rated Reykjavik tours, excursions, and activities powered by AI. From northern lights tours to geothermal experiences, find the perfect way to explore Iceland\'s vibrant capital.',
      keywords: 'Reykjavik tours, Reykjavik excursions, northern lights tours, Golden Circle tours, things to do in Reykjavik',
      primaryKeyword: 'Reykjavik tours',
      secondaryKeywords: [
        'Reykjavik northern lights tours',
        'Reykjavik Golden Circle tours',
        'Reykjavik Blue Lagoon tours',
        'Reykjavik geothermal tours',
        'Reykjavik food tours',
        'Things to do in Reykjavik'
      ]
    },
    whyVisit: [
      'Spectacular northern lights and Arctic skies',
      'Famous Golden Circle and natural wonders',
      'Iconic Blue Lagoon and geothermal spas',
      'Unique Icelandic cuisine and culture',
      'Easy access to stunning natural landscapes',
      'Perfect blend of urban life and nature'
    ],
    bestTimeToVisit: {
      weather: 'Reykjavik enjoys a subarctic climate with cool summers and cold winters. Summers are mild (50-65°F/10-18°C), winters are cold (25-40°F/-4-4°C), and the weather can be unpredictable year-round.',
      bestMonths: 'June to August offer the best weather with mild temperatures, longer daylight hours, and perfect conditions for sightseeing.',
      peakSeason: 'June to August brings peak tourist season with mild weather, larger crowds, and higher prices.',
      offSeason: 'September to May offers lower prices and fewer crowds, though with cold weather and shorter days.'
    },
    gettingAround: 'Good public transportation with buses. Walking is perfect for exploring the compact city center, and organized tours provide access to surrounding natural attractions.',
    highlights: [
      'Hallgrímskirkja - Iconic Lutheran church',
      'Golden Circle - Famous natural route',
      'Blue Lagoon - World-famous geothermal spa',
      'Northern Lights - Spectacular aurora displays',
      'Harpa Concert Hall - Modern cultural center',
      'Geothermal Areas - Natural hot springs'
    ]
  },
  {
    id: 'oslo',
    name: 'Oslo',
    fullName: 'Oslo',
    country: 'Norway',
    category: 'Europe',
    briefDescription: 'Fjord capital, Viking heritage, and Norwegian charm — Oslo is Norway\'s modern heart.',
    heroDescription: 'Welcome to Oslo, where modern Scandinavian design meets ancient Viking history and stunning fjords provide a breathtaking natural backdrop. From the iconic Viking Ship Museum to the beautiful Oslo Fjord, from world-class museums to outdoor adventures, this Nordic capital offers the perfect blend of history, culture, and Norwegian nature. Let our AI-powered planner help you discover the best experiences this sophisticated destination has to offer.',
    imageUrl: 'https://ouqeoizufbofdqbuiwvx.supabase.co/storage/v1/object/public/destinations//Oslo.jpeg',
    tourCategories: [
      { name: 'Viking Ship Museum Tours', hasGuide: true },
      { name: 'Oslo Fjord Tours', hasGuide: true },
      { name: 'Fram Museum Tours', hasGuide: true },
      { name: 'Food & Culture Tours', hasGuide: true },
      { name: 'Historic District Tours', hasGuide: true },
      { name: 'Outdoor Adventure Tours', hasGuide: true }
    ],
    seo: {
      title: 'Oslo Tours & Excursions - Top-Rated Activities & Adventures',
      description: 'Discover top-rated Oslo tours, excursions, and activities powered by AI. From Viking museum tours to fjord experiences, find the perfect way to explore Norway\'s modern heart.',
      keywords: 'Oslo tours, Oslo excursions, Viking Ship Museum tours, Oslo Fjord tours, things to do in Oslo',
      primaryKeyword: 'Oslo tours',
      secondaryKeywords: [
        'Oslo Viking Ship Museum tours',
        'Oslo Fjord tours',
        'Oslo Fram Museum tours',
        'Oslo food tours',
        'Oslo outdoor tours',
        'Things to do in Oslo'
      ]
    },
    whyVisit: [
      'Famous Viking Ship Museum and Norse heritage',
      'Beautiful Oslo Fjord and natural scenery',
      'World-class museums and cultural institutions',
      'Excellent Norwegian cuisine and culture',
      'Easy access to outdoor adventures and nature',
      'Perfect blend of history and modern Nordic life'
    ],
    bestTimeToVisit: {
      weather: 'Oslo enjoys a temperate climate with warm summers and cold winters. Summers are mild (60-75°F/16-24°C), winters are cold (20-35°F/-6-2°C), and spring/fall offer pleasant temperatures.',
      bestMonths: 'May to September offer the best weather with mild temperatures, longer daylight hours, and perfect conditions for sightseeing.',
      peakSeason: 'June to August brings peak tourist season with mild weather, larger crowds, and higher prices.',
      offSeason: 'October to April offers lower prices and fewer crowds, though with cold weather and shorter days.'
    },
    gettingAround: 'Excellent public transportation with metro, trams, and buses. Walking is perfect for exploring the compact city center, and ferries provide access to the fjord.',
    highlights: [
      'Viking Ship Museum - Famous Norse artifacts',
      'Oslo Fjord - Beautiful natural harbor',
      'Fram Museum - Polar exploration history',
      'Vigeland Sculpture Park - Famous art park',
      'Holmenkollen Ski Jump - Iconic sports venue',
      'Akershus Fortress - Historic castle'
    ]
  },
  {
    id: 'lofoten-islands',
    name: 'Lofoten Islands',
    fullName: 'Lofoten Islands',
    country: 'Norway',
    category: 'Europe',
    briefDescription: 'Arctic beauty, fishing villages, and dramatic landscapes — Lofoten Islands are Norway\'s northern paradise.',
    heroDescription: 'Welcome to the Lofoten Islands, where dramatic mountains rise from the Norwegian Sea and traditional fishing villages cling to pristine shores. From the iconic fishing villages to stunning fjords, from midnight sun to northern lights, this Arctic archipelago offers the perfect blend of natural beauty, culture, and Norwegian coastal life. Let our AI-powered planner help you discover the best experiences this breathtaking destination has to offer.',
    imageUrl: 'https://ouqeoizufbofdqbuiwvx.supabase.co/storage/v1/object/public/destinations//Lofoten%20Islands.jpg',
    tourCategories: [
      { name: 'Fishing Village Tours', hasGuide: true },
      { name: 'Northern Lights Tours', hasGuide: true },
      { name: 'Midnight Sun Tours', hasGuide: true },
      { name: 'Hiking & Nature Tours', hasGuide: true },
      { name: 'Fjord & Boat Tours', hasGuide: true },
      { name: 'Photography Tours', hasGuide: true }
    ],
    seo: {
      title: 'Lofoten Islands Tours & Excursions - Top-Rated Activities & Adventures',
      description: 'Discover top-rated Lofoten Islands tours, excursions, and activities powered by AI. From fishing village tours to northern lights experiences, find the perfect way to explore Norway\'s northern paradise.',
      keywords: 'Lofoten Islands tours, Lofoten excursions, fishing village tours, northern lights tours, things to do in Lofoten',
      primaryKeyword: 'Lofoten Islands tours',
      secondaryKeywords: [
        'Lofoten fishing village tours',
        'Lofoten northern lights tours',
        'Lofoten midnight sun tours',
        'Lofoten hiking tours',
        'Lofoten fjord tours',
        'Things to do in Lofoten'
      ]
    },
    whyVisit: [
      'Iconic fishing villages and traditional culture',
      'Spectacular northern lights and midnight sun',
      'Dramatic mountain landscapes and fjords',
      'Excellent hiking trails and outdoor activities',
      'Authentic Norwegian coastal life',
      'Perfect blend of nature and culture'
    ],
    bestTimeToVisit: {
      weather: 'The Lofoten Islands enjoy a subarctic climate with cool summers and cold winters. Summers are mild (50-65°F/10-18°C), winters are cold (25-40°F/-4-4°C), and the weather can be unpredictable year-round.',
      bestMonths: 'June to August offer the best weather with mild temperatures, midnight sun, and perfect conditions for outdoor activities.',
      peakSeason: 'June to August brings peak tourist season with mild weather, larger crowds, and higher prices.',
      offSeason: 'September to May offers lower prices and fewer crowds, though with cold weather and shorter days.'
    },
    gettingAround: 'Limited public transportation. Renting a car is recommended for exploring the islands, and organized tours provide access to remote areas.',
    highlights: [
      'Fishing Villages - Traditional coastal settlements',
      'Northern Lights - Spectacular aurora displays',
      'Midnight Sun - 24-hour daylight in summer',
      'Hiking Trails - Stunning mountain paths',
      'Fjords - Beautiful coastal landscapes',
      'Photography - World-class scenic opportunities'
    ]
  },
  {
    id: 'new-york-city',
    name: 'New York City',
    fullName: 'New York City',
    country: 'USA',
    category: 'North America',
    briefDescription: 'The city that never sleeps, iconic landmarks, and endless energy — New York City is the world\'s most dynamic metropolis.',
    relatedGuides: ['best-things-to-do-in-new-york'],
    heroDescription: 'Welcome to New York City, where iconic skyscrapers meet diverse neighborhoods and endless possibilities await around every corner. From the bright lights of Times Square to the cultural treasures of museums, from Central Park\'s green oasis to the vibrant food scene, this global city offers the perfect blend of excitement, culture, and urban adventure. Let our AI-powered planner help you discover the best experiences this incredible destination has to offer.',
    imageUrl: 'https://ouqeoizufbofdqbuiwvx.supabase.co/storage/v1/object/public/destinations//New%20York%20City.jpeg',
    tourCategories: [
      { name: 'Times Square Tours', hasGuide: true },
      { name: 'Central Park Tours', hasGuide: true },
      { name: 'Museum Tours', hasGuide: true },
      { name: 'Food & Culture Tours', hasGuide: true },
      { name: 'Broadway Shows', hasGuide: true },
      { name: 'Architecture Tours', hasGuide: true }
    ],
    seo: {
      title: 'New York City Tours & Excursions - Top-Rated Activities & Adventures',
      description: 'Discover top-rated New York City tours, excursions, and activities powered by AI. From Times Square to Central Park, find the perfect way to explore the Big Apple.',
      keywords: 'New York City tours, NYC tours, Times Square tours, Central Park tours, things to do in New York City',
      primaryKeyword: 'New York City tours',
      secondaryKeywords: [
        'New York City Times Square tours',
        'New York City Central Park tours',
        'New York City museum tours',
        'New York City food tours',
        'New York City Broadway shows',
        'Things to do in New York City'
      ]
    },
    whyVisit: [
      'Iconic landmarks like Times Square and Statue of Liberty',
      'World-class museums and cultural institutions',
      'Diverse neighborhoods and authentic cuisine',
      'Broadway shows and entertainment',
      'Central Park and urban green spaces',
      'Perfect blend of culture, entertainment, and urban life'
    ],
    bestTimeToVisit: {
      weather: 'New York City enjoys four distinct seasons. Summers are hot (75-85°F/24-29°C), winters are cold (25-40°F/-4-4°C), and spring/fall offer pleasant temperatures.',
      bestMonths: 'April to June and September to November offer the best weather with mild temperatures, fewer crowds, and perfect conditions for sightseeing.',
      peakSeason: 'June to August brings peak tourist season with hot weather, larger crowds, and higher prices.',
      offSeason: 'December to March offers lower prices and fewer crowds, though with cold weather and occasional snow.'
    },
    gettingAround: 'Excellent public transportation with subway, buses, and trains. Walking is perfect for exploring neighborhoods, and taxis/Uber are readily available.',
    highlights: [
      'Times Square - Iconic entertainment district',
      'Central Park - Urban oasis and recreation',
      'Statue of Liberty - Symbol of freedom',
      'Broadway - World-famous theater district',
      'Metropolitan Museum of Art - World-class art collection',
      'Empire State Building - Iconic skyscraper'
    ]
  },
  {
    id: 'los-angeles',
    name: 'Los Angeles',
    fullName: 'Los Angeles',
    country: 'USA',
    category: 'North America',
    briefDescription: 'City of Angels, entertainment capital, and endless sunshine — Los Angeles is California\'s glamorous heart.',
    relatedGuides: ['los-angeles-tours'],
    heroDescription: 'Welcome to Los Angeles, where Hollywood dreams meet beach culture and diverse neighborhoods create a vibrant tapestry of experiences. From the iconic Hollywood sign to the beautiful beaches of Santa Monica, from world-class museums to authentic ethnic cuisine, this sprawling metropolis offers the perfect blend of entertainment, culture, and California lifestyle. Let our AI-powered planner help you discover the best experiences this dynamic destination has to offer.',
    imageUrl: 'https://ouqeoizufbofdqbuiwvx.supabase.co/storage/v1/object/public/destinations//Los%20Angeles.webp',
    tourCategories: [
      { name: 'Hollywood Tours', hasGuide: true },
      { name: 'Beach Tours', hasGuide: true },
      { name: 'Movie Studio Tours', hasGuide: true },
      { name: 'Food & Culture Tours', hasGuide: true },
      { name: 'Museum Tours', hasGuide: true },
      { name: 'Celebrity Tours', hasGuide: true }
    ],
    seo: {
      title: 'Los Angeles Tours & Excursions - Top-Rated Activities & Adventures',
      description: 'Discover top-rated Los Angeles tours, excursions, and activities powered by AI. From Hollywood tours to beach experiences, find the perfect way to explore the City of Angels.',
      keywords: 'Los Angeles tours, LA tours, Hollywood tours, beach tours, things to do in Los Angeles',
      primaryKeyword: 'Los Angeles tours',
      secondaryKeywords: [
        'Los Angeles Hollywood tours',
        'Los Angeles beach tours',
        'Los Angeles studio tours',
        'Los Angeles food tours',
        'Los Angeles museum tours',
        'Things to do in Los Angeles'
      ]
    },
    whyVisit: [
      'Hollywood entertainment industry and celebrity culture',
      'Beautiful beaches from Santa Monica to Venice',
      'World-class museums and cultural institutions',
      'Diverse neighborhoods and authentic cuisine',
      'Perfect weather year-round',
      'Perfect blend of entertainment and lifestyle'
    ],
    bestTimeToVisit: {
      weather: 'Los Angeles enjoys a Mediterranean climate with mild, wet winters and warm, dry summers. Average temperatures range from 60°F (16°C) in winter to 85°F (29°C) in summer.',
      bestMonths: 'March to May and September to November offer the best weather with mild temperatures, fewer crowds, and perfect conditions for sightseeing.',
      peakSeason: 'June to August brings peak tourist season with warm weather, larger crowds, and higher prices.',
      offSeason: 'December to February offers lower prices and fewer crowds, though with occasional rain.'
    },
    gettingAround: 'Public transportation includes Metro rail and buses. Renting a car is recommended for flexibility, and ride-sharing services are widely available.',
    highlights: [
      'Hollywood Walk of Fame - Celebrity stars and entertainment',
      'Santa Monica Pier - Iconic beach destination',
      'Venice Beach - Famous boardwalk and culture',
      'Getty Center - World-class art museum',
      'Griffith Observatory - Stunning city views',
      'Universal Studios - Movie theme park'
    ]
  },
  {
    id: 'las-vegas',
    name: 'Las Vegas',
    fullName: 'Las Vegas',
    country: 'USA',
    category: 'North America',
    briefDescription: 'Entertainment capital, dazzling lights, and endless excitement — Las Vegas is the world\'s playground.',
    heroDescription: 'Welcome to Las Vegas, where the desert meets dazzling entertainment and every night promises unforgettable experiences. From the iconic Strip with its spectacular shows to world-class dining and shopping, from thrilling casinos to stunning natural landscapes just beyond the city, this entertainment capital offers the perfect blend of excitement, luxury, and adventure. Let our AI-powered planner help you discover the best experiences this incredible destination has to offer.',
    imageUrl: 'https://ouqeoizufbofdqbuiwvx.supabase.co/storage/v1/object/public/destinations//Las%20Vegas.webp',
    tourCategories: [
      { name: 'Strip Tours', hasGuide: true },
      { name: 'Show Tours', hasGuide: true },
      { name: 'Casino Tours', hasGuide: true },
      { name: 'Food & Dining Tours', hasGuide: true },
      { name: 'Adventure Tours', hasGuide: true },
      { name: 'Helicopter Tours', hasGuide: true }
    ],
    seo: {
      title: 'Las Vegas Tours & Excursions - Top-Rated Activities & Adventures',
      description: 'Discover top-rated Las Vegas tours, excursions, and activities powered by AI. From Strip tours to show experiences, find the perfect way to explore Sin City.',
      keywords: 'Las Vegas tours, Vegas tours, Strip tours, casino tours, things to do in Las Vegas',
      primaryKeyword: 'Las Vegas tours',
      secondaryKeywords: [
        'Las Vegas Strip tours',
        'Las Vegas show tours',
        'Las Vegas casino tours',
        'Las Vegas food tours',
        'Las Vegas adventure tours',
        'Things to do in Las Vegas'
      ]
    },
    whyVisit: [
      'Iconic Las Vegas Strip with spectacular shows',
      'World-class entertainment and performances',
      'Luxury resorts and fine dining',
      'Thrilling casinos and nightlife',
      'Stunning desert landscapes nearby',
      'Perfect blend of entertainment and luxury'
    ],
    bestTimeToVisit: {
      weather: 'Las Vegas enjoys a desert climate with hot summers and mild winters. Summers are very hot (90-110°F/32-43°C), winters are mild (45-65°F/7-18°C), and spring/fall offer pleasant temperatures.',
      bestMonths: 'March to May and September to November offer the best weather with mild temperatures, fewer crowds, and perfect conditions for exploring.',
      peakSeason: 'June to August brings peak tourist season with hot weather, larger crowds, and higher prices.',
      offSeason: 'December to February offers lower prices and fewer crowds, though with cooler weather.'
    },
    gettingAround: 'The Strip is walkable, with monorail and bus transportation. Taxis and ride-sharing are readily available, and many resorts offer shuttle services.',
    highlights: [
      'Las Vegas Strip - Iconic entertainment corridor',
      'Fremont Street - Historic downtown experience',
      'Bellagio Fountains - Spectacular water shows',
      'High Roller - World\'s tallest observation wheel',
      'Red Rock Canyon - Stunning natural landscapes',
      'Grand Canyon - Easy day trip destination'
    ]
  },
  {
    id: 'miami',
    name: 'Miami',
    fullName: 'Miami',
    country: 'USA',
    category: 'North America',
    briefDescription: 'Magic City, tropical vibes, and Latin flair — Miami is Florida\'s most vibrant metropolis.',
    relatedGuides: ['miami-water-tours'],
    heroDescription: 'Welcome to Miami, where tropical beaches meet urban sophistication and Latin culture infuses every aspect of life. From the iconic Art Deco architecture of South Beach to the vibrant neighborhoods of Little Havana, from pristine beaches to world-class dining, this dynamic city offers the perfect blend of beach culture, urban excitement, and international flair. Let our AI-powered planner help you discover the best experiences this incredible destination has to offer.',
    imageUrl: 'https://ouqeoizufbofdqbuiwvx.supabase.co/storage/v1/object/public/destinations//Miami.jpg',
    tourCategories: [
      { name: 'South Beach Tours', hasGuide: true },
      { name: 'Art Deco Tours', hasGuide: true },
      { name: 'Little Havana Tours', hasGuide: true },
      { name: 'Beach & Water Sports', hasGuide: true },
      { name: 'Food & Culture Tours', hasGuide: true },
      { name: 'Boat Tours', hasGuide: true }
    ],
    seo: {
      title: 'Miami Tours & Excursions - Top-Rated Activities & Adventures',
      description: 'Discover top-rated Miami tours, excursions, and activities powered by AI. From South Beach tours to cultural experiences, find the perfect way to explore the Magic City.',
      keywords: 'Miami tours, South Beach tours, Art Deco tours, things to do in Miami',
      primaryKeyword: 'Miami tours',
      secondaryKeywords: [
        'Miami South Beach tours',
        'Miami Art Deco tours',
        'Miami Little Havana tours',
        'Miami beach tours',
        'Miami food tours',
        'Things to do in Miami'
      ]
    },
    whyVisit: [
      'Iconic South Beach with Art Deco architecture',
      'Vibrant Latin culture and Little Havana',
      'Pristine beaches and water sports',
      'World-class dining and nightlife',
      'Perfect tropical weather year-round',
      'Perfect blend of beach culture and urban excitement'
    ],
    bestTimeToVisit: {
      weather: 'Miami enjoys a tropical climate with hot, humid summers and warm, dry winters. Average temperatures range from 70°F (21°C) in winter to 90°F (32°C) in summer.',
      bestMonths: 'December to April offers the best weather with warm temperatures, low humidity, and perfect conditions for all activities.',
      peakSeason: 'December to April brings peak tourist season with ideal weather, larger crowds, and higher prices.',
      offSeason: 'May to November offers lower prices and fewer crowds, though with hot, humid weather and hurricane season.'
    },
    gettingAround: 'Public transportation includes Metrorail, Metromover, and buses. Renting a car provides flexibility, and ride-sharing services are widely available.',
    highlights: [
      'South Beach - Iconic Art Deco district',
      'Little Havana - Vibrant Cuban culture',
      'Wynwood Walls - Street art and galleries',
      'Vizcaya Museum - Historic mansion and gardens',
      'Bayside Marketplace - Waterfront shopping',
      'Everglades National Park - Unique ecosystem'
    ]
  },
  {
    id: 'orlando',
    name: 'Orlando',
    fullName: 'Orlando',
    country: 'USA',
    category: 'North America',
    briefDescription: 'Theme park capital, family fun, and magical adventures — Orlando is the world\'s entertainment destination.',
    heroDescription: 'Welcome to Orlando, where dreams come true and magical adventures await around every corner. From the enchanting world of Disney to the thrilling rides of Universal, from world-class attractions to natural wonders, this family-friendly destination offers the perfect blend of entertainment, adventure, and unforgettable experiences. Let our AI-powered planner help you discover the best experiences this incredible destination has to offer.',
    imageUrl: 'https://ouqeoizufbofdqbuiwvx.supabase.co/storage/v1/object/public/destinations//Orlando.jpeg',
    tourCategories: [
      { name: 'Disney World Tours', hasGuide: true },
      { name: 'Universal Studios Tours', hasGuide: true },
      { name: 'Theme Park Tours', hasGuide: true },
      { name: 'Family Adventure Tours', hasGuide: true },
      { name: 'Water Park Tours', hasGuide: true },
      { name: 'Nature Tours', hasGuide: true }
    ],
    seo: {
      title: 'Orlando Tours & Excursions - Top-Rated Activities & Adventures',
      description: 'Discover top-rated Orlando tours, excursions, and activities powered by AI. From Disney World to Universal Studios, find the perfect way to explore the theme park capital.',
      keywords: 'Orlando tours, Disney World tours, Universal Studios tours, things to do in Orlando',
      primaryKeyword: 'Orlando tours',
      secondaryKeywords: [
        'Orlando Disney World tours',
        'Orlando Universal Studios tours',
        'Orlando theme park tours',
        'Orlando family tours',
        'Orlando water park tours',
        'Things to do in Orlando'
      ]
    },
    whyVisit: [
      'Walt Disney World Resort - The most magical place on earth',
      'Universal Studios and Islands of Adventure',
      'World-class theme parks and attractions',
      'Family-friendly entertainment and activities',
      'Perfect weather for outdoor adventures',
      'Perfect blend of entertainment and family fun'
    ],
    bestTimeToVisit: {
      weather: 'Orlando enjoys a subtropical climate with hot, humid summers and mild winters. Average temperatures range from 60°F (16°C) in winter to 90°F (32°C) in summer.',
      bestMonths: 'January to April and September to December offer the best weather with mild temperatures, fewer crowds, and perfect conditions for theme parks.',
      peakSeason: 'June to August brings peak tourist season with hot weather, larger crowds, and higher prices.',
      offSeason: 'May and September to November offer lower prices and fewer crowds, though with occasional rain.'
    },
    gettingAround: 'Theme parks offer shuttle services. Renting a car provides flexibility, and ride-sharing services are widely available for local transportation.',
    highlights: [
      'Walt Disney World - Four theme parks and resorts',
      'Universal Studios - Movie-themed attractions',
      'SeaWorld - Marine life and entertainment',
      'Kennedy Space Center - Space exploration history',
      'Gatorland - Florida wildlife and nature',
      'International Drive - Entertainment and dining'
    ]
  },
  {
    id: 'san-francisco',
    name: 'San Francisco',
    fullName: 'San Francisco',
    country: 'USA',
    category: 'North America',
    briefDescription: 'Golden Gate City, tech innovation, and cultural diversity — San Francisco is California\'s most charming metropolis.',
    heroDescription: 'Welcome to San Francisco, where the iconic Golden Gate Bridge meets innovative tech culture and diverse neighborhoods create a unique urban tapestry. From the historic cable cars to the vibrant Mission District, from world-class dining to stunning bay views, this hilly city offers the perfect blend of history, innovation, and California charm. Let our AI-powered planner help you discover the best experiences this incredible destination has to offer.',
    imageUrl: 'https://ouqeoizufbofdqbuiwvx.supabase.co/storage/v1/object/public/destinations//San%20Francisco.jpeg',
    tourCategories: [
      { name: 'Golden Gate Bridge Tours', hasGuide: true },
      { name: 'Alcatraz Tours', hasGuide: true },
      { name: 'Cable Car Tours', hasGuide: true },
      { name: 'Food & Culture Tours', hasGuide: true },
      { name: 'Neighborhood Tours', hasGuide: true },
      { name: 'Bay Tours', hasGuide: true }
    ],
    seo: {
      title: 'San Francisco Tours & Excursions - Top-Rated Activities & Adventures',
      description: 'Discover top-rated San Francisco tours, excursions, and activities powered by AI. From Golden Gate Bridge to Alcatraz, find the perfect way to explore the Golden Gate City.',
      keywords: 'San Francisco tours, Golden Gate Bridge tours, Alcatraz tours, things to do in San Francisco',
      primaryKeyword: 'San Francisco tours',
      secondaryKeywords: [
        'San Francisco Golden Gate tours',
        'San Francisco Alcatraz tours',
        'San Francisco cable car tours',
        'San Francisco food tours',
        'San Francisco neighborhood tours',
        'Things to do in San Francisco'
      ]
    },
    whyVisit: [
      'Iconic Golden Gate Bridge and bay views',
      'Historic Alcatraz Island and prison tours',
      'Charming cable cars and historic transportation',
      'Diverse neighborhoods and authentic cuisine',
      'World-class museums and cultural institutions',
      'Perfect blend of history and innovation'
    ],
    bestTimeToVisit: {
      weather: 'San Francisco enjoys a Mediterranean climate with cool, foggy summers and mild winters. Average temperatures range from 50°F (10°C) in winter to 70°F (21°C) in summer.',
      bestMonths: 'September to November offers the best weather with warm temperatures, clear skies, and perfect conditions for sightseeing.',
      peakSeason: 'June to August brings peak tourist season with foggy weather, larger crowds, and higher prices.',
      offSeason: 'December to May offers lower prices and fewer crowds, though with cooler weather and occasional rain.'
    },
    gettingAround: 'Excellent public transportation with cable cars, buses, and BART. Walking is perfect for exploring neighborhoods, and ride-sharing services are widely available.',
    highlights: [
      'Golden Gate Bridge - Iconic symbol of San Francisco',
      'Alcatraz Island - Historic prison and tours',
      'Fisherman\'s Wharf - Historic waterfront district',
      'Chinatown - Largest Chinatown outside Asia',
      'Mission District - Vibrant culture and murals',
      'Pier 39 - Popular tourist destination'
    ]
  },
  {
    id: 'chicago',
    name: 'Chicago',
    fullName: 'Chicago',
    country: 'USA',
    category: 'North America',
    briefDescription: 'Windy City, architectural marvels, and Midwestern charm — Chicago is Illinois\' dynamic heart.',
    heroDescription: 'Welcome to Chicago, where stunning architecture meets Midwestern hospitality and Lake Michigan provides a beautiful backdrop. From the iconic skyline to world-class museums, from deep-dish pizza to vibrant neighborhoods, this dynamic city offers the perfect blend of urban sophistication and friendly charm. Let our AI-powered planner help you discover the best experiences this incredible destination has to offer.',
    imageUrl: 'https://ouqeoizufbofdqbuiwvx.supabase.co/storage/v1/object/public/destinations//Chicago.jpg',
    tourCategories: [
      { name: 'Architecture Tours', hasGuide: true },
      { name: 'Museum Tours', hasGuide: true },
      { name: 'Food & Pizza Tours', hasGuide: true },
      { name: 'Lake Michigan Tours', hasGuide: true },
      { name: 'Neighborhood Tours', hasGuide: true },
      { name: 'Cultural Tours', hasGuide: true }
    ],
    seo: {
      title: 'Chicago Tours & Excursions - Top-Rated Activities & Adventures',
      description: 'Discover top-rated Chicago tours, excursions, and activities powered by AI. From architecture tours to deep-dish pizza experiences, find the perfect way to explore the Windy City.',
      keywords: 'Chicago tours, architecture tours, deep-dish pizza tours, things to do in Chicago',
      primaryKeyword: 'Chicago tours',
      secondaryKeywords: [
        'Chicago architecture tours',
        'Chicago museum tours',
        'Chicago food tours',
        'Chicago lake tours',
        'Chicago neighborhood tours',
        'Things to do in Chicago'
      ]
    },
    whyVisit: [
      'Iconic skyline and architectural masterpieces',
      'World-class museums and cultural institutions',
      'Famous deep-dish pizza and diverse cuisine',
      'Beautiful Lake Michigan and waterfront',
      'Vibrant neighborhoods and friendly culture',
      'Perfect blend of urban sophistication and charm'
    ],
    bestTimeToVisit: {
      weather: 'Chicago enjoys four distinct seasons. Summers are warm (70-85°F/21-29°C), winters are cold (20-35°F/-6-2°C), and spring/fall offer pleasant temperatures.',
      bestMonths: 'May to June and September to October offer the best weather with mild temperatures, fewer crowds, and perfect conditions for sightseeing.',
      peakSeason: 'June to August brings peak tourist season with warm weather, larger crowds, and higher prices.',
      offSeason: 'November to April offers lower prices and fewer crowds, though with cold weather and occasional snow.'
    },
    gettingAround: 'Excellent public transportation with L trains, buses, and Metra. Walking is perfect for exploring downtown, and ride-sharing services are widely available.',
    highlights: [
      'Millennium Park - Cloud Gate and outdoor art',
      'Art Institute of Chicago - World-class art collection',
      'Navy Pier - Lakefront entertainment',
      'Magnificent Mile - Shopping and architecture',
      'Wrigley Field - Historic baseball stadium',
      'Chicago River - Architectural boat tours'
    ]
  },
  {
    id: 'honolulu',
    name: 'Honolulu',
    fullName: 'Honolulu',
    country: 'USA',
    category: 'North America',
    briefDescription: 'Aloha spirit, tropical paradise, and island culture — Honolulu is Hawaii\'s vibrant capital.',
    heroDescription: 'Welcome to Honolulu, where the aloha spirit meets urban sophistication and pristine beaches provide the perfect backdrop for island adventures. From the historic Pearl Harbor to the iconic Waikiki Beach, from Hawaiian culture to world-class dining, this tropical paradise offers the perfect blend of island charm and modern amenities. Let our AI-powered planner help you discover the best experiences this incredible destination has to offer.',
    imageUrl: 'https://ouqeoizufbofdqbuiwvx.supabase.co/storage/v1/object/public/destinations//Honolulu.jpeg',
    tourCategories: [
      { name: 'Pearl Harbor Tours', hasGuide: true },
      { name: 'Waikiki Beach Tours', hasGuide: true },
      { name: 'Hawaiian Culture Tours', hasGuide: true },
      { name: 'Beach & Water Sports', hasGuide: true },
      { name: 'Food & Luau Tours', hasGuide: true },
      { name: 'Island Tours', hasGuide: true }
    ],
    seo: {
      title: 'Honolulu Tours & Excursions - Top-Rated Activities & Adventures',
      description: 'Discover top-rated Honolulu tours, excursions, and activities powered by AI. From Pearl Harbor to Waikiki Beach, find the perfect way to explore Hawaii\'s capital.',
      keywords: 'Honolulu tours, Pearl Harbor tours, Waikiki Beach tours, things to do in Honolulu',
      primaryKeyword: 'Honolulu tours',
      secondaryKeywords: [
        'Honolulu Pearl Harbor tours',
        'Honolulu Waikiki tours',
        'Honolulu culture tours',
        'Honolulu beach tours',
        'Honolulu food tours',
        'Things to do in Honolulu'
      ]
    },
    whyVisit: [
      'Historic Pearl Harbor and USS Arizona Memorial',
      'Iconic Waikiki Beach and water sports',
      'Rich Hawaiian culture and traditions',
      'World-class beaches and outdoor activities',
      'Perfect tropical weather year-round',
      'Perfect blend of history and island paradise'
    ],
    bestTimeToVisit: {
      weather: 'Honolulu enjoys a tropical climate with warm temperatures year-round. Average temperatures range from 70°F (21°C) in winter to 85°F (29°C) in summer.',
      bestMonths: 'April to June and September to November offer the best weather with mild temperatures, fewer crowds, and perfect conditions for all activities.',
      peakSeason: 'December to March brings peak tourist season with ideal weather, larger crowds, and higher prices.',
      offSeason: 'May to September offers lower prices and fewer crowds, though with warmer temperatures.'
    },
    gettingAround: 'Public transportation includes TheBus system. Renting a car provides flexibility for island exploration, and ride-sharing services are available.',
    highlights: [
      'Pearl Harbor - Historic naval base and memorial',
      'Waikiki Beach - Iconic Hawaiian beach',
      'Diamond Head - Famous volcanic crater',
      'Hanauma Bay - Marine life preserve',
      'Polynesian Cultural Center - Hawaiian culture',
      'North Shore - Famous surfing beaches'
    ]
  },
  {
    id: 'washington-dc',
    name: 'Washington, D.C.',
    fullName: 'Washington, D.C.',
    country: 'USA',
    category: 'North America',
    briefDescription: 'Nation\'s capital, historic monuments, and political power — Washington, D.C. is America\'s most important city.',
    heroDescription: 'Welcome to Washington, D.C., where the power of democracy meets architectural grandeur and American history comes alive. From the iconic National Mall to world-class museums, from historic monuments to vibrant neighborhoods, this capital city offers the perfect blend of political significance, cultural richness, and national pride. Let our AI-powered planner help you discover the best experiences this incredible destination has to offer.',
    imageUrl: 'https://ouqeoizufbofdqbuiwvx.supabase.co/storage/v1/object/public/destinations//Washington,%20D.C..jpeg',
    tourCategories: [
      { name: 'National Mall Tours', hasGuide: true },
      { name: 'Museum Tours', hasGuide: true },
      { name: 'Monument Tours', hasGuide: true },
      { name: 'Capitol Hill Tours', hasGuide: true },
      { name: 'Food & Culture Tours', hasGuide: true },
      { name: 'Historical Tours', hasGuide: true }
    ],
    seo: {
      title: 'Washington, D.C. Tours & Excursions - Top-Rated Activities & Adventures',
      description: 'Discover top-rated Washington, D.C. tours, excursions, and activities powered by AI. From National Mall to Capitol Hill, find the perfect way to explore the nation\'s capital.',
      keywords: 'Washington DC tours, National Mall tours, Capitol tours, things to do in Washington DC',
      primaryKeyword: 'Washington, D.C. tours',
      secondaryKeywords: [
        'Washington DC National Mall tours',
        'Washington DC museum tours',
        'Washington DC monument tours',
        'Washington DC Capitol tours',
        'Washington DC food tours',
        'Things to do in Washington DC'
      ]
    },
    whyVisit: [
      'Iconic National Mall and historic monuments',
      'World-class Smithsonian museums',
      'Capitol Hill and political significance',
      'Rich American history and culture',
      'Beautiful architecture and memorials',
      'Perfect blend of politics and culture'
    ],
    bestTimeToVisit: {
      weather: 'Washington, D.C. enjoys four distinct seasons. Summers are hot and humid (75-90°F/24-32°C), winters are cold (30-45°F/-1-7°C), and spring/fall offer pleasant temperatures.',
      bestMonths: 'March to May and September to November offer the best weather with mild temperatures, beautiful cherry blossoms in spring, and perfect conditions for sightseeing.',
      peakSeason: 'June to August brings peak tourist season with hot, humid weather, larger crowds, and higher prices.',
      offSeason: 'December to February offers lower prices and fewer crowds, though with cold weather and occasional snow.'
    },
    gettingAround: 'Excellent public transportation with Metro rail and buses. Walking is perfect for exploring the National Mall, and ride-sharing services are widely available.',
    highlights: [
      'National Mall - Iconic monuments and memorials',
      'Smithsonian Museums - World-class free museums',
      'Capitol Building - Seat of American democracy',
      'White House - Presidential residence',
      'Lincoln Memorial - Historic monument',
      'Georgetown - Historic neighborhood and shopping'
    ]
  },
  {
    id: 'nashville',
    name: 'Nashville',
    fullName: 'Nashville',
    country: 'USA',
    category: 'North America',
    briefDescription: 'Music City, country charm, and Southern hospitality — Nashville is Tennessee\'s vibrant heart.',
    heroDescription: 'Welcome to Nashville, where country music fills the air and Southern charm meets modern sophistication. From the iconic Grand Ole Opry to the vibrant Broadway district, from authentic hot chicken to historic plantations, this Music City offers the perfect blend of musical heritage, cultural richness, and warm hospitality. Let our AI-powered planner help you discover the best experiences this incredible destination has to offer.',
    imageUrl: 'https://ouqeoizufbofdqbuiwvx.supabase.co/storage/v1/object/public/destinations//Nashville.jpg',
    tourCategories: [
      { name: 'Country Music Tours', hasGuide: true },
      { name: 'Broadway Tours', hasGuide: true },
      { name: 'Food & Hot Chicken Tours', hasGuide: true },
      { name: 'Historical Tours', hasGuide: true },
      { name: 'Music Venue Tours', hasGuide: true },
      { name: 'Cultural Tours', hasGuide: true }
    ],
    seo: {
      title: 'Nashville Tours & Excursions - Top-Rated Activities & Adventures',
      description: 'Discover top-rated Nashville tours, excursions, and activities powered by AI. From country music tours to hot chicken experiences, find the perfect way to explore Music City.',
      keywords: 'Nashville tours, country music tours, Broadway tours, things to do in Nashville',
      primaryKeyword: 'Nashville tours',
      secondaryKeywords: [
        'Nashville country music tours',
        'Nashville Broadway tours',
        'Nashville food tours',
        'Nashville historical tours',
        'Nashville music venue tours',
        'Things to do in Nashville'
      ]
    },
    whyVisit: [
      'Grand Ole Opry and country music heritage',
      'Vibrant Broadway district and live music',
      'Famous hot chicken and Southern cuisine',
      'Rich musical history and culture',
      'Warm Southern hospitality',
      'Perfect blend of music and culture'
    ],
    bestTimeToVisit: {
      weather: 'Nashville enjoys four distinct seasons. Summers are hot and humid (75-90°F/24-32°C), winters are mild (35-50°F/2-10°C), and spring/fall offer pleasant temperatures.',
      bestMonths: 'March to May and September to November offer the best weather with mild temperatures, fewer crowds, and perfect conditions for sightseeing.',
      peakSeason: 'June to August brings peak tourist season with hot, humid weather, larger crowds, and higher prices.',
      offSeason: 'December to February offers lower prices and fewer crowds, though with cooler weather.'
    },
    gettingAround: 'Public transportation includes buses and the Music City Star train. Renting a car provides flexibility, and ride-sharing services are widely available.',
    highlights: [
      'Grand Ole Opry - Country music institution',
      'Broadway - Live music and entertainment',
      'Country Music Hall of Fame - Musical heritage',
      'Ryman Auditorium - Historic music venue',
      'The Parthenon - Full-scale replica',
      'Belle Meade Plantation - Historic estate'
    ]
  },
  {
    id: 'new-orleans',
    name: 'New Orleans',
    fullName: 'New Orleans',
    country: 'USA',
    category: 'North America',
    briefDescription: 'Big Easy charm, jazz heritage, and Creole culture — New Orleans is Louisiana\'s soulful heart.',
    heroDescription: 'Welcome to New Orleans, where jazz rhythms echo through historic streets and Creole culture infuses every aspect of life. From the iconic French Quarter to the vibrant music scene, from world-famous cuisine to Mardi Gras celebrations, this soulful city offers the perfect blend of history, culture, and Southern charm. Let our AI-powered planner help you discover the best experiences this incredible destination has to offer.',
    imageUrl: 'https://ouqeoizufbofdqbuiwvx.supabase.co/storage/v1/object/public/destinations//New%20Orleans.webp',
    tourCategories: [
      { name: 'French Quarter Tours', hasGuide: true },
      { name: 'Jazz Tours', hasGuide: true },
      { name: 'Food & Creole Tours', hasGuide: true },
      { name: 'Historical Tours', hasGuide: true },
      { name: 'Swamp Tours', hasGuide: true },
      { name: 'Cultural Tours', hasGuide: true }
    ],
    seo: {
      title: 'New Orleans Tours & Excursions - Top-Rated Activities & Adventures',
      description: 'Discover top-rated New Orleans tours, excursions, and activities powered by AI. From French Quarter to jazz experiences, find the perfect way to explore the Big Easy.',
      keywords: 'New Orleans tours, French Quarter tours, jazz tours, things to do in New Orleans',
      primaryKeyword: 'New Orleans tours',
      secondaryKeywords: [
        'New Orleans French Quarter tours',
        'New Orleans jazz tours',
        'New Orleans food tours',
        'New Orleans historical tours',
        'New Orleans swamp tours',
        'Things to do in New Orleans'
      ]
    },
    whyVisit: [
      'Iconic French Quarter and historic architecture',
      'World-famous jazz music and culture',
      'Authentic Creole and Cajun cuisine',
      'Rich history and cultural heritage',
      'Mardi Gras celebrations and festivals',
      'Perfect blend of music and culture'
    ],
    bestTimeToVisit: {
      weather: 'New Orleans enjoys a subtropical climate with hot, humid summers and mild winters. Average temperatures range from 50°F (10°C) in winter to 90°F (32°C) in summer.',
      bestMonths: 'February to May and October to December offer the best weather with mild temperatures, fewer crowds, and perfect conditions for sightseeing.',
      peakSeason: 'June to August brings peak tourist season with hot, humid weather, larger crowds, and higher prices.',
      offSeason: 'January and September offer lower prices and fewer crowds, though with occasional hurricanes.'
    },
    gettingAround: 'Public transportation includes streetcars and buses. Walking is perfect for exploring the French Quarter, and ride-sharing services are widely available.',
    highlights: [
      'French Quarter - Historic heart of the city',
      'Bourbon Street - Famous entertainment district',
      'Jackson Square - Historic plaza and artists',
      'Garden District - Beautiful mansions and architecture',
      'Preservation Hall - Legendary jazz venue',
      'Café du Monde - Famous beignets and coffee'
    ]
  },
  {
    id: 'denver',
    name: 'Denver',
    fullName: 'Denver',
    country: 'USA',
    category: 'North America',
    briefDescription: 'Mile High City, outdoor adventures, and Rocky Mountain charm — Denver is Colorado\'s dynamic capital.',
    heroDescription: 'Welcome to Denver, where the Rocky Mountains meet urban sophistication and outdoor adventures await just minutes from the city center. From the vibrant downtown to world-class museums, from craft breweries to mountain excursions, this Mile High City offers the perfect blend of urban amenities and natural beauty. Let our AI-powered planner help you discover the best experiences this incredible destination has to offer.',
    imageUrl: 'https://ouqeoizufbofdqbuiwvx.supabase.co/storage/v1/object/public/destinations//Denver.jpeg',
    tourCategories: [
      { name: 'Rocky Mountain Tours', hasGuide: true },
      { name: 'Brewery Tours', hasGuide: true },
      { name: 'Museum Tours', hasGuide: true },
      { name: 'Outdoor Adventure Tours', hasGuide: true },
      { name: 'Food & Culture Tours', hasGuide: true },
      { name: 'Historical Tours', hasGuide: true }
    ],
    seo: {
      title: 'Denver Tours & Excursions - Top-Rated Activities & Adventures',
      description: 'Discover top-rated Denver tours, excursions, and activities powered by AI. From Rocky Mountain tours to brewery experiences, find the perfect way to explore the Mile High City.',
      keywords: 'Denver tours, Rocky Mountain tours, brewery tours, things to do in Denver',
      primaryKeyword: 'Denver tours',
      secondaryKeywords: [
        'Denver Rocky Mountain tours',
        'Denver brewery tours',
        'Denver museum tours',
        'Denver outdoor tours',
        'Denver food tours',
        'Things to do in Denver'
      ]
    },
    whyVisit: [
      'Proximity to Rocky Mountains and outdoor adventures',
      'World-class craft breweries and beer culture',
      'Excellent museums and cultural institutions',
      'Beautiful mountain scenery and hiking',
      'Vibrant downtown and friendly culture',
      'Perfect blend of urban and outdoor life'
    ],
    bestTimeToVisit: {
      weather: 'Denver enjoys a semi-arid climate with four distinct seasons. Summers are warm (70-85°F/21-29°C), winters are cold (20-40°F/-6-4°C), and spring/fall offer pleasant temperatures.',
      bestMonths: 'May to June and September to October offer the best weather with mild temperatures, fewer crowds, and perfect conditions for outdoor activities.',
      peakSeason: 'June to August brings peak tourist season with warm weather, larger crowds, and higher prices.',
      offSeason: 'November to April offers lower prices and fewer crowds, though with cold weather and occasional snow.'
    },
    gettingAround: 'Public transportation includes light rail and buses. Renting a car provides flexibility for mountain excursions, and ride-sharing services are widely available.',
    highlights: [
      'Rocky Mountain National Park - Stunning mountain scenery',
      'Red Rocks Amphitheatre - Iconic outdoor venue',
      'Denver Art Museum - World-class art collection',
      'Union Station - Historic transportation hub',
      'Craft Breweries - Famous beer culture',
      'Mount Evans - Highest paved road in North America'
    ]
  },
  {
    id: 'sedona',
    name: 'Sedona',
    fullName: 'Sedona',
    country: 'USA',
    category: 'North America',
    briefDescription: 'Red rock paradise, spiritual energy, and natural beauty — Sedona is Arizona\'s mystical gem.',
    heroDescription: 'Welcome to Sedona, where stunning red rock formations create a spiritual sanctuary and outdoor adventures abound in every direction. From the iconic Cathedral Rock to ancient Native American sites, from world-class hiking to spiritual retreats, this mystical destination offers the perfect blend of natural wonder, cultural heritage, and spiritual energy. Let our AI-powered planner help you discover the best experiences this incredible destination has to offer.',
    imageUrl: 'https://ouqeoizufbofdqbuiwvx.supabase.co/storage/v1/object/public/destinations//Sedona.jpg',
    tourCategories: [
      { name: 'Red Rock Tours', hasGuide: true },
      { name: 'Spiritual Tours', hasGuide: true },
      { name: 'Hiking & Adventure Tours', hasGuide: true },
      { name: 'Native American Tours', hasGuide: true },
      { name: 'Photography Tours', hasGuide: true },
      { name: 'Nature Tours', hasGuide: true }
    ],
    seo: {
      title: 'Sedona Tours & Excursions - Top-Rated Activities & Adventures',
      description: 'Discover top-rated Sedona tours, excursions, and activities powered by AI. From red rock tours to spiritual experiences, find the perfect way to explore Arizona\'s mystical gem.',
      keywords: 'Sedona tours, red rock tours, spiritual tours, things to do in Sedona',
      primaryKeyword: 'Sedona tours',
      secondaryKeywords: [
        'Sedona red rock tours',
        'Sedona spiritual tours',
        'Sedona hiking tours',
        'Sedona Native American tours',
        'Sedona photography tours',
        'Things to do in Sedona'
      ]
    },
    whyVisit: [
      'Iconic red rock formations and stunning scenery',
      'Spiritual energy and vortex sites',
      'World-class hiking and outdoor activities',
      'Native American heritage and culture',
      'Beautiful desert landscapes and wildlife',
      'Perfect blend of nature and spirituality'
    ],
    bestTimeToVisit: {
      weather: 'Sedona enjoys a high desert climate with hot summers and mild winters. Summers are hot (80-100°F/27-38°C), winters are mild (40-65°F/4-18°C), and spring/fall offer pleasant temperatures.',
      bestMonths: 'March to May and September to November offer the best weather with mild temperatures, fewer crowds, and perfect conditions for outdoor activities.',
      peakSeason: 'June to August brings peak tourist season with hot weather, larger crowds, and higher prices.',
      offSeason: 'December to February offers lower prices and fewer crowds, though with cooler weather.'
    },
    gettingAround: 'Renting a car is recommended for exploring the area. Organized tours provide access to remote areas, and shuttle services are available for popular destinations.',
    highlights: [
      'Cathedral Rock - Iconic red rock formation',
      'Bell Rock - Famous vortex site',
      'Oak Creek Canyon - Beautiful scenic drive',
      'Montezuma Castle - Ancient Native American site',
      'Chapel of the Holy Cross - Architectural marvel',
      'Red Rock State Park - Protected natural area'
    ]
  },
  {
    id: 'toronto',
    name: 'Toronto',
    fullName: 'Toronto',
    country: 'Canada',
    category: 'North America',
    briefDescription: 'Canada\'s largest city, cultural diversity, and urban sophistication — Toronto is Ontario\'s dynamic heart.',
    heroDescription: 'Welcome to Toronto, where the iconic CN Tower meets diverse neighborhoods and Lake Ontario provides a stunning backdrop. From the vibrant downtown to world-class museums, from multicultural cuisine to the beautiful Toronto Islands, this cosmopolitan city offers the perfect blend of urban excitement, cultural richness, and Canadian charm. Let our AI-powered planner help you discover the best experiences this incredible destination has to offer.',
    imageUrl: 'https://ouqeoizufbofdqbuiwvx.supabase.co/storage/v1/object/public/destinations//Toronto.jpeg',
    tourCategories: [
      { name: 'CN Tower Tours', hasGuide: true },
      { name: 'Museum Tours', hasGuide: true },
      { name: 'Food & Culture Tours', hasGuide: true },
      { name: 'Neighborhood Tours', hasGuide: true },
      { name: 'Lake Ontario Tours', hasGuide: true },
      { name: 'Architecture Tours', hasGuide: true }
    ],
    seo: {
      title: 'Toronto Tours & Excursions - Top-Rated Activities & Adventures',
      description: 'Discover top-rated Toronto tours, excursions, and activities powered by AI. From CN Tower to multicultural experiences, find the perfect way to explore Canada\'s largest city.',
      keywords: 'Toronto tours, CN Tower tours, multicultural tours, things to do in Toronto',
      primaryKeyword: 'Toronto tours',
      secondaryKeywords: [
        'Toronto CN Tower tours',
        'Toronto museum tours',
        'Toronto food tours',
        'Toronto neighborhood tours',
        'Toronto lake tours',
        'Things to do in Toronto'
      ]
    },
    whyVisit: [
      'Iconic CN Tower and stunning skyline views',
      'World-class museums and cultural institutions',
      'Multicultural neighborhoods and authentic cuisine',
      'Beautiful Lake Ontario and Toronto Islands',
      'Vibrant arts scene and entertainment',
      'Perfect blend of urban sophistication and diversity'
    ],
    bestTimeToVisit: {
      weather: 'Toronto enjoys four distinct seasons. Summers are warm (70-85°F/21-29°C), winters are cold (20-35°F/-6-2°C), and spring/fall offer pleasant temperatures.',
      bestMonths: 'May to June and September to October offer the best weather with mild temperatures, fewer crowds, and perfect conditions for sightseeing.',
      peakSeason: 'June to August brings peak tourist season with warm weather, larger crowds, and higher prices.',
      offSeason: 'November to April offers lower prices and fewer crowds, though with cold weather and occasional snow.'
    },
    gettingAround: 'Excellent public transportation with subway, streetcars, and buses. Walking is perfect for exploring downtown, and ride-sharing services are widely available.',
    highlights: [
      'CN Tower - Iconic symbol of Toronto',
      'Royal Ontario Museum - World-class collections',
      'Toronto Islands - Beautiful island escape',
      'Distillery District - Historic entertainment area',
      'Kensington Market - Vibrant multicultural neighborhood',
      'Ripley\'s Aquarium - Marine life and exhibits'
    ]
  },
  {
    id: 'vancouver',
    name: 'Vancouver',
    fullName: 'Vancouver',
    country: 'Canada',
    category: 'North America',
    briefDescription: 'Pacific paradise, outdoor adventures, and urban sophistication — Vancouver is British Columbia\'s coastal gem.',
    heroDescription: 'Welcome to Vancouver, where the Pacific Ocean meets the Coast Mountains and urban sophistication blends seamlessly with natural beauty. From the iconic Stanley Park to the vibrant Granville Island, from world-class dining to outdoor adventures, this coastal city offers the perfect blend of metropolitan amenities and outdoor lifestyle. Let our AI-powered planner help you discover the best experiences this incredible destination has to offer.',
    imageUrl: 'https://ouqeoizufbofdqbuiwvx.supabase.co/storage/v1/object/public/destinations//Vancouver.webp',
    tourCategories: [
      { name: 'Stanley Park Tours', hasGuide: true },
      { name: 'Granville Island Tours', hasGuide: true },
      { name: 'Outdoor Adventure Tours', hasGuide: true },
      { name: 'Food & Culture Tours', hasGuide: true },
      { name: 'Harbor Tours', hasGuide: true },
      { name: 'Mountain Tours', hasGuide: true }
    ],
    seo: {
      title: 'Vancouver Tours & Excursions - Top-Rated Activities & Adventures',
      description: 'Discover top-rated Vancouver tours, excursions, and activities powered by AI. From Stanley Park to outdoor adventures, find the perfect way to explore Canada\'s Pacific paradise.',
      keywords: 'Vancouver tours, Stanley Park tours, outdoor tours, things to do in Vancouver',
      primaryKeyword: 'Vancouver tours',
      secondaryKeywords: [
        'Vancouver Stanley Park tours',
        'Vancouver Granville Island tours',
        'Vancouver outdoor tours',
        'Vancouver food tours',
        'Vancouver harbor tours',
        'Things to do in Vancouver'
      ]
    },
    whyVisit: [
      'Iconic Stanley Park and seawall cycling',
      'Beautiful Granville Island and public market',
      'World-class outdoor activities and adventures',
      'Diverse cuisine and cultural experiences',
      'Stunning mountain and ocean views',
      'Perfect blend of urban and outdoor life'
    ],
    bestTimeToVisit: {
      weather: 'Vancouver enjoys a temperate climate with mild, wet winters and warm, dry summers. Average temperatures range from 40°F (4°C) in winter to 75°F (24°C) in summer.',
      bestMonths: 'June to September offers the best weather with warm temperatures, minimal rainfall, and perfect conditions for outdoor activities.',
      peakSeason: 'June to August brings peak tourist season with ideal weather, larger crowds, and higher prices.',
      offSeason: 'October to May offers lower prices and fewer crowds, though with more rainfall and cooler temperatures.'
    },
    gettingAround: 'Excellent public transportation with SkyTrain, buses, and SeaBus. Walking and cycling are perfect for exploring, and ride-sharing services are widely available.',
    highlights: [
      'Stanley Park - Iconic urban park and seawall',
      'Granville Island - Public market and arts',
      'Capilano Suspension Bridge - Thrilling attraction',
      'Grouse Mountain - Outdoor recreation',
      'Vancouver Aquarium - Marine life exhibits',
      'English Bay Beach - Beautiful waterfront'
    ]
  },
  {
    id: 'montreal',
    name: 'Montreal',
    fullName: 'Montreal',
    country: 'Canada',
    category: 'North America',
    briefDescription: 'French Canadian charm, cultural festivals, and historic architecture — Montreal is Quebec\'s vibrant heart.',
    heroDescription: 'Welcome to Montreal, where French sophistication meets North American energy and historic charm blends with modern innovation. From the iconic Notre-Dame Basilica to the vibrant Plateau neighborhood, from world-class festivals to authentic French cuisine, this bilingual city offers the perfect blend of European elegance and Canadian warmth. Let our AI-powered planner help you discover the best experiences this incredible destination has to offer.',
    imageUrl: 'https://ouqeoizufbofdqbuiwvx.supabase.co/storage/v1/object/public/destinations//Montreal.jpg',
    tourCategories: [
      { name: 'Old Montreal Tours', hasGuide: true },
      { name: 'Food & Culture Tours', hasGuide: true },
      { name: 'Festival Tours', hasGuide: true },
      { name: 'Historical Tours', hasGuide: true },
      { name: 'Neighborhood Tours', hasGuide: true },
      { name: 'Architecture Tours', hasGuide: true }
    ],
    seo: {
      title: 'Montreal Tours & Excursions - Top-Rated Activities & Adventures',
      description: 'Discover top-rated Montreal tours, excursions, and activities powered by AI. From Old Montreal to cultural experiences, find the perfect way to explore Quebec\'s vibrant heart.',
      keywords: 'Montreal tours, Old Montreal tours, French Canadian tours, things to do in Montreal',
      primaryKeyword: 'Montreal tours',
      secondaryKeywords: [
        'Montreal Old Montreal tours',
        'Montreal food tours',
        'Montreal festival tours',
        'Montreal historical tours',
        'Montreal neighborhood tours',
        'Things to do in Montreal'
      ]
    },
    whyVisit: [
      'Historic Old Montreal with European charm',
      'World-famous festivals and cultural events',
      'Authentic French Canadian cuisine',
      'Beautiful architecture and historic sites',
      'Vibrant arts scene and entertainment',
      'Perfect blend of French and Canadian culture'
    ],
    bestTimeToVisit: {
      weather: 'Montreal enjoys four distinct seasons. Summers are warm (70-85°F/21-29°C), winters are cold (10-30°F/-12-1°C), and spring/fall offer pleasant temperatures.',
      bestMonths: 'May to June and September to October offer the best weather with mild temperatures, fewer crowds, and perfect conditions for sightseeing.',
      peakSeason: 'June to August brings peak tourist season with warm weather, larger crowds, and higher prices.',
      offSeason: 'November to April offers lower prices and fewer crowds, though with cold weather and snow.'
    },
    gettingAround: 'Excellent public transportation with Metro, buses, and commuter trains. Walking is perfect for exploring Old Montreal, and ride-sharing services are widely available.',
    highlights: [
      'Notre-Dame Basilica - Stunning Gothic cathedral',
      'Old Montreal - Historic heart of the city',
      'Mount Royal - Beautiful park and viewpoints',
      'Plateau Mont-Royal - Vibrant neighborhood',
      'Jean-Talon Market - Famous food market',
      'Underground City - Unique shopping network'
    ]
  },
  {
    id: 'banff',
    name: 'Banff',
    fullName: 'Banff',
    country: 'Canada',
    category: 'North America',
    briefDescription: 'Mountain paradise, pristine wilderness, and outdoor adventures — Banff is Alberta\'s natural wonder.',
    heroDescription: 'Welcome to Banff, where the majestic Canadian Rockies create a stunning backdrop for unforgettable outdoor adventures. From the iconic Lake Louise to the charming town center, from world-class hiking to wildlife encounters, this mountain paradise offers the perfect blend of natural beauty, outdoor recreation, and Canadian hospitality. Let our AI-powered planner help you discover the best experiences this incredible destination has to offer.',
    imageUrl: 'https://ouqeoizufbofdqbuiwvx.supabase.co/storage/v1/object/public/destinations//Banff.jpeg',
    tourCategories: [
      { name: 'Lake Louise Tours', hasGuide: true },
      { name: 'Hiking & Adventure Tours', hasGuide: true },
      { name: 'Wildlife Tours', hasGuide: true },
      { name: 'Mountain Tours', hasGuide: true },
      { name: 'Photography Tours', hasGuide: true },
      { name: 'Nature Tours', hasGuide: true }
    ],
    seo: {
      title: 'Banff Tours & Excursions - Top-Rated Activities & Adventures',
      description: 'Discover top-rated Banff tours, excursions, and activities powered by AI. From Lake Louise to mountain adventures, find the perfect way to explore Alberta\'s mountain paradise.',
      keywords: 'Banff tours, Lake Louise tours, mountain tours, things to do in Banff',
      primaryKeyword: 'Banff tours',
      secondaryKeywords: [
        'Banff Lake Louise tours',
        'Banff hiking tours',
        'Banff wildlife tours',
        'Banff mountain tours',
        'Banff photography tours',
        'Things to do in Banff'
      ]
    },
    whyVisit: [
      'Iconic Lake Louise and stunning mountain scenery',
      'World-class hiking and outdoor activities',
      'Abundant wildlife and nature encounters',
      'Beautiful Banff National Park landscapes',
      'Charming mountain town atmosphere',
      'Perfect blend of adventure and natural beauty'
    ],
    bestTimeToVisit: {
      weather: 'Banff enjoys a mountain climate with cool summers and cold winters. Summers are mild (50-75°F/10-24°C), winters are cold (10-30°F/-12-1°C), and the weather can be unpredictable year-round.',
      bestMonths: 'June to September offers the best weather with mild temperatures, clear trails, and perfect conditions for outdoor activities.',
      peakSeason: 'July to August brings peak tourist season with ideal weather, larger crowds, and higher prices.',
      offSeason: 'October to May offers lower prices and fewer crowds, though with cold weather and snow.'
    },
    gettingAround: 'Renting a car is recommended for exploring the area. Organized tours provide access to remote areas, and shuttle services are available for popular destinations.',
    highlights: [
      'Lake Louise - Iconic turquoise lake',
      'Moraine Lake - Stunning mountain lake',
      'Banff Gondola - Mountain views and hiking',
      'Johnston Canyon - Beautiful hiking trails',
      'Banff Town - Charming mountain community',
      'Icefields Parkway - Scenic mountain drive'
    ]
  },
  {
    id: 'quebec-city',
    name: 'Quebec City',
    fullName: 'Quebec City',
    country: 'Canada',
    category: 'North America',
    briefDescription: 'European charm, historic fortifications, and French heritage — Quebec City is Canada\'s most romantic destination.',
    heroDescription: 'Welcome to Quebec City, where cobblestone streets and historic fortifications transport you to old Europe in the heart of North America. From the iconic Château Frontenac to the charming Old Quebec, from authentic French cuisine to rich cultural heritage, this UNESCO World Heritage site offers the perfect blend of European elegance and Canadian warmth. Let our AI-powered planner help you discover the best experiences this incredible destination has to offer.',
    imageUrl: 'https://ouqeoizufbofdqbuiwvx.supabase.co/storage/v1/object/public/destinations//Quebec%20City.webp',
    tourCategories: [
      { name: 'Old Quebec Tours', hasGuide: true },
      { name: 'Château Frontenac Tours', hasGuide: true },
      { name: 'Historical Tours', hasGuide: true },
      { name: 'Food & Culture Tours', hasGuide: true },
      { name: 'Fortification Tours', hasGuide: true },
      { name: 'Architecture Tours', hasGuide: true }
    ],
    seo: {
      title: 'Quebec City Tours & Excursions - Top-Rated Activities & Adventures',
      description: 'Discover top-rated Quebec City tours, excursions, and activities powered by AI. From Old Quebec to historic experiences, find the perfect way to explore Canada\'s most romantic city.',
      keywords: 'Quebec City tours, Old Quebec tours, Château Frontenac tours, things to do in Quebec City',
      primaryKeyword: 'Quebec City tours',
      secondaryKeywords: [
        'Quebec City Old Quebec tours',
        'Quebec City Château Frontenac tours',
        'Quebec City historical tours',
        'Quebec City food tours',
        'Quebec City fortification tours',
        'Things to do in Quebec City'
      ]
    },
    whyVisit: [
      'UNESCO World Heritage site of Old Quebec',
      'Iconic Château Frontenac and historic architecture',
      'Authentic French Canadian culture and cuisine',
      'Rich history and fortifications',
      'Charming European atmosphere',
      'Perfect blend of history and romance'
    ],
    bestTimeToVisit: {
      weather: 'Quebec City enjoys four distinct seasons. Summers are warm (65-80°F/18-27°C), winters are cold (10-30°F/-12-1°C), and spring/fall offer pleasant temperatures.',
      bestMonths: 'June to September offers the best weather with mild temperatures, fewer crowds, and perfect conditions for sightseeing.',
      peakSeason: 'July to August brings peak tourist season with warm weather, larger crowds, and higher prices.',
      offSeason: 'October to May offers lower prices and fewer crowds, though with cold weather and snow.'
    },
    gettingAround: 'Excellent public transportation with buses and funicular. Walking is perfect for exploring Old Quebec, and organized tours provide historical context.',
    highlights: [
      'Château Frontenac - Iconic castle hotel',
      'Old Quebec - Historic walled city',
      'Plains of Abraham - Historic battlefield',
      'Petit-Champlain - Charming historic district',
      'Notre-Dame de Québec - Historic cathedral',
      'Montmorency Falls - Stunning waterfall'
    ]
  },
  {
    id: 'cancun',
    name: 'Cancun',
    fullName: 'Cancun',
    country: 'Mexico',
    category: 'North America',
    briefDescription: 'Caribbean paradise, pristine beaches, and Mayan ruins — Cancun is Mexico\'s premier beach destination.',
    heroDescription: 'Welcome to Cancun, where the turquoise waters of the Caribbean meet ancient Mayan history and modern luxury. From the pristine beaches of the Hotel Zone to the mysterious ruins of Chichen Itza, from world-class diving to vibrant nightlife, this tropical paradise offers the perfect blend of relaxation, adventure, and cultural discovery. Let our AI-powered planner help you discover the best experiences this incredible destination has to offer.',
    imageUrl: 'https://ouqeoizufbofdqbuiwvx.supabase.co/storage/v1/object/public/destinations//Cancun.webp',
    tourCategories: [
      { name: 'Beach Tours', hasGuide: true },
      { name: 'Mayan Ruins Tours', hasGuide: true },
      { name: 'Water Sports', hasGuide: true },
      { name: 'Isla Mujeres Tours', hasGuide: true },
      { name: 'Snorkeling Tours', hasGuide: true },
      { name: 'Cultural Tours', hasGuide: true }
    ],
    seo: {
      title: 'Cancun Tours & Excursions - Top-Rated Activities & Adventures',
      description: 'Discover top-rated Cancun tours, excursions, and activities powered by AI. From beach tours to Mayan ruins, find the perfect way to explore Mexico\'s Caribbean paradise.',
      keywords: 'Cancun tours, Mayan ruins tours, beach tours, things to do in Cancun',
      primaryKeyword: 'Cancun tours',
      secondaryKeywords: [
        'Cancun beach tours',
        'Cancun Mayan ruins tours',
        'Cancun water sports',
        'Cancun Isla Mujeres tours',
        'Cancun snorkeling tours',
        'Things to do in Cancun'
      ]
    },
    whyVisit: [
      'Pristine Caribbean beaches with crystal-clear waters',
      'Ancient Mayan ruins including Chichen Itza',
      'World-class diving and snorkeling',
      'Vibrant nightlife and entertainment',
      'Perfect tropical weather year-round',
      'Perfect blend of beach relaxation and cultural exploration'
    ],
    bestTimeToVisit: {
      weather: 'Cancun enjoys a tropical climate with hot, humid summers and warm, dry winters. Average temperatures range from 75°F (24°C) in winter to 90°F (32°C) in summer.',
      bestMonths: 'December to April offers the best weather with warm temperatures, low humidity, and perfect conditions for all activities.',
      peakSeason: 'December to April brings peak tourist season with ideal weather, larger crowds, and higher prices.',
      offSeason: 'May to November offers lower prices and fewer crowds, though with hot, humid weather and hurricane season.'
    },
    gettingAround: 'Public buses connect the Hotel Zone and downtown. Renting a car provides flexibility for day trips, and organized tours include transportation.',
    highlights: [
      'Hotel Zone - Beautiful beaches and resorts',
      'Chichen Itza - Ancient Mayan wonder',
      'Isla Mujeres - Island paradise',
      'Tulum Ruins - Coastal Mayan site',
      'Xcaret Park - Eco-archaeological park',
      'Underwater Museum - Unique diving experience'
    ]
  },
  {
    id: 'tulum',
    name: 'Tulum',
    fullName: 'Tulum',
    country: 'Mexico',
    category: 'North America',
    briefDescription: 'Bohemian paradise, Mayan ruins, and pristine beaches — Tulum is Mexico\'s most stylish coastal destination.',
    heroDescription: 'Welcome to Tulum, where ancient Mayan ruins overlook pristine beaches and bohemian chic meets natural beauty. From the iconic cliff-top ruins to the crystal-clear cenotes, from eco-friendly resorts to authentic Mexican cuisine, this magical destination offers the perfect blend of history, culture, and laid-back luxury. Let our AI-powered planner help you discover the best experiences this incredible destination has to offer.',
    imageUrl: 'https://ouqeoizufbofdqbuiwvx.supabase.co/storage/v1/object/public/destinations//Tulum.jpg',
    tourCategories: [
      { name: 'Mayan Ruins Tours', hasGuide: true },
      { name: 'Cenote Tours', hasGuide: true },
      { name: 'Beach Tours', hasGuide: true },
      { name: 'Eco Tours', hasGuide: true },
      { name: 'Food & Culture Tours', hasGuide: true },
      { name: 'Adventure Tours', hasGuide: true }
    ],
    seo: {
      title: 'Tulum Tours & Excursions - Top-Rated Activities & Adventures',
      description: 'Discover top-rated Tulum tours, excursions, and activities powered by AI. From Mayan ruins to cenote experiences, find the perfect way to explore Mexico\'s bohemian paradise.',
      keywords: 'Tulum tours, Mayan ruins tours, cenote tours, things to do in Tulum',
      primaryKeyword: 'Tulum tours',
      secondaryKeywords: [
        'Tulum Mayan ruins tours',
        'Tulum cenote tours',
        'Tulum beach tours',
        'Tulum eco tours',
        'Tulum food tours',
        'Things to do in Tulum'
      ]
    },
    whyVisit: [
      'Iconic cliff-top Mayan ruins overlooking the sea',
      'Crystal-clear cenotes for swimming and diving',
      'Pristine beaches and bohemian atmosphere',
      'Eco-friendly resorts and sustainable tourism',
      'Authentic Mexican culture and cuisine',
      'Perfect blend of history and natural beauty'
    ],
    bestTimeToVisit: {
      weather: 'Tulum enjoys a tropical climate with hot, humid summers and warm, dry winters. Average temperatures range from 75°F (24°C) in winter to 90°F (32°C) in summer.',
      bestMonths: 'November to April offers the best weather with warm temperatures, low humidity, and perfect conditions for all activities.',
      peakSeason: 'December to April brings peak tourist season with ideal weather, larger crowds, and higher prices.',
      offSeason: 'May to October offers lower prices and fewer crowds, though with hot, humid weather and hurricane season.'
    },
    gettingAround: 'Walking and cycling are perfect for exploring the town. Renting a car provides flexibility for cenote visits, and organized tours include transportation.',
    highlights: [
      'Tulum Ruins - Cliff-top Mayan archaeological site',
      'Gran Cenote - Crystal-clear swimming hole',
      'Tulum Beach - Pristine white sand beaches',
      'Sian Ka\'an Biosphere - Protected natural area',
      'Coba Ruins - Ancient Mayan city',
      'Tulum Pueblo - Authentic Mexican town'
    ]
  },
  {
    id: 'playa-del-carmen',
    name: 'Playa del Carmen',
    fullName: 'Playa del Carmen',
    country: 'Mexico',
    category: 'North America',
    briefDescription: 'Vibrant beach town, cosmopolitan charm, and Caribbean beauty — Playa del Carmen is the Riviera Maya\'s heart.',
    heroDescription: 'Welcome to Playa del Carmen, where the famous Fifth Avenue meets pristine Caribbean beaches and international flair creates a vibrant atmosphere. From the bustling pedestrian street to the beautiful beaches, from world-class dining to exciting nightlife, this cosmopolitan beach town offers the perfect blend of Mexican charm and international sophistication. Let our AI-powered planner help you discover the best experiences this incredible destination has to offer.',
    imageUrl: 'https://ouqeoizufbofdqbuiwvx.supabase.co/storage/v1/object/public/destinations//Playa%20del%20Carmen.jpg',
    tourCategories: [
      { name: 'Fifth Avenue Tours', hasGuide: true },
      { name: 'Beach Tours', hasGuide: true },
      { name: 'Cenote Tours', hasGuide: true },
      { name: 'Food & Culture Tours', hasGuide: true },
      { name: 'Water Sports', hasGuide: true },
      { name: 'Adventure Tours', hasGuide: true }
    ],
    seo: {
      title: 'Playa del Carmen Tours & Excursions - Top-Rated Activities & Adventures',
      description: 'Discover top-rated Playa del Carmen tours, excursions, and activities powered by AI. From Fifth Avenue to beach experiences, find the perfect way to explore the Riviera Maya\'s heart.',
      keywords: 'Playa del Carmen tours, Fifth Avenue tours, beach tours, things to do in Playa del Carmen',
      primaryKeyword: 'Playa del Carmen tours',
      secondaryKeywords: [
        'Playa del Carmen Fifth Avenue tours',
        'Playa del Carmen beach tours',
        'Playa del Carmen cenote tours',
        'Playa del Carmen food tours',
        'Playa del Carmen water sports',
        'Things to do in Playa del Carmen'
      ]
    },
    whyVisit: [
      'Famous Fifth Avenue with shopping and dining',
      'Beautiful Caribbean beaches and water sports',
      'Crystal-clear cenotes for swimming',
      'International cuisine and vibrant nightlife',
      'Perfect location for exploring the Riviera Maya',
      'Perfect blend of beach life and urban excitement'
    ],
    bestTimeToVisit: {
      weather: 'Playa del Carmen enjoys a tropical climate with hot, humid summers and warm, dry winters. Average temperatures range from 75°F (24°C) in winter to 90°F (32°C) in summer.',
      bestMonths: 'November to April offers the best weather with warm temperatures, low humidity, and perfect conditions for all activities.',
      peakSeason: 'December to April brings peak tourist season with ideal weather, larger crowds, and higher prices.',
      offSeason: 'May to October offers lower prices and fewer crowds, though with hot, humid weather and hurricane season.'
    },
    gettingAround: 'Walking is perfect for exploring Fifth Avenue and the beach. Public transportation connects to nearby destinations, and organized tours include transportation.',
    highlights: [
      'Fifth Avenue - Famous pedestrian shopping street',
      'Playa del Carmen Beach - Beautiful Caribbean beach',
      'Cenotes - Natural swimming holes',
      'Cozumel Island - Easy ferry access',
      'Xcaret Park - Eco-archaeological park',
      'Tulum Ruins - Easy day trip destination'
    ]
  },
  {
    id: 'mexico-city',
    name: 'Mexico City',
    fullName: 'Mexico City',
    country: 'Mexico',
    category: 'North America',
    briefDescription: 'Cultural capital, historic treasures, and vibrant energy — Mexico City is Mexico\'s dynamic heart.',
    heroDescription: 'Welcome to Mexico City, where ancient Aztec ruins meet colonial architecture and modern innovation creates a vibrant metropolis. From the historic Zocalo to world-class museums, from authentic street food to sophisticated dining, this cultural capital offers the perfect blend of history, art, and contemporary Mexican life. Let our AI-powered planner help you discover the best experiences this incredible destination has to offer.',
    imageUrl: 'https://ouqeoizufbofdqbuiwvx.supabase.co/storage/v1/object/public/destinations//Mexico%20City.avif',
    tourCategories: [
      { name: 'Historic Center Tours', hasGuide: true },
      { name: 'Museum Tours', hasGuide: true },
      { name: 'Food & Street Food Tours', hasGuide: true },
      { name: 'Teotihuacan Tours', hasGuide: true },
      { name: 'Neighborhood Tours', hasGuide: true },
      { name: 'Cultural Tours', hasGuide: true }
    ],
    seo: {
      title: 'Mexico City Tours & Excursions - Top-Rated Activities & Adventures',
      description: 'Discover top-rated Mexico City tours, excursions, and activities powered by AI. From historic center to cultural experiences, find the perfect way to explore Mexico\'s dynamic capital.',
      keywords: 'Mexico City tours, historic center tours, Teotihuacan tours, things to do in Mexico City',
      primaryKeyword: 'Mexico City tours',
      secondaryKeywords: [
        'Mexico City historic center tours',
        'Mexico City museum tours',
        'Mexico City food tours',
        'Mexico City Teotihuacan tours',
        'Mexico City neighborhood tours',
        'Things to do in Mexico City'
      ]
    },
    whyVisit: [
      'Historic Zocalo and colonial architecture',
      'World-class museums including Frida Kahlo Museum',
      'Ancient Teotihuacan pyramids',
      'Authentic Mexican cuisine and street food',
      'Rich cultural heritage and vibrant arts scene',
      'Perfect blend of history and modern Mexican life'
    ],
    bestTimeToVisit: {
      weather: 'Mexico City enjoys a temperate highland climate with mild temperatures year-round. Average temperatures range from 55°F (13°C) in winter to 75°F (24°C) in summer.',
      bestMonths: 'March to May and September to November offer the best weather with mild temperatures, fewer crowds, and perfect conditions for sightseeing.',
      peakSeason: 'June to August brings peak tourist season with mild weather, larger crowds, and higher prices.',
      offSeason: 'December to February offers lower prices and fewer crowds, though with cooler weather.'
    },
    gettingAround: 'Excellent public transportation with Metro, Metrobus, and trolleybuses. Walking is perfect for exploring neighborhoods, and ride-sharing services are widely available.',
    highlights: [
      'Zocalo - Historic central square',
      'Teotihuacan - Ancient Aztec pyramids',
      'Frida Kahlo Museum - Casa Azul',
      'Chapultepec Castle - Historic palace',
      'Xochimilco - Floating gardens',
      'National Museum of Anthropology - World-class collections'
    ]
  },
  {
    id: 'cabo-san-lucas',
    name: 'Cabo San Lucas',
    fullName: 'Cabo San Lucas',
    country: 'Mexico',
    category: 'North America',
    briefDescription: 'Baja paradise, dramatic landscapes, and luxury resorts — Cabo San Lucas is Mexico\'s Pacific gem.',
    heroDescription: 'Welcome to Cabo San Lucas, where the Pacific Ocean meets the Sea of Cortez and dramatic rock formations create a stunning backdrop for luxury and adventure. From the iconic Arch of Cabo San Lucas to world-class sport fishing, from pristine beaches to vibrant nightlife, this Baja California paradise offers the perfect blend of natural beauty and sophisticated entertainment. Let our AI-powered planner help you discover the best experiences this incredible destination has to offer.',
    imageUrl: 'https://ouqeoizufbofdqbuiwvx.supabase.co/storage/v1/object/public/destinations//Cabo%20San%20Lucas.avif',
    tourCategories: [
      { name: 'Arch of Cabo Tours', hasGuide: true },
      { name: 'Sport Fishing Tours', hasGuide: true },
      { name: 'Beach Tours', hasGuide: true },
      { name: 'Whale Watching Tours', hasGuide: true },
      { name: 'Water Sports', hasGuide: true },
      { name: 'Luxury Tours', hasGuide: true }
    ],
    seo: {
      title: 'Cabo San Lucas Tours & Excursions - Top-Rated Activities & Adventures',
      description: 'Discover top-rated Cabo San Lucas tours, excursions, and activities powered by AI. From Arch tours to sport fishing, find the perfect way to explore Mexico\'s Pacific gem.',
      keywords: 'Cabo San Lucas tours, Arch of Cabo tours, sport fishing tours, things to do in Cabo San Lucas',
      primaryKeyword: 'Cabo San Lucas tours',
      secondaryKeywords: [
        'Cabo San Lucas Arch tours',
        'Cabo San Lucas sport fishing tours',
        'Cabo San Lucas beach tours',
        'Cabo San Lucas whale watching tours',
        'Cabo San Lucas water sports',
        'Things to do in Cabo San Lucas'
      ]
    },
    whyVisit: [
      'Iconic Arch of Cabo San Lucas rock formation',
      'World-class sport fishing and marine life',
      'Pristine beaches and water sports',
      'Luxury resorts and fine dining',
      'Dramatic desert and ocean landscapes',
      'Perfect blend of adventure and luxury'
    ],
    bestTimeToVisit: {
      weather: 'Cabo San Lucas enjoys a desert climate with hot summers and mild winters. Average temperatures range from 65°F (18°C) in winter to 90°F (32°C) in summer.',
      bestMonths: 'November to April offers the best weather with mild temperatures, perfect conditions for outdoor activities, and whale watching season.',
      peakSeason: 'December to April brings peak tourist season with ideal weather, larger crowds, and higher prices.',
      offSeason: 'May to October offers lower prices and fewer crowds, though with hot weather and hurricane season.'
    },
    gettingAround: 'Renting a car provides flexibility for exploring. Organized tours include transportation, and taxis are readily available for local trips.',
    highlights: [
      'Arch of Cabo San Lucas - Iconic rock formation',
      'Lover\'s Beach - Beautiful secluded beach',
      'Medano Beach - Popular swimming beach',
      'Whale Watching - Seasonal marine life',
      'Sport Fishing - World-class angling',
      'San Jose del Cabo - Charming historic town'
    ]
  },
  {
    id: 'puerto-vallarta',
    name: 'Puerto Vallarta',
    fullName: 'Puerto Vallarta',
    country: 'Mexico',
    category: 'North America',
    briefDescription: 'Pacific charm, colonial beauty, and artistic heritage — Puerto Vallarta is Mexico\'s most romantic destination.',
    heroDescription: 'Welcome to Puerto Vallarta, where the Sierra Madre mountains meet the Pacific Ocean and colonial charm creates a romantic atmosphere. From the historic Malecon boardwalk to the charming Old Town, from world-class dining to beautiful beaches, this Pacific paradise offers the perfect blend of culture, natural beauty, and authentic Mexican hospitality. Let our AI-powered planner help you discover the best experiences this incredible destination has to offer.',
    imageUrl: 'https://ouqeoizufbofdqbuiwvx.supabase.co/storage/v1/object/public/destinations//Puerto%20Vallarta.webp',
    tourCategories: [
      { name: 'Malecon Tours', hasGuide: true },
      { name: 'Old Town Tours', hasGuide: true },
      { name: 'Beach Tours', hasGuide: true },
      { name: 'Food & Culture Tours', hasGuide: true },
      { name: 'Whale Watching Tours', hasGuide: true },
      { name: 'Adventure Tours', hasGuide: true }
    ],
    seo: {
      title: 'Puerto Vallarta Tours & Excursions - Top-Rated Activities & Adventures',
      description: 'Discover top-rated Puerto Vallarta tours, excursions, and activities powered by AI. From Malecon to cultural experiences, find the perfect way to explore Mexico\'s most romantic destination.',
      keywords: 'Puerto Vallarta tours, Malecon tours, Old Town tours, things to do in Puerto Vallarta',
      primaryKeyword: 'Puerto Vallarta tours',
      secondaryKeywords: [
        'Puerto Vallarta Malecon tours',
        'Puerto Vallarta Old Town tours',
        'Puerto Vallarta beach tours',
        'Puerto Vallarta food tours',
        'Puerto Vallarta whale watching tours',
        'Things to do in Puerto Vallarta'
      ]
    },
    whyVisit: [
      'Historic Malecon boardwalk with sculptures',
      'Charming Old Town with colonial architecture',
      'Beautiful Pacific beaches and sunsets',
      'Authentic Mexican cuisine and culture',
      'Rich artistic heritage and galleries',
      'Perfect blend of romance and adventure'
    ],
    bestTimeToVisit: {
      weather: 'Puerto Vallarta enjoys a tropical climate with hot, humid summers and warm, dry winters. Average temperatures range from 70°F (21°C) in winter to 90°F (32°C) in summer.',
      bestMonths: 'November to April offers the best weather with warm temperatures, low humidity, and perfect conditions for all activities.',
      peakSeason: 'December to April brings peak tourist season with ideal weather, larger crowds, and higher prices.',
      offSeason: 'May to October offers lower prices and fewer crowds, though with hot, humid weather and hurricane season.'
    },
    gettingAround: 'Walking is perfect for exploring the Malecon and Old Town. Public buses connect different areas, and organized tours include transportation.',
    highlights: [
      'Malecon - Historic oceanfront boardwalk',
      'Old Town - Charming colonial architecture',
      'Los Muertos Beach - Popular beach area',
      'Church of Our Lady of Guadalupe - Historic cathedral',
      'Marietas Islands - Hidden beach paradise',
      'Sierra Madre Mountains - Scenic hiking trails'
    ]
  },
  {
    id: 'oaxaca',
    name: 'Oaxaca',
    fullName: 'Oaxaca',
    country: 'Mexico',
    category: 'North America',
    briefDescription: 'Cultural treasure, colonial charm, and indigenous heritage — Oaxaca is Mexico\'s most authentic destination.',
    heroDescription: 'Welcome to Oaxaca, where colonial architecture meets indigenous culture and authentic Mexican traditions come alive. From the historic Zocalo to ancient Monte Alban ruins, from world-famous cuisine to vibrant markets, this cultural treasure offers the perfect blend of history, art, and authentic Mexican life. Let our AI-powered planner help you discover the best experiences this incredible destination has to offer.',
    imageUrl: 'https://ouqeoizufbofdqbuiwvx.supabase.co/storage/v1/object/public/destinations//Oaxaca.webp',
    tourCategories: [
      { name: 'Historic Center Tours', hasGuide: true },
      { name: 'Monte Alban Tours', hasGuide: true },
      { name: 'Food & Mezcal Tours', hasGuide: true },
      { name: 'Market Tours', hasGuide: true },
      { name: 'Cultural Tours', hasGuide: true },
      { name: 'Artisan Tours', hasGuide: true }
    ],
    seo: {
      title: 'Oaxaca Tours & Excursions - Top-Rated Activities & Adventures',
      description: 'Discover top-rated Oaxaca tours, excursions, and activities powered by AI. From historic center to cultural experiences, find the perfect way to explore Mexico\'s most authentic destination.',
      keywords: 'Oaxaca tours, Monte Alban tours, food tours, things to do in Oaxaca',
      primaryKeyword: 'Oaxaca tours',
      secondaryKeywords: [
        'Oaxaca historic center tours',
        'Oaxaca Monte Alban tours',
        'Oaxaca food tours',
        'Oaxaca market tours',
        'Oaxaca cultural tours',
        'Things to do in Oaxaca'
      ]
    },
    whyVisit: [
      'UNESCO World Heritage historic center',
      'Ancient Monte Alban archaeological site',
      'World-famous Oaxacan cuisine and mezcal',
      'Vibrant markets and artisan crafts',
      'Rich indigenous culture and traditions',
      'Perfect blend of history and authenticity'
    ],
    bestTimeToVisit: {
      weather: 'Oaxaca enjoys a temperate highland climate with mild temperatures year-round. Average temperatures range from 60°F (16°C) in winter to 80°F (27°C) in summer.',
      bestMonths: 'November to April offers the best weather with mild temperatures, fewer crowds, and perfect conditions for sightseeing.',
      peakSeason: 'December to April brings peak tourist season with ideal weather, larger crowds, and higher prices.',
      offSeason: 'May to October offers lower prices and fewer crowds, though with occasional rain.'
    },
    gettingAround: 'Walking is perfect for exploring the historic center. Public transportation connects to nearby sites, and organized tours include transportation.',
    highlights: [
      'Zocalo - Historic central square',
      'Monte Alban - Ancient Zapotec ruins',
      'Santo Domingo Church - Stunning colonial church',
      'Benito Juarez Market - Famous food market',
      'Mezcal Distilleries - Traditional spirit production',
      'Artisan Villages - Traditional crafts and culture'
    ]
  },
  {
    id: 'san-jose',
    name: 'San José',
    fullName: 'San José',
    country: 'Costa Rica',
    category: 'South America',
    briefDescription: 'Cultural capital, coffee heritage, and urban charm — San José is Costa Rica\'s vibrant heart.',
    heroDescription: 'Welcome to San José, where colonial architecture meets modern culture and Costa Rican traditions come alive. From the historic National Theater to bustling markets, from coffee plantations to vibrant neighborhoods, this dynamic capital offers the perfect blend of history, culture, and authentic Costa Rican life. Let our AI-powered planner help you discover the best experiences this incredible destination has to offer.',
    imageUrl: 'https://ouqeoizufbofdqbuiwvx.supabase.co/storage/v1/object/public/destinations//san%20jose%20costa%20rica.webp',
    tourCategories: [
      { name: 'Historic Center Tours', hasGuide: true },
      { name: 'Coffee Plantation Tours', hasGuide: true },
      { name: 'Museum Tours', hasGuide: true },
      { name: 'Food & Culture Tours', hasGuide: true },
      { name: 'Market Tours', hasGuide: true },
      { name: 'Architecture Tours', hasGuide: true }
    ],
    seo: {
      title: 'San José Tours & Excursions - Top-Rated Activities & Adventures',
      description: 'Discover top-rated San José tours, excursions, and activities powered by AI. From historic center to coffee experiences, find the perfect way to explore Costa Rica\'s vibrant capital.',
      keywords: 'San José tours, Costa Rica tours, coffee tours, things to do in San José',
      primaryKeyword: 'San José tours',
      secondaryKeywords: [
        'San José historic center tours',
        'San José coffee tours',
        'San José museum tours',
        'San José food tours',
        'San José market tours',
        'Things to do in San José'
      ]
    },
    whyVisit: [
      'Historic National Theater and colonial architecture',
      'World-famous coffee plantations and tours',
      'Excellent museums and cultural institutions',
      'Authentic Costa Rican cuisine and markets',
      'Vibrant neighborhoods and local culture',
      'Perfect blend of history and modern life'
    ],
    bestTimeToVisit: {
      weather: 'San José enjoys a pleasant highland climate with mild temperatures year-round. Average temperatures range from 65°F (18°C) to 75°F (24°C).',
      bestMonths: 'December to April offers the best weather with dry conditions and perfect temperatures for sightseeing.',
      peakSeason: 'December to April brings peak tourist season with ideal weather, larger crowds, and higher prices.',
      offSeason: 'May to November offers lower prices and fewer crowds, though with occasional rain.'
    },
    gettingAround: 'Walking is perfect for exploring the historic center. Public buses connect different areas, and organized tours include transportation.',
    highlights: [
      'National Theater - Stunning historic theater',
      'Gold Museum - Pre-Columbian artifacts',
      'Central Market - Bustling local market',
      'Coffee Plantations - World-famous coffee tours',
      'Plaza de la Cultura - Cultural center',
      'Barrio Amón - Historic neighborhood'
    ]
  },
  {
    id: 'la-fortuna',
    name: 'La Fortuna',
    fullName: 'La Fortuna (Arenal)',
    country: 'Costa Rica',
    category: 'South America',
    briefDescription: 'Adventure paradise, volcanic landscapes, and natural wonders — La Fortuna is Costa Rica\'s adventure capital.',
    heroDescription: 'Welcome to La Fortuna, where the majestic Arenal Volcano meets pristine rainforest and endless adventure opportunities. From thrilling zip-lining to relaxing hot springs, from waterfall hikes to wildlife encounters, this adventure paradise offers the perfect blend of excitement, nature, and Costa Rican beauty. Let our AI-powered planner help you discover the best experiences this incredible destination has to offer.',
    imageUrl: 'https://ouqeoizufbofdqbuiwvx.supabase.co/storage/v1/object/public/destinations//La%20Fortuna%20(Arenal).jpg',
    tourCategories: [
      { name: 'Arenal Volcano Tours', hasGuide: true },
      { name: 'Hot Springs Tours', hasGuide: true },
      { name: 'Adventure Tours', hasGuide: true },
      { name: 'Wildlife Tours', hasGuide: true },
      { name: 'Waterfall Tours', hasGuide: true },
      { name: 'Rainforest Tours', hasGuide: true }
    ],
    seo: {
      title: 'La Fortuna Tours & Excursions - Top-Rated Activities & Adventures',
      description: 'Discover top-rated La Fortuna tours, excursions, and activities powered by AI. From Arenal Volcano to adventure experiences, find the perfect way to explore Costa Rica\'s adventure capital.',
      keywords: 'La Fortuna tours, Arenal Volcano tours, adventure tours, things to do in La Fortuna',
      primaryKeyword: 'La Fortuna tours',
      secondaryKeywords: [
        'La Fortuna Arenal Volcano tours',
        'La Fortuna hot springs tours',
        'La Fortuna adventure tours',
        'La Fortuna wildlife tours',
        'La Fortuna waterfall tours',
        'Things to do in La Fortuna'
      ]
    },
    whyVisit: [
      'Iconic Arenal Volcano and stunning views',
      'Natural hot springs and thermal baths',
      'Thrilling adventure activities and zip-lining',
      'Rich biodiversity and wildlife encounters',
      'Beautiful waterfalls and hiking trails',
      'Perfect blend of adventure and relaxation'
    ],
    bestTimeToVisit: {
      weather: 'La Fortuna enjoys a tropical climate with warm temperatures year-round. Average temperatures range from 70°F (21°C) to 85°F (29°C).',
      bestMonths: 'December to April offers the best weather with dry conditions and clear views of the volcano.',
      peakSeason: 'December to April brings peak tourist season with ideal weather, larger crowds, and higher prices.',
      offSeason: 'May to November offers lower prices and fewer crowds, though with occasional rain.'
    },
    gettingAround: 'Walking is perfect for exploring the town center. Organized tours include transportation to activities and attractions.',
    highlights: [
      'Arenal Volcano - Iconic active volcano',
      'La Fortuna Waterfall - Stunning natural wonder',
      'Hot Springs - Natural thermal baths',
      'Arenal Lake - Beautiful volcanic lake',
      'Zip-lining - Thrilling canopy adventures',
      'Wildlife Tours - Rich biodiversity encounters'
    ]
  },
  {
    id: 'manuel-antonio',
    name: 'Manuel Antonio',
    fullName: 'Manuel Antonio',
    country: 'Costa Rica',
    category: 'South America',
    briefDescription: 'Beach paradise, wildlife encounters, and tropical beauty — Manuel Antonio is Costa Rica\'s coastal gem.',
    heroDescription: 'Welcome to Manuel Antonio, where pristine beaches meet lush rainforest and incredible wildlife encounters await around every corner. From the famous national park to beautiful beaches, from monkey sightings to water activities, this coastal paradise offers the perfect blend of nature, adventure, and tropical relaxation. Let our AI-powered planner help you discover the best experiences this incredible destination has to offer.',
    imageUrl: 'https://ouqeoizufbofdqbuiwvx.supabase.co/storage/v1/object/public/destinations//Manuel%20Antonio.jpg',
    tourCategories: [
      { name: 'National Park Tours', hasGuide: true },
      { name: 'Wildlife Tours', hasGuide: true },
      { name: 'Beach Tours', hasGuide: true },
      { name: 'Water Activities', hasGuide: true },
      { name: 'Hiking Tours', hasGuide: true },
      { name: 'Sunset Tours', hasGuide: true }
    ],
    seo: {
      title: 'Manuel Antonio Tours & Excursions - Top-Rated Activities & Adventures',
      description: 'Discover top-rated Manuel Antonio tours, excursions, and activities powered by AI. From national park to wildlife experiences, find the perfect way to explore Costa Rica\'s coastal paradise.',
      keywords: 'Manuel Antonio tours, national park tours, wildlife tours, things to do in Manuel Antonio',
      primaryKeyword: 'Manuel Antonio tours',
      secondaryKeywords: [
        'Manuel Antonio national park tours',
        'Manuel Antonio wildlife tours',
        'Manuel Antonio beach tours',
        'Manuel Antonio water activities',
        'Manuel Antonio hiking tours',
        'Things to do in Manuel Antonio'
      ]
    },
    whyVisit: [
      'Famous Manuel Antonio National Park',
      'Incredible wildlife and biodiversity',
      'Beautiful beaches and water activities',
      'Stunning coastal views and sunsets',
      'Excellent hiking and nature trails',
      'Perfect blend of adventure and relaxation'
    ],
    bestTimeToVisit: {
      weather: 'Manuel Antonio enjoys a tropical climate with warm temperatures year-round. Average temperatures range from 75°F (24°C) to 90°F (32°C).',
      bestMonths: 'December to April offers the best weather with dry conditions and perfect beach weather.',
      peakSeason: 'December to April brings peak tourist season with ideal weather, larger crowds, and higher prices.',
      offSeason: 'May to November offers lower prices and fewer crowds, though with occasional rain.'
    },
    gettingAround: 'Walking is perfect for exploring the town and beaches. Organized tours include transportation to the national park and activities.',
    highlights: [
      'Manuel Antonio National Park - Famous wildlife park',
      'Espadilla Beach - Beautiful main beach',
      'Cathedral Point - Stunning coastal views',
      'Wildlife Encounters - Monkeys, sloths, and birds',
      'Water Activities - Snorkeling and kayaking',
      'Sunset Views - Spectacular coastal sunsets'
    ]
  },
  {
    id: 'panama-city',
    name: 'Panama City',
    fullName: 'Panama City',
    country: 'Panama',
    category: 'South America',
    briefDescription: 'Modern metropolis, historic charm, and canal wonders — Panama City is Panama\'s dynamic heart.',
    heroDescription: 'Welcome to Panama City, where modern skyscrapers meet historic Casco Viejo and the iconic Panama Canal connects two oceans. From the impressive skyline to colonial architecture, from canal tours to vibrant nightlife, this dynamic metropolis offers the perfect blend of history, modernity, and Panamanian culture. Let our AI-powered planner help you discover the best experiences this incredible destination has to offer.',
    imageUrl: 'https://ouqeoizufbofdqbuiwvx.supabase.co/storage/v1/object/public/destinations//Panama%20City.jpg',
    tourCategories: [
      { name: 'Panama Canal Tours', hasGuide: true },
      { name: 'Casco Viejo Tours', hasGuide: true },
      { name: 'City Tours', hasGuide: true },
      { name: 'Food & Culture Tours', hasGuide: true },
      { name: 'Architecture Tours', hasGuide: true },
      { name: 'Nightlife Tours', hasGuide: true }
    ],
    seo: {
      title: 'Panama City Tours & Excursions - Top-Rated Activities & Adventures',
      description: 'Discover top-rated Panama City tours, excursions, and activities powered by AI. From Panama Canal to historic experiences, find the perfect way to explore Panama\'s dynamic capital.',
      keywords: 'Panama City tours, Panama Canal tours, Casco Viejo tours, things to do in Panama City',
      primaryKeyword: 'Panama City tours',
      secondaryKeywords: [
        'Panama City Panama Canal tours',
        'Panama City Casco Viejo tours',
        'Panama City city tours',
        'Panama City food tours',
        'Panama City architecture tours',
        'Things to do in Panama City'
      ]
    },
    whyVisit: [
      'Iconic Panama Canal and engineering marvel',
      'Historic Casco Viejo with colonial charm',
      'Modern skyline and impressive architecture',
      'Excellent cuisine and vibrant culture',
      'Rich history and cultural heritage',
      'Perfect blend of old and new'
    ],
    bestTimeToVisit: {
      weather: 'Panama City enjoys a tropical climate with hot, humid weather year-round. Average temperatures range from 75°F (24°C) to 90°F (32°C).',
      bestMonths: 'December to April offers the best weather with dry conditions and fewer rain showers.',
      peakSeason: 'December to April brings peak tourist season with ideal weather, larger crowds, and higher prices.',
      offSeason: 'May to November offers lower prices and fewer crowds, though with more rain.'
    },
    gettingAround: 'Walking is perfect for exploring Casco Viejo. Public transportation and taxis connect different areas, and organized tours include transportation.',
    highlights: [
      'Panama Canal - Engineering marvel',
      'Casco Viejo - Historic colonial district',
      'Panama Canal Museum - Educational exhibits',
      'Amador Causeway - Scenic waterfront',
      'Metropolitan Natural Park - Urban nature',
      'Panama Viejo - Ancient ruins'
    ]
  },
  {
    id: 'bocas-del-toro',
    name: 'Bocas del Toro',
    fullName: 'Bocas del Toro',
    country: 'Panama',
    category: 'South America',
    briefDescription: 'Caribbean paradise, island life, and tropical adventures — Bocas del Toro is Panama\'s island gem.',
    heroDescription: 'Welcome to Bocas del Toro, where crystal-clear Caribbean waters meet lush tropical islands and laid-back island culture. From pristine beaches to vibrant coral reefs, from water activities to island hopping, this Caribbean paradise offers the perfect blend of adventure, relaxation, and tropical beauty. Let our AI-powered planner help you discover the best experiences this incredible destination has to offer.',
    imageUrl: 'https://ouqeoizufbofdqbuiwvx.supabase.co/storage/v1/object/public/destinations//Bocas%20del%20Toro.jpg',
    tourCategories: [
      { name: 'Island Hopping Tours', hasGuide: true },
      { name: 'Snorkeling Tours', hasGuide: true },
      { name: 'Beach Tours', hasGuide: true },
      { name: 'Water Activities', hasGuide: true },
      { name: 'Wildlife Tours', hasGuide: true },
      { name: 'Sunset Tours', hasGuide: true }
    ],
    seo: {
      title: 'Bocas del Toro Tours & Excursions - Top-Rated Activities & Adventures',
      description: 'Discover top-rated Bocas del Toro tours, excursions, and activities powered by AI. From island hopping to water experiences, find the perfect way to explore Panama\'s Caribbean paradise.',
      keywords: 'Bocas del Toro tours, island tours, snorkeling tours, things to do in Bocas del Toro',
      primaryKeyword: 'Bocas del Toro tours',
      secondaryKeywords: [
        'Bocas del Toro island hopping tours',
        'Bocas del Toro snorkeling tours',
        'Bocas del Toro beach tours',
        'Bocas del Toro water activities',
        'Bocas del Toro wildlife tours',
        'Things to do in Bocas del Toro'
      ]
    },
    whyVisit: [
      'Pristine Caribbean beaches and crystal waters',
      'Excellent snorkeling and diving opportunities',
      'Island hopping and tropical adventures',
      'Laid-back Caribbean culture and vibe',
      'Rich marine life and coral reefs',
      'Perfect blend of adventure and relaxation'
    ],
    bestTimeToVisit: {
      weather: 'Bocas del Toro enjoys a tropical climate with warm temperatures year-round. Average temperatures range from 75°F (24°C) to 85°F (29°C).',
      bestMonths: 'December to April offers the best weather with dry conditions and perfect beach weather.',
      peakSeason: 'December to April brings peak tourist season with ideal weather, larger crowds, and higher prices.',
      offSeason: 'May to November offers lower prices and fewer crowds, though with more rain.'
    },
    gettingAround: 'Water taxis and boats are the main transportation between islands. Walking is perfect for exploring individual islands.',
    highlights: [
      'Red Frog Beach - Famous pristine beach',
      'Coral Reefs - Excellent snorkeling spots',
      'Isla Colón - Main island hub',
      'Dolphin Bay - Wildlife encounters',
      'Water Activities - Kayaking and surfing',
      'Caribbean Culture - Laid-back island vibe'
    ]
  },
  {
    id: 'cartagena',
    name: 'Cartagena',
    fullName: 'Cartagena',
    country: 'Colombia',
    category: 'South America',
    briefDescription: 'Colonial treasure, Caribbean charm, and historic beauty — Cartagena is Colombia\'s coastal jewel.',
    heroDescription: 'Welcome to Cartagena, where colorful colonial architecture meets Caribbean beaches and centuries of history come alive. From the walled Old Town to beautiful beaches, from vibrant plazas to cultural experiences, this historic gem offers the perfect blend of history, culture, and tropical beauty. Let our AI-powered planner help you discover the best experiences this incredible destination has to offer.',
    imageUrl: 'https://ouqeoizufbofdqbuiwvx.supabase.co/storage/v1/object/public/destinations//Cartagena.avif',
    tourCategories: [
      { name: 'Old Town Tours', hasGuide: true },
      { name: 'Historic Tours', hasGuide: true },
      { name: 'Beach Tours', hasGuide: true },
      { name: 'Food & Culture Tours', hasGuide: true },
      { name: 'Architecture Tours', hasGuide: true },
      { name: 'Sunset Tours', hasGuide: true }
    ],
    seo: {
      title: 'Cartagena Tours & Excursions - Top-Rated Activities & Adventures',
      description: 'Discover top-rated Cartagena tours, excursions, and activities powered by AI. From Old Town to historic experiences, find the perfect way to explore Colombia\'s coastal jewel.',
      keywords: 'Cartagena tours, Old Town tours, historic tours, things to do in Cartagena',
      primaryKeyword: 'Cartagena tours',
      secondaryKeywords: [
        'Cartagena Old Town tours',
        'Cartagena historic tours',
        'Cartagena beach tours',
        'Cartagena food tours',
        'Cartagena architecture tours',
        'Things to do in Cartagena'
      ]
    },
    whyVisit: [
      'UNESCO World Heritage Old Town',
      'Beautiful Caribbean beaches',
      'Rich colonial history and architecture',
      'Vibrant culture and local traditions',
      'Excellent cuisine and nightlife',
      'Perfect blend of history and tropical life'
    ],
    bestTimeToVisit: {
      weather: 'Cartagena enjoys a tropical climate with hot, humid weather year-round. Average temperatures range from 75°F (24°C) to 90°F (32°C).',
      bestMonths: 'December to April offers the best weather with dry conditions and perfect beach weather.',
      peakSeason: 'December to April brings peak tourist season with ideal weather, larger crowds, and higher prices.',
      offSeason: 'May to November offers lower prices and fewer crowds, though with more rain.'
    },
    gettingAround: 'Walking is perfect for exploring the Old Town. Public transportation and taxis connect different areas, and organized tours include transportation.',
    highlights: [
      'Old Town - UNESCO World Heritage site',
      'City Walls - Historic fortifications',
      'Plaza de los Coches - Historic square',
      'Getsemaní - Vibrant neighborhood',
      'Bocagrande - Modern beach area',
      'Castillo San Felipe - Historic fortress'
    ]
  },
  {
    id: 'medellin',
    name: 'Medellín',
    fullName: 'Medellín',
    country: 'Colombia',
    category: 'South America',
    briefDescription: 'City of eternal spring, innovation, and transformation — Medellín is Colombia\'s most dynamic city.',
    heroDescription: 'Welcome to Medellín, where innovation meets tradition and the spirit of transformation creates a vibrant urban experience. From the famous flower festival to modern architecture, from cable car views to cultural experiences, this dynamic city offers the perfect blend of progress, culture, and Colombian warmth. Let our AI-powered planner help you discover the best experiences this incredible destination has to offer.',
    imageUrl: 'https://ouqeoizufbofdqbuiwvx.supabase.co/storage/v1/object/public/destinations//Medellin.jpeg',
    tourCategories: [
      { name: 'City Tours', hasGuide: true },
      { name: 'Cable Car Tours', hasGuide: true },
      { name: 'Food & Culture Tours', hasGuide: true },
      { name: 'Art Tours', hasGuide: true },
      { name: 'Neighborhood Tours', hasGuide: true },
      { name: 'Nightlife Tours', hasGuide: true }
    ],
    seo: {
      title: 'Medellín Tours & Excursions - Top-Rated Activities & Adventures',
      description: 'Discover top-rated Medellín tours, excursions, and activities powered by AI. From city tours to cultural experiences, find the perfect way to explore Colombia\'s most dynamic city.',
      keywords: 'Medellín tours, city tours, cable car tours, things to do in Medellín',
      primaryKeyword: 'Medellín tours',
      secondaryKeywords: [
        'Medellín city tours',
        'Medellín cable car tours',
        'Medellín food tours',
        'Medellín art tours',
        'Medellín neighborhood tours',
        'Things to do in Medellín'
      ]
    },
    whyVisit: [
      'Eternal spring climate and pleasant weather',
      'Innovative transportation and architecture',
      'Rich cultural heritage and traditions',
      'Excellent cuisine and vibrant nightlife',
      'Beautiful surrounding mountains',
      'Perfect blend of innovation and tradition'
    ],
    bestTimeToVisit: {
      weather: 'Medellín enjoys a pleasant climate year-round with average temperatures around 72°F (22°C), earning its nickname "City of Eternal Spring."',
      bestMonths: 'Year-round offers pleasant weather, but December to March and July to August are particularly nice.',
      peakSeason: 'December to March brings peak tourist season with ideal weather, larger crowds, and higher prices.',
      offSeason: 'April to June and September to November offer lower prices and fewer crowds.'
    },
    gettingAround: 'Excellent public transportation including metro and cable cars. Walking is perfect for exploring neighborhoods, and organized tours include transportation.',
    highlights: [
      'Metrocable - Innovative cable car system',
      'Plaza Botero - Famous sculpture plaza',
      'Pueblito Paisa - Replica traditional village',
      'Comuna 13 - Transformed neighborhood',
      'Parque Lleras - Vibrant nightlife area',
      'Jardín Botánico - Beautiful botanical gardens'
    ]
  },
  {
    id: 'bogota',
    name: 'Bogotá',
    fullName: 'Bogotá',
    country: 'Colombia',
    category: 'South America',
    briefDescription: 'Andean capital, cultural richness, and urban sophistication — Bogotá is Colombia\'s dynamic heart.',
    heroDescription: 'Welcome to Bogotá, where Andean mountains meet urban sophistication and Colombian culture thrives in every neighborhood. From the historic La Candelaria to modern districts, from world-class museums to vibrant street art, this dynamic capital offers the perfect blend of history, culture, and modern Colombian life. Let our AI-powered planner help you discover the best experiences this incredible destination has to offer.',
    imageUrl: 'https://ouqeoizufbofdqbuiwvx.supabase.co/storage/v1/object/public/destinations//Bogota.webp',
    tourCategories: [
      { name: 'La Candelaria Tours', hasGuide: true },
      { name: 'Museum Tours', hasGuide: true },
      { name: 'Food & Culture Tours', hasGuide: true },
      { name: 'Street Art Tours', hasGuide: true },
      { name: 'Mountain Tours', hasGuide: true },
      { name: 'Nightlife Tours', hasGuide: true }
    ],
    seo: {
      title: 'Bogotá Tours & Excursions - Top-Rated Activities & Adventures',
      description: 'Discover top-rated Bogotá tours, excursions, and activities powered by AI. From La Candelaria to cultural experiences, find the perfect way to explore Colombia\'s dynamic capital.',
      keywords: 'Bogotá tours, La Candelaria tours, museum tours, things to do in Bogotá',
      primaryKeyword: 'Bogotá tours',
      secondaryKeywords: [
        'Bogotá La Candelaria tours',
        'Bogotá museum tours',
        'Bogotá food tours',
        'Bogotá street art tours',
        'Bogotá mountain tours',
        'Things to do in Bogotá'
      ]
    },
    whyVisit: [
      'Historic La Candelaria district',
      'World-class museums and cultural institutions',
      'Excellent cuisine and coffee culture',
      'Beautiful Andean mountain views',
      'Vibrant street art and culture',
      'Perfect blend of history and modernity'
    ],
    bestTimeToVisit: {
      weather: 'Bogotá enjoys a cool highland climate with average temperatures around 60°F (16°C). The city experiences frequent rain showers.',
      bestMonths: 'December to March and July to August offer the best weather with fewer rain showers.',
      peakSeason: 'December to March brings peak tourist season with better weather, larger crowds, and higher prices.',
      offSeason: 'April to June and September to November offer lower prices and fewer crowds, though with more rain.'
    },
    gettingAround: 'Excellent public transportation including TransMilenio bus system. Walking is perfect for exploring La Candelaria, and organized tours include transportation.',
    highlights: [
      'La Candelaria - Historic colonial district',
      'Gold Museum - World-famous collection',
      'Monserrate - Mountain viewpoint',
      'Botero Museum - Famous art collection',
      'Plaza de Bolívar - Historic central square',
      'Street Art - Vibrant urban art scene'
    ]
  },
  {
    id: 'lima',
    name: 'Lima',
    fullName: 'Lima',
    country: 'Peru',
    category: 'South America',
    briefDescription: 'Gastronomic capital, coastal charm, and cultural heritage — Lima is Peru\'s vibrant heart.',
    relatedGuides: ['best-tours-peru-machu-picchu'],
    heroDescription: 'Welcome to Lima, where world-class cuisine meets colonial architecture and Peruvian culture thrives along the Pacific coast. From the historic center to modern districts, from ceviche to pisco sours, from museums to coastal views, this gastronomic capital offers the perfect blend of history, culture, and culinary excellence. Let our AI-powered planner help you discover the best experiences this incredible destination has to offer.',
    imageUrl: 'https://ouqeoizufbofdqbuiwvx.supabase.co/storage/v1/object/public/destinations//Lima.jpg',
    tourCategories: [
      { name: 'Historic Center Tours', hasGuide: true },
      { name: 'Food & Culinary Tours', hasGuide: true },
      { name: 'Museum Tours', hasGuide: true },
      { name: 'Coastal Tours', hasGuide: true },
      { name: 'Architecture Tours', hasGuide: true },
      { name: 'Nightlife Tours', hasGuide: true }
    ],
    seo: {
      title: 'Lima Tours & Excursions - Top-Rated Activities & Adventures',
      description: 'Discover top-rated Lima tours, excursions, and activities powered by AI. From historic center to culinary experiences, find the perfect way to explore Peru\'s gastronomic capital.',
      keywords: 'Lima tours, food tours, historic tours, things to do in Lima',
      primaryKeyword: 'Lima tours',
      secondaryKeywords: [
        'Lima historic center tours',
        'Lima food tours',
        'Lima museum tours',
        'Lima coastal tours',
        'Lima architecture tours',
        'Things to do in Lima'
      ]
    },
    whyVisit: [
      'World-famous gastronomy and restaurants',
      'Historic center with colonial architecture',
      'Excellent museums and cultural institutions',
      'Beautiful Pacific coast and views',
      'Rich Peruvian culture and traditions',
      'Perfect blend of history and culinary excellence'
    ],
    bestTimeToVisit: {
      weather: 'Lima enjoys a mild coastal climate with average temperatures around 70°F (21°C). The city experiences frequent coastal fog.',
      bestMonths: 'December to April offers the best weather with clearer skies and warmer temperatures.',
      peakSeason: 'December to April brings peak tourist season with better weather, larger crowds, and higher prices.',
      offSeason: 'May to November offers lower prices and fewer crowds, though with more fog.'
    },
    gettingAround: 'Walking is perfect for exploring the historic center. Public transportation and taxis connect different areas, and organized tours include transportation.',
    highlights: [
      'Historic Center - UNESCO World Heritage site',
      'Miraflores - Modern coastal district',
      'Barranco - Bohemian arts district',
      'Larco Museum - Pre-Columbian artifacts',
      'Plaza Mayor - Historic central square',
      'Coastal Views - Beautiful Pacific vistas'
    ]
  },
  {
    id: 'cusco',
    name: 'Cusco',
    fullName: 'Cusco',
    country: 'Peru',
    category: 'South America',
    briefDescription: 'Inca capital, Andean heritage, and cultural treasure — Cusco is Peru\'s historic heart.',
    relatedGuides: ['best-tours-peru-machu-picchu'],
    heroDescription: 'Welcome to Cusco, where ancient Inca stonework meets Spanish colonial architecture and Andean culture thrives in the highlands. From the historic Plaza de Armas to ancient ruins, from traditional markets to cultural experiences, this former Inca capital offers the perfect blend of history, culture, and Andean mysticism. Let our AI-powered planner help you discover the best experiences this incredible destination has to offer.',
    imageUrl: 'https://ouqeoizufbofdqbuiwvx.supabase.co/storage/v1/object/public/destinations//Cusco.jpg',
    tourCategories: [
      { name: 'Historic Center Tours', hasGuide: true },
      { name: 'Inca Ruins Tours', hasGuide: true },
      { name: 'Sacred Valley Tours', hasGuide: true },
      { name: 'Cultural Tours', hasGuide: true },
      { name: 'Market Tours', hasGuide: true },
      { name: 'Mountain Tours', hasGuide: true }
    ],
    seo: {
      title: 'Cusco Tours & Excursions - Top-Rated Activities & Adventures',
      description: 'Discover top-rated Cusco tours, excursions, and activities powered by AI. From historic center to Inca experiences, find the perfect way to explore Peru\'s historic heart.',
      keywords: 'Cusco tours, Inca ruins tours, Sacred Valley tours, things to do in Cusco',
      primaryKeyword: 'Cusco tours',
      secondaryKeywords: [
        'Cusco historic center tours',
        'Cusco Inca ruins tours',
        'Cusco Sacred Valley tours',
        'Cusco cultural tours',
        'Cusco market tours',
        'Things to do in Cusco'
      ]
    },
    whyVisit: [
      'Former Inca capital with rich history',
      'Ancient ruins and archaeological sites',
      'Beautiful colonial architecture',
      'Gateway to Machu Picchu',
      'Rich Andean culture and traditions',
      'Perfect blend of Inca and Spanish heritage'
    ],
    bestTimeToVisit: {
      weather: 'Cusco enjoys a cool highland climate with average temperatures around 55°F (13°C). The city experiences distinct wet and dry seasons.',
      bestMonths: 'May to October offers the best weather with dry conditions and clear skies.',
      peakSeason: 'June to August brings peak tourist season with ideal weather, larger crowds, and higher prices.',
      offSeason: 'November to April offers lower prices and fewer crowds, though with more rain.'
    },
    gettingAround: 'Walking is perfect for exploring the historic center. Organized tours include transportation to nearby sites and the Sacred Valley.',
    highlights: [
      'Plaza de Armas - Historic central square',
      'Sacsayhuamán - Ancient Inca fortress',
      'Qorikancha - Inca temple site',
      'San Pedro Market - Traditional market',
      'Sacred Valley - Beautiful Andean valley',
      'Cathedral - Stunning colonial church'
    ]
  },
  {
    id: 'machu-picchu',
    name: 'Machu Picchu',
    fullName: 'Machu Picchu',
    country: 'Peru',
    category: 'South America',
    briefDescription: 'Lost city, ancient wonder, and world heritage — Machu Picchu is Peru\'s crown jewel.',
    relatedGuides: ['best-tours-peru-machu-picchu'],
    heroDescription: 'Welcome to Machu Picchu, where ancient Inca engineering meets breathtaking Andean landscapes and centuries of mystery surround this lost city in the clouds. From the iconic citadel to surrounding ruins, from mountain vistas to cultural insights, this world wonder offers the perfect blend of history, adventure, and spiritual connection. Let our AI-powered planner help you discover the best experiences this incredible destination has to offer.',
    imageUrl: 'https://ouqeoizufbofdqbuiwvx.supabase.co/storage/v1/object/public/destinations//Machu%20Picchu.jpg',
    tourCategories: [
      { name: 'Citadel Tours', hasGuide: true },
      { name: 'Inca Trail Tours', hasGuide: true },
      { name: 'Mountain Tours', hasGuide: true },
      { name: 'Cultural Tours', hasGuide: true },
      { name: 'Photography Tours', hasGuide: true },
      { name: 'Sunrise Tours', hasGuide: true }
    ],
    seo: {
      title: 'Machu Picchu Tours & Excursions - Top-Rated Activities & Adventures',
      description: 'Discover top-rated Machu Picchu tours, excursions, and activities powered by AI. From citadel tours to Inca Trail experiences, find the perfect way to explore Peru\'s crown jewel.',
      keywords: 'Machu Picchu tours, Inca Trail tours, citadel tours, things to do in Machu Picchu',
      primaryKeyword: 'Machu Picchu tours',
      secondaryKeywords: [
        'Machu Picchu citadel tours',
        'Machu Picchu Inca Trail tours',
        'Machu Picchu mountain tours',
        'Machu Picchu cultural tours',
        'Machu Picchu photography tours',
        'Things to do in Machu Picchu'
      ]
    },
    whyVisit: [
      'UNESCO World Heritage site and wonder',
      'Ancient Inca citadel and architecture',
      'Breathtaking Andean mountain views',
      'Rich cultural and historical significance',
      'Iconic Inca Trail hiking experience',
      'Perfect blend of history and natural beauty'
    ],
    bestTimeToVisit: {
      weather: 'Machu Picchu enjoys a subtropical highland climate with average temperatures around 65°F (18°C). The site experiences distinct wet and dry seasons.',
      bestMonths: 'May to October offers the best weather with dry conditions and clear views.',
      peakSeason: 'June to August brings peak tourist season with ideal weather, larger crowds, and higher prices.',
      offSeason: 'November to April offers lower prices and fewer crowds, though with more rain.'
    },
    gettingAround: 'Access is via train from Cusco or hiking the Inca Trail. Walking is required within the citadel, and organized tours include transportation.',
    highlights: [
      'Main Citadel - Ancient Inca ruins',
      'Huayna Picchu - Iconic mountain peak',
      'Sun Gate - Traditional entrance point',
      'Temple of the Sun - Sacred Inca temple',
      'Agricultural Terraces - Ancient farming',
      'Mountain Views - Breathtaking landscapes'
    ]
  },
  {
    id: 'rio-de-janeiro',
    name: 'Rio de Janeiro',
    fullName: 'Rio de Janeiro',
    country: 'Brazil',
    category: 'South America',
    briefDescription: 'Cidade Maravilhosa, carnival spirit, and natural wonders — Rio de Janeiro is Brazil\'s iconic heart.',
    relatedGuides: ['best-time-to-visit-brazil'],
    heroDescription: 'Welcome to Rio de Janeiro, where stunning beaches meet dramatic mountains and Brazilian culture comes alive with samba rhythms and carnival spirit. From the iconic Christ the Redeemer to beautiful beaches, from vibrant neighborhoods to cultural experiences, this marvelous city offers the perfect blend of natural beauty, culture, and Brazilian joie de vivre. Let our AI-powered planner help you discover the best experiences this incredible destination has to offer.',
    imageUrl: 'https://ouqeoizufbofdqbuiwvx.supabase.co/storage/v1/object/public/destinations//Rio%20de%20Janeiro.jpeg',
    tourCategories: [
      { name: 'Christ the Redeemer Tours', hasGuide: true },
      { name: 'Beach Tours', hasGuide: true },
      { name: 'Sugarloaf Mountain Tours', hasGuide: true },
      { name: 'Cultural Tours', hasGuide: true },
      { name: 'Favela Tours', hasGuide: true },
      { name: 'Carnival Tours', hasGuide: true }
    ],
    seo: {
      title: 'Rio de Janeiro Tours & Excursions - Top-Rated Activities & Adventures',
      description: 'Discover top-rated Rio de Janeiro tours, excursions, and activities powered by AI. From Christ the Redeemer to beach experiences, find the perfect way to explore Brazil\'s iconic heart.',
      keywords: 'Rio de Janeiro tours, Christ the Redeemer tours, beach tours, things to do in Rio de Janeiro',
      primaryKeyword: 'Rio de Janeiro tours',
      secondaryKeywords: [
        'Rio de Janeiro Christ the Redeemer tours',
        'Rio de Janeiro beach tours',
        'Rio de Janeiro Sugarloaf Mountain tours',
        'Rio de Janeiro cultural tours',
        'Rio de Janeiro favela tours',
        'Things to do in Rio de Janeiro'
      ]
    },
    whyVisit: [
      'Iconic Christ the Redeemer statue',
      'Beautiful beaches from Copacabana to Ipanema',
      'Dramatic Sugarloaf Mountain views',
      'Vibrant carnival culture and samba',
      'Rich Brazilian culture and traditions',
      'Perfect blend of natural beauty and urban life'
    ],
    bestTimeToVisit: {
      weather: 'Rio de Janeiro enjoys a tropical climate with hot, humid weather year-round. Average temperatures range from 70°F (21°C) to 85°F (29°C).',
      bestMonths: 'March to May and September to November offer the best weather with pleasant temperatures and fewer crowds.',
      peakSeason: 'December to March brings peak tourist season with hot weather, larger crowds, and higher prices.',
      offSeason: 'June to August offers lower prices and fewer crowds, though with cooler temperatures.'
    },
    gettingAround: 'Excellent public transportation including metro and buses. Walking is perfect for exploring beaches, and organized tours include transportation.',
    highlights: [
      'Christ the Redeemer - Iconic statue',
      'Copacabana Beach - Famous beach',
      'Sugarloaf Mountain - Dramatic peak',
      'Ipanema Beach - Beautiful beach',
      'Tijuca Forest - Urban rainforest',
      'Carnival - World-famous festival'
    ]
  },
  {
    id: 'sao-paulo',
    name: 'São Paulo',
    fullName: 'São Paulo',
    country: 'Brazil',
    category: 'South America',
    briefDescription: 'Concrete jungle, cultural melting pot, and urban sophistication — São Paulo is Brazil\'s dynamic metropolis.',
    heroDescription: 'Welcome to São Paulo, where skyscrapers meet cultural diversity and Brazilian innovation thrives in this massive metropolis. From world-class museums to diverse neighborhoods, from excellent cuisine to vibrant nightlife, from business districts to cultural experiences, this dynamic city offers the perfect blend of urban sophistication, culture, and Brazilian energy. Let our AI-powered planner help you discover the best experiences this incredible destination has to offer.',
    imageUrl: 'https://ouqeoizufbofdqbuiwvx.supabase.co/storage/v1/object/public/destinations//Sao%20Paulo.jpg',
    tourCategories: [
      { name: 'City Tours', hasGuide: true },
      { name: 'Museum Tours', hasGuide: true },
      { name: 'Food & Culture Tours', hasGuide: true },
      { name: 'Architecture Tours', hasGuide: true },
      { name: 'Neighborhood Tours', hasGuide: true },
      { name: 'Nightlife Tours', hasGuide: true }
    ],
    seo: {
      title: 'São Paulo Tours & Excursions - Top-Rated Activities & Adventures',
      description: 'Discover top-rated São Paulo tours, excursions, and activities powered by AI. From city tours to cultural experiences, find the perfect way to explore Brazil\'s dynamic metropolis.',
      keywords: 'São Paulo tours, city tours, museum tours, things to do in São Paulo',
      primaryKeyword: 'São Paulo tours',
      secondaryKeywords: [
        'São Paulo city tours',
        'São Paulo museum tours',
        'São Paulo food tours',
        'São Paulo architecture tours',
        'São Paulo neighborhood tours',
        'Things to do in São Paulo'
      ]
    },
    whyVisit: [
      'World-class museums and cultural institutions',
      'Excellent diverse cuisine and restaurants',
      'Vibrant neighborhoods and cultural diversity',
      'Impressive architecture and urban planning',
      'Rich Brazilian culture and traditions',
      'Perfect blend of business and culture'
    ],
    bestTimeToVisit: {
      weather: 'São Paulo enjoys a subtropical climate with mild temperatures year-round. Average temperatures range from 60°F (16°C) to 80°F (27°C).',
      bestMonths: 'March to May and September to November offer the best weather with pleasant temperatures.',
      peakSeason: 'December to February brings peak tourist season with warmer weather, larger crowds, and higher prices.',
      offSeason: 'June to August offers lower prices and fewer crowds, though with cooler temperatures.'
    },
    gettingAround: 'Excellent public transportation including metro and buses. Walking is perfect for exploring neighborhoods, and organized tours include transportation.',
    highlights: [
      'Paulista Avenue - Famous business district',
      'Ibirapuera Park - Beautiful urban park',
      'MASP - Famous art museum',
      'Vila Madalena - Bohemian neighborhood',
      'Municipal Market - Famous food market',
      'Downtown - Historic center'
    ]
  },
  {
    id: 'salvador',
    name: 'Salvador',
    fullName: 'Salvador',
    country: 'Brazil',
    category: 'South America',
    briefDescription: 'Afro-Brazilian soul, colonial heritage, and cultural richness — Salvador is Brazil\'s historic heart.',
    heroDescription: 'Welcome to Salvador, where African heritage meets Portuguese colonial architecture and Brazilian culture thrives in the historic Pelourinho. From colorful colonial buildings to vibrant capoeira performances, from traditional Bahian cuisine to cultural experiences, this historic gem offers the perfect blend of history, culture, and Afro-Brazilian traditions. Let our AI-powered planner help you discover the best experiences this incredible destination has to offer.',
    imageUrl: 'https://ouqeoizufbofdqbuiwvx.supabase.co/storage/v1/object/public/destinations//Salvador.jpeg',
    tourCategories: [
      { name: 'Pelourinho Tours', hasGuide: true },
      { name: 'Historic Tours', hasGuide: true },
      { name: 'Cultural Tours', hasGuide: true },
      { name: 'Food & Culinary Tours', hasGuide: true },
      { name: 'Capoeira Tours', hasGuide: true },
      { name: 'Beach Tours', hasGuide: true }
    ],
    seo: {
      title: 'Salvador Tours & Excursions - Top-Rated Activities & Adventures',
      description: 'Discover top-rated Salvador tours, excursions, and activities powered by AI. From Pelourinho to cultural experiences, find the perfect way to explore Brazil\'s historic heart.',
      keywords: 'Salvador tours, Pelourinho tours, cultural tours, things to do in Salvador',
      primaryKeyword: 'Salvador tours',
      secondaryKeywords: [
        'Salvador Pelourinho tours',
        'Salvador historic tours',
        'Salvador cultural tours',
        'Salvador food tours',
        'Salvador capoeira tours',
        'Things to do in Salvador'
      ]
    },
    whyVisit: [
      'UNESCO World Heritage Pelourinho district',
      'Rich Afro-Brazilian culture and traditions',
      'Beautiful colonial architecture',
      'Traditional Bahian cuisine',
      'Vibrant capoeira and music scene',
      'Perfect blend of history and culture'
    ],
    bestTimeToVisit: {
      weather: 'Salvador enjoys a tropical climate with hot, humid weather year-round. Average temperatures range from 75°F (24°C) to 85°F (29°C).',
      bestMonths: 'March to May and September to November offer the best weather with pleasant temperatures.',
      peakSeason: 'December to February brings peak tourist season with hot weather, larger crowds, and higher prices.',
      offSeason: 'June to August offers lower prices and fewer crowds, though with more rain.'
    },
    gettingAround: 'Walking is perfect for exploring the Pelourinho. Public transportation and taxis connect different areas, and organized tours include transportation.',
    highlights: [
      'Pelourinho - UNESCO World Heritage site',
      'São Francisco Church - Stunning colonial church',
      'Elevador Lacerda - Historic elevator',
      'Capoeira Performances - Traditional martial art',
      'Bahian Cuisine - Traditional local food',
      'Porto da Barra Beach - Beautiful beach'
    ]
  },
  {
    id: 'buenos-aires',
    name: 'Buenos Aires',
    fullName: 'Buenos Aires',
    country: 'Argentina',
    category: 'South America',
    briefDescription: 'Tango capital, European charm, and cultural sophistication — Buenos Aires is Argentina\'s vibrant heart.',
    heroDescription: 'Welcome to Buenos Aires, where tango rhythms echo through historic streets and European elegance meets Latin American passion. From the colorful La Boca to elegant Recoleta, from passionate tango shows to world-class dining, this cosmopolitan capital offers the perfect blend of culture, history, and Argentine charm. Let our AI-powered planner help you discover the best experiences this incredible destination has to offer.',
    imageUrl: 'https://ouqeoizufbofdqbuiwvx.supabase.co/storage/v1/object/public/destinations//Buenos%20Aires.webp',
    tourCategories: [
      { name: 'Tango Tours', hasGuide: true },
      { name: 'Historic Tours', hasGuide: true },
      { name: 'Food & Wine Tours', hasGuide: true },
      { name: 'Cultural Tours', hasGuide: true },
      { name: 'Architecture Tours', hasGuide: true },
      { name: 'Neighborhood Tours', hasGuide: true }
    ],
    seo: {
      title: 'Buenos Aires Tours & Excursions - Top-Rated Activities & Adventures',
      description: 'Discover top-rated Buenos Aires tours, excursions, and activities powered by AI. From tango experiences to cultural tours, find the perfect way to explore Argentina\'s vibrant capital.',
      keywords: 'Buenos Aires tours, tango tours, cultural tours, things to do in Buenos Aires',
      primaryKeyword: 'Buenos Aires tours',
      secondaryKeywords: [
        'Buenos Aires tango tours',
        'Buenos Aires historic tours',
        'Buenos Aires food tours',
        'Buenos Aires cultural tours',
        'Buenos Aires architecture tours',
        'Things to do in Buenos Aires'
      ]
    },
    whyVisit: [
      'World-famous tango culture and shows',
      'Beautiful European-style architecture',
      'Excellent steak and wine culture',
      'Vibrant neighborhoods and culture',
      'Rich history and cultural heritage',
      'Perfect blend of Europe and Latin America'
    ],
    bestTimeToVisit: {
      weather: 'Buenos Aires enjoys a temperate climate with four distinct seasons. Average temperatures range from 50°F (10°C) in winter to 80°F (27°C) in summer.',
      bestMonths: 'March to May and September to November offer the best weather with pleasant temperatures.',
      peakSeason: 'December to February brings peak tourist season with warm weather, larger crowds, and higher prices.',
      offSeason: 'June to August offers lower prices and fewer crowds, though with cooler temperatures.'
    },
    gettingAround: 'Excellent public transportation including metro and buses. Walking is perfect for exploring neighborhoods, and organized tours include transportation.',
    highlights: [
      'La Boca - Colorful historic neighborhood',
      'Recoleta Cemetery - Famous cemetery',
      'Tango Shows - Traditional dance performances',
      'San Telmo - Historic neighborhood',
      'Puerto Madero - Modern waterfront',
      'Plaza de Mayo - Historic square'
    ]
  },
  {
    id: 'mendoza',
    name: 'Mendoza',
    fullName: 'Mendoza',
    country: 'Argentina',
    category: 'South America',
    briefDescription: 'Wine paradise, Andean backdrop, and outdoor adventures — Mendoza is Argentina\'s premier wine region.',
    heroDescription: 'Welcome to Mendoza, where world-class Malbec wines meet stunning Andean landscapes and endless outdoor adventures. From prestigious wineries to mountain excursions, from wine tastings to adventure sports, this wine paradise offers the perfect blend of luxury, nature, and Argentine hospitality. Let our AI-powered planner help you discover the best experiences this incredible destination has to offer.',
    imageUrl: 'https://ouqeoizufbofdqbuiwvx.supabase.co/storage/v1/object/public/destinations//Mendoza.jpeg',
    tourCategories: [
      { name: 'Wine Tours', hasGuide: true },
      { name: 'Vineyard Tours', hasGuide: true },
      { name: 'Adventure Tours', hasGuide: true },
      { name: 'Mountain Tours', hasGuide: true },
      { name: 'Food & Wine Tours', hasGuide: true },
      { name: 'Scenic Tours', hasGuide: true }
    ],
    seo: {
      title: 'Mendoza Tours & Excursions - Top-Rated Activities & Adventures',
      description: 'Discover top-rated Mendoza tours, excursions, and activities powered by AI. From wine tours to adventure experiences, find the perfect way to explore Argentina\'s premier wine region.',
      keywords: 'Mendoza tours, wine tours, vineyard tours, things to do in Mendoza',
      primaryKeyword: 'Mendoza tours',
      secondaryKeywords: [
        'Mendoza wine tours',
        'Mendoza vineyard tours',
        'Mendoza adventure tours',
        'Mendoza mountain tours',
        'Mendoza food tours',
        'Things to do in Mendoza'
      ]
    },
    whyVisit: [
      'World-famous Malbec wine region',
      'Stunning Andean mountain scenery',
      'Excellent wine tasting experiences',
      'Adventure sports and outdoor activities',
      'Beautiful vineyard landscapes',
      'Perfect blend of luxury and adventure'
    ],
    bestTimeToVisit: {
      weather: 'Mendoza enjoys a semi-arid climate with hot summers and cool winters. Average temperatures range from 45°F (7°C) in winter to 85°F (29°C) in summer.',
      bestMonths: 'March to May and September to November offer the best weather with pleasant temperatures.',
      peakSeason: 'December to February brings peak tourist season with hot weather, larger crowds, and higher prices.',
      offSeason: 'June to August offers lower prices and fewer crowds, though with cooler temperatures.'
    },
    gettingAround: 'Wine tours typically include transportation. Renting a car is popular for exploring independently, and organized tours provide comprehensive experiences.',
    highlights: [
      'Wine Tastings - World-class Malbec wines',
      'Vineyard Tours - Beautiful wine estates',
      'Aconcagua - Highest peak in Americas',
      'Adventure Sports - Mountain activities',
      'Wine Routes - Scenic wine regions',
      'Andean Landscapes - Stunning mountain views'
    ]
  },
  {
    id: 'bariloche',
    name: 'Bariloche',
    fullName: 'Bariloche',
    country: 'Argentina',
    category: 'South America',
    briefDescription: 'Alpine paradise, lake district beauty, and outdoor adventures — Bariloche is Argentina\'s mountain gem.',
    heroDescription: 'Welcome to Bariloche, where snow-capped peaks meet crystal-clear lakes and endless outdoor adventures await in the heart of Patagonia. From world-class skiing to scenic lake cruises, from chocolate shops to mountain hiking, this alpine paradise offers the perfect blend of adventure, nature, and Swiss-inspired charm. Let our AI-powered planner help you discover the best experiences this incredible destination has to offer.',
    imageUrl: 'https://ouqeoizufbofdqbuiwvx.supabase.co/storage/v1/object/public/destinations//Bariloche.jpg',
    tourCategories: [
      { name: 'Ski Tours', hasGuide: true },
      { name: 'Lake Tours', hasGuide: true },
      { name: 'Adventure Tours', hasGuide: true },
      { name: 'Mountain Tours', hasGuide: true },
      { name: 'Scenic Tours', hasGuide: true },
      { name: 'Chocolate Tours', hasGuide: true }
    ],
    seo: {
      title: 'Bariloche Tours & Excursions - Top-Rated Activities & Adventures',
      description: 'Discover top-rated Bariloche tours, excursions, and activities powered by AI. From skiing to lake adventures, find the perfect way to explore Argentina\'s mountain paradise.',
      keywords: 'Bariloche tours, ski tours, lake tours, things to do in Bariloche',
      primaryKeyword: 'Bariloche tours',
      secondaryKeywords: [
        'Bariloche ski tours',
        'Bariloche lake tours',
        'Bariloche adventure tours',
        'Bariloche mountain tours',
        'Bariloche chocolate tours',
        'Things to do in Bariloche'
      ]
    },
    whyVisit: [
      'World-class skiing and winter sports',
      'Stunning lake and mountain scenery',
      'Excellent outdoor adventure activities',
      'Famous chocolate and Swiss culture',
      'Beautiful Patagonian landscapes',
      'Perfect blend of adventure and relaxation'
    ],
    bestTimeToVisit: {
      weather: 'Bariloche enjoys a cool mountain climate with four distinct seasons. Average temperatures range from 30°F (-1°C) in winter to 70°F (21°C) in summer.',
      bestMonths: 'December to March for summer activities, June to September for skiing.',
      peakSeason: 'July to August brings peak ski season with cold weather, larger crowds, and higher prices.',
      offSeason: 'April to May and October to November offer lower prices and fewer crowds.'
    },
    gettingAround: 'Walking is perfect for exploring the town center. Organized tours include transportation, and renting a car is popular for exploring the region.',
    highlights: [
      'Cerro Catedral - World-class ski resort',
      'Lake Nahuel Huapi - Beautiful lake',
      'Chocolate Shops - Famous local treats',
      'Mountain Hiking - Scenic trails',
      'Scenic Drives - Circuito Chico',
      'Swiss Architecture - Alpine charm'
    ]
  },
  {
    id: 'santiago',
    name: 'Santiago',
    fullName: 'Santiago',
    country: 'Chile',
    category: 'South America',
    briefDescription: 'Andean capital, modern sophistication, and cultural richness — Santiago is Chile\'s dynamic heart.',
    heroDescription: 'Welcome to Santiago, where modern skyscrapers meet historic neighborhoods and the majestic Andes provide a stunning backdrop to this dynamic capital. From the historic Plaza de Armas to trendy Bellavista, from wine tours to mountain excursions, this cosmopolitan city offers the perfect blend of history, culture, and Chilean hospitality. Let our AI-powered planner help you discover the best experiences this incredible destination has to offer.',
    imageUrl: 'https://ouqeoizufbofdqbuiwvx.supabase.co/storage/v1/object/public/destinations//Santiago.webp',
    tourCategories: [
      { name: 'City Tours', hasGuide: true },
      { name: 'Wine Tours', hasGuide: true },
      { name: 'Mountain Tours', hasGuide: true },
      { name: 'Cultural Tours', hasGuide: true },
      { name: 'Food Tours', hasGuide: true },
      { name: 'Historic Tours', hasGuide: true }
    ],
    seo: {
      title: 'Santiago Tours & Excursions - Top-Rated Activities & Adventures',
      description: 'Discover top-rated Santiago tours, excursions, and activities powered by AI. From city tours to wine experiences, find the perfect way to explore Chile\'s dynamic capital.',
      keywords: 'Santiago tours, city tours, wine tours, things to do in Santiago',
      primaryKeyword: 'Santiago tours',
      secondaryKeywords: [
        'Santiago city tours',
        'Santiago wine tours',
        'Santiago mountain tours',
        'Santiago cultural tours',
        'Santiago food tours',
        'Things to do in Santiago'
      ]
    },
    whyVisit: [
      'Stunning Andean mountain backdrop',
      'Excellent wine culture and tours',
      'Modern city with historic charm',
      'Vibrant cultural scene',
      'Great food and restaurant culture',
      'Perfect blend of urban and nature'
    ],
    bestTimeToVisit: {
      weather: 'Santiago enjoys a Mediterranean climate with hot, dry summers and cool, wet winters. Average temperatures range from 45°F (7°C) in winter to 85°F (29°C) in summer.',
      bestMonths: 'March to May and September to November offer the best weather with pleasant temperatures.',
      peakSeason: 'December to February brings peak tourist season with hot weather, larger crowds, and higher prices.',
      offSeason: 'June to August offers lower prices and fewer crowds, though with rain.'
    },
    gettingAround: 'Excellent public transportation including metro and buses. Walking is perfect for exploring the city center, and organized tours include transportation.',
    highlights: [
      'Plaza de Armas - Historic main square',
      'Bellavista - Trendy neighborhood',
      'Wine Tours - Famous Chilean wines',
      'Cerro San Cristóbal - City viewpoint',
      'La Moneda Palace - Government building',
      'Andes Mountains - Stunning backdrop'
    ]
  },
  {
    id: 'patagonia',
    name: 'Patagonia',
    fullName: 'Patagonia',
    country: 'Chile',
    category: 'South America',
    briefDescription: 'Wilderness paradise, dramatic landscapes, and epic adventures — Patagonia is nature\'s masterpiece.',
    heroDescription: 'Welcome to Patagonia, where jagged peaks meet pristine glaciers and endless wilderness adventures await in one of the world\'s most spectacular regions. From the iconic Torres del Paine to the Perito Moreno Glacier, from epic hiking trails to wildlife encounters, this wilderness paradise offers the perfect blend of adventure, nature, and untouched beauty. Let our AI-powered planner help you discover the best experiences this incredible destination has to offer.',
    imageUrl: 'https://ouqeoizufbofdqbuiwvx.supabase.co/storage/v1/object/public/destinations//Patagonia.jpeg',
    tourCategories: [
      { name: 'Hiking Tours', hasGuide: true },
      { name: 'Glacier Tours', hasGuide: true },
      { name: 'Wildlife Tours', hasGuide: true },
      { name: 'Adventure Tours', hasGuide: true },
      { name: 'Scenic Tours', hasGuide: true },
      { name: 'Photography Tours', hasGuide: true }
    ],
    seo: {
      title: 'Patagonia Tours & Excursions - Top-Rated Activities & Adventures',
      description: 'Discover top-rated Patagonia tours, excursions, and activities powered by AI. From hiking to glacier experiences, find the perfect way to explore this wilderness paradise.',
      keywords: 'Patagonia tours, hiking tours, glacier tours, things to do in Patagonia',
      primaryKeyword: 'Patagonia tours',
      secondaryKeywords: [
        'Patagonia hiking tours',
        'Patagonia glacier tours',
        'Patagonia wildlife tours',
        'Patagonia adventure tours',
        'Patagonia photography tours',
        'Things to do in Patagonia'
      ]
    },
    whyVisit: [
      'Iconic Torres del Paine National Park',
      'Spectacular glaciers and ice fields',
      'World-class hiking and trekking',
      'Incredible wildlife and nature',
      'Dramatic mountain landscapes',
      'Perfect blend of adventure and beauty'
    ],
    bestTimeToVisit: {
      weather: 'Patagonia has a cool, windy climate with unpredictable weather. Average temperatures range from 30°F (-1°C) in winter to 60°F (16°C) in summer.',
      bestMonths: 'October to April offers the best weather for outdoor activities.',
      peakSeason: 'December to February brings peak tourist season with better weather, larger crowds, and higher prices.',
      offSeason: 'May to September offers lower prices and fewer crowds, though with harsh weather.'
    },
    gettingAround: 'Organized tours are recommended for exploring Patagonia. Transportation is included in most tours, and the region requires careful planning.',
    highlights: [
      'Torres del Paine - Iconic national park',
      'Perito Moreno Glacier - Spectacular glacier',
      'W Trek - Famous hiking trail',
      'Wildlife Watching - Guanacos and condors',
      'Glacier Cruises - Ice field experiences',
      'Mountain Landscapes - Dramatic scenery'
    ]
  },
  {
    id: 'quito',
    name: 'Quito',
    fullName: 'Quito',
    country: 'Ecuador',
    category: 'South America',
    briefDescription: 'Andean treasure, colonial heritage, and cultural richness — Quito is Ecuador\'s historic heart.',
    heroDescription: 'Welcome to Quito, where colonial architecture meets Andean culture in the world\'s highest capital city. From the UNESCO World Heritage Old Town to the Equator line, from historic churches to vibrant markets, this Andean treasure offers the perfect blend of history, culture, and Ecuadorian traditions. Let our AI-powered planner help you discover the best experiences this incredible destination has to offer.',
    imageUrl: 'https://ouqeoizufbofdqbuiwvx.supabase.co/storage/v1/object/public/destinations//Quito.jpeg',
    tourCategories: [
      { name: 'Historic Tours', hasGuide: true },
      { name: 'Cultural Tours', hasGuide: true },
      { name: 'Equator Tours', hasGuide: true },
      { name: 'Church Tours', hasGuide: true },
      { name: 'Market Tours', hasGuide: true },
      { name: 'Architecture Tours', hasGuide: true }
    ],
    seo: {
      title: 'Quito Tours & Excursions - Top-Rated Activities & Adventures',
      description: 'Discover top-rated Quito tours, excursions, and activities powered by AI. From historic tours to equator experiences, find the perfect way to explore Ecuador\'s historic capital.',
      keywords: 'Quito tours, historic tours, equator tours, things to do in Quito',
      primaryKeyword: 'Quito tours',
      secondaryKeywords: [
        'Quito historic tours',
        'Quito equator tours',
        'Quito cultural tours',
        'Quito church tours',
        'Quito market tours',
        'Things to do in Quito'
      ]
    },
    whyVisit: [
      'UNESCO World Heritage Old Town',
      'Famous Equator line monument',
      'Beautiful colonial architecture',
      'Rich cultural heritage',
      'Excellent Andean cuisine',
      'Perfect blend of history and culture'
    ],
    bestTimeToVisit: {
      weather: 'Quito enjoys a mild highland climate with consistent temperatures year-round. Average temperatures range from 50°F (10°C) to 70°F (21°C).',
      bestMonths: 'June to September offers the best weather with dry conditions.',
      peakSeason: 'June to September brings peak tourist season with ideal weather, larger crowds, and higher prices.',
      offSeason: 'October to May offers lower prices and fewer crowds, though with more rain.'
    },
    gettingAround: 'Walking is perfect for exploring the Old Town. Public transportation and taxis connect different areas, and organized tours include transportation.',
    highlights: [
      'Old Town - UNESCO World Heritage site',
      'Equator Monument - Middle of the world',
      'La Compañía Church - Stunning church',
      'Plaza Grande - Historic main square',
      'TelefériQo - City viewpoint',
      'Indigenous Markets - Local culture'
    ]
  },
  {
    id: 'galapagos-islands',
    name: 'Galápagos Islands',
    fullName: 'Galápagos Islands',
    country: 'Ecuador',
    category: 'South America',
    briefDescription: 'Evolutionary wonder, wildlife paradise, and natural laboratory — Galápagos is nature\'s masterpiece.',
    heroDescription: 'Welcome to the Galápagos Islands, where Charles Darwin\'s theory of evolution comes to life among unique wildlife and pristine ecosystems. From giant tortoises to marine iguanas, from snorkeling with sea lions to hiking volcanic landscapes, this evolutionary wonder offers the perfect blend of wildlife, adventure, and natural history. Let our AI-powered planner help you discover the best experiences this incredible destination has to offer.',
    imageUrl: 'https://ouqeoizufbofdqbuiwvx.supabase.co/storage/v1/object/public/destinations//Galapagos%20Islands.jpeg',
    tourCategories: [
      { name: 'Wildlife Tours', hasGuide: true },
      { name: 'Snorkeling Tours', hasGuide: true },
      { name: 'Island Tours', hasGuide: true },
      { name: 'Cruise Tours', hasGuide: true },
      { name: 'Adventure Tours', hasGuide: true },
      { name: 'Photography Tours', hasGuide: true }
    ],
    seo: {
      title: 'Galápagos Islands Tours & Excursions - Top-Rated Activities & Adventures',
      description: 'Discover top-rated Galápagos Islands tours, excursions, and activities powered by AI. From wildlife encounters to island adventures, find the perfect way to explore this natural wonder.',
      keywords: 'Galápagos Islands tours, wildlife tours, snorkeling tours, things to do in Galápagos',
      primaryKeyword: 'Galápagos Islands tours',
      secondaryKeywords: [
        'Galápagos wildlife tours',
        'Galápagos snorkeling tours',
        'Galápagos island tours',
        'Galápagos cruise tours',
        'Galápagos adventure tours',
        'Things to do in Galápagos'
      ]
    },
    whyVisit: [
      'Unique wildlife found nowhere else',
      'Charles Darwin\'s evolutionary laboratory',
      'World-class snorkeling and diving',
      'Pristine natural environments',
      'Incredible biodiversity',
      'Perfect blend of science and adventure'
    ],
    bestTimeToVisit: {
      weather: 'The Galápagos has a subtropical climate with two seasons. Average temperatures range from 70°F (21°C) to 85°F (29°C) year-round.',
      bestMonths: 'June to December offers the best wildlife viewing and weather.',
      peakSeason: 'June to August and December to January brings peak tourist season with ideal conditions, larger crowds, and higher prices.',
      offSeason: 'February to May offers lower prices and fewer crowds, though with warmer, wetter weather.'
    },
    gettingAround: 'Organized tours and cruises are the best way to explore the Galápagos. Transportation between islands is typically included in tour packages.',
    highlights: [
      'Giant Tortoises - Iconic Galápagos wildlife',
      'Marine Iguanas - Unique marine reptiles',
      'Snorkeling - Crystal-clear waters',
      'Island Hiking - Volcanic landscapes',
      'Wildlife Photography - Unique species',
      'Charles Darwin Research Station - Conservation center'
    ]
  },
  {
    id: 'belize-city',
    name: 'Belize City',
    fullName: 'Belize City',
    country: 'Belize',
    category: 'South America',
    briefDescription: 'Caribbean gateway, cultural melting pot, and historic charm — Belize City is Belize\'s vibrant heart.',
    heroDescription: 'Welcome to Belize City, where Caribbean culture meets Central American heritage and historic architecture tells stories of colonial times. From the historic Swing Bridge to vibrant markets, from cultural experiences to gateway adventures, this coastal city offers the perfect blend of history, culture, and Belizean hospitality. Let our AI-powered planner help you discover the best experiences this incredible destination has to offer.',
    imageUrl: 'https://ouqeoizufbofdqbuiwvx.supabase.co/storage/v1/object/public/destinations//Belize%20City.webp',
    tourCategories: [
      { name: 'Historic Tours', hasGuide: true },
      { name: 'Cultural Tours', hasGuide: true },
      { name: 'Gateway Tours', hasGuide: true },
      { name: 'Market Tours', hasGuide: true },
      { name: 'Architecture Tours', hasGuide: true },
      { name: 'Food Tours', hasGuide: true }
    ],
    seo: {
      title: 'Belize City Tours & Excursions - Top-Rated Activities & Adventures',
      description: 'Discover top-rated Belize City tours, excursions, and activities powered by AI. From historic tours to cultural experiences, find the perfect way to explore Belize\'s vibrant capital.',
      keywords: 'Belize City tours, historic tours, cultural tours, things to do in Belize City',
      primaryKeyword: 'Belize City tours',
      secondaryKeywords: [
        'Belize City historic tours',
        'Belize City cultural tours',
        'Belize City gateway tours',
        'Belize City market tours',
        'Belize City food tours',
        'Things to do in Belize City'
      ]
    },
    whyVisit: [
      'Historic colonial architecture',
      'Rich cultural diversity',
      'Gateway to Belize adventures',
      'Vibrant local markets',
      'Caribbean cultural influences',
      'Perfect blend of history and culture'
    ],
    bestTimeToVisit: {
      weather: 'Belize City enjoys a tropical climate with hot, humid weather year-round. Average temperatures range from 75°F (24°C) to 85°F (29°C).',
      bestMonths: 'December to April offers the best weather with dry conditions.',
      peakSeason: 'December to April brings peak tourist season with ideal weather, larger crowds, and higher prices.',
      offSeason: 'May to November offers lower prices and fewer crowds, though with more rain.'
    },
    gettingAround: 'Walking is perfect for exploring the historic center. Taxis and organized tours provide transportation to other areas.',
    highlights: [
      'Swing Bridge - Historic landmark',
      'St. John\'s Cathedral - Oldest church',
      'Museum of Belize - Cultural history',
      'Local Markets - Vibrant culture',
      'Historic Architecture - Colonial charm',
      'Caribbean Culture - Local traditions'
    ]
  },
  {
    id: 'san-pedro',
    name: 'San Pedro',
    fullName: 'San Pedro',
    country: 'Belize',
    category: 'South America',
    briefDescription: 'Island paradise, beach bliss, and Caribbean charm — San Pedro is Belize\'s beach gem.',
    heroDescription: 'Welcome to San Pedro, where pristine beaches meet crystal-clear Caribbean waters and laid-back island life creates the perfect tropical escape. From beautiful beaches to water activities, from local culture to island adventures, this beach paradise offers the perfect blend of relaxation, adventure, and Caribbean charm. Let our AI-powered planner help you discover the best experiences this incredible destination has to offer.',
    imageUrl: 'https://ouqeoizufbofdqbuiwvx.supabase.co/storage/v1/object/public/destinations//San%20Pedro.jpg',
    tourCategories: [
      { name: 'Beach Tours', hasGuide: true },
      { name: 'Water Tours', hasGuide: true },
      { name: 'Island Tours', hasGuide: true },
      { name: 'Snorkeling Tours', hasGuide: true },
      { name: 'Adventure Tours', hasGuide: true },
      { name: 'Cultural Tours', hasGuide: true }
    ],
    seo: {
      title: 'San Pedro Tours & Excursions - Top-Rated Activities & Adventures',
      description: 'Discover top-rated San Pedro tours, excursions, and activities powered by AI. From beach tours to water adventures, find the perfect way to explore Belize\'s island paradise.',
      keywords: 'San Pedro tours, beach tours, water tours, things to do in San Pedro',
      primaryKeyword: 'San Pedro tours',
      secondaryKeywords: [
        'San Pedro beach tours',
        'San Pedro water tours',
        'San Pedro island tours',
        'San Pedro snorkeling tours',
        'San Pedro adventure tours',
        'Things to do in San Pedro'
      ]
    },
    whyVisit: [
      'Pristine Caribbean beaches',
      'Crystal-clear turquoise waters',
      'Excellent water activities',
      'Laid-back island atmosphere',
      'Beautiful coral reefs',
      'Perfect blend of relaxation and adventure'
    ],
    bestTimeToVisit: {
      weather: 'San Pedro enjoys a tropical climate with hot, humid weather year-round. Average temperatures range from 75°F (24°C) to 85°F (29°C).',
      bestMonths: 'December to April offers the best weather with dry conditions.',
      peakSeason: 'December to April brings peak tourist season with ideal weather, larger crowds, and higher prices.',
      offSeason: 'May to November offers lower prices and fewer crowds, though with more rain.'
    },
    gettingAround: 'Walking and golf carts are the main ways to get around the island. Organized tours include transportation for water activities.',
    highlights: [
      'Beautiful Beaches - Pristine shorelines',
      'Coral Reefs - World-class snorkeling',
      'Water Activities - Swimming and diving',
      'Island Culture - Local traditions',
      'Beach Bars - Tropical atmosphere',
      'Marine Life - Rich biodiversity'
    ]
  },
  {
    id: 'antigua',
    name: 'Antigua',
    fullName: 'Antigua',
    country: 'Guatemala',
    category: 'South America',
    briefDescription: 'Colonial treasure, volcanic backdrop, and cultural heritage — Antigua is Guatemala\'s historic gem.',
    heroDescription: 'Welcome to Antigua, where perfectly preserved colonial architecture meets dramatic volcanic landscapes in this UNESCO World Heritage city. From historic churches to cobblestone streets, from coffee plantations to cultural experiences, this colonial treasure offers the perfect blend of history, culture, and Guatemalan traditions. Let our AI-powered planner help you discover the best experiences this incredible destination has to offer.',
    imageUrl: 'https://ouqeoizufbofdqbuiwvx.supabase.co/storage/v1/object/public/destinations//Antigua.jpg',
    tourCategories: [
      { name: 'Historic Tours', hasGuide: true },
      { name: 'Cultural Tours', hasGuide: true },
      { name: 'Coffee Tours', hasGuide: true },
      { name: 'Volcano Tours', hasGuide: true },
      { name: 'Architecture Tours', hasGuide: true },
      { name: 'Market Tours', hasGuide: true }
    ],
    seo: {
      title: 'Antigua Tours & Excursions - Top-Rated Activities & Adventures',
      description: 'Discover top-rated Antigua tours, excursions, and activities powered by AI. From historic tours to volcano experiences, find the perfect way to explore Guatemala\'s colonial gem.',
      keywords: 'Antigua tours, historic tours, volcano tours, things to do in Antigua',
      primaryKeyword: 'Antigua tours',
      secondaryKeywords: [
        'Antigua historic tours',
        'Antigua volcano tours',
        'Antigua cultural tours',
        'Antigua coffee tours',
        'Antigua architecture tours',
        'Things to do in Antigua'
      ]
    },
    whyVisit: [
      'UNESCO World Heritage colonial architecture',
      'Dramatic volcanic landscapes',
      'Rich Mayan and Spanish heritage',
      'Excellent coffee culture',
      'Beautiful cobblestone streets',
      'Perfect blend of history and culture'
    ],
    bestTimeToVisit: {
      weather: 'Antigua enjoys a pleasant highland climate with mild temperatures year-round. Average temperatures range from 60°F (16°C) to 75°F (24°C).',
      bestMonths: 'November to April offers the best weather with dry conditions.',
      peakSeason: 'December to March brings peak tourist season with ideal weather, larger crowds, and higher prices.',
      offSeason: 'May to October offers lower prices and fewer crowds, though with more rain.'
    },
    gettingAround: 'Walking is perfect for exploring the historic center. Organized tours include transportation for volcano and coffee tours.',
    highlights: [
      'Historic Churches - Colonial architecture',
      'Volcano Views - Dramatic landscapes',
      'Coffee Plantations - World-class coffee',
      'Cobblestone Streets - Historic charm',
      'Local Markets - Cultural experiences',
      'Spanish Architecture - Colonial heritage'
    ]
  },
  {
    id: 'lake-atitlan',
    name: 'Lake Atitlán',
    fullName: 'Lake Atitlán',
    country: 'Guatemala',
    category: 'South America',
    briefDescription: 'Highland paradise, volcanic beauty, and Mayan culture — Lake Atitlán is Guatemala\'s natural wonder.',
    heroDescription: 'Welcome to Lake Atitlán, where three majestic volcanoes frame a pristine highland lake and traditional Mayan villages dot the shores. From scenic boat rides to cultural experiences, from hiking trails to indigenous markets, this highland paradise offers the perfect blend of nature, culture, and Guatemalan traditions. Let our AI-powered planner help you discover the best experiences this incredible destination has to offer.',
    imageUrl: 'https://ouqeoizufbofdqbuiwvx.supabase.co/storage/v1/object/public/destinations//Lake%20Atitlan.jpeg',
    tourCategories: [
      { name: 'Lake Tours', hasGuide: true },
      { name: 'Cultural Tours', hasGuide: true },
      { name: 'Village Tours', hasGuide: true },
      { name: 'Hiking Tours', hasGuide: true },
      { name: 'Boat Tours', hasGuide: true },
      { name: 'Market Tours', hasGuide: true }
    ],
    seo: {
      title: 'Lake Atitlán Tours & Excursions - Top-Rated Activities & Adventures',
      description: 'Discover top-rated Lake Atitlán tours, excursions, and activities powered by AI. From lake tours to cultural experiences, find the perfect way to explore Guatemala\'s natural wonder.',
      keywords: 'Lake Atitlán tours, lake tours, cultural tours, things to do in Lake Atitlán',
      primaryKeyword: 'Lake Atitlán tours',
      secondaryKeywords: [
        'Lake Atitlán lake tours',
        'Lake Atitlán cultural tours',
        'Lake Atitlán village tours',
        'Lake Atitlán hiking tours',
        'Lake Atitlán boat tours',
        'Things to do in Lake Atitlán'
      ]
    },
    whyVisit: [
      'Stunning volcanic lake scenery',
      'Traditional Mayan villages',
      'Rich indigenous culture',
      'Excellent hiking opportunities',
      'Beautiful highland landscapes',
      'Perfect blend of nature and culture'
    ],
    bestTimeToVisit: {
      weather: 'Lake Atitlán enjoys a pleasant highland climate with mild temperatures year-round. Average temperatures range from 60°F (16°C) to 75°F (24°C).',
      bestMonths: 'November to April offers the best weather with dry conditions.',
      peakSeason: 'December to March brings peak tourist season with ideal weather, larger crowds, and higher prices.',
      offSeason: 'May to October offers lower prices and fewer crowds, though with more rain.'
    },
    gettingAround: 'Boat transportation connects the villages around the lake. Walking and organized tours are the best ways to explore the area.',
    highlights: [
      'Volcanic Views - Three majestic volcanoes',
      'Mayan Villages - Traditional culture',
      'Lake Cruises - Scenic boat rides',
      'Hiking Trails - Mountain adventures',
      'Indigenous Markets - Local crafts',
      'Highland Landscapes - Beautiful scenery'
    ]
  },
  {
    id: 'tokyo',
    name: 'Tokyo',
    fullName: 'Tokyo',
    country: 'Japan',
    category: 'Asia-Pacific',
    briefDescription: 'Ultra-modern metropolis, ancient traditions, and endless innovation — Tokyo is Japan\'s dynamic heart.',
    relatedGuides: ['japan-cherry-blossom-travel'],
    heroDescription: 'Welcome to Tokyo, where cutting-edge technology meets centuries-old traditions in the world\'s most populous metropolis. From the neon-lit streets of Shibuya to the serene temples of Asakusa, from world-class sushi to bullet train adventures, this incredible city offers the perfect blend of past, present, and future. Let our AI-powered planner help you discover the best experiences this incredible destination has to offer.',
    imageUrl: 'https://ouqeoizufbofdqbuiwvx.supabase.co/storage/v1/object/public/destinations//tokyo.webp',
    tourCategories: [
      { name: 'City Tours', hasGuide: true },
      { name: 'Cultural Tours', hasGuide: true },
      { name: 'Food Tours', hasGuide: true },
      { name: 'Technology Tours', hasGuide: true },
      { name: 'Temple Tours', hasGuide: true },
      { name: 'Shopping Tours', hasGuide: true }
    ],
    seo: {
      title: 'Tokyo Tours & Excursions - Top-Rated Activities & Adventures',
      description: 'Discover top-rated Tokyo tours, excursions, and activities powered by AI. From city tours to cultural experiences, find the perfect way to explore Japan\'s dynamic capital.',
      keywords: 'Tokyo tours, city tours, cultural tours, things to do in Tokyo',
      primaryKeyword: 'Tokyo tours',
      secondaryKeywords: [
        'Tokyo city tours',
        'Tokyo cultural tours',
        'Tokyo food tours',
        'Tokyo temple tours',
        'Tokyo shopping tours',
        'Things to do in Tokyo'
      ]
    },
    whyVisit: [
      'World\'s most advanced metropolis',
      'Perfect blend of tradition and innovation',
      'Exceptional food and dining culture',
      'Efficient public transportation',
      'Rich cultural heritage',
      'Endless entertainment options'
    ],
    bestTimeToVisit: {
      weather: 'Tokyo enjoys four distinct seasons. Spring (March-May) brings cherry blossoms, summer (June-August) is hot and humid, autumn (September-November) is mild, and winter (December-February) is cool.',
      bestMonths: 'March to May and September to November offer the best weather with pleasant temperatures.',
      peakSeason: 'March to May brings cherry blossom season with beautiful weather, larger crowds, and higher prices.',
      offSeason: 'June to August offers lower prices but hot, humid weather with occasional typhoons.'
    },
    gettingAround: 'Excellent public transportation including metro, trains, and buses. Walking is perfect for exploring neighborhoods, and organized tours include transportation.',
    highlights: [
      'Shibuya Crossing - World\'s busiest intersection',
      'Senso-ji Temple - Ancient Buddhist temple',
      'Tsukiji Market - Famous fish market',
      'Tokyo Skytree - Tallest tower in Japan',
      'Harajuku - Fashion and youth culture',
      'Imperial Palace - Historic royal residence'
    ]
  },
  {
    id: 'kyoto',
    name: 'Kyoto',
    fullName: 'Kyoto',
    country: 'Japan',
    category: 'Asia-Pacific',
    briefDescription: 'Ancient capital, cultural treasure, and spiritual heart — Kyoto is Japan\'s traditional soul.',
    relatedGuides: ['japan-cherry-blossom-travel'],
    heroDescription: 'Welcome to Kyoto, where over a thousand years of Japanese history and culture come alive in this former imperial capital. From stunning temples and shrines to traditional tea ceremonies, from beautiful gardens to geisha districts, this cultural treasure offers the perfect blend of tradition, spirituality, and Japanese heritage. Let our AI-powered planner help you discover the best experiences this incredible destination has to offer.',
    imageUrl: 'https://ouqeoizufbofdqbuiwvx.supabase.co/storage/v1/object/public/destinations//kyoto.jpeg',
    tourCategories: [
      { name: 'Temple Tours', hasGuide: true },
      { name: 'Cultural Tours', hasGuide: true },
      { name: 'Garden Tours', hasGuide: true },
      { name: 'Tea Ceremony Tours', hasGuide: true },
      { name: 'Historic Tours', hasGuide: true },
      { name: 'Photography Tours', hasGuide: true }
    ],
    seo: {
      title: 'Kyoto Tours & Excursions - Top-Rated Activities & Adventures',
      description: 'Discover top-rated Kyoto tours, excursions, and activities powered by AI. From temple tours to cultural experiences, find the perfect way to explore Japan\'s cultural heart.',
      keywords: 'Kyoto tours, temple tours, cultural tours, things to do in Kyoto',
      primaryKeyword: 'Kyoto tours',
      secondaryKeywords: [
        'Kyoto temple tours',
        'Kyoto cultural tours',
        'Kyoto garden tours',
        'Kyoto tea ceremony tours',
        'Kyoto historic tours',
        'Things to do in Kyoto'
      ]
    },
    whyVisit: [
      'Over 1,600 Buddhist temples',
      '400 Shinto shrines',
      'Traditional Japanese culture',
      'Beautiful seasonal gardens',
      'UNESCO World Heritage sites',
      'Perfect blend of history and spirituality'
    ],
    bestTimeToVisit: {
      weather: 'Kyoto enjoys four distinct seasons. Spring (March-May) brings cherry blossoms, summer (June-August) is hot and humid, autumn (September-November) has beautiful fall colors, and winter (December-February) is cool.',
      bestMonths: 'March to May and October to November offer the best weather and scenery.',
      peakSeason: 'March to May brings cherry blossom season with beautiful weather, larger crowds, and higher prices.',
      offSeason: 'June to August offers lower prices but hot, humid weather.'
    },
    gettingAround: 'Excellent public transportation including buses and trains. Walking and cycling are perfect for exploring temples, and organized tours include transportation.',
    highlights: [
      'Fushimi Inari Shrine - Famous red torii gates',
      'Kinkaku-ji - Golden Pavilion',
      'Arashiyama Bamboo Grove - Stunning bamboo forest',
      'Gion District - Traditional geisha area',
      'Kiyomizu-dera - Historic temple',
      'Ryoan-ji - Famous rock garden'
    ]
  },
  {
    id: 'osaka',
    name: 'Osaka',
    fullName: 'Osaka',
    country: 'Japan',
    category: 'Asia-Pacific',
    briefDescription: 'Food paradise, modern energy, and friendly culture — Osaka is Japan\'s culinary capital.',
    relatedGuides: ['japan-cherry-blossom-travel'],
    heroDescription: 'Welcome to Osaka, where incredible street food meets modern entertainment and the warmest hospitality in Japan. From the famous Dotonbori district to historic Osaka Castle, from takoyaki to okonomiyaki, this food paradise offers the perfect blend of cuisine, culture, and Japanese urban life. Let our AI-powered planner help you discover the best experiences this incredible destination has to offer.',
    imageUrl: 'https://ouqeoizufbofdqbuiwvx.supabase.co/storage/v1/object/public/destinations//Osaka.jpg',
    tourCategories: [
      { name: 'Food Tours', hasGuide: true },
      { name: 'City Tours', hasGuide: true },
      { name: 'Cultural Tours', hasGuide: true },
      { name: 'Castle Tours', hasGuide: true },
      { name: 'Entertainment Tours', hasGuide: true },
      { name: 'Shopping Tours', hasGuide: true }
    ],
    seo: {
      title: 'Osaka Tours & Excursions - Top-Rated Activities & Adventures',
      description: 'Discover top-rated Osaka tours, excursions, and activities powered by AI. From food tours to cultural experiences, find the perfect way to explore Japan\'s culinary capital.',
      keywords: 'Osaka tours, food tours, cultural tours, things to do in Osaka',
      primaryKeyword: 'Osaka tours',
      secondaryKeywords: [
        'Osaka food tours',
        'Osaka cultural tours',
        'Osaka castle tours',
        'Osaka entertainment tours',
        'Osaka shopping tours',
        'Things to do in Osaka'
      ]
    },
    whyVisit: [
      'Japan\'s culinary capital',
      'Famous street food culture',
      'Friendly and welcoming people',
      'Modern entertainment districts',
      'Historic Osaka Castle',
      'Perfect blend of food and fun'
    ],
    bestTimeToVisit: {
      weather: 'Osaka enjoys four distinct seasons. Spring (March-May) brings cherry blossoms, summer (June-August) is hot and humid, autumn (September-November) is mild, and winter (December-February) is cool.',
      bestMonths: 'March to May and September to November offer the best weather with pleasant temperatures.',
      peakSeason: 'March to May brings cherry blossom season with beautiful weather, larger crowds, and higher prices.',
      offSeason: 'June to August offers lower prices but hot, humid weather with occasional typhoons.'
    },
    gettingAround: 'Excellent public transportation including metro, trains, and buses. Walking is perfect for exploring food districts, and organized tours include transportation.',
    highlights: [
      'Dotonbori - Famous entertainment district',
      'Osaka Castle - Historic landmark',
      'Street Food - Takoyaki and okonomiyaki',
      'Universal Studios Japan - Theme park',
      'Kuromon Market - Famous food market',
      'Shinsaibashi - Shopping district'
    ]
  },
  {
    id: 'hiroshima',
    name: 'Hiroshima',
    fullName: 'Hiroshima',
    country: 'Japan',
    category: 'Asia-Pacific',
    briefDescription: 'Peace memorial, resilient spirit, and cultural heritage — Hiroshima is Japan\'s city of peace.',
    relatedGuides: ['japan-cherry-blossom-travel'],
    heroDescription: 'Welcome to Hiroshima, where a tragic past has given way to a beautiful future and a powerful message of peace. From the moving Peace Memorial Park to the iconic Itsukushima Shrine, from poignant history to vibrant culture, this resilient city offers the perfect blend of remembrance, hope, and Japanese heritage. Let our AI-powered planner help you discover the best experiences this incredible destination has to offer.',
    imageUrl: 'https://ouqeoizufbofdqbuiwvx.supabase.co/storage/v1/object/public/destinations//Hiroshima.jpg',
    tourCategories: [
      { name: 'Peace Tours', hasGuide: true },
      { name: 'Historic Tours', hasGuide: true },
      { name: 'Cultural Tours', hasGuide: true },
      { name: 'Shrine Tours', hasGuide: true },
      { name: 'Memorial Tours', hasGuide: true },
      { name: 'Island Tours', hasGuide: true }
    ],
    seo: {
      title: 'Hiroshima Tours & Excursions - Top-Rated Activities & Adventures',
      description: 'Discover top-rated Hiroshima tours, excursions, and activities powered by AI. From peace tours to cultural experiences, find the perfect way to explore Japan\'s city of peace.',
      keywords: 'Hiroshima tours, peace tours, cultural tours, things to do in Hiroshima',
      primaryKeyword: 'Hiroshima tours',
      secondaryKeywords: [
        'Hiroshima peace tours',
        'Hiroshima cultural tours',
        'Hiroshima historic tours',
        'Hiroshima shrine tours',
        'Hiroshima memorial tours',
        'Things to do in Hiroshima'
      ]
    },
    whyVisit: [
      'Powerful peace memorial sites',
      'UNESCO World Heritage Itsukushima Shrine',
      'Resilient and inspiring history',
      'Beautiful Miyajima Island',
      'Rich cultural heritage',
      'Perfect blend of remembrance and hope'
    ],
    bestTimeToVisit: {
      weather: 'Hiroshima enjoys four distinct seasons. Spring (March-May) brings cherry blossoms, summer (June-August) is hot and humid, autumn (September-November) is mild, and winter (December-February) is cool.',
      bestMonths: 'March to May and September to November offer the best weather with pleasant temperatures.',
      peakSeason: 'March to May brings cherry blossom season with beautiful weather, larger crowds, and higher prices.',
      offSeason: 'June to August offers lower prices but hot, humid weather with occasional typhoons.'
    },
    gettingAround: 'Excellent public transportation including trams, trains, and ferries. Walking is perfect for exploring the city center, and organized tours include transportation.',
    highlights: [
      'Peace Memorial Park - UNESCO World Heritage site',
      'Atomic Bomb Dome - Historic landmark',
      'Itsukushima Shrine - Floating torii gate',
      'Miyajima Island - Beautiful island',
      'Hiroshima Castle - Historic castle',
      'Peace Memorial Museum - Educational experience'
    ]
  },
  {
    id: 'hokkaido',
    name: 'Hokkaido',
    fullName: 'Hokkaido',
    country: 'Japan',
    category: 'Asia-Pacific',
    briefDescription: 'Northern wilderness, powder snow, and natural beauty — Hokkaido is Japan\'s adventure paradise.',
    relatedGuides: ['japan-cherry-blossom-travel'],
    heroDescription: 'Welcome to Hokkaido, where pristine wilderness meets world-class skiing and incredible natural beauty in Japan\'s northernmost island. From powder snow adventures to hot spring experiences, from wildlife encounters to scenic landscapes, this northern paradise offers the perfect blend of adventure, nature, and Japanese hospitality. Let our AI-powered planner help you discover the best experiences this incredible destination has to offer.',
    imageUrl: 'https://ouqeoizufbofdqbuiwvx.supabase.co/storage/v1/object/public/destinations//Hokkaido.jpg',
    tourCategories: [
      { name: 'Ski Tours', hasGuide: true },
      { name: 'Nature Tours', hasGuide: true },
      { name: 'Hot Spring Tours', hasGuide: true },
      { name: 'Wildlife Tours', hasGuide: true },
      { name: 'Adventure Tours', hasGuide: true },
      { name: 'Scenic Tours', hasGuide: true }
    ],
    seo: {
      title: 'Hokkaido Tours & Excursions - Top-Rated Activities & Adventures',
      description: 'Discover top-rated Hokkaido tours, excursions, and activities powered by AI. From ski tours to nature experiences, find the perfect way to explore Japan\'s northern paradise.',
      keywords: 'Hokkaido tours, ski tours, nature tours, things to do in Hokkaido',
      primaryKeyword: 'Hokkaido tours',
      secondaryKeywords: [
        'Hokkaido ski tours',
        'Hokkaido nature tours',
        'Hokkaido hot spring tours',
        'Hokkaido wildlife tours',
        'Hokkaido adventure tours',
        'Things to do in Hokkaido'
      ]
    },
    whyVisit: [
      'World-class powder snow skiing',
      'Stunning natural landscapes',
      'Natural hot springs (onsen)',
      'Unique wildlife and nature',
      'Less crowded than mainland Japan',
      'Perfect blend of adventure and relaxation'
    ],
    bestTimeToVisit: {
      weather: 'Hokkaido has four distinct seasons. Winter (December-March) brings heavy snow, spring (April-May) is mild, summer (June-August) is cool and pleasant, and autumn (September-November) has beautiful fall colors.',
      bestMonths: 'December to March for skiing, June to August for summer activities.',
      peakSeason: 'December to March brings peak ski season with cold weather, larger crowds, and higher prices.',
      offSeason: 'April to May and September to November offer lower prices and fewer crowds.'
    },
    gettingAround: 'Renting a car is recommended for exploring Hokkaido. Public transportation connects major cities, and organized tours include transportation.',
    highlights: [
      'Niseko - World-famous ski resort',
      'Sapporo - Capital city',
      'Natural Hot Springs - Onsen experiences',
      'Shiretoko National Park - UNESCO site',
      'Furano - Beautiful flower fields',
      'Lake Toya - Scenic volcanic lake'
    ]
  },
  {
    id: 'bangkok',
    name: 'Bangkok',
    fullName: 'Bangkok',
    country: 'Thailand',
    category: 'Asia-Pacific',
    briefDescription: 'Golden temples, street food paradise, and vibrant culture — Bangkok is Thailand\'s dynamic heart.',
    heroDescription: 'Welcome to Bangkok, where ancient temples meet modern skyscrapers and incredible street food creates a sensory feast in Thailand\'s bustling capital. From the Grand Palace to floating markets, from spicy street food to luxury shopping, this vibrant city offers the perfect blend of tradition, culture, and Thai hospitality. Let our AI-powered planner help you discover the best experiences this incredible destination has to offer.',
    imageUrl: 'https://ouqeoizufbofdqbuiwvx.supabase.co/storage/v1/object/public/destinations//Bangkok.jpeg',
    tourCategories: [
      { name: 'Temple Tours', hasGuide: true },
      { name: 'Food Tours', hasGuide: true },
      { name: 'Cultural Tours', hasGuide: true },
      { name: 'Market Tours', hasGuide: true },
      { name: 'River Tours', hasGuide: true },
      { name: 'Shopping Tours', hasGuide: true }
    ],
    seo: {
      title: 'Bangkok Tours & Excursions - Top-Rated Activities & Adventures',
      description: 'Discover top-rated Bangkok tours, excursions, and activities powered by AI. From temple tours to food experiences, find the perfect way to explore Thailand\'s dynamic capital.',
      keywords: 'Bangkok tours, temple tours, food tours, things to do in Bangkok',
      primaryKeyword: 'Bangkok tours',
      secondaryKeywords: [
        'Bangkok temple tours',
        'Bangkok food tours',
        'Bangkok cultural tours',
        'Bangkok market tours',
        'Bangkok river tours',
        'Things to do in Bangkok'
      ]
    },
    whyVisit: [
      'Stunning golden temples',
      'Incredible street food culture',
      'Floating markets and canals',
      'Vibrant nightlife and shopping',
      'Rich Thai culture and history',
      'Perfect blend of old and new'
    ],
    bestTimeToVisit: {
      weather: 'Bangkok has a tropical climate with three seasons. Cool season (November-February) is pleasant, hot season (March-May) is very hot, and rainy season (June-October) brings monsoon rains.',
      bestMonths: 'November to February offers the best weather with cooler temperatures.',
      peakSeason: 'November to February brings peak tourist season with ideal weather, larger crowds, and higher prices.',
      offSeason: 'June to October offers lower prices and fewer crowds, though with more rain.'
    },
    gettingAround: 'Excellent public transportation including BTS Skytrain, MRT subway, and river boats. Walking and organized tours are perfect for exploring the city.',
    highlights: [
      'Grand Palace - Royal residence',
      'Wat Phra Kaew - Temple of Emerald Buddha',
      'Chatuchak Market - World\'s largest weekend market',
      'Chao Phraya River - River of Kings',
      'Street Food - Pad Thai and more',
      'Wat Arun - Temple of Dawn'
    ]
  },
  {
    id: 'chiang-mai',
    name: 'Chiang Mai',
    fullName: 'Chiang Mai',
    country: 'Thailand',
    category: 'Asia-Pacific',
    briefDescription: 'Cultural capital, mountain charm, and spiritual heritage — Chiang Mai is Thailand\'s northern gem.',
    heroDescription: 'Welcome to Chiang Mai, where ancient temples meet mountain landscapes and traditional Thai culture thrives in the heart of northern Thailand. From historic Old City temples to hill tribe villages, from night bazaars to elephant sanctuaries, this cultural treasure offers the perfect blend of history, nature, and Thai traditions. Let our AI-powered planner help you discover the best experiences this incredible destination has to offer.',
    imageUrl: 'https://ouqeoizufbofdqbuiwvx.supabase.co/storage/v1/object/public/destinations//Chiang%20Mai.jpeg',
    tourCategories: [
      { name: 'Temple Tours', hasGuide: true },
      { name: 'Cultural Tours', hasGuide: true },
      { name: 'Mountain Tours', hasGuide: true },
      { name: 'Elephant Tours', hasGuide: true },
      { name: 'Market Tours', hasGuide: true },
      { name: 'Adventure Tours', hasGuide: true }
    ],
    seo: {
      title: 'Chiang Mai Tours & Excursions - Top-Rated Activities & Adventures',
      description: 'Discover top-rated Chiang Mai tours, excursions, and activities powered by AI. From temple tours to mountain experiences, find the perfect way to explore Thailand\'s northern gem.',
      keywords: 'Chiang Mai tours, temple tours, cultural tours, things to do in Chiang Mai',
      primaryKeyword: 'Chiang Mai tours',
      secondaryKeywords: [
        'Chiang Mai temple tours',
        'Chiang Mai cultural tours',
        'Chiang Mai mountain tours',
        'Chiang Mai elephant tours',
        'Chiang Mai market tours',
        'Things to do in Chiang Mai'
      ]
    },
    whyVisit: [
      'Over 300 Buddhist temples',
      'Beautiful mountain scenery',
      'Rich cultural heritage',
      'Elephant sanctuaries',
      'Traditional night markets',
      'Perfect blend of culture and nature'
    ],
    bestTimeToVisit: {
      weather: 'Chiang Mai has three seasons. Cool season (November-February) is pleasant, hot season (March-May) is very hot, and rainy season (June-October) brings monsoon rains.',
      bestMonths: 'November to February offers the best weather with cooler temperatures.',
      peakSeason: 'November to February brings peak tourist season with ideal weather, larger crowds, and higher prices.',
      offSeason: 'June to October offers lower prices and fewer crowds, though with more rain.'
    },
    gettingAround: 'Walking is perfect for exploring the Old City. Songthaews (shared taxis) and organized tours provide transportation to other areas.',
    highlights: [
      'Wat Phra That Doi Suthep - Mountain temple',
      'Old City Temples - Historic architecture',
      'Night Bazaar - Traditional markets',
      'Doi Inthanon - Thailand\'s highest peak',
      'Elephant Nature Park - Ethical sanctuary',
      'Sunday Walking Street - Cultural market'
    ]
  },
  {
    id: 'phuket',
    name: 'Phuket',
    fullName: 'Phuket',
    country: 'Thailand',
    category: 'Asia-Pacific',
    briefDescription: 'Tropical paradise, beach bliss, and island adventures — Phuket is Thailand\'s beach gem.',
    heroDescription: 'Welcome to Phuket, where pristine beaches meet crystal-clear waters and endless island adventures await in Thailand\'s largest island. From beautiful beaches to water activities, from vibrant nightlife to cultural experiences, this tropical paradise offers the perfect blend of relaxation, adventure, and Thai island life. Let our AI-powered planner help you discover the best experiences this incredible destination has to offer.',
    imageUrl: 'https://ouqeoizufbofdqbuiwvx.supabase.co/storage/v1/object/public/destinations//Phuket.webp',
    tourCategories: [
      { name: 'Beach Tours', hasGuide: true },
      { name: 'Island Tours', hasGuide: true },
      { name: 'Water Tours', hasGuide: true },
      { name: 'Cultural Tours', hasGuide: true },
      { name: 'Adventure Tours', hasGuide: true },
      { name: 'Nightlife Tours', hasGuide: true }
    ],
    seo: {
      title: 'Phuket Tours & Excursions - Top-Rated Activities & Adventures',
      description: 'Discover top-rated Phuket tours, excursions, and activities powered by AI. From beach tours to island adventures, find the perfect way to explore Thailand\'s tropical paradise.',
      keywords: 'Phuket tours, beach tours, island tours, things to do in Phuket',
      primaryKeyword: 'Phuket tours',
      secondaryKeywords: [
        'Phuket beach tours',
        'Phuket island tours',
        'Phuket water tours',
        'Phuket cultural tours',
        'Phuket adventure tours',
        'Things to do in Phuket'
      ]
    },
    whyVisit: [
      'Beautiful tropical beaches',
      'Crystal-clear turquoise waters',
      'Excellent water activities',
      'Vibrant nightlife and entertainment',
      'Rich cultural heritage',
      'Perfect blend of beach and culture'
    ],
    bestTimeToVisit: {
      weather: 'Phuket has a tropical climate with two seasons. Dry season (November-April) brings sunny weather, while rainy season (May-October) brings monsoon rains.',
      bestMonths: 'November to April offers the best weather with dry conditions.',
      peakSeason: 'December to March brings peak tourist season with ideal weather, larger crowds, and higher prices.',
      offSeason: 'May to October offers lower prices and fewer crowds, though with more rain.'
    },
    gettingAround: 'Renting a car or motorbike is popular. Organized tours include transportation, and taxis are available for shorter trips.',
    highlights: [
      'Patong Beach - Famous beach',
      'Phi Phi Islands - Stunning islands',
      'Big Buddha - Iconic landmark',
      'Old Phuket Town - Historic architecture',
      'Water Activities - Snorkeling and diving',
      'Nightlife - Bangla Road entertainment'
    ]
  },
  {
    id: 'krabi',
    name: 'Krabi',
    fullName: 'Krabi',
    country: 'Thailand',
    category: 'Asia-Pacific',
    briefDescription: 'Limestone cliffs, pristine beaches, and natural wonders — Krabi is Thailand\'s adventure paradise.',
    heroDescription: 'Welcome to Krabi, where dramatic limestone cliffs meet pristine beaches and endless outdoor adventures await in this stunning coastal province. From rock climbing to island hopping, from hot springs to mangrove forests, this natural wonder offers the perfect blend of adventure, beauty, and Thai coastal life. Let our AI-powered planner help you discover the best experiences this incredible destination has to offer.',
    imageUrl: 'https://ouqeoizufbofdqbuiwvx.supabase.co/storage/v1/object/public/destinations//Krabi.jpg',
    tourCategories: [
      { name: 'Adventure Tours', hasGuide: true },
      { name: 'Beach Tours', hasGuide: true },
      { name: 'Island Tours', hasGuide: true },
      { name: 'Rock Climbing Tours', hasGuide: true },
      { name: 'Nature Tours', hasGuide: true },
      { name: 'Water Tours', hasGuide: true }
    ],
    seo: {
      title: 'Krabi Tours & Excursions - Top-Rated Activities & Adventures',
      description: 'Discover top-rated Krabi tours, excursions, and activities powered by AI. From adventure tours to beach experiences, find the perfect way to explore Thailand\'s natural wonder.',
      keywords: 'Krabi tours, adventure tours, beach tours, things to do in Krabi',
      primaryKeyword: 'Krabi tours',
      secondaryKeywords: [
        'Krabi adventure tours',
        'Krabi beach tours',
        'Krabi island tours',
        'Krabi rock climbing tours',
        'Krabi nature tours',
        'Things to do in Krabi'
      ]
    },
    whyVisit: [
      'Dramatic limestone cliffs',
      'Pristine beaches and islands',
      'World-class rock climbing',
      'Natural hot springs',
      'Beautiful mangrove forests',
      'Perfect blend of adventure and beauty'
    ],
    bestTimeToVisit: {
      weather: 'Krabi has a tropical climate with two seasons. Dry season (November-April) brings sunny weather, while rainy season (May-October) brings monsoon rains.',
      bestMonths: 'November to April offers the best weather with dry conditions.',
      peakSeason: 'December to March brings peak tourist season with ideal weather, larger crowds, and higher prices.',
      offSeason: 'May to October offers lower prices and fewer crowds, though with more rain.'
    },
    gettingAround: 'Renting a car or motorbike is popular. Organized tours include transportation, and longtail boats connect to islands.',
    highlights: [
      'Railay Beach - Stunning beach',
      'Phi Phi Islands - Beautiful islands',
      'Tiger Cave Temple - Mountain temple',
      'Hot Springs - Natural thermal pools',
      'Rock Climbing - World-class climbing',
      'Mangrove Forests - Natural beauty'
    ]
  },
  {
    id: 'koh-samui',
    name: 'Koh Samui',
    fullName: 'Koh Samui',
    country: 'Thailand',
    category: 'Asia-Pacific',
    briefDescription: 'Island paradise, coconut palms, and tropical luxury — Koh Samui is Thailand\'s island gem.',
    heroDescription: 'Welcome to Koh Samui, where coconut palms sway in the breeze and pristine beaches meet luxury resorts in this beautiful island paradise. From stunning beaches to spiritual temples, from water activities to wellness retreats, this tropical gem offers the perfect blend of relaxation, adventure, and Thai island hospitality. Let our AI-powered planner help you discover the best experiences this incredible destination has to offer.',
    imageUrl: 'https://ouqeoizufbofdqbuiwvx.supabase.co/storage/v1/object/public/destinations//Koh%20Samui.jpg',
    tourCategories: [
      { name: 'Beach Tours', hasGuide: true },
      { name: 'Island Tours', hasGuide: true },
      { name: 'Water Tours', hasGuide: true },
      { name: 'Wellness Tours', hasGuide: true },
      { name: 'Cultural Tours', hasGuide: true },
      { name: 'Adventure Tours', hasGuide: true }
    ],
    seo: {
      title: 'Koh Samui Tours & Excursions - Top-Rated Activities & Adventures',
      description: 'Discover top-rated Koh Samui tours, excursions, and activities powered by AI. From beach tours to wellness experiences, find the perfect way to explore Thailand\'s island paradise.',
      keywords: 'Koh Samui tours, beach tours, island tours, things to do in Koh Samui',
      primaryKeyword: 'Koh Samui tours',
      secondaryKeywords: [
        'Koh Samui beach tours',
        'Koh Samui island tours',
        'Koh Samui water tours',
        'Koh Samui wellness tours',
        'Koh Samui cultural tours',
        'Things to do in Koh Samui'
      ]
    },
    whyVisit: [
      'Beautiful tropical beaches',
      'Luxury resorts and spas',
      'Spiritual temples and culture',
      'Excellent water activities',
      'Wellness and yoga retreats',
      'Perfect blend of luxury and nature'
    ],
    bestTimeToVisit: {
      weather: 'Koh Samui has a tropical climate with two seasons. Dry season (December-April) brings sunny weather, while rainy season (May-November) brings monsoon rains.',
      bestMonths: 'December to April offers the best weather with dry conditions.',
      peakSeason: 'December to March brings peak tourist season with ideal weather, larger crowds, and higher prices.',
      offSeason: 'May to November offers lower prices and fewer crowds, though with more rain.'
    },
    gettingAround: 'Renting a car or motorbike is popular. Organized tours include transportation, and taxis are available for shorter trips.',
    highlights: [
      'Chaweng Beach - Famous beach',
      'Big Buddha Temple - Iconic landmark',
      'Ang Thong Marine Park - Stunning islands',
      'Fisherman\'s Village - Traditional area',
      'Water Activities - Snorkeling and diving',
      'Wellness Retreats - Spas and yoga'
    ]
  },
  {
    id: 'bali',
    name: 'Bali',
    fullName: 'Bali',
    country: 'Indonesia',
    category: 'Asia-Pacific',
    briefDescription: 'Island of the Gods, spiritual paradise, and cultural treasure — Bali is Indonesia\'s soul.',
    heroDescription: 'Welcome to Bali, where ancient temples meet pristine beaches and spiritual traditions create a magical island paradise. From sacred temples to rice terraces, from surf beaches to wellness retreats, this Island of the Gods offers the perfect blend of spirituality, culture, and natural beauty. Let our AI-powered planner help you discover the best experiences this incredible destination has to offer.',
    imageUrl: 'https://ouqeoizufbofdqbuiwvx.supabase.co/storage/v1/object/public/destinations//Bali.jpeg',
    tourCategories: [
      { name: 'Temple Tours', hasGuide: true },
      { name: 'Cultural Tours', hasGuide: true },
      { name: 'Beach Tours', hasGuide: true },
      { name: 'Wellness Tours', hasGuide: true },
      { name: 'Adventure Tours', hasGuide: true },
      { name: 'Rice Terrace Tours', hasGuide: true }
    ],
    seo: {
      title: 'Bali Tours & Excursions - Top-Rated Activities & Adventures',
      description: 'Discover top-rated Bali tours, excursions, and activities powered by AI. From temple tours to cultural experiences, find the perfect way to explore Indonesia\'s spiritual paradise.',
      keywords: 'Bali tours, temple tours, cultural tours, things to do in Bali',
      primaryKeyword: 'Bali tours',
      secondaryKeywords: [
        'Bali temple tours',
        'Bali cultural tours',
        'Bali beach tours',
        'Bali wellness tours',
        'Bali adventure tours',
        'Things to do in Bali'
      ]
    },
    whyVisit: [
      'Over 20,000 temples',
      'Beautiful rice terraces',
      'Spiritual and cultural heritage',
      'World-class surfing beaches',
      'Wellness and yoga culture',
      'Perfect blend of spirituality and nature'
    ],
    bestTimeToVisit: {
      weather: 'Bali has a tropical climate with two seasons. Dry season (April-October) brings sunny weather, while rainy season (November-March) brings monsoon rains.',
      bestMonths: 'April to October offers the best weather with dry conditions.',
      peakSeason: 'June to August brings peak tourist season with ideal weather, larger crowds, and higher prices.',
      offSeason: 'November to March offers lower prices and fewer crowds, though with more rain.'
    },
    gettingAround: 'Renting a car or motorbike is popular. Organized tours include transportation, and taxis are available for shorter trips.',
    highlights: [
      'Tanah Lot Temple - Sea temple',
      'Tegalalang Rice Terraces - Stunning landscapes',
      'Ubud - Cultural heart',
      'Kuta Beach - Famous surf beach',
      'Sacred Monkey Forest - Wildlife sanctuary',
      'Mount Batur - Active volcano'
    ]
  },
  {
    id: 'jakarta',
    name: 'Jakarta',
    fullName: 'Jakarta',
    country: 'Indonesia',
    category: 'Asia-Pacific',
    briefDescription: 'Dynamic capital, cultural melting pot, and modern metropolis — Jakarta is Indonesia\'s vibrant heart.',
    heroDescription: 'Welcome to Jakarta, where modern skyscrapers meet historic neighborhoods and diverse cultures create a dynamic capital city. From the historic Old Town to modern shopping districts, from traditional markets to international cuisine, this bustling metropolis offers the perfect blend of history, culture, and Indonesian urban life. Let our AI-powered planner help you discover the best experiences this incredible destination has to offer.',
    imageUrl: 'https://ouqeoizufbofdqbuiwvx.supabase.co/storage/v1/object/public/destinations//Jakarta.jpg',
    tourCategories: [
      { name: 'City Tours', hasGuide: true },
      { name: 'Cultural Tours', hasGuide: true },
      { name: 'Food Tours', hasGuide: true },
      { name: 'Historic Tours', hasGuide: true },
      { name: 'Market Tours', hasGuide: true },
      { name: 'Shopping Tours', hasGuide: true }
    ],
    seo: {
      title: 'Jakarta Tours & Excursions - Top-Rated Activities & Adventures',
      description: 'Discover top-rated Jakarta tours, excursions, and activities powered by AI. From city tours to cultural experiences, find the perfect way to explore Indonesia\'s dynamic capital.',
      keywords: 'Jakarta tours, city tours, cultural tours, things to do in Jakarta',
      primaryKeyword: 'Jakarta tours',
      secondaryKeywords: [
        'Jakarta city tours',
        'Jakarta cultural tours',
        'Jakarta food tours',
        'Jakarta historic tours',
        'Jakarta market tours',
        'Things to do in Jakarta'
      ]
    },
    whyVisit: [
      'Historic Old Town (Kota Tua)',
      'Diverse cultural heritage',
      'Excellent food scene',
      'Modern shopping districts',
      'Traditional markets',
      'Perfect blend of old and new'
    ],
    bestTimeToVisit: {
      weather: 'Jakarta has a tropical climate with two seasons. Dry season (May-October) brings sunny weather, while rainy season (November-April) brings monsoon rains.',
      bestMonths: 'May to October offers the best weather with dry conditions.',
      peakSeason: 'June to August brings peak tourist season with ideal weather, larger crowds, and higher prices.',
      offSeason: 'November to April offers lower prices and fewer crowds, though with more rain.'
    },
    gettingAround: 'Excellent public transportation including TransJakarta buses and commuter trains. Walking and organized tours are perfect for exploring the city.',
    highlights: [
      'Kota Tua - Historic Old Town',
      'National Monument - Iconic landmark',
      'Istiqlal Mosque - Largest mosque in Southeast Asia',
      'Taman Mini Indonesia - Cultural park',
      'Traditional Markets - Local culture',
      'Modern Shopping Malls - Retail therapy'
    ]
  },
  {
    id: 'yogyakarta',
    name: 'Yogyakarta',
    fullName: 'Yogyakarta',
    country: 'Indonesia',
    category: 'Asia-Pacific',
    briefDescription: 'Cultural heart, ancient temples, and royal heritage — Yogyakarta is Indonesia\'s soul city.',
    heroDescription: 'Welcome to Yogyakarta, where ancient temples meet royal palaces and traditional Javanese culture thrives in Indonesia\'s cultural heart. From the magnificent Borobudur to the royal Kraton, from traditional batik to shadow puppetry, this cultural treasure offers the perfect blend of history, tradition, and Indonesian heritage. Let our AI-powered planner help you discover the best experiences this incredible destination has to offer.',
    imageUrl: 'https://ouqeoizufbofdqbuiwvx.supabase.co/storage/v1/object/public/destinations//Yogyakarta.avif',
    tourCategories: [
      { name: 'Temple Tours', hasGuide: true },
      { name: 'Cultural Tours', hasGuide: true },
      { name: 'Royal Tours', hasGuide: true },
      { name: 'Historic Tours', hasGuide: true },
      { name: 'Art Tours', hasGuide: true },
      { name: 'Market Tours', hasGuide: true }
    ],
    seo: {
      title: 'Yogyakarta Tours & Excursions - Top-Rated Activities & Adventures',
      description: 'Discover top-rated Yogyakarta tours, excursions, and activities powered by AI. From temple tours to cultural experiences, find the perfect way to explore Indonesia\'s cultural heart.',
      keywords: 'Yogyakarta tours, temple tours, cultural tours, things to do in Yogyakarta',
      primaryKeyword: 'Yogyakarta tours',
      secondaryKeywords: [
        'Yogyakarta temple tours',
        'Yogyakarta cultural tours',
        'Yogyakarta royal tours',
        'Yogyakarta historic tours',
        'Yogyakarta art tours',
        'Things to do in Yogyakarta'
      ]
    },
    whyVisit: [
      'UNESCO World Heritage Borobudur',
      'Royal Kraton Palace',
      'Traditional Javanese culture',
      'Ancient Prambanan Temple',
      'Traditional arts and crafts',
      'Perfect blend of history and culture'
    ],
    bestTimeToVisit: {
      weather: 'Yogyakarta has a tropical climate with two seasons. Dry season (May-October) brings sunny weather, while rainy season (November-April) brings monsoon rains.',
      bestMonths: 'May to October offers the best weather with dry conditions.',
      peakSeason: 'June to August brings peak tourist season with ideal weather, larger crowds, and higher prices.',
      offSeason: 'November to April offers lower prices and fewer crowds, though with more rain.'
    },
    gettingAround: 'Walking is perfect for exploring the city center. Organized tours include transportation, and taxis are available for shorter trips.',
    highlights: [
      'Borobudur Temple - World\'s largest Buddhist temple',
      'Kraton Palace - Royal residence',
      'Prambanan Temple - Hindu temple complex',
      'Traditional Batik - Local art form',
      'Malioboro Street - Shopping district',
      'Shadow Puppetry - Traditional performance'
    ]
  },
  {
    id: 'gili-islands',
    name: 'Gili Islands',
    fullName: 'Gili Islands',
    country: 'Indonesia',
    category: 'Asia-Pacific',
    briefDescription: 'Tropical paradise, coral reefs, and island bliss — Gili Islands are Indonesia\'s hidden gems.',
    heroDescription: 'Welcome to the Gili Islands, where pristine beaches meet crystal-clear waters and laid-back island life creates the perfect tropical escape. From stunning coral reefs to beautiful beaches, from snorkeling adventures to sunset views, this island paradise offers the perfect blend of relaxation, adventure, and Indonesian island hospitality. Let our AI-powered planner help you discover the best experiences this incredible destination has to offer.',
    imageUrl: 'https://ouqeoizufbofdqbuiwvx.supabase.co/storage/v1/object/public/destinations//Gili%20Islands.jpg',
    tourCategories: [
      { name: 'Island Tours', hasGuide: true },
      { name: 'Snorkeling Tours', hasGuide: true },
      { name: 'Beach Tours', hasGuide: true },
      { name: 'Water Tours', hasGuide: true },
      { name: 'Adventure Tours', hasGuide: true },
      { name: 'Relaxation Tours', hasGuide: true }
    ],
    seo: {
      title: 'Gili Islands Tours & Excursions - Top-Rated Activities & Adventures',
      description: 'Discover top-rated Gili Islands tours, excursions, and activities powered by AI. From island tours to snorkeling experiences, find the perfect way to explore Indonesia\'s tropical paradise.',
      keywords: 'Gili Islands tours, island tours, snorkeling tours, things to do in Gili Islands',
      primaryKeyword: 'Gili Islands tours',
      secondaryKeywords: [
        'Gili Islands island tours',
        'Gili Islands snorkeling tours',
        'Gili Islands beach tours',
        'Gili Islands water tours',
        'Gili Islands adventure tours',
        'Things to do in Gili Islands'
      ]
    },
    whyVisit: [
      'Pristine coral reefs',
      'Crystal-clear turquoise waters',
      'Beautiful white sand beaches',
      'Excellent snorkeling and diving',
      'Laid-back island atmosphere',
      'Perfect blend of adventure and relaxation'
    ],
    bestTimeToVisit: {
      weather: 'The Gili Islands have a tropical climate with two seasons. Dry season (May-October) brings sunny weather, while rainy season (November-April) brings monsoon rains.',
      bestMonths: 'May to October offers the best weather with dry conditions.',
      peakSeason: 'June to August brings peak tourist season with ideal weather, larger crowds, and higher prices.',
      offSeason: 'November to April offers lower prices and fewer crowds, though with more rain.'
    },
    gettingAround: 'Walking and cycling are the main ways to get around the islands. Organized tours include transportation for water activities.',
    highlights: [
      'Coral Reefs - World-class snorkeling',
      'White Sand Beaches - Pristine shorelines',
      'Turtle Spotting - Marine wildlife',
      'Sunset Views - Beautiful panoramas',
      'Island Hopping - Explore all three islands',
      'Water Activities - Swimming and diving'
    ]
  },
  {
    id: 'hanoi',
    name: 'Hanoi',
    fullName: 'Hanoi',
    country: 'Vietnam',
    category: 'Asia-Pacific',
    briefDescription: 'Ancient capital, French colonial charm, and vibrant culture — Hanoi is Vietnam\'s historic heart.',
    heroDescription: 'Welcome to Hanoi, where ancient temples meet French colonial architecture and the bustling Old Quarter creates a sensory feast in Vietnam\'s historic capital. From the Hoan Kiem Lake to the Temple of Literature, from street food adventures to cultural experiences, this vibrant city offers the perfect blend of history, culture, and Vietnamese hospitality. Let our AI-powered planner help you discover the best experiences this incredible destination has to offer.',
    imageUrl: 'https://ouqeoizufbofdqbuiwvx.supabase.co/storage/v1/object/public/destinations//Hanoi.webp',
    tourCategories: [
      { name: 'Cultural Tours', hasGuide: true },
      { name: 'Food Tours', hasGuide: true },
      { name: 'Historic Tours', hasGuide: true },
      { name: 'City Tours', hasGuide: true },
      { name: 'Temple Tours', hasGuide: true },
      { name: 'Market Tours', hasGuide: true }
    ],
    seo: {
      title: 'Hanoi Tours & Excursions - Top-Rated Activities & Adventures',
      description: 'Discover top-rated Hanoi tours, excursions, and activities powered by AI. From cultural tours to food experiences, find the perfect way to explore Vietnam\'s historic capital.',
      keywords: 'Hanoi tours, cultural tours, food tours, things to do in Hanoi',
      primaryKeyword: 'Hanoi tours',
      secondaryKeywords: [
        'Hanoi cultural tours',
        'Hanoi food tours',
        'Hanoi historic tours',
        'Hanoi city tours',
        'Hanoi temple tours',
        'Things to do in Hanoi'
      ]
    },
    whyVisit: [
      'Rich cultural heritage',
      'French colonial architecture',
      'Excellent street food culture',
      'Historic Old Quarter',
      'Beautiful lakes and temples',
      'Perfect blend of old and new'
    ],
    bestTimeToVisit: {
      weather: 'Hanoi has four distinct seasons. Spring (March-April) and autumn (October-November) are pleasant, summer (May-September) is hot and humid, and winter (December-February) is cool.',
      bestMonths: 'March to April and October to November offer the best weather with pleasant temperatures.',
      peakSeason: 'October to December brings peak tourist season with ideal weather, larger crowds, and higher prices.',
      offSeason: 'May to September offers lower prices but hot, humid weather with occasional typhoons.'
    },
    gettingAround: 'Walking is perfect for exploring the Old Quarter. Organized tours include transportation, and taxis are available for shorter trips.',
    highlights: [
      'Hoan Kiem Lake - Historic lake',
      'Old Quarter - Bustling markets',
      'Temple of Literature - Ancient university',
      'Ho Chi Minh Mausoleum - Historic site',
      'Street Food - Pho and banh mi',
      'French Quarter - Colonial architecture'
    ]
  },
  {
    id: 'ho-chi-minh-city',
    name: 'Ho Chi Minh City',
    fullName: 'Ho Chi Minh City (Saigon)',
    country: 'Vietnam',
    category: 'Asia-Pacific',
    briefDescription: 'Dynamic metropolis, historic landmarks, and modern energy — Ho Chi Minh City is Vietnam\'s economic heart.',
    heroDescription: 'Welcome to Ho Chi Minh City, where modern skyscrapers meet historic landmarks and the energy of Vietnam\'s largest city creates an unforgettable experience. From the historic Cu Chi Tunnels to the bustling Ben Thanh Market, from French colonial architecture to vibrant nightlife, this dynamic metropolis offers the perfect blend of history, culture, and Vietnamese urban life. Let our AI-powered planner help you discover the best experiences this incredible destination has to offer.',
    imageUrl: 'https://ouqeoizufbofdqbuiwvx.supabase.co/storage/v1/object/public/destinations//Ho%20Chi%20Minh%20City%20(Saigon).jpg',
    tourCategories: [
      { name: 'City Tours', hasGuide: true },
      { name: 'Historic Tours', hasGuide: true },
      { name: 'Food Tours', hasGuide: true },
      { name: 'Cultural Tours', hasGuide: true },
      { name: 'Market Tours', hasGuide: true },
      { name: 'Nightlife Tours', hasGuide: true }
    ],
    seo: {
      title: 'Ho Chi Minh City Tours & Excursions - Top-Rated Activities & Adventures',
      description: 'Discover top-rated Ho Chi Minh City tours, excursions, and activities powered by AI. From city tours to historic experiences, find the perfect way to explore Vietnam\'s dynamic metropolis.',
      keywords: 'Ho Chi Minh City tours, city tours, historic tours, things to do in Ho Chi Minh City',
      primaryKeyword: 'Ho Chi Minh City tours',
      secondaryKeywords: [
        'Ho Chi Minh City city tours',
        'Ho Chi Minh City historic tours',
        'Ho Chi Minh City food tours',
        'Ho Chi Minh City cultural tours',
        'Ho Chi Minh City market tours',
        'Things to do in Ho Chi Minh City'
      ]
    },
    whyVisit: [
      'Historic Cu Chi Tunnels',
      'French colonial architecture',
      'Excellent food scene',
      'Vibrant nightlife',
      'Rich cultural heritage',
      'Perfect blend of history and modernity'
    ],
    bestTimeToVisit: {
      weather: 'Ho Chi Minh City has a tropical climate with two seasons. Dry season (December-April) brings sunny weather, while rainy season (May-November) brings monsoon rains.',
      bestMonths: 'December to April offers the best weather with dry conditions.',
      peakSeason: 'December to March brings peak tourist season with ideal weather, larger crowds, and higher prices.',
      offSeason: 'May to November offers lower prices and fewer crowds, though with more rain.'
    },
    gettingAround: 'Excellent public transportation including buses and metro. Walking and organized tours are perfect for exploring the city.',
    highlights: [
      'Cu Chi Tunnels - Historic site',
      'Ben Thanh Market - Famous market',
      'Notre Dame Cathedral - French architecture',
      'Reunification Palace - Historic landmark',
      'Street Food - Pho and banh mi',
      'Bitexco Financial Tower - Modern skyline'
    ]
  },
  {
    id: 'hoi-an',
    name: 'Hoi An',
    fullName: 'Hoi An',
    country: 'Vietnam',
    category: 'Asia-Pacific',
    briefDescription: 'Ancient trading port, lantern-lit streets, and cultural treasure — Hoi An is Vietnam\'s charming gem.',
    heroDescription: 'Welcome to Hoi An, where ancient trading port heritage meets lantern-lit magic and traditional Vietnamese culture thrives in this UNESCO World Heritage site. From the historic Old Town to beautiful beaches, from traditional lantern making to excellent cuisine, this charming town offers the perfect blend of history, culture, and Vietnamese hospitality. Let our AI-powered planner help you discover the best experiences this incredible destination has to offer.',
    imageUrl: 'https://ouqeoizufbofdqbuiwvx.supabase.co/storage/v1/object/public/destinations//Hoi%20An.jpg',
    tourCategories: [
      { name: 'Cultural Tours', hasGuide: true },
      { name: 'Historic Tours', hasGuide: true },
      { name: 'Food Tours', hasGuide: true },
      { name: 'Beach Tours', hasGuide: true },
      { name: 'Craft Tours', hasGuide: true },
      { name: 'Photography Tours', hasGuide: true }
    ],
    seo: {
      title: 'Hoi An Tours & Excursions - Top-Rated Activities & Adventures',
      description: 'Discover top-rated Hoi An tours, excursions, and activities powered by AI. From cultural tours to historic experiences, find the perfect way to explore Vietnam\'s charming gem.',
      keywords: 'Hoi An tours, cultural tours, historic tours, things to do in Hoi An',
      primaryKeyword: 'Hoi An tours',
      secondaryKeywords: [
        'Hoi An cultural tours',
        'Hoi An historic tours',
        'Hoi An food tours',
        'Hoi An beach tours',
        'Hoi An craft tours',
        'Things to do in Hoi An'
      ]
    },
    whyVisit: [
      'UNESCO World Heritage Old Town',
      'Beautiful lantern-lit streets',
      'Traditional craft villages',
      'Excellent food scene',
      'Nearby beautiful beaches',
      'Perfect blend of history and charm'
    ],
    bestTimeToVisit: {
      weather: 'Hoi An has a tropical climate with two seasons. Dry season (February-August) brings sunny weather, while rainy season (September-January) brings monsoon rains.',
      bestMonths: 'February to August offers the best weather with dry conditions.',
      peakSeason: 'March to May brings peak tourist season with ideal weather, larger crowds, and higher prices.',
      offSeason: 'September to January offers lower prices and fewer crowds, though with more rain.'
    },
    gettingAround: 'Walking is perfect for exploring the Old Town. Organized tours include transportation, and bicycles are available for rent.',
    highlights: [
      'Old Town - UNESCO World Heritage site',
      'Japanese Covered Bridge - Historic landmark',
      'Lantern Making - Traditional craft',
      'An Bang Beach - Beautiful beach',
      'Cao Lau - Local specialty dish',
      'Night Market - Lantern-lit atmosphere'
    ]
  },
  {
    id: 'halong-bay',
    name: 'Halong Bay',
    fullName: 'Halong Bay',
    country: 'Vietnam',
    category: 'Asia-Pacific',
    briefDescription: 'Limestone karsts, emerald waters, and natural wonder — Halong Bay is Vietnam\'s marine paradise.',
    heroDescription: 'Welcome to Halong Bay, where thousands of limestone karsts rise dramatically from emerald waters and traditional junk boats create a scene of timeless beauty. From stunning cave systems to floating villages, from kayaking adventures to sunset cruises, this UNESCO World Heritage site offers the perfect blend of natural wonder, adventure, and Vietnamese coastal life. Let our AI-powered planner help you discover the best experiences this incredible destination has to offer.',
    imageUrl: 'https://ouqeoizufbofdqbuiwvx.supabase.co/storage/v1/object/public/destinations//Halong%20Bay.jpg',
    tourCategories: [
      { name: 'Cruise Tours', hasGuide: true },
      { name: 'Kayaking Tours', hasGuide: true },
      { name: 'Cave Tours', hasGuide: true },
      { name: 'Island Tours', hasGuide: true },
      { name: 'Photography Tours', hasGuide: true },
      { name: 'Adventure Tours', hasGuide: true }
    ],
    seo: {
      title: 'Halong Bay Tours & Excursions - Top-Rated Activities & Adventures',
      description: 'Discover top-rated Halong Bay tours, excursions, and activities powered by AI. From cruise tours to kayaking adventures, find the perfect way to explore Vietnam\'s marine paradise.',
      keywords: 'Halong Bay tours, cruise tours, kayaking tours, things to do in Halong Bay',
      primaryKeyword: 'Halong Bay tours',
      secondaryKeywords: [
        'Halong Bay cruise tours',
        'Halong Bay kayaking tours',
        'Halong Bay cave tours',
        'Halong Bay island tours',
        'Halong Bay photography tours',
        'Things to do in Halong Bay'
      ]
    },
    whyVisit: [
      'UNESCO World Heritage site',
      'Thousands of limestone karsts',
      'Stunning cave systems',
      'Traditional junk boat cruises',
      'Floating fishing villages',
      'Perfect blend of nature and culture'
    ],
    bestTimeToVisit: {
      weather: 'Halong Bay has a tropical climate with two seasons. Dry season (October-April) brings pleasant weather, while rainy season (May-September) brings monsoon rains.',
      bestMonths: 'October to April offers the best weather with pleasant conditions.',
      peakSeason: 'March to May brings peak tourist season with ideal weather, larger crowds, and higher prices.',
      offSeason: 'June to September offers lower prices and fewer crowds, though with more rain.'
    },
    gettingAround: 'Cruise boats are the main way to explore Halong Bay. Organized tours include transportation from Hanoi.',
    highlights: [
      'Limestone Karsts - Dramatic landscapes',
      'Sung Sot Cave - Beautiful cave system',
      'Traditional Junk Boats - Cultural experience',
      'Kayaking - Water adventures',
      'Floating Villages - Local culture',
      'Sunset Cruises - Romantic experiences'
    ]
  },
  {
    id: 'kuala-lumpur',
    name: 'Kuala Lumpur',
    fullName: 'Kuala Lumpur',
    country: 'Malaysia',
    category: 'Asia-Pacific',
    briefDescription: 'Modern metropolis, cultural diversity, and iconic landmarks — Kuala Lumpur is Malaysia\'s dynamic heart.',
    heroDescription: 'Welcome to Kuala Lumpur, where gleaming skyscrapers meet historic temples and diverse cultures create a vibrant melting pot in Malaysia\'s capital. From the iconic Petronas Towers to the historic Batu Caves, from excellent shopping to incredible food, this modern metropolis offers the perfect blend of tradition, innovation, and Malaysian hospitality. Let our AI-powered planner help you discover the best experiences this incredible destination has to offer.',
    imageUrl: 'https://ouqeoizufbofdqbuiwvx.supabase.co/storage/v1/object/public/destinations//Kuala%20Lumpur.jpg',
    tourCategories: [
      { name: 'City Tours', hasGuide: true },
      { name: 'Cultural Tours', hasGuide: true },
      { name: 'Food Tours', hasGuide: true },
      { name: 'Shopping Tours', hasGuide: true },
      { name: 'Temple Tours', hasGuide: true },
      { name: 'Architecture Tours', hasGuide: true }
    ],
    seo: {
      title: 'Kuala Lumpur Tours & Excursions - Top-Rated Activities & Adventures',
      description: 'Discover top-rated Kuala Lumpur tours, excursions, and activities powered by AI. From city tours to cultural experiences, find the perfect way to explore Malaysia\'s dynamic capital.',
      keywords: 'Kuala Lumpur tours, city tours, cultural tours, things to do in Kuala Lumpur',
      primaryKeyword: 'Kuala Lumpur tours',
      secondaryKeywords: [
        'Kuala Lumpur city tours',
        'Kuala Lumpur cultural tours',
        'Kuala Lumpur food tours',
        'Kuala Lumpur shopping tours',
        'Kuala Lumpur temple tours',
        'Things to do in Kuala Lumpur'
      ]
    },
    whyVisit: [
      'Iconic Petronas Towers',
      'Diverse cultural heritage',
      'Excellent shopping and dining',
      'Historic Batu Caves',
      'Modern transportation system',
      'Perfect blend of old and new'
    ],
    bestTimeToVisit: {
      weather: 'Kuala Lumpur has a tropical climate with two seasons. Dry season (May-September) brings sunny weather, while rainy season (October-April) brings monsoon rains.',
      bestMonths: 'May to September offers the best weather with dry conditions.',
      peakSeason: 'June to August brings peak tourist season with ideal weather, larger crowds, and higher prices.',
      offSeason: 'October to April offers lower prices and fewer crowds, though with more rain.'
    },
    gettingAround: 'Excellent public transportation including LRT, MRT, and monorail. Walking and organized tours are perfect for exploring the city.',
    highlights: [
      'Petronas Towers - Iconic skyscrapers',
      'Batu Caves - Hindu temple complex',
      'KL Tower - Communications tower',
      'Chinatown - Historic district',
      'Street Food - Nasi lemak and satay',
      'Shopping Malls - Retail therapy'
    ]
  },
  {
    id: 'langkawi',
    name: 'Langkawi',
    fullName: 'Langkawi',
    country: 'Malaysia',
    category: 'Asia-Pacific',
    briefDescription: 'Tropical paradise, duty-free shopping, and island adventures — Langkawi is Malaysia\'s island gem.',
    heroDescription: 'Welcome to Langkawi, where pristine beaches meet lush rainforests and duty-free shopping creates the perfect island escape in Malaysia\'s archipelago. From stunning beaches to cable car adventures, from mangrove tours to water activities, this tropical paradise offers the perfect blend of relaxation, adventure, and Malaysian island hospitality. Let our AI-powered planner help you discover the best experiences this incredible destination has to offer.',
    imageUrl: 'https://ouqeoizufbofdqbuiwvx.supabase.co/storage/v1/object/public/destinations//Langkawi.jpg',
    tourCategories: [
      { name: 'Island Tours', hasGuide: true },
      { name: 'Beach Tours', hasGuide: true },
      { name: 'Adventure Tours', hasGuide: true },
      { name: 'Water Tours', hasGuide: true },
      { name: 'Shopping Tours', hasGuide: true },
      { name: 'Nature Tours', hasGuide: true }
    ],
    seo: {
      title: 'Langkawi Tours & Excursions - Top-Rated Activities & Adventures',
      description: 'Discover top-rated Langkawi tours, excursions, and activities powered by AI. From island tours to beach adventures, find the perfect way to explore Malaysia\'s tropical paradise.',
      keywords: 'Langkawi tours, island tours, beach tours, things to do in Langkawi',
      primaryKeyword: 'Langkawi tours',
      secondaryKeywords: [
        'Langkawi island tours',
        'Langkawi beach tours',
        'Langkawi adventure tours',
        'Langkawi water tours',
        'Langkawi shopping tours',
        'Things to do in Langkawi'
      ]
    },
    whyVisit: [
      'Beautiful tropical beaches',
      'Duty-free shopping',
      'Cable car adventures',
      'Mangrove tours',
      'Water activities',
      'Perfect blend of relaxation and adventure'
    ],
    bestTimeToVisit: {
      weather: 'Langkawi has a tropical climate with two seasons. Dry season (November-April) brings sunny weather, while rainy season (May-October) brings monsoon rains.',
      bestMonths: 'November to April offers the best weather with dry conditions.',
      peakSeason: 'December to March brings peak tourist season with ideal weather, larger crowds, and higher prices.',
      offSeason: 'May to October offers lower prices and fewer crowds, though with more rain.'
    },
    gettingAround: 'Renting a car or motorbike is popular. Organized tours include transportation, and taxis are available for shorter trips.',
    highlights: [
      'Cenang Beach - Famous beach',
      'Langkawi Cable Car - Mountain views',
      'Mangrove Tours - Natural beauty',
      'Duty-Free Shopping - Retail therapy',
      'Water Activities - Snorkeling and diving',
      'Island Hopping - Explore nearby islands'
    ]
  },
  {
    id: 'penang',
    name: 'Penang',
    fullName: 'Penang',
    country: 'Malaysia',
    category: 'Asia-Pacific',
    briefDescription: 'Cultural melting pot, street art, and culinary paradise — Penang is Malaysia\'s cultural heart.',
    heroDescription: 'Welcome to Penang, where historic George Town meets vibrant street art and incredible food creates a cultural feast in Malaysia\'s most diverse state. From UNESCO World Heritage sites to street art murals, from hawker food to historic temples, this cultural melting pot offers the perfect blend of heritage, creativity, and Malaysian hospitality. Let our AI-powered planner help you discover the best experiences this incredible destination has to offer.',
    imageUrl: 'https://ouqeoizufbofdqbuiwvx.supabase.co/storage/v1/object/public/destinations//Penang.jpg',
    tourCategories: [
      { name: 'Cultural Tours', hasGuide: true },
      { name: 'Food Tours', hasGuide: true },
      { name: 'Historic Tours', hasGuide: true },
      { name: 'Street Art Tours', hasGuide: true },
      { name: 'Temple Tours', hasGuide: true },
      { name: 'Photography Tours', hasGuide: true }
    ],
    seo: {
      title: 'Penang Tours & Excursions - Top-Rated Activities & Adventures',
      description: 'Discover top-rated Penang tours, excursions, and activities powered by AI. From cultural tours to food experiences, find the perfect way to explore Malaysia\'s cultural heart.',
      keywords: 'Penang tours, cultural tours, food tours, things to do in Penang',
      primaryKeyword: 'Penang tours',
      secondaryKeywords: [
        'Penang cultural tours',
        'Penang food tours',
        'Penang historic tours',
        'Penang street art tours',
        'Penang temple tours',
        'Things to do in Penang'
      ]
    },
    whyVisit: [
      'UNESCO World Heritage George Town',
      'Famous street art murals',
      'Incredible hawker food',
      'Diverse cultural heritage',
      'Historic temples and mosques',
      'Perfect blend of culture and creativity'
    ],
    bestTimeToVisit: {
      weather: 'Penang has a tropical climate with two seasons. Dry season (December-March) brings pleasant weather, while rainy season (April-November) brings monsoon rains.',
      bestMonths: 'December to March offers the best weather with pleasant conditions.',
      peakSeason: 'December to February brings peak tourist season with ideal weather, larger crowds, and higher prices.',
      offSeason: 'April to November offers lower prices and fewer crowds, though with more rain.'
    },
    gettingAround: 'Walking is perfect for exploring George Town. Organized tours include transportation, and public buses connect to other areas.',
    highlights: [
      'George Town - UNESCO World Heritage site',
      'Street Art Murals - Famous artworks',
      'Hawker Food - Char kway teow and laksa',
      'Kek Lok Si Temple - Buddhist temple',
      'Penang Hill - Mountain views',
      'Historic Architecture - Colonial buildings'
    ]
  },
  {
    id: 'singapore',
    name: 'Singapore',
    fullName: 'Singapore',
    country: 'Singapore',
    category: 'Asia-Pacific',
    briefDescription: 'Garden city, modern marvel, and cultural crossroads — Singapore is Asia\'s shining star.',
    heroDescription: 'Welcome to Singapore, where futuristic architecture meets lush gardens and diverse cultures create a world-class city-state in the heart of Asia. From the iconic Marina Bay Sands to the stunning Gardens by the Bay, from world-class shopping to incredible food, this modern marvel offers the perfect blend of innovation, nature, and Singaporean hospitality. Let our AI-powered planner help you discover the best experiences this incredible destination has to offer.',
    imageUrl: 'https://ouqeoizufbofdqbuiwvx.supabase.co/storage/v1/object/public/destinations//Singapore.webp',
    tourCategories: [
      { name: 'City Tours', hasGuide: true },
      { name: 'Cultural Tours', hasGuide: true },
      { name: 'Food Tours', hasGuide: true },
      { name: 'Shopping Tours', hasGuide: true },
      { name: 'Garden Tours', hasGuide: true },
      { name: 'Architecture Tours', hasGuide: true }
    ],
    seo: {
      title: 'Singapore Tours & Excursions - Top-Rated Activities & Adventures',
      description: 'Discover top-rated Singapore tours, excursions, and activities powered by AI. From city tours to cultural experiences, find the perfect way to explore Asia\'s shining star.',
      keywords: 'Singapore tours, city tours, cultural tours, things to do in Singapore',
      primaryKeyword: 'Singapore tours',
      secondaryKeywords: [
        'Singapore city tours',
        'Singapore cultural tours',
        'Singapore food tours',
        'Singapore shopping tours',
        'Singapore garden tours',
        'Things to do in Singapore'
      ]
    },
    whyVisit: [
      'Iconic Marina Bay Sands',
      'Stunning Gardens by the Bay',
      'World-class shopping and dining',
      'Efficient public transportation',
      'Diverse cultural heritage',
      'Perfect blend of nature and innovation'
    ],
    bestTimeToVisit: {
      weather: 'Singapore has a tropical climate with two seasons. Dry season (February-September) brings pleasant weather, while rainy season (October-January) brings monsoon rains.',
      bestMonths: 'February to September offers the best weather with pleasant conditions.',
      peakSeason: 'June to August brings peak tourist season with ideal weather, larger crowds, and higher prices.',
      offSeason: 'October to January offers lower prices and fewer crowds, though with more rain.'
    },
    gettingAround: 'Excellent public transportation including MRT, buses, and taxis. Walking and organized tours are perfect for exploring the city.',
    highlights: [
      'Marina Bay Sands - Iconic hotel',
      'Gardens by the Bay - Botanical wonder',
      'Sentosa Island - Entertainment hub',
      'Chinatown - Historic district',
      'Street Food - Hainanese chicken rice',
      'Orchard Road - Shopping paradise'
    ]
  },
  {
    id: 'beijing',
    name: 'Beijing',
    fullName: 'Beijing',
    country: 'China',
    category: 'Asia-Pacific',
    briefDescription: 'Ancient capital, imperial grandeur, and cultural treasure — Beijing is China\'s historic heart.',
    heroDescription: 'Welcome to Beijing, where the Great Wall meets the Forbidden City and thousands of years of Chinese history come alive in the nation\'s capital. From the iconic Great Wall to the majestic Temple of Heaven, from traditional hutongs to modern skyscrapers, this ancient capital offers the perfect blend of history, culture, and Chinese hospitality. Let our AI-powered planner help you discover the best experiences this incredible destination has to offer.',
    imageUrl: 'https://ouqeoizufbofdqbuiwvx.supabase.co/storage/v1/object/public/destinations//Beijing.jpg',
    tourCategories: [
      { name: 'Historic Tours', hasGuide: true },
      { name: 'Cultural Tours', hasGuide: true },
      { name: 'Great Wall Tours', hasGuide: true },
      { name: 'Temple Tours', hasGuide: true },
      { name: 'Food Tours', hasGuide: true },
      { name: 'Architecture Tours', hasGuide: true }
    ],
    seo: {
      title: 'Beijing Tours & Excursions - Top-Rated Activities & Adventures',
      description: 'Discover top-rated Beijing tours, excursions, and activities powered by AI. From historic tours to Great Wall experiences, find the perfect way to explore China\'s ancient capital.',
      keywords: 'Beijing tours, historic tours, Great Wall tours, things to do in Beijing',
      primaryKeyword: 'Beijing tours',
      secondaryKeywords: [
        'Beijing historic tours',
        'Beijing Great Wall tours',
        'Beijing cultural tours',
        'Beijing temple tours',
        'Beijing food tours',
        'Things to do in Beijing'
      ]
    },
    whyVisit: [
      'Iconic Great Wall of China',
      'Forbidden City palace complex',
      'Rich cultural heritage',
      'Traditional hutong neighborhoods',
      'Excellent food scene',
      'Perfect blend of ancient and modern'
    ],
    bestTimeToVisit: {
      weather: 'Beijing has four distinct seasons. Spring (March-May) and autumn (September-November) are pleasant, summer (June-August) is hot and humid, and winter (December-February) is cold.',
      bestMonths: 'March to May and September to November offer the best weather with pleasant temperatures.',
      peakSeason: 'April to May and September to October brings peak tourist season with ideal weather, larger crowds, and higher prices.',
      offSeason: 'December to February offers lower prices but cold weather.'
    },
    gettingAround: 'Excellent public transportation including metro, buses, and taxis. Walking and organized tours are perfect for exploring the city.',
    highlights: [
      'Great Wall of China - Iconic landmark',
      'Forbidden City - Imperial palace',
      'Temple of Heaven - Historic temple',
      'Summer Palace - Imperial gardens',
      'Hutong Neighborhoods - Traditional areas',
      'Tiananmen Square - Historic square'
    ]
  },
  {
    id: 'shanghai',
    name: 'Shanghai',
    fullName: 'Shanghai',
    country: 'China',
    category: 'Asia-Pacific',
    briefDescription: 'Modern metropolis, financial hub, and cultural crossroads — Shanghai is China\'s dynamic heart.',
    heroDescription: 'Welcome to Shanghai, where the futuristic skyline meets historic neighborhoods and the energy of China\'s largest city creates an unforgettable experience. From the iconic Bund to the modern Pudong district, from traditional gardens to world-class shopping, this modern metropolis offers the perfect blend of tradition, innovation, and Chinese urban life. Let our AI-powered planner help you discover the best experiences this incredible destination has to offer.',
    imageUrl: 'https://ouqeoizufbofdqbuiwvx.supabase.co/storage/v1/object/public/destinations//Shanghai.jpg',
    tourCategories: [
      { name: 'City Tours', hasGuide: true },
      { name: 'Cultural Tours', hasGuide: true },
      { name: 'Architecture Tours', hasGuide: true },
      { name: 'Food Tours', hasGuide: true },
      { name: 'Shopping Tours', hasGuide: true },
      { name: 'Garden Tours', hasGuide: true }
    ],
    seo: {
      title: 'Shanghai Tours & Excursions - Top-Rated Activities & Adventures',
      description: 'Discover top-rated Shanghai tours, excursions, and activities powered by AI. From city tours to cultural experiences, find the perfect way to explore China\'s dynamic metropolis.',
      keywords: 'Shanghai tours, city tours, cultural tours, things to do in Shanghai',
      primaryKeyword: 'Shanghai tours',
      secondaryKeywords: [
        'Shanghai city tours',
        'Shanghai cultural tours',
        'Shanghai architecture tours',
        'Shanghai food tours',
        'Shanghai shopping tours',
        'Things to do in Shanghai'
      ]
    },
    whyVisit: [
      'Iconic Bund waterfront',
      'Futuristic Pudong skyline',
      'Excellent shopping and dining',
      'Rich cultural heritage',
      'Modern transportation system',
      'Perfect blend of old and new'
    ],
    bestTimeToVisit: {
      weather: 'Shanghai has four distinct seasons. Spring (March-May) and autumn (September-November) are pleasant, summer (June-August) is hot and humid, and winter (December-February) is cool.',
      bestMonths: 'March to May and September to November offer the best weather with pleasant temperatures.',
      peakSeason: 'April to May and September to October brings peak tourist season with ideal weather, larger crowds, and higher prices.',
      offSeason: 'December to February offers lower prices but cooler weather.'
    },
    gettingAround: 'Excellent public transportation including metro, buses, and taxis. Walking and organized tours are perfect for exploring the city.',
    highlights: [
      'The Bund - Historic waterfront',
      'Pudong Skyline - Modern architecture',
      'Yu Garden - Traditional garden',
      'Nanjing Road - Shopping street',
      'Shanghai Tower - Tallest building',
      'French Concession - Historic district'
    ]
  },
  {
    id: 'xian',
    name: 'Xi\'an',
    fullName: 'Xi\'an',
    country: 'China',
    category: 'Asia-Pacific',
    briefDescription: 'Ancient capital, terracotta warriors, and Silk Road heritage — Xi\'an is China\'s historic treasure.',
    heroDescription: 'Welcome to Xi\'an, where the legendary Terracotta Warriors guard ancient secrets and the Silk Road heritage comes alive in China\'s former imperial capital. From the magnificent Terracotta Army to the historic Muslim Quarter, from ancient city walls to incredible food, this historic treasure offers the perfect blend of archaeology, culture, and Chinese heritage. Let our AI-powered planner help you discover the best experiences this incredible destination has to offer.',
    imageUrl: 'https://ouqeoizufbofdqbuiwvx.supabase.co/storage/v1/object/public/destinations//Xi%20an.jpg',
    tourCategories: [
      { name: 'Historic Tours', hasGuide: true },
      { name: 'Archaeological Tours', hasGuide: true },
      { name: 'Cultural Tours', hasGuide: true },
      { name: 'Food Tours', hasGuide: true },
      { name: 'Temple Tours', hasGuide: true },
      { name: 'City Wall Tours', hasGuide: true }
    ],
    seo: {
      title: 'Xi\'an Tours & Excursions - Top-Rated Activities & Adventures',
      description: 'Discover top-rated Xi\'an tours, excursions, and activities powered by AI. From historic tours to archaeological experiences, find the perfect way to explore China\'s historic treasure.',
      keywords: 'Xi\'an tours, historic tours, terracotta warriors, things to do in Xi\'an',
      primaryKeyword: 'Xi\'an tours',
      secondaryKeywords: [
        'Xi\'an historic tours',
        'Xi\'an terracotta warriors tours',
        'Xi\'an cultural tours',
        'Xi\'an food tours',
        'Xi\'an temple tours',
        'Things to do in Xi\'an'
      ]
    },
    whyVisit: [
      'Famous Terracotta Warriors',
      'Ancient city walls',
      'Historic Muslim Quarter',
      'Silk Road heritage',
      'Excellent food scene',
      'Perfect blend of history and culture'
    ],
    bestTimeToVisit: {
      weather: 'Xi\'an has four distinct seasons. Spring (March-May) and autumn (September-November) are pleasant, summer (June-August) is hot, and winter (December-February) is cold.',
      bestMonths: 'March to May and September to November offer the best weather with pleasant temperatures.',
      peakSeason: 'April to May and September to October brings peak tourist season with ideal weather, larger crowds, and higher prices.',
      offSeason: 'December to February offers lower prices but cold weather.'
    },
    gettingAround: 'Good public transportation including buses and metro. Walking and organized tours are perfect for exploring the city.',
    highlights: [
      'Terracotta Warriors - Archaeological wonder',
      'Ancient City Wall - Historic fortification',
      'Muslim Quarter - Cultural district',
      'Big Wild Goose Pagoda - Buddhist temple',
      'Bell Tower - Historic landmark',
      'Street Food - Roujiamo and biang biang noodles'
    ]
  },
  {
    id: 'guilin',
    name: 'Guilin',
    fullName: 'Guilin',
    country: 'China',
    category: 'Asia-Pacific',
    briefDescription: 'Karst mountains, Li River beauty, and natural wonder — Guilin is China\'s scenic paradise.',
    heroDescription: 'Welcome to Guilin, where dramatic karst mountains rise from the Li River and traditional villages create scenes of timeless beauty in China\'s most picturesque region. From stunning river cruises to mountain adventures, from ancient villages to natural caves, this scenic paradise offers the perfect blend of nature, culture, and Chinese rural life. Let our AI-powered planner help you discover the best experiences this incredible destination has to offer.',
    imageUrl: 'https://ouqeoizufbofdqbuiwvx.supabase.co/storage/v1/object/public/destinations//Guilin.jpg',
    tourCategories: [
      { name: 'Nature Tours', hasGuide: true },
      { name: 'River Tours', hasGuide: true },
      { name: 'Mountain Tours', hasGuide: true },
      { name: 'Cultural Tours', hasGuide: true },
      { name: 'Photography Tours', hasGuide: true },
      { name: 'Adventure Tours', hasGuide: true }
    ],
    seo: {
      title: 'Guilin Tours & Excursions - Top-Rated Activities & Adventures',
      description: 'Discover top-rated Guilin tours, excursions, and activities powered by AI. From nature tours to river experiences, find the perfect way to explore China\'s scenic paradise.',
      keywords: 'Guilin tours, nature tours, Li River tours, things to do in Guilin',
      primaryKeyword: 'Guilin tours',
      secondaryKeywords: [
        'Guilin nature tours',
        'Guilin Li River tours',
        'Guilin mountain tours',
        'Guilin cultural tours',
        'Guilin photography tours',
        'Things to do in Guilin'
      ]
    },
    whyVisit: [
      'Dramatic karst mountains',
      'Beautiful Li River',
      'Traditional villages',
      'Natural cave systems',
      'Stunning landscapes',
      'Perfect blend of nature and culture'
    ],
    bestTimeToVisit: {
      weather: 'Guilin has four distinct seasons. Spring (March-May) and autumn (September-November) are pleasant, summer (June-August) is hot and humid, and winter (December-February) is cool.',
      bestMonths: 'March to May and September to November offer the best weather with pleasant temperatures.',
      peakSeason: 'April to May and September to October brings peak tourist season with ideal weather, larger crowds, and higher prices.',
      offSeason: 'December to February offers lower prices but cooler weather.'
    },
    gettingAround: 'Organized tours are the best way to explore the region. Public buses connect major attractions.',
    highlights: [
      'Li River Cruise - Scenic boat ride',
      'Yangshuo - Beautiful countryside',
      'Reed Flute Cave - Natural wonder',
      'Elephant Trunk Hill - Iconic landmark',
      'Traditional Villages - Local culture',
      'Karst Mountains - Dramatic landscapes'
    ]
  },
  {
    id: 'seoul',
    name: 'Seoul',
    fullName: 'Seoul',
    country: 'South Korea',
    category: 'Asia-Pacific',
    briefDescription: 'Modern metropolis, K-pop culture, and traditional heritage — Seoul is South Korea\'s dynamic heart.',
    heroDescription: 'Welcome to Seoul, where ancient palaces meet cutting-edge technology and K-pop culture creates a vibrant energy in South Korea\'s capital. From the historic Gyeongbokgung Palace to the modern Gangnam district, from traditional markets to world-class shopping, this dynamic metropolis offers the perfect blend of tradition, innovation, and Korean hospitality. Let our AI-powered planner help you discover the best experiences this incredible destination has to offer.',
    imageUrl: 'https://ouqeoizufbofdqbuiwvx.supabase.co/storage/v1/object/public/destinations//Seoul.webp',
    tourCategories: [
      { name: 'City Tours', hasGuide: true },
      { name: 'Cultural Tours', hasGuide: true },
      { name: 'Palace Tours', hasGuide: true },
      { name: 'Food Tours', hasGuide: true },
      { name: 'Shopping Tours', hasGuide: true },
      { name: 'K-pop Tours', hasGuide: true }
    ],
    seo: {
      title: 'Seoul Tours & Excursions - Top-Rated Activities & Adventures',
      description: 'Discover top-rated Seoul tours, excursions, and activities powered by AI. From city tours to cultural experiences, find the perfect way to explore South Korea\'s dynamic capital.',
      keywords: 'Seoul tours, city tours, cultural tours, things to do in Seoul',
      primaryKeyword: 'Seoul tours',
      secondaryKeywords: [
        'Seoul city tours',
        'Seoul cultural tours',
        'Seoul palace tours',
        'Seoul food tours',
        'Seoul shopping tours',
        'Things to do in Seoul'
      ]
    },
    whyVisit: [
      'Historic palaces and temples',
      'Modern Gangnam district',
      'K-pop and entertainment culture',
      'Excellent food scene',
      'Efficient public transportation',
      'Perfect blend of old and new'
    ],
    bestTimeToVisit: {
      weather: 'Seoul has four distinct seasons. Spring (March-May) brings cherry blossoms, summer (June-August) is hot and humid, autumn (September-November) has beautiful fall colors, and winter (December-February) is cold.',
      bestMonths: 'March to May and September to November offer the best weather with pleasant temperatures.',
      peakSeason: 'March to May brings cherry blossom season with beautiful weather, larger crowds, and higher prices.',
      offSeason: 'December to February offers lower prices but cold weather.'
    },
    gettingAround: 'Excellent public transportation including metro, buses, and taxis. Walking and organized tours are perfect for exploring the city.',
    highlights: [
      'Gyeongbokgung Palace - Historic palace',
      'Gangnam District - Modern area',
      'Myeongdong - Shopping district',
      'Namsan Seoul Tower - City views',
      'Street Food - Korean barbecue',
      'Bukchon Hanok Village - Traditional houses'
    ]
  },
  {
    id: 'busan',
    name: 'Busan',
    fullName: 'Busan',
    country: 'South Korea',
    category: 'Asia-Pacific',
    briefDescription: 'Coastal charm, seafood paradise, and cultural heritage — Busan is South Korea\'s port city.',
    heroDescription: 'Welcome to Busan, where beautiful beaches meet historic temples and fresh seafood creates a coastal paradise in South Korea\'s second-largest city. From the stunning Gamcheon Culture Village to the historic Beomeosa Temple, from fresh seafood markets to beautiful beaches, this coastal gem offers the perfect blend of nature, culture, and Korean coastal life. Let our AI-powered planner help you discover the best experiences this incredible destination has to offer.',
    imageUrl: 'https://ouqeoizufbofdqbuiwvx.supabase.co/storage/v1/object/public/destinations//Busan.jpeg',
    tourCategories: [
      { name: 'Cultural Tours', hasGuide: true },
      { name: 'Beach Tours', hasGuide: true },
      { name: 'Food Tours', hasGuide: true },
      { name: 'Temple Tours', hasGuide: true },
      { name: 'Market Tours', hasGuide: true },
      { name: 'Photography Tours', hasGuide: true }
    ],
    seo: {
      title: 'Busan Tours & Excursions - Top-Rated Activities & Adventures',
      description: 'Discover top-rated Busan tours, excursions, and activities powered by AI. From cultural tours to beach experiences, find the perfect way to explore South Korea\'s coastal paradise.',
      keywords: 'Busan tours, cultural tours, beach tours, things to do in Busan',
      primaryKeyword: 'Busan tours',
      secondaryKeywords: [
        'Busan cultural tours',
        'Busan beach tours',
        'Busan food tours',
        'Busan temple tours',
        'Busan market tours',
        'Things to do in Busan'
      ]
    },
    whyVisit: [
      'Beautiful coastal scenery',
      'Fresh seafood markets',
      'Historic temples',
      'Colorful Gamcheon Village',
      'Excellent food scene',
      'Perfect blend of nature and culture'
    ],
    bestTimeToVisit: {
      weather: 'Busan has four distinct seasons. Spring (March-May) and autumn (September-November) are pleasant, summer (June-August) is hot and humid, and winter (December-February) is mild.',
      bestMonths: 'March to May and September to November offer the best weather with pleasant temperatures.',
      peakSeason: 'March to May brings peak tourist season with ideal weather, larger crowds, and higher prices.',
      offSeason: 'December to February offers lower prices and fewer crowds.'
    },
    gettingAround: 'Good public transportation including metro and buses. Walking and organized tours are perfect for exploring the city.',
    highlights: [
      'Gamcheon Culture Village - Colorful district',
      'Beomeosa Temple - Historic temple',
      'Jagalchi Fish Market - Seafood market',
      'Haeundae Beach - Famous beach',
      'Gwangalli Beach - Beautiful beach',
      'Street Food - Fresh seafood and Korean dishes'
    ]
  },
  {
    id: 'jeju-island',
    name: 'Jeju Island',
    fullName: 'Jeju Island',
    country: 'South Korea',
    category: 'Asia-Pacific',
    briefDescription: 'Volcanic paradise, natural wonders, and island charm — Jeju Island is South Korea\'s island gem.',
    heroDescription: 'Welcome to Jeju Island, where volcanic landscapes meet pristine beaches and natural wonders create a paradise in South Korea\'s largest island. From the majestic Hallasan volcano to stunning waterfalls, from beautiful beaches to traditional villages, this volcanic paradise offers the perfect blend of nature, adventure, and Korean island hospitality. Let our AI-powered planner help you discover the best experiences this incredible destination has to offer.',
    imageUrl: 'https://ouqeoizufbofdqbuiwvx.supabase.co/storage/v1/object/public/destinations//Jeju%20Island.jpeg',
    tourCategories: [
      { name: 'Nature Tours', hasGuide: true },
      { name: 'Volcano Tours', hasGuide: true },
      { name: 'Beach Tours', hasGuide: true },
      { name: 'Adventure Tours', hasGuide: true },
      { name: 'Cultural Tours', hasGuide: true },
      { name: 'Photography Tours', hasGuide: true }
    ],
    seo: {
      title: 'Jeju Island Tours & Excursions - Top-Rated Activities & Adventures',
      description: 'Discover top-rated Jeju Island tours, excursions, and activities powered by AI. From nature tours to volcano experiences, find the perfect way to explore South Korea\'s island paradise.',
      keywords: 'Jeju Island tours, nature tours, volcano tours, things to do in Jeju Island',
      primaryKeyword: 'Jeju Island tours',
      secondaryKeywords: [
        'Jeju Island nature tours',
        'Jeju Island volcano tours',
        'Jeju Island beach tours',
        'Jeju Island adventure tours',
        'Jeju Island cultural tours',
        'Things to do in Jeju Island'
      ]
    },
    whyVisit: [
      'UNESCO World Heritage site',
      'Majestic Hallasan volcano',
      'Beautiful beaches',
      'Stunning waterfalls',
      'Traditional villages',
      'Perfect blend of nature and culture'
    ],
    bestTimeToVisit: {
      weather: 'Jeju Island has four distinct seasons. Spring (March-May) and autumn (September-November) are pleasant, summer (June-August) is warm, and winter (December-February) is mild.',
      bestMonths: 'March to May and September to November offer the best weather with pleasant temperatures.',
      peakSeason: 'March to May brings peak tourist season with ideal weather, larger crowds, and higher prices.',
      offSeason: 'December to February offers lower prices and fewer crowds.'
    },
    gettingAround: 'Renting a car is recommended for exploring the island. Organized tours include transportation.',
    highlights: [
      'Hallasan Volcano - Majestic peak',
      'Seongsan Ilchulbong - Sunrise peak',
      'Manjanggul Cave - Lava tube',
      'Cheonjeyeon Falls - Beautiful waterfall',
      'Hamdeok Beach - Pristine beach',
      'Traditional Villages - Local culture'
    ]
  },
  // Philippines Destinations
  {
    id: 'manila',
    name: 'Manila',
    fullName: 'Manila',
    country: 'Philippines',
    category: 'Asia-Pacific',
    briefDescription: 'Historic capital with Spanish colonial heritage, vibrant culture, and modern energy — Manila is the heart of the Philippines.',
    heroDescription: 'Welcome to Manila, where Spanish colonial architecture meets Filipino hospitality and modern urban energy creates a dynamic capital experience. From the historic Intramuros district to the vibrant Makati business center, from traditional jeepney rides to world-class shopping, this bustling metropolis offers the perfect blend of history, culture, and contemporary Filipino life. Let our AI-powered planner help you discover the best experiences this incredible city has to offer.',
    imageUrl: 'https://ouqeoizufbofdqbuiwvx.supabase.co/storage/v1/object/public/destinations//Manila.jpeg',
    tourCategories: [
      { name: 'Cultural Tours', hasGuide: true },
      { name: 'Historic Tours', hasGuide: true },
      { name: 'City Tours', hasGuide: true },
      { name: 'Food Tours', hasGuide: true },
      { name: 'Shopping Tours', hasGuide: true },
      { name: 'Architecture Tours', hasGuide: true }
    ],
    seo: {
      title: 'Manila Tours & Excursions - Top-Rated Activities & Adventures',
      description: 'Discover top-rated Manila tours, excursions, and activities powered by AI. From historic tours to food experiences, find the perfect way to explore the Philippines\' vibrant capital.',
      keywords: 'Manila tours, cultural tours, historic tours, things to do in Manila',
      primaryKeyword: 'Manila tours',
      secondaryKeywords: [
        'Manila cultural tours',
        'Manila historic tours',
        'Manila city tours',
        'Manila food tours',
        'Manila shopping tours',
        'Things to do in Manila'
      ]
    },
    whyVisit: [
      'Rich Spanish colonial heritage',
      'Vibrant Filipino culture',
      'Excellent shopping and dining',
      'Historic Intramuros district',
      'Modern business districts',
      'Warm Filipino hospitality'
    ],
    bestTimeToVisit: {
      weather: 'Manila has a tropical climate with two seasons. Dry season (November-April) is hot and sunny, while wet season (May-October) brings rain and humidity.',
      bestMonths: 'November to April offers the best weather with less rain and pleasant temperatures.',
      peakSeason: 'December to February brings peak tourist season with ideal weather, larger crowds, and higher prices.',
      offSeason: 'May to October offers lower prices but frequent rain and high humidity.'
    },
    gettingAround: 'Jeepneys and taxis are common. Organized tours include transportation, and the MRT/LRT systems connect major areas.',
    highlights: [
      'Intramuros - Historic walled city',
      'Rizal Park - National monument',
      'Binondo - Chinatown district',
      'Makati - Modern business center',
      'Manila Bay - Sunset views',
      'Traditional jeepney rides'
    ]
  },
  {
    id: 'cebu',
    name: 'Cebu',
    fullName: 'Cebu',
    country: 'Philippines',
    category: 'Asia-Pacific',
    briefDescription: 'Island paradise with pristine beaches, historic sites, and adventure activities — Cebu is the Philippines\' adventure capital.',
    heroDescription: 'Welcome to Cebu, where pristine beaches meet historic landmarks and thrilling adventures create an unforgettable island experience. From the crystal-clear waters of Malapascua to the historic Magellan\'s Cross, from world-class diving spots to cascading waterfalls, this diverse island offers the perfect blend of natural beauty, history, and adrenaline-pumping activities. Let our AI-powered planner help you discover the best experiences this incredible destination has to offer.',
    imageUrl: 'https://ouqeoizufbofdqbuiwvx.supabase.co/storage/v1/object/public/destinations//Cebu.jpeg',
    tourCategories: [
      { name: 'Adventure Tours', hasGuide: true },
      { name: 'Beach Tours', hasGuide: true },
      { name: 'Diving Tours', hasGuide: true },
      { name: 'Cultural Tours', hasGuide: true },
      { name: 'Waterfall Tours', hasGuide: true },
      { name: 'Island Tours', hasGuide: true }
    ],
    seo: {
      title: 'Cebu Tours & Excursions - Top-Rated Activities & Adventures',
      description: 'Discover top-rated Cebu tours, excursions, and activities powered by AI. From diving adventures to beach experiences, find the perfect way to explore this Philippine paradise.',
      keywords: 'Cebu tours, diving tours, beach tours, things to do in Cebu',
      primaryKeyword: 'Cebu tours',
      secondaryKeywords: [
        'Cebu diving tours',
        'Cebu beach tours',
        'Cebu adventure tours',
        'Cebu island tours',
        'Cebu waterfall tours',
        'Things to do in Cebu'
      ]
    },
    whyVisit: [
      'World-class diving spots',
      'Pristine beaches',
      'Historic landmarks',
      'Adventure activities',
      'Cascading waterfalls',
      'Island hopping opportunities'
    ],
    bestTimeToVisit: {
      weather: 'Cebu has a tropical climate with two seasons. Dry season (November-April) is hot and sunny, while wet season (May-October) brings rain and humidity.',
      bestMonths: 'November to April offers the best weather with less rain and ideal conditions for outdoor activities.',
      peakSeason: 'December to February brings peak tourist season with perfect weather, larger crowds, and higher prices.',
      offSeason: 'May to October offers lower prices but frequent rain and potential typhoons.'
    },
    gettingAround: 'Organized tours include transportation. Renting a car or motorcycle is popular for independent exploration.',
    highlights: [
      'Malapascua Island - Diving paradise',
      'Kawasan Falls - Turquoise waters',
      'Magellan\'s Cross - Historic site',
      'Oslob - Whale shark watching',
      'Moalboal - Marine sanctuary',
      'Bantayan Island - White sand beaches'
    ]
  },
  {
    id: 'palawan',
    name: 'Palawan',
    fullName: 'Palawan',
    country: 'Philippines',
    category: 'Asia-Pacific',
    briefDescription: 'Pristine paradise with limestone cliffs, crystal-clear waters, and untouched beauty — Palawan is nature\'s masterpiece.',
    heroDescription: 'Welcome to Palawan, where limestone karsts meet turquoise waters and pristine nature creates one of the world\'s most beautiful destinations. From the dramatic landscapes of El Nido to the underground river of Puerto Princesa, from hidden lagoons to vibrant coral reefs, this UNESCO World Heritage site offers the perfect blend of natural wonders, adventure, and serenity. Let our AI-powered planner help you discover the best experiences this incredible paradise has to offer.',
    imageUrl: 'https://ouqeoizufbofdqbuiwvx.supabase.co/storage/v1/object/public/destinations//Palawan.avif',
    tourCategories: [
      { name: 'Nature Tours', hasGuide: true },
      { name: 'Adventure Tours', hasGuide: true },
      { name: 'Island Tours', hasGuide: true },
      { name: 'Diving Tours', hasGuide: true },
      { name: 'Cave Tours', hasGuide: true },
      { name: 'Beach Tours', hasGuide: true }
    ],
    seo: {
      title: 'Palawan Tours & Excursions - Top-Rated Activities & Adventures',
      description: 'Discover top-rated Palawan tours, excursions, and activities powered by AI. From island hopping to cave exploration, find the perfect way to explore this natural paradise.',
      keywords: 'Palawan tours, island tours, nature tours, things to do in Palawan',
      primaryKeyword: 'Palawan tours',
      secondaryKeywords: [
        'Palawan island tours',
        'Palawan nature tours',
        'Palawan adventure tours',
        'Palawan diving tours',
        'Palawan cave tours',
        'Things to do in Palawan'
      ]
    },
    whyVisit: [
      'UNESCO World Heritage sites',
      'Limestone karst formations',
      'Crystal-clear waters',
      'Pristine beaches',
      'Underground river',
      'World-class diving'
    ],
    bestTimeToVisit: {
      weather: 'Palawan has a tropical climate with two seasons. Dry season (November-April) is hot and sunny, while wet season (May-October) brings rain and humidity.',
      bestMonths: 'November to April offers the best weather with less rain and ideal conditions for outdoor activities.',
      peakSeason: 'December to February brings peak tourist season with perfect weather, larger crowds, and higher prices.',
      offSeason: 'May to October offers lower prices but frequent rain and potential typhoons.'
    },
    gettingAround: 'Organized tours include transportation. Island hopping tours are the best way to explore the archipelago.',
    highlights: [
      'El Nido - Limestone cliffs',
      'Puerto Princesa Underground River - UNESCO site',
      'Coron - Wreck diving',
      'Hidden lagoons - Secret beaches',
      'Kayangan Lake - Crystal-clear waters',
      'Big Lagoon - Pristine beauty'
    ]
  },
  {
    id: 'boracay',
    name: 'Boracay',
    fullName: 'Boracay',
    country: 'Philippines',
    category: 'Asia-Pacific',
    briefDescription: 'Tropical paradise with powdery white sand, crystal-clear waters, and vibrant nightlife — Boracay is beach perfection.',
    heroDescription: 'Welcome to Boracay, where powdery white sand meets crystal-clear waters and vibrant energy creates the perfect beach paradise. From the famous White Beach to the thrilling water sports, from stunning sunsets to lively nightlife, this small island offers the perfect blend of relaxation, adventure, and entertainment. Let our AI-powered planner help you discover the best experiences this incredible destination has to offer.',
    imageUrl: 'https://ouqeoizufbofdqbuiwvx.supabase.co/storage/v1/object/public/destinations//Boracay.jpeg',
    tourCategories: [
      { name: 'Beach Tours', hasGuide: true },
      { name: 'Water Sports Tours', hasGuide: true },
      { name: 'Sunset Tours', hasGuide: true },
      { name: 'Island Tours', hasGuide: true },
      { name: 'Adventure Tours', hasGuide: true },
      { name: 'Nightlife Tours', hasGuide: true }
    ],
    seo: {
      title: 'Boracay Tours & Excursions - Top-Rated Activities & Adventures',
      description: 'Discover top-rated Boracay tours, excursions, and activities powered by AI. From beach activities to water sports, find the perfect way to explore this tropical paradise.',
      keywords: 'Boracay tours, beach tours, water sports, things to do in Boracay',
      primaryKeyword: 'Boracay tours',
      secondaryKeywords: [
        'Boracay beach tours',
        'Boracay water sports',
        'Boracay sunset tours',
        'Boracay island tours',
        'Boracay adventure tours',
        'Things to do in Boracay'
      ]
    },
    whyVisit: [
      'Powdery white sand beaches',
      'Crystal-clear waters',
      'Stunning sunsets',
      'Water sports activities',
      'Vibrant nightlife',
      'Perfect tropical weather'
    ],
    bestTimeToVisit: {
      weather: 'Boracay has a tropical climate with two seasons. Dry season (November-April) is hot and sunny, while wet season (May-October) brings rain and humidity.',
      bestMonths: 'November to April offers the best weather with less rain and ideal beach conditions.',
      peakSeason: 'December to February brings peak tourist season with perfect weather, larger crowds, and higher prices.',
      offSeason: 'May to October offers lower prices but frequent rain and potential typhoons.'
    },
    gettingAround: 'Walking and tricycles are the main transportation. Organized tours include transportation for island activities.',
    highlights: [
      'White Beach - Famous shoreline',
      'Puka Shell Beach - Natural beauty',
      'D\'Mall - Shopping and dining',
      'Mount Luho - Panoramic views',
      'Water sports - Parasailing, diving',
      'Sunset sailing - Romantic cruises'
    ]
  },
  // India Destinations
  {
    id: 'new-delhi',
    name: 'New Delhi',
    fullName: 'New Delhi',
    country: 'India',
    category: 'Asia-Pacific',
    briefDescription: 'Historic capital with Mughal monuments, colonial architecture, and vibrant culture — New Delhi is India\'s political heart.',
    heroDescription: 'Welcome to New Delhi, where ancient Mughal monuments meet British colonial architecture and modern Indian energy creates a fascinating capital experience. From the majestic Red Fort to the peaceful Humayun\'s Tomb, from bustling markets to elegant government buildings, this historic city offers the perfect blend of history, culture, and contemporary Indian life. Let our AI-powered planner help you discover the best experiences this incredible destination has to offer.',
    imageUrl: 'https://ouqeoizufbofdqbuiwvx.supabase.co/storage/v1/object/public/destinations//New%20Delhi.jpeg',
    tourCategories: [
      { name: 'Cultural Tours', hasGuide: true },
      { name: 'Historic Tours', hasGuide: true },
      { name: 'Architecture Tours', hasGuide: true },
      { name: 'Food Tours', hasGuide: true },
      { name: 'Market Tours', hasGuide: true },
      { name: 'Monument Tours', hasGuide: true }
    ],
    seo: {
      title: 'New Delhi Tours & Excursions - Top-Rated Activities & Adventures',
      description: 'Discover top-rated New Delhi tours, excursions, and activities powered by AI. From historic tours to cultural experiences, find the perfect way to explore India\'s vibrant capital.',
      keywords: 'New Delhi tours, cultural tours, historic tours, things to do in New Delhi',
      primaryKeyword: 'New Delhi tours',
      secondaryKeywords: [
        'New Delhi cultural tours',
        'New Delhi historic tours',
        'New Delhi architecture tours',
        'New Delhi food tours',
        'New Delhi market tours',
        'Things to do in New Delhi'
      ]
    },
    whyVisit: [
      'Rich Mughal heritage',
      'British colonial architecture',
      'Vibrant markets and bazaars',
      'Historic monuments',
      'Excellent food scene',
      'Perfect blend of old and new'
    ],
    bestTimeToVisit: {
      weather: 'New Delhi has three main seasons. Winter (November-February) is pleasant, summer (March-June) is hot, and monsoon (July-October) brings rain.',
      bestMonths: 'October to March offers the best weather with pleasant temperatures.',
      peakSeason: 'November to February brings peak tourist season with ideal weather, larger crowds, and higher prices.',
      offSeason: 'April to June offers lower prices but extremely hot weather.'
    },
    gettingAround: 'Metro system is efficient. Organized tours include transportation, and taxis/rickshaws are readily available.',
    highlights: [
      'Red Fort - Mughal palace',
      'Humayun\'s Tomb - UNESCO site',
      'Qutub Minar - Ancient tower',
      'India Gate - War memorial',
      'Chandni Chowk - Historic market',
      'Lotus Temple - Modern architecture'
    ]
  },
  {
    id: 'jaipur',
    name: 'Jaipur',
    fullName: 'Jaipur',
    country: 'India',
    category: 'Asia-Pacific',
    briefDescription: 'Pink City with royal palaces, ancient forts, and vibrant culture — Jaipur is Rajasthan\'s regal heart.',
    heroDescription: 'Welcome to Jaipur, where pink-hued palaces meet ancient forts and royal traditions create the perfect Indian fairy tale. From the magnificent Amber Fort to the elegant City Palace, from bustling bazaars to traditional crafts, this historic city offers the perfect blend of royal heritage, culture, and authentic Indian hospitality. Let our AI-powered planner help you discover the best experiences this incredible destination has to offer.',
    imageUrl: 'https://ouqeoizufbofdqbuiwvx.supabase.co/storage/v1/object/public/destinations//Jaipur.jpeg',
    tourCategories: [
      { name: 'Cultural Tours', hasGuide: true },
      { name: 'Palace Tours', hasGuide: true },
      { name: 'Fort Tours', hasGuide: true },
      { name: 'Shopping Tours', hasGuide: true },
      { name: 'Food Tours', hasGuide: true },
      { name: 'Heritage Tours', hasGuide: true }
    ],
    seo: {
      title: 'Jaipur Tours & Excursions - Top-Rated Activities & Adventures',
      description: 'Discover top-rated Jaipur tours, excursions, and activities powered by AI. From palace tours to cultural experiences, find the perfect way to explore the Pink City.',
      keywords: 'Jaipur tours, palace tours, fort tours, things to do in Jaipur',
      primaryKeyword: 'Jaipur tours',
      secondaryKeywords: [
        'Jaipur palace tours',
        'Jaipur fort tours',
        'Jaipur cultural tours',
        'Jaipur shopping tours',
        'Jaipur food tours',
        'Things to do in Jaipur'
      ]
    },
    whyVisit: [
      'Magnificent royal palaces',
      'Ancient hilltop forts',
      'Pink city architecture',
      'Traditional crafts and jewelry',
      'Rich cultural heritage',
      'Authentic Rajasthani culture'
    ],
    bestTimeToVisit: {
      weather: 'Jaipur has three main seasons. Winter (November-February) is pleasant, summer (March-June) is hot, and monsoon (July-October) brings rain.',
      bestMonths: 'October to March offers the best weather with pleasant temperatures.',
      peakSeason: 'November to February brings peak tourist season with ideal weather, larger crowds, and higher prices.',
      offSeason: 'April to June offers lower prices but extremely hot weather.'
    },
    gettingAround: 'Organized tours include transportation. Rickshaws and taxis are common for local travel.',
    highlights: [
      'Amber Fort - Hilltop palace',
      'City Palace - Royal residence',
      'Hawa Mahal - Palace of winds',
      'Jantar Mantar - Astronomical observatory',
      'Nahargarh Fort - Mountain fortress',
      'Traditional bazaars - Shopping paradise'
    ]
  },
  {
    id: 'mumbai',
    name: 'Mumbai',
    fullName: 'Mumbai',
    country: 'India',
    category: 'Asia-Pacific',
    briefDescription: 'Bollywood capital with colonial architecture, vibrant markets, and coastal charm — Mumbai is India\'s financial heart.',
    heroDescription: 'Welcome to Mumbai, where Bollywood dreams meet colonial heritage and coastal beauty creates India\'s most dynamic city. From the iconic Gateway of India to the bustling markets of Colaba, from the glamorous film industry to the peaceful Marine Drive, this vibrant metropolis offers the perfect blend of entertainment, history, and contemporary Indian life. Let our AI-powered planner help you discover the best experiences this incredible destination has to offer.',
    imageUrl: 'https://ouqeoizufbofdqbuiwvx.supabase.co/storage/v1/object/public/destinations//Mumbai.jpeg',
    tourCategories: [
      { name: 'Cultural Tours', hasGuide: true },
      { name: 'Bollywood Tours', hasGuide: true },
      { name: 'Food Tours', hasGuide: true },
      { name: 'Market Tours', hasGuide: true },
      { name: 'Architecture Tours', hasGuide: true },
      { name: 'Coastal Tours', hasGuide: true }
    ],
    seo: {
      title: 'Mumbai Tours & Excursions - Top-Rated Activities & Adventures',
      description: 'Discover top-rated Mumbai tours, excursions, and activities powered by AI. From Bollywood tours to cultural experiences, find the perfect way to explore India\'s financial capital.',
      keywords: 'Mumbai tours, Bollywood tours, cultural tours, things to do in Mumbai',
      primaryKeyword: 'Mumbai tours',
      secondaryKeywords: [
        'Mumbai Bollywood tours',
        'Mumbai cultural tours',
        'Mumbai food tours',
        'Mumbai market tours',
        'Mumbai architecture tours',
        'Things to do in Mumbai'
      ]
    },
    whyVisit: [
      'Bollywood film industry',
      'Colonial architecture',
      'Vibrant street food culture',
      'Coastal beauty',
      'Diverse neighborhoods',
      'Perfect blend of tradition and modernity'
    ],
    bestTimeToVisit: {
      weather: 'Mumbai has three main seasons. Winter (November-February) is pleasant, summer (March-June) is hot and humid, and monsoon (June-October) brings heavy rain.',
      bestMonths: 'November to February offers the best weather with pleasant temperatures.',
      peakSeason: 'December to February brings peak tourist season with ideal weather, larger crowds, and higher prices.',
      offSeason: 'June to September offers lower prices but heavy monsoon rains.'
    },
    gettingAround: 'Local trains and metro are efficient. Organized tours include transportation, and taxis are readily available.',
    highlights: [
      'Gateway of India - Historic monument',
      'Marine Drive - Coastal promenade',
      'Colaba Causeway - Shopping district',
      'Elephanta Caves - Ancient temples',
      'Juhu Beach - Popular beach',
      'Dharavi - Largest slum area'
    ]
  },
  {
    id: 'goa',
    name: 'Goa',
    fullName: 'Goa',
    country: 'India',
    category: 'Asia-Pacific',
    briefDescription: 'Tropical paradise with Portuguese heritage, pristine beaches, and laid-back vibe — Goa is India\'s beach capital.',
    heroDescription: 'Welcome to Goa, where Portuguese colonial charm meets tropical beaches and laid-back vibes create India\'s most relaxed destination. From the golden sands of Calangute to the historic churches of Old Goa, from spice plantations to vibrant nightlife, this coastal paradise offers the perfect blend of beach life, culture, and Indian hospitality. Let our AI-powered planner help you discover the best experiences this incredible destination has to offer.',
    imageUrl: 'https://ouqeoizufbofdqbuiwvx.supabase.co/storage/v1/object/public/destinations//Goa.jpg',
    tourCategories: [
      { name: 'Beach Tours', hasGuide: true },
      { name: 'Cultural Tours', hasGuide: true },
      { name: 'Food Tours', hasGuide: true },
      { name: 'Adventure Tours', hasGuide: true },
      { name: 'Heritage Tours', hasGuide: true },
      { name: 'Water Sports Tours', hasGuide: true }
    ],
    seo: {
      title: 'Goa Tours & Excursions - Top-Rated Activities & Adventures',
      description: 'Discover top-rated Goa tours, excursions, and activities powered by AI. From beach activities to cultural experiences, find the perfect way to explore India\'s beach paradise.',
      keywords: 'Goa tours, beach tours, cultural tours, things to do in Goa',
      primaryKeyword: 'Goa tours',
      secondaryKeywords: [
        'Goa beach tours',
        'Goa cultural tours',
        'Goa food tours',
        'Goa adventure tours',
        'Goa heritage tours',
        'Things to do in Goa'
      ]
    },
    whyVisit: [
      'Pristine beaches',
      'Portuguese colonial heritage',
      'Spice plantations',
      'Vibrant nightlife',
      'Excellent seafood',
      'Perfect tropical weather'
    ],
    bestTimeToVisit: {
      weather: 'Goa has three main seasons. Winter (November-February) is pleasant, summer (March-May) is hot, and monsoon (June-October) brings heavy rain.',
      bestMonths: 'November to March offers the best weather with pleasant temperatures.',
      peakSeason: 'December to February brings peak tourist season with ideal weather, larger crowds, and higher prices.',
      offSeason: 'June to September offers lower prices but heavy monsoon rains.'
    },
    gettingAround: 'Renting a scooter is popular. Organized tours include transportation, and taxis are available.',
    highlights: [
      'Calangute Beach - Popular beach',
      'Old Goa Churches - Historic sites',
      'Spice Plantations - Traditional farms',
      'Dudhsagar Falls - Waterfall',
      'Fort Aguada - Portuguese fort',
      'Anjuna Flea Market - Shopping'
    ]
  },
  {
    id: 'kerala',
    name: 'Kerala',
    fullName: 'Kerala',
    country: 'India',
    category: 'Asia-Pacific',
    briefDescription: 'God\'s Own Country with backwaters, tea plantations, and Ayurvedic traditions — Kerala is India\'s green paradise.',
    heroDescription: 'Welcome to Kerala, where emerald backwaters meet misty tea plantations and ancient Ayurvedic traditions create India\'s most serene destination. From the peaceful houseboat cruises to the rolling hills of Munnar, from traditional Kathakali performances to rejuvenating Ayurvedic treatments, this tropical paradise offers the perfect blend of nature, culture, and wellness. Let our AI-powered planner help you discover the best experiences this incredible destination has to offer.',
    imageUrl: 'https://ouqeoizufbofdqbuiwvx.supabase.co/storage/v1/object/public/destinations//Kerala.jpeg',
    tourCategories: [
      { name: 'Backwater Tours', hasGuide: true },
      { name: 'Nature Tours', hasGuide: true },
      { name: 'Cultural Tours', hasGuide: true },
      { name: 'Wellness Tours', hasGuide: true },
      { name: 'Tea Plantation Tours', hasGuide: true },
      { name: 'Wildlife Tours', hasGuide: true }
    ],
    seo: {
      title: 'Kerala Tours & Excursions - Top-Rated Activities & Adventures',
      description: 'Discover top-rated Kerala tours, excursions, and activities powered by AI. From backwater cruises to cultural experiences, find the perfect way to explore God\'s Own Country.',
      keywords: 'Kerala tours, backwater tours, nature tours, things to do in Kerala',
      primaryKeyword: 'Kerala tours',
      secondaryKeywords: [
        'Kerala backwater tours',
        'Kerala nature tours',
        'Kerala cultural tours',
        'Kerala wellness tours',
        'Kerala tea plantation tours',
        'Things to do in Kerala'
      ]
    },
    whyVisit: [
      'Peaceful backwaters',
      'Tea plantations',
      'Ayurvedic wellness',
      'Traditional culture',
      'Wildlife sanctuaries',
      'Perfect blend of nature and culture'
    ],
    bestTimeToVisit: {
      weather: 'Kerala has three main seasons. Winter (November-February) is pleasant, summer (March-May) is hot, and monsoon (June-October) brings heavy rain.',
      bestMonths: 'November to February offers the best weather with pleasant temperatures.',
      peakSeason: 'December to February brings peak tourist season with ideal weather, larger crowds, and higher prices.',
      offSeason: 'June to September offers lower prices but heavy monsoon rains.'
    },
    gettingAround: 'Organized tours include transportation. Houseboats are perfect for backwater exploration.',
    highlights: [
      'Alleppey Backwaters - Houseboat cruises',
      'Munnar Tea Plantations - Rolling hills',
      'Kumarakom - Bird sanctuary',
      'Thekkady Wildlife - Periyar National Park',
      'Kovalam Beach - Beautiful beach',
      'Ayurvedic Treatments - Traditional wellness'
    ]
  },
  {
    id: 'melbourne',
    name: 'Melbourne',
    fullName: 'Melbourne',
    country: 'Australia',
    category: 'Asia-Pacific',
    briefDescription: 'Cultural capital with world-class dining, arts scene, and European charm — Melbourne is Australia\'s most sophisticated city.',
    heroDescription: 'Welcome to Melbourne, where laneway culture meets world-class dining and artistic expression flows through every street. From the famous coffee culture to the vibrant arts scene, from hidden bars to stunning coastal drives, this cosmopolitan city offers the perfect blend of sophistication and creativity. Let our AI-powered planner help you discover the best experiences this incredible destination has to offer.',
    imageUrl: 'https://ouqeoizufbofdqbuiwvx.supabase.co/storage/v1/object/public/destinations//Sydney.jpg',
    tourCategories: [
      { name: 'City Tours', hasGuide: true },
      { name: 'Food Tours', hasGuide: true },
      { name: 'Cultural Tours', hasGuide: true },
      { name: 'Arts Tours', hasGuide: true },
      { name: 'Coffee Tours', hasGuide: true },
      { name: 'Coastal Tours', hasGuide: true }
    ],
    seo: {
      title: 'Melbourne Tours & Excursions - Top-Rated Activities & Adventures',
      description: 'Discover top-rated Melbourne tours, excursions, and activities powered by AI. From food experiences to cultural tours, find the perfect way to explore Australia\'s cultural capital.',
      keywords: 'Melbourne tours, food tours, cultural tours, things to do in Melbourne',
      primaryKeyword: 'Melbourne tours',
      secondaryKeywords: [
        'Melbourne food tours',
        'Melbourne cultural tours',
        'Melbourne arts tours',
        'Melbourne coffee tours',
        'Melbourne city tours',
        'Things to do in Melbourne'
      ]
    },
    whyVisit: [
      'World-class dining scene',
      'Vibrant arts culture',
      'European charm',
      'Coffee culture',
      'Hidden laneways',
      'Perfect blend of sophistication and creativity'
    ],
    bestTimeToVisit: {
      weather: 'Melbourne has four distinct seasons. Spring (September-November) and autumn (March-May) are pleasant, summer (December-February) is warm, and winter (June-August) is cool.',
      bestMonths: 'March to May and September to November offer the best weather with pleasant temperatures.',
      peakSeason: 'December to February brings peak tourist season with warm weather, larger crowds, and higher prices.',
      offSeason: 'June to August offers lower prices but cooler weather.'
    },
    gettingAround: 'Public transport is excellent. Walking is perfect for the CBD, and organized tours include transportation.',
    highlights: [
      'Federation Square - Cultural hub',
      'Royal Botanic Gardens - Beautiful gardens',
      'Great Ocean Road - Scenic drive',
      'Queen Victoria Market - Historic market',
      'Brighton Beach Boxes - Colorful beach huts',
      'Yarra Valley - Wine region'
    ]
  },
  {
    id: 'cairns',
    name: 'Cairns',
    fullName: 'Cairns (Great Barrier Reef)',
    country: 'Australia',
    category: 'Asia-Pacific',
    briefDescription: 'Gateway to the Great Barrier Reef with tropical rainforests and adventure activities — Cairns is Australia\'s adventure capital.',
    heroDescription: 'Welcome to Cairns, where the world\'s largest coral reef meets ancient rainforests and adventure awaits around every corner. From diving the Great Barrier Reef to exploring the Daintree Rainforest, from thrilling water sports to indigenous cultural experiences, this tropical paradise offers the perfect blend of natural wonders and adrenaline-pumping activities. Let our AI-powered planner help you discover the best experiences this incredible destination has to offer.',
    imageUrl: 'https://ouqeoizufbofdqbuiwvx.supabase.co/storage/v1/object/public/destinations//Cairns%20(Great%20Barrier%20Reef).jpg',
    tourCategories: [
      { name: 'Reef Tours', hasGuide: true },
      { name: 'Rainforest Tours', hasGuide: true },
      { name: 'Adventure Tours', hasGuide: true },
      { name: 'Cultural Tours', hasGuide: true },
      { name: 'Wildlife Tours', hasGuide: true },
      { name: 'Water Sports', hasGuide: true }
    ],
    seo: {
      title: 'Cairns Tours & Excursions - Top-Rated Activities & Adventures',
      description: 'Discover top-rated Cairns tours, excursions, and activities powered by AI. From Great Barrier Reef experiences to rainforest adventures, find the perfect way to explore Australia\'s adventure capital.',
      keywords: 'Cairns tours, Great Barrier Reef tours, rainforest tours, things to do in Cairns',
      primaryKeyword: 'Cairns tours',
      secondaryKeywords: [
        'Cairns Great Barrier Reef tours',
        'Cairns rainforest tours',
        'Cairns adventure tours',
        'Cairns cultural tours',
        'Cairns wildlife tours',
        'Things to do in Cairns'
      ]
    },
    whyVisit: [
      'Great Barrier Reef access',
      'Daintree Rainforest',
      'Adventure activities',
      'Tropical climate',
      'Indigenous culture',
      'Perfect blend of nature and adventure'
    ],
    bestTimeToVisit: {
      weather: 'Cairns has a tropical climate with two main seasons. Dry season (May-October) is pleasant, and wet season (November-April) brings rain and humidity.',
      bestMonths: 'May to October offers the best weather with pleasant temperatures and less rain.',
      peakSeason: 'June to August brings peak tourist season with ideal weather, larger crowds, and higher prices.',
      offSeason: 'November to April offers lower prices but wet weather and potential cyclones.'
    },
    gettingAround: 'Organized tours include transportation. Car rental is useful for exploring the region.',
    highlights: [
      'Great Barrier Reef - World\'s largest coral reef',
      'Daintree Rainforest - Ancient rainforest',
      'Kuranda Scenic Railway - Historic railway',
      'Skyrail Rainforest Cableway - Aerial views',
      'Cape Tribulation - Rainforest meets reef',
      'Indigenous Cultural Experiences - Traditional culture'
    ]
  },
  {
    id: 'gold-coast',
    name: 'Gold Coast',
    fullName: 'Gold Coast',
    country: 'Australia',
    category: 'Asia-Pacific',
    briefDescription: 'Surfing paradise with golden beaches, theme parks, and vibrant nightlife — Gold Coast is Australia\'s entertainment capital.',
    heroDescription: 'Welcome to the Gold Coast, where golden beaches meet thrilling theme parks and the surf culture pulses through every wave. From world-class surfing to family-friendly attractions, from vibrant nightlife to natural hinterland adventures, this coastal paradise offers the perfect blend of excitement and relaxation. Let our AI-powered planner help you discover the best experiences this incredible destination has to offer.',
    imageUrl: 'https://ouqeoizufbofdqbuiwvx.supabase.co/storage/v1/object/public/destinations//Gold%20Coast.png',
    tourCategories: [
      { name: 'Surfing Tours', hasGuide: true },
      { name: 'Theme Park Tours', hasGuide: true },
      { name: 'Beach Tours', hasGuide: true },
      { name: 'Adventure Tours', hasGuide: true },
      { name: 'Nightlife Tours', hasGuide: true },
      { name: 'Nature Tours', hasGuide: true }
    ],
    seo: {
      title: 'Gold Coast Tours & Excursions - Top-Rated Activities & Adventures',
      description: 'Discover top-rated Gold Coast tours, excursions, and activities powered by AI. From surfing experiences to theme park adventures, find the perfect way to explore Australia\'s entertainment capital.',
      keywords: 'Gold Coast tours, surfing tours, theme park tours, things to do in Gold Coast',
      primaryKeyword: 'Gold Coast tours',
      secondaryKeywords: [
        'Gold Coast surfing tours',
        'Gold Coast theme park tours',
        'Gold Coast beach tours',
        'Gold Coast adventure tours',
        'Gold Coast nightlife tours',
        'Things to do in Gold Coast'
      ]
    },
    whyVisit: [
      'World-class surfing',
      'Theme parks',
      'Golden beaches',
      'Vibrant nightlife',
      'Natural hinterland',
      'Perfect blend of excitement and relaxation'
    ],
    bestTimeToVisit: {
      weather: 'The Gold Coast has a subtropical climate. Spring (September-November) and autumn (March-May) are pleasant, summer (December-February) is warm and humid, and winter (June-August) is mild.',
      bestMonths: 'March to May and September to November offer the best weather with pleasant temperatures.',
      peakSeason: 'December to February brings peak tourist season with warm weather, larger crowds, and higher prices.',
      offSeason: 'June to August offers lower prices but cooler weather.'
    },
    gettingAround: 'Public transport is good. Walking is perfect for beach areas, and organized tours include transportation.',
    highlights: [
      'Surfers Paradise - Famous beach',
      'Theme Parks - Warner Bros, Sea World',
      'Hinterland - Natural beauty',
      'Broadwater - Water activities',
      'Nightlife - Entertainment precinct',
      'Currumbin Wildlife Sanctuary - Native animals'
    ]
  },
  {
    id: 'perth',
    name: 'Perth',
    fullName: 'Perth',
    country: 'Australia',
    category: 'Asia-Pacific',
    briefDescription: 'Sunny capital with pristine beaches, wine regions, and laid-back lifestyle — Perth is Australia\'s western gem.',
    heroDescription: 'Welcome to Perth, where endless sunshine meets pristine beaches and the Swan River flows through a city of natural beauty. From the stunning coastline to the nearby wine regions, from vibrant cultural precincts to outdoor adventures, this relaxed capital offers the perfect blend of urban sophistication and natural wonders. Let our AI-powered planner help you discover the best experiences this incredible destination has to offer.',
    imageUrl: 'https://ouqeoizufbofdqbuiwvx.supabase.co/storage/v1/object/public/destinations//Perth.jpeg',
    tourCategories: [
      { name: 'City Tours', hasGuide: true },
      { name: 'Beach Tours', hasGuide: true },
      { name: 'Wine Tours', hasGuide: true },
      { name: 'Cultural Tours', hasGuide: true },
      { name: 'Nature Tours', hasGuide: true },
      { name: 'Adventure Tours', hasGuide: true }
    ],
    seo: {
      title: 'Perth Tours & Excursions - Top-Rated Activities & Adventures',
      description: 'Discover top-rated Perth tours, excursions, and activities powered by AI. From city experiences to wine region tours, find the perfect way to explore Australia\'s western capital.',
      keywords: 'Perth tours, city tours, wine tours, things to do in Perth',
      primaryKeyword: 'Perth tours',
      secondaryKeywords: [
        'Perth city tours',
        'Perth beach tours',
        'Perth wine tours',
        'Perth cultural tours',
        'Perth nature tours',
        'Things to do in Perth'
      ]
    },
    whyVisit: [
      'Endless sunshine',
      'Pristine beaches',
      'Wine regions',
      'Laid-back lifestyle',
      'Natural beauty',
      'Perfect blend of urban and nature'
    ],
    bestTimeToVisit: {
      weather: 'Perth has a Mediterranean climate. Spring (September-November) and autumn (March-May) are pleasant, summer (December-February) is hot and dry, and winter (June-August) is mild.',
      bestMonths: 'March to May and September to November offer the best weather with pleasant temperatures.',
      peakSeason: 'December to February brings peak tourist season with warm weather, larger crowds, and higher prices.',
      offSeason: 'June to August offers lower prices but cooler weather.'
    },
    gettingAround: 'Public transport is good. Walking is perfect for the CBD, and organized tours include transportation.',
    highlights: [
      'Kings Park - Beautiful park',
      'Swan Valley - Wine region',
      'Rottnest Island - Quokkas',
      'Fremantle - Historic port',
      'Cottesloe Beach - Beautiful beach',
      'Margaret River - Wine and surf'
    ]
  },
  {
    id: 'auckland',
    name: 'Auckland',
    fullName: 'Auckland',
    country: 'New Zealand',
    category: 'Asia-Pacific',
    briefDescription: 'City of Sails with volcanic landscapes, harbors, and Maori culture — Auckland is New Zealand\'s largest metropolis.',
    relatedGuides: ['new-zealand-adventure-tours'],
    heroDescription: 'Welcome to Auckland, where volcanic cones meet sparkling harbors and Maori culture infuses every experience. From sailing the Hauraki Gulf to exploring volcanic islands, from vibrant city life to stunning coastal walks, this dynamic city offers the perfect blend of urban sophistication and natural wonders. Let our AI-powered planner help you discover the best experiences this incredible destination has to offer.',
    imageUrl: 'https://ouqeoizufbofdqbuiwvx.supabase.co/storage/v1/object/public/destinations//Auckland.webp',
    tourCategories: [
      { name: 'Harbor Tours', hasGuide: true },
      { name: 'Volcanic Tours', hasGuide: true },
      { name: 'Cultural Tours', hasGuide: true },
      { name: 'City Tours', hasGuide: true },
      { name: 'Adventure Tours', hasGuide: true },
      { name: 'Island Tours', hasGuide: true }
    ],
    seo: {
      title: 'Auckland Tours & Excursions - Top-Rated Activities & Adventures',
      description: 'Discover top-rated Auckland tours, excursions, and activities powered by AI. From harbor cruises to volcanic adventures, find the perfect way to explore New Zealand\'s largest city.',
      keywords: 'Auckland tours, harbor tours, volcanic tours, things to do in Auckland',
      primaryKeyword: 'Auckland tours',
      secondaryKeywords: [
        'Auckland harbor tours',
        'Auckland volcanic tours',
        'Auckland cultural tours',
        'Auckland city tours',
        'Auckland adventure tours',
        'Things to do in Auckland'
      ]
    },
    whyVisit: [
      'Volcanic landscapes',
      'Sparkling harbors',
      'Maori culture',
      'Sailing opportunities',
      'Natural beauty',
      'Perfect blend of urban and nature'
    ],
    bestTimeToVisit: {
      weather: 'Auckland has a temperate climate. Spring (September-November) and autumn (March-May) are pleasant, summer (December-February) is warm, and winter (June-August) is mild.',
      bestMonths: 'March to May and September to November offer the best weather with pleasant temperatures.',
      peakSeason: 'December to February brings peak tourist season with warm weather, larger crowds, and higher prices.',
      offSeason: 'June to August offers lower prices but cooler weather.'
    },
    gettingAround: 'Public transport is good. Walking is perfect for the CBD, and organized tours include transportation.',
    highlights: [
      'Sky Tower - Iconic landmark',
      'Waiheke Island - Wine and beaches',
      'Rangitoto Island - Volcanic island',
      'Auckland Domain - Beautiful park',
      'Harbor Bridge - Iconic bridge',
      'Maori Cultural Experiences - Traditional culture'
    ]
  },
  {
    id: 'queenstown',
    name: 'Queenstown',
    fullName: 'Queenstown',
    country: 'New Zealand',
    category: 'Asia-Pacific',
    briefDescription: 'Adventure capital with stunning alpine scenery and thrilling activities — Queenstown is New Zealand\'s adrenaline hub.',
    relatedGuides: ['new-zealand-adventure-tours'],
    heroDescription: 'Welcome to Queenstown, where snow-capped peaks meet crystal-clear lakes and adventure awaits around every corner. From world-class skiing to thrilling bungee jumping, from scenic helicopter flights to peaceful lake cruises, this alpine paradise offers the perfect blend of adrenaline-pumping activities and natural beauty. Let our AI-powered planner help you discover the best experiences this incredible destination has to offer.',
    imageUrl: 'https://ouqeoizufbofdqbuiwvx.supabase.co/storage/v1/object/public/destinations//Queenstown.jpg',
    tourCategories: [
      { name: 'Adventure Tours', hasGuide: true },
      { name: 'Skiing Tours', hasGuide: true },
      { name: 'Scenic Tours', hasGuide: true },
      { name: 'Lake Tours', hasGuide: true },
      { name: 'Wine Tours', hasGuide: true },
      { name: 'Cultural Tours', hasGuide: true }
    ],
    seo: {
      title: 'Queenstown Tours & Excursions - Top-Rated Activities & Adventures',
      description: 'Discover top-rated Queenstown tours, excursions, and activities powered by AI. From adventure experiences to scenic tours, find the perfect way to explore New Zealand\'s adventure capital.',
      keywords: 'Queenstown tours, adventure tours, skiing tours, things to do in Queenstown',
      primaryKeyword: 'Queenstown tours',
      secondaryKeywords: [
        'Queenstown adventure tours',
        'Queenstown skiing tours',
        'Queenstown scenic tours',
        'Queenstown lake tours',
        'Queenstown wine tours',
        'Things to do in Queenstown'
      ]
    },
    whyVisit: [
      'Adventure activities',
      'Alpine scenery',
      'World-class skiing',
      'Crystal-clear lakes',
      'Wine regions',
      'Perfect blend of adventure and beauty'
    ],
    bestTimeToVisit: {
      weather: 'Queenstown has four distinct seasons. Spring (September-November) and autumn (March-May) are pleasant, summer (December-February) is warm, and winter (June-August) is cold with snow.',
      bestMonths: 'March to May and September to November offer the best weather with pleasant temperatures.',
      peakSeason: 'December to February brings peak tourist season with warm weather, larger crowds, and higher prices.',
      offSeason: 'June to August offers lower prices but cold weather and snow.'
    },
    gettingAround: 'Walking is perfect for the town center. Organized tours include transportation, and car rental is useful for exploring.',
    highlights: [
      'Milford Sound - Stunning fjord',
      'Ski Fields - Remarkables, Coronet Peak',
      'Lake Wakatipu - Crystal-clear lake',
      'Bungee Jumping - Thrilling activities',
      'Arrowtown - Historic gold mining town',
      'Central Otago Wine Region - Pinot noir'
    ]
  },
  {
    id: 'rotorua',
    name: 'Rotorua',
    fullName: 'Rotorua',
    country: 'New Zealand',
    category: 'Asia-Pacific',
    briefDescription: 'Geothermal wonderland with Maori culture and natural hot springs — Rotorua is New Zealand\'s cultural heart.',
    relatedGuides: ['new-zealand-adventure-tours'],
    heroDescription: 'Welcome to Rotorua, where geothermal wonders meet rich Maori culture and natural hot springs bubble from the earth. From exploring geysers and mud pools to experiencing traditional Maori hospitality, from relaxing in thermal baths to discovering native forests, this unique destination offers the perfect blend of natural wonders and cultural heritage. Let our AI-powered planner help you discover the best experiences this incredible destination has to offer.',
    imageUrl: 'https://ouqeoizufbofdqbuiwvx.supabase.co/storage/v1/object/public/destinations//Rotorua.jpg',
    tourCategories: [
      { name: 'Geothermal Tours', hasGuide: true },
      { name: 'Cultural Tours', hasGuide: true },
      { name: 'Nature Tours', hasGuide: true },
      { name: 'Adventure Tours', hasGuide: true },
      { name: 'Wellness Tours', hasGuide: true },
      { name: 'Wildlife Tours', hasGuide: true }
    ],
    seo: {
      title: 'Rotorua Tours & Excursions - Top-Rated Activities & Adventures',
      description: 'Discover top-rated Rotorua tours, excursions, and activities powered by AI. From geothermal experiences to cultural tours, find the perfect way to explore New Zealand\'s cultural heart.',
      keywords: 'Rotorua tours, geothermal tours, cultural tours, things to do in Rotorua',
      primaryKeyword: 'Rotorua tours',
      secondaryKeywords: [
        'Rotorua geothermal tours',
        'Rotorua cultural tours',
        'Rotorua nature tours',
        'Rotorua adventure tours',
        'Rotorua wellness tours',
        'Things to do in Rotorua'
      ]
    },
    whyVisit: [
      'Geothermal wonders',
      'Maori culture',
      'Natural hot springs',
      'Native forests',
      'Unique experiences',
      'Perfect blend of nature and culture'
    ],
    bestTimeToVisit: {
      weather: 'Rotorua has a temperate climate. Spring (September-November) and autumn (March-May) are pleasant, summer (December-February) is warm, and winter (June-August) is mild.',
      bestMonths: 'March to May and September to November offer the best weather with pleasant temperatures.',
      peakSeason: 'December to February brings peak tourist season with warm weather, larger crowds, and higher prices.',
      offSeason: 'June to August offers lower prices but cooler weather.'
    },
    gettingAround: 'Walking is perfect for the town center. Organized tours include transportation, and car rental is useful for exploring.',
    highlights: [
      'Te Puia - Geothermal valley',
      'Wai-O-Tapu - Colorful geothermal park',
      'Maori Cultural Village - Traditional culture',
      'Redwoods Forest - Native trees',
      'Polynesian Spa - Thermal baths',
      'Lake Rotorua - Beautiful lake'
    ]
  },
  {
    id: 'wellington',
    name: 'Wellington',
    fullName: 'Wellington',
    country: 'New Zealand',
    category: 'Asia-Pacific',
    briefDescription: 'Creative capital with arts scene, coffee culture, and harbor views — Wellington is New Zealand\'s cultural hub.',
    relatedGuides: ['new-zealand-adventure-tours'],
    heroDescription: 'Welcome to Wellington, where creative energy meets stunning harbor views and the arts scene thrives in every corner. From the vibrant Cuba Street to the stunning waterfront, from world-class museums to hidden coffee spots, this compact capital offers the perfect blend of culture, creativity, and natural beauty. Let our AI-powered planner help you discover the best experiences this incredible destination has to offer.',
    imageUrl: 'https://ouqeoizufbofdqbuiwvx.supabase.co/storage/v1/object/public/destinations//Wellington%20australia.webp',
    tourCategories: [
      { name: 'City Tours', hasGuide: true },
      { name: 'Cultural Tours', hasGuide: true },
      { name: 'Food Tours', hasGuide: true },
      { name: 'Coffee Tours', hasGuide: true },
      { name: 'Arts Tours', hasGuide: true },
      { name: 'Harbor Tours', hasGuide: true }
    ],
    seo: {
      title: 'Wellington Tours & Excursions - Top-Rated Activities & Adventures',
      description: 'Discover top-rated Wellington tours, excursions, and activities powered by AI. From cultural experiences to food tours, find the perfect way to explore New Zealand\'s creative capital.',
      keywords: 'Wellington tours, cultural tours, food tours, things to do in Wellington',
      primaryKeyword: 'Wellington tours',
      secondaryKeywords: [
        'Wellington cultural tours',
        'Wellington food tours',
        'Wellington coffee tours',
        'Wellington arts tours',
        'Wellington city tours',
        'Things to do in Wellington'
      ]
    },
    whyVisit: [
      'Creative arts scene',
      'Coffee culture',
      'Harbor views',
      'Cultural institutions',
      'Compact city',
      'Perfect blend of culture and creativity'
    ],
    bestTimeToVisit: {
      weather: 'Wellington has a temperate climate. Spring (September-November) and autumn (March-May) are pleasant, summer (December-February) is warm, and winter (June-August) is mild but windy.',
      bestMonths: 'March to May and September to November offer the best weather with pleasant temperatures.',
      peakSeason: 'December to February brings peak tourist season with warm weather, larger crowds, and higher prices.',
      offSeason: 'June to August offers lower prices but cooler and windier weather.'
    },
    gettingAround: 'Walking is perfect for the compact city center. Public transport is good, and organized tours include transportation.',
    highlights: [
      'Te Papa Museum - National museum',
      'Cuba Street - Creative precinct',
      'Mount Victoria - Scenic views',
      'Zealandia - Wildlife sanctuary',
      'Weta Workshop - Film effects',
      'Harbor Waterfront - Beautiful promenade'
    ]
  },
  {
    id: 'nadi',
    name: 'Nadi',
    fullName: 'Nadi',
    country: 'Fiji',
    category: 'Asia-Pacific',
    briefDescription: 'Gateway to paradise with tropical beaches, Fijian culture, and island adventures — Nadi is Fiji\'s welcoming heart.',
    heroDescription: 'Welcome to Nadi, where tropical paradise meets warm Fijian hospitality and island adventures await. From pristine beaches to traditional village experiences, from water sports to cultural performances, this gateway city offers the perfect blend of relaxation and authentic Fijian culture. Let our AI-powered planner help you discover the best experiences this incredible destination has to offer.',
    imageUrl: 'https://ouqeoizufbofdqbuiwvx.supabase.co/storage/v1/object/public/destinations//Nadi.webp',
    tourCategories: [
      { name: 'Island Tours', hasGuide: true },
      { name: 'Cultural Tours', hasGuide: true },
      { name: 'Beach Tours', hasGuide: true },
      { name: 'Water Sports', hasGuide: true },
      { name: 'Adventure Tours', hasGuide: true },
      { name: 'Wellness Tours', hasGuide: true }
    ],
    seo: {
      title: 'Nadi Tours & Excursions - Top-Rated Activities & Adventures',
      description: 'Discover top-rated Nadi tours, excursions, and activities powered by AI. From island experiences to cultural tours, find the perfect way to explore Fiji\'s gateway city.',
      keywords: 'Nadi tours, island tours, cultural tours, things to do in Nadi',
      primaryKeyword: 'Nadi tours',
      secondaryKeywords: [
        'Nadi island tours',
        'Nadi cultural tours',
        'Nadi beach tours',
        'Nadi water sports',
        'Nadi adventure tours',
        'Things to do in Nadi'
      ]
    },
    whyVisit: [
      'Tropical paradise',
      'Fijian culture',
      'Pristine beaches',
      'Warm hospitality',
      'Island adventures',
      'Perfect blend of relaxation and culture'
    ],
    bestTimeToVisit: {
      weather: 'Fiji has a tropical climate with two main seasons. Dry season (May-October) is pleasant, and wet season (November-April) brings rain and humidity.',
      bestMonths: 'May to October offers the best weather with pleasant temperatures and less rain.',
      peakSeason: 'July to September brings peak tourist season with ideal weather, larger crowds, and higher prices.',
      offSeason: 'November to April offers lower prices but wet weather and potential cyclones.'
    },
    gettingAround: 'Organized tours include transportation. Taxis are available, and walking is good for the town center.',
    highlights: [
      'Garden of the Sleeping Giant - Orchid gardens',
      'Sabeto Hot Springs - Thermal baths',
      'Fijian Cultural Village - Traditional culture',
      'Wailoaloa Beach - Beautiful beach',
      'Sri Siva Subramaniya Temple - Hindu temple',
      'Mud Pool Experience - Natural spa'
    ]
  },
  {
    id: 'denarau-island',
    name: 'Denarau Island',
    fullName: 'Denarau Island',
    country: 'Fiji',
    category: 'Asia-Pacific',
    briefDescription: 'Luxury resort island with golf courses, spas, and pristine beaches — Denarau Island is Fiji\'s upscale paradise.',
    heroDescription: 'Welcome to Denarau Island, where luxury meets tropical beauty and world-class amenities create the perfect island escape. From championship golf courses to indulgent spa treatments, from pristine beaches to fine dining, this exclusive island offers the perfect blend of sophistication and natural beauty. Let our AI-powered planner help you discover the best experiences this incredible destination has to offer.',
    imageUrl: 'https://ouqeoizufbofdqbuiwvx.supabase.co/storage/v1/object/public/destinations//Denarau%20Island.jpg',
    tourCategories: [
      { name: 'Luxury Tours', hasGuide: true },
      { name: 'Golf Tours', hasGuide: true },
      { name: 'Spa Tours', hasGuide: true },
      { name: 'Beach Tours', hasGuide: true },
      { name: 'Water Sports', hasGuide: true },
      { name: 'Cultural Tours', hasGuide: true }
    ],
    seo: {
      title: 'Denarau Island Tours & Excursions - Top-Rated Activities & Adventures',
      description: 'Discover top-rated Denarau Island tours, excursions, and activities powered by AI. From luxury experiences to golf tours, find the perfect way to explore Fiji\'s upscale paradise.',
      keywords: 'Denarau Island tours, luxury tours, golf tours, things to do in Denarau Island',
      primaryKeyword: 'Denarau Island tours',
      secondaryKeywords: [
        'Denarau Island luxury tours',
        'Denarau Island golf tours',
        'Denarau Island spa tours',
        'Denarau Island beach tours',
        'Denarau Island water sports',
        'Things to do in Denarau Island'
      ]
    },
    whyVisit: [
      'Luxury resorts',
      'Championship golf',
      'World-class spas',
      'Pristine beaches',
      'Fine dining',
      'Perfect blend of luxury and nature'
    ],
    bestTimeToVisit: {
      weather: 'Denarau Island has a tropical climate. Dry season (May-October) is pleasant, and wet season (November-April) brings rain and humidity.',
      bestMonths: 'May to October offers the best weather with pleasant temperatures and less rain.',
      peakSeason: 'July to September brings peak tourist season with ideal weather, larger crowds, and higher prices.',
      offSeason: 'November to April offers lower prices but wet weather and potential cyclones.'
    },
    gettingAround: 'Resort shuttles and walking paths connect the island. Organized tours include transportation.',
    highlights: [
      'Denarau Golf Club - Championship course',
      'Port Denarau Marina - Water activities',
      'Luxury Resorts - World-class accommodation',
      'Spa Treatments - Indulgent wellness',
      'Beach Activities - Water sports',
      'Fine Dining - International cuisine'
    ]
  },
  {
    id: 'bora-bora',
    name: 'Bora Bora',
    fullName: 'Bora Bora',
    country: 'French Polynesia',
    category: 'Asia-Pacific',
    briefDescription: 'Ultimate paradise with overwater bungalows, turquoise lagoon, and volcanic peaks — Bora Bora is the world\'s most romantic island.',
    heroDescription: 'Welcome to Bora Bora, where overwater bungalows float above turquoise waters and volcanic peaks rise from the heart of the Pacific. From snorkeling vibrant coral gardens to relaxing in luxury overwater accommodations, from romantic sunset cruises to exploring the island\'s natural beauty, this ultimate paradise offers the perfect blend of luxury and natural wonder. Let our AI-powered planner help you discover the best experiences this incredible destination has to offer.',
    imageUrl: 'https://ouqeoizufbofdqbuiwvx.supabase.co/storage/v1/object/public/destinations//Bora%20Bora.webp',
    tourCategories: [
      { name: 'Luxury Tours', hasGuide: true },
      { name: 'Snorkeling Tours', hasGuide: true },
      { name: 'Romantic Tours', hasGuide: true },
      { name: 'Island Tours', hasGuide: true },
      { name: 'Water Sports', hasGuide: true },
      { name: 'Cultural Tours', hasGuide: true }
    ],
    seo: {
      title: 'Bora Bora Tours & Excursions - Top-Rated Activities & Adventures',
      description: 'Discover top-rated Bora Bora tours, excursions, and activities powered by AI. From luxury experiences to snorkeling adventures, find the perfect way to explore the world\'s most romantic island.',
      keywords: 'Bora Bora tours, luxury tours, snorkeling tours, things to do in Bora Bora',
      primaryKeyword: 'Bora Bora tours',
      secondaryKeywords: [
        'Bora Bora luxury tours',
        'Bora Bora snorkeling tours',
        'Bora Bora romantic tours',
        'Bora Bora island tours',
        'Bora Bora water sports',
        'Things to do in Bora Bora'
      ]
    },
    whyVisit: [
      'Overwater bungalows',
      'Turquoise lagoon',
      'Volcanic peaks',
      'Romantic atmosphere',
      'Luxury experiences',
      'Perfect blend of luxury and nature'
    ],
    bestTimeToVisit: {
      weather: 'Bora Bora has a tropical climate. Dry season (May-October) is pleasant, and wet season (November-April) brings rain and humidity.',
      bestMonths: 'May to October offers the best weather with pleasant temperatures and less rain.',
      peakSeason: 'July to September brings peak tourist season with ideal weather, larger crowds, and higher prices.',
      offSeason: 'November to April offers lower prices but wet weather and potential cyclones.'
    },
    gettingAround: 'Boat transfers and walking are the main modes of transport. Organized tours include transportation.',
    highlights: [
      'Overwater Bungalows - Luxury accommodation',
      'Turquoise Lagoon - Crystal-clear waters',
      'Mount Otemanu - Volcanic peak',
      'Coral Gardens - Snorkeling paradise',
      'Matira Beach - Beautiful beach',
      'Sunset Cruises - Romantic experiences'
    ]
  },
  {
    id: 'tahiti',
    name: 'Tahiti',
    fullName: 'Tahiti',
    country: 'French Polynesia',
    category: 'Asia-Pacific',
    briefDescription: 'Island of love with black sand beaches, waterfalls, and Polynesian culture — Tahiti is French Polynesia\'s heart.',
    heroDescription: 'Welcome to Tahiti, where black sand beaches meet cascading waterfalls and Polynesian culture infuses every experience. From exploring lush valleys to discovering traditional villages, from surfing world-class waves to experiencing authentic Polynesian hospitality, this island of love offers the perfect blend of natural beauty and cultural heritage. Let our AI-powered planner help you discover the best experiences this incredible destination has to offer.',
    imageUrl: 'https://ouqeoizufbofdqbuiwvx.supabase.co/storage/v1/object/public/destinations//Tahiti.avif',
    tourCategories: [
      { name: 'Cultural Tours', hasGuide: true },
      { name: 'Nature Tours', hasGuide: true },
      { name: 'Adventure Tours', hasGuide: true },
      { name: 'Beach Tours', hasGuide: true },
      { name: 'Waterfall Tours', hasGuide: true },
      { name: 'Surfing Tours', hasGuide: true }
    ],
    seo: {
      title: 'Tahiti Tours & Excursions - Top-Rated Activities & Adventures',
      description: 'Discover top-rated Tahiti tours, excursions, and activities powered by AI. From cultural experiences to nature adventures, find the perfect way to explore French Polynesia\'s heart.',
      keywords: 'Tahiti tours, cultural tours, nature tours, things to do in Tahiti',
      primaryKeyword: 'Tahiti tours',
      secondaryKeywords: [
        'Tahiti cultural tours',
        'Tahiti nature tours',
        'Tahiti adventure tours',
        'Tahiti beach tours',
        'Tahiti waterfall tours',
        'Things to do in Tahiti'
      ]
    },
    whyVisit: [
      'Black sand beaches',
      'Cascading waterfalls',
      'Polynesian culture',
      'Lush valleys',
      'World-class surfing',
      'Perfect blend of nature and culture'
    ],
    bestTimeToVisit: {
      weather: 'Tahiti has a tropical climate. Dry season (May-October) is pleasant, and wet season (November-April) brings rain and humidity.',
      bestMonths: 'May to October offers the best weather with pleasant temperatures and less rain.',
      peakSeason: 'July to September brings peak tourist season with ideal weather, larger crowds, and higher prices.',
      offSeason: 'November to April offers lower prices but wet weather and potential cyclones.'
    },
    gettingAround: 'Car rental is recommended for exploring. Organized tours include transportation, and walking is good in towns.',
    highlights: [
      'Papenoo Valley - Lush landscapes',
      'Fautaua Waterfall - Beautiful waterfall',
      'Black Sand Beaches - Unique shores',
      'Traditional Villages - Polynesian culture',
      'Teahupoo - World-class surf',
      'Papeete Market - Local culture'
    ]
  },
  {
    id: 'moorea',
    name: 'Moorea',
    fullName: 'Moorea',
    country: 'French Polynesia',
    category: 'Asia-Pacific',
    briefDescription: 'Magical island with dramatic peaks, pineapple plantations, and pristine lagoon — Moorea is French Polynesia\'s natural wonder.',
    heroDescription: 'Welcome to Moorea, where dramatic volcanic peaks meet pristine lagoon waters and pineapple plantations dot the landscape. From hiking scenic trails to snorkeling crystal-clear waters, from exploring traditional villages to experiencing authentic Polynesian culture, this magical island offers the perfect blend of adventure and natural beauty. Let our AI-powered planner help you discover the best experiences this incredible destination has to offer.',
    imageUrl: 'https://ouqeoizufbofdqbuiwvx.supabase.co/storage/v1/object/public/destinations//Moorea.webp',
    tourCategories: [
      { name: 'Nature Tours', hasGuide: true },
      { name: 'Adventure Tours', hasGuide: true },
      { name: 'Cultural Tours', hasGuide: true },
      { name: 'Snorkeling Tours', hasGuide: true },
      { name: 'Hiking Tours', hasGuide: true },
      { name: 'Island Tours', hasGuide: true }
    ],
    seo: {
      title: 'Moorea Tours & Excursions - Top-Rated Activities & Adventures',
      description: 'Discover top-rated Moorea tours, excursions, and activities powered by AI. From nature adventures to cultural experiences, find the perfect way to explore French Polynesia\'s natural wonder.',
      keywords: 'Moorea tours, nature tours, adventure tours, things to do in Moorea',
      primaryKeyword: 'Moorea tours',
      secondaryKeywords: [
        'Moorea nature tours',
        'Moorea adventure tours',
        'Moorea cultural tours',
        'Moorea snorkeling tours',
        'Moorea hiking tours',
        'Things to do in Moorea'
      ]
    },
    whyVisit: [
      'Dramatic peaks',
      'Pristine lagoon',
      'Pineapple plantations',
      'Natural beauty',
      'Polynesian culture',
      'Perfect blend of adventure and nature'
    ],
    bestTimeToVisit: {
      weather: 'Moorea has a tropical climate. Dry season (May-October) is pleasant, and wet season (November-April) brings rain and humidity.',
      bestMonths: 'May to October offers the best weather with pleasant temperatures and less rain.',
      peakSeason: 'July to September brings peak tourist season with ideal weather, larger crowds, and higher prices.',
      offSeason: 'November to April offers lower prices but wet weather and potential cyclones.'
    },
    gettingAround: 'Car rental is recommended for exploring. Organized tours include transportation, and walking is good in villages.',
    highlights: [
      'Mount Rotui - Dramatic peak',
      'Opunohu Bay - Beautiful bay',
      'Pineapple Plantations - Traditional farms',
      'Coral Reefs - Snorkeling paradise',
      'Traditional Villages - Polynesian culture',
      'Scenic Drives - Island exploration'
    ]
  },
  {
    id: 'cape-town',
    name: 'Cape Town',
    fullName: 'Cape Town',
    country: 'South Africa',
    category: 'Africa',
    briefDescription: 'Stunning coastal city with iconic Table Mountain, vibrant culture, and world-class wine regions — Cape Town is South Africa\'s crown jewel.',
    relatedGuides: ['best-tours-south-africa'],
    heroDescription: 'Welcome to Cape Town, where dramatic mountains meet the Atlantic Ocean and rich cultural heritage creates an unforgettable experience. From ascending Table Mountain to exploring the Cape of Good Hope, from wine tasting in Stellenbosch to discovering the vibrant Waterfront, this cosmopolitan city offers the perfect blend of natural beauty and urban sophistication. Let our AI-powered planner help you discover the best experiences this incredible destination has to offer.',
    imageUrl: 'https://ouqeoizufbofdqbuiwvx.supabase.co/storage/v1/object/public/destinations//cape%20Town.jpg',
    tourCategories: [
      { name: 'City Tours', hasGuide: true },
      { name: 'Table Mountain Tours', hasGuide: true },
      { name: 'Wine Tours', hasGuide: true },
      { name: 'Cape Peninsula Tours', hasGuide: true },
      { name: 'Cultural Tours', hasGuide: true },
      { name: 'Adventure Tours', hasGuide: true }
    ],
    seo: {
      title: 'Cape Town Tours & Excursions - Top-Rated Activities & Adventures',
      description: 'Discover top-rated Cape Town tours, excursions, and activities powered by AI. From Table Mountain adventures to wine region experiences, find the perfect way to explore South Africa\'s most beautiful city.',
      keywords: 'Cape Town tours, Table Mountain tours, wine tours, things to do in Cape Town',
      primaryKeyword: 'Cape Town tours',
      secondaryKeywords: [
        'Cape Town city tours',
        'Table Mountain tours',
        'Cape Town wine tours',
        'Cape Peninsula tours',
        'Cape Town cultural tours',
        'Things to do in Cape Town'
      ]
    },
    whyVisit: [
      'Iconic Table Mountain',
      'Stunning coastal scenery',
      'World-class wine regions',
      'Rich cultural heritage',
      'Diverse wildlife',
      'Perfect blend of nature and city life'
    ],
    bestTimeToVisit: {
      weather: 'Cape Town has a Mediterranean climate. Summer (December-February) is warm and dry, while winter (June-August) brings rain and cooler temperatures.',
      bestMonths: 'March to May and September to November offer pleasant weather with fewer crowds.',
      peakSeason: 'December to February brings peak tourist season with warm weather, larger crowds, and higher prices.',
      offSeason: 'June to August offers lower prices but wet weather and cooler temperatures.'
    },
    gettingAround: 'Car rental is recommended for exploring beyond the city. Organized tours include transportation, and walking is good in the city center.',
    highlights: [
      'Table Mountain - Iconic landmark',
      'Cape of Good Hope - Southernmost point',
      'V&A Waterfront - Shopping and dining',
      'Robben Island - Historical significance',
      'Stellenbosch Wine Region - World-class wines',
      'Boulders Beach - Penguin colony'
    ]
  },
  {
    id: 'johannesburg',
    name: 'Johannesburg',
    fullName: 'Johannesburg',
    country: 'South Africa',
    category: 'Africa',
    briefDescription: 'Dynamic metropolis with rich history, vibrant arts scene, and gateway to African adventures — Johannesburg is South Africa\'s economic heart.',
    relatedGuides: ['best-tours-south-africa'],
    heroDescription: 'Welcome to Johannesburg, where urban sophistication meets African heritage and a vibrant arts scene creates an exciting cultural experience. From exploring the Apartheid Museum to discovering the trendy Maboneng Precinct, from visiting Soweto to experiencing the city\'s thriving food scene, this dynamic metropolis offers the perfect blend of history and modernity. Let our AI-powered planner help you discover the best experiences this incredible destination has to offer.',
    imageUrl: 'https://ouqeoizufbofdqbuiwvx.supabase.co/storage/v1/object/public/destinations//Johannesburg.webp',
    tourCategories: [
      { name: 'City Tours', hasGuide: true },
      { name: 'Historical Tours', hasGuide: true },
      { name: 'Cultural Tours', hasGuide: true },
      { name: 'Soweto Tours', hasGuide: true },
      { name: 'Food Tours', hasGuide: true },
      { name: 'Art Tours', hasGuide: true }
    ],
    seo: {
      title: 'Johannesburg Tours & Excursions - Top-Rated Activities & Adventures',
      description: 'Discover top-rated Johannesburg tours, excursions, and activities powered by AI. From historical experiences to cultural tours, find the perfect way to explore South Africa\'s largest city.',
      keywords: 'Johannesburg tours, Soweto tours, historical tours, things to do in Johannesburg',
      primaryKeyword: 'Johannesburg tours',
      secondaryKeywords: [
        'Johannesburg city tours',
        'Soweto tours',
        'Johannesburg historical tours',
        'Johannesburg cultural tours',
        'Johannesburg food tours',
        'Things to do in Johannesburg'
      ]
    },
    whyVisit: [
      'Rich historical significance',
      'Vibrant arts and culture',
      'Diverse food scene',
      'Gateway to African adventures',
      'Modern urban development',
      'Perfect blend of history and progress'
    ],
    bestTimeToVisit: {
      weather: 'Johannesburg has a subtropical highland climate. Summer (October-March) is warm with afternoon thunderstorms, while winter (May-August) is dry and sunny.',
      bestMonths: 'April to May and September to October offer pleasant weather with fewer crowds.',
      peakSeason: 'December to February brings peak tourist season with warm weather, larger crowds, and higher prices.',
      offSeason: 'June to August offers lower prices but cooler temperatures.'
    },
    gettingAround: 'Car rental is recommended for exploring. Organized tours include transportation, and walking is good in safe areas.',
    highlights: [
      'Apartheid Museum - Historical significance',
      'Soweto - Cultural heritage',
      'Maboneng Precinct - Arts and culture',
      'Constitution Hill - Historical site',
      'Gold Reef City - Entertainment complex',
      'Neighbourgoods Market - Local culture'
    ]
  },
  {
    id: 'kruger-national-park',
    name: 'Kruger National Park',
    fullName: 'Kruger National Park',
    country: 'South Africa',
    category: 'Africa',
    briefDescription: 'Iconic wildlife sanctuary with the Big Five, diverse ecosystems, and unforgettable safari experiences — Kruger National Park is Africa\'s premier wildlife destination.',
    relatedGuides: ['best-tours-south-africa'],
    heroDescription: 'Welcome to Kruger National Park, where the African wilderness comes alive with incredible wildlife encounters and breathtaking landscapes. From spotting the Big Five on game drives to experiencing the magic of dawn and dusk in the bush, from guided walking safaris to luxury lodge experiences, this iconic park offers the ultimate African safari adventure. Let our AI-powered planner help you discover the best wildlife experiences this incredible destination has to offer.',
    imageUrl: 'https://ouqeoizufbofdqbuiwvx.supabase.co/storage/v1/object/public/destinations//Kruger%20National%20Park.jpg',
    tourCategories: [
      { name: 'Safari Tours', hasGuide: true },
      { name: 'Game Drives', hasGuide: true },
      { name: 'Walking Safaris', hasGuide: true },
      { name: 'Wildlife Photography Tours', hasGuide: true },
      { name: 'Bird Watching Tours', hasGuide: true },
      { name: 'Luxury Lodge Experiences', hasGuide: true }
    ],
    seo: {
      title: 'Kruger National Park Tours & Safaris - Top-Rated Wildlife Adventures',
      description: 'Discover top-rated Kruger National Park tours, safaris, and wildlife experiences powered by AI. From Big Five encounters to luxury lodge stays, find the perfect way to explore Africa\'s premier wildlife destination.',
      keywords: 'Kruger National Park tours, safari tours, Big Five tours, things to do in Kruger',
      primaryKeyword: 'Kruger National Park tours',
      secondaryKeywords: [
        'Kruger safari tours',
        'Big Five tours',
        'Kruger game drives',
        'Kruger walking safaris',
        'Kruger wildlife photography',
        'Things to do in Kruger National Park'
      ]
    },
    whyVisit: [
      'Big Five wildlife',
      'Diverse ecosystems',
      'Professional safari guides',
      'Luxury accommodation options',
      'Unforgettable wildlife encounters',
      'Perfect African safari experience'
    ],
    bestTimeToVisit: {
      weather: 'Kruger has a subtropical climate. Dry season (May-September) offers better wildlife viewing, while wet season (October-April) brings lush vegetation.',
      bestMonths: 'May to September offers the best wildlife viewing with dry conditions and animals gathering at waterholes.',
      peakSeason: 'July to September brings peak tourist season with excellent wildlife viewing, larger crowds, and higher prices.',
      offSeason: 'December to March offers lower prices but wet weather and dense vegetation.'
    },
    gettingAround: 'Organized safari tours include transportation. Self-drive is possible but guided tours are recommended for the best experience.',
    highlights: [
      'Big Five Wildlife - Lions, elephants, rhinos, leopards, buffalos',
      'Game Drives - Professional guided safaris',
      'Walking Safaris - Close wildlife encounters',
      'Luxury Lodges - Comfortable accommodation',
      'Bird Watching - Diverse bird species',
      'Sunset Drives - Magical evening experiences'
    ]
  },
  {
    id: 'cairo',
    name: 'Cairo',
    fullName: 'Cairo',
    country: 'Egypt',
    category: 'Africa',
    briefDescription: 'Ancient capital with iconic pyramids, rich history, and vibrant culture — Cairo is Egypt\'s timeless heart.',
    relatedGuides: ['egypt-cultural-tours'],
    heroDescription: 'Welcome to Cairo, where ancient wonders meet modern life and thousands of years of history come alive. From exploring the iconic Pyramids of Giza to discovering the treasures of the Egyptian Museum, from wandering through the historic Islamic Quarter to experiencing the bustling Khan el-Khalili bazaar, this fascinating city offers the perfect blend of ancient heritage and contemporary culture. Let our AI-powered planner help you discover the best experiences this incredible destination has to offer.',
    imageUrl: 'https://ouqeoizufbofdqbuiwvx.supabase.co/storage/v1/object/public/destinations//Cairo.jpg',
    tourCategories: [
      { name: 'Pyramid Tours', hasGuide: true },
      { name: 'Museum Tours', hasGuide: true },
      { name: 'Islamic Cairo Tours', hasGuide: true },
      { name: 'Cultural Tours', hasGuide: true },
      { name: 'Food Tours', hasGuide: true },
      { name: 'Historical Tours', hasGuide: true }
    ],
    seo: {
      title: 'Cairo Tours & Excursions - Top-Rated Activities & Adventures',
      description: 'Discover top-rated Cairo tours, excursions, and activities powered by AI. From pyramid experiences to cultural tours, find the perfect way to explore Egypt\'s ancient capital.',
      keywords: 'Cairo tours, pyramid tours, Egyptian Museum tours, things to do in Cairo',
      primaryKeyword: 'Cairo tours',
      secondaryKeywords: [
        'Cairo pyramid tours',
        'Egyptian Museum tours',
        'Islamic Cairo tours',
        'Cairo cultural tours',
        'Cairo food tours',
        'Things to do in Cairo'
      ]
    },
    whyVisit: [
      'Iconic Pyramids of Giza',
      'Rich ancient history',
      'Egyptian Museum treasures',
      'Islamic architecture',
      'Vibrant bazaars',
      'Perfect blend of ancient and modern'
    ],
    bestTimeToVisit: {
      weather: 'Cairo has a desert climate. Summer (June-August) is very hot, while winter (December-February) is mild and pleasant.',
      bestMonths: 'March to May and October to November offer pleasant weather with fewer crowds.',
      peakSeason: 'December to February brings peak tourist season with mild weather, larger crowds, and higher prices.',
      offSeason: 'June to August offers lower prices but extremely hot weather.'
    },
    gettingAround: 'Organized tours include transportation. Taxis and public transport are available, but tours are recommended for the best experience.',
    highlights: [
      'Pyramids of Giza - Ancient wonders',
      'Egyptian Museum - Historical treasures',
      'Islamic Cairo - Historic architecture',
      'Khan el-Khalili - Traditional bazaar',
      'Coptic Cairo - Christian heritage',
      'Nile River - Iconic waterway'
    ]
  },
  {
    id: 'luxor',
    name: 'Luxor',
    fullName: 'Luxor',
    country: 'Egypt',
    category: 'Africa',
    briefDescription: 'Ancient Thebes with magnificent temples, royal tombs, and unparalleled archaeological treasures — Luxor is Egypt\'s open-air museum.',
    relatedGuides: ['egypt-cultural-tours'],
    heroDescription: 'Welcome to Luxor, where the grandeur of ancient Egypt comes alive through magnificent temples and royal tombs that tell the story of pharaohs and gods. From exploring the awe-inspiring Karnak Temple to discovering the Valley of the Kings, from cruising the Nile to experiencing the magic of Luxor Temple at sunset, this ancient city offers the most authentic glimpse into Egypt\'s glorious past. Let our AI-powered planner help you discover the best experiences this incredible destination has to offer.',
    imageUrl: 'https://ouqeoizufbofdqbuiwvx.supabase.co/storage/v1/object/public/destinations//Luxor.jpg',
    tourCategories: [
      { name: 'Temple Tours', hasGuide: true },
      { name: 'Valley of the Kings Tours', hasGuide: true },
      { name: 'Nile Cruises', hasGuide: true },
      { name: 'Archaeological Tours', hasGuide: true },
      { name: 'Cultural Tours', hasGuide: true },
      { name: 'Sunset Tours', hasGuide: true }
    ],
    seo: {
      title: 'Luxor Tours & Excursions - Top-Rated Activities & Adventures',
      description: 'Discover top-rated Luxor tours, excursions, and activities powered by AI. From temple experiences to archaeological tours, find the perfect way to explore Egypt\'s ancient capital.',
      keywords: 'Luxor tours, temple tours, Valley of the Kings tours, things to do in Luxor',
      primaryKeyword: 'Luxor tours',
      secondaryKeywords: [
        'Luxor temple tours',
        'Valley of the Kings tours',
        'Luxor Nile cruises',
        'Luxor archaeological tours',
        'Luxor cultural tours',
        'Things to do in Luxor'
      ]
    },
    whyVisit: [
      'Magnificent ancient temples',
      'Valley of the Kings tombs',
      'Rich archaeological heritage',
      'Nile River experiences',
      'Authentic Egyptian culture',
      'Perfect ancient history immersion'
    ],
    bestTimeToVisit: {
      weather: 'Luxor has a desert climate. Summer (June-August) is extremely hot, while winter (December-February) is mild and pleasant.',
      bestMonths: 'March to May and October to November offer pleasant weather with fewer crowds.',
      peakSeason: 'December to February brings peak tourist season with mild weather, larger crowds, and higher prices.',
      offSeason: 'June to August offers lower prices but extremely hot weather.'
    },
    gettingAround: 'Organized tours include transportation. Walking is good in the city center, and tours are recommended for temple visits.',
    highlights: [
      'Karnak Temple - Largest temple complex',
      'Valley of the Kings - Royal tombs',
      'Luxor Temple - Ancient sanctuary',
      'Hatshepsut Temple - Queen\'s temple',
      'Nile River - Iconic waterway',
      'Luxor Museum - Archaeological treasures'
    ]
  },
  {
    id: 'aswan',
    name: 'Aswan',
    fullName: 'Aswan',
    country: 'Egypt',
    category: 'Africa',
    briefDescription: 'Nubian gateway with serene Nile views, ancient temples, and traditional culture — Aswan is Egypt\'s southern gem.',
    relatedGuides: ['egypt-cultural-tours'],
    heroDescription: 'Welcome to Aswan, where the Nile River flows serenely past ancient temples and Nubian culture thrives in this peaceful southern city. From exploring the magnificent Abu Simbel temples to cruising the Nile on traditional feluccas, from discovering the beautiful Philae Temple to experiencing authentic Nubian hospitality, this charming city offers a perfect blend of ancient wonders and cultural authenticity. Let our AI-powered planner help you discover the best experiences this incredible destination has to offer.',
    imageUrl: 'https://ouqeoizufbofdqbuiwvx.supabase.co/storage/v1/object/public/destinations//Aswan.jpg',
    tourCategories: [
      { name: 'Temple Tours', hasGuide: true },
      { name: 'Nile Cruises', hasGuide: true },
      { name: 'Nubian Village Tours', hasGuide: true },
      { name: 'Cultural Tours', hasGuide: true },
      { name: 'Felucca Tours', hasGuide: true },
      { name: 'Archaeological Tours', hasGuide: true }
    ],
    seo: {
      title: 'Aswan Tours & Excursions - Top-Rated Activities & Adventures',
      description: 'Discover top-rated Aswan tours, excursions, and activities powered by AI. From temple experiences to Nile cruises, find the perfect way to explore Egypt\'s southern gateway.',
      keywords: 'Aswan tours, temple tours, Nile cruises, things to do in Aswan',
      primaryKeyword: 'Aswan tours',
      secondaryKeywords: [
        'Aswan temple tours',
        'Aswan Nile cruises',
        'Nubian village tours',
        'Aswan cultural tours',
        'Aswan felucca tours',
        'Things to do in Aswan'
      ]
    },
    whyVisit: [
      'Abu Simbel temples',
      'Serene Nile River',
      'Nubian culture',
      'Philae Temple',
      'Traditional feluccas',
      'Perfect blend of history and tranquility'
    ],
    bestTimeToVisit: {
      weather: 'Aswan has a desert climate. Summer (June-August) is extremely hot, while winter (December-February) is mild and pleasant.',
      bestMonths: 'March to May and October to November offer pleasant weather with fewer crowds.',
      peakSeason: 'December to February brings peak tourist season with mild weather, larger crowds, and higher prices.',
      offSeason: 'June to August offers lower prices but extremely hot weather.'
    },
    gettingAround: 'Organized tours include transportation. Walking is good in the city center, and tours are recommended for temple visits.',
    highlights: [
      'Abu Simbel - Magnificent temples',
      'Philae Temple - Island sanctuary',
      'Nile River - Serene waterway',
      'Nubian Villages - Traditional culture',
      'Aswan High Dam - Engineering marvel',
      'Elephantine Island - Ancient ruins'
    ]
  },
  {
    id: 'marrakech',
    name: 'Marrakech',
    fullName: 'Marrakech',
    country: 'Morocco',
    category: 'Africa',
    briefDescription: 'Enchanting city with bustling souks, stunning palaces, and vibrant culture — Marrakech is Morocco\'s magical heart.',
    heroDescription: 'Welcome to Marrakech, where ancient medinas meet modern luxury and the magic of Morocco comes alive in every corner. From exploring the labyrinthine souks of the Medina to discovering the stunning Bahia Palace, from experiencing the vibrant Djemaa el-Fna square to relaxing in traditional hammams, this enchanting city offers the perfect blend of tradition and sophistication. Let our AI-powered planner help you discover the best experiences this incredible destination has to offer.',
    imageUrl: 'https://ouqeoizufbofdqbuiwvx.supabase.co/storage/v1/object/public/destinations//Marrakech.webp',
    tourCategories: [
      { name: 'Medina Tours', hasGuide: true },
      { name: 'Palace Tours', hasGuide: true },
      { name: 'Souk Tours', hasGuide: true },
      { name: 'Cultural Tours', hasGuide: true },
      { name: 'Food Tours', hasGuide: true },
      { name: 'Desert Tours', hasGuide: true }
    ],
    seo: {
      title: 'Marrakech Tours & Excursions - Top-Rated Activities & Adventures',
      description: 'Discover top-rated Marrakech tours, excursions, and activities powered by AI. From medina experiences to palace tours, find the perfect way to explore Morocco\'s magical city.',
      keywords: 'Marrakech tours, medina tours, palace tours, things to do in Marrakech',
      primaryKeyword: 'Marrakech tours',
      secondaryKeywords: [
        'Marrakech medina tours',
        'Marrakech palace tours',
        'Marrakech souk tours',
        'Marrakech cultural tours',
        'Marrakech food tours',
        'Things to do in Marrakech'
      ]
    },
    whyVisit: [
      'Enchanting medina',
      'Stunning palaces',
      'Vibrant souks',
      'Rich cultural heritage',
      'Traditional hammams',
      'Perfect blend of old and new'
    ],
    bestTimeToVisit: {
      weather: 'Marrakech has a semi-arid climate. Summer (June-August) is very hot, while winter (December-February) is mild and pleasant.',
      bestMonths: 'March to May and October to November offer pleasant weather with fewer crowds.',
      peakSeason: 'December to February brings peak tourist season with mild weather, larger crowds, and higher prices.',
      offSeason: 'June to August offers lower prices but extremely hot weather.'
    },
    gettingAround: 'Walking is the best way to explore the medina. Organized tours include transportation, and taxis are available for longer distances.',
    highlights: [
      'Djemaa el-Fna - Vibrant square',
      'Bahia Palace - Stunning architecture',
      'Medina Souks - Traditional markets',
      'Koutoubia Mosque - Iconic landmark',
      'Majorelle Garden - Beautiful oasis',
      'Saadian Tombs - Historical site'
    ]
  },
  {
    id: 'melbourne',
    name: 'Melbourne',
    fullName: 'Melbourne',
    country: 'Australia',
    category: 'Asia-Pacific',
    briefDescription: 'Culturally rich city with world-class arts, sports, and food scenes — Melbourne is Australia\'s vibrant capital.',
    heroDescription: 'Welcome to Melbourne, where the arts and culture thrive, sports are celebrated, and the food scene is unmatched. From exploring the National Gallery of Victoria to discovering the Royal Botanic Gardens, from cheering on the Melbourne Cricket Ground to indulging in the city\'s famous laneway cafes, this culturally rich city offers the perfect blend of sophistication and laid-back charm. Let our AI-powered planner help you discover the best experiences this incredible destination has to offer.',
    imageUrl: 'https://ouqeoizufbofdqbuiwvx.supabase.co/storage/v1/object/public/destinations/Melbourne.jpg',
    tourCategories: [
      { name: 'City Tours', hasGuide: true },
      { name: 'Art Tours', hasGuide: true },
      { name: 'Sports Tours', hasGuide: true },
      { name: 'Food Tours', hasGuide: true },
      { name: 'Cultural Tours', hasGuide: true },
      { name: 'Nature Tours', hasGuide: true }
    ],
    seo: {
      title: 'Melbourne Tours & Excursions - Top-Rated Activities & Adventures',
      description: 'Discover top-rated Melbourne tours, excursions, and activities powered by AI. From art experiences to sports adventures, find the perfect way to explore Australia\'s vibrant capital.',
      keywords: 'Melbourne tours, art tours, sports tours, things to do in Melbourne',
      primaryKeyword: 'Melbourne tours',
      secondaryKeywords: [
        'Melbourne city tours',
        'Melbourne art tours',
        'Melbourne sports tours',
        'Melbourne food tours',
        'Melbourne cultural tours',
        'Things to do in Melbourne'
      ]
    },
    whyVisit: [
      'World-class arts scene',
      'Sports and entertainment',
      'Diverse food scene',
      'Rich cultural heritage',
      'Beautiful parks and gardens',
      'Perfect blend of city and nature'
    ],
    bestTimeToVisit: {
      weather: 'Melbourne has four distinct seasons. Spring (September-November) and autumn (March-May) are pleasant, summer (December-February) is warm, and winter (June-August) is mild.',
      bestMonths: 'March to May and September to November offer the best weather with pleasant temperatures.',
      peakSeason: 'December to February brings peak tourist season with warm weather, larger crowds, and higher prices.',
      offSeason: 'June to August offers lower prices but cooler weather.'
    },
    gettingAround: 'Public transport is excellent. Walking is perfect for the CBD, and organized tours include transportation.',
    highlights: [
      'National Gallery of Victoria - World-class art',
      'Royal Botanic Gardens - Beautiful gardens',
      'Melbourne Cricket Ground - Iconic sports venue',
      'Federation Square - Cultural hub',
      'Queen Victoria Market - Traditional market',
      'Great Ocean Road - Scenic drive'
    ]
  },
  {
    id: 'mamanuca-islands',
    name: 'Mamanuca Islands',
    fullName: 'Mamanuca Islands',
    country: 'Fiji',
    category: 'Asia-Pacific',
    briefDescription: 'Tropical archipelago with crystal-clear waters, coral reefs, and island adventures — Mamanuca Islands are Fiji\'s island paradise.',
    heroDescription: 'Welcome to the Mamanuca Islands, where crystal-clear waters meet pristine coral reefs and island adventures await around every corner. From snorkeling vibrant reefs to relaxing on white-sand beaches, from island hopping to traditional Fijian experiences, this tropical archipelago offers the perfect blend of adventure and relaxation. Let our AI-powered planner help you discover the best experiences this incredible destination has to offer.',
    imageUrl: 'https://ouqeoizufbofdqbuiwvx.supabase.co/storage/v1/object/public/destinations//Mamanuca%20Islands.jpg',
    tourCategories: [
      { name: 'Island Tours', hasGuide: true },
      { name: 'Snorkeling Tours', hasGuide: true },
      { name: 'Beach Tours', hasGuide: true },
      { name: 'Cultural Tours', hasGuide: true },
      { name: 'Water Sports', hasGuide: true },
      { name: 'Adventure Tours', hasGuide: true }
    ],
    seo: {
      title: 'Mamanuca Islands Tours & Excursions - Top-Rated Activities & Adventures',
      description: 'Discover top-rated Mamanuca Islands tours, excursions, and activities powered by AI. From island experiences to snorkeling adventures, find the perfect way to explore Fiji\'s island paradise.',
      keywords: 'Mamanuca Islands tours, island tours, snorkeling tours, things to do in Mamanuca Islands',
      primaryKeyword: 'Mamanuca Islands tours',
      secondaryKeywords: [
        'Mamanuca Islands island tours',
        'Mamanuca Islands snorkeling tours',
        'Mamanuca Islands beach tours',
        'Mamanuca Islands cultural tours',
        'Mamanuca Islands water sports',
        'Things to do in Mamanuca Islands'
      ]
    },
    whyVisit: [
      'Crystal-clear waters',
      'Pristine coral reefs',
      'White-sand beaches',
      'Island adventures',
      'Fijian culture',
      'Perfect blend of adventure and relaxation'
    ],
    bestTimeToVisit: {
      weather: 'The Mamanuca Islands have a tropical climate. Dry season (May-October) is pleasant, and wet season (November-April) brings rain and humidity.',
      bestMonths: 'May to October offers the best weather with pleasant temperatures and less rain.',
      peakSeason: 'July to September brings peak tourist season with ideal weather, larger crowds, and higher prices.',
      offSeason: 'November to April offers lower prices but wet weather and potential cyclones.'
    },
    gettingAround: 'Boat transfers connect the islands. Organized tours include transportation, and walking is perfect on each island.',
    highlights: [
      'Coral Reefs - Vibrant marine life',
      'White-Sand Beaches - Pristine shores',
      'Island Hopping - Multiple islands',
      'Snorkeling - Marine exploration',
      'Traditional Villages - Fijian culture',
      'Water Sports - Adventure activities'
    ]
  },
  {
    id: 'casablanca',
    name: 'Casablanca',
    fullName: 'Casablanca',
    country: 'Morocco',
    category: 'Africa',
    briefDescription: 'Modern metropolis with stunning architecture, coastal charm, and cosmopolitan culture — Casablanca is Morocco\'s economic hub.',
    heroDescription: 'Welcome to Casablanca, where modern sophistication meets coastal charm and the spirit of the classic film comes alive in this vibrant metropolis. From exploring the magnificent Hassan II Mosque to strolling along the Corniche, from discovering the Art Deco architecture to experiencing the city\'s thriving food scene, this cosmopolitan city offers the perfect blend of tradition and modernity. Let our AI-powered planner help you discover the best experiences this incredible destination has to offer.',
    imageUrl: 'https://ouqeoizufbofdqbuiwvx.supabase.co/storage/v1/object/public/destinations//Casablanca.webp',
    tourCategories: [
      { name: 'City Tours', hasGuide: true },
      { name: 'Mosque Tours', hasGuide: true },
      { name: 'Architecture Tours', hasGuide: true },
      { name: 'Coastal Tours', hasGuide: true },
      { name: 'Food Tours', hasGuide: true },
      { name: 'Cultural Tours', hasGuide: true }
    ],
    seo: {
      title: 'Casablanca Tours & Excursions - Top-Rated Activities & Adventures',
      description: 'Discover top-rated Casablanca tours, excursions, and activities powered by AI. From mosque experiences to city tours, find the perfect way to explore Morocco\'s economic hub.',
      keywords: 'Casablanca tours, mosque tours, city tours, things to do in Casablanca',
      primaryKeyword: 'Casablanca tours',
      secondaryKeywords: [
        'Casablanca city tours',
        'Hassan II Mosque tours',
        'Casablanca architecture tours',
        'Casablanca coastal tours',
        'Casablanca food tours',
        'Things to do in Casablanca'
      ]
    },
    whyVisit: [
      'Hassan II Mosque',
      'Modern architecture',
      'Coastal location',
      'Cosmopolitan culture',
      'Art Deco heritage',
      'Perfect blend of tradition and modernity'
    ],
    bestTimeToVisit: {
      weather: 'Casablanca has a Mediterranean climate. Summer (June-August) is warm, while winter (December-February) is mild and can be rainy.',
      bestMonths: 'March to May and October to November offer pleasant weather with fewer crowds.',
      peakSeason: 'December to February brings peak tourist season with mild weather, larger crowds, and higher prices.',
      offSeason: 'June to August offers lower prices but warm weather.'
    },
    gettingAround: 'Taxis and public transport are available. Organized tours include transportation, and walking is good in the city center.',
    highlights: [
      'Hassan II Mosque - Stunning architecture',
      'Corniche - Coastal promenade',
      'Art Deco District - Historic architecture',
      'Old Medina - Traditional quarter',
      'Rick\'s Cafe - Film-inspired venue',
      'Central Market - Local culture'
    ]
  },
  {
    id: 'nairobi',
    name: 'Nairobi',
    fullName: 'Nairobi',
    country: 'Kenya',
    category: 'Africa',
    briefDescription: 'Dynamic capital with wildlife sanctuaries, modern culture, and gateway to African adventures — Nairobi is Kenya\'s vibrant heart.',
    relatedGuides: ['best-time-for-african-safari'],
    heroDescription: 'Welcome to Nairobi, where urban sophistication meets African wilderness and the spirit of adventure comes alive in this dynamic capital. From exploring the unique Nairobi National Park to discovering the Giraffe Centre, from experiencing the vibrant Maasai Market to learning about conservation at the David Sheldrick Wildlife Trust, this fascinating city offers the perfect blend of wildlife encounters and urban culture. Let our AI-powered planner help you discover the best experiences this incredible destination has to offer.',
    imageUrl: 'https://ouqeoizufbofdqbuiwvx.supabase.co/storage/v1/object/public/destinations//Nairobi.webp',
    tourCategories: [
      { name: 'Wildlife Tours', hasGuide: true },
      { name: 'City Tours', hasGuide: true },
      { name: 'Cultural Tours', hasGuide: true },
      { name: 'Conservation Tours', hasGuide: true },
      { name: 'Food Tours', hasGuide: true },
      { name: 'Adventure Tours', hasGuide: true }
    ],
    seo: {
      title: 'Nairobi Tours & Excursions - Top-Rated Activities & Adventures',
      description: 'Discover top-rated Nairobi tours, excursions, and activities powered by AI. From wildlife experiences to city tours, find the perfect way to explore Kenya\'s vibrant capital.',
      keywords: 'Nairobi tours, wildlife tours, city tours, things to do in Nairobi',
      primaryKeyword: 'Nairobi tours',
      secondaryKeywords: [
        'Nairobi wildlife tours',
        'Nairobi city tours',
        'Nairobi cultural tours',
        'Nairobi conservation tours',
        'Nairobi food tours',
        'Things to do in Nairobi'
      ]
    },
    whyVisit: [
      'Nairobi National Park',
      'Wildlife conservation',
      'Modern African culture',
      'Gateway to safaris',
      'Vibrant markets',
      'Perfect blend of city and wildlife'
    ],
    bestTimeToVisit: {
      weather: 'Nairobi has a subtropical highland climate. Summer (December-March) is warm, while winter (June-August) is mild and dry.',
      bestMonths: 'January to March and July to October offer pleasant weather with good wildlife viewing.',
      peakSeason: 'July to September brings peak tourist season with excellent weather, larger crowds, and higher prices.',
      offSeason: 'April to June offers lower prices but rainy weather.'
    },
    gettingAround: 'Taxis and public transport are available. Organized tours include transportation, and walking is good in safe areas.',
    highlights: [
      'Nairobi National Park - Wildlife sanctuary',
      'Giraffe Centre - Conservation center',
      'David Sheldrick Wildlife Trust - Elephant orphanage',
      'Maasai Market - Traditional crafts',
      'Karen Blixen Museum - Historical site',
      'Bomas of Kenya - Cultural village'
    ]
  },
  {
    id: 'maasai-mara',
    name: 'Maasai Mara',
    fullName: 'Maasai Mara',
    country: 'Kenya',
    category: 'Africa',
    briefDescription: 'Iconic wildlife reserve with the Great Migration, Big Five, and traditional Maasai culture — Maasai Mara is Kenya\'s safari crown jewel.',
    relatedGuides: ['best-time-for-african-safari'],
    heroDescription: 'Welcome to Maasai Mara, where the African savanna comes alive with incredible wildlife encounters and the annual Great Migration creates one of nature\'s most spectacular shows. From witnessing the dramatic river crossings to spotting the Big Five on game drives, from experiencing traditional Maasai culture to staying in luxury tented camps, this iconic reserve offers the ultimate African safari experience. Let our AI-powered planner help you discover the best wildlife experiences this incredible destination has to offer.',
    imageUrl: 'https://ouqeoizufbofdqbuiwvx.supabase.co/storage/v1/object/public/destinations//Maasai%20Mara.jpeg',
    tourCategories: [
      { name: 'Safari Tours', hasGuide: true },
      { name: 'Great Migration Tours', hasGuide: true },
      { name: 'Game Drives', hasGuide: true },
      { name: 'Cultural Tours', hasGuide: true },
      { name: 'Wildlife Photography Tours', hasGuide: true },
      { name: 'Luxury Camp Experiences', hasGuide: true }
    ],
    seo: {
      title: 'Maasai Mara Tours & Safaris - Top-Rated Wildlife Adventures',
      description: 'Discover top-rated Maasai Mara tours, safaris, and wildlife experiences powered by AI. From Great Migration encounters to Big Five sightings, find the perfect way to explore Kenya\'s premier wildlife destination.',
      keywords: 'Maasai Mara tours, safari tours, Great Migration tours, things to do in Maasai Mara',
      primaryKeyword: 'Maasai Mara tours',
      secondaryKeywords: [
        'Maasai Mara safari tours',
        'Great Migration tours',
        'Maasai Mara game drives',
        'Maasai Mara cultural tours',
        'Maasai Mara wildlife photography',
        'Things to do in Maasai Mara'
      ]
    },
    whyVisit: [
      'Great Migration spectacle',
      'Big Five wildlife',
      'Traditional Maasai culture',
      'Luxury tented camps',
      'Professional safari guides',
      'Perfect African safari experience'
    ],
    bestTimeToVisit: {
      weather: 'Maasai Mara has a tropical savanna climate. Dry season (June-October) offers better wildlife viewing, while wet season (November-May) brings lush vegetation.',
      bestMonths: 'July to October offers the best wildlife viewing with the Great Migration and dry conditions.',
      peakSeason: 'July to September brings peak tourist season with the Great Migration, larger crowds, and higher prices.',
      offSeason: 'November to May offers lower prices but wet weather and fewer animals.'
    },
    gettingAround: 'Organized safari tours include transportation. Flying safaris are available, and guided tours are recommended for the best experience.',
    highlights: [
      'Great Migration - Annual wildlife spectacle',
      'Big Five Wildlife - Lions, elephants, rhinos, leopards, buffalos',
      'Maasai Villages - Traditional culture',
      'Luxury Tented Camps - Comfortable accommodation',
      'Game Drives - Professional guided safaris',
      'River Crossings - Dramatic wildlife moments'
    ]
  },
  {
    id: 'mombasa',
    name: 'Mombasa',
    fullName: 'Mombasa',
    country: 'Kenya',
    category: 'Africa',
    briefDescription: 'Coastal paradise with pristine beaches, rich history, and Swahili culture — Mombasa is Kenya\'s tropical gateway.',
    relatedGuides: ['best-time-for-african-safari'],
    heroDescription: 'Welcome to Mombasa, where pristine Indian Ocean beaches meet centuries of Swahili heritage and the warm coastal breeze carries the scent of spices and adventure. From relaxing on white-sand beaches to exploring the historic Old Town, from discovering Fort Jesus to experiencing traditional Swahili cuisine, this tropical paradise offers the perfect blend of beach relaxation and cultural discovery. Let our AI-powered planner help you discover the best experiences this incredible destination has to offer.',
    imageUrl: 'https://ouqeoizufbofdqbuiwvx.supabase.co/storage/v1/object/public/destinations//Mombasa.jpg',
    tourCategories: [
      { name: 'Beach Tours', hasGuide: true },
      { name: 'Historical Tours', hasGuide: true },
      { name: 'Cultural Tours', hasGuide: true },
      { name: 'Water Sports Tours', hasGuide: true },
      { name: 'Food Tours', hasGuide: true },
      { name: 'Island Tours', hasGuide: true }
    ],
    seo: {
      title: 'Mombasa Tours & Excursions - Top-Rated Activities & Adventures',
      description: 'Discover top-rated Mombasa tours, excursions, and activities powered by AI. From beach experiences to cultural tours, find the perfect way to explore Kenya\'s coastal paradise.',
      keywords: 'Mombasa tours, beach tours, historical tours, things to do in Mombasa',
      primaryKeyword: 'Mombasa tours',
      secondaryKeywords: [
        'Mombasa beach tours',
        'Mombasa historical tours',
        'Mombasa cultural tours',
        'Mombasa water sports',
        'Mombasa food tours',
        'Things to do in Mombasa'
      ]
    },
    whyVisit: [
      'Pristine beaches',
      'Rich Swahili heritage',
      'Historic Old Town',
      'Warm tropical climate',
      'Traditional cuisine',
      'Perfect blend of beach and culture'
    ],
    bestTimeToVisit: {
      weather: 'Mombasa has a tropical climate. Summer (December-March) is hot and humid, while winter (June-August) is warm and dry.',
      bestMonths: 'June to October offers pleasant weather with less humidity and good beach conditions.',
      peakSeason: 'December to March brings peak tourist season with warm weather, larger crowds, and higher prices.',
      offSeason: 'April to May offers lower prices but rainy weather.'
    },
    gettingAround: 'Taxis and tuk-tuks are available. Organized tours include transportation, and walking is good in the Old Town.',
    highlights: [
      'Diani Beach - Pristine coastline',
      'Old Town - Historic architecture',
      'Fort Jesus - Portuguese fortress',
      'Haller Park - Wildlife sanctuary',
      'Mombasa Marine Park - Coral reefs',
      'Swahili Cuisine - Traditional flavors'
    ]
  },
  {
    id: 'arusha',
    name: 'Arusha',
    fullName: 'Arusha',
    country: 'Tanzania',
    category: 'Africa',
    briefDescription: 'Safari gateway with Mount Meru views, coffee culture, and gateway to northern parks — Arusha is Tanzania\'s adventure hub.',
    heroDescription: 'Welcome to Arusha, where the majestic Mount Meru provides a stunning backdrop and the spirit of African adventure comes alive in this vibrant safari gateway. From exploring the beautiful Arusha National Park to discovering the city\'s coffee culture, from visiting the Cultural Heritage Centre to experiencing traditional Tanzanian hospitality, this charming city offers the perfect starting point for unforgettable safari adventures. Let our AI-powered planner help you discover the best experiences this incredible destination has to offer.',
    imageUrl: 'https://ouqeoizufbofdqbuiwvx.supabase.co/storage/v1/object/public/destinations//Arusha.jpg',
    tourCategories: [
      { name: 'Safari Gateway Tours', hasGuide: true },
      { name: 'National Park Tours', hasGuide: true },
      { name: 'Cultural Tours', hasGuide: true },
      { name: 'Coffee Tours', hasGuide: true },
      { name: 'Mountain Tours', hasGuide: true },
      { name: 'City Tours', hasGuide: true }
    ],
    seo: {
      title: 'Arusha Tours & Excursions - Top-Rated Activities & Adventures',
      description: 'Discover top-rated Arusha tours, excursions, and activities powered by AI. From safari experiences to cultural tours, find the perfect way to explore Tanzania\'s adventure hub.',
      keywords: 'Arusha tours, safari tours, national park tours, things to do in Arusha',
      primaryKeyword: 'Arusha tours',
      secondaryKeywords: [
        'Arusha safari tours',
        'Arusha national park tours',
        'Arusha cultural tours',
        'Arusha coffee tours',
        'Arusha mountain tours',
        'Things to do in Arusha'
      ]
    },
    whyVisit: [
      'Safari gateway',
      'Mount Meru views',
      'Coffee culture',
      'Cultural heritage',
      'Adventure hub',
      'Perfect starting point for safaris'
    ],
    bestTimeToVisit: {
      weather: 'Arusha has a subtropical highland climate. Summer (December-March) is warm, while winter (June-August) is mild and dry.',
      bestMonths: 'January to March and July to October offer pleasant weather with good wildlife viewing.',
      peakSeason: 'July to September brings peak tourist season with excellent weather, larger crowds, and higher prices.',
      offSeason: 'April to June offers lower prices but rainy weather.'
    },
    gettingAround: 'Taxis and public transport are available. Organized tours include transportation, and walking is good in the city center.',
    highlights: [
      'Arusha National Park - Wildlife sanctuary',
      'Mount Meru - Stunning backdrop',
      'Cultural Heritage Centre - Local crafts',
      'Coffee Plantations - Traditional farming',
      'Arusha Clock Tower - City landmark',
      'Local Markets - Traditional culture'
    ]
  },
  {
    id: 'zanzibar',
    name: 'Zanzibar',
    fullName: 'Zanzibar',
    country: 'Tanzania',
    category: 'Africa',
    briefDescription: 'Spice island with pristine beaches, historic Stone Town, and rich cultural heritage — Zanzibar is Tanzania\'s tropical paradise.',
    heroDescription: 'Welcome to Zanzibar, where the scent of spices fills the air and pristine Indian Ocean beaches meet centuries of Swahili culture. From exploring the historic Stone Town to relaxing on white-sand beaches, from discovering spice plantations to experiencing traditional dhow sailing, this enchanting island offers the perfect blend of history, culture, and tropical beauty. Let our AI-powered planner help you discover the best experiences this incredible destination has to offer.',
    imageUrl: 'https://ouqeoizufbofdqbuiwvx.supabase.co/storage/v1/object/public/destinations//Zanzibar.jpg',
    tourCategories: [
      { name: 'Stone Town Tours', hasGuide: true },
      { name: 'Beach Tours', hasGuide: true },
      { name: 'Spice Tours', hasGuide: true },
      { name: 'Cultural Tours', hasGuide: true },
      { name: 'Dhow Tours', hasGuide: true },
      { name: 'Water Sports Tours', hasGuide: true }
    ],
    seo: {
      title: 'Zanzibar Tours & Excursions - Top-Rated Activities & Adventures',
      description: 'Discover top-rated Zanzibar tours, excursions, and activities powered by AI. From Stone Town experiences to beach tours, find the perfect way to explore Tanzania\'s tropical paradise.',
      keywords: 'Zanzibar tours, Stone Town tours, beach tours, things to do in Zanzibar',
      primaryKeyword: 'Zanzibar tours',
      secondaryKeywords: [
        'Zanzibar Stone Town tours',
        'Zanzibar beach tours',
        'Zanzibar spice tours',
        'Zanzibar cultural tours',
        'Zanzibar dhow tours',
        'Things to do in Zanzibar'
      ]
    },
    whyVisit: [
      'Historic Stone Town',
      'Pristine beaches',
      'Spice plantations',
      'Rich Swahili culture',
      'Traditional dhows',
      'Perfect blend of history and paradise'
    ],
    bestTimeToVisit: {
      weather: 'Zanzibar has a tropical climate. Summer (December-March) is hot and humid, while winter (June-August) is warm and dry.',
      bestMonths: 'June to October offers pleasant weather with less humidity and good beach conditions.',
      peakSeason: 'December to March brings peak tourist season with warm weather, larger crowds, and higher prices.',
      offSeason: 'April to May offers lower prices but rainy weather.'
    },
    gettingAround: 'Taxis and local transport are available. Organized tours include transportation, and walking is good in Stone Town.',
    highlights: [
      'Stone Town - Historic architecture',
      'Nungwi Beach - Pristine coastline',
      'Spice Plantations - Traditional farming',
      'House of Wonders - Historical site',
      'Prison Island - Wildlife sanctuary',
      'Traditional Dhows - Sailing experiences'
    ]
  },
  {
    id: 'swakopmund',
    name: 'Swakopmund',
    fullName: 'Swakopmund',
    country: 'Namibia',
    category: 'Africa',
    briefDescription: 'Coastal gem with German architecture, desert adventures, and Atlantic charm — Swakopmund is Namibia\'s adventure capital.',
    heroDescription: 'Welcome to Swakopmund, where German colonial architecture meets the vast Namib Desert and the Atlantic Ocean creates a unique coastal atmosphere. From exploring the charming historic center to embarking on desert adventures, from discovering the nearby Skeleton Coast to experiencing traditional Namibian hospitality, this coastal gem offers the perfect blend of European charm and African adventure. Let our AI-powered planner help you discover the best experiences this incredible destination has to offer.',
    imageUrl: 'https://ouqeoizufbofdqbuiwvx.supabase.co/storage/v1/object/public/destinations//Swakopmund.jpg',
    tourCategories: [
      { name: 'Desert Tours', hasGuide: true },
      { name: 'City Tours', hasGuide: true },
      { name: 'Adventure Tours', hasGuide: true },
      { name: 'Cultural Tours', hasGuide: true },
      { name: 'Coastal Tours', hasGuide: true },
      { name: 'Historical Tours', hasGuide: true }
    ],
    seo: {
      title: 'Swakopmund Tours & Excursions - Top-Rated Activities & Adventures',
      description: 'Discover top-rated Swakopmund tours, excursions, and activities powered by AI. From desert experiences to city tours, find the perfect way to explore Namibia\'s adventure capital.',
      keywords: 'Swakopmund tours, desert tours, adventure tours, things to do in Swakopmund',
      primaryKeyword: 'Swakopmund tours',
      secondaryKeywords: [
        'Swakopmund desert tours',
        'Swakopmund city tours',
        'Swakopmund adventure tours',
        'Swakopmund cultural tours',
        'Swakopmund coastal tours',
        'Things to do in Swakopmund'
      ]
    },
    whyVisit: [
      'German colonial architecture',
      'Desert adventures',
      'Atlantic coastline',
      'Adventure activities',
      'Unique atmosphere',
      'Perfect blend of Europe and Africa'
    ],
    bestTimeToVisit: {
      weather: 'Swakopmund has a desert climate. Summer (December-March) is warm, while winter (June-August) is mild with coastal fog.',
      bestMonths: 'April to May and September to November offer pleasant weather with clear skies.',
      peakSeason: 'July to September brings peak tourist season with mild weather, larger crowds, and higher prices.',
      offSeason: 'December to March offers lower prices but warmer weather.'
    },
    gettingAround: 'Walking is the best way to explore the city center. Organized tours include transportation, and taxis are available.',
    highlights: [
      'Historic Center - German architecture',
      'Namib Desert - Adventure playground',
      'Skeleton Coast - Dramatic coastline',
      'Adventure Activities - Sandboarding, quad biking',
      'Mole - Ocean promenade',
      'Local Markets - Traditional culture'
    ]
  },
  {
    id: 'etosha-national-park',
    name: 'Etosha National Park',
    fullName: 'Etosha National Park',
    country: 'Namibia',
    category: 'Africa',
    briefDescription: 'Iconic wildlife sanctuary with salt pan, diverse wildlife, and excellent game viewing — Etosha National Park is Namibia\'s premier safari destination.',
    heroDescription: 'Welcome to Etosha National Park, where the vast salt pan creates a surreal landscape and incredible wildlife encounters await around every waterhole. From spotting the Big Five on game drives to witnessing the dramatic salt pan at sunset, from staying in comfortable lodges to experiencing the magic of African wildlife, this iconic park offers the ultimate Namibian safari experience. Let our AI-powered planner help you discover the best wildlife experiences this incredible destination has to offer.',
    imageUrl: 'https://ouqeoizufbofdqbuiwvx.supabase.co/storage/v1/object/public/destinations//Etosha%20National%20Park.jpeg',
    tourCategories: [
      { name: 'Safari Tours', hasGuide: true },
      { name: 'Game Drives', hasGuide: true },
      { name: 'Wildlife Photography Tours', hasGuide: true },
      { name: 'Bird Watching Tours', hasGuide: true },
      { name: 'Lodge Experiences', hasGuide: true },
      { name: 'Sunset Tours', hasGuide: true }
    ],
    seo: {
      title: 'Etosha National Park Tours & Safaris - Top-Rated Wildlife Adventures',
      description: 'Discover top-rated Etosha National Park tours, safaris, and wildlife experiences powered by AI. From Big Five encounters to salt pan experiences, find the perfect way to explore Namibia\'s premier wildlife destination.',
      keywords: 'Etosha National Park tours, safari tours, wildlife tours, things to do in Etosha',
      primaryKeyword: 'Etosha National Park tours',
      secondaryKeywords: [
        'Etosha safari tours',
        'Etosha game drives',
        'Etosha wildlife photography',
        'Etosha bird watching',
        'Etosha lodge experiences',
        'Things to do in Etosha National Park'
      ]
    },
    whyVisit: [
      'Iconic salt pan',
      'Big Five wildlife',
      'Excellent game viewing',
      'Comfortable lodges',
      'Professional guides',
      'Perfect Namibian safari experience'
    ],
    bestTimeToVisit: {
      weather: 'Etosha has a semi-arid climate. Dry season (May-October) offers better wildlife viewing, while wet season (November-April) brings lush vegetation.',
      bestMonths: 'May to October offers the best wildlife viewing with dry conditions and animals gathering at waterholes.',
      peakSeason: 'July to September brings peak tourist season with excellent wildlife viewing, larger crowds, and higher prices.',
      offSeason: 'December to March offers lower prices but wet weather and dense vegetation.'
    },
    gettingAround: 'Organized safari tours include transportation. Self-drive is possible but guided tours are recommended for the best experience.',
    highlights: [
      'Etosha Salt Pan - Surreal landscape',
      'Big Five Wildlife - Lions, elephants, rhinos, leopards, buffalos',
      'Waterholes - Wildlife gathering spots',
      'Comfortable Lodges - Quality accommodation',
      'Game Drives - Professional guided safaris',
      'Sunset Views - Magical evening experiences'
    ]
  },
  {
    id: 'mauritius',
    name: 'Mauritius',
    fullName: 'Mauritius',
    country: 'Mauritius',
    category: 'Africa',
    briefDescription: 'Tropical paradise with pristine beaches, diverse culture, and luxury resorts — Mauritius is the Indian Ocean\'s perfect island escape.',
    heroDescription: 'Welcome to Mauritius, where turquoise waters meet pristine white-sand beaches and a melting pot of cultures creates a unique island experience. From relaxing on stunning beaches to exploring the colorful capital of Port Louis, from discovering the Seven Colored Earths to experiencing traditional Creole cuisine, this tropical paradise offers the perfect blend of luxury and authenticity. Let our AI-powered planner help you discover the best experiences this incredible destination has to offer.',
    imageUrl: 'https://ouqeoizufbofdqbuiwvx.supabase.co/storage/v1/object/public/destinations//Mauritius.jpeg',
    tourCategories: [
      { name: 'Beach Tours', hasGuide: true },
      { name: 'Island Tours', hasGuide: true },
      { name: 'Cultural Tours', hasGuide: true },
      { name: 'Water Sports Tours', hasGuide: true },
      { name: 'Luxury Resort Experiences', hasGuide: true },
      { name: 'Adventure Tours', hasGuide: true }
    ],
    seo: {
      title: 'Mauritius Tours & Excursions - Top-Rated Activities & Adventures',
      description: 'Discover top-rated Mauritius tours, excursions, and activities powered by AI. From beach experiences to island tours, find the perfect way to explore the Indian Ocean\'s paradise.',
      keywords: 'Mauritius tours, beach tours, island tours, things to do in Mauritius',
      primaryKeyword: 'Mauritius tours',
      secondaryKeywords: [
        'Mauritius beach tours',
        'Mauritius island tours',
        'Mauritius cultural tours',
        'Mauritius water sports',
        'Mauritius luxury experiences',
        'Things to do in Mauritius'
      ]
    },
    whyVisit: [
      'Pristine beaches',
      'Diverse culture',
      'Luxury resorts',
      'Tropical climate',
      'Water sports',
      'Perfect island paradise'
    ],
    bestTimeToVisit: {
      weather: 'Mauritius has a tropical climate. Summer (November-April) is hot and humid, while winter (May-October) is warm and dry.',
      bestMonths: 'May to October offers pleasant weather with less humidity and good beach conditions.',
      peakSeason: 'December to March brings peak tourist season with warm weather, larger crowds, and higher prices.',
      offSeason: 'April to May offers lower prices but wet weather.'
    },
    gettingAround: 'Car rental is recommended for exploring. Organized tours include transportation, and taxis are available.',
    highlights: [
      'Belle Mare Beach - Pristine coastline',
      'Port Louis - Colorful capital',
      'Seven Colored Earths - Natural wonder',
      'Chamarel Waterfall - Beautiful cascade',
      'Luxury Resorts - World-class accommodation',
      'Creole Cuisine - Traditional flavors'
    ]
  },
  {
    id: 'dubai',
    name: 'Dubai',
    fullName: 'Dubai, UAE',
    category: 'Middle East',
    country: 'United Arab Emirates',
    briefDescription: 'Luxury shopping, futuristic architecture, and desert adventures — Dubai is where modern innovation meets Arabian tradition in the heart of the Middle East.',
    relatedGuides: [],
    heroDescription: 'Welcome to Dubai, where futuristic skylines meet ancient traditions and luxury knows no bounds. From the world\'s tallest building to pristine desert dunes, from world-class shopping malls to traditional souks, Dubai offers an extraordinary blend of opulence, adventure, and cultural richness. Whether you\'re seeking thrilling desert safaris, iconic landmarks, or unparalleled shopping experiences, this dynamic city promises unforgettable moments at every turn. Let our AI-powered planner help you discover the best this dazzling destination has to offer.',
    imageUrl: 'https://ouqeoizufbofdqbuiwvx.supabase.co/storage/v1/object/public/destinations/dubai.png',
    tourCategories: [
      { name: 'Desert Safaris', hasGuide: true },
      { name: 'City Tours', hasGuide: true },
      { name: 'Burj Khalifa Tours', hasGuide: true },
      { name: 'Food Tours', hasGuide: true },
      { name: 'Cultural Tours', hasGuide: true },
      { name: 'Adventure Tours', hasGuide: true }
    ],
    seo: {
      title: 'Dubai Tours & Excursions - Top-Rated Activities & Adventures',
      description: 'Discover top-rated Dubai tours, excursions, and activities powered by AI. From desert safaris and Burj Khalifa visits to cultural tours and luxury experiences, find the perfect way to explore Dubai.',
      keywords: 'Dubai tours, Dubai excursions, Dubai activities, Dubai desert safari, Burj Khalifa tours, Dubai city tours, Dubai food tours, things to do in Dubai',
      primaryKeyword: 'Dubai tours',
      secondaryKeywords: [
        'Dubai desert safari',
        'Burj Khalifa tours',
        'Dubai city tours',
        'Dubai food tours',
        'Dubai cultural tours',
        'Things to do in Dubai'
      ]
    },
    whyVisit: [
      'Iconic landmarks including the world\'s tallest building, Burj Khalifa',
      'Thrilling desert safaris with dune bashing, camel rides, and traditional entertainment',
      'World-class shopping from luxury malls to traditional souks',
      'Diverse culinary scene blending Middle Eastern, Asian, and international cuisines',
      'Year-round sunshine with perfect weather for outdoor activities',
      'Unique blend of modern luxury and rich Arabian culture'
    ],
    bestTimeToVisit: {
      weather: 'Dubai enjoys year-round sunshine with hot summers (May-September) averaging 95-105°F (35-41°C) and pleasant winters (November-March) with temperatures of 70-80°F (21-27°C).',
      bestMonths: 'November to March offers the most comfortable weather for outdoor activities and sightseeing.',
      peakSeason: 'December to February brings peak tourist season with perfect weather, but higher prices and larger crowds.',
      offSeason: 'May to September offers lower prices but extremely hot weather, making indoor activities and early morning/evening tours more appealing.'
    },
    gettingAround: 'Dubai has an excellent metro system, taxis, and ride-sharing services. Many tours include hotel pickup. Renting a car is convenient for exploring at your own pace.',
    highlights: [
      'Burj Khalifa - World\'s tallest building with stunning city views',
      'Burj Al Arab - Iconic 7-star hotel and architectural marvel',
      'Dubai Mall - One of the world\'s largest shopping and entertainment destinations',
      'Palm Jumeirah - Man-made island shaped like a palm tree',
      'Dubai Marina - Stunning waterfront district with luxury yachts',
      'Dubai Desert - Endless dunes perfect for safaris and adventures'
    ]
  },
  {
    id: 'abu-dhabi',
    name: 'Abu Dhabi',
    fullName: 'Abu Dhabi, UAE',
    category: 'Middle East',
    country: 'United Arab Emirates',
    briefDescription: 'Luxurious culture, stunning architecture, and pristine beaches — Abu Dhabi is the sophisticated capital of the UAE, where tradition meets modern elegance.',
    relatedGuides: [],
    heroDescription: 'Welcome to Abu Dhabi, the elegant capital of the United Arab Emirates where cultural richness meets architectural splendor. From the magnificent Sheikh Zayed Grand Mosque to world-class museums, from pristine beaches to thrilling theme parks, Abu Dhabi offers a refined blend of heritage, luxury, and adventure. Whether you\'re exploring the opulent palaces, experiencing authentic Emirati culture, or enjoying world-class entertainment, this sophisticated city promises unforgettable experiences. Let our AI-powered planner help you discover the best this captivating capital has to offer.',
    imageUrl: 'https://ouqeoizufbofdqbuiwvx.supabase.co/storage/v1/object/public/destinations/Abu%20Dhabi.png',
    tourCategories: [
      { name: 'Grand Mosque Tours', hasGuide: true },
      { name: 'Cultural Tours', hasGuide: true },
      { name: 'Desert Safaris', hasGuide: true },
      { name: 'Yas Island Tours', hasGuide: true },
      { name: 'Heritage Tours', hasGuide: true },
      { name: 'Beach Tours', hasGuide: true }
    ],
    seo: {
      title: 'Abu Dhabi Tours & Excursions - Top-Rated Activities & Adventures',
      description: 'Discover top-rated Abu Dhabi tours, excursions, and activities powered by AI. From Grand Mosque visits and cultural tours to desert safaris and theme parks, find the perfect way to explore Abu Dhabi.',
      keywords: 'Abu Dhabi tours, Abu Dhabi excursions, Abu Dhabi activities, Sheikh Zayed Grand Mosque tours, Abu Dhabi desert safari, Yas Island tours, things to do in Abu Dhabi',
      primaryKeyword: 'Abu Dhabi tours',
      secondaryKeywords: [
        'Sheikh Zayed Grand Mosque tours',
        'Abu Dhabi cultural tours',
        'Abu Dhabi desert safari',
        'Yas Island tours',
        'Abu Dhabi heritage tours',
        'Things to do in Abu Dhabi'
      ]
    },
    whyVisit: [
      'Sheikh Zayed Grand Mosque - One of the world\'s most beautiful mosques',
      'Rich cultural heritage with world-class museums and heritage sites',
      'Pristine beaches and luxurious beachfront resorts',
      'Thrilling theme parks on Yas Island including Ferrari World and Warner Bros. World',
      'Authentic Emirati culture and traditional experiences',
      'Sophisticated dining scene and world-class shopping'
    ],
    bestTimeToVisit: {
      weather: 'Abu Dhabi enjoys year-round sunshine with hot summers (May-September) averaging 95-105°F (35-41°C) and pleasant winters (November-March) with temperatures of 70-80°F (21-27°C).',
      bestMonths: 'November to March offers the most comfortable weather for outdoor activities and sightseeing.',
      peakSeason: 'December to February brings peak tourist season with perfect weather, but higher prices and larger crowds at popular attractions.',
      offSeason: 'May to September offers lower prices but extremely hot weather, making indoor attractions and early morning/evening activities more appealing.'
    },
    gettingAround: 'Abu Dhabi has an efficient public bus system, taxis, and ride-sharing services. Many tours include hotel pickup. Renting a car provides flexibility for exploring at your own pace.',
    highlights: [
      'Sheikh Zayed Grand Mosque - Architectural masterpiece and spiritual landmark',
      'Louvre Abu Dhabi - World-class art museum on Saadiyat Island',
      'Yas Island - Home to Ferrari World, Warner Bros. World, and Yas Waterworld',
      'Corniche Beach - Pristine 8km beachfront with stunning views',
      'Qasr Al Watan - Presidential Palace open to visitors',
      'Heritage Village - Authentic recreation of traditional Emirati life'
    ]
  },
  {
    id: 'doha',
    name: 'Doha',
    fullName: 'Doha, Qatar',
    category: 'Middle East',
    country: 'Qatar',
    briefDescription: 'Modern architecture, rich Islamic heritage, and world-class museums — Doha is where traditional Qatari culture meets contemporary luxury in the heart of the Arabian Gulf.',
    relatedGuides: [],
    heroDescription: 'Welcome to Doha, the vibrant capital of Qatar where futuristic skylines blend seamlessly with ancient traditions and Islamic heritage. From the stunning Museum of Islamic Art to the traditional Souq Waqif, from the modern Pearl-Qatar to the historic Al Zubarah Fort, Doha offers a captivating journey through time and culture. Whether you\'re exploring world-class museums, experiencing authentic Qatari hospitality, or enjoying luxury shopping and dining, this sophisticated city promises unforgettable experiences. Let our AI-powered planner help you discover the best this dynamic capital has to offer.',
    imageUrl: 'https://ouqeoizufbofdqbuiwvx.supabase.co/storage/v1/object/public/destinations/qatar.png',
    tourCategories: [
      { name: 'Cultural Tours', hasGuide: true },
      { name: 'Museum Tours', hasGuide: true },
      { name: 'Desert Safaris', hasGuide: true },
      { name: 'Souq Waqif Tours', hasGuide: true },
      { name: 'Food Tours', hasGuide: true },
      { name: 'City Tours', hasGuide: true }
    ],
    seo: {
      title: 'Doha Tours & Excursions - Top-Rated Activities & Adventures',
      description: 'Discover top-rated Doha tours, excursions, and activities powered by AI. From Museum of Islamic Art visits and cultural tours to desert safaris and traditional souks, find the perfect way to explore Doha.',
      keywords: 'Doha tours, Doha excursions, Doha activities, Museum of Islamic Art tours, Doha desert safari, Souq Waqif tours, things to do in Doha',
      primaryKeyword: 'Doha tours',
      secondaryKeywords: [
        'Museum of Islamic Art tours',
        'Doha cultural tours',
        'Doha desert safari',
        'Souq Waqif tours',
        'Doha food tours',
        'Things to do in Doha'
      ]
    },
    whyVisit: [
      'Museum of Islamic Art - World-renowned collection in an architectural masterpiece',
      'Souq Waqif - Authentic traditional market with Qatari culture and heritage',
      'Stunning modern architecture including the iconic Doha skyline',
      'Rich Islamic heritage and cultural experiences',
      'World-class dining scene blending traditional Qatari and international cuisines',
      'Luxury shopping and modern amenities in a traditional setting'
    ],
    bestTimeToVisit: {
      weather: 'Doha enjoys year-round sunshine with hot summers (May-September) averaging 95-105°F (35-41°C) and pleasant winters (November-March) with temperatures of 70-80°F (21-27°C).',
      bestMonths: 'November to March offers the most comfortable weather for outdoor activities and sightseeing.',
      peakSeason: 'December to February brings peak tourist season with perfect weather, but higher prices and larger crowds at popular attractions.',
      offSeason: 'May to September offers lower prices but extremely hot weather, making indoor attractions and early morning/evening activities more appealing.'
    },
    gettingAround: 'Doha has an efficient metro system, taxis, and ride-sharing services. Many tours include hotel pickup. The Doha Metro is modern, clean, and connects major attractions.',
    highlights: [
      'Museum of Islamic Art - I.M. Pei\'s architectural masterpiece housing world-class Islamic art',
      'Souq Waqif - Traditional Qatari market with authentic culture, food, and shopping',
      'The Pearl-Qatar - Man-made island with luxury residences and upscale shopping',
      'Katara Cultural Village - Cultural hub with theaters, galleries, and traditional architecture',
      'Aspire Park - Largest park in Doha with beautiful landscapes and family activities',
      'Corniche - Stunning 7km waterfront promenade with views of Doha skyline'
    ]
  },
  {
    id: 'muscat',
    name: 'Muscat',
    fullName: 'Muscat, Oman',
    category: 'Middle East',
    country: 'Oman',
    briefDescription: 'A stunning blend of ancient forts, pristine beaches, and traditional Omani culture — Muscat offers authentic Arabian experiences in a beautiful coastal setting.',
    relatedGuides: [],
    heroDescription: 'Welcome to Muscat, the enchanting capital of Oman where ancient forts overlook pristine beaches, traditional souks bustle with authentic Omani culture, and stunning mountains meet the turquoise waters of the Arabian Sea. From the magnificent Sultan Qaboos Grand Mosque to the historic Mutrah Souq, from the dramatic Wahiba Sands desert to the serene wadis, Muscat offers a perfect blend of heritage, natural beauty, and warm Omani hospitality. Whether you\'re exploring centuries-old forts, diving in crystal-clear waters, experiencing traditional Omani life, or simply relaxing on beautiful beaches, this captivating city promises unforgettable adventures. Let our AI-powered planner help you discover the best this authentic Arabian gem has to offer.',
    imageUrl: 'https://ouqeoizufbofdqbuiwvx.supabase.co/storage/v1/object/public/destinations/muscat%20oman.png',
    tourCategories: [
      { name: 'Cultural Tours', hasGuide: true },
      { name: 'Desert Safaris', hasGuide: true },
      { name: 'City Tours', hasGuide: true },
      { name: 'Wadi Tours', hasGuide: true },
      { name: 'Heritage Tours', hasGuide: true },
      { name: 'Adventure Tours', hasGuide: true }
    ],
    seo: {
      title: 'Muscat Tours & Activities - Top-Rated Experiences & Adventures',
      description: 'Discover top-rated Muscat tours, excursions, and activities powered by AI. From desert safaris and wadi adventures to cultural tours and heritage sites, find the perfect way to explore Muscat.',
      keywords: 'Muscat tours, Muscat activities, Muscat desert safari, Wahiba Sands tours, Muscat wadi tours, things to do in Muscat, Muscat excursions, Omani cultural tours',
      primaryKeyword: 'Muscat tours',
      secondaryKeywords: [
        'Muscat desert safari',
        'Wahiba Sands tours',
        'Muscat wadi tours',
        'Muscat cultural tours',
        'Muscat heritage tours',
        'Muscat adventure activities'
      ]
    },
    whyVisit: [
      'Sultan Qaboos Grand Mosque - One of the most beautiful mosques in the world',
      'Historic forts and traditional Omani architecture throughout the city',
      'Pristine beaches and crystal-clear waters perfect for diving and snorkeling',
      'Authentic Omani culture and warm hospitality in traditional souks',
      'Dramatic desert landscapes of Wahiba Sands just a short drive away',
      'Stunning wadis (valleys) with natural pools and waterfalls for adventure'
    ],
    bestTimeToVisit: {
      weather: 'Muscat has a hot desert climate with very hot summers (May-September) averaging 95-105°F (35-41°C) and pleasant winters (November-March) with temperatures of 70-80°F (21-27°C).',
      bestMonths: 'November to March offers the most comfortable weather for outdoor activities, sightseeing, and desert adventures.',
      peakSeason: 'December to February is peak tourist season with ideal weather, but higher prices and more crowds at popular attractions.',
      offSeason: 'May to September is the off-season with extremely hot temperatures, but lower prices and fewer crowds, ideal for indoor attractions and early morning activities.'
    },
    gettingAround: 'Muscat has a reliable public bus system, taxis, and ride-sharing services. Many tours include hotel pickup. Renting a car is also a good option for exploring beyond the city.',
    highlights: [
      'Sultan Qaboos Grand Mosque - Architectural masterpiece with stunning Islamic design',
      'Mutrah Souq - Traditional Omani market with authentic crafts, spices, and silver',
      'Al Jalali and Al Mirani Forts - Historic forts guarding Muscat harbor',
      'Royal Opera House Muscat - World-class venue showcasing Omani and international performances',
      'Wahiba Sands - Vast desert dunes perfect for safaris and traditional Bedouin experiences',
      'Wadi Shab - Beautiful valley with natural pools and waterfalls for swimming and hiking'
    ]
  },
  {
    id: 'riyadh',
    name: 'Riyadh',
    fullName: 'Riyadh, Saudi Arabia',
    category: 'Middle East',
    country: 'Saudi Arabia',
    briefDescription: 'The modern capital of Saudi Arabia where ancient traditions meet futuristic architecture, offering a unique blend of heritage, culture, and innovation in the heart of the Arabian Peninsula.',
    relatedGuides: [],
    heroDescription: 'Welcome to Riyadh, the dynamic capital of Saudi Arabia where ancient Najdi heritage meets visionary modern development, creating a fascinating destination that showcases the Kingdom\'s transformation. From the historic Diriyah UNESCO World Heritage Site to the futuristic King Abdullah Financial District, from traditional souks to world-class museums, Riyadh offers an extraordinary journey through Saudi culture, history, and ambition. Whether you\'re exploring ancient mud-brick palaces, experiencing authentic Saudi hospitality, discovering contemporary art and culture, or witnessing the Kingdom\'s rapid modernization, this captivating city promises unforgettable experiences. Let our AI-powered planner help you discover the best this remarkable capital has to offer.',
    imageUrl: 'https://ouqeoizufbofdqbuiwvx.supabase.co/storage/v1/object/public/destinations/Riyadh.png',
    tourCategories: [
      { name: 'Cultural Tours', hasGuide: true },
      { name: 'Desert Safaris', hasGuide: true },
      { name: 'City Tours', hasGuide: true },
      { name: 'Historical Tours', hasGuide: true },
      { name: 'Food Tours', hasGuide: true },
      { name: 'Adventure Tours', hasGuide: true }
    ],
    seo: {
      title: 'Riyadh Tours & Activities - Top-Rated Experiences & Adventures',
      description: 'Discover top-rated Riyadh tours, excursions, and activities powered by AI. From Diriyah heritage tours and desert safaris to cultural experiences and modern attractions, find the perfect way to explore Riyadh.',
      keywords: 'Riyadh tours, Riyadh activities, Diriyah tours, Riyadh desert safari, Saudi Arabia tours, things to do in Riyadh, Riyadh excursions, Riyadh cultural tours',
      primaryKeyword: 'Riyadh tours',
      secondaryKeywords: [
        'Diriyah tours',
        'Riyadh desert safari',
        'Riyadh cultural tours',
        'Riyadh historical tours',
        'Riyadh food tours',
        'Saudi Arabia tours'
      ]
    },
    whyVisit: [
      'Diriyah - UNESCO World Heritage Site with ancient Najdi architecture and the birthplace of Saudi Arabia',
      'Modern architecture including the Kingdom Centre Tower and King Abdullah Financial District',
      'Rich Saudi culture and heritage showcased in museums and cultural centers',
      'Authentic traditional souks and markets offering genuine Saudi experiences',
      'Dramatic desert landscapes perfect for safaris and outdoor adventures',
      'World-class dining scene blending traditional Saudi cuisine with international flavors'
    ],
    bestTimeToVisit: {
      weather: 'Riyadh has a hot desert climate with extremely hot summers (May-September) averaging 100-110°F (38-43°C) and mild winters (November-March) with temperatures of 60-75°F (15-24°C).',
      bestMonths: 'November to March offers the most comfortable weather for outdoor activities, sightseeing, and desert adventures.',
      peakSeason: 'December to February is peak tourist season with pleasant weather, but higher prices and more crowds at popular attractions.',
      offSeason: 'May to September is the off-season with extremely hot temperatures, but lower prices and fewer crowds, ideal for indoor attractions and early morning activities.'
    },
    gettingAround: 'Riyadh has a modern metro system, extensive taxi and ride-sharing services, and a growing public bus network. Many tours include hotel pickup. Renting a car is also an option for exploring independently.',
    highlights: [
      'Diriyah - UNESCO World Heritage Site with ancient mud-brick palaces and the birthplace of the Saudi state',
      'Kingdom Centre Tower - Iconic 99-story skyscraper with Sky Bridge and panoramic city views',
      'National Museum of Saudi Arabia - Comprehensive museum showcasing Saudi history and culture',
      'Masmak Fortress - Historic mud-brick fort symbolizing the unification of Saudi Arabia',
      'King Fahd Cultural Center - Modern cultural hub with exhibitions and performances',
      'Riyadh Season - Annual entertainment and cultural festival showcasing Saudi Arabia\'s transformation'
    ]
  },
  {
    id: 'tel-aviv',
    name: 'Tel Aviv',
    fullName: 'Tel Aviv, Israel',
    category: 'Middle East',
    country: 'Israel',
    briefDescription: 'A vibrant Mediterranean city known for its beautiful beaches, world-class cuisine, thriving arts scene, and legendary nightlife — Tel Aviv is the cultural and culinary heart of Israel.',
    relatedGuides: [],
    heroDescription: 'Welcome to Tel Aviv, the vibrant Mediterranean metropolis where ancient Jaffa meets modern innovation, creating a dynamic destination that pulses with energy day and night. From the historic port of Jaffa to the modern Bauhaus architecture of the White City, from world-renowned restaurants to legendary nightlife, Tel Aviv offers an extraordinary blend of culture, cuisine, and coastal beauty. Whether you\'re exploring art galleries and museums, indulging in the incredible food scene, relaxing on pristine beaches, or experiencing the city\'s famous nightlife, this captivating destination promises unforgettable experiences. Let our AI-powered planner help you discover the best this cosmopolitan city has to offer.',
    imageUrl: 'https://ouqeoizufbofdqbuiwvx.supabase.co/storage/v1/object/public/destinations/tel%20aviv.png',
    tourCategories: [
      { name: 'Cultural Tours', hasGuide: true },
      { name: 'Food Tours', hasGuide: true },
      { name: 'City Tours', hasGuide: true },
      { name: 'Historical Tours', hasGuide: true },
      { name: 'Beach Tours', hasGuide: true },
      { name: 'Nightlife Tours', hasGuide: true }
    ],
    seo: {
      title: 'Tel Aviv Tours & Activities - Top-Rated Experiences & Adventures',
      description: 'Discover top-rated Tel Aviv tours, excursions, and activities powered by AI. From food tours and cultural experiences to beach activities and nightlife, find the perfect way to explore Tel Aviv.',
      keywords: 'Tel Aviv tours, Tel Aviv activities, Tel Aviv food tours, Jaffa tours, things to do in Tel Aviv, Tel Aviv excursions, Tel Aviv nightlife, Israel tours',
      primaryKeyword: 'Tel Aviv tours',
      secondaryKeywords: [
        'Tel Aviv food tours',
        'Jaffa tours',
        'Tel Aviv cultural tours',
        'Tel Aviv beach tours',
        'Tel Aviv nightlife tours',
        'Israel tours'
      ]
    },
    whyVisit: [
      'World-renowned food scene with incredible restaurants, markets, and street food',
      'Beautiful Mediterranean beaches perfect for swimming, sunbathing, and water sports',
      'Historic Jaffa with its ancient port, narrow alleys, and rich history',
      'Vibrant arts and culture scene with galleries, museums, and street art',
      'Legendary nightlife with world-class bars, clubs, and entertainment',
      'Bauhaus architecture in the White City, a UNESCO World Heritage Site'
    ],
    bestTimeToVisit: {
      weather: 'Tel Aviv has a Mediterranean climate with hot, dry summers (June-September) averaging 80-90°F (27-32°C) and mild, rainy winters (December-February) with temperatures of 55-65°F (13-18°C).',
      bestMonths: 'April to June and September to November offer the most pleasant weather with warm temperatures and minimal rain, perfect for beach activities and sightseeing.',
      peakSeason: 'June to August is peak tourist season with hot weather and crowded beaches, leading to higher prices and larger crowds.',
      offSeason: 'December to February is the off-season with cooler temperatures and occasional rain, but lower prices and fewer crowds, ideal for cultural activities and indoor attractions.'
    },
    gettingAround: 'Tel Aviv has an excellent public transportation system including buses and a light rail. Taxis and ride-sharing services are widely available. The city is also very walkable, and bike-sharing is popular along the beachfront.',
    highlights: [
      'Jaffa - Ancient port city with historic alleys, art galleries, and stunning views of Tel Aviv',
      'Tel Aviv Beaches - Beautiful Mediterranean coastline with golden sand and clear blue water',
      'White City - UNESCO World Heritage Site featuring the world\'s largest collection of Bauhaus architecture',
      'Carmel Market - Vibrant open-air market with fresh produce, street food, and local culture',
      'Rothschild Boulevard - Iconic tree-lined boulevard with Bauhaus buildings and trendy cafes',
      'Tel Aviv Museum of Art - World-class museum featuring Israeli and international contemporary art'
    ]
  },
  {
    id: 'amman',
    name: 'Amman',
    fullName: 'Amman, Jordan',
    category: 'Middle East',
    country: 'Jordan',
    briefDescription: 'The ancient capital of Jordan where Roman ruins meet modern culture, offering a perfect gateway to Petra, the Dead Sea, and Jordan\'s rich historical heritage.',
    relatedGuides: [],
    heroDescription: 'Welcome to Amman, the captivating capital of Jordan where ancient history meets modern Middle Eastern culture, creating a fascinating destination that serves as the perfect gateway to Jordan\'s wonders. From the historic Citadel with its Roman ruins to the bustling downtown souks, from world-class museums to authentic Jordanian cuisine, Amman offers an extraordinary blend of heritage, culture, and warm hospitality. Whether you\'re exploring ancient archaeological sites, experiencing traditional Jordanian life, discovering the city\'s vibrant arts scene, or using Amman as a base for day trips to Petra and the Dead Sea, this welcoming city promises unforgettable experiences. Let our AI-powered planner help you discover the best this historic capital has to offer.',
    imageUrl: 'https://ouqeoizufbofdqbuiwvx.supabase.co/storage/v1/object/public/destinations/amman.png',
    tourCategories: [
      { name: 'Cultural Tours', hasGuide: true },
      { name: 'Historical Tours', hasGuide: true },
      { name: 'Food Tours', hasGuide: true },
      { name: 'City Tours', hasGuide: true },
      { name: 'Desert Safaris', hasGuide: true },
      { name: 'Day Trips', hasGuide: true }
    ],
    seo: {
      title: 'Amman Tours & Activities - Top-Rated Experiences & Adventures',
      description: 'Discover top-rated Amman tours, excursions, and activities powered by AI. From Citadel tours and historical sites to day trips to Petra and the Dead Sea, find the perfect way to explore Amman.',
      keywords: 'Amman tours, Amman activities, Amman Citadel tour, Petra day trip from Amman, Dead Sea tour, things to do in Amman, Jordan tours, Amman historical tours',
      primaryKeyword: 'Amman tours',
      secondaryKeywords: [
        'Amman Citadel tour',
        'Petra day trip from Amman',
        'Dead Sea tour from Amman',
        'Amman historical tours',
        'Amman food tours',
        'Jordan tours'
      ]
    },
    whyVisit: [
      'Amman Citadel - Ancient hilltop site with Roman ruins, Byzantine churches, and stunning city views',
      'Perfect gateway to Petra, the Dead Sea, and Wadi Rum - Jordan\'s most famous attractions',
      'Rich Jordanian culture and warm hospitality in traditional souks and neighborhoods',
      'World-class museums showcasing Jordanian history and archaeology',
      'Authentic Jordanian cuisine from street food to fine dining',
      'Vibrant arts and culture scene with galleries, theaters, and cultural centers'
    ],
    bestTimeToVisit: {
      weather: 'Amman has a Mediterranean climate with hot, dry summers (June-September) averaging 80-90°F (27-32°C) and cool, rainy winters (December-February) with temperatures of 45-55°F (7-13°C).',
      bestMonths: 'March to May and September to November offer the most pleasant weather with mild temperatures and minimal rain, perfect for sightseeing and outdoor activities.',
      peakSeason: 'April to May and September to October is peak tourist season with ideal weather, but higher prices and more crowds at popular attractions.',
      offSeason: 'December to February is the off-season with cooler temperatures and occasional rain, but lower prices and fewer crowds, ideal for indoor attractions and cultural activities.'
    },
    gettingAround: 'Amman has a reliable public bus system, taxis, and ride-sharing services. Many tours include hotel pickup. Renting a car is also an option for exploring independently or taking day trips.',
    highlights: [
      'Amman Citadel - Ancient hilltop archaeological site with Roman Temple of Hercules and Umayyad Palace',
      'Roman Theater - Well-preserved 2nd-century Roman amphitheater in the heart of downtown Amman',
      'Jordan Museum - World-class museum showcasing Jordanian history, archaeology, and the Dead Sea Scrolls',
      'Downtown Amman - Bustling traditional souks, markets, and authentic Jordanian street food',
      'King Abdullah I Mosque - Beautiful modern mosque with stunning blue dome and Islamic architecture',
      'Rainbow Street - Trendy neighborhood with cafes, galleries, and vibrant local culture'
    ]
  },
  {
    id: 'beirut',
    name: 'Beirut',
    fullName: 'Beirut, Lebanon',
    category: 'Middle East',
    country: 'Lebanon',
    briefDescription: 'The vibrant capital of Lebanon where ancient history meets modern culture, offering world-class cuisine, legendary nightlife, and a rich blend of Middle Eastern and Mediterranean influences.',
    relatedGuides: [],
    heroDescription: 'Welcome to Beirut, the dynamic capital of Lebanon where ancient Phoenician history meets contemporary Middle Eastern culture, creating a fascinating destination that pulses with energy and resilience. From the historic downtown with its Roman ruins to the vibrant neighborhoods of Gemmayze and Mar Mikhael, from world-renowned restaurants to legendary nightlife, Beirut offers an extraordinary blend of heritage, cuisine, and cosmopolitan charm. Whether you\'re exploring archaeological sites, indulging in incredible Lebanese cuisine, experiencing the city\'s famous nightlife, or discovering its rich cultural scene, this captivating city promises unforgettable experiences. Let our AI-powered planner help you discover the best this remarkable Mediterranean capital has to offer.',
    imageUrl: 'https://ouqeoizufbofdqbuiwvx.supabase.co/storage/v1/object/public/destinations/Beirut.png',
    tourCategories: [
      { name: 'Cultural Tours', hasGuide: true },
      { name: 'Food Tours', hasGuide: true },
      { name: 'City Tours', hasGuide: true },
      { name: 'Historical Tours', hasGuide: true },
      { name: 'Nightlife Tours', hasGuide: true },
      { name: 'Day Trips', hasGuide: true }
    ],
    seo: {
      title: 'Beirut Tours & Activities - Top-Rated Experiences & Adventures',
      description: 'Discover top-rated Beirut tours, excursions, and activities powered by AI. From food tours and cultural experiences to day trips to Byblos and Baalbek, find the perfect way to explore Beirut.',
      keywords: 'Beirut tours, Beirut activities, Beirut food tours, Byblos day trip, Baalbek tour, things to do in Beirut, Lebanon tours, Beirut nightlife tours',
      primaryKeyword: 'Beirut tours',
      secondaryKeywords: [
        'Beirut food tours',
        'Byblos day trip from Beirut',
        'Baalbek tour from Beirut',
        'Beirut cultural tours',
        'Beirut nightlife tours',
        'Lebanon tours'
      ]
    },
    whyVisit: [
      'World-renowned Lebanese cuisine with incredible restaurants, street food, and culinary traditions',
      'Legendary nightlife scene with world-class bars, clubs, and entertainment venues',
      'Rich history and culture with Roman ruins, museums, and historic neighborhoods',
      'Vibrant arts and culture scene with galleries, theaters, and cultural centers',
      'Beautiful Mediterranean coastline with beaches and waterfront promenades',
      'Perfect gateway to Lebanon\'s wonders including Byblos, Baalbek, and the Cedars'
    ],
    bestTimeToVisit: {
      weather: 'Beirut has a Mediterranean climate with hot, dry summers (June-September) averaging 80-90°F (27-32°C) and mild, rainy winters (December-February) with temperatures of 55-65°F (13-18°C).',
      bestMonths: 'April to June and September to November offer the most pleasant weather with warm temperatures and minimal rain, perfect for sightseeing and outdoor activities.',
      peakSeason: 'June to August is peak tourist season with hot weather and crowded beaches, leading to higher prices and larger crowds.',
      offSeason: 'December to February is the off-season with cooler temperatures and occasional rain, but lower prices and fewer crowds, ideal for cultural activities and indoor attractions.'
    },
    gettingAround: 'Beirut has a reliable public bus system, taxis, and ride-sharing services. Many tours include hotel pickup. The city is also very walkable, especially in downtown and popular neighborhoods.',
    highlights: [
      'Downtown Beirut - Historic city center with Roman ruins, restored buildings, and vibrant atmosphere',
      'National Museum of Beirut - World-class museum showcasing Lebanese history and archaeology',
      'Pigeon Rocks (Raouche) - Iconic natural rock formations in the Mediterranean Sea',
      'Gemmayze & Mar Mikhael - Trendy neighborhoods with cafes, galleries, and vibrant nightlife',
      'Beirut Souks - Modern shopping district with traditional souk atmosphere',
      'Corniche Beirut - Beautiful waterfront promenade perfect for walking and sunset views'
    ]
  }
];

export const getDestinationById = (id) => {
  return destinations.find(dest => dest.id === id);
};

export const getAllDestinations = () => {
  return destinations;
};

export const getRelatedDestinations = (currentDestinationId) => {
  const currentDestination = getDestinationById(currentDestinationId);
  if (!currentDestination) return [];
  
  // Get ALL destinations from the same category, excluding the current one
  const related = destinations.filter(dest => 
    dest.category === currentDestination.category && 
    dest.id !== currentDestinationId
  );
  
  // Sort alphabetically by name
  return related.sort((a, b) => a.name.localeCompare(b.name));
};

export const getDestinationsByIds = (ids) => {
  if (!Array.isArray(ids)) return [];
  return ids.map(id => getDestinationById(id)).filter(dest => dest !== undefined);
};

export const getDestinationsByCountry = (country, excludeId = null) => {
  if (!country) return [];
  return destinations.filter(dest => 
    dest.country === country && 
    (excludeId ? dest.id !== excludeId : true)
  );
};

export const getDestinationsByCategory = (category) => {
  if (!category) return [];
  
  // Get ALL destinations from the specified category
  const related = destinations.filter(dest => 
    dest.category === category
  );
  
  // Sort alphabetically by name
  return related.sort((a, b) => a.name.localeCompare(b.name));
}; 