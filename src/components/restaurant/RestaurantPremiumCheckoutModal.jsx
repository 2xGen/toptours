"use client";
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, 
  Check, 
  Crown, 
  TrendingUp, 
  MousePointerClick,
  ArrowRight,
  ArrowLeft,
  Calendar,
  ExternalLink,
  MapPin,
  BookOpen,
  UtensilsCrossed,
  Sparkles,
  User,
  Mail,
  Lock,
  Settings,
  CreditCard,
  Shield,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { createSupabaseBrowserClient } from '@/lib/supabaseClient';
import { 
  RESTAURANT_PREMIUM_PRICING, 
  LAYOUT_PRESETS, 
  COLOR_SCHEMES, 
  CTA_OPTIONS 
} from '@/lib/restaurantPremium';

// Step titles change based on whether user is logged in
const getStepTitles = (isLoggedIn) => isLoggedIn ? [
  'Choose Your Plan',
  'Customize Buttons',
  'Review & Pay',
] : [
  'Choose Your Plan',
  'Customize Buttons',
  'Create Account',
  'Review & Pay',
];

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

export default function RestaurantPremiumCheckoutModal({ 
  isOpen, 
  onClose, 
  restaurant,
  destination,
  user: initialUser = null,
}) {
  const [step, setStep] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [user, setUser] = useState(initialUser);
  const supabase = createSupabaseBrowserClient();
  
  // Selection state
  const [planType, setPlanType] = useState('yearly'); // Default to yearly (better value)
  const [layoutPreset, setLayoutPreset] = useState('ocean');
  const [colorScheme, setColorScheme] = useState('blue');
  const [heroCTAIndex, setHeroCTAIndex] = useState(0);
  const [midCTAIndex, setMidCTAIndex] = useState(0);
  const [endCTAIndex, setEndCTAIndex] = useState(0);
  const [stickyCTAIndex, setStickyCTAIndex] = useState(0);
  const [email, setEmail] = useState('');
  const [website, setWebsite] = useState(restaurant?.contact?.website || restaurant?.booking?.partnerUrl || '');

  // Get step titles based on login status
  const STEP_TITLES = getStepTitles(!!user);
  const totalSteps = STEP_TITLES.length;
  const reviewStepIndex = totalSteps - 1;
  const authStepIndex = user ? -1 : totalSteps - 2; // -1 means no auth step needed

  // Check auth status on mount
  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        setUser(session.user);
      }
    };
    if (!initialUser) {
      checkAuth();
    }
  }, [initialUser, supabase.auth]);

  // Listen for auth changes (for when user signs in within the modal)
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        setUser(session.user);
        // If user just signed in and was on auth step, move to review
        // After login, logged-in flow has 3 steps, review is at index 2
        if (step === authStepIndex) {
          setStep(2); // Review step index for logged-in users (3 steps: 0, 1, 2)
        }
      }
    });
    return () => subscription.unsubscribe();
  }, [supabase.auth, step, authStepIndex]);

  if (!isOpen) return null;

  const handleNext = () => {
    if (step < reviewStepIndex) {
      setStep(step + 1);
    }
  };

  const handleBack = () => {
    if (step > 0) {
      setStep(step - 1);
    }
  };

  const handleCheckout = async () => {
    setIsLoading(true);
    setError(null);

    // Validate website is provided
    if (!website || website.trim() === '') {
      setError('Please enter your website or booking/reservation URL to continue');
      setIsLoading(false);
      return;
    }

    // Basic URL validation
    try {
      new URL(website);
    } catch (e) {
      setError('Please enter a valid URL (e.g., https://yourrestaurant.com)');
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch('/api/internal/restaurant-premium/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          restaurantId: restaurant.id,
          destinationId: destination.id,
          restaurantSlug: restaurant.slug,
          restaurantName: restaurant.name,
          planType,
          layoutPreset,
          colorScheme,
          heroCTAIndex,
          midCTAIndex,
          endCTAIndex,
          stickyCTAIndex,
          website: website.trim(),
          userId: user?.id,
          email: user?.email || email || undefined,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create checkout session');
      }

      // Redirect to Stripe checkout
      if (data.checkoutUrl) {
        window.location.href = data.checkoutUrl;
      }
    } catch (err) {
      console.error('Checkout error:', err);
      setError(err.message || 'Something went wrong. Please try again.');
      setIsLoading(false);
    }
  };

  // Determine if current step is the review step
  const isReviewStep = step === reviewStepIndex;
  // Determine if current step is the auth step (only for non-logged-in users)
  const isAuthStep = !user && step === authStepIndex;

  const renderStepContent = () => {
    // If user is logged in, skip auth step
    if (user) {
      switch (step) {
        case 0:
          return <PlanSelectionStep planType={planType} setPlanType={setPlanType} />;
        case 1:
          return (
            <CTASelectionStep 
              heroCTAIndex={heroCTAIndex} setHeroCTAIndex={setHeroCTAIndex}
              midCTAIndex={midCTAIndex} setMidCTAIndex={setMidCTAIndex}
              endCTAIndex={endCTAIndex} setEndCTAIndex={setEndCTAIndex}
              stickyCTAIndex={stickyCTAIndex} setStickyCTAIndex={setStickyCTAIndex}
              colorScheme={colorScheme} setColorScheme={setColorScheme}
            />
          );
        case 2:
          return (
            <ReviewStep 
              restaurant={restaurant}
              planType={planType}
              layoutPreset={layoutPreset}
              colorScheme={colorScheme}
              heroCTAIndex={heroCTAIndex}
              midCTAIndex={midCTAIndex}
              endCTAIndex={endCTAIndex}
              stickyCTAIndex={stickyCTAIndex}
              website={website}
              setWebsite={setWebsite}
              user={user}
            />
          );
        default:
          return null;
      }
    }

    // User not logged in - include auth step before review
    switch (step) {
      case 0:
        return <PlanSelectionStep planType={planType} setPlanType={setPlanType} />;
      case 1:
        return (
          <CTASelectionStep 
            heroCTAIndex={heroCTAIndex}
            setHeroCTAIndex={setHeroCTAIndex}
            midCTAIndex={midCTAIndex}
            setMidCTAIndex={setMidCTAIndex}
            endCTAIndex={endCTAIndex}
            setEndCTAIndex={setEndCTAIndex}
            stickyCTAIndex={stickyCTAIndex}
            setStickyCTAIndex={setStickyCTAIndex}
            colorScheme={colorScheme}
            setColorScheme={setColorScheme}
          />
        );
      case 2:
        return (
          <AuthStep 
            supabase={supabase}
            onSuccess={(authUser) => {
              setUser(authUser);
              // After login, user has 3 steps, so review is at index 2
              setStep(2); // Move to review (which is index 2 for logged-in users)
            }}
            error={error}
            setError={setError}
          />
        );
      case 3:
        return (
          <ReviewStep 
            restaurant={restaurant}
            planType={planType}
            layoutPreset={layoutPreset}
            colorScheme={colorScheme}
            heroCTAIndex={heroCTAIndex}
            midCTAIndex={midCTAIndex}
            endCTAIndex={endCTAIndex}
            stickyCTAIndex={stickyCTAIndex}
            website={website}
            setWebsite={setWebsite}
            user={user}
          />
        );
      default:
        return null;
    }
  };

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
            className="relative bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col"
          >
            {/* Header */}
            <div className="ocean-gradient p-6 text-white relative flex-shrink-0">
              <button
                onClick={onClose}
                className="absolute top-4 right-4 text-white/80 hover:text-white transition-colors"
                aria-label="Close"
              >
                <X className="w-6 h-6" />
              </button>
              
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
                  <Crown className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-sm text-white/80">Upgrade to Premium</p>
                  <h2 className="text-xl font-bold">{restaurant?.name}</h2>
                </div>
              </div>

              {/* Progress Steps */}
              <div className="flex items-center gap-2 mt-4">
                {STEP_TITLES.map((title, i) => (
                  <div key={i} className="flex-1">
                    <div 
                      className={`h-1.5 rounded-full transition-colors ${
                        i <= step ? 'bg-white' : 'bg-white/30'
                      }`}
                    />
                    <p className={`text-xs mt-1 ${i <= step ? 'text-white' : 'text-white/50'}`}>
                      {title}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-6">
              {error && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                  {error}
                </div>
              )}
              {renderStepContent()}
            </div>

            {/* Footer - Fixed */}
            <div className="border-t bg-gray-50 p-4 flex items-center justify-between flex-shrink-0">
              <Button
                variant="ghost"
                onClick={step === 0 ? onClose : handleBack}
                disabled={isLoading}
              >
                {step === 0 ? 'Cancel' : (
                  <>
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Back
                  </>
                )}
              </Button>

              {/* Hide Next button on auth step - auth has its own buttons */}
              {!isAuthStep && (
                <Button
                  onClick={isReviewStep ? handleCheckout : handleNext}
                  disabled={isLoading}
                  className="bg-green-600 hover:bg-green-700 text-white"
                >
                  {isLoading ? (
                    <span className="flex items-center gap-2">
                      <Sparkles className="w-4 h-4 animate-spin" />
                      Processing...
                    </span>
                  ) : isReviewStep ? (
                    <>
                      Continue to Payment
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </>
                  ) : (
                    <>
                      Next
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </>
                  )}
                </Button>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

// Step 1: Plan Selection
function PlanSelectionStep({ planType, setPlanType }) {
  return (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <h3 className="text-xl font-bold text-gray-900 mb-2">Choose Your Plan</h3>
        <p className="text-gray-600">Get more visibility with premium features</p>
      </div>

      {/* Benefits */}
      <div className="bg-gradient-to-br from-purple-50 to-indigo-50 rounded-xl p-5 border border-purple-200 mb-6">
        <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-purple-600" />
          What You Get
        </h4>
        <ul className="space-y-2 text-sm text-gray-700">
          <li className="flex items-start gap-2">
            <Check className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
            <span><strong>Hero "Reserve" Button</strong> – Eye-catching button at the top of your page</span>
          </li>
          <li className="flex items-start gap-2">
            <Check className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
            <span><strong>Mid-Page Banner</strong> – Catches visitors as they scroll down</span>
          </li>
          <li className="flex items-start gap-2">
            <Check className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
            <span><strong>Bottom Section</strong> – Final "Book Now" prompt before they leave</span>
          </li>
          <li className="flex items-start gap-2">
            <Check className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
            <span><strong>Sticky Button</strong> – Always visible "Reserve" button that follows the visitor</span>
          </li>
          <li className="flex items-start gap-2">
            <Check className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
            <span><strong>Premium Badge</strong> – Crown icon next to your restaurant name</span>
          </li>
        </ul>
        
        <div className="mt-4 p-3 bg-white rounded-lg border border-purple-100">
          <div className="flex items-center gap-2 text-sm">
            <MousePointerClick className="w-4 h-4 text-purple-600" />
            <span className="text-gray-700">
              <strong className="text-purple-700">5-12× more clicks</strong> compared to a simple text link
            </span>
          </div>
        </div>
      </div>

      {/* Plan Options */}
      <div className="grid grid-cols-2 gap-4">
        {/* Monthly */}
        <button
          onClick={() => setPlanType('monthly')}
          className={`relative p-4 rounded-xl border-2 text-left transition-all ${
            planType === 'monthly'
              ? 'border-purple-500 bg-purple-50'
              : 'border-gray-200 hover:border-gray-300'
          }`}
        >
          {planType === 'monthly' && (
            <div className="absolute top-2 right-2">
              <Check className="w-5 h-5 text-purple-600" />
            </div>
          )}
          <p className="text-2xl font-bold text-gray-900">
            ${RESTAURANT_PREMIUM_PRICING.monthly.price}
          </p>
          <p className="text-sm text-gray-600">/month</p>
          <p className="text-xs text-gray-500 mt-2">Billed monthly</p>
        </button>

        {/* Yearly */}
        <button
          onClick={() => setPlanType('yearly')}
          className={`relative p-4 rounded-xl border-2 text-left transition-all ${
            planType === 'yearly'
              ? 'border-purple-500 bg-purple-50'
              : 'border-gray-200 hover:border-gray-300'
          }`}
        >
          <div className="absolute -top-2 left-1/2 -translate-x-1/2 bg-green-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">
            BEST VALUE
          </div>
          {planType === 'yearly' && (
            <div className="absolute top-2 right-2">
              <Check className="w-5 h-5 text-purple-600" />
            </div>
          )}
          <p className="text-2xl font-bold text-gray-900">
            ${RESTAURANT_PREMIUM_PRICING.yearly.price}
          </p>
          <p className="text-sm text-gray-600">/month</p>
          <p className="text-xs text-gray-500 mt-1">Billed annually</p>
          <p className="text-xs text-green-600 font-semibold">
            Save 37% vs monthly
          </p>
        </button>
      </div>
    </div>
  );
}

// Step 2: CTA Selection (includes color selection)
function CTASelectionStep({ 
  heroCTAIndex, setHeroCTAIndex,
  midCTAIndex, setMidCTAIndex,
  endCTAIndex, setEndCTAIndex,
  stickyCTAIndex, setStickyCTAIndex,
  colorScheme, setColorScheme,
}) {
  const colorClass = COLOR_SCHEMES[colorScheme]?.buttonClass || COLOR_SCHEMES.blue.buttonClass;

  return (
    <div className="space-y-6">
      <div className="text-center mb-4">
        <h3 className="text-xl font-bold text-gray-900 mb-2">Customize Your Buttons</h3>
        <p className="text-gray-600">Choose your button color and text</p>
      </div>

      {/* Button Color Selection */}
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">Button Color</label>
        <div className="flex gap-3">
          {Object.values(COLOR_SCHEMES).map((scheme) => (
            <button
              key={scheme.id}
              onClick={() => setColorScheme(scheme.id)}
              className={`flex-1 flex flex-col items-center gap-2 p-3 rounded-lg border-2 transition-all ${
                colorScheme === scheme.id
                  ? 'border-purple-500 bg-purple-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <div className={`w-full h-8 rounded-md ${scheme.buttonClass}`}></div>
              <span className="text-xs font-medium text-gray-700">{scheme.name}</span>
              {colorScheme === scheme.id && <Check className="w-4 h-4 text-purple-600" />}
            </button>
          ))}
        </div>
      </div>

      {/* Hero CTA */}
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">Hero Button</label>
        <div className="grid grid-cols-2 gap-2">
          {CTA_OPTIONS.hero.map((option, i) => {
            const Icon = ICON_MAP[option.icon] || ArrowRight;
            return (
              <button
                key={i}
                onClick={() => setHeroCTAIndex(i)}
                className={`flex items-center gap-2 p-3 rounded-lg border-2 text-sm transition-all ${
                  heroCTAIndex === i
                    ? 'border-purple-500 bg-purple-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <Icon className="w-4 h-4 text-gray-600" />
                {option.text}
                {heroCTAIndex === i && <Check className="w-4 h-4 text-purple-600 ml-auto" />}
              </button>
            );
          })}
        </div>
      </div>

      {/* Mid CTA */}
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">Mid-Page Banner</label>
        <div className="space-y-2">
          {CTA_OPTIONS.mid.map((option, i) => (
            <button
              key={i}
              onClick={() => setMidCTAIndex(i)}
              className={`w-full flex items-center justify-between p-3 rounded-lg border-2 text-left text-sm transition-all ${
                midCTAIndex === i
                  ? 'border-purple-500 bg-purple-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <div>
                <p className="font-medium text-gray-900">{option.text}</p>
                <p className="text-xs text-gray-500">{option.subtext}</p>
              </div>
              {midCTAIndex === i && <Check className="w-4 h-4 text-purple-600" />}
            </button>
          ))}
        </div>
      </div>

      {/* Sticky CTA */}
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">Sticky Button</label>
        <div className="grid grid-cols-2 gap-2">
          {CTA_OPTIONS.sticky.map((option, i) => {
            const Icon = ICON_MAP[option.icon] || ArrowRight;
            return (
              <button
                key={i}
                onClick={() => setStickyCTAIndex(i)}
                className={`flex items-center gap-2 p-3 rounded-lg border-2 text-sm transition-all ${
                  stickyCTAIndex === i
                    ? 'border-purple-500 bg-purple-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <Icon className="w-4 h-4 text-gray-600" />
                {option.text}
                {stickyCTAIndex === i && <Check className="w-4 h-4 text-purple-600 ml-auto" />}
              </button>
            );
          })}
        </div>
      </div>

      {/* Preview */}
      <div className="p-4 bg-gray-50 rounded-xl border border-gray-200">
        <p className="text-xs text-gray-500 mb-3">Preview</p>
        <div className="space-y-3">
          {/* Hero CTA */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-400 w-12">Hero:</span>
            <button className={`px-4 py-2 rounded-lg text-sm font-medium ${colorClass}`}>
              {CTA_OPTIONS.hero[heroCTAIndex]?.text}
            </button>
          </div>
          
          {/* Mid CTA */}
          <div className="flex items-start gap-2">
            <span className="text-xs text-gray-400 w-12 mt-2">Mid:</span>
            <div className={`flex-1 p-3 rounded-lg ${colorClass}`}>
              <p className="text-sm font-semibold">{CTA_OPTIONS.mid[midCTAIndex]?.text}</p>
              <p className="text-xs opacity-80">{CTA_OPTIONS.mid[midCTAIndex]?.subtext}</p>
            </div>
          </div>
          
          {/* Sticky CTA */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-400 w-12">Sticky:</span>
            <button className={`px-3 py-1.5 rounded-full text-xs font-medium ${colorClass}`}>
              {CTA_OPTIONS.sticky[stickyCTAIndex]?.text}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// Auth Step - User-friendly sign in/sign up
function AuthStep({ supabase, onSuccess, error, setError }) {
  const [mode, setMode] = useState('signin'); // 'signin' or 'signup'
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const handleEmailAuth = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    setError(null);

    try {
      if (mode === 'signup') {
        const { data, error: signUpError } = await supabase.auth.signUp({ email, password });
        if (signUpError) throw signUpError;
        
        if (data?.session?.user) {
          onSuccess(data.session.user);
        } else {
          setMessage('Check your email to confirm your account, then sign in.');
          setMode('signin');
        }
      } else {
        const { data, error: signInError } = await supabase.auth.signInWithPassword({ email, password });
        if (signInError) throw signInError;
        if (data?.user) {
          onSuccess(data.user);
        }
      }
    } catch (err) {
      setMessage(err.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setLoading(true);
    setMessage('');
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: window.location.href,
        },
      });
      if (error) throw error;
    } catch (err) {
      setMessage(err.message || 'Failed to sign in with Google');
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <User className="w-8 h-8 text-purple-600" />
        </div>
        <h3 className="text-xl font-bold text-gray-900 mb-2">Create Your Account</h3>
        <p className="text-gray-600 text-sm">
          Quick sign up to manage your subscription and settings anytime
        </p>
      </div>

      {/* Benefits of having an account */}
      <div className="bg-gradient-to-br from-purple-50 to-indigo-50 rounded-xl p-4 border border-purple-200">
        <p className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
          <Shield className="w-4 h-4 text-purple-600" />
          Why create an account?
        </p>
        <ul className="space-y-2 text-sm text-gray-700">
          <li className="flex items-center gap-2">
            <Check className="w-4 h-4 text-green-600 flex-shrink-0" />
            Change your button colors & CTA text anytime
          </li>
          <li className="flex items-center gap-2">
            <Check className="w-4 h-4 text-green-600 flex-shrink-0" />
            Manage billing & cancel with one click
          </li>
          <li className="flex items-center gap-2">
            <Check className="w-4 h-4 text-green-600 flex-shrink-0" />
            Access invoices and receipts
          </li>
        </ul>
      </div>

      {/* Google Sign In - Most Prominent */}
      <Button
        onClick={handleGoogleSignIn}
        disabled={loading}
        variant="outline"
        className="w-full h-12 flex items-center justify-center gap-3 border-2 hover:bg-gray-50"
      >
        <svg className="w-5 h-5" viewBox="0 0 24 24">
          <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
          <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
          <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
          <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
        </svg>
        <span className="font-medium">Continue with Google</span>
      </Button>

      {/* Divider */}
      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t border-gray-300" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-white px-3 text-gray-500">Or use email</span>
        </div>
      </div>

      {/* Mode Toggle */}
      <div className="flex gap-2 bg-gray-100 p-1 rounded-lg">
        <button
          type="button"
          onClick={() => setMode('signin')}
          className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-all ${
            mode === 'signin' ? 'bg-white shadow text-gray-900' : 'text-gray-600'
          }`}
        >
          Sign In
        </button>
        <button
          type="button"
          onClick={() => setMode('signup')}
          className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-all ${
            mode === 'signup' ? 'bg-white shadow text-gray-900' : 'text-gray-600'
          }`}
        >
          Sign Up
        </button>
      </div>

      {/* Email/Password Form */}
      <form onSubmit={handleEmailAuth} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              required
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
            />
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              minLength={6}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
            />
          </div>
        </div>

        {(message || error) && (
          <p className={`text-sm ${message.includes('Check your email') ? 'text-green-600' : 'text-red-600'}`}>
            {message || error}
          </p>
        )}

        <Button
          type="submit"
          disabled={loading}
          className="w-full bg-purple-600 hover:bg-purple-700 text-white"
        >
          {loading ? 'Please wait...' : mode === 'signup' ? 'Create Account' : 'Sign In'}
        </Button>
      </form>
    </div>
  );
}

// Review Step - Final review before payment
function ReviewStep({ 
  restaurant, 
  planType, 
  layoutPreset, 
  colorScheme,
  heroCTAIndex,
  midCTAIndex,
  endCTAIndex,
  stickyCTAIndex,
  website,
  setWebsite,
  user,
}) {
  const pricing = RESTAURANT_PREMIUM_PRICING[planType];
  const layout = LAYOUT_PRESETS[layoutPreset];
  const color = COLOR_SCHEMES[colorScheme];
  const currentWebsite = restaurant?.contact?.website || restaurant?.booking?.partnerUrl;

  return (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <h3 className="text-xl font-bold text-gray-900 mb-2">Review Your Selection</h3>
        <p className="text-gray-600">Almost there! Review and complete your order.</p>
      </div>

      {/* Logged in user badge */}
      {user && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-3 flex items-center gap-3">
          <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
            <Check className="w-4 h-4 text-green-600" />
          </div>
          <div>
            <p className="text-sm font-medium text-green-900">Signed in as</p>
            <p className="text-sm text-green-700">{user.email}</p>
          </div>
        </div>
      )}

      {/* Website Link Section */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 space-y-3">
        <div className="flex items-center gap-2">
          <ExternalLink className="w-5 h-5 text-blue-600" />
          <h4 className="font-semibold text-gray-900">Website Link <span className="text-red-500">*</span></h4>
        </div>
        <p className="text-sm text-gray-600">
          This is the link that will be promoted in your premium CTAs. Enter your website or booking/reservation URL.
        </p>
        
        {currentWebsite && (
          <div className="bg-white rounded-lg p-3 border border-blue-100">
            <p className="text-xs text-gray-500 mb-1">Current website:</p>
            <a 
              href={currentWebsite} 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-sm text-blue-600 hover:text-blue-700 underline break-all flex items-center gap-1"
            >
              {currentWebsite}
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        )}
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {currentWebsite ? 'Website or booking URL' : 'Enter your website or booking URL'} <span className="text-red-500">*</span>
          </label>
          <Input
            type="url"
            value={website}
            onChange={(e) => setWebsite(e.target.value)}
            placeholder="https://yourrestaurant.com or https://booking.com/yourrestaurant"
            className="w-full"
            required
          />
          <p className="text-xs text-gray-500 mt-1">
            You can use your restaurant website or a booking/reservation platform URL
          </p>
          {website && website !== currentWebsite && (
            <p className="text-xs text-amber-600 mt-1 flex items-center gap-1">
              <Settings className="w-3 h-3" />
              Website changes require manual review after payment
            </p>
          )}
        </div>
      </div>

      {/* Summary */}
      <div className="bg-gray-50 rounded-xl p-4 space-y-3">
        <div className="flex justify-between items-center">
          <span className="text-gray-600">Restaurant</span>
          <span className="font-medium text-gray-900">{restaurant?.name}</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-gray-600">Plan</span>
          <span className="font-medium text-gray-900">
            {planType === 'yearly' ? 'Yearly' : 'Monthly'} Premium
          </span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-gray-600">Button Color</span>
          <div className="flex items-center gap-2">
            <div className={`w-4 h-4 rounded ${color?.buttonClass}`} />
            <span className="font-medium text-gray-900">{color?.name}</span>
          </div>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-gray-600">Hero CTA</span>
          <span className="font-medium text-gray-900">{CTA_OPTIONS.hero[heroCTAIndex]?.text}</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-gray-600">Sticky Button</span>
          <span className="font-medium text-gray-900">{CTA_OPTIONS.sticky[stickyCTAIndex]?.text}</span>
        </div>
        
        <hr className="border-gray-200" />
        
        <div className="flex justify-between items-center text-lg">
          <span className="font-semibold text-gray-900">Total</span>
          <div className="text-right">
            {planType === 'yearly' ? (
              <>
                <span className="font-bold text-gray-900">${pricing?.totalPrice}/year</span>
                <p className="text-xs text-green-600">Only ${pricing?.price}/month</p>
              </>
            ) : (
              <span className="font-bold text-gray-900">{pricing?.label}</span>
            )}
          </div>
        </div>
      </div>

      {/* What you can do after purchase */}
      <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
        <p className="text-sm font-medium text-purple-900 mb-2 flex items-center gap-2">
          <Settings className="w-4 h-4" />
          After purchase, you can:
        </p>
        <ul className="text-sm text-purple-800 space-y-1">
          <li>• Change colors and CTA text anytime</li>
          <li>• Manage your subscription in your account</li>
          <li>• Access invoices and billing history</li>
        </ul>
      </div>

      {/* Trust badges */}
      <div className="flex items-center justify-center gap-4 text-xs text-gray-500">
        <span>🔒 Secure checkout via Stripe</span>
        <span>✓ Cancel anytime</span>
      </div>
    </div>
  );
}

