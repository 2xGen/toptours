export default function CarRentalsLoading() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="fixed top-0 left-0 right-0 z-50 h-16 bg-slate-900/80 backdrop-blur-lg" />
      <div className="pt-24 pb-16 ocean-gradient">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="animate-pulse">
            <div className="h-10 bg-white/20 rounded w-48 mb-4" />
            <div className="h-8 bg-white/20 rounded w-3/4 max-w-xl mb-2" />
            <div className="h-16 bg-white/20 rounded w-full max-w-2xl" />
          </div>
        </div>
      </div>
      <div className="bg-white border-b py-3">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="h-4 bg-gray-200 rounded w-64 animate-pulse" />
        </div>
      </div>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="animate-pulse space-y-8">
          <div className="flex flex-wrap gap-2 justify-center">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="h-8 bg-gray-200 rounded-full w-28" />
            ))}
          </div>
          <div className="h-32 bg-gray-100 rounded-xl" />
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="h-48 bg-gray-100 rounded-xl" />
            <div className="h-48 bg-gray-100 rounded-xl" />
          </div>
          <div className="h-12 bg-gray-200 rounded-lg w-56 mx-auto" />
        </div>
      </div>
      <div className="h-64 bg-gray-100" />
    </div>
  );
}
