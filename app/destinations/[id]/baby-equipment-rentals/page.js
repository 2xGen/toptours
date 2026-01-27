import { notFound } from 'next/navigation';
import { getDestinationById } from '@/data/destinationsData';
import { getDestinationFullContent } from '@/data/destinationFullContent';
import { getDestinationSeoContent } from '@/data/destinationSeoContent';
import { getDestinationFeatures } from '@/lib/destinationFeatures';
import { getBabyEquipmentRentalsByDestination } from '@/lib/babyEquipmentRentals';
import viatorDestinationsClassifiedData from '@/data/viatorDestinationsClassified.json';
import BabyEquipmentClient from './BabyEquipmentClient';

// Force dynamic rendering
// Revalidate every hour for fresh data
export const revalidate = 604800; // 7 days - increased to reduce ISR writes

// Helper function to generate slug (same as used in destination detail page)
function generateSlug(name) {
  if (!name) return '';
  return name
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '') // Remove special characters
    .replace(/\s+/g, '-') // Replace spaces with hyphens
    .replace(/-+/g, '-') // Replace multiple hyphens with single hyphen
    .replace(/^-|-$/g, ''); // Remove leading/trailing hyphens
}

export async function generateMetadata({ params }) {
  const { id } = await params;
  
  // Check if destination exists (with guides first)
  let destination = getDestinationById(id);
  let destinationName = null;
  let ogImage = 'https://ouqeoizufbofdqbuiwvx.supabase.co/storage/v1/object/public/OG%20images/baby%20equipment.png';
  
  // If not in destinations with guides, check Viator destinations (without guides)
  if (!destination) {
    const fullContent = getDestinationFullContent(id);
    const seoContent = getDestinationSeoContent(id);
    
    if (fullContent || seoContent) {
      destinationName = fullContent?.destinationName || seoContent?.destinationName || id;
      // Always use baby equipment OG image, don't override with destination image
    } else {
      // Check Viator classified data as final fallback
      if (Array.isArray(viatorDestinationsClassifiedData)) {
        const classifiedDest = viatorDestinationsClassifiedData.find(dest => {
          if (!dest) return false;
          const destName = (dest.destinationName || dest.name || '').toLowerCase().trim();
          const destSlug = generateSlug(dest.destinationName || dest.name || '');
          return destName === id.toLowerCase() || destSlug === id;
        });
        
        if (classifiedDest) {
          destinationName = classifiedDest.destinationName || classifiedDest.name || id;
        }
      }
    }
    
    if (!destinationName) {
      return {
        title: 'Baby Equipment Rentals | TopTours.ai',
      };
    }
  } else {
    destinationName = destination.fullName || destination.name;
    // Always use baby equipment OG image, don't override with destination image
  }
  
  // Check if this destination has a baby equipment rentals page in database
  const pageData = await getBabyEquipmentRentalsByDestination(id);
  if (!pageData) {
    return {
      title: 'Baby Equipment Rentals | TopTours.ai',
    };
  }
  
  // Use database SEO data if available, otherwise generate
  const seoTitle = pageData.seo_title || `Baby Equipment Rentals in ${destinationName} | TopTours.ai`;
  const seoDescription = pageData.seo_description || `Skip the hassle of packing bulky gear. Rent strollers, car seats, cribs, and everything you need for your little one in ${destinationName}. Delivered to your hotel or vacation rental.`;
  const seoKeywords = pageData.seo_keywords?.join(', ') || `baby equipment rental ${destinationName}, baby gear rental ${destinationName}, stroller rental ${destinationName}, car seat rental ${destinationName}, crib rental ${destinationName}, baby equipment ${destinationName}`;

  return {
    title: seoTitle,
    description: seoDescription,
    keywords: seoKeywords,
    alternates: {
      canonical: `https://toptours.ai/destinations/${id}/baby-equipment-rentals`,
    },
    openGraph: {
      title: pageData.seo_title || `Baby Equipment Rentals in ${destinationName}`,
      description: seoDescription,
      url: `https://toptours.ai/destinations/${id}/baby-equipment-rentals`,
      images: [
        {
          url: ogImage,
          width: 1200,
          height: 630,
          alt: `Baby Equipment Rentals in ${destinationName}`,
        },
      ],
      type: 'website',
      siteName: 'TopTours.ai',
      locale: 'en_US',
    },
    twitter: {
      card: 'summary_large_image',
      title: pageData.seo_title || `Baby Equipment Rentals in ${destinationName}`,
      description: seoDescription,
      images: [ogImage],
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        'max-video-preview': -1,
        'max-image-preview': 'large',
        'max-snippet': -1,
      },
    },
  };
}

