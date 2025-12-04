import { getLeaderboardTours, getTopPromoters } from '@/lib/promotionSystem';
import HomePageClient from './HomePageClient';

// Revalidate homepage every 60 seconds for fresh leaderboard data
// This balances cost savings with freshness
export const revalidate = 60;

export default async function HomePage() {
  let formattedTours = [];
  let topPromoters = [];

  try {
    // Fetch top 3 tours from leaderboard (past 28 days) - lightweight, uses cached metadata
    const topTours = await getLeaderboardTours({
      scoreType: 'last_month', // past_28_days_score
      region: null,
      limit: 3,
      offset: 0,
    });

    // Format tours for display (using cached metadata only - no API calls)
    formattedTours = (topTours || []).map((tour) => ({
      productId: tour.product_id,
      title: tour.tour_name || 'Tour',
      image: tour.tour_image_url || null,
      location: tour.tour_region ? tour.tour_region.replace('_', ' ') : 'Various Locations',
      score: tour.past_28_days_score || 0,
      slug: tour.tour_slug || null,
    }));
  } catch (error) {
    console.error('Error fetching top tours for homepage:', error);
    // Continue with empty array - component will handle gracefully
  }

  try {
    // Fetch top 3 promoters - lightweight, just database queries
    topPromoters = await getTopPromoters(3) || [];
  } catch (error) {
    console.error('Error fetching top promoters for homepage:', error);
    // Continue with empty array - component will handle gracefully
  }

  return <HomePageClient topTours={formattedTours} topPromoters={topPromoters} />;
}
