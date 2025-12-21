"use client";

import React, { useState, useEffect, Suspense } from 'react';
import { motion } from 'framer-motion';
import { useRouter, useSearchParams } from 'next/navigation';
import { 
  Crown, 
  CheckCircle2, 
  X, 
  ExternalLink, 
  Loader2,
  ArrowRight,
  Shield,
  Star,
  AlertCircle,
  Check,
  TrendingUp,
  Zap,
  Search,
  CheckCircle,
  Settings
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import NavigationNext from '@/components/NavigationNext';
import FooterNext from '@/components/FooterNext';
import { 
  extractProductIdFromViatorUrl, 
  convertViatorToTopToursUrl,
  extractProductInfoFromTripAdvisorUrl,
  detectUrlType,
  extractProductIdFromTopToursUrl
} from '@/utils/tourOperatorHelpers';
import { toast } from '@/components/ui/use-toast';
import Link from 'next/link';
import { createSupabaseBrowserClient } from '@/lib/supabaseClient';

function TourOperatorsPartnerPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const supabase = createSupabaseBrowserClient();
  const [user, setUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  
  // URL Converter state
  const [viatorUrl, setViatorUrl] = useState('');
  const [converting, setConverting] = useState(false);
  const [convertedUrl, setConvertedUrl] = useState(null);
  const [tourExists, setTourExists] = useState(null);
  const [tourData, setTourData] = useState(null);
  const [selectedToursForBundle, setSelectedToursForBundle] = useState([]);
  
  // Check for success parameter from Stripe redirect
  useEffect(() => {
    const success = searchParams.get('success');
    const sessionId = searchParams.get('session_id');
    
    if (success === 'true' && sessionId) {
      // Payment successful - show confirmation
      setStep(4); // Step 4 is now the confirmation step
      // Clean up URL
      router.replace('/partners/tour-operators', { scroll: false });
    } else if (searchParams.get('canceled') === 'true') {
      // Payment was canceled
      toast({
        title: 'Payment canceled',
        description: 'Your subscription was not completed. You can try again anytime.',
        variant: 'default',
      });
      router.replace('/partners/tour-operators', { scroll: false });
    }
  }, [searchParams, router]);
  
  // Scroll to top when step changes
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [step]);
  
  // Check authentication (non-blocking - just to know if user is logged in)
  useEffect(() => {
    const checkAuth = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
      setAuthLoading(false);
      
      // If user just logged in and we have a saved step, restore it
      if (user) {
        const savedStep = sessionStorage.getItem('tourOperatorStep');
        if (savedStep) {
          const stepNum = parseInt(savedStep, 10);
          if (stepNum >= 1 && stepNum <= 3) {
            setStep(stepNum);
            sessionStorage.removeItem('tourOperatorStep');
          }
        }
      }
    };
    checkAuth();
    
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user || null);
      
      // If user just logged in and we have a saved step, restore it
      if (session?.user) {
        const savedStep = sessionStorage.getItem('tourOperatorStep');
        if (savedStep) {
          const stepNum = parseInt(savedStep, 10);
          if (stepNum >= 1 && stepNum <= 4) {
            setStep(stepNum);
            sessionStorage.removeItem('tourOperatorStep');
          }
        }
      }
    });
    
    return () => {
      subscription?.unsubscribe();
    };
  }, [supabase]);
  
  // Check authentication when trying to proceed to Step 2 (Tour Selection)
  const handleProceedToStep2 = () => {
    if (!user) {
      // Save current step so we can restore it after login
      sessionStorage.setItem('tourOperatorStep', '2');
      toast({
        title: 'Sign in required',
        description: 'Please create an account or sign in to continue.',
        variant: 'default',
      });
      router.push(`/auth?redirect=${encodeURIComponent('/partners/tour-operators')}`);
      return;
    }
    
    setStep(2);
  };
  
  // Check authentication when trying to proceed to Step 3 (Checkout)
  const handleProceedToCheckout = () => {
    if (!user) {
      // Save current step so we can restore it after login
      sessionStorage.setItem('tourOperatorStep', '3');
      toast({
        title: 'Sign in required',
        description: 'Please create an account or sign in to continue.',
        variant: 'default',
      });
      router.push(`/auth?redirect=${encodeURIComponent('/partners/tour-operators')}`);
      return;
    }
    setStep(3);
  };
  
  // Step 1: Package Selection
  const [tourPackage, setTourPackage] = useState('5-tours'); // '5-tours' or '15-tours'
  const [billingCycle, setBillingCycle] = useState('annual'); // 'annual' or 'monthly'
  
  // Get email from authenticated user (we'll use this in the API call)
  const email = user?.email || '';
  
  // Step 3: Tour URLs
  const [tourUrls, setTourUrls] = useState(['']);
  const [verifiedTours, setVerifiedTours] = useState([]);
  const [selectedTours, setSelectedTours] = useState([]);
  
  // Pre-fill tour URLs from bundle selection when moving to step 2
  useEffect(() => {
    if (step === 2 && selectedToursForBundle.length > 0 && tourUrls.length === 1 && tourUrls[0] === '') {
      const urls = selectedToursForBundle.map(t => t.viatorUrl);
      setTourUrls(urls);
    }
  }, [step, selectedToursForBundle]);
  
  // Convert Viator or TripAdvisor URL to TopTours URL
  const handleConvertUrl = async () => {
    if (!viatorUrl.trim()) return;
    
    setConverting(true);
    setConvertedUrl(null);
    setTourExists(null);
    setTourData(null);
    
    try {
      const urlType = detectUrlType(viatorUrl);
      
      if (urlType === 'viator') {
        // Handle Viator URLs
        const productId = extractProductIdFromViatorUrl(viatorUrl);
        
        if (!productId) {
          setTourExists(false);
          setConverting(false);
          return;
        }
        
        // Fetch tour data to get title for slug generation
        const response = await fetch(`/api/internal/tour/${productId}`);
        
        if (!response.ok) {
          setTourExists(false);
          setConverting(false);
          return;
        }
        
        const tour = await response.json();
        
        if (!tour || tour.error) {
          setTourExists(false);
          setConverting(false);
          return;
        }
        
        const toptoursUrl = convertViatorToTopToursUrl(viatorUrl, tour.title || '');
        setConvertedUrl(toptoursUrl);
        setTourExists(true);
        setTourData({
          productId,
          title: tour.title || 'Tour',
          imageUrl: tour.images?.[0]?.variants?.[3]?.url || tour.images?.[0]?.variants?.[0]?.url || null,
          rating: tour.reviews?.combinedAverageRating || tour.reviews?.averageRating || 0,
          reviewCount: tour.reviews?.totalReviews || tour.reviews?.totalReviewCount || 0,
          price: tour.pricing?.summary?.fromPrice || tour.pricing?.fromPrice || 0,
          urlType: 'viator',
          viatorUrl: viatorUrl,
          toptoursUrl: toptoursUrl
        });
      } else if (urlType === 'tripadvisor') {
        // Handle TripAdvisor URLs - we only support Viator
        setTourExists('tripadvisor');
        setTourData({
          urlType: 'tripadvisor'
        });
      } else {
        setTourExists(false);
        setConverting(false);
      }
    } catch (error) {
      console.error('Error converting URL:', error);
      setTourExists(false);
    } finally {
      setConverting(false);
    }
  };
  const [verifying, setVerifying] = useState(false);
  
  // Validation
  const canProceedToStep2 = user; // Just need authentication
  // Check if all selected tours have matching operator names (minimum 2 tours)
  const checkOperatorNamesMatch = () => {
    if (selectedTours.length < 2) return { match: true, message: null };
    
    const selectedTourData = selectedTours
      .map(productId => {
        const verified = verifiedTours.find(v => v?.productId === productId);
        return verified ? verified.operatorName : null;
      })
      .filter(Boolean);
    
    if (selectedTourData.length < 2) return { match: true, message: null };
    
    // Normalize operator names for comparison
    const normalizeName = (name) => name.toLowerCase().trim().replace(/[^\w\s]/g, '');
    const normalizedNames = selectedTourData.map(normalizeName);
    
    // Check if all names are similar (using a simple matching algorithm)
    const firstNormalized = normalizedNames[0];
    let allMatch = true;
    
    for (let i = 1; i < normalizedNames.length; i++) {
      const current = normalizedNames[i];
      // Check if names are similar (one contains the other or they share significant words)
      const words1 = firstNormalized.split(/\s+/).filter(w => w.length > 2);
      const words2 = current.split(/\s+/).filter(w => w.length > 2);
      const commonWords = words1.filter(w => words2.includes(w));
      
      const similarity = commonWords.length / Math.max(words1.length, words2.length);
      
      // If similarity is less than 0.3, they don't match
      if (similarity < 0.3 && !firstNormalized.includes(current) && !current.includes(firstNormalized)) {
        allMatch = false;
        break;
      }
    }
    
    if (!allMatch) {
      const uniqueOperators = [...new Set(selectedTourData)];
      return {
        match: false,
        message: `Operator names don't match. Found: ${uniqueOperators.join(', ')}. All tours must be from the same operator.`
      };
    }
    
    return { match: true, message: null };
  };
  
  const operatorMatchResult = checkOperatorNamesMatch();
  const canProceedToStep3 = selectedTours.length >= 2 && operatorMatchResult.match && (
    (tourPackage === '5-tours' && selectedTours.length <= 5) ||
    (tourPackage === '15-tours' && selectedTours.length <= 15)
  );
  
  // Calculate pricing based on package and billing cycle
  const getPrice = () => {
    if (billingCycle === 'annual') {
      return tourPackage === '5-tours' ? '$4.99' : '$9.99';
    } else {
      return tourPackage === '5-tours' ? '$7.99' : '$12.99';
    }
  };
  
  // Add tour URL input
  const addTourUrlInput = () => {
    if (tourUrls.length < 10) { // Allow up to 10 inputs, but only select 5
      setTourUrls([...tourUrls, '']);
    }
  };
  
  // Remove tour URL input
  const removeTourUrlInput = (index) => {
    const newUrls = tourUrls.filter((_, i) => i !== index);
    setTourUrls(newUrls);
    // Also remove from verified tours if it exists
    const productId = verifiedTours[index]?.productId;
    if (productId) {
      setVerifiedTours(verifiedTours.filter((_, i) => i !== index));
      setSelectedTours(selectedTours.filter(id => id !== productId));
    }
  };
  
  // Update tour URL
  const updateTourUrl = (index, value) => {
    const newUrls = [...tourUrls];
    newUrls[index] = value;
    setTourUrls(newUrls);
    
    // Clear verification for this URL if it exists
    if (verifiedTours[index]) {
      const newVerified = [...verifiedTours];
      newVerified[index] = null;
      setVerifiedTours(newVerified);
    }
  };
  
  // Verify tour URL
  const verifyTourUrl = async (index, url) => {
    if (!url.trim()) return;
    
    setVerifying(true);
    try {
      // Check if it's a TopTours URL or Viator URL
      let productId = null;
      let isTopToursUrl = false;
      
      if (url.includes('toptours.ai') || url.startsWith('/tours/')) {
        // TopTours URL
        productId = extractProductIdFromTopToursUrl(url);
        isTopToursUrl = true;
      } else {
        // Viator URL
        productId = extractProductIdFromViatorUrl(url);
      }
      
      if (!productId) {
        toast({
          title: 'Invalid URL',
          description: 'Could not extract product ID. Please enter a valid Viator or TopTours.ai URL.',
          variant: 'destructive'
        });
        setVerifying(false);
        return;
      }
      
      // Fetch tour data via our API (to keep API key server-side)
      const response = await fetch(`/api/internal/tour/${productId}`);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const errorMessage = errorData.error || 'Tour not found';
        
        // Provide more helpful error message
        if (response.status === 404) {
          toast({
            title: 'Tour not found',
            description: `The tour with ID "${productId}" could not be found. Please verify the URL is correct and the tour exists on Viator.`,
            variant: 'destructive'
          });
        } else {
          toast({
            title: 'Error verifying tour',
            description: errorMessage || 'Failed to fetch tour data. Please try again.',
            variant: 'destructive'
          });
        }
        setVerifying(false);
        return;
      }
      
      const data = await response.json();
      const tourData = data.tour || data;
      
      if (!tourData || !tourData.title) {
        toast({
          title: 'Invalid tour data',
          description: 'The tour data could not be processed. Please try again.',
          variant: 'destructive'
        });
        setVerifying(false);
        return;
      }
      const tourOperator = tourData.supplier?.name || tourData.supplierName || '';
      
      // Convert to TopTours URL (if it's a Viator URL, convert it; if it's already a TopTours URL, use it)
      let toptoursUrl;
      let viatorUrl = null;
      
      if (isTopToursUrl) {
        // Already a TopTours URL, use it as-is (ensure it's a full URL)
        toptoursUrl = url.startsWith('http') ? url : `https://toptours.ai${url}`;
      } else {
        // Viator URL, convert it
        toptoursUrl = convertViatorToTopToursUrl(url, tourData.title || '');
        viatorUrl = url;
      }
      
      const verifiedTour = {
        productId,
        viatorUrl: viatorUrl, // Only store if it was a Viator URL
        toptoursUrl,
        title: tourData.title || tourData.seo?.title || 'Tour',
        operatorName: tourOperator,
        reviewCount: tourData.reviews?.totalReviews || 0,
        rating: tourData.reviews?.combinedAverageRating || 0,
        imageUrl: tourData.images?.[0]?.variants?.[3]?.url || tourData.images?.[0]?.variants?.[0]?.url || null,
      };
      
      // Check if this tour is already verified (prevent duplicates)
      const existingIndex = verifiedTours.findIndex(v => v?.productId === productId);
      const newVerified = [...verifiedTours];
      
      if (existingIndex >= 0 && existingIndex !== index) {
        // Tour already exists at a different index, remove it from there
        newVerified[existingIndex] = null;
      }
      
      newVerified[index] = verifiedTour;
      setVerifiedTours(newVerified);
      
      toast({
        title: 'Tour verified',
        description: 'Tour loaded successfully. Select it to add to your bundle.',
      });
    } catch (error) {
      console.error('Error verifying tour:', error);
      toast({
        title: 'Verification failed',
        description: 'Could not verify tour. Please check the URL and try again.',
        variant: 'destructive'
      });
    } finally {
      setVerifying(false);
    }
  };
  
  // Toggle tour selection
  const toggleTourSelection = (productId) => {
    if (selectedTours.includes(productId)) {
      setSelectedTours(selectedTours.filter(id => id !== productId));
    } else {
      const maxTours = tourPackage === '5-tours' ? 5 : 15;
      if (selectedTours.length >= maxTours) {
        toast({
          title: 'Maximum reached',
          description: `You can select up to ${maxTours} tours with your current package.`,
          variant: 'destructive'
        });
        return;
      }
      setSelectedTours([...selectedTours, productId]);
    }
  };
  
  // Submit subscription
  const handleSubmit = async () => {
    if (!canProceedToStep3) return;
    
    // Check if user is authenticated
    if (!user) {
      toast({
        title: 'Sign in required',
        description: 'Please create an account or sign in to continue.',
        variant: 'default',
      });
      router.push('/auth?redirect=/partners/tour-operators');
      return;
    }
    
    setLoading(true);
    let errorMessage = 'Failed to create subscription. Please try again.';
    
    try {
      const response = await fetch('/api/partners/tour-operators/subscribe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          userId: user.id,
          email: user.email || email,
          tourUrls: tourUrls.filter(url => url.trim()),
          selectedTourIds: selectedTours,
          tourPackage: `${tourPackage === '5-tours' ? '5' : '15'}-tours-${billingCycle}`,
        }),
      });
      
      const responseText = await response.text();
      let data = null;
      
      // Try to parse JSON
      if (responseText) {
        try {
          data = JSON.parse(responseText);
        } catch (e) {
          // Not JSON, use as text
          errorMessage = responseText || `Server error: ${response.status} ${response.statusText}`;
          throw new Error(errorMessage);
        }
      }
      
      // Check if response is OK
      if (!response.ok) {
        // Handle operator name mismatch
        if (data?.error?.includes('Operator names do not match') && data?.details) {
          const details = data.details;
          errorMessage = `${data.error}\n\nTour operator names found:\n${details.tourOperators?.map((name, idx) => `  ${idx + 1}. ${name}`).join('\n') || 'Unknown'}\n\nAll selected tours must be from the same operator to be bundled together.`;
          throw new Error(errorMessage);
        }
        
        // Extract error message from response
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
      
      // Success - check for checkout URL
      if (!data) {
        throw new Error('No data received from server');
      }
      
      if (data.checkoutUrl) {
        window.location.href = data.checkoutUrl;
        return; // Don't set loading to false, we're redirecting
      } else if (data.success) {
        toast({
          title: 'Subscription created',
          description: data.message || 'Your subscription is pending review. We\'ll contact you soon.',
          variant: 'default',
        });
        setStep(5);
        return;
      } else {
        throw new Error('No checkout URL or success message received');
      }
      
    } catch (error) {
      // Use error message from catch or the one we set
      const finalErrorMessage = error?.message || errorMessage || 'An unexpected error occurred';
      
      // Log to console (but not as an object to avoid empty object issue)
      if (finalErrorMessage && finalErrorMessage !== 'Failed to create subscription. Please try again.') {
        console.error('Subscription error:', finalErrorMessage);
      }
      
      // Show toast with error
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
  
  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-50 to-white">
      <NavigationNext />
      
      <main className="container mx-auto px-4 py-16 md:py-20 max-w-4xl">
        {/* Header - Only show on step 1 */}
        {step === 1 && (
          <>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center mb-12"
            >
              <div className="flex items-center justify-center gap-3 mb-6 md:mb-8">
                <Crown className="w-10 h-10 md:w-12 md:h-12 text-amber-500" />
                <h1 className="text-4xl md:text-5xl font-bold text-gray-900">Tour Operator Partner Program</h1>
              </div>
              <p className="text-xl md:text-2xl text-gray-600 max-w-2xl mx-auto">
                Increase visibility and drive more bookings through our affiliate partnership with Viator
              </p>
            </motion.div>

            {/* About Section - Viator Partnership */}
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
                      TopTours.ai operates as an <strong>affiliate partner with Viator</strong>, the world's largest 
                      marketplace for tours and activities. We pull tour data directly from Viator's API, ensuring 
                      you always have the most up-to-date information about your tours.
                    </p>
                    <p>
                      <strong>All bookings are handled directly through Viator</strong> - we do not provide direct 
                      booking links or manage bookings ourselves. When travelers click to book, they're redirected 
                      to Viator where they complete their purchase. This ensures a seamless, trusted booking experience.
                    </p>
                    <p className="bg-purple-50 border-l-4 border-purple-500 p-4 rounded">
                      <strong>Why partner with us?</strong> We help increase visibility and clicks to your Viator 
                      listings through our Premium Operator Program, featuring top placement and premium badges.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </motion.section>

            {/* Two Methods Section */}
            <motion.section
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="mb-12"
            >
              <h2 className="text-3xl font-bold text-gray-900 text-center mb-8">
                Premium Operator Program
              </h2>
              
              <div className="max-w-4xl mx-auto">
                {/* Premium Operator Program */}
                <Card className="shadow-xl border-2 border-amber-200">
                  <CardContent className="p-8">
                    <div className="flex items-center gap-3 mb-6">
                      <div className="w-12 h-12 bg-gradient-to-br from-amber-500 to-orange-500 rounded-xl flex items-center justify-center">
                        <Crown className="w-6 h-6 text-white" />
                      </div>
                      <h3 className="text-2xl font-bold text-gray-900">Premium Operator</h3>
                    </div>
                    
                    <p className="text-gray-700 mb-6">
                      Link your top tours together on all your tour pages for maximum exposure. Build authority 
                      and increase internal linking to drive more clicks to your Viator listings.
                    </p>
                    
                    <div className="bg-amber-50 rounded-lg p-6 mb-6">
                      <h4 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                        <Crown className="w-5 h-5 text-amber-600" />
                        What You Get
                      </h4>
                      <ul className="space-y-3">
                        <li className="flex items-start gap-2">
                          <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                          <span className="text-gray-700"><strong>Up to 15x more visibility</strong> - Show up to 15 of your tours on each tour page, dramatically increasing booking opportunities</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                          <span className="text-gray-700"><strong>Aggregated reviews</strong> - Combined review counts and ratings across all linked tours build trust and credibility</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                          <span className="text-gray-700"><strong>Premium operator badge</strong> - Crown icon and verified badge on all your tours signals quality to travelers</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                          <span className="text-gray-700"><strong>Cross-tour discovery</strong> - When travelers view one tour, they see your other offerings, increasing the chance they find the perfect fit</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                          <span className="text-gray-700"><strong>Enhanced SEO</strong> - Internal linking between your tours improves search rankings and builds domain authority</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                          <span className="text-gray-700 font-semibold"><strong>Higher conversion rates</strong> - More tour options per page means travelers are more likely to find something they want to book</span>
                        </li>
                      </ul>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-white border-2 border-amber-200 rounded-lg p-4 text-center">
                        <div className="text-xs text-gray-500 mb-1">From</div>
                        <div className="text-2xl font-bold text-gray-900">$4.99</div>
                        <div className="text-sm text-gray-600">5 tours</div>
                        <div className="text-xs text-gray-500 mt-1">per month</div>
                      </div>
                      <div className="bg-amber-50 border-2 border-amber-400 rounded-lg p-4 text-center">
                        <div className="text-xs text-gray-500 mb-1">From</div>
                        <div className="text-2xl font-bold text-gray-900">$9.99</div>
                        <div className="text-sm text-gray-600">15 tours</div>
                        <div className="text-xs text-gray-500 mt-1">per month</div>
                        <Badge className="mt-2 bg-green-100 text-green-700 text-xs">Best Value</Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </motion.section>

            {/* URL Converter Tool */}
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
                    <h2 className="text-3xl font-bold text-gray-900">Find Your Tour on TopTours.ai</h2>
                  </div>
                  
                  <p className="text-gray-600 mb-6">
                    Enter your Viator tour URL to see if it's listed on TopTours.ai, view it, and select it to bundle with other tours.
                  </p>
                  
                  <div className="space-y-4">
                    <div className="flex gap-3">
                      <Input
                        value={viatorUrl}
                        onChange={(e) => setViatorUrl(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            handleConvertUrl();
                          }
                        }}
                        placeholder="https://www.viator.com/tours/Rome/Colosseum/d511-132779P2"
                        className="flex-1"
                      />
                      <Button
                        onClick={handleConvertUrl}
                        disabled={converting || !viatorUrl.trim()}
                        className="sunset-gradient text-white"
                      >
                        {converting ? (
                          <>
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            Checking...
                          </>
                        ) : (
                          <>
                            <Search className="w-4 h-4 mr-2" />
                            Find Tour
                          </>
                        )}
                      </Button>
                    </div>
                    
                    {convertedUrl && tourExists === true && tourData && tourData.urlType === 'viator' && (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mt-6 p-6 bg-green-50 border-2 border-green-200 rounded-lg"
                      >
                        <div className="flex items-start gap-3 mb-4">
                          <CheckCircle className="w-6 h-6 text-green-600 flex-shrink-0" />
                          <div className="flex-1">
                            <h3 className="font-bold text-gray-900 mb-2">Tour Found!</h3>
                            <p className="text-sm text-gray-700 mb-4">{tourData.title}</p>
                            <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600 mb-4">
                              {tourData.rating > 0 && (
                                <div className="flex items-center gap-1">
                                  <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
                                  <span className="font-semibold">{tourData.rating.toFixed(1)}</span>
                                  {tourData.reviewCount > 0 && (
                                    <span>({tourData.reviewCount.toLocaleString()} reviews)</span>
                                  )}
                                </div>
                              )}
                              {tourData.price > 0 && (
                                <div className="font-semibold text-orange-600">
                                  From ${tourData.price.toLocaleString()}
                                </div>
                              )}
                            </div>
                            <div className="flex flex-wrap gap-3">
                              <Button
                                asChild
                                variant="outline"
                                className="border-purple-300 text-purple-700 hover:bg-purple-50"
                              >
                                <Link href={convertedUrl} target="_blank">
                                  View on TopTours.ai
                                  <ExternalLink className="w-4 h-4 ml-2" />
                                </Link>
                              </Button>
                              <Button
                                onClick={() => {
                                  const isSelected = selectedToursForBundle.some(t => t.productId === tourData.productId);
                                  if (isSelected) {
                                    setSelectedToursForBundle(prev => prev.filter(t => t.productId !== tourData.productId));
                                    toast({
                                      title: "Tour Removed",
                                      description: "Tour removed from bundle selection",
                                    });
                                  } else {
                                    setSelectedToursForBundle(prev => [...prev, {
                                      productId: tourData.productId,
                                      title: tourData.title,
                                      viatorUrl: tourData.viatorUrl,
                                      toptoursUrl: tourData.toptoursUrl,
                                      imageUrl: tourData.imageUrl
                                    }]);
                                    toast({
                                      title: "Tour Added",
                                      description: "Tour added to bundle selection. It will be pre-filled when you start the signup process.",
                                    });
                                  }
                                }}
                                className={`${
                                  selectedToursForBundle.some(t => t.productId === tourData.productId)
                                    ? 'bg-green-600 hover:bg-green-700 text-white'
                                    : 'bg-purple-600 hover:bg-purple-700 text-white'
                                }`}
                              >
                                {selectedToursForBundle.some(t => t.productId === tourData.productId) ? (
                                  <>
                                    <Check className="w-4 h-4 mr-2" />
                                    Selected for Bundle
                                  </>
                                ) : (
                                  <>
                                    <Crown className="w-4 h-4 mr-2" />
                                    Select to Bundle
                                  </>
                                )}
                              </Button>
                            </div>
                          </div>
                          {tourData.imageUrl && (
                            <div className="w-24 h-24 rounded-lg overflow-hidden flex-shrink-0">
                              <img
                                src={tourData.imageUrl}
                                alt={tourData.title}
                                className="w-full h-full object-cover"
                                onError={(e) => {
                                  e.target.style.display = 'none';
                                }}
                              />
                            </div>
                          )}
                        </div>
                      </motion.div>
                    )}
                    
                    {tourExists === 'tripadvisor' && tourData && (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mt-6 p-6 bg-amber-50 border-2 border-amber-200 rounded-lg"
                      >
                        <div className="flex items-start gap-3 mb-4">
                          <AlertCircle className="w-6 h-6 text-amber-600 flex-shrink-0" />
                          <div className="flex-1">
                            <h3 className="font-bold text-gray-900 mb-2">TripAdvisor URL Detected</h3>
                            <p className="text-sm text-gray-700 mb-4">
                              TopTours.ai only pulls tour data from <strong>Viator</strong>, not TripAdvisor. 
                              To find your tour on TopTours.ai, please provide the <strong>Viator URL</strong> for this tour.
                            </p>
                            <div className="bg-white rounded-lg p-4 mb-4">
                              <p className="text-sm font-semibold text-gray-900 mb-2">What to do:</p>
                              <ol className="text-sm text-gray-700 space-y-2 list-decimal list-inside">
                                <li>Find the same tour listing on Viator (many operators list on both platforms)</li>
                                <li>Copy the Viator URL (should look like: <code className="bg-gray-100 px-1 rounded">viator.com/tours/...</code>)</li>
                                <li>Paste the Viator URL here to check if it's on TopTours.ai</li>
                              </ol>
                            </div>
                            <p className="text-xs text-gray-600">
                              <strong>Note:</strong> If you don't have a Viator listing yet, you'll need to create one first 
                              before you can use our premium operator program.
                            </p>
                          </div>
                        </div>
                      </motion.div>
                    )}
                    
                    {convertedUrl === null && tourExists === false && !converting && (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mt-6 p-4 bg-amber-50 border-2 border-amber-200 rounded-lg flex items-start gap-3"
                      >
                        <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                        <div>
                          <p className="font-semibold text-gray-900 mb-1">Tour Not Found</p>
                          <p className="text-sm text-gray-700">
                            This tour may not be available on TopTours.ai yet, or the URL format is incorrect. 
                            Please check your Viator URL and try again.
                          </p>
                        </div>
                      </motion.div>
                    )}
                  </div>
                  
                  {/* Show selected tours for bundle */}
                  {selectedToursForBundle.length > 0 && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="mt-6 p-4 bg-purple-50 border-2 border-purple-200 rounded-lg"
                    >
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="font-semibold text-gray-900">
                          Selected for Bundle ({selectedToursForBundle.length})
                        </h4>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setSelectedToursForBundle([]);
                            toast({
                              title: "Selection Cleared",
                              description: "All tours removed from bundle selection",
                            });
                          }}
                          className="text-purple-600 hover:text-purple-700"
                        >
                          Clear All
                        </Button>
                      </div>
                      <div className="space-y-2">
                        {selectedToursForBundle.map((tour) => (
                          <div key={tour.productId} className="flex items-center justify-between bg-white p-3 rounded-lg">
                            <div className="flex items-center gap-3 flex-1 min-w-0">
                              {tour.imageUrl && (
                                <img
                                  src={tour.imageUrl}
                                  alt={tour.title}
                                  className="w-12 h-12 rounded object-cover flex-shrink-0"
                                  onError={(e) => {
                                    e.target.style.display = 'none';
                                  }}
                                />
                              )}
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-gray-900 truncate">{tour.title}</p>
                                <p className="text-xs text-gray-500">{tour.productId}</p>
                              </div>
                            </div>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                setSelectedToursForBundle(prev => prev.filter(t => t.productId !== tour.productId));
                                toast({
                                  title: "Tour Removed",
                                  description: "Tour removed from bundle selection",
                                });
                              }}
                              className="text-red-600 hover:text-red-700 ml-2"
                            >
                              <X className="w-4 h-4" />
                            </Button>
                          </div>
                        ))}
                      </div>
                      {selectedToursForBundle.length > 0 && (
                        <p className="text-xs text-gray-600 mt-3">
                          These tours will be pre-filled when you start the signup process.
                        </p>
                      )}
                    </motion.div>
                  )}
                </CardContent>
              </Card>
            </motion.section>
            </>
          )}
          
          {/* Progress Steps */}
          <div className="flex items-center justify-center gap-4 mb-8">
            {[1, 2, 3].map((stepNum) => (
            <React.Fragment key={stepNum}>
              <div className={`flex items-center justify-center w-10 h-10 rounded-full border-2 ${
                step >= stepNum 
                  ? 'bg-purple-600 border-purple-600 text-white' 
                  : 'border-gray-300 text-gray-400'
              }`}>
                {step > stepNum ? (
                  <Check className="w-6 h-6" />
                ) : (
                  <span className="font-semibold">{stepNum}</span>
                )}
              </div>
              {stepNum < 3 && (
                <div className={`w-16 h-1 ${step > stepNum ? 'bg-purple-600' : 'bg-gray-300'}`} />
              )}
            </React.Fragment>
          ))}
          </div>
          
          {/* Step 1: Package Selection */}
          {step === 1 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <Card className="shadow-xl">
              <CardContent className="p-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Choose Your Package</h2>
                
                <div className="mb-8">
                  <label className="block text-sm font-medium text-gray-700 mb-4">Number of Tours</label>
                  <p className="text-sm text-gray-600 mb-4">
                    Select how many tours you want to bundle together. All selected tours will display the premium crown icon, 
                    show aggregated reviews, and link to each other for maximum visibility.
                  </p>
                  <div className="grid md:grid-cols-2 gap-4">
                    <Card 
                      className={`cursor-pointer border-2 transition-all ${
                        tourPackage === '5-tours' 
                          ? 'border-purple-600 bg-purple-50' 
                          : 'border-gray-200'
                      }`}
                      onClick={() => setTourPackage('5-tours')}
                    >
                      <CardContent className="p-6">
                        <div className="flex items-center justify-between mb-3">
                          <h3 className="text-xl font-bold">5 Tours</h3>
                          {tourPackage === '5-tours' && (
                            <CheckCircle2 className="w-6 h-6 text-purple-600" />
                          )}
                        </div>
                        <div className="space-y-2">
                          <p className="text-sm text-gray-700 font-medium">
                            Great for starting out or focusing on your best sellers
                          </p>
                          <ul className="text-xs text-gray-600 space-y-1">
                            <li className="flex items-start gap-2">
                              <CheckCircle2 className="w-3 h-3 text-green-600 flex-shrink-0 mt-0.5" />
                              <span>Bundle your top 5 performing tours</span>
                            </li>
                            <li className="flex items-start gap-2">
                              <CheckCircle2 className="w-3 h-3 text-green-600 flex-shrink-0 mt-0.5" />
                              <span>Perfect for niche or specialized operators</span>
                            </li>
                            <li className="flex items-start gap-2">
                              <CheckCircle2 className="w-3 h-3 text-green-600 flex-shrink-0 mt-0.5" />
                              <span>Lower monthly cost to get started</span>
                            </li>
                          </ul>
                        </div>
                      </CardContent>
                    </Card>
                    
                    <Card 
                      className={`cursor-pointer border-2 transition-all ${
                        tourPackage === '15-tours' 
                          ? 'border-purple-600 bg-purple-50' 
                          : 'border-gray-200'
                      }`}
                      onClick={() => setTourPackage('15-tours')}
                    >
                      <CardContent className="p-6">
                        <div className="flex items-center justify-between mb-3">
                          <h3 className="text-xl font-bold">15 Tours</h3>
                          {tourPackage === '15-tours' && (
                            <CheckCircle2 className="w-6 h-6 text-purple-600" />
                          )}
                        </div>
                        <div className="space-y-2">
                          <p className="text-sm text-gray-700 font-medium">
                            Best for established operators with multiple offerings
                          </p>
                          <ul className="text-xs text-gray-600 space-y-1">
                            <li className="flex items-start gap-2">
                              <CheckCircle2 className="w-3 h-3 text-green-600 flex-shrink-0 mt-0.5" />
                              <span>Bundle up to 15 tours across categories</span>
                            </li>
                            <li className="flex items-start gap-2">
                              <CheckCircle2 className="w-3 h-3 text-green-600 flex-shrink-0 mt-0.5" />
                              <span>Maximum internal linking and SEO benefits</span>
                            </li>
                            <li className="flex items-start gap-2">
                              <CheckCircle2 className="w-3 h-3 text-green-600 flex-shrink-0 mt-0.5" />
                              <span>Better value per tour - only $0.67/tour/month</span>
                            </li>
                          </ul>
                          <Badge className="mt-3 bg-green-100 text-green-700 text-xs font-semibold">Best Value</Badge>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </div>
                
                <div className="mb-8">
                  <label className="block text-sm font-medium text-gray-700 mb-4">Billing Cycle</label>
                  <div className="grid md:grid-cols-2 gap-4">
                    <Card 
                      className={`cursor-pointer border-2 transition-all ${
                        billingCycle === 'annual' 
                          ? 'border-purple-600 bg-purple-50' 
                          : 'border-gray-200'
                      }`}
                      onClick={() => setBillingCycle('annual')}
                    >
                      <CardContent className="p-6">
                        <div className="flex items-center justify-between mb-4">
                          <h3 className="text-xl font-bold">Annual</h3>
                          {billingCycle === 'annual' && (
                            <CheckCircle2 className="w-6 h-6 text-purple-600" />
                          )}
                        </div>
                        <div className="text-3xl font-bold text-gray-900 mb-2">
                          {tourPackage === '5-tours' ? '$4.99' : '$9.99'}
                        </div>
                        <div className="text-sm text-gray-600">per month (billed annually)</div>
                        <Badge className="mt-2 bg-green-100 text-green-700 text-xs">Save 37%</Badge>
                      </CardContent>
                    </Card>
                    
                    <Card 
                      className={`cursor-pointer border-2 transition-all ${
                        billingCycle === 'monthly' 
                          ? 'border-purple-600 bg-purple-50' 
                          : 'border-gray-200'
                      }`}
                      onClick={() => setBillingCycle('monthly')}
                    >
                      <CardContent className="p-6">
                        <div className="flex items-center justify-between mb-4">
                          <h3 className="text-xl font-bold">Monthly</h3>
                          {billingCycle === 'monthly' && (
                            <CheckCircle2 className="w-6 h-6 text-purple-600" />
                          )}
                        </div>
                        <div className="text-3xl font-bold text-gray-900 mb-2">
                          {tourPackage === '5-tours' ? '$7.99' : '$12.99'}
                        </div>
                        <div className="text-sm text-gray-600">per month</div>
                      </CardContent>
                    </Card>
                  </div>
                </div>
                
                <div className="bg-purple-50 border border-purple-200 rounded-lg p-6 mb-8">
                  <h3 className="font-semibold text-gray-900 mb-4">What's Included:</h3>
                  <ul className="space-y-2 text-sm text-gray-700">
                    <li className="flex items-center gap-2">
                      <Crown className="w-4 h-4 text-amber-500" />
                      <span>Crown icon on all linked tours</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Star className="w-4 h-4 text-amber-500" />
                      <span>Aggregated reviews across all tours</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Shield className="w-4 h-4 text-purple-600" />
                      <span>Premium operator badge on tour pages</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <ExternalLink className="w-4 h-4 text-purple-600" />
                      <span>"Other tours from this operator" sidebar section</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <TrendingUp className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
                      <span className="font-semibold">Internal linking between your tours for better SEO and authority</span>
                    </li>
                  </ul>
                </div>
                
                <div className="mt-8 flex justify-end">
                  <Button
                    onClick={handleProceedToStep2}
                    disabled={!canProceedToStep2}
                    className="sunset-gradient text-white disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Continue
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                  {!user && (
                    <p className="text-sm text-gray-600 text-center mt-2">
                      <Link href={`/auth?redirect=${encodeURIComponent('/partners/tour-operators')}`} className="text-purple-600 hover:underline">
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
          
          {/* Step 2: Tour Selection */}
          {step === 2 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <Card className="shadow-xl">
              <CardContent className="p-8">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-gray-900">Select Your Tours</h2>
                  <Badge variant="secondary">
                    {selectedTours.length} / {tourPackage === '5-tours' ? '5' : '15'} selected
                  </Badge>
                </div>
                
                <p className="text-gray-600 mb-6">
                  Add Viator tour URLs or TopTours.ai URLs (minimum 2, up to {tourPackage === '5-tours' ? '5' : '15'} based on your selected package). 
                  All tours must be from the same operator. We'll verify and convert them to TopTours URLs if needed.
                </p>
                
                {operatorMatchResult.message && (
                  <div className="mb-6 p-4 bg-amber-50 border border-amber-200 rounded-lg">
                    <div className="flex items-start gap-2">
                      <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="text-sm font-medium text-amber-800">Operator Name Mismatch</p>
                        <p className="text-sm text-amber-700 mt-1">{operatorMatchResult.message}</p>
                      </div>
                    </div>
                  </div>
                )}
                
                {selectedTours.length >= 2 && operatorMatchResult.match && (
                  <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="w-5 h-5 text-green-600" />
                      <p className="text-sm font-medium text-green-800">
                        All tours are from the same operator. You can proceed.
                      </p>
                    </div>
                  </div>
                )}
                
                <div className="space-y-4 mb-6">
                  {tourUrls.map((url, index) => (
                    <div key={index} className="flex gap-3">
                      <div className="flex-1">
                        <Input
                          value={url}
                          onChange={(e) => updateTourUrl(index, e.target.value)}
                          placeholder="https://www.viator.com/tours/Rome/Colosseum/d511-132779P2 or https://toptours.ai/tours/132779P2"
                          className="w-full"
                        />
                        {verifiedTours[index] && (
                          <div className="mt-2 p-3 bg-green-50 border border-green-200 rounded-lg">
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                  <CheckCircle2 className="w-4 h-4 text-green-600" />
                                  <span className="font-semibold text-sm text-gray-900">
                                    {verifiedTours[index].title}
                                  </span>
                                </div>
                                <div className="text-xs text-gray-600 space-y-1">
                                  <div>TopTours URL: <a href={verifiedTours[index].toptoursUrl} target="_blank" rel="noopener" className="text-purple-600 hover:underline">{verifiedTours[index].toptoursUrl}</a></div>
                                  <div>Operator: {verifiedTours[index].operatorName}</div>
                                </div>
                              </div>
                              <div className="ml-4">
                                <input
                                  type="checkbox"
                                  checked={selectedTours.includes(verifiedTours[index].productId)}
                                  onChange={() => toggleTourSelection(verifiedTours[index].productId)}
                                  className="w-5 h-5 text-purple-600 rounded"
                                />
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                      <div className="flex gap-2">
                        {url.trim() && (
                          <Button
                            onClick={() => verifyTourUrl(index, url)}
                            disabled={verifying}
                            variant="outline"
                            size="sm"
                          >
                            {verifying ? (
                              <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                              'Verify'
                            )}
                          </Button>
                        )}
                        {tourUrls.length > 1 && (
                          <Button
                            onClick={() => removeTourUrlInput(index)}
                            variant="ghost"
                            size="sm"
                          >
                            <X className="w-4 h-4" />
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
                
                {tourUrls.length < 10 && (
                  <Button
                    onClick={addTourUrlInput}
                    variant="outline"
                    className="w-full mb-6"
                  >
                    + Add Another Tour URL
                  </Button>
                )}
                
                <div className="flex justify-between mt-8">
                  <Button
                    onClick={() => setStep(2)}
                    variant="outline"
                  >
                    Back
                  </Button>
                  <Button
                    onClick={handleProceedToCheckout}
                    disabled={!canProceedToStep3 || !operatorMatchResult.match}
                    className="sunset-gradient text-white disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Review & Checkout
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                  {selectedTours.length < 2 && (
                    <p className="text-sm text-gray-600 text-center mt-2">
                      Please select at least 2 tours to continue.
                    </p>
                  )}
                  {selectedTours.length >= 2 && !operatorMatchResult.match && (
                    <p className="text-sm text-amber-600 text-center mt-2 font-medium">
                      {operatorMatchResult.message} The button is disabled until all operator names match.
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          </motion.div>
          )}
          
          {/* Step 3: Checkout/Review */}
          {step === 3 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="space-y-6">
              <div className="text-center mb-6">
                <h3 className="text-xl font-bold text-gray-900 mb-2">Review Your Selection</h3>
                <p className="text-gray-600">Almost there! Review and complete your order.</p>
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
              <div className="bg-gray-50 rounded-xl p-4 space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Plan</span>
                  <span className="font-medium text-gray-900">
                    {tourPackage === '5-tours' ? '5 Tours' : '15 Tours'} - {billingCycle === 'annual' ? 'Yearly' : 'Monthly'} Premium
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Tours Selected</span>
                  <span className="font-medium text-gray-900">{selectedTours.length} tour{selectedTours.length !== 1 ? 's' : ''}</span>
                </div>
                
                <hr className="border-gray-200" />
                
                <div className="flex justify-between items-center text-lg">
                  <span className="font-semibold text-gray-900">Total</span>
                  <div className="text-right">
                    {billingCycle === 'annual' ? (
                      <>
                        <span className="font-bold text-gray-900">
                          ${tourPackage === '5-tours' ? '59.88' : '119.88'}/year
                        </span>
                        <p className="text-xs text-green-600">
                          Only {tourPackage === '5-tours' ? '$4.99' : '$9.99'}/month
                        </p>
                      </>
                    ) : (
                      <span className="font-bold text-gray-900">{getPrice()}/month</span>
                    )}
                  </div>
                </div>
              </div>

              {/* Selected Tours List */}
              {selectedTours.length > 0 && (
                <div className="bg-gray-50 rounded-xl p-4">
                  <h4 className="font-semibold text-gray-900 mb-3">Selected Tours</h4>
                  <div className="space-y-2 max-h-64 overflow-y-auto">
                    {selectedTours.map((productId) => {
                      const verifiedTour = verifiedTours.find(v => v?.productId === productId);
                      if (!verifiedTour) return null;
                      
                      return (
                        <div key={productId} className="flex items-start gap-3 p-2 bg-white rounded-lg border border-gray-200">
                          {verifiedTour.imageUrl && (
                            <img
                              src={verifiedTour.imageUrl}
                              alt={verifiedTour.title}
                              className="w-12 h-12 object-cover rounded flex-shrink-0"
                            />
                          )}
                          <div className="flex-1 min-w-0">
                            <h5 className="text-sm font-medium text-gray-900 truncate">{verifiedTour.title}</h5>
                            <div className="flex items-center gap-2 mt-1 text-xs text-gray-600">
                              {verifiedTour.rating > 0 && (
                                <>
                                  <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                                  <span>{verifiedTour.rating.toFixed(1)}</span>
                                </>
                              )}
                              {verifiedTour.reviewCount > 0 && (
                                <span>({verifiedTour.reviewCount} reviews)</span>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* What you can do after purchase */}
              <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                <p className="text-sm font-medium text-purple-900 mb-2 flex items-center gap-2">
                  <Settings className="w-4 h-4" />
                  After purchase, you can:
                </p>
                <ul className="text-sm text-purple-800 space-y-1">
                  <li>• Manage your tours and subscription in your account</li>
                  <li>• Add or remove tours (up to your plan limit)</li>
                  <li>• Access invoices and billing history</li>
                </ul>
              </div>

              {/* Trust badges */}
              <div className="flex items-center justify-center gap-4 text-xs text-gray-500">
                <span>🔒 Secure checkout via Stripe</span>
                <span>✓ Cancel anytime</span>
              </div>

              {/* Action Buttons */}
              <div className="flex justify-between gap-4 pt-4 border-t">
                <Button
                  onClick={() => setStep(2)}
                  variant="outline"
                  disabled={loading}
                >
                  Back
                </Button>
                <Button
                  onClick={handleSubmit}
                  disabled={loading || !operatorMatchResult.match}
                  className="bg-green-600 hover:bg-green-700 text-white flex-1 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      Continue to Payment
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </>
                  )}
                </Button>
              </div>
              {!operatorMatchResult.match && (
                <p className="text-sm text-amber-600 text-center font-medium">
                  {operatorMatchResult.message} Payment is disabled until all operator names match.
                </p>
              )}
            </div>
          </motion.div>
          )}
          
          {/* Step 4: Confirmation */}
          {step === 4 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <Card className="shadow-xl">
              <CardContent className="p-8 text-center">
                <CheckCircle2 className="w-16 h-16 text-green-600 mx-auto mb-4" />
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Payment Successful!</h2>
                <p className="text-gray-600 mb-6">
                  Your tour operator premium subscription is now active! You can manage your subscription and tours in your account profile.
                </p>
                <div className="flex gap-4 justify-center">
                  <Button
                    onClick={() => router.push('/profile')}
                    variant="outline"
                  >
                    View Profile
                  </Button>
                  <Button
                    onClick={() => router.push('/')}
                    className="sunset-gradient text-white"
                  >
                    Return to Home
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
          )}
      </main>
      
      <FooterNext />
    </div>
  );
}

export default function TourOperatorsPartnerPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-b from-purple-50 to-white flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-purple-600" />
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    }>
      <TourOperatorsPartnerPageContent />
    </Suspense>
  );
}

