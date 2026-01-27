import { notFound } from 'next/navigation';
import { getDestinationById } from '@/data/destinationsData';
import { getDestinationFullContent } from '@/data/destinationFullContent';
import { getDestinationSeoContent } from '@/data/destinationSeoContent';
import viatorDestinationsClassifiedData from '@/data/viatorDestinationsClassified.json';
import { getViatorDestinationById, getViatorDestinationBySlug } from '@/lib/supabaseCache';
import { getDestinationFeatures } from '@/lib/destinationFeatures';
import CarRentalsClient from './CarRentalsClient';

const DEFAULT_OG = 'https://ouqeoizufbofdqbuiwvx.supabase.co/storage/v1/object/public/blogs/Explore%20any%20destination%20with%20TopToursai.png';
const CAR_RENTAL_OG_IMAGE = 'https://ouqeoizufbofdqbuiwvx.supabase.co/storage/v1/object/public/blogs/car%20rental.png';

function generateSlug(name) {
  if (!name) return '';
  return String(name).toLowerCase().trim().replace(/[^\w\s-]/g, '').replace(/\s+/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '');
}

function carRentalsMeta(name) {
  const n = name || 'destination';
  return {
    desc: `Save up to 70% on car rentals in ${n}. TopTours partners with Discover Cars—compare 1,000+ companies, clear prices, no hidden fees, free cancellation. Find the best deal.`,
    keywords: `car rentals ${n}, rent a car ${n}, ${n} car hire, economy car rental ${n}, SUV rental ${n}, convertible rental ${n}, minivan rental ${n}`,
  };
}

export const revalidate = 604800; // 7 days

export async function generateMetadata({ params }) {
  const { id } = await params;
  let destination = getDestinationById(id);

  if (!destination) {
    const fullContent = getDestinationFullContent(id);
    const seoContent = getDestinationSeoContent(id);
    if (fullContent || seoContent) {
      const destinationName = fullContent?.destinationName || seoContent?.destinationName || id;
      const { desc, keywords } = carRentalsMeta(destinationName);
      return {
        title: `Car Rentals in ${destinationName} | TopTours.ai`,
        description: desc,
        keywords,
        alternates: { canonical: `https://toptours.ai/destinations/${id}/car-rentals` },
        openGraph: {
          title: `Car Rentals in ${destinationName}`,
          description: desc,
          url: `https://toptours.ai/destinations/${id}/car-rentals`,
          images: [{ url: CAR_RENTAL_OG_IMAGE, width: 1200, height: 630, alt: `Car Rentals in ${destinationName}` }],
          type: 'website',
          siteName: 'TopTours.ai',
          locale: 'en_US',
        },
        twitter: { card: 'summary_large_image', title: `Car Rentals in ${destinationName}`, description: desc, images: [CAR_RENTAL_OG_IMAGE] },
        robots: { index: true, follow: true, googleBot: { index: true, follow: true, 'max-video-preview': -1, 'max-image-preview': 'large', 'max-snippet': -1 } },
      };
    }
    if (/^d?\d+$/.test(id)) {
      try {
        const viatorId = id.startsWith('d') ? id.replace(/^d/i, '') : id;
        const dest = await getViatorDestinationById(viatorId);
        if (dest?.name) {
          const { desc, keywords } = carRentalsMeta(dest.name);
          return {
            title: `Car Rentals in ${dest.name} | TopTours.ai`,
            description: desc,
            keywords,
            alternates: { canonical: `https://toptours.ai/destinations/${id}/car-rentals` },
            openGraph: { title: `Car Rentals in ${dest.name}`, description: desc, url: `https://toptours.ai/destinations/${id}/car-rentals`, images: [{ url: CAR_RENTAL_OG_IMAGE, width: 1200, height: 630, alt: `Car Rentals in ${dest.name}` }], type: 'website', siteName: 'TopTours.ai', locale: 'en_US' },
            twitter: { card: 'summary_large_image', title: `Car Rentals in ${dest.name}`, description: desc, images: [CAR_RENTAL_OG_IMAGE] },
            robots: { index: true, follow: true, googleBot: { index: true, follow: true, 'max-video-preview': -1, 'max-image-preview': 'large', 'max-snippet': -1 } },
          };
        }
      } catch (_) {}
    }
    try {
      const dest = await getViatorDestinationBySlug(id);
      if (dest?.name) {
        const { desc, keywords } = carRentalsMeta(dest.name);
        return {
          title: `Car Rentals in ${dest.name} | TopTours.ai`,
          description: desc,
          keywords,
          alternates: { canonical: `https://toptours.ai/destinations/${id}/car-rentals` },
          openGraph: { title: `Car Rentals in ${dest.name}`, description: desc, url: `https://toptours.ai/destinations/${id}/car-rentals`, images: [{ url: CAR_RENTAL_OG_IMAGE, width: 1200, height: 630, alt: `Car Rentals in ${dest.name}` }], type: 'website', siteName: 'TopTours.ai', locale: 'en_US' },
          twitter: { card: 'summary_large_image', title: `Car Rentals in ${dest.name}`, description: desc, images: [CAR_RENTAL_OG_IMAGE] },
          robots: { index: true, follow: true, googleBot: { index: true, follow: true, 'max-video-preview': -1, 'max-image-preview': 'large', 'max-snippet': -1 } },
        };
      }
    } catch (_) {}
    return { title: 'Car Rentals | TopTours.ai', robots: { index: true, follow: true } };
  }

  const name = destination.fullName || destination.name;
  const { desc, keywords } = carRentalsMeta(name);

  return {
    title: `Car Rentals in ${name} | TopTours.ai`,
    description: desc,
    keywords,
    alternates: { canonical: `https://toptours.ai/destinations/${destination.id}/car-rentals` },
    openGraph: {
      title: `Car Rentals in ${name}`,
      description: desc,
      url: `https://toptours.ai/destinations/${destination.id}/car-rentals`,
      images: [{ url: CAR_RENTAL_OG_IMAGE, width: 1200, height: 630, alt: `Car Rentals in ${name}` }],
      type: 'website',
      siteName: 'TopTours.ai',
      locale: 'en_US',
    },
    twitter: { card: 'summary_large_image', title: `Car Rentals in ${name}`, description: desc, images: [CAR_RENTAL_OG_IMAGE] },
    robots: { index: true, follow: true, googleBot: { index: true, follow: true, 'max-video-preview': -1, 'max-image-preview': 'large', 'max-snippet': -1 } },
  };
}

