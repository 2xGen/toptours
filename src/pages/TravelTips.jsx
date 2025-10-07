"use client";
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { BookOpen, Clock, User, ArrowRight, Search, TrendingUp, Calendar, Tag } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import BlueCTASection from '@/components/ui/blue-cta-section';
import { Helmet } from 'react-helmet';

const TravelTips = ({ onOpenModal }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [travelGuides, setTravelGuides] = useState([]);

  // Scroll to top when component mounts
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const categories = ['All', 'General Travel Tips', 'Caribbean', 'Europe', 'North America', 'Asia-Pacific', 'Africa', 'South America'];

  // Blog posts data
  const sampleGuides = [
    {
      id: 'ai-travel-planning-guide',
      title: 'How to Plan a Trip with AI: The Future of Smart Travel',
      excerpt: 'Discover how AI trip planners revolutionize travel planning with personalized recommendations, smart itineraries, and automated booking. The complete guide to AI-powered smart travel planning.',
      content: 'The travel industry is experiencing a revolution, and artificial intelligence is at its forefront...',
      category: 'General Travel Tips',
      readTime: '12 min read',
      publishDate: '2024-01-20',
      author: 'AI Travel Expert',
      image: 'https://ouqeoizufbofdqbuiwvx.supabase.co/storage/v1/object/public/blogs/How%20to%20Plan%20a%20Trip%20with%20AI.png',
      tags: ['AI Trip Planner', 'Smart Travel Planning', 'AI Travel Assistant'],
      featured: true,
      type: 'evergreen',
      wordCount: 1200,
      internalLinks: ['/how-it-works', '/destinations/aruba', '/destinations/paris', '/travel-guides/how-to-choose-a-tour'],
      relatedDestination: null
    },
    {
      id: 'travel-mistakes-to-avoid',
      title: '10 Common Mistakes Travelers Make (and How to Avoid Them)',
      excerpt: 'Discover the 10 most common travel mistakes and learn how to avoid them. Make every trip smoother, smarter, and stress-free with these expert travel insights.',
      content: 'Even experienced travelers can fall into common traps that make a trip more stressful or expensive than it needs to be...',
      category: 'General Travel Tips',
      readTime: '8 min read',
      publishDate: '2024-01-25',
      author: 'Travel Expert',
      image: 'https://ouqeoizufbofdqbuiwvx.supabase.co/storage/v1/object/public/blogs/10%20Common%20Mistakes%20Travelers%20Make%20and%20How%20to%20Avoid%20Them.png',
      tags: ['Travel Mistakes', 'Travel Tips', 'Travel Advice'],
      featured: true,
      type: 'evergreen',
      wordCount: 1000,
      internalLinks: ['/destinations', '/destinations/aruba', '/destinations/amsterdam', '/travel-guides/when-to-book-tours'],
      relatedDestination: null
    },
    {
      id: 'when-to-book-tours',
      title: 'Best Time to Book Tours and Activities for the Lowest Prices',
      excerpt: 'Discover the best time to book tours and activities for the lowest prices. Learn when to book tours, find tour discounts, and save money on your vacation.',
      content: 'Booking tours and activities can often feel like a balancing act. You want to secure your spot while also getting the best possible price...',
      category: 'General Travel Tips',
      readTime: '7 min read',
      publishDate: '2024-01-30',
      author: 'Travel Expert',
      image: 'https://ouqeoizufbofdqbuiwvx.supabase.co/storage/v1/object/public/blogs/Best%20Time%20to%20Book%20Tours%20and%20Activities.png',
      tags: ['Tour Booking', 'Travel Savings', 'Vacation Tips'],
      featured: false,
      type: 'evergreen',
      wordCount: 900,
      internalLinks: ['/destinations', '/destinations/aruba', '/travel-guides/travel-mistakes-to-avoid'],
      relatedDestination: null
    },
    {
      id: 'how-to-choose-a-tour',
      title: 'How to Choose the Best Tour for Your Next Vacation',
      excerpt: 'Learn how to choose the best tour for your vacation. Compare guided tours vs private tours, find the right tour types, and discover tips for selecting the perfect excursion.',
      content: 'Choosing the perfect tour can be overwhelming. With so many options, from guided city tours to private adventures...',
      category: 'General Travel Tips',
      readTime: '6 min read',
      publishDate: '2024-02-05',
      author: 'Travel Expert',
      image: 'https://ouqeoizufbofdqbuiwvx.supabase.co/storage/v1/object/public/blogs/How%20to%20Choose%20the%20Best%20Tour%20for%20Your%20Next%20Vacation.png',
      tags: ['Tour Selection', 'Guided Tours', 'Vacation Planning'],
      featured: true,
      type: 'evergreen',
      wordCount: 800,
      internalLinks: ['/destinations', '/destinations/aruba'],
      relatedDestination: null
    },
    {
      id: 'beach-vacation-packing-list',
      title: 'What to Pack for a Beach Vacation: The Ultimate Checklist',
      excerpt: 'Get the ultimate beach vacation packing checklist with essential items, beach gear, and travel tips. Discover what to pack for a perfect beach vacation.',
      content: 'Packing for a beach vacation can make or break your trip. Whether you\'re heading to the Caribbean, Mediterranean, or tropical paradise...',
      category: 'General Travel Tips',
      readTime: '8 min read',
      publishDate: '2024-02-10',
      author: 'Travel Expert',
      image: 'https://ouqeoizufbofdqbuiwvx.supabase.co/storage/v1/object/public/blogs/What%20to%20Pack%20for%20a%20Beach%20Vacation.png',
      tags: ['Beach Packing', 'Vacation Essentials', 'Travel Tips'],
      featured: false,
      type: 'evergreen',
      wordCount: 1200,
      internalLinks: ['/destinations', '/destinations/aruba'],
      relatedDestination: null
    },
    {
      id: 'save-money-on-tours-activities',
      title: '7 Smart Ways to Save Money on Tours and Activities',
      excerpt: 'Discover how to find affordable tours and activities worldwide. Learn 7 proven ways to save money on travel experiences with AI-powered recommendations.',
      content: 'Travel experiences don\'t have to break your budget. With the right strategy, you can explore the world\'s most exciting destinations while keeping your wallet happy...',
      category: 'General Travel Tips',
      readTime: '7 min read',
      publishDate: '2024-02-15',
      author: 'Travel Expert',
      image: 'https://ouqeoizufbofdqbuiwvx.supabase.co/storage/v1/object/public/blogs/7%20Smart%20Ways%20to%20Save%20Money%20on%20Tours%20and%20Activities.png',
      tags: ['Tour Deals', 'Travel Savings', 'Budget Travel'],
      featured: true,
      type: 'evergreen',
      wordCount: 1100,
      internalLinks: ['/destinations', '/destinations/aruba'],
      relatedDestination: null
    },
    {
      id: 'multi-destination-trip-planning',
      title: 'How to Plan a Multi-Destination Trip Without the Stress',
      excerpt: 'Learn how to plan a seamless multi-destination trip with smart route planning, flexible tour booking, and AI-powered tools from TopTours.ai.',
      content: 'Planning a trip to multiple destinations can feel exciting — until the logistics kick in. Coordinating flights, finding tours, managing accommodations...',
      category: 'General Travel Tips',
      readTime: '9 min read',
      publishDate: '2024-02-20',
      author: 'Travel Expert',
      image: 'https://ouqeoizufbofdqbuiwvx.supabase.co/storage/v1/object/public/blogs/How%20to%20Plan%20a%20Multi-Destination%20Trip%20Without%20the%20Stress.png',
      tags: ['Multi-City Itinerary', 'Trip Planning AI', 'Travel Route Tips'],
      featured: true,
      type: 'evergreen',
      wordCount: 1300,
      internalLinks: ['/destinations', '/travel-guides/save-money-on-tours-activities'],
      relatedDestination: null
    },
    {
      id: 'private-vs-group-tours',
      title: 'Private vs Group Tours: Which One Is Right for You?',
      excerpt: 'Compare private vs group tours and discover which travel style fits you best. Learn the pros, cons, and smart ways to find the perfect tour with TopTours.ai.',
      content: 'When planning your next adventure, one of the biggest decisions you\'ll face is whether to join a group tour or opt for a private experience...',
      category: 'General Travel Tips',
      readTime: '6 min read',
      publishDate: '2024-02-25',
      author: 'Travel Expert',
      image: 'https://ouqeoizufbofdqbuiwvx.supabase.co/storage/v1/object/public/blogs/Private%20vs%20Group%20Tours.png',
      tags: ['Private Tours vs Group Tours', 'Small Group Excursions', 'Tour Comparison'],
      featured: true,
      type: 'evergreen',
      wordCount: 900,
      internalLinks: ['/destinations', '/travel-guides/how-to-choose-a-tour'],
      relatedDestination: null
    },
    {
      id: 'ai-travel-itinerary-planning',
      title: 'How to Use AI to Find the Best Tours for Your Next Trip',
      excerpt: 'Discover how AI helps you find the best tours and activities worldwide. TopTours.ai connects you to Viator\'s 300,000+ experiences in seconds — fast, free, and smart.',
      content: 'Travel planning can be exciting — but let\'s be honest, it can also be a hassle. Sorting through endless tour websites, comparing prices...',
      category: 'General Travel Tips',
      readTime: '5 min read',
      publishDate: '2024-02-28',
      author: 'Travel Expert',
      image: 'https://ouqeoizufbofdqbuiwvx.supabase.co/storage/v1/object/public/blogs/How%20to%20Use%20AI%20to%20Create%20Your%20Dream%20Travel%20Itinerary.png',
      tags: ['AI Trip Planner', 'AI Tour Finder', 'Travel Planning AI'],
      featured: true,
      type: 'evergreen',
      wordCount: 800,
      internalLinks: ['/destinations', '/travel-guides/ai-travel-planning-guide'],
      relatedDestination: null
    },
    {
      id: 'best-caribbean-islands',
      title: '11 Best Caribbean Islands to Visit for Every Type of Traveler',
      excerpt: 'Discover the best Caribbean islands for every type of traveler. From Aruba\'s white sand beaches to Jamaica\'s vibrant culture, find your perfect Caribbean paradise with TopTours.ai.',
      content: 'The Caribbean is a dream destination for travelers of all types. Whether you\'re seeking pristine beaches, vibrant culture...',
      category: 'Caribbean',
      readTime: '8 min read',
      publishDate: '2024-03-01',
      author: 'Travel Expert',
      image: 'https://ouqeoizufbofdqbuiwvx.supabase.co/storage/v1/object/public/blogs/11%20Best%20Caribbean%20Islands%20to%20Visit%20for%20Every%20Type%20of%20Traveler.png',
      tags: ['Caribbean Islands Travel Guide', 'Where to Go in Caribbean', 'Best Caribbean Destinations'],
      featured: true,
      type: 'regional',
      wordCount: 1200,
      internalLinks: ['/destinations', '/destinations/aruba', '/destinations/jamaica'],
      relatedDestination: null
    },
    {
      id: 'best-time-to-visit-caribbean',
      title: 'When Is the Best Time to Visit the Caribbean?',
      excerpt: 'Discover the best time to visit the Caribbean for sunshine, low prices, and safe travel. Learn about hurricane season, weather by month, and when to find the best tours.',
      content: 'Planning a Caribbean getaway? Timing is everything. While the region is warm and tropical year-round...',
      category: 'Caribbean',
      readTime: '6 min read',
      publishDate: '2024-03-02',
      author: 'Travel Expert',
      image: 'https://ouqeoizufbofdqbuiwvx.supabase.co/storage/v1/object/public/blogs/When%20Is%20the%20Best%20Time%20to%20Visit%20the%20Caribbean.png',
      tags: ['Caribbean Travel Season', 'Best Time to Visit Caribbean', 'Weather Caribbean Vacation'],
      featured: true,
      type: 'seasonal',
      wordCount: 900,
      internalLinks: ['/destinations', '/destinations/aruba', '/destinations/curacao'],
      relatedDestination: null
    },
    {
      id: 'family-tours-caribbean',
      title: 'Family-Friendly Caribbean Tours and Activities',
      excerpt: 'Discover the best family-friendly Caribbean tours and activities for kids of all ages. From beach adventures to cultural experiences, find perfect family vacation activities in the Caribbean.',
      content: 'The Caribbean is a paradise for families seeking adventure, relaxation, and unforgettable memories together...',
      category: 'Caribbean',
      readTime: '7 min read',
      publishDate: '2024-03-03',
      author: 'Travel Expert',
      image: 'https://ouqeoizufbofdqbuiwvx.supabase.co/storage/v1/object/public/blogs/Family-Friendly%20Caribbean%20Tours%20and%20Activities.png',
      tags: ['Caribbean Family Vacation', 'Family Tours', 'Kids Activities'],
      featured: true,
      type: 'family',
      wordCount: 1000,
      internalLinks: ['/destinations', '/destinations/aruba', '/destinations/cayman-islands'],
      relatedDestination: null
    },
            {
              id: 'amsterdam-3-day-itinerary',
              title: 'How to Spend 3 Days in Amsterdam',
              excerpt: 'Discover the perfect 3-day Amsterdam itinerary with the best tours and activities. From canal cruises to museum visits, plan your ideal Amsterdam adventure with TopTours.ai.',
              content: 'Amsterdam, the charming capital of the Netherlands, is a city of canals, culture, and countless adventures...',
              category: 'Europe',
              readTime: '8 min read',
              publishDate: '2024-03-04',
              author: 'Travel Expert',
              image: 'https://ouqeoizufbofdqbuiwvx.supabase.co/storage/v1/object/public/destinations//Amsterdam.jpg',
              tags: ['Amsterdam Itinerary 3 Days', 'Best Tours in Amsterdam', 'Amsterdam Travel Guide'],
              featured: true,
              type: 'itinerary',
              wordCount: 1100,
              internalLinks: ['/destinations', '/destinations/amsterdam'],
              relatedDestination: '/destinations/amsterdam'
            },
            {
              id: 'paris-travel-guide',
              title: 'Paris Travel Guide: Top Sights and Tours',
              excerpt: 'Discover the best Paris tours, Eiffel Tower tickets, and top attractions. Plan your perfect Paris adventure with our comprehensive travel guide featuring must-see sights and unforgettable experiences.',
              content: 'Paris, the City of Light, is one of the world\'s most enchanting destinations, offering an incredible blend of history, art, culture, and romance...',
              category: 'Europe',
              readTime: '9 min read',
              publishDate: '2024-03-05',
              author: 'Travel Expert',
              image: 'https://ouqeoizufbofdqbuiwvx.supabase.co/storage/v1/object/public/destinations//paris.jpg',
              tags: ['Paris Tours', 'Eiffel Tower Tickets', 'Paris Excursions', 'Paris Travel Guide', 'Paris Attractions'],
              featured: true,
              type: 'guide',
              wordCount: 1200,
              internalLinks: ['/destinations', '/destinations/paris'],
              relatedDestination: '/destinations/paris'
            },
            {
              id: 'rome-weekend-guide',
              title: 'Rome in a Weekend: The Ultimate 48-Hour Guide',
              excerpt: 'Discover the perfect 2-day Rome itinerary with the best tours and activities. From Vatican tours to Colosseum visits, plan your ultimate 48-hour Roman adventure with our comprehensive weekend guide.',
              content: 'Rome, the Eternal City, is a treasure trove of ancient history, Renaissance art, and timeless beauty that can be experienced even in just 48 hours...',
              category: 'Europe',
              readTime: '10 min read',
              publishDate: '2024-03-06',
              author: 'Travel Expert',
              image: 'https://ouqeoizufbofdqbuiwvx.supabase.co/storage/v1/object/public/destinations//rome.jpg',
              tags: ['Rome Itinerary 2 Days', 'Rome Tours', 'Vatican Tours', 'Rome Weekend Guide', 'Colosseum Tours', 'Rome Attractions'],
              featured: true,
              type: 'itinerary',
              wordCount: 1300,
              internalLinks: ['/destinations', '/destinations/rome'],
              relatedDestination: '/destinations/rome'
            },
            {
              id: 'best-things-to-do-in-new-york',
              title: 'Best Things to Do in New York City',
              excerpt: 'Discover the best NYC attractions, tours, and activities. From Central Park to Broadway shows, explore the ultimate New York City bucket list with our comprehensive guide to the Big Apple\'s top experiences.',
              content: 'New York City, the Big Apple, is a world of endless possibilities where every neighborhood tells a different story and every corner offers something new to discover...',
              category: 'North America',
              readTime: '11 min read',
              publishDate: '2024-03-07',
              author: 'Travel Expert',
              image: 'https://ouqeoizufbofdqbuiwvx.supabase.co/storage/v1/object/public/blogs/Best%20Things%20to%20Do%20in%20New%20York%20City.png',
              tags: ['New York Tours', 'NYC Attractions', 'NYC Activities', 'Best Things to Do in NYC', 'New York City Guide', 'NYC Bucket List'],
              featured: true,
              type: 'guide',
              wordCount: 1400,
              internalLinks: ['/destinations', '/destinations/new-york'],
              relatedDestination: '/destinations/new-york'
            },
            {
              id: 'los-angeles-tours',
              title: 'Exploring Los Angeles: Tours and Local Highlights',
              excerpt: 'Discover the best Los Angeles tours and Hollywood excursions. From celebrity homes to theme parks, explore LA\'s top attractions and hidden gems with our comprehensive guide to the City of Angels.',
              content: 'Los Angeles, the City of Angels, is a sprawling metropolis where dreams come true, celebrities roam the streets, and every neighborhood offers its own unique flavor of California living...',
              category: 'North America',
              readTime: '12 min read',
              publishDate: '2024-03-08',
              author: 'Travel Expert',
              image: 'https://ouqeoizufbofdqbuiwvx.supabase.co/storage/v1/object/public/destinations//Los%20Angeles.webp',
              tags: ['Los Angeles Tours', 'Hollywood Excursions', 'LA Attractions', 'Celebrity Tours', 'Universal Studios', 'Disneyland'],
              featured: true,
              type: 'guide',
              wordCount: 1500,
              internalLinks: ['/destinations', '/destinations/los-angeles'],
              relatedDestination: '/destinations/los-angeles'
            },
            {
              id: 'miami-water-tours',
              title: 'Miami Water Sports and Boat Tours',
              excerpt: 'Discover the best Miami boat tours and water sports activities. From snorkeling in Biscayne Bay to sunset cruises, explore Miami\'s aquatic adventures with our comprehensive guide to water activities in the Magic City.',
              content: 'Miami, the Magic City, is a paradise for water lovers, offering crystal-clear waters, vibrant marine life, and endless opportunities for aquatic adventures...',
              category: 'North America',
              readTime: '13 min read',
              publishDate: '2024-03-09',
              author: 'Travel Expert',
              image: 'https://ouqeoizufbofdqbuiwvx.supabase.co/storage/v1/object/public/blogs/Miami%20Water%20Sports%20and%20Boat%20Tours.png',
              tags: ['Miami Boat Tours', 'Miami Snorkeling', 'Water Sports Miami', 'Miami Cruises', 'Biscayne Bay Tours', 'Miami Beach Activities'],
              featured: true,
              type: 'guide',
              wordCount: 1600,
              internalLinks: ['/destinations', '/destinations/miami'],
              relatedDestination: '/destinations/miami'
            },
            {
              id: 'best-time-to-visit-southeast-asia',
              title: 'The Best Time to Visit Southeast Asia for Perfect Weather',
              excerpt: 'Discover the best time to visit Southeast Asia for perfect weather. Plan your Thailand, Vietnam, Indonesia, and Malaysia adventures with our comprehensive seasonal guide to Southeast Asian climates and travel conditions.',
              content: 'Southeast Asia is a tropical paradise that spans across multiple countries, each with its own unique climate patterns and seasonal variations...',
              category: 'Asia-Pacific',
              readTime: '14 min read',
              publishDate: '2024-03-10',
              author: 'Travel Expert',
              image: 'https://ouqeoizufbofdqbuiwvx.supabase.co/storage/v1/object/public/blogs/The%20Best%20Time%20to%20Visit%20Southeast%20Asia%20for%20Perfect%20Weather.png',
              tags: ['Best Time to Visit Southeast Asia', 'Thailand Weather', 'Vietnam Travel Season', 'Indonesia Weather', 'Malaysia Climate', 'Southeast Asia Dry Season'],
              featured: true,
              type: 'guide',
              wordCount: 1700,
              internalLinks: ['/destinations', '/destinations/thailand', '/destinations/vietnam'],
              relatedDestination: '/destinations/thailand'
            },
            {
              id: 'new-zealand-adventure-tours',
              title: 'Top Adventure Tours in New Zealand for Every Traveler',
              excerpt: 'Discover the best adventure tours in New Zealand for every type of traveler. From Queenstown bungee jumping to Milford Sound cruises, explore the ultimate outdoor activities and adrenaline experiences in the adventure capital of the world.',
              content: 'New Zealand, the adventure capital of the world, offers an unparalleled playground for thrill-seekers and outdoor enthusiasts of all levels...',
              category: 'Asia-Pacific',
              readTime: '15 min read',
              publishDate: '2024-03-11',
              author: 'Travel Expert',
              image: 'https://ouqeoizufbofdqbuiwvx.supabase.co/storage/v1/object/public/blogs/Top%20Adventure%20Tours%20in%20New%20Zealand%20for%20Every%20Traveler.png',
              tags: ['New Zealand Tours', 'Queenstown Adventures', 'Outdoor Activities New Zealand', 'Bungee Jumping New Zealand', 'Milford Sound Tours', 'Adventure Travel New Zealand'],
              featured: true,
              type: 'guide',
              wordCount: 1800,
              internalLinks: ['/destinations', '/destinations/new-zealand', '/destinations/queenstown'],
              relatedDestination: '/destinations/new-zealand'
            },
            {
              id: 'japan-cherry-blossom-travel',
              title: 'How to Experience Japan\'s Cherry Blossom Season Like a Local',
              excerpt: 'Discover how to experience Japan\'s cherry blossom season like a local. Learn the best time to visit Japan, where to find the most beautiful sakura spots, and insider tips for authentic hanami experiences during spring travel in Japan.',
              content: 'Japan\'s cherry blossom season, or sakura season, is one of the most magical times to visit the Land of the Rising Sun...',
              category: 'Asia-Pacific',
              readTime: '16 min read',
              publishDate: '2024-03-12',
              author: 'Travel Expert',
              image: 'https://ouqeoizufbofdqbuiwvx.supabase.co/storage/v1/object/public/blogs/How%20to%20Experience%20Japans%20Cherry%20Blossom%20Season%20Like%20a%20Local.png',
              tags: ['Japan Cherry Blossom', 'Best Time to Visit Japan', 'Spring Travel Japan', 'Hanami Japan', 'Sakura Viewing', 'Cherry Blossom Season Japan'],
              featured: true,
              type: 'guide',
              wordCount: 1900,
              internalLinks: ['/destinations', '/destinations/japan', '/destinations/tokyo'],
              relatedDestination: '/destinations/japan'
            },
            {
              id: 'best-time-for-african-safari',
              title: 'When to Go on Safari in Africa: Month-by-Month Guide',
              excerpt: 'Discover the best time for African safari with our comprehensive month-by-month guide. Learn about Kenya safari season, Tanzania wildlife viewing, and optimal timing for wildlife encounters across Africa\'s top safari destinations.',
              content: 'Planning the perfect African safari requires careful consideration of timing, as the continent\'s diverse ecosystems and seasonal patterns dramatically affect wildlife viewing opportunities...',
              category: 'Africa',
              readTime: '17 min read',
              publishDate: '2024-03-13',
              author: 'Travel Expert',
              image: 'https://ouqeoizufbofdqbuiwvx.supabase.co/storage/v1/object/public/blogs/When%20to%20Go%20on%20Safari%20in%20Africa.png',
              tags: ['Best Time for African Safari', 'Kenya Safari Season', 'Tanzania Wildlife', 'African Safari Timing', 'Wildlife Migration', 'Safari Seasons Africa'],
              featured: true,
              type: 'guide',
              wordCount: 2000,
              internalLinks: ['/destinations', '/destinations/kenya', '/destinations/tanzania'],
              relatedDestination: '/destinations/kenya'
            },
            {
              id: 'best-tours-south-africa',
              title: 'Top 10 Tours in South Africa for First-Time Visitors',
              excerpt: 'Discover the best South Africa tours for first-time visitors. From Cape Town excursions to Kruger safaris, explore the top 10 must-do experiences that showcase South Africa\'s incredible diversity, wildlife, and cultural heritage.',
              content: 'South Africa offers an incredible diversity of experiences that can overwhelm first-time visitors, from world-class wildlife safaris and stunning coastal drives to vibrant cities and rich cultural heritage...',
              category: 'Africa',
              readTime: '18 min read',
              publishDate: '2024-03-14',
              author: 'Travel Expert',
              image: 'https://ouqeoizufbofdqbuiwvx.supabase.co/storage/v1/object/public/blogs/Top%2010%20Tours%20in%20South%20Africa%20for%20First-Time%20Visitors.png',
              tags: ['South Africa Tours', 'Cape Town Excursions', 'Kruger Safaris', 'South Africa Travel', 'First Time South Africa', 'Table Mountain Tours'],
              featured: true,
              type: 'guide',
              wordCount: 2100,
              internalLinks: ['/destinations', '/destinations/cape-town', '/destinations/johannesburg'],
              relatedDestination: '/destinations/cape-town'
            },
            {
              id: 'egypt-cultural-tours',
              title: 'Egypt Beyond the Pyramids: Cultural Tours Worth Taking',
              excerpt: 'Discover Egypt beyond the pyramids with our guide to cultural tours worth taking. Explore Nile River cruises, Cairo historical sites, and authentic Egyptian experiences that showcase the country\'s rich heritage and modern culture.',
              content: 'While the Pyramids of Giza remain Egypt\'s most iconic symbols, the country offers an incredible wealth of cultural experiences that extend far beyond these ancient wonders...',
              category: 'Africa',
              readTime: '19 min read',
              publishDate: '2024-03-15',
              author: 'Travel Expert',
              image: 'https://ouqeoizufbofdqbuiwvx.supabase.co/storage/v1/object/public/blogs/Egypt%20Beyond%20the%20Pyramids.png',
              tags: ['Egypt Tours', 'Nile River Cruise', 'Cairo Historical Sites', 'Egypt Cultural Tours', 'Egyptian Heritage', 'Ancient Egypt Tours'],
              featured: true,
              type: 'guide',
              wordCount: 2200,
              internalLinks: ['/destinations', '/destinations/cairo', '/destinations/luxor'],
              relatedDestination: '/destinations/cairo'
            },
            {
              id: 'best-tours-peru-machu-picchu',
              title: 'Exploring Peru: The Best Tours for Machu Picchu and Beyond',
              excerpt: 'Discover the best Peru tours for Machu Picchu and beyond. Explore Inca Trail tours, Sacred Valley experiences, and authentic Peruvian adventures that showcase the country\'s ancient wonders and vibrant culture.',
              content: 'Peru is a land of ancient wonders, where the legacy of the Inca Empire meets breathtaking natural beauty and vibrant contemporary culture...',
              category: 'South America',
              readTime: '20 min read',
              publishDate: '2024-03-16',
              author: 'Travel Expert',
              image: 'https://ouqeoizufbofdqbuiwvx.supabase.co/storage/v1/object/public/blogs/The%20Best%20Tours%20for%20Machu%20Picchu%20and%20Beyond.png',
              tags: ['Peru Tours', 'Machu Picchu Travel', 'Inca Trail Tours', 'Peru Travel Guide', 'Sacred Valley Tours', 'Cusco Tours'],
              featured: true,
              type: 'guide',
              wordCount: 2300,
              internalLinks: ['/destinations', '/destinations/machu-picchu', '/destinations/cusco'],
              relatedDestination: '/destinations/machu-picchu'
            },
            {
              id: 'best-time-to-visit-brazil',
              title: 'Best Time to Visit Brazil: Festivals, Beaches, and Weather',
              excerpt: 'Discover the best time to visit Brazil with our comprehensive guide covering festivals, beaches, and weather. Plan your perfect Brazilian adventure from Rio Carnival to Amazon expeditions and coastal getaways.',
              content: 'Brazil\'s vast size and diverse geography create a country where the best time to visit depends entirely on what you want to experience and which regions you plan to explore...',
              category: 'South America',
              readTime: '21 min read',
              publishDate: '2024-03-17',
              author: 'Travel Expert',
              image: 'https://ouqeoizufbofdqbuiwvx.supabase.co/storage/v1/object/public/blogs/Best%20Time%20to%20Brazil%20Visit%20Festivals,%20Beaches,%20and%20Weather.png',
              tags: ['Best Time to Visit Brazil', 'Brazil Festivals', 'Rio Weather', 'Brazil Travel Seasons', 'Brazilian Festivals', 'Amazon Weather', 'Brazil Beaches'],
              featured: true,
              type: 'guide',
              wordCount: 2400,
              internalLinks: ['/destinations', '/destinations/rio-de-janeiro', '/destinations/sao-paulo'],
              relatedDestination: '/destinations/rio-de-janeiro'
            },
            {
              id: 'patagonia-travel-guide',
              title: 'Patagonia Travel Guide: How to Experience Argentina and Chile\'s Wild South',
              excerpt: 'Discover the ultimate Patagonia travel guide for experiencing Argentina and Chile\'s wild south. Explore hiking trails, glacier tours, and adventure activities in one of the world\'s most spectacular wilderness regions.',
              content: 'Patagonia represents one of the world\'s last great wilderness frontiers, where towering granite peaks, massive glaciers, pristine lakes, and endless steppes create a landscape of unparalleled beauty and adventure...',
              category: 'South America',
              readTime: '22 min read',
              publishDate: '2024-03-18',
              author: 'Travel Expert',
              image: 'https://ouqeoizufbofdqbuiwvx.supabase.co/storage/v1/object/public/blogs/Patagonia%20Travel%20Guide%20How%20to%20Experience%20Argentina%20and%20Chiles%20Wild%20South.png',
              tags: ['Patagonia Tours', 'Hiking Patagonia', 'Argentina Chile Itinerary', 'Patagonia Travel Guide', 'Torres del Paine', 'Perito Moreno Glacier'],
              featured: true,
              type: 'guide',
              wordCount: 2500,
              internalLinks: ['/destinations', '/destinations/el-calafate', '/destinations/torres-del-paine'],
              relatedDestination: '/destinations/el-calafate'
            }
  ];

  useEffect(() => {
    setTravelGuides(sampleGuides);
  }, []);

  const filteredGuides = travelGuides.filter(guide => {
    const matchesSearch = guide.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         guide.excerpt.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         guide.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesCategory = selectedCategory === 'All' || guide.category === selectedCategory;
    return matchesSearch && matchesCategory;
  }).sort((a, b) => new Date(b.publishDate) - new Date(a.publishDate));

  const featuredGuides = travelGuides.filter(guide => guide.featured);

  return (
    <>
      <Helmet>
        <title>Travel Guides - AI-Powered Travel Tips & Destination Guides | TopTours.ai</title>
        <meta name="description" content="Discover smart travel insights, destination guides, and AI-powered tips to help you plan your perfect trip — from hidden gems to must-do tours around the world." />
        <meta name="keywords" content="travel guides, AI travel planner, tour recommendations, travel tips, destination guides, travel planning, smart travel" />
        
        {/* Open Graph */}
        <meta property="og:title" content="Travel Guides - AI-Powered Travel Tips & Destination Guides | TopTours.ai" />
        <meta property="og:description" content="Discover smart travel insights, destination guides, and AI-powered tips to help you plan your perfect trip — from hidden gems to must-do tours around the world." />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://toptours.ai/travel-guides" />
        <meta property="og:image" content="https://toptours.ai/og-travel-guides.jpg" />
        <meta property="og:image:width" content="1200" />
        <meta property="og:image:height" content="630" />
        <meta property="og:site_name" content="TopTours.ai" />
        <meta property="og:locale" content="en_US" />
        
        {/* Twitter Card */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Travel Guides - AI-Powered Travel Tips & Destination Guides | TopTours.ai" />
        <meta name="twitter:description" content="Discover smart travel insights, destination guides, and AI-powered tips to help you plan your perfect trip." />
        <meta name="twitter:image" content="https://toptours.ai/og-travel-guides.jpg" />
      </Helmet>
      
      <div className="min-h-screen flex flex-col bg-gray-50">
        <Navigation onOpenModal={onOpenModal} />
        <main className="flex-grow">
          <section className="pt-24 pb-16 ocean-gradient">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
                className="text-center"
              >
                <h1 className="text-4xl md:text-6xl font-poppins font-bold text-white mb-6">
                  Travel Guides
                </h1>
                <p className="text-xl text-white/90 max-w-3xl mx-auto mb-8">
                  Discover smart travel insights, destination guides, and AI-powered tips to help you plan your perfect trip — from hidden gems to must-do tours around the world.
                </p>
                
                <div className="max-w-2xl mx-auto">
                  <div className="glass-effect rounded-2xl p-4">
                    <div className="flex gap-4">
                      <div className="flex-1 relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                        <Input
                          placeholder="Search travel guides..."
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                          className="pl-10 h-12 bg-white/90 border-0 text-gray-800 placeholder:text-gray-500"
                        />
                      </div>
                      <Button className="h-12 px-6 sunset-gradient text-white font-semibold">
                        Search
                      </Button>
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>
          </section>

          {/* Featured Guides Section */}
          {featuredGuides.length > 0 && !searchTerm && selectedCategory === 'All' && (
            <section className="py-16 bg-white">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-12">
                  <h2 className="text-3xl font-bold text-gray-900 mb-4">Featured Guides</h2>
                  <p className="text-lg text-gray-600">Top-performing travel guides and expert recommendations</p>
                </div>
                
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  {featuredGuides.slice(0, 2).map((guide, index) => (
                    <motion.div
                      key={guide.id}
                      initial={{ opacity: 0, y: 30 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.4, delay: index * 0.1 }}
                      viewport={{ once: true }}
                      whileHover={{ y: -5 }}
                    >
                      <Card className="bg-white border-0 shadow-xl overflow-hidden h-full hover:shadow-2xl transition-all duration-300 flex flex-col">
                        <div className="relative h-64 overflow-hidden">
                          <img 
                            className="w-full h-full object-cover transition-transform duration-300 hover:scale-105" 
                            alt={guide.title}
                            src={guide.image}
                          />
                          <Badge className="absolute top-4 left-4 adventure-gradient text-white">
                            {guide.category}
                          </Badge>
                          <Badge className="absolute bottom-4 left-4 bg-blue-600 text-white text-xs">
                            {guide.type === 'evergreen' ? 'Essential' : guide.type === 'regional' ? 'Regional' : 'Destination'}
                          </Badge>
                        </div>
                        <CardContent className="p-6 flex flex-col flex-grow">
                          <h3 className="text-xl font-bold text-gray-900 mb-3 line-clamp-2">
                            {guide.title}
                          </h3>
                          
                          <p className="text-gray-700 mb-4 line-clamp-3 flex-grow">
                            {guide.excerpt}
                          </p>
                          
                          <div className="flex flex-wrap gap-2 mb-4">
                            {guide.tags.slice(0, 3).map((tag) => (
                              <Badge key={tag} variant="outline" className="text-xs">
                                <Tag className="h-3 w-3 mr-1" />
                                {tag}
                              </Badge>
                            ))}
                          </div>
                          
                          <Button 
                            className="w-full sunset-gradient text-white hover:scale-105 transition-transform duration-200 h-12 text-base font-semibold mt-auto"
                            asChild
                          >
                            <Link to={`/travel-guides/${guide.id}`}>
                              Read Guide
                              <ArrowRight className="ml-2 h-5 w-5" />
                            </Link>
                          </Button>
                        </CardContent>
                      </Card>
                    </motion.div>
                  ))}
                </div>
              </div>
            </section>
          )}

          <section className="py-8 bg-white border-b">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex flex-wrap justify-center gap-4">
                {categories.map((category) => (
                  <Button
                    key={category}
                    variant={selectedCategory === category ? "default" : "outline"}
                    onClick={() => setSelectedCategory(category)}
                    className={selectedCategory === category ? 'sunset-gradient text-white' : ''}
                  >
                    {category}
                  </Button>
                ))}
              </div>
            </div>
          </section>

          <section className="py-20 bg-gray-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              {filteredGuides.length > 0 ? (
                <>
                  <div className="mb-8 text-center">
                    <p className="text-lg text-gray-600">
                      Showing <span className="font-semibold text-gray-800">{filteredGuides.length}</span> 
                      {filteredGuides.length === 1 ? ' guide' : ' guides'}
                      {searchTerm && (
                        <span> for "<span className="font-semibold text-gray-800">{searchTerm}</span>"</span>
                      )}
                      {selectedCategory !== 'All' && (
                        <span> in <span className="font-semibold text-gray-800">{selectedCategory}</span></span>
                      )}
                    </p>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {filteredGuides.map((guide, index) => (
                      <motion.div
                        key={guide.id}
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.4, delay: index * 0.05 }}
                        viewport={{ once: true }}
                        whileHover={{ y: -5 }}
                        className="cursor-pointer"
                      >
                        <Card className="bg-white border-0 shadow-xl overflow-hidden h-full flex flex-col hover:shadow-2xl transition-all duration-300">
                          <div className="relative h-48 overflow-hidden">
                            <img 
                              className="w-full h-full object-cover transition-transform duration-300 hover:scale-105" 
                              alt={guide.title}
                              src={guide.image}
                            />
                            <Badge className="absolute top-4 left-4 adventure-gradient text-white">
                              {guide.category}
                            </Badge>
                            {guide.type && (
                              <Badge className="absolute bottom-4 left-4 bg-blue-600 text-white text-xs">
                                {guide.type === 'evergreen' ? 'Essential' : guide.type === 'regional' ? 'Regional' : 'Destination'}
                              </Badge>
                            )}
                          </div>
                          
                          <CardContent className="p-6 flex flex-col flex-grow">
                            <h3 className="text-lg font-bold text-gray-900 mb-3 line-clamp-2">
                              {guide.title}
                            </h3>
                            
                            <p className="text-gray-700 mb-4 flex-grow line-clamp-3">
                              {guide.excerpt}
                            </p>
                            
                            <div className="flex flex-wrap gap-2 mb-4">
                              {guide.tags.slice(0, 2).map((tag) => (
                                <Badge key={tag} variant="outline" className="text-xs">
                                  <Tag className="h-3 w-3 mr-1" />
                                  {tag}
                                </Badge>
                              ))}
                            </div>
                            
                            <div className="mt-auto pt-4">
                              <Button 
                                className="w-full sunset-gradient text-white hover:scale-105 transition-transform duration-200 h-12 text-base font-semibold"
                                asChild
                              >
                                <Link to={`/travel-guides/${guide.id}`}>
                                  Read Guide
                                  <ArrowRight className="ml-2 h-5 w-5" />
                                </Link>
                              </Button>
                            </div>
                          </CardContent>
                        </Card>
                      </motion.div>
                    ))}
                  </div>
                </>
              ) : (
                <div className="text-center py-16">
                  <BookOpen className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <h2 className="text-3xl font-bold text-gray-800 mb-4">
                    No Guides Found
                  </h2>
                  <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                    We couldn't find any travel guides matching your search. Try adjusting your filters or search terms.
                  </p>
                </div>
              )}
            </div>
          </section>

          <BlueCTASection 
            onOpenModal={() => onOpenModal()}
            title="Ready to Plan Your Trip with AI?"
            description="Put these travel guides into action with our AI-powered tour recommendations and smart trip planning tools."
            buttonText="Start Planning Your Trip"
          />
        </main>
        <Footer />
      </div>
    </>
  );
};

export default TravelTips;