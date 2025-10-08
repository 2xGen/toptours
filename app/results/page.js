"use client";
export const dynamic = 'force-dynamic';

import { Suspense } from 'react';

function ResultsContent() {
  return (
    <div className="min-h-screen pt-20 flex items-center justify-center">
      <div className="text-center text-white">
        <h1 className="text-3xl font-bold mb-4">Search Results</h1>
        <p>Feature being rebuilt - please use destination pages directly</p>
      </div>
    </div>
  );
}

export default function ResultsPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <ResultsContent />
    </Suspense>
  );
}

