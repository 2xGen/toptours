/**
 * Seed Medellin baby equipment rentals page data
 * Based on BabyQuip content provided by user
 *
 * Usage:
 *   node scripts/seed-baby-equipment-rentals-medellin.js
 *
 * Requirements:
 *   - .env.local (or environment) must define:
 *       NEXT_PUBLIC_SUPABASE_URL (or SUPABASE_URL)
 *       SUPABASE_SERVICE_ROLE_KEY
 */

import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { createClient } from '@supabase/supabase-js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '../.env.local') });

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error('❌ Missing Supabase credentials. Please set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY.');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

const medellinData = {
  destination_id: 'medellin',
  hero_title: 'Baby Equipment Rentals in Medellin',
  hero_description: 'Families and little ones adore Medellin. Don\'t want to lug all your baby gear? No problem, we\'re here to help!',
  hero_tagline: 'Families and little ones adore Medellin. Don\'t want to lug all your baby gear? No problem, we\'re here to help!',
  
  // Product Categories - Based on available content for Medellin
  product_categories: [
    {
      name: 'Cribs & Sleep',
      icon: '🛏️',
      description: 'Full-size cribs, pack n plays, bassinets, and sleep essentials to ensure your little one gets a good night\'s rest.',
      enabled: true,
    },
    {
      name: 'Strollers & Wagons',
      icon: '🛴',
      description: 'Lightweight strollers, jogging strollers, and wagons perfect for exploring Medellin with ease and comfort.',
      enabled: true,
    },
    {
      name: 'Car Seats',
      icon: '🚗',
      description: 'Safe and certified car seats for infants and toddlers, including convertible car seats, delivered directly to your rental location or hotel.',
      enabled: true,
    },
    {
      name: 'High Chairs & Mealtime',
      icon: '🍽️',
      description: 'High chairs, booster seats, and feeding accessories to make dining with your family comfortable and convenient.',
      enabled: true,
    },
    {
      name: 'Beach & Outdoor Gear',
      icon: '🏖️',
      description: 'Beach tents, sand toys, outdoor play equipment, and seasonal gear for family fun outdoors.',
      enabled: true,
    },
    {
      name: 'Health & Safety Gear',
      icon: '🏥',
      description: 'Baby gates, outlet covers, monitors, and safety essentials to keep your child safe and secure.',
      enabled: true,
    },
    {
      name: 'Activity & Entertainment',
      icon: '🎮',
      description: 'Bouncers, swings, play mats, and entertainment items to keep your little one happy and engaged.',
      enabled: true,
    },
    {
      name: 'Monitor Gear',
      icon: '📱',
      description: 'Audio and video baby monitors to stay connected with your baby while relaxing during your vacation.',
      enabled: true,
    },
    {
      name: 'Diapering & Bathing',
      icon: '🛁',
      description: 'Changing pads, bath tubs, and diapering essentials to make daily routines stress-free on the go.',
      enabled: true,
    },
    {
      name: 'Toys, Books & Games',
      icon: '🧸',
      description: 'Age-appropriate toys, books, and games to keep your child entertained during travel and downtime.',
      enabled: true,
    },
    {
      name: 'Pet Gear',
      icon: '🐾',
      description: 'Travel-friendly pet gear and accessories for your furry family members during your Medellin vacation.',
      enabled: true,
    },
  ],
  
  intro_text: 'Rates vary by provider and availability, and exclude taxes, delivery, and additional fees.',
  rates_note: 'Rates vary by provider and availability, and exclude taxes, delivery, and additional fees.',
  
  // FAQs specific to Medellin
  faqs: [
    {
      question: 'Are baby gear items cleaned before they are rented?',
      answer: 'Yes! We require that all BabyQuip Quality Providers meticulously clean all of their baby equipment from top to bottom. Babies\' immune systems are still developing and we understand that you as parents or grandparents rightfully expect clean and sanitized products. Baby gear is inspected and cleaned after every pickup and then inspected and sanitized again before the next delivery. All cleaners used are organic/non-toxic. Read about our cleaning standards for more information.',
    },
    {
      question: 'Does BabyQuip deliver baby gear?',
      answer: 'Quality Providers serve hundreds of locations across the US, Canada, Mexico, Caribbean, Australia & New Zealand. They deliver to hotels, airbnbs, vacation rentals, private residences and even the airport. (Please note that delivery rates vary by location and provider.)',
    },
    {
      question: 'Are the car seats that BabyQuip rents new or used?',
      answer: 'All providers are required to purchase car seats new or rent ones that have been purchased new for their own children that have not been dropped or involved in an automobile accident. All car safety seats have an expiration date and are not allowed to be rented (and are discarded) after the date has passed or if the seat has been involved in a car crash.',
    },
    {
      question: 'How much does it cost to rent a crib in Medellin?',
      answer: 'Rental prices vary from location to location and among Quality Providers, but cribs and other sleep solutions (including mini cribs and pack \'n plays) range from $12-$22 per day.',
    },
    {
      question: 'How do I get my baby to sleep well on vacation in Medellin?',
      answer: 'In order to expect your baby to sleep well on vacation, you need to create an atmosphere similar to home. If your baby regularly sleeps in a full sized crib, it\'s not likely that they will sleep well in a pack \'n play on vacation. Rent the gear you need to create a familiar environment.',
    },
  ],
  
  // Pricing info - Based on content: Convertible Car Seat From $10/day, Full-Size Crib From $18/day
  pricing_info: {
    crib_min: 18,
    crib_max: 22,
    car_seat_min: 10,
    car_seat_max: null,
    currency: '$',
    note: 'Rates vary by provider and availability, and exclude taxes, delivery, and additional fees.',
  },
  
  // SEO
  seo_title: 'Baby Equipment Rentals in Medellin | TopTours.ai',
  seo_description: 'Rent baby equipment in Medellin: strollers, car seats, cribs, and more delivered to your hotel or vacation rental. Clean, safe, and insured gear from BabyQuip.',
  seo_keywords: [
    'baby equipment rental Medellin',
    'baby gear rental Medellin',
    'stroller rental Medellin',
    'car seat rental Medellin',
    'crib rental Medellin',
    'baby equipment Medellin',
    'baby gear rental Colombia',
    'baby equipment rental Medellin Colombia',
  ],
  
  is_active: true,
};

