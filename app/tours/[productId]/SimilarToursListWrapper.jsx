"use client";

import SimilarToursList from './SimilarToursList';

export default function SimilarToursListWrapper({ similarTours, tour, destinationData }) {
  return (
    <SimilarToursList 
      similarTours={similarTours}
      tour={tour}
      destinationData={destinationData}
    />
  );
}
