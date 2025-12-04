"use client";
import { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Crown,
  Calendar,
  ExternalLink,
  MapPin,
  BookOpen,
  UtensilsCrossed,
  ArrowRight,
  X,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { 
  COLOR_SCHEMES, 
  CTA_OPTIONS,
  getPremiumConfig,
} from '@/lib/restaurantPremium';

// Icon mapping for CTAs
const ICON_MAP = {
  calendar: Calendar,
  'external-link': ExternalLink,
  'map-pin': MapPin,
  'book-open': BookOpen,
  utensils: UtensilsCrossed,
  clock: Calendar,
  'arrow-right': ArrowRight,
};

/**
 * Premium Hero CTA Button
 * Displayed in the hero section for premium restaurants
 */
export function PremiumHeroCTA({ subscription, restaurant, user, onAuthRequired, fullWidth = false }) {
  const config = getPremiumConfig(subscription);
  if (!config) return null;

  const cta = config.heroCTA;
  const colorScheme = config.colorScheme;
  const Icon = ICON_MAP[cta.icon] || ArrowRight;

  const handleClick = () => {
    if (!user) {
      onAuthRequired?.();
      return;
    }
    const url = restaurant.booking?.partnerUrl || restaurant.contact?.website;
    if (url) {
      window.open(url, '_blank', 'noopener,noreferrer');
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: 0.2 }}
      className={fullWidth ? 'w-full' : ''}
    >
      <Button
        onClick={handleClick}
        className={`${colorScheme.buttonClass} font-semibold shadow-lg hover:shadow-xl transition-all hover:scale-105 ${
          fullWidth ? 'w-full py-4 text-lg' : 'px-6 py-2'
        }`}
      >
        <Icon className={fullWidth ? 'w-5 h-5 mr-2' : 'w-4 h-4 mr-2'} />
        {cta.text}
      </Button>
    </motion.div>
  );
}

/**
 * Premium Mid-Page CTA Banner
 * Displayed in the middle of the page for premium restaurants
 */
export function PremiumMidCTA({ subscription, restaurant, user, onAuthRequired }) {
  const config = getPremiumConfig(subscription);
  if (!config) return null;

  const cta = config.midCTA;
  const colorScheme = config.colorScheme;

  const handleClick = () => {
    if (!user) {
      onAuthRequired?.();
      return;
    }
    const url = restaurant.booking?.partnerUrl || restaurant.contact?.website;
    if (url) {
      window.open(url, '_blank', 'noopener,noreferrer');
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="my-8"
    >
      <div className={`rounded-2xl p-6 md:p-8 ${colorScheme.badgeClass} border`}>
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="text-center md:text-left">
            <p className="text-lg md:text-xl font-bold text-gray-900">{cta.text}</p>
            <p className="text-gray-600">{cta.subtext}</p>
          </div>
          <Button
            onClick={handleClick}
            className={`${colorScheme.buttonClass} font-semibold px-6 py-3 whitespace-nowrap`}
          >
            {restaurant.booking?.partnerUrl ? 'Reserve Now' : 'Visit Website'}
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </div>
      </div>
    </motion.div>
  );
}

/**
 * Premium End CTA Section
 * Displayed at the end of the page for premium restaurants
 */
export function PremiumEndCTA({ subscription, restaurant, user, onAuthRequired }) {
  const config = getPremiumConfig(subscription);
  if (!config) return null;

  const cta = config.endCTA;
  const colorScheme = config.colorScheme;
  const Icon = ICON_MAP[cta.icon] || ArrowRight;

  const handleClick = () => {
    if (!user) {
      onAuthRequired?.();
      return;
    }
    const url = restaurant.booking?.partnerUrl || restaurant.contact?.website;
    if (url) {
      window.open(url, '_blank', 'noopener,noreferrer');
    }
  };

  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="py-12 sm:py-16 bg-amber-50 border-y border-amber-200"
    >
      <div className="max-w-4xl mx-auto px-4 text-center">
        <div className="inline-flex items-center gap-2 bg-amber-500 text-white rounded-full px-4 py-1.5 mb-4 shadow-sm">
          <Crown className="w-4 h-4" />
          <span className="text-sm font-semibold">Featured Restaurant</span>
        </div>
        <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">
          Ready to experience {restaurant.name}?
        </h2>
        <p className="text-gray-700 mb-6 max-w-2xl mx-auto">
          Don't miss out on this dining experience. 
          {restaurant.booking?.partnerUrl 
            ? ' Reserve your table now to secure your spot.'
            : ' Visit their website for more information.'}
        </p>
        <Button
          onClick={handleClick}
          size="lg"
          className={`${colorScheme.buttonClass} font-semibold px-8 py-4 text-lg shadow-lg hover:shadow-xl transition-all hover:scale-105`}
        >
          {cta.text}
          <Icon className="w-5 h-5 ml-2" />
        </Button>
      </div>
    </motion.section>
  );
}

/**
 * Premium Sticky CTA Button
 * Fixed button that follows the user as they scroll
 */
export function PremiumStickyCTA({ subscription, restaurant, user, onAuthRequired }) {
  const [isVisible, setIsVisible] = useState(true);
  const config = getPremiumConfig(subscription);
  if (!config || !isVisible) return null;

  const cta = config.stickyCTA;
  const colorScheme = config.colorScheme;
  const Icon = ICON_MAP[cta.icon] || ArrowRight;

  const handleClick = () => {
    if (!user) {
      onAuthRequired?.();
      return;
    }
    const url = restaurant.booking?.partnerUrl || restaurant.contact?.website;
    if (url) {
      window.open(url, '_blank', 'noopener,noreferrer');
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="fixed bottom-4 right-4 md:bottom-6 md:right-6 z-40"
    >
      <div className="flex flex-col items-end gap-2">
        <button
          onClick={() => setIsVisible(false)}
          className="w-8 h-8 bg-white hover:bg-gray-100 rounded-full flex items-center justify-center shadow-lg border border-gray-200 transition-all"
          aria-label="Close"
        >
          <X className="w-4 h-4 text-gray-600" />
        </button>
        <Button
          onClick={handleClick}
          size="lg"
          className={`${colorScheme.stickyClass} shadow-2xl hover:shadow-3xl transition-all duration-300 hover:scale-105 px-5 py-4 md:px-6 md:py-5 rounded-full font-semibold`}
        >
          <Icon className="w-5 h-5 mr-2" />
          {cta.text}
        </Button>
      </div>
    </motion.div>
  );
}

/**
 * Premium Crown Badge
 * Small crown icon displayed next to restaurant name
 */
export function PremiumBadge({ subscription, className = '' }) {
  const config = getPremiumConfig(subscription);
  if (!config) return null;

  return (
    <span 
      className={`inline-flex items-center justify-center ${className}`}
      title="Premium Partner Restaurant"
    >
      <Crown className="w-5 h-5 text-amber-500" />
    </span>
  );
}

/**
 * Combined Premium Badge with animation
 */
export function AnimatedPremiumBadge({ subscription }) {
  const config = getPremiumConfig(subscription);
  if (!config) return null;

  return (
    <motion.span
      initial={{ scale: 0, rotate: -45 }}
      animate={{ scale: 1, rotate: 0 }}
      transition={{ type: 'spring', stiffness: 500, damping: 20 }}
      className="inline-flex items-center gap-1 bg-gradient-to-r from-amber-400 to-orange-400 text-white px-2 py-0.5 rounded-full text-xs font-bold shadow-sm"
    >
      <Crown className="w-3 h-3" />
      TOP
    </motion.span>
  );
}

