"use client";
import React, { useEffect, useState, useRef } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion } from 'framer-motion';
import { Menu, X, UserCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { createSupabaseBrowserClient } from '@/lib/supabaseClient';

// Define navItems outside component to prevent hydration mismatches
const navItems = [
  { name: 'Home', path: '/' },
  { name: 'Destinations', path: '/destinations' },
  { name: 'Tours', path: '/tours' },
  { name: 'Restaurants', path: '/restaurants' },
  { name: 'Travel Guides', path: '/travel-guides' },
];

const NavigationNext = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [user, setUser] = useState(null);
  const [displayName, setDisplayName] = useState('');
  const [authLoading, setAuthLoading] = useState(true);
  const pathname = usePathname();
  const supabase = createSupabaseBrowserClient();
  const navRef = useRef(null);

  useEffect(() => {
    let isMounted = true;
    let fetchedForUser = null;
    (async () => {
      // Prefer session to reduce flicker
      const { data } = await supabase.auth.getSession();
      const sessionUser = data?.session?.user || null;
      if (!isMounted) return;
      setUser(sessionUser);
      if (sessionUser) {
        try {
          const { data: profile } = await supabase
            .from('profiles')
            .select('display_name')
            .eq('id', sessionUser.id)
            .single();
          const name =
            profile?.display_name ||
            (sessionUser.email ? sessionUser.email.split('@')[0] : 'Profile');
          setDisplayName(name);
          fetchedForUser = sessionUser.id;
        } catch {
          // If profile row doesn't exist yet, fall back to email prefix
          const fallback = sessionUser.email ? sessionUser.email.split('@')[0] : 'Profile';
          setDisplayName(fallback);
          fetchedForUser = sessionUser.id;
        }
      } else {
        setDisplayName('');
      }
      setAuthLoading(false);
    })();
    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user || null);
      if (session?.user) {
        // Avoid refetching repeatedly for the same user to prevent loops
        if (fetchedForUser === session.user.id) return;
        supabase
          .from('profiles')
          .select('display_name')
          .eq('id', session.user.id)
          .single()
          .then(({ data: profile }) => {
            const name =
              profile?.display_name ||
              (session.user.email ? session.user.email.split('@')[0] : 'Profile');
            setDisplayName(name);
            fetchedForUser = session.user.id;
          })
          .catch(() => {
            const fallback = session.user.email ? session.user.email.split('@')[0] : 'Profile';
            setDisplayName(fallback);
            fetchedForUser = session.user.id;
          });
      } else {
        setDisplayName('');
      }
    });
    return () => {
      isMounted = false;
      sub.subscription?.unsubscribe?.();
    };
  }, [supabase]);

  // Close menu when pathname changes (navigation occurred)
  useEffect(() => {
    setIsOpen(false);
  }, [pathname]);

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (isOpen && navRef.current && !navRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('touchstart', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
    };
  }, [isOpen]);

  return (
    <nav ref={navRef} className="fixed top-0 left-0 right-0 z-50 glass-effect">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link href="/" prefetch={true} className="flex items-center">
            <span className="font-poppins font-bold text-xl text-white">TopTours.ai<span className="text-xs align-super ml-1">™</span></span>
          </Link>

          <div className="hidden md:flex items-center space-x-8">
            {navItems.map((item) => {
              const isActive = item.path === '/' 
                ? pathname === '/' 
                : pathname.startsWith(item.path);
              return (
                <Link
                  key={item.name}
                  href={item.path}
                  prefetch={true}
                  className={`text-white hover:text-blue-200 transition-colors ${
                    isActive ? 'font-semibold text-blue-100' : ''
                  }`}
                >
                  {item.name}
                </Link>
              );
            })}
            <Link
              href="/match-your-style"
              prefetch={true}
              className={`px-4 py-2 rounded-lg font-semibold transition-all ${
                pathname === '/match-your-style'
                  ? 'sunset-gradient text-white shadow-lg'
                  : 'sunset-gradient text-white hover:opacity-90 hover:shadow-md'
              }`}
            >
              Match Your Style
            </Link>
            <div className="ml-2 flex items-center gap-2">
              {!authLoading && user ? (
                <Link
                  href="/profile"
                  prefetch={true}
                  className="p-2 rounded-full bg-white/20 text-white hover:bg-white/30 transition-colors"
                  aria-label={`Profile: ${displayName}`}
                  title={`Profile: ${displayName}`}
                >
                  <UserCircle2 className="h-6 w-6" />
                </Link>
              ) : (
                <Link href="/auth" prefetch={true} aria-label="Sign in" className="p-2 text-white hover:text-blue-200 transition-colors">
                  <UserCircle2 className="h-6 w-6" />
                </Link>
              )}
            </div>
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
            {navItems.map((item) => {
              const isActive = item.path === '/' 
                ? pathname === '/' 
                : pathname.startsWith(item.path);
              return (
                <Link
                  key={item.name}
                  href={item.path}
                  prefetch={true}
                  className={`block py-2 text-white hover:text-yellow-300 transition-colors duration-200 ${
                    isActive ? 'text-yellow-300 font-semibold' : ''
                  }`}
                  onClick={() => setIsOpen(false)}
                >
                  {item.name}
                </Link>
              );
            })}
            <Link
              href="/match-your-style"
              prefetch={true}
              className={`block py-2 px-4 rounded-lg font-semibold text-center transition-all mt-2 ${
                pathname === '/match-your-style'
                  ? 'sunset-gradient text-white shadow-lg'
                  : 'sunset-gradient text-white hover:opacity-90'
              }`}
              onClick={() => setIsOpen(false)}
            >
              Match Your Style
            </Link>
            {/* Auth Section */}
            <div className="mt-4 pt-4 border-t border-white/20">
              {!authLoading && user ? (
                <Link
                  href="/profile"
                  prefetch={true}
                  className="flex items-center justify-center gap-2 py-2 px-3 rounded-full bg-white/20 text-white hover:bg-white/30 transition-colors text-sm font-medium"
                  onClick={() => setIsOpen(false)}
                  title={`Profile: ${displayName || 'Profile'}`}
                >
                  <UserCircle2 className="w-5 h-5" />
                  <span>{displayName || 'Profile'}</span>
                </Link>
              ) : (
                <Link
                  href="/auth"
                  prefetch={true}
                  className="block py-2 px-3 rounded-full bg-white/20 text-white hover:bg-white/30 transition-colors text-sm font-medium text-center"
                  onClick={() => setIsOpen(false)}
                >
                  Sign In / Sign Up
                </Link>
              )}
            </div>
          </motion.div>
        )}
      </div>
    </nav>
  );
};

export default NavigationNext;

