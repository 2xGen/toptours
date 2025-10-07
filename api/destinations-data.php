<?php
function getDestinationData($destination_id) {
    $destinations = [
        'aruba' => [
            'title' => 'Aruba Tours & Excursions - Top-Rated Activities & Adventures',
            'description' => 'Discover top-rated Aruba tours, excursions, and activities powered by AI. From snorkeling and catamaran cruises to off-road adventures, find the perfect way to explore Aruba.',
            'keywords' => 'Aruba tours, Aruba excursions, Aruba activities, Aruba sunset cruise, Aruba ATV tour, Aruba snorkeling tour, things to do in Aruba',
            'image' => 'https://ouqeoizufbofdqbuiwvx.supabase.co/storage/v1/object/public/destinations//aruba.webp'
        ],
        'curacao' => [
            'title' => 'Curaçao Tours & Excursions - Top-Rated Activities & Adventures',
            'description' => 'Discover top-rated Curaçao tours, excursions, and activities powered by AI. From diving and snorkeling to cultural tours, find the perfect way to explore Curaçao.',
            'keywords' => 'Curaçao tours, Curaçao diving, Curaçao snorkeling, Willemstad tours, Curaçao excursions, things to do in Curaçao',
            'image' => 'https://ouqeoizufbofdqbuiwvx.supabase.co/storage/v1/object/public/destinations//curacao.jpg'
        ],
        'st-lucia' => [
            'title' => 'St. Lucia Tours & Excursions - Top-Rated Activities & Adventures',
            'description' => 'Discover top-rated St. Lucia tours, excursions, and activities powered by AI. From hiking the Pitons to rainforest adventures, find the perfect way to explore St. Lucia.',
            'keywords' => 'St. Lucia tours, St. Lucia hiking, Pitons tours, St. Lucia rainforest, St. Lucia excursions, things to do in St. Lucia',
            'image' => 'https://ouqeoizufbofdqbuiwvx.supabase.co/storage/v1/object/public/destinations//st%20lucia.webp'
        ],
        'barbados' => [
            'title' => 'Barbados Tours & Excursions - Top-Rated Activities & Adventures',
            'description' => 'Discover top-rated Barbados tours, excursions, and activities powered by AI. From surfing and cultural tours to rum tastings, find the perfect way to explore Barbados.',
            'keywords' => 'Barbados tours, Barbados surfing, Barbados rum tours, Barbados excursions, things to do in Barbados',
            'image' => 'https://ouqeoizufbofdqbuiwvx.supabase.co/storage/v1/object/public/destinations//Barbados.jpg'
        ],
        'jamaica' => [
            'title' => 'Jamaica Tours & Excursions - Top-Rated Activities & Adventures',
            'description' => 'Discover top-rated Jamaica tours, excursions, and activities powered by AI. From waterfall adventures to reggae music tours, find the perfect way to explore Jamaica.',
            'keywords' => 'Jamaica tours, Jamaica waterfalls, Jamaica reggae tours, Jamaica excursions, things to do in Jamaica',
            'image' => 'https://ouqeoizufbofdqbuiwvx.supabase.co/storage/v1/object/public/destinations//jamaica.webp'
        ],
        'punta-cana' => [
            'title' => 'Punta Cana Tours & Excursions - Top-Rated Activities & Adventures',
            'description' => 'Discover top-rated Punta Cana tours, excursions, and activities powered by AI. From beach tours to water sports, find the perfect way to explore Punta Cana.',
            'keywords' => 'Punta Cana tours, Punta Cana beach tours, Punta Cana water sports, Punta Cana excursions, things to do in Punta Cana',
            'image' => 'https://ouqeoizufbofdqbuiwvx.supabase.co/storage/v1/object/public/destinations//punta%20cana.webp'
        ],
        'santo-domingo' => [
            'title' => 'Santo Domingo Tours & Excursions - Top-Rated Activities & Adventures',
            'description' => 'Discover top-rated Santo Domingo tours, excursions, and activities powered by AI. From historical tours to cultural experiences, find the perfect way to explore Santo Domingo.',
            'keywords' => 'Santo Domingo tours, Santo Domingo historical tours, Santo Domingo cultural tours, Santo Domingo excursions, things to do in Santo Domingo',
            'image' => 'https://ouqeoizufbofdqbuiwvx.supabase.co/storage/v1/object/public/destinations//santo%20domingo.webp'
        ],
        'nassau' => [
            'title' => 'Nassau Tours & Excursions - Top-Rated Activities & Adventures',
            'description' => 'Discover top-rated Nassau tours, excursions, and activities powered by AI. From historical tours to water sports, find the perfect way to explore Nassau.',
            'keywords' => 'Nassau tours, Nassau Bahamas tours, Nassau excursions, things to do in Nassau',
            'image' => 'https://ouqeoizufbofdqbuiwvx.supabase.co/storage/v1/object/public/destinations//nassau%20bahama.jpg'
        ],
        'exuma' => [
            'title' => 'Exuma Tours & Excursions - Top-Rated Activities & Adventures',
            'description' => 'Discover top-rated Exuma tours, excursions, and activities powered by AI. From swimming pigs to snorkeling, find the perfect way to explore Exuma.',
            'keywords' => 'Exuma tours, Exuma Bahamas tours, swimming pigs Exuma, Exuma excursions, things to do in Exuma',
            'image' => 'https://ouqeoizufbofdqbuiwvx.supabase.co/storage/v1/object/public/destinations//exuma.jpg'
        ],
        'puerto-rico' => [
            'title' => 'Puerto Rico Tours & Excursions - Top-Rated Activities & Adventures',
            'description' => 'Discover top-rated Puerto Rico tours, excursions, and activities powered by AI. From historical tours to rainforest adventures, find the perfect way to explore Puerto Rico.',
            'keywords' => 'Puerto Rico tours, Puerto Rico excursions, Old San Juan tours, El Yunque tours, things to do in Puerto Rico',
            'image' => 'https://ouqeoizufbofdqbuiwvx.supabase.co/storage/v1/object/public/destinations//puerto%20rico.jpg'
        ],
        'turks-and-caicos' => [
            'title' => 'Turks and Caicos Tours & Excursions - Top-Rated Activities & Adventures',
            'description' => 'Discover top-rated Turks and Caicos tours, excursions, and activities powered by AI. From diving to beach tours, find the perfect way to explore Turks and Caicos.',
            'keywords' => 'Turks and Caicos tours, Turks and Caicos diving, Turks and Caicos excursions, things to do in Turks and Caicos',
            'image' => 'https://ouqeoizufbofdqbuiwvx.supabase.co/storage/v1/object/public/destinations//turks%20and%20caicos.webp'
        ],
        'grenada' => [
            'title' => 'Grenada Tours & Excursions - Top-Rated Activities & Adventures',
            'description' => 'Discover top-rated Grenada tours, excursions, and activities powered by AI. From spice tours to diving, find the perfect way to explore Grenada.',
            'keywords' => 'Grenada tours, Grenada spice tours, Grenada excursions, things to do in Grenada',
            'image' => 'https://ouqeoizufbofdqbuiwvx.supabase.co/storage/v1/object/public/destinations//grenada.jpg'
        ],
        'st-martin' => [
            'title' => 'St. Martin Tours & Excursions - Top-Rated Activities & Adventures',
            'description' => 'Discover top-rated St. Martin tours, excursions, and activities powered by AI. From beach tours to culinary experiences, find the perfect way to explore St. Martin.',
            'keywords' => 'St. Martin tours, Sint Maarten tours, St. Martin excursions, things to do in St. Martin',
            'image' => 'https://ouqeoizufbofdqbuiwvx.supabase.co/storage/v1/object/public/destinations//St%20martin.jpg'
        ],
        'bonaire' => [
            'title' => 'Bonaire Tours & Excursions - Top-Rated Activities & Adventures',
            'description' => 'Discover top-rated Bonaire tours, excursions, and activities powered by AI. From diving to marine park exploration, find the perfect way to explore Bonaire.',
            'keywords' => 'Bonaire tours, Bonaire diving, Bonaire excursions, things to do in Bonaire',
            'image' => 'https://ouqeoizufbofdqbuiwvx.supabase.co/storage/v1/object/public/destinations//Bonaire.jpg'
        ],
        'cayman-islands' => [
            'title' => 'Cayman Islands Tours & Excursions - Top-Rated Activities & Adventures',
            'description' => 'Discover top-rated Cayman Islands tours, excursions, and activities powered by AI. From diving to luxury experiences, find the perfect way to explore the Cayman Islands.',
            'keywords' => 'Cayman Islands tours, Cayman Islands diving, Stingray City tours, things to do in Cayman Islands',
            'image' => 'https://ouqeoizufbofdqbuiwvx.supabase.co/storage/v1/object/public/destinations//cayman%20islands.jpg'
        ],
        'antigua-and-barbuda' => [
            'title' => 'Antigua and Barbuda Tours & Excursions - Top-Rated Activities & Adventures',
            'description' => 'Discover top-rated Antigua and Barbuda tours, excursions, and activities powered by AI. From beach tours to sailing adventures, find the perfect way to explore Antigua and Barbuda.',
            'keywords' => 'Antigua and Barbuda tours, Antigua tours, Barbuda tours, sailing tours, things to do in Antigua and Barbuda',
            'image' => 'https://ouqeoizufbofdqbuiwvx.supabase.co/storage/v1/object/public/destinations//Antigua%20and%20Barbuda.jpg'
        ],
        'trinidad-and-tobago' => [
            'title' => 'Trinidad and Tobago Tours & Excursions - Top-Rated Activities & Adventures',
            'description' => 'Discover top-rated Trinidad and Tobago tours, excursions, and activities powered by AI. From Carnival to nature tours, find the perfect way to explore Trinidad and Tobago.',
            'keywords' => 'Trinidad and Tobago tours, Carnival tours, Trinidad tours, Tobago tours, things to do in Trinidad and Tobago',
            'image' => 'https://ouqeoizufbofdqbuiwvx.supabase.co/storage/v1/object/public/destinations//Trinidad%20and%20Tobago.jpeg'
        ],
        'british-virgin-islands' => [
            'title' => 'British Virgin Islands Tours & Excursions - Top-Rated Activities & Adventures',
            'description' => 'Discover top-rated British Virgin Islands tours, excursions, and activities powered by AI. From sailing to island hopping, find the perfect way to explore the British Virgin Islands.',
            'keywords' => 'British Virgin Islands tours, BVI tours, sailing tours, island hopping, things to do in British Virgin Islands',
            'image' => 'https://ouqeoizufbofdqbuiwvx.supabase.co/storage/v1/object/public/destinations//British%20Virgin%20Islands.jpg'
        ],
        'st-kitts-and-nevis' => [
            'title' => 'St. Kitts and Nevis Tours & Excursions - Top-Rated Activities & Adventures',
            'description' => 'Discover top-rated St. Kitts and Nevis tours, excursions, and activities powered by AI. From historical tours to hiking adventures, find the perfect way to explore St. Kitts and Nevis.',
            'keywords' => 'St. Kitts and Nevis tours, St. Kitts tours, Nevis tours, things to do in St. Kitts and Nevis',
            'image' => 'https://ouqeoizufbofdqbuiwvx.supabase.co/storage/v1/object/public/destinations//St.%20Kitts%20and%20Nevis.jpeg'
        ],
        'martinique' => [
            'title' => 'Martinique Tours & Excursions - Top-Rated Activities & Adventures',
            'description' => 'Discover top-rated Martinique tours, excursions, and activities powered by AI. From rum tours to volcano adventures, find the perfect way to explore Martinique.',
            'keywords' => 'Martinique tours, Martinique rum tours, Mount Pelée tours, things to do in Martinique',
            'image' => 'https://ouqeoizufbofdqbuiwvx.supabase.co/storage/v1/object/public/destinations//Martinique.jpg'
        ],
        'guadeloupe' => [
            'title' => 'Guadeloupe Tours & Excursions - Top-Rated Activities & Adventures',
            'description' => 'Discover top-rated Guadeloupe tours, excursions, and activities powered by AI. From volcano tours to beach adventures, find the perfect way to explore Guadeloupe.',
            'keywords' => 'Guadeloupe tours, Soufrière volcano tours, Guadeloupe excursions, things to do in Guadeloupe',
            'image' => 'https://ouqeoizufbofdqbuiwvx.supabase.co/storage/v1/object/public/destinations//Guadeloupe.jpg'
        ],
        'paris' => [
            'title' => 'Paris Tours & Excursions - Top-Rated Activities & Adventures',
            'description' => 'Discover top-rated Paris tours, excursions, and activities powered by AI. From cultural tours to food experiences, find the perfect way to explore the City of Light.',
            'keywords' => 'Paris tours, Paris excursions, Paris activities, Eiffel Tower tours, Louvre tours, things to do in Paris',
            'image' => 'https://ouqeoizufbofdqbuiwvx.supabase.co/storage/v1/object/public/destinations//paris.jpg'
        ],
        'nice' => [
            'title' => 'Nice Tours & Excursions - Top-Rated Activities & Adventures',
            'description' => 'Discover top-rated Nice tours, excursions, and activities powered by AI. From beach tours to cultural experiences, find the perfect way to explore the French Riviera.',
            'keywords' => 'Nice tours, Nice excursions, French Riviera tours, Promenade des Anglais, things to do in Nice',
            'image' => 'https://ouqeoizufbofdqbuiwvx.supabase.co/storage/v1/object/public/destinations//Nice.webp'
        ],
        'french-riviera' => [
            'title' => 'French Riviera Tours & Excursions - Top-Rated Activities & Adventures',
            'description' => 'Discover top-rated French Riviera tours, excursions, and activities powered by AI. From luxury experiences to cultural tours, find the perfect way to explore the Côte d\'Azur.',
            'keywords' => 'French Riviera tours, Côte d\'Azur tours, Monaco tours, Saint-Tropez tours, things to do in French Riviera',
            'image' => 'https://ouqeoizufbofdqbuiwvx.supabase.co/storage/v1/object/public/destinations//french%20riviera.avif'
        ],
        'rome' => [
            'title' => 'Rome Tours & Excursions - Top-Rated Activities & Adventures',
            'description' => 'Discover top-rated Rome tours, excursions, and activities powered by AI. From Colosseum tours to Vatican experiences, find the perfect way to explore the Eternal City.',
            'keywords' => 'Rome tours, Rome excursions, Colosseum tours, Vatican tours, things to do in Rome',
            'image' => 'https://ouqeoizufbofdqbuiwvx.supabase.co/storage/v1/object/public/destinations//rome.jpg'
        ],
        'venice' => [
            'title' => 'Venice Tours & Excursions - Top-Rated Activities & Adventures',
            'description' => 'Discover top-rated Venice tours, excursions, and activities powered by AI. From gondola tours to St. Mark\'s experiences, find the perfect way to explore the Floating City.',
            'keywords' => 'Venice tours, Venice excursions, gondola tours, St. Mark\'s tours, things to do in Venice',
            'image' => 'https://ouqeoizufbofdqbuiwvx.supabase.co/storage/v1/object/public/destinations//Venice.webp'
        ],
        'florence' => [
            'title' => 'Florence Tours & Excursions - Top-Rated Activities & Adventures',
            'description' => 'Discover top-rated Florence tours, excursions, and activities powered by AI. From Uffizi tours to Tuscan wine experiences, find the perfect way to explore the Cradle of the Renaissance.',
            'keywords' => 'Florence tours, Florence excursions, Uffizi tours, Duomo tours, things to do in Florence',
            'image' => 'https://ouqeoizufbofdqbuiwvx.supabase.co/storage/v1/object/public/destinations//Florence.jpeg'
        ],
        'amalfi-coast' => [
            'title' => 'Amalfi Coast Tours & Excursions - Top-Rated Activities & Adventures',
            'description' => 'Discover top-rated Amalfi Coast tours, excursions, and activities powered by AI. From coastal boat tours to Positano experiences, find the perfect way to explore Italy\'s most beautiful coastline.',
            'keywords' => 'Amalfi Coast tours, Positano tours, Capri tours, coastal tours, things to do in Amalfi Coast',
            'image' => 'https://ouqeoizufbofdqbuiwvx.supabase.co/storage/v1/object/public/destinations//Amalfi%20Coast.webp'
        ],
        'barcelona' => [
            'title' => 'Barcelona Tours & Excursions - Top-Rated Activities & Adventures',
            'description' => 'Discover top-rated Barcelona tours, excursions, and activities powered by AI. From Gaudi tours to food experiences, find the perfect way to explore Catalonia\'s vibrant capital.',
            'keywords' => 'Barcelona tours, Barcelona excursions, Gaudi tours, Sagrada Familia tours, things to do in Barcelona',
            'image' => 'https://ouqeoizufbofdqbuiwvx.supabase.co/storage/v1/object/public/destinations//Barcelona.jpg'
        ],
        'madrid' => [
            'title' => 'Madrid Tours & Excursions - Top-Rated Activities & Adventures',
            'description' => 'Discover top-rated Madrid tours, excursions, and activities powered by AI. From Prado tours to royal palace experiences, find the perfect way to explore Spain\'s dynamic capital.',
            'keywords' => 'Madrid tours, Madrid excursions, Prado tours, Royal Palace tours, things to do in Madrid',
            'image' => 'https://ouqeoizufbofdqbuiwvx.supabase.co/storage/v1/object/public/destinations//Madrid.webp'
        ],
        'seville' => [
            'title' => 'Seville Tours & Excursions - Top-Rated Activities & Adventures',
            'description' => 'Discover top-rated Seville tours, excursions, and activities powered by AI. From Alcázar tours to flamenco experiences, find the perfect way to explore Andalusia\'s cultural heart.',
            'keywords' => 'Seville tours, Seville excursions, Alcázar tours, flamenco tours, things to do in Seville',
            'image' => 'https://ouqeoizufbofdqbuiwvx.supabase.co/storage/v1/object/public/destinations//Seville.jpeg'
        ],
        'mallorca' => [
            'title' => 'Mallorca Tours & Excursions - Top-Rated Activities & Adventures',
            'description' => 'Discover top-rated Mallorca tours, excursions, and activities powered by AI. From Palma tours to coastal experiences, find the perfect way to explore Spain\'s largest island.',
            'keywords' => 'Mallorca tours, Mallorca excursions, Palma tours, beach tours, things to do in Mallorca',
            'image' => 'https://ouqeoizufbofdqbuiwvx.supabase.co/storage/v1/object/public/destinations//Mallorca.jpeg'
        ],
        'ibiza' => [
            'title' => 'Ibiza Tours & Excursions - Top-Rated Activities & Adventures',
            'description' => 'Discover top-rated Ibiza tours, excursions, and activities powered by AI. From Dalt Vila tours to beach experiences, find the perfect way to explore the Mediterranean\'s most famous island.',
            'keywords' => 'Ibiza tours, Ibiza excursions, Dalt Vila tours, beach tours, things to do in Ibiza',
            'image' => 'https://ouqeoizufbofdqbuiwvx.supabase.co/storage/v1/object/public/destinations//Ibiza.jpg'
        ],
        'athens' => [
            'title' => 'Athens Tours & Excursions - Top-Rated Activities & Adventures',
            'description' => 'Discover top-rated Athens tours, excursions, and activities powered by AI. From Acropolis tours to ancient Greece experiences, find the perfect way to explore the cradle of Western civilization.',
            'keywords' => 'Athens tours, Athens excursions, Acropolis tours, ancient Greece tours, things to do in Athens',
            'image' => 'https://ouqeoizufbofdqbuiwvx.supabase.co/storage/v1/object/public/destinations//Athens.jpg'
        ],
        'santorini' => [
            'title' => 'Santorini Tours & Excursions - Top-Rated Activities & Adventures',
            'description' => 'Discover top-rated Santorini tours, excursions, and activities powered by AI. From caldera tours to sunset experiences, find the perfect way to explore Greece\'s most romantic island.',
            'keywords' => 'Santorini tours, Santorini excursions, caldera tours, sunset tours, things to do in Santorini',
            'image' => 'https://ouqeoizufbofdqbuiwvx.supabase.co/storage/v1/object/public/destinations//Santorini.avif'
        ],
        'mykonos' => [
            'title' => 'Mykonos Tours & Excursions - Top-Rated Activities & Adventures',
            'description' => 'Discover top-rated Mykonos tours, excursions, and activities powered by AI. From windmill tours to beach experiences, find the perfect way to explore Greece\'s most glamorous island.',
            'keywords' => 'Mykonos tours, Mykonos excursions, windmill tours, beach tours, things to do in Mykonos',
            'image' => 'https://ouqeoizufbofdqbuiwvx.supabase.co/storage/v1/object/public/destinations//Mykonos.avif'
        ],
        'crete' => [
            'title' => 'Crete Tours & Excursions - Top-Rated Activities & Adventures',
            'description' => 'Discover top-rated Crete tours, excursions, and activities powered by AI. From Knossos tours to gorge experiences, find the perfect way to explore Greece\'s largest island.',
            'keywords' => 'Crete tours, Crete excursions, Knossos tours, Samaria Gorge tours, things to do in Crete',
            'image' => 'https://ouqeoizufbofdqbuiwvx.supabase.co/storage/v1/object/public/destinations//Crete.jpeg'
        ],
        'lisbon' => [
            'title' => 'Lisbon Tours & Excursions - Top-Rated Activities & Adventures',
            'description' => 'Discover top-rated Lisbon tours, excursions, and activities powered by AI. From Belém tours to Fado experiences, find the perfect way to explore Portugal\'s vibrant capital.',
            'keywords' => 'Lisbon tours, Lisbon excursions, Belém tours, Alfama tours, things to do in Lisbon',
            'image' => 'https://ouqeoizufbofdqbuiwvx.supabase.co/storage/v1/object/public/destinations//Lisbon.jpeg'
        ],
        'porto' => [
            'title' => 'Porto Tours & Excursions - Top-Rated Activities & Adventures',
            'description' => 'Discover top-rated Porto tours, excursions, and activities powered by AI. From port wine tours to Douro River experiences, find the perfect way to explore Portugal\'s northern gem.',
            'keywords' => 'Porto tours, Porto excursions, port wine tours, Ribeira tours, things to do in Porto',
            'image' => 'https://ouqeoizufbofdqbuiwvx.supabase.co/storage/v1/object/public/destinations//Porto.jpeg'
        ],
        'madeira' => [
            'title' => 'Madeira Tours & Excursions - Top-Rated Activities & Adventures',
            'description' => 'Discover top-rated Madeira tours, excursions, and activities powered by AI. From levada walks to Funchal experiences, find the perfect way to explore Portugal\'s floating garden.',
            'keywords' => 'Madeira tours, Madeira excursions, levada walks, Funchal tours, things to do in Madeira',
            'image' => 'https://ouqeoizufbofdqbuiwvx.supabase.co/storage/v1/object/public/destinations//Madeira.jpg'
        ],
        'london' => [
            'title' => 'London Tours & Excursions - Top-Rated Activities & Adventures',
            'description' => 'Discover top-rated London tours, excursions, and activities powered by AI. From royal palace tours to museum experiences, find the perfect way to explore the world\'s most dynamic city.',
            'keywords' => 'London tours, London excursions, Buckingham Palace tours, Tower of London tours, things to do in London',
            'image' => 'https://ouqeoizufbofdqbuiwvx.supabase.co/storage/v1/object/public/destinations//London.jpeg'
        ],
        'edinburgh' => [
            'title' => 'Edinburgh Tours & Excursions - Top-Rated Activities & Adventures',
            'description' => 'Discover top-rated Edinburgh tours, excursions, and activities powered by AI. From castle tours to whisky experiences, find the perfect way to explore Scotland\'s historic capital.',
            'keywords' => 'Edinburgh tours, Edinburgh excursions, Edinburgh Castle tours, Royal Mile tours, things to do in Edinburgh',
            'image' => 'https://ouqeoizufbofdqbuiwvx.supabase.co/storage/v1/object/public/destinations//Edinburgh.jpeg'
        ],
        'amsterdam' => [
            'title' => 'Amsterdam Tours & Excursions - Top-Rated Activities & Adventures',
            'description' => 'Discover top-rated Amsterdam tours, excursions, and activities powered by AI. From canal tours to museum experiences, find the perfect way to explore the Netherlands\' cultural heart.',
            'keywords' => 'Amsterdam tours, Amsterdam excursions, canal tours, Van Gogh Museum tours, things to do in Amsterdam',
            'image' => 'https://ouqeoizufbofdqbuiwvx.supabase.co/storage/v1/object/public/destinations//Amsterdam.jpg'
        ],
        'berlin' => [
            'title' => 'Berlin Tours & Excursions - Top-Rated Activities & Adventures',
            'description' => 'Discover top-rated Berlin tours, excursions, and activities powered by AI. From historic tours to museum experiences, find the perfect way to explore Germany\'s dynamic capital.',
            'keywords' => 'Berlin tours, Berlin excursions, Brandenburg Gate tours, Berlin Wall tours, things to do in Berlin',
            'image' => 'https://ouqeoizufbofdqbuiwvx.supabase.co/storage/v1/object/public/destinations//Berlin.jpg'
        ],
        'munich' => [
            'title' => 'Munich Tours & Excursions - Top-Rated Activities & Adventures',
            'description' => 'Discover top-rated Munich tours, excursions, and activities powered by AI. From Oktoberfest tours to beer garden experiences, find the perfect way to explore Bavaria\'s capital.',
            'keywords' => 'Munich tours, Munich excursions, Oktoberfest tours, beer garden tours, things to do in Munich',
            'image' => 'https://ouqeoizufbofdqbuiwvx.supabase.co/storage/v1/object/public/destinations//Munich.webp'
        ],
        'zurich' => [
            'title' => 'Zurich Tours & Excursions - Top-Rated Activities & Adventures',
            'description' => 'Discover top-rated Zurich tours, excursions, and activities powered by AI. From Old Town tours to lake experiences, find the perfect way to explore Switzerland\'s cosmopolitan heart.',
            'keywords' => 'Zurich tours, Zurich excursions, Old Town tours, Lake Zurich tours, things to do in Zurich',
            'image' => 'https://ouqeoizufbofdqbuiwvx.supabase.co/storage/v1/object/public/destinations//Zurich.jpeg'
        ],
        'interlaken' => [
            'title' => 'Interlaken Tours & Excursions - Top-Rated Activities & Adventures',
            'description' => 'Discover top-rated Interlaken tours, excursions, and activities powered by AI. From Jungfrau tours to adventure experiences, find the perfect way to explore Switzerland\'s outdoor playground.',
            'keywords' => 'Interlaken tours, Interlaken excursions, Jungfrau tours, adventure tours, things to do in Interlaken',
            'image' => 'https://ouqeoizufbofdqbuiwvx.supabase.co/storage/v1/object/public/destinations//Interlaken.jpg'
        ],
        'dubrovnik' => [
            'title' => 'Dubrovnik Tours & Excursions - Top-Rated Activities & Adventures',
            'description' => 'Discover top-rated Dubrovnik tours, excursions, and activities powered by AI. From city walls tours to Adriatic experiences, find the perfect way to explore Croatia\'s pearl of the Adriatic.',
            'keywords' => 'Dubrovnik tours, Dubrovnik excursions, city walls tours, Old Town tours, things to do in Dubrovnik',
            'image' => 'https://ouqeoizufbofdqbuiwvx.supabase.co/storage/v1/object/public/destinations//Dubrovnik.webp'
        ],
        'split' => [
            'title' => 'Split Tours & Excursions - Top-Rated Activities & Adventures',
            'description' => 'Discover top-rated Split tours, excursions, and activities powered by AI. From palace tours to coastal experiences, find the perfect way to explore Croatia\'s historic seaside gem.',
            'keywords' => 'Split tours, Split excursions, Diocletian\'s Palace tours, coastal tours, things to do in Split',
            'image' => 'https://ouqeoizufbofdqbuiwvx.supabase.co/storage/v1/object/public/destinations//Split.jpg'
        ],
        'prague' => [
            'title' => 'Prague Tours & Excursions - Top-Rated Activities & Adventures',
            'description' => 'Discover top-rated Prague tours, excursions, and activities powered by AI. From castle tours to historic experiences, find the perfect way to explore the Czech Republic\'s golden city.',
            'keywords' => 'Prague tours, Prague excursions, Prague Castle tours, Charles Bridge tours, things to do in Prague',
            'image' => 'https://ouqeoizufbofdqbuiwvx.supabase.co/storage/v1/object/public/destinations//Prague.webp'
        ],
        'vienna' => [
            'title' => 'Vienna Tours & Excursions - Top-Rated Activities & Adventures',
            'description' => 'Discover top-rated Vienna tours, excursions, and activities powered by AI. From palace tours to classical music experiences, find the perfect way to explore Austria\'s cultural heart.',
            'keywords' => 'Vienna tours, Vienna excursions, Schönbrunn Palace tours, Hofburg tours, things to do in Vienna',
            'image' => 'https://ouqeoizufbofdqbuiwvx.supabase.co/storage/v1/object/public/destinations//Vienna.webp'
        ],
        'budapest' => [
            'title' => 'Budapest Tours & Excursions - Top-Rated Activities & Adventures',
            'description' => 'Discover top-rated Budapest tours, excursions, and activities powered by AI. From parliament tours to thermal bath experiences, find the perfect way to explore Hungary\'s pearl of the Danube.',
            'keywords' => 'Budapest tours, Budapest excursions, Parliament tours, thermal baths, things to do in Budapest',
            'image' => 'https://ouqeoizufbofdqbuiwvx.supabase.co/storage/v1/object/public/destinations//Budapest.webp'
        ],
        'reykjavik' => [
            'title' => 'Reykjavik Tours & Excursions - Top-Rated Activities & Adventures',
            'description' => 'Discover top-rated Reykjavik tours, excursions, and activities powered by AI. From northern lights tours to geothermal experiences, find the perfect way to explore Iceland\'s vibrant capital.',
            'keywords' => 'Reykjavik tours, Reykjavik excursions, northern lights tours, Golden Circle tours, things to do in Reykjavik',
            'image' => 'https://ouqeoizufbofdqbuiwvx.supabase.co/storage/v1/object/public/destinations//Reykjavik.jpg'
        ],
        'oslo' => [
            'title' => 'Oslo Tours & Excursions - Top-Rated Activities & Adventures',
            'description' => 'Discover top-rated Oslo tours, excursions, and activities powered by AI. From Viking museum tours to fjord experiences, find the perfect way to explore Norway\'s modern heart.',
            'keywords' => 'Oslo tours, Oslo excursions, Viking Ship Museum tours, Oslo Fjord tours, things to do in Oslo',
            'image' => 'https://ouqeoizufbofdqbuiwvx.supabase.co/storage/v1/object/public/destinations//Oslo.jpeg'
        ],
        'lofoten-islands' => [
            'title' => 'Lofoten Islands Tours & Excursions - Top-Rated Activities & Adventures',
            'description' => 'Discover top-rated Lofoten Islands tours, excursions, and activities powered by AI. From fishing village tours to northern lights experiences, find the perfect way to explore Norway\'s northern paradise.',
            'keywords' => 'Lofoten Islands tours, Lofoten excursions, fishing village tours, northern lights tours, things to do in Lofoten',
            'image' => 'https://ouqeoizufbofdqbuiwvx.supabase.co/storage/v1/object/public/destinations//Lofoten%20Islands.jpg'
        ],
        'new-york-city' => [
            'title' => 'New York City Tours & Excursions - Top-Rated Activities & Adventures',
            'description' => 'Discover top-rated New York City tours, excursions, and activities powered by AI. From Times Square to Central Park, find the perfect way to explore the Big Apple.',
            'keywords' => 'New York City tours, NYC tours, Times Square tours, Central Park tours, things to do in New York City',
            'image' => 'https://ouqeoizufbofdqbuiwvx.supabase.co/storage/v1/object/public/destinations//New%20York%20City.jpeg'
        ],
        'los-angeles' => [
            'title' => 'Los Angeles Tours & Excursions - Top-Rated Activities & Adventures',
            'description' => 'Discover top-rated Los Angeles tours, excursions, and activities powered by AI. From Hollywood tours to beach experiences, find the perfect way to explore the City of Angels.',
            'keywords' => 'Los Angeles tours, LA tours, Hollywood tours, beach tours, things to do in Los Angeles',
            'image' => 'https://ouqeoizufbofdqbuiwvx.supabase.co/storage/v1/object/public/destinations//Los%20Angeles.webp'
        ],
        'las-vegas' => [
            'title' => 'Las Vegas Tours & Excursions - Top-Rated Activities & Adventures',
            'description' => 'Discover top-rated Las Vegas tours, excursions, and activities powered by AI. From Strip tours to show experiences, find the perfect way to explore Sin City.',
            'keywords' => 'Las Vegas tours, Vegas tours, Strip tours, casino tours, things to do in Las Vegas',
            'image' => 'https://ouqeoizufbofdqbuiwvx.supabase.co/storage/v1/object/public/destinations//Las%20Vegas.webp'
        ],
        'miami' => [
            'title' => 'Miami Tours & Excursions - Top-Rated Activities & Adventures',
            'description' => 'Discover top-rated Miami tours, excursions, and activities powered by AI. From South Beach tours to cultural experiences, find the perfect way to explore the Magic City.',
            'keywords' => 'Miami tours, South Beach tours, Art Deco tours, things to do in Miami',
            'image' => 'https://ouqeoizufbofdqbuiwvx.supabase.co/storage/v1/object/public/destinations//Miami.jpg'
        ],
        'orlando' => [
            'title' => 'Orlando Tours & Excursions - Top-Rated Activities & Adventures',
            'description' => 'Discover top-rated Orlando tours, excursions, and activities powered by AI. From Disney World to Universal Studios, find the perfect way to explore the theme park capital.',
            'keywords' => 'Orlando tours, Disney World tours, Universal Studios tours, things to do in Orlando',
            'image' => 'https://ouqeoizufbofdqbuiwvx.supabase.co/storage/v1/object/public/destinations//Orlando.jpeg'
        ],
        'san-francisco' => [
            'title' => 'San Francisco Tours & Excursions - Top-Rated Activities & Adventures',
            'description' => 'Discover top-rated San Francisco tours, excursions, and activities powered by AI. From Golden Gate Bridge to Alcatraz, find the perfect way to explore the Golden Gate City.',
            'keywords' => 'San Francisco tours, Golden Gate Bridge tours, Alcatraz tours, things to do in San Francisco',
            'image' => 'https://ouqeoizufbofdqbuiwvx.supabase.co/storage/v1/object/public/destinations//San%20Francisco.jpeg'
        ],
        'chicago' => [
            'title' => 'Chicago Tours & Excursions - Top-Rated Activities & Adventures',
            'description' => 'Discover top-rated Chicago tours, excursions, and activities powered by AI. From architecture tours to deep-dish pizza experiences, find the perfect way to explore the Windy City.',
            'keywords' => 'Chicago tours, architecture tours, deep-dish pizza tours, things to do in Chicago',
            'image' => 'https://ouqeoizufbofdqbuiwvx.supabase.co/storage/v1/object/public/destinations//Chicago.jpg'
        ],
        'honolulu' => [
            'title' => 'Honolulu Tours & Excursions - Top-Rated Activities & Adventures',
            'description' => 'Discover top-rated Honolulu tours, excursions, and activities powered by AI. From Pearl Harbor to Waikiki Beach, find the perfect way to explore Hawaii\'s capital.',
            'keywords' => 'Honolulu tours, Pearl Harbor tours, Waikiki Beach tours, things to do in Honolulu',
            'image' => 'https://ouqeoizufbofdqbuiwvx.supabase.co/storage/v1/object/public/destinations//Honolulu.jpeg'
        ],
        'washington-dc' => [
            'title' => 'Washington, D.C. Tours & Excursions - Top-Rated Activities & Adventures',
            'description' => 'Discover top-rated Washington, D.C. tours, excursions, and activities powered by AI. From National Mall to Capitol Hill, find the perfect way to explore the nation\'s capital.',
            'keywords' => 'Washington DC tours, National Mall tours, Capitol tours, things to do in Washington DC',
            'image' => 'https://ouqeoizufbofdqbuiwvx.supabase.co/storage/v1/object/public/destinations//Washington,%20D.C..jpeg'
        ],
        'nashville' => [
            'title' => 'Nashville Tours & Excursions - Top-Rated Activities & Adventures',
            'description' => 'Discover top-rated Nashville tours, excursions, and activities powered by AI. From country music tours to hot chicken experiences, find the perfect way to explore Music City.',
            'keywords' => 'Nashville tours, country music tours, Broadway tours, things to do in Nashville',
            'image' => 'https://ouqeoizufbofdqbuiwvx.supabase.co/storage/v1/object/public/destinations//Nashville.jpg'
        ],
        'new-orleans' => [
            'title' => 'New Orleans Tours & Excursions - Top-Rated Activities & Adventures',
            'description' => 'Discover top-rated New Orleans tours, excursions, and activities powered by AI. From French Quarter to jazz experiences, find the perfect way to explore the Big Easy.',
            'keywords' => 'New Orleans tours, French Quarter tours, jazz tours, things to do in New Orleans',
            'image' => 'https://ouqeoizufbofdqbuiwvx.supabase.co/storage/v1/object/public/destinations//New%20Orleans.webp'
        ],
        'denver' => [
            'title' => 'Denver Tours & Excursions - Top-Rated Activities & Adventures',
            'description' => 'Discover top-rated Denver tours, excursions, and activities powered by AI. From Rocky Mountain tours to brewery experiences, find the perfect way to explore the Mile High City.',
            'keywords' => 'Denver tours, Rocky Mountain tours, brewery tours, things to do in Denver',
            'image' => 'https://ouqeoizufbofdqbuiwvx.supabase.co/storage/v1/object/public/destinations//Denver.jpeg'
        ],
        'sedona' => [
            'title' => 'Sedona Tours & Excursions - Top-Rated Activities & Adventures',
            'description' => 'Discover top-rated Sedona tours, excursions, and activities powered by AI. From red rock tours to spiritual experiences, find the perfect way to explore Arizona\'s mystical gem.',
            'keywords' => 'Sedona tours, red rock tours, spiritual tours, things to do in Sedona',
            'image' => 'https://ouqeoizufbofdqbuiwvx.supabase.co/storage/v1/object/public/destinations//Sedona.jpg'
        ],
        'toronto' => [
            'title' => 'Toronto Tours & Excursions - Top-Rated Activities & Adventures',
            'description' => 'Discover top-rated Toronto tours, excursions, and activities powered by AI. From CN Tower to multicultural experiences, find the perfect way to explore Canada\'s largest city.',
            'keywords' => 'Toronto tours, CN Tower tours, multicultural tours, things to do in Toronto',
            'image' => 'https://ouqeoizufbofdqbuiwvx.supabase.co/storage/v1/object/public/destinations//Toronto.jpeg'
        ],
        'vancouver' => [
            'title' => 'Vancouver Tours & Excursions - Top-Rated Activities & Adventures',
            'description' => 'Discover top-rated Vancouver tours, excursions, and activities powered by AI. From Stanley Park to outdoor adventures, find the perfect way to explore Canada\'s Pacific paradise.',
            'keywords' => 'Vancouver tours, Stanley Park tours, outdoor tours, things to do in Vancouver',
            'image' => 'https://ouqeoizufbofdqbuiwvx.supabase.co/storage/v1/object/public/destinations//Vancouver.webp'
        ],
        'montreal' => [
            'title' => 'Montreal Tours & Excursions - Top-Rated Activities & Adventures',
            'description' => 'Discover top-rated Montreal tours, excursions, and activities powered by AI. From Old Montreal to cultural experiences, find the perfect way to explore Quebec\'s vibrant heart.',
            'keywords' => 'Montreal tours, Old Montreal tours, French Canadian tours, things to do in Montreal',
            'image' => 'https://ouqeoizufbofdqbuiwvx.supabase.co/storage/v1/object/public/destinations//Montreal.jpg'
        ],
        'banff' => [
            'title' => 'Banff Tours & Excursions - Top-Rated Activities & Adventures',
            'description' => 'Discover top-rated Banff tours, excursions, and activities powered by AI. From Lake Louise to mountain adventures, find the perfect way to explore Alberta\'s mountain paradise.',
            'keywords' => 'Banff tours, Lake Louise tours, mountain tours, things to do in Banff',
            'image' => 'https://ouqeoizufbofdqbuiwvx.supabase.co/storage/v1/object/public/destinations//Banff.jpeg'
        ],
        'quebec-city' => [
            'title' => 'Quebec City Tours & Excursions - Top-Rated Activities & Adventures',
            'description' => 'Discover top-rated Quebec City tours, excursions, and activities powered by AI. From Old Quebec to historic experiences, find the perfect way to explore Canada\'s most romantic city.',
            'keywords' => 'Quebec City tours, Old Quebec tours, Château Frontenac tours, things to do in Quebec City',
            'image' => 'https://ouqeoizufbofdqbuiwvx.supabase.co/storage/v1/object/public/destinations//Quebec%20City.webp'
        ],
        'cancun' => [
            'title' => 'Cancun Tours & Excursions - Top-Rated Activities & Adventures',
            'description' => 'Discover top-rated Cancun tours, excursions, and activities powered by AI. From beach tours to Mayan ruins, find the perfect way to explore Mexico\'s Caribbean paradise.',
            'keywords' => 'Cancun tours, Mayan ruins tours, beach tours, things to do in Cancun',
            'image' => 'https://ouqeoizufbofdqbuiwvx.supabase.co/storage/v1/object/public/destinations//Cancun.webp'
        ],
        'tulum' => [
            'title' => 'Tulum Tours & Excursions - Top-Rated Activities & Adventures',
            'description' => 'Discover top-rated Tulum tours, excursions, and activities powered by AI. From Mayan ruins to cenote experiences, find the perfect way to explore Mexico\'s bohemian paradise.',
            'keywords' => 'Tulum tours, Mayan ruins tours, cenote tours, things to do in Tulum',
            'image' => 'https://ouqeoizufbofdqbuiwvx.supabase.co/storage/v1/object/public/destinations//Tulum.jpg'
        ],
        'playa-del-carmen' => [
            'title' => 'Playa del Carmen Tours & Excursions - Top-Rated Activities & Adventures',
            'description' => 'Discover top-rated Playa del Carmen tours, excursions, and activities powered by AI. From Fifth Avenue to beach experiences, find the perfect way to explore the Riviera Maya\'s heart.',
            'keywords' => 'Playa del Carmen tours, Fifth Avenue tours, beach tours, things to do in Playa del Carmen',
            'image' => 'https://ouqeoizufbofdqbuiwvx.supabase.co/storage/v1/object/public/destinations//Playa%20del%20Carmen.jpg'
        ],
        'mexico-city' => [
            'title' => 'Mexico City Tours & Excursions - Top-Rated Activities & Adventures',
            'description' => 'Discover top-rated Mexico City tours, excursions, and activities powered by AI. From historic center to cultural experiences, find the perfect way to explore Mexico\'s dynamic capital.',
            'keywords' => 'Mexico City tours, historic center tours, Teotihuacan tours, things to do in Mexico City',
            'image' => 'https://ouqeoizufbofdqbuiwvx.supabase.co/storage/v1/object/public/destinations//Mexico%20City.avif'
        ],
        'cabo-san-lucas' => [
            'title' => 'Cabo San Lucas Tours & Excursions - Top-Rated Activities & Adventures',
            'description' => 'Discover top-rated Cabo San Lucas tours, excursions, and activities powered by AI. From Arch tours to sport fishing, find the perfect way to explore Mexico\'s Pacific gem.',
            'keywords' => 'Cabo San Lucas tours, Arch of Cabo tours, sport fishing tours, things to do in Cabo San Lucas',
            'image' => 'https://ouqeoizufbofdqbuiwvx.supabase.co/storage/v1/object/public/destinations//Cabo%20San%20Lucas.avif'
        ],
        'puerto-vallarta' => [
            'title' => 'Puerto Vallarta Tours & Excursions - Top-Rated Activities & Adventures',
            'description' => 'Discover top-rated Puerto Vallarta tours, excursions, and activities powered by AI. From Malecon to cultural experiences, find the perfect way to explore Mexico\'s most romantic destination.',
            'keywords' => 'Puerto Vallarta tours, Malecon tours, Old Town tours, things to do in Puerto Vallarta',
            'image' => 'https://ouqeoizufbofdqbuiwvx.supabase.co/storage/v1/object/public/destinations//Puerto%20Vallarta.webp'
        ],
        'oaxaca' => [
            'title' => 'Oaxaca Tours & Excursions - Top-Rated Activities & Adventures',
            'description' => 'Discover top-rated Oaxaca tours, excursions, and activities powered by AI. From historic center to cultural experiences, find the perfect way to explore Mexico\'s most authentic destination.',
            'keywords' => 'Oaxaca tours, Monte Alban tours, food tours, things to do in Oaxaca',
            'image' => 'https://ouqeoizufbofdqbuiwvx.supabase.co/storage/v1/object/public/destinations//Oaxaca.webp'
        ],
        'san-jose' => [
            'title' => 'San José Tours & Excursions - Top-Rated Activities & Adventures',
            'description' => 'Discover top-rated San José tours, excursions, and activities powered by AI. From historic center to coffee experiences, find the perfect way to explore Costa Rica\'s vibrant capital.',
            'keywords' => 'San José tours, Costa Rica tours, coffee tours, things to do in San José',
            'image' => 'https://ouqeoizufbofdqbuiwvx.supabase.co/storage/v1/object/public/destinations//san%20jose%20costa%20rica.webp'
        ],
        'la-fortuna' => [
            'title' => 'La Fortuna Tours & Excursions - Top-Rated Activities & Adventures',
            'description' => 'Discover top-rated La Fortuna tours, excursions, and activities powered by AI. From Arenal Volcano to adventure experiences, find the perfect way to explore Costa Rica\'s adventure capital.',
            'keywords' => 'La Fortuna tours, Arenal Volcano tours, adventure tours, things to do in La Fortuna',
            'image' => 'https://ouqeoizufbofdqbuiwvx.supabase.co/storage/v1/object/public/destinations//La%20Fortuna%20(Arenal).jpg'
        ],
        'manuel-antonio' => [
            'title' => 'Manuel Antonio Tours & Excursions - Top-Rated Activities & Adventures',
            'description' => 'Discover top-rated Manuel Antonio tours, excursions, and activities powered by AI. From national park to wildlife experiences, find the perfect way to explore Costa Rica\'s coastal paradise.',
            'keywords' => 'Manuel Antonio tours, national park tours, wildlife tours, things to do in Manuel Antonio',
            'image' => 'https://ouqeoizufbofdqbuiwvx.supabase.co/storage/v1/object/public/destinations//Manuel%20Antonio.jpg'
        ],
        'panama-city' => [
            'title' => 'Panama City Tours & Excursions - Top-Rated Activities & Adventures',
            'description' => 'Discover top-rated Panama City tours, excursions, and activities powered by AI. From Panama Canal to historic experiences, find the perfect way to explore Panama\'s dynamic capital.',
            'keywords' => 'Panama City tours, Panama Canal tours, Casco Viejo tours, things to do in Panama City',
            'image' => 'https://ouqeoizufbofdqbuiwvx.supabase.co/storage/v1/object/public/destinations//Panama%20City.jpg'
        ],
        'bocas-del-toro' => [
            'title' => 'Bocas del Toro Tours & Excursions - Top-Rated Activities & Adventures',
            'description' => 'Discover top-rated Bocas del Toro tours, excursions, and activities powered by AI. From island hopping to water experiences, find the perfect way to explore Panama\'s Caribbean paradise.',
            'keywords' => 'Bocas del Toro tours, island tours, snorkeling tours, things to do in Bocas del Toro',
            'image' => 'https://ouqeoizufbofdqbuiwvx.supabase.co/storage/v1/object/public/destinations//Bocas%20del%20Toro.jpg'
        ],
        'cartagena' => [
            'title' => 'Cartagena Tours & Excursions - Top-Rated Activities & Adventures',
            'description' => 'Discover top-rated Cartagena tours, excursions, and activities powered by AI. From Old Town to historic experiences, find the perfect way to explore Colombia\'s coastal jewel.',
            'keywords' => 'Cartagena tours, Old Town tours, historic tours, things to do in Cartagena',
            'image' => 'https://ouqeoizufbofdqbuiwvx.supabase.co/storage/v1/object/public/destinations//Cartagena.avif'
        ],
        'medellin' => [
            'title' => 'Medellín Tours & Excursions - Top-Rated Activities & Adventures',
            'description' => 'Discover top-rated Medellín tours, excursions, and activities powered by AI. From city tours to cultural experiences, find the perfect way to explore Colombia\'s most dynamic city.',
            'keywords' => 'Medellín tours, city tours, cable car tours, things to do in Medellín',
            'image' => 'https://ouqeoizufbofdqbuiwvx.supabase.co/storage/v1/object/public/destinations//Medellin.jpeg'
        ],
        'bogota' => [
            'title' => 'Bogotá Tours & Excursions - Top-Rated Activities & Adventures',
            'description' => 'Discover top-rated Bogotá tours, excursions, and activities powered by AI. From La Candelaria to cultural experiences, find the perfect way to explore Colombia\'s dynamic capital.',
            'keywords' => 'Bogotá tours, La Candelaria tours, museum tours, things to do in Bogotá',
            'image' => 'https://ouqeoizufbofdqbuiwvx.supabase.co/storage/v1/object/public/destinations//Bogota.webp'
        ],
        'lima' => [
            'title' => 'Lima Tours & Excursions - Top-Rated Activities & Adventures',
            'description' => 'Discover top-rated Lima tours, excursions, and activities powered by AI. From historic center to culinary experiences, find the perfect way to explore Peru\'s gastronomic capital.',
            'keywords' => 'Lima tours, food tours, historic tours, things to do in Lima',
            'image' => 'https://ouqeoizufbofdqbuiwvx.supabase.co/storage/v1/object/public/destinations//Lima.jpg'
        ],
        'cusco' => [
            'title' => 'Cusco Tours & Excursions - Top-Rated Activities & Adventures',
            'description' => 'Discover top-rated Cusco tours, excursions, and activities powered by AI. From historic center to Inca experiences, find the perfect way to explore Peru\'s historic heart.',
            'keywords' => 'Cusco tours, Inca ruins tours, Sacred Valley tours, things to do in Cusco',
            'image' => 'https://ouqeoizufbofdqbuiwvx.supabase.co/storage/v1/object/public/destinations//Cusco.jpg'
        ],
        'machu-picchu' => [
            'title' => 'Machu Picchu Tours & Excursions - Top-Rated Activities & Adventures',
            'description' => 'Discover top-rated Machu Picchu tours, excursions, and activities powered by AI. From citadel tours to Inca Trail experiences, find the perfect way to explore Peru\'s crown jewel.',
            'keywords' => 'Machu Picchu tours, Inca Trail tours, citadel tours, things to do in Machu Picchu',
            'image' => 'https://ouqeoizufbofdqbuiwvx.supabase.co/storage/v1/object/public/destinations//Machu%20Picchu.jpg'
        ],
        'rio-de-janeiro' => [
            'title' => 'Rio de Janeiro Tours & Excursions - Top-Rated Activities & Adventures',
            'description' => 'Discover top-rated Rio de Janeiro tours, excursions, and activities powered by AI. From Christ the Redeemer to beach experiences, find the perfect way to explore Brazil\'s iconic heart.',
            'keywords' => 'Rio de Janeiro tours, Christ the Redeemer tours, beach tours, things to do in Rio de Janeiro',
            'image' => 'https://ouqeoizufbofdqbuiwvx.supabase.co/storage/v1/object/public/destinations//Rio%20de%20Janeiro.jpeg'
        ],
        'sao-paulo' => [
            'title' => 'São Paulo Tours & Excursions - Top-Rated Activities & Adventures',
            'description' => 'Discover top-rated São Paulo tours, excursions, and activities powered by AI. From city tours to cultural experiences, find the perfect way to explore Brazil\'s dynamic metropolis.',
            'keywords' => 'São Paulo tours, city tours, museum tours, things to do in São Paulo',
            'image' => 'https://ouqeoizufbofdqbuiwvx.supabase.co/storage/v1/object/public/destinations//Sao%20Paulo.jpg'
        ],
        'salvador' => [
            'title' => 'Salvador Tours & Excursions - Top-Rated Activities & Adventures',
            'description' => 'Discover top-rated Salvador tours, excursions, and activities powered by AI. From Pelourinho to cultural experiences, find the perfect way to explore Brazil\'s historic heart.',
            'keywords' => 'Salvador tours, Pelourinho tours, cultural tours, things to do in Salvador',
            'image' => 'https://ouqeoizufbofdqbuiwvx.supabase.co/storage/v1/object/public/destinations//Salvador.jpeg'
        ],
        'buenos-aires' => [
            'title' => 'Buenos Aires Tours & Excursions - Top-Rated Activities & Adventures',
            'description' => 'Discover top-rated Buenos Aires tours, excursions, and activities powered by AI. From tango experiences to cultural tours, find the perfect way to explore Argentina\'s vibrant capital.',
            'keywords' => 'Buenos Aires tours, tango tours, cultural tours, things to do in Buenos Aires',
            'image' => 'https://ouqeoizufbofdqbuiwvx.supabase.co/storage/v1/object/public/destinations//Buenos%20Aires.webp'
        ],
        'mendoza' => [
            'title' => 'Mendoza Tours & Excursions - Top-Rated Activities & Adventures',
            'description' => 'Discover top-rated Mendoza tours, excursions, and activities powered by AI. From wine tours to adventure experiences, find the perfect way to explore Argentina\'s premier wine region.',
            'keywords' => 'Mendoza tours, wine tours, vineyard tours, things to do in Mendoza',
            'image' => 'https://ouqeoizufbofdqbuiwvx.supabase.co/storage/v1/object/public/destinations//Mendoza.jpeg'
        ],
        'bariloche' => [
            'title' => 'Bariloche Tours & Excursions - Top-Rated Activities & Adventures',
            'description' => 'Discover top-rated Bariloche tours, excursions, and activities powered by AI. From skiing to lake adventures, find the perfect way to explore Argentina\'s mountain paradise.',
            'keywords' => 'Bariloche tours, ski tours, lake tours, things to do in Bariloche',
            'image' => 'https://ouqeoizufbofdqbuiwvx.supabase.co/storage/v1/object/public/destinations//Bariloche.jpg'
        ],
        'santiago' => [
            'title' => 'Santiago Tours & Excursions - Top-Rated Activities & Adventures',
            'description' => 'Discover top-rated Santiago tours, excursions, and activities powered by AI. From city tours to wine experiences, find the perfect way to explore Chile\'s dynamic capital.',
            'keywords' => 'Santiago tours, city tours, wine tours, things to do in Santiago',
            'image' => 'https://ouqeoizufbofdqbuiwvx.supabase.co/storage/v1/object/public/destinations//Santiago.webp'
        ],
        'patagonia' => [
            'title' => 'Patagonia Tours & Excursions - Top-Rated Activities & Adventures',
            'description' => 'Discover top-rated Patagonia tours, excursions, and activities powered by AI. From hiking to glacier experiences, find the perfect way to explore this wilderness paradise.',
            'keywords' => 'Patagonia tours, hiking tours, glacier tours, things to do in Patagonia',
            'image' => 'https://ouqeoizufbofdqbuiwvx.supabase.co/storage/v1/object/public/destinations//Patagonia.jpeg'
        ],
        'quito' => [
            'title' => 'Quito Tours & Excursions - Top-Rated Activities & Adventures',
            'description' => 'Discover top-rated Quito tours, excursions, and activities powered by AI. From historic tours to equator experiences, find the perfect way to explore Ecuador\'s historic capital.',
            'keywords' => 'Quito tours, historic tours, equator tours, things to do in Quito',
            'image' => 'https://ouqeoizufbofdqbuiwvx.supabase.co/storage/v1/object/public/destinations//Quito.jpeg'
        ],
        'galapagos-islands' => [
            'title' => 'Galápagos Islands Tours & Excursions - Top-Rated Activities & Adventures',
            'description' => 'Discover top-rated Galápagos Islands tours, excursions, and activities powered by AI. From wildlife encounters to island adventures, find the perfect way to explore this natural wonder.',
            'keywords' => 'Galápagos Islands tours, wildlife tours, snorkeling tours, things to do in Galápagos',
            'image' => 'https://ouqeoizufbofdqbuiwvx.supabase.co/storage/v1/object/public/destinations//Galapagos%20Islands.jpeg'
        ],
        'belize-city' => [
            'title' => 'Belize City Tours & Excursions - Top-Rated Activities & Adventures',
            'description' => 'Discover top-rated Belize City tours, excursions, and activities powered by AI. From historic tours to cultural experiences, find the perfect way to explore Belize\'s vibrant capital.',
            'keywords' => 'Belize City tours, historic tours, cultural tours, things to do in Belize City',
            'image' => 'https://ouqeoizufbofdqbuiwvx.supabase.co/storage/v1/object/public/destinations//Belize%20City.webp'
        ],
        'san-pedro' => [
            'title' => 'San Pedro Tours & Excursions - Top-Rated Activities & Adventures',
            'description' => 'Discover top-rated San Pedro tours, excursions, and activities powered by AI. From beach tours to water adventures, find the perfect way to explore Belize\'s island paradise.',
            'keywords' => 'San Pedro tours, beach tours, water tours, things to do in San Pedro',
            'image' => 'https://ouqeoizufbofdqbuiwvx.supabase.co/storage/v1/object/public/destinations//San%20Pedro.jpg'
        ],
        'antigua' => [
            'title' => 'Antigua Tours & Excursions - Top-Rated Activities & Adventures',
            'description' => 'Discover top-rated Antigua tours, excursions, and activities powered by AI. From historic tours to volcano experiences, find the perfect way to explore Guatemala\'s colonial gem.',
            'keywords' => 'Antigua tours, historic tours, volcano tours, things to do in Antigua',
            'image' => 'https://ouqeoizufbofdqbuiwvx.supabase.co/storage/v1/object/public/destinations//Antigua.jpg'
        ],
        'lake-atitlan' => [
            'title' => 'Lake Atitlán Tours & Excursions - Top-Rated Activities & Adventures',
            'description' => 'Discover top-rated Lake Atitlán tours, excursions, and activities powered by AI. From lake tours to cultural experiences, find the perfect way to explore Guatemala\'s natural wonder.',
            'keywords' => 'Lake Atitlán tours, lake tours, cultural tours, things to do in Lake Atitlán',
            'image' => 'https://ouqeoizufbofdqbuiwvx.supabase.co/storage/v1/object/public/destinations//Lake%20Atitlan.jpeg'
        ],
        'tokyo' => [
            'title' => 'Tokyo Tours & Excursions - Top-Rated Activities & Adventures',
            'description' => 'Discover top-rated Tokyo tours, excursions, and activities powered by AI. From city tours to cultural experiences, find the perfect way to explore Japan\'s dynamic capital.',
            'keywords' => 'Tokyo tours, city tours, cultural tours, things to do in Tokyo',
            'image' => 'https://ouqeoizufbofdqbuiwvx.supabase.co/storage/v1/object/public/destinations//tokyo.webp'
        ],
        'kyoto' => [
            'title' => 'Kyoto Tours & Excursions - Top-Rated Activities & Adventures',
            'description' => 'Discover top-rated Kyoto tours, excursions, and activities powered by AI. From temple tours to cultural experiences, find the perfect way to explore Japan\'s cultural heart.',
            'keywords' => 'Kyoto tours, temple tours, cultural tours, things to do in Kyoto',
            'image' => 'https://ouqeoizufbofdqbuiwvx.supabase.co/storage/v1/object/public/destinations//kyoto.jpeg'
        ],
        'osaka' => [
            'title' => 'Osaka Tours & Excursions - Top-Rated Activities & Adventures',
            'description' => 'Discover top-rated Osaka tours, excursions, and activities powered by AI. From food tours to cultural experiences, find the perfect way to explore Japan\'s culinary capital.',
            'keywords' => 'Osaka tours, food tours, cultural tours, things to do in Osaka',
            'image' => 'https://ouqeoizufbofdqbuiwvx.supabase.co/storage/v1/object/public/destinations//Osaka.jpg'
        ],
        'hiroshima' => [
            'title' => 'Hiroshima Tours & Excursions - Top-Rated Activities & Adventures',
            'description' => 'Discover top-rated Hiroshima tours, excursions, and activities powered by AI. From peace tours to cultural experiences, find the perfect way to explore Japan\'s city of peace.',
            'keywords' => 'Hiroshima tours, peace tours, cultural tours, things to do in Hiroshima',
            'image' => 'https://ouqeoizufbofdqbuiwvx.supabase.co/storage/v1/object/public/destinations//Hiroshima.jpg'
        ],
        'hokkaido' => [
            'title' => 'Hokkaido Tours & Excursions - Top-Rated Activities & Adventures',
            'description' => 'Discover top-rated Hokkaido tours, excursions, and activities powered by AI. From ski tours to nature experiences, find the perfect way to explore Japan\'s northern paradise.',
            'keywords' => 'Hokkaido tours, ski tours, nature tours, things to do in Hokkaido',
            'image' => 'https://ouqeoizufbofdqbuiwvx.supabase.co/storage/v1/object/public/destinations//Hokkaido.jpg'
        ],
        'bangkok' => [
            'title' => 'Bangkok Tours & Excursions - Top-Rated Activities & Adventures',
            'description' => 'Discover top-rated Bangkok tours, excursions, and activities powered by AI. From temple tours to food experiences, find the perfect way to explore Thailand\'s dynamic capital.',
            'keywords' => 'Bangkok tours, temple tours, food tours, things to do in Bangkok',
            'image' => 'https://ouqeoizufbofdqbuiwvx.supabase.co/storage/v1/object/public/destinations//Bangkok.jpeg'
        ],
        'chiang-mai' => [
            'title' => 'Chiang Mai Tours & Excursions - Top-Rated Activities & Adventures',
            'description' => 'Discover top-rated Chiang Mai tours, excursions, and activities powered by AI. From temple tours to mountain experiences, find the perfect way to explore Thailand\'s northern gem.',
            'keywords' => 'Chiang Mai tours, temple tours, cultural tours, things to do in Chiang Mai',
            'image' => 'https://ouqeoizufbofdqbuiwvx.supabase.co/storage/v1/object/public/destinations//Chiang%20Mai.jpeg'
        ],
        'phuket' => [
            'title' => 'Phuket Tours & Excursions - Top-Rated Activities & Adventures',
            'description' => 'Discover top-rated Phuket tours, excursions, and activities powered by AI. From beach tours to island adventures, find the perfect way to explore Thailand\'s tropical paradise.',
            'keywords' => 'Phuket tours, beach tours, island tours, things to do in Phuket',
            'image' => 'https://ouqeoizufbofdqbuiwvx.supabase.co/storage/v1/object/public/destinations//Phuket.webp'
        ],
        'krabi' => [
            'title' => 'Krabi Tours & Excursions - Top-Rated Activities & Adventures',
            'description' => 'Discover top-rated Krabi tours, excursions, and activities powered by AI. From adventure tours to beach experiences, find the perfect way to explore Thailand\'s natural wonder.',
            'keywords' => 'Krabi tours, adventure tours, beach tours, things to do in Krabi',
            'image' => 'https://ouqeoizufbofdqbuiwvx.supabase.co/storage/v1/object/public/destinations//Krabi.jpg'
        ],
        'koh-samui' => [
            'title' => 'Koh Samui Tours & Excursions - Top-Rated Activities & Adventures',
            'description' => 'Discover top-rated Koh Samui tours, excursions, and activities powered by AI. From beach tours to wellness experiences, find the perfect way to explore Thailand\'s island paradise.',
            'keywords' => 'Koh Samui tours, beach tours, island tours, things to do in Koh Samui',
            'image' => 'https://ouqeoizufbofdqbuiwvx.supabase.co/storage/v1/object/public/destinations//Koh%20Samui.jpg'
        ],
        'bali' => [
            'title' => 'Bali Tours & Excursions - Top-Rated Activities & Adventures',
            'description' => 'Discover top-rated Bali tours, excursions, and activities powered by AI. From temple tours to cultural experiences, find the perfect way to explore Indonesia\'s spiritual paradise.',
            'keywords' => 'Bali tours, temple tours, cultural tours, things to do in Bali',
            'image' => 'https://ouqeoizufbofdqbuiwvx.supabase.co/storage/v1/object/public/destinations//Bali.jpeg'
        ],
        'jakarta' => [
            'title' => 'Jakarta Tours & Excursions - Top-Rated Activities & Adventures',
            'description' => 'Discover top-rated Jakarta tours, excursions, and activities powered by AI. From city tours to cultural experiences, find the perfect way to explore Indonesia\'s dynamic capital.',
            'keywords' => 'Jakarta tours, city tours, cultural tours, things to do in Jakarta',
            'image' => 'https://ouqeoizufbofdqbuiwvx.supabase.co/storage/v1/object/public/destinations//Jakarta.jpg'
        ],
        'yogyakarta' => [
            'title' => 'Yogyakarta Tours & Excursions - Top-Rated Activities & Adventures',
            'description' => 'Discover top-rated Yogyakarta tours, excursions, and activities powered by AI. From temple tours to cultural experiences, find the perfect way to explore Indonesia\'s cultural heart.',
            'keywords' => 'Yogyakarta tours, temple tours, cultural tours, things to do in Yogyakarta',
            'image' => 'https://ouqeoizufbofdqbuiwvx.supabase.co/storage/v1/object/public/destinations//Yogyakarta.avif'
        ],
        'gili-islands' => [
            'title' => 'Gili Islands Tours & Excursions - Top-Rated Activities & Adventures',
            'description' => 'Discover top-rated Gili Islands tours, excursions, and activities powered by AI. From island tours to snorkeling experiences, find the perfect way to explore Indonesia\'s tropical paradise.',
            'keywords' => 'Gili Islands tours, island tours, snorkeling tours, things to do in Gili Islands',
            'image' => 'https://ouqeoizufbofdqbuiwvx.supabase.co/storage/v1/object/public/destinations//Gili%20Islands.jpg'
        ],
        'hanoi' => [
            'title' => 'Hanoi Tours & Excursions - Top-Rated Activities & Adventures',
            'description' => 'Discover top-rated Hanoi tours, excursions, and activities powered by AI. From cultural tours to food experiences, find the perfect way to explore Vietnam\'s historic capital.',
            'keywords' => 'Hanoi tours, cultural tours, food tours, things to do in Hanoi',
            'image' => 'https://ouqeoizufbofdqbuiwvx.supabase.co/storage/v1/object/public/destinations//Hanoi.webp'
        ],
        'ho-chi-minh-city' => [
            'title' => 'Ho Chi Minh City Tours & Excursions - Top-Rated Activities & Adventures',
            'description' => 'Discover top-rated Ho Chi Minh City tours, excursions, and activities powered by AI. From city tours to historic experiences, find the perfect way to explore Vietnam\'s dynamic metropolis.',
            'keywords' => 'Ho Chi Minh City tours, city tours, historic tours, things to do in Ho Chi Minh City',
            'image' => 'https://ouqeoizufbofdqbuiwvx.supabase.co/storage/v1/object/public/destinations//Ho%20Chi%20Minh%20City%20(Saigon).jpg'
        ],
        'hoi-an' => [
            'title' => 'Hoi An Tours & Excursions - Top-Rated Activities & Adventures',
            'description' => 'Discover top-rated Hoi An tours, excursions, and activities powered by AI. From cultural tours to historic experiences, find the perfect way to explore Vietnam\'s charming gem.',
            'keywords' => 'Hoi An tours, cultural tours, historic tours, things to do in Hoi An',
            'image' => 'https://ouqeoizufbofdqbuiwvx.supabase.co/storage/v1/object/public/destinations//Hoi%20An.jpg'
        ],
        'halong-bay' => [
            'title' => 'Halong Bay Tours & Excursions - Top-Rated Activities & Adventures',
            'description' => 'Discover top-rated Halong Bay tours, excursions, and activities powered by AI. From cruise tours to kayaking adventures, find the perfect way to explore Vietnam\'s marine paradise.',
            'keywords' => 'Halong Bay tours, cruise tours, kayaking tours, things to do in Halong Bay',
            'image' => 'https://ouqeoizufbofdqbuiwvx.supabase.co/storage/v1/object/public/destinations//Halong%20Bay.jpg'
        ],
        'kuala-lumpur' => [
            'title' => 'Kuala Lumpur Tours & Excursions - Top-Rated Activities & Adventures',
            'description' => 'Discover top-rated Kuala Lumpur tours, excursions, and activities powered by AI. From city tours to cultural experiences, find the perfect way to explore Malaysia\'s dynamic capital.',
            'keywords' => 'Kuala Lumpur tours, city tours, cultural tours, things to do in Kuala Lumpur',
            'image' => 'https://ouqeoizufbofdqbuiwvx.supabase.co/storage/v1/object/public/destinations//Kuala%20Lumpur.jpg'
        ],
        'langkawi' => [
            'title' => 'Langkawi Tours & Excursions - Top-Rated Activities & Adventures',
            'description' => 'Discover top-rated Langkawi tours, excursions, and activities powered by AI. From island tours to beach adventures, find the perfect way to explore Malaysia\'s tropical paradise.',
            'keywords' => 'Langkawi tours, island tours, beach tours, things to do in Langkawi',
            'image' => 'https://ouqeoizufbofdqbuiwvx.supabase.co/storage/v1/object/public/destinations//Langkawi.jpg'
        ],
        'penang' => [
            'title' => 'Penang Tours & Excursions - Top-Rated Activities & Adventures',
            'description' => 'Discover top-rated Penang tours, excursions, and activities powered by AI. From cultural tours to food experiences, find the perfect way to explore Malaysia\'s cultural heart.',
            'keywords' => 'Penang tours, cultural tours, food tours, things to do in Penang',
            'image' => 'https://ouqeoizufbofdqbuiwvx.supabase.co/storage/v1/object/public/destinations//Penang.jpg'
        ],
        'singapore' => [
            'title' => 'Singapore Tours & Excursions - Top-Rated Activities & Adventures',
            'description' => 'Discover top-rated Singapore tours, excursions, and activities powered by AI. From city tours to cultural experiences, find the perfect way to explore Asia\'s shining star.',
            'keywords' => 'Singapore tours, city tours, cultural tours, things to do in Singapore',
            'image' => 'https://ouqeoizufbofdqbuiwvx.supabase.co/storage/v1/object/public/destinations//Singapore.webp'
        ],
        'beijing' => [
            'title' => 'Beijing Tours & Excursions - Top-Rated Activities & Adventures',
            'description' => 'Discover top-rated Beijing tours, excursions, and activities powered by AI. From historic tours to Great Wall experiences, find the perfect way to explore China\'s ancient capital.',
            'keywords' => 'Beijing tours, historic tours, Great Wall tours, things to do in Beijing',
            'image' => 'https://ouqeoizufbofdqbuiwvx.supabase.co/storage/v1/object/public/destinations//Beijing.jpg'
        ],
        'shanghai' => [
            'title' => 'Shanghai Tours & Excursions - Top-Rated Activities & Adventures',
            'description' => 'Discover top-rated Shanghai tours, excursions, and activities powered by AI. From city tours to cultural experiences, find the perfect way to explore China\'s dynamic metropolis.',
            'keywords' => 'Shanghai tours, city tours, cultural tours, things to do in Shanghai',
            'image' => 'https://ouqeoizufbofdqbuiwvx.supabase.co/storage/v1/object/public/destinations//Shanghai.jpg'
        ],
        'xian' => [
            'title' => 'Xi\'an Tours & Excursions - Top-Rated Activities & Adventures',
            'description' => 'Discover top-rated Xi\'an tours, excursions, and activities powered by AI. From historic tours to archaeological experiences, find the perfect way to explore China\'s historic treasure.',
            'keywords' => 'Xi\'an tours, historic tours, terracotta warriors, things to do in Xi\'an',
            'image' => 'https://ouqeoizufbofdqbuiwvx.supabase.co/storage/v1/object/public/destinations//Xi%20an.jpg'
        ],
        'guilin' => [
            'title' => 'Guilin Tours & Excursions - Top-Rated Activities & Adventures',
            'description' => 'Discover top-rated Guilin tours, excursions, and activities powered by AI. From nature tours to river experiences, find the perfect way to explore China\'s scenic paradise.',
            'keywords' => 'Guilin tours, nature tours, Li River tours, things to do in Guilin',
            'image' => 'https://ouqeoizufbofdqbuiwvx.supabase.co/storage/v1/object/public/destinations//Guilin.jpg'
        ],
        'seoul' => [
            'title' => 'Seoul Tours & Excursions - Top-Rated Activities & Adventures',
            'description' => 'Discover top-rated Seoul tours, excursions, and activities powered by AI. From city tours to cultural experiences, find the perfect way to explore South Korea\'s dynamic capital.',
            'keywords' => 'Seoul tours, city tours, cultural tours, things to do in Seoul',
            'image' => 'https://ouqeoizufbofdqbuiwvx.supabase.co/storage/v1/object/public/destinations//Seoul.webp'
        ],
        'busan' => [
            'title' => 'Busan Tours & Excursions - Top-Rated Activities & Adventures',
            'description' => 'Discover top-rated Busan tours, excursions, and activities powered by AI. From cultural tours to beach experiences, find the perfect way to explore South Korea\'s coastal paradise.',
            'keywords' => 'Busan tours, cultural tours, beach tours, things to do in Busan',
            'image' => 'https://ouqeoizufbofdqbuiwvx.supabase.co/storage/v1/object/public/destinations//Busan.jpeg'
        ],
        'jeju-island' => [
            'title' => 'Jeju Island Tours & Excursions - Top-Rated Activities & Adventures',
            'description' => 'Discover top-rated Jeju Island tours, excursions, and activities powered by AI. From nature tours to volcano experiences, find the perfect way to explore South Korea\'s island paradise.',
            'keywords' => 'Jeju Island tours, nature tours, volcano tours, things to do in Jeju Island',
            'image' => 'https://ouqeoizufbofdqbuiwvx.supabase.co/storage/v1/object/public/destinations//Jeju%20Island.jpeg'
        ],
        'manila' => [
            'title' => 'Manila Tours & Excursions - Top-Rated Activities & Adventures',
            'description' => 'Discover top-rated Manila tours, excursions, and activities powered by AI. From historic tours to food experiences, find the perfect way to explore the Philippines\' vibrant capital.',
            'keywords' => 'Manila tours, cultural tours, historic tours, things to do in Manila',
            'image' => 'https://ouqeoizufbofdqbuiwvx.supabase.co/storage/v1/object/public/destinations//Manila.jpeg'
        ],
        'cebu' => [
            'title' => 'Cebu Tours & Excursions - Top-Rated Activities & Adventures',
            'description' => 'Discover top-rated Cebu tours, excursions, and activities powered by AI. From diving adventures to beach experiences, find the perfect way to explore this Philippine paradise.',
            'keywords' => 'Cebu tours, diving tours, beach tours, things to do in Cebu',
            'image' => 'https://ouqeoizufbofdqbuiwvx.supabase.co/storage/v1/object/public/destinations//Cebu.jpeg'
        ],
        'palawan' => [
            'title' => 'Palawan Tours & Excursions - Top-Rated Activities & Adventures',
            'description' => 'Discover top-rated Palawan tours, excursions, and activities powered by AI. From island hopping to cave exploration, find the perfect way to explore this natural paradise.',
            'keywords' => 'Palawan tours, island tours, nature tours, things to do in Palawan',
            'image' => 'https://ouqeoizufbofdqbuiwvx.supabase.co/storage/v1/object/public/destinations//Palawan.avif'
        ],
        'boracay' => [
            'title' => 'Boracay Tours & Excursions - Top-Rated Activities & Adventures',
            'description' => 'Discover top-rated Boracay tours, excursions, and activities powered by AI. From beach activities to water sports, find the perfect way to explore this tropical paradise.',
            'keywords' => 'Boracay tours, beach tours, water sports, things to do in Boracay',
            'image' => 'https://ouqeoizufbofdqbuiwvx.supabase.co/storage/v1/object/public/destinations//Boracay.jpeg'
        ],
        'new-delhi' => [
            'title' => 'New Delhi Tours & Excursions - Top-Rated Activities & Adventures',
            'description' => 'Discover top-rated New Delhi tours, excursions, and activities powered by AI. From historic tours to cultural experiences, find the perfect way to explore India\'s vibrant capital.',
            'keywords' => 'New Delhi tours, cultural tours, historic tours, things to do in New Delhi',
            'image' => 'https://ouqeoizufbofdqbuiwvx.supabase.co/storage/v1/object/public/destinations//New%20Delhi.jpeg'
        ],
        'jaipur' => [
            'title' => 'Jaipur Tours & Excursions - Top-Rated Activities & Adventures',
            'description' => 'Discover top-rated Jaipur tours, excursions, and activities powered by AI. From palace tours to cultural experiences, find the perfect way to explore the Pink City.',
            'keywords' => 'Jaipur tours, palace tours, fort tours, things to do in Jaipur',
            'image' => 'https://ouqeoizufbofdqbuiwvx.supabase.co/storage/v1/object/public/destinations//Jaipur.jpeg'
        ],
        'mumbai' => [
            'title' => 'Mumbai Tours & Excursions - Top-Rated Activities & Adventures',
            'description' => 'Discover top-rated Mumbai tours, excursions, and activities powered by AI. From Bollywood tours to cultural experiences, find the perfect way to explore India\'s financial capital.',
            'keywords' => 'Mumbai tours, Bollywood tours, cultural tours, things to do in Mumbai',
            'image' => 'https://ouqeoizufbofdqbuiwvx.supabase.co/storage/v1/object/public/destinations//Mumbai.jpeg'
        ],
        'goa' => [
            'title' => 'Goa Tours & Excursions - Top-Rated Activities & Adventures',
            'description' => 'Discover top-rated Goa tours, excursions, and activities powered by AI. From beach activities to cultural experiences, find the perfect way to explore India\'s beach paradise.',
            'keywords' => 'Goa tours, beach tours, cultural tours, things to do in Goa',
            'image' => 'https://ouqeoizufbofdqbuiwvx.supabase.co/storage/v1/object/public/destinations//Goa.jpg'
        ],
        'kerala' => [
            'title' => 'Kerala Tours & Excursions - Top-Rated Activities & Adventures',
            'description' => 'Discover top-rated Kerala tours, excursions, and activities powered by AI. From backwater cruises to cultural experiences, find the perfect way to explore God\'s Own Country.',
            'keywords' => 'Kerala tours, backwater tours, nature tours, things to do in Kerala',
            'image' => 'https://ouqeoizufbofdqbuiwvx.supabase.co/storage/v1/object/public/destinations//Kerala.jpeg'
        ],
        'sydney' => [
            'title' => 'Sydney Tours & Excursions - Top-Rated Activities & Adventures',
            'description' => 'Discover top-rated Sydney tours, excursions, and activities powered by AI. From harbor cruises to city experiences, find the perfect way to explore Australia\'s iconic city.',
            'keywords' => 'Sydney tours, harbor tours, city tours, things to do in Sydney',
            'image' => 'https://ouqeoizufbofdqbuiwvx.supabase.co/storage/v1/object/public/destinations//Sydney.jpg'
        ],
        'melbourne' => [
            'title' => 'Melbourne Tours & Excursions - Top-Rated Activities & Adventures',
            'description' => 'Discover top-rated Melbourne tours, excursions, and activities powered by AI. From food experiences to cultural tours, find the perfect way to explore Australia\'s cultural capital.',
            'keywords' => 'Melbourne tours, food tours, cultural tours, things to do in Melbourne',
            'image' => 'https://ouqeoizufbofdqbuiwvx.supabase.co/storage/v1/object/public/destinations//Sydney.jpg'
        ],
        'cairns' => [
            'title' => 'Cairns Tours & Excursions - Top-Rated Activities & Adventures',
            'description' => 'Discover top-rated Cairns tours, excursions, and activities powered by AI. From Great Barrier Reef experiences to rainforest adventures, find the perfect way to explore Australia\'s adventure capital.',
            'keywords' => 'Cairns tours, Great Barrier Reef tours, rainforest tours, things to do in Cairns',
            'image' => 'https://ouqeoizufbofdqbuiwvx.supabase.co/storage/v1/object/public/destinations//Cairns%20(Great%20Barrier%20Reef).jpg'
        ],
        'gold-coast' => [
            'title' => 'Gold Coast Tours & Excursions - Top-Rated Activities & Adventures',
            'description' => 'Discover top-rated Gold Coast tours, excursions, and activities powered by AI. From surfing experiences to theme park adventures, find the perfect way to explore Australia\'s entertainment capital.',
            'keywords' => 'Gold Coast tours, surfing tours, theme park tours, things to do in Gold Coast',
            'image' => 'https://ouqeoizufbofdqbuiwvx.supabase.co/storage/v1/object/public/destinations//Gold%20Coast.png'
        ],
        'perth' => [
            'title' => 'Perth Tours & Excursions - Top-Rated Activities & Adventures',
            'description' => 'Discover top-rated Perth tours, excursions, and activities powered by AI. From city experiences to wine region tours, find the perfect way to explore Australia\'s western capital.',
            'keywords' => 'Perth tours, city tours, wine tours, things to do in Perth',
            'image' => 'https://ouqeoizufbofdqbuiwvx.supabase.co/storage/v1/object/public/destinations//Perth.jpeg'
        ],
        'auckland' => [
            'title' => 'Auckland Tours & Excursions - Top-Rated Activities & Adventures',
            'description' => 'Discover top-rated Auckland tours, excursions, and activities powered by AI. From harbor cruises to volcanic adventures, find the perfect way to explore New Zealand\'s largest city.',
            'keywords' => 'Auckland tours, harbor tours, volcanic tours, things to do in Auckland',
            'image' => 'https://ouqeoizufbofdqbuiwvx.supabase.co/storage/v1/object/public/destinations//Auckland.webp'
        ],
        'queenstown' => [
            'title' => 'Queenstown Tours & Excursions - Top-Rated Activities & Adventures',
            'description' => 'Discover top-rated Queenstown tours, excursions, and activities powered by AI. From adventure experiences to scenic tours, find the perfect way to explore New Zealand\'s adventure capital.',
            'keywords' => 'Queenstown tours, adventure tours, skiing tours, things to do in Queenstown',
            'image' => 'https://ouqeoizufbofdqbuiwvx.supabase.co/storage/v1/object/public/destinations//Queenstown.jpg'
        ],
        'rotorua' => [
            'title' => 'Rotorua Tours & Excursions - Top-Rated Activities & Adventures',
            'description' => 'Discover top-rated Rotorua tours, excursions, and activities powered by AI. From geothermal experiences to cultural tours, find the perfect way to explore New Zealand\'s cultural heart.',
            'keywords' => 'Rotorua tours, geothermal tours, cultural tours, things to do in Rotorua',
            'image' => 'https://ouqeoizufbofdqbuiwvx.supabase.co/storage/v1/object/public/destinations//Rotorua.jpg'
        ],
        'wellington' => [
            'title' => 'Wellington Tours & Excursions - Top-Rated Activities & Adventures',
            'description' => 'Discover top-rated Wellington tours, excursions, and activities powered by AI. From cultural experiences to food tours, find the perfect way to explore New Zealand\'s creative capital.',
            'keywords' => 'Wellington tours, cultural tours, food tours, things to do in Wellington',
            'image' => 'https://ouqeoizufbofdqbuiwvx.supabase.co/storage/v1/object/public/destinations//Wellington%20australia.webp'
        ],
        'nadi' => [
            'title' => 'Nadi Tours & Excursions - Top-Rated Activities & Adventures',
            'description' => 'Discover top-rated Nadi tours, excursions, and activities powered by AI. From island experiences to cultural tours, find the perfect way to explore Fiji\'s gateway city.',
            'keywords' => 'Nadi tours, island tours, cultural tours, things to do in Nadi',
            'image' => 'https://ouqeoizufbofdqbuiwvx.supabase.co/storage/v1/object/public/destinations//Nadi.webp'
        ],
        'denarau-island' => [
            'title' => 'Denarau Island Tours & Excursions - Top-Rated Activities & Adventures',
            'description' => 'Discover top-rated Denarau Island tours, excursions, and activities powered by AI. From luxury experiences to golf tours, find the perfect way to explore Fiji\'s upscale paradise.',
            'keywords' => 'Denarau Island tours, luxury tours, golf tours, things to do in Denarau Island',
            'image' => 'https://ouqeoizufbofdqbuiwvx.supabase.co/storage/v1/object/public/destinations//Denarau%20Island.jpg'
        ],
        'mamanuca-islands' => [
            'title' => 'Mamanuca Islands Tours & Excursions - Top-Rated Activities & Adventures',
            'description' => 'Discover top-rated Mamanuca Islands tours, excursions, and activities powered by AI. From island experiences to snorkeling adventures, find the perfect way to explore Fiji\'s island paradise.',
            'keywords' => 'Mamanuca Islands tours, island tours, snorkeling tours, things to do in Mamanuca Islands',
            'image' => 'https://ouqeoizufbofdqbuiwvx.supabase.co/storage/v1/object/public/destinations//Mamanuca%20Islands.jpg'
        ],
        'bora-bora' => [
            'title' => 'Bora Bora Tours & Excursions - Top-Rated Activities & Adventures',
            'description' => 'Discover top-rated Bora Bora tours, excursions, and activities powered by AI. From luxury experiences to snorkeling adventures, find the perfect way to explore the world\'s most romantic island.',
            'keywords' => 'Bora Bora tours, luxury tours, snorkeling tours, things to do in Bora Bora',
            'image' => 'https://ouqeoizufbofdqbuiwvx.supabase.co/storage/v1/object/public/destinations//Bora%20Bora.webp'
        ],
        'tahiti' => [
            'title' => 'Tahiti Tours & Excursions - Top-Rated Activities & Adventures',
            'description' => 'Discover top-rated Tahiti tours, excursions, and activities powered by AI. From cultural experiences to nature adventures, find the perfect way to explore French Polynesia\'s heart.',
            'keywords' => 'Tahiti tours, cultural tours, nature tours, things to do in Tahiti',
            'image' => 'https://ouqeoizufbofdqbuiwvx.supabase.co/storage/v1/object/public/destinations//Tahiti.avif'
        ],
        'moorea' => [
            'title' => 'Moorea Tours & Excursions - Top-Rated Activities & Adventures',
            'description' => 'Discover top-rated Moorea tours, excursions, and activities powered by AI. From nature adventures to cultural experiences, find the perfect way to explore French Polynesia\'s natural wonder.',
            'keywords' => 'Moorea tours, nature tours, adventure tours, things to do in Moorea',
            'image' => 'https://ouqeoizufbofdqbuiwvx.supabase.co/storage/v1/object/public/destinations//Moorea.webp'
        ],
        'cape-town' => [
            'title' => 'Cape Town Tours & Excursions - Top-Rated Activities & Adventures',
            'description' => 'Discover top-rated Cape Town tours, excursions, and activities powered by AI. From Table Mountain adventures to wine region experiences, find the perfect way to explore South Africa\'s most beautiful city.',
            'keywords' => 'Cape Town tours, Table Mountain tours, wine tours, things to do in Cape Town',
            'image' => 'https://ouqeoizufbofdqbuiwvx.supabase.co/storage/v1/object/public/destinations//cape%20Town.jpg'
        ],
        'johannesburg' => [
            'title' => 'Johannesburg Tours & Excursions - Top-Rated Activities & Adventures',
            'description' => 'Discover top-rated Johannesburg tours, excursions, and activities powered by AI. From historical experiences to cultural tours, find the perfect way to explore South Africa\'s largest city.',
            'keywords' => 'Johannesburg tours, Soweto tours, historical tours, things to do in Johannesburg',
            'image' => 'https://ouqeoizufbofdqbuiwvx.supabase.co/storage/v1/object/public/destinations//Johannesburg.webp'
        ],
        'kruger-national-park' => [
            'title' => 'Kruger National Park Tours & Safaris - Top-Rated Wildlife Adventures',
            'description' => 'Discover top-rated Kruger National Park tours, safaris, and wildlife experiences powered by AI. From Big Five encounters to luxury lodge stays, find the perfect way to explore Africa\'s premier wildlife destination.',
            'keywords' => 'Kruger National Park tours, safari tours, Big Five tours, things to do in Kruger',
            'image' => 'https://ouqeoizufbofdqbuiwvx.supabase.co/storage/v1/object/public/destinations//Kruger%20National%20Park.jpg'
        ],
        'cairo' => [
            'title' => 'Cairo Tours & Excursions - Top-Rated Activities & Adventures',
            'description' => 'Discover top-rated Cairo tours, excursions, and activities powered by AI. From pyramid experiences to cultural tours, find the perfect way to explore Egypt\'s ancient capital.',
            'keywords' => 'Cairo tours, pyramid tours, Egyptian Museum tours, things to do in Cairo',
            'image' => 'https://ouqeoizufbofdqbuiwvx.supabase.co/storage/v1/object/public/destinations//Cairo.jpg'
        ],
        'luxor' => [
            'title' => 'Luxor Tours & Excursions - Top-Rated Activities & Adventures',
            'description' => 'Discover top-rated Luxor tours, excursions, and activities powered by AI. From temple experiences to archaeological tours, find the perfect way to explore Egypt\'s ancient capital.',
            'keywords' => 'Luxor tours, temple tours, Valley of the Kings tours, things to do in Luxor',
            'image' => 'https://ouqeoizufbofdqbuiwvx.supabase.co/storage/v1/object/public/destinations//Luxor.jpg'
        ],
        'aswan' => [
            'title' => 'Aswan Tours & Excursions - Top-Rated Activities & Adventures',
            'description' => 'Discover top-rated Aswan tours, excursions, and activities powered by AI. From temple experiences to Nile cruises, find the perfect way to explore Egypt\'s southern gateway.',
            'keywords' => 'Aswan tours, temple tours, Nile cruises, things to do in Aswan',
            'image' => 'https://ouqeoizufbofdqbuiwvx.supabase.co/storage/v1/object/public/destinations//Aswan.jpg'
        ],
        'marrakech' => [
            'title' => 'Marrakech Tours & Excursions - Top-Rated Activities & Adventures',
            'description' => 'Discover top-rated Marrakech tours, excursions, and activities powered by AI. From medina experiences to palace tours, find the perfect way to explore Morocco\'s magical city.',
            'keywords' => 'Marrakech tours, medina tours, palace tours, things to do in Marrakech',
            'image' => 'https://ouqeoizufbofdqbuiwvx.supabase.co/storage/v1/object/public/destinations//Marrakech.webp'
        ],
        'fes' => [
            'title' => 'Fes Tours & Excursions - Top-Rated Activities & Adventures',
            'description' => 'Discover top-rated Fes tours, excursions, and activities powered by AI. From medina experiences to cultural tours, find the perfect way to explore Morocco\'s cultural capital.',
            'keywords' => 'Fes tours, medina tours, historical tours, things to do in Fes',
            'image' => 'https://ouqeoizufbofdqbuiwvx.supabase.co/storage/v1/object/public/destinations//Fes.webp'
        ],
        'casablanca' => [
            'title' => 'Casablanca Tours & Excursions - Top-Rated Activities & Adventures',
            'description' => 'Discover top-rated Casablanca tours, excursions, and activities powered by AI. From mosque experiences to city tours, find the perfect way to explore Morocco\'s economic hub.',
            'keywords' => 'Casablanca tours, mosque tours, city tours, things to do in Casablanca',
            'image' => 'https://ouqeoizufbofdqbuiwvx.supabase.co/storage/v1/object/public/destinations//Casablanca.webp'
        ],
        'nairobi' => [
            'title' => 'Nairobi Tours & Excursions - Top-Rated Activities & Adventures',
            'description' => 'Discover top-rated Nairobi tours, excursions, and activities powered by AI. From wildlife experiences to city tours, find the perfect way to explore Kenya\'s vibrant capital.',
            'keywords' => 'Nairobi tours, wildlife tours, city tours, things to do in Nairobi',
            'image' => 'https://ouqeoizufbofdqbuiwvx.supabase.co/storage/v1/object/public/destinations//Nairobi.webp'
        ],
        'maasai-mara' => [
            'title' => 'Maasai Mara Tours & Safaris - Top-Rated Wildlife Adventures',
            'description' => 'Discover top-rated Maasai Mara tours, safaris, and wildlife experiences powered by AI. From Great Migration encounters to Big Five sightings, find the perfect way to explore Kenya\'s premier wildlife destination.',
            'keywords' => 'Maasai Mara tours, safari tours, Great Migration tours, things to do in Maasai Mara',
            'image' => 'https://ouqeoizufbofdqbuiwvx.supabase.co/storage/v1/object/public/destinations//Maasai%20Mara.jpeg'
        ],
        'mombasa' => [
            'title' => 'Mombasa Tours & Excursions - Top-Rated Activities & Adventures',
            'description' => 'Discover top-rated Mombasa tours, excursions, and activities powered by AI. From beach experiences to cultural tours, find the perfect way to explore Kenya\'s coastal paradise.',
            'keywords' => 'Mombasa tours, beach tours, historical tours, things to do in Mombasa',
            'image' => 'https://ouqeoizufbofdqbuiwvx.supabase.co/storage/v1/object/public/destinations//Mombasa.jpg'
        ],
        'arusha' => [
            'title' => 'Arusha Tours & Excursions - Top-Rated Activities & Adventures',
            'description' => 'Discover top-rated Arusha tours, excursions, and activities powered by AI. From safari experiences to cultural tours, find the perfect way to explore Tanzania\'s adventure hub.',
            'keywords' => 'Arusha tours, safari tours, national park tours, things to do in Arusha',
            'image' => 'https://ouqeoizufbofdqbuiwvx.supabase.co/storage/v1/object/public/destinations//Arusha.jpg'
        ],
        'zanzibar' => [
            'title' => 'Zanzibar Tours & Excursions - Top-Rated Activities & Adventures',
            'description' => 'Discover top-rated Zanzibar tours, excursions, and activities powered by AI. From Stone Town experiences to beach tours, find the perfect way to explore Tanzania\'s tropical paradise.',
            'keywords' => 'Zanzibar tours, Stone Town tours, beach tours, things to do in Zanzibar',
            'image' => 'https://ouqeoizufbofdqbuiwvx.supabase.co/storage/v1/object/public/destinations//Zanzibar.jpg'
        ],
        'swakopmund' => [
            'title' => 'Swakopmund Tours & Excursions - Top-Rated Activities & Adventures',
            'description' => 'Discover top-rated Swakopmund tours, excursions, and activities powered by AI. From desert experiences to city tours, find the perfect way to explore Namibia\'s adventure capital.',
            'keywords' => 'Swakopmund tours, desert tours, adventure tours, things to do in Swakopmund',
            'image' => 'https://ouqeoizufbofdqbuiwvx.supabase.co/storage/v1/object/public/destinations//Swakopmund.jpg'
        ],
        'etosha-national-park' => [
            'title' => 'Etosha National Park Tours & Safaris - Top-Rated Wildlife Adventures',
            'description' => 'Discover top-rated Etosha National Park tours, safaris, and wildlife experiences powered by AI. From Big Five encounters to salt pan experiences, find the perfect way to explore Namibia\'s premier wildlife destination.',
            'keywords' => 'Etosha National Park tours, safari tours, wildlife tours, things to do in Etosha',
            'image' => 'https://ouqeoizufbofdqbuiwvx.supabase.co/storage/v1/object/public/destinations//Etosha%20National%20Park.jpeg'
        ],
        'mauritius' => [
            'title' => 'Mauritius Tours & Excursions - Top-Rated Activities & Adventures',
            'description' => 'Discover top-rated Mauritius tours, excursions, and activities powered by AI. From beach experiences to island tours, find the perfect way to explore the Indian Ocean\'s paradise.',
            'keywords' => 'Mauritius tours, beach tours, island tours, things to do in Mauritius',
            'image' => 'https://ouqeoizufbofdqbuiwvx.supabase.co/storage/v1/object/public/destinations//Mauritius.jpeg'
        ],
    ];
    return $destinations[$destination_id] ?? null;
}
?>