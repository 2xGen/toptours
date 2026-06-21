import { notFound } from 'next/navigation';
import { getDestinationById } from '@/data/destinationsData';
import { getDestinationFullContent } from '@/data/destinationFullContent';
import { getDestinationSeoContent } from '@/data/destinationSeoContent';
import { getDestinationFeatures } from '@/lib/destinationFeatures';
import { getDestinationTravelInsurancePage } from '@/lib/destinationTravelInsurance';
import { requireFeaturedDestination } from '@/lib/requireFeaturedDestination';
import { getViatorDestinationBySlugCached } from '@/lib/supabaseCache';
import DestinationTravelInsuranceClient from './DestinationTravelInsuranceClient';

export const revalidate = 2592000;

async function resolveDestinationForTravelInsurance(destinationId, pageData) {
  let destination = getDestinationById(destinationId);
  if (destination) return destination;

  const fullContent = getDestinationFullContent(destinationId);
  const seoContent = getDestinationSeoContent(destinationId);
  if (fullContent?.destinationName || seoContent?.destinationName) {
    const name = fullContent?.destinationName || seoContent?.destinationName;
    return {
      id: destinationId,
      name,
      fullName: name,
      imageUrl:
        fullContent?.imageUrl || seoContent?.imageUrl || seoContent?.ogImage || pageData?.heroImage || null,
    };
  }

  try {
    const dbDestination = await getViatorDestinationBySlugCached(destinationId);
    if (dbDestination?.name) {
      return {
        id: destinationId,
        name: dbDestination.name,
        fullName: dbDestination.name,
        imageUrl: pageData?.heroImage || null,
      };
    }
  } catch {
    // fall through
  }

  if (pageData?.destinationName) {
    return {
      id: destinationId,
      name: pageData.destinationName,
      fullName: pageData.destinationName,
      imageUrl: pageData.heroImage || null,
    };
  }

  return null;
}

export async function generateMetadata({ params }) {
  const { id } = await params;
  requireFeaturedDestination(id);

  const pageData = getDestinationTravelInsurancePage(id);
  if (!pageData) {
    return { title: 'Travel Insurance' };
  }

  const destination = getDestinationById(id);
  const destName = pageData.destinationName || destination?.fullName || destination?.name || id;
  const pageUrl = `https://toptours.ai/destinations/${id}/travel-insurance`;
  const seo = pageData.seo || {};

  return {
    title: seo.title || `${destName} Travel Insurance (2026) | TopTours`,
    description: seo.description || pageData.subtitle,
    keywords: seo.keywords || '',
    alternates: { canonical: pageUrl },
    openGraph: {
      title: seo.title || pageData.title,
      description: seo.description || pageData.subtitle,
      url: pageUrl,
      images: [
        {
          url: pageData.heroImage,
          width: 1200,
          height: 630,
          alt: `${destName} travel insurance guide`,
        },
      ],
      type: 'article',
      siteName: 'TopTours.ai',
      locale: 'en_US',
    },
    twitter: {
      card: 'summary_large_image',
      title: seo.title || pageData.title,
      description: seo.description || pageData.subtitle,
      images: [pageData.heroImage],
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

export default async function DestinationTravelInsurancePage({ params }) {
  const { id } = await params;
  requireFeaturedDestination(id);

  const pageData = getDestinationTravelInsurancePage(id);
  if (!pageData) notFound();

  const destination = await resolveDestinationForTravelInsurance(id, pageData);
  if (!destination) notFound();

  const features = await getDestinationFeatures(id);
  const destName = pageData.destinationName || destination.fullName || destination.name;
  const pageUrl = `https://toptours.ai/destinations/${id}/travel-insurance`;
  const destinationUrl = `https://toptours.ai/destinations/${id}`;

  const faqMainEntity = (pageData.faqs || [])
    .filter((faq) => faq?.question && faq?.answer)
    .map((faq) => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: { '@type': 'Answer', text: faq.answer },
    }));

  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'WebPage',
        '@id': `${pageUrl}#webpage`,
        url: pageUrl,
        name: pageData.title,
        description: pageData.subtitle,
        primaryImageOfPage: {
          '@type': 'ImageObject',
          url: pageData.heroImage,
          width: 1200,
          height: 630,
        },
        isPartOf: {
          '@type': 'WebSite',
          '@id': 'https://toptours.ai/#website',
          name: 'TopTours.ai',
          url: 'https://toptours.ai',
        },
      },
      {
        '@type': 'Article',
        headline: pageData.title,
        description: pageData.subtitle,
        image: pageData.heroImage,
        author: { '@type': 'Organization', name: 'TopTours AI' },
        publisher: {
          '@type': 'Organization',
          name: 'TopTours AI',
          logo: { '@type': 'ImageObject', url: 'https://toptours.ai/logo.png' },
        },
        datePublished: pageData.schemaDatePublished || '2026-06-10',
        dateModified: pageData.schemaDateModified || pageData.schemaDatePublished || '2026-06-10',
      },
      ...(faqMainEntity.length > 0
        ? [{ '@type': 'FAQPage', mainEntity: faqMainEntity }]
        : []),
      {
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://toptours.ai' },
          {
            '@type': 'ListItem',
            position: 2,
            name: 'Destinations',
            item: 'https://toptours.ai/destinations',
          },
          { '@type': 'ListItem', position: 3, name: destName, item: destinationUrl },
          { '@type': 'ListItem', position: 4, name: 'Travel Insurance', item: pageUrl },
        ],
      },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <DestinationTravelInsuranceClient
        destination={destination}
        pageData={pageData}
        destinationFeatures={features}
      />
    </>
  );
}
