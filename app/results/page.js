"use client";
export const dynamic = 'force-dynamic';

import { Suspense } from 'react';
import Results from './ResultsClient';

export default function ResultsPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen pt-20 flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
          <p className="text-gray-600">Loading search results...</p>
        </div>
      </div>
    }>
      <Results />
    </Suspense>
  );
}
