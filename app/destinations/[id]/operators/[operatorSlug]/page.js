import { notFound } from 'next/navigation';
import { requireFeaturedDestination } from '@/lib/requireFeaturedDestination';
import {
  isOperatorPagesEnabled,
  loadOperatorPageIndex,
  resolveOperatorPage,
  resolveDestinationForOperatorPages,
  buildOperatorIntro,
  getOperatorPagePath,
  getOperatorPagePilotSlugs,
} from '@/lib/operatorPages';
import OperatorDetailClient from './OperatorDetailClient';

export const revalidate = 604800; // 7 days

export async function generateStaticParams() {
  const params = [];
  for (const destSlug of getOperatorPagePilotSlugs()) {
    const index = loadOperatorPageIndex(destSlug);
    if (!index?.operators?.length) continue;
    for (const op of index.operators) {
      params.push({ id: destSlug, operatorSlug: op.slug });
    }
  }
  return params;
}

export async function generateMetadata({ params }) {
  const { id, operatorSlug } = await params;
  if (!isOperatorPagesEnabled(id)) return { robots: { index: false, follow: false } };

  const operator = resolveOperatorPage(id, operatorSlug);
  if (!operator) return { title: 'Operator not found' };

  const destination = resolveDestinationForOperatorPages(id);
  const destName = destination?.fullName || destination?.name || operator.destinationName || id;
  const title = `${operator.operatorName} Tours in ${destName} | Reviews & Booking`;
  const description =
    operator.blurb?.slice(0, 155) ||
    `${operator.averageRating && operator.totalReviews ? `${operator.averageRating}★ from ${operator.totalReviews.toLocaleString('en-US')} reviews. ` : ''}Browse ${operator.tourCount || operator.tours?.length || 0} ${operator.operatorName} experiences in ${destName}.`;
  const canonical = `https://toptours.ai${getOperatorPagePath(id, operatorSlug)}`;

  return {
    title,
    description,
    alternates: { canonical },
    openGraph: {
      title,
      description,
      url: canonical,
      type: 'website',
      siteName: 'TopTours.ai',
    },
    robots: {
      index: true,
      follow: true,
      googleBot: { index: true, follow: true },
    },
  };
}

export default async function OperatorDetailPage({ params }) {
  const { id, operatorSlug } = await params;
  requireFeaturedDestination(id);

  if (!isOperatorPagesEnabled(id)) {
    notFound();
  }

  const destination = resolveDestinationForOperatorPages(id);
  if (!destination) {
    notFound();
  }

  const operator = resolveOperatorPage(id, operatorSlug);
  if (!operator || !operator.tours?.length) {
    notFound();
  }

  const destName = destination.fullName || destination.name;
  const intro = buildOperatorIntro({
    operatorName: operator.operatorName,
    destinationName: destName,
  });

  const pageUrl = `https://toptours.ai${getOperatorPagePath(id, operatorSlug)}`;

  return (
    <OperatorDetailClient
      destination={destination}
      operator={operator}
      intro={intro}
      pageUrl={pageUrl}
    />
  );
}
