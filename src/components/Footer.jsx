import React from 'react';
import { Link } from 'react-router-dom';
import { Compass, Facebook, Instagram } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-gray-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center space-x-2 mb-4">
              <Compass className="h-8 w-8 text-yellow-400" />
              <span className="font-poppins font-bold text-xl">TopTours.ai</span>
            </div>
            <p className="text-gray-300 mb-4 max-w-md">
              Discover amazing tours and activities worldwide with AI-powered recommendations. 
              Smart travel planning made simple and personalized just for you.
            </p>
            <div className="flex space-x-4">
              <a 
                href="https://www.facebook.com/profile.php?id=61573639234569" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-white transition-colors"
              >
                <Facebook className="h-6 w-6" />
              </a>
              <a 
                href="https://www.instagram.com/toptours.ai/?hl=en" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-white transition-colors"
              >
                <Instagram className="h-6 w-6" />
              </a>
              <a 
                href="https://www.tiktok.com/@toptours.ai" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-white transition-colors"
              >
                <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z"/>
                </svg>
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <span className="font-semibold text-lg mb-4 block">Quick Links</span>
            <ul className="space-y-2">
              <li><Link to="/" className="text-gray-300 hover:text-white transition-colors">Home</Link></li>
              <li><Link to="/how-it-works" className="text-gray-300 hover:text-white transition-colors">How It Works</Link></li>
              <li><Link to="/about" className="text-gray-300 hover:text-white transition-colors">About Us</Link></li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <span className="font-semibold text-lg mb-4 block">Legal</span>
            <ul className="space-y-2">
              <li><Link to="/terms" className="text-gray-300 hover:text-white transition-colors">Terms of Service</Link></li>
              <li><Link to="/disclosure" onClick={() => window.scrollTo(0, 0)} className="text-gray-300 hover:text-white transition-colors">Affiliate Disclosure</Link></li>
              <li><Link to="/contact" className="text-gray-300 hover:text-white transition-colors">Contact</Link></li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-700 mt-8 pt-8 text-center">
          <p className="text-gray-400">
            © 2025 TopTours.ai. All rights reserved. | 
            <Link to="/disclosure" className="text-yellow-400 hover:text-yellow-300 ml-1">
              Affiliate Disclosure
            </Link>
          </p>
          <p className="text-gray-500 text-sm mt-2">
            We may earn a commission from bookings made through our affiliate links at no extra cost to you.
          </p>
          <p className="text-gray-500 text-sm mt-2">
            <a 
              href="https://toptours.ai/" 
              target="_blank" 
              rel="nofollow noopener noreferrer"
              className="text-yellow-400 hover:text-yellow-300 transition-colors"
            >
              TopTours.ai
            </a>
            {' '}is proudly built by{' '}
            <Link 
              to="/2xgen"
              className="text-yellow-400 hover:text-yellow-300 transition-colors"
            >
              2xGen
            </Link>
            {' '}— creators of next-gen digital platforms, including{' '}
            <a 
              href="https://mygoprofile.com/" 
              target="_blank" 
              rel="nofollow noopener noreferrer"
              className="text-yellow-400 hover:text-yellow-300 transition-colors"
            >
              MyGoProfile
            </a>
            ,{' '}
            <a 
              href="https://factuurbaas.nl/" 
              target="_blank" 
              rel="nofollow noopener noreferrer"
              className="text-yellow-400 hover:text-yellow-300 transition-colors"
            >
              FactuurBaas
            </a>
            {' '}and{' '}
            <a 
              href="https://arubabuddies.com/" 
              target="_blank" 
              rel="nofollow noopener noreferrer"
              className="text-yellow-400 hover:text-yellow-300 transition-colors"
            >
              ArubaBuddies
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
