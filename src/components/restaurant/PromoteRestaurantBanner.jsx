"use client";
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Crown, 
  TrendingUp, 
  MousePointerClick, 
  Zap, 
  ArrowRight,
  X,
  Check,
  DollarSign,
  Palette,
  Sparkles,
  Rocket,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import RestaurantPremiumCheckoutModal from './RestaurantPremiumCheckoutModal';
import { RESTAURANT_PREMIUM_PRICING } from '@/lib/restaurantPremium';

/**
 * Promote This Restaurant Banner
 * Shows on non-premium restaurant pages to encourage upgrade
 */
export function PromoteRestaurantBanner({ restaurant, destination, user }) {
  const [showCheckoutModal, setShowCheckoutModal] = useState(false);
  const [showExplainer, setShowExplainer] = useState(false);

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="my-8"
      >
        <div className="bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50 rounded-2xl border-2 border-amber-200 p-6 md:p-8 shadow-sm">
          <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
            {/* Icon */}
            <div className="flex-shrink-0">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center shadow-lg">
                <Crown className="w-7 h-7 text-white" />
              </div>
            </div>

            {/* Content */}
            <div className="flex-1">
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                Own or manage this restaurant?
              </h3>
              <p className="text-gray-600 mb-3">
                Get <strong className="text-amber-700">5-12× more clicks</strong> with prominent CTAs, 
                a sticky button, and a TOP badge. Starting at just{' '}
                <strong className="text-amber-700">${RESTAURANT_PREMIUM_PRICING.yearly.price}/month</strong>.
              </p>

              {/* Quick benefits */}
              <div className="flex flex-wrap gap-3 text-sm">
                <span className="inline-flex items-center gap-1 text-gray-600">
                  <Check className="w-4 h-4 text-green-600" />
                  Hero CTA
                </span>
                <span className="inline-flex items-center gap-1 text-gray-600">
                  <Check className="w-4 h-4 text-green-600" />
                  Sticky Button
                </span>
                <span className="inline-flex items-center gap-1 text-gray-600">
                  <Check className="w-4 h-4 text-green-600" />
                  TOP Badge
                </span>
              </div>
            </div>

            {/* CTA */}
            <div className="flex flex-col gap-2 w-full md:w-auto">
              <Button
                onClick={() => setShowCheckoutModal(true)}
                className="bg-gradient-to-r from-amber-500 to-orange-500 text-white hover:from-amber-600 hover:to-orange-600 font-semibold px-6 py-3"
              >
                <Zap className="w-4 h-4 mr-2" />
                Get Premium
              </Button>
              <button
                onClick={() => setShowExplainer(true)}
                className="text-sm text-amber-700 hover:text-amber-800 underline underline-offset-2"
              >
                See how it works
              </button>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Checkout Modal */}
      <RestaurantPremiumCheckoutModal
        isOpen={showCheckoutModal}
        onClose={() => setShowCheckoutModal(false)}
        restaurant={restaurant}
        destination={destination}
        user={user}
      />

      {/* Explainer Modal */}
      <PremiumExplainerModal
        isOpen={showExplainer}
        onClose={() => setShowExplainer(false)}
        onGetStarted={() => {
          setShowExplainer(false);
          setShowCheckoutModal(true);
        }}
      />
    </>
  );
}

/**
 * Compact Promote Button for smaller placements
 */
export function PromoteRestaurantButton({ restaurant, destination, user, variant = 'default' }) {
  const [showCheckoutModal, setShowCheckoutModal] = useState(false);

  if (variant === 'subtle') {
    return (
      <>
        <button
          onClick={() => setShowCheckoutModal(true)}
          className="inline-flex items-center gap-2 text-sm text-amber-600 hover:text-amber-700 font-medium transition-colors"
        >
          <Crown className="w-4 h-4" />
          Boost this restaurant
        </button>
        <RestaurantPremiumCheckoutModal
          isOpen={showCheckoutModal}
          onClose={() => setShowCheckoutModal(false)}
          restaurant={restaurant}
          destination={destination}
          user={user}
        />
      </>
    );
  }

  return (
    <>
      <Button
        onClick={() => setShowCheckoutModal(true)}
        variant="outline"
        className="border-amber-300 text-amber-700 hover:bg-amber-50"
      >
        <Crown className="w-4 h-4 mr-2" />
        Get Premium
      </Button>
      <RestaurantPremiumCheckoutModal
        isOpen={showCheckoutModal}
        onClose={() => setShowCheckoutModal(false)}
        restaurant={restaurant}
        destination={destination}
        user={user}
      />
    </>
  );
}