export default async function BabyEquipmentPage({ params }) {
  const { id } = await params;
  
  // Check if destination exists (with guides first)
  let destination = getDestinationById(id);
  let destinationName = null;
  let country = null;
  let region = null;
  
  // If not in destinations with guides, check Viator destinations (without guides)
  if (!destination) {
    const fullContent = getDestinationFullContent(id);
    const seoContent = getDestinationSeoContent(id);
    
    if (fullContent || seoContent) {
      destinationName = fullContent?.destinationName || seoContent?.destinationName || id;
      country = fullContent?.country || seoContent?.country || null;
      region = fullContent?.region || seoContent?.region || null;
    } else {
      // Check Viator classified data as final fallback (for destinations without guides)
      if (Array.isArray(viatorDestinationsClassifiedData)) {
        const classifiedDest = viatorDestinationsClassifiedData.find(dest => {
          if (!dest) return false;
          const destName = (dest.destinationName || dest.name || '').toLowerCase().trim();
          const destSlug = generateSlug(dest.destinationName || dest.name || '');
          return destName === id.toLowerCase() || destSlug === id;
        });
        
        if (classifiedDest) {
          destinationName = classifiedDest.destinationName || classifiedDest.name || id;
          country = classifiedDest.country || null;
          region = classifiedDest.region || null;
        }
      }
    }
    
    if (!destinationName) {
      notFound(); // Destination not found anywhere
    }
    
    // Create destination object for destinations without guides
    destination = {
      id: id,
      name: destinationName,
      fullName: destinationName,
      country: country,
      category: region,
      imageUrl: fullContent?.imageUrl || seoContent?.imageUrl || seoContent?.ogImage || null,
      briefDescription: fullContent?.briefDescription || seoContent?.briefDescription || `Discover tours and activities in ${destinationName}`,
      isViatorDestination: true, // Flag to indicate this is a destination without guide
    };
  } else {
    destinationName = destination.fullName || destination.name;
  }
  
  // Check if this destination has a baby equipment rentals page in database
  const pageData = await getBabyEquipmentRentalsByDestination(id);
  if (!pageData) {
    notFound(); // Page doesn't exist for this destination yet
  }

  // Fetch destination features (lightweight checks)
  const features = await getDestinationFeatures(id);

  const pageUrl = `https://toptours.ai/destinations/${id}/baby-equipment-rentals`;
  const destinationUrl = `https://toptours.ai/destinations/${id}`;

  // Build FAQ questions for schema from database data
  const faqQuestions = [];
  if (pageData.faqs && Array.isArray(pageData.faqs)) {
    // Use FAQs from database
    pageData.faqs.forEach(faq => {
      faqQuestions.push({
        "@type": "Question",
        "name": faq.question,
        "acceptedAnswer": {
          "@type": "Answer",
          "text": faq.answer
        }
      });
    });
  } else {
    // Fallback to generic FAQs if database doesn't have them
    faqQuestions.push(
      {
        "@type": "Question",
        "name": `Why rent baby equipment instead of bringing it?`,
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Packing bulky items like strollers and car seats can be stressful and expensive. Airlines charge hefty fees for oversized luggage, and maneuvering through airports with heavy gear adds unnecessary hassle. Renting means everything arrives at your accommodation, ready to use."
        }
      }
    );
  }

  return (
    <>
      {/* BreadcrumbList Schema */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "BreadcrumbList",
            "itemListElement": [
              {
                "@type": "ListItem",
                "position": 1,
                "name": "Home",
                "item": "https://toptours.ai/"
              },
              {
                "@type": "ListItem",
                "position": 2,
                "name": "Destinations",
                "item": "https://toptours.ai/destinations"
              },
              {
                "@type": "ListItem",
                "position": 3,
                "name": destinationName,
                "item": destinationUrl
              },
              {
                "@type": "ListItem",
                "position": 4,
                "name": "Baby Equipment Rentals",
                "item": pageUrl
              }
            ]
          }, null, 2)
        }}
      />

      {/* Service Schema */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Service",
            "name": `Baby Equipment Rentals in ${destinationName}`,
            "description": `Rent baby equipment in ${destinationName}: strollers, car seats, cribs, and more delivered to your hotel or vacation rental.`,
            "provider": {
              "@type": "Organization",
              "name": "BabyQuip",
              "url": "https://www.babyquip.com",
              "aggregateRating": {
                "@type": "AggregateRating",
                "ratingValue": "5",
                "reviewCount": "90000",
                "bestRating": "5",
                "worstRating": "1"
              }
            },
            "areaServed": {
              "@type": "City",
              "name": destinationName,
              "sameAs": destinationUrl
            },
            "serviceType": "Baby Equipment Rental",
            "category": "Baby Equipment Rentals"
          }, null, 2)
        }}
      />

      {/* FAQPage Schema */}
      {faqQuestions.length > 0 && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "FAQPage",
              "mainEntity": faqQuestions
            }, null, 2)
          }}
        />
      )}

      <BabyEquipmentClient 
        destination={destination}
        destinationFeatures={features}
        pageData={pageData}
      />
    </>
  );
}
