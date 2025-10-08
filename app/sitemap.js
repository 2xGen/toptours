import { getAllDestinations } from '../src/data/destinationsData.js';
import { travelGuides } from '../src/data/travelGuidesData.js';

export default function sitemap() {
  const baseUrl = 'https://toptours.ai';
  const currentDate = new Date().toISOString();

  // Static pages
  const staticPages = [
    {
      url: baseUrl,
      lastModified: currentDate,
      changeFrequency: 'daily',
      priority: 1.0,
    },
    {
      url: `${baseUrl}/destinations`,
      lastModified: currentDate,
      changeFrequency: 'daily',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/travel-guides`,
      lastModified: currentDate,
      changeFrequency: 'weekly',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/how-it-works`,
      lastModified: currentDate,
      changeFrequency: 'monthly',
      priority: 0.7,
    },
    {
      url: `${baseUrl}/about`,
      lastModified: currentDate,
      changeFrequency: 'monthly',
      priority: 0.6,
    },
    {
      url: `${baseUrl}/contact`,
      lastModified: currentDate,
      changeFrequency: 'monthly',
      priority: 0.5,
    },
    {
      url: `${baseUrl}/terms`,
      lastModified: currentDate,
      changeFrequency: 'yearly',
      priority: 0.3,
    },
    {
      url: `${baseUrl}/disclosure`,
      lastModified: currentDate,
      changeFrequency: 'yearly',
      priority: 0.3,
    },
  ];

  // Destination pages
  const destinations = getAllDestinations();
  const destinationPages = destinations.map((destination) => ({
    url: `${baseUrl}/destinations/${destination.id}`,
    lastModified: currentDate,
    changeFrequency: 'weekly',
    priority: 0.8,
  }));

  // Travel guide pages
  const travelGuidePages = travelGuides.map((guide) => ({
    url: `${baseUrl}/travel-guides/${guide.id}`,
    lastModified: guide.publishDate || currentDate,
    changeFrequency: 'monthly',
    priority: 0.8,
  }));

  return [...staticPages, ...destinationPages, ...travelGuidePages];
}

