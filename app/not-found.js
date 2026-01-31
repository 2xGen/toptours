"use client";

import Link from 'next/link';
import NavigationNext from '@/components/NavigationNext';
import FooterNext from '@/components/FooterNext';
import { Compass, Home, MapPin, BookOpen, Info, Sparkles, Trophy, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function NotFound() {
  const popularPages = [
    { name: 'Home', path: '/', icon: Home, description: 'Back to homepage' },
    { name: 'Destinations', path: '/destinations', icon: MapPin, description: 'Explore destinations' },
    { name: 'Get Tour Recommendations', path: '/match-your-style', icon: Sparkles, description: 'Personalized tour recommendations' },
    { name: 'Travel Guides', path: '/travel-guides', icon: BookOpen, description: 'Read travel guides' },
    { name: 'About', path: '/about', icon: Info, description: 'About TopTours.ai™' },
    { name: 'Leaderboard', path: '/toptours', icon: Trophy, description: 'View top promoters' },
  ];

  return (
    <div className="min-h-screen flex flex-col">
      <NavigationNext />
      
      <main className="flex-grow flex items-center justify-center px-4 py-16 pt-24" style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
        <div className="text-center text-white max-w-4xl mx-auto w-full">
          {/* Compass Icon */}
          <div className="mb-8 animate-bounce">
            <div className="w-32 h-32 mx-auto bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
              <Compass className="h-16 w-16 text-white" />
            </div>
          </div>

          {/* 404 Text */}
          <h1 className="text-8xl font-bold mb-4">404</h1>
          <h2 className="text-3xl font-semibold mb-3">Page Not Found</h2>
          <p className="text-lg mb-2 max-w-md mx-auto opacity-90">
            We're sorry! The page you're looking for doesn't exist or may have been removed.
          </p>
          <p className="text-base mb-8 max-w-md mx-auto opacity-75">
            Let's help you find what you're looking for.
          </p>

          {/* Navigation Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-12">
            {popularPages.map((page) => {
              const Icon = page.icon;
              return (
                <Link
                  key={page.path}
                  href={page.path}
                  className="group bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl p-6 hover:bg-white/20 hover:border-white/30 transition-all duration-200 hover:scale-105 hover:shadow-xl"
                >
                  <div className="flex flex-col items-center text-center">
                    <div className="mb-3 p-3 bg-white/20 rounded-full group-hover:bg-white/30 transition-colors">
                      <Icon className="h-6 w-6 text-white" />
                    </div>
                    <h3 className="font-semibold text-lg mb-1">{page.name}</h3>
                    <p className="text-sm opacity-75">{page.description}</p>
                  </div>
                </Link>
              );
            })}
          </div>

          {/* Viator Affiliate Button */}
          <div className="mt-12 pt-8 border-t border-white/20">
            <p className="text-white/80 text-sm mb-4">
              Can't find what you're looking for? Browse thousands of tours on Viator
            </p>
            <Button
              asChild
              size="lg"
              className="bg-white text-purple-600 hover:bg-gray-100 font-semibold px-8 py-6 text-lg shadow-xl hover:scale-105 transition-all duration-200"
            >
              <a
                href="https://www.viator.com/?pid=P00276441&mcid=42383&medium=link&campaign=404"
                target="_blank"
                rel="noopener noreferrer"
              >
                Browse Tours on Viator
                <ExternalLink className="ml-2 h-5 w-5" />
              </a>
            </Button>
          </div>
        </div>
      </main>

      <FooterNext />
    </div>
  );
}

