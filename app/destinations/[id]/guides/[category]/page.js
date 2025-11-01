import { destinations } from '../../../../../src/data/destinationsData';
import { categoryGuides as categoryGuidesBase } from '../guidesData';
import { categoryGuidesNorthAmerica } from '../guidesData-north-america';
import { categoryGuidesAfrica } from '../guidesData-africa';
import { categoryGuidesSouthAmerica } from '../guidesData-south-america';
import { categoryGuidesAsiaPacificPart1 } from '../guidesData-asia-pacific-part1';
import { categoryGuidesAsiaPacificPart2 } from '../guidesData-asia-pacific-part2';
import CategoryGuideClient from './CategoryGuideClient';
import { notFound } from 'next/navigation';

// Merge all regional guide files
const categoryGuides = {
  ...categoryGuidesBase,
  ...categoryGuidesNorthAmerica,
  ...categoryGuidesAfrica,
  ...categoryGuidesSouthAmerica,
  ...categoryGuidesAsiaPacificPart1,
  ...categoryGuidesAsiaPacificPart2,
};

// Generate metadata for SEO
export async function generateMetadata({ params }) {
  const { id: destinationId, category: categorySlug } = await params;
  
  const destination = destinations.find(d => d.id === destinationId);
  const guideData = categoryGuides[destinationId]?.[categorySlug];
  
  if (!destination || !guideData) {
    return {
      title: 'Guide Not Found',
    };
  }

  return {
    title: guideData.seo.title,
    description: guideData.seo.description,
    keywords: guideData.seo.keywords,
    openGraph: {
      title: guideData.seo.title,
      description: guideData.seo.description,
      images: [guideData.heroImage || destination.imageUrl],
      type: 'article',
    },
    twitter: {
      card: 'summary_large_image',
      title: guideData.seo.title,
      description: guideData.seo.description,
      images: [guideData.heroImage || destination.imageUrl],
    },
    alternates: {
      canonical: `/destinations/${destinationId}/guides/${categorySlug}`,
    },
  };
}

// Generate static params for all destination-category combinations
export async function generateStaticParams() {
  const params = [];
  
  destinations.forEach(destination => {
    // For now, we'll just generate params for guides that exist
    const guides = categoryGuides[destination.id];
    if (guides) {
      Object.keys(guides).forEach(categorySlug => {
        params.push({
          id: destination.id,
          category: categorySlug,
        });
      });
    }
  });
  
  return params;
}

export default async function CategoryGuidePage({ params }) {
  const { id: destinationId, category: categorySlug } = await params;
  
  const destination = destinations.find(d => d.id === destinationId);
  const guideData = categoryGuides[destinationId]?.[categorySlug];
  
  if (!destination || !guideData) {
    notFound();
  }

  // JSON-LD Schema for SEO
  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'Article',
        headline: guideData.title,
        description: guideData.subtitle,
        image: guideData.heroImage || destination.imageUrl,
        author: {
          '@type': 'Organization',
          name: 'TopTours AI',
        },
        publisher: {
          '@type': 'Organization',
          name: 'TopTours AI',
          logo: {
            '@type': 'ImageObject',
            url: 'https://toptours.ai/logo.png',
          },
        },
        datePublished: '2025-10-10',
        dateModified: '2025-10-10',
      },
      {
        '@type': 'FAQPage',
        mainEntity: guideData.faqs.map(faq => ({
          '@type': 'Question',
          name: faq.question,
          acceptedAnswer: {
            '@type': 'Answer',
            text: faq.answer,
          },
        })),
      },
      {
        '@type': 'BreadcrumbList',
        itemListElement: [
          {
            '@type': 'ListItem',
            position: 1,
            name: 'Home',
            item: 'https://toptours.ai',
          },
          {
            '@type': 'ListItem',
            position: 2,
            name: 'Destinations',
            item: 'https://toptours.ai/destinations',
          },
          {
            '@type': 'ListItem',
            position: 3,
            name: destination.name,
            item: `https://toptours.ai/destinations/${destinationId}`,
          },
          {
            '@type': 'ListItem',
            position: 4,
            name: guideData.title,
            item: `https://toptours.ai/destinations/${destinationId}/guides/${categorySlug}`,
          },
        ],
      },
      {
        '@type': 'TouristAttraction',
        name: `${guideData.categoryName} in ${destination.name}`,
        description: guideData.subtitle,
        image: guideData.heroImage || destination.imageUrl,
        address: {
          '@type': 'PostalAddress',
          addressCountry: destination.category,
        },
      },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <CategoryGuideClient 
        destinationId={destinationId} 
        categorySlug={categorySlug}
        guideData={guideData}
      />
    </>
  );
}

