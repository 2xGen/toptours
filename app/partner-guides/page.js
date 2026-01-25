import PartnerGuidesClient from './PartnerGuidesClient';
import viatorDestinationsClassifiedData from '@/data/viatorDestinationsClassified.json';

// Revalidate every 7 days - directory page
export const revalidate = 604800;

export async function generateMetadata() {
  return {
    title: 'Partner Travel Guides Directory | TopTours.ai',
    description: 'Discover curated travel guides, blogs, and helpful resources for destinations worldwide. Find expert guides, travel blogs, and comprehensive travel information.',
    keywords: 'travel guides, destination guides, travel resources, partner guides, travel websites',
    alternates: {
      canonical: 'https://toptours.ai/partner-guides',
    },
    openGraph: {
      title: 'Partner Travel Guides Directory | TopTours.ai',
      description: 'Discover curated travel guide resources and partner websites for destinations worldwide.',
      url: 'https://toptours.ai/partner-guides',
      siteName: 'TopTours.ai',
      type: 'website',
    },
    robots: {
      index: true,
      follow: true,
    },
  };
}

export default function PartnerGuidesPage() {
  // Get unique regions and countries for filtering
  const destinations = Array.isArray(viatorDestinationsClassifiedData) ? viatorDestinationsClassifiedData : [];
  
  // Extract unique regions
  const regions = [...new Set(destinations.map(d => d.region).filter(Boolean))].sort();
  
  // Extract unique countries
  const countries = [...new Set(destinations.map(d => d.country).filter(Boolean))].sort();

  return (
    <PartnerGuidesClient 
      regions={regions}
      countries={countries}
      destinations={destinations}
    />
  );
}
