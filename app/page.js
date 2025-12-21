import HomePageClient from './HomePageClient';

// Revalidate homepage every hour
export const revalidate = 3600;

export default async function HomePage() {
  return <HomePageClient />;
}
