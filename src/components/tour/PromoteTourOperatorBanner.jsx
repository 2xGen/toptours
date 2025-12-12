"use client";
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Crown, 
  TrendingUp, 
  MousePointerClick, 
  Zap, 
  ArrowRight,
  Check,
  DollarSign,
  Sparkles,
  Rocket,
  X,
  Search,
  Link as LinkIcon,
  ExternalLink,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

const TOUR_OPERATOR_PRICING = {
  '5-tours': { 
    annual: { price: 4.99, label: '$4.99' },
    monthly: { price: 7.99, label: '$7.99' }
  },
  'unlimited': { 
    annual: { price: 9.99, label: '$9.99' },
    monthly: { price: 12.99, label: '$12.99' }
  }
};

/**
 * Promote Tour Operator Banner
 * Shows on non-premium tour pages to encourage tour operators to partner
 */
export function PromoteTourOperatorBanner({ tour, destination }) {
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
                Are you the tour operator?
              </h3>
              <p className="text-gray-600 mb-3">
                Get <strong className="text-amber-700">up to 15× more visibility</strong> by linking your tours together. 
                Show travelers all your offerings on each tour page. <strong className="text-amber-700">Just one extra booking</strong> per month 
                covers the cost. Starting at just <strong className="text-amber-700">${TOUR_OPERATOR_PRICING['5-tours'].annual.price}/month</strong>.
              </p>

              {/* Quick benefits */}
              <div className="flex flex-wrap gap-3 text-sm">
                <span className="inline-flex items-center gap-1 text-gray-600">
                  <Check className="w-4 h-4 text-green-600" />
                  Up to 15× More Visibility
                </span>
                <span className="inline-flex items-center gap-1 text-gray-600">
                  <Check className="w-4 h-4 text-green-600" />
                  Premium Badge & Verification
                </span>
                <span className="inline-flex items-center gap-1 text-gray-600">
                  <Check className="w-4 h-4 text-green-600" />
                  Cross-Tour Discovery
                </span>
              </div>
            </div>

            {/* CTA */}
            <div className="flex flex-col gap-2 w-full md:w-auto">
              <Button
                asChild
                className="bg-gradient-to-r from-amber-500 to-orange-500 text-white hover:from-amber-600 hover:to-orange-600 font-semibold px-6 py-3"
              >
                <Link href="/partners/tour-operators">
                  <Zap className="w-4 h-4 mr-2" />
                  Partner With Us
                </Link>
              </Button>
              <button
                onClick={() => setShowExplainer(true)}
                className="text-sm text-amber-700 hover:text-amber-800 underline underline-offset-2 text-center md:text-left"
              >
                Learn more
              </button>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Explainer Modal */}
      <TourOperatorExplainerModal
        isOpen={showExplainer}
        onClose={() => setShowExplainer(false)}
        onGetStarted={() => {
          setShowExplainer(false);
          window.location.href = '/partners/tour-operators';
        }}
      />
    </>
  );
}

/**
 * Tour Operator Explainer Modal
 * Explains the benefits and how to bundle tours
 */