async function seedMedellin() {
  try {
    console.log('🌱 Seeding Medellin baby equipment rentals data...');
    
    // Upsert data into Supabase
    const { data, error } = await supabase
      .from('baby_equipment_rentals')
      .upsert({
        destination_id: medellinData.destination_id.toLowerCase(),
        hero_title: medellinData.hero_title || null,
        hero_description: medellinData.hero_description || null,
        hero_tagline: medellinData.hero_tagline || null,
        product_categories: medellinData.product_categories ? JSON.parse(JSON.stringify(medellinData.product_categories)) : null,
        intro_text: medellinData.intro_text || null,
        rates_note: medellinData.rates_note || null,
        faqs: medellinData.faqs ? JSON.parse(JSON.stringify(medellinData.faqs)) : null,
        pricing_info: medellinData.pricing_info ? JSON.parse(JSON.stringify(medellinData.pricing_info)) : null,
        seo_title: medellinData.seo_title || null,
        seo_description: medellinData.seo_description || null,
        seo_keywords: medellinData.seo_keywords || null,
        is_active: medellinData.is_active !== undefined ? medellinData.is_active : true,
      }, {
        onConflict: 'destination_id',
      })
      .select()
      .single();
    
    if (error) {
      console.error('❌ Error seeding Medellin data:', error);
      console.error('Error details:', JSON.stringify(error, null, 2));
      process.exit(1);
    }
    
    console.log('✅ Successfully seeded Medellin baby equipment rentals!');
    console.log('📝 Data:', JSON.stringify(data, null, 2));
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding Medellin data:', error);
    console.error('Stack:', error.stack);
    process.exit(1);
  }
}

seedMedellin();
