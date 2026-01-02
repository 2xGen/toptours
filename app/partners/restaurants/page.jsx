"use client";

import React, { useState, useEffect, Suspense } from 'react';
import { motion } from 'framer-motion';
import { useRouter, useSearchParams } from 'next/navigation';
import { 
  Crown, 
  CheckCircle2, 
  TrendingUp,
  Zap,
  ArrowRight,
  Shield,
  UtensilsCrossed,
  MousePointerClick,
  DollarSign,
  Search,
  Loader2,
  Mail,
  Sparkles,
  CheckCircle,
  Settings,
  X,
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import NavigationNext from '@/components/NavigationNext';
import FooterNext from '@/components/FooterNext';
import Link from 'next/link';
import { toast } from '@/components/ui/use-toast';
import { createSupabaseBrowserClient } from '@/lib/supabaseClient';
import { COLOR_SCHEMES, CTA_OPTIONS } from '@/lib/restaurantPremium';

function RestaurantsPartnerPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const supabase = createSupabaseBrowserClient();
  const [user, setUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);
  
  const [destinations, setDestinations] = useState([]);
  const [selectedDestinationId, setSelectedDestinationId] = useState('');
  const [selectedDestination, setSelectedDestination] = useState(null);
  const [restaurants, setRestaurants] = useState([]);
  const [loadingDestinations, setLoadingDestinations] = useState(true);
  const [loadingRestaurants, setLoadingRestaurants] = useState(false);
  
  // Checkout state
  const [selectedRestaurant, setSelectedRestaurant] = useState(null);
  const [premiumPlan, setPremiumPlan] = useState(null); // 'monthly' or 'annual' or null
  const [premiumBillingCycle, setPremiumBillingCycle] = useState('annual'); // 'monthly' or 'annual'
  const [wantsPromotion, setWantsPromotion] = useState(false); // Checkbox for promotion
  const [promotedBillingCycle, setPromotedBillingCycle] = useState('annual'); // 'monthly' or 'annual'
  const [email, setEmail] = useState('');
  
  // Customization state
  const [colorScheme, setColorScheme] = useState('blue'); // 'blue', 'coral', 'teal'
  const [heroCTAIndex, setHeroCTAIndex] = useState(0);
  const [midCTAIndex, setMidCTAIndex] = useState(0);
  const [stickyCTAIndex, setStickyCTAIndex] = useState(0);

  // Check for success parameter from Stripe redirect and verify session
  useEffect(() => {
    const success = searchParams.get('success');
    const sessionId = searchParams.get('session_id');
    
    if (success === 'true' && sessionId) {
      // Verify the session was actually successful with Stripe
      const verifySession = async () => {
        try {
          const response = await fetch(`/api/internal/verify-checkout-session?session_id=${sessionId}`);
          const data = await response.json();
          
          if (data.verified) {
            // Payment verified - show confirmation
            setStep(5); // Step 5 is confirmation
            toast({
              title: 'Payment successful!',
              description: 'Your subscription has been activated. View it in your profile.',
              variant: 'default',
            });
          } else {
            // Session not verified - might be cancelled or failed
            toast({
              title: 'Payment verification failed',
              description: 'We could not verify your payment. Please check your email or contact support.',
              variant: 'destructive',
            });
          }
          router.replace('/partners/restaurants', { scroll: false });
        } catch (error) {
          console.error('Error verifying checkout session:', error);
          // Still show success but log the error
          setStep(5);
          router.replace('/partners/restaurants', { scroll: false });
        }
      };
      
      verifySession();
    } else if (searchParams.get('canceled') === 'true') {
      toast({
        title: 'Payment canceled',
        description: 'Your subscription was not completed. You can try again anytime.',
        variant: 'default',
      });
      router.replace('/partners/restaurants', { scroll: false });
    }
  }, [searchParams, router]);
  
  // Scroll to top when step changes
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [step]);
  
  // Check authentication
  useEffect(() => {
    const checkAuth = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
      setAuthLoading(false);
      if (user?.email) {
        setEmail(user.email);
      }
    };
    checkAuth();
  }, [supabase]);
  
  // Sync promotion billing cycle with premium billing cycle to prevent Stripe errors
  useEffect(() => {
    if (wantsPromotion && premiumPlan) {
      setPromotedBillingCycle(premiumPlan);
    }
  }, [premiumPlan, wantsPromotion]);

  const handleDestinationChange = (e) => {
    const destId = e.target.value;
    setSelectedDestinationId(destId);
    
    if (destId) {
      const dest = destinations.find(d => d.id === destId);
      setSelectedDestination(dest);
    } else {
      setSelectedDestination(null);
      setRestaurants([]);
      setSelectedRestaurant(null);
    }
  };
  
  const handleGetStarted = () => {
    setStep(1);
  };
  
  const handleSubmit = async () => {
    if (!user) {
      toast({
        title: 'Sign in required',
        description: 'Please sign in to complete checkout.',
        variant: 'destructive',
      });
      return;
    }
    
    if (!premiumPlan) {
      toast({
        title: 'Selection required',
        description: 'Please select a Restaurant Premium plan to continue.',
        variant: 'destructive',
      });
      return;
    }
    
    // Stripe doesn't support mixing monthly and annual subscriptions in one checkout
    // If promotion is selected, it must match the premium billing cycle
    if (wantsPromotion && premiumPlan !== promotedBillingCycle) {
      toast({
        title: 'Billing cycle mismatch',
        description: 'Promoted listing must use the same billing cycle as your premium plan. Please select the same billing cycle (monthly or annual) for both.',
        variant: 'destructive',
        duration: 10000
      });
      return;
    }
    
    setLoading(true);
    let errorMessage = 'Failed to create subscription. Please try again.';
    
    try {
      const response = await fetch('/api/partners/restaurants/subscribe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          userId: user.id,
          email: user.email || email,
          restaurantId: selectedRestaurant.id,
          destinationId: selectedDestination.id,
          destinationSlug: selectedDestination.slug || selectedDestination.id, // Add slug for restaurant lookup
          restaurantSlug: selectedRestaurant.slug,
          restaurantName: selectedRestaurant.name,
          isPremiumSelected: !!premiumPlan,
          premiumBillingCycle: premiumPlan, // 'monthly' or 'annual'
          isPromotedSelected: wantsPromotion,
          promotedBillingCycle: wantsPromotion ? promotedBillingCycle : null, // 'monthly' or 'annual' or null
          // Customization options
          colorScheme: colorScheme,
          heroCTAIndex: heroCTAIndex,
          midCTAIndex: midCTAIndex,
          stickyCTAIndex: stickyCTAIndex,
        }),
      });
      
      const responseText = await response.text();
      let data = null;
      
      if (responseText) {
        try {
          data = JSON.parse(responseText);
        } catch (e) {
          errorMessage = responseText || `Server error: ${response.status} ${response.statusText}`;
          throw new Error(errorMessage);
        }
      }
      
      if (!response.ok) {
        if (data?.error) {
          errorMessage = data.error;
        } else if (data?.message) {
          errorMessage = data.message;
        } else if (responseText) {
          errorMessage = responseText;
        } else {
          errorMessage = `Server error: ${response.status} ${response.statusText}`;
        }
        throw new Error(errorMessage);
      }
      
      if (!data) {
        throw new Error('No data received from server');
      }
      
      if (data.checkoutUrl) {
        window.location.href = data.checkoutUrl;
        return;
      } else if (data.success) {
        toast({
          title: 'Subscription created',
          description: data.message || 'Your subscription is pending review. We\'ll contact you soon.',
          variant: 'default',
        });
        setStep(4);
        return;
      } else {
        throw new Error('No checkout URL or success message received');
      }
      
    } catch (error) {
      const finalErrorMessage = error?.message || errorMessage || 'An unexpected error occurred';
      console.error('Subscription error:', finalErrorMessage);
      
      toast({
        title: 'Submission failed',
        description: finalErrorMessage,
        variant: 'destructive',
        duration: 10000
      });
    } finally {
      setLoading(false);
    }
  };

  // Fetch destinations that have restaurants on mount
  useEffect(() => {
    const fetchDestinations = async () => {
      try {
        // Fetch destinations with restaurants
        const response = await fetch('/api/partners/destinations-with-restaurants');
        if (!response.ok) {
          const errorText = await response.text();
          console.error('API Error:', errorText);
          throw new Error(`Failed to fetch destinations: ${response.status}`);
        }
        const data = await response.json();
        
        console.log('Destinations API response:', data);
        
        if (data.error) {
          console.error('API returned error:', data.error, data.details);
          setDestinations([]);
        } else if (data.destinations && Array.isArray(data.destinations)) {
          // Sort alphabetically by name
          const sorted = data.destinations.sort((a, b) => 
            a.name.localeCompare(b.name)
          );
          setDestinations(sorted);
          console.log(`Loaded ${sorted.length} destinations with restaurants`);
        } else {
          console.warn('No destinations in response:', data);
          setDestinations([]);
        }
      } catch (error) {
        console.error('Error fetching destinations:', error);
        setDestinations([]);
      } finally {
        setLoadingDestinations(false);
      }
    };

    fetchDestinations();
  }, []);

  // Fetch restaurants when destination is selected
  useEffect(() => {
    if (!selectedDestinationId || !selectedDestination) {
      setRestaurants([]);
      return;
    }

    const fetchRestaurants = async () => {
      setLoadingRestaurants(true);
      setRestaurants([]);

      try {
        const response = await fetch(`/api/partners/check-restaurant?destinationName=${encodeURIComponent(selectedDestination.name)}`);
        if (!response.ok) {
          throw new Error('Failed to fetch restaurants');
        }
        const data = await response.json();

        console.log('Restaurants API response:', data);

        if (data.error) {
          console.error('API returned error:', data.error);
          setRestaurants([]);
        } else if (data.destinationFound && data.restaurants) {
          // Sort restaurants alphabetically by name
          const sorted = data.restaurants.sort((a, b) => 
            a.name.localeCompare(b.name)
          );
          setRestaurants(sorted);
          console.log(`Loaded ${sorted.length} restaurants for ${selectedDestination?.name}`);
        } else if (data.multipleDestinations) {
          console.warn('Multiple destinations found, but no restaurants returned');
          setRestaurants([]);
        } else {
          console.warn('No restaurants in response:', data);
          setRestaurants([]);
        }
      } catch (error) {
        console.error('Error fetching restaurants:', error);
      } finally {
        setLoadingRestaurants(false);
      }
    };

    fetchRestaurants();
  }, [selectedDestinationId, selectedDestination]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      <NavigationNext />
      
      <main className="container mx-auto px-4 py-16 md:py-20 max-w-4xl">
        {/* Header - Landing page with Continue button */}
        {step === 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <div className="flex items-center justify-center gap-3 mb-6 md:mb-8">
            <UtensilsCrossed className="w-10 h-10 md:w-12 md:h-12 text-amber-500" />
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900">Restaurant Partner Program</h1>
          </div>
            <p className="text-xl md:text-2xl text-gray-600 max-w-2xl mx-auto mb-8">
            Increase visibility and drive more bookings through our partnership with Google Places
          </p>
            <Button
              onClick={() => setStep(1)}
              size="lg"
              className="sunset-gradient text-white text-lg px-8 py-6"
            >
              Get Started
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
        </motion.div>
        )}

        {/* About Section - Google Places Partnership - Only show on step 0 */}
        {step === 0 && (
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-12"
        >
          <Card className="shadow-xl border-2 border-purple-100">
            <CardContent className="p-8">
              <div className="flex items-center gap-3 mb-6">
                <Shield className="w-8 h-8 text-purple-600" />
                <h2 className="text-2xl font-bold text-gray-900">How TopTours.ai Works</h2>
              </div>
              
              <div className="prose prose-lg max-w-none text-gray-700 space-y-4">
                <p>
                  TopTours.ai operates as a <strong>partner with Google Places API</strong>, pulling restaurant data 
                  directly from Google's comprehensive database. We ensure you always have the most up-to-date information 
                  about your restaurant, including hours, ratings, and contact details.
                </p>
                <p>
                  <strong>All bookings and reservations are handled directly through your restaurant's website or booking partner</strong> - 
                  we do not manage bookings ourselves. When travelers click to reserve, they're redirected to your 
                  website or booking platform where they complete their reservation. This ensures a seamless, trusted booking experience.
                </p>
                <p className="bg-purple-50 border-l-4 border-purple-500 p-4 rounded">
                  <strong>Why partner with us?</strong> We help increase visibility and clicks to your restaurant 
                  listings through our Restaurant Premium Program, featuring top placement and premium badges.
                </p>
              </div>
            </CardContent>
          </Card>
        </motion.section>
        )}

        {/* Two Methods Section - Only show on step 0 */}
        {step === 0 && (
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-12"
        >
          <h2 className="text-3xl font-bold text-gray-900 text-center mb-8">
            Restaurant Premium Program
          </h2>
          
          <div className="max-w-4xl mx-auto">
            {/* Restaurant Premium */}
            <Card className="shadow-xl border-2 border-amber-200">
              <CardContent className="p-8">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-12 h-12 bg-gradient-to-br from-amber-500 to-orange-500 rounded-xl flex items-center justify-center">
                    <Crown className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900">Restaurant Premium</h3>
                </div>
                
                <p className="text-gray-700 mb-6">
                  Get premium placement with customizable CTAs, premium badge, and multiple visibility touchpoints 
                  to drive more clicks and reservations to your restaurant.
                </p>
                
                {/* 5-12× More Clicks */}
                <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg p-6 mb-6 border-2 border-green-200">
                  <div className="text-center mb-4">
                    <div className="text-4xl font-black text-green-600 mb-2">5-12×</div>
                    <div className="text-lg font-bold text-gray-900 mb-1">more clicks</div>
                    <div className="text-sm text-gray-600">vs. standard listings</div>
                  </div>
                  
                  <div className="bg-white rounded-lg p-4 border border-green-200">
                    <div className="text-xs text-gray-500 uppercase tracking-wide mb-3 text-center">Real Click-Through Rates</div>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="text-center">
                        <div className="text-xs text-gray-500 mb-1">Without Premium</div>
                        <div className="text-2xl font-bold text-gray-400">~1%</div>
                      </div>
                      <div className="text-center">
                        <div className="text-xs text-gray-500 mb-1">With Premium</div>
                        <div className="text-2xl font-bold text-green-600">5-12%</div>
                      </div>
                    </div>
                    <div className="mt-3 pt-3 border-t border-green-200 text-center">
                      <p className="text-xs text-gray-600">
                        <strong className="text-gray-900">Up to 1,100% more engagement.</strong> That's the difference between 
                        1 click and 12 clicks for every 100 visitors.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Fully Customizable */}
                <div className="bg-amber-50 rounded-lg p-6 mb-6">
                  <h4 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <Crown className="w-5 h-5 text-amber-600" />
                    Fully Customizable
                  </h4>
                  <div className="space-y-2 text-sm text-gray-700">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-green-600 flex-shrink-0" />
                      <span><strong>Button Colors</strong> - 3 colors to match your brand</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-green-600 flex-shrink-0" />
                      <span><strong>CTA Text</strong> - Pick your button text</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-green-600 flex-shrink-0" />
                      <span><strong>Premium Badge</strong> - Crown signals quality</span>
                    </div>
                  </div>
                </div>

                {/* What's Included */}
                <div className="bg-blue-50 rounded-lg p-6 mb-6">
                  <h4 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <MousePointerClick className="w-5 h-5 text-blue-600" />
                    What's Included
                  </h4>
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-blue-600 flex-shrink-0" />
                      <span className="text-gray-700"><strong>Hero CTA</strong> - Top of page</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-blue-600 flex-shrink-0" />
                      <span className="text-gray-700"><strong>Mid Banner</strong> - Catches scrollers</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-blue-600 flex-shrink-0" />
                      <span className="text-gray-700"><strong>Sticky Button</strong> - Always visible</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-blue-600 flex-shrink-0" />
                      <span className="text-gray-700"><strong>TOP Badge</strong> - Premium look</span>
                    </div>
                  </div>
                </div>

                {/* Pays for Itself */}
                <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg p-6 mb-6 border-2 border-green-200">
                  <h4 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <DollarSign className="w-5 h-5 text-green-600" />
                    Pays for Itself Instantly
                  </h4>
                  <div className="bg-white rounded-lg p-4 border border-green-200">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="flex-1 bg-gray-50 rounded-lg p-3 border border-gray-200 text-center">
                        <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">You Pay</p>
                        <p className="text-2xl font-black text-gray-900">$4.99</p>
                        <p className="text-xs text-gray-500">per month</p>
                      </div>
                      <ArrowRight className="w-6 h-6 text-green-500" />
                      <div className="flex-1 bg-green-50 rounded-lg p-3 border-2 border-green-500 text-center">
                        <p className="text-xs text-green-700 uppercase tracking-wide mb-1 font-semibold">1 Extra Table =</p>
                        <p className="text-2xl font-black text-green-600">$40-120</p>
                        <p className="text-xs text-green-700">in revenue</p>
                      </div>
                    </div>
                    <div className="text-center pt-3 border-t border-green-200">
                      <p className="text-sm text-gray-700">
                        <strong className="text-gray-900">8× return</strong> on just ONE extra reservation per month
                      </p>
                    </div>
                  </div>
                </div>

                {/* Pricing */}
                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div className="bg-amber-50 border-2 border-amber-400 rounded-lg p-4 text-center">
                    <div className="text-xs text-gray-500 mb-1">Annual (12 months)</div>
                    <div className="text-2xl font-bold text-amber-600">$4.99</div>
                    <div className="text-sm text-gray-600">per month</div>
                    <div className="text-xs text-gray-400 mt-1">One-time payment</div>
                    <Badge className="mt-2 bg-green-100 text-green-700 text-xs">Best Value</Badge>
                  </div>
                  <div className="bg-white border-2 border-amber-200 rounded-lg p-4 text-center">
                    <div className="text-xs text-gray-500 mb-1">Monthly billing</div>
                    <div className="text-2xl font-bold text-gray-900">$7.99</div>
                    <div className="text-sm text-gray-600">per month</div>
                    <div className="text-xs text-gray-400 mt-1">Billed monthly</div>
                  </div>
                </div>
                
                {/* CTA Button */}
                <Button
                  onClick={handleGetStarted}
                  size="lg"
                  className="w-full sunset-gradient text-white"
                >
                  Get Started with Premium
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </CardContent>
            </Card>
          </div>
        </motion.section>
        )}

        {/* Promoted Listings Section - Only show on step 0 */}
        {step === 0 && (
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
          className="mb-12"
        >
          <h2 className="text-3xl font-bold text-gray-900 text-center mb-8">
            Promoted Listings
          </h2>
          
          <div className="max-w-4xl mx-auto">
            <Card className="shadow-xl border-2 border-purple-200">
              <CardContent className="p-8">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-indigo-500 rounded-xl flex items-center justify-center">
                    <TrendingUp className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900">Get Top Placement</h3>
                </div>
                
                <p className="text-gray-700 mb-6">
                  Promote your restaurant to appear at the top of search results and destination pages. 
                  Your listing will always show first, regardless of filters or sorting, ensuring maximum visibility.
                </p>
                
                <div className="bg-purple-50 rounded-lg p-6 mb-6">
                  <h4 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <Zap className="w-5 h-5 text-purple-600" />
                    Extra Visibility Benefits
                  </h4>
                  <ul className="space-y-3">
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                      <span className="text-gray-700"><strong>Always First</strong> - Your promoted restaurant appears at the top of all grids, before any other results</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                      <span className="text-gray-700"><strong>Filter-Proof</strong> - Promoted listings stay at the top even when users apply filters or change sorting</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                      <span className="text-gray-700"><strong>Cross-Promotion</strong> - Promoted restaurants show on tour pages, reaching travelers planning their activities</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                      <span className="text-gray-700"><strong>Promoted Badge</strong> - Eye-catching "Promoted" badge with sparkle icon signals premium placement</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                      <span className="text-gray-700"><strong>Multiple Pages</strong> - Appears on destination detail pages, restaurants listing pages, and Match Your Style results</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                      <span className="text-gray-700 font-semibold"><strong>Maximum Exposure</strong> - Get seen by travelers browsing destinations, searching for restaurants, and using personalized recommendations</span>
                    </li>
                  </ul>
                </div>
                
                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div className="bg-white border-2 border-purple-200 rounded-lg p-4 text-center">
                    <div className="text-xs text-gray-500 mb-1">Annual (12 months)</div>
                    <div className="text-2xl font-bold text-purple-600">$19.99</div>
                    <div className="text-sm text-gray-600">per month</div>
                    <div className="text-xs text-gray-400 mt-1">$239.88 paid upfront</div>
                    <Badge className="mt-2 bg-green-100 text-green-700 text-xs">Save $60/year</Badge>
                  </div>
                  <div className="bg-purple-50 border-2 border-purple-400 rounded-lg p-4 text-center">
                    <div className="text-xs text-gray-500 mb-1">Monthly billing</div>
                    <div className="text-2xl font-bold text-gray-900">$24.99</div>
                    <div className="text-sm text-gray-600">per month</div>
                    <div className="text-xs text-gray-400 mt-1">Billed monthly</div>
                  </div>
                </div>
                
                <div className="bg-blue-50 rounded-lg p-4 border border-blue-200 mb-6">
                  <p className="text-sm text-gray-700 text-center">
                    <strong className="text-gray-900">~20% discount</strong> when you commit to 12 months. 
                    Perfect for restaurants who want consistent top placement year-round.
                  </p>
                </div>
                
                {/* CTA Button */}
                <Button
                  onClick={handleGetStarted}
                  size="lg"
                  className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white"
                >
                  Get Started with Promoted Listing
                  <TrendingUp className="w-5 h-5 ml-2" />
                </Button>
              </CardContent>
            </Card>
          </div>
        </motion.section>
        )}

        {/* Step 1: Restaurant Selection */}
        {step === 1 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-12"
          >
            <Card className="shadow-xl">
              <CardContent className="p-8">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-gray-900">Select Your Restaurant</h2>
                  <Badge variant="secondary">Step 1 of 3</Badge>
                </div>
                
                <p className="text-gray-600 mb-6">
                  Choose your destination and restaurant from the list below.
                </p>
                
                <div className="space-y-4 mb-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Select Destination
                    </label>
                    <select
                      value={selectedDestinationId}
                      onChange={handleDestinationChange}
                      disabled={loadingDestinations}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white"
                    >
                      <option value="">
                        {loadingDestinations ? 'Loading destinations...' : 'Choose a destination'}
                      </option>
                      {destinations.length > 0 ? (
                        destinations.map((dest) => (
                          <option key={dest.id} value={dest.id}>
                            {dest.name}
                          </option>
                        ))
                      ) : !loadingDestinations ? (
                        <option value="" disabled>
                          No destinations with restaurants found
                        </option>
                      ) : null}
                    </select>
                  </div>
                  
                  {selectedDestinationId && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Select Restaurant
                      </label>
                      {loadingRestaurants ? (
                        <div className="flex items-center justify-center gap-2 text-gray-600 py-8 border border-gray-200 rounded-lg">
                          <Loader2 className="w-5 h-5 animate-spin" />
                          <span>Loading restaurants...</span>
                        </div>
                      ) : restaurants.length > 0 ? (
                        <div className="bg-white border border-gray-200 rounded-lg divide-y divide-gray-200 max-h-96 overflow-y-auto">
                          {restaurants.map((rest) => (
                            <label
                              key={rest.id}
                              className={`flex items-center gap-3 p-4 cursor-pointer transition-all hover:bg-gray-50 ${
                                selectedRestaurant?.id === rest.id ? 'bg-purple-50 border-l-4 border-purple-600' : ''
                              }`}
                            >
                              <input
                                type="radio"
                                name="restaurant"
                                value={rest.id}
                                checked={selectedRestaurant?.id === rest.id}
                                onChange={() => setSelectedRestaurant(rest)}
                                className="w-5 h-5 text-purple-600"
                              />
                              <div className="flex-1">
                                <h4 className="font-medium text-gray-900">{rest.name}</h4>
                                {rest.slug && (
                                  <a
                                    href={`/destinations/${selectedDestination?.slug || selectedDestination?.id}/restaurants/${rest.slug}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-sm text-purple-600 hover:text-purple-700 hover:underline mt-1 inline-block"
                                    onClick={(e) => e.stopPropagation()}
                                  >
                                    View on TopTours.ai →
                                  </a>
                                )}
                              </div>
                            </label>
                          ))}
                        </div>
                      ) : (
                        <div className="p-6 bg-gray-50 border border-gray-200 rounded-lg text-center">
                          <p className="text-gray-600 mb-4">
                            No restaurants found for this destination.
                          </p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
                
                <div className="flex justify-between mt-8">
                  <Button
                    onClick={() => setStep(0)}
                    variant="outline"
                  >
                    Back
                  </Button>
                  <Button
                    onClick={() => {
                      if (!selectedRestaurant) {
                        toast({
                          title: 'Restaurant required',
                          description: 'Please select a restaurant to continue.',
                          variant: 'destructive',
                        });
                        return;
                      }
                      setStep(2);
                    }}
                    disabled={!selectedRestaurant}
                    className="sunset-gradient text-white disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Continue
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
        
        {/* Step 2: Plan Selection */}
        {step === 2 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-12"
          >
            <Card className="shadow-xl">
              <CardContent className="p-8">
                <div className="flex items-center gap-2 mb-6">
                  <Button
                    onClick={() => setStep(1)}
                    variant="ghost"
                    size="sm"
                  >
                    <ArrowRight className="w-4 h-4 mr-1 rotate-180" />
                    Back
                  </Button>
                  <div className="flex-1">
                    <h2 className="text-2xl font-bold text-gray-900">Choose Your Plan</h2>
                    {selectedRestaurant && (
                      <p className="text-sm text-gray-600 mt-1">
                        {selectedRestaurant.name} • {selectedDestination?.name}
                      </p>
                    )}
                  </div>
                  <Badge variant="secondary">Step 2 of 3</Badge>
                </div>
                
                {/* Selected Restaurant Info */}
                {selectedRestaurant && (
                  <div className="bg-purple-50 border border-purple-200 rounded-lg p-4 mb-6">
                    <div className="flex items-center gap-2">
                      <UtensilsCrossed className="w-5 h-5 text-purple-600" />
                      <span className="font-semibold text-gray-900">{selectedRestaurant.name}</span>
                    </div>
                    <p className="text-sm text-gray-600 mt-1">{selectedDestination?.name}</p>
                  </div>
                )}
                
                {/* Restaurant Premium Selection */}
                <div className="mb-8">
                  <label className="block text-sm font-medium text-gray-700 mb-4">Restaurant Premium</label>
                  <div className="grid md:grid-cols-2 gap-4">
                    <Card 
                      className={`cursor-pointer border-2 transition-all ${
                        premiumPlan === 'annual' 
                          ? 'border-amber-600 bg-amber-50' 
                          : 'border-gray-200 hover:border-amber-300'
                      }`}
                      onClick={() => setPremiumPlan('annual')}
                    >
                      <CardContent className="p-6">
                        <div className="flex items-center justify-between mb-3">
                          <h3 className="text-xl font-bold">Annual</h3>
                          {premiumPlan === 'annual' && (
                            <CheckCircle2 className="w-6 h-6 text-amber-600" />
                          )}
                        </div>
                        <div className="text-3xl font-bold text-gray-900 mb-2">$4.99</div>
                        <div className="text-sm text-gray-600 mb-2">per month</div>
                        <div className="text-xs text-gray-500">$59.88/year</div>
                        <Badge className="mt-2 bg-green-100 text-green-700 text-xs">Save 37%</Badge>
                      </CardContent>
                    </Card>
                    
                    <Card 
                      className={`cursor-pointer border-2 transition-all ${
                        premiumPlan === 'monthly' 
                          ? 'border-amber-600 bg-amber-50' 
                          : 'border-gray-200 hover:border-amber-300'
                      }`}
                      onClick={() => setPremiumPlan('monthly')}
                    >
                      <CardContent className="p-6">
                        <div className="flex items-center justify-between mb-3">
                          <h3 className="text-xl font-bold">Monthly</h3>
                          {premiumPlan === 'monthly' && (
                            <CheckCircle2 className="w-6 h-6 text-amber-600" />
                          )}
                        </div>
                        <div className="text-3xl font-bold text-gray-900 mb-2">$7.99</div>
                        <div className="text-sm text-gray-600">per month</div>
                      </CardContent>
                    </Card>
                  </div>
                </div>
                
                {/* Optional Promotion Checkbox */}
                <div className="mb-8">
                  <Card className={`border-2 ${wantsPromotion ? 'border-indigo-300 bg-indigo-50' : 'border-gray-200'}`}>
                    <CardContent className="p-6">
                      <label className="flex items-start gap-4 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={wantsPromotion}
                          onChange={(e) => setWantsPromotion(e.target.checked)}
                          className="mt-1 w-5 h-5 text-indigo-600 rounded"
                        />
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <Sparkles className="w-5 h-5 text-indigo-600" />
                            <h3 className="text-lg font-bold text-gray-900">Also Promote Restaurant for Top Placement</h3>
                          </div>
                          <p className="text-sm text-gray-600 mb-4">
                            Get top placement on all pages. Promoted restaurants appear first, before any other results.
                          </p>
                          
                          {wantsPromotion && (
                            <div className="mt-4">
                              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-3">
                                <p className="text-sm text-blue-800">
                                  <strong>Note:</strong> Promotion billing cycle matches your premium plan ({premiumPlan === 'annual' ? 'Annual' : 'Monthly'})
                                </p>
                              </div>
                              <label className="block text-sm font-medium text-gray-700 mb-3">Promotion Billing Cycle</label>
                              <div className="grid grid-cols-2 gap-3">
                                <button
                                  type="button"
                                  onClick={() => {
                                    setPremiumPlan('annual');
                                    setPromotedBillingCycle('annual');
                                  }}
                                  disabled={premiumPlan !== 'annual'}
                                  className={`p-4 rounded-lg border-2 transition-all text-left ${
                                    promotedBillingCycle === 'annual'
                                      ? 'border-indigo-600 bg-indigo-100'
                                      : 'border-gray-200 bg-white hover:border-indigo-300'
                                  } ${premiumPlan !== 'annual' ? 'opacity-50 cursor-not-allowed' : ''}`}
                                >
                                  <div className="font-semibold text-gray-900 mb-1">Annual (12 months)</div>
                                  <div className="text-2xl font-bold text-indigo-600 mb-1">$19.99</div>
                                  <div className="text-sm text-gray-600 mb-1">per month</div>
                                  <div className="text-xs text-gray-400">$239.88 paid upfront</div>
                                  <Badge className="mt-2 bg-green-100 text-green-700 text-xs">Save $60/year</Badge>
                                </button>
                                
                                <button
                                  type="button"
                                  onClick={() => {
                                    setPremiumPlan('monthly');
                                    setPromotedBillingCycle('monthly');
                                  }}
                                  disabled={premiumPlan !== 'monthly'}
                                  className={`p-4 rounded-lg border-2 transition-all text-left ${
                                    promotedBillingCycle === 'monthly'
                                      ? 'border-indigo-600 bg-indigo-100'
                                      : 'border-gray-200 bg-white hover:border-indigo-300'
                                  } ${premiumPlan !== 'monthly' ? 'opacity-50 cursor-not-allowed' : ''}`}
                                >
                                  <div className="font-semibold text-gray-900 mb-1">Monthly billing</div>
                                  <div className="text-2xl font-bold text-gray-900 mb-1">$24.99</div>
                                  <div className="text-sm text-gray-600 mb-1">per month</div>
                                  <div className="text-xs text-gray-400">Billed monthly</div>
                                </button>
                              </div>
                            </div>
                          )}
                        </div>
                      </label>
                    </CardContent>
                  </Card>
                </div>
                
                <div className="mt-8 flex justify-end">
                  <Button
                    onClick={() => {
                      if (!premiumPlan) {
                        toast({
                          title: 'Please select a premium plan',
                          description: 'Choose Annual or Monthly billing for Restaurant Premium.',
                          variant: 'destructive',
                        });
                        return;
                      }
                      setStep(3);
                    }}
                    disabled={!premiumPlan}
                    className="sunset-gradient text-white disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Continue
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                  {!user && (
                    <p className="text-sm text-gray-600 text-center mt-2">
                      <Link href={`/auth?redirect=${encodeURIComponent('/partners/restaurants')}`} className="text-purple-600 hover:underline">
                        Sign in
                      </Link>
                      {' required to continue'}
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
        
        {/* Step 3: Customize Your Listing */}
        {step === 3 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-12"
          >
            <Card className="shadow-xl">
              <CardContent className="p-8">
                <div className="flex items-center gap-2 mb-6">
                  <Button
                    onClick={() => setStep(2)}
                    variant="ghost"
                    size="sm"
                  >
                    <ArrowRight className="w-4 h-4 mr-1 rotate-180" />
                    Back
                  </Button>
                  <div className="flex-1">
                    <h2 className="text-2xl font-bold text-gray-900">Customize Your Listing</h2>
                    {selectedRestaurant && (
                      <p className="text-sm text-gray-600 mt-1">
                        {selectedRestaurant.name} • {selectedDestination?.name}
                      </p>
                    )}
                  </div>
                  <Badge variant="secondary">Step 3 of 4</Badge>
                </div>
                
                <p className="text-gray-600 mb-6">
                  Personalize your restaurant listing with custom button colors and call-to-action text.
                </p>

                {/* Button Color Selection */}
                <div className="mb-8">
                  <label className="block text-sm font-medium text-gray-700 mb-4">Button Color</label>
                  <div className="flex gap-4">
                    {Object.entries(COLOR_SCHEMES).map(([schemeKey, scheme]) => {
                      const colorMap = { blue: '#2563eb', coral: '#f97316', teal: '#0d9488' };
                      return (
                        <button
                          key={schemeKey}
                          onClick={() => setColorScheme(schemeKey)}
                          className={`flex flex-col items-center gap-2 p-4 rounded-lg border-2 transition-all ${
                            colorScheme === schemeKey
                              ? 'border-gray-900 bg-gray-50 scale-105'
                              : 'border-gray-200 hover:border-gray-400'
                          }`}
                        >
                          <div
                            className="w-16 h-16 rounded-lg shadow-md"
                            style={{ backgroundColor: colorMap[schemeKey] }}
                          />
                          <span className="text-sm font-medium text-gray-700">{scheme.name}</span>
                          {colorScheme === schemeKey && (
                            <CheckCircle2 className="w-5 h-5 text-green-600" />
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Hero CTA Selection */}
                <div className="mb-8">
                  <label className="block text-sm font-medium text-gray-700 mb-3">Hero Button Text</label>
                  <p className="text-xs text-gray-500 mb-3">The main call-to-action button at the top of your restaurant page</p>
                  <select
                    value={heroCTAIndex}
                    onChange={(e) => setHeroCTAIndex(parseInt(e.target.value))}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-purple-500 focus:border-purple-500 bg-white"
                  >
                    {CTA_OPTIONS.hero.map((option, idx) => (
                      <option key={idx} value={idx}>{option.text}</option>
                    ))}
                  </select>
                </div>

                {/* Mid-Page Banner CTA Selection */}
                <div className="mb-8">
                  <label className="block text-sm font-medium text-gray-700 mb-3">Mid-Page Banner Text</label>
                  <p className="text-xs text-gray-500 mb-3">A banner that appears in the middle of your restaurant page</p>
                  <select
                    value={midCTAIndex}
                    onChange={(e) => setMidCTAIndex(parseInt(e.target.value))}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-purple-500 focus:border-purple-500 bg-white"
                  >
                    {CTA_OPTIONS.mid.map((option, idx) => (
                      <option key={idx} value={idx}>
                        {option.text} {option.subtext ? `- ${option.subtext}` : ''}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Sticky Button CTA Selection */}
                <div className="mb-8">
                  <label className="block text-sm font-medium text-gray-700 mb-3">Sticky Button Text</label>
                  <p className="text-xs text-gray-500 mb-3">A button that stays visible at the bottom of the screen as users scroll</p>
                  <select
                    value={stickyCTAIndex}
                    onChange={(e) => setStickyCTAIndex(parseInt(e.target.value))}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-purple-500 focus:border-purple-500 bg-white"
                  >
                    {CTA_OPTIONS.sticky.map((option, idx) => (
                      <option key={idx} value={idx}>{option.text}</option>
                    ))}
                  </select>
                </div>
                
                <div className="mt-8 flex justify-end">
                  <Button
                    onClick={() => setStep(4)}
                    className="sunset-gradient text-white"
                  >
                    Continue to Review
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
        
        {/* Step 4: Review and Checkout */}
        {step === 4 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-12"
          >
            <div className="space-y-6">
              <div className="text-center mb-6">
                <h3 className="text-xl font-bold text-gray-900 mb-2">Review Your Selection</h3>
                <p className="text-gray-600">Almost there! Review and complete your order.</p>
              </div>

              {/* Back button */}
              <div className="mb-4">
                <Button
                  onClick={() => setStep(3)}
                  variant="ghost"
                  size="sm"
                >
                  <ArrowRight className="w-4 h-4 mr-1 rotate-180" />
                  Back to Customization
                </Button>
              </div>

              {/* Logged in user badge */}
              {user && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-3 flex items-center gap-3">
                  <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                    <CheckCircle className="w-4 h-4 text-green-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-green-900">Signed in as</p>
                    <p className="text-sm text-green-700">{user.email}</p>
                  </div>
                </div>
              )}

              {/* Summary */}
              <div className="bg-gray-50 rounded-xl p-6 space-y-4">
                <h4 className="font-semibold text-gray-900 text-lg mb-4">Order Summary</h4>
                
                {/* Selected Restaurant */}
                {selectedRestaurant && (
                  <div className="space-y-2 pb-3 border-b border-gray-200">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600 font-medium flex items-center gap-2">
                        <UtensilsCrossed className="w-4 h-4" />
                        Restaurant
                      </span>
                      <span className="font-medium text-gray-900">{selectedRestaurant.name}</span>
                    </div>
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-gray-500">Location</span>
                      <span className="text-gray-700">{selectedDestination?.name}</span>
                    </div>
                  </div>
                )}
                
                {/* Premium Plan */}
                {premiumPlan && (
                  <div className="space-y-2 pb-3 border-b border-gray-200">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600 font-medium">Restaurant Premium</span>
                      <span className="font-medium text-gray-900">
                        {premiumPlan === 'annual' ? 'Annual' : 'Monthly'}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Premium Cost</span>
                      <span className="font-medium text-gray-900">
                        {premiumPlan === 'annual' 
                          ? '$59.88/year'
                          : '$7.99/month'
                        }
                      </span>
                    </div>
                    {/* Customization Preview */}
                    <div className="mt-3 pt-3 border-t border-gray-200">
                      <div className="text-xs text-gray-500 mb-2">Customization:</div>
                      <div className="flex flex-wrap gap-2 text-xs">
                        <Badge variant="outline" className="text-xs">
                          Color: {COLOR_SCHEMES[colorScheme]?.name || 'Ocean Blue'}
                        </Badge>
                        <Badge variant="outline" className="text-xs">
                          Hero: {CTA_OPTIONS.hero[heroCTAIndex]?.text || 'Reserve Your Table'}
                        </Badge>
                        <Badge variant="outline" className="text-xs">
                          Sticky: {CTA_OPTIONS.sticky[stickyCTAIndex]?.text || 'Reserve Table'}
                        </Badge>
                      </div>
                    </div>
                  </div>
                )}
                
                {/* Promotion (if selected) */}
                {wantsPromotion && (
                  <div className="space-y-2 pb-3 border-b border-gray-200">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600 font-medium flex items-center gap-2">
                        <Sparkles className="w-4 h-4 text-purple-600" />
                        Promoted Listing
                      </span>
                      <span className="font-medium text-gray-900">
                        {promotedBillingCycle === 'annual' ? 'Annual' : 'Monthly'}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Promotion Cost</span>
                      <span className="font-medium text-purple-700">
                        {promotedBillingCycle === 'annual' 
                          ? '$239.88/year'
                          : '$24.99/month'
                        }
                      </span>
                    </div>
                  </div>
                )}
                
                <hr className="border-gray-300 my-2" />
                
                {/* Total */}
                <div className="flex justify-between items-center pt-2">
                  <span className="font-bold text-lg text-gray-900">Total</span>
                  <div className="text-right">
                    <div className="font-bold text-xl text-gray-900">
                      {(() => {
                        // If both are annual, show yearly total
                        if (premiumPlan === 'annual' && wantsPromotion && promotedBillingCycle === 'annual') {
                          const premiumYearly = 59.88;
                          const promotionYearly = 239.88;
                          const totalYearly = premiumYearly + promotionYearly;
                          return `$${totalYearly.toFixed(2)}/year`;
                        }
                        // If only premium is annual (no promotion), show yearly total
                        else if (premiumPlan === 'annual' && !wantsPromotion) {
                          return `$59.88/year`;
                        }
                        // If only premium is annual but promotion is monthly, show monthly total (mixed)
                        else if (premiumPlan === 'annual' && wantsPromotion && promotedBillingCycle === 'monthly') {
                          return `$${(4.99 + 24.99).toFixed(2)}/month`;
                        }
                        // If only promotion is annual (monthly premium), show monthly total (mixed)
                        else if (premiumPlan === 'monthly' && wantsPromotion && promotedBillingCycle === 'annual') {
                          return `$${(7.99 + 19.99).toFixed(2)}/month`;
                        }
                        // Both monthly, show monthly total
                        else {
                          const premiumMonthly = 7.99;
                          const promotionMonthly = wantsPromotion ? 24.99 : 0;
                          return `$${(premiumMonthly + promotionMonthly).toFixed(2)}/month`;
                        }
                      })()}
                    </div>
                    {/* Show monthly equivalent only when both are annual */}
                    {premiumPlan === 'annual' && wantsPromotion && promotedBillingCycle === 'annual' && (
                      <p className="text-sm text-gray-600 mt-1">
                        $24.98/month equivalent
                      </p>
                    )}
                    {/* Show monthly equivalent when only premium is annual and no promotion */}
                    {premiumPlan === 'annual' && !wantsPromotion && (
                      <p className="text-sm text-gray-600 mt-1">
                        $4.99/month equivalent
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Checkout Button */}
              <div className="flex justify-between items-center">
                <Button
                  onClick={() => setStep(3)}
                  variant="outline"
                  disabled={loading}
                >
                  <ArrowRight className="w-4 h-4 mr-1 rotate-180" />
                  Back to Customization
                </Button>
                <Button
                  onClick={handleSubmit}
                  disabled={loading || !user}
                  className="sunset-gradient text-white disabled:opacity-50 disabled:cursor-not-allowed"
                  size="lg"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      Complete Checkout
                      <ArrowRight className="w-5 h-5 ml-2" />
                    </>
                  )}
                </Button>
              </div>
            </div>
          </motion.div>
        )}
        
        {/* Step 5: Success */}
        {step === 5 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-12"
          >
            <Card className="shadow-xl border-2 border-green-200">
              <CardContent className="p-8 text-center">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CheckCircle className="w-8 h-8 text-green-600" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Payment Successful!</h2>
                <p className="text-gray-600 mb-6">
                  Your subscription has been activated. You can view and manage it in your profile.
                </p>
                <div className="flex gap-4 justify-center">
                  <Button
                    onClick={() => {
                      setStep(0);
                      setSelectedRestaurant(null);
                      setSelectedDestinationId('');
                      setSelectedDestination(null);
                        setPremiumPlan(null);
                        setWantsPromotion(false);
                        setPromotedBillingCycle('annual');
                      }}
                    variant="outline"
                  >
                    Start Over
                  </Button>
                  <Button
                    onClick={() => router.push('/profile')}
                    className="sunset-gradient text-white"
                  >
                    View My Profile
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
        
        {/* About Section - Only show on step 0 */}
        {step === 0 && (
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="mb-12"
          >
            <Card className="shadow-xl border-2 border-purple-200 bg-gradient-to-br from-purple-50 to-white">
              <CardContent className="p-8 text-center">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Ready to Get Started?</h2>
                <p className="text-gray-600 mb-6">
                  Select your restaurant and choose your plan to begin increasing visibility and driving more reservations.
                </p>
                <Button
                  onClick={handleGetStarted}
                  size="lg"
                  className="sunset-gradient text-white"
                >
                  Get Started
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </CardContent>
            </Card>
          </motion.section>
        )}

        {/* Restaurant Lookup Tool - Only show on step 0 */}
        {step === 0 && (
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mb-12"
        >
          <Card className="shadow-xl border-2 border-purple-200 bg-gradient-to-br from-purple-50 to-white">
            <CardContent className="p-8 md:p-12">
              <div className="flex items-center gap-3 mb-6">
                <Search className="w-8 h-8 text-purple-600" />
                <h2 className="text-3xl font-bold text-gray-900">Check if Your Restaurant is Listed</h2>
              </div>
              
              <p className="text-gray-600 mb-6">
                Select your destination below to see all restaurants listed on TopTours.ai for that location.
              </p>
              
              <div className="space-y-4">
                {/* Destination Dropdown */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Select Destination
                  </label>
                  <select
                    value={selectedDestinationId}
                    onChange={handleDestinationChange}
                    disabled={loadingDestinations}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white"
                  >
                    <option value="">
                      {loadingDestinations ? 'Loading destinations...' : 'Choose a destination'}
                    </option>
                    {destinations.length > 0 ? (
                      destinations.map((dest) => (
                        <option key={dest.id} value={dest.id}>
                          {dest.name}
                        </option>
                      ))
                    ) : !loadingDestinations ? (
                      <option value="" disabled>
                        No destinations with restaurants found
                      </option>
                    ) : null}
                  </select>
                  {!loadingDestinations && destinations.length === 0 && (
                    <p className="mt-2 text-sm text-amber-600">
                      No destinations with restaurants found. Please check the console for details.
                    </p>
                  )}
                </div>

                {/* Restaurant List - Show when destination selected */}
                {selectedDestinationId && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mt-6"
                  >
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">
                      Restaurants in {selectedDestination?.name}
                    </h3>
                    {loadingRestaurants ? (
                      <div className="flex items-center justify-center gap-2 text-gray-600 py-8">
                        <Loader2 className="w-5 h-5 animate-spin" />
                        <span>Loading restaurants...</span>
                      </div>
                    ) : restaurants.length > 0 ? (
                      <div className="bg-white border border-gray-200 rounded-lg divide-y divide-gray-200 max-h-96 overflow-y-auto">
                        {restaurants.map((rest) => (
                          <div
                            key={rest.id}
                            className="p-4 hover:bg-gray-50 transition-colors"
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex-1">
                                <h4 className="font-medium text-gray-900">{rest.name}</h4>
                                {rest.slug && (
                                  <a
                                    href={`/destinations/${selectedDestination?.slug}/restaurants/${rest.slug}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-sm text-purple-600 hover:text-purple-700 hover:underline mt-1 inline-block"
                                  >
                                    View on TopTours.ai →
                                  </a>
                                )}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="p-6 bg-gray-50 border border-gray-200 rounded-lg text-center">
                        <p className="text-gray-600 mb-4">
                          No restaurants found for this destination.
                        </p>
                        <p className="text-sm text-gray-500 mb-4">
                          Want to add your restaurant? Send us an email:
                        </p>
                        <a
                          href="mailto:mail@toptours.ai?subject=Add Restaurant Request&body=Hi,%0D%0A%0D%0AI would like to add my restaurant to TopTours.ai.%0D%0A%0D%0ADestination: [Your Destination]%0D%0ARestaurant Name: [Your Restaurant Name]%0D%0AAdditional Information: [Any additional details]"
                          className="inline-flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                        >
                          <Mail className="w-4 h-4" />
                          Send Request to mail@toptours.ai
                        </a>
                      </div>
                    )}
                  </motion.div>
                )}

              </div>
            </CardContent>
          </Card>
        </motion.section>
        )}

        {/* Add Restaurant Section */}
        {step === 1 && (
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mb-12"
        >
          <Card className="shadow-xl border-2 border-amber-200 bg-gradient-to-br from-amber-50 to-white">
            <CardContent className="p-8 md:p-12">
              <div className="text-center">
                <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">
                  Want to add your restaurant?
                </h2>
                <p className="text-gray-600 mb-6">
                  Is your destination in the list above but your restaurant isn't? Send us an email to request adding your restaurant to TopTours.ai.
                </p>
                <a
                  href="mailto:mail@toptours.ai?subject=Add Restaurant Request&body=Hi,%0D%0A%0D%0AI would like to add my restaurant to TopTours.ai.%0D%0A%0D%0ADestination: [Your Destination]%0D%0ARestaurant Name: [Your Restaurant Name]%0D%0AAdditional Information: [Any additional details]"
                  className="inline-flex items-center gap-2 px-6 py-3 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors font-medium"
                >
                  <Mail className="w-5 h-5" />
                  Send Request to mail@toptours.ai
                </a>
              </div>
            </CardContent>
          </Card>
        </motion.section>
        )}
      </main>

      {/* Sticky CTA Button - Only show on step 0 (landing page) */}
      {step === 0 && (
        <motion.div
          initial={{ opacity: 0, y: 100 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 100 }}
          className="fixed bottom-6 right-6 z-50"
        >
          <Button
            onClick={handleGetStarted}
            size="lg"
            className="sunset-gradient text-white shadow-2xl hover:shadow-3xl transition-all duration-300 hover:scale-105 px-4 py-4 md:px-6 md:py-6 rounded-full font-semibold text-sm md:text-base"
          >
            <span>Promote your restaurant now</span>
            <ArrowRight className="ml-2 w-5 h-5" />
          </Button>
        </motion.div>
      )}

      <FooterNext />
    </div>
  );
}

export default function RestaurantsPartnerPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <RestaurantsPartnerPageContent />
    </Suspense>
  );
}