function TourOperatorExplainerModal({ isOpen, onClose, onGetStarted }) {
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
                    <p className="text-sm text-white/80">Tour Operator Partner Program</p>
                    <div className="flex items-baseline gap-2">
                      <span className="text-3xl md:text-4xl font-black">Premium</span>
                      <span className="text-lg font-semibold">Placement</span>
                    </div>
                  </div>
                </div>
                <div className="text-right text-sm text-white/70">
                  Bundle your tours
                </div>
              </div>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-4 md:p-6">
              {/* Benefits Section - What You Get */}
              <div className="bg-white rounded-xl p-4 border-2 border-orange-200 shadow-sm mb-4">
                <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-orange-600" />
                  What You Get With Premium
                </h3>
                <div className="space-y-3">
                  <div className="flex items-start gap-3 p-3 bg-blue-50 rounded-lg border border-blue-100">
                    <TrendingUp className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="font-semibold text-gray-900 text-sm">Up to 15× More Visibility</p>
                      <p className="text-gray-600 text-xs">Show up to 15 of your tours on each tour page, dramatically increasing booking opportunities</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 p-3 bg-amber-50 rounded-lg border border-amber-100">
                    <Crown className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="font-semibold text-gray-900 text-sm">Premium Operator Badge</p>
                      <p className="text-gray-600 text-xs">Crown icon and verified badge on all your tours signals quality to travelers</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 p-3 bg-purple-50 rounded-lg border border-purple-100">
                    <Zap className="w-5 h-5 text-purple-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="font-semibold text-gray-900 text-sm">Cross-Tour Discovery</p>
                      <p className="text-gray-600 text-xs">When travelers view one tour, they see your other offerings, increasing the chance they find the perfect fit</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 p-3 bg-green-50 rounded-lg border border-green-100">
                    <Check className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="font-semibold text-gray-900 text-sm">Aggregated Reviews</p>
                      <p className="text-gray-600 text-xs">Combined review counts and ratings across all linked tours build trust and credibility</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 p-3 bg-rose-50 rounded-lg border border-rose-100">
                    <Rocket className="w-5 h-5 text-rose-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="font-semibold text-gray-900 text-sm">Higher Conversion Rates</p>
                      <p className="text-gray-600 text-xs">More tour options per page means travelers are more likely to find something they want to book</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* How to Find Your Tours */}
              <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-4 border-2 border-blue-200 shadow-sm mb-4">
                <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <Search className="w-5 h-5 text-blue-600" />
                  Find Your Tours Easily
                </h3>
                <p className="text-gray-700 text-sm mb-4">
                  You can find and bundle your tours using either:
                </p>
                <div className="space-y-3">
                  <div className="bg-white rounded-lg p-3 border border-blue-100">
                    <div className="flex items-center gap-2 mb-2">
                      <LinkIcon className="w-4 h-4 text-blue-600" />
                      <span className="font-semibold text-gray-900">TopTours.ai URLs</span>
                    </div>
                    <p className="text-sm text-gray-600">
                      Copy any tour URL from TopTours.ai (e.g., <code className="text-xs bg-gray-100 px-1 rounded">toptours.ai/tours/12345</code>)
                    </p>
                  </div>
                  <div className="bg-white rounded-lg p-3 border border-blue-100">
                    <div className="flex items-center gap-2 mb-2">
                      <ExternalLink className="w-4 h-4 text-blue-600" />
                      <span className="font-semibold text-gray-900">Viator URLs</span>
                    </div>
                    <p className="text-sm text-gray-600">
                      Paste your Viator tour URLs directly - we'll automatically convert and find them
                    </p>
                  </div>
                </div>
              </div>

              {/* Pricing Section */}
              <div className="bg-gradient-to-r from-amber-100 to-orange-100 rounded-xl p-4 border-2 border-amber-200 shadow-sm mb-4">
                <h4 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <DollarSign className="w-5 h-5 text-amber-600" />
                  Simple Pricing
                </h4>
                
                {/* Visual comparison */}
                <div className="space-y-3">
                  <div className="bg-white rounded-lg p-3 border border-gray-200">
                    <div className="mb-2">
                      <p className="font-semibold text-gray-900">5 Tours Bundle</p>
                      <p className="text-xs text-gray-500">Perfect for getting started</p>
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-xs text-gray-500">Annual (12 months)</p>
                        <p className="text-xl font-black text-gray-900">${TOUR_OPERATOR_PRICING['5-tours'].annual.price}/month</p>
                        <p className="text-xs text-gray-400">One-time payment</p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-gray-500">Monthly billing</p>
                        <p className="text-xl font-black text-gray-700">${TOUR_OPERATOR_PRICING['5-tours'].monthly.price}/month</p>
                        <p className="text-xs text-gray-400">Billed monthly</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-white rounded-lg p-3 border-2 border-amber-500">
                    <div className="mb-2">
                      <p className="font-semibold text-gray-900">15 Tours Bundle</p>
                      <p className="text-xs text-gray-500">Bundle all your tours</p>
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-xs text-gray-500">Annual (12 months)</p>
                        <p className="text-xl font-black text-amber-600">${TOUR_OPERATOR_PRICING['unlimited'].annual.price}/month</p>
                        <p className="text-xs text-gray-400">One-time payment</p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-gray-500">Monthly billing</p>
                        <p className="text-xl font-black text-amber-700">${TOUR_OPERATOR_PRICING['unlimited'].monthly.price}/month</p>
                        <p className="text-xs text-gray-400">Billed monthly</p>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Bottom line */}
                <div className="mt-4 pt-4 border-t border-amber-200 text-center">
                  <p className="text-gray-700 text-sm">
                    <strong className="text-gray-900">Bundle multiple tours</strong> from the same operator for one low price. 
                    Cancel anytime (monthly plans only).
                  </p>
                </div>
              </div>

              {/* How It Works */}
              <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-4 border-2 border-purple-200 shadow-sm">
                <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-purple-600" />
                  Get Started in 3 Simple Steps
                </h3>
                <div className="space-y-3">
                  <div className="flex items-start gap-3 bg-white rounded-lg p-3 border border-purple-100">
                    <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center flex-shrink-0">
                      <span className="text-purple-600 font-bold text-sm">1</span>
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900 text-sm">Find Your Tours</p>
                      <p className="text-gray-600 text-xs">Paste TopTours.ai or Viator URLs - we'll find and match them automatically</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 bg-white rounded-lg p-3 border border-blue-100">
                    <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                      <span className="text-blue-600 font-bold text-sm">2</span>
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900 text-sm">Bundle Together</p>
                      <p className="text-gray-600 text-xs">Select all tours from your operator - verify they're all yours, then bundle</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 bg-white rounded-lg p-3 border border-green-100">
                    <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                      <span className="text-green-600 font-bold text-sm">3</span>
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900 text-sm">Get Premium & Start Earning</p>
                      <p className="text-gray-600 text-xs">Subscribe and immediately get premium badge, cross-tour linking, and aggregated reviews for all your bundled tours</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* ROI Section - What's In It For Them - At Bottom */}
              <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-4 border-2 border-green-200 shadow-sm mb-4">
                <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <DollarSign className="w-5 h-5 text-green-600" />
                  Why This Pays For Itself
                </h3>
                <div className="bg-white rounded-lg p-4 border border-green-200 mb-3">
                  <div className="flex items-center gap-3">
                    <div className="flex-1 bg-gray-50 rounded-lg p-3 border border-gray-200 text-center">
                      <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">You Pay</p>
                      <p className="text-2xl font-black text-gray-900">${TOUR_OPERATOR_PRICING['5-tours'].annual.price}</p>
                      <p className="text-xs text-gray-500">per month (annual)</p>
                    </div>
                    <ArrowRight className="w-6 h-6 text-green-500" />
                    <div className="flex-1 bg-green-50 rounded-lg p-3 border-2 border-green-500 text-center">
                      <p className="text-xs text-green-700 uppercase tracking-wide mb-1 font-semibold">1 Extra Booking =</p>
                      <p className="text-2xl font-black text-green-600">$50-200+</p>
                      <p className="text-xs text-green-700">in revenue</p>
                    </div>
                  </div>
                  <div className="mt-3 pt-3 border-t border-green-200 text-center">
                    <p className="text-gray-700 text-sm">
                      <strong className="text-gray-900">Just ONE extra booking</strong> per month covers your entire subscription cost. 
                      Premium placement helps you get that booking and more.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Footer - Fixed at bottom */}
            <div className="border-t border-gray-200 bg-gray-50 p-4 flex items-center justify-between flex-shrink-0">
              <div className="text-sm text-gray-600">
                Starting at <strong className="text-gray-900">${TOUR_OPERATOR_PRICING['5-tours'].annual.price}/month</strong> (annual) or <strong className="text-gray-900">${TOUR_OPERATOR_PRICING['5-tours'].monthly.price}/month</strong> (monthly)
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

/**
 * Compact Promote Button for smaller placements
 */
export function PromoteTourOperatorButton({ variant = 'default' }) {
  if (variant === 'subtle') {
    return (
      <Link
        href="/partners/tour-operators"
        className="inline-flex items-center gap-2 text-sm text-amber-600 hover:text-amber-700 font-medium transition-colors"
      >
        <Crown className="w-4 h-4" />
        Partner with us
      </Link>
    );
  }

  return (
    <Button
      asChild
      variant="outline"
      className="border-amber-300 text-amber-700 hover:bg-amber-50"
    >
      <Link href="/partners/tour-operators">
        <Crown className="w-4 h-4 mr-2" />
        Partner With Us
      </Link>
    </Button>
  );
}

export default PromoteTourOperatorBanner;

