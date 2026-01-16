import { Suspense } from 'react';
import { fetchProductRecommendations, fetchRecommendedTours } from '@/lib/viatorRecommendations';
import RecommendedToursList from './RecommendedToursList';

async function RecommendedToursContent({ productId, tour, destinationData }) {
  let recommendedTours = [];
  
  try {
    const recommendedProductCodes = await fetchProductRecommendations(productId);
    if (recommendedProductCodes && recommendedProductCodes.length > 0) {
      recommendedTours = await fetchRecommendedTours(recommendedProductCodes.slice(0, 6));
    }
  } catch (error) {
    console.error('Error fetching recommended tours:', error);
  }

  if (recommendedTours.length === 0) {
    return null;
  }
  
  return (
    <RecommendedToursList 
      recommendedTours={recommendedTours}
      tour={tour}
    />
  );
}

function RecommendedToursSkeleton() {
  return (
    <section className="mt-16">
      <div className="mb-6">
        <div className="h-9 bg-gray-200 rounded w-64 animate-pulse" />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div key={i} className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="h-48 bg-gray-200 animate-pulse" />
            <div className="p-4 space-y-3">
              <div className="h-5 bg-gray-200 rounded w-3/4 animate-pulse" />
              <div className="h-4 bg-gray-200 rounded w-1/2 animate-pulse" />
              <div className="h-6 bg-gray-200 rounded w-24 animate-pulse" />
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

export default function RecommendedToursSection({ productId, tour, destinationData }) {
  return (
    <Suspense fallback={<RecommendedToursSkeleton />}>
      <RecommendedToursContent 
        productId={productId}
        tour={tour}
        destinationData={destinationData}
      />
    </Suspense>
  );
}