export default async function CarRentalsPage({ params }) {
  const { id } = await params;
  let destination = getDestinationById(id);

  if (!destination) {
    const fullContent = getDestinationFullContent(id);
    const seoContent = getDestinationSeoContent(id);
    if (!fullContent && !seoContent) {
      if (/^d?\d+$/.test(id)) {
        try {
          const viatorId = id.startsWith('d') ? id.replace(/^d/i, '') : id;
          const dest = await getViatorDestinationById(viatorId);
          if (dest?.name) {
            destination = { id, name: dest.name, fullName: dest.name, imageUrl: 'https://ouqeoizufbofdqbuiwvx.supabase.co/storage/v1/object/public/blogs/Explore%20any%20destination%20with%20TopToursai.png' };
          }
        } catch (_) {}
      }
      if (!destination) {
        try {
          const dest = await getViatorDestinationBySlug(id);
          if (dest?.name) {
            destination = { id, name: dest.name, fullName: dest.name, imageUrl: 'https://ouqeoizufbofdqbuiwvx.supabase.co/storage/v1/object/public/blogs/Explore%20any%20destination%20with%20TopToursai.png' };
          }
        } catch (_) {}
      }
      if (!destination) notFound();
    } else {
      const destinationName = fullContent?.destinationName || seoContent?.destinationName || id;
      let country = null;
      let region = null;
      try {
        if (Array.isArray(viatorDestinationsClassifiedData)) {
          const classified = viatorDestinationsClassifiedData.find(dest => {
            const destName = (dest.destinationName || dest.name || '').toLowerCase().trim();
            const search = (destinationName || id).toLowerCase().trim();
            return destName === search || generateSlug(destName) === id;
          });
          if (classified) {
            country = classified.country || null;
            region = classified.region || null;
          }
        }
      } catch (_) {}
      destination = {
        id,
        name: destinationName,
        fullName: destinationName,
        imageUrl: seoContent?.ogImage || fullContent?.imageUrl || 'https://ouqeoizufbofdqbuiwvx.supabase.co/storage/v1/object/public/blogs/Explore%20any%20destination%20with%20TopToursai.png',
        highlights: fullContent?.highlights || seoContent?.highlights || [],
        gettingAround: fullContent?.gettingAround || seoContent?.gettingAround || '',
        whyVisit: fullContent?.whyVisit || seoContent?.whyVisit || [],
        country: country,
        category: region || null,
      };
    }
  }

  // Fetch destination features (lightweight checks)
  const features = await getDestinationFeatures(id);

  return <CarRentalsClient destination={destination} destinationFeatures={features} />;
}