/**
 * Premium Explainer Modal
 * Matches site brand style - ocean gradient header, white bg, orange accents
 */
function PremiumExplainerModal({ isOpen, onClose, onGetStarted }) {
  if (!isOpen) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 overflow-y-auto">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative bg-white rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-hidden flex flex-col"
          >
            {/* Close Button */}
            <button
              onClick={onClose}
              className="absolute top-3 right-3 z-10 text-white/80 hover:text-white transition-colors"
              aria-label="Close"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Header - Fixed at top, not scrollable */}
            <div className="ocean-gradient px-6 py-4 text-white flex-shrink-0">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
                    <Crown className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-sm text-white/80">Restaurant Premium</p>
                    <div className="flex items-baseline gap-2">
                      <span className="text-3xl md:text-4xl font-black">5-12×</span>
                      <span className="text-lg font-semibold">more clicks</span>
                    </div>
                  </div>
                </div>
                <div className="text-right text-sm text-white/70">
                  vs. standard listings
                </div>
              </div>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-4 md:p-6">
              {/* Visual CTR Comparison */}
              <div className="bg-white rounded-xl p-4 border-2 border-orange-200 shadow-sm mb-4">
                <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-orange-600" />
                  Real Click-Through Rates
                </h3>
                
                <div className="space-y-4">
                  {/* Without Premium */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-gray-600 text-sm">Without Premium</span>
                      <span className="font-mono text-gray-900 text-sm">~1%</span>
                    </div>
                    <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
                      <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: '8%' }}
                        transition={{ delay: 0.3, duration: 0.5 }}
                        className="h-full bg-gray-400 rounded-full" 
                      />
                    </div>
                  </div>
                  
                  {/* With Premium */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-orange-600 font-semibold text-sm">With Premium</span>
                      <span className="font-mono text-orange-600 font-bold">5-12%</span>
                    </div>
                    <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
                      <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: '70%' }}
                        transition={{ delay: 0.5, duration: 0.8 }}
                        className="h-full bg-gradient-to-r from-orange-500 to-yellow-500 rounded-full" 
                      />
                    </div>
                  </div>
                </div>

                {/* Multiplier callout */}
                <div className="mt-4 p-4 bg-gradient-to-r from-orange-100 to-yellow-100 rounded-xl border border-orange-200">
                  <div className="flex items-center gap-3">
                    <div className="w-14 h-14 rounded-full bg-gradient-to-br from-orange-500 to-yellow-500 flex items-center justify-center flex-shrink-0 shadow-lg">
                      <span className="text-lg font-black text-white">5-12×</span>
                    </div>
                    <p className="text-gray-700 text-sm">
                      <strong className="text-gray-900">Up to 1,100% more engagement.</strong> That's the difference between 1 click and 12 clicks for every 100 visitors.
                    </p>
                  </div>
                </div>
              </div>

              {/* Customization Section */}
              <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-4 border-2 border-purple-200 shadow-sm mb-4">
                <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-purple-600" />
                  Fully Customizable
                </h3>
                <div className="grid grid-cols-3 gap-3">
                  <div className="flex flex-col items-center gap-2 bg-white rounded-lg p-3 border border-purple-100 text-center">
                    <div className="w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center">
                      <Palette className="w-5 h-5 text-purple-600" />
                    </div>
                    <div>
                      <h4 className="text-gray-900 font-semibold text-sm">Button Colors</h4>
                      <p className="text-gray-500 text-xs mt-1">
                        3 colors to match your brand
                      </p>
                    </div>
                  </div>
                  <div className="flex flex-col items-center gap-2 bg-white rounded-lg p-3 border border-purple-100 text-center">
                    <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
                      <MousePointerClick className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <h4 className="text-gray-900 font-semibold text-sm">CTA Text</h4>
                      <p className="text-gray-500 text-xs mt-1">
                        Pick your button text
                      </p>
                    </div>
                  </div>
                  <div className="flex flex-col items-center gap-2 bg-white rounded-lg p-3 border border-purple-100 text-center">
                    <div className="w-10 h-10 rounded-lg bg-orange-100 flex items-center justify-center">
                      <Crown className="w-5 h-5 text-orange-600" />
                    </div>
                    <div>
                      <h4 className="text-gray-900 font-semibold text-sm">Premium Badge</h4>
                      <p className="text-gray-500 text-xs mt-1">
                        Crown signals quality
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* What's Included */}
              <div className="bg-white rounded-xl p-4 border-2 border-blue-200 shadow-sm mb-4">
                <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <Check className="w-5 h-5 text-blue-600" />
                  What's Included
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  <div className="bg-blue-50 rounded-lg p-3 text-center border border-blue-100">
                    <MousePointerClick className="w-6 h-6 text-blue-600 mx-auto mb-2" />
                    <p className="text-gray-900 text-xs font-semibold">Hero CTA</p>
                    <p className="text-gray-500 text-xs">Top of page</p>
                  </div>
                  <div className="bg-purple-50 rounded-lg p-3 text-center border border-purple-100">
                    <Zap className="w-6 h-6 text-purple-600 mx-auto mb-2" />
                    <p className="text-gray-900 text-xs font-semibold">Mid Banner</p>
                    <p className="text-gray-500 text-xs">Catches scrollers</p>
                  </div>
                  <div className="bg-orange-50 rounded-lg p-3 text-center border border-orange-100">
                    <TrendingUp className="w-6 h-6 text-orange-600 mx-auto mb-2" />
                    <p className="text-gray-900 text-xs font-semibold">Sticky Button</p>
                    <p className="text-gray-500 text-xs">Always visible</p>
                  </div>
                  <div className="bg-yellow-50 rounded-lg p-3 text-center border border-yellow-200">
                    <Crown className="w-6 h-6 text-yellow-600 mx-auto mb-2" />
                    <p className="text-gray-900 text-xs font-semibold">TOP Badge</p>
                    <p className="text-gray-500 text-xs">Premium look</p>
                  </div>
                </div>
              </div>

              {/* ROI - Simple & Clear */}
              <div className="bg-gradient-to-r from-orange-100 to-yellow-100 rounded-xl p-4 border-2 border-orange-200 shadow-sm">
                <h4 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <DollarSign className="w-5 h-5 text-orange-600" />
                  Pays for Itself Instantly
                </h4>
                
                {/* Visual comparison */}
                <div className="flex items-center gap-3">
                  {/* You Pay */}
                  <div className="flex-1 bg-white rounded-lg p-3 border border-gray-200 text-center">
                    <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">You Pay</p>
                    <p className="text-2xl font-black text-gray-900">${RESTAURANT_PREMIUM_PRICING.yearly.price}</p>
                    <p className="text-xs text-gray-500">per month</p>
                  </div>
                  
                  {/* Arrow */}
                  <div className="flex flex-col items-center">
                    <ArrowRight className="w-6 h-6 text-orange-500" />
                  </div>
                  
                  {/* You Get - Green for profit */}
                  <div className="flex-1 bg-green-50 rounded-lg p-3 border-2 border-green-500 text-center">
                    <p className="text-xs text-green-700 uppercase tracking-wide mb-1 font-semibold">1 Extra Table =</p>
                    <p className="text-2xl font-black text-green-600">$40-120</p>
                    <p className="text-xs text-green-700">in revenue</p>
                  </div>
                </div>
                
                {/* Bottom line */}
                <div className="mt-3 pt-3 border-t border-orange-200 flex items-center justify-center gap-2">
                  <span className="text-3xl font-black text-green-600">8×</span>
                  <span className="text-gray-700 font-medium">return on just ONE extra reservation per month</span>
                </div>
              </div>
            </div>

            {/* Footer - Fixed at bottom */}
            <div className="border-t border-gray-200 bg-gray-50 p-4 flex items-center justify-between flex-shrink-0">
              <div className="text-sm text-gray-600">
                Starting at <strong className="text-gray-900">${RESTAURANT_PREMIUM_PRICING.yearly.price}/mo</strong>
              </div>
              <Button
                onClick={onGetStarted}
                className="sunset-gradient text-white font-semibold shadow-lg hover:scale-105 transition-transform px-6"
              >
                Get Started
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

export default PromoteRestaurantBanner;

