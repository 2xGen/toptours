-- Fix existing NYC subcategories that had only 1 tour (min 2, max 3).
-- Run in Supabase SQL editor after main schema/seed. Safe to run multiple times.

-- Broadway: give food-and-drink and museum-of-broadway each 2 tours (move one from show-tickets, one from walking-tours)
UPDATE v3_landing_category_subcategories
SET product_ids = '["279763P1","7387P4"]'::jsonb,
    title = 'Broadway food and drink tours',
    description = 'The Boozy Broadway Walking Tour and Broadway Musical Theater Walking Tour. Cocktails and theater history. Ages 21+ for alcohol. Book with trusted partners.'
WHERE destination_slug = 'new-york-city' AND category_slug = 'broadway-shows' AND slug = 'food-and-drink-tours';

UPDATE v3_landing_category_subcategories
SET product_ids = '["3242P203","3242P185"]'::jsonb,
    title = 'Museum of Broadway & Harry Potter',
    description = 'Museum of Broadway and Harry Potter and the Cursed Child on Broadway. Museum visit and show ticket options. Book with trusted partners.'
WHERE destination_slug = 'new-york-city' AND category_slug = 'broadway-shows' AND slug = 'museum-of-broadway';

UPDATE v3_landing_category_subcategories
SET product_ids = '["3242P272","3242P281","3242P256"]'::jsonb
WHERE destination_slug = 'new-york-city' AND category_slug = 'broadway-shows' AND slug = 'show-tickets';

UPDATE v3_landing_category_subcategories
SET product_ids = '["5542306P1","41377P37"]'::jsonb
WHERE destination_slug = 'new-york-city' AND category_slug = 'broadway-shows' AND slug = 'walking-tours';

-- Food: chelsea 2, chinatown 2, east-village 2 (reassign so no subcategory has 1)
UPDATE v3_landing_category_subcategories
SET product_ids = '["420790P2","420790P3"]'::jsonb,
    title = 'Chelsea Market, High Line & NoLita',
    description = 'Chelsea Market food tour and High Line Park; NoLita past and present food and history. Compare and book.'
WHERE destination_slug = 'new-york-city' AND category_slug = 'food-tours' AND slug = 'chelsea-market-high-line';

UPDATE v3_landing_category_subcategories
SET product_ids = '["5620443P2","36720P6"]'::jsonb
WHERE destination_slug = 'new-york-city' AND category_slug = 'food-tours' AND slug = 'chinatown-asian-food';

UPDATE v3_landing_category_subcategories
SET product_ids = '["172715P3","5609990P8"]'::jsonb,
    title = 'East Village & NoLita food tours',
    description = 'East Village food tour; Southeast Asian and Chinese food tour in NYC. Compare and book.'
WHERE destination_slug = 'new-york-city' AND category_slug = 'food-tours' AND slug = 'east-village-nolita';

-- Statue of Liberty: day-trips-sightseeing 2 tours
UPDATE v3_landing_category_subcategories
SET product_ids = '["455890P1","255730P146"]'::jsonb,
    title = 'Day trips & sightseeing with Statue of Liberty',
    description = 'NYC sightseeing day trip with Statue of Liberty visit; NYC in a Day private walking tour with the Statue of Liberty. Compare and book.'
WHERE destination_slug = 'new-york-city' AND category_slug = 'statue-of-liberty-harbor' AND slug = 'day-trips-sightseeing';

-- Night & Skyline: night-sailboat-cruise 2 tours
UPDATE v3_landing_category_subcategories
SET product_ids = '["6288P49","6390P14"]'::jsonb,
    title = 'Night sailboat & boat cruises',
    description = 'NYC skyline night sailboat tour and panoramic Brooklyn and New Jersey waterfront night tour. Compare and book.'
WHERE destination_slug = 'new-york-city' AND category_slug = 'night-skyline' AND slug = 'night-sailboat-cruise';

-- Central Park: merge running + yoga into one subcategory; remove family-tours and yoga-in-central-park so we have 6 subcategories with 2–3 each
UPDATE v3_landing_category_subcategories
SET slug = 'running-and-yoga',
    title = 'Central Park running and yoga',
    description = 'Central Park highlights running tour; walking tour with yoga; yoga class with a view. Active and mindful experiences. Book with free cancellation.',
    product_ids = '["22253P4","22253P1","359827P1"]'::jsonb,
    about = 'Running and yoga experiences in Central Park: guided running tour, walking tour with yoga, and yoga class with skyline views.',
    why_book = 'Combine sightseeing with a run or yoga for an active, mindful way to see the park.',
    what_to_expect = '["Meet your guide or instructor.","Run or practice yoga in the park.","Duration varies; running about 5K, yoga 1–1.5 hours."]'::jsonb,
    summary_paragraph = 'The best Central Park running and yoga experiences: guided running tour, walking with yoga, and yoga class with a view.'
WHERE destination_slug = 'new-york-city' AND category_slug = 'central-park-tours' AND slug = 'running-tours';

DELETE FROM v3_landing_category_subcategories
WHERE destination_slug = 'new-york-city' AND category_slug = 'central-park-tours' AND slug IN ('family-tours', 'yoga-in-central-park');
