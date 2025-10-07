import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Menu, X, Compass } from 'lucide-react';
import { Button } from '@/components/ui/button';

const Navigation = ({ onOpenModal }) => {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();

  const navItems = [
    { name: 'Home', path: '/' },
    { name: 'How It Works', path: '/how-it-works' },
    { name: 'Destinations', path: '/destinations' },
    { name: 'Travel Guides', path: '/travel-guides' },
    { name: 'About', path: '/about' },
  ];

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 glass-effect">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link to="/" className="flex items-center space-x-2">
            <Compass className="h-8 w-8 text-white" />
            <span className="font-poppins font-bold text-xl text-white">TopTours.ai</span>
          </Link>

          <div className="hidden md:flex items-center space-x-8">
            <Link to="/" className="text-white hover:text-blue-200 transition-colors">
              Home
            </Link>
            <Link to="/how-it-works" className="text-white hover:text-blue-200 transition-colors">
              How It Works
            </Link>
            <Link to="/destinations" className="text-white hover:text-blue-200 transition-colors">
              Destinations
            </Link>
            <Link to="/travel-guides" className="text-white hover:text-blue-200 transition-colors">
              Travel Guides
            </Link>
            <Link to="/about" className="text-white hover:text-blue-200 transition-colors">
              About
            </Link>
            <Button 
              onClick={onOpenModal}
              className="sunset-gradient text-white font-semibold hover:scale-105 transition-transform duration-200"
            >
              Start Planning
            </Button>
          </div>

          <div className="md:hidden">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsOpen(!isOpen)}
              className="text-white"
            >
              {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </Button>
          </div>
        </div>

        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="md:hidden bg-slate-900/80 backdrop-blur-lg rounded-lg mt-2 p-4"
          >
            {navItems.map((item) => (
              <Link
                key={item.name}
                to={item.path}
                className={`block py-2 text-white hover:text-yellow-300 transition-colors duration-200 ${
                  location.pathname === item.path ? 'text-yellow-300 font-semibold' : ''
                }`}
                onClick={() => setIsOpen(false)}
              >
                {item.name}
              </Link>
            ))}
            <Button 
              onClick={() => {
                onOpenModal();
                setIsOpen(false);
              }}
              className="w-full mt-4 sunset-gradient text-white font-semibold"
            >
              Start Planning
            </Button>
          </motion.div>
        )}
      </div>
    </nav>
  );
};

export default Navigation;
