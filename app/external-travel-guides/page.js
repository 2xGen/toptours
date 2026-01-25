import ExternalTravelGuidesClient from './ExternalTravelGuidesClient';
import viatorDestinationsClassifiedData from '@/data/viatorDestinationsClassified.json';

// Revalidate every 7 days - mostly static directory page
export const revalidate = 604800;

export async function generateMetadata() {
  return {
    title: 'External Travel Guides Directory | TopTours.ai',
    description: 'Discover curated travel guides and resources for destinations worldwide. Find expert guides, local insights, and comprehensive travel information.',
    keywords: 'travel guides, destination guides, travel resources, travel information, travel websites',
    alternates: {
      canonical: 'https://toptours.ai/external-travel-guides',
    },
    openGraph: {
      title: 'External Travel Guides Directory | TopTours.ai',
      description: 'Discover curated travel guides and resources for destinations worldwide.',
      url: 'https://toptours.ai/external-travel-guides',
      siteName: 'TopTours.ai',
      type: 'website',
    },
    robots: {
      index: true,
      follow: true,
    },
  };
}

export default function ExternalTravelGuidesPage() {
  // Get unique regions and countries for filtering
  const destinations = Array.isArray(viatorDestinationsClassifiedData) ? viatorDestinationsClassifiedData : [];
  
  // Extract unique regions
  const regions = [...new Set(destinations.map(d => d.region).filter(Boolean))].sort();
  
  // Extract unique countries
  const countries = [...new Set(destinations.map(d => d.country).filter(Boolean))].sort();

  return (
    <ExternalTravelGuidesClient 
      regions={regions}
      countries={countries}
      destinations={destinations}
    />
  );
}
