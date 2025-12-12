"use client";

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Gift, CheckCircle, XCircle, Loader2, Mail, Building2, UtensilsCrossed } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import NavigationNext from '@/components/NavigationNext';
import FooterNext from '@/components/FooterNext';

export default function PartnerInvitePage() {
  const [code, setCode] = useState('');
  const [email, setEmail] = useState('');
  const [operatorName, setOperatorName] = useState('');
  const [tourUrls, setTourUrls] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [codeType, setCodeType] = useState(null); // 'tour_operator' or 'restaurant'
  const [restaurantInfo, setRestaurantInfo] = useState(null); // Restaurant info from code

  // Check code type when code is entered
  const handleCodeCheck = async () => {
    if (!code.trim()) return;

    setLoading(true);
    try {
      const response = await fetch(`/api/partners/invite/check?code=${encodeURIComponent(code.trim().toUpperCase())}`);
      const data = await response.json();

      if (data.type) {
        setCodeType(data.type);
        if (data.type === 'restaurant' && data.restaurant) {
          setRestaurantInfo(data.restaurant);
          setResult({ 
            type: 'info', 
            message: `This code is for: ${data.restaurant.name || data.restaurant.slug}` 
          });
        } else {
          setRestaurantInfo(null);
          setResult({ type: 'info', message: `This code is for ${data.type === 'tour_operator' ? 'Tour Operators' : 'Restaurants'}` });
        }
      } else {
        setCodeType(null);
        setRestaurantInfo(null);
        setResult({ type: 'error', message: data.error || 'Invalid code' });
      }
    } catch (error) {
      setResult({ type: 'error', message: 'Failed to check code' });
    } finally {
      setLoading(false);
    }
  };

  const handleRedeem = async (e) => {
    e.preventDefault();
    setLoading(true);
    setResult(null);

    try {
      const body = {
        code: code.trim().toUpperCase(),
        email: email.trim(),
      };

      if (codeType === 'tour_operator') {
        if (!operatorName.trim()) {
          setResult({ type: 'error', message: 'Operator name is required' });
          setLoading(false);
          return;
        }
        body.operatorName = operatorName.trim();
        
        // Parse tour URLs if provided
        if (tourUrls.trim()) {
          const urls = tourUrls.split('\n').map(url => url.trim()).filter(Boolean);
          body.tourUrls = urls;
          // Extract product IDs from URLs (basic extraction)
          const productIds = urls
            .map(url => {
              const match = url.match(/product\/(\d+[A-Z]?\d*)/i) || url.match(/tours\/(\d+[A-Z]?\d*)/i);
              return match ? match[1] : null;
            })
            .filter(Boolean);
          body.selectedTourIds = productIds;
        }
      } else if (codeType === 'restaurant') {
        // Restaurant info is stored with the code, no need to send it
        // The API will use the stored restaurant info
      }

      const response = await fetch('/api/partners/invite/redeem', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      const data = await response.json();

      if (data.success) {
        setResult({
          type: 'success',
          message: data.message,
          subscription: data.subscription,
        });
        // Clear form
        setCode('');
        setEmail('');
        setOperatorName('');
        setTourUrls('');
        setCodeType(null);
        setRestaurantInfo(null);
      } else {
        // Show more detailed error message
        const errorMsg = data.error || 'Failed to redeem code';
        const details = data.details ? ` (${data.details})` : '';
        setResult({ type: 'error', message: `${errorMsg}${details}` });
      }
    } catch (error) {
      setResult({ type: 'error', message: 'Failed to redeem code. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      <NavigationNext />
      
      <main className="container mx-auto px-4 py-16 md:py-20 max-w-3xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <div className="flex items-center justify-center gap-3 mb-6">
            <Gift className="w-10 h-10 md:w-12 md:h-12 text-purple-600" />
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900">Partner Invite</h1>
          </div>
          <p className="text-xl md:text-2xl text-gray-600">
            Redeem your partner invite code to activate your premium subscription
          </p>
        </motion.div>

        <Card className="shadow-xl border-2 border-purple-200">
          <CardContent className="p-8 md:p-12">
            <form onSubmit={handleRedeem} className="space-y-6">
              {/* Invite Code */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Invite Code *
                </label>
                <div className="flex gap-2">
                  <Input
                    type="text"
                    value={code}
                    onChange={(e) => {
                      setCode(e.target.value);
                      setCodeType(null);
                      setRestaurantInfo(null);
                      setResult(null);
                    }}
                    onBlur={handleCodeCheck}
                    placeholder="Enter your invite code"
                    className="flex-1 uppercase"
                    required
                  />
                  <Button
                    type="button"
                    onClick={handleCodeCheck}
                    disabled={!code.trim() || loading}
                    variant="outline"
                  >
                    Check
                  </Button>
                </div>
              </div>

              {/* Email */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Your Email *
                </label>
                <Input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your@email.com"
                  required
                />
              </div>

              {/* Tour Operator Fields */}
              {codeType === 'tour_operator' && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  className="space-y-4 p-4 bg-purple-50 rounded-lg border border-purple-200"
                >
                  <div className="flex items-center gap-2 mb-4">
                    <Building2 className="w-5 h-5 text-purple-600" />
                    <h3 className="font-semibold text-gray-900">Tour Operator Information</h3>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Operator Name *
                    </label>
                    <Input
                      type="text"
                      value={operatorName}
                      onChange={(e) => setOperatorName(e.target.value)}
                      placeholder="Your tour operator company name"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Tour URLs (Optional)
                    </label>
                    <textarea
                      value={tourUrls}
                      onChange={(e) => setTourUrls(e.target.value)}
                      placeholder="Paste your Viator tour URLs here, one per line&#10;Example: https://www.viator.com/tours/Aruba/product/119085P2"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent min-h-[100px]"
                      rows={4}
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      You can add more tours later from your profile page
                    </p>
                  </div>
                </motion.div>
              )}

              {/* Restaurant Info Display */}
              {codeType === 'restaurant' && restaurantInfo && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  className="space-y-4 p-4 bg-amber-50 rounded-lg border border-amber-200"
                >
                  <div className="flex items-center gap-2 mb-4">
                    <UtensilsCrossed className="w-5 h-5 text-amber-600" />
                    <h3 className="font-semibold text-gray-900">Restaurant Information</h3>
                  </div>
                  
                  <div className="bg-white rounded-lg p-4 border border-amber-200">
                    <p className="text-sm text-gray-600 mb-1">Restaurant</p>
                    <p className="font-semibold text-gray-900 text-lg">
                      {restaurantInfo.name || restaurantInfo.slug}
                    </p>
                    {restaurantInfo.url && (
                      <a 
                        href={restaurantInfo.url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-sm text-amber-600 hover:text-amber-700 mt-2 inline-block"
                      >
                        View restaurant page →
                      </a>
                    )}
                  </div>
                  
                  <p className="text-xs text-gray-600">
                    This code will activate premium features for this restaurant. Just enter your email above to redeem.
                  </p>
                </motion.div>
              )}

              {/* Result Message */}
              {result && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`p-4 rounded-lg ${
                    result.type === 'success'
                      ? 'bg-green-50 border-2 border-green-200'
                      : result.type === 'error'
                      ? 'bg-red-50 border-2 border-red-200'
                      : 'bg-blue-50 border-2 border-blue-200'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    {result.type === 'success' ? (
                      <CheckCircle className="w-6 h-6 text-green-600 flex-shrink-0 mt-0.5" />
                    ) : result.type === 'error' ? (
                      <XCircle className="w-6 h-6 text-red-600 flex-shrink-0 mt-0.5" />
                    ) : (
                      <Gift className="w-6 h-6 text-blue-600 flex-shrink-0 mt-0.5" />
                    )}
                    <div className="flex-1">
                      <p className={`font-medium ${
                        result.type === 'success' ? 'text-green-900' : result.type === 'error' ? 'text-red-900' : 'text-blue-900'
                      }`}>
                        {result.message}
                      </p>
                      {result.subscription && (
                        <div className="mt-3 text-sm text-gray-700">
                          <p>Subscription activated until: {new Date(result.subscription.periodEnd).toLocaleDateString()}</p>
                          {result.subscription.maxTours && (
                            <p>Maximum tours: {result.subscription.maxTours}</p>
                          )}
                          {result.subscription.linkedToAccount && (
                            <p className="text-green-600 font-medium mt-2">
                              ✓ Linked to your account - view in your profile
                            </p>
                          )}
                          {!result.subscription.linkedToAccount && (
                            <p className="text-amber-600 font-medium mt-2">
                              ⚠️ Do not have an account yet? Please create one with the same email address ({email}) to manage your subscription from your profile.
                            </p>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Submit Button */}
              <Button
                type="submit"
                disabled={loading || !code.trim() || !email.trim()}
                className="w-full bg-purple-600 hover:bg-purple-700 text-white"
                size="lg"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    Redeeming...
                  </>
                ) : (
                  <>
                    <Gift className="w-5 h-5 mr-2" />
                    Redeem Invite Code
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Info Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mt-12"
        >
          <Card className="bg-gradient-to-br from-purple-50 to-amber-50 border-2 border-purple-200">
            <CardContent className="p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">How It Works</h2>
              <ol className="space-y-3 text-gray-700">
                <li className="flex gap-3">
                  <span className="font-bold text-purple-600">1.</span>
                  <span>Enter your invite code and email address</span>
                </li>
                <li className="flex gap-3">
                  <span className="font-bold text-purple-600">2.</span>
                  <span>Fill in your operator or restaurant information</span>
                </li>
                <li className="flex gap-3">
                  <span className="font-bold text-purple-600">3.</span>
                  <span>Your premium subscription will be activated immediately</span>
                </li>
                <li className="flex gap-3">
                  <span className="font-bold text-purple-600">4.</span>
                  <span>You'll receive a confirmation email with next steps</span>
                </li>
              </ol>
            </CardContent>
          </Card>
        </motion.div>
      </main>

      <FooterNext />
    </div>
  );
}

