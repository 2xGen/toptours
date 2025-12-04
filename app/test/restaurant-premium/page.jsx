"use client";
import { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Crown,
  Star,
  MapPin,
  Phone,
  Globe,
  Clock,
  ArrowRight,
  Calendar,
  ExternalLink,
  X,
  Check,
  Utensils,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { 
  COLOR_SCHEMES, 
  CTA_OPTIONS,
} from '@/lib/restaurantPremium';

// Mock restaurant data
const MOCK_RESTAURANT = {
  id: 9999,
  name: "La Bella Vista",
  tagline: "Authentic Italian Cuisine with Ocean Views",
  description: "Experience the finest Italian cuisine with breathtaking panoramic views of the Mediterranean. Our award-winning chef brings traditional recipes with a modern twist.",
  rating: 4.8,
  reviewCount: 324,
  priceRange: "$$$",
  cuisines: ["Italian", "Mediterranean", "Seafood"],
  address: "123 Oceanview Boulevard, Amsterdam",
  phone: "+31 20 123 4567",
  website: "https://labellvista.example.com",
  heroImage: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=1200&h=600&fit=crop",
  openingHours: "Mon-Sun: 12:00 - 23:00",
};

// Icon mapping
const ICON_MAP = {
  calendar: Calendar,
  'external-link': ExternalLink,
  'map-pin': MapPin,
  'arrow-right': ArrowRight,
};

export default function RestaurantPremiumTestPage() {
  // Customization state
  const [colorScheme, setColorScheme] = useState('blue');
  const [heroCTAIndex, setHeroCTAIndex] = useState(0);
  const [midCTAIndex, setMidCTAIndex] = useState(0);
  const [stickyCTAIndex, setStickyCTAIndex] = useState(0);
  const [showStickyButton, setShowStickyButton] = useState(true);

  const color = COLOR_SCHEMES[colorScheme];
  const heroCTA = CTA_OPTIONS.hero[heroCTAIndex];
  const midCTA = CTA_OPTIONS.mid[midCTAIndex];
  const stickyCTA = CTA_OPTIONS.sticky[stickyCTAIndex];
  const HeroIcon = ICON_MAP[heroCTA?.icon] || ArrowRight;
  const StickyIcon = ICON_MAP[stickyCTA?.icon] || ArrowRight;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Control Panel */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex flex-wrap items-center gap-6">
            <div className="flex items-center gap-2">
              <Crown className="w-5 h-5 text-amber-500" />
              <span className="font-bold text-gray-900">Premium Preview</span>
            </div>
            
            {/* Color Scheme */}
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600">Button Color:</span>
              <div className="flex gap-1">
                {Object.entries(COLOR_SCHEMES).map(([key, scheme]) => (
                  <button
                    key={key}
                    onClick={() => setColorScheme(key)}
                    className={`w-6 h-6 rounded-full ${scheme.buttonClass} ${colorScheme === key ? 'ring-2 ring-offset-2 ring-gray-400' : ''}`}
                    title={scheme.name}
                  />
                ))}
              </div>
            </div>

            {/* Hero CTA */}
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600">Hero:</span>
              <select 
                value={heroCTAIndex}
                onChange={(e) => setHeroCTAIndex(parseInt(e.target.value))}
                className="text-sm border rounded px-2 py-1"
              >
                {CTA_OPTIONS.hero.map((cta, i) => (
                  <option key={i} value={i}>{cta.text}</option>
                ))}
              </select>
            </div>

            {/* Mid CTA */}
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600">Mid:</span>
              <select 
                value={midCTAIndex}
                onChange={(e) => setMidCTAIndex(parseInt(e.target.value))}
                className="text-sm border rounded px-2 py-1"
              >
                {CTA_OPTIONS.mid.map((cta, i) => (
                  <option key={i} value={i}>{cta.text}</option>
                ))}
              </select>
            </div>

            {/* Sticky CTA */}
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600">Sticky:</span>
              <select 
                value={stickyCTAIndex}
                onChange={(e) => setStickyCTAIndex(parseInt(e.target.value))}
                className="text-sm border rounded px-2 py-1"
              >
                {CTA_OPTIONS.sticky.map((cta, i) => (
                  <option key={i} value={i}>{cta.text}</option>
                ))}
              </select>
            </div>

            <button
              onClick={() => setShowStickyButton(true)}
              className="text-sm text-blue-600 hover:underline"
            >
              Show Sticky
            </button>
          </div>
        </div>
      </div>

      {/* Hero Section */}
      <div className="relative h-[60vh] min-h-[400px]">
        <div 
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url(${MOCK_RESTAURANT.heroImage})` }}
        />
        <div className="absolute inset-0 bg-gradient-to-br from-blue-600/80 via-indigo-600/70 to-purple-700/80" />
        
        <div className="relative h-full flex flex-col justify-end pb-12 px-4">
          <div className="max-w-7xl mx-auto w-full">
            {/* Premium Badge */}
            <motion.span
              initial={{ scale: 0, rotate: -45 }}
              animate={{ scale: 1, rotate: 0 }}
              className="inline-flex items-center gap-1 bg-gradient-to-r from-amber-400 to-orange-400 text-white px-3 py-1 rounded-full text-sm font-bold shadow-lg mb-4"
            >
              <Crown className="w-4 h-4" />
              TOP RESTAURANT
            </motion.span>

            <h1 className="text-4xl md:text-5xl font-bold text-white mb-2 flex items-center gap-3">
              {MOCK_RESTAURANT.name}
              <Crown className="w-8 h-8 text-amber-400" />
            </h1>
            
            <p className="text-xl text-white/90 mb-4">{MOCK_RESTAURANT.tagline}</p>
            
            <div className="flex flex-wrap items-center gap-4 text-white/80 mb-6">
              <span className="flex items-center gap-1">
                <Star className="w-5 h-5 text-yellow-400 fill-yellow-400" />
                {MOCK_RESTAURANT.rating} ({MOCK_RESTAURANT.reviewCount} reviews)
              </span>
              <span>{MOCK_RESTAURANT.priceRange}</span>
              <span>{MOCK_RESTAURANT.cuisines.join(" • ")}</span>
            </div>

            {/* Action Buttons including Premium Hero CTA */}
            <div className="flex flex-wrap gap-3">
              {/* Premium Hero CTA */}
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.2 }}
              >
                <Button
                  className={`${color.buttonClass} font-semibold px-6 py-2 shadow-lg hover:shadow-xl transition-all`}
                >
                  <HeroIcon className="w-4 h-4 mr-2" />
                  {heroCTA?.text}
                </Button>
              </motion.div>

              <Button className="bg-white/20 backdrop-blur-sm text-white hover:bg-white/30">
                <MapPin className="w-4 h-4 mr-2" />
                View on Map
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 py-12">
        {/* Restaurant Info */}
        <div className="grid md:grid-cols-3 gap-8 mb-12">
          <div className="md:col-span-2">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">About</h2>
            <p className="text-gray-700 leading-relaxed mb-6">{MOCK_RESTAURANT.description}</p>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center gap-3 p-4 bg-white rounded-lg border">
                <MapPin className="w-5 h-5 text-gray-500" />
                <span className="text-sm text-gray-700">{MOCK_RESTAURANT.address}</span>
              </div>
              <div className="flex items-center gap-3 p-4 bg-white rounded-lg border">
                <Phone className="w-5 h-5 text-gray-500" />
                <span className="text-sm text-gray-700">{MOCK_RESTAURANT.phone}</span>
              </div>
              <div className="flex items-center gap-3 p-4 bg-white rounded-lg border">
                <Globe className="w-5 h-5 text-gray-500" />
                <span className="text-sm text-gray-700 truncate">{MOCK_RESTAURANT.website}</span>
              </div>
              <div className="flex items-center gap-3 p-4 bg-white rounded-lg border">
                <Clock className="w-5 h-5 text-gray-500" />
                <span className="text-sm text-gray-700">{MOCK_RESTAURANT.openingHours}</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 border shadow-sm h-fit">
            <h3 className="font-bold text-gray-900 mb-4">Quick Info</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Price Range</span>
                <span className="font-medium">{MOCK_RESTAURANT.priceRange}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Cuisine</span>
                <span className="font-medium">{MOCK_RESTAURANT.cuisines[0]}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Rating</span>
                <span className="font-medium flex items-center gap-1">
                  <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                  {MOCK_RESTAURANT.rating}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Premium Mid-Page CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="my-12"
        >
          <div className={`rounded-2xl p-6 md:p-8 ${color.badgeClass} border`}>
            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
              <div className="text-center md:text-left">
                <p className="text-lg md:text-xl font-bold text-gray-900">{midCTA?.text}</p>
                <p className="text-gray-600">{midCTA?.subtext}</p>
              </div>
              <Button
                className={`${color.buttonClass} font-semibold px-6 py-3 whitespace-nowrap`}
              >
                Reserve Now
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </div>
        </motion.div>

        {/* More Content Placeholder */}
        <div className="grid md:grid-cols-2 gap-8 mb-12">
          <div className="bg-white rounded-xl p-6 border">
            <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
              <Utensils className="w-5 h-5 text-orange-500" />
              Menu Highlights
            </h3>
            <ul className="space-y-2 text-gray-700">
              <li className="flex items-center gap-2">
                <Check className="w-4 h-4 text-green-500" />
                Fresh Seafood Risotto
              </li>
              <li className="flex items-center gap-2">
                <Check className="w-4 h-4 text-green-500" />
                Homemade Pasta Carbonara
              </li>
              <li className="flex items-center gap-2">
                <Check className="w-4 h-4 text-green-500" />
                Wood-fired Pizza Margherita
              </li>
              <li className="flex items-center gap-2">
                <Check className="w-4 h-4 text-green-500" />
                Tiramisu (House Special)
              </li>
            </ul>
          </div>

          <div className="bg-white rounded-xl p-6 border">
            <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
              <Star className="w-5 h-5 text-yellow-500" />
              Why Guests Love It
            </h3>
            <ul className="space-y-2 text-gray-700">
              <li className="flex items-center gap-2">
                <Check className="w-4 h-4 text-green-500" />
                Stunning ocean views
              </li>
              <li className="flex items-center gap-2">
                <Check className="w-4 h-4 text-green-500" />
                Award-winning chef
              </li>
              <li className="flex items-center gap-2">
                <Check className="w-4 h-4 text-green-500" />
                Romantic atmosphere
              </li>
              <li className="flex items-center gap-2">
                <Check className="w-4 h-4 text-green-500" />
                Excellent wine selection
              </li>
            </ul>
          </div>
        </div>

        {/* Premium End CTA */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="py-12 bg-gradient-to-br from-gray-50 to-white rounded-2xl border"
        >
          <div className="max-w-4xl mx-auto px-4 text-center">
            <div className="inline-flex items-center gap-2 bg-amber-100 text-amber-800 rounded-full px-4 py-1.5 mb-4">
              <Crown className="w-4 h-4" />
              <span className="text-sm font-semibold">Featured Restaurant</span>
            </div>
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">
              Ready to experience {MOCK_RESTAURANT.name}?
            </h2>
            <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
              Don't miss out on this dining experience. Reserve your table now to secure your spot.
            </p>
            <Button
              size="lg"
              className={`${color.buttonClass} font-semibold px-8 py-4 text-lg shadow-lg hover:shadow-xl transition-all`}
            >
              Make a Reservation
              <Calendar className="w-5 h-5 ml-2" />
            </Button>
          </div>
        </motion.section>
      </div>

      {/* Premium Sticky CTA */}
      {showStickyButton && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="fixed bottom-4 right-4 md:bottom-6 md:right-6 z-40"
        >
          <div className="flex flex-col items-end gap-2">
            <button
              onClick={() => setShowStickyButton(false)}
              className="w-8 h-8 bg-white hover:bg-gray-100 rounded-full flex items-center justify-center shadow-lg border border-gray-200 transition-all"
              aria-label="Close"
            >
              <X className="w-4 h-4 text-gray-600" />
            </button>
            <Button
              size="lg"
              className={`${color.stickyClass} shadow-2xl hover:shadow-3xl transition-all duration-300 hover:scale-105 px-5 py-4 md:px-6 md:py-5 rounded-full font-semibold`}
            >
              <StickyIcon className="w-5 h-5 mr-2" />
              {stickyCTA?.text}
            </Button>
          </div>
        </motion.div>
      )}
    </div>
  );
}

