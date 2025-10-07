import React from 'react';

const NotFound = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500">
      {/* 404 Content */}
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center text-white px-4">
          {/* 404 Text */}
          <h1 className="text-8xl font-bold mb-4">404</h1>
          <h2 className="text-3xl font-semibold mb-4">Page Not Found</h2>
          <p className="text-xl mb-8 max-w-md mx-auto opacity-90">
            Looks like you've taken a wrong turn! The page you're looking for doesn't exist.
          </p>

          {/* Action Button */}
          <div className="space-y-4">
            <a 
              href="/" 
              className="inline-block bg-white text-indigo-600 font-semibold px-8 py-3 rounded-lg hover:bg-gray-100 transition-colors duration-200 shadow-lg"
            >
              🏠 Go to Homepage
            </a>
          </div>

          {/* Helpful Links */}
          <div className="mt-12 pt-8 border-t border-white/20">
            <p className="text-sm opacity-75 mb-4">Popular pages:</p>
            <div className="flex flex-wrap justify-center gap-4 text-sm">
              <a href="/about" className="hover:underline opacity-75 hover:opacity-100 transition-opacity">About</a>
              <a href="/how-it-works" className="hover:underline opacity-75 hover:opacity-100 transition-opacity">How It Works</a>
              <a href="/blog" className="hover:underline opacity-75 hover:opacity-100 transition-opacity">Blog</a>
              <a href="/contact" className="hover:underline opacity-75 hover:opacity-100 transition-opacity">Contact</a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotFound; 