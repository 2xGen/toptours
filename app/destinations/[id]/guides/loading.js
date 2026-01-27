export default function GuidesListingLoading() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="fixed top-0 left-0 right-0 z-50 h-16 bg-slate-900/80 backdrop-blur-lg" />
      <div className="pt-24 pb-16 ocean-gradient">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="animate-pulse">
            <div className="h-8 bg-white/20 rounded-lg w-48 mb-4" />
            <div className="h-10 bg-white/20 rounded-lg w-64 max-w-full mb-4" />
            <div className="h-5 bg-white/20 rounded-lg w-full max-w-2xl" />
          </div>
        </div>
      </div>
      <div className="bg-white border-b border-gray-100 py-3">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="h-4 bg-gray-200 rounded w-64 animate-pulse" />
        </div>
      </div>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="animate-pulse space-y-12">
          <div className="h-4 bg-gray-200 rounded w-full max-w-2xl mx-auto" />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
                <div className="p-6 space-y-3">
                  <div className="h-12 w-12 bg-gray-200 rounded-xl" />
                  <div className="h-5 bg-gray-200 rounded w-3/4" />
                  <div className="h-4 bg-gray-200 rounded w-full" />
                  <div className="h-4 bg-gray-200 rounded w-5/6" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
      <div className="h-64 bg-gray-100" />
    </div>
  );
}
